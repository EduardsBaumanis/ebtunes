// Copyright (C) 2026 Eduarda Baumaņa. AGPL-3.0.
export async function fetchText(url, { signal, json = false } = {}) {
  const timeout = AbortSignal.timeout(20000);
  const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout, cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load ${new URL(url).pathname} (HTTP ${response.status}).`);
  const text = await response.text();
  if (!text.trim() || /^\s*(?:<!doctype|<html)/i.test(text)) throw new Error('The server returned an empty file or HTML instead of the requested music data.');
  return json ? JSON.parse(text) : text;
}

export async function loadCatalog(base) {
  const catalog = await fetchText(new URL('catalog.json', base), { json: true });
  if (catalog.version !== 1 || !Array.isArray(catalog.albums) || !catalog.albums.length) throw new Error('The music catalog is missing or incompatible. Rebuild the player.');
  const ids = new Set();
  let count = 0;
  for (const album of catalog.albums) {
    if (!album.id || !Array.isArray(album.tracks) || !album.tracks.length) throw new Error('Invalid album in music catalog.');
    for (const track of album.tracks) {
      const url = new URL(track.path, base);
      if (!track.id || !track.title || ids.has(track.id) || !url.href.startsWith(new URL('tracks/', base).href)) throw new Error('Invalid track in music catalog.');
      ids.add(track.id);
      count++;
    }
  }
  if (count !== catalog.trackCount) throw new Error('The music catalog has an inconsistent track count.');
  return catalog;
}

export function readRoute(location) {
  const query = new URLSearchParams(location.search);
  let hash = location.hash.slice(1);
  try { hash = decodeURIComponent(hash); } catch { hash = ''; }
  const legacy = new URLSearchParams(hash.includes('=') ? hash : '');
  return {
    mode: query.get('mode') || legacy.get('mode'),
    album: query.get('album') || query.get('playlist') || legacy.get('album') || legacy.get('playlist') || (!hash.includes('=') ? hash : ''),
    song: query.get('song') || legacy.get('song'),
  };
}
