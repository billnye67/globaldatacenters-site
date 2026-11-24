// Applies address corrections from data/incoming/addresses.csv (name|address|source) to data/projects.json,
// resets those entries to geocode:"pending" so the next geocoder run re-places them, and marks
// jurisdiction-level entries (moratoriums, statewide bans) as kind:"jurisdiction" so they are never
// treated as a building to place. Run from the repo root: node data/fix-addresses.js
const fs = require('fs');
const path = 'data/projects.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const rows = fs.readFileSync('data/incoming/addresses.csv', 'utf8').split('\n').slice(1).filter(l => l.includes('|')).map(l => l.split('|'));
let fixed = 0, missing = [];
for (const [name, address, source] of rows) {
  const p = db.projects.find(x => norm(x.name) === norm(name));
  if (!p) { missing.push(name); continue; }
  p.address = address.trim(); p.geocode = 'pending'; p.lat = null; p.lng = null;
  if (source && !p.sources.includes(source.trim())) p.sources.push(source.trim());
  fixed++;
}
let juris = 0;
for (const p of db.projects) {
  if (p.status === 'moratorium' || /moratorium|statewide|grid connection/i.test(p.name)) { p.kind = 'jurisdiction'; if (p.geocode !== 'jurisdiction') { p.geocode = 'jurisdiction'; } juris++; }
  else if (!p.kind) p.kind = 'site';
}
fs.writeFileSync(path, JSON.stringify(db, null, 1));
console.log(`Addresses fixed: ${fixed}. Jurisdiction entries (no building to place): ${juris}.`);
if (missing.length) console.log('Not found in file:', missing.join('; '));
