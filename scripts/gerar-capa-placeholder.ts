import * as fs from 'fs';
import * as path from 'path';
const { createCanvas } = require('@napi-rs/canvas');

function slugify(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase().slice(0, 200);
}

function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function generate(title: string, outName: string) {
  const canvas = createCanvas(600, 900);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 600, 900);
  gradient.addColorStop(0, '#1e3a5f');
  gradient.addColorStop(1, '#0f1f33');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 900);

  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 552, 852);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px Helvetica';
  ctx.fillText('Livraria Plus', 60, 120);

  const maxWidth = 480;
  let fontSize = 46;
  ctx.font = `bold ${fontSize}px Helvetica`;
  let lines = wrapText(ctx, title, maxWidth);
  while (lines.length > 6 && fontSize > 22) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px Helvetica`;
    lines = wrapText(ctx, title, maxWidth);
    if (lines.length <= 6) break;
  }
  ctx.textAlign = 'center';
  const startY = 380;
  const lineHeight = fontSize * 1.25;
  lines.forEach((line, i) => {
    ctx.fillText(line, 300, startY + i * lineHeight);
  });

  ctx.textAlign = 'left';
  ctx.font = '26px Helvetica';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('E-book disponível', 60, 780);

  const outPath = path.join(process.cwd(), 'public', 'capas', `${outName}.jpg`);
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Capa gerada:', outPath);
}

generate('O Apóstolo dos Pés Sangrentos', 'o-apostolo-dos-pes-sangrentos-boanerges-ribeiro').catch(e => console.error('Erro:', e.message));
