import * as fs from 'fs';
import * as path from 'path';
const { createCanvas } = require('@napi-rs/canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 200);
}

async function main() {
  const pdfPath = path.join(process.cwd(), 'livros', 'ZUMBI DOS PALMARES COMPLETO.pdf');
  const name = 'ZUMBI DOS PALMARES COMPLETO';
  const outPath = path.join(process.cwd(), 'public', 'capas', `${slugify(name)}.jpg`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Capa gerada:', outPath);
}
main().catch((e) => console.error('Erro:', e.message));
