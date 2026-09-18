// One reproducible public layout for local smoke tests and GitHub Pages.
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildPlayer, root } from './build-player.mjs';

await buildPlayer();
const output = path.join(root, '_site');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const copy = (from, to = from) => cp(path.join(root, from), path.join(output, to), { recursive: true });
await Promise.all(['README.md', 'LICENSE', '.nojekyll'].map(file => copy(file)));
await copy('apps/index.html', 'index.html');
for (const group of ['apps', 'collections', 'courses']) {
  for (const entry of await readdir(path.join(root, group), { withFileTypes: true })) {
    if (entry.isDirectory()) await copy(`${group}/${entry.name}`, entry.name);
  }
}
for (const name of ['agent', 'merger', 'orginals', 'reports', 'sampler', 'strudel-to-mp3']) await copy(`tools/${name}`, name);
await copy('tools/strudel-similarity.mjs');
// Preserve historical /docs/player/ and album URLs without another build or path heuristic.
const mirror = path.join(root, '_site-docs-mirror');
await rm(mirror, { recursive: true, force: true });
await cp(output, mirror, { recursive: true });
await cp(mirror, path.join(output, 'docs'), { recursive: true });
await rm(mirror, { recursive: true, force: true });
for (const name of await readdir(path.join(root, 'docs'))) {
  if (/\.(md|sql)$/.test(name)) {
    await copy(`docs/${name}`, name);
    await copy(`docs/${name}`, `docs/${name}`);
  }
}
await writeFile(path.join(output, '.nojekyll'), '');
console.log('Pages artifact ready in _site/');
