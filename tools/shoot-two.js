/* Photographs the live homepage and the no-body preview side by side at phone size. */
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.argv[2];

const PAGES = [
  ['main', 'http://localhost:8787/'],
  ['preview', 'http://localhost:8787/preview-nobody.html'],
];

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [tag, url] of PAGES) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await c.newPage();
    await p.goto(url, { waitUntil: 'load' });
    await p.waitForTimeout(7500);
    await p.screenshot({ path: path.join(OUT, 'tilt-' + tag + '.png') });
    const o = await p.evaluate(() => {
      const q = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : null; };
      const story = document.querySelector('.story');
      return {
        kicker: q('.lead .kicker'), h1: q('.lead h1'), cta: q('.lead .primary'), stats: q('.stats'),
        bodyShown: story ? getComputedStyle(story).display !== 'none' : null,
        pov: window.__pov ? window.__pov() : null,
      };
    });
    console.log(tag.padEnd(9) + JSON.stringify(o));
    await c.close();
  }
  await b.close();
})().catch(e => { console.error('FAILED ' + e.message); process.exit(1); });
