// ── Supabase config (shared with lofi-player) ────────────────────────────────
// The rater talks to the same project, the same `song_votes` table, and the
// same `leaderboard` view as lofi-player. song_id is namespaced "demos/<file>"
// so a vote here shows up next to lofi-player's DEMOS-tab leaderboard entries.

const SUPABASE_URL     = 'https://herfqtxnhouywwqaifkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rRkHWWdhxXRYY64yxGpnxA_DJoSdFV0';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Share the session ID with lofi-player so a returning user is recognised
// as the same person across both apps.
const SESSION_ID_KEY  = 'lofi-player-session-id';

// Track which song IDs the user has rated locally so we don't show them
// the same song twice. Keys here mirror the song_id sent to Supabase.
const RATED_KEY       = 'lofi-rater-rated';


function getSessionId() {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function getRatedSet() {
  try   { return new Set(JSON.parse(localStorage.getItem(RATED_KEY) || '[]')); }
  catch { return new Set(); }
}

function markRated(songId) {
  const s = getRatedSet();
  s.add(songId);
  localStorage.setItem(RATED_KEY, JSON.stringify([...s]));
}

function clearRated() {
  localStorage.removeItem(RATED_KEY);
}


// ── Single-vote submit (called on every HOT / NOT click) ─────────────────────
//
// One UPSERT per vote. Free-tier impact is tiny: each vote is one ~200-byte
// HTTP request. With the unique (session_id, song_id) constraint, changing
// your mind on a song just updates the same row.

async function submitVote(songId, value) {
  // value: 1 (HOT) or -1 (NOT). 0 / null means "remove my vote".
  try {
    if (value === 1 || value === -1) {
      const now = new Date().toISOString();
      const { error } = await supabaseClient
        .from('song_votes')
        .upsert(
          {
            session_id: getSessionId(),
            song_id:    songId,
            vote:       value,
            created_at: now,
            updated_at: now,
          },
          { onConflict: 'session_id,song_id' },
        );
      if (error) throw error;
    } else {
      const { error } = await supabaseClient
        .from('song_votes')
        .delete()
        .eq('session_id', getSessionId())
        .eq('song_id', songId);
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error('Vote submit error:', err);
    return false;
  }
}


// ── Leaderboard (pre-aggregated view, same as lofi-player) ───────────────────

async function fetchLeaderboard() {
  // 1) Try the v2 pre-aggregated `leaderboard` view.
  try {
    const { data, error } = await supabaseClient
      .from('leaderboard')
      .select('song_id, up, down, score')
      .order('score', { ascending: false })
      .limit(20);
    if (!error && Array.isArray(data)) return data;
    if (error) {
      console.warn('leaderboard view unavailable — falling back to client-side tally. ' +
                   'Re-run supabase-setup.sql to add the view. (', error.message, ')');
    }
  } catch (e) {
    console.warn('leaderboard view query threw, falling back:', e);
  }

  // 2) v1 fallback: pull every vote and tally in the browser.
  try {
    const { data, error } = await supabaseClient
      .from('song_votes')
      .select('song_id, vote');
    if (error) throw error;
    const map = {};
    for (const { song_id, vote } of data || []) {
      if (!map[song_id]) map[song_id] = { song_id, up: 0, down: 0 };
      if (vote ===  1) map[song_id].up++;
      if (vote === -1) map[song_id].down++;
    }
    return Object.values(map)
      .map(s => ({ ...s, score: s.up - s.down }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  } catch (err) {
    console.error('Leaderboard fetch error (both view and table failed):', err);
    return [];
  }
}


// ── Realtime — leaderboard updates instantly while BOARD is open ─────────────

let realtimeChannel   = null;
let realtimeDebounce  = null;
let realtimeFallback  = null;     // setInterval poll, only if Realtime fails

function subscribeLeaderboard(onChange, debounceMs = 600) {
  if (realtimeChannel) return;
  realtimeChannel = supabaseClient
    .channel('lofi_rater_live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'song_votes' },
      () => {
        clearTimeout(realtimeDebounce);
        realtimeDebounce = setTimeout(onChange, debounceMs);
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (realtimeFallback) { clearInterval(realtimeFallback); realtimeFallback = null; }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        console.warn('Realtime channel status:', status,
                     '— check `song_votes` is in the supabase_realtime publication. ' +
                     'Falling back to 60s polling.');
        if (!realtimeFallback) realtimeFallback = setInterval(onChange, 60_000);
      }
    });
}

function unsubscribeLeaderboard() {
  if (realtimeDebounce) { clearTimeout(realtimeDebounce); realtimeDebounce = null; }
  if (realtimeFallback) { clearInterval(realtimeFallback); realtimeFallback = null; }
  if (realtimeChannel)  { supabaseClient.removeChannel(realtimeChannel); realtimeChannel = null; }
}
