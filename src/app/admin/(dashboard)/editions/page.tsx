import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, FileText, Calendar, ChevronRight } from 'lucide-react'
import DeleteEditionButton from '../DeleteEditionButton'

export const dynamic = 'force-dynamic'

export default async function EditionsAdminPage() {
    const supabase = await createServerClient()

    const { data: editions } = await supabase
        .from('editions')
        .select('*')
        .order('release_date', { ascending: false })

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Newsletter Volumes</h1>
                    <p className="text-christ-blue/60 font-medium mt-1">Manage and publish newsletter editions.</p>
                </div>

                <Link
                    href="/admin/editions/new"
                    className="bg-christ-blue text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-christ-dark transition-all flex items-center gap-2 font-bold"
                >
                    <Plus size={20} /> New Volume
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(!editions || editions.length === 0) ? (
                    <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-christ-light flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-christ-silver rounded-3xl flex items-center justify-center text-christ-blue/20 mb-6">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-christ-dark">No editions yet</h3>
                        <p className="text-christ-blue/40 font-medium mt-2 max-w-xs">Start by creating your first newsletter volume to share with the university.</p>
                        <Link href="/admin/editions/new" className="mt-8 text-christ-blue font-bold hover:underline">Create First Volume →</Link>
                    </div>
                ) : (
                    editions.map((edition) => (
                        <div key={edition.id} className="bg-white p-6 rounded-[2.5rem] border border-christ-light shadow-sm hover:border-christ-blue transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-20 bg-christ-silver rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {edition.cover_image_url ? (
                                            <img src={edition.cover_image_url} alt={edition.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <FileText className="text-christ-blue/20" size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-christ-dark group-hover:text-christ-blue transition-colors">
                                            {edition.title}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs font-black uppercase text-christ-blue/40 tracking-widest">Vol. {edition.edition_number}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-christ-blue/60 font-medium">
                                                <Calendar size={14} />
                                                {edition.release_date}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/admin/editions/${edition.id}`}
                                        className="px-6 py-3 rounded-xl bg-christ-light/50 text-christ-blue font-bold hover:bg-christ-blue hover:text-white transition-all text-sm"
                                    >
                                        Manage Articles
                                    </Link>
                                    <DeleteEditionButton id={edition.id} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
