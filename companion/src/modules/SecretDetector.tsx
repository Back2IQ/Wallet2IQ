import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Textarea,
  Badge,
  Explainer,
  Label,
} from '@/components/ui';
import { ModuleHeader } from '@/components/ModuleHeader';
import { scanText, redactText, kindLabel, type Finding } from '@/lib/secretDetector';
import { ScanLine, Eraser, FileSearch } from 'lucide-react';

const SAMPLE = `Hi support, my wallet stopped working. Here are some details.
My seed phrase is: abandon ability able about above absent absorb abstract absurd abuse access accident
My address: 0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
API token: sk_demo_EXAMPLE_NOT_A_REAL_KEY_00
JWT: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def456
Also this hex 0x4c0883a69102937d6231471b5dbb6204fe5129617082795c2e1b8d0e2ab60c2c`;

const severityTone: Record<Finding['severity'], 'rose' | 'amber' | 'sky' | 'neutral'> = {
  critical: 'rose',
  high: 'amber',
  medium: 'sky',
  low: 'neutral',
};

export function SecretDetector() {
  const [text, setText] = useState(SAMPLE);

  const findings = useMemo(() => scanText(text), [text]);
  const redacted = useMemo(() => redactText(text), [text]);
  const criticalCount = findings.filter((f) => f.severity === 'critical').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<ScanLine className="w-5 h-5" />}
        title="Secret / PII Detector"
        subtitle="Real-time scan for seeds, private keys, JWTs, API tokens"
        badges={[
          <Badge key="1" tone={findings.length > 0 ? 'rose' : 'emerald'}>
            {findings.length} finding{findings.length === 1 ? '' : 's'}
          </Badge>,
          <Badge key="2" tone={criticalCount > 0 ? 'rose' : 'neutral'}>
            {criticalCount} critical
          </Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Paste suspicious text</CardTitle>
          <CardDescription>
            Try pasting a support ticket, log, or clipboard content. The scanner flags 8 categories of secret in
            real time — everything runs locally in this tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Input text</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} />
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setText(SAMPLE)}>
              <FileSearch className="w-4 h-4" /> Load sample
            </Button>
            <Button variant="secondary" onClick={() => setText(redacted)}>
              <Eraser className="w-4 h-4" /> Redact in place
            </Button>
          </div>
        </CardContent>
      </Card>

      {findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Findings</CardTitle>
            <CardDescription>Redacted preview — safe to copy or log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {findings.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-vault-700 bg-vault-900"
              >
                <Badge tone={severityTone[f.severity]}>{f.severity}</Badge>
                <div className="flex-1">
                  <div className="text-xs font-mono text-vault-300">{kindLabel(f.kind)}</div>
                  <div className="text-xs font-mono text-vault-100 break-all">{f.redacted}</div>
                </div>
                <div className="text-xxs font-mono text-vault-500">@ {f.index}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Redacted output</CardTitle>
          <CardDescription>A copy-safe version of the same input.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono text-vault-200 whitespace-pre-wrap break-all bg-vault-900 border border-vault-700 rounded-lg p-3">
{redacted}
          </pre>
        </CardContent>
      </Card>

      <Explainer title="Use it as a support-chat guard" tone="sky">
        Wire this into any textarea where users submit text to your operators. It strips secrets client-side before
        a single keystroke leaves the browser, so your logs and CRM never see them.
      </Explainer>
    </div>
  );
}
