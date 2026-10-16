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
  Textarea,
  Badge,
  Explainer,
} from '@/components/ui';
import { ModuleHeader } from '@/components/ModuleHeader';
import {
  scanApprovals,
  buildRevokeTx,
  getSupportedChains,
  type TokenApproval,
} from '@/lib/approvals';
import { Radar, ShieldOff, Loader2, Copy, Check } from 'lucide-react';

const CHAINS = getSupportedChains();

const DEFAULT_TOKENS: Record<number, string> = {
  1: [
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  ].join('\n'),
  137: [
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
  ].join('\n'),
  42161: ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831'].join('\n'), // USDC
  10: ['0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'].join('\n'), // USDC
  8453: ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'].join('\n'), // USDC
};

const riskTone: Record<TokenApproval['riskLevel'], 'rose' | 'amber' | 'sky'> = {
  high: 'rose',
  medium: 'amber',
  low: 'sky',
};

export function Approvals() {
  const [chainId, setChainId] = useState(1);
  const [owner, setOwner] = useState('');
  const [tokens, setTokens] = useState(DEFAULT_TOKENS[1]);
  const [approvals, setApprovals] = useState<TokenApproval[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function scan() {
    setError(null);
    setApprovals(null);
    const tokenList = tokens
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!owner || !owner.startsWith('0x') || owner.length !== 42) {
      setError('Enter a valid 0x address for the owner');
      return;
    }
    if (tokenList.length === 0) {
      setError('Add at least one token address');
      return;
    }
    setLoading(true);
    try {
      const r = await scanApprovals(chainId, owner, tokenList);
      setApprovals(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function revoke(a: TokenApproval) {
    const tx = buildRevokeTx(a.tokenAddress, a.spender);
    const payload = JSON.stringify(
      { to: tx.to, data: tx.data, value: tx.value.toString() },
      null,
      2,
    );
    navigator.clipboard.writeText(payload);
    setCopied(a.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Radar className="w-5 h-5" />}
        title="Approvals Scanner"
        subtitle="Find and revoke ERC-20 allowances across 5 chains"
        badges={[
          <Badge key="1" tone="sky">{CHAINS.length} chains</Badge>,
          <Badge key="2" tone={approvals && approvals.length > 0 ? 'amber' : 'neutral'}>
            {approvals ? `${approvals.length} active` : 'Idle'}
          </Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Scan allowances</CardTitle>
          <CardDescription>
            Reads on-chain logs + current allowance for each token/spender. The scan runs from your browser
            against public RPCs — no backend, no tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chain</Label>
            <div className="flex gap-2 flex-wrap">
              {CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setChainId(c.id);
                    setTokens(DEFAULT_TOKENS[c.id] ?? '');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                    chainId === c.id
                      ? 'bg-signal-sky/15 border-signal-sky/40 text-signal-sky'
                      : 'bg-vault-900 border-vault-700 text-vault-300 hover:bg-vault-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Owner address</Label>
            <Input
              placeholder="0x..."
              value={owner}
              onChange={(e) => setOwner(e.target.value.trim())}
            />
          </div>

          <div className="space-y-2">
            <Label>Token addresses (one per line)</Label>
            <Textarea rows={5} value={tokens} onChange={(e) => setTokens(e.target.value)} />
          </div>

          <Button variant="primary" onClick={scan} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
            {loading ? 'Scanning…' : 'Scan approvals'}
          </Button>

          {error && <div className="text-sm text-signal-rose font-mono">{error}</div>}
        </CardContent>
      </Card>

      {approvals && approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active approvals</CardTitle>
            <CardDescription>
              Copy the revoke transaction to your wallet (MetaMask → send transaction) to set the allowance to 0.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {approvals.map((a) => (
              <div key={a.id} className="p-3 rounded-lg border border-vault-700 bg-vault-900 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={riskTone[a.riskLevel]}>{a.riskLevel}</Badge>
                    <span className="text-sm font-medium text-vault-100">{a.tokenSymbol}</span>
                    <span className="text-xs font-mono text-vault-400">
                      {a.allowanceFormatted}
                    </span>
                  </div>
                  <Button size="sm" variant="danger" onClick={() => revoke(a)}>
                    {copied === a.id ? <Check className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                    {copied === a.id ? 'Copied' : 'Revoke'}
                  </Button>
                </div>
                <div className="text-xxs font-mono text-vault-500 break-all">
                  token {a.tokenAddress}
                </div>
                <div className="text-xxs font-mono text-vault-500 break-all">
                  spender {a.spender} {a.spenderLabel ? `· ${a.spenderLabel}` : ''}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {approvals && approvals.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-vault-400 text-sm">
            <Check className="w-6 h-6 text-signal-emerald mx-auto mb-2" />
            No active approvals found for this owner on the listed tokens.
          </CardContent>
        </Card>
      )}

      <Explainer title="Infinite approvals are the #1 drainer vector" tone="amber">
        Most DEX aggregators request <code className="font-mono">maxUint256</code> allowance so subsequent swaps
        skip approval. A compromised contract can then move the full balance forever. Revoke anything unfamiliar —
        the next swap just re-approves.
      </Explainer>

      <Explainer title="Revoke format" tone="sky">
        The Revoke button copies an unsigned transaction as JSON. Paste it into any raw-tx sender (MetaMask dev
        console, Rabby, Safe) to execute. No private keys are handled here.
      </Explainer>
    </div>
  );
}
