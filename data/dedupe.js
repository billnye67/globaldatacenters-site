// Folds city-only duplicates into their addressed twin: same company, same country, same town,
// one entry has only "City, Region, Country" and the other has a street address. Keeps the addressed
// one, moves the other's sources/notes/images onto it. Run from the repo root: node data/dedupe.js
const fs = require('fs');
const path = 'data/projects.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const STOP = new Set('data center centre centers campus campuses inc llc ltd group holdings the of and'.split(' '));
const company = p => norm(p.developer).split(' ').filter(w => !STOP.has(w)).slice(0, 2).join(' ');
const parts = a => (a || '').split(',').map(x => norm(x).replace(/\s+\d{4,6}$/, '').trim()).filter(Boolean);
const hasStreet = a => { const f = parts(a)[0] || ''; return /\d/.test(f) || /\b(rd|road|st|street|ave|avenue|dr|drive|blvd|pkwy|parkway|ln|lane|hwy|highway|way|ct|court|pl|route|rte|park|estate|precinct)\b/.test(f); };
const town = p => { const ps = parts(p.address); return hasStreet(p.address) ? (ps[1] || '') : (ps[0] || ''); };
let folded = 0;
const keep = [];
const byKey = new Map();
for (const p of db.projects) {
  if (p.kind === 'jurisdiction') { keep.push(p); continue; }
  const k = company(p) + '|' + norm(p.country) + '|' + town(p);
  if (!byKey.has(k)) byKey.set(k, []);
  byKey.get(k).push(p);
}
for (const [k, list] of byKey) {
  if (list.length === 1 || !k.split('|')[2]) { keep.push(...list); continue; }
  const addressed = list.filter(p => hasStreet(p.address));
  const cityOnly = list.filter(p => !hasStreet(p.address));
  if (!addressed.length || !cityOnly.length) { keep.push(...list); continue; }
  // only fold when there is exactly one addressed twin, or all city-only names match one addressed name loosely
  const target = addressed.length === 1 ? addressed[0] : null;
  if (!target) { keep.push(...list); continue; }
  for (const c of cityOnly) {
    for (const s of (c.sources || [])) if (!target.sources.includes(s)) target.sources.push(s);
    if (!target.image && c.image) { target.image = c.image; target.image_credit = c.image_credit; target.image_source_url = c.image_source_url; }
    if (!target.note && c.note) target.note = c.note;
    if (!target.power_mw && c.power_mw) target.power_mw = c.power_mw;
    if (!target.aliases) target.aliases = [];
    if (!target.aliases.includes(c.name)) target.aliases.push(c.name);
    folded++;
  }
  keep.push(...addressed);
}
db.projects = keep;
fs.writeFileSync(path, JSON.stringify(db, null, 1));
console.log(`Folded ${folded} city-only duplicates into their addressed twins. Total now ${db.projects.length}.`);
