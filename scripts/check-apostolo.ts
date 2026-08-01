import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const books = await prisma.book.findMany({
    where: { coverImage: { contains: 'unsplash' } },
    select: { id: true, title: true, slug: true, fileUrl: true },
  });
  for (const b of books) {
    console.log(`ID: ${b.id}`);
    console.log(`  Título: ${b.title}`);
    console.log(`  Slug: ${b.slug}`);
    console.log(`  URL: ${b.fileUrl}`);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
