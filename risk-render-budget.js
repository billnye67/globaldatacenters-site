/* Optional scheduling hooks for the vendored globe tile engine. Camera selection
   remains synchronous; mesh creation and texture uploads share a small frame budget. */
(function () {
  'use strict';
  window.installRiskTileBudget = function (globe, engine) {
    if (engine.tileWorkScheduler) return engine.tileWorkScheduler;
    var builds = new Map(), uploads = [], frame = 0;
    var renderer = globe.renderer();
    var stats = { built: 0, uploaded: 0, cancelled: 0, maxBatchMs: 0, batches: 0 };
    function schedule() { if (!frame) frame = requestAnimationFrame(flush); }
    function flush() {
      frame = 0;
      var start = performance.now(), count = 0;
      // An individual driver call cannot be interrupted. Limit uploads as well as
      // elapsed CPU time so a burst of decoded images never reaches one render.
      var uploaded = 0;
      while (uploads.length && uploaded < 2 && (!count || performance.now() - start < 2)) {
        var job = uploads.shift();
        if (job.object && job.record.obj === job.object) {
          renderer.initTexture(job.texture);
          job.finish(); stats.uploaded++; count++; uploaded++;
        } else { job.texture.dispose(); stats.cancelled++; }
      }
      for (var pair of builds) {
        builds.delete(pair[0]);
        var work = pair[1];
        if (work.level !== engine.level || work.record.obj) { stats.cancelled++; continue; }
        if (count && performance.now() - start >= 2) { builds.set(pair[0], work); break; }
        work.run(); stats.built++; count++;
        if (count >= 4 || performance.now() - start >= 2) break;
      }
      stats.maxBatchMs = Math.max(stats.maxBatchMs, performance.now() - start);
      stats.batches++;
      if (builds.size || uploads.length) schedule();
    }
    var scheduler = {
      stats: stats,
      selectTiles: function (cache, level, position, radius, makeTile) {
        var length = position.length(), latitude = 90 - Math.acos(position.y / length) * 180 / Math.PI;
        var angle = Math.atan2(position.z, position.x), longitude = 90 - angle * 180 / Math.PI - (angle < -Math.PI / 2 ? 360 : 0);
        var count = Math.pow(2, level), altitude = length / radius - 1;
        var span = (level <= 7 ? 180 : 90) * altitude;
        var latMin = Math.max(-85.05112878, latitude - span), latMax = Math.min(85.05112878, latitude + span);
        var lngSpan = Math.min(180, span / Math.max(.001, Math.cos(latitude * Math.PI / 180)));
        if (latitude + span >= 90 || latitude - span <= -90) lngSpan = 180;
        function row(lat) { return Math.max(0, Math.min(count - 1, Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * count))); }
        var top = Math.max(0, row(latMax) - 1), bottom = Math.min(count - 1, row(latMin) + 1);
        var left = Math.floor((longitude - lngSpan + 180) / 360 * count) - 1;
        var right = Math.min(left + count - 1, Math.floor((longitude + lngSpan + 180) / 360 * count) + 1);
        var records = cache.record || (cache.record = {}), selected = [];
        for (var x = left; x <= right; x++) for (var y = top; y <= bottom; y++) {
          var wrapped = ((x % count) + count) % count, key = wrapped + '_' + y;
          if (!records[key]) { records[key] = makeTile(wrapped, y); cache.push(records[key]); }
          var tile = records[key];
          if (level <= 7) {
            // Match the original octree's distance query, without constructing
            // an index for the other 16,000+ tiles on the planet.
            var phi = (90 - tile.lat) * Math.PI / 180, theta = (90 - tile.lng) * Math.PI / 180;
            var dx = radius * Math.sin(phi) * Math.cos(theta) - position.x;
            var dy = radius * Math.cos(phi) - position.y;
            var dz = radius * Math.sin(phi) * Math.sin(theta) - position.z;
            if (dx * dx + dy * dy + dz * dz > 9 * Math.pow(length - radius, 2)) continue;
          }
          selected.push(tile);
        }
        return selected;
      },
      clear: function () {
        cancelAnimationFrame(frame); frame = 0; builds.clear();
        uploads.forEach(function (job) { job.texture.dispose(); }); uploads = [];
      },
      enqueue: function (record, level, run) {
        if (!builds.has(record)) builds.set(record, { record: record, level: level, run: run });
        schedule();
      },
      ready: function (record, texture, finish) {
        var job = { record: record, object: record.obj, texture: texture, finish: finish };
        uploads.push(job);
        schedule();
      },
      get pending() { return builds.size + uploads.length; }
    };
    engine.tileWorkScheduler = scheduler;
    var clearTiles = engine.clearTiles;
    engine.clearTiles = function () { scheduler.clear(); return clearTiles.apply(this, arguments); };
    return scheduler;
  };

  // Reuse the already prepared satellite pin geometry from the homepage globe.
  // Each layer has its own material/uniform; zooming this globe cannot resize the
  // homepage pins. The vertex shader preserves the original cylinder growth.
  window.prepareRiskDots = function (globe) {
    if (globe.__riskDots) return globe.__riskDots;
    var source = window.__heroSatelliteDots && window.__heroSatelliteDots();
    if (!source || !source.length) return null;
    var root;
    globe.scene().traverse(function (object) {
      if (object.material === globe.globeMaterial()) root = object.parent;
    });
    if (!root) return null;
    var meshes = {}, uniform = { value: 0 }, size = 1, amount = 0, animation = 0;
    function sync() {
      var entries = window.__heroSatelliteDots();
      if (!entries) return;
      Object.keys(meshes).forEach(function (key) { meshes[key].visible = false; meshes[key].__riskHasData = false; });
      entries.forEach(function (entry) {
        var mesh = meshes[entry.layer];
        if (!mesh) {
          var material = entry.mesh.material.clone();
          material.color.set(entry.layer === 'blocked' ? '#ffffff' : '#c0392b');
          material.customProgramCacheKey = function () { return 'riskPinsScale'; };
          material.onBeforeCompile = function (shader) {
            shader.uniforms.uRiskPinScale = uniform;
            shader.vertexShader = 'attribute vec3 aBase;\nattribute float aH;\nuniform float uRiskPinScale;\n' + shader.vertexShader.replace('#include <begin_vertex>',
              '#include <begin_vertex>\n{vec3 nD=normalize(aBase);vec3 oD=transformed-aBase;float hD=dot(oD,nD);vec3 rD=oD-hD*nD;float sH=aH>0.0?max(aH*uRiskPinScale,0.1)/max(aH,0.1):1.0;transformed=aBase+rD*uRiskPinScale+nD*(hD*sH);}');
          };
          mesh = meshes[entry.layer] = new entry.mesh.constructor(entry.geometry, material);
          mesh.raycast = function () {};
          mesh.__riskBatchedPin = entry.layer;
          root.add(mesh);
        }
        mesh.geometry = entry.geometry;
        mesh.__riskHasData = true;
        mesh.visible = amount > 0;
      });
    }
    var controller = {
      sync: sync,
      scale: function (value) { size = value; uniform.value = amount * size; },
      show: function (on) {
        cancelAnimationFrame(animation); sync();
        var from = amount, to = on ? 1 : 0, start = performance.now();
        Object.keys(meshes).forEach(function (key) { meshes[key].visible = meshes[key].__riskHasData; });
        function tick(now) {
          var t = Math.min(1, (now - start) / 520);
          amount = from + (to - from) * t; uniform.value = amount * size;
          if (t < 1) animation = requestAnimationFrame(tick);
          else if (!on) Object.keys(meshes).forEach(function (key) { meshes[key].visible = false; });
        }
        animation = requestAnimationFrame(tick);
      }
    };
    sync();
    // Upload buffers and compile at zero pin width, before the interactive flight.
    Object.keys(meshes).forEach(function (key) { meshes[key].visible = true; });
    globe.renderer().render(globe.scene(), globe.camera());
    Object.keys(meshes).forEach(function (key) { meshes[key].visible = false; });
    globe.__riskDots = controller;
    return controller;
  };
})();
