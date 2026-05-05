# Supabase Setup — Leaderboard & Voting

Step-by-step guide to wire up the lofi-player so the **+ / −** vote buttons
actually save and the **BOARD** screen shows real numbers.

The voting feature uses **one Postgres table** (`song_votes`) hosted on
Supabase, and the browser talks to it directly with the public **anon key**.
No backend code, no servers — just a database with a simple Row Level
Security policy.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> and sign in (free tier is enough).
2. Click **New project**.
3. Fill in:
   - **Name** — anything, e.g. `lofi-player`.
   - **Database password** — generate and **save it** (you won't need it for
     the player, but you'll need it if you ever connect from `psql`).
   - **Region** — pick the one closest to most listeners.
4. Click **Create new project** and wait ~1 minute for it to provision.

---

## 2. Run the SQL setup script

This creates the `song_votes` table, enables Row Level Security, and adds
policies that let anonymous visitors insert / update / delete **only their
own** votes.

1. In your Supabase project, click the **SQL Editor** icon in the left sidebar.
2. Click **New query**.
3. Paste the contents of [`supabase-setup.sql`](./supabase-setup.sql) into the
   editor (it's reproduced below for convenience).
4. Click **Run** (or press `Ctrl/⌘ + Enter`).

```sql
-- 1. The votes table
CREATE TABLE IF NOT EXISTS public.song_votes (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT        NOT NULL,
  song_id     TEXT        NOT NULL,
  vote        SMALLINT    NOT NULL CHECK (vote IN (1, -1)),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, song_id)
);

-- 2. Lock down with RLS
ALTER TABLE public.song_votes ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous read/write (needed for the public anon key to work)
CREATE POLICY "anon_select" ON public.song_votes
  FOR SELECT USING (true);

CREATE POLICY "anon_insert" ON public.song_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update" ON public.song_votes
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete" ON public.song_votes
  FOR DELETE USING (true);

-- 4. Index for fast leaderboard tally
CREATE INDEX IF NOT EXISTS idx_song_votes_song_id
  ON public.song_votes (song_id);
```

You should see **Success. No rows returned**. The table now exists.

> **Why open RLS policies?**
> Each visitor gets a random `session_id` stored in their `localStorage`,
> and the `UNIQUE (session_id, song_id)` constraint means they can have at
> most one vote per song. Open insert/update is fine because malicious users
> can only fake their own session — they can't impersonate someone else's
> vote. If you ever expose more sensitive data, lock RLS back down.

---

## 3. Grab your project URL and anon key

The browser needs two strings to talk to Supabase:

1. In the project dashboard, click **Project Settings** (gear icon, bottom-left).
2. Click **API**.
3. Copy:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **`anon` public key** — starts with `sb_publishable_…` or
     `eyJhbGciOi…` (JWT). It's the key labelled **anon / public**, **not**
     the `service_role` key.

> **Never paste the `service_role` key** into a browser — that key bypasses
> RLS and could let anyone wipe your table.

---

## 4. Plug the keys into the player

Open [`lofi-player/supabase.js`](./lofi-player/supabase.js) and replace the
two constants at the top:

```js
const SUPABASE_URL      = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
```

Save. That's it for the code side — the player already knows how to:
- store local votes in `localStorage` while you click + / −
- batch-submit them to Supabase when you press **SUBMIT RATINGS** (after
  voting on at least 5 songs)
- fetch a fresh tally for the **BOARD** view every 30 minutes

---

## 5. Test it locally

1. From the repo root, start a local server (any will do):
   ```bash
   npx serve .
   # or:  python3 -m http.server 8000
   ```
2. Open `http://localhost:3000/lofi-player/` (or whatever port you picked).
3. Click + or − on five songs in the sidebar.
4. The bottom button should change from `0 / 5` → `5 / 5` and become
   clickable.
5. Click **SUBMIT RATINGS**. The button should flash `SUBMITTED ✓`.
6. Click **BOARD** in the header — your votes should show in the
   leaderboard.

If nothing shows up, open the browser **DevTools → Console**:
- A red `Supabase error` log usually means the URL or key is wrong.
- A `permission denied for table song_votes` error means the policies in
  step 2 didn't get created — re-run the SQL.

---

## 6. Verify the data in Supabase

In the Supabase dashboard, click **Table Editor** → **song_votes**. You
should see rows like:

| session_id              | song_id                         | vote |
| ----------------------- | ------------------------------- | ---- |
| `session_1730812345_…`  | `lofi/song-01-3am-rain.strudel` | 1    |
| `session_1730812345_…`  | `game/sfx-04-game-over.strudel` | -1   |

`song_id` always has the form `<playlist>/<filename>`, so the same song name
in different folders never collides.

---

## 7. Deploying to GitHub Pages (or anywhere static)

The player is pure HTML/CSS/JS and works on any static host. The anon key in
`supabase.js` is **safe to commit** — it's public by design and protected by
the RLS policies you set up in step 2.

Commit and push, and Pages will serve the player straight from `lofi-player/`.

---

## Troubleshooting

| Symptom                                     | Fix                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Votes click but `BOARD` stays empty         | Check console for CORS errors — make sure URL is `https://`, not `http://`         |
| `permission denied` errors                  | Re-run the four `CREATE POLICY` statements from step 2                             |
| `duplicate key value violates unique`       | Expected — the table prevents double votes per session. Use UPSERT (already done). |
| Want to wipe all votes                      | In SQL Editor: `TRUNCATE public.song_votes;`                                       |
| Want a per-IP rate limit                    | Add a Postgres function + trigger checking `created_at` density per `session_id`.  |
| Want to require login instead of anon votes | Replace the open RLS policies with `auth.uid() IS NOT NULL` checks.                |

---

## What the code actually does (so you know what you can change)

- **`supabase.js`**
  - `getSessionId()` — random ID kept in `localStorage`. Identifies one
    browser, no login required.
  - `getVote / setVote` — local cache of clicks before submission.
  - `submitAllVotes()` — UPSERTs the pending batch to the table.
  - `fetchLeaderboard()` — pulls all votes, tallies them in the browser,
    sorts top 20.
- **`app.js`**
  - Sidebar `+ / −` buttons call `handleVote` → `submitVote` (marks pending).
  - The footer **SUBMIT RATINGS** button calls `submitAllVotes` once you
    have ≥ 5 pending votes.
  - **BOARD** tab calls `refreshBoard` and runs a 30-minute auto-refresh.

If the leaderboard ever feels slow with thousands of votes, replace
`fetchLeaderboard()` with a Postgres `VIEW` that does the SUM/COUNT in
the database. The current client-side tally is fine up to a few thousand
rows.
