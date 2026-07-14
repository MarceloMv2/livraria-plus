import Link from 'next/link';
import { BookOpen, ArrowRight, Star, TrendingUp, Sparkles, Clock, Users, Library, Download, Shield, Smartphone } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import prisma from '@/lib/prisma';

async function getFeaturedBooks() {
  const books = await prisma.book.findMany({
    where: { isFeatured: true },
    take: 6,
    orderBy: { rating: 'desc' },
  });
  return books;
}

async function getBestsellerBooks() {
  const books = await prisma.book.findMany({
    where: { isBestseller: true },
    take: 6,
    orderBy: { downloadCount: 'desc' },
  });
  return books;
}

async function getNewReleaseBooks() {
  const books = await prisma.book.findMany({
    where: { isNewRelease: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });
  return books;
}

async function getStats() {
  const totalBooks = await prisma.book.count();
  const totalUsers = await prisma.user.count();
  const totalDownloads = await prisma.download.count();
  return { totalBooks, totalUsers, totalDownloads };
}

export default async function HomePage() {
  const [featured, bestsellers, newReleases, stats] = await Promise.all([
    getFeaturedBooks(),
    getBestsellerBooks(),
    getNewReleaseBooks(),
    getStats(),
  ]);

  const categories = [
    { name: 'Ficção', icon: '📖', slug: 'ficcao', count: 3200 },
    { name: 'Tecnologia', icon: '💻', slug: 'tecnologia', count: 2800 },
    { name: 'Negócios', icon: '📈', slug: 'negocios', count: 2100 },
    { name: 'Ciência', icon: '🔬', slug: 'ciencia', count: 1900 },
    { name: 'Filosofia', icon: '🤔', slug: 'filosofia', count: 1500 },
    { name: 'Autoajuda', icon: '🌟', slug: 'autoajuda', count: 2400 },
    { name: 'História', icon: '🏛️', slug: 'historia', count: 1800 },
    { name: 'Biografias', icon: '👤', slug: 'biografias', count: 1300 },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMS0ydi0ySDE1djJoMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm mb-6">
                <Sparkles className="h-4 w-4 text-accent-400" />
                +18.000 títulos disponíveis
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Sua próxima
                <br />
                <span className="text-gradient bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text">
                  grande leitura
                </span>
                <br />
                começa aqui.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-white/80 leading-relaxed">
                Acesse uma biblioteca com mais de 18 mil e-books. Leia online, organize sua biblioteca
                e tenha acesso a marcações personalizadas e recomendações inteligentes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/auth/cadastro"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Comece Gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Explorar Catálogo
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-white">18k+</div>
                  <div className="text-sm text-white/60">Livros digitais</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50k+</div>
                  <div className="text-sm text-white/60">Leitores ativos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">4.8</div>
                  <div className="text-sm text-white/60">Avaliação média</div>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:block relative">
              <div className="relative mx-auto w-80">
                <div className="absolute -inset-4 rounded-3xl bg-white/5 backdrop-blur-xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  {featured.slice(0, 4).map((book, i) => (
                    <div
                      key={book.id}
                      className="overflow-hidden rounded-xl shadow-2xl transition-transform"
                      style={{
                        transform: `rotate(${i % 2 === 0 ? '-3' : '3'}deg)`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Lendo / Em Destaque */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-accent-500" />
                <h2 className="text-2xl font-bold text-surface-900">Em Destaque</h2>
              </div>
              <p className="text-surface-500">Os livros mais bem avaliados pela nossa comunidade</p>
            </div>
            <Link
              href="/catalogo?featured=true"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {featured.map((book) => (
              <BookCard key={book.id} book={book as any} />
            ))}
          </div>
        </section>
      )}

      {/* Mais Lidos */}
      {bestsellers.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                  <h2 className="text-2xl font-bold text-surface-900">Mais Lidos</h2>
                </div>
                <p className="text-surface-500">Os bestsellers que todos estão lendo</p>
              </div>
              <Link
                href="/catalogo?bestseller=true"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {bestsellers.map((book) => (
                <BookCard key={book.id} book={book as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Novidades */}
      {newReleases.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-green-500" />
                <h2 className="text-2xl font-bold text-surface-900">Novidades</h2>
              </div>
              <p className="text-surface-500">Os lançamentos mais recentes</p>
            </div>
            <Link
              href="/catalogo?new=true"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {newReleases.map((book) => (
              <BookCard key={book.id} book={book as any} />
            ))}
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-surface-900">Explorar por Categoria</h2>
            <p className="mt-2 text-surface-500">Encontre exatamente o que você procura</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalogo?category=${cat.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-surface-200 p-5 transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow-lg"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-semibold text-surface-900 group-hover:text-primary-600">{cat.name}</h3>
                  <p className="text-xs text-surface-400">+{cat.count} livros</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-surface-900">Por que escolher a Livraria Plus?</h2>
          <p className="mt-3 text-lg text-surface-500">Uma experiência de leitura completa e moderna</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Library,
              title: '18.000+ Títulos',
              desc: 'Acervo vasto com livros de todos os gêneros e categorias.',
              color: 'bg-primary-100 text-primary-600',
            },
            {
              icon: Download,
              title: 'Leitura Offline',
              desc: 'Abra o livro e leia sem conexão com a internet — o conteúdo é carregado automaticamente.',
              color: 'bg-green-100 text-green-600',
            },
            {
              icon: Smartphone,
              title: 'Multiplataforma',
              desc: 'Leia no celular, tablet ou computador. Seu progresso sincroniza.',
              color: 'bg-purple-100 text-purple-600',
            },
            {
              icon: Shield,
              title: 'DRM Seguro',
              desc: 'Seus livros protegidos com tecnologia de segurança avançada.',
              color: 'bg-amber-100 text-amber-600',
            },
            {
              icon: Star,
              title: 'Recomendações IA',
              desc: 'Sugestões personalizadas baseadas no seu histórico de leitura.',
              color: 'bg-accent-100 text-accent-600',
            },
            {
              icon: Users,
              title: 'Comunidade',
              desc: 'Avaliações, resenhas e listas compartilhadas com outros leitores.',
              color: 'bg-red-100 text-red-600',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-surface-200 p-8 transition-all hover:border-primary-200 hover:shadow-xl"
            >
              <div className={`mb-5 inline-flex rounded-xl p-3 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 group-hover:text-primary-600">{feature.title}</h3>
              <p className="mt-2 text-sm text-surface-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Comece a ler hoje mesmo
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Junte-se a milhares de leitores. Planos a partir de R$ 19,90/mês.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/precos"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Ver Planos e Preços
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Explorar Gratuitamente
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
