'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Puzzle, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewChallengePage() {
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [hint, setHint] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('riddles').insert([
            {
                question,
                answer: answer.toLowerCase().trim(),
                hint,
                is_active: true
            }
        ])

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Riddle created successfully!')
            router.push('/admin/challenges')
            router.refresh()
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/challenges" className="p-3 bg-white border border-christ-light rounded-2xl text-christ-blue hover:bg-christ-light transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">New Challenge</h1>
                    <p className="text-christ-blue/60 font-medium">Create a brain-teaser for the students.</p>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-christ-light">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Riddle Question</label>
                        <textarea
                            required
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            rows={4}
                            className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium resize-none"
                            placeholder="e.g., What has keys but can't open locks?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Correct Answer</label>
                            <input
                                required
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                                placeholder="e.g., Piano"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Optional Hint</label>
                            <input
                                type="text"
                                value={hint}
                                onChange={(e) => setHint(e.target.value)}
                                className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                                placeholder="e.g., Think musical instruments"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-christ-blue text-white py-5 px-8 rounded-2xl hover:bg-christ-dark transition-all font-bold shadow-xl shadow-christ-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            {loading ? 'Publishing...' : 'Publish Challenge'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
