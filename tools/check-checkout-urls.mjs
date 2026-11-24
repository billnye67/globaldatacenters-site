#!/usr/bin/env node
/* Checks where Stripe sends a customer back to after checkout.
 *
 *   node tools/check-checkout-urls.mjs
 *
 * Both checkout functions hand Stripe a success_url and a cancel_url. Those are fixed strings in
 * the code, not dashboard settings, and they pointed at the old floridadatacenters.org host. This
 * runs both functions for real against a stubbed Stripe SDK, captures the exact options they pass
 * to checkout.sessions.create, and asserts two things about each URL: that it is on
 * globaldatacenters.net, and that its path resolves to a page that exists on this site, the same
 * way tools/check-links.js resolves anything else.
 *
 * The Stripe SDK is replaced through a module resolve hook, so nothing here needs a Stripe key and
 * no network call is made. Everything else in both functions runs as it does in production.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ORIGIN = 'https://globaldatacenters.net';

// ---------------------------------------------------------------- stub the Stripe SDK
globalThis.__stripeCalls = [];
const STUB = 'data:text/javascript,' + encodeURIComponent(`
  export default class Stripe {
    constructor(key) {
      this.key = key;
      this.checkout = { sessions: { create: async (opts) => {
        globalThis.__stripeCalls.push(opts);
        return { id: 'cs_test_stub', url: 'https://checkout.stripe.com/c/pay/cs_test_stub' };
      } } };
    }
  }`);

register('data:text/javascript,' + encodeURIComponent(`
  export function resolve(specifier, context, next) {
    if (specifier === 'stripe') return { url: ${JSON.stringify(STUB)}, format: 'module', shortCircuit: true };
    return next(specifier, context);
  }`), import.meta.url);

// ---------------------------------------------------------------- resolve a path on this site
const files = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.wrangler'].includes(e.name)) continue;
      walk(path.join(dir, e.name));
    } else files.add('/' + path.relative(ROOT, path.join(dir, e.name)).split(path.sep).join('/'));
  }
})(ROOT);

const rules = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n')
  .map(l => l.trim()).filter(l => l && l[0] !== '#')
  .map(l => l.split(/\s+/)).filter(p => p.length >= 2)
  .map(p => ({ from: p[0], to: p[1] }));

const asFile = p => files.has(p) ? p
  : p.endsWith('/') ? (files.has(p + 'index.html') ? p + 'index.html' : null)
  : files.has(p + '.html') ? p + '.html'
  : files.has(p + '/index.html') ? p + '/index.html' : null;

function servedBy(p) {
  const via = [];
  for (let hop = 0; hop < 5; hop++) {
    const f = asFile(p);
    if (f) return { file: f, via };
    const tries = p.endsWith('/') ? [p, p.slice(0, -1)] : [p, p + '/'];
    const r = rules.find(r => tries.includes(r.from));
    if (!r) return { file: null, via };
    via.push(`${r.from} -> ${r.to}`);
    p = r.to.replace(/^https?:\/\/[^/]+/i, '') || '/';
  }
  return { file: null, via };
}

// ---------------------------------------------------------------- fake Cloudflare context
function makeEnv() {
  const kv = new Map();
  return {
    STRIPE_SECRET_KEY: 'sk_test_stub',
    STRIPE_PRICE_ID: 'price_stub',
    REPORTS: {
      put: async (k, v) => { kv.set(k, v); },
      get: async (k) => kv.get(k) ?? null,
    },
  };
}
const post = (url, body) => ({
  request: new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  env: makeEnv(),
});

// ---------------------------------------------------------------- run both functions
const { CATALOG } = await import(pathToFileURL(path.join(ROOT, 'functions/api/merch-catalog.js')));
const firstVariant = Object.keys(CATALOG)[0];

const CASES = [
  {
    name: 'Defense Kit checkout (functions/api/create-checkout.js)',
    mod: 'functions/api/create-checkout.js',
    url: `${ORIGIN}/api/create-checkout`,
    body: {
      email: 'test@example.com', firstName: 'Test', lastInitial: 'B', streetAddress: '1 Main St',
      zipCode: '32064', county: 'Suwannee', topConcerns: ['water'], attendingHearing: 'yes',
    },
    success: '/defense-kit-success', cancel: '/defense-kit',
  },
  {
    name: 'Shop checkout (functions/api/create-merch-checkout.js)',
    mod: 'functions/api/create-merch-checkout.js',
    url: `${ORIGIN}/api/create-merch-checkout`,
    body: { items: [{ variantId: firstVariant, productId: CATALOG[firstVariant].productId, qty: 1 }], shipping: 599, address: null },
    success: '/shop-success', cancel: '/shop',
  },
];

let failed = 0;
const note = (ok, text) => { if (!ok) failed++; console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${text}`); };

for (const c of CASES) {
  console.log('\n' + c.name);
  globalThis.__stripeCalls.length = 0;
  const { onRequestPost } = await import(pathToFileURL(path.join(ROOT, c.mod)));
  const res = await onRequestPost(post(c.url, c.body));
  const out = await res.json();

  note(res.status === 200, `the function returned 200 (got ${res.status})`);
  note(globalThis.__stripeCalls.length === 1, `it created exactly one Stripe session (got ${globalThis.__stripeCalls.length})`);
  if (!globalThis.__stripeCalls.length) continue;
  const opts = globalThis.__stripeCalls[0];
  note(!!out.url, 'it handed the checkout url back to the browser');

  for (const [kind, expectPath] of [['success_url', c.success], ['cancel_url', c.cancel]]) {
    const raw = opts[kind];
    console.log(`\n  ${kind}: ${raw}`);
    const u = new URL(raw.replace('{CHECKOUT_SESSION_ID}', 'cs_test_stub'));
    note(u.origin === ORIGIN, `it is on ${ORIGIN} (got ${u.origin})`);
    note(!/floridadatacenters\.org/i.test(raw), 'no floridadatacenters.org left in it');
    note(u.pathname === expectPath, `the path is ${expectPath} (got ${u.pathname})`);
    const hit = servedBy(u.pathname);
    note(!!hit.file, `that path is served by a real page (${hit.file || 'NOTHING'})`
      + (hit.via.length ? ` via ${hit.via.join(' -> ')}` : ''));
    if (kind === 'success_url') {
      note(u.searchParams.get('session_id') === 'cs_test_stub', 'it carries the Stripe session id');
      note(!!u.searchParams.get('order_id'), 'it carries the order id the webhook needs');
    } else {
      note(u.searchParams.get('cancelled') === 'true', 'it marks the visit as cancelled');
    }
  }
}

console.log(`\n${failed ? failed + ' check(s) FAILED' : 'all checks passed'}`);
process.exit(failed ? 1 : 0);
