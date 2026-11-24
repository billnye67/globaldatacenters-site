/* Positive-only, sparse OSM connectivity landmarks. No mapped point means unknown. */
(function(root){
  'use strict';
  var dataPromise=null;
  function distanceKm(a,b,c,d){
    var p=Math.PI/180,da=(c-a)*p,db=(d-b)*p;
    var s=Math.sin(da/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(db/2)**2;
    return 12742*Math.asin(Math.min(1,Math.sqrt(s)));
  }
  function lookup(lat,lng,points){
    var found={ixp:null,fiberExchange:null};
    for(var i=0;i<points.length;i++){
      var point=points[i],kind=point[4]==='ixp'?'ixp':'fiberExchange';
      var km=distanceKm(lat,lng,point[2],point[3]);
      if(km<=100&&(!found[kind]||km<found[kind].km))found[kind]={name:point[1],km:km,id:point[0]};
    }
    return found;
  }
  function connectionAt(lat,lng){
    if(!isFinite(lat)||!isFinite(lng)||lat < -90||lat > 90||lng < -180||lng > 180)return Promise.resolve(null);
    if(!dataPromise)dataPromise=fetch('/data/risk-lookup/ixp.json').then(function(r){
      if(!r.ok)throw new Error('Connectivity lookup unavailable: '+r.status);
      return r.json();
    }).catch(function(error){dataPromise=null;throw error;});
    return dataPromise.then(function(data){return lookup(lat,lng,data.points);});
  }
  var api={connectionAt:connectionAt,lookup:lookup};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RiskConnection=api;
})(typeof window==='undefined'?globalThis:window);
