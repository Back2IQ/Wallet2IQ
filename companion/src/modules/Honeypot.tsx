import { useState } from 'react';
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
  createDecoyVault,
  createCanaryShards,
  fireHoneypotTrigger,
  detectCanary,
  type DecoyVault,
  type CanaryShard,
  type HoneypotTrigger,
} from '@/lib/honeypot';
import { shortHash } from '@/lib/utils';
import { Sparkles, Bug, Siren, ShieldOff, Target } from 'lucide-react';

export function Honeypot() {
  const [label, setLabel] = useState('Personal Vault');
  const [vault, setVault] = useState<DecoyVault | null>(null);
  const [canaries, setCanaries] = useState<CanaryShard[]>([]);
  const [triggers, setTriggers] = useState<HoneypotTrigger[]>([]);

  function spawn() {
    const v = createDecoyVault(label, 3, 5);
    setVault(v);
    setCanaries(createCanaryShards(v.id, 2));
    setTriggers([]);
  }

  async function simulateAttack() {
    if (!vault) return;
    const indicesUsed = [...canaries.map((c) => c.index), 1, 2];
    const hit = detectCanary(canaries);
    if (hit) {
      const trig = await fireHoneypotTrigger(vault, indicesUsed, 'ip=203.0.113.42 / agent=curl/8.2');
      setTriggers((t) => [trig, ...t]);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Bug className="w-5 h-5" />}
        title="Honeypot Vault"
        subtitle="Decoy vaults with canary shards — silent alerts under attack"
        badges={[
          <Badge key="1" tone={vault ? 'sky' : 'neutral'}>
            {vault ? 'Active decoy' : 'No decoy'}
          </Badge>,
          <Badge key="2" tone={triggers.length > 0 ? 'rose' : 'neutral'}>
            <StatusDot tone={triggers.length > 0 ? 'rose' : 'neutral'} pulse={triggers.length > 0} />
            {triggers.length} trigger{triggers.length === 1 ? '' : 's'}
          </Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Deploy Decoy</CardTitle>
          <CardDescription>
            The decoy mirrors the real vault's label so an attacker cannot distinguish them. Canary shards are
            embedded among the legitimate shares; any reconstruction attempt that uses them fires a silent alert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Real vault label (will be mirrored on the decoy)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <Button variant="primary" onClick={spawn}>
            <Sparkles className="w-4 h-4" /> Deploy Decoy + Canaries
          </Button>
        </CardContent>
      </Card>

      {vault && (
        <Card>
          <CardHeader>
            <CardTitle>Decoy Fingerprint</CardTitle>
            <CardDescription>Visible to attackers — looks identical to a real vault.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KV label="Vault ID" value={vault.id} />
            <KV label="Label" value={vault.label} />
            <KV label="Fake secret hint" value={vault.fakeSecretHint} />
            <KV label="Threshold / Total" value={`${vault.threshold} of ${vault.totalShares}`} />
            <div className="pt-2 border-t border-vault-800">
              <div className="text-xxs font-semibold uppercase tracking-wider text-vault-400 mb-2">
                Canary shards
              </div>
              <div className="grid gap-1.5">
                {canaries.map((c) => (
                  <div key={c.index} className="flex items-center gap-3 font-mono text-xs text-vault-300">
                    <Target className="w-3.5 h-3.5 text-signal-amber" />
                    <span className="text-vault-500">idx {c.index}</span>
                    <span className="truncate">{shortHash(c.value, 14, 10)}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="danger" onClick={simulateAttack}>
              <ShieldOff className="w-4 h-4" /> Simulate reconstruction attempt
            </Button>
          </CardContent>
        </Card>
      )}

      {triggers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Siren className="w-4 h-4 text-signal-rose" /> Silent Alerts
            </CardTitle>
            <CardDescription>
              In production these go to the operator via webhook / SIEM. The attacker sees nothing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {triggers.map((t, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-signal-rose/30 bg-signal-rose/5 font-mono text-xs text-vault-200 space-y-1"
              >
                <div className="flex justify-between">
                  <span className="text-signal-rose">{t.timestamp}</span>
                  <span className="text-vault-400">shards: [{t.shardIndicesUsed.join(', ')}]</span>
                </div>
                <div className="text-vault-400">source: {t.sourceInfo}</div>
                <div className="text-vault-500 break-all">alert-token: {t.alertToken.slice(0, 32)}…</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Explainer title="Formel 33 — Nash equilibrium" tone="violet">
        The attacker does not know whether a vault is the real target or the decoy. Any reconstruction attempt on
        the decoy costs them time and fires the alert; abstaining costs them the target. Both branches favour the
        defender.
      </Explainer>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <div className="text-xxs font-semibold uppercase tracking-wider text-vault-400 sm:w-32">{label}</div>
      <div className="flex-1 font-mono text-xs text-vault-200 break-all">{value}</div>
    </div>
  );
}
