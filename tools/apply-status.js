#!/usr/bin/env node
/* Coordinator only. Applies the status lane's fix files (fix-st<k>.json) to data/projects.json.
 *   node tools/apply-status.js data/projects-run/fix-st1.json [...more]
 * Unlike apply-fixes.js it carries capacity_note and not_a_site, and when an address changes it
 * clears the old exact pin (it pointed at the old address) and lists the record for re-pinning in
 * data/projects-run/final/repin.json. Every change is logged with its why to applied.md. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PF = path.join(ROOT, 'data/projects.json');
const LOG = path.join(ROOT, 'data/projects-run/applied.md');
const REPIN = path.join(ROOT, 'data/projects-run/final/repin.json');
const STATUSES = new Set(['operating', 'under construction', 'approved', 'proposed', 'suspended', 'cancelled', 'withdrawn', 'blocked', 'operating (expanding)']);

const data = JSON.parse(fs.readFileSync(PF, 'utf8'));
const byId = new Map(data.projects.map(p => [p.id, p]));
const repin = fs.existsSync(REPIN) ? JSON.parse(fs.readFileSync(REPIN, 'utf8')) : {};
const lines = ['', '## status lane applied ' + new Date().toISOString()];
let changed = 0, skipped = [];

for (const file of process.argv.slice(2)) {
  const fixes = JSON.parse(fs.readFileSync(file, 'utf8'));
  lines.push('### ' + path.basename(file));
  for (const [id, f] of Object.entries(fixes)) {
    const p = byId.get(id);
    if (!p) { skipped.push(id + ' (no such record)'); continue; }
    const did = [];
    if (f.status != null) {
      const s = String(f.status).toLowerCase().trim();
      if (!STATUSES.has(s)) { skipped.push(id + ' (status "' + f.status + '")'); }
      else if (p.status !== s) { did.push('status: ' + JSON.stringify(p.status) + ' -> ' + JSON.stringify(s)); p.status = s; }
    }
    if (f.capacity_mw !== undefined && p.capacity_mw !== f.capacity_mw) { did.push('capacity_mw: ' + p.capacity_mw + ' -> ' + f.capacity_mw); p.capacity_mw = f.capacity_mw; }
    if (f.capacity_note !== undefined && p.capacity_note !== f.capacity_note) { did.push('capacity_note set'); p.capacity_note = f.capacity_note; }
    if (f.address && f.address !== p.address) {
      did.push('address: ' + JSON.stringify(p.address) + ' -> ' + JSON.stringify(f.address));
      // The old coordinates belong to the old address: keep them only as a rough town position.
      if (p.lat != null && p.town_lat == null) { p.town_lat = p.lat; p.town_lng = p.lng; }
      p.address = f.address; p.lat = null; p.lng = null;
      p.geocode = 'needs re-pin (address changed by status lane)';
      repin[id] = { address: f.address, country: p.country, why: f.why };
    }
    if (f.not_a_site) {
      did.push('not a site: ' + String(f.why).slice(0, 80));
      p.not_a_site = true;
      p.no_page = 'Not a site (status lane): ' + String(f.why).slice(0, 200);
    }
    if (Array.isArray(f.sources_add)) {
      const have = new Set(p.sources || []);
      const add = f.sources_add.filter(s => /^https?:\/\//.test(s) && !have.has(s));
      if (add.length) { p.sources = (p.sources || []).concat(add); did.push('+' + add.length + ' sources'); }
    }
    if (did.length) {
      p.as_of = new Date().toISOString().slice(0, 10);
      changed++;
      lines.push('- ' + id + ' (' + p.name + '): ' + did.join('; ') + '. Why: ' + String(f.why || '').slice(0, 300));
    }
  }
}

fs.writeFileSync(PF, JSON.stringify(data, null, 1));
fs.writeFileSync(REPIN, JSON.stringify(repin, null, 1) + '\n');
fs.appendFileSync(LOG, lines.join('\n') + '\n');
console.log(changed + ' records changed; ' + Object.keys(repin).length + ' awaiting re-pin; skipped ' + skipped.length + (skipped.length ? ': ' + skipped.slice(0, 15).join(', ') : ''));
