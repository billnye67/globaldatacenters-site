/* Broad 2021 MODIS land-cover context. Not zoning or parcel suitability. */
(function(root){
  'use strict';
  var cache={},SIZE=200;
  var LABELS={
    1:'Evergreen needleleaf forest',2:'Evergreen broadleaf forest',
    3:'Deciduous needleleaf forest',4:'Deciduous broadleaf forest',
    5:'Mixed forest',6:'Closed shrubland',7:'Open shrubland',
    8:'Woody savanna',9:'Savanna',10:'Grassland',11:'Permanent wetland',
    12:'Cropland',13:'Urban and built-up land',
    14:'Cropland and natural vegetation mosaic',15:'Permanent snow and ice',
    16:'Barren land',17:'Water body'
  };
  function cell(lat,lng){
    var x=Math.max(0,Math.min(7199,Math.floor((lng+180)*20)));
    var y=Math.max(0,Math.min(3599,Math.floor((lat+90)*20)));
    return {name:Math.floor(x/SIZE)+'_'+Math.floor(y/SIZE),index:(y%SIZE)*SIZE+(x%SIZE)};
  }
  function lookupInTile(lat,lng,tile){
    if(!tile)return null;
    var value=tile[cell(lat,lng).index];
    if(!LABELS[value])return null;
    return {classId:value,label:LABELS[value],year:2021,lookupResolutionKm:5.6};
  }
  function cellAt(lat,lng){
    if(!isFinite(lat)||!isFinite(lng)||lat < -90||lat > 90||lng < -180||lng > 180)return Promise.resolve(null);
    var name=cell(lat,lng).name;
    if(!cache[name])cache[name]=fetch('/data/risk-lookup/land/'+name+'.bin').then(function(r){
      if(r.status===404)return null;
      if(!r.ok)throw new Error('Land-cover lookup unavailable: '+r.status);
      return r.arrayBuffer().then(function(b){
        if(b.byteLength!==SIZE*SIZE)throw new Error('Invalid land-cover tile: '+name);
        return new Uint8Array(b);
      });
    }).catch(function(error){delete cache[name];throw error;});
    return cache[name].then(function(tile){return lookupInTile(lat,lng,tile);});
  }
  function landAt(lat,lng){
    var samples=[];
    for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++)samples.push(cellAt(lat+dy*.05,lng+dx*.05));
    return Promise.all(samples).then(function(values){
      var counts={},best=null,center=values[4],landValues=values.filter(function(value){return value&&value.classId!==17;});
      var candidates=landValues.length>=2?landValues:values;
      candidates.forEach(function(value){if(value)counts[value.classId]=(counts[value.classId]||0)+1;});
      candidates.forEach(function(value){if(!value)return;if(!best||counts[value.classId]>counts[best.classId]||counts[value.classId]===counts[best.classId]&&center&&value.classId===center.classId)best=value;});
      return best?{classId:best.classId,label:best.label,year:best.year,lookupResolutionKm:best.lookupResolutionKm,neighborhoodSamples:values.filter(Boolean).length}:null;
    });
  }
  var api={landAt:landAt,lookupInTile:lookupInTile,cell:cell};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RiskLand=api;
})(typeof window==='undefined'?globalThis:window);
