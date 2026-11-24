// Pulls the FracTracker layers that give a project its physical context: where the power
// comes from and who runs the grid there. Run from the repo root:
//
//   node data/pull-fractracker-context.js
//
// Writes data/geo-power-plants.json and data/geo-control-areas.json. Both are cached in the
// repo so a normal build never touches the network.
//
// The tracker is FracTracker's Open U.S. Data Centers Tracker, free to download and share
// with credit to FracTracker. The sibling script data/../fractracker-pull-v13.js keeps only
// the data center layers; this one takes the layers that one filters out.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const POWER = 'https://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/USPowerGenerators_02132026/FeatureServer/4';
const CONTROL = 'https://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/HIFLD_control_areas_geojson/FeatureServer/0';

// Plants smaller than this are rooftop solar and backup diesel, not the thing that decides
// whether a county can host a gigawatt of load.
const MIN_MW = 50;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const get = async u => { const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };

async function pull(layer, opts) {
  const out = [];
  let offset = 0;
  for (;;) {
    const q = layer + '/query?where=1%3D1&outFields=' + encodeURIComponent(opts.fields)
      + '&returnGeometry=' + (opts.geometry ? 'true' : 'false')
      + '&outSR=4326&f=json&resultOffset=' + offset + '&resultRecordCount=' + (opts.page || 1000);
    const j = await get(q);
    if (j.error) throw new Error(j.error.message || 'query refused');
    const f = j.features || [];
    f.forEach(x => out.push(x));
    offset += f.length;
    process.stdout.write('\r  ' + opts.label + ': ' + offset + ' rows');
    if (!f.length || !j.exceededTransferLimit) break;
    await sleep(250);
  }
  console.log('');
  return out;
}

// Rings are thinned so 71 control areas do not become a 40 MB file. A tenth of a degree is
// about 11 km, which is far finer than "which grid is this site on" needs.
function thinRing(ring, tol) {
  const out = [];
  let lx = null, ly = null;
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = ring[i];
    if (lx === null || i === ring.length - 1 || Math.abs(x - lx) > tol || Math.abs(y - ly) > tol) {
      out.push([+x.toFixed(3), +y.toFixed(3)]);
      lx = x; ly = y;
    }
  }
  return out.length > 3 ? out : null;
}

(async () => {
  console.log('Pulling power plants (>= ' + MIN_MW + ' MW kept)...');
  const plants = await pull(POWER, {
    label: 'power plants',
    fields: 'Plant_Name,Total_MW,PrimSource,City,County,State,Latitude,Longitude',
    geometry: false, page: 2000
  });

  const power = plants.map(f => f.attributes)
    .filter(a => (+a.Total_MW || 0) >= MIN_MW && a.Latitude != null && a.Longitude != null)
    .map(a => ({
      name: String(a.Plant_Name || '').trim(),
      mw: Math.round(+a.Total_MW || 0),
      fuel: String(a.PrimSource || '').trim(),
      county: String(a.County || '').trim(),
      state: String(a.State || '').trim(),
      lat: +(+a.Latitude).toFixed(4),
      lng: +(+a.Longitude).toFixed(4)
    }))
    .sort((x, y) => y.mw - x.mw);

  fs.writeFileSync(path.join(ROOT, 'data/geo-power-plants.json'), JSON.stringify(power));
  console.log('  kept ' + power.length + ' plants of ' + plants.length);

  console.log('Pulling control areas...');
  const areas = await pull(CONTROL, { label: 'control areas', fields: 'NAME,TOTAL_CAP,PEAK_LOAD', geometry: true, page: 100 });

  const control = areas.map(f => {
    const rings = (f.geometry && f.geometry.rings) || [];
    const thin = rings.map(r => thinRing(r, 0.05)).filter(Boolean);
    if (!thin.length) return null;
    return {
      name: String(f.attributes.NAME || '').trim(),
      cap: +f.attributes.TOTAL_CAP || null,
      peak: +f.attributes.PEAK_LOAD || null,
      rings: thin
    };
  }).filter(Boolean);

  fs.writeFileSync(path.join(ROOT, 'data/geo-control-areas.json'), JSON.stringify(control));
  console.log('  kept ' + control.length + ' control areas');

  const kb = p => Math.round(fs.statSync(path.join(ROOT, p)).size / 1024) + ' KB';
  console.log('');
  console.log('data/geo-power-plants.json   ' + kb('data/geo-power-plants.json'));
  console.log('data/geo-control-areas.json  ' + kb('data/geo-control-areas.json'));
  console.log('Source: FracTracker Open U.S. Data Centers Tracker.');
})().catch(e => { console.error('Failed: ' + e.message); process.exit(1); });
