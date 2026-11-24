// Google geocoder for data/projects.json. Run from the repo root: node data/geocode-google.js
// Reads the key from data/.env (GOOGLE_MAPS_KEY=...). Only touches entries that are unplaced,
// town-level, or source-provided; leaves exact address hits alone. Google's own precision flag decides:
//   ROOFTOP            -> "address (google)"          exact, on the parcel
//   RANGE_INTERPOLATED -> "address-approx (google)"   right road, estimated number; check on satellite
//   GEOMETRIC_CENTER   -> "address-approx (google)"   center of a named place/parcel; check on satellite
//   APPROXIMATE        -> left as town-level; place by hand
const fs = require('fs');
const path = 'data/projects.json';
const env = Object.fromEntries(fs.readFileSync('data/.env', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')));
const KEY = env.GOOGLE_MAPS_KEY;
if (!KEY) { console.error('No GOOGLE_MAPS_KEY in data/.env'); process.exit(1); }
const db = JSON.parse(fs.readFileSync(path, 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function geocode(address) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address) + '&key=' + KEY;
  const j = await (await fetch(url)).json();
  if (j.status !== 'OK') return { status: j.status };
  const r = j.results[0];
  return { status: 'OK', lat: r.geometry.location.lat, lng: r.geometry.location.lng, type: r.geometry.location_type, formatted: r.formatted_address };
}

(async () => {
  const todo = db.projects.filter(p => p.kind !== 'jurisdiction' && /^(pending|unplaced|town|source-provided|miss)/.test(p.geocode || ''));
  let exact = 0, approx = 0, still = 0;
  for (const p of todo) {
    const q = p.address.includes(p.country) ? p.address : p.address + ', ' + p.country;
    let r; try { r = await geocode(q); } catch (e) { r = { status: 'ERROR' }; }
    await sleep(60);
    if (r.status !== 'OK' || r.type === 'APPROXIMATE') {
      still++; const was = /^town-level/.test(p.geocode); if (!/^unplaced/.test(p.geocode)) p.geocode = 'town-level (no street address yet)'; if (!was) console.log('STILL', p.name, '(' + (r.status === 'OK' ? 'only approximate' : r.status) + ')');
      continue;
    }
    p.lat = +r.lat.toFixed(6); p.lng = +r.lng.toFixed(6);
    if (r.type === 'ROOFTOP') { p.geocode = 'address (google) | ' + r.formatted; exact++; console.log('EXACT ', p.name); }
    else { p.geocode = 'address-approx (google) | ' + r.formatted; approx++; console.log('APPROX', p.name, '-', r.type); }
    fs.writeFileSync(path, JSON.stringify(db, null, 1));
  }
  const counts = { exact: db.projects.filter(p => /^address \(/.test(p.geocode) || /^address \|/.test(p.geocode)).length,
                   approx: db.projects.filter(p => /^address-approx/.test(p.geocode)).length,
                   town: db.projects.filter(p => p.kind !== 'jurisdiction' && /^(town|source-provided|pending)/.test(p.geocode)).length,
                   unplaced: db.projects.filter(p => /^unplaced/.test(p.geocode)).length };
  console.log(`\nDone. This run: ${exact} exact, ${approx} approximate, ${still} without a street address (only newly-checked ones listed above).`);
  console.log(`File now: ${counts.exact} exact, ${counts.approx} approximate (check on satellite), ${counts.town} town-level, ${counts.unplaced} unplaced.`);
})();
