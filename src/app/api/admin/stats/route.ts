import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [books, users, subscriptions] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
    ]);

    return NextResponse.json({
      books,
      users,
      subscriptions,
      revenue: 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
