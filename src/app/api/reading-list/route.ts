import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { bookId, listType } = await request.json();
    const userId = (session.user as any).id;

    // Check if already in list
    const existing = await prisma.readingList.findUnique({
      where: { userId_bookId_listType: { userId, bookId, listType } },
    });

    if (existing) {
      // Remove from list
      await prisma.readingList.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed' });
    }

    // Add to list (and remove from other lists for this book if it's a reading list type)
    if (['reading', 'want_to_read', 'read'].includes(listType)) {
      await prisma.readingList.deleteMany({
        where: { userId, bookId, listType: { in: ['reading', 'want_to_read', 'read'] } },
      });
    }

    const item = await prisma.readingList.create({
      data: { userId, bookId, listType },
    });

    return NextResponse.json({ action: 'added', item });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
