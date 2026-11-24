#!/usr/bin/env node
/* Lists internal links in the built site that point at a page which does not exist.
 *   node tools/dead-links.js
 * Checks every href="/..." in every .html file under the repo root (skipping node_modules and data)
 * against the files on disk: /x/y/ needs x/y/index.html, /x.html needs x.html. A redirect stub
 * counts as existing. Prints each dead target with how many pages link to it and one example. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', 'data', '.git', 'tools', 'UsersjamesAppDataLocalTemp']);
const files = [];
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    if (SKIP.has(e.name)) return;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) files.push(p);
  });
})(ROOT);
const exists = {};
function ok(href) {
  if (href in exists) return exists[href];
  const clean = decodeURIComponent(href.split(/[?#]/)[0]);
  let f = path.join(ROOT, clean);
  let r = fs.existsSync(f) && fs.statSync(f).isFile();
  if (!r) r = fs.existsSync(path.join(f, 'index.html'));
  if (!r && !path.extname(clean)) r = fs.existsSync(f + '.html');
  return (exists[href] = r);
}
const dead = {};
files.forEach(f => {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const h = m[1];
    if (h.startsWith('//') || h === '/') continue;
    if (!ok(h)) { (dead[h] = dead[h] || []).push(path.relative(ROOT, f)); }
  }
});
const keys = Object.keys(dead).sort((a, b) => dead[b].length - dead[a].length);
keys.forEach(k => console.log(`${dead[k].length}\t${k}\t(e.g. ${dead[k][0]})`));
console.log(`\n${files.length} pages scanned, ${keys.length} dead internal targets`);
