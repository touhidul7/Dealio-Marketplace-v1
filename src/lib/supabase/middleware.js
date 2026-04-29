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

  // Only protect specific paths
  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith('/seller') || 
                      pathname.startsWith('/admin') || 
                      pathname.startsWith('/dashboard') ||
                      pathname.startsWith('/advisor')

  if (isProtected) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Role-based access control
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/' // Redirect non-admins to home
        return NextResponse.redirect(url)
      }
    }
  } else {
    // For public routes, we just refresh the session if it exists
    await supabase.auth.getSession()
  }

  return supabaseResponse
}
