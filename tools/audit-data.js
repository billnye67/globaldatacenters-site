#!/usr/bin/env node
/* Coordinator only. Walks every built page and every record and reports where the data side is weak:
 * missing facts, thin or wall-of-text pages, Not-reported table cells, record problems, moratorium rows.
 *   node tools/audit-data.js > data/projects-run/final/AUDIT.md
 * Read-only: it writes nothing but stdout. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));

function text(file) {
  let h = fs.readFileSync(file, 'utf8');
  const m = /<main[\s\S]*?<\/main>/i.exec(h); h = m ? m[0] : h;
  return h.replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(br|\/p|\/h\d|\/li|\/tr|\/dt|\/dd|\/div|\/section)>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
}
// The written report: <p> paragraphs inside main, minus boilerplate.
function reportWords(file) {
  let h = fs.readFileSync(file, 'utf8');
  const m = /<main[\s\S]*?<\/main>/i.exec(h); h = m ? m[0] : h;
  const ps = [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(x => x[1].replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim())
    .filter(p => p.split(/\s+/).length > 25 && !/^Every project above is drawn|letter from a resident|letters sent so far/i.test(p));
  return { words: ps.join(' ').split(/\s+/).filter(Boolean).length, paras: ps.length };
}
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name === 'index.html') out.push(p);
  }
  return out;
}
const url = f => '/' + path.relative(ROOT, path.dirname(f)).split(path.sep).join('/') + '/';
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
const out = [];
const say = s => out.push(s);

// ---------- records ----------
const P = J('data/projects.json').projects;
const live = P.filter(p => !p.no_page);
const STAT = new Set(['operating', 'under construction', 'approved', 'proposed', 'announced', 'blocked', 'withdrawn', 'cancelled', 'suspended', 'expanding']);
const street = a => /\d/.test(a || '') && /\b(rd|road|st|street|ave|avenue|hwy|highway|dr|drive|pkwy|parkway|blvd|lane|ln|way|pike|route|rte|ct|court|cir|trail|tpke|place|pl)\b/i.test(a || '');
const nulls = k => live.filter(p => p[k] == null || p[k] === '' || (Array.isArray(p[k]) && !p[k].length));
const approx = live.filter(p => p.geocode && /approx|town|centroid|city/i.test(JSON.stringify(p.geocode)));
say('# Data audit, ' + new Date().toISOString().slice(0, 10));
say('\n## 1. The records (data/projects.json)\n');
say(`${P.length} records; ${live.length} shown on the site (${P.length - live.length} held back with no_page).\n`);
say('| Missing on shown records | Count | Share |\n|---|---|---|');
for (const [k, lab] of [['capacity_mw', 'Megawatts'], ['developer', 'Developer / company'], ['year_announced', 'Year announced'], ['address', 'Any address'], ['lat', 'Map position']])
  say(`| ${lab} | ${nulls(k).length} | ${pct(nulls(k).length, live.length)} |`);
const noStreet = live.filter(p => !street(p.address));
say(`| Street address (only a town or county) | ${noStreet.length} | ${pct(noStreet.length, live.length)} |`);
say(`| Pin placed approximately (town centre, not the site) | ${approx.length} | ${pct(approx.length, live.length)} |`);
const oneSrc = live.filter(p => (p.sources || []).length <= 1);
say(`| One source or none | ${oneSrc.length} | ${pct(oneSrc.length, live.length)} |`);
const badStat = live.filter(p => !STAT.has(String(p.status || '').toLowerCase()));
say(`| Status outside the site's vocabulary | ${badStat.length} | ${pct(badStat.length, live.length)} |`);
if (badStat.length) say('\nOdd statuses: ' + [...new Set(badStat.map(p => JSON.stringify(p.status)))].slice(0, 15).join(', '));
const AI = new Set(J('data/ai-labelled-sources.json'));
const aiRec = live.filter(p => (p.sources || []).some(s => AI.has(s)));
say(`\nShown records still listing an AI-labelled source: ${aiRec.length}` + (aiRec.length ? ' (' + aiRec.slice(0, 10).map(p => p.id).join(', ') + ')' : ''));
const junkSrc = live.filter(p => (p.sources || []).some(s => !/^https?:\/\//.test(s)));
say(`Shown records with a source that is not a URL (a note or a figure): ${junkSrc.length}` + (junkSrc.length ? ' (' + junkSrc.slice(0, 10).map(p => p.id).join(', ') + ')' : ''));
const DIR = /datacentermap|baxtel|datacenters\.com|cleanview|datacenterindex|dgtlinfra\.com\/data-center-list|inflect\.com|cloudscene/i;
const dirOnly = live.filter(p => (p.sources || []).length && (p.sources || []).every(s => DIR.test(s)));
say(`Shown records whose only sources are directories/trackers: ${dirOnly.length}` + (dirOnly.length ? ' (' + dirOnly.slice(0, 12).map(p => p.id).join(', ') + ')' : ''));

// possible duplicates: same developer within 3 km, or near-identical names
const R = 6371, rad = x => x * Math.PI / 180;
const km = (a, b) => 2 * R * Math.asin(Math.sqrt(Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2));
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\b(data center|datacenter|campus|the|llc|inc)\b/g, '').trim();
const dups = [];
const withPos = live.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
for (let i = 0; i < withPos.length; i++) for (let j = i + 1; j < withPos.length; j++) {
  const a = withPos[i], b = withPos[j];
  if (Math.abs(a.lat - b.lat) > 0.05) continue;
  const d = km(a, b);
  if (d < 2 && (norm(a.developer) && norm(a.developer) === norm(b.developer) || norm(a.name) === norm(b.name))) dups.push([a, b, d]);
}
say(`\nPossible duplicate pairs (same company or name, under 2 km apart): ${dups.length}`);
for (const [a, b, d] of dups.slice(0, 40)) say(`- ${a.name} (${a.id}) / ${b.name} (${b.id}), ${d.toFixed(1)} km`);
if (dups.length > 40) say(`- ... and ${dups.length - 40} more`);

// ---------- project pages ----------
say('\n## 2. Project pages\n');
const projFiles = walk(path.join(ROOT, 'project'));
const pw = projFiles.map(f => ({ u: url(f), ...reportWords(f), t: text(f) }));
const band = (arr, lo, hi) => arr.filter(x => x.words >= lo && x.words < hi).length;
say(`${pw.length} project pages.\n`);
say('| Report length | Pages |\n|---|---|');
for (const [lo, hi, lab] of [[0, 1, 'No written report'], [1, 150, 'Under 150 words (thin)'], [150, 300, '150-299'], [300, 800, '300-799'], [800, 1200, '800-1,199'], [1200, 1e9, '1,200+ (long)']]) say(`| ${lab} | ${band(pw, lo, hi)} |`);
const thin = pw.filter(x => x.words < 150).sort((a, b) => a.words - b.words);
say('\nThinnest project pages:');
for (const x of thin.slice(0, 30)) say(`- ${x.u} (${x.words} words)`);
if (thin.length > 30) say(`- ... and ${thin.length - 30} more`);
const longP = pw.filter(x => x.words >= 1200).sort((a, b) => b.words - a.words);
say('\nLongest project pages:');
for (const x of longP.slice(0, 10)) say(`- ${x.u} (${x.words} words)`);
const nr = pw.filter(x => /Not reported/.test(x.t));
say(`\nProject pages showing "Not reported" somewhere: ${nr.length}`);
const recTalk = pw.filter(x => /\b(recorded as|our record|on record as|the record (says|lists|shows))\b/i.test(x.t));
say(`Project pages whose text talks about our own record ("recorded as" etc.): ${recTalk.length}` + (recTalk.length ? ' (' + recTalk.slice(0, 12).map(x => x.u).join(', ') + ')' : ''));

// ---------- place pages ----------
say('\n## 3. Place pages (countries, states, counties, regions)\n');
const placeFiles = walk(path.join(ROOT, 'data-centers'));
const pl = placeFiles.map(f => ({ u: url(f), ...reportWords(f), t: text(f) }));
const depth = u => u.split('/').filter(Boolean).length; // 2 = country, 3 = state/region, 4 = county
const lvl = { 1: 'Index', 2: 'Country', 3: 'State / region', 4: 'County / district' };
say('| Level | Pages | No report | Under 150 words | Over 1,500 words (wall) | Median words |\n|---|---|---|---|---|---|');
for (const d of [2, 3, 4]) {
  const g = pl.filter(x => depth(x.u) === d); const w = g.map(x => x.words).sort((a, b) => a - b);
  say(`| ${lvl[d]} | ${g.length} | ${g.filter(x => !x.words).length} | ${g.filter(x => x.words && x.words < 150).length} | ${g.filter(x => x.words > 1500).length} | ${w[w.length >> 1] || 0} |`);
}
const walls = pl.filter(x => x.words > 1500).sort((a, b) => b.words - a.words);
say('\nWalls of text (over 1,500 words of report):');
for (const x of walls.slice(0, 40)) say(`- ${x.u} (${x.words} words, ${x.paras} paragraphs)`);
if (walls.length > 40) say(`- ... and ${walls.length - 40} more`);
const noRep = pl.filter(x => !x.words && depth(x.u) > 1);
say('\nPlace pages with no written report:');
for (const x of noRep.slice(0, 40)) say(`- ${x.u}`);
if (noRep.length > 40) say(`- ... and ${noRep.length - 40} more`);
const nrP = pl.map(x => ({ u: x.u, n: (x.t.match(/Not reported/g) || []).length, rows: (x.t.match(/\b(Operating|Proposed|Approved|Under construction|Blocked|Withdrawn|Cancelled|Suspended|Announced)\b/g) || []).length }))
  .filter(x => x.n >= 5).sort((a, b) => b.n - a.n);
say(`\nPlace pages where the project table says "Not reported" 5+ times: ${nrP.length}`);
for (const x of nrP.slice(0, 20)) say(`- ${x.u}: ${x.n} "Not reported"`);

// ---------- company pages ----------
say('\n## 4. Company pages\n');
const coFiles = walk(path.join(ROOT, 'company'));
const co = coFiles.map(f => ({ u: url(f), ...reportWords(f) })).filter(x => depth(x.u) === 2);
say(`${co.length} company pages; no report ${co.filter(x => !x.words).length}; under 300 words ${co.filter(x => x.words && x.words < 300).length}; over 1,500 words ${co.filter(x => x.words > 1500).length}.`);
for (const x of co.filter(x => !x.words || x.words > 1500)) say(`- ${x.u} (${x.words} words)`);

// ---------- moratoriums ----------
say('\n## 5. Moratorium tracker rows (data/wins.json)\n');
const W = (() => { const w = J('data/wins.json'); return Array.isArray(w) ? w : (w.wins || w.rows || Object.values(w).find(Array.isArray) || []); })();
const noSrc = W.filter(r => !r.src), noStart = W.filter(r => !r.start && /effect|passed|adopted/i.test(r.status || '')), noEnd = W.filter(r => !r.end && /effect/i.test(r.status || ''));
const aiW = W.filter(r => AI.has(r.src)), cpW = W.filter(r => /citizenportal/i.test(r.src || ''));
say(`${W.length} rows. No source: ${noSrc.length}. In effect with no start date: ${noStart.length}. In effect with no end date: ${noEnd.length}. Source is AI-labelled: ${aiW.length}. Source is CitizenPortal (barred): ${cpW.length}.`);
for (const r of [...aiW, ...cpW].slice(0, 20)) say(`- ${r.name}, ${r.state || r.country}: ${r.src}`);
// state bounding boxes are not on disk; flag rows far from any shown project in the same state instead
const byState = {}; for (const p of withPos) { const s = (p.address || '').match(/,\s*([A-Z]{2})\s*\d{5}/); }
say('');
console.log(out.join('\n'));
