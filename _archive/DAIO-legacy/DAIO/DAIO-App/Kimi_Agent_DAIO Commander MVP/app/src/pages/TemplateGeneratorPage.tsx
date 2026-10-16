// DAIO Commander - Template Generator Page
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { brandConfigs } from '@/config/branding';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Printer, 
  Check, 
  Shield, 
  Wallet, 
  Image, 
  Gamepad2,
  Bitcoin,
  Coins,
  DollarSign
} from 'lucide-react';

export function TemplateGeneratorPage() {
  const { brandMode, currentCase, getTotalValue, getCryptoValue, getNFTValue, getGamingValue } = useStore();
  const brand = brandConfigs[brandMode];
  const [activeTemplate, setActiveTemplate] = useState('consultation');
  const printRef = useRef<HTMLDivElement>(null);

  const templates = [
    {
      id: 'consultation',
      name: 'Initial Consultation Report',
      description: 'Zusammenfassung der ersten Beratung',
      icon: FileText,
    },
    {
      id: 'certificate',
      name: 'Inheritance Container Certificate',
      description: 'Offizielles Zertifikat für Erben',
      icon: Shield,
    },
    {
      id: 'configuration',
      name: 'Succession Sentinel Configuration',
      description: 'Technische Konfiguration',
      icon: Wallet,
    },
  ];

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${templates.find(t => t.id === activeTemplate)?.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>${printRef.current.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="template-generator-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 style={{ color: brand.colors.text }}>Template Generator</h1>
          <p style={{ color: brand.colors.textMuted }}>
            Generieren Sie White-Label-Dokumente für Ihre Mandanten
          </p>
        </div>
      </motion.div>

      {/* Template Selection */}
      <Tabs value={activeTemplate} onValueChange={setActiveTemplate}>
        <TabsList className="template-tabs">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <TabsTrigger
                key={template.id}
                value={template.id}
                className="template-tab"
              >
                <Icon size={20} />
                <div className="tab-info">
                  <span className="tab-name">{template.name}</span>
                  <span className="tab-desc">{template.description}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="consultation" className="template-content">
          <ConsultationReport 
            brand={brand} 
            currentCase={currentCase}
            getTotalValue={getTotalValue}
            getCryptoValue={getCryptoValue}
            getNFTValue={getNFTValue}
            getGamingValue={getGamingValue}
            formatDate={formatDate}
            printRef={printRef}
          />
        </TabsContent>

        <TabsContent value="certificate" className="template-content">
          <CertificateReport 
            brand={brand}
            currentCase={currentCase}
            getTotalValue={getTotalValue}
            formatDate={formatDate}
            printRef={printRef}
          />
        </TabsContent>

        <TabsContent value="configuration" className="template-content">
          <ConfigurationReport 
            brand={brand}
            currentCase={currentCase}
            getTotalValue={getTotalValue}
            formatDate={formatDate}
            printRef={printRef}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="template-actions"
      >
        <Button
          onClick={handlePrint}
          className="action-btn primary"
          style={{ 
            background: brand.colors.secondary,
            color: brand.colors.primary
          }}
        >
          <Printer size={18} />
          Drucken / Als PDF speichern
        </Button>
        
        <div className="white-label-notice">
          <Check size={16} style={{ color: '#22c55e' }} />
          <span style={{ color: brand.colors.textMuted }}>
            Alle Dokumente sind White-Label-fähig für F&P-Integration
          </span>
        </div>
      </motion.div>

      <style>{`
        .template-generator-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .template-tabs {
          display: flex;
          gap: 12px;
          background: rgba(30, 41, 59, 0.5);
          padding: 8px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .template-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--brand-text-muted);
          cursor: pointer;
          text-align: left;
          flex: 1;
          transition: all 0.2s ease;
        }

        .template-tab:hover {
          background: rgba(148, 163, 184, 0.1);
        }

        .template-tab[data-state="active"] {
          background: rgba(6, 182, 212, 0.15);
          color: var(--brand-text);
        }

        .tab-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tab-name {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .tab-desc {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .template-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .template-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          font-weight: 600;
        }

        .white-label-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .template-tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

// Consultation Report Template
function ConsultationReport({ 
  brand, 
  currentCase, 
  getTotalValue, 
  getCryptoValue, 
  getNFTValue, 
  getGamingValue, 
  formatDate,
  printRef 
}: any) {
  const totalValue = getTotalValue();
  const cryptoValue = getCryptoValue();
  const nftValue = getNFTValue();
  const gamingValue = getGamingValue();

  return (
    <div ref={printRef} className="report-document">
      <div className="report-header">
        <div className="report-brand">
          <div 
            className="report-logo"
            style={{ background: brand.colors.secondary }}
          >
            <span style={{ color: brand.colors.primary }}>DAIO</span>
          </div>
          <div>
            <h2 style={{ color: brand.colors.text }}>{brand.name}</h2>
            <p style={{ color: brand.colors.textMuted }}>{brand.tagline}</p>
          </div>
        </div>
        <div className="report-meta">
          <span style={{ color: brand.colors.textMuted }}>Datum: {formatDate()}</span>
          <span style={{ color: brand.colors.textMuted }}>Fall-ID: {currentCase.id || '---'}</span>
        </div>
      </div>

      <div className="report-title">
        <h1>Initial Consultation Report</h1>
        <p>Digitale Asset-Erfassung für Erbfolge-Planung</p>
      </div>

      <div className="report-section">
        <h3>Mandanteninformation</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Name</span>
            <span className="value">{currentCase.name || '[Noch nicht erfasst]'}</span>
          </div>
          <div className="info-item">
            <span className="label">Beratungsdatum</span>
            <span className="value">{formatDate()}</span>
          </div>
          <div className="info-item">
            <span className="label">Berater</span>
            <span className="value">{brand.name}</span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Zusammenfassung der Asset-Klassen</h3>
        <div className="asset-summary">
          <div className="summary-item">
            <div className="summary-icon" style={{ background: 'rgba(247, 147, 26, 0.15)' }}>
              <Bitcoin size={20} style={{ color: '#f7931a' }} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Bitcoin</span>
              <span className="summary-count">{currentCase.bitcoinAssets.length} Wallets</span>
            </div>
            <span className="summary-value" style={{ color: '#f7931a' }}>
              €{currentCase.bitcoinAssets.reduce((sum: number, a: any) => sum + (a.value || 0), 0).toLocaleString()}
            </span>
          </div>

          <div className="summary-item">
            <div className="summary-icon" style={{ background: 'rgba(98, 126, 234, 0.15)' }}>
              <Coins size={20} style={{ color: '#627eea' }} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Ethereum</span>
              <span className="summary-count">{currentCase.ethereumAssets.length} Wallets</span>
            </div>
            <span className="summary-value" style={{ color: '#627eea' }}>
              €{currentCase.ethereumAssets.reduce((sum: number, a: any) => sum + (a.value || 0), 0).toLocaleString()}
            </span>
          </div>

          <div className="summary-item">
            <div className="summary-icon" style={{ background: 'rgba(39, 174, 96, 0.15)' }}>
              <DollarSign size={20} style={{ color: '#27ae60' }} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Stablecoins</span>
              <span className="summary-count">{currentCase.stablecoinAssets.length} Positionen</span>
            </div>
            <span className="summary-value" style={{ color: '#27ae60' }}>
              €{currentCase.stablecoinAssets.reduce((sum: number, a: any) => sum + (a.value || 0), 0).toLocaleString()}
            </span>
          </div>

          <div className="summary-item">
            <div className="summary-icon" style={{ background: 'rgba(155, 89, 182, 0.15)' }}>
              <Image size={20} style={{ color: '#9b59b6' }} />
            </div>
            <div className="summary-info">
              <span className="summary-label">NFTs</span>
              <span className="summary-count">{currentCase.nftAssets.length} Items</span>
            </div>
            <span className="summary-value" style={{ color: '#9b59b6' }}>
              €{currentCase.nftAssets.reduce((sum: number, a: any) => sum + (a.estimatedValue || 0), 0).toLocaleString()}
            </span>
          </div>

          <div className="summary-item">
            <div className="summary-icon" style={{ background: 'rgba(231, 76, 60, 0.15)' }}>
              <Gamepad2 size={20} style={{ color: '#e74c3c' }} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Gaming</span>
              <span className="summary-count">{currentCase.gamingAssets.length} Accounts</span>
            </div>
            <span className="summary-value" style={{ color: '#e74c3c' }}>
              €{currentCase.gamingAssets.reduce((sum: number, a: any) => sum + (a.estimatedValue || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Gesamtbewertung</h3>
        <div className="total-evaluation">
          <div className="total-row">
            <span>Krypto-Assets (BTC/ETH/Stable)</span>
            <span style={{ color: '#06b6d4' }}>€{cryptoValue.toLocaleString()}</span>
          </div>
          <div className="total-row">
            <span>NFT-Assets</span>
            <span style={{ color: '#9b59b6' }}>€{nftValue.toLocaleString()}</span>
          </div>
          <div className="total-row">
            <span>Gaming-Assets</span>
            <span style={{ color: '#e74c3c' }}>€{gamingValue.toLocaleString()}</span>
          </div>
          <div className="total-row final">
            <span>Gesamtwert digitale Assets</span>
            <span style={{ color: brand.colors.secondary }}>€{totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Nächste Schritte</h3>
        <div className="next-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <span className="step-title">Vollständige Erfassung</span>
              <span className="step-desc">Alle fünf Asset-Klassen dokumentieren</span>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <span className="step-title">Validierung</span>
              <span className="step-desc">Wallet-Adressen und Besitznachweise prüfen</span>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <span className="step-title">Inheritance Container</span>
              <span className="step-desc">Rechtliche Struktur für Erbfolge etablieren</span>
            </div>
          </div>
        </div>
      </div>

      <div className="report-footer">
        <p>Dieses Dokument wurde mit DAIO Commander generiert.</p>
        <p>© {new Date().getFullYear()} {brand.name} – Alle Rechte vorbehalten.</p>
      </div>

      <style>{`
        .report-document {
          background: white;
          color: #1e293b;
          padding: 48px;
          border-radius: 12px;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
        }

        .report-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .report-logo {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .report-brand h2 {
          font-size: 1.25rem;
          color: #0f172a;
          margin: 0;
        }

        .report-brand p {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .report-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          font-size: 0.875rem;
          color: #64748b;
        }

        .report-title {
          text-align: center;
          margin-bottom: 32px;
        }

        .report-title h1 {
          font-size: 1.75rem;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .report-title p {
          color: #64748b;
          font-size: 1rem;
        }

        .report-section {
          margin-bottom: 32px;
        }

        .report-section h3 {
          font-size: 1.125rem;
          color: #0f172a;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item .label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .info-item .value {
          font-size: 1rem;
          color: #0f172a;
          font-weight: 500;
        }

        .asset-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .summary-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .summary-label {
          font-weight: 500;
          color: #0f172a;
        }

        .summary-count {
          font-size: 0.875rem;
          color: #64748b;
        }

        .summary-value {
          font-weight: 600;
          font-family: monospace;
        }

        .total-evaluation {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .total-row:last-child {
          border-bottom: none;
        }

        .total-row.final {
          margin-top: 10px;
          padding-top: 20px;
          border-top: 2px solid #0f172a;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .next-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #0f172a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-content {
          display: flex;
          flex-direction: column;
        }

        .step-title {
          font-weight: 600;
          color: #0f172a;
        }

        .step-desc {
          font-size: 0.875rem;
          color: #64748b;
        }

        .report-footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        @media print {
          .report-document {
            box-shadow: none;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

// Certificate Report Template
function CertificateReport({ brand, currentCase, getTotalValue, formatDate, printRef }: any) {
  return (
    <div ref={printRef} className="report-document certificate">
      <div className="certificate-header">
        <div 
          className="certificate-seal"
          style={{ borderColor: brand.colors.secondary }}
        >
          <Shield size={48} style={{ color: brand.colors.secondary }} />
        </div>
        <h1>Inheritance Container Certificate</h1>
        <p className="certificate-subtitle">Digitale Erbfolge-Zertifizierung</p>
      </div>

      <div className="certificate-body">
        <p className="certifies-text">
          Hiermit wird bestätigt, dass
        </p>
        
        <div className="certificate-recipient">
          <h2>{currentCase.name || '[Mandantenname]'}</h2>
          <p>Fall-ID: {currentCase.id || '---'}</p>
        </div>

        <p className="certifies-text">
          einen vollständigen digitalen Asset-Container bei {brand.name} eingerichtet hat.
        </p>

        <div className="certificate-assets">
          <h3>Erfasste Asset-Klassen</h3>
          <div className="asset-badges">
            {currentCase.bitcoinAssets.length > 0 && (
              <span className="asset-badge btc">Bitcoin</span>
            )}
            {currentCase.ethereumAssets.length > 0 && (
              <span className="asset-badge eth">Ethereum</span>
            )}
            {currentCase.stablecoinAssets.length > 0 && (
              <span className="asset-badge stable">Stablecoins</span>
            )}
            {currentCase.nftAssets.length > 0 && (
              <span className="asset-badge nft">NFTs</span>
            )}
            {currentCase.gamingAssets.length > 0 && (
              <span className="asset-badge gaming">Gaming</span>
            )}
            {getTotalValue() === 0 && (
              <span className="asset-badge pending">Noch keine Assets erfasst</span>
            )}
          </div>
        </div>

        <div className="certificate-value">
          <span className="value-label">Gesamtwert der erfassten Assets</span>
          <span className="value-amount">€{getTotalValue().toLocaleString()}</span>
        </div>

        <div className="certificate-date">
          <p>Ausgestellt am: <strong>{formatDate()}</strong></p>
          <p>Gültig bis: <strong>Unbefristet</strong></p>
        </div>
      </div>

      <div className="certificate-footer">
        <div className="signature-line">
          <div className="line"></div>
          <span>Unterschrift Berater</span>
        </div>
        <div className="signature-line">
          <div className="line"></div>
          <span>Unterschrift Mandant</span>
        </div>
      </div>

      <style>{`
        .certificate {
          text-align: center;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 3px solid #e2e8f0;
        }

        .certificate-header {
          margin-bottom: 32px;
        }

        .certificate-seal {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .certificate-header h1 {
          font-size: 1.75rem;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .certificate-subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .certificate-body {
          margin-bottom: 48px;
        }

        .certifies-text {
          color: #64748b;
          font-size: 1rem;
          margin-bottom: 16px;
        }

        .certificate-recipient {
          background: #f1f5f9;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }

        .certificate-recipient h2 {
          font-size: 1.5rem;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .certificate-recipient p {
          color: #64748b;
          font-size: 0.875rem;
        }

        .certificate-assets {
          margin: 32px 0;
        }

        .certificate-assets h3 {
          font-size: 1rem;
          color: #64748b;
          margin-bottom: 16px;
        }

        .asset-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .asset-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .asset-badge.btc { background: rgba(247, 147, 26, 0.15); color: #f7931a; }
        .asset-badge.eth { background: rgba(98, 126, 234, 0.15); color: #627eea; }
        .asset-badge.stable { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
        .asset-badge.nft { background: rgba(155, 89, 182, 0.15); color: #9b59b6; }
        .asset-badge.gaming { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
        .asset-badge.pending { background: #e2e8f0; color: #64748b; }

        .certificate-value {
          margin: 32px 0;
          padding: 24px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border-radius: 12px;
        }

        .value-label {
          display: block;
          color: #94a3b8;
          font-size: 0.875rem;
          margin-bottom: 8px;
        }

        .value-amount {
          display: block;
          color: #22d3ee;
          font-size: 2.5rem;
          font-weight: 700;
          font-family: monospace;
        }

        .certificate-date {
          margin-top: 32px;
          font-size: 0.875rem;
          color: #64748b;
        }

        .certificate-date p {
          margin: 4px 0;
        }

        .certificate-footer {
          display: flex;
          justify-content: space-around;
          margin-top: 48px;
        }

        .signature-line {
          text-align: center;
        }

        .signature-line .line {
          width: 200px;
          height: 1px;
          background: #0f172a;
          margin-bottom: 8px;
        }

        .signature-line span {
          font-size: 0.875rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

// Configuration Report Template
function ConfigurationReport({ brand: _brand, currentCase, getTotalValue: _getTotalValue, formatDate, printRef }: { brand: any, currentCase: any, getTotalValue: any, formatDate: any, printRef: any }) {
  return (
    <div ref={printRef} className="report-document configuration">
      <div className="config-header">
        <h1>Succession Sentinel Configuration</h1>
        <p>Technische Dokumentation für digitale Erbfolge</p>
      </div>

      <div className="config-section">
        <h3>Container-Metadaten</h3>
        <table className="config-table">
          <tbody>
            <tr>
              <td>Container-ID</td>
              <td className="mono">{currentCase.id || '---'}</td>
            </tr>
            <tr>
              <td>Erstellungsdatum</td>
              <td>{formatDate()}</td>
            </tr>
            <tr>
              <td>Letzte Aktualisierung</td>
              <td>{formatDate()}</td>
            </tr>
            <tr>
              <td>Version</td>
              <td>DAIO Commander MVP 1.0</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="config-section">
        <h3>Asset-Konfiguration</h3>
        
        <h4>Bitcoin Wallets</h4>
        {currentCase.bitcoinAssets.length > 0 ? (
          <table className="config-table">
            <thead>
              <tr>
                <th>Typ</th>
                <th>Adresse</th>
                <th>Wert (€)</th>
                <th>Speicherort</th>
              </tr>
            </thead>
            <tbody>
              {currentCase.bitcoinAssets.map((asset: any) => (
                <tr key={asset.id}>
                  <td>{asset.walletType}</td>
                  <td className="mono">{asset.address.slice(0, 20)}...</td>
                  <td>€{asset.value.toLocaleString()}</td>
                  <td>{asset.storageLocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Keine Bitcoin-Wallets erfasst</p>
        )}

        <h4>Ethereum Wallets</h4>
        {currentCase.ethereumAssets.length > 0 ? (
          <table className="config-table">
            <thead>
              <tr>
                <th>Typ</th>
                <th>Adresse</th>
                <th>Wert (€)</th>
                <th>Smart Contracts</th>
              </tr>
            </thead>
            <tbody>
              {currentCase.ethereumAssets.map((asset: any) => (
                <tr key={asset.id}>
                  <td>{asset.walletType}</td>
                  <td className="mono">{asset.address.slice(0, 20)}...</td>
                  <td>€{asset.value.toLocaleString()}</td>
                  <td>{asset.hasSmartContract ? 'Ja' : 'Nein'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Keine Ethereum-Wallets erfasst</p>
        )}

        <h4>NFT Collections</h4>
        {currentCase.nftAssets.length > 0 ? (
          <table className="config-table">
            <thead>
              <tr>
                <th>Collection</th>
                <th>Token ID</th>
                <th>Wert (€)</th>
                <th>Utilities</th>
              </tr>
            </thead>
            <tbody>
              {currentCase.nftAssets.map((asset: any) => (
                <tr key={asset.id}>
                  <td>{asset.collectionName}</td>
                  <td>#{asset.tokenId}</td>
                  <td>€{asset.estimatedValue.toLocaleString()}</td>
                  <td>{asset.utilities.join(', ') || 'Keine'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Keine NFTs erfasst</p>
        )}

        <h4>Gaming Accounts</h4>
        {currentCase.gamingAssets.length > 0 ? (
          <table className="config-table">
            <thead>
              <tr>
                <th>Plattform</th>
                <th>Account-ID</th>
                <th>Wert (€)</th>
                <th>Liquidation</th>
              </tr>
            </thead>
            <tbody>
              {currentCase.gamingAssets.map((asset: any) => (
                <tr key={asset.id}>
                  <td>{asset.platform}</td>
                  <td className="mono">***{asset.accountId.slice(-4)}</td>
                  <td>€{asset.estimatedValue.toLocaleString()}</td>
                  <td>{asset.liquidationWindow} Tage</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Keine Gaming-Assets erfasst</p>
        )}
      </div>

      <div className="config-section">
        <h3>Sicherheitsparameter</h3>
        <div className="security-params">
          <div className="param">
            <span className="param-label">Verschlüsselung</span>
            <span className="param-value">AES-256</span>
          </div>
          <div className="param">
            <span className="param-label">Backup-Intervall</span>
            <span className="param-value">Täglich</span>
          </div>
          <div className="param">
            <span className="param-label">Zugriffskontrolle</span>
            <span className="param-value">Multi-Sig erforderlich</span>
          </div>
          <div className="param">
            <span className="param-label">Audit-Log</span>
            <span className="param-value">Aktiviert</span>
          </div>
        </div>
      </div>

      <div className="config-footer">
        <p>Diese Konfiguration ist vertraulich und nur für autorisiertes Personal bestimmt.</p>
        <p>Generated by DAIO Commander MVP | {formatDate()}</p>
      </div>

      <style>{`
        .configuration {
          font-family: 'Courier New', monospace;
        }

        .config-header {
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .config-header h1 {
          font-size: 1.5rem;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .config-header p {
          color: #64748b;
          font-size: 0.875rem;
        }

        .config-section {
          margin-bottom: 32px;
        }

        .config-section h3 {
          font-size: 1rem;
          color: #0f172a;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .config-section h4 {
          font-size: 0.875rem;
          color: #64748b;
          margin: 20px 0 12px;
        }

        .config-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .config-table th,
        .config-table td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .config-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }

        .config-table td {
          color: #0f172a;
        }

        .config-table .mono {
          font-family: 'Courier New', monospace;
        }

        .no-data {
          color: #94a3b8;
          font-style: italic;
          font-size: 0.875rem;
          padding: 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .security-params {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .param {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .param-label {
          color: #64748b;
          font-size: 0.875rem;
        }

        .param-value {
          color: #0f172a;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .config-footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
