'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Shield, ShieldAlert, Trash2, Loader2, User } from 'lucide-react'
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-cream-300 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-cream-50 border-b border-cream-200">
                            <th className="px-6 py-4 font-bold text-forest-800 text-sm uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 font-bold text-forest-800 text-sm uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 font-bold text-forest-800 text-sm uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 font-bold text-forest-800 text-sm uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-cream-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-bold">
                                            {user.full_name ? user.full_name[0].toUpperCase() : <User size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-forest-900">{user.full_name || 'Unknown'}</div>
                                            <div className="text-sm text-forest-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-forest-600">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {loadingMap[user.id] ? (
                                            <Loader2 className="animate-spin text-forest-400" size={20} />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleRoleUpdate(user.id, user.role)}
                                                    className={`p-2 rounded-lg transition-colors ${user.role === 'admin'
                                                            ? 'text-orange-500 hover:bg-orange-50'
                                                            : 'text-purple-600 hover:bg-purple-50'
                                                        }`}
                                                    title={user.role === 'admin' ? 'Remove Admin Access' : 'Make Admin'}
                                                >
                                                    {user.role === 'admin' ? <ShieldAlert size={18} /> : <Shield size={18} />}
                                                </button>

                                                {/* Only allow deleting other users, not self */}
                                                {user.id !== currentUserId && (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
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
            </div>
        </div>
    )
}
