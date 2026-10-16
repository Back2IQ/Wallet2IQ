import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  generateWalletMnemonic,
  deriveMultipleAddresses,
  encryptData,
  splitSecret,
  formatAddress,
  isValidAddress,
  hashData
} from '@/lib/crypto';

// Types
export interface WalletAccount {
  index: number;
  address: string;
  privateKey: string;
  balance: string;
  name?: string;
}

export interface Heir {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  keyFragment?: string;
}

export interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface KeyFragment {
  id: string;
  holder: string;
  type: 'heir' | 'guardian' | 'notary' | 'self';
  status: 'distributed' | 'pending' | 'activated';
  encrypted: boolean;
  share?: string;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  type: 'send' | 'receive';
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  type: 'info' | 'warning' | 'critical' | 'success';
}

export interface DMSConfig {
  stage1Days: number;
  stage2Days: number;
  stage3Days: number;
  enabled: boolean;
  lastLogin: number;
  nextWarning: number;
  status: 'active' | 'warning' | 'escalation' | 'critical' | 'inactive';
}

export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export interface WalletState {
  mnemonic: string | null;
  password: string | null;
  isInitialized: boolean;
  isLocked: boolean;
  accounts: WalletAccount[];
  activeAccountIndex: number;
  networks: Network[];
  activeNetworkId: string;
  heirs: Heir[];
  guardians: Guardian[];
  keyFragments: KeyFragment[];
  dmsConfig: DMSConfig;
  auditTrail: AuditEntry[];
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  
  initializeWallet: (password: string) => Promise<void>;
  importWallet: (mnemonic: string, password: string) => Promise<void>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  addAccount: (name?: string) => void;
  setActiveAccount: (index: number) => void;
  sendTransaction: (to: string, amount: string, gasPrice?: string) => Promise<Transaction>;
  addHeir: (heir: Omit<Heir, 'id' | 'keyFragment'>) => void;
  removeHeir: (id: string) => void;
  addGuardian: (guardian: Omit<Guardian, 'id'>) => void;
  removeGuardian: (id: string) => void;
  updateDMSConfig: (config: Partial<DMSConfig>) => void;
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  setActiveNetwork: (networkId: string) => void;
  getActiveAccount: () => WalletAccount | null;
  getActiveNetwork: () => Network;
  getBalance: () => string;
  generateKeyFragments: () => void;
}

const defaultNetworks: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
    isTestnet: false
  },
  {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    symbol: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true
  },
  {
    id: 'polygon',
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon.llamarpc.com',
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    isTestnet: false
  }
];

const defaultDMSConfig: DMSConfig = {
  stage1Days: 90,
  stage2Days: 180,
  stage3Days: 365,
  enabled: true,
  lastLogin: Date.now(),
  nextWarning: Date.now() + 90 * 24 * 60 * 60 * 1000,
  status: 'active'
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      mnemonic: null,
      password: null,
      isInitialized: false,
      isLocked: true,
      accounts: [],
      activeAccountIndex: 0,
      networks: defaultNetworks,
      activeNetworkId: 'sepolia',
      heirs: [],
      guardians: [],
      keyFragments: [],
      dmsConfig: defaultDMSConfig,
      auditTrail: [],
      transactions: [],
      pendingTransactions: [],

      initializeWallet: async (password: string) => {
        const mnemonic = generateWalletMnemonic(256);
        const accounts = deriveMultipleAddresses(mnemonic, 1);
        const encrypted = await encryptData(mnemonic, password);
        
        set({
          mnemonic: encrypted.encrypted,
          password: hashData(password),
          isInitialized: true,
          isLocked: false,
          accounts: accounts.map((acc, i) => ({
            ...acc,
            balance: '0',
            name: i === 0 ? 'Account 1' : `Account ${i + 1}`
          })),
          dmsConfig: {
            ...defaultDMSConfig,
            lastLogin: Date.now()
          }
        });
        
        get().generateKeyFragments();
        
        get().addAuditEntry({
          action: 'Wallet Created',
          details: 'New wallet initialized with BIP-39 mnemonic',
          type: 'success'
        });
      },

      importWallet: async (mnemonic: string, password: string) => {
        const accounts = deriveMultipleAddresses(mnemonic, 1);
        const encrypted = await encryptData(mnemonic, password);
        
        set({
          mnemonic: encrypted.encrypted,
          password: hashData(password),
          isInitialized: true,
          isLocked: false,
          accounts: accounts.map((acc, i) => ({
            ...acc,
            balance: '0',
            name: i === 0 ? 'Imported Account' : `Account ${i + 1}`
          })),
          dmsConfig: {
            ...defaultDMSConfig,
            lastLogin: Date.now()
          }
        });
        
        get().generateKeyFragments();
        
        get().addAuditEntry({
          action: 'Wallet Imported',
          details: 'Existing wallet imported with mnemonic',
          type: 'success'
        });
      },

      unlockWallet: async (password: string) => {
        const state = get();
        if (state.password === hashData(password)) {
          set({ isLocked: false });
          get().addAuditEntry({
            action: 'Wallet Unlocked',
            details: 'User authenticated successfully',
            type: 'success'
          });
          return true;
        }
        get().addAuditEntry({
          action: 'Unlock Failed',
          details: 'Incorrect password attempt',
          type: 'warning'
        });
        return false;
      },

      lockWallet: () => {
        set({ isLocked: true });
        get().addAuditEntry({
          action: 'Wallet Locked',
          details: 'Session terminated',
          type: 'info'
        });
      },

      addAccount: (name?: string) => {
        const state = get();
        if (!state.mnemonic || state.isLocked) return;
        
        const newIndex = state.accounts.length;
        const newAccount = {
          index: newIndex,
          address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          privateKey: 'encrypted',
          balance: '0',
          name: name || `Account ${newIndex + 1}`
        };
        
        set({ accounts: [...state.accounts, newAccount] });
        get().addAuditEntry({
          action: 'Account Added',
          details: `New account created: ${newAccount.name}`,
          type: 'success'
        });
      },

      setActiveAccount: (index: number) => {
        set({ activeAccountIndex: index });
      },

      sendTransaction: async (to: string, amount: string, gasPrice?: string) => {
        const state = get();
        const activeAccount = state.getActiveAccount();
        
        if (!activeAccount) {
          throw new Error('No active account');
        }
        
        if (!isValidAddress(to)) {
          throw new Error('Invalid recipient address');
        }
        
        const tx: Transaction = {
          id: crypto.randomUUID(),
          hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          from: activeAccount.address,
          to,
          value: amount,
          gasPrice: gasPrice || '20',
          gasLimit: '21000',
          nonce: state.transactions.length,
          status: 'pending',
          timestamp: Date.now(),
          type: 'send'
        };
        
        set({
          pendingTransactions: [...state.pendingTransactions, tx]
        });
        
        setTimeout(() => {
          set(state => ({
            pendingTransactions: state.pendingTransactions.filter(t => t.id !== tx.id),
            transactions: [{
              ...tx,
              status: 'confirmed'
            }, ...state.transactions]
          }));
        }, 3000);
        
        get().addAuditEntry({
          action: 'Transaction Sent',
          details: `Sent ${amount} ETH to ${formatAddress(to)}`,
          type: 'success'
        });
        
        return tx;
      },

      addHeir: (heir) => {
        const state = get();
        const newHeir: Heir = {
          ...heir,
          id: crypto.randomUUID()
        };
        set({ heirs: [...state.heirs, newHeir] });
        get().generateKeyFragments();
        get().addAuditEntry({
          action: 'Heir Added',
          details: `New heir: ${newHeir.name}`,
          type: 'info'
        });
      },

      removeHeir: (id: string) => {
        const state = get();
        set({ heirs: state.heirs.filter(h => h.id !== id) });
        get().generateKeyFragments();
        get().addAuditEntry({
          action: 'Heir Removed',
          details: 'Heir removed from configuration',
          type: 'warning'
        });
      },

      addGuardian: (guardian) => {
        const state = get();
        const newGuardian: Guardian = {
          ...guardian,
          id: crypto.randomUUID()
        };
        set({ guardians: [...state.guardians, newGuardian] });
        get().generateKeyFragments();
        get().addAuditEntry({
          action: 'Guardian Added',
          details: `New guardian: ${newGuardian.name}`,
          type: 'info'
        });
      },

      removeGuardian: (id: string) => {
        const state = get();
        set({ guardians: state.guardians.filter(g => g.id !== id) });
      },

      updateDMSConfig: (config) => {
        const state = get();
        set({
          dmsConfig: { ...state.dmsConfig, ...config }
        });
      },

      addAuditEntry: (entry) => {
        const state = get();
        const newEntry: AuditEntry = {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        };
        set({
          auditTrail: [newEntry, ...state.auditTrail].slice(0, 1000)
        });
      },

      setActiveNetwork: (networkId: string) => {
        set({ activeNetworkId: networkId });
        get().addAuditEntry({
          action: 'Network Changed',
          details: `Switched to ${networkId}`,
          type: 'info'
        });
      },

      getActiveAccount: () => {
        const state = get();
        return state.accounts[state.activeAccountIndex] || null;
      },

      getActiveNetwork: () => {
        const state = get();
        return state.networks.find(n => n.id === state.activeNetworkId) || state.networks[0];
      },

      getBalance: () => {
        const account = get().getActiveAccount();
        return account?.balance || '0';
      },

      generateKeyFragments: () => {
        const state = get();
        if (!state.mnemonic) return;
        
        const testSecret = 'DAIO_WALLET_SECRET_' + state.mnemonic.slice(0, 32);
        const shares = splitSecret(testSecret, 5, 3);
        
        const fragments: KeyFragment[] = [
          {
            id: crypto.randomUUID(),
            holder: 'Sie (Backup)',
            type: 'self' as const,
            status: 'distributed' as const,
            encrypted: true,
            share: shares[0]
          }
        ];
        
        state.heirs.forEach((heir, i) => {
          if (fragments.length < 5) {
            fragments.push({
              id: crypto.randomUUID(),
              holder: heir.name,
              type: 'heir' as const,
              status: 'distributed' as const,
              encrypted: true,
              share: shares[i + 1]
            });
          }
        });
        
        state.guardians.forEach((guardian, i) => {
          if (fragments.length < 5) {
            fragments.push({
              id: crypto.randomUUID(),
              holder: guardian.name,
              type: guardian.role === 'Notar' ? 'notary' : 'guardian' as const,
              status: 'distributed' as const,
              encrypted: true,
              share: shares[i + 1 + state.heirs.length]
            });
          }
        });
        
        set({ keyFragments: fragments });
      }
    }),
    {
      name: 'daio-wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mnemonic: state.mnemonic,
        password: state.password,
        isInitialized: state.isInitialized,
        accounts: state.accounts.map(acc => ({
          ...acc,
          privateKey: 'encrypted'
        })),
        activeAccountIndex: state.activeAccountIndex,
        networks: state.networks,
        activeNetworkId: state.activeNetworkId,
        heirs: state.heirs,
        guardians: state.guardians,
        dmsConfig: state.dmsConfig,
        auditTrail: state.auditTrail,
        transactions: state.transactions
      })
    }
  )
);
