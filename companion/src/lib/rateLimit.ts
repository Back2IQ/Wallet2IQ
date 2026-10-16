/**
 * Sliding-window rate limiter with optional localStorage persistence.
 *
 * Fix over the original wallet version: the sliding window state
 * is persisted so that a simple page reload does not reset attempts.
 * (F8 Zerfall — λ pinned by persistence.)
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  cooldownMs: number;
}

interface RateLimitState {
  attempts: number[];
  lockedUntil: number;
}

const STORAGE_PREFIX = 'daio-rl:';
const memory = new Map<string, RateLimitState>();

function loadState(key: string): RateLimitState {
  const cached = memory.get(key);
  if (cached) return cached;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_PREFIX + key) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as RateLimitState;
      memory.set(key, parsed);
      return parsed;
    }
  } catch {
    /* ignore */
  }
  const fresh: RateLimitState = { attempts: [], lockedUntil: 0 };
  memory.set(key, fresh);
  return fresh;
}

function saveState(key: string, state: RateLimitState): void {
  memory.set(key, state);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
    }
  } catch {
    /* quota / disabled — ignore */
  }
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const state = loadState(key);

  if (state.lockedUntil > now) {
    return { allowed: false, retryAfterMs: state.lockedUntil - now };
  }

  state.attempts = state.attempts.filter((t) => now - t < config.windowMs);

  if (state.attempts.length >= config.maxAttempts) {
    state.lockedUntil = now + config.cooldownMs;
    saveState(key, state);
    return { allowed: false, retryAfterMs: config.cooldownMs };
  }

  saveState(key, state);
  return { allowed: true };
}

export function recordAttempt(key: string): void {
  const state = loadState(key);
  state.attempts.push(Date.now());
  saveState(key, state);
}

export function resetRateLimit(key: string): void {
  memory.delete(key);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_PREFIX + key);
    }
  } catch {
    /* ignore */
  }
}

export function getRateLimitState(key: string): RateLimitState {
  return { ...loadState(key) };
}

export const RATE_LIMITS = {
  UNLOCK: { maxAttempts: 5, windowMs: 60_000, cooldownMs: 120_000 },
  EMERGENCY: { maxAttempts: 3, windowMs: 300_000, cooldownMs: 600_000 },
  RECOVERY: { maxAttempts: 3, windowMs: 600_000, cooldownMs: 900_000 },
  SEND_TX: { maxAttempts: 10, windowMs: 60_000, cooldownMs: 30_000 },
} as const;
