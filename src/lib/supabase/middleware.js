import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Only call getUser() for protected routes.
  // For public routes, just refresh the session cookie silently.
  // Do NOT query the database here — that causes auth lock conflicts with the browser client.
  const pathname = request.nextUrl.pathname

  // MFA verify page — requires basic auth (aal1) but not full MFA.
  // User must be logged in to verify their 2FA code.
  const isMfaVerify = pathname.startsWith('/auth/mfa-verify')

  const isProtected = pathname.startsWith('/seller') || 
                      pathname.startsWith('/admin') || 
                      pathname.startsWith('/dashboard') ||
                      pathname.startsWith('/advisor') ||
                      pathname.startsWith('/buyer') ||
                      pathname.startsWith('/checkout') ||
                      pathname.startsWith('/settings')

  if (isMfaVerify) {
    // MFA verify page: user must be logged in (aal1), redirect to login if not
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } else if (isProtected) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    // NOTE: Do NOT query the users table here for role checks.
    // Role-based access control is handled client-side via the AuthProvider.
    // Querying DB in middleware causes the "Lock was stolen" error
    // because it competes with the browser's auth token refresh.
  } else {
    // For public routes, just refresh the session if one exists
    await supabase.auth.getUser()
  }

  return supabaseResponse
}
