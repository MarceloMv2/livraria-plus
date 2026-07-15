import 'dotenv/config';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const LIVROS_DIR = path.join(process.cwd(), 'livros');
const PREFIX = 'pdfs';

async function fileExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadAll() {
  const files = fs.readdirSync(LIVROS_DIR).filter((f) => f.endsWith('.pdf') && !f.startsWith('._'));
  console.log(`Encontrados ${files.length} PDFs para upload`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const key = `${PREFIX}/${file}`;
    const exists = await fileExists(key);

    if (exists) {
      skipped++;
      continue;
    }

    try {
      const filePath = path.join(LIVROS_DIR, file);
      const content = fs.readFileSync(filePath);

      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: content,
          ContentType: 'application/pdf',
        })
      );

      uploaded++;
      if (uploaded % 10 === 0) {
        console.log(`Upload: ${uploaded}/${files.length - skipped} | Erros: ${errors}`);
      }
    } catch (err: any) {
      errors++;
      console.error(`Erro ao enviar ${file}: ${err.message}`);
    }
  }

  console.log(`\nFinalizado!`);
  console.log(`Enviados: ${uploaded}`);
  console.log(`Já existiam: ${skipped}`);
  console.log(`Erros: ${errors}`);
}

uploadAll();
