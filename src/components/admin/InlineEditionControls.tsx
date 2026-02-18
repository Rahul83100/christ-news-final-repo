import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Edit, Trash2, Plus } from 'lucide-react'
import DeleteEditionButton from './DeleteEditionButton'

interface InlineEditionControlsProps {
    editionId: string
}

export default async function InlineEditionControls({ editionId }: InlineEditionControlsProps) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return null

    return (
        <div className="flex flex-wrap items-center gap-4 mt-6 p-4 bg-maroon-50 border border-maroon-100 rounded-xl">
            <span className="text-xs font-bold text-maroon-800 uppercase tracking-widest mr-auto">Admin Controls</span>

            <Link
                href={`/admin/editions/${editionId}/articles/new`}
                className="flex items-center gap-2 px-3 py-1.5 bg-forest-700 text-white rounded-lg text-sm font-bold hover:bg-forest-800 transition-colors"
            >
                <Plus size={14} /> Add Article
            </Link>

            <Link
                href={`/admin/editions/${editionId}`} // This actually goes to the article management list in current admin flow
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-forest-200 text-forest-700 rounded-lg text-sm font-bold hover:bg-forest-50 transition-colors"
            >
                <Edit size={14} /> Manage
            </Link>

            <DeleteEditionButton editionId={editionId} />
        </div>
    )
}
