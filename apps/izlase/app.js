// izlase — personal favourites player
// Auto-discovers .strudel files in this folder. No HTML/JS edits needed
// when adding new tracks: just drop the file in and reload.
//
// Discovery order:
//   1. GitHub Contents API (for the deployed GitHub Pages site)
//   2. HTTP directory listing (for `npx serve` / `python -m http.server`)
//   3. Empty state with hint
//
// File-fetch fallback:
//   1. Relative to Pages (./file.strudel)
//   2. raw.githubusercontent.com via main branch (if Pages serves stale/404)
//
// The iframe trick is the same as the main player: base64-encode the
// code into strudel.cc's URL hash so the cloud REPL runs it.

const PUBLIC_FOLDER = 'izlase';
const REPO_FOLDER = 'apps/izlase';

function detectRepo() {
  const host = location.hostname;
  const path = location.pathname;
  if (host.endsWith('.github.io')) {
    const owner = host.split('.')[0];
    const m = path.match(/^\/([^/]+)\//);
    if (m) return { owner, repo: m[1] };
  }
  return { owner: 'eduardsbaumanis', repo: 'ebtesti' };
}

const REPO = detectRepo();
const BRANCH = 'main';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${BRANCH}/${REPO_FOLDER}`;

// ── Visible diagnostic log ────────────────────────────────────────────
function diag(msg, kind = 'info') {
  const el = document.getElementById('diag');
  if (!el) return;
  const line = document.createElement('div');
  line.className = 'diag-line diag-' + kind;
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
  // also console for paste-friendly debugging
  console[kind === 'error' ? 'error' : 'log']('[izlase]', msg);
}

// ── FILE DISCOVERY ────────────────────────────────────────────────────
async function discoverViaGithub() {
  const url = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${REPO_FOLDER}?ref=${BRANCH}`;
  diag('trying GitHub API: ' + url);
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
  if (!res.ok) throw new Error('github api HTTP ' + res.status);
  const items = await res.json();
  const files = items
    .filter(x => x.type === 'file' && x.name.endsWith('.strudel'))
    .map(x => x.name)
    .sort();
  diag(`GitHub API returned ${files.length} .strudel files`, 'ok');
  return files;
}

async function discoverViaDirListing() {
  diag('trying directory listing: ./');
  const res = await fetch('./');
  if (!res.ok) throw new Error('dir listing HTTP ' + res.status);
  const html = await res.text();
  const names = new Set();
  for (const m of html.matchAll(/href="([^"]+\.strudel)"/g)) {
    const base = decodeURIComponent(m[1]).split('/').pop();
    if (base && base.endsWith('.strudel')) names.add(base);
  }
  const files = [...names].sort();
  diag(`directory listing returned ${files.length} .strudel files`, files.length ? 'ok' : 'warn');
  return files;
}

async function discoverFiles() {
  try {
    const files = await discoverViaGithub();
    return { files, source: 'github' };
  } catch (e) {
    diag('GitHub API failed: ' + e.message + ' — falling back to dir listing', 'warn');
  }
  try {
    const files = await discoverViaDirListing();
    return { files, source: 'dir-listing' };
  } catch (e) {
    diag('directory listing failed: ' + e.message, 'error');
  }
  return { files: [], source: 'none' };
}

// ── STRUDEL IFRAME ────────────────────────────────────────────────────
function strudelUrlFor(code) {
  return 'https://strudel.cc/#' + btoa(unescape(encodeURIComponent(code)));
}

function loadIntoFrame(code) {
  const old = document.getElementById('strudel-frame');
  if (!old) {
    diag('iframe element missing from DOM', 'error');
    return;
  }
  const fresh = document.createElement('iframe');
  fresh.id        = old.id;
  fresh.className = old.className;
  fresh.title     = old.title || 'Strudel REPL';
  fresh.allow     = old.allow || 'autoplay; clipboard-read; clipboard-write';
  fresh.src       = strudelUrlFor(code);
  old.replaceWith(fresh);
}

// ── FILE FETCH (Pages → raw fallback) ─────────────────────────────────
async function fetchFile(name) {
  // 1. Pages-relative (normal)
  try {
    const r = await fetch(name + '?v=' + Date.now());
    if (r.ok) return await r.text();
    throw new Error('relative fetch HTTP ' + r.status);
  } catch (e) {
    diag(`pages fetch ${name} failed: ${e.message} — trying raw.githubusercontent`, 'warn');
  }
  // 2. raw.githubusercontent.com fallback (works even if Pages is broken)
  const rawUrl = `${RAW_BASE}/${encodeURIComponent(name)}`;
  const r2 = await fetch(rawUrl);
  if (!r2.ok) throw new Error('raw fetch HTTP ' + r2.status);
  return await r2.text();
}

// ── METADATA EXTRACTION ───────────────────────────────────────────────
function parseMeta(code) {
  const head = code.split('\n').slice(0, 60).filter(l => l.trim().startsWith('//')).join(' ');
  const grab = (re) => { const m = head.match(re); return m ? m[1].trim() : ''; };
  return {
    title:  grab(/Track:\s*\d+\s*[—–-]\s*([^/]+?)(?:\/\/|$)/i) || grab(/"([^"]+)"/),
    key:    grab(/Key:\s*([A-G][#b♯♭]?\s*(?:minor|major|dorian|phrygian|lydian|mixolydian|aeolian|locrian)?)/i),
    bpm:    grab(/(?:Tempo[^:]*:|BPM:)[\s]*(\d{2,3})\s*BPM/i) ||
            (() => {
              const m = head.match(/setcpm\s*\(\s*(\d+(?:\.\d+)?)\s*\)/);
              return m ? Math.round(parseFloat(m[1]) * 4) + ' BPM' : '';
            })(),
    feel:   grab(/Mood:\s*([^.]+?)\./i) || grab(/Concept:\s*([^.]+?)\./i),
  };
}

function humanizeName(name) {
  return name.replace(/\.strudel$/, '').replace(/^(\d+)[-_]/, '$1 · ').replace(/-/g, ' ');
}

// ── UI WIRING ─────────────────────────────────────────────────────────
let currentFile = null;

async function selectFile(name) {
  diag('loading ' + name);
  try {
    const code = await fetchFile(name);
    loadIntoFrame(code);
    currentFile = name;
    location.hash = encodeURIComponent(name);
    document.querySelectorAll('#file-list li').forEach(li => {
      li.classList.toggle('active', li.dataset.name === name);
    });
    const meta = parseMeta(code);
    document.getElementById('now-title').textContent = meta.title || humanizeName(name);
    document.getElementById('now-key').textContent   = meta.key  ? 'KEY ' + meta.key : '';
    document.getElementById('now-bpm').textContent   = meta.bpm  || '';
    document.getElementById('now-feel').textContent  = meta.feel || '';
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('backdrop').classList.add('hidden');
    diag('loaded ' + name, 'ok');
  } catch (e) {
    diag('failed to load ' + name + ': ' + e.message, 'error');
    loadIntoFrame(`// Neizdevās ielādēt ${name}\n// (${e.message})\n// Pārbaudi DevTools konsoli vai sānjoslas diagnostiku.`);
  }
}

function renderList(files) {
  const list = document.getElementById('file-list');
  list.innerHTML = '';
  files.forEach((name, i) => {
    const li = document.createElement('li');
    li.dataset.name = name;
    const num = String(i + 1).padStart(2, '0');
    li.innerHTML = `<span class="num">${num}</span>${humanizeName(name)}`;
    li.title = name;
    li.addEventListener('click', () => selectFile(name));
    list.appendChild(li);
  });
  document.getElementById('count').textContent = files.length + (files.length === 1 ? ' dziesma' : ' dziesmas');
}

function showHint(source) {
  const hint = document.getElementById('hint');
  hint.classList.remove('hidden');
  if (source === 'none') {
    hint.innerHTML = `
      <p>Nav atrasti <code>.strudel</code> faili.</p>
      <p>Pievieno favorītu: nokopē jebkuru <code>.strudel</code> failu šajā mapē (<code>izlase/</code>). HTML/JS rediģēt nevajag.</p>
      <p>Lokāli: <code>npx serve .</code> vai <code>python3 -m http.server</code> no repo saknes.</p>
    `;
  } else if (source === 'github') {
    hint.innerHTML = `
      <p>Mape <code>izlase/</code> ir tukša pēc GitHub.</p>
      <p>Pievieno failu šajā mapē un atsvaidzini lapu.</p>
    `;
  } else {
    hint.innerHTML = `<p>Nav atrasti <code>.strudel</code> faili šajā mapē.</p>`;
  }
}

function setupMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  if (!btn || !sidebar || !backdrop) return;
  btn.addEventListener('click', () => {
    sidebar.classList.add('open');
    backdrop.classList.remove('hidden');
  });
  backdrop.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.add('hidden');
  });
}

function setupDiagToggle() {
  const toggle = document.getElementById('diag-toggle');
  const pane = document.getElementById('diag-pane');
  if (!toggle || !pane) return;
  toggle.addEventListener('click', () => {
    pane.classList.toggle('hidden');
  });
}

// ── INIT ──────────────────────────────────────────────────────────────
async function init() {
  diag(`izlase init · host=${location.hostname} repo=${REPO.owner}/${REPO.repo} folder=${FOLDER}`);
  setupMobileMenu();
  setupDiagToggle();

  const { files, source } = await discoverFiles();

  if (files.length === 0) {
    showHint(source);
    return;
  }

  renderList(files);

  const hash = decodeURIComponent(location.hash.slice(1));
  const initial = files.includes(hash) ? hash : files[0];
  await selectFile(initial);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
