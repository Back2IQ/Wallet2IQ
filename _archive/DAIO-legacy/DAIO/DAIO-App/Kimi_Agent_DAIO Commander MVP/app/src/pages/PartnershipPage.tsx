// DAIO Commander - Partnership Page
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { brandConfigs } from '@/config/branding';
import { Button } from '@/components/ui/button';
import { 
  Handshake, 
  Building2, 
  Cpu, 
  Users, 
  Calendar, 
  Check,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';

export function PartnershipPage() {
  const { brandMode } = useStore();
  const brand = brandConfigs[brandMode];

  const pilotOffer = {
    duration: '90 Tage',
    clients: '3 Mandanten',
    cost: 'Kostenlos',
    includes: [
      'Vollständiger DAIO Commander Zugang',
      'White-Label-Integration',
      'Schulung für Beraterteam',
      'Prioritäts-Support',
      'Exklusive Daten-Einblicke',
    ],
  };

  const pillars = [
    {
      icon: Cpu,
      title: 'Back2IQ',
      subtitle: 'Technology Partner',
      description: 'Entwicklung und Betrieb der DAIO Commander Plattform. Kontinuierliche Innovation und Feature-Entwicklung.',
      color: '#06b6d4',
    },
    {
      icon: Building2,
      title: 'F&P Kapitalstrukturen',
      subtitle: 'Advisory Partner',
      description: 'Rechtliche Expertise und Mandantenbetreuung. Vertrieb und Integration in bestehende Beratungsprozesse.',
      color: '#d4af37',
    },
  ];

  return (
    <div className="partnership-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 style={{ color: brand.colors.text }}>Partnerschaft</h1>
          <p style={{ color: brand.colors.textMuted }}>
            Gemeinsam die digitale Erbfolge in Deutschland neu definieren
          </p>
        </div>
      </motion.div>

      {/* Partnership Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pillars-section"
      >
        <div className="pillars-grid">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="pillar-card"
                style={{ 
                  background: `linear-gradient(135deg, ${pillar.color}15, ${pillar.color}05)`,
                  border: `1px solid ${pillar.color}30`
                }}
              >
                <div 
                  className="pillar-icon"
                  style={{ background: `${pillar.color}20` }}
                >
                  <Icon size={32} style={{ color: pillar.color }} />
                </div>
                <h3 style={{ color: brand.colors.text }}>{pillar.title}</h3>
                <span 
                  className="pillar-subtitle"
                  style={{ color: pillar.color }}
                >
                  {pillar.subtitle}
                </span>
                <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="partnership-connector"
        >
          <div className="connector-line" />
          <div 
            className="connector-badge"
            style={{ 
              background: brand.colors.secondary,
              color: brand.colors.primary
            }}
          >
            <Handshake size={20} />
            <span>Strategische Partnerschaft</span>
          </div>
          <div className="connector-line" />
        </motion.div>
      </motion.div>

      {/* Pilot Offer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pilot-offer"
        style={{ 
          background: `linear-gradient(135deg, ${brand.colors.primary}60, ${brand.colors.surface})`,
          border: `1px solid ${brand.colors.secondary}40`
        }}
      >
        <div className="pilot-header">
          <div 
            className="pilot-badge"
            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
          >
            <Sparkles size={16} />
            Pilot-Programm
          </div>
          <h2 style={{ color: brand.colors.text }}>
            Starten Sie mit einem risikofreien Piloten
          </h2>
          <p style={{ color: brand.colors.textMuted }}>
            Testen Sie DAIO Commander mit Ihren ersten Mandanten – ohne Verpflichtungen.
          </p>
        </div>

        <div className="pilot-details">
          <div className="pilot-stats">
            <div className="pilot-stat">
              <Calendar size={24} style={{ color: brand.colors.secondary }} />
              <span className="stat-value" style={{ color: brand.colors.text }}>
                {pilotOffer.duration}
              </span>
              <span className="stat-label" style={{ color: brand.colors.textMuted }}>
                Laufzeit
              </span>
            </div>
            <div className="pilot-stat">
              <Users size={24} style={{ color: brand.colors.secondary }} />
              <span className="stat-value" style={{ color: brand.colors.text }}>
                {pilotOffer.clients}
              </span>
              <span className="stat-label" style={{ color: brand.colors.textMuted }}>
                Umfang
              </span>
            </div>
            <div className="pilot-stat">
              <Check size={24} style={{ color: '#22c55e' }} />
              <span className="stat-value" style={{ color: '#22c55e' }}>
                {pilotOffer.cost}
              </span>
              <span className="stat-label" style={{ color: brand.colors.textMuted }}>
                Kosten
              </span>
            </div>
          </div>

          <div className="pilot-includes">
            <h4 style={{ color: brand.colors.text, marginBottom: 12 }}>
              Enthalten im Pilot:
            </h4>
            <ul>
              {pilotOffer.includes.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  style={{ color: brand.colors.textMuted }}
                >
                  <Check size={16} style={{ color: '#22c55e' }} />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pilot-cta">
          <Button
            size="lg"
            style={{ 
              background: brand.colors.secondary,
              color: brand.colors.primary
            }}
          >
            Pilot-Programm beantragen
            <ArrowRight size={20} />
          </Button>
        </div>
      </motion.div>

      {/* Meeting Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="meeting-section"
      >
        <div 
          className="meeting-card"
          style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, padding: 24 }}
        >
          <h3 style={{ color: brand.colors.text, marginBottom: 16 }}>
            Nächster Schritt: Kick-off Meeting
          </h3>
          
          <div className="meeting-details">
            <div className="meeting-info">
              <div className="info-row">
                <Calendar size={18} style={{ color: brand.colors.secondary }} />
                <span style={{ color: brand.colors.text }}>
                  18. Februar 2026, 15:30 Uhr
                </span>
              </div>
              <div className="info-row">
                <MapPin size={18} style={{ color: brand.colors.secondary }} />
                <span style={{ color: brand.colors.textMuted }}>
                  F&P Kapitalstrukturen, Nürnberg
                </span>
              </div>
              <div className="info-row">
                <Users size={18} style={{ color: brand.colors.secondary }} />
                <span style={{ color: brand.colors.textMuted }}>
                  Ivo Fritsche & Back2IQ Team
                </span>
              </div>
            </div>

            <div className="meeting-actions">
              <Button
                variant="outline"
                className="action-btn"
              >
                <Mail size={18} />
                Einladung senden
              </Button>
              <Button
                variant="outline"
                className="action-btn"
              >
                <Phone size={18} />
                Termin bestätigen
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="contact-section"
      >
        <div className="contact-grid">
          <div 
            className="contact-card"
            style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)' }}
          >
            <h4 style={{ color: brand.colors.text }}>Back2IQ</h4>
            <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
              Technology & Product Development
            </p>
            <a 
              href="mailto:partner@back2iq.de" 
              className="contact-link"
              style={{ color: brand.colors.secondary }}
            >
              partner@back2iq.de
            </a>
          </div>

          <div 
            className="contact-card"
            style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
          >
            <h4 style={{ color: brand.colors.text }}>F&P Kapitalstrukturen</h4>
            <p style={{ color: brand.colors.textMuted, fontSize: '0.875rem' }}>
              Advisory & Mandantenbetreuung
            </p>
            <a 
              href="mailto:info@fp-kapital.de" 
              className="contact-link"
              style={{ color: '#d4af37' }}
            >
              info@fp-kapital.de
            </a>
          </div>
        </div>
      </motion.div>

      <style>{`
        .partnership-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .pillars-section {
          position: relative;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .pillar-card {
          border-radius: 16px;
          padding: 32px;
          text-align: center;
        }

        .pillar-icon {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .pillar-card h3 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .pillar-subtitle {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .partnership-connector {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: -20px 0;
          position: relative;
          z-index: 10;
        }

        .connector-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent);
        }

        .connector-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .pilot-offer {
          border-radius: 20px;
          padding: 32px;
        }

        .pilot-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .pilot-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .pilot-header h2 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .pilot-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }

        .pilot-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pilot-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 12px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 8px 0 4px;
        }

        .stat-label {
          font-size: 0.875rem;
        }

        .pilot-includes {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 12px;
          padding: 20px;
        }

        .pilot-includes ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pilot-includes li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
        }

        .pilot-cta {
          display: flex;
          justify-content: center;
        }

        .meeting-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .meeting-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .meeting-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .contact-card {
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .contact-card h4 {
          margin-bottom: 4px;
        }

        .contact-link {
          display: inline-block;
          margin-top: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .pillars-grid {
            grid-template-columns: 1fr;
          }

          .partnership-connector {
            margin: 20px 0;
          }

          .connector-line {
            display: none;
          }

          .pilot-details {
            grid-template-columns: 1fr;
          }

          .meeting-details {
            flex-direction: column;
            align-items: flex-start;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
