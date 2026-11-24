#!/usr/bin/env node
/* Checks the one thing in functions/_middleware.js that payments depend on.
 *
 *   node tools/check-old-host-api.mjs
 *
 * The old Florida hostnames forward every path to globaldatacenters.net with a 301. Stripe
 * posts orders to floridadatacenters.org/api/stripe-webhook and does not follow redirects, so
 * a 301 on that path is a delivery failure and the order is never processed. This calls
 * onRequest directly with a request for each case and asserts what comes back: endpoints on the
 * old host are served, pages on the old host are still forwarded.
 */
import { onRequest } from '../functions/_middleware.js';

const SERVED = Symbol('served by the site');

function ctx(method, urlStr) {
  return {
    request: new Request(urlStr, { method, ...(method === 'POST' ? { body: '{}' } : {}) }),
    next: async () => new Response('served', { status: 200, headers: { 'content-type': 'application/json' } }),
  };
}

const CASES = [
  // what Stripe does on launch day
  ['POST', 'https://floridadatacenters.org/api/stripe-webhook', SERVED],
  ['POST', 'https://www.floridadatacenters.org/api/stripe-webhook', SERVED],
  ['POST', 'https://FloridaDataCenters.org/API/stripe-webhook', SERVED],
  ['POST', 'https://globaldatacenters.net/api/stripe-webhook', SERVED],
  // every other endpoint on the old host, for the same reason
  ['POST', 'https://floridadatacenters.org/api/create-checkout', SERVED],
  ['GET', 'https://floridadatacenters.org/api/letter-count', SERVED],
  // ordinary old pages must still be forwarded
  ['GET', 'https://floridadatacenters.org/palm-beach-county', 'https://globaldatacenters.net/palm-beach-county'],
  ['GET', 'https://floridadatacenters.org/take-action.html?site=ft-1', 'https://globaldatacenters.net/take-action.html?site=ft-1'],
  ['GET', 'https://www.floridadatacenters.org/wins.html', 'https://globaldatacenters.net/wins.html'],
  ['GET', 'https://floridadatacenters.org/', 'https://globaldatacenters.net/data-centers/united-states/florida/'],
  // a page whose name merely starts with "api" is a page, not an endpoint
  ['GET', 'https://floridadatacenters.org/api-guide', 'https://globaldatacenters.net/api-guide'],
  // the archive is withdrawn from both hosts
  ['GET', 'https://globaldatacenters.net/archive/legacy-florida/counties/duval.html',
   'https://globaldatacenters.net/data-centers/united-states/florida/'],
];

let failed = 0;
for (const [method, urlStr, want] of CASES) {
  const res = await onRequest(ctx(method, urlStr));
  const got = res.status === 301 || res.status === 302 ? res.headers.get('location') : SERVED;
  const ok = got === want;
  if (!ok) failed++;
  const shown = got === SERVED ? 'served (no redirect)' : `${res.status} -> ${got}`;
  const expected = want === SERVED ? 'served (no redirect)' : `301 -> ${want}`;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${method.padEnd(4)} ${urlStr}`);
  console.log(`        got      ${shown}`);
  if (!ok) console.log(`        expected ${expected}`);
}

console.log(`\n${CASES.length - failed}/${CASES.length} passed`);
process.exit(failed ? 1 : 0);
