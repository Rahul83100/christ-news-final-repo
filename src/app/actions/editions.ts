'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function deleteEdition(editionId: string) {
    const supabase = await createServerClient()

    // 1. Verify user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    // 2. Delete Edition (Cascade should handle articles if configured, but let's be safe)
    // Assuming DB has ON DELETE CASCADE, otherwise we delete articles first
    const { error: articlesError } = await supabase
        .from('articles')
        .delete()
        .eq('edition_id', editionId)

    if (articlesError) throw new Error("Failed to delete articles: " + articlesError.message)

    const { error } = await supabase
        .from('editions')
        .delete()
        .eq('id', editionId)

    if (error) throw new Error(error.message)

    revalidatePath('/')
    return { success: true }
}
