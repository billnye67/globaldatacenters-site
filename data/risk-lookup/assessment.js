/* Comparative data-center development risk, using the Florida calculator's 30/15/15/40 structure. */
(function(root){
  'use strict';
  var WEIGHTS={power:30,water:15,land:15,activity:40};
  // An unknown status is still a tracked site. Only explicit inactive statuses are excluded.
  var ACTIVE={'proposed':1,'proposed (early)':1,'approved':1,'under construction':1,'operating':1,'operating (expanding)':1,'unknown':1};
  function dist(a,b,c,d){
    var p=Math.PI/180,da=(c-a)*p,db=(d-b)*p;
    return 12742*Math.asin(Math.min(1,Math.sqrt(Math.sin(da/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(db/2)**2)));
  }
  function activityAt(lat,lng,locations){
    var nearby=[];
    (locations||[]).forEach(function(site){
      if(site.blk||site.type==='report'||!ACTIVE[String(site.status||'unknown').toLowerCase()]||site.lat==null||site.lng==null||!isFinite(site.lat)||!isFinite(site.lng))return;
      var km=dist(lat,lng,+site.lat,+site.lng);
      if(km<=150)nearby.push({site:site,km:km});
    });
    nearby.sort(function(a,b){return a.km-b.km;});
    var closest=nearby[0]||null,near30=nearby.filter(function(x){return x.km<=48.28032;});
    var campuses=near30.filter(function(x){return x.site.kind!=='colo';}).length;
    var colos=near30.length-campuses;
    var developing=near30.some(function(x){return /^(proposed|proposed \(early\)|approved|under construction)$/.test(String(x.site.status||'').toLowerCase());});
    var nearestCampus=nearby.find(function(x){return x.site.kind!=='colo';})||null;
    var points=campuses?Math.min(40,12+7*Math.min(campuses,4)+2*Math.min(colos,5)+(developing?4:0)):
      colos?Math.min(28,8+4*Math.min(colos,5)+(developing?4:0)):
      nearestCampus&&nearestCampus.km<=100?18:closest?10:4;
    return {score:points,closest:closest,within30Miles:near30.length,within30Campuses:campuses,within30Sites:near30.slice(0,5),nearestSites:nearby.slice(0,4)};
  }
  function powerPoints(grid){
    if(!grid)return null;
    var count=grid.observedCells||0;
    if(count>=220)return 30;
    if(count>=150)return 26;
    if(count>=100)return 22;
    if(count>=60)return 18;
    if(count>=25)return 12;
    count=grid.modeledCells||0;
    return count>=150?16:count>=100?13:count>=50?10:6;
  }
  function landPoints(land){
    if(!land)return null;
    var scores={1:7,2:7,3:7,4:7,5:7,6:13,7:13,8:13,9:13,10:13,11:2,12:10,13:4,14:10,15:2,16:15,17:2};
    return scores[land.classId]===undefined?null:scores[land.classId];
  }
  function waterPoints(water){
    if(!water||water.category<0||!isFinite(water.score))return null;
    return Math.max(6,Math.min(15,Math.round(15-9*water.score/5)));
  }
  function tier(score){return score>=80?'Very High':score>=65?'High':score>=45?'Moderate':score>=25?'Low':'Very Low';}
  function miles(km){return km<1.609344?'under 1 mi':(km*0.621371).toFixed(1)+' mi';}
  function mappedPower(grid){
    if(!grid)return {value:'No map reading',detail:'Power map: unavailable for this search.'};
    if(grid.observedKm!==null)return {value:'Mapped grid '+miles(grid.observedKm)+' away',detail:'Nearest mapped grid infrastructure: '+miles(grid.observedKm)+' away. This is based on power lines recorded in the 2020 map; '+grid.observedCells+' map cells contain observed lines within 50 km (roughly 5.6 km cells). It does not show spare capacity.'};
    if(grid.modeledKm!==null)return {value:'Estimated grid '+miles(grid.modeledKm)+' away',detail:'Nearest estimated grid infrastructure: '+miles(grid.modeledKm)+' away; no observed grid line is mapped within 50 km. '+grid.modeledCells+' cells contain estimated lines within 50 km on the 2020 map (roughly 5.6 km cells). It does not show spare capacity.'};
    return {value:'No grid mapped nearby',detail:'No grid infrastructure recorded within 50 km on the 2020 power-line map. This does not prove that power service is unavailable.'};
  }
  function regionalWater(water){
    if(!water||water.category<0||!isFinite(water.score))return {value:'No basin reading',detail:'Regional water stress: unavailable for this search.'};
    return {value:water.label,detail:'Regional water use compared with supply: '+water.label+' (WRI Aqueduct 4.0).'};
  }
  function surroundingLand(land){
    if(!land)return {value:'No land reading',detail:'Surrounding land cover: unavailable for this search.'};
    return {value:land.label,detail:'Most common land cover in the surrounding map area (roughly 15 km): '+land.label+' ('+land.year+' satellite map).'};
  }
  function trackedActivity(activity){
    var count=activity.within30Miles,closest=activity.closest;
    var value=count+' tracker '+(count===1?'pin':'pins')+' / 30 mi';
    var detail=count+' active tracker '+(count===1?'pin':'pins')+' within 30 mi';
    if(count){
      var shown=activity.within30Sites||[];
      detail+='; closest '+shown.length+' '+(shown.length===1?'site':'sites')+': '+shown.map(function(x){
        var s=x.site,status=s.status==='unknown'?'status not recorded':s.status||'status not recorded';
        return s.name+' ('+status+', '+miles(x.km)+' away)';
      }).join('; ');
      if(count>shown.length)detail+='; '+(count-shown.length)+' more in tracker';
    }else if(closest){
      var s=closest.site;
      detail+='; nearest: '+s.name+' · '+(s.status==='unknown'?'status not recorded':s.status||'status not recorded')+' · '+miles(closest.km)+' away';
    }else detail+='; no tracked site found in the 93 mi lookup';
    return {value:value,detail:detail+'.'};
  }
  function compile(loc,locations,layers){
    layers=layers||{};
    var activity=activityAt(loc.lat,loc.lng,locations),grid=layers.grid||null,water=layers.water||null,land=layers.land||null,unavailable=layers.unavailable||{};
    var p=powerPoints(grid),w=waterPoints(water),l=landPoints(land);
    var points={power:p===null?6:p,water:w===null?8:w,land:l===null?7:l,activity:activity.score};
    var score=points.power+points.water+points.land+points.activity;
    var knownCount=1+(grid?1:0)+(w!==null?1:0)+(l!==null?1:0);
    var coverage=40+(grid?30:0)+(w!==null?15:0)+(l!==null?15:0);
    var signals=[trackedActivity(activity),mappedPower(grid),regionalWater(water),surroundingLand(land)];
    var labels=['Known activity','Power infrastructure','Water stress','Surrounding land'];
    var metrics=signals.map(function(signal,i){return {label:labels[i],value:signal.value};});
    var keys=['activity','power','water','land'];
    var factors=signals.map(function(signal,i){var key=keys[i];return labels[i]+' '+points[key]+'/'+WEIGHTS[key]+' points: '+signal.detail;});
    var summary='An approximate area score based on mapped conditions and sites in our tracker.';
    return {score:score,band:tier(score),coverage:coverage,knownCount:knownCount,points:points,metrics:metrics,factors:factors,summary:summary,takeaway:'',signalLine:'',activity:activity,grid:grid,water:water,land:land,projects:activity.nearestSites.map(function(x){return x.site;}),unavailable:unavailable};
  }
  function assess(loc,locations){
    var services=[root.RiskGrid&&root.RiskGrid.gridAt,root.RiskWater&&root.RiskWater.waterAt,root.RiskLand&&root.RiskLand.landAt];
    return Promise.all(services.map(function(fn){return fn?Promise.resolve().then(function(){return fn(loc.lat,loc.lng);}).then(function(value){return {value:value};}).catch(function(){return {value:null,failed:true};}):Promise.resolve({value:null,failed:true});})).then(function(v){
      return compile(loc,locations,{grid:v[0].value,water:v[1].value,land:v[2].value,unavailable:{grid:!!v[0].failed,water:!!v[1].failed,land:!!v[2].failed}});
    });
  }
  var api={assess:assess,compile:compile,activityAt:activityAt,powerPoints:powerPoints,landPoints:landPoints,waterPoints:waterPoints,weights:WEIGHTS};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RiskAssessment=api;
})(typeof window==='undefined'?globalThis:window);
