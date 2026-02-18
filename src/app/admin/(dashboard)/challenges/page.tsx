import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Puzzle, Plus, Pencil, Trash2, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ChallengesPage() {
    const supabase = await createServerClient()

    const { data: riddles } = await supabase
        .from('riddles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Logic Challenges</h1>
                    <p className="text-christ-blue/60 font-medium mt-1">Manage riddles and view student submissions.</p>
                </div>

                <Link
                    href="/admin/challenges/new"
                    className="bg-christ-blue text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-christ-dark transition-all flex items-center gap-2 font-bold"
                >
                    <Plus size={20} /> New Challenge
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-christ-light">
                {(!riddles || riddles.length === 0) ? (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-christ-silver rounded-full flex items-center justify-center mx-auto">
                            <Puzzle className="text-christ-blue/20" size={32} />
                        </div>
                        <p className="text-christ-blue/40 font-medium">No challenges found. Create your first riddle to get started.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-christ-light">
                        <thead className="bg-christ-silver">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Question</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Answer</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-christ-light">
                            {riddles.map((riddle) => (
                                <tr key={riddle.id} className="hover:bg-christ-silver/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-christ-dark line-clamp-1">{riddle.question}</p>
                                        <p className="text-xs text-christ-blue/40 mt-1 italic">{riddle.hint || 'No hint provided'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-christ-light text-christ-blue text-xs font-bold rounded-lg uppercase tracking-wider">
                                            {riddle.answer}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${riddle.is_active ? 'bg-green-100 text-green-700' : 'bg-christ-light text-christ-blue/40'
                                            }`}>
                                            {riddle.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/challenges/${riddle.id}/submissions`}
                                                className="p-2 text-christ-blue hover:bg-christ-light rounded-xl transition-all"
                                                title="View Submissions"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <Link
                                                href={`/admin/challenges/${riddle.id}`}
                                                className="p-2 text-christ-dark hover:bg-christ-silver rounded-xl transition-all"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <button
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
