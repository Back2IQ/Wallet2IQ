/**
 * Social Recovery — guardian-driven key reconstruction with owner veto period.
 *
 * State machine:
 *   idle → initiated → pending_fragments → fragments_collected
 *        → veto_period → (vetoed | executing → completed)
 */

export type RecoveryStatus =
  | 'idle'
  | 'initiated'
  | 'pending_fragments'
  | 'fragments_collected'
  | 'veto_period'
  | 'executing'
  | 'completed'
  | 'vetoed'
  | 'expired';

export interface RecoveryRequest {
  id: string;
  initiatedBy: string;
  initiatorName: string;
  reason: string;
  createdAt: number;
  vetoDeadline: number;
  status: RecoveryStatus;
  fragmentsRequired: number;
  fragmentsCollected: string[];
  guardianApprovals: string[];
  completedAt?: number;
}

export interface RecoveryConfig {
  enabled: boolean;
  vetoPeriodHours: number;
  requiredGuardians: number;
  maxRecoveryAttempts: number;
  currentAttempts: number;
}

export const DEFAULT_RECOVERY_CONFIG: RecoveryConfig = {
  enabled: true,
  vetoPeriodHours: 48,
  requiredGuardians: 2,
  maxRecoveryAttempts: 3,
  currentAttempts: 0,
};

export function createRecoveryRequest(
  guardianId: string,
  guardianName: string,
  reason: string,
  config: RecoveryConfig,
): { request: RecoveryRequest; updatedConfig: RecoveryConfig } {
  if (!config.enabled) throw new Error('Social recovery is not enabled');
  if (config.currentAttempts >= config.maxRecoveryAttempts) {
    throw new Error('Maximum recovery attempts exceeded');
  }

  const now = Date.now();
  const vetoDeadline = now + config.vetoPeriodHours * 60 * 60 * 1000;

  return {
    request: {
      id: crypto.randomUUID(),
      initiatedBy: guardianId,
      initiatorName: guardianName,
      reason,
      createdAt: now,
      vetoDeadline,
      status: 'initiated',
      fragmentsRequired: config.requiredGuardians,
      fragmentsCollected: [],
      guardianApprovals: [guardianId],
    },
    updatedConfig: { ...config, currentAttempts: config.currentAttempts + 1 },
  };
}

export function submitFragment(
  request: RecoveryRequest,
  guardianId: string,
  fragment: string,
  validGuardianIds?: string[],
): RecoveryRequest {
  if (request.status !== 'initiated' && request.status !== 'pending_fragments') {
    throw new Error(`Cannot submit fragment in state: ${request.status}`);
  }
  if (request.guardianApprovals.includes(guardianId)) {
    throw new Error('Guardian has already submitted their fragment');
  }
  if (validGuardianIds && !validGuardianIds.includes(guardianId)) {
    throw new Error('Unrecognised guardian ID');
  }
  const trimmed = fragment.trim();
  if (!trimmed || !/^[0-9a-fA-F]+$/.test(trimmed)) {
    throw new Error('Invalid fragment format: must be a hex string');
  }
  if (trimmed.length < 4) throw new Error('Fragment too short');

  const updated: RecoveryRequest = {
    ...request,
    status: 'pending_fragments',
    fragmentsCollected: [...request.fragmentsCollected, trimmed],
    guardianApprovals: [...request.guardianApprovals, guardianId],
  };
  if (updated.fragmentsCollected.length >= updated.fragmentsRequired) {
    updated.status = 'fragments_collected';
  }
  return updated;
}

export function startVetoPeriod(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'fragments_collected') {
    throw new Error('Not enough fragments collected');
  }
  return { ...request, status: 'veto_period' };
}

export function vetoRecovery(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'veto_period' && request.status !== 'fragments_collected') {
    throw new Error('Cannot veto in current state');
  }
  if (Date.now() > request.vetoDeadline) throw new Error('Veto period has expired');
  return { ...request, status: 'vetoed', completedAt: Date.now() };
}

export function executeRecovery(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'veto_period') {
    throw new Error('Recovery must be in veto period to execute');
  }
  if (Date.now() < request.vetoDeadline) {
    throw new Error('Veto period has not expired yet');
  }
  return { ...request, status: 'executing' };
}

export function completeRecovery(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'executing') {
    throw new Error('Recovery must be executing to complete');
  }
  return { ...request, status: 'completed', completedAt: Date.now() };
}

export function isVetoPeriodExpired(request: RecoveryRequest): boolean {
  return Date.now() > request.vetoDeadline;
}

export function getVetoTimeRemaining(request: RecoveryRequest): number {
  return Math.max(0, request.vetoDeadline - Date.now());
}

export function getRecoveryStatusLabel(status: RecoveryStatus): string {
  const labels: Record<RecoveryStatus, string> = {
    idle: 'No Active Recovery',
    initiated: 'Recovery Initiated',
    pending_fragments: 'Collecting Fragments',
    fragments_collected: 'Fragments Collected',
    veto_period: 'Veto Period Active',
    executing: 'Executing Recovery',
    completed: 'Recovery Complete',
    vetoed: 'Vetoed by Owner',
    expired: 'Recovery Expired',
  };
  return labels[status];
}
