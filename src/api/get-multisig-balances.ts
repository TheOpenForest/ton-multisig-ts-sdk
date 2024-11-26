import { MultisigBalancesResponse, TokenBalance } from "../interfaces/api";
import { TonNetwork } from "../constants/ton";
import TonApi from "./base";

export default async function getMultisigBalances(
  multisigAddress: string,
  currency: string = "usd",
  network: TonNetwork = TonNetwork.testnet,
): Promise<MultisigBalancesResponse> {
  try {
    const response1 = await TonApi._get(
      network,
      `accounts/${multisigAddress}`,
      {},
      process.env.TONAPI_API_KEY,
    );
    const tonBalance = response1["balance"];

    const response2 = await TonApi._get(
      network,
      `accounts/${multisigAddress}/jettons`,
      { currencies: currency },
      process.env.TONAPI_API_KEY,
    );

    const items: TokenBalance[] = [
      {
        amount: tonBalance,
        price: "0", // TON price not provided in this endpoint
        minter_address: null, // null indicates native TON
        wallet_address: multisigAddress,
      },
    ];

    // Add jetton balances
    if (response2["balances"]) {
      for (const balance of response2["balances"]) {
        items.push({
          amount: balance.balance,
          price: balance.price?.[currency]?.toString() || "0",
          minter_address: balance.jetton.address,
          wallet_address: balance.wallet_address.address,
        });
      }
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
