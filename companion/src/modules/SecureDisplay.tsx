import { useEffect, useRef, useState } from 'react';
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
import { renderSecretOnCanvas, destroyCanvas } from '@/lib/secureDisplay';
import { Eye, Flame, Timer, Monitor } from 'lucide-react';

export function SecureDisplay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [secret, setSecret] = useState('corr3ct-horse-battery-STAPLE-0xdeadbeef');
  const [watermark, setWatermark] = useState('operator@daio');
  const [autoSecs, setAutoSecs] = useState(20);
  const [rendered, setRendered] = useState(false);
  const [destroyed, setDestroyed] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!rendered || destroyed) return;
    setRemaining(autoSecs);
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [rendered, destroyed, autoSecs]);

  function render() {
    if (!canvasRef.current) return;
    setDestroyed(false);
    renderSecretOnCanvas(canvasRef.current, secret, {
      watermarkText: watermark,
      sessionId: crypto.randomUUID().slice(0, 8),
      autoDestructMs: autoSecs * 1000,
    });
    setRendered(true);
    setTimeout(() => setDestroyed(true), autoSecs * 1000);
  }

  function destroyNow() {
    if (!canvasRef.current) return;
    destroyCanvas(canvasRef.current);
    setDestroyed(true);
    setRemaining(0);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        icon={<Monitor className="w-5 h-5" />}
        title="Secure Display"
        subtitle="Canvas-only rendering — no DOM, no copyable text, watermarked"
        badges={[
          <Badge key="1" tone={rendered && !destroyed ? 'emerald' : 'neutral'}>
            {rendered ? (destroyed ? 'Destroyed' : `Visible · ${remaining}s`) : 'Idle'}
          </Badge>,
          <Badge key="2" tone="sky">Canvas 2D</Badge>,
        ]}
      />

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Render a Secret</CardTitle>
          <CardDescription>
            The secret is painted as pixels on a canvas — there is no HTML text, so extensions cannot scrape it, and
            cmd+c copies nothing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Secret</Label>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Watermark text</Label>
              <Input value={watermark} onChange={(e) => setWatermark(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Auto-destruct (seconds)</Label>
              <Input
                type="number"
                min={5}
                max={120}
                value={autoSecs}
                onChange={(e) => setAutoSecs(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" onClick={render}>
              <Eye className="w-4 h-4" /> Render Securely
            </Button>
            <Button variant="danger" onClick={destroyNow} disabled={!rendered || destroyed}>
              <Flame className="w-4 h-4" /> Destroy Now
            </Button>
          </div>

          <div className="pt-2">
            <canvas
              ref={canvasRef}
              className="w-full h-60 rounded-lg border border-vault-700 bg-black"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {rendered && !destroyed && (
            <div className="flex items-center gap-2 text-xs font-mono text-vault-400">
              <Timer className="w-3.5 h-3.5 text-signal-amber" />
              auto-destruct in {remaining}s — try to select or copy: you cannot.
            </div>
          )}
        </CardContent>
      </Card>

      <Explainer title="Why pixel-only rendering" tone="violet">
        Browser extensions, accessibility tools and clipboard-monitoring malware all read the DOM. A canvas secret is
        invisible to every one of them. The watermark tags any screenshot with the operator identity and session id so
        a leaked photo is still forensically traceable.
      </Explainer>
    </div>
  );
}
