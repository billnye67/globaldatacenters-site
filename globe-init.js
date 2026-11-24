(() => {
'use strict';
// Geography now arrives as a global from /geography.js (a deferred script that runs
// before this one), rather than as a 244KB <script type="application/json"> in the page.
const countries=window.__GEO;
// Markers come from two files built in data/: reports.json (community reports, blue) and globe.json (tracked projects, green; approximate ones ride as blue).
let locations=JSON.parse(document.getElementById('location-data').textContent);
const frame=document.getElementById('globe-frame'),host=document.getElementById('globe'),fallback=document.getElementById('fallback'),poster=document.getElementById('globe-poster');
const motion=window.matchMedia('(prefers-reduced-motion: reduce)'),palette={report:'#526cb1',project:'#294e36',blocked:'#a0231d'},home=window.matchMedia('(max-width:760px)').matches?{lat:37.3,lng:-116,altitude:1.61312593}:{lat:38.1,lng:-104.1,altitude:1.61312593};
window.__home={...home};
let globe,rotating=!motion.matches,hover=false,pinned=false,activeType={report:true,project:true,blocked:true},fallbackView={...home},mapReady=false;
/* HANDOFF. /globe-still-*.webp is a still of this globe, fully loaded, at `home`. It is in the page from the
   first paint, in the same square the live globe draws into, so nothing moves when the live one takes over.
   The swap only happens once the live globe is BOTH textured (onGlobeReady) and carrying its real markers
   (the reports/globe fetches below) — otherwise the visitor would watch the dots arrive after the swap.
   Auto-rotation is held until that moment too, so the live globe is still on `home` when it appears. */
let globeReady=false,dataReady=false,handedOff=false,swapping=false;
function handoff(){if(swapping||!globeReady||!dataReady)return;swapping=true;
/* two frames, so the live globe has rendered once with its final camera and its final markers before it
   is uncovered — otherwise the first frame the visitor sees could still be the old projection */
requestAnimationFrame(()=>requestAnimationFrame(()=>{handedOff=true;host.classList.add('ready');fallback.classList.add('hidden');if(poster)poster.classList.add('done');updateRotation();
if(poster)setTimeout(()=>{if(poster.parentNode)poster.remove();},500);}));}
setTimeout(()=>{dataReady=true;handoff();},5000);/* a stalled fetch must never strand us on the still */
const filt={company:'',status:''};const bucket=st=>{st=(st||'').toLowerCase();if(/block|withdraw|cancel|denied|rejected|shelved|sold/.test(st))return 'blocked';if(/paused/.test(st))return 'paused';if(/construct|building/.test(st))return 'building';if(/operat|live|open/.test(st))return 'operating';if(/approv/.test(st))return 'approved';if(/propos|announce|plan|pending/.test(st))return 'proposed';return 'unknown';};
const passFilt=p=>{if(!filt.company&&!filt.status)return true;if(p.type!=='project'&&!p.dev)return false;if(filt.company&&p.dev!==filt.company)return false;if(filt.status&&bucket(p.status)!==filt.status)return false;return true;};
const layerOf=p=>p.blk?'blocked':p.type;const dotSize=p=>{if(p.type!=='project')return .135;if(p.blk)return .17;const m=+p.mw||0;return m>=1000?.30:m>=500?.24:m>=100?.19:m>=50?.16:m>0?.13:.12;};window.__dotSize=dotSize;
/* Dots are cylinders extruded from the globe surface. Two sitting on the same spot at the same
   height share their side walls exactly, and the depth buffer flickers between them - the tile
   z-fighting look. A blocked dot now stands proud of a live one instead of being buried inside
   it, and every dot gets a small deterministic height offset hashed from its own identity, so
   no two coincident dots ever share a surface. Deterministic, not random: per-frame jitter
   would shimmer. Satellite mode only - the paper map on the front page keeps its flat marks. */
const dotJit=p=>{const s=String(p.id||p.name||p.location||'')+'|'+p.lat+'|'+p.lng;let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%100000)/100000;};
const dotAltFor=(p,sat)=>{if(!sat)return p.type==='project'&&!p.blk?.006:.003;const base=p.blk?.0078:p.type==='project'?.006:.003;return base*(1+dotJit(p)*.22);};
const dotAlt=p=>dotAltFor(p,satMix>0);
window.__dotAlt=dotAlt;
/* THE HERO'S DOTS, MERGED. globe.gl draws each point as its own mesh - about 2,600 draw calls a frame, which is what made
   the globe choppy on phones. Every dot of a layer is one colour (dotColor depends only on the layer and satMix), so the
   hero's dots are merged into one mesh per layer: 3 draw calls. Geometry, placement and material are globe.gl's own
   (pointsLayer: its unit cylinder along -Z, lookAt the centre, min(30,r)*2piR/360 wide, max(alt*R,.1) tall, Lambert), with
   the classes taken from a point mesh globe.gl has built, since the bundle does not expose three.js. The paper and
   satellite height sets are both built ahead, so the fade only swaps a geometry and sets three colours. Taps and hover
   go through nearestDot(). The risk section's borrowed globe keeps globe.gl's own points. */
const heroDots=(function(){
var K=null,host3=null,meshes={},mats={},list=[],built={},pending=null,on=false,uK={value:1};
var R=100,PX=2*Math.PI*R/360,LAYERS=['report','project','blocked'],REP={report:{type:'report'},project:{type:'project'},blocked:{type:'project',blk:1}};
function grab(g){var pm=null;g.scene().traverse(function(o){if(!pm&&o.__globeObjType==='point')pm=o;});if(!pm||!pm.geometry||!pm.geometry.index)return false;
var base=pm.geometry,BA=Object.getPrototypeOf(base.getAttribute('position').constructor.prototype).constructor;if(!BA||BA===Object)BA=base.getAttribute('position').constructor;
K={Mesh:pm.constructor,BG:Object.getPrototypeOf(base.constructor.prototype).constructor,BA:BA,Mat:pm.material.constructor,base:base,t:new pm.constructor()};host3=pm.parent;return true;}
function buildSet(sat){var bp=K.base.getAttribute('position').array,bn=K.base.getAttribute('normal').array,bi=K.base.index.array,vc=bp.length/3,t=K.t,out={};
var by={report:[],project:[],blocked:[]};list.forEach(function(p){var L=layerOf(p);(by[L]||(by[L]=[])).push(p);});
LAYERS.forEach(function(L){var arr=by[L];if(!arr.length){out[L]=null;return;}
var pos=new Float32Array(arr.length*vc*3),nor=new Float32Array(arr.length*vc*3),bas=new Float32Array(arr.length*vc*3),hh=new Float32Array(arr.length*vc),idx=new Uint32Array(arr.length*bi.length);
for(var i=0;i<arr.length;i++){var p=arr[i],r=dotSize(p),alt=dotAltFor(p,sat),phi=(90-p.lat)*Math.PI/180,th=(90-p.lng)*Math.PI/180;
t.position.set(R*Math.sin(phi)*Math.cos(th),R*Math.cos(phi),R*Math.sin(phi)*Math.sin(th));t.rotation.set(0,0,0);t.scale.set(1,1,1);t.updateMatrixWorld(true);t.lookAt(0,0,0);
var sx=Math.min(30,r)*PX,sz=Math.max(alt*R,.1),H0=alt*R;t.scale.set(sx,sx,sz);t.updateMatrix();var e=t.matrix.elements,o=i*vc*3,ix=1/(sx*sx),iz=1/(sz*sz);
for(var v=0;v<vc;v++){var a=v*3,x=bp[a],y=bp[a+1],z=bp[a+2];pos[o+a]=e[0]*x+e[4]*y+e[8]*z+e[12];pos[o+a+1]=e[1]*x+e[5]*y+e[9]*z+e[13];pos[o+a+2]=e[2]*x+e[6]*y+e[10]*z+e[14];bas[o+a]=e[12];bas[o+a+1]=e[13];bas[o+a+2]=e[14];hh[i*vc+v]=H0;
var nx=bn[a]*ix,ny=bn[a+1]*ix,nz=bn[a+2]*iz,wx=e[0]*nx+e[4]*ny+e[8]*nz,wy=e[1]*nx+e[5]*ny+e[9]*nz,wz=e[2]*nx+e[6]*ny+e[10]*nz,ln=Math.sqrt(wx*wx+wy*wy+wz*wz)||1;nor[o+a]=wx/ln;nor[o+a+1]=wy/ln;nor[o+a+2]=wz/ln;}
var io=i*bi.length,vo=i*vc;for(var j=0;j<bi.length;j++)idx[io+j]=bi[j]+vo;}
var g=new K.BG();g.setAttribute('position',new K.BA(pos,3));g.setAttribute('normal',new K.BA(nor,3));g.setAttribute('aBase',new K.BA(bas,3));g.setAttribute('aH',new K.BA(hh,1));g.setIndex(new K.BA(idx,1));g.computeBoundingSphere();out[L]=g;});return out;}
function drop(set){if(set)LAYERS.forEach(function(L){if(set[L]&&!(geos===set))set[L].dispose();});}
function mode(){return satMix>0;}
function show(){var sat=mode();if(!built[sat])built[sat]=buildSet(sat);var set=built[sat];
LAYERS.forEach(function(L){var g=set[L];if(!meshes[L]){mats[L]=new K.Mat({color:dotColor(REP[L])});/* stronger than the paper shell's -4 offset, or the shell swallows the short dots while it covers the globe */mats[L].polygonOffset=true;mats[L].polygonOffsetFactor=-8;mats[L].polygonOffsetUnits=-8;mats[L].customProgramCacheKey=function(){return 'heroDotsK';};mats[L].onBeforeCompile=function(sh){sh.uniforms.uK=uK;sh.vertexShader='attribute vec3 aBase;\nattribute float aH;\nuniform float uK;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{vec3 nD=normalize(aBase);vec3 oD=transformed-aBase;float hD=dot(oD,nD);vec3 rD=oD-hD*nD;float sH=aH>0.0?max(aH*uK,0.1)/max(aH,0.1):1.0;transformed=aBase+rD*uK+nD*(hD*sH);}');};var m=new K.Mesh(g||K.base,mats[L]);m.raycast=function(){};m.__heroDots=L;meshes[L]=m;host3.add(m);}
meshes[L].visible=!!g;if(g)meshes[L].geometry=g;});
clearTimeout(pending);pending=setTimeout(function(){if(!built[!sat])built[!sat]=buildSet(!sat);},400);}
function rebuild(){var old=[built[true],built[false]];built={};show();old.forEach(function(set){if(set)LAYERS.forEach(function(L){if(set[L])set[L].dispose();});});}
return{get on(){return on;},
satellite:function(){if(!on||!built[true])return null;return LAYERS.filter(function(L){return built[true][L];}).map(function(L){return {layer:L,mesh:meshes[L],geometry:built[true][L]};});},
init:function(g,cb){var n=0;(function look(){if(grab(g)){on=true;cb&&cb();return;}if(++n<240)requestAnimationFrame(look);})();},
data:function(l){list=l.slice();rebuild();},
scale:function(k){uK.value=k;},
color:function(){LAYERS.forEach(function(L){if(mats[L])mats[L].color.setStyle(dotColor(REP[L]));});if(on&&meshes.report)show();}};})();

const visibleLocations=()=>locations.filter(p=>activeType[layerOf(p)]&&passFilt(p));window.__locations=locations;window.__visibleLocations=visibleLocations;
function buildFilters(sites){const sel=document.getElementById('filter-company');if(!sel)return;const by={};sites.forEach(x=>{if(!x.dev)return;const b=by[x.dev]||(by[x.dev]={n:0,loc:0});b.n++;if(!x.approx)b.loc++;});const names=Object.keys(by).sort((a,b)=>by[b].n-by[a].n||a.localeCompare(b));names.forEach(nm=>{const o=document.createElement('option');o.value=nm;o.textContent=`${nm} · ${by[nm].n} sites, ${by[nm].loc} located`;sel.appendChild(o);});document.getElementById('map-filters').hidden=false;const onf=()=>{filt.company=sel.value;filt.status=document.getElementById('filter-status').value;closeCard();applyData();};sel.addEventListener('change',onf);document.getElementById('filter-status').addEventListener('change',onf);}
let satMix=0;const RED=[192,57,43];const hex2=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));const PAL={report:hex2(palette.report),project:hex2(palette.project),blocked:hex2(palette.blocked)};const WHITE=[255,255,255];
const dotColor=p=>{const t=layerOf(p),to=t==='blocked'?WHITE:RED;if(satMix<=0)return palette[t];if(satMix>=1)return t==='blocked'?'#ffffff':'#c0392b';const a=PAL[t];return 'rgb('+a.map((v,i)=>Math.round(v+(to[i]-v)*satMix)).join(',')+')';};window.__dotColor=dotColor;
window.__satDots=function(mix){mix=Math.max(0,Math.min(1,+mix||0));if(Math.abs(mix-satMix)<0.01&&mix!==0&&mix!==1)return;/* No mesh rebuild from here. This runs on EVERY frame of the paper/satellite fade, and it is
   called from inside the exit animation's own loop - so a rebuild that throws takes the whole
   animation down with it, and the globe never gets its paper texture back. The dot scale is
   re-applied once when the camera lands instead. */
satMix=mix;if(globe){if(heroDots.on&&globe===window.__heroGlobe)heroDots.color();else globe.pointColor(dotColor);}document.querySelectorAll('.map-legend .dot').forEach(el=>{el.style.background=el.classList.contains('blocked')?dotColor({type:'project',blk:1}):dotColor({type:el.classList.contains('project')?'project':'report'});});};
function applyData(){window.__locations=locations;if(globe){if(heroDots.on&&(globe===window.__heroGlobe||globe.__riskDots)){heroDots.data(visibleLocations());heroDots.color();if(globe.__riskDots)globe.__riskDots.sync();}else{globe.pointsData(visibleLocations());globe.pointColor(dotColor);}globe.ringsData(rings());}else drawFallback();updateStatus();}
Promise.all([fetch('/data/reports.json',{cache:'no-cache'}).then(r=>r.json()).catch(()=>({reports:[]})),fetch('/data/globe.json',{cache:'no-cache'}).then(r=>r.json()).catch(()=>({sites:[]}))]).then(([r,g])=>{const reps=(r.reports||[]).map(x=>({...x,type:'report'}));const sites=(g.sites||[]).filter(x=>x.kind!=='colo').map(x=>({...x,type:'project',approx:x.type!=='placed'}));locations=reps.concat(sites);buildFilters(sites);applyData();const n=id=>document.getElementById(id);if(n('stat-reports'))n('stat-reports').textContent=reps.length+'+';if(n('stat-projects'))n('stat-projects').textContent=sites.filter(x=>!x.blk).length.toLocaleString()+'+';if(n('stat-countries'))n('stat-countries').textContent=new Set(sites.map(x=>x.country).filter(Boolean)).size;dataReady=true;handoff();});
function updateStatus(){const v=visibleLocations(),r=v.filter(p=>p.type==='report').length,p=v.filter(p=>p.type==='project'&&!p.blk).length,b=v.filter(p=>p.blk).length;document.getElementById('map-status').textContent=`Map shows ${r.toLocaleString()} community reports and ${p.toLocaleString()} verified projects${b?' and '+b.toLocaleString()+' blocked projects':''}${filt.company?' for '+filt.company:''}.`;}
function updateRotation(){if(globe)globe.controls().autoRotate=rotating&&!hover&&!pinned&&!document.hidden&&handedOff;const b=document.getElementById('rotation-toggle');b.setAttribute('aria-pressed',String(rotating));b.setAttribute('aria-label',rotating?'Pause globe rotation':'Start globe rotation');b.title=rotating?'Pause globe rotation':'Start globe rotation';}
function stopRotation(){rotating=false;updateRotation();}
window.__stopGlobeRotation=stopRotation;
/* The card animates, so it can no longer be shown by flipping `hidden` - display:none cannot
   transition. `hidden` comes off one frame BEFORE the class that animates it in, and only goes
   back on once the fade out has actually finished. */
var __cardT=null;
const cardEl=()=>document.getElementById('point-card');
function placeCard(p){
  const el=cardEl(),r=host.getBoundingClientRect();
  const sc=(globe&&globe.getScreenCoords)?globe.getScreenCoords(p.lat,p.lng):null;
  /* On a phone the card is a full-width sheet above the thumb. Floating a 268px box next to a
     fingertip there would cover the thing you just tapped. */
  if(!sc||window.matchMedia('(max-width:760px)').matches){el.classList.remove('card-float');el.style.left=el.style.top=el.style.transformOrigin='';return;}
  el.classList.add('card-float');
  const w=el.offsetWidth||268,h=el.offsetHeight||220,GAP=16,E=10;
  const gx=r.left+sc.x,gy=r.top+sc.y;
  let left=gx-w/2,top=gy+GAP,ox='50%',oy='0%';
  if(top+h>r.bottom-E){top=gy-h-GAP;oy='100%';}              /* no room below: sit above */
  if(top<r.top+E){                                            /* no room either way: go beside */
    top=Math.min(Math.max(r.top+E,gy-h/2),Math.max(r.top+E,r.bottom-h-E));oy='50%';
    if(gx+GAP+w<=r.right-E){left=gx+GAP;ox='0%';}else{left=gx-w-GAP;ox='100%';}
  }
  left=Math.min(Math.max(r.left+E,left),Math.max(r.left+E,r.right-w-E));
  el.style.left=left+'px';el.style.top=top+'px';el.style.transformOrigin=ox+' '+oy;
}
function openCard(p,locked){
  const el=cardEl();clearTimeout(__cardT);el.hidden=false;
  if(locked){el.classList.remove('card-float');el.style.left=el.style.top=el.style.transformOrigin='';}
  else placeCard(p);
  if(!el.classList.contains('card-in')){void el.offsetWidth;el.classList.add('card-in');}
}
function fadeCard(){
  const el=cardEl();el.classList.remove('card-in');clearTimeout(__cardT);
  /* Longer than the slowest exit (the phone sheet slides for 300ms). Setting `hidden` before the
     transition ends makes the sheet vanish mid-slide instead of travelling off the bottom. */
  __cardT=setTimeout(function(){if(!el.classList.contains('card-in')){el.hidden=true;el.classList.remove('card-float');}},340);
}
function closeCard(){fadeCard();pinned=false;hover=false;updateRotation();}
/* A drag to spin the globe, or a pinch to zoom it, used to finish as a click - so letting go
   over a dot opened that dot's card, and a two-finger zoom could open one you never aimed at.
   A tap is one finger, that barely moves, held briefly. Anything else is a gesture.
   Capture phase, so this is recorded before the globe's own raycaster gets the event. */
var __tapOK=false,__tapX=0,__tapY=0,__tapT=0,__tapN=0;
const TAP_SLOP=9,TAP_MS=700;
host.addEventListener('pointerdown',function(e){
  __tapN++;
  if(__tapN>1){__tapOK=false;return;}            /* second finger down: a pinch, never a tap */
  __tapOK=true;__tapX=e.clientX;__tapY=e.clientY;__tapT=performance.now();
},true);
host.addEventListener('pointermove',function(e){
  if(!__tapOK)return;
  if(Math.abs(e.clientX-__tapX)>TAP_SLOP||Math.abs(e.clientY-__tapY)>TAP_SLOP)__tapOK=false;
},true);
const __tapEnd=function(){__tapN=Math.max(0,__tapN-1);};
host.addEventListener('pointerup',__tapEnd,true);
host.addEventListener('pointercancel',function(){__tapN=0;__tapOK=false;},true);
/* The mouse has hover, so a desktop click that survived the slop test is always deliberate;
   the time limit is there for touch, where a long press is a different intent. */
function isTap(){return __tapOK&&performance.now()-__tapT<TAP_MS;}
/* globe.gl's onPointHover had the dot meshes to hit; the merged dots are not raycast, so desktop hover finds the dot under
   the mouse on screen instead, once a frame at most */
var __hvE=null,__hvRaf=0,__hvLast=null;
host.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'||!heroDots.on||globe!==window.__heroGlobe)return;__hvE=e;if(__hvRaf)return;__hvRaf=requestAnimationFrame(function(){__hvRaf=0;var h=nearestDot(__hvE,8);if(h!==__hvLast){__hvLast=h;showCard(h||null);}});});
host.addEventListener('pointerleave',function(){if(__hvLast){__hvLast=null;showCard(null);}});
function showCard(p,locked=false){if(!p){if(!pinned){hover=false;fadeCard();updateRotation();}return;}/* the homepage globe is a picture: dot cards only once the map is open, never over the headline */if(globe===window.__heroGlobe&&!document.getElementById('hero-sec').classList.contains('globe-mode'))return;if(pinned&&!locked)return;hover=true;pinned=locked;const $=id=>document.getElementById(id);const isP=p.type==='project';const B=p.blk;$('card-type').textContent=B?(p.dev?p.dev+' · stopped':'Stopped'):isP?(p.dev||'Tracked project'):'Community report';$('card-dot').className='dot'+(B?' blocked':isP?' project':'');$('card-location').textContent=p.name||p.location||'';const hasStreet=/\d|\b(rd|road|st|street|ave|hwy|highway|blvd|dr|drive|lane|ln|way|pkwy|fm|cr)\b/i.test(p.addr||'')&&!/^[^,]+,\s*[A-Z]{2}\s*\d{5}$/.test(p.addr||'');const fd=d=>{const m=/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d||'');if(!m)return d||'';const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return m[3]?M[+m[2]-1]+' '+(+m[3])+', '+m[1]:m[2]?M[+m[2]-1]+' '+m[1]:m[1];};$('card-body').textContent=B?(B.how+(B.date?' ('+fd(B.date)+')':'')+'.'):isP?(p.addr||'')+(p.approx?(p.addr?'. ':'')+'Approximate map location; exact site not confirmed.':''):'Reported by a resident. Not yet verified by us.';const bk=bucket(p.status),lab={operating:'Operating',building:'Under construction',proposed:'Proposed',approved:'Approved',paused:'Paused',unknown:'Not reported',blocked:'Blocked or withdrawn'}[bk];const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));$('card-facts').innerHTML=B?`<span class="card-status stopped">${B.court?'Blocked in court':'Stopped'}</span>`+(B.size?`<span>${esc(B.size)}</span>`:(p.mw?`<span>${(+p.mw).toLocaleString()} MW</span>`:''))+(B.inv?`<span>${esc(B.inv)}</span>`:'')+(p.country?`<span>${esc(p.country)}</span>`:''):isP?`<span class="card-status ${bk}">${lab}</span>`+(p.mw?`<span>${(+p.mw).toLocaleString()} MW</span>`:'')+(p.country?`<span>${p.country}</span>`:''):'';const im=$('card-img');/* The photo used to be a single map tile, which is whatever square happens to CONTAIN the
   point - so the site could sit in a corner of it, or just past its edge, and the picture
   showed a field next door. This asks for an image centred on the coordinates instead,
   about 1.2km tall, which fits a whole campus with some ground around it. */
if(isP&&!p.approx){im.className='card-img';var PH=window.matchMedia('(max-width:760px)').matches;var AR=PH?1:2.6,hLat=0.0055,hLng=hLat*AR/Math.max(.2,Math.cos(p.lat*Math.PI/180));var bb=[(p.lng-hLng).toFixed(5),(p.lat-hLat).toFixed(5),(p.lng+hLng).toFixed(5),(p.lat+hLat).toFixed(5)].join(',');im.style.backgroundImage='url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox='+bb+'&bboxSR=4326&imageSR=3857&size='+(PH?'360,360':'792,304')+'&format=jpg&transparent=false&f=image)';}else{im.className='card-img none';}$('card-fly').hidden=!(satMix>0&&isP&&!p.approx&&globe===window.__heroGlobe);$('card-fly').onclick=()=>{if(!globe||globe!==window.__heroGlobe)return;window.__cancelFly();stopRotation();closeCard();var ctl=globe.controls();ctl.enableDamping=false;ctl.update();ctl.enableDamping=true;globe.htmlElementsData([]);globe.pointOfView({lat:p.lat,lng:p.lng,altitude:0.00045},1800);};$('card-letter').hidden=!!B;$('card-letter').href='/take-action.html?site='+encodeURIComponent(p.id||'')+'&name='+encodeURIComponent(p.name||p.location||'');$('card-photo').href='mailto:james@floridadatacenters.org?subject='+encodeURIComponent('Photo for '+(p.name||p.location||'a data center'));window.__cardP=p;window.__setDetails(p);const cl=$('card-link');var source='';try{var u=new URL(p.src);if(/^https?:$/.test(u.protocol)&&!/[\s]/.test(p.src))source=u.href;}catch(e){}if(source){cl.href=source;cl.hidden=false;}else{cl.removeAttribute('href');cl.hidden=true;}openCard(p,locked);updateRotation();}
window.__pageIndex=null;window.__setDetails=function(p){var el=document.getElementById('card-details');if(!el)return;var u=p&&window.__pageIndex?window.__pageIndex[p.id||'']:null;if(u){el.href=u;el.hidden=false;}else{el.hidden=true;}};fetch('/data/project-pages.json',{cache:'no-cache'}).then(function(r){return r.json();}).then(function(j){window.__pageIndex=j;if(window.__cardP)window.__setDetails(window.__cardP);}).catch(function(){});
function nearestDot(ev,limPx,targetGlobe,targetHost){const globe=targetGlobe||window.__activePickGlobe||window.__heroGlobe;if(!globe||!ev)return null;const r=(targetHost||host).getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top,pov=globe.pointOfView(),lim=limPx||(pov.altitude>1?14:22),cam=globe.camera().position,close=pov.altitude<.12;let best=null,score=Infinity;for(const p of visibleLocations()){
/* The pin is a short raised cylinder at deep zoom. Its ground coordinate can be well away from
   the visible side. Hit the projected stem and give its width a touch-sized allowance. */
const w=globe.getCoords(p.lat,p.lng,0);if(w.x*cam.x+w.y*cam.y+w.z*cam.z<=10000)continue;const sc=globe.getScreenCoords(p.lat,p.lng);if(!sc)continue;let d=Math.hypot(sc.x-x,sc.y-y),reach=lim;
if(close){reach=Math.max(reach,34);/* Below the pin top, projecting it crosses the camera and gives a false line across the screen. */
if(pov.altitude>.003){const top=globe.getScreenCoords(p.lat,p.lng,.001),edge=globe.getScreenCoords(p.lat+dotSize(p)/2,p.lng,.001);if(top){const vx=top.x-sc.x,vy=top.y-sc.y,q=Math.max(0,Math.min(1,((x-sc.x)*vx+(y-sc.y)*vy)/(vx*vx+vy*vy||1)));d=Math.hypot(x-sc.x-q*vx,y-sc.y-q*vy);if(edge)reach=Math.min(55,Math.max(24,Math.hypot(edge.x-top.x,edge.y-top.y)+18));}}}
const s=d/reach;if(s<=1&&s<score){score=s;best=p;}}return best;}
function coordLabel(v){const lng=((v.lng+180)%360+360)%360-180;document.getElementById('coordinates').textContent=`${Math.abs(v.lat).toFixed(1)}° ${v.lat>=0?'N':'S'} / ${Math.abs(lng).toFixed(1)}° ${lng>=0?'E':'W'}`;}
function setView(v,duration=500){if(globe)globe.pointOfView(v,motion.matches?0:duration);else{fallbackView={...fallbackView,...v};drawFallback();coordLabel(fallbackView);}}
/* Going home from a zoomed-in view used to ease lat, lng and altitude on one curve, so the
   camera travelled sideways while it was still low - it read as skimming the ground and then
   landing, not as pulling back. Altitude leads and the rotation follows, so the globe gets
   small first and you can tell what you are looking at while it turns.
   Only when we are CLOSER than where we are going. Already out at or past the target there is
   nothing to pull back from, so everything moves on one curve and it simply gets smaller.
   Not on a phone: there the plain transition is what was there before and it works. */
function arcTo(v,duration=800){
  const phone=window.__isPhone||window.matchMedia('(max-width:760px)').matches;
  if(!globe||motion.matches||phone){setView(v,motion.matches?0:duration);return;}
  /* Hold the spin for the duration only. stopRotation() switched it off for good, so the globe
     sat dead still after it landed. The visitor's own choice to pause is kept in `rotating`;
     updateRotation() at the end puts it back exactly as they left it. */
  const ctl=globe.controls();ctl.autoRotate=false;
  const cur=globe.pointOfView();
  const dl=((((v.lng-cur.lng)%360)+540)%360)-180,dlat=v.lat-cur.lat,dalt=v.altitude-cur.altitude;
  const ez=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
  const pull=cur.altitude<v.altitude*.92;
  const t0=performance.now();
  const step=now=>{
    const k=Math.min(1,(now-t0)/duration),e=ez(k);
    const ea=pull?ez(Math.min(1,k*1.8)):e,er=pull?ez((k-.25)/.75):e;
    globe.pointOfView({lat:cur.lat+dlat*er,lng:cur.lng+dl*er,altitude:cur.altitude+dalt*ea},0);
    if(k<1)requestAnimationFrame(step);
    else{if(window.__dotRescale)window.__dotRescale(true);updateRotation();}
  };
  requestAnimationFrame(step);
}
function zoom(factor){stopRotation();const v=globe?globe.pointOfView():fallbackView;setView({...v,altitude:Math.max((window.__zoomLimits||{}).min||1.15,Math.min((window.__zoomLimits||{}).max||3.3,v.altitude*factor))},300);}
/* The three pulsing rings are gone. They sat on hard-coded coordinates - Loudoun, Dallas,
   Phoenix - with no record behind them, so they drew the eye to three spots for no reason and
   implied something was happening there that the data never said. */
function rings(){return [];}
// Draw exact geographic data onto a locally generated equirectangular texture.
function makeTexture(){
const c=document.createElement('canvas');c.width=window.matchMedia('(max-width:900px), (pointer:coarse)').matches?2048:4096;c.height=c.width/2;const ctx=c.getContext('2d');ctx.fillStyle='#eeeade';ctx.fillRect(0,0,c.width,c.height);
const project=([lon,lat])=>[(lon+180)/360*c.width,(90-lat)/180*c.height];
const trace=ring=>{ctx.beginPath();ring.forEach((p,i)=>{const[x,y]=project(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();};
countries.land.forEach(f=>{const polys=f.type==='Polygon'?[f.coordinates]:f.coordinates;polys.forEach(poly=>poly.forEach((ring,i)=>{trace(ring);ctx.fillStyle=i?'#eeeade':'#d9dacc';ctx.fill();ctx.lineWidth=1.15;ctx.strokeStyle='#a5a998';ctx.stroke();}));});
ctx.strokeStyle='#b0b3a252';ctx.lineWidth=.65;for(let lon=-180;lon<180;lon+=15){const x=(lon+180)/360*c.width;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}for(let lat=-75;lat<=75;lat+=15){const y=(90-lat)/180*c.height;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}
ctx.strokeStyle='#acaf9e';ctx.lineWidth=.8;countries.states.forEach(f=>{const polys=f.type==='Polygon'?[f.coordinates]:f.coordinates;polys.forEach(poly=>poly.forEach(ring=>{trace(ring);ctx.stroke();}));});return c.toDataURL('image/png');
}
/* THE SPHERE BOX. The live globe's disc is inscribed in the square (--sphere-x, --sphere-y, --sphere-d),
   measured in the frame's own containing block — that square is what the camera's view offset below is built
   from. A hidden probe resolves it exactly as CSS does (same clamps, same media queries), so the still <img>,
   the 2D fallback and the WebGL camera all land on the same circle at every screen size. */
let sphereBoxCache=null;
function sphereBox(){if(sphereBoxCache)return sphereBoxCache;
const p=document.createElement('div');p.setAttribute('aria-hidden','true');
p.style.cssText='position:absolute;height:0;visibility:hidden;pointer-events:none;left:var(--sphere-x);top:var(--sphere-y);width:var(--sphere-d)';
frame.parentNode.appendChild(p);const cs=getComputedStyle(p);sphereBoxCache={x:parseFloat(cs.left),y:parseFloat(cs.top),d:parseFloat(cs.width)};p.remove();
return sphereBoxCache;}
// Perspective fallback uses the same 45-degree camera and position as globe.gl, and the same sphere box,
// so a WebGL failure leaves the composition exactly where the still image had it.
function drawFallback(){
const w=frame.clientWidth,h=frame.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2);fallback.width=Math.round(w*dpr);fallback.height=Math.round(h*dpr);const ctx=fallback.getContext('2d');ctx.scale(dpr,dpr);const box=sphereBox(),distance=1+fallbackView.altitude,R=box.d/2,focal=R*Math.sqrt(distance*distance-1),cx=box.x+R,cy=box.y+R,deg=Math.PI/180,phi=fallbackView.lat*deg,lambda=fallbackView.lng*deg;
function project([lon,lat]){const a=lat*deg,b=lon*deg-lambda,x=Math.cos(a)*Math.sin(b),y=Math.cos(phi)*Math.sin(a)-Math.sin(phi)*Math.cos(a)*Math.cos(b),z=Math.sin(phi)*Math.sin(a)+Math.cos(phi)*Math.cos(a)*Math.cos(b);return[cx+focal*x/(distance-z),cy-focal*y/(distance-z),z-1/distance];}
ctx.beginPath();ctx.arc(cx,cy,R,0,2*Math.PI);ctx.fillStyle='#eeeade';ctx.fill();ctx.save();ctx.clip();
function path(ring,fill){let started=false,back=0;ctx.beginPath();for(const p of ring){const[x,y,z]=project(p);if(z<0){back++;started=false;continue;}if(started)ctx.lineTo(x,y);else{ctx.moveTo(x,y);started=true;}}if(fill&&back===0){ctx.closePath();ctx.fill();}ctx.stroke();}
ctx.fillStyle='#d9dacc';ctx.strokeStyle='#a5a998';ctx.lineWidth=.65;countries.land.forEach(f=>{const polys=f.type==='Polygon'?[f.coordinates]:f.coordinates;polys.forEach(poly=>poly.forEach(ring=>path(ring,true)));});
ctx.lineWidth=.4;ctx.strokeStyle='#b0b3a280';for(let lon=-180;lon<180;lon+=15){const a=[];for(let lat=-90;lat<=90;lat+=2)a.push([lon,lat]);path(a,false);}for(let lat=-75;lat<=75;lat+=15){const a=[];for(let lon=-180;lon<=180;lon+=2)a.push([lon,lat]);path(a,false);}
ctx.lineWidth=.4;ctx.strokeStyle='#acaf9e';countries.states.forEach(f=>{const polys=f.type==='Polygon'?[f.coordinates]:f.coordinates;polys.forEach(poly=>poly.forEach(ring=>path(ring,false)));});
visibleLocations().forEach(p=>{const[x,y,z]=project([p.lng,p.lat]);if(z<0)return;ctx.beginPath();ctx.arc(x,y,R*(p.type==='project'?.0063:.0030),0,Math.PI*2);ctx.fillStyle=dotColor(p);ctx.fill();});
const shade=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.3,cx,cy,R);shade.addColorStop(0,'#ffffff00');shade.addColorStop(.8,'#49503f03');shade.addColorStop(1,'#41453725');ctx.fillStyle=shade;ctx.fillRect(cx-R,cy-R,R*2,R*2);ctx.restore();
}
function resize(){sphereBoxCache=null;if(globe)globe.width(frame.clientWidth).height(frame.clientHeight);if(!mapReady&&!fallback.classList.contains('hidden'))drawFallback();}
/* No 2D stand-in on the way in any more: the still image is already on screen and already correct.
   showFallback() is for the two ways the live globe can fail — no WebGL, or a lost context. */
function showFallback(){if(poster)poster.remove();sphereBoxCache=null;drawFallback();fallback.classList.remove('hidden');}
try{
if(typeof Globe!=='function')throw new Error('Globe library unavailable');
globe=new Globe(host,{animateIn:false,rendererConfig:{antialias:true,alpha:true,powerPreference:'low-power'}})
.width(frame.clientWidth).height(frame.clientHeight).backgroundColor('rgba(0,0,0,0)').atmosphereColor('#a8d4ff').atmosphereAltitude(0.10).showAtmosphere(false).globeImageUrl(window.__paperTex=makeTexture())
.pointsData(visibleLocations()).pointLat('lat').pointLng('lng').pointColor(dotColor).pointRadius(dotSize).pointAltitude(dotAlt).pointResolution(8).pointsMerge(false).pointsTransitionDuration(0).pointLabel('')
.onPointHover(p=>showCard(p)).onPointClick(p=>{if(isTap())showCard(p,true);}).onGlobeClick((c,ev)=>{if(!isTap())return;const hit=nearestDot(ev);if(hit)showCard(hit,true);else closeCard();})
.ringsData(rings()).ringColor(()=>t=>`rgba(82,108,177,${.48*(1-t)})`).ringAltitude(.006).ringMaxRadius(2.1).ringPropagationSpeed(.6).ringRepeatPeriod(3800).onZoom(function(v){coordLabel(v);if(window.__onZoomExtra)window.__onZoomExtra(v);});
globe.globeMaterial().shininess=0;globe.globeMaterial().color.set('#ffffff');globe.globeMaterial().emissive.set('#656457');globe.globeMaterial().emissiveIntensity=.16;
globe.lights().forEach(light=>{if(light.isAmbientLight)light.intensity=2.05;if(light.isDirectionalLight)light.intensity=.8;});
window.__pov=function(){return globe?globe.pointOfView():null};
/* the risk section borrows the hero's chrome for its own globe: swap which globe the handlers drive */
window.__heroGlobe=globe;
/* globe.gl ray-casts the pointer against every object on every frame to drive hover and clicks - hundreds of tile meshes once
   zoomed in, about a quarter of the main thread during a zoom. The hero's dots are not ray-cast anyway (hover and taps go
   through nearestDot), so switch it off and handle the one thing it still did: a tap on the globe opens the nearest dot's
   card or closes the open one; a tap off the globe does nothing, as before. */
globe.enablePointerInteraction(false);
host.addEventListener('click',function(ev){if(globe!==window.__heroGlobe||!isTap())return;var hit=nearestDot(ev);if(hit){showCard(hit,true);return;}var r=host.getBoundingClientRect();if(globe.toGlobeCoords(ev.clientX-r.left,ev.clientY-r.top))closeCard();});
(function(){var hg=globe;if(!hg.pointsData().length)hg.pointsData([{lat:0,lng:0,type:'report'}]);heroDots.init(hg,function(){hg.pointsData([]);heroDots.data(visibleLocations());heroDots.color();});})();
window.__useGlobe=function(g){globe=g||window.__heroGlobe;window.__activePickGlobe=globe;updateRotation();};window.__showCard=showCard;window.__closeCard=closeCard;window.__coordLabel=coordLabel;window.__isRotating=function(){return rotating;};
window.__heroSatelliteDots=function(){return heroDots.satellite();};
window.__pickGlobeDot=function(g,el,event){return nearestDot(event,undefined,g,el);};
window.__prepSpace=function(){if(!globe||window.__spaceReady)return;if(!window.__SAT||!window.__TOPO_IMG||!window.__WATER_IMG){setTimeout(window.__prepSpace,100);return;}/* pictures are defined further down the file */var m=globe.globeMaterial();if(!m||!m.map)return;
var T=m.map.constructor;var mk=function(img){var t=new T(img);t.anisotropy=globe.renderer().capabilities.getMaxAnisotropy();t.needsUpdate=true;try{globe.renderer().initTexture(t);}catch(e){}return t;};
var si=window.__SAT_IMG||new Image();if(si.complete&&si.naturalWidth)window.__satTex=mk(si);else{si.addEventListener('load',function(){window.__satTex=mk(si);});if(!si.src)si.src=window.__SAT;}
if(window.__TOPO_IMG.complete)window.__topoTex=mk(window.__TOPO_IMG);else window.__TOPO_IMG.onload=function(){window.__topoTex=mk(window.__TOPO_IMG);};
if(window.__WATER_IMG.complete)window.__waterTex=mk(window.__WATER_IMG);else window.__WATER_IMG.onload=function(){window.__waterTex=mk(window.__WATER_IMG);};
window.__paperMap=m.map;window.__spaceReady=true;};
window.__voAnim=function(from,to,D){var t0=performance.now();var hb=document.querySelector('.hero').getBoundingClientRect();
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
var st=function(now){var k=Math.min(1,(now-t0)/D);var v=from+(to-from)*ease(k);
try{globe.camera().setViewOffset(hb.width,hb.height,-v,0,hb.width,hb.height);}catch(e){}
if(k<1)requestAnimationFrame(st);};requestAnimationFrame(st);};
/* ENTRANCE / EXIT CHOREOGRAPHY. One clock (D), one ease, for everything: the camera, the sky, the skin, the
   atmosphere and the lights all move on the same curve, and the CSS panel/background use the same duration and
   bezier. The sky is a GPU-preloaded texture faded in via scene.backgroundIntensity, the paper skin cross-fades
   into the satellite skin through the same overlay mesh the exit already used. Nothing pops. */
/* One clock for the whole move: the globe reads its progress from the sweep's own CSS transition every frame, so the two
   stay locked however late the first frame is or however many frames the phone drops. Falls back to its own time if
   there is no transition to read; once the transition it was following has finished, the move is done. */
var __sweepK=function(st,now,dur){var el=document.querySelector('.hero .space-bg'),an=null;if(el&&el.getAnimations){var A=el.getAnimations();for(var i=0;i<A.length;i++){if(A[i].transitionProperty==='transform'){an=A[i];break;}}}
var k;if(an&&an.currentTime!=null){st.seen=true;k=an.currentTime/dur;}else if(st.seen){k=1;}else{if(st.t0==null)st.t0=now;k=(now-st.t0)/dur;}
k=Math.max(st.k||0,Math.min(1,Math.max(0,k)));st.k=k;return k;};
var __D=1800,__ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;},__EQ=303;
window.__mkSky=function(){if(window.__skyR||!window.__paperMap||!window.__skyImg||!window.__skyImg.complete)return;
try{var T=window.__paperMap.constructor;var t=new T(window.__skyImg);t.mapping=__EQ;t.colorSpace='srgb';t.needsUpdate=true;window.__skyTex3=t;
/* A second, sky-only view of the same scene: the panel canvas shows the sky through the SAME camera orientation and
   the same square view offset as the globe, every frame. The globe canvas itself stays transparent, so the panel can
   be revealed by the sweep while the stars are already turning with the spin. */
var cv=document.querySelector('.sky-canvas');if(!cv)return;var R=globe.renderer().constructor,S=globe.scene().constructor,C=globe.camera().constructor;
var r=new R({canvas:cv,antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
var sc2=new S();sc2.background=t;var c2=new C(45,1,0.1,100);window.__skyR=r;window.__skyScene=sc2;window.__skyCam=c2;window.__skySize=[0,0];
r.render(sc2,c2);/* warm the context + cubemap conversion now, not on click */}catch(e){}};
window.__renderSky=function(){var r=window.__skyR;if(!r||!globe)return;var hero=document.getElementById('hero-sec');
if(hero.classList.contains('chrome-only'))return;if(!(hero.classList.contains('globe-mode')||performance.now()<(window.__skyUntil||0)))return;
var cam=globe.camera(),c2=window.__skyCam;var W=frame.clientWidth,H=frame.clientHeight;
if(window.__skySize[0]!==W||window.__skySize[1]!==H){r.setSize(W,H,false);window.__skySize=[W,H];}
c2.quaternion.copy(cam.quaternion);c2.fov=cam.fov;c2.aspect=1;var v=cam.view;if(v&&v.enabled){c2.setViewOffset(v.fullWidth,v.fullHeight,v.offsetX,v.offsetY,v.width,v.height);}else c2.clearViewOffset();
/* the stars depend only on where the camera faces: a straight zoom or a still globe leaves them unchanged, so skip the
   second full-screen render until the direction, lens or frame actually changes. 4 decimals of the quaternion is about
   0.01 degree, a fifth of a pixel of star movement: the idle spin redraws every ~10 frames instead of every frame. */
var q=cam.quaternion,key=q.x.toFixed(4)+','+q.y.toFixed(4)+','+q.z.toFixed(4)+','+q.w.toFixed(4)+','+cam.fov+','+(v&&v.enabled?[v.fullWidth,v.fullHeight,v.offsetX,v.offsetY,v.width,v.height].map(function(x){return Math.round(x*10)}).join(','):'-')+','+W+','+H;
if(key===window.__skyKey)return;window.__skyKey=key;c2.updateProjectionMatrix();r.render(window.__skyScene,c2);};
var __wrapMesh=function(){var gm=globe.globeMaterial();var mesh=null;globe.scene().traverse(function(o){if(!mesh&&o.material===gm)mesh=o;});
if(mesh&&window.__paperMap&&!window.__wrap){var M=gm.constructor;var wm=new M({map:window.__paperMap,transparent:true,opacity:0,shininess:gm.shininess||0,emissiveIntensity:gm.emissiveIntensity||0});try{wm.color.copy(gm.color);wm.emissive.copy(gm.emissive);}catch(e){}
/* the shell sits 0.2% above the surface, about what a phone's depth buffer resolves at exit distance: without an offset the
   satellite surface and tiles flicker through it as it fades */wm.polygonOffset=true;wm.polygonOffsetFactor=-4;wm.polygonOffsetUnits=-4;
window.__wrap=mesh.clone();window.__wrap.material=wm;window.__wrap.scale.multiplyScalar(1.002);mesh.parent.add(window.__wrap);}return window.__wrap;};
var __atmo=function(){var a=null;globe.scene().traverse(function(o){if(!a&&o.__globeObjType==='atmosphere')a=o;});return a;};
var __lights=function(k){globe.lights().forEach(function(l){if(l.isAmbientLight)l.intensity=2.05+(2.5-2.05)*k;if(l.isDirectionalLight)l.intensity=.8+(1.3-.8)*k;});};
var __seg=function(e,a,b){return Math.max(0,Math.min(1,(e-a)/(b-a)));};
/* SATELLITE TILES (globe mode). Real imagery tiles replace the JPEG skin while in globe mode, so the far view and the
   street-level view are the same imagery. Provider: Esri World Imagery (attribution shown in .tile-attr). */
window.__tileUrl=function(x,y,l){return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+l+'/'+y+'/'+x;};
/* Paints a tile engine's placeholder sphere the way the engine paints its tiles: same lit material, same sRGB colour
   space, and (once built) the same Esri imagery. A tile landing on it is then indistinguishable from what was beneath. */
window.__paintPlaceholder=function(g,ph){if(!g||!ph||ph.__litSkin||!window.__satTex)return false;
var T=window.__satTex.constructor;var src=window.__esriBase||window.__satTex.image;var st=new T(src);st.colorSpace='srgb';try{st.anisotropy=g.renderer().capabilities.getMaxAnisotropy();}catch(e){}st.needsUpdate=true;
var PM=g.globeMaterial().constructor;var lit=new PM({map:st,shininess:0,emissiveIntensity:0,polygonOffset:true,polygonOffsetUnits:3,polygonOffsetFactor:1});try{lit.specular.set('#000000');}catch(e){}
ph.material=lit;ph.__litSkin=true;ph.__baseIsEsri=!!window.__esriBase;ph.rotation.y=-Math.PI/2;ph.scale.setScalar(0.998/0.99);window.__placeholders=(window.__placeholders||[]).concat([ph]);return true;};
globe.globeTileEngineMaxLevel(18);
var __tuneTiles=function(){try{var te=window.__tileEngine;if(!te){globe.scene().traverse(function(o){if(!te&&o&&('tileUrl' in o)&&('maxLevel' in o)&&Array.isArray(o.thresholds))te=o;});
if(!te)return;te.minLevel=3;te.thresholds=te.thresholds.map(function(v){return v*(window.__isPhone?1:2);});window.__tileEngine=te;
/* globe.gl removes discarded tile meshes but only disposes their children. The tile itself owns
   the geometry, material and image texture, so repeated deep zooms otherwise keep every GPU
   allocation alive even after globeTileEngineClearCache(). Release those on tile removal. */
var removeTile=te.remove;te.remove=function(obj){var tile=obj&&obj.parent===te&&obj.isMesh&&obj.material&&obj.material.type==='MeshLambertMaterial';var result=removeTile.apply(this,arguments);if(tile){if(obj.geometry)obj.geometry.dispose();if(obj.material.map)obj.material.map.dispose();obj.material.dispose();}return result;};}
/* The engine's placeholder sphere (under the tiles while they load) is black by default: paint it so a slow or
   throttled tile server never shows a black planet. */
var ph=null;te.children.forEach(function(c){if(!ph&&c.isMesh&&c.geometry&&c.geometry.type==='SphereGeometry')ph=c;});
window.__paintPlaceholder(globe,ph);}catch(e){}};
/* TILE UPLOAD GATE. When a zoom crosses into a new tile level, every tile that has finished downloading is decoded and
   uploaded to the GPU in the same frame (176 of them at level 4, a frame over a second long): the pause while zooming in.
   Each tile image is decoded off the main thread first (img.decode), then at most 6 are uploaded per frame on a phone (12 on
   desktop). A count, not a time budget: the upload call returns at once and the GPU pays for it later, so timing it lets
   everything through. A tile
   waiting its turn stays hidden, so the coarser tile under it keeps showing and detail fills in instead of freezing. */
(function(){var sc=globe.scene(),prev=sc.onBeforeRender;sc.onBeforeRender=function(){if(prev)prev.apply(this,arguments);var te=window.__tileEngine;if(!te||!te.tileUrl||globe!==window.__heroGlobe)return;
var r=globe.renderer(),budget=window.__isPhone?6:12;te.traverse(function(o){if(!o.isMesh||!o.material||o.material.type!=='MeshLambertMaterial')return;var tex=o.material.map;if(!tex||!tex.image)return;
var tp=r.properties.get(tex);if(tp.__version===tex.version){if(o.userData.__gated){o.visible=true;o.userData.__gated=false;}return;}
var ud=tex.userData;if(!ud.__dec){var img=tex.image;if(img.decode){ud.__dec=1;img.decode().then(function(){ud.__dec=2;},function(){ud.__dec=2;});}else ud.__dec=2;}
if(ud.__dec===2&&budget>0){budget--;try{r.initTexture(tex);}catch(e){}o.visible=true;o.userData.__gated=false;}else{o.visible=false;o.userData.__gated=true;}});};})();
window.__homeZoom={min:1.15,max:3.3};window.__tiles=function(on){var c=globe.controls(),cam=globe.camera();
if(on){__tuneTiles();if(window.__tileEngine)window.__tileEngine.maxLevel=window.__isPhone?16:18;globe.globeTileEngineUrl(window.__tileUrl);c.minDistance=100.012;c.enableZoom=true;window.__zoomLimits={min:0.00012,max:5};}
else{c.enableZoom=false;window.__zoomLimits=window.__homeZoom;}  /* near/minDistance are restored late in the exit, once the camera is far enough out */
cam.updateProjectionMatrix();};
/* Resizing the 1,250 dot meshes is a full rebuild, so it never runs mid-gesture: wait until the zoom has settled. */
var __lastK=1,__dotTimer=null;
/* Pulled out of the timer so a camera animation can force it the instant it lands. Waiting for
   the 250ms debounce left the dots at their zoomed-in scale - pencil marks - for a beat after
   the globe had already stopped. */
window.__dotRescale=function(force){if(!globe)return;var cur=globe.pointOfView();var kk=Math.max(0.006,Math.min(1,cur.altitude/1.15));
if(heroDots.on&&globe===window.__heroGlobe){__lastK=kk;heroDots.scale(kk);return;}
if(globe.__riskDots){__lastK=kk;globe.__riskDots.scale(kk);return;}
if(!force&&Math.abs(Math.log(kk/__lastK))<0.3)return;__lastK=kk;
globe.pointRadius(function(p){return (window.__dotSize?window.__dotSize(p):(p.type==='project'?.30:.135))*kk;}).pointAltitude(function(p){return dotAlt(p)*kk;});};
window.__onZoomExtra=function(v){if(!globe||!v)return;var k=Math.max(0.006,Math.min(1,v.altitude/1.15));
if(heroDots.on&&globe===window.__heroGlobe){__lastK=k;heroDots.scale(k);return;}
if(globe.__riskDots){__lastK=k;globe.__riskDots.scale(k);return;}
if(Math.abs(Math.log(k/__lastK))<0.3)return;
clearTimeout(__dotTimer);__dotTimer=setTimeout(function(){window.__dotRescale(false);},250);};
let flyToken=0;
window.__cancelFly=function(){++flyToken;if(globe)globe.pointOfView(globe.pointOfView(),0);};
window.__flyTo=function(lat,lng,label){if(!globe)return;var ticket=++flyToken,hero=document.getElementById('hero-sec');
try{globe.htmlElementsData([{lat:lat,lng:lng,label:label||''}]).htmlElement(function(d){var el=document.createElement('div');el.className='fly-pin';el.innerHTML='<i></i><span>'+(d.label||'').replace(/</g,'&lt;')+'</span>';return el;}).htmlAltitude(0.0002);}catch(e){}
var go=function(){if(ticket!==flyToken)return;var d0=performance.now();var wait=function(){if(ticket!==flyToken)return;if(window.__camAnim&&performance.now()-d0<4000)return setTimeout(wait,100);globe.pointOfView({lat:lat,lng:lng,altitude:0.0009},2600);};wait();};
if(!hero.classList.contains('globe-mode')){document.getElementById('view-globe').click();setTimeout(go,300);}else go();};
window.__focusTo=function(lat,lng,z){if(!globe)return false;var ticket=++flyToken,hero=document.getElementById('hero-sec');if(!hero)return false;try{stopRotation();}catch(e){}var alt=Math.max(0.008,Math.min(3.2,0.012*Math.pow(1.6,16-z)));var go=function(){if(ticket!==flyToken)return;var d0=performance.now();var wait=function(){if(ticket!==flyToken)return;if(window.__camAnim&&performance.now()-d0<4000)return setTimeout(wait,100);try{stopRotation();}catch(e){}globe.pointOfView({lat:lat,lng:lng,altitude:alt},2200);};wait();};if(!hero.classList.contains('globe-mode')){var b=document.getElementById('view-globe');if(b)b.click();/* the open animation flies the camera too; wait until it has started and finished, or it overrides this fly-to */var t1=performance.now(),after=function(){if(ticket!==flyToken)return;if(!hero.classList.contains('globe-mode')&&performance.now()-t1<8000)return setTimeout(after,100);setTimeout(go,(window.__satFlightDuration||1800)+250);};after();}else go();return true;};
window.__setSat=function(on){if(!globe)return;
var flightStart=globe.pointOfView(),flightTurn=on?(((-97-flightStart.lng)%360)+360)%360+360:-((((flightStart.lng-home.lng)%360)+360)%360+360);
var flightDuration=Math.round(__D*Math.abs(flightTurn)/360);window.__satFlightDuration=flightDuration;
document.getElementById('hero-sec').style.setProperty('--globe-flight-ms',flightDuration+'ms');
if(on)globe.controls().maxDistance=1100;window.__tiles&&window.__tiles(on);
var m=globe.globeMaterial();var sc=globe.scene();
if(window.__camAnim)cancelAnimationFrame(window.__camAnim);window.__camAnim=null;
if(on){
window.__mkSky();var ctl=globe.controls();var hadAuto=ctl.autoRotate;ctl.autoRotate=false;
var wrap=__wrapMesh();if(wrap){wrap.material.opacity=1;wrap.visible=true;}          /* paper stays on top while the satellite skin goes underneath */
if(window.__satTex){m.map=window.__satTex;m.bumpMap=window.__topoTex||null;m.bumpScale=8;m.specularMap=window.__waterTex||null;m.shininess=12;try{m.specular.set('#334455');}catch(e){}m.emissiveIntensity=0;m.needsUpdate=true;}
/* no satellite texture yet: stay on the paper skin. Loading it here finished whenever it finished, sometimes after the
   exit had put the paper back, and left a satellite Earth on the homepage. */
globe.showAtmosphere(true);var at=__atmo();if(at)at.scale.setScalar(0.9);
var cur=flightStart;var clk={};var dl=flightTurn;var GA=window.__isPhone?3.4:4.42;window.__heroGA=GA;
/* instant: jump straight to the finished globe-mode state (used when the risk section hands its globe over) */
if(window.__satInstant){if(window.__satDots)window.__satDots(1);var ip=window.__satInstantPov||{lat:36,lng:-97,altitude:GA};globe.pointOfView(ip,0);if(window.__voT)window.__voT(1);if(wrap)wrap.visible=false;if(at)at.scale.setScalar(1);__lights(1);ctl.autoRotate=(typeof rotating==='undefined')?true:(rotating&&!document.hidden);return;}
var step=function(now){var k=__sweepK(clk,now,flightDuration);var e=__ease(k);
globe.pointOfView({lat:cur.lat+(36-cur.lat)*e,lng:cur.lng+dl*e,altitude:cur.altitude+(GA-cur.altitude)*e},0);if(window.__voT)window.__voT(e);
if(wrap&&wrap.visible){wrap.material.opacity=1-__seg(e,0.10,0.55);if(e>=0.55)wrap.visible=false;}
if(window.__satDots)window.__satDots(__seg(e,0.10,0.55));
if(at)at.scale.setScalar(0.9+0.1*__seg(e,0.30,1));
__lights(e);
if(k<1)window.__camAnim=requestAnimationFrame(step);
else{window.__camAnim=null;ctl.autoRotate=hadAuto;}};
window.__camAnim=requestAnimationFrame(step);}
else{
var wrap2=__wrapMesh();if(wrap2){wrap2.material.opacity=0;wrap2.visible=true;}
var ctl2=globe.controls();var hadAuto2=ctl2.autoRotate;ctl2.autoRotate=false;
var at2=__atmo();var D2=flightDuration,SKY=0;window.__skyUntil=performance.now()+D2+600;
/* the exit moves the camera closer, so the tile engine starts fetching sharper tiles that are thrown away a second later;
   each one is uploaded to the GPU mid-move (the stutter on the way back). Hold it at the level it is showing for the exit. */
if(window.__tileEngine){var te2=window.__tileEngine;te2.maxLevel=Math.max(te2.minLevel,te2.level||te2.minLevel);}
var cur2=flightStart;var clk2={};var off=false;var tilesOff=false;var pull2=!(window.__isPhone||window.matchMedia('(max-width:760px)').matches)&&cur2.altitude<home.altitude*.92;
if(window.__satInstant){if(window.__satDots)window.__satDots(0);globe.pointOfView(home,0);if(window.__voT)window.__voT(0);globe.showAtmosphere(false);if(at2)at2.scale.setScalar(1);try{globe.htmlElementsData([]);}catch(e){}try{globe.globeTileEngineUrl(null);globe.globeTileEngineClearCache();globe.controls().minDistance=165;}catch(e){}var mi=globe.globeMaterial();mi.map=window.__paperMap;mi.bumpMap=null;mi.specularMap=null;mi.shininess=0;mi.emissiveIntensity=.16;mi.needsUpdate=true;if(wrap2)wrap2.visible=false;globe.controls().maxDistance=430;ctl2.autoRotate=hadAuto2;__lights(0);return;}
var dlw=flightTurn;
var step2=function(now){var k=__sweepK(clk2,now,D2);var e=__ease(k);
var ea2=pull2?__ease(Math.min(1,k*1.7)):e,er2=pull2?__ease(Math.max(0,(k-.22)/.78)):e;
globe.pointOfView({lat:cur2.lat+(home.lat-cur2.lat)*er2,lng:cur2.lng+dlw*er2,altitude:cur2.altitude+(home.altitude-cur2.altitude)*ea2},0);
if(window.__voT)window.__voT(1-e);
if(wrap2&&wrap2.visible)wrap2.material.opacity=__seg(e,0.05,0.40);
/* once the shell is opaque the tiles under it are invisible; drop them then rather than at k=0.8 so nothing is left to flicker */
if(!tilesOff&&e>=0.40&&(!wrap2||wrap2.material.opacity>=1)){tilesOff=true;try{globe.globeTileEngineUrl(null);}catch(_){}}
if(window.__satDots)window.__satDots(1-__seg(e,0.05,0.40));
if(at2)at2.scale.setScalar(1-0.1*__seg(e,0,0.7));
__lights(1-e);
if(k>=0.8&&!off){off=true;globe.showAtmosphere(false);if(at2)at2.scale.setScalar(1);try{globe.htmlElementsData([]);}catch(e){}try{globe.globeTileEngineUrl(null);globe.globeTileEngineClearCache();globe.controls().minDistance=165;}catch(e){}
var mm=globe.globeMaterial();mm.map=window.__paperMap;mm.bumpMap=null;mm.specularMap=null;mm.shininess=0;mm.emissiveIntensity=.16;mm.needsUpdate=true;
if(wrap2)wrap2.visible=false;}
if(k<1)window.__camAnim=requestAnimationFrame(step2);else{window.__camAnim=null;globe.controls().maxDistance=430;ctl2.autoRotate=hadAuto2;if(window.__dotRescale)window.__dotRescale(true);}};
window.__camAnim=requestAnimationFrame(step2);}};
globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio||1,2));globe.camera().fov=45;globe.camera().updateProjectionMatrix();globe.pointOfView(home,0);
const controls=globe.controls();var __mq=window.matchMedia('(max-width:760px)');window.__isPhone=__mq.matches;__mq.addEventListener('change',function(e){window.__isPhone=e.matches;});controls.enablePan=false;controls.enableZoom=false;controls.rotateSpeed=.5;controls.autoRotateSpeed=-.13;controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=165;controls.maxDistance=430;
controls.addEventListener('start',()=>{stopRotation();closeCard();});
/* OrbitControls pinch/wheel scale the distance to the centre of the Earth, so near the ground one gesture covers most of the
   height above it and zooming gets wilder the closer you are. Scale zoomSpeed by the share of that distance that is height
   (alt/(1+alt)) so every gesture changes the height by the same ratio; normalised to the open-map altitude (3.4) so the feel
   up there is unchanged. The +/- buttons already step the altitude by a fixed ratio. */
window.__applyGlobeZoomRule=function(g){var c=g.controls();if(c.__homeZoomRule)return;c.__homeZoomRule=true;var update=function(){var a=c.object.position.length()/100-1;if(a>0)c.zoomSpeed=Math.min(1.2,(a/(1+a))/(3.4/4.4));};c.addEventListener('change',update);update();};
window.__applyGlobeZoomRule(globe);
/* The square view offset below is what puts the globe where the still image already is, so it has to be in
   place before the globe is ever shown: `ready` is no longer set here, handoff() sets it once apply() has run. */
globe.onGlobeReady(()=>{mapReady=true;
try{var cam=globe.camera();
/* Homepage sphere = v84's CSS box. A hidden probe resolves --sphere-d / --sphere-x exactly as v84's .globe-frame did
   (same clamps, same media queries, same containing block), so no px numbers are duplicated here. */
var probe=document.createElement('div');probe.setAttribute('aria-hidden','true');
probe.style.cssText='position:absolute;height:0;visibility:hidden;pointer-events:none;left:var(--sphere-x);top:var(--sphere-y);width:var(--sphere-d)';
frame.parentNode.appendChild(probe);var probe2=document.createElement('div');probe2.setAttribute('aria-hidden','true');probe2.style.cssText='position:absolute;height:0;visibility:hidden;pointer-events:none;left:var(--sphere-x-globe);top:var(--sphere-y-globe);width:var(--sphere-d)';frame.parentNode.appendChild(probe2);
/* The phone hero overrides --sphere-* only while the map is closed, so the home box is measured only in that state and kept;
   the open box is measured outside the hero, where that override never applies. Re-measuring on the globe-mode toggle used to
   swap the home box for the open one before the tween started, which made the globe jump before it moved. */
var heroEl=document.getElementById('hero-sec');var outer=document.createElement('div');outer.setAttribute('aria-hidden','true');outer.style.cssText='position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;overflow:hidden';document.body.appendChild(outer);outer.appendChild(probe2);
var home=null;var geo=null;var measure=function(){var r=frame.getBoundingClientRect();if(!home||!heroEl.classList.contains('globe-mode')){var cs=getComputedStyle(probe);home={SD:parseFloat(cs.width),SX:parseFloat(cs.left),SY:parseFloat(cs.top)};}outer.style.width=r.width+'px';outer.style.height=r.height+'px';var cs2=getComputedStyle(probe2);geo={W:r.width,H:r.height,SD:home.SD,SX:home.SX,SY:home.SY,SD1:parseFloat(cs2.width),SX1:parseFloat(cs2.left),SY1:parseFloat(cs2.top)};};
var voLast=0;var origUPM=cam.updateProjectionMatrix.bind(cam);
/* Every projection rebuild (globe.gl's resize/refit sets camera.aspect then calls updateProjectionMatrix) goes through
   here, so the square view offset can never be lost. t=0 home box, t=1 centered (globe-mode). */
var apply=function(){if(!geo)measure();var g=geo;var x=-(g.SX+(g.SX1-g.SX)*voLast);var y=-(g.SY+(g.SY1-g.SY)*voLast);
/* near plane follows the camera's height above the surface: keeps depth precision far out (no z-fighting between tiles, placeholder, overlay and markers) and still lets you land at street level */
var dS=cam.position.length()-100;cam.near=Math.max(0.004,Math.min(0.05,dS*0.4));
var sd=g.SD+(g.SD1-g.SD)*voLast;cam.aspect=1;var v=cam.view||(cam.view={});v.enabled=true;v.fullWidth=sd;v.fullHeight=sd;v.offsetX=x;v.offsetY=y;v.width=g.W;v.height=g.H;origUPM();};
cam.updateProjectionMatrix=apply;
window.__voT=function(t){voLast=t;apply();};
var invalidate=function(){geo=null;apply();};
new ResizeObserver(invalidate).observe(frame);window.addEventListener('resize',invalidate);window.__voInvalidate=invalidate;
(function tick(){if(globe&&globe.camera()===cam)apply();if(window.__renderSky)window.__renderSky();requestAnimationFrame(tick);})();
apply();}catch(e){}
globe.pointOfView(home,0);globeReady=true;handoff();
var skp=new Image();window.__skyImg=skp;window.__skyTex=true;(function setSky(){if(window.__SKY)skp.src=window.__SKY;else setTimeout(setSky,50);})();
/* Base picture for globe mode, built from Esri's own coarse tiles on page load: the same imagery the sharp tiles come
   from, so a tile landing on it sharpens what is there instead of replacing a different picture. Poles above 85 degrees
   (outside the tile scheme) keep the built-in satellite JPEG. */
try{(function buildBase(){var L=2,n=1<<L,merc=document.createElement('canvas');merc.width=merc.height=256*n;var mc=merc.getContext('2d');var left=n*n,failed=false;
var done=function(){if(--left>0||failed)return;var tries=0;var go=function(){var si=window.__satTex&&window.__satTex.image;if(!si&&tries++<40)return setTimeout(go,250);
try{var W=2048,H=1024,c=document.createElement('canvas');c.width=W;c.height=H;var cx=c.getContext('2d');if(si)cx.drawImage(si,0,0,W,H);else{cx.fillStyle='#000';cx.fillRect(0,0,W,H);}
var MH=merc.height;for(var r=0;r<H;r++){var lat=90-(r+.5)/H*180;if(Math.abs(lat)>=85.05)continue;var y=(1-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))/Math.PI)/2*MH;cx.drawImage(merc,0,Math.max(0,Math.min(MH-1,y)),merc.width,1,0,r,W,1);}
cx.getImageData(0,0,1,1);window.__esriBase=c;
(window.__placeholders||[]).forEach(function(ph){if(ph.__baseIsEsri||!ph.material.map)return;var T=ph.material.map.constructor;var t=new T(c);t.colorSpace='srgb';t.anisotropy=ph.material.map.anisotropy;t.needsUpdate=true;ph.material.map=t;ph.material.needsUpdate=true;ph.__baseIsEsri=true;});}catch(e){}};go();};
for(var tx=0;tx<n;tx++)for(var ty=0;ty<n;ty++)(function(tx,ty){var ti=new Image();ti.crossOrigin='anonymous';ti.onload=function(){try{mc.drawImage(ti,tx*256,ty*256);}catch(e){failed=true;}done();};ti.onerror=function(){failed=true;done();};ti.src=window.__tileUrl(tx,ty,L);})(tx,ty);})();}catch(e){}
setTimeout(function(){if(window.__prepSpace)window.__prepSpace();var warmTries=0;var warm=function(){warmTries++;if(warmTries>150)return;
if(!globe||!window.__satTex||!window.__topoTex||!window.__waterTex){setTimeout(warm,400);return;}
var m=globe.globeMaterial();if(!m||!m.map){setTimeout(warm,400);return;}
var keep={map:m.map,b:m.bumpMap,sp:m.specularMap,sh:m.shininess,e:m.emissiveIntensity};
try{m.map=window.__satTex;m.bumpMap=window.__topoTex;m.specularMap=window.__waterTex;m.needsUpdate=true;
globe.showAtmosphere(true);globe.renderer().compile(globe.scene(),globe.camera());}catch(e){}
finally{try{globe.showAtmosphere(false);}catch(e){}m.map=keep.map;m.bumpMap=keep.b;m.specularMap=keep.sp;m.shininess=keep.sh;m.emissiveIntensity=keep.e;m.needsUpdate=true;/* the satellite tiles (Lambert + sRGB map) and the tile engine's placeholder (Phong + sRGB map) get their materials on the
   first open, so their shaders compiled in the middle of that move. Compile the same two programs now, and keep the
   stand-in materials alive so three.js keeps the programs cached for the real ones. */
try{var gmesh=null,dmesh=null;globe.scene().traverse(function(o){if(!gmesh&&o.isMesh&&o.material===globe.globeMaterial())gmesh=o;if(!dmesh&&o.__heroDots)dmesh=o;});
if(gmesh&&dmesh&&!window.__warmMats){var T=m.map.constructor,cv=document.createElement('canvas');cv.width=cv.height=4;var tx=new T(cv);tx.colorSpace='srgb';tx.needsUpdate=true;
window.__warmMats=[new dmesh.material.constructor({map:tx}),new gmesh.material.constructor({map:tx})];var tmp=window.__warmMats.map(function(mm){var x=new gmesh.constructor(gmesh.geometry,mm);gmesh.parent.add(x);return x;});
var wr=__wrapMesh();if(wr){wr.material.opacity=0;wr.visible=true;}   /* the paper shell is transparent Phong: made here, not on the first open */
globe.renderer().compile(globe.scene(),globe.camera());tmp.forEach(function(x){x.parent.remove(x);});if(wr)wr.visible=false;}}catch(e){}
window.__warmed=true;if(window.__mkSky)window.__mkSky();}};
setTimeout(warm,500);},1200);});
host.querySelector('canvas')?.addEventListener('webglcontextlost',()=>{mapReady=false;showFallback();host.classList.remove('ready');globe.pauseAnimation();globe=undefined;document.getElementById('rotation-toggle').disabled=true;document.querySelector('#interaction-hint span').textContent='Map preview · use the full tracker to explore.';});
updateRotation();
}catch(error){if(globe){try{globe._destructor();}catch(_){}}globe=undefined;showFallback();document.getElementById('rotation-toggle').disabled=true;document.querySelector('#interaction-hint span').textContent='Map preview · use the full tracker to explore.';console.warn('Using embedded map fallback:',error.message);}
new ResizeObserver(resize).observe(frame);
document.getElementById('view-globe').addEventListener('click',e=>{e.preventDefault();frame.focus({preventScroll:true});});
/* tapping the homepage globe does nothing; only Open the globe opens it (owner's call, Oct 2026) */
document.querySelector('.globe-tap').addEventListener('click',()=>{document.getElementById('view-globe').click();});
/* phone: the globe renders in the slot between the headline and the body; the "View the globe" chip lives in the slot */
(function(){var slot=document.querySelector('.globe-slot');if(!slot||!window.__isPhone||getComputedStyle(slot).display==='none')return;var sec=document.querySelector('.actions .secondary');if(sec)slot.appendChild(sec);
var hero=document.getElementById('hero-sec');var sync=function(){var h=hero.getBoundingClientRect(),r=slot.getBoundingClientRect();document.documentElement.style.setProperty('--sphere-y',(r.top-h.top)+'px');document.documentElement.style.setProperty('--sphere-x',(r.left-h.left)+'px');document.documentElement.style.setProperty('--sphere-d',r.width+'px');if(window.__voInvalidate)window.__voInvalidate();};
new ResizeObserver(sync).observe(slot);window.addEventListener('resize',sync);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(sync);sync();})();
new MutationObserver(()=>{var on=document.getElementById('hero-sec').classList.contains('globe-mode');if(window.__voInvalidate)window.__voInvalidate();
/* opening the map before the handoff: the still is framed for the homepage box, not the globe-mode one, so
   give the live globe over as soon as it can take it. Until it can, the still stays — never a blank stage. */
if(on&&!handedOff){dataReady=true;handoff();}if(!window.__isPhone)return;if(document.getElementById('hero-sec').classList.contains('hero-overlay'))return;if(on){window.scrollTo({top:0,behavior:'smooth'});setTimeout(function(){if(document.getElementById('hero-sec').classList.contains('globe-mode'))document.body.classList.add('globe-open');},500);}else document.body.classList.remove('globe-open');}).observe(document.getElementById('hero-sec'),{attributes:true,attributeFilter:['class']});
function toggleLayer(type,id){activeType[type]=!activeType[type];document.getElementById(id).setAttribute('aria-pressed',String(activeType[type]));closeCard();applyData();}
document.getElementById('reports-toggle').addEventListener('click',()=>toggleLayer('report','reports-toggle'));
document.getElementById('projects-toggle').addEventListener('click',()=>toggleLayer('project','projects-toggle'));
document.getElementById('blocked-toggle').addEventListener('click',()=>toggleLayer('blocked','blocked-toggle'));
document.getElementById('zoom-in').addEventListener('click',()=>zoom(.86));document.getElementById('zoom-out').addEventListener('click',()=>zoom(1.16));
document.getElementById('reset-view').addEventListener('click',()=>{closeCard();arcTo(home,800);});
document.getElementById('rotation-toggle').addEventListener('click',()=>{rotating=!rotating;closeCard();updateRotation();});
document.getElementById('close-card').addEventListener('click',()=>{closeCard();frame.focus({preventScroll:true});});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCard();});
frame.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'];if(!keys.includes(e.key))return;e.preventDefault();stopRotation();closeCard();const v=globe?globe.pointOfView():fallbackView;if(e.key==='Home'){arcTo(home,800);return;}if(e.key==='+'||e.key==='='){zoom(.86);return;}if(e.key==='-'){zoom(1.16);return;}const next={...v};if(e.key==='ArrowLeft')next.lng-=10;if(e.key==='ArrowRight')next.lng+=10;if(e.key==='ArrowUp')next.lat=Math.min(75,v.lat+8);if(e.key==='ArrowDown')next.lat=Math.max(-75,v.lat-8);setView(next,200);});
motion.addEventListener('change',()=>{rotating=false;if(globe)globe.ringsData(rings());updateRotation();});
document.addEventListener('visibilitychange',()=>{if(globe){if(document.hidden)globe.pauseAnimation();else globe.resumeAnimation();}updateRotation();});
window.addEventListener('pagehide',()=>{if(globe)globe.pauseAnimation();});window.addEventListener('pageshow',()=>{if(globe)globe.resumeAnimation();updateRotation();});
})();
