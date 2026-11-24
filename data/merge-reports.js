// Folds reported project write-ups into data/descriptions.json.
//
//   node data/merge-reports.js <reporter-output-dir>
//
// A reported entry is prose a person could have written, with the source of every sentence
// recorded next to it. It replaces the short researched line on that project's page.
// Anything that fails a check below is left out rather than published.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DIR = process.argv[2];
if (!DIR) { console.error('usage: node data/merge-reports.js <reporter-output-dir>'); process.exit(1); }

const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/descriptions.json'), 'utf8'));
const PROJECTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8')).projects;
const byId = {};
PROJECTS.forEach(p => { byId[p.id] = p; });

// "groundbreaking" is left out on purpose: in this subject it is almost always the noun, as
// in "at the November groundbreaking", and flagging it threw away a good page.
const HYPE = /\b(massive|cutting[- ]edge|state[- ]of[- ]the[- ]art|game[- ]?chang\w*|iconic|sprawling|whopping|boasts?|poised to|revolutionar\w*|world[- ]class|unparalleled|transformative|bring[s]? (good )?jobs)\b/i;
const SELF = /\b(as an? (AI|language model)|I (could not|couldn't|was unable)|according to my|based on (my|our) (research|analysis))\b/i;

const dropped = {};
function reject(id, why) {
  dropped[why] = (dropped[why] || 0) + 1;
  return null;
}

function accept(rec) {
  const id = rec && rec.id;
  if (!id || !byId[id]) return reject(id || '?', 'unknown project id');
  const sents = Array.isArray(rec.sentences) ? rec.sentences.filter(s => s && s.t && String(s.t).trim()) : [];
  if (!sents.length) return reject(id, 'no sentences');

  // Every sentence carries where it came from, which is the whole point of the exercise.
  const unsourced = sents.filter(s => !s.src || !String(s.src).trim());
  if (unsourced.length) return reject(id, 'a sentence with no source');

  const text = sents.map(s => String(s.t).trim()).join(' ').replace(/\s+/g, ' ').trim();
  if (text.indexOf('—') >= 0) return reject(id, 'em dash');
  if (HYPE.test(text)) return reject(id, 'hype wording');
  if (SELF.test(text)) return reject(id, 'refers to the writer');
  // American spelling for American sites. Elsewhere "data centre" is the local spelling and
  // often part of the project's own name, so it stands.
  if (/\bdatacenter\b/i.test(text)) return reject(id, 'datacenter written as one word');
  if (byId[id].country === 'United States' && /\bdata centre\b/i.test(text)) {
    return reject(id, 'British spelling on a United States site');
  }
  if (text.length < 120) return reject(id, 'too short to be reporting');

  const words = text.split(/\s+/).length;
  if (words > 1200) return reject(id, 'over length');

  // Our own background must not be credited to an outlet. The county count is ours and the
  // grid figures come from federal filings by way of FracTracker, not from a dataset vendor.
  const misattributed = sents.filter(s =>
    /^data:context\.(data_centers_in_county|grid_control_area)$/.test(s.src)
    && /\b(Epoch AI|FracTracker|Baxtel|DataCenterMap)\b/i.test(s.t));
  if (misattributed.length) return reject(id, 'credits our own background to an outlet');

  // Group into paragraphs in the order given.
  const paras = [];
  sents.forEach(s => {
    const i = Number.isInteger(s.para) ? s.para : 0;
    (paras[i] = paras[i] || []).push(String(s.t).trim());
  });
  const paragraphs = paras.filter(Boolean).map(p => p.join(' ').replace(/\s+/g, ' ').trim());

  const urls = [...new Set(sents.map(s => String(s.src)).filter(u => /^https?:/.test(u))
    .concat((rec.sources || []).filter(u => /^https?:/.test(u))))];

  return {
    id,
    mode: 'reported',
    text,
    paragraphs,
    words,
    sentences: sents.map(s => ({ para: Number.isInteger(s.para) ? s.para : 0, t: String(s.t).trim(), src: String(s.src).trim() })),
    sources: urls,
    unconfirmed: rec.unconfirmed ? String(rec.unconfirmed).slice(0, 400) : undefined
  };
}

let files = 0, seen = 0, kept = 0;
const lengths = [];

fs.readdirSync(DIR).filter(f => /\.json$/.test(f)).sort().forEach(f => {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
  catch (e) { console.log('  could not read ' + f + ': ' + e.message); return; }
  if (!Array.isArray(rows)) { console.log('  ' + f + ' is not an array, skipped'); return; }
  files++;
  rows.forEach(rec => {
    seen++;
    const v = accept(rec);
    if (!v) return;
    D[v.id] = v;
    kept++;
    lengths.push({ id: v.id, words: v.words, paras: v.paragraphs.length, srcs: v.sources.length });
  });
});

fs.writeFileSync(path.join(ROOT, 'data/descriptions.json'), JSON.stringify(D, null, 1));

console.log('reporter files read     ' + files);
console.log('write-ups seen          ' + seen);
console.log('published               ' + kept);
console.log('left out                ' + (seen - kept));
if (Object.keys(dropped).length) {
  console.log('');
  console.log('why they were left out:');
  Object.entries(dropped).sort((a, b) => b[1] - a[1]).forEach(([w, n]) => console.log('  ' + String(n).padStart(4) + '  ' + w));
}
if (lengths.length) {
  console.log('');
  console.log('length of each page:');
  lengths.sort((a, b) => b.words - a.words).forEach(l =>
    console.log('  ' + String(l.words).padStart(5) + ' words  ' + String(l.paras).padStart(2) + ' paras  '
      + String(l.srcs).padStart(2) + ' sources  ' + l.id));
}
