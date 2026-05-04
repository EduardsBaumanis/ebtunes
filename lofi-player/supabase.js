// Copyright (C) 2024 Eduarda Baumaņa
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// ── Local vote storage ────────────────────────────────────────────────────────

const VOTES_STORAGE_KEY = 'lofi-player-votes';
const SESSION_ID_KEY    = 'lofi-player-session-id';

function getSessionId() {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function getLocalVotes() {
  try { return JSON.parse(localStorage.getItem(VOTES_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveLocalVotes(votes) {
  localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
}

// Get persisted vote for a song (1, -1, or null)
function getVote(songId) {
  const votes = getLocalVotes();
  return votes[songId] !== undefined ? votes[songId] : null;
}

// Save vote locally (null removes the vote)
function setVote(songId, value) {
  const votes = getLocalVotes();
  if (value === null) {
    delete votes[songId];
  } else {
    votes[songId] = value;
  }
  saveLocalVotes(votes);
}

// ── Server submission ─────────────────────────────────────────────────────────

// Fire-and-forget: sends a single vote to the server immediately.
async function submitVote(songId, value) {
  const sessionId = getSessionId();
  try {
    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, vote: value, sessionId }),
    });
  } catch (err) {
    console.error('Vote submit error:', err);
  }
}
