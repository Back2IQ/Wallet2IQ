import { calculateContinuityScore } from "../calculator/utils/calculator";
import type { CalculatorInputs } from "../calculator/types";

/**
 * Konfiguration für den vordefinierten Notfall-Transfer
 */
interface EmergencyConfig {
  targetAddress: string;
  verificationLevel: 'none' | 'basic' | 'biometric'; // didit.me Levels
  percentageToTransfer: number; // z.B. 100 für Total-Transfer
  executionDelayHours: number;
  notificationGuardians: boolean;
  autoTriggerInactivityDays?: number; // Formel 9: Sättigung der Sicherheit
}

/**
 * Interface für plattformunabhängige Speicherung
 */
export interface IStorageBridge {
  save(key: string, value: any): Promise<void>;
  get<T>(key: string): Promise<T | null>;
}

export interface PanicTriggerResponse {
  status: 'triggered';
  action: string;
  message: string;
  params: EmergencyConfig;
  timestamp: string;
  governanceAlert: boolean;
}

/**
 * DAIO Companion Core
 * Orchestriert die Governance-Logik für externe Wallets.
 */
export class DAIOCompanionCore {
  private status: 'active' | 'escalating' | 'triggered' = 'active';
  private lastCheckIn: Date = new Date();
  private emergencyConfig: EmergencyConfig | null = null;
  private storageBridge: IStorageBridge | null = null;

  /**
   * Initialisiert den Companion mit einer Storage-Bridge
   */
  public async initialize(bridge: IStorageBridge) {
    this.storageBridge = bridge;
    const saved = await this.storageBridge.get<EmergencyConfig>('daio_emergency_config');
    if (saved) {
      this.emergencyConfig = saved;
    }
  }

  /**
   * Stellt den Zugriff auf den verschlüsselten Speicher mittels Recovery-Key wieder her.
   */
  public async recoverStorage(recoveryKey: string, newPassword: string): Promise<boolean> {
    if (this.storageBridge && 'recoverAndReKey' in this.storageBridge) {
      try {
        const bridge = this.storageBridge as any; // Cast für Zugriff auf spezifische Methode
        await bridge.recoverAndReKey(recoveryKey, newPassword, ['daio_emergency_config']);
        return true;
      } catch (e) {
        console.error("Recovery failed", e);
        return false;
      }
    }
    return false;
  }

  public async setEmergencyParameters(config: EmergencyConfig) {
    // Formel 19: Schwert mit zwei Seiten. Validierung verhindert, dass das 
    // Tool zur Waffe gegen den User wird (z.B. falsche Target-Addresse).
    if (!config.targetAddress.startsWith('0x') && config.targetAddress.length < 30) {
      throw new Error("INVALID_TARGET_STRUCTURE: Fisch ohne Freunde (Formel 1)");
    }
    this.emergencyConfig = config;

    if (this.storageBridge) {
      await this.storageBridge.save('daio_emergency_config', config);
    }
  }

  public getEmergencyConfig(): EmergencyConfig | null {
    return this.emergencyConfig;
  }

  /**
   * Aktiviert den Panic Button (Sofortige Eskalation).
   * Prüft DID-Verifizierung (z.B. didit.me) und bereitet den vordefinierten Transfer vor.
   */
  public async triggerPanicButton(didToken?: string): Promise<PanicTriggerResponse> {
    const config = this.emergencyConfig;
    if (!config) {
      throw new Error("CONFIGURATION_MISSING: Bitte konfigurieren Sie zuerst die Notfall-Parameter.");
    }

    if (config.verificationLevel !== 'none' && !didToken) {
      throw new Error("DID_VERIFICATION_REQUIRED: Bitte verifizieren Sie sich über didit.me");
    }

    if (config.verificationLevel !== 'none' && didToken) {
      const isVerified = await this.verifyIdentityWithDidit(didToken, config.verificationLevel as 'basic' | 'biometric');
      if (!isVerified) {
        throw new Error(`IDENTITY_VERIFICATION_FAILED: Die Verifizierung entspricht nicht dem geforderten Level: ${config.verificationLevel}`);
      }
    }

    this.status = 'triggered';
    this.lastCheckIn = new Date(0); // Setzt Check-in in die Vergangenheit
    
    return {
      status: 'triggered',
      action: "EMERGENCY_PROTOCOL_ACTIVATED",
      message: `Notfall-Transfer an ${this.emergencyConfig?.targetAddress || 'vordefinierte Adresse'} initiiert.`,
      params: this.emergencyConfig,
      timestamp: new Date().toISOString(),
      governanceAlert: true
    };
  }

  /**
   * Mock-Schnittstelle für didit.me Integration
   */
  private async verifyIdentityWithDidit(token: string, requiredLevel: 'basic' | 'biometric'): Promise<boolean> {
    console.log(`Verifiziere Identität via didit.me (Level: ${requiredLevel})...`);
    
    // Simulation der Netzwerk-Latenz und API-Validierung
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (token === "invalid_token") return false;

    // Logik-Simulation für biometrische Validierung:
    // In einer echten Integration würde das Backend das Attribut 'auth_method' im DID-VC prüfen.
    if (requiredLevel === 'biometric') {
      // Wir simulieren, dass ein biometrischer Token einen speziellen Identifier enthalten muss
      return token.includes("method=biometric") && token.length > 20;
    }
    
    // Standard-Verifizierung (Basic)
    return token.length > 10; 
  }

  /**
   * Berechnet den aktuellen Sicherheits-Score für das Wallet-Portfolio
   */
  public getGovernanceScore(inputs: CalculatorInputs) {
    return {
      score: calculateContinuityScore(inputs),
      timestamp: new Date().toISOString(),
      recommendation: this.getRecommendation(calculateContinuityScore(inputs))
    };
  }

  /**
   * Simuliert den Succession Sentinel (Dead Man's Switch)
   */
  public checkSentinelStatus(inactivityDays: number, threshold: number) {
    if (inactivityDays > threshold * 1.5) return 'triggered';
    if (inactivityDays > threshold) return 'critical';
    if (inactivityDays > threshold * 0.7) return 'warning';
    return 'healthy';
  }

  /**
   * Definiert die Transfer-Gate-Logik
   * Verhindert unautorisierte Abflüsse im Erbfall ohne Multi-Sig/Notar.
   * Im Notfall (Panic) greifen verschärfte Sperrfristen.
   */
  public validateTransferRequest(amount: number, isEmergency: boolean) {
    return {
      requiresNotary: amount > 50000 || isEmergency || this.status === 'triggered',
      requiresGuardianApproval: true,
      timeLockHours: (isEmergency || this.status === 'triggered') ? 72 : 48 // Längere Sperre bei Panic zur Verifizierung
    };
  }

  private getRecommendation(score: number): string {
    if (score >= 80) return "Optimal geschützt.";
    if (score >= 50) return "Governance-Lücken identifiziert. Shards prüfen.";
    return "Kritisch: Kein digitaler Nachlassplan aktiv.";
  }

  /**
   * Mock für Shamir Shard Generierung
   */
  public generateShards(secret: string, shares: number, threshold: number) {
    // Hier würde die Integration der SSS-Bibliothek erfolgen
    return {
      total: shares,
      required: threshold,
      note: "Shards sollten niemals auf demselben Gerät gespeichert werden."
    };
  }
}

export const companionCore = new DAIOCompanionCore();