import * as fs from 'fs';
import * as path from 'path';
const { createCanvas } = require('@napi-rs/canvas');

const RES = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');

const sizes: Record<string, number> = {
  mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192,
};
const fgSizes: Record<string, number> = {
  mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432,
};

function drawLauncher(size: number): Buffer {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#3b6cf7');
  bg.addColorStop(1, '#2549eb');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  const r = size * 0.14;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.06;
  ctx.stroke();
  return canvas.toBuffer('image/png');
}

function drawForeground(size: number): Buffer {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.18;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.08;
  ctx.stroke();
  return canvas.toBuffer('image/png');
}

for (const [dpi, size] of Object.entries(sizes)) {
  fs.writeFileSync(path.join(RES, `mipmap-${dpi}`, 'ic_launcher.png'), drawLauncher(size));
  fs.writeFileSync(path.join(RES, `mipmap-${dpi}`, 'ic_launcher_round.png'), drawLauncher(size));
}
for (const [dpi, size] of Object.entries(fgSizes)) {
  fs.writeFileSync(path.join(RES, `mipmap-${dpi}`, 'ic_launcher_foreground.png'), drawForeground(size));
}
console.log('Icones Android atualizados');
