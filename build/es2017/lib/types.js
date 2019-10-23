"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["verbose"] = 1] = "verbose";
    LogLevel[LogLevel["debug"] = 2] = "debug";
    LogLevel[LogLevel["warning"] = 3] = "warning";
    LogLevel[LogLevel["error"] = 4] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
/**
 * @description the type of address, segwit, legacy etc...
 */
var AddressType;
(function (AddressType) {
    AddressType[AddressType["All"] = 0] = "All";
    AddressType[AddressType["PKH"] = 1] = "PKH";
    AddressType[AddressType["PSH"] = 2] = "PSH";
    AddressType[AddressType["P2WPKH"] = 3] = "P2WPKH";
    AddressType[AddressType["B32"] = 4] = "B32";
    AddressType[AddressType["BCHNew"] = 5] = "BCHNew";
    AddressType[AddressType["EOSAccount"] = 6] = "EOSAccount";
    AddressType[AddressType["EOSOwner"] = 7] = "EOSOwner";
    AddressType[AddressType["EOSActive"] = 8] = "EOSActive";
    AddressType[AddressType["EOS"] = 9] = "EOS";
    AddressType[AddressType["EOSK1"] = 10] = "EOSK1";
    AddressType[AddressType["err"] = 11] = "err";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
var StellarCreateAccount;
(function (StellarCreateAccount) {
    StellarCreateAccount[StellarCreateAccount["No"] = 0] = "No";
    StellarCreateAccount[StellarCreateAccount["Yes"] = 1] = "Yes";
    StellarCreateAccount[StellarCreateAccount["FetchFromNetwork"] = 255] = "FetchFromNetwork";
})(StellarCreateAccount = exports.StellarCreateAccount || (exports.StellarCreateAccount = {}));
/**
 * @description The DaemonError class contains a BCHttpResponse and a HttpResponse, depending on where the failure was
 * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
 * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
 */
class DaemonError extends Error {
    constructor(data, m = "DaemonError") {
        super(m);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DaemonError.prototype);
        this.name = "DaemonError";
        if (data.status !== undefined) { // data is HttpResponse
            this.HttpResponse = data;
        }
        else {
            this.BCHttpResponse = data;
        }
    }
}
exports.DaemonError = DaemonError;
var Endpoint;
(function (Endpoint) {
    Endpoint["Devices"] = "Devices";
    Endpoint["FirmwareVersion"] = "FirmwareVersion";
    Endpoint["AvailableSpace"] = "AvailableSpace";
    Endpoint["WalletTypes"] = "WalletTypes";
    Endpoint["SavedWalletTypes"] = "SavedWalletTypes";
    Endpoint["WalletsOfType"] = "WalletsOfType";
    Endpoint["WalletsOfTypes"] = "WalletsOfTypes";
    Endpoint["GenerateWallet"] = "GenerateWallet";
    Endpoint["WalletUserData"] = "WalletUserData";
    Endpoint["GenerateTransaction"] = "GenerateTransaction";
    Endpoint["SignTransactionData"] = "SignTransactionData";
    Endpoint["CopyWalletToType"] = "CopyWalletToType";
    Endpoint["IsAddressValid"] = "IsAddressValid";
    Endpoint["EnterGlobalPin"] = "EnterGlobalPin";
    Endpoint["DisplayAddress"] = "DisplayAddress";
    Endpoint["PasswordInput"] = "PasswordInput";
    Endpoint["GetAuthID"] = "GetAuthID";
    Endpoint["GetWalletBalance"] = "WalletBalance";
    Endpoint["SignData"] = "SignData";
    Endpoint["DeviceUID"] = "DeviceUID";
})(Endpoint = exports.Endpoint || (exports.Endpoint = {}));
var WalletType;
(function (WalletType) {
    WalletType[WalletType["none"] = 0] = "none";
    WalletType["bitCoin"] = "BitCoin1";
    WalletType["ethereum"] = "Ethereum";
    WalletType["ripple"] = "Ripple01";
    WalletType["stellar"] = "Stellar1";
    WalletType["eos"] = "Eos____1";
    WalletType["binanceCoin"] = "Bnb____1";
    WalletType["tron"] = "Tron___1";
    WalletType["bitCoinCash"] = "BcCash01";
    WalletType["bitcoinGold"] = "BcGold01";
    WalletType["liteCoin"] = "LiteCoi1";
    WalletType["dash"] = "Dash0001";
    WalletType["dogeCoin"] = "DogeCoi1";
    WalletType["groestlcoin"] = "Groestl1";
    WalletType["erc20Salt"] = "E2Salt_1";
    WalletType["erc20Polymath"] = "E2Polym1";
    WalletType["erc200x"] = "E2_0X__1";
    WalletType["erc20Cindicator"] = "E2Cindi1";
    WalletType["erc20CargoX"] = "E2Cargo1";
    WalletType["erc20Viberate"] = "E2Viber1";
    WalletType["erc20Iconomi"] = "E2Icono1";
    WalletType["erc20DTR"] = "E2DynTR1";
    WalletType["erc20OriginTrail"] = "E2OriTr1";
    WalletType["erc20InsurePal"] = "E2InsuP1";
    WalletType["erc20Xaurum"] = "E2Xauru1";
    WalletType["erc20OmiseGo"] = "E2Omise1";
    WalletType["erc20WaltonChain"] = "E2WaltC1";
})(WalletType = exports.WalletType || (exports.WalletType = {}));
const WalletTypeConstants = {
    BTC: 0,
    ERC20: 0x02000000,
    ETH: 0x01000000,
    TESTNET: 0x40000000
};
var WalletType_Legacy;
(function (WalletType_Legacy) {
    WalletType_Legacy[WalletType_Legacy["bitCoin"] = WalletTypeConstants.BTC] = "bitCoin";
    WalletType_Legacy[WalletType_Legacy["bitCoinCash"] = WalletTypeConstants.BTC + 1] = "bitCoinCash";
    WalletType_Legacy[WalletType_Legacy["bitCoinGold"] = WalletTypeConstants.BTC + 2] = "bitCoinGold";
    WalletType_Legacy[WalletType_Legacy["liteCoin"] = WalletTypeConstants.BTC + 3] = "liteCoin";
    WalletType_Legacy[WalletType_Legacy["dash"] = WalletTypeConstants.BTC + 4] = "dash";
    WalletType_Legacy[WalletType_Legacy["dogeCoin"] = WalletTypeConstants.BTC + 5] = "dogeCoin";
    WalletType_Legacy[WalletType_Legacy["ripple"] = WalletTypeConstants.BTC + 6] = "ripple";
    WalletType_Legacy[WalletType_Legacy["stellar"] = WalletTypeConstants.BTC + 7] = "stellar";
    WalletType_Legacy[WalletType_Legacy["ethereum"] = WalletTypeConstants.ETH] = "ethereum";
    WalletType_Legacy[WalletType_Legacy["erc20Bokky"] = WalletTypeConstants.ETH | WalletTypeConstants.ERC20] = "erc20Bokky";
    WalletType_Legacy[WalletType_Legacy["erc20Salt"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 1] = "erc20Salt";
    WalletType_Legacy[WalletType_Legacy["erc20Polymath"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 2] = "erc20Polymath";
    WalletType_Legacy[WalletType_Legacy["erc200x"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 3] = "erc200x";
    WalletType_Legacy[WalletType_Legacy["erc20Cindicator"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 4] = "erc20Cindicator";
    WalletType_Legacy[WalletType_Legacy["erc20CargoX"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 5] = "erc20CargoX";
    WalletType_Legacy[WalletType_Legacy["erc20Viberate"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 6] = "erc20Viberate";
    WalletType_Legacy[WalletType_Legacy["erc20Iconomi"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 7] = "erc20Iconomi";
    WalletType_Legacy[WalletType_Legacy["erc20DTR"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 8] = "erc20DTR";
    WalletType_Legacy[WalletType_Legacy["erc20OriginTrail"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 9] = "erc20OriginTrail";
    WalletType_Legacy[WalletType_Legacy["erc20InsurePal"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 10] = "erc20InsurePal";
    WalletType_Legacy[WalletType_Legacy["erc20Xaurum"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 11] = "erc20Xaurum";
    WalletType_Legacy[WalletType_Legacy["erc20Tron"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 12] = "erc20Tron";
    WalletType_Legacy[WalletType_Legacy["erc20VeChain"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 13] = "erc20VeChain";
    WalletType_Legacy[WalletType_Legacy["erc20Binance"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 14] = "erc20Binance";
    WalletType_Legacy[WalletType_Legacy["erc20Icon"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 15] = "erc20Icon";
    WalletType_Legacy[WalletType_Legacy["erc20OmiseGo"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 16] = "erc20OmiseGo";
    WalletType_Legacy[WalletType_Legacy["erc20WaltonChain"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 17] = "erc20WaltonChain";
    WalletType_Legacy[WalletType_Legacy["bitCoinTest"] = (WalletTypeConstants.BTC) | WalletTypeConstants.TESTNET] = "bitCoinTest";
    WalletType_Legacy[WalletType_Legacy["bitCoinCashTest"] = (WalletTypeConstants.BTC + 1) | WalletTypeConstants.TESTNET] = "bitCoinCashTest";
    WalletType_Legacy[WalletType_Legacy["bitCoinGoldTest"] = (WalletTypeConstants.BTC + 2) | WalletTypeConstants.TESTNET] = "bitCoinGoldTest";
    WalletType_Legacy[WalletType_Legacy["liteCoinTest"] = (WalletTypeConstants.BTC + 3) | WalletTypeConstants.TESTNET] = "liteCoinTest";
    WalletType_Legacy[WalletType_Legacy["dashTest"] = (WalletTypeConstants.BTC + 4) | WalletTypeConstants.TESTNET] = "dashTest";
    WalletType_Legacy[WalletType_Legacy["dogeCoinTest"] = (WalletTypeConstants.BTC + 5) | WalletTypeConstants.TESTNET] = "dogeCoinTest";
    WalletType_Legacy[WalletType_Legacy["rippleTest"] = (WalletTypeConstants.BTC + 6) | WalletTypeConstants.TESTNET] = "rippleTest";
    WalletType_Legacy[WalletType_Legacy["stellarTest"] = (WalletTypeConstants.BTC + 7) | WalletTypeConstants.TESTNET] = "stellarTest";
    WalletType_Legacy[WalletType_Legacy["ethereumTest"] = (WalletTypeConstants.ETH) | WalletTypeConstants.TESTNET] = "ethereumTest";
    WalletType_Legacy[WalletType_Legacy["erc20BokkyTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) | WalletTypeConstants.TESTNET] = "erc20BokkyTest";
    WalletType_Legacy[WalletType_Legacy["erc20SaltTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 1] = "erc20SaltTest";
    WalletType_Legacy[WalletType_Legacy["erc20PolymathTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 2] = "erc20PolymathTest";
    WalletType_Legacy[WalletType_Legacy["erc200xTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 3] = "erc200xTest";
    WalletType_Legacy[WalletType_Legacy["erc20CindicatorTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 4] = "erc20CindicatorTest";
    WalletType_Legacy[WalletType_Legacy["erc20CargoXTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 5] = "erc20CargoXTest";
    WalletType_Legacy[WalletType_Legacy["erc20ViberateTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 6] = "erc20ViberateTest";
    WalletType_Legacy[WalletType_Legacy["erc20IconomiTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 7] = "erc20IconomiTest";
    WalletType_Legacy[WalletType_Legacy["erc20DTRTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 8] = "erc20DTRTest";
    WalletType_Legacy[WalletType_Legacy["erc20OriginTrailTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 9] = "erc20OriginTrailTest";
    WalletType_Legacy[WalletType_Legacy["erc20InsurePalTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 10] = "erc20InsurePalTest";
    WalletType_Legacy[WalletType_Legacy["erc20XaurumTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 11] = "erc20XaurumTest";
    WalletType_Legacy[WalletType_Legacy["erc20TronTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 12] = "erc20TronTest";
    WalletType_Legacy[WalletType_Legacy["erc20VeChainTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 13] = "erc20VeChainTest";
    WalletType_Legacy[WalletType_Legacy["erc20BinanceTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 14] = "erc20BinanceTest";
    WalletType_Legacy[WalletType_Legacy["erc20IconTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 15] = "erc20IconTest";
    WalletType_Legacy[WalletType_Legacy["erc20OmiseGoTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 16] = "erc20OmiseGoTest";
    WalletType_Legacy[WalletType_Legacy["erc20WaltonChainTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 17] = "erc20WaltonChainTest";
})(WalletType_Legacy = exports.WalletType_Legacy || (exports.WalletType_Legacy = {}));
exports.typeInfoMap = [
    { type: WalletType.bitCoin, name: "Bitcoin", ticker: "BTC" },
    { type: WalletType.ethereum, name: "Ethereum", ticker: "ETH" },
    { type: WalletType.bitCoinCash, name: "Bitcoin Cash", ticker: "BCH" },
    { type: WalletType.liteCoin, name: "Litecoin", ticker: "LTC" },
    { type: WalletType.dash, name: "Dash", ticker: "DASH" },
    { type: WalletType.dogeCoin, name: "Dogecoin", ticker: "DOGE" },
    { type: WalletType.eos, name: "EOS", ticker: "EOS" },
    { type: WalletType.binanceCoin, name: "Binance", ticker: "BNB" },
    { type: WalletType.tron, name: "TRON", ticker: "TRX" },
    { type: WalletType.groestlcoin, name: "Groestlcoin", ticker: "GRS" },
    { type: WalletType.erc20Salt, name: "Salt", ticker: "SALT" },
    { type: WalletType.erc20Polymath, name: "Polymath", ticker: "POLY" },
    { type: WalletType.erc200x, name: "0X", ticker: "ZRX" },
    { type: WalletType.erc20Cindicator, name: "Cindicator", ticker: "CND" },
    { type: WalletType.erc20CargoX, name: "CargoX", ticker: "CXO" },
    { type: WalletType.erc20Viberate, name: "Viberate", ticker: "VIB" },
    { type: WalletType.erc20Iconomi, name: "Iconomi", ticker: "ICN" },
    { type: WalletType.erc20DTR, name: "Dynamic Trading Rights", ticker: "DTR" },
    { type: WalletType.erc20OriginTrail, name: "OriginTrail", ticker: "TRAC" },
    { type: WalletType.erc20InsurePal, name: "InsurePal", ticker: "IPL" },
    { type: WalletType.erc20Xaurum, name: "Xaurum", ticker: "XAURUM" },
    { type: WalletType.erc20OmiseGo, name: "OmiseGo", ticker: "OMG" },
    { type: WalletType.erc20WaltonChain, name: "WaltonChain", ticker: "WTC" },
    { type: WalletType.ripple, name: "Ripple", ticker: "XRP" },
    { type: WalletType.stellar, name: "Stellar", ticker: "XLM" },
];
var BCDataRefreshStatusCode;
(function (BCDataRefreshStatusCode) {
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["ConnectionError"] = -1] = "ConnectionError";
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["Ready"] = 0] = "Ready";
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["Working"] = 1] = "Working";
})(BCDataRefreshStatusCode = exports.BCDataRefreshStatusCode || (exports.BCDataRefreshStatusCode = {}));
var PasswordType;
(function (PasswordType) {
    PasswordType["WalletPassword"] = "wallet";
    PasswordType["GlobalPassword"] = "global";
})(PasswordType = exports.PasswordType || (exports.PasswordType = {}));
var SessionAuthType;
(function (SessionAuthType) {
    SessionAuthType["token"] = "token";
    SessionAuthType["any"] = "any";
})(SessionAuthType = exports.SessionAuthType || (exports.SessionAuthType = {}));
var DaemonErrorCodes;
(function (DaemonErrorCodes) {
    DaemonErrorCodes[DaemonErrorCodes["sessionError"] = 1] = "sessionError";
    DaemonErrorCodes[DaemonErrorCodes["parameterError"] = 2] = "parameterError";
    DaemonErrorCodes[DaemonErrorCodes["httpsInvalid"] = 3] = "httpsInvalid";
})(DaemonErrorCodes = exports.DaemonErrorCodes || (exports.DaemonErrorCodes = {}));
var WalletDetailsQuery;
(function (WalletDetailsQuery) {
    WalletDetailsQuery[WalletDetailsQuery["none"] = 0] = "none";
    WalletDetailsQuery[WalletDetailsQuery["userData"] = 1] = "userData";
    WalletDetailsQuery[WalletDetailsQuery["extraData"] = 2] = "extraData";
    WalletDetailsQuery[WalletDetailsQuery["status"] = 4] = "status";
    WalletDetailsQuery[WalletDetailsQuery["all"] = 4294967295] = "all";
})(WalletDetailsQuery = exports.WalletDetailsQuery || (exports.WalletDetailsQuery = {}));
