/**
 * Script simples de importação
 *
 * 1. Copie seus PDFs para a pasta "livros/" na raiz do projeto
 * 2. Execute: npx tsx scripts/importar-livros.ts
 * 3. Pronto! Os livros aparecem no site automaticamente
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 200);
}

function extractInfo(filename: string) {
  const name = filename.replace(/\.pdf$/i, '').replace(/_/g, ' ');

  // Padrão: "Autor - Titulo" ou "Titulo - Autor"
  const parts = name.split(/\s*-\s*/);
  let title = name;
  let author = 'Desconhecido';

  if (parts.length >= 2) {
    if (parts[0].split(' ').length <= 3) {
      author = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    } else {
      title = parts[0].trim();
      author = parts.slice(1).join(' - ').trim();
    }
  }

  return { title, author };
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  const map: Record<string, string[]> = {
    'tecnologia': ['programação', 'software', 'code', 'python', 'javascript', 'java', 'react', 'node', 'web', 'dev', 'api', 'sql', 'css', 'html', 'computer', 'algorithm', 'data'],
    'ciencia': ['ciência', 'science', 'física', 'química', 'biologia', 'math', 'matemática'],
    'negocios': ['business', 'marketing', 'gestão', 'management', 'empreendedor', 'startup', 'lean', 'vendas'],
    'autoajuda': ['autoajuda', 'hábito', 'motivação', 'produtividade', 'self-help', 'mindset'],
    'historia': ['história', 'history', 'guerra', 'civilização', 'imperio', 'war'],
    'filosofia': ['filosofia', 'philosophy', 'ética', 'pensamento'],
    'biografias': ['biografia', 'biography', 'vida de', 'autobiography'],
    'fantasia': ['fantasia', 'fantasy', 'dragão', 'mago', 'aventura'],
    'misterio': ['mistério', 'mystery', 'detective', 'crime', 'thriller', 'suspense'],
    'terror': ['terror', 'horror', 'sobrenatural'],
    'romance': ['amor', 'love', 'romance', 'paixão'],
    'medicina': ['medicina', 'médico', 'saúde', 'anatomia', 'clínica'],
    'direito': ['direito', 'lei', 'advocacia', 'jurisprudência'],
    'economia': ['economia', 'economy', 'finança', 'investimento', 'finance'],
  };

  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => t.includes(kw))) return cat;
  }
  return 'nao-ficcao';
}

async function main() {
  const livrosDir = path.join(process.cwd(), 'livros');

  if (!fs.existsSync(livrosDir)) {
    console.error('❌ Pasta "livros/" não encontrada.');
    console.error('   Crie a pasta e coloque seus PDFs dentro dela.');
    process.exit(1);
  }

  const files = fs.readdirSync(livrosDir).filter((f) => f.toLowerCase().endsWith('.pdf'));

  if (files.length === 0) {
    console.error('❌ Nenhum arquivo PDF encontrado na pasta "livros/"');
    process.exit(1);
  }

  console.log(`📚 Encontrados ${files.length} PDFs na pasta livros/\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const { title, author } = extractInfo(file);
      const slug = slugify(title);

      const existing = await prisma.book.findUnique({ where: { slug } });
      if (existing) {
        skipped++;
        continue;
      }

      const category = guessCategory(title);
      const filePath = `/api/livros/${encodeURIComponent(file)}`;
      const coverPath = `/capas/${slugify(file.replace(/\.pdf$/i, ''))}.jpg`;
      const hasCover = fs.existsSync(path.join(process.cwd(), 'public', 'capas', `${slugify(file.replace(/\.pdf$/i, ''))}.jpg`));
      const stats = fs.statSync(path.join(livrosDir, file));
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

      await prisma.book.create({
        data: {
          title,
          slug,
          author,
          authorSlug: slugify(author),
          description: `${title} — Livro digital disponível na Livraria Plus.`,
          coverImage: hasCover ? coverPath : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
          language: 'pt-BR',
          format: 'PDF',
          fileSize: `${sizeMB} MB`,
          rating: 0,
          ratingCount: 0,
          downloadCount: 0,
          isFeatured: false,
          isNewRelease: false,
          isBestseller: false,
          categories: category,
          fileUrl: filePath,
        },
      });

      created++;

      if (created % 50 === 0) {
        console.log(`  ✅ ${created} criados | ⏭️ ${skipped} ignorados | ❌ ${errors} erros`);
      }
    } catch (error: any) {
      errors++;
      if (errors <= 5) {
        console.error(`  ❌ ${file}: ${error.message}`);
      }
    }
  }

  console.log(`\n📊 RESULTADO:`);
  console.log(`   ✅ ${created} livros cadastrados`);
  console.log(`   ⏭️ ${skipped} já existiam`);
  console.log(`   ❌ ${errors} erros`);

  await prisma.$disconnect();
}

main().catch(console.error);
