
export interface HttpResponse{
    readonly status:number;
    readonly body:BCHttpResponse|string|object;
  
  }
  export interface BCHttpResponse{
    readonly errorCode:number;
    readonly data:any;
  }
  export interface TransactionData{
    // the public address from which to send
    from:string;
    // the public address to which to send
    to:string;
    // the transaction fee count (in eth this is the Gas Limit, btc and others, ignored field)
    feeCount?:number;
    // the price to pay for each fee( in BTC this is the transaction fee, in eth this is gas price) capped to 2^64
    // this field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER, not a decimal
    feePrice:string;
    // the amount to send
    // this field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER, not a decimal
    amount:string;
  }
  export class DaemonError extends Error {
    HttpResponse:HttpResponse
    BCHttpResponse:BCHttpResponse
    constructor(data:HttpResponse|BCHttpResponse,m:string="DaemonError") {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DaemonError.prototype);
        this.name="DaemonError";
        if((data as HttpResponse).status !== undefined){//data is HttpResponse
          this.HttpResponse = data as HttpResponse;
        }else{
          this.BCHttpResponse = data as BCHttpResponse;
        }
        
    }
  }
  export interface VersionObject{
    major:number
    minor:number
    revision:number
    date:DateObject
    apiVersion:ApiVersionObject

  }
  export interface ApiVersionObject{
    major:number
    minor:number
  }
  export interface DateObject{
    day:number
    month:number
    year:number
  }
  export enum Endpoint{
    Devices             ="Devices",
    FirmwareVersion     ="FirmwareVersion",
    AvailableSpace      ="AvailableSpace",
    WalletTypes         ="WalletTypes",
    SavedWalletTypes    ="SavedWalletTypes",
    WalletsOfType       ="WalletsOfType",
    GenerateWallet      ="GenerateWallet",
    WalletUserData      ="WalletUserData",
    GenerateTransaction ="GenerateTransaction",
    SignTransactionData ="SignTransactionData",
    CopyWalletToType    ="CopyWalletToType",
    IsAddressValid      ="IsAddressValid",
    EnterGlobalPin      ="EnterGlobalPin",
    DisplayAddress      ="DisplayAddress",
    PasswordInput       ="PasswordInput",
    GetAuthID           ="GetAuthID",

  }
  export interface SpaceObject{
    readonly available:number;
    readonly complete:number;
  }
  const WalletTypeConstants = {
    BTC:0,
    ERC20:0x02000000,
    ETH:0x01000000,
    TESTNET:0x40000000
  }
  export enum WalletType{
    bitCoin     =WalletTypeConstants.BTC,
    bitCoinCash =WalletTypeConstants.BTC+1,
    liteCoin    =WalletTypeConstants.BTC+2,
    dash        =WalletTypeConstants.BTC+3,
    dogeCoin    =WalletTypeConstants.BTC+4,
    ripple      =WalletTypeConstants.BTC+5,
    ethereum    =WalletTypeConstants.ETH,
    erc20Bokky  =WalletTypeConstants.ETH|WalletTypeConstants.ERC20,
  
    bitCoinTest     =(WalletTypeConstants.BTC) | WalletTypeConstants.TESTNET,
    bitCoinCashTest =(WalletTypeConstants.BTC+1)| WalletTypeConstants.TESTNET,
    liteCoinTest    =(WalletTypeConstants.BTC+2)| WalletTypeConstants.TESTNET,
    dashTest        =(WalletTypeConstants.BTC+3)| WalletTypeConstants.TESTNET,
    dogeCoinTest    =(WalletTypeConstants.BTC+4)| WalletTypeConstants.TESTNET,
    rippleTest      =(WalletTypeConstants.BTC+5)| WalletTypeConstants.TESTNET,
    ethereumTest    =(WalletTypeConstants.ETH)  | WalletTypeConstants.TESTNET,
    erc20BokkyTest  =(WalletTypeConstants.ETH|WalletTypeConstants.ERC20)| WalletTypeConstants.TESTNET
  }