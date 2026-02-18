'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Shield, ShieldAlert, Trash2, Loader2, User, Plus, Mail, UserPlus, X } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/app/actions/users'
import { addAdminEmail, removeAdminEmail } from '@/app/actions/adminEmails'

interface Profile {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'user'
    created_at: string
}

interface AdminEmail {
    id: string
    email: string
    created_at: string
}

interface AdminManagementProps {
    admins: Profile[]
    adminEmails: AdminEmail[]
    currentUserId: string
}

export default function AdminManagement({ admins, adminEmails, currentUserId }: AdminManagementProps) {
    const router = useRouter()
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
    const [newEmail, setNewEmail] = useState('')
    const [addingEmail, setAddingEmail] = useState(false)

    const handleDemote = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this admin\'s access?')) return

        setLoadingMap(prev => ({ ...prev, [userId]: true }))
        try {
            await updateUserRole(userId, 'user')
            toast.success('Admin access removed')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoadingMap(prev => ({ ...prev, [userId]: false }))
        }
    }

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmail.trim()) return

        setAddingEmail(true)
        try {
            await addAdminEmail(newEmail)
            toast.success(`Admin email registered: ${newEmail}`)
            setNewEmail('')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setAddingEmail(false)
        }
    }

    const handleRemoveEmail = async (adminEmailId: string) => {
        if (!confirm('Remove this admin email? If they have an account, they will be demoted to user.')) return

        setLoadingMap(prev => ({ ...prev, [adminEmailId]: true }))
        try {
            await removeAdminEmail(adminEmailId)
            toast.success('Admin email removed')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoadingMap(prev => ({ ...prev, [adminEmailId]: false }))
        }
    }

    return (
        <div className="space-y-10">
            {/* Add New Admin */}
            <div className="bg-white rounded-2xl shadow-sm border border-cream-300 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <UserPlus className="text-purple-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-forest-900 text-lg">Add New Admin</h3>
                        <p className="text-sm text-forest-500">Enter an email address. When they sign up, they'll be automatically recognized as admin.</p>
                    </div>
                </div>

                <form onSubmit={handleAddEmail} className="flex gap-3">
                    <div className="relative flex-grow">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 w-5 h-5" />
                        <input
                            type="email"
                            required
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="newadmin@gmail.com"
                            className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all text-forest-900 font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={addingEmail}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                        {addingEmail ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Add Admin
                    </button>
                </form>

                {/* Pending Admin Emails (pre-registered but haven't signed up yet) */}
                {adminEmails.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-xs font-bold text-forest-600 uppercase tracking-widest mb-3">Pre-Registered Admin Emails</h4>
                        <div className="space-y-2">
                            {adminEmails.map((ae) => {
                                const isAlreadyAdmin = admins.some(a => a.email === ae.email)
                                return (
                                    <div key={ae.id} className="flex items-center justify-between px-4 py-3 bg-cream-50 rounded-lg border border-cream-200">
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-forest-400" />
                                            <span className="font-medium text-forest-900">{ae.email}</span>
                                            {isAlreadyAdmin ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Pending Sign-up</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveEmail(ae.id)}
                                            disabled={loadingMap[ae.id]}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove admin email"
                                        >
                                            {loadingMap[ae.id] ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Current Admins */}
            <div className="bg-white rounded-2xl shadow-sm border border-cream-300 overflow-hidden">
                <div className="px-6 py-4 bg-cream-50 border-b border-cream-200">
                    <h3 className="font-bold text-forest-900 flex items-center gap-2">
                        <Shield size={18} className="text-purple-600" />
                        Current Admins ({admins.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-cream-200">
                                <th className="px-6 py-3 font-bold text-forest-800 text-xs uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-3 font-bold text-forest-800 text-xs uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 font-bold text-forest-800 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-100">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-cream-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                {admin.full_name ? admin.full_name[0].toUpperCase() : <User size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-forest-900">{admin.full_name || 'Unknown'}</div>
                                                <div className="text-sm text-forest-500">{admin.email}</div>
                                            </div>
                                            {admin.id === currentUserId && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">You</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-forest-600">
                                        {new Date(admin.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {admin.id !== currentUserId && (
                                            <div className="flex items-center justify-end gap-2">
                                                {loadingMap[admin.id] ? (
                                                    <Loader2 className="animate-spin text-forest-400" size={20} />
                                                ) : (
                                                    <button
                                                        onClick={() => handleDemote(admin.id)}
                                                        className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                                                        title="Remove Admin Access"
                                                    >
                                                        <ShieldAlert size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
