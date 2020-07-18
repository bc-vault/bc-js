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
 * @description The DaemonError class contains a BCHttpResponse, HttpResponse, DaemonHttpResponse, or , depending on where the failure was
 * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
 * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
 */
class DaemonError extends Error {
    // tslint:disable: no-string-literal
    constructor(data, m = "DaemonError") {
        super(m);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DaemonError.prototype);
        this.name = "DaemonError";
        if (data['config'] !== undefined) {
            this.HttpResponse = data;
            return;
        }
        if (data['errorCode'] !== undefined) {
            this.BCHttpResponse = data;
            return;
        }
        if (data['daemonError'] !== undefined) {
            this.DaemonHttpResponse = data;
            return;
        }
        if (typeof (data) === typeof (JSErrorCode.popupCreateFailed)) {
            this.jsError = data;
            return;
        }
        throw new Error('Error could not be parsed, this should never happen.');
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
var JSErrorCode;
(function (JSErrorCode) {
    JSErrorCode[JSErrorCode["popupCreateFailed"] = 1] = "popupCreateFailed";
})(JSErrorCode = exports.JSErrorCode || (exports.JSErrorCode = {}));
var WalletDetailsQuery;
(function (WalletDetailsQuery) {
    WalletDetailsQuery[WalletDetailsQuery["none"] = 0] = "none";
    WalletDetailsQuery[WalletDetailsQuery["userData"] = 1] = "userData";
    WalletDetailsQuery[WalletDetailsQuery["extraData"] = 2] = "extraData";
    WalletDetailsQuery[WalletDetailsQuery["status"] = 4] = "status";
    WalletDetailsQuery[WalletDetailsQuery["all"] = 4294967295] = "all";
})(WalletDetailsQuery = exports.WalletDetailsQuery || (exports.WalletDetailsQuery = {}));
