// Cloudflare Pages Function — /admin/reports
//
// The review queue for resident submissions from /report. Nothing a visitor
// sends reaches the map on its own. It sits here until it is approved by hand.
//
// This is a Function rather than a static page on purpose: a file at
// admin/reports.html would be served to anyone who guessed the URL. Here the
// password is checked on the server before any report is rendered.
//
// Password lives in the ADMIN_PASSWORD environment variable. With it unset the
// page refuses to load at all, so it can never be accidentally left open.
//
// Sessions are a cookie holding an expiry plus an HMAC of that expiry, keyed by
// the password. No session store to keep, and changing the password logs
// everyone out.

const SESSION_HOURS = 12;
const COOKIE = 'gdc_admin';

const ok = function (body, init) {
  return new Response(body, Object.assign({
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  }, init || {}));
};

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map(function (b) { return b.toString(16).padStart(2, '0'); })
    .join('');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return bytesToHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

// Comparison that does not leak how much of the string matched.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const hit = header.split(';').map(function (c) { return c.trim(); })
    .find(function (c) { return c.indexOf(name + '=') === 0; });
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
}

async function isSignedIn(request, password) {
  const raw = readCookie(request, COOKIE);
  if (!raw || raw.indexOf('.') === -1) return false;
  const parts = raw.split('.');
  const expires = parts[0];
  const mac = parts[1];
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return safeEqual(mac, await sign(expires, password));
}

async function sessionCookie(password) {
  const expires = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  const value = expires + '.' + await sign(expires, password);
  return COOKIE + '=' + encodeURIComponent(value)
    + '; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=' + (SESSION_HOURS * 3600);
}

function esc(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Every report shown here was typed by a stranger. It is escaped on the way in
// to the page, and any link they sent is rendered only when it is http(s).
function safeLink(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url) ? url : '';
}

async function loadAll(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.REPORTS.list({ prefix: 'sighting:', cursor: cursor });
    for (const key of page.keys) {
      const raw = await env.REPORTS.get(key.name);
      if (!raw) continue;
      try { out.push(JSON.parse(raw)); } catch (e) { /* skip anything unreadable */ }
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);

  return out.sort(function (a, b) {
    return String(b.submittedAt || '').localeCompare(String(a.submittedAt || ''));
  });
}

// What a merge actually needs. Internal fields (the IP hash, the user agent)
// stay out of the file.
function forExport(r) {
  return {
    id: r.id,
    what: r.what,
    where: r.where,
    country: r.country,
    link: r.link || null,
    contactEmail: r.email || null,
    heard: r.heard || null,
    hasPhoto: !!r.photo,
    photoPath: r.photo ? '/admin/reports?photo=' + r.id : null,
    submittedAt: r.submittedAt,
    approvedAt: r.approvedAt || null
  };
}

const STYLE = `
:root{--paper:#f7f4ec;--ink:#1a1915;--red:#a0231d;--rule:#c9c3b3;--muted:#666458;--green:#294e36}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 'Work Sans',system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:18px clamp(16px,4vw,40px);border-bottom:3px double var(--ink);background:var(--paper);position:sticky;top:0;z-index:5}
.bar h1{margin:0;font:600 22px/1 Georgia,serif;letter-spacing:-.5px}
.bar .tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.wrap{max-width:900px;margin:0 auto;padding:clamp(20px,4vw,34px) clamp(16px,4vw,40px) 80px}
.counts{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 22px;font-size:13px;color:var(--muted)}
.counts b{color:var(--ink)}
.card{border:1px solid var(--rule);background:#fffdf8;padding:18px;margin:0 0 16px}
.card.approved{border-left:4px solid var(--green)}
.card.pending{border-left:4px solid var(--red)}
.card h2{margin:0 0 4px;font:600 17px/1.3 Georgia,serif}
.meta{font-size:12.5px;color:var(--muted);margin:0 0 12px}
.what{white-space:pre-wrap;margin:0 0 12px;padding:12px;background:#f2eee3;border:1px solid #e3ddcd;overflow-wrap:anywhere}
.row{font-size:13.5px;margin:0 0 5px;overflow-wrap:anywhere}
.row span{color:var(--muted);display:inline-block;min-width:86px}
.tag{display:inline-block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;font-weight:600}
.tag.pending{background:var(--red);color:var(--paper)}
.tag.approved{background:var(--green);color:var(--paper)}
.shot{max-width:100%;max-height:340px;border:1px solid var(--rule);margin:10px 0 0;display:block}
form.inline{display:inline}
button,.btn{font:500 13px/1 'Work Sans',system-ui,Arial,sans-serif;padding:10px 15px;border:1px solid var(--ink);background:var(--paper);color:var(--ink);cursor:pointer;text-decoration:none;display:inline-block}
button:hover,.btn:hover{background:var(--ink);color:var(--paper)}
button.go{background:var(--green);border-color:var(--green);color:#fff}
button.go:hover{background:#1d3826}
button.del{background:transparent;border-color:var(--red);color:var(--red)}
button.del:hover{background:var(--red);color:#fff}
.actions{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.login{max-width:380px;margin:14vh auto;padding:0 20px}
.login h1{font:600 26px/1.2 Georgia,serif;margin:0 0 8px}
.login p{color:var(--muted);font-size:14px;margin:0 0 20px}
.login input{width:100%;padding:13px;border:1px solid var(--ink);background:#fffdf8;font-size:16px;margin:0 0 12px}
.login button{width:100%;padding:14px;background:var(--red);border-color:var(--red);color:#fff;font-size:15px}
.login button:hover{background:#801c17;color:#fff}
.err{color:var(--red);font-size:13.5px;margin:0 0 12px}
.empty{color:var(--muted);padding:40px 0;text-align:center}
.note{font-size:13px;color:var(--muted);border-top:1px solid var(--rule);margin-top:30px;padding-top:16px}
@media(max-width:600px){.bar{padding:14px 16px}.bar h1{font-size:19px}.card{padding:14px}.row span{display:block;min-width:0}}
`;

function page(title, inner) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<meta name="robots" content="noindex, nofollow">'
    + '<title>' + esc(title) + '</title><style>' + STYLE + '</style></head><body>'
    + inner + '</body></html>';
}

function loginPage(message) {
  return page('Sign in · Reports', '<div class="login">'
    + '<h1>Report queue</h1>'
    + '<p>Submissions from the public report form. Sign in to review them.</p>'
    + (message ? '<p class="err">' + esc(message) + '</p>' : '')
    + '<form method="post">'
    + '<input type="hidden" name="action" value="login">'
    + '<input type="password" name="password" placeholder="Password" autocomplete="current-password" required autofocus aria-label="Admin password">'
    + '<button type="submit">Sign in</button>'
    + '</form></div>');
}

function reportCard(r) {
  const approved = r.status === 'approved';
  const link = safeLink(r.link);

  return '<article class="card ' + (approved ? 'approved' : 'pending') + '">'
    + '<span class="tag ' + (approved ? 'approved' : 'pending') + '">' + (approved ? 'Approved' : 'Pending') + '</span>'
    + '<h2>' + esc(r.where || 'Location not given') + (r.country ? ', ' + esc(r.country) : '') + '</h2>'
    + '<p class="meta">Sent ' + esc((r.submittedAt || '').replace('T', ' ').slice(0, 16)) + ' UTC'
    + (approved && r.approvedAt ? ' · approved ' + esc(r.approvedAt.replace('T', ' ').slice(0, 16)) + ' UTC' : '')
    + '</p>'
    + '<div class="what">' + esc(r.what) + '</div>'
    + (link
        ? '<p class="row"><span>Link</span><a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(link) + '</a></p>'
        : '')
    + (r.email ? '<p class="row"><span>Email</span><a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a></p>' : '')
    + (r.heard ? '<p class="row"><span>Heard via</span>' + esc(r.heard) + '</p>' : '')
    + (r.photo ? '<img class="shot" src="/admin/reports?photo=' + esc(r.id) + '" alt="Photo sent with this report">' : '')
    + '<div class="actions">'
    + (approved
        ? '<form class="inline" method="post"><input type="hidden" name="action" value="unapprove"><input type="hidden" name="id" value="' + esc(r.id) + '"><button type="submit">Move back to pending</button></form>'
        : '<form class="inline" method="post"><input type="hidden" name="action" value="approve"><input type="hidden" name="id" value="' + esc(r.id) + '"><button class="go" type="submit">Approve</button></form>')
    + '<form class="inline" method="post" onsubmit="return confirm(\'Delete this report for good?\')">'
    + '<input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="' + esc(r.id) + '">'
    + '<button class="del" type="submit">Delete</button></form>'
    + '</div></article>';
}

function dashboard(reports, flash) {
  const pending = reports.filter(function (r) { return r.status !== 'approved'; });
  const approved = reports.filter(function (r) { return r.status === 'approved'; });

  return page('Report queue', ''
    + '<div class="bar"><h1>Report queue</h1><div class="tools">'
    + '<a class="btn" href="/admin/reports?export=1">Download reports-incoming.json</a>'
    + '<form class="inline" method="post"><input type="hidden" name="action" value="logout"><button type="submit">Sign out</button></form>'
    + '</div></div>'
    + '<div class="wrap">'
    + (flash ? '<p class="err">' + esc(flash) + '</p>' : '')
    + '<p class="counts"><b>' + pending.length + '</b> waiting on you · <b>' + approved.length + '</b> approved</p>'
    + (reports.length === 0 ? '<p class="empty">No reports yet.</p>' : '')
    + (pending.length ? pending.map(reportCard).join('') : '')
    + (approved.length ? '<p class="counts" style="margin-top:34px"><b>Approved</b></p>' + approved.map(reportCard).join('') : '')
    + '<p class="note">Approving a report only marks it here. Nothing goes on the map until you '
    + 'download <b>reports-incoming.json</b>, drop it in <b>data/</b>, and merge it yourself.</p>'
    + '</div>');
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const password = env.ADMIN_PASSWORD;

  // No password configured means no admin page. Better to be shut than open.
  if (!password) {
    return ok(page('Not configured',
      '<div class="login"><h1>Not set up yet</h1><p>Set the <b>ADMIN_PASSWORD</b> environment '
      + 'variable in the Cloudflare Pages project settings, then reload this page.</p></div>'
    ), { status: 503 });
  }

  let signedIn = await isSignedIn(request, password);

  // ---- actions ----------------------------------------------------------
  if (request.method === 'POST') {
    const form = await request.formData();
    const action = String(form.get('action') || '');

    if (action === 'login') {
      if (safeEqual(String(form.get('password') || ''), password)) {
        return new Response(null, {
          status: 303,
          headers: { 'Location': '/admin/reports', 'Set-Cookie': await sessionCookie(password) }
        });
      }
      // A wrong password costs a second, which makes guessing slow.
      await new Promise(function (r) { setTimeout(r, 1000); });
      return ok(loginPage('That password did not work.'), { status: 401 });
    }

    if (!signedIn) return ok(loginPage('Please sign in again.'), { status: 401 });

    if (action === 'logout') {
      return new Response(null, {
        status: 303,
        headers: {
          'Location': '/admin/reports',
          'Set-Cookie': COOKIE + '=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
        }
      });
    }

    const id = String(form.get('id') || '');
    if (!/^[a-f0-9-]{36}$/i.test(id)) {
      return new Response(null, { status: 303, headers: { 'Location': '/admin/reports' } });
    }

    const raw = await env.REPORTS.get('sighting:' + id);
    if (raw) {
      if (action === 'delete') {
        await env.REPORTS.delete('sighting:' + id);
        await env.REPORTS.delete('sighting-photo:' + id);
      } else if (action === 'approve' || action === 'unapprove') {
        const record = JSON.parse(raw);
        record.status = action === 'approve' ? 'approved' : 'pending';
        record.approvedAt = action === 'approve' ? new Date().toISOString() : null;
        await env.REPORTS.put('sighting:' + id, JSON.stringify(record));
      }
    }

    return new Response(null, { status: 303, headers: { 'Location': '/admin/reports' } });
  }

  // ---- everything below needs a session ---------------------------------
  if (!signedIn) return ok(loginPage(''), { status: 401 });

  // Photo pulled straight from KV so it is never public.
  const photoId = url.searchParams.get('photo');
  if (photoId) {
    if (!/^[a-f0-9-]{36}$/i.test(photoId)) return new Response('Not found', { status: 404 });
    const stored = await env.REPORTS.getWithMetadata('sighting-photo:' + photoId, { type: 'arrayBuffer' });
    if (!stored || !stored.value) return new Response('Not found', { status: 404 });
    return new Response(stored.value, {
      headers: {
        'Content-Type': (stored.metadata && stored.metadata.type) || 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'Content-Security-Policy': "default-src 'none'; img-src 'self'"
      }
    });
  }

  const reports = await loadAll(env);

  // The approved pile, shaped as the file to merge.
  if (url.searchParams.get('export')) {
    const approved = reports.filter(function (r) { return r.status === 'approved'; }).map(forExport);
    return new Response(JSON.stringify(approved, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="reports-incoming.json"',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }

  return ok(dashboard(reports, ''));
}
