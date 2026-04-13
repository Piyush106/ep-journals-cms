// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  createArticle,
  deleteArticle,
  fetchArticles,
  updateArticle,
  uploadFile,
  fetchJournals,
  Article,
} from '@/lib/articles'
import { useRouter } from 'next/navigation'

type EditingArticle = Partial<Article> | null

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [articles, setArticles] = useState<Article[]>([])
  const [journals, setJournals] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingArticle, setEditingArticle] = useState<EditingArticle>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    journal: '',
    abstract: '',
    keywords: '',
    volume: '',
    issue: '',
    doi: '',
  })
  const [file, setFile] = useState<File | null>(null)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    await loadData()
  }

  async function loadData() {
    try {
      setLoading(true)
      const [articlesData, journalsData] = await Promise.all([
        fetchArticles(supabase),
        fetchJournals(supabase),
      ])
      setArticles(articlesData)
      setJournals(journalsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      authors: '',
      journal: '',
      abstract: '',
      keywords: '',
      volume: '',
      issue: '',
      doi: '',
    })
    setFile(null)
    setEditingArticle(null)
  }

  function handleEditClick(article: Article) {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      authors: article.authors,
      journal: article.journal,
      abstract: article.abstract || '',
      keywords: article.keywords.join(', '),
      volume: article.volume?.toString() || '',
      issue: article.issue?.toString() || '',
      doi: article.doi || '',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setUploading(true)

      // Prepare data
      const articleData = {
        title: formData.title,
        authors: formData.authors,
        journal: formData.journal,
        abstract: formData.abstract,
        keywords: formData.keywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k),
        volume: formData.volume ? parseInt(formData.volume) : null,
        issue: formData.issue ? parseInt(formData.issue) : null,
        doi: formData.doi || null,
        status: 'draft' as const,
        pdf_url: editingArticle?.pdf_url || null,
        slug: null,
      }

      // Upload file if provided
      if (file && !editingArticle) {
        // For new articles, create first to get ID
        const tempArticle = await createArticle(supabase, articleData)
        const url = await uploadFile(supabase, file, tempArticle.id)
        await updateArticle(supabase, tempArticle.id, { pdf_url: url })
      } else if (editingArticle) {
        // Update existing article
        if (file) {
          const url = await uploadFile(supabase, file, editingArticle.id)
          articleData.pdf_url = url
        }
        await updateArticle(supabase, editingArticle.id, articleData)
      } else {
        // Create new article without file
        await createArticle(supabase, articleData)
      }

      // Reload data
      await loadData()
      resetForm()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      await deleteArticle(supabase, id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article')
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateArticle(supabase, id, {
        status: newStatus as 'draft' | 'submitted' | 'accepted' | 'published',
      })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">EP Journals Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingArticle ? 'Edit Article' : 'Add New Article'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Article title"
                  />
                </div>

                {/* Authors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authors *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authors}
                    onChange={(e) =>
                      setFormData({ ...formData, authors: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. John Doe, Jane Smith"
                  />
                </div>

                {/* Journal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Journal *
                  </label>
                  <select
                    required
                    value={formData.journal}
                    onChange={(e) =>
                      setFormData({ ...formData, journal: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select journal</option>
                    {journals.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Abstract */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abstract
                  </label>
                  <textarea
                    value={formData.abstract}
                    onChange={(e) =>
                      setFormData({ ...formData, abstract: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Article abstract"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) =>
                      setFormData({ ...formData, keywords: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma-separated keywords"
                  />
                </div>

                {/* Volume & Issue */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume
                    </label>
                    <input
                      type="number"
                      value={formData.volume}
                      onChange={(e) =>
                        setFormData({ ...formData, volume: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Vol"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue
                    </label>
                    <input
                      type="number"
                      value={formData.issue}
                      onChange={(e) =>
                        setFormData({ ...formData, issue: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Issue"
                    />
                  </div>
                </div>

                {/* DOI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DOI
                  </label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) =>
                      setFormData({ ...formData, doi: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10.1234/example"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PDF/DOCX File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] || null)
                    }
                    className="w-full text-sm"
                  />
                  {file && (
                    <p className="mt-1 text-xs text-gray-600">
                      Selected: {file.name}
                    </p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {uploading ? 'Saving...' : editingArticle ? 'Update' : 'Add'}
                  </button>
                  {editingArticle && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Articles List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Articles ({articles.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Journal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate font-medium">
                            {article.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {article.authors}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {article.journal}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={article.status}
                            onChange={(e) =>
                              handleStatusChange(article.id, e.target.value)
                            }
                            className={`px-2 py-1 rounded text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              article.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : article.status === 'accepted'
                                  ? 'bg-blue-100 text-blue-800'
                                  : article.status === 'submitted'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="accepted">Accepted</option>
                            <option value="published">Published</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEditClick(article)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {articles.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  <p>No articles yet. Create your first article!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
