import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Badge,
  Explainer,
  StatusDot,
  Separator,
} from '@/components/ui';
import { cn, shortHash } from '@/lib/utils';
import {
  deviceEncrypt,
  deviceDecrypt,
  hasDeviceKey,
  isDeviceBindingAvailable,
  rotateDeviceKey,
} from '@/lib/deviceBinding';
import { ModuleHeader } from '@/components/ModuleHeader';
import { Fingerprint, Lock, Unlock, RefreshCw, AlertTriangle } from 'lucide-react';

export function DeviceBinding() {
  const [available, setAvailable] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [plaintext, setPlaintext] = useState('my sensitive payload');
  const [cipher, setCipher] = useState<{ ciphertext: string; iv: string } | null>(null);
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAvailable(isDeviceBindingAvailable());
    hasDeviceKey().then(setEnrolled);
  }, []);

  async function handleEncrypt() {
    setError(null);
    setBusy(true);
    try {
      const result = await deviceEncrypt(plaintext);
      setCipher(result);
      setDecrypted(null);
      setEnrolled(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleDecrypt() {
    if (!cipher) return;
    setError(null);
    setBusy(true);
    try {
      const result = await deviceDecrypt(cipher.ciphertext, cipher.iv);
      setDecrypted(result);
    } catch (e) {
      setError('Decryption failed — possibly running on a different device/origin.');
      void e;
    } finally {
      setBusy(false);
    }
  }

  async function handleRotate() {
    setBusy(true);
    setError(null);
    try {
      await rotateDeviceKey();
      setCipher(null);
      setDecrypted(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Fingerprint className="w-5 h-5" />}
        title="Device Binding"
        subtitle="Non-extractable AES-256-GCM key bound to origin + device"
        badges={[
          <Badge key="1" tone={enrolled ? 'emerald' : 'neutral'}>
            <StatusDot tone={enrolled ? 'emerald' : 'neutral'} />
            {enrolled ? 'Enrolled' : 'Not enrolled'}
          </Badge>,
          <Badge key="2" tone={available ? 'sky' : 'rose'}>
            {available ? 'WebCrypto OK' : 'Unavailable'}
          </Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Encrypt / Decrypt</CardTitle>
          <CardDescription>
            The key never leaves this device. Copying encrypted bytes to another browser will fail to decrypt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Plaintext</Label>
            <Input value={plaintext} onChange={(e) => setPlaintext(e.target.value)} />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" onClick={handleEncrypt} loading={busy}>
              <Lock className="w-4 h-4" /> Encrypt
            </Button>
            <Button variant="secondary" onClick={handleDecrypt} loading={busy} disabled={!cipher}>
              <Unlock className="w-4 h-4" /> Decrypt
            </Button>
            <Button variant="ghost" onClick={handleRotate} loading={busy}>
              <RefreshCw className="w-4 h-4" /> Rotate Key
            </Button>
          </div>

          {error && (
            <div className="flex gap-2 items-start text-signal-rose text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {cipher && (
            <>
              <Separator />
              <div className="space-y-3">
                <KvRow label="Ciphertext" value={shortHash(cipher.ciphertext, 12, 10)} full={cipher.ciphertext} />
                <KvRow label="IV" value={cipher.iv} full={cipher.iv} />
                {decrypted !== null && (
                  <KvRow
                    label="Decrypted"
                    value={decrypted}
                    valueClass="text-signal-emerald"
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Explainer title="How it works" tone="sky">
        A 256-bit AES-GCM key is generated inside <code className="font-mono">crypto.subtle</code> with
        <code className="font-mono"> extractable: false</code> and stored in IndexedDB as a{' '}
        <code className="font-mono">CryptoKey</code> handle. JavaScript can invoke encrypt/decrypt but cannot read
        the raw bytes. A different origin or device lacks the key, so exfiltrated ciphertexts are inert.
      </Explainer>

      <Explainer title="Known limit — plan for it" tone="amber">
        IndexedDB is wiped when the user clears site data, uses private browsing, or switches device. Always pair
        with Shamir shards or Social Recovery so the device binding is a defense-in-depth layer, not a single point
        of failure.
      </Explainer>
    </div>
  );
}

function KvRow({
  label,
  value,
  full,
  valueClass,
}: {
  label: string;
  value: string;
  full?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 sm:items-center">
      <div className="text-xxs font-semibold uppercase tracking-wider text-vault-400 sm:w-24">{label}</div>
      <div
        className={cn('flex-1 font-mono text-xs text-vault-200 break-all', valueClass)}
        title={full ?? value}
      >
        {value}
      </div>
    </div>
  );
}

