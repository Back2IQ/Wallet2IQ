// DAIO Commander - Hidden Asset Scanner Page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/hooks/useStore';
import { brandConfigs } from '@/config/branding';
import { Button } from '@/components/ui/button';
import { ScanLine, Eye, EyeOff, Bitcoin, Coins, DollarSign, Image, Gamepad2, ArrowRight } from 'lucide-react';

export function HiddenScannerPage() {
  const { brandMode, setCurrentPage } = useStore();
  const brand = brandConfigs[brandMode];
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [revealedAssets, setRevealedAssets] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Demo data for the scanner
  const demoAssets = {
    physical: { value: 7000000, label: 'Physische Assets' },
    bitcoin: { value: 850000, label: 'Bitcoin', icon: Bitcoin, color: '#f7931a' },
    ethereum: { value: 620000, label: 'Ethereum', icon: Coins, color: '#627eea' },
    stablecoins: { value: 430000, label: 'Stablecoins', icon: DollarSign, color: '#27ae60' },
    nfts: { value: 280000, label: 'NFTs', icon: Image, color: '#9b59b6' },
    gaming: { value: 120000, label: 'Gaming', icon: Gamepad2, color: '#e74c3c' },
  };

  const totalDigital = demoAssets.bitcoin.value + demoAssets.ethereum.value + 
                       demoAssets.stablecoins.value + demoAssets.nfts.value + demoAssets.gaming.value;
  const totalWealth = demoAssets.physical.value + totalDigital;

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setRevealedAssets([]);
    setShowResults(false);
  };

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            setShowResults(true);
            return 100;
          }
          
          // Reveal assets at specific progress points
          if (prev === 15) setRevealedAssets(['bitcoin']);
          if (prev === 35) setRevealedAssets(['bitcoin', 'ethereum']);
          if (prev === 55) setRevealedAssets(['bitcoin', 'ethereum', 'stablecoins']);
          if (prev === 75) setRevealedAssets(['bitcoin', 'ethereum', 'stablecoins', 'nfts']);
          if (prev === 90) setRevealedAssets(['bitcoin', 'ethereum', 'stablecoins', 'nfts', 'gaming']);
          
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  return (
    <div className="hidden-scanner-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 style={{ color: brand.colors.text }}>Hidden Asset Scanner</h1>
          <p style={{ color: brand.colors.textMuted }}>
            Enthüllen Sie die unsichtbaren digitalen Assets
          </p>
        </div>
      </motion.div>

      {/* Scanner Visualization */}
      <div className="scanner-container">
        {!isScanning && !showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="scanner-start"
          >
            <div className="start-icon">
              <ScanLine size={64} style={{ color: brand.colors.secondary }} />
            </div>
            <h2 style={{ color: brand.colors.text }}>Bereit zum Scannen</h2>
            <p style={{ color: brand.colors.textMuted }}>
              Starten Sie den Scanner, um alle fünf Asset-Klassen zu identifizieren
            </p>
            <Button
              size="lg"
              onClick={startScan}
              className="scan-btn"
              style={{ 
                background: `linear-gradient(135deg, ${brand.colors.secondary}, ${brand.colors.accent})`,
                color: brand.colors.primary
              }}
            >
              <ScanLine size={20} />
              Scan starten
            </Button>
          </motion.div>
        )}

        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="scanning-active"
          >
            {/* Radar Animation */}
            <div className="radar-container">
              <div className="radar-background">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="radar-ring"
                    style={{ 
                      width: `${(i + 1) * 25}%`,
                      height: `${(i + 1) * 25}%`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  />
                ))}
                <div className="radar-sweep" />
                <div className="radar-center">
                  <span style={{ color: brand.colors.secondary }}>{scanProgress}%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="scan-progress">
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p style={{ color: brand.colors.textMuted }}>
                Suche nach digitalen Assets...
              </p>
            </div>

            {/* Revealed Assets */}
            <div className="revealed-assets">
              {revealedAssets.map((asset) => {
                const assetData = demoAssets[asset as keyof typeof demoAssets] as any;
                const Icon = assetData.icon;
                return (
                  <motion.div
                    key={asset}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="revealed-asset"
                    style={{ borderColor: assetData.color }}
                  >
                    <Icon size={24} style={{ color: assetData.color }} />
                    <span style={{ color: brand.colors.text }}>{assetData.label}</span>
                    <span style={{ color: assetData.color, fontWeight: 600 }}>
                      €{(assetData.value / 1000000).toFixed(2)}M
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="scan-results"
          >
            <div className="results-header">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="success-icon"
                style={{ background: `rgba(34, 197, 94, 0.2)` }}
              >
                <Eye size={40} style={{ color: '#22c55e' }} />
              </motion.div>
              <h2 style={{ color: brand.colors.text }}>Scan abgeschlossen!</h2>
              <p style={{ color: brand.colors.textMuted }}>
                Das hätte Ihr Berater nie gesehen
              </p>
            </div>

            {/* Before/After Comparison */}
            <div className="comparison-grid">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="comparison-card before"
              >
                <div className="card-header">
                  <EyeOff size={20} style={{ color: brand.colors.textMuted }} />
                  <span style={{ color: brand.colors.textMuted }}>Vor dem Scan</span>
                </div>
                <div className="card-value" style={{ color: brand.colors.textMuted }}>
                  €{(demoAssets.physical.value / 1000000).toFixed(2)}M
                </div>
                <div className="card-label" style={{ color: brand.colors.textMuted }}>
                  Nur physische Assets
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="comparison-arrow"
              >
                <ArrowRight size={32} style={{ color: brand.colors.secondary }} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="comparison-card after"
                style={{ 
                  background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.surface})`,
                  borderColor: brand.colors.secondary
                }}
              >
                <div className="card-header">
                  <Eye size={20} style={{ color: brand.colors.secondary }} />
                  <span style={{ color: brand.colors.secondary }}>Nach dem Scan</span>
                </div>
                <motion.div 
                  className="card-value"
                  style={{ color: brand.colors.text }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  €{(totalWealth / 1000000).toFixed(2)}M
                </motion.div>
                <div className="card-label" style={{ color: brand.colors.textMuted }}>
                  Inkl. digitaler Assets
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="discovery-badge"
                  style={{ background: `rgba(34, 197, 94, 0.2)`, color: '#22c55e' }}
                >
                  +€{(totalDigital / 1000000).toFixed(2)}M entdeckt
                </motion.div>
              </motion.div>
            </div>

            {/* Asset Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="asset-breakdown"
            >
              <h3 style={{ color: brand.colors.text }}>Aufgedeckte Asset-Klassen</h3>
              <div className="breakdown-grid">
                {Object.entries(demoAssets)
                  .filter(([key]) => key !== 'physical')
                  .map(([key, asset]: [string, any], index) => {
                    const Icon = asset.icon;
                    const percentage = (asset.value / totalDigital) * 100;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                        className="breakdown-item"
                      >
                        <div className="item-header">
                          <div 
                            className="item-icon"
                            style={{ background: `${asset.color}20` }}
                          >
                            <Icon size={20} style={{ color: asset.color }} />
                          </div>
                          <span style={{ color: brand.colors.text }}>{asset.label}</span>
                        </div>
                        <div className="item-bar">
                          <motion.div
                            className="item-fill"
                            style={{ background: asset.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                          />
                        </div>
                        <div className="item-value" style={{ color: asset.color }}>
                          €{(asset.value / 1000).toFixed(0)}K ({percentage.toFixed(1)}%)
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="results-actions"
            >
              <Button
                size="lg"
                onClick={() => setCurrentPage('asset-discovery')}
                style={{ 
                  background: brand.colors.secondary,
                  color: brand.colors.primary
                }}
              >
                Jetzt eigene Assets erfassen
                <ArrowRight size={20} />
              </Button>
              <Button
                variant="outline"
                onClick={startScan}
              >
                Scan wiederholen
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>

      <style>{`
        .hidden-scanner-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .scanner-container {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 20px;
          padding: 48px;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scanner-start {
          text-align: center;
        }

        .start-icon {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .scanner-start h2 {
          font-size: 1.75rem;
          margin-bottom: 12px;
        }

        .scanner-start p {
          margin-bottom: 24px;
          max-width: 400px;
        }

        .scan-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          font-weight: 600;
        }

        .scanning-active {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .radar-container {
          position: relative;
          width: 300px;
          height: 300px;
        }

        .radar-background {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radar-ring {
          position: absolute;
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .radar-sweep {
          position: absolute;
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--brand-secondary), transparent);
          animation: sweep 2s linear infinite;
          transform-origin: right center;
        }

        @keyframes sweep {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .radar-center {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          z-index: 10;
        }

        .scan-progress {
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .scan-progress .progress-bar {
          height: 8px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .scan-progress .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--brand-secondary), var(--brand-accent));
          border-radius: 4px;
          transition: width 0.05s linear;
        }

        .revealed-assets {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        .revealed-asset {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(15, 23, 42, 0.8);
          border: 2px solid;
          border-radius: 10px;
          font-size: 0.875rem;
        }

        .scan-results {
          width: 100%;
        }

        .results-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .results-header h2 {
          font-size: 1.75rem;
          margin-bottom: 8px;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          align-items: center;
          margin-bottom: 32px;
        }

        .comparison-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .comparison-card.after {
          border-width: 2px;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .card-value {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: var(--font-mono);
          margin-bottom: 8px;
        }

        .card-label {
          font-size: 0.875rem;
        }

        .discovery-badge {
          display: inline-block;
          margin-top: 16px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .comparison-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .asset-breakdown {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .asset-breakdown h3 {
          margin-bottom: 20px;
          text-align: center;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .breakdown-item {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 12px;
          padding: 16px;
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .item-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-bar {
          height: 6px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .item-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .item-value {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .results-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .scanner-container {
            padding: 24px;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .comparison-arrow {
            transform: rotate(90deg);
          }

          .breakdown-grid {
            grid-template-columns: 1fr;
          }

          .results-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
