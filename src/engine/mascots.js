/* GHG Town 3D v0.6 — GCC mascot team: น้องทวน (owl, leader), น้องกล้า (sapling), น้องส่อง (firefly).
   Overrides actors.js _initGuide/_tickGuide; adds _eSpeaker(who, mood, seconds). Private helpers: _ma*. */
GHG3.mascots = {
  // =============================================================== SHARED: materials, geometry
  _maShared() {
    const E = this._E;
    const T = E.T;
    if (E.maS) return E.maS;
    const U = { uL: { value: new T.Vector3(0.3, 0.8, 0.5) }, uK: { value: 1 }, uTint: { value: new T.Color(1, 1, 1) } };
    const vs = [
      'varying vec3 vN; varying vec3 vC; varying vec3 vV; varying vec2 vUv;',
      '#include <fog_pars_vertex>',
      'void main() {',
      '  vC = color; vUv = uv;',
      '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
      '  vN = normalize(normalMatrix * normal);',
      '  vV = -mvPosition.xyz;',
      '  gl_Position = projectionMatrix * mvPosition;',
      '  #include <fog_vertex>',
      '}'
    ].join('\n');
    const fs = [
      'uniform vec3 uL; uniform float uK; uniform vec3 uTint; uniform float uGlow; uniform sampler2D map; uniform float useMap; uniform float alphaCut;',
      'varying vec3 vN; varying vec3 vC; varying vec3 vV; varying vec2 vUv;',
      '#include <fog_pars_fragment>',
      'vec3 s2l(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }',
      'void main() {',
      '  vec4 tc = useMap > 0.5 ? texture2D(map, vUv) : vec4(1.0);',
      '  if (tc.a < alphaCut) discard;',
      '  vec3 base = vC * s2l(tc.rgb);',
      '  vec3 n = normalize(vN);',
      '  if (!gl_FrontFacing) n = -n;',
      '  float d = dot(n, normalize(uL));',
      '  float band = d > 0.18 ? 1.0 : (d > -0.32 ? 0.87 : 0.76);',
      '  float rim = pow(1.0 - clamp(abs(dot(n, normalize(vV))), 0.0, 1.0), 3.0);',
      '  vec3 col = base * band * uK * uTint + base * rim * 0.08 * uK;',
      '  col = mix(col, base * 1.15, uGlow);',
      '  gl_FragColor = vec4(col, 1.0);',
      '  #include <encodings_fragment>',
      '  #include <fog_fragment>',
      '}'
    ].join('\n');
    const white = new T.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    white.needsUpdate = true;
    const toon = (map, o) => {
      o = o || {};
      const m = new T.ShaderMaterial({
        uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { uGlow: { value: o.glow || 0 }, map: { value: null }, useMap: { value: map ? 1 : 0 }, alphaCut: { value: o.cut || 0 } }]),
        vertexShader: vs, fragmentShader: fs, vertexColors: true, fog: true, toneMapped: false, side: o.side || T.FrontSide
      });
      m.uniforms.map.value = map || white;
      m.uniforms.uL = U.uL; m.uniforms.uK = U.uK; m.uniforms.uTint = U.uTint;
      return m;
    };
    const outlines = {};
    const outline = (hex) => {
      if (!outlines[hex]) outlines[hex] = new T.MeshBasicMaterial({ color: this._lcol(hex), side: T.BackSide, fog: true, toneMapped: false });
      return outlines[hex];
    };
    // base geometries (unit sizes)
    const sph = new T.SphereGeometry(1, 32, 22);
    const egg = (k) => {
      const g = new T.SphereGeometry(1, 32, 22);
      const P = g.attributes.position;
      for (let i = 0; i < P.count; i++) {
        const y = P.getY(i);
        const f = 1 - k * Math.max(0, y);
        P.setX(i, P.getX(i) * f); P.setZ(i, P.getZ(i) * f);
      }
      g.computeVertexNormals();
      return g;
    };
    const G = {
      sph: sph,
      sphLo: new T.SphereGeometry(1, 16, 12),
      sphMid: new T.SphereGeometry(1, 18, 12),
      sphTiny: new T.SphereGeometry(1, 8, 6),
      sph12: new T.SphereGeometry(1, 12, 9),
      torusLo: new T.TorusGeometry(1, 0.13, 5, 22),
      coneB: new T.ConeGeometry(1, 1, 22, 1).translate(0, 0.5, 0),
      brim: new T.CylinderGeometry(1.0, 1.42, 1, 22, 1, true).translate(0, -0.5, 0),
      boxU: new T.BoxGeometry(1, 1, 1),
      cylLo: new T.CylinderGeometry(1, 1, 1, 10, 1, true),
      eggOwl: egg(0.08), eggSap: egg(0.05), eggBean: egg(0.14),
      soft: (() => {
        // rounded cone (unit radius / height, centred like ConeGeometry): soft tip instead of a sharp point
        const pts = [];
        for (const yy of [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.87, 0.95, 1]) pts.push(new T.Vector2(Math.pow(Math.max(0, 1 - Math.pow(yy, 1.4)), 1 / 1.35), yy - 0.5));
        pts[pts.length - 1].x = 0;
        return new T.LatheGeometry(pts, 12);
      })(),
      disc: new T.CircleGeometry(1, 22),
      cone: new T.ConeGeometry(1, 1, 18, 1),
      cyl: new T.CylinderGeometry(1, 1, 1, 18, 1),
      torus: new T.TorusGeometry(1, 0.13, 8, 32)
    };
    // contact shadows (one instanced mesh for the whole team)
    const shMat = new T.MeshBasicMaterial({ map: E.tex.glow, color: 0x000000, transparent: true, opacity: 0.42, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const shadow = new T.InstancedMesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), shMat, 3);
    shadow.frustumCulled = false;
    shadow.renderOrder = 2;
    E.scene.add(shadow);
    // firefly light cone ("ส่องให้ชัด")
    const coneMat = new T.ShaderMaterial({
      uniforms: { uCol: { value: this._lcol('#E8F86A') }, uA: { value: 0 } },
      vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uCol; uniform float uA; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float e = abs(dot(normalize(vN), normalize(vV))); float a = uA * pow(vUv.y, 1.2) * (0.25 + 0.75 * e); gl_FragColor = vec4(uCol * a, a); }',
      transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, toneMapped: false
    });
    const cone = new T.Mesh(new T.ConeGeometry(1, 1, 28, 1, true), coneMat);
    cone.visible = false;
    cone.frustumCulled = false;
    cone.renderOrder = 6;
    E.scene.add(cone);
    E.maS = { U: U, toon: toon, outline: outline, G: G, shadow: shadow, cone: cone, coneMat: coneMat, sM: new T.Matrix4() };
    return E.maS;
  },

  // put a geometry into an accumulator with a YXZ euler rotation (so local +z can follow a surface normal)
  _maPut(A, geo, x, y, z, sx, sy, sz, rx, ry, rz, col) {
    const E = this._E;
    const T = E.T;
    if (!E._maM) { E._maM = new T.Matrix4(); E._maN = new T.Matrix3(); E._maQ = new T.Quaternion(); E._maE = new T.Euler(0, 0, 0, 'YXZ'); E._maV = new T.Vector3(); E._maSc = new T.Vector3(); E._maP = new T.Vector3(); }
    E._maE.set(rx || 0, ry || 0, rz || 0, 'YXZ');
    E._maQ.setFromEuler(E._maE);
    E._maM.compose(E._maP.set(x, y, z), E._maQ, E._maSc.set(sx, sy, sz));
    E._maN.getNormalMatrix(E._maM);
    const cc = this._lc(col);
    const P = geo.attributes.position, N = geo.attributes.normal, UV = geo.attributes.uv;
    const k = A.vc;
    const v = E._maV;
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i).applyMatrix4(E._maM);
      A.p.push(v.x, v.y, v.z);
      v.fromBufferAttribute(N, i).applyMatrix3(E._maN).normalize();
      A.n.push(v.x, v.y, v.z);
      A.u.push(UV ? UV.getX(i) : 0, UV ? UV.getY(i) : 0);
      A.c.push(cc[0], cc[1], cc[2]);
    }
    if (geo.index) { const I = geo.index.array; for (let i = 0; i < I.length; i++) A.i.push(k + I[i]); }
    else for (let i = 0; i < P.count; i++) A.i.push(k + i);
    A.vc += P.count;
  },
  // tube through points (smooth joints)
  _maTube(A, pts, r, col) {
    const E = this._E;
    const T = E.T;
    const G = this._maShared().G;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const len = Math.hypot(dx, dy, dz);
      if (len < 1e-5) continue;
      const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / len, dy / len, dz / len));
      const eu = new T.Euler().setFromQuaternion(q, 'YXZ');
      this._maPut(A, G.cylLo, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, r, len, r, eu.x, eu.y, eu.z, col);
      this._maPut(A, G.sphTiny, b[0], b[1], b[2], r, r, r, 0, 0, 0, col);
      if (i === 0) this._maPut(A, G.sphTiny, a[0], a[1], a[2], r, r, r, 0, 0, 0, col);
    }
  },
  // point on the front of an (egg-)ellipsoid; returns position pushed along the normal + YXZ angles
  _maSurf(c, r, egg, x, y, push) {
    const dy = (y - c[1]) / r[1];
    const f = 1 - egg * Math.max(0, dy);
    const ax = r[0] * f, az = r[2] * f;
    const dx = (x - c[0]) / ax;
    const dz = Math.sqrt(Math.max(1e-4, 1 - dx * dx - dy * dy));
    const z = c[2] + az * dz;
    let nx = dx / ax, ny = dy / r[1], nz = dz / az;
    const l = Math.hypot(nx, ny, nz);
    nx /= l; ny /= l; nz /= l;
    return { p: [x + nx * push, y + ny * push, z + nz * push], rx: -Math.asin(ny), ry: Math.atan2(nx, nz), n: [nx, ny, nz] };
  },
  // inverted-hull outline: push every vertex along its averaged normal
  _maShell(geo, t) {
    const g = geo.clone();
    const P = g.attributes.position, N = g.attributes.normal;
    const key = (i) => Math.round(P.getX(i) * 2000) + ',' + Math.round(P.getY(i) * 2000) + ',' + Math.round(P.getZ(i) * 2000);
    const acc = new Map();
    for (let i = 0; i < P.count; i++) {
      const k = key(i);
      let a = acc.get(k);
      if (!a) { a = [0, 0, 0]; acc.set(k, a); }
      a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i);
    }
    const moved = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) {
      const a = acc.get(key(i));
      const l = Math.hypot(a[0], a[1], a[2]) || 1;
      moved[i * 3] = P.getX(i) + (a[0] / l) * t;
      moved[i * 3 + 1] = P.getY(i) + (a[1] / l) * t;
      moved[i * 3 + 2] = P.getZ(i) + (a[2] / l) * t;
    }
    P.array.set(moved);
    P.needsUpdate = true;
    if (g.attributes.color) g.deleteAttribute('color');
    if (g.attributes.uv) g.deleteAttribute('uv');
    g.computeBoundingSphere();
    return g;
  },
  _maMesh(geo, mat, parent, o) {
    const T = this._E.T;
    const m = new T.Mesh(geo, mat);
    m.castShadow = !(o && o.noShadow);
    m.receiveShadow = false;
    if (o && o.order != null) m.renderOrder = o.order;
    parent.add(m);
    return m;
  },
  // textured (egg-)sphere body: returns geometry with uv + white vertex colours
  _maBall(geoKey, c, r) {
    const E = this._E;
    const T = E.T;
    const g = this._maShared().G[geoKey].clone();
    g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(c[0], c[1], c[2]), new T.Quaternion(), new T.Vector3(r[0], r[1], r[2])));
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3).fill(1);
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  },

  // =============================================================== PAINTED SKINS (front projection of the vector art)
  _maRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; },
  // signed distances (metres, negative inside)
  _maSdC(X, Y, cx, cy, r) { return Math.hypot(X - cx, Y - cy) - r; },
  _maSdE(X, Y, cx, cy, rx, ry) { return (Math.hypot((X - cx) / rx, (Y - cy) / ry) - 1) * Math.min(rx, ry); },
  _maSdSmile(X, Y, cx, yc, hw, sag, tw) {
    const u = (X - cx) / hw;
    if (Math.abs(u) <= 1) return Math.abs(Y - (yc + sag * u * u)) - tw / 2;
    const ex = cx + Math.sign(u) * hw, ey = yc + sag;
    return Math.hypot(X - ex, Y - ey) - tw / 2;
  },
  _maSdArc(X, Y, cx, cy, R, a0, a1, w) {
    const a = Math.atan2(Y - cy, X - cx);
    if (a >= a0 && a <= a1) return Math.abs(Math.hypot(X - cx, Y - cy) - R) - w / 2;
    const d0 = Math.hypot(X - (cx + Math.cos(a0) * R), Y - (cy + Math.sin(a0) * R));
    const d1 = Math.hypot(X - (cx + Math.cos(a1) * R), Y - (cy + Math.sin(a1) * R));
    return Math.min(d0, d1) - w / 2;
  },
  _maSdSeg(X, Y, ax, ay, bx, by, w) {
    const vx = bx - ax, vy = by - ay;
    const t = Math.max(0, Math.min(1, ((X - ax) * vx + (Y - ay) * vy) / (vx * vx + vy * vy)));
    return Math.hypot(X - (ax + vx * t), Y - (ay + vy * t)) - w / 2;
  },
  // paint a sphere-UV texture by evaluating layers in front-projected metres (X across, Y up)
  _maPaint(W, H, P) {
    const T = this._E.T;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const im = g.createImageData(W, H);
    const D = im.data;
    const base = P.base ? this._maRgb(P.base) : null;
    const layers = P.layers.map((L) => ({ sd: L.sd, c: this._maRgb(L.c), a: L.a == null ? 1 : L.a, bb: L.bb || null, wrap: !!L.wrap }));
    const anyWrap = layers.some((L) => L.wrap);
    const px = P.px || 0.0028;
    const cph = new Float32Array(W), sph = new Float32Array(W);
    for (let i = 0; i < W; i++) { const ph = ((i + 0.5) / W) * Math.PI * 2; cph[i] = Math.cos(ph); sph[i] = Math.sin(ph); }
    for (let j = 0; j < H; j++) {
      const th = ((j + 0.5) / H) * Math.PI;
      const dy = Math.cos(th), st = Math.sin(th);
      const f = 1 - (P.egg || 0) * Math.max(0, dy);
      const Y = P.cy + dy * P.ay;
      for (let i = 0; i < W; i++) {
        let r = 0, gg = 0, b = 0, a = 0;
        if (base) { r = base[0]; gg = base[1]; b = base[2]; a = 255; }
        const dz = sph[i] * st;
        if (dz > 0.03 || anyWrap) {
          const X = P.cx + (-cph[i] * st) * P.ax * f;
          for (const L of layers) {
            if (dz <= 0.03 && !L.wrap) continue;
            if (L.bb && (X < L.bb[0] || X > L.bb[2] || Y < L.bb[1] || Y > L.bb[3])) continue;
            const d = L.sd(X, Y);
            if (d > px) continue;
            const cov = (d < -px ? 1 : 0.5 - d / (2 * px)) * L.a;
            if (a < 1) { r = L.c[0]; gg = L.c[1]; b = L.c[2]; a = 255 * cov; continue; }
            r += (L.c[0] - r) * cov; gg += (L.c[1] - gg) * cov; b += (L.c[2] - b) * cov;
            a += (255 - a) * cov;
          }
        }
        const o = (j * W + i) * 4;
        D[o] = r; D[o + 1] = gg; D[o + 2] = b; D[o + 3] = a;
      }
    }
    g.putImageData(im, 0, 0);
    const tex = new T.CanvasTexture(cv);
    tex.anisotropy = 4;
    const E = this._E;
    E.tex['ma_skin_' + Object.keys(E.tex).length] = tex;
    return tex;
  },

  // =============================================================== CHARACTERS
  _maRig(id, root, body) {
    const T = this._E.T;
    return {
      id: id, root: root, body: body, pos: new T.Vector3(), vel: new T.Vector3(), yaw: 0, speed: 0, phase: Math.random() * 6,
      mode: 'idle', blinkT: 1 + Math.random() * 3, blinkOn: 0, j: { bob: 0, jump: 0, lean: 0, sway: 0, twist: 0, aPx: 0, aPz: 0, aNx: 0, aNz: 0, aPy: 0, aNy: 0, beak: 0, cx: 0, cz: 0 },
      hopV: 0, hopY: 0, happy: 0, talkA: 0, mouthOpen: false, seed: Math.random() * 6
    };
  },

  _maBuildOwl() {
    const E = this._E;
    const T = E.T;
    const S = this._maShared();
    const G = S.G;
    const C = { body: '#3F5F4A', wing: '#36553F', tuft: '#3B5A47', cream: '#F7F1E1', amber: '#FFB703', beak: '#F5A01A', line: '#19261E', ol: '#24392D', blush: '#F59C93', g: '#42B236', c: '#10C0E5', a: '#FFB703', white: '#FFFFFF', glass: '#D6D2C6', pupil: '#1B2921' };
    const bc = [0, 0.60, 0], br = [0.35, 0.51, 0.325], egg = 0.08;
    const EX = 0.13, EY = 0.85;
    const root = new T.Group();
    const body = new T.Group();
    root.add(body);
    const R = this._maRig('owl', root, body);
    // painted skin (front projection of the sheet art): big cream face, big eyes with two highlights + a sparkle, rosy cheeks
    const sdE = this._maSdE.bind(this), sdC = this._maSdC.bind(this), sdSm = this._maSdSmile.bind(this), sdArc = this._maSdArc.bind(this);
    const mask = (X, Y) => Math.min(sdE(X, Y, -EX, EY, 0.158, 0.152), sdE(X, Y, EX, EY, 0.158, 0.152), sdE(X, Y, 0, EY + 0.035, 0.13, 0.105));
    const L = [];
    L.push({ sd: (X, Y) => mask(X, Y) - 0.011, c: C.line });
    L.push({ sd: mask, c: C.cream });
    L.push({ sd: (X, Y) => sdE(X, Y, 0, 0.425, 0.24, 0.215), c: C.cream });
    L.push({ sd: (X, Y) => sdSm(X, Y, 0, 0.505, 0.12, 0.028, 0.034), c: C.g });
    L.push({ sd: (X, Y) => sdSm(X, Y, 0, 0.441, 0.1, 0.026, 0.034), c: C.c });
    L.push({ sd: (X, Y) => sdSm(X, Y, 0, 0.379, 0.07, 0.02, 0.034), c: C.a });
    for (const s of [-1, 1]) {
      const ex = s * EX, ey = EY;
      const bb = [ex - 0.13, ey - 0.13, ex + 0.13, ey + 0.13];
      L.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.112), c: C.line, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.1), c: C.amber, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex - s * 0.004, ey + 0.002, 0.057), c: C.pupil, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex + 0.028, ey + 0.031, 0.025), c: C.white, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex - 0.028, ey - 0.031, 0.0115), c: C.white, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex + 0.047, ey - 0.008, 0.0058), c: C.white, a: 0.9, bb: bb });
      L.push({ sd: (X, Y) => sdSm(X, Y, ex, 0.992 + (s > 0 ? 0.01 : 0), 0.05, -0.012, 0.0135), c: C.line, bb: [ex - 0.08, 0.95, ex + 0.08, 1.04] });
      L.push({ sd: (X, Y) => sdE(X, Y, s * 0.245, 0.742, 0.05, 0.029), c: C.blush, a: 0.95, bb: [s * 0.245 - 0.06, 0.7, s * 0.245 + 0.06, 0.78] });
    }
    // monocle on the +x eye (viewer's right) + chain dots
    L.push({ sd: (X, Y) => Math.abs(sdC(X, Y, EX, EY, 0.13)) - 0.0082, c: C.line, bb: [-0.01, 0.7, 0.28, 1.0] });
    L.push({ sd: (X, Y) => Math.abs(sdC(X, Y, EX, EY, 0.12)) - 0.004, c: C.glass, bb: [-0.01, 0.7, 0.28, 1.0] });
    const dots = [];
    for (let k = 0; k < 9; k++) { const t = k / 8; dots.push([0.236 + 0.08 * t - 0.03 * t * t, 0.75 - 0.28 * t]); }
    L.push({ sd: (X, Y) => { let m = 9; for (const d of dots) m = Math.min(m, Math.hypot(X - d[0], Y - d[1])); return m - 0.007; }, c: C.line, bb: [0.19, 0.44, 0.35, 0.79] });
    const skin = this._maPaint(1024, 512, { cx: 0, cy: bc[1], ax: br[0], ay: br[1], egg: egg, base: C.body, layers: L, px: 0.0026 });
    // closed / happy eyes overlay (^ ^)
    const LL = [];
    for (const s of [-1, 1]) {
      const ex = s * EX, ey = EY;
      LL.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.113), c: C.cream, bb: [ex - 0.13, ey - 0.13, ex + 0.13, ey + 0.13] });
      LL.push({ sd: (X, Y) => sdArc(X, Y, ex, ey - 0.038, 0.066, 0.45, 2.69, 0.017), c: C.line, bb: [ex - 0.1, ey - 0.05, ex + 0.1, ey + 0.06] });
    }
    const lidTex = this._maPaint(512, 256, { cx: 0, cy: bc[1], ax: br[0], ay: br[1], egg: egg, base: null, layers: LL, px: 0.004 });
    R.bodyMesh = this._maMesh(this._maBall('eggOwl', bc, br), S.toon(skin), body);
    R.lids = this._maMesh(this._maBall('eggOwl', bc, [br[0] * 1.004, br[1] * 1.004, br[2] * 1.004]), S.toon(lidTex, { cut: 0.5 }), body, { noShadow: true });
    R.lids.visible = false;
    // soft ear tufts, small rounded beak, small feet
    const partsSrc = (A) => {
      for (const s of [-1, 1]) this._maPut(A, G.soft, s * 0.208, 1.06, -0.035, 0.085, 0.215, 0.072, -0.12, 0, -s * 0.36, C.tuft);
      for (const s of [-1, 1]) this._maPut(A, G.sphMid, s * 0.112, 0.035, 0.115, 0.07, 0.04, 0.086, 0, 0, 0, C.beak);
      const q = this._maSurf(bc, br, egg, 0, 0.806, 0.012);
      this._maPut(A, G.soft, q.p[0], q.p[1] - 0.01, q.p[2] + 0.012, 0.038, 0.064, 0.03, 2.75, q.ry, 0, C.beak);
    };
    R.parts = this._maMesh(this._bake((A) => partsSrc(A)), S.toon(null), body);
    const olSrc = this._bake((A) => { this._maPut(A, G.eggOwl, bc[0], bc[1], bc[2], br[0], br[1], br[2], 0, 0, 0, C.line); partsSrc(A); });
    R.outline = this._maMesh(this._maShell(olSrc, 0.0125), S.outline(C.ol), body, { noShadow: true });
    // lower beak (talking)
    const qb = this._maSurf(bc, br, egg, 0, 0.785, 0.014);
    R.beakPivot = new T.Group();
    R.beakPivot.position.set(qb.p[0], qb.p[1], qb.p[2]);
    body.add(R.beakPivot);
    R.beakLow = this._maMesh(this._bake((A) => this._maPut(A, G.soft, 0, -0.02, 0.01, 0.028, 0.044, 0.022, Math.PI - 0.25, 0, 0, '#DB8A00')), S.toon(null), R.beakPivot, { noShadow: true });
    // wings
    R.arms = [];
    for (const s of [1, -1]) {
      const piv = new T.Group();
      piv.position.set(s * 0.322, 0.80, -0.025);
      body.add(piv);
      const wgeo = this._bake((A) => this._maPut(A, G.sphMid, s * 0.04, -0.255, 0.005, 0.085, 0.29, 0.19, 0, 0, s * 0.1, C.wing));
      this._maMesh(wgeo, S.toon(null), piv);
      this._maMesh(this._maShell(wgeo, 0.011), S.outline(C.ol), piv, { noShadow: true });
      R.arms.push({ s: s, piv: piv });
    }
    // magnifier prop (inspect): held in front of the monocle eye
    R.prop = this._maMagnifier(body, 0.155, 0.84, 0.395, 0.1, C.line);
    // context outfits (site / rain / farmer / forest / recycle / grad)
    this._maOutfits(R, { y: 0.995, z: 0.0, r: 0.2, vest: [0.27, 0.55, bc, br], line: C.ol, scroll: [0.07, -0.47, 0.14] });
    R.size = 1.25;
    R.shadowR = 0.62;
    return R;
  },

  _maBuildSapling() {
    const E = this._E;
    const T = E.T;
    const S = this._maShared();
    const G = S.G;
    const C = { trunk: '#A8784F', grain: '#8F6140', face: '#F6E7C8', crown: '#3E9B3A', spot: '#62C04E', leaf: '#4FAF3F', vein: '#3A8F33', root: '#7A5235', line: '#33261A', ol: '#3E2C1E', rim: '#4A3020', iris: '#8B5A35', pupil: '#2E2016', white: '#FFFFFF', blush: '#F39A90', g: '#42B236', c: '#10C0E5', a: '#FFB703' };
    const bc = [0, 0.50, 0], br = [0.285, 0.395, 0.262], egg = 0.05;
    const EX = 0.09, EY = 0.632;
    const root = new T.Group();
    const body = new T.Group();
    root.add(body);
    const R = this._maRig('sapling', root, body);
    const sdE = this._maSdE.bind(this), sdC = this._maSdC.bind(this), sdSm = this._maSdSmile.bind(this), sdArc = this._maSdArc.bind(this), sdSeg = this._maSdSeg.bind(this);
    const L = [];
    // soft trunk grain
    for (const s of [-1, 1]) {
      L.push({ sd: (X, Y) => Math.min(sdSeg(X, Y, s * 0.17, 0.13, s * 0.214, 0.30, 0.01), sdSeg(X, Y, s * 0.214, 0.30, s * 0.2, 0.40, 0.01)), c: C.grain, a: 0.8, bb: [s * 0.25 - 0.07, 0.1, s * 0.25 + 0.07, 0.43] });
      L.push({ sd: (X, Y) => sdSeg(X, Y, s * 0.115, 0.12, s * 0.14, 0.22, 0.0085), c: C.grain, a: 0.8, bb: [s * 0.12 - 0.05, 0.1, s * 0.12 + 0.05, 0.25] });
    }
    L.push({ sd: (X, Y) => sdE(X, Y, 0, 0.612, 0.222, 0.152), c: C.face });
    for (const s of [-1, 1]) {
      const ex = s * EX, ey = EY;
      const bb = [ex - 0.09, ey - 0.09, ex + 0.09, ey + 0.09];
      L.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.075), c: C.rim, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.064), c: C.iris, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex, ey + 0.002, 0.039), c: C.pupil, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex + 0.022, ey + 0.024, 0.018), c: C.white, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex - 0.022, ey - 0.022, 0.0088), c: C.white, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex + 0.035, ey - 0.008, 0.0045), c: C.white, a: 0.9, bb: bb });
      L.push({ sd: (X, Y) => sdSm(X, Y, ex, 0.724, 0.036, -0.008, 0.0105), c: C.line, bb: [ex - 0.05, 0.7, ex + 0.05, 0.74] });
      L.push({ sd: (X, Y) => sdE(X, Y, s * 0.165, 0.572, 0.042, 0.024), c: C.blush, a: 0.95, bb: [s * 0.165 - 0.05, 0.54, s * 0.165 + 0.05, 0.6] });
    }
    L.push({ sd: (X, Y) => sdArc(X, Y, 0, 0.578, 0.032, -2.55, -0.59, 0.0095), c: C.line, bb: [-0.05, 0.53, 0.05, 0.585] });
    const em = [[0.086, C.line], [0.077, C.g], [0.064, C.white], [0.052, C.c], [0.039, C.white], [0.026, C.a]];
    for (const e of em) L.push({ sd: (X, Y) => sdC(X, Y, 0, 0.36, e[0]), c: e[1], bb: [-0.1, 0.26, 0.1, 0.46] });
    const skin = this._maPaint(1024, 512, { cx: 0, cy: bc[1], ax: br[0], ay: br[1], egg: egg, base: C.trunk, layers: L, px: 0.0022 });
    const LL = [];
    for (const s of [-1, 1]) {
      const ex = s * EX, ey = EY;
      LL.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.077), c: C.face, bb: [ex - 0.09, ey - 0.09, ex + 0.09, ey + 0.09] });
      LL.push({ sd: (X, Y) => sdArc(X, Y, ex, ey - 0.022, 0.044, 0.5, 2.64, 0.012), c: C.line, bb: [ex - 0.065, ey - 0.04, ex + 0.065, ey + 0.045] });
    }
    const lidTex = this._maPaint(512, 256, { cx: 0, cy: bc[1], ax: br[0], ay: br[1], egg: egg, base: null, layers: LL, px: 0.004 });
    const LM = [
      { sd: (X, Y) => sdE(X, Y, 0, 0.564, 0.042, 0.027), c: C.face, bb: [-0.055, 0.53, 0.055, 0.6] },
      { sd: (X, Y) => sdE(X, Y, 0, 0.562, 0.027, 0.019), c: '#5A2A1E', bb: [-0.04, 0.535, 0.04, 0.59] },
      { sd: (X, Y) => sdE(X, Y, 0, 0.551, 0.017, 0.008), c: '#E88B7E', bb: [-0.03, 0.537, 0.03, 0.567] }
    ];
    const mouthTex = this._maPaint(512, 256, { cx: 0, cy: bc[1], ax: br[0], ay: br[1], egg: egg, base: null, layers: LM, px: 0.003 });
    R.bodyMesh = this._maMesh(this._maBall('eggSap', bc, br), S.toon(skin), body);
    R.lids = this._maMesh(this._maBall('eggSap', bc, [br[0] * 1.005, br[1] * 1.005, br[2] * 1.005]), S.toon(lidTex, { cut: 0.5 }), body, { noShadow: true });
    R.lids.visible = false;
    R.mouth = this._maMesh(this._maBall('eggSap', bc, [br[0] * 1.004, br[1] * 1.004, br[2] * 1.004]), S.toon(mouthTex, { cut: 0.5 }), body, { noShadow: true });
    R.mouth.visible = false;
    const feet = (A, col) => { for (const s of [-1, 1]) this._maPut(A, G.sphMid, s * 0.095, 0.04, 0.06, 0.075, 0.042, 0.09, 0, 0, 0, col || C.root); };
    R.parts = this._maMesh(this._bake((A) => feet(A)), S.toon(null), body);
    const olSrc = this._bake((A) => { this._maPut(A, G.eggSap, bc[0], bc[1], bc[2], br[0], br[1], br[2], 0, 0, 0, C.line); feet(A, C.line); });
    R.outline = this._maMesh(this._maShell(olSrc, 0.012), S.outline(C.ol), body, { noShadow: true });
    // crown (sways)
    R.crown = new T.Group();
    R.crown.position.set(0, 0.855, -0.02);
    body.add(R.crown);
    const blobs = [[0, 0.11, 0, 0.235], [0.17, 0.06, 0.04, 0.165], [-0.17, 0.06, 0.04, 0.165], [0.12, 0.2, 0.0, 0.165], [-0.12, 0.2, 0.0, 0.165], [0, 0.265, -0.02, 0.155],
      [0.24, -0.01, -0.05, 0.135], [-0.24, -0.01, -0.05, 0.135], [0.08, 0.0, 0.13, 0.135], [-0.08, 0.0, 0.13, 0.135], [0, 0.12, -0.15, 0.185]];
    const crownSrc = (A, col) => { for (const b of blobs) this._maPut(A, G.sph12, b[0], b[1], b[2], b[3], b[3] * 0.93, b[3], 0, 0, 0, col); };
    const spots = [[0.06, 0.315, 0.09, 0.048], [-0.15, 0.245, 0.1, 0.038], [0.2, 0.145, 0.12, 0.032], [-0.05, 0.165, 0.2, 0.032], [0.13, 0.055, 0.2, 0.028], [-0.22, 0.085, 0.1, 0.03]];
    this._maMesh(this._bake((A) => {
      crownSrc(A, C.crown);
      for (const p of spots) {
        const l = Math.hypot(p[0], p[1] - 0.1, p[2]) || 1;
        const nx = p[0] / l, ny = (p[1] - 0.1) / l, nz = p[2] / l;
        this._maPut(A, G.sphTiny, p[0], p[1], p[2], p[3], p[3], p[3] * 0.35, -Math.asin(ny), Math.atan2(nx, nz), 0, C.spot);
      }
    }), S.toon(null), R.crown);
    this._maMesh(this._maShell(this._bake((A) => crownSrc(A, C.line)), 0.013), S.outline(C.ol), R.crown, { noShadow: true });
    // leaf arms (soft rounded tips)
    R.arms = [];
    for (const s of [1, -1]) {
      const piv = new T.Group();
      piv.position.set(s * 0.262, 0.70, 0.0);
      body.add(piv);
      const leaf = (A, col) => {
        this._maPut(A, G.sphMid, s * 0.045, -0.2, 0.025, 0.06, 0.22, 0.125, 0, 0, s * 0.12, col);
        this._maPut(A, G.soft, s * 0.083, -0.405, 0.025, 0.05, 0.1, 0.075, Math.PI, 0, -s * 0.18, col);
      };
      const g = this._bake((A) => { leaf(A, C.leaf); this._maPut(A, G.cyl, s * 0.1, -0.2, 0.026, 0.0055, 0.32, 0.0055, 0, 0, s * 0.12, C.vein); });
      this._maMesh(g, S.toon(null), piv);
      this._maMesh(this._maShell(this._bake((A) => leaf(A, C.line)), 0.011), S.outline(C.ol), piv, { noShadow: true });
      R.arms.push({ s: s, piv: piv });
    }
    R.prop = this._maMagnifier(body, 0.105, 0.632, 0.335, 0.075, C.line);
    this._maOutfits(R, { y: 1.17, z: -0.02, r: 0.2, vest: [0.22, 0.47, bc, br], line: C.ol, scroll: [0.09, -0.4, 0.12] });
    R.size = 1.2;
    R.shadowR = 0.55;
    return R;
  },

  // firefly: big round helmet head, ONE smooth bean body (navy top with flat painted GCC bands, glowing round tail),
  // tiny round nub arms, little round feet, small rounded petal wings — no muscles anywhere
  _maBuildFirefly() {
    const E = this._E;
    const T = E.T;
    const S = this._maShared();
    const G = S.G;
    const C = { navy: '#24495A', dark: '#21414F', face: '#F7F1E1', line: '#0E1D24', ol: '#173342', eye: '#141E24', white: '#FFFFFF', glow: '#E4F77A', wing: '#D6F5FC', blush: '#F59C93', gloss: '#86B3C6', g: '#42B236', c: '#10C0E5', a: '#FFB703' };
    const hc = [0, 0.505, 0], hr = [0.2, 0.19, 0.186];
    const bc = [0, 0.215, 0], br = [0.148, 0.168, 0.138], begg = 0.14;
    const root = new T.Group();
    const body = new T.Group();
    root.add(body);
    const R = this._maRig('firefly', root, body);
    const sdE = this._maSdE.bind(this), sdC = this._maSdC.bind(this), sdSm = this._maSdSmile.bind(this), sdArc = this._maSdArc.bind(this);
    const sdRE = (X, Y, cx, cy, rx, ry, a) => {
      const c = Math.cos(a), s = Math.sin(a), dx = X - cx, dy = Y - cy;
      const u = dx * c + dy * s, v = -dx * s + dy * c;
      return (Math.hypot(u / rx, v / ry) - 1) * Math.min(rx, ry);
    };
    // helmet head: soft gloss highlight, big face window, big eyes (two highlights + sparkle), blush, small smile
    const L = [];
    L.push({ sd: (X, Y) => sdRE(X, Y, -0.098, 0.618, 0.052, 0.021, 0.62), c: C.gloss, a: 0.85, bb: [-0.17, 0.56, -0.03, 0.68] });
    L.push({ sd: (X, Y) => sdC(X, Y, -0.05, 0.656, 0.011), c: '#A9CEDC', a: 0.9, bb: [-0.07, 0.635, -0.03, 0.675] });
    L.push({ sd: (X, Y) => sdE(X, Y, 0, 0.465, 0.155, 0.133) - 0.0085, c: C.line });
    L.push({ sd: (X, Y) => sdE(X, Y, 0, 0.465, 0.155, 0.133), c: C.face });
    for (const s of [-1, 1]) {
      const ex = s * 0.068, ey = 0.478;
      const bb = [ex - 0.08, ey - 0.08, ex + 0.08, ey + 0.08];
      L.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.061), c: C.eye, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex + 0.02, ey + 0.022, 0.021), c: C.white, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex - 0.022, ey - 0.023, 0.0095), c: C.white, bb: bb });
      L.push({ sd: (X, Y) => sdC(X, Y, ex + 0.034, ey - 0.012, 0.0048), c: C.white, a: 0.9, bb: bb });
      L.push({ sd: (X, Y) => sdSm(X, Y, ex, 0.566, 0.029, -0.007, 0.009), c: C.line, bb: [ex - 0.045, 0.545, ex + 0.045, 0.58] });
      L.push({ sd: (X, Y) => sdE(X, Y, s * 0.113, 0.437, 0.03, 0.017), c: C.blush, a: 0.95, bb: [s * 0.113 - 0.04, 0.415, s * 0.113 + 0.04, 0.46] });
    }
    L.push({ sd: (X, Y) => sdArc(X, Y, 0, 0.438, 0.021, -2.5, -0.64, 0.0082), c: C.line, bb: [-0.04, 0.405, 0.04, 0.445] });
    const skin = this._maPaint(1024, 512, { cx: 0, cy: hc[1], ax: hr[0], ay: hr[1], egg: 0, base: C.navy, layers: L, px: 0.0016 });
    const LL = [];
    for (const s of [-1, 1]) {
      const ex = s * 0.068, ey = 0.478;
      LL.push({ sd: (X, Y) => sdC(X, Y, ex, ey, 0.064), c: C.face, bb: [ex - 0.08, ey - 0.08, ex + 0.08, ey + 0.08] });
      LL.push({ sd: (X, Y) => sdArc(X, Y, ex, ey - 0.02, 0.037, 0.5, 2.64, 0.011), c: C.line, bb: [ex - 0.055, ey - 0.035, ex + 0.055, ey + 0.04] });
    }
    const lidTex = this._maPaint(512, 256, { cx: 0, cy: hc[1], ax: hr[0], ay: hr[1], egg: 0, base: null, layers: LL, px: 0.003 });
    const LM = [
      { sd: (X, Y) => sdE(X, Y, 0, 0.428, 0.031, 0.021), c: C.face, bb: [-0.04, 0.4, 0.04, 0.455] },
      { sd: (X, Y) => sdE(X, Y, 0, 0.426, 0.02, 0.015), c: '#5A2A1E', bb: [-0.03, 0.405, 0.03, 0.445] },
      { sd: (X, Y) => sdE(X, Y, 0, 0.418, 0.012, 0.006), c: '#E88B7E', bb: [-0.02, 0.405, 0.02, 0.43] }
    ];
    const mouthTex = this._maPaint(512, 256, { cx: 0, cy: hc[1], ax: hr[0], ay: hr[1], egg: 0, base: null, layers: LM, px: 0.0025 });
    R.bodyMesh = this._maMesh(this._maBall('sph', hc, hr), S.toon(skin), body);
    R.lids = this._maMesh(this._maBall('sph', hc, [hr[0] * 1.006, hr[1] * 1.006, hr[2] * 1.006]), S.toon(lidTex, { cut: 0.5 }), body, { noShadow: true });
    R.lids.visible = false;
    R.mouth = this._maMesh(this._maBall('sph', hc, [hr[0] * 1.005, hr[1] * 1.005, hr[2] * 1.005]), S.toon(mouthTex, { cut: 0.5 }), body, { noShadow: true });
    R.mouth.visible = false;
    // bean body: one smooth egg; the three GCC bands are flat paint; split at a latitude row so the tail glows (unlit)
    const BL = [];
    const band = (yc, w, col) => BL.push({ sd: (X, Y) => Math.abs(Y - (yc + 0.006 * (X / br[0]) * (X / br[0]))) - w / 2, c: col, wrap: true });
    band(0.32, 0.03, C.g);
    band(0.277, 0.03, C.c);
    band(0.234, 0.03, C.a);
    const bskin = this._maPaint(1024, 512, { cx: 0, cy: bc[1], ax: br[0], ay: br[1], egg: begg, base: C.navy, layers: BL, px: 0.0018 });
    const bean = this._maBall('eggBean', bc, br);
    const cutY = bc[1] + Math.cos((13 / 22) * Math.PI) * br[1];
    const I = bean.index.array, BP = bean.attributes.position;
    const top = [], bot = [];
    for (let i = 0; i < I.length; i += 3) {
      const y = (BP.getY(I[i]) + BP.getY(I[i + 1]) + BP.getY(I[i + 2])) / 3;
      (y > cutY ? top : bot).push(I[i], I[i + 1], I[i + 2]);
    }
    const beanTop = bean.clone(); beanTop.setIndex(top);
    const beanBot = bean.clone(); beanBot.setIndex(bot);
    const lc = this._lc(C.glow), BC = beanBot.attributes.color;
    for (let i = 0; i < BC.count; i++) BC.setXYZ(i, lc[0], lc[1], lc[2]);
    BC.needsUpdate = true;
    this._maMesh(beanTop, S.toon(bskin), body);
    R.glowMat = S.toon(null, { glow: 1 });
    this._maMesh(beanBot, R.glowMat, body, { noShadow: true });
    const feet = (A, col) => { for (const s of [-1, 1]) this._maPut(A, G.sphLo, s * 0.058, 0.045, 0.032, 0.043, 0.03, 0.05, 0, 0, 0, col || C.dark); };
    const antennae = (A, col) => { for (const s of [-1, 1]) this._maTube(A, [[s * 0.06, 0.675, -0.01], [s * 0.09, 0.765, 0.0], [s * 0.13, 0.828, 0.012]], 0.0078, col); };
    R.parts = this._maMesh(this._bake((A) => { feet(A); antennae(A, C.line); }), S.toon(null), body);
    const olSrc = this._bake((A) => {
      this._maPut(A, G.sphMid, hc[0], hc[1], hc[2], hr[0], hr[1], hr[2], 0, 0, 0, C.line);
      this._maPut(A, G.eggBean, bc[0], bc[1], bc[2], br[0], br[1], br[2], 0, 0, 0, C.line);
      feet(A, C.line);
    });
    R.outline = this._maMesh(this._maShell(olSrc, 0.0095), S.outline(C.ol), body, { noShadow: true });
    // glowing antenna tips (unlit)
    R.glow = this._maMesh(this._bake((A) => { for (const s of [-1, 1]) this._maPut(A, G.sph12, s * 0.133, 0.832, 0.012, 0.028, 0.028, 0.028, 0, 0, 0, C.glow); }), R.glowMat, body, { noShadow: true });
    this._maMesh(this._maShell(this._bake((A) => { for (const s of [-1, 1]) this._maPut(A, G.sph12, s * 0.133, 0.832, 0.012, 0.028, 0.028, 0.028, 0, 0, 0, C.line); }), 0.007), S.outline(C.ol), body, { noShadow: true });
    // tiny round nub arms
    R.arms = [];
    for (const s of [1, -1]) {
      const piv = new T.Group();
      piv.position.set(s * 0.138, 0.288, 0.016);
      body.add(piv);
      const ag = this._bake((A) => this._maPut(A, G.sph12, s * 0.022, -0.024, 0.0, 0.04, 0.046, 0.04, 0, 0, 0, C.dark));
      this._maMesh(ag, S.toon(null), piv);
      this._maMesh(this._maShell(ag, 0.007), S.outline(C.ol), piv, { noShadow: true });
      R.arms.push({ s: s, piv: piv });
    }
    // small rounded petal wings (two petals per side; thin soft rim + light faces, readable from both sides)
    R.wings = [];
    for (const s of [1, -1]) {
      const piv = new T.Group();
      piv.position.set(s * 0.085, 0.46, -0.1);
      body.add(piv);
      this._maMesh(this._bake((A) => {
        // flat discs: soft rim between a light front face and a light back face
        const petal = (x, y, rx, ry, rz, z0) => {
          this._maPut(A, G.disc, x, y, z0, rx + 0.011, ry + 0.011, 1, 0, 0, rz, C.ol);
          this._maPut(A, G.disc, x, y, z0 + 0.003, rx, ry, 1, 0, 0, rz, C.wing);
          this._maPut(A, G.disc, x, y, z0 - 0.003, rx, ry, 1, 0, Math.PI, -rz, C.wing);
        };
        petal(s * 0.17, 0.045, 0.17, 0.112, s * 0.3, 0);
        petal(s * 0.125, -0.075, 0.1, 0.066, -s * 0.45, 0.012);
      }), S.toon(null, { side: T.DoubleSide }), piv, { noShadow: true });
      R.wings.push({ s: s, piv: piv });
    }
    R.prop = null;
    // soft round glow sprite + light at the tail
    R.sprite = new T.Sprite(new T.SpriteMaterial({ map: E.tex.glow, color: this._lcol('#E8F86A'), transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, opacity: 0.45 }));
    R.sprite.position.set(0, 0.12, 0);
    R.sprite.scale.set(0.55, 0.55, 1);
    body.add(R.sprite);
    R.light = new T.PointLight(this._lcol('#E8F86A'), 0.6, 7, 1.6);
    R.light.position.set(0, 0.1, 0.05);
    body.add(R.light);
    this._maOutfits(R, { y: 0.668, z: 0.0, r: 0.158, vest: null, line: C.ol, harness: [0.277, 0.137, 0.127], scroll: [0.03, -0.05, 0.05] });
    R.size = 0.82;
    R.shadowR = 0.42;
    R.alt = 1.08;
    return R;
  },

  // magnifying glass in front of an eye (lens faces the viewer, handle down-right)
  _maMagnifier(body, x, y, z, r, line) {
    const T = this._E.T;
    const S = this._maShared();
    const G = S.G;
    const grp = new T.Group();
    grp.position.set(x, y, z);
    body.add(grp);
    this._maMesh(this._bake((A) => {
      this._maPut(A, G.torus, 0, 0, 0, r, r, r * 1.3, 0, 0, 0, line);
      this._maPut(A, G.cyl, 0, 0, 0, r * 0.93, 0.006, r * 0.93, Math.PI / 2, 0, 0, '#D7F3F8');
      this._maTube(A, [[r * 0.72, -r * 0.72, 0], [r * 1.9, -r * 2.1, -0.02]], r * 0.17, '#8A5A2B');
    }), S.toon(null), grp, { noShadow: true });
    grp.visible = false;
    return grp;
  },

  // =============================================================== OUTFITS (context hats from the sheet's outfit cells)
  // hat shapes in hat-local space (base at y = 0), r = head/hat radius; line = outline source (only silhouette parts)
  _maHat(kind, r, A, line) {
    const G = this._maShared().G;
    const L = '#19261E';
    const c = (hex) => (line ? L : hex);
    if (kind === 'site') {
      this._maPut(A, G.sph12, 0, 0, 0, r, r * 0.72, r * 1.02, 0, 0, 0, c('#F7F7F2'));
      this._maPut(A, G.cyl, 0, -0.005, 0.01, r * 1.26, 0.022, r * 1.3, 0, 0, 0, c('#F7F7F2'));
      if (!line) this._maPut(A, G.sph12, 0, 0.004, 0, r * 0.16, r * 0.76, r * 1.05, 0, 0, 0, '#42B236');
    } else if (kind === 'rain') {
      // yellow sou'wester: dome + sloping brim
      this._maPut(A, G.sph12, 0, 0, 0, r * 0.98, r * 0.8, r * 1.0, 0, 0, 0, c('#F6C21C'));
      this._maPut(A, G.brim, 0, -0.004, 0.012, r, r * 0.3, r * 1.04, 0, 0, 0, c('#EDB10F'));
      if (!line) this._maPut(A, G.cyl, 0, r * 0.06, 0, r * 0.99, r * 0.07, r * 1.01, 0, 0, 0, '#D99A0A');
    } else if (kind === 'farmer') {
      // งอบ: wide shallow straw cone with woven rings
      this._maPut(A, G.coneB, 0, -r * 0.18, 0, r * 1.78, r * 0.92, r * 1.78, 0, 0, 0, c('#E3C07C'));
      if (!line) {
        for (const h of [0.22, 0.5]) {
          const rr = r * 1.78 * (1 - h) * 1.01;
          this._maPut(A, G.torusLo, 0, -r * 0.18 + r * 0.92 * h, 0, rr, rr, r * 0.22, Math.PI / 2, 0, 0, '#B48C4C');
        }
        this._maPut(A, G.torusLo, 0, -r * 0.18, 0, r * 1.78, r * 1.78, r * 0.16, Math.PI / 2, 0, 0, '#C79E5A');
        this._maPut(A, G.sphTiny, 0, r * 0.74, 0, r * 0.1, r * 0.1, r * 0.1, 0, 0, 0, '#B48C4C');
      }
    } else if (kind === 'forest') {
      // khaki safari / ranger hat with dark band and a sprout
      this._maPut(A, G.sph12, 0, r * 0.08, 0, r * 0.84, r * 0.66, r * 0.86, 0, 0, 0, c('#C2A66B'));
      this._maPut(A, G.cyl, 0, 0.0, 0.0, r * 1.45, 0.02, r * 1.45, 0, 0, 0, c('#AF9354'));
      if (!line) {
        this._maPut(A, G.cyl, 0, r * 0.16, 0, r * 0.87, r * 0.14, r * 0.89, 0, 0, 0, '#5E4E33');
        this._maPut(A, G.cyl, 0, r * 0.82, 0, r * 0.03, r * 0.22, r * 0.03, 0, 0, 0, '#3A8F33');
        for (const s of [-1, 1]) this._maPut(A, G.sphTiny, s * r * 0.1, r * 0.95, 0, r * 0.12, r * 0.05, r * 0.07, 0, 0, s * 0.5, '#4FAF3F');
      }
    } else if (kind === 'recycle') {
      // GCC-green cap worn with the visor to the side (viewer's right) + white patch with the three GCC stripes (front-left)
      this._maPut(A, G.sph12, 0, 0, 0, r * 0.96, r * 0.76, r * 1.0, 0, 0, 0, c('#3DAA3F'));
      this._maPut(A, G.sph12, r * 0.92, r * 0.03, r * 0.16, r * 0.7, 0.02, r * 0.5, 0, 0.3, -0.1, c('#349A37'));
      if (!line) {
        const T = this._E.T;
        this._maPut(A, G.cyl, 0, r * 0.05, 0, r * 0.975, r * 0.06, r * 1.015, 0, 0, 0, '#2F8F33');
        const rx = -0.43, ry = -0.42;
        const e = new T.Euler(rx, ry, 0, 'YXZ');
        const base = new T.Vector3(-r * 0.36, r * 0.25, r * 0.875);
        this._maPut(A, G.boxU, base.x, base.y, base.z, r * 0.5, r * 0.34, 0.012, rx, ry, 0, '#FFFFFF');
        const cols = ['#42B236', '#10C0E5', '#FFB703'];
        for (let i = 0; i < 3; i++) {
          const o = new T.Vector3((i - 1) * r * 0.13, 0, 0.008).applyEuler(e).add(base);
          this._maPut(A, G.boxU, o.x, o.y, o.z, r * 0.08, r * 0.24, 0.01, rx, ry, 0, cols[i]);
        }
        this._maPut(A, G.sphTiny, 0, r * 0.77, 0, r * 0.09, r * 0.05, r * 0.09, 0, 0, 0, '#2F8F33');
      }
    } else if (kind === 'grad') {
      // mortarboard: skull cap + square board (tassel is a separate swinging piece)
      this._maPut(A, G.sph12, 0, 0, 0, r * 0.84, r * 0.52, r * 0.88, 0, 0, 0, c('#23282C'));
      this._maPut(A, G.boxU, 0, r * 0.44, 0, r * 2.2, 0.032, r * 2.2, 0, Math.PI / 4, 0, c('#1C2124'));
      if (!line) this._maPut(A, G.sphTiny, 0, r * 0.47, 0, r * 0.09, r * 0.05, r * 0.09, 0, 0, 0, '#FFB703');
    }
  },
  _maOutfits(R, o) {
    const E = this._E;
    const T = E.T;
    const S = this._maShared();
    const G = S.G;
    R.outfit = { items: {}, want: null };
    for (const kind of ['site', 'rain', 'farmer', 'forest', 'recycle', 'grad']) {
      const g = new T.Group();
      g.position.set(0, o.y, o.z);
      g.visible = false;
      g.scale.setScalar(0.001);
      R.body.add(g);
      this._maMesh(this._bake((A) => this._maHat(kind, o.r, A, false)), S.toon(null, { side: T.DoubleSide }), g, { noShadow: true });
      this._maMesh(this._maShell(this._bake((A) => this._maHat(kind, o.r, A, true)), 0.011), S.outline(o.line), g, { noShadow: true });
      R.outfit.items[kind] = { g: g, k: 0, t: 0, extra: [] };
    }
    // site: orange vest / harness (pops with the hat)
    const vg = new T.Group();
    vg.visible = false;
    R.body.add(vg);
    const vest = (A) => {
      if (o.harness) { const h = o.harness; this._maPut(A, G.torus, 0, h[0], 0.0, h[1] + 0.006, h[2] + 0.006, 0.14, Math.PI / 2, 0, 0, '#F7931E'); return; }
      const v = o.vest;
      const y0 = v[0], y1 = v[1], c = v[2], r = v[3];
      const rad = (y) => r[0] * Math.sqrt(Math.max(0.05, 1 - ((y - c[1]) / r[1]) * ((y - c[1]) / r[1])));
      const geo = new T.CylinderGeometry(rad(y1) + 0.014, rad(y0) + 0.014, y1 - y0, 28, 1, true, 0.75, Math.PI * 2 - 1.5);
      geo.scale(1, 1, r[2] / r[0]);
      geo.translate(0, (y0 + y1) / 2, 0);
      this._maPut(A, geo, 0, 0, 0, 1, 1, 1, 0, 0, 0, '#F7931E');
      const yb = y0 + (y1 - y0) * 0.32;
      const rb = rad(yb) + 0.02;
      const band = new T.CylinderGeometry(rb, rb, 0.035, 28, 1, true, 0.75, Math.PI * 2 - 1.5);
      band.scale(1, 1, r[2] / r[0]);
      band.translate(0, yb, 0);
      this._maPut(A, band, 0, 0, 0, 1, 1, 1, 0, 0, 0, '#E9EEF1');
    };
    this._maMesh(this._bake(vest), S.toon(null, { side: T.DoubleSide }), vg, { noShadow: true });
    R.outfit.items.site.extra.push(vg);
    // grad: swinging amber tassel + diploma scroll in the viewer-right arm
    const it = R.outfit.items.grad;
    const tas = new T.Group();
    tas.position.set(0, o.r * 0.47, 0);
    it.g.add(tas);
    this._maMesh(this._bake((A) => {
      const r = o.r;
      this._maTube(A, [[0, 0, 0], [r * 0.78, -0.004, r * 0.12], [r * 0.86, -r * 0.42, r * 0.14]], 0.006, '#FFB703');
      this._maPut(A, G.cyl, r * 0.86, -r * 0.55, r * 0.14, r * 0.07, r * 0.26, r * 0.07, 0, 0, 0, '#FFB703');
      this._maPut(A, G.cone, r * 0.86, -r * 0.72, r * 0.14, r * 0.1, r * 0.1, r * 0.1, 0, 0, 0, '#F29A00');
    }), S.toon(null), tas, { noShadow: true });
    it.tassel = tas;
    const armP = R.arms[0].piv;
    const sc = new T.Group();
    sc.visible = false;
    sc.position.set(o.scroll[0], o.scroll[1], o.scroll[2]);
    armP.add(sc);
    this._maMesh(this._bake((A) => {
      this._maPut(A, G.cyl, 0, 0, 0, 0.028, 0.22, 0.028, 0, 0, Math.PI / 2 - 0.35, '#FBF6E9');
      this._maPut(A, G.torusLo, 0, 0, 0, 0.032, 0.032, 0.03, 0, Math.PI / 2, 0.35, '#42B236');
    }), S.toon(null), sc, { noShadow: true });
    it.extra.push(sc);
  },
  _maEaseBack(x) { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  _maOutfitTick(R, want, dt, t) {
    let busy = false;
    for (const k in R.outfit.items) if (k !== want && R.outfit.items[k].k > 0.02) busy = true;
    for (const k in R.outfit.items) {
      const it = R.outfit.items[k];
      const on = k === want && !busy;
      if (on) { it.t = Math.min(1, it.t + dt / 0.34); it.k = this._maEaseBack(it.t); }
      else { it.t = 0; it.k = Math.max(0, it.k - dt / 0.14); if (it.k > 1) it.k = 1; }
      const vis = it.k > 0.002;
      if (it.g.visible !== vis) it.g.visible = vis;
      if (vis) it.g.scale.setScalar(Math.max(0.001, it.k));
      for (const x of it.extra) { const v = it.k > 0.45; if (x.visible !== v) x.visible = v; }
      if (it.tassel && vis) it.tassel.rotation.set(Math.sin(t * 2.3) * 0.12, 0, Math.sin(t * 3.1) * 0.22);
    }
  },
  _maDistrict(x, z) {
    for (const d of window.GHG3L.districts) {
      const r = d.rect;
      if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3]) return d.id;
    }
    return null;
  },

  // =============================================================== CONFETTI (graduation)
  _maConfettiInit() {
    const E = this._E;
    const T = E.T;
    const N = 260;
    const im = new T.InstancedMesh(new T.PlaneGeometry(0.075, 0.045), new T.MeshBasicMaterial({ side: T.DoubleSide, toneMapped: false }), N);
    im.frustumCulled = false;
    im.visible = false;
    const cols = ['#42B236', '#10C0E5', '#FFB703', '#FFFFFF'].map((h) => this._lcol(h));
    for (let i = 0; i < N; i++) im.setColorAt(i, cols[i % cols.length]);
    im.instanceColor.needsUpdate = true;
    E.scene.add(im);
    E.maConf = { im: im, N: N, p: new Float32Array(N * 3), v: new Float32Array(N * 3), r: new Float32Array(N * 3), w: new Float32Array(N * 3), born: new Float32Array(N).fill(-99), life: new Float32Array(N), t0: -99, M: new T.Matrix4(), Q: new T.Quaternion(), Eu: new T.Euler(), V: new T.Vector3(), S: new T.Vector3() };
  },
  _maConfettiBurst(cx, cy, cz) {
    const E = this._E;
    if (!E.maConf) this._maConfettiInit();
    const C = E.maConf;
    C.t0 = E.time; C.cx = cx; C.cy = cy; C.cz = cz;
    const cp = E.cam.position, tl = Math.hypot(cp.x - cx, cp.z - cz) || 1;
    C.tcx = (cp.x - cx) / tl; C.tcz = (cp.z - cz) / tl;
    C.im.visible = true;
    for (let i = 0; i < C.N; i++) {
      const wave = i < 150 ? 0 : 1.25;
      C.born[i] = E.time + wave + Math.random() * 0.25;
      C.life[i] = 4.0 + Math.random() * 1.6;
    }
  },
  _maConfettiTick(dt) {
    const E = this._E;
    const C = E.maConf;
    if (!C || !C.im.visible) return;
    const t = E.time;
    let alive = 0;
    for (let i = 0; i < C.N; i++) {
      const k = i * 3;
      const age = t - C.born[i];
      if (age < 0 || age > C.life[i]) {
        C.M.makeScale(0.0001, 0.0001, 0.0001);
        C.im.setMatrixAt(i, C.M);
        if (age < 0) alive++;
        continue;
      }
      if (age - dt <= 0 || !C.p[k + 1] && !C.v[k + 1]) {
        // spawn
        const a = Math.random() * Math.PI * 2, rr = Math.random() * 0.5;
        C.p[k] = C.cx + Math.cos(a) * rr; C.p[k + 1] = C.cy + Math.random() * 0.4; C.p[k + 2] = C.cz + Math.sin(a) * rr;
        let sp = 1.2 + Math.random() * 2.4;
        if (Math.cos(a) * C.tcx + Math.sin(a) * C.tcz > 0.25) sp *= 0.4;
        C.v[k] = Math.cos(a) * sp; C.v[k + 1] = 3.2 + Math.random() * 3.4; C.v[k + 2] = Math.sin(a) * sp;
        C.r[k] = Math.random() * 6; C.r[k + 1] = Math.random() * 6; C.r[k + 2] = Math.random() * 6;
        C.w[k] = (Math.random() - 0.5) * 14; C.w[k + 1] = (Math.random() - 0.5) * 10; C.w[k + 2] = (Math.random() - 0.5) * 14;
      }
      alive++;
      const drag = Math.exp(-1.5 * dt);
      C.v[k] *= drag; C.v[k + 2] *= drag;
      C.v[k + 1] = (C.v[k + 1] - 5.2 * dt) * Math.exp(-0.9 * dt);
      if (C.v[k + 1] < -1.1) C.v[k + 1] = -1.1;
      C.p[k] += (C.v[k] + Math.sin(t * 3 + i) * 0.25) * dt; C.p[k + 1] += C.v[k + 1] * dt; C.p[k + 2] += C.v[k + 2] * dt;
      C.r[k] += C.w[k] * dt; C.r[k + 1] += C.w[k + 1] * dt; C.r[k + 2] += C.w[k + 2] * dt;
      const qx = C.p[k] - E.cam.position.x, qy = C.p[k + 1] - E.cam.position.y, qz = C.p[k + 2] - E.cam.position.z;
      const qd = Math.sqrt(qx * qx + qy * qy + qz * qz);
      const fade = Math.min(1, (C.life[i] - age) / 0.6) * (qd < 1.1 ? Math.max(0, (qd - 0.45) / 0.65) : 1);
      C.Eu.set(C.r[k], C.r[k + 1], C.r[k + 2]);
      C.Q.setFromEuler(C.Eu);
      C.M.compose(C.V.set(C.p[k], C.p[k + 1], C.p[k + 2]), C.Q, C.S.set(fade, fade, fade));
      C.im.setMatrixAt(i, C.M);
    }
    C.im.instanceMatrix.needsUpdate = true;
    if (!alive && t - C.t0 > 2) { C.im.visible = false; C.p.fill(0); C.v.fill(0); }
  },

  // =============================================================== GUIDE API (overrides actors.js)
  _initGuide() {
    const E = this._E;
    const T = E.T;
    this._maShared();
    const owl = this._maBuildOwl();
    const sap = this._maBuildSapling();
    const fly = this._maBuildFirefly();
    for (const R of [owl, sap, fly]) E.scene.add(R.root);
    owl.odelay = 0; sap.odelay = 0.12; fly.odelay = 0.24;
    const gs = E.gateSpot && E.gateSpot.guide;
    E.guide = { P: owl.root, pos: new T.Vector3(gs ? gs[0] : 0, 0, gs ? gs[1] : 0), yaw: 0, mode: 'idle', speed: 0, lookAt: null, pointAt: null, helmet: false, visible: true, y: null };
    E.team = { owl: owl, sapling: sap, firefly: fly, speaker: null, speakerMood: null, speakerT: 0, speakerEnd: 0, hidden: true, arrived: null, sapSpot: null };
    owl.pos.copy(E.guide.pos);
    this._maRoadsPrep();
    return E.guide;
  },

  _eSpeaker(who, mood, seconds) {
    const E = this._E;
    if (!E || !E.team) return;
    const TM = E.team;
    if (who !== 'owl' && who !== 'sapling' && who !== 'firefly') return;
    const MAP = { talk: 'talk', neutral: 'talk', explain: 'explain', askdocs: 'explain', point: 'point', cheer: 'cheer', jump: 'cheer', relieved: 'cheer', think: 'think', thinking: 'think',
      wave: 'wave', inspect: 'inspect', read: 'inspect', surprised: 'surprised', wai: 'wai', curious: 'curious', idle: 'idle' };
    TM.speaker = who;
    TM.speakerMood = MAP[mood] || 'talk';
    const s = seconds || 4;
    TM.speakerT = E.time + s;
    TM.speakerEnd = E.time + s + 2.6;
    const R = TM[who];
    if (TM.speakerMood === 'surprised') R.hopV = 1.6;
  },

  // sidewalk / bridge aware floor height
  _maRoadsPrep() {
    const E = this._E;
    const L = window.GHG3L;
    E.maRoads = L.roads.map((r) => {
      const horiz = Math.abs(r.a[1] - r.b[1]) < 1e-6;
      const a = r.a.slice(), b = r.b.slice();
      if (horiz && (r.id === 'B' || r.id === 'C' || r.id === 'D')) b[0] = Math.min(b[0], 540);
      return { horiz: horiz, a: a, b: b, hw: r.w / 2, side: r.side || 0 };
    });
  },
  _maFloor(x, z, gy) {
    if (gy != null) return gy;
    const E = this._E;
    let y = window.GHG3L.H(x, z);
    if (typeof this._wDeckY === 'function') { const d = this._wDeckY(x, z); if (d) return y + d; }
    let walk = false;
    for (const r of E.maRoads || []) {
      let along, off;
      if (r.horiz) { along = x >= Math.min(r.a[0], r.b[0]) && x <= Math.max(r.a[0], r.b[0]); off = Math.abs(z - r.a[1]); }
      else { along = z >= Math.min(r.a[1], r.b[1]) && z <= Math.max(r.a[1], r.b[1]); off = Math.abs(x - r.a[0]); }
      if (!along) continue;
      if (off < r.hw) return y;
      if (r.side && off < r.hw + r.side) walk = true;
    }
    return y + (walk ? 0.15 : 0);
  },
  _maFree(x, z, r) {
    if (typeof this._pHitAt === 'function') return !this._pHitAt(x, z, r || 0.3);
    const E = this._E;
    const list = E.colGrid.get(Math.floor(x / 24) + ',' + Math.floor(z / 24));
    if (!list) return true;
    const rr = r || 0.3;
    for (const c of list) if (x > c.x0 - rr && x < c.x1 + rr && z > c.z0 - rr && z < c.z1 + rr) return false;
    return true;
  },

  // =============================================================== PER-FRAME
  _tickGuide(dt) {
    const E = this._E;
    const G = E.guide;
    const TM = E.team;
    if (!G || !TM) return;
    const S = this._maShared();
    const owl = TM.owl, sap = TM.sapling, fly = TM.firefly;
    // lighting for the toon materials
    const cp = E.cam.position;
    S.U.uL.value.copy(E.sunDir).transformDirection(E.cam.matrixWorldInverse);
    const W = E.wx ? E.wx.cur : null;
    let k = 1;
    if (W) k = 0.46 + 0.54 * Math.min(1.12, (W.sunI * 0.3 + W.hI * 0.9) / 1.368);
    if (E.insideObj) k = Math.max(k * 0.94, 0.8);
    S.U.uK.value = k;
    S.U.uTint.value.setRGB(1, 1, 1).lerp(E.sun.color, 0.22);
    this._maConfettiTick(dt);
    const vis = G.visible !== false;
    for (const R of [owl, sap, fly]) R.root.visible = vis;
    if (!vis) { TM.hidden = true; S.shadow.visible = false; S.cone.visible = false; return; }
    S.shadow.visible = true;
    const st = this.state || {};
    const aid = st.eArrived != null && E.anchors && E.anchors[st.eArrived] ? st.eArrived : null;
    const A = aid != null ? E.anchors[aid] : null;
    const settled0 = () => !!A && (G.speed || 0) < 0.25;
    const speaking = TM.speaker && E.time < TM.speakerEnd ? TM.speaker : null;
    const t = E.time;
    // ---------------- team moments: gate welcome (first eGate) and graduation (19 answers)
    const ansN = Object.keys(st.answers || {}).length;
    if (TM.ansPrev == null) TM.ansPrev = ansN;
    if (ansN >= 19 && TM.ansPrev < 19) {
      TM.ov = { owl: { mood: 'cheer', until: t + 4.6, big: true }, sapling: { mood: 'cheer', until: t + 4.8, big: true }, firefly: { mood: 'cheer', until: t + 5.0, big: true } };
      TM.gradPending = true;
    }
    TM.ansPrev = ansN;
    if (st.eGate && !TM.welcomed) {
      TM.welcomed = true;
      TM.ov = { owl: { mood: 'wai', until: t + 3.2 }, sapling: { mood: 'wave', until: t + 3.6 }, firefly: { mood: 'wave', until: t + 3.6 } };
    }
    // explore: a riddle solved (eFound changes to an id) -> everyone cheers briefly (hops happily even while walking over)
    if (st.eFound != null && st.eFound !== TM.foundPrev) {
      TM.ov = { owl: { mood: 'cheer', until: t + 1.9, walkOk: true }, sapling: { mood: 'cheer', until: t + 2.1, walkOk: true }, firefly: { mood: 'cheer', until: t + 2.2 } };
    }
    TM.foundPrev = st.eFound;
    const ovOf = (id) => (TM.ov && TM.ov[id] && t < TM.ov[id].until ? TM.ov[id] : null);
    const moodOf = (id) => {
      if (speaking === id && t < TM.speakerT) return TM.speakerMood;
      const o = ovOf(id);
      if (o) return o.mood;
      return speaking === id && t < TM.speakerEnd ? 'talk' : null;
    };
    // ---------------- context outfit (grad > site > rain > district), debounced; applied with a small cascade per mascot
    {
      const P = E.player;
      let want = null;
      if (ansN >= 19 || st.step === 'finale' || st.step === 'outro' || st.eFinale) want = 'grad';
      else if (G.helmet) want = 'site';
      else if ((E.rainK || 0) > 0.4 && !(E.insideObj || (P && typeof this._pInsideAt === 'function' && this._pInsideAt(P.x, P.z)))) want = 'rain';
      else if (P) { const d = this._maDistrict(P.x, P.z); want = d === 'farm' ? 'farmer' : d === 'forest' ? 'forest' : d === 'landfill' ? 'recycle' : null; }
      if (TM.want === undefined) { TM.want = want; TM.wantPrev = want; TM.wantAt = -99; }
      if (want !== TM.want) {
        if (TM.wantNext !== want) { TM.wantNext = want; TM.wantNT = t; }
        const hold = want === 'grad' || want === 'site' || TM.want === 'site' ? 0 : 0.6;
        if (t - TM.wantNT >= hold) { TM.wantPrev = TM.want; TM.want = want; TM.wantAt = t; TM.wantNext = undefined; }
      } else TM.wantNext = undefined;
    }
    // ---------------- owl (leader, driven by play.js)
    const ox0 = TM.pose && TM.pose.owl ? TM.pose.owl[0] : G.pos.x, oz0 = TM.pose && TM.pose.owl ? TM.pose.owl[1] : G.pos.z;
    owl.pos.set(ox0, this._maFloor(ox0, oz0, G.y), oz0);
    owl.speed = G.speed || 0;
    let oMode = G.mode || 'idle';
    let oYaw = TM.pose ? Math.atan2(cp.x - owl.pos.x, cp.z - owl.pos.z) : (G.yaw || 0);
    const om = moodOf('owl');
    const oov = ovOf('owl');
    if (oMode !== 'walk' || (om && oov && oov.walkOk && om === oov.mood)) {
      if (om) { oMode = om; oYaw = Math.atan2(cp.x - owl.pos.x, cp.z - owl.pos.z); }
      else if (speaking) { oMode = 'idle'; const sp = TM[speaking]; oYaw = this._maMixYaw(Math.atan2(cp.x - owl.pos.x, cp.z - owl.pos.z), Math.atan2(sp.pos.x - owl.pos.x, sp.pos.z - owl.pos.z), 0.16); }
    }
    const perch = this._maPerch(A, settled0(), cp, dt);
    if (perch) { owl.pos.set(perch.o[0], perch.y, perch.o[1]); oYaw = Math.atan2(cp.x - owl.pos.x, cp.z - owl.pos.z); if (oMode === 'walk') oMode = 'idle'; }
    owl.yaw = this._angDamp(owl.yaw, oYaw, 10, dt);
    // ---------------- sapling (companion on foot)
    const fwd = [Math.sin(owl.yaw), Math.cos(owl.yaw)], rgt = [-Math.cos(owl.yaw), Math.sin(owl.yaw)];
    let sx, sz, sFace = null;
    const settled = A && owl.speed < 0.25;
    if (settled) {
      if (TM.arrived !== aid || !TM.sapSpot || Math.hypot(TM.sapSpot.ox - owl.pos.x, TM.sapSpot.oz - owl.pos.z) > 0.6) {
        if (TM.arrived !== aid) TM.setT = t;
        TM.arrived = aid;
        TM.sapSpot = this._maSapSpot(owl, A);
      }
      sx = TM.sapSpot.x; sz = TM.sapSpot.z;
      sFace = Math.atan2(cp.x - sx, cp.z - sz);
    } else {
      TM.arrived = null;
      // beside the owl (walking or standing), on the side that is nearer the middle of the view
      const cf = [Math.sin(E.player ? E.player.yaw : 0), Math.cos(E.player ? E.player.yaw : 0)];
      const lx = owl.pos.x - rgt[0] * 1.1, lz = owl.pos.z - rgt[1] * 1.1;
      const rx2 = owl.pos.x + rgt[0] * 1.1, rz2 = owl.pos.z + rgt[1] * 1.1;
      const bear = (x, z) => { const dx = x - cp.x, dz = z - cp.z, l = Math.hypot(dx, dz) || 1; return (dx * cf[0] + dz * cf[1]) / l; };
      if (TM.sideT == null || E.time > TM.sideT) {
        const bl = bear(lx, lz), br = bear(rx2, rz2);
        if (TM.leftFirst == null || Math.abs(bl - br) > 0.035) TM.leftFirst = bl >= br;
        TM.sideT = E.time + 2.5;
      }
      const back = owl.speed > 0.25 ? 0.15 : -0.15;
      const cands = TM.leftFirst ? [[back, 1.1], [back, -1.1], [-0.9, 0.7], [-0.9, -0.7], [-1.3, 0]] : [[back, -1.1], [back, 1.1], [-0.9, -0.7], [-0.9, 0.7], [-1.3, 0]];
      sx = owl.pos.x; sz = owl.pos.z;
      for (const c of cands) {
        const x = owl.pos.x + fwd[0] * c[0] - rgt[0] * c[1], z = owl.pos.z + fwd[1] * c[0] - rgt[1] * c[1];
        if (this._maFree(x, z, 0.3)) { sx = x; sz = z; break; }
      }
      if (owl.speed <= 0.25) sFace = Math.atan2(cp.x - sx, cp.z - sz);
    }
    if (!perch && !TM.hidden) {
      const ax = sap.pos.x, az = sap.pos.z, dx = sx - ax, dz = sz - az, L2 = dx * dx + dz * dz;
      if (L2 > 0.5) {
        const u = ((owl.pos.x - ax) * dx + (owl.pos.z - az) * dz) / L2;
        const qx = ax + dx * u - owl.pos.x, qz = az + dz * u - owl.pos.z;
        if (u > 0.05 && u < 0.95 && qx * qx + qz * qz < 0.75 * 0.75) {
          // walk round the owl on its far side (away from the camera), always leading by up to ~55 deg so it never stalls behind it
          const wrap = (v) => { while (v > Math.PI) v -= Math.PI * 2; while (v < -Math.PI) v += Math.PI * 2; return v; };
          const aB = Math.atan2(owl.pos.x - cp.x, owl.pos.z - cp.z);
          const rS = wrap(Math.atan2(ax - owl.pos.x, az - owl.pos.z) - aB), rT = wrap(Math.atan2(sx - owl.pos.x, sz - owl.pos.z) - aB);
          let rN;
          if (rS * rT >= 0) rN = rS + Math.sign(rT - rS) * Math.min(Math.abs(rT - rS), 0.95);
          else { const dir = rS !== 0 ? -Math.sign(rS) : Math.sign(rT); rN = rS + dir * Math.min(Math.abs(rS) + Math.abs(rT), 0.95); }
          for (const rr of [1.0, 1.3]) {
            const wx = owl.pos.x + Math.sin(aB + rN) * rr, wz = owl.pos.z + Math.cos(aB + rN) * rr;
            if (this._maFree(wx, wz, 0.3)) { sx = wx; sz = wz; break; }
          }
        }
      }
    }
    if (TM.pose && TM.pose.sapling) { sx = TM.pose.sapling[0]; sz = TM.pose.sapling[1]; sFace = Math.atan2(cp.x - sx, cp.z - sz); }
    if (perch) { sx = perch.s[0]; sz = perch.s[1]; sFace = Math.atan2(cp.x - sx, cp.z - sz); }
    if (TM.hidden || Math.hypot(sap.pos.x - sx, sap.pos.z - sz) > 9) { sap.pos.set(sx, 0, sz); sap.vel.set(0, 0, 0); }
    if (!TM.oPrev) TM.oPrev = { x: owl.pos.x, z: owl.pos.z, vx: 0, vz: 0 };
    const ovx = (owl.pos.x - TM.oPrev.x) / Math.max(dt, 1e-4), ovz = (owl.pos.z - TM.oPrev.z) / Math.max(dt, 1e-4);
    const kv = 1 - Math.exp(-6 * dt);
    if (Math.hypot(ovx, ovz) < 15) { TM.oPrev.vx += (ovx - TM.oPrev.vx) * kv; TM.oPrev.vz += (ovz - TM.oPrev.vz) * kv; }
    TM.oPrev.x = owl.pos.x; TM.oPrev.z = owl.pos.z;
    if (!perch) this._maWalkTo(sap, sx, sz, dt, Math.max(1.8, owl.speed * 1.35 + 0.8), owl.speed > 0.25 ? TM.oPrev : null);
    // tight rooms: if the sapling cannot reach its stop spot (walls in the way) it pops there after a moment
    if (settled && !perch && !(TM.pose && TM.pose.sapling) && TM.sapSpot) {
      const far = Math.hypot(sap.pos.x - TM.sapSpot.x, sap.pos.z - TM.sapSpot.z) > 0.4;
      if (far && t - (TM.setT || 0) > (sap.speed < 0.4 ? 2.5 : 4.5)) { sap.pos.x = TM.sapSpot.x; sap.pos.z = TM.sapSpot.z; sap.vel.set(0, 0, 0); }
    }
    if (perch) { sap.pos.set(sx, perch.y, sz); sap.vel.set(0, 0, 0); sap.speed = 0; }
    else sap.pos.y = this._maFloor(sap.pos.x, sap.pos.z, G.y != null && Math.hypot(sap.pos.x - owl.pos.x, sap.pos.z - owl.pos.z) < 4 ? G.y : null);
    let sMode = sap.speed > 0.25 ? 'walk' : 'idle';
    let sYaw = sap.speed > 0.25 ? Math.atan2(sap.vel.x, sap.vel.z) : (sFace != null ? sFace : owl.yaw);
    const sm = moodOf('sapling');
    const sov = ovOf('sapling');
    if (sMode !== 'walk' || (sm && sov && sov.walkOk && sm === sov.mood)) {
      if (sm) { sMode = sm; sYaw = Math.atan2(cp.x - sap.pos.x, cp.z - sap.pos.z); }
      else if (speaking && speaking !== 'sapling') { const sp = TM[speaking]; sYaw = this._maMixYaw(sYaw, Math.atan2(sp.pos.x - sap.pos.x, sp.pos.z - sap.pos.z), 0.16); }
      else if (G.mode === 'cheer') sMode = 'cheer';
    }
    sap.yaw = this._angDamp(sap.yaw, sYaw, 8, dt);
    // ---------------- firefly (flies; shines on the emission source at a stop)
    let fx, fy, fz, shine = false, tgt = null, fFace = null, fMood = null, fV = 11;
    const hintId = E.hintId != null && st.eFound !== E.hintId ? E.hintId : null;
    const hintA = hintId != null && E.anchors ? E.anchors[hintId] : null;
    const hintT = hintId != null ? (E.hintT || (hintA ? (hintA.emit || hintA.look) : null)) : null;
    const seekOn = !hintT && st.eSeek != null;
    TM.beacon = false;
    if (hintT) {
      // hint beacon: fly to the riddle's target and hover over it, glowing, with the light cone on it
      tgt = hintT;
      const dx = hintT[0] - cp.x, dz = hintT[2] - cp.z, dh = Math.hypot(dx, dz) || 1;
      const pull = Math.min(0.8, dh * 0.12);
      fx = hintT[0] - (dx / dh) * pull + Math.sin(t * 1.1) * 0.16;
      fz = hintT[2] - (dz / dh) * pull + Math.cos(t * 1.1) * 0.16;
      fy = hintT[1] + 1.25 + Math.sin(t * 1.9) * 0.1;
      fV = 26; TM.beacon = true;
    } else if (settled && (A.emit || A.pin || A.look)) {
      const e = A.emit || A.pin || A.look;
      tgt = e;
      const dx = e[0] - cp.x, dz = e[2] - cp.z;
      const dh = Math.hypot(dx, dz) || 1;
      if (dh > 7.5) {
        // far source: hover ~4 m out along the line of sight, a little up and to the sapling's side, and beam the light at it
        const L = Math.hypot(dx, e[1] - cp.y, dz) || 1;
        const k2 = Math.min(4.2, L * 0.4) / L;
        const hx = dx / dh, hz = dz / dh;
        let sd = 1;
        if (TM.sapSpot) sd = ((TM.sapSpot.x - cp.x) * -hz + (TM.sapSpot.z - cp.z) * hx) >= 0 ? 1 : -1;
        fx = cp.x + dx * k2 - hz * 0.75 * sd; fz = cp.z + dz * k2 + hx * 0.75 * sd;
        fy = Math.max(this._maFloor(fx, fz, null) + 1.4, cp.y + (e[1] - cp.y) * k2 + 0.55);
      } else {
        const pull = Math.min(0.9, dh * 0.2);
        fx = e[0] - (dx / dh) * pull; fz = e[2] - (dz / dh) * pull; fy = e[1] + 0.75;
      }
      fx += Math.sin(t * 0.9) * 0.12; fy += Math.sin(t * 1.7) * 0.06; fz += Math.cos(t * 0.9) * 0.12;
    } else if (E.exploreOn || seekOn) {
      // explore companion: ~1.4 m ahead-left of the camera at eye height, never over the middle of the view, little loops
      const cf = E.cam.getWorldDirection(E.v2);
      let hx = cf.x, hz = cf.z;
      const hl = Math.hypot(hx, hz) || 1;
      hx /= hl; hz /= hl;
      const rX = -hz, rZ = hx;
      const ahead = seekOn ? 2.5 : 3.3, left = seekOn ? 1.3 : 1.95;
      const lp = t * 1.6;
      let side = left - Math.sin(lp) * 0.08, up = Math.sin(lp * 2) * 0.07;
      const cyc = ((t + 3.1) % 7.5) / 1.3;
      if (cyc < 1 && !seekOn) { const a2 = cyc * Math.PI * 2; side -= Math.sin(a2) * 0.12; up += (1 - Math.cos(a2)) * 0.2; }
      fx = cp.x + hx * ahead - rX * side; fz = cp.z + hz * ahead - rZ * side;
      fy = cp.y - 0.55 + up;
      fV = 16;
      if (seekOn) {
        fMood = 'curious';
        const toC = Math.atan2(cp.x + hx * 2.4 - fly.pos.x, cp.z + hz * 2.4 - fly.pos.z);
        fFace = this._maMixYaw(Math.atan2(cp.x - fly.pos.x, cp.z - fly.pos.z), toC, 0.38);
      }
    } else {
      // lead the way a little ahead of the owl (when walking) or hover at its shoulder (standing)
      const lead = owl.speed > 0.25 ? 1.1 : 0.15, side = (owl.speed > 0.25 ? 0.55 : 0.95) * (TM.leftFirst === false ? -1 : 1);
      fx = owl.pos.x + rgt[0] * side + fwd[0] * lead + Math.sin(t * 0.8) * 0.22;
      fz = owl.pos.z + rgt[1] * side + fwd[1] * lead + Math.sin(t * 1.6) * 0.12;
      fy = owl.pos.y + 1.12 + Math.sin(t * 1.3) * 0.1;
    }
    {
      const ax = fly.pos.x, az = fly.pos.z, dx = fx - ax, dz = fz - az, L2 = dx * dx + dz * dz;
      if (L2 > 0.3 && !TM.hidden) {
        const u = ((owl.pos.x - ax) * dx + (owl.pos.z - az) * dz) / L2;
        const qx = ax + dx * u - owl.pos.x, qz = az + dz * u - owl.pos.z;
        if (u > 0.02 && u < 0.98 && qx * qx + qz * qz < 0.7 * 0.7) fy = Math.max(fy, owl.pos.y + 1.95);
      }
    }
    const fo = ovOf('firefly');
    if (fo && fo.big) {
      if (TM.gradC) { fx = TM.gradC[0]; fy = TM.gradC[1] + (perch ? -0.3 : 0.3); fz = TM.gradC[2]; }
      const ph = t * 2.6; fx += Math.sin(ph) * 0.55; fz += Math.cos(ph) * 0.55; fy += Math.sin(ph * 2) * 0.15;
    }
    // fx/fy/fz = where the firefly's feet should hover; the rig root sits `alt` below its body
    if (TM.pose && TM.pose.firefly) { fx = TM.pose.firefly[0]; fz = TM.pose.firefly[1]; fy = this._maFloor(fx, fz, null) + (TM.pose.firefly[2] || 0.55); }
    if (TM.hidden || Math.hypot(fly.pos.x - fx, fly.pos.z - fz) > 60) { fly.pos.set(fx, fy - fly.alt, fz); fly.vel.set(0, 0, 0); }
    const fd = this._maFlyTo(fly, fx, fy - fly.alt, fz, dt, fV);
    shine = !!tgt && fd < (TM.beacon ? 2.2 : 1.6);
    let fMode = 'hover';
    const toCam = Math.atan2(cp.x - fly.pos.x, cp.z - fly.pos.z), velYaw = Math.atan2(fly.vel.x, fly.vel.z);
    let fYaw;
    if (fFace != null) fYaw = fFace;
    else if (TM.beacon) fYaw = fly.speed > 1.5 ? velYaw : toCam;
    else if (E.exploreOn && !settled) fYaw = fly.speed > 4 ? this._maMixYaw(toCam, velYaw, 0.5) : toCam;
    else fYaw = fly.speed > 0.8 ? velYaw : (settled ? toCam : owl.yaw);
    const fm = moodOf('firefly');
    if (fly.speed < (E.exploreOn ? 3.5 : 1.2)) {
      if (fm) { fMode = fm; fYaw = fFace != null && fm === fMood ? fFace : toCam; }
      else if (fMood) fMode = fMood;
      else if (speaking && speaking !== 'firefly') { const sp = TM[speaking]; fYaw = this._maMixYaw(fYaw, Math.atan2(sp.pos.x - fly.pos.x, sp.pos.z - fly.pos.z), 0.16); }
      else if (G.mode === 'cheer') fMode = 'cheer';
      else if (shine) fMode = 'shine';
    }
    fly.yaw = this._angDamp(fly.yaw, fYaw, 6, dt);
    TM.hidden = false;
    // ---------------- animate
    owl.big = oMode === 'cheer' && !!(ovOf('owl') && ovOf('owl').big);
    sap.big = sMode === 'cheer' && !!(ovOf('sapling') && ovOf('sapling').big);
    fly.big = fMode === 'cheer' && !!(fo && fo.big);
    this._maAnimOwl(owl, dt, oMode, G);
    this._maAnimSap(sap, dt, sMode);
    this._maAnimFly(fly, dt, fMode, shine, tgt);
    for (const R of [owl, sap, fly]) {
      R.root.position.copy(R.pos);
      R.root.rotation.y = R.yaw;
      const sc = perch && R !== fly ? 0.7 : 1;
      if (R.root.scale.x !== sc) R.root.scale.setScalar(sc);
      this._maOutfitTick(R, t - TM.wantAt >= R.odelay ? TM.want : TM.wantPrev, dt, t);
    }
    if (TM.gradPending) {
      TM.gradPending = false;
      let bx = (owl.pos.x + sap.pos.x) / 2, bz = (owl.pos.z + sap.pos.z) / 2;
      const by = Math.max(owl.pos.y, sap.pos.y) + 0.6;
      if (Math.hypot(bx - cp.x, bz - cp.z) < 2.4) {
        const d = E.cam.getWorldDirection(E.v2);
        const hl = Math.hypot(d.x, d.z) || 1;
        bx = cp.x + (d.x / hl) * 2.6; bz = cp.z + (d.z / hl) * 2.6;
      }
      TM.gradC = [bx, by, bz];
      this._maConfettiBurst(bx, by, bz);
    }
    // firefly glow & light cone
    const nightK = E.nightK || 0;
    const bk = TM.beacon ? 1 : 0;
    const gl = 0.55 + 0.9 * nightK + (shine ? 0.5 : 0) + (E.insideObj ? 0.3 : 0) + bk * 1.3;
    fly.sprite.material.opacity = Math.min(1, 0.16 + 0.6 * nightK + (shine ? 0.2 : 0) + bk * 0.5);
    let ss = 0.36 + 0.45 * nightK + (shine ? 0.2 : 0) + Math.sin(t * 3) * 0.04;
    if (bk) ss = Math.max(ss + 0.55, fly.pos.distanceTo(cp) * 0.05) * (1 + 0.15 * Math.sin(t * 5));
    fly.sprite.scale.set(ss, ss, 1);
    fly.light.intensity = gl * (0.8 + 0.2 * Math.sin(t * 2.4));
    const cone = S.cone;
    if (shine && tgt) {
      const ap = E.v1.set(fly.pos.x, fly.pos.y + fly.body.position.y + 0.1, fly.pos.z);
      const bx = tgt[0], by = tgt[1], bz = tgt[2];
      let vx = ap.x - bx, vy = ap.y - by, vz = ap.z - bz;
      let len = Math.hypot(vx, vy, vz) || 1;
      const Lc = Math.min(len, 14);
      vx /= len; vy /= len; vz /= len;
      const base = [ap.x - vx * Lc, ap.y - vy * Lc, ap.z - vz * Lc];
      cone.position.set((ap.x + base[0]) / 2, (ap.y + base[1]) / 2, (ap.z + base[2]) / 2);
      cone.quaternion.setFromUnitVectors(E.v2.set(0, 1, 0), E.v3.set(vx, vy, vz));
      const rad = 0.25 + Lc * 0.2;
      cone.scale.set(rad, Lc, rad);
      cone.visible = true;
      const ca = S.coneMat.uniforms.uA;
      ca.value = this._damp(ca.value, (TM.beacon ? 0.34 : 0.16) + 0.14 * nightK, 3, dt);
    } else {
      const ca = S.coneMat.uniforms.uA;
      ca.value = this._damp(ca.value, 0, 6, dt);
      cone.visible = ca.value > 0.01 && cone.visible;
    }
    // contact shadows
    const M = S.sM;
    const put = (i, R, x, y, z, r, a) => {
      M.makeScale(r * 2, 1, r * 2 * 0.85);
      M.setPosition(x, y + 0.03, z);
      S.shadow.setMatrixAt(i, M);
      void a;
    };
    put(0, owl, owl.pos.x, owl.pos.y, owl.pos.z, owl.shadowR);
    put(1, sap, sap.pos.x, sap.pos.y, sap.pos.z, sap.shadowR);
    const fg = this._maFloor(fly.pos.x, fly.pos.z, null);
    const fh = Math.max(0, fly.pos.y + fly.alt - fg);
    put(2, fly, fly.pos.x, fg, fly.pos.z, fly.shadowR * (1 + fh * 0.12) * (fh < 6 ? 1 : 0.001));
    S.shadow.instanceMatrix.needsUpdate = true;
  },

  // raised viewing deck (anchor.viewY well above the terrain): the owl and sapling hop onto the railing,
  // either side of where the camera is looking now, narrowed to the part of the frame beside the answer card
  _maPerch(A, settled, cp, dt) {
    if (!A || !settled || A.viewY == null || !A.view || !A.look) return null;
    const H = window.GHG3L.H;
    const deckY = A.viewY - 1.65;
    if (deckY - H(A.view[0], A.view[1]) < 1.5) return null;
    const E = this._E;
    const TM = E.team;
    if (TM.perchFor !== A) {
      let fx = A.look[0] - A.view[0], fz = A.look[2] - A.view[1];
      const fl = Math.hypot(fx, fz) || 1;
      fx /= fl; fz /= fl;
      let dr = 1.0;
      for (let d = 0.3; d <= 3; d += 0.1) { if (!this._maFree(A.view[0] + fx * d, A.view[1] + fz * d, 0.02)) { dr = d; break; } }
      TM.perchFor = A; TM.perchB = { fx: fx, fz: fz, dr: dr, y: deckY + 1.08 }; TM.perchSpot = null;
    }
    const B = TM.perchB;
    const cd = E.cam.getWorldDirection(E.v3);
    const by = Math.atan2(B.fx, B.fz);
    let rel = Math.atan2(cd.x, cd.z) - by;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    rel = this._cl(rel, -0.5, 0.5);
    const c0 = (cp.x - A.view[0]) * B.fx + (cp.z - A.view[1]) * B.fz;
    const hit = (g0) => {
      const ya = by + this._cl(rel + g0, -1.0, 1.0);
      const dx = Math.sin(ya), dz = Math.cos(ya);
      const sd = Math.max(0.3, B.dr - c0) / Math.max(0.35, dx * B.fx + dz * B.fz);
      return [cp.x + dx * sd, cp.z + dz * sd];
    };
    // half-width of the part of the frame left of the answer card (play.js shifts the view by E.vOff px when the card is open)
    const hw = (E.w || 1000) / 2;
    const halfVis = Math.atan(Math.max(0.25, (hw - Math.abs(E.vOff || 0)) / hw) * Math.tan((E.cam.fov * Math.PI) / 360) * E.cam.aspect);
    const th = this._cl(halfVis - 0.27, 0.28, 0.5);
    const o = hit(-th), sp = hit(th);   // owl on the viewer's right, sapling on the left
    if (!TM.perchSpot) TM.perchSpot = { o: o, s: sp, y: B.y };
    else {
      const P = TM.perchSpot, k = 1 - Math.exp(-4 * (dt || 0.016));
      P.o[0] += (o[0] - P.o[0]) * k; P.o[1] += (o[1] - P.o[1]) * k; P.s[0] += (sp[0] - P.s[0]) * k; P.s[1] += (sp[1] - P.s[1]) * k;
    }
    return TM.perchSpot;
  },
  _maMixYaw(a, b, t) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  },
  // sapling spot at a stop: mirror of the owl across the camera's line of sight (other side of the frame);
  // tight rooms: closer spots on the free side, then the owl's side further out; always >= 12 deg from the owl as seen from the camera
  _maSapSpot(owl, A) {
    const E = this._E;
    const P = E.player || { x: E.cam.position.x, z: E.cam.position.z, yaw: 0 };
    let fx, fz;
    if (A && A.look) { fx = A.look[0] - P.x; fz = A.look[2] - P.z; } else { fx = Math.sin(P.yaw); fz = Math.cos(P.yaw); }
    const fl = Math.hypot(fx, fz) || 1;
    fx /= fl; fz /= fl;
    const rx = -fz, rz = fx;
    const ox = owl.pos.x - P.x, oz = owl.pos.z - P.z;
    const oa = ox * fx + oz * fz, ob = ox * rx + oz * rz;
    const oAng = Math.atan2(ob, Math.max(0.05, oa));
    const sgn = ob >= 0 ? -1 : 1;
    const res = (x, z) => ({ x: x, z: z, ox: owl.pos.x, oz: owl.pos.z });
    const ok = (x, z) => {
      const ang = Math.atan2((x - P.x) * rx + (z - P.z) * rz, (x - P.x) * fx + (z - P.z) * fz);
      if (Math.abs(ang - oAng) < 0.21 || Math.hypot(x - owl.pos.x, z - owl.pos.z) < 0.75) return false;
      return this._maFree(x, z, 0.32) && (typeof this._pBlocked !== 'function' || !this._pBlocked(P.x, P.z, x, z));
    };
    // 1) mirror of the owl
    const a = this._cl(oa, 2.0, 3.6);
    const bb = Math.max(1.15, Math.abs(ob));
    for (const q of [[a, bb], [a, bb * 1.25], [a + 0.5, bb], [a - 0.3, bb * 0.9], [a + 0.8, bb * 1.4], [a, bb * 1.6]]) {
      const x = P.x + fx * q[0] + rx * q[1] * sgn, z = P.z + fz * q[0] + rz * q[1] * sgn;
      if (ok(x, z)) return res(x, z);
    }
    // 2) closer spots on the free side (2.0 - 2.8 m from the camera)
    const polar = (d, g) => [P.x + (fx * Math.cos(g) + rx * Math.sin(g)) * d, P.z + (fz * Math.cos(g) + rz * Math.sin(g)) * d];
    for (const d of [2.8, 2.4, 2.0]) for (const g of [0.31, 0.42, 0.24, 0.52, 0.63]) { const q = polar(d, g * sgn); if (ok(q[0], q[1])) return res(q[0], q[1]); }
    // 3) the owl's side, further out than the owl
    for (const d of [2.4, 2.8, 2.0, 3.2]) for (const g of [0.24, 0.34, 0.46]) { const q = polar(d, oAng - sgn * g); if (ok(q[0], q[1])) return res(q[0], q[1]); }
    // 4) last resort: ~1.8 m ahead-left of the camera
    return res(P.x + fx * 1.55 - rx * 0.9, P.z + fz * 1.55 - rz * 0.9);
  },
  _maWalkTo(R, tx, tz, dt, vmax, ff) {
    const dx = tx - R.pos.x, dz = tz - R.pos.z;
    const d = Math.hypot(dx, dz);
    const want = d < 0.05 ? 0 : Math.min(vmax, d * 2.2);
    let wx = d > 1e-4 ? (dx / d) * want : 0, wz = d > 1e-4 ? (dz / d) * want : 0;
    if (ff) { wx += ff.vx; wz += ff.vz; const wl = Math.hypot(wx, wz); if (wl > vmax + 1) { wx *= (vmax + 1) / wl; wz *= (vmax + 1) / wl; } }
    const k = 1 - Math.exp(-8 * dt);
    R.vel.x += (wx - R.vel.x) * k;
    R.vel.z += (wz - R.vel.z) * k;
    let nx = R.pos.x + R.vel.x * dt, nz = R.pos.z + R.vel.z * dt;
    if (typeof this._pCollide === 'function') { const c = this._pCollide(nx, nz, 0.28); nx = c[0]; nz = c[1]; }
    const moved = Math.hypot(nx - R.pos.x, nz - R.pos.z) / Math.max(dt, 1e-4);
    R.pos.x = nx; R.pos.z = nz;
    R.speed = this._damp(R.speed, moved, 10, dt);
  },
  _maFlyTo(R, tx, ty, tz, dt, vmax) {
    const dx = tx - R.pos.x, dy = ty - R.pos.y, dz = tz - R.pos.z;
    const d = Math.hypot(dx, dy, dz);
    // arc: rise while far away
    const lift = Math.min(5, Math.max(0, d - 3) * 0.3);
    const ay = dy + lift;
    const want = Math.min(vmax || 11, d * 1.8);
    const l = Math.hypot(dx, ay, dz) || 1;
    const k = 1 - Math.exp(-5 * dt);
    R.vel.x += ((dx / l) * want - R.vel.x) * k;
    R.vel.y += ((ay / l) * want - R.vel.y) * k;
    R.vel.z += ((dz / l) * want - R.vel.z) * k;
    R.pos.x += R.vel.x * dt; R.pos.y += R.vel.y * dt; R.pos.z += R.vel.z * dt;
    R.speed = Math.hypot(R.vel.x, R.vel.z);
    return d;
  },

  // =============================================================== ANIMATION
  _maBlink(R, dt, happy) {
    R.blinkT -= dt;
    if (R.blinkT <= 0) { R.blinkOn = 0.12; R.blinkT = Math.random() < 0.22 && !R.dbl ? 0.26 : 2.0 + Math.random() * 3.4; R.dbl = R.blinkT < 0.3; }
    if (R.blinkOn > 0) R.blinkOn -= dt;
    R.lids.visible = happy || R.blinkOn > 0;
  },
  // shared joint targets for owl / sapling arms; returns targets object
  _maPose(R, mode, t, speed, extra) {
    const T = { bob: 0, jump: 0, lean: 0, sway: 0, twist: 0, aPx: 0, aPz: 0.06, aNx: 0, aNz: 0.06, aPy: 0, aNy: 0, beak: 0, cx: 0, cz: 0, happy: false, talk: false, prop: false, sq: 1 };
    const ph = t * 2.6 + (R.seed || 0);
    T.sq = 1 + Math.sin(ph) * 0.022;
    T.jump = 0.007 * (1 + Math.sin(ph));
    T.sway = Math.sin(t * 0.7) * 0.02;
    T.cz = Math.sin(t * 0.9) * 0.025;
    // occasional curious head tilt
    if (R.tiltAt == null) R.tiltAt = t + 1.5 + Math.random() * 4;
    if (t > R.tiltAt) { R.tiltS = Math.random() < 0.5 ? -1 : 1; R.tilt0 = t; R.tiltAt = t + 4.5 + Math.random() * 5.5; }
    const te = t - (R.tilt0 == null ? -99 : R.tilt0);
    const tilt = te < 1.7 ? (R.tiltS || 1) * 0.13 * Math.sin((te / 1.7) * Math.PI) : 0;
    if (mode === 'idle' || mode === 'hover') T.sway += tilt;
    if (mode === 'walk') {
      R.phase += (5.5 + speed * 3.2) * (extra && extra.dt || 0.016);
      const p = R.phase;
      T.sway = Math.sin(p) * 0.12;
      // happy little hops: lift at mid-stride, squash on landing
      T.jump = Math.abs(Math.sin(p)) * 0.07 * Math.min(1, 0.35 + speed * 0.45);
      T.sq = 1 - 0.04 * Math.cos(2 * p);
      T.lean = 0.07 * Math.min(1, speed / 2);
      T.aPz = 0.18 + Math.sin(p) * 0.08; T.aNz = 0.18 - Math.sin(p) * 0.08;
      T.aPx = -Math.sin(p) * 0.25; T.aNx = Math.sin(p) * 0.25;
      T.cz = Math.sin(p) * 0.06;
    } else if (mode === 'talk' || mode === 'explain') {
      T.talk = true;
      T.sway += tilt * 0.6;
      const g = Math.sin(t * 3.1);
      T.aNz = 0.3 + g * 0.14; T.aNx = -0.42 - g * 0.12;
      T.aPz = 0.1 + Math.max(0, Math.sin(t * 1.7)) * 0.12;
      if (mode === 'explain') { T.aNz = 1.75 + Math.sin(t * 4) * 0.12; T.aNx = -0.25; }
      T.sway = Math.sin(t * 1.6) * 0.045;
    } else if (mode === 'point') {
      T.talk = true;
      T.aNz = 1.45; T.aNx = -0.85;
      T.twist = extra && extra.pointTwist || 0;
    } else if (mode === 'cheer' && R.big) {
      // graduation: big bouncy jumps, both arms pumping, squash & stretch
      T.happy = true;
      const ph = t * 5.2;
      T.jump = Math.abs(Math.sin(ph)) * 0.3;
      T.sq = 1 - 0.055 * Math.cos(ph * 2);
      T.aPz = 2.5 + Math.sin(t * 10.4) * 0.32; T.aNz = 2.5 + Math.sin(t * 10.4 + 1.4) * 0.32;
      T.aPx = -0.2 + Math.sin(ph) * 0.18; T.aNx = -0.2 - Math.sin(ph) * 0.18;
      T.cz = Math.sin(ph) * 0.15;
      T.sway = Math.sin(t * 2.6) * 0.11;
      T.lean = -0.07;
    } else if (mode === 'cheer') {
      T.happy = true;
      T.jump = Math.abs(Math.sin(t * 6.2)) * 0.16;
      T.aPz = 2.35 + Math.sin(t * 12) * 0.15; T.aNz = 2.35 + Math.sin(t * 12 + 1) * 0.15;
      T.cz = Math.sin(t * 6.2) * 0.08;
    } else if (mode === 'think') {
      T.aNz = -0.62; T.aNx = -1.42; T.sway = 0.1; T.lean = 0.04;
      T.aPz = 0.08;
    } else if (mode === 'wave') {
      T.happy = (Math.sin(t * 0.5) > 0.6);
      T.aNz = 2.3 + Math.sin(t * 9) * 0.32; T.aNx = -0.2;
      T.talk = true;
    } else if (mode === 'inspect') {
      T.lean = 0.2; T.aPz = -0.4; T.aPx = -1.5; T.prop = true;
      T.sway = -0.05;
    } else if (mode === 'surprised') {
      T.lean = -0.14; T.aPz = 1.1; T.aNz = 1.1;
    } else if (mode === 'wai') {
      T.happy = true;
      T.aPz = -0.66; T.aNz = -0.66; T.aPx = -1.07; T.aNx = -1.07;
      T.lean = 0.12 + Math.max(0, Math.sin(t * 1.8)) * 0.1;
    } else if (mode === 'curious') {
      T.sway = 0.14; T.aNz = -0.5; T.aNx = -1.3; T.talk = true;
    }
    return T;
  },
  _maApplyPose(R, Tg, dt) {
    const j = R.j;
    const k = 1 - Math.exp(-11 * dt);
    for (const key of ['bob', 'jump', 'lean', 'sway', 'twist', 'aPx', 'aPz', 'aNx', 'aNz', 'cx', 'cz']) j[key] += ((Tg[key] || 0) - j[key]) * k;
    // hop impulse (surprised)
    if (R.hopV) { R.hopY += R.hopV * dt; R.hopV -= 9.8 * dt; if (R.hopY <= 0) { R.hopY = 0; R.hopV = 0; } }
    const b = R.body;
    b.position.y = j.jump + R.hopY;
    b.rotation.set(j.lean, j.twist, j.sway, 'YXZ');
    b.scale.set(1 / Math.sqrt(Tg.sq || 1), Tg.sq || 1, 1 / Math.sqrt(Tg.sq || 1));
    for (const a of R.arms) {
      const isP = a.s > 0;
      a.piv.rotation.set(isP ? j.aPx : j.aNx, 0, isP ? j.aPz : -j.aNz, 'XYZ');
    }
  },
  _maAnimOwl(R, dt, mode, G) {
    const E = this._E;
    const t = E.time;
    let twist = 0;
    if (mode === 'point' && G.pointAt) {
      const a = Math.atan2(G.pointAt.x - R.pos.x, G.pointAt.z - R.pos.z) - R.yaw;
      let d = a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      twist = this._cl(d * 0.35, -0.6, 0.6);
    }
    const Tg = this._maPose(R, mode, t, R.speed, { dt: dt, pointTwist: twist });
    this._maApplyPose(R, Tg, dt);
    this._maBlink(R, dt, Tg.happy);
    R.talkA = this._damp(R.talkA, Tg.talk ? 1 : 0, 8, dt);
    const syll = Math.max(0, Math.sin(t * 13)) * (0.5 + 0.5 * Math.sin(t * 4.3)) * R.talkA;
    R.beakPivot.rotation.x = syll * 0.5;
    R.prop.visible = !!Tg.prop;
  },
  _maAnimSap(R, dt, mode) {
    const E = this._E;
    const t = E.time;
    const Tg = this._maPose(R, mode, t, R.speed, { dt: dt });
    this._maApplyPose(R, Tg, dt);
    this._maBlink(R, dt, Tg.happy);
    R.crown.rotation.set(R.j.cx + Math.sin(t * 1.3) * 0.02, 0, R.j.cz, 'XYZ');
    R.talkA = this._damp(R.talkA, Tg.talk ? 1 : 0, 8, dt);
    R.mouth.visible = R.talkA > 0.3 && Math.sin(t * 12) > 0;
    R.prop.visible = !!Tg.prop;
  },
  _maAnimFly(R, dt, mode, shine, tgt) {
    const E = this._E;
    const t = E.time;
    const m = mode === 'hover' || mode === 'shine' ? 'idle' : mode;
    const Tg = this._maPose(R, m, t, 0, { dt: dt });
    // arms: firefly-scale gestures
    if (mode === 'shine') { Tg.aNz = 1.2; Tg.aNx = -0.6; Tg.talk = false; }
    const sp = Math.min(1, R.speed / 5);
    Tg.lean = sp * 0.45 + (Tg.lean || 0);
    Tg.jump = 0;
    Tg.sway = (Tg.sway || 0) + Math.sin(t * 1.9) * 0.05;
    this._maApplyPose(R, Tg, dt);
    // hover bob on top of the root position
    R.body.position.y = R.alt + Math.sin(t * 2.4) * 0.05 + (mode === 'cheer' ? Math.abs(Math.sin(t * 6)) * (R.big ? 0.3 : 0.12) : 0) + R.hopY;
    // wings flap fast
    const f = Math.sin(t * 34) * 0.42;
    for (const w of R.wings) w.piv.rotation.set(0.15, w.s * (0.22 + f), 0, 'XYZ');
    this._maBlink(R, dt, Tg.happy);
    R.talkA = this._damp(R.talkA, Tg.talk ? 1 : 0, 8, dt);
    R.mouth.visible = R.talkA > 0.3 && Math.sin(t * 13) > 0;
    void shine; void tgt;
  }
};
