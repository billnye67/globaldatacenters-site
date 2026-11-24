const {webkit}=require('playwright');
(async()=>{
 const browser=await webkit.launch();
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:8788/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__riskGlobe&&window.__heroGlobe,{timeout:15000});
 await page.locator('#site-globe').scrollIntoViewIfNeeded();
 const sample=()=>page.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)];};const g=window.__riskGlobe,sc=document.querySelector('#site-map .scene-container');return {map:r('#site-map'),scene:r('#site-map .scene-container'),canvas:r('#site-map canvas'),style:sc?.getAttribute('style'),size:[g.width(),g.height()],alt:+g.pointOfView().altitude.toFixed(2)};});
 console.log('before',await sample());
 await page.locator('#site-globe').click({force:true});
 for(const delay of [300,450,450,450,450]){await page.waitForTimeout(delay);console.log('open',await sample());}
 await page.locator('#globe-back').click({force:true});
 for(const delay of [300,450,450,450,450]){await page.waitForTimeout(delay);console.log('close',await sample());}
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
