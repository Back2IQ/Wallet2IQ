// DAIO Commander - Landing Page
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { brandConfigs } from '@/config/branding';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle, TrendingUp, Shield, Wallet } from 'lucide-react';

export function LandingPage() {
  const { setCurrentPage, brandMode } = useStore();
  const brand = brandConfigs[brandMode];

  const stats = [
    { label: 'Haushalte in DE', value: '180.000', suffix: '', icon: Wallet },
    { label: 'Jährliche Verluste', value: '47', suffix: 'Mrd €', icon: AlertTriangle },
    { label: 'Rettbar mit DAIO', value: '33', suffix: 'Mrd €', icon: Shield },
    { label: 'Durchschnittliches Vermögen', value: '890', suffix: 'K €', icon: TrendingUp },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-content"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hero-badge"
            style={{ 
              background: `rgba(6, 182, 212, 0.15)`,
              border: `1px solid rgba(6, 182, 212, 0.3)`
            }}
          >
            <span style={{ color: brand.colors.secondary }}>
              MVP Release 2026
            </span>
          </motion.div>

          <h1 className="hero-title">
            <span style={{ color: brand.colors.text }}>Die </span>
            <span className="gradient-text">unvollständige</span>
            <span style={{ color: brand.colors.text }}> Bilanz</span>
          </h1>

          <p className="hero-subtitle" style={{ color: brand.colors.textMuted }}>
            90% der Erbfolge-Planungen ignorieren NFTs und Gaming-Assets. 
            Wir sind die ersten, die alle fünf Asset-Klassen in Deutschland erfassen.
          </p>

          <div className="hero-actions">
            <Button
              size="lg"
              onClick={() => setCurrentPage('asset-discovery')}
              className="hero-btn-primary"
              style={{ 
                background: `linear-gradient(135deg, ${brand.colors.secondary}, ${brand.colors.accent})`,
                color: brand.colors.primary
              }}
            >
              Asset-Discovery starten
              <ArrowRight size={20} />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => setCurrentPage('hidden-scanner')}
              className="hero-btn-secondary"
            >
              Hidden Scanner demo
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="stats-grid"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="stat-card"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div 
                  className="stat-icon"
                  style={{ 
                    background: `rgba(6, 182, 212, 0.1)`,
                    color: brand.colors.secondary 
                  }}
                >
                  <Icon size={24} />
                </div>
                <div className="stat-value">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="stat-number"
                    style={{ color: brand.colors.text }}
                  >
                    {stat.value}
                  </motion.span>
                  <span 
                    className="stat-suffix"
                    style={{ color: brand.colors.secondary }}
                  >
                    {stat.suffix}
                  </span>
                </div>
                <span 
                  className="stat-label"
                  style={{ color: brand.colors.textMuted }}
                >
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="features-section"
      >
        <h2 
          className="section-title"
          style={{ color: brand.colors.text }}
        >
          Die <span className="gradient-text">Big Five</span> Asset-Klassen
        </h2>

        <div className="features-grid">
          {[
            { name: 'Bitcoin', desc: 'Vollständige Wallet-Erfassung', icon: '₿', color: '#f7931a' },
            { name: 'Ethereum', desc: 'Inkl. Smart Contract-Check', icon: 'Ξ', color: '#627eea' },
            { name: 'Stablecoins', desc: 'USDC/USDT/DAI nach Plattform', icon: 'S', color: '#27ae60' },
            { name: 'NFTs', desc: 'Manuelle Validierung', icon: '🎨', color: '#9b59b6', badge: 'NEU' },
            { name: 'Gaming', desc: 'AGB-konforme Liquidation', icon: '🎮', color: '#e74c3c', badge: 'NEU' },
          ].map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="feature-card"
              whileHover={{ scale: 1.02 }}
            >
              {feature.badge && (
                <span 
                  className="feature-badge"
                  style={{ 
                    background: `rgba(245, 158, 11, 0.2)`,
                    color: '#f59e0b'
                  }}
                >
                  {feature.badge}
                </span>
              )}
              <div 
                className="feature-icon"
                style={{ 
                  background: `${feature.color}20`,
                  color: feature.color 
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ color: brand.colors.text }}>{feature.name}</h3>
              <p style={{ color: brand.colors.textMuted }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="cta-section"
      >
        <div 
          className="cta-card"
          style={{ 
            background: `linear-gradient(135deg, ${brand.colors.primary}80, ${brand.colors.surface})`,
            border: `1px solid rgba(6, 182, 212, 0.2)`
          }}
        >
          <h2 style={{ color: brand.colors.text }}>
            Bereit für die vollständige Erbfolge?
          </h2>
          <p style={{ color: brand.colors.textMuted }}>
            Starten Sie jetzt die Asset-Discovery und erfassen Sie alle fünf Asset-Klassen 
            Ihrer Mandanten – als erster Berater in Deutschland.
          </p>
          <Button
            size="lg"
            onClick={() => setCurrentPage('asset-discovery')}
            className="cta-btn"
            style={{ 
              background: brand.colors.secondary,
              color: brand.colors.primary
            }}
          >
            Jetzt starten
            <ArrowRight size={20} />
          </Button>
        </div>
      </motion.section>

      <style>{`
        .landing-page {
          display: flex;
          flex-direction: column;
          gap: 48px;
          padding-bottom: 48px;
        }

        .hero-section {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 24px;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-btn-primary {
          font-weight: 600;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-btn-secondary {
          border-color: rgba(148, 163, 184, 0.3);
          color: var(--brand-text);
          padding: 14px 28px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: rgba(6, 182, 212, 0.3);
          box-shadow: 0 8px 32px rgba(6, 182, 212, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-value {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .stat-suffix {
          font-size: 1rem;
          font-weight: 600;
        }

        .stat-label {
          font-size: 0.875rem;
        }

        .features-section {
          text-align: center;
        }

        .section-title {
          font-size: 2rem;
          margin-bottom: 32px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .feature-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 24px 16px;
          position: relative;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          border-color: rgba(6, 182, 212, 0.3);
        }

        .feature-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 16px;
        }

        .feature-card h3 {
          font-size: 1.125rem;
          margin-bottom: 8px;
        }

        .feature-card p {
          font-size: 0.875rem;
        }

        .cta-section {
          margin-top: 16px;
        }

        .cta-card {
          border-radius: 20px;
          padding: 48px;
          text-align: center;
        }

        .cta-card h2 {
          font-size: 1.75rem;
          margin-bottom: 16px;
        }

        .cta-card p {
          max-width: 500px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }

        .cta-btn {
          font-weight: 600;
          padding: 14px 32px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 1200px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero-title {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .cta-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}
