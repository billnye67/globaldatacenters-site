#!/usr/bin/env node
/* Reverse geocodes every non United States project to its real first level region.
 *
 *   node tools/fetch-regions.js            # fills the gaps in data/geo-regions.json
 *   node tools/fetch-regions.js --all      # refetches everything, ignoring the cache
 *
 * Outside the United States the build had no shapes to test a point against, so it took the
 * region off the end of the address. That produced Victoria and VIC as two different places,
 * Quebec and QC, England and UK, and no region at all for 392 of 750 projects, because the
 * parser threw away any part holding a digit and every German or Japanese address has a
 * postcode in it.
 *
 * Google's administrative_area_level_1 is one canonical name per real region, in English, from
 * the coordinate rather than from the text, so it fixes both faults at once. A city state has no
 * level 1 at all, which is correct and is recorded here as the country's own name.
 *
 * Results are cached by rounded coordinate in data/geo-regions.json. The key is read from
 * data/.env, the same one data/geocode-google.js uses.
 */
'use strict';
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(ROOT, 'data/geo-regions.json');
const ALL = process.argv.includes('--all');

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, 'data/.env'), 'utf8')
    .split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')));
const KEY = env.GOOGLE_MAPS_KEY;
if (!KEY) { console.error('No GOOGLE_MAPS_KEY in data/.env'); process.exit(1); }

let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch (e) { cache = {}; }

const key = (lat, lng) => Number(lat).toFixed(4) + ',' + Number(lng).toFixed(4);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function lookup(lat, lng) {
  const u = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng
    + '&result_type=administrative_area_level_1&language=en&key=' + KEY;
  const j = await (await fetch(u)).json();
  if (j.status === 'ZERO_RESULTS') return { region: '', level: 'none' };   // a city state
  if (j.status !== 'OK') return { error: j.status };
  const r = j.results[0];
  const c = r.address_components.find(x => x.types.includes('administrative_area_level_1'));
  const country = r.address_components.find(x => x.types.includes('country'));
  return { region: c ? c.long_name : '', country: country ? country.long_name : '', level: 'admin1' };
}

(async () => {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8')).projects;
  const todo = [];
  db.forEach(p => {
    if (p.kind === 'jurisdiction') return;
    if (p.country === 'United States') return;          // states come off the county shapes
    const lat = p.lat != null ? p.lat : p.town_lat;
    const lng = p.lng != null ? p.lng : p.town_lng;
    if (lat == null || lng == null) return;
    const k = key(lat, lng);
    if (!ALL && cache[k]) return;
    if (todo.some(t => t.k === k)) return;
    todo.push({ k, lat, lng, id: p.id, country: p.country });
  });

  console.log('non United States points needing a region: ' + todo.length
    + (todo.length ? '' : '  (cache already complete)'));

  let ok = 0, city = 0, failed = 0;
  for (let i = 0; i < todo.length; i++) {
    const t = todo[i];
    let r; try { r = await lookup(t.lat, t.lng); } catch (e) { r = { error: 'FETCH' }; }
    if (r.error) { failed++; console.log('  ' + r.error + ' at ' + t.k + ' (' + t.country + ')'); }
    else {
      // A city state reports no level 1. Its own name is the honest region for it.
      if (!r.region) { r.region = t.country; r.level = 'city-state'; city++; } else ok++;
      cache[t.k] = { region: r.region, level: r.level };
    }
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0));
      console.log('  ' + (i + 1) + '/' + todo.length);
    }
    await sleep(60);
  }

  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0));
  console.log('regions resolved ' + ok + ', city states ' + city + ', failed ' + failed
    + ', cache now holds ' + Object.keys(cache).length + ' points');
})();
