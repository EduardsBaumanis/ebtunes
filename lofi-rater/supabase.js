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
  try {
    const { data, error } = await supabaseClient
      .from('leaderboard')
      .select('song_id, up, down, score')
      .order('score', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    return [];
  }
}


// ── Realtime — leaderboard updates instantly while BOARD is open ─────────────

let realtimeChannel  = null;
let realtimeDebounce = null;

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
    .subscribe();
}

function unsubscribeLeaderboard() {
  if (realtimeDebounce) { clearTimeout(realtimeDebounce); realtimeDebounce = null; }
  if (realtimeChannel)  { supabaseClient.removeChannel(realtimeChannel); realtimeChannel = null; }
}
