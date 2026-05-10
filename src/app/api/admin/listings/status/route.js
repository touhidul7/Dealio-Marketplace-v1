import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendKey);

export async function POST(req) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    // 1. Get the current listing to see its old status
    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from('listings')
      .select('id, title, status, owner_user_id, users!owner_user_id(email, full_name)')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    // 2. Update the status in the database
    const { error: updateErr } = await supabaseAdmin
      .from('listings')
      .update({ status })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // 3. Send email if it transitioned to 'active'
    if (listing.status !== 'active' && status === 'active' && listing.users?.email && resendKey) {
      await resend.emails.send({
        from: 'Dealio Marketplace <notifications@brittosoft.site>',
        to: listing.users.email,
        subject: 'Your Dealio Listing is Now Live! 🎉',
        html: `
          <h2>Your listing has been approved!</h2>
          <p>Hi ${listing.users.full_name || 'there'},</p>
          <p>Great news! Your listing for <strong>${listing.title}</strong> has been reviewed and approved by our team.</p>
          <p>It is now live on the Dealio Marketplace and visible to potential buyers.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/listings/${listing.id}" style="padding: 10px 16px; background: #0F52BA; color: white; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 12px;">View Your Live Listing</a></p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Status update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
