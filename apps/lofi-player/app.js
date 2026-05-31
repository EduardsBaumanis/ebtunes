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

// ── Constants ─────────────────────────────────────────────────────────────────

const CIRCUMFERENCE = 2 * Math.PI * 80; // 502.65
const FADE_MS       = 800;              // auto-advance crossfade
const BUILDUP_MS    = 4000;             // slow build-up on user-triggered play

// ── State ─────────────────────────────────────────────────────────────────────

const codeCache     = new Map(); // url → { filename, code, meta }

let currentPlaylist = null;
let currentIdx      = 0;
let currentMode     = 'player'; // 'player' | 'code'

let isPlaying       = false;
let isFading        = false;
let shuffleMode     = false;

let totalMs         = 120_000;
let remainingMs     = totalMs;
let tickId          = null;

let playlistVersion = 0; // bumped on every playlist switch to cancel stale async ops

// Board state — Realtime subscription, no polling. The leaderboard updates
// instantly via Supabase Realtime while the BOARD pane is open, then the
// subscription closes again when the user navigates away.
let boardActive = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────

let elPlayerPane, elCodePane, elBoardPane, elSongList;
let elPlayerInfo, elPCounter, elPSubtitle, elPTitle, elPKey, elPBpm, elPFeel, elPChords;
let elRingFill, elRingTime;
let elBtnPlay, elBtnShuffle, elTimerSlider, elTimerVal;
let elCodeTitle, elCodeCounter, elCodeArea;

// ── Audio helpers ─────────────────────────────────────────────────────────────

// iOS Safari requires AudioContext.resume() and a silent buffer to be triggered
// synchronously inside a user gesture handler. ensureAudio() must be called as
// the FIRST thing in any click/touch handler — before any await — otherwise the
// browser will not unlock audio output and the page stays silent.
let audioUnlocked = false;

function ensureAudio() {
  try {
    // Lazily create the AudioContext via the patched constructor in index.html.
    // The patch wires up a master gain node the first time a context is built.
    if (!window._ac) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) new Ctor();
    }
    if (window._ac && window._ac.state !== 'running') {
      // resume() returns a Promise, but iOS only counts the synchronous call as
      // the user-gesture activation — the promise can resolve later.
      window._ac.resume().catch(() => {});
    }
    if (window._ac && !audioUnlocked) {
      // iOS unlock: play a 1-sample silent buffer connected to the real
      // destination. After this, scheduled audio actually reaches the speaker.
      const ctx = window._ac;
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      try { src.start(0); } catch (_) {}
      audioUnlocked = true;
    }
  } catch (_) { /* ignore: any failure means audio simply won't play */ }
}

function fadeTo(target, ms) {
  return new Promise(resolve => {
    const node = window._masterGain;
    const ac   = window._ac;
    if (!node || !ac) { resolve(); return; }
    ac.resume();
    const t = ac.currentTime;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(node.gain.value, t);
    node.gain.linearRampToValueAtTime(target, t + ms / 1000);
    setTimeout(resolve, ms);
  });
}

function setGainImmediate(v) {
  if (window._masterGain) window._masterGain.gain.value = v;
}

// ── Engine helpers ────────────────────────────────────────────────────────────

function engine() { return document.getElementById('engine'); }

function waitForEditor(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const e = engine();
    if (e && e.editor) { resolve(); return; }
    const t0 = Date.now();
    const id = setInterval(() => {
      const e = engine();
      if (e && e.editor) { clearInterval(id); resolve(); }
      else if (Date.now() - t0 > timeoutMs) { clearInterval(id); reject(new Error('editor timeout')); }
    }, 100);
  });
}

function loadCode(code) {
  const e = engine();
  if (e && e.editor) e.editor.setCode(code);
}

function startEngine() {
  const e = engine();
  if (e && e.editor) { try { e.editor.evaluate(); } catch (_) {} }
}

function stopEngine() {
  const e = engine();
  if (e && e.editor) { try { e.editor.stop(); } catch (_) {} }
}

// ── File loading & metadata ───────────────────────────────────────────────────

function parseMeta(filename, code) {
  // Song files (lofi / rim / acid) have: // "Title"
  const quotedTitle = code.match(/^\/\/\s*"([^"]+)"/m);

  if (quotedTitle) {
    const afterTitle  = code.match(/^\/\/\s*"[^"]+"\n\/\/\s*(.+)/m);
    const keyMatch    = code.match(/^\/\/\s*Key:\s*(.+)/m);
    const bpmMatch    = code.match(/~?(\d+)\s*BPM/i);
    const feelMatch   = code.match(/^\/\/\s*Feel:\s*(.+)/m);
    const chordsMatch = code.match(/^\/\/\s*Chords:\s*(.+)/m);

    return {
      title:    quotedTitle[1],
      subtitle: afterTitle   ? afterTitle[1].trim()          : '',
      key:      keyMatch     ? keyMatch[1].trim()             : '',
      bpm:      bpmMatch     ? parseInt(bpmMatch[1], 10)      : 0,
      feel:     feelMatch    ? feelMatch[1].trim()            : '',
      chords:   chordsMatch  ? chordsMatch[1].trim()          : '',
    };
  }

  // Lesson / cheat / techno lesson files — derive from second comment line
  const lessonLine = code.match(/^\/\/\s*((?:TECHNO\s+)?LESSON\s+\d+\s*:\s*[^\n]+)/m);
  const cheatLine  = code.match(/^\/\/\s*[║╠]\s*(STRUDEL\s+CHEAT\s+SHEET[^\n║╣]+)/m);

  let title = filename
    .replace(/\.(strudel|txt)$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  if (lessonLine)     title = lessonLine[1].trim();
  else if (cheatLine) title = cheatLine[1].trim().replace(/\s+—\s+/, ' — ');

  return { title, subtitle: '', key: '', bpm: 0, feel: '', chords: '' };
}

async function fetchSong(playlist, filename) {
  const url = playlist.path + filename;
  if (codeCache.has(url)) return codeCache.get(url);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const code  = await res.text();
    const meta  = parseMeta(filename, code);
    const entry = { filename, code, meta };
    codeCache.set(url, entry);
    return entry;
  } catch (err) {
    console.error('fetch failed:', url, err);
    const meta = { title: filename.replace(/\.(strudel|txt)$/, '').replace(/-/g, ' '), subtitle: '', key: '', bpm: 0, feel: '', chords: '' };
    return { filename, code: '// Could not load file.\n// Make sure you are running a local web server.', meta };
  }
}

// ── Ring ──────────────────────────────────────────────────────────────────────

function updateRing() {
  const pct    = Math.max(0, remainingMs / totalMs);
  const offset = CIRCUMFERENCE * (1 - pct);
  elRingFill.style.strokeDashoffset = offset;

  const secs = Math.ceil(remainingMs / 1000);
  const m    = Math.floor(secs / 60);
  const s    = secs % 60;
  elRingTime.textContent = m + ':' + String(s).padStart(2, '0');
}

// ── Song UI ───────────────────────────────────────────────────────────────────

function updateSongUI(entry, idx) {
  const { meta } = entry;
  const total    = currentPlaylist.files.length;

  if (currentMode === 'player') {
    elPCounter.textContent  = String(idx + 1).padStart(2, '0') + ' · ' + String(total).padStart(2, '0');
    elPSubtitle.textContent = meta.subtitle || '';
    elPTitle.textContent    = meta.title;
    elPKey.textContent      = meta.key  || '—';
    elPBpm.textContent      = meta.bpm  ? meta.bpm + ' BPM' : '—';
    elPFeel.textContent     = meta.feel   || '';
    elPChords.textContent   = meta.chords || '';
  } else {
    elCodeTitle.textContent   = meta.title;
    elCodeCounter.textContent = String(idx + 1).padStart(2, '0') + ' · ' + String(total).padStart(2, '0');
    elCodeArea.value          = entry.code;
  }

  document.querySelectorAll('.song-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
    if (i === idx) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// ── Vote handler ──────────────────────────────────────────────────────────────

function handleVote(songId, value, clickedBtn, otherBtn) {
  const current = getVote(songId);
  const next    = current === value ? null : value; // toggle off if already voted
  setVote(songId, next);
  clickedBtn.classList.toggle('active', next === value);
  otherBtn.classList.remove('active');
  submitVote(songId, next);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function buildSidebar(playlist) {
  const version = ++playlistVersion;
  elSongList.innerHTML = '';

  playlist.files.forEach((filename, i) => {
    const item = document.createElement('div');
    item.className = 'song-item' + (i === 0 ? ' active' : '');
    item.dataset.idx = i;

    const num   = document.createElement('span');
    num.className = 'si-num';
    num.textContent = String(i + 1).padStart(2, '0');

    const title = document.createElement('span');
    title.className = 'si-title';
    // Placeholder from filename until meta loads
    title.textContent = filename.replace(/\.(strudel|txt)$/, '').replace(/-/g, ' ');

    item.appendChild(num);
    item.appendChild(title);

    // +/- vote buttons on player-mode playlists
    if (playlist.mode === 'player') {
      const songId  = playlist.id + '/' + filename;
      const current = getVote(songId);

      const voteWrap = document.createElement('div');
      voteWrap.className = 'si-votes';

      const btnMinus = document.createElement('button');
      btnMinus.className = 'si-vote-btn si-vote-minus';
      btnMinus.textContent = '-';
      if (current === -1) btnMinus.classList.add('active');

      const btnPlus = document.createElement('button');
      btnPlus.className = 'si-vote-btn si-vote-plus';
      btnPlus.textContent = '+';
      if (current === 1) btnPlus.classList.add('active');

      btnMinus.addEventListener('click', e => { e.stopPropagation(); handleVote(songId, -1, btnMinus, btnPlus); });
      btnPlus.addEventListener('click',  e => { e.stopPropagation(); handleVote(songId,  1, btnPlus,  btnMinus); });

      voteWrap.appendChild(btnMinus);
      voteWrap.appendChild(btnPlus);
      item.appendChild(voteWrap);
    }

    item.addEventListener('click', () => jumpTo(i));
    elSongList.appendChild(item);
  });

  // Update titles from fetched metadata as they arrive
  playlist.files.forEach((filename, i) => {
    fetchSong(playlist, filename).then(entry => {
      if (playlistVersion !== version) return; // playlist changed
      const items = elSongList.querySelectorAll('.song-item');
      if (items[i]) items[i].querySelector('.si-title').textContent = entry.meta.title;
    });
  });
}

// ── Tick ──────────────────────────────────────────────────────────────────────

function clearTick() {
  if (tickId) { clearInterval(tickId); tickId = null; }
}

function startTick() {
  clearTick();
  tickId = setInterval(async () => {
    if (isFading) return;
    remainingMs = Math.max(0, remainingMs - 100);
    updateRing();
    if (remainingMs === 0) await advance(1);
  }, 100);
}

// ── Player transitions ────────────────────────────────────────────────────────

// fadeMs: BUILDUP_MS on user-triggered play, FADE_MS on auto-advance
async function startPlayback(fadeMs = FADE_MS) {
  const entry = await fetchSong(currentPlaylist, currentPlaylist.files[currentIdx]);
  setGainImmediate(0);
  loadCode(entry.code);
  startEngine();

  if (!window._masterGain) {
    const deadline = Date.now() + 1000;
    while (!window._masterGain && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 30));
    }
  }

  setGainImmediate(0);
  await fadeTo(1, fadeMs);
}

async function advance(dir) {
  if (isFading) return;
  isFading = true;
  clearTick();

  if (isPlaying) {
    elPlayerInfo.style.opacity = '0';
    await fadeTo(0, FADE_MS);
    stopEngine();
  }

  if (shuffleMode && currentPlaylist.files.length > 1) {
    let next;
    do { next = Math.floor(Math.random() * currentPlaylist.files.length); } while (next === currentIdx);
    currentIdx = next;
  } else {
    currentIdx = ((currentIdx + dir) % currentPlaylist.files.length + currentPlaylist.files.length) % currentPlaylist.files.length;
  }

  remainingMs = totalMs;
  updateRing();

  const entry = await fetchSong(currentPlaylist, currentPlaylist.files[currentIdx]);
  updateSongUI(entry, currentIdx);
  elPlayerInfo.style.opacity = '1';

  if (isPlaying) {
    await startPlayback(FADE_MS); // auto-advance uses quick crossfade
    startTick();
  } else {
    loadCode(entry.code);
  }

  isFading = false;
}

async function jumpTo(idx) {
  ensureAudio();
  if (currentMode === 'code') {
    if (isFading) return;
    isFading = true;
    stopEngine();
    setGainImmediate(0);
    currentIdx = idx;
    const entry = await fetchSong(currentPlaylist, currentPlaylist.files[idx]);
    updateSongUI(entry, idx);
    isFading = false;
    return;
  }

  if (idx === currentIdx || isFading) return;
  isFading = true;
  clearTick();

  if (isPlaying) {
    elPlayerInfo.style.opacity = '0';
    await fadeTo(0, FADE_MS);
    stopEngine();
  }

  currentIdx  = idx;
  remainingMs = totalMs;
  updateRing();

  const entry = await fetchSong(currentPlaylist, currentPlaylist.files[idx]);
  updateSongUI(entry, idx);
  elPlayerInfo.style.opacity = '1';

  if (isPlaying) {
    await startPlayback(BUILDUP_MS); // user clicked: slow build-up
    startTick();
  } else {
    loadCode(entry.code);
  }

  isFading = false;
}

async function togglePlay() {
  ensureAudio();

  if (isPlaying) {
    clearTick();
    await fadeTo(0, 600);
    stopEngine();
    isPlaying = false;
    elBtnPlay.textContent = '▶';
    elRingFill.classList.remove('playing');
    return;
  }

  isPlaying = true;
  elBtnPlay.textContent = '■';
  elRingFill.classList.add('playing');

  try {
    await waitForEditor();
  } catch (_) {
    isPlaying = false;
    elBtnPlay.textContent = '▶';
    elRingFill.classList.remove('playing');
    return;
  }

  await startPlayback(BUILDUP_MS); // user pressed play: slow build-up
  startTick();
}

// ── Code mode actions ─────────────────────────────────────────────────────────

async function runCode() {
  ensureAudio();
  const code = elCodeArea.value;
  try { await waitForEditor(); } catch (_) {}
  loadCode(code);
  startEngine();

  // AudioContext may be created during evaluate() — wait briefly
  if (!window._masterGain) {
    await new Promise(r => setTimeout(r, 300));
  }
  setGainImmediate(0);
  await fadeTo(1, BUILDUP_MS); // code mode also gets a slow build-up
}

function stopCode() {
  stopEngine();
  setGainImmediate(0);
}

async function codeAdvance(dir) {
  if (isFading) return;
  stopCode();
  isFading = true;
  currentIdx = ((currentIdx + dir) % currentPlaylist.files.length + currentPlaylist.files.length) % currentPlaylist.files.length;
  const entry = await fetchSong(currentPlaylist, currentPlaylist.files[currentIdx]);
  updateSongUI(entry, currentIdx);
  isFading = false;
}

// ── Playlist switching ────────────────────────────────────────────────────────

async function switchPlaylist(playlist) {
  if (currentPlaylist === playlist) return;

  // Stop everything cleanly
  isFading = true;
  clearTick();
  setGainImmediate(0);
  stopEngine();
  isPlaying = false;

  currentPlaylist = playlist;
  currentIdx      = 0;
  currentMode     = playlist.mode;

  // Apply visual theme
  document.body.dataset.theme = playlist.theme || 'acid';

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === playlist.id);
  });

  // Switch pane
  if (currentMode === 'player') {
    elPlayerPane.classList.remove('hidden');
    elCodePane.classList.add('hidden');
    elBtnPlay.textContent = '▶';
    elRingFill.classList.remove('playing');
    remainingMs = totalMs;
    updateRing();
  } else {
    elPlayerPane.classList.add('hidden');
    elCodePane.classList.remove('hidden');
  }

  // Build sidebar (async title updates)
  buildSidebar(playlist);

  // Load first file
  const entry = await fetchSong(playlist, playlist.files[0]);
  updateSongUI(entry, 0);

  // Pre-load code into engine (player mode only)
  if (currentMode === 'player') loadCode(entry.code);

  // Re-hide content panes if board is open
  if (boardActive) {
    elPlayerPane.classList.add('hidden');
    elCodePane.classList.add('hidden');
  }

  isFading = false;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

// fetchLeaderboard is defined in supabase.js (uses Supabase client directly)

function songLabel(songId) {
  const parts    = songId.split('/');
  const playlist = (parts[0] || '').toUpperCase();
  const raw      = (parts[1] || songId).replace(/\.(strudel|txt)$/, '');
  // strip leading "type-NN-" prefix (song-01-, acid-03-, rim-02-, etc.)
  const name     = raw.replace(/^[a-z]+-\d+-/, '').replace(/-/g, ' ').toUpperCase();
  return { playlist, name };
}

function renderLeaderboard(entries) {
  const content = document.getElementById('board-content');
  if (!entries.length) {
    content.innerHTML = '<div class="board-empty">NO VOTES YET</div>';
    return;
  }
  const rows = entries.map((e, i) => {
    const { playlist, name } = songLabel(e.song_id);
    const sign = e.score > 0 ? '+' : '';
    const cls  = e.score > 0 ? 'positive' : e.score < 0 ? 'negative' : '';
    return `<div class="lb-row">
      <span class="lb-rank">${String(i + 1).padStart(2, '0')}</span>
      <span class="lb-name">${name}</span>
      <span class="lb-tag">${playlist}</span>
      <span class="lb-up">+${e.up}</span>
      <span class="lb-down">-${e.down}</span>
      <span class="lb-score ${cls}">${sign}${e.score}</span>
    </div>`;
  }).join('');
  content.innerHTML = `<div class="lb-table">
    <div class="lb-head">
      <span class="lb-rank">#</span>
      <span class="lb-name">SONG</span>
      <span class="lb-tag">LIST</span>
      <span class="lb-up">+</span>
      <span class="lb-down">-</span>
      <span class="lb-score">NET</span>
    </div>${rows}</div>`;
}

function setBoardStatus(state) {
  // state: 'loading' | 'live' | 'offline'
  const el = document.getElementById('board-refresh-timer');
  if (!el) return;
  el.classList.toggle('live',    state === 'live');
  el.classList.toggle('loading', state === 'loading');
  el.textContent = state === 'live' ? '● LIVE' : state === 'loading' ? 'REFRESHING…' : '';
}

async function refreshBoard() {
  setBoardStatus('loading');
  const entries = await fetchLeaderboard();
  renderLeaderboard(entries);
  setBoardStatus('live');
}

function showBoard() {
  boardActive = true;
  document.getElementById('btn-board').classList.add('active');
  elBoardPane.classList.remove('hidden');
  elPlayerPane.classList.add('hidden');
  elCodePane.classList.add('hidden');
  refreshBoard();
  // Subscribe to live vote changes. Any insert/update/delete triggers a
  // debounced refetch of the (DB-aggregated, ~20-row) leaderboard view.
  subscribeLeaderboard(refreshBoard);
}

function hideBoard() {
  boardActive = false;
  document.getElementById('btn-board').classList.remove('active');
  elBoardPane.classList.add('hidden');
  unsubscribeLeaderboard();
  if (currentMode === 'player') elPlayerPane.classList.remove('hidden');
  else                          elCodePane.classList.remove('hidden');
}

function toggleBoard() {
  if (boardActive) hideBoard();
  else             showBoard();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSecs(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  elPlayerPane  = document.getElementById('player-pane');
  elCodePane    = document.getElementById('code-pane');
  elBoardPane   = document.getElementById('board-pane');
  elSongList    = document.getElementById('song-list');

  elPlayerInfo  = document.getElementById('player-info');
  elPCounter    = document.getElementById('p-counter');
  elPSubtitle   = document.getElementById('p-subtitle');
  elPTitle      = document.getElementById('p-title');
  elPKey        = document.getElementById('p-key');
  elPBpm        = document.getElementById('p-bpm');
  elPFeel       = document.getElementById('p-feel');
  elPChords     = document.getElementById('p-chords');

  elRingFill    = document.getElementById('ring-fill');
  elRingTime    = document.getElementById('ring-time');
  elBtnPlay     = document.getElementById('btn-play');
  elBtnShuffle  = document.getElementById('btn-shuffle');
  elTimerSlider = document.getElementById('timer-slider');
  elTimerVal    = document.getElementById('timer-val');

  elCodeTitle   = document.getElementById('code-title');
  elCodeCounter = document.getElementById('code-counter');
  elCodeArea    = document.getElementById('code-area');

  // Ring setup
  elRingFill.style.strokeDasharray  = CIRCUMFERENCE;
  elRingFill.style.strokeDashoffset = 0;

  // Build playlist tab buttons
  const tabsEl = document.getElementById('playlist-tabs');
  PLAYLISTS.forEach(pl => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.id = pl.id;
    btn.textContent = pl.label;
    btn.addEventListener('click', () => switchPlaylist(pl));
    tabsEl.appendChild(btn);
  });

  // Timer slider
  elTimerSlider.addEventListener('input', () => {
    const secs  = parseInt(elTimerSlider.value, 10);
    totalMs     = secs * 1000;
    remainingMs = totalMs;
    elTimerVal.textContent = fmtSecs(secs);
    updateRing();
  });

  // Player controls
  elBtnPlay.addEventListener('click', togglePlay);
  document.getElementById('btn-next').addEventListener('click', () => advance(1));
  document.getElementById('btn-prev').addEventListener('click', () => advance(-1));

  elBtnShuffle.addEventListener('click', () => {
    shuffleMode = !shuffleMode;
    elBtnShuffle.classList.toggle('active', shuffleMode);
  });

  document.getElementById('btn-board').addEventListener('click', toggleBoard);

  // Submit ratings button
  document.getElementById('btn-submit-votes').addEventListener('click', async () => {
    const btn = document.getElementById('btn-submit-votes');
    btn.textContent = 'SENDING...';
    btn.disabled = true;
    const ok = await submitAllVotes();
    btn.classList.add(ok ? 'submitted' : 'error');
    btn.textContent = ok ? 'SUBMITTED ✓' : 'ERROR — RETRY';
    // If the leaderboard is open, refresh immediately so the user sees
    // their votes reflected without waiting for the Realtime echo.
    if (ok && boardActive) refreshBoard();
    setTimeout(() => {
      btn.classList.remove('submitted', 'error');
      updateSubmitButton();
    }, 2500);
  });

  // Code controls
  document.getElementById('btn-run').addEventListener('click', runCode);
  document.getElementById('btn-stop').addEventListener('click', stopCode);
  document.getElementById('code-prev').addEventListener('click', () => codeAdvance(-1));
  document.getElementById('code-next').addEventListener('click', () => codeAdvance(1));

  // Code textarea keyboard shortcuts
  elCodeArea.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); runCode(); }
    if (e.ctrlKey && e.key === '.')     { e.preventDefault(); stopCode(); }
  });

  // Global keyboard (player mode only)
  document.addEventListener('keydown', e => {
    if (e.target === elCodeArea)       return;
    if (e.target.tagName === 'INPUT')  return;
    if (currentMode !== 'player')      return;
    if (e.key === ' ' || e.key === 'k')                            { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') advance(1);
    if (e.key === 'ArrowLeft'  || e.key === 'j' || e.key === 'J') advance(-1);
    if (e.key === 's' || e.key === 'S') elBtnShuffle.click();
  });

  // First-touch global audio unlock — iOS requires a user-gesture-synchronous
  // resume() before any sound can come out. Fires once on the first interaction
  // so audio is already unlocked by the time the user taps Play.
  const unlockOnce = () => {
    ensureAudio();
    if (audioUnlocked) {
      window.removeEventListener('touchstart', unlockOnce, true);
      window.removeEventListener('touchend',   unlockOnce, true);
      window.removeEventListener('mousedown',  unlockOnce, true);
      window.removeEventListener('keydown',    unlockOnce, true);
    }
  };
  window.addEventListener('touchstart', unlockOnce, true);
  window.addEventListener('touchend',   unlockOnce, true);
  window.addEventListener('mousedown',  unlockOnce, true);
  window.addEventListener('keydown',    unlockOnce, true);

  // Load first playlist
  switchPlaylist(PLAYLISTS[0]);

  // Init submit button state from any pending votes carried over from last session
  updateSubmitButton();
}

document.addEventListener('DOMContentLoaded', init);
