'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, ArrowRight, KeyRound, ShieldCheck, RefreshCw, ChevronLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

type SignMode = 'signin' | 'reset'
type ResetStep = 'email' | 'otp'

export default function SignInPage() {
    const [mode, setMode] = useState<SignMode>('signin')
    const [resetStep, setResetStep] = useState<ResetStep>('email')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
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

            toast.success('Welcome back!')
            window.location.href = '/'
        } catch (err: any) {
            let errorMessage = err.message

            // If sign in fails, check if account even exists
            if (err.message.toLowerCase().includes('invalid login credentials')) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', email.toLowerCase().trim())
                    .single()

                if (!profile) {
                    errorMessage = 'Account not found. Please sign up first.'
                }
            }

            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleSendResetOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false, // Don't create new users in reset flow
                },
            })

            if (error) throw error

            setResetStep('otp')
            toast.success('OTP sent to your email!')
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyAndReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            setLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.')
            setLoading(false)
            return
        }

        try {
            // 1. Verify OTP
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            })

            if (verifyError) throw verifyError

            // 2. Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (updateError) throw updateError

            toast.success('Password reset successfully!')
            setMode('signin')
            setResetStep('email')
            setOtp('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        setResending(true)
        try {
            const { error } = await supabase.auth.signInWithOtp({ email })
            if (error) throw error
            toast.success('OTP resent!')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-christ-light p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-christ-blue">
                    {mode === 'signin' ? 'Welcome Back' : 'Reset Password'}
                </h2>
                {mode === 'reset' && (
                    <button
                        onClick={() => {
                            setMode('signin')
                            setResetStep('email')
                            setError(null)
                        }}
                        className="text-sm text-christ-blue hover:underline flex items-center gap-1 font-semibold"
                    >
                        <ChevronLeft size={16} /> Back to Login
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {mode === 'signin' ? (
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
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-sm font-medium text-christ-dark">Password</label>
                            <button
                                type="button"
                                onClick={() => setMode('reset')}
                                className="text-xs text-christ-blue hover:underline font-semibold"
                            >
                                Forgot Password?
                            </button>
                        </div>
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
            ) : resetStep === 'email' ? (
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                    <p className="text-christ-dark/60 text-sm mb-2">
                        Enter your email address to receive a verification code.
                    </p>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-christ-blue hover:bg-christ-dark text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                Send OTP Code
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-christ-dark mb-1.5">OTP Code</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                            <input
                                type="text"
                                required
                                maxLength={8}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border border-christ-light rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all tracking-[0.3em] font-mono text-center text-lg"
                                placeholder="00000000"
                            />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-christ-dark/50">Check your email for the code</p>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resending}
                                className="text-xs text-christ-blue hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Resend
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-christ-dark mb-1.5">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border border-christ-light rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-christ-dark mb-1.5">Confirm New Password</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-christ-blue/30 w-5 h-5" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 bg-christ-silver/30 border rounded-lg focus:ring-2 focus:ring-christ-gold focus:border-transparent outline-none transition-all ${confirmPassword && confirmPassword !== newPassword
                                    ? 'border-red-300 bg-red-50/30'
                                    : confirmPassword && confirmPassword === newPassword
                                        ? 'border-green-300 bg-green-50/30'
                                        : 'border-christ-light'
                                    }`}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (!!confirmPassword && confirmPassword !== newPassword)}
                        className="w-full bg-christ-blue hover:bg-christ-dark text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                Reset & Login
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {mode === 'signin' && (
                <p className="mt-6 text-center text-sm text-christ-dark/60">
                    Don't have an account?{' '}
                    <Link href="/sign-up" className="text-christ-blue font-bold hover:underline">
                        Sign Up
                    </Link>
                </p>
            )}
        </div>
    )
}
