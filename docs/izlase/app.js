// izlase — personal favourites player
// Auto-discovers .strudel files in this folder. No HTML/JS edits needed
// when adding new tracks: just drop the file in and reload.
//
// Discovery order:
//   1. GitHub Contents API (for the deployed GitHub Pages site)
//   2. HTTP directory listing (for `npx serve` / `python -m http.server`)
//   3. Empty state with hint
//
// The iframe trick is the same as the main player: base64-encode the
// code into strudel.cc's URL hash so the cloud REPL runs it.

// ─────────────────────────────────────────────────────────────────────
// CONFIG — autodetected. Override REPO_OWNER / REPO_NAME if you fork.
// ─────────────────────────────────────────────────────────────────────

const FOLDER = 'izlase';

// Try to autodetect the repo from the URL when on github.io,
// otherwise fall back to the canonical owner/repo. This means
// forks "just work" on their own *.github.io pages.
function detectRepo() {
  const host = location.hostname; // e.g. eduardsbaumanis.github.io
  const path = location.pathname; // e.g. /ebtesti/izlase/
  if (host.endsWith('.github.io')) {
    const owner = host.split('.')[0];
    const m = path.match(/^\/([^/]+)\//);
    if (m) return { owner, repo: m[1] };
  }
  return { owner: 'eduardsbaumanis', repo: 'ebtesti' };
}

const REPO = detectRepo();
const BRANCH = 'main';

// ─────────────────────────────────────────────────────────────────────
// FILE DISCOVERY
// ─────────────────────────────────────────────────────────────────────

async function discoverViaGithub() {
  const url = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${FOLDER}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
  if (!res.ok) throw new Error('github api ' + res.status);
  const items = await res.json();
  return items
    .filter(x => x.type === 'file' && x.name.endsWith('.strudel'))
    .map(x => x.name)
    .sort();
}

async function discoverViaDirListing() {
  // Most static servers (`python -m http.server`, `npx serve`, Apache, nginx
  // with autoindex on) return HTML containing <a href="filename"> for each
  // entry. We scrape that.
  const res = await fetch('./');
  if (!res.ok) throw new Error('dir listing ' + res.status);
  const html = await res.text();
  const names = new Set();
  for (const m of html.matchAll(/href="([^"]+\.strudel)"/g)) {
    const raw = decodeURIComponent(m[1]);
    // Take just the basename — some servers emit absolute paths
    const base = raw.split('/').pop();
    if (base && base.endsWith('.strudel')) names.add(base);
  }
  return [...names].sort();
}

async function discoverFiles() {
  // Try GitHub API first when we're online (works locally too)
  try {
    const files = await discoverViaGithub();
    if (files.length > 0) return { files, source: 'github' };
    if (files.length === 0) {
      // Empty repo folder — still treat as success, no need to fall back
      return { files: [], source: 'github' };
    }
  } catch (e) {
    console.warn('GitHub discovery failed, falling back to directory listing:', e.message);
  }

  // Fallback: HTTP autoindex listing (works with `npx serve`, `python -m http.server`)
  try {
    const files = await discoverViaDirListing();
    return { files, source: 'dir-listing' };
  } catch (e) {
    console.warn('Directory listing failed:', e.message);
  }

  return { files: [], source: 'none' };
}

// ─────────────────────────────────────────────────────────────────────
// STRUDEL IFRAME
// ─────────────────────────────────────────────────────────────────────

function strudelUrlFor(code) {
  // btoa(unescape(encodeURIComponent(...))) handles non-ASCII (chord
  // names, Latvian comments, etc.) without breaking btoa's Latin-1 limit.
  return 'https://strudel.cc/#' + btoa(unescape(encodeURIComponent(code)));
}

function loadIntoFrame(code) {
  // Replace the iframe element — setting .src to a URL that only differs
  // in #fragment is treated as a fragment-only nav and the new code does
  // not run. This is the same workaround the main player uses.
  const old = document.getElementById('strudel-frame');
  if (!old) return;
  const fresh = document.createElement('iframe');
  fresh.id        = old.id;
  fresh.className = old.className;
  fresh.title     = old.title || 'Strudel REPL';
  fresh.allow     = old.allow || 'autoplay; clipboard-read; clipboard-write';
  fresh.loading   = old.loading || 'lazy';
  fresh.src       = strudelUrlFor(code);
  old.replaceWith(fresh);
}

// ─────────────────────────────────────────────────────────────────────
// METADATA EXTRACTION
// Pull "Key: ... / Tempo: ... / Mood: ..." style fields from header comments.
// ─────────────────────────────────────────────────────────────────────

function parseMeta(code) {
  const head = code.split('\n').slice(0, 60).filter(l => l.trim().startsWith('//')).join(' ');
  const grab = (re) => { const m = head.match(re); return m ? m[1].trim() : ''; };
  return {
    title:  grab(/Track:\s*\d+\s*[—–-]\s*([^/]+?)(?:\/\/|$)/i) ||
            grab(/"([^"]+)"/),
    key:    grab(/Key:\s*([A-G][#b♯♭]?\s*(?:minor|major|dorian|phrygian|lydian|mixolydian|aeolian|locrian)?)/i),
    bpm:    grab(/(?:Tempo[^:]*:|BPM:)[\s]*(\d{2,3})\s*BPM/i) ||
            (() => {
              const m = head.match(/setcpm\s*\(\s*(\d+(?:\.\d+)?)\s*\)/);
              return m ? Math.round(parseFloat(m[1]) * 4) + ' BPM' : '';
            })(),
    feel:   grab(/Mood:\s*([^.]+?)\./i) ||
            grab(/Concept:\s*([^.]+?)\./i),
  };
}

function humanizeName(name) {
  return name
    .replace(/\.strudel$/, '')
    .replace(/^(\d+)[-_]/, '$1 · ')
    .replace(/-/g, ' ');
}

// ─────────────────────────────────────────────────────────────────────
// UI WIRING
// ─────────────────────────────────────────────────────────────────────

let currentFile = null;

async function selectFile(name) {
  try {
    const res = await fetch(name + '?v=' + Date.now());
    if (!res.ok) throw new Error('fetch ' + res.status);
    const code = await res.text();
    loadIntoFrame(code);
    currentFile = name;
    location.hash = encodeURIComponent(name);
    // Active highlight
    document.querySelectorAll('#file-list li').forEach(li => {
      li.classList.toggle('active', li.dataset.name === name);
    });
    // Metadata strip
    const meta = parseMeta(code);
    document.getElementById('now-title').textContent = meta.title || humanizeName(name);
    document.getElementById('now-key').textContent   = meta.key  ? 'KEY ' + meta.key : '';
    document.getElementById('now-bpm').textContent   = meta.bpm  || '';
    document.getElementById('now-feel').textContent  = meta.feel || '';
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('backdrop').classList.add('hidden');
  } catch (e) {
    console.error('failed to load', name, e);
    loadIntoFrame(`// Neizdevās ielādēt ${name}\n// (${e.message})\n// Palaid lokālo serveri: npx serve . vai python3 -m http.server`);
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
      <p>Lai pievienotu favorītu: nokopē jebkuru <code>.strudel</code> failu šajā mapē (<code>izlase/</code>). HTML/JS rediģēt nevajag.</p>
      <p>Lai redzētu lokāli:</p>
      <p><code>npx serve .</code> vai <code>python3 -m http.server</code> no repo saknes.</p>
    `;
  } else if (source === 'github') {
    hint.innerHTML = `
      <p>Mape <code>izlase/</code> ir tukša.</p>
      <p>Pievieno <code>.strudel</code> failu šajā mapē un atsvaidzini lapu — viss automātiski parādīsies.</p>
    `;
  } else {
    // dir-listing found nothing
    hint.innerHTML = `<p>Nav atrasti <code>.strudel</code> faili šajā mapē.</p>`;
  }
}

function setupMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  btn.addEventListener('click', () => {
    sidebar.classList.add('open');
    backdrop.classList.remove('hidden');
  });
  backdrop.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.add('hidden');
  });
}

// ─────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────

async function init() {
  setupMobileMenu();
  const { files, source } = await discoverFiles();

  if (files.length === 0) {
    showHint(source);
    return;
  }

  renderList(files);

  // Pick file from hash if present, else first
  const hash = decodeURIComponent(location.hash.slice(1));
  const initial = files.includes(hash) ? hash : files[0];
  await selectFile(initial);
}

init();
