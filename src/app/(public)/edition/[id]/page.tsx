import { createServerClient } from '@/lib/supabase-server'
import PageFlip from '@/components/PageFlip'
import { notFound } from 'next/navigation'
import InlineEditionControls from '@/components/admin/InlineEditionControls'

// Force dynamic rendering so we always get the latest data
export const dynamic = 'force-dynamic'

interface Props {
  params: {
    id: string
  }
}

export default async function ReaderPage(props: Props) {
  const params = await props.params
  const supabase = await createServerClient()
  const { id } = params

  // 1. Fetch the Edition details
  const { data: edition } = await supabase
    .from('editions')
    .select('*')
    .eq('id', id)
    .single()

  if (!edition) {
    notFound()
  }

  // Fetch user profile for admin check
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // 2. Fetch all Articles for this edition, sorted by page number
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('edition_id', id)
    .order('page_number', { ascending: true })

  // 3. Handle empty editions (only if no articles AND no PDF)
  if ((!articles || articles.length === 0) && !edition.pdf_url) {
    return (
      <div className="min-h-screen bg-cream-50 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <InlineEditionControls editionId={id} />
          <div className="flex flex-col items-center justify-center text-center p-12">
            <h1 className="text-2xl font-bold text-forest-900 mb-2">{edition.title}</h1>
            <p className="text-forest-600">This edition has no articles yet.</p>
            <a href="/" className="mt-4 text-maroon-600 hover:underline">← Return to Library</a>
          </div>
        </div>
      </div>
    )
  }

  // 4. Render the PageFlip component
  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <InlineEditionControls editionId={id} />
        <div className="py-8">
          <PageFlip
            articles={articles || []}
            editionTitle={edition.title}
            editionPdfUrl={edition.pdf_url}
            editionId={id}
            isAdmin={profile?.role === 'admin'}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}