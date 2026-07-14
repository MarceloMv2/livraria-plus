import Link from 'next/link';
import { BookX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-100 text-surface-400 mb-6">
          <BookX className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-surface-900">404</h1>
        <p className="mt-2 text-lg text-surface-500">Página não encontrada</p>
        <p className="mt-1 text-sm text-surface-400">O conteúdo que você procura não existe ou foi movido.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 px-6 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-50"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
