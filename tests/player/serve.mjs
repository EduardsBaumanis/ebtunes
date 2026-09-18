import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { root } from '../../tools/build-player.mjs';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.strudel': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const source = pathname.startsWith('/source/');
    const base = path.resolve(source ? root : path.join(root, '_site'));
    const relative = source ? pathname.slice(8) : pathname.replace(/^\/(?:ebtunes|renamed-repo)\//, '/');
    let file = path.resolve(base, '.' + (relative.startsWith('/') ? relative : '/' + relative));
    if (!file.startsWith(base + path.sep)) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4173, '127.0.0.1');
