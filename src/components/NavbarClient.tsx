'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, Video, Radio, Bell } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface NavbarClientProps {
    user: User | null;
    role?: string;
}

const NavbarClient: React.FC<NavbarClientProps> = ({ user, role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/?s=${encodeURIComponent(searchQuery.trim())}#home`)
            setIsSearchOpen(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
            // Force reload to home to clear all states immediately
            window.location.href = '/'
        } catch (error) {
            console.error('Sign out failed:', error)
            router.push('/')
        }
    }

    const topNavLinks = [
        { label: 'HOME', href: '/#home', active: true },
        { label: 'PUZZLES & GAMES', href: '/#puzzles' },
        { label: 'WINNERS', href: '/#winners' },
        { label: 'ANNOUNCEMENTS', href: '/#announcements' },
        { label: 'UPCOMING EVENTS', href: '/#events' },
        { label: 'CREDITS', href: '/#credits' },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Main Bar */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-[1400px] mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group flex items-center gap-2"
                        >
                            <Menu size={28} className="text-gray-700 group-hover:text-christ-blue" />
                        </button>

                        <Link href="/" className="flex items-center">
                            <div className="relative w-40 h-10 md:w-56 md:h-14">
                                <img
                                    src="/christ_online_logo.png"
                                    alt="CHRIST University"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Search Input for Desktop */}
                    <div className={`flex-grow max-w-xl transition-all duration-300 ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none absolute md:relative'}`}>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search volumes, editions..."
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-christ-blue transition-all text-gray-900 placeholder:text-gray-400"
                                autoFocus={isSearchOpen}
                            />
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-christ-blue" strokeWidth={2.5} />
                        </form>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`p-2.5 hover:bg-christ-light rounded-full transition-all duration-300 ${isSearchOpen ? 'text-white bg-christ-blue shadow-lg scale-110' : 'text-gray-700 hover:text-christ-blue hover:scale-105'}`}
                        >
                            <Search size={24} strokeWidth={2.5} />
                        </button>
                        {!user && (
                            <Link
                                href="/sign-in"
                                className="hidden sm:block px-4 py-1.5 border border-christ-blue text-christ-blue text-xs font-bold rounded-full hover:bg-christ-light"
                            >
                                SIGN IN
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar Drawer */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
                role={role}
                onSignOut={handleSignOut}
            />
        </nav>
    )
}

export default NavbarClient
