const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64');
  await page.route('**/World_Imagery/MapServer/tile/**',r=>r.fulfill({status:200,contentType:'image/png',body:pixel}));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8788/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__rsTe&&window.__riskGlobe,{timeout:15000});
  console.log('DOT_PARENTS',await page.evaluate(()=>{const h=window.__heroGlobe,r=window.__riskGlobe;let hm=null,rm=null;h.scene().traverse(o=>{if(o.__heroDots&&!hm)hm=o;});r.pointsData([{lat:0,lng:0,type:'report'}]);r.scene().traverse(o=>{if(o.__globeObjType==='point'&&!rm)rm=o;});const d=o=>o&&({name:o.name,type:o.type,parent:o.parent?.type,parentName:o.parent?.name,position:o.parent?.position?.toArray(),rotation:o.parent?.rotation?.toArray()});return {hero:d(hm),risk:d(rm),heroChildCount:hm?.parent?.children?.length,riskChildCount:rm?.parent?.children?.length};}));
  for(const radius of [3,1.5]){
    const result=await page.evaluate(radius=>{const g=window.__riskGlobe,te=window.__rsTe;te.tileQueryRadius=radius;te.clearTiles();g.pointOfView({lat:39.0437,lng:-77.4875,altitude:.0016},0);return {radius,level:te.level,tiles:te.children.length,pixels:[g.renderer().domElement.width,g.renderer().domElement.height]};},radius);
    await page.waitForTimeout(500);
    result.loaded=await page.evaluate(()=>window.__rsTe.children.length);
    console.log(JSON.stringify(result));
  }
  console.log('ERRORS',errors);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
