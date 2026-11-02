/* GHG Town 3D v0.8 — sound: procedural ambience (wind, birds, traffic, rain, crickets, room tone, machine hum),
   footsteps and short UI cues. Web Audio only (no sound files). The audio context starts on the first click / key
   press (browser autoplay rules); _eSound(false) mutes everything. */
GHG3.audio = {
  _initAudio() {
    const E = this._E;
    E.au = { on: E.au0 != null ? !!E.au0 : true, ctx: null, tk: 0, birdT: 2, crT: 1, stepN: null };
    const h = E.auH = {};
    h.go = () => {
      const A = this._E && this._E.au;
      if (!A || !A.on) return;
      if (!A.ctx) this._auStart();
      else if (A.ctx.state === 'suspended' && !document.hidden) A.ctx.resume().catch(() => {});
    };
    h.vis = () => {
      const A = this._E && this._E.au;
      if (!A || !A.ctx) return;
      if (document.hidden) A.ctx.suspend().catch(() => {});
      else if (A.on) A.ctx.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', h.go, true);
    window.addEventListener('keydown', h.go, true);
    document.addEventListener('visibilitychange', h.vis);
  },
  _auStop() {
    const E = this._E;
    if (!E) return;
    const h = E.auH;
    if (h) {
      window.removeEventListener('pointerdown', h.go, true);
      window.removeEventListener('keydown', h.go, true);
      document.removeEventListener('visibilitychange', h.vis);
      E.auH = null;
    }
    const A = E.au;
    if (A && A.ctx) { try { A.ctx.close(); } catch (err) { /* ignore */ } A.ctx = null; }
  },
  // UI toggle (also remembered by the UI); unmuting from a click starts the context right away
  _eSound(on) {
    const E = this._E;
    if (!E) return;
    if (!E.au) { E.au0 = !!on; return; }
    const A = E.au;
    A.on = !!on;
    if (A.on && !A.ctx) { this._auStart(); return; }
    if (!A.ctx || !A.master) return;
    const t = A.ctx.currentTime;
    A.master.gain.cancelScheduledValues(t);
    A.master.gain.setTargetAtTime(A.on ? 0.9 : 0, t, 0.12);
    if (A.on && A.ctx.state === 'suspended') A.ctx.resume().catch(() => {});
  },

  _auStart() {
    const E = this._E;
    const A = E && E.au;
    if (!A || A.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    let ctx;
    try { ctx = new AC(); } catch (err) { return; }
    A.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    comp.connect(ctx.destination);
    A.master = ctx.createGain();
    A.master.gain.value = 0;
    A.master.connect(comp);
    A.master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
    A.amb = ctx.createGain(); A.amb.gain.value = 1; A.amb.connect(A.master);
    A.fx = ctx.createGain(); A.fx.gain.value = 0.55; A.fx.connect(A.master);
    A.white = this._auNoise(ctx, 'white');
    A.pink = this._auNoise(ctx, 'pink');
    A.brown = this._auNoise(ctx, 'brown');
    A.wind = this._auBed(A.pink, [['lowpass', 480, 0.6]]);
    A.traffic = this._auBed(A.brown, [['lowpass', 230, 0.5]]);
    A.rain = this._auBed(A.white, [['highpass', 1000, 0.5], ['lowpass', 6500, 0.3]]);
    A.room = this._auBed(A.brown, [['lowpass', 150, 0.6]]);
    // machine hum (mill, boiler room): two detuned saws through a low filter
    const hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 210; hf.Q.value = 0.8;
    const hg = ctx.createGain(); hg.gain.value = 0;
    hf.connect(hg); hg.connect(A.amb);
    for (const f of [49, 98.6, 147.2]) { const o = ctx.createOscillator(); o.type = f < 60 ? 'sawtooth' : 'square'; o.frequency.value = f; const og = ctx.createGain(); og.gain.value = f < 60 ? 0.6 : 0.18; o.connect(og); og.connect(hf); o.start(); }
    A.hum = { g: hg };
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  },
  // 3 s seamless noise loop (the tail is cross-faded into the head)
  _auNoise(ctx, kind) {
    const sr = ctx.sampleRate, n = Math.floor(sr * 3), F = Math.floor(sr * 0.12);
    const buf = ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w * 0.5;
      else if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      else {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.1; b6 = w * 0.115926;
      }
    }
    for (let i = 0; i < F; i++) { const t = i / F; d[i] = d[i] * t + d[n - F + i] * (1 - t); }
    buf.__loopEnd = (n - F) / sr;
    return buf;
  },
  _auBed(buf, filters) {
    const A = this._E.au, ctx = A.ctx;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true; src.loopStart = 0; src.loopEnd = buf.__loopEnd || buf.duration;
    let node = src;
    const fl = [];
    for (const f of filters) {
      const b = ctx.createBiquadFilter();
      b.type = f[0]; b.frequency.value = f[1]; b.Q.value = f[2];
      node.connect(b); node = b; fl.push(b);
    }
    const g = ctx.createGain(); g.gain.value = 0;
    node.connect(g); g.connect(A.amb);
    src.start(0, Math.random() * (src.loopEnd - 0.05));
    return { src: src, g: g, f: fl };
  },
  _auSet(p, v, k) { const A = this._E.au; p.setTargetAtTime(v, A.ctx.currentTime, k || 0.35); },
  _auZone(x, z) {
    for (const d of window.GHG3L.districts) { const r = d.rect; if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3]) return d.id; }
    return 'out';
  },
  // distance to the nearest town road (rural lanes count less) and whether we stand on a paved surface
  _auRoad(x, z) {
    let best = 1e9, paved = false;
    for (const r of window.GHG3L.roads) {
      const ax = r.a[0], az = r.a[1], bx = r.b[0], bz = r.b[1];
      const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = this._cl(((x - ax) * dx + (z - az) * dz) / l2, 0, 1);
      const d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
      if (d < r.w / 2 + (r.side || 0) + 0.5) paved = true;
      const dd = r.rural ? d + 90 : d - r.w / 2;
      if (dd < best) best = dd;
    }
    return { d: Math.max(0, best), paved: paved };
  },

  _tickAudio(dt) {
    const E = this._E;
    const A = E.au;
    if (!A || !A.ctx || !A.master || A.ctx.state !== 'running') return;
    this._auSteps();
    const cp = E.cam.position;
    const P = E.player;
    const inside = E.insideObj;
    const outdoors = !inside;
    const night = E.nightK || 0, rain = E.rainK || 0;
    const walkCtl = E.ctl === 'walk';
    const zone = this._auZone(walkCtl && P ? P.x : cp.x, walkCtl && P ? P.z : cp.z);
    // birds by day, crickets by night (outdoors, not in heavy rain)
    const green = zone === 'forest' || zone === 'farm' || zone === 'river' || zone === 'gate' || zone === 'out';
    A.birdT -= dt;
    if (A.birdT <= 0) {
      A.birdT = 0.9 + Math.random() * (green ? 2.6 : 6.5);
      if (outdoors && night < 0.6 && rain < 0.5 && Math.random() < (green ? 0.9 : 0.45)) this._auBird();
    }
    A.crT -= dt;
    if (A.crT <= 0) {
      A.crT = 0.55 + Math.random() * 0.9;
      if (outdoors && night > 0.6 && rain < 0.5) this._auCricket();
    }
    A.tk -= dt;
    if (A.tk > 0) return;
    A.tk = 0.25;
    const gy = window.GHG3L.H(cp.x, cp.z);
    const alt = this._cl((cp.y - gy - 2) / 90, 0, 1);
    const fly = E.ctl === 'fly';
    const high = E.ctl === 'overview' || E.ctl === 'intro' || E.ctl === 'finale';
    const rd = this._auRoad(cp.x, cp.z);
    const near = Math.pow(this._cl(1 - rd.d / 150, 0, 1), 1.6);
    const traffic = near * (1 - 0.6 * night) * (outdoors ? 1 : 0.25) * (high ? 0.25 : 1) * (1 - alt * 0.7);
    this._auSet(A.traffic.g.gain, 0.2 * traffic);
    const wind = (0.03 + 0.09 * alt + 0.05 * rain + (fly ? 0.12 : 0) + (zone === 'forest' ? 0.025 : 0)) * (outdoors ? 1 : 0.12);
    this._auSet(A.wind.g.gain, wind, 0.5);
    this._auSet(A.wind.f[0].frequency, 380 + 1100 * Math.max(alt, fly ? 0.7 : 0), 0.5);
    this._auSet(A.rain.g.gain, rain * (outdoors ? 0.34 : 0.12), 0.6);
    this._auSet(A.rain.f[1].frequency, outdoors ? 6500 : 1300, 0.3);
    this._auSet(A.room.g.gain, inside ? 0.09 : 0, 0.3);
    this._auSet(A.hum.g.gain, inside && inside.helmet ? 0.06 : (zone === 'industry' && outdoors && !high ? 0.012 : 0), 0.4);
  },
  // one step per head-bob cycle while walking
  _auSteps() {
    const E = this._E;
    const A = E.au, P = E.player;
    if (!P || E.ctl !== 'walk' || (P.sp || 0) < 0.6) { A.stepN = null; return; }
    const n = Math.floor(P.phase / Math.PI);
    if (A.stepN == null) { A.stepN = n; return; }
    if (n === A.stepN) return;
    A.stepN = n;
    let surf = 'hard';
    if (E.insideObj) surf = 'tile';
    else if (!this._auRoad(P.x, P.z).paved) {
      const z = this._auZone(P.x, P.z);
      if (z === 'forest' || z === 'farm' || z === 'out' || z === 'gate' || z === 'river') surf = 'grass';
    }
    this._auStep(surf, Math.min(1, (P.sp || 0) / 6));
  },
  _auStep(surf, run) {
    const A = this._E.au, ctx = A.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = A.white;
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const vol = (0.1 + 0.07 * run) * (0.8 + Math.random() * 0.4);
    if (surf === 'grass') { f.type = 'lowpass'; f.frequency.value = 650 + Math.random() * 250; f.Q.value = 0.7; }
    else if (surf === 'tile') { f.type = 'bandpass'; f.frequency.value = 2300 + Math.random() * 500; f.Q.value = 1.4; }
    else { f.type = 'bandpass'; f.frequency.value = 1100 + Math.random() * 400; f.Q.value = 1.1; }
    const len = surf === 'grass' ? 0.13 : 0.08;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * (surf === 'grass' ? 0.8 : 1), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0008, t + len);
    src.connect(f); f.connect(g); g.connect(A.amb);
    src.start(t, Math.random() * 2.5, len + 0.02);
    if ((this._E.wetK || 0) > 0.5 && !this._E.insideObj) {
      const s2 = ctx.createBufferSource(); s2.buffer = A.white;
      const f2 = ctx.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 3200;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, t + 0.01); g2.gain.linearRampToValueAtTime(vol * 0.5, t + 0.02); g2.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
      s2.connect(f2); f2.connect(g2); g2.connect(A.amb);
      s2.start(t, Math.random() * 2.5, 0.18);
    }
  },
  _auPan(v) {
    const A = this._E.au, ctx = A.ctx;
    if (!ctx.createStereoPanner) return null;
    const p = ctx.createStereoPanner(); p.pan.value = v; p.connect(A.amb);
    return p;
  },
  _auBird() {
    const A = this._E.au, ctx = A.ctx;
    const out = this._auPan(Math.random() * 1.6 - 0.8) || A.amb;
    const kind = Math.random();
    const base = 2600 + Math.random() * 1800;
    const n = kind < 0.5 ? 2 + ((Math.random() * 3) | 0) : 1 + ((Math.random() * 2) | 0);
    const vol = 0.018 + Math.random() * 0.025;
    let t = ctx.currentTime + 0.02;
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator(); o.type = 'sine';
      const g = ctx.createGain();
      const d = kind < 0.5 ? 0.06 + Math.random() * 0.05 : 0.16 + Math.random() * 0.12;
      const f0 = base * (0.92 + Math.random() * 0.16);
      if (kind < 0.5) { o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.45, t + d); }
      else { o.frequency.setValueAtTime(f0 * 1.3, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.8, t + d * 0.6); o.frequency.exponentialRampToValueAtTime(f0 * 1.1, t + d); }
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0005, t + d);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + d + 0.02);
      t += d + 0.04 + Math.random() * 0.07;
    }
  },
  _auCricket() {
    const A = this._E.au, ctx = A.ctx;
    const out = this._auPan(Math.random() * 1.4 - 0.7) || A.amb;
    const f = 4300 + Math.random() * 700, vol = 0.008 + Math.random() * 0.01;
    let t = ctx.currentTime + 0.02;
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = 0;
    o.connect(g); g.connect(out);
    const pulses = 3 + ((Math.random() * 2) | 0);
    for (let i = 0; i < pulses; i++) {
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.linearRampToValueAtTime(0, t + 0.03);
      t += 0.045;
    }
    o.start(ctx.currentTime); o.stop(t + 0.05);
  },
  // short UI cues: found, ok, bad, riddle, hop, cert
  _auSfx(name) {
    const E = this._E;
    const A = E && E.au;
    if (!A || !A.on || !A.ctx || !A.fx || A.ctx.state !== 'running') return;
    const ctx = A.ctx, t0 = ctx.currentTime + 0.01;
    const tone = (f, t, d, vol, type, f2) => {
      const o = ctx.createOscillator(); o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d * 0.8);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0005, t + d);
      o.connect(g); g.connect(A.fx);
      o.start(t); o.stop(t + d + 0.03);
    };
    if (name === 'found') {
      [880, 1108.7, 1318.5, 1760].forEach((f, i) => { tone(f, t0 + i * 0.07, 0.42, 0.16, 'triangle'); tone(f * 2, t0 + i * 0.07, 0.25, 0.03); });
    } else if (name === 'ok') {
      tone(659.3, t0, 0.5, 0.18); tone(659.3 * 2.76, t0, 0.18, 0.025);
      tone(880, t0 + 0.12, 0.7, 0.2); tone(880 * 2.76, t0 + 0.12, 0.22, 0.03);
    } else if (name === 'bad') {
      tone(392, t0, 0.32, 0.13, 'triangle'); tone(311.1, t0 + 0.16, 0.5, 0.13, 'triangle');
    } else if (name === 'riddle') {
      tone(420, t0, 0.16, 0.12, 'sine', 900); tone(640, t0 + 0.09, 0.2, 0.09, 'sine', 1300);
    } else if (name === 'cert') {
      [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, t0 + i * 0.12, 0.9 - i * 0.1, 0.14, 'triangle'));
      [523.3, 659.3, 784].forEach((f) => tone(f, t0 + 0.55, 1.4, 0.07));
    } else if (name === 'hop') {
      const src = ctx.createBufferSource(); src.buffer = A.pink;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
      f.frequency.setValueAtTime(260, t0); f.frequency.exponentialRampToValueAtTime(1600, t0 + 0.9); f.frequency.exponentialRampToValueAtTime(500, t0 + 2.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.5); g.gain.linearRampToValueAtTime(0.25, t0 + 1.6); g.gain.exponentialRampToValueAtTime(0.001, t0 + 2.4);
      src.connect(f); f.connect(g); g.connect(A.fx);
      src.start(t0, Math.random() * 0.4, 2.5);
    }
  }
};
