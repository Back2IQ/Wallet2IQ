// DAIO Commander - Global Loss Estimator Page
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { brandConfigs } from '@/config/branding';
import { demoStats, generateLossEstimatorData } from '@/data/demoCases';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Users, Wallet, Shield } from 'lucide-react';

export function LossEstimatorPage() {
  const { brandMode } = useStore();
  const brand = brandConfigs[brandMode];
  const [animatedLoss, setAnimatedLoss] = useState(0);
  const [animatedSaved, setAnimatedSaved] = useState(0);
  
  const data = useMemo(() => generateLossEstimatorData(), []);
  
  // Pie chart data
  const pieData = [
    { name: 'Krypto (BTC/ETH/Stable)', value: data.assetDistribution.crypto, color: '#06b6d4' },
    { name: 'NFTs', value: data.assetDistribution.nft, color: '#9b59b6' },
    { name: 'Gaming', value: data.assetDistribution.gaming, color: '#e74c3c' },
  ];

  // Bar chart data
  const barData = [
    {
      name: 'Traditionell',
      krypto: 18,
      nft: 0,
      gaming: 0,
    },
    {
      name: 'Nur Krypto',
      krypto: 18,
      nft: 35,
      gaming: 0,
    },
    {
      name: 'F&P + DAIO',
      krypto: 5,
      nft: 10,
      gaming: 20,
    },
  ];

  // Animate counters
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const lossStep = data.potentialLossGermany / steps;
    const savedStep = data.potentialSaved / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setAnimatedLoss(Math.min(Math.round(lossStep * currentStep), data.potentialLossGermany));
      setAnimatedSaved(Math.min(Math.round(savedStep * currentStep), data.potentialSaved));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [data]);

  const formatBillions = (value: number) => {
    return `€${(value / 1000000000).toFixed(0)} Mrd`;
  };

  return (
    <div className="loss-estimator-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 style={{ color: brand.colors.text }}>Global Loss Estimator</h1>
          <p style={{ color: brand.colors.textMuted }}>
            Die Dimension des Problems – basierend auf 50 Demo-Fällen
          </p>
        </div>
      </motion.div>

      {/* Main Counter Cards */}
      <div className="counter-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="counter-card danger"
          style={{ 
            background: `linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))`,
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          <div className="counter-icon" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
            <TrendingDown size={28} style={{ color: '#ef4444' }} />
          </div>
          <div className="counter-content">
            <span className="counter-label" style={{ color: brand.colors.textMuted }}>
              Jährliche Verluste Deutschland
            </span>
            <motion.span 
              className="counter-value danger counter-pulse"
              style={{ color: '#ef4444' }}
            >
              {formatBillions(animatedLoss)}
            </motion.span>
            <span className="counter-sublabel" style={{ color: brand.colors.textMuted }}>
              Ohne digitale Erbfolge-Struktur
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="counter-card success"
          style={{ 
            background: `linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))`,
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}
        >
          <div className="counter-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
            <TrendingUp size={28} style={{ color: '#22c55e' }} />
          </div>
          <div className="counter-content">
            <span className="counter-label" style={{ color: brand.colors.textMuted }}>
              Potenziell gerettet
            </span>
            <motion.span 
              className="counter-value success"
              style={{ color: '#22c55e' }}
            >
              {formatBillions(animatedSaved)}
            </motion.span>
            <span className="counter-sublabel" style={{ color: brand.colors.textMuted }}>
              Mit F&P + DAIO (70% Rettungsrate)
            </span>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="stat-item"
        >
          <Users size={20} style={{ color: brand.colors.secondary }} />
          <div>
            <span className="stat-number" style={{ color: brand.colors.text }}>
              {demoStats.germanyHouseholds.toLocaleString()}
            </span>
            <span className="stat-label" style={{ color: brand.colors.textMuted }}>
              Betroffene Haushalte
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="stat-item"
        >
          <Wallet size={20} style={{ color: brand.colors.secondary }} />
          <div>
            <span className="stat-number" style={{ color: brand.colors.text }}>
              €{demoStats.averageTotalWealth.toLocaleString()}
            </span>
            <span className="stat-label" style={{ color: brand.colors.textMuted }}>
              Ø Vermögen pro Fall
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="stat-item"
        >
          <AlertTriangle size={20} style={{ color: brand.colors.secondary }} />
          <div>
            <span className="stat-number" style={{ color: brand.colors.text }}>
              {data.riskWithoutStructure}%
            </span>
            <span className="stat-label" style={{ color: brand.colors.textMuted }}>
              Gewichtetes Verlustrisiko
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="stat-item"
        >
          <Shield size={20} style={{ color: '#22c55e' }} />
          <div>
            <span className="stat-number" style={{ color: '#22c55e' }}>
              70%
            </span>
            <span className="stat-label" style={{ color: brand.colors.textMuted }}>
              Rettungsrate mit DAIO
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="chart-card"
        >
          <h3 style={{ color: brand.colors.text }}>Asset-Verteilung</h3>
          <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem', marginBottom: 16 }}>
            Basierend auf {data.totalCases} erfassten Fällen
          </p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ 
                    background: brand.colors.surface, 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: 8
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: brand.colors.textMuted }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="chart-card"
        >
          <h3 style={{ color: brand.colors.text }}>Risiko-Vergleich</h3>
          <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem', marginBottom: 16 }}>
            Verlustrisiko nach Asset-Klasse (%)
          </p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: brand.colors.textMuted, fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  tick={{ fill: brand.colors.text, fontSize: 12 }}
                  width={100}
                />
                <RechartsTooltip 
                  formatter={(value: number) => `${value}% Risiko`}
                  contentStyle={{ 
                    background: brand.colors.surface, 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: 8
                  }}
                />
                <Bar dataKey="krypto" name="Krypto" stackId="a" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                <Bar dataKey="nft" name="NFTs" stackId="a" fill="#9b59b6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="gaming" name="Gaming" stackId="a" fill="#e74c3c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Risk Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="risk-breakdown"
      >
        <h3 style={{ color: brand.colors.text, marginBottom: 16 }}>
          Verlustrisiko pro Asset-Klasse
        </h3>
        <div className="risk-grid">
          {[
            { 
              name: 'Bitcoin / Ethereum / Stablecoins', 
              risk: 18, 
              color: '#06b6d4',
              reason: 'Wallet-Verlust, fehlende Dokumentation'
            },
            { 
              name: 'NFTs', 
              risk: 35, 
              color: '#9b59b6',
              reason: 'Illiquidität, unbekannte Collection-Werte'
            },
            { 
              name: 'Gaming-Assets', 
              risk: 70, 
              color: '#e74c3c',
              reason: 'AGB-Verstöße, Account-Sperrungen'
            },
          ].map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="risk-item"
            >
              <div className="risk-header">
                <span style={{ color: brand.colors.text }}>{item.name}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.risk}% Risiko</span>
              </div>
              <div className="risk-bar">
                <motion.div
                  className="risk-fill"
                  style={{ background: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.risk}%` }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                />
              </div>
              <p style={{ color: brand.colors.textMuted, fontSize: '0.75rem', marginTop: 4 }}>
                {item.reason}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* F&P Reference */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="fp-reference"
        style={{ 
          background: `linear-gradient(135deg, ${brand.colors.primary}60, ${brand.colors.surface})`,
          border: `1px solid ${brand.colors.secondary}40`
        }}
      >
        <div className="fp-content">
          <h3 style={{ color: brand.colors.text }}>
            Exklusive Datenbasis mit F&P
          </h3>
          <p style={{ color: brand.colors.textMuted }}>
            Mit 1.000 erfassten Fällen entsteht eine einzigartige Datenbasis für die 
            digitale Erbfolge-Planung in Deutschland. Nur F&P-Kunden erhalten Zugang 
            zu diesen exklusiven Markteinblicken.
          </p>
        </div>
        <div className="fp-stats">
          <div className="fp-stat">
            <span style={{ color: brand.colors.secondary, fontSize: '1.5rem', fontWeight: 700 }}>
              1.000
            </span>
            <span style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
              Ziel: Erfasste Fälle
            </span>
          </div>
          <div className="fp-stat">
            <span style={{ color: brand.colors.secondary, fontSize: '1.5rem', fontWeight: 700 }}>
              €2.4M
            </span>
            <span style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
              Daten-Asset-Wert
            </span>
          </div>
        </div>
      </motion.div>

      <style>{`
        .loss-estimator-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .counter-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .counter-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 28px;
          border-radius: 16px;
        }

        .counter-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .counter-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .counter-label {
          font-size: 0.875rem;
        }

        .counter-value {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .counter-sublabel {
          font-size: 0.875rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 12px;
        }

        .stat-item > div {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .stat-label {
          font-size: 0.75rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .chart-card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          padding: 24px;
        }

        .chart-card h3 {
          font-size: 1.125rem;
          margin-bottom: 4px;
        }

        .chart-container {
          margin-top: 16px;
        }

        .risk-breakdown {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          padding: 24px;
        }

        .risk-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .risk-item {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 10px;
          padding: 16px;
        }

        .risk-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .risk-bar {
          height: 8px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .risk-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .fp-reference {
          border-radius: 16px;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .fp-content {
          flex: 1;
        }

        .fp-content h3 {
          margin-bottom: 8px;
        }

        .fp-content p {
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .fp-stats {
          display: flex;
          gap: 32px;
        }

        .fp-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 1024px) {
          .counter-grid {
            grid-template-columns: 1fr;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .fp-reference {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .stats-row {
            grid-template-columns: 1fr;
          }

          .counter-value {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}
