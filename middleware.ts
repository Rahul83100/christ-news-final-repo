import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip auth if keys missing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: Supabase keys are missing in production environment.')
    }
    console.warn('Supabase keys missing in middleware, skipping auth check.')
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  let user = null

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Middleware: Supabase auth check failed:', error)
    // Auth failed: Block access
  }

  // RBAC for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Exclude /admin/login from protection
    if (request.nextUrl.pathname !== '/admin/login') {
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Check role
      let profile = null
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        profile = data
      } catch (error) {
        console.error('Middleware: Profile fetch failed:', error)
      }

      if (!profile || profile.role !== 'admin') {
        console.error('Middleware: Admin access denied for user:', user.id)
        // Not an admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url))
      }
    } else if (user) {
      // Already logged in as admin, redirect from login page to dashboard
      // Just check role again to be safe
      let isAdmin = false
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (data?.role === 'admin') isAdmin = true
      } catch { }

      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}