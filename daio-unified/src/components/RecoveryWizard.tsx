import React, { useState } from 'react';
import { Key, ShieldCheck, Copy, Download, AlertCircle, CheckCircle2, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { EncryptedStorageBridge } from "./EncryptedStorageBridge";

/**
 * RecoveryWizard
 * Führt den Nutzer durch die Generierung und Sicherung des DAIO Recovery-Keys.
 * Basiert auf Formel 19: Balance zwischen Recovery-Fähigkeit und Sicherheits-Hoheit.
 */
export const RecoveryWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [recoveryKey, setRecoveryKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const generateKey = () => {
    const key = EncryptedStorageBridge.generateRecoveryKey();
    setRecoveryKey(key);
    setStep(2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadKey = () => {
    const element = document.createElement("a");
    const file = new Blob([`DAIO Recovery Key: ${recoveryKey}\nErstellt am: ${new Date().toLocaleString()}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "daio-recovery-key.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#141a2a] border border-[#1e2638] rounded-2xl shadow-2xl text-[#e5e7eb]">
      {step === 1 && (
        <div className="space-y-6 text-center">
          <div className="bg-[#c9a54e]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c9a54e]/30">
            <Key className="text-[#c9a54e] w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Recovery-Key generieren</h2>
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Dieser Key ist Ihre letzte Rettung. Falls Sie Ihr Master-Passwort vergessen, 
            kann nur dieser Key Ihre verschlüsselten Governance-Daten (Formel 31) wiederherstellen.
          </p>
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex gap-3 text-left">
            <AlertCircle className="text-red-400 shrink-0" size={18} />
            <p className="text-[11px] text-red-200">
              Ohne Passwort UND ohne Recovery-Key sind Ihre Daten permanent verloren (Formel 25: Wirkung = 0).
            </p>
          </div>
          <Button 
            onClick={generateKey}
            className="w-full bg-[#c9a54e] hover:bg-[#d4af5a] text-[#0a0f1a] font-bold py-6 rounded-xl"
          >
            Key generieren
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#c9a54e] mb-2">
            <ShieldCheck size={20} />
            <h2 className="font-bold">Ihr persönlicher Recovery-Key</h2>
          </div>
          
          <div className="bg-[#0a0f1a] border border-[#1e2638] p-4 rounded-xl break-all font-mono text-sm text-[#c9a54e] shadow-inner">
            {recoveryKey}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={copyToClipboard}
              className="border-[#1e2638] hover:bg-[#1e2638] text-xs h-10"
            >
              {copied ? <CheckCircle2 size={14} className="mr-2 text-green-500" /> : <Copy size={14} className="mr-2" />}
              {copied ? "Kopiert" : "Kopieren"}
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadKey}
              className="border-[#1e2638] hover:bg-[#1e2638] text-xs h-10"
            >
              <Download size={14} className="mr-2" /> Download
            </Button>
          </div>

          <label className="flex items-start gap-3 p-3 bg-[#1c2333] border border-[#1e2638] rounded-lg cursor-pointer hover:border-[#c9a54e]/50 transition-colors">
            <input 
              type="checkbox" 
              className="mt-1 accent-[#c9a54e]"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="text-xs text-[#9ca3af]">
              Ich habe den Key sicher und offline verwahrt. Mir ist bewusst, dass DAIO diesen Key niemals für mich wiederherstellen kann.
            </span>
          </label>

          <Button 
            disabled={!confirmed}
            onClick={() => setStep(3)}
            className="w-full bg-[#c9a54e] hover:bg-[#d4af5a] disabled:opacity-50 text-[#0a0f1a] font-bold py-6 rounded-xl"
          >
            Sicherung bestätigen <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 text-center py-4">
          <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle2 className="text-green-500 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Sicherung erfolgreich</h2>
          <p className="text-sm text-[#9ca3af]">
            Ihr Recovery-Protokoll ist nun aktiv. Behandeln Sie diesen Key wie eine Seed-Phrase Ihrer Wallet.
          </p>
          <Button 
            onClick={() => setStep(1)}
            variant="ghost"
            className="text-[#c9a54e] hover:bg-[#c9a54e]/10 text-xs"
          >
            <RefreshCcw size={14} className="mr-1" /> Neuen Key generieren
          </Button>
        </div>
      )}
    </div>
  );
};