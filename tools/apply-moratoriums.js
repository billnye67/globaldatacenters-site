#!/usr/bin/env node
/* Coordinator only. Applies the moratorium lane's fixes to data/wins.json.
 *   node tools/apply-moratoriums.js data/projects-run/fix-moratoriums.json
 * The site knows two statuses, "In effect" and "Proposed", and shows a row as Ended once its end date
 * has passed. The lane's other verdicts map onto that without claiming more than the sources say:
 *   In effect             -> end (and start) corrected; a missing end becomes "" only where OVERRIDE says so
 *   Ended                 -> end set from the lane, else the recorded end kept (already past)
 *   Replaced by ordinance -> end set to the replacement date (row reads Ended) and a note says so
 *   Unknown               -> the lane's end if it gave one, else the recorded end kept; a note says the
 *                            status after that date is not reported
 * Every change is logged with the lane's why to data/projects-run/applied.md. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('usage: node tools/apply-moratoriums.js <fix-moratoriums.json>'); process.exit(2); }

// Rows whose sources give only a month, or say the term plainly, decided by the coordinator from the lane's why.
const OVERRIDE = {
  'Caledonia Township|Michigan|2026-02-16': { end: '2026-10' },          // "through October"
  'Sullivan County|Tennessee|2025-12-18': { end: '2027-01' },           // "ends in January of 2027"
  'Pittsfield Township|Michigan|2025-11-18': { end: '2026-11' },         // "set to expire in November 2026"
  'Texas|Texas|2026-08-03': { end: '' },                                 // directive with no end date
  'Shippingport|Pennsylvania|2026-03-04': { end: '', type: 'Zoning limits', notes: 'A permanent zoning ordinance (No. 240) making data centers a conditional use in the I-1 district, not a moratorium.' },
  'Tyrone Township|Michigan|2025-12-02': { end: '', notes: 'Extended for nine months on May 19, 2026; the exact end date has not been reported.' },
  'Lima Township|Michigan|2025-12-29': { end: '', notes: 'Extended in July 2026 (Resolution 2026-13); the length of the extension has not been reported.' },
  'Sylvan Township|Michigan|2026-01-22': { end: '', start: '2026-01-13', notes: 'The original 180-day moratorium was replaced by a new one (Resolution 26-05, July 14, 2026) whose term has not been reported.' },
  'New York|New York|2026-06-04': { notes: 'Executive Order 62: up to one year, for data centers of 50 MW or more; ends earlier if the state finishes its environmental impact statement.' },
  'Lansing|Michigan|2026-07-13': { lat: 42.7325, lng: -84.5555 },       // city of Lansing, as other city rows are placed
  'Anne Arundel County|Maryland|2026-09-21': { lat: 38.99, lng: -76.60 }, // inside Anne Arundel County, so the row lands on its county page
  'Oldham County|Kentucky|2025-07-01': { notes: 'Disputed: the judge-executive said in August 2026 it had "effectively expired"; magistrates disputed that, and no regulations have been adopted.' }
};
const NOTE = {
  'Replaced by ordinance': 'Replaced by permanent data center rules.',
  'Unknown': 'Whether it was extended after this date has not been reported.'
};

const WF = path.join(ROOT, 'data/wins.json');
const raw = fs.readFileSync(WF, 'utf8');
const crlf = /\r\n/.test(raw);
const W = JSON.parse(raw);
const key = m => [m.name, m.state, m.start].join('|');
const byKey = {}; W.moratoriums.forEach(m => { byKey[key(m)] = m; });
const fixes = JSON.parse(fs.readFileSync(file, 'utf8'));
const log = [`\n## ${path.basename(file)} applied ${new Date().toISOString()}\n`];
let changed = 0, added = 0, skipped = 0;

Object.entries(fixes).forEach(([k, f]) => {
  const o = OVERRIDE[k] || {};
  if (f.new_row) {
    if (byKey[k]) { skipped++; log.push(`- SKIPPED new row ${k}: already present`); return; }
    const row = { name: f.name, level: f.level, state: f.state, country: f.country, status: 'In effect', type: f.type || 'Moratorium',
      start: f.start || '', end: f.end || '', notes: o.notes || '', src: f.src || '' };
    const ll = f.lat != null ? f : o;
    if (ll.lat != null) { row.lat = ll.lat; row.lng = ll.lng; }
    W.moratoriums.push(row); added++;
    log.push(`- ADDED ${k}\n  - why: ${String(f.why).replace(/\s+/g, ' ')}`);
    return;
  }
  const m = byKey[k];
  if (!m) { skipped++; log.push(`- SKIPPED ${k}: no such row`); return; }
  const before = JSON.stringify({ start: m.start, end: m.end, type: m.type, notes: m.notes, src: m.src });
  const start = 'start' in o ? o.start : f.start;
  if (start) m.start = start;
  let end;
  if ('end' in o) end = o.end;
  else if (f.end) end = f.end;
  else end = m.end;                      // lane gave no date: keep the recorded one rather than invent "no end"
  m.end = end || '';
  if (o.type) m.type = o.type;
  const note = o.notes || NOTE[f.status] || '';
  if (note) m.notes = note;
  if (f.src && /^https?:/.test(f.src)) m.src = f.src;
  const after = JSON.stringify({ start: m.start, end: m.end, type: m.type, notes: m.notes, src: m.src });
  if (before !== after) {
    changed++;
    log.push(`- ${k} [${f.status}]: ${before} -> ${after}\n  - why: ${String(f.why).replace(/\s+/g, ' ')}`);
  }
});

let out = JSON.stringify(W, null, 1);
if (crlf) out = out.replace(/\n/g, '\r\n');
fs.writeFileSync(WF, out);
fs.appendFileSync(path.join(ROOT, 'data/projects-run/applied.md'), log.join('\n') + '\n');
console.log(`${changed} rows changed, ${added} added, ${skipped} skipped. Logged to data/projects-run/applied.md`);
