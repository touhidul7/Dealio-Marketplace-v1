import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Intercept auth codes landing on the root page (Supabase recovery/confirmation redirects)
  // and forward them to /auth/callback for proper handling
  const pathname = request.nextUrl.pathname
  const code = request.nextUrl.searchParams.get('code')
  if (pathname === '/' && code) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
