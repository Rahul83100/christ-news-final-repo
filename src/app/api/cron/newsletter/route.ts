// @ts-ignore
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.re_6WbDD9pL_L5Aez54ShHTtaiBau7C6r9om)

export async function GET(request: Request) {
    // Basic authorization for Cron Job
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabase = await createServerClient()

    try {
        // 1. Fetch latest edition
        const { data: latestEdition, error: editionError } = await supabase
            .from('editions')
            .select('*')
            .order('release_date', { ascending: false })
            .limit(1)
            .single()

        if (editionError || !latestEdition) {
            return NextResponse.json({ message: 'No editions found' }, { status: 404 })
        }

        // 2. Fetch subscribed users
        // Only fetch users who have NOT received this edition yet (optimization for future: limit 50 at a time)
        // For now, simple fetch all subscribed.
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('email')
            .eq('is_subscribed', true)

        if (usersError || !users || users.length === 0) {
            return NextResponse.json({ message: 'No active subscribers found' }, { status: 200 })
        }

        // 3. Send Emails (Batching not natively supported in free tier like this, loop needed or batch endpoint)
        // Resend supports batching, but for simplicity let's loop or use bcc if list is small, 
        // or send individually. sending individually is safer for delivery stats.

        const emailPromises = users.map(async (user) => {
            if (!user.email) return null

            return resend.emails.send({
                from: 'Christ University Newsletter <newsletter@yourdomain.com>', // User needs to verify domain
                to: user.email,
                subject: `New Edition: ${latestEdition.title}`,
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1>The Digital Chronicle - Vol. ${latestEdition.edition_number}</h1>
                        <p>Hello!</p>
                        <p>A new edition of the Christ University Newsletter is now available.</p>
                        <div style="margin: 20px 0; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                            <img src="${latestEdition.cover_image_url || ''}" alt="Cover" style="max-width: 100%; height: auto; border-radius: 4px;" />
                            <h2>${latestEdition.title}</h2>
                            <p>${latestEdition.subtitle || ''}</p>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/edition/${latestEdition.id}" style="display: inline-block; padding: 12px 24px; background-color: #003366; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Read Now</a>
                        </div>
                        <p>Happy Reading,<br/>The Editorial Team</p>
                    </div>
                `
            })
        })

        const results = await Promise.allSettled(emailPromises)
        const successCount = results.filter(r => r.status === 'fulfilled').length

        return NextResponse.json({
            message: `Processed ${users.length} subscribers.`,
            sent: successCount,
            edition: latestEdition.title
        })

    } catch (error: any) {
        console.error('Auto-mailer error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

