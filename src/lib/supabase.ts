import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Hardcoded credentials to ensure connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseKey)
}