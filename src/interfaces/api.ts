// api response
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// enums
export const enum MultisigContractVersion {
  MULTISIG_V2 = "MULTISIG_V2",
}

export const enum OrderContractVersion {
  ORDER_V2 = "ORDER_V2",
}

// ton primitives
/**
 * TON contract address in lowercase raw format
 * Example: "0:fc1b8fb1253ab924394b95703e5d7f40fac27bcd2ada3471322c5e68056c5bfb"
 * Format: "0:" followed by 64 lowercase hexadecimal characters
 */
export type ContractAddress = string;

/**
 * Token amount in minimal units (nanoton for TON), as stringified bigint
 * Example: "1000000000" (1 TON = 10^9 nanotons)
 * Range: "0" to "2^256-1"
 */
export type TokenAmount = string;

// token metatdata
export type TokenMetadata = {
  // wallet_address: ContractAddress; // Jetton wallet contract address
  minter_address: ContractAddress; // Jetton minter contract address
  name: string; // Full name of the token
  symbol: string; // Short trading symbol for the token
  decimals: number; // Number of decimal places for token amount
  image: string; // URL to token's icon image
};

//Get Multisigs by User response
export type BaseMultisigInfo = {
  address: ContractAddress; // Multisig contract address
  version: MultisigContractVersion; // Multisig contract version
  next_order_seqno: number; // Next available sequence number for new orders
  threshold: number; // Required signatures to execute an order
  signers: string[]; // List of wallet addresses authorized to sign orders
};

export type UserMultisigInfo = BaseMultisigInfo & {
  is_valid: boolean; // Indicates if the multisig is valid for the requesting user
};

export type GetMultisigsByUserResponse = ApiResponse<{
  items: UserMultisigInfo[];
  total: number;
}>;

// Get Multisigs by Addresses response
export type GetMultisigsResponse = ApiResponse<{
  // Multisig info for given address, or null if not found
  [multisig_address: ContractAddress]: BaseMultisigInfo | null;
}>;

// Get Token Metadata response
export type GetTokenMetadataResponse = ApiResponse<{
  items: {
    // Token metadata for given minter address, or null if not found
    [minter_address: ContractAddress]: TokenMetadata | null;
  };
}>;

// Get Multisig Balances request
export type Request = {
  multisig_address: string;
  currency?: string;
};

// Get Multisig Balances response
export type TokenBalance = {
  amount: TokenAmount; // Balance amount in minimal units
  price: string; // Current token price in USD, or 0 if unavailable
  minter_address: string | null; // Jetton minter contract address, or null for native TON, used as a key to lookup token metadata
  wallet_address: string; // Jetton wallet address
};

export type MultisigBalancesResponse = ApiResponse<{
  items: TokenBalance[];
  total: number;
}>;

// List Pending User Multisig Orders reponse
export const enum OrderActionType {
  TRANSFER_TON = "TRANSFER_TON", // Transfers TON from multisig
  TRANSFER_JETTON = "TRANSFER_JETTON", // Transfers Jetton tokens from multisig
  UPDATE_PARAMS = "UPDATE_PARAMS", // Updates multisig's configuration
  UNKNOWN = "UNKNOWN", // Represents an unknown or unsupported action type
}

export interface BaseOrderAction {
  type: OrderActionType;
}

export interface TransferTonAction extends BaseOrderAction {
  type: OrderActionType.TRANSFER_TON;
  destination: ContractAddress; // Recipient wallet address
  amount: TokenAmount; // Amount of tokens to transfer in minimal units
}

export interface TransferJettonAction extends BaseOrderAction {
  type: OrderActionType.TRANSFER_JETTON;
  destination: ContractAddress; // Recipient wallet address
  amount: TokenAmount; // Amount of tokens to transfer in minimal units
  minter_address: string; // Jetton minter contract address, used as a key to lookup token metadata
}

export interface UpdateParamsAction extends BaseOrderAction {
  type: OrderActionType.UPDATE_PARAMS;
  prev_threshold: number; // Previous required signatures to execute an order
  prev_signers: string[]; // Previous list of wallet addresses authorized to sign orders
  updated_threshold: number; // Updated required signatures to execute an order
  updated_signers: string[]; // Updated list of wallet addresses authorized to sign orders
}

export interface UnknownAction extends BaseOrderAction {
  type: OrderActionType.UNKNOWN;
}

// Discriminator: type
export type OrderAction =
  | TransferTonAction
  | TransferJettonAction
  | UpdateParamsAction
  | UnknownAction;

export type BaseMultisigOrder = {
  address: ContractAddress; // Order contract address
  version: OrderContractVersion; // Order contract version
  multisig_address: string; // Parent multisig contract address
  seqno: number; // Order sequence number
  threshold: number; // Required signatures to execute an order
  collected_signatures: number; // Current count of collected signatures
  signers: {
    address: ContractAddress; // Signer wallet address
    signed_at: number | null; // Unix timestamp in seconds when signed, null if not signed
  }[];
  expires_at: number; // Expiration time as unix timestamp in seconds
  created_at: number; // Creation time as unix timestamp in seconds
  actions: OrderAction[]; // List of actions to execute
  is_executed: boolean; // Indicates if the order has been executed
  is_failed: boolean; // Indicates if the order has failed during execution
};

export type UserMultisigOrder = BaseMultisigOrder & {
  is_valid: boolean; // Indicates if the order is valid for the requesting user
};

export type GetUserMultisigOrdersResponse = ApiResponse<{
  items: UserMultisigOrder[];
  total: number;
}>;

// Get Multisig History response
// The `MultisigOrder` type definition is referenced in the `Get Multisig Orders by User Address` section

export const enum MultisigEventType {
  DEPLOY = "DEPLOY", // Init deployment of multisig
  EXECUTE = "EXECUTE", // Execution of a signed order
  RECEIVE_TON = "RECEIVE_TON", // Receipt of incoming TON tokens
  RECEIVE_JETTON = "RECEIVE_JETTON", // Receipt of incoming Jetton tokens
}

export interface BaseMultisigEvent {
  hash: string; // Transaction hash
  executed_at: number; // Transaction unix timestamp in seconds
  type: MultisigEventType;
}

export interface DeployEvent extends BaseMultisigEvent {
  type: MultisigEventType.DEPLOY;
  source: ContractAddress; // The deployer wallet address
}

export interface ExecuteEvent extends BaseMultisigEvent, BaseMultisigOrder {
  type: MultisigEventType.EXECUTE;
}

export interface ReceiveTonEvent extends BaseMultisigEvent {
  type: MultisigEventType.RECEIVE_TON;
  source: ContractAddress; // Sender wallet address
  amount: TokenAmount; // Amount of tokens to received in minimal units
}

export interface ReceiveJettonEvent extends BaseMultisigEvent {
  type: MultisigEventType.RECEIVE_JETTON;
  source: ContractAddress; // Sender wallet address
  amount: TokenAmount; // Amount of tokens to received in minimal units
  minter_address: string; // Jetton minter contract address, used as a key to lookup token metadata
}

// Discriminator: type
export type MultisigEvent =
  | DeployEvent
  | ExecuteEvent
  | ReceiveTonEvent
  | ReceiveJettonEvent;

export type GetMultisigEventsResponse = ApiResponse<{
  items: MultisigEvent[];
  total: number;
}>;
