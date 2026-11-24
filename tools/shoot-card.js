/* Opens the globe, taps a real dot, and photographs the card that comes up - at phone sizes and
   on desktop. The point is to LOOK at it rather than reason about the CSS.
     node tools/shoot-card.js <outdir> */
const { chromium } = require('playwright');
const path = require('path');

const OUT = process.argv[2];
const URL = 'http://localhost:8787/';

const SIZES = [
  { name: 'iphone-se',     w: 375,  h: 667, dsf: 2,   mobile: true },
  { name: 'iphone-14-pro', w: 393,  h: 852, dsf: 3,   mobile: true },
  { name: 'galaxy-s20',    w: 360,  h: 800, dsf: 3,   mobile: true },
  { name: 'desktop',       w: 1440, h: 900, dsf: 1,   mobile: false },
];

(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });

  for (const s of SIZES) {
    const ctx = await browser.newContext({
      viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.dsf,
      isMobile: s.mobile, hasTouch: s.mobile,
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));

    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(7000);

    // into globe mode
    await page.evaluate(() => { const b = document.getElementById('view-globe'); if (b) b.click(); });
    await page.waitForTimeout(4500);

    // find a big, well-known project that is actually on screen right now
    const target = await page.evaluate(() => {
      const host = document.getElementById('globe');
      if (!host || !window.__locations) return null;
      const r = host.getBoundingClientRect();
      const g = window.__globeForTest;
      const pov = window.__pov && window.__pov();
      const best = (window.__locations || [])
        .filter(p => p.type === 'project' && p.mw > 200 && p.lat != null)
        .sort((a, b) => (b.mw || 0) - (a.mw || 0));
      return { count: best.length, name: best[0] && best[0].name, rect: { x: r.x, y: r.y, w: r.width, h: r.height }, pov };
    });

    // click straight at the middle-ish of the US cluster, where dots are dense
    const hit = await page.evaluate(() => {
      const host = document.getElementById('globe');
      const r = host.getBoundingClientRect();
      return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
    });

    /* Tapping the middle of the globe hits whatever dot happens to be there - often a community
       report with no photo, sometimes nothing at all. Walk a grid over the dense US cluster
       until a card comes up that actually has an image, so every run photographs the same kind
       of thing and the comparison means something. */
    let got = false;
    for (let dy = -60; dy <= 120 && !got; dy += 30) {
      for (let dx = -90; dx <= 90 && !got; dx += 30) {
        const x = hit.cx + dx, y = hit.cy + dy;
        if (s.mobile) await page.touchscreen.tap(x, y);
        else { await page.mouse.move(x, y); }
        await page.waitForTimeout(260);
        got = await page.evaluate(() => {
          const el = document.getElementById('point-card');
          const im = document.getElementById('card-img');
          return !!el && !el.hidden && !!im && getComputedStyle(im).display !== 'none';
        });
      }
    }
    await page.waitForTimeout(1400);

    const card = await page.evaluate(() => {
      const el = document.getElementById('point-card');
      if (!el) return null;
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      const img = document.getElementById('card-img');
      const ir = img ? img.getBoundingClientRect() : null;
      const txt = (document.getElementById('card-location') || {}).textContent || '';
      return {
        hidden: el.hidden, cls: el.className, name: txt,
        card: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        img: ir ? { h: Math.round(ir.height), shown: getComputedStyle(img).display } : null,
        pos: cs.position, opacity: cs.opacity, vh: window.innerHeight,
        offBottom: Math.round(r.bottom - window.innerHeight),
      };
    });

    await page.screenshot({ path: path.join(OUT, 'card-' + s.name + '.png') });
    console.log(s.name.padEnd(15) + JSON.stringify(card));
    if (errs.length) console.log('   ERRORS ' + JSON.stringify(errs.slice(0, 3)));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error('FAILED: ' + e.message); process.exit(1); });
