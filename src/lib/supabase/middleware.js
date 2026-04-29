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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/dashboard', '/seller', '/buyer', '/admin', '/advisor']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Role-based routing protection
  if (user) {
    const pathname = request.nextUrl.pathname;
    
    // Get role from user metadata or fallback
    let role = user.user_metadata?.role || 'buyer';
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/seller') && role !== 'seller' && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/buyer') && role !== 'buyer' && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/advisor') && role !== 'advisor' && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return supabaseResponse
}
