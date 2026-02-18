import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeleteArticleButton from '@/components/admin/DeleteArticleButton'

export const dynamic = 'force-dynamic'

export default async function EditionManager(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createServerClient()

  // 1. Fetch Edition Details
  const { data: edition } = await supabase
    .from('editions')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!edition) notFound()

  // 2. Fetch Articles for this Edition
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('edition_id', params.id)
    .order('page_number', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8 border-b border-forest-200 pb-4">
        <Link href="/admin" className="text-forest-600 hover:text-maroon-600 text-sm mb-2 block">
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-3xl font-bold text-forest-900">
              {edition.title}
            </h1>
            <p className="text-forest-600">Vol. {edition.edition_number} • Managing Articles</p>
          </div>
          <Link
            href={`/admin/editions/${edition.id}/articles/new`}
            className="bg-forest-700 text-white px-4 py-2 rounded shadow hover:bg-forest-800 transition-colors"
          >
            + Add Article
          </Link>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow border border-cream-300 overflow-hidden">
        {(!articles || articles.length === 0) ? (
          <div className="p-12 text-center">
            <p className="text-forest-500 mb-4">No articles in this edition yet.</p>
            <p className="text-sm text-forest-400">Click &quot;+ Add Article&quot; to add the first page.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-cream-200">
            <thead className="bg-cream-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase">Author</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-forest-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-cream-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-forest-900">
                    {article.page_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-forest-700 font-medium">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-600 italic">
                    {article.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center">
                    <Link
                      href={`/admin/editions/${params.id}/articles/${article.id}`}
                      className="text-forest-600 hover:text-maroon-600 font-bold"
                    >
                      Edit
                    </Link>
                    <DeleteArticleButton articleId={article.id} editionId={params.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div >
  )
}