import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  const { bookId } = await request.json();

  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { isFree: true } });
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

  if (book.isFree) {
    return NextResponse.json({ hasAccess: true, reason: 'free' });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ hasAccess: false, reason: 'no_session' });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ hasAccess: false, reason: 'no_user' });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { status: true, currentPeriodEnd: true },
  });

  if (subscription?.status === 'active' && subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date()) {
    return NextResponse.json({ hasAccess: true, reason: 'subscription' });
  }

  return NextResponse.json({ hasAccess: false, reason: 'no_subscription' });
}
