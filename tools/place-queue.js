#!/usr/bin/env node
/* Builds the shared work queue for researching place pages.
 *
 *   node tools/place-queue.js            # rewrite data/place-queue.json
 *   node tools/place-queue.js --lane b   # print the next 40 unwritten pages in lane b
 *
 * Every state, country, region, county and company page on the site, ranked by how many projects
 * it carries, split into two lanes so two sessions can research at the same time without doing
 * the same page twice. Lanes alternate down the ranking, so each lane gets an equal share of the
 * busy pages rather than one session taking all the easy ones.
 *
 * Counts come from the built pages, by counting the distinct project links in each one, which is
 * the same set of projects the page actually shows.
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');

const done = new Set();
fs.readdirSync(path.join(ROOT, 'data'))
  .filter(f => /^place-reports.*\.json$/.test(f))
  .forEach(f => {
    let d; try { d = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8')); } catch (e) { return; }
    Object.keys(d).forEach(u => { if (d[u] && (d[u].paragraphs || []).length) done.add(u); });
  });

// A page another lane has CLAIMED but not yet written still looked undone here, and that window
// is where the collisions happened: lane b wrote West Java while lane j was researching it, and
// reached Sabey, Stream and Travis County the same way. So a claim counts as taken too.
// data/claims.md is the shared claim file; a row is claimed when its last column is not empty.
const claimed = new Set();
try {
  const md = fs.readFileSync(path.join(ROOT, 'data/claims.md'), 'utf8');
  md.split('\n').forEach(line => {
    if (line.indexOf('|') < 0) return;
    // Split the markdown row into cells. A row is claimed when some cell holds a url and the
    // LAST cell is not empty. Tables here have either 3 columns or 4, so counting is no good.
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 2) return;
    const taken = cells[cells.length - 1];
    if (!taken || taken === '---' || /^-+$/.test(taken)) return;
    const cell = cells.find(c => /^`?\/[^`\s]*\/`?$/.test(c));
    if (cell) claimed.add(cell.replace(/`/g, ''));
  });
} catch (e) { /* no claims file yet */ }

const urls = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/page-urls.json'), 'utf8'));
const all = (Array.isArray(urls) ? urls : urls.urls || []).filter(u =>
  (u.startsWith('/data-centers/') || u.startsWith('/company/')) && u !== '/data-centers/');

const rows = all.map(u => {
  let html = '';
  try { html = fs.readFileSync(path.join(ROOT, u.replace(/^\//, ''), 'index.html'), 'utf8'); } catch (e) { return null; }
  const projects = new Set((html.match(/href="\/project\/[^"]+"/g) || []));
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
  const depth = u.split('/').filter(Boolean).length;
  const kind = u.startsWith('/company/') ? 'company'
    : depth === 2 ? 'country' : depth === 3 ? 'region' : 'county';
  return { url: u, name: h1, kind, projects: projects.size };
}).filter(Boolean);

rows.sort((a, b) => b.projects - a.projects || a.url.localeCompare(b.url));

// Lanes are assigned by a stable hash of the url, not by rank order. Two consequences that
// matter with more than two sessions running: every session computes the same lane for the same
// page without needing to agree on anything, and adding a lane reshuffles only what is still
// undone. Set the lane count with --lanes N; it is stored in the file so everyone reads the same
// number back.
const crypto = require('crypto');
const LANES = 'abcdefghijklmnop'.split('');
let laneCount = 2;
try { laneCount = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/place-queue.json'), 'utf8')).lanes || 2; } catch (e) {}
const argLanes = process.argv.indexOf('--lanes');
if (argLanes > -1) laneCount = Math.max(1, Math.min(LANES.length, parseInt(process.argv[argLanes + 1], 10) || 2));

const laneOf = url => LANES[parseInt(crypto.createHash('md5').update(url).digest('hex').slice(0, 8), 16) % laneCount];
rows.forEach(r => { r.lane = laneOf(r.url); r.done = done.has(r.url); r.claimed = claimed.has(r.url); });

if (process.argv.includes('--lane')) {
  const lane = process.argv[process.argv.indexOf('--lane') + 1];
  const todo = rows.filter(r => r.lane === lane && !r.done && !r.claimed);
  console.log('lane ' + lane + ': ' + todo.length + ' pages still to research, '
    + rows.filter(r => r.lane === lane && r.done).length + ' written');
  todo.slice(0, 40).forEach(r => console.log('  ' + String(r.projects).padStart(4) + '  ' + r.kind.padEnd(8) + '  ' + r.url));
  process.exit(0);
}

fs.writeFileSync(path.join(ROOT, 'data/place-queue.json'),
  JSON.stringify({ lanes: laneCount, generated: new Date().toISOString(), rows }, null, 0));
const by = k => rows.filter(r => r.kind === k).length;
console.log('place pages         ' + rows.length
  + '  (countries ' + by('country') + ', regions ' + by('region')
  + ', counties ' + by('county') + ', companies ' + by('company') + ')');
console.log('already written     ' + rows.filter(r => r.done).length);
console.log('lanes               ' + laneCount);
LANES.slice(0, laneCount).forEach(L => console.log('  lane ' + L + ' to do        '
  + rows.filter(r => r.lane === L && !r.done).length
  + '   (' + rows.filter(r => r.lane === L && r.done).length + ' done)'));
