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

This creates the `song_votes` table, opens it to anonymous read/write,
**adds a pre-aggregated `leaderboard` view** (so each leaderboard fetch
returns ~20 rows instead of every vote ever cast — critical for free-tier
egress), and **enables Supabase Realtime** on the table so the player can
subscribe to live vote events via websocket.

1. In your Supabase project, click the **SQL Editor** icon in the left sidebar.
2. Click **New query**.
3. Paste the contents of [`supabase-setup.sql`](./supabase-setup.sql) into the
   editor — the script is **idempotent** and safe to re-run if you set up the
   v1 table earlier.
4. Click **Run** (or press `Ctrl/⌘ + Enter`).

You should see **Success. No rows returned**. The table, the `leaderboard`
view, and the Realtime publication are now in place.

> **What's different from v1 of this guide?**
> - The browser used to pull *every* `song_votes` row and tally them
>   client-side. Now it queries a Postgres view that pre-aggregates
>   counts in the database, so each leaderboard refresh is a few KB no
>   matter how many votes exist.
> - The 30-minute polling refresh was replaced by a **Realtime
>   subscription** — the leaderboard updates within ~600 ms of any
>   insert/update/delete, with zero polling. Free tier includes 200
>   concurrent Realtime connections + 2 M messages/month, which is
>   plenty for a small project.

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
   leaderboard. The status badge in the top-right of the BOARD pane
   should read **● LIVE** (pulsing).
7. Open the page in a **second browser tab** alongside the first. Vote
   and submit in tab A — tab B's BOARD should update within ~1 second
   without any refresh. That's Realtime in action.

If nothing shows up, open the browser **DevTools → Console**:
- A red `Supabase error` log usually means the URL or key is wrong.
- A `permission denied for table song_votes` error means the RLS policies
  in step 2 didn't get created — re-run the SQL.
- A `relation "leaderboard" does not exist` error means you're still on
  the v1 SQL — re-run `supabase-setup.sql` and the view will be created.
- If the BOARD badge says **● LIVE** but other tabs don't update,
  Realtime isn't enabled on the table. Check **Database → Replication**
  in Supabase and make sure `song_votes` is in the `supabase_realtime`
  publication. Re-running the SQL also adds it.

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
| `relation "leaderboard" does not exist`     | Re-run `supabase-setup.sql` — you're on v1. The script is idempotent.              |
| BOARD doesn't update across tabs            | Realtime isn't enabled. Run the SQL again, or in Supabase: Database → Replication → add `song_votes` to `supabase_realtime`. |
| `duplicate key value violates unique`       | Expected — the table prevents double votes per session. UPSERT handles it.         |
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
  - `fetchLeaderboard()` — queries the **`leaderboard` view**, which does
    the SUM/COUNT in Postgres. Returns the top 20 rows already aggregated.
  - `subscribeLeaderboard(onChange)` / `unsubscribeLeaderboard()` —
    opens / closes a Realtime websocket channel on `song_votes`. Any
    insert/update/delete on the table fires `onChange` (debounced 600 ms).
- **`app.js`**
  - Sidebar `+ / −` buttons call `handleVote` → `submitVote` (marks pending).
  - The footer **SUBMIT RATINGS** button calls `submitAllVotes` once you
    have ≥ 5 pending votes; the BOARD refetches immediately on success.
  - **BOARD** tab: on open, calls `refreshBoard` once and subscribes to
    Realtime. On close, unsubscribes. The badge in the top-right reads
    `● LIVE` (pulsing) while the subscription is active.

### Free-tier budget

Under the v2 setup with N concurrent BOARD viewers and V votes/day:
- **Egress:** ~5 KB per leaderboard refresh × (N viewers × V vote events)
  per day. At 1000 votes/day and 20 viewers, that's ~100 MB/day — well
  inside the 5 GB/month free egress.
- **Realtime messages:** 1 message per vote per concurrent viewer. 1000
  votes × 20 viewers = 20 000 msg/day = ~600 K/month, inside the 2 M
  free-tier ceiling.
- **Connections:** one websocket per open BOARD pane, closed as soon as
  the user navigates away. 200 concurrent ceiling on free tier.

If you outgrow any of those, consider gating BOARD behind a "vote at
least once" check, or add a materialized view + a 30-second client
poll instead of Realtime.
