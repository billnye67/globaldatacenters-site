const { webkit } = require('playwright');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 745 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('crash', () => errors.push('page crashed'));
  const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64');
  await page.route(/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/(tile|export)/, r => r.fulfill({ contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: tile }));
  await page.goto('http://localhost:8787/#main');
  await page.waitForFunction(() => window.__warmed && window.__heroGlobe);
  await page.locator('.globe-tap').click();
  await page.waitForFunction(() => document.querySelector('#hero-sec').classList.contains('globe-mode'));
  const overlap = await page.evaluate(() => ({ heroBottom: document.querySelector('#hero-sec').getBoundingClientRect().bottom, pressTop: document.querySelector('.press').getBoundingClientRect().top }));
  if (overlap.pressTop < overlap.heroBottom - 1) throw Error('Press overlaps globe during opening: ' + JSON.stringify(overlap));
  await page.waitForTimeout(5000);
  const site = await page.evaluate(() => {
    const x = window.__locations.find(p => p.type === 'project' && !p.approx && !p.blk && p.lat > 30 && p.lat < 45 && p.lng > -110 && p.lng < -90);
    window.__showCard(x, true);
    return { lat: x.lat, lng: x.lng, name: x.name };
  });
  if (await page.locator('#card-fly').textContent() !== 'Go to this site') throw Error('Button label is wrong');
  if (await page.locator('#card-fly').isHidden()) throw Error('Exact site action is hidden');
  await page.locator('#card-fly').click();
  await page.waitForTimeout(3000);
  const reached = await page.evaluate(() => {
    const g = window.__heroGlobe, dots = [];
    g.scene().traverse(o => { if (o.__heroDots) dots.push(o.visible); });
    return { pov: g.pointOfView(), autoRotate: g.controls().autoRotate, cardHidden: document.querySelector('#point-card').hidden, dots, labels: g.htmlElementsData().length };
  });
  if (Math.abs(reached.pov.lat - site.lat) > .001 || Math.abs(reached.pov.lng - site.lng) > .001 || reached.pov.altitude > .0006 || !reached.cardHidden || !reached.dots.some(Boolean) || reached.labels) throw Error('Site view failed: ' + JSON.stringify({ site, reached }));
  await page.evaluate(site => window.__heroGlobe.pointOfView({ lat: site.lat, lng: site.lng, altitude: .05 }, 800), site);
  await page.waitForTimeout(1200);
  const restored = await page.evaluate(() => { const dots = []; window.__heroGlobe.scene().traverse(o => { if (o.__heroDots) dots.push(o.visible); }); return { shown: dots.some(Boolean), pov: window.__heroGlobe.pointOfView(), dots }; });
  if (!restored.shown) throw Error('Pins did not return on zoom out: ' + JSON.stringify(restored));
  await page.evaluate(() => window.__showCard(window.__locations.find(p => p.type === 'project' && p.approx), true));
  if (!await page.locator('#card-fly').isHidden()) throw Error('Approximate site has exact-site action');
  await page.locator('#globe-back').click({ force: true });
  await page.waitForTimeout(2800);
  if (await page.evaluate(() => document.querySelector('#hero-sec').classList.contains('globe-mode') || document.body.classList.contains('globe-entering'))) throw Error('Globe did not exit cleanly');
  if (errors.length) throw Error(errors.join('; '));
  console.log('PASS', JSON.stringify({ site, altitude: reached.pov.altitude, overlap, markersRestored: restored.shown }));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
