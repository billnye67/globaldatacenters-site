/* Shoots the preview at the height an iPhone ACTUALLY gives a page in Safari, with the address
   bar and the toolbar on screen - not the full device height, which is what made everything
   look fine here and wrong on the phone.
   iPhone 14 / 14 Pro: 390-393 wide, ~844-852 tall, of which Safari keeps roughly 100px. */
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.argv[2];
const TAG = process.argv[3] || 'safari';

const SIZES = [
  { name: 'iphone14-safari', w: 390, h: 745 },   // real usable height with Safari chrome
  { name: 'iphone14-full', w: 390, h: 844 },     // what the emulator shows by default
];

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const s of SIZES) {
    const c = await b.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await c.newPage();
    await p.goto('http://localhost:8787/preview-nobody.html', { waitUntil: 'load' });
    await p.waitForTimeout(7500);
    await p.screenshot({ path: path.join(OUT, TAG + '-' + s.name + '.png') });
    const o = await p.evaluate(() => {
      const q = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
      return {
        vh: window.innerHeight,
        kicker: q('.lead .kicker'), h1: q('.lead h1'), cta: q('.lead .primary'), stats: q('.stats'),
        pov: window.__pov ? { lat: Math.round(window.__pov().lat) } : null,
      };
    });
    console.log(s.name.padEnd(18) + JSON.stringify(o));
    await c.close();
  }
  await b.close();
})().catch(e => { console.error('FAILED ' + e.message); process.exit(1); });
