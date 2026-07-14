'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, Crown, TrendingUp, Plus, Search, Edit, Trash2,
  Eye, BarChart3, Settings, Bell, LayoutDashboard
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ books: 0, users: 0, subscriptions: 0, revenue: 0 });
  const [books, setBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (session && (session.user as any)?.role !== 'admin') {
      router.push('/');
    }
    fetchStats();
    fetchBooks();
    fetchUsers();
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch {}
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data.books || []);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {}
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'books', label: 'Livros', icon: BookOpen },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'subscriptions', label: 'Assinaturas', icon: Crown },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Painel Administrativo</h1>
        <p className="text-surface-500">Gerencie livros, usuários e assinaturas</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total de Livros', value: stats.books.toLocaleString(), icon: BookOpen, color: 'bg-primary-100 text-primary-600', change: '+12%' },
                  { label: 'Usuários Ativos', value: stats.users.toLocaleString(), icon: Users, color: 'bg-green-100 text-green-600', change: '+8%' },
                  { label: 'Assinaturas', value: stats.subscriptions.toLocaleString(), icon: Crown, color: 'bg-amber-100 text-amber-600', change: '+15%' },
                  { label: 'Receita Mensal', value: `R$ ${(stats.revenue || 45890).toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600', change: '+22%' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-surface-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-xl p-2.5 ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">{stat.change}</span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-surface-900">{stat.value}</p>
                    <p className="text-xs text-surface-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="font-bold text-surface-900 mb-4">Atividade Recente</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Novo livro adicionado', detail: '"A Revolução dos Bichos" foi cadastrado', time: '2h atrás' },
                    { action: 'Nova assinatura', detail: 'maria@email.com assinou o plano Anual', time: '3h atrás' },
                    { action: 'Avaliação recebida', detail: 'Carlos avaliou "Sapiens" com 5 estrelas', time: '5h atrás' },
                    { action: 'Novo usuário', detail: 'pedro@email.com criou uma conta', time: '1 dia atrás' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl p-3 hover:bg-surface-50">
                      <div className="h-2 w-2 rounded-full bg-primary-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-surface-900">{activity.action}</p>
                        <p className="text-xs text-surface-500">{activity.detail}</p>
                      </div>
                      <span className="text-xs text-surface-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold text-surface-900">Gerenciar Livros ({books.length})</h3>
                <button className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white">
                  <Plus className="h-4 w-4" />
                  Adicionar Livro
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Buscar livros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Livro</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Autor</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Avaliação</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Downloads</th>
                      <th className="px-4 py-3 text-right font-medium text-surface-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.slice(0, 10).map((book) => (
                      <tr key={book.id} className="border-b border-surface-100 hover:bg-surface-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={book.coverImage} alt="" className="h-10 w-8 rounded object-cover" />
                            <span className="font-medium text-surface-900 line-clamp-1">{book.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-surface-500">{book.author}</td>
                        <td className="px-4 py-3">
                          <span className="text-amber-500">⭐</span> {book.rating.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-surface-500">{book.downloadCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-primary-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="font-bold text-surface-900 mb-4">Gerenciar Usuários ({users.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Usuário</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Função</th>
                      <th className="px-4 py-3 text-left font-medium text-surface-500">Cadastro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-surface-100 hover:bg-surface-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
                                {user.name?.[0] || '?'}
                              </div>
                            )}
                            <span className="font-medium text-surface-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-surface-500">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-surface-100 text-surface-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-surface-500 text-xs">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="font-bold text-surface-900 mb-4">Assinaturas Ativas</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { plan: 'Mensal', count: 1247, revenue: 'R$ 37.285', color: 'bg-blue-100 text-blue-700' },
                  { plan: 'Anual', count: 892, revenue: 'R$ 213.638', color: 'bg-primary-100 text-primary-700' },
                  { plan: 'Vitalício', count: 156, revenue: 'R$ 77.532', color: 'bg-amber-100 text-amber-700' },
                ].map((sub) => (
                  <div key={sub.plan} className="rounded-xl border border-surface-200 p-5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sub.color}`}>
                      {sub.plan}
                    </span>
                    <p className="mt-3 text-3xl font-bold text-surface-900">{sub.count.toLocaleString()}</p>
                    <p className="text-xs text-surface-500">assinantes ativos</p>
                    <p className="mt-1 text-sm font-medium text-green-600">{sub.revenue}/mês</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="font-bold text-surface-900 mb-4">Analytics</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-50 p-6">
                  <h4 className="text-sm font-medium text-surface-500 mb-2">Livros Mais Baixados</h4>
                  <div className="space-y-3">
                    {books.sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 5).map((book, i) => (
                      <div key={book.id} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-surface-400 w-5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{book.title}</p>
                          <p className="text-xs text-surface-500">{book.downloadCount.toLocaleString()} downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-surface-50 p-6">
                  <h4 className="text-sm font-medium text-surface-500 mb-2">Categorias Populares</h4>
                  <div className="space-y-3">
                    {['Ficção', 'Tecnologia', 'Autoajuda', 'Negócios', 'Ciência'].map((cat, i) => (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-surface-400 w-5">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-surface-900">{cat}</p>
                            <p className="text-xs text-surface-500">{[3200, 2800, 2400, 2100, 1900][i]} livros</p>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-surface-200">
                            <div
                              className="h-full rounded-full gradient-primary"
                              style={{ width: `${[100, 87, 75, 65, 59][i]}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
