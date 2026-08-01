import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
const prisma = new PrismaClient();
function slugify(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase().slice(0, 200);
}
async function main() {
  const books = await prisma.book.findMany({ where: { coverImage: { contains: 'unsplash' } }, select: { id: true, title: true, fileUrl: true, coverImage: true } });
  for (const b of books) {
    const fn = decodeURIComponent(b.fileUrl!.split('/pdfs/')[1] || '');
    const coverName = slugify(fn.replace(/\.pdf$/i, ''));
    const exists = fs.existsSync(path.join(process.cwd(), 'public', 'capas', `${coverName}.jpg`));
    console.log('Título:', b.title);
    console.log('  fileUrl:', b.fileUrl);
    console.log('  capa esperada:', `/capas/${coverName}.jpg`, '| no disco:', exists);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
