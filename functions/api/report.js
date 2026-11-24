// Cloudflare Pages Function — "Report a data center" intake.
//
// Submissions are NOT published. Every one lands in the KV queue as status
// "pending" and stays there until it is approved by hand at /admin/reports.
// Nothing here ever touches the map data.
//
// Storage uses the existing REPORTS KV binding, same as the rest of the site:
//   sighting:<id>        the submission itself (JSON)
//   sighting-photo:<id>  the uploaded photo bytes, when there is one
//   rl:report:<iphash>   rate limit counter, expires on its own
//
// Spam protection is a hidden honeypot field plus a per-IP rate limit. No captcha.

const RATE_LIMIT = 5;                        // submissions per IP
const RATE_WINDOW = 60 * 60;                 // per hour
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;     // 5 MB
const MAX_FIELD = 4000;

// Raw IPs are never stored. The site promises it does not keep addresses, so the
// rate limiter and the audit trail both work off a short salted hash instead.
async function hashIp(ip) {
  const bytes = new TextEncoder().encode('gdc-report|' + ip);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map(function (b) { return b.toString(16).padStart(2, '0'); })
    .join('')
    .slice(0, 16);
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  // Drop control characters, normalise newlines, cap the length.
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, max || MAX_FIELD);
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    let data = {};
    let photo = null;
    const contentType = request.headers.get('content-type') || '';
    const wantsJson = contentType.includes('application/json')
      || (request.headers.get('accept') || '').includes('application/json');

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      const file = formData.get('photo');
      if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
        photo = file;
      }
      formData.delete('photo');
      data = Object.fromEntries(formData.entries());
    }

    // ---- honeypot -------------------------------------------------------
    // A real person never sees this field, so anything in it is a bot. Answer
    // with a normal looking success and store nothing.
    if (clean(data.website, 200) || clean(data.company_url, 200)) {
      return wantsJson
        ? jsonResponse({ success: true })
        : Response.redirect(new URL('/report?sent=1', request.url).toString(), 302);
    }

    const what = clean(data.what, MAX_FIELD);
    const where = clean(data.where, 500);
    const country = clean(data.country, 120);
    const link = clean(data.link, 1000);
    const email = clean(data.email, 254);
    const heard = clean(data.heard, 120);

    if (what.length < 10) {
      return jsonResponse({ error: 'Please tell us a little more about what you saw.' }, 400);
    }
    if (where.length < 2) {
      return jsonResponse({ error: 'Please tell us where it is, even just the town.' }, 400);
    }
    if (!country) {
      return jsonResponse({ error: 'Please tell us which country it is in.' }, 400);
    }
    if (email && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
      return jsonResponse({ error: 'That email address does not look right.' }, 400);
    }
    if (link && !/^https?:\/\/\S+$/i.test(link)) {
      return jsonResponse({ error: 'Please paste a link that starts with http:// or https://' }, 400);
    }

    // ---- rate limit -----------------------------------------------------
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = await hashIp(ip);
    const rateKey = 'rl:report:' + ipHash;
    const seen = parseInt(await env.REPORTS.get(rateKey), 10) || 0;

    if (seen >= RATE_LIMIT) {
      return jsonResponse({
        error: 'That is a lot of reports from one place in a short time. Please try again in an hour, or email james@floridadatacenters.org.'
      }, 429);
    }
    // The window starts at the first submission and is not extended by later
    // ones, so a steady trickle cannot keep the counter alive forever.
    await env.REPORTS.put(rateKey, String(seen + 1), { expirationTtl: RATE_WINDOW });

    // ---- photo ----------------------------------------------------------
    const id = crypto.randomUUID();
    let photoMeta = null;

    if (photo) {
      if (!/^image\//i.test(photo.type || '')) {
        return jsonResponse({ error: 'That file does not look like a photo. Please upload an image.' }, 400);
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return jsonResponse({ error: 'That photo is larger than 5 MB. Please send a smaller one.' }, 400);
      }
      await env.REPORTS.put('sighting-photo:' + id, await photo.arrayBuffer(), {
        metadata: { type: photo.type, name: clean(photo.name, 200) }
      });
      photoMeta = {
        type: photo.type,
        name: clean(photo.name, 200),
        size: photo.size
      };
    }

    // ---- store ----------------------------------------------------------
    const record = {
      id: id,
      status: 'pending',
      what: what,
      where: where,
      country: country,
      link: link || null,
      email: email || null,
      heard: heard || null,
      photo: photoMeta,
      submittedAt: new Date().toISOString(),
      submitterHash: ipHash,
      userAgent: clean(request.headers.get('user-agent'), 300) || null
    };

    await env.REPORTS.put('sighting:' + id, JSON.stringify(record));

    // ---- notify ---------------------------------------------------------
    // Same Brevo path the contact form uses. A failure here must never cost us
    // the report, which is already saved, so it is caught and logged only.
    if (env.BREVO_API_KEY && env.CONTACT_TO_EMAIL) {
      try {
        const body = 'New data center report from the website.\n\n'
          + 'What they saw:\n' + what + '\n\n'
          + 'Where: ' + where + '\n'
          + 'Country: ' + country + '\n'
          + 'Link: ' + (link || '(none)') + '\n'
          + 'Photo: ' + (photoMeta ? photoMeta.name + ' (' + Math.round(photoMeta.size / 1024) + ' KB)' : '(none)') + '\n'
          + 'Their email: ' + (email || '(not given)') + '\n'
          + 'Heard about us: ' + (heard || '(not given)') + '\n\n'
          + 'Nothing is on the map yet. Review it at /admin/reports\n\n'
          + '---\nSubmitted: ' + record.submittedAt;

        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'Global Data Centers Reports', email: env.BREVO_FROM || 'tips@floridadatacenters.org' },
            to: [{ email: env.CONTACT_TO_EMAIL }],
            replyTo: email ? { email: email } : undefined,
            subject: '[Report] ' + where + (country ? ', ' + country : ''),
            textContent: body
          })
        });
      } catch (mailErr) {
        console.error('Report notify error:', mailErr);
      }
    }

    if (!wantsJson) {
      return Response.redirect(new URL('/report?sent=1', request.url).toString(), 302);
    }
    return jsonResponse({ success: true, id: id });

  } catch (err) {
    console.error('Report form error:', err);
    return jsonResponse({ error: 'Something went wrong on our end. Please try again.' }, 500);
  }
}
