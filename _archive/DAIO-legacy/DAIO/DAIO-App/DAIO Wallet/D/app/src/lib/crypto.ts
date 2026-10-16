/**
 * DAIO Wallet - Cryptographic Functions
 */

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import * as secp256k1 from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

export function generateWalletMnemonic(strength: 128 | 256 = 256): string {
  return generateMnemonic(wordlist, strength);
}

export function isValidMnemonicPhrase(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist);
}

export function mnemonicToSeed(mnemonic: string): Uint8Array {
  return mnemonicToSeedSync(mnemonic);
}

export function deriveEthereumAddress(mnemonic: string, index: number = 0): {
  address: string;
  privateKey: string;
  publicKey: string;
} {
  const seed = mnemonicToSeed(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  const derived = hdkey.derive(`m/44'/60'/0'/0/${index}`);
  
  if (!derived.privateKey) {
    throw new Error('Failed to derive private key');
  }
  
  const privateKey = bytesToHex(derived.privateKey);
  const publicKey = secp256k1.getPublicKey(derived.privateKey, false);
  const address = publicKeyToAddress(publicKey);
  
  return {
    address,
    privateKey,
    publicKey: bytesToHex(publicKey)
  };
}

function publicKeyToAddress(publicKey: Uint8Array): string {
  const pubKeyWithoutPrefix = publicKey.slice(1);
  const hash = keccak_256(pubKeyWithoutPrefix);
  const addressBytes = hash.slice(-20);
  return '0x' + bytesToHex(addressBytes);
}

export function deriveMultipleAddresses(mnemonic: string, count: number = 5): Array<{
  index: number;
  address: string;
  privateKey: string;
}> {
  const addresses = [];
  for (let i = 0; i < count; i++) {
    const derived = deriveEthereumAddress(mnemonic, i);
    addresses.push({
      index: i,
      address: derived.address,
      privateKey: derived.privateKey
    });
  }
  return addresses;
}

export async function encryptData(
  data: string, 
  password: string
): Promise<{ encrypted: string; iv: string; salt: string }> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  
  const saltArr = new Uint8Array(16);
  crypto.getRandomValues(saltArr);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltArr.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const ivArr = new Uint8Array(12);
  crypto.getRandomValues(ivArr);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivArr.buffer as ArrayBuffer },
    key,
    dataBytes
  );
  
  return {
    encrypted: bytesToHex(new Uint8Array(encrypted)),
    iv: bytesToHex(ivArr),
    salt: bytesToHex(saltArr)
  };
}

export async function decryptData(
  encrypted: string,
  iv: string,
  salt: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: hexToBytes(salt).buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  const encryptedBytes = hexToBytes(encrypted);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBytes(iv).buffer as ArrayBuffer },
    key,
    encryptedBytes.buffer as ArrayBuffer
  );
  
  return new TextDecoder().decode(decrypted);
}

export function splitSecret(secret: string, parts: number, threshold: number): string[] {
  const secretBytes = new TextEncoder().encode(secret);
  const shares: string[] = [];
  
  const coefficients: Uint8Array[] = [];
  for (let i = 0; i < threshold - 1; i++) {
    const coef = new Uint8Array(secretBytes.length);
    crypto.getRandomValues(coef);
    coefficients.push(coef);
  }
  
  for (let x = 1; x <= parts; x++) {
    const share = new Uint8Array(secretBytes.length + 1);
    share[0] = x;
    
    for (let i = 0; i < secretBytes.length; i++) {
      let y = secretBytes[i];
      for (let j = 0; j < coefficients.length; j++) {
        y ^= gfMul(coefficients[j][i], gfPow(x, j + 1));
      }
      share[i + 1] = y;
    }
    
    shares.push(bytesToHex(share));
  }
  
  return shares;
}

export function reconstructSecret(shares: string[]): string {
  const shareBytes = shares.map(s => hexToBytes(s));
  const secretLength = shareBytes[0].length - 1;
  const secret = new Uint8Array(secretLength);
  
  for (let i = 0; i < secretLength; i++) {
    const points: [number, number][] = shareBytes.map(s => [s[0], s[i + 1]]);
    secret[i] = lagrangeInterpolate(0, points);
  }
  
  return new TextDecoder().decode(secret);
}

function gfMul(a: number, b: number): number {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a <<= 1;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p & 0xff;
}

function gfPow(x: number, n: number): number {
  let result = 1;
  for (let i = 0; i < n; i++) {
    result = gfMul(result, x);
  }
  return result;
}

function lagrangeInterpolate(x: number, points: [number, number][]): number {
  let result = 0;
  
  for (let i = 0; i < points.length; i++) {
    let term = points[i][1];
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        term = gfMul(term, gfDiv(x ^ points[j][0], points[i][0] ^ points[j][0]));
      }
    }
    result ^= term;
  }
  
  return result;
}

function gfDiv(a: number, b: number): number {
  return gfMul(a, gfInverse(b));
}

function gfInverse(x: number): number {
  if (x === 0) return 0;
  return gfPow(x, 254);
}

export function hashData(data: string): string {
  const encoder = new TextEncoder();
  return bytesToHex(keccak_256(encoder.encode(data)));
}

export function formatAddress(address: string, chars: number = 6): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
