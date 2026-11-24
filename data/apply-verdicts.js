// Applies the checking pass to data/descriptions.json.
//
//   node data/apply-verdicts.js <verdicts-dir>
//
// Each description was written from a project's own sources, then checked again by someone
// who did not write it. Anything the check could not support is dropped back to "fallback",
// which makes the page build its opening line from the record instead. Dropping costs nothing.
// A wrong sentence on a public page costs a lot.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const VDIR = process.argv[2];
if (!VDIR) {
  console.error('usage: node data/apply-verdicts.js <verdicts-dir>');
  process.exit(1);
}

// Checked by hand against the sources and found wrong. These stay dropped whatever an
// automated check says about them, and each line says what was actually wrong.
const HAND_FAILED = {
  'ft-607': 'said 182 people spoke against; the article says 182 signed up to speak, not that all opposed',
  'aligned-aligned-mink-street-etna': 'credited the rejection to Etna; the article is about Pataskala, and the 200 MW figure is in no source',
  'developers-vantage-atlanta-fayetteville': 'applied a Douglasville square footage to the Fayetteville site',
  'epoch-anthropic-lake-mariner': 'source is a company-wide investment release and never mentions this site',
  'gemini-xai-macrohardrr-colossus-3': 'described Colossus 2 and placed it in Southaven; the source puts the buildings in Memphis'
};

// A description that tells you the source was about something else is not a description of
// this site. One said outright that the project was a solar farm and not a data center.
const DISCLAIMS = /\b(is not a data ?cent(er|re)|not a data ?cent(er|re) but|rather a (solar|wind|gas|power) |does not (appear to )?(describe|mention|discuss)|no information (about|on)|the (page|source|article) (does not|doesn't))/i;

const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/descriptions.json'), 'utf8'));

const verdicts = {};
let files = 0;
fs.readdirSync(VDIR).filter(f => /\.json$/.test(f)).sort().forEach(f => {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(VDIR, f), 'utf8')); }
  catch (e) { console.log('  could not read ' + f + ': ' + e.message); return; }
  if (!Array.isArray(rows)) { console.log('  ' + f + ' is not an array, skipped'); return; }
  files++;
  rows.forEach(r => { if (r && r.id) verdicts[r.id] = r; });
});

let ok = 0, failed = 0, unchecked = 0, hand = 0, disclaimed = 0;
const reasons = {};

Object.keys(D).forEach(id => {
  const d = D[id];
  if (d.mode !== 'researched') return;

  if (DISCLAIMS.test(d.text)) {
    D[id] = { id, text: null, sources: d.sources, mode: 'fallback', note: 'the text says its source was about something else' };
    disclaimed++; failed++;
    return;
  }

  if (HAND_FAILED[id]) {
    D[id] = { id, text: null, sources: d.sources, mode: 'fallback', note: 'checked by hand: ' + HAND_FAILED[id] };
    hand++; failed++;
    return;
  }

  const v = verdicts[id];
  if (!v) {
    // Never checked. Unchecked text does not go on a page.
    D[id] = { id, text: null, sources: d.sources, mode: 'fallback', note: 'not reached by the checking pass' };
    unchecked++; failed++;
    return;
  }
  if (v.verdict === 'ok') { ok++; return; }

  const why = String(v.reason || 'did not match its sources').slice(0, 180);
  reasons[why.split(/[,;.]/)[0].slice(0, 60)] = (reasons[why.split(/[,;.]/)[0].slice(0, 60)] || 0) + 1;
  D[id] = { id, text: null, sources: d.sources, mode: 'fallback', note: 'check failed: ' + why };
  failed++;
});

fs.writeFileSync(path.join(ROOT, 'data/descriptions.json'), JSON.stringify(D, null, 1));

console.log('verdict files read           ' + files);
console.log('descriptions verified ok     ' + ok);
console.log('dropped after checking       ' + failed);
console.log('  failed the check           ' + (failed - unchecked - hand - disclaimed));
console.log('  never reached by a check   ' + unchecked);
console.log('  failed my own hand check   ' + hand);
console.log('  disclaimed their own subject ' + disclaimed);
if (Object.keys(reasons).length) {
  console.log('');
  console.log('most common reasons given:');
  Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .forEach(([w, n]) => console.log('  ' + String(n).padStart(4) + '  ' + w));
}
