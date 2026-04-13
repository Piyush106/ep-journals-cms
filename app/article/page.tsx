// app/articles/[slug]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { fetchArticleBySlug, Article } from '@/lib/articles'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadArticle()
  }, [slug])

  async function loadArticle() {
    try {
      setLoading(true)
      const data = await fetchArticleBySlug(supabase, slug)
      setArticle(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Article Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/articles"
              className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
            >
              Back to Articles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/articles"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Articles
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">
            {article.title}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Metadata */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Authors
                </h3>
                <p className="text-gray-900">{article.authors}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Journal
                </h3>
                <p className="text-gray-900">{article.journal}</p>
              </div>
              {article.volume && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Volume
                  </h3>
                  <p className="text-gray-900">{article.volume}</p>
                </div>
              )}
              {article.issue && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Issue
                  </h3>
                  <p className="text-gray-900">{article.issue}</p>
                </div>
              )}
              {article.doi && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    DOI
                  </h3>
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {article.doi}
                  </a>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  article.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : article.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : article.status === 'submitted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Abstract */}
          {article.abstract && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Abstract</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.abstract}
              </p>
            </div>
          )}

          {/* Keywords */}
          {article.keywords.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Download Section */}
          {article.pdf_url && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Download Article</h3>
              <p className="text-gray-700 text-sm mb-4">
                Access the full article in PDF format.
              </p>
              <a
                href={article.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
              >
                📥 Download PDF
              </a>
            </div>
          )}

          {/* Publication Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-600">
            <p>
              Published: {new Date(article.created_at).toLocaleDateString()}
            </p>
            <p className="mt-1">
              Last updated: {new Date(article.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Related Articles Placeholder */}
        <div className="mt-16 text-center">
          <Link
            href="/articles"
            className="inline-block px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition"
          >
            View All Articles
          </Link>
        </div>
      </main>
    </div>
  )
}
