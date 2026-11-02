/* GHG Town 3D v0.3 — actors: guide พี่กล้า, instanced crowd, animals, bird flocks
   Conventions: local forward = +z, feet at y = 0, yaw = rotation.y (heading to (dx,dz) = atan2(dx,dz)).
   Person rig (metres at k = 1, height 1.72): hips 0.91 → waist +0.11 → shoulders +0.372 (x ±0.172) / neck +0.43;
   upper arm 0.29, forearm 0.255, hand 0.18; thigh 0.42, shin 0.41, ankle 0.08 above the sole. */
GHG3.actors = {
  // =============================================================== GEOMETRY KIT
  _acGeo(key) {
    const E = this._E;
    const T = E.T;
    if (!E.acG) E.acG = {};
    let g = E.acG[key];
    if (g) return g;
    const p = key.split(':');
    const t = p[0];
    if (t === 'sph') g = new T.SphereGeometry(1, +p[1], +p[2]);
    else if (t === 'hemi') g = new T.SphereGeometry(1, +p[1], +p[2], 0, Math.PI * 2, 0, Math.PI / 2);
    else if (t === 'tap') g = new T.CylinderGeometry(1, +p[1], 1, +p[2]);
    else if (t === 'tapo') g = new T.CylinderGeometry(1, +p[1], 1, +p[2], 1, true);
    else if (t === 'cone') g = new T.ConeGeometry(1, 1, +p[1]);
    else if (t === 'head') {
      g = new T.SphereGeometry(1, +p[1], Math.round(+p[1] * 0.75));
      const P = g.attributes.position;
      for (let i = 0; i < P.count; i++) {
        const q = this._acHeadMap(P.getX(i), P.getY(i), P.getZ(i));
        P.setXYZ(i, q[0], q[1], q[2]);
      }
      g.computeVertexNormals();
    }
    else if (t === 'torus') g = new T.TorusGeometry(1, +p[1], 6, +p[2]);
    else if (t === 'tri') {
      g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0.12, 0, 0, -0.12, 1, 0, -0.05, 0, 0, -0.12, 0, 0, 0.12, 1, 0, -0.05], 3));
      g.computeVertexNormals();
    } else g = new T.BoxGeometry(1, 1, 1);
    E.acG[key] = g;
    return g;
  },
  // unit sphere -> head shape (neck-joint space): tapered jaw, flatter face, rounder skull
  _acHeadMap(x, y, z) {
    if (y < 0) {
      const f = -y;
      x *= 1 - 0.3 * Math.pow(f, 1.6);
      z *= 1 - 0.1 * Math.pow(f, 1.4);
      y *= 1 + 0.06 * f;
    }
    if (z > 0.62) z = 0.62 + (z - 0.62) * 0.66;
    if (z < 0) z *= 0.97;
    return [x * 0.077, 0.148 + y * 0.112, 0.008 + z * 0.098];
  },
  // front surface z of the head at (x, y) (neck-joint space)
  _acHeadZ(x, y) {
    const E = this._E;
    if (!E.acHS) {
      const S = [];
      for (let a = 0; a <= 90; a++) for (let b = 0; b <= 90; b++) {
        const th = -Math.PI / 2 + (a / 90) * Math.PI, ph = -Math.PI / 2 + (b / 90) * Math.PI;
        const ux = Math.cos(th) * Math.sin(ph), uy = Math.sin(th), uz = Math.cos(th) * Math.cos(ph);
        S.push(this._acHeadMap(ux, uy, uz));
      }
      E.acHS = S;
    }
    let best = null, bd = 1e9;
    for (const q of E.acHS) { const d = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (d < bd) { bd = d; best = q; } }
    return best ? best[2] : 0.09;
  },
  _acPut(A, geo, x, y, z, sx, sy, sz, rx, ry, rz, col) {
    const E = this._E;
    const T = E.T;
    if (!E._acM4) { E._acM4 = new T.Matrix4(); E._acN3 = new T.Matrix3(); E._acQ = new T.Quaternion(); E._acEu = new T.Euler(); E._acV = new T.Vector3(); E._acS = new T.Vector3(); E._acP = new T.Vector3(); }
    E._acEu.set(rx || 0, ry || 0, rz || 0);
    E._acQ.setFromEuler(E._acEu);
    E._acM4.compose(E._acP.set(x, y, z), E._acQ, E._acS.set(sx, sy, sz));
    E._acN3.getNormalMatrix(E._acM4);
    const cc = this._lc(col);
    const P = geo.attributes.position, N = geo.attributes.normal;
    const k = A.vc;
    const v = E._acV;
    for (let i = 0; i < P.count; i++) {
      v.set(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(E._acM4);
      A.p.push(v.x, v.y, v.z);
      v.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(E._acN3).normalize();
      A.n.push(v.x, v.y, v.z);
      A.u.push(0, 0);
      A.c.push(cc[0], cc[1], cc[2]);
    }
    if (geo.index) { const I = geo.index.array; for (let i = 0; i < I.length; i++) A.i.push(k + I[i]); }
    else for (let i = 0; i < P.count; i++) A.i.push(k + i);
    A.vc += P.count;
  },
  // drawing kit bound to an accumulator; hi = detailed (guide) vs light (crowd)
  _acKit(A, hi) {
    const s = this;
    const lv = hi === true ? 2 : (hi === 'lo' ? 0 : 1);
    const sk = ['sph:6:4', 'sph:8:6', 'sph:18:12'][lv];
    const seg = [5, 6, 14][lv];
    return {
      // ellipsoid at (x,y,z) with radii, optional rotation
      S: (x, y, z, rx, ry, rz, col, ax, ay, az, key) => s._acPut(A, s._acGeo(key || sk), x, y, z, rx, ry, rz, ax || 0, ay || 0, az || 0, col),
      // centred box with optional rotation
      B: (x, y, z, w, h, d, col, ax, ay, az) => s._acPut(A, s._acGeo('box'), x, y, z, w, h, d, ax || 0, ay || 0, az || 0, col),
      // tapered limb hanging down from (x,y,z): length len, top radii rx/rz, bottom = t * top
      L: (x, y, z, len, rx, rz, t, col, n) => s._acPut(A, s._acGeo('tap:' + t + ':' + (n || seg)), x, y - len / 2, z, rx, len, rz, 0, 0, 0, col),
      // tapered cylinder centred at (x,y,z), rotated
      C: (x, y, z, rTop, h, rzTop, t, col, ax, ay, az, n, open) => s._acPut(A, s._acGeo((open ? 'tapo:' : 'tap:') + t + ':' + (n || seg)), x, y, z, rTop, h, rzTop, ax || 0, ay || 0, az || 0, col),
      K: (x, y, z, r, h, rz, col, ax, ay, az, n) => s._acPut(A, s._acGeo('cone:' + (n || seg)), x, y, z, r, h, rz, ax || 0, ay || 0, az || 0, col),
      H: (x, y, z, rx, ry, rz, col, ax, ay, az) => s._acPut(A, s._acGeo(['hemi:6:3', 'hemi:8:4', 'hemi:18:8'][lv]), x, y, z, rx, ry, rz, ax || 0, ay || 0, az || 0, col),
      seg: seg
    };
  },

  // =============================================================== PALETTES
  _acPick(R, arr) { return arr[(R() * arr.length) | 0]; },
  _acPalette(o) {
    const R = this._rng((o.seed || 1) * 7919 + 13);
    const pick = (a) => this._acPick(R, a);
    const skin = o.skin || pick(['#E0AC85', '#C98F66', '#D9A078', '#B97A55', '#EDC2A0', '#A86E4B', '#D4976E']);
    const hairs = ['#1C1815', '#221A15', '#16120F', '#2E221A', '#3B2A20', '#4A3426'];
    const shoes = ['#2A2420', '#111111', '#EFEFEF', '#6B4F3A', '#34495E', '#8B8B8B'];
    const fem = !!o.fem;
    const c = {
      skin: skin, hair: o.hair || (R() < 0.08 ? '#8E8A86' : pick(hairs)), eye: '#2B1D14', sclera: '#F2EEE8', lip: fem ? '#B5615A' : '#9A5446',
      top: '#FFFFFF', bottom: '#2B2B33', shoe: pick(shoes), longSleeve: false, shorts: false, skirt: false, hairLong: fem && R() < 0.75,
      hat: false, helmet: null, coat: false, apron: null, umb: pick(['#C0392B', '#2E86C1', '#F1C40F', '#27AE60', '#8E44AD', '#E67E22', '#1ABC9C', '#34495E', '#EC407A'])
    };
    const out = o.outfit || 'casual';
    if (out === 'guide') {
      Object.assign(c, { skin: '#C98F66', hair: '#1C1815', top: '#2F7D4F', collar: '#24613D', bottom: '#4E4A44', shoe: '#2A2420', hairLong: false, glasses: '#222222' });
    } else if (out === 'casual') {
      c.top = pick(['#D9534F', '#3B82C4', '#F2C14E', '#2E8B57', '#FFFFFF', '#8E6CC2', '#F28C28', '#4A4A4A', '#E86A92', '#56B4D3', '#B5D99C', '#1F3A5F']);
      c.bottom = pick(['#2F3B52', '#3A3A3A', '#6B5B45', '#1F4E79', '#7A7A7A', '#C2B280', '#4A5A6A']);
      c.shorts = R() < 0.3;
      c.skirt = fem && R() < 0.35;
    } else if (out === 'office') {
      c.top = pick(['#FFFFFF', '#DCE9F5', '#F3E6D8', '#E8E8E8', '#F5F0FF']);
      c.bottom = pick(['#2B2B33', '#1F2A44', '#3C3C3C', '#4A4036']);
      c.skirt = fem && R() < 0.6;
      c.longSleeve = R() < 0.5;
      c.shoe = pick(['#111111', '#2A2420', '#3B2A20']);
    } else if (out === 'student') {
      c.top = '#FFFFFF';
      c.bottom = pick(['#1C2541', '#111111', '#22304F']);
      c.skirt = fem;
      c.shorts = !fem && R() < 0.5;
      c.shoe = pick(['#111111', '#EFEFEF']);
    } else if (out === 'worker') {
      c.top = pick(['#2D4E86', '#365E9D', '#28456F']);
      c.bottom = c.top;
      c.longSleeve = true;
      c.helmet = R() < 0.25 ? '#F2C230' : '#F4F4F0';
      c.shoe = '#3A2E25';
      c.hairLong = false;
    } else if (out === 'nurse') {
      c.top = '#FFFFFF';
      c.bottom = '#FFFFFF';
      c.skirt = fem && R() < 0.5;
      c.shoe = '#F4F4F4';
    } else if (out === 'doctor') {
      c.top = pick(['#8EC3E6', '#6FA9C9', '#7CC2B4']);
      c.bottom = c.top;
      c.coat = true;
      c.shoe = pick(['#111111', '#F4F4F4']);
    } else if (out === 'shop') {
      c.top = pick(['#1F6FB2', '#F2B705', '#2E8B57']);
      c.bottom = pick(['#2B2B33', '#1F2A44']);
      c.apron = R() < 0.5 ? '#1F3A5F' : null;
    } else if (out === 'farmer') {
      c.top = pick(['#5B6B8C', '#7B5E3B', '#4F6F52', '#2F4858', '#8C6A4F']);
      c.bottom = pick(['#2B2B2B', '#3D3D46', '#4B3B2B']);
      c.longSleeve = true;
      c.hat = true;
      c.shoe = pick(['#3B2A20', '#1E1E1E']);
    } else if (out === 'vendor') {
      c.top = pick(['#F2F2F2', '#E8A0A0', '#9FC5E8', '#F6D06F', '#B6D7A8']);
      c.bottom = pick(['#2B2B33', '#3A3A3A', '#5B4A3A']);
      c.apron = pick(['#2E6DB4', '#C0392B', '#F5F5F5', '#2E8B57']);
    }
    c.sleeve = c.top;
    c.fore = c.longSleeve ? c.top : c.skin;
    c.shin = (c.shorts || c.skirt) ? c.skin : c.bottom;
    if (c.coat) { c.sleeve = '#F6F6F3'; c.fore = c.longSleeve ? '#F6F6F3' : c.skin; }
    return c;
  },

  // =============================================================== BODY PARTS (joint-local space)
  // head + neck, relative to the neck joint
  _acHead(A, c, hi) {
    const K = this._acKit(A, hi);
    const sk = c.skin;
    const Z = (x, y) => this._acHeadZ(x, y);
    K.C(0, 0.045, -0.006, 0.05, 0.12, 0.046, 1.1, sk);
    this._acPut(A, this._acGeo(hi === true ? 'head:28' : (hi === 'lo' ? 'head:8' : 'head:10')), 0, 0, 0, 1, 1, 1, 0, 0, 0, sk);
    if (hi !== 'lo') {
      K.S(0.075, 0.142, -0.004, 0.012, 0.028, 0.02, this._shade(sk, 0.92));
      K.S(-0.075, 0.142, -0.004, 0.012, 0.028, 0.02, this._shade(sk, 0.92));
    }
    const zn = Z(0, 0.122);
    K.B(0, 0.127, zn + 0.004, 0.017, 0.032, 0.018, sk, -0.3, 0, 0);
    if (hi !== 'lo') K.S(0, 0.113, zn + 0.012, 0.0135, 0.0105, 0.0115, sk);
    if (hi === true) {
      for (const sx of [1, -1]) {
        const ze = Z(sx * 0.031, 0.156);
        K.S(sx * 0.031, 0.156, ze - 0.0015, 0.0132, 0.0092, 0.006, c.sclera);
        K.S(sx * 0.031, 0.1555, ze + 0.004, 0.0067, 0.0067, 0.0028, c.eye);
        K.S(sx * 0.0298, 0.1575, ze + 0.0063, 0.0016, 0.0016, 0.001, '#FFFFFF');
        const zb = Z(sx * 0.032, 0.175);
        K.B(sx * 0.032, 0.175, zb + 0.003, 0.03, 0.0062, 0.007, c.hair, 0, 0, -sx * 0.09);
      }
      for (let i = -3; i <= 3; i++) {
        const u = i / 3;
        const x = u * 0.023, y = 0.087 + 0.006 * u * u;
        K.B(x, y, Z(x, y) + 0.0015, 0.0088, 0.0042, 0.005, c.lip, 0, -u * 0.5, u * 0.42);
      }
      if (c.glasses) {
        const g = c.glasses;
        const zg = Z(0.031, 0.156) + 0.016;
        for (const sx of [1, -1]) {
          const cx = sx * 0.032, cy = 0.157;
          K.B(cx, cy + 0.0118, zg, 0.035, 0.003, 0.004, g);
          K.B(cx, cy - 0.0108, zg, 0.033, 0.003, 0.004, g);
          K.B(cx + sx * 0.0172, cy + 0.0005, zg, 0.003, 0.023, 0.004, g);
          K.B(cx - sx * 0.0172, cy + 0.0005, zg, 0.003, 0.021, 0.004, g);
          K.B(sx * 0.0625, cy + 0.006, zg / 2, 0.0028, 0.0028, Math.hypot(zg, 0.023) + 0.002, g, 0, Math.atan2(-sx * 0.023, zg), 0);
        }
        K.B(0, 0.16, zg + 0.001, 0.0125, 0.0028, 0.004, g);
      }
    } else {
      for (const sx of [1, -1]) K.B(sx * 0.031, 0.157, Z(0.031, 0.157) + 0.001, 0.016, 0.008, 0.006, c.eye);
      for (const sx of [1, -1]) K.B(sx * 0.032, 0.175, Z(0.032, 0.175) + 0.002, 0.026, 0.006, 0.006, c.hair);
      K.B(0, 0.088, Z(0, 0.088) + 0.001, 0.026, 0.0055, 0.005, c.lip);
    }
  },
  // short hair (relative to neck joint)
  _acHairShort(A, c, hi) {
    const K = this._acKit(A, hi);
    const h = c.hair;
    K.S(0, 0.176, -0.008, 0.081, 0.094, 0.1, h);
    if (hi !== 'lo') K.S(0, 0.205, 0.05, 0.07, 0.028, 0.04, h, -0.4, 0, 0);
    K.S(0, 0.13, -0.046, 0.074, 0.06, 0.066, h);
    for (const sx of [1, -1]) K.B(sx * 0.0735, 0.172, -0.018, 0.012, 0.05, 0.078, h);
    if (hi === true) K.S(0.018, 0.232, 0.026, 0.058, 0.016, 0.058, this._shade(h, 1.35), 0, 0, -0.12);
  },
  _acHairLong(A, c, hi) {
    const K = this._acKit(A, hi);
    const h = c.hair;
    K.S(0, 0.176, -0.006, 0.084, 0.097, 0.103, h);
    K.S(0, 0.203, 0.054, 0.072, 0.034, 0.048, h, -0.35, 0, 0);
    K.B(0, 0.08, -0.064, 0.145, 0.23, 0.05, h);
    for (const sx of [1, -1]) K.B(sx * 0.074, 0.12, -0.022, 0.02, 0.15, 0.09, h);
  },
  // torso (shirt), relative to waist joint
  _acTorso(A, c, hi) {
    const K = this._acKit(A, hi);
    const t = c.top;
    K.C(0, 0.11, 0, 0.164, 0.22, 0.111, 0.9, t);
    K.C(0, 0.295, 0.004, 0.152, 0.15, 0.104, 1.08, t);
    K.S(0, 0.362, -0.004, 0.168, 0.052, 0.1, t);
    if (hi !== 'lo') K.S(0, 0.384, -0.014, 0.1, 0.048, 0.07, t);
    K.C(0, 0.015, 0, 0.152, 0.03, 0.103, 1.0, this._shade(t, 0.96));
    if (hi === true) {
      const cl = c.collar || this._shade(t, 0.85);
      K.C(0, 0.41, -0.004, 0.064, 0.034, 0.058, 1.12, cl, 0, 0, 0, 16, true);
      K.B(0.028, 0.396, 0.066, 0.056, 0.011, 0.042, cl, 0.5, 0.45, 0.15);
      K.B(-0.028, 0.396, 0.066, 0.056, 0.011, 0.042, cl, 0.5, -0.45, -0.15);
      K.B(0, 0.335, 0.1045, 0.026, 0.1, 0.007, cl, -0.14, 0, 0);
      K.S(0, 0.357, 0.103, 0.0042, 0.0042, 0.003, '#F2F2F2');
      K.S(0, 0.318, 0.108, 0.0042, 0.0042, 0.003, '#F2F2F2');
      if (c.collar) {
        K.B(0.078, 0.262, 0.1135, 0.058, 0.03, 0.006, '#FFFFFF', -0.06, 0.2, 0);
        K.B(0.078, 0.267, 0.1166, 0.044, 0.0055, 0.002, '#2F7D4F', -0.06, 0.2, 0);
        K.B(0.078, 0.256, 0.1166, 0.034, 0.0038, 0.002, '#8A8A8A', -0.06, 0.2, 0);
      }
    }
  },
  // hips / trousers + belt, relative to hips joint
  _acPelvis(A, c, hi) {
    const K = this._acKit(A, hi);
    const b = c.bottom;
    K.C(0, 0.04, 0, 0.152, 0.2, 0.104, 0.95, b);
    K.S(0, -0.045, -0.006, 0.112, 0.058, 0.086, b);
    for (const sx of [1, -1]) K.S(sx * 0.088, -0.035, 0, 0.083, 0.085, 0.086, b);
    if (hi === true) {
      K.C(0, 0.12, 0, 0.156, 0.03, 0.107, 1.0, '#2A2420');
      K.B(0, 0.12, 0.107, 0.036, 0.024, 0.008, '#B9BDC0');
      for (const sx of [1, -1]) K.B(sx * 0.118, 0.065, 0.062, 0.004, 0.07, 0.03, this._shade(b, 0.82), 0, sx * 0.5, 0);
    }
  },
  _acUpperArm(A, c, hi) {
    if (c.longSleeve || c.coat) {
      const K = this._acKit(A, hi);
      K.S(0, -0.012, 0, 0.057, 0.06, 0.057, c.sleeve);
      K.L(0, -0.012, 0, 0.28, 0.054, 0.052, 0.8, c.sleeve);
    } else {
      this._acSleeve(A, c, hi);
      this._acArmBare(A, c, hi);
    }
  },
  _acSleeve(A, c, hi) {
    const K = this._acKit(A, hi);
    K.S(0, -0.012, 0, 0.057, 0.06, 0.057, c.sleeve);
    K.L(0, -0.012, 0, 0.15, 0.054, 0.053, 0.95, c.sleeve);
    if (hi === true) K.C(0, -0.157, 0, 0.0525, 0.014, 0.0515, 1.0, this._shade(c.sleeve, 0.9));
  },
  _acArmBare(A, c, hi) {
    const K = this._acKit(A, hi);
    K.L(0, -0.11, 0, 0.185, 0.047, 0.045, 0.86, c.skin);
  },
  _acForearm(A, c, hi) {
    const K = this._acKit(A, hi);
    if (hi !== 'lo') K.S(0, 0, 0, 0.041, 0.043, 0.041, c.fore);
    K.L(0, 0, 0, 0.255, 0.042, 0.04, 0.74, c.fore);
    if (c.longSleeve && hi) K.C(0, -0.235, 0, 0.033, 0.03, 0.032, 1.0, this._shade(c.fore, 0.92));
    if (c.longSleeve && !hi) K.L(0, -0.225, 0, 0.03, 0.03, 0.028, 1.0, c.skin);
  },
  _acHand(A, c, hi, side) {
    const K = this._acKit(A, hi);
    const sk = c.skin;
    const sx = side === 'R' ? -1 : 1;
    if (hi === true) {
      K.B(0, -0.045, 0.004, 0.026, 0.085, 0.075, sk);
      for (let i = 0; i < 4; i++) {
        const z = 0.028 - i * 0.0185;
        const len = [0.068, 0.075, 0.071, 0.058][i];
        K.B(-sx * 0.002, -0.088 - len / 2 + 0.006, z, 0.017, len, 0.0165, sk, 0.12, 0, sx * 0.05);
      }
      K.B(-sx * 0.012, -0.05, 0.05, 0.018, 0.058, 0.019, sk, -0.5, 0, sx * 0.35);
    } else {
      K.B(0, -0.06, 0.004, 0.028, 0.12, 0.072, sk);
      K.B(-sx * 0.01, -0.05, 0.045, 0.018, 0.05, 0.018, sk, -0.5, 0, 0);
    }
  },
  _acShorts(A, c, hi) { const K = this._acKit(A, hi); K.L(0, 0.01, 0, 0.25, 0.083, 0.086, 0.86, c.bottom); },
  _acThighBare(A, c, hi) { const K = this._acKit(A, hi); K.L(0, -0.22, 0, 0.2, 0.066, 0.068, 0.85, c.skin); },
  // right-hand variants for the guide: 'point' (index finger) and 'thumb' (thumbs-up fist)
  _acHandPose(A, c, kind) {
    const K = this._acKit(A, true);
    const sk = c.skin;
    K.B(0, -0.045, 0.004, 0.026, 0.085, 0.075, sk);
    K.B(0.002, -0.1, -0.006, 0.034, 0.04, 0.062, sk, 0.2, 0, 0);
    if (kind === 'point') {
      K.B(0.002, -0.128, 0.03, 0.017, 0.085, 0.0165, sk, 0.06, 0, 0);
      K.B(0.012, -0.06, 0.05, 0.018, 0.05, 0.019, sk, -0.7, 0, -0.3);
    } else {
      K.B(0.004, -0.06, 0.052, 0.019, 0.019, 0.05, sk, 0, 0, 0);
      K.B(0.004, -0.04, 0.075, 0.019, 0.06, 0.019, sk, 0.15, 0, 0);
    }
  },
  _acThigh(A, c, hi) {
    const K = this._acKit(A, hi);
    if (c.shorts) {
      this._acShorts(A, c, hi);
      this._acThighBare(A, c, hi);
    } else if (c.skirt) {
      K.L(0, 0, 0, 0.42, 0.07, 0.072, 0.76, c.skin);
    } else {
      K.L(0, 0.01, 0, 0.43, 0.083, 0.086, 0.72, c.bottom);
    }
  },
  _acShin(A, c, hi) {
    const K = this._acKit(A, hi);
    const col = c.shin;
    if (hi !== 'lo') K.S(0, 0, 0.004, 0.058, 0.06, 0.06, col);
    K.L(0, 0, 0, 0.41, 0.058, 0.059, 0.74, col);
    if (hi && col === c.bottom) K.C(0, -0.385, 0, 0.05, 0.05, 0.051, 1.02, this._shade(col, 0.92));
  },
  _acShoe(A, c, hi) {
    const K = this._acKit(A, hi);
    const s = c.shoe;
    if (hi === true) K.C(0, -0.012, 0, 0.042, 0.05, 0.042, 1.0, c.shin === c.skin ? c.skin : '#1E1B19');
    K.B(0, -0.047, 0.045, 0.094, 0.066, 0.235, s);
    if (hi !== 'lo') K.S(0, -0.047, 0.155, 0.047, 0.033, 0.05, s);
    K.B(0, -0.075, 0.048, 0.1, 0.011, 0.25, this._shade(s, 0.55));
    if (hi === true) K.B(0, -0.018, 0.09, 0.05, 0.012, 0.08, this._shade(s, 1.25), -0.25, 0, 0);
  },
  _acSkirt(A, c, hi) {
    const K = this._acKit(A, hi);
    K.C(0, -0.17, 0, 0.158, 0.48, 0.112, 1.35, c.bottom, 0, 0, 0, hi === true ? 18 : 10, true);
  },
  _acHat(A, hi) {
    const K = this._acKit(A, hi);
    K.K(0, 0.27, 0.005, 0.27, 0.13, 0.27, '#D9C48E', 0, 0, 0, hi === true ? 20 : 12);
    K.C(0, 0.213, 0.005, 0.24, 0.012, 0.24, 1.0, '#BFA56B', 0, 0, 0, hi === true ? 20 : 12);
    K.C(0, 0.23, 0.005, 0.085, 0.04, 0.09, 1.0, '#8E7A4A');
  },
  _acHelmet(A, hi, col) {
    const K = this._acKit(A, hi);
    K.H(0, 0.185, 0.008, 0.103, 0.092, 0.118, col || '#F4F4F0');
    K.C(0, 0.187, 0.02, 0.112, 0.012, 0.142, 1.0, col || '#F4F4F0');
    K.B(0, 0.268, 0.008, 0.024, 0.016, 0.2, this._shade(col || '#F4F4F0', 0.92));
  },
  _acCoat(A, hi) {
    const K = this._acKit(A, hi);
    const w = '#F6F6F3';
    K.C(0, 0.17, 0, 0.183, 0.38, 0.124, 0.9, w, 0, 0, 0, hi === true ? 18 : 10, true);
    K.C(0, -0.2, 0, 0.17, 0.4, 0.12, 1.22, w, 0, 0, 0, hi === true ? 18 : 10, true);
    K.S(0, 0.35, 0, 0.205, 0.07, 0.125, w);
    K.B(0.05, 0.31, 0.122, 0.05, 0.12, 0.01, this._shade(w, 0.92), -0.1, 0, 0.3);
    K.B(-0.05, 0.31, 0.122, 0.05, 0.12, 0.01, this._shade(w, 0.92), -0.1, 0, -0.3);
  },
  _acApron(A, hi, col) {
    const K = this._acKit(A, hi);
    K.B(0, 0.02, 0.118, 0.27, 0.62, 0.01, col, -0.04, 0, 0);
    K.B(0, 0.33, 0.112, 0.16, 0.06, 0.008, col);
    for (const sx of [1, -1]) K.B(sx * 0.07, 0.4, 0.06, 0.02, 0.1, 0.1, col, -0.6, 0, 0);
  },
  _acUmbrella(A, hi, col) {
    const K = this._acKit(A, hi);
    // pole bottom held in front of the right shoulder; canopy above the head
    K.C(-0.12, 1.55, 0.2, 0.009, 0.9, 0.009, 1.0, '#3A3A3A', 0, 0, 0, 6);
    K.K(-0.12, 2.12, 0.2, 0.56, 0.24, 0.56, col, 0, 0, 0, hi === true ? 16 : 8);
    K.S(-0.12, 2.25, 0.2, 0.015, 0.03, 0.015, '#3A3A3A');
  },
  _acTablet(A) {
    const K = this._acKit(A, true);
    K.B(0, -0.135, 0.045, 0.012, 0.25, 0.175, '#2E3A44', 0, 0, 0);
    K.B(0.0068, -0.135, 0.045, 0.002, 0.225, 0.152, '#9FD3E8', 0, 0, 0);
    K.B(0.0072, -0.08, 0.03, 0.001, 0.04, 0.09, '#5FA8C8', 0, 0, 0);
    K.B(0.0072, -0.17, 0.06, 0.001, 0.07, 0.11, '#E9F5F9', 0, 0, 0);
  },
  _acVest(A) {
    const K = this._acKit(A, true);
    const v = '#D7F23C', s = '#D0D4D8';
    K.C(0, 0.19, 0, 0.184, 0.33, 0.124, 0.88, v, 0, 0, 0, 18, true);
    K.C(0, 0.1, 0, 0.17, 0.035, 0.122, 1.0, s, 0, 0, 0, 18, true);
    K.C(0, 0.2, 0, 0.181, 0.035, 0.128, 1.0, s, 0, 0, 0, 18, true);
    for (const sx of [1, -1]) {
      K.B(sx * 0.1, 0.36, 0, 0.06, 0.02, 0.24, v);
      K.B(sx * 0.07, 0.28, 0.122, 0.022, 0.16, 0.008, s, -0.15, 0, 0);
      K.B(sx * 0.07, 0.28, -0.122, 0.022, 0.16, 0.008, s, 0.15, 0, 0);
    }
  },

  // =============================================================== RIG / POSE
  _acRig(k) {
    const T = this._E.T;
    const G = () => new T.Group();
    const r = { root: G(), hips: G(), torso: G(), neck: G(), shL: G(), shR: G(), elL: G(), elR: G(), wrL: G(), wrR: G(), hipL: G(), hipR: G(), knL: G(), knR: G(), anL: G(), anR: G() };
    r.root.add(r.hips); r.hips.position.set(0, 0.91, 0);
    r.hips.add(r.torso); r.torso.position.set(0, 0.11, 0);
    r.torso.add(r.neck); r.neck.position.set(0, 0.418, 0); r.neck.rotation.order = 'YXZ';
    for (const s of ['L', 'R']) {
      const sx = s === 'L' ? 1 : -1;
      const sh = r['sh' + s], el = r['el' + s], wr = r['wr' + s], hp = r['hip' + s], kn = r['kn' + s], an = r['an' + s];
      r.torso.add(sh); sh.position.set(0.17 * sx, 0.358, 0); sh.rotation.order = 'YXZ';
      sh.add(el); el.position.set(0, -0.29, 0);
      el.add(wr); wr.position.set(0, -0.255, 0);
      r.hips.add(hp); hp.position.set(0.088 * sx, 0, 0);
      hp.add(kn); kn.position.set(0, -0.42, 0);
      kn.add(an); an.position.set(0, -0.41, 0);
    }
    r.root.scale.setScalar(k || 1);
    return r;
  },
  _acKeys() {
    return ['hy', 'hx', 'hyr', 'hzr', 'tx', 'ty', 'tz', 'nx', 'ny', 'nz', 'sLx', 'sLy', 'sLz', 'sRx', 'sRy', 'sRz', 'eL', 'eR', 'wLx', 'wLy', 'wLz', 'wRx', 'wRy', 'wRz', 'lLx', 'lLz', 'lRx', 'lRz', 'kL', 'kR', 'aL', 'aR'];
  },
  _acZero() { const o = {}; for (const k of this._acKeys()) o[k] = 0; return o; },
  _acApply(r, a) {
    r.hips.position.y = 0.91 + a.hy;
    r.hips.rotation.set(a.hx, a.hyr, a.hzr);
    r.torso.rotation.set(a.tx, a.ty, a.tz);
    r.neck.rotation.set(a.nx, a.ny, a.nz);
    r.shL.rotation.set(a.sLx, a.sLy, a.sLz);
    r.shR.rotation.set(a.sRx, a.sRy, a.sRz);
    r.elL.rotation.set(a.eL, 0, 0);
    r.elR.rotation.set(a.eR, 0, 0);
    r.wrL.rotation.set(a.wLx, a.wLy, a.wLz);
    r.wrR.rotation.set(a.wRx, a.wRy, a.wRz);
    r.hipL.rotation.set(a.lLx, 0, a.lLz);
    r.hipR.rotation.set(a.lRx, 0, a.lRz);
    r.knL.rotation.set(a.kL, 0, 0);
    r.knR.rotation.set(a.kR, 0, 0);
    r.anL.rotation.set(a.aL, 0, 0);
    r.anR.rotation.set(a.aR, 0, 0);
  },
  // distance covered per gait cycle (two steps) at speed v
  _acCycleD(v) { return Math.min(2.2, Math.max(0.6, 0.5 + 0.55 * v)); },
  // gait with 2-bone leg IK: planted foot moves back exactly at body speed (no sliding), hip height vaults over the stance leg
  _acGait(ph, v, o, w) {
    const D = this._acCycleD(v);
    const beta = v > 2.8 ? 0.45 : 0.6;
    const S = beta * D;
    const a = 0.42, b = 0.41, AY = 0.08, REACH = (a + b) * 0.996;
    const legT = (p) => {
      p -= Math.floor(p);
      if (p < beta) { const u = p / beta; return { zf: S / 2 - S * u, ly: 0, st: true, u: u }; }
      const u = (p - beta) / (1 - beta);
      const e = u * u * (3 - 2 * u);
      return { zf: -S / 2 + S * e, ly: Math.sin(Math.PI * u) * (0.022 + 0.02 * Math.min(1.6, v)), st: false, u: u };
    };
    const Lf = legT(ph), Rf = legT(ph + 0.5);
    const hmax = (f) => AY + Math.sqrt(Math.max(0.01, REACH * REACH - f.zf * f.zf));
    let H = 0.91 - 0.008 - 0.012 * Math.min(2, v);
    if (Lf.st) H = Math.min(H, hmax(Lf));
    if (Rf.st) H = Math.min(H, hmax(Rf));
    const ik = (f) => {
      const tz = f.zf, ty = -(H - AY - f.ly);
      let d = Math.hypot(tz, ty);
      if (d > REACH) d = REACH;
      const kappa = Math.PI - Math.acos(Math.max(-1, Math.min(1, (a * a + b * b - d * d) / (2 * a * b))));
      const phi = Math.atan2(tz, -ty);
      const alpha = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
      const hip = -(phi + alpha);
      const toe = f.st ? (f.u > 0.82 ? -0.35 * (f.u - 0.82) / 0.18 : 0) : 0.18 * Math.sin(Math.PI * f.u) - 0.08;
      return { hip: hip, knee: kappa, ankle: -(hip + kappa) - toe * 0 + toe };
    };
    const L = ik(Lf), R = ik(Rf);
    const sw = Math.min(1, v / 1.3);
    o.lLx += w * L.hip; o.kL += w * L.knee; o.aL += w * L.ankle;
    o.lRx += w * R.hip; o.kR += w * R.knee; o.aR += w * R.ankle;
    o.hy += w * (H - 0.91);
    const c = Math.sin(ph * Math.PI * 2);
    o.hyr += w * 0.08 * c * sw;
    o.hzr += w * 0.03 * c * sw;
    o.tx += w * (0.03 + 0.03 * Math.min(2.5, v));
    o.ty += w * -0.1 * c * sw;
    o.nx += w * -0.02 * Math.min(2.5, v);
    o.ny += w * 0.045 * c * sw;
    // arms swing opposite to the legs
    const amp = 0.32 * sw + 0.1 * Math.max(0, Math.min(1, v - 1.3));
    o.armSwL = -w * amp * (Rf.zf / (S / 2));
    o.armSwR = -w * amp * (Lf.zf / (S / 2));
    return o;
  },
  // compute a target pose; s = {speed, mode, ph, t, seed, w (loco weight), umb, holdL (tablet)}
  _acPose(s, o) {
    for (const k of this._acKeys()) o[k] = 0;
    const t = s.t, sd = s.seed || 0;
    const w = s.w;
    // idle base
    const sway = Math.sin(t * 0.37 + sd);
    o.hzr = 0.028 * sway * (1 - w);
    o.hy = -0.008 * (1 - w);
    o.kL = (0.05 + 0.05 * Math.max(0, sway)) * (1 - w);
    o.kR = (0.05 + 0.05 * Math.max(0, -sway)) * (1 - w);
    o.aL = -o.kL * 0.9; o.aR = -o.kR * 0.9;
    o.lLx = -o.kL * 0.4; o.lRx = -o.kR * 0.4;
    o.lLz = 0.035 * (1 - w); o.lRz = -0.035 * (1 - w);
    o.tx = 0.012 * Math.sin(t * 1.55 + sd) * (1 - w);
    o.ny = (0.22 * Math.sin(t * 0.21 + sd * 3.1) * Math.max(0, Math.sin(t * 0.13 + sd))) * (1 - w);
    o.nx = 0.02 * Math.sin(t * 0.29 + sd);
    this._acGait(s.ph, s.speed, o, w);
    // arms: base hang + swing
    const swingL = o.armSwL || 0, swingR = o.armSwR || 0;
    let A = { sLx: 0.03 + swingL, sLy: 0, sLz: 0.075, eL: -0.13 - 0.2 * w - 0.12 * Math.max(0, -swingL), wLx: 0, wLy: 0, wLz: 0,
      sRx: 0.03 + swingR, sRy: 0, sRz: -0.075, eR: -0.13 - 0.2 * w - 0.12 * Math.max(0, -swingR), wRx: 0, wRy: 0, wRz: 0 };
    if (s.holdL) { A.sLx = -0.12 + swingL * 0.35; A.eL = -0.62 + 0.08 * Math.sin(t * 0.8); A.sLz = 0.1; A.wLx = -0.1; }
    if (s.umb) { A.sRx = -0.62; A.sRz = 0.24; A.sRy = 0.1; A.eR = -1.62; A.wRx = 0.2; }
    // gestures
    const m = s.mode;
    const G = {};
    if (m === 'chat') {
      // relaxed conversation: one hand gestures at chest height, the other hangs loose; small nods and head tilts
      const q = Math.sin(t * 1.7 + sd), q2 = Math.sin(t * 0.9 + sd * 2.3);
      const gs = -0.26 + 0.09 * q, ge = -0.9 + 0.22 * Math.sin(t * 2.3 + 1 + sd), gy = 0.12 * q2;
      if (((sd * 10) | 0) % 2 === 1) Object.assign(G, { sLx: gs, sLy: -gy, sLz: 0.12, eL: ge, wLx: 0.12 * q, wLy: 0, wLz: 0, sRx: 0.04, sRy: 0, sRz: -0.07, eR: -0.2, wRx: 0, wRy: 0, wRz: 0 });
      else Object.assign(G, { sLx: 0.04, sLy: 0, sLz: 0.07, eL: -0.2, wLx: 0, wLy: 0, wLz: 0, sRx: gs, sRy: gy, sRz: -0.12, eR: ge, wRx: 0.12 * q, wRy: 0, wRz: 0 });
      o.nx += 0.04 * Math.sin(t * 2.1 + sd);
      o.nz += 0.03 * q2;
    } else if (m === 'talk') {
      const amp = 1;
      Object.assign(G, {
        sLx: s.holdL ? -0.3 : -0.12, sLy: 0, sLz: s.holdL ? 0.16 : 0.09, eL: s.holdL ? -1.62 : -0.5, wLx: s.holdL ? 0.1 : 0, wLy: s.holdL ? -1.2 : 0, wLz: 0,
        sRx: -0.42 + 0.17 * Math.sin(t * 2.1 + sd) * amp, sRy: 0.18 * Math.sin(t * 0.9) * amp, sRz: -0.2 + 0.1 * Math.sin(t * 1.3) * amp,
        eR: -1.1 + 0.35 * Math.sin(t * 2.6 + 1) * amp, wRx: 0.25 * Math.sin(t * 3.1) * amp, wRz: -0.15
      });
      o.nx += 0.045 * Math.sin(t * 2.4) * amp;
      o.nz += 0.035 * Math.sin(t * 0.8 + sd) * amp;
    } else if (m === 'point') {
      Object.assign(G, { sLx: -0.3, sLy: 0, sLz: 0.16, eL: -1.62, wLx: 0.1, wLy: -1.2, wLz: 0, sRx: s.pX != null ? s.pX + 0.12 : -1.25, sRy: s.pY != null ? s.pY : -0.35, sRz: 0, eR: -0.24, wRx: -0.05, wRy: 0, wRz: 0 });
    } else if (m === 'cheer') {
      const b = Math.abs(Math.sin(t * 5.5));
      Object.assign(G, { sLx: -0.2, sLy: 0, sLz: 0.12, eL: -0.75, wLx: 0, wLz: 0, sRx: -0.72, sRy: 0.32, sRz: -0.42, eR: -1.82 + 0.15 * b, wRx: -0.15, wRz: -0.4 });
      o.hy += 0.012 * b;
      o.nx += 0.05 * Math.sin(t * 5.5);
    } else if (m === 'think') {
      Object.assign(G, { sLx: -0.3, sLy: 0, sLz: -0.22, eL: -1.5, wLx: 0.1, wLz: 0, sRx: -0.62, sRy: -0.42, sRz: 0.3, eR: -2.28, wRx: 0.3, wRz: 0.2 });
      o.nz += 0.12; o.nx += 0.06 + 0.02 * Math.sin(t * 0.7);
      o.ny += 0.12 * Math.sin(t * 0.4);
    } else if (m === 'wave') {
      const q = Math.sin(t * 7.5);
      Object.assign(G, { sLx: s.holdL ? -0.12 : 0.03, sLy: 0, sLz: 0.1, eL: s.holdL ? -0.62 : -0.15, wLx: 0, wLz: 0, sRx: -1.82, sRy: -1.45, sRz: 0, eR: -1.3 + 0.32 * q, wRx: 0.1 * q, wRy: 0, wRz: 0 });
      o.nz += 0.06;
    } else if (m === 'work') {
      const q = Math.sin(t * 3.2 + sd);
      Object.assign(G, { sLx: -0.85 + 0.12 * q, sLy: 0.2, sLz: -0.08, eL: -0.72 - 0.1 * q, wLx: 0.2, wLz: 0, sRx: -0.8 - 0.12 * q, sRy: -0.2, sRz: 0.08, eR: -0.75 + 0.1 * q, wRx: 0.2, wRz: 0 });
      o.tx += 0.16; o.nx += 0.18;
    }
    const g = s.g;
    for (const k of ['sLx', 'sLy', 'sLz', 'eL', 'wLx', 'wLy', 'wLz', 'sRx', 'sRy', 'sRz', 'eR', 'wRx', 'wRy', 'wRz']) {
      const base = A[k];
      o[k] = G[k] != null ? base + (G[k] - base) * g : base;
    }
    // sitting overrides legs/hips
    if (m === 'sit') {
      o.hy = -0.44; o.lLx = -1.45; o.lRx = -1.42; o.kL = 1.42; o.kR = 1.45; o.aL = 0.02; o.aR = 0.0;
      o.lLz = 0.06; o.lRz = -0.06; o.tx = 0.06 + 0.01 * Math.sin(t * 1.5 + sd);
      o.sLx = -0.5; o.sRx = -0.5; o.eL = -0.62; o.eR = -0.62; o.sLz = 0.05; o.sRz = -0.05;
      if (s.chatty) { o.eR = -1.0 + 0.3 * Math.sin(t * 2.3); o.sRx = -0.6; }
      o.hzr = 0; o.hyr = 0;
    }
    if (s.lookYaw != null) { o.ny = s.lookYaw; o.nx += s.lookPitch || 0; }
    return o;
  },

  // =============================================================== PERSON (articulated meshes)
  _mkPerson(o) {
    o = o || {};
    const E = this._E;
    const hi = o.outfit === 'guide' || !!o.hi;
    const h = o.h || (o.outfit === 'guide' ? 1.72 : 1.66);
    const k = h / 1.72;
    const c = this._acPalette(o);
    const r = this._acRig(k);
    const gmat = o.outfit === 'guide' ? this._acGuideMat() : null;
    const recv = o.recv != null ? !!o.recv : o.outfit !== 'guide';
    const mk = (fn, parent) => { const m = this._bakeMesh((A) => fn(A), { parent: parent, mat: gmat || undefined }); m.receiveShadow = recv; return m; };
    mk((A) => this._acHead(A, c, hi), r.neck);
    if (c.hairLong) mk((A) => this._acHairLong(A, c, hi), r.neck); else mk((A) => this._acHairShort(A, c, hi), r.neck);
    mk((A) => this._acTorso(A, c, hi), r.torso);
    mk((A) => this._acPelvis(A, c, hi), r.hips);
    for (const s of ['L', 'R']) {
      mk((A) => this._acUpperArm(A, c, hi), r['sh' + s]);
      mk((A) => this._acForearm(A, c, hi), r['el' + s]);
      mk((A) => this._acHand(A, c, hi, s), r['wr' + s]);
      mk((A) => this._acThigh(A, c, hi), r['hip' + s]);
      mk((A) => this._acShin(A, c, hi), r['kn' + s]);
      mk((A) => this._acShoe(A, c, hi), r['an' + s]);
    }
    const P = { root: r.root, rig: r, o: o, c: c, k: k, ang: this._acZero(), tgt: this._acZero(), ph: 0, w: 0, g: 0, gm: 'idle', t: 0, seed: (o.seed || 1) * 1.37, extra: {} };
    if (c.skirt) mk((A) => this._acSkirt(A, c, hi), r.hips);
    if (c.hat) mk((A) => this._acHat(A, hi), r.neck);
    if (c.helmet) mk((A) => this._acHelmet(A, hi, c.helmet), r.neck);
    if (c.coat) mk((A) => this._acCoat(A, hi), r.torso);
    if (c.apron) mk((A) => this._acApron(A, hi, c.apron), r.torso);
    if (o.outfit === 'guide') {
      P.extra.tablet = mk((A) => this._acTablet(A), r.wrL);
      P.extra.helmet = mk((A) => this._acHelmet(A, true, '#F4F4F0'), r.neck);
      P.extra.vest = mk((A) => this._acVest(A), r.torso);
      P.extra.handOpen = r.wrR.children[r.wrR.children.length - 1];
      P.extra.handPoint = mk((A) => this._acHandPose(A, c, 'point'), r.wrR);
      P.extra.handThumb = mk((A) => this._acHandPose(A, c, 'thumb'), r.wrR);
      P.extra.handPoint.visible = false;
      P.extra.handThumb.visible = false;
      P.extra.helmet.visible = false;
      P.extra.vest.visible = false;
      P.holdL = true;
    }
    if (o.add !== false) E.scene.add(r.root);
    return P;
  },

  // own material for the guide: no shadow-map self-acne on the face; dimmed indoors instead
  _acGuideMat() {
    const E = this._E;
    if (!E.acMatG) E.acMatG = new E.T.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0 });
    return E.acMatG;
  },
  // s = { speed, mode, lookAt: Vector3|null, pointAt: Vector3|null }
  _posePerson(P, dt, s) {
    const E = this._E;
    const T = E.T;
    s = s || {};
    const v = Math.max(0, s.speed || 0);
    P.t += dt;
    P.ph = (P.ph + (v * dt) / this._acCycleD(v)) % 1;
    const wantW = v > 0.06 ? 1 : 0;
    P.w += (wantW - P.w) * (1 - Math.exp(-dt * (wantW ? 9 : 6)));
    if (P.w < 0.002) P.w = 0;
    let mode = s.mode || 'idle';
    if (mode === 'walk') mode = 'idle';
    const gestural = ['talk', 'chat', 'point', 'cheer', 'think', 'wave', 'work'].indexOf(mode) >= 0;
    if (gestural) P.gm = mode;
    P.g += ((gestural ? 1 : 0) - P.g) * (1 - Math.exp(-dt * 6));
    const r = P.rig;
    const st = { speed: v, mode: gestural ? P.gm : (P.g > 0.02 ? P.gm : mode), ph: P.ph, t: P.t, seed: P.seed, w: P.w, g: P.g, holdL: !!P.holdL, umb: !!s.umb };
    if (mode === 'sit') st.mode = 'sit';
    // pointing: solve shoulder angles toward world point in torso space
    if (s.pointAt && (mode === 'point' || P.gm === 'point')) {
      if (!E._acTmpV) { E._acTmpV = new T.Vector3(); E._acTmpQ = new T.Quaternion(); E._acTmpV2 = new T.Vector3(); }
      r.shR.getWorldPosition(E._acTmpV);
      r.torso.getWorldQuaternion(E._acTmpQ).invert();
      const d = E._acTmpV2.copy(s.pointAt).sub(E._acTmpV).normalize().applyQuaternion(E._acTmpQ);
      const al = Math.min(1.68, Math.acos(this._cl(-d.y, -1, 1)));
      const ps = this._cl(Math.atan2(d.x, d.z), -1.7, 0.6);
      st.pX = -al; st.pY = ps;
    }
    // look at a point (head yaw/pitch relative to body)
    if (s.lookAt) {
      if (!E._acTmpH) E._acTmpH = new T.Vector3();
      r.neck.getWorldPosition(E._acTmpH);
      const dx = s.lookAt.x - E._acTmpH.x, dy = s.lookAt.y - E._acTmpH.y - 0.15, dz = s.lookAt.z - E._acTmpH.z;
      let rel = Math.atan2(dx, dz) - r.root.rotation.y;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;
      st.lookYaw = this._cl(rel, -1.15, 1.15);
      st.lookPitch = this._cl(-Math.atan2(dy, Math.hypot(dx, dz)), -0.45, 0.5);
    }
    this._acPose(st, P.tgt);
    // blend (legs follow directly while walking to keep feet planted)
    const kk = 1 - Math.exp(-dt * 11);
    const legKeys = { hy: 1, lLx: 1, lRx: 1, kL: 1, kR: 1, aL: 1, aR: 1 };
    for (const k of this._acKeys()) {
      if (P.w > 0.5 && legKeys[k] && mode !== 'sit') P.ang[k] = P.tgt[k];
      else P.ang[k] += (P.tgt[k] - P.ang[k]) * kk;
    }
    this._acApply(r, P.ang);
    const X = P.extra;
    if (X.handPoint) {
      const pt = P.gm === 'point' && P.g > 0.45, th = P.gm === 'cheer' && P.g > 0.45;
      X.handPoint.visible = pt; X.handThumb.visible = th; X.handOpen.visible = !pt && !th;
    }
  },

  // =============================================================== GUIDE (พี่กล้า)
  _initGuide() {
    const E = this._E;
    const T = E.T;
    const P = this._mkPerson({ outfit: 'guide', seed: 7, h: 1.72 });
    const gs = E.gateSpot && E.gateSpot.guide;
    E.guide = { P: P, pos: new T.Vector3(gs ? gs[0] : 0, 0, gs ? gs[1] : 0), yaw: 0, mode: 'idle', speed: 0, lookAt: null, pointAt: null, helmet: false, visible: true, y: null };
    P.root.position.copy(E.guide.pos);
    return E.guide;
  },
  _tickGuide(dt) {
    const E = this._E;
    const G = E.guide;
    if (!G || !G.P) return;
    const P = G.P;
    P.root.visible = G.visible !== false;
    if (!P.root.visible) return;
    const y = G.y != null ? G.y : window.GHG3L.H(G.pos.x, G.pos.z);
    P.root.position.set(G.pos.x, y, G.pos.z);
    P.root.rotation.y = G.yaw || 0;
    if (P.extra.helmet.visible !== !!G.helmet) { P.extra.helmet.visible = !!G.helmet; P.extra.vest.visible = !!G.helmet; }
    // the guide does not receive shadow-map shadows (clean face); fake it indoors / under roofs
    const shade = G.shade != null ? G.shade : (E.insideObj ? 0.6 : 1);
    G._sh = G._sh == null ? shade : G._sh + (shade - G._sh) * (1 - Math.exp(-dt * 4));
    if (E.acMatG) E.acMatG.color.setScalar(G._sh);
    // rain: the guide keeps his tablet; no umbrella (he wears the helmet indoors only)
    this._posePerson(P, dt, { speed: G.speed || 0, mode: G.mode || 'idle', lookAt: G.lookAt, pointAt: G.pointAt });
  },

  // =============================================================== CROWD (instanced)
  _acDefaultLoops() {
    const L = window.GHG3L;
    const out = [];
    for (const r of L.roads) {
      if (!r.side) continue;
      const horiz = r.a[1] === r.b[1];
      const off = r.w / 2 + r.side / 2;
      if (horiz) {
        const x0 = Math.max(-610, Math.min(r.a[0], r.b[0])), x1 = Math.min(550, Math.max(r.a[0], r.b[0]));
        for (const s of [-1, 1]) out.push({ pts: [[x0, r.a[1] + s * off], [x1, r.a[1] + s * off]], closed: false, y: 0.15 });
      } else {
        const z0 = Math.max(-450, Math.min(r.a[1], r.b[1])), z1 = Math.min(450, Math.max(r.a[1], r.b[1]));
        for (const s of [-1, 1]) out.push({ pts: [[r.a[0] + s * off, z0], [r.a[0] + s * off, z1]], closed: false, y: 0.15 });
      }
    }
    return out;
  },
  _acCrowdParts() {
    const W = '#FFFFFF';
    const cw = { skin: W, hair: W, top: W, sleeve: W, fore: W, bottom: W, shin: W, shoe: W, eye: '#2B1D14', sclera: '#F2EEE8', lip: '#A0605A' };
    const bk = (fn) => this._bake((A) => fn(A));
    const legBottom = Object.assign({}, cw, { shorts: false, skirt: false });
    return [
      { k: 'head', j: ['neck'], geo: bk((A) => this._acHead(A, cw, 'lo')), col: (p) => p.c.skin },
      { k: 'hair', j: ['neck'], geo: bk((A) => this._acHairShort(A, cw, 'lo')), col: (p) => p.c.hair, when: (p) => !p.c.hairLong && !p.c.hat },
      { k: 'hairL', j: ['neck'], geo: bk((A) => this._acHairLong(A, cw, 'lo')), col: (p) => p.c.hair, when: (p) => p.c.hairLong },
      { k: 'torso', j: ['torso'], geo: bk((A) => this._acTorso(A, cw, 'lo')), col: (p) => p.c.top },
      { k: 'pelvis', j: ['hips'], geo: bk((A) => this._acPelvis(A, cw, 'lo')), col: (p) => p.c.bottom },
      { k: 'uarm', j: ['shL', 'shR'], geo: bk((A) => this._acUpperArm(A, Object.assign({}, cw, { longSleeve: true }), 'lo')), col: (p) => p.c.sleeve, when: (p) => p.c.longSleeve || p.c.coat },
      { k: 'uarmS', j: ['shL', 'shR'], geo: bk((A) => this._acSleeve(A, cw, 'lo')), col: (p) => p.c.sleeve, when: (p) => !p.c.longSleeve && !p.c.coat },
      { k: 'uarmB', j: ['shL', 'shR'], geo: bk((A) => this._acArmBare(A, cw, 'lo')), col: (p) => p.c.skin, when: (p) => !p.c.longSleeve && !p.c.coat },
      { k: 'farm', j: ['elL', 'elR'], geo: bk((A) => this._acForearm(A, cw, 'lo')), col: (p) => p.c.fore },
      { k: 'hand', j: ['wrL', 'wrR'], geo: bk((A) => this._acHand(A, cw, 'lo', 'L')), col: (p) => p.c.skin },
      { k: 'thigh', j: ['hipL', 'hipR'], geo: bk((A) => this._acThigh(A, legBottom, 'lo')), col: (p) => (p.c.skirt ? p.c.skin : p.c.bottom), when: (p) => !p.c.shorts },
      { k: 'thighS', j: ['hipL', 'hipR'], geo: bk((A) => this._acShorts(A, cw, 'lo')), col: (p) => p.c.bottom, when: (p) => p.c.shorts },
      { k: 'thighB', j: ['hipL', 'hipR'], geo: bk((A) => this._acThighBare(A, cw, 'lo')), col: (p) => p.c.skin, when: (p) => p.c.shorts },
      { k: 'shin', j: ['knL', 'knR'], geo: bk((A) => this._acShin(A, legBottom, 'lo')), col: (p) => p.c.shin },
      { k: 'shoe', j: ['anL', 'anR'], geo: bk((A) => this._acShoe(A, cw, 'lo')), col: (p) => p.c.shoe },
      { k: 'skirt', j: ['hips'], geo: bk((A) => this._acSkirt(A, cw, 'lo')), col: (p) => p.c.bottom, when: (p) => p.c.skirt },
      { k: 'hat', j: ['neck'], geo: bk((A) => this._acHat(A, 'lo')), col: () => '#FFFFFF', when: (p) => p.c.hat },
      { k: 'helmet', j: ['neck'], geo: bk((A) => this._acHelmet(A, 'lo', '#FFFFFF')), col: (p) => p.c.helmet || '#F4F4F0', when: (p) => !!p.c.helmet },
      { k: 'coat', j: ['torso'], geo: bk((A) => this._acCoat(A, 'lo')), col: () => '#FFFFFF', when: (p) => p.c.coat },
      { k: 'apron', j: ['torso'], geo: bk((A) => this._acApron(A, 'lo', '#FFFFFF')), col: (p) => p.c.apron || '#FFFFFF', when: (p) => !!p.c.apron },
      { k: 'umb', j: ['root'], geo: bk((A) => this._acUmbrella(A, 'lo', '#FFFFFF')), col: (p) => p.c.umb, when: (p) => p.umbOn }
    ];
  },

  // =============================================================== NEAR-LOD PEOPLE (v0.8.1): smooth lofted bodies, faces and hair
  // tube through elliptical rings [y, rx, rz, cx, cz] (ascending y); o.bot / o.top close the ends (optional dome),
  // o.both adds an inside skin for open hems (sleeves, skirts, trouser legs)
  _acLoftGeo(rings, seg, o) {
    const T = this._E.T;
    o = o || {};
    const pos = [], idx = [];
    const n = rings.length;
    for (const r of rings) {
      for (let j = 0; j < seg; j++) {
        const a = (j / seg) * Math.PI * 2;
        pos.push((r[3] || 0) + Math.sin(a) * r[1], r[0], (r[4] || 0) + Math.cos(a) * r[2]);
      }
    }
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < seg; j++) {
        const a = i * seg + j, b = i * seg + (j + 1) % seg, c = a + seg, d = b + seg;
        idx.push(a, b, c, b, d, c);
      }
    }
    if (o.bot) {
      const r = rings[0], ci = pos.length / 3;
      pos.push(r[3] || 0, r[0] - (o.botDome || 0), r[4] || 0);
      for (let j = 0; j < seg; j++) idx.push(ci, (j + 1) % seg, j);
    }
    if (o.top) {
      const r = rings[n - 1], ci = pos.length / 3, base = (n - 1) * seg;
      pos.push(r[3] || 0, r[0] + (o.topDome || 0), r[4] || 0);
      for (let j = 0; j < seg; j++) idx.push(ci, base + j, base + (j + 1) % seg);
    }
    let g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    if (o.both) {
      const nr = Array.from(g.attributes.normal.array);
      const off = pos.length / 3;
      const idx2 = idx.slice();
      for (let t = 0; t < idx.length; t += 3) idx2.push(idx[t] + off, idx[t + 2] + off, idx[t + 1] + off);
      const g2 = new T.BufferGeometry();
      g2.setAttribute('position', new T.Float32BufferAttribute(pos.concat(pos), 3));
      g2.setAttribute('normal', new T.Float32BufferAttribute(nr.concat(nr.map((v) => -v)), 3));
      g2.setIndex(idx2);
      g.dispose();
      g = g2;
    }
    return g;
  },
  _acNKit(A) {
    const s = this;
    return {
      S: (x, y, z, rx, ry, rz, col, ax, ay, az) => s._acPut(A, s._acGeo('sph:20:14'), x, y, z, rx, ry, rz, ax || 0, ay || 0, az || 0, col),
      C: (x, y, z, r, h, rz, t, col, ax, ay, az, n) => s._acPut(A, s._acGeo('tap:' + t + ':' + (n || 14)), x, y, z, r, h, rz, ax || 0, ay || 0, az || 0, col),
      L: (rings, col, o) => { const g = s._acLoftGeo(rings, (o && o.seg) || 18, o); s._acPut(A, g, 0, 0, 0, 1, 1, 1, 0, 0, 0, col); g.dispose(); }
    };
  },
  // head, neck, ears, nose (skin; neck-joint space)
  _acNHead(A) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    const Z = (x, y) => this._acHeadZ(x, y);
    K.L([[-0.025, 0.055, 0.053, 0, -0.012], [0.04, 0.048, 0.047, 0, -0.008], [0.1, 0.047, 0.047, 0, -0.004]], W, { seg: 16 });
    this._acPut(A, this._acGeo('head:30'), 0, 0, 0, 1, 1, 1, 0, 0, 0, W);
    for (const sx of [1, -1]) {
      K.S(sx * 0.0752, 0.141, -0.006, 0.0105, 0.0255, 0.0175, this._shade(W, 0.94), 0, sx * 0.25, 0);
      K.S(sx * 0.0785, 0.142, -0.004, 0.0048, 0.016, 0.009, this._shade(W, 0.84));
    }
    const zn = Z(0, 0.125);
    K.S(0, 0.128, zn - 0.002, 0.0085, 0.022, 0.0125, W, -0.28, 0, 0);
    K.S(0, 0.111, zn + 0.007, 0.0115, 0.0098, 0.0108, W);
    for (const sx of [1, -1]) K.S(sx * 0.0092, 0.1085, zn + 0.0015, 0.0072, 0.0062, 0.0072, this._shade(W, 0.97));
  },
  // eyes, lids, brows, lips: fixed colours (instance colour stays white)
  _acNFace(A) {
    const K = this._acNKit(A);
    const Z = (x, y) => this._acHeadZ(x, y);
    for (const sx of [1, -1]) {
      const ex = sx * 0.0305, ey = 0.1565, ze = Z(ex, ey);
      K.S(ex, ey, ze - 0.0034, 0.0134, 0.0079, 0.006, '#EFEAE3');
      K.S(ex - sx * 0.0004, ey - 0.0003, ze + 0.0014, 0.0063, 0.0065, 0.0018, '#3B2A1E');
      K.S(ex - sx * 0.0004, ey - 0.0003, ze + 0.0027, 0.0029, 0.003, 0.001, '#0E0A08');
      K.S(ex - sx * 0.0018, ey + 0.0019, ze + 0.0033, 0.0012, 0.0012, 0.0006, '#FFFFFF');
      // upper lash line (thin, follows the top of the eye)
      K.S(ex, ey + 0.0068, ze - 0.0006, 0.0142, 0.0014, 0.0042, '#241912', 0, 0, -sx * 0.05);
      for (let i = 0; i < 3; i++) {
        const t = i / 2;
        const bx = sx * (0.017 + t * 0.029), by = 0.1772 + 0.0042 * Math.sin(Math.PI * t) - 0.0028 * t;
        K.S(bx, by, Z(bx, by) + 0.0007, 0.0104, 0.0021, 0.0032, '#33261D', 0, 0, sx * (0.12 - 0.28 * t));
      }
    }
    K.S(0, 0.0935, Z(0, 0.0935) + 0.0009, 0.0172, 0.0041, 0.0054, '#A4645A');
    K.S(0, 0.0858, Z(0, 0.0858) + 0.0009, 0.0152, 0.0051, 0.006, '#B47268');
    K.S(0, 0.0897, Z(0, 0.0897) + 0.0028, 0.0162, 0.001, 0.0018, '#5A2E27');
  },
  // hair that follows the skull: a cap over the head shape, thicker on top, thinning to the hairline
  _acNHairCap(A, st, col) {
    const T = this._E.T;
    const nT = 16, nP = 32;
    const C = [0, 0.148, 0.008];
    const prm = {
      short: { f: 0.98, s: 1.6, b: 2.15, th: 0.1, top: 0.035 },
      buzz: { f: 0.92, s: 1.5, b: 2.05, th: 0.045, top: 0.012 },
      bob: { f: 1.32, s: 2.02, b: 2.32, th: 0.17, top: 0.04 },
      long: { f: 1.05, s: 1.98, b: 2.28, th: 0.14, top: 0.035 }
    }[st] || { f: 0.98, s: 1.6, b: 2.15, th: 0.1, top: 0.035 };
    const tmax = (ph) => { const c = Math.cos(ph); return c >= 0 ? prm.s + (prm.f - prm.s) * Math.pow(c, 1.4) : prm.s + (prm.b - prm.s) * Math.pow(-c, 1.1); };
    const pos = [], idx = [];
    const pt = (th, ph, tm) => {
      const h = this._acHeadMap(Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph));
      const u = th / tm;
      let k = prm.th * (1 - Math.pow(u, 5)) + 0.018 + prm.top * Math.max(0, 1 - th / 0.9);
      // volume: lifted at the front-top, close-cropped at the sides, a soft side parting
      k += prm.top * 1.2 * Math.max(0, Math.cos(ph)) * Math.max(0, 1 - u * 1.25);
      if (st === 'short' || st === 'buzz') k *= 1 - 0.35 * Math.pow(Math.abs(Math.sin(ph)), 2) * this._sm((u - 0.45) / 0.4);
      k -= 0.02 * Math.exp(-Math.pow((ph - 0.55) / 0.08, 2)) * Math.max(0, 1 - u * 1.6);
      if (st === 'bob' && u > 0.82) k += 0.05 * (u - 0.82) / 0.18;
      // bangs: a soft fringe that keeps some thickness down to the brow line
      if (st === 'bob') k += 0.07 * Math.pow(Math.max(0, Math.cos(ph)), 2) * this._sm((u - 0.55) / 0.4);
      pos.push(C[0] + (h[0] - C[0]) * (1 + k), C[1] + (h[1] - C[1]) * (1 + k), C[2] + (h[2] - C[2]) * (1 + k));
    };
    pt(0, 0, 1);
    for (let i = 1; i <= nT; i++) for (let j = 0; j < nP; j++) { const ph = (j / nP) * Math.PI * 2, tm = tmax(ph); pt((i / nT) * tm, ph, tm); }
    for (let j = 0; j < nP; j++) idx.push(0, 1 + j, 1 + (j + 1) % nP);
    for (let i = 1; i < nT; i++) {
      for (let j = 0; j < nP; j++) {
        const a = 1 + (i - 1) * nP + j, b = 1 + (i - 1) * nP + (j + 1) % nP, c = a + nP, d = b + nP;
        idx.push(a, c, b, b, c, d);
      }
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    this._acPut(A, g, 0, 0, 0, 1, 1, 1, 0, 0, 0, col);
    g.dispose();
  },
  _acNHairDrape(A, col) {
    const K = this._acNKit(A);
    K.L([[-0.11, 0.074, 0.032, 0, -0.07], [-0.04, 0.083, 0.04, 0, -0.072], [0.04, 0.088, 0.046, 0, -0.07], [0.12, 0.083, 0.05, 0, -0.06], [0.17, 0.062, 0.046, 0, -0.046]], col, { seg: 16, bot: true, botDome: 0.012 });
    for (const sx of [1, -1]) K.S(sx * 0.07, 0.086, -0.014, 0.019, 0.074, 0.033, col);
  },
  _acNPony(A, col) {
    const K = this._acNKit(A);
    K.S(0, 0.152, -0.108, 0.022, 0.02, 0.022, this._shade(col, 0.8));
    K.S(0, 0.09, -0.13, 0.025, 0.074, 0.029, col, 0.32, 0, 0);
  },
  // shirt / blouse (waist-joint space); hangs a little over the waistband
  _acNTorso(A, fem) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    const R = fem
      ? [[-0.05, 0.142, 0.099, 0, 0.002], [0, 0.134, 0.093, 0, 0.002], [0.07, 0.132, 0.091, 0, 0.004], [0.14, 0.14, 0.1, 0, 0.01], [0.205, 0.151, 0.118, 0, 0.02], [0.255, 0.154, 0.121, 0, 0.021], [0.3, 0.153, 0.106, 0, 0.01], [0.345, 0.157, 0.096, 0, 0.002], [0.375, 0.146, 0.088, 0, -0.004], [0.4, 0.108, 0.074, 0, -0.008], [0.418, 0.062, 0.056, 0, -0.008]]
      : [[-0.05, 0.156, 0.106, 0, 0.002], [0, 0.149, 0.099, 0, 0], [0.07, 0.151, 0.102, 0, 0.003], [0.15, 0.158, 0.108, 0, 0.007], [0.225, 0.167, 0.114, 0, 0.01], [0.29, 0.172, 0.112, 0, 0.008], [0.34, 0.173, 0.104, 0, 0.002], [0.372, 0.161, 0.094, 0, -0.004], [0.398, 0.12, 0.08, 0, -0.008], [0.418, 0.068, 0.06, 0, -0.008]];
    K.L(R, W, { seg: 22, bot: true, top: true });
    K.L([[0.392, 0.071, 0.063, 0, -0.004], [0.432, 0.064, 0.057, 0, -0.006]], this._shade(W, 0.86), { seg: 18, both: true });
  },
  _acNPelvis(A, fem) {
    const K = this._acNKit(A);
    const hw = fem ? 0.16 : 0.152;
    K.L([[-0.118, 0.1, 0.082, 0, -0.006], [-0.08, 0.135, 0.096, 0, -0.005], [-0.02, hw, 0.104, 0, -0.002], [0.045, hw - 0.004, 0.102, 0, 0], [0.11, 0.148, 0.099, 0, 0]], '#FFFFFF', { seg: 22, bot: true, top: true });
  },
  // shoulder-joint space: 'bare' (below a short sleeve), 'sleeve' (short sleeve + shoulder), 'long'
  _acNArm(A, kind) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    if (kind === 'bare') { K.L([[-0.292, 0.039, 0.038], [-0.22, 0.044, 0.043], [-0.12, 0.049, 0.048]], W, { seg: 16, bot: true }); return; }
    // deltoid: a flattened cap that blends into the shirt's shoulder line (not a puff)
    K.S(-0.006, -0.03, 0, 0.054, 0.052, 0.052, W);
    if (kind === 'sleeve') { K.L([[-0.165, 0.058, 0.056], [-0.1, 0.059, 0.057], [-0.035, 0.058, 0.056]], W, { seg: 18, both: true }); return; }
    K.L([[-0.292, 0.045, 0.045], [-0.22, 0.05, 0.049], [-0.13, 0.054, 0.053], [-0.06, 0.056, 0.055], [-0.02, 0.054, 0.053]], W, { seg: 18, bot: true });
  },
  _acNFore(A, long) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    const g = long ? 0.008 : 0;
    K.S(0, 0, 0, 0.039 + g, 0.041 + g, 0.039 + g, W);
    K.L([[-0.256, 0.025 + g * 1.2, 0.021 + g * 1.2], [-0.2, 0.029 + g, 0.025 + g], [-0.12, 0.035 + g, 0.032 + g], [-0.05, 0.039 + g, 0.036 + g], [0, 0.039 + g, 0.037 + g]], W, { seg: 16, bot: !long });
    if (long) K.L([[-0.256, 0.035, 0.031], [-0.226, 0.036, 0.032]], this._shade(W, 0.9), { seg: 16, both: true });
  },
  // relaxed hand: palm faces the thigh (x), fingers along -y, thumb in front (+z)
  _acNHand(A) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    K.S(0, -0.047, 0.003, 0.018, 0.048, 0.042, W);
    for (let i = 0; i < 4; i++) {
      const z = (0.026 - i * 0.0172) * 0.95, len = [0.066, 0.075, 0.071, 0.056][i];
      K.C(0.002, -0.088 - len / 2, z, 0.0084, len, 0.008, 0.84, W, 0.12, 0, 0, 10);
      K.S(0.002, -0.086 - len, z + 0.005, 0.0071, 0.0075, 0.0069, W);
    }
    K.S(0.004, -0.056, 0.043, 0.0112, 0.033, 0.0122, W, -0.45, 0, 0.12);
  },
  // hip-joint space: 'pants', 'bare', 'shorts'
  _acNThigh(A, kind) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    if (kind === 'shorts') { K.L([[-0.24, 0.088, 0.09, 0, 0.002], [-0.12, 0.088, 0.092], [-0.02, 0.087, 0.091], [0.04, 0.084, 0.088]], W, { seg: 18, both: true }); return; }
    const g = kind === 'pants' ? 1.07 : 1;
    K.L([[-0.43, 0.052 * g, 0.055 * g, 0, 0.004], [-0.36, 0.058 * g, 0.061 * g, 0, 0.002], [-0.26, 0.065 * g, 0.069 * g], [-0.15, 0.071 * g, 0.075 * g, 0, -0.002], [-0.05, 0.075 * g, 0.08 * g, 0, -0.002], [0.035, 0.074 * g, 0.079 * g]], W, { seg: 18, bot: true });
  },
  // knee-joint space: 'pants' (straight leg, open hem), 'bare' (calf)
  _acNShin(A, kind) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    if (kind === 'pants') {
      K.S(0, 0, 0.004, 0.06, 0.063, 0.062, W);
      K.L([[-0.405, 0.057, 0.061, 0, 0.004], [-0.3, 0.055, 0.059], [-0.18, 0.057, 0.062, 0, -0.004], [-0.06, 0.059, 0.062], [0.02, 0.06, 0.062, 0, 0.004]], W, { seg: 18, both: true });
      return;
    }
    K.S(0, 0, 0.005, 0.054, 0.058, 0.057, W);
    K.L([[-0.415, 0.031, 0.035, 0, -0.003], [-0.36, 0.035, 0.04, 0, -0.006], [-0.28, 0.042, 0.05, 0, -0.01], [-0.18, 0.049, 0.058, 0, -0.012], [-0.08, 0.051, 0.055, 0, -0.004], [0.02, 0.053, 0.056, 0, 0.004]], W, { seg: 16, bot: true });
  },
  // ankle-joint space (ankle 0.08 above the sole): sock, upper, toe box, heel, darker sole
  _acNShoe(A) {
    const K = this._acNKit(A);
    const W = '#FFFFFF';
    K.C(0, 0.02, -0.004, 0.034, 0.07, 0.036, 1, this._shade(W, 0.5), 0, 0, 0, 12);
    K.S(0, -0.044, 0.05, 0.047, 0.04, 0.122, W);
    K.S(0, -0.054, 0.142, 0.045, 0.029, 0.062, W);
    K.S(0, -0.047, -0.038, 0.043, 0.036, 0.042, W);
    K.S(0, -0.073, 0.052, 0.052, 0.009, 0.136, this._shade(W, 0.42));
  },
  _acNSkirt(A) {
    const K = this._acNKit(A);
    K.L([[-0.46, 0.2, 0.165, 0, 0.01], [-0.3, 0.183, 0.145, 0, 0.006], [-0.12, 0.168, 0.12, 0, 0.002], [0.04, 0.158, 0.106], [0.115, 0.152, 0.102]], '#FFFFFF', { seg: 26, both: true });
  },
  _acNearParts() {
    const W = '#FFFFFF';
    const bk = (fn) => this._bake((A) => fn(A));
    const bare = (p) => !p.c.longSleeve && !p.c.coat;
    const legsOut = (p) => p.c.shorts || p.c.skirt;
    return [
      { k: 'nHead', j: ['neck'], m: 'skin', geo: bk((A) => this._acNHead(A)), col: (p) => p.c.skin },
      { k: 'nFace', j: ['neck'], m: 'face', geo: bk((A) => this._acNFace(A)), col: () => W },
      { k: 'nHairS', j: ['neck'], m: 'hair', geo: bk((A) => this._acNHairCap(A, 'short', W)), col: (p) => p.c.hair, when: (p) => p.hs === 'short' },
      { k: 'nHairZ', j: ['neck'], m: 'hair', geo: bk((A) => this._acNHairCap(A, 'buzz', W)), col: (p) => p.c.hair, when: (p) => p.hs === 'buzz' },
      { k: 'nHairB', j: ['neck'], m: 'hair', geo: bk((A) => this._acNHairCap(A, 'bob', W)), col: (p) => p.c.hair, when: (p) => p.hs === 'bob' },
      { k: 'nHairL', j: ['neck'], m: 'hair', geo: bk((A) => { this._acNHairCap(A, 'long', W); this._acNHairDrape(A, W); }), col: (p) => p.c.hair, when: (p) => p.hs === 'long' },
      { k: 'nHairP', j: ['neck'], m: 'hair', geo: bk((A) => { this._acNHairCap(A, 'short', W); this._acNPony(A, W); }), col: (p) => p.c.hair, when: (p) => p.hs === 'pony' },
      { k: 'nTorsoM', j: ['torso'], geo: bk((A) => this._acNTorso(A, false)), col: (p) => p.c.top, when: (p) => !p.fem },
      { k: 'nTorsoF', j: ['torso'], geo: bk((A) => this._acNTorso(A, true)), col: (p) => p.c.top, when: (p) => p.fem },
      { k: 'nPelvisM', j: ['hips'], geo: bk((A) => this._acNPelvis(A, false)), col: (p) => p.c.bottom, when: (p) => !p.fem },
      { k: 'nPelvisF', j: ['hips'], geo: bk((A) => this._acNPelvis(A, true)), col: (p) => p.c.bottom, when: (p) => p.fem },
      { k: 'nSleeve', j: ['shL', 'shR'], geo: bk((A) => this._acNArm(A, 'sleeve')), col: (p) => p.c.sleeve, when: bare },
      { k: 'nArmB', j: ['shL', 'shR'], m: 'skin', geo: bk((A) => this._acNArm(A, 'bare')), col: (p) => p.c.skin, when: bare },
      { k: 'nArmL', j: ['shL', 'shR'], geo: bk((A) => this._acNArm(A, 'long')), col: (p) => p.c.sleeve, when: (p) => !bare(p) },
      { k: 'nForeB', j: ['elL', 'elR'], m: 'skin', geo: bk((A) => this._acNFore(A, false)), col: (p) => p.c.skin, when: (p) => !p.c.longSleeve },
      { k: 'nForeL', j: ['elL', 'elR'], geo: bk((A) => this._acNFore(A, true)), col: (p) => p.c.fore, when: (p) => p.c.longSleeve },
      { k: 'nHand', j: ['wrL', 'wrR'], m: 'skin', geo: bk((A) => this._acNHand(A)), col: (p) => p.c.skin },
      { k: 'nThighP', j: ['hipL', 'hipR'], geo: bk((A) => this._acNThigh(A, 'pants')), col: (p) => p.c.bottom, when: (p) => !legsOut(p) },
      { k: 'nThighS', j: ['hipL', 'hipR'], geo: bk((A) => this._acNThigh(A, 'shorts')), col: (p) => p.c.bottom, when: (p) => p.c.shorts },
      { k: 'nThighB', j: ['hipL', 'hipR'], m: 'skin', geo: bk((A) => this._acNThigh(A, 'bare')), col: (p) => p.c.skin, when: legsOut },
      { k: 'nShinP', j: ['knL', 'knR'], geo: bk((A) => this._acNShin(A, 'pants')), col: (p) => p.c.bottom, when: (p) => !legsOut(p) },
      { k: 'nShinB', j: ['knL', 'knR'], m: 'skin', geo: bk((A) => this._acNShin(A, 'bare')), col: (p) => p.c.skin, when: legsOut },
      { k: 'nShoe', j: ['anL', 'anR'], geo: bk((A) => this._acNShoe(A)), col: (p) => p.c.shoe },
      { k: 'nSkirt', j: ['hips'], geo: bk((A) => this._acNSkirt(A)), col: (p) => p.c.bottom, when: (p) => p.c.skirt },
      { k: 'nHat', j: ['neck'], geo: bk((A) => this._acHat(A, true)), col: () => W, when: (p) => p.c.hat },
      { k: 'nHelmet', j: ['neck'], geo: bk((A) => this._acHelmet(A, true, W)), col: (p) => p.c.helmet || '#F4F4F0', when: (p) => !!p.c.helmet },
      { k: 'nCoat', j: ['torso'], geo: bk((A) => this._acCoat(A, true)), col: () => W, when: (p) => p.c.coat },
      { k: 'nApron', j: ['torso'], geo: bk((A) => this._acApron(A, true, W)), col: (p) => p.c.apron || W, when: (p) => !!p.c.apron },
      { k: 'nUmb', j: ['root'], geo: bk((A) => this._acUmbrella(A, true, W)), col: (p) => p.c.umb, when: (p) => p.umbOn }
    ];
  },
  _initCrowd() {
    const E = this._E;
    const T = E.T;
    const L = window.GHG3L;
    const R = this._rng(9001);
    let loops = (E.walkLoops && E.walkLoops.length) ? E.walkLoops : this._acDefaultLoops();
    loops = loops.filter((l) => l && l.pts && l.pts.length > 1).map((l) => {
      const pts = l.pts.slice();
      if (l.closed) pts.push(pts[0]);
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      return { pts: pts, cum: cum, len: cum[cum.length - 1], closed: !!l.closed, y: l.y };
    }).filter((l) => l.len > 4);
    const totalLen = loops.reduce((a, l) => a + l.len, 0);
    const N = loops.length ? (E.crowdN || 90) : 0;
    const people = [];
    const outfitsWalk = ['casual', 'casual', 'casual', 'casual', 'office', 'office', 'student', 'vendor', 'shop', 'nurse', 'worker', 'farmer'];
    const mkP = (o) => {
      const fem = R() < 0.5;
      const outfit = o.outfit || this._acPick(R, outfitsWalk);
      const c = this._acPalette({ outfit: outfit, fem: fem, seed: (R() * 1e6) | 0 });
      const h = (fem ? 1.52 : 1.62) + R() * 0.17;
      // near-LOD hair style
      const hr = R();
      const hs = fem ? (c.hairLong ? (hr < 0.55 ? 'long' : 'pony') : 'bob') : (hr < 0.22 ? 'buzz' : 'short');
      return Object.assign({ c: c, k: h / 1.72, fem: fem, hs: hs, outfit: outfit, ph: R(), seed: R() * 10, t: R() * 50, m: new Float32Array(16 * 16), due: 0, vis: false, umbOn: false, lc: {}, lod: 1 }, o);
    };
    for (let i = 0; i < N; i++) {
      let pick = R() * totalLen, li = 0;
      while (li < loops.length - 1 && pick > loops[li].len) { pick -= loops[li].len; li++; }
      const lp = loops[li];
      people.push(mkP({ kind: 'walk', loop: lp, s: R() * lp.len, seg: 0, dir: R() < 0.5 ? 1 : -1, speed: 1.0 + R() * 0.5, lat: (R() - 0.5) * 1.4, latT: 0, yaw: 0, x: 0, z: 0, y: 0, mode: 'idle' }));
    }
    for (const sp of (E.crowdSpots || [])) {
      people.push(mkP({ kind: 'spot', outfit: sp.outfit || 'casual', x: sp.x, z: sp.z, y: sp.y != null ? sp.y : L.H(sp.x, sp.z), yaw: sp.yaw || 0, mode: sp.mode || 'stand', speed: 0 }));
    }
    for (const p of people) { p.latT = p.lat; if (p.kind === 'walk') this._acWalkPos(p, 0); }
    // resolve linear colours once
    const parts = this._acCrowdParts();
    const cap = Math.max(1, people.length);
    const meshes = parts.map((pt) => {
      const n = cap * pt.j.length;
      const im = new T.InstancedMesh(pt.geo, E.mats.flat, n);
      im.frustumCulled = false;
      im.castShadow = true;
      im.receiveShadow = true;
      const col = new T.Color(1, 1, 1);
      for (let i = 0; i < n; i++) im.setColorAt(i, col);
      im.count = 0;
      im.instanceMatrix.setUsage(T.DynamicDrawUsage);
      E.scene.add(im);
      return { pt: pt, im: im, lod: 1 };
    });
    // near LOD (people within ~32 m): smooth bodies, faces and hair; skin / cloth / hair get their own sheen
    const MATS = {
      skin: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.56, metalness: 0 }),
      cloth: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 }),
      face: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0 }),
      hair: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.06 })
    };
    const near = this._acNearParts().map((pt) => {
      const n = cap * pt.j.length;
      const im = new T.InstancedMesh(pt.geo, MATS[pt.m || 'cloth'], n);
      im.frustumCulled = false;
      im.castShadow = true;
      im.receiveShadow = true;
      const col = new T.Color(1, 1, 1);
      for (let i = 0; i < n; i++) im.setColorAt(i, col);
      im.count = 0;
      im.instanceMatrix.setUsage(T.DynamicDrawUsage);
      E.scene.add(im);
      return { pt: pt, im: im, lod: 2 };
    });
    // far LOD: 3-box impostor in root space (people beyond ~85 m are a few pixels tall)
    const imp = [
      { k: 'fLeg', geo: this._bake((A) => { const K = this._acKit(A, 'lo'); K.B(0.05, 0.43, 0, 0.12, 0.84, 0.15, '#FFFFFF'); K.B(-0.05, 0.43, 0, 0.12, 0.84, 0.15, '#FFFFFF'); }), col: (p) => (p.c.skirt || p.c.shorts ? p.c.skin : p.c.bottom) },
      { k: 'fTop', geo: this._bake((A) => { const K = this._acKit(A, 'lo'); K.B(0, 1.2, 0, 0.36, 0.56, 0.21, '#FFFFFF'); K.B(0, 0.95, 0, 0.32, 0.16, 0.2, '#FFFFFF'); }), col: (p) => p.c.top },
      { k: 'fHead', geo: this._bake((A) => { const K = this._acKit(A, 'lo'); K.S(0, 1.6, 0, 0.09, 0.115, 0.1, '#FFFFFF'); }), col: (p) => (p.c.hat ? '#D9C48E' : (p.c.helmet || p.c.hair)) },
      { k: 'fUmb', geo: this._bake((A) => this._acUmbrella(A, 'lo', '#FFFFFF')), col: (p) => p.c.umb, when: (p) => p.umbOn }
    ].map((pt) => {
      const im = new T.InstancedMesh(pt.geo, E.mats.flat, cap);
      im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true;
      const col = new T.Color(1, 1, 1);
      for (let i = 0; i < cap; i++) im.setColorAt(i, col);
      im.count = 0;
      im.instanceMatrix.setUsage(T.DynamicDrawUsage);
      E.scene.add(im);
      return { pt: Object.assign({ j: ['root'] }, pt), im: im, far: true, lod: 0 };
    });
    E.crowd = { people: people, loops: loops, meshes: near.concat(meshes, imp), rig: this._acRig(1), frame: 0, ang: this._acZero(), M: new T.Matrix4(), Q: new T.Quaternion(), V: new T.Vector3(), S: new T.Vector3(), Y: new T.Vector3(0, 1, 0),
      J: ['root', 'hips', 'torso', 'neck', 'shL', 'shR', 'elL', 'elR', 'wrL', 'wrR', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR'] };
  },
  _acWalkPos(p, dt) {
    const lp = p.loop;
    p.s += p.dir * p.speed * dt;
    if (lp.closed) { p.s %= lp.len; if (p.s < 0) p.s += lp.len; }
    else if (p.s < 0 || p.s > lp.len) { p.s = Math.max(0, Math.min(lp.len, p.s)); p.dir = -p.dir; }
    const cum = lp.cum;
    let i = Math.min(Math.max(0, p.seg || 0), cum.length - 2);
    while (i < cum.length - 2 && p.s > cum[i + 1]) i++;
    while (i > 0 && p.s < cum[i]) i--;
    p.seg = i;
    const a = lp.pts[i], b = lp.pts[i + 1];
    const sl = cum[i + 1] - cum[i] || 1;
    const u = (p.s - cum[i]) / sl;
    const dx = (b[0] - a[0]) / sl, dz = (b[1] - a[1]) / sl;
    const fx = dx * p.dir, fz = dz * p.dir;
    p.lat += (p.latT - p.lat) * Math.min(1, dt * 1.5);
    // left of travel direction = (fz, -fx)
    p.x = a[0] + (b[0] - a[0]) * u + fz * p.lat;
    p.z = a[1] + (b[1] - a[1]) * u - fx * p.lat;
    p.y = lp.y != null ? lp.y : window.GHG3L.H(p.x, p.z);
    const want = Math.atan2(fx, fz);
    p.yaw = dt > 0 ? this._angDamp(p.yaw, want, 7, dt) : want;
  },
  _tickCrowd(dt) {
    const E = this._E;
    const C = E.crowd;
    if (!C) return;
    C.frame++;
    const cp = E.cam.position;
    const rain = (E.rainK || 0) > 0.4;
    const rig = C.rig;
    const pl = E.player;
    // pass 1: simulate + decide visibility / update
    for (const p of C.people) {
      p.t += dt;
      if (p.kind === 'walk') {
        if (pl) {
          const dx = pl.x - p.x, dz = pl.z - p.z;
          const d2 = dx * dx + dz * dz;
          if (d2 < 2.6) {
            const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
            const side = fz * dx - fx * dz;
            p.latT = this._cl(p.lat + (side > 0 ? -1.3 : 1.3), -1.6, 1.6);
          } else if (Math.abs(p.latT) > 0.9 && R0(p)) p.latT *= 0.5;
        }
        this._acWalkPos(p, dt);
        p.ph = (p.ph + (p.speed * dt) / this._acCycleD(p.speed)) % 1;
        p.umbOn = rain;
      }
      const dx = p.x - cp.x, dz = p.z - cp.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      p.vis = d < 430;
      if (!p.vis) continue;
      // detail level: 2 = near (full body + face), 1 = light, 0 = far impostor
      p.lod = d > 85 ? 0 : (d < 32 ? 2 : 1);
      p.far = p.lod === 0;
      if (p.far) {
        C.Q.setFromAxisAngle(C.Y, p.yaw);
        C.M.compose(C.V.set(p.x, p.y, p.z), C.Q, C.S.set(p.k, p.k, p.k));
        p.m.set(C.M.elements, 0);
        p.due = 1;
        continue;
      }
      const every = d < 22 ? 1 : (d < 50 ? 2 : 3);
      if ((C.frame + (p.seed * 10 | 0)) % every !== 0 && p.due > 1) continue;
      p.due = 2;
      // pose
      const st = { speed: p.kind === 'walk' ? p.speed : 0, mode: p.mode === 'stand' ? 'idle' : p.mode, ph: p.ph, t: p.t, seed: p.seed, w: p.kind === 'walk' ? 1 : 0, g: (p.mode === 'chat' || p.mode === 'work') ? 1 : 0, umb: p.umbOn, chatty: p.mode === 'sit' && p.seed > 5 };
      if (p.mode === 'sit') st.mode = 'sit';
      this._acPose(st, C.ang);
      rig.root.position.set(p.x, p.y, p.z);
      rig.root.rotation.y = p.yaw;
      rig.root.scale.setScalar(p.k);
      this._acApply(rig, C.ang);
      rig.root.updateMatrixWorld(true);
      const J = C.J;
      for (let j = 0; j < 16; j++) p.m.set(rig[J[j]].matrixWorld.elements, j * 16);
    }
    // pass 2: pack visible instances
    const JI = { root: 0, hips: 1, torso: 2, neck: 3, shL: 4, shR: 5, elL: 6, elR: 7, wrL: 8, wrR: 9, hipL: 10, hipR: 11, knL: 12, knR: 13, anL: 14, anR: 15 };
    for (const M of C.meshes) {
      const pt = M.pt, im = M.im;
      const ma = im.instanceMatrix.array, ca = im.instanceColor.array;
      let n = 0;
      for (const p of C.people) {
        if (!p.vis || !p.due) continue;
        if (M.lod !== p.lod) continue;
        if (M.lod > 0 && p.due < 2) continue;
        if (pt.when && !pt.when(p)) continue;
        let lc = p.lc[pt.k];
        if (!lc) lc = p.lc[pt.k] = this._lc(pt.col(p));
        for (const jn of pt.j) {
          ma.set(p.m.subarray(JI[jn] * 16, JI[jn] * 16 + 16), n * 16);
          ca[n * 3] = lc[0]; ca[n * 3 + 1] = lc[1]; ca[n * 3 + 2] = lc[2];
          n++;
        }
      }
      im.count = n;
      im.instanceMatrix.needsUpdate = true;
      im.instanceColor.needsUpdate = true;
    }
    function R0(p) { return ((p.t * 7) | 0) % 13 === 0; }
  },

  // =============================================================== ANIMALS
  _acHolstein(A, seed, buffalo) {
    // body incl. legs, udder — local forward +z, ground at y = 0
    const K = this._acKit(A, false);
    const base = buffalo ? '#3B3B3E' : '#F4F2EE';
    const B = buffalo ? 1.1 : 1;
    const legH = buffalo ? 0.6 : 0.72;
    const cy = legH + 0.38 * B;
    K.S(0, cy, 0, 0.36 * B, 0.39 * B, 0.98, base, 0, 0, 0, 'sph:14:10');
    K.S(0, cy + 0.06, -0.62, 0.31 * B, 0.3 * B, 0.36, base, 0, 0, 0, 'sph:10:8');
    K.S(0, cy + 0.04, 0.6, 0.3 * B, 0.33 * B, 0.36, base, 0, 0, 0, 'sph:10:8');
    K.S(0, cy + 0.1, 0.78, 0.22 * B, 0.27 * B, 0.24, base, 0, 0, 0, 'sph:10:8');
    K.S(0, cy - 0.12, 0.05, 0.3 * B, 0.27 * B, 0.7, base, 0, 0, 0, 'sph:10:8');
    for (const sx of [1, -1]) for (const sz of [1, -1]) {
      const x = sx * 0.2 * B, z = sz > 0 ? 0.6 : -0.64;
      // upper leg (starts inside the body), lower leg, fetlock, hoof
      K.L(x, cy - 0.05, z, 0.42 * B, 0.11 * B, 0.12 * B, 0.62, base, 7);
      K.L(x, legH - 0.04, z + (sz > 0 ? 0.0 : -0.02), legH - 0.1, 0.062 * B, 0.068 * B, 0.78, base, 7);
      K.S(x, 0.17, z + 0.01, 0.05 * B, 0.055, 0.055, base);
      K.B(x, 0.04, z + 0.025, 0.085 * B, 0.08, 0.115, '#2A2522');
    }
    if (!buffalo) {
      K.S(0, legH + 0.02, -0.42, 0.16, 0.12, 0.19, '#E9B8A8');
      for (const sx of [1, -1]) for (const sz of [1, -1]) K.L(sx * 0.05, legH - 0.06, -0.42 + sz * 0.07, 0.07, 0.016, 0.016, 0.8, '#E2A493', 6);
    }
    // Holstein patches: recolour vertices by a seeded blob field
    if (!buffalo) {
      const R = this._rng(seed);
      const blobs = [];
      for (let i = 0; i < 11; i++) blobs.push([(R() - 0.5) * 0.9, legH + 0.05 + R() * 0.85, (R() - 0.5) * 2.1, 0.2 + R() * 0.28]);
      for (let i = 0; i < A.vc; i++) {
        const x = A.p[i * 3], y = A.p[i * 3 + 1], z = A.p[i * 3 + 2];
        if (y < legH * 0.55) continue;
        let f = 0;
        for (const b of blobs) { const dx = (x - b[0]) * 1.3, dy = y - b[1], dz = z - b[2]; f = Math.max(f, 1 - Math.sqrt(dx * dx + dy * dy + dz * dz) / b[3]); }
        if (f > 0.0 && Math.abs(A.c[i * 3] - A.c[i * 3 + 2]) < 0.2 && A.c[i * 3] > 0.5) { A.c[i * 3] = 0.012; A.c[i * 3 + 1] = 0.011; A.c[i * 3 + 2] = 0.011; }
      }
    }
  },
  // tapered cylinder between two points (r0 at p0, r1 at p1)
  _acSeg(A, p0, p1, r0, r1, col, seg) {
    const E = this._E;
    const T = E.T;
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2];
    const len = Math.hypot(dx, dy, dz) || 1e-4;
    if (!E._acSegQ) { E._acSegQ = new T.Quaternion(); E._acSegE = new T.Euler(); E._acSegU = new T.Vector3(0, 1, 0); E._acSegD = new T.Vector3(); }
    E._acSegQ.setFromUnitVectors(E._acSegU, E._acSegD.set(dx / len, dy / len, dz / len));
    E._acSegE.setFromQuaternion(E._acSegQ);
    const t = Math.max(0.05, r0 / Math.max(1e-4, r1));
    this._acPut(A, this._acGeo('tap:' + t.toFixed(3) + ':' + (seg || 8)), (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2, r1, len, r1, E._acSegE.x, E._acSegE.y, E._acSegE.z, col);
  },
  // neck + head, relative to a pivot at the withers; rx > 0 lowers the head (grazing)
  _acBovineHead(A, buffalo) {
    const K = this._acKit(A, false);
    const c = buffalo ? '#38383B' : '#1C1A19';
    const nc = buffalo ? '#3B3B3E' : '#F4F2EE';
    K.S(0, -0.02, 0.26, 0.19, 0.25, 0.36, nc, -0.25, 0, 0, 'sph:10:8');
    K.S(0, -0.02, 0.62, 0.15, 0.17, 0.24, c, 0.55, 0, 0, 'sph:10:8');
    K.S(0, -0.17, 0.8, 0.11, 0.1, 0.12, buffalo ? '#2A2A2C' : '#D8B4A6', 0.35, 0, 0);
    if (!buffalo) K.B(0, 0.03, 0.72, 0.07, 0.17, 0.05, '#F4F2EE', 1.0, 0, 0);
    for (const sx of [1, -1]) {
      K.S(sx * 0.085, 0.02, 0.73, 0.02, 0.02, 0.015, '#0B0B0B');
      K.S(sx * 0.17, 0.1, 0.53, 0.1, 0.035, 0.06, c, 0, 0, sx * 0.35);
      if (buffalo) {
        // crescent: out to the side, sweeping back and up, tips curling in
        const hp = (t) => [sx * (0.07 + 0.36 * Math.sin(t * Math.PI * 0.72)), 0.12 + 0.05 * t + 0.12 * t * t, 0.56 - 0.36 * t];
        let p0 = hp(0);
        for (let i = 1; i <= 8; i++) {
          const p1 = hp(i / 8);
          this._acSeg(A, p0, p1, 0.052 - (i - 1) * 0.0058, 0.052 - i * 0.0058, i > 6 ? '#4E4A47' : '#8C8781', 6);
          p0 = p1;
        }
      } else {
        this._acSeg(A, [sx * 0.07, 0.12, 0.52], [sx * 0.12, 0.19, 0.5], 0.022, 0.008, '#D8CFC0', 8);
      }
    }
  },
  _acTail(A, col) {
    const K = this._acKit(A, false);
    K.L(0, 0, 0, 0.72, 0.022, 0.022, 0.6, col, 8);
    K.S(0, -0.74, 0, 0.045, 0.1, 0.045, '#1A1717');
  },
  _acEgretBody(A) {
    const K = this._acKit(A, false);
    K.S(0, 0.56, -0.02, 0.085, 0.1, 0.19, '#FAFAF7', -0.35, 0, 0);
    K.S(0, 0.52, -0.2, 0.05, 0.04, 0.12, '#F2F2EE', 0.4, 0, 0);
    for (const sx of [1, -1]) {
      K.L(sx * 0.03, 0.48, 0.01, 0.46, 0.008, 0.008, 0.8, '#1C1C1C', 6);
      K.B(sx * 0.03, 0.01, 0.04, 0.02, 0.01, 0.09, '#1C1C1C');
    }
  },
  _acEgretNeck(A) {
    // relative to the neck base pivot (0, 0.6, 0.13)
    const K = this._acKit(A, false);
    K.C(0, 0.08, 0.02, 0.028, 0.18, 0.028, 0.8, '#FAFAF7', 0.25, 0, 0, 8);
    K.C(0, 0.2, 0.0, 0.022, 0.12, 0.022, 1.0, '#FAFAF7', -0.4, 0, 0, 8);
    K.S(0, 0.27, 0.03, 0.032, 0.03, 0.05, '#FAFAF7');
    K.K(0, 0.265, 0.12, 0.012, 0.13, 0.012, '#E2B935', Math.PI / 2, 0, 0, 6);
    for (const sx of [1, -1]) K.S(sx * 0.02, 0.278, 0.05, 0.006, 0.006, 0.006, '#E9C93A');
  },
  _acWing(A, col, span) {
    const K = this._acKit(A, false);
    this._acPut(A, this._acGeo('tri'), 0, 0, 0, span, 1, 1, 0, 0, 0, col);
    this._acPut(A, this._acGeo('tri'), 0, 0, 0, span, 1, 1, Math.PI, 0, 0, col);
    void K;
  },
  _acDogBody(A, col) {
    const K = this._acKit(A, false);
    K.S(0, 0.42, 0, 0.13, 0.15, 0.33, col, 0, 0, 0, 'sph:10:8');
    K.S(0, 0.46, 0.25, 0.12, 0.14, 0.14, col);
  },
  _acDogHead(A, col) {
    const K = this._acKit(A, false);
    K.S(0, 0.05, 0.06, 0.085, 0.085, 0.1, col);
    K.S(0, 0.01, 0.15, 0.045, 0.045, 0.07, this._shade(col, 0.85));
    K.S(0, 0.025, 0.215, 0.018, 0.016, 0.014, '#151313');
    for (const sx of [1, -1]) {
      K.K(sx * 0.05, 0.14, 0.04, 0.03, 0.08, 0.015, this._shade(col, 0.8), 0, 0, sx * -0.25, 6);
      K.S(sx * 0.035, 0.07, 0.135, 0.01, 0.01, 0.008, '#0D0D0D');
    }
  },
  _acDogLeg(A, col) {
    const K = this._acKit(A, false);
    K.L(0, 0, 0, 0.34, 0.028, 0.03, 0.75, col, 8);
    K.S(0, -0.34, 0.015, 0.025, 0.018, 0.035, this._shade(col, 0.8));
  },
  _acDogTail(A, col) {
    const K = this._acKit(A, false);
    K.C(0, 0.1, -0.03, 0.022, 0.24, 0.022, 0.5, col, -0.5, 0, 0, 8);
  },
  _acIM(geo, n, cast) {
    const E = this._E;
    const T = E.T;
    const im = new T.InstancedMesh(geo, E.mats.flat, Math.max(1, n));
    im.frustumCulled = false;
    im.castShadow = cast !== false;
    im.receiveShadow = true;
    im.instanceMatrix.setUsage(T.DynamicDrawUsage);
    const c = new T.Color(1, 1, 1);
    for (let i = 0; i < Math.max(1, n); i++) im.setColorAt(i, c);
    im.count = n;
    E.scene.add(im);
    return im;
  },
  _initAnimals() {
    const E = this._E;
    const T = E.T;
    const L = window.GHG3L;
    // nothing is placed unless another module provides spots (birds default to two flocks over the town)
    const S = E.animalSpots || { cows: [], buffalo: [], egrets: [], dogs: [], birds: [[-150, -120], [250, 120]] };
    const R = this._rng(4711);
    const Z = { cows: [], buf: [], eg: [], dogs: [], birds: [], t: 0, M: new T.Matrix4(), M2: new T.Matrix4(), Q: new T.Quaternion(), Eu: new T.Euler(), V: new T.Vector3(), Sc: new T.Vector3(1, 1, 1) };
    for (const a of (S.cows || [])) Z.cows.push({ x: a.x, z: a.z, yaw: a.yaw || 0, y: L.H(a.x, a.z), v: (R() < 0.5) ? 0 : 1, ph: R() * 10, up: 0, s: 0.95 + R() * 0.12 });
    for (const a of (S.buffalo || [])) Z.buf.push({ x: a.x, z: a.z, yaw: a.yaw || 0, y: L.H(a.x, a.z) - (a.lie ? 0.42 : 0), lie: !!a.lie, ph: R() * 10, s: 0.95 + R() * 0.1 });
    for (const g of (S.egrets || [])) {
      const n = g.n || (4 + ((R() * 5) | 0));
      for (let i = 0; i < n; i++) {
        const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * (g.r || 8);
        const x = g.x + Math.cos(a) * rr, z = g.z + Math.sin(a) * rr;
        Z.eg.push({ cx: g.x, cz: g.z, r: g.r || 8, x: x, z: z, y: L.H(x, z), yaw: R() * 6.28, st: 'stand', tm: 2 + R() * 8, peck: 0, fx: 0, fz: 0, tx: 0, tz: 0, ft: 0, fd: 1 });
      }
    }
    const dogCols = ['#C49A6C', '#2B2B2B', '#EFEDE8', '#8B5A2B', '#D8B07A'];
    for (const d of (S.dogs || [])) Z.dogs.push({ hx: d.x, hz: d.z, x: d.x, z: d.z, y: L.H(d.x, d.z), yaw: R() * 6.28, lie: d.lie != null ? !!d.lie : R() < 0.5, col: d.col || dogCols[(R() * dogCols.length) | 0], tx: d.x, tz: d.z, wait: R() * 4, ph: 0, sp: 0 });
    for (const b of (S.birds || [])) {
      const n = 9 + ((R() * 6) | 0);
      const alt = 60 + R() * 50;
      for (let i = 0; i < n; i++) Z.birds.push({ cx: b[0], cz: b[1], rad: 30 + R() * 35, ang: R() * 6.28, w: (0.18 + R() * 0.06) * (R() < 0.5 ? 1 : -1) * (i % 2 ? 1 : 1), alt: alt + (R() - 0.5) * 14, ph: R() * 6, bob: R() * 6 });
    }
    // meshes
    const mk = (fn) => this._bake((A) => fn(A));
    Z.mCow = [this._acIM(mk((A) => this._acHolstein(A, 11, false)), Z.cows.filter((c) => c.v === 0).length), this._acIM(mk((A) => this._acHolstein(A, 29, false)), Z.cows.filter((c) => c.v === 1).length)];
    Z.mCowHead = this._acIM(mk((A) => this._acBovineHead(A, false)), Z.cows.length);
    Z.mTail = this._acIM(mk((A) => this._acTail(A, '#EDEBE6')), Z.cows.length + Z.buf.length);
    Z.mBuf = this._acIM(mk((A) => this._acHolstein(A, 0, true)), Z.buf.length);
    Z.mBufHead = this._acIM(mk((A) => this._acBovineHead(A, true)), Z.buf.length);
    Z.mEgB = this._acIM(mk((A) => this._acEgretBody(A)), Z.eg.length);
    Z.mEgN = this._acIM(mk((A) => this._acEgretNeck(A)), Z.eg.length);
    Z.mEgW = this._acIM(mk((A) => this._acWing(A, '#F7F7F4', 0.42)), Z.eg.length * 2);
    Z.mDogB = this._acIM(mk((A) => this._acDogBody(A, '#FFFFFF')), Z.dogs.length);
    Z.mDogH = this._acIM(mk((A) => this._acDogHead(A, '#FFFFFF')), Z.dogs.length);
    Z.mDogL = this._acIM(mk((A) => this._acDogLeg(A, '#FFFFFF')), Z.dogs.length * 4);
    Z.mDogT = this._acIM(mk((A) => this._acDogTail(A, '#FFFFFF')), Z.dogs.length);
    Z.mBird = this._acIM(mk((A) => this._acWing(A, '#26282B', 0.55)), Z.birds.length * 2, false);
    // tail colours for buffalo
    const cB = new T.Color().copy(this._lcol('#3B3B3E'));
    for (let i = 0; i < Z.buf.length; i++) Z.mTail.setColorAt(Z.cows.length + i, cB);
    // dog colours
    Z.dogs.forEach((d, i) => {
      const c = this._lcol(d.col);
      Z.mDogB.setColorAt(i, c); Z.mDogH.setColorAt(i, c); Z.mDogT.setColorAt(i, c);
      for (let k = 0; k < 4; k++) Z.mDogL.setColorAt(i * 4 + k, c);
    });
    E.zoo = Z;
    this._tickAnimals(0.016);
  },
  // root matrix for an animal
  _acRoot(Z, x, y, z, yaw, s) {
    Z.Eu.set(0, yaw, 0);
    Z.Q.setFromEuler(Z.Eu);
    Z.M.compose(Z.V.set(x, y, z), Z.Q, Z.Sc.set(s, s, s));
    return Z.M;
  },
  // part = root * T(px,py,pz) * R(rx,ry,rz)
  _acPart(Z, im, i, px, py, pz, rx, ry, rz, sx, sy, sz) {
    Z.Eu.set(rx || 0, ry || 0, rz || 0);
    Z.Q.setFromEuler(Z.Eu);
    Z.M2.compose(Z.V.set(px, py, pz), Z.Q, Z.Sc.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz));
    Z.M2.premultiply(Z.M);
    im.setMatrixAt(i, Z.M2);
  },
  _tickAnimals(dt) {
    const E = this._E;
    const Z = E.zoo;
    if (!Z) return;
    Z.t += dt;
    const t = Z.t;
    const L = window.GHG3L;
    const cp = E.cam.position;
    const near = (x, z, r) => { const dx = x - cp.x, dz = z - cp.z; return dx * dx + dz * dz < r * r; };
    if (!Z.cW) { const T = E.T; Z.cW = new T.Color(1, 1, 1); Z.cBuf = new T.Color().copy(this._lcol('#3B3B3E')); }
    // cows (two body variants) — only animals within 360 m are drawn (instances are packed)
    const nb = [0, 0];
    let nh = 0, nt = 0;
    Z.cows.forEach((c, i) => {
      c.ph += dt;
      if (!near(c.x, c.z, 360)) return;
      const cyc = (c.ph * 0.09 + i * 0.37) % 1;
      const up = cyc > 0.82 ? Math.sin((cyc - 0.82) / 0.18 * Math.PI) : 0;
      this._acRoot(Z, c.x, c.y, c.z, c.yaw, c.s);
      this._acPart(Z, Z.mCow[c.v], nb[c.v]++, 0, 0, 0, 0, 0, 0);
      const chew = 0.04 * Math.sin(c.ph * 6);
      this._acPart(Z, Z.mCowHead, nh++, 0, 1.2, 0.9, 1.08 - up * 1.0 + chew, 0.15 * Math.sin(c.ph * 0.3) * (1 - up), 0);
      Z.mTail.setColorAt(nt, Z.cW);
      this._acPart(Z, Z.mTail, nt++, 0, 1.2, -1.02, 0.12, 0, 0.22 * Math.sin(c.ph * 2.2 + i) + (Math.sin(c.ph * 0.7) > 0.95 ? 0.4 : 0));
    });
    Z.mCow[0].count = nb[0]; Z.mCow[1].count = nb[1]; Z.mCowHead.count = nh;
    // buffalo
    let nbb = 0;
    Z.buf.forEach((b, i) => {
      b.ph += dt;
      if (!near(b.x, b.z, 360)) return;
      this._acRoot(Z, b.x, b.y, b.z, b.yaw, b.s * 1.05);
      this._acPart(Z, Z.mBuf, nbb, 0, 0, 0, 0, 0, 0);
      const graze = b.lie ? 0.05 : 0.75 + 0.35 * Math.sin(b.ph * 0.4);
      this._acPart(Z, Z.mBufHead, nbb, 0, 1.1, 0.92, graze + 0.03 * Math.sin(b.ph * 5), 0.25 * Math.sin(b.ph * 0.25), 0);
      nbb++;
      Z.mTail.setColorAt(nt, Z.cBuf);
      this._acPart(Z, Z.mTail, nt++, 0, 1.12, -1.06, 0.15, 0, 0.25 * Math.sin(b.ph * 1.9 + i));
    });
    Z.mBuf.count = nbb; Z.mBufHead.count = nbb; Z.mTail.count = nt;
    // egrets: stand / peck / short flights
    let ne = 0;
    Z.eg.forEach((g, i) => {
      g.tm -= dt;
      if (g.st === 'stand' && g.tm < 0) {
        if (Math.random() < 0.25) {
          const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * g.r;
          g.fx = g.x; g.fz = g.z; g.tx = g.cx + Math.cos(a) * rr; g.tz = g.cz + Math.sin(a) * rr;
          g.fd = Math.max(1.5, Math.hypot(g.tx - g.fx, g.tz - g.fz) / 4.5); g.ft = 0; g.st = 'fly';
          g.yaw = Math.atan2(g.tx - g.fx, g.tz - g.fz);
        } else { g.peck = 1.2; g.tm = 1.5 + Math.random() * 5; g.yaw += (Math.random() - 0.5) * 1.4; }
      }
      let y = g.y, neck = 0.0, wingS = 0.0001, flap = 0;
      if (g.st === 'fly') {
        g.ft += dt / g.fd;
        const u = Math.min(1, g.ft);
        g.x = g.fx + (g.tx - g.fx) * u; g.z = g.fz + (g.tz - g.fz) * u;
        y = L.H(g.x, g.z) + Math.sin(u * Math.PI) * Math.min(6, 1.2 + g.fd * 1.5);
        wingS = 1; flap = Math.sin(t * 13 + i) * 0.7;
        neck = 0.7;
        if (u >= 1) { g.st = 'stand'; g.tm = 2 + Math.random() * 6; g.y = L.H(g.x, g.z); }
      } else if (g.peck > 0) {
        g.peck -= dt;
        neck = Math.max(0, Math.sin((1.2 - g.peck) / 1.2 * Math.PI)) * 1.25;
      }
      if (!near(g.x, g.z, 260)) return;
      this._acRoot(Z, g.x, y, g.z, g.yaw, 1);
      this._acPart(Z, Z.mEgB, ne, 0, 0, 0, 0, 0, 0);
      this._acPart(Z, Z.mEgN, ne, 0, 0.6, 0.13, neck, 0, 0);
      this._acPart(Z, Z.mEgW, ne * 2, 0.06, 0.6, -0.02, 0, 0, flap, wingS, wingS, wingS);
      this._acPart(Z, Z.mEgW, ne * 2 + 1, -0.06, 0.6, -0.02, 0, Math.PI, flap, wingS, wingS, wingS);
      ne++;
    });
    Z.mEgB.count = ne; Z.mEgN.count = ne; Z.mEgW.count = ne * 2;
    // dogs: lie or wander near home
    let nd = 0;
    Z.dogs.forEach((d, i) => {
      let legS = 1, bodyY = 0, headX = 0, tailZ = 0.35 * Math.sin(t * 7 + i);
      if (d.lie) {
        legS = 0.0001; bodyY = -0.27; headX = 0.35 + 0.05 * Math.sin(t * 0.5 + i); tailZ = 0.05 * Math.sin(t * 1.2);
      } else {
        d.wait -= dt;
        const dx = d.tx - d.x, dz = d.tz - d.z, dd = Math.hypot(dx, dz);
        if (dd < 0.3) {
          d.sp = 0;
          if (d.wait < 0) { const a = Math.random() * 6.28, r = 2 + Math.random() * 7; d.tx = d.hx + Math.cos(a) * r; d.tz = d.hz + Math.sin(a) * r; d.wait = 2 + Math.random() * 6; }
        } else if (d.wait < 0 || d.sp > 0) {
          d.sp = Math.min(1.1, d.sp + dt);
          const want = Math.atan2(dx, dz);
          d.yaw = this._angDamp(d.yaw, want, 5, dt);
          d.x += Math.sin(d.yaw) * d.sp * dt; d.z += Math.cos(d.yaw) * d.sp * dt;
          d.y = L.H(d.x, d.z);
        }
        d.ph += d.sp * dt * 3.2;
        headX = 0.1 + (d.sp > 0 ? 0.05 * Math.sin(d.ph * 6.28 * 2) : 0.15 * Math.max(0, Math.sin(t * 0.4 + i)));
      }
      if (!near(d.x, d.z, 220)) return;
      if (!d.lc) d.lc = this._lcol(d.col);
      for (const im of [Z.mDogB, Z.mDogH, Z.mDogT]) im.setColorAt(nd, d.lc);
      for (let k = 0; k < 4; k++) Z.mDogL.setColorAt(nd * 4 + k, d.lc);
      this._acRoot(Z, d.x, d.y, d.z, d.yaw, 1);
      this._acPart(Z, Z.mDogB, nd, 0, bodyY, 0, 0, 0, 0);
      this._acPart(Z, Z.mDogH, nd, 0, 0.56 + bodyY, 0.33, headX, d.lie ? 0.3 * Math.sin(t * 0.2 + i) : 0, 0);
      this._acPart(Z, Z.mDogT, nd, 0, 0.5 + bodyY, -0.3, 0, 0, tailZ);
      const sw = d.lie ? 0 : 0.45 * Math.sin(d.ph * 6.28) * Math.min(1, d.sp);
      const legs = [[0.07, 0.2, sw], [-0.07, 0.2, -sw], [0.07, -0.2, -sw], [-0.07, -0.2, sw]];
      legs.forEach((l, k) => this._acPart(Z, Z.mDogL, nd * 4 + k, l[0], 0.36 + bodyY, l[1], l[2], 0, 0, legS, legS, legS));
      nd++;
    });
    Z.mDogB.count = nd; Z.mDogH.count = nd; Z.mDogT.count = nd; Z.mDogL.count = nd * 4;
    // birds: circling flocks with flapping V wings
    Z.birds.forEach((b, i) => {
      b.ang += b.w * dt;
      const x = b.cx + Math.cos(b.ang) * b.rad, z = b.cz + Math.sin(b.ang) * b.rad;
      const y = b.alt + 4 * Math.sin(t * 0.3 + b.bob);
      const yaw = Math.atan2(-Math.sin(b.ang) * Math.sign(b.w), Math.cos(b.ang) * Math.sign(b.w));
      const glide = Math.sin(t * 0.5 + b.ph) > 0.4;
      const f = glide ? 0.12 : 0.6 * Math.sin(t * 9 + b.ph);
      this._acRoot(Z, x, y, z, yaw, 1);
      this._acPart(Z, Z.mBird, i * 2, 0, 0, 0, 0, 0, 0.15 + f);
      this._acPart(Z, Z.mBird, i * 2 + 1, 0, 0, 0, 0, Math.PI, 0.15 + f);
    });
    for (const im of [Z.mCow[0], Z.mCow[1], Z.mCowHead, Z.mTail, Z.mBuf, Z.mBufHead, Z.mEgB, Z.mEgN, Z.mEgW, Z.mDogB, Z.mDogH, Z.mDogL, Z.mDogT, Z.mBird]) {
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
  }
};
