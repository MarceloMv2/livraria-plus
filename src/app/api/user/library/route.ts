import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ items: [] });
    }

    const userId = (session.user as any).id;

    const [readingProgress, readingLists, favorites] = await Promise.all([
      prisma.readingProgress.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { lastReadAt: 'desc' },
      }),
      prisma.readingList.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const items = [
      ...readingProgress.map((rp) => ({
        book: rp.book,
        progress: rp.progress,
        lastReadAt: rp.lastReadAt.toISOString(),
        listType: 'reading',
      })),
      ...readingLists.map((rl) => ({
        book: rl.book,
        progress: 0,
        lastReadAt: rl.createdAt.toISOString(),
        listType: rl.listType,
      })),
      ...favorites.map((f) => ({
        book: f.book,
        progress: 0,
        lastReadAt: f.createdAt.toISOString(),
        listType: 'favorite',
      })),
    ];

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ items: [] });
  }
}
