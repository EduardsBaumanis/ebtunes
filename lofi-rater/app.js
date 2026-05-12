// Copyright (C) 2024 Eduarda Baumaņa
// AGPL-3.0 — see LICENSE.

// ── State ─────────────────────────────────────────────────────────────────────

const FADE_MS    = 400;
const FLASH_MS   = 220;

const codeCache  = new Map();   // url → { filename, code, meta }
let SONG_POOL    = [];          // list of { filename, pack, songId } from pack-demos
let currentSong  = null;
let isPlaying    = false;
let audioUnlocked = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────

let elRatePane, elBoardPane;
let elCounter, elInfo, elSubtitle, elTitle, elKey, elBpm, elPack, elFeel, elChords;
let elBtnPlay, elBtnNot, elBtnHot, elBtnSkip, elDone;
let elBoardContent, elBoardStatus;
let elTabRate, elTabBoard;

// ── Audio helpers (same iOS-unlock dance as lofi-player) ──────────────────────

function ensureAudio() {
  try {
    if (!window._ac) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) new Ctor();
    }
    if (window._ac && window._ac.state !== 'running') {
      window._ac.resume().catch(() => {});
    }
    if (window._ac && !audioUnlocked) {
      const ctx = window._ac;
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      try { src.start(0); } catch (_) {}
      audioUnlocked = true;
    }
  } catch (_) {}
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

function engine() { return document.getElementById('engine'); }

function waitForEditor(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const e = engine();
      if (e && e.editor) { clearInterval(id); resolve(); }
      else if (Date.now() - t0 > timeoutMs) { clearInterval(id); reject(new Error('editor timeout')); }
    }, 100);
  });
}

function loadCode(code)  { const e = engine(); if (e && e.editor) e.editor.setCode(code); }
function startEngine()   { const e = engine(); if (e && e.editor) { try { e.editor.evaluate(); } catch (_) {} } }
function stopEngine()    { const e = engine(); if (e && e.editor) { try { e.editor.stop();     } catch (_) {} } }

// ── Metadata parser (same shape lofi-player uses) ─────────────────────────────

function parseMeta(filename, code) {
  const quotedTitle = code.match(/^\/\/\s*"([^"]+)"/m);
  if (quotedTitle) {
    const afterTitle  = code.match(/^\/\/\s*"[^"]+"\n\/\/\s*(.+)/m);
    const keyMatch    = code.match(/^\/\/\s*Key:\s*(.+)/m);
    const bpmMatch    = code.match(/~?(\d+)\s*BPM/i);
    const feelMatch   = code.match(/^\/\/\s*Feel:\s*(.+)/m);
    const chordsMatch = code.match(/^\/\/\s*Chords:\s*(.+)/m);
    return {
      title:    quotedTitle[1],
      subtitle: afterTitle   ? afterTitle[1].trim() : '',
      key:      keyMatch     ? keyMatch[1].trim()    : '',
      bpm:      bpmMatch     ? parseInt(bpmMatch[1], 10) : 0,
      feel:     feelMatch    ? feelMatch[1].trim()   : '',
      chords:   chordsMatch  ? chordsMatch[1].trim() : '',
    };
  }
  const title = filename
    .replace(/\.strudel$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return { title, subtitle: '', key: '', bpm: 0, feel: '', chords: '' };
}

async function fetchSong(filename) {
  const url = '../pack-demos/' + filename;
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
    return {
      filename,
      code: '// Could not load file.\n// Run a local server (npx serve .) so fetch() works.',
      meta: { title: filename, subtitle: '', key: '', bpm: 0, feel: '', chords: '' },
    };
  }
}

// ── Song pool ─────────────────────────────────────────────────────────────────
//
// Read the `demos` playlist from lofi-player so adding files to pack-demos/
// auto-grows the rater's pool. Filenames stay namespaced "demos/<file>"
// in song_id space so leaderboard rows from the rater align with the ones
// the lofi-player DEMOS tab uses.

function packLabel(filename) {
  // `dirt-1-boom_bap.strudel` → `DIRT` (the slug before the first dash + digit)
  const m = filename.match(/^([a-z0-9-]+?)-\d+-/i);
  return (m ? m[1] : filename.replace(/\.strudel$/, '')).toUpperCase();
}

function buildPool() {
  if (typeof PLAYLISTS === 'undefined') {
    console.error('PLAYLISTS not loaded; check ../lofi-player/playlists.js include');
    return [];
  }
  const demos = PLAYLISTS.find(p => p.id === 'demos');
  if (!demos) return [];
  return demos.files.map(filename => ({
    filename,
    pack:   packLabel(filename),
    songId: 'demos/' + filename,    // matches lofi-player's song_id namespace
  }));
}

function pickRandom() {
  const rated = getRatedSet();
  const left  = SONG_POOL.filter(s => !rated.has(s.songId));
  if (left.length === 0) return null;
  if (left.length === 1) return left[0];
  // Avoid showing the same song twice in a row.
  let pick;
  do { pick = left[Math.floor(Math.random() * left.length)]; }
  while (currentSong && left.length > 1 && pick.songId === currentSong.songId);
  return pick;
}

// ── Rate UI ───────────────────────────────────────────────────────────────────

function updateCounter() {
  const rated = getRatedSet().size;
  const total = SONG_POOL.length;
  elCounter.textContent = String(rated).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
}

function showDone() {
  elInfo.classList.add('hidden');
  document.querySelector('.rate-transport').classList.add('hidden');
  document.querySelector('.vote-row').classList.add('hidden');
  elBtnSkip.classList.add('hidden');
  document.querySelector('.hints').classList.add('hidden');
  elDone.classList.remove('hidden');
}

function hideDone() {
  elInfo.classList.remove('hidden');
  document.querySelector('.rate-transport').classList.remove('hidden');
  document.querySelector('.vote-row').classList.remove('hidden');
  elBtnSkip.classList.remove('hidden');
  document.querySelector('.hints').classList.remove('hidden');
  elDone.classList.add('hidden');
}

async function loadSong(song) {
  if (!song) { showDone(); return; }
  hideDone();
  currentSong = song;

  // Crossfade out the previous one if anything was playing.
  if (isPlaying) {
    await fadeTo(0, FADE_MS);
    stopEngine();
    isPlaying = false;
    elBtnPlay.textContent = '▶';
  }

  elInfo.style.opacity = '0';
  const entry = await fetchSong(song.filename);
  const m     = entry.meta;
  elSubtitle.textContent = m.subtitle || '';
  elTitle.textContent    = m.title;
  elKey.textContent      = m.key || '—';
  elBpm.textContent      = m.bpm ? m.bpm + ' BPM' : '—';
  elPack.textContent     = song.pack;
  elFeel.textContent     = m.feel   || '';
  elChords.textContent   = m.chords || '';
  elInfo.style.opacity = '1';

  // Pre-load code into the engine so pressing play has a tighter start.
  loadCode(entry.code);
  updateCounter();
}

async function togglePlay() {
  ensureAudio();
  if (!currentSong) return;
  if (isPlaying) {
    await fadeTo(0, 350);
    stopEngine();
    isPlaying = false;
    elBtnPlay.textContent = '▶';
    return;
  }
  try { await waitForEditor(); } catch (_) { return; }
  isPlaying = true;
  elBtnPlay.textContent = '■';
  setGainImmediate(0);
  startEngine();
  if (!window._masterGain) {
    const deadline = Date.now() + 1000;
    while (!window._masterGain && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 30));
    }
  }
  setGainImmediate(0);
  await fadeTo(1, 1200);   // user-triggered play gets a softer build-up
}

async function vote(value) {
  if (!currentSong) return;

  const btn = value === 1 ? elBtnHot : elBtnNot;
  btn.classList.add('flash');

  // Optimistic local mark + Supabase submit in parallel with the visual flash.
  const songId = currentSong.songId;
  markRated(songId);
  const submitted = submitVote(songId, value);

  await new Promise(r => setTimeout(r, FLASH_MS));
  btn.classList.remove('flash');

  const ok = await submitted;
  if (!ok) {
    // Failed to reach Supabase. Keep the local mark so the user isn't shown
    // the same song again right away, but log so it shows in console.
    console.warn('vote not saved to supabase — kept locally');
  }

  await loadSong(pickRandom());
}

async function skip() {
  ensureAudio();
  await loadSong(pickRandom());
}

function resetLocalHistory() {
  clearRated();
  hideDone();
  loadSong(pickRandom());
}

// ── Board (same shape as lofi-player) ─────────────────────────────────────────

function songLabel(songId) {
  const parts    = songId.split('/');
  const playlist = (parts[0] || '').toUpperCase();
  const raw      = (parts[1] || songId).replace(/\.strudel$/, '');
  const name     = raw.replace(/^[a-z]+-\d+-/i, '').replace(/[-_]/g, ' ').toUpperCase();
  return { playlist, name };
}

function renderLeaderboard(entries) {
  if (!entries.length) {
    elBoardContent.innerHTML = '<div class="board-empty">NO VOTES YET</div>';
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
  elBoardContent.innerHTML = `<div class="lb-table">
    <div class="lb-head">
      <span class="lb-rank">#</span>
      <span class="lb-name">SONG</span>
      <span class="lb-tag">PACK</span>
      <span class="lb-up">+</span>
      <span class="lb-down">-</span>
      <span class="lb-score">NET</span>
    </div>${rows}</div>`;
}

function setBoardStatus(state) {
  if (!elBoardStatus) return;
  elBoardStatus.classList.toggle('live',    state === 'live');
  elBoardStatus.classList.toggle('loading', state === 'loading');
  elBoardStatus.textContent = state === 'live' ? '● LIVE' : state === 'loading' ? 'REFRESHING…' : '';
}

async function refreshBoard() {
  setBoardStatus('loading');
  const entries = await fetchLeaderboard();
  renderLeaderboard(entries);
  setBoardStatus('live');
}

function showRate() {
  elTabRate.classList.add('active');
  elTabBoard.classList.remove('active');
  elRatePane.classList.remove('hidden');
  elBoardPane.classList.add('hidden');
  unsubscribeLeaderboard();
  setBoardStatus('');
}

function showBoard() {
  elTabBoard.classList.add('active');
  elTabRate.classList.remove('active');
  elBoardPane.classList.remove('hidden');
  elRatePane.classList.add('hidden');
  refreshBoard();
  subscribeLeaderboard(refreshBoard);
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  elRatePane     = document.getElementById('rate-pane');
  elBoardPane    = document.getElementById('board-pane');

  elCounter      = document.getElementById('rate-counter');
  elInfo         = document.getElementById('rate-info');
  elSubtitle     = document.getElementById('r-subtitle');
  elTitle        = document.getElementById('r-title');
  elKey          = document.getElementById('r-key');
  elBpm          = document.getElementById('r-bpm');
  elPack         = document.getElementById('r-pack');
  elFeel         = document.getElementById('r-feel');
  elChords       = document.getElementById('r-chords');

  elBtnPlay      = document.getElementById('btn-play');
  elBtnNot       = document.getElementById('btn-not');
  elBtnHot       = document.getElementById('btn-hot');
  elBtnSkip      = document.getElementById('btn-skip');
  elDone         = document.getElementById('rate-done');

  elBoardContent = document.getElementById('board-content');
  elBoardStatus  = document.getElementById('board-status');

  elTabRate      = document.getElementById('tab-rate');
  elTabBoard     = document.getElementById('tab-board');

  SONG_POOL = buildPool();

  // Wiring
  elBtnPlay.addEventListener('click',  togglePlay);
  elBtnNot.addEventListener('click',   () => { ensureAudio(); vote(-1); });
  elBtnHot.addEventListener('click',   () => { ensureAudio(); vote(1);  });
  elBtnSkip.addEventListener('click',  skip);

  document.getElementById('btn-go-board').addEventListener('click', showBoard);
  document.getElementById('btn-reset-votes').addEventListener('click', resetLocalHistory);

  elTabRate.addEventListener('click',  showRate);
  elTabBoard.addEventListener('click', showBoard);

  // One-shot audio unlock on first interaction (iOS Safari).
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

  // Keyboard shortcuts (rate pane only).
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (!elRatePane.classList.contains('hidden')) {
      if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') { e.preventDefault(); ensureAudio(); vote(1);  }
      if (e.key === 'ArrowLeft'  || e.key === 'j' || e.key === 'J') { e.preventDefault(); ensureAudio(); vote(-1); }
      if (e.key === ' '          || e.key === 'k' || e.key === 'K') { e.preventDefault(); togglePlay(); }
      if (e.key === 's'          || e.key === 'S')                  { e.preventDefault(); skip(); }
    }
    if (e.key === 'b' || e.key === 'B') showBoard();
    if (e.key === 'r' || e.key === 'R') showRate();
  });

  loadSong(pickRandom());
}

document.addEventListener('DOMContentLoaded', init);
