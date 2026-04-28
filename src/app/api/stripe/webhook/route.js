import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const userId = session.metadata.userId;
    const listingId = session.metadata.listingId;
    const packageType = session.metadata.packageType;
    const amount = session.amount_total / 100;

    console.log(`Payment successful for user ${userId}, package ${packageType}, listing ${listingId}`);

    // Insert purchase record
    const { error: purchaseError } = await supabase.from('purchases').insert({
      user_id: userId,
      listing_id: listingId !== 'new' ? listingId : null,
      package_type: packageType,
      amount: amount,
      status: 'completed',
      stripe_session_id: session.id,
    });

    if (purchaseError) {
      console.error('Error inserting purchase:', purchaseError);
    }

    // If a listing ID was provided, upgrade its package
    if (listingId && listingId !== 'new') {
      const { error: listingError } = await supabase
        .from('listings')
        .update({ package_type: packageType })
        .eq('id', listingId);
        
      if (listingError) {
        console.error('Error updating listing package:', listingError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
