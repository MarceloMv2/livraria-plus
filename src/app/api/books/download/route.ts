import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { bookId } = await request.json();
    const userId = (session.user as any).id;

    // Check if user has active subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Assinatura ativa necessária para download' },
        { status: 403 }
      );
    }

    // Check download limits for monthly plan
    if (subscription.plan === 'monthly') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const downloadsThisMonth = await prisma.download.count({
        where: {
          userId,
          downloadedAt: { gte: startOfMonth },
        },
      });

      if (downloadsThisMonth >= 5) {
        return NextResponse.json(
          { error: 'Limite de downloads mensais atingido. Faça upgrade para o plano Anual.' },
          { status: 403 }
        );
      }
    }

    // Record download
    await prisma.download.create({
      data: { userId, bookId },
    });

    // Increment book download count
    await prisma.book.update({
      where: { id: bookId },
      data: { downloadCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
