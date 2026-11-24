const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
global.RiskWater = require('../data/risk-lookup/water.js');
global.RiskGrid = require('../data/risk-lookup/grid.js');
global.RiskLand = require('../data/risk-lookup/land.js');
const assessment = require('../data/risk-lookup/assessment.js');
global.fetch = async function(url) {
  const file = path.join(root, url.replace(/^\//, ''));
  if (!fs.existsSync(file)) return new Response('', {status: 404});
  return new Response(fs.readFileSync(file));
};

const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/globe.json'))).sites
  .filter(x => x.kind !== 'colo').map(x => ({...x, type: 'project', approx: x.type !== 'placed'}));
const samples = [
  ['Ashburn', 39.0437, -77.4875],
  ['Perth', -31.95, 115.86],
  ['Cape Town', -33.9249, 18.4241],
  ['Rural Nevada', 39.5, -116.5],
  ['New York library', 40.7532, -73.9822],
  ['Seattle library', 47.6067, -122.3326],
  ['Los Angeles library', 34.0505, -118.2548],
  ['Chicago library', 41.8764, -87.628],
  ['Nairobi', -1.29, 36.82],
  ['Tokyo', 35.6762, 139.6503],
];
(async () => {
  assert.deepStrictEqual(assessment.weights, {power:30,water:15,land:15,activity:40});
  for (const [name, lat, lng] of samples) {
    const result = await assessment.assess({lat, lng}, sites);
    assert(Number.isInteger(result.score) && result.score >= 0 && result.score <= 100, name);
    assert.strictEqual(result.score, Object.values(result.points).reduce((a,b) => a+b, 0), name);
    assert.deepStrictEqual(result.metrics.map(x => x.label), ['Known activity','Power infrastructure','Water stress','Surrounding land']);
    assert(result.metrics.every(x => typeof x.value === 'string' && x.value.length), name);
    assert.strictEqual(result.factors.length, 4, name);
    assert(!result.factors.some(x => /many|some power|few power|availability|developers are already active/i.test(x)), name);
    console.log(name, result.score + '/100', result.metrics.map(x => x.label + ': ' + x.value).join(' | '));
    if (name === 'New York library')
      assert.strictEqual(result.land.classId, 13, 'coastal address must use surrounding land cover');
  }
  const withdrawn = [{lat:0,lng:0,status:'withdrawn',type:'project'}];
  assert.strictEqual(assessment.activityAt(0,0,withdrawn).score, 4);
  const unknown = [{name:'Tracked Perth site',lat:0,lng:0,status:'unknown',kind:'campus',type:'project'}];
  assert.strictEqual(assessment.activityAt(0,0,unknown).score, 19, 'unknown-status tracker records must count without maxing the activity factor');
  assert.strictEqual(assessment.activityAt(0,0,unknown).within30Miles, 1);
  const proposed = [{...unknown[0], status:'proposed'}];
  assert.strictEqual(assessment.activityAt(0,0,proposed).score, 23, 'active development should add to known activity');
  const fourCampuses = [0,1,2,3].map(i => ({...unknown[0], lng:i * 0.01}));
  assert.strictEqual(assessment.activityAt(0,0,fourCampuses).score, 40, 'several nearby campuses should reach the factor cap');
  const melbourne = assessment.activityAt(-37.8339996, 144.9710619, sites);
  assert.strictEqual(melbourne.within30Miles, 15, 'Melbourne should use the same active tracker pins as the homepage globe');
  assert.strictEqual(melbourne.closest.site.name, 'Google Melbourne');
  const sparse = assessment.compile({lat:0,lng:0}, [], {grid:null,water:null,land:null,unavailable:{grid:true,water:true,land:true}});
  assert.strictEqual(sparse.score, 25);
  assert(sparse.factors.slice(1).every(x => /unavailable/.test(x)), 'missing layers must be visible');
  const dense = assessment.powerPoints({observedCells:220,modeledCells:0});
  const rural = assessment.powerPoints({observedCells:20,modeledCells:0});
  assert(dense > rural, 'grid density should differentiate regions');
  console.log('Four-factor math, tracker inclusion, missing-data labels, and coastal land context: pass');
})().catch(error => {console.error(error); process.exitCode=1;});
