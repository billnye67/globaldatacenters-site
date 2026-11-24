const assert = require('assert');
const { webkit } = require('playwright');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==', 'base64');
  await page.route(/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/(tile|export)/, route => route.fulfill({ contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: tile }));
  await page.route('**/api/geocode?q=**', route => {
    const q = new URL(route.request().url()).searchParams.get('q') || '';
    if (/missing-place/i.test(q)) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"matches":[]}' });
    if (/Marina Boulevard/i.test(q)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ matches: [
      { lat: 1.2774194, lng: 103.8593752, label: '31 Marina Boulevard, Singapore 018940, Singapore', house: '31', street: 'Marina Boulevard', city: 'Singapore', country: 'Singapore', confidence: .5, buildingConfidence: 0 },
      { lat: 1.2744967, lng: 103.8638866, label: '31 Marina Boulevard, Singapore 018988, Singapore', house: '31', street: 'Marina Boulevard', city: 'Singapore', country: 'Singapore', confidence: .5, buildingConfidence: 0 }
    ] }) });
    const perth = /perth/i.test(q);
    const melbourne = /Albert Road/i.test(q);
    const place = melbourne
      ? { lat: -37.8339996, lng: 144.9710619, label: '50 Albert Road, South Melbourne, Victoria, Australia', house: '50', street: 'Albert Road', city: 'South Melbourne', country: 'Australia', cc: 'AU', confidence: 1, buildingConfidence: 1 }
      : perth
      ? { lat: -31.95, lng: 115.86, label: 'Perth, Australia', city: 'Perth', country: 'Australia', cc: 'AU', confidence: 1 }
      : { lat: 39.0437, lng: -77.4875, label: 'Ashburn, Virginia, United States', city: 'Ashburn', state: 'Virginia', country: 'United States', cc: 'US', confidence: 1 };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ matches: [place] }) });
  });
  await page.goto('http://127.0.0.1:8787/#check', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.RiskAssessment && document.querySelector('#check-address'));
  assert(await page.locator('#score-details').isHidden(), 'full score appears before a search');
  async function search(query) {
    await page.locator('#check-address').fill(query);
    await page.locator('#check-form button').click();
    await page.waitForFunction(name => document.querySelector('#site-addr').textContent.includes(name) && !document.querySelector('#score-details').hidden, query.split(',')[0]);
    return page.evaluate(() => ({
      score: document.querySelector('#risk-value').textContent,
      rows: [...document.querySelectorAll('#score-metrics div')].map(x => x.textContent),
      detail: document.querySelector('#risk-factors').textContent,
      hidden: document.querySelector('#score-details').hidden,
    }));
  }
  const perth = await search('Perth, Australia');
  assert(perth.score.endsWith('/100'), JSON.stringify(perth));
  assert(perth.rows.some(x => /4 tracker pins/.test(x)), JSON.stringify(perth));
  assert(perth.detail.includes('NEXTDC P2 Perth'), JSON.stringify(perth));
  assert(!perth.rows.some(x => /availability/i.test(x)), JSON.stringify(perth));
  await page.locator('.rs-stage').screenshot({ path: 'tools/risk-stage-phone.png' });
  const beforeScoreOpen = await page.evaluate(() => ({ stage: document.querySelector('.rs-stage').getBoundingClientRect().height, map: document.querySelector('#site-map').getBoundingClientRect().height }));
  await page.locator('#score-details').click();
  await page.waitForFunction(() => document.querySelector('#check').classList.contains('score-open'));
  await page.waitForTimeout(380);
  assert(await page.locator('#score-full').isVisible() && await page.locator('#score-summary').isHidden(), 'full breakdown must replace quick readings inside the panel');
  const fullScore = await page.locator('#risk-factors li').allTextContents();
  assert.strictEqual(fullScore.length, 4, JSON.stringify(fullScore));
  assert(fullScore.every(x => /\d+\/\d+ points:/.test(x)), JSON.stringify(fullScore));
  const afterScoreOpen = await page.evaluate(() => ({ stage: document.querySelector('.rs-stage').getBoundingClientRect().height, map: document.querySelector('#site-map').getBoundingClientRect().height }));
  assert.equal(afterScoreOpen.map, beforeScoreOpen.map, 'full score must not resize the map');
  const letterUrl = new URL(await page.locator('#score-view-letter').getAttribute('href'), 'http://localhost');
  assert.equal(letterUrl.pathname, '/take-action');
  assert.equal(letterUrl.searchParams.get('country'), 'AU');
  assert(letterUrl.searchParams.get('town').includes('Perth'));
  await page.locator('#score-full').screenshot({ path: 'tools/risk-result-phone.png' });
  await page.locator('#score-back').click();
  await page.waitForFunction(() => !document.querySelector('#check').classList.contains('score-open'));
  await page.waitForTimeout(380);
  assert(await page.locator('#score-metrics').isVisible(), 'quick readings should return');
  const ashburn = await search('Ashburn, Virginia');
  assert(ashburn.rows.some(x => /\d+ tracker pins/.test(x)), JSON.stringify(ashburn));
  assert(ashburn.detail.includes('active tracker pins'), JSON.stringify(ashburn));
  assert.notDeepStrictEqual(perth.rows, ashburn.rows);
  const melbourne = await search('50 Albert Road, South Melbourne, Victoria, Australia');
  assert(melbourne.rows.some(x => /15 tracker pins/.test(x)), JSON.stringify(melbourne));
  assert(melbourne.detail.includes('NEXTDC M1 Melbourne'), JSON.stringify(melbourne));
  const globeCount = await page.evaluate(() => window.RiskAssessment.activityAt(-37.8339996, 144.9710619, window.__locations).within30Miles);
  assert.equal(globeCount, 15, 'address count must match active homepage globe project pins');
  await page.waitForTimeout(7000);
  assert.strictEqual(await page.locator('#site-map .fly-pin').count(), 1, 'address assessment must show only the searched address');
  assert.strictEqual(await page.locator('#site-map .fly-pin-project').count(), 0, 'address assessment must not show project dots');
  await page.locator('#site-globe').click();
  await page.waitForFunction(() => document.querySelector('#check').classList.contains('rs-globe'), null, { timeout: 12000 });
  await page.waitForFunction(() => document.querySelector('#hero-sec').classList.contains('chrome-only') && document.querySelector('#hero-sec').classList.contains('show'), null, { timeout: 12000 });
  assert(await page.locator('#reports-toggle').isVisible(), 'risk globe must use the homepage legend');
  assert(await page.locator('#rotation-toggle').isVisible(), 'risk globe must use the homepage controls');
  const pinsMatch = await page.evaluate(() => {
    const shown = window.__riskGlobe.pointsData(), home = window.__visibleLocations();
    return shown.length === home.length && shown.every((x, i) => x === home[i]) && shown.length > 100;
  });
  assert(pinsMatch, 'risk globe must draw the same visible pin objects as the homepage globe');
  const colorsMatch = await page.evaluate(() => {
    const pin = window.__visibleLocations().find(x => x.type === 'project' && !x.blk);
    return window.__riskGlobe.pointColor()(pin) === window.__dotColor(pin);
  });
  assert(colorsMatch, 'risk globe must use the homepage satellite pin color');
  await page.locator('#reports-toggle').click();
  assert(await page.evaluate(() => window.__riskGlobe.pointsData().length === window.__visibleLocations().length), 'risk globe must follow homepage layer filters');
  await page.locator('#reports-toggle').click();
  assert.strictEqual(await page.locator('#globe-back').textContent(), '← Assessment');
  for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 760, height: 1024 }]) {
    await page.setViewportSize(size);
    await page.evaluate(() => document.querySelector('#hero-sec').style.setProperty('--sb', '180px'));
    const bottomGap = await page.locator('.map-meta').evaluate(el => window.innerHeight - el.getBoundingClientRect().bottom);
    assert(bottomGap >= 45 && bottomGap <= 90, `risk globe controls float above the bottom at ${size.width}x${size.height}: ${bottomGap}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#globe-back').click();
  await page.waitForFunction(() => !document.querySelector('#check').classList.contains('rs-globe'), null, { timeout: 12000 });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator('.rs-stage').screenshot({ path: 'tools/risk-stage-desktop.png' });
  await page.locator('#score-details').click();
  await page.waitForFunction(() => document.querySelector('#check').classList.contains('score-open'));
  const desktop = await page.evaluate(() => {
    const stage = document.querySelector('.rs-stage').getBoundingClientRect();
    const map = document.querySelector('#site-map').getBoundingClientRect();
    const full = document.querySelector('#score-full').getBoundingClientRect();
    const readout = document.querySelector('.readout').getBoundingClientRect();
    return {
      stageHeight: stage.height,
      mapHeight: map.height,
      fullInsidePanel: full.left >= readout.left && full.right <= readout.right,
      scrollWidth: document.documentElement.scrollWidth,
      scoreVisible: !!document.querySelector('#risk-value').textContent,
    };
  });
  assert(desktop.stageHeight === 660 && desktop.mapHeight === 660 && desktop.fullInsidePanel && desktop.scoreVisible && desktop.scrollWidth <= 1280, JSON.stringify(desktop));
  await page.locator('.readout').screenshot({ path: 'tools/risk-result-desktop.png' });
  await page.locator('#score-back').click();
  await page.waitForFunction(() => !document.querySelector('#check').classList.contains('score-open'));
  await page.setViewportSize({ width: 390, height: 844 });
  const mapBeforeChoices = await page.locator('#site-map').evaluate(el => el.getBoundingClientRect().height);
  await page.locator('#check-address').fill('31 Marina Boulevard, Singapore');
  await page.locator('#check-form button').click();
  await page.locator('#address-options button').first().waitFor();
  const mapAfterChoices = await page.locator('#site-map').evaluate(el => el.getBoundingClientRect().height);
  assert.equal(mapAfterChoices, mapBeforeChoices, 'address choices must not resize the map');
  const choices = await page.locator('#address-options').evaluate(el => ({ top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom, width: el.getBoundingClientRect().width }));
  assert(choices.width > 250 && choices.top >= 0 && choices.bottom <= 844, JSON.stringify(choices));
  assert.equal(await page.locator('#risk-value').textContent(), '', 'an unconfirmed address must not receive a score');
  await page.locator('#address-options button').first().click();
  await page.waitForFunction(() => document.querySelector('#risk-value').textContent.endsWith('/100'));
  assert((await page.locator('#check-note').textContent()).includes('exact address not verified'));
  assert((await page.locator('#site-addr').textContent()).includes('018940'));
  for (const query of ['missing-place-one', 'missing-place-two']) {
    await page.locator('#check-address').fill(query);
    await page.locator('#check-form button').click();
    await page.waitForFunction(() => !document.querySelector('#check-form button').disabled);
    assert.equal(await page.locator('#site-addr').textContent(), query, 'failed search must show the latest query');
    assert.equal(await page.locator('#risk-value').textContent(), '', 'failed search must clear the previous score');
    assert(await page.locator('#check-note').getAttribute('data-error') !== null, 'failed search needs an error note');
  }
  assert.deepStrictEqual(errors, []);
  console.log('PASS', JSON.stringify({ perth, ashburn }));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
