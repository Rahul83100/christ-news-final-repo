'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Lock } from 'lucide-react'

interface AuthGateProps {
    children: React.ReactNode
    fallbackMessage?: string
}

export default function AuthGate({ children, fallbackMessage = "Sign in to access this content" }: AuthGateProps) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        checkUser()
    }, [])

    if (loading) {
        return <div className="animate-pulse">{children}</div>
    }

    if (user) {
        return <>{children}</>
    }

    return (
        <div className="relative group">
            {/* Blurred Content */}
            <div className="filter blur-sm pointer-events-none select-none opacity-50 transition-all duration-300">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-300">
                <Link
                    href="/sign-in"
                    className="flex flex-col items-center gap-3 px-8 py-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-christ-light hover:scale-105 transition-transform cursor-pointer group-hover:bg-white"
                >
                    <div className="p-3 bg-christ-blue/10 rounded-full text-christ-blue">
                        <Lock size={24} />
                    </div>
                    <span className="font-bold text-christ-dark">{fallbackMessage}</span>
                    <span className="px-5 py-2 bg-christ-blue text-white text-sm font-bold rounded-full hover:bg-christ-dark transition-colors">
                        Sign In / Sign Up
                    </span>
                </Link>
            </div>
        </div>
    )
}
