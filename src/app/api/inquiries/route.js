import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    // 1. Insert into Supabase
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    // 2. Sync to GoHighLevel (if configured)
    const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
    if (ghlWebhookUrl) {
      try {
        await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: body.anonymous_name?.split(' ')[0] || '',
            last_name: body.anonymous_name?.split(' ').slice(1).join(' ') || '',
            email: body.anonymous_email,
            phone: body.anonymous_phone,
            customData: {
              source: 'dealio_marketplace',
              listing_id: body.listing_id,
              message: body.message,
              wants_support: body.wants_acquisition_support,
              needs_financing: body.needs_financing
            }
          })
        });
      } catch (ghlErr) {
        console.error('Failed to sync to GHL:', ghlErr);
        // Don't fail the request if GHL sync fails
      }
    }

    return NextResponse.json({ success: true, inquiry });
  } catch (err) {
    console.error('Inquiry Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
