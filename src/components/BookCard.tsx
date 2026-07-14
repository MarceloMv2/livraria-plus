'use client';

import Link from 'next/link';
import { Star, BookOpen, Heart, Eye } from 'lucide-react';
import type { Book } from '@/lib/types';

interface BookCardProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number;
}

export function BookCard({ book, size = 'md', showProgress, progress }: BookCardProps) {
  const categoryMap: Record<string, string> = {
    'ficcao': 'Ficção',
    'nao-ficcao': 'Não-Ficção',
    'ciencia': 'Ciência',
    'tecnologia': 'Tecnologia',
    'negocios': 'Negócios',
    'filosofia': 'Filosofia',
    'historia': 'História',
    'biografias': 'Biografias',
    'autoajuda': 'Autoajuda',
    'fantasia': 'Fantasia',
    'misterio': 'Mistério',
    'romance': 'Romance',
    'terror': 'Terror',
    'infantil': 'Infantil',
    'academico': 'Acadêmico',
  };

  const primaryCategory = book.categories.split(',')[0];
  const categoryName = categoryMap[primaryCategory] || primaryCategory;

  const sizes = {
    sm: { img: 'h-40', title: 'text-xs', author: 'text-[10px]' },
    md: { img: 'h-52', title: 'text-sm', author: 'text-xs' },
    lg: { img: 'h-64', title: 'text-base', author: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <Link href={`/livro/${book.slug}`} className="book-card group block">
      <div className="relative overflow-hidden rounded-xl bg-surface-100">
        {/* Cover Image */}
        <div className={`${s.img} relative w-full overflow-hidden`}>
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {(book as any).isFree && (
              <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                GRÁTIS
              </span>
            )}
            {book.isNewRelease && (
              <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                NOVO
              </span>
            )}
            {book.isBestseller && (
              <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-all group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-600 shadow-lg transition-colors hover:bg-white hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-600 shadow-lg transition-colors hover:bg-white hover:text-primary-600"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Format badge */}
          <div className="absolute bottom-2 left-2">
            <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {book.format}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && progress !== undefined && (
          <div className="h-1 bg-surface-200">
            <div
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {/* Info */}
        <div className="p-3">
          <h3 className={`${s.title} font-semibold text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors`}>
            {book.title}
          </h3>
          <p className={`${s.author} mt-1 text-surface-500 truncate`}>{book.author}</p>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-surface-700">{book.rating.toFixed(1)}</span>
              <span className="text-[10px] text-surface-400">({book.ratingCount})</span>
            </div>
            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-600">
              {categoryName}
            </span>
          </div>

          {book.pages && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-surface-400">
              <BookOpen className="h-3 w-3" />
              {book.pages} páginas
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
