// Applies the sentence level pass to data/descriptions.json.
//
//   node data/apply-sentences.js <sentence-batches-dir> <sentence-verdicts-dir>
//
// The earlier checking pass judged a whole description at once, so one bad clause threw away
// three good sentences. This pass judges each sentence against the cited sources and keeps the
// ones that hold up. A description that loses every sentence becomes a fallback, and the page
// opens with a line built from the record instead.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SENT_DIR = process.argv[2];
const VERD_DIR = process.argv[3];
if (!SENT_DIR || !VERD_DIR) {
  console.error('usage: node data/apply-sentences.js <sentence-batches-dir> <sentence-verdicts-dir>');
  process.exit(1);
}

const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/descriptions.json'), 'utf8'));

// What each description was split into, so a verdict list lines up with real sentences.
const sentencesById = {};
fs.readdirSync(SENT_DIR).filter(f => /\.json$/.test(f)).forEach(f => {
  JSON.parse(fs.readFileSync(path.join(SENT_DIR, f), 'utf8'))
    .forEach(e => { sentencesById[e.id] = e.sentences; });
});

const verdictsById = {};
let files = 0;
fs.readdirSync(VERD_DIR).filter(f => /\.json$/.test(f)).sort().forEach(f => {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(VERD_DIR, f), 'utf8')); }
  catch (e) { console.log('  could not read ' + f + ': ' + e.message); return; }
  if (!Array.isArray(rows)) { console.log('  ' + f + ' is not an array, skipped'); return; }
  files++;
  rows.forEach(r => { if (r && r.id) verdictsById[r.id] = r; });
});

let checked = 0, unchecked = 0, kept = 0, deleted = 0, emptied = 0, shortened = 0, untouched = 0;
const reasons = {};

Object.keys(D).forEach(id => {
  const d = D[id];
  if (d.mode !== 'researched' || !d.text) return;

  const sents = sentencesById[id];
  const v = verdictsById[id];

  // No verdict means nobody read it. Unchecked text does not stay on a page.
  if (!sents || !v || !Array.isArray(v.verdicts) || v.verdicts.length !== sents.length) {
    D[id] = { id, text: null, sources: d.sources, mode: 'fallback', note: 'sentences not reached by the checking pass' };
    unchecked++; emptied++;
    return;
  }

  checked++;
  const survivors = [];
  sents.forEach((text, i) => {
    if (v.verdicts[i] === true) { survivors.push(text); kept++; return; }
    deleted++;
    const why = String((v.reasons && (v.reasons[String(i)] || v.reasons[i])) || 'not supported by the sources').slice(0, 70);
    reasons[why] = (reasons[why] || 0) + 1;
  });

  if (!survivors.length) {
    D[id] = { id, text: null, sources: d.sources, mode: 'fallback', note: 'every sentence failed the source check' };
    emptied++;
    return;
  }

  const joined = survivors.join(' ').replace(/\s+/g, ' ').trim();
  if (joined === d.text) { untouched++; return; }
  D[id] = { id, text: joined, sources: d.sources, mode: 'researched' };
  shortened++;
});

fs.writeFileSync(path.join(ROOT, 'data/descriptions.json'), JSON.stringify(D, null, 1));

console.log('verdict files read              ' + files);
console.log('descriptions checked            ' + checked);
console.log('  left unchanged                ' + untouched);
console.log('  shortened                     ' + shortened);
console.log('  emptied, now use the record   ' + emptied + (unchecked ? ' (' + unchecked + ' of them never checked)' : ''));
console.log('');
console.log('sentences kept                  ' + kept);
console.log('sentences deleted               ' + deleted);
if (Object.keys(reasons).length) {
  console.log('');
  console.log('why sentences were deleted:');
  Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .forEach(([w, n]) => console.log('  ' + String(n).padStart(4) + '  ' + w));
}
