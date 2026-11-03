/* GHG Town 3D v1.0 — "วิดีโอสำรวจหน้างาน" (site-visit film).
   The first time the team reaches an emission source, a short drone-style clip plays before the mascots talk:
   aerial reveal → walk-in from the trainee's viewpoint → close-up scan with an evidence photo → cut back to the eyes.
   The UI draws the letterbox and captions from eFilm / eFilmShot. The per-frame bits (timecode, altitude, distance,
   the AR tag that follows the source, the dip to black between shots, the shutter flash) are written straight into
   the overlay element handed over by _fmAttach, so the film never re-renders the UI per frame.
   Also here: coloured gas puffs that make each source's gases visible, the 3D scan rings and the photo capture. */
GHG3.film = {
  // shot lengths (s); the detail shot may be held while the narration is still reading the scene
  FM: { IN: 0.35, AIR: 4.2, WALK: 3.8, DET: 3.6, SHUT: 2.5, BACK: 0.45, HOLD: 9 },

  _initFilm() {
    const E = this._E;
    const T = E.T;
    E.film = null;
    E.filmAuto = E.filmAuto0 != null ? !!E.filmAuto0 : true;
    E.filmSeen = {};
    E.snapReq = null;
    E.fmEl = null;
    E.fmV = new T.Vector3();
    // scan rings around the source (shared by every film)
    const ringG = new T.RingGeometry(0.86, 1, 72, 1).rotateX(-Math.PI / 2);
    E.fmRings = [];
    for (let i = 0; i < 3; i++) {
      const m = new T.Mesh(ringG, new T.MeshBasicMaterial({ color: this._lcol('#8CFFD0'), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped: false, fog: false }));
      m.visible = false;
      m.renderOrder = 20;
      m.frustumCulled = false;
      E.scene.add(m);
      E.fmRings.push(m);
    }
    this._fmInitGas();
  },

  // ---------------------------------------------------------------- gas puffs ("see the gas")
  // one emitter per gas per source; the colour is the gas colour once the stop is solved (a pale haze while the gas
  // is still part of the riddle). Purchased electricity (scope 2) emits nothing on site, so it has none.
  _fmInitGas() {
    const E = this._E;
    const C = window.GHGTownContent;
    E.fxDef.gas = { rate: 2, size: 0.8, grow: 3.4, rise: 0.5, spread: 0.6, life: 6, color: '#DCE4DF', alpha: 0.2 };
    E.partsG = [];
    E.bbGasP = this._pBB(700, E.tex.puff, { order: 8 });
    E.gasEm = [];
    for (const k in E.anchors) {
      const a = E.anchors[k];
      const id = +k;
      if (!a || !a.emit) continue;
      const s = C && C.stops ? C.stops.find((q) => q.id === id) : null;
      const sc = s ? s.scope : this._pScope(id);
      if (sc === 's2') continue;
      const gases = (s && s.gases && s.gases.length ? s.gases : a.gas) || [];
      if (!gases.length) continue;
      const S = a.spread || 1;
      const big = S >= 6;
      const rm = sc === 'rm';
      gases.forEach((gk, i) => {
        const share = gases.length === 1 ? 1 : (i === 0 ? 0.55 : 0.45 / (gases.length - 1));
        const info = (C && C.GAS && C.GAS[gk]) || {};
        const em = {
          type: 'gas', aid: id, gk: gk, share: share, big0: big, rm: rm, S: S,
          pos: rm ? [a.emit[0], a.emit[1] + 10, a.emit[2]] : a.emit.slice(),
          spread: big ? S * 0.85 : Math.max(0.35, S * 0.7),
          size: big ? 1.2 + S * 0.12 : 0.45 + S * 0.12,
          rise: rm ? -0.75 : (big ? 0.32 : 0.5),
          life: big ? 8 : 5.5,
          alpha: big ? 0.2 : 0.18,
          rate: 0, color: '#DCE4DF', gcol: this._fmTint(info.color || '#94A3B8'),
          _live: false
        };
        em.on = () => em._live;
        E.emitters.push(em);
        E.gasEm.push(em);
      });
    }
  },
  // gas colours are dark (made for chips on white); lift them so a thin puff still reads as that colour
  _fmTint(hex) {
    const c = this._mixc(hex, '#FFFFFF', 0.3);
    const h = (v) => { const s = Math.round(Math.pow(Math.max(0, Math.min(1, v)), 1 / 2.2) * 255).toString(16); return s.length < 2 ? '0' + s : s; };
    return '#' + h(c[0]) + h(c[1]) + h(c[2]);
  },
  // same rule as the question card: only a gas that is itself the answer stays hidden until answered
  _fmSecret(id) {
    const E = this._E;
    return !!(E.gasHide && E.gasHide[id]) && !E.pinStatus[id];
  },
  _fmTickGas() {
    const E = this._E;
    const P = E.player;
    const F = E.film;
    const walk = E.ctl === 'walk';
    for (const em of E.gasEm) {
      const id = em.aid;
      const inFilm = !!F && F.id === id;
      let live = false, rate = 0;
      if (inFilm) { live = true; rate = 1; }
      else if (walk && E.labelsOn && P) {
        const d = Math.hypot(em.pos[0] - P.x, em.pos[2] - P.z) - (em.big0 ? em.S : 0);
        if (d < 55) { live = true; rate = E.at === id ? 0.75 : 0.45 * (1 - this._cl((d - 30) / 25, 0, 1)); }
      }
      em._live = live && rate > 0.02;
      if (!em._live) continue;
      const base = em.big0 ? this._cl(1.6 + em.S * 0.3, 1.6, 8) : this._cl(1.6 + em.S * 1.4, 1.6, 5);
      em.rate = base * em.share * rate * (inFilm ? 2.2 : 1);
      em.color = this._fmSecret(id) ? '#DCE4DF' : em.gcol;
    }
  },

  // ---------------------------------------------------------------- start / stop
  _eFilmAuto(on) {
    const E = this._E;
    if (!E) return;
    if (E.player) E.filmAuto = !!on; else E.filmAuto0 = !!on;
  },
  // progress wiped (next trainee): every source gets its film again
  _eFilmReset() { const E = this._E; if (E) E.filmSeen = {}; },
  // the UI reads the scene aloud; while it speaks, the close-up is held (see _tickFilm)
  _eNarr(on) { const E = this._E; if (E) E.narrOn = !!on; },
  // arrival hook: play the film first (first visit of an unsolved stop), then hand the arrival patch to the UI
  _fmArrive(id, patch) {
    const E = this._E;
    const ok = E.filmAuto && !E.filmSeen[id] && !E.pinStatus[id] && E.anchors[id] && E.ctl === 'walk' && !E.fly && !document.hidden && E.w > 0;
    if (!ok) { this._ui(patch); return; }
    this._fmStart(id, patch);
  },
  // replay from the question card
  _eFilm(id) {
    const E = this._E;
    if (!E || !E.player || E.film || !E.anchors[id] || E.ctl !== 'walk' || E.travel || E.fly) return;
    this._fmStart(id, null);
  },
  _eFilmSkip() {
    const E = this._E;
    const F = E && E.film;
    if (!F || F.skip || F.t >= F.tE) return;
    F.skip = true;
    F.skipT = 0;
    F.dip0 = F.dip;
  },
  _fmStart(id, patch) {
    const E = this._E;
    const plan = this._fmPlan(id);
    const M = this.FM;
    const tA = M.IN, tW = tA + M.AIR, tD = tW + M.WALK, tE = tD + M.DET;
    E.film = { id: id, patch: patch, plan: plan, t: 0, h: 0, shot: -1, tA: tA, tW: tW, tD: tD, tE: tE, end: tE + M.BACK, snapped: false, dip: 0, flash: 0, skip: false, cue: -1, sub: plan.focus.slice(), trk: false };
    E.keys = {};
    if (E.lookQ) { E.lookQ.yaw = 0; E.lookQ.pitch = 0; }
    this._ui({ eFilm: id, eFilmShot: 0, eTravel: false, eTarget: null, eDist: 0 });
    if (typeof this._auSfx === 'function') this._auSfx('whoosh');
  },
  _fmEnd() {
    const E = this._E;
    const F = E.film;
    if (!F) return;
    E.film = null;
    E.filmSeen[F.id] = true;
    for (const r of E.fmRings) r.visible = false;
    if (typeof this._auDrone === 'function') this._auDrone(false);
    const patch = Object.assign({ eFilm: null, eFilmShot: null }, F.patch || {});
    this._ui(patch);
  },

  // ---------------------------------------------------------------- planning
  // all shots are built from the stop anchor: the viewpoint side of the source is open ground by design, so the
  // camera stays on that side; close shots are checked against the colliders (walls, machines) and fall back to a
  // slow zoom from the walk-in end where an orbit would clip.
  _fmPlan(id) {
    const E = this._E;
    const H = window.GHG3L.H;
    const a = E.anchors[id];
    // the subject is what the stop's viewpoint frames (anchor.look: the cylinders, the tank, the cows…);
    // the gas itself still comes out at anchor.emit. A far look (the lookout's city view) falls back to emit.
    const em0 = this._pTarget(a);
    const L = a.look;
    const useLook = !!L && Math.hypot(L[0] - em0[0], L[2] - em0[2]) < 30;
    const Tg = useLook ? [L[0], L[1], L[2]] : em0;
    const S = a.spread || 1;
    const big = S >= 6;
    let vx = a.view[0] - Tg[0], vz = a.view[1] - Tg[2];
    const D = Math.hypot(vx, vz) || 1;
    vx /= D; vz /= D;
    const az = Math.atan2(vx, vz);
    // aim at the body of a small source (a vent or stack top sits above it), at the middle of a field
    const gy = H(Tg[0], Tg[2]);
    const hT = Tg[1] - gy;
    const focus = [Tg[0], big ? Tg[1] + 1.2 : (useLook ? Tg[1] : gy + Math.max(hT * 0.62, Math.min(hT, 1))), Tg[2]];
    const ins = this._pInsideAt(Tg[0], Tg[2]);
    // shot 1: aerial reveal — a 50° arc on the viewer's side, sinking a little, steep enough to look over roofs
    let R0 = big ? Math.max(46, S * 2.5) : this._cl(D * 1.2 + 24, 30, 52);
    if (ins && ins.rect) R0 = Math.max(R0, Math.min(75, Math.hypot(ins.rect[2] - ins.rect[0], ins.rect[3] - ins.rect[1]) * 0.7));
    const A0 = big ? R0 * 0.7 : R0 * 0.92;
    const air = { R0: R0, R1: R0 * 0.8, A0: A0, A1: A0 * 0.74, az0: az + 0.52, az1: az - 0.3, fov0: 50, fov1: 45 };
    // shot 2: walk-in from the viewpoint towards the source
    const eye = this._pEyeY(a.view[0], a.view[1]);
    const minR = big ? Math.max(9, S * 0.9) : Math.max(2.6, S * 1.6 + 1.3);
    let push = Math.max(0, Math.min(D * (big ? 0.45 : 0.32), D - minR));
    const at = (p) => [a.view[0] - vx * p, a.view[1] - vz * p];
    for (let i = 0; i < 6 && push > 0.4; i++) {
      const q = at(push);
      if (!this._pHitAt(q[0], q[1], 0.3) && this._fmClear(a.view[0], a.view[1], q[0], q[1], 0)) break;
      push *= 0.6;
    }
    if (push <= 0.4) push = 0;
    const q1 = at(push);
    // a small side step at the start makes the walk-in feel hand-held rather than on rails
    const rx = vz, rz = -vx;
    let side = 0.9;
    if (this._pHitAt(a.view[0] + rx * side, a.view[1] + rz * side, 0.3)) side = -0.9;
    if (this._pHitAt(a.view[0] + rx * side, a.view[1] + rz * side, 0.3)) side = 0;
    const yA = Math.max(eye, H(a.view[0], a.view[1]) + 1.6);
    // a raised field-sized subject (landfill mound, forest canopy): the walk-in rises like a drone
    const yB = Math.max(H(q1[0], q1[1]) + 1.6, eye + (big ? (hT > 3 ? Math.max(3.5, hT + S * 0.3) : 3.5) : 0.25));
    const walk = { p0: [a.view[0] + rx * side, yA, a.view[1] + rz * side], p1: [q1[0], yB, q1[1]], fov0: 62, fov1: 54 };
    // shot 3: close-up orbit (or zoom)
    const r3 = big ? Math.max(11, S * 1.05) : this._cl(S * 1.7 + 2.3, 3.1, 8.5);
    const h3 = big ? (hT > 3 ? Math.max(5, hT + S * 0.8) : Math.max(5, S * 0.4)) : Math.max(1.5, focus[1] - gy + 0.55);
    const az3 = Math.atan2(q1[0] - Tg[0], q1[1] - Tg[2]);
    const y3 = gy + h3;
    const stopR = Math.max(1.1, S * 0.9);
    const okAt = (ang, r) => {
      const x = Tg[0] + Math.sin(ang) * r, z = Tg[2] + Math.cos(ang) * r;
      if (y3 < H(x, z) + 0.8) return false;
      if (!big && this._pHitAt(x, z, 0.55)) return false;
      if (ins && !this._pInsideAt(x, z)) return false;
      return big || this._fmClear(x, z, Tg[0], Tg[2], stopR);
    };
    const w = big ? 0.07 : 0.15;
    const clearArc = (dir) => {
      let ok = 0;
      for (let ang = 0; ang <= (big ? 1.05 : 0.75); ang += 0.07) {
        if (!okAt(az3 + dir * ang, r3)) break;
        ok = ang;
      }
      return ok;
    };
    // orbit only around sources in open ground; a small one among walls / cages gets a slow push-in instead
    const open = big || (S >= 2.4 && !ins);
    const cw = open ? clearArc(1) : 0, ccw = open ? clearArc(-1) : 0;
    const dir = cw >= ccw ? 1 : -1;
    const span = Math.max(cw, ccw);
    const orbit = open && span >= w * this.FM.DET * 0.85 && okAt(az3, r3);
    // push-in: forward along the walk-in line, with a small side slide where there is room
    let fx = Tg[0] - q1[0], fz = Tg[2] - q1[1];
    const dq = Math.hypot(fx, fz) || 1;
    fx /= dq; fz /= dq;
    const pushIn = Math.max(0, Math.min(1.6, dq - minR * 0.8));
    let slide = 0;
    for (const sd of [0.35, -0.35]) {
      const x = q1[0] + fx * pushIn - fz * sd, z = q1[1] + fz * pushIn + fx * sd;
      if (!this._pHitAt(x, z, 0.4) && this._fmClear(x, z, Tg[0], Tg[2], stopR) && (!ins || this._pInsideAt(x, z))) { slide = sd; break; }
    }
    const det = {
      orbit: orbit, r: r3, y: y3, az: az3, dir: dir, w: w, span: span, fov0: 52, fov1: orbit ? 44 : 34,
      fx: fx, fz: fz, lx: -fz, lz: fx, push: pushIn, slide: slide, dy: (focus[1] + 0.35 - yB) * 0.3
    };
    let trk = null;
    for (const e of E.emitters) if (e.type === 'exhaust' && Math.hypot(e.pos[0] - Tg[0], e.pos[2] - Tg[2]) < 9) { trk = e; break; }
    return { a: a, T: Tg, focus: focus, S: S, big: big, D: D, air: air, walk: walk, det: det, tagY: Tg[1] + (big ? 2.4 : 0.6), trk: trk, trk0: trk ? trk.pos.slice() : null };
  },
  // segment a→b free of colliders (ending `short` metres before b, where the source itself usually stands)
  _fmClear(ax, az, bx, bz, short) {
    const d = Math.hypot(bx - ax, bz - az);
    const L = d - (short || 0);
    if (L <= 0) return true;
    const n = Math.ceil(L / 0.5);
    for (let i = 1; i <= n; i++) {
      const t = (i / n) * (L / d);
      if (this._pHitAt(ax + (bx - ax) * t, az + (bz - az) * t, 0.18)) return false;
    }
    return true;
  },

  // ---------------------------------------------------------------- per frame
  _tickFilm(dt) {
    const E = this._E;
    if (!E.player || !E.gasEm) return;
    this._fmTickGas();
    const F = E.film;
    if (!F) return;
    const M = this.FM;
    // hold the close-up while the narration is still reading (max HOLD s)
    const speaking = !!(window.speechSynthesis && window.speechSynthesis.speaking && E.narrOn);
    const holdAt = F.tE - 0.32;
    if (!F.skip && speaking && F.t >= holdAt && F.t < F.tE && F.h < M.HOLD) F.h += dt;
    else F.t += dt;
    if (F.skip) {
      F.skipT += dt;
      if (F.t < F.tE && F.skipT >= 0.28) { F.t = F.tE; if (!F.snapped) this._fmShutter(true); }
    }
    // shot changes (UI captions + narration + sounds)
    const shot = F.t < F.tW ? 0 : (F.t < F.tD ? 1 : (F.t < F.tE ? (F.snapped ? 3 : 2) : 4));
    if (shot !== F.shot) {
      const prev = F.shot;
      F.shot = shot;
      this._ui({ eFilmShot: shot });
      if (typeof this._auDrone === 'function') this._auDrone(shot === 0);
      if (prev === 0 && shot === 1 && typeof this._auSfx === 'function') this._auSfx('whoosh');
      if (shot === 2 && typeof this._auSfx === 'function') this._auSfx('scan');
      if (shot <= 2 && F.cue < shot) { F.cue = shot; if (typeof this._uFilmCue === 'function') this._uFilmCue(F.id, shot); }
    }
    // subject point (follows a machine that drives off, e.g. the forklift)
    const PL = F.plan;
    if (PL.trk && !F.trk && Math.hypot(PL.trk.pos[0] - PL.trk0[0], PL.trk.pos[2] - PL.trk0[2]) > 0.05) F.trk = true;
    const wx = F.trk ? PL.trk.pos[0] : PL.focus[0], wz = F.trk ? PL.trk.pos[2] : PL.focus[2];
    F.sub[0] = this._damp(F.sub[0], wx, 2.5, dt); F.sub[2] = this._damp(F.sub[2], wz, 2.5, dt);
    // shutter
    if (!F.snapped && !F.skip && F.t >= F.tD + M.SHUT) this._fmShutter(false);
    // dips to black between shots
    let dip = 0;
    const t = F.t;
    if (t < F.tA) dip = t / F.tA;
    else if (t < F.tA + 0.4) dip = 1 - (t - F.tA) / 0.4;
    else if (t > F.tW - 0.3 && t < F.tW) dip = (t - (F.tW - 0.3)) / 0.3;
    else if (t >= F.tW && t < F.tW + 0.3) dip = 1 - (t - F.tW) / 0.3;
    else if (t > F.tE - 0.3 && t < F.tE) dip = (t - (F.tE - 0.3)) / 0.3;
    else if (t >= F.tE) dip = 1 - (t - F.tE) / (F.end - F.tE);
    if (F.skip && t < F.tE) dip = Math.max(dip, (F.dip0 || 0) + (1 - (F.dip0 || 0)) * Math.min(1, F.skipT / 0.28));
    F.dip = this._cl(dip, 0, 1);
    F.flash = Math.max(0, F.flash - dt / 0.4);
    // scan rings + light column during the close-up
    const det = t >= F.tD && t < F.tE;
    const P = F.plan;
    const gy = window.GHG3L.H(P.T[0], P.T[2]);
    const ry = Math.max(gy + (P.big ? 0.3 : 0.06), P.T[1] - 0.25);
    const rMax = P.big ? Math.max(8, P.S * 1.2) : this._cl(P.S * 1.8 + 1.4, 1.8, 6);
    for (let i = 0; i < E.fmRings.length; i++) {
      const r = E.fmRings[i];
      const k = det ? ((t - F.tD) * 0.62 + i / E.fmRings.length) % 1 : 0;
      r.visible = det && t - F.tD > i * 0.25;
      if (!r.visible) continue;
      r.position.set(F.sub[0], ry, F.sub[2]);
      const s = 0.25 * rMax + k * rMax;
      r.scale.set(s, 1, s);
      r.material.opacity = 0.75 * Math.sin(Math.PI * k) * (1 - F.dip);
    }
    // the evidence photo is taken without the scan graphics
    if (E.snapReq != null) for (const r of E.fmRings) r.visible = false;
    // interiors follow the film camera (point lights, room tone)
    const cp = E.cam.position;
    E.insideObj = cp.y - window.GHG3L.H(cp.x, cp.z) < 6 ? this._pInsideAt(cp.x, cp.z) : null;
    if (F.t >= F.end) this._fmEnd();
  },
  _fmShutter(quiet) {
    const E = this._E;
    const F = E.film;
    if (!F || F.snapped) return;
    F.snapped = true;
    if (!quiet) F.flash = 1;
    E.snapReq = F.id;
    if (!quiet && typeof this._auSfx === 'function') this._auSfx('shutter');
  },
  // called by core._loop right after the frame is drawn (the WebGL buffer is still there)
  _fmSnap() {
    const E = this._E;
    const id = E.snapReq;
    E.snapReq = null;
    if (id == null || typeof this._uPhoto !== 'function') return;
    try {
      const src = E.canvas;
      const W = src.width, H = src.height;
      if (!W || !H) return;
      const cw = 480, ch = 270;
      let sw = W, sh = Math.round(W * ch / cw);
      if (sh > H) { sh = H; sw = Math.round(H * cw / ch); }
      const cv = E.snapCv || (E.snapCv = document.createElement('canvas'));
      cv.width = cw; cv.height = ch;
      const g = cv.getContext('2d');
      g.drawImage(src, (W - sw) / 2, (H - sh) / 2, sw, sh, 0, 0, cw, ch);
      this._uPhoto(id, cv.toDataURL('image/jpeg', 0.74));
    } catch (err) { /* capture blocked: no photo, the film still plays */ }
  },

  // ---------------------------------------------------------------- camera (called from _tickCam)
  // returns false while the live view shows (the first fade and the cut back to the eyes)
  _fmCam(dt) {
    const E = this._E;
    const F = E.film;
    if (!F) return false;
    const t = F.t;
    if (t < F.tA) return false;
    if (t >= F.tE) {
      if (!F.backSet) { F.backSet = true; E.fovCur = E.fovWalk; }
      return false;
    }
    const P = F.plan;
    const cam = E.cam;
    const H = window.GHG3L.H;
    const ease = (u) => u * u * (3 - 2 * u);
    const lerp3 = (a, b, k, out) => { out[0] = a[0] + (b[0] - a[0]) * k; out[1] = a[1] + (b[1] - a[1]) * k; out[2] = a[2] + (b[2] - a[2]) * k; return out; };
    const pos = F.pos || (F.pos = [0, 0, 0]);
    const look = F.look || (F.look = [0, 0, 0]);
    let fov = 50, near = 0.25;
    if (t < F.tW) {
      // aerial
      const A = P.air;
      const u = (t - F.tA) / (F.tW - F.tA);
      const e = 0.15 * u + 0.85 * ease(u);
      const ang = A.az0 + (A.az1 - A.az0) * e;
      const R = A.R0 + (A.R1 - A.R0) * e;
      const alt = A.A0 + (A.A1 - A.A0) * e;
      pos[0] = P.T[0] + Math.sin(ang) * R;
      pos[2] = P.T[2] + Math.cos(ang) * R;
      pos[1] = Math.max(P.T[1] + alt, H(pos[0], pos[2]) + 9);
      look[0] = F.sub[0]; look[1] = P.focus[1] + (1 - e) * 2; look[2] = F.sub[2];
      fov = A.fov0 + (A.fov1 - A.fov0) * e;
      near = 1;
      E.shadowR = 150;
    } else if (t < F.tD) {
      // walk-in (hand-held)
      const W = P.walk;
      const u = (t - F.tW) / (F.tD - F.tW);
      const e = 0.35 * u + 0.65 * ease(u);
      lerp3(W.p0, W.p1, e, pos);
      const tt = t * 1.9;
      pos[0] += Math.sin(tt * 1.3) * 0.035; pos[1] += Math.sin(tt * 2.6) * 0.03; pos[2] += Math.cos(tt * 1.1) * 0.035;
      look[0] = F.sub[0]; look[1] = P.focus[1]; look[2] = F.sub[2];
      fov = W.fov0 + (W.fov1 - W.fov0) * e;
      E.shadowR = 70;
    } else {
      // close-up: orbit (or a slow zoom) — keeps moving during a narration hold
      const Dt = P.det;
      const d = (t - F.tD) + F.h;
      const b = ease(Math.min(1, d / 1.5));
      const W = P.walk;
      if (Dt.orbit) {
        const ang = Dt.az + Dt.dir * Math.min(Dt.span, Dt.w * d);
        const o = [P.T[0] + Math.sin(ang) * Dt.r, Dt.y, P.T[2] + Math.cos(ang) * Dt.r];
        lerp3(W.p1, o, b, pos);
      } else {
        const k = 0.25 * Math.min(1, d / 9) + 0.75 * ease(Math.min(1, d / 4.4));
        pos[0] = W.p1[0] + (Dt.fx * Dt.push + Dt.lx * Dt.slide) * k;
        pos[1] = W.p1[1] + Dt.dy * k;
        pos[2] = W.p1[2] + (Dt.fz * Dt.push + Dt.lz * Dt.slide) * k;
      }
      const tt = t * 1.6;
      pos[0] += Math.sin(tt * 1.2) * 0.02; pos[1] += Math.sin(tt * 2.1) * 0.015;
      look[0] = F.sub[0]; look[1] = P.focus[1]; look[2] = F.sub[2];
      fov = Dt.fov0 + (Dt.fov1 - Dt.fov0) * ease(Math.min(1, d / (Dt.orbit ? 3.4 : 4.2)));
      E.shadowR = 60;
    }
    cam.position.set(pos[0], pos[1], pos[2]);
    E.camLook.set(look[0], look[1], look[2]);
    cam.lookAt(E.camLook);
    E.focus.set(look[0], 0, look[2]);
    E.fovCur = fov;
    if (cam.fov !== fov || cam.near !== near || cam.far !== 4500) { cam.fov = fov; cam.near = near; cam.far = 4500; cam.updateProjectionMatrix(); }
    if (cam.view && cam.view.enabled) { cam.clearViewOffset(); E.vOff = 0; }
    void dt;
    return true;
  },

  // ---------------------------------------------------------------- HUD (overlay element from the UI)
  _fmAttach(el) {
    const E = this._E;
    if (!E) return;
    if (!el) { E.fmEl = null; return; }
    const q = (s) => el.querySelector(s);
    E.fmEl = { root: el, tc: q('.ghg-fm-tc'), alt: q('.ghg-fm-alt'), dist: q('.ghg-fm-dist'), cam: q('.ghg-fm-cam'), tag: q('.ghg-fm-tag'), dip: q('.ghg-fm-dip'), flash: q('.ghg-fm-flash'), prog: q('.ghg-fm-prog i'), last: {} };
  },
  _fmHud() {
    const E = this._E;
    const F = E.film;
    const U = E.fmEl;
    if (!F || !U || !U.root.isConnected) return;
    const L = U.last;
    const set = (el, key, v, fn) => { if (!el || L[key] === v) return; L[key] = v; fn(el, v); };
    const txt = (el, v) => { el.textContent = v; };
    const clock = F.t + F.h;
    const fr = Math.floor(clock * 30);
    const pad = (n) => (n < 10 ? '0' : '') + n;
    set(U.tc, 'tc', '00:00:' + pad(Math.floor(fr / 30) % 60) + ':' + pad(fr % 30), txt);
    const cp = E.cam.position;
    const P = F.plan;
    const live = F.t >= F.tA && F.t < F.tE;
    set(U.alt, 'alt', live ? String(Math.max(0, Math.round(cp.y - window.GHG3L.H(cp.x, cp.z)))) : '–', txt);
    set(U.dist, 'dist', live ? String(Math.round(Math.hypot(cp.x - P.T[0], cp.y - P.T[1], cp.z - P.T[2]))) : '–', txt);
    set(U.cam, 'cam', F.shot === 0 ? 'DRONE · มุมสูง' : (F.shot >= 4 ? 'กลับสู่มุมมองผู้ทวนสอบ' : 'กล้องผู้ทวนสอบ · หน้างาน'), txt);
    set(U.dip, 'dip', F.dip.toFixed(3), (el, v) => { el.style.opacity = v; });
    set(U.flash, 'fl', F.flash.toFixed(3), (el, v) => { el.style.opacity = v; });
    set(U.prog, 'pg', Math.min(100, (F.t / F.end) * 100).toFixed(1), (el, v) => { el.style.width = v + '%'; });
    // AR tag on the source (walk-in and close-up)
    let show = false, x = 0, y = 0;
    if (F.t > F.tW + 1.2 && F.t < F.tE - 0.15 && E.w) {
      const v = E.fmV.set(F.sub[0], P.tagY, F.sub[2]).project(E.cam);
      if (v.z < 1 && v.z > -1 && Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.9) {
        show = true;
        x = Math.round((v.x + 1) / 2 * E.w);
        y = Math.round((1 - v.y) / 2 * E.h);
      }
    }
    set(U.tag, 'tag', show ? x + ',' + y : 'off', (el, v) => {
      if (v === 'off') { el.style.opacity = '0'; return; }
      const p = v.split(',');
      el.style.opacity = '1';
      el.style.transform = 'translate3d(' + p[0] + 'px,' + p[1] + 'px,0)';
      el.setAttribute('data-side', +p[0] > E.w * 0.62 ? 'l' : 'r');
    });
  }
};
