/* GHG Town 3D v0.3 — walk-in urban complexes
   _bMinimart()  stop 1  (HFCs in coolers / chillers / condensing units)
   _bHospital()  stop 6  (diesel backup generator)  · stop 7 (N₂O medical gas manifold)
   _bMill()      stop 9  (husk boiler) · stop 10 (diesel forklift) · stop 11 (hired truck)            */
GHG3.complexes = {
  // ================================================================ SHARED HELPERS
  _cxE() {
    const E = this._E;
    E.treeSpots = E.treeSpots || [];
    E.crowdSpots = E.crowdSpots || [];
    E.parkSpots = E.parkSpots || [];
    E.cxMats = E.cxMats || {};
    return E;
  },
  _cxRect(b, x0, z0, x1, z1, col, y) { this.plane(b, (x0 + x1) / 2, y == null ? 0.05 : y, (z0 + z1) / 2, x1 - x0, z1 - z0, col); },

  // straight axis-aligned wall with gaps. axis 'x' = runs along x at z=c ; 'z' = runs along z at x=c.
  // gaps: [[a, b, top]] (top = opening height above y0; lintel drawn above it)
  _cxWall(b, axis, c, a0, a1, y0, h, t, col, gaps, o) {
    o = o || {};
    const gs = (gaps || []).slice().sort((p, q) => p[0] - q[0]);
    const segs = [];
    let cur = a0;
    for (const g of gs) { if (g[0] > cur) segs.push([cur, g[0]]); cur = Math.max(cur, g[1]); }
    if (cur < a1) segs.push([cur, a1]);
    for (const s of segs) {
      const m = (s[0] + s[1]) / 2, L = s[1] - s[0];
      if (L < 0.01) continue;
      if (axis === 'x') { this.box(b, m, y0, c, L, h, t, col, o); if (!o.noCol) this._col(s[0], c - t / 2, s[1], c + t / 2); }
      else { this.box(b, c, y0, m, t, h, L, col, o); if (!o.noCol) this._col(c - t / 2, s[0], c + t / 2, s[1]); }
    }
    for (const g of gs) {
      const top = g[2] == null ? h : g[2];
      if (top >= h) continue;
      const m = (g[0] + g[1]) / 2, L = g[1] - g[0];
      if (axis === 'x') this.box(b, m, y0 + top, c, L, h - top, t, col, o);
      else this.box(b, c, y0 + top, m, t, h - top, L, col, o);
    }
  },
  // see-through glass pane (double sided) into acc G
  _cxGlass(G, axis, c, a0, a1, y0, h) {
    if (axis === 'x') this._face(G, [(a0 + a1) / 2, y0 + h / 2, c], [1, 0, 0], [0, 1, 0], (a1 - a0) / 2, h / 2, '#FFFFFF', { both: true });
    else this._face(G, [c, y0 + h / 2, (a0 + a1) / 2], [0, 0, -1], [0, 1, 0], (a1 - a0) / 2, h / 2, '#FFFFFF', { both: true });
  },
  _cxGlassMesh(G) {
    const E = this._E;
    if (!G.vc) return null;
    const m = new E.T.Mesh(this._accGeo(G), E.mats.glassT);
    m.renderOrder = 2;
    return this._addDyn(m);
  },
  // chain-link wire mesh (alpha-tested texture), quads collected per complex then flushed
  _cxChainMat() {
    const E = this._E;
    const T = E.T;
    if (E.cxMats.chain) return E.cxMats.chain;
    const tex = this._canvasTex(256, 256, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      g.strokeStyle = '#E2E6E9';
      g.lineWidth = 3.2;
      const n = 8, s = W / n;
      for (let i = -n; i <= 2 * n; i++) {
        g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s + H, H); g.stroke();
        g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s - H, H); g.stroke();
      }
    }, { repeat: true });
    E.cxMats.chain = new T.MeshStandardMaterial({ map: tex, transparent: false, alphaTest: 0.45, side: T.DoubleSide, roughness: 0.45, metalness: 0.6, color: this._lcol('#C9CFD3') });
    return E.cxMats.chain;
  },
  // chain-link fence run with posts; F = acc for wire quads
  _cxFence(F, axis, c, a0, a1, y0, h, post, col) {
    const L = a1 - a0;
    if (axis === 'x') this._face(F, [(a0 + a1) / 2, y0 + h / 2, c], [1, 0, 0], [0, 1, 0], L / 2, h / 2, '#FFFFFF', { both: false });
    else this._face(F, [c, y0 + h / 2, (a0 + a1) / 2], [0, 0, -1], [0, 1, 0], L / 2, h / 2, '#FFFFFF', { both: false });
    const n = Math.max(1, Math.round(L / (post || 2.5)));
    for (let i = 0; i <= n; i++) {
      const a = a0 + (L * i) / n;
      if (axis === 'x') this.cyl('shiny', a, y0, c, 0.04, h + 0.05, col || '#9AA1A6', 8);
      else this.cyl('shiny', c, y0, a, 0.04, h + 0.05, col || '#9AA1A6', 8);
    }
    if (axis === 'x') { this.cylR('shiny', (a0 + a1) / 2, y0 + h, c, 0.03, L, col || '#9AA1A6', 0, 0, Math.PI / 2, 6); this._col(a0, c - 0.08, a1, c + 0.08); }
    else { this.cylR('shiny', c, y0 + h, (a0 + a1) / 2, 0.03, L, col || '#9AA1A6', Math.PI / 2, 0, 0, 6); this._col(c - 0.08, a0, c + 0.08, a1); }
  },
  _cxFenceMesh(F) {
    const E = this._E;
    if (!F.vc) return null;
    const m = new E.T.Mesh(this._accGeo(F), this._cxChainMat());
    m.castShadow = false;
    m.receiveShadow = true;
    return this._addDyn(m);
  },
  // dynamic unlit material that dims at night (skylights, translucent sheets)
  _cxDayMat(hex, nightF) {
    const E = this._E;
    const T = E.T;
    const key = 'day' + hex + nightF;
    if (E.cxMats[key]) return E.cxMats[key];
    const base = this._lcol(hex);
    const m = new T.MeshBasicMaterial({ color: base.clone(), side: T.DoubleSide, toneMapped: false });
    this._anim(() => { const k = 1 - (E.nightK || 0) * (1 - nightF); m.color.copy(base).multiplyScalar(k); });
    E.cxMats[key] = m;
    return m;
  },
  // handrail run (top rail, mid rail, posts) at deck level y
  _cxRail(axis, c, a0, a1, y, col) {
    const L = a1 - a0, m = (a0 + a1) / 2;
    const cl = col || '#E2B53B';
    if (axis === 'x') {
      this.box('flat', m, y + 1.02, c, L, 0.05, 0.05, cl);
      this.box('flat', m, y + 0.52, c, L, 0.04, 0.04, cl);
      this.box('flat', m, y, c, L, 0.12, 0.02, cl);
    } else {
      this.box('flat', c, y + 1.02, m, 0.05, 0.05, L, cl);
      this.box('flat', c, y + 0.52, m, 0.04, 0.04, L, cl);
      this.box('flat', c, y, m, 0.02, 0.12, L, cl);
    }
    const n = Math.max(1, Math.round(L / 1.8));
    for (let i = 0; i <= n; i++) {
      const a = a0 + (L * i) / n;
      if (axis === 'x') this.box('flat', a, y, c, 0.05, 1.05, 0.05, cl); else this.box('flat', c, y, a, 0.05, 1.05, 0.05, cl);
    }
  },
  // pallet stack of rice sacks (footprint ~2.4 x 1.9), ry 0 or PI/2
  _cxSacks(x, z, layers, R, rot, yb) {
    const y0 = (yb || 0.12);
    const W = rot ? 1.9 : 2.4, D = rot ? 2.4 : 1.9;
    this.box('wood', x, y0, z, W, 0.14, D, '#B48C5C');
    const cols = ['#F4F2EA', '#EEEBE1', '#F7F6F1', '#E9E5D8'];
    for (let l = 0; l < layers; l++) {
      const y = y0 + 0.14 + l * 0.2;
      const along = (l % 2 === 0) !== !!rot;
      for (let k = 0; k < 4; k++) {
        const c = cols[(R() * cols.length) | 0];
        const j = (R() - 0.5) * 0.05;
        if (along) this.box('flat', x - W / 2 + 0.6 + (k % 2) * 1.2 + j, y, z - D / 2 + 0.48 + ((k / 2) | 0) * 0.95, 1.14, 0.19, 0.9, c, { skip: 'ny' });
        else this.box('flat', x - W / 2 + 0.48 + (k % 2) * 0.95 * (W / 1.9) + j, y, z - D / 2 + 0.6 + ((k / 2) | 0) * 1.2, 0.9, 0.19, 1.14, c, { skip: 'ny' });
      }
      if (l === layers - 1) this.box('flat', x, y + 0.19, z, W * 0.7, 0.012, 0.18, '#3E8E4E');
    }
  },
  // hopper: box body + inverted square pyramid underneath. y = bottom of the body
  _cxHopper(b, x, y, z, w, hb, hp, col) {
    this.box(b, x, y, z, w, hb, w, col);
    this._gput(b, 'cone4', x, y - hp / 2, z, (w / 2) * Math.SQRT2, hp, (w / 2) * Math.SQRT2, Math.PI, Math.PI / 4, 0, col);
  },
  // electric motor lying along axis ('x' or 'z')
  _cxMotor(x, y, z, axis, len, r, col) {
    const c = col || '#3F6F91';
    if (axis === 'x') {
      this.cylR('flat', x, y, z, r, len, c, 0, 0, Math.PI / 2, 14);
      this.cylR('shiny', x + len / 2 + 0.05, y, z, r * 0.25, 0.12, '#A9B0B5', 0, 0, Math.PI / 2, 8);
    } else {
      this.cylR('flat', x, y, z, r, len, c, Math.PI / 2, 0, 0, 14);
      this.cylR('shiny', x, y, z + len / 2 + 0.05, r * 0.25, 0.12, '#A9B0B5', Math.PI / 2, 0, 0, 8);
    }
    this.box('flat', x, y - r - 0.02, z, axis === 'x' ? len * 0.8 : r * 1.6, 0.06, axis === 'x' ? r * 1.6 : len * 0.8, '#2C3135');
  },
  // bucket elevator: boot, twin casings, head with motor. top = head top height
  _cxElevator(x, z, top, col) {
    const c = col || '#3E6E94';
    this.box('flat', x, 0.12, z, 1.3, 1.25, 1.0, c);
    for (const dx of [-0.3, 0.3]) this.box('flat', x + dx, 1.37, z, 0.34, top - 1.37 - 0.95, 0.5, '#4C80A9');
    this.box('flat', x, top - 0.95, z, 1.25, 0.6, 1.0, c);
    this.cylR('flat', x, top - 0.35, z, 0.55, 1.0, c, Math.PI / 2, 0, 0, 16);
    this._cxMotor(x + 0.9, top - 0.6, z + 0.15, 'x', 0.55, 0.2);
    for (let y = 2.4; y < top - 1.2; y += 2.2) this.box('flat', x, y, z, 0.86, 0.06, 0.56, '#2E5878');
    this._col(x - 0.7, z - 0.55, x + 0.7, z + 0.55);
  },
  // boxy machine on legs; returns top y
  _cxMachine(x, z, w, d, h, col, legs, noCol) {
    const y0 = 0.12 + (legs || 0);
    if (legs) for (const sx of [-1, 1]) for (const sz of [-1, 1]) this.box('flat', x + sx * (w / 2 - 0.1), 0.12, z + sz * (d / 2 - 0.1), 0.14, legs, 0.14, '#3A454D');
    this.box('flat', x, y0, z, w, h, d, col);
    this.box('flat', x, y0 + h, z, w + 0.04, 0.05, d + 0.04, '#2A3238');
    if (!noCol) this._col(x - w / 2 - 0.1, z - d / 2 - 0.1, x + w / 2 + 0.1, z + d / 2 + 0.1);
    return y0 + h;
  },
  // light pole with lamp head (registers a street lamp)
  _cxPole(x, z, h, dir) {
    this.cyl('shiny', x, 0, z, 0.09, h, '#8C949A', 8);
    const dx = Math.sin(dir || 0) * 0.9, dz = Math.cos(dir || 0) * 0.9;
    this.box('flat', x + dx / 2, h - 0.08, z + dz / 2, Math.abs(dx) + 0.12, 0.08, Math.abs(dz) + 0.12, '#8C949A');
    this.box('flat', x + dx, h - 0.22, z + dz, 0.55, 0.16, 0.32, '#4A5258');
    this.box('glow', x + dx, h - 0.235, z + dz, 0.45, 0.02, 0.24, '#FFF1D2');
    this._lamp(x + dx, h - 0.3, z + dz, { pool: 8 });
    this._col(x - 0.15, z - 0.15, x + 0.15, z + 0.15);
  },

  // unlit (MeshBasic) material for ceilings / roof liners: keeps interiors evenly lit, dims at night
  _cxUnlit(key, hex, map, nightF) {
    const E = this._E;
    const T = E.T;
    E.cxMats = E.cxMats || {};
    if (E.cxMats[key]) return E.cxMats[key];
    const base = this._lcol(hex);
    const m = new T.MeshBasicMaterial({ color: base.clone(), map: map || null, vertexColors: true });
    if (nightF < 1) this._anim(() => { const k = 1 - (E.nightK || 0) * (1 - nightF); m.color.copy(base).multiplyScalar(k); });
    E.cxMats[key] = m;
    return m;
  },
  _cxLin(key, hex, map, nightF) {
    const E = this._E;
    E.cxLin = E.cxLin || {};
    if (!E.cxLin[key]) E.cxLin[key] = { A: this._newAcc('flat'), mat: this._cxUnlit('lin' + key, hex, map, nightF) };
    return E.cxLin[key].A;
  },
  _cxLinFlush() {
    const E = this._E;
    for (const k in E.cxLin || {}) {
      const L = E.cxLin[k];
      if (!L.A.vc) continue;
      const m = new E.T.Mesh(this._accGeo(L.A), L.mat);
      m.receiveShadow = false;
      m.castShadow = false;
      this._addDyn(m);
      L.A = this._newAcc('flat');
    }
  },
  // inner liner under a gable roof (ridge along x), faces point down/inwards
  _cxRoofLiner(A, xc, ye, zc, w, d, rise, inset) {
    const hd = d / 2, sl = Math.hypot(hd, rise), dy = -(inset || 0.07);
    const uS = [0, rise / sl, -hd / sl], uN = [0, rise / sl, hd / sl];
    this._face(A, [xc, ye + rise / 2 + dy, zc + hd / 2], [-1, 0, 0], uS, w / 2, sl / 2, '#F2F5F7', { tw: 2.2, th: 2.2 });
    this._face(A, [xc, ye + rise / 2 + dy, zc - hd / 2], [1, 0, 0], uN, w / 2, sl / 2, '#DCE2E6', { tw: 2.2, th: 2.2 });
  },
  // flat ceiling / canopy underside (faces down)
  _cxCeil(A, x0, z0, x1, z1, y, col, tw) {
    this._face(A, [(x0 + x1) / 2, y, (z0 + z1) / 2], [1, 0, 0], [0, 0, 1], (x1 - x0) / 2, (z1 - z0) / 2, col || '#FFFFFF', { tw: tw || 4, th: tw || 4 });
  },
  // glossy floor tiles (own material)
  _cxTileMat() {
    const E = this._E;
    const T = E.T;
    if (E.cxMats.tile) return E.cxMats.tile;
    const tex = this._canvasTex(512, 512, (g, W, H) => {
      const n = 4, s = W / n, R = this._rng(77);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = 234 + ((R() * 14) | 0); g.fillStyle = 'rgb(' + v + ',' + (v - 1) + ',' + (v - 5) + ')'; g.fillRect(i * s, j * s, s, s); }
      for (let k = 0; k < 5000; k++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.3)'; g.fillRect(R() * W, R() * H, 2, 2); }
      g.fillStyle = '#B7B3AA';
      for (let i = 0; i <= n; i++) { g.fillRect(i * s - 2, 0, 4, H); g.fillRect(0, i * s - 2, W, 4); }
    }, { repeat: true });
    E.cxMats.tile = new T.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.24, metalness: 0.04 });
    return E.cxMats.tile;
  },

  // ================================================================ MINIMART (stop 1)
  _bMinimart() {
    const E = this._cxE();
    const T = E.T;
    const R = this._rng(5101);
    const pick = (a) => a[(R() * a.length) | 0];
    const G = this._newAcc('flat');
    const BLUE = '#1E4FA3', YEL = '#F7C51E', WHITE = '#F3F2EE';
    const GOODS = ['#E53935', '#FDD835', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#F06292', '#00ACC1', '#FFFFFF', '#6D4C41', '#C0CA33', '#5C6BC0', '#D84315'];
    const DAIRY = ['#FFFFFF', '#E3F2FD', '#FFF176', '#F48FB1', '#A5D6A7', '#FFB74D', '#4FC3F7', '#FFFFFF', '#E57373'];
    const BOTTLES = [{ c: '#4A1C14', h: 0.27 }, { c: '#A8D4F0', h: 0.26 }, { c: '#7DB24E', h: 0.24 }, { c: '#F28C1A', h: 0.22 }, { c: '#F4F4F0', h: 0.2 }, { c: '#F2C618', h: 0.17 }, { c: '#D6243A', h: 0.24 }, { c: '#2E7D32', h: 0.28 }];
    const ICE = ['#F06292', '#FFF176', '#81C784', '#64B5F6', '#FFFFFF', '#A1887F', '#BA68C8'];
    const CEIL = this._cxLin('martCeil', '#E6E9EA', E.tex.plaster, 1);
    const CAN = this._cxLin('canopy', '#E9ECEE', E.tex.concrete, 0.35);

    // ---------- site
    this._cxRect('concrete', -610, -24, -578, -15, '#C6C2BA');
    this._cxRect('concrete', -610, -50, -578, -40, '#B8B4AC');
    this._cxRect('concrete', -610, -40, -606, -24, '#C2BFB8');
    this._cxRect('concrete', -584, -40, -578, -24, '#C2BFB8');
    for (let i = 0; i <= 8; i++) this.box('paint', -609.7 + i * 1.05, 0.05, -19.4, 0.07, 0.02, 3.4, '#EDEDED');
    for (const x of [-583.6, -579.0]) this.box('paint', x, 0.05, -19.5, 0.1, 0.02, 5.0, '#EDEDED');
    this.box('flat', -596, 0.05, -23.1, 3.0, 0.02, 1.6, '#3C4146');

    // ---------- shell
    const X0 = -606, X1 = -584, Z0 = -40, Z1 = -24, H = 5.0, t = 0.25;
    const IX0 = X0 + t, IX1 = X1 - t, IZ0 = Z0 + t;
    this.box('concrete', -595, 0, -32, 22, 0.12, 16, '#D9D6CF', { top: false });
    const FL = this._newAcc('flat');
    this.plane(FL, -595, 0.12, -32, 21.5, 15.6, '#FFFFFF', { tw: 2.4, th: 2.4 });
    const flm = new T.Mesh(this._accGeo(FL), this._cxTileMat());
    flm.receiveShadow = true;
    this._addDyn(flm);
    this._cxWall('plaster', 'x', Z0 + t / 2, X0, X1, 0, H, t, WHITE);
    this._cxWall('plaster', 'z', X0 + t / 2, Z0, Z1, 0, H, t, WHITE);
    this._cxWall('plaster', 'z', X1 - t / 2, Z0, Z1, 0, H, t, WHITE);
    this.box('plaster', X0 - 0.03, 4.15, -32, 0.08, 0.85, 16.1, BLUE);
    this.box('plaster', X0 - 0.04, 3.85, -32, 0.08, 0.3, 16.1, YEL);
    this.box('plaster', X1 + 0.03, 4.15, -32, 0.08, 0.85, 16.1, BLUE);
    this.box('plaster', X1 + 0.04, 3.85, -32, 0.08, 0.3, 16.1, YEL);
    this.box('plaster', -595, 4.15, Z0 - 0.03, 22.1, 0.85, 0.08, BLUE);
    // storefront
    const FZ = -24.1, door = [-597.2, -594.8];
    for (const s of [[IX0, door[0]], [door[1], IX1]]) {
      this.box('shiny', (s[0] + s[1]) / 2, 0.0, FZ, s[1] - s[0], 0.32, 0.12, '#9EA6AC');
      this._cxGlass(G, 'x', FZ, s[0], s[1], 0.32, 2.72);
      this._col(s[0], FZ - 0.12, s[1], FZ + 0.12);
    }
    for (let i = 0; i <= 10; i++) this.box('shiny', IX0 + ((IX1 - IX0) * i) / 10, 0, FZ, 0.09, 3.05, 0.16, '#B7BEC3');
    for (const x of door) this.box('shiny', x, 0, FZ, 0.12, 3.05, 0.2, '#8F989E');
    this.box('shiny', -595, 3.04, FZ, IX1 - IX0, 0.14, 0.2, '#9EA6AC');
    this.box('plaster', -595, 3.18, Z1 - 0.12, 22, H - 3.18, 0.24, BLUE);
    this.box('plaster', -595, 3.18, Z1 + 0.02, 22.1, 0.3, 0.06, YEL);
    for (const s of [[-599.7, -597.3], [-594.7, -592.3]]) {
      this._cxGlass(G, 'x', FZ - 0.16, s[0], s[1], 0.05, 2.95);
      for (const x of s) this.box('shiny', x, 0.04, FZ - 0.16, 0.06, 2.95, 0.06, '#8F989E');
    }
    this.box('glow', -603.2, 2.25, FZ + 0.03, 1.6, 0.42, 0.01, YEL);
    this.box('flat', -588.0, 1.6, FZ + 0.03, 1.2, 0.9, 0.01, '#E94B6A');
    this.box('flat', -586.6, 1.6, FZ + 0.03, 1.2, 0.9, 0.01, '#43A047');
    // ceiling (unlit liner) + roof slab + rooftop tanks
    this._cxCeil(CEIL, IX0, IZ0, IX1, Z1 - 0.2, 3.6, '#FFFFFF', 4);
    this.box('concrete', -595, 3.62, -32, 21.5, 0.2, 15.5, '#C9C5BD', { skip: 'ny' });
    this.box('concrete', -595, 4.55, -32, 21.5, 0.2, 15.5, '#C9C5BD', { skip: 'ny' });
    for (const x of [-602, -599.8]) { this.box('shiny', x, 4.75, -37.5, 1.2, 0.5, 1.2, '#8C949A'); this.cyl('flat', x, 5.25, -37.5, 0.58, 1.35, '#EDEFF0', 16); }
    // canopy with downlights
    this.box('flat', -595, 3.35, -22.5, 22.4, 0.22, 3.0, '#F1F2F3', { skip: 'ny' });
    this._cxCeil(CAN, -606.2, -24.0, -583.8, -21.0, 3.345, '#FFFFFF', 3);
    this.box('plaster', -595, 3.12, -20.98, 22.4, 0.5, 0.14, BLUE);
    this.box('plaster', -595, 3.08, -20.9, 22.4, 0.08, 0.06, YEL);
    for (const x of [-603, -598, -592, -587]) { this.cyl('glow', x, 3.32, -22.4, 0.14, 0.02, '#FFF6DE', 12); this._lamp(x, 3.25, -22.4, { pool: 3.6 }); }

    // ---------- signs
    const BJ = '"Bai Jamjuree", "IBM Plex Sans Thai Looped", sans-serif';
    this._sign('CARBON MART', 9.2, 1.18, BLUE, '#FFFFFF', [-595, 4.36, Z1 + 0.07], 0, { border: YEL, size: 0.62, fam: BJ });
    this._sign('คาร์บอนมาร์ท · เปิด 24 ชั่วโมง', 7.0, 0.42, BLUE, '#FFFFFF', [-595, 3.37, -20.9], 0, { size: 0.72 });
    this._sign('CARBON MART', 7.0, 1.0, BLUE, '#FFFFFF', [X0 - 0.09, 4.42, -32], -Math.PI / 2, { border: YEL, size: 0.6, fam: BJ });
    this.cyl('shiny', -608.8, 0, -16.6, 0.13, 5.4, '#9EA6AC', 10);
    this.box('flat', -608.8, 5.3, -16.6, 2.0, 1.75, 0.22, '#17305E', { ry: Math.PI / 4 });
    this._sign('CARBON MART\nเปิด 24 ชั่วโมง', 1.9, 1.5, BLUE, '#FFFFFF', [-608.8 + 0.12 * Math.SQRT1_2, 6.18, -16.6 + 0.12 * Math.SQRT1_2], Math.PI / 4, { border: YEL, fam: BJ });
    this._sign('CARBON MART\nเปิด 24 ชั่วโมง', 1.9, 1.5, BLUE, '#FFFFFF', [-608.8 - 0.12 * Math.SQRT1_2, 6.18, -16.6 - 0.12 * Math.SQRT1_2], Math.PI / 4 + Math.PI, { border: YEL, fam: BJ });
    this._col(-609.0, -16.8, -608.6, -16.4);

    // ---------- north wall: beverage coolers (8 glass doors) + open multideck chillers (facing south)
    const cw0 = -604.9, nD = 8, dW = 1.4, cz = IZ0, cd = 0.95, ch = 2.3;
    const cx1 = cw0 + nD * dW, cxm = (cw0 + cx1) / 2;
    this.box('flat', cxm, 0.12, cz + cd / 2, nD * dW, 0.22, cd, '#2B3035');
    this.box('flat', cxm, 0.12 + ch - 0.28, cz + cd / 2, nD * dW, 0.28, cd, '#2B3035');
    this.box('glow', cxm, 0.12 + ch - 0.24, cz + cd + 0.006, nD * dW - 0.1, 0.16, 0.01, '#8CC8FF');
    this.box('glow', cxm, 0.34, cz + 0.06, nD * dW, ch - 0.62, 0.04, '#DCEAF4');
    for (const x of [cw0, cx1]) this.box('flat', x, 0.12, cz + cd / 2, 0.08, ch, cd, '#2B3035');
    for (let d = 0; d < nD; d++) {
      const x0 = cw0 + d * dW;
      for (let s = 0; s < 5; s++) {
        const y = 0.38 + s * 0.36;
        this.box('shiny', x0 + dW / 2, y, cz + 0.48, dW - 0.08, 0.025, 0.72, '#C9CED2');
        const kd = pick(BOTTLES);
        for (let k = 0; k < 6; k++) this.cyl('flat', x0 + 0.17 + k * 0.212, y + 0.025, cz + 0.6, 0.038, kd.h, kd.c, 6);
      }
      this.box('flat', x0, 0.34, cz + cd - 0.03, 0.07, ch - 0.62, 0.06, '#1E2226');
      this._cxGlass(G, 'x', cz + cd - 0.02, x0 + 0.04, x0 + dW - 0.04, 0.36, ch - 0.66);
      this.box('shiny', x0 + dW - 0.17, 0.95, cz + cd + 0.03, 0.035, 0.8, 0.04, '#D6DADD');
    }
    this._col(cw0 - 0.06, cz, cx1 + 0.06, cz + cd + 0.06);
    // multideck chillers x -593.3 .. -588.3
    const mx0 = -593.3, mx1 = -588.3, mxc = (mx0 + mx1) / 2, mL = mx1 - mx0, md = 0.95;
    this.box('flat', mxc, 0.12, cz + md / 2, mL, 0.45, md, '#E9ECEE');
    this.box('flat', mxc, 0.57, cz + 0.09, mL, 1.42, 0.18, '#2E353B');
    this.box('flat', mxc, 1.98, cz + md / 2 - 0.05, mL, 0.2, md - 0.1, '#EEF1F3');
    this.box('glow', mxc, 1.955, cz + md / 2 - 0.22, mL - 0.2, 0.02, 0.24, '#F4FAFF');
    this.box('glow', mxc, 2.0, cz + md - 0.02, mL - 0.1, 0.16, 0.012, '#2E8BE6');
    for (const x of [mx0, mx0 + 2.5, mx1]) this.box('flat', x, 0.12, cz + md / 2, 0.06, 2.06, md, '#E3E7EA');
    for (const sh of [[0.62, 0.78], [0.92, 0.68], [1.22, 0.58], [1.52, 0.48]]) {
      const y = sh[0], dp = sh[1];
      this.box('shiny', mxc, y, cz + 0.18 + dp / 2, mL - 0.12, 0.03, dp, '#CDD2D6');
      this.box('flat', mxc, y - 0.03, cz + 0.18 + dp - 0.01, mL - 0.12, 0.07, 0.02, '#F2C21B');
      let x = mx0 + 0.1;
      while (x < mx1 - 0.3) {
        const w = 0.16 + R() * 0.3, h = 0.09 + R() * 0.17;
        this.box('flat', x + w / 2, y + 0.03, cz + 0.18 + dp / 2, w - 0.03, h, dp * 0.78, pick(DAIRY), { skip: 'ny' });
        x += w;
      }
    }
    this.box('flat', mxc, 0.52, cz + md - 0.03, mL - 0.1, 0.05, 0.05, '#30363C');
    this._col(mx0 - 0.06, cz, mx1 + 0.06, cz + md + 0.06);
    this.box('flat', -587.1, 0.12, cz + 0.03, 1.2, 2.2, 0.06, '#7D8790');
    this.box('shiny', -586.7, 1.05, cz + 0.07, 0.3, 0.08, 0.03, '#C8CDD1');

    // ---------- east wall: ice merchandiser + snack wall shelving (facing west)
    const ex = IX1;
    this.box('flat', ex - 0.05, 0.12, -36.2, 0.1, 2.05, 2.0, '#DCEBF5');
    for (const sz of [-37.17, -35.23]) this.box('flat', ex - 0.42, 0.12, sz, 0.84, 2.05, 0.06, '#DCEBF5');
    this.box('flat', ex - 0.42, 0.12, -36.2, 0.84, 0.18, 2.0, '#C9D9E4');
    this.box('flat', ex - 0.42, 1.82, -36.2, 0.84, 0.35, 2.0, '#DCEBF5');
    this.box('glow', ex - 0.85, 1.86, -36.2, 0.012, 0.26, 1.9, '#3FA2E8');
    for (let s = 0; s < 3; s++) this.box('shiny', ex - 0.42, 0.28 + s * 0.48, -36.2, 0.7, 0.02, 1.86, '#C9CED2');
    for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++) this.box('flat', ex - 0.42, 0.3 + s * 0.48, -36.9 + k * 0.45, 0.5, 0.3, 0.36, '#F7FBFF');
    this._cxGlass(G, 'z', ex - 0.86, -37.1, -35.3, 0.3, 1.5);
    this._col(ex - 0.9, -37.25, ex, -35.15);
    this.box('flat', ex - 0.04, 0.12, -31.6, 0.08, 1.95, 6.0, '#E5E9EC');
    this.box('flat', ex - 0.27, 0.12, -31.6, 0.5, 0.12, 6.0, '#3A4148');
    for (const sz of [-34.62, -28.58]) this.box('flat', ex - 0.27, 0.12, sz, 0.5, 1.95, 0.05, '#E5E9EC');
    for (let s = 0; s < 5; s++) {
      const y = 0.25 + s * 0.36;
      this.box('shiny', ex - 0.3, y, -31.6, 0.42, 0.025, 5.9, '#C6CBCF');
      let z = -34.5;
      while (z < -28.75) {
        const w = 0.11 + R() * 0.22, h = 0.09 + R() * 0.18;
        this.box('flat', ex - 0.3, y + 0.025, z + w / 2, 0.32, h, w - 0.02, pick(GOODS), { skip: 'px ny' });
        z += w;
      }
    }
    this.box('flat', ex - 0.27, 2.07, -31.6, 0.54, 0.3, 6.0, YEL);
    this._col(ex - 0.56, -34.65, ex, -28.55);

    // ---------- low gondola shelving (eye-level sight lines over them)
    const zc = -33.75, GL = 6.5;
    for (const gx of [-602.3, -598.45, -594.6]) {
      this.box('flat', gx, 0.12, zc, 0.9, 0.12, GL, '#3A4148');
      this.box('flat', gx, 0.24, zc, 0.06, 1.2, GL, '#D8DDE1');
      this.box('flat', gx, 1.44, zc, 0.9, 0.04, GL, '#C9CED2');
      for (const sd of [-1, 1]) {
        for (let s = 0; s < 3; s++) {
          const y = 0.3 + s * 0.38;
          this.box('shiny', gx + sd * 0.24, y, zc, 0.42, 0.025, GL, '#C6CBCF');
          this.box('flat', gx + sd * 0.45, y - 0.04, zc, 0.012, 0.06, GL, '#F2C21B');
          let z = zc - GL / 2 + 0.05;
          while (z < zc + GL / 2 - 0.2) {
            const w = 0.11 + R() * 0.24, h = 0.09 + R() * 0.2;
            this.box('flat', gx + sd * 0.25, y + 0.025, z + w / 2, 0.32, h, w - 0.02, pick(GOODS), { skip: (sd > 0 ? 'nx' : 'px') + ' ny' });
            z += w;
          }
        }
        let z2 = zc - GL / 2 + 0.05;
        while (z2 < zc + GL / 2 - 0.2) {
          const w = 0.2 + R() * 0.4;
          this.box('flat', gx + sd * 0.22, 1.48, z2 + w / 2, 0.36, 0.1 + R() * 0.16, w - 0.03, pick(GOODS));
          z2 += w;
        }
      }
      for (const e of [-1, 1]) {
        const ez = zc + e * (GL / 2 + 0.26);
        this.box('flat', gx, 0.12, ez, 0.9, 1.05, 0.5, '#E5E9EC');
        for (let k = 0; k < 3; k++) this.box('flat', gx - 0.3 + k * 0.3, 1.17, ez, 0.26, 0.2 + R() * 0.14, 0.36, pick(GOODS));
        this.box('flat', gx, 1.62, ez, 0.86, 0.3, 0.04, YEL);
        this.box('flat', gx, 1.17, ez, 0.04, 0.45, 0.04, '#9EA6AC');
      }
      this._col(gx - 0.5, zc - GL / 2 - 0.55, gx + 0.5, zc + GL / 2 + 0.55);
    }

    // ---------- ice-cream chest freezers
    for (const fz of [-29.3, -27.0]) {
      const fx = -588.4, W = 1.7, D = 0.82;
      this.box('flat', fx, 0.12, fz, W, 0.4, D, '#F1F3F4');
      this.box('flat', fx, 0.52, fz - D / 2 + 0.04, W, 0.46, 0.08, '#F1F3F4');
      this.box('flat', fx, 0.52, fz + D / 2 - 0.04, W, 0.46, 0.08, '#F1F3F4');
      this.box('flat', fx - W / 2 + 0.04, 0.52, fz, 0.08, 0.46, D - 0.16, '#F1F3F4');
      this.box('flat', fx + W / 2 - 0.04, 0.52, fz, 0.08, 0.46, D - 0.16, '#F1F3F4');
      for (let k = 0; k < 10; k++) this.box('flat', fx - 0.68 + (k % 5) * 0.34, 0.52, fz - 0.17 + ((k / 5) | 0) * 0.34, 0.3, 0.12 + R() * 0.16, 0.3, pick(ICE), { skip: 'ny' });
      this._face(G, [fx, 0.99, fz], [1, 0, 0], [0, 0, -1], W / 2 - 0.06, D / 2 - 0.06, '#FFFFFF', { both: true });
      this.box('glow', fx, 0.24, fz + D / 2 + 0.006, W - 0.24, 0.2, 0.01, '#E94B6A');
      this._col(fx - W / 2 - 0.06, fz - D / 2 - 0.06, fx + W / 2 + 0.06, fz + D / 2 + 0.06);
    }

    // ---------- cashier counter, POS, cigarette cabinet, coffee & snack warmer
    this.box('flat', -604.1, 0.12, -27.8, 1.0, 0.95, 4.8, '#E7E2D8', { top: 'wood', topCol: '#C9A27A' });
    this.box('flat', -603.58, 0.2, -27.8, 0.04, 0.7, 4.6, BLUE);
    this.box('flat', -603.57, 0.6, -27.8, 0.03, 0.12, 4.6, YEL);
    this.box('flat', -604.15, 1.07, -27.2, 0.1, 0.34, 0.44, '#202428');
    this.box('glow', -604.09, 1.12, -27.2, 0.01, 0.26, 0.38, '#7FD3F5');
    this.box('flat', -603.9, 1.07, -28.2, 0.34, 0.08, 0.42, '#2B2F33');
    this.box('flat', -605.55, 1.05, -27.8, 0.4, 1.4, 3.8, '#2A2E33');
    this.box('glow', -605.34, 1.1, -27.8, 0.01, 1.3, 3.7, '#F6E7C8');
    for (let s = 0; s < 4; s++) for (let k = 0; k < 14; k++) this.box('flat', -605.42, 1.16 + s * 0.32, -29.55 + k * 0.25, 0.08, 0.14, 0.2, pick(['#C62828', '#1565C0', '#F9A825', '#2E7D32', '#FFFFFF']));
    this.box('flat', -604.1, 1.07, -25.75, 0.5, 0.66, 0.45, '#3A2E2A');
    this.box('glow', -603.84, 1.45, -25.75, 0.01, 0.16, 0.24, '#7CFF9E');
    this.box('glow', -604.1, 1.07, -29.7, 0.55, 0.38, 0.7, '#F2A65A');
    this._col(-605.8, -30.25, -603.5, -25.35);

    // ---------- split ACs, ceiling LED panels, posters
    for (const ax of [-601.5, -596.5]) { this.box('flat', ax, 2.78, cz + 0.13, 1.0, 0.32, 0.24, '#F4F5F6'); this.box('flat', ax, 2.8, cz + 0.26, 0.9, 0.04, 0.02, '#BFC5CA'); }
    for (const az of [-36.0, -31.0]) { this.box('flat', IX0 + 0.13, 2.85, az, 0.24, 0.32, 1.0, '#F4F5F6'); this.box('flat', IX0 + 0.26, 2.87, az, 0.02, 0.04, 0.9, '#BFC5CA'); }
    for (const z of [-36.5, -32.5, -28.5]) for (const x of [-603, -599, -595, -591, -587]) this.box('glow', x, 3.57, z, 1.2, 0.03, 0.3, '#F5F9FF');
    for (let k = 0; k < 2; k++) this.box('flat', IX0 + 0.01, 2.0, -38.0 + k * 9.5, 0.02, 0.9, 1.6, pick(['#E94B6A', '#2E8BE6', '#43A047', '#FB8C00']));

    // ---------- back yard: condensing units, wall condensers, refrigerant piping, bins, wall
    this.box('shiny', -600.6, 0.05, -44.2, 7.6, 0.45, 2.0, '#8F989E');
    for (const ux of [-603.2, -600.6, -598.0]) {
      this.box('flat', ux, 0.5, -44.2, 2.2, 1.25, 1.1, '#E2E5E7');
      this.box('flat', ux, 0.75, -43.64, 2.0, 0.7, 0.02, '#B9BFC3');
      for (const fo of [-0.52, 0.52]) {
        this.cyl('flat', ux + fo, 1.75, -44.2, 0.42, 0.06, '#2B2F33', 16);
        this.cyl('shiny', ux + fo, 1.81, -44.2, 0.08, 0.03, '#9AA1A6', 8);
      }
      this.tube('flat', [[ux + 0.8, 1.0, -43.6], [ux + 0.8, 1.0, -40.65], [ux + 0.8, 3.75, -40.65], [ux + 0.8, 3.75, -40.1]], 0.05, '#1C1C1C', 8);
      this.tube('flat', [[ux + 0.95, 0.95, -43.6], [ux + 0.95, 0.95, -40.55], [ux + 0.95, 3.6, -40.55], [ux + 0.95, 3.6, -40.1]], 0.02, '#B87333', 6);
    }
    this.box('glow', -600.6, 1.0, -43.58, 0.16, 0.06, 0.01, '#5CFF7A');
    for (const wx of [-592.0, -589.4]) {
      this.box('flat', wx, 1.4, -40.48, 0.85, 0.6, 0.32, '#E9ECEE');
      this.cylR('flat', wx - 0.12, 1.7, -40.66, 0.2, 0.02, '#2B2F33', Math.PI / 2, 0, 0, 12);
      for (const bx of [-0.3, 0.3]) this.box('shiny', wx + bx, 1.32, -40.4, 0.04, 0.06, 0.45, '#9AA1A6');
      this.tube('flat', [[wx + 0.35, 1.7, -40.42], [wx + 0.35, 3.4, -40.3], [wx + 0.35, 3.4, -40.05]], 0.03, '#E6E6E6', 6);
    }
    this.box('flat', -585.6, 1.2, -40.18, 0.6, 0.8, 0.2, '#C8CDD1');
    this.box('flat', -587.1, 0.0, -40.03, 1.1, 2.2, 0.06, '#7D8790');
    for (const b2 of [[-582.6, '#2E7D32'], [-581.6, '#1565C0']]) { this.box('flat', b2[0], 0.05, -46.2, 0.75, 1.05, 0.85, b2[1]); this.box('flat', b2[0], 1.1, -46.2, 0.8, 0.06, 0.9, '#263238'); }
    this._col(-604.45, -45.3, -596.75, -43.1);
    this._col(-592.5, -40.75, -588.95, -40.05);
    this._col(-583.05, -46.7, -581.15, -45.7);
    this._cxWall('concrete', 'x', -49.85, -610, -578, 0, 2.2, 0.3, '#D3CFC6');
    this._cxWall('concrete', 'z', -609.85, -49.7, -44.0, 0, 2.2, 0.3, '#D3CFC6');
    this._cxWall('concrete', 'z', -578.15, -49.7, -44.0, 0, 2.2, 0.3, '#D3CFC6');
    this._lamp(-595, 3.4, -40.7, { pool: 4.5 });
    this.box('glow', -595, 3.35, -40.2, 0.4, 0.14, 0.12, '#FFF1D2');
    this.box('wood', -603.4, 0.42, -23.0, 1.8, 0.06, 0.45, '#A9774B');
    for (const bx of [-604.1, -602.7]) this.box('flat', bx, 0.05, -23.0, 0.08, 0.38, 0.4, '#3A3F44');
    this._col(-604.35, -23.25, -602.45, -22.75);

    this._cxGlassMesh(G);
    this._cxLinFlush();

    // ---------- people, vehicles, trees
    E.crowdSpots.push({ x: -605.0, z: -27.6, yaw: Math.PI / 2, mode: 'stand', outfit: 'shop' });
    E.crowdSpots.push({ x: -599.8, z: -38.2, yaw: Math.PI, mode: 'stand', outfit: 'casual' });
    E.crowdSpots.push({ x: -600.4, z: -35.2, yaw: Math.PI / 2, mode: 'stand', outfit: 'student' });
    E.crowdSpots.push({ x: -603.4, z: -22.95, yaw: 0, mode: 'sit', outfit: 'casual' });
    for (let i = 0; i < 7; i++) E.parkSpots.push({ x: -609.2 + i * 1.05, z: -19.6, yaw: Math.PI, kind: 'moto', color: pick(['#C62828', '#1565C0', '#212121', '#ECEFF1', '#2E7D32', '#F9A825']) });
    E.parkSpots.push({ x: -581.3, z: -19.5, yaw: Math.PI, kind: 'pickup', color: '#ECEFF1' });
    E.treeSpots.push({ x: -608.2, z: -47.6, s: 0.8, kind: 'mango' });
    E.treeSpots.push({ x: -580.0, z: -48.0, s: 0.7, kind: 'banana' });

    // ---------- interior + stop anchor
    this._interior({
      name: 'minimart', rect: [IX0, IZ0, IX1, Z1 - 0.25], helmet: false, label: 'ภายในร้านคาร์บอนมาร์ท',
      lights: [[-602, 3.3, -36], [-595, 3.3, -36], [-588, 3.3, -36], [-602, 3.3, -28.5], [-595, 3.3, -28.5], [-588, 3.3, -28.5]]
        .map((p) => [p[0], p[1], p[2], '#F2F6FF', 1.0, 11])
    });
    this._stopAnchor(1, {
      view: [-591.2, -30.5], look: [-595.5, 1.4, -38.9], guide: [-590.3, -32.75],
      pin: [-590.8, 2.75, -39.2], emit: [-590.8, 1.9, -39.0], gas: ['HFCs'], spread: 1.3,
      route: [[-596, -12], [-596, -20], [-596, -24.1], [-596, -27], [-592.4, -29.2], [-591.2, -30.5]],
      inside: 'minimart', district: 'market'
    });
  },

  // ================================================================ HOSPITAL (stops 6, 7)
  _cxAmbulance() {
    const E = this._E;
    const T = E.T;
    const g = new T.Group();
    const W = '#F7F7F5', OR = '#F26A1B';
    this._bakeMesh((A) => {
      this.box(A, 0, 0.45, -0.75, 2.05, 2.15, 3.9, W);
      this.box(A, 0, 0.45, 1.75, 2.0, 1.75, 1.1, W);
      this.box(A, 0, 0.45, 2.55, 1.96, 0.85, 0.5, W);
      this.box(A, 0, 1.25, 2.31, 1.86, 0.88, 0.04, '#26323C');
      for (const sx of [-1.005, 1.005]) { this.box(A, sx, 1.3, 1.75, 0.02, 0.72, 0.9, '#26323C'); this.box(A, sx, 1.15, -0.75, 0.02, 0.24, 3.92, OR); this.box(A, sx, 1.15, 1.6, 0.02, 0.24, 1.4, OR); }
      this.box(A, 0, 1.15, -2.705, 2.06, 0.24, 0.02, OR);
      this.box(A, 0, 0.62, -2.71, 0.02, 1.85, 0.01, '#B9BEC2');
      this.box(A, 0, 0.35, 2.82, 2.0, 0.32, 0.12, '#B9BEC2');
      for (const sx of [-0.72, 0.72]) { this.box(A, sx, 0.88, 2.81, 0.34, 0.16, 0.02, '#FFF6D8'); this.box(A, sx, 1.05, -2.72, 0.22, 0.4, 0.02, '#D32F2F'); }
      for (const z of [-1.75, 1.75]) for (const sx of [-0.95, 0.95]) this.cylR(A, sx, 0.38, z, 0.38, 0.26, '#1C1C1C', 0, 0, Math.PI / 2, 14);
      this.box(A, 0, 2.6, 1.0, 1.6, 0.06, 0.36, '#D0D4D8');
      this.box(A, 0, 1.6, -2.72, 0.5, 0.14, 0.01, '#2E7D32');
      this.box(A, 0, 1.43, -2.72, 0.14, 0.48, 0.01, '#2E7D32');
    }, { parent: g });
    const red = new T.MeshBasicMaterial({ color: 0xff2020, toneMapped: false });
    const blue = new T.MeshBasicMaterial({ color: 0x2050ff, toneMapped: false });
    const geo = new T.BoxGeometry(0.62, 0.16, 0.3);
    const mr = new T.Mesh(geo, red), mb = new T.Mesh(geo, blue);
    mr.position.set(-0.42, 2.74, 1.0); mb.position.set(0.42, 2.74, 1.0);
    g.add(mr); g.add(mb);
    this._anim((dt, t) => {
      const ph = Math.floor(t * 5) % 4;
      const a = ph === 0 || ph === 2, b = ph === 1 || ph === 3;
      red.color.setRGB(a ? 1 : 0.18, a ? 0.08 : 0.02, a ? 0.08 : 0.02);
      blue.color.setRGB(b ? 0.12 : 0.01, b ? 0.25 : 0.03, b ? 1 : 0.16);
    });
    return g;
  },

  _bHospital() {
    const E = this._cxE();
    const T = E.T;
    const R = this._rng(6202);
    const pick = (a) => a[(R() * a.length) | 0];
    const GRN = '#1B6E4A', WHT = '#F3F4F1';
    const F = this._newAcc('flat');   // chain-link
    // ---------- surfaces (non-overlapping)
    const asp = (x0, z0, x1, z1) => this._cxRect('asphalt', x0, z0, x1, z1, '#E2E2E2');
    const con = (x0, z0, x1, z1, c) => this._cxRect('concrete', x0, z0, x1, z1, c || '#CFCBC3', 0.06);
    const lawn = (x0, z0, x1, z1) => this._cxRect('grass', x0, z0, x1, z1, '#E6EFD8', 0.03);
    asp(129, 18, 391, 48);
    asp(164, 48, 172, 160);
    asp(164, 160, 340, 170);
    asp(176, 170, 340, 199);
    con(150, 58, 163, 98);
    con(172, 94, 232, 126, '#C7C2B8');
    con(190, 48, 290, 54);
    con(290, 48, 328, 62);
    for (const s of [[129, 164], [172, 204], [214, 266], [276, 306], [318, 391]]) lawn(s[0], 14, s[1], 18);
    for (const s of [[164, 172], [204, 214], [266, 276], [306, 318]]) asp(s[0], 14, s[1], 18);
    lawn(129, 48, 150, 201); lawn(150, 48, 164, 58); lawn(150, 98, 164, 201);
    lawn(172, 48, 190, 94); lawn(232, 94, 391, 160); lawn(328, 48, 391, 94);
    lawn(340, 160, 391, 201); lawn(164, 170, 176, 201); lawn(172, 126, 232, 160);
    lawn(190, 54, 200, 70); lawn(280, 54, 290, 62);
    // hedges along the frontage (with driveway gaps)
    for (const s of [[130, 163.2], [172.8, 203.2], [214.8, 265.2], [276.8, 305.2], [318.8, 390]]) {
      this.box('grass', (s[0] + s[1]) / 2, 0.03, 16.0, s[1] - s[0], 0.85, 1.1, '#9FBF7F');
      this._col(s[0], 15.4, s[1], 16.6);
    }
    // markings: parking bays & drop-off arrows
    for (let x = 132; x <= 160; x += 2.7) { this.box('paint', x, 0.05, 25.5, 0.1, 0.02, 5.0, '#F2F2F2'); this.box('paint', x, 0.05, 40.5, 0.1, 0.02, 5.0, '#F2F2F2'); }
    for (let x = 332; x <= 388; x += 2.7) { this.box('paint', x, 0.05, 25.5, 0.1, 0.02, 5.0, '#F2F2F2'); this.box('paint', x, 0.05, 40.5, 0.1, 0.02, 5.0, '#F2F2F2'); }
    for (let k = 0; k < 8; k++) this.box('paint', 232 + k * 2.2, 0.05, 40, 1.1, 0.02, 3.4, '#F2F2F2');
    this.box('grass', 240, 0.03, 30.5, 36, 0.5, 6, '#9FBF7F');
    this._col(222, 27.5, 258, 33.5);

    // ---------- main tower (6 floors), podium, ER wing
    this.box('office', 240, 0, 82, 100, 22.5, 24, '#EEF6F8', { top: 'concrete', topCol: '#CFCBC3' });
    this._col(190, 70, 290, 94);
    for (let f = 1; f <= 6; f++) this.box('concrete', 240, f * 3.75 - 0.2, 82, 101.6, 0.22, 25.6, '#F4F4F0', { tw: 3, th: 3 });
    for (const cx of [189.6, 290.4]) for (const cz of [69.6, 94.4]) this.box('concrete', cx, 0, cz, 1.3, 23.1, 1.3, '#F6F6F2');
    for (let k = 1; k < 13; k++) { const x = 190 + k * (100 / 13); this.box('concrete', x, 8.4, 69.62, 0.32, 14.1, 0.62, '#F6F6F2'); this.box('concrete', x, 0, 94.38, 0.32, 22.5, 0.62, '#F6F6F2'); }
    this.box('concrete', 240, 22.5, 69.85, 100.6, 1.1, 0.3, '#F2F2EE');
    this.box('concrete', 240, 22.5, 94.15, 100.6, 1.1, 0.3, '#F2F2EE');
    this.box('concrete', 190.15, 22.5, 82, 0.3, 1.1, 24, '#F2F2EE');
    this.box('concrete', 289.85, 22.5, 82, 0.3, 1.1, 24, '#F2F2EE');
    this.box('plaster', 214, 22.5, 86, 9, 5.5, 6, '#E9E8E3', { top: 'concrete' });
    for (const cx of [252, 262]) { this.cyl('shiny', cx, 22.5, 88, 1.9, 3.2, '#B6BFC5', 18); this.cyl('flat', cx, 25.7, 88, 1.3, 0.6, '#2B3135', 16); }
    for (const cx of [272, 276.5, 281]) { this.box('flat', cx, 22.5, 77, 1.6, 0.6, 1.6, '#8C949A'); this.cyl('flat', cx, 23.1, 77, 0.95, 2.1, '#2F6EA8', 14); }
    // rooftop billboard + green cross
    for (const fx of [222, 242]) this.box('flat', fx, 22.5, 70.6, 0.18, 4.6, 0.18, '#5E666C');
    this._sign('โรงพยาบาลเมืองคาร์บอน', 30, 3.6, '#FFFFFF', GRN, [232, 25.3, 70.35], Math.PI, { border: GRN, size: 0.62 });
    this.box('glow', 263.5, 23.6, 69.55, 3.4, 1.05, 0.25, '#25C25F');
    this.box('glow', 263.5, 22.78, 69.55, 1.05, 2.7, 0.25, '#25C25F');
    // podium (OPD) with entrance
    this.box('plaster', 240, 0, 62, 80, 8.4, 16, WHT, { top: 'concrete', topCol: '#CFCBC3' });
    this._col(200, 54, 280, 70);
    for (const y0 of [1.0, 5.2]) {
      this.box('office', 214, y0, 53.94, 26, 2.3, 0.1, '#FFFFFF', { v0: 0.068, th: 13.07 });
      this.box('office', 266, y0, 53.94, 26, 2.3, 0.1, '#FFFFFF', { v0: 0.068, th: 13.07 });
      for (const sx of [199.94, 280.06]) this.box('office', sx, y0, 62, 0.1, 2.3, 13, '#FFFFFF', { v0: 0.068, th: 13.07 });
    }
    this.box('office', 240, 5.2, 53.94, 24, 2.3, 0.1, '#FFFFFF', { v0: 0.068, th: 13.07 });
    this.box('glass', 240, 0.12, 53.92, 14, 3.3, 0.14, '#5E7480');
    for (let k = 0; k <= 6; k++) this.box('shiny', 233 + k * (14 / 6), 0.12, 53.85, 0.1, 3.3, 0.18, '#A9B1B6');
    this.box('plaster', 240, 8.4, 54.2, 80.4, 0.5, 0.4, '#E3E8E6');
    // main entrance canopy
    this.box('concrete', 240, 4.8, 48, 28, 0.32, 12, '#EEEDE8', { tw: 3, th: 3, skip: 'ny' });
    this._cxCeil(this._cxLin('canopy', '#E9ECEE', E.tex.concrete, 0.35), 226, 42, 254, 54, 4.795, '#FFFFFF', 3);
    for (const cx of [227.5, 252.5]) { this.cyl('concrete', cx, 0, 42.8, 0.3, 4.8, '#E9E7E1', 14); this._col(cx - 0.35, 42.45, cx + 0.35, 43.15); }
    this.box('plaster', 240, 4.55, 42.08, 28.2, 0.66, 0.22, GRN);
    this._sign('โรงพยาบาลเมืองคาร์บอน', 12, 0.62, GRN, '#FFFFFF', [240, 4.88, 41.94], Math.PI, { size: 0.66 });
    for (const x of [232, 240, 248]) { this.cyl('glow', x, 4.78, 47, 0.16, 0.02, '#FFF6DE', 12); this._lamp(x, 4.7, 47, { pool: 4 }); }
    // ER wing + ER canopy
    this.box('plaster', 309, 0, 78, 38, 8.4, 32, '#F2F1EC', { top: 'concrete', topCol: '#CFCBC3' });
    this._col(290, 62, 328, 94);
    this.box('plaster', 309, 7.2, 78, 38.3, 0.9, 32.3, '#C8102E');
    for (const y0 of [1.0, 4.6]) { this.box('office', 300, y0, 61.94, 14, 2.0, 0.1, '#FFFFFF', { v0: 0.068, th: 11.4 }); this.box('office', 328.06, y0, 80, 0.1, 2.0, 24, '#FFFFFF', { v0: 0.068, th: 11.4 }); }
    this.box('glass', 315, 0.12, 61.92, 9, 3.2, 0.14, '#5E7480');
    this.box('concrete', 312, 4.3, 54, 28, 0.3, 16, '#EDECE7', { tw: 3, th: 3, skip: 'ny' });
    this._cxCeil(this._cxLin('canopy', '#E9ECEE', E.tex.concrete, 0.35), 298, 46, 326, 62, 4.295, '#FFFFFF', 3);
    for (const cx of [299.5, 324.5]) { this.cyl('concrete', cx, 0, 46.9, 0.28, 4.3, '#E4E2DC', 12); this._col(cx - 0.32, 46.58, cx + 0.32, 47.22); }
    this.box('plaster', 312, 4.0, 46.08, 28.2, 0.8, 0.22, '#C8102E');
    this._sign('ห้องฉุกเฉิน · EMERGENCY', 12, 0.66, '#C8102E', '#FFFFFF', [312, 4.4, 45.94], Math.PI, { size: 0.62 });
    for (const x of [304, 312, 320]) { this.cyl('glow', x, 4.28, 54, 0.15, 0.02, '#FFF6DE', 12); this._lamp(x, 4.2, 54, { pool: 4 }); }
    const amb = this._cxAmbulance();
    amb.position.set(311.5, 0.06, 52.8);
    amb.rotation.y = Math.PI;
    this._addDyn(amb);
    this._colBox(311.5, 52.8, 2.1, 5.6, 0, 0.1);
    this._sign('รถพยาบาล', 1.9, 0.42, null, '#E05A1A', [312.53, 1.75, 53.4], Math.PI / 2, { size: 0.8 });
    this._sign('รถพยาบาล', 1.9, 0.42, null, '#E05A1A', [310.47, 1.75, 53.4], -Math.PI / 2, { size: 0.8 });

    // ---------- generator house (stop 6)
    const gx0 = 178, gx1 = 192, gz0 = 106, gz1 = 118, gh = 4.2, gt = 0.25, gwc = '#D8D4CB';
    this.box('concrete', (gx0 + gx1) / 2, 0, (gz0 + gz1) / 2, gx1 - gx0, 0.14, gz1 - gz0, '#B5B1A8');
    this._cxWall('concrete', 'z', gx0 + gt / 2, gz0, gz1, 0, gh, gt, gwc, [[109, 115, 3.6]]);
    this._cxWall('concrete', 'x', gz0 + gt / 2, gx0, gx1, 0, gh, gt, gwc);
    this._cxWall('concrete', 'x', gz1 - gt / 2, gx0, gx1, 0, gh, gt, gwc);
    this._cxWall('concrete', 'z', gx1 - gt / 2, gz0, gz1, 0, gh, gt, gwc);
    this.box('concrete', (gx0 + gx1) / 2, gh, (gz0 + gz1) / 2, gx1 - gx0 + 0.3, 0.28, gz1 - gz0 + 0.3, '#C9C5BC', { skip: 'ny' });
    this.box('concrete', (gx0 + gx1) / 2, gh + 0.28, gz0 - 0.02, gx1 - gx0 + 0.3, 0.45, 0.15, gwc);
    this.box('concrete', (gx0 + gx1) / 2, gh + 0.28, gz1 + 0.02, gx1 - gx0 + 0.3, 0.45, 0.15, gwc);
    // louvres: north wall = radiator discharge (inside + outside), east wall = intake
    for (const side of [gz0 - 0.03, gz0 + gt + 0.03]) {
      const out = side < gz0;
      this.box('flat', 185.6, 0.75, side, 5.4, 2.8, 0.06, '#3A4045');
      for (let k = 0; k < 13; k++) this.boxR('flat', 185.6, 0.95 + k * 0.2, side + (out ? -0.06 : 0.06), 5.1, 0.025, 0.2, '#7B858C', out ? -0.65 : 0.65, 0, 0);
    }
    for (const side of [gx1 + 0.03]) {
      this.box('flat', side, 2.1, 115.6, 0.06, 1.4, 2.4, '#3A4045');
      for (let k = 0; k < 6; k++) this.boxR('flat', side + 0.06, 2.22 + k * 0.2, 115.6, 0.2, 0.025, 2.2, '#7B858C', 0, 0, 0.65);
    }
    // open door leaves
    for (const lz of [109, 115]) { this.box('shiny', 176.6, 0.14, lz, 2.8, 3.42, 0.06, '#7F8A90'); this.box('flat', 175.4, 1.4, lz + (lz < 112 ? -0.06 : 0.06), 0.06, 0.25, 0.05, '#2B2F33'); this._col(175.15, lz - 0.06, 178, lz + 0.06); }
    this._sign('ห้องเครื่องกำเนิดไฟฟ้าสำรอง', 4.2, 0.5, GRN, '#FFFFFF', [177.82, 3.9, 112], -Math.PI / 2, { size: 0.6 });
    // genset on skid, long axis north-south so the door gives a side view
    const GC = '#2F5D3A', GC2 = '#284F32', GX = 185.6;
    this.box('flat', GX, 0.14, 111.6, 2.2, 0.26, 6.8, '#2C3134');
    for (const mz2 of [109.0, 111.6, 114.2]) for (const mx2 of [GX - 0.9, GX + 0.9]) this.box('flat', mx2, 0.4, mz2, 0.25, 0.1, 0.25, '#1E1E1E');
    this.cylR('flat', GX, 1.28, 114.15, 0.78, 1.75, GC, Math.PI / 2, 0, 0, 20);
    this.cylR('shiny', GX, 1.28, 115.05, 0.5, 0.1, '#A0A7AC', Math.PI / 2, 0, 0, 16);
    for (let k = 0; k < 5; k++) this.cylR('flat', GX, 1.28, 113.45 + k * 0.33, 0.8, 0.05, GC2, Math.PI / 2, 0, 0, 20);
    this.box('flat', GX, 2.06, 114.15, 0.8, 0.35, 0.9, GC2);
    this.box('flat', GX, 0.4, 111.65, 1.36, 1.4, 3.0, GC);
    this.box('flat', GX, 1.8, 111.65, 0.9, 0.42, 2.8, GC2);
    for (let k = 0; k < 6; k++) this.box('flat', GX, 2.22, 110.45 + k * 0.48, 0.7, 0.08, 0.32, '#1F3A26');
    for (let k = 0; k < 6; k++) this.box('flat', GX - 0.69, 1.05, 110.45 + k * 0.48, 0.04, 0.5, 0.3, '#3B6B48');
    this.cylR('shiny', GX + 0.68, 2.0, 111.65, 0.11, 2.6, '#8A8F93', Math.PI / 2, 0, 0, 10);
    this.cylR('flat', GX + 0.68, 2.3, 110.1, 0.28, 0.5, '#5C6166', 0, 0, Math.PI / 2, 12);
    this.box('flat', GX, 0.4, 108.85, 2.1, 2.4, 0.7, GC2);
    this.box('flat', GX, 0.6, 108.48, 1.8, 1.95, 0.04, '#15181A');
    this.cylR('flat', GX, 1.55, 108.45, 0.82, 0.05, '#2A2E31', Math.PI / 2, 0, 0, 20);
    this.box('flat', GX - 0.72, 0.66, 113.0, 0.06, 0.5, 0.9, '#E0A21B');
    this.box('glow', GX - 0.76, 1.0, 113.0, 0.01, 0.22, 0.36, '#9EF5B0');
    for (let j = 0; j < 3; j++) this.box('glow', GX - 0.76, 0.78, 112.75 + j * 0.25, 0.01, 0.06, 0.06, ['#5CFF7A', '#FFD54F', '#FF5A4A'][j]);
    this.box('flat', GX - 0.55, 0.4, 109.9, 0.35, 0.3, 0.55, '#1E1E1E');
    this._col(GX - 1.2, 108.35, GX + 1.2, 115.2);
    // exhaust: manifold -> roof -> silencer -> stack
    this.tube('shiny', [[GX + 0.68, 2.3, 110.0], [GX + 0.68, 3.3, 110.0], [GX + 0.7, 4.0, 110.0], [GX + 0.7, 4.75, 110.0]], 0.14, '#8A8F93', 10);
    this.cylR('shiny', GX + 0.7, 5.05, 111.4, 0.38, 2.7, '#9AA0A5', Math.PI / 2, 0, 0, 16);
    for (const sz of [110.5, 112.3]) this.box('flat', GX + 0.7, gh + 0.28, sz, 0.6, 0.5, 0.12, '#5C6166');
    this.cyl('shiny', GX + 0.7, 5.05, 112.6, 0.14, 2.3, '#8A8F93', 10);
    this.cone('flat', GX + 0.7, 7.35, 112.6, 0.28, 0.18, '#5C6166', 10);
    this._emitter({ type: 'exhaust', pos: [GX + 0.7, 7.5, 112.6], rate: 4, size: 0.9, rise: 1.4, spread: 0.25, life: 3.5, color: '#7A7C7E' });
    // ATS / MDB cabinets on the east wall (facing west), cable tray, fuel-log board
    for (let k = 0; k < 4; k++) {
      const z = 107.5 + k * 1.95;
      this.box('flat', gx1 - gt - 0.3, 0.14, z, 0.6, 2.2, 1.88, '#B8BEC2');
      this.box('flat', gx1 - gt - 0.61, 0.3, z, 0.02, 1.9, 0.02, '#8C949A');
      for (let j = 0; j < 3; j++) this.box('glow', gx1 - gt - 0.61, 1.8, z - 0.5 + j * 0.25, 0.01, 0.08, 0.08, ['#5CFF7A', '#FF5A4A', '#FFD54F'][j]);
      this.box('glow', gx1 - gt - 0.61, 1.35, z + 0.35, 0.01, 0.2, 0.36, '#8FE3FF');
    }
    this._col(gx1 - gt - 0.65, 106.5, gx1 - gt, 116.5);
    this.box('flat', 188.5, 3.45, 114.6, 5.8, 0.08, 0.45, '#9AA1A6');
    this.box('flat', GX + 0.2, 2.3, 114.6, 0.3, 1.2, 0.3, '#3E4449');
    this._sign('บันทึกการเติมน้ำมันดีเซล', 1.7, 0.42, '#FFFFFF', '#1F2937', [gx1 - gt - 0.02, 2.85, 111.3], -Math.PI / 2, { size: 0.5 });
    // diesel day tank (south-east corner, visible from the door) + fuel lines
    for (const lx of [188.75, 189.4]) for (const lz of [115.75, 117.35]) this.box('flat', lx, 0.14, lz, 0.08, 0.5, 0.08, '#4A5258');
    this.box('flat', 189.07, 0.64, 116.55, 0.9, 1.05, 1.9, '#6A7B85');
    this.box('glow', 188.61, 0.78, 116.0, 0.01, 0.82, 0.05, '#7AD2FF');
    this.cyl('flat', 189.1, 1.69, 117.0, 0.09, 0.14, '#C62828', 10);
    this._sign('ถังน้ำมันดีเซล (Day Tank)', 1.25, 0.3, '#F7C51E', '#1F2937', [188.6, 1.92, 116.55], -Math.PI / 2, { size: 0.55 });
    this.tube('flat', [[188.6, 0.75, 116.0], [187.8, 0.32, 115.6], [GX + 0.7, 0.32, 113.0]], 0.025, '#3A3A3A', 6);
    this._col(188.55, 115.5, 189.65, 117.6);
    this.cyl('flat', 178.5, 0.5, 108.2, 0.09, 0.62, '#C62828', 10);
    this.cylR('flat', 178.55, 1.15, 108.35, 0.025, 0.25, '#222222', 0.6, 0, 0, 6);
    this._cxCeil(this._cxLin('genCeil', '#EEF0F0', E.tex.concrete, 1), gx0 + gt, gz0 + gt, gx1 - gt, gz1 - gt, gh - 0.005, '#FFFFFF', 4);
    for (const p of [[181.5, 109], [185, 112], [188.5, 115], [181.5, 115]]) this.box('glow', p[0], 4.05, p[1], 1.25, 0.04, 0.12, '#F2F7FF');
    this._interior({ name: 'genroom', rect: [gx0 + gt, gz0 + gt, gx1 - gt, gz1 - gt], helmet: false, label: 'ห้องเครื่องกำเนิดไฟฟ้าสำรอง',
      lights: [[181.5, 3.9, 109, '#F4F7FF', 1.0, 9], [185, 3.9, 112, '#F4F7FF', 1.0, 9], [188.5, 3.9, 115, '#F4F7FF', 1.0, 9]] });
    E.crowdSpots.push({ x: 187.7, z: 113.4, yaw: -Math.PI / 2, mode: 'work', outfit: 'worker' });

    // ---------- medical gas manifold yard (stop 7)
    this.box('concrete', 206, 0, 105, 12, 0.15, 10, '#C9C5BC');
    this.box('concrete', 206, 0.15, 100.3, 12, 2.7, 0.3, '#D9D5CC');
    this._col(199.95, 100.1, 212.05, 100.5);
    this._cxFence(F, 'z', 200, 100.45, 110, 0.15, 2.7, 2.4);
    this._cxFence(F, 'z', 212, 100.45, 110, 0.15, 2.7, 2.4);
    this._cxFence(F, 'x', 110, 200, 212, 0.15, 2.7, 2.4);
    for (const p of [[200, 100.3], [212, 100.3], [200, 110], [212, 110]]) this.cyl('shiny', p[0], 0.15, p[1], 0.07, 3.05, '#8F989E', 8);
    this.box('metal', 206, 3.2, 105, 12.8, 0.08, 10.8, '#8FA6B8', { skip: 'ny' });
    this._cxCeil(this._cxLin('sheet', '#CBD3D8', E.tex.metal, 0.3), 199.6, 99.6, 212.4, 110.4, 3.195, '#FFFFFF', 2.2);
    this._col(199.9, 100.1, 212.1, 110.1);
    const cylinder = (x, z, body, shoulder) => {
      this.cyl('flat', x, 0.15, z, 0.115, 1.25, body, 12);
      if (body === '#E9ECEE') this.cyl('flat', x, 1.0, z, 0.119, 0.14, '#2E7D32', 12);
      this.sph('flat', x, 1.4, z, 0.115, 0.1, 0.115, shoulder, 12);
      this.cyl('flat', x, 1.48, z, 0.035, 0.12, '#5E666C', 8);
      this.box('shiny', x, 1.6, z, 0.07, 0.07, 0.07, '#B8BEC2');
    };
    const N2O = '#2F64B3', O2B = '#E9ECEE';
    for (let i = 0; i < 5; i++) { cylinder(201.2 + i * 0.62, 101.05, N2O, '#1F4E94'); this.tube('flat', [[201.2 + i * 0.62, 1.64, 101.05], [201.2 + i * 0.62, 1.78, 100.7], [201.3 + i * 0.62, 1.78, 100.62]], 0.012, '#B87333', 5); }
    for (let i = 0; i < 5; i++) { cylinder(208.3 + i * 0.62, 101.05, O2B, '#FFFFFF'); this.tube('flat', [[208.3 + i * 0.62, 1.64, 101.05], [208.3 + i * 0.62, 1.78, 100.7], [208.4 + i * 0.62, 1.78, 100.62]], 0.012, '#B87333', 5); }
    this.tube('flat', [[200.95, 1.78, 100.6], [205.3, 1.78, 100.6]], 0.03, '#B87333', 8);
    this.tube('flat', [[206.7, 1.78, 100.6], [211.0, 1.78, 100.6]], 0.03, '#B87333', 8);
    for (const rx of [202.45, 209.55]) this.box('shiny', rx, 1.0, 101.25, 3.5, 0.04, 0.04, '#7D868C');
    this.box('flat', 206, 1.1, 100.58, 1.5, 1.2, 0.24, '#C9CED2');
    for (let k = 0; k < 3; k++) {
      this.cylR('flat', 205.55 + k * 0.45, 2.0, 100.74, 0.11, 0.04, '#F4F4F4', Math.PI / 2, 0, 0, 16);
      this.box('flat', 205.55 + k * 0.45, 2.0, 100.77, 0.012, 0.09, 0.01, '#1A1A1A');
    }
    this.box('glow', 206, 1.45, 100.71, 0.5, 0.1, 0.01, '#5CFF7A');
    // pipes (N₂O blue-tagged, O₂) up and across a small rack into the tower (OR)
    this.tube('flat', [[205.8, 2.2, 100.5], [205.8, 3.0, 100.5], [205.8, 3.0, 94.35]], 0.04, '#B87333', 8);
    this.tube('flat', [[206.25, 2.2, 100.5], [206.25, 2.85, 100.5], [206.25, 2.85, 94.35]], 0.04, '#B87333', 8);
    for (const tz of [99.2, 96.6]) this.box('flat', 205.8, 3.06, tz, 0.12, 0.05, 0.1, '#2F64B3');
    for (const rz of [97.2]) { this.box('flat', 206.0, 0.06, rz, 0.12, 2.82, 0.12, '#7D868C'); this.box('flat', 206.0, 2.78, rz, 1.0, 0.08, 0.12, '#7D868C'); this._col(205.9, rz - 0.1, 206.1, rz + 0.1); }
    this.box('flat', 206.0, 2.6, 94.06, 1.0, 0.8, 0.12, '#C9CED2');
    // spares + trolley
    for (let i = 0; i < 4; i++) cylinder(201.5 + i * 0.5, 109.3, N2O, '#1F4E94');
    for (let i = 0; i < 6; i++) cylinder(206.6 + i * 0.5, 109.3, O2B, '#FFFFFF');
    this.box('shiny', 206.0, 1.0, 109.55, 10.5, 0.04, 0.04, '#7D868C');
    this.box('flat', 204.6, 0.15, 108.2, 0.5, 0.06, 0.4, '#4A5258');
    this.cylR('flat', 204.6, 0.3, 108.0, 0.14, 0.42, '#1C1C1C', 0, 0, Math.PI / 2, 10);
    this.boxR('flat', 204.6, 0.85, 108.3, 0.04, 1.2, 0.04, '#4A5258', -0.25, 0, 0);
    this._sign('N₂O · ไนตรัสออกไซด์', 2.8, 0.48, N2O, '#FFFFFF', [202.45, 2.43, 100.47], 0, { size: 0.56 });
    this._sign('O₂ · ออกซิเจน', 2.8, 0.48, '#FFFFFF', '#1A6B3A', [209.55, 2.43, 100.47], 0, { size: 0.56, border: '#1A6B3A' });
    this._sign('ห้องจ่ายก๊าซทางการแพทย์', 3.0, 0.5, GRN, '#FFFFFF', [199.86, 2.85, 102.3], -Math.PI / 2, { size: 0.56 });
    this._sign('N₂O → ห้องผ่าตัด', 2.4, 0.44, N2O, '#FFFFFF', [204.4, 3.65, 94.08], 0, { size: 0.58 });
    // bulk liquid-oxygen tank (VIE) + vaporisers
    this._cxFence(F, 'z', 216, 100, 111, 0.06, 2.4, 2.75);
    this._cxFence(F, 'z', 228, 100, 111, 0.06, 2.4, 2.75);
    this._cxFence(F, 'x', 100, 216, 228, 0.06, 2.4, 3);
    this._cxFence(F, 'x', 111, 216, 228, 0.06, 2.4, 3);
    this.box('concrete', 222, 0.0, 105.5, 12, 0.12, 11, '#C2BEB5');
    for (const lx of [-0.9, 0.9]) for (const lz of [-0.9, 0.9]) this.box('shiny', 222 + lx, 0.12, 105.5 + lz, 0.16, 1.15, 0.16, '#9AA1A6');
    this.cyl('shiny', 222, 1.2, 105.5, 1.25, 8.4, '#F2F4F5', 22);
    this.sph('shiny', 222, 9.6, 105.5, 1.25, 0.42, 1.25, '#F2F4F5', 18);
    this.tube('shiny', [[222.9, 1.4, 104.6], [225.4, 0.8, 103.0], [225.4, 3.6, 103.0]], 0.05, '#B8BEC2', 8);
    for (const vz of [102.6, 104.9]) {
      this.box('shiny', 226.0, 0.12, vz, 0.5, 4.0, 0.5, '#D6DADD');
      for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 4; this.boxR('shiny', 226.0, 2.12, vz, 1.1, 3.9, 0.04, '#CDD2D6', 0, a, 0); }
    }
    this._col(215.9, 99.9, 228.1, 111.1);

    // ---------- kitchen / laundry block, water tower, motorbike shed
    this.box('plaster', 262, 0, 115, 44, 5, 22, '#EEEBE3', { top: false });
    this.gable('metal', 262, 5, 115, 44, 22, 2.2, '#7C9CB8', { wall: 'plaster', wallCol: '#EEEBE3' });
    for (const y0 of [1.6]) { this.box('glass', 262, y0, 103.96, 36, 1.4, 0.1, '#7C96A4'); this.box('glass', 262, y0, 126.04, 36, 1.4, 0.1, '#7C96A4'); }
    for (const fx of [250, 262, 274]) { this.cyl('shiny', fx, 6.6, 115, 0.5, 0.6, '#B0B7BC', 12); this.cone('flat', fx, 7.2, 115, 0.6, 0.3, '#8C949A', 12); }
    this._col(240, 104, 284, 126);
    for (const p of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) this.box('concrete', 306 + p[0] * 2.4, 0, 140 + p[1] * 2.4, 0.55, 18.2, 0.55, '#D8D4CB');
    for (const yb of [6, 12]) { this.box('concrete', 306, yb, 137.6, 5.3, 0.4, 0.35, '#D8D4CB'); this.box('concrete', 306, yb, 142.4, 5.3, 0.4, 0.35, '#D8D4CB'); this.box('concrete', 303.6, yb, 140, 0.35, 0.4, 5.3, '#D8D4CB'); this.box('concrete', 308.4, yb, 140, 0.35, 0.4, 5.3, '#D8D4CB'); }
    this.cyl('plaster', 306, 18.2, 140, 3.7, 4.6, '#E8EEF1', 22);
    this.cone('flat', 306, 22.8, 140, 3.9, 1.4, '#6E8FA8', 22);
    this.box('glow', 306, 20.4, 143.72, 2.2, 0.5, 0.02, '#2E8BE6');
    this._col(303.3, 137.3, 308.7, 142.7);
    this.box('metal', 156.5, 2.7, 78, 13, 0.08, 40, '#7FA0BE', { skip: 'ny' });
    this._cxCeil(this._cxLin('sheet', '#CBD3D8', E.tex.metal, 0.3), 150, 58, 163, 98, 2.695, '#FFFFFF', 2.2);
    for (const px of [151, 162]) for (let pz = 59; pz <= 97; pz += 9.5) { this.cyl('shiny', px, 0.06, pz, 0.06, 2.65, '#8F989E', 8); this._col(px - 0.1, pz - 0.1, px + 0.1, pz + 0.1); }
    for (let k = 0; k < 14; k++) {
      const pz = 61 + k * 2.5;
      E.parkSpots.push({ x: 153.2, z: pz, yaw: Math.PI / 2, kind: 'moto', color: pick(['#C62828', '#1565C0', '#212121', '#ECEFF1', '#2E7D32']) });
      E.parkSpots.push({ x: 159.8, z: pz + 1.2, yaw: -Math.PI / 2, kind: 'moto', color: pick(['#C62828', '#1565C0', '#212121', '#ECEFF1', '#F9A825']) });
    }
    // car parks
    const CARC = ['#ECEFF1', '#B0BEC5', '#263238', '#C62828', '#1565C0', '#9E9E9E', '#F5F5F5', '#6D4C41'];
    for (let x = 133.35; x < 160; x += 2.7) { if (R() < 0.85) E.parkSpots.push({ x: x, z: 25.5, yaw: 0, kind: R() < 0.25 ? 'pickup' : 'car', color: pick(CARC) }); if (R() < 0.75) E.parkSpots.push({ x: x, z: 40.5, yaw: Math.PI, kind: R() < 0.25 ? 'pickup' : 'car', color: pick(CARC) }); }
    for (let x = 333.35; x < 388; x += 2.7) { if (R() < 0.7) E.parkSpots.push({ x: x, z: 25.5, yaw: 0, kind: 'car', color: pick(CARC) }); if (R() < 0.6) E.parkSpots.push({ x: x, z: 40.5, yaw: Math.PI, kind: R() < 0.3 ? 'van' : 'car', color: pick(CARC) }); }
    for (let x = 182; x < 336; x += 5.4) { if (R() < 0.55) E.parkSpots.push({ x: x, z: 178, yaw: 0, kind: 'car', color: pick(CARC) }); if (R() < 0.45) E.parkSpots.push({ x: x + 2.7, z: 191, yaw: Math.PI, kind: 'car', color: pick(CARC) }); }
    for (let x = 180; x <= 336; x += 5.4) { this.box('paint', x, 0.05, 178, 0.1, 0.02, 5, '#F2F2F2'); this.box('paint', x, 0.05, 191, 0.1, 0.02, 5, '#F2F2F2'); }
    // lamps & trees
    for (const p of [[140, 33], [155, 33], [300, 33], [345, 33], [370, 33], [200, 165], [260, 165], [320, 165], [174, 80], [174, 130]]) this._cxPole(p[0], p[1], 8, p[0] === 174 ? -Math.PI / 2 : Math.PI / 2);
    for (let x = 136; x < 390; x += 13) if (!((x > 160 && x < 176) || (x > 200 && x < 218) || (x > 262 && x < 280) || (x > 302 && x < 322))) E.treeSpots.push({ x: x, z: 16, s: 0.9 + R() * 0.3, kind: 'rain' });
    for (let k = 0; k < 18; k++) E.treeSpots.push({ x: 336 + R() * 50, z: 52 + R() * 100, s: 0.8 + R() * 0.5, kind: pick(['rain', 'mango', 'palm']) });
    for (let k = 0; k < 6; k++) E.treeSpots.push({ x: 132 + R() * 14, z: 60 + R() * 120, s: 0.8 + R() * 0.4, kind: pick(['mango', 'rain']) });
    for (const p of [[226, 30.5], [232, 30.5], [248, 30.5], [254, 30.5]]) E.treeSpots.push({ x: p[0], z: p[1], s: 0.6, kind: 'palm' });
    E.crowdSpots.push({ x: 236.5, z: 47.0, yaw: Math.PI, mode: 'stand', outfit: 'office' });
    E.crowdSpots.push({ x: 243.0, z: 46.2, yaw: Math.PI * 0.8, mode: 'chat', outfit: 'casual' });
    E.crowdSpots.push({ x: 244.2, z: 47.4, yaw: -Math.PI * 0.2, mode: 'chat', outfit: 'casual' });
    E.crowdSpots.push({ x: 249.0, z: 52.2, yaw: Math.PI, mode: 'stand', outfit: 'doctor' });
    E.crowdSpots.push({ x: 306.5, z: 57.5, yaw: Math.PI / 2, mode: 'stand', outfit: 'nurse' });
    E.crowdSpots.push({ x: 308.0, z: 58.4, yaw: -Math.PI / 2, mode: 'chat', outfit: 'nurse' });
    E.crowdSpots.push({ x: 228.5, z: 44.5, yaw: Math.PI, mode: 'stand', outfit: 'worker' });

    this._cxFenceMesh(F);
    this._cxLinFlush();

    // ---------- anchors
    this._stopAnchor(6, {
      view: [174.6, 112], look: [185.6, 1.3, 111.8], guide: [176.1, 110.75],
      pin: [185.6, 3.35, 111.6], emit: [186.3, 2.6, 110.4], gas: ['CO2', 'CH4', 'N2O'], spread: 0.9,
      route: [[168, 12], [168, 112], [174.6, 112]], inside: null, district: 'hospital'
    });
    this._stopAnchor(7, {
      view: [196.2, 104.8], look: [204.6, 1.2, 101.7], guide: [198.25, 105.8],
      pin: [206, 3.95, 105], emit: [206.0, 3.05, 94.8], gas: ['N2O'], spread: 0.9,
      route: [[168, 12], [168, 100.5], [196.2, 100.5], [196.2, 104.8]], inside: null, district: 'hospital'
    });
  },

  // ================================================================ RICE MILL (stops 9, 10, 11)
  _cxHiredTruck() {
    const E = this._E;
    const T = E.T;
    const g = new T.Group();
    const CAB = '#2E8B57', CH = '#2A2D30', BED = '#9C6B3C';
    this._bakeMesh((A) => {
      this.box(A, 0, 0.72, 3.1, 1.0, 0.3, 9.0, CH);
      this.box(A, 0, 1.02, 1.85, 1.0, 0.33, 6.6, CH);
      this.box(A, 0, 0.95, 6.6, 2.45, 1.9, 2.3, CAB);
      this.box(A, 0, 2.85, 6.5, 2.38, 0.42, 1.95, CAB);
      this.box(A, 0, 3.27, 6.55, 1.6, 0.18, 1.3, '#F1F2F3');
      this.box(A, 0, 1.95, 7.76, 2.2, 0.8, 0.04, '#25313A');
      for (const sx of [-1.235, 1.235]) { this.box(A, sx, 1.95, 6.95, 0.03, 0.72, 0.95, '#25313A'); this.box(A, sx, 1.0, 6.6, 0.03, 0.08, 2.2, '#F7C51E'); }
      this.box(A, 0, 0.5, 7.85, 2.5, 0.36, 0.2, '#C9CED2');
      this.box(A, 0, 0.98, 7.77, 1.6, 0.62, 0.04, '#1E2226');
      for (const sx of [-0.95, 0.95]) this.box(A, sx, 0.82, 7.81, 0.34, 0.2, 0.04, '#FFF6D8');
      this.cylR(A, 1.16, 0.88, 4.3, 0.32, 1.1, '#9AA1A6', Math.PI / 2, 0, 0, 12);
      this.cyl(A, 1.0, 1.25, 5.2, 0.07, 2.4, '#55595C', 8);
      for (const z of [6.6, 1.3, 0]) for (const sx of [-1, 1]) {
        const dual = z < 2;
        this.cylR(A, sx * (dual ? 1.0 : 1.07), 0.52, z, 0.52, dual ? 0.62 : 0.32, '#1A1A1A', 0, 0, Math.PI / 2, 16);
        this.cylR(A, sx * (dual ? 1.32 : 1.24), 0.52, z, 0.27, 0.02, '#B8BEC2', 0, 0, Math.PI / 2, 12);
      }
      for (const sx of [-1.15, 1.15]) this.box(A, sx, 0.25, -0.9, 0.3, 0.55, 0.03, '#1E1E1E');
      this.box(A, 0, 0.55, -1.55, 2.3, 0.14, 0.12, '#C9CED2');
      for (const sx of [-0.85, 0.85]) this.box(A, sx, 0.62, -1.62, 0.22, 0.12, 0.02, '#D32F2F');
    }, { parent: g });
    const bed = new T.Group();
    bed.position.set(0, 1.35, -1.5);
    g.add(bed);
    this._bakeMesh((A) => {
      this.box(A, 0, 0, 3.35, 2.45, 0.18, 6.7, BED);
      for (const sx of [-1.18, 1.18]) this.box(A, sx, 0.18, 3.35, 0.1, 0.95, 6.7, BED);
      this.box(A, 0, 0.18, 6.65, 2.45, 1.3, 0.1, BED);
      for (let k = 0; k < 6; k++) for (const sx of [-1.24, 1.24]) this.box(A, sx, 0.18, 0.6 + k * 1.1, 0.05, 0.95, 0.08, '#6E4A28');
      this.box(A, 0, -0.12, 3.35, 1.1, 0.12, 6.4, '#3A3F44');
    }, { parent: bed });
    const load = new T.Group();
    load.position.set(0, 0.18, 0);
    bed.add(load);
    this._bakeMesh((A) => {
      this.box(A, 0, 0, 3.35, 2.26, 0.6, 6.5, '#D8B45C');
      this.sph(A, 0, 0.6, 3.5, 1.05, 0.34, 2.9, '#D8B45C', 12);
    }, { parent: load });
    return { g: g, bed: bed, load: load };
  },

  _bMill() {
    const E = this._cxE();
    const T = E.T;
    const R = this._rng(7303);
    const pick = (a) => a[(R() * a.length) | 0];
    const ROOF = '#6D8DAA', WALLM = '#D3D9DD', STEEL = '#46545E', BLUEST = '#2F5E8C', GALV = '#B4BCC2', MACH = '#2F6E8E';
    const F = this._newAcc('flat');
    const BJ = '"Bai Jamjuree", "IBM Plex Sans Thai Looped", sans-serif';

    // ---------- surfaces, perimeter wall, gate
    this._cxRect('concrete', -431, -296, -179, -219, '#BDB8AE');
    this._cxRect('concrete', -431, -451, -240, -296, '#B2ADA3');
    this._cxRect('grass', -240, -451, -179, -296, '#D9E4C2', 0.03);
    const WC = '#CFCAC0';
    this._cxWall('concrete', 'x', -219.4, -431, -179, 0, 2.3, 0.3, WC, [[-336.3, -311.7]]);
    this._cxWall('concrete', 'x', -450.6, -431, -179, 0, 2.3, 0.3, WC);
    this._cxWall('concrete', 'z', -430.6, -450.45, -219.55, 0, 2.3, 0.3, WC);
    this._cxWall('concrete', 'z', -179.4, -450.45, -219.55, 0, 2.3, 0.3, WC);
    for (let x = -428; x < -182; x += 6) if (x < -337 || x > -311) this.box('concrete', x, 0, -219.4, 0.5, 2.6, 0.5, '#E2DDD2');
    for (const px of [-337, -311]) { this.box('concrete', px, 0, -219.4, 1.4, 7.6, 1.4, '#E8E2D4'); this._col(px - 0.7, -220.1, px + 0.7, -218.7); }
    this.box('concrete', -324, 6.1, -219.4, 27.4, 1.5, 1.0, '#E8E2D4');
    this.hip('tile', -324, 7.6, -219.4, 28.0, 1.9, 0.9, '#9A3B2B', { oh: 0.3 });
    this._sign('โรงสีข้าวชุมชนเมืองคาร์บอน', 18, 1.1, '#1F4D36', '#FFFFFF', [-324, 6.85, -218.86], 0, { size: 0.66 });
    // weighbridge + scale house
    this.box('concrete', -328.4, 0, -239, 3.7, 0.1, 19, '#8E8A82');
    this.box('metal', -328.4, 0.1, -239, 3.2, 0.06, 18.4, '#7B858C');
    for (let k = 0; k < 18; k++) for (const ex of [-330.05, -326.75]) this.box('paint', ex, 0.1, -247.75 + k * 1.02, 0.12, 0.08, 0.5, k % 2 ? '#1A1A1A' : '#F2C21B');
    this.box('plaster', -336.5, 0, -239, 4.6, 3.0, 5.2, '#F0EADC', { top: false });
    this.hip('tile', -336.5, 3.0, -239, 4.6, 5.2, 1.1, '#9A3B2B', { oh: 0.5 });
    this.box('glass', -334.17, 1.0, -239, 0.06, 1.2, 3.0, '#6C8796');
    this.box('glow', -334.12, 2.35, -239, 0.02, 0.4, 1.4, '#FF5A36');
    this._sign('ตาชั่งรถบรรทุก', 3.0, 0.55, '#1F4D36', '#FFFFFF', [-336.5, 2.45, -236.35], 0, { size: 0.6 });
    this._col(-338.85, -241.65, -334.15, -236.35);
    // office + parking
    this.box('plaster', -414, 0, -254, 22, 7.0, 16, '#F1E9D6', { top: false });
    this.hip('tile', -414, 7.0, -254, 22, 16, 3.2, '#9A3B2B');
    for (const y0 of [1.0, 4.4]) { this.box('glass', -414, y0, -245.95, 19, 1.6, 0.1, '#7F98A5'); this.box('glass', -414, y0, -262.05, 19, 1.6, 0.1, '#7F98A5'); }
    this.box('glass', -406.5, 0.0, -245.92, 2.0, 2.4, 0.14, '#5E7480');
    this._col(-425, -262, -403, -246);
    for (let i = 0; i < 10; i++) E.parkSpots.push({ x: -424 + i * 1.1, z: -243.2, yaw: Math.PI, kind: 'moto', color: pick(['#C62828', '#1565C0', '#212121', '#ECEFF1', '#2E7D32']) });
    E.parkSpots.push({ x: -398.5, z: -250, yaw: 0, kind: 'pickup', color: '#ECEFF1' });
    E.parkSpots.push({ x: -405, z: -283, yaw: Math.PI, kind: 'truck', color: '#2F5E9C' });
    E.parkSpots.push({ x: -415, z: -283, yaw: Math.PI, kind: 'truck', color: '#2F5E9C' });
    // yard lights
    for (const p of [[-300, -280], [-360, -268], [-405, -275], [-278, -276], [-324, -232], [-230, -320], [-420, -330]]) this._cxPole(p[0], p[1], 9, Math.PI);

    // ---------- MAIN MILL BUILDING
    const MX0 = -388, MX1 = -308, MZ0 = -334, MZ1 = -298, EAVE = 10, RISE = 4, WT = 0.3;
    const MXC = (MX0 + MX1) / 2, MZC = (MZ0 + MZ1) / 2;
    const roofY = (z) => EAVE + RISE * (1 - Math.abs(z - MZC) / ((MZ1 - MZ0) / 2));
    this.box('concrete', MXC, 0, MZC, MX1 - MX0, 0.12, MZ1 - MZ0, '#B3AFA6', { tw: 6, th: 6 });
    const wall2 = (axis, c, a0, a1, gaps) => {
      this._cxWall('concrete', axis, c, a0, a1, 0, 1.4, WT + 0.04, '#C3BEB4', gaps);
      this._cxWall('metal', axis, c, a0, a1, 1.4, EAVE - 1.4, WT, WALLM, gaps.map((g) => [g[0], g[1], g[2] - 1.4]), { noCol: true });
    };
    wall2('x', MZ1 - WT / 2, MX0, MX1, [[-326, -318, 6.2], [-363, -361, 2.4]]);
    // south wall: 3 windows per portal-frame bay over the warehouse end (frames 7..10), sill 2.6 m, head 7.2 m
    const WIN = [];
    for (const k of [7, 8, 9]) {
      const xa = MX0 + 0.3 + k * ((MX1 - MX0 - 0.6) / 10) + 0.3, xb = MX0 + 0.3 + (k + 1) * ((MX1 - MX0 - 0.6) / 10) - 0.3;
      const ww = (xb - xa - 0.5) / 3;
      for (let i = 0; i < 3; i++) WIN.push([xa + i * (ww + 0.25), xa + i * (ww + 0.25) + ww]);
    }
    this._cxWall('concrete', 'x', MZ0 + WT / 2, MX0, MX1, 0, 1.4, WT + 0.04, '#C3BEB4', []);
    this._cxWall('metal', 'x', MZ0 + WT / 2, MX0, MX1, 1.4, 1.2, WT, WALLM, [], { noCol: true });
    this._cxWall('metal', 'x', MZ0 + WT / 2, MX0, MX1, 2.6, EAVE - 2.6, WT, WALLM, WIN.map((w) => [w[0], w[1], 4.6]), { noCol: true });
    this._whWindows(MZ0 + WT / 2, WT, WIN, 2.6, 7.2);
    wall2('z', MX0 + WT / 2, MZ0, MZ1, []);
    wall2('z', MX1 - WT / 2, MZ0, MZ1, []);
    this.gable('metal', MXC, EAVE, MZC, MX1 - MX0, MZ1 - MZ0, RISE, ROOF, { both: true, wall: 'metal', wallCol: WALLM, oh: 0.9 });
    this.box('flat', MXC, EAVE + RISE - 0.05, MZC, MX1 - MX0 + 1.8, 0.22, 0.5, '#5B7893');
    // portal frames, rafters, purlins
    const slopeH = (MZ1 - MZ0) / 2 - 0.5;
    const rafL = Math.hypot(slopeH, RISE), rafA = Math.atan2(RISE, slopeH);
    for (let k = 0; k <= 10; k++) {
      const x = MX0 + 0.3 + k * ((MX1 - MX0 - 0.6) / 10);
      for (const zc of [MZ0 + 0.55, MZ1 - 0.55]) this.box('flat', x, 0.12, zc, 0.32, EAVE - 0.12, 0.42, STEEL);
      this.boxR('flat', x, EAVE + RISE / 2 - 0.36, MZ0 + 0.5 + slopeH / 2, 0.22, 0.45, rafL, STEEL, -rafA, 0, 0);
      this.boxR('flat', x, EAVE + RISE / 2 - 0.36, MZ1 - 0.5 - slopeH / 2, 0.22, 0.45, rafL, STEEL, rafA, 0, 0);
      for (const zc of [MZ0 + 0.55, MZ1 - 0.55]) this._col(x - 0.2, zc - 0.25, x + 0.2, zc + 0.25);
    }
    for (const s of [2.5, 6, 9.5, 13, 16.5]) {
      for (const side of [1, -1]) this.box('flat', MXC, EAVE + (s / 18) * RISE - 0.3, side > 0 ? MZ1 - s : MZ0 + s, MX1 - MX0 - 0.6, 0.16, 0.12, '#59656D');
    }
    // skylights (dynamic, dim at night) + matching strips on the roof
    const SKY = this._newAcc('flat');
    const sl = Math.hypot(18, RISE);
    const uS = [0, RISE / sl, -18 / sl], uN = [0, RISE / sl, 18 / sl];
    for (const k of [1, 3, 5, 7]) {
      const x = MX0 + 4 + k * 8;
      for (const side of [1, -1]) {
        const s = 9, z = side > 0 ? MZ1 - s : MZ0 + s, y = EAVE + (s / 18) * RISE;
        this._face(SKY, [x, y - 0.11, z], side > 0 ? [1, 0, 0] : [-1, 0, 0], side > 0 ? uS : uN, 3.6, 1.0, '#FFFFFF', { both: true });
        this._face('flat', [x, y + 0.06, z], side > 0 ? [1, 0, 0] : [-1, 0, 0], side > 0 ? uS : uN, 3.6, 1.0, '#DCE6EB', {});
      }
    }
    for (const side of [1, -1]) {
      const zi = side > 0 ? MZ1 - WT - 0.02 : MZ0 + WT + 0.02, zo = side > 0 ? MZ1 + 0.02 : MZ0 - 0.02;
      this._face(SKY, [MXC, 8.4, zi], [1, 0, 0], [0, 1, 0], (MX1 - MX0) / 2 - 0.6, 0.8, '#FFFFFF', { both: true });
      this._face('flat', [MXC, 8.4, zo], side > 0 ? [1, 0, 0] : [-1, 0, 0], [0, 1, 0], (MX1 - MX0) / 2 - 0.4, 0.8, '#DCE6EB', {});
    }
    if (SKY.vc) this._addDyn(new T.Mesh(this._accGeo(SKY), this._cxDayMat('#E4EEF2', 0.12)));
    const LIN = this._cxLin('millRoof', '#C9D1D7', E.tex.metal, 0.3);
    this._cxRoofLiner(LIN, MXC, EAVE + RISE * (0.2 / 18), MZC, MX1 - MX0 - 0.4, MZ1 - MZ0 - 0.4, RISE * (1 - 0.2 / 18), 0.07);
    for (const ge of [[MX0 + WT + 0.02, 1], [MX1 - WT - 0.02, -1]]) {
      const gx = ge[0], s = ge[1];
      const a = [gx, EAVE, MZC + s * ((MZ1 - MZ0) / 2 - 0.3)], c = [gx, EAVE, MZC - s * ((MZ1 - MZ0) / 2 - 0.3)], tp = [gx, EAVE + RISE - 0.1, MZC];
      this._tri(LIN, a, c, tp, [s, 0, 0], [0, 0, 8, 0, 4, 1.8], '#E1E6EA', false);
    }
    // high-bay lamps
    const LAMPS = [];
    for (const x of [-380, -366, -352, -338, -324, -312]) for (const z of [-307, -325]) {
      this.cone('shiny', x, 8.3, z, 0.42, 0.5, '#59636B', 12);
      this.cyl('glow', x, 8.26, z, 0.36, 0.04, '#FFF4DC', 16);
      this.cyl('flat', x, 8.8, z, 0.02, roofY(z) - 8.8 - 0.3, '#333333', 4);
    }
    // facade sign, safety sign, sliding door, personnel door
    this._sign('โรงสีข้าวชุมชนเมืองคาร์บอน', 22, 2.4, '#FFFFFF', '#1F4D36', [-350, 8.0, MZ1 + 0.06], 0, { border: '#1F4D36', size: 0.6 });
    this._sign('โปรดสวมหมวกนิรภัย', 2.6, 0.7, '#1565C0', '#FFFFFF', [-328.7, 2.6, MZ1 + 0.06], 0, { size: 0.55 });
    this.box('metal', -314, 0.12, MZ1 + 0.28, 8.0, 6.1, 0.12, '#C3CBD0');
    this.box('flat', -318, 6.25, MZ1 + 0.22, 16.4, 0.15, 0.15, STEEL);
    this._col(-318, MZ1 + 0.1, -310, MZ1 + 0.45);
    this.box('flat', -362, 0.12, MZ1 + 0.05, 2.2, 2.45, 0.1, '#5E666C');
    for (let k = 0; k < 8; k++) this.box('paint', -325.5 + k, 0.12, MZ1 - 0.6, 0.5, 0.012, 0.6, k % 2 ? '#1A1A1A' : '#F2C21B');
    // floor markings: walkway + forklift lane
    const lineX = (x0, x1, z, col) => this.box('paint', (x0 + x1) / 2, 0.12, z, x1 - x0, 0.012, 0.12, col);
    lineX(-386, -314, -311.9, '#F2C21B'); lineX(-386, -314, -306.1, '#F2C21B');
    lineX(-327.5, -312.4, -322.7, '#F2C21B'); lineX(-327.5, -312.4, -318.3, '#F2C21B');

    // ---------- milling line
    // intake/cleaning zone (west)
    for (const x of [-385, -381.5, -378]) this._cxElevator(x, -322, 12.2);
    this._cxElevator(-356, -327.5, 11.0);
    this._cxElevator(-352.3, -322, 12.2);
    let top = this._cxMachine(-384.2, -314.3, 3.0, 1.5, 1.2, MACH, 0.85);
    this._cxHopper('flat', -384.2, top + 0.6, -314.3, 1.0, 0.5, 0.6, MACH);
    this.boxR('flat', -385.9, 0.75, -314.3, 0.5, 0.06, 1.2, '#8E979D', 0, 0, 0.5);
    top = this._cxMachine(-379.4, -314.3, 2.2, 1.4, 1.1, '#3C7FA2', 0.7);
    this.boxR('flat', -379.4, top + 0.15, -314.3, 2.0, 0.08, 1.2, '#2B5878', 0, 0, -0.18);
    this._cxMotor(-379.4, 0.55, -313.2, 'x', 0.6, 0.2);
    this.cyl('flat', -372.2, 3.0, -331.3, 0.75, 2.2, GALV, 16);
    this._gput('flat', 'cone16', -372.2, 2.0, -331.3, 0.75, 2.0, 0.75, Math.PI, 0, 0, GALV);
    for (const lx of [-0.6, 0.6]) for (const lz of [-0.6, 0.6]) this.box('flat', -372.2 + lx, 0.12, -331.3 + lz, 0.1, 3.0, 0.1, STEEL);
    this.tube('flat', [[-372.2, 5.2, -331.3], [-372.2, 9.0, -331.3]], 0.25, GALV, 10);
    this._col(-373.1, -332.2, -371.3, -330.4);
    // MCC panels along the south wall (Scope 2 electricity)
    for (let k = 0; k < 7; k++) {
      const x = -385.8 + k * 2.05;
      this.box('flat', x, 0.12, MZ1 - WT - 0.36, 2.0, 2.2, 0.66, '#AEB4B8');
      this.box('flat', x, 0.25, MZ1 - WT - 0.7, 0.02, 1.95, 0.02, '#7E868C');
      for (let j = 0; j < 4; j++) this.box('glow', x - 0.6 + j * 0.25, 1.95, MZ1 - WT - 0.7, 0.07, 0.07, 0.01, ['#5CFF7A', '#5CFF7A', '#FF5A4A', '#FFD54F'][j]);
      this.box('glow', x + 0.45, 1.5, MZ1 - WT - 0.7, 0.3, 0.16, 0.01, '#8FE3FF');
    }
    this._col(-386.9, MZ1 - WT - 0.75, -371.6, MZ1 - WT);
    this.box('flat', -378.6, 2.32, MZ1 - WT - 0.3, 14.6, 0.08, 0.5, '#8C949A');
    for (let k = 0; k < 6; k++) this.box('flat', -385 + k * 2.6, 2.4, MZ1 - WT - 0.12, 0.3, EAVE - 3.0, 0.08, '#7E868C');
    // husking zone
    const husker = (x, z) => {
      const tp = this._cxMachine(x, z, 1.9, 1.35, 1.75, '#2F6E8E', 0.3);
      this._cxHopper('flat', x, tp + 0.7, z, 0.9, 0.45, 0.65, '#3A7FA6');
      this._cxMotor(x - 0.62, 0.75, z + 0.88, 'x', 0.75, 0.24);
      this.box('flat', x + 1.0, 0.55, z, 0.12, 1.3, 1.15, '#E2B53B');
      this.box('glow', x + 0.35, 1.5, z + 0.68, 0.22, 0.14, 0.01, '#5CFF7A');
    };
    husker(-367, -321.2);
    husker(-367, -315.6);
    top = this._cxMachine(-360, -320.6, 2.6, 2.2, 0.9, '#3C7FA2', 0.6);
    for (let k = 0; k < 5; k++) this.boxR('flat', -360, top + 0.25 + k * 0.22, -320.6, 2.5, 0.06, 2.0, '#9FB4C2', 0, 0, 0.12);
    this.box('flat', -360, top + 1.4, -320.6, 2.6, 0.08, 2.2, '#2B5878');
    this._cxMotor(-361.6, 0.9, -319.2, 'z', 0.6, 0.22);
    this.tube('flat', [[-367, 2.8, -321.2], [-367, 9.1, -321.2], [-367, 9.1, MZ0 + 0.25]], 0.3, GALV, 12);
    this.tube('flat', [[-367, 2.8, -315.6], [-367.6, 4.5, -318.5], [-367, 6.0, -321.2]], 0.2, GALV, 10);
    // mezzanine (whitening / polishing / grading / sorting)
    const DY = 4.5, MZX = [-350, -344.67, -339.33, -334], MZZ = [-332, -326.67, -321.33, -316];
    for (const x of MZX) for (const z of MZZ) { this.box('flat', x, 0.12, z, 0.24, DY - 0.12, 0.24, BLUEST); this._col(x - 0.2, z - 0.2, x + 0.2, z + 0.2); }
    this.box('metal', -342, DY, -324, 16.4, 0.14, 16.4, '#7D878C');
    for (const z of MZZ) this.box('flat', -342, DY - 0.35, z, 16.3, 0.35, 0.18, BLUEST);
    for (const x of MZX) this.box('flat', x, DY - 0.35, -324, 0.18, 0.35, 16.3, BLUEST);
    this._cxRail('x', -332.1, -350.1, -333.9, DY + 0.14);
    this._cxRail('z', -350.1, -332.1, -315.9, DY + 0.14);
    this._cxRail('z', -333.9, -332.1, -315.9, DY + 0.14);
    this._cxRail('x', -315.9, -350.1, -336.1, DY + 0.14);
    this._cxRail('x', -315.9, -334.6, -333.9, DY + 0.14);
    for (let i = 0; i < 18; i++) {
      const y = DY - (i + 1) * 0.25, z = -316.0 + 0.27 * (i + 0.5);
      this.box('metal', -335.35, y, z, 1.15, 0.05, 0.28, '#7D878C');
    }
    const stA = Math.atan2(4.5, 4.86), stL = Math.hypot(4.5, 4.86);
    for (const sx of [-335.95, -334.75]) {
      this.boxR('flat', sx, DY / 2, -313.57, 0.06, 0.3, stL, '#E2B53B', stA, 0, 0);
      this.boxR('flat', sx, DY / 2 + 0.95, -313.57, 0.05, 0.05, stL, '#E2B53B', stA, 0, 0);
    }
    this._col(-336.05, -316.0, -334.65, -311.1);
    const whitener = (x, z, water) => {
      this.box('flat', x, 0.12, z, 1.2, 0.5, 1.2, '#2E6E8E');
      this.cyl('flat', x, 0.62, z, 0.5, 1.6, '#2F7EA8', 18);
      this.cone('flat', x, 2.22, z, 0.5, 0.42, '#2F7EA8', 18);
      this.cyl('flat', x, 2.64, z, 0.15, 0.45, GALV, 10);
      this._cxMotor(x + 0.85, 0.95, z, 'z', 0.55, 0.26);
      this.box('flat', x + 0.55, 0.62, z, 0.08, 0.9, 0.5, '#E2B53B');
      if (water) { this.cyl('flat', x - 0.35, 2.3, z - 0.35, 0.22, 0.55, '#ECEFF1', 12); this.tube('flat', [[x - 0.35, 2.3, z - 0.35], [x - 0.1, 1.9, z - 0.1]], 0.02, '#8E979D', 5); }
      this._col(x - 0.75, z - 0.75, x + 1.15, z + 0.75);
    };
    for (const x of [-347.6, -344.0, -340.4]) whitener(x, -329.4, false);
    for (const x of [-347.6, -344.0]) whitener(x, -323.2, true);
    // colour sorter (front faces the walkway)
    this.box('flat', -338.6, 0.12, -320.5, 1.8, 2.15, 1.35, '#F1F3F4');
    this.box('flat', -338.6, 1.5, -319.81, 1.82, 0.22, 0.02, '#1E4FA3');
    this.box('glow', -338.95, 1.05, -319.8, 0.55, 0.36, 0.01, '#4FC3F7');
    this._cxHopper('flat', -338.6, 2.75, -320.5, 0.8, 0.4, 0.5, '#E3E7EA');
    for (const sx of [-0.45, 0.45]) this.boxR('flat', -338.6 + sx, 0.45, -319.6, 0.18, 0.06, 0.6, GALV, 0.6, 0, 0);
    this._col(-339.6, -321.3, -337.6, -319.7);
    // rotary graders + small bins on the deck
    for (const gx2 of [-346.4, -340.4]) {
      for (const fx of [-1.5, 1.5]) for (const fz of [-0.8, 0.8]) this.box('flat', gx2 + fx, DY + 0.14, -324.5 + fz, 0.12, 0.85, 0.12, STEEL);
      this.cylR('shiny', gx2, DY + 1.35, -324.5, 0.68, 3.4, GALV, 0, 0, Math.PI / 2, 18);
      for (const ex of [-1.72, 1.72]) this.cylR('flat', gx2 + ex, DY + 1.35, -324.5, 0.72, 0.08, '#2B5878', 0, 0, Math.PI / 2, 18);
      this._cxMotor(gx2 + 2.2, DY + 0.6, -324.5, 'x', 0.5, 0.2);
      this._cxHopper('flat', gx2, DY + 1.55, -328.8, 1.4, 1.2, 0.9, '#3A7FA6');
      for (const fx of [-0.6, 0.6]) for (const fz of [-0.6, 0.6]) this.box('flat', gx2 + fx, DY + 0.14, -328.8 + fz, 0.1, 0.55, 0.1, STEEL);
    }
    // spouts linking the line
    const spouts = [
      [[-376.5, 13.8, -297.4], [-379.5, 10.0, -303.5], [-383.4, 3.0, -312.8]],
      [[-385, 12.0, -322.5], [-384.6, 9.0, -317.5], [-384.3, 2.9, -314.8]],
      [[-381.5, 12.0, -322.5], [-380.5, 8.0, -319.0], [-379.4, 2.4, -314.9]],
      [[-378, 12.0, -322.5], [-372, 8.6, -321.8], [-367.2, 3.7, -321.3]],
      [[-378, 12.0, -321.5], [-372, 8.4, -318.6], [-367.2, 3.7, -315.7]],
      [[-356, 10.8, -327.5], [-358.5, 6.6, -323.5], [-360, 2.9, -320.8]],
      [[-352.3, 12.0, -322.5], [-349.5, 8.2, -325.5], [-346.6, DY + 2.05, -324.5]],
      [[-340.4, DY + 0.9, -324.5], [-339.2, 3.6, -322.0], [-338.6, 3.2, -320.6]],
      [[-346.4, DY + 0.9, -326.0], [-347.4, 3.0, -328.4], [-347.6, 2.7, -329.3]],
      [[-338.6, 2.2, -321.2], [-334.5, 3.6, -321.0], [-330.6, 4.4, -320.7]]
    ];
    for (const sp of spouts) this.tube('flat', sp, 0.12, GALV, 8);

    // glass-walled control room (north-west corner) + safety banner
    const CG = this._newAcc('flat');
    this.box('plaster', -384.35, 0.12, -330.35, 6.7, 0.1, 6.7, '#EDEFF0', { top: false });
    this.box('plaster', -381.05, 0.12, -330.35, 0.12, 1.0, 6.7, '#C9CED2');
    this.box('plaster', -384.35, 0.12, -327.05, 6.7, 1.0, 0.12, '#C9CED2');
    this._cxGlass(CG, 'z', -381.05, -333.7, -327.6, 1.12, 1.75);
    this._cxGlass(CG, 'x', -327.05, -387.7, -382.6, 1.12, 1.75);
    for (const p of [[-381.05, -333.6], [-381.05, -330.35], [-381.05, -327.05], [-387.6, -327.05], [-384.35, -327.05]]) this.box('shiny', p[0], 0.12, p[1], 0.1, 2.9, 0.1, '#9EA6AC');
    this.box('concrete', -384.35, 3.02, -330.35, 6.9, 0.18, 6.9, '#D9D6CF');
    this.box('flat', -382.6, 0.12, -326.95, 1.1, 2.3, 0.06, '#7D8790');
    this.box('wood', -383.6, 0.12, -331.6, 2.6, 0.75, 0.8, '#B48C5C');
    for (const mxp of [-384.4, -383.4, -382.4]) { this.box('flat', mxp, 0.87, -331.75, 0.55, 0.36, 0.06, '#1E2226'); this.box('glow', mxp, 0.9, -331.71, 0.5, 0.3, 0.01, ['#4FC3F7', '#7CFF9E', '#FFD54F'][Math.round(mxp + 384.4) % 3]); }
    this.box('glow', -384.35, 2.98, -330.35, 1.2, 0.03, 0.3, '#F5F9FF');
    this._cxGlassMesh(CG);
    this._col(-387.75, -333.75, -380.95, -326.95);
    E.crowdSpots.push({ x: -383.6, z: -330.7, yaw: Math.PI, mode: 'sit', outfit: 'office' });
    this._sign('ความปลอดภัยต้องมาก่อน', 9, 1.1, '#1F4D36', '#FFFFFF', [-348, 7.4, MZ0 + WT + 0.04], 0, { border: '#F7C51E', size: 0.56 });

    // ---------- bagging + warehouse (forklift zone)
    for (const lx of [-1.2, 1.2]) for (const lz of [-1.2, 1.2]) this.box('flat', -330.1 + lx, 0.12, -320.7 + lz, 0.16, 4.0, 0.16, BLUEST);
    this._cxHopper('flat', -330.1, 4.0, -320.7, 2.5, 2.4, 1.2, '#3A7FA6');
    this.box('flat', -330.1, 2.25, -320.7, 0.6, 0.55, 0.6, '#5E6A72');
    this.cyl('flat', -330.1, 1.9, -320.7, 0.12, 0.35, GALV, 8);
    this.box('flat', -330.1, 0.12, -320.7, 1.1, 0.12, 1.1, '#5E666C');
    this.box('flat', -330.1, 0.24, -320.7, 0.52, 0.86, 0.36, '#F2F0E8');
    this.cyl('flat', -331.6, 0.12, -319.4, 0.04, 1.3, '#5E666C', 6);
    this.box('glow', -331.6, 1.42, -319.4, 0.36, 0.22, 0.04, '#7CFF9E');
    this.box('flat', -331.7, 0.12, -321.9, 0.6, 0.85, 0.5, '#4A5258');
    this.box('flat', -331.7, 0.97, -321.9, 0.4, 0.25, 0.3, '#D0D4D8');
    this.box('flat', -328.9, 0.55, -320.7, 1.8, 0.12, 0.7, '#3A3F44');
    for (const lx of [-329.6, -328.2]) this.box('flat', lx, 0.12, -320.7, 0.08, 0.43, 0.6, '#5E666C');
    this._col(-332.05, -322.25, -328.0, -319.25);
    // forklift warning sign on a stand
    this.cyl('flat', -326.8, 0.12, -317.4, 0.04, 1.65, '#5E666C', 6);
    this.box('flat', -326.8, 0.12, -317.4, 0.4, 0.06, 0.4, '#5E666C');
    this._sign('ระวังรถโฟล์คลิฟต์', 1.6, 0.55, '#F7C51E', '#1A1A1A', [-326.8, 1.95, -317.33], 0, { border: '#1A1A1A', size: 0.5 });
    this._col(-327.05, -317.65, -326.55, -317.15);
    // racks, conveyor, epoxy floor and the forklift with its cycle (stop 10): warehouse.js
    const WHL = this._whBuild(R);

    // ---------- intake canopy + pit + external elevator + hired truck (stop 11)
    this.box('metal', -381, 6.8, -291.85, 14.4, 0.1, 11.7, '#7C98B4', { skip: 'ny' });
    this._cxCeil(this._cxLin('sheet', '#CBD3D8', E.tex.metal, 0.3), -388.2, -297.7, -373.8, -286.0, 6.795, '#FFFFFF', 2.2);
    for (const cx of [-387.6, -374.4]) {
      this.cyl('flat', cx, 0, -297.35, 0.15, 6.8, STEEL, 10);
      this._col(cx - 0.22, -297.6, cx + 0.22, -297.1);
      this.boxR('flat', cx, 5.0, -293.2, 0.12, 0.14, 8.6, STEEL, -0.43, 0, 0);
      this.box('flat', cx, 6.55, -291.85, 0.16, 0.25, 11.7, STEEL);
    }
    this.box('flat', -381, 6.55, -286.1, 14.4, 0.25, 0.2, STEEL);
    this.box('flat', -381, 0.05, -291, 6.2, 0.03, 3.2, '#232321');
    for (let k = 0; k < 15; k++) this.box('paint', -383.9 + k * 0.42, 0.08, -291, 0.06, 0.02, 3.0, '#8E979D');
    for (const ex of [-384.15, -377.85]) this.box('flat', ex, 0.05, -291, 0.15, 0.18, 3.3, '#F2C21B');
    this.box('flat', -381, 0.05, -292.68, 6.45, 0.18, 0.15, '#F2C21B');
    this._cxElevator(-376.5, -296.9, 14.6, '#3E6E94');
    const TR = this._cxHiredTruck();
    TR.g.position.set(-381, 0.05, -287.9);
    this._addDyn(TR.g);
    this._col(-382.4, -289.55, -379.6, -279.85);
    this._sign('รถรับจ้าง', 1.0, 0.36, '#F7C51E', '#1F2937', [-379.72, 1.75, -281.3], Math.PI / 2, { size: 0.62, round: true });
    this._sign('รถรับจ้าง', 1.0, 0.36, '#F7C51E', '#1F2937', [-382.28, 1.75, -281.3], -Math.PI / 2, { size: 0.62, round: true });
    const streamMat = new T.MeshStandardMaterial({ color: this._lcol('#D9B35B'), roughness: 0.9 });
    const stream = new T.Mesh(new T.BoxGeometry(1.5, 1.45, 0.3), streamMat);
    stream.position.set(-381, 0.75, -289.75);
    stream.castShadow = true;
    this._addDyn(stream);
    const dust = this._emitter({ type: 'dust', pos: [-381, 0.3, -290.3], rate: 0, size: 0.9, rise: 0.8, spread: 1.2, life: 2.2, color: '#D6C08A' });
    const trEx = this._emitter({ type: 'exhaust', pos: [-380.0, 3.7, -282.7], rate: 3, size: 0.4, rise: 1.0, spread: 0.1, life: 2.2, color: '#6E6E6E' });
    this._anim((dt, t) => {
      const u = t % 26;
      let a = 0;
      if (u < 6) a = this._sm(u / 6) * 0.66;
      else if (u < 16) a = 0.66;
      else if (u < 22) a = (1 - this._sm((u - 16) / 6)) * 0.66;
      TR.bed.rotation.x = -a;
      const pouring = u > 4.2 && u < 16.5;
      stream.visible = pouring;
      dust.rate = pouring ? 6 : 0;
      trEx.rate = u < 22 ? 4 : 2;
      const fill = u < 4.2 ? 1 : (u < 16.5 ? 1 - 0.65 * ((u - 4.2) / 12.3) : (u < 23 ? 0.35 : 0.35 + 0.65 * this._sm((u - 23) / 3)));
      TR.load.scale.y = Math.max(0.05, fill);
      TR.load.position.z = (1 - fill) * -0.6;
    });

    // ---------- BOILER HOUSE (stop 9)
    const BX0 = MX1, BX1 = -288, BZ0 = -330, BZ1 = -314, BE = 7.5;
    this.box('concrete', (BX0 + BX1) / 2, 0, (BZ0 + BZ1) / 2, BX1 - BX0, 0.12, BZ1 - BZ0, '#A6A196', { tw: 5, th: 5 });
    const bwall = (axis, c, a0, a1, gaps) => {
      this._cxWall('brick', axis, c, a0, a1, 0, 3.0, 0.32, '#FFFFFF', gaps);
      this._cxWall('metal', axis, c, a0, a1, 3.0, BE - 3.0, 0.3, '#C9D1D6', gaps.map((g) => [g[0], g[1], g[2] - 3.0]), { noCol: true });
    };
    bwall('x', BZ1 - 0.15, BX0, BX1, [[-302, -296, 4.8]]);
    bwall('x', BZ0 + 0.15, BX0, BX1, []);
    bwall('z', BX1 - 0.15, BZ0, BZ1, []);
    this.gable('metal', (BX0 + BX1) / 2, BE, (BZ0 + BZ1) / 2, BX1 - BX0, BZ1 - BZ0, 2.4, '#5D7E9E', { both: true, wall: false, oh: 0.5 });
    this._tri(this._A('metal', BX1, -322), [BX1, BE, BZ1], [BX1, BE, BZ0], [BX1, BE + 2.4, (BZ0 + BZ1) / 2], [1, 0, 0], [0, 0, 7.3, 0, 3.6, 1.1], '#C9D1D6', true);
    const BLIN = this._cxLin('millRoof', '#C9D1D7', E.tex.metal, 0.3);
    this._cxRoofLiner(BLIN, (BX0 + BX1) / 2, BE + 2.4 * (0.3 / 8), (BZ0 + BZ1) / 2, BX1 - BX0 - 0.3, BZ1 - BZ0 - 0.6, 2.4 * (1 - 0.3 / 8), 0.07);
    this._tri(BLIN, [BX1 - 0.32, BE, BZ0 + 0.3], [BX1 - 0.32, BE, BZ1 - 0.3], [BX1 - 0.32, BE + 2.3, (BZ0 + BZ1) / 2], [-1, 0, 0], [0, 0, 7, 0, 3.5, 1.1], '#E1E6EA', false);
    this._sign('ห้องหม้อไอน้ำ (Boiler)', 4.2, 0.62, '#B23A2E', '#FFFFFF', [-299, 5.55, BZ1 + 0.03], 0, { size: 0.58 });
    // furnace (refractory brick) with flickering fire door
    this.box('brick', -303.75, 0.12, -324, 4.5, 3.9, 6.0, '#FFFFFF');
    for (const by of [1.15, 2.6, 3.95]) this.box('flat', -303.75, by, -324, 4.56, 0.1, 6.06, '#2E3236');
    for (const bx of [-305.95, -301.55]) for (const bz of [-326.95, -321.05]) this.box('flat', bx, 0.12, bz, 0.14, 3.95, 0.14, '#2E3236');
    this.box('flat', -303.75, 0.62, -320.98, 1.5, 0.1, 0.08, '#2B2B2B');
    this.box('flat', -303.75, 1.72, -320.98, 1.5, 0.1, 0.08, '#2B2B2B');
    for (const fx of [-304.45, -303.05]) this.box('flat', fx, 0.62, -320.98, 0.1, 1.2, 0.08, '#2B2B2B');
    this.box('flat', -303.75, 0.2, -320.97, 1.0, 0.42, 0.06, '#3A3F44');
    for (const px of [-305.2, -302.3]) this.cyl('glow', px, 2.75, -320.95, 0.06, 0.02, '#FF9A3D', 8);
    const fireTex = this._canvasTex(128, 128, (g, W, H) => {
      const gr = g.createLinearGradient(0, H, 0, 0);
      gr.addColorStop(0, '#FFF6C2'); gr.addColorStop(0.35, '#FFB13B'); gr.addColorStop(0.75, '#F06A22'); gr.addColorStop(1, '#B8320E');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const R2 = this._rng(31);
      for (let k = 0; k < 14; k++) {
        const x = R2() * W, w = 8 + R2() * 18, h = H * (0.35 + R2() * 0.5);
        const fg = g.createLinearGradient(0, H, 0, H - h);
        fg.addColorStop(0, 'rgba(255,250,210,0.9)'); fg.addColorStop(1, 'rgba(255,140,40,0)');
        g.fillStyle = fg; g.beginPath(); g.moveTo(x - w, H); g.quadraticCurveTo(x - w * 0.3, H - h * 0.6, x, H - h); g.quadraticCurveTo(x + w * 0.3, H - h * 0.6, x + w, H); g.fill();
      }
    }, { repeat: true });
    const fireMat = new T.MeshBasicMaterial({ map: fireTex, color: 0xffffff, toneMapped: false });
    const fire = new T.Mesh(new T.PlaneGeometry(1.32, 1.0), fireMat);
    fire.position.set(-303.75, 1.22, -320.96);
    this._addDyn(fire);
    const fire2 = new T.Mesh(new T.PlaneGeometry(0.95, 0.22), new T.MeshBasicMaterial({ color: 0xffe08a, toneMapped: false }));
    fire2.position.set(-303.75, 0.84, -320.955);
    this._addDyn(fire2);
    const poolMat = new T.MeshBasicMaterial({ map: E.tex.glow, color: this._lcol('#FF8A3D'), transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false });
    const pool = new T.Mesh(new T.PlaneGeometry(3.2, 2.6).rotateX(-Math.PI / 2), poolMat);
    pool.position.set(-303.75, 0.135, -319.9);
    this._addDyn(pool);
    this._anim((dt, t) => {
      const f = 0.78 + 0.16 * Math.sin(t * 13.1) * Math.sin(t * 7.3 + 1) + 0.08 * Math.sin(t * 23.7);
      fireMat.color.setRGB(f, f * 0.92, f * 0.85);
      fireTex.offset.x = (t * 0.37) % 1;
      fireTex.offset.y = 0.04 * Math.sin(t * 9.0);
      poolMat.opacity = 0.32 + 0.22 * f;
    });
    // ash door + ash pile + cart
    this.sph('flat', -302.6, 0.12, -320.1, 0.7, 0.28, 0.5, '#4A4846', 10);
    this.box('flat', -300.6, 0.32, -319.6, 0.9, 0.45, 0.6, '#5E666C');
    for (const wx of [-301.0, -300.2]) for (const wz of [-319.92, -319.28]) this.cylR('flat', wx, 0.24, wz, 0.12, 0.06, '#1C1C1C', Math.PI / 2, 0, 0, 10);
    // boiler shell on saddles + smokebox + fittings
    this.box('brick', -301.25, 1.6, -324, 0.6, 1.6, 1.6, '#FFFFFF');
    this.cylR('shiny', -296.75, 2.35, -324, 1.35, 8.6, '#C8CDD1', 0, 0, Math.PI / 2, 24);
    for (const ex of [-301.08, -292.42]) this.cylR('flat', ex, 2.35, -324, 1.38, 0.1, '#7E868C', 0, 0, Math.PI / 2, 24);
    for (const sx of [-299.2, -294.3]) this.box('concrete', sx, 0.12, -324, 0.7, 1.3, 2.4, '#BDB8AE');
    for (const bx of [-299.5, -297, -294.5]) this.cylR('flat', bx, 2.35, -324, 1.37, 0.12, '#9AA1A6', 0, 0, Math.PI / 2, 24);
    this.cyl('flat', -297.3, 3.62, -324, 0.32, 0.25, '#7E868C', 14);
    this.box('flat', -291.95, 0.9, -324, 0.9, 2.95, 2.6, '#3B4045');
    this.cylR('flat', -292.2, 3.15, -322.67, 0.24, 0.05, '#F4F4F4', Math.PI / 2, 0, 0, 16);
    this.cylR('flat', -292.2, 3.15, -322.69, 0.27, 0.03, '#2B2B2B', Math.PI / 2, 0, 0, 16);
    this.box('glow', -301.05, 2.55, -322.75, 0.05, 0.6, 0.06, '#73C7F2');
    this.box('flat', -301.05, 2.2, -322.72, 0.12, 0.08, 0.12, '#3A3F44');
    this.box('flat', -301.05, 3.2, -322.72, 0.12, 0.08, 0.12, '#3A3F44');
    // steam header + valves along the north side
    this.cylR('shiny', -298.5, 4.65, -328.4, 0.17, 11.5, '#B9C0C5', 0, 0, Math.PI / 2, 12);
    this.tube('shiny', [[-297.3, 3.7, -324], [-297.3, 4.65, -326.2], [-297.3, 4.65, -328.4]], 0.12, '#B9C0C5', 10);
    for (const vx of [-302.5, -298.5, -294.5]) {
      this.cyl('flat', vx, 4.85, -328.4, 0.07, 0.35, '#5E666C', 8);
      this.cylR('flat', vx, 5.25, -328.4, 0.2, 0.03, '#B23A2E', 0, 0, 0, 14);
    }
    this.tube('shiny', [[-304.25, 4.65, -328.4], [-307.9, 4.65, -328.4]], 0.15, '#B9C0C5', 10);
    this.cylR('flat', -296.0, 4.65, -328.05, 0.2, 0.05, '#F4F4F4', Math.PI / 2, 0, 0, 14);
    // flue duct to the chimney + ID fan outside
    this.box('flat', -290.1, 3.3, -324, 3.9, 1.0, 1.0, '#4A4F55');
    this.box('flat', -291.95, 3.85, -324, 0.9, 0.9, 1.0, '#4A4F55');
    this.box('flat', -285.6, 3.3, -324, 4.8, 1.0, 1.0, '#4A4F55');
    this.cylR('flat', -285.6, 1.5, -324, 0.95, 0.75, '#3E6E94', Math.PI / 2, 0, 0, 20);
    this.box('concrete', -285.6, 0, -324, 2.2, 0.55, 1.8, '#BDB8AE');
    this._cxMotor(-285.6, 1.05, -322.6, 'z', 0.8, 0.32);
    this._col(-286.8, -325.1, -284.4, -322.0);
    // softeners, brine tank, feed tank, control panel
    this.cyl('flat', -291.4, 0.12, -316.2, 0.32, 1.7, '#2E5FA8', 14);
    this.cyl('flat', -290.5, 0.12, -316.2, 0.32, 1.7, '#2E5FA8', 14);
    this.cyl('flat', -289.4, 0.12, -315.9, 0.4, 1.1, '#E8EAEC', 14);
    for (const lx of [-292.2, -289.4]) this.box('flat', lx, 0.12, -318.6, 0.12, 2.0, 0.12, STEEL);
    this.cylR('flat', -290.8, 2.75, -318.6, 0.65, 2.6, '#C9CED2', 0, 0, Math.PI / 2, 16);
    this.tube('flat', [[-290.8, 2.2, -318.6], [-291.0, 0.8, -319.6], [-294.2, 0.8, -322.4]], 0.05, '#8E979D', 8);
    this._col(-292.4, -319.4, -288.3, -315.4);
    this.box('flat', -307.7, 0.12, -317.4, 0.6, 2.0, 1.6, '#B8BEC2');
    for (let j = 0; j < 4; j++) this.box('glow', -307.39, 1.55, -317.9 + j * 0.3, 0.01, 0.08, 0.08, ['#5CFF7A', '#5CFF7A', '#FF5A4A', '#FFD54F'][j]);
    this.box('glow', -307.39, 1.15, -317.0, 0.01, 0.25, 0.4, '#8FE3FF');
    this._col(-308.0, -318.3, -307.3, -316.5);
    this._col(-306.15, -327.15, -301.35, -320.85);
    this._col(-301.6, -325.45, -291.45, -322.55);
    for (const p of [[-303, -318], [-296, -318], [-296, -326]]) this.box('glow', p[0], 7.0, p[1], 1.25, 0.04, 0.12, '#F2F7FF');
    // husk silo + screw feeder + pneumatic husk line from the mill
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; this.box('flat', -298 + Math.cos(a) * 2.6, 0, -341 + Math.sin(a) * 2.6, 0.25, 6.0, 0.25, STEEL); }
    this.cyl('metal', -298, 6, -341, 3.0, 9, '#C9CFD3', 22);
    this._gput('metal', 'cone16', -298, 4.5, -341, 3.0, 3.0, 3.0, Math.PI, 0, 0, '#BFC6CB');
    this.cone('metal', -298, 15, -341, 3.2, 1.6, '#B4BCC2', 22);
    this._col(-301.2, -344.2, -294.8, -337.8);
    this.tube('flat', [[-298, 3.0, -341], [-300.8, 5.2, -331.6], [-302.6, 5.0, -329.4], [-303.6, 4.15, -325.3]], 0.24, '#9AA3A9', 10);
    this.tube('flat', [[-367, 9.1, MZ0 - 0.2], [-367, 9.1, -336.2], [-302.6, 9.1, -336.2], [-298.8, 15.8, -340.2]], 0.3, GALV, 12);
    for (let x = -360; x < -304; x += 8) this.box('flat', x, 0.0, -336.2, 0.16, 9.0, 0.16, STEEL);
    // chimney (30 m) with marking bands, platform, guy wires + smoke
    const CX = -282.8, CZ = -324;
    this.box('concrete', CX, 0, CZ, 3.2, 1.2, 3.2, '#BDB8AE');
    this.cyl('shiny', CX, 1.2, CZ, 1.0, 10, '#8E969C', 18);
    this.cyl('shiny', CX, 11.2, CZ, 0.8, 19, '#8E969C', 18);
    this.cyl('flat', CX, 26.4, CZ, 0.82, 1.2, '#C62828', 18);
    this.cyl('flat', CX, 28.6, CZ, 0.82, 1.2, '#F4F4F4', 18);
    this.cyl('flat', CX, 29.8, CZ, 0.86, 0.4, '#C62828', 18);
    this.cyl('flat', CX, 23.8, CZ, 1.6, 0.12, '#4A4F55', 18);
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; this.box('flat', CX + Math.cos(a) * 1.55, 23.92, CZ + Math.sin(a) * 1.55, 0.05, 1.0, 0.05, '#4A4F55'); }
    for (let y = 1.2; y < 30; y += 0.45) this.box('flat', CX - 1.05, y, CZ, 0.06, 0.04, 0.45, '#4A4F55');
    for (const a of [0.6, 2.7, 4.8]) this.tube('flat', [[CX, 22, CZ], [CX + Math.cos(a) * 13, 0.3, CZ + Math.sin(a) * 13]], 0.02, '#3A3A3A', 4);
    this._col(CX - 1.6, CZ - 1.6, CX + 1.6, CZ + 1.6);
    this._emitter({ type: 'smoke', pos: [CX, 30.4, CZ], rate: 7, size: 3.2, rise: 2.6, spread: 0.7, life: 10, color: '#A3A39C' });
    // husk pile
    this.sph('dirt', -268, 0, -352, 15, 7.5, 11, '#E3BC66', 16);
    this.sph('dirt', -257, 0, -342, 9, 5, 7.5, '#DDB563', 14);
    this.sph('dirt', -279, 0, -362, 8, 4.4, 6.5, '#E6C06C', 14);
    this._col(-281, -361, -255, -343);
    this._col(-264, -347.5, -250, -337);
    this._col(-285, -366, -273, -358);

    // ---------- dryer tower, steel silos, elevator tower, catwalks (west)
    this.box('metal', -404, 0.12, -320, 4.4, 22, 3.6, '#BCC5CB');
    this.box('flat', -404, 22.12, -320, 4.8, 1.4, 4.0, '#8E99A1');
    this.box('flat', -404, 0.12, -322.6, 3.0, 2.4, 1.6, '#5E6A72');
    this.box('glow', -404, 0.7, -323.41, 0.5, 0.35, 0.01, '#FF8A3D');
    for (let y = 1.0; y < 22; y += 0.4) this.box('flat', -406.35, y, -318.6, 0.04, 0.04, 0.5, '#4A4F55');
    for (const lz of [-318.35, -318.85]) this.box('flat', -406.35, 0.12, lz, 0.05, 22, 0.05, '#4A4F55');
    this._col(-406.4, -323.5, -401.6, -318.1);
    this._cxElevator(-399.6, -321.5, 24.6, '#3E6E94');
    this.tube('flat', [[-399.6, 24.2, -321.5], [-402.0, 23.6, -320.4]], 0.2, GALV, 8);
    this.tube('flat', [[-401.6, 2.0, -320], [-392.0, 3.0, -321], [-388.2, 4.0, -321]], 0.18, GALV, 8);
    for (const sp of [[-414, -350], [-400, -350], [-414, -364]]) {
      this.cyl('concrete', sp[0], 0, sp[1], 5.9, 0.6, '#BDB8AE', 22);
      this.cyl('metal', sp[0], 0.6, sp[1], 5.5, 13.5, '#C9CFD3', 28);
      for (let k = 1; k < 5; k++) this.cyl('flat', sp[0], 0.6 + k * 2.7, sp[1], 5.56, 0.08, '#9AA3A9', 28);
      this.cone('metal', sp[0], 14.1, sp[1], 5.75, 2.9, '#B9C0C5', 28);
      this.cyl('flat', sp[0], 17.0, sp[1], 0.5, 0.6, '#8C959B', 10);
      this._col(sp[0] - 5.7, sp[1] - 5.7, sp[0] + 5.7, sp[1] + 5.7);
    }
    this.box('flat', -400.5, 0.12, -364, 2.2, 26, 2.2, '#3E6E94');
    this.box('flat', -400.5, 26.12, -364, 2.8, 1.6, 2.8, '#33607F');
    this._col(-401.7, -365.2, -399.3, -362.8);
    for (const tgt of [[-414, -350], [-400, -350], [-414, -364]]) {
      const dx = tgt[0] - (-400.5), dz = tgt[1] - (-364);
      const L = Math.hypot(dx, dz);
      void L;
      this.tube('flat', [[-400.5 + dx * 0.09, 26.4, -364 + dz * 0.09], [tgt[0], 17.5, tgt[1]]], 0.16, GALV, 8);
    }

    // ---------- open-sided rice storage shed + paddy drying yard (ลานตากข้าว)
    const SX0 = -268, SX1 = -204, SZ0 = -292, SZ1 = -262, SH = 7;
    this.box('concrete', (SX0 + SX1) / 2, 0, (SZ0 + SZ1) / 2, SX1 - SX0, 0.12, SZ1 - SZ0, '#B9B4AA', { tw: 6, th: 6 });
    for (let x = SX0; x <= SX1 + 0.01; x += 8) {
      for (const z of [SZ0, SZ1]) { this.box('flat', x, 0.12, z, 0.3, SH - 0.12, 0.3, STEEL); this._col(x - 0.2, z - 0.2, x + 0.2, z + 0.2); }
      this.box('flat', x, SH - 0.32, (SZ0 + SZ1) / 2, 0.2, 0.3, SZ1 - SZ0, STEEL);
    }
    this.gable('metal', (SX0 + SX1) / 2, SH, (SZ0 + SZ1) / 2, SX1 - SX0, SZ1 - SZ0, 2.2, '#5F86A8', { wall: false, oh: 1.0 });
    this._cxRoofLiner(this._cxLin('sheet', '#CBD3D8', E.tex.metal, 0.3), (SX0 + SX1) / 2, SH, (SZ0 + SZ1) / 2, SX1 - SX0, SZ1 - SZ0, 2.2, 0.07);
    for (let r = 0; r < 3; r++) {
      const z = SZ0 + 5 + r * 10;
      for (let i = 0; i < 9; i++) this._cxSacks(SX0 + 6 + i * 6.2, z, 5 + ((R() * 6) | 0), R, false);
      for (let i = 0; i < 9; i++) this._cxSacks(SX0 + 6 + i * 6.2, z + 2.1, 4 + ((R() * 5) | 0), R, false);
      this._col(SX0 + 4.6, z - 1.1, SX0 + 6 + 8 * 6.2 + 1.4, z + 3.2);
    }
    this._sign('โกดังเก็บข้าวสาร', 6, 0.9, '#1F4D36', '#FFFFFF', [(SX0 + SX1) / 2, SH - 1.0, SZ1 + 0.25], 0, { size: 0.6 });
    E.parkSpots.push({ x: -236, z: -255.5, yaw: Math.PI / 2, kind: 'truck', color: '#E0A21B' });
    for (const p of [[-296, -239, 22, 18], [-268, -239, 26, 18], [-248.5, -239, 9, 18]]) {
      this.plane('dirt', p[0], 0.065, p[1], p[2], p[3], '#E8C66A', { tw: 3, th: 3 });
      for (let k = 0; k < Math.floor(p[3] / 1.2); k++) this.box('paint', p[0], 0.066, p[1] - p[3] / 2 + 0.6 + k * 1.2, p[2] - 0.6, 0.006, 0.08, '#C99F45');
    }
    E.crowdSpots.push({ x: -280, z: -236, yaw: Math.PI / 2, mode: 'work', outfit: 'farmer' });
    E.crowdSpots.push({ x: -262, z: -244, yaw: -Math.PI / 2, mode: 'work', outfit: 'farmer' });

    // ---------- lights inside, glass, fences, people, trees
    this._cxFenceMesh(F);
    this._cxLinFlush();
    E.crowdSpots.push({ x: -330.4, z: -317.6, yaw: Math.PI, mode: 'work', outfit: 'worker' });
    E.crowdSpots.push({ x: -338.0, z: -318.9, yaw: Math.PI, mode: 'work', outfit: 'worker' });
    E.crowdSpots.push({ x: -365.8, z: -313.4, yaw: Math.PI, mode: 'work', outfit: 'worker' });
    E.crowdSpots.push({ x: -378.0, z: -300.6, yaw: 0, mode: 'work', outfit: 'worker' });
    E.crowdSpots.push({ x: -383.0, z: -312.0, yaw: Math.PI, mode: 'stand', outfit: 'worker' });
    E.crowdSpots.push({ x: -303.4, z: -318.7, yaw: Math.PI, mode: 'work', outfit: 'worker' });
    E.crowdSpots.push({ x: -378.3, z: -279.2, yaw: -Math.PI / 2, mode: 'stand', outfit: 'casual' });
    E.crowdSpots.push({ x: -336.5, z: -238.8, yaw: Math.PI / 2, mode: 'sit', outfit: 'office' });
    E.crowdSpots.push({ x: -406.5, z: -244.6, yaw: 0, mode: 'chat', outfit: 'office' });
    E.crowdSpots.push({ x: -405.6, z: -243.9, yaw: Math.PI, mode: 'chat', outfit: 'worker' });
    for (let x = -424; x < -186; x += 15) if (x < -345 || x > -300) E.treeSpots.push({ x: x, z: -223.5, s: 0.9 + R() * 0.3, kind: 'rain' });
    for (let k = 0; k < 10; k++) E.treeSpots.push({ x: -236 + R() * 52, z: -300 - R() * 140, s: 0.8 + R() * 0.5, kind: pick(['rain', 'mango', 'teak']) });
    E.treeSpots.push({ x: -428, z: -250, s: 0.8, kind: 'mango' });
    E.treeSpots.push({ x: -400.5, z: -246.5, s: 0.7, kind: 'palm' });

    // ---------- interiors + anchors
    for (const x of [-381, -367, -353, -339, -325, -312]) LAMPS.push([x, 8.0, -316, '#FFF1D6', 1.6, 28]);
    for (const l of WHL) LAMPS.push(l);
    this._whFlush();
    this._interior({ name: 'mill', rect: [MX0 + WT, MZ0 + WT, MX1 - WT, MZ1 - WT], helmet: true, label: 'ภายในโรงสีข้าว', lights: LAMPS });
    this._interior({ name: 'boiler', rect: [BX0, BZ0 + 0.3, BX1 - 0.3, BZ1 - 0.3], helmet: true, label: 'ห้องหม้อไอน้ำแกลบ',
      lights: [[-303, 6.8, -318, '#FFE6C4', 1.3, 16], [-296, 6.8, -318, '#FFE6C4', 1.2, 16], [-296, 6.8, -326, '#FFE6C4', 1.2, 16], [-303.75, 1.3, -320.3, '#FF8A3D', 1.8, 7]] });
    this._stopAnchor(9, {
      view: [-298.5, -316.6], look: [-303.6, 1.3, -321.15], guide: [-300.6, -316.85],
      pin: [-299.5, 5.3, -322.6], emit: [-303.6, 2.4, -321.5], gas: ['CH4', 'N2O'], spread: 1.2,
      route: [[-321.5, -217.5], [-321.5, -262], [-300, -292], [-299, -310.5], [-298.5, -316.6]], inside: 'boiler', district: 'industry'
    });
    this._stopAnchor(10, {
      view: [-320.5, -313.2], look: [-320, 1.25, -320.5], guide: [-321.8, -314.7],
      pin: [-320, 3.6, -320.5], emit: [-320, 2.0, -320.6], gas: ['CO2', 'CH4', 'N2O'], spread: 2.6,
      route: [[-322, -217.5], [-322, -296.5], [-322, -300.5], [-321.5, -306], [-320.5, -313.2]], inside: 'mill', district: 'industry'
    });
    this._stopAnchor(11, {
      view: [-371.5, -282.5], look: [-381, 2.3, -289], guide: [-373.6, -282.4],
      pin: [-381, 5.9, -287.2], emit: [-380.0, 3.75, -282.7], gas: ['CO2'], spread: 0.9,
      route: [[-326, -217.5], [-326, -250], [-358, -271], [-371.5, -282.5]], inside: null, district: 'industry'
    });
  }
};
