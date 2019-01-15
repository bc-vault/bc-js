/**
 * @description The DaemonError class contains a BCHttpResponse and a HttpResponse, depending on where the failure was
 * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
 * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
 */
export class DaemonError extends Error {
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
export var Endpoint;
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
})(Endpoint || (Endpoint = {}));
const WalletTypeConstants = {
    BTC: 0,
    ERC20: 0x02000000,
    ETH: 0x01000000,
    TESTNET: 0x40000000
};
export var WalletType;
(function (WalletType) {
    WalletType[WalletType["bitCoin"] = WalletTypeConstants.BTC] = "bitCoin";
    WalletType[WalletType["bitCoinCash"] = WalletTypeConstants.BTC + 1] = "bitCoinCash";
    WalletType[WalletType["liteCoin"] = WalletTypeConstants.BTC + 2] = "liteCoin";
    WalletType[WalletType["dash"] = WalletTypeConstants.BTC + 3] = "dash";
    WalletType[WalletType["dogeCoin"] = WalletTypeConstants.BTC + 4] = "dogeCoin";
    WalletType[WalletType["ripple"] = WalletTypeConstants.BTC + 5] = "ripple";
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
    WalletType[WalletType["liteCoinTest"] = (WalletTypeConstants.BTC + 2) | WalletTypeConstants.TESTNET] = "liteCoinTest";
    WalletType[WalletType["dashTest"] = (WalletTypeConstants.BTC + 3) | WalletTypeConstants.TESTNET] = "dashTest";
    WalletType[WalletType["dogeCoinTest"] = (WalletTypeConstants.BTC + 4) | WalletTypeConstants.TESTNET] = "dogeCoinTest";
    WalletType[WalletType["rippleTest"] = (WalletTypeConstants.BTC + 5) | WalletTypeConstants.TESTNET] = "rippleTest";
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
})(WalletType || (WalletType = {}));
export const typeInfoMap = [
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
];
export var BCDataRefreshStatusCode;
(function (BCDataRefreshStatusCode) {
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["ConnectionError"] = -1] = "ConnectionError";
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["Ready"] = 0] = "Ready";
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["Working"] = 1] = "Working";
})(BCDataRefreshStatusCode || (BCDataRefreshStatusCode = {}));
export var PasswordType;
(function (PasswordType) {
    PasswordType["WalletPassword"] = "wallet";
    PasswordType["GlobalPassword"] = "global";
})(PasswordType || (PasswordType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtDRTs7OztHQUlHO0FBQ0gsTUFBTSxrQkFBbUIsU0FBUSxLQUFLO0lBU3BDLFlBQVksSUFBa0MsRUFBQyxJQUFTLGFBQWE7UUFDakUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRVQsZ0NBQWdDO1FBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFDLGFBQWEsQ0FBQztRQUN4QixJQUFJLElBQXFCLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBQyxFQUFDLHNCQUFzQjtZQUNwRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQW9CLENBQUM7U0FDMUM7YUFBSTtZQUNILElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBc0IsQ0FBQztTQUM5QztJQUVMLENBQUM7Q0FDRjtBQWtCRCxNQUFNLENBQU4sSUFBWSxRQW9CWDtBQXBCRCxXQUFZLFFBQVE7SUFDbEIsK0JBQThCLENBQUE7SUFDOUIsK0NBQXNDLENBQUE7SUFDdEMsNkNBQXFDLENBQUE7SUFDckMsdUNBQWtDLENBQUE7SUFDbEMsaURBQXVDLENBQUE7SUFDdkMsMkNBQW9DLENBQUE7SUFDcEMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsdURBQTBDLENBQUE7SUFDMUMsdURBQTBDLENBQUE7SUFDMUMsaURBQXVDLENBQUE7SUFDdkMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsMkNBQW9DLENBQUE7SUFDcEMsbUNBQWdDLENBQUE7SUFDaEMsOENBQW9DLENBQUE7SUFDcEMsaUNBQStCLENBQUE7QUFFakMsQ0FBQyxFQXBCVyxRQUFRLEtBQVIsUUFBUSxRQW9CbkI7QUFLRCxNQUFNLG1C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LEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDdEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDeEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFdBQVcsRUFBQyxJQUFJLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDL0QsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDeEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDakQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDekQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDdEQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGFBQWEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLEVBQUM7SUFDOUQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLE9BQU8sRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDakQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGVBQWUsRUFBQyxJQUFJLEVBQUMsWUFBWSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDakUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFdBQVcsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDekQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGFBQWEsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDN0QsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFlBQVksRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDM0QsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsd0JBQXdCLEVBQUUsTUFBTSxFQUFDLEtBQUssRUFBQztJQUN0RSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUMsSUFBSSxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUMsTUFBTSxFQUFDO0lBQ3BFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUMsSUFBSSxFQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQy9ELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUMsUUFBUSxFQUFDO0lBQzVELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQ3JELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUMsSUFBSSxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQzNELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUMsSUFBSSxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQzNELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQ3JELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUMsSUFBSSxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsS0FBSyxFQUFDO0lBQzNELEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBQyxJQUFJLEVBQUMsYUFBYSxFQUFFLE1BQU0sRUFBQyxLQUFLLEVBQUM7SUFDbkUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFdBQVcsRUFBQyxJQUFJLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDakUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFlBQVksRUFBQyxJQUFJLEVBQUMsZUFBZSxFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDbkUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGVBQWUsRUFBQyxJQUFJLEVBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFDLE9BQU8sRUFBQztJQUMxRSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsWUFBWSxFQUFDLElBQUksRUFBQyxlQUFlLEVBQUUsTUFBTSxFQUFDLE9BQU8sRUFBQztJQUNuRSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsUUFBUSxFQUFDLElBQUksRUFBQyxXQUFXLEVBQUUsTUFBTSxFQUFDLFFBQVEsRUFBQztJQUM1RCxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsWUFBWSxFQUFDLElBQUksRUFBQyxlQUFlLEVBQUUsTUFBTSxFQUFDLFFBQVEsRUFBQztJQUNwRSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsY0FBYyxFQUFDLElBQUksRUFBQyxtQkFBbUIsRUFBRSxNQUFNLEVBQUMsU0FBUyxFQUFDO0lBQzNFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUMsSUFBSSxFQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUMsUUFBUSxFQUFDO0lBQ2pFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBQyxJQUFJLEVBQUMsZUFBZSxFQUFFLE1BQU0sRUFBQyxRQUFRLEVBQUM7SUFDekUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLFdBQVcsRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDNUQsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFDLElBQUksRUFBQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0lBQzVFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUMsSUFBSSxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0lBQ3BFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBQyxJQUFJLEVBQUMsZUFBZSxFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDeEUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFDLElBQUksRUFBQyxjQUFjLEVBQUUsTUFBTSxFQUFDLE9BQU8sRUFBQztJQUN0RSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsWUFBWSxFQUFDLElBQUksRUFBQyw2QkFBNkIsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0lBQ2pGLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBQyxJQUFJLEVBQUMsa0JBQWtCLEVBQUUsTUFBTSxFQUFDLFFBQVEsRUFBQztJQUMvRSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUMsSUFBSSxFQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDMUUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGVBQWUsRUFBQyxJQUFJLEVBQUMsYUFBYSxFQUFFLE1BQU0sRUFBQyxVQUFVLEVBQUM7SUFDdkUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGFBQWEsRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDaEUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFDLElBQUksRUFBQyxjQUFjLEVBQUUsTUFBTSxFQUFDLE9BQU8sRUFBQztJQUN0RSxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUMsSUFBSSxFQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0lBQ3RFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUMsSUFBSSxFQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0lBQ2hFLEVBQUMsSUFBSSxFQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBQyxJQUFJLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBQyxPQUFPLEVBQUM7SUFDdEUsRUFBQyxJQUFJLEVBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFDLElBQUksRUFBQyxrQkFBa0IsRUFBRSxNQUFNLEVBQUMsT0FBTyxFQUFDO0NBQy9FLENBQUM7QUFvQkYsTUFBTSxDQUFOLElBQVksdUJBSVg7QUFKRCxXQUFZLHVCQUF1QjtJQUNqQyw0RkFBa0IsQ0FBQTtJQUNsQix1RUFBTyxDQUFBO0lBQ1AsMkVBQVMsQ0FBQTtBQUNYLENBQUMsRUFKVyx1QkFBdUIsS0FBdkIsdUJBQXVCLFFBSWxDO0FBQ0QsTUFBTSxDQUFOLElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUN0Qix5Q0FBdUIsQ0FBQTtJQUN2Qix5Q0FBdUIsQ0FBQTtBQUN6QixDQUFDLEVBSFcsWUFBWSxLQUFaLFlBQVksUUFHdkIifQ==