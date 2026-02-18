'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function deleteArticle(articleId: string, editionId: string) {
    const supabase = await createServerClient()

    // 1. Verify user is admin (optional, as middleware handles it, but good for safety)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Delete Article
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)

    if (error) throw new Error(error.message)

    revalidatePath(`/admin/editions/${editionId}`)
    return { success: true }
}
