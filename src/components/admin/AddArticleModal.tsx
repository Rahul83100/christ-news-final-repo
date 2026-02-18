'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { X, Upload, Type, Hash, UserCircle, Save, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AddArticleModalProps {
    isOpen: boolean
    onClose: () => void
    editionId: string
}

export default function AddArticleModal({ isOpen, onClose, editionId }: AddArticleModalProps) {
    const [title, setTitle] = useState('')
    const [shortDescription, setShortDescription] = useState('')
    const [content, setContent] = useState('')
    const [author, setAuthor] = useState('')
    const [department, setDepartment] = useState('')
    const [pageNumber, setPageNumber] = useState('')
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpload = async (file: File) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${editionId}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('articles')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('articles')
            .getPublicUrl(filePath)

        return publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let pdfUrl = null
            if (pdfFile) {
                pdfUrl = await handleUpload(pdfFile)
            }

            const { error } = await supabase.from('articles').insert([
                {
                    edition_id: editionId,
                    title,
                    short_description: shortDescription,
                    content: content || null,
                    author,
                    department: department || null,
                    page_number: parseInt(pageNumber),
                    pdf_url: pdfUrl
                }
            ])

            if (error) throw error

            toast.success('Article added successfully!')
            router.refresh()
            onClose()

            // Reset form
            setTitle('')
            setShortDescription('')
            setContent('')
            setAuthor('')
            setDepartment('')
            setPageNumber('')
            setPdfFile(null)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto max-w-4xl h-fit max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 p-10 border border-cream-200"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-forest-900">Add New Article</h2>
                                <p className="text-sm text-forest-500">Add a page to this edition.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-full text-forest-500">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-forest-700">Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" size={16} />
                                        <input
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-maroon-500/20 outline-none"
                                            placeholder="Article Title"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-forest-700">Author</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" size={16} />
                                        <input
                                            required
                                            value={author}
                                            onChange={(e) => setAuthor(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-maroon-500/20 outline-none"
                                            placeholder="Author Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-forest-700">Page Number</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" size={16} />
                                        <input
                                            required
                                            type="number"
                                            value={pageNumber}
                                            onChange={(e) => setPageNumber(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-maroon-500/20 outline-none"
                                            placeholder="Pg No."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-forest-700">Department</label>
                                    <input
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-maroon-500/20 outline-none"
                                        placeholder="Department (Optional)"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-forest-700">Short Description</label>
                                <input
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-maroon-500/20 outline-none"
                                    placeholder="Brief summary..."
                                />
                            </div>

                            <div className="space-y-4 pt-2 border-t border-cream-200">
                                <p className="text-xs font-bold uppercase tracking-widest text-forest-700 text-center">Content Source</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${pdfFile ? 'border-maroon-500 bg-maroon-50' : 'border-cream-300 hover:border-maroon-400'}`}>
                                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                                        <Upload size={24} className={pdfFile ? 'text-maroon-600' : 'text-forest-400'} />
                                        <span className="text-xs font-bold text-center truncate w-full">{pdfFile ? pdfFile.name : 'Upload PDF'}</span>
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-maroon-500/20 outline-none text-sm resize-none"
                                        placeholder="Or paste text content here..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-forest-900 text-white py-3 rounded-xl font-bold hover:bg-forest-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                {loading ? 'Saving...' : 'Add Article'}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
