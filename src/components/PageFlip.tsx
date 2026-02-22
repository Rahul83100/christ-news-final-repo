'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { motion, AnimatePresence } from 'framer-motion'
import { Article } from '@/lib/types'
import ArticlePage from './ArticlePage'
import PDFPageRenderer from './PDFPageRenderer'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize, Minimize, Download, ExternalLink, Plus, Lock } from 'lucide-react'
import clsx from 'clsx'
import { forwardRef } from 'react'
import * as pdfjs from 'pdfjs-dist'
import DeleteArticleButton from './admin/DeleteArticleButton'
import AddArticleModal from './admin/AddArticleModal'
import { User } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Use CDN for stability
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface PageFlipProps {
  articles: Article[]
  editionTitle: string
  editionPdfUrl?: string | null
  editionId: string
  isAdmin?: boolean
  previewOnly?: boolean
  user: User | null
}

type BookPageType =
  | { type: 'cover'; article: Article }
  | { type: 'blank'; text: string }
  | { type: 'article'; article: Article }
  | { type: 'pdf'; article: Article; pdfPage: number }
  | { type: 'back-cover' }

const Cover = forwardRef<HTMLDivElement, { title: string; subtitle: string; author: string; department: string }>(
  ({ title, subtitle, author, department }, ref) => {
    return (
      <div ref={ref} className="w-full h-full p-8 md:p-12 flex flex-col justify-between items-center text-center bg-cream-50 relative shadow-lg" data-density="hard">
        <div className="absolute inset-0 border-[12px] border-double border-forest-900/10 m-4 pointer-events-none" />

        <div className="mt-8 text-center w-full">
          <h4 className="font-serif text-forest-500 tracking-[0.2em] text-xs md:text-sm uppercase mb-2">Christ University</h4>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-forest-900 leading-tight mb-4 break-words">
            {title}
          </h1>
          <div className="w-16 h-1 bg-maroon-500 mx-auto" />
        </div>

        <div className="my-8">
          <p className="font-serif text-forest-700 italic text-md md:text-lg opacity-80 max-w-sm mx-auto">
            {subtitle || "Volume 1 • Edition 2026"}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-bold text-forest-400 uppercase tracking-widest mb-1">Created By</p>
          <p className="font-display text-lg md:text-xl text-forest-800">{author}</p>
        </div>

        <div className="absolute bottom-4 right-4 text-[10px] text-forest-300">
          {department}
        </div>
      </div>
    )
  }
)
Cover.displayName = 'Cover'

const BlankPage = forwardRef<HTMLDivElement, { text?: string }>(({ text = "End" }, ref) => (
  <div ref={ref} className="w-full h-full bg-cream-100/30 flex items-center justify-center shadow-inner border-l border-gray-200" data-density="soft">
    <span className="text-forest-300 italic text-xs md:text-sm">{text}</span>
  </div>
))
BlankPage.displayName = 'BlankPage'

const BackCover = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="w-full h-full bg-forest-950 text-white p-8 flex flex-col items-center justify-center relative shadow-lg" data-density="hard">
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
    <div className="relative z-10 text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-white/20 rounded-full mx-auto mb-4 flex items-center justify-center font-serif text-2xl md:text-3xl">C</div>
      <p className="text-xs md:text-sm opacity-60 uppercase tracking-widest">Christ University</p>
    </div>
  </div>
))
BackCover.displayName = 'BackCover'

const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; pageNumber?: number; isAdmin?: boolean; articleId?: string; editionId?: string }>((props, ref) => {
  return (
    <div ref={ref} className="w-full h-full relative" data-density="soft">
      {props.children}

      {/* Admin Delete Button Overlay */}
      {props.isAdmin && props.articleId && props.editionId && (
        <div className="absolute top-2 right-2 z-50">
          <DeleteArticleButton articleId={props.articleId} editionId={props.editionId} />
        </div>
      )}

      {props.pageNumber !== undefined && (
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-forest-400 font-serif z-20">
          - {props.pageNumber} -
        </div>
      )}
    </div>
  )
})
Page.displayName = 'Page'

export default function PageFlip({ articles, editionTitle, editionPdfUrl, editionId, isAdmin, previewOnly = false, user }: PageFlipProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [scale, setScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [expandedPages, setExpandedPages] = useState<BookPageType[]>([])
  const [isProcessing, setIsProcessing] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/page-flip-47177.mp3')
  }, [])

  // Process articles to expand PDF pages
  useEffect(() => {
    const processPages = async () => {
      setIsProcessing(true)
      const pages: BookPageType[] = []

      // 1. Cover
      pages.push({ type: 'cover', article: articles[0] })

      // 2. Front Inner (Blank)
      pages.push({ type: 'blank', text: editionTitle })

      // 3. Articles & PDF Pages
      for (const article of articles) {
        if (article.pdf_url) {
          try {
            const loadingTask = pdfjs.getDocument(article.pdf_url)
            const pdf = await loadingTask.promise
            const numPages = pdf.numPages

            for (let i = 1; i <= numPages; i++) {
              pages.push({ type: 'pdf', article, pdfPage: i })
            }
          } catch (err) {
            console.error(`Failed to load PDF for ${article.title}:`, err)
            // Fallback to error page or simple article view
            pages.push({ type: 'article', article })
          }
        } else {
          // Regular text article
          pages.push({ type: 'article', article })
        }
      }

      // If no pages yet (i.e. empty articles) but we have a full Edition PDF
      if (pages.length === 2 && articles.length === 0 && editionPdfUrl) {
        // Add a dummy article for the full edition
        const fullEditionArticle: Article = {
          id: 'full-edition',
          edition_id: 'edition-full',
          title: editionTitle,
          short_description: 'Full Edition PDF',
          content: '',
          author: 'Christ University',
          department: 'Editorial Board',
          page_number: 1,
          pdf_url: editionPdfUrl,
          created_at: new Date().toISOString()
        }

        try {
          const loadingTask = pdfjs.getDocument(editionPdfUrl)
          const pdf = await loadingTask.promise
          const numPages = pdf.numPages

          for (let i = 1; i <= numPages; i++) {
            pages.push({ type: 'pdf', article: fullEditionArticle, pdfPage: i })
          }
        } catch (err) {
          console.error("Failed to load full edition PDF:", err)
          pages.push({ type: 'blank', text: "Failed to load PDF" })
        }
      }

      // 4. Ensure even number of pages for symmetry if needed
      if (pages.length % 2 === 0) {
        pages.push({ type: 'blank', text: "End of Edition" })
      }

      // 5. Back Cover
      pages.push({ type: 'back-cover' })

      setExpandedPages(pages)
      setIsProcessing(false)
    }

    processPages()
  }, [articles, editionTitle, editionPdfUrl])

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log("Audio play failed", e))
    }
  }, [])

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data)
    playSound()
  }, [playSound])

  // Navigation functions
  const flipPrev = () => flipBookRef.current?.pageFlip()?.flipPrev()
  const flipNext = () => flipBookRef.current?.pageFlip()?.flipNext()

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Active Content for AI and Controls
  const activePage = expandedPages[currentPage]
  const activeArticle = activePage && ('article' in activePage) ? activePage.article : null

  const downloadPdf = () => {
    if (!user) {
      toast.error("Please sign in to download")
      router.push('/sign-up')
      return
    }

    if (activeArticle?.pdf_url) {
      const link = document.createElement('a')
      link.href = activeArticle.pdf_url
      link.download = `Article-${activeArticle.title || 'download'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert("No PDF available for the current page.")
    }
  }

  const openPdf = () => {
    if (!user) {
      toast.error("Please sign in to preview")
      router.push('/sign-up')
      return
    }

    if (activeArticle?.pdf_url) {
      window.open(activeArticle.pdf_url, '_blank')
    } else {
      alert("No PDF available for this page.")
    }
  }

  const handleAiAsk = async () => {
    if (!aiPrompt.trim()) return
    setIsAiLoading(true)
    setAiResponse(null)

    let context = ""
    if (activePage?.type === 'cover') {
      context = `Cover Page: ${activePage.article.title}\n${activePage.article.short_description}`
    } else if (activeArticle) {
      context = `
        Current Section: ${activeArticle.title}
        Type: ${'pdfPage' in activePage ? `PDF Page ${activePage.pdfPage}` : 'Text Article'}
        Summary: ${activeArticle.short_description || ''}
        Content: ${activeArticle.content || 'Reading from PDF document...'}
      `
    }

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, context })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiResponse(data.result)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      setAiResponse(`Oops! 🤖 ${errorMessage}`)
    } finally {
      setIsAiLoading(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50">
        <div className="w-12 h-12 border-4 border-forest-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-display font-bold text-forest-900 animate-pulse">Preparing Flipbook...</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        "flex flex-col items-center justify-center w-full transition-colors duration-300",
        previewOnly ? "h-full" : (isFullscreen ? "h-screen bg-gray-900 p-4" : "min-h-[90vh]")
      )}
    >
      {/* Header — hidden in preview mode */}
      {!previewOnly && (
        <div className={clsx(
          "w-full max-w-6xl flex justify-between items-center mb-6 px-4 z-20",
          isFullscreen ? "text-white" : "text-forest-900"
        )}>
          <Link href="/" className={clsx("text-sm font-medium flex items-center gap-2 hover:opacity-80", isFullscreen ? "text-white" : "text-forest-700")}>
            <ChevronLeft size={16} /> Back to Library
          </Link>
          <h2 className="font-display font-bold text-lg hidden sm:block tracking-wide">{editionTitle}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-serif opacity-80">
              {currentPage === 0 ? "Cover" : `Page ${currentPage} / ${expandedPages.length - 1}`}
            </span>
          </div>
        </div>
      )}

      <AddArticleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editionId={editionId}
      />

      <div className="relative flex-grow flex items-center justify-center w-full overflow-hidden p-4">

        <button
          onClick={flipPrev}
          disabled={currentPage === 0}
          className="absolute left-2 md:left-8 z-30 p-3 rounded-full bg-forest-900/10 hover:bg-forest-900/20 text-forest-900 disabled:opacity-5 transition-all backdrop-blur-sm shadow-sm"
          title="Previous Page"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={flipNext}
          disabled={currentPage >= expandedPages.length - 2}
          className="absolute right-2 md:right-8 z-30 p-3 rounded-full bg-forest-900/10 hover:bg-forest-900/20 text-forest-900 disabled:opacity-5 transition-all backdrop-blur-sm shadow-sm"
          title="Next Page"
        >
          <ChevronRight size={32} />
        </button>

        <div
          className="shadow-2xl transition-transform duration-300"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          <HTMLFlipBook
            width={550}
            height={733}
            size="stretch"
            minWidth={315}
            maxWidth={1000}
            minHeight={420}
            maxHeight={1350}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className="flip-book"
            ref={flipBookRef}
            startPage={0}
            drawShadow={true}
            flippingTime={800}
            usePortrait={false}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            style={{}}
          >
            {expandedPages.map((page, index) => {
              if (page.type === 'cover') {
                return (
                  <Cover
                    key="cover"
                    title={page.article.title}
                    subtitle={page.article.short_description || ""}
                    author={page.article.author}
                    department={page.article.department || ""}
                  />
                )
              }
              if (page.type === 'blank') {
                // Blank page for title
                return <BlankPage key={`blank-${index}`} text={page.text} />
              }
              if (page.type === 'back-cover') {
                return <BackCover key="back-cover" />
              }
              if (page.type === 'pdf') {
                return (
                  <Page
                    key={`pdf-${page.article.id}-${page.pdfPage}`}
                    pageNumber={index}
                    isAdmin={isAdmin}
                    articleId={page.article.id}
                    editionId={editionId}
                  >
                    <PDFPageRenderer url={page.article.pdf_url!} pageNumber={page.pdfPage} />
                  </Page>
                )
              }
              if (page.type === 'article') {
                return (
                  <Page
                    key={`article-${page.article.id}`}
                    pageNumber={index}
                    isAdmin={isAdmin}
                    articleId={page.article.id}
                    editionId={editionId}
                  >
                    <ArticlePage article={page.article} totalPageCount={articles.length} />
                  </Page>
                )
              }
              return null
            })}
          </HTMLFlipBook>
        </div>
      </div>

      {/* Controls — hidden in preview mode */}
      {!previewOnly && (
        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-forest-100 z-30 mb-8 md:mb-0">
          <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-gray-100 rounded-full text-forest-700">
              <ZoomOut size={20} />
            </button>
            <span className="text-xs font-mono text-forest-500 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-gray-100 rounded-full text-forest-700">
              <ZoomIn size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
            {/* Admin Add Article Button */}
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-forest-700 text-white hover:bg-forest-800 rounded text-xs font-bold transition-colors mr-2 shadow-sm"
                title="Add New Article"
              >
                <Plus size={14} /> <span className="hidden sm:inline">Add Article</span>
              </button>
            )}

            <button onClick={openPdf} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-xs font-medium text-forest-700" title={user ? "Open PDF" : "Sign in to Preview"}>
              {user ? <ExternalLink size={16} /> : <Lock size={14} className="text-maroon-600" />}
              <span className="hidden sm:inline">Preview PDF</span>
            </button>
            <button onClick={downloadPdf} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-xs font-medium text-forest-700" title={user ? "Download PDF" : "Sign in to Download"}>
              {user ? <Download size={16} /> : <Lock size={14} className="text-maroon-600" />}
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>

          <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded-full text-forest-700" title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

        </div>
      )}
    </div>
  )
}