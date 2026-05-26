// ── Supabase config (shared with lofi-player + lofi-rater) ───────────────────
// Same project, same `song_votes` table, same `leaderboard` view. song_id is
// namespaced "<playlist.id>/<filename>" so leaderboard rows from this player
// stack with rows the other two apps recorded for the same songs.

const SUPABASE_URL      = 'https://herfqtxnhouywwqaifkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rRkHWWdhxXRYY64yxGpnxA_DJoSdFV0';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SESSION_ID_KEY = 'lofi-player-session-id';
const VOTES_KEY      = 'player-votes';

function getSessionId() {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// Local vote cache so the +/- buttons can light up immediately on page load,
// rather than waiting for a round trip to Supabase to learn what you voted.
function getLocalVotes() {
  try   { return JSON.parse(localStorage.getItem(VOTES_KEY) || '{}'); }
  catch { return {}; }
}
function saveLocalVotes(votes) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}
function getLocalVote(songId) {
  const v = getLocalVotes()[songId];
  return (v === 1 || v === -1) ? v : null;
}
function setLocalVote(songId, value) {
  const votes = getLocalVotes();
  if (value === 1 || value === -1) votes[songId] = value;
  else                              delete votes[songId];
  saveLocalVotes(votes);
}


// ── Single-vote submit (called on every + / - click) ─────────────────────────
//
// One UPSERT per click — small payload, batched server-side by Supabase. The
// unique (session_id, song_id) constraint means clicking + then - on the
// same song just updates the existing row rather than inserting a second.

async function submitVote(songId, value) {
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


// ── Leaderboard (DB-aggregated view; falls back to raw table on v1) ──────────

async function fetchLeaderboard() {
  // v2: pre-aggregated `leaderboard` view (~20 rows regardless of total votes)
  try {
    const { data, error } = await supabaseClient
      .from('leaderboard')
      .select('song_id, up, down, score')
      .order('score', { ascending: false })
      .limit(20);
    if (!error && Array.isArray(data)) return data;
    if (error) {
      console.warn('leaderboard view unavailable — falling back to client tally. ' +
                   'Re-run supabase-setup.sql to add the view. (', error.message, ')');
    }
  } catch (e) {
    console.warn('leaderboard view query threw, falling back:', e);
  }

  // v1 fallback: pull every vote and tally in the browser
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


// ── Realtime — instant board updates while BOARD is open ─────────────────────
//
// One websocket channel to `song_votes`. Subscribe only while the BOARD pane
// is visible (saves connection slots on the free tier), unsubscribe on
// navigate-away. If the channel fails (publication not enabled, network
// blip), fall back to a 60-second poll so the board still updates.

let realtimeChannel  = null;
let realtimeDebounce = null;
let realtimeFallback = null;

function subscribeLeaderboard(onChange, debounceMs = 600) {
  if (realtimeChannel) return;
  realtimeChannel = supabaseClient
    .channel('player_live')
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
