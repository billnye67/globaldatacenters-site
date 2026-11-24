/* Builds preview-nobody.html from index.html with the phone experiment applied.
   index.html is never modified. Knobs at the top so a round of iteration is one number.
     node tools/make-preview.js [liftPx] [lat]
*/
const fs = require('fs');

const LIFT = Number(process.argv[2] || 110);   // px the globe moves UP on phones
const LAT = Number(process.argv[3] || 46);     // camera latitude: higher = looking further down
const TOP = Number(process.argv[4] || 40);     // where the text block starts, % of the hero

const inject = `<script>/* PREVIEW ONLY. Camera angled down so the US sits lower on the sphere,
   which is needed once the globe is lifted or it rides off the top. */
window.__homeOverride={lat:${LAT}};</script>
<style>
/* PREVIEW ONLY - the live homepage is untouched.
   The globe is lifted so its bottom crescent clears the body copy: everything from the
   headline down then sits on paper, not on the sphere. Only when NOT in globe mode, so
   opening the map still fills the screen. */
@media (max-width:760px){
  .hero:not(.globe-mode) .globe-frame{transform:translateY(-${LIFT}px)}
  .hero:not(.globe-mode) .lead{top:${TOP}%;bottom:auto}
}
</style>
</head>`;

let h = fs.readFileSync('index.html', 'utf8');
h = h.replace('</head>', inject, 1);
h = h.replace('<title>', `<title>PREVIEW lift${LIFT} lat${LAT} · `, 1);
fs.writeFileSync('preview-nobody.html', h);
console.log(`preview-nobody.html written: globe lifted ${LIFT}px, camera lat ${LAT}`);
