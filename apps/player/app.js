// Copyright (C) 2024 Eduarda Baumaņa. AGPL-3.0.

// ── State ────────────────────────────────────────────────────────────────────

const codeCache       = new Map();   // song path -> { fetchedAt, entry }
const expandedGroups  = new Set();   // sidebar groups currently expanded
const SONG_CACHE_MS   = 5000;        // avoids duplicate fetches from click + label refresh
const BUILD_MODE_ID   = 'build';
const BUILD_LABEL     = 'Uzbuvē pats';
const BLANK_STRUDEL_CODE = ' ';
let currentPlaylist   = null;        // playlist object
let currentFilename   = null;        // string
let currentSongId     = null;        // "playlist_id/filename" — supabase key
let buildModeActive   = false;
let boardActive       = false;

// ── DOM refs (resolved in init) ──────────────────────────────────────────────

let elPlayPane, elBoardPane;
let elTree, elSidebar, elBackdrop, elMenuToggle;
let elTabPlay, elTabBoard;
let elCounter, elTitle, elKey, elBpm, elPack, elFeel, elChords;
let elBtnNot, elBtnHot;
let elBoardContent, elBoardStatus;

// ── Strudel iframe ───────────────────────────────────────────────────────────
//
// We embed strudel.cc itself via an iframe instead of hosting the
// strudel-editor web component locally. Hand the song's code to
// strudel.cc as base64 in the URL hash and it loads with the code
// pre-filled and its native transport bar (▶ ⟳ ⏮ ⏭). This is the
// same trick the old lofi-rater used and the only setup we've
// confirmed works reliably on mobile.

function strudelUrlFor(code) {
  // btoa(unescape(encodeURIComponent(...))) is the standard "base64
  // a UTF-8 string" recipe — handles non-ASCII chord names, accented
  // comments, etc., without throwing on btoa's Latin-1 limitation.
  return 'https://strudel.cc/#' + btoa(unescape(encodeURIComponent(code)));
}

function loadIntoFrame(code) {
  const old = document.getElementById('strudel-frame');
  if (!old) return;
  // Setting iframe.src to a URL that differs only in the #fragment is
  // treated as a fragment-only navigation — the iframe scrolls but does
  // NOT reload, so the new code never runs. Replace the element instead.
  // Cloning the old node's attributes keeps the layout identical; we
  // just swap in a fresh element so the browser does a full load.
  const fresh = document.createElement('iframe');
  fresh.id        = old.id;
  fresh.className = old.className;
  fresh.title     = old.title || 'Strudel REPL';
  fresh.allow     = old.allow || 'autoplay; clipboard-read; clipboard-write';
  fresh.loading   = old.loading || 'lazy';
  fresh.src       = strudelUrlFor(code);
  old.replaceWith(fresh);
}

// ── Metadata parser (same shape as lofi-player) ──────────────────────────────

function humanize(filename) {
  return filename
    .replace(/\.(strudel|txt)$/, '')
    .replace(/^[a-z]+-\d+-/i, '')
    .replace(/[-_]/g, ' ');
}

function parseMeta(filename, code) {
  const quoted = code.match(/^\/\/\s*"([^"]+)"/m);
  if (quoted) {
    const afterTitle  = code.match(/^\/\/\s*"[^"]+"\n\/\/\s*(.+)/m);
    const keyMatch    = code.match(/^\/\/\s*Key:\s*(.+)/m);
    const bpmMatch    = code.match(/~?(\d+)\s*BPM/i);
    const feelMatch   = code.match(/^\/\/\s*Feel:\s*(.+)/m);
    const chordsMatch = code.match(/^\/\/\s*Chords:\s*(.+)/m);
    return {
      title:    quoted[1],
      subtitle: afterTitle   ? afterTitle[1].trim()         : '',
      key:      keyMatch     ? keyMatch[1].trim()           : '',
      bpm:      bpmMatch     ? parseInt(bpmMatch[1], 10)    : 0,
      feel:     feelMatch    ? feelMatch[1].trim()          : '',
      chords:   chordsMatch  ? chordsMatch[1].trim()        : '',
    };
  }
  return {
    title:    humanize(filename),
    subtitle: '', key: '', bpm: 0, feel: '', chords: '',
  };
}

function songPath(playlist, filename) {
  return playlist.path + filename;
}

function freshSongUrl(playlist, filename) {
  const url = new URL(songPath(playlist, filename), window.location.href);
  url.searchParams.set('v', Date.now().toString(36));
  return url.href;
}

async function fetchSong(playlist, filename) {
  const key = songPath(playlist, filename);
  const cached = codeCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < SONG_CACHE_MS) {
    return cached.entry;
  }

  const url = freshSongUrl(playlist, filename);
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const code  = await res.text();
    const meta  = parseMeta(filename, code);
    const entry = { filename, code, meta };
    codeCache.set(key, { fetchedAt: Date.now(), entry });
    return entry;
  } catch (err) {
    console.error('fetch failed:', url, err);
    return {
      filename,
      code: '// Could not load file. Run a local server (npx serve .) so fetch() works.\nsilence',
      meta: parseMeta(filename, ''),
    };
  }
}

// ── Player links ─────────────────────────────────────────────────────────────

function albumUrl(playlist, filename = '') {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('album', playlist.id);
  if (filename) url.searchParams.set('song', filename);
  return url;
}

function buildUrl() {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('mode', BUILD_MODE_ID);
  return url;
}

function updatePlayerUrl(playlist, filename = '') {
  window.history.replaceState(null, '', albumUrl(playlist, filename));
}

function updateBuildUrl() {
  window.history.replaceState(null, '', buildUrl());
}

function routeFromUrl() {
  const query = new URLSearchParams(window.location.search);
  let mode = query.get('mode') || '';
  let album = query.get('album') || query.get('playlist') || '';
  let song = query.get('song') || '';

  if (!album && window.location.hash) {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash.includes('=')) {
      const hashParams = new URLSearchParams(hash);
      mode = hashParams.get('mode') || mode;
      album = hashParams.get('album') || hashParams.get('playlist') || '';
      song = hashParams.get('song') || '';
    } else {
      album = hash;
    }
  }

  return { mode, album, song };
}

function playerPlaylists() {
  if (typeof PLAYLISTS === 'undefined') return [];
  return PLAYLISTS.filter(pl => typeof pl.path === 'string' && pl.path.includes('collections/'));
}

function findPlaylist(plId) {
  const target = plId.trim().toLowerCase();
  if (!target) return null;
  return playerPlaylists().find(pl => pl.id.toLowerCase() === target) || null;
}

function initialSelection() {
  const route = routeFromUrl();
  if (route.mode === BUILD_MODE_ID || route.album === BUILD_MODE_ID || (!route.album && !route.song)) {
    return { build: true };
  }

  const playlists = playerPlaylists();
  if (!playlists.length) return { build: true };
  const playlist = findPlaylist(route.album) || playlists[0];
  const songIdx = route.song ? playlist.files.indexOf(route.song) : -1;
  const idx = songIdx >= 0 ? songIdx : 0;
  return { playlist, filename: playlist.files[idx], idx };
}

function isPublicSongId(songId) {
  const [plId] = songId.split('/');
  return playerPlaylists().some(pl => pl.id === plId);
}

// ── Sidebar (collapsible playlist tree) ──────────────────────────────────────

function buildSidebar() {
  elTree.innerHTML = '';

  const buildButton = document.createElement('button');
  buildButton.className = 'pl-build';
  buildButton.dataset.mode = BUILD_MODE_ID;
  buildButton.innerHTML = `
    <span class="pl-build-icon">+</span>
    <span class="pl-label">${BUILD_LABEL}</span>
  `;
  buildButton.addEventListener('click', () => {
    updateBuildUrl();
    selectBuildYourself();
  });
  elTree.appendChild(buildButton);

  if (typeof PLAYLISTS === 'undefined') {
    const missing = document.createElement('div');
    missing.className = 'board-empty';
    missing.textContent = 'PLAYLISTS not loaded';
    elTree.appendChild(missing);
    return;
  }

  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'pl-section-title';
  sectionTitle.textContent = 'Collections';
  elTree.appendChild(sectionTitle);

  playerPlaylists().forEach(pl => {
    const group = document.createElement('div');
    group.className = 'pl-group';
    group.dataset.id = pl.id;

    // Header — click to expand/collapse
    const header = document.createElement('button');
    header.className = 'pl-header';
    header.innerHTML = `
      <span class="pl-toggle">▸</span>
      <span class="pl-label">${pl.label}</span>
      <span class="pl-count">${String(pl.files.length).padStart(2, '0')}</span>
    `;
    header.addEventListener('click', () => {
      const wasExpanded = group.classList.contains('expanded');
      toggleGroup(pl.id);
      updatePlayerUrl(pl);
      if (!wasExpanded || !currentPlaylist || currentPlaylist.id !== pl.id) {
        selectSong(pl, pl.files[0], 0);
      }
    });

    // Song list (hidden until group is expanded)
    const list = document.createElement('div');
    list.className = 'pl-list';
    pl.files.forEach((filename, i) => {
      const btn = document.createElement('button');
      btn.className = 'pl-song';
      btn.dataset.playlist = pl.id;
      btn.dataset.filename = filename;
      btn.innerHTML = `
        <span class="pl-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="pl-name">${humanize(filename)}</span>
      `;
      btn.addEventListener('click', () => {
        updatePlayerUrl(pl, filename);
        selectSong(pl, filename, i);
        // Lazy-fetch title from the file for nicer labels
        fetchSong(pl, filename).then(entry => {
          btn.querySelector('.pl-name').textContent = entry.meta.title;
        });
      });
      list.appendChild(btn);
    });

    group.appendChild(header);
    group.appendChild(list);
    elTree.appendChild(group);
  });
}

function toggleGroup(plId) {
  const group = elTree.querySelector(`.pl-group[data-id="${plId}"]`);
  if (!group) return;
  if (group.classList.contains('expanded')) {
    group.classList.remove('expanded');
    expandedGroups.delete(plId);
  } else {
    group.classList.add('expanded');
    expandedGroups.add(plId);
  }
}

function expandGroup(plId) {
  const group = elTree.querySelector(`.pl-group[data-id="${plId}"]`);
  if (group && !group.classList.contains('expanded')) {
    group.classList.add('expanded');
    expandedGroups.add(plId);
  }
}

function highlightActiveSong() {
  const buildButton = elTree.querySelector('.pl-build');
  if (buildButton) {
    buildButton.classList.toggle('active', buildModeActive);
  }

  elTree.querySelectorAll('.pl-song').forEach(el => {
    el.classList.toggle(
      'active',
      !buildModeActive &&
      el.dataset.playlist === (currentPlaylist && currentPlaylist.id) &&
        el.dataset.filename === currentFilename,
    );
  });
  elTree.querySelectorAll('.pl-header').forEach(h => {
    const id = h.parentElement.dataset.id;
    h.classList.toggle('active', !buildModeActive && id === (currentPlaylist && currentPlaylist.id));
  });

  if (buildModeActive) return;

  const activeSong = Array.from(elTree.querySelectorAll('.pl-song')).find(el =>
    el.dataset.playlist === (currentPlaylist && currentPlaylist.id) &&
    el.dataset.filename === currentFilename
  );
  if (activeSong) {
    requestAnimationFrame(() => {
      activeSong.scrollIntoView({ block: 'nearest' });
    });
  }
}

// ── Selecting a song ─────────────────────────────────────────────────────────

async function selectSong(playlist, filename, idx) {
  buildModeActive = false;
  currentPlaylist = playlist;
  currentFilename = filename;
  currentSongId   = playlist.id + '/' + filename;

  highlightActiveSong();
  closeSidebarIfMobile();

  // Fetch + render meta
  const entry = await fetchSong(playlist, filename);
  const m     = entry.meta;
  const total = playlist.files.length;

  elCounter.textContent = `${String(idx + 1).padStart(2, '0')} · ${String(total).padStart(2, '0')}`;
  elTitle.textContent   = m.title;
  elKey.textContent     = m.key || '—';
  elBpm.textContent     = m.bpm ? m.bpm + ' BPM' : '—';
  elPack.textContent    = playlist.label;
  elFeel.textContent    = m.feel   || '';
  elChords.textContent  = m.chords || '';

  // Reflect any existing local vote on the +/- buttons
  setVoteButtonsEnabled(true);
  refreshVoteButtons();

  // Push the code into the embedded strudel.cc iframe. Changing src
  // triggers a fresh strudel.cc load with the new code — the user
  // sees the same player they're used to from the docs.
  loadIntoFrame(entry.code);
}

function selectBuildYourself() {
  buildModeActive = true;
  currentPlaylist = null;
  currentFilename = null;
  currentSongId   = null;

  highlightActiveSong();
  closeSidebarIfMobile();

  elCounter.textContent = 'NEW';
  elTitle.textContent   = BUILD_LABEL;
  elKey.textContent     = '—';
  elBpm.textContent     = '—';
  elPack.textContent    = 'STRUDEL';
  elFeel.textContent    = '';
  elChords.textContent  = '';

  setVoteButtonsEnabled(false);
  refreshVoteButtons();
  loadIntoFrame(BLANK_STRUDEL_CODE);
}

// ── Voting ───────────────────────────────────────────────────────────────────

function setVoteButtonsEnabled(enabled) {
  elBtnNot.disabled = !enabled;
  elBtnHot.disabled = !enabled;
}

function refreshVoteButtons() {
  if (!currentSongId) {
    elBtnNot.classList.remove('active');
    elBtnHot.classList.remove('active');
    return;
  }
  const v = getLocalVote(currentSongId);
  elBtnNot.classList.toggle('active', v === -1);
  elBtnHot.classList.toggle('active', v ===  1);
}

async function vote(value) {
  if (!currentSongId) return;

  // Toggle — clicking the active vote a second time removes it
  const current = getLocalVote(currentSongId);
  const next    = current === value ? null : value;

  setLocalVote(currentSongId, next);
  refreshVoteButtons();

  // Flash whichever button was just engaged, kick off the submission in
  // the background (don't block the auto-advance on the network).
  const btn = value === 1 ? elBtnHot : elBtnNot;
  btn.classList.add('flash');
  submitVote(currentSongId, next).catch(err => {
    console.error('vote submit failed; vote stays in local cache:', err);
  });

  // Brief pause so the user sees the button flash + state change, then
  // jump to the next song in the current playlist (wraps at the end).
  await new Promise(r => setTimeout(r, 220));
  btn.classList.remove('flash');

  const nextSong = nextSongInPlaylist();
  if (nextSong) {
    updatePlayerUrl(nextSong.playlist, nextSong.filename);
    await selectSong(nextSong.playlist, nextSong.filename, nextSong.idx);
  }
}

// Find the next song in the current playlist. Wraps to the first song
// once we hit the end so a long voting session keeps flowing instead
// of stopping cold on the last track.
function nextSongInPlaylist() {
  if (!currentPlaylist || !currentFilename) return null;
  const idx = currentPlaylist.files.indexOf(currentFilename);
  if (idx < 0) return null;
  const nextIdx = (idx + 1) % currentPlaylist.files.length;
  return {
    playlist: currentPlaylist,
    filename: currentPlaylist.files[nextIdx],
    idx:      nextIdx,
  };
}

// ── Board (leaderboard) ──────────────────────────────────────────────────────

function songLabel(songId) {
  const parts    = songId.split('/');
  const playlist = (parts[0] || '').toUpperCase();
  const raw      = (parts[1] || songId).replace(/\.(strudel|txt)$/, '');
  const name     = raw.replace(/^[a-z]+-\d+-/i, '').replace(/[-_]/g, ' ').toUpperCase();
  return { playlist, name };
}

function renderLeaderboard(entries) {
  const publicEntries = entries.filter(e => isPublicSongId(e.song_id));

  if (!publicEntries.length) {
    elBoardContent.innerHTML = '<div class="board-empty">NO VOTES YET</div>';
    return;
  }
  const rows = publicEntries.map((e, i) => {
    const { playlist, name } = songLabel(e.song_id);
    const sign = e.score > 0 ? '+' : '';
    const cls  = e.score > 0 ? 'positive' : e.score < 0 ? 'negative' : '';
    return `<div class="lb-row" data-song-id="${e.song_id}">
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
      <span class="lb-tag">PLAYLIST</span>
      <span class="lb-up">+</span>
      <span class="lb-down">-</span>
      <span class="lb-score">NET</span>
    </div>${rows}</div>`;

  // Click a leaderboard row to jump to that song in the player
  elBoardContent.querySelectorAll('.lb-row').forEach(row => {
    row.addEventListener('click', () => {
      const songId = row.dataset.songId;
      const [plId, filename] = songId.split('/');
      const pl  = findPlaylist(plId);
      if (!pl) return;
      const idx = pl.files.indexOf(filename);
      if (idx < 0) return;
      expandGroup(plId);
      showPlay();
      updatePlayerUrl(pl, filename);
      selectSong(pl, filename, idx);
    });
  });
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

function showPlay() {
  boardActive = false;
  elTabPlay.classList.add('active');
  elTabBoard.classList.remove('active');
  elPlayPane.classList.remove('hidden');
  elBoardPane.classList.add('hidden');
  unsubscribeLeaderboard();
  setBoardStatus('');
}

function showBoard() {
  boardActive = true;
  elTabBoard.classList.add('active');
  elTabPlay.classList.remove('active');
  elBoardPane.classList.remove('hidden');
  elPlayPane.classList.add('hidden');
  refreshBoard();
  subscribeLeaderboard(refreshBoard);
}

// ── Mobile sidebar drawer ────────────────────────────────────────────────────

function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }

function openSidebar() {
  elSidebar.classList.add('open');
  elBackdrop.classList.add('open');
}
function closeSidebar() {
  elSidebar.classList.remove('open');
  elBackdrop.classList.remove('open');
}
function toggleSidebar() {
  if (elSidebar.classList.contains('open')) closeSidebar();
  else                                       openSidebar();
}
function closeSidebarIfMobile() {
  if (isMobile()) closeSidebar();
}

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
  elPlayPane     = document.getElementById('play-pane');
  elBoardPane    = document.getElementById('board-pane');
  elTree         = document.getElementById('playlist-tree');
  elSidebar      = document.getElementById('sidebar');
  elBackdrop     = document.getElementById('sidebar-backdrop');
  elMenuToggle   = document.getElementById('menu-toggle');
  elTabPlay      = document.getElementById('tab-play');
  elTabBoard     = document.getElementById('tab-board');

  elCounter      = document.getElementById('si-counter');
  elTitle        = document.getElementById('si-title');
  elKey          = document.getElementById('si-key');
  elBpm          = document.getElementById('si-bpm');
  elPack         = document.getElementById('si-pack');
  elFeel         = document.getElementById('si-feel');
  elChords       = document.getElementById('si-chords');

  elBtnNot       = document.getElementById('btn-not');
  elBtnHot       = document.getElementById('btn-hot');

  elBoardContent = document.getElementById('board-content');
  elBoardStatus  = document.getElementById('board-status');

  // Sidebar tree
  buildSidebar();

  const initial = initialSelection();
  if (initial) {
    if (initial.build) {
      selectBuildYourself();
    } else {
      expandGroup(initial.playlist.id);
      // Pre-select the first song so the editor has something to show
      selectSong(initial.playlist, initial.filename, initial.idx);
    }
  }

  // Tab switching
  elTabPlay.addEventListener('click',  showPlay);
  elTabBoard.addEventListener('click', showBoard);

  // Voting
  elBtnNot.addEventListener('click', () => vote(-1));
  elBtnHot.addEventListener('click', () => vote(1));

  // Mobile drawer
  elMenuToggle.addEventListener('click', toggleSidebar);
  elBackdrop.addEventListener('click',   closeSidebar);

  // Keyboard shortcuts (page-level; the editor swallows them when focused)
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.target.closest('.editor')) return;       // let CodeMirror handle its own
    if ((e.key === 'b' || e.key === 'B') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); showBoard();
    }
    if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); showPlay();
    }
    if ((e.key === '+' || e.key === '=') && !e.ctrlKey && !e.metaKey) vote(1);
    if ((e.key === '-' || e.key === '_') && !e.ctrlKey && !e.metaKey) vote(-1);
  });
}

document.addEventListener('DOMContentLoaded', init);
