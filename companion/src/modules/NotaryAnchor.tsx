import { useState } from 'react';
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
} from '@/components/ui';
import { ModuleHeader } from '@/components/ModuleHeader';
import {
  createAnchorDocument,
  hashString,
  buildAnchorTx,
  documentTypeLabel,
  type AnchorDocument,
  type DocumentType,
} from '@/lib/notaryAnchor';
import { shortHash } from '@/lib/utils';
import { Stamp, FileCheck2, Upload, Hash } from 'lucide-react';
import type { Address } from 'viem';

const DOC_TYPES: DocumentType[] = [
  'death_certificate',
  'court_order',
  'power_of_attorney',
  'identity_document',
  'notarized_declaration',
  'other',
];

export function NotaryAnchor() {
  const [docs, setDocs] = useState<AnchorDocument[]>([]);
  const [type, setType] = useState<DocumentType>('death_certificate');
  const [contract, setContract] = useState('0x0000000000000000000000000000000000000000');
  const [stringToHash, setStringToHash] = useState('Last Will — DK · 2026-04-17');
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const doc = await createAnchorDocument(file, type);
      setDocs((prev) => [doc, ...prev]);
    } catch (err) {
      setError(String(err));
    }
  }

  function hashInline() {
    const h = hashString(stringToHash);
    const doc: AnchorDocument = {
      id: crypto.randomUUID(),
      type: 'other',
      fileName: `inline:${stringToHash.slice(0, 24)}${stringToHash.length > 24 ? '…' : ''}`,
      fileSize: stringToHash.length,
      uploadedAt: Date.now(),
      documentHash: h,
      status: 'hash_computed',
      metadata: { source: 'inline_text' },
    };
    setDocs((prev) => [doc, ...prev]);
  }

  function downloadTx(d: AnchorDocument) {
    try {
      const tx = buildAnchorTx(contract as Address, d.documentHash, Math.floor(Date.now() / 1000));
      const payload = { to: tx.to, data: tx.data, value: tx.value.toString() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anchor-${d.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Stamp className="w-5 h-5" />}
        title="Notary Anchor"
        subtitle="keccak256 document hash → immutable on-chain timestamp"
        badges={[
          <Badge key="1" tone="sky">keccak256</Badge>,
          <Badge key="2" tone={docs.length > 0 ? 'emerald' : 'neutral'}>
            {docs.length} doc{docs.length === 1 ? '' : 's'}
          </Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Anchor a document</CardTitle>
          <CardDescription>
            The file never leaves your browser — only its 32-byte hash does. You get a JSON transaction to broadcast
            manually. No upload, no storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document type</Label>
            <div className="flex gap-2 flex-wrap">
              {DOC_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                    type === t
                      ? 'bg-signal-violet/15 border-signal-violet/40 text-signal-violet'
                      : 'bg-vault-900 border-vault-700 text-vault-300 hover:bg-vault-800'
                  }`}
                >
                  {documentTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Anchor contract address</Label>
            <Input value={contract} onChange={(e) => setContract(e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Upload file</Label>
              <label className="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-vault-700 bg-vault-900 hover:bg-vault-800 cursor-pointer text-sm text-vault-300">
                <Upload className="w-4 h-4" />
                Choose file
                <input type="file" className="hidden" onChange={handleFile} />
              </label>
            </div>
            <div className="space-y-2">
              <Label>Or hash a string</Label>
              <div className="flex gap-2">
                <Input value={stringToHash} onChange={(e) => setStringToHash(e.target.value)} />
                <Button variant="secondary" onClick={hashInline}>
                  <Hash className="w-4 h-4" /> Hash
                </Button>
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-signal-rose font-mono">{error}</div>}
        </CardContent>
      </Card>

      {docs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hashed documents</CardTitle>
            <CardDescription>Download the unsigned anchor tx for each and broadcast from your wallet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="p-3 rounded-lg border border-vault-700 bg-vault-900 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck2 className="w-4 h-4 text-signal-emerald flex-shrink-0" />
                    <span className="text-sm text-vault-100 truncate">{d.fileName}</span>
                    <Badge tone="neutral">{documentTypeLabel(d.type)}</Badge>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => downloadTx(d)}>
                    <Stamp className="w-3 h-3" /> Anchor tx
                  </Button>
                </div>
                <div className="text-xxs font-mono text-vault-400 break-all">
                  hash: {shortHash(d.documentHash, 18, 12)}
                </div>
                <div className="text-xxs font-mono text-vault-500">
                  {d.fileSize} bytes · {new Date(d.uploadedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Explainer title="Why anchor on-chain" tone="violet">
        A notarised inheritance declaration proves ownership, but it proves nothing about <em>when</em> it was signed.
        Anchoring the keccak256 hash on a public blockchain establishes a tamper-proof upper bound on the timestamp
        — neither the notary nor the heir can backdate it afterwards.
      </Explainer>
    </div>
  );
}
