/* GHG Town 3D v0.3 — sky dome, image-based light, time of day / weather, lamps, shadow follow */
GHG3.sky = {
  _skyPresets() {
    return {
      day: { top: '#3F7EC6', mid: '#C3DCEA', bot: '#9FAA9C', sun: '#FFF0D8', sunI: 2.7, dir: [-0.45, 0.80, 0.40], hs: '#D4E6FF', hg: '#7E7C6A', hI: 0.62, fog: '#C8DCE7', fn: 240, ff: 1900, exp: 1.0, night: 0, lamps: 0, stars: 0, cloud: '#FFFFFF', cloudA: 0.85, rain: 0, wet: 0 },
      evening: { top: '#3C4F8C', mid: '#F0A872', bot: '#6E5D52', sun: '#FFAE62', sunI: 2.3, dir: [-0.93, 0.17, 0.33], hs: '#F3C29C', hg: '#4F453C', hI: 0.5, fog: '#D9A47E', fn: 220, ff: 1700, exp: 1.05, night: 0.45, lamps: 0.55, stars: 0.05, cloud: '#FFC08A', cloudA: 0.8, rain: 0, wet: 0 },
      night: { top: '#03060C', mid: '#17233A', bot: '#080B10', sun: '#9DB6E0', sunI: 0.42, dir: [0.35, 0.78, -0.5], hs: '#2B3B5A', hg: '#0E1216', hI: 0.42, fog: '#121B29', fn: 90, ff: 1100, exp: 1.25, night: 1, lamps: 1, stars: 1, cloud: '#2B3446', cloudA: 0.5, rain: 0, wet: 0.15 },
      rain: { top: '#5A646E', mid: '#A1ABB2', bot: '#6B7270', sun: '#E2E7EC', sunI: 0.75, dir: [-0.3, 0.9, 0.3], hs: '#BCC7CF', hg: '#5E615A', hI: 1.0, fog: '#9DA8B0', fn: 30, ff: 560, exp: 0.98, night: 0.3, lamps: 0.65, stars: 0, cloud: '#7D8790', cloudA: 0.95, rain: 1, wet: 1 }
    };
  },

  _initSky() {
    const E = this._E;
    const T = E.T;
    // dome (colours passed as sRGB; shader writes display colours directly)
    const mat = new T.ShaderMaterial({
      uniforms: { top: { value: new T.Color() }, mid: { value: new T.Color() }, bot: { value: new T.Color() }, sunCol: { value: new T.Color() }, sunDir: { value: new T.Vector3(0, 1, 0) }, sunK: { value: 1 } },
      vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
      fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunCol; uniform vec3 sunDir; uniform float sunK; varying vec3 vD;' +
        'void main(){ vec3 d = normalize(vD); float h = d.y; vec3 c;' +
        ' if (h > 0.0) c = mix(mid, top, pow(clamp(h, 0.0, 1.0), 0.6)); else c = mix(mid, bot, pow(clamp(-h * 4.0, 0.0, 1.0), 0.8));' +
        ' float s = max(dot(d, normalize(sunDir)), 0.0); c += sunCol * (pow(s, 1400.0) * 3.0 * sunK + pow(s, 14.0) * 0.28 * sunK);' +
        ' gl_FragColor = vec4(c, 1.0); }',
      side: T.BackSide, depthWrite: false, depthTest: false, fog: false
    });
    const dome = E.dome = new T.Mesh(new T.SphereGeometry(4000, 32, 16), mat);
    dome.frustumCulled = false;
    dome.renderOrder = -100;
    E.scene.add(dome);
    // stars
    const R = this._rng(77);
    const sp = [];
    for (let i = 0; i < 1600; i++) {
      const u = R() * 2 - 1, th = R() * Math.PI * 2, y = Math.abs(u) * 0.95 + 0.05;
      const rr = Math.sqrt(1 - y * y);
      sp.push(Math.cos(th) * rr * 3800, y * 3800, Math.sin(th) * rr * 3800);
    }
    const sg = new T.BufferGeometry();
    sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
    E.stars = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    E.stars.frustumCulled = false;
    E.stars.renderOrder = -99;
    E.scene.add(E.stars);
    // clouds
    E.clouds = [];
    for (let i = 0; i < 46; i++) {
      const m = new T.Sprite(E.mats.sprite(E.tex.puff, { fog: true, opacity: 0.8 }));
      const s = 260 + R() * 420;
      m.scale.set(s, s * (0.35 + R() * 0.2), 1);
      m.position.set(-3200 + R() * 6400, 420 + R() * 380, -3200 + R() * 6400);
      m.userData.v = 2 + R() * 4;
      E.scene.add(m);
      E.clouds.push(m);
    }
    // environment scene for PMREM (linear vertex-coloured sphere)
    E.envScene = new T.Scene();
    E.envGeo = new T.SphereGeometry(100, 24, 12);
    const cnt = E.envGeo.attributes.position.count;
    E.envGeo.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(cnt * 3), 3));
    E.envScene.add(new T.Mesh(E.envGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    E.pmrem = new T.PMREMGenerator(E.renderer);
    // lamps: glow points + light pools + nearest point lights
    E.plights = [];
    for (let i = 0; i < 6; i++) {
      const L = new T.PointLight(0xffd9a0, 0, 26, 1.6);
      L.position.set(0, -100, 0);
      E.scene.add(L);
      E.plights.push(L);
    }
    // v1.1: the two interior lamps nearest the camera become shadow-casting downlights (real cast shadows indoors).
    // They always exist, so shaders never recompile; their shadow maps only render while you are inside.
    E.spots = [];
    for (let i = 0; i < 2; i++) {
      const S = new T.SpotLight(0xfff1dc, 0, 24, 1.0, 0.8, 1.2);
      S.castShadow = true;
      S.shadow.mapSize.set(1024, 1024);
      S.shadow.bias = -0.0005;
      S.shadow.normalBias = 0.035;
      S.shadow.camera.near = 0.4;
      S.shadow.camera.far = 26;
      S.shadow.autoUpdate = false;
      S.position.set(0, -100, 0);
      S.target.position.set(0, -110, 0);
      E.scene.add(S);
      E.scene.add(S.target);
      E.spots.push(S);
    }
    E.inK = 0;
    E.wx ={ cur: Object.assign({}, this._skyPresets().day), from: null, to: null, t: 1, name: 'day', envT: 0 };
    this._applySky(E.wx.cur, true);
  },

  // build glow sprites & ground light pools for every registered lamp (call after world build)
  _initLamps() {
    const E = this._E;
    const T = E.T;
    const L = E.lamps;
    if (!L.length) return;
    const pos = new Float32Array(L.length * 3);
    L.forEach((l, i) => { pos[i * 3] = l.x; pos[i * 3 + 1] = l.y; pos[i * 3 + 2] = l.z; });
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    E.lampPts = new T.Points(g, new T.PointsMaterial({ map: E.tex.glow, color: this._lcol('#FFD7A0'), size: 2.6, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
    E.scene.add(E.lampPts);
    const pools = L.filter((l) => l.pool > 0);
    const im = new T.InstancedMesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: E.tex.glow, color: this._lcol('#FFC98A'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }), pools.length);
    const M = new T.Matrix4();
    pools.forEach((l, i) => { M.makeScale(l.pool * 2, 1, l.pool * 2); M.setPosition(l.x, (l.gy || 0) + 0.09, l.z); im.setMatrixAt(i, M); });
    im.frustumCulled = false;
    E.lampPools = im;
    E.scene.add(im);
  },

  _setWeather(name) {
    const E = this._E;
    if (!E) return;
    let key = name;
    if (name === 'auto') {
      const h = new Date().getHours() + new Date().getMinutes() / 60;
      key = h >= 19 || h < 5.5 ? 'night' : (h >= 17 ? 'evening' : 'day');
    }
    const P = this._skyPresets()[key] || this._skyPresets().day;
    E.wx.from = Object.assign({}, E.wx.cur);
    E.wx.to = P;
    E.wx.t = 0;
    E.wx.name = key;
    // "real time": re-check the clock every minute so the town slides into evening and night during a class
    E.wx.auto = name === 'auto';
    E.wx.autoT = 60;
  },

  _lerpPreset(a, b, t) {
    const o = {};
    for (const k in b) {
      const va = a[k], vb = b[k];
      if (typeof vb === 'number') o[k] = va + (vb - va) * t;
      else if (Array.isArray(vb)) o[k] = vb.map((x, i) => va[i] + (x - va[i]) * t);
      else if (typeof vb === 'string' && vb[0] === '#') {
        const ca = new window.THREE.Color(va), cb = new window.THREE.Color(vb);
        o[k] = '#' + ca.lerp(cb, t).getHexString();
      } else o[k] = vb;
    }
    return o;
  },

  _applySky(p, env) {
    const E = this._E;
    const T = E.T;
    const u = E.dome.material.uniforms;
    u.top.value.set(p.top); u.mid.value.set(p.mid); u.bot.value.set(p.bot); u.sunCol.value.set(p.sun);
    E.sunDir.set(p.dir[0], p.dir[1], p.dir[2]).normalize();
    u.sunDir.value.copy(E.sunDir);
    u.sunK.value = 1 - p.rain * 0.9;
    E.sun.color.copy(this._lcol(p.sun));
    E.sun.intensity = p.sunI;
    E.hemi.color.copy(this._lcol(p.hs));
    E.hemi.groundColor.copy(this._lcol(p.hg));
    E.hemi.intensity = p.hI;
    E.scene.fog.color.copy(this._lcol(p.fog));
    E.scene.fog.near = p.fn;
    E.scene.fog.far = p.ff;
    E.scene.background = E.scene.fog.color;
    E.renderer.toneMappingExposure = p.exp;
    E.nightK = p.night;
    E.lampK = p.lamps;
    E.rainK = p.rain;
    E.wetK = p.wet;
    E.stars.material.opacity = p.stars;
    for (const c of E.clouds) { c.material.color.set(p.cloud); c.material.opacity = p.cloudA; }
    for (const k in E.BK) {
      const bk = E.BK[k];
      if (bk.night) bk.mat.emissiveIntensity = p.night * bk.night;
    }
    if (E.BK.asphalt) E.BK.asphalt.mat.roughness = 0.92 - p.wet * 0.55;
    if (E.BK.paving) E.BK.paving.mat.roughness = 0.9 - p.wet * 0.45;
    if (E.lampPts) E.lampPts.material.opacity = p.lamps;
    if (E.lampPools) E.lampPools.material.opacity = p.lamps * 0.55;
    if (env) this._rebuildEnv(p);
  },

  _rebuildEnv(p) {
    const E = this._E;
    const T = E.T;
    const pos = E.envGeo.attributes.position, col = E.envGeo.attributes.color;
    // indoors the sky light reaching walls and goods is weaker (E.envK eases toward 0.5 inside)
    const k = E.envK == null ? 1 : E.envK;
    const top = this._lcol(p.top).multiplyScalar(k), mid = this._lcol(p.mid).multiplyScalar(k), bot = this._lcol(p.hg).multiplyScalar(k);
    const c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / 100;
      if (h > 0) c.copy(mid).lerp(top, Math.pow(h, 0.6)); else c.copy(mid).lerp(bot, Math.min(1, -h * 3));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
    if (E.envRT) E.envRT.dispose();
    E.envRT = E.pmrem.fromScene(E.envScene, 0.03);
    E.scene.environment = E.envRT.texture;
  },

  _tickWeather(dt) {
    const E = this._E;
    const W = E.wx;
    if (W.auto) {
      W.autoT -= dt;
      if (W.autoT <= 0) {
        const h = new Date().getHours() + new Date().getMinutes() / 60;
        const key = h >= 19 || h < 5.5 ? 'night' : (h >= 17 ? 'evening' : 'day');
        if (key !== W.name) this._setWeather('auto'); else W.autoT = 60;
      }
    }
    if (W.to && W.t < 1) {
      W.t = Math.min(1, W.t + dt / 2.2);
      W.cur = this._lerpPreset(W.from, W.to, this._sm(W.t));
      W.envT += dt;
      const doEnv = W.t >= 1 || W.envT > 0.45;
      if (doEnv) W.envT = 0;
      this._applySky(W.cur, doEnv);
    }
    const cp = E.cam.position;
    // less haze when looking down from height (hill deck, overview, finale)
    const hk = 1 + this._cl((cp.y - 20) / 150, 0, 1) * 0.8;
    E.scene.fog.near = W.cur.fn * hk;
    E.scene.fog.far = W.cur.ff * hk;
    E.dome.position.copy(cp);
    E.stars.position.copy(cp);
    E.stars.scale.setScalar(Math.min(1, (E.cam.far * 0.9) / 3800));
    for (const c of E.clouds) {
      c.position.x += c.userData.v * dt;
      if (c.position.x > cp.x + 3300) c.position.x -= 6600;
      if (c.position.x < cp.x - 3300) c.position.x += 6600;
      if (c.position.z > cp.z + 3300) c.position.z -= 6600;
      if (c.position.z < cp.z - 3300) c.position.z += 6600;
    }
  },

  // sun shadow follows the focus point; nearest lamps / interior lights get real point lights
  _tickLights(dt) {
    const E = this._E;
    const f = E.focus || E.cam.position;
    const R = E.shadowR || 90;
    const sc = E.sun.shadow.camera;
    if (E.shadowRc !== R) { E.shadowRc = R; sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.updateProjectionMatrix(); }
    const tex = (2 * R) / 2048;
    const fx = Math.round(f.x / tex) * tex, fz = Math.round(f.z / tex) * tex;
    E.sun.target.position.set(fx, 0, fz);
    E.sun.position.set(fx + E.sunDir.x * 700, E.sunDir.y * 700, fz + E.sunDir.z * 700);
    E.sun.target.updateMatrixWorld();
    // indoors: ease the sky light down (hemisphere + environment) and the exposure up, so lamp shadows read
    const inside = E.insideObj;
    const inT = inside && inside.lights ? 1 : 0;
    E.inK += (inT - E.inK) * Math.min(1, dt * 2.2);
    if (Math.abs(E.inK - inT) < 0.002) E.inK = inT;
    const cur = E.wx.cur;
    E.hemi.intensity = cur.hI * (1 - 0.35 * E.inK);
    E.renderer.toneMappingExposure = cur.exp * (1 + 0.12 * E.inK);
    const envK = 1 - 0.35 * E.inK;
    if (E.envK == null) E.envK = 1;
    if (Math.abs(envK - E.envK) > 0.1 || (envK !== E.envK && E.inK === inT)) { E.envK = envK; this._rebuildEnv(cur); }
    // point lights
    E.plT = (E.plT || 0) - dt;
    if (E.plT > 0) return;
    E.plT = 0.35;
    const cp = E.cam.position;
    let cand = [];
    if (inside && inside.lights) {
      cand = inside.lights.map((l) => ({ x: l[0], y: l[1], z: l[2], color: l[3] || '#FFF2DC', k: l[4] || 1.4, d: l[5] || 22, ind: true, d2: (l[0] - cp.x) * (l[0] - cp.x) + (l[2] - cp.z) * (l[2] - cp.z) }));
      cand.sort((a, b) => a.d2 - b.d2);
    } else if (E.lampK > 0.05) {
      for (const l of E.lamps) {
        const dx = l.x - cp.x, dz = l.z - cp.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < 120 * 120) cand.push({ x: l.x, y: l.y - 0.3, z: l.z, color: l.color, k: 1.2 * E.lampK, d: 24, d2: d2 });
      }
      cand.sort((a, b) => a.d2 - b.d2);
    }
    // the nearest interior lamps cast shadows (skipped at the lowest quality step), the rest stay point lights
    const lowQ = E.tuneSteps && E.tuneLevel >= E.tuneSteps.length - 1 && E.tuneSteps.length > 2;
    let ci = 0;
    for (const S of E.spots) {
      const c = inside && inside.lights && !lowQ ? cand[ci] : null;
      if (c) {
        ci++;
        S.position.set(c.x, c.y, c.z);
        S.target.position.set(c.x, c.y - 10, c.z);
        S.target.updateMatrixWorld();
        S.color.copy(this._lcol(c.color));
        S.intensity = c.k * (0.8 + 0.5 * (E.nightK || 0)) + 0.7;
        S.distance = Math.max(c.d, c.y + 8);
        S.shadow.autoUpdate = true;
      } else {
        S.intensity = 0;
        S.shadow.autoUpdate = false;
      }
    }
    for (let i = 0; i < E.plights.length; i++) {
      const L = E.plights[i];
      const c = cand[ci + i];
      if (c) {
        L.position.set(c.x, c.y, c.z);
        L.color.copy(this._lcol(c.color));
        L.intensity = c.ind ? c.k * (0.28 + 0.45 * (E.nightK || 0)) + 0.3 : c.k;
        L.distance = c.d;
      } else L.intensity = 0;
    }
  }
};
