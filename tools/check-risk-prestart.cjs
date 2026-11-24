const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:8788/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__riskGlobe,{timeout:15000});
 await page.evaluate(()=>scrollTo(0,900));await page.waitForTimeout(2500);
 console.log('BEFORE_VISIBLE',await page.evaluate(()=>({top:Math.round(document.getElementById('check').getBoundingClientRect().top),demo:document.getElementById('check').getAttribute('data-demo'),address:document.getElementById('site-addr').textContent,input:document.getElementById('check-address').value})));
 await page.locator('#check').scrollIntoViewIfNeeded();await page.waitForTimeout(200);
 console.log('ON_ARRIVAL',await page.evaluate(()=>({top:Math.round(document.getElementById('check').getBoundingClientRect().top),address:document.getElementById('site-addr').textContent,input:document.getElementById('check-address').value})));
 await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
