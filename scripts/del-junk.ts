import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const del = await prisma.book.deleteMany({
    where: { fileUrl: { contains: '._' } },
  });
  console.log('🗑️  Livros-lixo deletados:', del.count);
  await prisma.$disconnect();
}
main().catch(console.error);
