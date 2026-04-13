// ARCHITECTURE & WORKFLOW DIAGRAMS

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE (Browser)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐      ┌──────────────────┐                │
│  │  Login Page      │      │  Admin Panel     │                │
│  │  /login          │      │  /admin          │                │
│  │                  │      │                  │                │
│  │ - Email input    │      │ - Article form   │                │
│  │ - Password input │      │ - File upload    │                │
│  │ - Login button   │      │ - Article table  │                │
│  │                  │      │ - Status change  │                │
│  └────────┬─────────┘      └────────┬─────────┘                │
│           │                         │                           │
│           └─────────────────────────┴──────────┐                │
│                                                │                │
│  ┌──────────────────────────────────────────────┴─────┐        │
│  │        PUBLIC PAGES (No login required)            │        │
│  │                                                     │        │
│  │  ┌──────────────────────┐                         │        │
│  │  │ Articles List        │                         │        │
│  │  │ /articles            │                         │        │
│  │  │ - Browse articles    │                         │        │
│  │  │ - Filter by status   │                         │        │
│  │  │ - Download PDF       │                         │        │
│  │  └──────────┬───────────┘                         │        │
│  │             │                                     │        │
│  │  ┌──────────▼───────────┐                         │        │
│  │  │ Article Detail       │                         │        │
│  │  │ /articles/[slug]     │                         │        │
│  │  │ - Full content       │                         │        │
│  │  │ - Download button    │                         │        │
│  │  │ - Metadata display   │                         │        │
│  │  └──────────────────────┘                         │        │
│  │                                                     │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               NEXT.JS SERVER (Vercel Serverless)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │  lib/supabase.ts - Supabase Client Setup        │           │
│  │  lib/articles.ts - CRUD Functions                │           │
│  │  - createArticle()                               │           │
│  │  - updateArticle()                               │           │
│  │  - deleteArticle()                               │           │
│  │  - fetchArticles()                               │           │
│  │  - uploadFile()                                  │           │
│  │  - changeArticleStatus()                         │           │
│  │                                                  │           │
│  └──────────────────┬───────────────────────────────┘           │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │ API Calls (JSON)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend as a Service)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐                                       │
│  │ PostgreSQL Database  │                                       │
│  ├──────────────────────┤                                       │
│  │ articles table       │   (Main data)                         │
│  │ ├─ id (UUID)        │                                       │
│  │ ├─ title            │                                       │
│  │ ├─ authors          │                                       │
│  │ ├─ journal          │                                       │
│  │ ├─ abstract         │                                       │
│  │ ├─ keywords[]       │                                       │
│  │ ├─ pdf_url          │                                       │
│  │ ├─ slug             │                                       │
│  │ ├─ volume, issue    │                                       │
│  │ ├─ doi              │                                       │
│  │ ├─ status (enum)    │                                       │
│  │ ├─ created_at       │                                       │
│  │ └─ updated_at       │                                       │
│  │                     │                                       │
│  │ journals table      │   (Lookup data)                       │
│  │ ├─ id              │                                       │
│  │ ├─ name            │                                       │
│  │ ├─ slug            │                                       │
│  │ └─ description     │                                       │
│  └──────────────────────┘                                       │
│                                                                   │
│  ┌──────────────────────┐                                       │
│  │ Cloud Storage        │                                       │
│  ├──────────────────────┤                                       │
│  │ Bucket: articles     │                                       │
│  │ ├─ PDF files        │   (Public URLs)                       │
│  │ └─ DOCX files       │                                       │
│  └──────────────────────┘                                       │
│                                                                   │
│  ┌──────────────────────┐                                       │
│  │ Authentication       │                                       │
│  ├──────────────────────┤                                       │
│  │ Users & Sessions     │   (Supabase Auth)                    │
│  │ admin@example.com    │                                       │
│  │ (and more...)        │                                       │
│  └──────────────────────┘                                       │
│                                                                   │
│  ┌──────────────────────┐                                       │
│  │ Row Level Security   │                                       │
│  ├──────────────────────┤                                       │
│  │ RLS Policies:        │   (Authorization)                    │
│  │ • Public view        │                                       │
│  │   published only     │                                       │
│  │ • Admins full access │                                       │
│  └──────────────────────┘                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW DIAGRAM

```
CREATING AN ARTICLE:

Admin → Login ──────────────────────────────► Supabase Auth
              ◄──────────── Session Token ────┘
              
Admin → Submit Form
    ├─ Title: "AI Research"
    ├─ Authors: "Dr. Smith"
    ├─ Journal: "Nature"
    ├─ Abstract: "..."
    ├─ Keywords: ["AI", "ML"]
    └─ File: paper.pdf

                          ▼
                    
       lib/articles.ts
       createArticle()
       uploadFile()
                          ▼
                    
       Supabase Client API
       POST /rest/v1/articles
       POST /storage/v1/b/articles/upload
                          ▼
                    
       Supabase Backend
       ├─ Insert article row
       ├─ Upload file to bucket
       ├─ Generate public URL
       └─ Return data
                          ▼
                    
       Next.js Server
       ├─ Receive response
       ├─ Update local state
       └─ Show success message
                          ▼
                    
       Admin Page
       ├─ Add article to table
       ├─ Reset form
       └─ Show confirmation


PUBLISHING AN ARTICLE:

Admin → Change Status Dropdown "draft" → "published"
                          ▼
              lib/articles.ts
              updateArticle()
                          ▼
              Supabase: UPDATE articles
              SET status = 'published'
                          ▼
              Database Updated
                          ▼
              RLS Policy Activates
              (Article now visible to public)
                          ▼
              Public User → /articles
              ├─ See published article
              ├─ Click to view details
              └─ Download PDF


VIEWING AN ARTICLE (Public):

Public User → /articles
              ▼
        lib/articles.ts
        fetchArticles({ status: 'published' })
              ▼
        Supabase Query:
        SELECT * FROM articles
        WHERE status = 'published'
        ORDER BY created_at DESC
              ▼
        Database returns data
        (RLS allows: status = 'published')
              ▼
        6-articles-page.tsx
        ├─ Loop through articles
        ├─ Render article cards
        ├─ Show download buttons
        └─ Display in grid
              ▼
        User sees articles on /articles
        
        User clicks article title
              ▼
        Navigate to /articles/[slug]
              ▼
        lib/articles.ts
        fetchArticleBySlug(slug)
              ▼
        Supabase Query:
        SELECT * FROM articles
        WHERE slug = 'article-slug'
              ▼
        7-article-detail-page.tsx
        ├─ Display full content
        ├─ Show all metadata
        ├─ Provide download link
        └─ Show publication date
              ▼
        User views article details
        User downloads PDF (from cloud storage)
```

---

## 🔐 SECURITY FLOW

```
LOGIN PROCESS:

┌─────────────────────────────────────────────┐
│ Admin enters email & password               │
│ admin@example.com / password123             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌──────────────────────┐
         │ Supabase Auth        │
         │ signInWithPassword() │
         └────────┬─────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
      Valid              Invalid
        │                    │
        ▼                    ▼
    ┌────────────┐    ┌──────────────┐
    │ Create     │    │ Show error   │
    │ session    │    │ Try again    │
    │ Store      │    └──────────────┘
    │ token      │
    └────┬───────┘
         │
         ▼
    ┌──────────────────────────┐
    │ Redirect to /admin       │
    │ With session token       │
    └──────────────────────────┘


ROW LEVEL SECURITY (RLS):

When anyone queries articles table:

┌────────────────────────────────┐
│ Is user authenticated?         │
│ (Has valid Supabase token)     │
└────┬─────────────┬─────────────┘
     │ No          │ Yes
     ▼             ▼
  ┌──────────┐  ┌─────────────────────┐
  │ Anon     │  │ Authenticated User   │
  │ User     │  │ (Admin)              │
  └────┬─────┘  └──────────┬──────────┘
       │                   │
       │ Can see:          │ Can see:
       │ - Published       │ - Published
       │   articles only   │ - Draft
       │                   │ - Submitted
       │ Cannot see:       │ - Accepted
       │ - Drafts          │ - All own articles
       │ - Hidden articles │
       │                   │
       └─────────┬─────────┘
                 │
          ┌──────▼──────┐
          │ Query results│
          │ filtered by  │
          │ RLS policies │
          └─────────────┘


FILE UPLOAD SECURITY:

Upload Request
    │
    ├─ Check file type
    │  ✓ PDF ✓ DOCX ✗ Other
    │
    ├─ Check file size
    │  ✓ < 50MB ✗ Too large
    │
    ├─ Check authentication
    │  ✓ Authenticated ✗ Anonymous
    │
    ├─ Generate unique path
    │  /articles/{articleId}/{timestamp}-{filename}
    │
    └─► Upload to storage bucket
        
        Storage Bucket Policies:
        ├─ Public read: Anyone can download
        └─ Authenticated write: Only admins upload
```

---

## 📱 COMPONENT HIERARCHY

```
Next.js App
│
├─ /login
│  └─ LoginPage
│     ├─ Email input
│     ├─ Password input
│     └─ Login button → Supabase Auth
│
├─ /admin (Protected)
│  └─ AdminPage
│     ├─ Header
│     │  └─ Logout button
│     ├─ Left: Article Form
│     │  ├─ Title input
│     │  ├─ Authors input
│     │  ├─ Journal select
│     │  ├─ Abstract textarea
│     │  ├─ Keywords input
│     │  ├─ Volume/Issue input
│     │  ├─ DOI input
│     │  ├─ File upload
│     │  └─ Add/Update button
│     └─ Right: Articles Table
│        ├─ Search bar (optional)
│        ├─ Table header
│        ├─ Table rows
│        │  ├─ Title
│        │  ├─ Journal
│        │  ├─ Status (dropdown)
│        │  └─ Actions (Edit/Delete)
│        └─ Pagination (optional)
│
├─ /articles (Public)
│  └─ ArticlesPage
│     ├─ Header
│     ├─ Filter buttons
│     │  ├─ Published
│     │  ├─ Accepted
│     │  └─ All
│     ├─ Articles Grid
│     │  └─ ArticleCard (repeating)
│     │     ├─ Title
│     │     ├─ Authors
│     │     ├─ Journal
│     │     ├─ Keywords (tags)
│     │     ├─ Download button
│     │     └─ View details link
│     └─ Empty state (if no articles)
│
└─ /articles/[slug] (Public)
   └─ ArticleDetailPage
      ├─ Back link
      ├─ Title
      ├─ Metadata grid
      │  ├─ Authors
      │  ├─ Journal
      │  ├─ Volume/Issue
      │  └─ DOI (link)
      ├─ Status badge
      ├─ Abstract section
      ├─ Keywords tags
      ├─ Download section
      ├─ Publication dates
      └─ Back to articles button


Data Flow Between Components:

AdminPage
  ├─ State: articles[], formData, editingArticle
  ├─ fetch: loadData() → fetchArticles()
  ├─ submit: handleSubmit() → createArticle() / updateArticle()
  ├─ delete: handleDelete() → deleteArticle()
  ├─ upload: handleSubmit() → uploadFile()
  └─ Renders: ArticleForm + ArticleTable

ArticlesPage
  ├─ State: articles[], filter
  ├─ fetch: loadArticles() → fetchArticles(filter)
  ├─ Renders: ArticleCard (repeating)

ArticleDetailPage
  ├─ State: article
  ├─ fetch: loadArticle() → fetchArticleBySlug()
  └─ Renders: Article content
```

---

## 🗂️ FILE ORGANIZATION

```
Next.js Project
│
├─ app/
│  ├─ layout.tsx (global layout, Tailwind setup)
│  ├─ page.tsx (home page)
│  ├─ globals.css (Tailwind CSS)
│  │
│  ├─ login/
│  │  └─ page.tsx (05-login-page.tsx)
│  │     Component: LoginPage
│  │     Route: /login
│  │     Purpose: Admin authentication
│  │
│  ├─ admin/
│  │  └─ page.tsx (04-admin-page.tsx)
│  │     Component: AdminPage
│  │     Route: /admin
│  │     Purpose: Article management
│  │
│  └─ articles/
│     ├─ page.tsx (06-articles-page.tsx)
│     │  Component: ArticlesPage
│     │  Route: /articles
│     │  Purpose: List all published articles
│     │
│     └─ [slug]/
│        └─ page.tsx (07-article-detail-page.tsx)
│           Component: ArticleDetailPage
│           Route: /articles/[slug]
│           Purpose: View single article
│
├─ lib/
│  ├─ supabase.ts (02-supabase-client.ts)
│  │  ├─ createClient() - Browser client
│  │  └─ createServerSupabaseClient() - Server client
│  │
│  └─ articles.ts (03-articles-lib.ts)
│     ├─ Article (type)
│     ├─ generateSlug()
│     ├─ createArticle()
│     ├─ updateArticle()
│     ├─ deleteArticle()
│     ├─ fetchArticles()
│     ├─ fetchArticleById()
│     ├─ fetchArticleBySlug()
│     ├─ uploadFile()
│     ├─ deleteFile()
│     ├─ fetchJournals()
│     └─ changeArticleStatus()
│
├─ middleware.ts (optional)
│  └─ Protect /admin routes
│
├─ .env.local
│  ├─ NEXT_PUBLIC_SUPABASE_URL
│  └─ NEXT_PUBLIC_SUPABASE_ANON_KEY
│
├─ next.config.js
├─ tailwind.config.js
├─ tsconfig.json
├─ package.json
└─ README.md
```

---

## 🔄 STATUS WORKFLOW

```
Article Status Lifecycle:

┌──────────┐
│ DRAFT    │  (Initial state)
└─────┬────┘  
      │ Admin reviews & approves
      ▼
┌──────────────┐
│ SUBMITTED    │  (Under review)
└─────┬────────┘
      │ Peer review complete
      ▼
┌──────────────┐
│ ACCEPTED     │  (Approved)
└─────┬────────┘
      │ Admin publishes
      ▼
┌──────────────┐
│ PUBLISHED    │  (Live on site!)
└──────────────┘


Status Visibility:

┌─────────────┬──────────┬──────────┬─────────────┐
│ Status      │ In Admin │ In Table │ In Public   │
├─────────────┼──────────┼──────────┼─────────────┤
│ DRAFT       │ ✓        │ ✓        │ ✗           │
│ SUBMITTED   │ ✓        │ ✓        │ ✗           │
│ ACCEPTED    │ ✓        │ ✓        │ ✗           │
│ PUBLISHED   │ ✓        │ ✓        │ ✓ (PUBLIC) │
└─────────────┴──────────┴──────────┴─────────────┘
```

---

Good luck building! 🚀
