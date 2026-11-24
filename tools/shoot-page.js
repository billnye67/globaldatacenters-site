#!/usr/bin/env node
/* Screenshots a built page at phone and desktop width.
 *
 *   node tools/shoot-page.js <path-under-the-repo> <outdir> <tag> [selector]
 *
 * Serves the repo on a port so stylesheets, fonts and map tiles resolve the way they do on the
 * site, waits for the tiles to load, and writes <tag>-desktop.png and <tag>-phone.png. With a
 * selector it shoots that element plus the space either side of it, which is what shows whether
 * something is sitting narrow in a wide column.
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8794;
const [, , PAGE, OUTDIR, TAG, SEL] = process.argv;
if (!PAGE || !OUTDIR || !TAG) {
  console.error('usage: node tools/shoot-page.js <page> <outdir> <tag> [selector]');
  process.exit(1);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2' };

function serve() {
  return new Promise(res => {
    const s = http.createServer((req, rsp) => {
      let p = decodeURIComponent(url.parse(req.url).pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(PORT, () => res(s));
  });
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });

  for (const v of [{ n: 'desktop', w: 1400, h: 1000, m: false }, { n: 'phone', w: 390, h: 844, m: true }]) {
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2,
      isMobile: v.m, hasTouch: v.m });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:' + PORT + '/' + String(PAGE).replace(/^\//, ''), { waitUntil: 'load' });
    // the satellite tiles come from Esri and will not load offline; give them a moment, then
    // shoot regardless, because the frame's size is the thing being measured
    await page.waitForTimeout(2500);

    let clip = null, box = null;
    if (SEL) {
      const el = page.locator(SEL).first();
      if (await el.count()) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        box = await el.boundingBox();
      }
    }
    if (box) {
      const pad = 40;
      clip = { x: 0, y: Math.max(0, box.y - pad), width: v.w, height: Math.min(box.height + pad * 2, 1400) };
    }
    const buf = await page.screenshot(clip ? { clip } : { fullPage: false });
    fs.writeFileSync(path.join(OUTDIR, TAG + '-' + v.n + '.png'), buf);
    const wrap = await page.locator('.wrap').first().boundingBox();
    console.log('  ' + TAG + '-' + v.n + '.png' + (box
      ? '   element ' + Math.round(box.width) + 'px wide inside a ' + Math.round(wrap ? wrap.width : 0) + 'px column'
      : ''));
    await ctx.close();
  }

  await browser.close();
  server.close();
})();
