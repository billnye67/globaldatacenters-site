// Local phone preview with the same address function used by Cloudflare Pages.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || 8788);
const key = /^GEOAPIFY_KEY=(.+)$/m.exec(fs.readFileSync(path.join(root, '.dev.vars'), 'utf8'))?.[1]?.trim();
if (!key) throw Error('GEOAPIFY_KEY is missing from the ignored .dev.vars file');
const source = fs.readFileSync(path.join(root, 'functions/api/geocode.js'), 'utf8');
const geocode = import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')).then(mod => mod.onRequestGet);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.bin': 'application/octet-stream', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/__perf' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) { body += chunk; if (body.length > 8192) { res.writeHead(413).end(); return; } }
      try { console.log('PHONE_PERF', JSON.stringify(JSON.parse(body))); } catch { res.writeHead(400).end(); return; }
      res.writeHead(204).end();
      return;
    }
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    if (url.pathname === '/__perf.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(path.join(__dirname, 'preview-perf.js')).pipe(res);
      return;
    }
    if (url.pathname === '/api/geocode') {
      const handler = await geocode;
      const result = await handler({ request: new Request(url), env: { GEOAPIFY_KEY: key } });
      res.writeHead(result.status, Object.fromEntries(result.headers)).end(await result.text());
      return;
    }
    const segments = decodeURIComponent(url.pathname).split('/').filter(Boolean);
    if (segments.some(segment => segment.startsWith('.') || ['functions', 'tools', 'node_modules', 'risk-sources'].includes(segment))) { res.writeHead(404).end(); return; }
    let file = path.resolve(root, '.' + url.pathname);
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(404).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    else if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': (mime[path.extname(file).toLowerCase()] || 'application/octet-stream') + (['.html', '.js', '.json', '.css', '.xml', '.txt'].includes(path.extname(file).toLowerCase()) ? '; charset=utf-8' : ''), 'Cache-Control': 'no-store' });
    if (url.searchParams.has('perf') && file === path.join(root, 'index.html')) {
      res.end(fs.readFileSync(file, 'utf8').replace('</body>', '<script src="/__perf.js"></script></body>'));
    } else fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(500).end('Preview server error');
  }
}).listen(port, '0.0.0.0', () => console.log(`Risk preview listening on port ${port}`));
