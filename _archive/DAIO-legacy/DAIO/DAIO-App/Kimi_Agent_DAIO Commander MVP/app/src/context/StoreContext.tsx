// DAIO Commander - Store Context (shared singleton state)
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

const generateId = () => Math.random().toString(36).substring(2, 9);

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

const STORAGE_KEY = 'daio-commander-data';
const BRAND_KEY = 'daio-brand-mode';

export interface StoreState {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  brandMode: BrandMode;
  toggleBrandMode: () => void;
  currentCase: ClientCase;
  updateCaseName: (name: string) => void;
  addBitcoinAsset: (asset: Omit<BitcoinAsset, 'id'>) => void;
  removeBitcoinAsset: (id: string) => void;
  updateBitcoinAsset: (id: string, asset: Partial<BitcoinAsset>) => void;
  addEthereumAsset: (asset: Omit<EthereumAsset, 'id'>) => void;
  removeEthereumAsset: (id: string) => void;
  updateEthereumAsset: (id: string, asset: Partial<EthereumAsset>) => void;
  addStablecoinAsset: (asset: Omit<StablecoinAsset, 'id'>) => void;
  removeStablecoinAsset: (id: string) => void;
  updateStablecoinAsset: (id: string, asset: Partial<StablecoinAsset>) => void;
  addNFTAsset: (asset: Omit<NFTAsset, 'id'>) => void;
  removeNFTAsset: (id: string) => void;
  updateNFTAsset: (id: string, asset: Partial<NFTAsset>) => void;
  addGamingAsset: (asset: Omit<GamingAsset, 'id'>) => void;
  removeGamingAsset: (id: string) => void;
  updateGamingAsset: (id: string, asset: Partial<GamingAsset>) => void;
  getTotalValue: () => number;
  getCryptoValue: () => number;
  getNFTValue: () => number;
  getGamingValue: () => number;
  getAssetClassCount: () => number;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  resetCase: () => void;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [brandMode, setBrandMode] = useState<BrandMode>('back2iq');
  const [currentCase, setCurrentCase] = useState<ClientCase>(createEmptyCase());

  const loadFromStorage = useCallback(() => {
    try {
      const savedCase = localStorage.getItem(STORAGE_KEY);
      const savedBrand = localStorage.getItem(BRAND_KEY);
      if (savedCase) setCurrentCase(JSON.parse(savedCase));
      if (savedBrand && (savedBrand === 'back2iq' || savedBrand === 'fp')) {
        setBrandMode(savedBrand as BrandMode);
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }, []);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCase));
      localStorage.setItem(BRAND_KEY, brandMode);
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }, [currentCase, brandMode]);

  useEffect(() => { saveToStorage(); }, [saveToStorage]);

  const toggleBrandMode = useCallback(() => {
    setBrandMode(prev => prev === 'back2iq' ? 'fp' : 'back2iq');
  }, []);

  const updateCaseName = useCallback((name: string) => {
    setCurrentCase(prev => ({ ...prev, name }));
  }, []);

  const resetCase = useCallback(() => { setCurrentCase(createEmptyCase()); }, []);

  const addBitcoinAsset = useCallback((asset: Omit<BitcoinAsset, 'id'>) => {
    setCurrentCase(prev => ({ ...prev, bitcoinAssets: [...prev.bitcoinAssets, { ...asset, id: generateId() }] }));
  }, []);
  const removeBitcoinAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({ ...prev, bitcoinAssets: prev.bitcoinAssets.filter(a => a.id !== id) }));
  }, []);
  const updateBitcoinAsset = useCallback((id: string, asset: Partial<BitcoinAsset>) => {
    setCurrentCase(prev => ({ ...prev, bitcoinAssets: prev.bitcoinAssets.map(a => a.id === id ? { ...a, ...asset } : a) }));
  }, []);

  const addEthereumAsset = useCallback((asset: Omit<EthereumAsset, 'id'>) => {
    setCurrentCase(prev => ({ ...prev, ethereumAssets: [...prev.ethereumAssets, { ...asset, id: generateId() }] }));
  }, []);
  const removeEthereumAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({ ...prev, ethereumAssets: prev.ethereumAssets.filter(a => a.id !== id) }));
  }, []);
  const updateEthereumAsset = useCallback((id: string, asset: Partial<EthereumAsset>) => {
    setCurrentCase(prev => ({ ...prev, ethereumAssets: prev.ethereumAssets.map(a => a.id === id ? { ...a, ...asset } : a) }));
  }, []);

  const addStablecoinAsset = useCallback((asset: Omit<StablecoinAsset, 'id'>) => {
    setCurrentCase(prev => ({ ...prev, stablecoinAssets: [...prev.stablecoinAssets, { ...asset, id: generateId() }] }));
  }, []);
  const removeStablecoinAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({ ...prev, stablecoinAssets: prev.stablecoinAssets.filter(a => a.id !== id) }));
  }, []);
  const updateStablecoinAsset = useCallback((id: string, asset: Partial<StablecoinAsset>) => {
    setCurrentCase(prev => ({ ...prev, stablecoinAssets: prev.stablecoinAssets.map(a => a.id === id ? { ...a, ...asset } : a) }));
  }, []);

  const addNFTAsset = useCallback((asset: Omit<NFTAsset, 'id'>) => {
    setCurrentCase(prev => ({ ...prev, nftAssets: [...prev.nftAssets, { ...asset, id: generateId() }] }));
  }, []);
  const removeNFTAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({ ...prev, nftAssets: prev.nftAssets.filter(a => a.id !== id) }));
  }, []);
  const updateNFTAsset = useCallback((id: string, asset: Partial<NFTAsset>) => {
    setCurrentCase(prev => ({ ...prev, nftAssets: prev.nftAssets.map(a => a.id === id ? { ...a, ...asset } : a) }));
  }, []);

  const addGamingAsset = useCallback((asset: Omit<GamingAsset, 'id'>) => {
    setCurrentCase(prev => ({ ...prev, gamingAssets: [...prev.gamingAssets, { ...asset, id: generateId() }] }));
  }, []);
  const removeGamingAsset = useCallback((id: string) => {
    setCurrentCase(prev => ({ ...prev, gamingAssets: prev.gamingAssets.filter(a => a.id !== id) }));
  }, []);
  const updateGamingAsset = useCallback((id: string, asset: Partial<GamingAsset>) => {
    setCurrentCase(prev => ({ ...prev, gamingAssets: prev.gamingAssets.map(a => a.id === id ? { ...a, ...asset } : a) }));
  }, []);

  const getCryptoValue = useCallback(() => {
    return currentCase.bitcoinAssets.reduce((s, a) => s + (a.value || 0), 0)
      + currentCase.ethereumAssets.reduce((s, a) => s + (a.value || 0), 0)
      + currentCase.stablecoinAssets.reduce((s, a) => s + (a.value || 0), 0);
  }, [currentCase]);

  const getNFTValue = useCallback(() =>
    currentCase.nftAssets.reduce((s, a) => s + (a.estimatedValue || 0), 0), [currentCase]);

  const getGamingValue = useCallback(() =>
    currentCase.gamingAssets.reduce((s, a) => s + (a.estimatedValue || 0), 0), [currentCase]);

  const getTotalValue = useCallback(() =>
    getCryptoValue() + getNFTValue() + getGamingValue(), [getCryptoValue, getNFTValue, getGamingValue]);

  const getAssetClassCount = useCallback(() => {
    let count = 0;
    if (currentCase.bitcoinAssets.length > 0) count++;
    if (currentCase.ethereumAssets.length > 0) count++;
    if (currentCase.stablecoinAssets.length > 0) count++;
    if (currentCase.nftAssets.length > 0) count++;
    if (currentCase.gamingAssets.length > 0) count++;
    return count;
  }, [currentCase]);

  return (
    <StoreContext.Provider value={{
      currentPage, setCurrentPage, brandMode, toggleBrandMode,
      currentCase, updateCaseName, resetCase,
      addBitcoinAsset, removeBitcoinAsset, updateBitcoinAsset,
      addEthereumAsset, removeEthereumAsset, updateEthereumAsset,
      addStablecoinAsset, removeStablecoinAsset, updateStablecoinAsset,
      addNFTAsset, removeNFTAsset, updateNFTAsset,
      addGamingAsset, removeGamingAsset, updateGamingAsset,
      getTotalValue, getCryptoValue, getNFTValue, getGamingValue, getAssetClassCount,
      saveToStorage, loadFromStorage,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
