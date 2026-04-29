import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    
    // 1. Check if we already processed this purchase (to avoid duplicates)
    const { data: existing } = await supabase
      .from('package_purchases')
      .select('id')
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, already_processed: true });
    }

    // 2. Fetch the session from Stripe to verify it
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session not paid', status: session.payment_status }, { status: 400 });
    }

    const userId = session.metadata.userId;
    const listingId = session.metadata.listingId;
    const packageType = session.metadata.packageType;
    const amount = session.amount_total / 100;

    console.log('[Verify] Manual verification success for session:', sessionId);

    // 3. Insert purchase record
    const { error: pError } = await supabase.from('package_purchases').insert({
      user_id: userId,
      listing_id: (listingId && listingId !== 'new') ? listingId : null,
      product_type: 'seller_package',
      product_name: packageType,
      amount: amount,
      currency: 'cad',
      payment_status: 'completed',
      stripe_checkout_session_id: session.id,
    });

    if (pError) throw pError;

    // 4. Update user account
    await supabase.from('users').update({ 
      package_type: packageType,
      package_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }).eq('id', userId);

    // 5. Update listing if applicable
    if (listingId && listingId !== 'new') {
      await supabase.from('listings').update({ package_type: packageType }).eq('id', listingId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Verify] Manual verification failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
