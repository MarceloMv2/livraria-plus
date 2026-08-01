import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const junk = await prisma.book.findMany({
    where: { fileUrl: { startsWith: '/api/livros/._' } },
    select: { id: true, title: true, fileUrl: true },
  });
  console.log('Livros-lixo encontrados:', junk.length);
  for (const j of junk) console.log(`  🗑️  ${j.title} -> ${j.fileUrl.slice(0, 100)}`);
  if (junk.length > 0) {
    await prisma.book.deleteMany({ where: { id: { in: junk.map(j => j.id) } } });
    console.log('✅ Deletados com sucesso');
  }
  await prisma.$disconnect();
}
main().catch(console.error);
