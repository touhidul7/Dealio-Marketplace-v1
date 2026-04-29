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
    const listingId = session.metadata.listingId || null;
    const packageType = session.metadata.packageType;
    const amount = (session.amount_total || 0) / 100;

    console.log('[Webhook] Processing completion for:', { userId, listingId, packageType, amount });

    // Insert purchase record
    const { data: purchaseData, error: purchaseError } = await supabase.from('package_purchases').insert({
      user_id: userId,
      listing_id: (listingId && listingId !== 'new') ? listingId : null,
      product_type: 'seller_package',
      product_name: packageType,
      amount: amount,
      currency: 'cad',
      payment_status: 'completed',
      stripe_checkout_session_id: session.id,
    }).select();

    if (purchaseError) {
      console.error('[Webhook] Error inserting purchase record:', purchaseError);
    } else {
      console.log('[Webhook] Purchase record inserted successfully:', purchaseData);
    }

    // Update the user's account-level package
    console.log('[Webhook] Updating user package tier:', userId, packageType);
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        package_type: packageType,
        package_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', userId);

    if (userError) {
      console.error('[Webhook] Error updating user package (Check if package_type column exists!):', userError);
    }

    // If a listing ID was provided, upgrade its package specifically
    if (listingId && listingId !== 'new') {
      console.log('[Webhook] Upgrading specific listing:', listingId);
      const { error: listingError } = await supabase
        .from('listings')
        .update({ package_type: packageType })
        .eq('id', listingId);
        
      if (listingError) {
        console.error('[Webhook] Error updating listing package:', listingError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
