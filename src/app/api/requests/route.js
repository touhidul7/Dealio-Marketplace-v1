import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { scanRequestForKeywords } from '@/lib/requestsConstants';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      user_id,
      request_type,
      title,
      description,
      industry,
      location_preference,
      timeline,
      dynamic_fields,
      compliance_accepted,
    } = body;

    // Validate required fields
    if (!user_id || !request_type || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!compliance_accepted) {
      return NextResponse.json({ error: 'Compliance checkbox must be accepted' }, { status: 400 });
    }

    // Scan for prohibited keywords
    const flaggedKeywords = scanRequestForKeywords({
      title,
      description,
      dynamic_fields: dynamic_fields || {},
    });

    // Determine initial status
    const status = flaggedKeywords.length > 0 ? 'flagged' : 'pending_review';

    const payload = {
      user_id,
      request_type,
      title: title.trim(),
      description: description.trim(),
      industry: industry || null,
      location_preference: location_preference || null,
      timeline: timeline || null,
      dynamic_fields: dynamic_fields || {},
      compliance_accepted: true,
      compliance_accepted_at: new Date().toISOString(),
      status,
      flagged_keywords: flaggedKeywords,
    };

    const { data, error } = await supabaseAdmin
      .from('requests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Request insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, flagged: flaggedKeywords.length > 0 });
  } catch (err) {
    console.error('API /requests POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'approved';
    const type = searchParams.get('type');
    const industry = searchParams.get('industry');
    const userId = searchParams.get('user_id');

    let query = supabaseAdmin
      .from('requests')
      .select('*, users!requests_user_id_fkey(full_name, email)')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    // If requesting user's own requests, return all statuses
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('status', status);
    }

    if (type) query = query.eq('request_type', type);
    if (industry) query = query.eq('industry', industry);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('API /requests GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status, admin_notes, verification_level, reviewed_by } = body;

    if (!id) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
    }

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;
    if (verification_level) updatePayload.verification_level = verification_level;
    if (reviewed_by) {
      updatePayload.reviewed_by = reviewed_by;
      updatePayload.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('requests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API /requests PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
