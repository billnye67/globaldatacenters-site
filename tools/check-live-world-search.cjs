const { webkit } = require('playwright');
const fs = require('fs');
const sites = require('../data/globe.json').sites;
const names = ['Google Lok Yang Way', 'Google Hamina', 'NEXTDC S3 Sydney', 'Google Quilicura', 'Vantage JNB2 Isando', 'Google Inzai', 'Google Eemshaven', 'Yotta Navi Mumbai'];
const publicAddresses = [
  '1 Raffles Place, Singapore',
  'Piazza del Colosseo, Rome, Italy',
  'Avenida Paulista 1578, São Paulo, Brazil',
  'Rathausplatz 1, Vienna, Austria',
  'Bennelong Point, Sydney, Australia',
  'Taj Mahal, Agra, India',
  'Nairobi National Museum, Nairobi, Kenya',
  '1 Parliament Street, London, UK',
  'Plaza de Mayo, Buenos Aires, Argentina',
  'Lotte World Tower, Seoul, South Korea',
];
const customerAddresses = [
  '1600 Amphitheatre Parkway, Mountain View, California, USA',
  '200 Wellington Street, Ottawa, Canada',
  '50 Albert Road, South Melbourne, Victoria, Australia',
  '10 Downing Street, London, United Kingdom',
  'Pariser Platz 1, Berlin, Germany',
  '1 Chome-1-2 Oshiage, Sumida City, Tokyo, Japan',
  '25 Jalan Raja, Kuala Lumpur, Malaysia',
  'Burj Khalifa, Dubai, United Arab Emirates',
  'Jomo Kenyatta International Airport, Nairobi, Kenya',
  'Piazza del Duomo, Milan, Italy',
  'Praça da Sé, São Paulo, Brazil',
  'Plaza de Armas, Cusco, Peru',
  'Gandhi Nagar, Jaipur, India',
  'Laugavegur 1, Reykjavík, Iceland',
  'Mývatn Nature Baths, Iceland',
];
const newCustomerAddresses = [
  '100 Queen Street, Auckland, New Zealand',
  '200 Bay Street, Toronto, Canada',
  'Paseo de la Reforma 222, Mexico City, Mexico',
  '1 Wale Street, Cape Town, South Africa',
  '1 Independence Avenue, Accra, Ghana',
  '5 Marina, Lagos, Nigeria',
  '25 Sukhumvit Road, Bangkok, Thailand',
  '31 Marina Boulevard, Singapore',
  '1 Martin Place, Sydney, Australia',
  '10 MG Road, Bengaluru, India',
  '1 Karl Johans gate, Oslo, Norway',
  '12 Mannerheimintie, Helsinki, Finland',
  '1 Dam, Amsterdam, Netherlands',
  '1 Gran Vía, Madrid, Spain',
  'Plaza de la Constitución 1, Santiago, Chile',
];
const retryAddresses = [
  'Tokyo Skytree, Tokyo, Japan',
  'Parliament Hill, Ottawa, Canada',
  'Sultan Abdul Samad Building, Kuala Lumpur, Malaysia',
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const km = (a, b, c, d) => {
  const p = Math.PI / 180, x = (c - a) * p, y = (d - b) * p;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(Math.sin(x / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(y / 2) ** 2)));
};

(async () => {
  const key = /^GEOAPIFY_KEY=(.+)$/m.exec(fs.readFileSync('.dev.vars', 'utf8'))?.[1]?.trim();
  if (!key) throw Error('Missing local address provider key');
  const source = fs.readFileSync('functions/api/geocode.js', 'utf8');
  const { onRequestGet } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const browser = await webkit.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
  let geocode = null;
  await page.route('**/api/geocode?q=**', async route => {
    const response = await onRequestGet({ request: new Request(route.request().url()), env: { GEOAPIFY_KEY: key } });
    const data = await response.json();
    geocode = data.matches?.[0] || null;
    await route.fulfill({ status: response.status, contentType: 'application/json', body: JSON.stringify(data) });
  });
  const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64');
  await page.route(/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/(tile|export)/, route => route.fulfill({ contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: tile }));
  await page.goto('http://127.0.0.1:8787/#check', { waitUntil: 'domcontentloaded' });
  const cases = process.argv[2] === 'customer-retries'
    ? retryAddresses.map(input => ({ input }))
    : process.argv[2] === 'customer-singapore'
    ? [{ input: newCustomerAddresses[7] }]
    : process.argv[2] === 'customer-failed'
    ? [customerAddresses[1], customerAddresses[5], customerAddresses[6]].map(input => ({ input }))
    : process.argv[2] === 'customer-new'
    ? newCustomerAddresses.map(input => ({ input }))
    : process.argv[2] === 'customer-new-suspect'
    ? [newCustomerAddresses[0], newCustomerAddresses[6], newCustomerAddresses[7], newCustomerAddresses[9], customerAddresses[3]].map(input => ({ input }))
    : process.argv[2] === 'customer-focus'
    ? [customerAddresses[1], customerAddresses[6], customerAddresses[13], customerAddresses[14]].map(input => ({ input }))
    : process.argv[2] === 'customer'
    ? customerAddresses.map(input => ({ input }))
    : process.argv[2] === 'public'
    ? [...publicAddresses.map(input => ({ input, expectError: input.startsWith('Avenida Paulista 1578') })), { input: 'zzzz-no-such-address-123456, Nowhere', expectError: true }]
    : names.map(name => {
      const site = sites.find(x => x.name === name);
      if (!site) throw Error('Missing tracker record: ' + name);
      return { input: site.addr, name, site };
    });
  for (const { input, name, site, expectError } of cases) {
    geocode = null;
    await page.locator('#check-address').fill(input);
    await page.locator('#check-form button').click();
    await page.waitForFunction(() => !document.querySelector('#check-form button').disabled, null, { timeout: 20000 });
    let chosen = null;
    if (await page.locator('#address-options').isVisible()) {
      chosen = await page.locator('#address-options button').first().textContent();
      await page.locator('#address-options button').first().click();
      await page.waitForFunction(() => !document.querySelector('#check-form button').disabled, null, { timeout: 20000 });
    }
    if (!expectError) {
      const expected = chosen || geocode?.label || site?.addr;
      await page.waitForFunction(label => document.querySelector('#site-addr').textContent === label && !!document.querySelector('#risk-value').textContent, expected, { timeout: 20000 });
    }
    const result = await page.evaluate(() => ({
      address: document.querySelector('#site-addr').textContent,
      score: document.querySelector('#risk-value').textContent,
      note: document.querySelector('#check-note').textContent,
      error: document.querySelector('#check-note').hasAttribute('data-error'),
      rows: [...document.querySelectorAll('#score-metrics div')].map(x => x.textContent),
      detail: document.querySelector('#risk-factors').textContent,
    }));
    if (!expectError && result.address !== (chosen || geocode?.label || site?.addr)) throw Error('Stale or mismatched address result: ' + input + ' -> ' + result.address);
    if (result.score.trim()) {
      await page.locator('#score-details').click();
      await page.waitForFunction(() => document.querySelector('#check').classList.contains('score-open'));
      const full = await page.evaluate(() => ({
        open: document.querySelector('#check').classList.contains('score-open'),
        factors: [...document.querySelectorAll('#risk-factors li')].map(x => x.textContent),
      }));
      const points = full.factors.map(x => /\b(\d+)\/(\d+) points:/.exec(x));
      if (!full.open || points.length !== 4 || points.some(x => !x) || points.reduce((sum, x) => sum + +x[1], 0) !== +result.score.split('/')[0])
        throw Error('Full score does not explain total for ' + input + ': ' + JSON.stringify(full));
      await page.locator('#score-back').click();
      await page.waitForFunction(() => !document.querySelector('#check').classList.contains('score-open'));
    }
    console.log(JSON.stringify(String(process.argv[2]||'').startsWith('customer-new') || String(process.argv[2]||'') === 'customer' ? {input,address:result.address,score:result.score,note:result.note,error:result.error,rows:result.rows} : { input, trackerName: name, geocoded: geocode ? { lat: geocode.lat, lng: geocode.lng, label: geocode.label } : null, geocodedKmFromTracker: geocode && site ? +km(+geocode.lat, +geocode.lng, site.lat, site.lng).toFixed(1) : null, ...result }));
    if (expectError && (!result.error || result.score.trim())) throw Error('Failed search retained a score');
    if (!expectError && (['customer','customer-new','customer-new-suspect','customer-failed'].includes(String(process.argv[2]||'')) || !String(process.argv[2]||'').startsWith('customer')) && (result.error || !result.score.trim())) throw Error('Search did not produce a score: ' + input);
    await sleep(1200);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
