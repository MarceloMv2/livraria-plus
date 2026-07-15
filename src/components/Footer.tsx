import Link from 'next/link';
import { BookOpen, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-surface-900">
                Livraria<span className="text-primary-500">Plus</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-surface-500 leading-relaxed">
              Mais de 18.000 e-books ao alcance da sua mão. Leia, baixe e organize sua biblioteca pessoal.
            </p>
            <div className="mt-4 space-y-2 text-sm text-surface-500">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contato@livrariaplus.com.br
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                São Paulo, SP - Brasil
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Suporte</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/ajuda" className="text-sm text-surface-500 hover:text-primary-600">Central de Ajuda</Link></li>
              <li><Link href="/termos" className="text-sm text-surface-500 hover:text-primary-600">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-sm text-surface-500 hover:text-primary-600">Privacidade</Link></li>
              <li><Link href="/contato" className="text-sm text-surface-500 hover:text-primary-600">Contato</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-surface-100 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-surface-400">
              © 2025 Livraria Plus. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <span className="text-xs text-surface-400">Pagamento seguro via</span>
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span className="rounded bg-surface-100 px-2 py-0.5 font-medium">Cakto</span>
                <span className="rounded bg-surface-100 px-2 py-0.5 font-medium">PIX</span>
                <span className="rounded bg-surface-100 px-2 py-0.5 font-medium">Boleto</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
