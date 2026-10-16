/**
 * Honeypot Vault + Canary Shards + Silent Alert.
 *
 * Decoy vaults that look identical to real ones but contain fake secrets.
 * Canary shards are flagged shares that, when combined, trigger a silent alert.
 * Formel 33 (Nash): the attacker cannot distinguish real from decoy at query time.
 */

import { splitSecret, type FeldmanCommitments } from './shamir';
import { bytesToHex } from './utils';

export interface DecoyVault {
  id: string;
  parentVaultId: string;
  label: string;
  fakeSecretHint: string; // first 8 chars of fake secret — for the attacker to see
  threshold: number;
  totalShares: number;
  commitments: FeldmanCommitments;
  createdAt: string;
  triggered: boolean;
  triggerLog: HoneypotTrigger[];
}

export interface CanaryShard {
  index: number;
  value: string;
  vaultId: string;
  isCanary: true;
}

export interface HoneypotTrigger {
  timestamp: string;
  shardIndicesUsed: number[];
  alertToken: string;
  sourceInfo: string;
}

function generateId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return `${Date.now()}-${bytesToHex(bytes)}`;
}

export function createDecoyVault(realLabel: string, realThreshold: number, realTotal: number): DecoyVault {
  const id = `vault-honey-${generateId()}`;
  // Fake secret of similar length to a 256-bit key
  const secretBytes = new Uint8Array(24);
  crypto.getRandomValues(secretBytes);
  const fakeSecret = bytesToHex(secretBytes);

  // Slightly easier threshold so the attacker is "encouraged"
  const fakeThreshold = Math.max(2, realThreshold - 1);
  const { commitments } = splitSecret(fakeSecret, fakeThreshold, realTotal);

  return {
    id,
    parentVaultId: `vault-real-${generateId()}`,
    label: realLabel,
    fakeSecretHint: `${fakeSecret.slice(0, 8)}...`,
    threshold: fakeThreshold,
    totalShares: realTotal,
    commitments,
    createdAt: new Date().toISOString(),
    triggered: false,
    triggerLog: [],
  };
}

export function createCanaryShards(vaultId: string, count: number): CanaryShard[] {
  const out: CanaryShard[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    out.push({
      index: 100 + i, // high index range reserved for canaries
      value: '0x' + bytesToHex(bytes),
      vaultId,
      isCanary: true,
    });
  }
  return out;
}

export function detectCanary(shards: Array<{ isCanary?: boolean }>): boolean {
  return shards.some((s) => s.isCanary === true);
}

export async function generateAlertToken(
  vaultId: string,
  shardIndices: number[],
): Promise<string> {
  const data = new TextEncoder().encode(
    `ALERT:${vaultId}:${shardIndices.sort((a, b) => a - b).join(',')}:${Date.now()}`,
  );
  const hash = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hash));
}

export async function fireHoneypotTrigger(
  vault: DecoyVault,
  shardIndicesUsed: number[],
  sourceInfo: string,
): Promise<HoneypotTrigger> {
  const alertToken = await generateAlertToken(vault.id, shardIndicesUsed);
  return {
    timestamp: new Date().toISOString(),
    shardIndicesUsed,
    alertToken,
    sourceInfo,
  };
}
