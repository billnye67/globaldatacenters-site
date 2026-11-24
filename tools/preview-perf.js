(function(){
  var samples=[],slices=[],last=0,lastSlice=performance.now(),lastSent=lastSlice,tileRequests=0;
  try{new PerformanceObserver(function(list){list.getEntries().forEach(function(e){if(e.name.indexOf('/World_Imagery/MapServer/tile/')>=0)tileRequests++;});}).observe({entryTypes:['resource']});}catch(e){}
  function capture(now){var a=samples.splice(0).sort(function(x,y){return x-y;});if(!a.length)return;
    var hero=window.__heroGlobe,risk=window.__riskGlobe,check=document.getElementById('check'),b=check&&check.getBoundingClientRect();
    var phase=document.getElementById('hero-sec')?.classList.contains('globe-mode')?'full-globe':b&&b.top<innerHeight&&b.bottom>0?'risk':'homepage';
    var globe=function(g){if(!g)return null;var r=g.renderer(),c=r.domElement;return {frames:r.info.render.frame,calls:r.info.render.calls,pixels:[c.width,c.height],textures:r.info.memory.textures};};
    var pov=risk&&risk.pointOfView(),data={at:Math.round(now/1000),phase:phase,frames:a.length,p50:Math.round(a[Math.floor(a.length*.5)]),p95:Math.round(a[Math.floor(a.length*.95)]),max:Math.round(a[a.length-1]),over50:a.filter(function(x){return x>50;}).length,over100:a.filter(function(x){return x>100;}).length,riskMode:check?.classList.contains('rs-globe')?'full':check?.getAttribute('data-demo')==='on'?'demo':'result',riskState:check?.getAttribute('data-state'),riskAltitude:pov?+pov.altitude.toFixed(4):null,riskTiles:window.__rsTe?.children?.length,tileRequests:tileRequests,typing:!!document.querySelector('.check-input.typing'),hero:globe(hero),risk:globe(risk)};
    tileRequests=0;lastSlice=now;slices.push(data);
    var box=document.getElementById('__perf-box');if(box)box.textContent=phase+' · '+Math.round(1000/Math.max(1,data.p95))+' fps p95 · '+data.over100+' stalls';
  }
  function report(now){if(!slices.length)return;var data={seconds:Math.round((now-lastSent)/1000),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,slices:slices.splice(0)};lastSent=now;
    fetch('/__perf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),keepalive:true}).catch(function(){});
  }
  function tick(t){if(last)samples.push(t-last);last=t;if(t-lastSlice>=1000)capture(t);if(t-lastSent>=5000)report(t);requestAnimationFrame(tick);}
  var box=document.createElement('div');box.id='__perf-box';box.style.cssText='position:fixed;z-index:2147483647;left:8px;bottom:8px;max-width:calc(100vw - 16px);padding:6px 8px;border-radius:4px;background:#111;color:white;font:12px/1.3 system-ui;pointer-events:none';box.textContent='Measuring preview…';document.body.appendChild(box);
  requestAnimationFrame(tick);
})();
