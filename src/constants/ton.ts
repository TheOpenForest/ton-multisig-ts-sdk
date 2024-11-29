import { Op, Params, ORDER_MAX_SEQNO } from "../contract/wrappers/Constants";
import {
  MultisigContractVersion,
  OrderContractVersion,
} from "../interfaces/api";

enum TonNetwork {
  mainnet = "mainnet",
  testnet = "testnet",
}

enum ContractType {
  MULTISIG_V2 = MultisigContractVersion.MULTISIG_V2,
  ORDER_V2 = OrderContractVersion.ORDER_V2,
}

export { Op, Params, ORDER_MAX_SEQNO, TonNetwork, ContractType };
