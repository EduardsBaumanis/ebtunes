// ── Supabase config ───────────────────────────────────────────────────────────

const SUPABASE_URL     = 'https://herfqtxnhouywwqaifkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rRkHWWdhxXRYY64yxGpnxA_DJoSdFV0';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Storage keys ──────────────────────────────────────────────────────────────

const VOTES_STORAGE_KEY   = 'lofi-player-votes';
const SESSION_ID_KEY      = 'lofi-player-session-id';
const PENDING_VOTES_KEY   = 'lofi-player-pending';

// ── Session ID ────────────────────────────────────────────────────────────────

function getSessionId() {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// ── Local votes ───────────────────────────────────────────────────────────────

function getLocalVotes() {
  try { return JSON.parse(localStorage.getItem(VOTES_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveLocalVotes(votes) {
  localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
}

function getVote(songId) {
  const votes = getLocalVotes();
  return votes[songId] !== undefined ? votes[songId] : null;
}

function setVote(songId, value) {
  const votes = getLocalVotes();
  if (value === null) delete votes[songId];
  else votes[songId] = value;
  saveLocalVotes(votes);
}

// ── Pending set (votes not yet submitted to Supabase) ─────────────────────────

function getPendingSet() {
  try { return new Set(JSON.parse(localStorage.getItem(PENDING_VOTES_KEY) || '[]')); }
  catch { return new Set(); }
}

function savePendingSet(s) {
  localStorage.setItem(PENDING_VOTES_KEY, JSON.stringify([...s]));
}

function addPending(songId) {
  const s = getPendingSet();
  s.add(songId);
  savePendingSet(s);
}

function removePending(songId) {
  const s = getPendingSet();
  s.delete(songId);
  savePendingSet(s);
}

function clearPending() {
  localStorage.removeItem(PENDING_VOTES_KEY);
}

// Count pending entries that still carry an active vote (not null)
function pendingCount() {
  const votes   = getLocalVotes();
  const pending = getPendingSet();
  let count = 0;
  for (const id of pending) {
    if (votes[id] === 1 || votes[id] === -1) count++;
  }
  return count;
}

// ── Submit button state ───────────────────────────────────────────────────────

function updateSubmitButton() {
  const btn     = document.getElementById('btn-submit-votes');
  const counter = document.getElementById('submit-count');
  if (!btn || !counter) return;
  const count = pendingCount();
  counter.textContent = count + ' / 5';
  btn.disabled = count < 5;
  btn.classList.toggle('ready', count >= 5);
  if (!btn.classList.contains('submitted') && !btn.classList.contains('error')) {
    btn.textContent = 'SUBMIT RATINGS';
  }
}

// ── Mark vote as pending (called on every click, no immediate send) ───────────

function submitVote(songId, value) {
  if (value !== null) {
    addPending(songId);
  } else {
    removePending(songId);
  }
  updateSubmitButton();
}

// ── Batch submit to Supabase ──────────────────────────────────────────────────

async function submitAllVotes() {
  const pending   = getPendingSet();
  const votes     = getLocalVotes();
  const sessionId = getSessionId();

  const toUpsert = [];
  const toDelete = [];

  for (const songId of pending) {
    const vote = votes[songId];
    if (vote === 1 || vote === -1) {
      const now = new Date().toISOString();
      toUpsert.push({ session_id: sessionId, song_id: songId, vote, created_at: now, updated_at: now });
    } else {
      toDelete.push(songId);
    }
  }

  try {
    if (toUpsert.length > 0) {
      const { error } = await supabaseClient
        .from('song_votes')
        .upsert(toUpsert, { onConflict: 'session_id,song_id' });
      if (error) throw error;
    }
    for (const songId of toDelete) {
      const { error } = await supabaseClient
        .from('song_votes')
        .delete()
        .eq('session_id', sessionId)
        .eq('song_id', songId);
      if (error) throw error;
    }
    clearPending();
    return true;
  } catch (err) {
    console.error('Submit error:', err);
    return false;
  }
}

// ── Leaderboard fetch (Postgres-aggregated `leaderboard` view) ───────────────
//
// The view does SUM/COUNT in the database, so each refresh transfers ~20 rows
// (the visible leaderboard) instead of every vote row ever cast. With 5 KB
// total payload regardless of how many votes exist, the free-tier 5 GB/month
// egress comfortably fits hundreds of thousands of refreshes.

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

// ── Realtime subscription ────────────────────────────────────────────────────
//
// One websocket channel to `song_votes`. Any insert / update / delete fires
// `onChange` — debounced by 600 ms so a batch UPSERT (multiple rows in one
// HTTP call) results in a single refetch instead of one per row. Subscribe
// only while the BOARD pane is visible so idle tabs don't keep a connection
// open (Supabase free tier caps concurrent Realtime connections at 200).

let realtimeChannel  = null;
let realtimeDebounce = null;

function subscribeLeaderboard(onChange, debounceMs = 600) {
  if (realtimeChannel) return;            // already subscribed
  realtimeChannel = supabaseClient
    .channel('song_votes_live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'song_votes' },
      () => {
        clearTimeout(realtimeDebounce);
        realtimeDebounce = setTimeout(onChange, debounceMs);
      }
    )
    .subscribe();
}

function unsubscribeLeaderboard() {
  if (realtimeDebounce) { clearTimeout(realtimeDebounce); realtimeDebounce = null; }
  if (realtimeChannel)  { supabaseClient.removeChannel(realtimeChannel); realtimeChannel = null; }
}
