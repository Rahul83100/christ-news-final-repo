import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const PROJECT_ID = 'yinrybsrgnryidkcizuz'
const BUCKET_NAME = 'articles'

serve(async (req) => {
    try {
        const payload = await req.json()
        console.log("Full Webhook Payload:", JSON.stringify(payload, null, 2))

        const { record, type, table, schema } = payload
        console.log(`Event Type: ${type}, Table: ${table}, Schema: ${schema}`)

        if (!record) {
            console.error("No record found in payload")
            return new Response(JSON.stringify({ error: "No record found" }), { status: 400 })
        }

        const email = record.email
        const full_name = record.full_name || record.fullName || "User"

        console.log(`Sending welcome email to: ${email} (Name: ${full_name})`)

        if (!email) {
            console.error("Email is missing in the record!")
            return new Response(JSON.stringify({ error: "Email missing" }), { status: 400 })
        }

        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set!")
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
                to: [email],
                subject: 'Welcome to ELuminate!',
                html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9;">
            <div style="background: #ffffff; padding: 30px; border-radius: 8px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <img src="https://yinrybsrgnryidkcizuz.supabase.co/storage/v1/object/public/email-assets/e%20luminate%20(2).jpeg" alt="ELuminate Logo" width="130" style="margin-bottom: 20px;">
              <h2 style="color: #222; margin-bottom: 10px;">Welcome to ELuminate, ${full_name}!</h2>
              <p style="color: #666; line-height: 1.6;">Thank you for signing up! You will now receive the latest scholarly articles and community updates directly in your inbox.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">© 2026 CHRIST Online. All rights reserved.</p>
            </div>
          </div>
        `,
            }),
        })

        const result = await response.json()
        console.log("Resend API full response:", JSON.stringify(result, null, 2))

        return new Response(JSON.stringify(result), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error("Critical error in function:", error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
