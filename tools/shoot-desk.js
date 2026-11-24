/* The desktop card in its PINNED state - the one you get by clicking a dot, docked at the right.
   Every shot so far caught it hovering or hidden, so this state was never actually looked at. */
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.argv[2];

(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8787/', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  await page.evaluate(() => { const b = document.getElementById('view-globe'); if (b) b.click(); });
  await page.waitForTimeout(4500);

  const hit = await page.evaluate(() => {
    const r = document.getElementById('globe').getBoundingClientRect();
    return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
  });

  let got = false;
  for (let dy = -80; dy <= 140 && !got; dy += 20) {
    for (let dx = -140; dx <= 140 && !got; dx += 20) {
      await page.mouse.click(hit.cx + dx, hit.cy + dy);
      await page.waitForTimeout(160);
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
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const rows = [];
    let prev = r.top + parseFloat(cs.paddingTop);
    for (const c of el.children) {
      const s = getComputedStyle(c);
      if (s.display === 'none') { rows.push({ el: c.id || c.className, display: 'none' }); continue; }
      const cr = c.getBoundingClientRect();
      rows.push({ el: c.id || c.className, h: Math.round(cr.height), gapAbove: Math.round(cr.top - prev), mb: s.marginBottom });
      prev = cr.bottom;
    }
    const btns = [...el.querySelectorAll('.card-btn')].map(b => ({
      id: b.id, w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height),
      x: Math.round(b.getBoundingClientRect().left - r.left), hidden: b.hidden,
    }));
    return {
      pinned: true, cardH: Math.round(r.height), cardW: Math.round(r.width),
      padBottom: cs.paddingBottom, deadSpaceAtBottom: Math.round(r.bottom - prev), rows, btns,
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await page.screenshot({ path: path.join(OUT, 'desktop-pinned.png') });
  await browser.close();
})().catch(e => { console.error('FAILED ' + e.message); process.exit(1); });
