const { chromium, webkit } = require('playwright');
const assert = require('assert/strict');
const { execFileSync } = require('child_process');
(async () => {
  const browser = await (process.argv.includes('--webkit') ? webkit : chromium).launch(process.argv.includes('--webkit') ? {} : {args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64');
    if(!process.argv.includes('--live'))await page.route('**/World_Imagery/MapServer/tile/**',r=>r.fulfill({status:200,contentType:'image/png',body:pixel}));
    if(process.argv.includes('--baseline')) {
      const original=execFileSync('git',['show','HEAD:globe.gl.js'],{maxBuffer:10*1024*1024});
      await page.route('**/globe.gl.js',r=>r.fulfill({contentType:'text/javascript',body:original}));
      await page.route('**/risk-render-budget.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
    }
    await page.goto('http://127.0.0.1:8788/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__rsTe&&window.__riskGlobe);
    await page.locator('#check-address').focus();
    await page.waitForTimeout(3000);
    const coverage=[];
    for(const [lat,lng,level] of process.argv.includes('--flow')?[]:[[39,-77,4],[39,-77,7],[39,-77,13],[0,179,7],[70,20,7],[-33,151,13]]) {
      await page.evaluate(({lat,lng,level})=>{
        const g=window.__riskGlobe,te=window.__rsTe;
        g.pauseAnimation();window.__heroGlobe.pauseAnimation();te.clearTiles();
        g.pointOfView({lat,lng,altitude:12/2**level},0);g.controls().update();g.camera().updateMatrixWorld();te.updatePov(g.camera());
      },{lat,lng,level});
      await page.waitForFunction(()=>!window.__rsTe.tileWorkScheduler?.pending,{timeout:20000});
      await page.waitForTimeout(250);
      const result=await page.evaluate(()=>{
        const g=window.__riskGlobe,te=window.__rsTe,L=te.level,n=2**L;
        const loaded=new Set(te.children.filter(o=>o.material?.map?.image?.src).map(o=>o.material.map.image.src.match(/tile\/(\d+)\/(\d+)\/(\d+)/)?.slice(1).join('/')));
        let samples=0,missing=0;const examples=[];
        for(let ix=1;ix<10;ix++)for(let iy=1;iy<10;iy++){
          const p=g.toGlobeCoords(g.width()*ix/10,g.height()*iy/10);if(!p)continue;
          const x=((Math.floor((p.lng+180)/360*n)%n)+n)%n;
          const rad=p.lat*Math.PI/180,y=Math.floor((1-Math.asinh(Math.tan(rad))/Math.PI)/2*n);
          if(y<0||y>=n)continue;
          samples++;if(!loaded.has(`${L}/${y}/${x}`)){missing++;if(examples.length<3)examples.push([L,y,x]);}
        }
        return {level:L,samples,missing,examples,tiles:te.children.length,pending:te.tileWorkScheduler?.pending};
      });
      coverage.push({lat,lng,...result});
    }
    console.log('COVERAGE',JSON.stringify(coverage));
    if(process.argv.includes('--baseline'))return;
    assert(coverage.every(row=>row.samples>0&&row.missing===0),'Visible map samples are missing tiles');
    await page.evaluate(()=>{window.__riskGlobe.resumeAnimation();window.__heroGlobe.resumeAnimation();});
    await page.locator('#site-globe').click({force:true});
    await page.waitForFunction(()=>document.getElementById('hero-sec').classList.contains('chrome-only'));
    await page.waitForTimeout(800);
    const open=await page.evaluate(()=>{
      const g=window.__riskGlobe;let pins=0;g.scene().traverse(o=>{if(o.__riskBatchedPin&&o.visible)pins++;});
      return {pins,calls:g.renderer().info.render.calls,individualPins:g.pointsData().length};
    });
    assert.equal(open.pins,3);assert.equal(open.individualPins,0);assert(open.calls<40);
    if(process.argv.includes('--live'))await page.screenshot({path:'tools/risk-render-open.png'});
    const hit=await page.evaluate(()=>{
      const g=window.__riskGlobe,el=document.getElementById('site-map'),rect=el.getBoundingClientRect(),cam=g.camera().position;
      g.controls().autoRotate=false;g.controls().enableDamping=false;g.controls().update();g.pauseAnimation();g.camera().updateMatrixWorld();
      el.addEventListener('click',event=>{const p=window.__pickGlobeDot(g,el,event);window.__lastTestClick={x:event.clientX,y:event.clientY,name:p&&(p.name||p.location),camera:g.pointOfView()};},{once:true});
      for(const p of window.__visibleLocations()){
        const w=g.getCoords(p.lat,p.lng);if(w.x*cam.x+w.y*cam.y+w.z*cam.z<=10000)continue;
        const q=g.getScreenCoords(p.lat,p.lng),event={clientX:Math.round(rect.left+q.x),clientY:Math.round(rect.top+q.y)};
        if(q.x<25||q.y<150||q.x>rect.width-25||q.y>rect.height-100)continue;
        const picked=window.__pickGlobeDot(g,el,event);if(picked)return {...event,name:picked.name||picked.location};
      }
    });
    assert(hit,'A visible pin is available to test');
    await page.mouse.click(hit.clientX,hit.clientY);
    console.log('PICK',JSON.stringify({expected:hit,actual:await page.evaluate(()=>window.__lastTestClick)}));
    assert.equal(await page.locator('#card-location').textContent(),hit.name);
    await page.evaluate(()=>window.__riskGlobe.resumeAnimation());
    await page.waitForTimeout(400);
    await page.locator('#close-card').click({force:true});
    await page.locator('#globe-back').click({force:true});await page.waitForTimeout(3500);
    const closed=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,overlay:document.getElementById('hero-sec').classList.contains('chrome-only'),pending:window.__rsTe.tileWorkScheduler.pending}));
    assert.equal(closed.overlay,false);assert(closed.overflow<=1);assert.deepEqual(errors,[]);
    console.log('FLOW',JSON.stringify({open,closed,errors}));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
