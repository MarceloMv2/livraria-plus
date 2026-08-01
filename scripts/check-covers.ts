import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({ select: { id: true, title: true, slug: true, coverImage: true } });
  let missing = 0;
  const semCapa = [];
  for (const b of books) {
    if (b.coverImage.startsWith('/capas/')) {
      const file = path.join(process.cwd(), 'public', b.coverImage);
      if (!fs.existsSync(file)) {
        missing++;
        if (semCapa.length < 15) semCapa.push({ title: b.title, coverImage: b.coverImage });
      }
    } else if (b.coverImage.includes('unsplash')) {
      semCapa.push({ title: b.title, coverImage: 'UNSPLASH' });
      missing++;
    }
  }
  console.log('Total de livros:', books.length);
  console.log('Livros SEM capa válida:', missing);
  console.log('Exemplos:', JSON.stringify(semCapa, null, 2));
  await prisma.$disconnect();
}
main().catch(console.error);
