// DAIO Commander - Data Value Page
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { brandConfigs } from '@/config/branding';
import { 
  Database, 
  Lock, 
  Network, 
  BarChart3, 
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DataValuePage() {
  const { brandMode, setCurrentPage } = useStore();
  const brand = brandConfigs[brandMode];

  const milestones = [
    { cases: 50, value: '€120K', label: 'Aktuell (MVP)', achieved: true },
    { cases: 250, value: '€600K', label: 'Q2 2026', achieved: false },
    { cases: 500, value: '€1.2M', label: 'Q3 2026', achieved: false },
    { cases: 1000, value: '€2.4M', label: 'Q4 2026', achieved: false },
  ];

  const advantages = [
    {
      icon: Database,
      title: 'Exklusive Datenbasis',
      description: 'Kein Wettbewerber erfasst alle fünf Asset-Klassen systematisch.',
    },
    {
      icon: Network,
      title: 'Netzwerkeffekt',
      description: 'Jeder neue Fall erhöht die Genauigkeit der Bewertungsalgorithmen.',
    },
    {
      icon: BarChart3,
      title: 'Markttransparenz',
      description: 'Echtzeit-Einblicke in die digitale Vermögensverteilung in Deutschland.',
    },
    {
      icon: Lock,
      title: 'Datensouveränität',
      description: 'Alle Daten verbleiben unter deutscher Jurisdiktion.',
    },
  ];

  return (
    <div className="data-value-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 style={{ color: brand.colors.text }}>Data Value</h1>
          <p style={{ color: brand.colors.textMuted }}>
            Der strategische Vorteil durch exklusive Daten
          </p>
        </div>
      </motion.div>

      {/* Value Proposition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="value-proposition"
        style={{ 
          background: `linear-gradient(135deg, ${brand.colors.primary}80, ${brand.colors.surface})`,
          border: `1px solid ${brand.colors.secondary}40`
        }}
      >
        <div className="prop-content">
          <h2 style={{ color: brand.colors.text }}>
            Daten als strategisches Asset
          </h2>
          <p style={{ color: brand.colors.textMuted }}>
            Mit jedem erfassten Fall wächst der Wert unserer Datenbasis. 
            Bei 1.000 Fällen entsteht ein Daten-Asset von über €2,4 Millionen – 
            exklusiv für F&P-Partner verfügbar.
          </p>
        </div>
        <div className="prop-visual">
          <Database size={64} style={{ color: brand.colors.secondary, opacity: 0.5 }} />
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="milestones-section"
      >
        <h3 style={{ color: brand.colors.text, marginBottom: 20 }}>
          Wachstumspfad der Datenbasis
        </h3>
        <div className="milestones-timeline">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.cases}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`milestone ${milestone.achieved ? 'achieved' : ''}`}
            >
              <div 
                className="milestone-dot"
                style={{ 
                  background: milestone.achieved ? brand.colors.secondary : 'rgba(148, 163, 184, 0.3)'
                }}
              >
                {milestone.achieved && <Check size={14} style={{ color: brand.colors.primary }} />}
              </div>
              <div className="milestone-content">
                <span 
                  className="milestone-cases"
                  style={{ color: milestone.achieved ? brand.colors.text : brand.colors.textMuted }}
                >
                  {milestone.cases.toLocaleString()} Fälle
                </span>
                <span 
                  className="milestone-value"
                  style={{ color: milestone.achieved ? brand.colors.secondary : brand.colors.textMuted }}
                >
                  {milestone.value}
                </span>
                <span className="milestone-label" style={{ color: brand.colors.textMuted }}>
                  {milestone.label}
                </span>
              </div>
              {index < milestones.length - 1 && (
                <div 
                  className="milestone-connector"
                  style={{ 
                    background: milestone.achieved 
                      ? `linear-gradient(90deg, ${brand.colors.secondary}, rgba(148, 163, 184, 0.3))`
                      : 'rgba(148, 163, 184, 0.2)'
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Advantages Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="advantages-grid"
      >
        <h3 style={{ color: brand.colors.text, marginBottom: 20 }}>
          Exklusive Vorteile für F&P-Partner
        </h3>
        <div className="advantages-list">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="advantage-card"
                whileHover={{ y: -4 }}
              >
                <div 
                  className="advantage-icon"
                  style={{ background: `rgba(6, 182, 212, 0.15)` }}
                >
                  <Icon size={24} style={{ color: brand.colors.secondary }} />
                </div>
                <h4 style={{ color: brand.colors.text }}>{advantage.title}</h4>
                <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                  {advantage.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Competitive Advantage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="competitive-section"
      >
        <div 
          className="competitive-card"
          style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, padding: 24 }}
        >
          <h3 style={{ color: brand.colors.text, marginBottom: 16 }}>
            Wettbewerbsvorteil
          </h3>
          <div className="comparison-table">
            <div className="table-header">
              <span style={{ color: brand.colors.textMuted }}>Feature</span>
              <span style={{ color: brand.colors.textMuted }}>Traditionelle Berater</span>
              <span style={{ color: brand.colors.secondary }}>F&P + DAIO</span>
            </div>
            {[
              { feature: 'Bitcoin/Ethereum', traditional: 'Teilweise', fp: '✓ Vollständig' },
              { feature: 'Stablecoins', traditional: 'Selten', fp: '✓ Vollständig' },
              { feature: 'NFTs', traditional: '✗ Nein', fp: '✓ Mit Validierung' },
              { feature: 'Gaming-Assets', traditional: '✗ Nein', fp: '✓ AGB-konform' },
              { feature: 'Datenbasis', traditional: 'Keine', fp: '✓ Exklusiv' },
              { feature: 'Live-Hochrechnung', traditional: '✗ Nein', fp: '✓ 50+ Fälle' },
            ].map((row, index) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                className="table-row"
              >
                <span style={{ color: brand.colors.text }}>{row.feature}</span>
                <span style={{ color: brand.colors.textMuted }}>{row.traditional}</span>
                <span style={{ color: '#22c55e' }}>{row.fp}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="data-cta"
      >
        <Button
          size="lg"
          onClick={() => setCurrentPage('partnership')}
          style={{ 
            background: brand.colors.secondary,
            color: brand.colors.primary
          }}
        >
          Partner werden
          <ArrowRight size={20} />
        </Button>
      </motion.div>

      <style>{`
        .data-value-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .value-proposition {
          border-radius: 16px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .prop-content {
          flex: 1;
        }

        .prop-content h2 {
          font-size: 1.5rem;
          margin-bottom: 12px;
        }

        .prop-content p {
          max-width: 500px;
          line-height: 1.6;
        }

        .prop-visual {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 50%;
        }

        .milestones-section {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          padding: 24px;
        }

        .milestones-timeline {
          display: flex;
          gap: 0;
          position: relative;
        }

        .milestone {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          padding: 0 12px;
        }

        .milestone-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          z-index: 2;
        }

        .milestone-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .milestone-cases {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .milestone-value {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: monospace;
        }

        .milestone-label {
          font-size: 0.75rem;
        }

        .milestone-connector {
          position: absolute;
          top: 16px;
          left: 50%;
          width: 100%;
          height: 2px;
          z-index: 1;
        }

        .advantages-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .advantage-card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .advantage-card:hover {
          background: rgba(30, 41, 59, 0.7);
        }

        .advantage-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .advantage-card h4 {
          font-size: 1rem;
          margin-bottom: 8px;
        }

        .comparison-table {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          padding: 12px 16px;
          align-items: center;
        }

        .table-header {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 8px 8px 0 0;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .table-row {
          background: rgba(15, 23, 42, 0.3);
          font-size: 0.875rem;
        }

        .table-row:last-child {
          border-radius: 0 0 8px 8px;
        }

        .data-cta {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .value-proposition {
            flex-direction: column;
            text-align: center;
          }

          .prop-visual {
            margin-top: 24px;
          }

          .milestones-timeline {
            flex-direction: column;
            gap: 24px;
          }

          .milestone-connector {
            display: none;
          }

          .advantages-list {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
