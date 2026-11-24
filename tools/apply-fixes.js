#!/usr/bin/env node
/* Coordinator only. Applies a lane's record fixes to data/projects.json, the one record.
 *   node tools/apply-fixes.js data/projects-run/fix-b.json [--drop-source <id> <url>]...
 * Sets the fixed fields, appends sources_add (deduplicated), and logs every change with its why
 * to data/projects-run/applied.md. Lanes never run this: one writer, one merge. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const file = args[0];
if (!file || !fs.existsSync(file)) { console.error('usage: node tools/apply-fixes.js <fix-file.json> [--drop-source <id> <url>]...'); process.exit(2); }
const drops = [];
for (let i = 1; i < args.length; i++) if (args[i] === '--drop-source') { drops.push([args[i + 1], args[i + 2]]); i += 2; }

const PF = path.join(ROOT, 'data/projects.json');
const data = JSON.parse(fs.readFileSync(PF, 'utf8'));
const byId = {}; data.projects.forEach(p => { byId[p.id] = p; });
const fixes = JSON.parse(fs.readFileSync(file, 'utf8'));
const FIELDS = ['status', 'capacity_mw', 'developer', 'tenant', 'address', 'lat', 'lng', 'year_announced'];
const log = [`\n## ${path.basename(file)} applied ${new Date().toISOString()}\n`];
let changed = 0, skipped = 0;

Object.entries(fixes).forEach(([id, f]) => {
  const p = byId[id];
  if (!p) { skipped++; log.push(`- SKIPPED ${id}: unknown id`); return; }
  if (!f || !String(f.why || '').trim()) { skipped++; log.push(`- SKIPPED ${id}: no why`); return; }
  const parts = [];
  // the site's status vocabulary (build-pages STATUS_BUCKET): a word outside it would silently drop the page
  const STATUS_ALIAS = { denied: 'blocked', rejected: 'blocked', canceled: 'cancelled', 'on-hold': 'on hold' };
  if (typeof f.status === 'string' && STATUS_ALIAS[f.status.toLowerCase()]) f.status = STATUS_ALIAS[f.status.toLowerCase()];
  FIELDS.forEach(k => {
    if (!(k in f)) return;
    if (JSON.stringify(p[k]) === JSON.stringify(f[k])) return;
    parts.push(`${k}: ${JSON.stringify(p[k])} -> ${JSON.stringify(f[k])}`);
    p[k] = f[k];
  });
  // an estimate's note no longer describes a figure a lane replaced from reporting
  if ('capacity_mw' in f && /^Epoch AI estimate/.test(p.capacity_note || '') && parts.some(s => s.startsWith('capacity_mw'))) {
    p.capacity_note = f.capacity_mw == null ? null : 'As reported; see sources'; parts.push('capacity note updated');
  }
  if (f.approx === true) { parts.push('location marked approximate'); p.geocode = 'town-level (no street address yet) | ' + String(p.geocode || '').replace(/^[^|]*\|\s*/, ''); }
  if (('lat' in f || 'lng' in f) && !f.approx) p.geocode = 'address (lane-verified) | ' + (f.address || p.address || '');
  if (Array.isArray(f.sources_drop) && p.sources) {
    const n0 = p.sources.length; p.sources = p.sources.filter(u => !f.sources_drop.includes(u));
    if (p.sources.length < n0) parts.push(`-${n0 - p.sources.length} sources`);
  }
  if (Array.isArray(f.sources_add)) {
    p.sources = p.sources || [];
    const add = f.sources_add.filter(u => /^https?:/.test(u) && !p.sources.includes(u));
    if (add.length) { p.sources.push(...add); parts.push(`+${add.length} sources`); }
  }
  if (parts.length) { changed++; log.push(`- ${id} (${p.name}): ${parts.join('; ')}\n  - why: ${String(f.why).replace(/\s+/g, ' ')}`); }
});
drops.forEach(([id, url]) => {
  const p = byId[id]; if (!p || !p.sources) return;
  const n = p.sources.length; p.sources = p.sources.filter(u => u !== url);
  if (p.sources.length < n) log.push(`- ${id}: dropped source ${url}`);
});

for (let i = 0; ; i++) { try { fs.writeFileSync(PF, JSON.stringify(data, null, 1)); break; } catch (e) { if (i > 20) throw e; const t = Date.now() + 500; while (Date.now() < t); } } // Windows: an agent reading the file can lock it briefly
fs.appendFileSync(path.join(ROOT, 'data/projects-run/applied.md'), log.join('\n') + '\n');
console.log(`${changed} records changed, ${skipped} skipped, ${drops.length} source drops requested. Logged to data/projects-run/applied.md`);
