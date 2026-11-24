#!/usr/bin/env node
/* Prints what a reader sees on a built page: the <main> text, in order, with the source links.
 *   node tools/page-text.js /project/sentinel-grove-fort-pierce-florida/
 * Reads the built file (the same HTML the dev server and the live site serve), so it works in any
 * terminal without sharing a browser. It is for reading, not for checking: a person reads it. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const u = (process.argv[2] || '').replace(/^https?:\/\/[^/]+/, '');
const f = path.join(ROOT, u.replace(/^\/+/, ''), 'index.html');
if (!u || !fs.existsSync(f)) { console.error('no built page for ' + u); process.exit(2); }
let h = fs.readFileSync(f, 'utf8');
const m = /<main[\s\S]*?<\/main>/i.exec(h); h = m ? m[0] : h;
h = h.replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, '')
  .replace(/<a [^>]*href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => t + ' [' + href + ']')
  .replace(/<(br|\/p|\/h\d|\/li|\/tr|\/dt|\/dd|\/div|\/section)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').replace(/\n{2,}/g, '\n\n').trim();
console.log(h);
