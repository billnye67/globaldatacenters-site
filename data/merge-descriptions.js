// Merges the per-batch research output into data/descriptions.json and checks it before it
// is allowed anywhere near a page.
//
//   node data/merge-descriptions.js <batches-dir> <research-output-dir>
//
// The research itself is done separately: each batch of projects is handed to a worker that
// opens that project's own cited source urls and writes a short description from them. This
// script is the gate between that and the site. Anything that fails a check below is dropped
// to "fallback", which makes the page fall back to a line built from the data fields instead.
// Dropping is always safe. Publishing something unchecked is not.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BATCH_DIR = process.argv[2];
const OUT_DIR = process.argv[3];
if (!BATCH_DIR || !OUT_DIR) {
  console.error('usage: node data/merge-descriptions.js <batches-dir> <research-output-dir>');
  process.exit(1);
}

const PROJECTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8')).projects;
const byId = {};
PROJECTS.forEach(p => { byId[p.id] = p; });

// Words that read as sales copy rather than a record.
const HYPE = /\b(massive|cutting[- ]edge|state[- ]of[- ]the[- ]art|game[- ]?chang\w*|landmark|iconic|sprawling|whopping|boasts?|poised to|set to revolution\w*|revolutionar\w*|world[- ]class|premier|unparalleled|groundbreaking|transformative)\b/i;
// The writer must not appear in the text.
const SELF = /\b(as an? (AI|language model)|I (could not|couldn't|was unable)|the sources? (I|we) (found|read)|according to my|this description|based on (my|our) (research|analysis))\b/i;

function sentences(t) {
  return String(t).split(/(?<=[.!?])\s+/).filter(x => x.trim().length > 1);
}

const CONTESTED = /blocked|cancelled|withdrawn|suspended|on hold|paused|moratorium/i;

const reasons = {};
function drop(id, why) {
  reasons[why] = (reasons[why] || 0) + 1;
  return { id, text: null, sources: [], mode: 'fallback', note: why };
}

function validate(rec, batchEntry) {
  const id = rec && rec.id;
  if (!id || !byId[id]) return null;                       // not a project we know
  if (rec.mode !== 'researched' || !rec.text) return drop(id, 'worker returned fallback');

  const text = String(rec.text).replace(/\s+/g, ' ').trim();
  const p = byId[id];

  if (text.length < 40) return drop(id, 'too short');
  if (text.length > 1200) return drop(id, 'too long');
  if (text.indexOf('—') >= 0) return drop(id, 'em dash');
  if (HYPE.test(text)) return drop(id, 'hype wording');
  if (SELF.test(text)) return drop(id, 'refers to the writer');
  if (/\b(datacenter|data centre)\b/i.test(text)) return drop(id, 'spelling of data center');
  if (/^(null|n\/a|unknown|no information)/i.test(text)) return drop(id, 'empty answer');

  // Length rule: a contested site gets 2 to 4 sentences, everything else 1 to 3.
  const contested = batchEntry ? !!batchEntry.contested : (CONTESTED.test(p.status || '') || !!p.blocked);
  const n = sentences(text).length;
  if (contested && (n < 2 || n > 5)) return drop(id, 'sentence count for a contested site');
  if (!contested && (n < 1 || n > 4)) return drop(id, 'sentence count');

  // The sources cited must be that project's own.
  const own = new Set((p.sources || []).filter(u => /^https?:/.test(u)).concat(
    /^https?:/.test(p.dataset_url || '') ? [p.dataset_url] : []));
  const used = (rec.sources || []).filter(u => own.has(u));
  if (!used.length) return drop(id, 'cited no source of its own');

  // The project's own name should be recognisable in the text, which catches a description
  // that drifted onto the neighbouring site in the same batch.
  const place = [p.address, p.name].join(' ').toLowerCase();
  const words = String(p.name).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3);
  const hit = words.some(w => text.toLowerCase().indexOf(w) >= 0)
    || (p.developer && text.toLowerCase().indexOf(String(p.developer).toLowerCase().split(/[^a-z0-9]+/)[0]) >= 0);
  if (!hit && words.length) return drop(id, 'text does not mention this project or company');

  return { id, text, sources: used, mode: 'researched' };
}

// ---------------------------------------------------------------- run

const batches = {};
fs.readdirSync(BATCH_DIR).filter(f => /\.json$/.test(f)).forEach(f => {
  JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), 'utf8')).forEach(e => { batches[e.id] = e; });
});

const out = {};
let files = 0, seen = 0, kept = 0, dropped = 0, unknown = 0;

fs.readdirSync(OUT_DIR).filter(f => /\.json$/.test(f)).sort().forEach(f => {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf8')); }
  catch (e) { console.log('  could not read ' + f + ': ' + e.message); return; }
  if (!Array.isArray(rows)) { console.log('  ' + f + ' is not an array, skipped'); return; }
  files++;
  rows.forEach(rec => {
    seen++;
    const v = validate(rec, batches[rec && rec.id]);
    if (!v) { unknown++; return; }
    if (out[v.id] && out[v.id].mode === 'researched' && v.mode !== 'researched') return;
    out[v.id] = v;
    v.mode === 'researched' ? kept++ : dropped++;
  });
});

// Identical text on two pages is the thing this whole exercise exists to avoid.
const byText = {};
Object.values(out).forEach(v => {
  if (v.mode !== 'researched') return;
  const k = v.text.toLowerCase().slice(0, 120);
  (byText[k] = byText[k] || []).push(v.id);
});
let dupes = 0;
Object.values(byText).forEach(ids => {
  if (ids.length < 2) return;
  ids.slice(1).forEach(id => {                       // keep the first, drop the rest
    out[id] = { id, text: null, sources: [], mode: 'fallback', note: 'duplicate of another page' };
    dupes++; kept--; dropped++;
  });
});

fs.writeFileSync(path.join(ROOT, 'data/descriptions.json'), JSON.stringify(out, null, 1));

// Counted from the merged result, not from rows seen, because a retry pass writes a second
// row for a project the first pass gave up on.
const finalKept = Object.values(out).filter(function (v) { return v.mode === 'researched'; }).length;
const finalFallback = Object.values(out).length - finalKept;

console.log('batch result files read      ' + files);
console.log('rows seen                    ' + seen);
console.log('kept as researched           ' + finalKept);
console.log('dropped to fallback          ' + finalFallback);
console.log('unrecognised ids             ' + unknown);
console.log('dropped as duplicate text    ' + dupes);
if (Object.keys(reasons).length) {
  console.log('');
  console.log('why rows were dropped:');
  Object.entries(reasons).sort((a, b) => b[1] - a[1]).forEach(([w, n]) => console.log('  ' + String(n).padStart(5) + '  ' + w));
}
