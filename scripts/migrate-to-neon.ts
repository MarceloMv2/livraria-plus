import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';

const neonPrisma = new PrismaClient();

interface SqliteBook {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorSlug: string;
  description: string;
  coverImage: string;
  isbn: string | null;
  publisher: string | null;
  publishDate: string | null;
  language: string;
  pages: number | null;
  fileSize: string | null;
  format: string;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  isFeatured: number;
  isNewRelease: number;
  isBestseller: number;
  isFree: number;
  categories: string;
  tags: string | null;
  fileUrl: string | null;
  sampleUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

async function main() {
  console.log('📖 Conectando ao banco local SQLite...');
  const sqlite = new Database('./prisma/dev.db');

  console.log('🐘 Conectando ao Neon PostgreSQL...');
  await neonPrisma.$connect();

  // Migrar livros
  console.log('📚 Migrando livros...');
  const localBooks = sqlite.prepare('SELECT * FROM books').all() as SqliteBook[];
  console.log(`   Encontrados ${localBooks.length} livros no SQLite`);

  let migrated = 0;
  let skipped = 0;

  for (const book of localBooks) {
    try {
      await neonPrisma.book.upsert({
        where: { slug: book.slug },
        update: {
          title: book.title,
          author: book.author,
          authorSlug: book.authorSlug,
          description: book.description,
          coverImage: book.coverImage,
          isbn: book.isbn,
          publisher: book.publisher,
          publishDate: book.publishDate,
          language: book.language,
          pages: book.pages,
          fileSize: book.fileSize,
          format: book.format,
          rating: book.rating,
          ratingCount: book.ratingCount,
          downloadCount: book.downloadCount,
          isFeatured: !!book.isFeatured,
          isNewRelease: !!book.isNewRelease,
          isBestseller: !!book.isBestseller,
          isFree: !!book.isFree,
          categories: book.categories,
          tags: book.tags,
          fileUrl: book.fileUrl,
          sampleUrl: book.sampleUrl,
        },
        create: {
          id: book.id,
          title: book.title,
          slug: book.slug,
          author: book.author,
          authorSlug: book.authorSlug,
          description: book.description,
          coverImage: book.coverImage,
          isbn: book.isbn,
          publisher: book.publisher,
          publishDate: book.publishDate,
          language: book.language,
          pages: book.pages,
          fileSize: book.fileSize,
          format: book.format,
          rating: book.rating,
          ratingCount: book.ratingCount,
          downloadCount: book.downloadCount,
          isFeatured: !!book.isFeatured,
          isNewRelease: !!book.isNewRelease,
          isBestseller: !!book.isBestseller,
          isFree: !!book.isFree,
          categories: book.categories,
          tags: book.tags,
          fileUrl: book.fileUrl,
          sampleUrl: book.sampleUrl,
        },
      });
      migrated++;
      if (migrated % 100 === 0) {
        console.log(`   ✅ ${migrated}/${localBooks.length} migrados...`);
      }
    } catch (e: any) {
      console.log(`   ⚠️  Pulando "${book.title}": ${e.message?.slice(0, 80)}`);
      skipped++;
    }
  }

  console.log(`\n📚 Livros: ${migrated} migrados, ${skipped} pulados`);

  // Migrar categorias
  console.log('📂 Migrando categorias...');
  const localCategories = sqlite.prepare('SELECT * FROM categories').all() as any[];
  for (const cat of localCategories) {
    try {
      await neonPrisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description, icon: cat.icon, bookCount: cat.bookCount },
        create: { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon, bookCount: cat.bookCount },
      });
    } catch (e: any) {
      console.log(`   ⚠️  Categoria "${cat.name}": ${e.message?.slice(0, 80)}`);
    }
  }
  console.log(`   ✅ ${localCategories.length} categorias migradas`);

  sqlite.close();
  await neonPrisma.$disconnect();

  console.log('\n🎉 Migração concluída com sucesso!');
}

main().catch(console.error);
