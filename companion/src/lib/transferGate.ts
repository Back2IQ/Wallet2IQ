/**
 * Transfer Gate — pre-transaction authorisation policy.
 *
 * Evaluates a prospective outbound transfer against declarative rules and
 * returns the gate decision: allow / require notary / require guardians /
 * time-lock hours. Never signs or broadcasts; policy-only.
 */

export interface TransferGatePolicy {
  notaryThresholdUSD: number;
  guardianApprovalAlways: boolean;
  baseTimeLockHours: number;
  emergencyTimeLockHours: number;
  blockedRecipients: string[];
}

export const DEFAULT_POLICY: TransferGatePolicy = {
  notaryThresholdUSD: 50_000,
  guardianApprovalAlways: true,
  baseTimeLockHours: 48,
  emergencyTimeLockHours: 72,
  blockedRecipients: [],
};

export interface TransferRequest {
  amountUSD: number;
  recipient: string;
  isEmergency: boolean;
  sentinelTriggered: boolean;
}

export interface GateDecision {
  allowed: boolean;
  requiresNotary: boolean;
  requiresGuardianApproval: boolean;
  timeLockHours: number;
  blockReason?: string;
  reasons: string[];
}

export function evaluateTransfer(req: TransferRequest, policy: TransferGatePolicy = DEFAULT_POLICY): GateDecision {
  const reasons: string[] = [];

  const isBlocked = policy.blockedRecipients
    .map((a) => a.toLowerCase())
    .includes(req.recipient.toLowerCase());

  if (isBlocked) {
    return {
      allowed: false,
      requiresNotary: false,
      requiresGuardianApproval: false,
      timeLockHours: 0,
      blockReason: 'Recipient is on the blocked list',
      reasons: ['blocked_recipient'],
    };
  }

  const requiresNotary =
    req.amountUSD >= policy.notaryThresholdUSD || req.isEmergency || req.sentinelTriggered;
  if (req.amountUSD >= policy.notaryThresholdUSD) reasons.push('amount_over_threshold');
  if (req.isEmergency) reasons.push('emergency_flag');
  if (req.sentinelTriggered) reasons.push('sentinel_triggered');

  const timeLockHours =
    req.isEmergency || req.sentinelTriggered ? policy.emergencyTimeLockHours : policy.baseTimeLockHours;

  return {
    allowed: true,
    requiresNotary,
    requiresGuardianApproval: policy.guardianApprovalAlways,
    timeLockHours,
    reasons,
  };
}
