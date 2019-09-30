export interface HttpResponse {
    readonly status: number;
    readonly body: BCHttpResponse | string | object;
}
export interface BCHttpResponse {
    readonly errorCode: number;
    readonly data: any;
}
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
    /**
     * @description an optional set of parameters used for offline transaction generation.
    */
    advanced?: AdvancedOptions;
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
export declare enum WalletType_Legacy {
    bitCoin,
    bitCoinCash,
    bitCoinGold,
    liteCoin,
    dash,
    dogeCoin,
    ripple,
    stellar,
    ethereum,
    erc20Bokky,
    erc20Salt,
    erc20Polymath,
    erc200x,
    erc20Cindicator,
    erc20CargoX,
    erc20Viberate,
    erc20Iconomi,
    erc20DTR,
    erc20OriginTrail,
    erc20InsurePal,
    erc20Xaurum,
    erc20Tron,
    erc20VeChain,
    erc20Binance,
    erc20Icon,
    erc20OmiseGo,
    erc20WaltonChain,
    bitCoinTest,
    bitCoinCashTest,
    bitCoinGoldTest,
    liteCoinTest,
    dashTest,
    dogeCoinTest,
    rippleTest,
    stellarTest,
    ethereumTest,
    erc20BokkyTest,
    erc20SaltTest,
    erc20PolymathTest,
    erc200xTest,
    erc20CindicatorTest,
    erc20CargoXTest,
    erc20ViberateTest,
    erc20IconomiTest,
    erc20DTRTest,
    erc20OriginTrailTest,
    erc20InsurePalTest,
    erc20XaurumTest,
    erc20TronTest,
    erc20VeChainTest,
    erc20BinanceTest,
    erc20IconTest,
    erc20OmiseGoTest,
    erc20WaltonChainTest
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
    userData: string;
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
export declare enum SessionAuthType {
    token = "token",
    any = "any"
}
export interface SessionCreateParameters {
    sessionType: SessionAuthType;
    matchPath: string;
    expireSeconds: number;
    versionNumber: number;
}
export declare enum DaemonErrorCodes {
    sessionError = 1,
    parameterError = 2,
    httpsInvalid = 3
}
