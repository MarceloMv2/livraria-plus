'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Check, Trash2, BookOpen, Crown, Star, Megaphone } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Novos lançamentos da semana',
    message: 'Confira os 15 novos títulos adicionados à biblioteca esta semana, incluindo obras de autores bestsellers.',
    type: 'info',
    read: false,
    link: '/catalogo?new=true',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Sua assinatura foi renovada',
    message: 'Seu plano Anual foi renovado com sucesso. Próxima cobrança em 15/02/2025.',
    type: 'subscription',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Promoção especial: -30% em Tecnologia',
    message: 'Livros de programação e tecnologia com desconto especial por tempo limitado.',
    type: 'promotion',
    read: true,
    link: '/catalogo?category=tecnologia',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Recomendação baseada na sua leitura',
    message: 'Baseado em sua leitura de "Hábitos Atômicos", recomendamos "O Poder do Hábito" de Charles Duhigg.',
    type: 'recommendation',
    read: false,
    link: '/livro/o-poder-do-habito',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Avaliação pendente',
    message: 'Você terminou de ler "O Alquimista". Que tal deixar uma avaliação?',
    type: 'info',
    read: true,
    link: '/livro/o-alquimista',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <Crown className="h-5 w-5 text-amber-500" />;
      case 'recommendation': return <Star className="h-5 w-5 text-purple-500" />;
      case 'promotion': return <Megaphone className="h-5 w-5 text-green-500" />;
      default: return <BookOpen className="h-5 w-5 text-primary-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Agora mesmo';
    if (hours < 24) return `Há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Há ${days} dia${days > 1 ? 's' : ''}`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Notificações</h1>
          <p className="text-surface-500">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo lido'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'unread' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          Não lidas {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto h-12 w-12 text-surface-300" />
            <p className="mt-4 text-surface-500">Nenhuma notificação</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all ${
                notif.read
                  ? 'border-surface-200 bg-white'
                  : 'border-primary-200 bg-primary-50'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {getTypeIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${notif.read ? 'text-surface-700' : 'text-surface-900'}`}>
                    {notif.title}
                    {!notif.read && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary-500" />
                    )}
                  </h3>
                  <span className="text-xs text-surface-400 shrink-0">{formatTime(notif.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-surface-500">{notif.message}</p>
                {notif.link && (
                  <Link
                    href={notif.link}
                    onClick={() => markAsRead(notif.id)}
                    className="mt-2 inline-block text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Ver detalhes →
                  </Link>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-green-600"
                    title="Marcar como lida"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-600"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
