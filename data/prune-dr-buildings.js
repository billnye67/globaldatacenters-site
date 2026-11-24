// One-off: removes building-level Digital Realty family rows that came in from a stray
// data/incoming/digitalrealty-buildings.csv. Keeps every row named in data/incoming/digitalrealty.csv
// and anything from the Epoch seed. Run from the repo root: node data/prune-dr-buildings.js
const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/projects.json', 'utf8'));
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const csv = fs.readFileSync('data/incoming/digitalrealty.csv', 'utf8').split('\n').slice(1).filter(Boolean);
const keepNames = new Set(csv.map(l => norm(l.split(';')[0])));
const family = /digital realty|mc digital|ascenty|teraco|digital docklands|digital jurong|interxion/i;
const before = db.projects.length;
db.projects = db.projects.filter(p => {
  if (!family.test(p.developer || '') && !family.test(p.name || '')) return true;
  if (keepNames.has(norm(p.name))) return true;
  if ((p.aliases || []).some(a => keepNames.has(norm(a)))) return true;
  if ((p.sources || []).some(s => /epoch/i.test(s))) return true;
  return false;
});
fs.writeFileSync('data/projects.json', JSON.stringify(db, null, 1));
console.log(`Removed ${before - db.projects.length} building-level rows. Total now ${db.projects.length}.`);
