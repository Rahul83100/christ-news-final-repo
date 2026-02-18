'use client'

import { useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist'

// Set worker source
// Use CDN for stability and to avoid local file issues
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface PDFPageRendererProps {
    url: string
    pageNumber: number
    scale?: number
}

export default function PDFPageRenderer({ url, pageNumber, scale = 2.0 }: PDFPageRendererProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const renderTaskRef = useRef<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const renderPage = async () => {
            try {
                setLoading(true)
                const loadingTask = pdfjs.getDocument(url)
                const pdf = await loadingTask.promise

                if (!isMounted) return

                const page = await pdf.getPage(pageNumber)

                // High DPI scaling for crisp text
                const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
                const viewport = page.getViewport({ scale: scale * pixelRatio })

                const canvas = canvasRef.current
                if (!canvas || !isMounted) return

                const context = canvas.getContext('2d')
                if (!context) return

                canvas.height = viewport.height
                canvas.width = viewport.width

                // fix: handling aspect ratio
                // canvas.style.width = '100%'
                // canvas.style.height = '100%'

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                }

                // Cancel previous task if any to prevent race conditions
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel()
                }

                renderTaskRef.current = page.render(renderContext)
                await renderTaskRef.current.promise

                if (isMounted) setLoading(false)
            } catch (err: any) {
                if (err.name === 'RenderingCancelledException') return
                console.error('Error rendering PDF page:', err)
                if (isMounted) {
                    setError(err.message)
                    setLoading(false)
                }
            }
        }

        renderPage()

        return () => {
            isMounted = false
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel()
            }
        }
    }, [url, pageNumber, scale])

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-maroon-600 text-[10px] p-4 text-center">
                Error loading page: {error}
            </div>
        )
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden">
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 z-10">
                    <div className="w-6 h-6 border-2 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain shadow-sm"
            />
        </div>
    )
}
