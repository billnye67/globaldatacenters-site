// Merge research CSVs into data/projects.json. Run from the repo root: node data/merge.js
// Drop any CSV in data/incoming/ (Gemini, Perplexity, the Claude research blocks).
// Accepts comma or semicolon separated files with the brief's columns, in any order.
// Rules: Epoch entries always win; duplicates (same site) are skipped and reported;
// rows that aren't physical sites (power deals, "clusters", unknown location) are skipped;
// new rows get confidence "needs-check" until a second source or a human confirms them.
const fs = require('fs');
const path = 'data/projects.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));
const dir = 'data/incoming';

function parseCSV(text, sep) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i+1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const key = s => norm(s).replace(/\b(data center|datacenter|campus|ai|the|project|site|hyperscale)\b/g, '').replace(/\s+/g, ' ').trim();
const unk = v => !v || /^(unknown|n\/a|na|none|-|tbd)$/i.test(v.trim());
const col = (h, ...names) => { for (const n of names) { const i = h.findIndex(x => norm(x).startsWith(norm(n))); if (i >= 0) return i; } return -1; };
const statusMap = { announced: 'proposed', planned: 'proposed', 'on hold': 'on hold', operational: 'operating', cancelled: 'withdrawn', canceled: 'withdrawn' };
const country = c => ({ usa: 'United States', us: 'United States', 'united states': 'United States', uk: 'United Kingdom', uae: 'United Arab Emirates' })[norm(c)] || c;

const STOP = new Set('stargate township campus tech technology park creek data center centre campus ai hub cloud digital project site sites expansion county parish township region area north south east west 1 2 3 4 i ii iii flagship new mega the of and inc llc us usa dev'.split(' '));
const GENERIC = new Set('unknown multiple various n/a na speculative likely hyperscale sovereign national public compute cloud clients workloads undisclosed developer owner group energy partners infrastructure digital datacenters data centers center web services ai inc llc ltd corp co plc china united states american india korea government federal'.split(' '));
const words = s => norm(s).split(' ').filter(Boolean);
const parties = (dev, ten) => new Set([dev, ten].filter(Boolean).flatMap(words).filter(w => w.length > 2 && !GENERIC.has(w)));
const toks = (n, pt) => new Set(words(n).filter(t => t.length > 2 && !STOP.has(t) && !GENERIC.has(t) && !pt.has(t) && ![...pt].some(w => w.startsWith(t) || t.startsWith(w))));
const streetOf = a => { const f = norm((a || '').split(',')[0]); return /\d/.test(f) || /\b(rd|road|st|street|ave|avenue|dr|drive|blvd|pkwy|parkway|ln|lane|hwy|highway|way|ct|court|pl|route|rte)\b/.test(f) ? f : ''; };
let currentAddr = '';
const km = (a, b, c, d) => { const r = Math.PI/180, x = (c-a)*r, y = (d-b)*r; const h = Math.sin(x/2)**2 + Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2; return 12742*Math.asin(Math.sqrt(h)); };
let currentCity = '', currentRegion = '';
const US = {alabama:'al',alaska:'ak',arizona:'az',arkansas:'ar',california:'ca',colorado:'co',connecticut:'ct',delaware:'de',florida:'fl',georgia:'ga',hawaii:'hi',idaho:'id',illinois:'il',indiana:'in',iowa:'ia',kansas:'ks',kentucky:'ky',louisiana:'la',maine:'me',maryland:'md',massachusetts:'ma',michigan:'mi',minnesota:'mn',mississippi:'ms',missouri:'mo',montana:'mt',nebraska:'ne',nevada:'nv','new hampshire':'nh','new jersey':'nj','new mexico':'nm','new york':'ny','north carolina':'nc','north dakota':'nd',ohio:'oh',oklahoma:'ok',oregon:'or',pennsylvania:'pa','rhode island':'ri','south carolina':'sc','south dakota':'sd',tennessee:'tn',texas:'tx',utah:'ut',vermont:'vt',virginia:'va',washington:'wa','west virginia':'wv',wisconsin:'wi',wyoming:'wy'};
function regionOf(address) { const parts = (address || '').split(',').map(x => norm(x)); for (const part of parts) { const m = part.match(/\b([a-z]{2})\b\s*\d{5}$/) || part.match(/^([a-z]{2})$/); if (m && Object.values(US).includes(m[1])) return m[1]; for (const [n, c] of Object.entries(US)) if (part === n) return c; } return ''; }
function findDup(name, dev, ten, ctry, lat, lng) {
  const rowRegion = US[norm(currentRegion)] || (Object.values(US).includes(norm(currentRegion)) ? norm(currentRegion) : '');
  const pt = parties(dev, ten), k = key(name);
  let best = null, bestScore = 0;
  for (const p of db.projects) {
    if (norm(p.country) !== norm(ctry)) continue;
    if (rowRegion) { const pr = regionOf(p.address); if (pr && pr !== rowRegion) continue; }
    const numA = (norm(name).match(/\b(i{1,3}|iv|v|\d+)$/) || [])[1], numB = (norm(p.name).match(/\b(i{1,3}|iv|v|\d+)$/) || [])[1];
    if (numA && numB && numA !== numB) continue; // "Montreal II" and "Montreal III" are different sites
    if (key(p.name) === k) return p;
    if (p.aliases && p.aliases.some(a => key(a) === k)) return p;
    const pp = parties(p.developer, p.tenant);
    const allP = new Set([...pt, ...pp]);
    const shareParty = [...pt].some(x => pp.has(x));
    if (!shareParty) continue;
    const t = toks(name, allP), pk = toks(p.name, allP);
    const overlap = [...t].filter(x => pk.has(x)).length;
    const rowCity = norm(currentCity || '');
    const sameCity = rowCity.length > 3 && (p.address || '').split(',').map(x => norm(x).replace(/\s+\d{5}$/, '').trim()).some(cityB => cityB.length > 3 && (cityB === rowCity || cityB.endsWith(' ' + rowCity) || rowCity.endsWith(' ' + cityB)));
    const sA = streetOf(currentAddr), sB = streetOf(p.address);
    const bothStreets = sA && sB;
    const streetsDiffer = bothStreets && sA !== sB && !words(sA).some(w => w.length > 3 && words(sB).includes(w));
    if (streetsDiffer) continue; // two different street addresses are two different sites
    const near = lat != null && p.lat != null && km(lat, lng, p.lat, p.lng) < (bothStreets ? 1.5 : 15);
    const distinctBoth = t.size > 0 && pk.size > 0 && overlap === 0;
    const score = overlap * 10 + (near ? 5 : 0) + (sameCity && !distinctBoth && !streetsDiffer ? 8 : 0);
    if (score > bestScore) { best = p; bestScore = score; }
  }
  return best;
}
let added = 0, dup = 0, skipped = 0; const report = [];

for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.csv') && !/^addresses/i.test(f))) {
  const text = fs.readFileSync(`${dir}/${f}`, 'utf8');
  const sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const rows = parseCSV(text, sep); const h = rows[0];
  const I = { name: col(h,'project name','project_name','name'), dev: col(h,'developer'), ten: col(h,'tenant'), city: col(h,'city'), region: col(h,'state'), country: col(h,'country'), lat: col(h,'latitude','lat'), lng: col(h,'longitude','lng','lon'), mw: col(h,'capacity'), size: col(h,'site size','site_size'), status: col(h,'status'), ya: col(h,'year announced','year_announced'), yo: col(h,'year operating','year_operating'), note: col(h,'one-sentence','note'), addr: col(h,'address'), src: col(h,'source url','source_url','source'), img: col(h,'image_url','image url'), cred: col(h,'image_credit','image credit') };
  for (const r of rows.slice(1)) {
    const g = i => (i >= 0 ? (r[i] || '').trim() : '');
    const name = g(I.name); if (!name || norm(name) === 'project name') continue;
    const src = g(I.src); const cty = g(I.city), reg = g(I.region), ctry = country(g(I.country));
    if (/vppa|power purchase|cluster\b|\(us\)$/i.test(name) || (unk(cty) && unk(reg))) { skipped++; report.push(`SKIP  ${name} (not a mappable site)`); continue; }
    const k = key(name);
    const lat = parseFloat(g(I.lat)), lng = parseFloat(g(I.lng));
    const hasLL = !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    const addr = (I.addr >= 0 && !unk(g(I.addr))) ? g(I.addr) : [cty, reg, ctry].filter(x => !unk(x)).join(', ');
    currentCity = unk(cty) ? '' : cty; currentRegion = unk(reg) ? '' : reg; currentAddr = addr;
    const d = findDup(name, g(I.dev), g(I.ten), ctry, hasLL ? lat : null, hasLL ? lng : null);
    const img = g(I.img), cred = g(I.cred);
    if (d) {
      dup++; report.push(`DUP   ${name}  =  ${d.name}`);
      if (src && !d.sources.includes(src)) d.sources.push(src);
      if (img && !d.image) { d.image = img; d.image_credit = cred || null; d.image_source_url = src || null; }
      if (streetOf(addr) && !streetOf(d.address)) { d.address = addr; d.geocode = 'pending'; d.lat = null; d.lng = null; report.push(`ADDR  ${d.name}  <-  ${addr}`); }
      { const st = statusMap[norm(g(I.status))] || norm(g(I.status)); if ((!d.status || d.status === 'unknown') && st && st !== 'unknown') d.status = st; }
      continue;
    }
    const mw = parseFloat(g(I.mw));
    let status = norm(g(I.status)); status = statusMap[status] || status || 'unknown';
    db.projects.push({
      id: f.replace('.csv','') + '-' + k.replace(/\s+/g,'-'), name, developer: unk(g(I.dev)) ? 'unknown' : g(I.dev),
      tenant: unk(g(I.ten)) ? null : g(I.ten), program: null, country: ctry, address: addr,
      lat: hasLL ? lat : null, lng: hasLL ? lng : null, geocode: hasLL ? 'source-provided (town-level, place exactly)' : 'pending',
      capacity_mw: isNaN(mw) ? null : mw, capacity_note: isNaN(mw) ? null : 'as reported in source; announced/planned unless status is operating',
      h100_equivalents: null, chips: null, status, year_announced: unk(g(I.ya)) ? null : g(I.ya), year_operating_or_planned: unk(g(I.yo)) ? null : g(I.yo),
      sources: src ? [src] : [], dataset: 'research: ' + f, dataset_url: null,
      image: img || null, image_credit: img ? (cred || null) : null, image_source_url: img ? (src || null) : null, note: unk(g(I.note)) ? null : g(I.note),
      size_class: (norm(g(I.ten)) === 'colocation') ? 'small' : 'campus',
      confidence: 'needs-check', as_of: new Date().toISOString().slice(0,10)
    });
    added++; report.push(`ADD   ${name}`);
  }
}
db.meta.count = db.projects.length;
fs.writeFileSync(path, JSON.stringify(db, null, 1));
fs.writeFileSync('data/merge-report.txt', report.join('\n'));
console.log(`Added ${added}, duplicates skipped ${dup}, non-sites skipped ${skipped}. Total now ${db.projects.length}. Details in data/merge-report.txt`);
