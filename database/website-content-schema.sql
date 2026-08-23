-- Website content tables managed by spadmin
-- Run in Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS gallery_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cover_image TEXT,
    image_count INTEGER NOT NULL DEFAULT 0,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS category TEXT;

CREATE TABLE IF NOT EXISTS testimonies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    story TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    video_url TEXT,
    category TEXT,
    testimony_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS column_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    author_bio TEXT,
    author_image TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_time TEXT NOT NULL DEFAULT '5 min read',
    category TEXT NOT NULL DEFAULT 'General',
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    image_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_albums_event_date ON gallery_albums(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_testimonies_testimony_date ON testimonies(testimony_date DESC);
CREATE INDEX IF NOT EXISTS idx_testimonies_featured ON testimonies(featured);
CREATE INDEX IF NOT EXISTS idx_column_articles_published_at ON column_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_column_articles_featured ON column_articles(featured);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON gallery_albums;
CREATE TRIGGER update_gallery_albums_updated_at
    BEFORE UPDATE ON gallery_albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonies_updated_at ON testimonies;
CREATE TRIGGER update_testimonies_updated_at
    BEFORE UPDATE ON testimonies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_column_articles_updated_at ON column_articles;
CREATE TRIGGER update_column_articles_updated_at
    BEFORE UPDATE ON column_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read gallery_albums" ON gallery_albums;
CREATE POLICY "Public read gallery_albums" ON gallery_albums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read testimonies" ON testimonies;
CREATE POLICY "Public read testimonies" ON testimonies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read column_articles" ON column_articles;
CREATE POLICY "Public read column_articles" ON column_articles FOR SELECT USING (true);

-- Admin writes use service role key (same pattern as existing spadmin tables)
DROP POLICY IF EXISTS "Admin write gallery_albums" ON gallery_albums;
CREATE POLICY "Admin write gallery_albums" ON gallery_albums FOR ALL USING (false);

DROP POLICY IF EXISTS "Admin write testimonies" ON testimonies;
CREATE POLICY "Admin write testimonies" ON testimonies FOR ALL USING (false);

DROP POLICY IF EXISTS "Admin write column_articles" ON column_articles;
CREATE POLICY "Admin write column_articles" ON column_articles FOR ALL USING (false);

-- Static website pages (footer, about/church, etc.)
CREATE TABLE IF NOT EXISTS website_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_website_content_slug ON website_content(slug);

DROP TRIGGER IF EXISTS update_website_content_updated_at ON website_content;
CREATE TRIGGER update_website_content_updated_at
    BEFORE UPDATE ON website_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read website_content" ON website_content;
CREATE POLICY "Public read website_content" ON website_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write website_content" ON website_content;
CREATE POLICY "Admin write website_content" ON website_content FOR ALL USING (false);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_text TEXT,
    location TEXT,
    description TEXT,
    image_url TEXT,
    registration_required BOOLEAN NOT NULL DEFAULT false,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read events" ON events;
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write events" ON events;
CREATE POLICY "Admin write events" ON events FOR ALL USING (false);

-- Bible study topics
CREATE TABLE IF NOT EXISTS bible_study_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    verse_reference TEXT,
    category TEXT,
    lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bible_study_topics_category ON bible_study_topics(category);

DROP TRIGGER IF EXISTS update_bible_study_topics_updated_at ON bible_study_topics;
CREATE TRIGGER update_bible_study_topics_updated_at
    BEFORE UPDATE ON bible_study_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE bible_study_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read bible_study_topics" ON bible_study_topics;
CREATE POLICY "Public read bible_study_topics" ON bible_study_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write bible_study_topics" ON bible_study_topics;
CREATE POLICY "Admin write bible_study_topics" ON bible_study_topics FOR ALL USING (false);

-- Small groups
CREATE TABLE IF NOT EXISTS small_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    leader TEXT,
    category TEXT,
    meeting_day TEXT,
    meeting_time TEXT,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_small_groups_category ON small_groups(category);

DROP TRIGGER IF EXISTS update_small_groups_updated_at ON small_groups;
CREATE TRIGGER update_small_groups_updated_at
    BEFORE UPDATE ON small_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read small_groups" ON small_groups;
CREATE POLICY "Public read small_groups" ON small_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write small_groups" ON small_groups;
CREATE POLICY "Admin write small_groups" ON small_groups FOR ALL USING (false);
