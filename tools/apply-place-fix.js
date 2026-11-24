#!/usr/bin/env node
/* Coordinator only. Applies corrected place and company reports from the final pass.
 *   node tools/apply-place-fix.js data/projects-run/final/place-fix-cs.json
 * Each entry is a whole report ({paragraphs, sources}) keyed by page url. It replaces that url in EVERY
 * data/place-reports*.json that holds it, so an older duplicate in another lane file cannot win the
 * build's tie-break and bring the stale text back. A url no file holds yet goes into
 * data/place-reports-final.json. Every change is logged to data/projects-run/applied.md. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('usage: node tools/apply-place-fix.js <place-fix.json>'); process.exit(2); }
const fix = JSON.parse(fs.readFileSync(file, 'utf8'));
const DIR = path.join(ROOT, 'data');
const files = fs.readdirSync(DIR).filter(f => /^place-reports.*\.json$/.test(f)).sort();
const data = {}; files.forEach(f => { data[f] = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); });
const NEW = 'place-reports-final.json';
if (!data[NEW]) data[NEW] = {};
const log = [`\n## ${path.basename(file)} applied ${new Date().toISOString()}\n`];
let replaced = 0, added = 0, bad = 0;
Object.entries(fix).forEach(([url, r]) => {
  const ok = r && Array.isArray(r.paragraphs) && r.paragraphs.length && Array.isArray(r.sources)
    && r.sources.length && r.sources.every(s => /^https?:\/\//.test(s)) && !r.paragraphs.join(' ').includes('—');
  if (!ok) { bad++; log.push(`- SKIPPED ${url}: needs paragraphs, http sources, no em dash`); return; }
  const holders = Object.keys(data).filter(f => data[f][url]);
  if (holders.length) { holders.forEach(f => { data[f][url] = { paragraphs: r.paragraphs, sources: r.sources }; }); replaced++; }
  else { data[NEW][url] = { paragraphs: r.paragraphs, sources: r.sources }; added++; }
  log.push(`- ${url}: ${holders.length ? 'replaced in ' + holders.join(', ') : 'added to ' + NEW} (${r.paragraphs.join(' ').split(/\s+/).length} words, ${r.sources.length} sources)`);
});
Object.keys(data).forEach(f => {
  if (f === NEW && !Object.keys(data[f]).length) return;
  const orig = fs.existsSync(path.join(DIR, f)) ? fs.readFileSync(path.join(DIR, f), 'utf8') : '';
  const indent = /^\{\n( +)"/.exec(orig.replace(/\r\n/g, '\n'));
  let out = JSON.stringify(data[f], null, indent ? indent[1].length : 2);
  const tail = /\r?\n$/.exec(orig);
  if (tail) out += '\n';
  if (/\r\n/.test(orig)) out = out.replace(/\n/g, '\r\n');
  if (out !== orig) fs.writeFileSync(path.join(DIR, f), out);
});
fs.appendFileSync(path.join(ROOT, 'data/projects-run/applied.md'), log.join('\n') + '\n');
console.log(`${replaced} replaced, ${added} added, ${bad} skipped. Logged to data/projects-run/applied.md`);
