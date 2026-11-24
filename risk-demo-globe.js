/* Prepared imagery on the live 3D sphere. The existing camera flight is retained. */
(function () {
  'use strict';
  var widths = [4096, 512, 64, 8, 3], earth = 6378137;
  function frame() { return new Promise(function (resolve) { requestAnimationFrame(resolve); }); }
  function picture(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image(); image.decoding = 'async';
      image.onload = function () { image.decode().then(function () { resolve(image); }, reject); };
      image.onerror = function () { reject(new Error('Preset imagery unavailable: ' + url)); };
      image.src = url;
    });
  }
  window.RiskDemoGlobe = function (globe) {
    var cache = new Map(), active = null, keep = new Set(), phone = matchMedia('(max-width:760px)').matches;
    function dispose(entry) {
      entry.meshes.forEach(function (mesh) { mesh.removeFromParent(); mesh.geometry.dispose(); mesh.material.map.dispose(); mesh.material.dispose(); });
      entry.meshes = [];
    }
    function prune() {
      cache.forEach(function (entry, id) { if (entry.ready && id !== active && !keep.has(id)) { dispose(entry); cache.delete(id); } });
    }
    async function build(scene, entry) {
      var images = await Promise.all(widths.map(function (km) { return picture('/img/risk-demo/' + scene.id + '-' + km + 'km' + (phone ? '-phone' : '') + '.jpg'); }));
      var base;
      for (var tries = 0; tries < 300; tries++) {
        globe.scene().traverse(function (object) { if (object.material === globe.globeMaterial()) base = object; });
        if (base && globe.globeMaterial().map) break;
        await frame();
      }
      if (!base || !globe.globeMaterial().map) throw new Error('Satellite globe is not ready');
      var lat = scene.loc.lat * Math.PI / 180, lng = scene.loc.lng * Math.PI / 180;
      var centerX = earth * lng, centerY = earth * Math.log(Math.tan(Math.PI / 4 + lat / 2));
      for (var i = 0; i < widths.length; i++) {
        var half = widths[i] * 500 / Math.cos(lat);
        var west = (centerX - half) / earth, east = (centerX + half) / earth;
        var southY = (centerY - half) / earth, northY = (centerY + half) / earth;
        var south = 2 * Math.atan(Math.exp(southY)) - Math.PI / 2;
        var north = 2 * Math.atan(Math.exp(northY)) - Math.PI / 2;
        var geometry = new base.geometry.constructor(100 + (i + 1) * .00002, 64, 64,
          Math.PI / 2 + west, east - west, Math.PI / 2 - north, north - south);
        var uv = geometry.getAttribute('uv');
        for (var vertex = 0; vertex < uv.count; vertex++) {
          var latitude = south + uv.getY(vertex) * (north - south);
          uv.setY(vertex, (Math.log(Math.tan(Math.PI / 4 + latitude / 2)) - southY) / (northY - southY));
        }
        uv.needsUpdate = true;
        var texture = new globe.globeMaterial().map.constructor(images[i]);
        texture.colorSpace = 'srgb'; texture.needsUpdate = true;
        texture.anisotropy = Math.min(4, globe.renderer().capabilities.getMaxAnisotropy());
        var material = globe.globeMaterial().clone();
        material.map = texture; material.bumpMap = null; material.specularMap = null;
        material.color.set('#ffffff'); material.shininess = 0;
        material.transparent = true; material.depthWrite = false;
        material.polygonOffset = true; material.polygonOffsetFactor = -1; material.polygonOffsetUnits = -1;
        material.opacity = 0;
        material.customProgramCacheKey = function () { return 'preparedSatellitePatch'; };
        material.onBeforeCompile = function (shader) {
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
            '#include <map_fragment>\nvec2 imageEdge=min(vMapUv,vec2(1.0)-vMapUv);diffuseColor.a*=smoothstep(0.0,0.06,min(imageEdge.x,imageEdge.y));');
        };
        var mesh = new base.constructor(geometry, material);
        mesh.renderOrder = 20 + i; mesh.raycast = function () {}; mesh.__riskPreset = scene.id;
        base.parent.add(mesh); entry.meshes.push(mesh);
        // Texture decoding, GPU uploads and shader preparation finish before flight.
        globe.renderer().initTexture(texture);
        globe.renderer().render(globe.scene(), globe.camera());
        mesh.visible = false; material.opacity = 1;
        await frame();
      }
      entry.ready = true; prune(); return entry;
    }
    return {
      prepare: function (scene) {
        if (cache.has(scene.id)) return cache.get(scene.id).promise;
        var entry = { meshes: [], ready: false };
        cache.set(scene.id, entry);
        entry.promise = build(scene, entry).catch(function (error) { dispose(entry); cache.delete(scene.id); throw error; });
        return entry.promise;
      },
      retain: function (ids) { keep = new Set(ids); prune(); },
      activate: function (id) {
        var entry = cache.get(id); if (!entry || !entry.ready) return false;
        active = id;
        cache.forEach(function (item, key) { item.meshes.forEach(function (mesh) { mesh.visible = key === id; }); });
        return true;
      },
      hide: function () { cache.forEach(function (entry) { entry.meshes.forEach(function (mesh) { mesh.visible = false; }); }); },
      get readyIds() { return Array.from(cache).filter(function (item) { return item[1].ready; }).map(function (item) { return item[0]; }); }
    };
  };
})();
