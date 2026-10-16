// DAIO Commander Big Five - Shared Global State via React Context
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  BrandMode,
  ClientCase,
  BitcoinAsset,
  EthereumAsset,
  StablecoinAsset,
  NFTAsset,
  GamingAsset,
  PageType,
} from '@/types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Create empty case
const createEmptyCase = (): ClientCase => ({
  id: generateId(),
  name: '',
  createdAt: new Date().toISOString(),
  bitcoinAssets: [],
  ethereumAssets: [],
  stablecoinAssets: [],
  nftAssets: [],
  gamingAssets: [],
});

// Storage keys
const STORAGE_KEY = 'daio-commander-bigfive-data';
const BRAND_KEY = 'daio-brand-mode-bigfive';

export interface StoreState {
  // Navigation
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;

  // Branding
  brandMode: BrandMode;
  toggleBrandMode: () => void;

  // Current Case
  currentCase: ClientCase;
  updateCaseName: (name: string) => void;

  // Bitcoin
  addBitcoinAsset: (asset: Omit<BitcoinAsset, 'id'>) => void;
  removeBitcoinAsset: (id: string) => void;
  updateBitcoinAsset: (id: string, asset: Partial<BitcoinAsset>) => void;

  // Ethereum
  addEthereumAsset: (asset: Omit<EthereumAsset, 'id'>) => void;
  removeEthereumAsset: (id: string) => void;
  updateEthereumAsset: (id: string, asset: Partial<EthereumAsset>) => void;

  // Stablecoins
  addStablecoinAsset: (asset: Omit<StablecoinAsset, 'id'>) => void;
  removeStablecoinAsset: (id: string) => void;
  updateStablecoinAsset: (id: string, asset: Partial<StablecoinAsset>) => void;

  // NFTs
  addNFTAsset: (asset: Omit<NFTAsset, 'id'>) => void;
  removeNFTAsset: (id: string) => void;
  updateNFTAsset: (id: string, asset: Partial<NFTAsset>) => void;

  // Gaming
  addGamingAsset: (asset: Omit<GamingAsset, 'id'>) => void;
  removeGamingAsset: (id: string) => void;
  updateGamingAsset: (id: string, asset: Partial<GamingAsset>) => void;

  // Calculations
  getTotalValue: () => number;
  getCryptoValue: () => number;
  getNFTValue: () => number;
  getGamingValue: () => number;
  getAssetClassCount: () => number;

  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
  resetCase: () => void;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  // Brand state
  const [brandMode, setBrandMode] = useState<BrandMode>('back2iq');

  // Case state
  const [currentCase, setCurrentCase] = useState<ClientCase>(createEmptyCase());

  // Load from storage helper
  const loadFromStorage = useCallback(() => {
    try {
      const savedCase = localStorage.getItem(STORAGE_KEY);
      const savedBrand = localStorage.getItem(BRAND_KEY);
      if (savedCase) setCurrentCase(JSON.parse(savedCase));
      if (savedBrand && (savedBrand === 'back2iq' || savedBrand === 'fp')) {
        setBrandMode(savedBrand);
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Save to storage helper
  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCase));
      localStorage.setItem(BRAND_KEY, brandMode);
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }, [currentCase, brandMode]);

  // Auto-save on changes
  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  // Brand toggle
  const toggleBrandMode = useCallback(() => {
    setBrandMode(prev => (prev === 'back2iq' ? 'fp' : 'back2iq'));
  }, []);

  // Case name update
  const updateCaseName = useCallback((name: string) => {
    setCurrentCase(prev => ({ ...prev, name }));
  }, []);

  // Reset case
  const resetCase = useCallback(() => {
    setCurrentCase(createEmptyCase());
  }, []);

  // Bitcoin operations
  const addBitcoinAsset = useCallback((asset: Omit<BitcoinAsset, 'id'>) => {
    setCurrentCase(prev => ({
      ...prev,
      bitcoinAssets: [...prev.bitcoinAssets, { ...asset, id: generateId() }],
    }));
  }, []);

  const removeBitcoinAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({
      ...prev,
      bitcoinAssets: prev.bitcoinAssets.filter(a => a.id !== id),
    }));
  }, []);

  const updateBitcoinAsset = useCallback((id: string, asset: Partial<BitcoinAsset>) => {
    setCurrentCase(prev => ({
      ...prev,
      bitcoinAssets: prev.bitcoinAssets.map(a => (a.id === id ? { ...a, ...asset } : a)),
    }));
  }, []);

  // Ethereum operations
  const addEthereumAsset = useCallback((asset: Omit<EthereumAsset, 'id'>) => {
    setCurrentCase(prev => ({
      ...prev,
      ethereumAssets: [...prev.ethereumAssets, { ...asset, id: generateId() }],
    }));
  }, []);

  const removeEthereumAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({
      ...prev,
      ethereumAssets: prev.ethereumAssets.filter(a => a.id !== id),
    }));
  }, []);

  const updateEthereumAsset = useCallback((id: string, asset: Partial<EthereumAsset>) => {
    setCurrentCase(prev => ({
      ...prev,
      ethereumAssets: prev.ethereumAssets.map(a => (a.id === id ? { ...a, ...asset } : a)),
    }));
  }, []);

  // Stablecoin operations
  const addStablecoinAsset = useCallback((asset: Omit<StablecoinAsset, 'id'>) => {
    setCurrentCase(prev => ({
      ...prev,
      stablecoinAssets: [...prev.stablecoinAssets, { ...asset, id: generateId() }],
    }));
  }, []);

  const removeStablecoinAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({
      ...prev,
      stablecoinAssets: prev.stablecoinAssets.filter(a => a.id !== id),
    }));
  }, []);

  const updateStablecoinAsset = useCallback((id: string, asset: Partial<StablecoinAsset>) => {
    setCurrentCase(prev => ({
      ...prev,
      stablecoinAssets: prev.stablecoinAssets.map(a => (a.id === id ? { ...a, ...asset } : a)),
    }));
  }, []);

  // NFT operations
  const addNFTAsset = useCallback((asset: Omit<NFTAsset, 'id'>) => {
    setCurrentCase(prev => ({
      ...prev,
      nftAssets: [...prev.nftAssets, { ...asset, id: generateId() }],
    }));
  }, []);

  const removeNFTAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({
      ...prev,
      nftAssets: prev.nftAssets.filter(a => a.id !== id),
    }));
  }, []);

  const updateNFTAsset = useCallback((id: string, asset: Partial<NFTAsset>) => {
    setCurrentCase(prev => ({
      ...prev,
      nftAssets: prev.nftAssets.map(a => (a.id === id ? { ...a, ...asset } : a)),
    }));
  }, []);

  // Gaming operations
  const addGamingAsset = useCallback((asset: Omit<GamingAsset, 'id'>) => {
    setCurrentCase(prev => ({
      ...prev,
      gamingAssets: [...prev.gamingAssets, { ...asset, id: generateId() }],
    }));
  }, []);

  const removeGamingAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({
      ...prev,
      gamingAssets: prev.gamingAssets.filter(a => a.id !== id),
    }));
  }, []);

  const updateGamingAsset = useCallback((id: string, asset: Partial<GamingAsset>) => {
    setCurrentCase(prev => ({
      ...prev,
      gamingAssets: prev.gamingAssets.map(a => (a.id === id ? { ...a, ...asset } : a)),
    }));
  }, []);

  // Calculations
  const getCryptoValue = useCallback(() => {
    const btc = currentCase.bitcoinAssets.reduce((sum, a) => sum + (a.value || 0), 0);
    const eth = currentCase.ethereumAssets.reduce((sum, a) => sum + (a.value || 0), 0);
    const stable = currentCase.stablecoinAssets.reduce((sum, a) => sum + (a.value || 0), 0);
    return btc + eth + stable;
  }, [currentCase]);

  const getNFTValue = useCallback(() => {
    return currentCase.nftAssets.reduce((sum, a) => sum + (a.estimatedValue || 0), 0);
  }, [currentCase]);

  const getGamingValue = useCallback(() => {
    return currentCase.gamingAssets.reduce((sum, a) => sum + (a.estimatedValue || 0), 0);
  }, [currentCase]);

  const getTotalValue = useCallback(() => {
    return getCryptoValue() + getNFTValue() + getGamingValue();
  }, [getCryptoValue, getNFTValue, getGamingValue]);

  const getAssetClassCount = useCallback(() => {
    let count = 0;
    if (currentCase.bitcoinAssets.length > 0) count++;
    if (currentCase.ethereumAssets.length > 0) count++;
    if (currentCase.stablecoinAssets.length > 0) count++;
    if (currentCase.nftAssets.length > 0) count++;
    if (currentCase.gamingAssets.length > 0) count++;
    return count;
  }, [currentCase]);

  const value: StoreState = {
    currentPage,
    setCurrentPage,
    brandMode,
    toggleBrandMode,
    currentCase,
    updateCaseName,
    addBitcoinAsset,
    removeBitcoinAsset,
    updateBitcoinAsset,
    addEthereumAsset,
    removeEthereumAsset,
    updateEthereumAsset,
    addStablecoinAsset,
    removeStablecoinAsset,
    updateStablecoinAsset,
    addNFTAsset,
    removeNFTAsset,
    updateNFTAsset,
    addGamingAsset,
    removeGamingAsset,
    updateGamingAsset,
    getTotalValue,
    getCryptoValue,
    getNFTValue,
    getGamingValue,
    getAssetClassCount,
    saveToStorage,
    loadFromStorage,
    resetCase,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
