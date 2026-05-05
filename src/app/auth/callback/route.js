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
      // Check if this is a password recovery flow via AMR (Authentication Methods Reference)
      const isRecovery = data?.session?.amr?.some(entry => entry.method === 'recovery');
      if (isRecovery || next === '/update-password') {
        return NextResponse.redirect(`${origin}/update-password`);
      }

      // If a specific next page was requested, go there
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Otherwise route by role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile?.role === 'seller') return NextResponse.redirect(`${origin}/seller`);
        if (profile?.role === 'admin') return NextResponse.redirect(`${origin}/admin`);
        if (profile?.role === 'advisor') return NextResponse.redirect(`${origin}/advisor`);
        if (profile?.role === 'broker') return NextResponse.redirect(`${origin}/broker`);
        return NextResponse.redirect(`${origin}/buyer`);
      }
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
