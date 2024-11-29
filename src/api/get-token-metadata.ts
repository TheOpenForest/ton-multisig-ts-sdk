import {
  ContractAddress,
  GetTokenMetadataResponse,
  TokenMetadata,
} from "../interfaces/api";
import { TonNetwork } from "../constants/ton";
import TonApi from "./base";

export default async function getTokenMetadata(
  tokenAddresses: string[],
  network: TonNetwork = TonNetwork.testnet,
): Promise<GetTokenMetadataResponse> {
  try {
    const response = await TonApi._post(
      network,
      `jettons/_bulk`,
      {
        account_ids: tokenAddresses,
      },
      process.env.TONAPI_API_KEY,
    );

    if (!response["jettons"]) {
      return {
        success: true,
        data: {
          items: {},
        },
      };
    }

    const notFoundAddresses: Set<string> = new Set(tokenAddresses);
    const items: {
      [minter_address: ContractAddress]: TokenMetadata | null;
    } = {};
    for (const jettonInfo of response["jettons"]) {
      const item: TokenMetadata = {
        minter_address: jettonInfo.metadata.address,
        name: jettonInfo.metadata.name,
        symbol: jettonInfo.metadata.symbol,
        decimals: jettonInfo.metadata.decimals,
        image: jettonInfo.metadata.image,
      };
      notFoundAddresses.delete(jettonInfo.metadata.address);
      items[jettonInfo.metadata.address] = item;
    }

    for (const address of notFoundAddresses) {
      items[address] = null;
    }

    return {
      success: true,
      data: {
        items,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "500",
        message: `Internal server error: ${error?.message || error}`,
      },
    };
  }
}

/*
{
  "success": true,
  "data": {
    "items": {
      "0:8888888888888888888888888888888888888888888888888888888888888888": {
        "wallet_address": "0:9999999999999999999999999999999999999999999999999999999999999999",
        "minter_address": "0:8888888888888888888888888888888888888888888888888888888888888888",
        "name": "Example Token",
        "symbol": "EXT",
        "decimals": 9,
        "image": "<https://example.com/token-icon.png>"
      },
      "0:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb": null
    }
  }
}
*/

/*
{
      "mintable": true,
      "total_supply": "5887105890579978",
      "admin": {
        "address": "0:10C1073837B93FDAAD594284CE8B8EFF7B9CF25427440EB2FC682762E1471365",
        "name": "Ton foundation",
        "is_scam": true,
        "icon": "https://ton.org/logo.png",
        "is_wallet": true
      },
      "metadata": {
        "address": "0:0BB5A9F69043EEBDDA5AD2E946EB953242BD8F603FE795D90698CEEC6BFC60A0",
        "name": "Wrapped TON",
        "symbol": "WTON",
        "decimals": "9",
        "image": "https://cache.tonapi.io/images/jetton.jpg",
        "description": "Wrapped Toncoin",
        "social": [
          [
            "https://t.me/durov_coin",
            "https://twitter.com/durov_coin"
          ]
        ],
        "websites": [
          [
            "https://durov.coin",
            "ton://durov-coin.ton"
          ]
        ],
        "catalogs": [
          [
            "https://coinmarketcap.com/currencies/drv/",
            "https://www.coingecko.com/en/coins/durov"
          ]
        ],
        "custom_payload_api_uri": "https://claim-api.tonapi.io/jettons/TESTMINT"
      },
      "verification": "whitelist",
      "holders_count": 2000
    }
*/
