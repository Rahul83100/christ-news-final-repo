'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Upload, X, FileText, Loader2, Save, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PageFlip from '@/components/PageFlip'

interface EditionUploaderProps {
    trigger?: React.ReactNode
}

export default function EditionUploader({ trigger }: EditionUploaderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // Find the carousel container to portal into (escapes the fog mask)
    const triggerRef = useRef<HTMLDivElement>(null)
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if (triggerRef.current) {
            let parent = triggerRef.current.parentElement
            while (parent) {
                if (parent.classList.contains('group/carousel') || parent.hasAttribute('data-carousel')) {
                    setPortalTarget(parent)
                    break
                }
                parent = parent.parentElement
            }
        }
    }, [])

    const handleClose = () => {
        if (loading) return
        setIsOpen(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            setPreviewUrl(URL.createObjectURL(selectedFile))
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !title) return

        setLoading(true)
        try {
            // LOCAL TESTING FALLBACK
            await new Promise(resolve => setTimeout(resolve, 1500))
            console.log('[LOCAL TEST] Would upload:', { title, description, fileName: file.name, size: file.size })

            toast.success('Edition published successfully! (local test)')
            handleClose()
            setFile(null)
            setPreviewUrl(null)
            setTitle('')
            setDescription('')
            router.refresh()
        } catch (error: any) {
            console.error('Upload failed:', error)
            toast.error(error.message || 'Failed to upload edition')
        } finally {
            setLoading(false)
        }
    }

    const previewArticles = previewUrl ? [{
        id: 'preview', title: 'Preview', short_description: '', content: null,
        author: 'You', department: 'Preview', page_number: 1, pdf_url: previewUrl,
        edition_id: 'preview', created_at: new Date().toISOString()
    }] : []

    // The overlay content — rendered via portal OUTSIDE the fog mask
    const overlayContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[80] rounded-2xl overflow-hidden"
                >
                    {/* Foggy backdrop layer */}
                    <div className="absolute inset-0 bg-cream-50/80 backdrop-blur-sm" />

                    {/* Content layer — solid, no blur */}
                    <div className="absolute inset-0 flex">
                        {/* Close button — top left */}
                        <button
                            onClick={handleClose}
                            className="absolute top-3 left-3 z-20 p-2 bg-white hover:bg-red-50 border border-cream-200 rounded-full text-forest-500 hover:text-red-600 shadow-md transition-all"
                            title="Close without publishing"
                        >
                            <X size={18} />
                        </button>

                        {/* Left — Upload Form */}
                        <div className="w-[320px] flex-shrink-0 p-6 pt-14 flex flex-col bg-white border-r border-cream-200 overflow-y-auto">
                            <div className="mb-5">
                                <h2 className="font-display text-xl font-bold text-forest-900">New Edition</h2>
                                <p className="text-xs text-forest-400 mt-1">Upload and publish a PDF.</p>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-3 flex flex-col flex-grow">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest-600 mb-1 block">Title</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-maroon-400/30 focus:border-maroon-400 outline-none transition-all text-sm font-medium text-forest-900"
                                        placeholder="e.g. Vol 5, Issue 2"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest-600 mb-1 block">Description</label>
                                    <input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-maroon-400/30 focus:border-maroon-400 outline-none transition-all text-sm text-forest-900"
                                        placeholder="Optional summary..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-forest-600 mb-1 block">PDF File</label>
                                    <label className={`cursor-pointer border-2 border-dashed rounded-lg p-3 flex items-center gap-3 transition-all ${file ? 'border-maroon-400 bg-maroon-50/50' : 'border-cream-200 hover:border-maroon-300 bg-cream-50'}`}>
                                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                                        <div className={`p-2 rounded-full flex-shrink-0 ${file ? 'bg-maroon-100 text-maroon-600' : 'bg-cream-100 text-forest-400'}`}>
                                            <FileText size={16} />
                                        </div>
                                        <div className="min-w-0 overflow-hidden">
                                            <p className="text-sm font-bold text-forest-900 truncate">{file ? file.name : 'Choose PDF'}</p>
                                            <p className="text-[11px] text-forest-400">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Click to browse'}</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="mt-auto pt-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !file || !title}
                                        className="w-full bg-forest-900 text-white py-3 rounded-xl font-bold hover:bg-forest-800 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-sm"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {loading ? 'Publishing...' : 'Publish Edition'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right — Flipbook Preview (just the book, no controls) */}
                        <div className="flex-grow bg-gray-900 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                <div className="w-full h-full">
                                    <PageFlip
                                        articles={previewArticles}
                                        editionTitle={title || "Preview"}
                                        editionPdfUrl={previewUrl}
                                        editionId="preview"
                                        isAdmin={false}
                                        previewOnly={true}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-white/30 space-y-3">
                                    <BookOpen size={48} strokeWidth={1} />
                                    <p className="font-serif italic text-sm">Upload a PDF to preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <>
            <div ref={triggerRef} onClick={() => setIsOpen(true)}>
                {trigger || (
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-maroon-600 text-white rounded-full font-bold text-sm shadow-lg hover:bg-maroon-700 hover:-translate-y-0.5 transition-all">
                        <Upload size={18} />
                        Upload New Edition
                    </button>
                )}
            </div>

            {/* Portal overlay into the carousel container (outside the fog mask) */}
            {portalTarget ? createPortal(overlayContent, portalTarget) : overlayContent}
        </>
    )
}
