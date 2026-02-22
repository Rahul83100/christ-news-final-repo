import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const PROJECT_ID = 'yinrybsrgnryidkcizuz'
const BUCKET_NAME = 'articles'

serve(async (req) => {
    try {
        const payload = await req.json()
        console.log("Webhook payload received:", JSON.stringify(payload, null, 2))

        const { record } = payload
        if (!record) {
            console.error("No record found in payload")
            return new Response(JSON.stringify({ error: "No record found" }), { status: 400 })
        }

        const { title, description } = record
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Fetch all subscribed users
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('email')
            .eq('is_subscribed', true)

        if (userError) {
            console.error("Error fetching users:", userError)
            return new Response(JSON.stringify({ error: userError.message }), { status: 500 })
        }

        const emails = users?.map(u => u.email) || []
        console.log(`Found ${emails.length} subscribers:`, emails)

        if (emails.length === 0) {
            console.log("No subscribers found to notify")
            return new Response('No subscribers')
        }

        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set in secrets")
            return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 })
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: emails,
                subject: `New Announcement: ${title}`,
                html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9;">
            <div style="background: #ffffff; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <img src="https://yinrybsrgnryidkcizuz.supabase.co/storage/v1/object/public/email-assets/e%20luminate%20(2).jpeg" alt="ELuminate Logo" width="130" style="margin-bottom: 20px;">
              <h2 style="color: #222;">${title}</h2>
              <p style="color: #666; line-height: 1.6;">${description}</p>
              <a href="https://christ-news-final-repo.vercel.app" style="display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">View on Website</a>
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
              <p style="color: #999; font-size: 10px;">You are receiving this because you subscribed to ELuminate updates.</p>
            </div>
          </div>
        `,
            }),
        })

        const result = await response.json()
        console.log("Resend API response:", JSON.stringify(result, null, 2))

        return new Response(JSON.stringify(result), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error("Error in announcement-email function:", error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
