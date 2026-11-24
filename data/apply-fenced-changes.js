// One-off: applies every pending change to index.html, wins.html and data/build-pages.js.
//
// These three files were being edited by another session, so the changes were written out
// instead of applied. Run this once that session is finished, from the repo root:
//
//   node data/apply-fenced-changes.js --dry     see what would change, touch nothing
//   node data/apply-fenced-changes.js           apply, after writing .bak copies
//
// Every edit is anchored on surrounding content, never a line number, because those three
// files moved while this was being written. If an anchor is gone the script stops and names
// it, having changed nothing: all three files are written only after all edits succeed.
//
// Covers:
//   item 1  letter link carries the town, so the form can prefill it       build-pages.js
//   item 2  nav points at the moratoriums tab, and off the retired page    all three
//   item 3  homepage title and description built around what people search index.html
//   item 4  share buttons and per project share images                     build-pages.js, wins.html
//   item 5  "alert me near me" signup replacing the newsletter box         index.html, wins.html
//
// Delete this file once it has run.

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');

// ---------------------------------------------------------------- blocks

const ALERTS_FORM = `<form action="/api/alerts" method="post" class="alerts-form">
            <input type="email" name="email" placeholder="your@email.com" required aria-label="Email address">
            <div class="alerts-pair">
              <input type="text" name="country" placeholder="Country" required aria-label="Country" list="alerts-countries" autocomplete="country-name">
              <input type="text" name="postcode" placeholder="Zip or postcode" required aria-label="Zip or postcode" autocomplete="postal-code">
            </div>
            <input type="text" name="website" class="alerts-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            <button type="submit">Alert me</button>
          </form>
          <p class="alerts-ok" hidden>You are on the list. We will email you when something is proposed near that postcode.</p>
          <datalist id="alerts-countries"><option value="United States"></option><option value="Canada"></option><option value="United Kingdom"></option><option value="Ireland"></option><option value="Australia"></option><option value="Germany"></option><option value="France"></option><option value="Netherlands"></option><option value="Spain"></option><option value="Italy"></option><option value="Sweden"></option><option value="Norway"></option><option value="Denmark"></option><option value="Finland"></option><option value="Poland"></option><option value="Portugal"></option><option value="Belgium"></option><option value="Austria"></option><option value="Switzerland"></option><option value="Mexico"></option><option value="Brazil"></option><option value="Chile"></option><option value="India"></option><option value="Japan"></option><option value="Singapore"></option><option value="Malaysia"></option><option value="New Zealand"></option><option value="South Africa"></option></datalist>`;

// Scoped under .footer-signup on purpose: the existing ".footer-signup form{display:flex}"
// out-specifies a bare .alerts-form rule, which left the three fields on one row and pushed
// the page 67px sideways on a phone.
const ALERTS_CSS = `.footer-signup .alerts-form{display:block;border:0}
.footer-signup .alerts-form input[type=email],.footer-signup .alerts-pair input{width:100%;box-sizing:border-box;border:1px solid rgba(247,244,236,.35);background:transparent;color:#f7f4ec;padding:13px 14px;font:400 15px var(--serif);outline:none}
.footer-signup .alerts-form input[type=email]:focus,.footer-signup .alerts-pair input:focus{border-color:rgba(247,244,236,.75)}
.footer-signup .alerts-pair{display:flex;gap:8px;margin-top:8px}
.footer-signup .alerts-pair input{flex:1 1 0;min-width:0}
.footer-signup .alerts-form button{display:block;width:100%;margin-top:8px;padding:13px 18px}
.footer-signup .alerts-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0;padding:0!important;border:0!important}
.footer-signup .alerts-ok{font:400 12px/1.55 var(--sans);color:#bfe0c6;margin:10px 0 0}
`;

const ALERTS_JS = `<script>
/* Footer alert signup. Posts without leaving the page so the form can say something
   useful back. Falls through to a normal form post if fetch is unavailable. */
(function(){
  var form=document.querySelector('.alerts-form'); if(!form||!window.fetch) return;
  var ok=document.querySelector('.alerts-ok');
  var note=form.parentNode.querySelector('.foot');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=form.querySelector('button'), was=btn.textContent;
    btn.disabled=true; btn.textContent='Saving';
    fetch('/api/alerts',{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
      .then(function(r){return r.json().then(function(b){return {ok:r.ok,b:b}})})
      .then(function(res){
        if(res.ok&&res.b.success){ form.hidden=true; if(note)note.hidden=true; if(ok)ok.hidden=false; return; }
        btn.disabled=false; btn.textContent=was;
        if(ok){ ok.hidden=false; ok.textContent=res.b.error||'That did not save. Please try again.'; }
      })
      .catch(function(){ btn.disabled=false; btn.textContent=was;
        if(ok){ ok.hidden=false; ok.textContent='We could not reach the server. Please try again.'; } });
  });
})();
</script>`;

const OLD_SIGNUP = `<p class="eyebrow">Alerts · 50,000+ residents subscribed</p>
          <form action="/api/contact" method="post"><input type="email" name="email" placeholder="your@email.com" required aria-label="Email address"><input type="hidden" name="type" value="newsletter"><button type="submit">Get alerts</button></form>
          <p class="foot">One email when a filing, vote, tax deal, or deadline hits your area. No spam, unsubscribe anytime.</p>`;

const NEW_SIGNUP = `<p class="eyebrow">Alert me when a data center is proposed near me</p>
          ` + ALERTS_FORM + `
          <p class="foot">Tell us your country and postcode and we email you when a project near it is proposed or changes status. We never ask for a street address. Unsubscribe anytime.</p>`;

const WINS_SHARE_CSS = `.w-share{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:26px 0 8px;padding-top:20px;border-top:1px solid var(--rule)}
.w-share h3{font:600 12px/1 var(--sans);letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin:0 10px 0 0}
.w-sb{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);font:500 13.5px/1 var(--sans);padding:11px 15px;text-decoration:none;cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.w-sb:hover{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.w-sb svg{width:16px;height:16px;flex:none}
.w-sb.copied{background:var(--green);border-color:var(--green);color:#fff}
@media(max-width:760px){.w-share{gap:7px}.w-share h3{flex:1 0 100%;margin:0 0 4px}.w-sb{flex:1 1 auto;justify-content:center;padding:12px 10px}}
`;

const WINS_SHARE_HTML = `<div class="w-share" id="w-share"
  data-share-url="https://globaldatacenters.net/wins"
  data-share-title="Where communities won"
  data-share-text="Data centers that residents stopped, and every moratorium in effect.">
<h3>Share this</h3>
<button type="button" class="w-sb w-share-native" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/></svg><span>Share</span></button>
<button type="button" class="w-sb w-share-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg><span>Copy link</span></button>
<a class="w-sb" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=Data%20centers%20that%20residents%20stopped%2C%20and%20every%20moratorium%20in%20effect.&amp;url=https%3A%2F%2Fglobaldatacenters.net%2Fwins"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.9l-4.3-5.6L6.5 21H3.4l7-8L2.6 3h6l3.9 5.2z"/></svg><span>X</span></a>
<a class="w-sb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fglobaldatacenters.net%2Fwins"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V12H8v3h2.5v6h3v-6H16l.5-3h-3v-2c0-.6.4-1 1-1z"/></svg><span>Facebook</span></a>
<a class="w-sb" href="sms:?&amp;body=Data%20centers%20that%20residents%20stopped%2C%20and%20every%20moratorium%20in%20effect.%20https%3A%2F%2Fglobaldatacenters.net%2Fwins"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span>Text message</span></a>
</div>
`;

const WINS_SHARE_JS = `<script>
/* Share row on the wins page. Native sheet where the browser has one. */
(function(){
  var box=document.getElementById('w-share'); if(!box) return;
  var url=box.getAttribute('data-share-url'),title=box.getAttribute('data-share-title'),text=box.getAttribute('data-share-text');
  var nat=box.querySelector('.w-share-native');
  if(nat&&navigator.share){nat.hidden=false;nat.addEventListener('click',function(){navigator.share({title:title,text:text,url:url}).catch(function(){})});}
  var copy=box.querySelector('.w-share-copy');
  if(copy){var span=copy.querySelector('span');
    var ok=function(){var w=span.textContent;span.textContent='Copied';copy.classList.add('copied');setTimeout(function(){span.textContent=w;copy.classList.remove('copied')},1800)};
    var fb=function(){var i=document.createElement('input');i.value=url;document.body.appendChild(i);i.select();try{document.execCommand('copy');ok()}catch(e){}i.remove()};
    copy.addEventListener('click',function(){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(ok).catch(fb)}else fb()});}
})();
</script>`;

const BP_SHARE_HELPERS = `// One framed 1200x630 satellite image of a site, for the share card.
function shareImage(lat, lng, exact) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) return '';
  const latPad = exact ? 0.004 : 0.03;                     // tighter when we know the parcel
  const lngPad = latPad / Math.max(0.2, Math.cos(lat * Math.PI / 180));
  const bbox = [lng - lngPad, lat - latPad, lng + lngPad, lat + latPad]
    .map(function (n) { return n.toFixed(5); }).join(',');
  return ESRI_EXPORT + '?bbox=' + bbox + '&bboxSR=4326&imageSR=3857&size=1200,630&format=jpg&f=image';
}

const SH_ICON = {
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.9l-4.3-5.6L6.5 21H3.4l7-8L2.6 3h6l3.9 5.2z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V12H8v3h2.5v6h3v-6H16l.5-3h-3v-2c0-.6.4-1 1-1z"/></svg>',
  sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>'
};

// Native sheet first on a phone, explicit buttons for everyone else. The text names the
// project and where it is, because a bare headline tells nobody why it matters to them.
function shareBlock(shareTitle, shareUrl, shareText) {
  const encUrl = encodeURIComponent(shareUrl);
  const encText = encodeURIComponent(shareText);
  return '<div class="g-share" data-share-url="' + esc(shareUrl) + '"'
    + ' data-share-title="' + esc(shareTitle) + '" data-share-text="' + esc(shareText) + '">'
    + '<h3>Share this</h3><div class="g-share-row">'
    + '<button type="button" class="g-sb g-share-native" hidden>' + SH_ICON.share + '<span>Share</span></button>'
    + '<button type="button" class="g-sb g-share-copy">' + SH_ICON.link + '<span>Copy link</span></button>'
    + '<a class="g-sb" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text='
      + encText + '&amp;url=' + encUrl + '">' + SH_ICON.x + '<span>X</span></a>'
    + '<a class="g-sb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u='
      + encUrl + '">' + SH_ICON.fb + '<span>Facebook</span></a>'
    + '<a class="g-sb g-share-sms" href="sms:?&amp;body=' + encodeURIComponent(shareText + ' ' + shareUrl) + '">'
      + SH_ICON.sms + '<span>Text message</span></a>'
    + '</div></div>';
}

const SHARE_JS = \`<script>
(function(){
  var box=document.querySelector('.g-share'); if(!box) return;
  var url=box.getAttribute('data-share-url'),
      title=box.getAttribute('data-share-title'),
      text=box.getAttribute('data-share-text');
  var nat=box.querySelector('.g-share-native');
  if(nat&&navigator.share){
    nat.hidden=false;
    nat.addEventListener('click',function(){
      navigator.share({title:title,text:text,url:url}).catch(function(){});
    });
  }
  var copy=box.querySelector('.g-share-copy');
  if(copy){
    var span=copy.querySelector('span');
    var ok=function(){var was=span.textContent;span.textContent='Copied';copy.classList.add('copied');
      setTimeout(function(){span.textContent=was;copy.classList.remove('copied')},1800)};
    var fallback=function(){var i=document.createElement('input');i.value=url;document.body.appendChild(i);
      i.select();try{document.execCommand('copy');ok()}catch(e){}i.remove()};
    copy.addEventListener('click',function(){
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(ok).catch(fallback);
      } else fallback();
    });
  }
})();
</script>\`;

function page(o) {`;

// ---------------------------------------------------------------- edits

const FILES = {
  'index.html': [
    ['item 2  nav points at the moratoriums tab',
     'href="/moratorium"', 'href="/wins#moratoriums"', 3],

    ['item 3  title built around "data center map" and "near you"',
     '<title>Global Data Centers. — A global buildout is landing in local backyards.</title>',
     '<title>Data Center Map: Find Data Centers Near You | Global Data Centers</title>', 1],

    ['item 3  meta description',
     '<meta name="description" content="Track data center construction worldwide. Follow the projects, understand the local stakes, and make your voice count."',
     '<meta name="description" content="See proposed and operating data centers on one map. Search your address to find data centers near you, with the filings, votes and sources behind each one."', 1],

    ['item 3  og:title kept in step',
     '<meta property="og:title" content="Global Data Centers — A global buildout is landing in local backyards."',
     '<meta property="og:title" content="Data Center Map: Find Data Centers Near You"', 1],

    ['item 5  alerts signup replaces the newsletter box',
     OLD_SIGNUP, NEW_SIGNUP, 1],

    ['item 5  alerts styles (index.html carries its own copy of the footer css)',
     '.footer-signup{max-width:400px}', ALERTS_CSS + '.footer-signup{max-width:400px}', 1],

    ['item 5  alerts script',
     '</body>', ALERTS_JS + '\n</body>', 1]
  ],

  'wins.html': [
    ['item 2  nav points at the moratoriums tab',
     'href="/moratorium"', 'href="/wins#moratoriums"', 3],

    ['item 4 + 5  share and alerts styles',
     '.footer-signup{max-width:400px}',
     WINS_SHARE_CSS + ALERTS_CSS + '.footer-signup{max-width:400px}', 1],

    ['item 4  share row under the wins list',
     '</div>\n<div class="w-pn" id="w-pn"',
     WINS_SHARE_HTML + '</div>\n<div class="w-pn" id="w-pn"', 1],

    ['item 5  alerts signup replaces the newsletter box',
     OLD_SIGNUP, NEW_SIGNUP, 1],

    ['item 4 + 5  scripts (build-pages.js lifts these onto every generated page)',
     '</body>', WINS_SHARE_JS + '\n' + ALERTS_JS + '\n</body>', 1]
  ],

  'data/build-pages.js': [
    ['item 2  "see them all" link under the US moratorium table',
     "moreLine(all, list.length, '/moratorium', 'moratorium tracker')",
     "moreLine(all, list.length, '/wins#moratoriums', 'moratorium tracker')", 1],

    ['item 2  keep the now redirected /moratorium out of the sitemap',
     'const SKIP_EXISTING = /^(global-preview-|preview-|free\\.html$|.*-success\\.html$)/;',
     'const SKIP_EXISTING = /^(global-preview-|preview-|free\\.html$|moratorium\\.html$|.*-success\\.html$)/;', 1],

    ['item 1  letter link carries the town so the form can prefill it',
     "  const letterHref = '/take-action.html?site=' + encodeURIComponent(r.id) + '&amp;name=' + encodeURIComponent(p.name);",
     `  // The letter form prefills its "town or address" from this, so someone arriving from a
  // project page does not have to retype where it is. Works the same in every country.
  const letterHref = '/take-action.html?site=' + encodeURIComponent(r.id)
    + '&amp;name=' + encodeURIComponent(p.name)
    + '&amp;town=' + encodeURIComponent(placeLine);`, 1],

    ['item 4  esri export endpoint, for one image per project',
     "const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';",
     `const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
// The satellite view on a page is a mosaic of the tiles above, positioned with CSS, so it
// has no single URL to hand a social network. This endpoint renders the same ground as one
// image, which is what a share card needs.
const ESRI_EXPORT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export';`, 1],

    ['item 4  share helpers and the share script',
     'function page(o) {', BP_SHARE_HELPERS, 1],

    ['item 4  og:image in the head of every page that has one',
     `<meta property="og:url" content="\${esc(SITE + o.url)}">
<meta name="twitter:card" content="summary_large_image">`,
     `<meta property="og:url" content="\${esc(SITE + o.url)}">
<meta property="og:site_name" content="Global Data Centers">
\${o.image ? \`<meta property="og:image" content="\${esc(o.image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="\${esc('Satellite view of ' + o.h1)}">
<meta name="twitter:image" content="\${esc(o.image)}">\` : ''}
<meta name="twitter:card" content="summary_large_image">`, 1],

    ['item 4  share script only on pages that ask for it',
     `\${CHROME_FOOTER}
\${CHROME_JS}
</body>`,
     `\${CHROME_FOOTER}
\${CHROME_JS}
\${o.share ? SHARE_JS : ''}
</body>`, 1],

    ['item 4  share row on project pages',
     `    '<div class="g-acts" style="margin-top:34px"><a class="g-btn red" href="' + letterHref + '">Send a letter about this one</a>'
      + '<a class="g-btn" href="' + esc(focusUrl(r.lat, r.lng, r.exact ? 16 : 12)) + '">View on the globe</a></div>',`,
     `    '<div class="g-acts" style="margin-top:34px"><a class="g-btn red" href="' + letterHref + '">Send a letter about this one</a>'
      + '<a class="g-btn" href="' + esc(focusUrl(r.lat, r.lng, r.exact ? 16 : 12)) + '">View on the globe</a></div>',
    shareBlock(title, SITE + r.page, p.name + ' in ' + placeLine + '. ' + r.status + '.'),`, 1],

    ['item 4  project pages declare their share row and image',
     `    narrow: true,
    stats: factLine,
    body: column
  }));
  stats.project++;`,
     `    narrow: true,
    stats: factLine,
    share: true,
    image: shareImage(r.lat, r.lng, r.exact),
    body: column
  }));
  stats.project++;`, 1],

    ['item 4  share styles',
     '@media(max-width:760px){.g-list{columns:1}.g-dl{grid-template-columns:1fr}.g-dl dt{border-bottom:0;padding-bottom:0}.g-dl dd{padding-top:2px}.g-acts .g-btn{width:100%;justify-content:center}}\n</style>`;',
     `.g-share{margin:30px 0 0;padding-top:22px;border-top:1px solid var(--rule)}
.g-share h3{font:600 12px/1 var(--sans);letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin:0 0 13px}
.g-share-row{display:flex;flex-wrap:wrap;gap:8px}
.g-sb{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--rule);background:var(--paper);color:var(--ink);font:500 13.5px/1 var(--sans);padding:11px 15px;text-decoration:none;cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.g-sb:hover{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.g-sb svg{width:16px;height:16px;flex:none}
.g-sb.copied{background:var(--green);border-color:var(--green);color:#fff}
@media(max-width:760px){.g-list{columns:1}.g-dl{grid-template-columns:1fr}.g-dl dt{border-bottom:0;padding-bottom:0}.g-dl dd{padding-top:2px}.g-acts .g-btn{width:100%;justify-content:center}
.g-share-row{gap:7px}.g-sb{flex:1 1 auto;justify-content:center;padding:12px 10px}}
</style>\`;`, 1]
  ]
};

// ---------------------------------------------------------------- run

let failed = 0;
const staged = [];

for (const rel of Object.keys(FILES)) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error('MISSING  ' + rel);
    failed++;
    continue;
  }
  let text = fs.readFileSync(full, 'utf8');
  const lines = [];

  for (const [label, from, to, expect] of FILES[rel]) {
    const found = text.split(from).length - 1;
    if (found === 0 && text.includes(to)) {
      lines.push('  already applied  ' + label);
      continue;
    }
    if (found !== expect) {
      lines.push('  ANCHOR PROBLEM   ' + label + '  (found ' + found + ', expected ' + expect + ')');
      failed++;
      continue;
    }
    text = text.split(from).join(to);
    lines.push('  ok               ' + label + (expect > 1 ? '  x' + expect : ''));
  }

  console.log('\n' + rel);
  lines.forEach(function (l) { console.log(l); });
  staged.push({ full: full, rel: rel, text: text });
}

console.log('');
if (failed) {
  console.error('Stopped: ' + failed + ' anchor(s) could not be matched. Nothing was written.');
  console.error('Those three files move under active editing, so find the anchor by its text and apply that one by hand.');
  process.exit(1);
}
if (DRY) {
  console.log('Dry run. All anchors matched. Nothing written.');
  process.exit(0);
}

staged.forEach(function (f) {
  fs.copyFileSync(f.full, f.full + '.bak');
  fs.writeFileSync(f.full, f.text);
  console.log('wrote ' + f.rel + '  (previous version kept as ' + path.basename(f.full) + '.bak)');
});

console.log('\nNow rebuild so the generated pages pick it up:');
console.log('  node data/build-globe.js && node data/build-pages.js');
console.log('\nThen delete this script.');
