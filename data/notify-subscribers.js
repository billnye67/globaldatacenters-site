// Emails alert subscribers when a project near them is new or changes status.
//
// Run it after the page build:
//   node data/build-globe.js && node data/build-pages.js && node data/notify-subscribers.js
//
// It sends NOTHING unless you pass --send. The default is a dry run that prints every
// email it would send and the reason, so you can read it before anyone else does.
//
//   node data/notify-subscribers.js                 dry run, the default
//   node data/notify-subscribers.js --send          actually send, after you have read a dry run
//   node data/notify-subscribers.js --fixture f.json   dry run against a fake subscriber list
//   node data/notify-subscribers.js --radius 80     change the 50 km default
//   node data/notify-subscribers.js --reset         rewrite the snapshot without sending
//
// How it decides who to email
//   1. Compare data/projects.json against data/alerts-state.json, the snapshot of the
//      last run. A project is interesting if it is new to us, or its status changed.
//   2. Put every subscriber on the map. We only ever hold a country and a postcode, so
//      the postcode is geocoded once and cached in data/postcode-cache.json.
//   3. Anyone within the radius of an interesting project gets one email naming it.
//
// Nobody is emailed twice for the same project and status: data/alerts-sent.json
// remembers what already went out, so re-running after a failure is safe.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const F = function (p) { return path.join(ROOT, p); };

const SITE = 'https://globaldatacenters.net';
const STATE_FILE = F('data/alerts-state.json');
const SENT_FILE = F('data/alerts-sent.json');
const GEO_FILE = F('data/postcode-cache.json');

const args = process.argv.slice(2);
const has = function (f) { return args.indexOf(f) !== -1; };
const val = function (f, d) { const i = args.indexOf(f); return i !== -1 && args[i + 1] ? args[i + 1] : d; };

const SEND = has('--send');
const RESET = has('--reset');
const FIXTURE = val('--fixture', '');
const RADIUS_KM = parseFloat(val('--radius', '50'));
const LIMIT = parseInt(val('--limit', '0'), 10) || 0;

// ---------------------------------------------------------------- small helpers

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return fallback; }
}

function env() {
  const out = Object.assign({}, process.env);
  // data/.env is where the Google key already lives for geocode-google.js
  try {
    fs.readFileSync(F('data/.env'), 'utf8').split('\n').forEach(function (line) {
      const i = line.indexOf('=');
      if (i > 0 && line.trim()[0] !== '#') {
        const k = line.slice(0, i).trim();
        if (!out[k]) out[k] = line.slice(i + 1).trim();
      }
    });
  } catch (e) { /* no .env is fine when the keys come from the environment */ }
  return out;
}

const ENV = env();

// Distance on a sphere. Good to a few metres at these ranges, which is far better
// than a postcode centre deserves.
function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const toRad = function (d) { return d * Math.PI / 180; };
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// Must match the token functions/api/alerts.js checks on the unsubscribe link.
function unsubToken(email) {
  const secret = ENV.ALERTS_SECRET || ENV.BREVO_API_KEY || '';
  return crypto.createHmac('sha256', secret).update(email).digest('hex').slice(0, 32);
}

function unsubUrl(email) {
  return SITE + '/api/alerts?u=' + encodeURIComponent(email) + '&t=' + unsubToken(email);
}

const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

// ---------------------------------------------------------------- the projects

// The status wording on the site, reduced to the handful of states worth an email.
function statusOf(p) {
  const raw = String(p.status || '').toLowerCase();
  if (/withdraw/.test(raw)) return 'Withdrawn';
  if (/denied|reject|blocked/.test(raw)) return 'Denied';
  if (/operating|online|complete/.test(raw)) return 'Operating';
  if (/construction|building/.test(raw)) return 'Under construction';
  if (/approv/.test(raw)) return 'Approved';
  if (/propos|announc|filed|pending|review/.test(raw)) return 'Proposed';
  return p.status ? String(p.status) : 'Tracked';
}

function loadProjects() {
  const db = readJson(F('data/projects.json'), null);
  if (!db || !db.projects) {
    console.error('Could not read data/projects.json. Run this from the repo root.');
    process.exit(1);
  }
  // build-pages.js writes this, so a project only counts once it has a page to link to.
  const pages = readJson(F('data/project-pages.json'), {});

  return db.projects
    .filter(function (p) { return p.kind !== 'jurisdiction'; })
    .map(function (p) {
      const lat = Number(p.lat), lng = Number(p.lng);
      return {
        id: String(p.id),
        name: p.name || 'Unnamed project',
        town: p.address || '',
        country: p.country || '',
        status: statusOf(p),
        lat: lat, lng: lng,
        page: pages[String(p.id)] || ''
      };
    })
    .filter(function (p) { return p.page && isFinite(p.lat) && isFinite(p.lng); });
}

// ---------------------------------------------------------------- subscribers

// Brevo holds the list. We only read it; nothing here writes a contact.
async function brevoSubscribers() {
  const key = ENV.BREVO_API_KEY;
  const listId = parseInt(ENV.BREVO_LIST_ID, 10) || 3;
  if (!key) {
    console.error('No BREVO_API_KEY, so there is no subscriber list to read.');
    console.error('Set it, or pass --fixture data/alerts-fixture.json to rehearse offline.');
    process.exit(1);
  }

  const out = [];
  let offset = 0;
  for (;;) {
    const url = 'https://api.brevo.com/v3/contacts/lists/' + listId + '/contacts?limit=500&offset=' + offset;
    const res = await fetch(url, { headers: { 'accept': 'application/json', 'api-key': key } });
    if (!res.ok) {
      console.error('Brevo list read failed (' + res.status + '): ' + (await res.text()).slice(0, 300));
      process.exit(1);
    }
    const body = await res.json();
    const batch = body.contacts || [];
    batch.forEach(function (c) {
      const a = c.attributes || {};
      if (c.emailBlacklisted) return;
      out.push({
        email: String(c.email || '').toLowerCase(),
        country: a.COUNTRY || '',
        postcode: String(a.POSTCODE || '').toUpperCase()
      });
    });
    if (batch.length < 500) break;
    offset += 500;
    await sleep(120);
  }
  return out.filter(function (s) { return s.email && s.country && s.postcode; });
}

function fixtureSubscribers(file) {
  const rows = readJson(path.resolve(ROOT, file), null);
  if (!Array.isArray(rows)) {
    console.error('Fixture must be a JSON array of {email, country, postcode}.');
    process.exit(1);
  }
  return rows.map(function (r) {
    return {
      email: String(r.email || '').toLowerCase(),
      country: r.country || '',
      postcode: String(r.postcode || '').toUpperCase()
    };
  }).filter(function (s) { return s.email && s.country && s.postcode; });
}

// ---------------------------------------------------------------- placing people

// zip-lookup.json is "zip" -> "City|STATE". It has no coordinates, so it cannot place
// anyone on its own; what it gives us is a much better geocoder query than a bare zip,
// and a way to reject a zip that does not exist. Everything else goes to Google, the
// same geocoder data/geocode-google.js already uses, and every answer is cached.
const zipLookup = readJson(F('zip-lookup.json'), {});
const geoCache = readJson(GEO_FILE, {});
let geoCacheDirty = false;
let geocodeCalls = 0;

function queryFor(sub) {
  if (/^(us|usa|united states)$/i.test(sub.country)) {
    const hit = zipLookup[sub.postcode];
    if (hit) {
      const parts = String(hit).split('|');
      return parts[0] + ', ' + (parts[1] || '') + ' ' + sub.postcode + ', United States';
    }
    return sub.postcode + ', United States';
  }
  return sub.postcode + ', ' + sub.country;
}

async function placeOf(sub) {
  const cacheKey = (sub.country + '|' + sub.postcode).toUpperCase();
  if (geoCache[cacheKey]) return geoCache[cacheKey];

  // A US zip we cannot find at all is bad data, not a geocoding problem.
  if (/^(us|usa|united states)$/i.test(sub.country) && !zipLookup[sub.postcode]) {
    geoCache[cacheKey] = { error: 'not a known US zip' };
    geoCacheDirty = true;
    return geoCache[cacheKey];
  }

  const key = ENV.GOOGLE_MAPS_KEY;
  if (!key) {
    return { error: 'no GOOGLE_MAPS_KEY, cannot place this postcode' };
  }

  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
    + encodeURIComponent(queryFor(sub)) + '&key=' + key;
  let place;
  try {
    geocodeCalls++;
    const j = await (await fetch(url)).json();
    if (j.status === 'OK' && j.results[0]) {
      const loc = j.results[0].geometry.location;
      place = { lat: loc.lat, lng: loc.lng, label: j.results[0].formatted_address };
    } else {
      place = { error: 'geocoder said ' + j.status };
    }
  } catch (e) {
    place = { error: 'geocoder request failed' };
  }
  geoCache[cacheKey] = place;
  geoCacheDirty = true;
  await sleep(60);
  return place;
}

// ---------------------------------------------------------------- the email

// An address is written street first, so the first comma part is often a road or a
// cross street ("between N Lecanto Hwy and N Florida Ave"), which reads badly in a
// subject line. Work back from the end instead, dropping the postcode and the country,
// and take the last thing that still looks like a place name.
function townFrom(address, country) {
  const parts = String(address || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  while (parts.length > 1) {
    const last = parts[parts.length - 1];
    const isCountry = country && last.toLowerCase() === String(country).toLowerCase();
    const isPostal = /^[A-Z]{2}\s+\d{5}(-\d{4})?$/i.test(last)   // "FL 34442"
      || /^\d{4,6}$/.test(last)                                  // a bare postcode
      || /^[A-Z]{1,2}\d[A-Z\d]?\s*\d?[A-Z]{0,2}$/i.test(last);   // UK/IE style
    if (!isCountry && !isPostal) break;
    parts.pop();
  }
  return parts.length ? parts[parts.length - 1] : (country || '');
}

function subjectFor(p, isNew) {
  const where = townFrom(p.town, p.country) || p.country;
  return isNew
    ? 'New data center proposed near ' + where
    : p.name + ' is now ' + p.status.toLowerCase();
}

function bodyFor(p, sub, isNew, km) {
  const link = SITE + p.page;
  const lines = [
    isNew
      ? 'A data center we had not tracked before has turned up about ' + Math.round(km) + ' km from ' + sub.postcode + '.'
      : 'A data center about ' + Math.round(km) + ' km from ' + sub.postcode + ' has changed status.',
    '',
    p.name,
    townFrom(p.town, p.country) || p.country,
    'Status: ' + p.status,
    '',
    'Everything we have on it, with the records behind it:',
    link,
    '',
    'You are getting this because you asked to hear about data centers near ' + sub.postcode + '.',
    'Stop these emails: ' + unsubUrl(sub.email)
  ];
  return lines.join('\n');
}

async function sendOne(to, subject, text) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': ENV.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Global Data Centers', email: ENV.BREVO_FROM || 'tips@floridadatacenters.org' },
      to: [{ email: to }],
      subject: subject,
      textContent: text,
      headers: { 'List-Unsubscribe': '<' + unsubUrl(to) + '>' }
    })
  });
  if (!res.ok) throw new Error('Brevo ' + res.status + ': ' + (await res.text()).slice(0, 200));
}

// ---------------------------------------------------------------- run

(async function () {
  const projects = loadProjects();
  const previous = readJson(STATE_FILE, null);
  const firstRun = previous === null;
  const snapshot = {};
  projects.forEach(function (p) { snapshot[p.id] = { status: p.status, name: p.name }; });

  if (firstRun) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot, null, 2) + '\n');
    console.log('First run. Wrote a snapshot of ' + projects.length + ' projects to data/alerts-state.json.');
    console.log('Nothing was emailed: there is no earlier run to compare against.');
    console.log('The next run will report what changed since now.');
    return;
  }

  if (RESET) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot, null, 2) + '\n');
    console.log('Snapshot rewritten for ' + projects.length + ' projects. Nothing emailed.');
    return;
  }

  // ---- what changed
  const changed = [];
  projects.forEach(function (p) {
    const before = previous[p.id];
    if (!before) { changed.push({ p: p, isNew: true, was: null }); return; }
    if (before.status !== p.status) changed.push({ p: p, isNew: false, was: before.status });
  });

  console.log('Projects tracked now: ' + projects.length);
  console.log('New since the last run: ' + changed.filter(function (c) { return c.isNew; }).length);
  console.log('Changed status:        ' + changed.filter(function (c) { return !c.isNew; }).length);
  console.log('Radius:                ' + RADIUS_KM + ' km');
  console.log('Mode:                  ' + (SEND ? 'SENDING FOR REAL' : 'dry run, nothing will be sent'));
  console.log('');

  if (!changed.length) {
    console.log('Nothing new and nothing changed, so there is nobody to email.');
    fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot, null, 2) + '\n');
    return;
  }

  // ---- who is near
  const subs = FIXTURE ? fixtureSubscribers(FIXTURE) : await brevoSubscribers();
  console.log('Subscribers with a country and postcode: ' + subs.length + (FIXTURE ? '  (from ' + FIXTURE + ')' : ''));

  const placed = [];
  const unplaceable = [];
  for (const s of subs) {
    const place = await placeOf(s);
    if (place && place.error) unplaceable.push({ sub: s, why: place.error });
    else placed.push({ sub: s, lat: place.lat, lng: place.lng, label: place.label });
  }
  if (geoCacheDirty) fs.writeFileSync(GEO_FILE, JSON.stringify(geoCache, null, 2) + '\n');
  console.log('Placed on the map: ' + placed.length + ', could not place: ' + unplaceable.length
    + (geocodeCalls ? ', geocoder calls this run: ' + geocodeCalls : ', all from cache'));
  console.log('');

  const alreadySent = readJson(SENT_FILE, {});
  const planned = [];

  changed.forEach(function (c) {
    placed.forEach(function (row) {
      const km = distanceKm(row.lat, row.lng, c.p.lat, c.p.lng);
      if (km > RADIUS_KM) return;
      const stamp = c.p.id + '|' + c.p.status;
      if (alreadySent[row.sub.email] && alreadySent[row.sub.email].indexOf(stamp) !== -1) return;
      planned.push({
        email: row.sub.email, sub: row.sub, project: c.p, isNew: c.isNew, was: c.was,
        km: km, stamp: stamp
      });
    });
  });

  planned.sort(function (a, b) { return a.km - b.km; });
  const capped = LIMIT ? planned.slice(0, LIMIT) : planned;

  // ---- report
  if (!capped.length) {
    console.log('Nobody on the list is within ' + RADIUS_KM + ' km of anything that changed.');
  } else {
    console.log('Would email ' + capped.length + ' message(s) to '
      + new Set(capped.map(function (x) { return x.email; })).size + ' subscriber(s):');
    console.log('');
    capped.forEach(function (x) {
      console.log('  to:      ' + x.email + '  (' + x.sub.postcode + ', ' + x.sub.country + ')');
      console.log('  why:     ' + (x.isNew
        ? 'new project ' + Math.round(x.km) + ' km away'
        : 'status went ' + x.was + ' -> ' + x.project.status + ', ' + Math.round(x.km) + ' km away'));
      console.log('  project: ' + x.project.name + ' (' + (x.project.town || x.project.country) + ')');
      console.log('  subject: ' + subjectFor(x.project, x.isNew));
      console.log('  link:    ' + SITE + x.project.page);
      console.log('');
    });
  }

  if (unplaceable.length) {
    console.log('Could not place ' + unplaceable.length + ' subscriber(s), so they were skipped:');
    unplaceable.slice(0, 15).forEach(function (u) {
      console.log('  ' + u.sub.email + '  ' + u.sub.postcode + ', ' + u.sub.country + '  (' + u.why + ')');
    });
    console.log('');
  }

  if (!SEND) {
    console.log('Dry run. Nothing was sent and the snapshot was left alone, so running this');
    console.log('again shows the same list. Add --send once you are happy with it.');
    return;
  }

  // ---- send
  let sent = 0, failed = 0;
  for (const x of capped) {
    try {
      await sendOne(x.email, subjectFor(x.project, x.isNew), bodyFor(x.project, x.sub, x.isNew, x.km));
      if (!alreadySent[x.email]) alreadySent[x.email] = [];
      alreadySent[x.email].push(x.stamp);
      sent++;
    } catch (e) {
      failed++;
      console.error('  failed: ' + x.email + '  ' + e.message);
    }
    fs.writeFileSync(SENT_FILE, JSON.stringify(alreadySent, null, 2) + '\n');
    await sleep(120);
  }

  // The snapshot only moves forward on a real send, so a failed dry run never
  // silently swallows the changes it was about to tell people about.
  fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot, null, 2) + '\n');
  console.log('');
  console.log('Sent ' + sent + ', failed ' + failed + '. Snapshot updated.');
})().catch(function (err) {
  console.error('notify-subscribers failed:', err);
  process.exit(1);
});
