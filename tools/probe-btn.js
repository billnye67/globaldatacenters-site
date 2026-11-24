/* Why is the primary button taller than the one above it? Dump its computed box. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://localhost:8787/', { waitUntil: 'load' });
  await p.waitForTimeout(6000);
  const out = await p.evaluate(() => {
    const pick = id => {
      const e = document.getElementById(id);
      if (!e) return null;
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return {
        id, h: Math.round(r.height), w: Math.round(r.width),
        pad: s.paddingTop + ' / ' + s.paddingBottom,
        lineHeight: s.lineHeight, fontSize: s.fontSize, display: s.display,
        minHeight: s.minHeight, alignSelf: s.alignSelf, boxSizing: s.boxSizing,
        text: (e.textContent || '').trim().slice(0, 40),
        childNodes: [...e.childNodes].map(n => n.nodeName + (n.nodeType === 3 ? ':' + JSON.stringify(n.nodeValue.slice(0, 24)) : '')),
      };
    };
    const el = document.getElementById('point-card');
    el.hidden = false;
    const acts = document.querySelector('.card-actions');
    const as = getComputedStyle(acts);
    return {
      actions: { display: as.display, flexDirection: as.flexDirection, alignItems: as.alignItems, gap: as.gap, h: Math.round(acts.getBoundingClientRect().height) },
      fly: pick('card-fly'), details: pick('card-details'), letter: pick('card-letter'),
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch(e => { console.error('FAILED ' + e.message); process.exit(1); });
