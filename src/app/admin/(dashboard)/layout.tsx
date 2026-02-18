import Link from 'next/link'
import { LayoutDashboard, Puzzle, Trophy, Bell, FileText, LogOut, User } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { createServerClient } from '@/lib/supabase-server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex w-full">
            {/* Sidebar */}
            <aside className="w-72 bg-christ-dark text-white fixed inset-y-0 left-0 z-50 shadow-2xl overflow-y-auto flex flex-col">
                <div className="p-8 border-b border-white/10">
                    <Link href="/admin" className="flex flex-col group">
                        <span className="font-display font-black text-2xl text-white tracking-tight">
                            PORTAL<span className="text-christ-gold">.</span>
                        </span>
                        <span className="text-[10px] text-christ-light/50 uppercase tracking-[0.3em] font-bold mt-1">
                            Admin Control Center
                        </span>
                    </Link>
                </div>

                <div className="px-8 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3 text-christ-light/80">
                        <div className="w-8 h-8 rounded-full bg-christ-gold/20 flex items-center justify-center text-christ-gold">
                            <User size={16} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || 'Admin'}</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-60">Administrator</span>
                        </div>
                    </div>
                </div>

                <nav className="p-6 space-y-2 flex-grow">
                    <AdminNavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <AdminNavLink href="/admin/editions" icon={FileText} label="Volumes & Articles" />
                    <AdminNavLink href="/admin/challenges" icon={Puzzle} label="Logic Challenges" />
                    <AdminNavLink href="/admin/winners" icon={Trophy} label="Winners Feed" />
                    <AdminNavLink href="/admin/announcements" icon={Bell} label="Announcements" />
                    <AdminNavLink href="/admin/users" icon={User} label="User Management" />
                </nav>

                <div className="p-6 border-t border-white/10 bg-christ-dark/50 backdrop-blur-md">
                    <form action={signOut}>
                        <button type="submit" className="flex items-center gap-3 text-sm font-bold text-christ-light/60 hover:text-white transition-colors w-full p-3 rounded-xl hover:bg-white/5 group">
                            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow ml-72 p-12 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function AdminNavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 p-4 rounded-2xl text-christ-light/70 hover:text-white hover:bg-white/5 transition-all group font-medium"
        >
            <Icon size={20} className="group-hover:text-christ-gold transition-colors" />
            {label}
        </Link>
    )
}
