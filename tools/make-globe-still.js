#!/usr/bin/env node
/* Renders /globe-still.webp and /globe-still-phone.webp: a picture of the homepage globe, fully loaded,
 * frozen at the angle it starts on (globe-init.js's `home`, exposed as window.__home).
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node tools/make-globe-still.js            # serves the repo itself on :8791 and shoots both stills
 *
 * Re-run it whenever the markers, the paper texture or the starting angle change — the still is a snapshot
 * of the live globe, and the handoff is only invisible while the two still agree.
 *
 * How the framing works. The live globe's camera renders a square view (globe-init.js's apply(): aspect 1,
 * fov 45, view offset built from --sphere-d/--sphere-x/--sphere-y), so the sphere is always exactly inscribed
 * in that square. Here we hand the page a square frame with --sphere-x/y at 0 and --sphere-d at the capture
 * size, which makes apply() centre the sphere in the shot, edge to edge. The page then shows the file back
 * in that same CSS square, and the two circles coincide at any screen size.
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8791;
const SHOTS = [
  { out: 'globe-still.webp',       vw: 1400, vh: 900, mobile: false, px: 1600, quality: 88 },
  { out: 'globe-still-phone.webp', vw: 390,  vh: 844, mobile: true,  px: 1400, quality: 88 },
];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function serve() {
  return new Promise(res => {
    const s = http.createServer((req, rsp) => {
      let p = decodeURIComponent(url.parse(req.url).pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(PORT, () => res(s));
  });
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });

  for (const shot of SHOTS) {
    const N = shot.px / 2;                                   // CSS px; deviceScaleFactor 2 doubles it
    const ctx = await browser.newContext({ viewport: { width: shot.vw, height: shot.vh }, deviceScaleFactor: 2,
      isMobile: shot.mobile, hasTouch: shot.mobile });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });

    // wait for the real thing: textured globe AND the markers that the two JSON fetches bring in
    await page.waitForFunction(() => window.__heroGlobe && window.__locations && window.__locations.length > 0,
      null, { timeout: 45000 });
    await page.waitForTimeout(1500);

    const dataUrl = await page.evaluate(async ({ N, quality }) => {
      const hero = document.getElementById('hero-sec');
      const frame = document.getElementById('globe-frame');
      const globe = window.__heroGlobe;

      // strip the page down to the globe on a transparent background
      const s = document.createElement('style');
      s.textContent = `.hero::after,.hero::before{display:none!important}
        .masthead,.lead,.stats,.map-meta,.map-tools,.report-note,.preview-note,.globe-back,.globe-tap,
        .space-bg,#point-card,#interaction-hint,#fallback,#globe-poster,main>section:not(#hero-sec),footer{display:none!important}
        html,body,.hero,.globe-stage,.globe-frame{background:transparent!important}`;
      document.head.appendChild(s);

      // a square frame with a square sphere box => apply() centres the sphere and fills the shot
      hero.style.cssText += `;height:${N}px;min-height:0;overflow:visible;--sphere-d:${N}px;--sphere-x:0px;--sphere-y:0px`;
      frame.style.cssText += `;width:${N}px;height:${N}px`;
      globe.width(N).height(N);
      if (window.__voInvalidate) window.__voInvalidate();

      // freeze on the exact starting angle. Damping off and the angle re-asserted after the resize has
      // settled, so no residual easing is still bleeding into the camera when the frame is read back.
      globe.controls().autoRotate = false;
      globe.controls().enableDamping = false;
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      globe.pointOfView(window.__home, 0);
      globe.controls().update();

      // read the GL canvas back through a 2D canvas so it can be encoded as WebP with its alpha
      const gl = globe.renderer();
      // The page's own resize handling can put the canvas back to the window size on desktop; force the square.
      globe.width(N).height(N); gl.setSize(N, N);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      globe.pointOfView(window.__home, 0); globe.controls().update();
      gl.render(globe.scene(), globe.camera());              // fresh frame, this tick, buffer still intact
      const src = gl.domElement;
      const c = document.createElement('canvas');
      c.width = src.width; c.height = src.height;
      c.getContext('2d').drawImage(src, 0, 0);
      return c.toDataURL('image/webp', quality / 100);
    }, { N, quality: shot.quality });

    const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
    fs.writeFileSync(path.join(ROOT, shot.out), buf);
    const pov = await page.evaluate(() => window.__pov());
    console.log(`${shot.out}  ${shot.px}x${shot.px}  ${(buf.length / 1024).toFixed(1)} KB  ` +
      `lat ${pov.lat} lng ${pov.lng.toFixed(4)} alt ${pov.altitude}`);
    await ctx.close();
  }

  await browser.close();
  server.close();
})();
