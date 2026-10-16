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
} from '@/components/ui';
import { ModuleHeader } from '@/components/ModuleHeader';
import {
  splitSecret,
  reconstructSecret,
  verifyShare,
  type Share,
  type FeldmanCommitments,
} from '@/lib/shamir';
import { shortHash } from '@/lib/utils';
import { Scissors, Merge, CheckCircle2, ShieldAlert, Copy, Check } from 'lucide-react';

export function Shamir() {
  const [secret, setSecret] = useState('correct horse battery staple');
  const [threshold, setThreshold] = useState(3);
  const [total, setTotal] = useState(5);
  const [shares, setShares] = useState<Share[]>([]);
  const [commitments, setCommitments] = useState<FeldmanCommitments | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [reconstructed, setReconstructed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSplit() {
    setError(null);
    try {
      const result = splitSecret(secret, threshold, total);
      setShares(result.shares);
      setCommitments(result.commitments);
      setSelected(new Set());
      setReconstructed(null);
    } catch (e) {
      setError(String(e));
    }
  }

  function toggleShare(i: number) {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  }

  function handleReconstruct() {
    setError(null);
    try {
      const chosen = Array.from(selected).map((i) => shares[i]);
      setReconstructed(reconstructSecret(chosen));
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Scissors className="w-5 h-5" />}
        title="Shamir Secret Sharing"
        subtitle="Pure BigInt GF(p) implementation with Feldman VSS commitments"
        badges={[
          <Badge key="1" tone="emerald">256-bit field</Badge>,
          <Badge key="2" tone="sky">VSS-verifiable</Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Split</CardTitle>
          <CardDescription>
            Split a secret into N shares where any T of them can reconstruct it. Feldman commitments let anyone
            verify a share without knowing the secret.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Secret</Label>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Threshold (T)</Label>
              <Input
                type="number"
                min={2}
                max={total}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Shares (N)</Label>
              <Input
                type="number"
                min={threshold}
                max={12}
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
              />
            </div>
          </div>
          <Button variant="primary" onClick={handleSplit}>
            <Scissors className="w-4 h-4" /> Split Secret
          </Button>
          {error && <div className="text-sm text-signal-rose font-mono">{error}</div>}
        </CardContent>
      </Card>

      {shares.length > 0 && commitments && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Shares</CardTitle>
            <CardDescription>
              Select any {threshold} shares and reconstruct. Each share is VSS-verifiable in isolation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              {shares.map((share, i) => {
                const ok = verifyShare(share, commitments);
                const isSelected = selected.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleShare(i)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-signal-emerald/10 border-signal-emerald/40'
                        : 'bg-vault-900 border-vault-700 hover:bg-vault-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-vault-800 border border-vault-700 flex items-center justify-center text-xxs font-mono text-vault-300">
                      {share.index}
                    </div>
                    <div className="flex-1 font-mono text-xs text-vault-200 truncate">
                      {shortHash(share.value, 16, 12)}
                    </div>
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 text-signal-emerald" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-signal-rose" />
                    )}
                    {isSelected && <Check className="w-4 h-4 text-signal-emerald" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-vault-400">
              <span>
                {selected.size} / {threshold} shares selected
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReconstruct}
                disabled={selected.size < threshold}
              >
                <Merge className="w-4 h-4" /> Reconstruct
              </Button>
            </div>
            {reconstructed !== null && (
              <div className="p-4 rounded-lg bg-signal-emerald/5 border border-signal-emerald/20">
                <div className="text-xxs font-mono uppercase tracking-wider text-signal-emerald mb-1">
                  Reconstructed secret
                </div>
                <div className="font-mono text-sm text-vault-100">{reconstructed}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Explainer title="Feldman VSS guarantees" tone="violet">
        Each share ships with commitments <code className="font-mono">g^aᵢ mod p</code>. A recipient can verify that
        their share lies on the dealer's promised polynomial without learning the secret or any other share. This
        detects malicious dealers and transport corruption.
      </Explainer>
    </div>
  );
}
