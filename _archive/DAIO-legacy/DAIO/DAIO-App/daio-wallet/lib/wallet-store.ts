import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'heir' | 'guardian' | 'notary' | 'manager';

export type Chain = 'bitcoin' | 'ethereum' | 'bnb' | 'solana' | 'polygon' | 'avalanche';

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  chain: Chain;
  balance: number;
  balanceUSD: number;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  chain: Chain;
  balance: number;
  balanceUSD: number;
  price: number;
  priceChange24h: number;
  logoUrl?: string;
  contractAddress?: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake';
  from: string;
  to: string;
  amount: number;
  symbol: string;
  usdValue: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  chain: Chain;
  fee?: number;
}

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'heir' | 'guardian' | 'notary';
  keyShare?: number; // Shamir share index
  address?: string; // crypto wallet address
  notified: boolean;
}

export type DeadManSwitchStatus = 'inactive' | 'active' | 'warning_1' | 'warning_2' | 'warning_3' | 'triggered';

export interface DeadManSwitch {
  enabled: boolean;
  intervalMonths: 3 | 6 | 12;
  lastCheckIn: number; // timestamp
  status: DeadManSwitchStatus;
  warningsSent: number;
  nextCheckIn: number; // timestamp
  triggerDate?: number; // timestamp when fully triggered
}

export interface ShamirConfig {
  enabled: boolean;
  totalShares: number; // e.g. 3 or 5
  threshold: number;   // e.g. 2 or 3
  shares: Array<{
    index: number;
    recipientId: string;
    delivered: boolean;
    deliveryMethod: 'email' | 'sms' | 'notary';
  }>;
}

export interface EmergencyProtocol {
  enabled: boolean;
  guardians: string[]; // beneficiary IDs
  requiresConfirmation: boolean;
  cooldownHours: number;
  lastTriggered?: number;
  reason?: string;
}

export interface InheritanceContainer {
  level: 1 | 2 | 3;
  version: number;
  lastUpdated: number;
  assetInventory: string;
  accessArchitecture: string;
  heirDesignation: string;
  legacyContext: string;
  platformInstructions: string;
  professionalContacts: string;
  multisigConfig?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  actor: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface WalletState {
  // Auth
  isSetup: boolean;
  isLocked: boolean;
  userRole: UserRole;
  pinHash?: string;
  biometricEnabled: boolean;
  lastLogin: number;

  // Wallet
  accounts: WalletAccount[];
  tokens: Token[];
  transactions: Transaction[];
  totalPortfolioUSD: number;

  // DAIO
  daiScore: number; // 0-100
  beneficiaries: Beneficiary[];
  deadManSwitch: DeadManSwitch;
  shamirConfig: ShamirConfig;
  emergencyProtocol: EmergencyProtocol;
  inheritanceContainer?: InheritanceContainer;
  auditLog: AuditEntry[];
}

// ─── Default State ─────────────────────────────────────────────────────────────

export const DEFAULT_STATE: WalletState = {
  isSetup: false,
  isLocked: true,
  userRole: 'owner',
  biometricEnabled: false,
  lastLogin: 0,
  accounts: [],
  tokens: [],
  transactions: [],
  totalPortfolioUSD: 0,
  daiScore: 0,
  beneficiaries: [],
  deadManSwitch: {
    enabled: false,
    intervalMonths: 6,
    lastCheckIn: Date.now(),
    status: 'inactive',
    warningsSent: 0,
    nextCheckIn: Date.now() + 6 * 30 * 24 * 60 * 60 * 1000,
  },
  shamirConfig: {
    enabled: false,
    totalShares: 3,
    threshold: 2,
    shares: [],
  },
  emergencyProtocol: {
    enabled: false,
    guardians: [],
    requiresConfirmation: true,
    cooldownHours: 24,
  },
  auditLog: [],
};

// ─── Mock Data for Demo ────────────────────────────────────────────────────────

export const MOCK_TOKENS: Token[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    chain: 'bitcoin',
    balance: 0.4821,
    balanceUSD: 43389.00,
    price: 89990.00,
    priceChange24h: 2.34,
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    chain: 'ethereum',
    balance: 3.2150,
    balanceUSD: 8037.50,
    price: 2500.00,
    priceChange24h: -1.12,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    chain: 'bnb',
    balance: 12.500,
    balanceUSD: 3750.00,
    price: 300.00,
    priceChange24h: 0.87,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    chain: 'solana',
    balance: 45.00,
    balanceUSD: 6750.00,
    price: 150.00,
    priceChange24h: 5.21,
  },
  {
    id: 'matic',
    symbol: 'MATIC',
    name: 'Polygon',
    chain: 'polygon',
    balance: 2500.00,
    balanceUSD: 1250.00,
    price: 0.50,
    priceChange24h: -0.45,
  },
  {
    id: 'avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    chain: 'avalanche',
    balance: 28.00,
    balanceUSD: 1008.00,
    price: 36.00,
    priceChange24h: 3.14,
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    type: 'receive',
    from: '0x742d35Cc6634C0532925a3b8D4C9C3',
    to: '0x1234...5678',
    amount: 0.05,
    symbol: 'ETH',
    usdValue: 125.00,
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    status: 'confirmed',
    txHash: '0xabc123...',
    chain: 'ethereum',
    fee: 0.002,
  },
  {
    id: 'tx2',
    type: 'send',
    from: '0x1234...5678',
    to: '0x9876...4321',
    amount: 0.01,
    symbol: 'BTC',
    usdValue: 899.90,
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    status: 'confirmed',
    txHash: '0xdef456...',
    chain: 'bitcoin',
    fee: 0.0001,
  },
  {
    id: 'tx3',
    type: 'swap',
    from: '0x1234...5678',
    to: '0x1234...5678',
    amount: 100,
    symbol: 'MATIC',
    usdValue: 50.00,
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    status: 'confirmed',
    txHash: '0xghi789...',
    chain: 'polygon',
    fee: 0.01,
  },
];

export const MOCK_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben1',
    name: 'Sarah Miller',
    email: 'sarah.miller@example.com',
    phone: '+1 555 1234567',
    role: 'heir',
    keyShare: 1,
    notified: true,
  },
  {
    id: 'ben2',
    name: 'Dr. James Wilson',
    email: 'j.wilson@notary-services.com',
    phone: '+1 555 9876543',
    role: 'notary',
    keyShare: 2,
    notified: false,
  },
  {
    id: 'ben3',
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    phone: '+1 555 8887766',
    role: 'guardian',
    keyShare: 3,
    notified: true,
  },
];

// ─── Storage Helpers ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'daio_wallet_state';

export async function loadWalletState(): Promise<WalletState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveWalletState(state: Partial<WalletState>): Promise<void> {
  try {
    const current = await loadWalletState();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
  } catch (e) {
    console.error('[WalletStore] Failed to save wallet state:', e);
    throw e;
  }
}

// ─── DMS Logic ───────────────────────────────────────────────────────────────

/**
 * Transition the DMS through its 4 "waterproof" escalation stages.
 * Stage 1: Warning 1 (Soft Alert) - 75% elapsed
 * Stage 2: Warning 2 (Critical Alert) - 90% elapsed
 * Stage 3: Proof of Life (Hard Block) - 100% elapsed
 * Stage 4: Triggered - PoL grace period expired (14 days after Stage 3)
 */
export function getUpdatedDmsStatus(dms: DeadManSwitch): DeadManSwitchStatus {
  if (!dms.enabled) return 'inactive';

  const now = Date.now();
  const totalDuration = dms.intervalMonths * 30 * 24 * 60 * 60 * 1000;
  const elapsed = now - dms.lastCheckIn;
  const gracePeriod = 14 * 24 * 60 * 60 * 1000; // 14 days for PoL

  if (elapsed >= totalDuration + gracePeriod) return 'triggered';
  if (elapsed >= totalDuration) return 'warning_3'; // Proof of Life Stage
  if (elapsed >= totalDuration * 0.9) return 'warning_2';
  if (elapsed >= totalDuration * 0.75) return 'warning_1';

  return 'active';
}

export function resetDms(dms: DeadManSwitch): DeadManSwitch {
  const nextCheckIn = Date.now() + dms.intervalMonths * 30 * 24 * 60 * 60 * 1000;
  return {
    ...dms,
    lastCheckIn: Date.now(),
    status: 'active',
    warningsSent: 0,
    nextCheckIn,
  };
}

// ─── DAIO Score Calculator ─────────────────────────────────────────────────────

export function calculateDaiScore(state: WalletState): number {
  let score = 0;

  // Inheritance Container (30 pts)
  if (state.inheritanceContainer) {
    score += 10; // Level 1
    if (state.inheritanceContainer.level >= 2) score += 10;
    if (state.inheritanceContainer.level >= 3) score += 10;
  }

  // Dead Man's Switch (20 pts)
  if (state.deadManSwitch.enabled) {
    // Penalize score if warnings are active
    if (state.deadManSwitch.status === 'warning_1') score += 15;
    else if (state.deadManSwitch.status === 'warning_2') score += 10;
    else if (state.deadManSwitch.status === 'warning_3') score += 5;
    else if (state.deadManSwitch.status === 'triggered') score += 0;
    else score += 20;
  }

  // Shamir Secret Sharing (20 pts)
  if (state.shamirConfig.enabled && state.shamirConfig.shares.length > 0) {
    score += 20;
  }

  // Beneficiaries (15 pts)
  if (state.beneficiaries.length > 0) score += 5;
  if (state.beneficiaries.length >= 2) score += 5;
  if (state.beneficiaries.some(b => b.role === 'notary')) score += 5;

  // Emergency Protocol (10 pts)
  if (state.emergencyProtocol.enabled) score += 10;

  // Biometric (5 pts)
  if (state.biometricEnabled) score += 5;

  return Math.min(100, score);
}

// ─── Chain Config ──────────────────────────────────────────────────────────────

export const CHAIN_CONFIG: Record<Chain, {
  name: string;
  symbol: string;
  color: string;
  icon: string;
  explorerUrl: string;
}> = {
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#F7931A',
    icon: '₿',
    explorerUrl: 'https://blockstream.info/tx/',
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    icon: 'Ξ',
    explorerUrl: 'https://etherscan.io/tx/',
  },
  bnb: {
    name: 'BNB Chain',
    symbol: 'BNB',
    color: '#F3BA2F',
    icon: 'B',
    explorerUrl: 'https://bscscan.com/tx/',
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    color: '#9945FF',
    icon: '◎',
    explorerUrl: 'https://solscan.io/tx/',
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    color: '#8247E5',
    icon: 'P',
    explorerUrl: 'https://polygonscan.com/tx/',
  },
  avalanche: {
    name: 'Avalanche',
    symbol: 'AVAX',
    color: '#E84142',
    icon: 'A',
    explorerUrl: 'https://snowtrace.io/tx/',
  },
};

// ─── Utility Functions ─────────────────────────────────────────────────────────

