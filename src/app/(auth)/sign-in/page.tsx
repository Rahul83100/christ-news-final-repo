'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function SignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.refresh()
            router.push('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-christ-light p-8">
            <h2 className="text-2xl font-bold text-christ-blue mb-6">Welcome Back</h2>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
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
                    <label className="block text-sm font-medium text-christ-dark mb-1.5">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border border-christ-light rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-christ-blue hover:bg-christ-dark text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            Sign In
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-christ-dark/60">
                Don't have an account?{' '}
                <Link href="/sign-up" className="text-christ-blue font-bold hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    )
}
