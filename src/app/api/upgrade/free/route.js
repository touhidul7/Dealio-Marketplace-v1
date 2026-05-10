import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PACKAGES } from '@/lib/constants';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { packageId, userId } = await req.json();

    if (!packageId || !userId) {
      return NextResponse.json({ error: 'Missing packageId or userId' }, { status: 400 });
    }

    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg || pkg.price > 0) {
      return NextResponse.json({ error: 'Package is not free' }, { status: 400 });
    }

    // Set expiry to Jan 1 2027 as promised
    const expiry = new Date('2027-01-01T00:00:00Z').toISOString();

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        package_type: packageId,
        package_expiry: expiry
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, url: '/seller?checkout=success' });
  } catch (error) {
    console.error('Free upgrade error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
