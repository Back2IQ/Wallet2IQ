import { useMemo, useState } from 'react';
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
} from '@/components/ui';
import { ModuleHeader } from '@/components/ModuleHeader';
import {
  evaluateTransfer,
  DEFAULT_POLICY,
  type TransferRequest,
  type TransferGatePolicy,
} from '@/lib/transferGate';
import { formatDuration } from '@/lib/utils';
import { ShieldCheck, Clock, Stamp, Users, Ban } from 'lucide-react';

export function TransferGate() {
  const [policy, setPolicy] = useState<TransferGatePolicy>(DEFAULT_POLICY);
  const [req, setReq] = useState<TransferRequest>({
    amountUSD: 12000,
    recipient: '0xB0E3F2a76f1B4E5e3b98cFc9fE87aA3F8aD6E019',
    isEmergency: false,
    sentinelTriggered: false,
  });
  const [blockedInput, setBlockedInput] = useState('');

  const decision = useMemo(() => evaluateTransfer(req, policy), [req, policy]);

  function addBlocked() {
    if (!blockedInput) return;
    setPolicy({ ...policy, blockedRecipients: [...policy.blockedRecipients, blockedInput] });
    setBlockedInput('');
  }

  function removeBlocked(addr: string) {
    setPolicy({ ...policy, blockedRecipients: policy.blockedRecipients.filter((a) => a !== addr) });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<ShieldCheck className="w-5 h-5" />}
        title="Transfer Gate"
        subtitle="Pre-tx policy evaluator — time-lock, notary, guardian quorum"
        badges={[
          <Badge key="1" tone={decision.allowed ? 'emerald' : 'rose'}>
            {decision.allowed ? 'Allowed' : 'Blocked'}
          </Badge>,
          <Badge key="2" tone="sky">Timelock {decision.timeLockHours}h</Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Simulate a transfer</CardTitle>
          <CardDescription>
            Configure the transfer and see which guards apply before it can sign. Policy evaluation is deterministic
            and runs entirely client-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                value={req.amountUSD}
                onChange={(e) => setReq({ ...req, amountUSD: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Input
                value={req.recipient}
                onChange={(e) => setReq({ ...req, recipient: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Toggle
              label="Emergency flag"
              value={req.isEmergency}
              onChange={(v) => setReq({ ...req, isEmergency: v })}
            />
            <Toggle
              label="Sentinel triggered"
              value={req.sentinelTriggered}
              onChange={(v) => setReq({ ...req, sentinelTriggered: v })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Notary threshold (USD)</Label>
              <Input
                type="number"
                value={policy.notaryThresholdUSD}
                onChange={(e) => setPolicy({ ...policy, notaryThresholdUSD: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Base time-lock (hours)</Label>
              <Input
                type="number"
                value={policy.baseTimeLockHours}
                onChange={(e) => setPolicy({ ...policy, baseTimeLockHours: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
          <CardDescription>Live result — changes as you type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {decision.blockReason && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-signal-rose/30 bg-signal-rose/10 text-signal-rose text-sm">
              <Ban className="w-4 h-4" /> {decision.blockReason}
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-2">
            <GuardCell
              on={decision.requiresNotary}
              icon={<Stamp className="w-4 h-4" />}
              label="Notary"
              detail={decision.requiresNotary ? 'required' : 'not required'}
            />
            <GuardCell
              on={decision.requiresGuardianApproval}
              icon={<Users className="w-4 h-4" />}
              label="Guardians"
              detail={decision.requiresGuardianApproval ? 'quorum required' : 'not required'}
            />
            <GuardCell
              on={decision.timeLockHours > 0}
              icon={<Clock className="w-4 h-4" />}
              label="Time-lock"
              detail={formatDuration(decision.timeLockHours * 60 * 60 * 1000)}
            />
          </div>

          {decision.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {decision.reasons.map((r) => (
                <Badge key={r} tone="amber">{r.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked recipients</CardTitle>
          <CardDescription>Addresses in this list always fail the gate, regardless of amount.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="0x..."
              value={blockedInput}
              onChange={(e) => setBlockedInput(e.target.value.trim())}
            />
            <Button variant="secondary" onClick={addBlocked}>Add</Button>
          </div>
          {policy.blockedRecipients.length > 0 && (
            <div className="space-y-1.5">
              {policy.blockedRecipients.map((a) => (
                <div key={a} className="flex items-center justify-between p-2 rounded-md bg-vault-900 border border-vault-700">
                  <span className="font-mono text-xs text-vault-200 break-all">{a}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeBlocked(a)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Explainer title="Defense in depth, not defense in cleverness" tone="sky">
        The gate composes independent guards: every big transfer requires a notary <em>and</em> guardians <em>and</em> a
        time-lock. Any single bypass still leaves the others standing — that's the difference between layered defense
        and single-point-of-trust.
      </Explainer>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
        value
          ? 'bg-signal-amber/10 border-signal-amber/30 text-vault-100'
          : 'bg-vault-900 border-vault-700 text-vault-300 hover:bg-vault-800'
      }`}
    >
      <span className="text-xs font-medium">{label}</span>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-signal-amber' : 'bg-vault-700'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
  );
}

function GuardCell({ on, icon, label, detail }: { on: boolean; icon: React.ReactNode; label: string; detail: string }) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        on ? 'bg-signal-emerald/5 border-signal-emerald/30' : 'bg-vault-900 border-vault-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={on ? 'text-signal-emerald' : 'text-vault-500'}>{icon}</span>
        <span className="text-xs font-medium text-vault-100">{label}</span>
      </div>
      <div className={`text-xxs font-mono mt-1 ${on ? 'text-signal-emerald' : 'text-vault-500'}`}>{detail}</div>
    </div>
  );
}
