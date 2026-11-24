// Search address candidates without exposing the provider key to the browser.
export async function onRequestGet({ request, env }) {
  const query = new URL(request.url).searchParams.get('q')?.trim() || '';
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, max-age=3600' };
  if (query.length < 3 || query.length > 240) {
    return new Response(JSON.stringify({ error: 'Enter an address or place name.' }), { status: 400, headers });
  }
  if (!env.GEOAPIFY_KEY) {
    return new Response(JSON.stringify({ error: 'Address search is not configured.' }), {
      status: 503, headers: { ...headers, 'Cache-Control': 'no-store' }
    });
  }
  const url = new URL('https://api.geoapify.com/v1/geocode/search');
  url.searchParams.set('text', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '5');
  url.searchParams.set('apiKey', env.GEOAPIFY_KEY);
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('geocoder unavailable');
    const data = await response.json();
    const matches = (data.results || []).filter(item => Number.isFinite(+item.lat) && Number.isFinite(+item.lon)).map(item => ({
      lat: +item.lat, lng: +item.lon, label: item.formatted || '',
      house: item.housenumber || '', street: item.street || '',
      city: item.city || item.town || item.village || '', county: item.county || '',
      state: item.state || '', country: item.country || '', cc: String(item.country_code || '').toUpperCase(),
      type: item.result_type || '', confidence: Number(item.rank?.confidence) || 0,
      buildingConfidence: Number(item.rank?.confidence_building_level) || 0,
      matchType: item.rank?.match_type || ''
    }));
    return new Response(JSON.stringify({ matches }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Address search is temporarily unavailable.' }), {
      status: 502, headers: { ...headers, 'Cache-Control': 'no-store' }
    });
  }
}
