#!/usr/bin/env node
/* Draws the site's icons and its share card from the GDC mark the homepage carries inline.
 *
 *   node tools/make-icons.js            # writes the six files, then checks them
 *
 * Writes /favicon.ico, /favicon-32.png, /favicon-48.png, /favicon-192.png, /apple-touch-icon.png
 * and /og-image.png.
 *
 * The mark is the one in the masthead: "GDC" in Fraunces 700, #f7f4ec on #a0231d. It is drawn
 * fresh at each size rather than rescaled from one master, so 16px stays legible, and it is
 * fitted to the geometry that was measured off the 180px GDC icon the homepage used to carry
 * inline: the capitals stand 31.2% of the square, the three letters span 90% of it, and the
 * block sits centred. The check at the end measures every size back against those numbers.
 *
 * The share card reads its figures out of data/globe.json and data/reports.json, rounded down to
 * a "+" so they stay true as the tracker grows. Re-run this when the branding changes.
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8793;

const RED = '#a0231d', CREAM = '#f7f4ec', INK = '#1a1915', PAPER = '#f7f4ec', MUTED = '#666458';
// Both measured off the homepage's inline 180px mark, which is the most accurate raster of the
// intended design: the capitals stand 31.1% of the square and the three letters span 90% of it.
const CAP_RATIO = 0.312;
const WIDTH_RATIO = 0.90;
const PNG_SIZES = [
  { file: 'favicon-32.png', px: 32 },
  { file: 'favicon-48.png', px: 48 },
  { file: 'favicon-192.png', px: 192 },
  { file: 'apple-touch-icon.png', px: 180 },
];
const ICO_SIZES = [16, 32, 48];

// ---------------------------------------------------------------- the share card
function stats() {
  const g = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/globe.json'), 'utf8'));
  const sites = g.sites.filter(s => s.kind !== 'colo');
  let reports = [];
  try { reports = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reports.json'), 'utf8')).reports || []; } catch (e) {}
  const floor = (n, step) => Math.floor(n / step) * step;
  const nice = n => n.toLocaleString('en-US');
  return [
    { n: nice(floor(sites.filter(s => !s.blk).length, 100)) + '+', label: 'Tracked projects' },
    { n: nice(floor(reports.length, 100)) + '+', label: 'Community reports' },
    { n: new Set(sites.map(s => s.country).filter(Boolean)).size + '+', label: 'Countries' },
    { n: nice(floor(sites.filter(s => s.blk).length, 10)) + '+', label: 'Blocked or withdrawn' },
  ];
}

function cardHtml() {
  const s = stats();
  return `<!doctype html><meta charset="utf-8"><title>og</title>
<style>
  @font-face{font-family:'Fraunces';font-weight:700;font-style:normal;src:url(/fonts/Fraunces-700.woff) format('woff')}
  @font-face{font-family:'Fraunces';font-weight:400;font-style:normal;src:url(/fonts/Fraunces-400.woff) format('woff')}
  @font-face{font-family:'Work Sans';font-weight:400;font-style:normal;src:url(/fonts/WorkSans-400.woff) format('woff')}
  @font-face{font-family:'Work Sans';font-weight:600;font-style:normal;src:url(/fonts/WorkSans-600.woff) format('woff')}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{background:${PAPER};font-family:'Work Sans',Helvetica,Arial,sans-serif;display:flex;flex-direction:column}
  .topbar{height:14px;background:${RED};flex:none}
  .body{flex:1;padding:52px 80px 0;display:flex;flex-direction:column}
  .eyebrow{display:flex;align-items:center;gap:14px;margin-bottom:26px}
  .mark{width:46px;height:46px;flex:none;display:flex;align-items:center;justify-content:center;
        background:${RED};color:${CREAM};font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:16.5px;
        line-height:1;letter-spacing:-.02em}
  .kicker{font-size:15px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${RED}}
  .head{display:flex;gap:26px;align-items:stretch}
  .rule{width:5px;background:${RED};flex:none}
  h1{font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:57px;line-height:1.12;color:${INK};letter-spacing:-.015em}
  h1 .red{color:${RED}}
  p.sub{margin-top:22px;font-size:22px;line-height:1.42;color:${MUTED};max-width:940px}
  .stats{margin-top:auto;border-top:1px solid #c9c3b3;display:flex;padding:22px 0 26px}
  .stat{flex:1}
  .stat .n{font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:30px;color:${INK};line-height:1}
  .stat .l{margin-top:7px;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED}}
  .foot{height:74px;flex:none;background:${INK};color:${PAPER};display:flex;align-items:center;
        justify-content:space-between;padding:0 80px;font-size:17px}
  .foot .r{color:#a8a496}
</style>
<div class="topbar"></div>
<div class="body">
  <div class="eyebrow"><span class="mark">GDC</span><span class="kicker">Independent tracker</span></div>
  <div class="head">
    <div class="rule"></div>
    <h1>Global Data Centers.<br>Every proposed AI data<br><span class="red">center, on one map.</span></h1>
  </div>
  <p class="sub">Hyperscale and AI data center projects worldwide: what is filed, who votes on it,
  and how residents are pushing back.</p>
  <div class="stats">
    ${s.map(x => `<div class="stat"><div class="n">${x.n}</div><div class="l">${x.label}</div></div>`).join('\n    ')}
  </div>
</div>
<div class="foot"><span>globaldatacenters.net</span><span class="r">Est. 2026 &nbsp;·&nbsp; Independent</span></div>`;
}

// ---------------------------------------------------------------- server
function serve() {
  return new Promise(res => {
    const TYPES = { '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png', '.html': 'text/html' };
    const s = http.createServer((req, rsp) => {
      const p = decodeURIComponent(url.parse(req.url).pathname);
      if (p === '/__mark') { rsp.writeHead(200, { 'Content-Type': 'text/html' }); return rsp.end(markHtml()); }
      if (p === '/__card') { rsp.writeHead(200, { 'Content-Type': 'text/html' }); return rsp.end(cardHtml()); }
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(PORT, () => res(s));
  });
}

function markHtml() {
  return `<!doctype html><meta charset="utf-8"><title>mark</title>
<style>
  @font-face{font-family:'Fraunces';font-weight:700;font-style:normal;src:url(/fonts/Fraunces-700.woff) format('woff')}
  body{margin:0;font-family:'Fraunces',Georgia,serif}
  span#probe{font:700 100px 'Fraunces',Georgia,serif;position:absolute;visibility:hidden}
</style>
<span id="probe">GDC</span>`;
}

// Runs in the page. Draws the mark on a canvas at exactly `px`.
//
// The fit is done against the rasterised result, not against the font's metrics: measureText
// reports ideal sub-pixel extents, and at 16 or 32 pixels those round to a cap a whole pixel
// short. So this bisects the font size until the painted capitals actually cover the target
// number of rows, then nudges the drawing by whole pixels until the painted box is centred.
// "Painted" is decided by the same rule the check below uses, a colour distance over 200 from
// the background, which is roughly 40% coverage of the cream on the red.
function drawMark({ px, red, cream, capRatio, widthRatio }) {
  const targetCap = Math.max(1, Math.round(capRatio * px));
  const targetWide = Math.max(1, Math.round(widthRatio * px));
  const c = document.createElement('canvas');
  c.width = px; c.height = px;
  const x = c.getContext('2d', { willReadFrequently: true });
  const bg = [parseInt(red.slice(1, 3), 16), parseInt(red.slice(3, 5), 16), parseInt(red.slice(5, 7), 16)];

  function bbox() {
    const d = x.getImageData(0, 0, px, px).data;
    let minx = 1e9, maxx = -1, miny = 1e9, maxy = -1;
    for (let y = 0; y < px; y++) for (let xx = 0; xx < px; xx++) {
      const i = (y * px + xx) * 4;
      if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 200) {
        if (xx < minx) minx = xx; if (xx > maxx) maxx = xx;
        if (y < miny) miny = y; if (y > maxy) maxy = y;
      }
    }
    return maxx < 0 ? null : { minx, maxx, miny, maxy, w: maxx - minx + 1, h: maxy - miny + 1 };
  }

  let tracking = -0.02;             // the masthead's own letter-spacing, the starting point

  function paint(size, dx, dy) {
    x.fillStyle = red; x.fillRect(0, 0, px, px);
    x.letterSpacing = tracking.toFixed(4) + 'em';
    x.textBaseline = 'alphabetic';
    x.textAlign = 'left';
    x.font = `700 ${size}px 'Fraunces', Georgia, serif`;
    const m = x.measureText('GDC');
    const ox = (px - (m.actualBoundingBoxLeft + m.actualBoundingBoxRight)) / 2 + m.actualBoundingBoxLeft;
    const oy = (px - (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)) / 2 + m.actualBoundingBoxAscent;
    x.fillStyle = cream;
    x.fillText('GDC', ox + dx, oy + dy);
    return bbox();
  }

  // bisect the font size until the painted capitals are exactly targetCap rows tall
  let lo = px * 0.05, hi = px * 1.2, size = px * capRatio * 1.4;
  for (let i = 0; i < 40; i++) {
    size = (lo + hi) / 2;
    const b = paint(size, 0, 0);
    const h = b ? b.h : 0;
    if (h < targetCap) lo = size; else if (h > targetCap) hi = size; else { lo = size; break; }
  }
  // take the largest size that still paints targetCap rows, so the glyphs are as full as they go
  size = lo;
  let b = paint(size, 0, 0);
  if (!b || b.h !== targetCap) { b = paint((lo + hi) / 2, 0, 0); }

  // Then bisect the tracking until the three letters span the target width. Tracking moves the
  // glyphs apart without changing their height, so the cap height found above survives this.
  let tlo = -0.20, thi = 0.10;
  for (let i = 0; i < 30; i++) {
    tracking = (tlo + thi) / 2;
    const t = paint(size, 0, 0);
    const w = t ? t.w : 0;
    if (w < targetWide) tlo = tracking; else if (w > targetWide) thi = tracking; else break;
  }

  // centre the painted box on whole pixels
  b = paint(size, 0, 0);
  if (b) {
    const dx = Math.round(((px - b.w) / 2) - b.minx);
    const dy = Math.round(((px - b.h) / 2) - b.miny);
    b = paint(size, dx, dy);
  }
  return c.toDataURL('image/png');
}

// ---------------------------------------------------------------- ico container
function buildIco(pngs) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach((p, i) => {
    const o = i * 16;
    dir.writeUInt8(p.px >= 256 ? 0 : p.px, o);
    dir.writeUInt8(p.px >= 256 ? 0 : p.px, o + 1);
    dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(p.buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += p.buf.length;
  });
  return Buffer.concat([head, dir, ...pngs.map(p => p.buf)]);
}

// ---------------------------------------------------------------- check what was drawn
function compare({ a, b, tol }) {
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  return Promise.all([load(a), load(b)]).then(([ia, ib]) => {
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const px = img => { const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
      return x.getImageData(0, 0, w, h).data; };
    const A = px(ia), B = px(ib);
    let over = 0, sum = 0, peak = 0;
    for (let i = 0; i < A.length; i += 4) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      sum += d; if (d > peak) peak = d; if (d > tol) over++;
    }
    return { w, h, over, pct: +(100 * over / (w * h)).toFixed(2), mean: +(sum / (w * h)).toFixed(2), peak };
  });
}

// Where the painted letters sit inside the square, as a fraction of it.
function geometry(src) {
  const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
  return load(src).then(img => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const bg = [d[0], d[1], d[2]];
    let minx = 1e9, maxx = -1, miny = 1e9, maxy = -1;
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) {
      const i = (y * c.width + xx) * 4;
      if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 200) {
        if (xx < minx) minx = xx; if (xx > maxx) maxx = xx;
        if (y < miny) miny = y; if (y > maxy) maxy = y;
      }
    }
    return { px: c.width, bg: '#' + bg.map(v => v.toString(16).padStart(2, '0')).join(''),
             cap: maxy - miny + 1, wide: maxx - minx + 1,
             top: miny, bottom: c.height - 1 - maxy };
  });
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${PORT}/__mark`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.load("700 100px 'Fraunces'").then(() => document.fonts.ready));

  const opts = { red: RED, cream: CREAM, capRatio: CAP_RATIO, widthRatio: WIDTH_RATIO };
  const drawn = {};
  for (const px of [...new Set([...PNG_SIZES.map(s => s.px), ...ICO_SIZES])]) {
    drawn[px] = await page.evaluate(drawMark, { px, ...opts });
  }

  const written = [];
  for (const s of PNG_SIZES) {
    const buf = Buffer.from(drawn[s.px].split(',')[1], 'base64');
    fs.writeFileSync(path.join(ROOT, s.file), buf);
    written.push([s.file, `${s.px}x${s.px}`, buf.length]);
  }
  const ico = buildIco(ICO_SIZES.map(px => ({ px, buf: Buffer.from(drawn[px].split(',')[1], 'base64') })));
  fs.writeFileSync(path.join(ROOT, 'favicon.ico'), ico);
  written.push(['favicon.ico', ICO_SIZES.map(s => `${s}x${s}`).join(' + '), ico.length]);

  // the share card
  const card = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await card.goto(`http://127.0.0.1:${PORT}/__card`, { waitUntil: 'load' });
  await card.evaluate(() => document.fonts.ready);
  const og = await card.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  fs.writeFileSync(path.join(ROOT, 'og-image.png'), og);
  written.push(['og-image.png', '1200x630', og.length]);
  await card.close();

  console.log('written');
  written.forEach(w => console.log(`  ${w[0].padEnd(22)} ${String(w[1]).padEnd(18)} ${(w[2] / 1024).toFixed(1)} KB`));

  // ---- check every size against the geometry of the mark ----
  // Measured in whole pixels, because that is the only thing an icon has. A target of 0.312 x 16
  // is 4.99 pixels, so "on the mark" means the nearest pixel to the target, and centred means the
  // margins above and below differ by at most one, which is all an odd margin allows.
  console.log(`\nmeasured in pixels, against the mark (cap ${CAP_RATIO} of the square, width ${WIDTH_RATIO})`);
  let bad = 0;
  const flag = (cond, msg) => { if (cond) return ''; bad++; return '  <-- ' + msg; };
  for (const px of Object.keys(drawn).map(Number).sort((a, b) => a - b)) {
    const g = await page.evaluate(geometry, drawn[px]);
    const wantCap = Math.round(CAP_RATIO * px), wantWide = Math.round(WIDTH_RATIO * px);
    console.log(`  ${String(px).padStart(3)}px  bg ${g.bg}${flag(g.bg === RED, 'not ' + RED)}`
      + `  cap ${g.cap}/${wantCap}${flag(g.cap === wantCap, 'wrong cap height')}`
      + `  width ${g.wide}/${wantWide}${flag(Math.abs(g.wide - wantWide) <= 1, 'wrong width')}`
      + `  margin ${g.top} above / ${g.bottom} below${flag(Math.abs(g.top - g.bottom) <= 1, 'not centred')}`);
  }
  console.log(bad ? `\n${bad} measurement(s) out of tolerance` : '\nevery size is on the mark');

  await page.close();
  await browser.close();
  server.close();
})();
