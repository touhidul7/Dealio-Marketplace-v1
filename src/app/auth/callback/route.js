import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if this is a password recovery flow via AMR
      const isRecovery = data?.session?.amr?.some(entry => entry.method === 'recovery');
      if (isRecovery || next === '/update-password') {
        return NextResponse.redirect(`${origin}/update-password`);
      }

      // If a specific next page was requested, go there
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Handle OAuth signup: apply roles passed via query param
        const requestedRoles = searchParams.get('roles');
        if (requestedRoles) {
          const rolesArray = requestedRoles.split(',').filter(Boolean);
          if (rolesArray.length > 0) {
            await supabase.from('users').update({
              role: rolesArray[0],
              roles: rolesArray,
            }).eq('id', user.id);
          }
        }

        // Route by primary role
        const { data: profile } = await supabase
          .from('users')
          .select('role, roles')
          .eq('id', user.id)
          .single();

        const roles = (profile?.roles?.length) ? profile.roles : [profile?.role || 'buyer'];

        // Priority routing: admin > advisor > broker > seller/business_owner > buyer
        if (roles.includes('admin')) return NextResponse.redirect(`${origin}/admin`);
        if (roles.includes('advisor')) return NextResponse.redirect(`${origin}/advisor`);
        if (roles.includes('broker')) return NextResponse.redirect(`${origin}/broker`);
        if (roles.includes('seller') || roles.includes('business_owner')) return NextResponse.redirect(`${origin}/seller`);
        return NextResponse.redirect(`${origin}/buyer`);
      }
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
