const {webkit}=require('playwright');
(async()=>{const b=await webkit.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await p.goto('http://localhost:8787/#main');await p.waitForTimeout(700);
 const sample=()=>p.evaluate(()=>{const q=s=>{let e=document.querySelector(s),r=e.getBoundingClientRect();return {top:Math.round(r.top),height:Math.round(r.height)}};return {innerHeight,visualViewportHeight:visualViewport.height,scrollY,hero:q('#hero-sec'),wins:q('#wins'),lead:q('.lead'),rootSvh:getComputedStyle(document.querySelector('#hero-sec')).height}});
 console.log('844',await sample());await p.setViewportSize({width:390,height:745});await p.waitForTimeout(500);console.log('745',await sample());await p.setViewportSize({width:390,height:844});await p.waitForTimeout(500);console.log('844 again',await sample());await b.close();})().catch(e=>{console.error(e);process.exitCode=1});
