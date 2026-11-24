const { webkit } = require('playwright');
const assert = require('assert/strict');
(async () => {
  const browser = await webkit.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/World_Imagery/MapServer/tile/**', route => route.abort());
    await page.goto('http://127.0.0.1:8787/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__heroGlobe && window.__riskGlobe && window.__warmed);
    async function start(which, lng) {
      await page.evaluate(({ which, lng }) => {
        window.__stopGlobeRotation();
        const g = which === 'home' ? __heroGlobe : __riskGlobe, original = g.pointOfView;
        original.call(g, { ...original.call(g), lng }, 0);
        window.__spinRows = [];
        window.__stopSpinSample = () => { g.pointOfView = original; };
        g.pointOfView = function (pov) {
          if (pov && Number.isFinite(pov.lng)) __spinRows.push({ at: performance.now(), lng: pov.lng });
          return original.apply(g, arguments);
        };
      }, { which, lng });
    }
    async function finish(which, lng) {
      const rows = await page.evaluate(() => { __stopSpinSample(); return __spinRows; });
      const travel = rows.at(-1).lng - rows[0].lng;
      const duration = rows.at(-1).at - rows[0].at;
      const expected = (((-97 - lng) % 360) + 360) % 360 + 360;
      let peak = 0;
      for (let i = 1; i < rows.length; i++) {
        const dt = rows[i].at - rows[i - 1].at;
        if (dt > 8) peak = Math.max(peak, (rows[i].lng - rows[i - 1].lng) / dt * 1000);
      }
      console.log(JSON.stringify({ which, lng, degrees: +travel.toFixed(1), ms: Math.round(duration), peakDegreesPerSecond: Math.round(peak) }));
      assert(travel >= 350, 'Keep the full spin');
      assert(Math.abs(travel - expected) < 10, 'Preserve the original route');
      assert(duration >= 1800 * expected / 360 - 200, 'Do not compress longer spins');
      assert(peak < 800, 'No intermittent double-speed spin');
    }
    for (const lng of [-98, -96, 80, 179, -179]) {
      await start('home', lng);
      await page.locator('.globe-tap').click();
      await page.evaluate(() => document.getElementById('view-globe').click());
      await page.waitForFunction(() => !window.__camAnim);
      await finish('home', lng);
      await page.locator('#globe-back').click();
      await page.waitForFunction(() => !window.__camAnim);
      await page.waitForTimeout(800);
    }
    await page.locator('#check').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelectorAll('#score-metrics dd').length === 4);
    await page.locator('#check-address').focus();
    await page.waitForTimeout(4500);
    for (const lng of [-98, -96, 115.86]) {
      await start('risk', lng);
      await page.locator('#site-globe').click({ force: true });
      await page.waitForFunction(() => document.getElementById('hero-sec').classList.contains('chrome-only'));
      await finish('risk', lng);
      await page.locator('#globe-back').click();
      await page.waitForFunction(() => !document.getElementById('check').classList.contains('rs-globe'));
      assert(await page.evaluate(() => Object.values(__riskGlobe.pointOfView()).every(Number.isFinite)));
      await page.waitForTimeout(200);
    }
    assert.deepEqual(errors, []);
    console.log('PASS full spins retained, longer turns have proportional duration, repeat taps ignored, assessment returns remain valid');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
