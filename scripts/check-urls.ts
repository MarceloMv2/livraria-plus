import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function main() {
  const names = new Set<string>();
  let token: string | undefined;
  do {
    const res = await r2.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME!, ContinuationToken: token }));
    for (const o of res.Contents ?? []) names.add(o.Key!);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  const books = await prisma.book.findMany({ select: { id: true, title: true, slug: true, fileUrl: true } });
  let inR2 = 0, missing = 0;
  const missingList: string[] = [];
  for (const b of books) {
    const match = b.fileUrl?.match(/\/api\/livros\/(.+\.pdf)$/i);
    if (!match) continue;
    const filename = decodeURIComponent(match[1]);
    if (names.has(`pdfs/${filename}`)) inR2++;
    else { missing++; if (missingList.length < 15) missingList.push(`${b.title} -> ${filename}`); }
  }
  console.log('Livros:', books.length);
  console.log('PDF existe no R2:', inR2);
  console.log('PDF FALTANDO:', missing);
  missingList.forEach(m => console.log('  FALTA:', m));
  await prisma.$disconnect();
}

main().catch(console.error);
