'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Trophy, ArrowLeft, Save, Star } from 'lucide-react'
import Link from 'next/link'

export default function NewWinnerPage() {
    const [name, setName] = useState('')
    const [game, setGame] = useState('')
    const [rank, setRank] = useState('Gold')
    const [volume, setVolume] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const today = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        })

        const { error } = await supabase.from('winners').insert([
            {
                name,
                game,
                rank,
                volume,
                date: today
            }
        ])

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Winner crowned successfully!')
            router.push('/admin/winners')
            router.refresh()
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/winners" className="p-3 bg-white border border-christ-light rounded-2xl text-christ-blue hover:bg-christ-light transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Crown Champion</h1>
                    <p className="text-christ-blue/60 font-medium">Add a new winner to the public leaderboard.</p>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-christ-light">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Winner Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                            placeholder="Full name of the student"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Game / Challenge</label>
                            <input
                                required
                                type="text"
                                value={game}
                                onChange={(e) => setGame(e.target.value)}
                                className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                                placeholder="e.g., Crossword #12"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Newsletter Volume</label>
                            <input
                                required
                                type="text"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value)}
                                className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                                placeholder="e.g., 14"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1 text-center">Select Rank</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['Gold', 'Silver', 'Bronze'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRank(r)}
                                    className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all border-2 ${rank === r
                                            ? 'bg-christ-blue text-white border-christ-blue shadow-lg scale-105'
                                            : 'bg-christ-silver text-christ-blue/40 border-christ-light hover:border-christ-blue/20'
                                        }`}
                                >
                                    <Star size={20} className={rank === r ? 'text-christ-gold' : 'text-current'} />
                                    <span className="text-xs uppercase tracking-widest">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-christ-blue text-white py-5 px-8 rounded-2xl hover:bg-christ-dark transition-all font-bold shadow-xl shadow-christ-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            {loading ? 'Crowning...' : 'Confirm Winner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
