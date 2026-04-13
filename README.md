# 📚 EP Journals Group - Complete Backend Implementation

A production-ready academic publishing platform backend built with **Supabase** (database/auth/storage) and **Next.js** (frontend).

## 🎯 What You Get

✅ **Complete Database Schema** (PostgreSQL with RLS)
✅ **Admin Dashboard** (create, edit, delete articles)
✅ **File Management** (PDF/DOCX upload to cloud storage)
✅ **Public Website** (browse and view articles)
✅ **Authentication System** (Supabase Auth)
✅ **SEO-Friendly URLs** (auto-generated slugs)
✅ **Status Workflow** (draft → submitted → accepted → published)
✅ **Responsive Design** (works on all devices)
✅ **Type-Safe Code** (TypeScript throughout)
✅ **Production-Ready** (security, performance, error handling)

---

## 📦 FILES INCLUDED

```
1. 01-schema.sql                      # Database schema (paste in Supabase)
2. 02-supabase-client.ts              # Supabase configuration
3. 03-articles-lib.ts                 # CRUD functions and helpers
4. 04-admin-page.tsx                  # Admin dashboard (all features)
5. 05-login-page.tsx                  # Authentication page
6. 06-articles-page.tsx               # Public article listing
7. 07-article-detail-page.tsx         # Individual article page
8. 08-SETUP-GUIDE.md                  # Detailed setup instructions
9. 09-IMPLEMENTATION-CHECKLIST.md     # Step-by-step checklist
10. package.json                       # Dependencies
11. .env.local.example                 # Environment variables template
12. README.md                          # This file
```

---

## 🚀 QUICK START (15 Minutes)

### Prerequisites
- Supabase account (free: https://supabase.com)
- Node.js 18+ installed
- GitHub account (for Vercel deployment)

### Step 1: Setup Supabase

1. **Create Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in details and create

2. **Run Database Schema**
   - Go to SQL Editor
   - Create new query
   - Paste entire content of `01-schema.sql`
   - Click "Run"

3. **Create Storage Bucket**
   - Go to Storage → Create new bucket
   - Name: `articles` (exactly this)
   - Make public

4. **Create Admin User**
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `admin@example.com`
   - Password: `password123`

5. **Get Credentials**
   - Go to Settings → API
   - Copy **Project URL** and **Anon Key**

### Step 2: Setup Next.js Project

```bash
# Create project
npx create-next-app@latest ep-journals --typescript --tailwind --app

cd ep-journals

# Install Supabase packages
npm install @supabase/supabase-js @supabase/ssr

# Copy files from this implementation
mkdir -p app/admin app/articles/[slug] lib
cp 02-supabase-client.ts lib/supabase.ts
cp 03-articles-lib.ts lib/articles.ts
cp 04-admin-page.tsx app/admin/page.tsx
cp 05-login-page.tsx app/login/page.tsx
cp 06-articles-page.tsx app/articles/page.tsx
cp 07-article-detail-page.tsx app/articles/[slug]/page.tsx
```

### Step 3: Configure Environment

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with values from Step 1.

### Step 4: Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### Step 5: Test the System

1. **Login**
   - Go to http://localhost:3000/login
   - Use: admin@example.com / password123

2. **Create Article**
   - Click "Add new article"
   - Fill in form
   - Upload PDF
   - Click "Add"

3. **Publish Article**
   - In table, change status to "published"

4. **View Public Site**
   - Go to http://localhost:3000/articles
   - Article should appear!

---

## 📚 FEATURES EXPLAINED

### Admin Dashboard (`/admin`)

**What it does:**
- Create new articles with metadata
- Upload PDF/DOCX files
- Edit existing articles
- Delete articles
- Change publication status
- View all articles in a table

**How to use:**
1. Login with admin credentials
2. Fill form on left side
3. Select file to upload (optional)
4. Click "Add"
5. Change status in table to publish

### Public Pages

**Articles Listing (`/articles`)**
- Browse all published articles
- Filter by status (published, accepted, all)
- Download PDF button
- View article details

**Article Detail (`/articles/[slug]`)**
- Full article information
- Abstract, keywords, authors
- Download PDF
- Journal, volume, issue, DOI
- Publication date

---

## 🔐 SECURITY

### Authentication
- ✅ Supabase Auth (secure, industry-standard)
- ✅ Protected admin routes
- ✅ Session management
- ✅ Password hashing

### Database Security
- ✅ Row-Level Security (RLS) enabled
- ✅ Public can only view published articles
- ✅ Admins have full control
- ✅ Audit trail with created_by

### File Upload Security
- ✅ File type validation (PDF/DOCX only)
- ✅ File size limit (50MB)
- ✅ Secure cloud storage (Supabase)
- ✅ Public read-only for files

---

## 📊 DATABASE DESIGN

### articles table
```
id              UUID            Primary key
title           TEXT            Required
authors         TEXT            Required
journal         TEXT            Required
abstract        TEXT            Optional
keywords        TEXT[]          Array of keywords
pdf_url         TEXT            Public URL to file
slug            TEXT UNIQUE     SEO-friendly URL
volume          INTEGER         Journal volume
issue           INTEGER         Journal issue
doi             TEXT UNIQUE     Digital Object ID
status          ENUM            draft/submitted/accepted/published
created_at      TIMESTAMP       Auto-timestamp
updated_at      TIMESTAMP       Auto-update on change
created_by      UUID FK         User who created
```

### journals table
```
id              UUID            Primary key
name            TEXT UNIQUE     Journal name
slug            TEXT UNIQUE     URL-friendly name
description     TEXT            About the journal
created_at      TIMESTAMP       Created date
```

---

## 🎨 CUSTOMIZATION

### Change Colors
Edit Tailwind classes in components:
```tsx
// Change from blue-600 to your color
className="bg-blue-600 hover:bg-blue-700"

// Available: slate, gray, zinc, neutral, stone, red, orange, amber, yellow,
//            lime, green, emerald, teal, cyan, sky, blue, indigo, violet, etc.
```

### Add More Fields
1. Add column to `articles` table in `01-schema.sql`
2. Add field to `Article` type in `03-articles-lib.ts`
3. Add form input in `04-admin-page.tsx`
4. Add display in `06-articles-page.tsx` or `07-article-detail-page.tsx`

### Change Journal List
Edit the INSERT statement in `01-schema.sql`:
```sql
INSERT INTO journals (name, slug, description) VALUES
  ('Your Journal Name', 'slug', 'Description');
```

---

## 🚀 DEPLOYMENT

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Skip environment variables step

3. **Add Environment Variables in Vercel Dashboard**
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Redeploy

4. **Done!**
   - Your site is live at vercel's URL
   - Custom domain available in settings

---

## 📖 API REFERENCE

All functions use TypeScript and return typed results.

### Create Article
```typescript
const article = await createArticle(supabase, {
  title: 'Breaking Research',
  authors: 'Dr. Smith',
  journal: 'Nature Research',
  abstract: 'Long text...',
  keywords: ['AI', 'Medicine'],
  status: 'draft'
});
```

### Update Article
```typescript
await updateArticle(supabase, articleId, {
  title: 'Updated Title',
  status: 'published'
});
```

### Delete Article
```typescript
await deleteArticle(supabase, articleId);
```

### Fetch Articles
```typescript
const articles = await fetchArticles(supabase, {
  status: 'published',
  journal: 'Nature Research',
  limit: 10
});
```

### Upload File
```typescript
const url = await uploadFile(supabase, file, articleId);
// Returns: https://your-bucket.supabase.co/articles/...
```

### Change Status
```typescript
await changeArticleStatus(supabase, articleId, 'published');
```

### Fetch Journals
```typescript
const journals = await fetchJournals(supabase);
// Returns: ['Nature Research', 'Science Direct', ...]
```

---

## 🐛 TROUBLESHOOTING

### "Cannot find Supabase credentials"
**Fix:** Check .env.local file exists with correct values

### "Auth user not found" error
**Fix:** Create admin user in Supabase Dashboard → Authentication → Users

### "RLS policy error" when trying to save
**Fix:** Check RLS policies exist. Run 01-schema.sql again if missing.

### "File upload fails"
**Fix:** 
1. Check bucket is named exactly "articles"
2. Check bucket has public read policy
3. Check file is PDF or DOCX
4. Check file is under 50MB

### "Articles not showing on public page"
**Fix:**
1. Check article status is "published"
2. Check RLS policy: "Public can view published articles"
3. Try logout to test as anonymous user

### "Build fails on Vercel"
**Fix:**
1. Check environment variables added in Vercel
2. Check Next.js version compatible
3. Check TypeScript compilation: `npm run type-check`

---

## 💡 WORKFLOW EXAMPLE

**Scenario: Publishing a research paper**

1. **Admin logs in** → `/login`
2. **Creates article** in admin panel
   - Title: "AI in Healthcare"
   - Authors: "Dr. Smith, Dr. Jones"
   - Journal: "Nature Research"
   - Abstract: [paste text]
   - Keywords: AI, Healthcare, ML
   - Upload: paper.pdf
3. **Clicks "Add"** → Article created as draft
4. **Reviews article** in the table
5. **Changes status to "published"** → Article goes live
6. **Public visits site** → `/articles`
7. **Sees article listed** with all metadata
8. **Clicks to view** → `/articles/ai-in-healthcare`
9. **Downloads PDF** → Gets paper.pdf

---

## 📈 SCALING

This system is built to scale:

- **Database**: Supabase handles thousands of articles
- **Storage**: Cloud storage with CDN for fast downloads
- **Hosting**: Vercel auto-scales with traffic
- **Auth**: Supabase manages unlimited users

**For larger volumes (100k+ articles):**
- Add search with Postgres full-text search
- Add caching with Redis (Vercel)
- Add pagination to article lists
- Add database read replicas (Supabase)

---

## 🎓 WHAT YOU LEARNED

By implementing this, you've learned:
- ✅ PostgreSQL database design with RLS
- ✅ React server/client components
- ✅ File upload handling
- ✅ Authentication workflows
- ✅ Type-safe APIs with TypeScript
- ✅ Tailwind CSS for responsive design
- ✅ Supabase integration
- ✅ Next.js full-stack development
- ✅ Production deployment

---

## 📞 SUPPORT

**For Supabase issues:**
- https://supabase.com/docs
- https://github.com/supabase/supabase/discussions

**For Next.js issues:**
- https://nextjs.org/docs
- https://github.com/vercel/next.js/discussions

**For general questions:**
- Check the included guides
- Review your RLS policies (80% of issues!)
- Check browser console for errors
- Review Supabase logs in dashboard

---

## 📝 NEXT STEPS

### Short Term
- [ ] Customize colors to match your brand
- [ ] Update journal list
- [ ] Add your logo
- [ ] Deploy to Vercel

### Medium Term
- [ ] Add search functionality
- [ ] Add article categories
- [ ] Add author profiles
- [ ] Add citation generation

### Long Term
- [ ] Add peer review workflow
- [ ] Add comments/discussion
- [ ] Add author registration
- [ ] Add analytics dashboard
- [ ] Add email notifications

---

## 📄 LICENSE

This implementation is provided as-is for the EP Journals Group project.
Feel free to modify and customize as needed.

---

## 🎉 YOU'RE READY!

Everything is configured and ready to go. Follow the QUICK START above and you'll have a working academic publishing platform in 15 minutes.

**Questions?** Check the included guides:
- `08-SETUP-GUIDE.md` - Detailed setup
- `09-IMPLEMENTATION-CHECKLIST.md` - Step-by-step checklist

Good luck with EP Journals Group! 🚀

---

**Built with ❤️ for academic publishing**

Supabase + Next.js + Tailwind CSS
