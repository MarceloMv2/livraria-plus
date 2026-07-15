import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

async function updateUrls() {
  const books = await prisma.book.findMany({ select: { id: true, slug: true, fileUrl: true } });
  console.log(`${books.length} livros encontrados. Atualizando...`);

  let updated = 0;

  for (const book of books) {
    const match = book.fileUrl?.match(/\/api\/livros\/(.+\.pdf)$/i);
    if (!match) continue;

    const encodedFilename = match[1];
    const filename = decodeURIComponent(encodedFilename);
    const newUrl = `${R2_PUBLIC_URL}/pdfs/${encodeURIComponent(filename)}`;

    if (book.fileUrl === newUrl) continue;

    await prisma.book.update({
      where: { id: book.id },
      data: { fileUrl: newUrl },
    });
    updated++;
  }

  console.log(`Finalizado! ${updated} URLs atualizadas.`);
  await prisma.$disconnect();
}

updateUrls();
