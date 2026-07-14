import { NextResponse } from 'next/server';
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
