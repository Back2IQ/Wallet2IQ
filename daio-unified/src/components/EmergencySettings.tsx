import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, Clock, Users, Zap, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { companionCore } from '../../../DAIOCompanionCore';
import { LocalStorageBridge } from '../modules/companion/LocalStorageBridge';

export const EmergencySettings: React.FC = () => {
  const [config, setConfig] = useState({
    targetAddress: '',
    verificationLevel: 'biometric' as 'none' | 'basic' | 'biometric',
    percentageToTransfer: 100,
    executionDelayHours: 48,
    notificationGuardians: true,
    autoTriggerInactivityDays: 30
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialisierung des Cores mit der LocalStorageBridge
  useEffect(() => {
    const initCore = async () => {
      await companionCore.initialize(new LocalStorageBridge());
      const savedConfig = companionCore.getEmergencyConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    };
    initCore();
  }, []);

  // Formel 1: Fisch ohne Freunde (R -> 0). 
  // Validierung der Resonanz (externe Verbindung / Target Address)
  useEffect(() => {
    if (config.targetAddress && !config.targetAddress.startsWith('0x')) {
      setValidationError("Ungültige Resonanz: Die Zieladresse muss ein gültiger Hex-String sein (Formel 1).");
    } else {
      setValidationError(null);
    }
  }, [config.targetAddress]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await companionCore.setEmergencyParameters(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setValidationError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#141a2a] border border-[#1e2638] rounded-2xl shadow-2xl text-[#e5e7eb]">
      <div className="flex items-center gap-3 mb-8 border-b border-[#1e2638] pb-4">
        <Shield className="text-[#c9a54e] w-8 h-8" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Panic Button & Governance</h2>
          <p className="text-xs text-[#9ca3af]">Souveräne Notfall-Parametrierung (Formel 19: Das Schwert mit zwei Seiten)</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Ziel-Parameter: Der Attraktor (Formel 2) */}
        <section className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#c9a54e]">
            <Zap size={16} /> Vordefinierter Ziel-Attraktor
          </label>
          <input
            type="text"
            placeholder="Rescue-Wallet Adresse (0x...)"
            className="w-full bg-[#0a0f1a] border border-[#1e2638] rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-[#c9a54e] outline-none transition-all"
            value={config.targetAddress}
            onChange={(e) => setConfig({ ...config, targetAddress: e.target.value })}
          />
          {validationError && (
            <div className="flex items-center gap-2 text-red-400 text-xs mt-1">
              <AlertTriangle size={12} /> {validationError}
            </div>
          )}
          <p className="text-[10px] text-[#6b7280]">
            Formel 2: Ohne stabilen Fixpunkt divergiert das System. Die Adresse ist Ihr Anker im Chaos.
          </p>
        </section>

        {/* didit.me Integration: Sichtbarkeit (Formel 25) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#c9a54e]">
              <Fingerprint size={16} /> Identitäts-Gate (didit.me)
            </label>
            <select
              className="w-full bg-[#0a0f1a] border border-[#1e2638] rounded-lg p-2.5 text-sm"
              value={config.verificationLevel}
              onChange={(e) => setConfig({ ...config, verificationLevel: e.target.value as any })}
            >
              <option value="none">Keine (Sofort-Trigger)</option>
              <option value="basic">Standard DID</option>
              <option value="biometric">Biometrischer Scan (didit.me)</option>
            </select>
            <p className="text-[10px] text-[#6b7280]">
              Formel 25: Wirkung = Inhalt · Sichtbarkeit. Ohne DID-Verifizierung ist die Handlung im Notfall blind.
            </p>
          </div>

          {/* Zeit-Parameter: Logistisches Wachstum der Sicherheit (Formel 9) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#c9a54e]">
              <Clock size={16} /> Transfer-Sperre (Time-lock)
            </label>
            <select
              className="w-full bg-[#0a0f1a] border border-[#1e2638] rounded-lg p-2.5 text-sm"
              value={config.executionDelayHours}
              onChange={(e) => setConfig({ ...config, executionDelayHours: Number(e.target.value) })}
            >
              <option value={0}>Keine Verzögerung</option>
              <option value={24}>24 Stunden</option>
              <option value={48}>48 Stunden (Standard)</option>
              <option value={168}>1 Woche</option>
            </select>
            <p className="text-[10px] text-[#6b7280]">
              Formel 9: Sättigung der Sicherheit. Zeit ermöglicht die Korrektur bei fälschlicher Auslösung.
            </p>
          </div>
        </section>

        {/* Unentdeckte Sphäre: Automatischer Trigger (Formel 30: Schöpfungsfaktor) */}
        <section className="p-4 bg-[#1c2333] border border-[#c9a54e]/20 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Users size={16} className="text-[#c9a54e]" /> Guardian-Benachrichtigung
            </label>
            <input
              type="checkbox"
              checked={config.notificationGuardians}
              onChange={(e) => setConfig({ ...config, notificationGuardians: e.target.checked })}
              className="accent-[#c9a54e]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="block font-medium">Auto-Trigger bei Inaktivität</span>
              <span className="text-[#6b7280]">Tage ohne Lebenszeichen</span>
            </div>
            <input
              type="number"
              className="w-16 bg-[#0a0f1a] border border-[#1e2638] rounded p-1 text-center text-sm"
              value={config.autoTriggerInactivityDays}
              onChange={(e) => setConfig({ ...config, autoTriggerInactivityDays: Number(e.target.value) })}
            />
          </div>
        </section>

        <div className="pt-6 border-t border-[#1e2638] flex flex-col gap-4">
          <div className="bg-[#c9a54e]/5 p-3 rounded-lg border border-[#c9a54e]/10 flex gap-3">
            <Info className="text-[#c9a54e] shrink-0" size={18} />
            <p className="text-[11px] text-[#9ca3af] leading-tight">
              <b>Explosive Stärke:</b> Durch die didit.me Integration eliminieren wir den "Simulanten ohne Leben" (Formel 28). 
              Der Notfall-Transfer basiert auf verifizierter Existenz, nicht auf bloßem Verhalten.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!!validationError || isSaving}
            className={`w-full font-bold py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(201,165,78,0.2)] ${
              saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-[#c9a54e] hover:bg-[#d4af5a]'
            } text-[#0a0f1a]`}
          >
            {isSaving ? "Verarbeite..." : saveSuccess ? (
              <span className="flex items-center gap-2"><CheckCircle2 size={18}/> Parameter versiegelt</span>
            ) : "Governance-Parameter versiegeln"}
          </Button>
        </div>
      </div>
    </div>
  );
};