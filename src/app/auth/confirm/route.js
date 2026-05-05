import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    
    if (!error) {
      // Password recovery → go to update password form
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`);
      }

      // Email confirmation (signup) → route by role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile?.role === 'seller') return NextResponse.redirect(`${origin}/seller`);
        if (profile?.role === 'admin') return NextResponse.redirect(`${origin}/admin`);
        if (profile?.role === 'advisor') return NextResponse.redirect(`${origin}/advisor`);
        if (profile?.role === 'broker') return NextResponse.redirect(`${origin}/broker`);
        return NextResponse.redirect(`${origin}/buyer`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
