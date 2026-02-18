import { createServerClient } from '@/lib/supabase-server'
import AdminUserList from '@/components/admin/UserList'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const supabase = await createServerClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/sign-in')

    // Fetch All Users (Profiles)
    const { data: potentialUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                Failed to load users: {error.message}
            </div>
        )
    }

    // Since we don't have a strict TypeScript type for Profile in this file scope yet, 
    // casting or trusting the response. AdminUserList expects typed props.
    // The profile interface in UserList.tsx matches what we expect from DB.

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">User Management</h1>
                <p className="text-christ-blue/60 font-medium mt-1">Manage administrators and users.</p>
            </div>

            <AdminUserList users={potentialUsers as any[]} currentUserId={user.id} />
        </div>
    )
}
