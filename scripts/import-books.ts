/**
 * Script de importação de livros a partir dos PDFs enviados
 *
 * COMO USAR:
 *   npx tsx scripts/import-books.ts
 *
 * Este script lê o uploaded-files.json (gerado pelo upload-pdfs.ts)
 * e cria os registros no banco de dados.
 *
 * Para adicionar metadados (título, autor, etc.), crie um arquivo
 * books-metadata.csv ou books-metadata.json com as informações.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UploadedFile {
  file: string;
  key: string;
  url: string;
}

interface BookMetadata {
  filename: string;
  title: string;
  author: string;
  description?: string;
  categories?: string;
  tags?: string;
  language?: string;
  publisher?: string;
  publishDate?: string;
  pages?: number;
  isbn?: string;
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 200);
}

function extractTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s*-\s*\d{4}$/, '') // Remove trailing year
    .trim();
}

function extractAuthorFromFilename(filename: string): string {
  // Try to extract author from common patterns:
  // "Author - Title.pdf" or "Title - Author.pdf"
  const name = filename.replace(/\.pdf$/i, '');
  const parts = name.split(/\s*-\s*/);
  if (parts.length >= 2) {
    // Check if first part looks like an author (fewer words)
    if (parts[0].split(' ').length <= 3) {
      return parts[0].trim();
    }
    return parts[parts.length - 1].trim();
  }
  return 'Desconhecido';
}

function guessCategory(title: string, filename: string): string {
  const text = `${title} ${filename}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    'ficcao': ['romance', 'ficção', 'conto', 'novela', 'conto', 'fiction'],
    'tecnologia': ['programação', 'software', 'código', 'code', 'python', 'javascript', 'java', 'react', 'node', 'web', 'dev', 'api', 'database', 'sql', 'css', 'html'],
    'ciencia': ['ciência', 'science', 'física', 'química', 'biologia', 'math', 'matemática', 'research'],
    'negocios': ['negócio', 'business', 'marketing', 'vendas', 'gestão', 'management', 'empreendedor', 'startup', 'lean'],
    'autoajuda': ['autoajuda', 'desenvolvimento pessoal', 'self-help', 'hábito', 'motivação', 'produtividade'],
    'historia': ['história', 'history', 'guerra', 'civilização', 'imperio'],
    'filosofia': ['filosofia', 'philosophy', 'ética', 'moral', 'pensamento'],
    'biografias': ['biografia', 'biography', 'vida de', 'autobiography'],
    'fantasia': ['fantasia', 'fantasy', 'dragão', 'mago', 'aventura', 'épico'],
    'misterio': ['mistério', 'mystery', 'detective', 'investigação', 'crime', 'thriller', 'suspense'],
    'terror': ['terror', 'horror', 'medo', 'sobrenatural', 'fantasma'],
    'romance': ['amor', 'love', 'romance', 'casal', 'paixão'],
    'academico': ['manual', 'textbook', 'curso', 'aula', 'exercício', 'prova', 'faculdade', 'universidade'],
    'medicina': ['medicina', 'médico', 'saúde', 'anatomia', 'clínica', 'doença', 'pharma'],
    'direito': ['direito', 'lei', 'advocacia', 'jurisprudência', 'tribunal', 'constituição'],
    'economia': ['economia', 'economy', 'finança', 'investimento', 'economia', 'finance'],
    'arte-design': ['arte', 'design', 'fotografia', 'pintura', 'música', 'art'],
    'ciencias-humanas': ['psicologia', 'sociologia', 'antropologia', 'psychology', 'sociology'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }

  return 'nao-ficcao';
}

async function loadMetadata(): Promise<Map<string, BookMetadata>> {
  const metadataMap = new Map<string, BookMetadata>();

  // Try CSV
  const csvPath = path.join(process.cwd(), 'books-metadata.csv');
  if (fs.existsSync(csvPath)) {
    console.log('📋 Carregando metadados de books-metadata.csv');
    const csv = fs.readFileSync(csvPath, 'utf-8');
    const lines = csv.split('\n').filter((l) => l.trim());

    if (lines.length > 0) {
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        const metadata: any = {};
        headers.forEach((h, idx) => {
          metadata[h] = values[idx] || '';
        });
        if (metadata.filename) {
          metadataMap.set(metadata.filename, metadata as BookMetadata);
        }
      }
    }
  }

  // Try JSON
  const jsonPath = path.join(process.cwd(), 'books-metadata.json');
  if (fs.existsSync(jsonPath)) {
    console.log('📋 Carregando metadados de books-metadata.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    for (const item of data) {
      if (item.filename) {
        metadataMap.set(item.filename, item as BookMetadata);
      }
    }
  }

  console.log(`📋 ${metadataMap.size} metadados carregados\n`);
  return metadataMap;
}

async function main() {
  const uploadedPath = path.join(process.cwd(), 'uploaded-files.json');

  if (!fs.existsSync(uploadedPath)) {
    console.error('❌ Arquivo uploaded-files.json não encontrado.');
    console.error('   Execute primeiro: npx tsx scripts/upload-pdfs.ts /caminho/dos/pdfs');
    process.exit(1);
  }

  const uploaded: UploadedFile[] = JSON.parse(fs.readFileSync(uploadedPath, 'utf-8'));
  console.log(`📚 ${uploaded.length} arquivos para importar\n`);

  const metadata = await loadMetadata();

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of uploaded) {
    try {
      const meta = metadata.get(file.file);
      const title = meta?.title || extractTitleFromFilename(file.file);
      const author = meta?.author || extractAuthorFromFilename(file.file);
      const slug = slugify(title);

      // Check if book already exists
      const existing = await prisma.book.findUnique({ where: { slug } });
      if (existing) {
        skipped++;
        continue;
      }

      const category = meta?.categories || guessCategory(title, file.file);

      await prisma.book.create({
        data: {
          title,
          slug,
          author,
          authorSlug: slugify(author),
          description: meta?.description || `${title} - Livro digital disponível na Livraria Plus.`,
          coverImage: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop`,
          isbn: meta?.isbn || null,
          publisher: meta?.publisher || null,
          publishDate: meta?.publishDate || null,
          language: meta?.language || 'pt-BR',
          pages: meta?.pages || null,
          fileSize: null,
          format: 'PDF',
          rating: 0,
          ratingCount: 0,
          downloadCount: 0,
          isFeatured: false,
          isNewRelease: false,
          isBestseller: false,
          categories: category,
          tags: meta?.tags || null,
          fileUrl: file.url,
        },
      });

      created++;

      if (created % 100 === 0) {
        console.log(`[${created + skipped + errors}/${uploaded.length}] ✅ ${created} criados | ⏭️ ${skipped} ignorados | ❌ ${errors} erros`);
      }
    } catch (error: any) {
      errors++;
      if (errors <= 10) {
        console.error(`❌ Erro ao importar ${file.file}: ${error.message}`);
      }
    }
  }

  console.log('\n📊 RESULTADO FINAL:');
  console.log(`   ✅ Criados: ${created}`);
  console.log(`   ⏭️ Ignorados: ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);

  await prisma.$disconnect();
}

main().catch(console.error);
