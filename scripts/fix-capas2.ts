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
  if (fileUrl.includes('/pdfs/')) return decodeURIComponent(fileUrl.split('/pdfs/')[1] || '');
  if (fileUrl.includes('/api/livros/')) return decodeURIComponent(fileUrl.split('/api/livros/')[1] || '');
  return '';
}

async function main() {
  const books = await prisma.book.findMany({
    where: { coverImage: { contains: 'unsplash' } },
    select: { id: true, title: true, fileUrl: true, coverImage: true },
  });
  for (const b of books) {
    const filename = getFilename(b.fileUrl ?? '');
    const coverName = slugify(filename.replace(/\.pdf$/i, ''));
    const fileExists = fs.existsSync(path.join(process.cwd(), 'public', 'capas', `${coverName}.jpg`));
    console.log(`SEM CAPA: ${b.title} | file: ${filename} | cover: /capas/${coverName}.jpg`);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
