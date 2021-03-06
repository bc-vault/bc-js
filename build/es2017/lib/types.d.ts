import { AxiosError } from "axios";
export interface HttpResponse {
    readonly status: number;
    readonly body?: any;
}
export interface BCHttpResponse {
    readonly errorCode: number;
    readonly data: any;
}
export interface DaemonHttpResponse {
    readonly daemonError: number;
    readonly parseError: string;
}
export declare type hexString = string;
export declare enum LogLevel {
    verbose = 1,
    debug = 2,
    warning = 3,
    error = 4
}
/**
 * @description the type of address, segwit, legacy etc...
 */
export declare enum AddressType {
    All = 0,
    PKH = 1,
    PSH = 2,
    P2WPKH = 3,
    B32 = 4,
    BCHNew = 5,
    EOSAccount = 6,
    EOSOwner = 7,
    EOSActive = 8,
    EOS = 9,
    EOSK1 = 10,
    err = 11
}
export declare enum StellarCreateAccount {
    No = 0,
    Yes = 1,
    FetchFromNetwork = 255
}
export interface Utxo {
    txId: string;
    outputIndex: number;
    amount: number;
    address: number;
    type: AddressType;
}
export interface AdvancedBTC {
    utxos: Utxo[];
}
export interface AdvancedETH {
    nonce: number;
    chainID: number;
}
export interface AdvancedTRX {
    timeStamp: number;
    refBlockBytes: number;
    refBlockHash: number;
    expiration: number;
}
export interface AdvancedEOS {
    expiration: number;
    refBlockNum: number;
    refBlockPrefix: number;
}
export interface AdvancedBNB {
    accountNumber: number;
    nonce: number;
    networkId: string;
}
export interface AdvancedXRP {
    nonce: number;
}
export interface AdvancedXLM {
    nonce: number;
    createDestination: StellarCreateAccount;
}
export interface AdvancedOptions {
    btc?: AdvancedBTC;
    eth?: AdvancedETH;
    trx?: AdvancedTRX;
    eos?: AdvancedEOS;
    bnb?: AdvancedBNB;
    xrp?: AdvancedXRP;
    xlm?: AdvancedXLM;
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
     * @description the transaction fee count (in eth this is not optional as the Gas Limit, in btc and others it's an ignored field)
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
    /**
     * @description The memo of the transaction, maximum size is 128 bytes. Optional. Can be hex encoded. As with all hexStrings, 0x prefix can be escaped with 0\x.
     */
    memo?: hexString;
    /**
     * @description an optional set of parameters used for offline transaction generation.
    */
    advanced?: AdvancedOptions;
    /**
     * @description Optional contract data specified for ethereum transactions
     */
    contractData?: hexString;
}
/**
 * @description The DaemonError class contains a BCHttpResponse, HttpResponse, DaemonHttpResponse, or , depending on where the failure was
 * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
 * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
 */
export declare class DaemonError extends Error {
    /**
     * @description HttpResponse !== undefined if the request failed, this means the daemon could not be reached.
     */
    HttpResponse?: AxiosError;
    /**
     * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
     */
    BCHttpResponse?: BCHttpResponse;
    /**
     * @description DaemonHttpResponse !== undefined if the request reached the daemon, who then reject it for a specified reason.
     */
    DaemonHttpResponse?: DaemonHttpResponse;
    /**
     * @description jsError !==
     */
    jsError?: JSErrorCode;
    constructor(data: BCHttpResponse | DaemonHttpResponse | AxiosError | JSErrorCode, m?: string);
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
export interface WalletTypeInfo {
    type: WalletType;
    name: string;
    ticker: string;
}
export interface SpaceObject {
    readonly available: number;
    readonly complete: number;
}
export declare enum Endpoint {
    Devices = "Devices",
    FirmwareVersion = "FirmwareVersion",
    AvailableSpace = "AvailableSpace",
    WalletTypes = "WalletTypes",
    SavedWalletTypes = "SavedWalletTypes",
    WalletsOfType = "WalletsOfType",
    WalletsOfTypes = "WalletsOfTypes",
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
    SignData = "SignData",
    DeviceUID = "DeviceUID"
}
export declare enum WalletType {
    none = 0,
    bitCoin = "BitCoin1",
    ethereum = "Ethereum",
    ripple = "Ripple01",
    stellar = "Stellar1",
    eos = "Eos____1",
    binanceCoin = "Bnb____1",
    tron = "Tron___1",
    bitCoinCash = "BcCash01",
    bitcoinGold = "BcGold01",
    liteCoin = "LiteCoi1",
    dash = "Dash0001",
    dogeCoin = "DogeCoi1",
    groestlcoin = "Groestl1",
    velas = "Velas__1",
    cardano = "Cardano1",
    erc20Salt = "E2Salt_1",
    erc20Polymath = "E2Polym1",
    erc200x = "E2_0X__1",
    erc20Cindicator = "E2Cindi1",
    erc20CargoX = "E2Cargo1",
    erc20Viberate = "E2Viber1",
    erc20Iconomi = "E2Icono1",
    erc20DTR = "E2DynTR1",
    erc20OriginTrail = "E2OriTr1",
    erc20InsurePal = "E2InsuP1",
    erc20Xaurum = "E2Xauru1",
    erc20OmiseGo = "E2Omise1",
    erc20WaltonChain = "E2WaltC1"
}
export declare const typeInfoMap: WalletTypeInfo[];
export interface BCObject {
    devices: BCDevice[];
}
export interface BCDevice {
    id: number;
    UID?: hexString;
    space: SpaceObject;
    firmware: VersionObject;
    userData: string;
    userDataRaw: hexString;
    supportedTypes: WalletType[];
    activeTypes: WalletType[];
    activeWallets: WalletData[];
    locked: boolean;
}
export declare type AuthorizationHandler = (authID: string, passwordType: PasswordType, preAuthReference?: any) => Promise<void>;
export declare type PreAuthorizationHandler = (passwordType: PasswordType) => Promise<any>;
export interface WalletData {
    publicKey: string;
    userData: string;
    userDataRaw: hexString;
    extraData?: hexString;
    walletType: WalletType;
    balance?: string;
}
export interface WalletBatchDataResponse {
    type: WalletType;
    address: string;
    userData: string;
    userDataRaw: hexString;
    /** May be undefined in the case of an old daemon which doesn't support fetching this property */
    extraData?: hexString;
    /** May be undefined in the case of an old daemon which doesn't support fetching this property */
    status?: number;
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
export declare enum SessionAuthType {
    token = "token",
    any = "any"
}
export interface SessionCreateParameters {
    sessionType: SessionAuthType;
    matchPath?: string;
    expireSeconds: number;
    versionNumber: number;
}
export declare enum DaemonErrorCodes {
    sessionError = 1,
    parameterError = 2,
    httpsInvalid = 3
}
export declare enum JSErrorCode {
    popupCreateFailed = 1
}
export declare enum WalletDetailsQuery {
    none = 0,
    userData = 1,
    extraData = 2,
    status = 4,
    all = 4294967295
}
