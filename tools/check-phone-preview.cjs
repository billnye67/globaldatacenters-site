const assert = require('assert');
const { webkit } = require('playwright');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==', 'base64');
  await page.route(/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/(tile|export)/, route => route.fulfill({ contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: tile }));
  await page.goto('http://192.168.1.77:8788/#check', { waitUntil: 'domcontentloaded' });
  for (const address of ['Perth, Australia', '50 Albert Road, South Melbourne, Victoria, Australia']) {
    await page.locator('#check-address').fill(address);
    await page.locator('#check-form button').click();
    await page.waitForFunction(() => !document.querySelector('#check-form button').disabled, null, { timeout: 30000 });
    if (await page.locator('#address-options').isVisible()) {
      await page.locator('#address-options button').first().click();
      await page.waitForFunction(() => !document.querySelector('#check-form button').disabled, null, { timeout: 30000 });
    }
    const result = await page.evaluate(() => ({ score: document.querySelector('#risk-value').textContent, note: document.querySelector('#check-note').textContent }));
    assert(result.score.endsWith('/100'), `${address}: ${JSON.stringify(result)}`);
    console.log(JSON.stringify({ address, ...result }));
  }
  await page.locator('#site-globe').click();
  await page.waitForFunction(() => document.querySelector('#hero-sec').classList.contains('chrome-only'), null, { timeout: 15000 });
  const match = await page.evaluate(() => {
    const risk = window.__riskGlobe.pointsData(), home = window.__visibleLocations();
    const bottomGap = innerHeight - document.querySelector('.map-meta').getBoundingClientRect().bottom;
    return { riskPins: risk.length, homePins: home.length, same: risk.length === home.length && risk.every((pin, i) => pin === home[i]), radius: window.__riskGlobe.pointRadius()(risk[0]), bottomGap };
  });
  assert(match.same && match.riskPins > 100 && match.radius > 0, JSON.stringify(match));
  assert(match.bottomGap >= 45 && match.bottomGap <= 90, JSON.stringify(match));
  assert.deepStrictEqual(errors, []);
  console.log(JSON.stringify(match));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
