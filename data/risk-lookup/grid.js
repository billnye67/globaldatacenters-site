/* Approximate distance to 2020 mapped/modelled power lines, not electrical capacity. */
(function(root){
  'use strict';
  var cache={}, CELLS=200, TILE_BYTES=5000, STEP=.05, KM_DEG=111.195;
  function tileName(x,y){return Math.floor(x/CELLS)+'_'+Math.floor(y/CELLS);}
  function load(name){
    if(!cache[name])cache[name]=fetch('/data/risk-lookup/grid/'+name+'.bin').then(function(r){
      if(r.status===404)return new Uint8Array(2*TILE_BYTES);
      if(!r.ok)throw new Error('Grid lookup unavailable: '+r.status);
      return r.arrayBuffer().then(function(b){
        if(b.byteLength!==2*TILE_BYTES)throw new Error('Invalid grid tile: '+name);
        return new Uint8Array(b);
      });
    }).catch(function(error){delete cache[name];throw error;});
    return cache[name];
  }
  function bit(tile,x,y,offset){
    var index=(y%CELLS)*CELLS+(x%CELLS);
    return !!(tile[offset+(index>>3)]&(1<<(index&7)));
  }
  function lookupInTiles(lat,lng,tiles,maxKm){
    maxKm=maxKm||50;
    var latSpan=maxKm/KM_DEG,lonSpan=maxKm/(KM_DEG*Math.max(.05,Math.cos(lat*Math.PI/180)));
    var x0=Math.max(0,Math.floor((lng-lonSpan+180)/STEP)),x1=Math.min(7199,Math.floor((lng+lonSpan+180)/STEP));
    var y0=Math.max(0,Math.floor((lat-latSpan+90)/STEP)),y1=Math.min(3599,Math.floor((lat+latSpan+90)/STEP));
    var observed=null,modeled=null,observedCells=0,modeledCells=0,cos=Math.cos(lat*Math.PI/180);
    for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++){
      var tile=tiles[tileName(x,y)];if(!tile)continue;
      var north=(y+.5)*STEP-90,east=(x+.5)*STEP-180;
      var dy=(north-lat)*KM_DEG,dx=(east-lng)*KM_DEG*cos,km=Math.sqrt(dx*dx+dy*dy);
      if(km>maxKm)continue;
      if(bit(tile,x,y,0)){observedCells++;if(observed===null||km<observed)observed=km;}
      if(bit(tile,x,y,TILE_BYTES)){modeledCells++;if(modeled===null||km<modeled)modeled=km;}
    }
    return {observedKm:observed,modeledKm:modeled,observedCells:observedCells,modeledCells:modeledCells,
      observedBand:proximityBand(observed),modeledBand:proximityBand(modeled),resolutionKm:STEP*KM_DEG};
  }
  function proximityBand(km){
    if(km===null)return null;
    if(km<=10)return 'within about 10 km';
    if(km<=25)return 'about 10–25 km away';
    return 'about 25–50 km away';
  }
  function gridAt(lat,lng,maxKm){
    if(!isFinite(lat)||!isFinite(lng)||lat < -90||lat > 90||lng < -180||lng > 180)return Promise.resolve(null);
    maxKm=maxKm||50;
    var latSpan=maxKm/KM_DEG,lonSpan=maxKm/(KM_DEG*Math.max(.05,Math.cos(lat*Math.PI/180)));
    var x0=Math.max(0,Math.floor((lng-lonSpan+180)/STEP)),x1=Math.min(7199,Math.floor((lng+lonSpan+180)/STEP));
    var y0=Math.max(0,Math.floor((lat-latSpan+90)/STEP)),y1=Math.min(3599,Math.floor((lat+latSpan+90)/STEP));
    var names={};
    for(var y=Math.floor(y0/CELLS);y<=Math.floor(y1/CELLS);y++)for(var x=Math.floor(x0/CELLS);x<=Math.floor(x1/CELLS);x++)names[x+'_'+y]=true;
    return Promise.all(Object.keys(names).map(function(name){return load(name).then(function(tile){return [name,tile];});})).then(function(entries){
      var tiles={};entries.forEach(function(pair){tiles[pair[0]]=pair[1];});
      return lookupInTiles(lat,lng,tiles,maxKm);
    });
  }
  var api={gridAt:gridAt,lookupInTiles:lookupInTiles,tileName:tileName,proximityBand:proximityBand};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RiskGrid=api;
})(typeof window==='undefined'?globalThis:window);
