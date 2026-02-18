import { createServerClient } from '@/lib/supabase-server'
import { Bell, Plus, Trash2, Calendar, Link as LinkIcon, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AnnouncementsAdminPage() {
    const supabase = createServerClient()

    const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Happenings</h1>
                    <p className="text-christ-blue/60 font-medium mt-1">Broadcast news, events, and community updates.</p>
                </div>

                <Link
                    href="/admin/announcements/new"
                    className="bg-christ-blue text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-christ-dark transition-all flex items-center gap-2 font-bold"
                >
                    <Plus size={20} /> Create Update
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(!announcements || announcements.length === 0) ? (
                    <div className="bg-white rounded-[2.5rem] border border-christ-light p-20 text-center">
                        <Bell className="mx-auto text-christ-blue/10 mb-4" size={48} />
                        <p className="text-christ-blue/40 font-medium">No announcements yet. Keep the community informed!</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-christ-light overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-christ-light">
                            <thead className="bg-christ-silver">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Detail</th>
                                    <th className="px-8 py-5 text-center text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Visibility</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-christ-light">
                                {announcements.map((ann) => (
                                    <tr key={ann.id} className="hover:bg-christ-silver/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ann.type === 'event' ? 'bg-purple-100 text-purple-700' : 'bg-christ-light text-christ-blue'
                                                }`}>
                                                {ann.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-christ-dark">{ann.title}</p>
                                            <p className="text-xs text-christ-blue/40 line-clamp-1 mt-1">{ann.description}</p>
                                            <div className="flex gap-4 mt-2">
                                                {ann.date && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-christ-blue/60">
                                                        <Calendar size={12} /> {ann.date}
                                                    </div>
                                                )}
                                                {ann.href && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-christ-blue/60">
                                                        <LinkIcon size={12} /> Linked
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {ann.is_public ? (
                                                <div className="flex items-center justify-center gap-1.5 text-green-600">
                                                    <Eye size={16} />
                                                    <span className="text-[10px] font-black uppercase">Public</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1.5 text-christ-blue/30">
                                                    <EyeOff size={16} />
                                                    <span className="text-[10px] font-black uppercase">Draft</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
