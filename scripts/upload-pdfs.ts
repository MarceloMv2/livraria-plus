/**
 * Script de upload em lote de PDFs para Cloudflare R2
 *
 * COMO USAR:
 * 1. Configure as variáveis de ambiente no .env:
 *    R2_ACCOUNT_ID=seu_account_id
 *    R2_ACCESS_KEY_ID=sua_access_key
 *    R2_SECRET_ACCESS_KEY=sua_secret_key
 *    R2_BUCKET_NAME=biblioteca-digital
 *    R2_PUBLIC_URL=https://seu-dominio.com
 *
 * 2. Execute:
 *    npx tsx scripts/upload-pdfs.ts /caminho/para/pasta/dos/pdfs
 *
 * Os arquivos serão organizados no R2 por inicial:
 *   books/A/nome-do-livro.pdf
 *   books/B/nome-do-livro.pdf
 *   ...
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'biblioteca-digital';

interface UploadResult {
  file: string;
  key: string;
  status: 'uploaded' | 'skipped' | 'error';
  error?: string;
}

interface AggregatedResults {
  uploaded: UploadResult[];
  skipped: UploadResult[];
  errors: UploadResult[];
}

async function fileExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 200);
}

async function uploadPDF(filePath: string): Promise<UploadResult> {
  const fileName = path.basename(filePath, '.pdf');
  const initial = fileName.charAt(0).toLowerCase();
  const key = `books/${initial}/${sanitizeFilename(fileName)}.pdf`;

  try {
    const exists = await fileExists(key);
    if (exists) {
      return { file: fileName, key, status: 'skipped' };
    }

    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/pdf',
        ContentLength: stats.size,
      })
    );

    return { file: fileName, key, status: 'uploaded' };
  } catch (error: any) {
    return { file: fileName, key, status: 'error', error: error.message };
  }
}

async function main() {
  const inputDir = process.argv[2];

  if (!inputDir) {
    console.error('Uso: npx tsx scripts/upload-pdfs.ts /caminho/para/pasta/dos/pdfs');
    process.exit(1);
  }

  if (!fs.existsSync(inputDir)) {
    console.error(`Pasta não encontrada: ${inputDir}`);
    process.exit(1);
  }

  console.log(`📚 Escaneando pasta: ${inputDir}`);

  const files = fs.readdirSync(inputDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  console.log(`📄 Encontrados ${files.length} arquivos PDF\n`);

  const results: AggregatedResults = { uploaded: [], skipped: [], errors: [] };
  let count = 0;
  const total = files.length;

  for (const file of files) {
    count++;
    const filePath = path.join(inputDir, file);
    const result = await uploadPDF(filePath);

    if (result.status === 'uploaded') results.uploaded.push(result);
    else if (result.status === 'skipped') results.skipped.push(result);
    else results.errors.push(result);

    if (count % 100 === 0 || count === total) {
      console.log(`[${count}/${total}] ✅ ${results.uploaded.length} enviados | ⏭️ ${results.skipped.length} ignorados | ❌ ${results.errors.length} erros`);
    }
  }

  console.log('\n📊 RESULTADO FINAL:');
  console.log(`   ✅ Enviados: ${results.uploaded.length}`);
  console.log(`   ⏭️ Ignorados (já existiam): ${results.skipped.length}`);
  console.log(`   ❌ Erros: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Arquivos com erro:');
    results.errors.forEach((r: any) => console.log(`   ${r.file}: ${r.error}`));
  }

  // Save results for import script
  const outputData = results.uploaded.map((r: any) => ({
    file: r.file,
    key: r.key,
    url: `https://${BUCKET}.r2.cloudflarestorage.com/${r.key}`,
  }));
  fs.writeFileSync('uploaded-files.json', JSON.stringify(outputData, null, 2));
  console.log('\n📁 Lista de arquivos enviados salva em: uploaded-files.json');
}

main().catch(console.error);
