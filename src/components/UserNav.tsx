'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon, LayoutDashboard, Users, Mail } from 'lucide-react'
import { useState } from 'react'

interface UserNavProps {
    user: User | null
    role?: string
}

export default function UserNav({ user, role }: UserNavProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    if (!user) {
        return (
            <div className="flex items-center gap-4 ml-4">
                <Link
                    href="/sign-in"
                    className="text-christ-dark hover:text-christ-blue font-bold transition-colors text-sm"
                >
                    Log In
                </Link>
                <Link
                    href="/sign-up"
                    className="px-5 py-2 text-sm font-bold text-white bg-christ-blue rounded-full hover:bg-christ-dark transition-all shadow-md hover:shadow-lg"
                >
                    Subscribe
                </Link>
            </div>
        )
    }

    return (
        <div className="relative ml-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-christ-light hover:bg-christ-silver transition-colors"
            >
                <div className="w-8 h-8 bg-christ-gold rounded-full flex items-center justify-center text-white font-bold">
                    {user.user_metadata.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-bold text-christ-dark max-w-[100px] truncate hidden md:block">
                    {user.user_metadata.full_name || 'User'}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-christ-light py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-christ-light mb-2">
                            <p className="text-xs text-christ-dark/60 font-medium">Signed in as</p>
                            <p className="text-sm font-bold text-christ-blue truncate">{user.email}</p>
                            {role === 'admin' && (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-maroon-100 text-maroon-700 uppercase tracking-wider mt-2 border border-maroon-200">
                                    Administrator
                                </span>
                            )}
                        </div>

                        <div className="px-2 space-y-1">
                            {role === 'admin' && (
                                <Link
                                    href="/admin/subscribers"
                                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-christ-dark hover:bg-christ-silver rounded-lg transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-1.5 bg-maroon-100 text-maroon-600 rounded-md group-hover:bg-maroon-200">
                                        <Mail size={16} />
                                    </div>
                                    Update Subscribers
                                </Link>
                            )}

                            {role === 'admin' && (
                                <Link
                                    href="/users"
                                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-christ-dark hover:bg-christ-silver rounded-lg transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-1.5 bg-christ-blue/10 text-christ-blue rounded-md group-hover:bg-christ-blue/20">
                                        <Users size={16} />
                                    </div>
                                    Manage Users
                                </Link>
                            )}

                            <div className="h-px bg-christ-light my-2" />

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left group"
                            >
                                <div className="p-1.5 bg-red-100 text-red-600 rounded-md group-hover:bg-red-200">
                                    <LogOut size={16} />
                                </div>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
