// Copyright (C) 2026 Eduarda Baumaņa. AGPL-3.0.
import { fetchText, loadCatalog, readRoute } from './lib/catalog.mjs';
import { Playback } from './lib/playback.mjs';

const $ = id => document.getElementById(id);
const base = new URL('./', import.meta.url);
const starter = '// Make something of your own.\nsetcpm(100 / 4)\nstack(\n  s("bd ~ bd ~").gain(0.6),\n  note("c3 eb3 g3 bb3").sound("triangle").gain(0.3)\n)\n';
let catalog, album, track, original = '', sequence = 0, loading, view = 'library', retryAction;
let boardTimer, boardSequence = 0, voteBusy = false;
const codeCache = new Map();
const trackIndex = new Map();
const drafts = new Map();
let ratingsPromise;
const ratings = () => ratingsPromise ||= import('./supabase.js').catch(error => { ratingsPromise = null; throw error; });

function showError(message, retry) {
  $('error-message').textContent = message;
  $('error-banner').hidden = false;
  $('retry').hidden = !retry;
  retryAction = retry;
}
function clearError() { $('error-banner').hidden = true; retryAction = null; }
function closeMenu() {
  document.body.classList.remove('menu-open');
  $('menu').setAttribute('aria-expanded', 'false');
  $('backdrop').hidden = true;
}
function showView(next) {
  view = next;
  for (const name of ['library', 'track', 'board']) $(`${name}-view`).hidden = name !== next;
  $('library-tab').classList.toggle('active', next !== 'board');
  $('board-tab').classList.toggle('active', next === 'board');
  clearInterval(boardTimer);
  boardSequence++;
  if (next === 'board') {
    refreshBoard();
    boardTimer = setInterval(() => { if (!document.hidden) refreshBoard(); }, 60000);
  }
}
function rememberDraft() {
  if (!original) return;
  const code = currentCode();
  if (code !== original) drafts.set(track?.id || 'build', code);
  else drafts.delete(track?.id || 'build');
}
function currentCode() { return $('engine-host').hidden ? $('source').value : playback.getCode(); }
function edited(code) {
  $('source').value = code;
  $('edit-status').textContent = code !== original ? '· EDITED' : '';
}
function playbackState(state, message) {
  if (state === 'warning') {
    $('sample-warning').textContent = message;
    $('sample-warning').hidden = !message;
    return;
  }
  $('playback-status').dataset.state = state;
  $('playback-status').textContent = message;
  $('play').disabled = !['ready', 'playing', 'stopped', 'error'].includes(state);
  $('stop').disabled = !['playing', 'evaluating'].includes(state);
  $('play').textContent = state === 'playing' ? '↻ Update' : '▶ Play';
  if (state === 'ready') {
    $('engine-host').hidden = false;
    $('source').hidden = true;
    clearError();
  }
  if (state === 'error') {
    showError(message, reloadEngine);
    // A failed bootstrap leaves readable, editable source even without Strudel.
    if ($('engine-host').hidden) $('play').disabled = true;
  }
}
const playback = new Playback($('engine-host'), playbackState, edited);
function loadEngine(code) {
  $('sample-warning').hidden = true;
  $('source').value = code;
  $('source').hidden = false;
  $('engine-host').hidden = true;
  playback.load(code);
}
function reloadEngine() { clearError(); loadEngine(currentCode()); }

function makeTrackButton(item, parent, index) {
  const button = document.createElement('button');
  button.className = 'track-link';
  button.dataset.trackId = item.id;
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  const title = document.createElement('span');
  title.textContent = item.title;
  button.append(number, title);
  button.setAttribute('aria-current', String(track?.id === item.id));
  button.onclick = () => selectTrack(parent, item);
  return button;
}
function renderCatalog() {
  const query = $('search').value.trim().toLocaleLowerCase();
  const expanded = new Set([...$('album-tree').querySelectorAll('details[open]')].map(node => node.dataset.albumId));
  const tree = document.createDocumentFragment();
  const grid = document.createDocumentFragment();
  let matches = 0;
  for (const [i, item] of catalog.albums.entries()) {
    const albumMatches = item.title.toLocaleLowerCase().includes(query) || item.id.toLocaleLowerCase().includes(query);
    const tracks = item.tracks.filter(song => albumMatches || `${song.title} ${song.filename}`.toLocaleLowerCase().includes(query));
    if (!tracks.length) continue;
    matches += tracks.length;
    const group = document.createElement('details');
    group.className = 'album-group';
    group.dataset.albumId = item.id;
    group.open = Boolean(query) || expanded.has(item.id) || album?.id === item.id;
    const summary = document.createElement('summary');
    summary.append(document.createTextNode(item.title));
    const count = document.createElement('span');
    count.textContent = tracks.length;
    summary.append(count);
    const list = document.createElement('div');
    list.className = 'track-list';
    const populate = () => {
      if (!list.childElementCount && group.open) {
        list.append(...tracks.map(song => makeTrackButton(song, item, item.tracks.indexOf(song))));
      }
    };
    group.addEventListener('toggle', populate);
    group.append(summary, list);
    populate();
    tree.append(group);
    const card = document.createElement('button');
    card.className = 'album-card';
    card.dataset.albumId = item.id;
    card.style.setProperty('--hue', (i * 47 + 85) % 360);
    const art = document.createElement('div');
    art.className = 'album-art';
    art.setAttribute('aria-hidden', 'true');
    const index = document.createElement('span');
    index.textContent = `EB / ${String(i + 1).padStart(2, '0')}`;
    art.append(index);
    const title = document.createElement('strong');
    title.textContent = item.title;
    const subtitle = document.createElement('small');
    subtitle.textContent = `${item.tracks.length} tracks · Open album ↗`;
    card.append(art, title, subtitle);
    card.onclick = () => selectTrack(item, tracks[0]);
    grid.append(card);
  }
  $('album-tree').replaceChildren(tree);
  $('album-grid').replaceChildren(grid);
  $('catalog-status').textContent = query ? `${matches} matching tracks` : '';
}
function updateRoute(selectedAlbum, selectedTrack, mode, replace = false) {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  if (selectedAlbum) url.searchParams.set('album', selectedAlbum.id);
  if (selectedTrack) url.searchParams.set('song', selectedTrack.filename);
  if (mode) url.searchParams.set('mode', mode);
  if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState']({}, '', url);
}
async function selectTrack(parent, item, { route = true } = {}) {
  rememberDraft();
  const request = ++sequence;
  loading?.abort();
  loading = new AbortController();
  playback.dispose();
  album = parent;
  track = item;
  original = '';
  clearError();
  closeMenu();
  showView('track');
  if (route) updateRoute(parent, item);
  document.title = `${item.title} · ebtunes`;
  $('track-album').textContent = `${parent.title} / ${parent.tracks.indexOf(item) + 1} of ${parent.tracks.length}`;
  $('track-title').textContent = item.title;
  $('track-meta').textContent = [item.key, item.tempo].filter(Boolean).join(' · ');
  $('track-feel').textContent = item.feel;
  $('source').value = '';
  $('source').hidden = false;
  $('engine-host').hidden = true;
  $('edit-status').textContent = '';
  $('vote-status').textContent = '';
  $('previous').disabled = parent.tracks.indexOf(item) === 0;
  $('next').disabled = parent.tracks.indexOf(item) === parent.tracks.length - 1;
  for (const id of ['reload-engine', 'reset-code', 'download', 'open-strudel']) $(id).disabled = true;
  playbackState('loading', 'Loading source…');
  renderCatalog();
  refreshVotes();
  try {
    const url = new URL(item.path, base);
    url.searchParams.set('v', item.sha256);
    const code = codeCache.get(item.id) || await fetchText(url, { signal: loading.signal });
    if (request !== sequence) return;
    codeCache.set(item.id, code);
    if (codeCache.size > 40) codeCache.delete(codeCache.keys().next().value);
    original = code;
    for (const id of ['reload-engine', 'reset-code', 'download', 'open-strudel']) $(id).disabled = false;
    const draft = drafts.get(item.id) ?? code;
    edited(draft);
    loadEngine(draft);
  } catch (error) {
    if (request !== sequence) return;
    playbackState('load-error', 'Source could not be loaded');
    showError(error.message, () => selectTrack(parent, item, { route: false }));
  }
}
function newPattern({ route = true } = {}) {
  rememberDraft();
  ++sequence;
  loading?.abort();
  album = track = null;
  original = starter;
  clearError();
  closeMenu();
  showView('track');
  if (route) updateRoute(null, null, 'build');
  document.title = 'New pattern · ebtunes';
  $('track-album').textContent = 'YOUR WORKSPACE';
  $('track-title').textContent = 'New pattern';
  $('track-meta').textContent = 'A blank canvas for your next idea';
  $('track-feel').textContent = '';
  $('vote-status').textContent = '';
  for (const id of ['previous', 'next', 'vote-up', 'vote-down']) $(id).disabled = true;
  for (const id of ['reload-engine', 'reset-code', 'download', 'open-strudel']) $(id).disabled = false;
  const draft = drafts.get('build') ?? starter;
  edited(draft);
  loadEngine(draft);
  if (catalog) renderCatalog();
}
function applyRoute() {
  const route = readRoute(location);
  if (route.mode === 'build' || route.album === 'build') return newPattern({ route: false });
  if (!route.album) { showView('library'); return; }
  const parent = catalog.albums.find(item => item.id.toLowerCase() === route.album.toLowerCase());
  const item = parent?.tracks.find(item => item.filename === route.song) || (!route.song && parent?.tracks[0]);
  if (!item) {
    showView('library');
    showError('This album or track is not in the current collection. Choose one from the library.');
    return;
  }
  selectTrack(parent, item, { route: false });
}
async function refreshVotes() {
  const id = track?.id;
  for (const name of ['vote-up', 'vote-down']) $(name).disabled = !id || voteBusy;
  if (!id) return;
  try {
    const api = await ratings();
    if (track?.id !== id) return;
    $('vote-up').setAttribute('aria-pressed', String(api.localVote(id) === 1));
    $('vote-down').setAttribute('aria-pressed', String(api.localVote(id) === -1));
  } catch { $('vote-status').textContent = 'Ratings are unavailable. Playback is ready to use.'; }
}
async function submitVote(value) {
  if (!track || voteBusy) return;
  const id = track.id;
  voteBusy = true;
  refreshVotes();
  try {
    const api = await ratings();
    await api.vote(id, api.localVote(id) === value ? null : value);
    if (id === track?.id) $('vote-status').textContent = 'Rating saved.';
  } catch (error) {
    if (id === track?.id) $('vote-status').textContent = `${error.message} Please try again.`;
  } finally { voteBusy = false; refreshVotes(); }
}
async function refreshBoard() {
  const request = ++boardSequence;
  $('board-status').textContent = 'Loading ratings…';
  try {
    const rows = await (await ratings()).leaderboard();
    if (request !== boardSequence || view !== 'board') return;
    const items = rows.filter(row => trackIndex.has(row.song_id)).slice(0, 20).map(row => {
      const { album, track } = trackIndex.get(row.song_id);
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = `${track.title} · ${album.title}`;
      button.onclick = () => selectTrack(album, track);
      const score = document.createElement('small');
      score.textContent = `${Number(row.score) || 0} points`;
      item.append(button, score);
      return item;
    });
    $('board-list').replaceChildren(...items);
    $('board-status').textContent = items.length ? 'Updates every minute while this page is visible.' : 'No ratings yet. Open a track to cast the first vote.';
  } catch (error) {
    if (request === boardSequence && view === 'board') $('board-status').textContent = `${error.message} Use Refresh to retry.`;
  }
}
async function initialize() {
  clearError();
  try {
    catalog = await loadCatalog(base);
    for (const album of catalog.albums) for (const track of album.tracks) trackIndex.set(track.id, { album, track });
    $('album-count').textContent = catalog.albums.length;
    $('library-count').textContent = `${catalog.albums.length} albums · ${catalog.trackCount} tracks`;
    renderCatalog();
    applyRoute();
  } catch (error) {
    $('catalog-status').textContent = 'Library unavailable';
    showError(`${error.message} The site needs a generated catalog from npm run build:player.`, initialize);
  }
}
$('retry').onclick = () => retryAction?.();
$('search').addEventListener('input', () => { if (catalog) renderCatalog(); });
$('menu').onclick = () => {
  const open = document.body.classList.toggle('menu-open');
  $('menu').setAttribute('aria-expanded', String(open));
  $('backdrop').hidden = !open;
  if (open) $('search').focus();
};
$('backdrop').onclick = closeMenu;
$('library-tab').onclick = () => { clearError(); showView('library'); updateRoute(); closeMenu(); };
$('board-tab').onclick = () => { clearError(); showView('board'); closeMenu(); };
$('new-pattern').onclick = () => newPattern();
$('play').onclick = () => { clearError(); playback.play(); };
$('stop').onclick = () => playback.stop();
$('reload-engine').onclick = reloadEngine;
$('reset-code').onclick = () => { drafts.delete(track?.id || 'build'); edited(original); loadEngine(original); };
$('source').addEventListener('input', () => edited($('source').value));
$('previous').onclick = () => { const item = album?.tracks[album.tracks.indexOf(track) - 1]; if (item) selectTrack(album, item); };
$('next').onclick = () => { const item = album?.tracks[album.tracks.indexOf(track) + 1]; if (item) selectTrack(album, item); };
$('vote-up').onclick = () => submitVote(1);
$('vote-down').onclick = () => submitVote(-1);
$('refresh-board').onclick = refreshBoard;
$('download').onclick = () => {
  const url = URL.createObjectURL(new Blob([currentCode()], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = track?.filename.split('/').pop() || 'my-pattern.strudel';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$('open-strudel').onclick = () => {
  const bytes = new TextEncoder().encode(currentCode());
  const encoded = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
  window.open('https://strudel.cc/#' + encodeURIComponent(encoded), '_blank', 'noopener');
};
window.addEventListener('popstate', () => { if (catalog) applyRoute(); });
window.addEventListener('hashchange', () => { if (catalog) applyRoute(); });
window.addEventListener('pagehide', () => playback.dispose());
window.addEventListener('pageshow', event => { if (event.persisted && original) reloadEngine(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeMenu(); $('menu').focus(); }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !$('play').disabled) { event.preventDefault(); playback.play(); }
  if ((event.ctrlKey || event.metaKey) && event.key === '.') { event.preventDefault(); playback.stop(); }
});
initialize();
