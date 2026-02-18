import { createServerClient } from '@/lib/supabase-server'
import { ArrowLeft, User, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ChallengeSubmissionsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createServerClient()

    // Fetch riddle details
    const { data: riddle } = await supabase
        .from('riddles')
        .select('*')
        .eq('id', params.id)
        .single()

    // Fetch submissions with user details
    const { data: submissions } = await supabase
        .from('riddle_submissions')
        .select(`
            *,
            profiles(
                full_name,
                email
            )
        `)
        .eq('riddle_id', params.id)
        .order('submitted_at', { ascending: false })

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/challenges" className="p-3 bg-white border border-christ-light rounded-2xl text-christ-blue hover:bg-christ-light transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Submissions</h1>
                    <p className="text-christ-blue/60 font-medium mt-1">Reviewing student answers for this challenge.</p>
                </div>
            </div>

            {riddle && (
                <div className="bg-christ-dark p-8 rounded-[2rem] text-white shadow-xl">
                    <h2 className="text-christ-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">Current Riddle</h2>
                    <p className="font-serif italic text-2xl leading-relaxed">"{riddle.question}"</p>
                    <div className="mt-6 flex gap-4">
                        <div className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold">
                            Answer: <span className="text-christ-gold uppercase">{riddle.answer}</span>
                        </div>
                        <div className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold">
                            Submissions: {submissions?.length || 0}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-christ-light overflow-hidden">
                {(!submissions || submissions.length === 0) ? (
                    <div className="p-20 text-center">
                        <p className="text-christ-blue/40 font-medium italic">No submissions yet for this challenge.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-christ-light">
                            <thead className="bg-christ-silver">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Student</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Submitted Answer</th>
                                    <th className="px-8 py-5 text-center text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Result</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Submitted At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-christ-light">
                                {submissions.map((sub: any) => (
                                    <tr key={sub.id} className="hover:bg-christ-silver/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-christ-light rounded-full flex items-center justify-center text-christ-blue">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-christ-dark">{sub.profiles?.full_name || 'Anonymous'}</p>
                                                    <p className="text-xs text-christ-blue/40">{sub.profiles?.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-medium text-christ-dark tracking-wide capitalize">{sub.submitted_answer}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {sub.is_correct ? (
                                                <div className="flex items-center justify-center gap-1.5 text-green-600">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-[10px] font-black uppercase">Correct</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1.5 text-red-400">
                                                    <XCircle size={16} />
                                                    <span className="text-[10px] font-black uppercase">Incorrect</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <p className="text-xs font-bold text-christ-dark">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-christ-blue/40">{new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
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
