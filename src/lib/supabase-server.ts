import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerClient = async () => {
  const cookieStore = await cookies()

  // Fallback to dummy values if env vars are missing (prevents crash during UI testing)
  // ONLY active in development. In production, missing keys will fail naturally.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (process.env.NODE_ENV === 'development' ? 'https://placeholder.supabase.co' : '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (process.env.NODE_ENV === 'development' ? 'placeholder_key' : '')

  return createSupabaseServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          }
        },
      },
    }
  )
}