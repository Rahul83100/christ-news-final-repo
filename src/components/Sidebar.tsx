'use client'

import React from 'react'
import Link from 'next/link'
import {
    X, Home, Tv, Newspaper, Briefcase, Puzzle,
    Palmtree, Landmark, Flag, Globe, Trophy,
    Cpu, Music, GlassWater, ChevronRight, ChevronDown,
    User as UserIcon, LogOut, Bell, Users, LayoutDashboard
} from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    role?: string;
    onSignOut: () => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, role, onSignOut }) => {
    const menuItems = [
        { label: 'Home', icon: Home, href: '/#home', color: 'bg-christ-silver text-christ-blue' },
        { label: 'Puzzles & Games', icon: Puzzle, href: '/#puzzles', color: 'bg-purple-50 text-purple-600', isNew: true },
        { label: 'Winners', icon: Trophy, href: '/#winners', color: 'bg-christ-light text-christ-blue' },
        { label: 'Announcements', icon: Bell, href: '/#announcements', color: 'bg-christ-gold text-white' },
        { label: 'Upcoming Events', icon: Landmark, href: '/#events', color: 'bg-christ-light text-christ-dark' },
        { label: 'Credits', icon: UserIcon, href: '/#credits', color: 'bg-christ-silver text-christ-blue' },
    ]

    const adminItems = [
        { label: 'Manage Users', icon: Users, href: '/users', color: 'bg-red-50 text-red-600' },
        { label: 'Admin Dashboard', icon: LayoutDashboard, href: '/admin', color: 'bg-christ-blue/10 text-christ-blue' },
    ]

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>

                    {/* User Section */}
                    <div className="mt-8 flex flex-col border-b pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-christ-silver border-2 border-christ-blue/10 rounded-full flex items-center justify-center text-christ-dark shadow-sm">
                                {user?.user_metadata.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserIcon size={28} />
                                )}
                            </div>
                            {user ? (
                                <div className="flex-grow">
                                    <p className="font-bold text-christ-dark truncate max-w-[150px] text-lg leading-tight">
                                        {user.user_metadata.full_name || 'User'}
                                    </p>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                            {user.email}
                                        </p>
                                        {role === 'admin' && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider border-2 border-white shadow-sm glow-red animate-pulse">
                                                ★ ADMIN
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={onSignOut}
                                            className="text-[10px] text-red-600 font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                                        >
                                            <LogOut size={10} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/sign-in"
                                    className="px-6 py-2 border-2 border-christ-blue text-christ-blue font-bold rounded-full hover:bg-christ-light transition-colors text-sm uppercase tracking-wider"
                                    onClick={onClose}
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>


                    {/* Subscribe Button - Only show for guests */}
                    {!user && (
                        <div className="py-6 border-b">
                            <Link
                                href="/sign-up"
                                className="block w-full text-center bg-christ-blue text-white font-bold py-3 rounded-full shadow-lg hover:bg-christ-dark transition-all uppercase tracking-widest text-sm"
                                onClick={onClose}
                            >
                                Subscribe
                            </Link>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-4 space-y-2">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-christ-silver transition-colors group"
                                onClick={onClose}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                                        <item.icon size={20} />
                                    </div>
                                    <span className="font-bold text-gray-700 group-hover:text-christ-blue transition-colors">
                                        {item.label}
                                    </span>
                                    {item.isNew && (
                                        <span className="bg-christ-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                            New
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Admin Menu Items */}
                    {role === 'admin' && (
                        <div className="py-4 border-t border-red-100 space-y-2">
                            <h4 className="px-4 text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Admin Tools</h4>
                            {adminItems.map((item, index) => (
                                <Link
                                    key={`admin-${index}`}
                                    href={item.href}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors group"
                                    onClick={onClose}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Sidebar
