'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteArticle } from '@/app/actions/articles' // Ensure this path is correct
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function DeleteArticleButton({ articleId, editionId }: { articleId: string, editionId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return

        setLoading(true)
        try {
            await deleteArticle(articleId, editionId)
            toast.success('Article deleted')
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
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors ml-4"
            title="Delete Article"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
    )
}
