/**
 * Secure Display — canvas-based anti-copy rendering.
 *
 * Renders sensitive strings onto a <canvas> with watermark + noise so that
 * DOM-scraping extensions and copy/paste cannot capture the value.
 * The canvas itself is redrawn in place after `autoDestructMs`.
 */

export interface DisplayConfig {
  watermarkText: string;
  sessionId: string;
  autoDestructMs?: number;
  mode?: 'full' | 'split-screen';
}

export function renderSecretOnCanvas(
  canvas: HTMLCanvasElement,
  secret: string,
  config: DisplayConfig,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 240;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Background + noise
  ctx.fillStyle = '#0a0d10';
  ctx.fillRect(0, 0, width, height);
  drawNoise(ctx, width, height);

  // Diagonal watermark
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 7);
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.textAlign = 'center';
  const mark = `${config.watermarkText} · ${config.sessionId} · ${new Date().toISOString().slice(0, 19)}`;
  for (let y = -height; y < height * 2; y += 42) {
    ctx.fillText(mark, 0, y);
  }
  ctx.restore();

  // Frame
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(14, 14, width - 28, height - 28);

  // Header
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'left';
  ctx.fillText('DAIO SECURE DISPLAY', 26, 38);
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#6b7785';
  ctx.fillText(`Session: ${config.sessionId}`, 26, 54);

  // Divider
  ctx.strokeStyle = '#222b33';
  ctx.beginPath();
  ctx.moveTo(26, 64);
  ctx.lineTo(width - 26, 64);
  ctx.stroke();

  // Secret content
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#e5e8ec';
  ctx.textAlign = 'left';
  const lines = wrapText(secret, 48);
  lines.forEach((line, i) => ctx.fillText(line, 26, 92 + i * 22));

  // Footer warning
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f43f5e';
  ctx.textAlign = 'center';
  ctx.fillText('DO NOT PHOTOGRAPH · DO NOT RECORD · AUTO-DESTRUCT ACTIVE', width / 2, height - 22);

  if (config.autoDestructMs && config.autoDestructMs > 0) {
    setTimeout(() => destroyCanvas(canvas), config.autoDestructMs);
  }
}

export function destroyCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  // Paint random noise to overwrite
  const img = ctx.createImageData(w, h);
  const random = new Uint8Array(img.data.length);
  crypto.getRandomValues(random);
  img.data.set(random);
  ctx.putImageData(img, 0, 0);
  // Final black
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#6b7785';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('— DESTROYED —', w / 2 / (window.devicePixelRatio || 1), h / 2 / (window.devicePixelRatio || 1));
}

function drawNoise(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#10b981';
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
  ctx.restore();
}

function wrapText(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) {
    out.push(text.slice(i, i + maxChars));
  }
  return out;
}
