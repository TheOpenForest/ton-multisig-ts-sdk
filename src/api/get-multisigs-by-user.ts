import {
  GetMultisigsByUserResponse,
  MultisigContractVersion,
  UserMultisigInfo,
} from "../interfaces/api";
import { TonNetwork } from "../constants/ton";
import TonApi from "./base";

export default async function getMultisigsByUser(
  userAddress: string,
  network: TonNetwork = TonNetwork.testnet,
): Promise<GetMultisigsByUserResponse> {
  try {
    const response = await TonApi._get(
      network,
      `accounts/${userAddress}/multisigs`,
      {},
      process.env.TONAPI_API_KEY,
    );
    if (!response.multisigs) {
      return {
        success: true,
        data: {
          items: [],
          total: 0,
        },
      };
    }

    const items: UserMultisigInfo[] = [];
    for (const multisig of response.multisigs) {
      const item: UserMultisigInfo = {
        address: multisig.address,
        version: MultisigContractVersion.MULTISIG_V2,
        next_order_seqno: multisig.seqno,
        threshold: multisig.threshold,
        signers: multisig.signers,
        is_valid: true,
      };
      items.push(item);
    }

    return {
      success: true,
      data: {
        items,
        total: items.length,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: {
        code: "500",
        message: "Internal server error",
      },
    };
  }
}
