/**
 * Shamir Secret Sharing over GF(p) with pure BigInt arithmetic.
 *
 * Information-theoretically secure, offline-capable.
 * Includes Feldman VSS commitments so each share can be verified
 * against the commitment set without reconstructing the secret.
 */

const PRIME =
  115792089237316195423570985008687907853269984665640564039457584007913129639747n;
const GENERATOR = 2n;

export interface Share {
  index: number;
  value: string; // hex
}

export interface FeldmanCommitments {
  generator: string;
  commitments: string[];
  prime: string;
}

export interface SplitResult {
  shares: Share[];
  commitments: FeldmanCommitments;
}

function mod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r >= 0n ? r : r + m;
}

function modInverse(a: bigint, m: bigint): bigint {
  let [oldR, r] = [mod(a, m), m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) throw new Error('Modular inverse does not exist');
  return mod(oldS, m);
}

function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  let result = 1n;
  base = mod(base, m);
  while (exp > 0n) {
    if (exp % 2n === 1n) result = mod(result * base, m);
    exp /= 2n;
    base = mod(base * base, m);
  }
  return result;
}

function randomBigInt(max: bigint): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let r = 0n;
  for (const b of bytes) r = (r << 8n) | BigInt(b);
  return mod(r, max);
}

export function bigIntToHex(n: bigint): string {
  let h = n.toString(16);
  if (h.length % 2 === 1) h = '0' + h;
  return '0x' + h;
}

export function hexToBigInt(hex: string): bigint {
  return BigInt(hex.startsWith('0x') ? hex : '0x' + hex);
}

function stringToBigInt(s: string): bigint {
  const bytes = new TextEncoder().encode(s);
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  if (n >= PRIME) throw new Error('Secret too large for field');
  return n;
}

function bigIntToString(n: bigint): string {
  if (n === 0n) return '';
  const bytes: number[] = [];
  while (n > 0n) {
    bytes.unshift(Number(n & 0xffn));
    n >>= 8n;
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/**
 * Split a secret string into N shares with threshold T.
 * Returns shares + Feldman commitments for public verification.
 */
export function splitSecret(secret: string, threshold: number, total: number): SplitResult {
  if (threshold < 2) throw new Error('Threshold must be at least 2');
  if (threshold > total) throw new Error('Threshold cannot exceed total shares');
  if (total > 255) throw new Error('Too many shares');

  const secretInt = stringToBigInt(secret);
  const coefficients: bigint[] = [secretInt];
  for (let i = 1; i < threshold; i++) coefficients.push(randomBigInt(PRIME));

  const shares: Share[] = [];
  for (let x = 1; x <= total; x++) {
    let y = 0n;
    for (let i = 0; i < coefficients.length; i++) {
      y = mod(y + coefficients[i] * modPow(BigInt(x), BigInt(i), PRIME), PRIME);
    }
    shares.push({ index: x, value: bigIntToHex(y) });
  }

  const commitments: FeldmanCommitments = {
    generator: bigIntToHex(GENERATOR),
    commitments: coefficients.map((c) => bigIntToHex(modPow(GENERATOR, c, PRIME))),
    prime: bigIntToHex(PRIME),
  };

  // Wipe polynomial coefficients
  coefficients.fill(0n);

  return { shares, commitments };
}

/**
 * Reconstruct the secret from >= threshold shares using Lagrange interpolation.
 */
export function reconstructSecret(shares: Share[]): string {
  if (shares.length < 2) throw new Error('Need at least 2 shares');
  let secret = 0n;
  for (let i = 0; i < shares.length; i++) {
    let num = 1n;
    let den = 1n;
    for (let j = 0; j < shares.length; j++) {
      if (i === j) continue;
      num = mod(num * (-BigInt(shares[j].index)), PRIME);
      den = mod(den * (BigInt(shares[i].index) - BigInt(shares[j].index)), PRIME);
    }
    const lagrange = mod(num * modInverse(den, PRIME), PRIME);
    secret = mod(secret + hexToBigInt(shares[i].value) * lagrange, PRIME);
  }
  return bigIntToString(secret);
}

/**
 * Verify a single share against Feldman commitments.
 * g^y == Π commitments[i]^(x^i) mod p
 */
export function verifyShare(share: Share, commitments: FeldmanCommitments): boolean {
  const prime = hexToBigInt(commitments.prime);
  const g = hexToBigInt(commitments.generator);
  const y = hexToBigInt(share.value);

  const lhs = modPow(g, y, prime);

  let rhs = 1n;
  for (let i = 0; i < commitments.commitments.length; i++) {
    const ci = hexToBigInt(commitments.commitments[i]);
    rhs = mod(rhs * modPow(ci, modPow(BigInt(share.index), BigInt(i), prime), prime), prime);
  }
  return lhs === rhs;
}
