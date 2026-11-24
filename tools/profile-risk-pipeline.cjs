const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    if (process.argv.includes('--baseline')) {
      const original = execFileSync('git', ['show', 'HEAD:globe.gl.js'], { maxBuffer: 10 * 1024 * 1024 });
      await page.route('**/globe.gl.js', route => route.fulfill({ contentType: 'text/javascript', body: original }));
      await page.route('**/risk-render-budget.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    }
    // Hold imagery responses: this isolates tile selection/geometry from downloading and GPU upload.
    await page.route('**/World_Imagery/MapServer/tile/**', route => route.abort());
    await page.goto('http://127.0.0.1:8788/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__rsTe && window.__riskGlobe);
    await page.locator('#check-address').focus(); // End the demo so it cannot change the camera during the measurement.
    await page.waitForTimeout(3000);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.start');
    const samples = await page.evaluate(async () => {
      const g = window.__riskGlobe, te = window.__rsTe;
      window.__heroGlobe.pauseAnimation(); g.pauseAnimation();
      te.clearTiles();
      const rows = [];
      for (let pass = 0; pass < 2; pass++) {
        for (let level = 1; level <= 13; level++) {
          const altitude = 12 / Math.pow(2, level);
          const start = performance.now();
          g.pointOfView({ lat: 39.0437, lng: -77.4875, altitude }, 0);
          g.controls().update(); g.camera().updateMatrixWorld();
          te.updatePov(g.camera());
          rows.push({ pass, level: te.level, ms: +(performance.now() - start).toFixed(2) });
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      return rows;
    });
    const { profile } = await cdp.send('Profiler.stop');
    const nodes = new Map(profile.nodes.map(n => [n.id, n]));
    const times = new Map();
    profile.samples.forEach((id, i) => times.set(id, (times.get(id) || 0) + profile.timeDeltas[i]));
    const top = [...times].sort((a,b) => b[1]-a[1]).slice(0, 18).map(([id, us]) => ({ ms: +(us/1000).toFixed(1), name: nodes.get(id).callFrame.functionName, file: nodes.get(id).callFrame.url.split('/').pop() }));
    const budget = await page.evaluate(() => window.__rsTe.tileWorkScheduler?.stats);
    const output = { samples, top, budget };
    const out = process.argv.find((v,i) => i > 1 && !v.startsWith('--'));
    if (out) fs.writeFileSync(path.resolve(out), JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
