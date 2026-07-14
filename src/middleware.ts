import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/perfil', '/minha-biblioteca', '/notificacoes', '/admin'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const sessionCookie = SESSION_COOKIES.find((name) => request.cookies.get(name));

    if (!sessionCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/perfil/:path*', '/minha-biblioteca/:path*', '/notificacoes/:path*', '/admin/:path*'],
};
