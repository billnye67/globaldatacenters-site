const {chromium,webkit}=require('playwright');
(async()=>{
 const browser=await (process.argv.includes('--webkit')?webkit:chromium).launch(process.argv.includes('--webkit')?{}:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:745},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 page.on('pageerror',e=>console.log('PAGEERROR',e.message));page.on('crash',()=>console.log('CRASH'));
 let tileRequests=0;
 const tile=Buffer.from(await page.evaluate(()=>{let c=document.createElement('canvas');c.width=c.height=256;let x=c.getContext('2d');x.fillStyle='#587648';x.fillRect(0,0,256,256);for(let i=0;i<120;i++){x.fillStyle=i%2?'#827867':'#46634a';x.fillRect(Math.random()*256,Math.random()*256,8,8)}return c.toDataURL('image/jpeg',.8).split(',')[1]}),'base64');
 await page.route(/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/(tile|export)/,async route=>{tileRequests++;await route.fulfill({status:200,contentType:'image/jpeg',headers:{'access-control-allow-origin':'*'},body:tile});});
 await page.goto('http://localhost:8787/#main',{waitUntil:'load'});await page.waitForTimeout(5000);
 for(let i=0;i<(process.argv.includes('--max')?1:3);i++){
  await page.locator('.globe-tap').click();await page.waitForTimeout(2500);
  await page.evaluate(alt=>window.__heroGlobe.pointOfView({lat:38,lng:-104,altitude:alt},0),process.argv.includes('--max')?0.00012:0.0005);
  await page.waitForTimeout(5000);
  console.log('DEEP',i,tileRequests,await page.evaluate(()=>{let te=window.__tileEngine,n=0,groups={};te&&te.traverse(o=>{if(o.isMesh&&o.material?.map){n++;let p=o.geometry?.parameters,key=p?.phiLength?.toFixed(5)||'?';let x=groups[key]||(groups[key]={n:0,loaded:0});x.n++;if(o.material.map.image)x.loaded++}});return {pov:window.__pov(),tiles:n,groups,level:te?.level,cache:te?.cache?.size,mem:window.__heroGlobe.renderer().info.memory};}));
  await page.locator('#globe-back').click();await page.waitForTimeout(3300);
  console.log('BACK',i,await page.evaluate(()=>{let te=window.__tileEngine,n=0;te&&te.traverse(o=>{if(o.isMesh&&o.material?.map)n++});return {pov:window.__pov(),mode:document.querySelector('#hero-sec').classList.contains('globe-mode'),tiles:n,level:te?.level,mem:window.__heroGlobe.renderer().info.memory};}));
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
