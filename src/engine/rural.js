/* GHG Town 3D v0.3 — rural & nature: landfill (stops 13, 14), farms (15–18), forest hill (19), energy (wind, solar, power plant) */
GHG3.rural = {
  // ================================================================= SHARED
  // power plant position (kept here so it is easy to move)
  _ruPPos() { return [-1250, -1100]; },

  _ruInit() {
    const E = this._E;
    if (E.ruReady) return E;
    E.ruReady = true;
    E.treeSpots = E.treeSpots || [];
    E.crowdSpots = E.crowdSpots || [];
    E.parkSpots = E.parkSpots || [];
    E.animalSpots = E.animalSpots || {};
    for (const k of ['cows', 'buffalo', 'egrets', 'dogs', 'birds']) E.animalSpots[k] = E.animalSpots[k] || [];
    E.ruFlames = E.ruFlames || [];
    this._ruTextures();
    this._ruBuckets();
    return E;
  },

  _ruH(x, z) { return window.GHG3L.H(x, z); },

  // world transform helper for composite objects (local forward = +z, yaw = rotation.y)
  _ruXf(x0, z0, yaw) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return (lx, lz) => [x0 + lx * c + lz * s, z0 - lx * s + lz * c];
  },

  _ruNrm(a, b, c) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    return [nx / l, ny / l, nz / l];
  },

  // single cylinder segment between two points (no joints)
  _ruSeg(b, a, c, r, col, seg) {
    const T = this._E.T;
    const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return;
    const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / len, dy / len, dz / len));
    const eu = new T.Euler().setFromQuaternion(q);
    this._gput(b, 'cyl' + (seg || 6), (a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2, r, len, r, eu.x, eu.y, eu.z, col);
  },

  // truncated pyramid between two axis-aligned rectangles. o.all = [bucket, col]; per face o.n/o.s/o.e/o.w/o.top override
  _ruFrustum(bot, top, y0, y1, o) {
    const all = o.all;
    const face = (k) => o[k] || all;
    const put = (spec, c0, c1, c2, c3) => {
      const A = this._A(spec[0], (c0[0] + c2[0]) / 2, (c0[2] + c2[2]) / 2);
      const bk = this._bkInfo(A);
      const n = this._ruNrm(c0, c1, c3);
      const w = Math.hypot(c1[0] - c0[0], c1[2] - c0[2]);
      const h = Math.hypot(c3[0] - c0[0], c3[1] - c0[1], c3[2] - c0[2]);
      this._quad(A, c0, c1, c2, c3, n, [0, 0, w / bk.tw, h / bk.th], spec[1]);
    };
    put(face('s'), [bot[0], y0, bot[3]], [bot[2], y0, bot[3]], [top[2], y1, top[3]], [top[0], y1, top[3]]);
    put(face('n'), [bot[2], y0, bot[1]], [bot[0], y0, bot[1]], [top[0], y1, top[1]], [top[2], y1, top[1]]);
    put(face('e'), [bot[2], y0, bot[3]], [bot[2], y0, bot[1]], [top[2], y1, top[1]], [top[2], y1, top[3]]);
    put(face('w'), [bot[0], y0, bot[1]], [bot[0], y0, bot[3]], [top[0], y1, top[3]], [top[0], y1, top[1]]);
    if (o.top !== false) {
      const t = face('top');
      this.plane(t[0], (top[0] + top[2]) / 2, y1, (top[1] + top[3]) / 2, top[2] - top[0], top[3] - top[1], t[1]);
    }
  },

  // triangular-section prism along x (windrows, mounds)
  _ruPrismX(b, x0, x1, z, y, w, h, col) {
    const A = this._A(b, (x0 + x1) / 2, z);
    const bk = this._bkInfo(A);
    const L = x1 - x0;
    const s1 = [[x0, y, z + w / 2], [x1, y, z + w / 2], [x1, y + h, z], [x0, y + h, z]];
    const sl = Math.hypot(w / 2, h);
    this._quad(A, s1[0], s1[1], s1[2], s1[3], this._ruNrm(s1[0], s1[1], s1[3]), [0, 0, L / bk.tw, sl / bk.th], col);
    const s2 = [[x1, y, z - w / 2], [x0, y, z - w / 2], [x0, y + h, z], [x1, y + h, z]];
    this._quad(A, s2[0], s2[1], s2[2], s2[3], this._ruNrm(s2[0], s2[1], s2[3]), [0, 0, L / bk.tw, sl / bk.th], col);
    this._tri(A, [x0, y, z - w / 2], [x0, y, z + w / 2], [x0, y + h, z], [-1, 0, 0], [0, 0, w / bk.tw, 0, w / 2 / bk.tw, h / bk.th], col);
    this._tri(A, [x1, y, z + w / 2], [x1, y, z - w / 2], [x1, y + h, z], [1, 0, 0], [0, 0, w / bk.tw, 0, w / 2 / bk.tw, h / bk.th], col);
  },

  // lathe (surface of revolution), profile = [[r, y], ...] bottom -> top, double sided
  _ruLathe(b, cx, cz, prof, seg, col) {
    const A = this._A(b, cx, cz);
    const bk = this._bkInfo(A);
    for (let j = 0; j < prof.length - 1; j++) {
      const r0 = prof[j][0], y0 = prof[j][1], r1 = prof[j + 1][0], y1 = prof[j + 1][1];
      const sl = Math.hypot(r1 - r0, y1 - y0);
      for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
        const c0 = [cx + r0 * Math.cos(a0), y0, cz + r0 * Math.sin(a0)];
        const c1 = [cx + r0 * Math.cos(a1), y0, cz + r0 * Math.sin(a1)];
        const c2 = [cx + r1 * Math.cos(a1), y1, cz + r1 * Math.sin(a1)];
        const c3 = [cx + r1 * Math.cos(a0), y1, cz + r1 * Math.sin(a0)];
        const am = (a0 + a1) / 2;
        const nr = (y1 - y0) / sl, ny = -(r1 - r0) / sl;
        const nOut = [nr * Math.cos(am), ny, nr * Math.sin(am)];
        const ng = this._ruNrm(c0, c1, c3);
        const w = (r0 * 2 * Math.PI) / seg;
        if (ng[0] * nOut[0] + ng[1] * nOut[1] + ng[2] * nOut[2] >= 0) this._quad(A, c0, c1, c2, c3, nOut, [0, 0, w / bk.tw, sl / bk.th], col, true);
        else this._quad(A, c1, c0, c3, c2, nOut, [0, 0, w / bk.tw, sl / bk.th], col, true);
      }
    }
  },

  // cross-quad vegetation geometry (n planes, width w, height h), normals tilted up; uv 0..1
  _ruCrossGeo(w, h, n) {
    const T = this._E.T;
    const p = [], nr = [], uv = [], idx = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI;
      const dx = Math.cos(a) * w / 2, dz = Math.sin(a) * w / 2;
      const hx = -Math.sin(a), hz = Math.cos(a);
      const nn = [hx * 0.35, 0.94, hz * 0.35];
      const b = p.length / 3;
      p.push(-dx, 0, -dz, dx, 0, dz, dx, h, dz, -dx, h, -dz);
      for (let q = 0; q < 4; q++) nr.push(nn[0], nn[1], nn[2]);
      uv.push(0, 0, 1, 0, 1, 1, 0, 1);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(p, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(nr, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
  },

  // double-sided alpha-tested foliage material that keeps the (upward) normal on back faces
  _ruFoliageMat(map, o) {
    const T = this._E.T;
    const m = new T.MeshStandardMaterial(Object.assign({ map: map, alphaTest: 0.42, side: T.DoubleSide, roughness: 0.85, metalness: 0 }, o || {}));
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', window.THREE.ShaderChunk.normal_fragment_begin.replace('normal = normal * faceDirection;', ''));
    };
    return m;
  },

  // instanced mesh helper: items = [{x,y,z,ry,sx,sy,sz,c:'#hex'}]
  _ruInst(geo, mat, items, o) {
    const E = this._E;
    const T = E.T;
    o = o || {};
    const im = new T.InstancedMesh(geo, mat, Math.max(1, items.length));
    const M = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), S = new T.Vector3(), EU = new T.Euler();
    const col = new T.Color();
    items.forEach((it, i) => {
      EU.set(it.rx || 0, it.ry || 0, it.rz || 0);
      Q.setFromEuler(EU);
      M.compose(V.set(it.x, it.y, it.z), Q, S.set(it.sx || 1, it.sy || it.sx || 1, it.sz || it.sx || 1));
      im.setMatrixAt(i, M);
      if (it.c) { col.copy(this._lcol(it.c)); im.setColorAt(i, col); }
    });
    im.count = items.length;
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    // r149 InstancedMesh culls with the single-instance bounds: give it a sphere around ALL instances
    if (!geo.boundingSphere) geo.computeBoundingSphere();
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity, sm = 0;
    for (const it of items) {
      x0 = Math.min(x0, it.x); y0 = Math.min(y0, it.y); z0 = Math.min(z0, it.z);
      x1 = Math.max(x1, it.x); y1 = Math.max(y1, it.y); z1 = Math.max(z1, it.z);
      sm = Math.max(sm, it.sx || 1, it.sy || it.sx || 1, it.sz || it.sx || 1);
    }
    if (items.length) {
      const c = new T.Vector3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      const r = Math.hypot(x1 - x0, y1 - y0, z1 - z0) / 2 + (geo.boundingSphere.radius + geo.boundingSphere.center.length()) * sm;
      geo.boundingSphere = new T.Sphere(c, r);
      im.frustumCulled = true;
    } else im.frustumCulled = false;
    im.castShadow = !!o.cast;
    im.receiveShadow = o.recv !== false;
    this._addDyn(im);
    return im;
  },

  // ----------------------------------------------------------------- textures
  _ruTextures() {
    const E = this._E;
    if (E.tex.ruCorn) return;
    const R = this._rng(8080);
    const tx = (name, W, H, draw, o) => { E.tex[name] = this._canvasTex(W, H, draw, Object.assign({ repeat: true }, o || {})); };
    const speck = (g, W, H, n, s0, s1, cols) => {
      for (let i = 0; i < n; i++) { g.fillStyle = cols[(R() * cols.length) | 0]; const s = s0 + R() * (s1 - s0); g.fillRect(R() * W, R() * H, s, s); }
    };
    const blots = (g, W, H, n, r0, r1, col) => {
      for (let i = 0; i < n; i++) {
        const x = R() * W, y = R() * H, r = r0 + R() * (r1 - r0);
        for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) {
          const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
          gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
        }
      }
    };
    // corn plants (alpha) — 3 plants per card
    tx('ruCorn', 256, 512, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      for (let p = 0; p < 3; p++) {
        const x0 = W * (0.2 + p * 0.3) + (R() - 0.5) * 18;
        const top = H * (0.05 + R() * 0.08);
        for (let k = 0; k < 10; k++) {
          const y = H * (0.22 + k * 0.075) + (R() - 0.5) * 14;
          const dir = k % 2 ? 1 : -1;
          const len = W * (0.3 + R() * 0.28);
          g.fillStyle = ['#4C7A28', '#5E8D31', '#6E9E3A', '#3D6923', '#82A947', '#567F2C'][(R() * 6) | 0];
          g.beginPath();
          g.moveTo(x0, y);
          g.quadraticCurveTo(x0 + dir * len * 0.55, y - H * (0.06 + R() * 0.08), x0 + dir * len, y + H * (0.02 + R() * 0.06));
          g.quadraticCurveTo(x0 + dir * len * 0.5, y - H * 0.03, x0, y + 9);
          g.closePath(); g.fill();
        }
        g.strokeStyle = '#7E9B3E'; g.lineWidth = 7;
        g.beginPath(); g.moveTo(x0, H); g.quadraticCurveTo(x0 + (R() - 0.5) * 12, H * 0.5, x0 + (R() - 0.5) * 8, top + 28); g.stroke();
        g.strokeStyle = '#C9A85C'; g.lineWidth = 2.4;
        for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(x0, top + 30); g.lineTo(x0 + (R() - 0.5) * 44, top + R() * 22); g.stroke(); }
        g.fillStyle = '#A3B85E'; g.beginPath(); g.ellipse(x0 + 9, H * 0.56, 7, 27, 0.25, 0, 7); g.fill();
        g.strokeStyle = '#E3CF8A'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 + 12, H * 0.56 - 27); g.lineTo(x0 + 19, H * 0.56 - 42); g.stroke();
      }
    }, { repeat: false });
    tx('ruCornTop', 512, 512, (g, W, H) => {
      g.fillStyle = '#35521F'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 2600; i++) {
        const x = R() * W, y = R() * H, a = R() * Math.PI * 2, l = 14 + R() * 30;
        g.strokeStyle = ['#5B8A30', '#6E9E3A', '#4B7A28', '#87AE4C', '#3E6522'][(R() * 5) | 0];
        g.lineWidth = 3 + R() * 3;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(205,170,95,0.75)'; g.fillRect(R() * W, R() * H, 3, 3); }
    });
    tx('ruCornSide', 512, 256, (g, W, H) => {
      const gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#5B7F2E'); gr.addColorStop(0.5, '#3F6123'); gr.addColorStop(1, '#2A3F18');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(126,155,62,0.9)'; g.fillRect(R() * W, H * 0.1, 3, H * 0.9); }
      for (let i = 0; i < 900; i++) {
        const x = R() * W, y = H * (0.12 + R() * 0.8), dir = R() < 0.5 ? -1 : 1, l = 16 + R() * 34;
        g.strokeStyle = ['#5E8D31', '#6FA03B', '#4A7628', '#86AD4A', '#3B6020'][(R() * 5) | 0];
        g.lineWidth = 3 + R() * 3;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dir * l * 0.5, y - 10, x + dir * l, y + 8 + R() * 10); g.stroke();
      }
      g.strokeStyle = '#C8A65C'; g.lineWidth = 2;
      for (let i = 0; i < 160; i++) { const x = R() * W; g.beginPath(); g.moveTo(x, H * 0.1); g.lineTo(x + (R() - 0.5) * 14, R() * H * 0.08); g.stroke(); }
    });
    // rice: 4 shell layers (alpha, top view) + side clump card
    for (let k = 0; k < 4; k++) {
      tx('ruRice' + k, 256, 256, (g, W, H) => {
        g.clearRect(0, 0, W, H);
        const RR = this._rng(555);
        const step = W / 5;
        for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
          const cx = (i + 0.5) * step + (RR() - 0.5) * 10, cy = (j + 0.5) * step + (RR() - 0.5) * 10;
          const nb = 12 + ((RR() * 6) | 0);
          for (let b = 0; b < nb; b++) {
            const a = RR() * Math.PI * 2;
            const r0 = 1 + k * 3.2, r1 = r0 + 4 + k * 3;
            g.strokeStyle = k === 3 ? '#9CC45A' : (k === 2 ? '#7FB046' : (k === 1 ? '#679A3A' : '#557F31'));
            g.lineWidth = 3.4 - k * 0.3;
            g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
          }
        }
      });
    }
    tx('ruRiceClump', 128, 128, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      for (let b = 0; b < 26; b++) {
        const a = (R() - 0.5) * 1.5;
        const l = H * (0.6 + R() * 0.38);
        g.strokeStyle = ['#5E9A35', '#76AE45', '#4E8530', '#8DBE55'][(R() * 4) | 0];
        g.lineWidth = 2 + R() * 1.6;
        g.beginPath(); g.moveTo(W / 2 + (R() - 0.5) * 8, H);
        g.quadraticCurveTo(W / 2 + Math.sin(a) * l * 0.4, H - l * 0.6, W / 2 + Math.sin(a) * l * 0.75 + (R() - 0.5) * 10, H - l);
        g.stroke();
      }
    }, { repeat: false });
    tx('ruStubble', 512, 512, (g, W, H) => {
      g.fillStyle = '#B8995C'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 12, 40, 120, 'rgba(120,95,55,0.25)');
      for (let r = 0; r < 20; r++) {
        const y = (r + 0.5) * (H / 20);
        for (let i = 0; i < 40; i++) {
          const x = R() * W;
          g.strokeStyle = ['#E2C47C', '#CDAA62', '#F0D48E', '#A98C52'][(R() * 4) | 0];
          g.lineWidth = 2;
          for (let s = 0; s < 4; s++) { g.beginPath(); g.moveTo(x + s * 2, y + 4); g.lineTo(x + s * 2 + (R() - 0.5) * 3, y - 4 - R() * 4); g.stroke(); }
        }
      }
      for (let i = 0; i < 900; i++) {
        const x = R() * W, y = R() * H, a = R() * Math.PI, l = 8 + R() * 22;
        g.strokeStyle = 'rgba(238,212,140,0.8)'; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      speck(g, W, H, 5000, 1, 2, ['rgba(80,60,30,0.3)', 'rgba(255,240,200,0.25)']);
    });
    tx('ruBurnt', 512, 512, (g, W, H) => {
      g.fillStyle = '#2B2826'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 26, 30, 110, 'rgba(120,116,110,0.30)');
      blots(g, W, H, 14, 20, 70, 'rgba(10,9,8,0.55)');
      speck(g, W, H, 12000, 1, 3, ['rgba(0,0,0,0.5)', 'rgba(160,155,150,0.35)', 'rgba(90,70,50,0.35)']);
      for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(190,160,100,0.55)'; g.fillRect(R() * W, R() * H, 2, 5); }
    });
    tx('ruStraw', 256, 256, (g, W, H) => {
      g.fillStyle = '#C9A55C'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 1600; i++) {
        const x = R() * W, y = R() * H, a = (R() - 0.5) * 1.2, l = 10 + R() * 30;
        g.strokeStyle = ['#E8CC86', '#D9B66C', '#B58F4C', '#F2DDA0', '#9E7C40'][(R() * 5) | 0];
        g.lineWidth = 1 + R() * 1.4;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
    });
    tx('ruChain', 128, 128, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      g.strokeStyle = '#B6BBBF'; g.lineWidth = 2.2;
      const s = 16;
      for (let i = -8; i < 16; i++) {
        g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s + H, H); g.stroke();
        g.beginPath(); g.moveTo(i * s, H); g.lineTo(i * s + H, 0); g.stroke();
      }
    });
    tx('ruPanel', 512, 512, (g, W, H) => {
      g.fillStyle = '#C9CED2'; g.fillRect(0, 0, W, H);
      for (let p = 0; p < 2; p++) {
        const x0 = p * 256 + 6, w = 244;
        g.fillStyle = '#16243F'; g.fillRect(x0, 6, w, H - 12);
        const cw = w / 6, ch = (H - 12) / 12;
        for (let i = 0; i < 6; i++) for (let j = 0; j < 12; j++) {
          const gr = g.createLinearGradient(x0 + i * cw, 6 + j * ch, x0 + (i + 1) * cw, 6 + (j + 1) * ch);
          gr.addColorStop(0, '#2A4675'); gr.addColorStop(1, '#1A2D52');
          g.fillStyle = gr; g.fillRect(x0 + i * cw + 1.5, 6 + j * ch + 1.5, cw - 3, ch - 3);
          g.fillStyle = 'rgba(200,210,225,0.35)'; g.fillRect(x0 + i * cw + cw * 0.33, 6 + j * ch + 1.5, 1, ch - 3); g.fillRect(x0 + i * cw + cw * 0.66, 6 + j * ch + 1.5, 1, ch - 3);
        }
      }
    });
    tx('ruLeaf', 512, 512, (g, W, H) => {
      g.fillStyle = '#1B2E15'; g.fillRect(0, 0, W, H);
      const cols = ['#2E4F22', '#3A6029', '#45702F', '#527E36', '#2A4620', '#5F8B3C', '#36592A', '#4B6E2C'];
      // crown clumps: many small leaves around a centre, darker at the rim
      for (let i = 0; i < 220; i++) {
        const cx = R() * W, cy = R() * H, cr = 14 + R() * 30;
        const base = cols[(R() * cols.length) | 0];
        for (let k = 0; k < 70; k++) {
          const a = R() * Math.PI * 2, d = Math.sqrt(R()) * cr;
          const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
          const lit = 1 - d / cr * 0.6 - (Math.sin(a + 0.8) * 0.25);
          g.fillStyle = lit > 0.85 ? '#7E9F4E' : (lit > 0.6 ? base : '#22391A');
          for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) {
            const px = x + ox, py = y + oy;
            if (px < -8 || px > W + 8 || py < -8 || py > H + 8) continue;
            g.beginPath(); g.ellipse(px, py, 3 + R() * 3, 1.6 + R() * 1.6, R() * 3.14, 0, 7); g.fill();
          }
        }
      }
    });
    tx('ruTrash', 512, 512, (g, W, H) => {
      g.fillStyle = '#6E6456'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 14, 30, 90, 'rgba(40,34,28,0.35)');
      const cols = ['#F2F2EE', '#E9E4D8', '#3C78C8', '#D85C8A', '#2E9A5A', '#1C1C1C', '#E8C52A', '#B07A44', '#9C6B3C', '#C9D4DC', '#E04A3A'];
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = cols[(R() * cols.length) | 0];
        g.globalAlpha = 0.65 + R() * 0.35;
        const x = R() * W, y = R() * H, w = 3 + R() * 16, h = 2 + R() * 10;
        g.save(); g.translate(x, y); g.rotate(R() * Math.PI); g.fillRect(-w / 2, -h / 2, w, h); g.restore();
      }
      g.globalAlpha = 1;
      speck(g, W, H, 4000, 1, 3, ['rgba(0,0,0,0.35)', 'rgba(255,255,255,0.15)']);
    });
  },

  _ruBuckets() {
    const E = this._E;
    const T = E.T;
    const X = E.tex;
    if (E.BK.ruFlat) return;
    const clone = (name, base) => {
      const b = E.BK[base];
      E.BK[name] = Object.assign({}, b, { mat: b.mat.clone(), chunk: 3000, name: name });
    };
    const bases = ['flat', 'shiny', 'glow', 'glass', 'plaster', 'concrete', 'metal', 'tile', 'wood', 'dirt', 'grass', 'brick', 'asphalt'];
    for (const k of bases) clone('ru' + k[0].toUpperCase() + k.slice(1), k);
    const std = (map, o) => new T.MeshStandardMaterial(Object.assign({ vertexColors: true, map: map, roughness: 0.95, metalness: 0 }, o || {}));
    const add = (name, mat, tw, th, cast) => { E.BK[name] = { mat: mat, tw: tw, th: th, cast: !!cast, chunk: 3000, name: name }; };
    add('ruStubble', std(X.ruStubble), 3, 3);
    add('ruBurnt', std(X.ruBurnt), 4, 4);
    add('ruStraw', std(X.ruStraw), 1.4, 1.4, true);
    add('ruTrash', std(X.ruTrash), 5, 5);
    add('ruCornTop', std(X.ruCornTop), 3, 3, true);
    add('ruCornSide', std(X.ruCornSide), 4, 2.3, true);
    add('ruChain', std(X.ruChain, { alphaTest: 0.5, side: T.DoubleSide, roughness: 0.5, metalness: 0.4 }), 0.6, 0.6);
    add('ruCanopy', std(X.ruLeaf, { side: T.DoubleSide, roughness: 0.96 }), 14, 14, true);
  },

  // ----------------------------------------------------------------- small props
  _ruFenceChain(x0, z0, x1, z1, h, gaps) {
    const segs = [[0, 1]];
    const L = Math.hypot(x1 - x0, z1 - z0);
    let cut = [[0, L]];
    for (const g of gaps || []) {
      const nc = [];
      for (const c of cut) {
        if (g[1] <= c[0] || g[0] >= c[1]) nc.push(c);
        else { if (g[0] > c[0]) nc.push([c[0], g[0]]); if (g[1] < c[1]) nc.push([g[1], c[1]]); }
      }
      cut = nc;
    }
    void segs;
    const dx = (x1 - x0) / L, dz = (z1 - z0) / L;
    for (const c of cut) {
      const a = [x0 + dx * c[0], z0 + dz * c[0]], b = [x0 + dx * c[1], z0 + dz * c[1]];
      const l = c[1] - c[0];
      const n = Math.max(1, Math.round(l / 3));
      for (let i = 0; i <= n; i++) {
        const px = a[0] + (b[0] - a[0]) * (i / n), pz = a[1] + (b[1] - a[1]) * (i / n);
        this.box('ruShiny', px, 0, pz, 0.07, h + 0.1, 0.07, '#8E959A');
      }
      this._ruSeg('ruShiny', [a[0], h, a[1]], [b[0], h, b[1]], 0.025, '#8E959A', 6);
      this._face('ruChain', [(a[0] + b[0]) / 2, h / 2, (a[1] + b[1]) / 2], [dx, 0, dz], [0, 1, 0], l / 2, h / 2, '#C9CED2');
      this._col(Math.min(a[0], b[0]) - 0.08, Math.min(a[1], b[1]) - 0.08, Math.max(a[0], b[0]) + 0.08, Math.max(a[1], b[1]) + 0.08);
    }
  },

  _ruFenceWood(x0, z0, x1, z1, gaps) {
    const L = Math.hypot(x1 - x0, z1 - z0);
    let cut = [[0, L]];
    for (const g of gaps || []) {
      const nc = [];
      for (const c of cut) {
        if (g[1] <= c[0] || g[0] >= c[1]) nc.push(c);
        else { if (g[0] > c[0]) nc.push([c[0], g[0]]); if (g[1] < c[1]) nc.push([g[1], c[1]]); }
      }
      cut = nc;
    }
    const dx = (x1 - x0) / L, dz = (z1 - z0) / L;
    const ry = Math.atan2(dx, dz);
    for (const c of cut) {
      const a = [x0 + dx * c[0], z0 + dz * c[0]], b = [x0 + dx * c[1], z0 + dz * c[1]];
      const l = c[1] - c[0];
      const n = Math.max(1, Math.round(l / 2.5));
      for (let i = 0; i <= n; i++) this.box('ruWood', a[0] + (b[0] - a[0]) * (i / n), 0, a[1] + (b[1] - a[1]) * (i / n), 0.14, 1.3, 0.14, '#8A6B4C');
      for (const y of [0.55, 1.05]) this.box('ruWood', (a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2, 0.06, 0.12, l, '#9C7B58', { ry: ry });
      this._col(Math.min(a[0], b[0]) - 0.1, Math.min(a[1], b[1]) - 0.1, Math.max(a[0], b[0]) + 0.1, Math.max(a[1], b[1]) + 0.1);
    }
  },

  _ruLampPole(x, z, h, yaw, col) {
    const y0 = this._ruH(x, z);
    this.cyl('ruShiny', x, y0, z, 0.09, h, '#8E959A', 8);
    const X = this._ruXf(x, z, yaw || 0);
    const p = X(0, 1.2);
    this._ruSeg('ruShiny', [x, y0 + h - 0.1, z], [p[0], y0 + h + 0.15, p[1]], 0.05, '#8E959A', 6);
    this.box('ruFlat', p[0], y0 + h - 0.05, p[1], 0.35, 0.16, 0.6, '#5C6166', { ry: yaw || 0 });
    this.box('ruGlow', p[0], y0 + h - 0.09, p[1], 0.26, 0.04, 0.48, '#FFE6B8', { ry: yaw || 0 });
    this._lamp(p[0], y0 + h - 0.2, p[1], { color: col || '#FFD39A', pool: 8, gy: y0 });
  },

  // Thai concrete power pole with cross-arm, returns 3 conductor points
  _ruPole(x, z, h, ry) {
    const y0 = this._ruH(x, z);
    this.box('ruConcrete', x, y0, z, 0.26, h, 0.26, '#C4C0B8');
    const X = this._ruXf(x, z, ry);
    this.box('ruFlat', x, y0 + h - 0.55, z, 2.4, 0.12, 0.12, '#6E6A62', { ry: ry });
    const pts = [];
    for (const lx of [-1.05, 0, 1.05]) {
      const p = X(lx, 0);
      const yy = y0 + h - 0.42 + (lx === 0 ? 0.35 : 0);
      this.cyl('ruFlat', p[0], yy - 0.12, p[1], 0.06, 0.2, '#E6E2D9', 8);
      pts.push([p[0], yy + 0.08, p[1]]);
    }
    return pts;
  },

  _ruWires(polesPts) {
    for (let i = 0; i < polesPts.length - 1; i++) {
      const A = polesPts[i], B = polesPts[i + 1];
      for (let k = 0; k < 3; k++) {
        const a = A[k], b = B[k];
        const span = Math.hypot(b[0] - a[0], b[2] - a[2]);
        const sag = 0.012 * span;
        const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - sag, (a[2] + b[2]) / 2];
        const q1 = [(a[0] + m[0]) / 2, (a[1] + m[1]) / 2 - sag * 0.25, (a[2] + m[2]) / 2];
        const q2 = [(m[0] + b[0]) / 2, (m[1] + b[1]) / 2 - sag * 0.25, (m[2] + b[2]) / 2];
        this._ruSeg('ruFlat', a, q1, 0.014, '#2A2A2A', 4);
        this._ruSeg('ruFlat', q1, m, 0.014, '#2A2A2A', 4);
        this._ruSeg('ruFlat', m, q2, 0.014, '#2A2A2A', 4);
        this._ruSeg('ruFlat', q2, b, 0.014, '#2A2A2A', 4);
      }
    }
  },

  _ruPowerLine(pts, h, skip) {
    const poles = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (skip && skip(p[0], p[1])) {
        if (poles.length > 1) this._ruWires(poles);
        poles.length = 0;
        continue;
      }
      const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
      const ry = Math.atan2(q[0] - o[0], q[1] - o[1]) + Math.PI / 2;
      poles.push(this._ruPole(p[0], p[1], h, ry));
    }
    if (poles.length > 1) this._ruWires(poles);
  },

  // Thai stilt house (wood + tile/metal roof), local front = +z
  _ruStiltHouse(x, z, yaw, wall, roof, o) {
    o = o || {};
    const y0 = this._ruH(x, z);
    const X = this._ruXf(x, z, yaw);
    const W = o.w || 8, D = o.d || 6.5, lift = o.lift || 2.3;
    for (const lx of [-W / 2 + 0.3, 0, W / 2 - 0.3]) for (const lz of [-D / 2 + 0.3, D / 2 - 0.3]) {
      const p = X(lx, lz);
      this.box('ruConcrete', p[0], y0, p[1], 0.24, lift, 0.24, '#C9C3B6', { ry: yaw });
    }
    this.box('ruWood', x, y0 + lift, z, W + 0.4, 0.2, D + 0.4, '#7A5A3E', { ry: yaw });
    this.box('ruWood', x, y0 + lift + 0.2, z, W, 2.5, D, wall || '#B98A5C', { ry: yaw, top: false });
    // windows & door on the front
    for (const lx of [-W / 2 + 1.4, W / 2 - 1.4]) {
      const p = X(lx, D / 2 + 0.03);
      this.box('ruFlat', p[0], y0 + lift + 1.1, p[1], 1.0, 0.9, 0.06, '#3B2E24', { ry: yaw });
    }
    const pd = X(0, D / 2 + 0.03);
    this.box('ruFlat', pd[0], y0 + lift + 0.2, pd[1], 0.9, 1.9, 0.06, '#5A3F2A', { ry: yaw });
    // veranda + stairs
    const pv = X(0, D / 2 + 1.0);
    this.box('ruWood', pv[0], y0 + lift, pv[1], W * 0.6, 0.16, 1.6, '#7A5A3E', { ry: yaw });
    for (let s = 0; s < 6; s++) {
      const ps = X(W * 0.3 + 0.6, D / 2 + 1.6 - s * 0.38);
      this.box('ruWood', ps[0], y0 + lift - (s + 1) * (lift / 6.5), ps[1], 1.0, 0.08, 0.32, '#6E5036', { ry: yaw });
    }
    this.gable(o.roofB || 'ruTile', x, y0 + lift + 2.7, z, W + 0.2, D + 0.2, 2.2, roof || '#9C4A2E', { ry: yaw, oh: 0.8, wall: 'ruWood', wallCol: wall || '#B98A5C' });
    this._colBox(x, z, W + 0.8, D + 1.8, yaw, 0.1);
  },

  // field hut on stilts with thatch roof
  _ruHut(x, z, yaw) {
    const y0 = this._ruH(x, z);
    const X = this._ruXf(x, z, yaw);
    for (const lx of [-1.3, 1.3]) for (const lz of [-1.1, 1.1]) {
      const p = X(lx, lz);
      this.cyl('ruWood', p[0], y0, p[1], 0.07, 3.2, '#6E5236', 6);
    }
    this.box('ruWood', x, y0 + 1.0, z, 2.9, 0.12, 2.5, '#9A7650', { ry: yaw });
    this.gable('ruStraw', x, y0 + 3.0, z, 3.4, 3.0, 1.2, '#E0C27C', { ry: yaw, oh: 0.5, wall: false });
    this._colBox(x, z, 2.9, 2.5, yaw, 0.1);
  },

  // generic Thai field tractor (static)
  _ruTractor(x, z, yaw) {
    const y0 = this._ruH(x, z);
    const X = this._ruXf(x, z, yaw);
    const P = (lx, lz) => X(lx, lz);
    let p = P(0, 0.3);
    this.box('ruFlat', p[0], y0 + 0.75, p[1], 0.9, 0.7, 2.6, '#E36A1E', { ry: yaw });
    p = P(0, 1.2);
    this.box('ruFlat', p[0], y0 + 1.1, p[1], 0.8, 0.55, 1.2, '#E36A1E', { ry: yaw });
    p = P(0, 1.85);
    this.box('ruFlat', p[0], y0 + 0.9, p[1], 0.7, 0.6, 0.12, '#2E2E2E', { ry: yaw });
    for (const s of [-1, 1]) {
      p = P(s * 0.85, -0.7);
      this.cylR('ruFlat', p[0], y0 + 0.75, p[1], 0.75, 0.45, '#1F1F1F', 0, yaw, Math.PI / 2, 16);
      this.cylR('ruFlat', p[0], y0 + 0.75, p[1], 0.42, 0.47, '#E36A1E', 0, yaw, Math.PI / 2, 12);
      p = P(s * 0.72, 1.4);
      this.cylR('ruFlat', p[0], y0 + 0.42, p[1], 0.42, 0.3, '#1F1F1F', 0, yaw, Math.PI / 2, 12);
      p = P(s * 0.6, -0.9);
      this._ruSeg('ruShiny', [p[0], y0 + 1.2, p[1]], [p[0], y0 + 2.6, p[1]], 0.04, '#2E2E2E', 6);
    }
    p = P(0, -0.9);
    this.box('ruFlat', p[0], y0 + 2.6, p[1], 1.5, 0.06, 1.2, '#E36A1E', { ry: yaw });
    p = P(0, -0.6);
    this.box('ruFlat', p[0], y0 + 1.25, p[1], 0.5, 0.12, 0.5, '#222222', { ry: yaw });
    p = P(0.25, 1.0);
    this._ruSeg('ruShiny', [p[0], y0 + 1.6, p[1]], [p[0], y0 + 2.3, p[1]], 0.05, '#3A3A3A', 6);
    this._colBox(x, z, 2.2, 3.6, yaw, 0.1);
  },

  // municipal rear-loader compactor garbage truck (static), local front = +z, base y
  _ruGarbageTruck(x, y, z, yaw, o) {
    o = o || {};
    const X = this._ruXf(x, z, yaw);
    const G = o.body || '#2E7D4F', G2 = '#24653F';
    const bx = (lx, ly, lz, w, h, d, col, b) => { const p = X(lx, lz); this.box(b || 'ruFlat', p[0], y + ly, p[1], w, h, d, col, { ry: yaw }); };
    const br = (lx, ly, lz, w, h, d, col, rx, rz, b) => { const p = X(lx, lz); this.boxR(b || 'ruFlat', p[0], y + ly, p[1], w, h, d, col, rx, yaw, rz); };
    // chassis, fuel tank, side under-run rails
    bx(0, 0.42, -0.4, 1.0, 0.34, 9.6, '#262626');
    { const p = X(-1.02, 2.15); this.cylR('ruShiny', p[0], y + 0.82, p[1], 0.3, 1.1, '#A7ADB1', Math.PI / 2, yaw, 0, 12); }
    for (const s of [-1, 1]) bx(s * 1.2, 0.5, -0.9, 0.06, 0.14, 3.2, '#DADAD5');
    // cab (white), windshield leaning back, door lines, side windows, bumper, grille, lights, mirrors, beacon
    bx(0, 0.95, 3.75, 2.46, 2.0, 2.25, '#F3F3F0');
    br(0, 2.38, 4.86, 2.12, 0.86, 0.05, '#2A3B47', -0.13, 0, 'ruGlass');
    for (const s of [-1, 1]) {
      bx(s * 1.235, 1.95, 3.95, 0.04, 0.78, 1.25, '#2A3B47', 'ruGlass');
      bx(s * 1.24, 1.0, 3.22, 0.03, 1.75, 0.04, '#B9BCBE');
      bx(s * 1.24, 1.0, 4.62, 0.03, 1.75, 0.04, '#B9BCBE');
      bx(s * 1.24, 1.38, 3.95, 0.03, 0.05, 0.9, '#9DA1A4');
      bx(s * 1.0, 0.98, 4.94, 0.38, 0.2, 0.05, '#FFF4D6', 'ruGlow');
      bx(s * 1.48, 2.15, 4.35, 0.06, 0.55, 0.22, '#2B2B2B');
      bx(s * 1.36, 2.35, 4.35, 0.26, 0.04, 0.04, '#2B2B2B');
      bx(s * 1.12, 0.62, 3.0, 0.32, 0.06, 0.42, '#5C6064');
    }
    bx(0, 0.58, 4.98, 2.5, 0.38, 0.22, '#2E2E2E');
    bx(0, 1.06, 4.89, 1.5, 0.5, 0.06, '#3E4246');
    for (let k = 0; k < 4; k++) bx(0, 1.12 + k * 0.11, 4.93, 1.42, 0.035, 0.03, '#8E9397');
    bx(0, 2.95, 3.7, 2.36, 0.1, 2.05, '#E6E6E2');
    bx(0, 3.05, 3.9, 0.36, 0.14, 0.24, '#FFB300', 'ruGlow');
    bx(0, 2.6, 4.9, 2.0, 0.22, 0.05, G);
    // compactor body: chamfered top, white band, vertical ribs
    bx(0, 1.0, -1.15, 2.5, 2.05, 7.1, G);
    bx(0, 3.05, -1.15, 1.9, 0.38, 7.1, G);
    for (const s of [-1, 1]) {
      br(s * 0.98, 3.0, -1.15, 0.58, 0.58, 7.1, G, 0, Math.PI / 4);
      bx(s * 1.256, 1.82, -1.15, 0.02, 0.32, 7.12, '#F4F4F0');
      for (let k = 0; k < 8; k++) bx(s * 1.265, 1.0, 2.15 - k * 0.92, 0.04, 2.05, 0.09, G2);
    }
    // ladder (left front of body)
    for (const dz of [-0.2, 0.2]) bx(-1.3, 1.0, 1.9 + dz, 0.04, 2.4, 0.05, '#C9CDD0');
    for (let k = 0; k < 6; k++) bx(-1.3, 1.2 + k * 0.38, 1.9, 0.04, 0.04, 0.45, '#C9CDD0');
    // tailgate / hopper with slanted back, opening, hazard stripes, lights, step
    bx(0, 0.92, -5.12, 2.5, 2.55, 0.85, G2);
    br(0, 2.2, -5.62, 2.44, 1.7, 0.4, G2, 0.42, 0);
    bx(0, 0.95, -5.58, 1.9, 1.05, 0.06, '#151515');
    for (const s of [-1, 1]) {
      bx(s * 1.08, 0.95, -5.57, 0.22, 1.6, 0.05, '#F2C200');
      for (let k = 0; k < 4; k++) br(s * 1.08, 1.12 + k * 0.38, -5.6, 0.22, 0.08, 0.04, '#1A1A1A', 0, 0.6);
      bx(s * 0.92, 2.0, -5.6, 0.2, 0.32, 0.06, '#FF3B2F', 'ruGlow');
    }
    bx(0, 0.55, -5.75, 2.1, 0.1, 0.45, '#5C6064');
    // wheels: front single, rear tandem duals
    for (const lz of [3.4, -2.05, -3.35]) for (const s of [-1, 1]) {
      const dual = lz < 0 ? [0.94, 1.22] : [1.08];
      for (const off of dual) {
        const p = X(s * off, lz);
        this.cylR('ruFlat', p[0], y + 0.52, p[1], 0.52, 0.3, '#1C1C1C', 0, yaw, Math.PI / 2, 14);
      }
      const ph = X(s * (lz < 0 ? 1.38 : 1.24), lz);
      this.cylR('ruShiny', ph[0], y + 0.52, ph[1], 0.25, 0.03, '#A7ADB1', 0, yaw, Math.PI / 2, 10);
      bx(s * 1.12, 1.02, lz, 0.5, 0.06, 1.2, '#2B2B2B');
    }
    // exhaust stack behind the cab
    const pe = X(1.02, 2.5);
    this.cyl('ruShiny', pe[0], y + 1.5, pe[1], 0.075, 2.45, '#4A4D50', 8);
    if (o.text) {
      for (const s of [-1, 1]) {
        const p = X(s * 1.31, -1.15);
        this._sign('เทศบาลเมืองคาร์บอน', 4.4, 0.6, null, '#FFFFFF', [p[0], y + 2.5, p[1]], yaw + s * Math.PI / 2, { size: 0.64 });
      }
    }
    this._colBox(x, z, 2.7, 11.0, yaw, 0.15);
    return { exhaust: [pe[0], y + 4.0, pe[1]] };
  },

  // ================================================================= LANDFILL (stops 13, 14)
  _bLandfill() {
    const E = this._ruInit();
    const T = E.T;
    const R = this._rng(1301);
    // ---- ground & roads
    this.plane('ruGrass', 925, 0.035, -430, 270, 260, '#B7B67E');
    this.plane('ruDirt', 838, 0.06, -446, 96, 140, '#BBA98C');
    this.plane('ruDirt', 965, 0.06, -430, 186, 246, '#B3A286');
    this.plane('ruConcrete', 787, 0.12, -430, 46, 9, '#CFC9BE');
    this.plane('ruConcrete', 832, 0.12, -430, 44, 9, '#C8C2B7');
    this.plane('ruDirt', 870, 0.11, -455, 24, 60, '#A99A82');
    // ---- gate
    for (const zz of [-438.6, -421.4]) {
      this.box('ruConcrete', 790, 0, zz, 1.2, 5.6, 1.2, '#E2DCD0');
      this.box('ruFlat', 790, 5.6, zz, 1.4, 0.3, 1.4, '#2F6E4A');
    }
    this.box('ruConcrete', 790, 5.0, -430, 0.8, 1.4, 18.4, '#2F6E4A');
    this._sign('ศูนย์กำจัดขยะเทศบาลเมืองคาร์บอน', 15.6, 1.1, '#2F6E4A', '#FFFFFF', [789.57, 5.7, -430], -Math.PI / 2, { size: 0.5 });
    this._col(789.3, -439.3, 790.7, -437.9);
    this._col(789.3, -422.1, 790.7, -420.7);
    this._lamp(790, 6.2, -438.6, { pool: 6 });
    this._lamp(790, 6.2, -421.4, { pool: 6 });
    // ---- perimeter fence (gate gap)
    this._ruFenceChain(790, -560, 790, -439.3, 2.2);
    this._ruFenceChain(790, -420.7, 790, -300, 2.2);
    this._ruFenceChain(790, -560, 1060, -560, 2.2);
    this._ruFenceChain(1060, -560, 1060, -300, 2.2);
    this._ruFenceChain(790, -300, 1060, -300, 2.2);
    // ---- guard hut + boom barrier
    this.box('ruPlaster', 797, 0.12, -417, 2.6, 2.6, 2.6, '#F1E8D6', { top: false });
    this.hip('ruMetal', 797, 2.72, -417, 2.6, 2.6, 0.8, '#3D6E9E', { oh: 0.35 });
    this.box('ruGlass', 797, 1.1, -418.33, 1.8, 0.9, 0.05, '#9FB8C6');
    this._col(795.6, -418.4, 798.4, -415.6);
    this.box('ruFlat', 800.6, 0, -435.7, 0.35, 1.1, 0.35, '#E0E0DA');
    this.box('ruFlat', 800.6, 1.05, -435.7, 0.12, 5.2, 0.12, '#E53935');
    for (let k = 0; k < 4; k++) this.box('ruFlat', 800.6, 1.6 + k * 1.2, -435.7, 0.13, 0.4, 0.13, '#FFFFFF');
    this._col(800.3, -436, 800.9, -435.4);
    // ---- weighbridge + scale house + display
    this.box('ruConcrete', 817, 0.12, -430, 19.6, 0.1, 4.8, '#B3ADA3');
    this.box('ruMetal', 817, 0.12, -430, 18, 0.2, 3.4, '#7D848A');
    this.boxR('ruConcrete', 807.25, 0.2, -430, 1.6, 0.12, 3.4, '#AFA99F', 0, 0, 0.118);
    this.boxR('ruConcrete', 826.75, 0.2, -430, 1.6, 0.12, 3.4, '#AFA99F', 0, 0, -0.118);
    for (const zz of [-431.85, -428.15]) this.box('ruFlat', 817, 0.12, zz, 18, 0.28, 0.25, '#E6B820');
    this.box('ruPlaster', 815.5, 0.12, -438, 5, 2.9, 4, '#EFE6D2', { top: false });
    this.hip('ruMetal', 815.5, 3.02, -438, 5, 4, 1.0, '#3D6E9E', { oh: 0.5 });
    this.box('ruGlass', 815.5, 1.1, -435.97, 3.0, 1.1, 0.06, '#9FB8C6');
    this.box('ruFlat', 815.5, 2.22, -435.95, 3.2, 0.1, 0.1, '#D7D2C8');
    this.box('ruFlat', 812.97, 0.12, -438.7, 0.06, 2.1, 0.95, '#6B4F3A');
    this.box('ruFlat', 818.15, 1.6, -437.4, 0.3, 0.55, 0.85, '#E9ECEE');
    this._col(812.9, -440.1, 818.4, -435.9);
    this._lamp(813, 2.7, -435.7, { pool: 5 });
    this.cyl('ruShiny', 822.5, 0.12, -434.6, 0.06, 2.6, '#8B9195', 8);
    this.box('ruFlat', 822.5, 2.6, -434.6, 2.3, 0.8, 0.22, '#1B1D1F');
    this._sign('12,480 kg', 2.05, 0.62, '#0E0F10', '#FF3B2F', [822.5, 3.0, -434.48], 0, { size: 0.62 });
    this._col(822.2, -434.9, 822.8, -434.3);
    // ---- office / workshop + parked pickup
    this.box('ruPlaster', 809, 0.11, -466, 18, 3.4, 12, '#EDE5D4', { top: false });
    this.gable('ruMetal', 809, 3.51, -466, 18, 12, 1.8, '#2F5F8F', { wall: 'ruPlaster', wallCol: '#EDE5D4', oh: 0.7 });
    for (let k = 0; k < 4; k++) this.box('ruGlass', 802.5 + k * 4.3, 1.2, -459.97, 2.2, 1.2, 0.05, '#93AFC0');
    this.box('ruFlat', 816.5, 0.11, -459.96, 1.0, 2.2, 0.06, '#5B4A3A');
    this._col(799.8, -472.2, 818.2, -459.8);
    this._lamp(812, 3.2, -459.5, { pool: 6 });
    E.parkSpots.push({ x: 824, z: -466, yaw: 0, kind: 'pickup', color: '#E9E9E6' });
    // yard lamp poles
    this._ruLampPole(848, -446, 8, Math.PI, '#FFD39A');
    this._ruLampPole(838, -414, 8, 0, '#FFD39A');
    this._ruLampPole(880, -472, 8, Math.PI / 2, '#FFD39A');
    // ---- leachate pond (raised berms) + pump house
    const P0 = [800, -552, 862, -503];
    this.box('ruDirt', 831, 0.05, -550.5, 62, 1.2, 3, '#9C8A70');
    this.box('ruDirt', 831, 0.05, -504.5, 62, 1.2, 3, '#9C8A70');
    this.box('ruDirt', 801.5, 0.05, -527.5, 3, 1.2, 43, '#9C8A70');
    this.box('ruDirt', 860.5, 0.05, -527.5, 3, 1.2, 43, '#9C8A70');
    this.box('ruFlat', 831, 0.55, -548.97, 56, 0.7, 0.06, '#1E1E1E');
    this.box('ruFlat', 831, 0.55, -506.03, 56, 0.7, 0.06, '#1E1E1E');
    this.box('ruFlat', 803.03, 0.55, -527.5, 0.06, 0.7, 43, '#1E1E1E');
    this.box('ruFlat', 858.97, 0.55, -527.5, 0.06, 0.7, 43, '#1E1E1E');
    {
      const wm = E.mats.water.clone();
      wm.map = E.tex.water.clone(); wm.map.needsUpdate = true;
      wm.color = this._lcol('#5B5638');
      wm.roughness = 0.2;
      const geo = new T.PlaneGeometry(56, 43).rotateX(-Math.PI / 2);
      const m = new T.Mesh(geo, wm);
      m.position.set(831, 0.82, -527.5);
      m.receiveShadow = true;
      this._addDyn(m);
      this._anim((dt, t) => { wm.map.offset.set(t * 0.004, t * 0.0025); });
    }
    this._col(P0[0], P0[1], P0[2], P0[3]);
    this.box('ruPlaster', 867, 0.05, -508, 3, 2.4, 3, '#E8E0CF');
    this.box('ruMetal', 867, 2.45, -508, 3.4, 0.15, 3.4, '#6C7378');
    this.tube('ruFlat', [[865.5, 0.6, -509], [862, 1.3, -510], [858, 1.3, -512]], 0.12, '#2B2B2B', 8);
    this._col(865.4, -509.6, 868.6, -506.4);
    // ---- landfill mound (3 tiers, capped lower slopes, active west face)
    const T1b = [880, -545, 1050, -315], T1t = [898, -527, 1032, -333];
    const T2b = [904, -521, 1026, -339], T2t = [922, -503, 1008, -357];
    const T3b = [928, -497, 1002, -363], T3t = [943, -482, 987, -378];
    this._ruFrustum(T1b, T1t, 0.05, 6, { all: ['ruGrass', '#D2C793'], top: ['ruDirt', '#A99780'] });
    this._ruFrustum(T2b, T2t, 6, 12, { all: ['ruGrass', '#C9BE8A'], w: ['ruDirt', '#A08C72'], top: ['ruDirt', '#A08D74'] });
    this._ruFrustum(T3b, T3t, 12, 17, { all: ['ruDirt', '#94816A'], w: ['ruTrash', '#FFFFFF'], top: ['ruDirt', '#8E7C66'] });
    this.plane('ruTrash', 953, 17.08, -430, 20, 98, '#FFFFFF');
    this._col(T1b[0], T1b[1], T1b[2], T1b[3]);
    // haul ramp up the south face
    {
      const len = Math.hypot(78, 16.9), rx = Math.atan2(16.9, 78);
      this.boxR('ruDirt', 975, 7.95, -339, 8, 1.2, len, '#C2B39A', rx, 0, 0);
      for (const s of [-1, 1]) this.boxR('ruDirt', 975 + s * 4.3, 8.55, -339, 0.7, 0.8, len, '#8F7E66', rx, 0, 0);
      this._col(970.5, -315, 979.5, -299.5);
    }
    // 3-D debris on the active face and top strip
    const tcols = ['#F2F2EE', '#E2DDD1', '#3C78C8', '#D85C8A', '#2E9A5A', '#1C1C1C', '#E8C52A', '#B07A44', '#C9D4DC', '#E04A3A', '#8E6A40'];
    for (let i = 0; i < 520; i++) {
      const onTop = R() < 0.42;
      const x = onTop ? 943 + R() * 19 : 928.5 + R() * 14.5;
      const z = -480 + R() * 100;
      const y = onTop ? 17.05 : 12 + (5 * (x - 928)) / 15;
      const s = 0.18 + R() * 0.6;
      this.boxR('ruFlat', x, y + s * 0.2, z, s * (0.8 + R()), s * 0.4, s * (0.6 + R()), tcols[(R() * tcols.length) | 0], R() * 0.6, R() * 3, R() * 0.6);
    }
    // gas vents on the capped benches + collection header to the flare
    const vents = [];
    for (let z = -515; z <= -345; z += 30) vents.push([900.8, 6, z]);
    for (let x = 912; x <= 1020; x += 30) vents.push([x, 6, -335.5]);
    for (let z = -490; z <= -370; z += 30) vents.push([924.8, 12, z]);
    for (const v of vents) {
      this.cyl('ruConcrete', v[0], v[1] - 0.05, v[2], 0.45, 0.3, '#B9B3A8', 10);
      this.cyl('ruFlat', v[0], v[1], v[2], 0.11, 2.2, '#ECECE8', 8);
      this._ruSeg('ruFlat', [v[0], v[1] + 2.2, v[2]], [v[0] + 0.45, v[1] + 2.45, v[2]], 0.11, '#ECECE8', 8);
      this._ruSeg('ruFlat', [v[0] + 0.45, v[1] + 2.45, v[2]], [v[0] + 0.55, v[1] + 1.95, v[2]], 0.11, '#ECECE8', 8);
      this._col(v[0] - 0.5, v[2] - 0.5, v[0] + 0.5, v[2] + 0.5);
    }
    this.tube('ruFlat', [[901.6, 6.25, -515], [901.6, 6.25, -345]], 0.16, '#262626', 8);
    this.tube('ruFlat', [[901.6, 6.25, -515], [890, 2.4, -522], [879, 0.35, -527], [870.5, 0.35, -530]], 0.16, '#262626', 8);
    // gas flare station
    this.box('ruConcrete', 867.5, 0.05, -530, 6, 0.3, 5, '#BDB7AC');
    this.box('ruShiny', 866, 0.35, -531.2, 2.6, 1.0, 1.6, '#8E9A9F');
    this.cyl('ruShiny', 864.6, 0.35, -528.6, 0.55, 2.2, '#A3ADB2', 14);
    this.cyl('ruShiny', 869.2, 0.35, -530, 0.38, 7.2, '#9DA3A7', 14);
    this.cyl('ruShiny', 869.2, 7.55, -530, 0.55, 0.9, '#5E6468', 14);
    this._col(864.3, -533, 871, -527.4);
    this._ruFlame([[869.2, 8.4, -530]], { n: 7, r: [0.18, 0.32], h: [0.8, 1.6], spread: 0.25, seed: 77 });
    this._emitter({ type: 'fire', pos: [869.2, 8.5, -530], rate: 6, size: 0.9, rise: 1.6, spread: 0.3, life: 0.9, color: '#FF9A3A' });
    this._lamp(869.2, 8.6, -530, { color: '#FF9A4A', pool: 0 });
    // ---- landfill machines (excavator digging, compactor shuttling) + a truck tipping on top
    this._ruExcavator(950, 17.05, -428, -Math.PI / 2);
    this._ruCompactor(957, 17.05, -455);
    this._ruGarbageTruck(964, 17.05, -406, -Math.PI / 2, { body: '#2E7D4F' });
    this._emitter({ type: 'dust', pos: [946, 17.4, -428], rate: 3, size: 1.6, rise: 0.6, spread: 2.2, life: 3.5, color: '#B9A98C' });
    // ---- garbage trucks at the weighbridge
    const tr1 = this._ruGarbageTruck(817, 0.32, -430, Math.PI / 2, { text: true });
    this._ruGarbageTruck(800.6, 0.12, -430, Math.PI / 2, {});
    this._emitter({ type: 'exhaust', pos: tr1.exhaust, rate: 3, size: 0.45, rise: 1.2, spread: 0.2, life: 2.2, color: '#5A5A5A' });
    // ---- viewing pad for stop 14
    this.box('ruConcrete', 852, 0.05, -400, 7, 0.25, 5, '#D2CDC3');
    for (let k = 0; k <= 4; k++) this.cyl('ruShiny', 855.3, 0.3, -402.3 + k * 1.15, 0.04, 1.05, '#E3B21C', 6);
    for (const y of [0.85, 1.32]) this._ruSeg('ruShiny', [855.3, y, -402.3], [855.3, y, -397.7], 0.035, '#E3B21C', 6);
    this.box('ruFlat', 854.9, 0.3, -402.4, 0.12, 0.7, 0.12, '#4A4A4A');
    this.boxR('ruFlat', 854.9, 1.12, -402.4, 0.08, 0.62, 1.7, '#2B2B2B', 0, 0, -0.35);
    this._sign('บ่อฝังกลบขยะเทศบาล\nก๊าซมีเทน (CH₄) จากการย่อยสลายแบบไร้อากาศ', 1.6, 0.56, '#1F4D36', '#FFFFFF', [854.82, 1.14, -402.4], -Math.PI / 2, { size: 0.3 });
    this._col(855.15, -402.5, 855.5, -397.5);
    // ---- life
    E.crowdSpots.push({ x: 814.6, z: -439, yaw: Math.PI, mode: 'sit', outfit: 'worker' });
    E.crowdSpots.push({ x: 797.6, z: -420.4, yaw: -Math.PI / 2, mode: 'stand', outfit: 'worker' });
    E.crowdSpots.push({ x: 897, z: -472, yaw: Math.PI / 2, mode: 'work', outfit: 'worker' });
    E.animalSpots.egrets.push({ x: 872, z: -478, r: 9 }, { x: 905, z: -553, r: 7 });
    E.animalSpots.dogs.push({ x: 794, z: -412 }, { x: 806, z: -455 });
    E.animalSpots.birds.push([955, -430], [925, -480]);
    E.treeSpots.push({ x: 776, z: -452, s: 1.1, kind: 'rain' }, { x: 776, z: -405, s: 1.0, kind: 'rain' }, { x: 776, z: -478, s: 0.9, kind: 'mango' });
    // ---- stop anchors
    this._stopAnchor(13, {
      view: [812, -421.5], look: [818.5, 2.0, -430], guide: [813.9, -421.1], pin: [818, 5.4, -430],
      emit: tr1.exhaust, gas: ['CO2'], spread: 1.2, inside: null, district: 'landfill',
      route: [[765, -428], [788, -424.8], [806, -424.5], [812, -421.5]]
    });
    this._stopAnchor(14, {
      view: [852, -400], viewY: 1.95, look: [930, 9, -428], guide: [853.3, -398.5], pin: [912, 11.5, -425],
      emit: [905, 7.5, -430], gas: ['CH4'], spread: 22, inside: null, district: 'landfill',
      route: [[765, -428], [788, -424.8], [806, -424.5], [812, -422], [830, -418], [846, -405], [852, -400]]
    });
  },

  // hydraulic excavator with a looping dig cycle (dynamic)
  _ruExcavator(x, y, z, yaw) {
    const E = this._E;
    const T = E.T;
    const root = new T.Group();
    root.position.set(x, y, z);
    root.rotation.y = yaw;
    const Y = '#F2B300';
    const base = this._bakeMesh((A) => {
      for (const s of [-1, 1]) {
        this.box(A, s * 1.25, 0, 0, 0.7, 0.85, 4.4, '#2A2A2A');
        this.box(A, s * 1.25, 0.25, 0, 0.72, 0.35, 3.6, '#3A3A3A');
      }
      this.box(A, 0, 0.6, 0, 1.6, 0.4, 2.2, '#3A3A3A');
    }, { parent: root });
    void base;
    const upper = new T.Group();
    upper.position.set(0, 1.0, 0);
    root.add(upper);
    this._bakeMesh((A) => {
      this.box(A, 0, 0, -0.4, 2.7, 1.1, 3.2, Y);
      this.box(A, 0, 0, -2.1, 2.6, 1.2, 0.6, '#3A3A3A');
      this.box(A, 0.75, 1.1, 0.4, 1.0, 1.55, 1.3, Y);
      this.box(A, 0.75, 1.3, 1.06, 0.9, 1.1, 0.04, '#2C3E4A');
      this.box(A, 1.26, 1.3, 0.4, 0.04, 1.1, 1.1, '#2C3E4A');
      this.box(A, -0.6, 1.1, -0.6, 1.2, 0.7, 1.8, Y);
      this.cyl(A, -0.9, 1.8, -1.2, 0.07, 0.8, '#2A2A2A', 6);
    }, { parent: upper });
    const boom = new T.Group();
    boom.position.set(-0.15, 0.7, 1.0);
    upper.add(boom);
    this._bakeMesh((A) => {
      this.boxR(A, 0, 1.9, 2.0, 0.55, 0.7, 4.6, Y, -0.72, 0, 0);
      this.boxR(A, 0, 3.4, 4.7, 0.5, 0.6, 2.2, Y, 0.35, 0, 0);
      this._ruSeg(A, [0.32, 0.6, 0.6], [0.32, 2.6, 3.0], 0.09, '#C9CDD0', 6);
    }, { parent: boom });
    const stick = new T.Group();
    stick.position.set(0, 3.0, 5.6);
    boom.add(stick);
    this._bakeMesh((A) => {
      this.boxR(A, 0, -1.4, 0.2, 0.42, 3.2, 0.5, Y, 0.1, 0, 0);
    }, { parent: stick });
    const bucket = new T.Group();
    bucket.position.set(0, -3.0, 0.5);
    stick.add(bucket);
    this._bakeMesh((A) => {
      this.box(A, 0, -0.45, 0.35, 1.2, 0.85, 0.75, '#4A4A4A');
      for (let k = -2; k <= 2; k++) this.box(A, k * 0.24, -0.62, 0.8, 0.1, 0.12, 0.25, '#2A2A2A');
    }, { parent: bucket });
    this._addDyn(root);
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this._col(x - 2.4, z - 2.4, x + 2.4, z + 2.4);
    this._anim((dt, t) => {
      const c = (t % 11) / 11;
      const dig = Math.sin(c * Math.PI * 2);
      boom.rotation.x = 0.18 + 0.22 * dig;
      stick.rotation.x = -0.35 + 0.55 * Math.sin(c * Math.PI * 2 + 0.9);
      bucket.rotation.x = 0.4 + 0.6 * Math.sin(c * Math.PI * 2 + 1.8);
      upper.rotation.y = c > 0.55 && c < 0.85 ? Math.sin(((c - 0.55) / 0.3) * Math.PI) * 0.9 : 0;
    });
  },

  // landfill compactor shuttling back and forth (dynamic)
  _ruCompactor(x, y, z) {
    const E = this._E;
    const T = E.T;
    const root = new T.Group();
    root.position.set(x, y, z);
    const Y = '#E8B400';
    this._bakeMesh((A) => {
      this.box(A, 0, 0.9, 0, 2.2, 1.3, 4.2, Y);
      this.box(A, 0, 2.2, -0.6, 1.5, 1.4, 1.4, Y);
      this.box(A, 0, 2.4, 0.13, 1.3, 1.0, 0.04, '#2C3E4A');
      this.box(A, 0, 0.6, 2.6, 2.9, 1.0, 0.25, '#3A3A3A');
      this.cyl(A, 0.6, 2.2, -1.4, 0.08, 1.4, '#2A2A2A', 6);
    }, { parent: root });
    const wheels = [];
    for (const lz of [1.55, -1.55]) {
      const w = this._bakeMesh((A) => {
        for (const s of [-1, 1]) {
          this.cylR(A, s * 1.3, 0, 0, 0.78, 0.7, '#6E7378', 0, 0, Math.PI / 2, 14);
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * Math.PI * 2;
            this.box(A, s * 1.3, Math.cos(a) * 0.85 - 0.1, Math.sin(a) * 0.85, 0.6, 0.2, 0.2, '#4A4E52');
          }
        }
      }, { parent: root });
      w.position.set(0, 0.8, lz);
      wheels.push(w);
    }
    this._addDyn(root);
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this._col(x - 2, z - 18, x + 2, z + 18);
    let pz = z, dir = 1, wait = 0;
    this._anim((dt) => {
      if (wait > 0) { wait -= dt; return; }
      const v = 1.6 * dir;
      pz += v * dt;
      if (pz > z + 14) { pz = z + 14; dir = -1; wait = 1.5; }
      if (pz < z - 14) { pz = z - 14; dir = 1; wait = 1.5; }
      root.position.z = pz;
      root.rotation.y = dir > 0 ? 0 : Math.PI;
      for (const w of wheels) w.rotation.x += (Math.abs(v) * dt) / 0.8;
    });
  },

  // flickering flame cards (crossed textured quads): pts = list of base points; one dynamic mesh per call
  _ruFlame(pts, o) {
    const E = this._E;
    const T = E.T;
    const R = this._rng(o.seed || 1);
    if (!E.ruFlameMat) {
      if (!E.tex.ruFlame) {
        const RF = this._rng(4242);
        E.tex.ruFlame = this._canvasTex(128, 256, (g, W, H) => {
          g.clearRect(0, 0, W, H);
          g.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 6; k++) {
            const cx = W / 2 + (RF() - 0.5) * W * 0.4, w = W * (0.22 + RF() * 0.2), h = H * (0.55 + RF() * 0.42);
            const gr = g.createLinearGradient(0, H, 0, H - h);
            gr.addColorStop(0, 'rgba(255,248,215,0.95)');
            gr.addColorStop(0.25, 'rgba(255,196,70,0.85)');
            gr.addColorStop(0.62, 'rgba(255,112,24,0.55)');
            gr.addColorStop(1, 'rgba(190,40,10,0)');
            g.fillStyle = gr;
            g.beginPath();
            g.moveTo(cx - w, H);
            g.bezierCurveTo(cx - w * 1.1, H - h * 0.45, cx - w * 0.15 + (RF() - 0.5) * w, H - h * 0.8, cx + (RF() - 0.5) * w * 0.8, H - h);
            g.bezierCurveTo(cx + w * 0.2, H - h * 0.75, cx + w * 1.15, H - h * 0.4, cx + w, H);
            g.closePath();
            g.fill();
          }
          g.globalCompositeOperation = 'source-over';
          const gl = g.createRadialGradient(W / 2, H, 2, W / 2, H, W * 0.6);
          gl.addColorStop(0, 'rgba(255,240,190,0.9)'); gl.addColorStop(1, 'rgba(255,150,40,0)');
          g.fillStyle = gl; g.fillRect(0, H * 0.6, W, H * 0.4);
        }, { repeat: false });
      }
      E.ruFlameMat = new T.MeshBasicMaterial({ map: E.tex.ruFlame, vertexColors: true, transparent: true, depthWrite: false, toneMapped: false, side: T.DoubleSide, alphaTest: 0.02 });
    }
    let cx = 0, cy = 0, cz = 0;
    for (const p of pts) { cx += p[0]; cy += p[1]; cz += p[2]; }
    cx /= pts.length; cy /= pts.length; cz /= pts.length;
    const tints = ['#FFFFFF', '#FFE2C0', '#FFF2D8', '#FFD2A8'];
    const geo = this._bake((A) => {
      for (const p of pts) {
        for (let k = 0; k < (o.n || 3); k++) {
          const r = o.r[0] + R() * (o.r[1] - o.r[0]);
          const h = o.h[0] + R() * (o.h[1] - o.h[0]);
          const x = p[0] - cx + (R() - 0.5) * (o.spread || 0.6), y = p[1] - cy, z = p[2] - cz + (R() - 0.5) * (o.spread || 0.6);
          const w = r * 1.4, a0 = R() * Math.PI;
          const col = tints[(R() * tints.length) | 0];
          for (const a of [a0, a0 + Math.PI / 2]) {
            const dx = Math.cos(a) * w, dz = Math.sin(a) * w;
            this._quad(A, [x - dx, y, z - dz], [x + dx, y, z + dz], [x + dx, y + h, z + dz], [x - dx, y + h, z - dz], [0, 0, 1], [0, 0, 1, 1], col);
          }
        }
      }
    });
    const m = new T.Mesh(geo, E.ruFlameMat);
    m.position.set(cx, cy, cz);
    m.castShadow = false;
    m.receiveShadow = false;
    m.renderOrder = 5;
    this._addDyn(m);
    const ph = R() * 10, sp = 6 + R() * 4;
    this._anim((dt, t) => {
      m.scale.y = 0.85 + 0.2 * Math.sin(t * sp + ph) + 0.08 * Math.sin(t * sp * 2.3 + ph * 1.7);
      m.scale.x = 1 + 0.06 * Math.sin(t * sp * 1.4 + ph);
      m.scale.z = 1 + 0.06 * Math.cos(t * sp * 1.2 + ph);
      m.rotation.z = 0.03 * Math.sin(t * 1.7 + ph);
    });
    E.ruFlames.push(m);
    return m;
  },

  // ================================================================= FARMS (stops 15–18)
  _bFarms() {
    this._ruInit();
    this._ruCorn();
    this._ruPaddy();
    this._ruBurn();
    this._ruDairy();
    this._ruCountry();
  },

  // ---------------------------------------------------------------- corn + urea (stop 15)
  _ruCorn() {
    const E = this._E;
    const T = E.T;
    const R = this._rng(1501);
    this.plane('ruDirt', 895, 0.06, 125, 210, 190, '#9C7C5A');
    // dense interior canopy block (cannot be walked into)
    this.box('ruCornSide', 895, 0.06, 125, 190, 2.25, 170, '#FFFFFF', { top: 'ruCornTop', ttw: 3, tth: 3 });
    this._col(800, 40, 990, 210);
    // 3-D plants on a 10 m band all around + clearing for the farmer
    const items = [];
    const tints = ['#FFFFFF', '#EEF4DC', '#F6F1D6', '#E2EDCF'];
    for (let x = 790.6; x < 999.6; x += 1.12) {
      for (let z = 30.6; z < 219.6; z += 0.9) {
        const inBlock = x > 800.4 && x < 989.6 && z > 40.4 && z < 209.6;
        if (inBlock) continue;
        if (x < 801 && z > 106 && z < 128) continue;
        const xx = x + (R() - 0.5) * 0.3, zz = z + (R() - 0.5) * 0.2;
        items.push({ x: xx, y: 0.04, z: zz, ry: R() * Math.PI, sx: 0.9 + R() * 0.3, sy: 0.85 + R() * 0.28, c: tints[(R() * tints.length) | 0] });
      }
    }
    E.ruCorn = this._ruInst(this._ruCrossGeo(1.25, 2.45, 2), this._ruFoliageMat(E.tex.ruCorn), items, { cast: false });
    // grass verge along F1
    this.plane('ruGrass', 777, 0.04, 125, 26, 190, '#C4CB8C');
    // urea sacks on a pallet, open sack, push spreader
    this.box('ruWood', 793.2, 0.04, 112.5, 1.25, 0.14, 1.05, '#A88358');
    for (let l = 0; l < 3; l++) for (const dz of [-0.25, 0.25]) this.box('ruFlat', 793.2 + (l % 2 ? 0.03 : -0.03), 0.18 + l * 0.25, 112.5 + dz, 1.18, 0.24, 0.47, l === 2 ? '#EFEEE7' : '#F3F2EC', { ry: (l - 1) * 0.04 });
    this.box('ruFlat', 794.35, 0.04, 114.4, 0.62, 0.42, 0.5, '#F1F0EA');
    this.box('ruFlat', 794.35, 0.46, 114.4, 0.5, 0.05, 0.4, '#F8F8F8');
    this._sign('ปุ๋ยยูเรีย 46-0-0', 0.92, 0.36, '#F4F3EE', '#1E6B3A', [792.58, 0.62, 112.5], -Math.PI / 2, { size: 0.42 });
    this._col(792.5, 111.9, 794.7, 114.75);
    // push spreader
    this.cone('ruFlat', 797.0, 0.55, 119.6, 0.38, -0.5, '#E86A1A', 12);
    this.cyl('ruFlat', 797.0, 0.55, 119.6, 0.4, 0.12, '#E86A1A', 12);
    this.cylR('ruFlat', 797.0, 0.24, 119.25, 0.24, 0.08, '#2A2A2A', 0, 0, Math.PI / 2, 10);
    this.cylR('ruFlat', 797.0, 0.24, 119.95, 0.24, 0.08, '#2A2A2A', 0, 0, Math.PI / 2, 10);
    this._ruSeg('ruShiny', [797.0, 0.6, 119.6], [796.0, 1.05, 119.6], 0.025, '#5A5F63', 6);
    this._ruSeg('ruShiny', [796.0, 1.05, 119.35], [796.0, 1.05, 119.85], 0.025, '#5A5F63', 6);
    this._emitter({ type: 'dust', pos: [797.3, 0.35, 119.6], rate: 4, size: 0.22, rise: 0.15, spread: 1.0, life: 1.0, color: '#FFFFFF' });
    E.crowdSpots.push({ x: 796.4, z: 120.6, yaw: Math.PI / 2, mode: 'work', outfit: 'farmer' });
    E.crowdSpots.push({ x: 1012, z: 64, yaw: -Math.PI / 2, mode: 'stand', outfit: 'farmer' });
    E.animalSpots.egrets.push({ x: 786, z: 160, r: 5 });
    this._stopAnchor(15, {
      view: [787, 116], look: [796.5, 1.0, 117.5], guide: [787.6, 117.95], pin: [797, 3.6, 116.5],
      emit: [801, 0.5, 118], gas: ['N2O', 'CO2'], spread: 7, inside: null, district: 'farm',
      route: [[765, 116], [787, 116]]
    });
  },

  // ---------------------------------------------------------------- flooded paddy + AWD (stop 16)
  _ruPaddy() {
    const E = this._E;
    const T = E.T;
    const R = this._rng(1601);
    const xs = [790, 837, 885, 934, 981, 1031, 1080];
    const zs = [280, 321, 360, 401, 440];
    // jitter interior lines
    for (let i = 1; i < xs.length - 1; i++) xs[i] += (R() - 0.5) * 5;
    for (let j = 1; j < zs.length - 1; j++) zs[j] += (R() - 0.5) * 3;
    // ground under everything
    this.plane('ruDirt', 935, 0.03, 360, 290, 160, '#7E6E52');
    // dikes
    const dk = (x0, z0, x1, z1) => {
      const w = Math.abs(x1 - x0) || 0.9, d = Math.abs(z1 - z0) || 0.9;
      this.box('ruGrass', (x0 + x1) / 2, 0.03, (z0 + z1) / 2, w, 0.36, d, '#93A464', { sides: 'ruDirt' });
    };
    for (const x of xs) dk(x, zs[0], x, zs[zs.length - 1]);
    for (const z of zs) dk(xs[0], z, xs[xs.length - 1], z);
    // water (one mesh) + rice shells (4 layers, one mesh each)
    const wA = this._newAcc('flat');
    const shell = [0, 1, 2, 3].map(() => this._newAcc('flat'));
    for (let i = 0; i < xs.length - 1; i++) {
      for (let j = 0; j < zs.length - 1; j++) {
        const x0 = xs[i] + 0.45, x1 = xs[i + 1] - 0.45, z0 = zs[j] + 0.45, z1 = zs[j + 1] - 0.45;
        this.plane(wA, (x0 + x1) / 2, 0.15, (z0 + z1) / 2, x1 - x0, z1 - z0, '#FFFFFF', { tw: 18, th: 18 });
        // a few plots are freshly drained (AWD dry phase) -> fewer shells, browner tint
        for (let k = 0; k < 4; k++) this.plane(shell[k], (x0 + x1) / 2, 0.24 + k * 0.13, (z0 + z1) / 2, x1 - x0, z1 - z0, '#FFFFFF', { tw: 1.1, th: 1.1 });
      }
    }
    // irrigation canal along the west side (x 780..782.5)
    this.plane(wA, 781.25, 0.1, 360, 2.5, 164, '#FFFFFF', { tw: 18, th: 18 });
    this.box('ruDirt', 779.6, 0.03, 360, 0.8, 0.3, 164, '#8E7C5E');
    this.box('ruDirt', 782.9, 0.03, 360, 0.8, 0.3, 164, '#8E7C5E');
    this.box('ruConcrete', 781.25, 0.03, 320, 4.2, 0.32, 5.6, '#C8C2B6');
    this._col(779.2, 278, 783.3, 317.1);
    this._col(779.2, 322.9, 783.3, 442);
    {
      const wm = E.mats.water.clone();
      wm.map = E.tex.water.clone(); wm.map.needsUpdate = true;
      wm.color = this._lcol('#8FA27C');
      wm.roughness = 0.06;
      wm.vertexColors = true;
      const m = new T.Mesh(this._accGeo(wA), wm);
      m.receiveShadow = true;
      this._addDyn(m);
      this._anim((dt, t) => { wm.map.offset.set(t * 0.006, t * 0.004); });
      const tints = ['#6E9A3E', '#80AE48', '#93BE55', '#A9CF66'];
      // alpha-blended shells (not alpha-tested) so distant paddies keep a green tint instead of vanishing with mip-mapping
      for (let k = 0; k < 4; k++) {
        const sm = new T.MeshStandardMaterial({ map: E.tex['ruRice' + k], transparent: true, depthWrite: false, roughness: 0.85, metalness: 0, color: this._lcol(tints[k]) });
        const sh = new T.Mesh(this._accGeo(shell[k]), sm);
        sh.receiveShadow = true;
        sh.renderOrder = 2 + k;
        this._addDyn(sh);
      }
    }
    // close-up rice clumps around the stop-16 view
    const items = [];
    for (let x = 791.2; x < 812; x += 0.5) {
      for (let z = 321.6; z < 342; z += 0.36) {
        if (Math.hypot(x - 797.5, z - 324.5) < 0.6) continue;
        items.push({ x: x + (R() - 0.5) * 0.06, y: 0.1, z: z + (R() - 0.5) * 0.06, ry: R() * Math.PI, sx: 0.42 + R() * 0.14, sy: 0.6 + R() * 0.18, c: ['#D9E8C0', '#CFE0B4', '#E2EDCB'][(R() * 3) | 0] });
      }
    }
    E.ruRice = this._ruInst(this._ruCrossGeo(0.75, 0.95, 2), this._ruFoliageMat(E.tex.ruRiceClump, { alphaTest: 0.45 }), items, { cast: false });
    // AWD perforated tube + gauge + sign
    this.cyl('ruFlat', 797.5, -0.05, 324.5, 0.09, 0.75, '#F2F2EE', 12);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      this.box('ruFlat', 797.5 + Math.cos(a) * 0.086, 0.22, 324.5 + Math.sin(a) * 0.086, 0.02, 0.03, 0.02, '#202020', { ry: -a });
    }
    this.box('ruFlat', 797.5, 0.0, 324.3, 0.05, 0.95, 0.015, '#FFFFFF');
    for (let k = 0; k < 9; k++) this.box('ruFlat', 797.5, 0.03 + k * 0.1, 324.29, 0.052, 0.05, 0.012, k % 2 ? '#D32F2F' : '#212121');
    {
      const ry = Math.atan2(-4.6, -6);
      this.box('ruWood', 795.0, 0.0, 326.0, 0.1, 1.6, 0.1, '#7A5A3E');
      this.box('ruFlat', 795.0, 1.25, 326.0, 1.5, 0.62, 0.06, '#1F6B3C', { ry: ry });
      this._sign('นาเปียกสลับแห้ง (AWD)', 1.42, 0.52, '#1F6B3C', '#FFFFFF', [795.0 - Math.sin(ry) * -0.04, 1.56, 326.0 - Math.cos(ry) * -0.04], ry, { size: 0.42 });
      this._col(794.8, 325.8, 795.2, 326.2);
    }
    // field huts
    this._ruHut(xs[2] + 0.5, zs[2] + 0.5, 0.3);
    this._ruHut(xs[5] + 0.5, zs[1] + 0.5, -0.4);
    // animals & people
    E.animalSpots.buffalo.push({ x: 826, z: 341, yaw: 0.4 }, { x: 847, z: 333, yaw: -1.1 }, { x: 869, z: 352, yaw: 2.0 }, { x: xs[2] + 4.5, z: zs[2] + 3, yaw: 0.0 });
    E.animalSpots.egrets.push({ x: 815, z: 336, r: 6 }, { x: 905, z: 300, r: 14 }, { x: 1000, z: 392, r: 16 }, { x: 960, z: 340, r: 10 });
    E.animalSpots.birds.push([930, 360]);
    E.crowdSpots.push({ x: 830, z: 355, yaw: 2.4, mode: 'work', outfit: 'farmer' });
    for (let z = 288; z < 440; z += 26) E.treeSpots.push({ x: 776.6 + (R() - 0.5), z: z + R() * 6, s: 0.9 + R() * 0.3, kind: 'palm' });
    for (let k = 0; k < 6; k++) E.treeSpots.push({ x: 775 + R() * 3, z: 300 + k * 24 + R() * 8, s: 0.7 + R() * 0.3, kind: k % 2 ? 'banana' : 'bamboo' });
    this._stopAnchor(16, {
      view: [790.4, 320], viewY: 2.0, look: [800, 0.3, 324.5], guide: [790.9, 322.1], pin: [798.5, 2.4, 323],
      emit: [806, 0.2, 327], gas: ['CH4'], spread: 9, inside: null, district: 'farm',
      route: [[765, 320], [779, 320], [783.5, 320], [790.4, 320]]
    });
  },

  // ---------------------------------------------------------------- straw burning (stop 17)
  _ruFront(x) { return 338 + 3 * Math.sin(x / 23) + 2 * Math.sin(x / 9.7); },

  _ruBurn() {
    const E = this._E;
    const R = this._rng(1701);
    // unburnt stubble (north) and burnt ground (south of the front, following the curve)
    this.plane('ruStubble', 1250, 0.06, 312, 300, 64, '#C9AE78');
    const left = [], right = [], scorchL = [], scorchR = [];
    for (let x = 1100; x <= 1400.01; x += 5) {
      const f = this._ruFront(x);
      left.push([x, f + 0.6]); right.push([x, 440]);
      scorchL.push([x, f - 1.8]); scorchR.push([x, f + 0.8]);
    }
    this._strip('ruBurnt', left, right, 0.14, '#FFFFFF');
    this._strip('ruBurnt', scorchL, scorchR, 0.12, '#6A5640');
    // straw windrows + bales (alternative to burning)
    const rows = [[1112, 1190, 289], [1205, 1290, 291], [1300, 1388, 288], [1118, 1210, 300], [1225, 1330, 302], [1135, 1240, 312], [1255, 1375, 313], [1150, 1230, 323], [1270, 1350, 324]];
    for (const r of rows) this._ruPrismX('ruStraw', r[0], r[1], r[2], 0.06, 1.3, 0.55, '#E3CC94');
    for (let i = 0; i < 18; i++) {
      const layer = (i / 6) | 0, k = i % 6;
      this.box('ruStraw', 1112 + k * 0.95, 0.06 + layer * 0.36, 284.5 + (layer % 2) * 0.1, 0.9, 0.36, 0.48, '#F2E1B0');
    }
    this._col(1111.3, 284, 1117.6, 285.2);
    // fire front: flames along the curve, embers, smoke plume emitters, warm night lights
    const fpts = [];
    for (let x = 1150; x <= 1360; x += 1.6) fpts.push([x + (R() - 0.5) * 0.8, 0.1, this._ruFront(x) + (R() - 0.5) * 1.2]);
    const nSeg = 4;
    const per = Math.ceil(fpts.length / nSeg);
    for (let s = 0; s < nSeg; s++) {
      const part = fpts.slice(s * per, (s + 1) * per);
      if (part.length) this._ruFlame(part, { n: 3, r: [0.45, 1.1], h: [1.6, 4.4], spread: 1.1, seed: 300 + s });
    }
    // a hotter windrow burning close to the viewer
    const wr = [];
    for (let x = 1214; x <= 1250; x += 1.0) wr.push([x, 0.25, this._ruFront(x) - 1.4]);
    this._ruFlame(wr, { n: 2, r: [0.6, 1.2], h: [2.8, 5.8], spread: 0.9, seed: 999 });
    for (let i = 0; i < 260; i++) {
      const x = 1105 + R() * 290;
      const z = this._ruFront(x) + 0.8 + R() * 7;
      this.box('ruGlow', x, 0.15, z, 0.12 + R() * 0.2, 0.04, 0.12 + R() * 0.2, R() < 0.5 ? '#FF6A1A' : '#D9471A');
    }
    for (let x = 1160; x <= 1360; x += 26) {
      this._emitter({ type: 'smoke', pos: [x, 2.2, this._ruFront(x) + 1.5], rate: 4, size: 7, rise: 4, spread: 5, life: 18, color: '#7F7A74', big: true });
    }
    for (let x = 1155; x <= 1360; x += 13) {
      this._emitter({ type: 'fire', pos: [x, 0.7, this._ruFront(x)], rate: 10, size: 2.2, rise: 2.4, spread: 2.5, life: 1.0, color: '#FF8C2B', big: true });
    }
    this._emitter({ type: 'smoke', pos: [1230, 4, 340], rate: 6, size: 12, rise: 6, spread: 8, life: 28, color: '#8B8680', big: true });
    for (let x = 1170; x <= 1350; x += 36) this._lamp(x, 1.4, this._ruFront(x), { color: '#FF7A2A', pool: 13 });
    for (let x = 1150; x < 1360; x += 20) {
      let z0 = Infinity, z1 = -Infinity;
      for (let xx = x; xx <= x + 20; xx += 2) { const f = this._ruFront(xx); z0 = Math.min(z0, f); z1 = Math.max(z1, f); }
      this._col(x - 2, z0 - 3.5, x + 22, z1 + 3.5);
    }
    E.crowdSpots.push({ x: 1214, z: 318, yaw: Math.atan2(1228 - 1214, 338 - 318), mode: 'stand', outfit: 'farmer' });
    E.crowdSpots.push({ x: 1291, z: 318, yaw: 2.6, mode: 'work', outfit: 'farmer' });
    E.animalSpots.birds.push([1260, 380]);
    this._stopAnchor(17, {
      view: [1203, 314], look: [1229, 1.8, 337.5], guide: [1204.6, 312.2], pin: [1228, 7.5, 335],
      emit: [1226, 3, 334], gas: ['CH4', 'N2O'], spread: 14, inside: null, district: 'farm',
      route: [[1185, 254.5], [1185, 270], [1196, 300], [1203, 314]]
    });
  },

  // ---------------------------------------------------------------- dairy farm (stop 18)
  _ruDairy() {
    const E = this._E;
    const T = E.T;
    const R = this._rng(1801);
    this.plane('ruGrass', 895, 0.04, 585, 210, 190, '#C9CF94');
    this.plane('ruDirt', 802, 0.08, 560, 76, 6, '#A9977B');
    this.plane('ruConcrete', 870, 0.1, 560, 62, 26, '#C7C2B8');
    // barn structure
    const X0 = 840, X1 = 900, Z0 = 548, Z1 = 572;
    for (let x = X0; x <= X1 + 0.01; x += 6) {
      for (const z of [Z0, 557, 563, Z1]) {
        const h = (z === Z0 || z === Z1) ? 4.2 : 6.6;
        this.box('ruShiny', x, 0.1, z, 0.22, h, 0.22, '#8F979C');
      }
      this._ruSeg('ruShiny', [x, 4.25, Z0], [x, 7.55, 560], 0.09, '#8F979C', 6);
      this._ruSeg('ruShiny', [x, 4.25, Z1], [x, 7.55, 560], 0.09, '#8F979C', 6);
      this._col(x - 0.15, Z0 - 0.15, x + 0.15, Z0 + 0.15);
      this._col(x - 0.15, Z1 - 0.15, x + 0.15, Z1 + 0.15);
    }
    this.gable('ruMetal', 870, 4.3, 560, 62, 24, 3.3, '#5D7C93', { wall: false, both: true, oh: 1.2 });
    this.gable('ruMetal', 870, 7.75, 560, 62, 2.6, 0.6, '#4E6C82', { wall: false, both: true, oh: 0.2 });
    // feed alley curbs, feed strips, headlock rails, stall loops, mats
    for (const z of [557, 563]) {
      this.box('ruConcrete', 870, 0.1, z, 60, 0.45, 0.35, '#BDB7AB');
      this.box('ruFlat', 870, 0.1, z + (z === 557 ? 0.75 : -0.75), 58, 0.1, 0.9, '#6E6A3A');
      this._ruSeg('ruShiny', [X0, 1.25, z], [X1, 1.25, z], 0.04, '#B9C0C4', 6);
      this._ruSeg('ruShiny', [X0, 0.55, z], [X1, 0.55, z], 0.04, '#B9C0C4', 6);
      for (let x = X0 + 0.35; x < X1; x += 0.7) this._ruSeg('ruShiny', [x, 0.55, z], [x, 1.25, z], 0.022, '#B9C0C4', 4);
    }
    this._col(X0, Z0 - 0.2, X1, 557.3);
    this._col(X0, 562.7, X1, Z1 + 0.2);
    for (const zz of [[548.4, 552.4], [567.6, 571.6]]) {
      this.box('ruFlat', 870, 0.12, (zz[0] + zz[1]) / 2, 58, 0.08, 4.0, '#3A3A38');
      for (let x = X0 + 1.2; x < X1; x += 1.25) {
        this._ruSeg('ruShiny', [x, 1.1, zz[0]], [x, 1.1, zz[1]], 0.035, '#9AA3A8', 6);
        this._ruSeg('ruShiny', [x, 0.12, zz[0] + 0.3], [x, 1.1, zz[0]], 0.035, '#9AA3A8', 6);
      }
    }
    // big ceiling fans (instanced, spinning)
    {
      const fg = this._bake((A) => {
        this.cyl(A, 0, -0.2, 0, 0.18, 0.3, '#5A5F63', 10);
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI * 2;
          this.boxR(A, Math.cos(a) * 0.75, -0.12, Math.sin(a) * 0.75, 1.3, 0.03, 0.26, '#C9CED2', 0, -a, 0.15);
        }
      });
      const fans = [];
      for (let x = 846; x < 900; x += 9) fans.push({ x: x, y: 6.0, z: 560 });
      const im = this._ruInst(fg, E.mats.flat, fans, { cast: false });
      const M = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), S = new T.Vector3(1, 1, 1), AX = new T.Vector3(0, 1, 0);
      this._anim((dt, t) => {
        fans.forEach((f, i) => { Q.setFromAxisAngle(AX, t * 5 + i); M.compose(V.set(f.x, f.y, f.z), Q, S); im.setMatrixAt(i, M); });
        im.instanceMatrix.needsUpdate = true;
      });
      for (const f of fans) this._ruSeg('ruShiny', [f.x, 6.0, 560], [f.x, 7.5, 560], 0.03, '#5A5F63', 4);
    }
    for (let x = 848; x < 900; x += 13) this._lamp(x, 5.6, 560, { pool: 6 });
    // cows at the feed fence (north pens face south, south pens face north) + paddock
    for (let k = 0; k < 16; k++) {
      const x = 842.5 + k * 3.55 + (R() - 0.5) * 0.6;
      if (R() < 0.12) continue;
      E.animalSpots.cows.push({ x: x, z: 555.4, yaw: 0 + (R() - 0.5) * 0.15 });
    }
    for (let k = 0; k < 16; k++) {
      const x = 843.5 + k * 3.55 + (R() - 0.5) * 0.6;
      if (R() < 0.12) continue;
      E.animalSpots.cows.push({ x: x, z: 564.6, yaw: Math.PI + (R() - 0.5) * 0.15 });
    }
    for (let k = 0; k < 7; k++) E.animalSpots.cows.push({ x: 848 + R() * 46, z: 592 + R() * 42, yaw: R() * Math.PI * 2 });
    this._ruFenceWood(840, 585, 900, 585, [[26, 30]]);
    this._ruFenceWood(900, 585, 900, 640);
    this._ruFenceWood(840, 640, 900, 640);
    this._ruFenceWood(840, 585, 840, 640);
    // milking shed with cooling tank
    this.box('ruPlaster', 912.5, 0.1, 546, 15, 3.4, 12, '#EEE8DC', { top: false });
    this.gable('ruMetal', 912.5, 3.5, 546, 15, 12, 1.6, '#5D7C93', { wall: 'ruPlaster', wallCol: '#EEE8DC', oh: 0.6 });
    this.box('ruFlat', 905.02, 0.1, 546, 0.06, 2.6, 3.2, '#2E3236');
    this.cylR('ruShiny', 911, 1.3, 546, 0.95, 3.2, '#D9DEE2', 0, 0, Math.PI / 2, 18);
    this._col(904.9, 539.9, 920.1, 552.1);
    this.tube('ruShiny', [[905, 2.6, 551], [900.5, 3.2, 556]], 0.05, '#C0C6CA', 6);
    // manure pad + biogas balloon digester
    this.box('ruConcrete', 915, 0.05, 585, 20, 0.25, 14, '#B7B1A5');
    this.sph('ruFlat', 912, 0.3, 585, 5.5, 1.6, 4.0, '#4A3826', 10);
    this.box('ruConcrete', 940, 0.05, 584, 22, 0.5, 9, '#BDB7AA');
    this.cylR('ruFlat', 940, 0.25, 584, 2.3, 19, '#1D1E1F', 0, 0, Math.PI / 2, 18);
    this.tube('ruFlat', [[950, 2.4, 584], [952, 3.0, 576], [920, 3.0, 552]], 0.06, '#E8E8E4', 6);
    this._col(904.8, 577.8, 951.2, 592.2);
    // silage bunker (black plastic + tyres)
    this.box('ruConcrete', 942.5, 0.05, 540.25, 25, 2.6, 0.5, '#BDB7AA');
    this.box('ruConcrete', 942.5, 0.05, 555.75, 25, 2.6, 0.5, '#BDB7AA');
    this.box('ruConcrete', 954.75, 0.05, 548, 0.5, 2.6, 16, '#BDB7AA');
    this.box('ruFlat', 943.5, 0.05, 548, 21, 1.8, 14.8, '#1B1C1D');
    for (let i = 0; i < 26; i++) this.cyl('ruFlat', 935 + R() * 18, 1.85, 542 + R() * 12, 0.42, 0.22, '#262626', 10);
    this._col(929.8, 539.8, 955.2, 556.2);
    // farmhouse, water tower, tractor, pickup, trees, dog, sign
    this._ruStiltHouse(962, 622, Math.PI, '#B98A5C', '#8E4A2C', { w: 10, d: 7.5 });
    this.cyl('ruShiny', 978, 0, 606, 0.12, 8, '#6E7478', 6);
    for (const lx of [-1.4, 1.4]) for (const lz of [-1.4, 1.4]) this._ruSeg('ruShiny', [978 + lx * 0.4, 0, 606 + lz * 0.4], [978 + lx, 8, 606 + lz], 0.08, '#6E7478', 6);
    this.cyl('ruShiny', 978, 8, 606, 1.8, 2.8, '#2F6FB0', 16);
    this.cone('ruShiny', 978, 10.8, 606, 1.85, 0.6, '#2F6FB0', 16);
    this._col(976.4, 604.4, 979.6, 607.6);
    this._ruTractor(926, 534, Math.PI / 2);
    E.parkSpots.push({ x: 944, z: 612, yaw: 0, kind: 'pickup', color: '#D9D9D4' });
    E.animalSpots.dogs.push({ x: 955, z: 630 }, { x: 836, z: 552 });
    E.crowdSpots.push({ x: 872, z: 559.4, yaw: Math.PI / 2, mode: 'work', outfit: 'farmer' });
    E.crowdSpots.push({ x: 906.5, z: 551.5, yaw: -Math.PI / 2, mode: 'stand', outfit: 'farmer' });
    for (let i = 0; i < 9; i++) E.treeSpots.push({ x: 950 + R() * 40, z: 600 + R() * 50, s: 0.7 + R() * 0.4, kind: ['palm', 'banana', 'mango'][i % 3] });
    for (let i = 0; i < 6; i++) E.treeSpots.push({ x: 800 + i * 8 + R() * 3, z: 575 + R() * 4, s: 1.0 + R() * 0.3, kind: 'rain' });
    this.box('ruWood', 789, 0, 553.4, 0.16, 2.2, 0.16, '#6E5236');
    this.box('ruWood', 789, 0, 548.6, 0.16, 2.2, 0.16, '#6E5236');
    this.box('ruFlat', 788.95, 1.4, 551, 0.08, 0.9, 5.2, '#2F6E4A');
    this._sign('ฟาร์มโคนมชุมชนเมืองคาร์บอน', 5.0, 0.72, '#2F6E4A', '#FFFFFF', [788.88, 1.85, 551], -Math.PI / 2, { size: 0.5 });
    this._col(788.8, 548.4, 789.2, 553.6);
    this._stopAnchor(18, {
      view: [836, 560], look: [868, 1.3, 560], guide: [836.7, 561.9], pin: [866, 5.0, 560],
      emit: [856, 1.9, 556.5], gas: ['CH4'], spread: 6, inside: null, district: 'farm',
      route: [[765, 560], [800, 560], [836, 560]]
    });
  },

  // ---------------------------------------------------------------- countryside dressing
  _ruCountry() {
    const E = this._E;
    const R = this._rng(1901);
    // stilt houses along F2 / near fields
    this._ruStiltHouse(1060, 232, 0, '#C29567', '#A4552F', {});
    this._ruStiltHouse(1262, 230, 0.05, '#B3875B', '#5F7F8F', { roofB: 'ruMetal' });
    this._ruStiltHouse(1022, 160, -Math.PI / 2, '#BC8F62', '#9B4B2F', {});
    for (let i = 0; i < 14; i++) E.treeSpots.push({ x: 1040 + R() * 260, z: 222 + R() * 18, s: 0.8 + R() * 0.4, kind: ['palm', 'banana', 'mango', 'palm'][i % 4] });
    for (let i = 0; i < 6; i++) E.treeSpots.push({ x: 1010 + R() * 30, z: 140 + R() * 40, s: 0.8 + R() * 0.4, kind: ['palm', 'mango', 'banana'][i % 3] });
    E.parkSpots.push({ x: 1068, z: 241, yaw: Math.PI / 2, kind: 'pickup', color: '#A9332B' });
    E.animalSpots.dogs.push({ x: 1056, z: 240 });
    // power poles along F1 (east side) and F2 (north side)
    const f1 = [];
    for (let z = -590; z <= 880; z += 40) f1.push([767.5, z]);
    this._ruPowerLine(f1, 9, (x, z) => Math.abs(z) < 18 || Math.abs(z - 460) < 14 || Math.abs(z - 250) < 6 || (z > -440 && z < -420) || (z > 554 && z < 566) || (z > 110 && z < 122) || (z > 314 && z < 326));
    const f2 = [];
    for (let x = 790; x <= 1440; x += 40) f2.push([x, 244.2]);
    this._ruPowerLine(f2, 9, (x) => Math.abs(x - 1185) < 4);
  },

  // ================================================================= FOREST HILL (stop 19)
  _ruTrailPts() {
    const E = this._E;
    if (E.ruTrail) return E.ruTrail;
    const cx = 0, cz = -900, RR = 420, g = 0.135, rEnd = 100;
    const Hp = (r) => 104 * 0.5 * (Math.PI / RR) * Math.sin((Math.PI * r) / RR);
    let r = Math.hypot(-170 - cx, -560 - cz), phi = Math.atan2(-560 - cz, -170 - cx);
    const pts = [[-170, -560]];
    let acc = 0, len = 0, px = -170, pz = -560;
    const push = (x, z, force) => {
      const s = Math.hypot(x - px, z - pz);
      acc += s; len += s; px = x; pz = z;
      if (acc >= 3.5 || force) { pts.push([x, z]); acc = 0; }
    };
    // switchback-free spiral at a constant ~13.5 % grade
    while (r > rEnd) {
      const k = Hp(r) / g;
      const t = k > 1 ? Math.sqrt(k * k - 1) : 0;
      const dr = 0.5;
      r -= dr;
      phi -= (t * dr) / r;
      push(cx + r * Math.cos(phi), cz + r * Math.sin(phi));
    }
    // then a level contour path to the brow due south of the summit (where the viewpoint deck is)
    let d = Math.PI / 2 - phi;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const n = Math.max(1, Math.ceil((Math.abs(d) * rEnd) / 1.0));
    for (let i = 1; i <= n; i++) {
      const a = phi + (d * i) / n;
      push(cx + rEnd * Math.cos(a), cz + rEnd * Math.sin(a), i === n);
    }
    E.ruTrail = { pts: pts, len: len, g: g, contour: Math.round(Math.abs(d) * rEnd) };
    return E.ruTrail;
  },

  _bForest() {
    const E = this._ruInit();
    const T = E.T;
    const L = window.GHG3L;
    const H = L.H;
    const R = this._rng(1901);
    const cx = 0, cz = -900;
    // viewpoint deck on the southern brow (r ~ 103..112): the rounded summit itself hides the near city
    const DX = 0, DZ0 = -797, DZ1 = -788, DZc = (DZ0 + DZ1) / 2;
    const yD = H(DX, DZ0) + 0.3;
    const vx = 0, vz = -789.6, eyeY = yD + 1.65;
    // ---- forest floor overlay (aligned with the 10 m terrain patch, blends into terrain colour at the rim)
    {
      const nz = (x, z) => 0.5 + 0.25 * Math.sin(x / 97 + Math.cos(z / 131)) + 0.25 * Math.sin(z / 83 - x / 157);
      const terrCol = (x, z, h) => {
        const dry = this._mixc('#FFFFFF', '#E9DDB0', this._cl(nz(x, z) - 0.45, 0, 0.6));
        const hi = this._cl((h - 40) / 140, 0, 1);
        return this._mixc(dry, '#B7C4A0', hi * 0.7);
      };
      const A = this._A('ruGrass', 0, -900);
      const bk = this._bkInfo(A);
      for (let x = -420; x < 420; x += 10) {
        for (let z = -1320; z < -480; z += 10) {
          if (Math.hypot(x + 5 - cx, z + 5 - cz) > 412) continue;
          const k = A.vc;
          for (const p of [[x, z + 10], [x + 10, z + 10], [x + 10, z], [x, z]]) {
            const h = H(p[0], p[1]);
            const e = 2;
            const nx2 = H(p[0] - e, p[1]) - H(p[0] + e, p[1]);
            const nz2 = H(p[0], p[1] - e) - H(p[0], p[1] + e);
            const nl = Math.hypot(nx2, 2 * e, nz2);
            A.p.push(p[0], h + 0.08, p[1]);
            A.n.push(nx2 / nl, (2 * e) / nl, nz2 / nl);
            A.u.push(p[0] / bk.tw, -p[1] / bk.th);
            const r = Math.hypot(p[0] - cx, p[1] - cz);
            const f = this._sm((412 - r) / 70);
            const c = this._mixc(terrCol(p[0], p[1], h), '#46522F', f * (0.85 + 0.15 * Math.sin(p[0] / 13 + p[1] / 17)));
            A.c.push(c[0], c[1], c[2]);
          }
          A.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
          A.vc += 4;
        }
      }
    }
    // ---- trail (gravel strip following the terrain) + marker posts
    const TR = this._ruTrailPts();
    const tp = TR.pts;
    {
      const left = [], right = [];
      for (let i = 0; i < tp.length; i++) {
        const a = tp[Math.max(0, i - 1)], b = tp[Math.min(tp.length - 1, i + 1)];
        let dx = b[0] - a[0], dz = b[1] - a[1];
        const l = Math.hypot(dx, dz) || 1;
        dx /= l; dz /= l;
        left.push([tp[i][0] - dz * 1.1, tp[i][1] + dx * 1.1]);
        right.push([tp[i][0] + dz * 1.1, tp[i][1] - dx * 1.1]);
      }
      this._strip('ruDirt', left, right, (x, z) => H(x, z) + 0.17, '#B39E80', { tw: 3, th: 3 });
      for (let i = 4; i < tp.length - 3; i += 9) {
        const p = tp[i];
        this.box('ruWood', p[0] + 1.4, H(p[0] + 1.4, p[1]) - 0.1, p[1], 0.14, 1.05, 0.14, '#7A5A3E');
      }
    }
    const near = (x, z, r) => {
      for (let i = 0; i < tp.length; i++) { const dx = tp[i][0] - x, dz = tp[i][1] - z; if (dx * dx + dz * dz < r * r) return true; }
      return false;
    };
    const upper = tp.slice(Math.max(0, tp.length - 90));
    const nearUpper = (x, z) => { for (const p of upper) { const dx = p[0] - x, dz = p[1] - z; if (dx * dx + dz * dz < 24 * 24) return true; } return false; };
    // height cap so nothing rises into the line of sight from the deck towards the city
    const capAt = (x, z) => {
      const dx = x - vx, dz = z - vz;
      if (dz <= 0) return Infinity;
      const a = Math.abs(Math.atan2(dx, dz));
      if (a > 1.0) return Infinity;
      const c = eyeY - 1.0 - Math.hypot(dx, dz) * 0.27 - H(x, z);
      if (a < 0.62) return c;
      const t = (a - 0.62) / 0.38;
      return c + t * t * 34;
    };
    // ---- canopy: jittered cells -> tree (30 %) or canopy filler blob; emergent dipterocarps; understory shrubs
    const kinds = { dipN: [], teakN: [], roundN: [], tallN: [], dip: [], teak: [], round: [], tall: [], bamboo: [], shrub: [], filler: [] };
    const trunks = [];
    const greens = ['#FFFFFF', '#E9F0DA', '#DDE8CB', '#F3F0D2', '#D5E2C4', '#EDE6C6', '#E3EBC0'];
    const cell = 14;
    const addTree = (t, x, z, hgt, wid, c) => {
      const y = H(x, z);
      const isNear = t !== 'bamboo' && (Math.hypot(x - vx, z - DZc) < 70 || nearUpper(x, z));
      kinds[isNear ? t + 'N' : t].push({ x: x, y: y - 0.2, z: z, ry: R() * 6.28, sx: wid, sy: hgt, c: c });
      if (t !== 'bamboo') {
        const tr = t === 'dip' ? 0.022 : t === 'teak' ? 0.026 : t === 'round' ? 0.03 : 0.022;
        const th = t === 'dip' ? 0.78 : t === 'teak' ? 0.5 : t === 'round' ? 0.42 : 0.62;
        trunks.push({ x: x, y: y - 0.3, z: z, ry: R() * 6.28, sx: Math.max(0.18, hgt * tr), sy: hgt * th + 0.3, sz: Math.max(0.18, hgt * tr), c: ['#5A4630', '#6B5A48', '#7D7468', '#4A3A2A', '#5E4A36'][(R() * 5) | 0] });
      }
    };
    for (let gx = -405; gx <= 405; gx += cell) {
      for (let gz = -1305; gz <= -495; gz += cell) {
        const x = gx + (R() - 0.5) * cell * 0.85, z = gz + (R() - 0.5) * cell * 0.85;
        const r = Math.hypot(x - cx, z - cz);
        if (r > 396 || r < 12) continue;
        if (Math.hypot(x - vx, z - DZc) < 15) continue;
        if (near(x, z, 6)) continue;
        if (Math.hypot(x + 170, z + 560) < 30) continue;
        const y = H(x, z);
        const cap = capAt(x, z);
        const c = greens[(R() * greens.length) | 0];
        const trailSide = near(x, z, 28);
        const u = R();
        if (u < 0.32 || trailSide) {
          const v = R();
          let t = r < 140 ? (v < 0.3 ? 'dip' : v < 0.55 ? 'teak' : v < 0.88 ? 'round' : 'tall') : (v < 0.16 ? 'dip' : v < 0.4 ? 'teak' : v < 0.72 ? 'round' : v < 0.85 ? 'tall' : 'bamboo');
          if (t === 'bamboo' && r < 280) t = 'round';
          let hgt = t === 'dip' ? 24 + R() * 10 : t === 'teak' ? 14 + R() * 6 : t === 'round' ? 10 + R() * 7 : t === 'tall' ? 18 + R() * 8 : 10 + R() * 4;
          const wf = t === 'dip' ? 1.0 + R() * 0.3 : t === 'teak' ? 0.95 + R() * 0.3 : t === 'round' ? 1.15 + R() * 0.35 : t === 'tall' ? 0.7 + R() * 0.2 : 0.55 + R() * 0.2;
          if (hgt > cap) {
            if (cap < 5) { if (cap > 1.2) kinds.shrub.push({ x: x, y: y, z: z, ry: R() * 6.28, sx: 2.6 + R() * 1.6, sy: Math.min(cap, 1.4 + R() * 1.2), c: c }); continue; }
            hgt = cap; if (t === 'dip' || t === 'tall') t = 'round';
          }
          addTree(t, x, z, hgt, hgt * wf, c);
        } else {
          if (R() < 0.62) continue;
          let s = 11 + R() * 6, sy = s * (0.45 + R() * 0.15), base = y + 6 + R() * 4;
          if (base + sy - y > cap) {
            const room = cap;
            if (room < 2) continue;
            if (room < 7) { kinds.shrub.push({ x: x, y: y, z: z, ry: R() * 6.28, sx: 3 + R() * 2, sy: Math.min(room, 2.6), c: c }); continue; }
            sy = Math.min(sy, room * 0.6); base = y + room - sy;
          }
          kinds.filler.push({ x: x, y: base, z: z, ry: R() * 6.28, sx: s, sy: sy, c: c });
        }
        if (R() < 0.1 && r > 40 && cap > 40) addTree('dip', x + (R() - 0.5) * 6, z + (R() - 0.5) * 6, 30 + R() * 8, 34 + R() * 8, greens[(R() * greens.length) | 0]);
        if (trailSide && R() < 0.5) {
          const sx2 = x + (R() - 0.5) * 8, sz2 = z + (R() - 0.5) * 8;
          if (!near(sx2, sz2, 3.2)) kinds.shrub.push({ x: sx2, y: H(sx2, sz2), z: sz2, ry: R() * 6.28, sx: 1.6 + R() * 1.6, sy: 1.1 + R() * 1.2, c: c });
        }
      }
    }
    // continuous canopy shell ~12 m above the floor (double sided: a leafy ceiling seen from the trail),
    // tapering to the ground at the rim, around the deck & summit clearings and under the view line
    {
      const shellH = (x, z) => {
        const r = Math.hypot(x - cx, z - cz);
        if (r >= 398) return 0;
        let h = 12 + 2.6 * Math.sin(x / 11.3 + z / 17.1) + 2.0 * Math.sin(z / 9.7 - x / 13.9) + 1.4 * Math.sin((x + z) / 6.1) + 1.1 * Math.cos((x - z) / 5.3);
        h *= this._sm((398 - r) / 28);
        h *= this._sm((Math.hypot(x - vx, z - DZc) - 10) / 16);
        h *= this._sm((r - 9) / 12);
        h *= this._sm((Math.hypot(x + 170, z + 560) - 12) / 20);
        const cap = capAt(x, z);
        if (h > cap) h = Math.max(0, cap);
        return h;
      };
      const A = this._A('ruCanopy', 0, -900);
      const bk = this._bkInfo(A);
      const S = 8;
      const hv = new Map();
      const hk = (x, z) => { const k = x + ',' + z; let v = hv.get(k); if (v === undefined) { v = shellH(x, z); hv.set(k, v); } return v; };
      const Y = (x, z) => H(x, z) + Math.max(0.3, hk(x, z));
      const pal = ['#FFFFFF', '#E9F0D6', '#DCE8C6', '#F2EFD0', '#D3E0BE'];
      for (let x = -400; x < 400; x += S) {
        for (let z = -1300; z < -500; z += S) {
          const corners = [[x, z + S], [x + S, z + S], [x + S, z], [x, z]];
          if (Math.min(Math.hypot(x - cx, z - cz), Math.hypot(x + S - cx, z - cz), Math.hypot(x - cx, z + S - cz), Math.hypot(x + S - cx, z + S - cz)) > 404) continue;
          let mx = 0;
          for (const c of corners) mx = Math.max(mx, hk(c[0], c[1]));
          if (mx < 0.35 && Math.hypot(x + S / 2 - vx, z + S / 2 - DZc) < 60) continue;
          // snap corners outside the rim onto the 404 m circle so the edge is round, not saw-toothed
          for (const c of corners) {
            const rr = Math.hypot(c[0] - cx, c[1] - cz);
            if (rr > 404) { c[0] = cx + ((c[0] - cx) * 404) / rr; c[1] = cz + ((c[1] - cz) * 404) / rr; }
          }
          const k = A.vc;
          for (const c of corners) {
            const y = Y(c[0], c[1]);
            const e = 4;
            const nx2 = Y(c[0] - e, c[1]) - Y(c[0] + e, c[1]);
            const nz2 = Y(c[0], c[1] - e) - Y(c[0], c[1] + e);
            const nl = Math.hypot(nx2, 2 * e, nz2);
            A.p.push(c[0], y, c[1]);
            A.n.push(nx2 / nl, (2 * e) / nl, nz2 / nl);
            A.u.push(c[0] / bk.tw, -c[1] / bk.th);
            const n = 0.5 + 0.5 * Math.sin(c[0] / 23 + Math.cos(c[1] / 31)) * Math.cos(c[1] / 19 - c[0] / 41);
            const cc = this._lc(pal[Math.min(pal.length - 1, (n * pal.length) | 0)]);
            const hh = hk(c[0], c[1]);
            const f = 0.7 + 0.3 * this._cl((hh - 8) / 8, 0, 1);
            A.c.push(cc[0] * f, cc[1] * f, cc[2] * f);
          }
          A.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
          A.vc += 4;
        }
      }
    }
    // crown geometries in unit space (height 1): near = smooth det-1 blobs, far = det-0 blobs
    const crownGeo = (blobs, det) => {
      const g = this._bake((A) => { for (const b of blobs) this._ruBlob(A, b[0], b[1], b[2], b[3], b[4], b[5], b[6], det); });
      return this._ruShadeCrown(g);
    };
    const SP = {
      dip: [[0, 0.86, 0, 0.3, 0.1, 0.3, '#4C7A33'], [0.22, 0.82, 0.12, 0.2, 0.08, 0.2, '#5A8A3A'], [-0.2, 0.83, -0.1, 0.22, 0.08, 0.2, '#44702E'], [0.05, 0.93, -0.05, 0.18, 0.07, 0.18, '#62923F']],
      teak: [[0, 0.66, 0, 0.32, 0.24, 0.32, '#5E8A36'], [0.2, 0.78, 0.1, 0.22, 0.18, 0.22, '#6C9A3E'], [-0.18, 0.75, -0.08, 0.24, 0.2, 0.22, '#527F30'], [0.0, 0.9, 0.02, 0.18, 0.12, 0.18, '#79A447']],
      round: [[0, 0.62, 0, 0.36, 0.3, 0.36, '#3F6B2C'], [0.22, 0.58, 0.1, 0.24, 0.2, 0.24, '#4B7A33'], [-0.2, 0.6, -0.12, 0.26, 0.22, 0.24, '#365E26'], [0.02, 0.82, 0.02, 0.24, 0.18, 0.22, '#55853A']],
      tall: [[0, 0.78, 0, 0.36, 0.2, 0.36, '#3A6528'], [0.0, 0.92, 0.0, 0.26, 0.12, 0.26, '#47753A'], [0.1, 0.68, -0.08, 0.26, 0.12, 0.24, '#335B24']]
    };
    const G = {};
    for (const k of Object.keys(SP)) {
      G[k + 'N'] = crownGeo(SP[k], 1);
      G[k] = crownGeo(SP[k].slice(0, 3), 0);
    }
    G.shrub = crownGeo([[0, 0.45, 0, 0.5, 0.45, 0.5, '#4E7A30']], 0);
    G.filler = crownGeo([[0, 0.5, 0, 0.5, 0.5, 0.5, '#3F6A2B']], 0);
    G.bamboo = this._ruShadeCrown(this._bake((A) => {
      const RB = this._rng(77);
      for (let k = 0; k < 5; k++) {
        const ox = (RB() - 0.5) * 0.12, oz = (RB() - 0.5) * 0.12, lean = (RB() - 0.5) * 0.25;
        this._ruSeg(A, [ox, 0, oz], [ox + lean * 0.4, 1.0, oz + lean * 0.3], 0.012, '#7E9A4A', 4);
      }
      for (let j = 0; j < 3; j++) this._ruBlob(A, (j - 1) * 0.08, 0.68 + j * 0.1, (j % 2) * 0.06, 0.18, 0.12, 0.16, '#7FA84A', 0);
    }));
    const mkMat = () => new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
    E.ruForest = [];
    E.ruForestCount = {};
    for (const k of Object.keys(kinds)) {
      if (!kinds[k].length) continue;
      E.ruForestCount[k] = kinds[k].length;
      E.ruForest.push(this._ruInst(G[k], mkMat(), kinds[k], { cast: k !== 'shrub' }));
    }
    const trunkGeo = (() => {
      const g = new T.CylinderGeometry(0.75, 1, 1, 6, 1, true).translate(0, 0.5, 0);
      const n = g.attributes.position.count;
      g.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3).fill(1), 3));
      return g;
    })();
    E.ruForest.push(this._ruInst(trunkGeo, mkMat(), trunks, { cast: true }));
    // ---- summit benchmark
    {
      const ys = H(0, -900);
      this.box('ruConcrete', 0, ys - 0.1, -900, 0.6, 1.0, 0.6, '#D9D4CA');
      this.box('ruFlat', 0, ys + 0.9, -900, 0.66, 0.06, 0.66, '#C8352B');
      this._col(-0.4, -900.4, 0.4, -899.6);
    }
    // ---- viewpoint deck (cantilevered over the brow) + Thai pavilion (sala)
    {
      const W = 14;
      for (let x = -6.5; x <= 6.51; x += 3.25) {
        for (const z of [DZ0 + 0.4, DZc, DZ1 - 0.4]) {
          const yg = H(x, z) - 0.3;
          this.box('ruWood', x, yg, z, 0.26, yD - yg, 0.26, '#6B4E33');
        }
      }
      for (const z of [DZc - 2.2, DZc + 2.2]) this._ruSeg('ruWood', [-6.5, H(-6.5, z + 1.5) + 0.4, z + 1.5], [6.5, yD - 0.4, z - 1.5], 0.07, '#6B4E33', 4);
      this.box('ruWood', DX, yD - 0.25, DZc, W, 0.25, DZ1 - DZ0, '#A57E56', { sides: 'ruWood' });
      for (let x = -7; x <= 7.01; x += 1.75) {
        this.box('ruWood', x, yD, DZ1, 0.12, 1.05, 0.12, '#6E5034');
        if (Math.abs(x) > 1.2) this.box('ruWood', x, yD, DZ0, 0.12, 1.05, 0.12, '#6E5034');
      }
      for (let z = DZ0; z <= DZ1 + 0.01; z += 1.5) for (const x of [-7, 7]) this.box('ruWood', x, yD, z, 0.12, 1.05, 0.12, '#6E5034');
      for (const y of [yD + 0.5, yD + 1.0]) {
        this.box('ruWood', 0, y, DZ1, W, 0.08, 0.1, '#7A5A3E');
        this.box('ruWood', -4.1, y, DZ0, 5.8, 0.08, 0.1, '#7A5A3E');
        this.box('ruWood', 4.1, y, DZ0, 5.8, 0.08, 0.1, '#7A5A3E');
        this.box('ruWood', -7, y, DZc, 0.1, 0.08, DZ1 - DZ0, '#7A5A3E');
        this.box('ruWood', 7, y, DZc, 0.1, 0.08, DZ1 - DZ0, '#7A5A3E');
      }
      this._col(-7.2, DZ1 - 0.2, 7.2, DZ1 + 0.2);
      this._col(-7.2, DZ0 - 0.2, -1.1, DZ0 + 0.2);
      this._col(1.1, DZ0 - 0.2, 7.2, DZ0 + 0.2);
      this._col(-7.2, DZ0 - 0.2, -6.8, DZ1 + 0.2);
      this._col(6.8, DZ0 - 0.2, 7.2, DZ1 + 0.2);
      const zS0 = DZ0 + 0.8, zS1 = DZ0 + 4.4, zSc = (zS0 + zS1) / 2;
      for (const x of [-4.4, 4.4]) for (const z of [zS0, zS1]) {
        this.box('ruWood', x, yD, z, 0.22, 3.0, 0.22, '#6E4E32');
        this._col(x - 0.2, z - 0.2, x + 0.2, z + 0.2);
      }
      this.box('ruWood', 0, yD + 3.0, zSc, 9.4, 0.18, 4.2, '#7A5A3E');
      this.gable('ruTile', 0, yD + 3.18, zSc, 9.6, 4.4, 2.2, '#B4532A', { oh: 0.8, both: true, wall: 'ruWood', wallCol: '#8E6A46' });
      this.box('ruWood', -3.7, yD, zSc, 0.5, 0.45, 3.0, '#8A6847');
      this.box('ruWood', 3.7, yD, zSc, 0.5, 0.45, 3.0, '#8A6847');
      this._sign('ป่าชุมชนเมืองคาร์บอน', 3.6, 0.7, '#5A3D24', '#F8E9C8', [0, yD + 2.55, zS0 - 0.1], Math.PI, { size: 0.5, border: '#C9A46A' });
      this._lamp(0, yD + 2.8, zSc, { pool: 5, gy: yD });
      this.cyl('ruShiny', 3.4, yD, DZ1 - 0.8, 0.07, 1.1, '#3F5A6E', 8);
      this.box('ruShiny', 3.4, yD + 1.1, DZ1 - 0.8, 0.36, 0.22, 0.3, '#2E6F9A');
      this._col(3.2, DZ1 - 1.0, 3.6, DZ1 - 0.6);
    }
    // ---- permanent sample plot on the upper trail: tagged tree with DBH tape, corner posts, sign, ranger
    const pi = Math.max(0, tp.length - 40);
    const pp = tp[pi], pq = tp[Math.min(tp.length - 1, pi + 1)];
    let ddx = pq[0] - pp[0], ddz = pq[1] - pp[1];
    const dl = Math.hypot(ddx, ddz) || 1; ddx /= dl; ddz /= dl;
    const side = (Math.hypot(pp[0] - ddz * 7 - cx, pp[1] + ddx * 7 - cz) > Math.hypot(pp[0] + ddz * 7 - cx, pp[1] - ddx * 7 - cz)) ? 1 : -1;
    const tx = pp[0] - side * ddz * 7, tz = pp[1] + side * ddx * 7;
    const ty = H(tx, tz);
    this.cyl('ruWood', tx, ty - 0.3, tz, 0.48, 16, '#6B5A48', 12);
    this.cyl('ruFlat', tx, ty + 1.27, tz, 0.5, 0.07, '#F2C200', 16);
    this.box('ruShiny', tx, ty + 1.45, tz + 0.5, 0.12, 0.08, 0.02, '#D9DEE2');
    for (const b of [[0, 17, 0, 6.5, 3.2, 6.5, '#4A7A33'], [3, 15.5, 2, 4.5, 2.6, 4.5, '#3F6B2C'], [-3, 16, -2, 4.8, 2.8, 4.6, '#55853A']]) this._ruBlob('ruFlat', tx + b[0], ty + b[1], tz + b[2], b[3], b[4], b[5], b[6], 1);
    this._col(tx - 0.6, tz - 0.6, tx + 0.6, tz + 0.6);
    for (const c of [[-10, -10], [10, -10], [10, 10], [-10, 10]]) {
      const x = tx + c[0], z = tz + c[1];
      if (near(x, z, 1.6)) continue;
      this.cyl('ruFlat', x, H(x, z), z, 0.05, 1.0, '#F4F4F0', 6);
      this.cyl('ruFlat', x, H(x, z) + 1.0, z, 0.055, 0.12, '#D32F2F', 6);
    }
    const sx0 = pp[0] - side * ddz * 2.0, sz0 = pp[1] + side * ddx * 2.0;
    this.box('ruWood', sx0, H(sx0, sz0) - 0.1, sz0, 0.1, 1.3, 0.1, '#6E5034');
    this._sign('แปลงสำรวจถาวร P-07 · วัด DBH ที่ 1.3 ม.', 1.5, 0.42, '#F7F1E1', '#2F4A2A', [sx0, H(sx0, sz0) + 1.25, sz0], Math.atan2(ddx, ddz) + Math.PI / 2 * side, { size: 0.36, both: true });
    E.crowdSpots.push({ x: tx - side * ddz * -0.9, z: tz + side * ddx * -0.9, yaw: Math.atan2(-side * ddz, side * ddx) + Math.PI, mode: 'work', outfit: 'worker' });
    E.animalSpots.birds.push([0, -900], [-150, -780], [160, -980]);
    // ---- stop anchor 19: the route is the whole trail from the end of road H, then onto the deck
    const route = tp.map((p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);
    route.push([0, -797.6], [0, -791.5]);
    const short = route.slice(Math.max(0, route.length - 22));
    const pinX = -45, pinZ = -743, pinY = H(pinX, pinZ) + 23;
    this._stopAnchor(19, {
      view: [vx, vz], viewY: eyeY, guideY: yD, look: [0, 0, -100], guide: [-2.0, -790.6],
      pin: [pinX, pinY, pinZ], emit: [-42, pinY - 7, -746], gas: ['CO2'], spread: 14, down: true,
      inside: null, district: 'forest', route: route, routeShort: short, routeLen: Math.round(TR.len + 12)
    });
  },

  // smooth-shaded icosphere blob (det 0/1)
  _ruBlob(b, x, y, z, sx, sy, sz, col, det) {
    const E = this._E;
    const T = E.T;
    const key = 'ruIco' + (det || 0);
    if (!E.G) E.G = {};
    if (!E.G[key]) E.G[key] = new T.IcosahedronGeometry(1, det || 0);
    const g = E.G[key];
    const A = this._A(b, x, z);
    const cc = this._lc(col);
    const P = g.attributes.position, U = g.attributes.uv;
    const k = A.vc;
    for (let i = 0; i < P.count; i++) {
      const px = P.getX(i), py = P.getY(i), pz = P.getZ(i);
      A.p.push(x + px * sx, y + py * sy, z + pz * sz);
      let nx = px / sx, ny = py / sy, nz = pz / sz;
      const l = Math.hypot(nx, ny, nz) || 1;
      A.n.push(nx / l, ny / l, nz / l);
      A.u.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0);
      A.c.push(cc[0], cc[1], cc[2]);
      A.i.push(k + i);
    }
    A.vc += P.count;
  },

  // darken crown undersides + per-vertex noise
  _ruShadeCrown(g) {
    const pos = g.attributes.position, col = g.attributes.color;
    let y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < pos.count; i++) { y0 = Math.min(y0, pos.getY(i)); y1 = Math.max(y1, pos.getY(i)); }
    const R = this._rng(4711);
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - y0) / Math.max(1e-3, y1 - y0);
      const f = (0.62 + 0.38 * t) * (0.9 + R() * 0.2);
      col.setXYZ(i, col.getX(i) * f, col.getY(i) * f, col.getZ(i) * f);
    }
    col.needsUpdate = true;
    return g;
  },

  // ================================================================= ENERGY (wind, solar, power plant)
  _bEnergy() {
    const E = this._ruInit();
    const T = E.T;
    const H = window.GHG3L.H;
    const R = this._rng(2001);
    // ---------------- wind turbines (rotors face east, into the wind)
    const tps = [[760, -1340], [905, -1425], [1050, -1352], [1190, -1462], [1330, -1385], [985, -1600], [1265, -1648]];
    const rotorItems = [];
    for (const p of tps) {
      const y0 = H(p[0], p[1]);
      this.cyl('ruConcrete', p[0], y0 - 0.2, p[1], 6.5, 0.6, '#B9B4AA', 16);
      this.cyl('ruFlat', p[0], y0, p[1], 2.1, 30, '#EEF0EF', 16);
      this.cyl('ruFlat', p[0], y0 + 30, p[1], 1.75, 32, '#F1F3F2', 16);
      this.cyl('ruFlat', p[0], y0 + 62, p[1], 1.4, 30, '#F3F5F4', 16);
      this.box('ruFlat', p[0] - 1.0, y0 + 91.3, p[1], 11, 3.6, 3.8, '#F2F4F3');
      this.box('ruFlat', p[0] + 0.5, y0 + 31.0, p[1] + 1.9, 0.6, 2.2, 0.2, '#B0B6BA');
      this.box('ruShiny', p[0] + 8, y0, p[1] - 4, 2.4, 2.2, 1.8, '#7E9187');
      this._col(p[0] - 2.4, p[1] - 2.4, p[0] + 2.4, p[1] + 2.4);
      rotorItems.push({ x: p[0] + 5.2, y: y0 + 93.1, z: p[1], ph: R() * 6.28, sp: 1.15 + R() * 0.25 });
    }
    {
      const rg = this._bake((A) => {
        this.sph(A, 0, 0, 0.6, 1.6, 1.6, 2.4, '#F2F4F3', 14);
        this.cone(A, 0, 0, 2.2, 1.0, 1.6, '#F2F4F3', 12);
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI * 2;
          const segs = [[1.5, 9, 3.0, 0.75], [9, 30, 2.3, 0.5], [30, 52, 1.2, 0.28]];
          for (const s of segs) {
            const mid = (s[0] + s[1]) / 2, len = s[1] - s[0];
            this.boxR(A, Math.sin(a) * mid, Math.cos(a) * mid, 0, s[2], len, s[3], '#F4F6F5', 0.12, 0, -a);
          }
        }
      });
      const im = this._ruInst(rg, E.mats.flat, rotorItems.map((r) => ({ x: r.x, y: r.y, z: r.z })), { cast: true });
      const M = new T.Matrix4(), Q = new T.Quaternion(), Qy = new T.Quaternion(), Qr = new T.Quaternion();
      const V = new T.Vector3(), S = new T.Vector3(1, 1, 1);
      Qy.setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 2);
      const AZ = new T.Vector3(0, 0, 1);
      this._anim((dt, t) => {
        rotorItems.forEach((r, i) => {
          Qr.setFromAxisAngle(AZ, r.ph + t * r.sp);
          Q.copy(Qy).multiply(Qr);
          M.compose(V.set(r.x, r.y, r.z), Q, S);
          im.setMatrixAt(i, M);
        });
        im.instanceMatrix.needsUpdate = true;
      });
    }
    // ---------------- solar farm (x 1100..1400, z 30..220), panels face south, 15° tilt
    {
      this.plane('ruDirt', 1250, 0.05, 125, 300, 190, '#BDB3A0');
      this._ruFenceChain(1100, 30, 1400, 30, 2.2);
      this._ruFenceChain(1100, 30, 1100, 220, 2.2);
      this._ruFenceChain(1400, 30, 1400, 220, 2.2);
      this._ruFenceChain(1100, 220, 1400, 220, 2.2, [[144, 156]]);
      const pg = new T.BoxGeometry(20, 0.06, 4.0);
      const uv = pg.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 10, uv.getY(i) * 2);
      const n = pg.attributes.position.count;
      pg.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3).fill(1), 3));
      const pm = new T.MeshStandardMaterial({ map: E.tex.ruPanel, roughness: 0.22, metalness: 0.35, vertexColors: true });
      const items = [];
      const tilt = (15 * Math.PI) / 180;
      for (let z = 42; z <= 208; z += 7.2) {
        for (let x = 1112; x + 20 <= 1390; x += 22.5) {
          items.push({ x: x + 10, y: 1.35, z: z, rx: tilt, c: '#FFFFFF' });
          for (const lx of [x + 3, x + 17]) {
            this.box('ruShiny', lx, 0.05, z - 1.6, 0.08, 1.8, 0.08, '#A9B0B5');
            this.box('ruShiny', lx, 0.05, z + 1.6, 0.08, 0.9, 0.08, '#A9B0B5');
          }
          this._col(x, z - 2.1, x + 20, z + 2.1);
        }
      }
      E.ruSolar = this._ruInst(pg, pm, items, { cast: true });
      for (const p of [[1170, 120], [1250, 120], [1330, 120]]) {
        this.box('ruFlat', p[0], 0.05, p[1] - 3.6, 6.0, 2.6, 2.4, '#ECEFF0');
        for (let k = 0; k < 5; k++) this.box('ruFlat', p[0] - 2.4 + k * 1.2, 1.2, p[1] - 2.38, 0.7, 0.9, 0.04, '#9AA3A8');
        this.box('ruShiny', p[0] + 4.2, 0.05, p[1] - 3.6, 1.8, 1.9, 1.8, '#5F7F6A');
        this._col(p[0] - 3.2, p[1] - 5, p[0] + 5.3, p[1] - 2.2);
      }
      this.box('ruFlat', 1243, 0, 221, 0.16, 2.4, 0.16, '#5A5F63');
      this.box('ruFlat', 1257, 0, 221, 0.16, 2.4, 0.16, '#5A5F63');
      this.box('ruFlat', 1250, 2.2, 221.05, 6.6, 1.0, 0.08, '#1F4E79');
      this._sign('โซลาร์ฟาร์มชุมชน 5 MW', 6.2, 0.86, '#1F4E79', '#FFFFFF', [1250, 2.7, 221.12], 0, { size: 0.5 });
    }
    // ---------------- distant power plant (Scope 2 reference)
    {
      const pp = this._ruPPos();
      const px = pp[0], pz = pp[1];
      this.plane('ruConcrete', px + 20, 0.06, pz + 30, 320, 260, '#A9A59D');
      // boiler house + turbine hall + ESP
      this.box('ruMetal', px, 0.06, pz, 42, 64, 36, '#8F9CAA', { top: 'ruConcrete' });
      for (let k = 1; k < 6; k++) this.box('ruFlat', px, k * 11, pz, 42.4, 0.6, 36.4, '#6C7884', { top: false });
      this.box('ruMetal', px + 66, 0.06, pz + 4, 92, 30, 32, '#C5CBD1', { top: false });
      this.gable('ruMetal', px + 66, 30.06, pz + 4, 92, 32, 3, '#7E8C99', { wall: 'ruMetal', wallCol: '#C5CBD1' });
      this.box('ruFlat', px + 66, 21, pz + 20.02, 92, 3.2, 0.1, '#2F5F8F');
      this.box('ruMetal', px - 36, 0.06, pz + 6, 26, 26, 22, '#9DA6AF');
      // stack with red/white aviation bands + platforms
      const sx = px - 62, sz = pz + 10;
      this.cyl('ruConcrete', sx, 0.06, sz, 7.5, 150, '#BDBAB3', 24);
      for (let k = 0; k < 6; k++) this.cyl('ruFlat', sx, 150 + k * 6, sz, 7.2 - k * 0.1, 6, k % 2 ? '#F2F2EE' : '#C8352B', 24);
      for (const y of [60, 120, 186]) this.cyl('ruShiny', sx, y, sz, 8.3, 0.5, '#5E6468', 24);
      this.tube('ruShiny', [[px - 21, 30, pz + 6], [px - 49, 30, pz + 6], [sx + 6, 22, sz]], 3.2, '#8C969E', 12);
      // hyperbolic cooling tower
      const prof = [];
      for (let k = 0; k <= 14; k++) {
        const y = (k / 14) * 118;
        const r = 25 * Math.sqrt(1 + Math.pow((y - 90) / 52, 2));
        prof.push([Math.min(46, r), y]);
      }
      this._ruLathe('ruConcrete', px + 60, pz + 115, prof, 40, '#CFCBC3');
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        this._ruSeg('ruConcrete', [px + 60 + Math.cos(a) * 41, 0.06, pz + 115 + Math.sin(a) * 41], [px + 60 + Math.cos(a + 0.2) * 40.5, 7, pz + 115 + Math.sin(a + 0.2) * 40.5], 0.6, '#B8B4AC', 6);
      }
      // coal yard + conveyor gallery
      for (const c of [[-150, -40, 120, 28], [-150, 0, 120, 26]]) {
        const x0 = px + c[0] - c[2] / 2, x1 = px + c[0] + c[2] / 2, z0 = pz + c[1] - c[3] / 2, z1 = pz + c[1] + c[3] / 2;
        this._ruFrustum([x0, z0, x1, z1], [x0 + 12, z0 + 11, x1 - 12, z1 - 11], 0.06, 12, { all: ['ruDirt', '#2E2C2A'], top: ['ruDirt', '#2A2826'] });
        this._col(x0, z0, x1, z1);
      }
      {
        const len = Math.hypot(110, 40);
        this.boxR('ruMetal', px - 80, 22, pz - 20, len, 4, 4, '#B5BCC2', 0, 0, Math.atan2(40, 110));
        for (const f of [0.2, 0.45, 0.7]) this.box('ruShiny', px - 135 + 110 * f, 0.06, pz - 20, 0.8, 2 + 40 * f - 2, 0.8, '#8E959A');
      }
      // switchyard + first transmission towers toward the city substation
      for (let k = 0; k < 4; k++) this.box('ruShiny', px + 130, 0.06, pz - 30 + k * 16, 6, 5, 4, '#6F7C70');
      for (let k = 0; k < 5; k++) {
        this.box('ruShiny', px + 150 + k * 8, 0.06, pz - 40, 0.4, 16, 0.4, '#8E959A');
        this.box('ruShiny', px + 150 + k * 8, 0.06, pz + 30, 0.4, 16, 0.4, '#8E959A');
        this.box('ruShiny', px + 150 + k * 8, 15.6, pz - 5, 0.4, 0.4, 70, '#8E959A');
      }
      const dir = [260 - (px + 170), -335 - pz];
      const dl = Math.hypot(dir[0], dir[1]);
      const ux = dir[0] / dl, uz = dir[1] / dl;
      const towers = [];
      for (let k = 1; k <= 3; k++) towers.push([px + 170 + ux * 170 * k, pz + uz * 170 * k]);
      const tops = towers.map((t) => this._ruTower(t[0], t[1], Math.atan2(ux, uz)));
      for (let i = 0; i < tops.length - 1; i++) {
        for (let w = 0; w < tops[i].length; w++) {
          const a = tops[i][w], b = tops[i + 1][w];
          const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 3.5, (a[2] + b[2]) / 2];
          this._ruSeg('ruFlat', a, m, 0.04, '#3A3A3A', 4);
          this._ruSeg('ruFlat', m, b, 0.04, '#3A3A3A', 4);
        }
      }
      E.ruPowerLineEnd = towers[towers.length - 1];
      this._col(px - 21, pz - 18, px + 21, pz + 18);
      this._col(px + 20, pz - 12, px + 112, pz + 20);
      this._col(sx - 8, sz - 8, sx + 8, sz + 8);
      this._col(px + 18, pz + 73, px + 102, pz + 157);
      // smoke & steam plumes (visible from afar), lights
      this._emitter({ type: 'smoke', pos: [sx, 187, sz], rate: 3, size: 16, rise: 6, spread: 4, life: 40, color: '#C9C8C2', big: true });
      this._emitter({ type: 'steam', pos: [px + 60, 120, pz + 115], rate: 5, size: 42, rise: 5, spread: 18, life: 30, color: '#FFFFFF', big: true });
      for (const l of [[px + 30, 32, pz + 21], [px - 10, 66, pz + 19], [px + 100, 12, pz + 21], [px - 40, 27, pz + 18]]) this._lamp(l[0], l[1], l[2], { color: '#FFC27A', pool: 0 });
      E.ruBeacons = [[sx, 189, sz]];
    }
    // ---------------- blinking red aviation beacons (turbine nacelles + stack)
    {
      const pts = [];
      for (const p of tps) pts.push(p[0] - 5.5, H(p[0], p[1]) + 93.4, p[1]);
      for (const b of E.ruBeacons || []) pts.push(b[0], b[1], b[2]);
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pts, 3));
      const mat = new T.PointsMaterial({ map: E.tex.glow, color: this._lcol('#FF2A1E'), size: 7, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, fog: false });
      const P = new T.Points(g, mat);
      P.frustumCulled = false;
      this._addDyn(P);
      this._anim((dt, t) => { mat.opacity = (Math.sin(t * Math.PI) > 0.2 ? 1 : 0.08) * (0.35 + 0.65 * (E.nightK || 0)); });
    }
  },

  // simple lattice transmission tower; returns 6 conductor points
  _ruTower(x, z, ry) {
    const y0 = this._ruH(x, z);
    const X = this._ruXf(x, z, ry);
    const legs = [[-3, -3], [3, -3], [3, 3], [-3, 3]];
    const topL = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]];
    const pt = (l, h) => { const p = X(l[0], l[1]); return [p[0], y0 + h, p[1]]; };
    for (let i = 0; i < 4; i++) {
      this._ruSeg('ruShiny', pt(legs[i], 0), pt(topL[i], 38), 0.16, '#8E959A', 4);
      this._ruSeg('ruShiny', pt(legs[i], 0), pt(legs[(i + 1) % 4], 0), 0.1, '#8E959A', 4);
    }
    for (const h of [12, 24, 34]) {
      const f = h / 38;
      const lp = legs.map((l, i) => [l[0] + (topL[i][0] - l[0]) * f, l[1] + (topL[i][1] - l[1]) * f]);
      for (let i = 0; i < 4; i++) this._ruSeg('ruShiny', pt(lp[i], h), pt(lp[(i + 1) % 4], h), 0.08, '#8E959A', 4);
      for (let i = 0; i < 4; i++) this._ruSeg('ruShiny', pt(lp[i], h), pt(legs[(i + 1) % 4].map((v, j) => v + (topL[(i + 1) % 4][j] - v) * ((h - 12) / 38)), Math.max(0, h - 12)), 0.06, '#8E959A', 4);
    }
    const out = [];
    for (const h of [30, 35]) {
      this._ruSeg('ruShiny', pt([-7, 0], h), pt([7, 0], h), 0.12, '#8E959A', 4);
      for (const lx of [-6.5, 0, 6.5]) { if (lx === 0 && h === 30) continue; const p = pt([lx, 0], h - 1.6); out.push(p); this._ruSeg('ruFlat', pt([lx, 0], h), p, 0.07, '#D7D2C6', 4); }
    }
    this._ruSeg('ruShiny', pt([0, 0], 38), pt([0, 0], 42), 0.1, '#8E959A', 4);
    this._colBox(x, z, 7, 7, ry, 0);
    return out;
  }
};
