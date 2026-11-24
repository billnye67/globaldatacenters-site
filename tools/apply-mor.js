#!/usr/bin/env node
/* Coordinator only. Applies moratorium/win row fixes from rewrite agents (final/mor-rw*.json) to data/wins.json.
 *   node tools/apply-mor.js data/projects-run/final/mor-rwp8.json [...]
 * Accepts the standard shape ({kind, row, action, change, src, why}) and the looser early shape
 * ({row: "WIN: ...", change: {add|ADD|delete|DELETE|remove, ...}}). A row it cannot match exactly is
 * not guessed at: it is listed in final/mor-unmatched.md for the coordinator. New rows without a
 * position get the named county's centre when the name is a county, else they wait in the list. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WF = path.join(ROOT, 'data/wins.json');
const UNM = path.join(ROOT, 'data/projects-run/final/mor-unmatched.md');
const LOG = path.join(ROOT, 'data/projects-run/applied.md');
const raw = fs.readFileSync(WF, 'utf8');
const W = JSON.parse(raw);

let centres = null;   // county centres from the atlas, for new county rows with no position
function countyCentre(name, state) {
  if (!centres) {
    centres = {};
    try {
      const topo = require('topojson-client'), us = require('us-atlas/counties-10m.json');
      const sn = {}; topo.feature(us, us.objects.states).features.forEach(f => { sn[String(f.id).padStart(2, '0')] = f.properties.name; });
      topo.feature(us, us.objects.counties).features.forEach(f => {
        const fips = String(f.id).padStart(5, '0');
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, sx = 0, sy = 0, n = 0;
        const walk = a => { if (typeof a[0] === 'number') { sx += a[0]; sy += a[1]; n++; } else a.forEach(walk); };
        walk(f.geometry.coordinates);
        centres[f.properties.name + '|' + sn[fips.slice(0, 2)]] = { lat: +(sy / n).toFixed(4), lng: +(sx / n).toFixed(4) };
      });
    } catch (e) { /* no atlas: rows wait */ }
  }
  return centres[String(name).replace(/ (County|Parish)$/, '') + '|' + state] || null;
}

const norm = s => String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const lines = ['', '## moratorium/win fixes applied ' + new Date().toISOString()];
const unmatched = [];
let applied = 0;

for (const file of process.argv.slice(2)) {
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  lines.push('### ' + path.basename(file));
  for (const e of list) {
    const c = Object.assign({}, e.change || {});
    let row = String(e.row || '');
    let kind = e.kind || (/^\s*WINS?:/i.test(row) ? 'win' : 'moratorium');
    row = row.replace(/^\s*WINS?:\s*/i, '');
    let action = e.action || (c.add || c.ADD ? 'add' : (c.delete || c.DELETE || c.remove ? 'delete' : 'change'));
    ['add', 'ADD', 'delete', 'DELETE', 'remove'].forEach(k => delete c[k]);
    const arr = kind === 'win' ? W.wins : W.moratoriums;
    const idm = row.match(/\(id ([^)]+)\)/);
    const cut = row.lastIndexOf(',');
    const name = (cut > 0 ? row.slice(0, cut) : row).replace(/\(id [^)]+\)/, '').trim();
    const state = cut > 0 ? row.slice(cut + 1).trim() : '';
    const label = kind + ' ' + row;

    if (action === 'add') {
      const nr = Object.assign({ name: c.name || name, level: c.level || 'municipality', state: c.state || state, country: c.country || 'United States', status: 'In effect', type: 'Moratorium', start: '', end: '', notes: '', src: e.src }, c);
      if (kind === 'win') { nr.place = nr.place || nr.name; }
      if (nr.lat == null || nr.lng == null) {
        const cc = /County|Parish/.test(nr.name) ? countyCentre(nr.name, nr.state) : null;
        if (cc) { nr.lat = cc.lat; nr.lng = cc.lng; }
      }
      if (nr.lat == null || nr.lng == null) { unmatched.push(label + ': new row has no position (' + e.src + ')'); continue; }
      const dup = arr.find(r => norm(r.name || r.place) === norm(nr.name) && r.state === nr.state && (r.type || '') === (nr.type || ''));
      if (dup) { Object.assign(dup, c); lines.push('- updated existing ' + label); applied++; continue; }
      arr.push(nr); lines.push('- added ' + label + ' (' + nr.status + ', ' + nr.type + '): ' + String(e.why).slice(0, 200)); applied++;
      continue;
    }

    let hits = idm ? arr.filter(r => r.id === idm[1]) : [];
    if (!hits.length) hits = arr.filter(r => norm(r.name || r.place) === norm(name) && (!state || r.state === state || r.country === state));
    if (!hits.length) hits = arr.filter(r => norm(r.name || r.place).startsWith(norm(name)) && (!state || r.state === state || r.country === state));
    if (hits.length !== 1) { unmatched.push(label + ': ' + hits.length + ' matches for ' + action + ' ' + JSON.stringify(c).slice(0, 200) + ' (' + e.src + ')'); continue; }
    const r = hits[0];
    if (action === 'delete') { arr.splice(arr.indexOf(r), 1); lines.push('- deleted ' + label + ': ' + String(e.why).slice(0, 200)); applied++; continue; }
    Object.assign(r, c);
    if (!c.src && e.src && /^https?:/.test(e.src)) r.src = r.src || e.src;
    lines.push('- changed ' + label + ' ' + JSON.stringify(c).slice(0, 200) + ': ' + String(e.why).slice(0, 200)); applied++;
  }
}

fs.writeFileSync(WF, JSON.stringify(W, null, raw.startsWith('{\n  ') ? 2 : 1) + (raw.endsWith('\n') ? '\n' : ''));
fs.appendFileSync(LOG, lines.join('\n') + '\n');
if (unmatched.length) fs.appendFileSync(UNM, unmatched.map(u => '- ' + u).join('\n') + '\n');
console.log(applied + ' applied; ' + unmatched.length + ' left for the coordinator in final/mor-unmatched.md');
