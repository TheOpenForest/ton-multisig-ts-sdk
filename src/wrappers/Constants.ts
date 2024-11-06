export abstract class Op {
    static readonly multisig = {
        new_order: 0xf718510f,
        execute: 0x75097f5d,
        execute_internal: 0xa32c59bf
    }
    static readonly order = {
        approve: 0xa762230f,
        expired: 0x6,
        approve_rejected: 0xafaf283e,
        approved: 0x82609bf6,
        init: 0x9c73fba2
    }
    static readonly actions = {
        send_message: 0xf1381e5b,
        update_multisig_params: 0x1d0cfbd3,
    }
    static readonly jetton = {
        // to Wallet
        JettonTransfer: 0x0f8a7ea5,
        JettonCallTo: 0x235caf52,

        // to Jetton Wallet
        JettonInternalTransfer: 0x178d4519,
        JettonNotify: 0x7362d09c,
        JettonBurn: 0x595f07bc,
        JettonBurnNotification: 0x7bdd97de,
        JettonSetStatus: 0xeed236d3,

        // to Jetton Master
        JettonMint: 0x642b7d07,
        JettonChangeAdmin: 0x6501f354,
        JettonClaimAdmin: 0xfb88e119,
        JettonDropAdmin: 0x7431f221,
        JettonChangeMetadata: 0xcb862902,
        JettonUpgrade: 0x2508d66a
    }
    static readonly nft = {
        NftTransfer: 0x5fcc3d14
    }
}

export abstract class Errors {
    static readonly multisig = {
        unauthorized_new_order: 1007,
        invalid_new_order: 1008,
        not_enough_ton: 100,
        unauthorized_execute: 101,
        singers_outdated: 102,
        invalid_dictionary_sequence: 103,
        expired: 111
    }
    static readonly order = {
        unauthorized_init: 104,
        already_approved: 107,
        already_inited: 105,
        unauthorized_sign: 106,
        expired: 111,
        unknown_op: 0xffff,
        already_executed: 112
    }
};

export abstract class Params {
    static readonly bitsize = {
        op: 32,
        queryId: 64,
        orderSeqno: 256,
        signerIndex: 8,
        actionIndex: 8,
        time: 48
    }
}

export const ORDER_MAX_SEQNO = 115792089237316195423570985008687907853269984665640564039457584007913129639935n
