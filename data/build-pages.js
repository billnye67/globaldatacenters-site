// Builds every generated SEO page from data/projects.json, data/globe.json and data/wins.json.
// Run from the repo root, after the globe is rebuilt:
//   node data/build-globe.js && node data/build-pages.js
//
// Everything under /data-centers, /project and /company is deleted and rewritten on every run.
// Nothing here is hand written: if a fact is not in the data it does not appear on the page.
// Page chrome (fonts, colours, header, footer, nav) is lifted out of wins.html at build time,
// so the generated pages follow that file whenever it changes.
//
// County and state names for United States sites come from a point in polygon test against the
// Census county shapes shipped with the us-atlas package. Results are cached in
// data/geo-cache.json so a later build works even when node_modules is gone.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://globaldatacenters.net';
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- small helpers

const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function slug(s) {
  return String(s == null ? '' : s)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fdate(d) {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d || '');
  if (!m) return d || '';
  return m[3] ? MON[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1] : m[2] ? MON[+m[2] - 1] + ' ' + m[1] : m[1];
}

const num = n => Number(n).toLocaleString('en-US');
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));

function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }

// On Windows a folder that another process has open (a shell sitting in it, a file viewer) cannot
// itself be removed, though everything inside it can. Empty it instead, so the build still starts clean.
function rmrf(p) {
  try { fs.rmSync(p, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
  catch (e) {
    if (e.code !== 'EPERM' && e.code !== 'EBUSY') throw e;
    fs.readdirSync(p).forEach(f => {
      try { fs.rmSync(path.join(p, f), { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
      catch (e2) { if (e2.code !== 'EPERM' && e2.code !== 'EBUSY') throw e2; console.log('  (in use, overwritten in place: ' + path.join(p, f) + ')'); }
    });
  }
}

let written = 0;
// Place pages are kept in memory as they are written, so the self-contradiction gate at the end
// of the build can read the finished page rather than the prose that went into it. That gap is
// exactly what let Travis County ship arguing with its own headline.
const PAGE_HTML_FOR_GATE = {};

function write(relPath, html) {
  const full = path.join(ROOT, relPath);
  mkdirp(path.dirname(full));
  fs.writeFileSync(full, html);
  if (relPath.endsWith('index.html')
      && /^(data-centers|company|project)[\\/]/.test(relPath)) {
    PAGE_HTML_FOR_GATE[relPath.replace(/\\/g, '/')] = html;
  }
  written++;
}

// Page text rules: plain language, no em dashes anywhere in generated copy.
function clean(t) {
  return String(t == null ? '' : t).replace(/—/g, ', ').replace(/\s+,/g, ',').replace(/\s{2,}/g, ' ').trim();
}

// A search result line, not page copy. Google shows about 155 characters, so a 300-character
// description is cut mid-word in the one place a reader decides whether to click. Prefer ending on
// a sentence; failing that, on a word.
function snippet(t, limit) {
  limit = limit || 158;
  t = String(t || '').trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (stop > limit * 0.55) return cut.slice(0, stop + 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > 0 ? cut.slice(0, sp) : cut).replace(/[,;:\s]+$/, '') + '…';
}

// Sentence that ends in exactly one full stop.
function sentence(t) {
  const s = clean(t);
  if (!s) return '';
  return /[.!?]$/.test(s) ? s : s + '.';
}

// ---------------------------------------------------------------- load the data

const DB = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8'));
const GLOBE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/globe.json'), 'utf8'));
const WINS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/wins.json'), 'utf8'));

const GLOBE_BY_ID = {};
(GLOBE.sites || []).forEach(s => { GLOBE_BY_ID[s.id] = s; });

// Sites only. Jurisdiction rows describe a place, not a building, and the globe drops them too.
// A record with no_page (its reason) was found not to be a data center, or not an identifiable
// one, or a duplicate awaiting a merge: it stays in the data for review but is never published.
const SITES = DB.projects.filter(p => p.kind !== 'jurisdiction' && !p.no_page);

// ---------------------------------------------------------------- geography

// Counties whose FIPS ends in 500 or above are independent cities (Virginia's 38, plus
// Baltimore, St. Louis and Carson City). They are not counties and are not labelled as one.
const PARISH_STATES = { Louisiana: 'Parish' };
const NO_SUFFIX_STATES = { Alaska: true, 'District of Columbia': true, 'Puerto Rico': true, Guam: true, 'American Samoa': true, 'United States Virgin Islands': true, 'Commonwealth of the Northern Mariana Islands': true };

// A county code of 500 or more means an independent city, but only in the four states that
// have one. Texas simply runs that high: Yoakum, Young, Zapata and Zavala are 48501 to 48507
// and are ordinary counties, and the old rule was dropping "County" from all four.
const INDEPENDENT_CITY_STATES = { '24': 1, '29': 1, '32': 1, '51': 1 };   // MD, MO, NV, VA

function countyLabel(name, state, fips) {
  const st = String(fips || '').slice(0, 2);
  if (fips && INDEPENDENT_CITY_STATES[st] && +String(fips).slice(2) >= 500) return name;
  if (PARISH_STATES[state]) return name + ' ' + PARISH_STATES[state];
  if (NO_SUFFIX_STATES[state]) return name;
  return name + ' County';
}

// --- point in polygon over GeoJSON rings -------------------------------------

function ringHas(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function polyHas(coords, x, y) {                 // one Polygon: outer ring minus holes
  if (!ringHas(coords[0], x, y)) return false;
  for (let i = 1; i < coords.length; i++) if (ringHas(coords[i], x, y)) return false;
  return true;
}

function geomHas(geom, x, y) {
  if (!geom) return false;
  if (geom.type === 'Polygon') return polyHas(geom.coordinates, x, y);
  if (geom.type === 'MultiPolygon') return geom.coordinates.some(c => polyHas(c, x, y));
  return false;
}

// Do two bounding boxes overlap, with a little slack so neighbours across a river count.
function touches(a, b, pad) {
  const p = pad == null ? 0.25 : pad;
  return !(a[2] + p < b[0] || a[0] - p > b[2] || a[3] + p < b[1] || a[1] - p > b[3]);
}

function bboxOf(geom) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const walk = a => {
    if (typeof a[0] === 'number') {
      if (a[0] < x0) x0 = a[0]; if (a[0] > x1) x1 = a[0];
      if (a[1] < y0) y0 = a[1]; if (a[1] > y1) y1 = a[1];
    } else a.forEach(walk);
  };
  if (geom) walk(geom.coordinates);
  return [x0, y0, x1, y1];
}

// --- boundary shapes ----------------------------------------------------------

const CACHE_FILE = path.join(ROOT, 'data/geo-cache.json');
let geoCache = {};
try { geoCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (e) { geoCache = {}; }

let COUNTIES = null, STATES = null, COUNTRIES = null, shapesLoaded = false;
try {
  const topo = require('topojson-client');
  const usTopo = require('us-atlas/counties-10m.json');
  const stateName = {};
  const stateFeatures = topo.feature(usTopo, usTopo.objects.states).features;
  stateFeatures.forEach(f => { stateName[String(f.id)] = f.properties.name; });

  COUNTIES = topo.feature(usTopo, usTopo.objects.counties).features.map(f => {
    const fips = String(f.id).padStart(5, '0');
    const state = stateName[fips.slice(0, 2)] || '';
    return { fips, name: f.properties.name, state, geom: f.geometry, bbox: bboxOf(f.geometry) };
  });
  STATES = stateFeatures.map(f => ({ fips: String(f.id).padStart(2, '0'), name: f.properties.name, geom: f.geometry, bbox: bboxOf(f.geometry) }));

  const worldTopo = require('world-atlas/countries-50m.json');
  COUNTRIES = topo.feature(worldTopo, worldTopo.objects.countries).features.map(f => ({
    name: f.properties.name, geom: f.geometry, bbox: bboxOf(f.geometry)
  }));
  shapesLoaded = true;
} catch (e) {
  console.warn('Boundary shapes not installed (npm i -D us-atlas world-atlas topojson-client).');
  console.warn('Falling back to data/geo-cache.json. Maps will be drawn without outlines.');
}

// Names the atlas uses that differ from the names in projects.json.
const COUNTRY_SHAPE_ALIAS = { 'United States': 'United States of America' };

const countryShapeCache = {};
function countryShape(name) {
  if (!COUNTRIES) return null;
  if (name in countryShapeCache) return countryShapeCache[name];
  const want = COUNTRY_SHAPE_ALIAS[name] || name;
  let f = COUNTRIES.find(c => c.name === want) || COUNTRIES.find(c => c.name === name);
  if (!f) f = COUNTRIES.find(c => c.name && c.name.toLowerCase() === String(want).toLowerCase());
  countryShapeCache[name] = f ? { geom: f.geom, bbox: f.bbox, name: f.name } : null;
  return f || null;
}

const stateShapeCache = {};
function stateShape(name) {
  if (!STATES) return null;
  if (!(name in stateShapeCache)) stateShapeCache[name] = STATES.find(s => s.name === name) || null;
  return stateShapeCache[name];
}

// Every county in a state, by the first two digits of its FIPS code.
const countiesInStateCache = {};
function countiesInState(stateName) {
  if (!COUNTIES) return [];
  if (!(stateName in countiesInStateCache)) {
    countiesInStateCache[stateName] = COUNTIES.filter(c => c.state === stateName);
  }
  return countiesInStateCache[stateName];
}

const countyShapeCache = {};
function countyShape(fips) {
  if (!COUNTIES || !fips) return null;
  if (!(fips in countyShapeCache)) countyShapeCache[fips] = COUNTIES.find(c => c.fips === fips) || null;
  return countyShapeCache[fips];
}

// Which United States county contains this point. Cached by rounded coordinate.
let cacheHits = 0, cacheMisses = 0, cacheAdds = 0;
function usCounty(lat, lng) {
  const key = lat.toFixed(5) + ',' + lng.toFixed(5);
  if (key in geoCache) { cacheHits++; return geoCache[key]; }
  if (!COUNTIES) { cacheMisses++; return null; }
  let hit = null;
  for (const c of COUNTIES) {
    if (lng < c.bbox[0] || lng > c.bbox[2] || lat < c.bbox[1] || lat > c.bbox[3]) continue;
    if (geomHas(c.geom, lng, lat)) { hit = { fips: c.fips, county: c.name, state: c.state }; break; }
  }
  // County shapes stop at the waterline, so a site on a lake or sea shore can land just
  // outside every polygon. Snap it to the nearest county edge, but only when it is close.
  if (!hit) {
    let best = null, bestD = 0.15;
    for (const c of COUNTIES) {
      if (lng < c.bbox[0] - 0.2 || lng > c.bbox[2] + 0.2 || lat < c.bbox[1] - 0.2 || lat > c.bbox[3] + 0.2) continue;
      const walk = a => {
        if (typeof a[0] === "number") {
          const d = Math.hypot(a[0] - lng, a[1] - lat);
          if (d < bestD) { bestD = d; best = c; }
        } else a.forEach(walk);
      };
      if (c.geom) walk(c.geom.coordinates);
    }
    if (best) hit = { fips: best.fips, county: best.name, state: best.state, snapped: true };
  }
  geoCache[key] = hit;
  cacheAdds++;
  return hit;
}

// Some rows carry a postal fragment in the country field. The coordinates are sound, so the
// country is read off the world shapes rather than guessed from the string.
const countryFixes = [];
function resolveCountry(p, lat, lng) {
  const given = (p.country || '').trim();
  if (!given) return null;
  if (given === 'United States' || !COUNTRIES) return given || null;
  if (COUNTRIES.some(c => c.name === (COUNTRY_SHAPE_ALIAS[given] || given))) return given;
  for (const c of COUNTRIES) {
    if (lng < c.bbox[0] || lng > c.bbox[2] || lat < c.bbox[1] || lat > c.bbox[3]) continue;
    if (geomHas(c.geom, lng, lat)) {
      countryFixes.push(given + ' -> ' + c.name + ' (' + p.id + ')');
      return c.name === 'United States of America' ? 'United States' : c.name;
    }
  }
  return given;
}

const US_ABBR = /^[A-Z]{2}(?:[\s,]+\d{5}(?:-\d{4})?)?$/;
const STREETY = /^\d|\b(rd|road|st|street|ave|avenue|hwy|highway|blvd|drive|dr|lane|ln|way|pkwy|parkway|route|crescent|walk|boulevard)\b/i;

function addressParts(addr, country) {
  let parts = String(addr || '').split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length && country && parts[parts.length - 1].toLowerCase() === String(country).toLowerCase()) parts.pop();
  return parts;
}

// The town a site sits in, taken straight from its address. Empty when the address has none.
//
// A postcode stuck to the end of the town is the common case outside the United States, and it
// used to come through whole: Singapore turned into "Singapore 139964", "Singapore 627753" and
// twenty other one-off "towns", and Maine produced "ME 4240" off a route number. So the tail is
// stripped first, and anything still holding a digit, or repeating the country or the region, is
// not a town.
function townOf(addr, country, stateName) {
  const parts = addressParts(addr, country);
  while (parts.length) {
    const last = parts[parts.length - 1];
    if (US_ABBR.test(last) || (stateName && last.toLowerCase() === String(stateName).toLowerCase())) parts.pop();
    else break;
  }
  let t = parts[parts.length - 1];
  if (!t) return '';
  t = String(t)
    .replace(/\s+\d{4,6}$/, '')                                   // "Singapore 139964"
    .replace(/\s+[A-Z]{1,2}\d[\dA-Z]?\s*\d[A-Z]{2}$/i, '')        // "Blyth NE22 7FJ"
    .replace(/^[A-Z]{2}\s+\d+$/, '')                              // "ME 4240", a route not a town
    .trim();
  if (!t || STREETY.test(t) || /\d/.test(t)) return '';
  if (/^[A-Z]{2}$/.test(t)) return '';                            // what is left of "ME 4240" 
  if (t.toLowerCase() === String(country || '').toLowerCase()) return '';
  if (stateName && t.toLowerCase() === String(stateName).toLowerCase()) return '';
  return t;
}

// Outside the United States the region now comes from the coordinate, not the text.
// data/geo-regions.json holds Google's administrative_area_level_1 for every non US point,
// fetched by tools/fetch-regions.js. That is one canonical name per real region: Victoria
// rather than Victoria and VIC, Quebec rather than Quebec and QC, England rather than England
// and UK, and a name at all for the 392 projects whose address carried only a postcode.
let REGION_BY_POINT = {};
try { REGION_BY_POINT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/geo-regions.json'), 'utf8')); }
catch (e) { REGION_BY_POINT = {}; }
const regionKey = (lat, lng) => Number(lat).toFixed(4) + ',' + Number(lng).toFixed(4);

// Kept as the fallback for a point the lookup has never seen. Anything holding a digit is a
// street or a postcode, so the postcode is stripped off the front before the part is judged.
function regionFromAddress(addr, country) {
  const parts = addressParts(addr, country);
  if (!parts.length) return '';
  let cand = parts[parts.length - 1];
  // "63128 Dietzenbach" and "Blyth NE22 7FJ" are a town with a postcode stuck to it
  cand = String(cand || '').replace(/^\s*[0-9][0-9A-Z-]*\s+/i, '').replace(/\s+[A-Z]{1,2}\d[\dA-Z]?\s*\d?[A-Z]{0,2}\s*$/i, '').trim();
  if (!cand || /\d/.test(cand) || cand.length < 2 || STREETY.test(cand)) return '';
  // A city state is its own region, so region matching country is right there and wrong
  // everywhere else.
  if (String(cand).toLowerCase() === String(country).toLowerCase()) {
    return CITY_STATES[country] ? country : '';
  }
  return cand;
}

// Places with no first level region of their own. Google returns nothing for these, which is
// correct, and the country's own name is the honest answer.
const CITY_STATES = {
  'Singapore': 1, 'Hong Kong': 1, 'Macau': 1, 'Monaco': 1, 'Gibraltar': 1,
  'Vatican City': 1, 'San Marino': 1, 'Liechtenstein': 1, 'Andorra': 1, 'Bahrain': 1
};

function regionOf(p, country, lat, lng) {
  // A city state has no region below itself. Google sometimes answers with the country name
  // and a postcode stuck to it ("Singapore 139964"), which would split one place into four.
  if (CITY_STATES[country]) return country;
  const hit = REGION_BY_POINT[regionKey(lat, lng)];
  if (hit && hit.region) return String(hit.region).replace(/\s+\d[\d\s-]*$/, '').trim();
  return regionFromAddress(p.address, country);
}

// ---------------------------------------------------------------- classification

const ACREAGE = /acres|hectares|sqm|sq ?ft/i;

const STATUS_BUCKET = {
  'operating': 'operating', 'operating (expanding)': 'operating',
  'under construction': 'live', 'proposed': 'live', 'proposed (early)': 'live', 'approved': 'live',
  'blocked': 'stopped', 'cancelled': 'stopped', 'withdrawn': 'stopped', 'suspended': 'stopped',
  'on hold': 'stopped', 'paused': 'stopped', 'moratorium': 'stopped'
};

const STATUS_LABEL = {
  'operating': 'Operating', 'operating (expanding)': 'Operating, expanding',
  'under construction': 'Under construction', 'proposed': 'Proposed',
  'proposed (early)': 'Proposed, early stage', 'approved': 'Approved',
  'blocked': 'Blocked', 'cancelled': 'Cancelled', 'withdrawn': 'Withdrawn',
  'suspended': 'Suspended', 'on hold': 'On hold', 'paused': 'Paused', 'moratorium': 'Under a moratorium'
};

function statusKey(p) {
  const s = String(p.status || '').trim().toLowerCase();
  if (!s || s === 'unknown' || ACREAGE.test(s)) return '';
  return STATUS_BUCKET[s] ? s : '';
}

const statusLabel = p => STATUS_LABEL[statusKey(p)] || 'Not reported';
const statusBucket = p => STATUS_BUCKET[statusKey(p)] || 'unknown';

// Articles that say they were written or converted with AI (tools/scan-ai-labels.py). Never listed as a source.
let AI_LABELLED = new Set();
try { AI_LABELLED = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ai-labelled-sources.json'), 'utf8'))); } catch (e) { AI_LABELLED = new Set(); }

function sourceLinks(p) {
  const out = [];
  (p.sources || []).forEach(s => { if (/^https?:\/\//.test(s) && !AI_LABELLED.has(s)) out.push(s); });
  // Trackers and directories are where a record came from, not a source a reader should be sent to.
  if (p.dataset_url && /^https?:\/\//.test(p.dataset_url) && out.indexOf(p.dataset_url) < 0
    && !/fractracker|datacentermap|baxtel|datacenters\.com|cloudscene|epoch\.ai\/data/i.test(p.dataset_url)) out.push(p.dataset_url);
  return [...new Set(out)];
}

// Notes on a source row that are prose rather than a link. Shown as written, never rewritten.
const sourceNotes = p => (p.sources || []).filter(s => !/^https?:\/\//.test(s) && String(s).trim());

// Same colocation test the globe uses, so the two stay in step.
function isColo(p) {
  const blob = [p.tenant, p.note, p.name].join(' ');
  return /\bsmall\b|IBX|carrier hotel|edge (site|node|market)|zColo/i.test(blob)
    || (/colocation/i.test(p.tenant || '') && !/hyperscale|AI|campus/i.test(blob))
    || (p.capacity_mw != null && p.capacity_mw < 10);
}

const isSmall = p => (p.capacity_mw != null && p.capacity_mw < 10) || p.size_class === 'small' || isColo(p);

// The thin page rule. A site earns its own page only with a source link, a status we can name,
// and enough size that the page is worth reading. Everything else still shows on its county list.
// keep_page: the record's stage is honestly unknown but it has a researched report (set by the
// coordinator, logged in data/projects-run/applied.md), so the page stays with "Not reported".
function qualifies(p) {
  return sourceLinks(p).length > 0 && (statusKey(p) !== '' || p.keep_page === true) && !isSmall(p);
}

// ---------------------------------------------------------------- build the index

const unplaced = [];

const RECORDS = SITES.map(p => {
  const exact = p.lat != null && p.lng != null;
  const lat = exact ? p.lat : p.town_lat;
  const lng = exact ? p.lng : p.town_lng;
  if (lat == null || lng == null) { unplaced.push(p.id); return null; }

  const country = resolveCountry(p, lat, lng);
  if (!country) { unplaced.push(p.id); return null; }

  let region = '', county = '', countyFips = '';
  if (country === 'United States') {
    const hit = usCounty(lat, lng);
    if (hit) { region = hit.state; county = countyLabel(hit.county, hit.state, hit.fips); countyFips = hit.fips; }
    else region = regionFromAddress(p.address, country);
  } else {
    region = regionOf(p, country, lat, lng);
  }

  const town = townOf(p.address, country, region);
  const g = GLOBE_BY_ID[p.id] || null;

  return {
    p, id: p.id, name: p.name, dev: p.developer || '', lat, lng, exact,
    country, region, county, countyFips, town,
    mw: p.capacity_mw, bucket: statusBucket(p), status: statusLabel(p),
    blocked: p.blocked || null, globe: g,
    slug: slug([p.name, town, region].filter(Boolean).join(' ')),
    page: null
  };
}).filter(Boolean);

// Project page slugs are name plus town plus state. Where two sites still collide the id is
// appended so every page keeps its own address.
const slugCount = {};
RECORDS.filter(qualifies).forEach(r => { slugCount[r.slug] = (slugCount[r.slug] || 0) + 1; });
const slugSeen = {};
RECORDS.forEach(r => {
  if (!qualifies(r.p)) return;
  let s = r.slug || slug(r.id);
  if (slugCount[s] > 1) {
    slugSeen[s] = (slugSeen[s] || 0) + 1;
    s = s + '-' + slug(r.id).slice(-12);
    if (slugSeen[s]) s = s + '-' + slugSeen[s];
  }
  r.slug = s;
  r.page = '/project/' + s + '/';
});

const RECORD_BY_ID = {};
RECORDS.forEach(r => { RECORD_BY_ID[r.id] = r; });

// Companies with three or more sites get their own page. Worked out here, before anything
// is rendered, so a project page can link to its company and the crawl has no dead ends.
const NOT_A_COMPANY = /^(undisclosed|unknown|not reported|n\/a|tbd|various|multiple)\b/i;

// One company, one page. The developer field carries the operating brand, which is worth
// keeping in the table, but Ascenty, Teraco and MC Digital Realty are Digital Realty, ODATA is
// Aligned, and so on. Grouping is by the name on the left; the row still shows what it says.
const COMPANY_ALIAS = {
  'Aligned Data Centers': ['Aligned Data Centers (ODATA)'],
  'China Mobile': ['China Mobile International'],
  'Cloverleaf Infrastructure': ['Cloverleaf'],
  'Digital Realty': ['MC Digital Realty', 'Ascenty (Digital Realty)', 'Teraco (Digital Realty)'],
  'Eagle Rock Partners': ['Eagle Rock', 'Eagle Rock Partners LLC and Thomas & Hutton Engineering']
};
const CANON_COMPANY = {};
Object.keys(COMPANY_ALIAS).forEach(canon => {
  CANON_COMPANY[canon.toLowerCase()] = canon;
  COMPANY_ALIAS[canon].forEach(a => { CANON_COMPANY[a.toLowerCase()] = canon; });
});
const canonCompany = n => CANON_COMPANY[String(n || '').trim().toLowerCase()] || String(n || '').trim();

// Thomas & Hutton is the engineering firm on the drawings, not the company building the site,
// so it is not shown as the developer. Eagle Rock Partners is.
RECORDS.forEach(r => {
  if (/Eagle Rock Partners LLC and Thomas & Hutton Engineering/i.test(r.dev || '')) r.dev = 'Eagle Rock Partners';
  r.company = canonCompany(r.dev);
});

const COMPANY = {};
RECORDS.forEach(r => {
  const n = r.company;
  if (!n || NOT_A_COMPANY.test(n)) return;
  (COMPANY[n] = COMPANY[n] || []).push(r);
});
Object.keys(COMPANY).forEach(n => { if (COMPANY[n].length < 3) delete COMPANY[n]; });
const companyUrl = n => {
  const c = canonCompany(n);
  return (c && COMPANY[c]) ? '/company/' + slug(c) + '/' : null;
};

// --- place tree ---------------------------------------------------------------

const countrySlug = {}, regionSlug = {}, countySlug = {};
const tree = {};                                   // country -> region -> county -> [records]

function bucketInto(r) {
  const c = (tree[r.country] = tree[r.country] || { regions: {}, list: [] });
  c.list.push(r);
  if (!r.region) return;
  const rg = (c.regions[r.region] = c.regions[r.region] || { counties: {}, list: [] });
  rg.list.push(r);
  if (!r.county) return;
  const cy = (rg.counties[r.county] = rg.counties[r.county] || { list: [], fips: r.countyFips });
  cy.list.push(r);
}
RECORDS.forEach(bucketInto);

Object.keys(tree).forEach(c => {
  countrySlug[c] = slug(c);
  Object.keys(tree[c].regions).forEach(rg => {
    regionSlug[c + '|' + rg] = slug(rg);
    Object.keys(tree[c].regions[rg].counties).forEach(cy => {
      countySlug[c + '|' + rg + '|' + cy] = slug(cy);
    });
  });
});

const countryUrl = c => '/data-centers/' + countrySlug[c] + '/';
const regionUrl = (c, rg) => countryUrl(c) + regionSlug[c + '|' + rg] + '/';
const countyUrl = (c, rg, cy) => regionUrl(c, rg) + countySlug[c + '|' + rg + '|' + cy] + '/';

// US county FIPS -> that county's page, for links from maps, ban tables and wins.
const FIPS_URL = {};
Object.keys(tree).forEach(c => Object.keys(tree[c].regions).forEach(rg =>
  Object.keys(tree[c].regions[rg].counties).forEach(cy => {
    const f = tree[c].regions[rg].counties[cy].fips;
    if (f) FIPS_URL[f] = countyUrl(c, rg, cy);
  })));

// ---------------------------------------------------------------- internal links in reports
// Report paragraphs are written as plain text by the research sessions and escaped on the way
// out, so an <a> tag typed into the JSON would publish as visible markup. Links are added here
// instead. The builder already knows every company, project and place page it is about to write,
// so a name appearing in the prose can be matched against that index and linked. Doing it here
// rather than in the prose also means a research session cannot invent a link to a page that
// does not exist, and cannot link the same thing fifteen times.
// A name can belong to more than one page: Morgan County exists in Tennessee and in Indiana, and
// an early run of this linked Tennessee's page to Indiana's county. So each name maps to a LIST
// of candidate urls, and the choice is made per page against the page's own url.
const LINK_BY_TEXT = new Map();
function addLink(name, url) {
  if (!name || !url) return;
  const n = String(name).trim();
  if (n.length < 6) return;                        // too short to match without false hits
  const k = esc(n);
  if (!LINK_BY_TEXT.has(k)) LINK_BY_TEXT.set(k, []);
  const a = LINK_BY_TEXT.get(k);
  if (a.indexOf(url) < 0) a.push(url);
}

// Project names that describe any building rather than one: "Data Center", "Data Center Project".
// Linking the words "data center" to one project in Georgia is worse than not linking at all.
const GENERIC_PROJECT = /^(the\s+)?(new\s+)?data\s+cent(er|re)(\s+(project|campus|site|facility|development))?$/i;

Object.keys(COMPANY).forEach(n => addLink(n, companyUrl(n)));
// Every record carrying a name, with or without a page of its own. "Project Horizon" is both a
// Nebraska campus and a Texas one, and "Oppidan Data Center" is in Reno and in Apple Valley; when
// only one of them has a page, the name used to link there from the other one's county. So a name
// held by more than one record only links to a project in the same state or country as the page.
const NAME_RECORDS = new Map();
RECORDS.forEach(r => {
  const n = r.name && String(r.name).trim();
  if (!n || n.length < 10 || GENERIC_PROJECT.test(n)) return;
  const k = esc(n);
  if (!NAME_RECORDS.has(k)) NAME_RECORDS.set(k, []);
  NAME_RECORDS.get(k).push(r);
  addLink(n, r.page);
});
const PAGE_RECORD = new Map();
RECORDS.forEach(r => { if (r.page) PAGE_RECORD.set(r.page, r); });
// [country slug, region slug] of the place a page is about, or null when it is not one place.
function pageGeo(u) {
  const s = u.split('/').filter(Boolean);
  if (s[0] === 'data-centers' && s[1]) return [s[1], s[2] || ''];
  if (s[0] === 'project') { const r = PAGE_RECORD.get(u); return r ? recordGeo(r) : null; }
  return null;
}
function recordGeo(r) {
  return [countrySlug[r.country] || '', r.region ? (regionSlug[r.country + '|' + r.region] || '') : ''];
}
function sharedNameOk(text, target, selfUrl) {
  if (!target.startsWith('/project/')) return true;
  const recs = NAME_RECORDS.get(text) || [];
  const self = pageGeo(selfUrl), t = PAGE_RECORD.get(target);
  // From a place or project page, a project is only linked when it is in that same state or
  // country: a name in a Nebraska county report is a Nebraska project, even when the only record
  // of that name with a page is in Texas. Losing a cross-state link is cheap; a wrong one is not.
  if (self && t) {
    const g = recordGeo(t);
    if (g[0] !== self[0] || (self[1] && g[1] !== self[1])) return false;
  }
  if (recs.length < 2) return true;
  if (!self || !t) return false;                       // a company page cannot tell them apart
  const g = recordGeo(t);
  if (g[0] !== self[0]) return false;
  if (self[1] && g[1] !== self[1]) return false;
  // and no other record of the same name sits in that same place
  return recs.filter(r => { const h = recordGeo(r); return h[0] === self[0] && (!self[1] || h[1] === self[1]); }).length === 1;
}
Object.keys(tree).forEach(c => {
  addLink(c, countryUrl(c));
  Object.keys(tree[c].regions).forEach(rg => {
    // A region that is its country under another name has no page (Singapore, Bahrain), and
    // neither do its counties: linking them sent readers to a 404.
    if (!regionWorthAPage(c, rg)) return;
    addLink(rg, regionUrl(c, rg));
    Object.keys(tree[c].regions[rg].counties).forEach(cy => addLink(cy, countyUrl(c, rg, cy)));
  });
});

// Longest first, so "Prince William County" is preferred over "Prince William".
const LINK_INDEX = Array.from(LINK_BY_TEXT.entries())
  .map(([text, urls]) => ({ text, urls }))
  .sort((a, b) => b.text.length - a.text.length);

// How much of the path two urls share. Used to settle same-name places in favour of the one in
// the page's own state or country.
function sharedDepth(a, b) {
  const x = a.split('/'), y = b.split('/');
  let n = 0;
  while (n < x.length && n < y.length && x[n] === y[n]) n++;
  return n;
}

// Pick which page a name should point at, given the page it is written on. When two candidates
// are equally close the link is dropped: a wrong link is worse than no link.
function resolveLink(urls, selfUrl) {
  // If THIS page is one of the candidates, the mention means this place, so link nothing.
  //
  // The old code filtered self out and then picked a winner from whatever remained, which is how
  // North Carolina's Lee County page ended up linking the words "Lee County" to Lee County,
  // ALABAMA: the only candidate left after discarding itself. The same mistake sent Lamar GA to
  // Texas, Wise TX to Virginia, Berkeley WV to South Carolina, Rockingham NH to North Carolina,
  // Carbon WY to Pennsylvania, Platte WY to Missouri, Hopewell NJ to Virginia and Columbia WI to
  // Georgia. A page quietly sending a reader to a different state is worse than no link at all.
  if (urls.indexOf(selfUrl) !== -1) return null;
  // A COUNTRY page linked from inside a different country is nearly always a false match: the
  // name is a same-name town, or a government standing in for a place. Dickens County, Texas
  // lists "Abilene, Childress, Silverton and Turkey" and linked Turkey, Texas to the country
  // Turkey; Guangdong linked "Taiwan's Research Institute" to Taiwan. Single-candidate names
  // skipped the distance check altogether, which is how both got through. State-to-state and
  // county-to-state links are untouched, because those are usually right and always useful.
  const seg = u => u.split('/').filter(Boolean);
  const selfSeg = seg(selfUrl);
  const crossCountry = u => {
    const t = seg(u);
    return t.length === 2 && t[0] === 'data-centers'
      && selfSeg[0] === 'data-centers' && selfSeg.length > 1 && selfSeg[1] !== t[1];
  };
  urls = urls.filter(u => !crossCountry(u));
  if (!urls.length) return null;
  if (urls.length === 1) return urls[0];
  const scored = urls.map(u => ({ u, d: sharedDepth(u, selfUrl) }));
  if (!scored.length) return null;
  scored.sort((a, b) => b.d - a.d);
  if (scored.length > 1 && scored[0].d === scored[1].d) return null;   // ambiguous, so no link
  if (scored[0].d < 3) return null;                  // not even the same country, so no link
  return scored[0].u;
}

// Names that are also ordinary English words, or that appear on nearly every page, are never
// linked: linking the word "Washington" inside "Washington said" is worse than not linking.
const NEVER_LINK = /^(data|center|centre|project|county|digital|global|cloud|power|energy|group|holdings|partners|capital|united states|washington|jordan|mobile|phoenix|orange|franklin|columbia|independence|enterprise|american|national|general)$/i;

const MAX_LINKS_PER_PAGE = 10;

// One report paragraph, already escaped. `used` is a Set shared across the whole page so a
// target is linked once, on its first mention, the way a news article does it.
function linkify(escaped, selfUrl, used) {
  if (!escaped || !used || used.size >= MAX_LINKS_PER_PAGE) return escaped;
  const spans = [];
  for (let i = 0; i < LINK_INDEX.length; i++) {
    if (used.size + spans.length >= MAX_LINKS_PER_PAGE) break;
    const e = LINK_INDEX[i];
    if (NEVER_LINK.test(e.text)) continue;
    const at = escaped.indexOf(e.text);
    if (at < 0) continue;
    const target = resolveLink(e.urls, selfUrl);
    if (!target || used.has(target)) continue;
    if (!sharedNameOk(e.text, target, selfUrl)) continue;
    const before = at === 0 ? '' : escaped[at - 1];
    const after = escaped[at + e.text.length] || '';
    // Whole words only, and a hyphen counts as part of the word: without it "Hauts-de-France"
    // matched France and "Montana-Alberta Tie Line" matched both states.
    if (/[A-Za-z0-9-]/.test(before) || /[A-Za-z0-9-]/.test(after)) continue;
    // A place name sitting inside a LONGER proper noun is not that place. The old check only
    // looked at the neighbouring character, so every one of these linked:
    //   "New [Mexico] Tech" -> the country Mexico      "Corey [Hessen]" -> the German state
    //   the town of [Turkey], Texas -> the country     "[Canada] Pension Plan"
    //   "[Kansas] City", "[Colorado] River", "[Kentucky] Avenue", "Lake [Michigan]"
    // So reject when the adjacent word is capitalised, which means the match is one word of a
    // bigger name. Sentence-leading function words are exempt, or "The Texas legislature" would
    // lose a link it should have; losing a link is cheap, a wrong link is not.
    const LEADING_OK = /^(?:The|A|An|In|At|On|From|To|And|But|Of|For|By|With|After|Before|When|While|If|Its|Their|This|That|These|Those|Both|Most|Many|Some|All|Now|Then|Here|There)$/;
    if (before === ' ') {
      const prev = /([A-Za-z'’-]+)\s*$/.exec(escaped.slice(0, at - 1));
      if (prev && /^[A-Z]/.test(prev[1]) && !LEADING_OK.test(prev[1])) continue;
    }
    // A lowercase noun after the name can also mean it is not the place: "Indiana bat" is a
    // species, "Colorado streets" and "Kansas road" are streets, "Flanders road" is a road.
    const NOT_THE_PLACE = /^(?:street|streets|road|roads|avenue|river|creek|lake|valley|basin|aquifer|turnpike|highway|boulevard|drive|parkway|bat|bats|pike|trail|canal|bay|sound|straits?|mountains?|hills?)$/i;
    if (after === ' ') {
      const next = /^([A-Za-z'’-]+)/.exec(escaped.slice(at + e.text.length + 1));
      if (next && (/^[A-Z]/.test(next[1]) || NOT_THE_PLACE.test(next[1]))) continue;
    }
    if (spans.some(s => at < s[1] && at + e.text.length > s[0])) continue;   // no nesting
    spans.push([at, at + e.text.length, target]);
  }
  if (!spans.length) return escaped;
  let out = escaped;
  spans.sort((a, b) => b[0] - a[0]);                // right to left so earlier offsets stay valid
  spans.forEach(s => {
    used.add(s[2]);
    out = out.slice(0, s[0]) + '<a href="' + s[2] + '">' + out.slice(s[0], s[1]) + '</a>' + out.slice(s[1]);
  });
  return out;
}

// A region page is skipped when it would be a copy of its country page: one region holding
// every site in the country, and few enough sites that the two lists are identical.
function regionWorthAPage(c, rg) {
  const t = tree[c];
  const keys = Object.keys(t.regions);
  if (keys.length > 1) return true;
  // One region holding every site in the country is the country page under another name, and
  // it came out word for word the same. The region url redirects to the country instead.
  return t.regions[rg].list.length !== t.list.length;
}

// ---------------------------------------------------------------- wins and moratoriums

// The level label sits under the place name, so "Cobb County" followed by "County" read as
// "Cobb County County" and "Superior City" as "Superior City Town or city". Drop the label when
// the name already says it.
function morLevelLabel(m) {
  const label = MOR_LEVEL[m.level] || m.level || '';
  const name = String(m.name || '');
  if (/ (County|Parish|Borough)$/i.test(name) && /^(County|Parish|Borough)/i.test(label)) return '';
  if (m.level === 'municipality' && /(City|Town|Village|Township|Borough)/i.test(name)) return '';
  return label;
}

const MOR_LEVEL = { municipality: 'Town or city', county: 'County', state: 'State', tribal: 'Tribal nation', national: 'Country' };
const WIN_LABEL = { Denied: 'Denied by a vote', Withdrawn: 'Withdrawn by the developer', Court: 'Blocked in court' };

// Place each win and each moratorium that carries coordinates into its county.
function placeFips(lat, lng) {
  if (lat == null || lng == null) return '';
  const hit = usCounty(lat, lng);
  return hit ? hit.fips : '';
}

// A row whose coordinates fall in a different state from the one it names was geocoded to a
// same-name place (Jackson County, Florida pinned in Jackson County, Missouri), so it is tied
// to no county rather than shown on the wrong one. It still shows on its own state's page.
const wrongStateRows = [];
function rowFips(row) {
  const f = placeFips(row.lat, row.lng);
  if (!f || !row.state) return f;
  const hit = usCounty(row.lat, row.lng);
  if (hit && hit.state && hit.state !== row.state) { wrongStateRows.push((row.name || row.place) + ', ' + row.state + ' (pinned in ' + hit.county + ', ' + hit.state + ')'); return ''; }
  return f;
}

const WIN_LIST = (WINS.wins || []).map(w => ({
  ...w, _fips: w.country === 'United States' ? rowFips(w) : ''
}));

const MOR_LIST = (WINS.moratoriums || []).map(m => ({
  ...m,
  _fips: m.country === 'United States' && m.level !== 'state' && m.level !== 'national' ? rowFips(m) : '',
  _ended: !!(m.end && m.end < TODAY)
}));

const winsFor = f => WIN_LIST.filter(f);

// Counties with a moratorium, ban or zoning rule on record but no tracked project had no page,
// so every link to them (wins page, state ban tables) fell back to the state. Each now gets a
// page of its own built from the ban records. Registered in FIPS_URL before any table renders.
const BAN_COUNTIES = {};
MOR_LIST.forEach(m => {
  if (m.country !== 'United States' || m.level === 'state' || m.level === 'national' || !m._fips || FIPS_URL[m._fips]) return;
  const shp = countyShape(m._fips);
  if (!shp || !shp.state) return;
  const label = countyLabel(shp.name, shp.state, shp.fips);
  const rs = regionSlug['United States|' + shp.state] || slug(shp.state);
  BAN_COUNTIES[m._fips] = { fips: m._fips, label: label, state: shp.state,
    url: '/data-centers/united-states/' + rs + '/' + slug(label) + '/' };
});
Object.keys(BAN_COUNTIES).forEach(f => { FIPS_URL[f] = BAN_COUNTIES[f].url; });
const morsFor = f => MOR_LIST.filter(f);

// ---------------------------------------------------------------- page chrome

// The header, footer, fonts and colours are lifted out of wins.html so these pages follow the
// rest of the site automatically. Nothing about the look is retyped here.
const winsHtml = fs.readFileSync(path.join(ROOT, 'wins.html'), 'utf8');

function slice(src, startMark, endMark, label) {
  const a = src.indexOf(startMark);
  if (a < 0) throw new Error('wins.html: could not find ' + label + ' (' + startMark + ')');
  const b = src.indexOf(endMark, a);
  if (b < 0) throw new Error('wins.html: could not find the end of ' + label);
  return src.slice(a, b + endMark.length);
}

// Both style blocks: the shared site stylesheet and the wins list styles the drill-downs use.
const styleStart = winsHtml.indexOf('<style>');
const styleEnd = winsHtml.indexOf('</style>', winsHtml.indexOf('</style>') + 8) + 8;
const CHROME_CSS = winsHtml.slice(styleStart, styleEnd).replace(/url\(fonts\//g, 'url(/fonts/');

const CHROME_HEADER = slice(winsHtml, '<header class="masthead">', '</nav></div>', 'the header and drawer');
const CHROME_FOOTER = slice(winsHtml, '<footer class="footer"', '</footer>', 'the footer');
const CHROME_JS = winsHtml.slice(winsHtml.indexOf('</footer>') + 9, winsHtml.indexOf('</body>')).trim();

// The same five links every hand written page in the repo root carries, in the same order, so
// one icon set covers the whole site. tools/apply-icons.js keeps the root pages on this list;
// if you change one, change both. Written by tools/make-icons.js.
const ICON_FILES = [
  ['icon', '/favicon.ico', 'image/x-icon', ''],
  ['icon', '/favicon-32.png', 'image/png', '32x32'],
  ['icon', '/favicon-48.png', 'image/png', '48x48'],
  ['icon', '/favicon-192.png', 'image/png', '192x192'],
  ['apple-touch-icon', '/apple-touch-icon.png', '', '180x180']
];
const ICONS = ICON_FILES.filter(function (i) { return fs.existsSync(path.join(ROOT, i[1].slice(1))); })
  .map(function (i) {
    return '<link rel="' + i[0] + '"'
      + (i[2] ? ' type="' + i[2] + '"' : '')
      + (i[3] ? ' sizes="' + i[3] + '"' : '')
      + ' href="' + i[1] + '">';
  }).join('\n');

const PAGE_CSS = `<style>
.g-crumb{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#d6ceb8;margin:0 0 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.g-crumb a{color:#f0a8a4;text-decoration:none}.g-crumb a:hover{text-decoration:underline}
.g-crumb span{opacity:.5}
/* A one-line route into the project list, shown only on phones. James's point was that a reader
   who hits the wall of prose on a phone and does not want to read it should still have a way
   deeper into the site. Putting the whole project table above the reporting would have done that
   at the cost of the thing that makes these pages rank, so this is the same escape hatch in one
   line instead of a whole section. */
/* Centred on the same axis as the reading column so the page reads as one column all the way
   down, instead of stepping back out to the left edge under the prose. The headings and tables
   inside stay left-aligned: the block moves, the content does not. Measured before doing this --
   the project table wants 593px unwrapped, so 680px does not squeeze it; today it is stretched
   across 1130px, which is why it looks thin. */
.w-sep{display:none}
.g-sec{max-width:680px;margin:0 auto;padding:38px 0 0}
.g-sec h2{font-family:var(--serif);font-weight:400;font-size:clamp(22px,2.2vw,30px);letter-spacing:-.01em;margin:0 0 6px}
.g-lede{font-size:14.5px;line-height:1.6;color:var(--muted);max-width:660px;margin:0 0 20px}
.g-map{border:1px solid var(--rule);background:var(--paper);margin:0 0 14px;overflow:hidden}
/* The stage locks its aspect ratio so the tiles and the vector overlay scale together. */
.g-stage{position:relative;width:100%;overflow:hidden;background:#3a3a33}
.g-stage.plain{background:#f2efe6}
.g-tiles{position:absolute;inset:0;overflow:hidden}
.g-tiles img{position:absolute;display:block;max-width:none}
.g-stage svg{position:absolute;inset:0;width:100%;height:100%;display:block}
/* Markers sit on satellite imagery that is often the same green as a tracked project, so
   they carry a dark halo under the white ring. Colours and sizes match the globe. */
.g-dots circle{filter:drop-shadow(0 0 0 1.4px #fff) drop-shadow(0 1px 2px rgba(0,0,0,.8))}
.g-dots circle[fill=transparent]{filter:none}
.g-stage svg a{cursor:pointer}
a.w-stat{text-decoration:none}
.w-hero-note{font:400 13.5px/1.55 var(--sans);color:#d6ceb8;max-width:660px;margin:14px 0 0}
.w-hero-note b{color:#f0a8a4;font-weight:600}
.g-list li small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
a.w-stat span{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
.g-stage svg path,.g-stage .w-cap{pointer-events:none}
.g-stage svg a.g-area path{pointer-events:visiblePainted}
.g-stage svg a.g-area:hover path{fill:rgba(247,244,236,.32)}
.g-stage .w-cap{position:absolute;left:0;right:0;bottom:0}
.g-pin{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--red);border:3px solid #fff;box-shadow:0 0 0 6px rgba(160,35,29,.35)}
.g-sat{margin:0 auto 26px;max-width:100%}
.g-sat-link{display:block;position:relative;max-width:100%;margin:0 auto 26px;color:inherit;text-decoration:none}.g-sat-link .g-sat{margin:0}
.g-sat-cta{position:absolute;top:12px;right:12px;z-index:2;display:inline-flex;align-items:center;gap:7px;background:#14130fe0;color:#f7f4ec;font:500 13.5px/1 var(--sans);padding:10px 13px;transition:background .15s}.g-sat-link:hover .g-sat-cta{background:var(--red)}
.g-statrow{margin:0 0 30px}
.g-approx{font-size:12.5px;color:var(--muted);margin:-14px 0 24px}
/* One centred column for a project page. Text sets at a readable measure and everything
   else, the satellite view included, lines up with it. */
.g-col{max-width:680px;margin:0 auto}
.w-hero .g-col h1{max-width:none}
.g-col .g-list{columns:1}
.g-facts{display:flex;flex-wrap:wrap;align-items:center;gap:0 4px;margin:14px 0 0;font-size:13px;letter-spacing:.02em;color:#d6ceb8}
.g-facts i{font-style:normal;opacity:.45;padding:0 6px}
.g-report{margin:0 0 34px}
.g-report p{font-family:var(--serif);font-size:17.5px;line-height:1.66;margin:0 0 26px}
.g-report p:first-child{font-size:20px;line-height:1.5;margin-bottom:30px}
.g-report p:last-child{margin-bottom:0}
@media(max-width:760px){.g-report p{font-size:16.5px;margin-bottom:22px}.g-report p:first-child{font-size:18px}.g-facts{font-size:12.5px}}
.g-off{font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.g-mapfoot{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;padding:12px 14px;border-top:1px solid var(--rule);font-size:12px;color:var(--muted)}
.g-key{display:inline-flex;align-items:center;gap:7px}
.g-key i{width:9px;height:9px;border-radius:50%;flex:none}
.g-key i.tracked{background:var(--green)}
.g-key i.stopped{background:var(--red)}
.g-key i.size{background:var(--green);width:14px;height:14px}
.g-btn{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:500;text-decoration:none;color:var(--ink);border:1px solid var(--ink);padding:10px 16px;background:transparent}
.g-btn:hover{background:#eae6db}
.g-btn.red{background:var(--red);border-color:var(--red);color:var(--paper)}
.g-btn.red:hover{background:#801c17;color:var(--paper)}
.g-more{max-width:680px;margin:0 auto 26px}.g-more>summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--ink);border:1px solid var(--ink);padding:9px 16px}
.g-more>summary::-webkit-details-marker{display:none}.g-more>summary::after{content:"+";font-size:15px;line-height:1}.g-more[open]>summary{display:none}
.g-srcbox{margin-top:30px}.g-more>summary:hover{background:var(--ink);color:var(--paper)}
.g-acts{display:flex;flex-wrap:wrap;gap:12px;max-width:680px;margin:0 auto 30px}
/* The letter block. Sits straight under the opening on a place page, because that is what the
   visitor came for: a data center is coming and they want to say something about it. */
.g-srcs{list-style:none;padding:0;margin:0;columns:2;font-size:14px}
.g-srcs a{overflow-wrap:anywhere;word-break:break-word}
.g-srcs li{margin:0 0 6px;break-inside:avoid}
.g-letter{max-width:680px;margin:0 auto 30px;padding:22px 24px 24px;background:var(--paper-dark,#efece2);border:1px solid var(--rule,#c9c3b3);border-left:4px solid var(--red,#a0231d)}
.g-letter h2{font-family:var(--serif);font-size:21px;line-height:1.25;margin:0 0 10px;border:0;padding:0}
.g-letter p{font-size:15px;line-height:1.55;margin:0 0 12px;color:var(--ink-soft,#3d3b33)}
.g-letter .g-letter-count{font-size:14px;color:var(--muted,#666458);margin-bottom:14px}
.g-letter .g-letter-count b{font-family:var(--serif);font-size:17px;color:var(--ink,#1a1915)}
.g-letter .g-btn{margin:0}
.g-letter .g-letter-fine{font-size:13px;color:var(--muted,#666458);margin:12px 0 0}
.g-dl{display:grid;grid-template-columns:150px 1fr;margin:0 0 26px;border-top:1px solid var(--ink)}
.g-dl dt,.g-dl dd{margin:0;padding:10px 0;border-bottom:1px solid var(--rule);font-size:14px;line-height:1.5}
.g-dl dt{color:var(--muted);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;padding-top:12px}
.g-dl dd a{color:var(--ink)}
.g-src{list-style:none;margin:0 0 26px;padding:0;border-top:1px solid var(--ink)}
.g-src li{border-bottom:1px solid var(--rule);padding:10px 0;font-size:13.5px;line-height:1.5;word-break:break-word}
.g-src a{color:var(--ink);text-underline-offset:3px}.g-src a:hover{color:var(--red)}
.g-src li.note{color:var(--muted)}
.g-list{list-style:none;margin:0 0 26px;padding:0;columns:2;column-gap:32px}
.g-list li{break-inside:avoid;border-bottom:1px solid var(--rule);padding:9px 0;font-size:14px}
.g-list a{color:var(--ink);text-decoration:none}.g-list a:hover{color:var(--red);text-decoration:underline}
.g-list .n{color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums;margin-left:6px}
/* margin:0 auto, not margin:0. The 680px reading column is centred in the 1200px .wrap rather
   than pinned to its left edge, which left ~500px of dead space down the right of every place
   page. The text inside stays left-aligned: only the column moves, never the lines. Project pages
   already did this via .g-col{max-width:680px;margin:0 auto}, so this makes place pages match
   the rest of the site rather than introducing a new look. */
.g-body{font-family:var(--serif);font-size:17px;line-height:1.6;max-width:680px;margin:0 auto 22px}
.g-foot{font-size:12.5px;color:var(--muted);line-height:1.6;max-width:680px;margin:34px 0 60px;padding-top:16px;border-top:1px solid var(--rule)}
.g-pill{display:inline-block;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;padding:1px 7px;border:1px solid var(--rule);color:var(--muted);white-space:nowrap}
.g-pill.live{border-color:var(--red);color:var(--red)}
.g-pill.operating{border-color:var(--ink);color:var(--ink)}
.g-share{margin:30px 0 0;padding-top:22px;border-top:1px solid var(--rule)}
.g-share h3{font:600 12px/1 var(--sans);letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin:0 0 13px}
.g-share-row{display:flex;flex-wrap:wrap;gap:8px}
.g-sb{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);font:500 13.5px/1 var(--sans);padding:11px 15px;text-decoration:none;cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.g-sb:hover{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.g-sb svg{width:16px;height:16px;flex:none}
.g-sb.copied{background:var(--green);border-color:var(--green);color:#fff}
/* Phones. Measured on a 390px viewport before writing any of this: the first sentence of the
   reporting began 750px down a county page, which is most of a screen of furniture before any
   journalism. Three things caused it.
   1. The stat block stacked into three full-width boxes, 174px, two of which say we do NOT know
      something ("1 with no stage on record", "None reports a capacity"). They now run inline as
      one compact strip, which is the same information in roughly a third of the height.
   2. The county map was a 147px letterbox strip inset by the text gutter, so it read as cropped
      rather than as a photograph. Project pages were already showing theirs at ~330px and looked
      right, which is the height used here.
   3. The two action buttons were forced to width:100% and stacked. Side by side they needed
      346px against 342px available, missing by four pixels, so the label is shortened rather
      than the padding crushed. */
@media(max-width:760px){
.w-stats{display:block;font:500 12px/1.55 var(--sans);color:#d6ceb8;letter-spacing:.02em}
.w-stat{display:inline;border:0;background:none;padding:0;margin:0}.w-sep{display:inline;font-style:normal;color:rgba(240,168,164,.55)}
.w-stat b{font-family:var(--sans);font-size:12px;font-weight:700;color:#f0a8a4;white-space:nowrap}
.w-stat span{font-size:12px;font-weight:500;letter-spacing:.02em;text-transform:none;color:#d6ceb8}
.g-map .g-stage{aspect-ratio:auto!important;height:200px}
.g-srcs{columns:1}
.g-acts{flex-wrap:nowrap;gap:8px}
.g-acts .g-btn{flex:1 1 0;min-width:0;width:auto;justify-content:center;text-align:center;padding:11px 8px;white-space:normal;overflow-wrap:anywhere;line-height:1.3}
.g-letter{padding:18px 16px 20px}.g-letter .g-btn{width:100%;justify-content:center}.g-list{columns:1}.g-dl{grid-template-columns:1fr}.g-dl dt{border-bottom:0;padding-bottom:0}.g-dl dd{padding-top:2px}
.g-share-row{gap:7px}.g-sb{flex:1 1 auto;justify-content:center;padding:12px 10px}}
</style>`;

// Written once and linked from every generated page, so a reader downloads it on the first
// page and none of the rest. Rebuilt on every run from wins.html plus the rules above.
const CSS_HREF = '/generated.css';
fs.writeFileSync(path.join(ROOT, 'generated.css'),
  '/* Built by data/build-pages.js from wins.html. Do not edit: run the script. */' + `\n` +
  (CHROME_CSS + PAGE_CSS).replace(/<\/?style>/g, ''));

// One framed 1200x630 satellite image of a site, for the share card.
function shareImage(lat, lng, exact) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) return '';
  const latPad = exact ? 0.004 : 0.03;                     // tighter when we know the parcel
  const lngPad = latPad / Math.max(0.2, Math.cos(lat * Math.PI / 180));
  const bbox = [lng - lngPad, lat - latPad, lng + lngPad, lat + latPad]
    .map(function (n) { return n.toFixed(5); }).join(',');
  return ESRI_EXPORT + '?bbox=' + bbox + '&bboxSR=4326&imageSR=3857&size=1200,630&format=jpg&f=image';
}

const SH_ICON = {
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.9l-4.3-5.6L6.5 21H3.4l7-8L2.6 3h6l3.9 5.2z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V12H8v3h2.5v6h3v-6H16l.5-3h-3v-2c0-.6.4-1 1-1z"/></svg>',
  sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>'
};

// Native sheet first on a phone, explicit buttons for everyone else. The text names the
// project and where it is, because a bare headline tells nobody why it matters to them.
function shareBlock(shareTitle, shareUrl, shareText) {
  const encUrl = encodeURIComponent(shareUrl);
  const encText = encodeURIComponent(shareText);
  return '<div class="g-share" data-share-url="' + esc(shareUrl) + '"'
    + ' data-share-title="' + esc(shareTitle) + '" data-share-text="' + esc(shareText) + '">'
    + '<h3>Share this</h3><div class="g-share-row">'
    + '<button type="button" class="g-sb g-share-native" hidden>' + SH_ICON.share + '<span>Share</span></button>'
    + '<button type="button" class="g-sb g-share-copy">' + SH_ICON.link + '<span>Copy link</span></button>'
    + '<a class="g-sb" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text='
      + encText + '&amp;url=' + encUrl + '">' + SH_ICON.x + '<span>X</span></a>'
    + '<a class="g-sb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u='
      + encUrl + '">' + SH_ICON.fb + '<span>Facebook</span></a>'
    + '<a class="g-sb g-share-sms" href="sms:?&amp;body=' + encodeURIComponent(shareText + ' ' + shareUrl) + '">'
      + SH_ICON.sms + '<span>Text message</span></a>'
    + '</div></div>';
}

const SHARE_JS = `<script>
(function(){
  var box=document.querySelector('.g-share'); if(!box) return;
  var url=box.getAttribute('data-share-url'),
      title=box.getAttribute('data-share-title'),
      text=box.getAttribute('data-share-text');
  var nat=box.querySelector('.g-share-native');
  if(nat&&navigator.share){
    nat.hidden=false;
    nat.addEventListener('click',function(){
      navigator.share({title:title,text:text,url:url}).catch(function(){});
    });
  }
  var copy=box.querySelector('.g-share-copy');
  if(copy){
    var span=copy.querySelector('span');
    var ok=function(){var was=span.textContent;span.textContent='Copied';copy.classList.add('copied');
      setTimeout(function(){span.textContent=was;copy.classList.remove('copied')},1800)};
    var fallback=function(){var i=document.createElement('input');i.value=url;document.body.appendChild(i);
      i.select();try{document.execCommand('copy');ok()}catch(e){}i.remove()};
    copy.addEventListener('click',function(){
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(ok).catch(fallback);
      } else fallback();
    });
  }
})();
</script>`;

// ---------------------------------------------------------------- structured data
//
// Everything emitted here restates what the page already shows: the breadcrumb trail
// rendered at the top, the place or company the page is about, and the child pages it
// links to. Nothing is inferred, and no claim is made that a reader cannot check on the
// page itself.

// The payload sits inside <script>, so "<" is the one character that could close the tag
// early. Escaped as < it stays valid JSON and safe HTML.
function jsonLd(nodes) {
  const graph = nodes.filter(Boolean);
  if (!graph.length) return '';
  return '<script type="application/ld+json">'
    + JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\u003c')
    + '</script>';
}

// The same trail, in the same order, as the .g-crumb line under the header. The final
// crumb is the current page, so it carries a name but no item URL, which is what
// schema.org asks for.
function breadcrumbLd(crumbs) {
  if (!crumbs || crumbs.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(function (c, i) {
      const item = { '@type': 'ListItem', position: i + 1, name: clean(c.label) };
      if (c.url) item.item = SITE + c.url;
      return item;
    })
  };
}

// A list of the child pages this page links to, in the order they are listed on it.
function itemListLd(name, entries) {
  const items = (entries || []).filter(function (e) { return e && e.url && e.name; });
  if (!items.length) return null;
  return {
    '@type': 'ItemList',
    name: name,
    numberOfItems: items.length,
    itemListElement: items.map(function (e, i) {
      return { '@type': 'ListItem', position: i + 1, name: clean(e.name), url: SITE + e.url };
    })
  };
}

// US states get the narrower schema.org type; everywhere else "region" means too many
// different things to claim more than AdministrativeArea.
function areaLd(country, region, county) {
  const countryNode = { '@type': 'Country', name: country };
  if (!region) return countryNode;
  const regionNode = {
    '@type': country === 'United States' ? 'State' : 'AdministrativeArea',
    name: region, containedInPlace: countryNode
  };
  if (!county) return regionNode;
  return { '@type': 'AdministrativeArea', name: county, containedInPlace: regionNode };
}

// The numbers under a place heading link to the list they count (#projects) and to the bans
// table (#bans). Not every page has a section carrying that id, so the first section holding a
// list takes it; when there is none the number stays plain text rather than a link to nothing.
function fixAnchors(o) {
  if (!o.stats || !o.body) return o;
  let body = o.body, stats = o.stats;
  ['projects', 'bans'].forEach(function (id) {
    if (stats.indexOf('href="#' + id + '"') < 0 || body.indexOf('id="' + id + '"') >= 0) return;
    let at = -1;
    if (id === 'projects') {
      const parts = body.split('<section class="g-sec">');
      let pos = parts[0].length;
      for (let i = 1; i < parts.length; i++) {
        const inner = parts[i].split('</section>')[0];
        if (/w-tree|g-list|w-tbl/.test(inner)) { at = pos; break; }
        pos += '<section class="g-sec">'.length + parts[i].length;
      }
    }
    if (at >= 0) body = body.slice(0, at) + '<section class="g-sec" id="' + id + '">' + body.slice(at + '<section class="g-sec">'.length);
    else stats = stats.split('<a class="w-stat" href="#' + id + '">').map(function (bit, i) {
      return i === 0 ? bit : '<div class="w-stat">' + bit.replace('</a>', '</div>');
    }).join('');
  });
  return Object.assign({}, o, { body: body, stats: stats });
}

function page(o) {
  o = fixAnchors(o);
  const title = clean(o.title);
  const desc = clean(o.description);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(SITE + o.url)}">
${o.noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(SITE + o.url)}">
<meta property="og:site_name" content="Global Data Centers">
${o.image ? `<meta property="og:image" content="${esc(o.image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc('Satellite view of ' + o.h1)}">
<meta name="twitter:image" content="${esc(o.image)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
${jsonLd([breadcrumbLd(o.crumbs)].concat(o.schema || []))}
${ICONS}
<link rel="stylesheet" href="${CSS_HREF}">
<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "whyg2fbg7c");</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${CHROME_HEADER}
<main id="main">
<section class="w-hero"><div class="wrap">${o.narrow ? '<div class="g-col">' : ''}
<p class="g-crumb">${o.crumbs.map((c, i) => (i ? '<span>/</span>' : '') + (c.url ? `<a href="${esc(c.url)}">${esc(c.label)}</a>` : `${esc(c.label)}`)).join('')}</p>
<div class="w-kicker">${esc(o.kicker)}</div>
<h1>${esc(o.h1)}</h1>
${o.sub ? `<p class="w-sub">${esc(o.sub)}</p>` : ''}
${o.stats || ''}
${o.note ? `<p class="w-hero-note">${o.note}</p>` : ''}
${o.narrow ? '</div>' : ''}</div></section>
<div class="wrap">
${o.body}
</div>
</main>
${CHROME_FOOTER}
${CHROME_JS}
${o.share ? SHARE_JS : ''}
${o.letterJs ? LETTER_JS : ''}
</body>
</html>`;
}

// A pair may carry a third item, the anchor or page it opens: Clarity showed readers clicking
// "moratoriums and bans in effect" and "proposed or being built" and getting nothing.
const statHtml = pairs => pairs.length
  ? '<div class="w-stats">' + pairs.map(x => {
    const inner = `<b>${esc(x[0])}</b> <span>${esc(x[1])}</span>`;
    return x[2] ? `<a class="w-stat" href="${esc(x[2])}">${inner}</a>` : `<div class="w-stat">${inner}</div>`;
  }).join('<i class="w-sep"> · </i>') + '</div>'
  : '';

// ---------------------------------------------------------------- the small maps

// Two kinds of map.
//
// Close in, on a region or county page, the background is the same Esri satellite imagery the
// project pages use, with the boundary drawn over it as a thin outline. Real land reads as a
// place; a flat shape reads as a rendering bug.
//
// Far out, on a country or company page, satellite tiles at that zoom are a brown smear, so
// the background is a plain world outline with country borders instead.
//
// Everything is laid out in percentages inside a box with a locked aspect ratio, so the tiles
// and the vector overlay scale together and there is never a gap at the edge.

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
// The satellite view on a page is a mosaic of the tiles above, positioned with CSS, so it
// has no single URL to hand a social network. This endpoint renders the same ground as one
// image, which is what a share card needs.
const ESRI_EXPORT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export';
const TILE = 256;

// The map sits on satellite imagery, and #294e36 on woodland is one dark green on another:
// the white ring read and the disc did not, so every dot looked hollow. These are the brand
// colours lifted far enough to hold against forest, field, water or city at any zoom.
const DOT_COLOR = { stopped: '#e8402c', tracked: '#4fc07a' };

// Radius from reported power. Unreported sites take the floor rather than vanishing.
// The same bands globe-init.js uses for its markers, so a county page and the globe agree about
// which project is the big one. A stopped project gets the blocked size, a project with no
// capacity on record gets the smallest, exactly as on the globe.
// Dots are drawn at a fixed size on the map, so at state scale a 10px dot covered an area the
// size of a city (Alaska's 3,000 MW site read as a blob bigger than Orlando). Kept small: a dot
// marks a spot, and size only hints at power.
function dotRadius(mw, stopped) {
  if (stopped) return 4.5;
  const m = +mw || 0;
  return m >= 1000 ? 6 : m >= 500 ? 5.5 : m >= 100 ? 5 : m >= 50 ? 4.5 : 4;
}

// Web Mercator, in the 0..1 space the tile pyramid uses.
function mercX(lng) { return (lng + 180) / 360; }
function mercY(lat) {
  const l = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const r = l * Math.PI / 180;
  return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2;
}

// The largest zoom at which the area still fits inside the box.
function fitZoom(bbox, W, H, maxZoom) {
  for (let z = maxZoom; z >= 1; z--) {
    const world = TILE * Math.pow(2, z);
    const dx = (mercX(bbox[2]) - mercX(bbox[0])) * world;
    const dy = (mercY(bbox[1]) - mercY(bbox[3])) * world;
    if (dx <= W && dy <= H) return z;
  }
  return 1;
}

// Rings are thinned in screen space so a county outline is a few hundred points, not tens of
// thousands. The shape stays true at the size it is drawn.
function pathFor(geom, px, py) {
  if (!geom) return '';
  function ring(r) {
    let d = '', lx = null, ly = null, lng = null, n = 0, kept = 0;
    for (let i = 0; i < r.length; i++) {
      const X = px(r[i][0]), Y = py(r[i][1]);
      const last = i === r.length - 1;
      const wrapped = lng !== null && Math.abs(r[i][0] - lng) > 180;
      lng = r[i][0];
      if (!wrapped && lx !== null && !last && Math.abs(X - lx) < 0.7 && Math.abs(Y - ly) < 0.7) continue;
      d += (n === 0 || wrapped ? 'M' : 'L') + X.toFixed(1) + ' ' + Y.toFixed(1);
      lx = X; ly = Y; n++; kept++;
    }
    return kept > 2 ? d + 'Z' : '';
  }
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates
    : geom.type === 'Polygon' ? [geom.coordinates] : [];
  return polys.map(p => p.map(ring).join('')).join('');
}

// Overlapping sites are nudged apart so a cluster reads as several projects rather than one
// fat blob. Only worth doing when there are few enough dots to see individually.
function spreadDots(dots) {
  // A dot may drift only a little from where the site really is. Unbounded, a dense cluster
  // (Northern Virginia) pushed itself out past the state line into empty map.
  dots.forEach(d => { d.oX = d.X; d.oY = d.Y; });
  const pin = d => {
    const lim = d.r * 1.2, dx = d.X - d.oX, dy = d.Y - d.oY, m = Math.sqrt(dx * dx + dy * dy);
    if (m > lim) { d.X = d.oX + dx / m * lim; d.Y = d.oY + dy / m * lim; }
  };
  for (let pass = 0; pass < 14; pass++) {
    let moved = false;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        let dx = b.X - a.X, dy = b.Y - a.Y;
        const need = a.r + b.r + 1.6;
        let d = Math.sqrt(dx * dx + dy * dy);
        if (d >= need) continue;
        if (d < 0.001) { dx = 0.4; dy = 0.3; d = 0.5; }
        const push = (need - d) / 2, ux = dx / d, uy = dy / d;
        const ax = a.X, ay = a.Y, bx = b.X, by = b.Y;
        a.X -= ux * push; a.Y -= uy * push;
        b.X += ux * push; b.Y += uy * push;
        pin(a); pin(b);
        if (Math.abs(a.X - ax) + Math.abs(a.Y - ay) + Math.abs(b.X - bx) + Math.abs(b.Y - by) > 0.05) moved = true;
      }
    }
    if (!moved) break;
  }
}

// One dot style everywhere: a filled circle with a thin white edge so overlaps stay readable.
function drawDots(pts, px, py) {
  let dots = pts.map(p => ({
    X: px(p.lng), Y: py(p.lat), r: dotRadius(p.mw, p.stopped) * (pts.length > 300 ? 0.6 : 1),   // hundreds of sites: smaller, so the states under them stay clickable
    stopped: !!p.stopped, title: p.title, n: 1, url: p.url
  }));

  // Too many to separate by hand, so collapse them onto a grid first.
  if (dots.length > 400) {
    const cell = new Map();
    dots.forEach(d => {
      const key = Math.round(d.X / 3) + ':' + Math.round(d.Y / 3);
      const prev = cell.get(key);
      if (!prev) { cell.set(key, d); return; }
      prev.n++;
      if ((d.stopped && !prev.stopped) || (d.stopped === prev.stopped && d.r > prev.r)) {
        d.n = prev.n; cell.set(key, d);
      }
    });
    dots = [...cell.values()];
  }
  if (dots.length <= 400) spreadDots(dots);

  // Big first, so small dots sit on top and stay visible inside a cluster.
  dots.sort((a, b) => b.r - a.r);
  const label = dots.length <= 250;
  const open = '<g class="g-dots">', close = '</g>';
  return open + dots.map(d => {
    const color = d.stopped ? DOT_COLOR.stopped : DOT_COLOR.tracked;
    const title = label
      ? '<title>' + esc(d.title || '') + (d.n > 1 ? ' and ' + (d.n - 1) + ' more here' : '') + '</title>'
      : '';
    const c = '<circle cx="' + d.X.toFixed(1) + '" cy="' + d.Y.toFixed(1) + '" r="' + d.r.toFixed(1)
      + '" fill="' + color + '" stroke="#0b0d0a" stroke-width="1.1" fill-opacity="1"';
    const dot = title ? c + '>' + title + '</circle>' : c + '/>';
    // A transparent ring around the dot makes it easy to hit with a finger. On a crowded map
    // (a whole state or country) the rings would blanket the counties underneath, so they stay tight.
    return d.url ? '<a href="' + esc(d.url) + '"' + (/^https?:/.test(d.url) ? ' target="_blank" rel="noopener"' : '') + '><circle cx="' + d.X.toFixed(1) + '" cy="' + d.Y.toFixed(1)
      + '" r="' + (dots.length > 40 ? d.r + 1.5 : Math.max(9, d.r + 4)).toFixed(1) + '" fill="transparent"/>' + dot + '</a>' : dot;
  }).join('') + close;
}

function padBox(b, frac) {
  const px = (b[2] - b[0]) * frac, py = (b[3] - b[1]) * frac;
  return [b[0] - px, b[1] - py, b[2] + px, b[3] + py];
}

function boundsOf(shapes, pts) {
  let b = [Infinity, Infinity, -Infinity, -Infinity];
  shapes.filter(s => !s.backdrop).forEach(s => {
    const g = bboxOf(s.geom);
    b = [Math.min(b[0], g[0]), Math.min(b[1], g[1]), Math.max(b[2], g[2]), Math.max(b[3], g[3])];
  });
  pts.forEach(p => {
    b = [Math.min(b[0], p.lng), Math.min(b[1], p.lat), Math.max(b[2], p.lng), Math.max(b[3], p.lat)];
  });
  if (!isFinite(b[0])) return null;
  // A shape that crosses the date line (Alaska's Aleutians) spans -180..180 and zoomed the map
  // out to the whole world. Measure it again with western longitudes carried past 180; when a
  // place then fits in under 90 degrees, the map draws in that frame (b.dateline). World-wide
  // maps (companies, the US as a whole) stay as they were.
  if (b[2] - b[0] > 180) {
    const e = [Infinity, -Infinity];
    const take = x => { const v = x < 0 ? x + 360 : x; if (v < e[0]) e[0] = v; if (v > e[1]) e[1] = v; };
    const walk = a => { if (typeof a[0] === 'number') take(a[0]); else a.forEach(walk); };
    shapes.filter(s => !s.backdrop && s.geom).forEach(s => walk(s.geom.coordinates));
    pts.forEach(p => take(p.lng));
    if (e[1] - e[0] < 90) { b = [e[0], b[1], e[1], b[3]]; b.dateline = true; }
  }
  if (b[2] - b[0] < 0.02) { const m = (b[0] + b[2]) / 2; b[0] = m - 0.01; b[2] = m + 0.01; }
  if (b[3] - b[1] < 0.02) { const m = (b[1] + b[3]) / 2; b[1] = m - 0.01; b[3] = m + 0.01; }
  return b;
}

// --- close in: satellite tiles under the boundary ------------------------------------------

const MAP_STILLS = {};
function satelliteMap(o) {
  const W = 880, H = o.height || 420;
  const shapes = (o.shapes || []).filter(Boolean);
  const pts = o.points || [];
  // Country maps are framed on the country's main land masses (see mainLand), so far-off
  // territories do not zoom the picture out to half the world.
  const raw = boundsOf(o.frameMain ? shapes.map(s => ({ ...s, geom: mainLand(s.geom) })) : shapes, pts);
  if (!raw) return '';
  const b = padBox(raw, 0.08);
  const L = raw.dateline ? (lng => lng < 0 ? lng + 360 : lng) : (lng => lng);

  const z = fitZoom(b, W, H, o.maxZoom || 13);
  // Tiles come in whole zoom steps, so a state could fill as little as half the frame. Stretch the
  // chosen level (tiles and all) until the area fills the box; the imagery stays sharp below 2x.
  const w0 = TILE * Math.pow(2, z);
  const fx = W / Math.max(1e-9, (mercX(b[2]) - mercX(b[0])) * w0), fy = H / Math.max(1e-9, (mercY(b[1]) - mercY(b[3])) * w0);
  const k = z >= (o.maxZoom || 13) ? 1 : Math.max(1, Math.min(1.9, fx, fy));
  // At world scale the frame can be wider than the world itself, leaving an empty strip at the
  // edge; never draw the world narrower than the box.
  const kk = Math.max(k, W / w0);
  const T = TILE * kk;
  const world = w0 * kk;
  const cx = (mercX(b[0]) + mercX(b[2])) / 2 * world;
  const cy = (mercY(b[1]) + mercY(b[3])) / 2 * world;
  const left = cx - W / 2, top = cy - H / 2;

  const px = lng => mercX(L(lng)) * world - left;
  const py = lat => mercY(lat) * world - top;

  // One still picture of the whole frame, cut once from Esri's imagery at 1.5x the box size and
  // served from this site. It replaced 3 to 65 separate tiles per map, which loaded piece by
  // piece and were stretched up to 1.9x, so the imagery came out soft. A frame that runs past the
  // 180th meridian (Alaska) is cut as two pictures, one each side of it.
  const R = 20037508.342789244;
  const mx = x => x / world * 2 * R - R, my = y => R - y / world * 2 * R;
  let x0 = mx(left), x1 = mx(left + W);
  const y0 = my(top + H), y1 = my(top);
  // A frame that starts west of -180 (a world-wide company map) is moved one world east, so
  // the split below handles it the same way.
  if (x0 < -R) { x0 += 2 * R; x1 += 2 * R; }
  const parts = x1 <= R ? [[x0, x1, 0, 1]]
    : x0 >= R ? [[x0 - 2 * R, x1 - 2 * R, 0, 1]]
    : [[x0, R, 0, (R - x0) / (x1 - x0)], [-R, x1 - 2 * R, (R - x0) / (x1 - x0), 1]];
  let imgs = '';
  parts.forEach(p => {
    const w = Math.max(16, Math.round((p[3] - p[2]) * W * 1.5));
    const bbox = [p[0], y0, p[1], y1].map(v => v.toFixed(1)).join(',');
    const url = ESRI_EXPORT + '?bbox=' + bbox + '&bboxSR=3857&imageSR=3857&size=' + w + ',' + Math.round(H * 1.5)
      + '&format=jpg&compressionQuality=70&f=image';
    const file = require('crypto').createHash('sha1').update(url).digest('hex').slice(0, 16) + '.jpg';
    MAP_STILLS[file] = url;
    imgs += '<img alt="" loading="lazy" src="/map-img/' + file + '" style="left:' + (p[2] * 100).toFixed(4)
      + '%;top:0;width:' + ((p[3] - p[2]) * 100).toFixed(4) + '%;height:100%">';
  });

  let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img"'
    + ' aria-label="' + esc(o.alt || 'Map') + '" xmlns="http://www.w3.org/2000/svg">';
  shapes.forEach(s => {
    const d = pathFor(s.geom, px, py);
    if (!d) return;
    const path = '<path d="' + d + '" fill="' + (s.href ? (s.fill && s.fill !== 'none' ? s.fill : 'rgba(0,0,0,0)') : (s.fill || 'none'))
      + '" stroke="' + (s.stroke || '#fff')
      + '" stroke-width="' + (s.width || 1.4) + '" stroke-linejoin="round"'
      + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '/>';
    svg += s.href ? '<a href="' + esc(s.href) + '" class="g-area"><title>' + esc(s.name || '') + '</title>' + path + '</a>' : path;
  });
  svg += drawDots(pts, px, py) + '</svg>';

  return '<div class="g-stage" style="aspect-ratio:' + W + '/' + H + '">'
    + '<div class="g-tiles">' + imgs + '</div>' + svg
    + '<div class="w-cap"><span>' + esc(o.note || '') + '</span><span>Imagery: Esri, Maxar</span></div>'
    + '</div>';
}

// --- far out: a plain world outline --------------------------------------------------------

// Country borders for the backdrop, light enough to sit behind a whole continent of dots.
let WORLD_OUTLINE = null;
function worldOutline() {
  if (WORLD_OUTLINE !== null) return WORLD_OUTLINE;
  try {
    const topo = require('topojson-client');
    const w = require('world-atlas/countries-110m.json');
    WORLD_OUTLINE = topo.feature(w, w.objects.countries).features
      .map(f => ({ name: f.properties.name, geom: f.geometry, bbox: bboxOf(f.geometry) }));
  } catch (e) { WORLD_OUTLINE = []; }
  return WORLD_OUTLINE;
}

function mainLand(geom) {
  if (!geom || geom.type !== 'MultiPolygon') return geom;
  const box = p => bboxOf({ coordinates: p });
  const size = p => { const b = box(p); return (b[2] - b[0]) * (b[3] - b[1]); };
  const main = box(geom.coordinates.reduce((m, p) => size(p) > size(m) ? p : m));
  // Islands within 5 degrees of the largest land mass stay in the frame (Hokkaido, Borneo,
  // Crete); ones farther out (Hawaii, Svalbard, the Azores, the Canaries) do not.
  return { type: 'MultiPolygon', coordinates: geom.coordinates.filter(p => touches(box(p), main, 5)) };
}

function outlineMap(o) {
  const W = 880, H = o.height || 420;
  const pts = o.points || [];
  const focus = (o.shapes || []).filter(Boolean);
  // A country's far-flung islands (the Aleutians, Tokelau, the Dutch Caribbean) zoomed its map
  // out to half the world. The frame is set by the country's large land masses and its sites;
  // small islands are still drawn when they fall inside it.
  const raw = boundsOf(focus.map(s => ({ ...s, geom: mainLand(s.geom) })), pts);
  if (!raw) return '';
  const b = padBox(raw, 0.12);
  const L = raw.dateline ? (lng => lng < 0 ? lng + 360 : lng) : (lng => lng);

  // Equirectangular here: Mercator stretches the poles into nonsense at world scale.
  const kx = Math.cos((b[1] + b[3]) / 2 * Math.PI / 180) || 1;
  const spanX = (b[2] - b[0]) * kx, spanY = b[3] - b[1];
  const scale = Math.min(W / spanX, H / spanY);
  const offX = (W - spanX * scale) / 2, offY = (H - spanY * scale) / 2;
  const px = lng => offX + (L(lng) - b[0]) * kx * scale;
  const py = lat => offY + (b[3] - lat) * scale;

  const focusNames = new Set(focus.map(s => s.name).filter(Boolean));
  let land = '', borders = '';
  worldOutline().forEach(c => {
    if (!touches(c.bbox, [b[0], b[1], b[2], b[3]], 1)) return;
    const d = pathFor(c.geom, px, py);
    if (!d) return;
    const isFocus = focusNames.has(c.name);
    land += '<path d="' + d + '" fill="' + (isFocus ? '#ded7c4' : '#e7e2d4')
      + '" stroke="#c2bba7" stroke-width="' + (isFocus ? 1.2 : 0.6) + '" stroke-linejoin="round"/>';
  });

  let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img"'
    + ' aria-label="' + esc(o.alt || 'Map') + '" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="' + W + '" height="' + H + '" fill="#f2efe6"/>'
    + land + borders + drawDots(pts, px, py) + '</svg>';

  return '<div class="g-stage plain" style="aspect-ratio:' + W + '/' + H + '">' + svg
    + '<div class="w-cap"><span>' + esc(o.note || '') + '</span>'
    + '<span>Boundaries: Natural Earth</span></div></div>';
}

// Zoom on the map link maps onto the globe camera height the homepage uses.
const altForZoom = z => Math.max(0.008, Math.min(3.2, 0.012 * Math.pow(1.6, 16 - z)));

const focusUrl = (lat, lng, z) => '/globe/?focus=' + lat.toFixed(4) + ',' + lng.toFixed(4) + ',' + z;

function mapBlock(o) {
  const inner = o.mode === 'outline' ? outlineMap(o) : satelliteMap(o);
  if (!inner) return '';
  const pts = o.points || [];
  const keys = [];
  if (pts.some(p => !p.stopped)) keys.push(['tracked', 'Tracked project']);
  if (pts.some(p => p.stopped)) keys.push(['stopped', 'Stopped or paused']);
  if (pts.some(p => p.mw)) keys.push(['size', 'Bigger dot, more power']);
  return '<figure class="g-map">' + inner
    + '<figcaption class="g-mapfoot">'
    + keys.map(k => '<span class="g-key"><i class="' + k[0] + '"></i>' + esc(k[1]) + '</span>').join('')
    + '<span style="margin-left:auto">' + esc(o.count || '') + '</span></figcaption></figure>';
}

// ---------------------------------------------------------------- satellite view

// The single site view on a project page. Same percentage layout as the maps above, so the
// tiles fill the box at every width with no strip left over at the edge.
function satBlock(lat, lng, z, exact, caption, extraClass) {
  const W = 880, H = 420;
  const world = TILE * Math.pow(2, z);
  const cx = mercX(lng) * world, cy = mercY(lat) * world;
  const left = cx - W / 2, top = cy - H / 2;
  const n = Math.pow(2, z);
  const tw = (TILE / W * 100).toFixed(4), th = (TILE / H * 100).toFixed(4);
  let imgs = '';
  for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + H) / TILE); ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + W) / TILE); tx++) {
      const wx = ((tx % n) + n) % n;
      imgs += '<img alt="" loading="lazy" src="' + ESRI + z + '/' + ty + '/' + wx + '"'
        + ' style="left:' + ((tx * TILE - left) / W * 100).toFixed(4) + '%;top:'
        + ((ty * TILE - top) / H * 100).toFixed(4) + '%;width:' + tw + '%;height:' + th + '%">';
    }
  }
  return '<div class="g-stage' + (extraClass ? ' ' + extraClass : '') + '" style="aspect-ratio:'
    + W + '/' + H + '"><div class="g-tiles">' + imgs + '</div>'
    + '<i class="g-pin"></i>'
    + '<div class="w-cap"><span>' + esc(caption) + '</span><span>Imagery: Esri, Maxar</span></div></div>';
}

// ---------------------------------------------------------------- shared blocks

function mwCell(mw) { return mw ? num(mw) + ' MW' : 'Not reported'; }

// Off site links say so, so nobody is surprised by where they land.
const offSite = (href, label) => '<a href="' + esc(href) + '" target="_blank" rel="noopener">'
  + esc(label) + ' <span class="g-off">off site</span> &#8599;</a>';

// The project name in the first cell is already the link to its page, so a second link
// saying "Details" in the last cell only repeats it. Checked across every generated table
// before this was removed: 2,725 rows carried both and every one pointed at the same page.
// A project with no page of its own has no link in its name, so it keeps the source link
// here, which is the only way out of that row.
function detailCell(r) {
  if (r.page) return '';
  const s = sourceLinks(r.p)[0];
  return s ? offSite(s, 'Source') : '';
}

// Where a project leads, in order: its own page; the county page that lists it; its region or
// country page; and when the reader is already on that page, the story it rests on, else the
// spot on the globe. Nothing that names a project is left unclickable.
function projectTarget(r, here) {
  const first = [r.page, r.county && regionWorthAPage(r.country, r.region) ? countyUrl(r.country, r.region, r.county) : null];
  for (const u of first) if (u && u !== here) return { url: u };
  const src0 = sourceLinks(r.p)[0];
  if (src0) return { url: src0, out: true };
  const cands = [
    r.region && tree[r.country] && tree[r.country].regions[r.region] && regionWorthAPage(r.country, r.region) ? regionUrl(r.country, r.region) : null,
    tree[r.country] ? countryUrl(r.country) : null];
  for (const u of cands) if (u && u !== here) return { url: u };
  const src = sourceLinks(r.p)[0];
  if (src) return { url: src, out: true };
  if (r.lat != null && r.lng != null) return { url: focusUrl(r.lat, r.lng, r.exact ? 15 : 12) };
  return null;
}
function rowLink(r, here) { const t = projectTarget(r, here); return t && !t.out ? t.url : null; }
// projectTarget order: own page, county page, source story, region, country, globe spot.

function projectTable(list, here) {
  if (!list.length) return '';
  const rows = list.slice().sort((a, b) => (b.mw || 0) - (a.mw || 0) || a.name.localeCompare(b.name)).map(r => `<tr>
<td class="pl">${rowLink(r, here) ? `<a href="${esc(rowLink(r, here))}">${esc(r.name)}</a>` : sourceLinks(r.p)[0] ? `<a href="${esc(sourceLinks(r.p)[0])}" target="_blank" rel="noopener">${esc(r.name)}</a>` : esc(r.name)}${r.town ? `<small>${esc(r.town)}</small>` : ''}${r.exact ? '' : '<small>Exact site not confirmed</small>'}</td>
<td data-l="Company">${r.dev && companyUrl(r.dev) ? `<a href="${esc(companyUrl(r.dev))}">${esc(r.dev)}</a>` : esc(r.dev || 'Not reported')}</td>
<td data-l="Status"><span class="g-pill ${r.bucket}">${esc(r.status)}</span></td>
<td class="nw" data-l="Power">${esc(mwCell(r.mw))}</td>
<td>${detailCell(r)}</td></tr>`).join('');
  return `<table class="w-tbl"><thead><tr><th>Project</th><th>Company</th><th>Status</th><th>Power</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

// The same drill-down the wins page uses: a place, then the table inside it.
const TABLE_CAP = 250;

function drilldown(groups, openAll, withTables, here) {
  let keys = Object.keys(groups).sort((a, b) => groups[b].list.length - groups[a].list.length || a.localeCompare(b));
  // When the tables are off, only places with no page of their own are listed here. Every
  // other project is one click away through the index of places above.
  if (withTables === false) keys = keys.filter(k => !groups[k].url);
  if (!keys.length) return '';
  const open = openAll || keys.length <= 6;
  return '<div class="w-tree">' + keys.map(k => {
    const g = groups[k];
    return `<details class="w-c"${open ? ' open' : ''}><summary><span class="w-nm">${g.url ? esc(k) : esc(k)}</span><span class="w-n">${g.list.length}</span></summary>${projectTable(g.list, here)}${g.url ? `<p class="w-note" style="margin-left:22px"><a href="${esc(g.url)}">Open the ${esc(k)} page</a></p>` : ''}</details>`;
  }).join('') + '</div>';
}

const ROW_CAP = 40;

function moreLine(total, shown, href, what) {
  if (total <= shown) return '';
  return '<p class="w-note">Showing the ' + shown + ' most recent of ' + num(total) + '. '
    + '<a href="' + href + '">See them all in the ' + what + '</a>.</p>';
}

// Wins carry the id of the project they belong to, so most of them have a page here. Where
// one exists the place name itself is the link, and there is no reason to send a reader off
// site for the story: the page carries it, with every source. Only a win with no page of its
// own keeps the outside link.
function winPage(w) {
  const r = w.id ? RECORD_BY_ID[w.id] : null;
  return r && r.page ? r.page : null;
}
function winLink(w) {
  return winPage(w) || (w._fips && FIPS_URL[w._fips]) || null;
}
function winPlaceCell(w) {
  const page = winLink(w);
  const name = page ? '<a href="' + esc(page) + '">' + esc(w.place) + '</a>'
    : w.src ? '<a href="' + esc(w.src) + '" target="_blank" rel="noopener">' + esc(w.place) + '</a>' : esc(w.place);
  return '<td class="pl">' + name + (w.dev ? '<small>' + esc(w.dev) + '</small>' : '') + '</td>';
}
function winCell(w) {
  if (winPage(w)) return '';
  return w.src ? offSite(w.src, 'Story') : '';
}

function winsTable(list) {
  if (!list.length) return '';
  const all = list.length;
  list = list.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, ROW_CAP);
  const rows = list.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).map(w => `<tr>
${winPlaceCell(w)}
<td data-l="What happened"><span class="w-tag">${esc(WIN_LABEL[w.type] || w.type)}</span> ${esc(sentence(w.how))}</td>
<td class="nw" data-l="Date">${esc(fdate(w.date) || 'Not reported')}</td>
<td data-l="Size">${esc(w.size || 'Not reported')}</td>
<td>${winCell(w)}</td></tr>`).join('');
  return `<table class="w-tbl"><thead><tr><th>Place</th><th>What happened</th><th>Date</th><th>Size</th><th></th></tr></thead><tbody>${rows}</tbody></table>` + moreLine(all, list.length, '/wins', 'wins list');
}

// The page a ban belongs to: its county's page, or its state's for a statewide rule. Never the
// page the table sits on.
function morPage(m) {
  if (m.level === 'state' && tree[m.country] && tree[m.country].regions[m.state] && regionWorthAPage(m.country, m.state)) return regionUrl(m.country, m.state);
  return m._fips && FIPS_URL[m._fips] ? FIPS_URL[m._fips] : null;
}

function morsTable(list, here) {
  if (!list.length) return '';
  const all = list.length;
  list = list.slice().sort(function (a, b) { return String(b.start).localeCompare(String(a.start)); }).slice(0, ROW_CAP);
  const rows = list.slice().sort((a, b) => String(b.start).localeCompare(String(a.start))).map(m => `<tr>
<td class="pl">${morPage(m) && morPage(m) !== here ? `<a href="${esc(morPage(m))}">${esc(m.name)}</a>` : m.src ? `<a href="${esc(m.src)}" target="_blank" rel="noopener">${esc(m.name)}</a>` : esc(m.name)}<small>${esc(morLevelLabel(m))}</small></td>
<td data-l="Type"><span class="w-tag${m.status === 'Proposed' || m._ended ? ' soft' : ''}">${esc(m.status === 'Proposed' ? 'Proposed' : m._ended ? 'Ended' : m.type)}</span></td>
<td class="nw" data-l="Started">${esc(fdate(m.start) || 'Not reported')}</td>
<td class="nw" data-l="Ends">${esc(fdate(m.end) || 'No end date')}</td>
<td>${m.src ? offSite(m.src, 'Record') : ''}</td></tr>`).join('');
  return `<table class="w-tbl"><thead><tr><th>Place</th><th>Type</th><th>Started</th><th>Ends</th><th></th></tr></thead><tbody>${rows}</tbody></table>` + moreLine(all, list.length, '/wins#moratoriums', 'moratorium tracker');
}

function section(title, lede, inner, id) {
  if (!inner) return '';
  return `<section class="g-sec"${id ? ` id="${esc(id)}"` : ''}><h2>${esc(title)}</h2>${lede ? `<p class="g-lede">${esc(lede)}</p>` : ''}${inner}</section>`;
}

function counts(list) {
  const c = { live: 0, operating: 0, stopped: 0, unknown: 0 };
  list.forEach(r => c[r.bucket]++);
  // Megawatts belonging to projects that were cancelled, blocked or withdrawn are NOT capacity
  // coming to a place, and putting them in the headline figure tells a reader the opposite of
  // what happened. Lane f found counties that DEFEATED a campus still advertising its megawatts
  // as their own, and lane h found single projects listed twice, doubling the figure again.
  const mw = list.reduce((a, r) => a + (r.bucket === 'stopped' ? 0 : (r.mw || 0)), 0);
  return { ...c, mw, total: list.length };
}

// The stat row used to imply the whole page. Loudoun County said "49 tracked" and "257 MW"
// when only 20 of the 49 had a stage on record and the 257 MW came off 2 of them, with nothing
// on the page saying so. Both are now labelled for what they actually cover.
// A place report shows its first two paragraphs; the rest folds under "Read more". The text
// stays in the page, so search engines read all of it, but a reader is not handed a wall.
function reportParas(paragraphs, url, linkedHere) {
  const p = (t, i) => '<p class="g-body"' + (i === 0 ? ' id="summary"' : '') + '>' + linkify(esc(t), url, linkedHere) + '</p>';
  const shown = paragraphs.slice(0, 2).map(p).join('');
  const rest = paragraphs.slice(2);
  if (rest.length < 2) return paragraphs.map(p).join('');
  return shown + '<details class="g-more"><summary>Read more</summary>' + rest.map((t, i) => p(t, i + 2)).join('') + '</details>';
}

function statsFor(list, extra) {
  const c = counts(list);
  // The denominator has to count the same projects the megawatt total does, or the line reads
  // "70 MW reported by 1 of 6" on a page where five of the six are cancelled.
  const live = list.filter(r => r.bucket !== 'stopped');
  const sized = live.filter(r => r.mw > 0).length;
  const out = [[num(c.total), c.total === 1 ? 'project tracked' : 'projects tracked', '#projects']];
  if (c.live) out.push([num(c.live), 'proposed or being built', '#projects']);
  if (c.operating) out.push([num(c.operating), 'operating', '#projects']);
  if (c.stopped) out.push([num(c.stopped), 'stopped or paused', '#projects']);
  if (c.unknown) out.push([num(c.unknown), c.unknown === 1 ? 'with no stage on record' : 'with no stage on record', '#projects']);
  if (c.mw) {
    out.push([num(Math.round(c.mw)) + ' MW',
      // Stopped projects are left out of the total, so the line says "active" rather than
      // implying the figures of cancelled projects on the same page were missed.
      live.length === 1 ? 'reported'
        : sized === live.length ? 'across all ' + live.length + ' active projects'
        : 'from the ' + (sized === 1 ? 'one active project' : sized + ' active projects') + ' that '
          + (sized === 1 ? 'reports' : 'report') + ' a figure']);
  } else if (live.length) {
    // Only stopped projects carry a figure here (or none do): say so plainly rather than
    // "None reports a capacity" above a table showing 1,000 MW.
    out.push(['No', 'power figure reported for active projects']);
  }
  (extra || []).forEach(e => out.push(e));
  return statHtml(out);
}

function centreOf(list) {
  if (!list.length) return null;
  let la = 0, lo = 0;
  list.forEach(r => { la += r.lat; lo += r.lng; });
  return { lat: la / list.length, lng: lo / list.length };
}

// Clarity showed the dots were the most clicked thing on every place page, and none of them
// went anywhere. Each dot now opens its project, or the county page that lists it when the
// project has no page of its own. A dot never links to the page it is drawn on.
const pointsOf = (list, here) => list.map(r => ({
  lat: r.lat, lng: r.lng, mw: r.mw, exact: r.exact,
  url: (function () { const t = projectTarget(r, here); return t ? t.url : null; })(),
  stopped: r.bucket === 'stopped',
  title: r.name + ' (' + r.status + (r.mw ? ', ' + num(r.mw) + ' MW' : '') + ')'
}));

const SOURCE_FOOT = 'Every project above is drawn from public records, filings and local reporting. Each row links to what it is based on. Statuses change, so check the source date before you rely on one. Found something wrong? Write to james@floridadatacenters.org and it gets fixed.';

// ---------------------------------------------------------------- opening prose
//
// County, state and country pages used to open on one line that was the same on every one of
// them ("Every site we can document in X, mapped and sourced, with the towns they sit in"), and
// then say nothing else: a median county page was 181 words, all of it headings, stat boxes and
// table cells.
//
// What replaces it is not a template with the numbers swapped. The thing that makes a page read
// as though someone wrote it is that the character of a place is already written down, in the
// stories of the projects that sit there. Sentences like "there is no denser concentration of
// data centers anywhere" or "data centers supplied 38 percent of Loudoun County's general fund
// revenue" are about the county, not about a building, and they are already sourced. So the
// opening is chosen, not assembled: whatever is the strongest fact this page holds leads, and
// the rest follows in the order a person who lives there would care about it.
//
//   1. what just changed, or is about to: a vote, a pause, a withdrawal, with its date
//   2. what the place is: the density, the money, the water, the air
//   3. what is pending right now, and where
//   4. who is building it
//   5. what the record does not know, said plainly
//
// A place where none of that exists gets one or two honest sentences and stops. It is never
// padded out to the length of a busy one.

// ---- material off the project stories -----------------------------------------------------

// Sentences in a page's own projects that are about the place rather than about one building.
const RESIDENT_WORDS = /\b(water|groundwater|aquifer|reservoir|wells?|drought|electricity|power|ratepayers?|rates|bills?|noise|air quality|emissions|traffic|schools?|parks?|taxes?|revenue|general fund|farmland|jobs)\b/i;
const SUPERLATIVE = /\b(no denser|densest|more (data centers|of them) than any|largest concentration|the most|first in)\b/i;
const FIGURE = /\b\d+(\.\d+)?\s?(per ?cent|%)|\$\s?\d/;
const ABOUT_A_BUILDING = /^(The building|The site|The campus|It |This )|^\d|\b(Drive|Road|Street|Lane|Boulevard|Avenue|Way|Parkway)\b/;

// "the heart of what the industry calls Data Center Alley"
const NICKNAME = /what (?:the industry|locals|residents|the [A-Za-z ]+) calls? ([A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*){0,3})/;

// A company's own line about itself is not what this place is. "Amazon said it looks forward to
// working with the county and noted it has paid more than $2.1 billion in property taxes" is the
// applicant talking, and it outscored the county's own budget figure until this was added.
// Boosterism, whether it comes from the applicant or from a governor cutting the ribbon. A
// quote calling somewhere "the data center capital of the world" is a press release, not what
// the place is, and it was leading the Virginia page until this caught it.
const COMPANY_VOICE = /\b(looks? forward to|committed to|proud|welcomes?|is excited|thrilled|delighted|honou?red|capital of the world|selected [A-Z][a-z]+ [A-Z][a-z]+ as the site|spokes(person|man|woman)|a company statement|the company said|in a statement)\b/i;
const OFFICIAL_VOICE = /\b(county|residents?|officials?|commissioners?|supervisors?|council|board|neighbou?rs|opponents?|campaigners?)\b/i;
// A company's intentions. A place page says what the place is, not what an applicant hopes to do.
const COMPANY_PLAN = /\b(plans? to|planned to|planning to|intends? to|expects? to|plans for|will (invest|spend|build)|would (invest|spend|build)|to invest|plans a)\b/i;

// A deal is a thing that happened to one parcel, not a description of the county. "George
// Washington University sold its Ashburn campus to Amazon Data Services, in a sale of $427.3
// million" is true and worth reading on that project's page, but it is not what Virginia is.
const TRANSACTION = /\b(sold|bought|acquired|acquisition|purchase[ds]?|in a (sale|deal)|the sale of|changed hands|leases?|leased|signed (a|an) (deal|agreement|lease)|closed on)\b/i;

// What the place is actually like to live in: how much of it there is, what it draws, what it
// pays for, what it costs the people next to it. These are the sentences worth opening on.
const CONDITION = /\b(per ?cent|%|general fund|revenue|tax base|water|groundwater|aquifer|drought|electricity|grid|power|ratepayers?|bills?|emissions|air quality|noise|traffic|schools?|parks?|farmland|wells?|residents?|neighbou?rs)\b/i;

// A dated decision out of a page's own stories: the vote, the refusal, the withdrawal, the
// pause. This is what a person who lives there wants at the top, above anything else here.
const DECISION = /\b(voted|approved|denied|rejected|refused|withdrew|withdrawn|blocked|paused|pausing|adopted|ordered|overturned|scrapped|dropped|passed)\b/i;
const MONTHS_RX = 'January|February|March|April|May|June|July|August|September|October|November|December';
const FULL_DATE = new RegExp('\\b(' + MONTHS_RX + ')\\s+(\\d{1,2}),\\s+(20\\d{2})\\b');

function placeEvents(list, placeNames) {
  const names = placeNames.filter(Boolean).map(n => String(n).replace(/ (County|Parish|Borough)$/i, ''));
  if (!names.length) return [];
  const namesRx = new RegExp('\\b(' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b');
  const out = [];
  const MON_LIST = MONTHS_RX.split('|');
  list.forEach(r => {
    const d = DESCRIPTIONS[r.id];
    if (!d || !d.sentences) return;
    d.sentences.forEach(sn => {
      const t = clean(sn.t);
      if (!t || t.length < 50 || t.length > 245) return;
      const m = FULL_DATE.exec(t);
      if (!m || !DECISION.test(t)) return;
      if (!namesRx.test(t)) return;
      if (COMPANY_VOICE.test(t)) return;
      const iso = m[3] + '-' + String(MON_LIST.indexOf(m[1]) + 1).padStart(2, '0')
        + '-' + String(+m[2]).padStart(2, '0');
      out.push({ date: iso, text: t, at: r.county || r.town || r.region || '' });
    });
  });
  out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  // one per story, so a fact repeated across two projects is not said twice
  const seen = {};
  return out.filter(e => { const k = e.text.slice(0, 60); if (seen[k]) return false; seen[k] = 1; return true; });
}

function placeCharacter(list, placeNames) {
  const names = placeNames.filter(Boolean).map(n => String(n).replace(/ (County|Parish|Borough)$/i, ''));
  const namesRx = names.length ? new RegExp('\\b(' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b') : null;
  let best = null, nickname = '';
  list.forEach(r => {
    const d = DESCRIPTIONS[r.id];
    if (!d || !d.sentences) return;
    d.sentences.forEach(s => {
      const t = clean(s.t);
      if (!t || t.length < 50 || t.length > 235) return;
      const nm = NICKNAME.exec(t);
      if (nm && namesRx && namesRx.test(t) && !nickname) nickname = nm[1];
      if (!namesRx || !namesRx.test(t)) return;
      if (ABOUT_A_BUILDING.test(t)) return;
      let score = 0;
      if (FIGURE.test(t)) score += 4;
      if (SUPERLATIVE.test(t)) score += 4;
      if (RESIDENT_WORDS.test(t)) score += 2;
      if (OFFICIAL_VOICE.test(t)) score += 2;
      if (/"/.test(t)) score += 2;
      // the applicant's own line about itself is not what the place is
      if (CONDITION.test(t)) score += 3;
      if (COMPANY_VOICE.test(t)) score -= 8;
      // What a company intends to spend is its plan, not a description of the place. This is
      // what put "Amazon told Virginia officials it planned to invest up to $6 billion" at the
      // top of the Virginia page.
      if (COMPANY_PLAN.test(t)) score -= 8;
      // A sale or a lease is one parcel changing hands, not the county's condition.
      if (TRANSACTION.test(t)) score -= 7;
      if (/\bannounced\b/.test(t) && /\$\s?\d/.test(t)) score -= 5;
      if (/^[A-Z][A-Za-z.& -]{2,28} (said|says|announced|noted|confirmed)\b/.test(t)) score -= 4;
      if (score < 5) return;
      if (!best || score > best.score) best = { score, text: t, id: r.id };
    });
  });
  return { sentence: best ? best.text : '', nickname };
}

// The body that actually votes on these applications, taken from the page's own stories where
// one is named there, and otherwise from what the state calls it. Where neither is known the
// sentence names the place instead of guessing at a title.
const BODY_RX = /\b((?:[A-Z][A-Za-z.'-]+ ){1,3}(?:Board of Supervisors|Board of County Commissioners|County Commissioners?|County Commission|County Council|Borough Assembly|Parish Council))\b/;
const STATE_BODY = {
  Virginia: 'Board of Supervisors', California: 'Board of Supervisors', Mississippi: 'Board of Supervisors',
  Iowa: 'Board of Supervisors', Wisconsin: 'Board of Supervisors', Arizona: 'Board of Supervisors',
  Louisiana: 'Parish Council', Alaska: 'Borough Assembly'
};

function governingBody(list, cy, rg) {
  for (const r of list) {
    const d = DESCRIPTIONS[r.id];
    if (!d || !d.sentences) continue;
    for (const s of d.sentences) {
      const m = BODY_RX.exec(clean(s.t));
      if (m && cy && m[1].indexOf(String(cy).replace(/ (County|Parish|Borough)$/i, '')) === 0) return m[1];
    }
  }
  if (cy && STATE_BODY[rg]) {
    // "Ascension Parish" + "Parish Council" read as "Ascension Parish Parish Council", and
    // Alaska's boroughs did the same. Drop the noun from the place name when the body already
    // starts with it.
    const body = STATE_BODY[rg];
    const lead = /^(County|Parish|Borough)/i.test(body);
    return (lead ? String(cy).replace(/ (County|Parish|Borough)$/i, '') : cy) + ' ' + body;
  }
  if (cy) return cy + ' commissioners';
  return '';
}

function devsIn(list) {
  const by = {};
  list.forEach(r => {
    const n = (r.dev || '').trim();
    if (!n || NOT_A_COMPANY.test(n)) return;
    (by[n] = by[n] || []).push(r);
  });
  return Object.keys(by).sort((a, b) => by[b].length - by[a].length || a.localeCompare(b))
    .map(n => ({ name: n, n: by[n].length }));
}

function biggestOf(list) {
  const sized = list.filter(r => r.mw > 0);
  return sized.length ? sized.slice().sort((a, b) => b.mw - a.mw || a.name.localeCompare(b.name))[0] : null;
}

function townsIn(list) {
  const by = {};
  list.forEach(r => { if (r.town) (by[r.town] = by[r.town] || []).push(r); });
  return Object.keys(by).sort((a, b) => by[b].length - by[a].length || a.localeCompare(b))
    .map(t => ({ name: t, n: by[t].length }));
}

const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

function monthYear(d) {
  const m = /^(\d{4})-(\d{2})/.exec(String(d || ''));
  return m ? MON[+m[2] - 1] + ' ' + m[1] : (d || '');
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

// Inside a sentence, under ten is spelled out and ten or more is a figure. At the start of a
// sentence a figure is wrong at any size, so spellOut covers everything up to ninety-nine;
// past that the call site recasts the sentence rather than writing "one hundred and ninety-five".
const word = n => (n >= 0 && n < 10 ? WORDS[n] : num(n));
const Word = n => { const w = word(n); return w.charAt(0).toUpperCase() + w.slice(1); };

function spellOut(n) {
  if (n < 0 || n !== Math.floor(n)) return num(n);
  if (n < 20) return WORDS[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + WORDS[n % 10] : '');
  return '';                                    // too long to read; the caller rewrites instead
}
const Spell = n => { const w = spellOut(n); return w ? w.charAt(0).toUpperCase() + w.slice(1) : ''; };

// wins.json writes "how" as a clause with its subject often reduced to "The city council" or
// "National planning appeals board", which reads as a fragment once it is lifted away from the
// row that says where it happened. The row carries place and state, so the subject goes back.
function winClause(w) {
  let h = clean(w.how || '').replace(/\s*[.;]\s*$/, '');
  if (!h) return '';
  const place = clean(w.place || '');
  if (place && h.indexOf(place) < 0) {
    h = h
      .replace(/^The (city|town|village|county|borough|parish) council\b/i, place + "'s $1 council")
      .replace(/^The council\b/i, place + "'s council")
      .replace(/^(National|The national) ([a-z])/, 'The national $2')
      .replace(/^(City|County|Town) (council|commission|commissioners)\b/i, place + ' $1 $2');
  }
  if (/^[A-Z][a-z]+ [a-z]/.test(h) && !/^[A-Z][a-z]+'s/.test(h)) h = 'the ' + h.charAt(0).toLowerCase() + h.slice(1);
  return h;
}

// Embedded mid sentence a clause starts lower case, unless it opens on a name or an acronym.
function lower1(t) {
  if (!t) return t;
  const first = (t.split(/\s+/)[0] || '');
  // "Ireland's planning appeals body" opens on a proper noun, apostrophe and all
  if (/^[A-Z][a-z]+['’]s$/.test(first)) return t;
  if (first.length > 1 && first === first.toUpperCase()) return t;
  const second = (t.split(/\s+/)[1] || '');
  if (/^[A-Z][a-z]+$/.test(first) && /^[A-Z]/.test(second)) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

const MON_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
// Tables want "Jun 15, 2026". Running prose wants the month written out.
function longDate(d) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(d || ''));
  if (!m) return fdate(d);
  return MON_FULL[+m[2] - 1] + (m[3] ? ' ' + (+m[3]) : '') + ', ' + m[1];
}

function morPhrase(m) {
  const kind = /ban/i.test(m.type || '') ? 'ban' : 'moratorium';
  if (m.start && m.end) return 'a ' + kind + ' running from ' + longDate(m.start) + ' to ' + longDate(m.end);
  if (m.start) return 'a ' + kind + ' in force since ' + longDate(m.start);
  if (m.end) return 'a ' + kind + ' running until ' + longDate(m.end);
  return 'an undated ' + kind;
}

// wins.json also carries zoning limits, which say where a data center may go rather than
// stopping new ones, and two rows typed "Other", one of which says in its own notes that it is
// not a ban. Only the first two belong under the moratorium label.
const isRealMor = m => /^(moratorium|ban)$/i.test(String(m.type || '').trim());

// ---- the paragraph --------------------------------------------------------------------------
//
// o = { name, cy, rg, list, mors, propMors, zoning, wins, kids: {label, plural, groups} }
function placeProse(o) {
  const list = o.list, name = o.name, shortName = o.shortName || o.name;
  const c = counts(list);
  const wins = (o.wins || []).slice().sort(byDateDesc);
  const mors = (o.mors || []).filter(isRealMor);
  const proposed = (o.propMors || []).filter(isRealMor);
  const zoning = (o.zoning || []).length;
  const devs = devsIn(list);
  const towns = townsIn(list);
  const big = biggestOf(list);
  const sized = list.filter(r => r.mw > 0).length;
  const noStatus = list.filter(r => r.bucket === 'unknown').length;
  const ch = placeCharacter(list, [o.cy, o.rg, name]);
  const events = placeEvents(list, [o.cy, o.rg, name]);

  const kidGroups = o.kids && o.kids.groups ? o.kids.groups : null;
  const kidKeys = kidGroups
    ? Object.keys(kidGroups).sort((a, b) => kidGroups[b].length - kidGroups[a].length || a.localeCompare(b))
    : [];

  // ---- the pieces this page could say, each written once ----
  const piece = {};

  if (wins.length && winClause(wins[0])) {
    const w = wins[0];
    piece.changed = wins.length >= 3
      ? 'People in ' + name + ' have stopped ' + word(wins.length) + ' data center '
        + (wins.length === 1 ? 'project' : 'projects') + ', most recently in '
        + monthYear(w.date) + ', when ' + lower1(winClause(w)) + '.'
      : (o.wide
          ? 'The most recent decision on record anywhere in ' + name + ' came in ' + monthYear(w.date)
            + ': ' + lower1(winClause(w)) + '.'
          : 'In ' + monthYear(w.date) + ' ' + lower1(winClause(w)) + '.');
  }
  if (mors.length) {
    piece.pause = name + ' has ' + morPhrase(mors[0]) + '.'
      + (mors[0].notes ? ' ' + sentence(clean(mors[0].notes)) : '');
  } else if (proposed.length) {
    piece.pause = 'A pause on new data center applications has been proposed in ' + name
      + ' but is not yet in force.';
  }
  if (ch.sentence) piece.character = ch.sentence;
  // a dated decision out of the stories beats wins.json, because it says who decided and what
  if (events.length) {
    const e = events[0];
    // On a parent page the same sentence is also the opening of the child page it came from.
    // Naming the place it happened both separates them and is what a reader of a state page
    // needs anyway.
    piece.changed = o.wide
      ? 'The most recent decision on record anywhere in ' + name + ' came in ' + monthYear(e.date)
        + (e.at && e.text.indexOf(e.at) < 0 ? ', in ' + e.at : '') + ': ' + lower1(e.text)
      : e.text;
    // the lead already describes the pause vote, so do not say it again in the next breath
    if (/paus(e|ing)|moratorium|ban\b/i.test(piece.changed)) delete piece.pause;
  }

  if (c.live) {
    const liveList = list.filter(r => r.bucket === 'live');
    piece.pending = liveList.length <= 2
      ? (liveList.length === 1 ? 'One project in ' + shortName + ' is live right now: '
                                : 'Two projects in ' + shortName + ' are live right now: ')
        + listOf(liveList.map(r => r.name + (r.town ? ' at ' + r.town : ''))) + '.'
      : (Spell(c.live) ? Spell(c.live) + ' projects in ' + shortName + ' are proposed or under construction'
          : 'There are ' + num(c.live) + ' projects in ' + shortName + ' proposed or under construction')
        + (towns.length > 1 ? ', most of them around ' + listOf(towns.slice(0, 2).map(t => t.name)) : '') + '.';
  }

  if (kidKeys.length > 1) {
    piece.spread = 'They are spread across ' + word(kidKeys.length) + ' '
      + (kidKeys.length === 1 ? o.kids.label : (o.kids.plural || o.kids.label + 's'))
      + ', concentrated in ' + listOf(kidKeys.slice(0, 3).map(k => k + ' (' + kidGroups[k].length + ')')) + '.';
  } else if (towns.length > 1) {
    const shown = towns.slice(0, 3).map(t => t.n > 1 ? t.name + ' (' + t.n + ')' : t.name);
    if (towns.length > 3) shown.push(word(towns.length - 3) + (towns.length - 3 === 1 ? ' other place' : ' other places'));
    piece.spread = 'They sit in ' + listOf(shown) + '.';
  } else if (towns.length === 1 && c.total > 1) {
    piece.spread = 'All ' + word(c.total) + ' are at ' + towns[0].name + '.';
  }

  if (devs.length === 1 && devs[0].n === c.total && c.total > 1) piece.who = devs[0].name + ' is behind every one of them.';
  else if (devs.length >= 2) piece.who = 'The companies building here include ' + listOf(devs.slice(0, 3).map(d => d.name)) + '.';

  if (big && (big.mw >= 100 || c.mw >= 500)) {
    piece.gaps = sized === 1
      ? big.name + ' is the only one with a capacity on record, at ' + num(big.mw) + ' MW.'
      : 'Only ' + word(sized) + ' of the ' + c.total + ' report a capacity at all, adding up to '
        + num(Math.round(c.mw)) + ' MW, the biggest being ' + big.name + ' at ' + num(big.mw) + ' MW.';
  }
  if (noStatus && c.total > 1) {
    piece.unknown = noStatus === c.total
      ? 'None of them carries a stage on record, so none is known to be running, building or stopped.'
      : (Spell(noStatus)
          ? Spell(noStatus) + ' of the ' + c.total + ' carry no stage on record at all.'
          : 'No stage is on record for ' + num(noStatus) + ' of the ' + c.total + '.');
  }

  // ---- the quiet case: say the little there is, and stop ----
  if (!piece.changed && !piece.pause && !piece.character && c.total <= 2) {
    const out = [];
    if (c.total === 1) {
      const r = list[0];
      out.push(r.name + ' is the only data center on record in ' + name + (r.town ? ', at ' + r.town : '') + '.');
      const bits = [];
      if (r.dev && !NOT_A_COMPANY.test(r.dev)) bits.push(r.dev + ' is the developer');
      if (r.bucket !== 'unknown') bits.push('it is recorded as ' + r.status.toLowerCase());
      else bits.push('the record carries no stage for it');
      if (r.mw) bits.push('the record puts it at ' + num(r.mw) + ' MW');
      out.push(sentence(listOf(bits)) + (r.bucket === 'unknown' ? '' : ''));
      out.push('No vote, withdrawal or pause has been recorded here.');
    } else {
      out.push(name + ' has ' + word(c.total) + ' data center ' + (c.total === 1 ? 'project' : 'projects') + ' on record'
        + (towns.length ? ', at ' + listOf(towns.map(t => t.name)) : '') + '.');
      out.push('Nothing has been decided about ' + (c.total === 1 ? 'it' : 'either of them') + ' on the public record here.');
    }
    const text = out.join(' ');
    return { text, meta: out.slice(0, 2).join(' '), quiet: true, character: ch, live: c.live };
  }

  // ---- lead with the strongest thing this page holds, then resident order ----
  const order = ['base', 'changed', 'pause', 'character', 'pending', 'spread', 'who', 'gaps', 'unknown'];
  const strength = { character: ch.score || (ch.sentence ? 6 : 0), changed: 7, pause: 8, pending: 4, spread: 2, who: 2, gaps: 1, unknown: 1 };
  // the character sentence wins the lead when it is a real fact about the place, because that is
  // what tells a reader where they have landed
  // the strongest thing a page holds, in the order a resident would rank it: a decision that
  // has just been taken, then a pause in force, then what the place is, then what is pending
  let lead;
  if (piece.changed && events.length) lead = 'changed';
  else if (piece.pause && /in force since|running from/.test(piece.pause)) lead = 'pause';
  // A character sentence is drawn from one project's story, so a state and the county that
  // project sits in can both pick it and open identically. The more specific page keeps it;
  // the wider one opens on what is pending instead, which is the right emphasis there anyway.
  else if (piece.character && !(o.wide && piece.pending)) lead = 'character';
  else if (o.wide && piece.pending) lead = 'pending';
  else if (piece.changed) lead = 'changed';
  else if (piece.pause) lead = 'pause';
  else if (piece.pending) lead = 'pending';
  else {
    // Nothing has happened and nothing characterises the place, so open on the plain count.
    // "They sit in Lithia Springs and Austell" cannot lead: there is no "they" yet.
    piece.base = name + ' has ' + word(c.total) + ' data center ' + (c.total === 1 ? 'project' : 'projects') + ' on record.';
    lead = 'base';
  }

  const out = [];
  if (piece[lead]) out.push(piece[lead]);
  // fold the industry's own name for the place in behind the lead, where there is one
  if (ch.nickname && out[0].indexOf(ch.nickname) < 0) {
    out.push(name + ' is the heart of what the industry calls ' + ch.nickname + '.');
  }
  order.forEach(k => { if (k !== lead && piece[k]) out.push(piece[k]); });

  const text = out.join(' ');
  let meta = out[0];
  for (let i = 1; i < out.length && meta.length + out[i].length < 158; i++) meta += ' ' + out[i];
  return { text, meta, quiet: false, character: ch, live: c.live };
}

// ---------------------------------------------------------------- the place article
//
// A county, state, country or company page is written the way a reporter would cover that
// place, out of the material already sitting in data/descriptions.json for the projects on it.
// A page with 15 sourced sentences behind it got three of them before this: Boone County was
// 89 words and one of them was Meta's own line about paying the full cost of its energy and
// water, which is the applicant talking, not reporting.
//
// The sentences are gathered, the applicant's own claims are thrown out, what is left is sorted
// into what a person who lives there would want in order, and the page runs as long as the
// material honestly goes. Jackson County, Alabama has no story behind its one project at all,
// so it gets two sentences and stops. Nothing is padded.
//
//   1. what has happened, and when: votes, refusals, withdrawals, a pause and its actual terms
//   2. what is being built, by whom, where, and how big
//   3. what it means for the place: the power, the water, the money, the land
//   4. what people who live there and the officials who decide have said, in their own words
//   5. what is still open, and what the record does not know

// A company's own account of itself. Not the page's voice, at any position on the page.
const APPLICANT_CLAIM = /\b(says? it will|said it would|will pay the full cost|has (also )?pledged|pledged to|is committed to|looks? forward to|we'?re building|we are building|the company (says|said|notes|points out)|according to the company|in a statement|a spokes(person|man|woman))\b/i;
// A quotation from someone speaking for the applicant.
const APPLICANT_SPEAKER = /\b(vice president|chief executive|chief development officer|president of|director of (data ?centers?|supply|development|public affairs)|public affairs manager|spokes(person|man|woman))\b/i;

const QUOTED = /["“]/;
const RESIDENT_SPEAKER = /\b(resident|residents|neighbou?r|organiser|organizer|campaigner|mayor|governor|commissioner|supervisor|councill?or|council member|alderman|alderwoman|attorney|professor|farmer|teacher|pastor|said the crowd|told the (crowd|board|meeting|council|commissioners))\b/i;
const OFFICIAL_ACTION = /\b(voted|approved|denied|rejected|refused|withdrew|withdrawn|adopted|passed|blocked|paused|ordered|granted|filed|sued|appealed|overturned|scrapped)\b/i;
const FORWARD = /\b(expected|scheduled|due to|is set to|will (be )?(decide|vote|come|go)|next month|has not yet|remains? (unknown|open|undecided)|no decision|awaiting|still before)\b/i;
const PLACE_CONDITION = /\b(per ?cent|%|general fund|revenue|tax base|water|groundwater|aquifer|reservoir|drought|wells?|electricity|grid|power|megawatts?|gigawatts?|ratepayers?|bills?|emissions|air quality|noise|traffic|schools?|parks?|farmland|acres|jobs)\b/i;

// ---------------------------------------------------------------- researched place reports
//
// A place page is not assembled out of the write-ups of the projects on it. For a county with
// one project that would reprint that project's own page, which is the thin content problem
// rather than a fix for it. Instead each place is researched the way the projects were: the
// county, state, country or company is searched in the news, the articles are read, and the
// page is written from them. Those write-ups live in data/place-reports.json, keyed by the
// page's url, with the sources they were written from.
//
// A page with no report gets no prose at all.
//
// Every data/place-reports*.json file is read and merged, so that more than one person can be
// researching at the same time without two sessions overwriting each other's work in one file.
// Each writer owns a lane file named for it: place-reports.json, place-reports-b.json and so on.
// Two lanes writing the same url would be duplicated effort rather than a conflict, so the build
// says so instead of silently picking one.
const PLACE_REPORTS = {};
const REPORT_OWNER = {};

// Twelve pages ended up written twice. Lane p read all twenty-four versions side by side and found
// that the depth rule below, which is a reasonable default, gets three of them wrong, because
// DEPTH IS NOT COMPLETENESS. Lane b's Travis County carries the 27 August unanimous council vote
// that lane h's version does not have; lane h has the better water material and one more source,
// so counting publishes the version without the vote. Lane h's Duval identifies the actual
// building on our listing, at 7025 A.C. Skinner Parkway, while lane o's says it could not match
// the listing at all and has more words for saying so.
//
// So where a person has actually compared two versions, that judgement wins over the arithmetic.
// All twelve are listed, not just the three the counting gets wrong, so that a later edit to any
// of them cannot silently flip the winner back.
const JUDGED = {
  // Travis was lane p's clearest example of depth-is-not-completeness: lane b had the 27 August
  // unanimous council vote and lane h did not, but lane h had more sources, so counting published
  // the version missing the vote. Lane o has since MERGED the two into lane h's entry, which now
  // carries the vote, the interim-approval rule, the five council members pushing a ban, Cortex
  // and the Water Forward task force, at 9 sources and 720 words. So the verdict moves with the
  // content: the complete version is lane h's now, and lane b's copy is the redundant one.
  '/data-centers/united-states/texas/travis-county/':         'place-reports-h.json',
  '/data-centers/united-states/illinois/lake-county/':        'place-reports-o.json',
  '/data-centers/united-states/massachusetts/norfolk-county/': 'place-reports-s.json',
  '/data-centers/united-states/texas/kaufman-county/':        'place-reports-s.json',
  '/data-centers/united-states/texas/navarro-county/':        'place-reports-s.json',
  '/data-centers/united-states/texas/lamar-county/':          'place-reports-s.json',
  '/data-centers/united-states/alaska/north-slope/':          'place-reports-n.json',
  '/data-centers/united-states/florida/duval-county/':        'place-reports-h.json',
  '/data-centers/united-states/georgia/rockdale-county/':     'place-reports-j.json',
  '/data-centers/australia/queensland/':                      'place-reports-o.json',
  '/company/sabey-data-centers/':                             'place-reports-b.json',
  '/data-centers/united-states/texas/bastrop-county/':        'place-reports-n.json',
};
fs.readdirSync(path.join(ROOT, 'data'))
  .filter(f => /^place-reports.*\.json$/.test(f)).sort()
  .forEach(f => {
    let part; try { part = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8')); } catch (e) { return; }
    Object.keys(part).forEach(url => {
      const cur = PLACE_REPORTS[url], next = part[url];
      if (cur) {
        // Two lanes wrote the same page. Hand-editing one of the lane files does not hold: the
        // owning lane pushes its own copy again from a stale working tree and the duplicate comes
        // straight back, which happened three times in one evening. So the build decides, and it
        // decides the same way every run: more sources wins, then more words. Whoever did the
        // deeper reporting is published, no matter which file sorted first.
        const score = r => [((r && r.sources) || []).length,
                            ((r && r.paragraphs) || []).reduce((n, t) => n + t.split(/\s+/).length, 0)];
        const a = score(cur), b = score(next);
        // A human verdict only applies when the file it names is actually one of the two in hand.
        const judged = JUDGED[url];
        const byHand = judged && (f === judged || REPORT_OWNER[url] === judged);
        const keepNext = byHand ? f === judged
                                : (b[0] !== a[0] ? b[0] > a[0] : b[1] > a[1]);
        console.log('  ! ' + url + ' is in both ' + REPORT_OWNER[url] + ' and ' + f
                    + ' -- keeping ' + (keepNext ? f : REPORT_OWNER[url])
                    + ' (' + (keepNext ? b : a)[0] + ' sources, ' + (keepNext ? b : a)[1] + ' words'
                    + ' vs ' + (keepNext ? a : b)[0] + '/' + (keepNext ? a : b)[1] + ')'
                    + (byHand ? ' [read and chosen by hand, not by count]' : ''));
        if (!keepNext) return;
      }
      REPORT_OWNER[url] = f;
      PLACE_REPORTS[url] = next;
    });
  });
// Counted by url, not by call: articleFor runs once for the meta description and once for the
// body, so a plain counter reported every researched page twice.
const reportStats = { written: new Set(), fallback: new Set() };

function reportFor(url) {
  const r = PLACE_REPORTS[url];
  if (!r || !Array.isArray(r.paragraphs) || !r.paragraphs.length) { reportStats.fallback.add(url); return null; }
  reportStats.written.add(url);
  // The paragraphs are published as they were written. Taking the first sentence out to use as a
  // subtitle cut every opening paragraph in half and left a two sentence stub behind it, which is
  // not a lede, it is damage. A page can carry an explicit one line dek; otherwise the h1 stands
  // on its own and the article starts where it starts.
  const paras = r.paragraphs.map(clean).filter(Boolean);
  return {
    sub: clean(r.dek || ''),
    paragraphs: paras,
    meta: snippet(clean(r.meta || splitSentences(paras[0]).slice(0, 2).join(' '))),
    sources: (r.sources || []).filter(u => /^https?:\/\//.test(u))
  };
}

// The sources a researched page was written from, shown the way a project page shows its own.
function reportSources(rep) {
  if (!rep || !rep.sources.length) return '';
  return section('Where this comes from',
    'The reporting above was written from these. Open one and check it yourself.',
    '<ul class="g-srcs">' + rep.sources.map(function (u) {
      let host = u; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch (e) {}
      return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(host) + '</a></li>';
    }).join('') + '</ul>');
}

// A place page carries researched reporting or it carries no prose at all.
//
// It is never assembled out of the write-ups of the projects sitting on it: for a county with
// one project that reprints that project's own page, which is the thin content problem rather
// than a fix for it. Until a place has been researched and written up in data/place-reports.json
// the page stands on its map, its stat row and its project tables, exactly as it did before, and
// says nothing it cannot source.
//
// The meta description is still built from the record, because that is a search result line
// rather than page copy, and a blank one helps nobody.
function articleFor(o) {
  const written = o.url ? reportFor(o.url) : null;
  if (written) return written;

  const c = counts(o.list);
  const name = o.shortName || o.name;
  return {
    sub: '',
    paragraphs: [],
    meta: 'Every data center project on record in ' + (o.name || name) + ': '
      + plural(c.total, 'site') + ' with status, company, power and sources, plus local wins and moratoriums.',
    sources: []
  };
}

// ---- the company paragraph -------------------------------------------------------------------
function companyProse(name, list, byCountry) {
  const c = counts(list);
  const big = biggestOf(list);
  const countries = Object.keys(byCountry);
  const stopped = list.filter(r => r.bucket === 'stopped');
  const sized = list.filter(r => r.mw > 0).length;
  const noStatus = list.filter(r => r.bucket === 'unknown').length;
  const fought = list.filter(r => {
    const f = r.p && r.p.fractracker;
    return f && String(f.pushback || '').toLowerCase() === 'yes';
  });
  const ranked = countries.slice().sort((x, y) => byCountry[y].list.length - byCountry[x].list.length || x.localeCompare(y));
  const out = [];

  if (stopped.length >= 3) {
    out.push((Spell(stopped.length) || num(stopped.length)) + ' of the ' + c.total + ' sites on record for ' + name
      + ' ' + (stopped.length === 1 ? 'has' : 'have') + ' been stopped, withdrawn or paused.');
  } else if (countries.length === 1) {
    out.push(name + ' builds in one country on this record, ' + countryPhrase(countries[0])
      + ', where ' + plural(c.total, 'site') + ' ' + (c.total === 1 ? 'is' : 'are') + ' tracked.');
  } else {
    out.push(name + ' has ' + plural(c.total, 'site') + ' on record across '
      + plural(countries.length, 'country', 'countries') + ', most of them in '
      + listOf(ranked.slice(0, 3).map(k => countryPhrase(k) + ' (' + byCountry[k].list.length + ')')) + '.');
  }
  if (countries.length > 1 && out[0].indexOf('most of them in') < 0) {
    out.push('The largest counts are in ' + listOf(ranked.slice(0, 3).map(k => countryPhrase(k) + ' (' + byCountry[k].list.length + ')')) + '.');
  }
  if (c.mw && big) {
    out.push('Capacity on record runs to ' + num(Math.round(c.mw)) + ' MW across '
      + (sized === c.total ? 'all ' + c.total : word(sized) + ' of the ' + c.total)
      + ', the biggest single site being ' + big.name + ' at ' + num(big.mw) + ' MW'
      + (big.region ? ' in ' + big.region : '') + '.');
  }
  if (stopped.length && out[0].indexOf('have been stopped') < 0 && out[0].indexOf('has been stopped') < 0) {
    out.push((stopped.length === 1 ? 'One project has' : (Spell(stopped.length) || num(stopped.length)) + ' projects have')
      + ' been stopped, withdrawn or paused: '
      + listOf(stopped.slice(0, 3).map(r => r.name + (r.region ? ' (' + r.region + ')' : '')))
      + (stopped.length > 3 ? ' and ' + (stopped.length - 3) + ' more' : '') + '.');
  } else if (!stopped.length) {
    out.push('No ' + name + ' project on this record has been stopped, withdrawn or paused.');
  }
  if (fought.length) {
    const places = [], seen = {};
    fought.forEach(r => { const k = r.county || r.town || r.region; if (k && !seen[k]) { seen[k] = 1; places.push(k); } });
    out.push('Organised local opposition is on record at ' + word(fought.length) + ' of the ' + c.total + ' sites'
      + (places.length ? ', including ' + listOf(places.slice(0, 3)) : '') + '.');
  }
  if (noStatus) {
    out.push(noStatus === c.total ? 'None of them carries a stage on record.'
      : (Spell(noStatus)
          ? Spell(noStatus) + ' of the ' + c.total + ' carry no stage on record.'
          : 'No stage is on record for ' + num(noStatus) + ' of the ' + c.total + '.'));
  }

  const text = out.join(' ');
  let meta = out[0];
  for (let i = 1; i < out.length && meta.length + out[i].length < 158; i++) meta += ' ' + out[i];
  return { text, meta };
}

// ---- the letter block -------------------------------------------------------------------------
//
// Someone lands on one of these pages because a data center is coming to their town, so the
// letter has to be the next thing they see, not something they scroll for. The block is built
// out of this page's own facts: the body that votes, what is pending here, and what is already
// in force, so it cannot read as the same advert on 900 pages. The running total comes from the
// same counter the homepage uses.
const LETTER_BASE = 12720;
const LETTER_FALLBACK = '13,864';

function letterBlock(o) {
  const c = counts(o.list);
  const body = o.body || (o.rg ? 'your local officials' : 'your local officials');
  const heading = 'Send a letter to ' + (/^(your|the)\b/i.test(body) ? body : 'the ' + body);
  const bits = [];

  if (c.live) {
    bits.push(Spell(c.live)
      ? Spell(c.live) + ' data center ' + (c.live === 1 ? 'project' : 'projects') + ' in ' + o.placeShort
        + ' ' + (c.live === 1 ? 'is' : 'are') + ' proposed or under construction right now'
      : 'There are ' + num(c.live) + ' data center projects in ' + o.placeShort
        + ' proposed or under construction right now');
  } else if (c.total) {
    bits.push(Spell(c.total)
      ? Spell(c.total) + ' data center ' + (c.total === 1 ? 'project' : 'projects') + ' in ' + o.placeShort
        + ' ' + (c.total === 1 ? 'is' : 'are') + ' on this record'
      : 'There are ' + num(c.total) + ' data center projects in ' + o.placeShort + ' on this record');
  }
  if (o.pauseLine) bits.push(o.pauseLine);

  const first = bits.length ? sentence(listOf(bits)) : '';
  const lede = (first ? first.charAt(0).toUpperCase() + first.slice(1) + ' ' : '')
    + (o.ask || 'A letter from a resident is a public record they have to answer.');

  const href = '/take-action' + (o.stateParam ? '?state=' + encodeURIComponent(o.stateParam) : '');
  return '<aside class="g-letter" aria-labelledby="letter-h">'
    + '<h2 id="letter-h">' + esc(heading) + '</h2>'
    + '<p>' + esc(lede) + '</p>'
    + '<p class="g-letter-count"><b class="js-letters">' + LETTER_FALLBACK + '</b> letters sent so far.</p>'
    + '<a class="g-btn red" href="' + esc(href) + '">Write my letter</a>'
    + '<p class="g-letter-fine">Takes about 60 seconds. It goes to every official on the record for your address within 24 hours.</p>'
    + '</aside>';
}

const LETTER_JS = '<script>fetch("/api/letter-count").then(function(r){return r.json()}).then(function(d){'
  + 'if(d&&d.count){var n=(' + LETTER_BASE + '+Number(d.count)).toLocaleString();'
  + 'document.querySelectorAll(".js-letters").forEach(function(e){e.textContent=n;});}}).catch(function(){});<\/script>';

// The subtitle takes the first sentence, the paragraph takes the rest, so the opening reads
// once rather than twice.
// Splitting on every full stop cut "St. Lucie County" in half and left two pages with a
// subtitle that read "St.". An abbreviation, an initial or a numbered street is not the end of
// a sentence: a real one ends in a full stop, then a space, then a capital that starts a word
// of more than one letter.
const ABBREV = /(?:\b(?:St|Mt|Ft|Dr|Mr|Mrs|Ms|Jr|Sr|Co|Corp|Inc|Ltd|LLC|No|Rd|Ave|Blvd|Hwy|Rte|approx|est|vs|etc|Fla|Va|Pa|Ga|Ala|Ariz|Calif|Tenn|Okla|Wash|Wis|Mich|Minn|Miss|Mo|Mont|Neb|Nev|Ohio|Ore|Tex|Vt|Ky|La|Md|Del|Ind|Ill|Colo|Conn|Ark|Kan|Iowa|Utah)|\b[A-Z])\.$/;

function splitSentences(text) {
  const raw = String(text).split(/(?<=\.)\s+(?=[A-Z])/);
  const out = [];
  raw.forEach(part => {
    const prev = out.length ? out[out.length - 1] : null;
    if (prev !== null && ABBREV.test(prev)) out[out.length - 1] = prev + ' ' + part;
    else out.push(part);
  });
  return out;
}

// A meta description is a search result line, not page copy. Google renders about 155 to 160
// characters and drops the rest, so a 300 character description is two thirds wasted and ends
// mid-word in the result. This takes whole sentences while they fit, which is what the place
// pages already do a few hundred lines up, and only falls back to cutting inside a sentence
// when the first one is longer than the limit on its own. The ellipsis is added only in that
// case, because a description that ends on a full stop should not pretend to be truncated.
const META_MAX = 158;
const META_MIN = 100;

function trimToWord(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > 40 ? cut.slice(0, sp) : cut).replace(/[\s,;:.]+$/, '') + '…';
}

function metaDesc(text, limit) {
  const max = limit || META_MAX;
  const bits = splitSentences(String(text || '').trim()).filter(Boolean);
  if (!bits.length) return '';
  if (bits[0].length > max) return trimToWord(bits[0], max);

  let out = bits[0];
  let i = 1;
  for (; i < bits.length && out.length + 1 + bits[i].length <= max; i++) out += ' ' + bits[i];

  // Some stories open on a four word sentence: "Lewiston said no." Whole sentences alone then
  // leave a snippet too short to be worth the space, and the next sentence is too long to fit
  // entire. Below META_MIN, take what will fit of it rather than leaving the line half empty.
  if (out.length < META_MIN && i < bits.length) {
    out = trimToWord(out + ' ' + bits[i], max);
  }
  return out;
}

function proseParts(pr) {
  const bits = splitSentences(pr.text);
  return { sub: bits[0] || '', rest: bits.slice(1).join(' ') };
}

// Every opening has to be its own. Collected as the pages are written and checked at the end of
// the run, because a repeated first sentence is the exact fault these replaced.
const OPENINGS = {};
function recordOpening(url, text) {
  const first = splitSentences(text)[0] || '';
  (OPENINGS[first] = OPENINGS[first] || []).push(url);
  return text;
}

// ---------------------------------------------------------------- region pages

const THE_COUNTRIES = /^(United States|United Kingdom|Netherlands|Philippines|United Arab Emirates|Czech Republic|Dominican Republic|Bahamas)$/;
const countryPhrase = c => (THE_COUNTRIES.test(c) ? 'the ' + c : c);

const stats = { country: 0, region: 0, county: 0, project: 0, company: 0 };

function renderCountry(c) {
  const t = tree[c];
  const list = t.list;
  const url = countryUrl(c);
  const regions = Object.keys(t.regions).sort((a, b) => t.regions[b].list.length - t.regions[a].list.length || a.localeCompare(b));
  const mid = centreOf(list);
  const shape = countryShape(c);

  const wins = winsFor(w => w.country === c);
  const mors = morsFor(m => m.country === c && m.status === 'In effect' && !m._ended);
  const propMors = morsFor(m => m.country === c && m.status === 'Proposed' && !m._ended);
  const realMors = mors.filter(isRealMor);
  const zoningHere = mors.filter(m => !isRealMor(m));

  const regionLinks = regions.filter(rg => regionWorthAPage(c, rg)).map(rg =>
    `<li><a href="${esc(regionUrl(c, rg))}">${esc(rg)}</a><span class="n">${t.regions[rg].list.length}</span></li>`).join('');

  const noRegion = list.filter(r => !r.region);
  const groups = {};
  regions.forEach(rg => { groups[rg] = { list: t.regions[rg].list, url: regionWorthAPage(c, rg) ? regionUrl(c, rg) : null }; });
  if (noRegion.length) groups['Region not recorded'] = { list: noRegion, url: null };

  const kidLabel = c === 'United States' ? 'state' : 'region';
  const kidGroups = {};
  regions.forEach(rg => { kidGroups[rg] = t.regions[rg].list; });
  const art = articleFor({
    url: url, name: countryPhrase(c), wide: true, list: list, mors: realMors, propMors: propMors, zoning: zoningHere, wins: wins,
    kids: regions.length ? { label: kidLabel, plural: kidLabel + 's', groups: kidGroups } : null
  });
  if (art.sub) recordOpening(url, art.sub);

  const letter = letterBlock({
    list: list, country: c, placeShort: countryPhrase(c), stateParam: '',
    body: c === 'United States' ? 'your county commissioners' : 'your local officials',
    pauseLine: realMors.length ? (realMors.length === 1
      ? 'a pause on new data centers is already in force'
      : word(realMors.length) + ' local pauses on new data centers are already in force') : ''
  });

  const tablesHere = list.length <= TABLE_CAP;
  const title = `Data centers in ${countryPhrase(c)}: ${plural(list.length, 'project')} mapped`;
  const linkedHere = new Set();   // one link per target per page
  const body = [
    // Satellite like every state and county page; the plain outline map read as a blank page.
    mapBlock({ frameMain: true, maxZoom: 9, points: pointsOf(list, url), shapes: (c === 'United States' && STATES ? STATES.filter(st => t.regions[st.name] && regionWorthAPage(c, st.name)).map(st => ({ geom: st.geom, fill: 'rgba(247,244,236,.12)', stroke: 'rgba(255,255,255,.6)', width: 0.8, backdrop: true, href: regionUrl(c, st.name), name: st.name })) : []).concat(shape ? [{ geom: shape.geom, name: shape.name, fill: 'none', stroke: '#fff', width: 2 }] : []), height: 420, alt: 'Map of tracked data center sites in ' + c, count: plural(list.length, 'site') + ' shown' }),
    reportParas(art.paragraphs, url, linkedHere),
    letter,
    section(regionLinks ? 'Every ' + kidLabel + ' we track' : '', '', regionLinks ? `<ul class="g-list">${regionLinks}</ul>` : '', 'projects'),
    section(tablesHere ? 'Projects on record, place by place' : 'Projects not tied to a region', tablesHere ? 'Open a place to see what is proposed, being built, running or stopped there. The report above may name projects that have no record here yet.' : 'Sites whose records name no region.', drilldown(groups, false, tablesHere)),
    reportSources(reportFor(url)),
    section('Where people here have won', 'Projects stopped by a vote, pulled by their developer, or blocked in court.', winsTable(wins)),
    section('Moratoriums and bans in effect', 'Places that have paused or banned new data centers.', morsTable(realMors, url), 'bans'),
    section('Zoning limits on data centers', 'Rules short of a pause: setbacks, noise caps, permit requirements and district limits.', morsTable(zoningHere)),
    `<p class="g-foot">${esc(SOURCE_FOOT)}</p>`
  ].join('');

  write('data-centers/' + countrySlug[c] + '/index.html', page({
    url, title,
    description: art.meta,
    crumbs: [{ label: 'Home', url: '/' }, { label: 'Data centers', url: '/data-centers/' }, { label: c }],
    schema: [
      { '@type': 'CollectionPage', url: SITE + url, name: title, about: areaLd(c) },
      itemListLd('Regions tracked in ' + countryPhrase(c),
        regions.filter(rg => regionWorthAPage(c, rg)).map(rg => ({ name: rg, url: regionUrl(c, rg) })))
    ],
    letterJs: true,
    kicker: 'Data centers by place',
    h1: title,
    sub: art.sub,
    stats: statsFor(list, realMors.length ? [[num(realMors.length), realMors.length === 1 ? 'moratorium or ban in effect' : 'moratoriums and bans in effect', '#bans']] : []),
    body
  }));
  stats.country++;
}

function renderRegion(c, rg) {
  const t = tree[c].regions[rg];
  const list = t.list;
  const url = regionUrl(c, rg);
  const counties = Object.keys(t.counties).sort((a, b) => t.counties[b].list.length - t.counties[a].list.length || a.localeCompare(b));
  const mid = centreOf(list);
  const shape = stateShape(rg);

  const wins = winsFor(w => w.country === c && w.state === rg);
  const mors = morsFor(m => m.country === c && m.state === rg && m.status === 'In effect' && !m._ended);
  const propMors = morsFor(m => m.country === c && m.state === rg && m.status === 'Proposed' && !m._ended);
  const realMors = mors.filter(isRealMor);
  const zoningHere = mors.filter(m => !isRealMor(m));

  // Draw the whole state, then every county in it, then fill in the ones we track so the
  // shape reads as a state rather than a few islands floating in a blank outline.
  const withProjects = new Set(counties.map(cy => t.counties[cy].fips).filter(Boolean));
  // Over imagery the counties are drawn as outlines. The ones we track carry a faint wash
  // so they read as the subject without hiding the land underneath.
  const shapes = [];
  countiesInState(rg).forEach(c => {
    if (withProjects.has(c.fips)) return;
    shapes.push({ geom: c.geom, fill: 'none', stroke: 'rgba(255,255,255,.45)', width: 0.7, href: FIPS_URL[c.fips], name: c.name });
  });
  countiesInState(rg).forEach(c => {
    if (!withProjects.has(c.fips)) return;
    shapes.push({ geom: c.geom, fill: 'rgba(247,244,236,.18)', stroke: '#fff', width: 1.3, href: FIPS_URL[c.fips], name: c.name });
  });
  if (shape) shapes.push({ geom: shape.geom, fill: 'none', stroke: '#fff', width: 2 });

  const countyLinks = counties.map(cy =>
    `<li><a href="${esc(countyUrl(c, rg, cy))}">${esc(cy)}</a><span class="n">${t.counties[cy].list.length}</span></li>`).join('');

  const noCounty = list.filter(r => !r.county);
  const groups = {};
  counties.forEach(cy => { groups[cy] = { list: t.counties[cy].list, url: countyUrl(c, rg, cy) }; });
  if (noCounty.length) groups[counties.length ? 'Elsewhere in ' + rg : rg] = { list: noCounty, url: null };

  const kidLabel = c === 'United States' ? 'county' : 'area';
  const kidGroups = {};
  counties.forEach(cy => { kidGroups[cy] = t.counties[cy].list; });
  const art = articleFor({
    url: url, name: rg, rg: rg, wide: true, list: list, mors: realMors, propMors: propMors, zoning: zoningHere, wins: wins,
    kids: counties.length ? { label: kidLabel, plural: kidLabel === 'county' ? 'counties' : 'areas', groups: kidGroups } : null
  });
  if (art.sub) recordOpening(url, art.sub);

  const letter = letterBlock({
    list: list, country: c, placeShort: rg, rg: rg, stateParam: c === 'United States' ? rg : '',
    body: c === 'United States' ? 'your county commissioners in ' + rg : 'your local officials in ' + rg,
    pauseLine: realMors.length ? (realMors.length === 1
      ? 'a pause on new data centers is already in force somewhere in ' + rg
      : word(realMors.length) + ' local pauses on new data centers are already in force here') : ''
  });

  const tablesHere = list.length <= TABLE_CAP;
  const title = `Data centers in ${rg}: ${plural(list.length, 'project')} mapped`;
  const linkedHere = new Set();   // one link per target per page
  const body = [
    mapBlock({ frameMain: true, points: pointsOf(list, url), shapes, height: 420, maxZoom: 11, alt: 'Map of tracked data center sites in ' + rg, count: plural(list.length, 'site') + ' shown' }),
    reportParas(art.paragraphs, url, linkedHere),
    letter,
    section(countyLinks ? plural(counties.length, kidLabel, kidLabel === 'county' ? 'counties' : 'areas') + ' with tracked projects' : '', 'Only places with at least one project have a page.', countyLinks ? `<ul class="g-list">${countyLinks}</ul>` : '', 'projects'),
    section('Projects not tied to an area', 'Sites whose records name no county. Everything else is on the pages listed above.', drilldown(groups, counties.length <= 8, false)),
    reportSources(reportFor(url)),
    section('Where people here have won', 'Projects stopped by a vote, pulled by their developer, or blocked in court.', winsTable(wins)),
    section('Moratoriums and bans in effect', 'Places in ' + rg + ' that have paused or banned new data centers.', morsTable(realMors, url), 'bans'),
    section('Zoning limits on data centers', 'Rules short of a pause: setbacks, noise caps, permit requirements and district limits.', morsTable(zoningHere)),
    `<p class="g-foot">${esc(SOURCE_FOOT)}</p>`
  ].join('');

  write('data-centers/' + countrySlug[c] + '/' + regionSlug[c + '|' + rg] + '/index.html', page({
    url, title,
    description: art.meta,
    crumbs: [{ label: 'Home', url: '/' }, { label: c, url: countryUrl(c) }, { label: rg }],
    schema: [
      { '@type': 'CollectionPage', url: SITE + url, name: title, about: areaLd(c, rg) },
      itemListLd('Areas tracked in ' + rg, counties.map(cy => ({ name: cy, url: countyUrl(c, rg, cy) })))
    ],
    letterJs: true,
    kicker: 'Data centers by place',
    h1: title,
    sub: art.sub,
    stats: statsFor(list, realMors.length ? [[num(realMors.length), realMors.length === 1 ? 'moratorium or ban in effect' : 'moratoriums and bans in effect', '#bans']] : []),
    body
  }));
  stats.region++;
}

// A county page that shows a pause in force next to projects still going ahead read as a
// contradiction (Morgan County, Alabama: a moratorium, and the bitcoin mine went ahead). Both are
// true, and the top of the page now says so.
// Who holds the pause matters for what a letter can ask. A county's own pause can be extended or
// made permanent; a town's pause is the town's, so the county is asked to match it; a ban with no
// end date is asked to be kept.
function countyLevel(realMors) { return realMors.some(m => m.level === 'county'); }
function pauseWhere(realMors) {
  return countyLevel(realMors) ? 'a pause on new data centers is already in force'
    : (realMors.length === 1 ? realMors[0].name + ' has a pause on new data centers in force' : 'towns here have pauses on new data centers in force');
}
function pauseAsk(realMors) {
  const m = realMors.filter(x => x.level === 'county')[0];
  if (!m) return 'A letter asking the county to match ' + (realMors.length === 1 ? 'it' : 'them') + ' countywide is a public record they have to answer.';
  if (!m.end) return 'A letter asking them to keep it in place is a public record they have to answer.';
  return 'Pauses run out, this one on ' + fdate(m.end) + '. A letter asking them to extend it or make it permanent is a public record they have to answer.';
}

function pauseNote(realMors, list) {
  const live = list.filter(r => r.bucket === 'live').length;
  if (!realMors.length || !live) return '';
  const m = realMors[0];
  const what = m.type === 'Ban' ? 'ban' : 'moratorium';
  const toothless = realMors.some(x => /unenforce|no enforcement/i.test(x.notes || ''));
  const who = countyLevel(realMors) ? 'A ' + what + ' on new data centers is in force' : (realMors.length === 1 ? esc(m.name) + ' has a ' + what + ' on new data centers in force' : 'Towns here have pauses on new data centers in force');
  return '<b>Both are true here.</b> ' + who + ', and '
    + (live === 1 ? 'one project is' : num(live) + ' projects are') + ' still proposed or being built. '
    + 'A pause usually stops new applications; projects filed before it, or outside its reach, can carry on.'
    + (toothless ? ' This one has no enforcement power, according to the record.' : '')
    + ' Each project page says where it stands.';
}

// The end of every county page: where to go next, so a reader who has finished is not left at
// the source list. Clarity showed county pages read to the bottom and then closed.
function keepGoing(c, rg, fips, here, skipIds) {
  const items = [];
  const shape = fips ? countyShape(fips) : null;
  if (shape) countiesInState(rg)
    .filter(x => x.fips !== fips && touches(x.bbox, shape.bbox) && FIPS_URL[x.fips] && FIPS_URL[x.fips] !== here)
    .slice(0, 6)
    .forEach(x => items.push('<li><a href="' + esc(FIPS_URL[x.fips]) + '">' + esc(countyLabel(x.name, rg, x.fips)) + '</a><small>next door</small></li>'));
  const st = tree[c] && tree[c].regions[rg] ? tree[c].regions[rg] : null;
  if (st) st.list.filter(r => r.page && r.bucket !== 'stopped' && !(skipIds && skipIds.has(r.id)))
    .sort((a, b) => (b.mw || 0) - (a.mw || 0)).slice(0, 3)
    .forEach(r => items.push('<li><a href="' + esc(r.page) + '">' + esc(r.name) + '</a><small>' + esc((r.mw ? num(r.mw) + ' MW, ' : '') + 'one of the largest in ' + rg) + '</small></li>'));
  if (st && regionWorthAPage(c, rg)) items.push('<li><a href="' + esc(regionUrl(c, rg)) + '">Every project and ban in ' + esc(rg) + '</a></li>');
  items.push('<li><a href="/wins">Where communities won</a><small>projects residents stopped</small></li>');
  return section('Keep going', '', '<ul class="g-list">' + items.join('') + '</ul>');
}

function renderCounty(c, rg, cy) {
  const t = tree[c].regions[rg].counties[cy];
  const list = t.list;
  const url = countyUrl(c, rg, cy);
  const mid = centreOf(list);
  const shape = countyShape(t.fips);

  const wins = winsFor(w => t.fips && w._fips === t.fips);
  const mors = morsFor(m => t.fips && m._fips === t.fips && m.status === 'In effect' && !m._ended);
  const propMors = morsFor(m => t.fips && m._fips === t.fips && m.status === 'Proposed' && !m._ended);
  const realMors = mors.filter(isRealMor);
  const zoningHere = mors.filter(m => !isRealMor(m));
  const inTable = new Set(list.map(r => r.id));
  const extraWins = wins.filter(w => !w.id || !inTable.has(w.id));

  // The older, longer Florida county write-ups have been retired into
  // archive/legacy-florida/ and are no longer served, so there is nothing to link out to.
  const hasLegacy = false;

  const byTown = {};
  list.forEach(r => {
    const k = r.town || 'Elsewhere in ' + cy;
    (byTown[k] = byTown[k] || { list: [], url: null }).list.push(r);
  });

  const art = articleFor({
    url: url, name: cy + ', ' + rg, shortName: cy, cy: cy, rg: rg, list: list,
    mors: realMors, propMors: propMors, zoning: zoningHere, wins: wins, kids: null
  });
  if (art.sub) recordOpening(url, art.sub);

  const letter = letterBlock({
    list: list, country: c, placeShort: cy, rg: rg, stateParam: c === 'United States' ? rg : '',
    body: governingBody(list, cy, rg),
    pauseLine: realMors.length ? pauseWhere(realMors)
      : (propMors.length ? 'a pause has been proposed but is not yet in force' : ''),
    ask: realMors.length ? pauseAsk(realMors)
      : propMors.length ? 'A letter asking them to adopt it is a public record they have to answer.' : ''
  });

  const title = 'Data centers in ' + cy + ', ' + rg + ': ' + plural(list.length, 'project') + ' mapped';
  const linkedHere = new Set();   // one link per target per page
  const body = [
    mapBlock({
      points: pointsOf(list, url),
      shapes: shape
        ? countiesInState(rg).filter(c => c.fips !== t.fips && touches(c.bbox, shape.bbox))
            .map(c => ({ geom: c.geom, fill: 'none', stroke: 'rgba(255,255,255,.45)', width: 0.7, backdrop: true, href: FIPS_URL[c.fips], name: c.name }))
            .concat([{ geom: shape.geom, fill: 'rgba(247,244,236,.16)', stroke: '#fff', width: 2 }])
        : [],
      height: 380, maxZoom: 13, alt: 'Map of tracked data center sites in ' + cy,
      count: plural(list.length, 'site') + ' shown'
    }),
    reportParas(art.paragraphs, url, linkedHere),
    letter,
    // The project list comes before the sources now. It is what a reader actually navigates
    // with, and burying it under the citation list on a phone meant scrolling past everything
    // to reach the only links that lead deeper into the site. The letter box follows it, once.
    section('Data center projects on record in ' + cy, 'Grouped by the town each site sits in. The report above may name projects that have no record here yet.', drilldown(byTown, true, undefined, url), 'projects'),
    reportSources(reportFor(url)),
    section('Where people here have won', 'Projects stopped by a vote, pulled by their developer, or blocked in court.', winsTable(extraWins)),
    section('Moratoriums and bans in effect', 'Pauses on new data centers covering this area.', morsTable(realMors, url), 'bans'),
    section('Zoning limits on data centers', 'Rules short of a pause: setbacks, noise caps, permit requirements and district limits.', morsTable(zoningHere)),
    keepGoing(c, rg, t.fips, url, new Set(list.map(r => r.id))),
    '<p class="g-foot">' + esc(SOURCE_FOOT) + '</p>'
  ].join('');

  write('data-centers/' + countrySlug[c] + '/' + regionSlug[c + '|' + rg] + '/' + countySlug[c + '|' + rg + '|' + cy] + '/index.html', page({
    note: pauseNote(realMors, list),
    url: url,
    title: title,
    description: art.meta,
    crumbs: [{ label: 'Home', url: '/' }, { label: c, url: countryUrl(c) }, { label: rg, url: regionUrl(c, rg) }, { label: cy }],
    schema: [
      { '@type': 'CollectionPage', url: SITE + url, name: title, about: areaLd(c, rg, cy) },
      itemListLd('Projects tracked in ' + cy,
        list.filter(function (x) { return x.page; }).map(function (x) { return { name: x.name, url: x.page }; }))
    ],
    letterJs: true,
    kicker: 'Data centers by place',
    h1: title,
    sub: art.sub,
    stats: statsFor(list, realMors.length ? [[num(realMors.length), realMors.length === 1 ? 'moratorium or ban in effect' : 'moratoriums and bans in effect', '#bans']] : []),
    body: body
  }));
  stats.county++;
}

// A county with bans on record and no tracked project. Everything on it comes from the ban
// rows: who passed what, when, until when, and the record it rests on.
function morSentence(m) {
  const what = m.type === 'Zoning limits' ? 'zoning limits on data centers'
    : (m.type === 'Ban' ? 'a ban' : m.type === 'Moratorium' ? 'a moratorium' : 'a rule') + ' on new data centers';
  const since = fdate(m.start), until = fdate(m.end);
  if (m.status === 'Proposed') return sentence(m.name + ' has proposed ' + what + (since ? ' (' + since + ')' : '') + '. It is not yet in force');
  if (m._ended || m.status === 'Ended') return sentence(m.name + ' had ' + what + (until ? ' that ended ' + until : ' that has ended'));
  if (m.status === 'In effect') return sentence(m.name + ' has ' + what + ' in effect' + (since ? ', adopted ' + since : '')
    + (m.type === 'Zoning limits' ? '' : until ? ', running until ' + until : ', with no end date set'));
  return sentence(m.name + ': ' + what + (m.status ? ' (' + m.status.toLowerCase() + ')' : ''));
}

function renderBanCounty(b) {
  const url = b.url, cy = b.label, rg = b.state, c = 'United States';
  const shape = countyShape(b.fips);
  const all = morsFor(m => m._fips === b.fips);
  const live = all.filter(m => m.status === 'In effect' && !m._ended);
  const realMors = live.filter(isRealMor);
  const zoningHere = live.filter(m => !isRealMor(m));
  const other = all.filter(m => live.indexOf(m) < 0);
  const wins = winsFor(w => w._fips === b.fips);
  const statePage = tree[c] && tree[c].regions[rg] && regionWorthAPage(c, rg) ? regionUrl(c, rg) : null;

  const headline = realMors.length
    ? (realMors.some(m => m.type === 'Ban') ? 'ban' : 'moratorium') + (realMors.length > 1 ? 's' : '') + ' in effect'
    : zoningHere.length ? 'zoning limits in effect'
    : all.some(m => m.status === 'Proposed') ? 'moratorium proposed' : 'local rules on record';
  const title = 'Data centers in ' + cy + ', ' + rg + ': ' + headline;

  const lines = all.slice().sort((x, y) => String(y.start).localeCompare(String(x.start))).map(morSentence);
  const sub = lines[0];
  const paras = lines.slice(1).concat(['No data center project in ' + cy + ' is on our record yet. If you know of one, '
    + 'write to james@floridadatacenters.org and it will be added with its sources.']);

  const neighbours = shape ? countiesInState(rg).filter(x => x.fips !== b.fips && touches(x.bbox, shape.bbox)) : [];
  const nearLinks = neighbours.filter(x => FIPS_URL[x.fips] && !BAN_COUNTIES[x.fips])
    .map(x => '<li><a href="' + esc(FIPS_URL[x.fips]) + '">' + esc(countyLabel(x.name, rg, x.fips)) + '</a></li>').join('');

  const letter = letterBlock({
    list: [], country: c, placeShort: cy, rg: rg, stateParam: rg, body: governingBody([], cy, rg),
    pauseLine: realMors.length ? pauseWhere(realMors) : '',
    ask: realMors.length ? pauseAsk(realMors) : ''
  });

  const body = [
    shape ? mapBlock({
      points: [],
      shapes: neighbours.map(x => ({ geom: x.geom, fill: 'none', stroke: 'rgba(255,255,255,.45)', width: 0.7, backdrop: true, href: FIPS_URL[x.fips], name: x.name }))
        .concat([{ geom: shape.geom, fill: 'rgba(247,244,236,.16)', stroke: '#fff', width: 2 }]),
      height: 380, maxZoom: 13, alt: 'Map of ' + cy + ', ' + rg, count: 'No data center projects on record here'
    }) : '',
    paras.map(t => '<p class="g-body">' + esc(t) + '</p>').join(''),
    letter,
    section('Moratoriums and bans in effect', 'Pauses on new data centers covering this area.', morsTable(realMors, url), 'bans'),
    section('Zoning limits on data centers', 'Rules short of a pause: setbacks, noise caps, permit requirements and district limits.', morsTable(zoningHere, url)),
    section('Proposed or ended', 'Pauses that were proposed but not adopted, or have run out.', morsTable(other, url)),
    section('Where people here have won', 'Projects stopped by a vote, pulled by their developer, or blocked in court.', winsTable(wins)),
    keepGoing(c, rg, b.fips, url, null),
    '<p class="g-foot">' + esc(SOURCE_FOOT) + '</p>'
  ].join('');

  // No tracked project here: the page exists so a ban has somewhere to live, not as a search
  // result. Thin templated pages pulled the whole site down in Google's October 2026 update,
  // so these stay noindex and out of the sitemap. The ban still shows on the state page.
  write(url.replace(/^\//, '') + 'index.html', page({
    noindex: true,
    url: url, title: title,
    description: clean(sub + ' ' + paras[0]).slice(0, 155),
    crumbs: [{ label: 'Home', url: '/' }, { label: c, url: countryUrl(c) }, statePage ? { label: rg, url: statePage } : { label: rg }, { label: cy }],
    schema: [{ '@type': 'CollectionPage', url: SITE + url, name: title, about: areaLd(c, rg, cy) }],
    letterJs: true,
    kicker: 'Data centers by place',
    h1: title,
    sub: sub,
    stats: statHtml([].concat(
      realMors.length ? [[num(realMors.length), realMors.length === 1 ? 'moratorium or ban in effect' : 'moratoriums and bans in effect', '#bans']] : [],
      zoningHere.length ? [[num(zoningHere.length), zoningHere.length === 1 ? 'zoning limit in effect' : 'zoning limits in effect']] : [],
      [['0', 'projects tracked']])),
    body: body
  }));
  stats.county++;
}

// ---------------------------------------------------------------- descriptions

// data/descriptions.json holds one short write-up per project, keyed by project id, each
// with the source urls it was written from. It is built by data/research-descriptions.js.
// When a project has no entry, or its entry came out as a fallback, the page uses a line
// assembled from the data fields instead. The shape of that line varies with the project id
// so neighbouring pages do not open with the same sentence.
let DESCRIPTIONS = {};
try { DESCRIPTIONS = JSON.parse(fs.readFileSync(path.join(ROOT, "data/descriptions.json"), "utf8")); }
catch (e) { DESCRIPTIONS = {}; }

function hashOf(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const descStats = { reported: 0, researched: 0, fallback: 0 };

function placeBare(r) {
  const bits = [r.town, r.county && r.county !== r.town ? r.county : "", r.region].filter(Boolean);
  return bits.length ? bits.slice(0, 2).join(", ") : r.country;
}

const placePhrase = r => "in " + placeBare(r);

function fallbackDescription(r) {
  const p = r.p;
  const who = r.dev && !NOT_A_COMPANY.test(r.dev) ? r.dev : "";
  const where = placePhrase(r);
  const bare = placeBare(r);
  const pick = a => a[hashOf(r.id) % a.length];
  const sents = [];

  if (r.bucket === "operating") {
    sents.push(pick([
      who ? who + " operates this data center " + where + "." : "This data center " + where + " is listed as operating.",
      who ? "This data center " + where + " is run by " + who + "." : "The site " + where + " is in operation.",
      who ? who + " has a data center in operation " + where + "." : "A data center " + where + " is in operation."
    ]));
  } else if (r.bucket === "live") {
    const stage = r.status.toLowerCase();
    sents.push(pick([
      who ? who + " has a data center " + where + " that is " + stage + "." : "A data center " + where + " is " + stage + ".",
      who ? (/^[aeiou]/i.test(who) ? "An " : "A ") + who + " data center " + where + " is " + stage + "." : "This site " + where + " is " + stage + ".",
      who ? "The record for this site in " + bare + " lists " + who + " as the company behind it, at the " + stage + " stage." : "The record for this site in " + bare + " lists it as " + stage + "."
    ]));
  } else if (r.bucket === "stopped") {
    const stage = r.status.toLowerCase();
    sents.push(pick([
      who ? who + " put forward a data center " + where + ". The record lists it as " + stage + "." : "A data center was put forward " + where + ". The record lists it as " + stage + ".",
      who ? (/^[aeiou]/i.test(who) ? "An " : "A ") + who + " data center " + where + " is " + stage + "." : "This proposal " + where + " is " + stage + ".",
      who ? "The site in " + bare + ", proposed by " + who + ", is recorded as " + stage + "." : "The site in " + bare + " is " + stage + "."
    ]));
  } else {
    sents.push(who
      ? who + " is named as the company behind this data center " + where + ". Its current stage has not been reported."
      : "A data center is recorded " + where + ". Neither the company nor its current stage has been reported.");
  }

  if (p.capacity_mw) {
    sents.push(pick([
      "Its reported capacity is " + num(p.capacity_mw) + " MW.",
      "Sources put it at " + num(p.capacity_mw) + " MW.",
      "It is listed at " + num(p.capacity_mw) + " MW."
    ]));
  }
  if (p.year_announced && /^\d{4}$/.test(String(p.year_announced))) {
    sents.push(pick([
      "It first appears in the record in " + p.year_announced + ".",
      "The earliest record we hold is from " + p.year_announced + ".",
      "It was announced in " + p.year_announced + "."
    ]));
  }
  return sents.join(" ");
}

// The words the page opens with. A researched write-up when there is one, otherwise the
// line built above.
function descriptionFor(r) {
  const d = DESCRIPTIONS[r.id];
  if (d && d.mode === 'reported' && d.paragraphs && d.paragraphs.length) {
    descStats.reported++;
    return {
      reported: true,
      paragraphs: d.paragraphs.map(clean).filter(Boolean),
      text: clean(d.text),
      words: d.words || 0,
      sources: d.sources || []
    };
  }
  if (d && d.mode === 'researched' && d.text && String(d.text).trim()) {
    descStats.researched++;
    return { text: clean(d.text), researched: true, sources: d.sources || [] };
  }
  descStats.fallback++;
  return { text: clean(fallbackDescription(r)), researched: false, sources: [] };
}

// ---------------------------------------------------------------- project pages

const WIN_BY_ID = {};
WIN_LIST.forEach(w => { if (w.id) WIN_BY_ID[w.id] = w; });

function km(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const s1 = Math.sin(dLat / 2), s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(la1) * Math.cos(la2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function renderProject(r) {
  const p = r.p;
  const win = WIN_BY_ID[r.id] || null;
  // A win row on a project that is still live belongs to an earlier, stopped plan on the same site
  // (Silver Fox, Plymouth Township). Its decision date and size are that plan's, not this one's.
  const stopped = /withdrawn|blocked|cancel|reject|denied|suspended/i.test(r.status || '');
  const winNow = stopped ? win : null;
  // Town (or county), then state or region; with no town the country goes second, so a page
  // never reads "Hessen, Hessen". A name that already says data center is not told so twice.
  const placeBits = [];
  [r.town || r.county, r.region, r.country === 'United States' ? '' : r.country].forEach(function (b) {
    if (b && placeBits.indexOf(b) < 0 && placeBits.length < 2) placeBits.push(b);
  });
  const placeLine = placeBits.join(', ') || r.country;
  const title = p.name + (/data ?cent(er|re)|datacenter/i.test(p.name) ? '' : ' data center') + ', ' + placeLine;
  const aliases = (p.aliases || []).filter(Boolean);

  // Every fact below appears only when the data actually holds it.
  const dl = [];
  if (r.dev) {
    const cu = companyUrl(r.dev);
    dl.push(['Company', cu ? '<a href="' + esc(cu) + '">' + esc(r.dev) + '</a>' : esc(r.dev)]);
  }
  // "hyperscale" or "colocation" in the tenant field is a kind of building, not a tenant: 662
  // records carried one and every page printed "Tenant: hyperscale".
  const TENANT_TYPE = /^\s*(hyperscale|colocation|enterprise|wholesale|retail|edge)(\s*\/\s*(hyperscale|colocation|enterprise|wholesale|retail|edge))*\s*$/i;
  if (p.tenant && p.tenant !== r.dev && !TENANT_TYPE.test(p.tenant)) dl.push(['Tenant', esc(p.tenant)]);
  if (p.program) dl.push(['Program', esc(p.program)]);
  if (aliases.length) dl.push(['Also known as', esc(aliases.join(', '))]);
  if (p.address) dl.push(['Address', esc(p.address)]);
  if (r.county) dl.push(['County', '<a href="' + esc(countyUrl(r.country, r.region, r.county)) + '">' + esc(r.county + ', ' + r.region) + '</a>']);
  else if (r.region) {
    dl.push(['Region', regionWorthAPage(r.country, r.region)
      ? '<a href="' + esc(regionUrl(r.country, r.region)) + '">' + esc(r.region) + '</a>'
      : esc(r.region)]);
  }
  dl.push(['Country', '<a href="' + esc(countryUrl(r.country)) + '">' + esc(r.country) + '</a>']);
  dl.push(['Status', esc(r.status)]);
  if (p.capacity_mw) dl.push(['Power', esc(num(p.capacity_mw) + ' MW')]);
  if (p.capacity_mw && p.capacity_note) dl.push(['On that figure', esc(p.capacity_note)]);
  if (p.year_announced) dl.push(['Announced', esc(fdate(p.year_announced))]);
  if (p.year_operating_or_planned) dl.push(['Operating or planned', esc(p.year_operating_or_planned)]);

  const land = (winNow && winNow.acres) || '';
  const sizeText = (r.blocked && r.blocked.size) || (winNow && winNow.size) || '';
  if (land) dl.push(['Land', esc(land)]);
  if (sizeText && sizeText !== land) dl.push(['Reported size', esc(sizeText)]);
  const inv = (r.blocked && r.blocked.investment) || (winNow && winNow.inv) || '';
  if (inv) dl.push(['Reported investment', esc(inv)]);
  if (winNow && winNow.detail) dl.push(['Site', esc(winNow.detail)]);
  if (stopped && r.blocked && r.blocked.date) dl.push(['Decided', esc(fdate(r.blocked.date))]);
  // The dot shape no longer carries this, so the page says it outright.
  if (!r.exact) dl.push(['Site location', 'Exact parcel not confirmed, so the pin is approximate.']);
  if (p.as_of) dl.push(['Record checked', esc(fdate(p.as_of))]);

  // Every article the report's sentences cite comes first, then the record's own links: a page
  // written from nine news stories used to list only the one directory page on the record.
  const d0 = DESCRIPTIONS && DESCRIPTIONS[r.id];
  const cited = d0 && Array.isArray(d0.sentences)
    ? d0.sentences.map(s => String(s.src || '')).filter(s => /^https?:\/\//.test(s)) : [];
  const srcs = [...new Set(cited.concat(sourceLinks(p)))];
  /* Free-text notes on a record are unattributed claims (some contradict the reporting on the same page), so they are
     not listed under Sources, which promises that everything above can be checked. They stay in the data. */
  const notes = [];
  const srcList = '<ul class="g-src">'
    + srcs.map(function (s) {
      return '<li><a href="' + esc(s) + '" target="_blank" rel="noopener">' + esc(s.replace(/^https?:\/\//, '').slice(0, 110)) + '</a></li>';
    }).join('')
    + notes.map(function (n) { return '<li class="note">' + esc(sentence(n)) + '</li>'; }).join('')
    + '</ul>';

  const happened = r.blocked ? sentence(r.blocked.how) : (win ? sentence(win.how) : '');
  const courtLine = r.blocked && r.blocked.court ? ' A court was involved in the decision.' : '';

  const near = RECORDS.filter(function (o) { return o.id !== r.id; })
    .map(function (o) { return { o: o, d: km(r, o) }; })
    .filter(function (x) { return x.d <= 40; })
    .sort(function (a, b) { return a.d - b.d; })
    .slice(0, 8);
  const nearHref = function (o) {
    if (o.page) return o.page;
    if (o.county && o.region) return countyUrl(o.country, o.region, o.county);
    if (o.region && regionWorthAPage(o.country, o.region)) return regionUrl(o.country, o.region);
    return countryUrl(o.country);
  };
  // The same company's other sites with pages: same state first, then same country, then the
  // largest. Projects already in the nearby list are not repeated.
  const nearIds = new Set(near.map(x => x.o.id));
  const sibs = r.company && COMPANY[r.company] ? COMPANY[r.company].filter(o => o.id !== r.id && o.page && !nearIds.has(o.id)) : [];
  const rank = o => (o.region === r.region && o.country === r.country ? 0 : o.country === r.country ? 1 : 2);
  const moreList = sibs.length
    ? '<ul class="g-list">' + sibs.slice().sort((a, b) => rank(a) - rank(b) || (b.mw || 0) - (a.mw || 0)).slice(0, 6)
        .map(o => '<li><a href="' + esc(o.page) + '">' + esc(o.name) + '</a><small>' + esc([o.region, o.country === r.country ? '' : o.country].filter(Boolean).join(', ')) + '</small></li>').join('')
      + (companyUrl(r.company) ? '<li><a href="' + esc(companyUrl(r.company)) + '">All ' + num(COMPANY[r.company].length) + ' ' + esc(r.company) + ' sites</a></li>' : '')
      + '</ul>'
    : '';
  const nearList = near.length
    ? '<ul class="g-list">' + near.map(function (x) {
        const href = nearHref(x.o);
        const where = x.o.page ? '' : '<small>listed on the ' + esc(x.o.county || x.o.region || x.o.country) + ' page</small>';
        return '<li><a href="' + esc(href) + '">' + esc(x.o.name) + '</a>'
          + '<span class="n">' + (x.d < 1 ? 'under 1 km' : Math.round(x.d) + ' km') + '</span>' + where + '</li>';
      }).join('') + '</ul>'
    : '';

  // A town's pause covers that town, not every site in its county: Tempe's moratorium was
  // showing on Mesa and Buckeye pages. Town rows count only where the site is in that town.
  const townKey = function (s) {
    return String(s || '').toLowerCase().replace(/\b(city|town|village|borough|township|charter|of|the)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  };
  const inTown = function (m) {
    const k = townKey(m.name);
    if (!k) return false;
    if (r.town && townKey(r.town) === k) return true;
    if ((' ' + townKey(p.address) + ' ').indexOf(' ' + k + ' ') >= 0) return true;
    // A mailing town can sit inside a township (Williamstown is in Monroe Township, NJ): a town
    // township row whose own point is within 5 km of the site counts too. Not towns: a farm just
    // outside Warrenton, VA is not under Warrenton's ban.
    return /township/i.test(m.name) && p.lat != null && m.lat != null && km({ lat: p.lat, lng: p.lng }, { lat: m.lat, lng: m.lng }) < 5;
  };
  const mors = morsFor(function (m) {
    if (m.status !== 'In effect' || m._ended) return false;
    if (m.level === 'municipality') return !!(r.countyFips && m._fips === r.countyFips && inTown(m));
    if (r.countyFips && m._fips === r.countyFips) return true;
    if (m.country === r.country && m.level === 'state' && m.state === r.region) return true;
    if (m.country === r.country && m.level === 'national') return true;
    return false;
  });

  const nums = [];
  if (p.capacity_mw) nums.push([num(p.capacity_mw) + ' MW', 'reported power']);
  if (land) nums.push([land, 'land']);
  else if (sizeText) nums.push([sizeText, 'reported size']);
  if (inv) nums.push([inv, 'investment']);
  nums.push([r.status, 'status']);

  // A single line under the address. Only what is on file, in a fixed order so the eye
  // knows where to look, but set quietly so it does not compete with the reporting.
  const factBits = [];
  if (r.dev) factBits.push(esc(r.dev));
  if (statusKey(p)) factBits.push(esc(r.status));
  if (p.capacity_mw) factBits.push(esc(num(p.capacity_mw) + ' MW'));
  if (land) factBits.push(esc(land));
  else if (sizeText && /acre|hectare/i.test(sizeText)) factBits.push(esc(sizeText.split(',')[0]));
  if (inv) factBits.push(esc(inv));
  const decided = stopped ? ((r.blocked && r.blocked.date) || (win && win.date) || '') : '';
  if (decided) factBits.push('decided ' + esc(fdate(decided)));
  else if (p.year_announced && /^\d{4}$/.test(String(p.year_announced))) factBits.push('announced ' + esc(p.year_announced));
  const factLine = factBits.length ? '<p class="g-facts">' + factBits.join('<i>&middot;</i>') + '</p>' : '';

  // The letter form prefills its "town or address" from this, so someone arriving from a
  // project page does not have to retype where it is. Works the same in every country.
  const letterHref = '/take-action.html?site=' + encodeURIComponent(r.id)
    + '&amp;name=' + encodeURIComponent(p.name)
    + '&amp;town=' + encodeURIComponent(placeLine);

  const desc = descriptionFor(r);

  // The numbers sit in a light row under the description instead of floating in the dark
  // header, which is what left the empty gap there.
  const statRow = nums.length
    ? '<div class="w-nums g-statrow">' + nums.map(function (x) {
        return '<div class="w-num"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>';
      }).join('') + '</div>'
    : '';

  // Reporting speaks for itself: no numbers row above it, and no headings restating what it
  // already says. The short forms keep the old shape.
  const prose = desc.reported
    ? '<div class="g-report" id="summary">'
        + desc.paragraphs.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('')
        + '</div>'
    : '<p class="g-body" id="summary">' + esc(desc.text) + '</p>';

  // The satellite view is the one thing on this page that is not text. Held inside the 680px
  // measure it sat in the middle of a 1200px page with empty paper either side of it, so it is
  // lifted out of the column and spans the content width at every size.
  // Visitors tap the picture expecting the map (Clarity dead taps, Oct 2026), so the whole picture
  // opens the globe on this site, and a label on it says so.
  const sat = '<a class="g-sat-link" href="' + esc(focusUrl(r.lat, r.lng, r.exact ? 16 : 12)) + '" aria-label="Open this site on the globe">'
    + satBlock(r.lat, r.lng, r.exact ? 16 : 13, r.exact,
      r.exact ? 'The site' : 'Area view. The exact parcel has not been made public.', 'g-sat')
    + '<span class="g-sat-cta">Open on the globe <span aria-hidden="true">&#8599;</span></span></a>';

  const body = [
    prose,
    desc.reported ? '' : statRow,
    !desc.reported && happened ? section('What happened', '', '<p class="g-body">' + esc(happened + courtLine) + '</p>') : '',
    !desc.reported && p.note && !/^\d/.test(p.note) && p.note !== p.address
      && desc.text.toLowerCase().indexOf(String(p.note).toLowerCase().slice(0, 40)) < 0
      ? section('From the record', '', '<p class="g-body">' + esc(sentence(p.note)) + '</p>') : '',
    section('The facts on file', '', '<dl class="g-dl">' + dl.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl>'),
    section('Sources', 'Everything above comes from these. Open one and check it yourself.', srcList),
    section('Other projects nearby', 'Sites we track within 40 km.', nearList),
    section(moreList ? 'More from ' + r.company : '', '', moreList),
    section('Moratoriums covering this site', '', morsTable(mors)),
    '<div class="g-acts" style="margin-top:34px"><a class="g-btn red" href="' + letterHref + '">Send a letter about this one</a>'
      + '<a class="g-btn" href="' + esc(focusUrl(r.lat, r.lng, r.exact ? 16 : 12)) + '">View on the globe</a></div>',
    shareBlock(title, SITE + r.page, p.name + ' in ' + placeLine + '. ' + r.status + '.'),
    '<p class="g-foot">' + esc(SOURCE_FOOT) + '</p>'
  ].join('');

  const column = sat + '<div class="g-col">' + body + '</div>';

  const crumbs = [{ label: 'Home', url: '/' }, { label: r.country, url: countryUrl(r.country) }];
  if (r.region && regionWorthAPage(r.country, r.region)) crumbs.push({ label: r.region, url: regionUrl(r.country, r.region) });
  else if (r.region) crumbs.push({ label: r.region });
  if (r.county) crumbs.push({ label: r.county, url: countyUrl(r.country, r.region, r.county) });
  crumbs.push({ label: p.name });

  // A project page that opens with a line assembled from the data fields, not a researched
  // write-up, is a template with the numbers swapped. Noindex, out of the sitemap, still linked.
  const thin = !desc.reported && !desc.researched;
  if (thin) NOINDEX.add(r.page);
  write('project/' + r.slug + '/index.html', page({
    noindex: thin,
    url: r.page,
    title: title,
    description: metaDesc(clean(desc.text)),
    crumbs: crumbs,
    kicker: r.dev ? r.dev + ' project' : 'Tracked project',
    h1: title,
    sub: clean([p.address, aliases.length ? 'Also called ' + aliases.join(' and ') + '.' : ''].filter(Boolean).join('. ')),
    narrow: true,
    stats: factLine,
    // A tracked site is a physical place, so that is what it is described as. Coordinates
    // are only claimed where the parcel is known: where it is not, the page says so, and
    // publishing a town centre as the site's position would say otherwise.
    schema: [{
      '@type': 'Place',
      name: p.name,
      url: SITE + r.page,
      description: clean(desc.text).slice(0, 300),
      address: Object.assign({ '@type': 'PostalAddress' },
        p.address && /d/.test(String(p.address)) ? { streetAddress: clean(p.address) } : {},
        r.town ? { addressLocality: r.town } : {},
        r.region ? { addressRegion: r.region } : {},
        r.country ? { addressCountry: r.country } : {}),
      containedInPlace: areaLd(r.country, r.region, r.county),
      geo: r.exact ? { '@type': 'GeoCoordinates', latitude: r.lat, longitude: r.lng } : undefined,
      additionalProperty: [
        r.status ? { '@type': 'PropertyValue', name: 'Status', value: r.status } : null,
        r.dev ? { '@type': 'PropertyValue', name: 'Developer', value: r.dev } : null,
        p.capacity_mw ? { '@type': 'PropertyValue', name: 'Reported power', value: p.capacity_mw, unitCode: 'MAW', unitText: 'MW' } : null
      ].filter(Boolean)
    }],
    share: true,
    image: shareImage(r.lat, r.lng, r.exact),
    body: column
  }));
  stats.project++;
}

// ---------------------------------------------------------------- company pages

// Country, then state or region, then the table. Same markup as the wins page, so the two
// read the same way. Groups and rows are ordered biggest first, by power then by count.
function drilldownNested(tree2, openAll) {
  const weight = l => l.reduce((a, r) => a + (r.mw || 0), 0);
  const countries = Object.keys(tree2).sort((a, b) =>
    weight(tree2[b].list) - weight(tree2[a].list)
    || tree2[b].list.length - tree2[a].list.length
    || a.localeCompare(b));
  if (!countries.length) return '';
  const open = openAll || countries.length <= 3;

  return '<div class="w-tree">' + countries.map(c => {
    const g = tree2[c];
    const regions = Object.keys(g.regions).sort((a, b) =>
      weight(g.regions[b]) - weight(g.regions[a])
      || g.regions[b].length - g.regions[a].length
      || a.localeCompare(b));
    const mw = weight(g.list);
    const inner = regions.map(rg => {
      const rows = g.regions[rg];
      return '<details class="w-s"' + (open && countries.length === 1 ? ' open' : '') + '>'
        + '<summary><span class="w-nm">' + esc(rg) + '</span>'
        + '<span class="w-n">' + rows.length + '</span></summary>'
        + projectTable(rows) + '</details>';
    }).join('');
    return '<details class="w-c"' + (open ? ' open' : '') + '>'
      + '<summary><span class="w-nm">' + esc(c) + '</span>'
      + '<span class="w-n">' + g.list.length + (mw ? ' &middot; ' + num(Math.round(mw)) + ' MW' : '') + '</span>'
      + '</summary>' + inner
      + '<p class="w-note" style="margin-left:22px"><a href="' + esc(g.url) + '">'
      + 'Every data center in ' + esc(c) + '</a></p></details>';
  }).join('') + '</div>';
}

// Joins a list the way a person writes one: "a, b and c".
function listOf(items) {
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

function renderCompany(name, list) {
  const s = slug(name);
  const url = '/company/' + s + '/';
  const mid = centreOf(list);

  const byCountry = {};
  list.forEach(function (r) {
    const k = r.country;
    const g = (byCountry[k] = byCountry[k] || { list: [], regions: {}, url: countryUrl(k) });
    g.list.push(r);
    const rg = r.region || 'Region not recorded';
    (g.regions[rg] = g.regions[rg] || []).push(r);
  });

  const countries = Object.keys(byCountry).length;
  const art = articleFor({ url: url, name: name, shortName: name, list: list });
  if (art.sub) recordOpening(url, art.sub);

  const title = name + ' data centers: ' + plural(list.length, 'site') + ' mapped';

  const linkedHere = new Set();   // one link per target per page

  const body = [
    mapBlock({ maxZoom: 9, points: pointsOf(list), shapes: [], height: 380, alt: 'Map of ' + name + ' data center sites', count: plural(list.length, 'site') + ' shown' }),
    art.paragraphs.map(function (t, i) {
      return '<p class="g-body"' + (i === 0 ? ' id="summary"' : '') + '>' + linkify(esc(t), url, linkedHere) + '</p>';
    }).join(''),
    '<div class="g-acts">' + (mid ? '<a class="g-btn" href="' + esc(focusUrl(mid.lat, mid.lng, 4)) + '">View on the globe</a>' : '')
      + '<a class="g-btn red" href="/take-action">Send a letter</a></div>',
    section(name + ' sites on record',
      'Grouped by country, then by state or region, biggest first. Open one to see the projects there. The report above may name sites that have no record here yet.',
      drilldownNested(byCountry, countries <= 4), 'projects'),
    reportSources(reportFor(url)),
    '<p class="g-foot">' + esc(SOURCE_FOOT) + '</p>'
  ].join('');

  write('company/' + s + '/index.html', page({
    url: url,
    title: title,
    description: art.meta,
    crumbs: [{ label: 'Home', url: '/' }, { label: 'Companies', url: '/company/' }, { label: name }],
    schema: [
      { '@type': 'CollectionPage', url: SITE + url, name: title,
        about: { '@type': 'Organization', name: name } },
      itemListLd('Countries where ' + name + ' builds',
        Object.keys(byCountry).map(function (k) { return { name: k, url: byCountry[k].url }; }))
    ],
    kicker: 'Data centers by company',
    h1: title,
    sub: art.sub,
    stats: statsFor(list, [[num(countries), countries === 1 ? 'country' : 'countries', '#projects']]),
    body: body
  }));
  stats.company++;
}

// ---------------------------------------------------------------- the two hub pages

function renderHubs(companyIndex) {
  const cs = Object.keys(tree).sort(function (a, b) {
    return tree[b].list.length - tree[a].list.length || a.localeCompare(b);
  });
  const total = RECORDS.length;

  write('data-centers/index.html', page({
    url: '/data-centers/',
    title: 'Data centers by place: ' + plural(total, 'project') + ' in ' + plural(cs.length, 'country', 'countries'),
    description: 'Every data center project we track, sorted by country, state and county. ' + plural(total, 'site') + ' with status, company, power and sources.',
    crumbs: [{ label: 'Home', url: '/' }, { label: 'Data centers' }],
    letterJs: true,
    kicker: 'Data centers by place',
    h1: 'Data centers by place: ' + plural(total, 'project') + ' in ' + plural(cs.length, 'country', 'countries'),
    sub: 'Pick a country to drill down to a state, a county and then a single site. Every page is built from the same public records the map uses.',
    stats: statsFor(RECORDS, []),
    body: [
      mapBlock({ maxZoom: 9, points: pointsOf(RECORDS), shapes: [], height: 420, alt: 'Map of every tracked data center site', count: plural(total, 'site') + ' shown' }),
      section('Every country we track', '', '<ul class="g-list">' + cs.map(function (c) {
        return '<li><a href="' + esc(countryUrl(c)) + '">' + esc(c) + '</a><span class="n">' + tree[c].list.length + '</span></li>';
      }).join('') + '</ul>'),
      section('Browse by company', 'Companies with three or more sites have their own page.',
        '<div class="g-acts"><a class="g-btn" href="/company/">See every company</a></div>'),
      '<p class="g-foot">' + esc(SOURCE_FOOT) + '</p>'
    ].join('')
  }));
  stats.country++;

  const names = Object.keys(companyIndex).sort(function (a, b) {
    return companyIndex[b].length - companyIndex[a].length || a.localeCompare(b);
  });
  write('company/index.html', page({
    url: '/company/',
    title: 'Data center companies: ' + plural(names.length, 'operator') + ' tracked',
    description: 'Every company with three or more data center sites in our records, with how many sites each one has and where they are.',
    crumbs: [{ label: 'Home', url: '/' }, { label: 'Companies' }],
    kicker: 'Data centers by company',
    h1: 'Data center companies: ' + plural(names.length, 'operator') + ' tracked',
    sub: 'Companies building, running or proposing three or more of the sites we track. Open one to see every site and where it stands.',
    stats: statHtml([[num(names.length), 'companies'], [num(names.reduce(function (a, n) { return a + companyIndex[n].length; }, 0)), 'sites between them']]),
    body: [
      section('Every company we track', '', '<ul class="g-list">' + names.map(function (n) {
        return '<li><a href="/company/' + esc(slug(n)) + '/">' + esc(n) + '</a><span class="n">' + companyIndex[n].length + '</span></li>';
      }).join('') + '</ul>'),
      '<p class="g-foot">' + esc(SOURCE_FOOT) + '</p>'
    ].join('')
  }));
  stats.company++;
}

// ---------------------------------------------------------------- pages that moved or went
//
// Renaming a region, merging two companies or correcting a county's name changes a url, and the
// old one starts returning 404 to anyone who linked to it or found it in a search result. The
// build keeps its own list of every page it wrote last time in data/page-urls.json, compares it
// with what it has just written, and sends anything that has gone to the nearest page that still
// exists. Nothing here needs git, and it stays correct on its own for the next rename.
//
// The company merges are the one case the walk up cannot work out on its own, because
// /company/mc-digital-realty/ has no parent that means anything, so the alias table answers it.

// The region name the old address parser would have produced, kept only so that a page it
// created can be pointed at the region that now holds the same projects. Frankfurt, Milan,
// Dublin and Hortolandia were towns it mistook for regions; VIC, NSW, QC and SP were
// abbreviations it took at face value. Both kinds now resolve to the real region.
function legacyRegion(addr, country) {
  const parts = addressParts(addr, country);
  if (parts.length < 2) return '';
  const cand = parts[parts.length - 1];
  if (!cand || /\d/.test(cand) || cand.length < 2 || STREETY.test(cand)) return '';
  if (String(cand).toLowerCase() === String(country).toLowerCase()) return '';
  return cand;
}

// old region url -> the region page that now holds the majority of those projects
function legacyRegionTargets(now) {
  const byOld = {};
  RECORDS.forEach(r => {
    if (r.country === 'United States') return;
    const old = legacyRegion(r.p.address, r.country);
    if (!old) return;
    const from = '/data-centers/' + countrySlug[r.country] + '/' + slug(old) + '/';
    if (now.has(from)) return;                       // that page still exists under that name
    (byOld[from] = byOld[from] || []).push(r);
  });
  const out = {};
  Object.keys(byOld).forEach(from => {
    const tally = {};
    byOld[from].forEach(r => { if (r.region) tally[r.region] = (tally[r.region] || 0) + 1; });
    const best = Object.keys(tally).sort((a, b) => tally[b] - tally[a] || a.localeCompare(b))[0];
    if (!best) return;
    const c = byOld[from][0].country;
    const to = regionUrl(c, best);
    if (now.has(to)) out[from] = to;
  });
  return out;
}

// read before this run overwrites it: the last build's id -> project url map
let MERGED_INTO = {};
try { MERGED_INTO = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/merged-records.json'), 'utf8')); } catch (e) { MERGED_INTO = {}; }
let PREV_PROJECT_PAGES = {};
try { PREV_PROJECT_PAGES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/project-pages.json'), 'utf8')); } catch (e) { PREV_PROJECT_PAGES = {}; }

function goneRedirects(currentUrls) {
  const PREV_FILE = path.join(ROOT, 'data/page-urls.json');
  let prev = [];
  try { prev = JSON.parse(fs.readFileSync(PREV_FILE, 'utf8')); } catch (e) { prev = []; }

  const now = new Set(currentUrls);
  const gone = prev.filter(u => !now.has(u));

  const companyTarget = {};
  Object.keys(COMPANY_ALIAS).forEach(canon => {
    COMPANY_ALIAS[canon].forEach(alias => {
      const from = '/company/' + slug(alias) + '/';
      const to = '/company/' + slug(canon) + '/';
      if (now.has(to)) companyTarget[from] = to;
    });
  });

  const regionTarget = legacyRegionTargets(now);

  // A project page whose url changed (a corrected town, county or name) goes to the same project's
  // new page; one whose project no longer earns a page goes to the county, region or country page
  // that lists it, never to the top of the site. The last build's id -> url map says whose page it was.
  const projectTarget = {};
  const prevPages = PREV_PROJECT_PAGES;
  Object.keys(prevPages).forEach(id => {
    // a record merged into another as a duplicate (data/merged-records.json) redirects to the survivor
    const from = prevPages[id], r = RECORD_BY_ID[id] || RECORD_BY_ID[MERGED_INTO[id]];
    if (!from || now.has(from) || !r) return;
    const cands = [r.page,
      r.county && r.region ? countyUrl(r.country, r.region, r.county) : '',
      r.region ? regionUrl(r.country, r.region) : '',
      countryUrl(r.country)];
    const to = cands.find(u => u && now.has(u));
    if (to && to !== from) projectTarget[from] = to;
  });

  const rules = [];
  gone.forEach(u => {
    if (projectTarget[u]) { rules.push([u, projectTarget[u]]); return; }
    if (companyTarget[u] && companyTarget[u] !== u) { rules.push([u, companyTarget[u]]); return; }
    if (regionTarget[u] && regionTarget[u] !== u) { rules.push([u, regionTarget[u]]); return; }
    const parts = u.split('/').filter(Boolean);
    // a county whose name was corrected keeps its place: young -> young-county
    const lastSlug = parts[parts.length - 1];
    const parent = '/' + parts.slice(0, -1).join('/') + '/';
    const renamed = currentUrls.find(x => x.startsWith(parent)
      && x.split('/').filter(Boolean).length === parts.length
      && x.split('/').filter(Boolean).pop().indexOf(lastSlug + '-') === 0);
    if (renamed) { rules.push([u, renamed]); return; }
    let target = '';
    for (let i = parts.length - 1; i >= 1; i--) {
      const up = '/' + parts.slice(0, i).join('/') + '/';
      if (now.has(up)) { target = up; break; }
    }
    if (!target && parts[0] === 'company') target = now.has('/company/') ? '/company/' : '';
    if (!target) target = '/data-centers/';
    if (target !== u) rules.push([u, target]);
  });

  // These have to survive the next build. The generated block in _redirects is rebuilt from
  // scratch every run, so a rule that only existed in this run's `gone` set would vanish the
  // moment the url list caught up. The map is kept instead, and every rule in it is written
  // out every time.
  const MOVED_FILE = path.join(ROOT, 'data/moved-urls.json');
  let moved = {};
  try { moved = JSON.parse(fs.readFileSync(MOVED_FILE, 'utf8')); } catch (e) { moved = {}; }
  rules.forEach(r => { moved[r[0]] = r[1]; });

  // A page that has come back under its old name owns its url again, and a target that has
  // since moved on is followed to wherever it ended up, so no rule points at a 404.
  Object.keys(moved).forEach(from => {
    if (now.has(from)) { delete moved[from]; return; }
    let to = moved[from], hops = 0;
    while (!now.has(to) && moved[to] && hops++ < 5) to = moved[to];
    if (now.has(to) && to !== from) moved[from] = to;
    else if (!now.has(to)) delete moved[from];
  });

  fs.writeFileSync(MOVED_FILE, JSON.stringify(moved, null, 1));
  fs.writeFileSync(PREV_FILE, JSON.stringify(currentUrls.slice().sort()));
  return Object.keys(moved).sort().map(k => [k, moved[k]]);
}

// ---------------------------------------------------------------- run

rmrf(path.join(ROOT, 'data-centers'));
rmrf(path.join(ROOT, 'project'));
rmrf(path.join(ROOT, 'company'));

const URLS = [];
const trackUrl = u => { URLS.push(u); };
// Pages that are built and linked but carry noindex: tracked for redirects, kept out of the sitemap.
const NOINDEX = new Set();

Object.keys(tree).forEach(function (c) {
  renderCountry(c);
  trackUrl(countryUrl(c));
  Object.keys(tree[c].regions).forEach(function (rg) {
    if (!regionWorthAPage(c, rg)) return;
    renderRegion(c, rg);
    trackUrl(regionUrl(c, rg));
    Object.keys(tree[c].regions[rg].counties).forEach(function (cy) {
      renderCounty(c, rg, cy);
      trackUrl(countyUrl(c, rg, cy));
    });
  });
});
Object.keys(BAN_COUNTIES).forEach(function (f) {
  renderBanCounty(BAN_COUNTIES[f]);
  trackUrl(BAN_COUNTIES[f].url);
  NOINDEX.add(BAN_COUNTIES[f].url);
});

RECORDS.filter(function (r) { return r.page; }).forEach(function (r) {
  renderProject(r);
  trackUrl(r.page);
});

// Rendered now; the list itself was settled next to the records.
Object.keys(COMPANY).forEach(function (n) {
  renderCompany(n, COMPANY[n]);
  trackUrl('/company/' + slug(n) + '/');
});

renderHubs(COMPANY);
trackUrl('/data-centers/');
trackUrl('/company/');

// The page Cloudflare Pages serves for anything that is not here. Built from the same
// template as every other page, so it carries the real header, footer and styling instead
// of being a stray file that ages on its own. It is noindex and it is kept out of the
// sitemap, because a 404 should never be a search result. Whoever landed here was looking
// for a place, so the map comes first.
write('404.html', page({
  url: '/404',
  noindex: true,
  title: 'Page not found',
  description: 'That page is not here. Find a data center near you on the map, or browse by country, state and county.',
  crumbs: [{ label: 'Home', url: '/' }, { label: 'Page not found' }],
  kicker: 'Error 404',
  h1: 'That page is not here.',
  sub: 'The link may be old, or we may have moved the page. Everything we track is still on the map.',
  narrow: true,
  body: '<div class="g-col">'
    + '<p class="g-body">Start from the map to find what is proposed or running near you, or work down from a country to a state and a county.</p>'
    + '<div class="g-acts" style="margin-top:30px">'
      + '<a class="g-btn red" href="/">Open the map</a>'
      + '<a class="g-btn" href="/data-centers/">Browse every country</a>'
      + '<a class="g-btn" href="/wins">Where communities won</a>'
    + '</div>'
    + section('If you were looking for something specific', '',
        '<ul class="g-list">'
        + '<li><a href="/data-centers/united-states/">Data centers in the United States</a></li>'
        + '<li><a href="/company/">Data centers by company</a></li>'
        + '<li><a href="/take-action">Send a letter</a></li>'
        + '<li><a href="/wins#moratoriums">Moratoriums and bans in effect</a></li>'
        + '</ul>')
    + '</div>'
}));

// The globe card needs to know which sites have a page of their own.
const pageIndex = {};
RECORDS.forEach(function (r) { if (r.page) pageIndex[r.id] = r.page; });
fs.writeFileSync(path.join(ROOT, 'data/project-pages.json'), JSON.stringify(pageIndex));
// The still map pictures these pages point at. tools/fetch-map-stills.js downloads any missing.
fs.writeFileSync(path.join(ROOT, 'data/map-stills.json'), JSON.stringify(MAP_STILLS, null, 1));
// The wins page links each moratorium to its place: the county page, the state page for a
// statewide rule, else the country page. Same order as data/wins.json.
fs.writeFileSync(path.join(ROOT, 'data/moratorium-pages.json'), JSON.stringify(MOR_LIST.map(function (m) {
  return morPage(m) || (tree[m.country] && m.state && tree[m.country].regions[m.state] && regionWorthAPage(m.country, m.state) ? regionUrl(m.country, m.state) : tree[m.country] ? countryUrl(m.country) : '');
})));

fs.writeFileSync(CACHE_FILE, JSON.stringify(geoCache));

// ---------------------------------------------------------------- redirects

// Old floridadatacenters.org paths, pointed at whatever replaced them. A redirect is only
// written when the target page was actually generated. Anything left over is reported, not guessed.
// The Florida-only pages this site grew out of now live in archive/legacy-florida/, where the
// writing is kept but nothing is served, so every one of them needs somewhere to go. A county
// with no tracked project has no page of its own, so it goes up to the Florida state page.
const FL_FALLBACK_TO_STATE = true;
const FL_STATE_URL = '/data-centers/united-states/florida/';

// The retired pages are read off disk rather than listed here, so that archiving one more,
// or bringing one back, needs no edit to this file.
const LEGACY_DIR = path.join(ROOT, 'archive', 'legacy-florida');
function legacyFiles(sub) {
  try { return fs.readdirSync(sub ? path.join(LEGACY_DIR, sub) : LEGACY_DIR, { withFileTypes: true })
    .filter(function (e) { return e.isFile() && /\.html$/.test(e.name); })
    .map(function (e) { return e.name; }); }
  catch (e) { return []; }
}

// A handful of the retired pages have a better home than the state page. The homepage and
// the wins page are written by hand rather than generated, so they are listed as valid
// destinations here; everything else has to have been generated to be used.
const HAND_WRITTEN_PAGES = new Set(['/', '/wins']);
const LEGACY_SPECIAL = {
  'moratorium': '/wins',
  'communities-blocking-156-billion-data-centers': '/wins',
  'maine-data-center-moratorium-vetoed': '/data-centers/united-states/maine/',
  'citrus-county-moratorium-victory': '/data-centers/united-states/florida/citrus-county/',
  // The news page is answered by the wins list; the methodology page and the risk
  // calculator are answered by the address checker on the homepage and its scoring note.
  'news': '/wins',
  'methodology': '/',
  'risk-calculator': '/'
};

const generated = new Set(URLS);
const unmapped = [];
const newRules = [];

function flCountyUrl(countySlugName) {
  const u = '/data-centers/united-states/florida/' + countySlugName + '/';
  return generated.has(u) ? u : null;
}

// Where a retired page should send a reader: its own county page if one was generated,
// otherwise whatever answers the same question, otherwise Florida.
function legacyTarget(nameSlug) {
  const special = LEGACY_SPECIAL[nameSlug];
  if (special && (generated.has(special) || HAND_WRITTEN_PAGES.has(special))) return special;
  const m = /^(.+)-county$/.exec(nameSlug);
  if (m) { const to = flCountyUrl(nameSlug); if (to) return to; }
  return FL_STATE_URL;
}

// A page is only a county page if a county of that name is among the retired thin templates.
// "google-ai-search-data-centers-your-county" ends in -county and is not one.
const LEGACY_COUNTY_SLUGS = new Set(legacyFiles('counties').map(function (f) { return f.replace(/\.html$/, ''); }));

legacyFiles().forEach(function (f) {
  const nameSlug = f.replace(/\.html$/, '');
  const to = legacyTarget(nameSlug);
  newRules.push(['/' + nameSlug, to]);
  const m = /^(.+)-county$/.exec(nameSlug);
  if (to === FL_STATE_URL && m && LEGACY_COUNTY_SLUGS.has(m[1])) {
    unmapped.push('/' + nameSlug + '  (retired; no tracked projects in that county, so it goes to the Florida page)');
  }
});

// The old Florida site carried one page per state at /<state>-data-center-opposition, in
// the design it used before this one. Those 50 files have been deleted; each path now points
// at the state's page here. The list is written out rather than read off disk precisely
// because the files are gone, and the paths still have to resolve.
const OLD_STATE_PAGES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire',
  'new-jersey', 'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west-virginia',
  'wisconsin', 'wyoming'
];
const US_ROOT = '/data-centers/united-states/';
OLD_STATE_PAGES.forEach(function (s) {
  const u = US_ROOT + s + '/';
  // A couple of states have no tracked projects, so no page of their own was generated.
  // The United States page answers the same question; a 404 would not.
  if (!generated.has(u)) unmapped.push('/' + s + '-data-center-opposition  (no state page generated, sent to ' + US_ROOT + ')');
  newRules.push(['/' + s + '-data-center-opposition', generated.has(u) ? u : US_ROOT]);
});

// The thin per-county template pages that used to sit at /counties/<name> are retired too.
// They go straight to their county's page where one exists, rather than hopping through the
// longer write-up first, which is now archived as well.
legacyFiles('counties').forEach(function (f) {
  const nameSlug = f.replace(/\.html$/, '');
  const to = flCountyUrl(nameSlug + '-county');
  if (to) { newRules.push(['/counties/' + nameSlug, to]); return; }
  if (FL_FALLBACK_TO_STATE && generated.has(FL_STATE_URL)) {
    newRules.push(['/counties/' + nameSlug, FL_STATE_URL]);
    return;
  }
  unmapped.push('/counties/' + nameSlug + '  (no tracked projects in that county, and no Florida page to fall back to)');
});

// The block this script owns is fenced off. Everything a person wrote outside the fence
// is kept exactly as it is, and the fence itself is rebuilt from scratch on every run.
const BEGIN_MARK = '# >>> generated by data/build-pages.js, do not edit below this line';
const END_MARK = '# <<< end generated block';

let handWritten = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
const fenceAt = handWritten.indexOf(BEGIN_MARK);
if (fenceAt >= 0) {
  const after = handWritten.indexOf(END_MARK, fenceAt);
  handWritten = handWritten.slice(0, fenceAt) + (after >= 0 ? handWritten.slice(after + END_MARK.length) : '');
}

// Drop any earlier hand written rule for a path this script now owns, so there is one
// rule per path and the generated one wins.
// Pages that existed last build and do not now: renamed regions, merged companies, a county
// whose name was corrected. Added before the ownership filter so they land inside the block.
const movedRules = goneRedirects(URLS);
movedRules.forEach(function (r) { newRules.push(r); });

const owned = new Set(newRules.map(function (r) { return r[0]; }));
const kept = handWritten.split('\n').filter(function (l) {
  const src = l.trim().split(/\s+/)[0];
  if (!src || src[0] === '#') return true;
  if (owned.has(src)) return false;
  if (/^\/counties\//.test(src)) return false;
  if (src === '/') return false;
  return true;
});

const srcWidth = Math.max.apply(null, newRules.map(function (r) { return r[0].length; }).concat([20])) + 2;
const dstWidth = Math.max.apply(null, newRules.map(function (r) { return r[1].length; }).concat([20])) + 2;

const redirectText = kept.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '')
  + '\n\n' + BEGIN_MARK + '\n'
  + '# Old floridadatacenters.org county paths and per state pages, pointed at whatever replaced them.\n'
  + '# The old Florida homepage is redirected in functions/_middleware.js instead of here,\n'
  + '# because this file cannot match on hostname and a bare "/" rule would also redirect\n'
  + '# the globaldatacenters.net homepage.\n'
  + newRules.map(function (r) {
      return r[0].padEnd(srcWidth) + r[1].padEnd(dstWidth) + '301';
    }).join('\n')
  + '\n' + END_MARK + '\n';
fs.writeFileSync(path.join(ROOT, '_redirects'), redirectText);

// ---------------------------------------------------------------- sitemap and robots

// Pages that existed before this script did. They keep working and they stay in the sitemap.
const SKIP_EXISTING = /^(global-preview-|preview-|free\.html$|moratorium\.html$|404\.html$|.*-success\.html$)/;
const existingPages = fs.readdirSync(ROOT)
  .filter(function (f) { return /\.html$/.test(f) && !SKIP_EXISTING.test(f); })
  .map(function (f) {
    const stat = fs.statSync(path.join(ROOT, f));
    return { loc: f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''), lastmod: stat.mtime.toISOString().slice(0, 10) };
  });

// A page that now answers with a 301 does not belong in a sitemap.
const redirected = new Set(newRules.map(function (r) { return r[0]; }));

const sitemapRows = existingPages
  .filter(function (p) { return !redirected.has(p.loc); })
  .concat(URLS.filter(function (u) { return !NOINDEX.has(u); }).map(function (u) { return { loc: u, lastmod: TODAY }; }))
  .filter(function (r, i, a) { return a.findIndex(function (x) { return x.loc === r.loc; }) === i; })
  .sort(function (a, b) { return a.loc.localeCompare(b.loc); });

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + sitemapRows.map(function (r) {
      return '  <url><loc>' + SITE + r.loc + '</loc><lastmod>' + r.lastmod + '</lastmod></url>';
    }).join('\n')
  + '\n</urlset>\n');

fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /defense-kit-success\nDisallow: /take-action-success\nDisallow: /shop-success\nDisallow: /api/\n\nSitemap: ' + SITE + '/sitemap.xml\n');

// ---------------------------------------------------------------- report

function countFiles(dir) {
  let n = 0;
  const walk = function (d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules' || e.name === '.wrangler') continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full); else n++;
    }
  };
  walk(dir);
  return n;
}

const totalFiles = countFiles(ROOT);
const skipped = RECORDS.filter(function (r) { return !r.page; });

console.log('');
console.log('Pages generated');
console.log('  country pages (incl. /data-centers/)  ' + stats.country);
console.log('  state and region pages                ' + stats.region);
console.log('  county and area pages                 ' + stats.county);
console.log('  project pages                         ' + stats.project);
console.log('  company pages (incl. /company/)       ' + stats.company);
console.log('  total files written                   ' + written);
console.log('');
console.log('Projects');
console.log('  sites in projects.json                ' + SITES.length);
console.log('  placed on the map                     ' + RECORDS.length + (unplaced.length ? ' (' + unplaced.length + ' had no coordinates)' : ''));
console.log('  with a page of their own              ' + stats.project);
console.log('    reported, written from sources      ' + descStats.reported);
console.log('    researched description              ' + descStats.researched);
console.log('    description built from the data     ' + descStats.fallback);
console.log('  listed only on a county page          ' + skipped.length);
console.log('    no source link                      ' + skipped.filter(function (r) { return sourceLinks(r.p).length === 0; }).length);
console.log('    status not known                    ' + skipped.filter(function (r) { return statusKey(r.p) === ''; }).length);
console.log('    small or colocation                 ' + skipped.filter(function (r) { return isSmall(r.p); }).length);
console.log('');
console.log('Geography');
console.log('  county lookups from cache             ' + cacheHits);
console.log('  county lookups computed               ' + cacheAdds);
console.log('  US sites with no county match         ' + RECORDS.filter(function (r) { return r.country === 'United States' && !r.county; }).length);
console.log('  countries read off the map shapes     ' + countryFixes.length + (countryFixes.length ? ' (' + countryFixes.slice(0, 3).join('; ') + (countryFixes.length > 3 ? ' ...' : '') + ')' : ''));
// ---------------------------------------------------------------- the self-contradiction gate
//
// Travis County shipped with "Data centers in Travis County, Texas: 6 projects mapped" as its
// headline and "Austin has no large-scale AI data center yet" as its first sentence. Both were
// true -- Austin is a city inside the county -- and side by side they read as the page arguing
// with itself. It was the first thing a reader saw, and fourteen reviewers had missed it, because
// the review read the PROSE out of the lane files and the headline is generated HERE, from the
// project count. Nobody ever saw the two together.
//
// A review can be skipped and a checklist can be forgotten. A build cannot. So the check lives in
// the build and FAILS it, rather than printing a warning nobody reads.
//
// It is deliberately narrow. It fires only when the opening sentence denies that a data centre
// exists, names a place that is not this page's place, and gives no scope word that would explain
// the difference. That is the exact shape that misleads a reader. An earlier, looser version
// flagged "Canada has no national data center policy" and "not one local official voted for it",
// which are fine, and a checker that cries wolf gets switched off.
(function selfContradictionGate() {
  const DENIES = /\b(?:has|have|there is|there are)\s+no\s+(?:new\s+|large[-\s]scale\s+|hyperscale\s+|major\s+|confirmed\s+|operating\s+|AI\s+)*data\s+cent(?:er|re)/i;
  const SCOPED = /\b(?:inside|within|in the city|city limits|city of|town of|village of|unincorporated|itself|proper|downtown|county seat)\b/i;
  const bad = [];
  Object.keys(PAGE_HTML_FOR_GATE).forEach(function (rel) {
    const html = PAGE_HTML_FOR_GATE[rel];
    const h1 = /<h1>([\s\S]*?)<\/h1>/.exec(html);
    const lead = /<p class="g-body" id="summary">([\s\S]*?)<\/p>/.exec(html);
    if (!h1 || !lead) return;
    const head = h1[1].replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
    const m = /^Data centers in (.+?):\s*([\d,]+)\s+projects?\s+mapped/.exec(head);
    if (!m || parseInt(m[2].replace(/,/g, ''), 10) < 1) return;
    const first = lead[1].replace(/<[^>]*>/g, '').replace(/&#\d+;|&[a-z]+;/g, ' ')
      .trim().split(/(?<=[.!?])\s+/)[0] || '';
    if (!DENIES.test(first) || SCOPED.test(first)) return;
    // Does the denial name this page's own place? Then it is not a contradiction.
    const names = m[1].split(',').map(function (x) {
      return x.trim().toLowerCase().replace(/\s+(county|parish|borough|district|province|region)$/, '');
    }).filter(Boolean);
    const low = first.toLowerCase();
    if (names.some(function (n) { return n && low.indexOf(n) !== -1; })) return;
    bad.push({ rel: rel, head: head, first: first.slice(0, 160) });
  });
  if (bad.length) {
    console.log('');
    console.log('BUILD FAILED: ' + bad.length + ' page(s) contradict their own headline.');
    bad.forEach(function (b) {
      console.log('');
      console.log('  ' + b.rel);
      console.log('    headline: ' + b.head);
      console.log('    opens:    "' + b.first + '"');
    });
    console.log('');
    console.log('  The headline counts projects here; the first sentence says there are none.');
    console.log('  Name the narrower place ("Inside Austin\'s city limits there is no...") or');
    console.log('  rewrite the lead. Do not delete the sentence: it is usually true.');
    process.exitCode = 1;
  } else {
    console.log('  self-contradiction gate                PASS (no page argues with its headline)');
  }
})();

console.log('');
console.log('Site files');
console.log('  sitemap.xml entries                   ' + sitemapRows.length);
console.log('  place pages with researched reporting ' + reportStats.written.size
  + ' of ' + (reportStats.written.size + reportStats.fallback.size));
console.log('  redirects written                     ' + newRules.length);
console.log('  files in the deploy directory         ' + totalFiles + '  (Cloudflare Pages allows 20,000)');
if (totalFiles >= 20000) console.log('  WARNING: over the Cloudflare Pages file limit.');
if (wrongStateRows.length) {
  console.log('');
  console.log('Moratorium/win rows pinned in a different state from the one they name, kept off county pages (' + wrongStateRows.length + '):');
  wrongStateRows.forEach(function (u) { console.log('  ' + u); });
}
if (unmapped.length) {
  console.log('');
  console.log('Old URLs that could not be mapped (' + unmapped.length + '):');
  unmapped.forEach(function (u) { console.log('  ' + u); });
}
if (unplaced.length) {
  console.log('');
  console.log('Sites with no coordinates, left off every page (' + unplaced.length + '): ' + unplaced.slice(0, 20).join(', '));
}
