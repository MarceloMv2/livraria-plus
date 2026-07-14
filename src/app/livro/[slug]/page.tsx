import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, BookOpen, Heart, Share2, Clock, Eye, ShoppingCart, Check, ArrowLeft, BookMarked } from 'lucide-react';
import prisma from '@/lib/prisma';
import { BookCard } from '@/components/BookCard';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await prisma.book.findUnique({ where: { slug: params.slug } });
  if (!book) return { title: 'Livro não encontrado' };
  return {
    title: `${book.title} - Livraria Plus`,
    description: book.description.slice(0, 160),
  };
}

export default async function BookDetailPage({ params }: Props) {
  const book = await prisma.book.findUnique({ where: { slug: params.slug } });
  if (!book) notFound();

  const relatedBooks = await prisma.book.findMany({
    where: {
      id: { not: book.id },
      categories: { contains: book.categories.split(',')[0] },
    },
    take: 4,
  });

  const reviews = await prisma.review.findMany({
    where: { bookId: book.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const categoryMap: Record<string, string> = {
    'ficcao': 'Ficção', 'nao-ficcao': 'Não-Ficção', 'ciencia': 'Ciência',
    'tecnologia': 'Tecnologia', 'negocios': 'Negócios', 'filosofia': 'Filosofia',
    'historia': 'História', 'biografias': 'Biografias', 'autoajuda': 'Autoajuda',
    'fantasia': 'Fantasia', 'misterio': 'Mistério', 'romance': 'Romance',
    'terror': 'Terror', 'infantil': 'Infantil', 'academico': 'Acadêmico',
  };

  const formatNumber = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href="/catalogo" className="flex items-center gap-1 text-sm text-surface-500 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catálogo
        </Link>
      </div>

      {/* Book Detail */}
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Cover */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full object-cover"
                style={{ aspectRatio: '2/3' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {book.format}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Link
                href={`/livr/${book.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <Eye className="h-5 w-5" />
                {book.isFree ? 'Ler Grátis Agora' : 'Ler Agora'}
              </Link>
              {book.fileUrl && (
                <Link
                  href={`/amostra/${book.slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-surface-200 py-3.5 text-sm font-semibold text-surface-700 transition-all hover:bg-surface-50"
                >
                  <BookMarked className="h-5 w-5" />
                  Amostra Gratuita
                </Link>
              )}
              {!book.isFree && (
                <Link
                  href="/precos"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 py-3.5 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100"
                >
                  Assine para ler este livro
                </Link>
              )}
              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-200 py-3 text-sm text-surface-600 transition-colors hover:bg-surface-50">
                  <Heart className="h-4 w-4" />
                  Favoritar
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-200 py-3 text-sm text-surface-600 transition-colors hover:bg-surface-50">
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-2">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {book.isFree && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Grátis</span>
            )}
            {book.isNewRelease && (
              <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">Novo Lançamento</span>
            )}
            {book.isBestseller && (
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">Bestseller</span>
            )}
            {book.isFeatured && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Destaque</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-surface-900 sm:text-4xl">{book.title}</h1>
          <p className="mt-2 text-lg text-surface-500">
            por{' '}
            <Link href={`/autor/${book.authorSlug}`} className="text-primary-600 hover:underline">
              {book.author}
            </Link>
          </p>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(book.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-surface-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-surface-900">{book.rating.toFixed(1)}</span>
            <span className="text-sm text-surface-500">({formatNumber(book.ratingCount)} avaliações)</span>
          </div>

          {/* Categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {book.categories.split(',').map((cat) => (
              <Link
                key={cat}
                href={`/catalogo?category=${cat}`}
                className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600 hover:bg-primary-100 hover:text-primary-600"
              >
                {categoryMap[cat] || cat}
              </Link>
            ))}
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-surface-900 mb-3">Sinopse</h2>
            <p className="text-surface-600 leading-relaxed">{book.description}</p>
          </div>

          {/* Details */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Editora', value: book.publisher || '—' },
              { label: 'Publicação', value: book.publishDate || '—' },
              { label: 'Páginas', value: book.pages?.toString() || '—' },
              { label: 'Idioma', value: book.language === 'pt-BR' ? 'Português' : book.language === 'en' ? 'Inglês' : book.language },
              { label: 'ISBN', value: book.isbn || '—' },
              { label: 'Formato', value: book.format },
              { label: 'Tamanho', value: book.fileSize || '—' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-surface-50 p-3">
                <p className="text-xs text-surface-400">{item.label}</p>
                <p className="mt-0.5 text-sm font-medium text-surface-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {book.tags && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-surface-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {book.tags.split(',').map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-100 px-3 py-1 text-xs text-surface-500">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="text-lg font-bold text-surface-900 mb-4">
              Avaliações ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-surface-200 p-8 text-center">
                <Star className="mx-auto h-8 w-8 text-surface-300" />
                <p className="mt-2 text-sm text-surface-500">Ainda não há avaliações. Seja o primeiro!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-surface-200 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold text-sm">
                        {review.user?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 text-sm">{review.user?.name || 'Anônimo'}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-surface-300'}`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-surface-400">
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-surface-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-surface-900 mb-6">Livros Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
