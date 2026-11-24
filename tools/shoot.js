/* Drives a real browser at real phone sizes and takes pictures, so a change can be LOOKED at
   instead of reasoned about. Never resizes a window - each size is its own context, because
   resizing does not re-fire the media queries reliably.
     node tools/shoot.js <outdir> [--globe]
   --globe also clicks into globe mode before shooting. */
const { chromium } = require('playwright');
const path = require('path');

const OUT = process.argv[2];
const GLOBE = process.argv.includes('--globe');
const URL = 'http://localhost:8787/';

const SIZES = [
  { name: 'iphone-se',      w: 375, h: 667, dsf: 2,   mobile: true },
  { name: 'iphone-14-pro',  w: 393, h: 852, dsf: 3,   mobile: true },
  { name: 'iphone-max',     w: 430, h: 932, dsf: 3,   mobile: true },
  { name: 'galaxy-s20',     w: 360, h: 800, dsf: 3,   mobile: true },
  { name: 'pixel-7',        w: 412, h: 915, dsf: 2.6, mobile: true },
  { name: 'desktop',        w: 1440, h: 900, dsf: 1,  mobile: false },
];

(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });

  for (const s of SIZES) {
    const ctx = await browser.newContext({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: s.dsf,
      isMobile: s.mobile,
      hasTouch: s.mobile,
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(7000);

    if (GLOBE) {
      await page.evaluate(() => { const b = document.getElementById('view-globe'); if (b) b.click(); });
      await page.waitForTimeout(4000);
    }

    const tag = s.name + (GLOBE ? '-globe' : '');
    await page.screenshot({ path: path.join(OUT, tag + '.png') });

    const probe = await page.evaluate(() => {
      const g = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      return {
        vw: window.innerWidth, vh: window.innerHeight,
        docW: document.documentElement.scrollWidth,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
        hero: g('.hero'), frame: g('#globe-frame'), globe: g('#globe'),
        canvas: g('#globe canvas'), card: g('.point-card'),
        markers: (window.__locations || []).length,
      };
    });

    console.log(s.name.padEnd(15) + JSON.stringify(probe));
    if (errs.length) console.log('   ERRORS ' + JSON.stringify(errs.slice(0, 4)));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error('FAILED: ' + e.message); process.exit(1); });
