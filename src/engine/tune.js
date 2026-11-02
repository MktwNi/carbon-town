/* GHG Town 3D v0.3 — performance tuning: distance culling of small-detail static chunks, adaptive resolution */
GHG3.tune = {
  _initTune() {
    const E = this._E;
    const detail = new Set(['flat', 'shiny', 'paint', 'glow', 'wood', 'glass', 'brick', 'ruFlat', 'ruShiny', 'ruGlow', 'ruWood']);
    const byMat = new Map();
    for (const k in E.BK) byMat.set(E.BK[k].mat, k);
    E.tuneDetail = [];
    for (const m of E.statics) {
      const k = byMat.get(m.material);
      if (!k || !detail.has(k) || !m.geometry.boundingSphere) continue;
      E.tuneDetail.push({ m: m, c: m.geometry.boundingSphere.center, r: m.geometry.boundingSphere.radius });
    }
    E.tuneT = 0;
    E.tuneFt = [];
    E.tuneLast = performance.now();
    E.tuneLevel = 0;
    this._anim((dt) => this._tuneTick(dt));
  },
  _tuneTick(dt) {
    const E = this._E;
    // frame-time based quality (real time, not the clamped dt)
    const now = performance.now();
    const ft = now - E.tuneLast;
    E.tuneLast = now;
    if (!window.__GHG_TEST && ft < 500) {
      E.tuneFt.push(ft);
      if (E.tuneFt.length >= 90) {
        const avg = E.tuneFt.reduce((a, b) => a + b, 0) / E.tuneFt.length;
        E.tuneFt.length = 0;
        if (avg > 36 && E.tuneLevel < 2) {
          E.tuneLevel++;
          if (E.tuneLevel === 1) {
            E.renderer.setPixelRatio(1);
            E.w = 0; this._resize();
          } else {
            const sh = E.sun.shadow;
            sh.mapSize.set(1024, 1024);
            if (sh.map) { sh.map.dispose(); sh.map = null; }
          }
        }
      }
    }
    // distance culling of small-detail chunks
    E.tuneT -= dt;
    if (E.tuneT > 0) return;
    E.tuneT = 0.4;
    const cp = E.cam.position;
    const lim = cp.y > 160 ? 1800 : 700;
    for (const d of E.tuneDetail) {
      const dx = d.c.x - cp.x, dy = d.c.y - cp.y, dz = d.c.z - cp.z;
      d.m.visible = Math.sqrt(dx * dx + dy * dy + dz * dz) - d.r < lim;
    }
  }
};
