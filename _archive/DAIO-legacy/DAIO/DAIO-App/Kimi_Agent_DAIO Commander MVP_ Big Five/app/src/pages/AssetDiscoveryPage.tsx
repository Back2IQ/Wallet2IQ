// DAIO Commander - Asset Discovery Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/hooks/useStore';
import { brandConfigs } from '@/config/branding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bitcoin,
  Coins,
  DollarSign,
  Image,
  Gamepad2,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Check,
  Wallet,
  Shield,
} from 'lucide-react';
import type { WalletType, Platform, NFTSource, NFTUtility, GamingPlatform, LiquidationWindow } from '@/types';

export function AssetDiscoveryPage() {
  const { brandMode, currentCase, getTotalValue, getAssetClassCount } = useStore();
  const brand = brandConfigs[brandMode];
  const [activeTab, setActiveTab] = useState('bitcoin');

  const assetClasses = [
    { id: 'bitcoin', name: 'Bitcoin', icon: Bitcoin, count: currentCase.bitcoinAssets.length, color: '#f7931a' },
    { id: 'ethereum', name: 'Ethereum', icon: Coins, count: currentCase.ethereumAssets.length, color: '#627eea' },
    { id: 'stablecoins', name: 'Stablecoins', icon: DollarSign, count: currentCase.stablecoinAssets.length, color: '#27ae60' },
    { id: 'nfts', name: 'NFTs', icon: Image, count: currentCase.nftAssets.length, color: '#9b59b6', isNew: true },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, count: currentCase.gamingAssets.length, color: '#e74c3c', isNew: true },
  ];

  return (
    <div className="asset-discovery-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 style={{ color: brand.colors.text }}>Asset Discovery</h1>
          <p style={{ color: brand.colors.textMuted }}>
            Erfassen Sie alle fünf Asset-Klassen Ihres Mandanten
          </p>
        </div>
        <div className="header-stats">
          <div 
            className="stat-pill"
            style={{ background: `rgba(6, 182, 212, 0.15)` }}
          >
            <span style={{ color: brand.colors.secondary }}>
              {getAssetClassCount()}/5 Klassen
            </span>
          </div>
          <div 
            className="stat-pill"
            style={{ background: `rgba(34, 197, 94, 0.15)` }}
          >
            <Wallet size={16} style={{ color: '#22c55e' }} />
            <span style={{ color: '#22c55e' }}>
              €{getTotalValue().toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="progress-section"
      >
        <div className="progress-header">
          <span style={{ color: brand.colors.textMuted }}>Erfassungsfortschritt</span>
          <span style={{ color: brand.colors.secondary }}>
            {Math.round((getAssetClassCount() / 5) * 100)}%
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(getAssetClassCount() / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Asset Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="asset-tabs">
        <TabsList className="tabs-list">
          {assetClasses.map((asset) => {
            const Icon = asset.icon;
            return (
              <TabsTrigger
                key={asset.id}
                value={asset.id}
                className="tab-trigger"
              >
                <Icon size={18} style={{ color: asset.color }} />
                <span>{asset.name}</span>
                {asset.count > 0 && (
                  <span 
                    className="tab-badge"
                    style={{ background: asset.color }}
                  >
                    {asset.count}
                  </span>
                )}
                {asset.isNew && (
                  <span 
                    className="tab-new"
                    style={{ background: '#f59e0b' }}
                  >
                    NEU
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="bitcoin" className="tab-content">
          <BitcoinForm />
        </TabsContent>

        <TabsContent value="ethereum" className="tab-content">
          <EthereumForm />
        </TabsContent>

        <TabsContent value="stablecoins" className="tab-content">
          <StablecoinForm />
        </TabsContent>

        <TabsContent value="nfts" className="tab-content">
          <NFTForm />
        </TabsContent>

        <TabsContent value="gaming" className="tab-content">
          <GamingForm />
        </TabsContent>
      </Tabs>

      <style>{`
        .asset-discovery-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .header-stats {
          display: flex;
          gap: 12px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .progress-section {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 12px;
          padding: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.875rem;
        }

        .asset-tabs {
          margin-top: 8px;
        }

        .tabs-list {
          display: flex;
          gap: 8px;
          background: rgba(30, 41, 59, 0.5);
          padding: 8px;
          border-radius: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .tab-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--brand-text-muted);
          cursor: pointer;
          font-weight: 500;
          position: relative;
          transition: all 0.2s ease;
        }

        .tab-trigger:hover {
          background: rgba(148, 163, 184, 0.1);
        }

        .tab-trigger[data-state="active"] {
          background: rgba(6, 182, 212, 0.15);
          color: var(--brand-text);
        }

        .tab-badge {
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.625rem;
          color: white;
          font-weight: 600;
        }

        .tab-new {
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.5rem;
          color: white;
          font-weight: 700;
        }

        .tab-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Bitcoin Form Component
function BitcoinForm() {
  const { brandMode, currentCase, addBitcoinAsset, removeBitcoinAsset } = useStore();
  const brand = brandConfigs[brandMode];
  const [formData, setFormData] = useState({
    walletType: 'hardware' as WalletType,
    address: '',
    value: '',
    storageLocation: '',
    lastActivity: '',
  });

  const handleSubmit = () => {
    if (!formData.address || !formData.value) return;
    addBitcoinAsset({
      walletType: formData.walletType,
      address: formData.address,
      value: parseFloat(formData.value),
      storageLocation: formData.storageLocation,
      lastActivity: formData.lastActivity || new Date().toISOString().split('T')[0],
    });
    setFormData({
      walletType: 'hardware',
      address: '',
      value: '',
      storageLocation: '',
      lastActivity: '',
    });
  };

  return (
    <div className="asset-form">
      <div className="form-header">
        <div className="form-icon" style={{ background: 'rgba(247, 147, 26, 0.15)', color: '#f7931a' }}>
          <Bitcoin size={28} />
        </div>
        <div>
          <h3 style={{ color: brand.colors.text }}>Bitcoin (BTC)</h3>
          <p style={{ color: brand.colors.textMuted }}>
            Vollständige Erfassung aller Bitcoin-Wallets
          </p>
        </div>
        <div className="status-badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
          <Check size={14} />
          Produktionsreif
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <Label>Wallet-Typ</Label>
          <Select 
            value={formData.walletType} 
            onValueChange={(v) => setFormData({ ...formData, walletType: v as WalletType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hardware">Hardware Wallet (Ledger/Trezor)</SelectItem>
              <SelectItem value="software">Software Wallet</SelectItem>
              <SelectItem value="exchange">Exchange (Coinbase/Binance)</SelectItem>
              <SelectItem value="custody">Custody Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field">
          <Label>Wallet-Adresse</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="bc1q..."
            className="mono"
          />
        </div>

        <div className="form-field">
          <Label>Geschätzter Wert (€)</Label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="50000"
          />
        </div>

        <div className="form-field">
          <Label>Seed-Phrase Speicherort</Label>
          <Input
            value={formData.storageLocation}
            onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
            placeholder="Tresor, Bankfach, etc."
          />
        </div>

        <div className="form-field">
          <Label>Letzte Aktivität</Label>
          <Input
            type="date"
            value={formData.lastActivity}
            onChange={(e) => setFormData({ ...formData, lastActivity: e.target.value })}
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        className="add-btn"
        style={{ background: '#f7931a', color: 'white' }}
      >
        <Plus size={18} />
        Bitcoin-Wallet hinzufügen
      </Button>

      {/* Asset List */}
      {currentCase.bitcoinAssets.length > 0 && (
        <div className="asset-list">
          <h4 style={{ color: brand.colors.text }}>Erfasste Wallets</h4>
          {currentCase.bitcoinAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="asset-item"
            >
              <div className="asset-info">
                <Bitcoin size={20} style={{ color: '#f7931a' }} />
                <div>
                  <p className="mono" style={{ color: brand.colors.text }}>
                    {asset.address.slice(0, 12)}...{asset.address.slice(-8)}
                  </p>
                  <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                    {asset.walletType === 'hardware' && 'Hardware Wallet'}
                    {asset.walletType === 'software' && 'Software Wallet'}
                    {asset.walletType === 'exchange' && 'Exchange'}
                    {asset.walletType === 'custody' && 'Custody'}
                  </p>
                </div>
              </div>
              <div className="asset-value">
                <span style={{ color: '#f7931a', fontWeight: 600 }}>
                  €{asset.value.toLocaleString()}
                </span>
                <button
                  onClick={() => removeBitcoinAsset(asset.id)}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        .asset-form {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          padding: 24px;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-header h3 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .status-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .add-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
        }

        .asset-list {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .asset-list h4 {
          margin-bottom: 16px;
        }

        .asset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .asset-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .asset-value {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .delete-btn {
          background: none;
          border: none;
          color: var(--brand-text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Ethereum Form Component
function EthereumForm() {
  const { brandMode, currentCase, addEthereumAsset, removeEthereumAsset } = useStore();
  const brand = brandConfigs[brandMode];
  const [formData, setFormData] = useState({
    walletType: 'hardware' as WalletType,
    address: '',
    value: '',
    hasSmartContract: null as boolean | null,
    storageLocation: '',
    lastActivity: '',
  });

  const handleSubmit = () => {
    if (!formData.address || !formData.value) return;
    addEthereumAsset({
      walletType: formData.walletType,
      address: formData.address,
      value: parseFloat(formData.value),
      hasSmartContract: formData.hasSmartContract,
      storageLocation: formData.storageLocation,
      lastActivity: formData.lastActivity || new Date().toISOString().split('T')[0],
    });
    setFormData({
      walletType: 'hardware',
      address: '',
      value: '',
      hasSmartContract: null,
      storageLocation: '',
      lastActivity: '',
    });
  };

  return (
    <div className="asset-form">
      <div className="form-header">
        <div className="form-icon" style={{ background: 'rgba(98, 126, 234, 0.15)', color: '#627eea' }}>
          <Coins size={28} />
        </div>
        <div>
          <h3 style={{ color: brand.colors.text }}>Ethereum (ETH)</h3>
          <p style={{ color: brand.colors.textMuted }}>
            Inklusive Smart Contract-Interaktions-Check
          </p>
        </div>
        <div className="status-badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
          <Check size={14} />
          Produktionsreif
        </div>
      </div>

      <div className="info-box" style={{ background: 'rgba(98, 126, 234, 0.1)', border: '1px solid rgba(98, 126, 234, 0.2)' }}>
        <Info size={18} style={{ color: '#627eea', flexShrink: 0 }} />
        <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
          Für komplexe DeFi-Positionen (Liquiditätsmining, Yield Farming): 
          <strong style={{ color: brand.colors.text }}> Berater-Konsultation erforderlich</strong>
        </p>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <Label>Wallet-Typ</Label>
          <Select 
            value={formData.walletType} 
            onValueChange={(v) => setFormData({ ...formData, walletType: v as WalletType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hardware">Hardware Wallet</SelectItem>
              <SelectItem value="software">Software Wallet (MetaMask)</SelectItem>
              <SelectItem value="exchange">Exchange</SelectItem>
              <SelectItem value="custody">Custody</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field">
          <Label>Wallet-Adresse</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="0x..."
            className="mono"
          />
        </div>

        <div className="form-field">
          <Label>Geschätzter Wert (€)</Label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="35000"
          />
        </div>

        <div className="form-field">
          <Label>Smart Contract Interaktion</Label>
          <Select 
            value={formData.hasSmartContract === null ? 'unknown' : formData.hasSmartContract ? 'yes' : 'no'} 
            onValueChange={(v) => setFormData({ 
              ...formData, 
              hasSmartContract: v === 'unknown' ? null : v === 'yes'
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Unbekannt</SelectItem>
              <SelectItem value="yes">Ja (DeFi/NFTs)</SelectItem>
              <SelectItem value="no">Nein (Nur Holdings)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field">
          <Label>Seed-Phrase Speicherort</Label>
          <Input
            value={formData.storageLocation}
            onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
            placeholder="Tresor, Bankfach, etc."
          />
        </div>

        <div className="form-field">
          <Label>Letzte Aktivität</Label>
          <Input
            type="date"
            value={formData.lastActivity}
            onChange={(e) => setFormData({ ...formData, lastActivity: e.target.value })}
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        className="add-btn"
        style={{ background: '#627eea', color: 'white' }}
      >
        <Plus size={18} />
        Ethereum-Wallet hinzufügen
      </Button>

      {currentCase.ethereumAssets.length > 0 && (
        <div className="asset-list">
          <h4 style={{ color: brand.colors.text }}>Erfasste Wallets</h4>
          {currentCase.ethereumAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="asset-item"
            >
              <div className="asset-info">
                <Coins size={20} style={{ color: '#627eea' }} />
                <div>
                  <p className="mono" style={{ color: brand.colors.text }}>
                    {asset.address.slice(0, 12)}...{asset.address.slice(-8)}
                  </p>
                  <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                    {asset.hasSmartContract === true && 'Smart Contracts aktiv'}
                    {asset.hasSmartContract === false && 'Keine Smart Contracts'}
                    {asset.hasSmartContract === null && 'Unbekannt'}
                  </p>
                </div>
              </div>
              <div className="asset-value">
                <span style={{ color: '#627eea', fontWeight: 600 }}>
                  €{asset.value.toLocaleString()}
                </span>
                <button
                  onClick={() => removeEthereumAsset(asset.id)}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        .info-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

// Stablecoin Form Component
function StablecoinForm() {
  const { brandMode, currentCase, addStablecoinAsset, removeStablecoinAsset } = useStore();
  const brand = brandConfigs[brandMode];
  const [formData, setFormData] = useState({
    type: 'USDC' as 'USDC' | 'USDT' | 'DAI',
    platform: 'ethereum' as Platform,
    value: '',
    walletAddress: '',
  });

  const handleSubmit = () => {
    if (!formData.walletAddress || !formData.value) return;
    addStablecoinAsset({
      type: formData.type,
      platform: formData.platform,
      value: parseFloat(formData.value),
      walletAddress: formData.walletAddress,
    });
    setFormData({
      type: 'USDC',
      platform: 'ethereum',
      value: '',
      walletAddress: '',
    });
  };

  return (
    <div className="asset-form">
      <div className="form-header">
        <div className="form-icon" style={{ background: 'rgba(39, 174, 96, 0.15)', color: '#27ae60' }}>
          <DollarSign size={28} />
        </div>
        <div>
          <h3 style={{ color: brand.colors.text }}>Stablecoins</h3>
          <p style={{ color: brand.colors.textMuted }}>
            USDC, USDT, DAI nach Plattform
          </p>
        </div>
        <div className="status-badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
          <Check size={14} />
          Produktionsreif
        </div>
      </div>

      <div className="info-box" style={{ background: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.2)' }}>
        <Shield size={18} style={{ color: '#27ae60', flexShrink: 0 }} />
        <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
          Stablecoins reduzieren die Volatilität im Erbfolge-Portfolio und ermöglichen 
          schnellere Liquidation.
        </p>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <Label>Stablecoin-Typ</Label>
          <Select 
            value={formData.type} 
            onValueChange={(v) => setFormData({ ...formData, type: v as 'USDC' | 'USDT' | 'DAI' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
              <SelectItem value="USDT">USDT (Tether)</SelectItem>
              <SelectItem value="DAI">DAI (MakerDAO)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field">
          <Label>Plattform</Label>
          <Select 
            value={formData.platform} 
            onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum (ERC-20)</SelectItem>
              <SelectItem value="solana">Solana (SPL)</SelectItem>
              <SelectItem value="bsc">Binance Smart Chain</SelectItem>
              <SelectItem value="other">Andere</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field">
          <Label>Wallet-Adresse</Label>
          <Input
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            placeholder="0x..."
            className="mono"
          />
        </div>

        <div className="form-field">
          <Label>Wert (€)</Label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="100000"
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        className="add-btn"
        style={{ background: '#27ae60', color: 'white' }}
      >
        <Plus size={18} />
        Stablecoin hinzufügen
      </Button>

      {currentCase.stablecoinAssets.length > 0 && (
        <div className="asset-list">
          <h4 style={{ color: brand.colors.text }}>Erfasste Stablecoins</h4>
          {currentCase.stablecoinAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="asset-item"
            >
              <div className="asset-info">
                <DollarSign size={20} style={{ color: '#27ae60' }} />
                <div>
                  <p style={{ color: brand.colors.text, fontWeight: 500 }}>
                    {asset.type}
                  </p>
                  <p className="mono" style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                    {asset.walletAddress.slice(0, 12)}...{asset.walletAddress.slice(-8)}
                  </p>
                </div>
              </div>
              <div className="asset-value">
                <span style={{ color: '#27ae60', fontWeight: 600 }}>
                  €{asset.value.toLocaleString()}
                </span>
                <button
                  onClick={() => removeStablecoinAsset(asset.id)}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// NFT Form Component
function NFTForm() {
  const { brandMode, currentCase, addNFTAsset, removeNFTAsset } = useStore();
  const brand = brandConfigs[brandMode];
  const [formData, setFormData] = useState({
    collectionName: '',
    tokenId: '',
    estimatedValue: '',
    source: 'opensea' as NFTSource,
    walletAddress: '',
    utilities: [] as NFTUtility[],
  });

  const handleUtilityToggle = (utility: NFTUtility) => {
    setFormData({
      ...formData,
      utilities: formData.utilities.includes(utility)
        ? formData.utilities.filter(u => u !== utility)
        : [...formData.utilities, utility]
    });
  };

  const handleSubmit = () => {
    if (!formData.collectionName || !formData.estimatedValue) return;
    addNFTAsset({
      collectionName: formData.collectionName,
      tokenId: formData.tokenId,
      estimatedValue: parseFloat(formData.estimatedValue),
      source: formData.source,
      walletAddress: formData.walletAddress,
      utilities: formData.utilities,
    });
    setFormData({
      collectionName: '',
      tokenId: '',
      estimatedValue: '',
      source: 'opensea',
      walletAddress: '',
      utilities: [],
    });
  };

  return (
    <div className="asset-form">
      <div className="form-header">
        <div className="form-icon" style={{ background: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6' }}>
          <Image size={28} />
        </div>
        <div>
          <h3 style={{ color: brand.colors.text }}>NFTs</h3>
          <p style={{ color: brand.colors.textMuted }}>
            Non-Fungible Tokens mit Utility-Nachweis
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', cursor: 'help' }}>
                <AlertTriangle size={14} />
                MVP-funktional
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="tooltip-wide">
              <p>Manuelle Erfassung durch Berater erforderlich.</p>
              <p>Kein automatisierter Wallet-Scan aus Sicherheitsgründen.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="transparency-banner" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>
            Transparenz-Hinweis
          </p>
          <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
            Manuelle Erfassung durch Berater erforderlich. 
            Kein automatisierter Wallet-Scan aus Sicherheitsgründen.
            Unsere manuelle Erfassung gewährleistet höchste Validitätsstandards.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <Label>Collection-Name</Label>
          <Input
            value={formData.collectionName}
            onChange={(e) => setFormData({ ...formData, collectionName: e.target.value })}
            placeholder="Bored Ape Yacht Club"
          />
        </div>

        <div className="form-field">
          <Label>Token ID</Label>
          <Input
            value={formData.tokenId}
            onChange={(e) => setFormData({ ...formData, tokenId: e.target.value })}
            placeholder="#1234"
          />
        </div>

        <div className="form-field">
          <Label>Geschätzter Wert (€)</Label>
          <Input
            type="number"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
            placeholder="50000"
          />
        </div>

        <div className="form-field">
          <Label>Quelle/Marktplatz</Label>
          <Select 
            value={formData.source} 
            onValueChange={(v) => setFormData({ ...formData, source: v as NFTSource })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opensea">OpenSea</SelectItem>
              <SelectItem value="blur">Blur</SelectItem>
              <SelectItem value="superrare">SuperRare</SelectItem>
              <SelectItem value="other">Andere</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field full-width">
          <Label>Wallet-Adresse</Label>
          <Input
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            placeholder="0x..."
            className="mono"
          />
        </div>

        <div className="form-field full-width">
          <Label>Utility-Nachweis (optional)</Label>
          <div className="checkbox-group">
            {[
              { id: 'governance', label: 'Governance (Voting-Rechte)' },
              { id: 'access', label: 'Access (Community/Events)' },
              { id: 'commercial', label: 'Commercial (IP-Nutzung)' },
              { id: 'none', label: 'Kein Utility (Pure Collectible)' },
            ].map((item) => (
              <label key={item.id} className="checkbox-item">
                <Checkbox
                  checked={formData.utilities.includes(item.id as NFTUtility)}
                  onCheckedChange={() => handleUtilityToggle(item.id as NFTUtility)}
                />
                <span style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        className="add-btn"
        style={{ background: '#9b59b6', color: 'white' }}
      >
        <Plus size={18} />
        NFT hinzufügen
      </Button>

      {currentCase.nftAssets.length > 0 && (
        <div className="asset-list">
          <h4 style={{ color: brand.colors.text }}>Erfasste NFTs</h4>
          {currentCase.nftAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="asset-item"
            >
              <div className="asset-info">
                <Image size={20} style={{ color: '#9b59b6' }} />
                <div>
                  <p style={{ color: brand.colors.text, fontWeight: 500 }}>
                    {asset.collectionName} #{asset.tokenId}
                  </p>
                  <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                    {asset.source === 'opensea' && 'OpenSea'}
                    {asset.source === 'blur' && 'Blur'}
                    {asset.source === 'superrare' && 'SuperRare'}
                    {asset.source === 'other' && 'Andere'}
                    {asset.utilities.length > 0 && ` • ${asset.utilities.length} Utilities`}
                  </p>
                </div>
              </div>
              <div className="asset-value">
                <span style={{ color: '#9b59b6', fontWeight: 600 }}>
                  €{asset.estimatedValue.toLocaleString()}
                </span>
                <button
                  onClick={() => removeNFTAsset(asset.id)}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        .transparency-banner {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .tooltip-wide {
          max-width: 300px;
        }
      `}</style>
    </div>
  );
}

// Gaming Form Component
function GamingForm() {
  const { brandMode, currentCase, addGamingAsset, removeGamingAsset } = useStore();
  const brand = brandConfigs[brandMode];
  const [formData, setFormData] = useState({
    platform: 'steam' as GamingPlatform,
    accountId: '',
    estimatedValue: '',
    rareItems: '',
    trustedPerson: { name: '', email: '', phone: '' },
    liquidationWindow: '60' as LiquidationWindow,
  });

  const handleSubmit = () => {
    if (!formData.accountId || !formData.estimatedValue) return;
    addGamingAsset({
      platform: formData.platform,
      accountId: formData.accountId,
      estimatedValue: parseFloat(formData.estimatedValue),
      rareItems: formData.rareItems,
      trustedPerson: formData.trustedPerson,
      liquidationWindow: formData.liquidationWindow,
    });
    setFormData({
      platform: 'steam',
      accountId: '',
      estimatedValue: '',
      rareItems: '',
      trustedPerson: { name: '', email: '', phone: '' },
      liquidationWindow: '60',
    });
  };

  return (
    <div className="asset-form">
      <div className="form-header">
        <div className="form-icon" style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' }}>
          <Gamepad2 size={28} />
        </div>
        <div>
          <h3 style={{ color: brand.colors.text }}>Gaming-Assets</h3>
          <p style={{ color: brand.colors.textMuted }}>
            AGB-konforme Kontinuitätsstruktur
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', cursor: 'help' }}>
                <AlertTriangle size={14} />
                MVP-funktional
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="tooltip-wide">
              <p>AGB-konforme Kontinuitätsstruktur.</p>
              <p>Vollständiger Account-Transfer rechtlich nicht durchsetzbar.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="transparency-banner" style={{ background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)' }}>
        <AlertTriangle size={20} style={{ color: '#e74c3c', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#e74c3c', fontWeight: 600, marginBottom: 4 }}>
            Rechtlicher Rahmen
          </p>
          <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
            AGB-konforme Kontinuitätsstruktur. Vollständiger Account-Transfer ist rechtlich 
            nicht durchsetzbar. DAIO maximiert den wirtschaftlichen Erhalt durch strukturierte 
            Liquidations-Vollmacht.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <Label>Plattform</Label>
          <Select 
            value={formData.platform} 
            onValueChange={(v) => setFormData({ ...formData, platform: v as GamingPlatform })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steam">Steam (Valve)</SelectItem>
              <SelectItem value="cs2">CS2/CS:GO Inventar</SelectItem>
              <SelectItem value="epic">Epic Games</SelectItem>
              <SelectItem value="fortnite">Fortnite</SelectItem>
              <SelectItem value="roblox">Roblox</SelectItem>
              <SelectItem value="wow">World of Warcraft</SelectItem>
              <SelectItem value="other">Andere</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field">
          <Label>Account-ID (verschlüsselt)</Label>
          <Input
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            placeholder="Steam ID / Epic ID"
            className="mono"
            type="password"
          />
        </div>

        <div className="form-field">
          <Label>Geschätzter Inventarwert (€)</Label>
          <Input
            type="number"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
            placeholder="25000"
          />
        </div>

        <div className="form-field">
          <Label>Liquidations-Zeitfenster</Label>
          <Select 
            value={formData.liquidationWindow} 
            onValueChange={(v) => setFormData({ ...formData, liquidationWindow: v as LiquidationWindow })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Tage (Express)</SelectItem>
              <SelectItem value="60">60 Tage (Standard)</SelectItem>
              <SelectItem value="90">90 Tage (Komplex)</SelectItem>
              <SelectItem value="120">120 Tage (Sehr komplex)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-field full-width">
          <Label>Seltene Items / Beschreibung</Label>
          <Textarea
            value={formData.rareItems}
            onChange={(e) => setFormData({ ...formData, rareItems: e.target.value })}
            placeholder="Dragon Lore (Factory New), AWP | Gungnir, etc."
            rows={3}
          />
        </div>

        <div className="form-field full-width">
          <Label>Trusted Person (Kontinuitätsbetreuer)</Label>
          <div className="trusted-person-grid">
            <Input
              value={formData.trustedPerson.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                trustedPerson: { ...formData.trustedPerson, name: e.target.value }
              })}
              placeholder="Name"
            />
            <Input
              value={formData.trustedPerson.email}
              onChange={(e) => setFormData({ 
                ...formData, 
                trustedPerson: { ...formData.trustedPerson, email: e.target.value }
              })}
              placeholder="E-Mail"
              type="email"
            />
            <Input
              value={formData.trustedPerson.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                trustedPerson: { ...formData.trustedPerson, phone: e.target.value }
              })}
              placeholder="Telefon"
              type="tel"
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        className="add-btn"
        style={{ background: '#e74c3c', color: 'white' }}
      >
        <Plus size={18} />
        Gaming-Asset hinzufügen
      </Button>

      {currentCase.gamingAssets.length > 0 && (
        <div className="asset-list">
          <h4 style={{ color: brand.colors.text }}>Erfasste Gaming-Assets</h4>
          {currentCase.gamingAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="asset-item"
            >
              <div className="asset-info">
                <Gamepad2 size={20} style={{ color: '#e74c3c' }} />
                <div>
                  <p style={{ color: brand.colors.text, fontWeight: 500 }}>
                    {asset.platform === 'steam' && 'Steam'}
                    {asset.platform === 'cs2' && 'CS2/CS:GO'}
                    {asset.platform === 'epic' && 'Epic Games'}
                    {asset.platform === 'fortnite' && 'Fortnite'}
                    {asset.platform === 'roblox' && 'Roblox'}
                    {asset.platform === 'wow' && 'World of Warcraft'}
                    {asset.platform === 'other' && 'Andere'}
                  </p>
                  <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                    {asset.liquidationWindow} Tage Liquidation
                    {asset.trustedPerson.name && ` • ${asset.trustedPerson.name}`}
                  </p>
                </div>
              </div>
              <div className="asset-value">
                <span style={{ color: '#e74c3c', fontWeight: 600 }}>
                  €{asset.estimatedValue.toLocaleString()}
                </span>
                <button
                  onClick={() => removeGamingAsset(asset.id)}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        .trusted-person-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        @media (max-width: 768px) {
          .trusted-person-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
