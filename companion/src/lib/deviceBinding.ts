/**
 * Device Binding — non-extractable AES-256-GCM key stored in IndexedDB.
 *
 * Guarantees:
 *  - Key cannot be exported from JavaScript (`extractable: false`)
 *  - Key is scoped to this origin + device
 *  - Moving encrypted blobs to a different device renders them unrecoverable
 *
 * Limitation (Theater im Dunkeln / F25):
 *  - Private browsing wipes IndexedDB — data becomes unrecoverable.
 *  - Always pair with a Social Recovery or Shamir backup for user-facing flows.
 */

import { bytesToHex, hexToBytes } from './utils';

const DB_NAME = 'daio-device-keys';
const STORE_NAME = 'keys';
const KEY_ID = 'device-master';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<CryptoKey | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as CryptoKey | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, key: string, value: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDeviceKey(): Promise<CryptoKey> {
  const db = await openDB();
  const existing = await idbGet(db, KEY_ID);
  if (existing) {
    db.close();
    return existing;
  }
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  await idbPut(db, KEY_ID, key);
  db.close();
  return key;
}

export async function deviceEncrypt(
  data: string,
): Promise<{ ciphertext: string; iv: string }> {
  const key = await getDeviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data),
  );
  return {
    ciphertext: bytesToHex(new Uint8Array(encrypted)),
    iv: bytesToHex(iv),
  };
}

export async function deviceDecrypt(ciphertext: string, iv: string): Promise<string> {
  const key = await getDeviceKey();
  const ivBytes = hexToBytes(iv);
  const ctBytes = hexToBytes(ciphertext);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes as BufferSource },
    key,
    ctBytes as BufferSource,
  );
  return new TextDecoder().decode(decrypted);
}

export function isDeviceBindingAvailable(): boolean {
  return (
    typeof indexedDB !== 'undefined' &&
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined'
  );
}

export async function hasDeviceKey(): Promise<boolean> {
  try {
    const db = await openDB();
    const existing = await idbGet(db, KEY_ID);
    db.close();
    return existing !== undefined;
  } catch {
    return false;
  }
}

export async function rotateDeviceKey(): Promise<void> {
  const db = await openDB();
  await idbDelete(db, KEY_ID);
  db.close();
  await getDeviceKey();
}
