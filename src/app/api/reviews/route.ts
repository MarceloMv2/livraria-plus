import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get('bookId');

  try {
    const where = bookId ? { bookId } : {};
    const reviews = await prisma.review.findMany({
      where,
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { bookId, rating, comment } = await request.json();
    const userId = (session.user as any).id;

    // Check if user already reviewed this book
    const existing = await prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment },
      });
      return NextResponse.json({ review: updated });
    }

    // Create new review
    const review = await prisma.review.create({
      data: { userId, bookId, rating, comment },
    });

    // Update book rating
    const allReviews = await prisma.review.findMany({
      where: { bookId },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.book.update({
      where: { id: bookId },
      data: { rating: avgRating, ratingCount: allReviews.length },
    });

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
