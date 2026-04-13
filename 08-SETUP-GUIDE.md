// SETUP GUIDE - EP Journals Group Backend

## 🚀 QUICK START

### 1. ENVIRONMENT SETUP

Create `.env.local` in your Next.js root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from:
- Supabase Dashboard → Settings → API
- Copy URL and anon key

### 2. DATABASE SETUP

**Step 1:** Go to Supabase Dashboard → SQL Editor

**Step 2:** Create new query and paste entire content from `01-schema.sql`

**Step 3:** Execute the SQL

This creates:
- ✅ articles table
- ✅ journals table
- ✅ Row-level security policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updated_at

### 3. STORAGE SETUP

**Step 1:** Go to Supabase Dashboard → Storage

**Step 2:** Create new bucket named `articles`

**Step 3:** Click on bucket → Policies

**Step 4:** Add Public Read Policy:
```sql
CREATE POLICY "Public can read articles"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'articles');
```

**Step 5:** Add Authenticated Write Policy:
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'articles');
```

### 4. CREATE ADMIN USER

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add user"
3. Enter: admin@example.com / password123
4. Click "Create user"

**Option B: Via SQL**
```sql
-- Note: Use Supabase Auth UI for better approach
-- Admin user should be created via dashboard
```

### 5. CONFIGURE RLS PROPERLY

Go to Supabase Dashboard:
1. Click on articles table
2. Click "RLS" button
3. Enable RLS if not already enabled
4. Delete default policies
5. Add these policies:

**Policy 1: Public Read Published**
```sql
CREATE POLICY "Public can view published"
  ON articles FOR SELECT
  USING (status = 'published');
```

**Policy 2: Admin Full Access**
```sql
CREATE POLICY "Admins manage articles"
  ON articles FOR ALL
  USING (auth.uid() IS NOT NULL);
```

---

## 📁 FILE STRUCTURE

```
your-next-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (home)
│   ├── login/
│   │   └── page.tsx (05-login-page.tsx)
│   ├── admin/
│   │   └── page.tsx (04-admin-page.tsx)
│   └── articles/
│       ├── page.tsx (06-articles-page.tsx)
│       └── [slug]/
│           └── page.tsx (07-article-detail-page.tsx)
├── lib/
│   ├── supabase.ts (02-supabase-client.ts)
│   └── articles.ts (03-articles-lib.ts)
└── .env.local
```

---

## 💾 INSTALLATION STEPS

### Step 1: Copy Files
1. Copy `02-supabase-client.ts` → `lib/supabase.ts`
2. Copy `03-articles-lib.ts` → `lib/articles.ts`
3. Copy `04-admin-page.tsx` → `app/admin/page.tsx`
4. Copy `05-login-page.tsx` → `app/login/page.tsx`
5. Copy `06-articles-page.tsx` → `app/articles/page.tsx`
6. Copy `07-article-detail-page.tsx` → `app/articles/[slug]/page.tsx`

### Step 2: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
# or
yarn add @supabase/supabase-js @supabase/ssr
```

### Step 3: Add Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Step 4: Configure Middleware (Optional but Recommended)

Create `middleware.ts` in project root:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

---

## 🔒 SECURITY CHECKLIST

- [ ] RLS enabled on articles table
- [ ] Storage bucket has appropriate policies
- [ ] Admin user created in Supabase Auth
- [ ] Environment variables in `.env.local` (not committed to git)
- [ ] Login page password-protected
- [ ] Admin routes protected by middleware
- [ ] File upload size limit set (50MB)
- [ ] File type validation in place

---

## 📖 API REFERENCE

### createArticle(supabase, data)
Creates a new article and returns it.

```typescript
const article = await createArticle(supabase, {
  title: 'AI in Medicine',
  authors: 'Dr. Smith, Dr. Jones',
  journal: 'Nature Research',
  abstract: 'Long text...',
  keywords: ['AI', 'Medicine'],
  status: 'draft'
});
```

### updateArticle(supabase, id, data)
Updates an article by ID.

```typescript
await updateArticle(supabase, articleId, {
  status: 'published'
});
```

### deleteArticle(supabase, id)
Deletes an article by ID.

```typescript
await deleteArticle(supabase, articleId);
```

### fetchArticles(supabase, filters)
Fetches articles with optional filters.

```typescript
const articles = await fetchArticles(supabase, {
  status: 'published',
  journal: 'Nature Research',
  limit: 10,
  offset: 0
});
```

### uploadFile(supabase, file, articleId)
Uploads PDF/DOCX and returns public URL.

```typescript
const url = await uploadFile(supabase, file, articleId);
```

### changeArticleStatus(supabase, id, status)
Changes article status workflow.

```typescript
await changeArticleStatus(supabase, articleId, 'published');
```

---

## 🎯 USAGE WORKFLOW

### For Admin:
1. Visit `/login`
2. Enter credentials
3. Go to `/admin`
4. Fill article form
5. Upload PDF/DOCX
6. Change status to "published"
7. Article appears on public site

### For Public Users:
1. Visit `/articles`
2. Browse published articles
3. Click article title to view details
4. Download PDF if available

---

## 🐛 TROUBLESHOOTING

### Issue: "Auth user not found"
- Solution: Make sure you created admin user in Supabase
- Check: Supabase → Authentication → Users

### Issue: "RLS policy error on insert"
- Solution: Check RLS policies on articles table
- Ensure "Admins manage articles" policy exists

### Issue: "File upload fails"
- Solution: Check storage bucket policies
- Make sure bucket is named exactly "articles"

### Issue: "Articles not showing publicly"
- Solution: Check article status is "published"
- Verify RLS "Public can view published" policy exists

### Issue: "Slug already exists"
- Solution: Slugs must be unique - system auto-generates from title
- If error persists, manually edit title to be unique

---

## 🚀 DEPLOYMENT

### Vercel Deployment:
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel Dashboard:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy!

### Supabase Considerations:
- Enable Row Level Security on all tables
- Set up proper backup policies
- Monitor storage usage
- Consider database connection limits

---

## 📊 MONITORING

### Check Storage Usage:
Supabase Dashboard → Storage → articles

### Check Database Size:
Supabase Dashboard → Database → Storage

### Monitor Auth:
Supabase Dashboard → Authentication → Users

---

## 🎓 NEXT STEPS

1. **Customize Styling**: Update Tailwind classes in components
2. **Add Categories**: Add category column to articles table
3. **Add Search**: Implement full-text search on title/abstract
4. **Add Comments**: Create comments table for peer review
5. **Add Reviews**: Track review status and reviewers
6. **Export to PDF**: Use pdf-lib to generate PDFs
7. **Email Notifications**: Add Resend or SendGrid integration
8. **Analytics**: Add Google Analytics or Vercel Analytics

---

## 📝 NOTES

- This system is designed to be SIMPLE and LIGHTWEIGHT
- No complex approval workflows - just status management
- Perfect for small to medium academic journals
- Scales easily with Supabase infrastructure
- All code is production-ready and follows best practices

---

## 🆘 SUPPORT

For issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Check Next.js documentation: https://nextjs.org/docs
3. Review your RLS policies first (80% of issues are RLS-related)
4. Check browser console for errors
5. Check Supabase logs in dashboard

---

Good luck with EP Journals Group! 🎓
