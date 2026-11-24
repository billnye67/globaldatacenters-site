#!/usr/bin/env node
/* Serves the built site so pages can be opened in a browser before they are deployed.
 *   node tools/serve.js [port]
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const zlib = require('zlib');
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2] || 8080);
const varsPath = path.join(ROOT, '.dev.vars');
const key = fs.existsSync(varsPath) ? /^GEOAPIFY_KEY=(.+)$/m.exec(fs.readFileSync(varsPath, 'utf8'))?.[1]?.trim() : '';
const geocode = import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(ROOT, 'functions/api/geocode.js'), 'utf8')).toString('base64')).then(mod => mod.onRequestGet);
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.xml':'application/xml' };
http.createServer(async (req, rsp) => {
  let p = decodeURIComponent(url.parse(req.url).pathname);
  if (p === '/api/geocode') {
    try {
      const handler = await geocode;
      const result = await handler({ request: new Request(new URL(req.url, 'http://localhost:' + PORT)), env: { GEOAPIFY_KEY: key } });
      rsp.writeHead(result.status, Object.fromEntries(result.headers));
      return rsp.end(await result.text());
    } catch {
      rsp.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return rsp.end(JSON.stringify({ error: 'Address search is temporarily unavailable. Please try again.' }));
    }
  }
  if (p.split('/').some(segment => segment.startsWith('.') || ['functions', 'node_modules'].includes(segment))) {
    rsp.writeHead(404); return rsp.end();
  }
  if (p.endsWith('/')) p += 'index.html';
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    rsp.writeHead(404, { 'Content-Type': 'text/html' });
    return rsp.end(fs.existsSync(path.join(ROOT, '404.html')) ? fs.readFileSync(path.join(ROOT, '404.html')) : 'not found');
  }
  /* Compress the text files. Cloudflare does this for the real site, so without it here a phone
     on the LAN downloads 3MB where production sends well under a third of that - which makes
     this server feel far slower than the deployed site and sends you chasing the wrong problem.
     Images and webp are already compressed; running them through gzip only burns CPU. */
  const ext = path.extname(f).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  /* Never cache anything here. This is the preview server - a phone holding on to an old
     index.html means looking at yesterday's layout and reporting it as unchanged, which is
     exactly what happened. Safari in particular will reuse a cached page across reloads. */
  rsp.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  rsp.setHeader('Pragma', 'no-cache');
  rsp.setHeader('Expires', '0');
  const worthIt = /^(text\/|application\/(json|xml|javascript)|image\/svg)/.test(type);
  const accepts = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  if (worthIt && accepts) {
    rsp.writeHead(200, { 'Content-Type': type, 'Content-Encoding': 'gzip', 'Vary': 'Accept-Encoding' });
    return fs.createReadStream(f).pipe(zlib.createGzip({ level: 6 })).pipe(rsp);
  }
  rsp.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(f).pipe(rsp);
}).listen(PORT, () => console.log('serving ' + ROOT + ' on http://localhost:' + PORT));
