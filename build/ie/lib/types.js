"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/**
 * @description The DaemonError class contains a BCHttpResponse and a HttpResponse, depending on where the failure was
 * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
 * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code.
 */
var DaemonError = /** @class */ (function (_super) {
    __extends(DaemonError, _super);
    function DaemonError(data, m) {
        if (m === void 0) { m = "DaemonError"; }
        var _this = _super.call(this, m) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, DaemonError.prototype);
        _this.name = "DaemonError";
        if (data.status !== undefined) { //data is HttpResponse
            _this.HttpResponse = data;
        }
        else {
            _this.BCHttpResponse = data;
        }
        return _this;
    }
    return DaemonError;
}(Error));
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
})(Endpoint = exports.Endpoint || (exports.Endpoint = {}));
var WalletTypeConstants = {
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
