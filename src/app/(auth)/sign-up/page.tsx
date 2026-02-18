'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'

export default function SignUpPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubscribed, setIsSubscribed] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            setLoading(false)
            return
        }

        try {
            const { data: signUpData, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        is_subscribed: isSubscribed,
                    },
                },
            })

            if (error) throw error

            // Check if this email was pre-registered as admin
            if (signUpData?.user) {
                const { data: adminEmail } = await supabase
                    .from('admin_emails')
                    .select('id')
                    .eq('email', email.toLowerCase().trim())
                    .single()

                if (adminEmail) {
                    // Auto-promote to admin
                    await supabase
                        .from('profiles')
                        .update({ role: 'admin' })
                        .eq('id', signUpData.user.id)
                }
            }

            router.push('/sign-in?message=Check your email to confirm account')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-christ-light p-8">
            <h2 className="text-2xl font-bold text-christ-blue mb-2">Create Account</h2>
            <p className="text-christ-dark/60 mb-6 text-sm">Join the Christ University Newsletter community.</p>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-christ-dark mb-1.5">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border border-christ-light rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-christ-dark mb-1.5">Gmail Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border border-christ-light rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all"
                            placeholder="yourname@gmail.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-christ-dark mb-1.5">Set Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border border-christ-light rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-christ-dark mb-1.5">Confirm Password</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all ${confirmPassword && confirmPassword !== password
                                ? 'border-red-300 bg-red-50/30'
                                : confirmPassword && confirmPassword === password
                                    ? 'border-green-300 bg-green-50/30'
                                    : 'border-christ-light'
                                }`}
                            placeholder="••••••••"
                        />
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="subscribe"
                        checked={isSubscribed}
                        onChange={(e) => setIsSubscribed(e.target.checked)}
                        className="w-4 h-4 text-christ-blue rounded border-christ-light focus:ring-christ-gold"
                    />
                    <label htmlFor="subscribe" className="text-sm text-christ-dark/80 cursor-pointer select-none">
                        Keep me updated with new editions
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || (!!confirmPassword && confirmPassword !== password)}
                    className="w-full bg-christ-blue hover:bg-christ-dark text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            Create Account
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-christ-dark/60">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-christ-blue font-bold hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    )
}
