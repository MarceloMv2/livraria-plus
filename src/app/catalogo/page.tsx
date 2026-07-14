'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import type { Book } from '@/lib/types';

const letters = ['Todos', ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''), '0-9'];

const languages = [
  { name: 'Todos', slug: '' },
  { name: 'Português', slug: 'pt-BR' },
  { name: 'Inglês', slug: 'en' },
  { name: 'Espanhol', slug: 'es' },
];

const sortOptions = [
  { name: 'Relevância', value: 'relevance' },
  { name: 'Mais recentes', value: 'newest' },
  { name: 'Melhor avaliados', value: 'rating' },
  { name: 'Mais baixados', value: 'downloads' },
  { name: 'A-Z', value: 'alpha' },
];

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalResults, setTotalResults] = useState(0);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLanguage) params.set('language', selectedLanguage);
    if (sortBy) params.set('sort', sortBy);

    try {
      const res = await fetch(`/api/books?${params.toString()}`);
      const data = await res.json();
      setBooks(data.books);
      setTotalResults(data.total);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLanguage, sortBy]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLanguage('');
    setSortBy('relevance');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedLanguage || sortBy !== 'relevance';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">Catálogo</h1>
        <p className="mt-2 text-surface-500">
          Explore nossa coleção de mais de 18.000 títulos
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por título, autor, palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white py-3 pl-12 pr-4 text-sm transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              showFilters
                ? 'border-primary-300 bg-primary-50 text-primary-600'
                : 'border-surface-200 bg-white text-surface-600 hover:bg-surface-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-lg">
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Letter Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-surface-700">Filtrar por letra</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none"
                >
                  <option value="">Todas as letras</option>
                  {letters.filter(l => l !== 'Todos').map((letter) => (
                    <option key={letter} value={letter}>{letter}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="mb-2 block text-sm font-medium text-surface-700">Idioma</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none"
                >
                  {languages.map((lang) => (
                    <option key={lang.slug} value={lang.slug}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="mb-2 block text-sm font-medium text-surface-700">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-4">
                <span className="text-sm text-surface-500">
                  {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Letter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedCategory(letter === 'Todos' ? '' : letter)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                (letter === 'Todos' && selectedCategory === '') || selectedCategory === letter
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* View Mode and Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            {loading ? 'Carregando...' : `${totalResults} livro${totalResults !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-surface-400 hover:bg-surface-100'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-surface-400 hover:bg-surface-100'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-52 w-full rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="py-20 text-center">
          <Search className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-semibold text-surface-700">Nenhum livro encontrado</h3>
          <p className="mt-2 text-surface-500">Tente ajustar seus filtros ou termos de busca</p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Limpar Filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <div key={book.id} className="flex gap-4 rounded-2xl border border-surface-200 bg-white p-4 transition-shadow hover:shadow-lg">
              <img src={book.coverImage} alt={book.title} className="h-32 w-24 shrink-0 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-surface-900 truncate">{book.title}</h3>
                <p className="text-sm text-surface-500">{book.author}</p>
                <p className="mt-2 text-sm text-surface-500 line-clamp-2">{book.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
                  <span>⭐ {book.rating.toFixed(1)}</span>
                  <span>{book.pages} páginas</span>
                  <span>{book.format}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
