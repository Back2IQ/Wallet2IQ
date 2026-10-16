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
  buildReport,
  type CheckInput,
  type Jurisdiction,
  type Severity,
} from '@/lib/compliance';
import { ClipboardCheck, Download, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const JURISDICTIONS: Jurisdiction[] = ['DE', 'AT', 'CH', 'EU', 'US', 'UK', 'OTHER'];

const severityIcon: Record<Severity, React.ReactNode> = {
  critical: <AlertCircle className="w-4 h-4 text-signal-rose" />,
  warning: <AlertTriangle className="w-4 h-4 text-signal-amber" />,
  info: <Info className="w-4 h-4 text-signal-sky" />,
  ok: <CheckCircle2 className="w-4 h-4 text-signal-emerald" />,
};

export function Compliance() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('DE');
  const [input, setInput] = useState<CheckInput>({
    hasBeneficiaries: true,
    beneficiaryCount: 1,
    hasGuardians: true,
    guardianCount: 2,
    hasNotary: false,
    dmsEnabled: true,
    hasInheritanceContainer: false,
    keyFragmentsDistributed: true,
    encryptionEnabled: true,
    totalValueUSD: 25000,
  });

  const report = useMemo(() => buildReport(input, jurisdiction), [input, jurisdiction]);

  function toggle<K extends keyof CheckInput>(k: K, v: CheckInput[K]) {
    setInput((prev) => ({ ...prev, [k]: v }));
  }

  function download() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${jurisdiction}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<ClipboardCheck className="w-5 h-5" />}
        title="Compliance Dashboard"
        subtitle="MiCA · BGH · GDPR · AML · Inheritance — live evaluated"
        badges={[
          <Badge key="1" tone={
            report.overallStatus === 'compliant' ? 'emerald'
              : report.overallStatus === 'action_required' ? 'amber' : 'rose'
          }>
            {report.overallStatus.replace('_', ' ')}
          </Badge>,
          <Badge key="2" tone="sky">Score {report.score}</Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Toggle your wallet state. Checks re-run on every change — no network, fully local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Jurisdiction</Label>
            <div className="flex gap-2 flex-wrap">
              {JURISDICTIONS.map((j) => (
                <button
                  key={j}
                  onClick={() => setJurisdiction(j)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                    jurisdiction === j
                      ? 'bg-signal-violet/15 border-signal-violet/40 text-signal-violet'
                      : 'bg-vault-900 border-vault-700 text-vault-300 hover:bg-vault-800'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Toggle label="Beneficiaries designated" value={input.hasBeneficiaries} onChange={(v) => toggle('hasBeneficiaries', v)} />
            <Toggle label="Guardians (≥ 2)" value={input.hasGuardians && input.guardianCount >= 2} onChange={(v) => { toggle('hasGuardians', v); toggle('guardianCount', v ? 2 : 0); }} />
            <Toggle label="Notary connected" value={input.hasNotary} onChange={(v) => toggle('hasNotary', v)} />
            <Toggle label="Dead-Man's Switch enabled" value={input.dmsEnabled} onChange={(v) => toggle('dmsEnabled', v)} />
            <Toggle label="Inheritance Container" value={input.hasInheritanceContainer} onChange={(v) => toggle('hasInheritanceContainer', v)} />
            <Toggle label="Key fragments distributed" value={input.keyFragmentsDistributed} onChange={(v) => toggle('keyFragmentsDistributed', v)} />
            <Toggle label="Encryption enabled" value={input.encryptionEnabled} onChange={(v) => toggle('encryptionEnabled', v)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Total portfolio value (USD)</Label>
              <Input
                type="number"
                value={input.totalValueUSD}
                onChange={(e) => toggle('totalValueUSD', Number(e.target.value))}
              />
            </div>
          </div>

          <Button variant="secondary" onClick={download}>
            <Download className="w-4 h-4" /> Download JSON report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checks ({report.checks.length})</CardTitle>
          <CardDescription>Filtered to {jurisdiction}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.checks.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-lg border ${
                c.passed ? 'border-vault-700 bg-vault-900' : 'border-signal-rose/20 bg-signal-rose/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">{severityIcon[c.severity]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-vault-100">{c.title}</span>
                    <Badge tone="neutral">{c.category.toUpperCase()}</Badge>
                  </div>
                  <div className="text-xs text-vault-400 mt-1">{c.description}</div>
                  {c.actionRequired && !c.passed && (
                    <div className="text-xs text-signal-amber font-mono mt-1.5">
                      Action: {c.actionRequired}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Explainer title="Why jurisdiction matters" tone="violet">
        MiCA is EU-wide, BGH case law is German, AML thresholds differ per country. Compliance is not a boolean —
        it depends on where the user is resident and where the assets sit. This dashboard filters the check catalog
        per jurisdiction so you only see what actually applies.
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
          ? 'bg-signal-emerald/10 border-signal-emerald/30 text-vault-100'
          : 'bg-vault-900 border-vault-700 text-vault-300 hover:bg-vault-800'
      }`}
    >
      <span className="text-xs font-medium">{label}</span>
      <div
        className={`w-8 h-4 rounded-full relative transition-colors ${
          value ? 'bg-signal-emerald' : 'bg-vault-700'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  );
}
