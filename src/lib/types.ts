
export interface HttpResponse{
    readonly status:number;
    readonly body:BCHttpResponse|string|object;
  
  }
  export interface BCHttpResponse{
    readonly errorCode:number;
    readonly data:any;
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