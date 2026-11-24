#!/usr/bin/env node
/* Checks a project lane's work before it is handed back. Changes nothing.
 *   node tools/check-story.js <letter>
 * Reads data/projects-run/story-<letter>.json and fix-<letter>.json.
 * ERROR = the merge would reject the page. WARN = read it and decide; the merge checks these too.
 * The first block is data/merge-reports.js's own accept() rules, kept in step with it. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const L = (process.argv[2] || '').toLowerCase();
if (!/^[a-z0-9-]+$/.test(L)) { console.error('usage: node tools/check-story.js <letter>'); process.exit(2); }
const RUN = path.join(ROOT, 'data/projects-run');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const storyF = path.join(RUN, 'story-' + L + '.json'), fixF = path.join(RUN, 'fix-' + L + '.json');
if (!fs.existsSync(storyF)) { console.error('no ' + storyF); process.exit(2); }
const stories = read(storyF), fixes = fs.existsSync(fixF) ? read(fixF) : {};
const PROJECTS = read(path.join(ROOT, 'data/projects.json')).projects;
const PAGES = read(path.join(ROOT, 'data/project-pages.json'));
const byId = {}; PROJECTS.forEach(p => { byId[p.id] = p; });

const HYPE = /\b(massive|cutting[- ]edge|state[- ]of[- ]the[- ]art|game[- ]?chang\w*|iconic|sprawling|whopping|boasts?|poised to|revolutionar\w*|world[- ]class|unparalleled|transformative|bring[s]? (good )?jobs)\b/i;
const SELF = /\b(as an? (AI|language model)|I (could not|couldn't|was unable)|according to my|based on (my|our) (research|analysis))\b/i;
const META = /\b(our (record|data|tracker|research)|we (could not|couldn't|were unable|found no)|this (page|report|write-up)|sources suggest|according to (our|the) record)\b/i;
const STATUS_WORDS = ['withdrawn', 'cancelled', 'canceled', 'denied', 'rejected', 'suspended', 'approved', 'under construction', 'operating', 'proposed', 'blocked', 'paused', 'on hold'];
const GENERIC = new Set(['data', 'center', 'centre', 'campus', 'project', 'park', 'technology', 'the', 'and', 'site', 'facility']);

function countyOf(id) {
  const u = PAGES[id]; if (!u) return '';
  const f = path.join(ROOT, u, 'index.html'); if (!fs.existsSync(f)) return '';
  const m = /([A-Z][\w.' -]+ (County|Parish|Borough|city))\s*\/\s*[^/]*<\/?/.exec(fs.readFileSync(f, 'utf8').replace(/<[^>]+>/g, ' / '));
  return m ? m[1].trim() : '';
}
function townOf(addr) {
  const parts = String(addr || '').split(',').map(s => s.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^[A-Z]{2}( \d{5})?$/.test(parts[i]) || /United States|^\d{5}$/.test(parts[i])) continue;
    if (/\d/.test(parts[i]) && i > 0) continue;
    if (i > 0 && /^(near|close to|between|intersection)/i.test(parts[i - 1])) return parts[i];
    return i > 0 || parts.length === 1 ? parts[i] : '';
  }
  return '';
}

let errors = 0, warns = 0;
const out = (lvl, id, msg) => { lvl === 'ERROR' ? errors++ : warns++; console.log(`${lvl.padEnd(5)} ${id}: ${msg}`); };

(Array.isArray(stories) ? stories : []).forEach(rec => {
  const id = rec && rec.id;
  if (!id || !byId[id]) return out('ERROR', id || '?', 'unknown project id');
  const sents = (rec.sentences || []).filter(s => s && s.t && String(s.t).trim());
  if (!sents.length) return out('ERROR', id, 'no sentences');
  if (sents.some(s => !s.src || !String(s.src).trim())) out('ERROR', id, 'a sentence with no source');
  const text = sents.map(s => String(s.t).trim()).join(' ').replace(/\s+/g, ' ');
  if (text.includes('—')) out('ERROR', id, 'em dash');
  if (HYPE.test(text)) out('ERROR', id, 'hype wording: "' + text.match(HYPE)[0] + '"');
  if (SELF.test(text)) out('ERROR', id, 'refers to the writer');
  if (/\bdatacenter\b/i.test(text)) out('ERROR', id, 'datacenter written as one word');
  const rec0 = byId[id], fix = fixes[id] || {}, R = Object.assign({}, rec0, fix);
  if (rec0.country === 'United States' && /\bdata centre\b/i.test(text)) out('ERROR', id, 'British spelling on a United States site');
  const words = text.split(/\s+/).length;
  if (text.length < 120) out('ERROR', id, 'too short to be reporting');
  if (words > 1200) out('ERROR', id, 'over length (' + words + ' words)');
  if (META.test(text)) out('WARN', id, 'writes about the research: "' + text.match(META)[0] + '"');
  sents.forEach(s => { if (!/^(https?:|data:county$)/.test(String(s.src))) out('WARN', id, 'source is not an article URL: ' + s.src); });

  // the first two sentences carry what people search for
  const lead = sents.slice(0, 2).map(s => s.t).join(' ').toLowerCase();
  const nameTok = String(R.name || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !GENERIC.has(w));
  if (nameTok.length && !nameTok.some(w => lead.includes(w))) out('WARN', id, 'first two sentences do not name the project (' + R.name + ')');
  if (!/\bdata centers?\b/.test(lead)) out('WARN', id, 'first two sentences lack the words "data center"');
  const town = townOf(R.address); if (town && !lead.includes(town.toLowerCase())) out('WARN', id, 'first two sentences lack the town "' + town + '"');
  // the county belongs in the opening paragraph, worked into it ("in Temple, Bell County, Texas"), not bolted on as a stock sentence
  const para0 = sents.filter(s => (Number.isInteger(s.para) ? s.para : 0) === 0).map(s => s.t).join(' ').toLowerCase();
  const county = countyOf(id); if (county && !para0.includes(county.toLowerCase().replace(/ (county|parish|borough|city)$/, ''))) out('WARN', id, 'opening paragraph lacks the county "' + county + '"');
  if (sents.some(s => /^(the site|it|the project|the campus) is in [A-Z][\w .'-]+ (County|Parish)\.?$/i.test(String(s.t).trim()))) out('WARN', id, 'stock sentence "The site is in X County.": name the county inside a real sentence instead');
  const dev = String(R.developer || '').trim(); if (dev && !lead.includes(dev.toLowerCase().split(/[\s(]/)[0])) out('WARN', id, 'first two sentences lack the developer "' + dev + '"');

  // agreement with the record, after this lane's own fixes
  const st = String(R.status || '').toLowerCase(), low = text.toLowerCase();
  const said = STATUS_WORDS.filter(w => new RegExp('\\b' + w + '\\b').test(low));
  if (st && st !== 'unknown' && said.length && !said.some(w => st.includes(w.replace('canceled', 'cancelled')))) {
    out('WARN', id, 'record status is "' + st + '" but the text says: ' + said.join(', ') + ' (file a fix if the record is wrong)');
  }
  const mws = [...text.matchAll(/([\d,.]+)\s*(megawatts?|MW|gigawatts?|GW)\b/gi)].map(m => parseFloat(m[1].replace(/,/g, '')) * (/^g/i.test(m[2]) ? 1000 : 1));
  const cap = R.capacity_mw != null ? Number(R.capacity_mw) : null;
  if (cap && mws.length && !mws.some(v => Math.abs(v - cap) < 0.5)) out('WARN', id, 'record capacity is ' + cap + ' MW, the text gives ' + mws.join(', ') + ' MW (file a fix if the record is wrong)');
  if (!cap && mws.length) out('WARN', id, 'record has no capacity, the text gives ' + mws.join(', ') + ' MW (file a fix)');
});

Object.entries(fixes).forEach(([id, f]) => {
  if (!byId[id]) return out('ERROR', id, 'fix for an unknown project id');
  if (!f || !String(f.why || '').trim()) out('ERROR', id, 'fix with no why');
  else if (!/https?:\/\//.test(f.why)) out('WARN', id, 'fix why has no source URL');
  const allowed = ['status', 'capacity_mw', 'developer', 'tenant', 'address', 'lat', 'lng', 'year_announced', 'sources_add', 'sources_drop', 'why'];
  Object.keys(f || {}).filter(k => !allowed.includes(k)).forEach(k => out('ERROR', id, 'fix touches a field lanes may not change: ' + k));
});

console.log(`\n${(Array.isArray(stories) ? stories.length : 0)} pages, ${Object.keys(fixes).length} record fixes: ${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
