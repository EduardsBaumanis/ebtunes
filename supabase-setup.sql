-- ══════════════════════════════════════════════════════════════
-- Supabase setup for lofi-player song ratings
-- Run this in your Supabase project → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Create the song_votes table
CREATE TABLE IF NOT EXISTS public.song_votes (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT        NOT NULL,
  song_id     TEXT        NOT NULL,
  vote        SMALLINT    NOT NULL CHECK (vote IN (1, -1)),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, song_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.song_votes ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous (anon key) read/write access
CREATE POLICY "anon_select" ON public.song_votes
  FOR SELECT USING (true);

CREATE POLICY "anon_insert" ON public.song_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update" ON public.song_votes
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete" ON public.song_votes
  FOR DELETE USING (true);

-- 4. Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_song_votes_song_id
  ON public.song_votes (song_id);
