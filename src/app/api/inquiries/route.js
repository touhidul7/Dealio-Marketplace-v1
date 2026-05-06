import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const payloadForDb = { ...body };
    delete payloadForDb.dealio_id; // Not a DB column
    delete payloadForDb.ghl_source; // Not a DB column

    // 1. Insert into Supabase
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert(payloadForDb)
      .select()
      .single();

    if (error) throw error;

    // 2. Sync to GoHighLevel
    if (process.env.GHL_API_KEY) {
      try {
        const { createGHLContact } = require('@/lib/ghl');
        
        const firstName = body.anonymous_name?.split(' ')[0] || '';
        const lastName = body.anonymous_name?.split(' ').slice(1).join(' ') || '';

        // Define tags based on source
        const isOtherOpps = body.ghl_source === 'other_opportunities';
        let contactTags = body.source_type === 'contact_form' ? ['contact-form'] : ['inquiry', 'buyer'];
        if (isOtherOpps) contactTags.push('other-opportunities');
        if (body.dealio_id) {
          contactTags.push(body.dealio_id);
        }

        // Determine GHL source label
        let ghlSource = 'Dealio Inquiry';
        if (body.source_type === 'contact_form') ghlSource = 'Dealio Contact Form';
        else if (isOtherOpps) ghlSource = 'Other Opportunities';

        await createGHLContact({
          firstName,
          lastName,
          email: body.anonymous_email,
          phone: body.anonymous_phone,
          source: ghlSource,
          tags: contactTags,
          customData: {
            'Listing ID': body.listing_id,
            'Dealio ID': body.dealio_id || 'N/A',
            'Message': body.message,
            'Wants Acquisition Support': body.wants_acquisition_support ? 'Yes' : 'No',
            'Needs Financing': body.needs_financing ? 'Yes' : 'No'
          }
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
