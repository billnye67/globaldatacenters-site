#!/usr/bin/env node
/* Proves the still and the live globe agree, by photographing the handoff itself.
 *
 *   node tools/check-globe-handoff.js [outdir]
 *
 * The homepage shows /globe-still*.webp until the live globe is both textured and carrying its
 * real markers, then swaps. If the still is older than data/globe.json, pins flash in or out at
 * that moment. This holds the swap open, shoots a burst of frames of #globe-frame across it, and
 * compares them pixel by pixel: any pin that appeared or vanished is a compact, high contrast
 * blob in the difference between the last still frame and the first live one.
 *
 * Two things differ between the frames for reasons that are not a pin. The three animated report
 * rings (rgba(82,108,177,a) at 38.9/-77.5, 32.9/-96.9 and 33.4/-112.1) are mid animation in the
 * still and at some other phase live. And on a phone the 1400px still is drawn into a ~780px box,
 * so every marker carries a one pixel resampling halo that the live globe, rendered natively, does
 * not. Both are edges, not bodies, so the check runs twice: once on the raw frames and once on a
 * 3x3 box blur of each, which collapses a halo to nothing and leaves a whole missing pin intact.
 * `fill` is a blob's area over its bounding box: a solid disc is around 0.78, an outline is far
 * lower. A pin that appeared or vanished would be a high fill, high peak blob in the blurred pass.
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'globe-handoff-frames'));
const PORT = 8792;
const FETCH_HOLD_MS = 3400;      // under globe-init.js's 5s "a stalled fetch must not strand us"
const BURST = 18, GAP_MS = 25;

const VIEWS = [
  { tag: 'desktop', vw: 1400, vh: 900, mobile: false },
  { tag: 'phone',   vw: 390,  vh: 844, mobile: true  },
];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

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

// Runs inside a blank page: decode two PNGs, diff them, group the differing pixels into blobs.
function diffInPage(args) {
  const aB64 = args[0], bB64 = args[1], threshold = args[2], blurred = !!args[3];
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  return Promise.all([load(aB64), load(bB64)]).then(([ia, ib]) => {
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const px = img => { const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
    // a 3x3 box blur, so a one pixel resampling halo stops counting as a difference
    const blur = src => {
      const out = new Uint8ClampedArray(src.length);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let r = 0, g2 = 0, b2 = 0, a2 = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const i = (ny * w + nx) * 4;
          r += src[i]; g2 += src[i + 1]; b2 += src[i + 2]; a2 += src[i + 3]; n++;
        }
        const o = (y * w + x) * 4;
        out[o] = r / n; out[o + 1] = g2 / n; out[o + 2] = b2 / n; out[o + 3] = a2 / n;
      }
      return out;
    };
    const rawA = px(ia), rawB = px(ib);
    const A = blurred ? blur(rawA) : rawA, B = blurred ? blur(rawB) : rawB;
    const mask = new Uint8Array(w * h);
    let changed = 0, sum = 0, peak = 0;
    for (let i = 0, p = 0; i < A.length; i += 4, p++) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]),
                         Math.abs(A[i + 3] - B[i + 3]));
      sum += d; if (d > peak) peak = d;
      if (d > threshold) { mask[p] = 1; changed++; }
    }
    // connected components, 8 way
    const seen = new Uint8Array(w * h), blobs = [];
    const stack = new Int32Array(w * h);
    for (let p0 = 0; p0 < mask.length; p0++) {
      if (!mask[p0] || seen[p0]) continue;
      let top = 0; stack[top++] = p0; seen[p0] = 1;
      let n = 0, sx = 0, sy = 0, minx = w, maxx = -1, miny = h, maxy = -1, bpeak = 0;
      while (top) {
        const p = stack[--top], x = p % w, y = (p - x) / w;
        n++; sx += x; sy += y;
        if (x < minx) minx = x; if (x > maxx) maxx = x;
        if (y < miny) miny = y; if (y > maxy) maxy = y;
        const i = p * 4;
        const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
        if (d > bpeak) bpeak = d;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (mask[q] && !seen[q]) { seen[q] = 1; stack[top++] = q; }
        }
      }
      const bw = maxx - minx + 1, bh = maxy - miny + 1;
      blobs.push({ n: n, cx: Math.round(sx / n), cy: Math.round(sy / n),
                   w: bw, h: bh, peak: bpeak, fill: +(n / (bw * bh)).toFixed(2) });
    }
    blobs.sort((p, q) => q.n - p.n);
    // paint the difference so a person can look at it
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d'); const out = cx.createImageData(w, h);
    for (let p = 0, i = 0; p < mask.length; p++, i += 4) {
      const g = 255 - Math.min(255, Math.round((A[i] * 0.3 + A[i + 1] * 0.59 + A[i + 2] * 0.11) * 0.25 + 170));
      out.data[i] = out.data[i + 1] = out.data[i + 2] = 255 - g;
      if (mask[p]) { out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 0; }
      out.data[i + 3] = 255;
    }
    cx.putImageData(out, 0, 0);
    return { w: w, h: h, changed: changed, pct: +(100 * changed / (w * h)).toFixed(4),
             mean: +(sum / (w * h * 1)).toFixed(3), peak: peak,
             blobs: blobs.slice(0, 25), nblobs: blobs.length, diff: c.toDataURL('image/png') };
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const report = [];

  for (const v of VIEWS) {
    const ctx = await browser.newContext({ viewport: { width: v.vw, height: v.vh }, deviceScaleFactor: 2,
      isMobile: v.mobile, hasTouch: v.mobile });
    const page = await ctx.newPage();

    // Hold the two marker fetches so the page sits on the still with the live globe already
    // textured behind it. That is the exact state the visitor is in before the swap.
    await page.route('**/data/globe.json*',   r => setTimeout(() => r.continue(), FETCH_HOLD_MS));
    await page.route('**/data/reports.json*', r => setTimeout(() => r.continue(), FETCH_HOLD_MS));

    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__heroGlobe, null, { timeout: 45000 });

    // Pin the camera to the still's angle for the whole burst, so the only thing that can move
    // between frames is a marker.
    await page.evaluate(() => {
      const g = window.__heroGlobe;
      window.__handoffFrame = null;
      (function hold() {
        try { g.controls().autoRotate = false; g.controls().enableDamping = false; g.pointOfView(window.__home, 0); } catch (e) {}
        requestAnimationFrame(hold);
      })();
    });

    // Shoot the sphere square only. #globe-frame spans the whole hero, so an element screenshot of
    // it also catches the stat counters painted over it, which change from placeholder to real
    // numbers at exactly this moment and have nothing to do with the globe.
    const box = await page.locator('#globe-poster').boundingBox();
    if (!box) throw new Error('no still on the page to measure the sphere box from');
    const clip = { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
    const shots = [];
    for (let i = 0; i < BURST; i++) {
      const state = await page.evaluate(() => {
        const p = document.getElementById('globe-poster');
        return { poster: !!p, done: !!(p && p.classList.contains('done')),
                 fade: p ? +getComputedStyle(p).opacity : 0,
                 markers: (window.__locations || []).length,
                 live: !!document.getElementById('globe').classList.contains('ready') };
      });
      const buf = await page.screenshot({ type: 'png', clip: clip });
      const phase = !state.live ? 'still' : (state.poster && state.fade > 0.02 ? 'crossfade' : 'live');
      const name = `${v.tag}-${String(i).padStart(2, '0')}-${phase}.png`;
      fs.writeFileSync(path.join(OUT, name), buf);
      shots.push({ name: name, phase: phase, b64: 'data:image/png;base64,' + buf.toString('base64'), state: state });
      await page.waitForTimeout(GAP_MS);
    }
    await ctx.close();

    // last frame still showing the poster, first frame showing the live globe
    let lastStill = -1, firstLive = -1;
    shots.forEach((s, i) => { if (!s.state.live) lastStill = i; if (firstLive < 0 && s.state.live) firstLive = i; });
    if (firstLive < 0) { report.push({ tag: v.tag, error: 'the handoff did not happen inside the burst' }); continue; }
    if (lastStill < 0 || lastStill > firstLive) lastStill = firstLive - 1;

    const bench = await browser.newPage();
    await bench.setContent('<!doctype html><title>diff</title>');
    const raw  = await bench.evaluate(diffInPage, [shots[lastStill].b64, shots[firstLive].b64, 28, false]);
    const soft = await bench.evaluate(diffInPage, [shots[lastStill].b64, shots[firstLive].b64, 28, true]);
    fs.writeFileSync(path.join(OUT, `${v.tag}-diff-handoff.png`), Buffer.from(raw.diff.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(OUT, `${v.tag}-diff-handoff-blurred.png`), Buffer.from(soft.diff.split(',')[1], 'base64'));
    delete raw.diff; delete soft.diff;

    // Consecutive frames across the whole burst, so a pin that blinks anywhere in it is caught.
    const steps = [];
    for (let i = 1; i < shots.length; i++) {
      const d = await bench.evaluate(diffInPage, [shots[i - 1].b64, shots[i].b64, 28, true]);
      delete d.diff;
      steps.push({ from: shots[i - 1].name, to: shots[i].name, changed: d.changed,
                   worst: d.blobs[0] || null });
    }
    await bench.close();

    report.push({ tag: v.tag, frames: shots.map(s => ({ name: s.name, phase: s.phase, poster: +s.state.fade.toFixed(2), markers: s.state.markers })),
                  lastStill: shots[lastStill].name, firstLive: shots[firstLive].name,
                  handoff: raw, handoffBlurred: soft, steps: steps });
  }

  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));

  for (const r of report) {
    console.log('\n=== ' + r.tag);
    if (r.error) { console.log('  ' + r.error); continue; }
    r.frames.forEach(f => console.log('  ' + f.name.padEnd(30) + f.phase.padEnd(11) +
      'still opacity ' + f.poster.toFixed(2) + '   markers ' + f.markers));
    const h = r.handoff, s2 = r.handoffBlurred;
    console.log(`  handoff: ${r.lastStill} -> ${r.firstLive}   sphere square ${h.w}x${h.h}`);
    console.log(`  raw     : ${h.changed} px over threshold (${h.pct}%), ${h.nblobs} blobs, peak ${h.peak}`);
    console.log(`  blurred : ${s2.changed} px over threshold (${s2.pct}%), ${s2.nblobs} blobs, peak ${s2.peak}`);
    console.log('  largest blobs after blur (a pin that blinked would be ~200+ px at fill 0.7+):');
    if (!s2.blobs.length) console.log('    none');
    s2.blobs.slice(0, 8).forEach(b => console.log(
      `    ${String(b.n).padStart(6)} px  at (${b.cx},${b.cy})  ${b.w}x${b.h}  fill ${b.fill}  peak ${b.peak}`));
    const bad = r.steps.filter(x => x.worst && x.worst.n >= 200 && x.worst.fill >= 0.7);
    console.log(`  frame to frame across the burst: worst blob ` +
      `${Math.max.apply(null, r.steps.map(x => x.worst ? x.worst.n : 0))} px; ` +
      `${bad.length} step(s) with a pin sized solid change`);
  }
})();
