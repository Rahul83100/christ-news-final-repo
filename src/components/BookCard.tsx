import Link from 'next/link'
import { Edition } from '@/lib/types'
import DeleteEditionButton from './admin/DeleteEditionButton'

interface BookCardProps {
  edition: Edition
  isAdmin?: boolean
}

export default function BookCard({ edition, isAdmin }: BookCardProps) {
  return (
    <div className="relative group">
      {/* Admin Delete Icon — always visible on hover, above everything */}
      {isAdmin && (
        <div className="absolute -top-2 -right-2 z-[60] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DeleteEditionButton editionId={edition.id} />
        </div>
      )}

      <Link href={`/edition/${edition.id}`} className="block">
        {/* Book Cover — pops outward on hover */}
        <div className="book-card relative w-full aspect-[3/4] bg-white rounded-r-md rounded-l-sm overflow-hidden transition-all duration-500 shadow-xl group-hover:shadow-2xl group-hover:scale-105 group-hover:-translate-y-2" style={{ transformStyle: 'preserve-3d' }}>
          {/* Book Spine Shadow/Gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-20 book-spine opacity-80" />

          {/* Cover Image or Placeholder */}
          {edition.cover_image_url ? (
            <img
              src={edition.cover_image_url}
              alt={edition.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full bg-forest-800 flex flex-col items-center justify-center p-6 text-center border-l-4 border-forest-900">
              <div className="border-2 border-forest-600 p-4 w-full h-full flex flex-col items-center justify-center">
                <span className="font-display text-4xl text-cream-200 mb-2">
                  Vol. {edition.edition_number}
                </span>
                <h3 className="font-serif text-cream-100 text-lg leading-tight">
                  {edition.title}
                </h3>
              </div>
            </div>
          )}

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-maroon-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Book Metadata below the card */}
        <div className="mt-6 text-center">
          <h3 className="font-black text-forest-950 font-display text-xl uppercase tracking-tighter truncate px-2 group-hover:text-maroon-700 transition-colors">
            {edition.title}
          </h3>
          <p className="text-xs font-bold text-forest-500 uppercase tracking-widest mt-1">
            {new Date(edition.release_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
          {edition.subtitle && (
            <p className="text-xs font-serif text-forest-600 mt-2 italic max-w-xs mx-auto line-clamp-2">
              {edition.subtitle}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}