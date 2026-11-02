/* GHG Town 3D v0.3 — core: lifecycle, renderer, textures, buckets, geometry API, registries, text */
window.GHG3 = window.GHG3 || {};
GHG3.core = {
  // =============================================================== LIFECYCLE
  _dispose() {
    if (this._bootT) { clearTimeout(this._bootT); this._bootT = null; }
    const E = this._E;
    if (!E) return;
    E.alive = false;
    if (E.raf) cancelAnimationFrame(E.raf);
    if (E.ro) E.ro.disconnect();
    if (typeof this._unbindEvents === 'function') { try { this._unbindEvents(); } catch (err) { /* ignore */ } }
    try {
      const seenM = new Set();
      E.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of ms) seenM.add(m);
        }
      });
      for (const m of seenM) m.dispose();
      for (const k in E.tex) if (E.tex[k] && E.tex[k].dispose) E.tex[k].dispose();
      if (E.envRT) E.envRT.dispose();
      E.renderer.dispose();
    } catch (err) { /* ignore */ }
    this._E = null;
  },

  _boot(canvas) {
    const T = window.THREE;
    if (!T) { this._bootT = setTimeout(() => this._boot(canvas), 150); return; }
    let renderer = null;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!window.__GHG_TEST });
    } catch (err) {
      this.setState({ webgl: false });
      return;
    }
    const st = this.state || {};
    const E = this._E = {
      T: T, canvas: canvas, renderer: renderer, alive: true, w: 0, h: 0, time: 0, last: 0,
      cols: {}, lin: {}, tex: {}, texts: [], BK: {}, accMap: {}, accList: [], statics: [],
      colliders: [], colGrid: new Map(), anchors: {}, interiors: [], emitters: [], anims: [], lamps: [],
      dyn: [], pickables: [], uiCache: {}, quality: st.quality || 'high'
    };
    renderer.setPixelRatio(Math.min(window.__GHG_TEST ? 1 : 1.5, window.devicePixelRatio || 1));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = E.scene = new T.Scene();
    scene.background = this._lcol('#BFD9EA');
    scene.fog = new T.Fog(this._lcol('#C9DCE6'), 160, 1400);
    const cam = E.cam = new T.PerspectiveCamera(62, 1.6, 0.12, 6000);
    cam.position.set(-700, 120, 260);
    E.hemi = new T.HemisphereLight(this._lcol('#DDEBFF'), this._lcol('#6F7A5A'), 0.55);
    scene.add(E.hemi);
    const sun = E.sun = new T.DirectionalLight(this._lcol('#FFF1DC'), 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = 0.04;
    const sc = sun.shadow.camera;
    sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90; sc.near = 1; sc.far = 1400;
    sc.updateProjectionMatrix();
    E.sunDir = new T.Vector3(-0.45, 0.78, 0.43).normalize();
    scene.add(sun);
    scene.add(sun.target);
    E.v1 = new T.Vector3(); E.v2 = new T.Vector3(); E.v3 = new T.Vector3();
    E.ray = new T.Raycaster();
    E.ndc = new T.Vector2();
    this._initTextures();
    this._initMaterials();
    try {
      this._buildWorld();
    } catch (err) {
      console.error('[GHG Town] build failed', err);
    }
    if (typeof this._bindEvents === 'function') this._bindEvents();
    if (window.ResizeObserver) {
      E.ro = new ResizeObserver(() => this._resize());
      E.ro.observe(canvas.parentElement || canvas);
    }
    this._resize();
    if (document.fonts && document.fonts.load) {
      const fam = '"IBM Plex Sans Thai Looped"';
      Promise.all([document.fonts.load('600 16px ' + fam), document.fonts.load('700 16px ' + fam), document.fonts.load('700 16px "Bai Jamjuree"')])
        .then(() => this._redrawText()).catch(() => {});
      setTimeout(() => this._redrawText(), 2600);
    }
    if (typeof this._afterBoot === 'function') this._afterBoot();
    E.raf = requestAnimationFrame(() => this._loop());
  },

  _loop() {
    const E = this._E;
    if (!E || !E.alive) return;
    E.raf = requestAnimationFrame(() => this._loop());
    const now = performance.now() / 1000;
    let dt = E.last ? now - E.last : 0.016;
    E.last = now;
    if (dt > 0.05) dt = 0.05;
    if (!E.w) return;
    this._step(dt);
    E.renderer.render(E.scene, E.cam);
  },

  _step(dt) {
    const E = this._E;
    E.time += dt;
    const order = ['_tickTour', '_tickPlayer', '_tickGuide', '_tickCrowd', '_tickAnimals', '_tickTraffic', '_tickAnims', '_tickFx', '_tickWeather', '_tickCam', '_tickLights', '_tickHud', '_tickAudio'];
    for (const k of order) if (typeof this[k] === 'function') this[k](dt);
  },

  _resize() {
    const E = this._E;
    if (!E) return;
    const c = E.canvas;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (!w || !h) { E.w = 0; return; }
    if (w === E.w && h === E.h) return;
    E.w = w; E.h = h;
    E.renderer.setSize(w, h, false);
    E.cam.aspect = w / h;
    E.cam.updateProjectionMatrix();
  },

  // diff-checked setState from the engine (cheap to call every frame)
  _ui(patch) {
    const E = this._E;
    const c = E ? E.uiCache : {};
    let dirty = false;
    for (const k in patch) if (c[k] !== patch[k]) { c[k] = patch[k]; dirty = true; }
    if (dirty) this.setState(Object.assign({}, patch));
  },

  // =============================================================== MATH
  _cl(v, a, b) { return v < a ? a : (v > b ? b : v); },
  _lp(a, b, t) { return a + (b - a) * t; },
  _sm(t) { t = t < 0 ? 0 : (t > 1 ? 1 : t); return t * t * (3 - 2 * t); },
  _damp(a, b, k, dt) { return b + (a - b) * Math.exp(-k * dt); },
  _angDamp(a, b, k, dt) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * (1 - Math.exp(-k * dt));
  },
  _rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  // =============================================================== COLOURS (sRGB hex -> linear)
  _lc(hex) {
    if (Array.isArray(hex)) return hex;
    const E = this._E;
    let v = E.lin[hex];
    if (!v) {
      const c = new E.T.Color(hex).convertSRGBToLinear();
      v = E.lin[hex] = [c.r, c.g, c.b];
    }
    return v;
  },
  _lcol(hex) { return new window.THREE.Color(hex).convertSRGBToLinear(); },
  // multiply a colour (hex or linear array) by f, returns linear array
  _shade(hex, f) { const c = this._lc(hex); return [c[0] * f, c[1] * f, c[2] * f]; },
  _mixc(a, b, t) { const x = this._lc(a), y = this._lc(b); return [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]; },

  // =============================================================== TEXT HELPERS
  _font(weight, px, fam) {
    return weight + ' ' + px + 'px ' + (fam || '"IBM Plex Sans Thai Looped", "Noto Sans Thai", "Leelawadee UI", Thonburi, Tahoma, sans-serif');
  },
  _rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },
  // fit text into maxW by shrinking the font; returns used px
  _fitText(ctx, text, x, y, maxW, px, weight, color, align, fam) {
    let size = px;
    ctx.font = this._font(weight, size, fam);
    while (ctx.measureText(text).width > maxW && size > 8) { size -= 1; ctx.font = this._font(weight, size, fam); }
    ctx.fillStyle = color;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    return size;
  },
  // canvas texture; if `text` is true the draw fn is re-run after web fonts load
  _canvasTex(w, h, draw, o) {
    const E = this._E;
    const T = E.T;
    const cv = document.createElement('canvas');
    cv.width = Math.max(2, Math.ceil(w));
    cv.height = Math.max(2, Math.ceil(h));
    const ctx = cv.getContext('2d');
    draw(ctx, cv.width, cv.height);
    const tex = new T.CanvasTexture(cv);
    tex.anisotropy = 8;
    if (!(o && o.linear)) tex.encoding = T.sRGBEncoding;
    if (o && o.repeat) { tex.wrapS = T.RepeatWrapping; tex.wrapT = T.RepeatWrapping; }
    if (o && o.text) E.texts.push({ tex: tex, draw: draw });
    return tex;
  },
  // text plane (double sided optional)
  _sign(text, w, h, bg, fg, pos, ry, o) {
    const E = this._E;
    const T = E.T;
    o = o || {};
    const pxH = o.pxH || 128;
    const pxW = Math.round(pxH * (w / h));
    const draw = (ctx, W, H) => {
      ctx.clearRect(0, 0, W, H);
      if (bg) {
        ctx.fillStyle = bg;
        this._rr(ctx, 0, 0, W, H, o.round ? H * 0.2 : 6);
        ctx.fill();
      }
      if (o.border) { ctx.lineWidth = Math.max(4, H * 0.05); ctx.strokeStyle = o.border; this._rr(ctx, H * 0.05, H * 0.05, W - H * 0.1, H - H * 0.1, o.round ? H * 0.16 : 4); ctx.stroke(); }
      const lines = String(text).split('\n');
      const n = lines.length;
      const px = Math.round(H * (o.size || (n > 1 ? 0.34 : 0.52)));
      for (let i = 0; i < n; i++) {
        const y = H / 2 + (i - (n - 1) / 2) * px * 1.18;
        this._fitText(ctx, lines[i], W / 2, y + px * 0.04, W * 0.9, i === 0 ? px : Math.round(px * (o.sub || 0.8)), 700, fg, 'center', o.fam);
      }
    };
    const tex = this._canvasTex(pxW, pxH, draw, { text: true });
    const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, side: o.both ? T.DoubleSide : T.FrontSide, fog: true, toneMapped: false });
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.y = ry || 0;
    if (o.rx) mesh.rotation.x = o.rx;
    E.scene.add(mesh);
    return mesh;
  },
  _redrawText() {
    const E = this._E;
    if (!E || !E.alive) return;
    for (const t of E.texts) {
      const cv = t.tex.image;
      t.draw(cv.getContext('2d'), cv.width, cv.height);
      t.tex.needsUpdate = true;
    }
    if (typeof this._redrawHud === 'function') this._redrawHud();
  },

  // =============================================================== PROCEDURAL TEXTURES
  _initTextures() {
    const E = this._E;
    const R = this._rng(1234567);
    const rep = { repeat: true };
    const speck = (g, W, H, n, s0, s1, cols) => {
      for (let i = 0; i < n; i++) {
        g.fillStyle = cols[(R() * cols.length) | 0];
        const s = s0 + R() * (s1 - s0);
        g.fillRect(R() * W, R() * H, s, s);
      }
    };
    const blots = (g, W, H, n, r0, r1, col) => {
      for (let i = 0; i < n; i++) {
        const x = R() * W, y = R() * H, r = r0 + R() * (r1 - r0);
        for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) {
          const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
          gr.addColorStop(0, col);
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = gr;
          g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
        }
      }
    };
    const tx = (name, W, H, draw, o) => { E.tex[name] = this._canvasTex(W, H, draw, Object.assign({ repeat: true }, o || {})); };

    tx('asphalt', 512, 512, (g, W, H) => {
      g.fillStyle = '#56595C'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 14, 40, 120, 'rgba(30,30,32,0.16)');
      blots(g, W, H, 8, 30, 90, 'rgba(140,140,135,0.10)');
      speck(g, W, H, 16000, 1, 2.4, ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.22)', 'rgba(150,145,135,0.18)', 'rgba(20,20,20,0.18)']);
      g.strokeStyle = 'rgba(25,25,25,0.35)'; g.lineWidth = 1.2;
      for (let k = 0; k < 5; k++) {
        let x = R() * W, y = R() * H;
        g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s < 14; s++) { x += (R() - 0.5) * 22; y += (R() - 0.3) * 14; g.lineTo(x, y); }
        g.stroke();
      }
    });
    tx('paving', 512, 512, (g, W, H) => {
      const n = 8, s = W / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const pink = ((i + j) % 2 === 0) && ((i * 3 + j) % 5 < 2);
        const v = 196 + ((R() * 22) | 0);
        g.fillStyle = pink ? `rgb(${v - 4},${v - 30},${v - 34})` : `rgb(${v},${v - 2},${v - 8})`;
        g.fillRect(i * s, j * s, s, s);
      }
      speck(g, W, H, 9000, 1, 2, ['rgba(0,0,0,0.10)', 'rgba(255,255,255,0.12)', 'rgba(90,80,70,0.10)']);
      blots(g, W, H, 6, 30, 80, 'rgba(60,55,50,0.10)');
      g.fillStyle = 'rgba(70,66,60,0.55)';
      for (let i = 0; i <= n; i++) { g.fillRect(i * s - 1.5, 0, 3, H); g.fillRect(0, i * s - 1.5, W, 3); }
    });
    tx('grass', 512, 512, (g, W, H) => {
      g.fillStyle = '#6E9442'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 18, 30, 110, 'rgba(40,70,20,0.22)');
      blots(g, W, H, 12, 30, 90, 'rgba(170,190,90,0.18)');
      for (let i = 0; i < 9000; i++) {
        const x = R() * W, y = R() * H, l = 3 + R() * 7;
        const c = R();
        g.strokeStyle = c < 0.33 ? 'rgba(52,88,30,0.55)' : (c < 0.66 ? 'rgba(130,170,70,0.45)' : 'rgba(95,130,50,0.5)');
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 3, y - l); g.stroke();
      }
    });
    tx('dirt', 512, 512, (g, W, H) => {
      g.fillStyle = '#8A6C4D'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 16, 30, 110, 'rgba(60,40,25,0.22)');
      blots(g, W, H, 10, 30, 90, 'rgba(190,160,120,0.16)');
      speck(g, W, H, 14000, 1, 3, ['rgba(50,35,20,0.35)', 'rgba(200,175,140,0.25)', 'rgba(120,95,70,0.35)']);
    });
    tx('plaster', 512, 512, (g, W, H) => {
      g.fillStyle = '#F3F1EC'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 10, 40, 140, 'rgba(120,115,105,0.06)');
      speck(g, W, H, 9000, 1, 2, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.5)', 'rgba(110,100,90,0.05)']);
      for (let i = 0; i < 40; i++) {
        const x = R() * W, l = 30 + R() * 140;
        const gr = g.createLinearGradient(0, 0, 0, l);
        gr.addColorStop(0, 'rgba(90,85,75,0.10)'); gr.addColorStop(1, 'rgba(90,85,75,0)');
        g.fillStyle = gr; g.fillRect(x, 0, 2 + R() * 5, l);
      }
    });
    tx('concrete', 512, 512, (g, W, H) => {
      g.fillStyle = '#CBC8C1'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 14, 30, 120, 'rgba(80,78,70,0.10)');
      speck(g, W, H, 14000, 1, 2, ['rgba(0,0,0,0.10)', 'rgba(255,255,255,0.18)', 'rgba(110,100,90,0.10)']);
      g.fillStyle = 'rgba(80,76,70,0.28)';
      g.fillRect(0, H / 2 - 1, W, 2); g.fillRect(W / 2 - 1, 0, 2, H);
      g.fillStyle = 'rgba(60,58,52,0.35)';
      for (const x of [W * 0.25, W * 0.75]) for (const y of [H * 0.25, H * 0.75]) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); }
    });
    tx('metal', 512, 512, (g, W, H) => {
      const ribs = 26, s = W / ribs;
      for (let i = 0; i < ribs; i++) {
        const gr = g.createLinearGradient(i * s, 0, (i + 1) * s, 0);
        gr.addColorStop(0, '#B9BEC3'); gr.addColorStop(0.35, '#F1F3F4'); gr.addColorStop(0.65, '#D7DBDF'); gr.addColorStop(1, '#A4AAB0');
        g.fillStyle = gr; g.fillRect(i * s, 0, s + 1, H);
      }
      for (let i = 0; i < 26; i++) {
        const x = R() * W, l = 60 + R() * 260;
        const gr = g.createLinearGradient(0, 0, 0, l);
        gr.addColorStop(0, 'rgba(120,80,50,0.16)'); gr.addColorStop(1, 'rgba(120,80,50,0)');
        g.fillStyle = gr; g.fillRect(x, R() * H * 0.3, 3 + R() * 8, l);
      }
      speck(g, W, H, 5000, 1, 2, ['rgba(0,0,0,0.06)', 'rgba(255,255,255,0.15)']);
      g.fillStyle = 'rgba(60,60,60,0.35)';
      g.fillRect(0, H - 3, W, 3);
    });
    tx('tile', 512, 512, (g, W, H) => {
      g.fillStyle = '#E9E3DC'; g.fillRect(0, 0, W, H);
      const rows = 6, rh = H / rows, cols = 8, cw = W / cols;
      for (let r = 0; r < rows; r++) {
        const off = (r % 2) * cw / 2;
        for (let c = -1; c <= cols; c++) {
          const x = c * cw + off, y = r * rh;
          const v = 225 + ((R() * 26) | 0);
          g.fillStyle = `rgb(${v},${v - 6},${v - 12})`;
          g.beginPath();
          g.moveTo(x + 2, y);
          g.lineTo(x + cw - 2, y);
          g.lineTo(x + cw - 2, y + rh * 0.78);
          g.quadraticCurveTo(x + cw / 2, y + rh * 1.02, x + 2, y + rh * 0.78);
          g.closePath(); g.fill();
          g.fillStyle = 'rgba(0,0,0,0.16)';
          g.fillRect(x + 2, y + rh * 0.74, cw - 4, 3);
        }
        g.fillStyle = 'rgba(40,30,25,0.30)';
        g.fillRect(0, y0(r), W, 3);
      }
      function y0(r) { return r * rh; }
      speck(g, W, H, 7000, 1, 2, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.12)', 'rgba(80,90,60,0.08)']);
    });
    tx('wood', 512, 512, (g, W, H) => {
      const rows = 10, rh = H / rows;
      for (let r = 0; r < rows; r++) {
        const v = 170 + ((R() * 40) | 0);
        g.fillStyle = `rgb(${v},${(v * 0.74) | 0},${(v * 0.5) | 0})`;
        g.fillRect(0, r * rh, W, rh);
        g.strokeStyle = 'rgba(70,40,20,0.25)'; g.lineWidth = 1;
        for (let k = 0; k < 7; k++) {
          g.beginPath();
          let y = r * rh + R() * rh;
          g.moveTo(0, y);
          for (let x = 0; x <= W; x += 32) { y += (R() - 0.5) * 2.4; g.lineTo(x, y); }
          g.stroke();
        }
        g.fillStyle = 'rgba(40,22,10,0.55)'; g.fillRect(0, r * rh, W, 2);
        const jx = R() * W; g.fillRect(jx, r * rh, 2, rh);
      }
    });
    tx('brick', 512, 512, (g, W, H) => {
      g.fillStyle = '#B9B2A6'; g.fillRect(0, 0, W, H);
      const rows = 16, rh = H / rows, bw = W / 4;
      for (let r = 0; r < rows; r++) for (let c = -1; c < 5; c++) {
        const x = c * bw + (r % 2) * bw / 2;
        const v = R();
        g.fillStyle = v < 0.4 ? '#A6533A' : (v < 0.75 ? '#B5634A' : '#91442F');
        g.fillRect(x + 2, r * rh + 2, bw - 4, rh - 4);
      }
      speck(g, W, H, 9000, 1, 2, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.10)']);
    });
    tx('crop', 512, 512, (g, W, H) => {
      g.fillStyle = '#5C7D34'; g.fillRect(0, 0, W, H);
      const rows = 16, rw = W / rows;
      for (let i = 0; i < rows; i++) {
        g.fillStyle = 'rgba(70,60,30,0.35)'; g.fillRect(i * rw, 0, rw * 0.28, H);
        for (let k = 0; k < 160; k++) {
          const y = R() * H, x = i * rw + rw * 0.3 + R() * rw * 0.65;
          g.fillStyle = R() < 0.5 ? 'rgba(120,170,60,0.55)' : 'rgba(60,100,30,0.5)';
          g.fillRect(x, y, 2, 4 + R() * 6);
        }
      }
    });
    tx('water', 512, 512, (g, W, H) => {
      g.fillStyle = '#5E8790'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 12, 40, 140, 'rgba(30,60,70,0.25)');
      g.strokeStyle = 'rgba(220,240,240,0.18)'; g.lineWidth = 2;
      for (let i = 0; i < 160; i++) {
        const x = R() * W, y = R() * H, l = 10 + R() * 40;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke();
      }
    });
    tx('glow', 128, 128, (g, W, H) => {
      const gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }, { repeat: false, linear: true });
    tx('puff', 128, 128, (g, W, H) => {
      for (let i = 0; i < 9; i++) {
        const x = W * (0.3 + R() * 0.4), y = H * (0.3 + R() * 0.4), r = W * (0.18 + R() * 0.18);
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
    }, { repeat: false, linear: true });

    // ---------- facades (atlases, emissive twins for night)
    const win = (g, x, y, w, h, o) => {
      // aluminium frame + glass with sky reflection
      g.fillStyle = o.frame || '#C9CDD0'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
      const gr = g.createLinearGradient(x, y, x + w * 0.3, y + h);
      gr.addColorStop(0, o.g0 || '#7FA3B8'); gr.addColorStop(0.55, o.g1 || '#36505F'); gr.addColorStop(1, o.g2 || '#24333D');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      if (o.curtain) { g.fillStyle = o.curtain; g.fillRect(x + 2, y + 2, w * (0.25 + R() * 0.3), h - 4); g.fillRect(x + w * 0.72, y + 2, w * 0.26, h - 4); }
      g.fillStyle = o.frame || '#C9CDD0';
      g.fillRect(x + w / 2 - 2, y, 4, h);
      if (o.grille) {
        g.strokeStyle = 'rgba(40,40,40,0.75)'; g.lineWidth = 2;
        for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(x + (w * k) / 7, y); g.lineTo(x + (w * k) / 7, y + h); g.stroke(); }
        g.beginPath(); g.moveTo(x, y + h * 0.5); g.lineTo(x + w, y + h * 0.5); g.stroke();
        for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(x + (w * (k + 0.5)) / 7, y + h * 0.5, w / 18, 0, Math.PI * 2); g.stroke(); }
      }
    };
    const litWin = (g, x, y, w, h, on, warm) => {
      if (!on) { g.fillStyle = '#000'; g.fillRect(x, y, w, h); return; }
      const gr = g.createLinearGradient(x, y, x, y + h);
      gr.addColorStop(0, warm ? '#FFE3A8' : '#E6F0FF'); gr.addColorStop(1, warm ? '#E3A85A' : '#9FB6D8');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
    };
    const acUnit = (g, x, y, w, h) => {
      g.fillStyle = '#E9ECEE'; g.fillRect(x, y, w, h);
      g.fillStyle = '#8D969D'; g.beginPath(); g.arc(x + w * 0.62, y + h / 2, h * 0.36, 0, 7); g.fill();
      g.strokeStyle = '#C8CED2'; g.lineWidth = 1.5;
      for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + 4, y + 5 + k * (h - 10) / 3); g.lineTo(x + w * 0.35, y + 5 + k * (h - 10) / 3); g.stroke(); }
    };

    // shophouse upper floors: 4 units (4 m) x 2 floors (4 m); 1024 x 512
    const shopLay = [];
    for (let u = 0; u < 4; u++) for (let f = 0; f < 2; f++) shopLay.push({ u: u, f: f, t: R(), lit: R() < 0.45, cur: ['#B85C4B', '#D9C08A', '#7A8FB0', '#E7E1D3', '#9DB38A'][(R() * 5) | 0], ac: R() < 0.5, grille: R() < 0.55, bal: R() < 0.3 });
    tx('shop', 1024, 512, (g, W, H) => {
      g.fillStyle = '#F2F0EB'; g.fillRect(0, 0, W, H);
      blots(g, W, H, 10, 40, 120, 'rgba(110,100,90,0.07)');
      for (const L of shopLay) {
        const x0 = L.u * 256, y0 = (1 - L.f) * 256;
        g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(x0, y0 + 250, 256, 6);
        g.fillStyle = 'rgba(90,85,80,0.35)'; g.fillRect(x0 + 252, y0, 4, 256);
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x0, y0 + 224, 256, 6);
        win(g, x0 + 40, y0 + 60, 176, 104, { curtain: L.cur, grille: L.grille });
        if (L.bal) { g.fillStyle = '#D9D6CF'; g.fillRect(x0 + 24, y0 + 168, 208, 12); g.strokeStyle = '#6C6F70'; g.lineWidth = 3; for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(x0 + 30 + k * 15, y0 + 168); g.lineTo(x0 + 30 + k * 15, y0 + 132); g.stroke(); } g.fillRect(x0 + 24, y0 + 128, 208, 5); }
        if (L.ac) acUnit(g, x0 + 150, y0 + 180, 70, 44);
      }
      speck(g, W, H, 9000, 1, 2, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.3)']);
    });
    tx('shopE', 1024, 512, (g, W, H) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      for (const L of shopLay) { const x0 = L.u * 256, y0 = (1 - L.f) * 256; litWin(g, x0 + 40, y0 + 60, 176, 104, L.lit, true); }
    }, { linear: false });

    // ground-floor shop fronts: 4 units x 1 floor (4 m), 1024 x 256 (two variants)
    const names = [['ร้านทอง', '#C8102E', '#FFD54F'], ['ข้าวมันไก่', '#FFFFFF', '#C62828'], ['ร้านยา', '#2E7D32', '#FFFFFF'], ['ก๋วยเตี๋ยวเรือ', '#FFC107', '#5D2A00'],
      ['ซ่อมมอเตอร์ไซค์', '#1565C0', '#FFFFFF'], ['ร้านกาแฟ', '#4E342E', '#FFE0B2'], ['วัสดุก่อสร้าง', '#F57C00', '#FFFFFF'], ['ร้านเสริมสวย', '#AD1457', '#FFFFFF']];
    const frontDraw = (variant, emissive) => (g, W, H) => {
      const R2 = this._rng(99 + variant * 31);
      g.fillStyle = emissive ? '#000' : '#E7E3DA'; g.fillRect(0, 0, W, H);
      for (let u = 0; u < 4; u++) {
        const x0 = u * 256;
        const nm = names[(variant * 4 + u) % names.length];
        const kind = (u + variant) % 4;
        // signboard band
        if (emissive) { g.fillStyle = 'rgba(255,240,200,0.55)'; g.fillRect(x0 + 8, 6, 240, 46); }
        else {
          g.fillStyle = nm[1]; g.fillRect(x0 + 8, 6, 240, 46);
          this._fitText(g, nm[0], x0 + 128, 30, 220, 30, 700, nm[2], 'center');
        }
        const oy = 60, oh = 196;
        if (kind === 0) { // roll-up shutter
          if (emissive) continue;
          for (let k = 0; k < 28; k++) { g.fillStyle = k % 2 ? '#9EA4A8' : '#B9BEC1'; g.fillRect(x0 + 14, oy + k * 7, 228, 7); }
          g.fillStyle = '#6D7377'; g.fillRect(x0 + 14, oy, 228, 4); g.fillRect(x0 + 118, oy + 150, 20, 8);
        } else if (kind === 1) { // open eatery
          if (emissive) { const gr = g.createLinearGradient(0, oy, 0, oy + oh); gr.addColorStop(0, '#FFE6B0'); gr.addColorStop(1, '#8A5A20'); g.fillStyle = gr; g.fillRect(x0 + 14, oy, 228, oh); continue; }
          g.fillStyle = '#3B2F27'; g.fillRect(x0 + 14, oy, 228, oh);
          g.fillStyle = '#F2D9A8'; g.fillRect(x0 + 24, oy + 10, 208, 14);
          g.fillStyle = '#C9B79C'; g.fillRect(x0 + 20, oy + 110, 120, 50);
          g.fillStyle = '#B8BCC0'; for (let k = 0; k < 3; k++) g.fillRect(x0 + 30 + k * 34, oy + 92, 22, 18);
          g.fillStyle = '#D84315'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x0 + 170 + (k % 2) * 34, oy + 150 + (k > 1 ? 28 : 0), 10, 0, 7); g.fill(); }
        } else if (kind === 2) { // shelves of goods
          if (emissive) { g.fillStyle = '#FFF4DA'; g.fillRect(x0 + 14, oy, 228, oh); continue; }
          g.fillStyle = '#F3EEE4'; g.fillRect(x0 + 14, oy, 228, oh);
          for (let s = 0; s < 4; s++) {
            g.fillStyle = '#8D6E63'; g.fillRect(x0 + 18, oy + 30 + s * 42, 220, 4);
            for (let k = 0; k < 11; k++) {
              g.fillStyle = ['#E53935', '#FDD835', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA'][(R2() * 6) | 0];
              const bh = 14 + R2() * 20; g.fillRect(x0 + 22 + k * 19, oy + 30 + s * 42 - bh, 15, bh);
            }
          }
        } else { // folding steel gate, half open
          if (emissive) { g.fillStyle = '#E8C98F'; g.fillRect(x0 + 130, oy, 112, oh); continue; }
          g.fillStyle = '#2B2622'; g.fillRect(x0 + 14, oy, 228, oh);
          g.fillStyle = '#C9C2B4'; g.fillRect(x0 + 140, oy + 40, 90, 110);
          g.strokeStyle = '#7E868A'; g.lineWidth = 3;
          for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(x0 + 16 + k * 10, oy); g.lineTo(x0 + 16 + k * 10, oy + oh); g.stroke(); }
          for (let k = 0; k < 11; k++) { g.beginPath(); g.moveTo(x0 + 16 + k * 10, oy + 20); g.lineTo(x0 + 26 + k * 10, oy + oh - 20); g.stroke(); }
        }
        g.fillStyle = 'rgba(80,75,70,0.6)'; g.fillRect(x0 + 252, 0, 4, H);
      }
    };
    tx('front', 1024, 256, frontDraw(0, false), { text: true });
    tx('frontE', 1024, 256, frontDraw(0, true));
    tx('front2', 1024, 256, frontDraw(1, false), { text: true });
    tx('front2E', 1024, 256, frontDraw(1, true));

    // office curtain wall: 4 bays (3.75 m) x 4 floors (3.75 m); 1024 x 1024
    const offLay = [];
    for (let i = 0; i < 16; i++) offLay.push({ lit: R() < 0.55, blind: R() < 0.35 });
    tx('office', 1024, 1024, (g, W, H) => {
      g.fillStyle = '#2E3B44'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 16; i++) {
        const bx = (i % 4) * 256, by = ((i / 4) | 0) * 256;
        const gr = g.createLinearGradient(bx, by, bx + 120, by + 256);
        gr.addColorStop(0, '#A9C7D6'); gr.addColorStop(0.5, '#4E7286'); gr.addColorStop(1, '#2A4352');
        g.fillStyle = gr; g.fillRect(bx + 6, by + 6, 244, 180);
        if (offLay[i].blind) { g.fillStyle = 'rgba(220,220,210,0.55)'; for (let k = 0; k < 10; k++) g.fillRect(bx + 6, by + 8 + k * 10, 244, 4); }
        g.fillStyle = '#5A6770'; g.fillRect(bx + 6, by + 190, 244, 60);
        g.fillStyle = '#C3CBD0'; g.fillRect(bx, by, 6, 256); g.fillRect(bx + 125, by, 5, 190); g.fillRect(bx, by + 186, 256, 5);
      }
      speck(g, W, H, 6000, 1, 2, ['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.08)']);
    });
    tx('officeE', 1024, 1024, (g, W, H) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 16; i++) { const bx = (i % 4) * 256, by = ((i / 4) | 0) * 256; litWin(g, bx + 6, by + 6, 244, 180, offLay[i].lit, false); }
    });

    // condo / apartment: 4 bays (4 m) x 5 floors (3.2 m); 1024 x 1024  (bay = 256 x 204.8 px)
    const aptLay = [];
    for (let i = 0; i < 20; i++) aptLay.push({ lit: R() < 0.5, cur: ['#C9A27E', '#E8E1D0', '#8FA3B5', '#B57C6B', '#A9B98F'][(R() * 5) | 0], ac: R() < 0.6, laundry: R() < 0.25 });
    tx('apt', 1024, 1024, (g, W, H) => {
      g.fillStyle = '#F1EEE8'; g.fillRect(0, 0, W, H);
      const bh = H / 5;
      for (let i = 0; i < 20; i++) {
        const bx = (i % 4) * 256, by = ((i / 4) | 0) * bh;
        win(g, bx + 36, by + 30, 184, 130, { curtain: aptLay[i].cur, g0: '#9DB9C9', g1: '#476070' });
        g.fillStyle = '#D8D4CC'; g.fillRect(bx + 18, by + 160, 220, 12);
        g.fillStyle = 'rgba(140,170,180,0.55)'; g.fillRect(bx + 18, by + 126, 220, 34);
        g.fillStyle = '#9A9EA0'; g.fillRect(bx + 18, by + 124, 220, 4);
        if (aptLay[i].ac) acUnit(g, bx + 30, by + 128, 54, 32);
        if (aptLay[i].laundry) { g.fillStyle = ['#E57373', '#64B5F6', '#FFF176', '#FFFFFF'][(R() * 4) | 0]; g.fillRect(bx + 120, by + 92, 22, 30); g.fillStyle = '#81C784'; g.fillRect(bx + 150, by + 96, 18, 26); }
        g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(bx, by + bh - 4, 256, 4);
      }
      speck(g, W, H, 8000, 1, 2, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.3)']);
    });
    tx('aptE', 1024, 1024, (g, W, H) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const bh = H / 5;
      for (let i = 0; i < 20; i++) { const bx = (i % 4) * 256, by = ((i / 4) | 0) * bh; litWin(g, bx + 36, by + 30, 184, 130, aptLay[i].lit, true); }
    });
  },

  // =============================================================== MATERIALS / BUCKETS
  _initMaterials() {
    const E = this._E;
    const T = E.T;
    const X = E.tex;
    const std = (o) => new T.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.88, metalness: 0 }, o));
    const night = (m) => { m.emissive = new T.Color(0xffffff); m.emissiveIntensity = 0; return m; };
    const B = E.BK;
    // tw/th = metres covered by one repeat of the texture; cast = casts shadow
    B.flat = { mat: std({ roughness: 0.8 }), tw: 1, th: 1, cast: true };
    B.shiny = { mat: std({ roughness: 0.35, metalness: 0.55 }), tw: 1, th: 1, cast: true };
    B.glass = { mat: std({ roughness: 0.06, metalness: 0.85, color: this._lcol('#AFC4D0') }), tw: 1, th: 1, cast: false };
    B.glow = { mat: new T.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), tw: 1, th: 1, cast: false, recv: false };
    B.plaster = { mat: std({ map: X.plaster }), tw: 4, th: 4, cast: true };
    B.concrete = { mat: std({ map: X.concrete }), tw: 4.8, th: 4.8, cast: true };
    B.metal = { mat: std({ map: X.metal, roughness: 0.5, metalness: 0.35 }), tw: 2.2, th: 2.2, cast: true };
    B.tile = { mat: std({ map: X.tile, roughness: 0.75 }), tw: 2.4, th: 2.4, cast: true };
    B.wood = { mat: std({ map: X.wood }), tw: 2.5, th: 2.5, cast: true };
    B.brick = { mat: std({ map: X.brick }), tw: 1.6, th: 1.6, cast: true };
    B.asphalt = { mat: std({ map: X.asphalt, roughness: 0.92 }), tw: 9, th: 9, cast: false };
    B.paving = { mat: std({ map: X.paving, roughness: 0.9 }), tw: 2, th: 2, cast: false };
    B.grass = { mat: std({ map: X.grass, roughness: 0.96 }), tw: 9, th: 9, cast: false };
    // big terrain: same look as grass but pushed back in depth so ground decals never z-fight with it
    B.terrain = { mat: std({ map: X.grass, roughness: 0.97, polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 6 }), tw: 9, th: 9, cast: false, chunk: 1800 };
    // road paint (pulled forward)
    B.paint = { mat: std({ roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), tw: 1, th: 1, cast: false };
    B.dirt = { mat: std({ map: X.dirt, roughness: 0.97 }), tw: 8, th: 8, cast: false };
    B.crop = { mat: std({ map: X.crop, roughness: 0.95 }), tw: 5, th: 5, cast: false };
    B.shop = { mat: night(std({ map: X.shop, emissiveMap: X.shopE })), tw: 16, th: 8, cast: true, night: 1.0 };
    B.front = { mat: night(std({ map: X.front, emissiveMap: X.frontE })), tw: 16, th: 4, cast: true, night: 1.2 };
    B.front2 = { mat: night(std({ map: X.front2, emissiveMap: X.front2E })), tw: 16, th: 4, cast: true, night: 1.2 };
    B.office = { mat: night(std({ map: X.office, emissiveMap: X.officeE, roughness: 0.25, metalness: 0.45 })), tw: 15, th: 15, cast: true, night: 1.0 };
    B.apt = { mat: night(std({ map: X.apt, emissiveMap: X.aptE })), tw: 16, th: 16, cast: true, night: 1.0 };
    for (const k in B) B[k].name = k;
    E.mats = {
      flat: B.flat.mat,
      shiny: B.shiny.mat,
      glassT: new T.MeshStandardMaterial({ color: this._lcol('#CFE3EC'), roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.22, depthWrite: false }),
      glow: B.glow.mat,
      water: new T.MeshStandardMaterial({ color: this._lcol('#8DB4BC'), map: X.water, roughness: 0.12, metalness: 0.1 }),
      sprite: (map, o) => new T.SpriteMaterial(Object.assign({ map: map, transparent: true, depthWrite: false, toneMapped: false }, o || {}))
    };
    E.mats.water.map.repeat.set(1, 1);
  },

  // =============================================================== GEOMETRY ACCUMULATION
  // `b` may be a bucket name (static, chunked) or an accumulator returned by _newAcc (dynamic bake)
  _newAcc(bk) { return { bk: bk || 'flat', p: [], n: [], u: [], c: [], i: [], vc: 0 }; },
  _A(b, x, z) {
    if (typeof b !== 'string') return b;
    const E = this._E;
    const bk = E.BK[b];
    if (!bk) throw new Error('unknown bucket ' + b);
    const CH = bk.chunk || 260;
    const key = b + '|' + Math.floor((x + 4000) / CH) + '|' + Math.floor((z + 4000) / CH);
    let A = E.accMap[key];
    if (!A) {
      A = E.accMap[key] = this._newAcc(b);
      E.accList.push(A);
    }
    return A;
  },
  _bkInfo(A) { return this._E.BK[A.bk] || this._E.BK.flat; },

  // push one quad: corners c0..c3 (counter-clockwise seen from the front), uvs [u0,v0,u1,v1] of the rectangle
  _quad(A, c0, c1, c2, c3, nrm, uv, col, both) {
    const k = A.vc;
    const cc = this._lc(col);
    A.p.push(c0[0], c0[1], c0[2], c1[0], c1[1], c1[2], c2[0], c2[1], c2[2], c3[0], c3[1], c3[2]);
    A.n.push(nrm[0], nrm[1], nrm[2], nrm[0], nrm[1], nrm[2], nrm[0], nrm[1], nrm[2], nrm[0], nrm[1], nrm[2]);
    A.u.push(uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]);
    A.c.push(cc[0], cc[1], cc[2], cc[0], cc[1], cc[2], cc[0], cc[1], cc[2], cc[0], cc[1], cc[2]);
    A.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
    A.vc += 4;
    if (both) this._quad(A, c1, c0, c3, c2, [-nrm[0], -nrm[1], -nrm[2]], [uv[2], uv[1], uv[0], uv[3]], col, false);
  },
  _tri(A, a, b, c, nrm, uvs, col, both) {
    const k = A.vc;
    const cc = this._lc(col);
    A.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (let q = 0; q < 3; q++) A.n.push(nrm[0], nrm[1], nrm[2]);
    A.u.push(uvs[0], uvs[1], uvs[2], uvs[3], uvs[4], uvs[5]);
    for (let q = 0; q < 3; q++) A.c.push(cc[0], cc[1], cc[2]);
    A.i.push(k, k + 1, k + 2);
    A.vc += 3;
    if (both) this._tri(A, b, a, c, [-nrm[0], -nrm[1], -nrm[2]], [uvs[2], uvs[3], uvs[0], uvs[1], uvs[4], uvs[5]], col, false);
  },
  // rectangle face: centre C, unit right R, unit up U, half sizes hr/hu (world), normal = R x U
  _face(b, C, R, U, hr, hu, col, o) {
    const A = this._A(b, C[0], C[2]);
    const bk = this._bkInfo(A);
    const tw = (o && o.tw) || bk.tw, th = (o && o.th) || bk.th;
    const u0 = (o && o.u0) || 0, v0 = (o && o.v0) || 0;
    const p = (sr, su) => [C[0] + R[0] * hr * sr + U[0] * hu * su, C[1] + R[1] * hr * sr + U[1] * hu * su, C[2] + R[2] * hr * sr + U[2] * hu * su];
    const n = [R[1] * U[2] - R[2] * U[1], R[2] * U[0] - R[0] * U[2], R[0] * U[1] - R[1] * U[0]];
    this._quad(A, p(-1, -1), p(1, -1), p(1, 1), p(-1, 1), n, [u0, v0, u0 + (2 * hr) / tw, v0 + (2 * hu) / th], col, o && o.both);
  },

  // axis-aligned (optionally y-rotated) box with base at y. o: {ry, top (bucket|false), sides (bucket), bot, skip:'px nx pz nz', u0, v0, tw, th, topCol, both}
  box(b, x, y, z, w, h, d, col, o) {
    o = o || {};
    const ry = o.ry || 0, cs = Math.cos(ry), sn = Math.sin(ry);
    const rot = (vx, vy, vz) => [vx * cs + vz * sn, vy, -vx * sn + vz * cs];
    const hw = w / 2, hh = h / 2, hd = d / 2;
    const cy = y + hh;
    const sideB = o.sides || b;
    const topB = o.top === undefined ? b : o.top;
    const skip = o.skip || '';
    const at = (lx, ly, lz) => { const r = rot(lx, 0, lz); return [x + r[0], cy + ly, z + r[2]]; };
    const fo = { u0: o.u0, v0: o.v0, tw: o.tw, th: o.th, both: o.both };
    if (skip.indexOf('pz') < 0) this._face(sideB, at(0, 0, hd), rot(1, 0, 0), [0, 1, 0], hw, hh, col, fo);
    if (skip.indexOf('nz') < 0) this._face(sideB, at(0, 0, -hd), rot(-1, 0, 0), [0, 1, 0], hw, hh, col, fo);
    if (skip.indexOf('px') < 0) this._face(sideB, at(hw, 0, 0), rot(0, 0, -1), [0, 1, 0], hd, hh, col, fo);
    if (skip.indexOf('nx') < 0) this._face(sideB, at(-hw, 0, 0), rot(0, 0, 1), [0, 1, 0], hd, hh, col, fo);
    if (topB !== false && skip.indexOf('py') < 0) this._face(topB, at(0, hh, 0), rot(1, 0, 0), rot(0, 0, -1), hw, hd, o.topCol || col, { tw: o.ttw, th: o.tth });
    if ((o.bot || y > 0.05) && skip.indexOf('ny') < 0) this._face(o.bot && o.bot !== true ? o.bot : b, at(0, -hh, 0), rot(1, 0, 0), rot(0, 0, 1), hw, hd, col, null);
  },

  // horizontal ground plane (top face only), world-aligned UVs so tiles are seamless
  plane(b, x, y, z, w, d, col, o) {
    o = o || {};
    const A = this._A(b, x, z);
    const bk = this._bkInfo(A);
    const ry = o.ry || 0;
    if (!ry) {
      const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
      const tw = o.tw || bk.tw, th = o.th || bk.th;
      const k = A.vc;
      const cc = this._lc(col);
      A.p.push(x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z0);
      for (let q = 0; q < 4; q++) { A.n.push(0, 1, 0); A.c.push(cc[0], cc[1], cc[2]); }
      A.u.push(x0 / tw, -z1 / th, x1 / tw, -z1 / th, x1 / tw, -z0 / th, x0 / tw, -z0 / th);
      A.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
      A.vc += 4;
      return;
    }
    const cs = Math.cos(ry), sn = Math.sin(ry);
    this._face(b, [x, y, z], [cs, 0, -sn], [-sn, 0, -cs], w / 2, d / 2, col, { tw: o.tw, th: o.th });
  },

  // arbitrary quad strip on the ground following two edges (for curved roads / river banks)
  _strip(b, left, right, y, col, o) {
    // left/right: arrays of [x,z]; UV: u across (0..1 * width/tw), v along accumulated length
    const A = this._A(b, left[0][0], left[0][1]);
    const bk = this._bkInfo(A);
    const tw = (o && o.tw) || bk.tw, th = (o && o.th) || bk.th;
    const cc = this._lc(col);
    let acc = 0;
    for (let i = 0; i < left.length; i++) {
      if (i > 0) acc += Math.hypot(left[i][0] - left[i - 1][0], left[i][1] - left[i - 1][1]);
      const w = Math.hypot(right[i][0] - left[i][0], right[i][1] - left[i][1]);
      const yy = typeof y === 'function' ? y(left[i][0], left[i][1]) : y;
      const yr = typeof y === 'function' ? y(right[i][0], right[i][1]) : y;
      A.p.push(left[i][0], yy, left[i][1], right[i][0], yr, right[i][1]);
      A.n.push(0, 1, 0, 0, 1, 0);
      A.c.push(cc[0], cc[1], cc[2], cc[0], cc[1], cc[2]);
      A.u.push(0, acc / th, w / tw, acc / th);
    }
    const k0 = A.vc;
    // winding: make the first triangle face up
    const d1x = left[1][0] - left[0][0], d1z = left[1][1] - left[0][1];
    const d2x = right[0][0] - left[0][0], d2z = right[0][1] - left[0][1];
    const up = d1z * d2x - d1x * d2z > 0;
    for (let i = 0; i < left.length - 1; i++) {
      const a = k0 + i * 2;
      if (up) A.i.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      else A.i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    A.vc += left.length * 2;
  },

  // base geometries for generic primitives
  _baseGeo(key) {
    const E = this._E;
    const T = E.T;
    if (!E.G) E.G = {};
    let g = E.G[key];
    if (g) return g;
    const m = /^(cyl|cone|sph|ico|hcyl|torus|box)(\d*)$/.exec(key);
    const s = m && m[2] ? parseInt(m[2], 10) : 0;
    if (key.startsWith('cyl')) g = new T.CylinderGeometry(1, 1, 1, s || 12, 1);
    else if (key.startsWith('cone')) g = new T.ConeGeometry(1, 1, s || 12, 1);
    else if (key.startsWith('sph')) g = new T.SphereGeometry(1, s || 12, Math.max(6, ((s || 12) * 2) / 3 | 0));
    else if (key.startsWith('ico')) g = new T.IcosahedronGeometry(1, m && m[2] !== '' ? s : 1);
    else if (key.startsWith('hcyl')) g = new T.CylinderGeometry(1, 1, 1, s || 12, 1, false, 0, Math.PI);
    else if (key.startsWith('torus')) g = new T.TorusGeometry(1, 0.12, 6, s || 16);
    else g = new T.BoxGeometry(1, 1, 1);
    E.G[key] = g;
    return g;
  },
  // put a base geometry with transform matrix (position x,y,z; scale sx,sy,sz; euler rx,ry,rz)
  _gput(b, key, x, y, z, sx, sy, sz, rx, ry, rz, col, uvs) {
    const E = this._E;
    const T = E.T;
    const g = this._baseGeo(key);
    if (!E._m4) { E._m4 = new T.Matrix4(); E._n3 = new T.Matrix3(); E._q = new T.Quaternion(); E._eu = new T.Euler(); E._vp = new T.Vector3(); E._vs = new T.Vector3(); E._vt = new T.Vector3(); }
    E._eu.set(rx || 0, ry || 0, rz || 0);
    E._q.setFromEuler(E._eu);
    E._m4.compose(E._vp.set(x, y, z), E._q, E._vs.set(sx, sy, sz));
    E._n3.getNormalMatrix(E._m4);
    const A = this._A(b, x, z);
    const cc = this._lc(col);
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    const k = A.vc;
    const v = E._vt;
    const us = uvs || 1;
    for (let i = 0; i < P.count; i++) {
      v.set(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(E._m4);
      A.p.push(v.x, v.y, v.z);
      v.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(E._n3).normalize();
      A.n.push(v.x, v.y, v.z);
      A.u.push(U ? U.getX(i) * us : 0, U ? U.getY(i) * us : 0);
      A.c.push(cc[0], cc[1], cc[2]);
    }
    if (g.index) { const I = g.index.array; for (let i = 0; i < I.length; i++) A.i.push(k + I[i]); }
    else for (let i = 0; i < P.count; i++) A.i.push(k + i);
    A.vc += P.count;
  },
  // vertical cylinder with base at y
  cyl(b, x, y, z, r, h, col, seg) { this._gput(b, 'cyl' + (seg || 12), x, y + h / 2, z, r, h, r, 0, 0, 0, col); },
  // cylinder centred at (x,y,z), length along local Y, then rotated
  cylR(b, x, y, z, r, len, col, rx, ry, rz, seg) { this._gput(b, 'cyl' + (seg || 12), x, y, z, r, len, r, rx, ry, rz, col); },
  cone(b, x, y, z, r, h, col, seg) { this._gput(b, 'cone' + (seg || 12), x, y + h / 2, z, r, h, r, 0, 0, 0, col); },
  sph(b, x, y, z, sx, sy, sz, col, seg) { this._gput(b, 'sph' + (seg || 12), x, y, z, sx, sy, sz, 0, 0, 0, col); },
  ico(b, x, y, z, sx, sy, sz, col, det) { this._gput(b, 'ico' + (det == null ? 1 : det), x, y, z, sx, sy, sz, 0, 0, 0, col); },
  // fully rotated centred box (uses unit cube UVs scaled by `uvs`)
  boxR(b, x, y, z, w, h, d, col, rx, ry, rz, uvs) { this._gput(b, 'box', x, y, z, w, h, d, rx, ry, rz, col, uvs); },
  // pipe through a list of [x,y,z] points
  tube(b, pts, r, col, seg) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], c = pts[i + 1];
      const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
      const len = Math.hypot(dx, dy, dz);
      if (len < 1e-4) continue;
      const E = this._E;
      const T = E.T;
      const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / len, dy / len, dz / len));
      const eu = new T.Euler().setFromQuaternion(q);
      this._gput(b, 'cyl' + (seg || 10), (a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2, r, len, r, eu.x, eu.y, eu.z, col);
      if (i > 0) this._gput(b, 'sph' + (seg || 10), a[0], a[1], a[2], r, r, r, 0, 0, 0, col);
    }
  },
  // gable roof: ridge along local X (length w), span d along local Z, rise h, base at y. o: {ry, oh (overhang), wall (bucket for gable ends), wallCol, both}
  gable(b, x, y, z, w, d, h, col, o) {
    o = o || {};
    const ry = o.ry || 0, cs = Math.cos(ry), sn = Math.sin(ry);
    const rot = (vx, vy, vz) => [vx * cs + vz * sn, vy, -vx * sn + vz * cs];
    const oh = o.oh == null ? 0.6 : o.oh;
    const hw = w / 2 + oh, hd = d / 2 + oh;
    const drop = (h * oh) / (d / 2);
    const slope = Math.hypot(hd, h + drop);
    // south slope (+z)
    const nS = [0, hd / slope, (h + drop) / slope];
    const Rs = rot(1, 0, 0);
    const Us = rot(0, (h + drop) / slope, -hd / slope);
    const cS = rot(0, 0, hd / 2);
    this._face(b, [x + cS[0], y - drop + (h + drop) / 2, z + cS[2]], Rs, Us, hw, slope / 2, col, { both: o.both });
    const Rn = rot(-1, 0, 0);
    const Un = rot(0, (h + drop) / slope, hd / slope);
    const cN = rot(0, 0, -hd / 2);
    this._face(b, [x + cN[0], y - drop + (h + drop) / 2, z + cN[2]], Rn, Un, hw, slope / 2, col, { both: o.both });
    void nS;
    if (o.wall !== false) {
      const wb = o.wall || 'plaster';
      const wc = o.wallCol || '#EDE7DC';
      for (const s of [1, -1]) {
        const A = this._A(wb, x, z);
        const a = rot(s * w / 2, 0, s * d / 2), c = rot(s * w / 2, 0, -s * d / 2), t = rot(s * w / 2, 0, 0);
        const nrm = rot(s, 0, 0);
        this._tri(A, [x + a[0], y, z + a[2]], [x + c[0], y, z + c[2]], [x + t[0], y + h, z + t[2]], nrm, [0, 0, d / 4, 0, d / 8, h / 4], wc, o.both);
      }
    }
  },
  // hip roof (Thai "panya"): rectangle w x d, rise h, ridge length w - d
  hip(b, x, y, z, w, d, h, col, o) {
    o = o || {};
    const ry = o.ry || 0, cs = Math.cos(ry), sn = Math.sin(ry);
    const rot = (vx, vz) => [x + vx * cs + vz * sn, z - vx * sn + vz * cs];
    const oh = o.oh == null ? 0.7 : o.oh;
    const hw = w / 2 + oh, hd = d / 2 + oh;
    const rl = Math.max(0, hw - hd);
    const P = (lx, ly, lz) => { const r = rot(lx, lz); return [r[0], y + ly, r[1]]; };
    const A = this._A(b, x, z);
    const ap = -(h * oh) / (d / 2);
    const e1 = P(-hw, ap, hd), e2 = P(hw, ap, hd), e3 = P(hw, ap, -hd), e4 = P(-hw, ap, -hd);
    const r1 = P(-rl, h, 0), r2 = P(rl, h, 0);
    const nrm = (a, bb, c) => {
      const ux = bb[0] - a[0], uy = bb[1] - a[1], uz = bb[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz) || 1;
      return [nx / l, ny / l, nz / l];
    };
    const bk = this._bkInfo(A);
    const s = 1 / bk.tw;
    const L = Math.hypot(hd, h - ap);
    // front / back trapezoids as two tris + quad
    const trap = (a, bb, c, d2) => {
      const n = nrm(a, bb, c);
      const W = Math.hypot(bb[0] - a[0], bb[2] - a[2]);
      this._tri(A, a, bb, c, n, [0, 0, W * s, 0, (W / 2 + rl) * s, L * s], col, o.both);
      this._tri(A, a, c, d2, n, [0, 0, (W / 2 + rl) * s, L * s, (W / 2 - rl) * s, L * s], col, o.both);
    };
    trap(e1, e2, r2, r1);
    trap(e3, e4, r1, r2);
    const n2 = nrm(e2, e3, r2);
    this._tri(A, e2, e3, r2, n2, [0, 0, 2 * hd * s, 0, hd * s, L * s], col, o.both);
    const n4 = nrm(e4, e1, r1);
    this._tri(A, e4, e1, r1, n4, [0, 0, 2 * hd * s, 0, hd * s, L * s], col, o.both);
  },

  _accGeo(A) {
    const T = this._E.T;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(A.p, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(A.n, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(A.u, 2));
    g.setAttribute('color', new T.Float32BufferAttribute(A.c, 3));
    g.setIndex(A.vc > 65535 ? new T.Uint32BufferAttribute(A.i, 1) : new T.Uint16BufferAttribute(A.i, 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  },
  // build a one-off geometry (for dynamic objects): fn(acc) uses box/cyl/... with the acc as bucket
  _bake(fn, bk) {
    const A = this._newAcc(bk || 'flat');
    fn(A);
    return this._accGeo(A);
  },
  // convenience: baked mesh added to scene (vertex-coloured standard material)
  _bakeMesh(fn, o) {
    const E = this._E;
    const T = E.T;
    o = o || {};
    const geo = this._bake(fn, o.bk);
    const mat = o.mat || (o.bk && E.BK[o.bk] ? E.BK[o.bk].mat : E.mats.flat);
    const m = new T.Mesh(geo, mat);
    m.castShadow = o.cast !== false;
    m.receiveShadow = true;
    if (o.parent) o.parent.add(m); else if (o.add !== false) E.scene.add(m);
    return m;
  },
  _flushAll() {
    const E = this._E;
    const T = E.T;
    for (const A of E.accList) {
      if (!A.vc) continue;
      const bk = E.BK[A.bk];
      const mesh = new T.Mesh(this._accGeo(A), bk.mat);
      mesh.castShadow = !!bk.cast;
      mesh.receiveShadow = bk.recv !== false;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      E.scene.add(mesh);
      E.statics.push(mesh);
    }
    E.accList = [];
    E.accMap = {};
  },

  // =============================================================== REGISTRIES
  // axis-aligned collider rectangle (walls, buildings). Player cannot enter.
  _col(x0, z0, x1, z1, tag) {
    const E = this._E;
    const c = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), tag: tag || '' };
    E.colliders.push(c);
    const S = 24;
    for (let gx = Math.floor(c.x0 / S); gx <= Math.floor(c.x1 / S); gx++) {
      for (let gz = Math.floor(c.z0 / S); gz <= Math.floor(c.z1 / S); gz++) {
        const k = gx + ',' + gz;
        let L = E.colGrid.get(k);
        if (!L) { L = []; E.colGrid.set(k, L); }
        L.push(c);
      }
    }
    return c;
  },
  // centred (optionally rotated) footprint -> conservative AABB collider
  _colBox(cx, cz, w, d, ry, pad) {
    const p = pad || 0;
    const a = Math.abs(Math.cos(ry || 0)), s = Math.abs(Math.sin(ry || 0));
    const hx = (w * a + d * s) / 2 + p, hz = (w * s + d * a) / 2 + p;
    return this._col(cx - hx, cz - hz, cx + hx, cz + hz);
  },
  // stop anchor: {view:[x,z], look:[x,y,z], guide:[x,z]?, pin:[x,y,z], emit:[x,y,z], gas:[..], spread, route:[[x,z]...], inside:'name'|null, district}
  _stopAnchor(id, a) { this._E.anchors[id] = a; },
  // interior volume: {name, rect:[x0,z0,x1,z1], lights:[[x,y,z,'#hex',intensity,distance]], helmet:bool, label}
  _interior(o) { this._E.interiors.push(o); },
  // particle emitter: {type:'smoke'|'steam'|'fire'|'exhaust'|'dust', pos:[x,y,z], rate, size, rise, spread, life, color, on:()=>bool}
  _emitter(o) { this._E.emitters.push(o); return o; },
  // per-frame callback fn(dt, t)
  _anim(fn) { this._E.anims.push(fn); },
  _tickAnims(dt) { const E = this._E; for (const f of E.anims) f(dt, E.time); },
  // street / interior lamp (night glow sprite + light-pool decal + point-light candidate)
  _lamp(x, y, z, o) { this._E.lamps.push(Object.assign({ x: x, y: y, z: z, color: '#FFD9A0', pool: 7, indoor: false }, o || {})); },
  _addDyn(obj) { const E = this._E; E.scene.add(obj); E.dyn.push(obj); return obj; }
};
