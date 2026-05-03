const CIRCUMFERENCE = 2 * Math.PI * 80; // 502.65

let songs       = [];
let currentIdx  = 0;
let isPlaying   = false;
let shuffleMode = false;
let totalMs     = 120_000;
let remainingMs = totalMs;
let tickId      = null;
let isFading    = false;

const FADE_MS = 1000;

// ── DOM refs ──────────────────────────────────────────────────────────────────

let elSongInfo, elSongNumber, elSongSubtitle, elSongTitle;
let elSongKey, elSongBpm, elSongFeel, elSongChords;
let elRingFill, elRingTime;
let elBtnPlay, elBtnShuffle, elTimerSlider, elTimerVal;
let elPlaylist;

// ── Audio helpers ─────────────────────────────────────────────────────────────

function fadeTo(target, ms) {
  return new Promise(resolve => {
    const node = window._masterGain;
    const ac   = window._ac;
    if (!node || !ac) { resolve(); return; }
    // Always try to resume — critical when called from async continuations
    // where the user gesture chain may have been broken by an earlier await.
    ac.resume();
    const t = ac.currentTime;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(node.gain.value, t);
    node.gain.linearRampToValueAtTime(target, t + ms / 1000);
    setTimeout(resolve, ms);
  });
}

function setGainImmediate(value) {
  if (window._masterGain) window._masterGain.gain.value = value;
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

function loadCode(song) {
  const e = engine();
  if (e && e.editor) e.editor.setCode(song.code);
}

function startEngine() {
  const e = engine();
  if (e && e.editor) { try { e.editor.evaluate(); } catch (_) {} }
}

function stopEngine() {
  const e = engine();
  if (e && e.editor) { try { e.editor.stop(); } catch (_) {} }
}

// Start a song and fade in. Handles the case where AudioContext is created
// lazily inside evaluate() — polls briefly until _masterGain appears.
async function startPlayback() {
  setGainImmediate(0);
  loadCode(songs[currentIdx]);
  startEngine();

  // evaluate() may create the AudioContext synchronously or shortly after.
  // Poll until _masterGain is available (max ~1 s).
  if (!window._masterGain) {
    const deadline = Date.now() + 1000;
    while (!window._masterGain && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 30));
    }
  }

  setGainImmediate(0); // ensure gain is 0 before ramp (context just created)
  await fadeTo(1, FADE_MS); // fadeTo calls ac.resume() internally
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

function updateSongUI(song, idx) {
  elSongNumber.textContent   = String(idx + 1).padStart(2, '0') + ' / ' + songs.length;
  elSongSubtitle.textContent = song.subtitle || '';
  elSongTitle.textContent    = song.title;
  elSongKey.textContent      = song.key;
  elSongBpm.textContent      = song.bpm + ' BPM';
  elSongFeel.textContent     = song.feel   || '';
  elSongChords.textContent   = song.chords || '';

  document.querySelectorAll('.playlist-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
    if (i === idx) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// ── Tick (countdown) ──────────────────────────────────────────────────────────

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

// ── Core transitions ──────────────────────────────────────────────────────────

async function advance(dir) {
  if (isFading) return;
  isFading = true;
  clearTick();

  if (isPlaying) {
    elSongInfo.style.opacity = '0';
    await fadeTo(0, FADE_MS);
    stopEngine();
  }

  if (shuffleMode && songs.length > 1) {
    let next;
    do { next = Math.floor(Math.random() * songs.length); } while (next === currentIdx);
    currentIdx = next;
  } else {
    currentIdx = ((currentIdx + dir) % songs.length + songs.length) % songs.length;
  }

  remainingMs = totalMs;
  updateRing();
  updateSongUI(songs[currentIdx], currentIdx);
  elSongInfo.style.opacity = '1';

  if (isPlaying) {
    await startPlayback();
    startTick();
  } else {
    loadCode(songs[currentIdx]);
  }

  isFading = false;
}

async function jumpTo(idx) {
  if (idx === currentIdx || isFading) return;
  isFading = true;
  clearTick();

  if (isPlaying) {
    elSongInfo.style.opacity = '0';
    await fadeTo(0, FADE_MS);
    stopEngine();
  }

  currentIdx  = idx;
  remainingMs = totalMs;
  updateRing();
  updateSongUI(songs[currentIdx], currentIdx);
  elSongInfo.style.opacity = '1';

  if (isPlaying) {
    await startPlayback();
    startTick();
  } else {
    loadCode(songs[currentIdx]);
  }

  isFading = false;
}

async function togglePlay() {
  // Resume any existing context synchronously — must happen in the click
  // handler before any await breaks the user-gesture chain.
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
    // Editor timed out — reset UI and give up
    isPlaying = false;
    elBtnPlay.textContent = '▶';
    elRingFill.classList.remove('playing');
    return;
  }

  await startPlayback();
  startTick();
}

// ── Playlist ──────────────────────────────────────────────────────────────────

function buildPlaylist() {
  elPlaylist.innerHTML = '';
  songs.forEach((song, i) => {
    const item = document.createElement('div');
    item.className = 'playlist-item';

    const num = document.createElement('span');
    num.className = 'pl-num';
    num.textContent = String(i + 1).padStart(2, '0');

    const info = document.createElement('div');
    info.className = 'pl-info';

    const title = document.createElement('span');
    title.className = 'pl-title';
    title.textContent = song.title;

    const meta = document.createElement('span');
    meta.className = 'pl-meta';
    meta.textContent = song.key + ' · ' + song.bpm + ' BPM';

    info.appendChild(title);
    info.appendChild(meta);
    item.appendChild(num);
    item.appendChild(info);
    item.addEventListener('click', () => jumpTo(i));
    elPlaylist.appendChild(item);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

function fmtSecs(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function init() {
  songs = typeof SONGS !== 'undefined' ? SONGS : [];
  if (!songs.length) {
    document.body.innerHTML =
      '<p style="color:#d97a48;padding:2rem;font-family:monospace">' +
      'No songs found — make sure ../lofi-rater/songs.js is reachable.</p>';
    return;
  }

  elSongInfo     = document.getElementById('song-info');
  elSongNumber   = document.getElementById('song-number');
  elSongSubtitle = document.getElementById('song-subtitle');
  elSongTitle    = document.getElementById('song-title');
  elSongKey      = document.getElementById('song-key');
  elSongBpm      = document.getElementById('song-bpm');
  elSongFeel     = document.getElementById('song-feel');
  elSongChords   = document.getElementById('song-chords');
  elRingFill     = document.getElementById('ring-fill');
  elRingTime     = document.getElementById('ring-time');
  elBtnPlay      = document.getElementById('btn-play');
  elBtnShuffle   = document.getElementById('btn-shuffle');
  elTimerSlider  = document.getElementById('timer-slider');
  elTimerVal     = document.getElementById('timer-val');
  elPlaylist     = document.getElementById('playlist');

  elRingFill.style.strokeDasharray  = CIRCUMFERENCE;
  elRingFill.style.strokeDashoffset = 0;

  buildPlaylist();
  updateSongUI(songs[currentIdx], currentIdx);
  updateRing();

  elTimerSlider.addEventListener('input', () => {
    const secs  = parseInt(elTimerSlider.value);
    totalMs     = secs * 1000;
    remainingMs = totalMs;
    elTimerVal.textContent = fmtSecs(secs);
    updateRing();
  });

  elBtnPlay.addEventListener('click', togglePlay);
  document.getElementById('btn-next').addEventListener('click', () => advance(1));
  document.getElementById('btn-prev').addEventListener('click', () => advance(-1));

  elBtnShuffle.addEventListener('click', () => {
    shuffleMode = !shuffleMode;
    elBtnShuffle.classList.toggle('active', shuffleMode);
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === ' ' || e.key === 'k')                            { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') advance(1);
    if (e.key === 'ArrowLeft'  || e.key === 'j' || e.key === 'J') advance(-1);
    if (e.key === 's' || e.key === 'S') elBtnShuffle.click();
  });
}

document.addEventListener('DOMContentLoaded', init);
