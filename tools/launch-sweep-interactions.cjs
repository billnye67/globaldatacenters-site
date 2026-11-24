const {webkit}=require('playwright');
const fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'../.source-cache/launch-sweep-20260927');
(async()=>{
 const browser=await webkit.launch(); const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[],result={};page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().method()==='GET'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:8787/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__locations?.length>2000,{},{timeout:20000});
 await page.locator('#menu-btn').click();result.menuOpened=await page.locator('#drawer').getAttribute('aria-hidden');
 await page.locator('#drawer-close').click();result.menuClosed=await page.locator('#drawer').getAttribute('aria-hidden');
 await page.locator('.globe-tap').click();await page.waitForTimeout(4200);
 result.cards=await page.evaluate(()=>['gemini-aligned-phoenix','gemini-microsoft-south-central','epoch-alibaba-zhangbei'].map(id=>{
  const p=window.__locations.find(x=>x.id===id);window.__closeCard();window.__showCard(p,true);
  return{id,name:p.name,storedStatus:p.status,approx:p.approx,body:document.querySelector('#card-body').textContent,facts:document.querySelector('#card-facts').textContent,sourceHidden:document.querySelector('#card-link').hidden,source:document.querySelector('#card-link').href,flyHidden:document.querySelector('#card-fly').hidden};
 }));
 await page.screenshot({path:path.join(dir,'map-town-pin.png')});
 await page.goto('http://127.0.0.1:8787/company/powerhouse-data-centers/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(700);
 const ps=page.locator('p.g-body');result.powerhouseParagraphs=await ps.evaluateAll(es=>es.map(e=>({words:e.textContent.split(/\s+/).length,height:e.getBoundingClientRect().height,visible:!!e.getClientRects().length})));
 await ps.nth(4).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,'powerhouse-paragraph.png')});
 await page.goto('http://127.0.0.1:8787/data-centers/mexico/chihuahua/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(2000);await page.screenshot({path:path.join(dir,'chihuahua-network-checked.png'),fullPage:true});
 result.chihuahuaImages=await page.evaluate(()=>[...document.images].map(i=>({src:i.getAttribute('src'),complete:i.complete,width:i.naturalWidth})));
 result.errors=errors;fs.writeFileSync(path.join(dir,'interactions.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
