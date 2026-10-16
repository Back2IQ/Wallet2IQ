// DAIO Commander - Header with Brand Toggle
import { motion } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { brandConfigs } from '@/config/branding';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Building2, Sparkles, HelpCircle, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const { brandMode, toggleBrandMode } = useStore();
  const brand = brandConfigs[brandMode];
  const [isDark, setIsDark] = useState(true);

  // Keyboard shortcut for help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Show help modal
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <motion.div 
          className="page-indicator"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          key={brandMode}
        >
          <Sparkles 
            size={16} 
            style={{ color: brand.colors.secondary }}
          />
          <span style={{ color: brand.colors.textMuted }}>
            {brandMode === 'back2iq' ? 'Back2IQ Edition' : 'F&P White-Label'}
          </span>
        </motion.div>
      </div>

      <div className="header-center">
        <div className="brand-toggle">
          <span 
            className={`toggle-label ${brandMode === 'back2iq' ? 'active' : ''}`}
            style={{ 
              color: brandMode === 'back2iq' 
                ? brand.colors.text 
                : brand.colors.textMuted 
            }}
          >
            Back2IQ
          </span>
          
          <Switch
            checked={brandMode === 'fp'}
            onCheckedChange={toggleBrandMode}
            className="brand-switch"
          />
          
          <span 
            className={`toggle-label ${brandMode === 'fp' ? 'active' : ''}`}
            style={{ 
              color: brandMode === 'fp' 
                ? brand.colors.text 
                : brand.colors.textMuted 
            }}
          >
            <Building2 size={14} />
            F&P
          </span>
        </div>
      </div>

      <div className="header-right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="header-btn"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dark Mode umschalten</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="header-btn">
                <HelpCircle size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tastenkürzel: ? für Hilfe</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <style>{`
        .header {
          height: 64px;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: relative;
          z-index: 100;
        }

        .header-left,
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .header-right {
          justify-content: flex-end;
        }

        .page-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }

        .brand-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(30, 41, 59, 0.6);
          padding: 6px 16px;
          border-radius: 20px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .toggle-label.active {
          font-weight: 600;
        }

        .brand-switch {
          transform: scale(0.9);
        }

        .header-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: rgba(30, 41, 59, 0.6);
          color: var(--brand-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .header-btn:hover {
          background: rgba(30, 41, 59, 0.9);
          color: var(--brand-text);
        }

        @media (max-width: 768px) {
          .header {
            padding: 0 16px;
          }

          .brand-toggle {
            padding: 4px 12px;
          }

          .toggle-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </header>
  );
}
