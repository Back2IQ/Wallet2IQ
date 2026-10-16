// DAIO Commander - Type Definitions

export type BrandMode = 'back2iq' | 'fp';

export type WalletType = 'hardware' | 'software' | 'exchange' | 'custody';

export type Platform = 'ethereum' | 'solana' | 'bsc' | 'other';

export type NFTSource = 'opensea' | 'blur' | 'superrare' | 'other';

export type NFTUtility = 'governance' | 'access' | 'commercial' | 'none';

export type GamingPlatform = 'steam' | 'cs2' | 'epic' | 'fortnite' | 'roblox' | 'wow' | 'other';

export type LiquidationWindow = '30' | '60' | '90' | '120';

export interface BitcoinAsset {
  id: string;
  walletType: WalletType;
  address: string;
  value: number;
  storageLocation: string;
  lastActivity: string;
}

export interface EthereumAsset {
  id: string;
  walletType: WalletType;
  address: string;
  value: number;
  hasSmartContract: boolean | null;
  storageLocation: string;
  lastActivity: string;
}

export interface StablecoinAsset {
  id: string;
  type: 'USDC' | 'USDT' | 'DAI';
  platform: Platform;
  value: number;
  walletAddress: string;
}

export interface NFTAsset {
  id: string;
  collectionName: string;
  tokenId: string;
  estimatedValue: number;
  source: NFTSource;
  walletAddress: string;
  imageUrl?: string;
  utilities: NFTUtility[];
}

export interface GamingAsset {
  id: string;
  platform: GamingPlatform;
  accountId: string;
  estimatedValue: number;
  rareItems: string;
  trustedPerson: {
    name: string;
    email: string;
    phone: string;
  };
  liquidationWindow: LiquidationWindow;
}

export interface ClientCase {
  id: string;
  name: string;
  createdAt: string;
  bitcoinAssets: BitcoinAsset[];
  ethereumAssets: EthereumAsset[];
  stablecoinAssets: StablecoinAsset[];
  nftAssets: NFTAsset[];
  gamingAssets: GamingAsset[];
}

export interface DemoCase {
  id: string;
  hasCrypto: boolean;
  hasNFT: boolean;
  hasGaming: boolean;
  cryptoValue: number;
  nftValue: number;
  gamingValue: number;
  totalValue: number;
}

export interface LossEstimatorData {
  totalCases: number;
  averageWealth: number;
  assetDistribution: {
    crypto: number;
    nft: number;
    gaming: number;
  };
  riskWithoutStructure: number;
  potentialLossGermany: number;
  potentialSaved: number;
}

export interface TemplateData {
  clientName: string;
  caseId: string;
  date: string;
  assets: {
    bitcoin: BitcoinAsset[];
    ethereum: EthereumAsset[];
    stablecoins: StablecoinAsset[];
    nfts: NFTAsset[];
    gaming: GamingAsset[];
  };
  totalValue: number;
}

export type PageType = 
  | 'landing' 
  | 'asset-discovery' 
  | 'hidden-scanner' 
  | 'loss-estimator' 
  | 'template-generator' 
  | 'data-value' 
  | 'partnership';
