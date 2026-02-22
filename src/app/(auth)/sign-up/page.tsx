'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

type SignupStep = 'email' | 'otp'

export default function SignUpPage() {
    const [step, setStep] = useState<SignupStep>('email')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubscribed, setIsSubscribed] = useState(true)
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Check if account already exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email.toLowerCase().trim())
                .single()

            if (existingProfile) {
                throw new Error('Account already exists with this email. Please sign in instead.')
            }

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            })

            if (error) throw error

            setStep('otp')
            toast.success('OTP sent to your email!')
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
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            })
            if (error) throw error
            toast.success('OTP resent successfully!')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setResending(false)
        }
    }

    const handleVerifyAndComplete = async (e: React.FormEvent) => {
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
            // 1. Verify the OTP
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            })

            if (verifyError) throw verifyError

            if (!verifyData.user) throw new Error('Verification failed. User not found.')

            // 2. Update user with password and metadata
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
                password,
                data: {
                    full_name: fullName,
                    is_subscribed: isSubscribed,
                },
            })

            if (updateError) throw updateError

            // 3. Check for admin promotion
            const { data: adminEmail } = await supabase
                .from('admin_users')
                .select('id')
                .eq('email', email.toLowerCase().trim())
                .single()

            if (adminEmail) {
                // Auto-promote to admin
                await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', verifyData.user.id)
            }

            toast.success('Registration complete!')
            router.push('/')
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-christ-light p-8">
            <h2 className="text-2xl font-bold text-christ-blue mb-2">
                {step === 'email' ? 'Create Account' : 'Verify & Set Password'}
            </h2>
            <p className="text-christ-dark/60 mb-6 text-sm">
                {step === 'email'
                    ? 'Verify your email to join the Christ University Newsletter community.'
                    : `We've sent a 6-digit code to ${email}`}
            </p>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
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
                        className="w-full bg-christ-blue hover:bg-christ-dark text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                Send Verification OTP
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/sign-in')}
                        className="w-full text-center text-sm text-christ-blue font-semibold hover:underline mt-2"
                    >
                        Already have an account? Sign In
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyAndComplete} className="space-y-4">
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
                            <p className="text-xs text-christ-dark/50">Enter the code sent to your mail</p>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resending}
                                className="text-xs text-christ-blue hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Resend Code
                            </button>
                        </div>
                    </div>

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

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="flex-1 px-4 py-3 border border-christ-light text-christ-dark font-semibold rounded-lg hover:bg-christ-silver/20 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!!confirmPassword && confirmPassword !== password)}
                            className="flex-[2] bg-christ-blue hover:bg-christ-dark text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    Complete Signup
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-8 pt-6 border-t border-christ-light text-center">
                <p className="text-xs text-christ-dark/40">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}
