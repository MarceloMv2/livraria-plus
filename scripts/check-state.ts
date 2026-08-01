import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.book.count();
  const unsplash = await prisma.book.count({ where: { coverImage: { contains: 'unsplash' } } });
  const r2 = await prisma.book.count({ where: { fileUrl: { startsWith: 'https://pub-' } } });
  const api = await prisma.book.count({ where: { fileUrl: { startsWith: '/api/livros/' } } });
  const junk = await prisma.book.count({ where: { fileUrl: { contains: '._' } } });
  const emptyCover = await prisma.book.count({ where: { coverImage: '' } });
  console.log('Total:', total);
  console.log('Capa Unsplash (fallback):', unsplash);
  console.log('URL R2:', r2);
  console.log('URL /api/livros:', api);
  console.log('fileUrl com ._ (lixo):', junk);
  console.log('coverImage vazio:', emptyCover);
  await prisma.$disconnect();
}
main().catch(console.error);
