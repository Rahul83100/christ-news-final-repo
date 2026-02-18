import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
// @ts-ignore ts server cache issue
import AdminManagement from '@/components/admin/AdminManagement'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/sign-in')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    // Fetch only admin users
    const { data: admins } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

    // Fetch pre-registered admin emails
    const { data: adminEmails } = await supabase
        .from('admin_emails')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-cream-300 flex-grow" />
                    <h2 className="font-display text-4xl font-black text-forest-950 uppercase tracking-[0.2em]">Admin Management</h2>
                    <div className="h-px bg-cream-300 flex-grow" />
                </div>

                <AdminManagement
                    admins={admins || []}
                    adminEmails={adminEmails || []}
                    currentUserId={user.id}
                />
            </div>
        </div>
    )
}
