import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

const CAKTO_SECRET = process.env.CAKTO_WEBHOOK_SECRET;

interface CaktoCustomer {
  name: string;
  email: string;
  phone?: string;
  docNumber?: string;
}

interface CaktoProduct {
  id: string;
  name: string;
  price: number;
  type: 'unique' | 'subscription';
}

interface CaktoOffer {
  id: string;
  name: string;
  price: number;
}

interface CaktoData {
  id: string;
  refId?: string;
  customer: CaktoCustomer;
  product: CaktoProduct;
  offer: CaktoOffer;
  offer_type?: string;
  subscription_id?: string;
  next_charge_at?: string;
}

interface CaktoWebhookBody {
  secret: string;
  event: string;
  data: CaktoData;
}

function getPlanFromPrice(price: number): string {
  if (price >= 300) return 'lifetime';
  if (price >= 200) return 'annual';
  return 'monthly';
}

function getPeriodEnd(plan: string): Date {
  const now = new Date();
  if (plan === 'monthly') {
    now.setMonth(now.getMonth() + 1);
  } else if (plan === 'annual') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setFullYear(now.getFullYear() + 100);
  }
  return now;
}

export async function POST(request: NextRequest) {
  try {
    const body: CaktoWebhookBody = await request.json();

    if (CAKTO_SECRET && body.secret !== CAKTO_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const { event, data } = body;

    if (!data?.customer?.email) {
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    const email = data.customer.email.toLowerCase().trim();
    const plan = getPlanFromPrice(data.offer?.price || data.product?.price || 0);

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const tempPassword = await hash(Math.random().toString(36).slice(-12), 10);
      user = await prisma.user.create({
        data: {
          email,
          name: data.customer.name || email.split('@')[0],
          password: tempPassword,
        },
      });
    }

    switch (event) {
      case 'purchase_approved':
      case 'subscription_created':
      case 'subscription_renewed': {
        const periodEnd = getPeriodEnd(plan);
        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            plan,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
          },
          update: {
            plan,
            status: 'active',
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
        });
        break;
      }

      case 'subscription_canceled':
      case 'subscription_renewal_refused': {
        await prisma.subscription.updateMany({
          where: { userId: user.id },
          data: { status: 'canceled' },
        });
        break;
      }

      case 'refund':
      case 'chargeback': {
        await prisma.subscription.updateMany({
          where: { userId: user.id, status: 'active' },
          data: { status: 'canceled' },
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
