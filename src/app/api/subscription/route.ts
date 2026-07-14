import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ subscription: null });
    }

    const userId = (session.user as any).id;
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json({ subscription: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { plan } = await request.json();
    const userId = (session.user as any).id;

    // Check if user already has subscription
    const existing = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing) {
      // Update existing subscription
      const updated = await prisma.subscription.update({
        where: { userId },
        data: {
          plan,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            plan === 'monthly'
              ? Date.now() + 30 * 24 * 60 * 60 * 1000
              : plan === 'annual'
              ? Date.now() + 365 * 24 * 60 * 60 * 1000
              : Date.now() + 36500 * 24 * 60 * 60 * 1000
          ),
        },
      });
      return NextResponse.json({ subscription: updated });
    }

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          plan === 'monthly'
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : plan === 'annual'
            ? Date.now() + 365 * 24 * 60 * 60 * 1000
            : Date.now() + 36500 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
