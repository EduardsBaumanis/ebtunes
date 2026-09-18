// Voting is optional: no SDK, authentication request, storage, or socket blocks playback.
const endpoint = 'https://herfqtxnhouywwqaifkh.supabase.co/rest/v1/';
const key = 'sb_publishable_rRkHWWdhxXRYY64yxGpnxA_DJoSdFV0';
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private browsing still supports session votes. */ } };
let session;
try { session = localStorage.getItem('lofi-player-session-id'); } catch { /* Optional storage. */ }
session ||= `session_${crypto.randomUUID()}`;
try { localStorage.setItem('lofi-player-session-id', session); } catch { /* Optional storage. */ }
const stored = read('player-votes', {});
const votes = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
export const localVote = id => votes[id] === 1 || votes[id] === -1 ? votes[id] : null;
async function request(path, options = {}) {
  const response = await fetch(endpoint + path, {
    ...options, signal: AbortSignal.timeout(10000),
    headers: { apikey: key, 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error(`Ratings unavailable (HTTP ${response.status}).`);
  return response.status === 204 || response.headers.get('content-length') === '0' ? null : response.text().then(text => text ? JSON.parse(text) : null);
}
export async function vote(id, value) {
  if (value === null) {
    await request(`song_votes?session_id=eq.${encodeURIComponent(session)}&song_id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  } else {
    await request('song_votes?on_conflict=session_id,song_id', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ session_id: session, song_id: id, vote: value, updated_at: new Date().toISOString() }),
    });
  }
  if (value === null) delete votes[id]; else votes[id] = value;
  save('player-votes', votes);
}
export async function leaderboard() {
  const rows = await request('leaderboard?select=song_id,up,down,score&order=score.desc&limit=100');
  if (!Array.isArray(rows)) throw new Error('Ratings returned an invalid response.');
  return rows;
}
