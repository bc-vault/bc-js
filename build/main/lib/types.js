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
})(Endpoint = exports.Endpoint || (exports.Endpoint = {}));
const WalletTypeConstants = {
    BTC: 0,
    ERC20: 0x02000000,
    ETH: 0x01000000,
    TESTNET: 0x40000000
};
var WalletType;
(function (WalletType) {
    WalletType[WalletType["bitCoin"] = WalletTypeConstants.BTC] = "bitCoin";
    WalletType[WalletType["bitCoinCash"] = WalletTypeConstants.BTC + 1] = "bitCoinCash";
    WalletType[WalletType["bitCoinGold"] = WalletTypeConstants.BTC + 2] = "bitCoinGold";
    WalletType[WalletType["liteCoin"] = WalletTypeConstants.BTC + 3] = "liteCoin";
    WalletType[WalletType["dash"] = WalletTypeConstants.BTC + 4] = "dash";
    WalletType[WalletType["dogeCoin"] = WalletTypeConstants.BTC + 5] = "dogeCoin";
    WalletType[WalletType["ripple"] = WalletTypeConstants.BTC + 6] = "ripple";
    WalletType[WalletType["stellar"] = WalletTypeConstants.BTC + 7] = "stellar";
    WalletType[WalletType["ethereum"] = WalletTypeConstants.ETH] = "ethereum";
    WalletType[WalletType["erc20Bokky"] = WalletTypeConstants.ETH | WalletTypeConstants.ERC20] = "erc20Bokky";
    WalletType[WalletType["erc20Salt"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 1] = "erc20Salt";
    WalletType[WalletType["erc20Polymath"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 2] = "erc20Polymath";
    WalletType[WalletType["erc200x"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 3] = "erc200x";
    WalletType[WalletType["erc20Cindicator"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 4] = "erc20Cindicator";
    WalletType[WalletType["erc20CargoX"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 5] = "erc20CargoX";
    WalletType[WalletType["erc20Viberate"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 6] = "erc20Viberate";
    WalletType[WalletType["erc20Iconomi"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 7] = "erc20Iconomi";
    WalletType[WalletType["erc20DTR"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 8] = "erc20DTR";
    WalletType[WalletType["erc20OriginTrail"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 9] = "erc20OriginTrail";
    WalletType[WalletType["erc20InsurePal"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 10] = "erc20InsurePal";
    WalletType[WalletType["erc20Xaurum"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 11] = "erc20Xaurum";
    WalletType[WalletType["erc20Tron"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 12] = "erc20Tron";
    WalletType[WalletType["erc20VeChain"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 13] = "erc20VeChain";
    WalletType[WalletType["erc20Binance"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 14] = "erc20Binance";
    WalletType[WalletType["erc20Icon"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 15] = "erc20Icon";
    WalletType[WalletType["erc20OmiseGo"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 16] = "erc20OmiseGo";
    WalletType[WalletType["erc20WaltonChain"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) + 17] = "erc20WaltonChain";
    WalletType[WalletType["bitCoinTest"] = (WalletTypeConstants.BTC) | WalletTypeConstants.TESTNET] = "bitCoinTest";
    WalletType[WalletType["bitCoinCashTest"] = (WalletTypeConstants.BTC + 1) | WalletTypeConstants.TESTNET] = "bitCoinCashTest";
    WalletType[WalletType["bitCoinGoldTest"] = (WalletTypeConstants.BTC + 2) | WalletTypeConstants.TESTNET] = "bitCoinGoldTest";
    WalletType[WalletType["liteCoinTest"] = (WalletTypeConstants.BTC + 3) | WalletTypeConstants.TESTNET] = "liteCoinTest";
    WalletType[WalletType["dashTest"] = (WalletTypeConstants.BTC + 4) | WalletTypeConstants.TESTNET] = "dashTest";
    WalletType[WalletType["dogeCoinTest"] = (WalletTypeConstants.BTC + 5) | WalletTypeConstants.TESTNET] = "dogeCoinTest";
    WalletType[WalletType["rippleTest"] = (WalletTypeConstants.BTC + 6) | WalletTypeConstants.TESTNET] = "rippleTest";
    WalletType[WalletType["stellarTest"] = (WalletTypeConstants.BTC + 7) | WalletTypeConstants.TESTNET] = "stellarTest";
    WalletType[WalletType["ethereumTest"] = (WalletTypeConstants.ETH) | WalletTypeConstants.TESTNET] = "ethereumTest";
    WalletType[WalletType["erc20BokkyTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) | WalletTypeConstants.TESTNET] = "erc20BokkyTest";
    WalletType[WalletType["erc20SaltTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 1] = "erc20SaltTest";
    WalletType[WalletType["erc20PolymathTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 2] = "erc20PolymathTest";
    WalletType[WalletType["erc200xTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 3] = "erc200xTest";
    WalletType[WalletType["erc20CindicatorTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 4] = "erc20CindicatorTest";
    WalletType[WalletType["erc20CargoXTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 5] = "erc20CargoXTest";
    WalletType[WalletType["erc20ViberateTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 6] = "erc20ViberateTest";
    WalletType[WalletType["erc20IconomiTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 7] = "erc20IconomiTest";
    WalletType[WalletType["erc20DTRTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 8] = "erc20DTRTest";
    WalletType[WalletType["erc20OriginTrailTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 9] = "erc20OriginTrailTest";
    WalletType[WalletType["erc20InsurePalTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 10] = "erc20InsurePalTest";
    WalletType[WalletType["erc20XaurumTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 11] = "erc20XaurumTest";
    WalletType[WalletType["erc20TronTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 12] = "erc20TronTest";
    WalletType[WalletType["erc20VeChainTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 13] = "erc20VeChainTest";
    WalletType[WalletType["erc20BinanceTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 14] = "erc20BinanceTest";
    WalletType[WalletType["erc20IconTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 15] = "erc20IconTest";
    WalletType[WalletType["erc20OmiseGoTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 16] = "erc20OmiseGoTest";
    WalletType[WalletType["erc20WaltonChainTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET) + 17] = "erc20WaltonChainTest";
})(WalletType = exports.WalletType || (exports.WalletType = {}));
exports.typeInfoMap = [
    { type: WalletType.bitCoin, name: "Bitcoin", ticker: "BTC" },
    { type: WalletType.ethereum, name: "Ethereum", ticker: "ETH" },
    { type: WalletType.bitCoinCash, name: "Bitcoin Cash", ticker: "BCH" },
    { type: WalletType.liteCoin, name: "Litecoin", ticker: "LTC" },
    { type: WalletType.dash, name: "Dash", ticker: "DASH" },
    { type: WalletType.dogeCoin, name: "Dogecoin", ticker: "DOGE" },
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
    { type: WalletType.erc20Tron, name: "Tron", ticker: "TRX" },
    { type: WalletType.erc20VeChain, name: "VeChain", ticker: "VEN" },
    { type: WalletType.erc20Binance, name: "Binance", ticker: "BNB" },
    { type: WalletType.erc20Icon, name: "Icon", ticker: "ICX" },
    { type: WalletType.erc20OmiseGo, name: "OmiseGo", ticker: "OMG" },
    { type: WalletType.erc20WaltonChain, name: "WaltonChain", ticker: "WTC" },
    { type: WalletType.bitCoinTest, name: "Bitcoin Test", ticker: "BTC-T" },
    { type: WalletType.ethereumTest, name: "Ethereum Test", ticker: "ETH-T" },
    { type: WalletType.bitCoinCashTest, name: "Bitcoin Cash Test", ticker: "BCH-T" },
    { type: WalletType.liteCoinTest, name: "Litecoin Test", ticker: "LTC-T" },
    { type: WalletType.dashTest, name: "Dash Test", ticker: "DASH-T" },
    { type: WalletType.dogeCoinTest, name: "Dogecoin Test", ticker: "DOGE-T" },
    { type: WalletType.erc20BokkyTest, name: "Bokky ERC 20 Test", ticker: "BOKKY-T" },
    { type: WalletType.erc20SaltTest, name: "Salt Test", ticker: "SALT-T" },
    { type: WalletType.erc20PolymathTest, name: "Polymath Test", ticker: "POLY-T" },
    { type: WalletType.erc200xTest, name: "0X Test", ticker: "ZRX-T" },
    { type: WalletType.erc20CindicatorTest, name: "Cindicator Test", ticker: "CND-T" },
    { type: WalletType.erc20CargoXTest, name: "CargoX Test", ticker: "CXO-T" },
    { type: WalletType.erc20ViberateTest, name: "Viberate Test", ticker: "VIB-T" },
    { type: WalletType.erc20IconomiTest, name: "Iconomi Test", ticker: "ICN-T" },
    { type: WalletType.erc20DTRTest, name: "Dynamic Trading Rights Test", ticker: "DTR-T" },
    { type: WalletType.erc20OriginTrailTest, name: "OriginTrail Test", ticker: "TRAC-T" },
    { type: WalletType.erc20InsurePalTest, name: "InsurePal Test", ticker: "IPL-T" },
    { type: WalletType.erc20XaurumTest, name: "Xaurum Test", ticker: "XAURUM-T" },
    { type: WalletType.erc20TronTest, name: "Tron Test", ticker: "TRX-T" },
    { type: WalletType.erc20VeChainTest, name: "VeChain Test", ticker: "VEN-T" },
    { type: WalletType.erc20BinanceTest, name: "Binance Test", ticker: "BNB-T" },
    { type: WalletType.erc20IconTest, name: "Icon Test", ticker: "ICX-T" },
    { type: WalletType.erc20OmiseGoTest, name: "OmiseGo Test", ticker: "OMG-T" },
    { type: WalletType.erc20WaltonChainTest, name: "WaltonChain Test", ticker: "WTC-T" },
    { type: WalletType.ripple, name: "Ripple", ticker: "XRP" },
    { type: WalletType.rippleTest, name: "Ripple Test", ticker: "XRP-T" },
    { type: WalletType.stellar, name: "Stellar", ticker: "XLM" },
    { type: WalletType.stellarTest, name: "Stellar Test", ticker: "XLM-T" },
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
