// Pulls the approved reports out of the review queue and writes them to
// data/reports-incoming.json, ready for you to merge into the real data.
//
// A Cloudflare Function cannot write into this repo, so the approved pile lives
// in KV and this script fetches it. The admin page has a download button that
// produces the same file if you would rather click than type.
//
//   ADMIN_PASSWORD=yourpassword node data/pull-approved-reports.js
//   ADMIN_PASSWORD=yourpassword node data/pull-approved-reports.js --url http://localhost:8788
//
// It never touches projects.json or the map. It writes one file and stops.

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'reports-incoming.json');

const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const BASE = (urlFlag !== -1 && args[urlFlag + 1]) || 'https://globaldatacenters.net';
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error('Set ADMIN_PASSWORD first. Example:\n  ADMIN_PASSWORD=yourpassword node data/pull-approved-reports.js');
  process.exit(1);
}

async function main() {
  const endpoint = BASE.replace(/\/$/, '') + '/admin/reports';

  // Sign in the same way the browser does and keep the session cookie.
  const login = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'login', password: PASSWORD }).toString(),
    redirect: 'manual'
  });

  const setCookie = login.headers.get('set-cookie');
  if (login.status !== 303 || !setCookie) {
    console.error('Could not sign in (' + login.status + '). Check ADMIN_PASSWORD and the --url.');
    process.exit(1);
  }
  const cookie = setCookie.split(';')[0];

  const res = await fetch(endpoint + '?export=1', { headers: { cookie: cookie } });
  if (!res.ok) {
    console.error('Export failed (' + res.status + ').');
    process.exit(1);
  }

  const reports = await res.json();
  if (!Array.isArray(reports)) {
    console.error('Export did not return a list. Nothing written.');
    process.exit(1);
  }

  // Existing file is kept as .bak so a bad run is never destructive.
  if (fs.existsSync(OUT)) {
    fs.copyFileSync(OUT, OUT + '.bak');
  }

  fs.writeFileSync(OUT, JSON.stringify(reports, null, 2) + '\n');
  console.log('Wrote ' + reports.length + ' approved report(s) to data/reports-incoming.json');
  if (reports.length) {
    console.log('\nMerge them into the map yourself. Nothing is published by this script.');
  }
}

main().catch(function (err) {
  console.error('Pull failed:', err.message);
  process.exit(1);
});
