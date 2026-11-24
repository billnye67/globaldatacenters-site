const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64');
 await page.route('**/World_Imagery/MapServer/tile/**',r=>r.fulfill({status:200,contentType:'image/png',body:pixel}));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8788/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__heroDotMeshes&&window.__heroDotMeshes().length>0&&window.__riskGlobe,{timeout:15000});
 console.log('HERO_MESHES',await page.evaluate(()=>window.__heroDotMeshes().length));
 await page.locator('#site-globe').scrollIntoViewIfNeeded();
 await page.locator('#site-globe').click({force:true});
 await page.waitForFunction(()=>document.getElementById('hero-sec').classList.contains('globe-mode'),{timeout:10000});await page.waitForTimeout(600);
 console.log('OPEN',await page.evaluate(()=>{let n=0;window.__riskGlobe.scene().traverse(o=>{if(o.__riskBorrowed)n++;});return {borrowed:n,calls:window.__riskGlobe.renderer().info.render.calls,points:window.__riskGlobe.pointsData().length,alt:window.__riskGlobe.pointOfView().altitude};}));
 const hit=await page.evaluate(()=>{const g=window.__riskGlobe,map=document.getElementById('site-map'),r=map.getBoundingClientRect(),cam=g.camera().position;for(const p of window.__visibleLocations()){const w=g.getCoords(p.lat,p.lng,0);if(w.x*cam.x+w.y*cam.y+w.z*cam.z<=10000)continue;const q=g.getScreenCoords(p.lat,p.lng);if(q&&q.x>20&&q.y>20&&q.x<r.width-20&&q.y<r.height-20)return {x:r.left+q.x,y:r.top+q.y,name:p.name||p.location};}return null;});
 console.log('HIT',hit);if(hit){await page.mouse.click(hit.x,hit.y);console.log('CARD',await page.locator('#card-location').textContent());}
 await page.screenshot({path:'tools/risk-borrowed-dots.png'});
 await page.locator('#globe-back').click({force:true});await page.waitForTimeout(4000);
 console.log('CLOSED',await page.evaluate(()=>{let n=0;window.__riskGlobe.scene().traverse(o=>{if(o.__riskBorrowed)n++;});return {borrowed:n,calls:window.__riskGlobe.renderer().info.render.calls};}));
 console.log('ERRORS',errors);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
