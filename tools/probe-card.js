/* Measures the phone sheet: every child, its box, and the gaps between them. Prints where the
   dead space actually is instead of guessing at CSS. */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8787/', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  await page.evaluate(() => { const b = document.getElementById('view-globe'); if (b) b.click(); });
  await page.waitForTimeout(4000);

  const hit = await page.evaluate(() => {
    const r = document.getElementById('globe').getBoundingClientRect();
    return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
  });
  let got = false;
  for (let dy = -60; dy <= 120 && !got; dy += 30) {
    for (let dx = -90; dx <= 90 && !got; dx += 30) {
      await page.touchscreen.tap(hit.cx + dx, hit.cy + dy);
      await page.waitForTimeout(240);
      got = await page.evaluate(() => {
        const el = document.getElementById('point-card');
        const im = document.getElementById('card-img');
        return !!el && !el.hidden && !!im && getComputedStyle(im).display !== 'none';
      });
    }
  }
  await page.waitForTimeout(1200);

  const out = await page.evaluate(() => {
    const el = document.getElementById('point-card');
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const rows = [];
    let prevBottom = r.top + parseFloat(cs.paddingTop);
    for (const c of el.children) {
      const s = getComputedStyle(c);
      if (s.display === 'none') { rows.push({ el: c.id || c.className, display: 'none' }); continue; }
      const cr = c.getBoundingClientRect();
      rows.push({
        el: c.id || c.className,
        top: Math.round(cr.top - r.top), bottom: Math.round(cr.bottom - r.top),
        h: Math.round(cr.height),
        gapAbove: Math.round(cr.top - prevBottom),
        mt: s.marginTop, mb: s.marginBottom,
      });
      prevBottom = cr.bottom;
    }
    const contentBottom = prevBottom;
    return {
      cardH: Math.round(r.height),
      padTop: cs.paddingTop, padBottom: cs.paddingBottom,
      lastChildBottomToCardBottom: Math.round(r.bottom - contentBottom),
      viewportBottomGap: Math.round(window.innerHeight - r.bottom),
      rows,
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error('FAILED ' + e.message); process.exit(1); });
