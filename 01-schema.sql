-- EP Journals Group - Complete Database Schema
-- Paste this directly into Supabase SQL Editor

-- 1. Create enum type for article status
CREATE TYPE article_status AS ENUM ('draft', 'submitted', 'accepted', 'published');

-- 2. Main articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  journal TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  slug TEXT UNIQUE,
  volume INTEGER,
  issue INTEGER,
  doi TEXT UNIQUE,
  status article_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT title_length CHECK (char_length(title) > 0),
  CONSTRAINT title_max_length CHECK (char_length(title) <= 500)
);

-- 3. Create indexes for performance
CREATE INDEX idx_articles_journal ON articles(journal);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_keywords ON articles USING GIN(keywords);

-- 4. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public to view published articles
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

-- Allow authenticated users (admins) full access
CREATE POLICY "Admins full access"
  ON articles FOR ALL
  USING (auth.uid() = created_by OR auth.jwt() ->> 'role' = 'admin');

-- 6. Create journals lookup table (optional, for normalization)
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_journals_name ON journals(name);
CREATE INDEX idx_journals_slug ON journals(slug);

-- 7. Insert sample journals
INSERT INTO journals (name, slug, description) VALUES
  ('Nature Research', 'nature-research', 'Leading international scientific journal'),
  ('Science Direct', 'science-direct', 'Multidisciplinary research platform'),
  ('IEEE Transactions', 'ieee-transactions', 'Engineering and technology research');

-- 8. Add foreign key from articles to journals (optional enhancement)
-- ALTER TABLE articles ADD COLUMN journal_id UUID REFERENCES journals(id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON articles TO authenticated;
GRANT SELECT ON journals TO anon, authenticated;
