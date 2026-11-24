// Cloudflare Pages middleware — injects the Meta Pixel base code into every
// HTML page served by the site. API endpoints (functions/api/*) return JSON
// and are skipped because we only rewrite responses whose content-type is HTML.

const PIXEL_ID = '1506139960608049';

const PIXEL_SNIPPET = `
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
`;

// floridadatacenters.org has moved to globaldatacenters.net. Every request to the old
// hostnames is sent to the same path on the new one, so nothing that was ever linked or
// indexed dies, and the authority follows the path instead of piling up on one page.
//
// The root goes to the new homepage like every other path (James, Sept 30 2026: typing the old
// address should open the site, not the Florida page).
//
// This lives here and not in _redirects because _redirects cannot match on hostname, and a
// bare "/" rule there would redirect globaldatacenters.net's homepage too, taking the globe
// and the whole site with it. Add a host below to include it.
//
// Sending these to the new origin, rather than to another path on the old one, is also what
// lets the _redirects rules do their job: the browser arrives at globaldatacenters.net and
// /alabama-data-center-opposition or /palm-beach-county is resolved there as normal.
//
// /api/ is held back from all of this. Stripe posts orders to
// floridadatacenters.org/api/stripe-webhook and does not follow redirects: a 301 there is a
// delivery failure, Stripe retries and then gives up, and the order is never processed. The
// same goes for any other machine that was pointed at the old host. Those requests are served
// by the function that owns the path, exactly as they are on the new host. Only people get
// forwarded.
const OLD_FLORIDA_HOSTS = new Set([
  'floridadatacenters.org',
  'www.floridadatacenters.org',
]);
const NEW_ORIGIN = 'https://globaldatacenters.net';
const FLORIDA_PAGE = '/data-centers/united-states/florida/';

// The Florida-only pages this site grew out of are kept in archive/legacy-florida/ so the
// writing is not lost, but they are no longer part of the site. Cloudflare Pages deploys
// every file in the repository, so the folder is taken out of the site here instead: this
// middleware runs before the static asset is fetched, so nothing under /archive/ is ever
// served. Each retired page has its own 301 in _redirects; this only catches the folder.
const ARCHIVE_PREFIX = '/archive/';

// Everything under this prefix is an endpoint, not a page, and is never forwarded off the old
// hostnames. Keep the trailing slash: it matches /api/stripe-webhook and leaves a page called
// /api-something alone.
const API_PREFIX = '/api/';

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname.toLowerCase().startsWith(ARCHIVE_PREFIX)) {
    return Response.redirect(NEW_ORIGIN + FLORIDA_PAGE, 301);
  }

  const isApi = url.pathname.toLowerCase().startsWith(API_PREFIX);

  if (OLD_FLORIDA_HOSTS.has(url.hostname.toLowerCase()) && !isApi) {
    // The query string rides along on every path, so campaign tags and the globe's own
    // ?focus= links still work after the hop.
    return Response.redirect(NEW_ORIGIN + url.pathname + url.search, 301);
  }

  const response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response; // leave JSON/CSS/images/etc. untouched
  }

  // Inject the pixel right before </head>. HTMLRewriter streams, so this is cheap.
  return new HTMLRewriter()
    .on('head', {
      element(el) {
        el.append(PIXEL_SNIPPET, { html: true });
      },
    })
    .transform(response);
}
