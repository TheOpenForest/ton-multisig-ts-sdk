import { TonNetwork } from "../constants/ton";

// functional programming makes me happy
export default class TonApi {
  static BASE_URL = {
    mainnet: "https://tonapi.io/v2",
    testnet: "https://testnet.tonapi.io/v2",
  };

  static REFERER_URL = {
    mainnet: "https://tonviewer.com",
    testnet: "https://testnet.tonviewer.com",
  };

  static async _get(
    network: TonNetwork,
    path: string,
    params: Record<string, string> = {},
    apiKey?: string,
  ): Promise<object> {
    const url = `${this.BASE_URL[network]}/${path}?${new URLSearchParams(params).toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        Referer: this.REFERER_URL[network],
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
    });
    return response.json();
  }

  static async _post(
    network: TonNetwork,
    path: string,
    params: Record<string, object | string | number> = {},
    apiKey?: string,
  ): Promise<object> {
    const url = `${this.BASE_URL[network]}/${path}}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        Referer: this.REFERER_URL[network],
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: JSON.stringify(params),
    });
    return response.json();
  }
}
