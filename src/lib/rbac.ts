import { createServerClient } from './supabase-server'

export type UserRole = 'admin' | 'user'

export async function getUserRole(userId: string): Promise<UserRole> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    if (error || !data) {
        return 'user'
    }

    return data.role as UserRole
}

export async function isAdmin(userId?: string): Promise<boolean> {
    if (!userId) return false
    const role = await getUserRole(userId)
    return role === 'admin'
}
