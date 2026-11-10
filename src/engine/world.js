/* GHG Town 3D v0.3 — world.js (city builder). Built from w1..w5 */
/* GHG Town 3D v0.3 — world part 1: orchestrator, utilities, road graph, roads, paint, sidewalks */
GHG3.world = GHG3.world || {};
Object.assign(GHG3.world, {
  _buildWorld() {
    const E = this._E;
    E.treeSpots = E.treeSpots || [];
    E.crowdSpots = E.crowdSpots || [];
    E.parkSpots = E.parkSpots || [];
    E.animalSpots = E.animalSpots || { cows: [], buffalo: [], egrets: [], dogs: [], birds: [] };
    for (const k of ['cows', 'buffalo', 'egrets', 'dogs', 'birds']) E.animalSpots[k] = E.animalSpots[k] || [];
    E.walkLoops = E.walkLoops || [];
    E.wWire = [];
    E.wGeoC = {};
    // bigger static chunks = fewer draw calls (culling granularity is still fine at 400 m)
    for (const k in E.BK) if (!E.BK[k].chunk) E.BK[k].chunk = 400;
    const run = (k) => {
      if (typeof this[k] !== 'function') return;
      try { this[k](); } catch (err) { console.error('[GHG Town] ' + k + ' failed', err); }
    };
    this._initSky();
    run('_bTerrain');
    for (const k of ['_wGraph', '_wRoads', '_wSidewalks', '_wRiver', '_wGate', '_wBlocks', '_wMunicipal', '_wSchool', '_wSubstation', '_wStreet', '_wStreetTrees']) run(k);
    for (const k of ['_bMinimart', '_bHospital', '_bMill', '_bLandfill', '_bFarms', '_bForest', '_bEnergy']) run(k);
    for (const k of ['_wFeeds', '_wParked', '_wTrees', '_wWires']) run(k);
    this._flushAll();
    this._initLamps();
    run('_wTrafficInit');
    for (const k of ['_initGuide', '_initCrowd', '_initAnimals', '_initPlay', '_initTune']) run(k);
  },

  // ------------------------------------------------------------- utilities
  // local -> world offset for a frame at (x,z) rotated by yaw (rotation.y convention)
  _wP(x, z, yaw, lx, lz) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return [x + lx * c + lz * s, z - lx * s + lz * c];
  },
  // cached baked geometry
  _wGeo(key, fn, bk) {
    const E = this._E;
    if (!E.wGeoC[key]) E.wGeoC[key] = this._bake(fn, bk);
    return E.wGeoC[key];
  },
  // stamp a baked geometry into a static bucket with a y-rotation
  _wStamp(b, geo, x, y, z, yaw) {
    const A = this._A(b, x, z);
    const P = geo.attributes.position.array, N = geo.attributes.normal.array, U = geo.attributes.uv.array, Cc = geo.attributes.color.array;
    const I = geo.index ? geo.index.array : null;
    const c = Math.cos(yaw || 0), s = Math.sin(yaw || 0);
    const k = A.vc, n = P.length / 3;
    for (let i = 0; i < n; i++) {
      const px = P[i * 3], py = P[i * 3 + 1], pz = P[i * 3 + 2];
      A.p.push(x + px * c + pz * s, y + py, z - px * s + pz * c);
      const nx = N[i * 3], ny = N[i * 3 + 1], nz = N[i * 3 + 2];
      A.n.push(nx * c + nz * s, ny, -nx * s + nz * c);
      A.u.push(U[i * 2], U[i * 2 + 1]);
      A.c.push(Cc[i * 3], Cc[i * 3 + 1], Cc[i * 3 + 2]);
    }
    if (I) { for (let i = 0; i < I.length; i++) A.i.push(k + I[i]); } else { for (let i = 0; i < n; i++) A.i.push(k + i); }
    A.vc += n;
  },
  // local box in a rotated frame F = {x, z, yaw, y}
  _wLB(b, F, lx, y, lz, w, h, d, col, o) {
    const p = this._wP(F.x, F.z, F.yaw || 0, lx, lz);
    this.box(b, p[0], (F.y || 0) + y, p[1], w, h, d, col, Object.assign({ ry: F.yaw || 0 }, o || {}));
  },
  // quad from 4 world points (counter-clockwise from the visible side); uv in metres / bucket tile
  _wQ(b, p0, p1, p2, p3, col, both) {
    const A = this._A(b, (p0[0] + p2[0]) / 2, (p0[2] + p2[2]) / 2);
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
    const vx = p3[0] - p0[0], vy = p3[1] - p0[1], vz = p3[2] - p0[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    const bk = this._bkInfo(A);
    const wu = Math.hypot(ux, uy, uz) / bk.tw, wv = Math.hypot(vx, vy, vz) / bk.th;
    this._quad(A, p0, p1, p2, p3, [nx, ny, nz], [0, 0, wu, wv], col, both);
  },
  _wRX(z) { return window.GHG3L.river.x(z); },
  _wBankW(z) { return this._wRX(z) - window.GHG3L.river.w / 2; },
  _wBankE(z) { return this._wRX(z) + window.GHG3L.river.w / 2; },
  // bridge deck surface height (vehicles); 0 elsewhere
  _wDeckY(x, z) {
    const E = this._E;
    for (const b of E.wBridges || []) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) return b.y;
    return 0;
  },
  _wPick(R, arr) { return arr[(R() * arr.length) | 0]; },

  // ------------------------------------------------------------- road graph
  _wGraph() {
    const E = this._E;
    const L = window.GHG3L;
    const roads = L.roads.map((r) => {
      const horiz = Math.abs(r.a[1] - r.b[1]) < 1e-6;
      const a = r.a.slice(), b = r.b.slice();
      if (horiz && (r.id === 'B' || r.id === 'C' || r.id === 'D')) b[0] = 540;
      return { id: r.id, name: r.name || '', horiz: horiz, a: a, b: b, w: r.w, side: r.side || 0, rural: !!r.rural, median: r.median || 0, lanes: r.lanes || 2, cross: [] };
    });
    const nodes = [];
    const nodeAt = (x, z) => {
      for (const n of nodes) if (Math.abs(n.x - x) < 0.6 && Math.abs(n.z - z) < 0.6) return n;
      const n = { id: nodes.length, x: x, z: z, edges: [], roads: [], light: false };
      nodes.push(n);
      return n;
    };
    const H = roads.filter((r) => r.horiz), V = roads.filter((r) => !r.horiz);
    for (const h of H) for (const v of V) {
      const x = v.a[0], z = h.a[1];
      const hx0 = Math.min(h.a[0], h.b[0]), hx1 = Math.max(h.a[0], h.b[0]);
      const vz0 = Math.min(v.a[1], v.b[1]), vz1 = Math.max(v.a[1], v.b[1]);
      if (x >= hx0 - 0.6 && x <= hx1 + 0.6 && z >= vz0 - 0.6 && z <= vz1 + 0.6) {
        const n = nodeAt(x, z);
        if (n.roads.indexOf(h) < 0) n.roads.push(h);
        if (n.roads.indexOf(v) < 0) n.roads.push(v);
        h.cross.push({ n: n, o: v });
        v.cross.push({ n: n, o: h });
      }
    }
    for (const r of roads) for (const p of [r.a, r.b]) { const n = nodeAt(p[0], p[1]); if (n.roads.indexOf(r) < 0) n.roads.push(r); }
    // vertical roads sharing an end node (N3 + H) are connected too
    const edges = [];
    for (const r of roads) {
      const along = (n) => (r.horiz ? n.x : n.z);
      const lo = Math.min(r.horiz ? r.a[0] : r.a[1], r.horiz ? r.b[0] : r.b[1]);
      const hi = Math.max(r.horiz ? r.a[0] : r.a[1], r.horiz ? r.b[0] : r.b[1]);
      const ns = nodes.filter((n) => (r.horiz ? Math.abs(n.z - r.a[1]) < 0.6 : Math.abs(n.x - r.a[0]) < 0.6) && along(n) >= lo - 0.6 && along(n) <= hi + 0.6);
      ns.sort((p, q) => along(p) - along(q));
      r.nodes = ns;
      for (let i = 0; i < ns.length - 1; i++) {
        const A = ns[i], B = ns[i + 1];
        const len = Math.hypot(B.x - A.x, B.z - A.z);
        if (len < 1) continue;
        const e = { id: edges.length, road: r, a: A, b: B, len: len, dx: (B.x - A.x) / len, dz: (B.z - A.z) / len };
        edges.push(e);
        A.edges.push(e);
        B.edges.push(e);
      }
    }
    // half carriageway clearance at a node for road r = widest crossing road / 2
    for (const n of nodes) {
      n.clr = {};
      for (const r of n.roads) {
        let c = 0;
        for (const o of n.roads) if (o !== r && o.horiz !== r.horiz) c = Math.max(c, o.w / 2);
        n.clr[r.id] = c;
      }
    }
    // signalised junctions: A x N2 / N3 / N4 / N5
    for (const n of nodes) {
      const ids = n.roads.map((r) => r.id);
      if (ids.indexOf('A') >= 0 && (ids.indexOf('N2') >= 0 || ids.indexOf('N3') >= 0 || ids.indexOf('N4') >= 0 || ids.indexOf('N5') >= 0)) { n.light = true; n.phase = (n.x * 0.013) % 1; }
    }
    E.wG = { roads: roads, nodes: nodes, edges: edges, byId: {} };
    for (const r of roads) E.wG.byId[r.id] = r;
  },

  // ------------------------------------------------------------- roads + paint
  _wRoads() {
    const E = this._E;
    const G = E.wG;
    const WHITE = '#EDEDE6', YEL = '#E2B42A';
    const L = window.GHG3L;
    // bridge spans where the carriageway is replaced by the bridge deck
    const bridgeCut = (r) => {
      if (!r.horiz || (r.id !== 'A' && r.id !== 'E')) return null;
      const z = r.a[1];
      return [this._wBankW(z) - 7, this._wBankE(z) + 7];
    };
    const segPlane = (r, s0, s1) => {
      // s along the road axis (x for horizontal, z for vertical)
      if (s1 - s0 < 0.05) return;
      if (r.id === 'H') {
        const left = [], right = [];
        for (let s = s0; s <= s1 + 0.01; s += Math.min(5, s1 - s0)) {
          const ss = Math.min(s, s1);
          left.push([r.a[0] - r.w / 2, ss]); right.push([r.a[0] + r.w / 2, ss]);
          if (ss >= s1) break;
        }
        this._strip('asphalt', left, right, (x, z) => L.H(x, z) + 0.06, '#E9E9E9');
        return;
      }
      const mid = (s0 + s1) / 2, len = s1 - s0;
      const tint = r.rural ? '#E2E2DE' : '#FFFFFF';
      if (r.horiz) this.plane('asphalt', mid, 0.04, r.a[1], len, r.w, tint);
      else this.plane('asphalt', r.a[0], 0.04, mid, r.w, len, tint);
    };
    const dashes = (r, s0, s1, off, col, dash, gap, wid) => {
      for (let s = s0 + 1; s + dash <= s1 - 1; s += dash + gap) {
        if (r.id === 'H') continue;
        const c = s + dash / 2;
        if (r.horiz) this.plane('paint', c, 0.055, r.a[1] + off, dash, wid, col);
        else this.plane('paint', r.a[0] + off, 0.055, c, wid, dash, col);
      }
    };
    const solid = (r, s0, s1, off, col, wid) => {
      if (s1 - s0 < 0.5 || r.id === 'H') return;
      const c = (s0 + s1) / 2;
      if (r.horiz) this.plane('paint', c, 0.055, r.a[1] + off, s1 - s0, wid, col);
      else this.plane('paint', r.a[0] + off, 0.055, c, wid, s1 - s0, col);
    };
    for (const r of G.roads) {
      const ns = r.nodes;
      const cut = bridgeCut(r);
      for (let i = 0; i < ns.length - 1; i++) {
        const A = ns[i], B = ns[i + 1];
        const sa = (r.horiz ? A.x : A.z) + (A.clr[r.id] || 0);
        const sb = (r.horiz ? B.x : B.z) - (B.clr[r.id] || 0);
        let parts = [[sa, sb]];
        if (cut) parts = [[sa, Math.min(sb, cut[0])], [Math.max(sa, cut[1]), sb]].filter((p) => p[1] > p[0]);
        for (const p of parts) {
          segPlane(r, p[0], p[1]);
          // markings
          if (r.id === 'A') {
            for (const sg of [-1, 1]) {
              dashes(r, p[0], p[1], sg * 5.5, WHITE, 3, 6, 0.15);
              solid(r, p[0] + 0.5, p[1] - 0.5, sg * 9.65, WHITE, 0.15);
              solid(r, p[0] + 0.5, p[1] - 0.5, sg * 1.25, YEL, 0.12);
            }
          } else if (r.rural) {
            dashes(r, p[0], p[1], 0, YEL, 3, 6, 0.14);
            solid(r, p[0] + 0.5, p[1] - 0.5, r.w / 2 - 0.35, WHITE, 0.14);
            solid(r, p[0] + 0.5, p[1] - 0.5, -(r.w / 2 - 0.35), WHITE, 0.14);
          } else {
            dashes(r, p[0], p[1], 0, YEL, 3, 5, 0.14);
          }
        }
      }
      // rural shoulders (gravel)
      if (r.rural && r.id !== 'H') {
        const len = Math.abs((r.horiz ? r.b[0] - r.a[0] : r.b[1] - r.a[1]));
        const mid = r.horiz ? (r.a[0] + r.b[0]) / 2 : (r.a[1] + r.b[1]) / 2;
        for (const sg of [-1, 1]) {
          if (r.horiz) this.plane('dirt', mid, 0.025, r.a[1] + sg * (r.w / 2 + 0.9), len, 1.8, '#C9BBA2');
          else this.plane('dirt', r.a[0] + sg * (r.w / 2 + 0.9), 0.025, mid, 1.8, len, '#C9BBA2');
        }
      }
    }
    // A outside the city: gravel shoulders
    for (const seg of [[-1700, -736], [632, 1500]]) for (const sg of [-1, 1]) this.plane('dirt', (seg[0] + seg[1]) / 2, 0.025, sg * 11, seg[1] - seg[0], 2, '#C9BBA2');
    // intersection squares
    for (const n of G.nodes) {
      if (n.roads.length < 2) continue;
      let wx = 0, wz = 0;
      for (const r of n.roads) { if (r.horiz) wz = Math.max(wz, r.w); else wx = Math.max(wx, r.w); }
      if (!wx || !wz) continue;
      this.plane('asphalt', n.x, 0.04, n.z, wx, wz, '#F4F4F4');
    }
    // A median (curbed planter) — gaps at junctions and zebra crossings
    const A = G.byId.A;
    const gaps = [];
    for (const c of A.cross) gaps.push([c.n.x - c.o.w / 2 - 3, c.n.x + c.o.w / 2 + 3]);
    for (const zx of [-640, -520, -100, 230]) gaps.push([zx - 3, zx + 3]);
    const cutA = bridgeCut(A);
    gaps.push(cutA);
    gaps.sort((p, q) => p[0] - q[0]);
    let s = -1700;
    const medSegs = [];
    for (const g of gaps) { if (g[0] > s) medSegs.push([s, g[0]]); s = Math.max(s, g[1]); }
    medSegs.push([s, 1500]);
    E.wMedSegs = medSegs;
    for (const m of medSegs) {
      const len = m[1] - m[0];
      if (len < 1) continue;
      this.box('concrete', (m[0] + m[1]) / 2, 0, 0, len, 0.22, 2, '#D9D4C6', { top: 'grass', topCol: '#9DB86A' });
    }
    // stop lines + zebra crossings at signalised junctions (and a few mid-block crossings)
    const zebraAcrossA = (x) => {
      for (let z = -9.5; z <= 9.5; z += 1.0) { if (Math.abs(z) < 1.1) continue; this.plane('paint', x, 0.056, z, 3.6, 0.5, WHITE); }
    };
    const zebraAcrossV = (x, z, w) => {
      for (let xx = -w / 2 + 0.5; xx <= w / 2 - 0.5; xx += 1.0) this.plane('paint', x + xx, 0.056, z, 0.5, 3.2, WHITE);
    };
    for (const n of G.nodes) {
      if (!n.light) continue;
      const v = n.roads.find((r) => !r.horiz);
      const hw = v.w / 2;
      zebraAcrossA(n.x - hw - 2.6);
      zebraAcrossA(n.x + hw + 2.6);
      zebraAcrossV(n.x, -12, v.w);
      zebraAcrossV(n.x, 12, v.w);
      // stop lines (left-hand traffic): eastbound uses north half, westbound south half
      this.plane('paint', n.x - hw - 5.2, 0.056, -5.5, 0.4, 9, WHITE);
      this.plane('paint', n.x + hw + 5.2, 0.056, 5.5, 0.4, 9, WHITE);
      this.plane('paint', n.x + v.w / 4, 0.056, -15.2, v.w / 2, 0.4, WHITE);
      this.plane('paint', n.x - v.w / 4, 0.056, 15.2, v.w / 2, 0.4, WHITE);
    }
    for (const zx of [-640, -520, -100, 230]) zebraAcrossA(zx);
    // zebra across side roads near the market + school / hospital fronts
    for (const n of G.nodes) {
      const ids = n.roads.map((r) => r.id);
      if (n.light || n.roads.length < 2) continue;
      const v = n.roads.find((r) => !r.horiz), h = n.roads.find((r) => r.horiz);
      if (!v || !h || v.rural || h.rural) continue;
      if (ids.indexOf('B') >= 0 || ids.indexOf('C') >= 0) {
        zebraAcrossV(n.x, n.z - h.w / 2 - v.side / 2 - 0.2, v.w);
        zebraAcrossV(n.x, n.z + h.w / 2 + v.side / 2 + 0.2, v.w);
      }
    }
  },

  // ------------------------------------------------------------- sidewalks (block rings)
  _wGrid() {
    const XS = [{ x: -620, w: 12, s: 3 }, { x: -440, w: 12, s: 3 }, { x: -170, w: 12, s: 3 }, { x: 120, w: 12, s: 3 }, { x: 400, w: 12, s: 3 }];
    const ZS = [{ z: -460, w: 12, s: 3 }, { z: -210, w: 12, s: 3 }, { z: 0, w: 20, s: 4 }, { z: 210, w: 12, s: 3 }, { z: 460, w: 10, s: 3 }];
    const blocks = [];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      const L = XS[i], Z0 = ZS[j], Z1 = ZS[j + 1];
      const R = i < 4 ? XS[i + 1] : null;
      const ox0 = L.x + L.w / 2, ox1 = R ? R.x - R.w / 2 : 535;
      const oz0 = Z0.z + Z0.w / 2, oz1 = Z1.z - Z1.w / 2;
      blocks.push({ i: i, j: j, ox0: ox0, ox1: ox1, oz0: oz0, oz1: oz1, x0: ox0 + L.s, x1: R ? ox1 - R.s : 535, z0: oz0 + Z0.s, z1: oz1 - Z1.s, east: !!R });
    }
    return blocks;
  },
  _wSidewalks() {
    const E = this._E;
    const blocks = E.wBlocksDef = this._wGrid();
    const sw = (x0, z0, x1, z1) => {
      if (x1 - x0 < 0.05 || z1 - z0 < 0.05) return;
      this.box('paving', (x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, 0.15, z1 - z0, '#D6D1C7', { sides: 'concrete' });
    };
    const R = this._rng(808);
    for (const b of blocks) {
      sw(b.ox0, b.oz0, b.ox1, b.z0);
      sw(b.ox0, b.z1, b.ox1, b.oz1);
      sw(b.ox0, b.z0, b.x0, b.z1);
      if (b.east) sw(b.x1, b.z0, b.ox1, b.z1);
      // painted red-white curb segments near junction corners
      for (const c of [[b.ox0, b.oz0], [b.ox1, b.oz0], [b.ox0, b.oz1], [b.ox1, b.oz1]]) {
        if (!b.east && c[0] > 530) continue;
        const sx = c[0] === b.ox0 ? 1 : -1, sz = c[1] === b.oz0 ? 1 : -1;
        for (let k = 0; k < 6; k++) {
          const col = k % 2 ? '#F2F2EE' : '#C8352B';
          this.box('flat', c[0] + sx * (1 + k + 0.5), 0, c[1] + sz * 0.12, 1, 0.16, 0.26, col);
          this.box('flat', c[0] + sx * 0.12, 0, c[1] + sz * (1 + k + 0.5), 0.26, 0.16, 1, col);
        }
      }
      void R;
    }
    // outer sidewalks on boundary roads
    sw(-629, -469, -174, -466);
    sw(-166, -469, 540, -466);
    sw(-629, 465, 540, 468);
    sw(-629, -466, -626, -10);
    sw(-629, 10, -626, 465);
    // road A west of W (gate approach) and east of the city to the bridge
    sw(-736, -14, -629, -10);
    sw(-736, 10, -629, 14);
    sw(535, -14, this._wBankW(-12) - 6.6, -10);
    sw(535, 10, this._wBankW(12) - 6.6, 14);
  }
});
/* GHG Town 3D v0.3 — world part 2: river + bridges + boats, city gate, street furniture */
Object.assign(GHG3.world, {
  // ------------------------------------------------------------- river
  _wRiver() {
    const E = this._E;
    const T = E.T;
    const RV = window.GHG3L.river;
    const zA = -2000, zB = 2000, step = 8;
    // water (chunked meshes so they cull)
    for (let z0 = zA; z0 < zB; z0 += 500) {
      const left = [], right = [];
      for (let z = z0; z <= z0 + 500 + 0.01; z += step) { left.push([this._wBankW(z), z]); right.push([this._wBankE(z), z]); }
      const A = this._newAcc('flat');
      this._strip(A, left, right, 0.06, '#FFFFFF', { tw: 44, th: 44 });
      const m = new T.Mesh(this._accGeo(A), E.mats.water);
      m.receiveShadow = true;
      this._addDyn(m);
    }
    this._anim((dt) => { const mp = E.mats.water.map; mp.offset.y -= dt * 0.012; mp.offset.x += dt * 0.004; });
    // flood walls (gap only where the bridges' parapets close the edge)
    const gap = (z) => Math.abs(z) < 14.2 || (z > 451.8 && z < 468.2);
    for (const side of [-1, 1]) {
      for (let z = zA; z < zB; z += 5) {
        const z1 = z, z2 = z + 5;
        if (gap(z1 + 2.5) || gap(z1) || gap(z2)) continue;
        const x1 = (side < 0 ? this._wBankW(z1) : this._wBankE(z1)) + side * 0.25;
        const x2 = (side < 0 ? this._wBankW(z2) : this._wBankE(z2)) + side * 0.25;
        const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
        const len = Math.hypot(x2 - x1, z2 - z1);
        const ry = Math.atan2(x2 - x1, z2 - z1);
        this.box('concrete', cx, 0, cz, 0.55, 0.85, len + 0.05, '#CDC8BE', { ry: ry });
        // inner bank face dropping into the water (dark wet band)
        this.box('flat', cx - side * 0.3, -0.4, cz, 0.06, 0.48, len + 0.05, '#5F655F', { ry: ry, top: false });
        this._colBox(cx, cz, 0.55, len, ry, 0.05);
        // railing on the city promenade
        if (side < 0 && z1 > -451 && z2 < 451) {
          this.box('shiny', x1, 0.85, z1, 0.08, 0.95, 0.08, '#8E959A');
          this.box('shiny', cx, 1.72, cz, 0.07, 0.07, len, '#9AA1A6', { ry: ry });
          this.box('shiny', cx, 1.32, cz, 0.05, 0.05, len, '#9AA1A6', { ry: ry });
        }
      }
    }
    // promenade + lawn (city side, between D and E)
    const prL = [], prR = [], lawnL = [], lawnR = [];
    const segs = [[-451, -14.5], [14.5, 451]];
    for (const sg of segs) {
      prL.length = 0; prR.length = 0; lawnL.length = 0; lawnR.length = 0;
      for (let z = sg[0]; z <= sg[1] + 0.01; z += 6) {
        const zz = Math.min(z, sg[1]);
        const bw = this._wBankW(zz);
        prL.push([bw - 12, zz]); prR.push([bw - 0.5, zz]);
        lawnL.push([535, zz]); lawnR.push([bw - 12, zz]);
        if (zz >= sg[1]) break;
      }
      this._strip('paving', prL.slice(), prR.slice(), 0.05, '#D9D3C6');
      this._strip('grass', lawnL.slice(), lawnR.slice(), 0.03, '#FFFFFF');
    }
    const R = this._rng(5150);
    const bench = this._wBenchGeo();
    const plamp = this._wGeo('plamp', (A) => {
      this.cyl(A, 0, 0, 0, 0.07, 4.2, '#2F3A40', 8);
      this.cyl(A, 0, 0, 0, 0.16, 0.5, '#2F3A40', 8);
      this.sph(A, 0, 4.45, 0, 0.28, 0.28, 0.28, '#F4F1E6', 10);
    }, 'shiny');
    const walk = [];
    for (let z = -445; z <= 445; z += 5) {
      if (Math.abs(z) < 16) continue;
      const bw = this._wBankW(z);
      if (Math.round(z) % 25 === 0) { this._wStamp('shiny', plamp, bw - 1.4, 0.05, z, 0); this._lamp(bw - 1.4, 4.4, z, { pool: 6 }); }
      if (Math.round(z) % 40 === 0) {
        const ry = Math.atan2(this._wBankW(z + 1) - this._wBankW(z - 1), 2) - Math.PI / 2;
        this._wStamp('flat', bench, bw - 3.2, 0.05, z, ry + Math.PI);
        this._colBox(bw - 3.2, z, 1.9, 0.6, 0, 0);
      }
      if (Math.round(z) % 20 === 0) E.treeSpots.push({ x: bw - 13.5 - R() * 3, z: z + R() * 4, s: 0.8 + R() * 0.5, kind: R() < 0.55 ? 'rain' : (R() < 0.5 ? 'palm' : 'mango') });
      if (Math.round(z) % 15 === 0) walk.push([bw - 6, z]);
    }
    E.walkLoops.push({ pts: walk, closed: false });
    // bridges
    E.wBridges = [];
    const bridge = (zc, halfW, roadW, side, landmark) => {
      let bx0 = 1e9, bx1 = -1e9;
      for (let z = zc - halfW; z <= zc + halfW; z += 1) { bx0 = Math.min(bx0, this._wBankW(z) - 7); bx1 = Math.max(bx1, this._wBankE(z) + 7); }
      const len = bx1 - bx0, cx = (bx0 + bx1) / 2;
      const deckY = 0.3;
      E.wBridges.push({ x0: bx0, x1: bx1, z0: zc - halfW, z1: zc + halfW, y: deckY });
      this.box('concrete', cx, -0.7, zc, len, 1.0, halfW * 2 + 0.6, '#C7C2B8', { top: 'asphalt', topCol: '#F0F0F0' });
      // ramps from the street (0.04) up to the deck
      for (const s of [-1, 1]) {
        const xe = s < 0 ? bx0 : bx1;
        const xo = xe + s * 7;
        this._wQ('asphalt', s < 0 ? [xo, 0.045, zc + roadW / 2] : [xe, deckY, zc + roadW / 2], s < 0 ? [xe, deckY, zc + roadW / 2] : [xo, 0.045, zc + roadW / 2], s < 0 ? [xe, deckY, zc - roadW / 2] : [xo, 0.045, zc - roadW / 2], s < 0 ? [xo, 0.045, zc - roadW / 2] : [xe, deckY, zc - roadW / 2], '#F0F0F0');
      }
      // sidewalks on the deck + parapets
      for (const sg of [-1, 1]) {
        this.box('paving', cx, deckY, zc + sg * (roadW / 2 + side / 2), len, 0.15, side, '#D6D1C7', { sides: 'concrete' });
        this.box('concrete', cx, deckY, zc + sg * (halfW + 0.15), len, 1.15, 0.3, '#D8D3C9');
        this.box('shiny', cx, deckY + 1.15, zc + sg * (halfW + 0.15), len, 0.08, 0.36, '#9AA1A6');
        this._col(bx0 + 6, zc + sg * halfW - (sg > 0 ? 0 : 0.6), bx1 - 6, zc + sg * halfW + (sg > 0 ? 0.6 : 0));
        // piers into the water
        for (const px of [this._wRX(zc) - 9, this._wRX(zc) + 9]) this.box('concrete', px, -0.6, zc + sg * (halfW - 2), 1.6, 0.8, 1.6, '#BDB8AE');
        for (let x = bx0 + 4; x < bx1 - 2; x += 12) this._lamp(x, deckY + 6.6, zc + sg * (halfW - 0.3), { pool: 7 });
      }
      // lamp posts on the parapet
      for (let x = bx0 + 4; x < bx1 - 2; x += 12) for (const sg of [-1, 1]) {
        this.cyl('shiny', x, deckY + 1.2, zc + sg * (halfW - 0.3), 0.09, 5.2, '#41505A', 8);
        this.box('flat', x, deckY + 6.35, zc + sg * (halfW - 0.3) - sg * 0.5, 0.35, 0.18, 1.1, '#E9E5DA');
      }
      // lane paint on the deck
      for (let x = bx0 + 1; x < bx1 - 3; x += 9) this.plane('paint', x + 1.5, deckY + 0.015, zc, 3, 0.15, '#E2B42A');
      if (landmark) {
        // tied steel arches with hangers
        for (const sg of [-1, 1]) {
          const pts = [];
          const zz = zc + sg * (halfW + 0.9);
          for (let i = 0; i <= 16; i++) {
            const t = i / 16;
            const x = bx0 + 3 + (len - 6) * t;
            pts.push([x, deckY + 1.2 + 14 * 4 * t * (1 - t), zz]);
          }
          this.tube('shiny', pts, 0.42, '#E8EDF0', 10);
          for (let i = 1; i < 16; i++) {
            const p = pts[i];
            this.cylR('shiny', p[0], (p[1] + deckY + 1.2) / 2, zz, 0.05, p[1] - deckY - 1.2, '#C9D0D4', 0, 0, 0, 6);
          }
          this.box('shiny', cx, deckY + 0.9, zz, len - 4, 0.6, 0.5, '#E8EDF0');
        }
        // portal braces over the road between the arches
        for (const t of [0.32, 0.5, 0.68]) {
          const x = bx0 + 3 + (len - 6) * t;
          this.box('shiny', x, deckY + 1.2 + 14 * 4 * t * (1 - t) - 0.5, zc, 0.4, 0.4, halfW * 2 + 1.8, '#E8EDF0');
        }
        this._sign('สะพานคาร์บอน', 6, 0.9, '#1F4D36', '#FFFFFF', [bx0 + 3, deckY + 3.4, zc + halfW + 1.45], 0, { both: true, border: '#E9DFB8' });
      }
    };
    bridge(0, 14, 20, 4, true);
    bridge(460, 8, 10, 3, false);
    // long-tail boats cruising between the bridges
    const boatGeo = (hull) => this._bake((A) => {
      this.box(A, 0, 0, 0, 1.5, 0.55, 7.5, hull);
      this.box(A, 0, 0.05, 4.1, 0.9, 0.5, 1.0, hull);
      this.box(A, 0, 0.55, 0, 1.6, 0.08, 7.6, '#E6D7B2');
      this.box(A, 0, 0.55, -1.0, 1.2, 0.35, 3.8, '#6E4B2D');
      for (const sx of [-0.65, 0.65]) for (const sz of [-2.5, 0.5]) this.box(A, sx, 0.6, sz, 0.06, 1.3, 0.06, '#5B4636');
      this.box(A, 0, 1.9, -1.0, 1.7, 0.08, 3.6, '#2F6DB5');
      this.box(A, 0, 0.6, -3.6, 0.5, 0.45, 0.6, '#3B3F42');
      this.cylR(A, 0, 0.55, -5.2, 0.05, 3.2, '#A9AFB3', Math.PI / 2 - 0.12, 0, 0, 6);
    });
    for (const cfg of [{ z0: 40, z1: 430, hull: '#2B6CB0', side: 6 }, { z0: -430, z1: -40, hull: '#B83A2E', side: -6 }]) {
      const m = new T.Mesh(boatGeo(cfg.hull), E.mats.flat);
      m.castShadow = true;
      this._addDyn(m);
      const st = { z: (cfg.z0 + cfg.z1) / 2, dir: 1 };
      this._anim((dt, t) => {
        st.z += st.dir * 3.2 * dt;
        if (st.z > cfg.z1) st.dir = -1;
        if (st.z < cfg.z0) st.dir = 1;
        const x = this._wRX(st.z) + cfg.side;
        const xa = this._wRX(st.z + st.dir * 2) + cfg.side;
        m.position.set(x, 0.1 + Math.sin(t * 2.1) * 0.04, st.z);
        m.rotation.y = Math.atan2(xa - x, st.dir * 2);
        m.rotation.z = Math.sin(t * 1.7) * 0.025;
      });
    }
  },

  // ------------------------------------------------------------- city gate
  _wGate() {
    const E = this._E;
    const X = -660;
    const GOLD = '#D4A64A', WH = '#F3EEE3', RED = '#9E2A22';
    for (const sg of [-1, 1]) {
      const z = sg * 15.8;
      this.box('concrete', X, 0, z, 3.4, 1.0, 3.4, '#B7B1A6');
      this.box('plaster', X, 1.0, z, 2.3, 10.6, 2.3, WH);
      for (const y of [1.0, 4.2, 8.2, 11.2]) this.box('shiny', X, y, z, 2.55, 0.32, 2.55, GOLD);
      this.box('flat', X - 1.17, 2.0, z, 0.06, 5.6, 1.4, RED);
      this.box('flat', X + 1.17, 2.0, z, 0.06, 5.6, 1.4, RED);
      // pillar roofs + finials
      this.box('flat', X, 11.6, z, 2.8, 0.9, 2.8, RED);
      this.hip('tile', X, 12.5, z, 3.8, 3.8, 2.4, '#D9662A', { oh: 0.35 });
      this.cone('shiny', X, 14.6, z, 0.25, 2.4, GOLD, 10);
      this._col(X - 1.7, z - 1.7, X + 1.7, z + 1.7);
      // flower beds
      for (const dx of [-3.2, 3.2]) {
        this.box('concrete', X + dx, 0, z, 2.2, 0.45, 2.6, '#CFC9BE', { top: 'dirt', topCol: '#7A5A3E' });
        for (let k = 0; k < 10; k++) this.box('flat', X + dx - 0.8 + (k % 5) * 0.4, 0.45, z - 0.8 + ((k / 5) | 0) * 1.4, 0.32, 0.3, 0.32, ['#E63B7A', '#F4C430', '#FF7A2E', '#C2185B'][k % 4]);
        this._col(X + dx - 1.1, z - 1.3, X + dx + 1.1, z + 1.3);
      }
    }
    // main beam with gold trim and signs
    this.box('plaster', X, 11.1, 0, 2.0, 3.0, 33.8, WH, { top: 'concrete' });
    for (const y of [11.1, 13.9]) this.box('shiny', X, y, 0, 2.15, 0.22, 33.9, GOLD);
    this._sign('ยินดีต้อนรับสู่ เมืองคาร์บอน\nCARBON CITY', 22, 2.5, '#7E1F1A', '#F8D776', [X - 1.03, 12.5, 0], -Math.PI / 2, { border: '#E3BE5A', sub: 0.6 });
    this._sign('ขอบคุณที่มาเยือน\nเมืองคาร์บอน · ลดคาร์บอน เริ่มที่เรา', 22, 2.5, '#1F4D36', '#F8D776', [X + 1.03, 12.5, 0], Math.PI / 2, { border: '#E3BE5A', sub: 0.58 });
    // central pavilion with tiered roofs + spire
    this.box('flat', X, 14.1, 0, 5.6, 2.2, 5.6, RED);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) this.box('shiny', X + sx * 2.65, 14.1, sz * 2.65, 0.35, 2.2, 0.35, GOLD);
    this.hip('tile', X, 16.3, 0, 8.4, 8.4, 2.3, '#D9662A', { oh: 0.5 });
    this.box('flat', X, 17.6, 0, 3.6, 1.3, 3.6, RED);
    this.hip('tile', X, 18.9, 0, 5.4, 5.4, 1.9, '#2E7D4F', { oh: 0.4 });
    this.box('flat', X, 19.9, 0, 2.0, 1.0, 2.0, RED);
    this.hip('tile', X, 20.9, 0, 3.2, 3.2, 1.6, '#D9662A', { oh: 0.3 });
    this.cone('shiny', X, 22.2, 0, 0.55, 4.6, GOLD, 12);
    this.sph('shiny', X, 22.5, 0, 0.6, 0.6, 0.6, GOLD, 12);
    // flag poles along the approach
    for (let k = 0; k < 6; k++) {
      const x = X + 14 + k * 9;
      for (const sg of [-1, 1]) {
        const z = sg * 13.4;
        this.cyl('shiny', x, 0.15, z, 0.06, 7, '#D9DDE0', 8);
        this.box('flat', x, 5.6, z + sg * 0.05, 0.04, 1.3, 1.9, ['#F2C200', '#1F5FA8', '#2E8B57'][k % 3], { ry: 0 });
      }
    }
    // the lesson spot: outside the gate on the north sidewalk, looking east
    E.gateSpot = { view: [-700, -11.6], look: [-660, 5.5, -2.5], guide: [-696.5, -10.7], district: 'gate' };
  },

  // ------------------------------------------------------------- street furniture
  _wStreet() {
    const E = this._E;
    const T = E.T;
    const G = E.wG;
    const R = this._rng(9090);
    // geometries
    const dLamp = this._wGeo('lampD', (A) => {
      this.cyl(A, 0, 0, 0, 0.13, 9.4, '#8C949A', 7);
      this.cyl(A, 0, 0, 0, 0.22, 1.0, '#8C949A', 7);
      for (const s of [-1, 1]) {
        this.box(A, 0, 9.15, s * 1.3, 0.12, 0.12, 2.6, '#8C949A');
        this.box(A, 0, 9.0, s * 2.55, 0.42, 0.18, 0.95, '#DADCD8');
      }
    }, 'shiny');
    const sLamp = this._wGeo('lampS', (A) => {
      this.cyl(A, 0, 0, 0, 0.11, 8.6, '#8C949A', 7);
      this.box(A, 0, 8.35, 1.0, 0.1, 0.1, 2.0, '#8C949A');
      this.box(A, 0, 8.22, 1.95, 0.38, 0.16, 0.85, '#DADCD8');
    }, 'shiny');
    const pole = this._wGeo('upole', (A) => {
      this.cyl(A, 0, 0, 0, 0.17, 10.2, '#BDB8AE', 6);
      this.box(A, 0, 9.25, 0, 0.12, 0.12, 2.3, '#6B6F70');
      this.box(A, 0, 8.25, 0, 0.12, 0.12, 1.7, '#6B6F70');
      for (const s of [-0.95, 0, 0.95]) this.cyl(A, 0, 9.31, s, 0.05, 0.22, '#E9E9E4', 6);
      this.box(A, 0, 6.2, 0.2, 0.25, 0.35, 0.25, '#5F6668');
      this.box(A, 0, 2.6, 0.18, 0.05, 1.2, 0.05, '#2B2B2B');
    }, 'flat');
    const xfmr = this._wGeo('uxfmr', (A) => {
      this.cyl(A, 0, 7.0, 0.55, 0.42, 1.1, '#7F8C8D', 12);
      this.box(A, 0, 7.3, 0.55, 0.92, 0.5, 0.18, '#6E7A7B');
      for (const s of [-0.2, 0, 0.2]) this.cyl(A, s, 8.1, 0.55, 0.05, 0.3, '#C8C3B8', 6);
    }, 'flat');
    const city = (x, z) => x > -740 && x < 575 && z > -470 && z < 470;
    // --- road A median double lamps (city part)
    for (const m of E.wMedSegs || []) {
      for (let x = Math.ceil(m[0] / 30) * 30; x < m[1] - 2; x += 30) {
        if (x < -736 || x > 570 || x < m[0] + 2) continue;
        this._wStamp('shiny', dLamp, x, 0.22, 0, 0);
        this._lamp(x, 8.85, -2.55, { pool: 8 });
        this._lamp(x, 8.85, 2.55, { pool: 8 });
        if (x + 17 < m[1]) E.treeSpots.push({ x: x + 15, z: 0, s: 0.55 + R() * 0.2, kind: Math.round(x / 30) % 2 === 0 ? 'palm' : 'bush' });
      }
    }
    // --- single lamps + utility poles on the other city roads
    const pts = [];
    for (const r of G.roads) {
      if (r.rural || r.id === 'A') continue;
      const s0 = r.horiz ? Math.min(r.a[0], r.b[0]) : Math.min(r.a[1], r.b[1]);
      const s1 = r.horiz ? Math.max(r.a[0], r.b[0]) : Math.max(r.a[1], r.b[1]);
      const nearNode = (s) => r.nodes.some((n) => Math.abs((r.horiz ? n.x : n.z) - s) < (n.roads.length > 1 ? 16 : 3));
      let side = 1;
      for (let s = s0 + 17; s < s1 - 5; s += 34) {
        if (nearNode(s)) continue;
        side = -side;
        const off = side * (r.w / 2 + 0.45);
        const x = r.horiz ? s : r.a[0] + off, z = r.horiz ? r.a[1] + off : s;
        if (!city(x, z)) continue;
        // lamp arm points over the road: local +z toward the road centre
        const yaw = r.horiz ? (side > 0 ? Math.PI : 0) : (side > 0 ? -Math.PI / 2 : Math.PI / 2);
        this._wStamp('shiny', sLamp, x, 0.15, z, yaw);
        const hp = this._wP(x, z, yaw, 0, 1.95);
        this._lamp(hp[0], 8.0, hp[1], { pool: 7 });
      }
      // utility poles on the +side (south / east) every 32 m
      let k = 0;
      let prev = null;
      for (let s = s0 + 9; s < s1 - 4; s += 32) {
        const off = r.w / 2 + r.side - 0.45;
        const x = r.horiz ? s : r.a[0] + off, z = r.horiz ? r.a[1] + off : s;
        if (!city(x, z) || nearNode(s)) { prev = null; continue; }
        const yaw = r.horiz ? 0 : Math.PI / 2;
        this._wStamp('flat', pole, x, 0.15, z, yaw);
        if (k++ % 5 === 2) this._wStamp('flat', xfmr, x, 0.15, z, yaw);
        const cur = { x: x, z: z, yaw: yaw };
        if (prev) pts.push([prev, cur]);
        prev = cur;
      }
    }
    // road A utility poles on both sides
    for (const sg of [-1, 1]) {
      let prev = null;
      for (let x = -730; x < 568; x += 32) {
        const near = G.byId.A.cross.some((c) => Math.abs(c.n.x - x) < 14) || Math.abs(x + 660) < 6;
        if (near) { prev = null; continue; }
        const z = sg * 13.55;
        this._wStamp('flat', pole, x, 0.15, z, 0);
        const cur = { x: x, z: z, yaw: 0 };
        if (prev) pts.push([prev, cur]);
        prev = cur;
      }
    }
    // wires between poles (sagging bundles) -> collected for one LineSegments
    for (const pr of pts) {
      const a = pr[0], b = pr[1];
      const L = Math.hypot(b.x - a.x, b.z - a.z);
      if (L > 40) continue;
      const lines = [[9.31, -0.95, 0.5], [9.31, 0, 0.45], [9.31, 0.95, 0.5], [8.3, -0.6, 0.7], [8.3, 0.6, 0.75], [7.0, 0.15, 1.1], [6.9, 0.25, 1.25], [6.75, 0.1, 1.4], [6.6, 0.3, 1.6]];
      for (const ln of lines) {
        const pa = this._wP(a.x, a.z, a.yaw, 0, ln[1]), pb = this._wP(b.x, b.z, b.yaw, 0, ln[1]);
        let px = pa[0], py = ln[0] + 0.15, pz = pa[1];
        for (let i = 1; i <= 8; i++) {
          const t = i / 8;
          const nx = pa[0] + (pb[0] - pa[0]) * t, nz = pa[1] + (pb[1] - pa[1]) * t;
          const ny = ln[0] + 0.15 - ln[2] * 4 * t * (1 - t);
          E.wWire.push(px, py, pz, nx, ny, nz);
          px = nx; py = ny; pz = nz;
        }
      }
    }
    // --- traffic lights (A x N2..N5)
    const head = this._wGeo('tlhead', (A) => {
      this.box(A, 0, -0.65, 0, 0.42, 1.3, 0.3, '#1E2224');
      this.box(A, 0, -0.68, -0.18, 0.56, 1.42, 0.05, '#2A2E30');
      for (let i = 0; i < 3; i++) this.box(A, 0, 0.52 - i * 0.4, 0.17, 0.36, 0.06, 0.18, '#1E2224');
    });
    const tlPole = this._wGeo('tlpole', (A) => {
      this.cyl(A, 0, 0, 0, 0.12, 6.6, '#7F878C', 10);
      this.box(A, 0, 6.25, 3.1, 0.12, 0.14, 6.2, '#7F878C');
      this.box(A, 0.25, 2.2, 0, 0.22, 0.22, 0.22, '#E9C44A');
    }, 'shiny');
    const bulbs = [];
    for (const n of G.nodes) {
      if (!n.light) continue;
      const v = n.roads.find((r) => !r.horiz);
      const hw = v.w / 2;
      // [pole x,z, yaw (arm along local +z), head offset along arm, axis, facing yaw]
      const cfg = [
        [n.x - hw - 5.6, -12.6, 0, 6.0, 'h', -Math.PI / 2],
        [n.x + hw + 5.6, 12.6, Math.PI, 6.0, 'h', Math.PI / 2],
        [n.x + hw + 2.6, -16.2, -Math.PI / 2, 5.2, 'v', Math.PI],
        [n.x - hw - 2.6, 16.2, Math.PI / 2, 5.2, 'v', 0]
      ];
      for (const c of cfg) {
        this._wStamp('shiny', tlPole, c[0], 0.15, c[1], c[2]);
        this._col(c[0] - 0.2, c[1] - 0.2, c[0] + 0.2, c[1] + 0.2);
        const hp = this._wP(c[0], c[1], c[2], 0, c[3]);
        this._wStamp('flat', head, hp[0], 6.25, hp[1], c[5]);
        for (let i = 0; i < 3; i++) {
          const bp = this._wP(hp[0], hp[1], c[5], 0, 0.2);
          bulbs.push({ x: bp[0], y: 6.25 + 0.4 - i * 0.4, z: bp[1], node: n, axis: c[4], slot: i });
        }
      }
    }
    const bm = new T.InstancedMesh(new T.SphereGeometry(0.13, 10, 8), new T.MeshBasicMaterial({ toneMapped: false }), bulbs.length);
    const M = new T.Matrix4();
    bulbs.forEach((b, i) => { M.makeTranslation(b.x, b.y, b.z); bm.setMatrixAt(i, M); bm.setColorAt(i, new T.Color(0x222222)); });
    bm.frustumCulled = false;
    this._addDyn(bm);
    E.wTL = { mesh: bm, bulbs: bulbs, cols: { r: this._lcol('#FF3B2F'), y: this._lcol('#FFC21A'), g: this._lcol('#35E06B'), off: this._lcol('#2A2626') } };
    // --- bus shelters
    const shelter = this._wGeo('shelter', (A) => {
      for (const sx of [-1.7, 1.7]) this.box(A, sx, 0, -0.55, 0.1, 2.6, 0.1, '#5B6770');
      this.box(A, 0, 2.6, 0, 3.8, 0.12, 1.6, '#2F6DB5');
      this.box(A, 0, 0.5, -0.62, 3.4, 1.9, 0.05, '#BFD4DE');
      this.box(A, 0, 0.45, -0.3, 3.0, 0.06, 0.45, '#8C949A');
      this.box(A, 1.95, 0, 0.5, 0.08, 2.4, 0.08, '#5B6770');
      this.box(A, 1.95, 2.0, 0.5, 0.06, 0.6, 0.6, '#F2C200');
    });
    for (const s of [[-540, -1], [-250, -1], [40, -1], [-380, 1], [-40, 1], [300, 1]]) {
      const z = s[1] * 12.2;
      const yaw = s[1] < 0 ? 0 : Math.PI;
      // shelter faces the road: local +z toward the carriageway
      this._wStamp('flat', shelter, s[0], 0.15, z, yaw);
      this._col(s[0] - 1.9, z - 0.75, s[0] + 1.9, z + 0.75);
      const fz = Math.cos(yaw);
      E.crowdSpots.push({ x: s[0] - 0.8, z: z - fz * 0.3, yaw: yaw, mode: 'sit', outfit: R() < 0.5 ? 'office' : 'casual' });
      E.crowdSpots.push({ x: s[0] + 1.0, z: z + fz * 1.3, yaw: yaw + Math.PI / 2, mode: 'stand', outfit: R() < 0.5 ? 'student' : 'casual' });
    }
    // --- road name signs
    const nameSign = (txt, x, z, ry) => {
      this.cyl('shiny', x, 0.15, z, 0.06, 3.3, '#8C949A', 8);
      this._sign(txt, 3.2, 0.62, '#1E6B3A', '#FFFFFF', [x, 3.55, z], ry, { both: true, border: '#FFFFFF' });
    };
    nameSign('ถนนคาร์บอนบูเลอวาร์ด', -684, -13.4, -Math.PI / 2);
    nameSign('ถนนตลาดเก่า', -449.5, -16.5, Math.PI / 2);
    nameSign('ถนนวัดกลาง', -160.5, -16.5, Math.PI / 2);
    nameSign('ถนนศาลากลาง', 129.5, 16.5, Math.PI / 2);
    nameSign('ถนนริมน้ำ', 409.5, -16.5, Math.PI / 2);
    nameSign('ถนนอุตสาหกรรม', -430.5, -200.5, 0);
    nameSign('ถนนสุขภาพดี', 130.5, 200.5, 0);
    // overhead direction gantry on A after the gate
    for (const sg of [-1, 1]) this.box('shiny', -600, 0.15, sg * 10.6, 0.35, 7.4, 0.35, '#8C949A');
    this.box('shiny', -600, 7.3, 0, 0.3, 0.3, 21.6, '#8C949A');
    this._sign('ศูนย์ราชการ · โรงพยาบาล · ริมแม่น้ำ  ตรงไป\nย่านตลาด ← ถนนประตูเมือง   นิคมโรงสี · สถานีไฟฟ้า ↑ ถนนตลาดเก่า', 16, 2.6, '#1E6B3A', '#FFFFFF', [-600.2, 6.0, -1.2], -Math.PI / 2, { border: '#FFFFFF', sub: 0.78, size: 0.3 });
    // --- food carts with umbrellas
    const cartGeo = (uc) => this._wGeo('cart' + uc, (A) => {
      this.box(A, 0, 0.35, 0, 1.6, 0.6, 0.85, '#C9CED2');
      this.box(A, 0, 0.95, 0.05, 1.5, 0.45, 0.7, '#E8F0F2');
      for (const sx of [-0.6, 0.6]) this.cylR(A, sx, 0.25, 0.45, 0.24, 0.08, '#2B2B2B', 0, 0, Math.PI / 2, 10);
      this.cyl(A, -0.9, 0, -0.3, 0.035, 2.3, '#9A9EA0', 6);
      this.cone(A, -0.9, 2.05, -0.3, 1.45, 0.55, uc, 12);
      for (const p of [[0.4, -0.9], [-0.4, -1.1], [1.1, -1.0]]) this.cyl(A, p[0], 0, p[1], 0.17, 0.42, R() < 0.5 ? '#D93A3A' : '#2E6DB5', 10);
      this.box(A, 0.2, 1.42, 0.1, 0.7, 0.25, 0.4, ['#F0B23D', '#E3683D', '#7FB24A'][(R() * 3) | 0]);
    });
    const carts = [[-470, -12.1, 0], [-462, -12.1, 0], [-260, 12.1, Math.PI], [215, -12.1, 0], [282, 12.1, Math.PI], [-20, 12.1, Math.PI], [-575, 12.1, Math.PI], [-345, -12.1, 0]];
    carts.forEach((c, i) => {
      const uc = ['#E8483B', '#2E8BC0', '#F2B705', '#3FA34D'][i % 4];
      this._wStamp('flat', cartGeo(uc), c[0], 0.15, c[1], c[2]);
      this._col(c[0] - 0.9, c[1] - 0.6, c[0] + 0.9, c[1] + 0.6);
      E.crowdSpots.push({ x: c[0] + 0.3, z: c[1] + (c[2] === 0 ? -0.95 : 0.95), yaw: c[2], mode: 'work', outfit: 'vendor' });
      if (i % 2 === 0) E.crowdSpots.push({ x: c[0] - 0.5, z: c[1] + (c[2] === 0 ? 1.1 : -1.1), yaw: c[2] + Math.PI, mode: 'chat', outfit: 'casual' });
    });
  },

  // all overhead wires as one LineSegments (called after every builder pushed into E.wWire)
  _wWires() {
    const E = this._E;
    const T = E.T;
    if (!E.wWire.length) return;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(E.wWire, 3));
    g.computeBoundingSphere();
    const ln = new T.LineSegments(g, new T.LineBasicMaterial({ color: this._lcol('#1D1F20'), transparent: true, opacity: 0.85 }));
    this._addDyn(ln);
    // 1-px lines read as heavy black strokes from the air: fade them out with camera height
    this._anim(() => {
      const y = E.cam.position.y;
      ln.visible = y < 150;
      ln.material.opacity = 0.85 * this._cl((150 - y) / 90, 0, 1);
    });
    E.wWire = [];
  }
});
/* GHG Town 3D v0.3 — world part 3: building kit + block fill (market, downtown, temple, plaza, riverside, housing, factories, outskirts) */
Object.assign(GHG3.world, {
  // ------------------------------------------------------------- building kit
  _wBenchGeo() {
    return this._wGeo('bench', (A) => {
      this.box(A, 0, 0.42, 0, 1.8, 0.07, 0.5, '#8A5A3B');
      this.box(A, 0, 0.62, -0.22, 1.8, 0.4, 0.06, '#8A5A3B');
      for (const sx of [-0.75, 0.75]) this.box(A, sx, 0, 0, 0.08, 0.45, 0.45, '#3B3F42');
    });
  },
  _wNorm(face) { return { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[face]; },
  // world point on a row: along-coordinate s, outward offset o (along the facade normal), height y
  _wRowPt(face, line, s, o, y) {
    const n = this._wNorm(face);
    if (face === 'S' || face === 'N') return [s, y, line + n[1] * o];
    return [line + n[0] * o, y, s];
  },
  // a row of shophouses / townhouses along a frontage. o: {face, line, s0, s1, depth, fl:[min,max], R, gaps, kind}
  _wShopRow(o) {
    const R = o.R;
    let s = o.s0;
    const tints = o.kind === 'town' ? ['#F4EBDD', '#E8EEF2', '#F3E2D8', '#EAF0E2', '#F6F0D8'] : ['#F2E6CF', '#E3ECEF', '#F1D8CF', '#E6EFD9', '#F5EEDC', '#EAD9C4', '#DCE3EA', '#F0E3B8'];
    while (s < o.s1 - 3.9) {
      let units = (o.kind === 'town' ? 3 : 2) + ((R() * 4) | 0);
      let w = units * 4;
      if (s + w > o.s1) { units = Math.floor((o.s1 - s) / 4); w = units * 4; }
      if (units < 1) break;
      if (o.gaps && o.gaps.some((g) => s < g[1] && s + w > g[0])) { s += 4; continue; }
      const fl = o.fl[0] + ((R() * (o.fl[1] - o.fl[0] + 1)) | 0);
      this._wShopSeg(o, s, w, fl, this._wPick(R, tints));
      s += w + (R() < 0.12 ? 3 : 0);
    }
  },
  _wShopSeg(o, s, w, fl, tint) {
    const R = o.R;
    const E = this._E;
    const face = o.face, line = o.line, D = o.depth;
    const n = this._wNorm(face);
    const horiz = face === 'S' || face === 'N';
    const c = s + w / 2;
    const H = 4 * fl;
    const town = o.kind === 'town';
    const set = town ? 2.5 : 0;               // townhouses sit behind a small front yard
    const L = line - (horiz ? n[1] : n[0]) * set;
    const skip = { S: 'pz', N: 'nz', E: 'px', W: 'nx' }[face];
    // body (front face omitted: facades drawn as separate faces)
    const bc = L - (horiz ? n[1] : n[0]) * (D / 2 + 0.06);
    if (horiz) this.box('plaster', c, 0, bc, w, H + 0.9, D - 0.12, tint, { top: 'concrete', skip: skip, topCol: '#C9C4BA' });
    else this.box('plaster', bc, 0, c, D - 0.12, H + 0.9, w, tint, { top: 'concrete', skip: skip, topCol: '#C9C4BA' });
    const Rv = [n[1], 0, -n[0]];
    const U = [0, 1, 0];
    const fp = (y) => (horiz ? [c, y, L] : [L, y, c]);
    // ground floor + upper floors + parapet
    const gb = town ? 'shop' : (R() < 0.5 ? 'front' : 'front2');
    this._face(gb, fp(2), Rv, U, w / 2, 2, town ? tint : '#FFFFFF', { u0: ((R() * 4) | 0) / 4, v0: town ? 0.5 : 0 });
    if (H > 4) this._face('shop', fp(4 + (H - 4) / 2), Rv, U, w / 2, (H - 4) / 2, tint, { u0: ((R() * 4) | 0) / 4, v0: R() < 0.5 ? 0 : 0.5 });
    this._face('plaster', fp(H + 0.45), Rv, U, w / 2, 0.45, tint);
    // floor band
    const band = this._wRowPt(face, L, c, 0.12, 3.92);
    if (horiz) this.box('concrete', band[0], band[1], band[2], w, 0.18, 0.3, '#D8D2C6'); else this.box('concrete', band[0], band[1], band[2], 0.3, 0.18, w, '#D8D2C6');
    // awning over the walkway
    if (!town && R() < 0.75) {
      const col = this._wPick(R, ['#2F6DB5', '#3E8E5B', '#E2793A', '#C9483B', '#E9DFC6', '#5C6E7A', '#E0B53A']);
      const a = s + 0.15, b = s + w - 0.15;
      const p = (sv, o2, y) => this._wRowPt(face, L, sv, o2, y);
      const q = horiz ? (n[1] > 0 ? [p(a, 0.05, 3.55), p(b, 0.05, 3.55), p(b, 1.6, 3.15), p(a, 1.6, 3.15)] : [p(b, 0.05, 3.55), p(a, 0.05, 3.55), p(a, 1.6, 3.15), p(b, 1.6, 3.15)])
        : (n[0] > 0 ? [p(b, 0.05, 3.55), p(a, 0.05, 3.55), p(a, 1.6, 3.15), p(b, 1.6, 3.15)] : [p(a, 0.05, 3.55), p(b, 0.05, 3.55), p(b, 1.6, 3.15), p(a, 1.6, 3.15)]);
      this._wQ('flat', q[0], q[1], q[2], q[3], col, true);
    }
    // townhouse front yard: low wall + gate
    if (town) {
      for (let u = 0; u < w / 4; u++) {
        const s0 = s + u * 4;
        const wp = this._wRowPt(face, line, s0 + 1.3, -0.1, 0);
        if (horiz) this.box('plaster', wp[0], 0, wp[2], 2.5, 1.25, 0.16, '#E8E2D6'); else this.box('plaster', wp[0], 0, wp[2], 0.16, 1.25, 2.5, '#E8E2D6');
        const gp = this._wRowPt(face, line, s0 + 3.25, -0.1, 0);
        if (horiz) this.box('flat', gp[0], 0, gp[2], 1.4, 1.5, 0.06, '#3B3F42'); else this.box('flat', gp[0], 0, gp[2], 0.06, 1.5, 1.4, '#3B3F42');
        if (R() < 0.35) E.treeSpots.push({ x: wp[0] - n[0] * 1.2, z: wp[2] - n[1] * 1.2, s: 0.35, kind: 'bush' });
      }
      const yd = this._wRowPt(face, line, c, -set / 2, 0.02);
      if (horiz) this.plane('paving', yd[0], 0.07, yd[2], w, set, '#CFC9BE'); else this.plane('paving', yd[0], 0.07, yd[2], set, w, '#CFC9BE');
    }
    // vertical signboards + AC units
    if (!town && R() < 0.3) {
      const vp = this._wRowPt(face, L, s + 0.6, 0.55, 4.4);
      const col = this._wPick(R, ['#C8102E', '#F2C200', '#1565C0', '#FFFFFF', '#2E7D32']);
      if (horiz) this.box('flat', vp[0], 4.4, vp[2], 0.16, 3.0, 0.95, col); else this.box('flat', vp[0], 4.4, vp[2], 0.95, 3.0, 0.16, col);
    }
    for (let u = 0; u < w / 4; u++) for (let f = 1; f < fl; f++) {
      if (R() > 0.28) continue;
      const ap = this._wRowPt(face, L, s + u * 4 + 1 + R() * 2, 0.2, 4 * f + 0.35);
      if (horiz) this.box('flat', ap[0], ap[1], ap[2], 0.8, 0.55, 0.32, '#E7EAEC'); else this.box('flat', ap[0], ap[1], ap[2], 0.32, 0.55, 0.8, '#E7EAEC');
    }
    // rooftop water tanks / dish
    const rp = this._wRowPt(face, L, c, -D * 0.55, 0);
    if (R() < 0.65) {
      const steel = R() < 0.6;
      this.cyl(steel ? 'shiny' : 'flat', rp[0] + (horiz ? -w * 0.2 : 0), H + 0.9, rp[2] + (horiz ? 0 : -w * 0.2), 0.62, 1.25, steel ? '#C9CDD2' : '#2C5FA8', 12);
      if (w > 10 && R() < 0.5) this.cyl('shiny', rp[0] + (horiz ? w * 0.25 : 0), H + 0.9, rp[2] + (horiz ? 0 : w * 0.25), 0.55, 1.1, '#C9CDD2', 12);
    }
    if (R() < 0.12) this.sph('flat', rp[0], H + 1.6, rp[2], 0.45, 0.45, 0.12, '#E9EAEA', 10);
    // collider
    const ox = horiz ? [s, s + w] : null;
    const back = L - (horiz ? n[1] : n[0]) * D;
    if (horiz) this._col(ox[0], Math.min(L, back), ox[1], Math.max(L, back));
    else this._col(Math.min(L, back), s, Math.max(L, back), s + w);
    if (town) {
      // front wall line blocks too (gates are decorative)
      const a0 = horiz ? Math.min(line, L) : Math.min(line, L), a1 = horiz ? Math.max(line, L) : Math.max(line, L);
      if (horiz) this._col(s, a0, s + w, a1); else this._col(a0, s, a1, s + w);
    }
  },

  // tower: o {x, z, w, d, fl, fac:'office'|'apt', tint, podium, name, nameCol, R}
  _wTower(o) {
    const R = o.R;
    const fh = o.fac === 'office' ? 3.75 : 3.2;
    const pod = o.podium ? 4.5 : 0;
    if (o.podium) {
      this.box('front2', o.x, 0, o.z, o.w + 4, 4.5, o.d + 4, '#FFFFFF', { top: 'concrete', topCol: '#C9C4BA', u0: ((R() * 4) | 0) / 4, th: 4.5 });
      this.box('concrete', o.x, 4.5, o.z, o.w + 4.4, 0.35, o.d + 4.4, '#E2DED6');
    }
    const H = o.fl * fh;
    this.box(o.fac, o.x, pod, o.z, o.w, H, o.d, o.tint || '#FFFFFF', { top: 'concrete', topCol: '#C9C4BA', u0: ((R() * 4) | 0) / 4 });
    // rooftop
    const top = pod + H;
    this.box('plaster', o.x - o.w * 0.15, top, o.z, o.w * 0.35, 3.6, o.d * 0.45, '#DCD8CF', { top: 'concrete' });
    this.cyl('shiny', o.x + o.w * 0.25, top, o.z - o.d * 0.2, 1.2, 2.4, '#BFC5CA', 12);
    if (R() < 0.6) this.cyl('shiny', o.x + o.w * 0.25, top, o.z + o.d * 0.2, 1.0, 2.2, '#BFC5CA', 12);
    if (o.antenna) this.cyl('shiny', o.x - o.w * 0.15, top + 3.6, o.z, 0.12, 9, '#D0D4D7', 8);
    // crown band
    this.box('concrete', o.x, top - 0.6, o.z, o.w + 0.5, 0.6, o.d + 0.5, '#E7E3DB');
    if (o.name) {
      const yawF = o.nameFace || 0;
      const off = (Math.abs(Math.sin(yawF)) > 0.5 ? o.w : o.d) / 2 + 0.35;
      const p = this._wP(o.x, o.z, yawF, 0, off);
      const fw = Math.abs(Math.sin(yawF)) > 0.5 ? o.d : o.w;
      this._sign(o.name, Math.min(16, fw * 0.85), 2.2, o.nameBg || '#16325C', o.nameCol || '#FFFFFF', [p[0], top - 2.2, p[1]], yawF, { border: o.nameBorder });
    }
    const ex = o.podium ? 2.2 : 0.1;
    this._col(o.x - o.w / 2 - ex, o.z - o.d / 2 - ex, o.x + o.w / 2 + ex, o.z + o.d / 2 + ex);
    return top;
  },

  // detached Thai house: o {x, z, yaw (front = local +z), w, d, st, wall, roof, R, plotW, plotD, stilts}
  _wHouse(o) {
    const E = this._E;
    const R = o.R;
    const F = { x: o.x, z: o.z, yaw: o.yaw };
    const w = o.w, d = o.d;
    const base = o.stilts ? 2.4 : 0.45;
    const h = 3.0 * o.st;
    if (o.stilts) {
      for (const lx of [-w / 2 + 0.3, 0, w / 2 - 0.3]) for (const lz of [-d / 2 + 0.3, d / 2 - 0.3]) this._wLB('wood', F, lx, 0, lz, 0.28, base, 0.28, '#8A6644');
      this._wLB('wood', F, 0, base - 0.25, 0, w + 0.4, 0.25, d + 0.4, '#9C7650');
      this._wLB('wood', F, 0, base, 0, w, h, d, o.wall, { top: false });
      const rp = this._wP(o.x, o.z, o.yaw, 0, 0);
      this.gable('tile', rp[0], base + h, rp[1], w + 0.2, d, d * 0.62, o.roof, { ry: o.yaw, oh: 0.8, wall: 'wood', wallCol: '#9C7650' });
      // stair
      this._wLB('wood', F, w / 2 - 0.8, 0, d / 2 + 1.2, 1.0, base * 0.55, 2.2, '#8A6644');
    } else {
      this._wLB('concrete', F, 0, 0, 0, w + 0.8, base, d + 0.8, '#C9C2B4', { topCol: '#BDB5A6' });
      this._wLB('plaster', F, 0, base, 0, w, h, d, o.wall, { top: false });
      const rp = this._wP(o.x, o.z, o.yaw, 0, 0);
      if (w >= d) this.hip('tile', rp[0], base + h, rp[1], w, d, Math.min(w, d) * 0.3, o.roof, { ry: o.yaw, oh: 0.7 });
      else this.hip('tile', rp[0], base + h, rp[1], d, w, Math.min(w, d) * 0.3, o.roof, { ry: o.yaw + Math.PI / 2, oh: 0.7 });
    }
    // windows + door (front), side windows
    const glass = '#4E6878', frame = o.stilts ? '#6E4B2D' : '#F2F0EA';
    for (let s = 0; s < o.st; s++) {
      const y = base + 0.9 + s * 3.0;
      for (const lx of [-w * 0.3, w * 0.3]) {
        if (s === 0 && lx > 0 && !o.stilts) continue;
        this._wLB('flat', F, lx, y, d / 2 + 0.03, 1.4, 1.25, 0.08, frame, { skip: 'nz ny' });
        this._wLB('glass', F, lx, y + 0.08, d / 2 + 0.07, 1.22, 1.08, 0.02, glass, { skip: 'nz ny px nx py' });
      }
      for (const sx of [-1, 1]) {
        this._wLB('glass', F, sx * (w / 2 + 0.04), y + 0.07, 0, 0.06, 1.05, 1.12, glass, { skip: sx > 0 ? 'nx ny pz nz' : 'px ny pz nz' });
      }
    }
    if (!o.stilts) {
      this._wLB('wood', F, w * 0.28, base, d / 2 + 0.04, 1.0, 2.15, 0.08, '#7A5233');
      // porch roof on two posts
      for (const lx of [w * 0.28 - 1.1, w * 0.28 + 1.1]) this._wLB('flat', F, lx, base, d / 2 + 1.7, 0.14, 2.5, 0.14, '#EDEBE6');
      this._wLB('flat', F, w * 0.28, base + 2.5, d / 2 + 0.9, 2.8, 0.14, 1.9, '#D1CCC2');
    }
    // body collider
    const hw = (Math.abs(Math.sin(o.yaw)) > 0.5 ? d : w) / 2 + 0.4, hd = (Math.abs(Math.sin(o.yaw)) > 0.5 ? w : d) / 2 + 0.4;
    this._col(o.x - hw, o.z - hd, o.x + hw, o.z + hd);
    // plot fence with a front gate gap
    if (o.plotW) {
      const pw = o.plotW, pd = o.plotD;
      const cz = (pd - d) / 2 - 1.0;    // house sits toward the back of the plot
      const PF = { x: o.x, z: o.z, yaw: o.yaw };
      const wall = (lx, lz, lw, ld) => {
        this._wLB('plaster', PF, lx, 0, lz, lw, 1.3, ld, '#E3DDD0', { topCol: '#C9C2B4' });
        const p = this._wP(o.x, o.z, o.yaw, lx, lz);
        const sw = Math.abs(Math.sin(o.yaw)) > 0.5;
        const ww = (sw ? ld : lw) / 2 + 0.05, dd = (sw ? lw : ld) / 2 + 0.05;
        this._col(p[0] - ww, p[1] - dd, p[0] + ww, p[1] + dd);
      };
      const fz = d / 2 + cz + 0.0;
      wall(-pw / 2, fz - pd / 2, 0.16, pd);
      wall(pw / 2, fz - pd / 2, 0.16, pd);
      wall(0, fz - pd, pw, 0.16);
      wall(-pw / 2 + (pw / 2 - 2.2) / 2, fz, pw / 2 - 2.2, 0.16);
      wall(pw / 2 - (pw / 2 - 2.2) / 2, fz, pw / 2 - 2.2, 0.16);
      this._wLB('flat', PF, 0, 0, fz, 4.2, 1.6, 0.06, '#33383B');
      // yard
      const yp = this._wP(o.x, o.z, o.yaw, 0, fz - pd / 2);
      const sw = Math.abs(Math.sin(o.yaw)) > 0.5;
      this.plane('grass', yp[0], 0.025, yp[1], sw ? pd : pw, sw ? pw : pd, '#FFFFFF');
      const tp = this._wP(o.x, o.z, o.yaw, (R() < 0.5 ? -1 : 1) * (pw / 2 - 1.8), fz - 1.8);
      E.treeSpots.push({ x: tp[0], z: tp[1], s: 0.55 + R() * 0.35, kind: this._wPick(R, ['mango', 'banana', 'palm', 'bush', 'mango']) });
      if (R() < 0.55) {
        const cp = this._wP(o.x, o.z, o.yaw, -w * 0.25, d / 2 + 2.6);
        E.parkSpots.push({ x: cp[0], z: cp[1], yaw: o.yaw + Math.PI, kind: R() < 0.45 ? 'moto' : (R() < 0.5 ? 'pickup' : 'car'), color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33', '#8E1F1F', '#1F3F7A']) });
      }
    }
  },

  // factory / warehouse: o {x0,z0,x1,z1,h,wall,roof,name,front:'S'|'N'|'E'|'W', solar, R}
  _wFactory(o) {
    const E = this._E;
    const R = o.R;
    const w = o.x1 - o.x0, d = o.z1 - o.z0, cx = (o.x0 + o.x1) / 2, cz = (o.z0 + o.z1) / 2;
    const alongX = w >= d;
    this.box('metal', cx, 0, cz, w, o.h, d, o.wall, { top: false });
    this.box('concrete', cx, 0, cz, w + 0.3, 0.9, d + 0.3, '#C3BEB4', { top: false });
    const rise = Math.min(w, d) * 0.12;
    this.gable('metal', cx, o.h, cz, alongX ? w : d, alongX ? d : w, rise, o.roof, { ry: alongX ? 0 : Math.PI / 2, oh: 0.6, wall: 'metal', wallCol: o.wall, both: true });
    // roller doors on the front
    const n = this._wNorm(o.front);
    const horizF = o.front === 'S' || o.front === 'N';
    const len = horizF ? w : d;
    const doors = Math.max(1, Math.floor(len / 14));
    for (let i = 0; i < doors; i++) {
      const s = (horizF ? o.x0 : o.z0) + (i + 0.5) * len / doors;
      const line = horizF ? (n[1] > 0 ? o.z1 : o.z0) : (n[0] > 0 ? o.x1 : o.x0);
      const p = this._wRowPt(o.front, line, s, 0.06, 0);
      if (horizF) this.box('metal', p[0], 0, p[2], 5, 5, 0.12, '#8D959B'); else this.box('metal', p[0], 0, p[2], 0.12, 5, 5, '#8D959B');
      const cp = this._wRowPt(o.front, line, s, 1.4, 5.3);
      if (horizF) this.box('flat', cp[0], 5.3, cp[2], 6, 0.12, 2.6, '#5E666B'); else this.box('flat', cp[0], 5.3, cp[2], 2.6, 0.12, 6, '#5E666B');
      if (R() < 0.6) {
        const tp = this._wRowPt(o.front, line, s, 9, 0);
        E.parkSpots.push({ x: tp[0], z: tp[2], yaw: Math.atan2(-n[0], -n[1]), kind: R() < 0.6 ? 'truck' : 'pickup', color: this._wPick(R, ['#F2F2F2', '#2E6DB5', '#D9D9D9', '#C0392B']) });
      }
    }
    // office annex on the front corner
    const ap = this._wRowPt(o.front, horizF ? (n[1] > 0 ? o.z1 : o.z0) : (n[0] > 0 ? o.x1 : o.x0), (horizF ? o.x0 : o.z0) + 9, 4.5, 0);
    if (horizF) this.box('shop', ap[0], 0, ap[2], 16, 8, 9, '#EDE9E0', { top: 'concrete' }); else this.box('shop', ap[0], 0, ap[2], 9, 8, 16, '#EDE9E0', { top: 'concrete' });
    if (horizF) this._col(ap[0] - 8, ap[2] - 4.5, ap[0] + 8, ap[2] + 4.5); else this._col(ap[0] - 4.5, ap[2] - 8, ap[0] + 4.5, ap[2] + 8);
    if (o.name) {
      const sp = this._wRowPt(o.front, horizF ? (n[1] > 0 ? o.z1 : o.z0) : (n[0] > 0 ? o.x1 : o.x0), (horizF ? o.x0 + w : o.z0 + d) - len * 0.35, 0.08, 0);
      const ry = Math.atan2(n[0], n[1]);
      this._sign(o.name, Math.min(22, len * 0.4), 2.0, '#FFFFFF', '#1F3A5F', [sp[0], o.h - 1.6, sp[2]], ry, { border: '#1F3A5F' });
    }
    if (o.solar && alongX) {
      // panels on the south-facing slope (ridge along x)
      const half = (alongX ? d : w) / 2;
      const ang = Math.atan2(rise, half);
      for (let rx = -w / 2 + 2; rx < w / 2 - 2; rx += 2.2) for (let k = 0; k < Math.floor(half / 2.3) - 1; k++) {
        const t = (k + 0.7) * 2.3;
        const y = o.h + rise - t * Math.tan(ang) + 0.18;
        this.boxR('flat', cx + rx + 1.0, y, cz + t, 2.0, 0.06, 2.1, '#1C2E4A', ang, 0, 0);
      }
    }
    this._col(o.x0, o.z0, o.x1, o.z1);
  },

  // chain-link fence (one shared alpha-tested material)
  _wFenceMat() {
    const E = this._E;
    const T = E.T;
    if (E.wFenceMat) return E.wFenceMat;
    const tex = this._canvasTex(128, 128, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      g.strokeStyle = '#8F979C'; g.lineWidth = 3;
      for (let i = -W; i < W * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke(); g.beginPath(); g.moveTo(i, H); g.lineTo(i + H, 0); g.stroke(); }
    }, { repeat: true });
    E.wFenceMat = new T.MeshStandardMaterial({ map: tex, alphaTest: 0.45, transparent: false, side: T.DoubleSide, roughness: 0.6, metalness: 0.4 });
    E.wFenceAcc = this._newAcc('flat');
    return E.wFenceMat;
  },
  // fence along a polyline of [x,z] points (h = height); posts into static buckets, mesh panels into the fence acc
  _wFence(pts, h, closed, gaps) {
    const E = this._E;
    this._wFenceMat();
    const A = E.wFenceAcc;
    const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L;
      for (let s = 0; s < L - 0.01; s += 3) {
        const s1 = Math.min(L, s + 3);
        const x0 = a[0] + dx * s, z0 = a[1] + dz * s, x1 = a[0] + dx * s1, z1 = a[1] + dz * s1;
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        if (gaps && gaps.some((g) => Math.hypot(mx - g[0], mz - g[1]) < g[2])) continue;
        this._quad(A, [x0, 0.05, z0], [x1, 0.05, z1], [x1, h, z1], [x0, h, z0], [dz, 0, -dx], [0, 0, (s1 - s) / 1.0, h / 1.0], '#FFFFFF', false);
        this.cyl('shiny', x0, 0, z0, 0.045, h + 0.1, '#8F979C', 6);
        this.box('shiny', mx, h - 0.02, mz, 0.05, 0.05, s1 - s, '#8F979C', { ry: Math.atan2(dx, dz) });
        this._colBox(mx, mz, Math.abs(x1 - x0) + 0.1, Math.abs(z1 - z0) + 0.1, 0, 0.05);
      }
    }
  },
  _wFenceFlush() {
    const E = this._E;
    if (!E.wFenceAcc || !E.wFenceAcc.vc) return;
    const m = new E.T.Mesh(this._accGeo(E.wFenceAcc), E.wFenceMat);
    m.castShadow = true;
    m.receiveShadow = true;
    this._addDyn(m);
    E.wFenceAcc = this._newAcc('flat');
  },

  // ------------------------------------------------------------- block fill
  _wBlocks() {
    const E = this._E;
    const B = E.wBlocksDef || this._wGrid();
    const get = (i, j) => B.find((b) => b.i === i && b.j === j);
    const R = this._rng(31337);
    // base ground per block (skip lots owned by other modules)
    const ground = (b, bk, col) => this.plane(bk, (b.x0 + b.x1) / 2, 0.02, (b.z0 + b.z1) / 2, b.x1 - b.x0, b.z1 - b.z0, col);
    // market block (r1 c0) — leave the minimart lot to complexes.js
    const mk = get(0, 1);
    this.plane('concrete', (mk.x0 + mk.x1) / 2, 0.02, (mk.z0 - 51) / 2, mk.x1 - mk.x0, -51 - mk.z0, '#C9C4BA');
    this.plane('concrete', (-577 + mk.x1) / 2, 0.02, (-51 + mk.z1) / 2, mk.x1 + 577, mk.z1 + 51, '#C9C4BA');
    this._wMarket(mk, R);
    this._wDowntown(get(1, 1), R, 'N');
    this._wDowntown(get(0, 2), R, 'SW');
    this._wDowntown(get(1, 2), R, 'SE');
    ground(get(2, 1), 'paving', '#D8CFBD');
    this._wTemple(get(2, 1), R);
    this._wPlaza(R);
    this._wRiversideBlocks(get(4, 1), get(4, 2), get(4, 0), R);
    for (let i = 0; i < 5; i++) this._wHousing(get(i, 3), R);
    ground(get(0, 0), 'concrete', '#BEB9AE');
    this._wFactoryW(get(0, 0), R);
    ground(get(2, 0), 'concrete', '#BEB9AE');
    this._wFactoryC(get(2, 0), R);
    // interior fillers (dense back buildings)
    this._wFill(get(0, 1), 14, [[-611, -55, -575, -14], [-580, -158, -483, -68], [-544, -82, -516, -14]], R, { fl: [2, 4] });
    this._wFill(get(1, 1), 15, [[-380, -128, -340, -96], [-285, -138, -239, -98], [-324, -72, -276, -44], [-322, -64, -302, -30]], R, { fl: [2, 5] });
    this._wFill(get(0, 2), 15, [[-578, 53, -478, 124], [-568, 146, -488, 174]], R, { fl: [2, 4] });
    this._wFill(get(1, 2), 15, [[-401, 82, -363, 110], [-267, 49, -237, 75], [-254, 126, -218, 158], [-336, 140, -308, 164], [-424, 34, -266, 46]], R, { fl: [2, 5] });
    this._wOutskirts(R);
    this._wFenceFlush();
  },

  // ---------- market block
  _wMarket(b, R) {
    const E = this._E;
    const D = 14;
    this._wShopRow({ face: 'S', line: b.z1, s0: -576, s1: b.x1, depth: D, fl: [2, 4], R: R, gaps: [[-541, -519]] });
    this._wShopRow({ face: 'W', line: b.x0, s0: b.z0, s1: -52, depth: D, fl: [2, 3], R: R, gaps: [[-130, -116]] });
    this._wShopRow({ face: 'N', line: b.z0, s0: b.x0, s1: b.x1, depth: D, fl: [2, 3], R: R, gaps: [[-532, -516]] });
    this._wShopRow({ face: 'E', line: b.x1, s0: b.z0 + D, s1: b.z1 - D, depth: D, fl: [2, 4], R: R, gaps: [[-110, -96]] });
    // fresh market hall
    const x0 = -575, x1 = -488, z0 = -152, z1 = -78;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let x = x0; x <= x1 + 0.1; x += 8.7) for (let z = z0; z <= z1 + 0.1; z += 9.25) {
      this.cyl('shiny', x, 0, z, 0.2, 7.2, '#6F7C85', 8);
      this._col(x - 0.25, z - 0.25, x + 0.25, z + 0.25);
    }
    this.box('flat', cx, 7.0, cz, x1 - x0 + 1, 0.3, z1 - z0 + 1, '#5F6B73', { top: false });
    this.gable('metal', cx, 7.3, cz, x1 - x0 + 2, z1 - z0 + 2, 4.2, '#B5502E', { oh: 1.2, wall: 'metal', wallCol: '#D6D9DC', both: true });
    this.plane('concrete', cx, 0.07, cz, x1 - x0 + 4, z1 - z0 + 4, '#AFA99E');
    this._sign('ตลาดสดเทศบาล', 10, 1.6, '#B5502E', '#FFFFFF', [cx, 6.2, z1 + 1.6], 0, { both: true, border: '#FFE7B0' });
    // stall rows with produce
    const goods = ['#E53935', '#FDD835', '#43A047', '#FB8C00', '#8E24AA', '#6D4C41', '#F06292', '#7CB342', '#FFFFFF'];
    for (let row = 0; row < 5; row++) {
      const z = z0 + 8 + row * 14;
      for (let x = x0 + 4; x < x1 - 4; x += 3.4) {
        if (Math.abs(x - cx) < 3) continue;
        this.box('flat', x, 0, z, 3.0, 0.85, 1.8, '#B9B4AA');
        this.box('wood', x, 0.85, z, 3.1, 0.06, 1.9, '#A5865E');
        for (let k = 0; k < 6; k++) {
          const gx = x - 1.2 + (k % 3) * 1.2, gz = z - 0.45 + ((k / 3) | 0) * 0.9;
          this.box('flat', gx, 0.91, gz, 0.9, 0.12 + R() * 0.18, 0.7, this._wPick(R, goods));
        }
        if (R() < 0.35) E.crowdSpots.push({ x: x + 0.5, z: z - 1.6, yaw: 0, mode: 'work', outfit: 'vendor' });
        if (R() < 0.25) E.crowdSpots.push({ x: x - 0.4, z: z + 1.7, yaw: Math.PI, mode: 'stand', outfit: 'casual' });
      }
      this._col(x0 + 2.5, z - 1.0, cx - 2.6, z + 1.0);
      this._col(cx + 2.6, z - 1.0, x1 - 2.5, z + 1.0);
      for (let x = x0 + 6; x < x1 - 4; x += 10) this._lamp(x, 6.4, z, { pool: 0, indoor: true });
    }
    // outdoor umbrella stalls along the entrance lane from road A
    this.plane('concrete', -530, 0.07, -46, 22, 64, '#B7B1A6');
    for (let z = -70; z < -20; z += 5.5) for (const sx of [-1, 1]) {
      const x = -530 + sx * 7.5;
      this.box('flat', x, 0, z, 2.0, 0.8, 1.4, '#C9CED2');
      this.cyl('flat', x, 0, z, 0.04, 2.4, '#9A9EA0', 6);
      this.cone('flat', x, 2.15, z, 1.6, 0.6, this._wPick(R, ['#E8483B', '#2E8BC0', '#F2B705', '#3FA34D', '#F4F4F4']), 12);
      for (let k = 0; k < 3; k++) this.box('flat', x - 0.6 + k * 0.6, 0.8, z, 0.5, 0.15, 0.9, this._wPick(R, goods));
      this._col(x - 1.0, z - 0.7, x + 1.0, z + 0.7);
      if (R() < 0.6) E.crowdSpots.push({ x: x - sx * 1.6, z: z, yaw: sx > 0 ? Math.PI / 2 : -Math.PI / 2, mode: R() < 0.5 ? 'stand' : 'chat', outfit: 'casual' });
    }
    // motorbike parking along the hall
    for (let x = x0 + 2; x < x1 - 2; x += 1.1) if (R() < 0.8) E.parkSpots.push({ x: x, z: z1 + 6, yaw: 0, kind: 'moto', color: this._wPick(R, ['#C62828', '#1565C0', '#212121', '#ECEFF1', '#2E7D32']) });
    for (let k = 0; k < 6; k++) E.animalSpots.dogs.push({ x: x0 + R() * (x1 - x0), z: z0 - 4 - R() * 6 });
  },

  // ---------- downtown blocks
  _wDowntown(b, R, kind) {
    const D = 15;
    this.plane('concrete', (b.x0 + b.x1) / 2, 0.02, (b.z0 + b.z1) / 2, b.x1 - b.x0, b.z1 - b.z0, '#C2BDB2');
    const gapsS = kind === 'N' ? [[-320, -304]] : [];
    this._wShopRow({ face: 'S', line: b.z1, s0: b.x0, s1: b.x1, depth: D, fl: [2, 4], R: R, gaps: gapsS });
    this._wShopRow({ face: 'N', line: b.z0, s0: b.x0, s1: b.x1, depth: D, fl: [2, 4], R: R, gaps: kind === 'N' ? [] : [[(b.x0 + b.x1) / 2 - 8, (b.x0 + b.x1) / 2 + 8]] });
    this._wShopRow({ face: 'W', line: b.x0, s0: b.z0 + D, s1: b.z1 - D, depth: D, fl: [2, 3], R: R });
    this._wShopRow({ face: 'E', line: b.x1, s0: b.z0 + D, s1: b.z1 - D, depth: D, fl: [2, 3], R: R });
    const E = this._E;
    if (kind === 'N') {
      this._wTower({ x: -360, z: -112, w: 26, d: 20, fl: 22, fac: 'apt', tint: '#F1E9DA', podium: true, R: R, antenna: true });
      this._wTower({ x: -262, z: -118, w: 30, d: 24, fl: 17, fac: 'office', tint: '#E9F1F4', podium: true, R: R, name: 'CARBON TOWER', nameFace: 0, nameBg: '#0F2A44' });
      // multi-storey car park
      const cx = -300, cz = -58;
      for (let l = 0; l < 4; l++) {
        this.box('concrete', cx, l * 3.0, cz, 44, 0.45, 24, '#CFCAC0');
        this.box('concrete', cx, l * 3.0 + 0.45, cz + 12, 44, 0.9, 0.25, '#DAD5CC');
        this.box('concrete', cx, l * 3.0 + 0.45, cz - 12, 44, 0.9, 0.25, '#DAD5CC');
        for (let k = 0; k < 7; k++) if (l > 0 && R() < 0.7) E.parkSpots.push({ x: cx - 18 + k * 6, z: cz - 6 + (k % 2) * 12, yaw: 0, kind: R() < 0.6 ? 'car' : 'pickup', color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33', '#8E1F1F', '#1F3F7A']), y: l * 3.0 + 0.45 });
      }
      for (const px of [-21, -7, 7, 21]) for (const pz of [-11, 11]) this.box('concrete', cx + px, 0, cz + pz, 0.6, 12, 0.6, '#D2CDC3');
      this.box('concrete', cx, 12, cz, 44, 0.45, 24, '#CFCAC0');
      this._col(cx - 22, cz - 12, cx + 22, cz + 12);
      this._sign('ที่จอดรถ P', 5, 1.2, '#1565C0', '#FFFFFF', [cx, 10, cz + 12.2], 0, {});
    } else if (kind === 'SW') {
      // small mall + bus terminal
      const mx = -528, mz = 78;
      this.box('front2', mx, 0, mz, 96, 4.5, 46, '#FFFFFF', { top: 'concrete', th: 4.5 });
      this.box('office', mx, 4.5, mz, 96, 11.25, 46, '#F2F4F5', { top: 'concrete', topCol: '#BDB8AE' });
      this.box('concrete', mx, 15.75, mz, 97, 0.8, 47, '#E8E4DC');
      this._sign('คาร์บอนพลาซ่า · CARBON PLAZA', 34, 3.2, '#E2533A', '#FFFFFF', [mx, 13.2, mz + 23.3], 0, { border: '#FFFFFF' });
      this._col(mx - 48, mz - 23, mx + 48, mz + 23);
      for (let x = mx - 40; x <= mx + 40; x += 6) for (const zz of [mz + 32, mz + 40]) if (R() < 0.7) E.parkSpots.push({ x: x, z: zz, yaw: zz < mz + 36 ? Math.PI : 0, kind: R() < 0.7 ? 'car' : 'pickup', color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33', '#8E1F1F', '#1F3F7A', '#D9D9D9']) });
      for (let x = mx - 42; x <= mx + 42; x += 6) this.plane('paint', x, 0.09, mz + 36, 0.12, 14, '#F2F2EE');
      // bus terminal canopy
      const bx = -528, bz = 158;
      for (let x = bx - 36; x <= bx + 36; x += 9) for (const zz of [bz - 6, bz + 6]) { this.cyl('shiny', x, 0, zz, 0.18, 5.2, '#7F878C', 8); this._col(x - 0.2, zz - 0.2, x + 0.2, zz + 0.2); }
      this.box('metal', bx, 5.2, bz, 78, 0.3, 16, '#2F6DB5', { bot: 'flat' });
      this.box('concrete', bx, 0, bz, 76, 0.25, 4, '#BDB8AE');
      this._sign('สถานีขนส่งผู้โดยสารเมืองคาร์บอน', 22, 1.6, '#FFFFFF', '#1B3F73', [bx, 6.3, bz + 8.1], 0, { border: '#1B3F73' });
      for (let k = 0; k < 4; k++) E.parkSpots.push({ x: bx - 30 + k * 20, z: bz + 12, yaw: Math.PI / 2, kind: 'bus', color: k % 2 ? '#E8743B' : '#2F6DB5' });
      for (let k = 0; k < 8; k++) E.crowdSpots.push({ x: bx - 30 + k * 8, z: bz + 1.2, yaw: 0, mode: k % 3 === 0 ? 'sit' : 'stand', outfit: this._wPick(R, ['casual', 'student', 'office']) });
    } else {
      this._wTower({ x: -382, z: 96, w: 30, d: 20, fl: 18, fac: 'apt', tint: '#F4EEDF', podium: true, R: R, name: 'โรงแรมคาร์บอนแกรนด์', nameFace: Math.PI, nameBg: '#5B1F1F', nameCol: '#F3D27A' });
      this._wTower({ x: -252, z: 62, w: 26, d: 22, fl: 7, fac: 'office', tint: '#E4ECF1', podium: false, R: R, name: 'ธนาคารเมืองคาร์บอน', nameFace: Math.PI, nameBg: '#0E5A3A' });
      this._wTower({ x: -236, z: 142, w: 28, d: 24, fl: 24, fac: 'office', tint: '#DDE9EE', podium: true, R: R, antenna: true });
      this._wTower({ x: -322, z: 152, w: 24, d: 20, fl: 26, fac: 'apt', tint: '#ECE3D3', podium: false, R: R });
      for (let x = -420; x < -270; x += 6) if (R() < 0.6) E.parkSpots.push({ x: x, z: 40, yaw: Math.PI, kind: 'car', color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33', '#8E1F1F']) });
    }
    // trees inside the block
    for (let k = 0; k < 10; k++) E.treeSpots.push({ x: b.x0 + D + 4 + R() * (b.x1 - b.x0 - 2 * D - 8), z: b.z0 + D + 4 + R() * (b.z1 - b.z0 - 2 * D - 8), s: 0.6 + R() * 0.4, kind: this._wPick(R, ['rain', 'mango', 'bush']) });
  },

  // ---------- temple (วัด)
  _wTemple(b, R) {
    const E = this._E;
    const WH = '#F2EDE3', GOLD = '#D4A64A', OR = '#D9662A', GR = '#2E7D4F', RED = '#9E2A22';
    const x0 = b.x0 + 4, x1 = b.x1 - 4, z0 = b.z0 + 4, z1 = b.z1 - 4;
    // compound wall with a gate facing road A
    const gateX = -25;
    const wall = (ax, az, bx, bz) => {
      const L = Math.hypot(bx - ax, bz - az);
      this.box('plaster', (ax + bx) / 2, 0, (az + bz) / 2, Math.abs(bx - ax) + 0.4, 2.2, Math.abs(bz - az) + 0.4, WH, { topCol: '#D9662A' });
      this._col(Math.min(ax, bx) - 0.2, Math.min(az, bz) - 0.2, Math.max(ax, bx) + 0.2, Math.max(az, bz) + 0.2);
      void L;
    };
    wall(x0, z0, x1, z0);
    wall(x0, z0, x0, z1);
    wall(x1, z0, x1, z1);
    wall(x0, z1, gateX - 5, z1);
    wall(gateX + 5, z1, x1, z1);
    // gate arch
    for (const sx of [-1, 1]) { this.box('plaster', gateX + sx * 4.4, 0, z1, 1.4, 6, 1.4, WH); this._col(gateX + sx * 4.4 - 0.8, z1 - 0.8, gateX + sx * 4.4 + 0.8, z1 + 0.8); }
    this.box('plaster', gateX, 6, z1, 10.2, 1.4, 1.6, WH);
    this.gable('tile', gateX, 7.4, z1, 4, 10.8, 3.2, OR, { ry: Math.PI / 2, oh: 0.5, wall: 'shiny', wallCol: GOLD });
    this._wGableTrim(gateX, 7.4, z1, 4, 10.8, 3.2, Math.PI / 2, GOLD, 0.5);
    this.cone('shiny', gateX, 10.4, z1, 0.25, 1.6, GOLD, 8);
    this._sign('วัดกลางเมืองคาร์บอน', 6.5, 0.9, RED, '#F8D776', [gateX, 6.7, z1 + 0.83], 0, { border: GOLD });
    // ubosot (ordination hall), long axis E-W, entrance east
    const ux = -30, uz = -110, L = 34, W = 15;
    this.box('concrete', ux, 0, uz, L + 8, 1.4, W + 8, '#E9E3D7', { topCol: '#D8D0C0' });
    this._col(ux - L / 2 - 4, uz - W / 2 - 4, ux + L / 2 + 4, uz + W / 2 + 4);
    this.box('plaster', ux, 1.4, uz, L, 7.0, W, WH, { top: false });
    for (let x = ux - L / 2; x <= ux + L / 2 + 0.1; x += 3.4) for (const sz of [-1, 1]) {
      this.box('plaster', x, 1.4, uz + sz * (W / 2 + 1.6), 0.7, 6.0, 0.7, WH);
      this.box('shiny', x, 7.1, uz + sz * (W / 2 + 1.6), 0.95, 0.35, 0.95, GOLD);
    }
    for (let x = ux - L / 2 + 3; x < ux + L / 2 - 2; x += 4.2) for (const sz of [-1, 1]) {
      this.box('flat', x, 3.2, uz + sz * (W / 2 + 0.04), 1.3, 2.6, 0.08, RED);
      this.box('shiny', x, 5.85, uz + sz * (W / 2 + 0.05), 1.5, 0.35, 0.09, GOLD);
    }
    this.box('flat', ux + L / 2 + 0.04, 1.4, uz, 0.08, 4.2, 3.2, RED);
    this.box('shiny', ux + L / 2 + 0.06, 5.6, uz, 0.09, 0.4, 3.6, GOLD);
    // tiered Thai roof: green side skirts, steep orange main roof, lower stepped end tiers, gold gables + chofa
    this.gable('tile', ux, 7.0, uz, L + 2, W + 6, 2.0, GR, { oh: 0.8, wall: false });
    this.box('plaster', ux, 7.6, uz, L - 3, 1.2, W - 0.4, WH, { top: false });
    this.gable('tile', ux, 8.6, uz, L - 4, W + 1.2, 7.6, OR, { oh: 0.5, wall: 'shiny', wallCol: GOLD });
    this._wGableTrim(ux, 8.6, uz, L - 4, W + 1.2, 7.6, 0, GOLD, 0.5);
    for (const sx of [-1, 1]) {
      this.gable('tile', ux + sx * ((L - 4) / 2 + 2.0), 7.9, uz, 4.0, W + 1.2, 6.2, OR, { oh: 0.4, wall: 'shiny', wallCol: GOLD });
      this._wGableTrim(ux + sx * ((L - 4) / 2 + 2.0), 7.9, uz, 4.0, W + 1.2, 6.2, 0, GOLD, 0.4);
      this.gable('tile', ux + sx * ((L - 4) / 2 + 2.0), 7.6, uz, 4.2, W + 2.6, 1.0, GR, { oh: 0.3, wall: false });
      // chofa finials at the ridge ends
      this.boxR('shiny', ux + sx * ((L - 4) / 2 + 0.5), 16.9, uz, 0.26, 2.0, 0.26, GOLD, 0, 0, -sx * 0.55);
      this.boxR('shiny', ux + sx * ((L - 4) / 2 + 4.2), 14.7, uz, 0.24, 1.8, 0.24, GOLD, 0, 0, -sx * 0.55);
      // stairs
      this.box('concrete', ux + sx * (L / 2 + 5.5), 0, uz, 3, 0.7, 6, '#E1DACC');
    }
    this.box('shiny', ux, 16.15, uz, L - 4, 0.2, 0.32, GOLD);
    // chedi (white & gold)
    const cx = -120, cz = -112;
    this.box('plaster', cx, 0, cz, 22, 1.6, 22, WH);
    this.box('plaster', cx, 1.6, cz, 17, 1.4, 17, WH);
    this.box('plaster', cx, 3.0, cz, 13, 1.2, 13, WH);
    this.cyl('plaster', cx, 4.2, cz, 6.2, 1.2, WH, 24);
    this.cyl('plaster', cx, 5.4, cz, 5.6, 0.9, WH, 24);
    this.sph('plaster', cx, 9.6, cz, 5.4, 6.6, 5.4, WH, 24);
    this.box('shiny', cx, 14.4, cz, 3.0, 1.6, 3.0, GOLD);
    for (let k = 0; k < 9; k++) this.cyl('shiny', cx, 16 + k * 1.05, cz, 1.25 - k * 0.12, 1.0, GOLD, 16);
    this.cone('shiny', cx, 25.4, cz, 0.3, 6.0, GOLD, 12);
    this._col(cx - 11, cz - 11, cx + 11, cz + 11);
    // sala + bell tower
    const sx0 = 40, sz0 = -60;
    this.box('concrete', sx0, 0, sz0, 20, 0.8, 12, '#E1DACC');
    for (let x = sx0 - 9; x <= sx0 + 9; x += 3.6) for (const zz of [sz0 - 5.5, sz0 + 5.5]) this.box('plaster', x, 0.8, zz, 0.5, 4.2, 0.5, WH);
    this.gable('tile', sx0, 5.0, sz0, 21, 13, 4.2, OR, { oh: 0.8, wall: 'shiny', wallCol: GOLD });
    this._wGableTrim(sx0, 5.0, sz0, 21, 13, 4.2, 0, GOLD, 0.8);
    this._col(sx0 - 10, sz0 - 6, sx0 + 10, sz0 + 6);
    const bx = 60, bz = -150;
    this.box('plaster', bx, 0, bz, 4, 8, 4, WH);
    this.box('flat', bx, 8, bz, 4.4, 3, 4.4, RED);
    this.cyl('shiny', bx, 8.4, bz, 0.9, 1.6, GOLD, 12);
    this.hip('tile', bx, 11, bz, 5.4, 5.4, 3.2, OR, { oh: 0.4 });
    this.cone('shiny', bx, 14, bz, 0.22, 2.6, GOLD, 8);
    this._col(bx - 2.2, bz - 2.2, bx + 2.2, bz + 2.2);
    // monks' quarters (kuti) along the north wall
    for (let k = 0; k < 6; k++) this._wHouse({ x: -140 + k * 22, z: -178, yaw: 0, w: 8, d: 6, st: 1, wall: '#EFE7D6', roof: OR, R: R, stilts: k % 2 === 0 });
    // trees & lawns
    this.plane('grass', -120, 0.07, -60, 60, 50, '#FFFFFF');
    this.plane('grass', 60, 0.07, -110, 60, 40, '#FFFFFF');
    for (const p of [[-80, -60], [-150, -60], [80, -60], [90, -160], [-60, -170], [20, -170], [-150, -165], [100, -100], [-95, -150]]) E.treeSpots.push({ x: p[0], z: p[1], s: 1.0 + R() * 0.3, kind: 'rain' });
    for (let k = 0; k < 12; k++) E.treeSpots.push({ x: x0 + 6 + R() * (x1 - x0 - 12), z: z1 - 8 - R() * 20, s: 0.5 + R() * 0.3, kind: this._wPick(R, ['bush', 'palm', 'mango']) });
    for (let k = 0; k < 4; k++) E.animalSpots.dogs.push({ x: -40 + R() * 60, z: -60 + R() * 10 });
  },

  // ---------- city plaza (east half of the civic block)
  _wPlaza(R) {
    const E = this._E;
    const T = E.T;
    const x0 = -12, x1 = 111, z0 = 14, z1 = 201;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    this.plane('grass', cx, 0.025, cz, x1 - x0, z1 - z0, '#FFFFFF');
    this.plane('paving', cx, 0.07, cz, 8, z1 - z0, '#E6E0D3');
    this.plane('paving', cx, 0.07, cz, x1 - x0, 8, '#E6E0D3');
    this.plane('paving', cx, 0.07, cz, 46, 46, '#E6E0D3');
    // fountain
    this.cyl('concrete', cx, 0, cz, 11, 0.7, '#D3CEC4', 40);
    this._wWaterDisc(cx, 0.62, cz, 10.4);
    this.cyl('concrete', cx, 0.6, cz, 2.2, 1.4, '#D3CEC4', 24);
    this.cyl('concrete', cx, 2.0, cz, 1.1, 1.2, '#D3CEC4', 20);
    this._col(cx - 11, cz - 11, cx + 11, cz + 11);
    this._emitter({ type: 'steam', pos: [cx, 3.2, cz], rate: 14, size: 1.0, rise: 2.5, spread: 0.6, life: 1.4, color: '#FFFFFF' });
    // clock tower
    const tx = cx, tz = z0 + 22;
    this.box('plaster', tx, 0, tz, 5, 20, 5, '#F1ECE2');
    this.box('shiny', tx, 19.2, tz, 5.6, 0.4, 5.6, '#D4A64A');
    this.hip('tile', tx, 20.5, tz, 6.6, 6.6, 4.2, '#D9662A', { oh: 0.3 });
    this.box('flat', tx, 19.6, tz, 5.2, 0.9, 5.2, '#9E2A22');
    this.cone('shiny', tx, 24.7, tz, 0.22, 3.0, '#D4A64A', 8);
    this._col(tx - 2.6, tz - 2.6, tx + 2.6, tz + 2.6);
    const clock = this._canvasTex(256, 256, (g, W, H) => {
      g.fillStyle = '#F8F6EE'; g.beginPath(); g.arc(W / 2, H / 2, W * 0.46, 0, 7); g.fill();
      g.lineWidth = 10; g.strokeStyle = '#2B2B2B'; g.stroke();
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; g.fillStyle = '#2B2B2B'; g.fillRect(W / 2 + Math.sin(a) * W * 0.36 - 4, H / 2 - Math.cos(a) * H * 0.36 - 8, 8, 16); }
      g.lineWidth = 9; g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 + 40, H / 2 - 50); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 - 70, H / 2 + 20); g.stroke();
    });
    const cm = new T.MeshStandardMaterial({ map: clock, transparent: true, roughness: 0.5 });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const m = new T.Mesh(new T.CircleGeometry(1.7, 32), cm);
      const p = this._wP(tx, tz, a, 0, 2.53);
      m.position.set(p[0], 16.6, p[1]);
      m.rotation.y = a;
      this._addDyn(m);
    }
    // benches, flower beds, trees, lamps
    const bench = this._wBenchGeo();
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const x = cx + Math.sin(a) * 18, z = cz + Math.cos(a) * 18;
      if (k % 2 === 0) { this._wStamp('flat', bench, x, 0.04, z, a + Math.PI); this._colBox(x, z, 1.4, 1.4, 0, 0); }
      else this._lamp(x, 4.4, z, { pool: 6 });
      if (k % 2 === 1) this.cyl('shiny', x, 0.04, z, 0.08, 4.2, '#2F3A40', 8);
      if (k % 4 === 0) E.crowdSpots.push({ x: x - Math.sin(a) * 0.4, z: z - Math.cos(a) * 0.4, yaw: a + Math.PI, mode: 'sit', outfit: this._wPick(R, ['casual', 'office', 'student']) });
    }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.4;
      const x = cx + Math.sin(a) * 30, z = cz + Math.cos(a) * 30;
      this.box('concrete', x, 0, z, 5, 0.5, 2.2, '#CFC8BB', { top: 'dirt', topCol: '#6E5038', ry: a });
      for (let f = 0; f < 6; f++) this.box('flat', x + (f - 2.5) * 0.7 * Math.cos(a), 0.5, z - (f - 2.5) * 0.7 * Math.sin(a), 0.5, 0.35, 0.5, ['#E63B7A', '#F4C430', '#FF7A2E', '#C2185B', '#FFFFFF'][f % 5]);
    }
    for (let k = 0; k < 26; k++) {
      const a = R() * Math.PI * 2, r = 36 + R() * 40;
      const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
      if (x < x0 + 3 || x > x1 - 3 || z < z0 + 3 || z > z1 - 3) continue;
      E.treeSpots.push({ x: x, z: z, s: 0.7 + R() * 0.5, kind: this._wPick(R, ['rain', 'rain', 'mango', 'palm', 'flame', 'golden']) });
    }
    // public library + open-air stage
    this.box('office', 62, 0, 176, 64, 7.5, 24, '#EAF2F4', { top: 'concrete', topCol: '#BDB8AE' });
    this.box('concrete', 62, 7.5, 176, 66, 0.6, 26, '#E6E2DA');
    this._sign('ห้องสมุดประชาชนเมืองคาร์บอน', 14, 1.1, '#FFFFFF', '#1F4D36', [62, 5.4, 163.9], Math.PI, { border: '#1F4D36' });
    this._col(30, 164, 94, 188);
    this.box('concrete', 88, 0, 70, 16, 1.0, 10, '#D7D1C5');
    for (const q of [[-7.5, -4.5], [7.5, -4.5], [-7.5, 4.5], [7.5, 4.5]]) this.box('shiny', 88 + q[0], 1.0, 70 + q[1], 0.3, 5, 0.3, '#8C949A');
    this.gable('metal', 88, 6.0, 70, 17, 11, 2.0, '#2F6DB5', { oh: 0.5, wall: false, both: true });
    this._col(80, 65, 96, 75);
    this._sign('ลานเมือง · ลดคาร์บอน เริ่มที่เรา', 9, 1.2, '#1F4D36', '#FFFFFF', [cx + 14, 1.2, z0 + 6], 0, { both: true, border: '#CDE7C5' });
    this.box('concrete', cx + 14, 0, z0 + 6, 9.4, 0.6, 0.6, '#BDB8AE');
    for (let k = 0; k < 14; k++) E.animalSpots.birds.push([cx + (R() - 0.5) * 30, cz + (R() - 0.5) * 30]);
    E.walkLoops.push({ pts: [[cx - 25, cz], [cx, cz - 25], [cx + 25, cz], [cx, cz + 25]], closed: true });
    E.walkLoops.push({ pts: [[cx, z0 + 2], [cx, z1 - 2]], closed: false });
  },

  // ---------- riverside column (condos, gas station, water works)
  _wRiversideBlocks(bN, bS, bI, R) {
    const E = this._E;
    this.plane('grass', (bN.x0 + bN.x1) / 2, 0.02, (bN.z0 + bN.z1) / 2, bN.x1 - bN.x0, bN.z1 - bN.z0, '#FFFFFF');
    this.plane('grass', (bS.x0 + bS.x1) / 2, 0.02, (bS.z0 + bS.z1) / 2, bS.x1 - bS.x0, bS.z1 - bS.z0, '#FFFFFF');
    this.plane('concrete', (bI.x0 + bI.x1) / 2, 0.02, (bI.z0 + bI.z1) / 2, bI.x1 - bI.x0, bI.z1 - bI.z0, '#C2BDB2');
    // gas station at N5 x A (north-east corner)
    const gx = 446, gz = -40;
    this.plane('concrete', gx, 0.07, gz, 70, 46, '#C9C5BD');
    for (const px of [gx - 16, gx + 16]) for (const pz of [gz - 6, gz + 6]) { this.box('shiny', px, 0, pz, 0.6, 6, 0.6, '#E9ECEE'); this._col(px - 0.4, pz - 0.4, px + 0.4, pz + 0.4); }
    this.box('flat', gx, 6, gz, 40, 1.1, 20, '#F4F6F7', { bot: 'flat' });
    this.box('flat', gx, 6.25, gz + 10.02, 40, 0.5, 0.06, '#1D7A46');
    this.box('flat', gx, 6.25, gz - 10.02, 40, 0.5, 0.06, '#1D7A46');
    for (let k = 0; k < 8; k++) this._lamp(gx - 15 + k * 4.3, 5.9, gz, { pool: 5, indoor: true });
    for (const px of [gx - 10, gx, gx + 10]) for (const pz of [gz - 3, gz + 3]) {
      this.box('flat', px, 0, pz, 1.0, 1.8, 0.6, '#EDEFF0');
      this.box('flat', px, 1.2, pz + 0.31, 0.6, 0.35, 0.02, '#1E2B33');
      this._col(px - 0.6, pz - 0.4, px + 0.6, pz + 0.4);
    }
    E.parkSpots.push({ x: gx - 10, z: gz - 5.5, yaw: Math.PI / 2, kind: 'car', color: '#B9BEC3' });
    E.parkSpots.push({ x: gx + 10, z: gz + 5.5, yaw: -Math.PI / 2, kind: 'pickup', color: '#F2F2F2' });
    E.parkSpots.push({ x: gx, z: gz + 5.2, yaw: -Math.PI / 2, kind: 'moto', color: '#C62828' });
    this.box('front', gx + 28, 0, gz - 4, 14, 4.2, 10, '#FFFFFF', { top: 'concrete' });
    this._col(gx + 21, gz - 9, gx + 35, gz + 1);
    this.box('flat', gx - 30, 0, gz + 17, 1.2, 9, 1.2, '#1D7A46');
    this._sign('CARBON OIL', 3.2, 1.4, '#1D7A46', '#FFFFFF', [gx - 30, 8.1, gz + 17.65], 0, { both: true });
    this._sign('ดีเซล 31.94\nแก๊สโซฮอล์ 95  35.48', 3.0, 2.2, '#FFFFFF', '#1B2A33', [gx - 30, 5.6, gz + 17.65], 0, { both: true, sub: 0.95, size: 0.3 });
    this._col(gx - 31, gz + 16.3, gx - 29, gz + 17.7);
    // condo towers
    this._wTower({ x: 486, z: -118, w: 30, d: 22, fl: 30, fac: 'apt', tint: '#F3EFE6', podium: true, R: R, antenna: true });
    this._wTower({ x: 452, z: -176, w: 24, d: 18, fl: 22, fac: 'apt', tint: '#E8EEF0', podium: false, R: R });
    this._wTower({ x: 478, z: 86, w: 32, d: 22, fl: 28, fac: 'apt', tint: '#F1E6D6', podium: true, R: R, name: 'RIVERSIDE CARBON', nameFace: Math.PI / 2, nameBg: '#21455E' });
    this._wTower({ x: 450, z: 162, w: 22, d: 18, fl: 18, fac: 'office', tint: '#E1ECF0', podium: false, R: R });
    this._wShopRow({ face: 'W', line: bS.x0, s0: bS.z0 + 2, s1: 60, depth: 13, fl: [2, 3], R: R });
    for (let k = 0; k < 16; k++) E.treeSpots.push({ x: bN.x0 + 10 + R() * (bN.x1 - bN.x0 - 14), z: bN.z0 + 8 + R() * 70, s: 0.7 + R() * 0.4, kind: this._wPick(R, ['rain', 'palm', 'mango']) });
    for (let k = 0; k < 14; k++) E.treeSpots.push({ x: bS.x0 + 30 + R() * (bS.x1 - bS.x0 - 34), z: bS.z0 + 110 + R() * 70, s: 0.7 + R() * 0.4, kind: this._wPick(R, ['rain', 'palm', 'mango']) });
    // water works (north riverside block)
    const wx = 470, wz = -330;
    this._wFence([[bI.x0 + 2, bI.z0 + 2], [bI.x1 - 2, bI.z0 + 2], [bI.x1 - 2, bI.z1 - 2], [bI.x0 + 2, bI.z1 - 2]], 2.2, true, [[bI.x0 + 30, bI.z1 - 2, 4]]);
    for (const p of [[wx - 20, wz - 50], [wx + 20, wz - 50], [wx - 20, wz - 8], [wx + 20, wz - 8]]) {
      this.cyl('concrete', p[0], 0, p[1], 15, 2.6, '#CFCAC0', 40);
      this._wWaterDisc(p[0], 2.45, p[1], 14.3);
      this.box('shiny', p[0], 2.7, p[1], 29, 0.25, 0.6, '#8C949A');
      this._col(p[0] - 15, p[1] - 15, p[0] + 15, p[1] + 15);
    }
    this.box('shop', wx, 0, wz + 40, 40, 8, 16, '#EAF0F2', { top: 'concrete' });
    this._col(wx - 20, wz + 32, wx + 20, wz + 48);
    // elevated water tower (landmark)
    const tx = 440, tz = -260;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) this.cylR('shiny', tx + sx * 3, 12, tz + sz * 3, 0.35, 24.5, '#BFC4C7', -sz * 0.12, 0, sx * 0.12, 8);
    this.cyl('concrete', tx, 0, tz, 1.6, 26, '#D8D3C9', 16);
    this.cone('shiny', tx, 22, tz, 9.5, 4, '#E9EEF1', 32);
    this.cyl('shiny', tx, 26, tz, 9.5, 6, '#E9EEF1', 32);
    this.cone('shiny', tx, 32, tz, 9.6, 2.4, '#2E7DC0', 32);
    this._sign('การประปาเมืองคาร์บอน', 12, 1.6, '#2E7DC0', '#FFFFFF', [tx, 29, tz + 9.65], 0, { both: false });
    this._col(tx - 4, tz - 4, tx + 4, tz + 4);
  },

  // ---------- housing blocks (south of road C): 3 lanes (soi) with house plots both sides
  _wHousing(b, R) {
    const E = this._E;
    const w = b.x1 - b.x0;
    const cxB = (b.x0 + b.x1) / 2;
    this._wShopRow({ face: 'N', line: b.z0, s0: b.x0 + 2, s1: b.x1 - 2, depth: 13, fl: [2, 3], R: R, kind: 'town', gaps: [[cxB - 5, cxB + 5]] });
    const lanes = [b.z0 + 52, (b.z0 + b.z1) / 2, b.z1 - 52];
    // lanes + one north-south connector
    for (const lz of lanes) this.plane('concrete', cxB, 0.07, lz, w, 6, '#BDB7AC');
    this.plane('concrete', cxB, 0.07, (b.z0 + 16 + b.z1 - 16) / 2, 6, b.z1 - b.z0 - 32, '#BDB7AC');
    const special = b.i === 2 ? 'field' : (b.i === 1 ? 'pond' : null);
    const spZ = (lanes[0] + lanes[1]) / 2;
    const spX0 = b.x0 + 30, spX1 = b.x0 + 210;
    const plotW = 18, plotD = 22;
    const walls = ['#F3E3C3', '#E5EEF2', '#F2D4CF', '#E6EFD9', '#F7F1E1', '#E9DCC9', '#E1E6EE'];
    const roofs = ['#B5522B', '#C2552D', '#5B6E7C', '#2F6B5A', '#7A3B2E', '#3F5F8A', '#8C3B2E'];
    lanes.forEach((lz, li) => {
      for (let x = b.x0 + 12 + plotW / 2; x < b.x1 - 8 - plotW / 2; x += plotW) {
        if (Math.abs(x - cxB) < plotW / 2 + 3) continue;
        for (const side of [-1, 1]) {
          const zc = lz + side * (3 + plotD / 2 + 0.5);
          if (special && ((li === 0 && side > 0) || (li === 1 && side < 0)) && x > spX0 - plotW / 2 && x < spX1 + plotW / 2) continue;
          const yaw = side < 0 ? 0 : Math.PI;
          const st = R() < 0.4 ? 2 : 1;
          const hw = 8 + ((R() * 3) | 0), hd = 7 + ((R() * 2) | 0);
          this._wHouse({ x: x, z: zc + side * 0.8, yaw: yaw, w: hw, d: hd, st: st, wall: this._wPick(R, walls), roof: this._wPick(R, roofs), R: R, plotW: plotW - 1, plotD: plotD - 1, stilts: R() < 0.07 });
        }
      }
      E.walkLoops.push({ pts: [[b.x0 + 4, lz - 1.5], [b.x1 - 4, lz - 1.5], [b.x1 - 4, lz + 1.5], [b.x0 + 4, lz + 1.5]], closed: true });
      for (let k = 0; k < 2; k++) E.animalSpots.dogs.push({ x: b.x0 + 20 + R() * (w - 40), z: lz + (R() - 0.5) * 3 });
    });
    // south frontage: detached houses facing road E
    for (let x = b.x0 + 12; x < b.x1 - 12; x += 22) {
      if (Math.abs(x - cxB) < 12) continue;
      this._wHouse({ x: x, z: b.z1 - 12, yaw: 0, w: 9, d: 8, st: R() < 0.5 ? 2 : 1, wall: this._wPick(R, walls), roof: this._wPick(R, roofs), R: R, plotW: 20, plotD: 17 });
    }
    if (special === 'field') {
      const fx = (spX0 + spX1) / 2, fz = spZ;
      this.plane('grass', fx, 0.07, fz, 100, 50, '#D9F0B0');
      for (const q of [[fx, fz - 28.5, 124, 7], [fx, fz + 28.5, 124, 7], [fx - 56, fz, 12, 50], [fx + 56, fz, 12, 50]]) this.plane('dirt', q[0], 0.07, q[1], q[2], q[3], '#C2674B');
      for (const l of [[fx, fz - 24, 98, 0.15], [fx, fz + 24, 98, 0.15]]) this.plane('paint', l[0], 0.1, l[1], l[2], l[3], '#FFFFFF');
      for (const xx of [fx - 49, fx, fx + 49]) this.plane('paint', xx, 0.1, fz, 0.15, 48, '#FFFFFF');
      for (const sx of [-1, 1]) {
        const gx = fx + sx * 49;
        this.box('flat', gx, 0, fz - 3.6, 0.12, 2.4, 0.12, '#FFFFFF');
        this.box('flat', gx, 0, fz + 3.6, 0.12, 2.4, 0.12, '#FFFFFF');
        this.box('flat', gx, 2.4, fz, 0.12, 0.12, 7.3, '#FFFFFF');
      }
      for (let k = 0; k < 10; k++) E.crowdSpots.push({ x: fx - 40 + R() * 80, z: fz - 18 + R() * 36, yaw: R() * 6.28, mode: 'stand', outfit: 'student' });
      this.box('metal', fx, 0, fz - 29.5, 40, 2.6, 4, '#2F6DB5', { top: 'metal' });
      this._col(fx - 20, fz - 31.5, fx + 20, fz - 27.5);
      this._sign('สนามกีฬาชุมชน', 6, 1.0, '#2F6DB5', '#FFFFFF', [fx, 3.3, fz - 27.4], 0, {});
    }
    if (special === 'pond') {
      const px = (spX0 + spX1) / 2, pz = spZ;
      this._wWaterDisc(px, 0.07, pz, 26, 2.6, 1.0);
      this._col(px - 66, pz - 24, px + 66, pz + 24);
      this.box('wood', px + 40, 0.6, pz + 30, 8, 0.3, 6, '#9C7650');
      for (const q of [[-3.5, -2.5], [3.5, -2.5], [-3.5, 2.5], [3.5, 2.5]]) this.box('wood', px + 40 + q[0], 0, pz + 30 + q[1], 0.25, 3.6, 0.25, '#7A5A3B');
      this.gable('tile', px + 40, 3.6, pz + 30, 9, 7, 2.6, '#B5522B', { oh: 0.5, wall: 'wood', wallCol: '#9C7650' });
      this._col(px + 36, pz + 27, px + 44, pz + 33);
      for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2; E.treeSpots.push({ x: px + Math.cos(a) * 74, z: pz + Math.sin(a) * 30, s: 0.6 + R() * 0.5, kind: this._wPick(R, ['rain', 'bamboo', 'palm', 'mango', 'banana']) }); }
      E.animalSpots.birds.push([px, pz]);
      E.walkLoops.push({ pts: [[px - 70, pz - 28], [px + 70, pz - 28], [px + 70, pz + 28], [px - 70, pz + 28]], closed: true });
    }
    for (let k = 0; k < 10; k++) E.treeSpots.push({ x: b.x0 + 10 + R() * (w - 20), z: b.z0 + 20 + R() * 10, s: 0.5 + R() * 0.3, kind: this._wPick(R, ['mango', 'palm', 'bush']) });
  },

  // ---------- industrial blocks
  _wFactoryW(b, R) {
    this._wFactory({ x0: b.x0 + 12, z0: b.z0 + 14, x1: b.x0 + 92, z1: b.z0 + 74, h: 11, wall: '#DCE2E6', roof: '#3F6FA3', name: 'โรงงานแปรรูปอาหารเมืองคาร์บอน', front: 'S', R: R });
    this._wFactory({ x0: b.x0 + 104, z0: b.z0 + 14, x1: b.x1 - 10, z1: b.z0 + 120, h: 9, wall: '#E5E1D6', roof: '#B04A35', name: 'คลังสินค้า', front: 'W', R: R });
    this._wFactory({ x0: b.x0 + 12, z0: b.z0 + 110, x1: b.x0 + 88, z1: b.z1 - 30, h: 8, wall: '#E9E6DE', roof: '#4B7B5A', front: 'S', R: R, solar: true });
    this._wFence([[b.x0 + 2, b.z0 + 2], [b.x1 - 2, b.z0 + 2], [b.x1 - 2, b.z1 - 2], [b.x0 + 2, b.z1 - 2]], 2.2, true, [[b.x0 + 50, b.z1 - 2, 5], [b.x1 - 2, b.z1 - 60, 5]]);
    // water tower
    const tx = b.x1 - 30, tz = b.z1 - 40;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) this.cylR('shiny', tx + sx * 2, 9, tz + sz * 2, 0.2, 18, '#8E969B', -sz * 0.08, 0, sx * 0.08, 8);
    this.cyl('shiny', tx, 18, tz, 4, 5, '#D8DDE0', 24);
    this.cone('shiny', tx, 23, tz, 4.1, 1.6, '#B04A35', 24);
    this._col(tx - 3, tz - 3, tx + 3, tz + 3);
  },
  _wFactoryC(b, R) {
    const E = this._E;
    this._wFactory({ x0: b.x0 + 14, z0: b.z0 + 16, x1: b.x0 + 120, z1: b.z0 + 80, h: 12, wall: '#E8ECEE', roof: '#3F6FA3', name: 'โรงน้ำแข็งเมืองคาร์บอน', front: 'S', R: R, solar: true });
    this._wFactory({ x0: b.x0 + 140, z0: b.z0 + 16, x1: b.x1 - 14, z1: b.z0 + 96, h: 10, wall: '#E3DED3', roof: '#9A4732', name: 'บรรจุภัณฑ์คาร์บอนแพ็ค', front: 'S', R: R, solar: true });
    // container yard
    const cols = ['#C0392B', '#2E6DB5', '#E67E22', '#27AE60', '#7F8C8D', '#F1C40F', '#8E44AD'];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) {
      const stack = 1 + ((R() * 3) | 0);
      for (let k = 0; k < stack; k++) {
        const x = b.x0 + 40 + i * 13, z = b.z1 - 60 + j * 3.2;
        this.box('metal', x, k * 2.6, z, 12.2, 2.55, 2.45, this._wPick(R, cols), { top: 'metal' });
      }
    }
    this._col(b.x0 + 33, b.z1 - 62, b.x0 + 40 + 9 * 13, b.z1 - 60 + 4 * 3.2);
    this._wFence([[b.x0 + 2, b.z0 + 2], [b.x1 - 2, b.z0 + 2], [b.x1 - 2, b.z1 - 2], [b.x0 + 2, b.z1 - 2]], 2.2, true, [[b.x0 + 130, b.z1 - 2, 6]]);
    for (let k = 0; k < 6; k++) E.crowdSpots.push({ x: b.x0 + 50 + k * 14, z: b.z1 - 68, yaw: Math.PI, mode: 'work', outfit: 'worker' });
  },

  // ---------- outskirts (fields + villages around the city)
  _wOutskirts(R) {
    const E = this._E;
    // west of the city: paddy fields with dikes, a village along road A
    for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) {
      const x = -1640 + i * 150, z = -470 + j * 118;
      if (Math.abs(z) < 40) continue;
      if (x > -760) continue;
      this.plane('crop', x + 72, 0.03, z + 56, 144, 112, j % 3 === 0 ? '#D9E8A6' : '#FFFFFF');
      this.box('dirt', x + 72, 0, z - 1, 146, 0.28, 1.2, '#B9A98E');
      this.box('dirt', x - 1, 0, z + 56, 1.2, 0.28, 114, '#B9A98E');
    }
    for (let k = 0; k < 18; k++) {
      const x = -1500 + R() * 760, z = (R() < 0.5 ? -1 : 1) * (30 + R() * 20);
      this._wHouse({ x: x, z: z, yaw: z < 0 ? 0 : Math.PI, w: 8, d: 7, st: 1, wall: this._wPick(R, ['#EFE5D2', '#E3E9EC', '#C9A77E']), roof: this._wPick(R, ['#B5522B', '#5B6E7C', '#8A8F93']), R: R, stilts: R() < 0.4 });
      E.treeSpots.push({ x: x + 8, z: z + (R() - 0.5) * 8, s: 0.7 + R() * 0.4, kind: this._wPick(R, ['palm', 'mango', 'banana', 'rain']) });
    }
    // roadside rest stop + billboard before the gate
    this.plane('concrete', -760, 0.03, -36, 40, 30, '#C4BFB4');
    this.box('front2', -770, 0, -44, 20, 4.2, 10, '#FFFFFF', { top: 'concrete' });
    this.box('flat', -770, 4.2, -40.5, 22, 0.25, 4, '#2F6DB5');
    this._col(-780, -49, -760, -39);
    for (let k = 0; k < 4; k++) E.parkSpots.push({ x: -760 + k * 5, z: -28, yaw: 0, kind: k % 2 ? 'car' : 'pickup', color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33']) });
    this.box('flat', -820, 0, 24, 0.5, 8, 0.5, '#7F878C');
    this.box('flat', -812, 0, 24, 0.5, 8, 0.5, '#7F878C');
    this._sign('เมืองคาร์บอน · เมืองคาร์บอนต่ำ\nอีก 1.5 กม.', 14, 4.5, '#1F4D36', '#FFFFFF', [-816, 8, 24.3], -Math.PI / 2, { border: '#F2C200', both: true, sub: 0.7 });
    // south of road E: fields + villages
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) {
      const x = -600 + i * 145, z = 520 + j * 125;
      if (x > 540) continue;
      this.plane('crop', x + 70, 0.03, z + 60, 140, 120, (i + j) % 3 === 0 ? '#E3EDB0' : '#FFFFFF');
      this.box('dirt', x + 70, 0, z - 1, 142, 0.28, 1.2, '#B9A98E');
      this.box('dirt', x - 1, 0, z + 60, 1.2, 0.28, 122, '#B9A98E');
    }
    for (let k = 0; k < 22; k++) {
      const x = -600 + R() * 1120, z = 478 + R() * 16;
      this._wHouse({ x: x, z: z + 10, yaw: Math.PI, w: 8, d: 7, st: 1, wall: this._wPick(R, ['#EFE5D2', '#E3E9EC', '#C9A77E']), roof: this._wPick(R, ['#B5522B', '#5B6E7C', '#8A8F93']), R: R, stilts: R() < 0.35 });
    }
    for (let k = 0; k < 140; k++) E.treeSpots.push({ x: -650 + R() * 1200, z: 470 + R() * 520, s: 0.6 + R() * 0.6, kind: this._wPick(R, ['palm', 'palm', 'mango', 'banana', 'rain', 'bamboo']) });
    for (let k = 0; k < 160; k++) E.treeSpots.push({ x: -1700 + R() * 960, z: -500 + R() * 1000, s: 0.6 + R() * 0.6, kind: this._wPick(R, ['palm', 'palm', 'mango', 'banana', 'rain']) });
    // north of road D (scrub before the hill)
    for (let k = 0; k < 120; k++) {
      const x = -640 + R() * 1200, z = -478 - R() * 70;
      if (Math.abs(x + 170) < 12) continue;
      E.treeSpots.push({ x: x, z: z, s: 0.6 + R() * 0.5, kind: this._wPick(R, ['rain', 'mango', 'teak', 'bush']) });
    }
    E.animalSpots.birds.push([-1100, 200], [200, 700], [-300, -520]);
  }
});
/* GHG Town 3D v0.3 — world part 4: civic stops — municipal office (2,3,4,5), school canteen (8), substation (12) + transmission line */
Object.assign(GHG3.world, {
  // guide spot 1.7 m ahead and `side` m to the right of the line of sight
  _wGuideAt(view, look, side, fwd) {
    const dx = look[0] - view[0], dz = look[2] - view[1];
    const l = Math.hypot(dx, dz) || 1;
    const d = [dx / l, dz / l];
    const r = [-d[1], d[0]];
    const s = side == null ? 1.4 : side, f = fwd == null ? 1.7 : fwd;
    return [view[0] + d[0] * f + r[0] * s, view[1] + d[1] * f + r[1] * s];
  },
  // animated Thai flag
  _wFlag(x, y, z, ry, w, h) {
    const E = this._E;
    const T = E.T;
    const tex = this._canvasTex(192, 128, (g, W, H) => {
      const bands = [['#A51931', 1], ['#F4F5F8', 1], ['#2D2A4A', 2], ['#F4F5F8', 1], ['#A51931', 1]];
      let yy = 0;
      for (const b of bands) { g.fillStyle = b[0]; g.fillRect(0, yy, W, (H * b[1]) / 6 + 1); yy += (H * b[1]) / 6; }
    });
    const geo = new T.PlaneGeometry(w || 3, h || 2, 12, 4);
    geo.translate((w || 3) / 2, 0, 0);
    const base = geo.attributes.position.array.slice();
    const m = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, side: T.DoubleSide, roughness: 0.8 }));
    m.position.set(x, y, z);
    m.rotation.y = ry || 0;
    m.castShadow = true;
    this._addDyn(m);
    const P = geo.attributes.position;
    this._anim((dt, t) => {
      const a = P.array;
      for (let i = 0; i < P.count; i++) {
        const px = base[i * 3];
        a[i * 3 + 2] = Math.sin(px * 1.9 - t * 4.2) * 0.16 * (px / (w || 3)) + Math.sin(px * 3.1 - t * 6.1) * 0.05 * (px / (w || 3));
      }
      P.needsUpdate = true;
    });
  },

  // ------------------------------------------------------------- municipal office (stops 2-5)
  _wMunicipal() {
    const E = this._E;
    const R = this._rng(2468);
    const CREAM = '#F2E8D5', WH = '#F4F1EA', GOLD = '#D4A64A';
    // grounds
    this.plane('grass', -86.5, 0.02, 107.5, 149, 187, '#FFFFFF');
    this.plane('concrete', -105, 0.07, 34, 14, 40, '#C7C2B8');
    this.plane('concrete', -85, 0.07, 47, 52, 10, '#C7C2B8');
    this.plane('asphalt', -40, 0.07, 36, 46, 40, '#F2F2F2');
    for (let x = -60; x <= -20; x += 2.8) for (const z of [24, 48]) this.plane('paint', x, 0.1, z, 0.12, 5, '#F2F2EE');
    for (let k = 0; k < 13; k++) for (const z of [24, 48]) if (R() < 0.7) E.parkSpots.push({ x: -58.6 + k * 2.8 + 1.4, z: z, yaw: z < 36 ? Math.PI : 0, kind: R() < 0.6 ? 'car' : 'pickup', color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33', '#8E1F1F', '#1F3F7A', '#D9D9D9']) });
    // main building (4 storeys), Thai hip roof, central gabled portico
    const bx0 = -120, bx1 = -50, bz0 = 64, bz1 = 84;
    const bcx = (bx0 + bx1) / 2, bcz = (bz0 + bz1) / 2;
    this.box('concrete', bcx, 0, bcz, bx1 - bx0 + 1, 0.5, bz1 - bz0 + 1, '#C9C2B4');
    this.box('shop', bcx, 0.5, bcz, bx1 - bx0, 16, bz1 - bz0, CREAM, { top: false, v0: 0.5 });
    this.box('concrete', bcx, 16.5, bcz, bx1 - bx0 + 0.8, 0.5, bz1 - bz0 + 0.8, '#E9E2D2');
    this.hip('tile', bcx, 17, bcz, bx1 - bx0 + 1, bz1 - bz0 + 1, 5.0, '#B5522B', { oh: 1.0 });
    // portico bay
    this.box('plaster', bcx, 0.5, bz0 - 2.5, 20, 16.5, 5, WH, { top: false });
    for (let k = 0; k < 4; k++) this.box('plaster', bcx - 7.5 + k * 5, 0.5, bz0 - 5.15, 1.0, 16.5, 1.0, WH);
    this.gable('tile', bcx, 17, bz0 - 2.0, 9, 22, 6.4, '#B5522B', { ry: Math.PI / 2, oh: 0.8, wall: 'plaster', wallCol: '#F4F1EA' });
    this._wGableTrim(bcx, 17, bz0 - 2.0, 9, 22, 6.4, Math.PI / 2, GOLD, 0.8);
    this.cylR('shiny', bcx, 19.6, bz0 - 6.6, 1.5, 0.25, GOLD, Math.PI / 2, 0, 0, 24);
    this._col(bx0 - 0.5, bz0 - 5.7, bx1 + 0.5, bz1 + 0.5);
    // entrance canopy (porte-cochere) + steps
    this.box('concrete', bcx, 4.4, 53.5, 22, 0.5, 11, '#E9E4DA', { bot: 'flat' });
    for (const px of [bcx - 10, bcx + 10]) for (const pz of [49, 57.5]) { this.box('plaster', px, 0.05, pz, 0.7, 4.35, 0.7, WH); this._col(px - 0.45, pz - 0.45, px + 0.45, pz + 0.45); }
    // entrance podium at floor level 0.5 under the portico, three steps up from the drive
    this.box('concrete', bcx, 0, 61.0, 22, 0.5, 6.0, '#D7D1C5');
    for (let k = 0; k < 3; k++) this.box('concrete', bcx, 0, 57.8 - k * 0.4, 14, 0.375 - k * 0.125, 0.4, '#D7D1C5');
    this.box('glass', bcx, 0.5, bz0 - 5.05, 4.0, 3.2, 0.1, '#5E7A8A');
    this.box('flat', bcx, 3.7, bz0 - 5.1, 4.4, 0.3, 0.14, '#7A5233');
    this._sign('สำนักงานเทศบาลเมืองคาร์บอน', 19, 1.05, '#7A2E1F', '#F8D776', [bcx, 4.65, 47.95], Math.PI, { border: GOLD });
    for (let k = 0; k < 4; k++) this._lamp(bcx - 7.5 + k * 5, 4.3, 53.5, { pool: 4, indoor: true });
    // monument name sign on the front lawn
    this.box('plaster', -58, 0, 20.5, 9, 1.6, 1.0, '#E9E2D2');
    this._sign('เทศบาลเมืองคาร์บอน', 8.4, 1.1, '#E9E2D2', '#7A2E1F', [-58, 0.95, 19.98], Math.PI, { size: 0.6 });
    this._col(-62.5, 20, -53.5, 21);
    // flagpole with the Thai flag
    this.cyl('concrete', -85, 0, 30, 1.2, 0.5, '#D7D1C5', 16);
    this.cyl('shiny', -85, 0.5, 30, 0.08, 13.5, '#E6E9EB', 10);
    this._wFlag(-85, 12.6, 30, Math.PI / 2, 3.0, 2.0);
    this._col(-86.2, 28.8, -83.8, 31.2);
    // annex building + staff car park at the back of the lot
    this.box('shop', -105, 0, 166, 80, 12, 22, '#EFE4CF', { top: false, v0: 0.5 });
    this.hip('tile', -105, 12, 166, 81, 23, 4.0, '#B5522B', { oh: 0.9 });
    this._col(-145.5, 154.5, -64.5, 177.5);
    this._sign('อาคารกองช่าง · กองสาธารณสุขและสิ่งแวดล้อม', 16, 0.9, '#7A2E1F', '#F8D776', [-105, 4.6, 154.9], Math.PI, { border: GOLD });
    this.plane('asphalt', -105, 0.07, 132, 80, 26, '#F2F2F2');
    for (let k = 0; k < 14; k++) if (R() < 0.75) E.parkSpots.push({ x: -140 + k * 5.4, z: k % 2 ? 125 : 139, yaw: k % 2 ? 0 : Math.PI, kind: R() < 0.6 ? 'car' : 'pickup', color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33', '#1F3F7A']) });
    E.parkSpots.push({ x: -40, z: 140, yaw: Math.PI / 2, kind: 'truck', color: '#2E7D32' });
    // lawn trees
    for (const p of [[-150, 24], [-128, 24], [-70, 26], [-150, 110], [-140, 100], [-100, 110], [-30, 100], [-30, 150], [-30, 190], [-150, 192]]) E.treeSpots.push({ x: p[0], z: p[1], s: 0.9 + R() * 0.3, kind: this._wPick(R, ['rain', 'mango', 'rain', 'golden']) });
    for (let k = 0; k < 10; k++) E.treeSpots.push({ x: -118 + k * 7, z: 61.5, s: 0.35, kind: 'bush' });

    // ---- STOP 3: purchased electricity — two-pole platform transformer, kWh meter on the pole, MDB at the wall (civic.js)
    const tx = -114, tz = 56;
    this._cvTransformer(tx, tz, bz0);
    const v3 = [-113, 41], l3 = [-114, 5.0, 57];
    this._stopAnchor(3, { view: v3, look: l3, guide: this._wGuideAt(v3, l3, 1.5), pin: [tx, 11.2, tz], emit: [tx, 6.6, tz], gas: ['CO2'], spread: 2.5, route: [[-105, 12], [-105, 30], v3], inside: null, district: 'civic' });

    // ---- STOP 2: septic tank (west side of the building)
    const sx = -127, sz = 73;
    this._cvSeptic(sx, sz, bx0);
    this._col(sx - 2.5, sz - 4.7, sx + 2.5, sz + 4.7);
    this.cyl('shiny', -131.5, 0, 66.5, 0.04, 1.3, '#8C949A', 6);
    this._sign('บ่อเกรอะ (Septic Tank)', 1.7, 0.42, '#FFFFFF', '#1F3A5F', [-131.5, 1.5, 66.45], Math.PI, { border: '#1F3A5F' });
    const v2 = [-131, 60], l2 = [-126.5, 0.4, 73];
    this._stopAnchor(2, { view: v2, look: l2, guide: this._wGuideAt(v2, l2, -1.5), pin: [sx, 3.2, sz], emit: [bx0 - 0.12, 3.6, sz + 4], gas: ['CH4'], spread: 1.3, route: [[-105, 12], [-105, 30], [-131, 46], v2], inside: null, district: 'civic' });

    // ---- STOP 4: staff motorbike parking (covered shed, west strip)
    const mx0 = -158, mx1 = -146, mz0 = 58, mz1 = 92;
    this._cvMotoShed(mx0, mx1, mz0, mz1, R);
    this._col(mx0 + 0.6, mz0 + 0.6, mx0 + 3.6, mz1 - 0.6);
    this._col(mx1 - 3.6, mz0 + 0.6, mx1 - 0.6, mz1 - 0.6);
    const v4 = [-139, 72], l4 = [-151.5, 0.9, 75];
    this._stopAnchor(4, { view: v4, look: l4, guide: this._wGuideAt(v4, l4, 1.4), pin: [-152, 4.6, 75], emit: [-150, 0.7, 75], gas: ['CO2'], spread: 4.5, route: [[-140, 12], [-140, 30], [-140, 50], v4], inside: null, district: 'civic' });

    // ---- STOP 5: CO2 fire extinguishers under the entrance canopy
    const ex = bcx + 5.2, ez = bz0 - 5.75;
    this._cvExtinguishers(ex, ez, 0.5);
    const v5 = [bcx + 1.5, 55.2], l5 = [ex, 1.1, ez];
    this._stopAnchor(5, { view: v5, look: l5, guide: this._wGuideAt(v5, l5, -1.3, 1.4), pin: [ex, 3.4, ez], emit: [ex - 0.25, 1.15, ez - 0.1], gas: ['CO2'], spread: 0.9, route: [[-92, 12], [-92, 26], [-92, 45], v5], inside: null, district: 'civic' });
    // staff + visitors
    E.crowdSpots.push({ x: bcx - 3, z: 52, yaw: Math.PI, mode: 'chat', outfit: 'office' });
    E.crowdSpots.push({ x: bcx - 2, z: 51.2, yaw: 0, mode: 'chat', outfit: 'office' });
    E.crowdSpots.push({ x: -150, z: 66, yaw: Math.PI / 2, mode: 'stand', outfit: 'office' });
    E.walkLoops.push({ pts: [[-105, 14.5], [-105, 46], [-70, 46], [-70, 14.5]], closed: true });
    this._cvFlush();
  },

  // ------------------------------------------------------------- school (stop 8)
  _wSchool() {
    const E = this._E;
    const R = this._rng(1357);
    const YEL = '#F3E2A9', ROOF = '#3F5F8A';
    const x0 = 129, x1 = 391, z0 = -201, z1 = -14;
    // perimeter wall with railings + gate
    const gx = 200;
    const wallSeg = (ax, az, bx, bz) => {
      const cx = (ax + bx) / 2, cz = (az + bz) / 2, w = Math.abs(bx - ax) || 0.3, d = Math.abs(bz - az) || 0.3;
      this.box('plaster', cx, 0, cz, w, 0.9, d, '#F1EDE4');
      this.box('shiny', cx, 0.9, cz, w, 0.08, d, '#2E6DB5');
      this.box('shiny', cx, 1.7, cz, w, 0.08, d, '#2E6DB5');
      this._col(Math.min(ax, bx) - 0.15, Math.min(az, bz) - 0.15, Math.max(ax, bx) + 0.15, Math.max(az, bz) + 0.15);
    };
    wallSeg(x0 + 1, z1 - 1, gx - 6, z1 - 1);
    wallSeg(gx + 6, z1 - 1, x1 - 1, z1 - 1);
    wallSeg(x0 + 1, z0 + 1, x1 - 1, z0 + 1);
    wallSeg(x0 + 1, z0 + 1, x0 + 1, z1 - 1);
    wallSeg(x1 - 1, z0 + 1, x1 - 1, z1 - 1);
    for (const s of [-1, 1]) { this.box('plaster', gx + s * 6.5, 0, z1 - 1, 1.4, 4.4, 1.4, '#F1EDE4'); this._col(gx + s * 6.5 - 0.8, z1 - 1.8, gx + s * 6.5 + 0.8, z1 - 0.2); }
    this.box('plaster', gx, 4.4, z1 - 1, 14.4, 1.3, 1.2, '#F1EDE4');
    this._sign('โรงเรียนเทศบาลเมืองคาร์บอน', 12.6, 1.05, '#1B3F73', '#FFFFFF', [gx, 5.05, z1 - 0.38], 0, { border: '#F2C200' });
    this.plane('concrete', gx, 0.07, z1 - 14, 12, 26, '#C7C2B8');
    // classroom blocks: corridors face the field
    const block = (bx0, bz0, bx1, bz1, corr) => {
      const w = bx1 - bx0, d = bz1 - bz0, cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
      this.box('shop', cx, 0, cz, w, 10.8, d, YEL, { top: false, v0: 0.5 });
      const alongX = w > d;
      this.hip('tile', cx, 10.8, cz, alongX ? w + 1 : d + 1, alongX ? d + 5.5 : w + 5.5, 3.6, ROOF, { ry: alongX ? 0 : Math.PI / 2, oh: 0.6 });
      for (let f = 0; f < 3; f++) {
        const y = f * 3.6;
        if (corr === 'S') {
          this.box('concrete', cx, y + 3.4, bz1 + 1.4, w, 0.2, 2.8, '#E2DCCD', { bot: 'flat' });
          if (f > 0) this.box('shiny', cx, y + 0.2 + 0.0, bz1 + 2.75, w, 1.0, 0.06, '#E9E9E4');
          for (let x = bx0; x <= bx1 + 0.1; x += 4) this.box('plaster', x, y, bz1 + 2.6, 0.3, 3.6, 0.3, '#F7F2E6');
        } else {
          this.box('concrete', bx1 + 1.4, y + 3.4, cz, 2.8, 0.2, d, '#E2DCCD', { bot: 'flat' });
          if (f > 0) this.box('shiny', bx1 + 2.75, y + 0.2, cz, 0.06, 1.0, d, '#E9E9E4');
          for (let z = bz0; z <= bz1 + 0.1; z += 4) this.box('plaster', bx1 + 2.6, y, z, 0.3, 3.6, 0.3, '#F7F2E6');
        }
      }
      this._col(bx0, bz0, bx1, bz1);
      if (corr === 'S') for (let x = bx0; x <= bx1 + 0.1; x += 4) this._col(x - 0.2, bz1 + 2.4, x + 0.2, bz1 + 2.8);
      else for (let z = bz0; z <= bz1 + 0.1; z += 4) this._col(bx1 + 2.4, z - 0.2, bx1 + 2.8, z + 0.2);
    };
    block(150, -195, 330, -180, 'S');
    block(135, -170, 152, -45, 'E');
    block(160, -48, 186, -30, 'E');
    // field + track
    this.plane('grass', 250, 0.07, -108, 102, 66, '#D6F0A0');
    for (const q of [[250, -146, 124, 10], [250, -70, 124, 10], [194, -108, 12, 66], [306, -108, 12, 66]]) this.plane('dirt', q[0], 0.07, q[1], q[2], q[3], '#C2674B');
    for (const l of [[250, -141, 100, 0.15], [250, -75, 100, 0.15], [250, -108, 0.15, 66]]) this.plane('paint', l[0], 0.1, l[1], l[2], l[3], '#FFFFFF');
    this.plane('paint', 200, 0.1, -108, 0.15, 66, '#FFFFFF');
    this.plane('paint', 300, 0.1, -108, 0.15, 66, '#FFFFFF');
    for (const s of [-1, 1]) {
      const gxx = 250 + s * 50;
      this.box('flat', gxx, 0, -111.7, 0.12, 2.44, 0.12, '#FFFFFF');
      this.box('flat', gxx, 0, -104.3, 0.12, 2.44, 0.12, '#FFFFFF');
      this.box('flat', gxx, 2.4, -108, 0.12, 0.12, 7.5, '#FFFFFF');
    }
    // flagpole
    this.cyl('concrete', 250, 0, -40, 1.4, 0.6, '#D7D1C5', 16);
    this.cyl('shiny', 250, 0.6, -40, 0.08, 12, '#E6E9EB', 10);
    this._wFlag(250, 11.2, -40, Math.PI / 2, 2.6, 1.7);
    this._col(248.6, -41.4, 251.4, -38.6);
    // students
    for (let k = 0; k < 18; k++) E.crowdSpots.push({ x: 205 + R() * 90, z: -138 + R() * 58, yaw: R() * 6.28, mode: R() < 0.5 ? 'stand' : 'chat', outfit: 'student' });
    for (let k = 0; k < 8; k++) E.crowdSpots.push({ x: 160 + k * 20, z: -175.6, yaw: 0, mode: 'stand', outfit: 'student' });
    for (const p of [[140, -25], [320, -30], [370, -30], [340, -160], [370, -170], [230, -30], [280, -25]]) E.treeSpots.push({ x: p[0], z: p[1], s: 0.9 + R() * 0.3, kind: this._wPick(R, ['rain', 'mango', 'flame']) });

    // ---- canteen (stop 8): open hall, kitchen line, LPG cage behind
    const hx0 = 345, hx1 = 381, hz0 = -118, hz1 = -94;
    const hcx = (hx0 + hx1) / 2, hcz = (hz0 + hz1) / 2;
    this.box('concrete', hcx, 0, hcz, hx1 - hx0 + 1, 0.15, hz1 - hz0 + 1, '#D3CDC1');
    for (let x = hx0; x <= hx1 + 0.1; x += 6) for (let z = hz0; z <= hz1 + 0.1; z += 6) {
      this.box('plaster', x, 0.15, z, 0.45, 4.6, 0.45, '#F7F2E6');
      this._col(x - 0.3, z - 0.3, x + 0.3, z + 0.3);
    }
    this.box('flat', hcx, 4.75, hcz, hx1 - hx0 + 0.8, 0.3, hz1 - hz0 + 0.8, '#C9CED2', { top: false, bot: 'flat' });
    this.gable('metal', hcx, 5.05, hcz, hx1 - hx0 + 2, hz1 - hz0 + 2, 3.2, '#C2552D', { oh: 1.0, wall: 'metal', wallCol: '#E3E6E8', both: true });
    this._sign('โรงอาหาร', 4.2, 0.9, '#C2552D', '#FFFFFF', [hcx, 4.3, hz1 + 0.6], 0, { both: true });
    for (let x = hx0 + 3; x < hx1 - 3; x += 6) for (let z = hz0 + 3; z < hz1 - 2; z += 6) this._lamp(x, 4.55, z, { pool: 0, indoor: true });
    // tables + benches (west part)
    for (let x = hx0 + 2.5; x < hx0 + 22; x += 4.2) for (let z = hz0 + 3; z < hz1 - 2; z += 4.6) {
      this.box('flat', x, 0.15, z, 1.0, 0.75, 3.2, '#E9E4DA');
      for (const sx of [-0.9, 0.9]) this.box('flat', x + sx, 0.15, z, 0.35, 0.45, 3.2, '#2E6DB5');
      this._col(x - 1.1, z - 1.6, x + 1.1, z + 1.6);
      if (R() < 0.5) E.crowdSpots.push({ x: x - 0.9, z: z, yaw: Math.PI / 2, mode: 'sit', outfit: 'student' });
    }
    // kitchen line along the east side: stainless counter, gas stoves + woks, hood
    const kx = hx1 - 2.2, kz0 = -107, kz1 = -96.5;
    const kc = (kz0 + kz1) / 2, kl = kz1 - kz0;
    this.box('shiny', kx, 0.15, kc, 1.4, 0.85, kl, '#C9CED2');
    for (let k = 0; k < 3; k++) {
      const z = kz0 + 1.8 + k * 3.4;
      this.box('flat', kx, 1.0, z, 1.0, 0.18, 0.9, '#2A2C2E');
      this.sph('flat', kx, 1.22, z, 0.38, 0.14, 0.38, '#26282A', 14);
      this.box('flat', kx - 0.45, 1.25, z + 0.25, 0.05, 0.05, 0.5, '#5C3A21');
      this.cyl('glow', kx, 1.19, z, 0.18, 0.02, '#4F8BFF', 12);
      // pot or wok contents, burner valve, steam
      if (k === 1) { this.cyl('shiny', kx, 1.2, z, 0.3, 0.42, '#C9CED2', 20); this.cyl('flat', kx, 1.6, z, 0.29, 0.02, '#E8D9A8', 20); }
      else this.sph('flat', kx, 1.27, z, 0.3, 0.05, 0.3, k ? '#C88A3A' : '#7DB24E', 14);
      this.cylR('flat', kx - 0.66, 0.85, z, 0.035, 0.08, '#E0A21B', 0, 0, Math.PI / 2, 10);
      this._emitter({ type: 'steam', pos: [kx, 1.7, z], rate: 2, size: 0.5, rise: 0.8, spread: 0.12, life: 1.6, color: '#F4F4F2' });
    }
    // prep sink, plate stack and utensil rail on the kitchen line
    this.box('shiny', kx, 1.0, kz1 - 0.9, 1.1, 0.04, 1.2, '#D6DADD');
    this.box('flat', kx, 0.86, kz1 - 0.9, 0.9, 0.15, 0.9, '#9AA1A6');
    this.cyl('shiny', kx - 0.4, 1.04, kz1 - 0.9, 0.02, 0.3, '#C9CED2', 8);
    for (let k = 0; k < 8; k++) this.cyl('flat', kx + 0.25, 1.0 + k * 0.025, kz0 + 0.5, 0.13, 0.02, '#F7F7F2', 16);
    this.box('shiny', kx + 0.68, 1.75, kc, 0.04, 0.04, kl - 1, '#C9CED2');
    for (let k = 0; k < 6; k++) this.cylR('shiny', kx + 0.66, 1.55, kz0 + 1 + k * 1.6, 0.012, 0.36, '#C9CED2', 0, 0, 0, 6);
    this.box('shiny', kx + 0.2, 3.35, kc, 1.2, 0.45, kl + 0.4, '#AEB4B8', { bot: 'shiny' });
    this.box('shiny', kx + 0.2, 3.8, kz1 - 0.5, 0.45, 1.0, 0.45, '#AEB4B8');
    this._col(kx - 0.75, kz0 - 0.2, kx + 0.75, kz1 + 0.2);
    for (let k = 0; k < 2; k++) E.crowdSpots.push({ x: kx - 1.3, z: kz0 + 3 + k * 4, yaw: Math.PI / 2, mode: 'work', outfit: 'vendor' });
    // LPG cage outside the south-east corner of the hall
    const cx0 = hx1 + 2.5, cx1 = hx1 + 8.5, cz0 = -118, cz1 = -112;
    const ccx = (cx0 + cx1) / 2, ccz = (cz0 + cz1) / 2;
    this.box('concrete', ccx, 0, ccz, cx1 - cx0 + 0.6, 0.18, cz1 - cz0 + 0.6, '#C9C2B4');
    this._wFence([[cx0, cz0], [cx1, cz0], [cx1, cz1], [cx0, cz1]], 2.0, true, null);
    this.box('flat', ccx, 2.1, ccz, cx1 - cx0 + 0.4, 0.08, cz1 - cz0 + 0.4, '#8C949A');
    // 48 kg cylinders: glossy body, wrap-round label, foot ring, handle collar, regulator + flexible hose to the header
    this._plInit();
    for (let k = 0; k < 6; k++) {
      const z = cz0 + 1.2 + (k % 3) * 1.8, x = ccx - 1.3 + ((k / 3) | 0) * 2.6, side = x < ccx ? -1 : 1;
      this.cyl('whPaint', x, 0.18, z, 0.2, 0.12, '#2F3A44', 18);
      this.cyl('whPaint', x, 0.3, z, 0.19, 1.0, '#3E6FA8', 20);
      this.cyl('plLabL', x, 0.62, z, 0.193, 0.26, '#FFFFFF', 20);
      this.sph('whPaint', x, 1.3, z, 0.19, 0.12, 0.19, '#3E6FA8', 18);
      this.cyl('whPaint', x, 1.36, z, 0.13, 0.17, '#C9CED2', 16);
      this.cyl('shiny', x, 1.5, z, 0.04, 0.08, '#D4A64A', 8);
      this.cyl('whPaint', x + side * 0.06, 1.56, z, 0.05, 0.06, '#E0A21B', 10);
      this.tube('flat', [[x + side * 0.06, 1.62, z], [x + side * 0.4, 1.7, z], [ccx + side * 1.3, 1.75, z]], 0.018, '#1E1E1E', 6);
    }
    this._plGauge(ccx - 1.3, 2.0, cz1 - 0.55, Math.PI, 0.09);
    this._plValve(ccx - 1.3, 1.75, cz1 - 0.95, 'z', 0.035);
    this.box('whPaint', cx0 + 0.15, 1.2, cz1 - 0.05, 0.16, 0.22, 0.08, '#F4F4F2');
    this.box('glow', cx0 + 0.15, 1.36, cz1 - 0.005, 0.03, 0.03, 0.01, '#5CFF7A');
    this._sign('ไวไฟ · ห้ามใช้ไฟ', 1.4, 0.34, '#F7C51E', '#C62828', [ccx, 2.45, cz1 + 0.05], 0, { size: 0.6, border: '#C62828', both: true });
    this._plFlushDials(E.pl.screenMat);
    for (const dx of [-1.3, 1.3]) this.tube('shiny', [[ccx + dx, 1.75, cz0 + 0.6], [ccx + dx, 1.75, cz1 - 0.6]], 0.04, '#B87333', 8);
    this.tube('shiny', [[ccx - 1.3, 1.75, cz1 - 0.6], [ccx - 1.3, 1.75, cz1 + 0.8], [hx1 + 0.6, 1.75, kz0 - 0.8], [kx + 0.5, 1.75, kz0 - 0.4], [kx + 0.5, 1.1, kz0 + 0.5]], 0.035, '#B87333', 8);
    this._sign('ถังแก๊ส LPG 48 kg · ห้ามสูบบุหรี่', 3.4, 0.5, '#C62828', '#FFFFFF', [cx0 - 0.08, 2.5, ccz], -Math.PI / 2, { both: true });
    const v8 = [372.0, -115.0], l8 = [ccx, 0.9, ccz];
    this._stopAnchor(8, { view: v8, look: l8, guide: this._wGuideAt(v8, l8, -1.5, 1.6), pin: [ccx, 3.6, ccz], emit: [kx, 1.4, kz0 + 1.8], gas: ['CO2'], spread: 1.6, route: [[gx, -12], [gx, -20], [240, -40], [330, -62], [362, -86], [366.8, -92], [367, -97], [366.6, -115], v8], inside: null, district: 'school' });
  },

  // ------------------------------------------------------------- substation (stop 12) + transmission line
  _wInsul(A, x, y, z, h, col) {
    // porcelain post insulator: core, alternating large / small sheds, galvanised end caps; base at y
    this.cyl(A, x, y, z, 0.12, h, col, 8);
    let k = 0;
    for (let s = 0.18; s < h - 0.12; s += 0.13, k++) this.cyl(A, x, y + s, z, k % 2 ? 0.2 : 0.26, 0.035, col, 10);
    this.cyl('shiny', x, y, z, 0.17, 0.07, '#A7AEB2', 10);
    this.cyl('shiny', x, y + h - 0.07, z, 0.15, 0.07, '#A7AEB2', 10);
  },
  _wSubstation() {
    const E = this._E;
    const R = this._rng(9753);
    const STEEL = '#9AA3A8', POR = '#7A4E3A';
    const fx0 = 175, fx1 = 345, fz0 = -420, fz1 = -255;
    this._cvInit();
    this.plane('cvGravel', (fx0 + fx1) / 2, 0.07, (fz0 + fz1) / 2, fx1 - fx0, fz1 - fz0, '#ABA9A3');
    this.plane('concrete', 260, 0.11, -237, 10, 36, '#C7C2B8');
    this.plane('concrete', 250, 0.11, -300, 8, 90, '#C7C2B8');
    this._wFence([[fx0, fz0], [fx1, fz0], [fx1, fz1], [fx0, fz1]], 2.6, true, [[260, fz1, 4.2]]);
    // control building + sign
    this.box('plaster', 155, 0, -250, 30, 5.2, 24, '#ECE7DD', { topCol: '#C9C4BA' });
    this.box('flat', 155, 1.0, -237.95, 20, 1.6, 0.06, '#4E6878');
    this.box('flat', 147, 0, -237.94, 1.6, 2.4, 0.06, '#5B4636');
    this._sign('สถานีไฟฟ้าย่อยเมืองคาร์บอน', 14, 1.15, '#F4F4F0', '#1F3A5F', [155, 5.9, -237.9], 0, { border: '#F2C200' });
    this.box('flat', 155, 5.2, -250, 30.6, 0.4, 24.6, '#D7D2C8');
    this._col(140, -262, 170, -238);
    this._sign('อันตราย ไฟฟ้าแรงสูง', 3.0, 0.7, '#C62828', '#FFFFFF', [252, 1.6, fz1 + 0.05], 0, { both: true });
    // gantries (lattice) along two rows
    const lat = (A, x0, y0, z0, x1, y1, z1, w, col) => {
      // square lattice member between two points (4 chords + zigzag)
      const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
      const L = Math.hypot(dx, dy, dz);
      const n = Math.max(2, Math.round(L / 1.6));
      const vert = Math.abs(dy) > Math.abs(dx) + Math.abs(dz);
      const off = vert ? [[-w, 0, -w], [w, 0, -w], [w, 0, w], [-w, 0, w]] : (Math.abs(dx) > Math.abs(dz) ? [[0, -w, -w], [0, w, -w], [0, w, w], [0, -w, w]] : [[-w, -w, 0], [w, -w, 0], [w, w, 0], [-w, w, 0]]);
      for (const o of off) this.tube(A, [[x0 + o[0], y0 + o[1], z0 + o[2]], [x1 + o[0], y1 + o[1], z1 + o[2]]], 0.05, col, 4);
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n;
        const p = (t, o) => [x0 + dx * t + o[0], y0 + dy * t + o[1], z0 + dz * t + o[2]];
        this.tube(A, [p(t0, off[i % 2 ? 0 : 1]), p(t1, off[i % 2 ? 1 : 0])], 0.03, col, 4);
        this.tube(A, [p(t0, off[i % 2 ? 2 : 3]), p(t1, off[i % 2 ? 3 : 2])], 0.03, col, 4);
      }
    };
    const gx = [196, 238, 282, 324];
    for (const gz of [-398, -366]) {
      for (const x of gx) { lat('shiny', x, 0, gz, x, 14, gz, 0.35, STEEL); this.box('concrete', x, 0, gz, 1.4, 0.4, 1.4, '#C9C4BA'); this._col(x - 0.7, gz - 0.7, x + 0.7, gz + 0.7); }
      lat('shiny', gx[0], 13.4, gz, gx[3], 13.4, gz, 0.35, STEEL);
      for (const x of [217, 260, 303]) for (const s of [-3, 0, 3]) {
        this.cyl('flat', x + s, 11.2, gz, 0.07, 2.1, '#6E8F83', 8);
        E.wWire.push(x + s, 11.2, gz, x + s, 9.2, gz + 6);
      }
    }
    // busbars (tubes) between the gantry rows
    for (const s of [-1.6, 0, 1.6]) this.tube('shiny', [[200, 9.0, -382 + s], [320, 9.0, -382 + s]], 0.09, '#C9CFD3', 8);
    for (const x of [200, 230, 260, 290, 320]) { this.cyl('concrete', x, 0, -382, 0.3, 1.0, '#C9C4BA', 8); this.box('shiny', x, 1.0, -382, 0.35, 5.6, 0.35, STEEL); this._wInsul('whPaint', x, 6.6, -382, 2.3, POR); this._col(x - 0.4, -382.4, x + 0.4, -381.6); }
    // three bays: disconnector -> SF6 live-tank breaker -> CT -> transformer
    const bays = [218, 260, 302];
    for (const bx of bays) {
      for (const s of [-2.6, 0, 2.6]) {
        const x = bx + s;
        // disconnector
        this.box('shiny', x, 0, -360, 0.35, 3.2, 0.35, STEEL);
        this._wInsul('whPaint', x, 3.2, -361, 2.0, POR);
        this._wInsul('whPaint', x, 3.2, -359, 2.0, POR);
        this.box('shiny', x, 5.3, -360, 0.12, 0.12, 2.4, '#C9CFD3');
        // SF6 live-tank circuit breaker pole with its gas-density monitor (civic.js)
        this._cvBreakerPole(x, -340);
        // current transformer
        this.box('shiny', x, 0, -324, 0.35, 2.4, 0.35, STEEL);
        this.cyl('flat', x, 2.4, -324, 0.32, 1.4, '#8C9396', 12);
        this._wInsul('whPaint', x, 3.8, -324, 1.2, POR);
        // conductors
        E.wWire.push(x, 9.0, -366, x, 5.45, -361, x, 5.45, -359, x, 5.3, -340.88, x, 5.3, -339.12, x, 5.0, -324, x, 5.0, -324, x + (bx === 260 ? 0 : 0), 4.6, -306);
      }
      this._cvMechBox(bx, -340);
      this._col(bx - 3.4, -341, bx + 3.4, -338.6);
      this._col(bx - 3.4, -361.5, bx + 3.4, -358.5);
      this._col(bx - 3.4, -324.5, bx + 3.4, -323.5);
    }
    // power transformers (two) on oil-pit plinths, the path between them at x 250 (civic.js) + fire wall
    this._cvPowerXfmr(230, -300, 1, 1);
    this._cvPowerXfmr(290, -300, 2, -1);
    this.box('concrete', 260, 0, -300, 0.4, 7, 10, '#CFCAC0');
    this._col(259.7, -305, 260.3, -295);
    // 22 kV gas-insulated switchgear kiosk: door leaves, louvres, sign
    this.box('flat', 318, 0, -272, 14, 3.4, 5, '#D7DBD8', { topCol: '#B9BDBA' });
    this.box('flat', 318, 3.4, -272, 14.4, 0.12, 5.4, '#B9BDBA');
    for (let k = 0; k < 7; k++) {
      const x = 312 + k * 2;
      this.box('flat', x - 0.99, 0.1, -269.48, 0.02, 3.1, 0.02, '#9AA09C');
      this.box('shiny', x + 0.7, 1.4, -269.47, 0.04, 0.24, 0.04, '#D0D5D8');
      for (let j = 0; j < 4; j++) this.box('flat', x, 0.3 + j * 0.09, -269.485, 1.2, 0.03, 0.02, '#8C928E');
    }
    this._sign('สวิตช์เกียร์ 22 kV (ฉนวนก๊าซ SF₆)', 5.0, 0.42, '#1F3A5F', '#FFFFFF', [318, 2.85, -269.46], 0, { size: 0.5 });
    this._col(311, -274.5, 325, -269.5);
    // SF6 top-up: technician weighing the cylinder at the middle bay, hose to the gas port by the density monitor
    const cx = 263.2, cz = -336.6;
    this._cvSF6Cart(cx, cz, [260.13, 2.45, -339.76]);
    E.crowdSpots.push({ x: cx - 0.9, z: cz - 1.2, yaw: Math.atan2(260 - (cx - 0.9), -340 - (cz - 1.2)), mode: 'work', outfit: 'worker' });
    E.crowdSpots.push({ x: 160, z: -235, yaw: 0, mode: 'stand', outfit: 'worker' });
    this._sign('เติมก๊าซ SF₆ · ตรวจวัดการรั่ว', 3.2, 0.55, '#1F3A5F', '#FFFFFF', [cx + 1.9, 1.5, cz + 0.4], Math.atan2(255.5 - (cx + 1.9), -326 - (cz + 0.4)), { both: true });
    this.cyl('shiny', cx + 1.9, 0, cz + 0.4, 0.04, 1.25, '#8C949A', 6);
    const v12 = [255.6, -326.2], l12 = [260, 3.6, -340];
    this._stopAnchor(12, { view: v12, look: l12, guide: this._wGuideAt(v12, l12, -1.5, 1.6), pin: [260, 8.0, -340], emit: [260, 5.2, -340], gas: ['SF6'], spread: 1.6, route: [[260, -217.5], [260, -240], [260, -258], [250, -280], [250, -318], v12], inside: null, district: 'industry' });
    for (const p of [[150, -300], [150, -340], [150, -380], [150, -420], [370, -300], [370, -360], [370, -420], [200, -440], [320, -440]]) E.treeSpots.push({ x: p[0], z: p[1], s: 0.8 + R() * 0.4, kind: this._wPick(R, ['rain', 'teak', 'mango']) });
    this._cvFlush();
    // transmission line toward the power plant (north-west)
    this._wPylons();
  },
  _wPylons() {
    const E = this._E;
    const H = window.GHG3L.H;
    const STEEL = '#A7AFB4';
    const geo = this._wGeo('pylon', (A) => {
      const hw = (y) => (y <= 30 ? 4.2 - (3.0 * y) / 30 : 1.2);
      const lv = [0, 6, 12, 18, 24, 30, 38];
      const corner = (y, sx, sz) => [sx * hw(y), y, sz * hw(y)];
      const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let i = 0; i < lv.length - 1; i++) {
        const y0 = lv[i], y1 = lv[i + 1];
        for (let k = 0; k < 4; k++) {
          const a = C[k], b = C[(k + 1) % 4];
          this.tube(A, [corner(y0, a[0], a[1]), corner(y1, a[0], a[1])], 0.13, STEEL, 4);
          this.tube(A, [corner(y1, a[0], a[1]), corner(y1, b[0], b[1])], 0.06, STEEL, 4);
          this.tube(A, [corner(y0, a[0], a[1]), corner(y1, b[0], b[1])], 0.045, STEEL, 4);
          this.tube(A, [corner(y0, b[0], b[1]), corner(y1, a[0], a[1])], 0.045, STEEL, 4);
        }
      }
      for (const y of [26, 30, 34]) {
        const L = y === 30 ? 7.6 : 6.2;
        this.tube(A, [[-L, y, 0], [L, y, 0]], 0.08, STEEL, 4);
        for (const s of [-1, 1]) {
          this.tube(A, [[s * L, y, 0], [s * hw(y - 3), y - 3, -hw(y - 3)]], 0.05, STEEL, 4);
          this.tube(A, [[s * L, y, 0], [s * hw(y - 3), y - 3, hw(y - 3)]], 0.05, STEEL, 4);
          this.cyl(A, s * (L - 0.3), y - 2.6, 0, 0.1, 2.6, '#6E8F83', 8);
        }
      }
      this.tube(A, [[-1.2, 38, -1.2], [0, 41, 0], [1.2, 38, 1.2]], 0.06, STEEL, 4);
      this.tube(A, [[1.2, 38, -1.2], [0, 41, 0], [-1.2, 38, 1.2]], 0.06, STEEL, 4);
    }, 'shiny');
    const start = [262, -440], end = [-1380, -1220];
    const dx = end[0] - start[0], dz = end[1] - start[1];
    const L = Math.hypot(dx, dz);
    const yaw = Math.atan2(dx, dz) + Math.PI / 2;
    const n = Math.round(L / 240);
    const towers = [];
    for (let i = 0; i <= n; i++) {
      const x = start[0] + (dx * i) / n, z = start[1] + (dz * i) / n;
      const y = H(x, z);
      this._wStamp('shiny', geo, x, y, z, yaw);
      this._col(x - 4, z - 4, x + 4, z + 4);
      towers.push({ x: x, y: y, z: z });
    }
    // conductors: 6 phases + earth wire, sagging
    const offs = [[-6.2, 23.4], [6.2, 23.4], [-7.6, 27.4], [7.6, 27.4], [-6.2, 31.4], [6.2, 31.4], [0, 41]];
    const c = Math.cos(yaw), s = Math.sin(yaw);
    for (let i = 0; i < towers.length - 1; i++) {
      const a = towers[i], b = towers[i + 1];
      for (const o of offs) {
        const ax = a.x + o[0] * c, az = a.z - o[0] * s, bx = b.x + o[0] * c, bz = b.z - o[0] * s;
        let px = ax, py = a.y + o[1], pz = az;
        for (let k = 1; k <= 16; k++) {
          const t = k / 16;
          const nx = ax + (bx - ax) * t, nz = az + (bz - az) * t;
          const ny = a.y + o[1] + (b.y - a.y) * t - 7 * 4 * t * (1 - t);
          E.wWire.push(px, py, pz, nx, ny, nz);
          px = nx; py = ny; pz = nz;
        }
      }
    }
    // gantry -> first tower
    const t0 = towers[0];
    for (const o of offs.slice(0, 6)) E.wWire.push(260 + o[0] * 0.5, 13.0, -398, t0.x + o[0] * c, t0.y + o[1], t0.z - o[0] * s);
  }
});
/* GHG Town 3D v0.3 — world part 5: instanced trees (LOD + wind), vehicles (parked + traffic), crowd/animal feeds */
Object.assign(GHG3.world, {
  // ------------------------------------------------------------- trees
  _wFrond(A, base, yaw, len, droop, width, col) {
    // curved leaf as 4 quads per side (both-sided)
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const pts = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const r = len * t;
      const y = base[1] + len * 0.35 * t - droop * t * t * len;
      pts.push([base[0] + s * r, y, base[2] + c * r]);
    }
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const w0 = width * Math.sin(Math.PI * Math.min(1, (i) / 4 + 0.08)) + 0.02;
      const w1 = width * Math.sin(Math.PI * Math.min(1, (i + 1) / 4 - 0.02)) + 0.02;
      const a = pts[i], b = pts[i + 1];
      const px = c, pz = -s;
      void t;
      for (const sd of [-1, 1]) {
        const a2 = [a[0] + px * w0 * sd, a[1] - w0 * 0.25, a[2] + pz * w0 * sd];
        const b2 = [b[0] + px * w1 * sd, b[1] - w1 * 0.25, b[2] + pz * w1 * sd];
        if (sd > 0) this._quad(A, a, b, b2, a2, [0, 1, 0], [0, 0, 1, 1], col, true);
        else this._quad(A, a2, b2, b, a, [0, 1, 0], [0, 0, 1, 1], col, true);
      }
    }
  },
  // organic canopy (v0.8.1): a lumpy, smooth-shaded sphere, cached; seams welded so normals stay soft
  _wLumpGeo(hi) {
    const E = this._E;
    const T = E.T;
    E.wLump = E.wLump || {};
    const key = hi ? 'h' : 'l';
    if (E.wLump[key]) return E.wLump[key];
    const g = this._wWeld(new T.SphereGeometry(1, hi ? 16 : 7, hi ? 11 : 4));
    const P = g.attributes.position;
    const R = this._rng(hi ? 515 : 616);
    const bumps = [];
    for (let i = 0; i < (hi ? 11 : 7); i++) { const u = R() * 2 - 1, t = R() * Math.PI * 2, r = Math.sqrt(1 - u * u); bumps.push([Math.cos(t) * r, u, Math.sin(t) * r, 0.09 + R() * 0.12]); }
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      let s = 0.92;
      for (const b of bumps) { const d = x * b[0] + y * b[1] + z * b[2]; if (d > 0.55) s += b[3] * Math.pow((d - 0.55) / 0.45, 2); }
      P.setXYZ(i, x * s, (y < -0.25 ? y * 0.78 : y) * s, z * s);
    }
    g.computeVertexNormals();
    E.wLump[key] = g;
    return g;
  },
  _wWeld(g) {
    const T = this._E.T;
    const P = g.attributes.position;
    const map = new Map(), remap = new Array(P.count), pos = [];
    for (let i = 0; i < P.count; i++) {
      const k = Math.round(P.getX(i) * 1e4) + ',' + Math.round(P.getY(i) * 1e4) + ',' + Math.round(P.getZ(i) * 1e4);
      let j = map.get(k);
      if (j == null) { j = pos.length / 3; map.set(k, j); pos.push(P.getX(i), P.getY(i), P.getZ(i)); }
      remap[i] = j;
    }
    const src = g.index ? Array.from(g.index.array) : Array.from({ length: P.count }, (v, i) => i);
    const idx = [];
    for (let t = 0; t < src.length; t += 3) {
      const a = remap[src[t]], b = remap[src[t + 1]], c = remap[src[t + 2]];
      if (a !== b && b !== c && a !== c) idx.push(a, b, c);
    }
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    out.setIndex(idx);
    g.dispose();
    return out;
  },
  // canopy blob with baked light: shaded underneath, sunlit crown, a little leafy speckle
  _wBlob(A, x, y, z, sx, sy, sz, col, hi, spin) {
    const E = this._E;
    const T = E.T;
    const g = this._wLumpGeo(hi);
    if (!E._wbM) { E._wbM = new T.Matrix4(); E._wbN = new T.Matrix3(); E._wbQ = new T.Quaternion(); E._wbE = new T.Euler(); E._wbV = new T.Vector3(); E._wbS = new T.Vector3(); E._wbP = new T.Vector3(); }
    E._wbE.set(0, (spin || 0) * 2.39996, 0);
    E._wbQ.setFromEuler(E._wbE);
    E._wbM.compose(E._wbP.set(x, y, z), E._wbQ, E._wbS.set(sx, sy, sz));
    E._wbN.getNormalMatrix(E._wbM);
    const base = this._lc(col);
    const P = g.attributes.position, N = g.attributes.normal, I = g.index.array;
    const k0 = A.vc;
    const v = E._wbV;
    for (let i = 0; i < P.count; i++) {
      const ly = P.getY(i);
      v.set(P.getX(i), ly, P.getZ(i)).applyMatrix4(E._wbM);
      A.p.push(v.x, v.y, v.z);
      v.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(E._wbN).normalize();
      A.n.push(v.x, v.y, v.z);
      A.u.push(0, 0);
      const h = Math.max(0, Math.min(1, (ly + 0.9) / 1.8));
      const sp = 0.92 + 0.16 * (((i * 7919 + (spin || 0) * 104729) % 1000) / 1000);
      const f = (0.56 + 0.52 * h * h * (3 - 2 * h)) * sp;
      A.c.push(base[0] * f, base[1] * f, base[2] * f);
    }
    for (let t = 0; t < I.length; t++) A.i.push(k0 + I[t]);
    A.vc += P.count;
  },
  _wTreeGeo(kind, hi) {
    const R = this._rng(kind.length * 977 + (hi ? 1 : 2));
    let bn = 0;
    const blob = (A, x, y, z, sx, sy, sz, col) => this._wBlob(A, x, y, z, sx, sy, sz, col, hi, ++bn);
    const trunk = (A, h, r, col) => { this.cyl(A, 0, 0, 0, r, h * 0.55, col, hi ? 8 : 5); this.cyl(A, 0, h * 0.55, 0, r * 0.72, h * 0.45, col, hi ? 8 : 5); };
    const G = ['#4A7A2F', '#56853A', '#3F6B29', '#5F8E40', '#4F7F33'];
    return this._bake((A) => {
      if (kind === 'rain' || kind === 'flame') {
        trunk(A, 5.2, 0.42, '#5B4636');
        if (hi) for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.4; this.tube(A, [[0, 4.2, 0], [Math.sin(a) * 2.6, 6.6, Math.cos(a) * 2.6]], 0.17, '#5B4636', 6); }
        const n = hi ? 8 : 3;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + R() * 0.5;
          const rr = hi ? 3.0 + R() * 1.4 : 3.6;
          const col = kind === 'flame' && R() < 0.45 ? this._wPick(R, ['#C4553A', '#B8492F', '#D0663F']) : this._wPick(R, G);
          blob(A, Math.sin(a) * rr, 7.2 + R() * 1.0, Math.cos(a) * rr, hi ? 2.5 + R() * 0.8 : 3.4, hi ? 1.5 + R() * 0.5 : 1.9, hi ? 2.5 + R() * 0.8 : 3.4, col);
        }
        blob(A, 0, 8.3, 0, 3.8, 2.1, 3.8, kind === 'flame' ? '#B9573A' : this._wPick(R, G));
        if (hi) blob(A, (R() - 0.5) * 2, 9.0, (R() - 0.5) * 2, 2.4, 1.4, 2.4, this._wPick(R, G));
      } else if (kind === 'mango' || kind === 'golden') {
        trunk(A, 2.6, 0.26, '#5A4535');
        const n = hi ? 6 : 2;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + R() * 0.4;
          blob(A, Math.sin(a) * 1.5, 3.8 + R() * 0.8, Math.cos(a) * 1.5, hi ? 1.7 + R() * 0.5 : 2.3, hi ? 1.5 + R() * 0.4 : 2.0, hi ? 1.7 + R() * 0.5 : 2.3, kind === 'golden' && R() < 0.5 ? this._wPick(R, ['#D9B12E', '#E3BF3A']) : this._wPick(R, ['#3F6B2A', '#4A7531', '#365F25', '#527D36']));
        }
        blob(A, 0, 5.0, 0, 2.2, 1.9, 2.2, kind === 'golden' ? '#DDB733' : '#43702D');
      } else if (kind === 'palm') {
        const pts = [];
        const lean = 0.6 + R() * 0.6;
        for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push([lean * t * t * 1.6, t * 10.5, 0]); }
        if (hi) this.tube(A, pts, 0.17, '#7A6650', 7); else this.tube(A, [pts[0], pts[3], pts[5]], 0.17, '#7A6650', 5);
        const top = pts[5];
        const nf = hi ? 11 : 6;
        for (let k = 0; k < nf; k++) this._wFrond(A, [top[0], top[1], top[2]], (k / nf) * Math.PI * 2 + R() * 0.3, 3.4 + R() * 0.6, 0.55 + R() * 0.2, 0.42, this._wPick(R, ['#4C7A2E', '#5C8B36', '#3F6E27']));
        if (hi) for (let k = 0; k < 4; k++) this.sph(A, top[0] + Math.sin(k * 1.6) * 0.3, top[1] - 0.45, top[2] + Math.cos(k * 1.6) * 0.3, 0.22, 0.24, 0.22, '#7C6A2A', 8);
      } else if (kind === 'banana') {
        this.cyl(A, 0, 0, 0, 0.14, 2.1, '#6E8A3C', 7);
        const nf = hi ? 7 : 4;
        for (let k = 0; k < nf; k++) this._wFrond(A, [0, 2.0, 0], (k / nf) * Math.PI * 2 + R(), 1.9, 0.35, 0.42, this._wPick(R, ['#6FA23A', '#7DB343', '#5E9133']));
      } else if (kind === 'bush') {
        const n = hi ? 3 : 1;
        for (let k = 0; k < n; k++) blob(A, (k - 1) * 0.6, 0.65, (R() - 0.5) * 0.5, 0.95, 0.75, 0.95, this._wPick(R, ['#3F6E2C', '#4B7B33', '#56873A']));
      } else if (kind === 'teak') {
        trunk(A, 9, 0.3, '#6B5A48');
        const n = hi ? 4 : 2;
        for (let k = 0; k < n; k++) blob(A, Math.sin(k * 2.1) * 1.2, 9.6 + k * 1.3, Math.cos(k * 2.1) * 1.2, 2.5, 2.6, 2.5, this._wPick(R, ['#5D7F34', '#6A8C3B', '#566F30']));
      } else if (kind === 'bamboo') {
        const n = hi ? 12 : 6;
        for (let k = 0; k < n; k++) {
          const a = R() * 6.28, r = R() * 0.9, h = 7 + R() * 3;
          const lx = Math.sin(a) * (r + 1.4), lz = Math.cos(a) * (r + 1.4);
          this.tube(A, [[Math.sin(a) * r, 0, Math.cos(a) * r], [lx, h, lz]], 0.06, '#8CA34A', 5);
          blob(A, lx, h - 0.4, lz, 1.0, 1.3, 1.0, this._wPick(R, ['#7FA642', '#8CB24C', '#6E9638']));
        }
      } else if (kind === 'dipterocarp') {
        trunk(A, 20, 0.55, '#7A6A5A');
        const n = hi ? 4 : 2;
        for (let k = 0; k < n; k++) blob(A, Math.sin(k * 1.7) * 2.6, 20.5 + (k % 2) * 1.6, Math.cos(k * 1.7) * 2.6, 3.8, 2.4, 3.8, this._wPick(R, ['#45702C', '#527C33', '#3E6627']));
      } else {
        trunk(A, 3, 0.28, '#5A4535');
        blob(A, 0, 4.4, 0, 2.6, 2.3, 2.6, '#4A7531');
      }
    });
  },
  _wTrees() {
    const E = this._E;
    const T = E.T;
    const H = window.GHG3L.H;
    const kinds = {};
    const known = ['rain', 'flame', 'mango', 'golden', 'palm', 'banana', 'bush', 'teak', 'bamboo', 'dipterocarp'];
    const R = this._rng(4711);
    for (const s of E.treeSpots) {
      const k = known.indexOf(s.kind) >= 0 ? s.kind : 'mango';
      (kinds[k] = kinds[k] || []).push(s);
    }
    E.wTreeTime = { value: 0 };
    const mat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, side: T.DoubleSide });
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = E.wTreeTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', [
        '#include <begin_vertex>',
        '#ifdef USE_INSTANCING',
        '  float ph = instanceMatrix[3].x * 0.05 + instanceMatrix[3].z * 0.07;',
        '  float k = max(position.y - 2.0, 0.0) * 0.014;',
        '  transformed.x += sin(uTime * 1.3 + ph) * k;',
        '  transformed.z += cos(uTime * 1.05 + ph * 1.3) * k * 0.8;',
        '#endif'
      ].join('\n'));
    };
    E.wTreeSets = [];
    const M = new T.Matrix4(), Q = new T.Quaternion(), S = new T.Vector3(), P = new T.Vector3(), Y = new T.Vector3(0, 1, 0);
    for (const k in kinds) {
      const list = kinds[k];
      const n = list.length;
      const mats = new Float32Array(n * 16), cols = new Float32Array(n * 3), pos = new Float32Array(n * 2);
      list.forEach((s, i) => {
        const sc = (s.s || 1) * (0.88 + R() * 0.24);
        const y = s.y != null ? s.y : H(s.x, s.z);
        Q.setFromAxisAngle(Y, R() * Math.PI * 2);
        M.compose(P.set(s.x, y, s.z), Q, S.set(sc, sc * (0.92 + R() * 0.16), sc));
        M.toArray(mats, i * 16);
        const v = 0.86 + R() * 0.22;
        cols[i * 3] = v * (0.95 + R() * 0.08); cols[i * 3 + 1] = v; cols[i * 3 + 2] = v * (0.9 + R() * 0.1);
        pos[i * 2] = s.x; pos[i * 2 + 1] = s.z;
      });
      const mk = (geo) => {
        const im = new T.InstancedMesh(geo, mat, n);
        im.instanceColor = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3);
        im.castShadow = true;
        im.receiveShadow = true;
        im.frustumCulled = false;
        im.count = 0;
        this._addDyn(im);
        return im;
      };
      const set = { kind: k, n: n, mats: mats, cols: cols, pos: pos, hi: mk(this._wTreeGeo(k, true)), lo: mk(this._wTreeGeo(k, false)) };
      set.lo.castShadow = false;
      E.wTreeSets.push(set);
    }
    E.wTreeT = 0;
    this._wTreeLOD(true);
    this._anim((dt, t) => {
      E.wTreeTime.value = t;
      E.wTreeT -= dt;
      if (E.wTreeT <= 0) { E.wTreeT = 0.5; this._wTreeLOD(false); }
    });
  },
  _wTreeLOD(force) {
    const E = this._E;
    const cp = E.cam.position;
    const near = E.cam.position.y > 160 ? 0 : 115;
    const n2 = near * near;
    const farD = E.cam.position.y > 160 ? 1e6 : Math.max(600, (E.scene.fog ? E.scene.fog.far : 1700) * 0.85);
    const f2 = farD * farD;
    if (!force && E.wTreeLast && Math.hypot(cp.x - E.wTreeLast.x, cp.z - E.wTreeLast.z) < 6 && Math.abs(cp.y - E.wTreeLast.y) < 30) return;
    E.wTreeLast = { x: cp.x, y: cp.y, z: cp.z };
    for (const set of E.wTreeSets) {
      const hm = set.hi.instanceMatrix.array, lm = set.lo.instanceMatrix.array;
      const hc = set.hi.instanceColor.array, lc = set.lo.instanceColor.array;
      let nh = 0, nl = 0;
      for (let i = 0; i < set.n; i++) {
        const dx = set.pos[i * 2] - cp.x, dz = set.pos[i * 2 + 1] - cp.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < n2) {
          hm.set(set.mats.subarray(i * 16, i * 16 + 16), nh * 16);
          hc.set(set.cols.subarray(i * 3, i * 3 + 3), nh * 3);
          nh++;
        } else if (d2 < f2) {
          lm.set(set.mats.subarray(i * 16, i * 16 + 16), nl * 16);
          lc.set(set.cols.subarray(i * 3, i * 3 + 3), nl * 3);
          nl++;
        }
      }
      set.hi.count = nh; set.lo.count = nl;
      set.hi.instanceMatrix.needsUpdate = true; set.lo.instanceMatrix.needsUpdate = true;
      set.hi.instanceColor.needsUpdate = true; set.lo.instanceColor.needsUpdate = true;
    }
  },

  // ------------------------------------------------------------- vehicles
  _wVehGeo(kind, color) {
    const E = this._E;
    const key = 'veh_' + kind + '_' + color;
    if (E.wGeoC[key]) return E.wGeoC[key];
    const GL = '#26343D', TY = '#1B1B1B', HUB = '#B9BEC3', DK = '#2B2B2B';
    const R = this._rng(key.length * 131 + color.charCodeAt(1) * 7);
    const wheel = (A, x, y, z, r, w) => { this.cylR(A, x, y, z, r, w, TY, 0, 0, Math.PI / 2, 14); this.cylR(A, x + Math.sign(x) * 0.02, y, z, r * 0.58, w + 0.02, HUB, 0, 0, Math.PI / 2, 10); };
    // greenhouse (v0.8.1): sloped windscreen / rear window and side glass from the beltline (yb) up to the roof (yt)
    const cabin = (A, zb0, zb1, zt0, zt1, yb, yt, wb, wt, roof) => {
      const B = [[-wb, yb, zb0], [wb, yb, zb0], [wb, yb, zb1], [-wb, yb, zb1]];
      const U = [[-wt, yt, zt0], [wt, yt, zt0], [wt, yt, zt1], [-wt, yt, zt1]];
      const ctr = [0, (yb + yt) / 2, (zb0 + zb1 + zt0 + zt1) / 4];
      const nrm = (a, b, c) => {
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], l = Math.hypot(n[0], n[1], n[2]) || 1;
        return [n[0] / l, n[1] / l, n[2] / l];
      };
      const q = (a, b, c, d, col) => {
        let n = nrm(a, b, c);
        const f = [(a[0] + b[0] + c[0] + d[0]) / 4 - ctr[0], (a[1] + b[1] + c[1] + d[1]) / 4 - ctr[1], (a[2] + b[2] + c[2] + d[2]) / 4 - ctr[2]];
        if (n[0] * f[0] + n[1] * f[1] + n[2] * f[2] < 0) { const t = a; a = b; b = t; const t2 = c; c = d; d = t2; n = nrm(a, b, c); }
        this._quad(A, a, b, c, d, n, [0, 0, 1, 1], col, false);
      };
      q(B[2], B[3], U[3], U[2], GL);
      q(B[0], B[1], U[1], U[0], GL);
      q(B[1], B[2], U[2], U[1], GL);
      q(B[3], B[0], U[0], U[3], GL);
      q(U[0], U[1], U[2], U[3], roof);
    };
    const lights = (A, w, yh, zf, zr) => {
      for (const s of [-1, 1]) {
        this.box(A, s * (w / 2 - 0.25), yh, zf, 0.34, 0.14, 0.04, '#F4F6F7');
        this.box(A, s * (w / 2 - 0.22), yh + 0.05, zr, 0.3, 0.14, 0.04, '#B3261E');
      }
    };
    const rider = (A, y0, z0) => {
      const shirt = this._wPick(R, ['#1565C0', '#E65100', '#2E7D32', '#FFFFFF', '#6A1B9A', '#C62828', '#37474F']);
      const helm = this._wPick(R, ['#FFFFFF', '#212121', '#C62828', '#F9A825', '#1565C0']);
      this.box(A, 0, y0 + 0.05, z0 - 0.05, 0.4, 0.58, 0.24, shirt);
      this.sph(A, 0, y0 + 0.82, z0, 0.15, 0.17, 0.16, helm, 7);
      this.box(A, 0, y0 + 0.78, z0 + 0.12, 0.2, 0.1, 0.06, '#1E2A30');
      for (const s of [-1, 1]) {
        this.boxR(A, s * 0.2, y0 + 0.35, z0 + 0.28, 0.09, 0.09, 0.5, shirt, -0.5, 0, 0);
        this.boxR(A, s * 0.13, y0 - 0.15, z0 + 0.25, 0.13, 0.13, 0.55, '#2F3640', 0.3, 0, 0);
        this.box(A, s * 0.13, y0 - 0.62, z0 + 0.48, 0.12, 0.45, 0.13, '#2F3640');
      }
    };
    const geo = this._bake((A) => {
      if (kind === 'car' || kind === 'van') {
        const van = kind === 'van';
        const L = van ? 4.9 : 4.5, W = van ? 1.85 : 1.76;
        this.box(A, 0, 0.3, 0, W, 0.54, L - 0.12, color, { noAO: true });
        this.box(A, 0, 0.27, L / 2 - 0.1, W - 0.04, 0.32, 0.22, DK, { noAO: true });
        this.box(A, 0, 0.27, -L / 2 + 0.1, W - 0.04, 0.32, 0.22, DK, { noAO: true });
        if (van) cabin(A, -L / 2 + 0.12, 1.5, -L / 2 + 0.2, 0.95, 0.84, 1.94, W / 2 - 0.04, W / 2 - 0.1, color);
        else cabin(A, -1.45, 1.05, -0.95, 0.32, 0.84, 1.42, W / 2 - 0.06, W / 2 - 0.17, color);
        lights(A, W, 0.66, L / 2 - 0.0, -L / 2 + 0.0);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheel(A, sx * (W / 2 - 0.05), 0.32, sz * (L / 2 - 0.85), 0.32, 0.22);
        for (const s of [-1, 1]) this.box(A, s * (W / 2 + 0.06), 0.96, van ? 1.35 : 0.98, 0.1, 0.1, 0.16, color, { noAO: true });
      } else if (kind === 'pickup' || kind === 'song') {
        const L = 5.3, W = 1.85;
        this.box(A, 0, 0.38, 0, W, 0.62, L, color, { noAO: true });
        cabin(A, 0.12, 1.75, 0.35, 1.22, 1.0, 1.66, W / 2 - 0.07, W / 2 - 0.13, color);
        for (const s of [-1, 1]) this.box(A, s * (W / 2 - 0.05), 1.0, -1.25, 0.08, 0.36, 2.7, color);
        this.box(A, 0, 1.0, -2.6, W - 0.1, 0.36, 0.08, color);
        this.box(A, 0, 0.32, L / 2 - 0.05, W - 0.06, 0.28, 0.12, DK);
        lights(A, W, 0.8, L / 2, -L / 2);
        for (const sx of [-1, 1]) for (const sz of [-1.6, 1.65]) wheel(A, sx * (W / 2 - 0.05), 0.38, sz, 0.38, 0.26);
        if (kind === 'song') {
          for (const sx of [-1, 1]) for (const sz of [-2.55, -0.1]) this.box(A, sx * 0.86, 1.0, sz, 0.07, 1.25, 0.07, '#D9D9D9');
          this.box(A, 0, 2.25, -1.3, W + 0.04, 0.1, 2.75, color);
          for (const sx of [-1, 1]) this.box(A, sx * 0.55, 1.0, -1.3, 0.35, 0.3, 2.4, '#7A5233');
          this.box(A, 0, 2.35, -1.3, W - 0.3, 0.12, 2.4, '#F2F2F2');
        }
      } else if (kind === 'moto' || kind === 'motoP') {
        // underbone step-through (v1.2): tyres, alloy rims, fork, handlebar cowl with headlight + mirrors, leg shield,
        // frame tunnel, engine, swingarm, shocks, exhaust, rounded tail under the seat, tail light + plate
        const BK2 = '#26292C', MET = '#9AA0A5', CHR = '#C9CED2';
        for (const z of [-0.62, 0.62]) {
          this.cylR(A, 0, 0.29, z, 0.29, 0.085, TY, 0, 0, Math.PI / 2, 12);
          this.cylR(A, 0, 0.29, z, 0.2, 0.092, MET, 0, 0, Math.PI / 2, 8);
          this.cylR(A, 0, 0.29, z, 0.06, 0.14, CHR, 0, 0, Math.PI / 2, 6);
        }
        for (const s of [-1, 1]) this.boxR(A, s * 0.075, 0.585, 0.535, 0.04, 0.62, 0.04, CHR, -0.28, 0, 0);
        this.boxR(A, 0, 0.61, 0.66, 0.12, 0.025, 0.36, color, 0.1, 0, 0);
        this.sph(A, 0, 0.98, 0.47, 0.17, 0.1, 0.16, color, 8);
        this.box(A, 0, 0.93, 0.61, 0.16, 0.08, 0.03, '#F4F6F7');
        this.box(A, 0, 0.99, 0.43, 0.66, 0.03, 0.03, BK2);
        for (const s of [-1, 1]) { this.boxR(A, s * 0.245, 1.14, 0.42, 0.015, 0.24, 0.015, BK2, 0, 0, -s * 0.2); this.box(A, s * 0.28, 1.24, 0.41, 0.11, 0.07, 0.02, BK2); }
        this.boxR(A, 0, 0.7, 0.4, 0.34, 0.55, 0.1, color, -0.3, 0, 0);
        this.boxR(A, 0, 0.615, 0.18, 0.18, 0.14, 0.52, color, -0.69, 0, 0);
        this.box(A, 0, 0.3, 0.0, 0.52, 0.025, 0.04, BK2);
        this.box(A, 0, 0.12, 0.0, 0.22, 0.24, 0.32, '#3A3E42');
        this.boxR(A, 0, 0.32, 0.17, 0.16, 0.12, 0.16, '#55595D', 0.5, 0, 0);
        this.box(A, -0.12, 0.18, -0.02, 0.04, 0.16, 0.2, MET);
        for (const s of [-1, 1]) { this.box(A, s * 0.09, 0.25, -0.33, 0.035, 0.05, 0.6, BK2); this.boxR(A, s * 0.11, 0.48, -0.515, 0.04, 0.34, 0.04, CHR, 0.35, 0, 0); }
        this.sph(A, 0, 0.68, -0.42, 0.16, 0.13, 0.44, color, 8);
        this.box(A, 0, 0.42, -0.3, 0.24, 0.2, 0.45, color);
        this.sph(A, 0, 0.82, -0.32, 0.14, 0.055, 0.36, '#1E1E1E', 8);
        this.box(A, 0, 0.66, -0.86, 0.16, 0.07, 0.04, '#B3261E');
        this.box(A, 0, 0.44, -0.88, 0.2, 0.12, 0.012, '#F4F4F0');
        this.boxR(A, 0, 0.56, -0.74, 0.12, 0.025, 0.32, BK2, -0.35, 0, 0);
        this.tube(A, [[0.08, 0.2, 0.12], [0.14, 0.2, -0.2]], 0.022, '#3A3E42', 6);
        this.cylR(A, 0.15, 0.27, -0.5, 0.05, 0.42, '#2B2E31', Math.PI / 2 + 0.12, 0, 0, 8);
        this.box(A, 0.2, 0.22, -0.48, 0.02, 0.07, 0.3, CHR);
        if (kind === 'moto') rider(A, 0.95, -0.22);
        else this.box(A, 0, 0.2, -0.35, 0.06, 0.35, 0.06, '#3B3F42');
      } else if (kind === 'tuk') {
        this.box(A, 0, 0.3, 0.2, 1.3, 0.55, 2.6, color);
        this.box(A, 0, 0.85, -0.5, 1.3, 0.55, 1.2, '#7A1E1E');
        this.box(A, 0, 1.92, -0.1, 1.42, 0.1, 2.5, color);
        this.box(A, 0, 1.82, -0.1, 1.46, 0.1, 2.54, '#F2C200');
        for (const sx of [-1, 1]) for (const sz of [-1.1, 0.9]) this.box(A, sx * 0.66, 0.85, sz, 0.06, 1.0, 0.06, '#C9CED2');
        this.box(A, 0, 0.85, 1.25, 1.1, 0.7, 0.06, GL);
        this.cylR(A, 0, 0.3, 1.35, 0.27, 0.16, TY, 0, 0, Math.PI / 2, 12);
        for (const sx of [-1, 1]) this.cylR(A, sx * 0.62, 0.3, -0.9, 0.27, 0.16, TY, 0, 0, Math.PI / 2, 12);
        this.box(A, 0, 0.7, 1.52, 0.3, 0.14, 0.04, '#F4F6F7');
        for (const sx of [-1, 1]) this.box(A, sx * 0.55, 0.62, -1.12, 0.22, 0.12, 0.04, '#B3261E');
        rider(A, 0.95, 0.6);
      } else if (kind === 'bus') {
        const L = 11.2, W = 2.5;
        this.box(A, 0, 0.45, 0, W, 2.75, L, color);
        this.box(A, 0, 1.55, 0.1, W + 0.04, 1.1, L - 1.6, GL);
        this.box(A, 0, 1.2, L / 2 - 0.02, W - 0.2, 1.6, 0.06, GL);
        this.box(A, 0, 3.2, 0, W - 0.1, 0.12, L - 0.2, '#E8E8E8');
        this.box(A, 0, 2.85, L / 2 + 0.03, 1.6, 0.3, 0.04, '#F7B731');
        lights(A, W, 0.85, L / 2 + 0.01, -L / 2 - 0.01);
        for (const sx of [-1, 1]) for (const sz of [-3.6, 3.7]) wheel(A, sx * (W / 2 - 0.08), 0.5, sz, 0.5, 0.32);
      } else if (kind === 'truck') {
        const W = 2.35;
        this.box(A, 0, 0.55, 2.4, W, 2.25, 1.9, color === '#F2F2F2' ? '#2E6DB5' : color);
        this.box(A, 0, 1.6, 3.36, W - 0.2, 0.85, 0.06, GL);
        this.box(A, 0, 0.5, -1.05, W, 0.3, 5.2, '#3B3F42');
        this.box(A, 0, 0.8, -1.05, W + 0.06, 2.6, 5.0, color === '#F2F2F2' ? '#F2F2F2' : '#EDEDED');
        lights(A, W, 0.85, 3.36, -3.6);
        for (const sx of [-1, 1]) { wheel(A, sx * (W / 2 - 0.1), 0.48, 2.3, 0.48, 0.3); wheel(A, sx * (W / 2 - 0.1), 0.48, -2.3, 0.48, 0.3); wheel(A, sx * (W / 2 - 0.1), 0.48, -3.3, 0.48, 0.3); }
      } else if (kind === 'tractor') {
        this.box(A, 0, 0.6, 0.5, 0.9, 0.7, 1.8, color);
        this.box(A, 0, 1.3, -0.4, 0.5, 0.15, 0.5, '#1E1E1E');
        this.cyl(A, 0.25, 1.3, 1.1, 0.05, 0.9, '#3B3F42', 6);
        for (const sx of [-1, 1]) { this.cylR(A, sx * 0.75, 0.7, -0.5, 0.7, 0.35, TY, 0, 0, Math.PI / 2, 14); this.cylR(A, sx * 0.55, 0.4, 1.2, 0.4, 0.22, TY, 0, 0, Math.PI / 2, 12); }
        rider(A, 1.45, -0.35);
      }
    });
    E.wGeoC[key] = geo;
    return geo;
  },
  _wVehDims(kind) {
    return { car: [1.8, 4.5], van: [1.9, 4.9], pickup: [1.9, 5.3], song: [1.9, 5.3], moto: [0.7, 1.9], motoP: [0.7, 1.9], tuk: [1.4, 3.0], bus: [2.5, 11.2], truck: [2.4, 7.4], tractor: [1.6, 3.2] }[kind] || [1.8, 4.5];
  },
  _wParked() {
    const E = this._E;
    const H = window.GHG3L.H;
    for (const p of E.parkSpots) {
      const kind = ['car', 'van', 'pickup', 'song', 'moto', 'tuk', 'bus', 'truck', 'tractor'].indexOf(p.kind) >= 0 ? p.kind : 'car';
      const geo = this._wVehGeo(kind === 'moto' ? 'motoP' : kind, p.color || '#F2F2F2');
      const y = p.y != null ? p.y : H(p.x, p.z) + 0.04;
      this._wStamp('flat', geo, p.x, y, p.z, p.yaw || 0);
      if (p.y == null || p.y < 0.5) {
        const d = this._wVehDims(kind);
        this._colBox(p.x, p.z, d[0], d[1], p.yaw || 0, kind === 'moto' ? -0.05 : 0.05);
      }
    }
  },

  // ------------------------------------------------------------- traffic
  _wTrafficInit() {
    const E = this._E;
    const T = E.T;
    const G = E.wG;
    if (!G) return;
    const R = this._rng(24680);
    const types = [['car', 30], ['moto', 28], ['pickup', 15], ['tuk', 6], ['song', 6], ['truck', 6], ['bus', 3], ['van', 6]];
    const tot = types.reduce((a, t) => a + t[1], 0);
    const pickType = () => { let r = R() * tot; for (const t of types) { if ((r -= t[1]) < 0) return t[0]; } return 'car'; };
    const colors = {
      car: ['#F2F2F2', '#B9BEC3', '#2B2F33', '#8E1F1F', '#1F3F7A', '#D9D9D9', '#5B6770'],
      pickup: ['#F2F2F2', '#B9BEC3', '#2B2F33', '#7A8188', '#1F3F7A'],
      van: ['#F2F2F2', '#D9D9D9'],
      moto: ['#C62828', '#1565C0', '#212121', '#ECEFF1', '#2E7D32', '#F9A825'],
      tuk: ['#1F7A8C', '#2E7D32', '#1565C0'],
      song: ['#C62828', '#1565C0', '#F2F2F2'],
      truck: ['#F2F2F2', '#C0392B', '#2E6DB5'],
      bus: ['#E8743B', '#2F6DB5']
    };
    const edges = G.edges.filter((e) => e.len > 30);
    const inCity = (e) => Math.max(e.a.x, e.b.x) > -760 && Math.min(e.a.x, e.b.x) < 640 && Math.abs(e.a.z) < 470 && Math.abs(e.b.z) < 470;
    const wgt = (e) => e.len * (e.road.rural ? 0.12 : 1) * (inCity(e) ? (e.road.id === 'A' ? 2.4 : 1) : 0.15);
    const totLen = edges.reduce((a, e) => a + wgt(e), 0);
    const pickEdge = () => { let r = R() * totLen; for (const e of edges) { if ((r -= wgt(e)) < 0) return e; } return edges[0]; };
    E.wCars = [];
    const N = 70;
    for (let i = 0; i < N; i++) {
      const kind = pickType();
      const color = this._wPick(R, colors[kind]);
      const mesh = new T.Mesh(this._wVehGeo(kind, color), E.mats.flat);
      mesh.castShadow = true;
      this._addDyn(mesh);
      let e = null, dir = 1, s = 0, lane = 0;
      for (let tries = 0; tries < 30; tries++) {
        e = pickEdge();
        dir = R() < 0.5 ? 1 : -1;
        lane = e.road.id === 'A' ? ((kind === 'moto' || kind === 'truck' || kind === 'bus' || kind === 'tuk') ? 1 : (R() < 0.5 ? 0 : 1)) : 0;
        s = 20 + R() * Math.max(1, e.len - 40);
        const ok = !E.wCars.some((c) => c.e === e && c.dir === dir && c.lane === lane && Math.abs(c.s - s) < 14);
        if (ok) break;
      }
      const vmax = { car: 12, moto: 12.5, pickup: 11.5, tuk: 8.5, song: 9.5, truck: 9, bus: 8.5, van: 11 }[kind] * (0.85 + R() * 0.3);
      const d = this._wVehDims(kind);
      E.wCars.push({ kind: kind, mesh: mesh, e: e, dir: dir, lane: lane, s: s, v: vmax * 0.6, vmax: vmax, len: d[1], wid: d[0], turn: null, x: 0, z: 0, hx: 0, hz: 1 });
    }
    // head / tail light glow points
    const mkPts = (col, size) => {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 2 * 3), 3));
      const p = new T.Points(g, new T.PointsMaterial({ map: E.tex.glow, color: this._lcol(col), size: size, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
      p.frustumCulled = false;
      this._addDyn(p);
      return p;
    };
    E.wHead = mkPts('#FFF2D6', 1.5);
    E.wTail = mkPts('#FF3B2F', 0.9);
    E.wTLt = 0;
    this._tickTraffic(0.001);
  },
  _wLaneOff(road, lane) {
    if (road.id === 'A') return lane ? 7.6 : 3.4;
    return road.w / 4;
  },
  _wLight(n, axis) {
    const t = ((this._E.time + n.phase * 40) % 40 + 40) % 40;
    if (axis === 'h') return t < 17 ? 'g' : (t < 20 ? 'y' : 'r');
    if (t < 21) return 'r';
    return t < 37 ? 'g' : (t < 40 ? 'y' : 'r');
  },
  _wEdgePos(c, e, dir, s) {
    const S = dir > 0 ? e.a : e.b;
    const dx = e.dx * dir, dz = e.dz * dir;
    const lo = this._wLaneOff(e.road, c.lane);
    return [S.x + dx * s + dz * lo, S.z + dz * s - dx * lo, dx, dz];
  },
  _wPlanTurn(c) {
    const e = c.e;
    const N = c.dir > 0 ? e.b : e.a;
    const clrN = (N.clr[e.road.id] || 0) + 1.0;
    const p0 = this._wEdgePos(c, e, c.dir, e.len - clrN);
    let opts = N.edges.filter((x) => x !== e);
    const R = Math.random;
    let e2;
    if (!opts.length) e2 = e;
    else {
      const straight = opts.filter((x) => x.road === e.road);
      if (straight.length && R() < 0.55) e2 = straight[0];
      else e2 = opts[(R() * opts.length) | 0];
    }
    const dir2 = e2 === e ? -c.dir : (e2.a === N ? 1 : -1);
    const lane2 = e2.road.id === 'A' ? (c.kind === 'moto' || c.kind === 'truck' || c.kind === 'bus' || c.kind === 'tuk' ? 1 : (e.road.id === 'A' ? c.lane : 1)) : 0;
    const S2 = dir2 > 0 ? e2.a : e2.b;
    const clr2 = (S2.clr[e2.road.id] || 0) + 1.0;
    const cc = { lane: lane2 };
    const p2 = this._wEdgePos(cc, e2, dir2, e2 === e ? Math.max(4, e.len - clrN) : clr2);
    if (e2 === e) {
      // U-turn at a dead end: swing around the end
      const p2u = this._wEdgePos(cc, e, dir2, clr2 + 0.5);
      p2[0] = p2u[0]; p2[1] = p2u[1]; p2[2] = p2u[2]; p2[3] = p2u[3];
    }
    const d0 = [p0[2], p0[3]], d2 = [p2[2], p2[3]];
    const cr = d0[0] * d2[1] - d0[1] * d2[0];
    let p1;
    if (Math.abs(cr) > 0.3) {
      // intersection of p0 + a*d0 and p2 - b*d2
      const rx = p2[0] - p0[0], rz = p2[1] - p0[1];
      const a = (rx * d2[1] - rz * d2[0]) / cr;
      p1 = [p0[0] + d0[0] * a, p0[1] + d0[1] * a];
    } else if (d0[0] * d2[0] + d0[1] * d2[1] < 0) {
      const mx = (p0[0] + p2[0]) / 2, mz = (p0[1] + p2[1]) / 2;
      p1 = [mx + d0[0] * 9, mz + d0[1] * 9];
    } else p1 = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2];
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    c.turn = { p0: p0, p1: p1, p2: p2, u: 0, len: Math.max(2, len), e2: e2, dir2: dir2, lane2: lane2, s2: e2 === e ? clr2 + 0.5 : clr2 };
  },
  _tickTraffic(dt) {
    const E = this._E;
    if (!E.wCars) return;
    const cp = E.cam.position;
    const peds = [];
    if (E.player && E.player.x != null) peds.push([E.player.x, E.player.z]);
    if (E.guide && E.guide.pos) peds.push([E.guide.pos.x, E.guide.pos.z]);
    // traffic light bulbs
    E.wTLt -= dt;
    if (E.wTL && E.wTLt <= 0) {
      E.wTLt = 0.25;
      const TL = E.wTL;
      TL.bulbs.forEach((b, i) => {
        const st = this._wLight(b.node, b.axis);
        const on = (b.slot === 0 && st === 'r') || (b.slot === 1 && st === 'y') || (b.slot === 2 && st === 'g');
        TL.mesh.setColorAt(i, on ? TL.cols[st] : TL.cols.off);
      });
      TL.mesh.instanceColor.needsUpdate = true;
    }
    for (const c of E.wCars) {
      let tv = c.vmax;
      if (c.turn) {
        const tr = c.turn;
        tv = Math.min(tv, tr.e2 === c.e && tr.dir2 === -c.dir ? 4 : 7.5);
        // pedestrians
        for (const p of peds) {
          const ax = p[0] - c.x, az = p[1] - c.z;
          const a = ax * c.hx + az * c.hz, l = Math.abs(ax * c.hz - az * c.hx);
          if (a > 0 && a < 8 && l < 2.0) tv = 0;
        }
        c.v += this._cl(tv - c.v, -8 * dt, 3 * dt);
        if (c.v < 0) c.v = 0;
        tr.u += (c.v * dt) / tr.len;
        if (tr.u >= 1) {
          c.e = tr.e2; c.dir = tr.dir2; c.lane = tr.lane2; c.s = tr.s2; c.turn = null;
        } else {
          const u = tr.u, iu = 1 - u;
          c.x = iu * iu * tr.p0[0] + 2 * iu * u * tr.p1[0] + u * u * tr.p2[0];
          c.z = iu * iu * tr.p0[1] + 2 * iu * u * tr.p1[1] + u * u * tr.p2[1];
          const hx = 2 * iu * (tr.p1[0] - tr.p0[0]) + 2 * u * (tr.p2[0] - tr.p1[0]);
          const hz = 2 * iu * (tr.p1[1] - tr.p0[1]) + 2 * u * (tr.p2[1] - tr.p1[1]);
          const hl = Math.hypot(hx, hz) || 1;
          c.hx = hx / hl; c.hz = hz / hl;
          this._wCarPose(c);
          continue;
        }
      }
      const e = c.e;
      const N = c.dir > 0 ? e.b : e.a;
      const clrN = (N.clr[e.road.id] || 0) + 1.0;
      const sEnd = e.len - clrN;
      // vehicle ahead on the same edge / direction / lane
      let gap = 1e9;
      for (const o of E.wCars) {
        if (o === c || o.turn || o.e !== e || o.dir !== c.dir || o.lane !== c.lane) continue;
        if (o.s > c.s) gap = Math.min(gap, o.s - c.s - (o.len + c.len) / 2);
      }
      if (gap < 1e9) tv = Math.min(tv, Math.max(0, (gap - 2.5) * 1.1));
      // traffic light
      if (N.light) {
        const axis = e.road.horiz ? 'h' : 'v';
        const st = this._wLight(N, axis);
        if (st !== 'g') {
          const cross = N.roads.find((r) => r.horiz !== e.road.horiz);
          const stopAt = e.len - (e.road.id === 'A' ? (cross ? cross.w / 2 : 6) + 5.4 : 15.4) - c.len / 2;
          const dist = stopAt - c.s;
          if (dist > -0.5 && !(st === 'y' && dist < 3)) tv = Math.min(tv, Math.max(0, dist * 0.9));
        }
      }
      // pedestrians (player / guide) ahead
      for (const p of peds) {
        const ax = p[0] - c.x, az = p[1] - c.z;
        const a = ax * c.hx + az * c.hz, l = Math.abs(ax * c.hz - az * c.hx);
        if (a > 0 && a < 9 + c.len / 2 && l < 1.9 + c.wid / 2) tv = 0;
      }
      c.v += this._cl(tv - c.v, -8 * dt, 3 * dt);
      if (c.v < 0) c.v = 0;
      c.s += c.v * dt;
      if (c.s >= sEnd) { c.s = sEnd; this._wPlanTurn(c); }
      const p = this._wEdgePos(c, c.e, c.dir, c.s);
      c.x = p[0]; c.z = p[1]; c.hx = p[2]; c.hz = p[3];
      this._wCarPose(c);
    }
    // night lights
    const k = Math.max(this._cl(((E.nightK || 0) - 0.25) / 0.6, 0, 1), (E.rainK || 0) * 0.8);
    E.wHead.material.opacity = k;
    E.wTail.material.opacity = k * 0.9;
    if (k > 0.01) {
      const hp = E.wHead.geometry.attributes.position, tp = E.wTail.geometry.attributes.position;
      E.wCars.forEach((c, i) => {
        const far = Math.hypot(c.x - cp.x, c.z - cp.z) > 600;
        const y = c.mesh.position.y;
        for (let s = 0; s < 2; s++) {
          const off = (s ? 1 : -1) * (c.kind === 'moto' ? 0 : c.wid / 2 - 0.25);
          const fx = c.x + c.hx * (c.len / 2 + 0.05) + c.hz * off, fz = c.z + c.hz * (c.len / 2 + 0.05) - c.hx * off;
          const bx = c.x - c.hx * (c.len / 2 + 0.05) + c.hz * off, bz = c.z - c.hz * (c.len / 2 + 0.05) - c.hx * off;
          if (far) { hp.setXYZ(i * 2 + s, 0, -100, 0); tp.setXYZ(i * 2 + s, 0, -100, 0); }
          else { hp.setXYZ(i * 2 + s, fx, y + 0.75, fz); tp.setXYZ(i * 2 + s, bx, y + 0.8, bz); }
        }
      });
      hp.needsUpdate = true; tp.needsUpdate = true;
    }
  },
  _wCarPose(c) {
    const y = this._wDeckY(c.x, c.z) + 0.04;
    c.mesh.position.set(c.x, y, c.z);
    c.mesh.rotation.y = Math.atan2(c.hx, c.hz);
  },

  // ------------------------------------------------------------- crowd / animal feeds
  _wFeeds() {
    const E = this._E;
    const R = this._rng(13579);
    for (const b of E.wBlocksDef || []) {
      const zn = (b.oz0 + b.z0) / 2, zs = (b.z1 + b.oz1) / 2, xw = (b.ox0 + b.x0) / 2;
      const xe = b.east ? (b.x1 + b.ox1) / 2 : 533;
      E.walkLoops.push({ pts: [[xw, zn], [xe, zn], [xe, zs], [xw, zs]], closed: true });
    }
    E.walkLoops.push({ pts: [[-735, -12], [-629, -12]], closed: false });
    E.walkLoops.push({ pts: [[-735, 12], [-629, 12]], closed: false });
    // shoppers standing at shop fronts along road A
    for (let k = 0; k < 26; k++) {
      const x = -600 + R() * 1120;
      if (Math.abs(x + 85) < 30 || Math.abs(x - 260) < 40) continue;
      const side = R() < 0.5 ? -1 : 1;
      E.crowdSpots.push({ x: x, z: side * (13.2 - R() * 0.6), yaw: side < 0 ? Math.PI : 0, mode: R() < 0.5 ? 'stand' : 'chat', outfit: this._wPick(R, ['casual', 'office', 'student', 'casual']) });
    }
    for (let k = 0; k < 6; k++) E.animalSpots.dogs.push({ x: -600 + R() * 1100, z: (R() < 0.5 ? -1 : 1) * (11.5 + R() * 2) });
    E.animalSpots.birds.push([600, -200], [600, 300], [-30, 105]);
  }
});
/* GHG Town 3D v0.3 — world part 6: densifiers (block fillers, housing lanes, street trees), water discs, Thai gable trims */
Object.assign(GHG3.world, {
  // water disc with UVs scaled to world size
  _wWaterDisc(x, y, z, r, sx, sz) {
    const E = this._E;
    const T = E.T;
    const g = new T.CircleGeometry(r, 40).rotateX(-Math.PI / 2);
    const uv = g.attributes.uv;
    const k = (r * 2) / 30;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k * (sx || 1), uv.getY(i) * k * (sz || 1));
    const m = new T.Mesh(g, E.mats.water);
    m.scale.set(sx || 1, 1, sz || 1);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    this._addDyn(m);
    return m;
  },
  // gold barge boards + chofa finials on both gable ends (ridge along local X of length w, span d, rise h, base y)
  _wGableTrim(cx, y, cz, w, d, h, ry, col, oh) {
    const c = Math.cos(ry || 0), s = Math.sin(ry || 0);
    const o = oh == null ? 0.5 : oh;
    const P = (lx, ly, lz) => [cx + lx * c + lz * s, y + ly, cz - lx * s + lz * c];
    const drop = (h * o) / (d / 2);
    for (const e of [-1, 1]) {
      const ex = e * (w / 2 + o * 0.6);
      const L = P(ex, -drop, -(d / 2 + o)), A = P(ex, h + 0.05, 0), Rr = P(ex, -drop, d / 2 + o);
      this.tube('shiny', [L, A, Rr], 0.13, col, 6);
      // chofa (bird-head finial) at the apex, hang hooks (hang hong) at the eaves
      this.tube('shiny', [A, P(ex + e * 0.25, h + 0.9, 0), P(ex + e * 0.75, h + 1.45, 0)], 0.1, col, 6);
      for (const sd of [-1, 1]) this.tube('shiny', [P(ex, -drop, sd * (d / 2 + o)), P(ex + e * 0.2, -drop + 0.55, sd * (d / 2 + o + 0.25))], 0.09, col, 6);
    }
  },
  // fill a block interior with mid-rise back buildings, avoiding reserved rects [x0,z0,x1,z1]
  _wFill(b, D, reserved, R, o) {
    const E = this._E;
    o = o || {};
    const x0 = b.x0 + D + 3, x1 = b.x1 - D - 3, z0 = b.z0 + D + 3, z1 = b.z1 - D - 3;
    const cell = o.cell || 26;
    const nx = Math.max(1, Math.floor((x1 - x0) / cell)), nz = Math.max(1, Math.floor((z1 - z0) / cell));
    const cw = (x1 - x0) / nx, cd = (z1 - z0) / nz;
    const hit = (a0, c0, a1, c1) => reserved.some((r) => a0 < r[2] + 3 && a1 > r[0] - 3 && c0 < r[3] + 3 && c1 > r[1] - 3);
    const tints = ['#EFE6D3', '#E2E9EC', '#EFDCD2', '#E4ECD8', '#F3EEDF', '#E7D8C3', '#D9E0E6'];
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const ax = x0 + i * cw, az = z0 + j * cd;
      if (hit(ax, az, ax + cw, az + cd)) continue;
      const r = R();
      const cx = ax + cw / 2, cz = az + cd / 2;
      if (r < 0.14) {
        // small parking lot
        this.plane('asphalt', cx, 0.07, cz, cw - 4, cd - 4, '#E9E9E9');
        for (let k = 0; k < 6; k++) if (R() < 0.7) E.parkSpots.push({ x: ax + 4 + k * ((cw - 8) / 5), z: cz + (k % 2 ? 3 : -3), yaw: k % 2 ? 0 : Math.PI, kind: R() < 0.7 ? 'car' : 'pickup', color: this._wPick(R, ['#F2F2F2', '#B9BEC3', '#2B2F33', '#8E1F1F', '#1F3F7A']) });
        continue;
      }
      if (r < 0.22) {
        for (let k = 0; k < 3; k++) E.treeSpots.push({ x: ax + 4 + R() * (cw - 8), z: az + 4 + R() * (cd - 8), s: 0.6 + R() * 0.4, kind: this._wPick(R, ['mango', 'rain', 'banana', 'palm']) });
        continue;
      }
      const w = cw - 3 - R() * 4, d = cd - 3 - R() * 4;
      const fl = (o.fl ? o.fl[0] : 2) + ((R() * ((o.fl ? o.fl[1] - o.fl[0] : 4) + 1)) | 0);
      const h = fl * 4;
      this.box('shop', cx, 0, cz, w, h, d, this._wPick(R, tints), { top: 'concrete', topCol: '#C6C1B6', u0: ((R() * 4) | 0) / 4, v0: R() < 0.5 ? 0 : 0.5 });
      this.box('concrete', cx, h, cz, w + 0.2, 0.7, d + 0.2, '#D8D3C9', { top: 'concrete', topCol: '#BDB8AE' });
      // rooftop clutter: tanks, a metal sheet shed, AC units
      if (R() < 0.7) this.cyl(R() < 0.6 ? 'shiny' : 'flat', cx - w * 0.25, h + 0.7, cz - d * 0.2, 0.65, 1.3, R() < 0.6 ? '#C9CDD2' : '#2C5FA8', 12);
      if (R() < 0.45) {
        const sw = Math.min(w * 0.5, 10), sd = Math.min(d * 0.45, 8);
        this.box('flat', cx + w * 0.15, h + 0.7, cz + d * 0.15, sw, 2.4, sd, '#ECE7DC', { top: false });
        this.gable('metal', cx + w * 0.15, h + 3.1, cz + d * 0.15, sw + 0.4, sd + 0.4, 0.9, this._wPick(R, ['#3F6FA3', '#B04A35', '#8C3B2E', '#7E8A93', '#4B7B5A']), { oh: 0.3, wall: 'flat', wallCol: '#ECE7DC' });
      }
      for (let k = 0; k < 3; k++) if (R() < 0.5) this.box('flat', cx + (R() - 0.5) * w * 0.7, h + 0.7, cz + (R() - 0.5) * d * 0.7, 0.9, 0.6, 0.45, '#E7EAEC');
      this._col(cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2);
    }
  },
  // street trees in sidewalk pits
  _wStreetTrees() {
    const E = this._E;
    const R = this._rng(2222);
    const G = E.wG;
    for (const id of ['B', 'C', 'N3', 'N4', 'E', 'N2', 'W', 'N5']) {
      const r = G.byId[id];
      if (!r) continue;
      const s0 = r.horiz ? Math.min(r.a[0], r.b[0]) : Math.min(r.a[1], r.b[1]);
      const s1 = r.horiz ? Math.max(r.a[0], r.b[0]) : Math.max(r.a[1], r.b[1]);
      for (const side of (id === 'B' ? [1] : [-1, 1])) {
        for (let s = s0 + 12; s < s1 - 8; s += 26) {
          if (r.nodes.some((n) => Math.abs((r.horiz ? n.x : n.z) - s) < 18)) continue;
          if (R() < 0.15) continue;
          const off = side * (r.w / 2 + 0.85);
          const x = r.horiz ? s + 5 : r.a[0] + off, z = r.horiz ? r.a[1] + off : s + 5;
          if (x > 540 || x < -632 || z < -470 || z > 470) continue;
          this.box('concrete', x, 0.15, z, 1.2, 0.08, 1.2, '#A9A39A', { top: 'dirt', topCol: '#6E5038' });
          E.treeSpots.push({ x: x, z: z, y: 0.15, s: 0.55 + R() * 0.25, kind: this._wPick(R, ['rain', 'mango', 'golden', 'flame', 'rain']) });
        }
      }
    }
  }
});
