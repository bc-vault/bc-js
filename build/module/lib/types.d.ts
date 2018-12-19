export interface HttpResponse {
    readonly status: number;
    readonly body: BCHttpResponse | string | object;
}
export interface BCHttpResponse {
    readonly errorCode: number;
    readonly data: any;
}
export interface TransactionData {
    /**
     * @description the public address from which to send
     */
    from: string;
    /**
     * @description the public address to which to send
     */
    to: string;
    /**
     * @description the transaction fee count (in eth this is the Gas Limit, btc and others, ignored field)
     */
    feeCount?: number;
    /**
     * @description the price to pay for each fee( in BTC this is the transaction fee, in eth this is gas price) capped to 2^64.
     * @description This field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER AS A STRING, not a decimal
     */
    feePrice: string;
    /**
     * @description the amount to send.
     * @description This field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER AS A STRING, not a decimal
     */
    amount: string;
}
/**
 * @description The DaemonError class contains a BCHttpResponse and a HttpResponse, depending on where the failure was
 * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
 * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
 */
export declare class DaemonError extends Error {
    /**
     * @description HttpResponse !== undefined if the request succeeded but the device returned an error code.
     */
    HttpResponse: HttpResponse;
    /**
     * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
     */
    BCHttpResponse: BCHttpResponse;
    constructor(data: HttpResponse | BCHttpResponse, m?: string);
}
export interface VersionObject {
    major: number;
    minor: number;
    revision: number;
    date: DateObject;
    apiVersion: ApiVersionObject;
}
export interface ApiVersionObject {
    major: number;
    minor: number;
}
export interface DateObject {
    day: number;
    month: number;
    year: number;
}
export declare enum Endpoint {
    Devices = "Devices",
    FirmwareVersion = "FirmwareVersion",
    AvailableSpace = "AvailableSpace",
    WalletTypes = "WalletTypes",
    SavedWalletTypes = "SavedWalletTypes",
    WalletsOfType = "WalletsOfType",
    GenerateWallet = "GenerateWallet",
    WalletUserData = "WalletUserData",
    GenerateTransaction = "GenerateTransaction",
    SignTransactionData = "SignTransactionData",
    CopyWalletToType = "CopyWalletToType",
    IsAddressValid = "IsAddressValid",
    EnterGlobalPin = "EnterGlobalPin",
    DisplayAddress = "DisplayAddress",
    PasswordInput = "PasswordInput",
    GetAuthID = "GetAuthID",
    GetWalletBalance = "WalletBalance",
    SignData = "SignData"
}
export interface SpaceObject {
    readonly available: number;
    readonly complete: number;
}
export declare enum WalletType {
    bitCoin,
    bitCoinCash,
    liteCoin,
    dash,
    dogeCoin,
    ripple,
    ethereum,
    erc20Bokky,
    bitCoinTest,
    bitCoinCashTest,
    liteCoinTest,
    dashTest,
    dogeCoinTest,
    rippleTest,
    ethereumTest,
    erc20BokkyTest
}
export interface WalletTypeInfo {
    type: WalletType;
    name: string;
    ticker: string;
}
export declare const typeInfoMap: WalletTypeInfo[];
export interface BCObject {
    devices: BCDevice[];
}
export interface BCDevice {
    id: number;
    space: SpaceObject;
    firmware: VersionObject;
    supportedTypes: ReadonlyArray<WalletType>;
    activeTypes: ReadonlyArray<WalletType>;
    activeWallets: WalletData[];
    locked: boolean;
}
export interface WalletData {
    publicKey: string;
    walletType: WalletType;
    balance?: string;
}
export declare enum BCDataRefreshStatusCode {
    ConnectionError = -1,
    Ready = 0,
    Working = 1
}
export declare enum PasswordType {
    WalletPassword = "wallet",
    GlobalPassword = "global"
}
