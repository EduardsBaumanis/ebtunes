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

const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, '..');

app.use(cors());
app.use(express.json());

// ── Supabase ──────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ── API endpoints ─────────────────────────────────────────────────────────────

/**
 * POST /api/vote
 * Submit or remove a single vote for a song.
 * Body: { songId: string, vote: 1 | -1 | null, sessionId: string }
 */
app.post('/api/vote', async (req, res) => {
  const { songId, vote, sessionId } = req.body;

  if (!songId || !sessionId) {
    return res.status(400).json({ error: 'songId and sessionId are required' });
  }
  if (vote !== null && vote !== 1 && vote !== -1) {
    return res.status(400).json({ error: 'vote must be 1, -1, or null' });
  }

  try {
    if (vote === null) {
      const { error } = await supabase
        .from('song_votes')
        .delete()
        .eq('session_id', sessionId)
        .eq('song_id', songId);

      if (error) return res.status(400).json({ error: error.message });
      return res.json({ success: true });
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('song_votes')
      .upsert(
        { session_id: sessionId, song_id: songId, vote, created_at: now, updated_at: now },
        { onConflict: 'session_id,song_id' }
      );

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/votes
 * Retrieve all votes.
 */
app.get('/api/votes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('song_votes')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, votes: data, count: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/leaderboard
 * Aggregated net vote scores per song, sorted descending, top 20.
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('song_votes')
      .select('song_id, vote');

    if (error) return res.status(400).json({ error: error.message });

    const map = {};
    for (const { song_id, vote } of data) {
      if (!map[song_id]) map[song_id] = { song_id, up: 0, down: 0 };
      if (vote ===  1) map[song_id].up++;
      if (vote === -1) map[song_id].down++;
    }

    const leaderboard = Object.values(map)
      .map(s => ({ ...s, score: s.up - s.down }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Static files ──────────────────────────────────────────────────────────────

function mountPublic(publicPath, sourcePath) {
  app.use(publicPath, express.static(path.join(ROOT, sourcePath)));
}

function mountLegacyPublic(publicPath, sourcePath) {
  mountPublic(publicPath, sourcePath);
  mountPublic('/docs' + publicPath, sourcePath);
}

mountLegacyPublic('/lofi-player', 'apps/lofi-player');
mountLegacyPublic('/lofi-rater', 'apps/lofi-rater');
mountLegacyPublic('/player', 'apps/player');
mountLegacyPublic('/izlase', 'apps/izlase');

[
  'acid',
  'amapiano',
  'bass',
  'berlin-school',
  'bluegrass',
  'footwork',
  'game',
  'gardens-of-broken-clocks',
  'genres',
  'hard-bass',
  'harmonic',
  'idm',
  'jazz-piano',
  'lofi',
  'medeival',
  'pack-demos',
  'prog',
  'rim',
  'saxophone-afterhours',
  'similarity-gradient',
  'study',
  'uk-garage',
  'vocals',
  'yt',
].forEach(name => mountLegacyPublic('/' + name, path.join('collections', name)));

mountLegacyPublic('/Skola', 'courses/Skola');
mountLegacyPublic('/TehnoSkola', 'courses/TehnoSkola');

mountLegacyPublic('/agent', 'tools/agent');
mountLegacyPublic('/merger', 'tools/merger');
mountLegacyPublic('/orginals', 'tools/orginals');
mountLegacyPublic('/reports', 'tools/reports');
mountLegacyPublic('/sampler', 'tools/sampler');
mountLegacyPublic('/strudel-to-mp3', 'tools/strudel-to-mp3');
mountLegacyPublic('/tools', 'tools');

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'apps', 'index.html'));
});

app.get(['/index.html', '/docs', '/docs/', '/docs/index.html'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'apps', 'index.html'));
});

app.get(['/README.md', '/docs/README.md'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'README.md'));
});

app.get(['/LICENSE', '/docs/LICENSE'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'LICENSE'));
});

app.get(['/STRUCTURE.md', '/docs/STRUCTURE.md'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'docs', 'STRUCTURE.md'));
});

app.get(['/STRUDEL_SAMPLE_REPOS.md', '/docs/STRUDEL_SAMPLE_REPOS.md'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'docs', 'STRUDEL_SAMPLE_REPOS.md'));
});

app.get(['/SUPABASE_SETUP.md', '/docs/SUPABASE_SETUP.md'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'docs', 'SUPABASE_SETUP.md'));
});

app.get(['/supabase-setup.sql', '/docs/supabase-setup.sql'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'docs', 'supabase-setup.sql'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT, 'apps', 'lofi-player', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Lofi Player running at http://localhost:${PORT}`);
});
