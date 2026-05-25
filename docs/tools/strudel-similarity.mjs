#!/usr/bin/env node
// Strudel Similarity Tool
// Measures how similar one .strudel file is to the rest of the repo.
//
// Usage:
//   node tools/strudel-similarity.mjs --all
//   node tools/strudel-similarity.mjs path/to/file.strudel
//   node tools/strudel-similarity.mjs path/to/folder
//   node tools/strudel-similarity.mjs path/to/folder --json reports/x.json
//
// When --json is given, a sibling .md file is also written.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'reports', 'dist', 'build']);

const MUSICAL_FUNCTIONS = [
  'stack','s','note','n','sound','setcpm','slow','fast','every','sometimes',
  'rarely','chunk','struct','mask','euclid','degradeBy','jux','rev','off',
  'pan','gain','room','delay','lpf','hpf','cutoff','resonance','attack','release',
];

const VIZ_FUNCTIONS = ['_pianoroll','_punchcard','pianoroll','punchcard'];
const VIZ_OPTIONS   = ['cycles','labels','vertical','flipTime','flipValues','smear','fold','playhead'];

// ── Pairwise feature weights — must sum to 100 ─────────────────────────────
const WEIGHTS = { token: 25, musicFunc: 20, soundSource: 20, rhythm: 15, meta: 5, viz: 5 };
const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a,b)=>a+b, 0); // 90
// Final score combiner: 0.65*avg + 0.35*max  (NN-penalty implicit in max-leaning)
const AVG_WEIGHT = 0.65;
const MAX_WEIGHT = 0.35;

// ── Repo walking ──────────────────────────────────────────────────────────
function* walk(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      yield* walk(path.join(dir, e.name));
    } else if (e.isFile() && e.name.endsWith('.strudel')) {
      yield path.join(dir, e.name);
    }
  }
}

const readFile = p => fs.readFileSync(p, 'utf-8');

// ── Helpers ───────────────────────────────────────────────────────────────
const stripComments = s => s.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

function multiset(arr) {
  const m = new Map();
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
  return m;
}

function cosineMultiset(a, b) {
  let dot = 0, na = 0, nb = 0;
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    const va = a.get(k) || 0, vb = b.get(k) || 0;
    dot += va*vb; na += va*va; nb += vb*vb;
  }
  return (na === 0 || nb === 0) ? 0 : dot / Math.sqrt(na*nb);
}

// TF-IDF cosine: down-weights tokens that appear in many files, up-weights rare
// idioms. Without this, every file looks 80%+ similar because `stack`, `gain`,
// `note` and `sound` appear in nearly every track and dominate the dot product.
function cosineMultisetIDF(a, b, idf) {
  let dot = 0, na = 0, nb = 0;
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    // Smooth IDF — common tokens still contribute a little, rare ones a lot
    const w = (idf.get(k) ?? 1) + 0.5;
    const va = (a.get(k) || 0) * w;
    const vb = (b.get(k) || 0) * w;
    dot += va*vb; na += va*va; nb += vb*vb;
  }
  return (na === 0 || nb === 0) ? 0 : dot / Math.sqrt(na*nb);
}

// IDF index built once for the whole corpus.
let _idfTokens = null, _idfMusicFunc = null, _idfSoundSource = null;
function buildIDF(allLists) {
  const df = new Map();
  for (const tokens of allLists) {
    const seen = new Set(tokens);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = allLists.length;
  const idf = new Map();
  for (const [t, count] of df) idf.set(t, Math.log(N / count));
  return idf;
}

function jaccard(arrA, arrB) {
  const a = new Set(arrA), b = new Set(arrB);
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

// ── Feature 1: Token / syntax (25%) ───────────────────────────────────────
function extractTokens(src) {
  const c = stripComments(src);
  const toks = [];
  // method chains
  for (const m of c.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_]*)/g)) toks.push('.' + m[1]);
  // function calls (not preceded by . or identifier char)
  for (const m of c.matchAll(/(?<![.\w])([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)) toks.push(m[1]);
  // bigrams of method chains (to catch idioms like .sound.attack)
  const meth = [...c.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_]*)/g)].map(x=>x[1]);
  for (let i = 0; i < meth.length-1; i++) toks.push('bi:'+meth[i]+'.'+meth[i+1]);
  return toks;
}

const tokenSimilarity = (a, b) =>
  cosineMultisetIDF(multiset(extractTokens(a)), multiset(extractTokens(b)), _idfTokens);

// ── Feature 2: Musical-function (20%) ─────────────────────────────────────
function extractMusicalFunctions(src) {
  const c = stripComments(src);
  const counts = new Map();
  for (const fn of MUSICAL_FUNCTIONS) {
    const re = new RegExp(`(?:^|[^.\\w])${fn}\\s*\\(|\\.${fn}\\s*\\(`, 'g');
    const ms = c.match(re);
    if (ms) counts.set(fn, ms.length);
  }
  return counts;
}

const musicalFunctionSimilarity = (a, b) =>
  cosineMultisetIDF(extractMusicalFunctions(a), extractMusicalFunctions(b), _idfMusicFunc);

// ── Feature 3: Sound-source (20%) ─────────────────────────────────────────
function extractSoundSources(src) {
  const c = stripComments(src);
  const out = [];
  // s("foo bar*4 cp")
  for (const m of c.matchAll(/(?:^|[^.\w])s\s*\(\s*["'`]([^"'`]+)["'`]/g)) {
    const toks = m[1].split(/[\s,]+/)
      .map(t => t.replace(/[*\d~<>\[\]/]/g, '').trim())
      .filter(t => t && t !== '~');
    for (const t of toks) out.push('smp:' + t);
  }
  // .sound("sawtooth")
  for (const m of c.matchAll(/\.sound\s*\(\s*["'`]([^"'`]+)["'`]/g)) out.push('syn:' + m[1].trim());
  // samples("pack")
  for (const m of c.matchAll(/\bsamples\s*\(\s*["'`]([^"'`]+)["'`]/g)) out.push('pack:' + m[1].trim());
  return out;
}

const soundSourceSimilarity = (a, b) =>
  cosineMultisetIDF(multiset(extractSoundSources(a)), multiset(extractSoundSources(b)), _idfSoundSource);

// ── Feature 4: Rhythmic / pattern shape (15%) ─────────────────────────────
function countStackLayers(src) {
  const c = stripComments(src);
  const idx = c.indexOf('stack(');
  if (idx < 0) return 1;
  let depth = 0, inStr = null, layers = 0, anyContent = false;
  for (let i = idx + 5; i < c.length; i++) {
    const ch = c[i];
    if (inStr) {
      if (ch === inStr && c[i-1] !== '\\') inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') { depth--; if (depth === 0) break; }
    else if (ch === ',' && depth === 1) layers++;
    else if (depth === 1 && !/\s/.test(ch)) anyContent = true;
  }
  return anyContent ? layers + 1 : 1;
}

function rhythmicFeatures(src) {
  const c = stripComments(src);
  const patterns = [...c.matchAll(/["'`]([^"'`\n]*[~xX][^"'`\n]*)["'`]/g)].map(m=>m[1]);
  let total = 0, rest = 0, hit = 0;
  for (const p of patterns) {
    for (const ch of p) {
      total++;
      if (ch === '~') rest++;
      else if (ch === 'x' || ch === 'X') hit++;
    }
  }
  return {
    layers:        countStackLayers(c),
    density:       total ? hit / total : 0,
    silence:       total ? rest / total : 0,
    euclidUses:    (c.match(/\.euclid\s*\(/g) || []).length,
    fastUses:      (c.match(/\.fast\s*\(/g) || []).length,
    slowUses:      (c.match(/\.slow\s*\(/g) || []).length,
    starN:         (c.match(/\*\d+/g) || []).length,
    patternStrs:   patterns.length,
  };
}

function rhythmicSimilarity(a, b) {
  const ra = rhythmicFeatures(a), rb = rhythmicFeatures(b);
  const keys = Object.keys(ra);
  let total = 0;
  for (const k of keys) {
    const va = ra[k], vb = rb[k];
    const denom = Math.max(va, vb, 1);
    total += 1 - Math.abs(va - vb) / denom;
  }
  return total / keys.length;
}

// ── Feature 5: Metadata / comment (5%) ────────────────────────────────────
function extractMetadata(src) {
  const lines = src.split('\n').slice(0, 50);
  const header = lines.filter(l => l.trim().startsWith('//')).join(' ').toLowerCase();
  const out = [];
  const tempo = header.match(/(\d{2,3})\s*bpm/);
  if (tempo) out.push('tempo:' + Math.round(parseInt(tempo[1])/10)*10);
  const cpm = header.match(/setcpm\s*[: ]\s*(\d+(?:\.\d+)?)/);
  if (cpm) out.push('cpm:' + Math.round(parseFloat(cpm[1])/5)*5);
  const key = header.match(/key[: ]+([a-g][#b]?)\s*(minor|major|dorian|phrygian|lydian|mixolydian|aeolian)?/);
  if (key) out.push('key:' + key[1] + (key[2] || ''));
  const genre = header.match(/genre[: ]+([a-z][a-z\- /]*?)(?:[/]|$|tempo|mood)/);
  if (genre) out.push('genre:' + genre[1].trim().slice(0, 24));
  const album = header.match(/album[: ]+([a-z][a-z\- ]*?)(?:[/]|$|track)/);
  if (album) out.push('album:' + album[1].trim().slice(0, 24));
  // mood words
  for (const w of ['dark','warm','bright','sad','melancholy','sparse','dense','dreamy','aggressive','soft','heavy']) {
    if (header.includes(w)) out.push('mood:' + w);
  }
  return out;
}

const metadataSimilarity = (a, b) => jaccard(extractMetadata(a), extractMetadata(b));

// ── Feature 6: Visualisation (5%) ─────────────────────────────────────────
function extractVisualisation(src) {
  const c = stripComments(src);
  const out = [];
  for (const fn of VIZ_FUNCTIONS) {
    const re = new RegExp(`\\.${fn}\\s*\\(`, 'g');
    if (c.match(re)) out.push('viz:' + fn);
  }
  // also bare-call (no dot) for completeness
  for (const fn of VIZ_FUNCTIONS) {
    const re = new RegExp(`(?<![.\\w])${fn}\\s*\\(`, 'g');
    if (c.match(re)) out.push('viz:' + fn);
  }
  for (const opt of VIZ_OPTIONS) {
    const re = new RegExp(`\\b${opt}\\s*:`, 'g');
    if (c.match(re)) out.push('opt:' + opt);
  }
  return [...new Set(out)];
}

const vizSimilarity = (a, b) => jaccard(extractVisualisation(a), extractVisualisation(b));

// ── Pairwise composite ────────────────────────────────────────────────────
function pairwise(srcA, srcB) {
  const f = {
    token:       tokenSimilarity(srcA, srcB),
    musicFunc:   musicalFunctionSimilarity(srcA, srcB),
    soundSource: soundSourceSimilarity(srcA, srcB),
    rhythm:      rhythmicSimilarity(srcA, srcB),
    meta:        metadataSimilarity(srcA, srcB),
    viz:         vizSimilarity(srcA, srcB),
  };
  let sum = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) sum += w * f[k];
  return { score: (sum / TOTAL_WEIGHT) * 100, features: f };
}

// ── File-vs-repo ──────────────────────────────────────────────────────────
function bandFor(s) {
  if (s >= 91) return 'near-duplicate';
  if (s >= 76) return 'very similar';
  if (s >= 61) return 'close to existing style';
  if (s >= 41) return 'moderately similar';
  if (s >= 26) return 'noticeably different';
  if (s >= 11) return 'highly original';
  return 'radically different';
}

function explain(top1, finalScore) {
  const sortedFeats = Object.entries(top1.features).sort((a,b) => b[1] - a[1]);
  const dom = sortedFeats.slice(0, 2).map(([k, v]) => `${k}=${(v*100).toFixed(0)}%`).join(', ');
  return `Closest match: ${top1.file} (${top1.score.toFixed(1)}). Dominant features: ${dom}. Final ${finalScore.toFixed(1)}.`;
}

function analyzeFile(targetPath, allPaths, allSources) {
  const idx = allPaths.findIndex(p => path.resolve(p) === path.resolve(targetPath));
  const src = idx >= 0 ? allSources[idx] : readFile(targetPath);
  const sims = [];
  for (let i = 0; i < allPaths.length; i++) {
    if (i === idx) continue;
    const r = pairwise(src, allSources[i]);
    sims.push({ file: path.relative(REPO_ROOT, allPaths[i]), score: r.score, features: r.features });
  }
  if (sims.length === 0) return null;
  sims.sort((a, b) => b.score - a.score);
  const top1 = sims[0];
  const top5 = sims.slice(0, 5);
  // Neighborhood-weighted average: average of top-K closest files. The prompt's
  // "weightedAverageSimilarityToAllFiles" — weighting toward the nearest part
  // of the corpus — gives a much wider, more useful dynamic range than a flat
  // average across 590 unrelated genres.
  const K = Math.max(20, Math.ceil(sims.length / 30));
  const topKAvg = sims.slice(0, K).reduce((s, x) => s + x.score, 0) / Math.min(K, sims.length);
  const flatAvg = sims.reduce((s, x) => s + x.score, 0) / sims.length;
  const max = top1.score;
  const finalScore = AVG_WEIGHT * topKAvg + MAX_WEIGHT * max;
  const warnings = [];
  if (max > 90) warnings.push(`NEAR-DUPLICATE: max=${max.toFixed(1)}`);
  if (top1.features.token > 0.85) warnings.push(`TOKEN-DUPLICATE: token=${(top1.features.token*100).toFixed(0)}%`);
  if (top1.features.soundSource > 0.85) warnings.push(`SOUND-DUPLICATE: sound=${(top1.features.soundSource*100).toFixed(0)}%`);
  return {
    file: path.relative(REPO_ROOT, targetPath),
    finalScore: round1(finalScore),
    band: bandFor(finalScore),
    averageSimilarity: round1(topKAvg),
    flatAverageSimilarity: round1(flatAvg),
    maxSimilarity: round1(max),
    neighborhoodK: K,
    featureBreakdown: Object.fromEntries(
      Object.keys(WEIGHTS).map(k => [k, round1(top1.features[k] * 100)])
    ),
    top5: top5.map(x => ({ file: x.file, score: round1(x.score) })),
    warnings,
    explanation: explain(top1, finalScore),
  };
}

function round1(n) { return Math.round(n * 10) / 10; }

// ── Reports ───────────────────────────────────────────────────────────────
function writeMarkdown(results, mdPath) {
  const lines = [];
  lines.push('# Strudel similarity report\n');
  lines.push(`Generated: ${new Date().toISOString()}  `);
  lines.push(`Total files analyzed: **${results.length}**  `);
  lines.push(`Scoring: \`finalScore = 0.65 * avg + 0.35 * max\`. Pairwise weights: token 25 / musicFunc 20 / soundSource 20 / rhythm 15 / meta 5 / viz 5.\n`);
  lines.push('## Summary\n');
  lines.push('| File | Final | Band | Avg | Max | Warnings |');
  lines.push('|---|---:|---|---:|---:|---|');
  for (const r of results) {
    const warn = r.warnings.length ? r.warnings.join('; ') : '';
    lines.push(`| \`${r.file}\` | ${r.finalScore} | ${r.band} | ${r.averageSimilarity} | ${r.maxSimilarity} | ${warn} |`);
  }
  lines.push('\n## Per-file detail\n');
  for (const r of results) {
    lines.push(`### \`${r.file}\``);
    lines.push(`- **Final**: ${r.finalScore} (${r.band})`);
    lines.push(`- **Average**: ${r.averageSimilarity}`);
    lines.push(`- **Max**: ${r.maxSimilarity}`);
    lines.push(`- **Features**: ${Object.entries(r.featureBreakdown).map(([k,v]) => `${k}=${v}`).join(', ')}`);
    if (r.warnings.length) lines.push(`- **Warnings**: ${r.warnings.join('; ')}`);
    lines.push(`- **Explanation**: ${r.explanation}`);
    lines.push(`- **Top 5 nearest**:`);
    for (const t of r.top5) lines.push(`  - \`${t.file}\` (${t.score})`);
    lines.push('');
  }
  fs.mkdirSync(path.dirname(mdPath), { recursive: true });
  fs.writeFileSync(mdPath, lines.join('\n'));
}

// ── CLI ───────────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  let target = null, allFlag = false, jsonOut = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--all') allFlag = true;
    else if (a === '--json') jsonOut = args[++i];
    else if (!a.startsWith('-')) target = a;
  }

  const allPaths = [...walk(REPO_ROOT)];
  console.error(`Indexed ${allPaths.length} .strudel files`);
  const allSources = allPaths.map(readFile);
  // Build IDF tables once over the corpus
  _idfTokens      = buildIDF(allSources.map(s => extractTokens(s)));
  _idfMusicFunc   = buildIDF(allSources.map(s => [...extractMusicalFunctions(s).keys()]));
  _idfSoundSource = buildIDF(allSources.map(s => extractSoundSources(s)));
  console.error(`IDF built: ${_idfTokens.size} tokens, ${_idfMusicFunc.size} music-funcs, ${_idfSoundSource.size} sound-sources`);

  let results = [];
  if (allFlag) {
    results = allPaths.map(p => analyzeFile(p, allPaths, allSources)).filter(Boolean);
  } else if (target) {
    const abs = path.resolve(target);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      results = [...walk(abs)].map(p => analyzeFile(p, allPaths, allSources)).filter(Boolean);
    } else {
      const r = analyzeFile(abs, allPaths, allSources);
      if (r) results.push(r);
    }
  } else {
    console.error('Usage: node tools/strudel-similarity.mjs <path|--all> [--json reports/x.json]');
    process.exit(1);
  }

  // Console table
  for (const r of results) {
    const w = r.warnings.length ? '  ⚠ ' + r.warnings.join('; ') : '';
    console.log(`${r.finalScore.toFixed(1).padStart(5)}  [${r.band.padEnd(24)}]  ${r.file}${w}`);
  }

  if (jsonOut) {
    fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
    fs.writeFileSync(jsonOut, JSON.stringify(results, null, 2));
    console.error(`Wrote ${jsonOut}`);
    const mdPath = jsonOut.replace(/\.json$/, '.md');
    writeMarkdown(results, mdPath);
    console.error(`Wrote ${mdPath}`);
  }
}

main();
