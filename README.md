# ton-multisig-ts-sdk

## Introduction

TON Multisig contracts interaction SDK in Tyepscript

**Note: This SDK is in beta and is not ready for production**

### Features

- [ ] Multisig V1
- [x] Multisig V2
- [ ] Multisig V2r2

## Installing

```
npm install ton-multisig-ts-sdk
```

## Examples

### Deploy Multisig V2

```typescript
import { deployMultisig, type MultisigConfig } from 'ton-multisig-ts-sdk';
import { Address, toNano } from "@ton/ton";

// step 1: create multisig config
const multisigConfig: MultisigConfig = {
    threshold: 2;
    signers: [
      Address.parse("EQBAJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA"),
      Address.parse("EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aB"),
      Address.parse("EQBCJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aC")
    ];
    proposers: [];
    allowArbitrarySeqno: false;
}

// step 2: create multisig contract deploy payloads
const multisigContractPayload = deployMultisig(multisigConfig);


// step 3: deploy multisig contract
if (!connector.connected) {
    alert('Please connect wallet to send the transaction!');
}

const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    messages: [
        {
            address: multisigContractPayload.sendToAddress.toString(),
            amount: toNano("0.002"),
            stateInit: multisigContractPayload.stateInit.toBoc().toString('base64'),
            payload: multisigContractPayload.payload.toBoc().toString('base64')
        },
    ]
}

try {
    const result = await connector.sendTransaction(transaction);

    // TODO: verify the result here

} catch (e) {
    if (e instanceof UserRejectedError) {
        alert('You rejected the transaction. Please confirm it to send to the blockchain');
    } else {
        alert('Unknown error happened', e);
    }
}
```

### Create New Order

#### ton transfer

```typescript
import {
  deployOrder,
  getMultisigConfig,
  tonTransferAction,
  type MultisigConfig,
  type OrderParams,
  type Action,
} from "ton-multisig-ts-sdk";
import { Address, toNano, TonClient } from "@ton/ton";

// step 1: initialize tonclient
const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: "your-api-key", // Optional, but note that without api-key you need to send requests once per second, and with 0.25 seconds
});

// step 2: fetch multisig config
const multisigAddress = Address.parse(
  "EQBAJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
);
const { nextOrderSeqno, threshold, signers, proposers } = getMultisigConfig(
  client,
  multisigAddress,
);
const multisigConfig: MultisigConfig = {
  threshold,
  signers,
  proposers,
  allowArbitrarySeqno: nextOrderSeqno === -1,
};

// step 3: create action (ton transfer)
const action: Action = tonTransferAction(
  Address.parse("EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aB"),
  toNano("0.002"),
);

// step 4: create order params
const orderParams: OrderParams = {
  multisigAddress: multisigAddress,
  orderSeqno: nextOrderSeqno,
  expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expires in 24 hours
};

// step 5: create multisig contract deploy payloads
const senderAddress = Address.parse(connector.wallet.account.address);
const orderContractPayload = deployOrder(
  senderAddress,
  orderParams,
  multisigConfig,
  [action],
);

// step 6: deploy multisig contract
if (!connector.connected) {
  alert("Please connect wallet to send the transaction!");
}

const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
  messages: [
    {
      address: orderContractPayload.sendToAddress.toString(),
      amount: toNano("0.02"),
      payload: orderContractPayload.payload.toBoc().toString("base64"),
    },
  ],
};

try {
  const result = await connector.sendTransaction(transaction);

  // TODO: verify the result here
} catch (e) {
  if (e instanceof UserRejectedError) {
    alert(
      "You rejected the transaction. Please confirm it to send to the blockchain",
    );
  } else {
    alert("Unknown error happened", e);
  }
}
```

#### jetton transfer

```typescript
import {
  deployOrder,
  getMultisigConfig,
  jettonTransferAction,
  type MultisigConfig,
  type OrderParams,
  type Action,
} from "ton-multisig-ts-sdk";
import { Address, toNano, TonClient } from "@ton/ton";

// step 1: initialize tonclient
const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: "your-api-key", // Optional, but note that without api-key you need to send requests once per second, and with 0.25 seconds
});

// step 2: fetch multisig config
const multisigAddress = Address.parse(
  "EQBAJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
);
const { nextOrderSeqno, threshold, signers, proposers } = getMultisigConfig(
  client,
  multisigAddress,
);
const multisigConfig: MultisigConfig = {
  threshold,
  signers,
  proposers,
  allowArbitrarySeqno: nextOrderSeqno === -1,
};

// step 3: create action (jetton transfer)
const toAddress = Address.parse(
  "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aB",
);
const jettonAmount = BigInt(1000000000);
const queryId = 1234;
const jettonWalletAddress = Address.parse(
  "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aC",
); // WARNING: jetton wallet is hard to get, you need to get it from jetton master contract or fetch it from json-rpc api
const action: Action = jettonTransferAction(
  toAddress,
  jettonAmount,
  queryId,
  jettonWalletAddress,
);

// step 4: create order params
const orderParams: OrderParams = {
  multisigAddress: multisigAddress,
  orderSeqno: nextOrderSeqno,
  expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expires in 24 hours
};

// step 5: create multisig contract deploy payloads
const senderAddress = Address.parse(connector.wallet.account.address);
const orderContractPayload = deployOrder(
  senderAddress,
  orderParams,
  multisigConfig,
  [action],
);

// step 6: deploy multisig contract
if (!connector.connected) {
  alert("Please connect wallet to send the transaction!");
}

const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
  messages: [
    {
      address: orderContractPayload.sendToAddress.toString(),
      amount: toNano("0.02"),
      payload: orderContractPayload.payload.toBoc().toString("base64"),
    },
  ],
};

try {
  const result = await connector.sendTransaction(transaction);

  // TODO: verify the result here
} catch (e) {
  if (e instanceof UserRejectedError) {
    alert(
      "You rejected the transaction. Please confirm it to send to the blockchain",
    );
  } else {
    alert("Unknown error happened", e);
  }
}
```

#### change config

```typescript
import {
  deployOrder,
  getMultisigConfig,
  changeConfigAction,
  type MultisigConfig,
  type OrderParams,
  type Action,
} from "ton-multisig-ts-sdk";
import { Address, toNano, TonClient } from "@ton/ton";

// step 1: initialize tonclient
const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: "your-api-key", // Optional, but note that without api-key you need to send requests once per second, and with 0.25 seconds
});

// step 2: fetch multisig config
const multisigAddress = Address.parse(
  "EQBAJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
);
const { nextOrderSeqno, threshold, signers, proposers } = getMultisigConfig(
  client,
  multisigAddress,
);
const multisigConfig: MultisigConfig = {
  threshold,
  signers,
  proposers,
  allowArbitrarySeqno: nextOrderSeqno === -1,
};

// step 3: create action (change signers)
const action: Action = changeConfigAction(
  [
    ...signers,
    Address.parse("EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aB"),
  ],
  proposers,
  threshold,
);

// step 4: create order params
const orderParams: OrderParams = {
  multisigAddress: multisigAddress.toString(),
  orderSeqno: nextOrderSeqno,
  expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expires in 24 hours
};

// step 5: create multisig contract deploy payloads
const senderAddress = Address.parse(connector.wallet.account.address);
const orderContractPayload = deployOrder(
  senderAddress,
  orderParams,
  multisigConfig,
  [action],
);

// step 6: deploy multisig contract
if (!connector.connected) {
  alert("Please connect wallet to send the transaction!");
}

const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
  messages: [
    {
      address: orderContractPayload.sendToAddress.toString(),
      amount: toNano("0.02"),
      payload: orderContractPayload.payload.toBoc().toString("base64"),
    },
  ],
};

try {
  const result = await connector.sendTransaction(transaction);

  // TODO: verify the result here
} catch (e) {
  if (e instanceof UserRejectedError) {
    alert(
      "You rejected the transaction. Please confirm it to send to the blockchain",
    );
  } else {
    alert("Unknown error happened", e);
  }
}
```

### Send Approve

```typescript
import { approveOrder, getOrderConfig } from "ton-multisig-ts-sdk";
import { Address, toNano, TonClient } from "@ton/ton";

// step 1: get order config
const orderAddress = Address.parse(
  "EQBAJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
);
const orderConfig = getOrderConfig(client, orderAddress);

// step 2: create approve payloads
const senderAddress = Address.parse(connector.wallet.account.address);
const approvePayload = approveOrder(senderAddress, orderConfig.signers);

// step 3: deploy multisig contract
if (!connector.connected) {
  alert("Please connect wallet to send the transaction!");
}

const transaction = {
  validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
  messages: [
    {
      address: orderAddress.toString(),
      amount: toNano("0.002"),
      payload: approvePayload.payload.toBoc().toString("base64"),
    },
  ],
};

try {
  const result = await connector.sendTransaction(transaction);

  // TODO: verify the result here
} catch (e) {
  if (e instanceof UserRejectedError) {
    alert(
      "You rejected the transaction. Please confirm it to send to the blockchain",
    );
  } else {
    alert("Unknown error happened", e);
  }
}
```

## Contributing

Note this is only for developers who want to contribute code to the SDK

### Clone the Repository

```
git clone https://github.com/thewildanimal/ton-multisig-ts-sdk
```

### Building

```
npm run build
```

### Testing

```
npm test
```
