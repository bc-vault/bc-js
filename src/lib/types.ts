
export interface HttpResponse{
    readonly status:number;
    readonly body:BCHttpResponse | string | object;
  
  }
  export interface BCHttpResponse{
    readonly errorCode:number;
    readonly data:any;
  }
  export interface TransactionData{
    /**
     * @description the public address from which to send
     */
    from:string;
    /**
     * @description the public address to which to send
     */
    to:string;
    /**
     * @description the transaction fee count (in eth this is the Gas Limit, btc and others, ignored field)
     */
    feeCount?:number;
    /**
     * @description the price to pay for each fee( in BTC this is the transaction fee, in eth this is gas price) capped to 2^64.
     * @description This field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER AS A STRING, not a decimal
     */
    feePrice:string;
    /**
     * @description the amount to send.
     * @description This field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER AS A STRING, not a decimal
     */
    amount:string;
  }
  /**
   * @description The DaemonError class contains a BCHttpResponse and a HttpResponse, depending on where the failure was
   * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
   * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code. 
   */
  export class DaemonError extends Error {
    /**
     * @description HttpResponse !== undefined if the request succeeded but the device returned an error code. 
     */
    HttpResponse:HttpResponse
    /**
     * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code. 
     */
    BCHttpResponse:BCHttpResponse
    constructor(data:HttpResponse | BCHttpResponse,m:string="DaemonError") {
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
    GetWalletBalance    ="WalletBalance",
    SignData            ="SignData",

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
    bitCoin               =WalletTypeConstants.BTC,
    bitCoinCash           =WalletTypeConstants.BTC+1,
    bitCoinGold           =WalletTypeConstants.BTC+2,
    liteCoin              =WalletTypeConstants.BTC+3,
    dash                  =WalletTypeConstants.BTC+4,
    dogeCoin              =WalletTypeConstants.BTC+5,
    ripple                =WalletTypeConstants.BTC+6,
    stellar               =WalletTypeConstants.BTC+7,
    ethereum              =WalletTypeConstants.ETH,
    erc20Bokky            =WalletTypeConstants.ETH  | WalletTypeConstants.ERC20,
    erc20Salt             =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+1,
    erc20Polymath			    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+2,
    erc200x			          =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+3,
    erc20Cindicator			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+4,
    erc20CargoX		    	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+5,
    erc20Viberate			    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+6,
    erc20Iconomi	    		=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+7,
    erc20DTR			        =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+8,
    erc20OriginTrail			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+9,
    erc20InsurePal		   	=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+10,
    erc20Xaurum	    	   	=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+11,
    erc20Tron		    	    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+12,
    erc20VeChain    			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+13,
    erc20Binance    			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+14,
    erc20Icon		    	    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+15,
    erc20OmiseGo    			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+16,
    erc20WaltonChain			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+17,
  
    bitCoinTest         =(WalletTypeConstants.BTC)  | WalletTypeConstants.TESTNET,
    bitCoinCashTest     =(WalletTypeConstants.BTC+1)| WalletTypeConstants.TESTNET,
    bitCoinGoldTest     =(WalletTypeConstants.BTC+2)| WalletTypeConstants.TESTNET,
    liteCoinTest        =(WalletTypeConstants.BTC+3)| WalletTypeConstants.TESTNET,
    dashTest            =(WalletTypeConstants.BTC+4)| WalletTypeConstants.TESTNET,
    dogeCoinTest        =(WalletTypeConstants.BTC+5)| WalletTypeConstants.TESTNET,
    rippleTest          =(WalletTypeConstants.BTC+6)| WalletTypeConstants.TESTNET,
    stellarTest         =(WalletTypeConstants.BTC+7)| WalletTypeConstants.TESTNET,
    ethereumTest        =(WalletTypeConstants.ETH)  | WalletTypeConstants.TESTNET,
    erc20BokkyTest      =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)| WalletTypeConstants.TESTNET,
    erc20SaltTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+1,
    erc20PolymathTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+2,
    erc200xTest			    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+3,
    erc20CindicatorTest =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+4,
    erc20CargoXTest		  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+5,	
    erc20ViberateTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+6,
    erc20IconomiTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+7,
    erc20DTRTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+8,
    erc20OriginTrailTest=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+9,
    erc20InsurePalTest  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+10,	
    erc20XaurumTest		  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+11,
    erc20TronTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+12,
    erc20VeChainTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+13,
    erc20BinanceTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+14,
    erc20IconTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+15,
    erc20OmiseGoTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+16,
    erc20WaltonChainTest=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+17,
  }
  export interface WalletTypeInfo{
    type:WalletType
    name:string;
    ticker:string;
  }
  export const typeInfoMap:WalletTypeInfo[] = [
    {type:WalletType.bitCoin,name:"Bitcoin", ticker:"BTC"},
    {type:WalletType.ethereum,name:"Ethereum", ticker:"ETH"},
    {type:WalletType.bitCoinCash,name:"Bitcoin Cash", ticker:"BCH"},
    {type:WalletType.liteCoin,name:"Litecoin", ticker:"LTC"},
    {type:WalletType.dash,name:"Dash", ticker:"DASH"},
    {type:WalletType.dogeCoin,name:"Dogecoin", ticker:"DOGE"},
    {type:WalletType.erc20Salt,name:"Salt" ,ticker:"SALT"},
    {type:WalletType.erc20Polymath,name:"Polymath" ,ticker:"POLY"},
    {type:WalletType.erc200x,name:"0X" ,ticker:"ZRX"},
    {type:WalletType.erc20Cindicator,name:"Cindicator" ,ticker:"CND"},
    {type:WalletType.erc20CargoX,name:"CargoX" ,ticker:"CXO"},
    {type:WalletType.erc20Viberate,name:"Viberate" ,ticker:"VIB"},
    {type:WalletType.erc20Iconomi,name:"Iconomi" ,ticker:"ICN"},
    {type:WalletType.erc20DTR,name:"Dynamic Trading Rights" ,ticker:"DTR"},
    {type:WalletType.erc20OriginTrail,name:"OriginTrail" ,ticker:"TRAC"},
    {type:WalletType.erc20InsurePal,name:"InsurePal" ,ticker:"IPL"},
    {type:WalletType.erc20Xaurum,name:"Xaurum" ,ticker:"XAURUM"},
    {type:WalletType.erc20Tron,name:"Tron" ,ticker:"TRX"},
    {type:WalletType.erc20VeChain,name:"VeChain" ,ticker:"VEN"},
    {type:WalletType.erc20Binance,name:"Binance" ,ticker:"BNB"},
    {type:WalletType.erc20Icon,name:"Icon" ,ticker:"ICX"},
    {type:WalletType.erc20OmiseGo,name:"OmiseGo" ,ticker:"OMG"},
    {type:WalletType.erc20WaltonChain,name:"WaltonChain" ,ticker:"WTC"},
    {type:WalletType.bitCoinTest,name:"Bitcoin Test", ticker:"BTC-T"},
    {type:WalletType.ethereumTest,name:"Ethereum Test" ,ticker:"ETH-T"},
    {type:WalletType.bitCoinCashTest,name:"Bitcoin Cash Test", ticker:"BCH-T"},
    {type:WalletType.liteCoinTest,name:"Litecoin Test", ticker:"LTC-T"},
    {type:WalletType.dashTest,name:"Dash Test", ticker:"DASH-T"},
    {type:WalletType.dogeCoinTest,name:"Dogecoin Test", ticker:"DOGE-T"},
    {type:WalletType.erc20BokkyTest,name:"Bokky ERC 20 Test" ,ticker:"BOKKY-T"},
    {type:WalletType.erc20SaltTest,name:"Salt Test" ,ticker:"SALT-T"},
    {type:WalletType.erc20PolymathTest,name:"Polymath Test" ,ticker:"POLY-T"},
    {type:WalletType.erc200xTest,name:"0X Test" ,ticker:"ZRX-T"},
    {type:WalletType.erc20CindicatorTest,name:"Cindicator Test" ,ticker:"CND-T"},
    {type:WalletType.erc20CargoXTest,name:"CargoX Test" ,ticker:"CXO-T"},
    {type:WalletType.erc20ViberateTest,name:"Viberate Test" ,ticker:"VIB-T"},
    {type:WalletType.erc20IconomiTest,name:"Iconomi Test" ,ticker:"ICN-T"},
    {type:WalletType.erc20DTRTest,name:"Dynamic Trading Rights Test" ,ticker:"DTR-T"},
    {type:WalletType.erc20OriginTrailTest,name:"OriginTrail Test" ,ticker:"TRAC-T"},
    {type:WalletType.erc20InsurePalTest,name:"InsurePal Test" ,ticker:"IPL-T"},
    {type:WalletType.erc20XaurumTest,name:"Xaurum Test" ,ticker:"XAURUM-T"},
    {type:WalletType.erc20TronTest,name:"Tron Test" ,ticker:"TRX-T"},
    {type:WalletType.erc20VeChainTest,name:"VeChain Test" ,ticker:"VEN-T"},
    {type:WalletType.erc20BinanceTest,name:"Binance Test" ,ticker:"BNB-T"},
    {type:WalletType.erc20IconTest,name:"Icon Test" ,ticker:"ICX-T"},
    {type:WalletType.erc20OmiseGoTest,name:"OmiseGo Test" ,ticker:"OMG-T"},
    {type:WalletType.erc20WaltonChainTest,name:"WaltonChain Test" ,ticker:"WTC-T"},
    {type:WalletType.ripple,name:"Ripple", ticker:"XRP"},
    {type:WalletType.rippleTest,name:"Ripple Test", ticker:"XRP-T"},
    {type:WalletType.stellar,name:"Stellar", ticker:"XLM"},
    {type:WalletType.stellarTest,name:"Stellar Test", ticker:"XLM-T"},
  ];

  export interface BCObject{
    devices:BCDevice[];

  }
  export interface BCDevice{
    id:number;
    space:SpaceObject;
    firmware:VersionObject;
    supportedTypes:ReadonlyArray<WalletType>;
    activeTypes:ReadonlyArray<WalletType>;
    activeWallets:WalletData[];
    locked:boolean;
  }
  export interface WalletData{
    publicKey:string;
    walletType:WalletType;
    balance?:string;
  }
  export enum BCDataRefreshStatusCode{
    ConnectionError=-1,
    Ready=0,
    Working=1
  }
  export enum PasswordType{
    WalletPassword='wallet',
    GlobalPassword='global'
  }