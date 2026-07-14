'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Lock, Bell, BookOpen, Star, Clock, TrendingUp,
  Crown, Settings, Camera, Save, AlertCircle, Check
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'reading', label: 'Leitura', icon: BookOpen },
    { id: 'subscription', label: 'Assinatura', icon: Crown },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Lock },
  ];

  const readingStats = {
    booksRead: 12,
    pagesRead: 3456,
    minutesRead: 8640,
    currentStreak: 7,
    longestStreak: 21,
    weeklyGoal: 5,
    weeklyProgress: 3,
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await update({ name });
      setSuccess('Perfil atualizado com sucesso!');
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-6">
        <div className="relative">
          {session.user?.image ? (
            <img src={session.user.image} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 text-2xl font-bold text-primary-600">
              {session.user?.name?.[0] || '?'}
            </div>
          )}
          <button className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 shadow-md hover:bg-surface-50">
            <Camera className="h-4 w-4 text-surface-600" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{session.user?.name || 'Usuário'}</h1>
          <p className="text-surface-500">{session.user?.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
              {(session.user as any)?.role === 'admin' ? 'Administrador' : 'Assinante Anual'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Tabs */}
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
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-6">Informações do Perfil</h2>
              {success && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  {success}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-surface-200 bg-surface-100 px-4 py-3 text-sm text-surface-500"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reading' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h2 className="text-lg font-bold text-surface-900 mb-6">Estatísticas de Leitura</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Livros Lidos', value: readingStats.booksRead, icon: BookOpen, color: 'text-primary-600 bg-primary-100' },
                    { label: 'Páginas Lidas', value: readingStats.pagesRead.toLocaleString(), icon: TrendingUp, color: 'text-green-600 bg-green-100' },
                    { label: 'Horas Lidas', value: Math.round(readingStats.minutesRead / 60), icon: Clock, color: 'text-amber-600 bg-amber-100' },
                    { label: 'Sequência Atual', value: `${readingStats.currentStreak} dias`, icon: Star, color: 'text-purple-600 bg-purple-100' },
                    { label: 'Melhor Sequência', value: `${readingStats.longestStreak} dias`, icon: Crown, color: 'text-accent-600 bg-accent-100' },
                    { label: 'Meta Semanal', value: `${readingStats.weeklyProgress}/${readingStats.weeklyGoal}`, icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-surface-50 p-4">
                      <div className={`mb-2 inline-flex rounded-lg p-2 ${stat.color}`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                      <p className="text-xs text-surface-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6">
                <h3 className="font-bold text-surface-900 mb-4">Progresso Semanal</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-surface-100">
                      <div
                        className="h-full rounded-full gradient-primary transition-all"
                        style={{ width: `${(readingStats.weeklyProgress / readingStats.weeklyGoal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-surface-700">
                    {readingStats.weeklyProgress}/{readingStats.weeklyGoal} livros
                  </span>
                </div>
                <p className="mt-2 text-xs text-surface-500">Meta: ler 5 livros por semana</p>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-6">Sua Assinatura</h2>
              <div className="rounded-xl bg-primary-50 border border-primary-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary-600" />
                      <span className="font-bold text-surface-900">Plano Anual</span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Ativo</span>
                    </div>
                    <p className="mt-1 text-sm text-surface-500">R$ 14,90/mês • Próxima cobrança: 15/02/2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-surface-900">R$ 178,80</p>
                    <p className="text-xs text-surface-500">por ano</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link href="/precos" className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
                    Upgrade de Plano
                  </Link>
                  <button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    Cancelar Assinatura
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-6">Notificações</h2>
              <div className="space-y-3">
                {[
                  { title: 'Novos lançamentos da semana', desc: 'Confira os 15 novos títulos adicionados', time: '2 horas atrás', read: false },
                  { title: 'Sua assinatura foi renovada', desc: 'Plano Anual renovado com sucesso', time: '1 dia atrás', read: true },
                  { title: 'Promoção especial', desc: 'Livros de tecnologia com 30% de desconto', time: '3 dias atrás', read: true },
                ].map((notif, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-xl p-4 ${notif.read ? 'bg-surface-50' : 'bg-primary-50 border border-primary-100'}`}>
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${notif.read ? 'bg-surface-300' : 'bg-primary-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-900">{notif.title}</p>
                      <p className="text-xs text-surface-500">{notif.desc}</p>
                    </div>
                    <span className="text-xs text-surface-400 shrink-0">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-6">Segurança</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Senha Atual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg">
                  <Lock className="h-4 w-4" />
                  Alterar Senha
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
