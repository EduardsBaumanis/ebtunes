-- ══════════════════════════════════════════════════════════════
-- Supabase setup for lofi-player song ratings  (v2)
-- Run this in your Supabase project → SQL Editor.
--
-- v2 changes (idempotent — safe to re-run on an existing v1 setup):
--   • Adds a pre-aggregated `leaderboard` view so the player fetches
--     only the top 20 aggregated rows instead of every vote ever cast.
--     Drastically reduces egress on the free tier.
--   • Enables Supabase Realtime on song_votes so the leaderboard can
--     update instantly via websocket subscriptions — no polling.
-- ══════════════════════════════════════════════════════════════

-- 1. Votes table
CREATE TABLE IF NOT EXISTS public.song_votes (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT        NOT NULL,
  song_id     TEXT        NOT NULL,
  vote        SMALLINT    NOT NULL CHECK (vote IN (1, -1)),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, song_id)
);

-- 2. RLS — open anon read/write (votes are public by design)
ALTER TABLE public.song_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select" ON public.song_votes;
DROP POLICY IF EXISTS "anon_insert" ON public.song_votes;
DROP POLICY IF EXISTS "anon_update" ON public.song_votes;
DROP POLICY IF EXISTS "anon_delete" ON public.song_votes;

CREATE POLICY "anon_select" ON public.song_votes FOR SELECT USING (true);
CREATE POLICY "anon_insert" ON public.song_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update" ON public.song_votes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON public.song_votes FOR DELETE USING (true);

-- 3. Index for fast aggregation per song
CREATE INDEX IF NOT EXISTS idx_song_votes_song_id
  ON public.song_votes (song_id);

-- 4. Pre-aggregated leaderboard view
-- The browser queries this instead of pulling every vote row, so each
-- refresh fetches ~20 rows regardless of how many votes exist. The view
-- runs as its definer (the postgres owner) and reads song_votes whose
-- anon SELECT policy is already open, so the explicit GRANT to anon
-- below is all that's needed for the public REPL.
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  song_id,
  COUNT(*) FILTER (WHERE vote =  1)::int AS up,
  COUNT(*) FILTER (WHERE vote = -1)::int AS down,
  COALESCE(SUM(vote), 0)::int            AS score
FROM public.song_votes
GROUP BY song_id;

GRANT SELECT ON public.leaderboard TO anon, authenticated;

-- 5. Enable Supabase Realtime on the votes table
-- Adds song_votes to the supabase_realtime publication if it's not
-- already in it. This is what lets the browser subscribe to live
-- INSERT / UPDATE / DELETE events on the table over websockets.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'song_votes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.song_votes';
  END IF;
END $$;
