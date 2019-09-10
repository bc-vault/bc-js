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
        if (data.status !== undefined) { //data is HttpResponse
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUUsSUFBWSxRQUtYO0FBTEQsV0FBWSxRQUFRO0lBQ2xCLDZDQUFTLENBQUE7SUFDVCx5Q0FBTyxDQUFBO0lBQ1AsNkNBQVMsQ0FBQTtJQUNULHlDQUFPLENBQUE7QUFDVCxDQUFDLEVBTFcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFLbkI7QUF5QkQ7Ozs7R0FJRztBQUNILGlCQUF5QixTQUFRLEtBQUs7SUFTcEMsWUFBWSxJQUFrQyxFQUFDLElBQVMsYUFBYTtRQUNqRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFVCxnQ0FBZ0M7UUFDaEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxJQUFJLEdBQUMsYUFBYSxDQUFDO1FBQ3hCLElBQUksSUFBcUIsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFDLEVBQUMsc0JBQXNCO1lBQ3BFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBb0IsQ0FBQztTQUMxQzthQUFJO1lBQ0gsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFzQixDQUFDO1NBQzlDO0lBRUwsQ0FBQztDQUNGO0FBdEJELGtDQXNCQztBQWtCRCxJQUFZLFFBb0JYO0FBcEJELFdBQVksUUFBUTtJQUNsQiwrQkFBOEIsQ0FBQTtJQUM5QiwrQ0FBc0MsQ0FBQTtJQUN0Qyw2Q0FBcUMsQ0FBQTtJQUNyQyx1Q0FBa0MsQ0FBQTtJQUNsQyxpREFBdUMsQ0FBQTtJQUN2QywyQ0FBb0MsQ0FBQTtJQUNwQyw2Q0FBcUMsQ0FBQTtJQUNyQyw2Q0FBcUMsQ0FBQTtJQUNyQyx1REFBMEMsQ0FBQTtJQUMxQyx1REFBMEMsQ0FBQTtJQUMxQyxpREFBdUMsQ0FBQTtJQUN2Qyw2Q0FBcUMsQ0FBQTtJQUNyQyw2Q0FBcUMsQ0FB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QkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxDQUFDLHVCQUFBLENBQUE7SUFDMUcsNENBQW9CLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxDQUFDLHNCQUFBLENBQUE7SUFDekcsd0NBQWtCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxDQUFDLGtCQUFBLENBQUE7SUFDdkcsZ0RBQXFCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxDQUFDLDBCQUFBLENBQUE7SUFDMUcsOENBQXFCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLHdCQUFBLENBQUE7SUFDM0csMkNBQW9CLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLHFCQUFBLENBQUE7SUFDMUcseUNBQW1CLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLG1CQUFBLENBQUE7SUFDekcsNENBQW9CLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLHNCQUFBLENBQUE7SUFDMUcsNENBQW9CLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLHNCQUFBLENBQUE7SUFDMUcseUNBQW1CLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLG1CQUFBLENBQUE7SUFDekcsNENBQW9CLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLHNCQUFBLENBQUE7SUFDMUcsZ0RBQXFCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBQyxFQUFFLDBCQUFBLENBQUE7QUFDN0csQ0FBQyxFQXhEVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQXdEckI7QUFNWSxRQUFBLFdBQVcsR0FBb0I7SUFDMUMsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLE9BQU8sRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDdEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDeEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFdBQVcsRUFBQyxJQUFJLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDL0QsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDeEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDakQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDekQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDdEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGFBQWEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDOUQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLE9BQU8sRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDakQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGVBQWUsRUFBQyxJQUFJLEVBQUMsWUFBWSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDakUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFdBQVcsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDekQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGFBQWEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDN0QsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFlBQVksRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDM0QsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsd0JBQXdCLEVBQUUsTUFBTSxFQUFDLEtBQUssRUFBQztJQUN0RSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUMsSUFBSSxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUMsTUFBTSxFQUFDO0lBQ3BFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUMsSUFBSSxFQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQy9ELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUMsUUFBUSxFQUFDO0lBQzVELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUMsSUFBSSxFQUFD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