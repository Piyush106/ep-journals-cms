// lib/articles.ts
import { createClient } from './supabase'
import { SupabaseClient } from '@supabase/supabase-js'

export type Article = {
  id: string
  title: string
  authors: string
  journal: string
  abstract: string | null
  keywords: string[]
  pdf_url: string | null
  slug: string | null
  volume: number | null
  issue: number | null
  doi: string | null
  status: 'draft' | 'submitted' | 'accepted' | 'published'
  created_at: string
  updated_at: string
}

type ArticleInput = Omit<Article, 'id' | 'created_at' | 'updated_at'>

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Create a new article
 */
export async function createArticle(
  supabase: SupabaseClient,
  data: Omit<ArticleInput, 'slug'> & { slug?: string }
) {
  const slug = data.slug || generateSlug(data.title)

  const { data: article, error } = await supabase
    .from('articles')
    .insert([
      {
        ...data,
        slug,
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create article: ${error.message}`)
  return article as Article
}

/**
 * Update an existing article
 */
export async function updateArticle(
  supabase: SupabaseClient,
  id: string,
  data: Partial<ArticleInput>
) {
  const updateData: any = { ...data }

  // Generate slug if title changed
  if (data.title) {
    updateData.slug = generateSlug(data.title)
  }

  const { data: article, error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update article: ${error.message}`)
  return article as Article
}

/**
 * Delete an article
 */
export async function deleteArticle(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('articles').delete().eq('id', id)

  if (error) throw new Error(`Failed to delete article: ${error.message}`)
}

/**
 * Fetch all articles with optional filtering
 */
export async function fetchArticles(
  supabase: SupabaseClient,
  filters?: {
    status?: string
    journal?: string
    limit?: number
    offset?: number
  }
) {
  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.journal) {
    query = query.eq('journal', filters.journal)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 10) - 1
    )
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch articles: ${error.message}`)
  return (data as Article[]) || []
}

/**
 * Fetch a single article by ID
 */
export async function fetchArticleById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch article: ${error.message}`)
  return data as Article
}

/**
 * Fetch article by slug (for public pages)
 */
export async function fetchArticleBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw new Error(`Failed to fetch article: ${error.message}`)
  return data as Article
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  articleId: string
): Promise<string> {
  // Validate file type
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF and DOCX files are allowed')
  }

  // Validate file size (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File size must be less than 50MB')
  }

  const timestamp = Date.now()
  const fileName = `${articleId}/${timestamp}-${file.name}`

  const { data, error } = await supabase.storage
    .from('articles')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error(`Failed to upload file: ${error.message}`)

  // Get public URL
  const { data: publicUrl } = supabase.storage
    .from('articles')
    .getPublicUrl(data.path)

  return publicUrl.publicUrl
}

/**
 * Delete file from storage
 */
export async function deleteFile(supabase: SupabaseClient, filePath: string) {
  const { error } = await supabase.storage.from('articles').remove([filePath])

  if (error) throw new Error(`Failed to delete file: ${error.message}`)
}

/**
 * Get all unique journals
 */
export async function fetchJournals(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('journals')
    .select('name')
    .order('name')

  if (error) throw new Error(`Failed to fetch journals: ${error.message}`)
  return (data as { name: string }[]).map((j) => j.name)
}

/**
 * Change article status
 */
export async function changeArticleStatus(
  supabase: SupabaseClient,
  id: string,
  status: 'draft' | 'submitted' | 'accepted' | 'published'
) {
  return updateArticle(supabase, id, { status })
}
