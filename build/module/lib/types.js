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
    WalletType[WalletType["bitCoinTest"] = (WalletTypeConstants.BTC) | WalletTypeConstants.TESTNET] = "bitCoinTest";
    WalletType[WalletType["bitCoinCashTest"] = (WalletTypeConstants.BTC + 1) | WalletTypeConstants.TESTNET] = "bitCoinCashTest";
    WalletType[WalletType["liteCoinTest"] = (WalletTypeConstants.BTC + 2) | WalletTypeConstants.TESTNET] = "liteCoinTest";
    WalletType[WalletType["dashTest"] = (WalletTypeConstants.BTC + 3) | WalletTypeConstants.TESTNET] = "dashTest";
    WalletType[WalletType["dogeCoinTest"] = (WalletTypeConstants.BTC + 4) | WalletTypeConstants.TESTNET] = "dogeCoinTest";
    WalletType[WalletType["rippleTest"] = (WalletTypeConstants.BTC + 5) | WalletTypeConstants.TESTNET] = "rippleTest";
    WalletType[WalletType["ethereumTest"] = (WalletTypeConstants.ETH) | WalletTypeConstants.TESTNET] = "ethereumTest";
    WalletType[WalletType["erc20BokkyTest"] = (WalletTypeConstants.ETH | WalletTypeConstants.ERC20) | WalletTypeConstants.TESTNET] = "erc20BokkyTest";
})(WalletType || (WalletType = {}));
export const typeInfoMap = [
    { type: WalletType.bitCoin, name: "Bitcoin", ticker: "BTC" },
    { type: WalletType.bitCoinCash, name: "Bitcoin Cash", ticker: "BCH" },
    { type: WalletType.liteCoin, name: "Litecoin", ticker: "LTC" },
    { type: WalletType.dash, name: "Dash", ticker: "DASH" },
    { type: WalletType.dogeCoin, name: "Dogecoin", ticker: "DOGE" },
    { type: WalletType.ripple, name: "Ripple", ticker: "XRP" },
    { type: WalletType.ethereum, name: "Ethereum", ticker: "ETH" },
    { type: WalletType.erc20Bokky, name: "Bokky", ticker: "BOKKY" },
    { type: WalletType.bitCoinTest, name: "Bitcoin Test", ticker: "BTC-T" },
    { type: WalletType.bitCoinCashTest, name: "Bitcoin Cash Test", ticker: "BCH-T" },
    { type: WalletType.liteCoinTest, name: "Litecoin Test", ticker: "LTC-T" },
    { type: WalletType.dogeCoinTest, name: "Dogecoin Test", ticker: "DOGE-T" },
    { type: WalletType.rippleTest, name: "Ripple Test", ticker: "XRP-T" },
    { type: WalletType.ethereumTest, name: "Ethereum Test", ticker: "ETH-T" },
    { type: WalletType.erc20BokkyTest, name: "Bokky Test", ticker: "BOKKY-T" },
];
export var BCDataRefreshStatusCode;
(function (BCDataRefreshStatusCode) {
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["ConnectionError"] = -1] = "ConnectionError";
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["Ready"] = 0] = "Ready";
    BCDataRefreshStatusCode[BCDataRefreshStatusCode["Working"] = 1] = "Working";
})(BCDataRefreshStatusCode || (BCDataRefreshStatusCode = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtDRTs7OztHQUlHO0FBQ0gsTUFBTSxrQkFBbUIsU0FBUSxLQUFLO0lBU3BDLFlBQVksSUFBZ0MsRUFBQyxJQUFTLGFBQWE7UUFDL0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRVQsZ0NBQWdDO1FBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFDLGFBQWEsQ0FBQztRQUN4QixJQUFJLElBQXFCLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBQyxFQUFDLHNCQUFzQjtZQUNwRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQW9CLENBQUM7U0FDMUM7YUFBSTtZQUNILElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBc0IsQ0FBQztTQUM5QztJQUVMLENBQUM7Q0FDRjtBQWtCRCxNQUFNLENBQU4sSUFBWSxRQW1CWDtBQW5CRCxXQUFZLFFBQVE7SUFDbEIsK0JBQThCLENBQUE7SUFDOUIsK0NBQXNDLENBQUE7SUFDdEMsNkNBQXFDLENBQUE7SUFDckMsdUNBQWtDLENBQUE7SUFDbEMsaURBQXVDLENBQUE7SUFDdkMsMkNBQW9DLENBQUE7SUFDcEMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsdURBQTBDLENBQUE7SUFDMUMsdURBQTBDLENBQUE7SUFDMUMsaURBQXVDLENBQUE7SUFDdkMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsMkNBQW9DLENBQUE7SUFDcEMsbUNBQWdDLENBQUE7SUFDaEMsOENBQW9DLENBQUE7QUFFdEMsQ0FBQyxFQW5CVyxRQUFRLEtBQVIsUUFBUSxRQW1CbkI7QUFLRCxNQUFNLG1CQUFtQixHQUFHO0lBQzFCLEdB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