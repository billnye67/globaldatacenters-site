#!/usr/bin/env node
/* Gives every hand written page in the repo root the same icon links.
 *
 *   node tools/apply-icons.js [--check]
 *
 * The generated pages get theirs from ICON_FILES in data/build-pages.js. The root pages had
 * drifted: four carried a five link set, one carried four in a different order, one carried two
 * as inline base64, and seventeen carried none at all. This normalises all of them onto one
 * block, placed straight after the viewport meta. --check reports without writing.
 *
 * Pages under archive/ are left alone: functions/_middleware.js withdraws that folder before the
 * file is ever served, and it is kept as a frozen copy of the old site.
 */
'use strict';
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');

const LINKS = [
  '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">',
  '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">',
  '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
];

// Written at whatever indentation the line it follows uses, because these pages are hand edited
// and a flush left block in an indented head reads as damage.
const block = indent => LINKS.map(l => indent + l).join('\n');

// <link rel="icon">, <link rel="shortcut icon">, <link rel="apple-touch-icon">, in any attribute
// order, including the ones whose href is a base64 data url.
const ICON_LINK = /[ \t]*<link\b[^>]*\brel\s*=\s*"(?:shortcut )?(?:icon|apple-touch-icon)"[^>]*>[ \t]*\r?\n?/gi;
const VIEWPORT = /<meta\b[^>]*\bname\s*=\s*"viewport"[^>]*>\r?\n?/i;
const CHARSET = /<meta\b[^>]*\bcharset\b[^>]*>\r?\n?/i;

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
let changed = 0;

for (const f of files) {
  const full = path.join(ROOT, f);
  const before = fs.readFileSync(full, 'utf8');
  const had = (before.match(ICON_LINK) || []).length;
  const inline = /rel="(?:shortcut )?(?:icon|apple-touch-icon)"[^>]*href="data:/i.test(before);

  let out = before.replace(ICON_LINK, '');
  const anchor = VIEWPORT.exec(out) || CHARSET.exec(out);
  if (anchor) {
    const lineStart = out.lastIndexOf('\n', anchor.index) + 1;
    const indent = (/^[ \t]*/.exec(out.slice(lineStart, anchor.index)) || [''])[0];
    const at = anchor.index + anchor[0].length;
    const nl = anchor[0].endsWith('\n') ? '' : '\n';
    out = out.slice(0, at) + nl + block(indent) + '\n' + out.slice(at);
  } else if (out.includes('</head>')) {
    out = out.replace('</head>', block('') + '\n</head>');
  } else {
    console.log(`  SKIP ${f}: no viewport, no charset and no </head> to anchor to`);
    continue;
  }

  const same = out === before;
  if (!same) changed++;
  const note = had === 0 ? 'had none' : `had ${had}${inline ? ', inline base64' : ''}`;
  console.log(`  ${same ? 'ok    ' : CHECK ? 'would ' : 'wrote '}${f.padEnd(26)} ${note} -> 5 file links`);
  if (!same && !CHECK) fs.writeFileSync(full, out);
}

console.log(`\n${files.length} root pages, ${changed} ${CHECK ? 'would change' : 'changed'}`);
