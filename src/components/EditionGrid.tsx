'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import BookCard from './BookCard'
import { Edition } from '@/lib/types'
import EditionUploader from './admin/EditionUploader'
import { Plus, ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

interface EditionGridProps {
  isAdmin?: boolean
}

export default function EditionGrid({ isAdmin }: EditionGridProps) {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('s')?.toLowerCase() || ''

  // Filter editions based on search query
  const filteredEditions = useMemo(() => {
    if (!searchQuery) return editions
    return editions.filter(edition =>
      edition.title.toLowerCase().includes(searchQuery) ||
      edition.subtitle?.toLowerCase().includes(searchQuery) ||
      edition.edition_number?.toString().includes(searchQuery)
    )
  }, [editions, searchQuery])

  // Card width + gap for scroll calculations
  const CARD_WIDTH = 280
  const GAP = 32

  useEffect(() => {
    async function fetchEditions() {
      try {
        console.log('Fetching editions starting...')
        const { data, error } = await supabase
          .from('editions')
          .select('*')
          .order('edition_number', { ascending: false })

        if (error) {
          console.error('Supabase error fetching editions:', error)
          throw error
        }

        console.log('Editions fetched successfully:', data?.length || 0, 'items')
        setEditions(data || [])
        setError(null)
      } catch (err: any) {
        console.error('Error in fetchEditions catch block:', err)
        setError(err.message || 'Failed to fetch editions')
      } finally {
        setLoading(false)
        console.log('Fetching editions finished, loading set to false')
      }
    }

    fetchEditions()
  }, [])

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Initial check
    const timer = setTimeout(updateScrollButtons, 100)
    el.addEventListener('scroll', updateScrollButtons, { passive: true })
    window.addEventListener('resize', updateScrollButtons)
    return () => {
      clearTimeout(timer)
      el.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [filteredEditions, updateScrollButtons])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = CARD_WIDTH + GAP
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scroll('left')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scroll('right')
    }
  }, [scroll])

  if (loading) {
    return (
      <div className="flex gap-8 px-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="min-w-[280px] aspect-[3/4] bg-cream-100/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Prod: Block UI, Dev: Show Demo
  if (error && process.env.NODE_ENV !== 'development') {
    return (
      <div className="max-w-xl mx-auto p-12 text-center bg-red-50/50 rounded-3xl border border-red-100 space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-red-900">Connection Issue</h3>
        <p className="text-red-600/80 font-serif">Failed to load editions.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-full font-bold">Retry</button>
      </div>
    )
  }

  // Handle No Results
  if (filteredEditions.length === 0 && searchQuery) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center bg-cream-100/30 rounded-3xl border border-dashed border-christ-blue/20">
        <div className="w-16 h-16 bg-christ-light text-christ-blue rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX size={32} />
        </div>
        <h3 className="text-xl font-bold text-christ-dark">No Matches Found</h3>
        <p className="text-gray-600 font-serif italic mb-6">We couldn't find any volumes matching "{searchQuery}"</p>
        <button
          onClick={() => router.push('/?#home')}
          className="px-6 py-2 bg-christ-blue text-white rounded-full font-bold hover:bg-christ-dark transition-all"
        >
          Clear Search
        </button>
      </div>
    )
  }

  // Prod: Empty State
  if (editions.length === 0 && process.env.NODE_ENV !== 'development' && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center bg-cream-50/50 rounded-3xl border border-cream-200">
        <h3 className="text-xl font-bold text-forest-900">The Library is Quiet</h3>
        <p className="text-forest-600 font-serif italic">New editions are being curated. Check back soon!</p>
      </div>
    )
  }

  return (
    <div
      className="relative group/carousel"
      data-carousel
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Newsletter editions carousel"
    >
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-[70] w-12 h-12 rounded-full bg-cream-200/90 backdrop-blur-sm border border-cream-300 shadow-lg flex items-center justify-center text-christ-dark hover:bg-cream-300 hover:scale-110 transition-all duration-200 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-[70] w-12 h-12 rounded-full bg-cream-200/90 backdrop-blur-sm border border-cream-300 shadow-lg flex items-center justify-center text-christ-dark hover:bg-cream-300 hover:scale-110 transition-all duration-200 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Fog Mask Wrapper — clips horizontally but not vertically */}
      <div
        className="relative overflow-hidden"
      >
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pt-6 pb-6 px-6 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Hide scrollbar for Webkit */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Admin Add Card — always first */}
          {isAdmin && (
            <div className="flex-shrink-0" style={{ width: CARD_WIDTH }}>
              <EditionUploader
                trigger={
                  <div className="h-full cursor-pointer group/add">
                    <div className="book-card relative w-full aspect-[3/4] bg-maroon-50 rounded-r-md rounded-l-sm overflow-hidden transition-all duration-500 shadow-xl group-hover/add:shadow-2xl group-hover/add:scale-105 group-hover/add:-translate-y-2 border-2 border-dashed border-maroon-300 flex flex-col items-center justify-center gap-4 group-hover/add:bg-maroon-100/50">
                      <div className="w-16 h-16 bg-maroon-100 rounded-full flex items-center justify-center text-maroon-600 group-hover/add:scale-110 transition-transform shadow-sm">
                        <Plus size={32} />
                      </div>
                      <div className="text-center">
                        <h3 className="font-display text-xl font-bold text-maroon-800">New Edition</h3>
                        <p className="text-xs text-maroon-600 font-medium uppercase tracking-widest mt-1">Upload PDF</p>
                      </div>
                    </div>
                    {/* Metadata Spacer */}
                    <div className="mt-6 text-center opacity-0 pointer-events-none">
                      <h3 className="font-display text-xl">Spacer</h3>
                      <p className="text-xs mt-1">Spacer</p>
                    </div>
                  </div>
                }
              />
            </div>
          )}

          {/* Edition Cards */}
          {filteredEditions.map((edition: Edition) => (
            <div key={edition.id} className="flex-shrink-0" style={{ width: CARD_WIDTH }}>
              <BookCard edition={edition} isAdmin={isAdmin} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}