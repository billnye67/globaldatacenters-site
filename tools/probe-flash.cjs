const {webkit}=require('playwright');
(async()=>{const b=await webkit.launch();const p=await b.newPage({viewport:{width:390,height:745},isMobile:true,hasTouch:true});
 await p.addInitScript(()=>{window.__ys=[];const sample=()=>{window.__ys.push({t:Math.round(performance.now()),y:scrollY});if(performance.now()<1000)requestAnimationFrame(sample)};requestAnimationFrame(sample)});
 for(const hash of ['#main',''])for(const section of ['#wins','#check']){
  await p.goto('http://localhost:8787/'+hash);await p.waitForTimeout(500);
  await p.evaluate(s=>{const el=document.documentElement,old=el.style.scrollBehavior;el.style.scrollBehavior='auto';document.querySelector(s).scrollIntoView();el.style.scrollBehavior=old;},section);
  const before=await p.evaluate(()=>scrollY);
  await p.reload({waitUntil:'load'});await p.waitForTimeout(1100);
  console.log(hash||'root',section,'from',before,'to',await p.evaluate(()=>scrollY),'peak',await p.evaluate(()=>Math.max(...window.__ys.map(x=>x.y))));
 }
 await b.close();})().catch(e=>{console.error(e);process.exitCode=1});
