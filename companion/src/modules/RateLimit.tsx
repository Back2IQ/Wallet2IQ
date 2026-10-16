import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Explainer,
} from '@/components/ui';
import { ModuleHeader } from '@/components/ModuleHeader';
import { checkRateLimit, recordAttempt, resetRateLimit, getRateLimitState, RATE_LIMITS } from '@/lib/rateLimit';
import { formatDuration } from '@/lib/utils';
import { Gauge, RotateCcw, Play, Lock } from 'lucide-react';

type Preset = keyof typeof RATE_LIMITS;

export function RateLimit() {
  const [preset, setPreset] = useState<Preset>('UNLOCK');
  const [log, setLog] = useState<Array<{ time: number; ok: boolean; msg: string }>>([]);
  const [tick, setTick] = useState(0);

  const config = RATE_LIMITS[preset];
  const key = `demo:${preset}`;
  const state = getRateLimitState(key);
  const now = Date.now();
  const active = state.attempts.filter((t) => now - t < config.windowMs).length;
  const locked = state.lockedUntil > now;
  const retryMs = locked ? state.lockedUntil - now : 0;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  function attempt() {
    const result = checkRateLimit(key, config);
    if (result.allowed) {
      recordAttempt(key);
      setLog((l) => [{ time: Date.now(), ok: true, msg: 'Attempt allowed' }, ...l].slice(0, 20));
    } else {
      setLog((l) =>
        [
          { time: Date.now(), ok: false, msg: `Blocked — retry in ${formatDuration(result.retryAfterMs)}` },
          ...l,
        ].slice(0, 20),
      );
    }
  }

  function reset() {
    resetRateLimit(key);
    setLog([]);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Gauge className="w-5 h-5" />}
        title="Rate Limiter"
        subtitle="Sliding window with localStorage persistence (survives reload)"
        badges={[
          <Badge key="1" tone={locked ? 'rose' : 'emerald'}>
            {locked ? 'Locked' : 'Open'}
          </Badge>,
          <Badge key="2" tone="neutral">
            {active}/{config.maxAttempts} in window
          </Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Sensitive Operation Simulator</CardTitle>
          <CardDescription>
            Pick an operation preset and fire attempts. The limiter will lock you out after
            <span className="font-mono text-vault-200"> {config.maxAttempts}</span> attempts in
            <span className="font-mono text-vault-200"> {formatDuration(config.windowMs)}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(RATE_LIMITS) as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                  preset === p
                    ? 'bg-signal-emerald/15 border-signal-emerald/40 text-signal-emerald'
                    : 'bg-vault-900 border-vault-700 text-vault-300 hover:bg-vault-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <MeterBar active={active} max={config.maxAttempts} locked={locked} />

          {locked && (
            <div className="flex items-center gap-2 text-sm text-signal-rose font-mono">
              <Lock className="w-4 h-4" /> Cooldown: {formatDuration(retryMs)}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="primary" onClick={attempt}>
              <Play className="w-4 h-4" /> Attempt
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>

          {log.length > 0 && (
            <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-mono px-3 py-1.5 rounded border ${
                    entry.ok
                      ? 'border-signal-emerald/20 bg-signal-emerald/5 text-vault-200'
                      : 'border-signal-rose/20 bg-signal-rose/5 text-vault-200'
                  }`}
                >
                  <span className="text-vault-500">{new Date(entry.time).toLocaleTimeString()}</span>
                  <span>{entry.msg}</span>
                </div>
              ))}
            </div>
          )}
          <span className="hidden">{tick}</span>
        </CardContent>
      </Card>

      <Explainer title="Why persist state" tone="sky">
        The wallet's original limiter lived only in memory — a page reload reset it, letting brute-force attackers
        reset the counter for free. This version mirrors state into <code className="font-mono">localStorage</code>{' '}
        so reload is not a bypass. Pair with server-side limits for true depth.
      </Explainer>
    </div>
  );
}

function MeterBar({ active, max, locked }: { active: number; max: number; locked: boolean }) {
  const pct = Math.min(100, (active / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xxs font-mono text-vault-400">
        <span>ATTEMPTS IN WINDOW</span>
        <span>
          {active} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-vault-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            locked ? 'bg-signal-rose' : pct > 70 ? 'bg-signal-amber' : 'bg-signal-emerald'
          }`}
          style={{ width: `${locked ? 100 : pct}%` }}
        />
      </div>
    </div>
  );
}
