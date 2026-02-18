import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore = await cookies()
        // Using environment variables directly here as it's server-side
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        const supabase = createServerClient(url, key, {
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
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        })

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Auto-subscribe user on sign-in
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ is_subscribed: true })
                    .eq('id', user.id)

                // Check if this email was pre-registered as admin
                if (user.email) {
                    const { data: adminEmail } = await supabase
                        .from('admin_emails')
                        .select('id')
                        .eq('email', user.email.toLowerCase().trim())
                        .single()

                    if (adminEmail) {
                        await supabase
                            .from('profiles')
                            .update({ role: 'admin' })
                            .eq('id', user.id)
                    }
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
