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
    // dynamic resolution (v0.8): pixel-ratio steps; the last ones also halve the shadow map
    const base = E.renderer.getPixelRatio();
    const steps = [base, base * 0.85, 1, 0.85, 0.72].filter((v, i, a) => v <= base + 1e-6 && a.findIndex((w) => Math.abs(w - v) < 0.04) === i);
    E.tuneSteps = steps.length ? steps : [base];
    E.tuneSlow = 0; E.tuneGood = 0; E.tuneHold = 0; E.tuneBack = 0;
    this._anim((dt) => this._tuneTick(dt));
  },
  _tuneSet(level) {
    const E = this._E;
    const n = E.tuneSteps.length;
    level = Math.max(0, Math.min(n - 1, level));
    if (level === E.tuneLevel) return;
    E.tuneLevel = level;
    E.renderer.setPixelRatio(E.tuneSteps[level]);
    E.w = 0; this._resize();
    const want = level >= Math.max(1, n - 2) ? 1024 : 2048;
    const sh = E.sun.shadow;
    if (sh.mapSize.x !== want) { sh.mapSize.set(want, want); if (sh.map) { sh.map.dispose(); sh.map = null; } }
  },
  _tuneTick(dt) {
    const E = this._E;
    // frame-time based quality (real time, not the clamped dt): keep ~50+ fps so walking stays smooth
    const now = performance.now();
    const ft = now - E.tuneLast;
    E.tuneLast = now;
    if (!window.__GHG_TEST && ft < 250 && !document.hidden) {
      E.tuneFt.push(ft);
      if (E.tuneFt.length >= 60) {
        const avg = E.tuneFt.reduce((a, b) => a + b, 0) / E.tuneFt.length;
        E.tuneFt.length = 0;
        E.tuneHold = Math.max(0, E.tuneHold - 1);
        if (avg > 21) {
          E.tuneGood = 0;
          if (++E.tuneSlow >= 2) { E.tuneSlow = 0; if (E.tuneBack > 0) E.tuneHold = 60; this._tuneSet(E.tuneLevel + 1); }
        } else {
          E.tuneSlow = 0;
          E.tuneBack = Math.max(0, E.tuneBack - 1);
          // fast again for ~12 s at a reduced level: try one step sharper (a relapse blocks retries for a minute)
          if (avg < 17.6 && E.tuneLevel > 0 && E.tuneHold === 0 && ++E.tuneGood >= 12) { E.tuneGood = 0; E.tuneBack = 3; this._tuneSet(E.tuneLevel - 1); }
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
