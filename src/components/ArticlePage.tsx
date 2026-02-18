import { Article } from '@/lib/types'
import { forwardRef } from 'react'

interface ArticlePageProps {
  article: Article
  totalPageCount: number
}

const ArticlePage = forwardRef<HTMLDivElement, ArticlePageProps>(({ article }, ref) => {
  return (
    <div ref={ref} className="w-full h-full bg-cream-50 text-forest-900 p-2 md:p-3 shadow-inner overflow-hidden flex flex-col items-center">
      {/* Content Area - Text Only */}
      <div className="flex-grow w-full relative flex items-center justify-center overflow-hidden bg-white shadow-sm border border-cream-200">
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 flex flex-col">
          {/* Header Info */}
          <div className="mb-4 border-b border-forest-100 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-forest-500 font-bold block mb-1">
              {article.department || 'Christ University'}
            </span>
            <h1 className="font-display text-2xl font-bold text-forest-900 leading-tight">
              {article.title}
            </h1>
            <p className="text-xs text-forest-600 font-serif italic mt-1">
              By {article.author}
            </p>
          </div>

          <div className="prose prose-sm prose-forest font-serif leading-relaxed text-justify">
            {article.content || article.short_description || 'No content provided.'}
          </div>
        </div>
      </div>

      {/* Footer Page Number */}
      <div className="mt-2 text-[10px] text-forest-400 font-serif font-medium tracking-wide">
        Page {article.page_number}
      </div>
    </div>
  )
})

ArticlePage.displayName = 'ArticlePage'

export default ArticlePage