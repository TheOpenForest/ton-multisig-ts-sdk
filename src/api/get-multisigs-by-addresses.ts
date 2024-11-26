/*
    address: ContractAddress; // Multisig contract address
    version: MultisigContractVersion; // Multisig contract version
    next_order_seqno: number; // Next available sequence number for new orders
    threshold: number; // Required signatures to execute an order
    signers: string[]; // List of wallet addresses authorized to sign orders
    is_valid: boolean; // Indicates if the multisig is valid for the requesting user
    */

/*
{
  "address": "0:1e0390dae5c10426096e05d5350222ab20c8255be7819b5da1d94903bbdfe202",
  "seqno": 1,
  "threshold": 2,
  "signers": [
    "0:eb0b617e4b4f2cb3b7736801cf892111ca73204409e0a230653711ada15e816a",
    "0:6eef3bd168e43d3f48a6dbcec3187ad7fe496ea5d7972c6fac3e7f0006f486fd"
  ],
  "proposers": [],
  "orders": [
    {
      "address": "0:06ffd1c9efe3116f46100d379e245099f200a58390a73ca21096a553d14778f1",
      "order_seqno": 0,
      "threshold": 2,
      "sent_for_execution": false,
      "signers": [
        "0:eb0b617e4b4f2cb3b7736801cf892111ca73204409e0a230653711ada15e816a",
        "0:6eef3bd168e43d3f48a6dbcec3187ad7fe496ea5d7972c6fac3e7f0006f486fd"
      ],
      "approvals_num": 1,
      "expiration_date": 1732339778,
      "risk": {
        "transfer_all_remaining_balance": false,
        "ton": 10000000,
        "jettons": [],
        "nfts": []
      },
      "creation_date": 1732253396,
      "signed_by": []
    }
  ]
}
*/

import {
  BaseMultisigInfo,
  GetMultisigsResponse,
  MultisigContractVersion,
} from "../interfaces/api";
import { TonNetwork } from "../constants/ton";
import TonApi from "./base";

export default async function getMultisigsByAddresses(
  multisigAddresses: string[],
  network: TonNetwork = TonNetwork.testnet,
): Promise<GetMultisigsResponse> {
  const mappings: { [key: string]: BaseMultisigInfo | null } = {};

  for (const multisigAddress of multisigAddresses) {
    try {
      const response = await TonApi._get(
        network,
        `multisig/${multisigAddress}`,
        {},
        process.env.TONAPI_API_KEY,
      );
      if (!response) {
        mappings[multisigAddress] = null;
        continue;
      }

      const multisigInfo: BaseMultisigInfo = {
        address: response["address"],
        version: MultisigContractVersion.MULTISIG_V2,
        next_order_seqno: response["seqno"],
        threshold: response["threshold"],
        signers: response["signers"],
      };

      mappings[multisigAddress] = multisigInfo;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    success: true,
    data: mappings,
  };
}
