import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Badge,
  Explainer,
  StatusDot,
} from '@/components/ui';
import { ModuleHeader } from '@/components/ModuleHeader';
import {
  DEFAULT_RECOVERY_CONFIG,
  createRecoveryRequest,
  submitFragment,
  startVetoPeriod,
  vetoRecovery,
  executeRecovery,
  completeRecovery,
  getRecoveryStatusLabel,
  getVetoTimeRemaining,
  isVetoPeriodExpired,
  type RecoveryRequest,
  type RecoveryConfig,
  type RecoveryStatus,
} from '@/lib/socialRecovery';
import { formatDuration } from '@/lib/utils';
import { Users, ShieldCheck, XCircle, Play, Send, Clock } from 'lucide-react';

const GUARDIANS = [
  { id: 'g1', name: 'Alice (spouse)' },
  { id: 'g2', name: 'Bob (brother)' },
  { id: 'g3', name: 'Dr. Schmidt (notary)' },
];

const DEMO_CONFIG: RecoveryConfig = { ...DEFAULT_RECOVERY_CONFIG, vetoPeriodHours: 0.003 };
// ^ ~10 seconds veto window for the demo

const toneForStatus: Record<RecoveryStatus, 'emerald' | 'amber' | 'rose' | 'sky' | 'neutral' | 'violet'> = {
  idle: 'neutral',
  initiated: 'sky',
  pending_fragments: 'sky',
  fragments_collected: 'amber',
  veto_period: 'amber',
  executing: 'violet',
  completed: 'emerald',
  vetoed: 'rose',
  expired: 'neutral',
};

export function SocialRecovery() {
  const [config, setConfig] = useState(DEMO_CONFIG);
  const [request, setRequest] = useState<RecoveryRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  function start(guardianId: string) {
    setError(null);
    try {
      const g = GUARDIANS.find((x) => x.id === guardianId)!;
      const { request, updatedConfig } = createRecoveryRequest(
        g.id,
        g.name,
        'Owner is unreachable for 30 days',
        config,
      );
      setRequest(request);
      setConfig(updatedConfig);
    } catch (e) {
      setError(String(e));
    }
  }

  function submit(guardianId: string) {
    if (!request) return;
    setError(null);
    try {
      const mockFragment = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const updated = submitFragment(request, guardianId, mockFragment, GUARDIANS.map((g) => g.id));
      setRequest(updated);
    } catch (e) {
      setError(String(e));
    }
  }

  function action(name: 'startVeto' | 'veto' | 'execute' | 'complete') {
    if (!request) return;
    setError(null);
    try {
      const map = {
        startVeto: startVetoPeriod,
        veto: vetoRecovery,
        execute: executeRecovery,
        complete: completeRecovery,
      };
      setRequest(map[name](request));
    } catch (e) {
      setError(String(e));
    }
  }

  const vetoRemaining = request ? getVetoTimeRemaining(request) : 0;
  const canExecute = request?.status === 'veto_period' && isVetoPeriodExpired(request);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Users className="w-5 h-5" />}
        title="Social Recovery"
        subtitle="Guardian-driven key reconstruction with owner veto window"
        badges={[
          <Badge key="1" tone={request ? toneForStatus[request.status] : 'neutral'}>
            <StatusDot tone={request ? toneForStatus[request.status] : 'neutral'} pulse={!!request && request.status !== 'completed' && request.status !== 'vetoed'} />
            {request ? getRecoveryStatusLabel(request.status) : 'Idle'}
          </Badge>,
          <Badge key="2" tone="neutral">Veto {config.vetoPeriodHours}h (demo: 10s)</Badge>,
        ]}
      />

      {!request ? (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Initiate Recovery</CardTitle>
            <CardDescription>
              A guardian starts a recovery request. The owner has a veto window before fragments are combined.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {GUARDIANS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => start(g.id)}
                  className="text-left p-4 rounded-lg border border-vault-700 bg-vault-900 hover:bg-vault-800 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-signal-emerald" />
                    <span className="text-sm font-medium text-vault-100">{g.name}</span>
                  </div>
                  <div className="text-xxs text-vault-500 font-mono uppercase tracking-wide">
                    Start recovery as {g.id}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Recovery Request #{request.id.slice(0, 8)}</CardTitle>
            <CardDescription>Initiated by {request.initiatorName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <Stat label="Fragments" value={`${request.fragmentsCollected.length} / ${request.fragmentsRequired}`} />
              <Stat label="Guardians signed" value={String(request.guardianApprovals.length)} />
              <Stat
                label="Veto remaining"
                value={
                  request.status === 'veto_period'
                    ? formatDuration(vetoRemaining)
                    : request.status === 'fragments_collected'
                      ? 'Not started'
                      : '—'
                }
              />
            </div>

            {(request.status === 'initiated' || request.status === 'pending_fragments') && (
              <div>
                <Label>Guardians — submit fragment</Label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {GUARDIANS.filter((g) => !request.guardianApprovals.includes(g.id)).map((g) => (
                    <Button key={g.id} size="sm" variant="secondary" onClick={() => submit(g.id)}>
                      <Send className="w-3 h-3" /> {g.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {request.status === 'fragments_collected' && (
              <Button variant="primary" onClick={() => action('startVeto')}>
                <Clock className="w-4 h-4" /> Start Veto Period
              </Button>
            )}

            {request.status === 'veto_period' && (
              <div className="flex gap-2 flex-wrap">
                <Button variant="danger" onClick={() => action('veto')}>
                  <XCircle className="w-4 h-4" /> Owner Vetoes
                </Button>
                <Button variant="primary" onClick={() => action('execute')} disabled={!canExecute}>
                  <Play className="w-4 h-4" /> Execute {canExecute ? '' : '(after veto expires)'}
                </Button>
              </div>
            )}

            {request.status === 'executing' && (
              <Button variant="primary" onClick={() => action('complete')}>
                Complete Recovery
              </Button>
            )}

            {request.status === 'completed' && (
              <div className="text-sm text-signal-emerald">Recovery complete.</div>
            )}
            {request.status === 'vetoed' && (
              <div className="text-sm text-signal-rose">Recovery vetoed by owner.</div>
            )}

            {error && <div className="text-sm text-signal-rose font-mono">{error}</div>}

            <div className="pt-2">
              <Button size="sm" variant="ghost" onClick={() => setRequest(null)}>
                Reset demo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Explainer title="Why the veto window" tone="sky">
        Guardians can compromise or be compromised. A veto window gives the real owner the opportunity to abort a
        malicious recovery before shards are combined. Default is 48 hours; this demo uses 10 seconds so you can see
        the full lifecycle.
      </Explainer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-vault-900 border border-vault-800">
      <div className="text-xxs font-mono uppercase tracking-wider text-vault-500">{label}</div>
      <div className="text-base font-semibold text-vault-100 font-mono mt-0.5">{value}</div>
    </div>
  );
}
