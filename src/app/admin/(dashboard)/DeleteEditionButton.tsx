'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function DeleteEditionButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure? This will delete the edition AND all its articles. This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    const { error } = await supabase.from('editions').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete: ' + error.message)
      setIsDeleting(false)
    } else {
      toast.success('Edition deleted')
      router.refresh()
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
      disabled={isDeleting}
      className="p-2 bg-white/90 text-maroon-600 hover:text-maroon-800 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 disabled:opacity-50 z-50 text-xs font-bold"
      title="Delete Edition"
    >
      {isDeleting ? '...' : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
      )}
    </button>
  )
}