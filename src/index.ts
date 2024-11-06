import { Address, beginCell, Cell, storeStateInit, StateInit, contractAddress, TonClient, SendMode, internal, toNano } from "@ton/ton";
import { Action, MultisigConfig, multisigConfigToCell, cellToArray, Multisig, TransferRequest, UpdateRequest } from "./wrappers/Multisig";
import { Params, Op, ORDER_MAX_SEQNO } from "./wrappers/Constants"
import * as MultisigCode from "./compiled/Multisig.compiled.json";

function deployMultisig(config: MultisigConfig) {
    const code = Cell.fromBoc(MultisigCode.hex)[0]
    const data = multisigConfigToCell(config);
    const init: StateInit = { code, data };
    const stateInit = beginCell().store(storeStateInit(init)).endCell();
    const payload = beginCell().storeUint(0, Params.bitsize.op)
        .storeUint(0, Params.bitsize.queryId)
        .endCell()
    const address = contractAddress(0, init)
    return {
        sendToAddress: address,
        stateInit,
        payload
    }
}

function tonTransferAction(tonReceiver: Address, tonAmount: bigint, comment?: string): TransferRequest {
    return {
        type: 'transfer',
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        message: internal({
            to: tonReceiver,
            value: tonAmount,
            body: comment ? beginCell().storeUint(0, 32).storeStringTail(comment).endCell() : Cell.EMPTY
        })
    }
}

function jettonTransferAction(toAddress: Address, jettonAmount: bigint, queryId: number, jettonWalletAddress: Address, responseAddress: Address = toAddress): TransferRequest {
    const body = beginCell()
        .storeUint(Op.jetton.JettonTransfer, 32)       // jetton transfer op code
        .storeUint(queryId, 64)         // query_id:uint64
        .storeCoins(jettonAmount)       // amount:(VarUInteger 16) -  Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
        .storeAddress(toAddress)        // destination:MsgAddress
        .storeAddress(responseAddress)  // response_destination:MsgAddress
        .storeUint(0, 1)                // custom_payload:(Maybe ^Cell)
        .storeCoins(1n)                 // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
        .storeUint(0, 1)                // forward_payload:(Either Cell ^Cell)
        .endCell();

    const msg = internal({
        to: jettonWalletAddress,
        value: toNano("0.05"),
        body: body
    })

    return {
        type: 'transfer',
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        message: msg
    }
}

function changeConfigAction(signers: Address[], proposers: Address[], threshold: number): UpdateRequest {
    return {
        type: 'update',
        threshold,
        signers,
        proposers,
    }
}

interface OrderParams {
    multisigAddress: Address,
    orderSeqno: bigint,
    expirationDate: number,
}
function deployOrder(fromAddress: Address, params: OrderParams, multisigConfig: MultisigConfig, actions: Action[] | Cell) {
    // check if orderSeqno is valid
    if (params.orderSeqno === -1n) {
        params.orderSeqno = ORDER_MAX_SEQNO;
    }

    // check if sender is in signers or proposers
    const addrCmp = (x: Address) => x.equals(fromAddress);
    let addrIdx = multisigConfig.signers.findIndex(addrCmp);
    let isSigner = false; // default assume sender is a proposer
    if (addrIdx >= 0) {
        isSigner = true;
    } else {
        addrIdx = multisigConfig.proposers.findIndex(addrCmp);
        if (addrIdx < 0) {
            throw new Error("Sender is not a signer or proposer");
        }
    }

    // pack actions
    let newActions: Cell | Action[];
    if (actions instanceof Cell) {
        newActions = actions;
    }
    else if (actions.length > 255) {
        newActions = Multisig.packLarge(actions, params.multisigAddress);
    }
    else {
        newActions = Multisig.packOrder(actions);
    }

    return {
        sendToAddress: params.multisigAddress,
        payload: Multisig.newOrderMessage(newActions, params.expirationDate, isSigner, addrIdx, params.orderSeqno)
    }
}

function approveOrder(fromAddress: Address, signers: Address[], queryId: number = 0) {
    const addrCmp = (x: Address) => x.equals(fromAddress);
    let addrIdx = signers.findIndex(addrCmp);
    if (addrIdx < 0) {
        throw new Error("Sender is not a signer");
    }

    const body = beginCell()
        .storeUint(Op.order.approve, Params.bitsize.op)
        .storeUint(queryId, Params.bitsize.queryId)
        .storeUint(addrIdx, Params.bitsize.signerIndex)
        .endCell()

    return {
        payload: body
    }
}

async function getMultisigConfig(provider: TonClient, multisigAddress: Address) {
    const { stack } = await provider.runMethod(multisigAddress, "get_multisig_data", []);
    const nextOrderSeqno = stack.readBigNumber();
    const threshold = stack.readBigNumber();
    const signers = cellToArray(stack.readCellOpt());
    const proposers = cellToArray(stack.readCellOpt());
    return { nextOrderSeqno, threshold, signers, proposers };
}

async function getOrderAddressBySeqno(provider: TonClient, multisigAddress: Address, orderSeqno: number) {
    let bnOrderSeqno = BigInt(orderSeqno);
    if (orderSeqno === -1) {
        bnOrderSeqno = ORDER_MAX_SEQNO;
    }
    const { stack } = await provider.runMethod(multisigAddress, "get_order_address", [{ type: "int", value: bnOrderSeqno },]);
    return stack.readAddress();
}

async function getOrderConfig(provider: TonClient, orderAddress: Address) {
    const { stack } = await provider.runMethod(orderAddress, "get_order_data", []);
    const multisig = stack.readAddress();
    const order_seqno = stack.readBigNumber();
    const threshold = stack.readNumberOpt();
    const executed = stack.readBooleanOpt();
    const signers = cellToArray(stack.readCellOpt());
    const approvals = stack.readBigNumberOpt();
    const approvals_num = stack.readNumberOpt();
    const expiration_date = stack.readBigNumberOpt();
    const order = stack.readCellOpt();
    let approvalsArray: Array<boolean>;
    if (approvals !== null) {
        approvalsArray = Array(256);
        for (let i = 0; i < 256; i++) {
            approvalsArray[i] = Boolean((1n << BigInt(i)) & approvals);
        }
    }
    else {
        approvalsArray = [];
    }
    return {
        inited: threshold !== null, multisig, order_seqno, threshold, executed, signers,
        approvals: approvalsArray, approvals_num: approvals_num, _approvals: approvals, expiration_date, order
    };
}

export {
    type MultisigConfig,
    type OrderParams,
    type TransferRequest,
    type UpdateRequest,
    type Action,

    deployMultisig,
    deployOrder,
    approveOrder,

    getMultisigConfig,
    getOrderAddressBySeqno,
    getOrderConfig,

    tonTransferAction,
    jettonTransferAction,
    changeConfigAction
}