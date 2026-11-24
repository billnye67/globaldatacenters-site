const {chromium, webkit}=require('playwright');
(async()=>{
 const engine=process.argv.includes('--webkit')?webkit:chromium;
 const browser=await engine.launch(engine===chromium?{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});
 const context=await browser.newContext({viewport:{width:390,height:745},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const page=await context.newPage();
 page.on('pageerror',e=>console.log('PAGEERROR',e.message));
 page.on('crash',()=>console.log('CRASH'));
 for(let i=0;i<3;i++){
  await page.goto('http://localhost:8787/#main',{waitUntil:'load'});
  await page.waitForTimeout(6500);
  console.log(JSON.stringify(await page.evaluate(()=>{
   const g=window.__heroGlobe;
   const textures=['__paperMap','__satTex','__topoTex','__waterTex','__skyTex3'].map(k=>{const t=window[k],im=t&&t.image;return {name:k,w:im&&(im.naturalWidth||im.width),h:im&&(im.naturalHeight||im.height)}});
   return {ready:document.querySelector('#globe').classList.contains('ready'),warm:window.__warmed,canvases:[...document.querySelectorAll('canvas')].map(c=>({w:c.width,h:c.height})),textures,render:g&&g.renderer().info.render,memory:g&&g.renderer().info.memory};
  })));
 }
 await page.locator('.globe-tap').click();
 await page.waitForTimeout(3000);
 console.log('OPEN',await page.evaluate(()=>({open:document.querySelector('#hero-sec').classList.contains('globe-mode'),sky:!!window.__skyR,pov:window.__pov&&window.__pov()})));
 await page.locator('#globe-back').click({force:true});
 await page.waitForTimeout(3000);
 console.log('BACK',await page.evaluate(()=>({open:document.querySelector('#hero-sec').classList.contains('globe-mode'),pov:window.__pov&&window.__pov()})));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
