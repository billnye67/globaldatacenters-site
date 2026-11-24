// Cloudflare Pages Function — "Alert me when a data center is proposed near me".
//
// Same Brevo setup as functions/api/contact.js: the same API key, the same list.
// The difference is what we store alongside the address, so a later run can work out
// who is near a new project:
//
//   COUNTRY   the country they picked
//   POSTCODE  zip or postcode only
//   SOURCE    which form they came from
//
// We deliberately never ask for a street address, and never store one. A postcode is
// enough to place someone within a few kilometres, which is all the 50 km test needs.
//
// GET with ?u=<email>&t=<token> unsubscribes. The token is an HMAC so the link cannot
// be guessed or used to unsubscribe somebody else.

const RATE_LIMIT = 8;
const RATE_WINDOW = 60 * 60;

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max || 200);
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('').slice(0, 32);
}

function secretFor(env) {
  // A dedicated secret if there is one, otherwise the Brevo key, which is already
  // a server side secret and is always present wherever this runs.
  return env.ALERTS_SECRET || env.BREVO_API_KEY || '';
}

async function hashIp(ip) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('gdc-alerts|' + ip));
  return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('').slice(0, 16);
}

// ---------------------------------------------------------------- subscribe

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    let data;
    const contentType = request.headers.get('content-type') || '';
    const wantsJson = contentType.includes('application/json')
      || (request.headers.get('accept') || '').includes('application/json');

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      data = Object.fromEntries((await request.formData()).entries());
    }

    // Honeypot, same idea as the report form.
    if (clean(data.website)) {
      return wantsJson ? jsonResponse({ success: true })
        : Response.redirect(new URL('/?subscribed=true', request.url).toString(), 302);
    }

    const email = clean(data.email, 254).toLowerCase();
    const country = clean(data.country, 120);
    const postcode = clean(data.postcode, 20).toUpperCase();
    const source = clean(data.source, 60) || 'alerts';

    if (!email || !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
      return jsonResponse({ error: 'Please check that email address.' }, 400);
    }
    if (!country) {
      return jsonResponse({ error: 'Please pick your country.' }, 400);
    }
    // The waitlist on a project page only needs an address, so a postcode is optional
    // there. Anywhere that is asking "near me" it has to be present.
    if (source !== 'letter-waitlist' && !postcode) {
      return jsonResponse({ error: 'Please add your zip or postcode.' }, 400);
    }
    if (postcode && !/^[A-Z0-9][A-Z0-9 -]{1,11}$/.test(postcode)) {
      return jsonResponse({ error: 'That does not look like a zip or postcode.' }, 400);
    }

    // Rate limit per address, reusing the KV the rest of the site already binds.
    if (env.REPORTS) {
      const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') || 'unknown');
      const key = 'rl:alerts:' + ipHash;
      const seen = parseInt(await env.REPORTS.get(key), 10) || 0;
      if (seen >= RATE_LIMIT) {
        return jsonResponse({ error: 'Too many sign ups from here just now. Try again in an hour.' }, 429);
      }
      await env.REPORTS.put(key, String(seen + 1), { expirationTtl: RATE_WINDOW });
    }

    if (!env.BREVO_API_KEY) {
      console.error('Alerts: BREVO_API_KEY is not set');
      return jsonResponse({ error: 'Sign ups are not switched on yet.' }, 503);
    }

    const listId = parseInt(env.BREVO_LIST_ID, 10) || 3;
    const attributes = {
      COUNTRY: country,
      POSTCODE: postcode || '',
      SOURCE: source
    };

    const headers = {
      'accept': 'application/json',
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json'
    };

    const created = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        email: email,
        listIds: [listId],
        updateEnabled: true,
        attributes: attributes
      })
    });

    if (!created.ok) {
      const text = await created.text();
      // An existing contact is the normal case for someone signing up again from a
      // different page. Update what they told us and make sure they are on the list.
      if (text.indexOf('Contact already exist') >= 0) {
        await fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(email), {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({ attributes: attributes, listIds: [listId] })
        });
      } else {
        console.error('Brevo alerts error:', text);
        return jsonResponse({ error: 'We could not save that. Please try again.' }, 502);
      }
    }

    if (!wantsJson) {
      return Response.redirect(new URL('/?subscribed=true', request.url).toString(), 302);
    }
    return jsonResponse({ success: true });

  } catch (err) {
    console.error('Alerts signup error:', err);
    return jsonResponse({ error: 'Something went wrong on our end.' }, 500);
  }
}

// ---------------------------------------------------------------- unsubscribe

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = clean(url.searchParams.get('u'), 254).toLowerCase();
  const token = clean(url.searchParams.get('t'), 64);

  const html = function (heading, line, status) {
    return new Response(
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1">'
      + '<meta name="robots" content="noindex"><title>' + heading + '</title>'
      + '<style>body{margin:0;background:#f7f4ec;color:#1a1915;font:16px/1.6 system-ui,Arial,sans-serif;'
      + 'display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}'
      + 'div{max-width:440px}h1{font:600 26px/1.2 Georgia,serif;margin:0 0 10px}'
      + 'p{color:#666458;margin:0 0 18px}a{color:#a0231d}</style></head><body><div>'
      + '<h1>' + heading + '</h1><p>' + line + '</p>'
      + '<p><a href="/">Back to the map</a></p></div></body></html>',
      { status: status || 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
    );
  };

  if (!email || !token) {
    return html('Link not complete', 'That unsubscribe link is missing part of itself. Reply to any alert and we will take you off by hand.', 400);
  }

  const expected = await hmac(email, secretFor(env));
  if (token !== expected) {
    return html('Link not recognised', 'That unsubscribe link does not match. Reply to any alert and we will take you off by hand.', 400);
  }

  if (env.BREVO_API_KEY) {
    try {
      await fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(email), {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'api-key': env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ emailBlacklisted: true })
      });
    } catch (err) {
      console.error('Alerts unsubscribe error:', err);
    }
  }

  return html('You are unsubscribed', 'We will not email you about data centers near ' + 'you again. Nothing else changes, and you can sign up again any time.');
}
