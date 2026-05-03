const STORAGE_KEY = 'lofi-rater-votes';

let queue = [];
let current = null;
let votes = {};

function loadVotes() {
  try {
    votes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    votes = {};
  }
}

function saveVotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

function buildQueue() {
  queue = SONGS.filter(s => !(s.id in votes));
}

function strudelUrl(code) {
  return 'https://strudel.cc/#' + btoa(unescape(encodeURIComponent(code)));
}

let playerPlaying = false;

function getEngine() {
  return document.getElementById('strudel-engine');
}

function openPlayer(song) {
  document.getElementById('player-title').textContent = song.title;
  document.getElementById('player-panel').classList.add('open');
  const engine = getEngine();
  if (engine.editor) {
    engine.editor.setCode(song.code);
    try { engine.editor.evaluate(); playerPlaying = true; } catch (e) {}
  }
  document.getElementById('player-play-stop').textContent = playerPlaying ? '■' : '▶';
}

function closePlayer() {
  document.getElementById('player-panel').classList.remove('open');
  const engine = getEngine();
  if (engine.editor) { try { engine.editor.stop(); } catch (e) {} }
  playerPlaying = false;
  document.getElementById('player-play-stop').textContent = '▶';
}

function togglePlayStop() {
  const engine = getEngine();
  if (!engine.editor) return;
  if (playerPlaying) {
    try { engine.editor.stop(); } catch (e) {}
    playerPlaying = false;
    document.getElementById('player-play-stop').textContent = '▶';
  } else {
    try { engine.editor.evaluate(); } catch (e) {}
    playerPlaying = true;
    document.getElementById('player-play-stop').textContent = '■';
  }
}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function updateProgress() {
  const total = SONGS.length;
  const done = total - queue.length;
  const pct = done / total * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = (done + 1) + ' / ' + total;
}

function renderCard(song) {
  document.getElementById('card-subtitle').textContent = song.subtitle;
  document.getElementById('card-title').textContent = song.title;
  document.getElementById('card-key').textContent = song.key;
  document.getElementById('card-bpm').textContent = song.bpm + ' BPM';
  document.getElementById('card-feel').textContent = song.feel;
  document.getElementById('card-chords').textContent = song.chords;

  const tagsEl = document.getElementById('card-tags');
  tagsEl.innerHTML = '';
  song.tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tagsEl.appendChild(span);
  });

  const playBtn = document.getElementById('card-play');
  playBtn.onclick = (e) => { e.preventDefault(); openPlayer(song); };
}

function nextCard() {
  closePlayer();
  if (queue.length === 0) {
    showResults();
    return;
  }
  current = queue.shift();
  renderCard(current);
  updateProgress();

  const card = document.getElementById('card');
  card.classList.remove('exit-hot', 'exit-not', 'flash-hot', 'flash-not', 'entering');
  void card.offsetWidth;
  card.classList.add('entering');
}

function vote(choice) {
  if (!current) return;

  const card = document.getElementById('card');
  const flashClass = choice === 'hot' ? 'flash-hot' : 'flash-not';
  const exitClass  = choice === 'hot' ? 'exit-hot'  : 'exit-not';

  card.classList.add(flashClass);

  setTimeout(() => {
    card.classList.remove(flashClass);
    card.classList.add(exitClass);

    votes[current.id] = choice;
    saveVotes();

    setTimeout(() => {
      nextCard();
    }, 320);
  }, 150);
}

function showResults() {
  showView('view-results');

  const hot  = SONGS.filter(s => votes[s.id] === 'hot');
  const not  = SONGS.filter(s => votes[s.id] === 'not');

  document.getElementById('results-summary').textContent =
    hot.length + ' hot · ' + not.length + ' not';

  const list = document.getElementById('results-list');
  list.innerHTML = '';

  const ranked = [...hot, ...not];

  ranked.forEach((song, i) => {
    const isHot = votes[song.id] === 'hot';
    const item = document.createElement('div');
    item.className = 'result-item';

    const rank = document.createElement('span');
    rank.className = 'result-rank';
    rank.textContent = i < hot.length ? '🔥' : '❄️';

    const info = document.createElement('div');
    info.className = 'result-info';

    const name = document.createElement('div');
    name.className = 'result-name';
    name.textContent = song.title;

    const meta = document.createElement('div');
    meta.className = 'result-meta';
    meta.textContent = song.key + '  ·  ' + song.bpm + ' BPM';

    const playLink = document.createElement('button');
    playLink.className = 'play-btn';
    playLink.textContent = '▶ Play';
    playLink.style.marginTop = '0.4rem';
    playLink.onclick = () => openPlayer(song);

    info.appendChild(name);
    info.appendChild(meta);
    info.appendChild(playLink);

    item.appendChild(rank);
    item.appendChild(info);

    list.appendChild(item);
  });
}

function reset() {
  votes = {};
  saveVotes();
  buildQueue();
  showView('view-rating');
  nextCard();
}

function init() {
  loadVotes();
  buildQueue();

  document.getElementById('btn-start').addEventListener('click', () => {
    if (queue.length === 0) {
      showResults();
    } else {
      showView('view-rating');
      nextCard();
    }
  });

  document.getElementById('btn-hot').addEventListener('click', () => vote('hot'));
  document.getElementById('btn-not').addEventListener('click', () => vote('not'));
  document.getElementById('btn-reset').addEventListener('click', reset);
  document.getElementById('player-close').addEventListener('click', closePlayer);
  document.getElementById('player-play-stop').addEventListener('click', togglePlayStop);

  document.addEventListener('keydown', e => {
    if (document.getElementById('player-panel').classList.contains('open')) {
      if (e.key === 'Escape') closePlayer();
    }
    if (document.getElementById('view-rating').classList.contains('active')) {
      if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') vote('hot');
      if (e.key === 'ArrowLeft'  || e.key === 'j' || e.key === 'J') vote('not');
    }
    if (document.getElementById('view-intro').classList.contains('active')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('btn-start').click();
      }
    }
  });

  if (Object.keys(votes).length === SONGS.length) {
    const introHint = document.querySelector('.intro-hint');
    if (introHint) introHint.textContent = 'you\'ve rated all 8 — click to see results';
  }
}

document.addEventListener('DOMContentLoaded', init);
