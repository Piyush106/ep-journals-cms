// app/articles/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { fetchArticles, Article } from '@/lib/articles'
import Link from 'next/link'

export default function ArticlesPage() {
  const supabase = createClient()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('published')

  useEffect(() => {
    loadArticles()
  }, [filter])

  async function loadArticles() {
    try {
      setLoading(true)
      const data = await fetchArticles(supabase, {
        status: filter === 'all' ? undefined : filter,
      })
      setArticles(data)
    } catch (err) {
      console.error('Failed to load articles:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Articles</h1>
          <p className="text-lg text-gray-600 mt-2">
            Latest research from EP Journals Group
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 flex gap-4">
          {['published', 'accepted', 'all'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No articles found in this category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {article.title}
                </h2>

                {/* Authors & Journal */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <span>
                    <strong>Authors:</strong> {article.authors}
                  </span>
                  <span>
                    <strong>Journal:</strong> {article.journal}
                  </span>
                  {article.volume && (
                    <span>
                      <strong>Vol:</strong> {article.volume}
                    </span>
                  )}
                  {article.issue && (
                    <span>
                      <strong>Issue:</strong> {article.issue}
                    </span>
                  )}
                </div>

                {/* DOI */}
                {article.doi && (
                  <div className="mb-4 text-sm">
                    <strong>DOI:</strong>{' '}
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

                {/* Abstract */}
                {article.abstract && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Abstract
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {article.abstract}
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {article.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Published:{' '}
                    {new Date(article.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {article.pdf_url && (
                      <a
                        href={article.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                      >
                        Download PDF
                      </a>
                    )}
                    <Link
                      href={`/articles/${article.slug}`}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
