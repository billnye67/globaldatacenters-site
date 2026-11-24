// Cloudflare Pages Function — tells the page which country the visitor is in.
//
// Cloudflare already works this out at the edge and puts it in CF-IPCountry, so there
// is no lookup to do and no third party involved. A static page cannot read a request
// header, which is why this exists: take-action.html asks it on load and decides which
// address fields to show.
//
// "XX" means Cloudflare could not tell (and "T1" means Tor). Both are treated as unknown
// by the caller, which falls back to the United States form, the one most people need.

export async function onRequestGet(context) {
  const { request } = context;
  const raw = (request.headers.get('CF-IPCountry') || '').toUpperCase();
  const known = /^[A-Z]{2}$/.test(raw) && raw !== 'XX' && raw !== 'T1';

  return new Response(JSON.stringify({
    country: known ? raw : null,
    isUS: known ? raw === 'US' : null
  }), {
    headers: {
      'Content-Type': 'application/json',
      // Per visitor, so it must never land in a shared cache.
      'Cache-Control': 'private, no-store'
    }
  });
}
