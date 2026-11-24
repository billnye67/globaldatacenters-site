const {chromium,webkit}=require('playwright');
(async()=>{
  const browser=process.argv.includes('--webkit')?await webkit.launch():await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8788/'+(process.argv.includes('--perf')?'?perf=1':''),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__heroGlobe&&window.__riskGlobe,{timeout:15000});
  await page.waitForTimeout(process.argv.includes('--perf')?6500:process.argv.includes('--visibility')?3000:1000);
  console.log(JSON.stringify(await page.evaluate(()=>{
    const desc=g=>{const r=g.renderer(),c=r.domElement,ctl=g.controls();return {ratio:r.getPixelRatio(),css:[c.clientWidth,c.clientHeight],pixels:[c.width,c.height],calls:r.info.render.calls,frames:r.info.render.frame,textures:r.info.memory.textures,damping:[ctl.enableDamping,ctl.dampingFactor]};};
    return {dpr:devicePixelRatio,phoneTextures:[window.__SKY,window.__SAT],hero:desc(window.__heroGlobe),risk:desc(window.__riskGlobe),riskCleanup:!!window.__rsTe?.__riskCleanup,riskTiles:window.__rsTe?.children?.length,canvases:[...document.querySelectorAll('canvas')].map(c=>({class:c.className,id:c.id,w:c.width,h:c.height}))};
  })));
  console.log('ERRORS',errors);
  if(process.argv.includes('--levels'))console.log('LEVELS',await page.evaluate(()=>({thresholds:window.__rsTe?.thresholds,max:window.__rsTe?.maxLevel,min:window.__rsTe?.minLevel})));
  if(process.argv.includes('--visibility')){
    console.log('HOME',await page.evaluate(()=>({riskActive:window.__riskRenderActive,riskLast:window.__riskRenderLast,checkTop:Math.round(document.getElementById('check').getBoundingClientRect().top),heroFrames:window.__heroGlobe.renderer().info.render.frame,riskFrames:window.__riskGlobe.renderer().info.render.frame})));
    await page.waitForTimeout(700);
    console.log('HOME_AFTER',await page.evaluate(()=>({riskActive:window.__riskRenderActive,heroFrames:window.__heroGlobe.renderer().info.render.frame,riskFrames:window.__riskGlobe.renderer().info.render.frame})));
    await page.locator('#check').scrollIntoViewIfNeeded();await page.waitForTimeout(700);
    console.log('RISK',await page.evaluate(()=>({riskActive:window.__riskRenderActive,checkTop:Math.round(document.getElementById('check').getBoundingClientRect().top),heroFrames:window.__heroGlobe.renderer().info.render.frame,riskFrames:window.__riskGlobe.renderer().info.render.frame})));
    await page.waitForTimeout(6500);
    console.log('RISK_AFTER',await page.evaluate(()=>({address:document.getElementById('site-addr').textContent,score:document.getElementById('risk-value').textContent,tiles:window.__rsTe?.children?.length,renderFrames:window.__riskGlobe.renderer().info.render.frame})),errors);
  }
  if(process.argv.includes('--control-args')){
    console.log('UPDATE_ARGS',await page.evaluate(async()=>{const c=window.__heroGlobe.controls(),old=c.update,a=[];c.update=function(x){if(a.length<12)a.push(x===undefined?'undefined':x);return old.apply(this,arguments);};await new Promise(r=>setTimeout(r,500));c.update=old;return a;}));
  }
  if(process.argv.includes('--compare')){
    const sample=()=>page.evaluate(async()=>{const a=[];let p=performance.now();for(let i=0;i<50;i++)await new Promise(done=>requestAnimationFrame(t=>{a.push(t-p);p=t;done();}));a.sort((x,y)=>x-y);return {p50:Math.round(a[25]),p95:Math.round(a[47]),max:Math.round(a[49])};});
    const base=await sample();
    await page.evaluate(()=>window.__riskGlobe.renderer().setPixelRatio(.5));
    const lowRisk=await sample();
    await page.evaluate(()=>window.__riskGlobe.pauseAnimation());
    const pausedRisk=await sample();
    console.log('COMPARE',JSON.stringify({base,lowRisk,pausedRisk}));
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
