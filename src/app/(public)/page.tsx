import HomePage from '@/components/HomePage'
import { createServerClient } from '@/lib/supabase-server'

export default async function Page() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      isAdmin = profile.role === 'admin'
    }
  }

  return (
    <HomePage
      isAdmin={isAdmin}
    />
  )
}