(function () {
  'use strict';
  // The risk globe uses the homepage globe's already built satellite pin geometry.
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
          material.transparent = true;
          material.depthWrite = false;
          material.customProgramCacheKey = function () { return 'riskPinsScale'; };
          material.onBeforeCompile = function (shader) {
            shader.uniforms.uRiskPinScale = uniform;
            shader.vertexShader = 'attribute vec3 aBase;\nattribute float aH;\nuniform float uRiskPinScale;\n' + shader.vertexShader.replace('#include <begin_vertex>',
              '#include <begin_vertex>\n{vec3 nD=normalize(aBase);vec3 oD=transformed-aBase;float hD=dot(oD,nD);vec3 rD=oD-hD*nD;float sH=aH>0.0?max(aH*uRiskPinScale,0.1)/max(aH,0.1):1.0;transformed=aBase+rD*uRiskPinScale+nD*(hD*sH);}');
          };
          mesh = meshes[entry.layer] = new entry.mesh.constructor(entry.geometry, material);
          mesh.raycast = function () {};
          root.add(mesh);
        }
        mesh.geometry = entry.geometry;
        mesh.__riskHasData = true;
        mesh.visible = amount > 0;
        mesh.material.opacity = amount;
      });
    }
    function paint(value) {
      amount = Math.max(0, Math.min(1, value));
      uniform.value = amount * size;
      Object.keys(meshes).forEach(function (key) {
        meshes[key].material.opacity = amount;
        meshes[key].visible = amount > 0 && meshes[key].__riskHasData;
      });
    }
    var controller = {
      sync: sync,
      scale: function (value) { size = value; uniform.value = amount * size; },
      progress: function (value) { cancelAnimationFrame(animation); paint(value); },
      show: function (on) {
        cancelAnimationFrame(animation); sync();
        var from = amount, to = on ? 1 : 0, start = performance.now();
        Object.keys(meshes).forEach(function (key) { meshes[key].visible = meshes[key].__riskHasData; });
        function tick(now) {
          var t = Math.min(1, (now - start) / 520);
          paint(from + (to - from) * t);
          if (t < 1) animation = requestAnimationFrame(tick);
        }
        animation = requestAnimationFrame(tick);
      }
    };
    sync();
    globe.__riskDots = controller;
    return controller;
  };
})();
