'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteEdition } from '@/app/actions/editions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function DeleteEditionButton({ editionId }: { editionId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this ENTIRE EDITION and all its articles? This cannot be undone.')) return

        setLoading(true)
        try {
            await deleteEdition(editionId)
            toast.success('Edition deleted')
            router.push('/') // Redirect to home after deleting edition
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
        </button>
    )
}
