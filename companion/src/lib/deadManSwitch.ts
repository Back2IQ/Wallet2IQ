/**
 * Dead-Man's Switch / Succession Sentinel.
 *
 * Inactivity-based trigger with a saturating warning curve (F32).
 *
 * State transitions:
 *   inactivityDays < threshold * 0.7  → healthy
 *   < threshold                        → warning
 *   < threshold * 1.5                  → critical
 *   ≥ threshold * 1.5                  → triggered
 */

export type SentinelStatus = 'healthy' | 'warning' | 'critical' | 'triggered';

export interface SentinelConfig {
  thresholdDays: number;
  heirContactEmail?: string;
  guardianIds: string[];
  lastCheckIn: number; // epoch ms
}

export interface SentinelEvaluation {
  status: SentinelStatus;
  inactivityDays: number;
  daysUntilTrigger: number;
  saturation: number; // 0 .. 1 — how close we are to triggering
  message: string;
}

export function evaluateSentinel(config: SentinelConfig, now: number = Date.now()): SentinelEvaluation {
  const inactivityMs = now - config.lastCheckIn;
  const inactivityDays = inactivityMs / (1000 * 60 * 60 * 24);
  const threshold = config.thresholdDays;

  let status: SentinelStatus;
  let message: string;
  if (inactivityDays >= threshold * 1.5) {
    status = 'triggered';
    message = 'Sentinel fired. Heir workflow is now eligible to begin.';
  } else if (inactivityDays >= threshold) {
    status = 'critical';
    message = 'Past threshold. Immediate check-in required to prevent trigger.';
  } else if (inactivityDays >= threshold * 0.7) {
    status = 'warning';
    message = 'Approaching threshold. Check-in recommended.';
  } else {
    status = 'healthy';
    message = 'Owner is active. No action required.';
  }

  const daysUntilTrigger = Math.max(0, threshold * 1.5 - inactivityDays);
  // Saturation curve (F32): P = 1 - e^(-α · t/threshold) with α = 2
  const saturation = Math.min(1, 1 - Math.exp((-2 * inactivityDays) / threshold));

  return { status, inactivityDays, daysUntilTrigger, saturation, message };
}

export function recordCheckIn(config: SentinelConfig): SentinelConfig {
  return { ...config, lastCheckIn: Date.now() };
}

export function sentinelStatusTone(status: SentinelStatus): 'emerald' | 'amber' | 'rose' {
  if (status === 'healthy') return 'emerald';
  if (status === 'warning') return 'amber';
  return 'rose';
}
