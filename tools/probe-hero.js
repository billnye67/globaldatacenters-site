/* Does the hero fit the visible viewport, and is the stat bar inside it?
   Chrome headless has no retracting toolbars, so svh == viewport height here. The check that
   matters is that the hero is no longer TALLER than the viewport, which is what pushed the
   stat bar under Safari's chrome on a real iPhone. */
const { chromium } = require('playwright');

const SIZES = [
  { name: 'iphone-14',     w: 390, h: 844 },
  { name: 'iphone-14-pro', w: 393, h: 852 },
  { name: 'iphone-se',     w: 375, h: 667 },
  { name: 'galaxy-s20',    w: 360, h: 800 },
];

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const s of SIZES) {
    const ctx = await b.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto('http://localhost:8787/', { waitUntil: 'load' });
    await p.waitForTimeout(6500);
    const o = await p.evaluate(() => {
      const box = el => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; };
      const hero = document.querySelector('.hero'), stats = document.querySelector('.stats'), lead = document.querySelector('.lead');
      const cta = document.querySelector('.lead .primary') || document.querySelector('.lead a.card-btn, .lead .cta, .lead a[href*="take-action"]');
      return {
        vh: window.innerHeight,
        rsvh: getComputedStyle(document.documentElement).getPropertyValue('--rs-vh').trim() || '(unset -> 100svh)',
        hero: box(hero), lead: box(lead), stats: box(stats), cta: cta ? box(cta) : null,
        statsInsideViewport: stats.getBoundingClientRect().bottom <= window.innerHeight,
        heroOverflow: Math.round(hero.getBoundingClientRect().bottom - window.innerHeight),
      };
    });
    console.log(s.name.padEnd(15) + JSON.stringify(o));
    await ctx.close();
  }
  await b.close();
})().catch(e => { console.error('FAILED ' + e.message); process.exit(1); });
