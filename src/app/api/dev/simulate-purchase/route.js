import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEV_TOOLS) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  try {
    const { packageId, userId, listingId } = await req.json();
    const supabase = createAdminClient();

    console.log('[Dev Tool] Simulating purchase for:', { userId, packageId, listingId });

    // 1. Insert purchase record
    const { data: purchase, error: pError } = await supabase.from('package_purchases').insert({
      user_id: userId,
      listing_id: (listingId && listingId !== 'new') ? listingId : null,
      product_type: 'seller_package',
      product_name: packageId,
      amount: packageId === 'pro' ? 149 : 399,
      currency: 'cad',
      payment_status: 'completed',
      stripe_checkout_session_id: 'sim_' + Math.random().toString(36).substring(7),
    }).select().single();

    if (pError) throw pError;

    // 2. Update user account
    await supabase.from('users').update({ 
      package_type: packageId,
      package_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }).eq('id', userId);

    // 3. Update listing if applicable
    if (listingId && listingId !== 'new') {
      await supabase.from('listings').update({ package_type: packageId }).eq('id', listingId);
    }

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('[Dev Tool] Simulation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
