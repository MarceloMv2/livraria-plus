import * as fs from 'fs';
import * as path from 'path';
const { createCanvas } = require('@napi-rs/canvas');

function drawIcon(size: number, outPath: string) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b6cf7');
  gradient.addColorStop(1, '#2549eb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const r = size * 0.14;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  const gap = size * 0.085;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.06;
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
}

function drawSplash(outPath: string) {
  const W = 1242, H = 2436;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#2549eb');
  gradient.addColorStop(1, '#1d35d8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  const r = 90;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 60, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 60, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 40;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 88px Helvetica';
  ctx.textAlign = 'center';
  ctx.fillText('Livraria Plus', W / 2, H / 2 + 160);

  ctx.font = '44px Helvetica';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('Milhares de e-books para ler', W / 2, H / 2 + 230);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
}

const iconDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(iconDir, { recursive: true });

const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512, 1024];
for (const s of sizes) drawIcon(s, path.join(iconDir, `icon-${s}.png`));
drawIcon(512, path.join(iconDir, 'icon-512-maskable.png'));
drawIcon(1024, path.join(process.cwd(), 'public', 'icon-1024.png'));
drawSplash(path.join(iconDir, 'splash.png'));
console.log('Icones e splash gerados em public/icons/');
