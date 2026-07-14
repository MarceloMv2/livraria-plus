'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Heart, CheckCircle, Filter, Grid3X3, List } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import type { Book } from '@/lib/types';

interface ReadingItem {
  book: Book;
  progress: number;
  lastReadAt: string;
  listType: string;
}

export default function MyLibraryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('reading');
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchLibrary();
  }, [session]);

  const fetchLibrary = async () => {
    try {
      const res = await fetch('/api/user/library');
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // Use mock data
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'reading', label: 'Lendo Agora', icon: BookOpen },
    { id: 'want_to_read', label: 'Quero Ler', icon: Clock },
    { id: 'read', label: 'Lidos', icon: CheckCircle },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ];

  // Mock data for demo
  const mockBooks: ReadingItem[] = [
    {
      book: {
        id: '1', title: 'O Poder do Hábito', slug: 'o-poder-do-habito', author: 'Charles Duhigg',
        authorSlug: 'charles-duhigg', description: 'Um livro sobre hábitos.',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
        language: 'pt-BR', format: 'EPUB', rating: 4.5, ratingCount: 2847,
        downloadCount: 15420, isFeatured: true, isNewRelease: false, isBestseller: true,
        categories: 'nao-ficcao', createdAt: new Date(), updatedAt: new Date(),
      },
      progress: 65, lastReadAt: new Date(Date.now() - 3600000).toISOString(), listType: 'reading',
    },
    {
      book: {
        id: '2', title: 'Sapiens', slug: 'sapiens', author: 'Yuval Noah Harari',
        authorSlug: 'yuval-noah-harari', description: 'Uma breve história da humanidade.',
        coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
        language: 'pt-BR', format: 'EPUB', rating: 4.8, ratingCount: 8934,
        downloadCount: 45200, isFeatured: true, isNewRelease: false, isBestseller: true,
        categories: 'historia', createdAt: new Date(), updatedAt: new Date(),
      },
      progress: 32, lastReadAt: new Date(Date.now() - 86400000).toISOString(), listType: 'reading',
    },
    {
      book: {
        id: '3', title: 'Hábitos Atômicos', slug: 'habitos-atomicos', author: 'James Clear',
        authorSlug: 'james-clear', description: 'Construindo bons hábitos.',
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
        language: 'pt-BR', format: 'EPUB', rating: 4.7, ratingCount: 11234,
        downloadCount: 52300, isFeatured: true, isNewRelease: false, isBestseller: true,
        categories: 'autoajuda', createdAt: new Date(), updatedAt: new Date(),
      },
      progress: 100, lastReadAt: new Date(Date.now() - 604800000).toISOString(), listType: 'read',
    },
    {
      book: {
        id: '4', title: 'Clean Code', slug: 'clean-code', author: 'Robert C. Martin',
        authorSlug: 'robert-c-martin', description: 'Código limpo.',
        coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aadc?w=400&h=600&fit=crop',
        language: 'en', format: 'PDF', rating: 4.6, ratingCount: 3421,
        downloadCount: 28900, isFeatured: false, isNewRelease: false, isBestseller: true,
        categories: 'tecnologia', createdAt: new Date(), updatedAt: new Date(),
      },
      progress: 0, lastReadAt: new Date().toISOString(), listType: 'want_to_read',
    },
    {
      book: {
        id: '5', title: 'O Alquimista', slug: 'o-alquimista', author: 'Paulo Coelho',
        authorSlug: 'paulo-coelho', description: 'Uma jornada de autoconhecimento.',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
        language: 'pt-BR', format: 'EPUB', rating: 4.2, ratingCount: 12450,
        downloadCount: 56700, isFeatured: true, isNewRelease: false, isBestseller: true,
        categories: 'ficcao', createdAt: new Date(), updatedAt: new Date(),
      },
      progress: 0, lastReadAt: new Date().toISOString(), listType: 'favorite',
    },
  ];

  const displayItems = items.length > 0 ? items : mockBooks;
  const filteredItems = displayItems.filter((item) => {
    if (activeTab === 'favorites') return item.listType === 'favorite';
    return item.listType === activeTab;
  });

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Agora';
    if (hours < 24) return `Há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Há ${days}d`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Minha Biblioteca</h1>
        <p className="text-surface-500">Organize e acompanhe sua leitura</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-52 w-full rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-semibold text-surface-700">
            {activeTab === 'reading' && 'Nenhum livro em leitura'}
            {activeTab === 'want_to_read' && 'Nenhum livro na fila'}
            {activeTab === 'read' && 'Nenhum livro lido ainda'}
            {activeTab === 'favorites' && 'Nenhum favorito'}
          </h3>
          <p className="mt-2 text-surface-500">
            {activeTab === 'reading' && 'Comece a ler um livro do catálogo'}
            {activeTab === 'want_to_read' && 'Adicione livros que você quer ler'}
            {activeTab === 'read' && 'Complete sua primeira leitura'}
            {activeTab === 'favorites' && 'Favorite seus livros preferidos'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'reading' ? (
            filteredItems.map((item) => (
              <div key={item.book.id} className="flex gap-4 rounded-2xl border border-surface-200 bg-white p-4 transition-shadow hover:shadow-lg">
                <img src={item.book.coverImage} alt={item.book.title} className="h-28 w-20 shrink-0 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 truncate">{item.book.title}</h3>
                  <p className="text-sm text-surface-500">{item.book.author}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-surface-500">{Math.round(item.progress)}% lido</span>
                      <span className="text-xs text-surface-400">Última leitura: {formatTime(item.lastReadAt)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-100">
                      <div
                        className="h-full rounded-full gradient-primary transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {filteredItems.map((item) => (
                <BookCard key={item.book.id} book={item.book} showProgress={item.progress > 0} progress={item.progress} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
