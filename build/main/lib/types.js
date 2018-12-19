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
})(WalletType = exports.WalletType || (exports.WalletType = {}));
exports.typeInfoMap = [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0NFOzs7O0dBSUc7QUFDSCxpQkFBeUIsU0FBUSxLQUFLO0lBU3BDLFlBQVksSUFBZ0MsRUFBQyxJQUFTLGFBQWE7UUFDL0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRVQsZ0NBQWdDO1FBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFDLGFBQWEsQ0FBQztRQUN4QixJQUFJLElBQXFCLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBQyxFQUFDLHNCQUFzQjtZQUNwRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQW9CLENBQUM7U0FDMUM7YUFBSTtZQUNILElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBc0IsQ0FBQztTQUM5QztJQUVMLENBQUM7Q0FDRjtBQXRCRCxrQ0FzQkM7QUFrQkQsSUFBWSxRQW9CWDtBQXBCRCxXQUFZLFFBQVE7SUFDbEIsK0JBQThCLENBQUE7SUFDOUIsK0NBQXNDLENBQUE7SUFDdEMsNkNBQXFDLENBQUE7SUFDckMsdUNBQWtDLENBQUE7SUFDbEMsaURBQXVDLENBQUE7SUFDdkMsMkNBQW9DLENBQUE7SUFDcEMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsdURBQTBDLENBQUE7SUFDMUMsdURBQTBDLENBQUE7SUFDMUMsaURBQXVDLENBQUE7SUFDdkMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsNkNBQXFDLENBQUE7SUFDckMsMkNBQW9DLENBQUE7SUFDcEMsbUNBQWdDLENBQUE7SUFDaEMsOENBQW9DLENBQUE7SUFDcEMsaUNBQStCLENBQUE7QUFFakMsQ0FBQyxFQXBCVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQW9CbkI7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