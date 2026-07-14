'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  Menu,
  X,
  BookOpen,
  User,
  LogOut,
  Crown,
  Bell,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-surface-900 hidden sm:block">
              Livraria<span className="text-primary-500">Plus</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar livros, autores, categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
            >
              Início
            </Link>
            <Link
              href="/catalogo"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
            >
              Catálogo
            </Link>
            <Link
              href="/precos"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
            >
              Planos
            </Link>

            {session ? (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/notificacoes"
                  className="relative rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
                >
                  <Bell className="h-5 w-5" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-100"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <span className="hidden lg:block text-sm font-medium text-surface-700 max-w-[120px] truncate">
                      {session.user?.name || 'Usuário'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-surface-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-surface-200 bg-white py-2 shadow-xl">
                      <div className="border-b border-surface-100 px-4 py-2">
                        <p className="text-sm font-medium text-surface-900">{session.user?.name}</p>
                        <p className="text-xs text-surface-500">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/perfil"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        href="/minha-biblioteca"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Minha Biblioteca
                      </Link>
                      {(session.user as any)?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Crown className="h-4 w-4" />
                          Painel Admin
                        </Link>
                      )}
                      <hr className="my-1 border-surface-100" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/auth/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/cadastro"
                  className="rounded-xl gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                >
                  Começar Agora
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-surface-500 md:hidden hover:bg-surface-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-surface-200 bg-white md:hidden">
          <div className="px-4 py-4">
            <form onSubmit={handleSearch} className="mb-4">
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
            </form>
            <div className="space-y-1">
              <Link href="/" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100">
                Início
              </Link>
              <Link href="/catalogo" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100">
                Catálogo
              </Link>
              <Link href="/precos" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100">
                Planos
              </Link>
              {session ? (
                <>
                  <Link href="/perfil" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100">
                    Meu Perfil
                  </Link>
                  <Link href="/minha-biblioteca" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100">
                    Minha Biblioteca
                  </Link>
                  {(session.user as any)?.role === 'admin' && (
                    <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100">
                      Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/auth/login" className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-center text-sm font-medium text-surface-700">
                    Entrar
                  </Link>
                  <Link href="/auth/cadastro" className="flex-1 rounded-xl gradient-primary px-4 py-2.5 text-center text-sm font-semibold text-white">
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
