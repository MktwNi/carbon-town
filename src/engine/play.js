/* GHG Town 3D v0.3 — play engine: first-person walking, guide-led tour, drone flights, cameras,
   pins, gas labels, particles, rain, minimap and the engine <-> UI bridge. */
GHG3.play = {
  // =============================================================== INIT
  _initPlay() {
    const E = this._E;
    const T = E.T;
    const L = window.GHG3L;
    E.gateSpot = E.gateSpot || { view: [-702, -11], look: [-660, 7, -2], guide: [-698.5, -9.5] };
    const G = E.gateSpot;
    E.player = { x: G.view[0], z: G.view[1], y: L.H(G.view[0], G.view[1]) + 1.65, yaw: this._pYaw(G.view[0], G.view[1], G.look[0], G.look[2]), pitch: 0.03, vx: 0, vz: 0, bob: 0, phase: 0, sp: 0 };
    if (!E.guide) E.guide = { pos: new T.Vector3(), yaw: 0, mode: 'idle', speed: 0, lookAt: null, pointAt: null, helmet: false, visible: true, y: null };
    E.gc = { home: null, gesture: null, arrT: -99, pointT: 7, lookV: new T.Vector3(), pointV: new T.Vector3(), sp: 0 };
    this._pPlaceGuideAtGate();
    E.keys = {};
    E.lookOff = { yaw: 0, pitch: 0 };
    E.ctl = 'intro';
    E.cine = { th: 0.85, cx: 140, cz: -90, R: 1180, alt: 480, sp: 0.03 };
    E.fin = null;
    E.orbit = { tx: 0, tz: 0, r: 760, th: 0.8, ph: 0.85 };
    E.camLook = new T.Vector3(0, 0, 0);
    E.flyLook = new T.Vector3();
    E.pv = new T.Vector3();
    E.focus = new T.Vector3(G.view[0], 0, G.view[1]);
    E.shadowR = 600;
    E.fovCur = 50;
    E.fovWalk = 70;
    E.travel = null; E.fly = null; E.at = null; E.atGate = false; E.freeMode = false; E.autoWalk = null;
    E.fast = false; E.labelsOn = true; E.pinStatus = {};
    E.hudT = 0; E.mapT = 0; E.nearId = null; E.insideObj = null;
    E.parts = []; E.partsA = []; E.gasL = []; E.sparks = [];
    E.exploreOn = false; E.seek = null; E.found = null; E.hintId = null; E.hintT = null; E.mysteryId = null;
    E.wind = new T.Vector3(1.0, 0, 0.5);
    E.ltT = 9;
    this._pNavBuild();
    this._pInitPins();
    this._pInitFx();
    this._pInitRain();
    this._pInitOverlay();
    this._pInitMystery();
    this._pInitBeacon();
    if (typeof this._initAudio === 'function') this._initAudio();
    this._pCineCam(0, true);
    this._ui({ eReady: true, eMode: 'intro', eDistrict: '', eInside: '', eNear: null, eTravel: false, eTarget: null, eDist: 0, eArrived: null, eGate: false, eFinale: false, eFly: false, eFast: false,
      eExplore: false, eMystery: null, eMysteryD: 0, eSeek: null, eAim: 0, eFound: null, eHint: null });
    const mel = this.__mapEl || this.__mapElLast;
    if (mel) { this.__mapEl = null; this._mapAttach(mel); }
  },

  _pPlaceGuideAtGate() {
    const E = this._E;
    const G = E.gateSpot;
    const g = E.guide;
    g.pos.set(G.guide[0], window.GHG3L.H(G.guide[0], G.guide[1]), G.guide[1]);
    g.yaw = this._pYaw(G.guide[0], G.guide[1], G.view[0], G.view[1]);
    g.mode = 'idle'; g.speed = 0; g.visible = true; g.y = null; g.helmet = false; g.lookAt = null; g.pointAt = null;
    E.gc.home = { x: G.guide[0], z: G.guide[1] };
  },

  // =============================================================== SMALL HELPERS
  _pYaw(fx, fz, tx, tz) { return Math.atan2(tx - fx, tz - fz); },
  _pPitch(fx, fy, fz, tx, ty, tz) { return Math.atan2(ty - fy, Math.hypot(tx - fx, tz - fz)); },
  _pShort(id) {
    const C = window.GHGTownContent;
    const s = C && C.stops ? C.stops.find((q) => q.id === id) : null;
    return s ? s.short : 'จุดที่ ' + id;
  },
  _pScope(id) {
    const C = window.GHGTownContent;
    const s = C && C.stops ? C.stops.find((q) => q.id === id) : null;
    return s ? s.scope : (id === 19 ? 'rm' : 's1');
  },
  _pEyeY(x, z) {
    const E = this._E;
    const g = window.GHG3L.H(x, z) + 1.65;
    // standing on a raised platform (anchor.viewY)
    for (const k in E.anchors) {
      const a = E.anchors[k];
      if (a && a.viewY != null && a.view) {
        const d = Math.hypot(x - a.view[0], z - a.view[1]);
        if (d < 2.6) return a.viewY;
        if (d < 12 && E.travel && E.travel.a === a) return this._lp(g, a.viewY, 1 - (d - 2.6) / 9.4);
      }
    }
    return g;
  },
  _pInsideAt(x, z) {
    for (const it of this._E.interiors) {
      const r = it.rect;
      if (!r) continue;
      if (x >= Math.min(r[0], r[2]) && x <= Math.max(r[0], r[2]) && z >= Math.min(r[1], r[3]) && z <= Math.max(r[1], r[3])) return it;
    }
    return null;
  },
  _pDistrictAt(x, z) {
    for (const d of window.GHG3L.districts) {
      const r = d.rect;
      if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3]) return d.name;
    }
    return 'เมืองคาร์บอน';
  },

  // circle (r) vs AABB colliders with sliding; returns [x, z]
  _pCollide(x, z, r) {
    const E = this._E;
    const S = 24;
    for (let it = 0; it < 3; it++) {
      let moved = false;
      const gx0 = Math.floor((x - r) / S), gx1 = Math.floor((x + r) / S), gz0 = Math.floor((z - r) / S), gz1 = Math.floor((z + r) / S);
      for (let gx = gx0; gx <= gx1; gx++) {
        for (let gz = gz0; gz <= gz1; gz++) {
          const list = E.colGrid.get(gx + ',' + gz);
          if (!list) continue;
          for (const c of list) {
            const cx = x < c.x0 ? c.x0 : (x > c.x1 ? c.x1 : x);
            const cz = z < c.z0 ? c.z0 : (z > c.z1 ? c.z1 : z);
            const dx = x - cx, dz = z - cz;
            const d2 = dx * dx + dz * dz;
            if (d2 >= r * r) continue;
            if (d2 > 1e-9) {
              const d = Math.sqrt(d2);
              x = cx + (dx / d) * r; z = cz + (dz / d) * r;
            } else {
              const pl = x - c.x0, pr = c.x1 - x, pt = z - c.z0, pb = c.z1 - z;
              const m = Math.min(pl, pr, pt, pb);
              if (m === pl) x = c.x0 - r; else if (m === pr) x = c.x1 + r; else if (m === pt) z = c.z0 - r; else z = c.z1 + r;
            }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    return [x, z];
  },
  _pHitAt(x, z, r) {
    const E = this._E;
    const list = E.colGrid.get(Math.floor(x / 24) + ',' + Math.floor(z / 24));
    if (!list) return false;
    for (const c of list) if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) return true;
    return false;
  },
  _pBlocked(ax, az, bx, bz) {
    const d = Math.hypot(bx - ax, bz - az);
    const n = Math.ceil(d / 0.6);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (this._pHitAt(ax + (bx - ax) * t, az + (bz - az) * t, 0.2)) return true;
    }
    return false;
  },

  // =============================================================== NAVIGATION GRAPH (roads)
  _pNavBuild() {
    const E = this._E;
    const roads = window.GHG3L.roads;
    const nodes = [];
    const map = new Map();
    const node = (x, z) => {
      const k = Math.round(x * 4) + ',' + Math.round(z * 4);
      if (!map.has(k)) { map.set(k, nodes.length); nodes.push({ x: x, z: z, adj: [] }); }
      return map.get(k);
    };
    const edges = [];
    for (const r of roads) {
      const ax = r.a[0], az = r.a[1], bx = r.b[0], bz = r.b[1];
      const ts = [0, 1];
      for (const o of roads) {
        if (o === r) continue;
        const px = ax, pz = az, rx = bx - ax, rz = bz - az;
        const qx = o.a[0], qz = o.a[1], sx = o.b[0] - o.a[0], sz = o.b[1] - o.a[1];
        const den = rx * sz - rz * sx;
        if (Math.abs(den) < 1e-9) continue;
        const t = ((qx - px) * sz - (qz - pz) * sx) / den;
        const u = ((qx - px) * rz - (qz - pz) * rx) / den;
        if (t >= -1e-6 && t <= 1 + 1e-6 && u >= -1e-6 && u <= 1 + 1e-6) ts.push(Math.min(1, Math.max(0, t)));
      }
      ts.sort((a, b) => a - b);
      let prev = null;
      for (const t of ts) {
        const id = node(ax + (bx - ax) * t, az + (bz - az) * t);
        if (prev != null && prev !== id) {
          const A = nodes[prev], B = nodes[id];
          const len = Math.hypot(B.x - A.x, B.z - A.z);
          const e = { a: prev, b: id, len: len, road: r };
          edges.push(e);
          A.adj.push({ to: id, len: len, e: e });
          B.adj.push({ to: prev, len: len, e: e });
        }
        prev = id;
      }
    }
    E.nav = { nodes: nodes, edges: edges };
  },
  _pProject(x, z) {
    const N = this._E.nav;
    let best = null;
    for (const e of N.edges) {
      const A = N.nodes[e.a], B = N.nodes[e.b];
      const dx = B.x - A.x, dz = B.z - A.z;
      const l2 = dx * dx + dz * dz || 1;
      let t = ((x - A.x) * dx + (z - A.z) * dz) / l2;
      t = t < 0 ? 0 : (t > 1 ? 1 : t);
      const px = A.x + dx * t, pz = A.z + dz * t;
      const d = Math.hypot(x - px, z - pz);
      if (!best || d < best.d) best = { e: e, t: t, x: px, z: pz, d: d };
    }
    return best;
  },
  // sidewalk polyline between two points following the road network
  _pNavPath(s, e) {
    const E = this._E;
    const N = E.nav;
    if (!N || !N.edges.length) return [];
    const ps = this._pProject(s[0], s[1]), pe = this._pProject(e[0], e[1]);
    if (!ps || !pe) return [];
    let pts; // {x, z, road} — road applies to the segment that ENDS at this point
    if (ps.e === pe.e) {
      pts = [{ x: ps.x, z: ps.z }, { x: pe.x, z: pe.z, road: ps.e.road }];
    } else {
      const n = N.nodes.length;
      const dist = new Float64Array(n).fill(Infinity);
      const prev = new Int32Array(n).fill(-1);
      const pe2 = new Array(n).fill(null);
      const done = new Uint8Array(n);
      const sA = N.nodes[ps.e.a], sB = N.nodes[ps.e.b];
      dist[ps.e.a] = Math.hypot(sA.x - ps.x, sA.z - ps.z);
      dist[ps.e.b] = Math.hypot(sB.x - ps.x, sB.z - ps.z);
      pe2[ps.e.a] = ps.e; pe2[ps.e.b] = ps.e;
      for (let it = 0; it < n; it++) {
        let u = -1, bd = Infinity;
        for (let i = 0; i < n; i++) if (!done[i] && dist[i] < bd) { bd = dist[i]; u = i; }
        if (u < 0) break;
        done[u] = 1;
        for (const a of N.nodes[u].adj) {
          const nd = dist[u] + a.len;
          if (nd < dist[a.to]) { dist[a.to] = nd; prev[a.to] = u; pe2[a.to] = a.e; }
        }
      }
      const eA = N.nodes[pe.e.a], eB = N.nodes[pe.e.b];
      const ca = dist[pe.e.a] + Math.hypot(eA.x - pe.x, eA.z - pe.z);
      const cb = dist[pe.e.b] + Math.hypot(eB.x - pe.x, eB.z - pe.z);
      let cur = ca <= cb ? pe.e.a : pe.e.b;
      if (!isFinite(Math.min(ca, cb))) return [];
      const seq = [];
      while (cur >= 0) { seq.push(cur); cur = prev[cur]; }
      seq.reverse();
      pts = [{ x: ps.x, z: ps.z }];
      for (let i = 0; i < seq.length; i++) {
        const nd = N.nodes[seq[i]];
        pts.push({ x: nd.x, z: nd.z, road: (pe2[seq[i]] || ps.e).road });
      }
      pts.push({ x: pe.x, z: pe.z, road: pe.e.road });
    }
    // offset onto the sidewalk (left or right side, whichever needs the shorter connectors); corners from line intersections
    const offsetPath = (side) => {
      const segs = [];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const len = Math.hypot(b.x - a.x, b.z - a.z);
        if (len < 0.5) continue;
        const r = b.road || ps.e.road;
        const dx = (b.x - a.x) / len, dz = (b.z - a.z) / len;
        const off = (r.w / 2 + (r.side ? r.side / 2 : 1.2)) * side;
        segs.push({ ax: a.x + dz * off, az: a.z - dx * off, bx: b.x + dz * off, bz: b.z - dx * off, dx: dx, dz: dz });
      }
      if (!segs.length) return [];
      const out = [[segs[0].ax, segs[0].az]];
      for (let i = 0; i < segs.length - 1; i++) {
        const s1 = segs[i], s2 = segs[i + 1];
        const cr = s1.dx * s2.dz - s1.dz * s2.dx;
        if (Math.abs(cr) < 1e-3) { out.push([s1.bx, s1.bz]); out.push([s2.ax, s2.az]); continue; }
        const t = ((s2.ax - s1.ax) * s2.dz - (s2.az - s1.az) * s2.dx) / cr;
        out.push([s1.ax + s1.dx * t, s1.az + s1.dz * t]);
      }
      const L2 = segs[segs.length - 1];
      out.push([L2.bx, L2.bz]);
      return out;
    };
    const A1 = offsetPath(1), A2 = offsetPath(-1);
    if (!A1.length) return [];
    const cost = (o) => Math.hypot(o[0][0] - s[0], o[0][1] - s[1]) + Math.hypot(o[o.length - 1][0] - e[0], o[o.length - 1][1] - e[1]) + this._pLen(o) * 0.02;
    return cost(A1) <= cost(A2) ? A1 : A2;
  },
  // keep only the last `keep` metres of a route (used after a drone flight)
  _pTrimRoute(rp, keep) {
    const L = this._pLen(rp);
    if (L <= keep + 15) return rp;
    let acc = 0;
    const cut = L - keep;
    for (let i = 1; i < rp.length; i++) {
      const d = Math.hypot(rp[i][0] - rp[i - 1][0], rp[i][1] - rp[i - 1][1]);
      if (acc + d >= cut) {
        const t = (cut - acc) / (d || 1);
        return [[rp[i - 1][0] + (rp[i][0] - rp[i - 1][0]) * t, rp[i - 1][1] + (rp[i][1] - rp[i - 1][1]) * t]].concat(rp.slice(i));
      }
      acc += d;
    }
    return rp;
  },
  _pClean(path) {
    let p = path.filter((q) => q && isFinite(q[0]) && isFinite(q[1]));
    let changed = true;
    let guard = 0;
    while (changed && guard++ < 20) {
      changed = false;
      const out = [p[0]];
      for (let i = 1; i < p.length; i++) {
        const a = out[out.length - 1];
        if (Math.hypot(p[i][0] - a[0], p[i][1] - a[1]) < 0.4 && i < p.length - 1) { changed = true; continue; }
        out.push(p[i]);
      }
      p = out;
      for (let i = 1; i < p.length - 1; i++) {
        const a = p[i - 1], b = p[i], c = p[i + 1];
        const ux = b[0] - a[0], uz = b[1] - a[1], vx = c[0] - b[0], vz = c[1] - b[1];
        const lu = Math.hypot(ux, uz), lv = Math.hypot(vx, vz);
        if (lu < 1e-6 || lv < 1e-6) continue;
        if ((ux * vx + uz * vz) / (lu * lv) < -0.92) { p.splice(i, 1); changed = true; break; }
      }
    }
    return p;
  },
  _pLen(p) { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; },
  _pNearestOn(poly, x, z) {
    let best = { d: Infinity, seg: 0, pt: poly[0] };
    if (poly.length === 1) return { d: Math.hypot(x - poly[0][0], z - poly[0][1]), seg: 0, pt: poly[0] };
    for (let i = 0; i < poly.length - 1; i++) {
      const a = poly[i], b = poly[i + 1];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const l2 = dx * dx + dz * dz || 1;
      let t = ((x - a[0]) * dx + (z - a[1]) * dz) / l2;
      t = t < 0 ? 0 : (t > 1 ? 1 : t);
      const px = a[0] + dx * t, pz = a[1] + dz * t;
      const d = Math.hypot(x - px, z - pz);
      if (d < best.d) best = { d: d, seg: i, pt: [px, pz] };
    }
    return best;
  },
  _pAnchorRoute(a) {
    let r = a.route && a.route.length ? a.route.map((p) => [p[0], p[1]]) : [];
    const v = a.view;
    if (!r.length) {
      let dx = v[0] - a.look[0], dz = v[1] - a.look[2];
      const l = Math.hypot(dx, dz) || 1;
      dx /= l; dz /= l;
      r = [[v[0] + dx * 12, v[1] + dz * 12]];
    }
    const last = r[r.length - 1];
    if (Math.hypot(last[0] - v[0], last[1] - v[1]) > 0.3) r.push([v[0], v[1]]);
    return r;
  },
  _pGuideSpot(a) {
    // keep the guide inside the first-person frame: ~20-34 deg off the line of sight, 2-4 m away, preferably on the right
    const yaw = this._pYaw(a.view[0], a.view[1], a.look[0], a.look[2]);
    const fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -Math.cos(yaw), rz = Math.sin(yaw);
    const ok = (x, z) => !this._pHitAt(x, z, 0.35);
    if (a.guide) {
      const dx = a.guide[0] - a.view[0], dz = a.guide[1] - a.view[1];
      const f = dx * fx + dz * fz, sd = Math.abs(dx * rx + dz * rz);
      const ang = Math.atan2(sd, f) * 180 / Math.PI, d = Math.hypot(dx, dz);
      if (f > 2.6 && ang > 14 && ang < 30 && d > 2.8 && d < 5.0 && ok(a.guide[0], a.guide[1])) return [a.guide[0], a.guide[1]];
    }
    // mascots are ~1.2 m tall: stand ~3.5 m ahead so they sit above the dialogue bar
    const cands = [[3.6, 1.45], [3.2, 1.3], [4.2, 1.7], [2.8, 1.15], [4.8, 1.95], [2.4, 1.0]];
    for (const s of [1, -1]) {
      for (const c of cands) {
        const x = a.view[0] + fx * c[0] + rx * c[1] * s, z = a.view[1] + fz * c[0] + rz * c[1] * s;
        if (ok(x, z) && !this._pBlocked(a.view[0], a.view[1], x, z)) return [x, z];
      }
    }
    if (a.guide) return [a.guide[0], a.guide[1]];
    return [a.view[0] + rx * 1.4, a.view[1] + rz * 1.4];
  },
  // plan the walking path to stop `id`; fly = true means drone flight to walk[0] first
  _pPlan(id, o, fromAir) {
    const E = this._E;
    const a = E.anchors[id];
    const P = E.player;
    const rp = this._pAnchorRoute(a);
    if (fromAir) { const tw = this._pTrimRoute(rp, 45); return { walk: tw, fly: true, len: this._pLen(tw) }; }
    const near = this._pNearestOn(rp, P.x, P.z);
    if (near.d < (o && o.quick ? 25 : 14) && !this._pBlocked(P.x, P.z, near.pt[0], near.pt[1])) {
      const walk = this._pClean([[P.x, P.z], near.pt].concat(rp.slice(near.seg + 1)));
      return { walk: walk, fly: false, len: this._pLen(walk) };
    }
    let prefix = [[P.x, P.z]];
    const cur = E.at != null ? E.anchors[E.at] : null;
    if (cur && cur !== a) {
      const cr = this._pAnchorRoute(cur);
      const n2 = this._pNearestOn(cr, P.x, P.z);
      if (n2.d < 15) prefix = [[P.x, P.z], n2.pt].concat(cr.slice(0, n2.seg + 1).reverse());
    }
    const s = prefix[prefix.length - 1];
    const nav = this._pNavPath(s, rp[0]);
    const walk = this._pClean(prefix.concat(nav, rp));
    const len = this._pLen(walk);
    let blocked = false;
    if (nav.length) {
      blocked = this._pBlocked(s[0], s[1], nav[0][0], nav[0][1]) || this._pBlocked(nav[nav.length - 1][0], nav[nav.length - 1][1], rp[0][0], rp[0][1]);
    } else blocked = this._pBlocked(s[0], s[1], rp[0][0], rp[0][1]);
    if (len > (E.walkMax || 110) || blocked) {
      const tw = this._pTrimRoute(rp, 45);
      return { walk: tw, fly: true, len: this._pLen(tw) + Math.hypot(tw[0][0] - P.x, tw[0][1] - P.z) };
    }
    return { walk: walk, fly: false, len: len };
  },
  _pPrep(tr) {
    tr.cum = [0];
    for (let i = 1; i < tr.path.length; i++) tr.cum.push(tr.cum[i - 1] + Math.hypot(tr.path[i][0] - tr.path[i - 1][0], tr.path[i][1] - tr.path[i - 1][1]));
    tr.len = tr.cum[tr.cum.length - 1];
  },
  _pPathAt(tr, s) {
    const p = tr.path, c = tr.cum;
    if (p.length === 1 || s <= 0) {
      const b = p[Math.min(1, p.length - 1)];
      return { x: p[0][0], z: p[0][1], dx: b[0] - p[0][0], dz: b[1] - p[0][1] };
    }
    if (s >= tr.len) { const a = p[p.length - 2], b = p[p.length - 1]; return { x: b[0], z: b[1], dx: b[0] - a[0], dz: b[1] - a[1] }; }
    let i = 1;
    while (i < c.length - 1 && c[i] < s) i++;
    const a = p[i - 1], b = p[i];
    const t = (s - c[i - 1]) / ((c[i] - c[i - 1]) || 1);
    return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, dx: b[0] - a[0], dz: b[1] - a[1] };
  },

  // =============================================================== PUBLIC API (called by the UI)
  _eGate() {
    const E = this._E;
    if (!E || !E.player) return;
    if (E.fly) this._pFlyFinish();
    const G = E.gateSpot;
    E.travel = null; E.at = null; E.freeMode = false; E.atGate = false; E.autoWalk = null;
    this._pExploreOff();
    this._pPlaceGuideAtGate();
    const eye = window.GHG3L.H(G.view[0], G.view[1]) + 1.65;
    const done = () => {
      E.atGate = true;
      this._eGuide('wave', 2.8);
      this._ui({ eGate: true, eMode: 'stop' });
    };
    const P = E.player;
    if (E.ctl === 'walk' && Math.hypot(P.x - G.view[0], P.z - G.view[1]) < 3) {
      P.yaw = this._pYaw(P.x, P.z, G.look[0], G.look[2]);
      done();
      return;
    }
    this._pFlyTo({ x: G.view[0], y: eye, z: G.view[1], lx: G.look[0], ly: G.look[1], lz: G.look[2] }, { keepGuide: true, onDone: done });
    this._pRedrawPins();
  },
  _eTour(id) {
    const E = this._E;
    if (!E || !E.player) return;
    E.freeMode = false;
    this._pExploreOff();
    this._pStartTravel(id, {});
  },
  _eTalkHere(id) {
    const E = this._E;
    if (!E || !E.player) return;
    this._pStartTravel(id, { quick: true });
  },
  _eFree() {
    const E = this._E;
    if (!E || !E.player) return;
    this._pExploreOff();
    this._pGoFree();
  },
  _pGoFree() {
    const E = this._E;
    if (E.fly) this._pFlyFinish();
    E.travel = null; E.freeMode = true; E.at = null; E.atGate = false; E.gc.home = null; E.autoWalk = null; E.found = null;
    E.lookOff.yaw = 0; E.lookOff.pitch = 0;
    if (E.ctl !== 'walk') this._pFlyToPlayer();
    this._ui({ eMode: E.ctl === 'fly' ? 'fly' : 'walk', eArrived: null, eTravel: false, eTarget: null, eDist: 0 });
    this._pRedrawPins();
  },
  _pExploreOff() {
    const E = this._E;
    E.exploreOn = false; E.seek = null; E.found = null; E.hintId = null; E.hintT = null; E.mysteryId = null;
    this._ui({ eExplore: false, eMystery: null, eMysteryD: 0, eSeek: null, eAim: 0, eHint: null });
  },
  _eOverview() {
    const E = this._E;
    if (!E || !E.player) return;
    if (E.fly) this._pFlyFinish();
    const c = E.cam.position;
    let tx = 140, tz = -60;
    if (E.ctl === 'walk') { tx = E.player.x; tz = E.player.z; }
    const hd = Math.hypot(c.x - tx, c.z - tz);
    E.orbit = { tx: tx, tz: tz, r: E.ctl === 'walk' ? 520 : 1100, th: hd > 5 ? Math.atan2(c.x - tx, c.z - tz) : 0.7, ph: 0.82 };
    E.ctl = 'overview';
    E.autoWalk = null;
    this._ui({ eMode: 'overview' });
  },
  _eBack() {
    const E = this._E;
    if (!E || !E.player) return;
    if (E.ctl === 'walk') return;
    if (E.fly) { this._pFlyFinish(); return; }
    this._pFlyToPlayer();
  },
  _pFlyToPlayer() {
    const E = this._E;
    const P = E.player;
    const cp = Math.cos(P.pitch);
    this._pFlyTo({ x: P.x, y: P.y, z: P.z, lx: P.x + Math.sin(P.yaw) * cp * 20, ly: P.y + Math.sin(P.pitch) * 20, lz: P.z + Math.cos(P.yaw) * cp * 20 }, {
      fadeEnd: !!this._pInsideAt(P.x, P.z),
      onDone: () => this._ui({ eMode: (E.at != null || E.atGate) && !E.travel ? 'stop' : 'walk' })
    });
  },
  _eFinale() {
    const E = this._E;
    if (!E || !E.player) return;
    if (E.fly) this._pFlyFinish();
    E.travel = null; E.autoWalk = null;
    this._setWeather('evening');
    const cx = 160, cz = -40;
    const a = E.anchors[19];
    const hx = a ? a.view[0] : 0, hz = a ? a.view[1] : -900;
    const th = Math.atan2(hx - cx, hz - cz);
    const R = 1150, alt = 330;
    E.fin = { th: th, cx: cx, cz: cz, R: R, alt: alt, sp: 0.022 };
    this._pFlyTo({ x: cx + Math.sin(th) * R, y: alt, z: cz + Math.cos(th) * R, lx: cx, ly: 0, lz: cz }, {
      T: 9.5, alt: 90, endCtl: 'finale', player: false,
      onDone: () => this._ui({ eFinale: true, eMode: 'finale' })
    });
    this._ui({ eArrived: null });
  },
  _eGuide(mode, seconds) {
    const E = this._E;
    if (!E || !E.gc) return;
    E.gc.gesture = { mode: mode, until: E.time + (seconds || 2.5) };
  },
  _eAnswered(id, ok) {
    const E = this._E;
    if (!E || !E.pinStatus) return;
    if (ok === true) E.pinStatus[id] = 'ok';
    else if (ok === false) E.pinStatus[id] = 'bad';
    else delete E.pinStatus[id];
    if (E.hintId === id) { E.hintId = null; E.hintT = null; this._ui({ eHint: null }); }
    if (E.seek && E.seek.id === id) { E.seek = null; this._ui({ eSeek: null, eAim: 0 }); }
    this._pRedrawPins();
  },
  _eLabels(on) { const E = this._E; if (E) E.labelsOn = !!on; },
  _eWeather(name) { if (this._E && typeof this._setWeather === 'function') this._setWeather(name); },
  _eFast(on) { const E = this._E; if (!E) return; E.fast = !!on; this._ui({ eFast: E.fast }); },
  _eSkip() {
    const E = this._E;
    if (!E || !E.player) return;
    const tr = E.travel;
    if (!tr && !E.fly) return;
    this._pFade(() => {
      if (E.fly) {
        const F = E.fly;
        E.fly = null;
        if (!tr) { this._pFlyEnd(F); return; }
        E.ctl = 'walk';
        this._ui({ eFly: false });
      }
      if (tr) {
        const a = tr.a;
        const P = E.player;
        P.x = a.view[0]; P.z = a.view[1];
        P.y = this._pEyeY(P.x, P.z);
        P.yaw = this._pYaw(P.x, P.z, a.look[0], a.look[2]);
        P.pitch = this._cl(this._pPitch(P.x, P.y, P.z, a.look[0], a.look[1], a.look[2]), -0.32, 0.07);
        E.guide.pos.set(tr.gs[0], window.GHG3L.H(tr.gs[0], tr.gs[1]), tr.gs[1]);
        E.guide.yaw = this._pYaw(tr.gs[0], tr.gs[1], P.x, P.z);
        E.guide.visible = true;
        E.ctl = 'walk';
        this._pArrive(tr);
      }
    });
  },
  _eRestart() {
    const E = this._E;
    if (!E || !E.player) return;
    E.fly = null; E.travel = null; E.at = null; E.atGate = false; E.freeMode = false; E.autoWalk = null;
    E.pinStatus = {}; E.fast = false; E.fin = null;
    E.gc.gesture = null;
    this._pExploreOff();
    E.sparks.length = 0;
    if (typeof this._setWeather === 'function') this._setWeather('day');
    const G = E.gateSpot;
    const P = E.player;
    P.x = G.view[0]; P.z = G.view[1]; P.y = window.GHG3L.H(P.x, P.z) + 1.65;
    P.yaw = this._pYaw(P.x, P.z, G.look[0], G.look[2]); P.pitch = 0.03;
    this._pPlaceGuideAtGate();
    E.ctl = 'intro';
    E.fade.to = 0;
    this._pRedrawPins();
    this._ui({ eMode: 'intro', eArrived: null, eTravel: false, eTarget: null, eGate: false, eFinale: false, eFly: false, eFast: false, eNear: null, eDist: 0 });
  },

  // =============================================================== TRAVEL
  _pStartTravel(id, o) {
    const E = this._E;
    const T = E.T;
    const a = E.anchors[id];
    if (E.fly) this._pFlyFinish();
    E.autoWalk = null;
    if (!a) {
      E.travel = null;
      this._ui({ eTravel: false, eArrived: id, eTarget: null, eDist: 0 });
      return;
    }
    const fromAir = E.ctl !== 'walk';
    const plan = this._pPlan(id, o, fromAir);
    const tr = { id: id, a: a, path: plan.walk, cum: [], len: 0, sCam: 0, sG: 0, phase: 'walk', t: 0, v: 1.9, gs: this._pGuideSpot(a), done: false, boost: (o && o.boost) || 1 };
    this._pPrep(tr);
    E.at = null; E.atGate = false;
    E.gc.home = null;
    E.travel = tr;
    E.lookOff.yaw = 0; E.lookOff.pitch = 0;
    this._ui({ eTravel: true, eTarget: id, eArrived: null, eDist: Math.round(plan.len), eMode: 'walk' });
    if (plan.fly) {
      tr.phase = 'fly';
      const p0 = tr.path[0];
      const p1 = tr.path.length > 1 ? tr.path[1] : a.view;
      const eye = this._pEyeY(p0[0], p0[1]);
      let dx = p1[0] - p0[0], dz = p1[1] - p0[1];
      const l = Math.hypot(dx, dz) || 1;
      dx /= l; dz /= l;
      const startInside = !!this._pInsideAt(E.player.x, E.player.z) && E.ctl === 'walk';
      this._pFlyTo({ x: p0[0], y: eye, z: p0[1], lx: p0[0] + dx * 12, ly: eye - 0.4, lz: p0[1] + dz * 12 }, {
        fadeStart: startInside,
        onDone: () => {
          tr.phase = 'walk';
          tr.sCam = 0;
          tr.sG = Math.min(2.8, tr.len);
          const g = this._pPathAt(tr, tr.sG);
          E.guide.pos.set(g.x, window.GHG3L.H(g.x, g.z), g.z);
          E.guide.yaw = Math.atan2(g.dx, g.dz);
          E.guide.visible = true;
          this._ui({ eMode: 'walk' });
        }
      });
    } else {
      E.ctl = 'walk';
      const gn = this._pNearestOn(tr.path, E.guide.pos.x, E.guide.pos.z);
      let sg = 0;
      if (gn.d < 4) sg = tr.cum[gn.seg] + Math.hypot(gn.pt[0] - tr.path[gn.seg][0], gn.pt[1] - tr.path[gn.seg][1]);
      tr.sG = Math.min(tr.len, Math.max(sg, 2.8));
    }
    void T;
    this._pRedrawPins();
  },
  _pArrive(tr) {
    const E = this._E;
    if (tr.done) return;
    tr.done = true;
    const P = E.player;
    P.yaw += E.lookOff.yaw; P.pitch = this._cl(P.pitch + E.lookOff.pitch, -1.25, 1.25);
    E.lookOff.yaw = 0; E.lookOff.pitch = 0;
    E.at = tr.id;
    E.travel = null;
    E.gc.home = { x: tr.gs[0], z: tr.gs[1] };
    E.gc.arrT = E.time;
    E.gc.pointT = 5 + Math.random() * 3;
    this._pRedrawPins();
    this._ui({ eTravel: false, eArrived: tr.id, eTarget: null, eDist: 0, eMode: 'stop' });
  },

  _tickTour(dt) {
    const E = this._E;
    if (!E.player) return;
    this._pTickFade(dt);
    if (E.fly) this._pTickFly(dt);
    const P = E.player;
    const tr = E.travel;
    if (tr && !E.fly && tr.phase !== 'fly') {
      const a = tr.a;
      if (tr.phase === 'walk') {
        const v = 1.9 * Math.max(E.fast ? 3 : 1, tr.boost || 1);
        tr.v = v;
        const gp = this._pPathAt(tr, Math.min(tr.sG, tr.len));
        const gd = Math.hypot(E.guide.pos.x - gp.x, E.guide.pos.z - gp.z);
        if (tr.sG < tr.len) { if (gd < 2.0) tr.sG = Math.min(tr.len, tr.sG + v * dt); }
        const want = tr.sG >= tr.len ? tr.len : Math.max(0, tr.sG - 2.6);
        const prevS = tr.sCam;
        tr.sCam = Math.min(want, tr.sCam + v * 1.15 * dt);
        if (tr.sCam < prevS) tr.sCam = prevS;
        const p = this._pPathAt(tr, tr.sCam);
        P.sp = (tr.sCam - prevS) / Math.max(dt, 1e-4);
        P.x = p.x; P.z = p.z;
        const la = this._pPathAt(tr, Math.min(tr.len, tr.sCam + 5));
        let hy = P.yaw;
        if (Math.hypot(la.x - p.x, la.z - p.z) > 0.4) hy = Math.atan2(la.x - p.x, la.z - p.z);
        else if (Math.hypot(p.dx, p.dz) > 0.01) hy = Math.atan2(p.dx, p.dz);
        const rem = tr.len - tr.sCam;
        let hp = -0.05;
        if (rem < 7) {
          const ty = this._pYaw(P.x, P.z, a.look[0], a.look[2]);
          let d = ty - hy;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          hy += d * (1 - rem / 7);
          hp = this._lp(this._cl(this._pPitch(P.x, P.y, P.z, a.look[0], a.look[1], a.look[2]), -0.32, 0.07), -0.05, rem / 7);
        }
        P.yaw = this._angDamp(P.yaw, hy, 3.2, dt);
        P.pitch = this._damp(P.pitch, hp, 3, dt);
        if (tr.sCam >= tr.len - 0.03) { tr.phase = 'turn'; tr.t = 0; }
      } else if (tr.phase === 'turn') {
        tr.t += dt;
        P.sp = 0;
        const ty = this._pYaw(P.x, P.z, a.look[0], a.look[2]);
        const tp = this._cl(this._pPitch(P.x, P.y, P.z, a.look[0], a.look[1], a.look[2]), -0.32, 0.07);
        P.yaw = this._angDamp(P.yaw, ty, 4.5, dt);
        P.pitch = this._damp(P.pitch, tp, 4.5, dt);
        if (tr.t > 0.9) this._pArrive(tr);
      }
    }
    if (E.found && !E.travel) {
      const F = E.found;
      F.t += dt;
      const ty = this._pYaw(P.x, P.z, F.T[0], F.T[2]);
      const tp = this._cl(this._pPitch(P.x, P.y, P.z, F.T[0], F.T[1], F.T[2]), -0.32, 0.07);
      if (!(E.drag && E.drag.moved)) { P.yaw = this._angDamp(P.yaw, ty, 4.5, dt); P.pitch = this._damp(P.pitch, tp, 4.5, dt); }
      if (F.t > 0.9) {
        E.found = null;
        this._pRedrawPins();
        this._ui({ eArrived: F.id, eTravel: false, eTarget: null, eMode: 'stop' });
      }
    }
    if (!(E.drag && E.drag.moved)) {
      E.lookOff.yaw = this._damp(E.lookOff.yaw, 0, 1.4, dt);
      E.lookOff.pitch = this._damp(E.lookOff.pitch, 0, 1.4, dt);
    }
    this._pTickGuideCtl(dt);
  },

  // guide placement / animation intents (actors.js renders E.guide)
  _pTickGuideCtl(dt) {
    const E = this._E;
    const g = E.guide;
    const P = E.player;
    const H = window.GHG3L.H;
    if (!g) return;
    const gc = E.gc;
    if (E.fly && !E.fly.keepGuide) { g.visible = false; g.speed = 0; return; }
    g.visible = true;
    const tr = E.travel;
    let tx = null, tz = null, vmax = 2.4, travelling = false;
    if (tr && tr.phase === 'walk') {
      travelling = true;
      if (tr.sG < tr.len - 0.01) {
        const p = this._pPathAt(tr, tr.sG);
        const dl = Math.hypot(p.dx, p.dz) || 1;
        const side = tr.len - tr.sG > 3 ? 0.8 : 0.8 * Math.max(0, (tr.len - tr.sG) / 3);
        tx = p.x - (p.dz / dl) * side; tz = p.z + (p.dx / dl) * side;
        vmax = tr.v * 1.5 + 0.8;
      }
      else { tx = tr.gs[0]; tz = tr.gs[1]; vmax = tr.v * 1.2 + 0.4; }
    } else if (tr && tr.phase === 'turn') {
      tx = tr.gs[0]; tz = tr.gs[1]; vmax = 2.2; travelling = true;
    } else if (gc.home && Math.hypot(P.x - gc.home.x, P.z - gc.home.z) < 9) {
      tx = gc.home.x; tz = gc.home.z; vmax = 2.0;
    } else if (E.ctl === 'walk' || E.ctl === 'overview') {
      // follow: behind-right of the player
      const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), rx = -Math.cos(P.yaw), rz = Math.sin(P.yaw);
      const back = E.exploreOn ? 2.9 : 2.2, side = E.exploreOn ? 1.3 : 1.1;
      const wx = P.x - fx * back + rx * side, wz = P.z - fz * back + rz * side;
      const d = Math.hypot(g.pos.x - wx, g.pos.z - wz);
      if (d > (E.exploreOn ? 0.9 : 1.2)) {
        tx = wx; tz = wz;
        // closest approach of the straight walk to the player: detour around the side the guide is on
        const sx = wx - g.pos.x, sz = wz - g.pos.z, sl = sx * sx + sz * sz || 1;
        const t = this._cl(((P.x - g.pos.x) * sx + (P.z - g.pos.z) * sz) / sl, 0, 1);
        const cx = g.pos.x + sx * t - P.x, cz = g.pos.z + sz * t - P.z;
        if (t > 0.05 && t < 0.95 && Math.hypot(cx, cz) < 1.3) {
          const sgn = ((g.pos.x - P.x) * rx + (g.pos.z - P.z) * rz) >= 0 ? 1 : -1;
          tx = P.x + rx * 1.9 * sgn; tz = P.z + rz * 1.9 * sgn;
        }
      }
      vmax = Math.max(1.4, Math.hypot(P.vx, P.vz) + 0.9);
      if (Math.hypot(g.pos.x - P.x, g.pos.z - P.z) > 30) {
        g.pos.set(wx, H(wx, wz), wz);
        tx = null;
      }
    }
    const ox = g.pos.x, oz = g.pos.z;
    if (tx != null) {
      const dx = tx - g.pos.x, dz = tz - g.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.04) {
        const step = Math.min(d, vmax * dt * (d < 0.6 ? Math.max(0.35, d / 0.6) : 1));
        let nx = g.pos.x + (dx / d) * step, nz = g.pos.z + (dz / d) * step;
        if (!travelling) { const c = this._pCollide(nx, nz, 0.3); nx = c[0]; nz = c[1]; }
        g.pos.x = nx; g.pos.z = nz;
      }
    }
    const moved = Math.hypot(g.pos.x - ox, g.pos.z - oz) / Math.max(dt, 1e-4);
    gc.sp = this._damp(gc.sp, moved, 10, dt);
    g.speed = gc.sp < 0.12 ? 0 : gc.sp;
    // height (raised viewing platforms)
    const atA = E.at != null ? E.anchors[E.at] : (tr ? tr.a : null);
    g.y = null;
    if (atA && atA.viewY != null && Math.hypot(g.pos.x - atA.view[0], g.pos.z - atA.view[1]) < 4.5) g.y = atA.viewY - 1.65;
    g.pos.y = g.y != null ? g.y : H(g.pos.x, g.pos.z);
    // facing + mode
    const camP = E.cam.position;
    if (g.speed > 0.2) {
      g.yaw = this._angDamp(g.yaw, Math.atan2(g.pos.x - ox, g.pos.z - oz), 9, dt);
      g.mode = 'walk';
      g.lookAt = null; g.pointAt = null;
    } else {
      const faceYaw = this._pYaw(g.pos.x, g.pos.z, P.x, P.z);
      g.yaw = this._angDamp(g.yaw, faceYaw, 5, dt);
      gc.lookV.set(camP.x, camP.y, camP.z);
      g.lookAt = gc.lookV;
      g.pointAt = null;
      let mode = 'idle';
      const atStop = (E.at != null && !tr) || (tr && tr.phase === 'turn');
      if (atStop || E.atGate) {
        const since = E.time - gc.arrT;
        mode = since < 9 ? 'talk' : 'idle';
        const aa = atStop ? (E.at != null ? E.anchors[E.at] : tr.a) : null;
        if (aa && aa.look) {
          gc.pointT -= dt;
          if (gc.pointT < 0) { gc.pointT = 9 + Math.random() * 5; gc.pointUntil = E.time + 2.4; }
          if (E.time < (gc.pointUntil || 0)) { mode = 'point'; gc.pointV.set(aa.look[0], aa.look[1], aa.look[2]); g.pointAt = gc.pointV; }
        }
      }
      if (gc.gesture && E.time < gc.gesture.until) {
        mode = gc.gesture.mode;
        if (mode === 'point') {
          const aa = E.at != null ? E.anchors[E.at] : null;
          if (aa && aa.look) { gc.pointV.set(aa.look[0], aa.look[1], aa.look[2]); g.pointAt = gc.pointV; }
        }
      }
      g.mode = mode;
    }
    // safety helmet inside helmet interiors
    const pi = this._pInsideAt(P.x, P.z), gi = this._pInsideAt(g.pos.x, g.pos.z);
    g.helmet = !!((pi && pi.helmet) || (gi && gi.helmet));
  },

  // =============================================================== FLIGHTS
  _pFlyTo(dest, o) {
    const E = this._E;
    const T = E.T;
    o = o || {};
    const cam = E.cam;
    const p0 = cam.position.clone();
    const p3 = new T.Vector3(dest.x, dest.y, dest.z);
    const lE = new T.Vector3(dest.lx, dest.ly, dest.lz);
    const dist = Math.hypot(p3.x - p0.x, p3.z - p0.z);
    const alt = o.alt != null ? o.alt : this._cl(dist * 0.2, 55, 170);
    const H = window.GHG3L.H;
    const g0 = H(p0.x, p0.z);
    const highStart = p0.y - g0 > 70;
    let ex = lE.x - p3.x, ez = lE.z - p3.z;
    const el = Math.hypot(ex, ez) || 1;
    ex /= el; ez /= el;
    const p1 = highStart
      ? new T.Vector3(this._lp(p0.x, p3.x, 0.3), Math.max(p0.y * 0.8, p3.y + alt), this._lp(p0.z, p3.z, 0.3))
      : new T.Vector3(p0.x + (p3.x - p0.x) * 0.12, p0.y + alt, p0.z + (p3.z - p0.z) * 0.12);
    const back = alt * 1.15 + 10;
    const p2 = new T.Vector3(p3.x - ex * back, p3.y + alt * 0.55, p3.z - ez * back);
    const fwd = new T.Vector3();
    cam.getWorldDirection(fwd);
    const l0 = p0.clone().addScaledVector(fwd, 40);
    E.flyLook.copy(l0);
    E.fly = {
      t: 0, T: o.T || this._cl(4.6 + dist / 320, 4.8, 9), p0: p0, p1: p1, p2: p2, p3: p3, l0: l0, lE: lE,
      onDone: o.onDone || null, keepGuide: !!o.keepGuide, endCtl: o.endCtl || 'walk', player: o.player !== false,
      pre: !!o.fadeStart, fadeEnd: !!o.fadeEnd, fadedEnd: false
    };
    if (o.fadeStart) { E.fade.to = 1; E.fade.sp = 5; }
    E.ctl = 'fly';
    this._ui({ eFly: true, eMode: 'fly' });
  },
  _pTickFly(dt) {
    const E = this._E;
    const F = E.fly;
    const cam = E.cam;
    if (F.pre) {
      if (E.fade.a < 0.98) return;
      F.pre = false;
      F.p0.y += 40;
      F.p1.y += 40;
      cam.position.copy(F.p0);
      E.fade.to = 0; E.fade.sp = 2.2;
    }
    F.t += dt / F.T;
    const t = Math.min(1, F.t);
    const u = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const iu = 1 - u;
    const b0 = iu * iu * iu, b1 = 3 * iu * iu * u, b2 = 3 * iu * u * u, b3 = u * u * u;
    const px = F.p0.x * b0 + F.p1.x * b1 + F.p2.x * b2 + F.p3.x * b3;
    const py = F.p0.y * b0 + F.p1.y * b1 + F.p2.y * b2 + F.p3.y * b3;
    const pz = F.p0.z * b0 + F.p1.z * b1 + F.p2.z * b2 + F.p3.z * b3;
    const f = Math.min(1, u + 0.3);
    const mx = this._lp(F.p0.x, F.p3.x, f), mz = this._lp(F.p0.z, F.p3.z, f);
    const my = window.GHG3L.H(mx, mz);
    const w0 = 1 - this._sm(t / 0.25), wE = this._sm((t - 0.6) / 0.37);
    const wm = Math.max(0, 1 - w0 - wE);
    const ws = w0 + wE + wm || 1;
    const lx = (F.l0.x * w0 + mx * wm + F.lE.x * wE) / ws;
    const ly = (F.l0.y * w0 + my * wm + F.lE.y * wE) / ws;
    const lz = (F.l0.z * w0 + mz * wm + F.lE.z * wE) / ws;
    const k = 1 - Math.exp(-6 * dt);
    E.flyLook.x += (lx - E.flyLook.x) * k;
    E.flyLook.y += (ly - E.flyLook.y) * k;
    E.flyLook.z += (lz - E.flyLook.z) * k;
    cam.position.set(px, py, pz);
    if (t > 0.97) E.flyLook.lerp(F.lE, 0.35);
    cam.lookAt(E.flyLook);
    E.camLook.copy(E.flyLook);
    if (F.fadeEnd && !F.fadedEnd && t > 0.82) { F.fadedEnd = true; E.fade.to = 1; E.fade.sp = 5; }
    if (t >= 1) {
      E.fly = null;
      this._pFlyEnd(F);
    }
  },
  _pFlyEnd(F) {
    const E = this._E;
    const cam = E.cam;
    cam.position.copy(F.p3);
    cam.lookAt(F.lE);
    E.camLook.copy(F.lE);
    if (F.player) {
      const P = E.player;
      P.x = F.p3.x; P.z = F.p3.z; P.y = F.p3.y;
      P.yaw = this._pYaw(P.x, P.z, F.lE.x, F.lE.z);
      P.pitch = this._pPitch(P.x, P.y, P.z, F.lE.x, F.lE.y, F.lE.z);
      P.vx = 0; P.vz = 0;
    }
    E.ctl = F.endCtl;
    if (F.fadeEnd || F.pre) { E.fade.to = 0; E.fade.sp = 2.5; }
    this._ui({ eFly: false, eMode: F.endCtl === 'walk' ? 'walk' : F.endCtl });
    if (F.onDone) F.onDone();
  },
  _pFlyFinish() {
    const E = this._E;
    const F = E.fly;
    if (!F) return;
    E.fly = null;
    this._pFlyEnd(F);
  },

  // =============================================================== FADE
  _pFade(cb) {
    const E = this._E;
    E.fade.to = 1; E.fade.sp = 5; E.fade.cb = cb;
  },
  _pTickFade(dt) {
    const E = this._E;
    const F = E.fade;
    if (!F) return;
    if (F.a !== F.to) {
      const s = F.sp * dt;
      F.a = F.a < F.to ? Math.min(F.to, F.a + s) : Math.max(F.to, F.a - s);
    }
    if (F.cb && F.a >= 0.99) {
      const cb = F.cb;
      F.cb = null;
      cb();
      F.to = 0; F.sp = 3;
    }
    E.fadeM.visible = F.a > 0.002;
    E.fadeM.material.uniforms.uA.value = F.a;
  },

  // =============================================================== PLAYER
  _tickPlayer(dt) {
    const E = this._E;
    const P = E.player;
    if (!P) return;
    const K = E.keys;
    const can = E.ctl === 'walk' && !E.travel && !E.fly;
    let fwd = 0, str = 0, turn = 0;
    if (can) {
      fwd = (K.KeyW || K.ArrowUp ? 1 : 0) - (K.KeyS || K.ArrowDown ? 1 : 0);
      str = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0);
      turn = (K.ArrowLeft ? 1 : 0) - (K.ArrowRight ? 1 : 0);
    }
    P.yaw += turn * 1.8 * dt;
    const run = K.ShiftLeft || K.ShiftRight;
    // brisk walk / jog (the town is ~3 x 2 km; drone hops cover the long legs)
    let speed = run ? 8.5 : 3.4;
    // touch joystick (analog): push past ~90 % to jog
    const J = can && E.joy ? E.joy : null;
    const jm = J ? Math.min(1, Math.hypot(J.x, J.y)) : 0;
    let dx = 0, dz = 0;
    if (fwd || str || jm > 0.12) {
      E.autoWalk = null;
      if (!fwd && !str) { fwd = -J.y; str = J.x; speed = jm > 0.9 ? 8.5 : 3.4 * Math.max(0.35, jm / 0.9); }
      const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), rx = -Math.cos(P.yaw), rz = Math.sin(P.yaw);
      dx = fx * fwd + rx * str; dz = fz * fwd + rz * str;
      const l = Math.hypot(dx, dz) || 1;
      dx /= l; dz /= l;
    } else if (E.autoWalk && can) {
      const A = E.autoWalk;
      const ax = A.x - P.x, az = A.z - P.z;
      const d = Math.hypot(ax, az);
      if (d < 0.35) E.autoWalk = null;
      else {
        dx = ax / d; dz = az / d;
        speed = d > 30 ? 5.5 : 3.4;
        P.yaw = this._angDamp(P.yaw, Math.atan2(dx, dz), 2.5, dt);
        A.t = (A.t || 0) + dt;
        if (A.t > 0.6) {
          if (A.last != null && A.last - d < 0.12) E.autoWalk = null;
          A.last = d; A.t = 0;
        }
      }
    }
    P.vx = this._damp(P.vx, dx * speed, 9, dt);
    P.vz = this._damp(P.vz, dz * speed, 9, dt);
    if (can && (Math.abs(P.vx) > 1e-3 || Math.abs(P.vz) > 1e-3)) {
      let nx = P.x + P.vx * dt, nz = P.z + P.vz * dt;
      const c = this._pCollide(nx, nz, 0.3);
      nx = this._cl(c[0], -1750, 1550);
      nz = this._cl(c[1], -1550, 1300);
      P.sp = Math.hypot(nx - P.x, nz - P.z) / Math.max(dt, 1e-4);
      P.x = nx; P.z = nz;
    } else if (!E.travel) P.sp = this._damp(P.sp || 0, 0, 8, dt);
    // head bob + eye height (cadence capped so jogging does not jitter)
    const sp = P.sp || 0;
    P.phase += Math.min(sp, 4.4) * dt * 1.85;
    const bobT = sp > 0.3 && (E.ctl === 'walk') ? Math.sin(P.phase * 2) * 0.024 * Math.min(1, sp / 2) : 0;
    P.bob = this._damp(P.bob, bobT, 12, dt);
    if (E.ctl === 'walk') P.y = this._damp(P.y, this._pEyeY(P.x, P.z), 10, dt);
    // interiors (also drives sky.js point lights)
    E.insideObj = E.ctl === 'walk' || E.ctl === 'fly' && E.cam.position.y - window.GHG3L.H(E.cam.position.x, E.cam.position.z) < 6 ? this._pInsideAt(E.ctl === 'walk' ? P.x : E.cam.position.x, E.ctl === 'walk' ? P.z : E.cam.position.z) : null;
  },

  // =============================================================== CAMERA
  _pCineCam(dt, snap) {
    const E = this._E;
    const C = E.ctl === 'finale' && E.fin ? E.fin : E.cine;
    C.th += dt * C.sp;
    const x = C.cx + Math.sin(C.th) * C.R, z = C.cz + Math.cos(C.th) * C.R;
    const cam = E.cam;
    E.pv.set(x, C.alt, z);
    if (snap) { cam.position.copy(E.pv); E.camLook.set(C.cx, 0, C.cz); }
    else {
      const k = 1 - Math.exp(-1.6 * dt);
      cam.position.lerp(E.pv, k);
      E.camLook.x += (C.cx - E.camLook.x) * k;
      E.camLook.y += (0 - E.camLook.y) * k;
      E.camLook.z += (C.cz - E.camLook.z) * k;
    }
    cam.lookAt(E.camLook);
    E.focus.set(C.cx, 0, C.cz);
    E.shadowR = 650;
  },
  _tickCam(dt) {
    const E = this._E;
    const P = E.player;
    if (!P) return;
    const cam = E.cam;
    let fov = 70, near = 0.25, far = 4500;
    if (E.ctl === 'intro' || E.ctl === 'finale') {
      this._pCineCam(dt, false);
      fov = 50; near = 2; far = 9000;
    } else if (E.ctl === 'overview') {
      const O = E.orbit;
      const H = window.GHG3L.H;
      const gy = H(O.tx, O.tz);
      const s = Math.sin(O.ph);
      E.pv.set(O.tx + s * Math.sin(O.th) * O.r, gy + Math.cos(O.ph) * O.r, O.tz + s * Math.cos(O.th) * O.r);
      const k = 1 - Math.exp(-3 * dt);
      cam.position.lerp(E.pv, k);
      E.camLook.x += (O.tx - E.camLook.x) * k;
      E.camLook.y += (gy - E.camLook.y) * k;
      E.camLook.z += (O.tz - E.camLook.z) * k;
      cam.lookAt(E.camLook);
      E.focus.set(O.tx, 0, O.tz);
      E.shadowR = this._cl(O.r * 0.6, 120, 650);
      fov = 50; near = 1.5; far = 9000;
    } else if (E.ctl === 'fly') {
      E.focus.set(cam.position.x, 0, cam.position.z);
      E.shadowR = 170;
      fov = 62; near = 0.4; far = 9000;
    } else {
      const yaw = P.yaw + E.lookOff.yaw;
      const pitch = this._cl(P.pitch + E.lookOff.pitch, -1.3, 1.3);
      const cp = Math.cos(pitch);
      cam.position.set(P.x, P.y + P.bob, P.z);
      E.camLook.set(P.x + Math.sin(yaw) * cp * 20, P.y + P.bob + Math.sin(pitch) * 20, P.z + Math.cos(yaw) * cp * 20);
      cam.lookAt(E.camLook);
      E.focus.set(P.x, 0, P.z);
      E.shadowR = 75;
      // a little wider view while jogging
      fov = E.fovWalk + 5 * this._cl(((P.sp || 0) - 4.5) / 3.5, 0, 1);
      far = Math.min(4500, Math.max(900, (E.scene.fog ? E.scene.fog.far : 1700) * 1.12));
    }
    E.fovCur = Math.abs(E.fovCur - fov) < 0.05 ? fov : this._damp(E.fovCur, fov, 4, dt);
    if (cam.fov !== E.fovCur || cam.near !== near || cam.far !== far) {
      cam.fov = E.fovCur; cam.near = near; cam.far = far;
      cam.updateProjectionMatrix();
    }
    // keep the activity + guide visible beside the question card (card sits on the right)
    const st = this.state || {};
    const firstPerson = E.ctl !== 'overview' && E.ctl !== 'intro' && E.ctl !== 'finale' && E.ctl !== 'fly';
    let cardOpen = false;
    if (st.eArrived != null && (st.view || 'map') === 'map') {
      const GC = window.GHGTownContent;
      const so = GC && GC.stops ? GC.stops.find((x) => x.id === st.eArrived) : null;
      const nl = so && so.guide ? so.guide.length : 0;
      cardOpen = !!(st.answers && st.answers[st.eArrived] != null) || (st.line || 0) >= nl;
    }
    const wantOff = firstPerson && cardOpen && E.w > 900 ? Math.min(240, E.w * 0.16) : 0;
    E.vOff = this._damp(E.vOff || 0, wantOff, 3.5, dt);
    if (Math.abs(E.vOff) > 0.5) cam.setViewOffset(E.w, E.h, E.vOff, 0, E.w, E.h);
    else if (cam.view && cam.view.enabled) { cam.clearViewOffset(); E.vOff = 0; }
  },

  // =============================================================== PINS
  _pInitPins() {
    const E = this._E;
    const T = E.T;
    E.pins = [];
    for (const k of Object.keys(E.anchors)) {
      const id = +k;
      const a = E.anchors[k];
      if (!a || !a.pin) continue;
      const cv = document.createElement('canvas');
      cv.width = 320; cv.height = 112;
      const tex = new T.CanvasTexture(cv);
      tex.encoding = T.sRGBEncoding;
      tex.anisotropy = 4;
      const mat = new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, sizeAttenuation: false, toneMapped: false, fog: false });
      const sp = new T.Sprite(mat);
      sp.center.set(56 / 320, 1 - 104 / 112);
      sp.position.set(a.pin[0], a.pin[1], a.pin[2]);
      sp.renderOrder = 30;
      sp.userData = { id: id, cv: cv, tex: tex, key: '' };
      E.scene.add(sp);
      E.pins.push(sp);
      this._pDrawPin(sp, true);
    }
  },
  _pDrawPin(sp, force) {
    const E = this._E;
    const id = sp.userData.id;
    const st = E.pinStatus[id] || 'todo';
    const tgt = !!(E.travel && E.travel.id === id);
    const key = st + (tgt ? '*' : '');
    if (!force && key === sp.userData.key) return;
    sp.userData.key = key;
    const g = sp.userData.cv.getContext('2d');
    g.clearRect(0, 0, 320, 112);
    const col = st === 'ok' ? '#15803D' : (st === 'bad' ? '#64748B' : '#E8590C');
    const title = this._pShort(id);
    g.font = this._font(700, 25);
    const tw = Math.min(196, g.measureText(title).width);
    g.save();
    g.shadowColor = 'rgba(16,24,20,0.28)'; g.shadowBlur = 8; g.shadowOffsetY = 2;
    this._rr(g, 84, 28, tw + 34, 46, 23);
    g.fillStyle = 'rgba(255,255,255,0.97)';
    g.fill();
    g.restore();
    this._fitText(g, title, 84 + 20, 51, 196, 25, 700, '#17211B', 'left');
    if (tgt) {
      g.beginPath(); g.arc(56, 50, 50, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,213,79,0.6)'; g.fill();
    }
    g.save();
    g.shadowColor = 'rgba(16,24,20,0.3)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
    g.beginPath(); g.moveTo(41, 78); g.lineTo(56, 106); g.lineTo(71, 78); g.closePath();
    g.fillStyle = col; g.fill();
    g.beginPath(); g.arc(56, 50, 38, 0, Math.PI * 2);
    g.fillStyle = col; g.fill();
    g.restore();
    g.lineWidth = 5; g.strokeStyle = '#FFFFFF';
    g.beginPath(); g.arc(56, 50, 38, 0, Math.PI * 2); g.stroke();
    this._fitText(g, String(id), 56, 52, 60, 36, 700, '#FFFFFF', 'center', '"Bai Jamjuree", "IBM Plex Sans Thai Looped", sans-serif');
    if (st === 'ok' || st === 'bad') {
      g.beginPath(); g.arc(86, 22, 15, 0, Math.PI * 2);
      g.fillStyle = '#FFFFFF'; g.fill();
      g.lineWidth = 4; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      if (st === 'ok') { g.moveTo(79, 22); g.lineTo(84, 27); g.lineTo(93, 17); } else { g.moveTo(80, 16); g.lineTo(92, 28); g.moveTo(92, 16); g.lineTo(80, 28); }
      g.stroke();
    }
    sp.userData.tex.needsUpdate = true;
  },
  _pRedrawPins(force) {
    const E = this._E;
    if (!E || !E.pins) return;
    for (const sp of E.pins) this._pDrawPin(sp, force);
  },
  _redrawHud() { this._pRedrawPins(true); },
  _pPickPin(cx, cy) {
    const E = this._E;
    const vis = E.pins.concat(E.mq || []).filter((p) => p.visible && p.material.opacity > 0.25);
    if (!vis.length) return null;
    const r = E.canvas.getBoundingClientRect();
    E.ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    E.ray.setFromCamera(E.ndc, E.cam);
    const hits = E.ray.intersectObjects(vis, false);
    return hits.length ? hits[0].object.userData.id : null;
  },
  _pTickPins() {
    const E = this._E;
    const cam = E.cam;
    const k = (2 * Math.tan((cam.fov * Math.PI) / 360)) / Math.max(1, E.h);
    const air = E.ctl !== 'walk';
    const tgtId = E.travel ? E.travel.id : null;
    for (const sp of E.pins) {
      const id = sp.userData.id;
      const a = E.anchors[id];
      let show = E.labelsOn && !(E.exploreOn && !E.pinStatus[id]);
      let op = 1;
      if (!air) {
        const d = cam.position.distanceTo(sp.position);
        if (E.at === id && !E.travel) show = false;
        else if (id !== tgtId) op = 1 - this._sm((d - 110) / 50);
        if (op < 0.02) show = false;
      }
      sp.visible = show;
      sp.material.opacity = op;
      sp.material.depthTest = !air && id !== tgtId;
      sp.position.y = a.pin[1] + (air ? 0 : Math.sin(E.time * 2.1 + id) * 0.12);
      sp.scale.set(160 * k, 56 * k, 1);
      if (id === tgtId || sp.userData.key.indexOf('*') >= 0) this._pDrawPin(sp);
    }
  },
  // seen from the air, stops that sit close together (the civic centre) would print their pins on top of each other:
  // lift the later ones just enough to stack them like call-outs (screen-space greedy placement, cheap: <= 19 pins)
  _pUnstackPins() {
    const E = this._E;
    const cam = E.cam;
    const W = E.w || 1, H = E.h || 1;
    const k = (2 * Math.tan((cam.fov * Math.PI) / 360)) / Math.max(1, H);
    const v = E.v1;
    const placed = [];
    // stop pins first (by number), then the "?" bubbles; each keeps the height its own tick gave it as the base
    const list = E.pins.filter((sp) => sp.visible).sort((p, q) => p.userData.id - q.userData.id).map((sp) => [sp, 66, 21])
      .concat((E.mq || []).filter((sp) => sp.visible).sort((p, q) => p.userData.id - q.userData.id).map((sp) => [sp, 24, 24]));
    for (const it of list) {
      const sp = it[0];
      const y0 = sp.position.y;
      const step = (it[2] * 2 + 4) * k * cam.position.distanceTo(sp.position);
      let lift = 0, r = null;
      for (let t = 0; t < 7; t++) {
        v.set(sp.position.x, y0 + lift, sp.position.z).project(cam);
        const sx = (v.x + 1) * 0.5 * W, sy = (1 - v.y) * 0.5 * H;
        r = [sx - it[1], sy - it[2], sx + it[1], sy + it[2]];
        let hit = false;
        for (const q of placed) if (r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]) { hit = true; break; }
        if (!hit) break;
        lift += step;
      }
      placed.push(r);
      sp.position.y = y0 + lift;
    }
  },

  // =============================================================== FX: billboards, particles, gas labels, rain, overlay
  _pBB(n, map, o) {
    const E = this._E;
    const T = E.T;
    const g = new T.InstancedBufferGeometry();
    const q = new T.PlaneGeometry(1, 1);
    g.setIndex(q.index);
    g.setAttribute('position', q.attributes.position);
    g.setAttribute('uv', q.attributes.uv);
    const A = (key, size) => {
      const at = new T.InstancedBufferAttribute(new Float32Array(n * size), size);
      at.setUsage(T.DynamicDrawUsage);
      g.setAttribute(key, at);
      return at;
    };
    const bb = { n: n, g: g, pos: A('iPos', 3), size: A('iSize', 2), col: A('iCol', 4), rot: A('iRot', 1), uvr: A('iUv', 4) };
    g.instanceCount = 0;
    const vs = [
      'attribute vec3 iPos; attribute vec2 iSize; attribute vec4 iCol; attribute float iRot; attribute vec4 iUv;',
      'varying vec2 vUv; varying vec4 vCol;',
      '#include <fog_pars_vertex>',
      'void main() {',
      '  vUv = iUv.xy + uv * iUv.zw; vCol = iCol;',
      '  vec4 mvPosition = modelViewMatrix * vec4(iPos, 1.0);',
      '  float c = cos(iRot), s = sin(iRot);',
      '  vec2 q = position.xy * iSize;',
      '  mvPosition.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y);',
      '  gl_Position = projectionMatrix * mvPosition;',
      '  #include <fog_vertex>',
      '}'
    ].join('\n');
    const fs = [
      'uniform sampler2D map; varying vec2 vUv; varying vec4 vCol;',
      '#include <fog_pars_fragment>',
      'void main() {',
      '  vec4 t = texture2D(map, vUv);',
      '  gl_FragColor = vec4(vCol.rgb * t.rgb, t.a * vCol.a);',
      '  if (gl_FragColor.a < 0.004) discard;',
      '#ifndef LABEL',
      '  #include <tonemapping_fragment>',
      '  #include <encodings_fragment>',
      '  #include <fog_fragment>',
      '#endif',
      '}'
    ].join('\n');
    const mat = new T.ShaderMaterial({
      uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { map: { value: null } }]),
      vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, depthTest: !o.label,
      blending: o.add ? T.AdditiveBlending : T.NormalBlending, fog: !o.label, toneMapped: !o.label,
      defines: o.label ? { LABEL: 1 } : {}
    });
    mat.uniforms.map.value = map;
    const mesh = new T.Mesh(g, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = o.order || 5;
    E.scene.add(mesh);
    bb.mesh = mesh;
    return bb;
  },
  _pBBWrite(bb, list) {
    const n = Math.min(list.length, bb.n);
    const P = bb.pos.array, S = bb.size.array, C = bb.col.array, R = bb.rot.array, U = bb.uvr.array;
    for (let i = 0; i < n; i++) {
      const p = list[i];
      P[i * 3] = p.x; P[i * 3 + 1] = p.y; P[i * 3 + 2] = p.z;
      S[i * 2] = p.sw; S[i * 2 + 1] = p.sh;
      C[i * 4] = p.r; C[i * 4 + 1] = p.g; C[i * 4 + 2] = p.b; C[i * 4 + 3] = p.al;
      R[i] = p.rot || 0;
      U[i * 4] = p.u0 || 0; U[i * 4 + 1] = p.v0 || 0; U[i * 4 + 2] = p.du || 1; U[i * 4 + 3] = p.dv || 1;
    }
    for (const at of [bb.pos, bb.size, bb.col, bb.rot, bb.uvr]) {
      at.updateRange.offset = 0;
      at.updateRange.count = Math.max(1, n * at.itemSize);
      at.needsUpdate = true;
    }
    bb.g.instanceCount = n;
  },
  _pInitFx() {
    const E = this._E;
    const C = window.GHGTownContent;
    const gases = ['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3'];
    const def = { CO2: ['CO₂', '#475569'], CH4: ['CH₄', '#B45309'], N2O: ['N₂O', '#0F766E'], HFCs: ['HFCs', '#0369A1'], PFCs: ['PFCs', '#6D28D9'], SF6: ['SF₆', '#BE185D'], NF3: ['NF₃', '#9F1239'] };
    E.gasRow = {};
    gases.forEach((gk, i) => { E.gasRow[gk] = i; });
    const draw = (ctx, W, H) => {
      ctx.clearRect(0, 0, W, H);
      gases.forEach((gk, i) => {
        const info = (C && C.GAS && C.GAS[gk]) || {};
        const t = info.t || def[gk][0];
        const col = info.color || def[gk][1];
        const y = i * 64;
        this._rr(ctx, 8, y + 7, 240, 50, 25);
        ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.stroke();
        this._fitText(ctx, t, 128, y + 33, 200, 34, 700, '#FFFFFF', 'center');
      });
      // row 7: the "mystery gas" label (unsolved stops whose question is about the gas, and every unsolved stop in explore mode)
      const y7 = 7 * 64;
      this._rr(ctx, 8, y7 + 7, 240, 50, 25);
      ctx.fillStyle = '#F2C14E'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.stroke();
      this._fitText(ctx, 'ก๊าซ ?', 128, y7 + 33, 200, 34, 700, '#4A3200', 'center');
    };
    E.gasRow['?'] = 7;
    // stops whose correct answer names a gas: keep their labels a mystery until answered (CO₂e units do not count)
    E.gasHide = {};
    const gLab = (gk) => ((C && C.GAS && C.GAS[gk] && C.GAS[gk].t) || def[gk][0]);
    for (const s of (C && C.stops) || []) {
      const at = s.opts && s.opts[s.ans] != null ? String(s.opts[s.ans]).replace(/(?:t|kg)?CO₂e/g, '') : '';
      if (at && gases.some((gk) => at.indexOf(gLab(gk)) >= 0)) E.gasHide[s.id] = true;
    }
    E.gasTex = this._canvasTex(256, 512, draw, { linear: true, text: true });
    E.bbSmoke = this._pBB(1600, E.tex.puff, { order: 8 });
    E.bbFire = this._pBB(600, E.tex.glow, { add: true, order: 9 });
    E.bbGas = this._pBB(200, E.gasTex, { label: true, order: 12 });
    const star = this._canvasTex(64, 64, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      const c = W / 2;
      const gr = g.createRadialGradient(c, c, 0, c, c, c);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.75)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (const v of [true, false]) {
        const l = v ? g.createLinearGradient(c, 0, c, H) : g.createLinearGradient(0, c, W, c);
        l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.5, 'rgba(255,255,255,0.95)'); l.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = l;
        if (v) g.fillRect(c - 1.6, 0, 3.2, H); else g.fillRect(0, c - 1.6, W, 3.2);
      }
    }, { linear: true });
    E.bbSpark = this._pBB(320, star, { add: true, order: 33 });
    E.fxDef = {
      smoke: { rate: 6, size: 2.2, grow: 4.4, rise: 2.0, spread: 0.6, life: 9, color: '#868C92', alpha: 0.34 },
      steam: { rate: 6, size: 1.4, grow: 3.2, rise: 1.6, spread: 0.4, life: 4.2, color: '#F3F5F7', alpha: 0.42 },
      exhaust: { rate: 5, size: 0.25, grow: 5, rise: 0.35, spread: 0.08, life: 1.8, color: '#5B5F63', alpha: 0.4 },
      fire: { rate: 30, size: 1.1, grow: 0.35, rise: 2.3, spread: 0.6, life: 0.95, color: '#FF7A1A', alpha: 0.82 },
      dust: { rate: 3, size: 1.2, grow: 2.6, rise: 0.25, spread: 1.6, life: 4.5, color: '#B89F7C', alpha: 0.3 }
    };
  },
  _pSpawn(em, D, big) {
    const E = this._E;
    const add = !!D.add;
    const list = add ? E.partsA : E.parts;
    const cap = add ? E.bbFire.n : E.bbSmoke.n;
    if (list.length >= cap) return;
    const spread = em.spread != null ? em.spread : D.spread;
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * spread;
    const rise = (em.rise != null ? em.rise : D.rise) * (0.8 + Math.random() * 0.4);
    const size = (em.size != null ? em.size : D.size) * (big ? 1.8 : 1) * (0.8 + Math.random() * 0.4);
    const col = this._lc(em.color || D.color);
    const j = 0.92 + Math.random() * 0.16;
    list.push({
      x: em.pos[0] + Math.cos(a) * rr, y: em.pos[1] + Math.random() * 0.2 * size, z: em.pos[2] + Math.sin(a) * rr,
      vx: (Math.random() - 0.5) * rise * 0.18, vy: rise * (big && em.type === 'smoke' ? 1.35 : 1), vz: (Math.random() - 0.5) * rise * 0.18,
      age: 0, life: (em.life || D.life) * (0.8 + Math.random() * 0.4) * (big && em.type === 'smoke' ? 1.8 : 1), s0: size * (big && em.type === 'smoke' ? 0.75 : 1), grow: big && em.type === 'smoke' ? 3.4 : D.grow, a0: (em.alpha || D.alpha), y0: em.pos[1],
      r: col[0] * j, g: col[1] * j, b: col[2] * j, al: 0, sw: size, sh: size,
      rot: Math.random() * 6.28, rv: (Math.random() - 0.5) * 0.6, fire: em.type === 'fire', ember: false, wind: em.type !== 'fire', wk: big ? 2.4 : 1
    });
    if (em.type === 'fire' && Math.random() < 0.22 && E.partsA.length < E.bbFire.n) {
      const c3 = this._lc('#FF9A3C');
      E.partsA.push({
        x: em.pos[0] + Math.cos(a) * rr * 0.5, y: em.pos[1] + size * 0.4, z: em.pos[2] + Math.sin(a) * rr * 0.5,
        vx: 0, vy: rise * 0.5, vz: 0, age: 0, life: 0.7, s0: size * 2.6, grow: 1, a0: 0.16 + 0.3 * (E.nightK || 0),
        r: c3[0], g: c3[1], b: c3[2], al: 0, sw: size * 2.6, sh: size * 2.6, rot: 0, rv: 0, fire: true, ember: false, glow: true, wind: false
      });
    }
    if (em.type === 'fire' && Math.random() < 0.16 && E.partsA.length < E.bbFire.n) {
      const c2 = this._lc('#FFC266');
      E.partsA.push({
        x: em.pos[0] + Math.cos(a) * rr, y: em.pos[1] + 0.3, z: em.pos[2] + Math.sin(a) * rr,
        vx: (Math.random() - 0.5) * 1.2, vy: 2.5 + Math.random() * 2.5, vz: (Math.random() - 0.5) * 1.2,
        age: 0, life: 1.2 + Math.random() * 1.2, s0: 0.1 + Math.random() * 0.08, grow: 1, a0: 1,
        r: c2[0] * 3, g: c2[1] * 2.2, b: c2[2] * 1.2, al: 0, sw: 0.12, sh: 0.12, rot: 0, rv: 0, fire: true, ember: true, wind: true
      });
    }
  },
  _pTickParticles(dt) {
    const E = this._E;
    const cam = E.cam.position;
    // spawn
    for (const em of E.emitters) {
      if (!em || !em.pos) continue;
      if (typeof em.on === 'function' && !em.on()) continue;
      const D = E.fxDef[em.type] || E.fxDef.smoke;
      const d = Math.hypot(em.pos[0] - cam.x, em.pos[2] - cam.z);
      if (!em.big && d > 600) continue;
      let rate = (em.rate || D.rate) * (em.big ? 1.5 : 1);
      if (!em.big && d > 250) rate *= 0.5;
      em._acc = (em._acc || 0) + rate * dt;
      let n = Math.floor(em._acc);
      em._acc -= n;
      if (n > 14) n = 14;
      for (let i = 0; i < n; i++) this._pSpawn(em, D, !!em.big);
    }
    // update
    const W = E.wind;
    const upd = (list) => {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.age += dt;
        if (p.age >= p.life) { list[i] = list[list.length - 1]; list.pop(); continue; }
        const k = p.age / p.life;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.wind) { const wk = Math.min(1, k * 2.2) * (1 + Math.max(0, p.y - (p.y0 || 0)) / 22) * (p.wk || 1); p.x += W.x * wk * dt; p.z += W.z * wk * dt; }
        if (!p.fire) p.vy *= 1 - 0.18 * dt;
        p.rot += p.rv * dt;
        const s = p.grow >= 1 ? p.s0 * (1 + (p.grow - 1) * (1 - Math.pow(1 - k, 2))) : p.s0 * (1 - (1 - p.grow) * k);
        p.sw = s; p.sh = s;
        let al = p.a0 * Math.min(1, k / 0.12) * (1 - this._sm((k - 0.45) / 0.55));
        if (p.ember) al = p.a0 * (1 - k) * (0.6 + 0.4 * Math.sin(p.age * 30));
        else if (p.glow) al = p.a0 * Math.sin(Math.PI * k);
        else if (p.fire) {
          al *= 0.75 + 0.25 * Math.sin(p.age * 24 + p.rot * 5);
          // yellow core -> orange -> deep red
          const c0 = k < 0.35 ? k / 0.35 : 1, c1 = k < 0.35 ? 0 : (k - 0.35) / 0.65;
          p.r = 1.0 - 0.45 * c1; p.g = 0.62 - 0.36 * c0 - 0.2 * c1; p.b = 0.14 - 0.11 * c0 - 0.02 * c1;
        }
        p.al = al;
      }
    };
    upd(E.parts);
    upd(E.partsA);
    this._pBBWrite(E.bbSmoke, E.parts);
    this._pBBWrite(E.bbFire, E.partsA);
  },
  _pTickGas(dt) {
    const E = this._E;
    const P = E.player;
    const list = E.gasL;
    const walk = E.ctl === 'walk';
    if (E.labelsOn) {
      for (const k in E.anchors) {
        const a = E.anchors[k];
        if (!a || !a.emit || !a.gas || !a.gas.length) continue;
        const id = +k;
        const tr = E.travel;
        const arrived = E.at === id || (tr && tr.id === id && tr.phase !== 'fly' && tr.len - tr.sCam < 25);
        const d = Math.hypot(a.emit[0] - P.x, a.emit[2] - P.z);
        if (!walk || (!arrived && d > 60)) continue;
        a._gt = (a._gt || 0) - dt;
        if (a._gt > 0) continue;
        a._gt = (arrived ? 1.05 : 2.2) * (0.8 + Math.random() * 0.4);
        if (list.length >= E.bbGas.n) continue;
        let mine = 0;
        for (const q of list) if (q.aid === id) mine++;
        if (mine >= (arrived ? 4 : 2)) continue;
        const secret = (E.exploreOn || (E.gasHide && E.gasHide[id])) && !E.pinStatus[id];
        const gk = secret ? '?' : a.gas[(Math.random() * a.gas.length) | 0];
        const row = E.gasRow[gk] != null ? E.gasRow[gk] : 0;
        const sp = a.spread || 1;
        const rm = this._pScope(id) === 'rm';
        const ang = Math.random() * Math.PI * 2, rr = (0.35 + 0.65 * Math.sqrt(Math.random())) * sp;
        let w = this._cl(1.7 * (1 + sp / 6), 1.7, 4.2);
        const dCam = Math.hypot(a.emit[0] + Math.cos(ang) * rr - P.x, a.emit[2] + Math.sin(ang) * rr - P.z);
        w *= this._cl(dCam / 10, 0.42, 1) * (E.insideObj ? 0.75 : 1);
        list.push({
          x: a.emit[0] + Math.cos(ang) * rr, y: a.emit[1] + (rm ? 7 + Math.random() * 3 : Math.random() * 0.5), z: a.emit[2] + Math.sin(ang) * rr,
          vy: rm ? -(0.6 + Math.random() * 0.25) : 0.55 + Math.random() * 0.3, ph: Math.random() * 6.28, age: 0, life: 4.2 + Math.random() * 1.3, aid: id,
          sw: w, sh: w / 4, r: 1, g: 1, b: 1, al: 0, rot: 0, u0: 0, v0: 1 - (row + 1) / 8, du: 1, dv: 1 / 8
        });
      }
    }
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.age += dt;
      if (p.age >= p.life || !E.labelsOn) { list[i] = list[list.length - 1]; list.pop(); continue; }
      const k = p.age / p.life;
      p.y += p.vy * dt;
      p.x += Math.sin(p.age * 1.6 + p.ph) * 0.14 * dt;
      p.al = Math.min(1, k / 0.12) * (1 - this._sm((k - 0.6) / 0.4));
    }
    this._pBBWrite(E.bbGas, walk ? list : []);
  },
  _pInitRain() {
    const E = this._E;
    const T = E.T;
    const N = 2600;
    const pos = new Float32Array(N * 6);
    const wp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { wp[i * 3] = (Math.random() - 0.5) * 50; wp[i * 3 + 1] = Math.random() * 30 - 4; wp[i * 3 + 2] = (Math.random() - 0.5) * 50; }
    const g = new T.BufferGeometry();
    const at = new T.BufferAttribute(pos, 3);
    at.setUsage(T.DynamicDrawUsage);
    g.setAttribute('position', at);
    const m = new T.LineSegments(g, new T.LineBasicMaterial({ color: this._lcol('#C8D5DF'), transparent: true, opacity: 0, depthWrite: false, fog: false }));
    m.frustumCulled = false;
    m.visible = false;
    m.renderOrder = 15;
    E.scene.add(m);
    E.rain = { N: N, wp: wp, pos: pos, at: at, mesh: m, init: false };
  },
  _pTickRain(dt) {
    const E = this._E;
    const R = E.rain;
    const k = E.rainK || 0;
    R.mesh.visible = k > 0.02 && E.ctl !== 'intro';
    if (!R.mesh.visible) return;
    const c = E.cam.position;
    const wp = R.wp, pos = R.pos;
    const wx = E.wind.x * 0.06, wz = E.wind.z * 0.06;
    const n = Math.floor(R.N * Math.min(1, k));
    if (!R.init) for (let i = 0; i < R.N; i++) { wp[i * 3] += c.x; wp[i * 3 + 1] += c.y; wp[i * 3 + 2] += c.z; }
    for (let i = 0; i < n; i++) {
      let x = wp[i * 3], y = wp[i * 3 + 1], z = wp[i * 3 + 2];
      y -= 15 * dt;
      x += E.wind.x * 0.4 * dt; z += E.wind.z * 0.4 * dt;
      if (y < c.y - 4) y += 30;
      if (y > c.y + 26) y -= 30;
      if (x < c.x - 25) x += 50; else if (x > c.x + 25) x -= 50;
      if (z < c.z - 25) z += 50; else if (z > c.z + 25) z -= 50;
      wp[i * 3] = x; wp[i * 3 + 1] = y; wp[i * 3 + 2] = z;
      pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x - wx; pos[i * 6 + 4] = y - 0.75; pos[i * 6 + 5] = z - wz;
    }
    R.init = true;
    R.at.updateRange.offset = 0;
    R.at.updateRange.count = n * 6;
    R.at.needsUpdate = true;
    R.mesh.geometry.setDrawRange(0, n * 2);
    R.mesh.material.opacity = 0.34 * Math.min(1, k);
    // lightning
    if (k > 0.7) {
      E.ltT -= dt;
      if (E.ltT < 0) { E.ltT = 9 + Math.random() * 14; E.flash = { t: 0, base: E.hemi.intensity }; }
    }
    if (E.flash) {
      const F = E.flash;
      F.t += dt;
      const p = F.t < 0.08 ? 1 : (F.t < 0.16 ? 0.2 : (F.t < 0.26 ? 0.8 : Math.max(0, 1 - (F.t - 0.26) / 0.25)));
      E.hemi.intensity = F.base + 2.4 * p;
      if (F.t > 0.55) { E.hemi.intensity = F.base; E.flash = null; }
    }
  },
  _pInitOverlay() {
    const E = this._E;
    const T = E.T;
    const mat = new T.ShaderMaterial({
      uniforms: { uA: { value: 0 } },
      vertexShader: 'void main(){ gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }',
      fragmentShader: 'uniform float uA; void main(){ gl_FragColor = vec4(0.02, 0.03, 0.04, uA); }',
      transparent: true, depthTest: false, depthWrite: false
    });
    const m = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
    m.frustumCulled = false;
    m.renderOrder = 1000;
    m.visible = false;
    E.scene.add(m);
    E.fadeM = m;
    E.fade = { a: 0, to: 0, sp: 4, cb: null };
    const ring = new T.Mesh(new T.RingGeometry(0.2, 0.34, 32).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    ring.visible = false;
    ring.renderOrder = 6;
    E.scene.add(ring);
    E.mark = { m: ring, t: 9 };
  },
  _tickFx(dt) {
    const E = this._E;
    if (!E.player) return;
    this._pTickParticles(dt);
    this._pTickGas(dt);
    this._pTickPins();
    this._pTickMystery(dt);
    if (E.ctl !== 'walk') this._pUnstackPins();
    this._pTickSparks(dt);
    this._pTickBeacon(dt);
    this._pTickRain(dt);
    const M = E.mark;
    M.t += dt;
    if (M.t < 1.1 && E.ctl === 'walk') {
      M.m.visible = true;
      const s = 1 + M.t * 1.6;
      M.m.scale.set(s, 1, s);
      M.m.material.opacity = 0.85 * (1 - M.t / 1.1);
    } else M.m.visible = false;
  },

  // =============================================================== HUD BRIDGE + MINIMAP
  _tickHud(dt) {
    const E = this._E;
    const P = E.player;
    if (!P) return;
    if (E.seek) this._pTickSeek(dt);
    E.cmpT = (E.cmpT || 0) - dt;
    if (E.cmpT <= 0) { E.cmpT = 0.1; this._pCompass(); }
    E.mapT -= dt;
    if (E.map && E.mapT <= 0) { E.mapT = 0.12; this._pMapDraw(); }
    E.hudT -= dt;
    if (E.hudT > 0) return;
    E.hudT = 0.2;
    let fx = P.x, fz = P.z;
    if (E.ctl === 'overview') { fx = E.orbit.tx; fz = E.orbit.tz; }
    else if (E.ctl === 'fly') { fx = E.cam.position.x; fz = E.cam.position.z; }
    const district = E.ctl === 'intro' || E.ctl === 'finale' ? 'เมืองคาร์บอน' : this._pDistrictAt(fx, fz);
    const inside = E.insideObj && E.ctl === 'walk' ? (E.insideObj.label || '') : '';
    let near = null;
    let mys = null, mysD = 0;
    if (E.exploreOn && E.ctl === 'walk' && !E.travel) {
      const ins = E.insideObj;
      let bd = 16;
      for (const k in E.anchors) {
        const a = E.anchors[k];
        if (!a || !a.view) continue;
        const id = +k;
        if (id === E.at || E.pinStatus[id] || (E.found && E.found.id === id)) continue;
        let d = Math.hypot(P.x - a.view[0], P.z - a.view[1]);
        if (a.emit) d = Math.min(d, Math.hypot(P.x - a.emit[0], P.z - a.emit[2]) - (a.spread || 0));
        if (ins && a.inside && a.inside === ins.name) d = Math.min(d, 0.25);
        if (d < bd) { bd = d; mys = id; }
      }
      if (mys != null) { const T = this._pTarget(E.anchors[mys]); mysD = Math.round(Math.hypot(P.x - T[0], P.z - T[2])); }
    }
    E.mysteryId = mys;
    if (E.freeMode && !E.exploreOn && E.ctl === 'walk' && !E.travel) {
      let bd = 12;
      for (const k in E.anchors) {
        const a = E.anchors[k];
        if (!a || !a.view) continue;
        const id = +k;
        if (id === E.at) continue;
        let d = Math.hypot(P.x - a.view[0], P.z - a.view[1]);
        if (a.emit) d = Math.min(d, Math.hypot(P.x - a.emit[0], P.z - a.emit[2]) - (a.spread || 0));
        if (d < bd) { bd = d; near = id; }
      }
    }
    E.nearId = near;
    let dist = 0;
    const tr = E.travel;
    if (tr) {
      dist = tr.phase === 'fly' ? (tr.len + (E.fly ? Math.hypot(E.fly.p3.x - E.cam.position.x, E.fly.p3.z - E.cam.position.z) : 0)) : Math.max(0, tr.len - tr.sCam);
      dist = Math.round(dist);
    }
    let mode = E.ctl;
    if (mode === 'walk') mode = (E.at != null || E.atGate) && !tr ? 'stop' : 'walk';
    this._ui({ eDistrict: district, eInside: inside, eNear: near, eDist: dist, eMode: mode, eMystery: mys, eMysteryD: mysD });
  },

  _mapAttach(el) {
    const E = this._E;
    this.__mapElLast = el || null;
    if (!E || !E.player) { this.__mapEl = el || null; return; }
    if (E.map && E.map.el === el) return;
    if (E.map && E.map.el && E.map.down) E.map.el.removeEventListener('pointerdown', E.map.down);
    if (!el) { E.map = null; return; }
    E.map = { el: el, ctx: el.getContext('2d'), zoom: 'city', view: null };
    E.map.down = (ev) => this._pMapClick(ev);
    el.addEventListener('pointerdown', E.map.down);
    if (!E.mapBase) this._pMapBase();
    this._pMapDraw();
  },
  _pMapBase() {
    const E = this._E;
    const L = window.GHG3L;
    const N = 1536, X0 = -800, Z0 = -1400, S = 2300;
    const cv = document.createElement('canvas');
    cv.width = N; cv.height = N;
    const g = cv.getContext('2d');
    const k = N / S;
    const X = (x) => (x - X0) * k, Z = (z) => (z - Z0) * k;
    g.fillStyle = '#DCE6D0'; g.fillRect(0, 0, N, N);
    // forest hill
    const f = L.lots.forest || { centre: [0, -900], radius: 420 };
    const gr = g.createRadialGradient(X(f.centre[0]), Z(f.centre[1]), 0, X(f.centre[0]), Z(f.centre[1]), f.radius * k);
    gr.addColorStop(0, '#4E7F42'); gr.addColorStop(0.75, '#6E9A5C'); gr.addColorStop(1, 'rgba(110,154,92,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(X(f.centre[0]), Z(f.centre[1]), f.radius * k, 0, Math.PI * 2); g.fill();
    const tint = {
      market: '#F1D2B0', minimart: '#F5B66E', downtownN: '#E9D9C6', downtownS: '#E9D9C6', temple: '#EFD27A', municipal: '#BFD2EE', plaza: '#C9E3BD',
      school: '#F3E39A', hospital: '#BDE3DC', riverside: '#DCD2EC', mill: '#C8CDD3', factoryW: '#CDD1D6', factoryC: '#CDD1D6', substation: '#B8C2CD',
      housing: '#ECE1D1', landfill: '#BFA47E', corn: '#CCDB86', paddy: '#A6D79F', burn: '#D8C089', dairy: '#D9E8B8', gate: '#E8D6A8'
    };
    for (const name in L.lots) {
      const lot = L.lots[name];
      if (!lot.rect) continue;
      const r = lot.rect;
      g.fillStyle = tint[name] || '#E3E3D8';
      g.fillRect(X(Math.min(r[0], r[2])), Z(Math.min(r[1], r[3])), Math.abs(r[2] - r[0]) * k, Math.abs(r[3] - r[1]) * k);
    }
    // river
    const R = L.river;
    g.strokeStyle = '#7DB3D8';
    g.lineWidth = R.w * k;
    g.lineCap = 'round';
    g.beginPath();
    for (let z = Z0 - 50; z <= Z0 + S + 50; z += 10) { const x = R.x(z); if (z === Z0 - 50) g.moveTo(X(x), Z(z)); else g.lineTo(X(x), Z(z)); }
    g.stroke();
    // roads
    g.lineCap = 'butt';
    for (const pass of [0, 1]) {
      for (const r of L.roads) {
        const w = pass === 0 ? r.w + (r.side || 0) * 2 + 1.5 : r.w;
        g.strokeStyle = pass === 0 ? (r.rural ? '#C9BC9A' : '#AEB4AC') : (r.rural ? '#EFE6CF' : '#FFFFFF');
        g.lineWidth = Math.max(pass === 0 ? 3 : 2, w * k);
        g.beginPath(); g.moveTo(X(r.a[0]), Z(r.a[1])); g.lineTo(X(r.b[0]), Z(r.b[1])); g.stroke();
      }
    }
    E.mapBase = { cv: cv, N: N, X0: X0, Z0: Z0, S: S, k: k };
  },
  _pMapDraw() {
    const E = this._E;
    const M = E.map;
    if (!M || !E.mapBase) return;
    const el = M.el;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = el.clientWidth || 220, ch = el.clientHeight || 220;
    const Wt = Math.round(cw * dpr), Ht = Math.round(ch * dpr);
    if (el.width !== Wt || el.height !== Ht) { el.width = Wt; el.height = Ht; }
    const g = M.ctx;
    const W = el.width, H = el.height;
    const B = E.mapBase;
    const P = E.player;
    let cx, cz, ppm;
    if (M.zoom === 'city') { cx = 260; cz = -250; ppm = Math.min(W, H) / 2050; }
    else { cx = P.x; cz = P.z; ppm = Math.min(W, H) / 380; }
    M.view = { cx: cx, cz: cz, ppm: ppm, W: W, H: H, dpr: dpr };
    const sx = (x) => W / 2 + (x - cx) * ppm, sz = (z) => H / 2 + (z - cz) * ppm;
    g.save();
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#DCE6D0'; g.fillRect(0, 0, W, H);
    const wx0 = cx - W / 2 / ppm, wz0 = cz - H / 2 / ppm;
    g.imageSmoothingEnabled = true;
    g.drawImage(B.cv, (wx0 - B.X0) * B.k, (wz0 - B.Z0) * B.k, (W / ppm) * B.k, (H / ppm) * B.k, 0, 0, W, H);
    // district labels
    g.font = this._font(600, Math.round(10.5 * dpr));
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const labels = M.zoom === 'city'
      ? [['ตลาด', -520, -110], ['วัด', -25, -110], ['เทศบาล', -90, 110], ['โรงพยาบาล', 260, 110], ['โรงเรียน', 260, -110], ['โรงสี', -305, -335], ['สถานีไฟฟ้า', 260, -335], ['หลุมฝังกลบ', 925, -430], ['ทุ่งนา', 935, 360], ['ป่าชุมชน', 0, -900], ['ที่อยู่อาศัย', -110, 335]]
      : [];
    for (const lb of labels) {
      const x = sx(lb[1]), y = sz(lb[2]);
      if (x < -40 || x > W + 40 || y < -20 || y > H + 20) continue;
      g.lineWidth = 3 * dpr; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.strokeText(lb[0], x, y);
      g.fillStyle = '#33423A'; g.fillText(lb[0], x, y);
    }
    // route
    const tr = E.travel;
    if (tr && tr.path && tr.path.length > 1) {
      g.strokeStyle = '#E8590C'; g.lineWidth = 2.6 * dpr; g.setLineDash([6 * dpr, 4 * dpr]);
      g.beginPath();
      if (tr.phase === 'fly' && E.fly) { g.moveTo(sx(E.cam.position.x), sz(E.cam.position.z)); g.lineTo(sx(tr.path[0][0]), sz(tr.path[0][1])); }
      else g.moveTo(sx(P.x), sz(P.z));
      const startI = tr.phase === 'fly' ? 1 : 1 + tr.cum.findIndex((c) => c > tr.sCam) - 1;
      for (let i = Math.max(1, startI); i < tr.path.length; i++) g.lineTo(sx(tr.path[i][0]), sz(tr.path[i][1]));
      g.stroke();
      g.setLineDash([]);
    }
    // stops
    const rr = (M.zoom === 'city' ? 7.5 : 9.5) * dpr;
    for (const k in E.anchors) {
      const a = E.anchors[k];
      if (!a || !a.view) continue;
      const id = +k;
      const p = a.pin || [a.view[0], 0, a.view[1]];
      const x = sx(p[0]), y = sz(p[2]);
      if (x < -rr || x > W + rr || y < -rr || y > H + rr) continue;
      const st = E.pinStatus[id];
      const col = st === 'ok' ? '#15803D' : (st === 'bad' ? '#64748B' : '#E8590C');
      if (E.exploreOn && !st) {
        // unanswered = mystery: only when close to the player
        if (Math.hypot(p[0] - P.x, p[2] - P.z) > 220 && E.hintId !== id) continue;
        g.beginPath(); g.arc(x, y, rr * 1.12, 0, Math.PI * 2);
        g.fillStyle = '#FFF6DE'; g.fill();
        g.lineWidth = 2.2 * dpr; g.strokeStyle = '#F2B33D'; g.stroke();
        g.fillStyle = '#1E3C2F';
        g.font = this._font(800, Math.round(rr * 1.45), '"Bai Jamjuree", "IBM Plex Sans Thai Looped", sans-serif');
        g.fillText('?', x, y + 0.8 * dpr);
        continue;
      }
      if (tr && tr.id === id) { g.beginPath(); g.arc(x, y, rr * 1.65, 0, Math.PI * 2); g.fillStyle = 'rgba(255,213,79,0.55)'; g.fill(); }
      g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2);
      g.fillStyle = col; g.fill();
      g.lineWidth = 1.6 * dpr; g.strokeStyle = '#FFFFFF'; g.stroke();
      g.fillStyle = '#FFFFFF';
      g.font = this._font(700, Math.round(rr * 1.15), '"Bai Jamjuree", "IBM Plex Sans Thai Looped", sans-serif');
      g.fillText(String(id), x, y + 0.5 * dpr);
    }
    // hint beacon: pulsing rings + a beam of light going up
    if (E.hintT) {
      const hx = sx(E.hintT[0]), hy = sz(E.hintT[2]);
      const ph = (E.time * 0.9) % 1;
      const bg = g.createLinearGradient(hx, hy, hx, hy - 46 * dpr);
      bg.addColorStop(0, 'rgba(255,211,106,0.85)'); bg.addColorStop(1, 'rgba(255,211,106,0)');
      g.fillStyle = bg;
      g.fillRect(hx - 3.2 * dpr, hy - 46 * dpr, 6.4 * dpr, 46 * dpr);
      for (const q of [ph, (ph + 0.5) % 1]) {
        g.beginPath(); g.arc(hx, hy, (8 + q * 22) * dpr, 0, Math.PI * 2);
        g.lineWidth = 2.6 * dpr; g.strokeStyle = 'rgba(232,150,30,' + (0.9 * (1 - q)).toFixed(3) + ')'; g.stroke();
      }
      g.beginPath(); g.arc(hx, hy, 4 * dpr, 0, Math.PI * 2); g.fillStyle = '#FFD36A'; g.fill();
    }
    // guide
    const gd = E.guide;
    if (gd && gd.visible && E.ctl !== 'intro') {
      g.beginPath(); g.arc(sx(gd.pos.x), sz(gd.pos.z), 4.2 * dpr, 0, Math.PI * 2);
      g.fillStyle = '#2F7D4F'; g.fill(); g.lineWidth = 1.5 * dpr; g.strokeStyle = '#FFFFFF'; g.stroke();
    }
    // player (or camera) arrow + view cone
    let px = P.x, pz = P.z, yaw = P.yaw + E.lookOff.yaw;
    if (E.ctl !== 'walk') {
      const d = new E.T.Vector3();
      E.cam.getWorldDirection(d);
      px = E.cam.position.x; pz = E.cam.position.z; yaw = Math.atan2(d.x, d.z);
    }
    const ax = sx(px), ay = sz(pz);
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const half = ((E.cam.fov * (E.w / Math.max(1, E.h))) / 2) * Math.PI / 180;
    const cone = 34 * dpr;
    g.beginPath(); g.moveTo(ax, ay);
    for (let i = 0; i <= 8; i++) { const t = -half + (2 * half * i) / 8; const c = Math.cos(t), s = Math.sin(t); const vx = fx * c - fz * s, vz = fx * s + fz * c; g.lineTo(ax + vx * cone, ay + vz * cone); }
    g.closePath(); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fill();
    g.save();
    g.translate(ax, ay);
    g.rotate(Math.atan2(fz, fx) - Math.PI / 2);
    g.beginPath(); g.moveTo(0, 9 * dpr); g.lineTo(6 * dpr, -6 * dpr); g.lineTo(0, -3 * dpr); g.lineTo(-6 * dpr, -6 * dpr); g.closePath();
    g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = 1.8 * dpr; g.strokeStyle = '#1D2A23'; g.stroke();
    g.restore();
    // north + zoom button
    g.fillStyle = 'rgba(255,255,255,0.92)';
    this._rr(g, 6 * dpr, 6 * dpr, 22 * dpr, 22 * dpr, 6 * dpr); g.fill();
    g.fillStyle = '#1D2A23'; g.font = this._font(700, Math.round(11 * dpr));
    g.fillText('N', 17 * dpr, 18.5 * dpr);
    g.beginPath(); g.moveTo(17 * dpr, 7.5 * dpr); g.lineTo(13.5 * dpr, 12 * dpr); g.lineTo(20.5 * dpr, 12 * dpr); g.closePath(); g.fill();
    const bw = 30 * dpr, bh = 24 * dpr, bx = W - bw - 6 * dpr, by = 6 * dpr;
    g.fillStyle = 'rgba(255,255,255,0.95)';
    this._rr(g, bx, by, bw, bh, 7 * dpr); g.fill();
    g.strokeStyle = 'rgba(29,42,35,0.25)'; g.lineWidth = 1 * dpr; g.stroke();
    g.strokeStyle = '#1D2A23'; g.lineWidth = 2.2 * dpr; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx + bw / 2 - 6 * dpr, by + bh / 2); g.lineTo(bx + bw / 2 + 6 * dpr, by + bh / 2);
    if (M.zoom === 'city') { g.moveTo(bx + bw / 2, by + bh / 2 - 6 * dpr); g.lineTo(bx + bw / 2, by + bh / 2 + 6 * dpr); }
    g.stroke();
    M.btn = [bx, by, bw, bh];
    g.restore();
  },
  _pMapClick(ev) {
    const E = this._E;
    const M = E && E.map;
    if (!M || !M.view) return;
    ev.preventDefault();
    ev.stopPropagation();
    const r = M.el.getBoundingClientRect();
    const dpr = M.el.width / Math.max(1, r.width);
    const px = (ev.clientX - r.left) * dpr, py = (ev.clientY - r.top) * dpr;
    const b = M.btn;
    if (b && px >= b[0] - 4 && px <= b[0] + b[2] + 4 && py >= b[1] - 4 && py <= b[1] + b[3] + 4) {
      M.zoom = M.zoom === 'city' ? 'local' : 'city';
      this._pMapDraw();
      return;
    }
    const V = M.view;
    const wx = V.cx + (px - V.W / 2) / V.ppm, wz = V.cz + (py - V.H / 2) / V.ppm;
    let best = null, bd = 13 * dpr;
    for (const k in E.anchors) {
      const a = E.anchors[k];
      if (!a || !a.view) continue;
      const p = a.pin || [a.view[0], 0, a.view[1]];
      const d = Math.hypot((p[0] - wx) * V.ppm, (p[2] - wz) * V.ppm);
      if (d < bd) { bd = d; best = +k; }
    }
    if (best != null) {
      if (typeof this._uiOpenStop === 'function') this._uiOpenStop(best);
      else this._eTalkHere(best);
      return;
    }
    if (E.freeMode && E.ctl === 'walk' && !E.travel) this._pGoto(wx, wz);
  },
  _pGoto(x, z) {
    const E = this._E;
    const P = E.player;
    const c = this._pCollide(x, z, 0.5);
    x = c[0]; z = c[1];
    const d = Math.hypot(x - P.x, z - P.z);
    if (d > 110) {
      const eye = this._pEyeY(x, z);
      const yaw = Math.atan2(x - P.x, z - P.z);
      this._pFlyTo({ x: x, y: eye, z: z, lx: x + Math.sin(yaw) * 12, ly: eye - 0.3, lz: z + Math.cos(yaw) * 12 }, { onDone: () => this._ui({ eMode: 'walk' }) });
    } else {
      E.autoWalk = { x: x, z: z };
      E.mark.m.position.set(x, window.GHG3L.H(x, z) + 0.06, z);
      E.mark.t = 0;
    }
  },

  // =============================================================== EXPLORE / MYSTERY MODE (v0.6)
  _eExplore() {
    const E = this._E;
    if (!E || !E.player) return;
    this._pGoFree();
    E.exploreOn = true;
    E.seek = null; E.found = null;
    {
      const P = E.player, g = E.guide;
      const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), rx = -Math.cos(P.yaw), rz = Math.sin(P.yaw);
      const c = this._pCollide(P.x - fx * 2.9 + rx * 1.3, P.z - fz * 2.9 + rz * 1.3, 0.3);
      g.pos.set(c[0], window.GHG3L.H(c[0], c[1]), c[1]);
      g.yaw = P.yaw; g.speed = 0; E.gc.sp = 0;
    }
    this._ui({ eMode: E.ctl === 'fly' ? 'fly' : 'walk', eExplore: true, eArrived: null, eTravel: false, eTarget: null, eSeek: null, eFound: null, eAim: 0, eNear: null });
    this._pRedrawPins(true);
  },
  _pTarget(a) {
    const t = a.emit || a.look || [a.view[0], 1.5, a.view[1]];
    return [t[0], t[1], t[2]];
  },
  _eSeek(id) {
    const E = this._E;
    if (!E || !E.player) return;
    const a = E.anchors[id];
    if (!a) { this._ui({ eFound: id, eSeek: null, eAim: 1 }); return; }
    const T = this._pTarget(a);
    E.seek = { id: id, T: new E.T.Vector3(T[0], T[1], T[2]), hold: 0, off: 0, uiT: 0, ang: 180, d: 0 };
    this._ui({ eSeek: id, eAim: 0, eFound: null });
  },
  _eSeekStop() {
    const E = this._E;
    if (!E) return;
    E.seek = null;
    this._ui({ eSeek: null, eAim: 0 });
  },
  // aiming check: camera forward vs direction to the target, held for 0.7 s
  _pTickSeek(dt) {
    const E = this._E;
    const S = E.seek;
    const cam = E.cam;
    const f = cam.getWorldDirection(E.pvSeek || (E.pvSeek = new E.T.Vector3()));
    const dx = S.T.x - cam.position.x, dy = S.T.y - cam.position.y, dz = S.T.z - cam.position.z;
    const d = Math.hypot(dx, dy, dz) || 1;
    const ang = (Math.acos(this._cl((f.x * dx + f.y * dy + f.z * dz) / d, -1, 1)) * 180) / Math.PI;
    const on = E.ctl === 'walk' && d < 80 && ang < (d < 6 ? 17 : 11);
    S.ang = ang; S.d = d;
    if (on) { S.off = 0; S.hold += dt; }
    else { S.off += dt; if (S.off > 0.12) S.hold = 0; }
    if (S.hold >= 0.7) { this._pSeekDone(); return; }
    S.uiT -= dt;
    if (S.uiT <= 0) { S.uiT = 0.1; this._ui({ eAim: Math.round(this._cl(S.hold / 0.7, 0, 1) * 20) / 20 }); }
  },
  _pSeekDone() {
    const E = this._E;
    const S = E.seek;
    if (!S) return;
    const id = S.id;
    E.seek = null;
    this._pSparkBurst(S.T.x, S.T.y, S.T.z);
    if (typeof this._auSfx === 'function') this._auSfx('found');
    if (E.hintId === id) { E.hintId = null; E.hintT = null; }
    this._ui({ eFound: id, eSeek: null, eAim: 1, eHint: E.hintId });
  },
  // click / tap right on the source while hunting = found (same as holding the reticle on it)
  _pSeekTap(cx, cy) {
    const E = this._E;
    const S = E.seek;
    if (!S || E.ctl !== 'walk') return false;
    const v = E.pvTap || (E.pvTap = new E.T.Vector3());
    v.copy(S.T);
    if (v.distanceTo(E.cam.position) > 80) return false;
    v.project(E.cam);
    if (v.z > 1 || v.z < -1) return false;
    const r = E.canvas.getBoundingClientRect();
    const sx = r.left + (v.x + 1) / 2 * r.width, sy = r.top + (1 - v.y) / 2 * r.height;
    if (Math.hypot(cx - sx, cy - sy) > Math.max(56, r.height * 0.085)) return false;
    this._pSeekDone();
    return true;
  },
  _eHint(id) {
    const E = this._E;
    if (!E || !E.player) return;
    const a = id != null ? E.anchors[id] : null;
    E.hintId = a ? id : null;
    E.hintT = a ? this._pTarget(a) : null;
    this._ui({ eHint: E.hintId });
    this._pCompass();
  },
  // ---- drone hops (fast travel, v0.8): land on foot a short walk before a riddle, facing its "?"
  // `where` = a content district id (first unsolved stop there, else its first stop) or 'gate'
  _eHop(where) {
    const E = this._E;
    if (!E || !E.player || E.ctl === 'intro' || E.ctl === 'finale') return;
    if (where === 'gate') {
      const G = E.gateSpot;
      this._pHopLand(G.view[0], G.view[1], G.look[0], G.look[1], G.look[2]);
      return;
    }
    let best = null;
    for (const k in E.anchors) {
      const a = E.anchors[k];
      if (!a || a.district !== where) continue;
      const id = +k, open = !E.pinStatus[id];
      if (!best || (open && !best.open) || (open === best.open && id < best.id)) best = { id: id, open: open };
    }
    if (best) this._eHopStop(best.id);
  },
  _eHopStop(id) {
    const E = this._E;
    const a = E && E.anchors ? E.anchors[id] : null;
    if (!a || !E.player || E.ctl === 'intro' || E.ctl === 'finale') return;
    const T = a.pin || this._pTarget(a);
    // raised lookout (hill deck): land on the deck itself; elsewhere a short walk before the viewpoint
    if (a.viewY != null) { this._pHopLand(a.view[0], a.view[1], T[0], T[1], T[2], true); return; }
    const p = this._pTrimRoute(this._pAnchorRoute(a), 24)[0];
    this._pHopLand(p[0], p[1], T[0], T[1], T[2]);
  },
  _pHopLand(x, z, lx, ly, lz, exact) {
    const E = this._E;
    if (E.fly) this._pFlyFinish();
    E.travel = null; E.autoWalk = null; E.seek = null; E.found = null; E.at = null; E.atGate = false;
    if (!exact) { const c = this._pCollide(x, z, 0.5); x = c[0]; z = c[1]; }
    const eye = this._pEyeY(x, z);
    // look at the "?" but keep the horizon in view
    const d = Math.hypot(lx - x, lz - z) || 1;
    ly = Math.min(ly, eye + d * 0.14);
    this._ui({ eSeek: null, eAim: 0, eArrived: null, eFound: null });
    if (typeof this._auSfx === 'function') this._auSfx('hop');
    this._pFlyTo({ x: x, y: eye, z: z, lx: lx, ly: ly, lz: lz }, { fadeEnd: !!this._pInsideAt(x, z), onDone: () => this._ui({ eMode: 'walk' }) });
    this._pRedrawPins();
  },
  // put the walker somewhere (resume a saved game); the caller flies the camera down with _eExplore
  _eTeleport(x, z, yaw) {
    const E = this._E;
    if (!E || !E.player || !isFinite(x) || !isFinite(z)) return;
    const c = this._pCollide(this._cl(x, -1750, 1550), this._cl(z, -1550, 1300), 0.5);
    const P = E.player;
    P.x = c[0]; P.z = c[1]; P.y = this._pEyeY(P.x, P.z);
    if (isFinite(yaw)) P.yaw = yaw;
    P.pitch = 0.03; P.vx = 0; P.vz = 0;
    // from the title orbit: a quick fade-in on foot instead of a long drone flight
    if (E.ctl === 'intro' && !E.fly) { E.ctl = 'walk'; if (E.fade) { E.fade.a = 1; E.fade.to = 0; E.fade.sp = 1.4; } }
  },
  // compass for the hint beacon: bearing relative to the view (degrees, clockwise = right) and distance
  _pCompass() {
    const E = this._E;
    const HT = E.hintT;
    if (!HT || E.ctl !== 'walk') { this._ui({ eHintAng: null, eHintD: 0 }); return; }
    const cf = E.cam.getWorldDirection(E.pvCmp || (E.pvCmp = new E.T.Vector3()));
    const dx = HT[0] - E.cam.position.x, dz = HT[2] - E.cam.position.z;
    let rel = Math.atan2(dx, dz) - Math.atan2(cf.x, cf.z);
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    const d = Math.hypot(dx, dz);
    this._ui({ eHintAng: Math.round((-rel * 180) / Math.PI / 3) * 3, eHintD: d > 100 ? Math.round(d / 10) * 10 : Math.round(d) });
  },
  // after a find: no walking — turn toward the target, the owl comes over, then a normal arrival
  _eFoundHere(id) {
    const E = this._E;
    if (!E || !E.player) return;
    const a = E.anchors[id];
    if (!a) { this._ui({ eArrived: id, eTravel: false }); return; }
    const P = E.player;
    const T = this._pTarget(a);
    const dT = Math.hypot(T[0] - P.x, T[2] - P.z), dV = Math.hypot(a.view[0] - P.x, a.view[1] - P.z);
    const raised = a.viewY != null && a.viewY - window.GHG3L.H(a.view[0], a.view[1]) - 1.65 > 1.5;
    if (Math.min(dT, dV) > 35 || E.ctl !== 'walk' || (raised && dV > 3)) { E.seek = null; this._ui({ eSeek: null, eAim: 0 }); this._eTalkHere(id); return; }
    // close to the stop's own viewpoint: hop over there quickly so the team lines up in front of the player
    if (!raised && dV > 1.2 && dV < 30) {
      E.seek = null; E.found = null;
      if (E.hintId === id) { E.hintId = null; E.hintT = null; }
      this._ui({ eSeek: null, eAim: 0, eHint: E.hintId });
      this._pStartTravel(id, { quick: true, boost: 2.6 });
      return;
    }
    E.travel = null; E.autoWalk = null; E.seek = null;
    if (E.hintId === id) { E.hintId = null; E.hintT = null; }
    const gs = this._pFoundSpot(P, T);
    // the team was trailing behind the player: pop the owl to the edge of the view on its side so it hops in quickly
    const G = E.guide;
    if (G && G.pos) {
      const yw = Math.atan2(T[0] - P.x, T[2] - P.z);
      const fx = Math.sin(yw), fz = Math.cos(yw), rx = -Math.cos(yw), rz = Math.sin(yw);
      const dx = G.pos.x - P.x, dz = G.pos.z - P.z;
      if (dx * fx + dz * fz < 0.6 || Math.hypot(dx, dz) > 8) {
        const side = (gs[0] - P.x) * rx + (gs[1] - P.z) * rz >= 0 ? 1 : -1;
        for (const k of [[1.7, 1.0], [1.3, 0.6], [2.2, 1.6]]) {
          const px = P.x + rx * side * k[0] + fx * k[1], pz = P.z + rz * side * k[0] + fz * k[1];
          if (!this._pHitAt(px, pz, 0.35)) { G.pos.x = px; G.pos.z = pz; break; }
        }
      }
    }
    E.at = id; E.atGate = false;
    E.gc.home = { x: gs[0], z: gs[1] }; E.gc.arrT = E.time; E.gc.pointT = 5 + Math.random() * 3;
    E.found = { id: id, t: 0, T: T };
    this._ui({ eTravel: false, eTarget: null, eSeek: null, eAim: 0, eHint: E.hintId });
    this._pRedrawPins();
  },

  // spot in front of the player, beside the line to the found source (never behind the camera)
  _pFoundSpot(P, T) {
    const yaw = Math.atan2(T[0] - P.x, T[2] - P.z);
    const dT = Math.hypot(T[0] - P.x, T[2] - P.z);
    const ok = (x, z) => !this._pHitAt(x, z, 0.4) && !this._pBlocked(P.x, P.z, x, z);
    const maxD = Math.max(1.8, Math.min(3.8, dT - 0.6));
    let dists = [3.4, 2.9, 2.4, 2.0, 1.7].filter((d) => d <= maxD + 0.01);
    if (!dists.length) dists = [Math.max(1.5, maxD)];
    for (const ang of [24, 30, 18, 36, 42]) {
      for (const sd of [1, -1]) {
        for (const d of dists) {
          const a = yaw - sd * ang * Math.PI / 180;
          const x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d;
          if (ok(x, z)) return [x, z];
        }
      }
    }
    return this._pGuideSpot({ view: [P.x, P.z], look: T });
  },

  // ---- "?" mystery bubbles (one shared texture)
  _pInitMystery() {
    const E = this._E;
    const T = E.T;
    const draw = (g, W, H) => {
      g.clearRect(0, 0, W, H);
      const cx = 128, cy = 112, R = 74;
      const glow = g.createRadialGradient(cx, cy, R * 0.55, cx, cy, 126);
      glow.addColorStop(0, 'rgba(255,206,98,0.62)'); glow.addColorStop(1, 'rgba(255,206,98,0)');
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      g.beginPath();
      g.moveTo(cx - 22, cy + R - 14);
      g.quadraticCurveTo(cx - 5, cy + R + 22, cx, 236);
      g.quadraticCurveTo(cx + 5, cy + R + 22, cx + 22, cy + R - 14);
      g.closePath();
      g.fillStyle = '#F2B33D'; g.fill();
      const bg = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      bg.addColorStop(0, '#FFFCF2'); bg.addColorStop(1, '#FCE0A0');
      g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fillStyle = bg; g.fill();
      g.lineWidth = 9; g.strokeStyle = '#F2B33D'; g.stroke();
      g.beginPath(); g.arc(cx - 2, cy + 2, R - 13, 0, Math.PI * 2);
      g.lineWidth = 2; g.strokeStyle = 'rgba(242,179,61,0.35)'; g.stroke();
      g.beginPath(); g.arc(cx - 24, cy - 28, 20, Math.PI * 1.02, Math.PI * 1.72);
      g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.stroke();
      this._fitText(g, '?', cx + 2, cy + 7, 120, 108, 800, '#1E3C2F', 'center', '"Bai Jamjuree", "IBM Plex Sans Thai Looped", sans-serif');
    };
    E.mqTex = this._canvasTex(256, 256, draw, { text: true });
    E.mq = [];
    for (const k of Object.keys(E.anchors)) {
      const a = E.anchors[k];
      if (!a || !a.pin) continue;
      const mat = new T.SpriteMaterial({ map: E.mqTex, transparent: true, depthWrite: false, sizeAttenuation: false, toneMapped: false, fog: false });
      const sp = new T.Sprite(mat);
      sp.center.set(0.5, 1 - 236 / 256);
      sp.renderOrder = 31;
      sp.visible = false;
      sp.userData = { id: +k, mystery: true, tw: Math.random() };
      E.scene.add(sp);
      E.mq.push(sp);
    }
  },
  _pTickMystery(dt) {
    const E = this._E;
    if (!E.mq) return;
    const cam = E.cam;
    const on = E.exploreOn && E.labelsOn && E.ctl !== 'intro' && E.ctl !== 'finale';
    const air = E.ctl !== 'walk';
    const k = 2 * Math.tan((cam.fov * Math.PI) / 360);
    const hpx = Math.max(1, E.h);
    const me = cam.matrixWorld.elements;
    for (const sp of E.mq) {
      const id = sp.userData.id;
      const a = E.anchors[id];
      let show = on && !E.pinStatus[id] && id !== E.at && !(E.found && E.found.id === id) && (this.state || {}).eFound !== id;
      if (!show) { sp.visible = false; continue; }
      sp.position.set(a.pin[0], a.pin[1] + 0.45 + Math.sin(E.time * 1.6 + id * 1.7) * 0.18, a.pin[2]);
      const d = cam.position.distanceTo(sp.position);
      let op = 1, depth = false, px = 50;
      if (!air) {
        op = 1 - this._sm((d - 90) / 20);
        if (op < 0.02) { sp.visible = false; continue; }
        depth = d >= 25;
        px = this._cl((2.4 / Math.max(0.5, d * k)) * hpx, 38, 96);
      }
      sp.visible = true;
      sp.material.opacity = op;
      sp.material.depthTest = depth;
      const sc = (px * k) / hpx;
      sp.scale.set(sc, sc, 1);
      if (!air && d < 70) {
        sp.userData.tw -= dt;
        if (sp.userData.tw <= 0 && E.sparks.length < E.bbSpark.n - 40) {
          sp.userData.tw = 0.26 + Math.random() * 0.3;
          const ws = sc * d;
          const ang = Math.random() * Math.PI * 2, rad = ws * (0.36 + Math.random() * 0.16);
          const cx = Math.cos(ang) * rad, cy = Math.sin(ang) * rad + ws * 0.48;
          const c = this._lc(Math.random() < 0.5 ? '#FFF4C2' : '#FFD36A');
          const ss = ws * (0.1 + Math.random() * 0.09);
          E.sparks.push({
            x: sp.position.x + me[0] * cx + me[4] * cy, y: sp.position.y + me[1] * cx + me[5] * cy, z: sp.position.z + me[2] * cx + me[6] * cy,
            vx: 0, vy: ws * 0.12, vz: 0, age: 0, life: 0.75 + Math.random() * 0.35, s0: ss, a0: 0.95 * op,
            r: c[0] * 1.6, g: c[1] * 1.6, b: c[2] * 1.6, al: 0, sw: ss, sh: ss, rot: Math.random() * 3, rv: 1.5, twinkle: true
          });
        }
      }
    }
  },
  _pSparkBurst(x, y, z) {
    const E = this._E;
    const cols = ['#FFF6CC', '#FFD36A', '#FFFFFF', '#BFF5D0'];
    const dk = this._cl(Math.hypot(x - E.cam.position.x, y - E.cam.position.y, z - E.cam.position.z) / 12, 1, 3.2);
    const cf = this._lc('#FFE7A0');
    E.sparks.push({ x: x, y: y, z: z, vx: 0, vy: 0, vz: 0, age: 0, life: 0.55, s0: 2.6 * dk, a0: 1, r: cf[0] * 1.8, g: cf[1] * 1.8, b: cf[2] * 1.8, al: 0, sw: 2.6 * dk, sh: 2.6 * dk, rot: 0, rv: 0.8, flash: true });
    for (let i = 0; i < 64; i++) {
      if (E.sparks.length >= E.bbSpark.n) break;
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr = Math.sqrt(1 - u * u);
      const sp = (2 + Math.random() * 3.6) * Math.sqrt(dk);
      const c = this._lc(cols[i % 4]);
      const s0 = (0.3 + Math.random() * 0.32) * dk;
      E.sparks.push({
        x: x, y: y, z: z, vx: Math.cos(th) * rr * sp, vy: u * sp * 0.8 + 1.6, vz: Math.sin(th) * rr * sp,
        age: 0, life: 0.9 + Math.random() * 0.8, s0: s0, a0: 1, r: c[0] * 1.5, g: c[1] * 1.5, b: c[2] * 1.5,
        al: 0, sw: s0, sh: s0, rot: Math.random() * 6, rv: (Math.random() - 0.5) * 6, burst: true
      });
    }
  },
  _pTickSparks(dt) {
    const E = this._E;
    const L = E.sparks;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i];
      p.age += dt;
      if (p.age >= p.life) { L[i] = L[L.length - 1]; L.pop(); continue; }
      const k = p.age / p.life;
      if (p.flash) {
        p.al = p.a0 * Math.pow(1 - k, 1.6);
        p.sw = p.sh = p.s0 * (0.6 + 0.8 * k);
      } else if (p.burst) {
        p.vy -= 3.2 * dt;
        const dr = 1 - 1.3 * dt;
        p.vx *= dr; p.vy *= dr; p.vz *= dr;
        p.al = p.a0 * Math.pow(1 - k, 0.7) * (0.65 + 0.35 * Math.sin(p.age * 31 + p.rot));
        p.sw = p.sh = p.s0 * (1 - 0.45 * k);
      } else {
        p.al = p.a0 * Math.sin(Math.PI * k) * (0.75 + 0.25 * Math.sin(p.age * 26));
        p.sw = p.sh = p.s0 * (0.55 + 0.45 * Math.sin(Math.PI * k));
      }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.rot += p.rv * dt;
    }
    this._pBBWrite(E.bbSpark, L);
  },

  // ---- hint beacon: soft vertical light pillar + ground ring at the target (minimap draws its own)
  _pInitBeacon() {
    const E = this._E;
    const T = E.T;
    const g = new T.PlaneGeometry(1, 1).translate(0, 0.5, 0);
    const mat = new T.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uA: { value: 0 }, uC: { value: this._lcol('#FFD36A') } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uT; uniform float uA; uniform vec3 uC; varying vec2 vUv;' +
        ' void main(){ float h = 1.0 - abs(vUv.x * 2.0 - 1.0); float soft = h * h; float core = pow(h, 9.0);' +
        ' float v = pow(1.0 - vUv.y, 1.3) * smoothstep(0.0, 0.02, vUv.y);' +
        ' float sh = 0.7 + 0.3 * sin(uT * 3.4 - vUv.y * 30.0);' +
        ' float a = (soft * 0.6 + core * 1.15) * v * sh * uA; gl_FragColor = vec4(uC, a); }',
      transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending, fog: false, toneMapped: false, side: T.DoubleSide
    });
    const beam = new T.Mesh(g, mat);
    beam.frustumCulled = false;
    beam.renderOrder = 14;
    beam.visible = false;
    E.scene.add(beam);
    const ring = new T.Mesh(new T.RingGeometry(0.78, 1.0, 48).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: this._lcol('#FFD36A'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
    ring.renderOrder = 14;
    ring.visible = false;
    E.scene.add(ring);
    E.beacon = { beam: beam, ring: ring, a: 0 };
  },
  _pTickBeacon(dt) {
    const E = this._E;
    const B = E.beacon;
    if (!B) return;
    const T = E.hintT;
    B.a = this._damp(B.a, T && E.ctl !== 'intro' && E.ctl !== 'finale' ? 1 : 0, 4, dt);
    const vis = !!T && B.a > 0.01;
    B.beam.visible = vis; B.ring.visible = vis;
    if (!vis) return;
    const cp = E.cam.position;
    const gy = window.GHG3L.H(T[0], T[2]);
    const d = Math.hypot(cp.x - T[0], cp.z - T[2]);
    const near = this._sm((d - 3) / 5);
    B.beam.position.set(T[0], Math.min(gy, T[1]), T[2]);
    B.beam.rotation.y = Math.atan2(cp.x - T[0], cp.z - T[2]);
    B.beam.scale.set(this._cl(3.0 + d * 0.014, 3.0, 12), 75, 1);
    B.beam.material.uniforms.uT.value = E.time;
    B.beam.material.uniforms.uA.value = B.a * near * 0.95;
    const pr = (E.time * 0.75) % 1;
    B.ring.position.set(T[0], gy + 0.09, T[2]);
    const rs = 0.7 + pr * 2.6;
    B.ring.scale.set(rs, 1, rs);
    B.ring.material.opacity = B.a * (1 - pr) * 0.85 * Math.max(0.3, near);
  },

  // =============================================================== INPUT
  _bindEvents() {
    const E = this._E;
    const c = E.canvas;
    const h = E.hnd = {};
    h.down = (e) => this._pDown(e);
    h.move = (e) => this._pMove(e);
    h.up = (e) => this._pUp(e);
    h.wheel = (e) => this._pWheel(e);
    h.ctx = (e) => e.preventDefault();
    h.kd = (e) => this._pKey(e, true);
    h.ku = (e) => this._pKey(e, false);
    h.blur = () => { if (this._E) { this._E.keys = {}; this._E.joy = null; this._E.joyP = null; this._pJoyDraw(); } };
    c.addEventListener('pointerdown', h.down);
    c.addEventListener('pointermove', h.move);
    c.addEventListener('pointerup', h.up);
    c.addEventListener('pointercancel', h.up);
    c.addEventListener('wheel', h.wheel, { passive: false });
    c.addEventListener('contextmenu', h.ctx);
    window.addEventListener('keydown', h.kd);
    window.addEventListener('keyup', h.ku);
    window.addEventListener('blur', h.blur);
  },
  _unbindEvents() {
    const E = this._E;
    if (!E) return;
    const h = E.hnd;
    const c = E.canvas;
    if (h) {
      c.removeEventListener('pointerdown', h.down);
      c.removeEventListener('pointermove', h.move);
      c.removeEventListener('pointerup', h.up);
      c.removeEventListener('pointercancel', h.up);
      c.removeEventListener('wheel', h.wheel);
      c.removeEventListener('contextmenu', h.ctx);
      window.removeEventListener('keydown', h.kd);
      window.removeEventListener('keyup', h.ku);
      window.removeEventListener('blur', h.blur);
    }
    if (E.map && E.map.el && E.map.down) E.map.el.removeEventListener('pointerdown', E.map.down);
    E.hnd = null;
    if (typeof this._auStop === 'function') this._auStop();
  },
  _pDown(e) {
    const E = this._E;
    if (!E || !E.player) return;
    if (typeof this._uiCanvasDown === 'function') this._uiCanvasDown();
    const ae = document.activeElement;
    if (ae && ae !== document.body && typeof ae.blur === 'function') ae.blur();
    try { E.canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    if (e.pointerType === 'touch') {
      this._ui({ eTouch: true });
      // touch: a finger put down on the left part of the view becomes a walking joystick (the right part looks around)
      const r = E.canvas.getBoundingClientRect();
      if (!E.joyP && E.ctl === 'walk' && e.clientX - r.left < r.width * 0.45 && e.clientY - r.top > r.height * 0.25) {
        E.joyP = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, t0: performance.now() };
        E.joy = { x: 0, y: 0 };
        this._pJoyDraw();
        return;
      }
    }
    E.ptrs = E.ptrs || new Map();
    E.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (E.ptrs.size === 2) {
      const v = Array.from(E.ptrs.values());
      E.pinch = Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
      E.drag = null;
      return;
    }
    E.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t0: performance.now(), moved: false, btn: e.button, pan: e.button === 2 || e.shiftKey };
  },
  _pMove(e) {
    const E = this._E;
    if (!E || !E.player) return;
    const JP = E.joyP;
    if (JP && JP.id === e.pointerId) {
      const R = 46;
      let ox = e.clientX - JP.x0, oy = e.clientY - JP.y0;
      const l = Math.hypot(ox, oy);
      if (l > 8) JP.moved = true;
      if (l > R) { ox *= R / l; oy *= R / l; }
      E.joy = { x: ox / R, y: oy / R };
      this._pJoyDraw();
      return;
    }
    if (E.ptrs && E.ptrs.has(e.pointerId)) E.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (E.ptrs && E.ptrs.size === 2 && E.pinch) {
      const v = Array.from(E.ptrs.values());
      const d = Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
      if (d > 1) {
        if (E.ctl === 'overview') E.orbit.r = this._cl(E.orbit.r * (E.pinch / d), 80, 2600);
        else E.fovWalk = this._cl(E.fovWalk * (E.pinch / d), 38, 75);
        E.pinch = d;
      }
      return;
    }
    const D = E.drag;
    if (!D || D.id !== e.pointerId) {
      E.hovT = (E.hovT || 0) + 1;
      if (E.hovT % 4 === 0) E.canvas.style.cursor = this._pPickPin(e.clientX, e.clientY) != null ? 'pointer' : (E.ctl === 'walk' ? 'crosshair' : 'grab');
      return;
    }
    const dx = e.clientX - D.x, dy = e.clientY - D.y;
    D.x = e.clientX; D.y = e.clientY;
    if (!D.moved && Math.hypot(e.clientX - D.sx, e.clientY - D.sy) > 5) D.moved = true;
    if (!D.moved) return;
    this._pLook(dx, dy, D.pan || e.shiftKey);
  },
  _pLook(dx, dy, pan) {
    const E = this._E;
    const P = E.player;
    if (E.ctl === 'overview') {
      const O = E.orbit;
      if (pan) {
        const k = O.r * 0.0016;
        const rx = Math.cos(O.th), rz = -Math.sin(O.th), fx = -Math.sin(O.th), fz = -Math.cos(O.th);
        O.tx = this._cl(O.tx - rx * dx * k + fx * dy * k, -1700, 1700);
        O.tz = this._cl(O.tz - rz * dx * k + fz * dy * k, -1700, 1500);
      } else {
        O.th -= dx * 0.005;
        O.ph = this._cl(O.ph - dy * 0.004, 0.15, 1.38);
      }
      return;
    }
    if (E.ctl === 'intro' || E.ctl === 'finale') { const C = E.ctl === 'finale' && E.fin ? E.fin : E.cine; C.th -= dx * 0.002; return; }
    if (E.ctl === 'fly') return;
    const sens = 0.0042 * (E.cam.fov / 70);
    if (E.travel) {
      E.lookOff.yaw -= dx * sens;
      E.lookOff.pitch = this._cl(E.lookOff.pitch - dy * sens, -0.9, 0.9);
    } else {
      P.yaw -= dx * sens;
      P.pitch = this._cl(P.pitch - dy * sens, -1.25, 1.25);
    }
  },
  _pUp(e) {
    const E = this._E;
    if (!E || !E.player) return;
    const JP = E.joyP;
    if (JP && JP.id === e.pointerId) {
      E.joyP = null; E.joy = null;
      this._pJoyDraw();
      // a short tap without dragging still works like a tap (pin, source while hunting, walk there)
      if (!JP.moved && performance.now() - JP.t0 < 450 && e.type !== 'pointercancel') this._pTap(e.clientX, e.clientY);
      return;
    }
    if (E.ptrs) E.ptrs.delete(e.pointerId);
    if (E.ptrs && E.ptrs.size < 2) E.pinch = null;
    const D = E.drag;
    E.drag = null;
    if (!D || D.id !== e.pointerId) return;
    if (D.moved || performance.now() - D.t0 > 700 || D.btn !== 0 || e.type === 'pointercancel') return;
    this._pTap(e.clientX, e.clientY);
  },
  _pTap(cx, cy) {
    const E = this._E;
    const id = this._pPickPin(cx, cy);
    if (id != null) {
      if (typeof this._uiOpenStop === 'function') this._uiOpenStop(id);
      else this._eTalkHere(id);
      return;
    }
    if (this._pSeekTap(cx, cy)) return;
    if (E.ctl === 'walk' && !E.travel && !E.fly) {
      const g = this._pGroundAt(cx, cy);
      if (g) {
        E.autoWalk = { x: g[0], z: g[1] };
        E.mark.m.position.set(g[0], window.GHG3L.H(g[0], g[1]) + 0.06, g[1]);
        E.mark.t = 0;
      }
    }
  },
  // on-screen joystick ring (the UI registers the element; hidden while no finger is down)
  _pJoyDraw() {
    const E = this._E;
    const el = this.__joyEl;
    if (!el) return;
    const JP = E.joyP;
    if (!JP) { el.style.display = 'none'; return; }
    const pr = (el.offsetParent || E.canvas).getBoundingClientRect();
    el.style.display = 'block';
    el.style.left = (JP.x0 - pr.left) + 'px';
    el.style.top = (JP.y0 - pr.top) + 'px';
    const k = el.firstElementChild;
    if (k) k.style.transform = 'translate(' + ((E.joy ? E.joy.x : 0) * 46).toFixed(1) + 'px,' + ((E.joy ? E.joy.y : 0) * 46).toFixed(1) + 'px)';
  },
  _pGroundAt(cx, cy) {
    const E = this._E;
    const r = E.canvas.getBoundingClientRect();
    E.ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    E.ray.setFromCamera(E.ndc, E.cam);
    const o = E.ray.ray.origin, d = E.ray.ray.direction;
    if (d.y > -0.005) return null;
    let h = window.GHG3L.H(o.x, o.z) - 0.5;
    let t = 0;
    for (let i = 0; i < 5; i++) {
      t = (h - o.y) / d.y;
      if (t < 0) return null;
      h = window.GHG3L.H(o.x + d.x * t, o.z + d.z * t);
    }
    if (t > 260) return null;
    return [o.x + d.x * t, o.z + d.z * t];
  },
  _pWheel(e) {
    const E = this._E;
    if (!E || !E.player) return;
    e.preventDefault();
    if (E.ctl === 'overview') E.orbit.r = this._cl(E.orbit.r * Math.exp(e.deltaY * 0.0012), 80, 2600);
    else if (E.ctl === 'walk') E.fovWalk = this._cl(E.fovWalk + e.deltaY * 0.02, 38, 75);
  },
  _pKey(e, down) {
    const E = this._E;
    if (!E || !E.player) return;
    const t = e.target;
    const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
    const onBtn = tag === 'button' || tag === 'a';
    const code = e.code;
    const moveKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'];
    if (moveKeys.indexOf(code) >= 0) {
      E.keys[code] = down;
      if (down && code.indexOf('Arrow') === 0 && E.ctl === 'walk') e.preventDefault();
      return;
    }
    if (!down || e.repeat) return;
    if (onBtn && code !== 'Escape') return;
    if (code === 'Space' || code === 'Enter' || code === 'NumpadEnter') { e.preventDefault(); this._pUiKey('next'); }
    else if (code === 'Escape') this._pUiKey('esc');
    else if (code === 'KeyM') this._pUiKey('map');
    else if (code === 'KeyF') this._pUiKey('free');
    else if (code === 'KeyH') this._pUiKey('hint');
    else if (code === 'KeyE' && (E.mysteryId != null || E.nearId != null)) {
      const id = E.mysteryId != null ? E.mysteryId : E.nearId;
      if (typeof this._uiOpenStop === 'function') this._uiOpenStop(id);
      else this._eTalkHere(id);
    }
  },
  _pUiKey(k) {
    if (typeof this._uiKey === 'function') { this._uiKey(k); return; }
    const E = this._E;
    if (k === 'map') { if (E.ctl === 'overview') this._eBack(); else this._eOverview(); }
    else if (k === 'free') this._eFree();
    else if (k === 'esc' && E.ctl === 'overview') this._eBack();
    else if (k === 'hint' && E.exploreOn) {
      if (E.hintId != null) { this._eHint(null); return; }
      let best = null, bd = Infinity;
      for (const kk in E.anchors) {
        const id = +kk;
        const a = E.anchors[kk];
        if (!a || !a.view || E.pinStatus[id]) continue;
        const d = Math.hypot(E.player.x - a.view[0], E.player.z - a.view[1]);
        if (d < bd) { bd = d; best = id; }
      }
      if (best != null) this._eHint(best);
    }
  }
};
