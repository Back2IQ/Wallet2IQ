import { IStorageBridge } from "../../../DAIOCompanionCore";

/**
 * EncryptedStorageBridge
 * Eine verschlüsselte Implementierung der IStorageBridge unter Nutzung der Web Crypto API.
 * Nutzt AES-GCM für die Verschlüsselung und PBKDF2 für die Schlüsselableitung.
 */
export class EncryptedStorageBridge implements IStorageBridge {
  private key: CryptoKey | null = null;
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  constructor(
    private password: string,
    private underlyingStorage: IStorageBridge,
    private salt: string = "daio-governance-salt-2026",
    private recoveryMode: boolean = false
  ) {}

  /**
   * Generiert einen kryptografisch sicheren Recovery-Key (Base64).
   * Dieser sollte dem Nutzer einmalig angezeigt und sicher (analog zu Seed Phrases) verwahrt werden.
   */
  public static generateRecoveryKey(): string {
    const buffer = window.crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, ""); // URL-safe Base64
  }

  /**
   * Leitet einen AES-Key aus dem Passwort ab (PBKDF2)
   */
  private async deriveKey(): Promise<CryptoKey> {
    if (this.key) return this.key;

    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      this.encoder.encode(this.password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    this.key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: this.encoder.encode(this.salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return this.key;
  }

  /**
   * Führt eine Recovery durch: Entschlüsselt mit dem Recovery-Key und verschlüsselt neu mit dem neuen Passwort.
   */
  public async recoverAndReKey(recoveryKey: string, newPassword: string, storageKeys: string[]): Promise<void> {
    // Temporärer Wechsel in den Recovery-Modus
    const originalPassword = this.password;
    this.password = recoveryKey;
    this.key = null; // Key-Cache leeren

    for (const sKey of storageKeys) {
      const data = await this.get<any>(sKey);
      if (data) {
        // Zurück zum neuen Passwort für die Speicherung
        this.password = newPassword;
        this.key = null;
        await this.save(sKey, data);
        // Für den nächsten Key im Loop wieder auf Recovery zurückstellen
        this.password = recoveryKey;
        this.key = null;
      }
    }
    this.password = newPassword;
  }

  async save(key: string, value: any): Promise<void> {
    const cryptoKey = await this.deriveKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const plaintext = this.encoder.encode(JSON.stringify(value));

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      plaintext
    );

    // IV (12 Bytes) + Ciphertext zusammenführen und als Base64 speichern
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    const base64 = btoa(String.fromCharCode(...combined));
    await this.underlyingStorage.save(key, base64);
  }

  async get<T>(key: string): Promise<T | null> {
    const base64 = await this.underlyingStorage.get<string>(key);
    if (!base64) return null;

    try {
      const cryptoKey = await this.deriveKey();
      const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        ciphertext
      );

      return JSON.parse(this.decoder.decode(decrypted)) as T;
    } catch (e) {
      console.error(`DAIO Decryption Error for key "${key}":`, e);
      return null;
    }
  }
}