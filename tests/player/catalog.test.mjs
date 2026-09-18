import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createCatalog, root, strudelFiles } from '../../tools/build-player.mjs';
import { readRoute } from '../../apps/player/lib/catalog.mjs';

test('every source is published byte-for-byte, uniquely, under every supported player prefix', async () => {
  const catalog = JSON.parse(await readFile(path.join(root, '_site/player/catalog.json')));
  const files = await strudelFiles(path.join(root, 'collections'));
  const tracks = catalog.albums.flatMap(album => album.tracks);
  assert.equal(tracks.length, files.length);
  assert.equal(new Set(tracks.map(track => track.id)).size, files.length);
  assert.deepEqual(tracks.map(track => decodeURIComponent(track.path.slice(7))).sort(), [...files].sort());
  for (const track of tracks) {
    const source = await readFile(path.join(root, 'collections', decodeURIComponent(track.path.slice(7))));
    for (const prefix of ['_site/player', '_site/docs/player', 'apps/player']) {
      const published = await readFile(path.join(root, prefix, decodeURIComponent(track.path)));
      assert.equal(published.compare(source), 0, `${prefix}/${track.path}`);
    }
    assert.equal(createHash('sha256').update(source).digest('hex'), track.sha256);
    for (const prefix of ['https://example.org/player/', 'https://u.github.io/renamed-repo/player/', 'https://u.github.io/renamed-repo/docs/player/', 'http://localhost/source/apps/player/']) {
      assert.ok(new URL(track.path, prefix).href.startsWith(prefix + 'tracks/'));
    }
  }
});

test('new albums, nested files, Unicode, URL characters and numeric order need no registry edits', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'ebtunes-catalog-'));
  try {
    await mkdir(path.join(temporary, 'new album/nested'), { recursive: true });
    for (const file of ['10-last.strudel', '2-first.strudel', 'nested/03-ā & # ?.strudel']) {
      await writeFile(path.join(temporary, 'new album', file), '// "A title <with> & text"\nsetcpm(30)\ns("bd")');
    }
    await writeFile(path.join(temporary, 'new album/README.md'), 'not a track');
    const result = await createCatalog(temporary);
    assert.equal(result.trackCount, 3);
    assert.equal(result.albums[0].id, 'new album');
    assert.equal(result.albums[0].tracks[0].filename, '2-first.strudel');
    assert.match(result.albums[0].tracks[2].path, /%23.*%3F/);
    assert.equal(result.albums[0].tracks[0].title, 'A title <with> & text');
    await writeFile(path.join(temporary, 'new album/invalid.strudel'), '<!doctype html>');
    await assert.rejects(() => createCatalog(temporary), /Invalid Strudel source/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('existing query and hash bookmarks remain readable, including malformed hashes', () => {
  assert.deepEqual(readRoute({ search: '?album=lofi&song=song-01.strudel', hash: '' }), { mode: null, album: 'lofi', song: 'song-01.strudel' });
  assert.equal(readRoute({ search: '', hash: '#album=fog-techno&song=01.strudel' }).album, 'fog-techno');
  assert.equal(readRoute({ search: '', hash: '#hard-bass' }).album, 'hard-bass');
  assert.equal(readRoute({ search: '?mode=build', hash: '#%FF' }).mode, 'build');
});
