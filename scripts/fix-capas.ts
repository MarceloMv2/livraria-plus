import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 200);
}

function getFilename(fileUrl: string): string {
  // R2 URL: https://pub-....r2.dev/pdfs/FILENAME.pdf
  if (fileUrl.includes('/pdfs/')) {
    const decoded = decodeURIComponent(fileUrl.split('/pdfs/')[1] || '');
    return decoded;
  }
  // /api/livros/FILENAME.pdf
  if (fileUrl.includes('/api/livros/')) {
    return decodeURIComponent(fileUrl.split('/api/livros/')[1] || '');
  }
  return '';
}

async function main() {
  const books = await prisma.book.findMany({
    where: { coverImage: { contains: 'unsplash' } },
    select: { id: true, title: true, fileUrl: true, coverImage: true },
  });

  console.log(`Livros com capa fallback (Unsplash): ${books.length}\n`);

  let fixed = 0;
  let notFound = 0;

  for (const b of books) {
    const filename = getFilename(b.fileUrl ?? '');
    if (!filename) { notFound++; continue; }

    const coverName = slugify(filename.replace(/\.pdf$/i, ''));
    const coverPath = `/capas/${coverName}.jpg`;
    const fileExists = fs.existsSync(path.join(process.cwd(), 'public', 'capas', `${coverName}.jpg`));

    if (fileExists && b.coverImage !== coverPath) {
      await prisma.book.update({
        where: { id: b.id },
        data: { coverImage: coverPath },
      });
      fixed++;
    } else if (!fileExists) {
      notFound++;
    }
  }

  console.log(`✅ Capas corrigidas: ${fixed}`);
  console.log(`⚠️  Sem capa no disco: ${notFound}`);
  await prisma.$disconnect();
}
main().catch(console.error);
