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
const FADE_MS = 800;

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

// ── DOM refs ──────────────────────────────────────────────────────────────────

let elPlayerPane, elCodePane, elSongList;
let elPlayerInfo, elPCounter, elPSubtitle, elPTitle, elPKey, elPBpm, elPFeel, elPChords;
let elRingFill, elRingTime;
let elBtnPlay, elBtnShuffle, elTimerSlider, elTimerVal;
let elCodeTitle, elCodeCounter, elCodeArea;

// ── Audio helpers ─────────────────────────────────────────────────────────────

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
    .replace(/\.strudel$/, '')
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
    const meta = { title: filename.replace(/\.strudel$/, '').replace(/-/g, ' '), subtitle: '', key: '', bpm: 0, feel: '', chords: '' };
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
    title.textContent = filename.replace(/\.strudel$/, '').replace(/-/g, ' ');

    item.appendChild(num);
    item.appendChild(title);
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

async function startPlayback() {
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
  await fadeTo(1, FADE_MS);
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
    await startPlayback();
    startTick();
  } else {
    loadCode(entry.code);
  }

  isFading = false;
}

async function jumpTo(idx) {
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
    await startPlayback();
    startTick();
  } else {
    loadCode(entry.code);
  }

  isFading = false;
}

async function togglePlay() {
  if (window._ac) window._ac.resume();

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

  await startPlayback();
  startTick();
}

// ── Code mode actions ─────────────────────────────────────────────────────────

async function runCode() {
  if (window._ac) window._ac.resume();
  const code = elCodeArea.value;
  try { await waitForEditor(); } catch (_) {}
  loadCode(code);
  startEngine();

  // AudioContext may be created during evaluate() — wait briefly
  if (!window._masterGain) {
    await new Promise(r => setTimeout(r, 300));
  }
  setGainImmediate(1);
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

  isFading = false;
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

  // Load first playlist
  switchPlaylist(PLAYLISTS[0]);
}

document.addEventListener('DOMContentLoaded', init);
