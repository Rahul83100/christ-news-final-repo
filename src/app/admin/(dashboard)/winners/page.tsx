import { createServerClient } from '@/lib/supabase-server'
import { Trophy, Plus, Trash2, User } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function WinnersPage() {
    const supabase = await createServerClient()

    const { data: winners } = await supabase
        .from('winners')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Winners Circle</h1>
                    <p className="text-christ-blue/60 font-medium mt-1">Manage and announce puzzle champions.</p>
                </div>

                <Link
                    href="/admin/winners/new"
                    className="bg-christ-blue text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-christ-dark transition-all flex items-center gap-2 font-bold"
                >
                    <Plus size={20} /> Add Winner
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(!winners || winners.length === 0) ? (
                    <div className="bg-white rounded-[2.5rem] border border-christ-light p-20 text-center">
                        <Trophy className="mx-auto text-christ-gold/20 mb-4" size={48} />
                        <p className="text-christ-blue/40 font-medium">No winners announced yet. Be the first to crown a champion!</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-christ-light overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-christ-light">
                            <thead className="bg-christ-silver">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Champion</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Game / Challenge</th>
                                    <th className="px-8 py-5 text-center text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Rank</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-christ-blue/50 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-christ-light">
                                {winners.map((winner) => (
                                    <tr key={winner.id} className="hover:bg-christ-silver/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-christ-light rounded-full flex items-center justify-center text-christ-blue font-bold">
                                                    {winner.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-christ-dark">{winner.name}</p>
                                                    <p className="text-[10px] text-christ-blue/40 uppercase tracking-widest font-bold">{winner.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-medium text-christ-dark">{winner.game}</p>
                                            <p className="text-xs text-christ-blue/40 font-medium italic">Vol. {winner.volume}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${winner.rank === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                                                winner.rank === 'Silver' ? 'bg-christ-light text-christ-blue' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {winner.rank}
                                            </span>
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
