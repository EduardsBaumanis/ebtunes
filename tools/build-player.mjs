// Copyright (C) 2026 Eduarda Baumaņa. AGPL-3.0.
import { readdir, readFile, mkdir, cp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const root = fileURLToPath(new URL('../', import.meta.url));
const order = (a, b) => a.localeCompare(b, 'en', { numeric: true });
export const humanize = name => name.replace(/\.(?:strudel|txt)$/i, '').replace(/^(?:[a-z]+-)?\d+-/i, '').replace(/[-_]/g, ' ');

export async function strudelFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) return strudelFiles(path.join(directory, entry.name), relative + '/');
    return entry.isFile() && /\.(?:strudel|txt)$/i.test(entry.name) ? [relative] : [];
  }));
  return files.flat().sort(order);
}

export async function createCatalog(collections) {
  const files = await strudelFiles(collections);
  const albums = new Map();
  for (const file of files) {
    const parts = file.split('/');
    const id = parts.length > 1 ? parts.shift() : '_singles';
    const filename = parts.join('/');
    const code = await readFile(path.join(collections, file), 'utf8');
    if (!code.trim() || /^\s*(?:<!doctype|<html)/i.test(code)) throw new Error(`Invalid Strudel source: ${file}`);
    const field = name => code.match(new RegExp(`^//\\s*${name}:\\s*(.+)$`, 'mi'))?.[1]?.trim() || '';
    const title = code.match(/^\/\/\s*"([^"]+)"/m)?.[1] || humanize(path.basename(file));
    const hash = createHash('sha256').update(code).digest('hex');
    const track = {
      id: `${id}/${filename}`, filename, title,
      path: `tracks/${file.split('/').map(encodeURIComponent).join('/')}`,
      sha256: hash, key: field('Key'), tempo: field('Tempo'), feel: field('Feel') || field('Mood'),
    };
    if (!albums.has(id)) albums.set(id, { id, title: id === '_singles' ? 'Singles' : humanize(id), tracks: [] });
    albums.get(id).tracks.push(track);
  }
  if (!files.length) throw new Error('No .strudel files found in collections/');
  return { version: 1, trackCount: files.length, albums: [...albums.values()].sort((a, b) => order(a.id, b.id)) };
}

export async function buildPlayer(destination = path.join(root, 'apps/player')) {
  const catalog = await createCatalog(path.join(root, 'collections'));
  await mkdir(destination, { recursive: true });
  for (const directory of ['tracks', 'vendor']) await rm(path.join(destination, directory), { recursive: true, force: true });
  // Only publish musical sources. README files and future tooling stay outside the player payload.
  for (const album of catalog.albums) {
    for (const track of album.tracks) {
      const file = decodeURIComponent(track.path.slice('tracks/'.length));
      const target = path.join(destination, 'tracks', file);
      await mkdir(path.dirname(target), { recursive: true });
      await cp(path.join(root, 'collections', file), target);
    }
  }
  await cp(path.join(root, 'node_modules/@strudel/repl/dist'), path.join(destination, 'vendor/strudel'), { recursive: true });
  await cp(path.join(root, 'node_modules/@strudel/repl/LICENSE'), path.join(destination, 'vendor/strudel/LICENSE'));
  await writeFile(path.join(destination, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Player: ${catalog.albums.length} albums, ${catalog.trackCount} tracks; Strudel 1.3.0.`);
  return catalog;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildPlayer();
