import EditionUploader from './EditionUploader'
import { createServerClient } from '@/lib/supabase-server'

export default async function NewEditionButton() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return null

    return <EditionUploader />
}
