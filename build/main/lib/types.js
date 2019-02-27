"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0NFOzs7O0dBSUc7QUFDSCxpQkFBeUIsU0FBUSxLQUFLO0lBU3BDLFlBQVksSUFBa0MsRUFBQyxJQUFTLGFBQWE7UUFDakUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRVQsZ0NBQWdDO1FBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFDLGFBQWEsQ0FBQztRQUN4QixJQUFJLElBQXFCLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBQyxFQUFDLHNCQUFzQjtZQUNwRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQW9CLENBQUM7U0FDMUM7YUFBSTtZQUNILElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBc0IsQ0FBQztTQUM5QztJQUVMLENBQUM7Q0FDRjtBQXRCRCxrQ0FzQkM7QUFrQkQsSUFBWSxRQW9CWDtBQXBCRCxXQUFZLFFBQVE7SUFDbEIsK0JBQThCLENBQUE7SUFDOUIsK0NBQXNDLENBQUE7SUFDdEMsNkNBQXFDLENBQUE7SUFDckMsdUNBQWtDLENBQUE7SUFDbEMsaURBQXVDLENBQUE7SUFDdkMsMkNBQW9DLENBQUE7SUFDcEMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsdURBQTBDLENBQUE7SUFDMUMsdURBQTBDLENBQUE7SUFDMUMsaURBQXVDLENBQUE7SUFDdkMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsMkNBQW9DLENBQUE7SUFDcEMsbUNBQWdDLENBQUE7SUFDaEMsOENBQW9DLENBQUE7SUFDcEMsaUNBQStCLENBQUE7QUFFakMsQ0FBQyxFQXBCVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQW9CbkI7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QUFBO0lBQ3pHLHdDQUFrQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsQ0FBQyxrQkFBQSxDQUFBO0lBQ3ZHLGdEQUFxQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsQ0FBQywwQkFBQSxDQUFBO0lBQzFHLDhDQUFxQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsRUFBRSx3QkFBQSxDQUFBO0lBQzNHLDJDQUFvQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsRUFBRSxxQkFBQSxDQUFBO0lBQzFHLHlDQUFtQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsRUFBRSxtQkFBQSxDQUFBO0lBQ3pHLDRDQUFvQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsRUFBRSxzQkFBQSxDQUFBO0lBQzFHLDRDQUFvQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsRUFBRSxzQkFBQSxDQUFBO0lBQzFHLHlDQUFtQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUMsRUFBRSxtQkFBQSxDQUFBO0lBQ3pHLDRDQUFvQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxLQUFL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WUFBWSxFQUFDLElBQUksRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLEtBQUssRUFBQztJQUMzRCxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsU0FBUyxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLEtBQUssRUFBQztJQUNyRCxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsWUFBWSxFQUFDLElBQUksRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLEtBQUssRUFBQztJQUMzRCxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUMsSUFBSSxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQ25FLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUMsSUFBSSxFQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0lBQ2pFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUMsSUFBSSxFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0lBQ25FLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUMsSUFBSSxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDMUUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFlBQVksRUFBQyxJQUFJLEVBQUMsZUFBZSxFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDbkUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFFLE1BQU0sRUFBQyxRQUFRLEVBQUM7SUFDNUQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFlBQVksRUFBQyxJQUFJLEVBQUMsZUFBZSxFQUFFLE1BQU0sRUFBQyxRQUFRLEVBQUM7SUFDcEUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGNBQWMsRUFBQyxJQUFJLEVBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFDLFNBQVMsRUFBQztJQUMzRSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsYUFB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