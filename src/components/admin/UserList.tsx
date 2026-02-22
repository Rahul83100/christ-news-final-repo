'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Shield, ShieldAlert, Trash2, Loader2, User, Filter, ArrowUpDown } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/app/actions/users'

interface Profile {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'user'
    created_at: string
}

interface AdminUserListProps {
    users: Profile[]
    currentUserId: string
}

export default function AdminUserList({ users, currentUserId }: AdminUserListProps) {
    const router = useRouter()
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
    const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest')

    const handleRoleUpdate = async (userId: string, currentRole: 'admin' | 'user') => {
        if (!confirm(`Are you sure you want to change this user's role?`)) return

        setLoadingMap(prev => ({ ...prev, [userId]: true }))
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin'
            await updateUserRole(userId, newRole)
            toast.success(`User role updated to ${newRole}`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoadingMap(prev => ({ ...prev, [userId]: false }))
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        setLoadingMap(prev => ({ ...prev, [userId]: true }))
        try {
            await deleteUser(userId)
            toast.success('User deleted successfully')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoadingMap(prev => ({ ...prev, [userId]: false }))
        }
    }

    const processedUsers = useMemo(() => {
        return [...users]
            .filter(user => roleFilter === 'all' || user.role === roleFilter)
            .sort((a, b) => {
                // Primary Sort: Admin First
                if (a.role === 'admin' && b.role !== 'admin') return -1
                if (a.role !== 'admin' && b.role === 'admin') return 1

                // Secondary Sort: Date
                const dateA = new Date(a.created_at).getTime()
                const dateB = new Date(b.created_at).getTime()
                return dateSort === 'newest' ? dateB - dateA : dateA - dateB
            })
    }, [users, roleFilter, dateSort])

    return (
        <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-cream-300 shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-forest-400" />
                    <span className="text-sm font-bold text-forest-700 mr-2">Filter Role:</span>
                    <div className="flex bg-cream-50 p-1 rounded-lg border border-cream-200">
                        {['all', 'admin', 'user'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role as any)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${roleFilter === role
                                    ? 'bg-white text-forest-950 shadow-sm'
                                    : 'text-forest-400 hover:text-forest-600'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ArrowUpDown size={18} className="text-forest-400" />
                    <span className="text-sm font-bold text-forest-700 mr-2">Joining Date:</span>
                    <select
                        value={dateSort}
                        onChange={(e) => setDateSort(e.target.value as any)}
                        className="bg-cream-50 border border-cream-200 text-forest-900 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-forest-100 transition-all cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* User List Table */}
            <div className="bg-white rounded-2xl shadow-md border border-cream-300 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-forest-950 text-white border-b border-forest-800">
                                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-cream-100">User Details</th>
                                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-cream-100">System Role</th>
                                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-cream-100">Joining Date</th>
                                <th className="px-6 py-5 font-black text-xs uppercase tracking-widest text-cream-100 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-100">
                            {processedUsers.map((user) => (
                                <tr key={user.id} className={`group hover:bg-cream-50 transition-colors ${user.role === 'admin' ? 'bg-purple-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-full shadow-sm flex items-center justify-center text-lg font-black ${user.role === 'admin'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-cream-100 text-forest-900 border border-cream-200'
                                                }`}>
                                                {user.full_name ? user.full_name[0].toUpperCase() : <User size={22} />}
                                            </div>
                                            <div>
                                                <div className="font-black text-forest-950 flex items-center gap-2">
                                                    {user.full_name || 'Anonymous User'}
                                                    {user.id === currentUserId && (
                                                        <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded border border-blue-200">You</span>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-forest-400 group-hover:text-forest-600 transition-colors">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 ${user.role === 'admin'
                                            ? 'bg-white border-purple-600 text-purple-700 shadow-sm'
                                            : 'bg-white border-forest-200 text-forest-600'
                                            }`}>
                                            {user.role === 'admin' ? <Shield size={12} strokeWidth={3} /> : <User size={12} strokeWidth={3} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-forest-800 tracking-wider">
                                        {new Date(user.created_at).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {loadingMap[user.id] ? (
                                                <Loader2 className="animate-spin text-forest-400" size={20} />
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, user.role)}
                                                        className={`p-2.5 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 ${user.role === 'admin'
                                                            ? 'text-orange-500 border-orange-100 hover:bg-orange-50'
                                                            : 'text-purple-600 border-purple-100 hover:bg-purple-50'
                                                            }`}
                                                        title={user.role === 'admin' ? 'Remove Admin Access' : 'Make Admin'}
                                                    >
                                                        {user.role === 'admin' ? <ShieldAlert size={20} /> : <Shield size={20} />}
                                                    </button>

                                                    {user.id !== currentUserId && (
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-2.5 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-all hover:scale-110 active:scale-95"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {processedUsers.length === 0 && (
                        <div className="py-20 text-center bg-cream-50/30">
                            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-forest-200">
                                <User className="text-forest-200" size={32} />
                            </div>
                            <h3 className="font-black text-forest-900 uppercase tracking-widest text-sm">No users found</h3>
                            <p className="text-xs text-forest-400 font-bold mt-1 uppercase tracking-tighter">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
