/**
 * Extrai a primeira página de cada PDF como imagem de capa
 *
 * Uso: npx tsx scripts/gerar-capas.ts
 */

import * as fs from 'fs';
import * as path from 'path';
const { createCanvas } = require('@napi-rs/canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

const LIVROS_DIR = path.join(process.cwd(), 'livros');
const CAPAS_DIR = path.join(process.cwd(), 'public', 'capas');

async function extractFirstPage(pdfPath: string, outputPath: string): Promise<boolean> {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjsLib.getDocument({ data }).promise;
    const page = await doc.getPage(1);

    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);

    return true;
  } catch (error: any) {
    console.error(`  Erro: ${error.message}`);
    return false;
  }
}

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
  if (!fs.existsSync(LIVROS_DIR)) {
    console.error('❌ Pasta "livros/" não encontrada.');
    process.exit(1);
  }

  fs.mkdirSync(CAPAS_DIR, { recursive: true });

  const files = fs.readdirSync(LIVROS_DIR).filter((f) => f.toLowerCase().endsWith('.pdf') && !f.startsWith('._'));
  console.log(`📚 ${files.length} PDFs encontrados\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const pdfPath = path.join(LIVROS_DIR, file);
    const coverName = slugify(file.replace(/\.pdf$/i, '')) + '.jpg';
    const coverPath = path.join(CAPAS_DIR, coverName);

    if (fs.existsSync(coverPath)) {
      success++;
      continue;
    }

    const ok = await extractFirstPage(pdfPath, coverPath);
    if (ok) {
      success++;
      console.log(`  ✅ [${success}/${files.length}] ${file}`);
    } else {
      failed++;
    }
  }

  console.log(`\n📊 RESULTADO:`);
  console.log(`   ✅ ${success} capas geradas`);
  console.log(`   ❌ ${failed} erros`);
  console.log(`\n📁 Capas salvas em: public/capas/`);
}

main().catch(console.error);
