// COMPLETE IMPLEMENTATION CHECKLIST - EP Journals Group

## ✅ PHASE 1: SUPABASE SETUP (30 mins)

### Database
- [ ] Create Supabase project
- [ ] Go to SQL Editor
- [ ] Paste entire `01-schema.sql` content
- [ ] Run SQL query
- [ ] Verify tables created:
  - [ ] articles table exists
  - [ ] journals table populated with 3 default journals
  - [ ] Indexes created
  - [ ] Triggers working (check updated_at)

### Storage
- [ ] Go to Storage section
- [ ] Create new bucket named "articles"
- [ ] Set to Public (or add policies below)
- [ ] Add Public Read policy for bucket
- [ ] Add Authenticated Write policy

### Authentication
- [ ] Go to Authentication → Users
- [ ] Add user: admin@example.com / password123
- [ ] Verify user created successfully

### Security
- [ ] Enable RLS on articles table
- [ ] Add policy: "Public can view published articles"
- [ ] Add policy: "Admins manage articles" (for authenticated users)
- [ ] Test: Logout and try to view articles (should see published only)

---

## ✅ PHASE 2: NEXT.JS SETUP (30 mins)

### Project Creation
- [ ] Create Next.js project: `npx create-next-app@latest`
- [ ] Choose: TypeScript: Yes, Tailwind: Yes, App Router: Yes

### Copy Files
```bash
# Create directories
mkdir -p app/admin app/articles app/articles/[slug] lib

# Copy files
cp 02-supabase-client.ts lib/supabase.ts
cp 03-articles-lib.ts lib/articles.ts
cp 04-admin-page.tsx app/admin/page.tsx
cp 05-login-page.tsx app/login/page.tsx
cp 06-articles-page.tsx app/articles/page.tsx
cp 07-article-detail-page.tsx app/articles/[slug]/page.tsx
cp .env.local.example .env.local
```

### Environment Setup
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add Supabase URL
- [ ] Add Supabase Anon Key
- [ ] Do NOT commit .env.local to git

### Dependencies
```bash
npm install
npm install @supabase/supabase-js @supabase/ssr
```

### Test Locally
```bash
npm run dev
# Visit: http://localhost:3000
```

---

## ✅ PHASE 3: TESTING (30 mins)

### Login Test
- [ ] Navigate to `/login`
- [ ] Enter: admin@example.com / password123
- [ ] Should redirect to `/admin`
- [ ] Should NOT redirect if you logout and try `/admin`

### Admin Panel Test
- [ ] Fill in article form:
  - Title: "Test Article"
  - Authors: "John Doe, Jane Smith"
  - Journal: Select from dropdown
  - Abstract: "This is a test"
  - Keywords: "test, sample"
  - Volume: 1, Issue: 1
- [ ] Click "Add"
- [ ] Article should appear in table below
- [ ] Status should be "draft"

### Upload Test
- [ ] Create a test PDF or DOCX file
- [ ] In admin form, select file
- [ ] Submit form
- [ ] Check if pdf_url is populated
- [ ] Try to click the file URL (should be accessible)

### Status Change Test
- [ ] In articles table, change status dropdown from "draft" to "published"
- [ ] Go to `/articles` in public view
- [ ] Article should now be visible
- [ ] Change back to "draft"
- [ ] Article should disappear from public view

### Edit Test
- [ ] Click "Edit" on an article
- [ ] Form should populate with article data
- [ ] Change title and click "Update"
- [ ] Changes should save
- [ ] Slug should auto-update

### Delete Test
- [ ] Click "Delete" on an article
- [ ] Confirm deletion
- [ ] Article should disappear from list

### Public Pages Test
- [ ] Navigate to `/articles`
- [ ] Should only see published articles
- [ ] Click on article title
- [ ] Should see detail page at `/articles/[slug]`
- [ ] Download button should work if PDF exists
- [ ] Keywords should display as tags

---

## ✅ PHASE 4: DEPLOYMENT (15 mins)

### Vercel Deployment
- [ ] Push code to GitHub
- [ ] Go to vercel.com
- [ ] Import GitHub repository
- [ ] Add environment variables:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Deploy
- [ ] Test production URL

### Domain Configuration (Optional)
- [ ] Add custom domain in Vercel
- [ ] Update DNS records
- [ ] Test www.your-domain.com

### HTTPS
- [ ] Verify SSL certificate active
- [ ] Test both http and https redirect

---

## ✅ WORKFLOW DIAGRAM

```
ADMIN WORKFLOW:
┌─────────────────┐
│   Admin Login   │ → /login
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Admin Dashboard       /admin      │
├─────────────────────────────────────┤
│ ✓ Add New Article                   │
│   - Fill form                       │
│   - Upload PDF                      │
│   - Save (status: draft)            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Article Created (draft state)       │
│ - Visible only in admin             │
│ - Can be edited anytime             │
│ - Can be deleted anytime            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Change Status: published            │
│ (via status dropdown in table)       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Article Goes Live!                  │
│ - Visible on /articles              │
│ - Visible on /articles/[slug]       │
│ - Public can download PDF           │
└─────────────────────────────────────┘

PUBLIC WORKFLOW:
┌─────────────────┐
│   Visit Site    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Browse Articles      /articles      │
│ (only published articles)           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Click Article → View Details        │
│ /articles/[slug]                    │
│ - Full abstract                     │
│ - All metadata                      │
│ - Download PDF button               │
└─────────────────────────────────────┘
```

---

## 🎯 FEATURES IMPLEMENTED

### Admin Features
✅ Secure login/logout
✅ Create articles with form
✅ Upload PDF/DOCX files
✅ Edit existing articles
✅ Delete articles
✅ Change article status (draft → published)
✅ View all articles in table
✅ Auto-generate SEO slugs
✅ Add keywords, volume, issue, DOI

### Public Features
✅ Browse published articles
✅ View article details
✅ Download PDFs
✅ Search/filter by journal
✅ View keywords as tags
✅ SEO-friendly URLs

### Technical Features
✅ Responsive design (mobile-friendly)
✅ Row-level security (RLS)
✅ File upload validation
✅ Error handling & user feedback
✅ Auto-updated timestamps
✅ Indexed for performance
✅ Environment variable management
✅ Type-safe code (TypeScript)

---

## 📊 DATABASE SCHEMA QUICK REFERENCE

### articles table
```sql
id              UUID (primary key)
title           TEXT (required)
authors         TEXT (required)
journal         TEXT (required)
abstract        TEXT
keywords        TEXT[] (array)
pdf_url         TEXT (public URL)
slug            TEXT (unique, auto-generated)
volume          INTEGER
issue           INTEGER
doi             TEXT (unique)
status          ENUM ('draft', 'submitted', 'accepted', 'published')
created_at      TIMESTAMP (auto)
updated_at      TIMESTAMP (auto, triggers on update)
created_by      UUID (FK to auth.users)
```

### journals table
```sql
id              UUID (primary key)
name            TEXT (unique)
slug            TEXT (unique)
description     TEXT
created_at      TIMESTAMP
```

---

## 🔐 RLS POLICIES SUMMARY

### articles table RLS

**Policy 1: "Public can view published articles"**
```sql
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);
```
- Everyone can see published articles
- Authenticated users can see all their own articles

**Policy 2: "Admins full access"**
```sql
CREATE POLICY "Admins full access"
  ON articles FOR ALL
  USING (auth.uid() = created_by OR auth.jwt() ->> 'role' = 'admin');
```
- Admin users can create, read, update, delete anything
- Regular users can only manage their own

---

## 📱 RESPONSIVE DESIGN NOTES

All components use Tailwind CSS with:
- Mobile-first approach
- Grid layouts for responsive columns
- `max-w-` containers for desktop max width
- Responsive padding with `px-4 sm:px-6 lg:px-8`
- Touch-friendly button sizes (min 44px)
- Readable text sizes on all devices

Test on:
- [ ] Mobile (375px - iPhone SE)
- [ ] Tablet (768px - iPad)
- [ ] Desktop (1024px+)
- [ ] Large screens (1440px+)

---

## 🚀 PERFORMANCE OPTIMIZATION

### Database Indexes
✅ On journal (filtering by journal)
✅ On status (filtering by status)
✅ On created_at (sorting newest first)
✅ On slug (finding by URL)
✅ On keywords (searching keywords)

### File Size Management
✅ Max 50MB per file
✅ Only PDF and DOCX allowed
✅ Public URLs with caching (3600s)

### Next.js Optimization
✅ Use 'use client' for interactivity only
✅ Image optimization for future use
✅ Code splitting by route
✅ CSS purging with Tailwind

---

## 🛠 TROUBLESHOOTING QUICK GUIDE

| Problem | Solution |
|---------|----------|
| 404 on /admin after login | Check middleware.ts, verify auth user exists |
| "Auth user not found" error | Create admin user in Supabase Dashboard |
| Files not uploading | Check storage bucket name is "articles" |
| Articles not showing publicly | Verify status = 'published' and RLS policy exists |
| Slug conflict error | Slugs must be unique; system auto-generates from title |
| Styling looks broken | Check Tailwind installed and configured in next.config.js |
| Articles visible to unauthenticated users | Check RLS policy "Public can view published articles" |

---

## 📝 CUSTOMIZATION IDEAS

### Easy Customizations
- [ ] Change colors (update Tailwind classes)
- [ ] Reorder form fields
- [ ] Add more metadata fields (pages, URL, etc.)
- [ ] Change journal list (edit 01-schema.sql INSERT)

### Medium Customizations
- [ ] Add article categories
- [ ] Add search functionality
- [ ] Add article authors as separate table
- [ ] Add tags system

### Advanced Customizations
- [ ] Add peer review workflow
- [ ] Add comments/discussion section
- [ ] Add citation generation
- [ ] Add export to BibTeX
- [ ] Add analytics tracking

---

## 📚 USEFUL LINKS

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth/auth-js
- TypeScript: https://www.typescriptlang.org/docs

---

## 🎓 LEARNING RESOURCES

If you need to understand the code better:

1. **Supabase Client**: Check `lib/supabase.ts`
   - Browser client for client components
   - Server client for server components

2. **Article Functions**: Check `lib/articles.ts`
   - All CRUD operations
   - Upload logic with validation
   - Query helpers with filters

3. **Admin Page**: Check `app/admin/page.tsx`
   - Form state management
   - Table rendering
   - Status change workflow

4. **Public Pages**: Check `app/articles/page.tsx` and `[slug]/page.tsx`
   - Fetching and displaying data
   - Filtering and sorting
   - SEO-friendly URLs

---

Good luck! 🚀

If you hit any issues, check:
1. Browser console (F12 → Console tab)
2. Network tab (F12 → Network) to see API calls
3. Supabase Dashboard → Logs
4. Vercel deployment logs (if deployed)

Remember: Most issues are RLS-related. If something doesn't work, check RLS policies first!
