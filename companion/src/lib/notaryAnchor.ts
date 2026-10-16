/**
 * Notary Hash Anchoring.
 *
 * Computes a keccak256 hash of an uploaded document and prepares an
 * unsigned transaction that anchors (documentHash, timestamp) to a
 * deployed anchor contract. The contract shape is a single mapping
 * `mapping(bytes32 => uint256)` with an `anchor(bytes32, uint256)` entry.
 */

import { keccak_256 } from '@noble/hashes/sha3.js';
import { encodeFunctionData, parseAbi, type Hex, type Address } from 'viem';
import { bytesToHex } from './utils';

export type DocumentType =
  | 'death_certificate'
  | 'court_order'
  | 'power_of_attorney'
  | 'identity_document'
  | 'notarized_declaration'
  | 'other';

export type AnchorStatus = 'pending' | 'hash_computed' | 'anchored' | 'verified' | 'rejected';

export interface AnchorDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  documentHash: string;
  anchorTxHash?: string;
  anchorChainId?: number;
  status: AnchorStatus;
  notaryId?: string;
  notarySignature?: string;
  verifiedAt?: number;
  rejectionReason?: string;
  metadata: Record<string, string>;
}

const anchorAbi = parseAbi([
  'function anchor(bytes32 documentHash, uint256 timestamp) external',
]);

export async function hashDocument(file: File | Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  return '0x' + bytesToHex(keccak_256(new Uint8Array(buf)));
}

export function hashString(value: string): string {
  return '0x' + bytesToHex(keccak_256(new TextEncoder().encode(value)));
}

export async function createAnchorDocument(
  file: File,
  type: DocumentType,
  metadata?: Record<string, string>,
): Promise<AnchorDocument> {
  const documentHash = await hashDocument(file);
  return {
    id: crypto.randomUUID(),
    type,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: Date.now(),
    documentHash,
    status: 'hash_computed',
    metadata: metadata ?? {},
  };
}

export function buildAnchorTx(
  contractAddress: Address,
  documentHash: string,
  timestamp: number,
): { to: Address; data: Hex; value: bigint } {
  const hashHex = documentHash.startsWith('0x') ? documentHash : '0x' + documentHash;
  return {
    to: contractAddress,
    data: encodeFunctionData({
      abi: anchorAbi,
      functionName: 'anchor',
      args: [hashHex as Hex, BigInt(timestamp)],
    }),
    value: 0n,
  };
}

export function documentTypeLabel(t: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    death_certificate: 'Death Certificate',
    court_order: 'Court Order',
    power_of_attorney: 'Power of Attorney',
    identity_document: 'Identity Document',
    notarized_declaration: 'Notarised Declaration',
    other: 'Other Document',
  };
  return labels[t];
}
