import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import prisma from '@/lib/prisma';
import PdfViewer from './PdfViewer';

interface Props {
  params: { slug: string };
}

export default async function AmostraPage({ params }: Props) {
  const book = await prisma.book.findUnique({ where: { slug: params.slug } });
  if (!book || !book.fileUrl) notFound();

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-surface-800 bg-surface-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/livro/${book.slug}`}
            className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{book.title}</p>
              <p className="text-xs text-surface-400">{book.author}</p>
            </div>
            <Link
              href={`/livro/${book.slug}`}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Livro Completo
            </Link>
          </div>
        </div>
      </div>

      {/* Sample Banner */}
      <div className="border-b border-primary-900/50 bg-primary-950/50">
        <div className="mx-auto max-w-3xl px-4 py-3 text-center">
          <p className="text-sm text-primary-300">
            <span className="font-semibold">Amostra gratuita</span> — Visualizando as primeiras páginas de{' '}
            <span className="font-medium text-white">{book.title}</span>
          </p>
        </div>
      </div>

      {/* PDF Viewer */}
      <PdfViewer fileUrl={book.fileUrl} title={book.title} />

      {/* Bottom CTA */}
      <div className="border-t border-surface-800 bg-surface-950">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <h3 className="text-lg font-bold text-white">Gostou da amostra?</h3>
          <p className="mt-1 text-sm text-surface-400">Leia o livro completo agora.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href={`/livro/${book.slug}`}
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="mr-2 inline h-4 w-4" />
              Ler Livro Completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
