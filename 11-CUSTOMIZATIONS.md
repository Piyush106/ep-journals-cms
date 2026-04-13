// CUSTOMIZATION & EXTENSION GUIDE

This guide shows how to extend the basic system with common features.

---

## 🎨 UI CUSTOMIZATIONS

### 1. Change Logo & Branding

**In app/admin/page.tsx - Header section:**
```tsx
<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    {/* OLD: <h1 className="text-2xl font-bold text-gray-900">EP Journals Admin</h1> */}
    
    {/* NEW: Add logo */}
    <div className="flex items-center gap-3">
      <img src="/logo.png" alt="Logo" className="h-8 w-8" />
      <h1 className="text-2xl font-bold text-blue-600">Your Journal Name</h1>
    </div>
    
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
    >
      Logout
    </button>
  </div>
</header>
```

### 2. Change Color Scheme

**Update Tailwind colors throughout:**
```tsx
// OLD: bg-blue-600 (blue)
// NEW: bg-indigo-600 (indigo)
// Or: bg-purple-600, bg-teal-600, etc.

// All available colors:
// slate, gray, zinc, neutral, stone, red, orange, amber, yellow,
// lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

// Example: Change primary color from blue to purple
const oldClass = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
const newClass = "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"

// Find & replace all blue-* to purple-* throughout components
```

### 3. Customize Journal List

**In 01-schema.sql:**
```sql
-- Current journals
INSERT INTO journals (name, slug, description) VALUES
  ('Nature Research', 'nature-research', 'Leading international scientific journal'),
  ('Science Direct', 'science-direct', 'Multidisciplinary research platform'),
  ('IEEE Transactions', 'ieee-transactions', 'Engineering and technology research');

-- REPLACE WITH YOUR JOURNALS:
INSERT INTO journals (name, slug, description) VALUES
  ('Your Journal 1', 'your-journal-1', 'Description'),
  ('Your Journal 2', 'your-journal-2', 'Description'),
  ('Your Journal 3', 'your-journal-3', 'Description');
```

### 4. Add Footer to All Pages

**Create app/components/Footer.tsx:**
```tsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <p className="text-gray-400">EP Journals Group</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/articles">Articles</a></li>
              <li><a href="/">Home</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <p className="text-gray-400">contact@epjournals.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-gray-400 text-sm">
          <p>&copy; 2024 EP Journals Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
```

**Use in pages:**
```tsx
import Footer from '@/app/components/Footer'

export default function ArticlesPage() {
  // ... existing code ...
  
  return (
    <div>
      {/* existing content */}
      <Footer />
    </div>
  )
}
```

---

## 📊 DATABASE EXTENSIONS

### 1. Add Author Profiles

**Add to 01-schema.sql:**
```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  institution TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE article_authors (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  author_order INTEGER,
  PRIMARY KEY (article_id, author_id)
);

CREATE INDEX idx_article_authors_article ON article_authors(article_id);
```

**Update Articles query:**
```typescript
// In lib/articles.ts
export async function fetchArticleWithAuthors(supabase, id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*, article_authors(order, authors(*))')
    .eq('id', id)
    .single()
    
  return data
}
```

### 2. Add Categories

**Add to 01-schema.sql:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT
);

ALTER TABLE articles ADD COLUMN category_id UUID REFERENCES categories(id);

INSERT INTO categories (name, slug, description) VALUES
  ('Computer Science', 'computer-science', 'CS research'),
  ('Medicine', 'medicine', 'Medical research'),
  ('Physics', 'physics', 'Physics research');
```

### 3. Add Article Reviews

**Add to 01-schema.sql:**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'rejected')),
  comments TEXT,
  recommendation TEXT CHECK (recommendation IN ('accept', 'minor_revision', 'major_revision', 'reject')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reviews_article ON reviews(article_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
```

### 4. Add Article Tags

**Add to 01-schema.sql:**
```sql
-- Already have keywords[] array, but can enhance with tags table

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE
);

CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Or just use the keywords[] array that's already there!
```

---

## 🔍 FEATURE ADDITIONS

### 1. Add Search Functionality

**In lib/articles.ts:**
```typescript
export async function searchArticles(
  supabase: SupabaseClient,
  query: string,
  filters?: { status?: string; journal?: string }
) {
  let q = supabase
    .from('articles')
    .select('*')
    .or(`title.ilike.%${query}%,abstract.ilike.%${query}%,authors.ilike.%${query}%`)

  if (filters?.status) {
    q = q.eq('status', filters.status)
  }

  if (filters?.journal) {
    q = q.eq('journal', filters.journal)
  }

  const { data, error } = await q

  if (error) throw new Error(`Search failed: ${error.message}`)
  return (data as Article[]) || []
}
```

**Use in ArticlesPage:**
```tsx
const [searchQuery, setSearchQuery] = useState('')

async function handleSearch(e: React.FormEvent) {
  e.preventDefault()
  const results = await searchArticles(supabase, searchQuery, { status: filter })
  setArticles(results)
}

return (
  <form onSubmit={handleSearch} className="mb-6">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search articles..."
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
    <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
      Search
    </button>
  </form>
)
```

### 2. Add Pagination

**In lib/articles.ts:**
```typescript
export async function fetchArticlesPage(
  supabase: SupabaseClient,
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize

  const { data, count, error } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw new Error(`Failed to fetch articles: ${error.message}`)

  return {
    articles: (data as Article[]) || [],
    total: count || 0,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  }
}
```

### 3. Add Export to BibTeX

**Create lib/bibtex.ts:**
```typescript
import { Article } from './articles'

export function generateBibTeX(article: Article): string {
  const key = article.slug || article.id.slice(0, 8)
  
  return `@article{${key},
  title = {${article.title}},
  author = {${article.authors}},
  journal = {${article.journal}},
  year = {${new Date(article.created_at).getFullYear()}},
  ${article.volume ? `volume = {${article.volume}},` : ''}
  ${article.issue ? `number = {${article.issue}},` : ''}
  ${article.doi ? `doi = {${article.doi}},` : ''}
  ${article.abstract ? `abstract = {${article.abstract}},` : ''}
}`
}

export function downloadBibTeX(article: Article) {
  const bibtex = generateBibTeX(article)
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(bibtex))
  element.setAttribute('download', `${article.slug}.bib`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
```

**Use in article detail page:**
```tsx
import { downloadBibTeX } from '@/lib/bibtex'

export default function ArticleDetailPage() {
  // ... existing code ...
  
  return (
    // ... existing content ...
    <button
      onClick={() => downloadBibTeX(article)}
      className="px-4 py-2 bg-green-600 text-white rounded"
    >
      📋 Export BibTeX
    </button>
  )
}
```

### 4. Add Email Notifications

**Install Resend:**
```bash
npm install resend
```

**Create lib/email.ts:**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendArticleNotification(
  email: string,
  article: {
    title: string
    authors: string
    journal: string
  }
) {
  await resend.emails.send({
    from: 'noreply@epjournals.com',
    to: email,
    subject: `New Article: ${article.title}`,
    html: `
      <h1>New Article Published</h1>
      <p><strong>${article.title}</strong></p>
      <p>By: ${article.authors}</p>
      <p>Journal: ${article.journal}</p>
    `,
  })
}
```

### 5. Add Comments Section

**Add to 01-schema.sql:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_article ON comments(article_id);
```

---

## 🔐 SECURITY ENHANCEMENTS

### 1. Add Rate Limiting

**Create lib/rateLimit.ts:**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
})
```

### 2. Add Virus Scanning for Uploads

**Update uploadFile in lib/articles.ts:**
```typescript
async function scanFileWithClamAV(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('https://your-clamav-api.com/scan', {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()
  return result.clean === true
}

export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  articleId: string
): Promise<string> {
  // Existing validation...
  
  // NEW: Scan for viruses
  const isClean = await scanFileWithClamAV(file)
  if (!isClean) {
    throw new Error('File failed security scan')
  }

  // ... rest of upload logic
}
```

### 3. Add CORS Headers

**In next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## 📈 ANALYTICS

### 1. Add Google Analytics

**Add to app/layout.tsx:**
```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Other head content */}
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 2. Track Article Views

**In lib/articles.ts:**
```typescript
export async function trackArticleView(
  supabase: SupabaseClient,
  articleId: string
) {
  const { error } = await supabase
    .from('article_views')
    .insert([
      {
        article_id: articleId,
        viewed_at: new Date(),
        ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip),
      },
    ])

  if (error) console.error('Failed to track view:', error)
}
```

---

## 🎯 ADMIN FEATURES

### 1. Add Bulk Upload

**Create app/admin/bulk-upload/page.tsx:**
```tsx
'use client'

import { useState } from 'react'
import Papa from 'papaparse'

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleBulkUpload() {
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        setUploading(true)
        // Process each row and create articles
        // results.data contains array of articles
        setUploading(false)
      },
    })
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bulk Upload</h1>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleBulkUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  )
}
```

### 2. Add Analytics Dashboard

**Create app/admin/analytics/page.tsx:**
```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AnalyticsPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { count: totalArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })

    const { count: publishedArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    // Add more metrics as needed
    setStats({
      totalArticles: totalArticles || 0,
      publishedArticles: publishedArticles || 0,
      totalViews: 0,
    })
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card title="Total Articles" value={stats.totalArticles} />
        <Card title="Published" value={stats.publishedArticles} />
        <Card title="Total Views" value={stats.totalViews} />
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
```

---

## 🧪 TESTING EXAMPLES

### 1. Test Article Creation

**Create lib/articles.test.ts:**
```typescript
import { createArticle, fetchArticles } from './articles'
import { createClient } from './supabase'

describe('Articles', () => {
  const supabase = createClient()

  it('should create an article', async () => {
    const article = await createArticle(supabase, {
      title: 'Test Article',
      authors: 'Test Author',
      journal: 'Test Journal',
      abstract: 'Test abstract',
      keywords: ['test'],
      status: 'draft',
      pdf_url: null,
      slug: null,
    })

    expect(article.id).toBeDefined()
    expect(article.title).toBe('Test Article')
  })

  it('should fetch articles', async () => {
    const articles = await fetchArticles(supabase)
    expect(Array.isArray(articles)).toBe(true)
  })
})
```

---

These are common extensions. You can implement any combination based on your needs!

Good luck! 🚀
