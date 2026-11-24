// Builds data/globe.json (what the homepage globe loads) from data/projects.json.
// Run from the repo root after every geocode: node data/build-globe.js
// Town-level rows have no coordinates, so the first run asks Google for the town center
// (the "APPROXIMATE" result the geocoder refuses for a pin) and stores it as town_lat/town_lng.
// Coordinate presence alone does not establish parcel accuracy. Preserve explicit
// approximate geocoding notes when compiling the map's location-confidence flag.
const fs=require('fs');
const {mapFields}=require('./globe-record-fields.cjs');
const path='data/projects.json';
const db=JSON.parse(fs.readFileSync(path,'utf8'));
const env=Object.fromEntries(fs.readFileSync('data/.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>l.trim().split('=')));
const KEY=env.GOOGLE_MAPS_KEY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function center(q){const j=await(await fetch('https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent(q)+'&key='+KEY)).json();if(j.status!=='OK')return null;const r=j.results[0];return {lat:+r.geometry.location.lat.toFixed(4),lng:+r.geometry.location.lng.toFixed(4)};}
(async()=>{
  let asked=0,got=0;
  for(const p of db.projects){
    if(p.kind==='jurisdiction')continue;
    if(p.pin_unverified||p.lat!=null||p.town_lat!=null)continue;
    if(!p.address&&!p.country)continue;
    if(!KEY){continue;}
    const q=[p.address,p.country].filter(Boolean).join(', ');
    let c=null;try{c=await center(q);}catch(e){}
    if(!c&&p.country&&p.address!==p.country){try{c=await center(p.country);}catch(e){}}
    asked++;await sleep(60);
    if(c){p.town_lat=c.lat;p.town_lng=c.lng;got++;}
  }
  if(asked)fs.writeFileSync(path,JSON.stringify(db,null,1));
  const out=[];let placed=0,approx=0,colos=0;
  for(const p of db.projects){
    if(p.kind==='jurisdiction'||p.no_page||p.pin_unverified)continue;
    const solid=mapFields(p).type==='placed';
    const lat=p.lat??p.town_lat,lng=p.lng??p.town_lng;
    if(lat==null||lng==null)continue;
    
    const blob=[p.tenant,p.note,p.name].join(' ');solid?placed++:approx++;const colo=/\bsmall\b|IBX|carrier hotel|edge (site|node|market)|zColo/i.test(blob)||(/colocation/i.test(p.tenant||'')&&!/hyperscale|AI|campus/i.test(blob))||(p.capacity_mw!=null&&p.capacity_mw<10);
    const blocked=!!p.blocked;const isColo=colo&&!blocked;
    if(isColo)colos++;
    out.push({id:p.id,name:p.name,dev:p.developer||'',status:p.status||'',country:p.country||'',addr:p.address||'',mw:p.capacity_mw||0,lat,lng,type:solid?'placed':'approx',kind:isColo?'colo':'campus',src:mapFields(p).src,...(blocked?{blk:{how:p.blocked.how||'',date:p.blocked.date||'',size:p.blocked.size||'',inv:p.blocked.investment||'',court:!!p.blocked.court}}:{})});
  }
  fs.writeFileSync('data/globe.json',JSON.stringify({generated:new Date().toISOString().slice(0,10),placed,approx,sites:out}));

  /* The three counters on the homepage were hand-typed and had drifted a long way: the page
     shipped "1,100+" community reports against 714 real ones, and "150+" projects against
     1,939. JavaScript corrected them a beat after load, which is the flicker you see - but
     anything that does not run JavaScript, a crawler or a link preview, read the wrong numbers
     and nothing ever corrected them. A site whose whole argument is that you can check it
     cannot overstate its own totals in static HTML. They are written from the same data the
     globe loads, so they cannot drift again. */
  try{
    const reports=(JSON.parse(fs.readFileSync('data/reports.json','utf8')).reports)||[];
    const nonColo=out.filter(s=>s.kind!=='colo');
    const stat={
      'stat-reports':String(reports.length)+'+',
      'stat-projects':nonColo.filter(s=>!s.blk).length.toLocaleString('en-US')+'+',
      'stat-countries':String(new Set(nonColo.map(s=>s.country).filter(Boolean)).size)
    };
    let html=fs.readFileSync('index.html','utf8');const before=html;
    for(const id of Object.keys(stat))html=html.replace(new RegExp('(id="'+id+'"[^>]*>)[^<]*','g'),'$1'+stat[id]);
    if(html!==before){
      fs.writeFileSync('index.html',html);
      console.log('homepage counters stamped: '+Object.keys(stat).map(k=>k.replace('stat-','')+' '+stat[k]).join(', '));
    }else console.log('homepage counters already correct');
  }catch(e){console.log('homepage counters NOT stamped: '+e.message);}
  console.log(`town centers: asked ${asked}, got ${got}. globe.json: ${placed} solid, ${approx} hollow, ${out.length} total; ${colos} tagged colocation (off by default).`);
})();
