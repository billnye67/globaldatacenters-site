const fs = require('fs');
const assert = require('assert');

async function main() {
  const key = /^GEOAPIFY_KEY=(.+)$/m.exec(fs.readFileSync('.dev.vars', 'utf8'))?.[1]?.trim();
  assert(key, 'Missing local Geoapify key');
  const source = fs.readFileSync('functions/api/geocode.js', 'utf8');
  const { onRequestGet } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const queries = process.argv.slice(2);
  for (const q of queries.length ? queries : ['50 Albert Road, South Melbourne, Victoria, Australia']) {
    const response = await onRequestGet({ request: new Request('http://local/api/geocode?q=' + encodeURIComponent(q)), env: { GEOAPIFY_KEY: key } });
    const data = await response.json();
    assert.equal(response.status, 200, q + ': ' + (data.error || 'provider error'));
    console.log(JSON.stringify({ query: q, matches: data.matches.map(x => ({ label: x.label, house: x.house, street: x.street, city: x.city, country: x.country, confidence: x.confidence, buildingConfidence: x.buildingConfidence, lat: x.lat, lng: x.lng })) }));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
