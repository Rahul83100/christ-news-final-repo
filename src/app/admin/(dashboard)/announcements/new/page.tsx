'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Bell, ArrowLeft, Save, Calendar, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export default function NewAnnouncementPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'announcement' | 'event'>('announcement')
    const [date, setDate] = useState('')
    const [href, setHref] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('announcements').insert([
            {
                title,
                description,
                type,
                date,
                href,
                is_public: isPublic
            }
        ])

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Announcement posted!')
            router.push('/admin/announcements')
            router.refresh()
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/announcements" className="p-3 bg-white border border-christ-light rounded-2xl text-christ-blue hover:bg-christ-light transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Create Update</h1>
                    <p className="text-christ-blue/60 font-medium">Keep the Christ University community engaged.</p>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-christ-light">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex gap-4 p-2 bg-christ-silver rounded-2xl w-fit border border-christ-light">
                        <button
                            type="button"
                            onClick={() => setType('announcement')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'announcement' ? 'bg-christ-blue text-white shadow-lg' : 'text-christ-blue/40 hover:text-christ-blue'
                                }`}
                        >
                            Announcement
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('event')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'event' ? 'bg-christ-blue text-white shadow-lg' : 'text-christ-blue/40 hover:text-christ-blue'
                                }`}
                        >
                            Upcoming Event
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Title</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                            placeholder="e.g., New Edition Released: Volume 14"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium resize-none"
                            placeholder="Provide more context or details..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Display Date / Time</label>
                            <div className="relative">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-christ-blue/30" size={18} />
                                <input
                                    type="text"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                                    placeholder="e.g., Feb 28, 2026 or Just Now"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Link URL (Optional)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-christ-blue/30" size={18} />
                                <input
                                    type="url"
                                    value={href}
                                    onChange={(e) => setHref(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-6 bg-christ-silver/50 rounded-2xl border border-christ-light">
                        <input
                            type="checkbox"
                            id="is-public"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-5 h-5 accent-christ-blue"
                        />
                        <label htmlFor="is-public" className="text-sm font-bold text-christ-dark select-none">Make this post public immediately</label>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-christ-blue text-white py-5 px-8 rounded-2xl hover:bg-christ-dark transition-all font-bold shadow-xl shadow-christ-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            {loading ? 'Posting...' : 'Confirm & Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
