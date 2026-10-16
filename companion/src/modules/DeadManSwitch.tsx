import { useEffect, useMemo, useState } from 'react';
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
  evaluateSentinel,
  recordCheckIn,
  sentinelStatusTone,
  type SentinelConfig,
} from '@/lib/deadManSwitch';
import { Clock, HeartPulse, RotateCcw, Zap } from 'lucide-react';

export function DeadManSwitch() {
  const [config, setConfig] = useState<SentinelConfig>({
    thresholdDays: 30,
    heirContactEmail: 'heir@example.com',
    guardianIds: ['g1', 'g2'],
    lastCheckIn: Date.now(),
  });
  const [simulateDays, setSimulateDays] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const virtualNow = Date.now() + simulateDays * 24 * 60 * 60 * 1000;
  const evaluation = useMemo(() => evaluateSentinel(config, virtualNow), [config, virtualNow]);
  const tone = sentinelStatusTone(evaluation.status);

  function checkIn() {
    setConfig(recordCheckIn(config));
    setSimulateDays(0);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<HeartPulse className="w-5 h-5" />}
        title="Dead-Man's Switch"
        subtitle="Inactivity sentinel with F32 saturation curve"
        badges={[
          <Badge key="1" tone={tone}>
            <StatusDot tone={tone} pulse={evaluation.status !== 'healthy'} />
            {evaluation.status}
          </Badge>,
          <Badge key="2" tone="neutral">Threshold {config.thresholdDays}d</Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Set the inactivity threshold. The sentinel fires at <code className="font-mono">1.5 × threshold</code>,
            with soft warnings at 70%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Threshold (days)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={config.thresholdDays}
                onChange={(e) => setConfig({ ...config, thresholdDays: Math.max(1, Number(e.target.value)) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Heir contact</Label>
              <Input
                value={config.heirContactEmail ?? ''}
                onChange={(e) => setConfig({ ...config, heirContactEmail: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live evaluation</CardTitle>
          <CardDescription>
            Scrub the simulation slider to see how the sentinel responds over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <Stat label="Inactivity" value={`${evaluation.inactivityDays.toFixed(1)}d`} />
            <Stat label="Until trigger" value={`${evaluation.daysUntilTrigger.toFixed(1)}d`} />
            <Stat label="Saturation" value={`${(evaluation.saturation * 100).toFixed(0)}%`} />
          </div>

          <SaturationBar saturation={evaluation.saturation} status={evaluation.status} />

          <div className="text-sm text-vault-300 font-mono">{evaluation.message}</div>

          <div className="space-y-2">
            <Label>Simulate additional inactivity: {simulateDays} days</Label>
            <input
              type="range"
              min={0}
              max={Math.round(config.thresholdDays * 2)}
              value={simulateDays}
              onChange={(e) => setSimulateDays(Number(e.target.value))}
              className="w-full accent-signal-emerald"
            />
            <div className="flex justify-between text-xxs font-mono text-vault-500">
              <span>0d</span>
              <span>warning @ {(config.thresholdDays * 0.7).toFixed(0)}d</span>
              <span>critical @ {config.thresholdDays}d</span>
              <span>trigger @ {(config.thresholdDays * 1.5).toFixed(0)}d</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={checkIn}>
              <Zap className="w-4 h-4" /> Check-in now
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfig({ ...config, lastCheckIn: Date.now() - config.thresholdDays * 24 * 60 * 60 * 1000 })}
            >
              <RotateCcw className="w-4 h-4" /> Jump to threshold
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xxs font-mono text-vault-500">
            <Clock className="w-3 h-3" />
            last check-in: {new Date(config.lastCheckIn).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Explainer title="Saturation curve — Formel 32" tone="violet">
        The saturation function <code className="font-mono">P = 1 - e^(-2·t/threshold)</code> models escalating
        alertness: slow at first, then rapid near the threshold. This is better than a linear ramp because it gives
        the owner more opportunity to notice and respond early.
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

function SaturationBar({ saturation, status }: { saturation: number; status: string }) {
  const pct = Math.min(100, saturation * 100);
  const color =
    status === 'triggered' || status === 'critical'
      ? 'bg-signal-rose'
      : status === 'warning'
        ? 'bg-signal-amber'
        : 'bg-signal-emerald';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xxs font-mono text-vault-400">
        <span>SATURATION</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-vault-800 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
