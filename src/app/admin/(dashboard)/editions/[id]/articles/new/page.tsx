'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FileText, ArrowLeft, Save, Upload, Type, Hash, UserCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewArticlePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
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
    const filePath = `${params.id}/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('articles')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

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
          edition_id: params.id,
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

      toast.success('Article added to edition!')
      router.push(`/edition/${params.id}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <Link href={`/edition/${params.id}`} className="p-3 bg-white border border-christ-light rounded-2xl text-christ-blue hover:bg-christ-light transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">New Article</h1>
          <p className="text-christ-blue/60 font-medium">Add a new page or piece to this newsletter edition.</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-christ-light">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Title</label>
              <div className="relative">
                <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-christ-blue/30" size={18} />
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                  placeholder="The Impact of AI in Education"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Author</label>
              <div className="relative">
                <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-christ-blue/30" size={18} />
                <input
                  required
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                  placeholder="Dr. Jane Smith"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                placeholder="Dept. of Computer Science"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Page Number</label>
              <div className="relative">
                <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-christ-blue/30" size={18} />
                <input
                  required
                  type="number"
                  min="1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
                  placeholder="01"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-2xl focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
              placeholder="A brief overview of the article content..."
            />
          </div>

          <div className="space-y-6">
            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest ml-1 text-center">Content Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-christ-blue/40 tracking-wider text-center">Method A: PDF Document</p>
                <label className="cursor-pointer border-2 border-dashed border-christ-light rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-christ-blue hover:bg-christ-light/30 transition-all group">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <div className="w-16 h-16 bg-christ-silver rounded-2xl flex items-center justify-center text-christ-blue/40 group-hover:text-christ-blue transition-colors">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-christ-dark">{pdfFile ? pdfFile.name : 'Upload PDF'}</p>
                    <p className="text-[10px] text-christ-blue/40 font-bold uppercase tracking-widest mt-1">Single page PDF for flipbook</p>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-christ-blue/40 tracking-wider text-center">Method B: Rich Text</p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-6 py-4 bg-christ-silver border border-christ-light rounded-[2rem] focus:ring-4 focus:ring-christ-blue/10 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium resize-none shadow-inner"
                  placeholder="Paste your article text here if you don't have a PDF..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-christ-blue text-white py-5 px-8 rounded-2xl hover:bg-christ-dark transition-all font-bold shadow-xl shadow-christ-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Save size={20} />
              {loading ? 'Adding Article...' : 'Confirm & Save Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}