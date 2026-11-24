const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:390,height:745},isMobile:true,hasTouch:true});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8787/');await p.waitForFunction(()=>window.__warmed,null,{timeout:30000});await p.waitForTimeout(3000);
console.log('locations loaded:',await p.evaluate(()=>(window.__locations||[]).length),' GDC.siteFacts:',await p.evaluate(()=>typeof (window.GDC&&GDC.siteFacts)));
const f=await p.evaluate(()=>{const x=GDC.siteFacts({lat:39.0438,lng:-77.4874,label:'Ashburn, Virginia'});return JSON.stringify(x).slice(0,600)});console.log('siteFacts(Ashburn):',f);
const near=await p.evaluate(()=>{const R=6371,rad=Math.PI/180;const d=(a,b)=>{const dl=(b.lat-a.lat)*rad,dn=(b.lng-a.lng)*rad;const h=Math.sin(dl/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};const A={lat:39.0438,lng:-77.4874};return (window.__locations||[]).filter(x=>d(A,x)<25).length});console.log('globe dots within 25km of Ashburn:',near);
console.log('errors:',errs.length?errs:'none');await b.close();})();
