/* Browser lookup for the compact WRI Aqueduct 4.0 water-stress tiles. */
(function(root){
  'use strict';
  var cache={};
  function ringContains(lng,lat,ring){
    var inside=false;
    for(var i=0,j=ring.length-1;i<ring.length;j=i++){
      var a=ring[i],b=ring[j];
      if((a[1]>lat)!==(b[1]>lat) && lng<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  function polygonContains(lng,lat,rings){
    if(!rings.length||!ringContains(lng,lat,rings[0]))return false;
    for(var i=1;i<rings.length;i++)if(ringContains(lng,lat,rings[i]))return false;
    return true;
  }
  function featureContains(lng,lat,feature){
    var geom=feature[5];
    if(feature[4]){
      for(var i=0;i<geom.length;i++)if(polygonContains(lng,lat,geom[i]))return true;
      return false;
    }
    return polygonContains(lng,lat,geom);
  }
  function lookupInTile(lat,lng,features){
    for(var i=0;i<features.length;i++)if(featureContains(lng,lat,features[i])){
      var f=features[i];
      return {basinId:f[0],score:f[1],category:f[2],label:f[3]};
    }
    return null;
  }
  function tileName(lat,lng){
    var x=Math.max(0,Math.min(35,Math.floor((lng+180)/10)));
    var y=Math.max(0,Math.min(17,Math.floor((lat+90)/10)));
    return x+'_'+y;
  }
  function waterAt(lat,lng){
    if(!isFinite(lat)||!isFinite(lng)||lat < -90||lat > 90||lng < -180||lng > 180)return Promise.resolve(null);
    var name=tileName(lat,lng);
    if(!cache[name])Object.keys(cache).forEach(function(old){delete cache[old];});
    if(!cache[name])cache[name]=fetch('/data/risk-lookup/water/'+name+'.json').then(function(response){
      if(response.status===404)return [];
      if(!response.ok)throw new Error('Water lookup unavailable: '+response.status);
      return response.json();
    }).catch(function(error){delete cache[name];throw error;});
    return cache[name].then(function(features){return lookupInTile(lat,lng,features);});
  }
  var api={waterAt:waterAt,lookupInTile:lookupInTile,tileName:tileName};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RiskWater=api;
})(typeof window==='undefined'?globalThis:window);
