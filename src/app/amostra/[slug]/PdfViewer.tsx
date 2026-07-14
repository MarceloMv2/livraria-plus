'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const MAX_PAGES = 10;

interface Props {
  fileUrl: string;
  title: string;
}

export default function PdfViewer({ fileUrl, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        setTotalPages(pdf.numPages);
        const pagesToShow = Math.min(MAX_PAGES, pdf.numPages);

        for (let i = 1; i <= pagesToShow; i++) {
          if (cancelled) break;

          const page = await pdf.getPage(i);
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg';

          await page.render({ canvasContext: context!, viewport }).promise;

          containerRef.current?.appendChild(canvas);
        }

        if (!cancelled) setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Erro ao carregar PDF');
          setLoading(false);
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [fileUrl]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-3 text-sm text-surface-400">Carregando amostra...</p>
        </div>
      )}

      {error && (
        <div className="py-20 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div ref={containerRef} className="flex flex-col items-center" />

      {!loading && !error && totalPages > MAX_PAGES && (
        <div className="mt-6 rounded-2xl border border-surface-700 bg-surface-900 p-6 text-center">
          <p className="text-sm text-surface-400">
            Amostra com {MAX_PAGES} de {totalPages} páginas.
          </p>
          <p className="mt-1 text-xs text-surface-500">
            Adquira o livro completo para ler todas as páginas.
          </p>
        </div>
      )}
    </div>
  );
}
