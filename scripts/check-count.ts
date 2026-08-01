import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.book.count();
  const withUnderscore = await prisma.book.count({ where: { fileUrl: { contains: '._' } } });
  console.log('Total de livros:', total);
  console.log('Com "._" no fileUrl:', withUnderscore);
  await prisma.$disconnect();
}
main().catch(console.error);
