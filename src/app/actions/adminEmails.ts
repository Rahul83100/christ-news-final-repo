'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function addAdminEmail(email: string) {
    const supabase = await createServerClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can add admin emails')
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists in admin_emails
    const { data: existing } = await supabase
        .from('admin_emails')
        .select('id')
        .eq('email', normalizedEmail)
        .single()

    if (existing) {
        throw new Error('This email is already registered as admin')
    }

    // Insert into admin_emails
    const { error } = await supabase
        .from('admin_emails')
        .insert({ email: normalizedEmail, added_by: user.id })

    if (error) throw new Error(error.message)

    // If someone with this email already has an account, promote them immediately
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', normalizedEmail)
        .single()

    if (existingProfile) {
        await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', existingProfile.id)
    }

    revalidatePath('/users')
    return { success: true }
}

export async function removeAdminEmail(adminEmailId: string) {
    const supabase = await createServerClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    // Safety: ensure at least 1 admin email remains
    const { count } = await supabase
        .from('admin_emails')
        .select('*', { count: 'exact', head: true })

    if (count !== null && count <= 1) {
        throw new Error('Cannot remove the last admin email. At least one must remain.')
    }

    // Get the email before deleting so we can demote the profile
    const { data: adminEmailRow } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('id', adminEmailId)
        .single()

    // Delete from admin_emails
    const { error } = await supabase
        .from('admin_emails')
        .delete()
        .eq('id', adminEmailId)

    if (error) throw new Error(error.message)

    // If that email has an account, demote them back to user
    if (adminEmailRow?.email) {
        await supabase
            .from('profiles')
            .update({ role: 'user' })
            .eq('email', adminEmailRow.email)
    }

    revalidatePath('/users')
    return { success: true }
}
