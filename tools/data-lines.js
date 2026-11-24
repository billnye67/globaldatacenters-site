#!/usr/bin/env node
/* Coordinator only. Lists published project pages that still carry sentences sourced to our own
 * data (src "data:..."), with each sentence, so a reader can remove or re-source them by hand.
 *   node tools/data-lines.js read-1,read-4 > data/projects-run/final/data-lines.md
 * The argument names the finished lane lists to include; pages on no list are always included. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const want = new Set((process.argv[2] || '').split(',').filter(Boolean));
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/descriptions.json'), 'utf8'));
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8'));
const live = new Set(P.projects.filter(p => !p.no_page).map(p => p.id));
const PAGES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/project-pages.json'), 'utf8'));
const FINAL = path.join(ROOT, 'data/projects-run/final');
const listOf = {};
fs.readdirSync(FINAL).filter(f => /^(read|untouched)-\d\.md$/.test(f)).forEach(f => {
  fs.readFileSync(path.join(FINAL, f), 'utf8').split(/\n/).forEach(l => {
    const m = /^(\d+)\. `([^`]+)`/.exec(l); if (m) listOf[m[2]] = f.replace('.md', '');
  });
});
const out = []; let n = 0;
Object.entries(D).forEach(([id, v]) => {
  if (!live.has(id) || !PAGES[id]) return;
  const lines = (v.sentences || []).filter(s => /^data:/.test(String(s.src)));
  if (!lines.length) return;
  const list = listOf[id];
  if (list && !want.has(list)) return;
  n++;
  out.push(`${n}. \`${id}\`  ${PAGES[id] || ''}  (${list || 'no list'})`);
  lines.forEach(s => out.push(`   - [${s.src}] ${s.t}`));
});
console.log(`# Sentences sourced to our own data, ${n} pages\n\nRemove each one, or re-source it from an article you have read. Stock lines (county, nearest power plants, moratoriums nearby, other projects, "recorded as") go unless an article says the same thing.\n`);
console.log(out.join('\n'));
