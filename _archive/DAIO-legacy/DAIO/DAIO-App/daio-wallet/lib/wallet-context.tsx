import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getBalance, getTokenPrice } from './blockchain';
import {
  WalletState,
  DEFAULT_STATE,
  MOCK_TOKENS,
  MOCK_TRANSACTIONS,
  MOCK_BENEFICIARIES,
  loadWalletState,
  saveWalletState,
  calculateDaiScore,
  UserRole,
} from './wallet-store';

interface WalletContextType {
  state: WalletState;
  isLoading: boolean;
  updateState: (updates: Partial<WalletState>) => Promise<void>;
  checkIn: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  setupWallet: (role: UserRole, pin: string) => Promise<void>;
  unlockWallet: (pin: string) => Promise<boolean>;
  addAuditEntry: (action: string, details: string, severity?: 'info' | 'warning' | 'critical') => void;
  resetWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  const updateState = useCallback(async (updates: Partial<WalletState>) => {
    let finalState: WalletState | undefined;
    setState(prev => {
      const next = { ...prev, ...updates };
      const newScore = calculateDaiScore(next);
      finalState = { ...next, daiScore: newScore };
      return finalState;
    });
    if (finalState) {
      await saveWalletState(finalState);
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background, lock it
        updateState({ isLocked: true });
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [updateState]);

  useEffect(() => {
    (async () => {
      const loaded = await loadWalletState();
      // Inject mock data for demo if wallet is set up
      if (loaded.isSetup && loaded.tokens.length === 0) {
        const totalUSD = MOCK_TOKENS.reduce((sum, t) => sum + t.balanceUSD, 0);
        const withMock = {
          ...loaded,
          tokens: MOCK_TOKENS,
          transactions: MOCK_TRANSACTIONS,
          beneficiaries: loaded.beneficiaries.length === 0 ? MOCK_BENEFICIARIES : loaded.beneficiaries,
          totalPortfolioUSD: totalUSD,
        };
        withMock.daiScore = calculateDaiScore(withMock);
        setState(withMock);
      } else {
        setState(loaded);
      }
      setIsLoading(false);
    })();
  }, []);

  const checkIn = useCallback(async () => {
    const now = Date.now();
    const intervalMs = state.deadManSwitch.intervalMonths * 30 * 24 * 60 * 60 * 1000;
    await updateState({
      lastLogin: now,
      deadManSwitch: {
        ...state.deadManSwitch,
        lastCheckIn: now,
        nextCheckIn: now + intervalMs,
        status: 'active',
        warningsSent: 0,
      },
    });
    addAuditEntry('PROOF_OF_LIFE', 'Benutzer hat sich erfolgreich eingeloggt (Check-In)', 'info');
  }, [state.deadManSwitch, updateState]);

  const refreshBalances = useCallback(async () => {
    if (!state.isSetup) return;
    
    // In a real app, you would iterate over all accounts and tokens
    // For this demo, we'll update the first account's balance if it exists
    const updatedTokens = await Promise.all(state.tokens.map(async (token) => {
      try {
        if (token.chain === 'ethereum' || token.chain === 'polygon' || token.chain === 'bnb' || token.chain === 'avalanche') {
          const price = await getTokenPrice(token.id);
          const newPrice = typeof price === 'number' ? price : token.price;
          return {
            ...token,
            price: newPrice,
            balanceUSD: token.balance * newPrice,
          };
        }
        return token;
      } catch {
        return token;
      }
    }));

    const totalUSD = updatedTokens.reduce((sum, t) => sum + t.balanceUSD, 0);
    await updateState({
      tokens: updatedTokens,
      totalPortfolioUSD: totalUSD,
    });
  }, [state.isSetup, state.tokens, updateState]);

  const setupWallet = useCallback(async (role: UserRole, pin: string) => {
    const totalUSD = MOCK_TOKENS.reduce((sum, t) => sum + t.balanceUSD, 0);
    const newState: WalletState = {
      ...DEFAULT_STATE,
      isSetup: true,
      isLocked: false,
      userRole: role,
      pinHash: pin, // In production: hash with bcrypt
      lastLogin: Date.now(),
      tokens: MOCK_TOKENS,
      transactions: MOCK_TRANSACTIONS,
      beneficiaries: MOCK_BENEFICIARIES,
      totalPortfolioUSD: totalUSD,
      deadManSwitch: {
        ...DEFAULT_STATE.deadManSwitch,
        lastCheckIn: Date.now(),
        nextCheckIn: Date.now() + 6 * 30 * 24 * 60 * 60 * 1000,
      },
    };
    newState.daiScore = calculateDaiScore(newState);
    await saveWalletState(newState);
    setState(newState);
  }, []);

  const unlockWallet = useCallback(async (pin: string) => {
    if (state.pinHash === pin) {
      await updateState({ isLocked: false, lastLogin: Date.now() });
      return true;
    }
    return false;
  }, [state.pinHash, updateState]);

  const addAuditEntry = useCallback((action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      action,
      actor: state.userRole,
      details,
      severity,
    };
    setState(prev => {
      const next = {
        ...prev,
        auditLog: [entry, ...prev.auditLog].slice(0, 500), // Keep last 500 entries
      };
      saveWalletState(next);
      return next;
    });
  }, [state.userRole]);

  const resetWallet = useCallback(async () => {
    await saveWalletState(DEFAULT_STATE);
    setState(DEFAULT_STATE);
  }, []);

  return (
    <WalletContext.Provider value={{
      state,
      isLoading,
      updateState,
      checkIn,
      refreshBalances,
      setupWallet,
      unlockWallet,
      addAuditEntry,
      resetWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
