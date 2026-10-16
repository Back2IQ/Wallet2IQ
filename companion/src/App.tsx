import { useEffect, useState } from 'react';
import { Sidebar, MODULES, type ModuleKey } from '@/components/Sidebar';
import { DeviceBinding } from '@/modules/DeviceBinding';
import { RateLimit } from '@/modules/RateLimit';
import { SocialRecovery } from '@/modules/SocialRecovery';
import { Shamir } from '@/modules/Shamir';
import { Honeypot } from '@/modules/Honeypot';
import { SecureDisplay } from '@/modules/SecureDisplay';
import { SecretDetector } from '@/modules/SecretDetector';
import { Compliance } from '@/modules/Compliance';
import { Approvals } from '@/modules/Approvals';
import { NotaryAnchor } from '@/modules/NotaryAnchor';
import { DeadManSwitch } from '@/modules/DeadManSwitch';
import { TransferGate } from '@/modules/TransferGate';
import { Menu, X, Github, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui';

const COMPONENTS: Record<ModuleKey, React.ComponentType> = {
  device: DeviceBinding,
  rate: RateLimit,
  social: SocialRecovery,
  shamir: Shamir,
  honeypot: Honeypot,
  display: SecureDisplay,
  detector: SecretDetector,
  compliance: Compliance,
  approvals: Approvals,
  notary: NotaryAnchor,
  dms: DeadManSwitch,
  gate: TransferGate,
};

function getInitialModule(): ModuleKey {
  const hash = window.location.hash.replace('#/', '') as ModuleKey;
  if (hash && COMPONENTS[hash]) return hash;
  return 'device';
}

export function App() {
  const [active, setActive] = useState<ModuleKey>(getInitialModule);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    window.location.hash = `/${active}`;
  }, [active]);

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#/', '') as ModuleKey;
      if (hash && COMPONENTS[hash]) setActive(hash);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function handleSelect(k: ModuleKey) {
    setActive(k);
    setSidebarOpen(false);
  }

  const ActiveComponent = COMPONENTS[active];
  const activeMeta = MODULES.find((m) => m.key === active);

  return (
    <div className="min-h-screen grid-bg">
      <div className="lg:flex">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-vault-800 bg-vault-950/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-vault-800 text-vault-200"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-sm font-semibold text-vault-50">DAIO Security</span>
            <Badge tone="emerald">Companion</Badge>
          </div>
        </header>

        {/* Sidebar: mobile drawer + desktop sticky column */}
        <div
          className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-0 lg:inset-auto z-40 bg-vault-950 lg:bg-transparent`}
        >
          <Sidebar active={active} onSelect={handleSelect} />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-5 lg:p-10 max-w-5xl">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div className="text-xxs font-mono uppercase tracking-wider text-vault-500">
                {activeMeta?.group}
              </div>
              <h1 className="text-lg font-semibold text-vault-50">
                {activeMeta?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/anthropics/daio-wallet"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-vault-400 hover:text-vault-200 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                source
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <ActiveComponent />

          <footer className="mt-16 pt-6 border-t border-vault-800 text-xxs font-mono text-vault-500">
            DAIO Security Companion · runs 100% in your browser · no telemetry · MIT
          </footer>
        </main>
      </div>
    </div>
  );
}
