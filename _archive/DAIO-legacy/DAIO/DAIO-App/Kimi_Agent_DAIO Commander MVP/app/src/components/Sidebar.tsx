// DAIO Commander - Sidebar Navigation
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { brandConfigs } from '@/config/branding';
import type { PageType } from '@/types';
import {
  Home,
  Search,
  ScanLine,
  BarChart3,
  FileText,
  Database,
  Handshake,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'landing',
    label: 'Start',
    icon: Home,
    description: 'Die unvollständige Bilanz',
  },
  {
    id: 'asset-discovery',
    label: 'Asset Discovery',
    icon: Search,
    description: 'Big Five erfassen',
  },
  {
    id: 'hidden-scanner',
    label: 'Hidden Scanner',
    icon: ScanLine,
    description: 'Die Enthüllung',
  },
  {
    id: 'loss-estimator',
    label: 'Loss Estimator',
    icon: BarChart3,
    description: 'Die Dimension',
  },
  {
    id: 'template-generator',
    label: 'Templates',
    icon: FileText,
    description: 'Die Umsetzung',
  },
  {
    id: 'data-value',
    label: 'Data Value',
    icon: Database,
    description: 'Strategischer Vorteil',
  },
  {
    id: 'partnership',
    label: 'Partnerschaft',
    icon: Handshake,
    description: 'Gemeinsam stark',
  },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, brandMode, getAssetClassCount } = useStore();
  const brand = brandConfigs[brandMode];
  const assetCount = getAssetClassCount();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <div 
            className="logo-icon"
            style={{ background: brand.colors.secondary }}
          >
            <span style={{ color: brand.colors.primary }}>DAIO</span>
          </div>
          <div className="brand-text">
            <span className="brand-name" style={{ color: brand.colors.text }}>
              {brand.name}
            </span>
            <span className="brand-tagline" style={{ color: brand.colors.textMuted }}>
              {brand.tagline}
            </span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="nav-icon-wrapper"
                style={{ 
                  background: isActive 
                    ? `rgba(6, 182, 212, 0.15)` 
                    : 'transparent'
                }}
              >
                <Icon 
                  size={20} 
                  style={{ 
                    color: isActive 
                      ? brand.colors.secondary 
                      : brand.colors.textMuted 
                  }} 
                />
              </div>
              
              <div className="nav-content">
                <span 
                  className="nav-label"
                  style={{ 
                    color: isActive 
                      ? brand.colors.text 
                      : brand.colors.textMuted 
                  }}
                >
                  {item.label}
                </span>
                <span className="nav-description">
                  {item.description}
                </span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="active-indicator"
                  style={{ background: brand.colors.secondary }}
                />
              )}
              
              <ChevronRight 
                size={16} 
                className="nav-chevron"
                style={{ 
                  opacity: isActive ? 1 : 0,
                  color: brand.colors.secondary 
                }}
              />
            </motion.button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="progress-card">
          <div className="progress-header">
            <span className="progress-label">Asset-Klassen</span>
            <span 
              className="progress-value"
              style={{ color: brand.colors.secondary }}
            >
              {assetCount}/5
            </span>
          </div>
          <div className="progress-bar">
            <motion.div 
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(assetCount / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 280px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border-right: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          gap: 24px;
        }

        .sidebar-header {
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-weight: 600;
          font-size: 1rem;
        }

        .brand-tagline {
          font-size: 0.75rem;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          text-align: left;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: rgba(148, 163, 184, 0.05);
        }

        .nav-item.active {
          background: rgba(6, 182, 212, 0.08);
        }

        .nav-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 2px;
        }

        .nav-label {
          font-weight: 500;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .nav-description {
          font-size: 0.75rem;
          color: var(--brand-text-muted);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          border-radius: 0 3px 3px 0;
        }

        .nav-chevron {
          transition: all 0.2s ease;
        }

        .sidebar-footer {
          padding-top: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .progress-card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
          padding: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .progress-label {
          font-size: 0.875rem;
          color: var(--brand-text-muted);
        }

        .progress-value {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .progress-bar {
          height: 6px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--brand-secondary), var(--brand-accent));
          border-radius: 3px;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 100%;
            flex-direction: row;
            padding: 12px;
            gap: 12px;
          }

          .sidebar-header,
          .sidebar-footer {
            display: none;
          }

          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            gap: 8px;
          }

          .nav-item {
            min-width: 120px;
            flex-direction: column;
            padding: 8px;
          }

          .nav-content {
            align-items: center;
          }

          .nav-description {
            display: none;
          }

          .active-indicator {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
