// Builds the background pack a reporter needs for a project: where its power comes from, who
// runs the grid, how crowded its county already is, and whether anyone has paused building
// there. Written to a file per batch so the reporting has facts to lean on that are ours.
//
//   node data/build-context.js <output.json> [id ...]
//
// With no ids it does every project that has a page.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUT = process.argv[2];
if (!OUT) { console.error('usage: node data/build-context.js <output.json> [id ...]'); process.exit(1); }
const WANT = process.argv.slice(3);

const DB = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8')).projects;
const IDX = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/project-pages.json'), 'utf8'));
const WINS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/wins.json'), 'utf8'));
const CACHE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/geo-cache.json'), 'utf8'));

let PLANTS = [], CONTROL = [];
try { PLANTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/geo-power-plants.json'), 'utf8')); } catch (e) {}
try { CONTROL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/geo-control-areas.json'), 'utf8')); } catch (e) {}
if (!PLANTS.length) console.warn('No power plant layer. Run: node data/pull-fractracker-context.js');

const byId = {};
DB.forEach(p => { byId[p.id] = p; });
const winById = {};
(WINS.wins || []).forEach(w => { if (w.id) winById[w.id] = w; });

const coordsOf = p => {
  const exact = p.lat != null && p.lng != null;
  return { lat: exact ? p.lat : p.town_lat, lng: exact ? p.lng : p.town_lng, exact };
};

function km(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s1 = Math.sin(dLat / 2), s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function ringHas(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const countyOf = c => CACHE[c.lat.toFixed(5) + ',' + c.lng.toFixed(5)] || null;

// How many other tracked sites share this county, which is the difference between a first
// data center and the twentieth.
const countyCount = {};
DB.forEach(p => {
  if (p.kind === 'jurisdiction') return;
  const c = coordsOf(p);
  if (c.lat == null) return;
  const hit = countyOf(c);
  if (hit) countyCount[hit.fips] = (countyCount[hit.fips] || 0) + 1;
});

// The plant layer is US only, so for a site anywhere else the "nearest" plant is an ocean
// away and means nothing. Only report plants close enough to actually be the site's power.
const PLANT_MAX_KM = 150;
function nearestPlants(c, n) {
  return PLANTS.map(p => ({ p, d: km(c, p) }))
    .filter(x => x.d <= PLANT_MAX_KM)
    .sort((a, b) => a.d - b.d).slice(0, n)
    .map(x => ({ name: x.p.name, mw: x.p.mw, fuel: x.p.fuel, km: Math.round(x.d) }));
}

// The control area layer is drawn from federal shapefiles and gets a handful of places wrong:
// it puts Long Island in ISO New England, and it leaves a hole over Massena. A record that
// carries grid_control_area names its operator outright and that name wins over the polygons.
function named(name) {
  const a = CONTROL.find(x => x.name === name);
  return a ? { name: a.name, capacity_mw: a.cap || null, peak_load_mw: a.peak || null } : null;
}

function controlArea(c, p) {
  if (p && p.grid_control_area) {
    const hit = named(p.grid_control_area);
    if (hit) return hit;
  }
  for (const a of CONTROL) {
    if (a.rings.some(r => ringHas(r, c.lng, c.lat))) {
      return { name: a.name, capacity_mw: a.cap || null, peak_load_mw: a.peak || null };
    }
  }
  return null;
}

const today = new Date().toISOString().slice(0, 10);
function moratoriums(c, hit, p) {
  return (WINS.moratoriums || []).filter(m => {
    if (m.status !== 'In effect') return false;
    if (m.end && m.end < today) return false;
    if (m.lat != null && km(c, { lat: m.lat, lng: m.lng }) < 60) return true;
    if (m.level === 'state' && hit && m.state === hit.state) return true;
    return false;
  }).map(m => ({ name: m.name, level: m.level, type: m.type, start: m.start, end: m.end, notes: m.notes, src: m.src }));
}

const ids = WANT.length ? WANT : Object.keys(IDX);
const out = ids.map(id => {
  const p = byId[id];
  if (!p) return null;
  const c = coordsOf(p);
  if (c.lat == null) return null;
  const hit = countyOf(c);
  const w = winById[id];

  const near = DB.filter(o => o.kind !== 'jurisdiction' && o.id !== id).map(o => {
    const oc = coordsOf(o);
    if (oc.lat == null) return null;
    const d = km(c, oc);
    return d <= 40 ? { name: o.name, developer: o.developer, status: o.status, mw: o.capacity_mw, km: Math.round(d) } : null;
  }).filter(Boolean).sort((a, b) => a.km - b.km).slice(0, 10);

  return {
    id,
    page: IDX[id],
    name: p.name,
    developer: p.developer,
    tenant: p.tenant,
    program: p.program,
    address: p.address,
    country: p.country,
    county: hit ? hit.county : null,
    state: hit ? hit.state : null,
    status: p.status,
    capacity_mw: p.capacity_mw,
    capacity_note: p.capacity_note,
    year_announced: p.year_announced,
    year_operating_or_planned: p.year_operating_or_planned,
    note: p.note,
    aliases: p.aliases || null,
    exact_location: c.exact,
    coords: { lat: c.lat, lng: c.lng },
    blocked: p.blocked || null,
    win: w ? { how: w.how, type: w.type, date: w.date, size: w.size, inv: w.inv, detail: w.detail, acres: w.acres, src: w.src } : null,
    fractracker: p.fractracker || null,
    sources: (p.sources || []).filter(x => /^https?:/.test(x)),
    source_notes: (p.sources || []).filter(x => !/^https?:/.test(x)),
    dataset: p.dataset,
    context: (() => {
      const plants = nearestPlants(c, 4);
      const ctx = {
        data_centers_in_county: hit ? (countyCount[hit.fips] || 1) : null,
        grid_control_area: controlArea(c, p),
        moratoriums_nearby: moratoriums(c, hit, p),
        other_projects_within_40km: near
      };
      // Leave the key out entirely rather than offer a far away plant as if it were nearby.
      if (plants.length) ctx.nearest_power_plants = plants;
      return ctx;
    })()
  };
}).filter(Boolean);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('wrote ' + out.length + ' context packs to ' + OUT);
