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

      // Email confirmation (signup) → route by roles array
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role, roles')
          .eq('id', user.id)
          .single();

        const roles = (profile?.roles?.length) ? profile.roles : [profile?.role || 'buyer'];

        // Priority routing
        if (roles.includes('admin')) return NextResponse.redirect(`${origin}/admin`);
        if (roles.includes('advisor')) return NextResponse.redirect(`${origin}/advisor`);
        if (roles.includes('broker')) return NextResponse.redirect(`${origin}/broker`);
        if (roles.includes('seller') || roles.includes('business_owner')) return NextResponse.redirect(`${origin}/seller`);
        return NextResponse.redirect(`${origin}/buyer`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
