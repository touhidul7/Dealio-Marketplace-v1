import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PACKAGES } from '@/lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { packageId, listingId, userId } = await req.json();

    if (!packageId || !userId) {
      return NextResponse.json({ error: 'Missing packageId or userId' }, { status: 400 });
    }

    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg || pkg.price === null || pkg.price === 0) {
      return NextResponse.json({ error: 'Invalid or free package' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Dealio ${pkg.name} Package`,
              description: `Upgrade your listing to the ${pkg.name} package.`,
            },
            unit_amount: pkg.price * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/seller?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?checkout=cancel`,
      metadata: {
        userId,
        listingId: listingId || 'new',
        packageType: packageId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
