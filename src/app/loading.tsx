import { BookOpen } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white animate-pulse-soft">
          <BookOpen className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm text-surface-500">Carregando...</p>
      </div>
    </div>
  );
}
