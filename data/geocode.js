// Geocoder for data/projects.json. Run from the repo root: node data/geocode.js
// Uses OpenStreetMap Nominatim (free, 1 request/sec). Fills lat/lng for entries marked
// geocode:"pending", and re-checks any earlier "area" matches. It never accepts a result
// coarser than a town: state/county/country-level hits are rejected and the entry is
// marked "unplaced" so it stays off the globe until it is placed by hand on satellite imagery.
const fs = require('fs');
const path = 'data/projects.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'globaldatacenters.net project tracker (contact: james@floridadatacenters.org)';
const TOO_COARSE = new Set(['country', 'state', 'region', 'province', 'county', 'state_district', 'district', 'continent']);

async function lookup(q) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(q);
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  return j[0] || null;
}
const fine = hit => hit && !TOO_COARSE.has(hit.addresstype || hit.type);

(async () => {
  const unplaced = [];
  for (const p of db.projects) {
    if (p.kind === 'jurisdiction') continue;
    const redo = p.geocode === 'pending' || /^area/.test(p.geocode || '') || /^miss/.test(p.geocode || '') || /^unplaced/.test(p.geocode || '');
    if (!redo) continue;
    const parts = p.address.split(',').map(s => s.trim()).filter(Boolean);
    // try full address, then drop leading parts, but never below "town, region, country"
    const tries = [];
    for (let i = 0; i < parts.length - 2; i++) tries.push(parts.slice(i).join(', '));
    if (parts.length <= 3) tries.push(parts.join(', '));
    let hit = null, used = null;
    for (const t of tries) {
      try { hit = await lookup(t + (t.includes(p.country) ? '' : ', ' + p.country)); } catch (e) { hit = null; }
      await sleep(1100);
      if (fine(hit)) { used = t; break; }
      hit = null;
    }
    if (hit) {
      p.lat = +(+hit.lat).toFixed(5); p.lng = +(+hit.lon).toFixed(5);
      const level = used === p.address ? 'address' : 'town';
      p.geocode = level + ' | ' + hit.display_name;
      console.log('OK  ', p.name, '->', p.lat, p.lng, level === 'town' ? '(town-level, place exactly)' : '');
    } else {
      p.lat = null; p.lng = null; p.geocode = 'unplaced';
      unplaced.push(p.name + ' | ' + p.address);
      console.log('UNPLACED', p.name);
    }
    fs.writeFileSync(path, JSON.stringify(db, null, 1));
  }
  const townLevel = db.projects.filter(p => /^town/.test(p.geocode || '') || /source-provided/.test(p.geocode || '')).length;
  console.log(`\nDone. Unplaced: ${unplaced.length}. Town-level (need exact placement): ${townLevel}. Address-level: ${db.projects.filter(p => /^address/.test(p.geocode || '')).length}.`);
  unplaced.forEach(m => console.log('  ' + m));
})();
