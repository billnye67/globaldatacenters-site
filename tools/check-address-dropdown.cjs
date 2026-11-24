const assert = require('assert');
const { webkit } = require('playwright');

(async () => {
  const browser = await webkit.launch();
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const page = await browser.newPage({ viewport, isMobile: viewport.width < 900, hasTouch: viewport.width < 900 });
    const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==', 'base64');
    await page.route(/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/(tile|export)/, route => route.fulfill({ contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: tile }));
    await page.route('**/api/geocode?q=**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ matches: [
      { lat: 1.2774194, lng: 103.8593752, label: '31 Marina Boulevard, Singapore 018940, Singapore', house: '31', street: 'Marina Boulevard', city: 'Singapore', country: 'Singapore', cc: 'SG', confidence: .5, buildingConfidence: 0 },
      { lat: 1.2744967, lng: 103.8638866, label: '31 Marina Boulevard, Singapore 018988, Singapore', house: '31', street: 'Marina Boulevard', city: 'Singapore', country: 'Singapore', cc: 'SG', confidence: .5, buildingConfidence: 0 }
    ] }) }));
    await page.goto('http://127.0.0.1:8788/#check', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.RiskAssessment && document.querySelector('#check-address'));
    const before = await page.evaluate(() => { const stage = document.querySelector('.rs-stage').getBoundingClientRect(), form = document.querySelector('#check-form').getBoundingClientRect(), map = document.querySelector('#site-map').getBoundingClientRect(); return { stage: stage.height, map: map.height, formOffset: form.top - stage.top, mapOffset: map.top - stage.top }; });
    await page.locator('#check-address').fill('31 Marina Boulevard, Singapore');
    await page.locator('#check-form button').click();
    await page.waitForFunction(() => document.querySelector('#check').classList.contains('choices-open'));
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => { const stage = document.querySelector('.rs-stage').getBoundingClientRect(), list = document.querySelector('#address-options').getBoundingClientRect(), form = document.querySelector('#check-form').getBoundingClientRect(), map = document.querySelector('#site-map').getBoundingClientRect(); return { stage: stage.height, map: map.height, formOffset: form.top - stage.top, mapOffset: map.top - stage.top, listTop: list.top, formBottom: form.bottom, arrow: getComputedStyle(document.querySelector('.check-btn-arrow')).transform, count: document.querySelectorAll('#address-options button').length }; });
    assert(Math.abs(open.stage - before.stage) < 1 && open.map === before.map && Math.abs(open.formOffset - before.formOffset) < 1 && Math.abs(open.mapOffset - before.mapOffset) < 1 && open.listTop >= open.formBottom && open.count === 2, JSON.stringify({ viewport, before, open }));
    assert(open.arrow !== 'none' && open.arrow !== 'matrix(1, 0, 0, 1, 0, 0)', JSON.stringify(open));
    await page.locator('#address-options button').first().click();
    await page.waitForFunction(() => document.querySelector('#address-options').hidden, null, { timeout: 3000 });
    const closed = await page.evaluate(() => { const form = document.querySelector('#check-form').getBoundingClientRect(), stage = document.querySelector('.rs-stage').getBoundingClientRect(), map = document.querySelector('#site-map').getBoundingClientRect(), text = document.querySelector('.rs-text').getBoundingClientRect(), tag = document.querySelector('#site-tag').getBoundingClientRect(), addr = document.querySelector('#site-addr').getBoundingClientRect(); return { open: document.querySelector('#check').classList.contains('choices-open'), listHidden: document.querySelector('#address-options').hidden, stage: stage.height, map: map.height, formOffset: form.top - stage.top, mapOffset: map.top - stage.top, order: innerWidth > 900 || (map.bottom <= tag.top && tag.bottom <= form.top && form.bottom <= addr.top), formBounds: [form.left,form.right,stage.left,stage.right], formInside: form.left >= stage.left - 1 && form.right <= stage.right + 1, metrics: [...document.querySelectorAll('#score-metrics div')].map(row => { const box = row.getBoundingClientRect(), value = row.querySelector('dd').getBoundingClientRect(); return value.left >= box.left && value.right <= box.right && box.bottom <= text.bottom; }) }; });
    assert(!closed.open && closed.listHidden && Math.abs(closed.stage - before.stage) < 1 && closed.map === before.map && Math.abs(closed.formOffset - before.formOffset) < 1 && Math.abs(closed.mapOffset - before.mapOffset) < 1 && closed.order && closed.formInside && closed.metrics.every(Boolean), JSON.stringify({ viewport, before, closed }));
    if (viewport.width === 320) await page.locator('.rs-stage').screenshot({ path: 'tools/risk-layout-320.png' });
    console.log(JSON.stringify({ viewport, before, open, closed }));
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
