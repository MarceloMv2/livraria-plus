import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const language = searchParams.get('language') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const slug = searchParams.get('slug') || '';
  const limit = parseInt(searchParams.get('limit') || '60');
  const page = parseInt(searchParams.get('page') || '1');
  const skip = (page - 1) * limit;

  try {
    const where: any = {};

    if (slug) {
      where.slug = slug;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { author: { contains: query } },
        { description: { contains: query } },
        { tags: { contains: query } },
      ];
    }

    if (category) {
      // Support letter filtering (A-Z) or category filtering
      if (category === '0-9') {
        where.title = { startsWith: /[0-9]/.source };
      } else if (category.length === 1) {
        where.title = { startsWith: category };
      } else {
        where.categories = { contains: category };
      }
    }

    if (language) {
      where.language = language;
    }

    let orderBy: any = {};
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'downloads':
        orderBy = { downloadCount: 'desc' };
        break;
      case 'alpha':
        orderBy = { title: 'asc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      books,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
