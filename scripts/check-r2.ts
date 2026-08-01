import 'dotenv/config';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
  console.log('Objetos no R2:', names.size);
  const pdfs = [...names].filter(n => n.endsWith('.pdf'));
  const junk = pdfs.filter(n => n.includes('/._'));
  console.log('PDFs:', pdfs.length, '| lixo ._:', junk.length);
}

main().catch(console.error);
