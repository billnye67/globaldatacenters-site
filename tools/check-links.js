#!/usr/bin/env node
/* Crawls the built site on disk and reports two things: internal links that lead nowhere, and
 * rules in _redirects whose destination no longer exists.
 *
 *   node tools/check-links.js
 *
 * Links are resolved the way Cloudflare Pages serves them, and in the same order:
 *   1. a real file wins over everything, including a redirect rule for the same path
 *   2. /foo    serves foo.html, or foo/index.html
 *   3. /foo/   serves foo/index.html
 *   4. otherwise _redirects is consulted, top to bottom, and the destination resolved the same
 *      way, following up to five hops
 * Anything under /archive/ is withdrawn by functions/_middleware.js before the file is reached,
 * so those pages are not crawled and a link into them is resolved to where the middleware sends
 * it. Exits non-zero if anything is broken.
 */
'use strict';
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.wrangler', 'functions', 'tools', 'data', 'fonts', 'img']);
const ARCHIVE = '/archive/';
const ARCHIVE_TARGET = '/data-centers/united-states/florida/';
const MAX_HOPS = 5;

// ------------------------------------------------------------------ the files on disk
const files = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (dir === ROOT && SKIP_DIRS.has(e.name)) continue;
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(path.join(dir, e.name));
    } else {
      files.add('/' + path.relative(ROOT, path.join(dir, e.name)).split(path.sep).join('/'));
    }
  }
})(ROOT);
// data/ and img/ and fonts/ are skipped as crawl sources but are still servable assets
for (const d of ['data', 'img', 'fonts']) {
  const full = path.join(ROOT, d);
  if (!fs.existsSync(full)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else files.add('/' + path.relative(ROOT, p).split(path.sep).join('/'));
    }
  })(full);
}

// ------------------------------------------------------------------ _redirects
const rules = [];
for (const line of fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t[0] === '#') continue;
  const parts = t.split(/\s+/);
  if (parts.length < 2) continue;
  rules.push({ from: parts[0], to: parts[1], status: parts[2] || '302', line: t });
}

const stripOrigin = u => u.replace(/^https?:\/\/[^/]+/i, '') || '/';

function asFile(p) {
  if (files.has(p)) return p;
  if (p.endsWith('/')) {
    if (files.has(p + 'index.html')) return p + 'index.html';
    return null;
  }
  if (files.has(p + '.html')) return p + '.html';
  if (files.has(p + '/index.html')) return p + '/index.html';
  return null;
}

function matchRule(p) {
  const tries = p.endsWith('/') ? [p, p.slice(0, -1)] : [p, p + '/'];
  for (const r of rules) {
    if (r.from.endsWith('*')) {
      const stem = r.from.slice(0, -1);
      if (tries.some(t => t.startsWith(stem))) return r;
      continue;
    }
    if (tries.includes(r.from)) return r;
  }
  return null;
}

// returns { ok, via: [...], reason }
function resolve(p) {
  const via = [];
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (p.toLowerCase().startsWith(ARCHIVE)) { via.push('middleware -> ' + ARCHIVE_TARGET); p = ARCHIVE_TARGET; continue; }
    const f = asFile(p);
    if (f) return { ok: true, via: via, file: f };
    const r = matchRule(p);
    if (!r) return { ok: false, via: via, reason: via.length ? 'redirect target does not exist' : 'no file and no redirect' };
    via.push(r.from + ' -> ' + r.to);
    const next = stripOrigin(r.to).split('#')[0].split('?')[0];
    if (next === p) return { ok: false, via: via, reason: 'redirect loops onto itself' };
    p = next;
  }
  return { ok: false, via: via, reason: 'more than ' + MAX_HOPS + ' redirect hops' };
}

// ------------------------------------------------------------------ crawl every page
const pages = [...files].filter(f => f.endsWith('.html') && !f.startsWith(ARCHIVE));
const LINK = /(?:href|src)\s*=\s*"([^"]*)"|(?:href|src)\s*=\s*'([^']*)'/gi;
// any scheme at all (mailto:, tel:, sms:, data:, javascript:, https: ...), a fragment, or
// a protocol relative URL, none of which is a path on this site
const SKIP_SCHEME = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i;

const broken = new Map();   // target -> [pages]
let linksChecked = 0;
const targets = new Map();  // target -> first page that used it

for (const page of pages) {
  // Inline scripts build hrefs out of variables ("/' + r.source + '"), which are not links.
  const html = fs.readFileSync(path.join(ROOT, page.slice(1)), 'utf8')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  let m;
  LINK.lastIndex = 0;
  while ((m = LINK.exec(html))) {
    let href = (m[1] !== undefined ? m[1] : m[2]).trim();
    if (!href || SKIP_SCHEME.test(href)) continue;
    href = href.split('#')[0].split('?')[0];
    if (!href) continue;
    const abs = href.startsWith('/') ? href
      : path.posix.normalize(path.posix.join(path.posix.dirname(page), href));
    linksChecked++;
    if (!targets.has(abs)) targets.set(abs, page);
  }
}

for (const [target, firstPage] of targets) {
  const r = resolve(target);
  if (!r.ok) broken.set(target, { page: firstPage, reason: r.reason, via: r.via });
}

// ------------------------------------------------------------------ every redirect destination
const deadRedirects = [];
for (const r of rules) {
  const dest = stripOrigin(r.to).split('#')[0].split('?')[0];
  const res = resolve(dest);
  if (!res.ok) deadRedirects.push({ rule: r, reason: res.reason });
}

// ------------------------------------------------------------------ report
console.log(`pages crawled            ${pages.length}`);
console.log(`internal links found     ${linksChecked} (${targets.size} distinct targets)`);
console.log(`redirect rules           ${rules.length}`);
console.log('');
console.log(`broken links                        ${broken.size}`);
for (const [t, v] of broken) console.log(`  ${t}\n    first seen on ${v.page}\n    ${v.reason}${v.via.length ? '\n    via ' + v.via.join(' -> ') : ''}`);
console.log(`redirects to a missing page         ${deadRedirects.length}`);
for (const d of deadRedirects) console.log(`  ${d.rule.line}\n    ${d.reason}`);

process.exit(broken.size || deadRedirects.length ? 1 : 0);
