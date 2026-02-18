'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface AdminEditionFormProps {
    initialData?: {
        id?: string
        edition_number: number
        title: string
        subtitle?: string | null // [NEW]
        release_date: string
        cover_image_url?: string | null
        pdf_url?: string | null // [NEW]
    }
}

export default function AdminEditionForm({ initialData }: AdminEditionFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        edition_number: initialData?.edition_number || '',
        title: initialData?.title || '',
        subtitle: initialData?.subtitle || '', // [NEW]
        release_date: initialData?.release_date || new Date().toISOString().split('T')[0],
        cover_image_url: initialData?.cover_image_url || '',
        pdf_url: initialData?.pdf_url || '', // [NEW]
    })

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image_url' | 'pdf_url') => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const folder = field === 'cover_image_url' ? 'edition-covers' : 'edition-pdfs'
        const filePath = `${folder}/${fileName}`

        setUploading(true)
        try {
            const { error: uploadError } = await supabase.storage
                .from('articles') // reusing articles bucket as per plan
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('articles')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, [field]: publicUrl }))
            toast.success('File uploaded successfully')
        } catch (error: any) {
            toast.error('Error uploading file: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const dataToSave = {
                edition_number: parseInt(formData.edition_number.toString()),
                title: formData.title,
                subtitle: formData.subtitle,
                release_date: formData.release_date,
                cover_image_url: formData.cover_image_url,
                pdf_url: formData.pdf_url,
            }

            let error

            if (initialData?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('editions')
                    .update(dataToSave)
                    .eq('id', initialData.id)
                error = updateError
            } else {
                // Create
                const { error: insertError } = await supabase
                    .from('editions')
                    .insert([dataToSave])
                error = insertError
            }

            if (error) throw error

            toast.success(initialData?.id ? 'Edition updated!' : 'Edition created!')
            router.push('/admin/editions')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-forest-800 mb-2">Edition Number</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.edition_number}
                            onChange={(e) => setFormData({ ...formData, edition_number: e.target.value })}
                            className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                            placeholder="e.g. 5"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-forest-800 mb-2">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                            placeholder="e.g. Winter 2026 Special"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-forest-800 mb-2">Subtitle</label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                            placeholder="e.g. A collection of student achievements"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-forest-800 mb-2">Release Date</label>
                        <input
                            type="date"
                            required
                            value={formData.release_date}
                            onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                            className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                        />
                    </div>

                    {/* PDF Upload */}
                    <div>
                        <label className="block text-sm font-bold text-forest-800 mb-2">Full Edition PDF</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-forest-100 text-forest-700 px-4 py-2 rounded-lg font-bold hover:bg-forest-200 transition-colors flex items-center gap-2">
                                <FileText size={18} />
                                {uploading ? 'Uploading...' : 'Upload PDF'}
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => handleFileUpload(e, 'pdf_url')}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                            {formData.pdf_url && (
                                <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                    ✓ PDF Uploaded
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, pdf_url: '' })}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                        </div>
                        {formData.pdf_url && (
                            <a href={formData.pdf_url} target="_blank" rel="noreferrer" className="text-xs text-forest-500 hover:underline mt-1 block">
                                View current PDF
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Column: Cover Image */}
                <div className="space-y-6">
                    <label className="block text-sm font-bold text-forest-800 mb-2">Cover Image</label>

                    <div className="border-2 border-dashed border-cream-300 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] bg-cream-50 relative overflow-hidden group hover:border-forest-400 transition-all">
                        {formData.cover_image_url ? (
                            <div className="relative w-full h-full min-h-[300px]">
                                <Image
                                    src={formData.cover_image_url}
                                    alt="Cover Preview"
                                    fill
                                    className="object-cover rounded-xl"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, cover_image_url: '' })}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto text-forest-400">
                                    <ImageIcon size={32} />
                                </div>
                                <div>
                                    <p className="text-forest-600 font-medium">Click to upload cover</p>
                                    <p className="text-forest-400 text-xs mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                        )}

                        {!formData.cover_image_url && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'cover_image_url')}
                                disabled={uploading}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        )}

                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                <Loader2 className="animate-spin text-forest-600" size={32} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-cream-200 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-xl border border-cream-300 text-forest-600 font-bold hover:bg-cream-100 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="px-8 py-2.5 rounded-xl bg-forest-700 text-white font-bold hover:bg-forest-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        initialData?.id ? 'Update Edition' : 'Create Edition'
                    )}
                </button>
            </div>
        </form>
    )
}
