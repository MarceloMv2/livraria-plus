import * as fs from 'fs';
import * as path from 'path';
const { createCanvas } = require('@napi-rs/canvas');

const RES = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');

function drawSplash(w: number, h: number): Buffer {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#2549eb');
  bg.addColorStop(1, '#1d35d8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.12;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 1.5, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy - r * 1.5, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = r * 0.35;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${r}px Helvetica`;
  ctx.textAlign = 'center';
  ctx.fillText('Livraria Plus', cx, cy + r * 0.9);
  return canvas.toBuffer('image/png');
}

const dirs: Record<string, [number, number]> = {
  'drawable': [480, 800],
  'drawable-port-mdpi': [480, 320],
  'drawable-port-hdpi': [720, 480],
  'drawable-port-xhdpi': [960, 640],
  'drawable-port-xxhdpi': [1440, 960],
  'drawable-port-xxxhdpi': [1920, 1280],
  'drawable-land-mdpi': [320, 480],
  'drawable-land-hdpi': [480, 720],
  'drawable-land-xhdpi': [640, 960],
  'drawable-land-xxhdpi': [960, 1440],
  'drawable-land-xxxhdpi': [1280, 1920],
};

for (const [dir, [w, h]] of Object.entries(dirs)) {
  fs.writeFileSync(path.join(RES, dir, 'splash.png'), drawSplash(w, h));
}
console.log('Splash Android geradas (incluindo drawable/)');
