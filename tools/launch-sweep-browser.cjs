const {webkit}=require('playwright');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'.source-cache/launch-sweep-20260927');
const origin='http://127.0.0.1:8787';
const urls=['/','/data-centers/','/data-centers/united-states/florida/','/data-centers/mexico/chihuahua/','/data-centers/germany/hesse/','/data-centers/germany/hessen/','/data-centers/united-states/texas/mills-county/','/data-centers/china/henan/','/data-centers/united-states/colorado/','/company/powerhouse-data-centers/','/project/meta-rosemount-rosemount-minnesota/','/wins','/learn','/sources','/about','/take-action','/report','/contact','/shop','/privacy','/terms'];
(async()=>{
 const browser=await webkit.launch(); const results=[];
 for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  await context.route('**/*',async r=>{
   if(r.request().method()!=='GET')return r.abort();
   if(/\/api\/(geo|letter-count|alerts)/.test(r.request().url()))return r.fulfill({contentType:'application/json',body:JSON.stringify({country:'US',count:1200})});
   return r.continue();
  });
  const page=await context.newPage();
  for(const url of urls){
   const errors=[],failed=[]; const onError=e=>errors.push(e.message); const onResponse=r=>{if(r.status()>=400&&r.url().startsWith(origin))failed.push({url:r.url().slice(origin.length),status:r.status()});};
   page.on('pageerror',onError);page.on('response',onResponse);
   let row={url,viewport};
   try{
    const res=await page.goto(origin+url,{waitUntil:'domcontentloaded',timeout:20000});await page.waitForTimeout(700);
    Object.assign(row,{status:res.status(),...await page.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth-innerWidth,overflowElements:[...document.querySelectorAll('main *, .page *')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&(r.right>innerWidth+3||r.left<-3)&&s.position!=='fixed'&&s.visibility!=='hidden'}).slice(0,12).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,65)})),brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&getComputedStyle(i).display!=='none').map(i=>i.getAttribute('src')),forms:[...document.forms].map(f=>({id:f.id,fields:[...f.querySelectorAll('input,select,textarea')].map(e=>({name:e.name,id:e.id,type:e.type,required:e.required}))}))}))});
    if(viewport.width===390&&['/','/company/powerhouse-data-centers/','/data-centers/mexico/chihuahua/','/data-centers/china/henan/','/take-action'].includes(url)) await page.screenshot({path:path.join(dir,'mobile-'+(url==='/'?'home':url.replace(/\W/g,'_'))+'.png'),fullPage:true});
   }catch(e){row.error=e.message;}
   row.errors=errors;row.failed=failed;results.push(row);console.log(JSON.stringify({url,width:viewport.width,status:row.status,overflow:row.overflow,errors,failed,error:row.error}));
   page.off('pageerror',onError);page.off('response',onResponse);
  }
  await context.close();
 }
 fs.writeFileSync(path.join(dir,'browser.json'),JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
