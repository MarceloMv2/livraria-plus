'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Sun, Moon, Bookmark, Settings,
  ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Menu, BookOpen, Loader2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const CACHE_NAME = 'livraria-plus-pdfs';

async function cachePdf(url: string): Promise<ArrayBuffer> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(url);
  if (cached) return cached.arrayBuffer();

  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Falha ao baixar PDF');
  cache.put(url, resp.clone());
  return resp.arrayBuffer();
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessReason, setAccessReason] = useState('');
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scale, setScale] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    async function loadBook() {
      try {
        const res = await fetch(`/api/books?slug=${params.slug}`);
        const data = await res.json();
        const b = data.books?.[0];
        setBook(b);

        if (b?.id) {
          const accessRes = await fetch('/api/books/access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: b.id }),
          });
          const accessData = await accessRes.json();
          setHasAccess(accessData.hasAccess);
          setAccessReason(accessData.reason);
        }
      } catch {
        setBook(null);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [params.slug]);

  const renderAllPages = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy) => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = 'w-full max-w-3xl mx-auto mb-4';
      canvas.id = `page-${i}`;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      container.appendChild(canvas);
    }
  }, [scale]);

  useEffect(() => {
    if (!book?.fileUrl || !hasAccess) return;
    let cancelled = false;

    async function loadPdf() {
      setPdfLoading(true);
      setPdfError(null);
      try {
        const data = await cachePdf(book.fileUrl);
        if (cancelled) return;
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        if (cancelled) { pdf.destroy(); return; }
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        await renderAllPages(pdf);
        if (!cancelled) setPdfLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setPdfError(err.message || 'Erro ao carregar PDF');
          setPdfLoading(false);
        }
      }
    }
    loadPdf();
    return () => { cancelled = true; };
  }, [book?.fileUrl, hasAccess, renderAllPages]);

  useEffect(() => {
    if (!pdfRef.current || pdfLoading) return;
    let cancelled = false;
    async function reRender() {
      setPdfLoading(true);
      await renderAllPages(pdfRef.current!);
      if (!cancelled) setPdfLoading(false);
    }
    reRender();
    return () => { cancelled = true; };
  }, [scale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id?.startsWith('page-')) {
              const page = parseInt(id.replace('page-', ''));
              setCurrentPage(page);
              setProgress(Math.round((page / totalPages) * 100));
            }
          }
        }
      },
      { root: null, threshold: 0.5 }
    );

    const canvases = container.querySelectorAll('canvas');
    canvases.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [totalPages, pdfLoading]);

  const scrollToPage = (page: number) => {
    const el = document.getElementById(`page-${page}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(currentPage)
        ? prev.filter((p) => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="mt-4 text-white/60">Carregando leitor...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-surface-300" />
          <p className="mt-4 text-surface-600">Livro não encontrado</p>
          <button onClick={() => router.back()} className="mt-4 text-primary-600 hover:underline">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10">
            <BookOpen className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">{book.title}</h2>
          <p className="mt-2 text-surface-400">Este livro é exclusivo para assinantes.</p>
          <p className="mt-1 text-sm text-surface-500">Assine para ter acesso ilimitado a todo o acervo.</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/precos"
              className="rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-700 transition-colors"
            >
              Ver Planos de Assinatura
            </Link>
            <Link
              href={`/livro/${book.slug}`}
              className="rounded-xl border border-surface-700 px-8 py-3 text-sm font-medium text-surface-400 hover:bg-surface-800 transition-colors"
            >
              Voltar ao livro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen flex-col ${isDarkMode ? 'bg-surface-950 text-white' : 'bg-surface-50 text-surface-900'}`}>
      {/* Top Bar */}
      <div className={`flex items-center justify-between border-b px-4 py-2 shrink-0 ${
        isDarkMode ? 'border-surface-800 bg-surface-900' : 'border-surface-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className={`rounded-lg p-2 ${isDarkMode ? 'hover:bg-surface-800' : 'hover:bg-surface-100'}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold truncate max-w-[300px]">{book.title}</h1>
            <p className="text-xs text-surface-500">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 hidden sm:inline">
            {currentPage}/{totalPages}
          </span>
          <button
            onClick={toggleBookmark}
            className={`rounded-lg p-2 ${
              bookmarks.includes(currentPage)
                ? 'text-amber-500'
                : isDarkMode ? 'text-surface-400 hover:bg-surface-800' : 'text-surface-500 hover:bg-surface-100'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${bookmarks.includes(currentPage) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`rounded-lg p-2 ${isDarkMode ? 'text-surface-400 hover:bg-surface-800' : 'text-surface-500 hover:bg-surface-100'}`}
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`rounded-lg p-2 ${isDarkMode ? 'text-surface-400 hover:bg-surface-800' : 'text-surface-500 hover:bg-surface-100'}`}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`border-b px-4 py-4 shrink-0 ${
          isDarkMode ? 'border-surface-800 bg-surface-900' : 'border-surface-200 bg-white'
        }`}>
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Zoom</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
                  className={`rounded-lg p-1.5 ${isDarkMode ? 'hover:bg-surface-800' : 'hover:bg-surface-100'}`}
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{Math.round(scale * 100)}%</span>
                <button
                  onClick={() => setScale((s) => Math.min(3, s + 0.2))}
                  className={`rounded-lg p-1.5 ${isDarkMode ? 'hover:bg-surface-800' : 'hover:bg-surface-100'}`}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className={`w-64 shrink-0 overflow-y-auto border-r ${
            isDarkMode ? 'border-surface-800 bg-surface-900' : 'border-surface-200 bg-white'
          }`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Navegação</h3>
                <button onClick={() => setShowSidebar(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                {Array.from({ length: Math.min(20, totalPages) }).map((_, i) => {
                  const page = Math.floor((i / Math.min(20, totalPages)) * totalPages) + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => scrollToPage(page)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : isDarkMode
                          ? 'text-surface-400 hover:bg-surface-800'
                          : 'text-surface-600 hover:bg-surface-100'
                      }`}
                    >
                      Página {page}
                    </button>
                  );
                })}
              </div>

              {bookmarks.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">Favoritos</h4>
                  <div className="space-y-1">
                    {bookmarks.map((bm) => (
                      <button
                        key={bm}
                        onClick={() => scrollToPage(bm)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50"
                      >
                        Página {bm}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {pdfLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <p className="mt-3 text-sm text-surface-400">Carregando livro...</p>
              <p className="mt-1 text-xs text-surface-500">O conteúdo será armazenado para leitura offline</p>
            </div>
          )}
          {pdfError && (
            <div className="py-20 text-center">
              <p className="text-sm text-red-400">{pdfError}</p>
            </div>
          )}
          <div ref={containerRef} className="flex flex-col items-center py-4" />
        </div>
      </div>

      {/* Bottom Bar - Progress */}
      <div className={`border-t px-4 py-2 shrink-0 ${
        isDarkMode ? 'border-surface-800 bg-surface-900' : 'border-surface-200 bg-white'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`rounded-lg p-1.5 ${isDarkMode ? 'hover:bg-surface-800' : 'hover:bg-surface-100'}`}
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={1}
              max={totalPages || 1}
              value={currentPage}
              onChange={(e) => scrollToPage(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <span className="text-xs text-surface-500 w-16 text-right">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
