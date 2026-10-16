import { cn } from '@/lib/utils';
import {
  Fingerprint,
  Gauge,
  Users,
  Scissors,
  Bug,
  Monitor,
  ScanLine,
  ClipboardCheck,
  Radar,
  Stamp,
  HeartPulse,
  ShieldCheck,
  Shield,
} from 'lucide-react';

export type ModuleKey =
  | 'device'
  | 'rate'
  | 'social'
  | 'shamir'
  | 'honeypot'
  | 'display'
  | 'detector'
  | 'compliance'
  | 'approvals'
  | 'notary'
  | 'dms'
  | 'gate';

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  group: 'Keys & Access' | 'Heirs & Recovery' | 'Guards & Monitors' | 'Operations';
}

export const MODULES: ModuleDef[] = [
  { key: 'device',     label: 'Device Binding',    description: 'Non-extractable AES-GCM key',         icon: <Fingerprint className="w-4 h-4" />,     group: 'Keys & Access' },
  { key: 'rate',       label: 'Rate Limiter',      description: 'Sliding window, persisted',            icon: <Gauge className="w-4 h-4" />,            group: 'Keys & Access' },
  { key: 'shamir',     label: 'Shamir Sharing',    description: 'GF(p) with Feldman VSS',               icon: <Scissors className="w-4 h-4" />,         group: 'Keys & Access' },
  { key: 'display',    label: 'Secure Display',    description: 'Canvas-only secret render',            icon: <Monitor className="w-4 h-4" />,          group: 'Keys & Access' },

  { key: 'social',     label: 'Social Recovery',   description: 'Guardians + veto window',              icon: <Users className="w-4 h-4" />,            group: 'Heirs & Recovery' },
  { key: 'dms',        label: "Dead-Man's Switch", description: 'Inactivity sentinel',                  icon: <HeartPulse className="w-4 h-4" />,       group: 'Heirs & Recovery' },
  { key: 'notary',     label: 'Notary Anchor',     description: 'keccak256 → on-chain timestamp',       icon: <Stamp className="w-4 h-4" />,            group: 'Heirs & Recovery' },

  { key: 'honeypot',   label: 'Honeypot Vault',    description: 'Decoy + canary shards',                icon: <Bug className="w-4 h-4" />,              group: 'Guards & Monitors' },
  { key: 'detector',   label: 'Secret Detector',   description: 'Seeds, keys, tokens, JWTs',            icon: <ScanLine className="w-4 h-4" />,         group: 'Guards & Monitors' },
  { key: 'gate',       label: 'Transfer Gate',     description: 'Policy eval, timelock, notary',         icon: <ShieldCheck className="w-4 h-4" />,      group: 'Guards & Monitors' },

  { key: 'compliance', label: 'Compliance',        description: 'MiCA · BGH · GDPR · AML',              icon: <ClipboardCheck className="w-4 h-4" />,   group: 'Operations' },
  { key: 'approvals',  label: 'Approvals Scanner', description: 'ERC-20 revoke across 5 chains',         icon: <Radar className="w-4 h-4" />,            group: 'Operations' },
];

const GROUPS: ModuleDef['group'][] = ['Keys & Access', 'Heirs & Recovery', 'Guards & Monitors', 'Operations'];

export function Sidebar({
  active,
  onSelect,
}: {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}) {
  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0 lg:border-r border-vault-800 bg-vault-950/60 backdrop-blur-sm">
      <div className="sticky top-0 p-5 lg:h-screen lg:overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-signal-emerald/80 to-signal-emerald/30 flex items-center justify-center shadow-vault-glow">
            <Shield className="w-5 h-5 text-vault-950" />
          </div>
          <div>
            <div className="text-sm font-semibold text-vault-50 tracking-tight">DAIO Security</div>
            <div className="text-xxs font-mono text-vault-500 uppercase tracking-wider">Companion</div>
          </div>
        </div>

        <nav className="space-y-5">
          {GROUPS.map((group) => (
            <div key={group}>
              <div className="text-xxs font-semibold uppercase tracking-wider text-vault-500 mb-2 px-2">
                {group}
              </div>
              <div className="space-y-0.5">
                {MODULES.filter((m) => m.group === group).map((m) => {
                  const isActive = m.key === active;
                  return (
                    <button
                      key={m.key}
                      onClick={() => onSelect(m.key)}
                      className={cn(
                        'w-full flex items-start gap-3 px-2.5 py-2 rounded-md text-left transition-all group',
                        isActive
                          ? 'bg-signal-emerald/10 text-vault-50 border-l-2 border-signal-emerald pl-2'
                          : 'text-vault-300 hover:bg-vault-800/60 hover:text-vault-100 border-l-2 border-transparent',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 transition-colors',
                          isActive ? 'text-signal-emerald' : 'text-vault-500 group-hover:text-vault-300',
                        )}
                      >
                        {m.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium leading-tight">{m.label}</span>
                        <span className="block text-xxs font-mono text-vault-500 leading-snug mt-0.5 truncate">
                          {m.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 pt-5 border-t border-vault-800 text-xxs font-mono text-vault-500 space-y-1">
          <div>v0.1.0 · open-source</div>
          <div>12 modules · 0 trackers</div>
        </div>
      </div>
    </aside>
  );
}
