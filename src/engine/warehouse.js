/* GHG Town 3D v1.1 — realistic warehouse bay of the rice mill (stop 10, diesel forklift)
   Called from complexes._bMill():
   _whWindows()        daylight windows in the mill's south wall (pane + mullions, bright from inside)
   _whBuild()          epoxy floor + markings, pallet racks loaded with cartons and rice sacks, roller conveyor,
                       contact shadows, and the forklift with its drive / lift / place cycle
   Textures are drawn once on canvases (carton print, pallet wood, rack steel, epoxy, woven sack, decals);
   static parts go into the usual merged buckets, moving parts are small baked meshes.               */
GHG3.warehouse = {
  // ================================================================ MATERIALS
  _whInit() {
    const E = this._E;
    const T = E.T;
    if (E.wh) return E.wh;
    const R = this._rng(4242);
    const W = E.wh = { shadowAcc: this._newAcc('flat'), spillAcc: this._newAcc('flat') };
    const std = (o) => new T.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.85, metalness: 0 }, o));
    // draw fn(x, y) at the 9 wrapped positions, so blotches tile seamlessly
    const wrap9 = (S, fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) fn(ox, oy); };

    // carton atlas: [print A | print B | top with tape], 512 px each
    const carton = this._canvasTex(1536, 512, (g) => {
      const S = 512;
      for (let r = 0; r < 3; r++) {
        const ox = r * S;
        g.fillStyle = '#C59B66'; g.fillRect(ox, 0, S, S);
        g.lineWidth = 1;
        for (let i = 0; i < 2200; i++) {
          const x = ox + R() * S, y = R() * S, l = 3 + R() * 9;
          g.strokeStyle = R() < 0.5 ? 'rgba(255,236,200,0.12)' : 'rgba(96,62,28,0.12)';
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (R() - 0.5) * 2.5); g.stroke();
        }
        for (let x = 0; x < S; x += 6) { g.fillStyle = x % 12 ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.025)'; g.fillRect(ox + x, 0, 3, S); }
        const edge = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(60,38,16,0.30)'); gr.addColorStop(1, 'rgba(60,38,16,0)'); return gr; };
        g.fillStyle = edge(ox, 0, ox + 24, 0); g.fillRect(ox, 0, 24, S);
        g.fillStyle = edge(ox + S, 0, ox + S - 24, 0); g.fillRect(ox + S - 24, 0, 24, S);
        g.fillStyle = edge(0, 0, 0, 20); g.fillRect(ox, 0, S, 20);
        g.fillStyle = edge(0, S, 0, S - 20); g.fillRect(ox, S - 20, S, 20);
      }
      const tape = (x, y, w, h) => {
        g.fillStyle = 'rgba(208,172,114,0.97)'; g.fillRect(x, y, w, h);
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, y + h * 0.2, w, h * 0.12);
        g.fillStyle = 'rgba(90,60,30,0.28)'; g.fillRect(x, y, w, 2); g.fillRect(x, y + h - 2, w, 2);
      };
      const print = (ox, ink, th, en) => {
        g.save();
        g.translate(ox + 116, 232);
        g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 7;
        g.beginPath(); g.arc(0, 0, 60, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 5; g.beginPath(); g.moveTo(-8, 44); g.quadraticCurveTo(-2, -8, 16, -44); g.stroke();
        for (let k = 0; k < 5; k++) {
          g.beginPath(); g.ellipse(6 + k * 3, 24 - k * 14, 6, 12, 0.6, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.ellipse(-12 + k * 4, 16 - k * 13, 5, 11, -0.5, 0, Math.PI * 2); g.fill();
        }
        g.restore();
        g.fillStyle = ink;
        g.textBaseline = 'alphabetic';
        g.font = '700 66px "IBM Plex Sans Thai", "Noto Sans Thai", Thonburi, sans-serif';
        g.fillText(th, ox + 192, 234, 300);
        g.font = '600 29px "IBM Plex Sans Thai", "Noto Sans Thai", sans-serif';
        g.fillText(en, ox + 195, 276, 296);
        g.font = '500 25px "IBM Plex Mono", ui-monospace, monospace';
        g.fillText('5 kg x 4  ·  NET 20 kg', ox + 195, 314);
      };
      const label = (x, y) => {
        g.fillStyle = '#F4F2EC'; g.fillRect(x, y, 168, 104);
        g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x, y + 102, 168, 2);
        let bx = x + 12;
        while (bx < x + 156) { const w = 1 + ((R() * 3) | 0); g.fillStyle = '#1C1C1C'; g.fillRect(bx, y + 12, w, 50); bx += w + 1 + ((R() * 3) | 0); }
        g.fillStyle = '#3A3A3A';
        for (let k = 0; k < 3; k++) g.fillRect(x + 12, y + 72 + k * 9, 60 + R() * 80, 4);
      };
      const up = (x, y) => {
        g.fillStyle = '#2B2B2B';
        for (const dx of [0, 26]) { g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx + 10, y + 16); g.lineTo(x + dx + 4, y + 16); g.lineTo(x + dx + 4, y + 36); g.lineTo(x + dx - 4, y + 36); g.lineTo(x + dx - 4, y + 16); g.lineTo(x + dx - 10, y + 16); g.closePath(); g.fill(); }
        g.fillRect(x - 12, y + 42, 50, 5);
      };
      tape(0 + S * 0.42, 0, S * 0.16, 62);
      tape(S + S * 0.42, 0, S * 0.16, 62);
      print(0, '#2F6B3A', 'ข้าวหอมมะลิ', 'CARBON TOWN RICE');
      print(S, '#7A3B22', 'ข้าวกล้อง', 'BROWN RICE');
      label(304, 372); label(S + 36, 380);
      up(48, 396); up(S + 438, 46);
      g.fillStyle = 'rgba(70,45,20,0.5)'; g.fillRect(2 * S, S / 2 - 2, S, 4);
      tape(2 * S, S * 0.42, S, S * 0.16);
    }, { text: true });

    // pallet wood: pale pine, grain along u
    const wood = this._canvasTex(512, 512, (g) => {
      g.fillStyle = '#D9BA8A'; g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 2) {
        const k = Math.sin(y * 0.11) * 0.5 + Math.sin(y * 0.031 + 1.7) * 0.5;
        if (k > 0.35) { g.fillStyle = 'rgba(150,104,52,0.20)'; g.fillRect(0, y, 512, 2); }
        else if (k < -0.5) { g.fillStyle = 'rgba(255,240,210,0.10)'; g.fillRect(0, y, 512, 2); }
      }
      for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(120,80,40,0.10)'; g.fillRect(R() * 512, R() * 512, 6 + R() * 30, 1); }
      for (let i = 0; i < 6; i++) {
        const x = R() * 512, y = R() * 512;
        const rg = g.createRadialGradient(x, y, 1, x, y, 14);
        rg.addColorStop(0, 'rgba(110,70,30,0.6)'); rg.addColorStop(1, 'rgba(110,70,30,0)');
        g.fillStyle = rg; g.beginPath(); g.ellipse(x, y, 16, 8, 0, 0, Math.PI * 2); g.fill();
      }
    }, { repeat: true });

    // rack steel: left half = upright face with teardrop slots (repeats along v), right half = plain paint
    const rack = this._canvasTex(256, 256, (g) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 256, 256);
      g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(4, 0, 9, 256); g.fillRect(115, 0, 9, 256);
      for (let k = 0; k < 8; k++) {
        const y = 14 + k * 32;
        g.fillStyle = '#1C2229';
        g.beginPath(); g.moveTo(64, y); g.lineTo(72, y + 6); g.lineTo(72, y + 17); g.quadraticCurveTo(64, y + 24, 56, y + 17); g.lineTo(56, y + 6); g.closePath(); g.fill();
        g.fillRect(30, y + 8, 6, 8); g.fillRect(92, y + 8, 6, 8);
      }
      const gr = g.createLinearGradient(128, 0, 256, 0);
      gr.addColorStop(0, '#F0F0F0'); gr.addColorStop(0.5, '#FFFFFF'); gr.addColorStop(1, '#ECECEC');
      g.fillStyle = gr; g.fillRect(128, 0, 128, 256);
    });
    rack.wrapT = T.RepeatWrapping;

    // epoxy floor: charcoal with soft mottling, fine speckle and tyre scuffs (tiles seamlessly)
    const epoxy = this._canvasTex(1024, 1024, (g) => {
      g.fillStyle = '#4A5055'; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 70; i++) {
        const x = R() * 1024, y = R() * 1024, r = 60 + R() * 200, a = 0.03 + R() * 0.04, dark = R() < 0.55;
        wrap9(1024, (ox, oy) => {
          const rg = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
          rg.addColorStop(0, dark ? 'rgba(0,0,0,' + a + ')' : 'rgba(255,255,255,' + (a * 0.7) + ')'); rg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = rg; g.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r);
        });
      }
      for (let i = 0; i < 26000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; g.fillRect(R() * 1024, R() * 1024, 1.5, 1.5); }
      g.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const ang = R() * Math.PI, len = 300 + R() * 400, bend = (R() - 0.5) * 120;
        const p = [R() * 1024, R() * 1024, Math.cos(ang) * len * 0.33 - Math.sin(ang) * bend, Math.sin(ang) * len * 0.33 + Math.cos(ang) * bend, Math.cos(ang) * len * 0.66 - Math.sin(ang) * bend, Math.sin(ang) * len * 0.66 + Math.cos(ang) * bend, Math.cos(ang) * len, Math.sin(ang) * len];
        const lw = 3 + R() * 5;
        wrap9(1024, (ox, oy) => {
          g.strokeStyle = 'rgba(16,16,18,0.06)'; g.lineWidth = lw;
          g.beginPath(); g.moveTo(p[0] + ox, p[1] + oy);
          g.bezierCurveTo(p[0] + p[2] + ox, p[1] + p[3] + oy, p[0] + p[4] + ox, p[1] + p[5] + oy, p[0] + p[6] + ox, p[1] + p[7] + oy);
          g.stroke();
        });
      }
    }, { repeat: true });

    // woven PP rice sack with a printed green band
    const sack = this._canvasTex(256, 256, (g) => {
      g.fillStyle = '#ECE9DF'; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 256; i += 4) { g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(i, 0, 2, 256); g.fillRect(0, i, 256, 2); }
      g.fillStyle = '#3E8E4E'; g.fillRect(0, 110, 256, 34);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      for (let k = 0; k < 6; k++) g.fillRect(12 + k * 42, 121, 26, 11);
    }, { repeat: true });

    // filled-sack shape: a sphere pushed out toward a box (flat top, rounded edges); UV band stays round the sides
    if (!E.G) E.G = {};
    if (!E.G.pillow) {
      const g = new T.SphereGeometry(1, 18, 12);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const f = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
        p.setXYZ(i, f(p.getX(i), 0.35), f(p.getY(i), 0.6), f(p.getZ(i), 0.35));
      }
      g.computeVertexNormals();
      E.G.pillow = g;
    }
    const BK = E.BK;
    BK.whCarton = { mat: std({ map: carton, roughness: 0.93 }), tw: 1, th: 1, cast: true };
    BK.whWood = { mat: std({ map: wood, roughness: 0.9 }), tw: 1.2, th: 0.6, cast: true };
    BK.whRack = { mat: std({ map: rack, roughness: 0.42, metalness: 0.28 }), tw: 1, th: 0.6, cast: true };
    BK.whPaint = { mat: std({ roughness: 0.36, metalness: 0.12 }), tw: 1, th: 1, cast: true };
    BK.whSack = { mat: std({ map: sack, roughness: 0.95 }), tw: 1, th: 1, cast: true };
    BK.whEpoxy = { mat: std({ map: epoxy, roughness: 0.6, metalness: 0.02, envMapIntensity: 0.55, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), tw: 8, th: 8, cast: false };
    for (const k of ['whCarton', 'whWood', 'whRack', 'whPaint', 'whSack', 'whEpoxy']) BK[k].name = k;

    // floor decals (transparent, pulled in front of the floor and its paint)
    const decal = (map, o) => new T.MeshStandardMaterial(Object.assign({ map: map, transparent: true, depthWrite: false, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }, o || {}));
    W.arrowMat = decal(this._canvasTex(256, 256, (g) => {
      g.clearRect(0, 0, 256, 256);
      g.strokeStyle = 'rgba(246,246,240,0.95)'; g.lineWidth = 34; g.lineCap = 'square'; g.lineJoin = 'miter';
      g.beginPath(); g.moveTo(40, 190); g.lineTo(128, 96); g.lineTo(216, 190); g.stroke();
    }));
    const hatch = this._canvasTex(128, 128, (g) => {
      g.fillStyle = '#17181A'; g.fillRect(0, 0, 128, 128);
      g.fillStyle = '#F2B705';
      for (let k = -2; k < 4; k++) { g.beginPath(); g.moveTo(k * 64, 128); g.lineTo(k * 64 + 32, 128); g.lineTo(k * 64 + 160, 0); g.lineTo(k * 64 + 128, 0); g.closePath(); g.fill(); }
    }, { repeat: true });
    W.hatchMat = new T.MeshStandardMaterial({ map: hatch, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });
    W.textMat = decal(this._canvasTex(1024, 220, (g) => {
      g.clearRect(0, 0, 1024, 220);
      g.fillStyle = 'rgba(246,246,240,0.95)';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '700 118px "Prompt", "IBM Plex Sans Thai", sans-serif';
      g.fillText('SHIPPING', 512, 92);
      g.font = '600 52px "IBM Plex Sans Thai", "Noto Sans Thai", sans-serif';
      g.fillText('จุดรวมสินค้าส่งออก', 512, 182);
      g.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(0,0,0,' + (0.3 + R() * 0.6) + ')'; g.fillRect(R() * 1024, R() * 220, 1 + R() * 4, 1 + R() * 3); }
      g.globalCompositeOperation = 'source-over';
    }, { text: true }));
    // soft contact shadow + window light spill share one radial gradient
    const blob = this._canvasTex(128, 128, (g) => {
      g.clearRect(0, 0, 128, 128);
      const rg = g.createRadialGradient(64, 64, 6, 64, 64, 64);
      rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.7)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    }, { linear: true });
    W.shadowMat = new T.MeshBasicMaterial({ map: blob, color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -5 });
    W.spillMat = new T.MeshBasicMaterial({ map: blob, color: this._lcol('#FFF2DC'), transparent: true, opacity: 0.16, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -5 });
    this._anim(() => { W.spillMat.opacity = 0.16 * (1 - (E.nightK || 0)); });
    W.blob = blob;
    return W;
  },

  // ================================================================ GOODS
  // one carton: 4 printed sides + taped top (no bottom); axis-aligned, base at y; v = print variant (0 | 1)
  _whCarton(b, x, y, z, w, h, d, col, v) {
    const hw = w / 2, hh = h / 2, hd = d / 2, cy = y + hh, S = 1 / 3;
    const u0 = v ? S : 0;
    const side = (C, Rv, hr) => this._face(b, C, Rv, [0, 1, 0], hr, hh, col, { u0: u0, v0: 0, tw: (2 * hr) / S, th: 2 * hh });
    side([x, cy, z + hd], [1, 0, 0], hw);
    side([x, cy, z - hd], [-1, 0, 0], hw);
    side([x + hw, cy, z], [0, 0, -1], hd);
    side([x - hw, cy, z], [0, 0, 1], hd);
    this._face(b, [x, y + h, z], [1, 0, 0], [0, 0, -1], hw, hd, col, { u0: 2 * S, v0: 0, tw: (2 * hw) / S, th: 2 * hd });
  },
  // 1.2 x 1.0 m block pallet; long side along x (along z when rot); base at y; returns the deck top
  _whPallet(b, x, y, z, rot, col) {
    const c = col || '#E4C695';
    const P = (lx, ly, lz, w, h, d, skip) => rot
      ? this.box(b, x + lz, y + ly, z + lx, d, h, w, c, { noAO: true, skip: skip })
      : this.box(b, x + lx, y + ly, z + lz, w, h, d, c, { noAO: true, skip: skip });
    for (const lz of [-0.44, 0, 0.44]) P(0, 0, lz, 1.2, 0.022, 0.12, 'ny');
    for (const lx of [-0.55, 0, 0.55]) for (const lz of [-0.44, 0, 0.44]) P(lx, 0.022, lz, 0.1, 0.078, lz === 0 ? 0.145 : 0.1, 'ny py');
    for (const lx of [-0.55, 0, 0.55]) P(lx, 0.1, 0, 0.1, 0.022, 1.0, 'ny');
    for (let i = 0; i < 7; i++) P(0, 0.122, -0.45 + i * 0.15, 1.2, 0.022, 0.1, 'ny');
    return y + 0.144;
  },
  // pallet + goods. kind 'carton' | 'sack'; layers optional. bw/bc/bs = buckets (merged statics or bake accs)
  _whLoad(x, y, z, kind, R, rot, layers, bk) {
    const B = bk || { wood: 'whWood', carton: 'whCarton', sack: 'whSack' };
    const top = this._whPallet(B.wood, x, y, z, rot);
    const at = (lx, lz) => rot ? [x + lz, z + lx] : [x + lx, z + lz];
    if (kind === 'sack') {
      // layers alternate: two sacks along the long side, then two across it (radii given along the pallet's own axes)
      const n = layers || (4 + ((R() * 2) | 0));
      for (let l = 0; l < n; l++) {
        const yy = top + 0.075 + l * 0.15;
        const tint = ['#FFFFFF', '#F6F3EA', '#EEEAE0'][(R() * 3) | 0];
        const along = l % 2 === 0;
        const rl = along ? [0.55, 0.24] : [0.27, 0.47];
        for (const s of along ? [[0, -0.25], [0, 0.25]] : [[-0.3, 0], [0.3, 0]]) {
          const p = at(s[0] + (R() - 0.5) * 0.04, s[1] + (R() - 0.5) * 0.03);
          this._gput(B.sack, 'pillow', p[0], yy, p[1], rot ? rl[1] : rl[0], 0.078, rot ? rl[0] : rl[1], 0, (R() - 0.5) * 0.06, 0, tint);
        }
      }
      return top + n * 0.15;
    }
    const n = layers || (2 + ((R() * 2) | 0));
    const v = R() < 0.6 ? 0 : 1;
    for (let l = 0; l < n; l++) for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) {
      if (l === n - 1 && n > 2 && R() < 0.14) continue;
      const tint = ['#FFFFFF', '#F3ECE2', '#E9E1D3', '#FBF6EE'][(R() * 4) | 0];
      const p = at((i - 0.5) * 0.6 + (R() - 0.5) * 0.02, (k - 0.5) * 0.5 + (R() - 0.5) * 0.02);
      if (rot) this._whCarton(B.carton, p[0], top + l * 0.36, p[1], 0.47, 0.36, 0.58, tint, v);
      else this._whCarton(B.carton, p[0], top + l * 0.36, p[1], 0.58, 0.36, 0.47, tint, v);
    }
    return top + n * 0.36;
  },
  // soft contact shadow quad on the floor (merged into one mesh at the end of _whBuild)
  _whShadow(x, z, w, d) {
    const A = this._E.wh.shadowAcc;
    const y = 0.126, hw = w / 2, hd = d / 2;
    this._quad(A, [x - hw, y, z + hd], [x + hw, y, z + hd], [x + hw, y, z - hd], [x - hw, y, z - hd], [0, 1, 0], [0, 0, 1, 1], '#FFFFFF', false);
  },

  // ================================================================ RACKS
  // single-depth selective rack running along z: depth centred on x, nb bays of 2.7 m from z0 (north-going);
  // lv = beam tops above the floor; keep = list of 'bay:level:slot' kept empty (level 0 = floor)
  _whRack(x, z0, nb, lv, H, R, fill, keep) {
    const D = 1.1, BAY = 2.7, F = 0.12;
    const BLUE = '#2459A6', ORANGE = '#E0611F';
    const plain = { u0: 0.75, tw: 1e4, th: 1e4, ttw: 1e4, tth: 1e4 };
    for (let k = 0; k <= nb; k++) {
      const z = z0 + k * BAY;
      for (const s of [-1, 1]) {
        const ux = x + s * (D / 2 - 0.05);
        this.box('whRack', ux, F, z, 0.1, H, 0.08, BLUE, { tw: 0.2, th: 0.6, ttw: 1e4, tth: 1e4 });
        this.box('flat', ux, F, z, 0.18, 0.012, 0.15, '#3A4047', { noAO: true });
      }
      const n = Math.max(3, Math.round((H - 0.5) / 1.1));
      for (let i = 0; i <= n; i++) {
        const y = F + 0.22 + i * ((H - 0.45) / n);
        this.box('whRack', x, y, z, D - 0.2, 0.035, 0.035, BLUE, plain);
        if (i < n) {
          const y2 = F + 0.22 + (i + 1) * ((H - 0.45) / n);
          const dx = D - 0.2, dy = y2 - y;
          this.boxR('whRack', x, (y + y2) / 2 + 0.017, z, Math.hypot(dx, dy), 0.03, 0.03, BLUE, 0, 0, Math.atan2(dy, i % 2 ? -dx : dx), 0);
        }
      }
    }
    const slots = [F].concat(lv.map((l) => F + l));
    for (let k = 0; k < nb; k++) {
      const zc = z0 + (k + 0.5) * BAY;
      for (const yb of lv) for (const s of [-1, 1]) this.box('whRack', x + s * (D / 2 - 0.03), F + yb - 0.12, zc, 0.05, 0.12, BAY - 0.09, ORANGE, plain);
      for (let li = 0; li < slots.length; li++) for (let si = 0; si < 2; si++) {
        if (keep && keep.indexOf(k + ':' + li + ':' + si) >= 0) continue;
        if (R() > fill) continue;
        const dz = si ? 0.64 : -0.64;
        this._whLoad(x, slots[li], zc + dz, R() < 0.35 ? 'sack' : 'carton', R, false);
        if (li === 0) this._whShadow(x, zc + dz, 1.45, 1.25);
      }
      this._whShadow(x, zc, 1.6, 3.0);
    }
    this._col(x - D / 2 - 0.06, z0 - 0.06, x + D / 2 + 0.06, z0 + nb * BAY + 0.06);
  },

  // ================================================================ CONVEYOR
  // roller conveyor along x at depth z with yellow guard rails; boxes ride from x0 to x1. returns roller top y
  _whConveyor(x0, x1, z, R) {
    const E = this._E;
    const T = E.T;
    const F = 0.12, top = F + 0.78, Wd = 0.84, L = x1 - x0, xm = (x0 + x1) / 2;
    const FR = '#2C4F9E', GAL = '#C3C9CE', YEL = '#F2B705', DKS = '#3A4047';
    for (const s of [-1, 1]) {
      this.box('whPaint', xm, top - 0.15, z + s * (Wd / 2 + 0.03), L, 0.17, 0.05, FR);
      this.box('whPaint', xm, top - 0.15, z + s * (Wd / 2 + 0.058), L, 0.02, 0.006, '#E8EDF2');
    }
    for (let x = x0 + 0.06; x < x1 - 0.03; x += 0.1) this.cylR('shiny', x, top - 0.033, z, 0.033, Wd, GAL, Math.PI / 2, 0, 0, 8);
    const nL = Math.max(2, Math.round(L / 1.6));
    for (let i = 0; i <= nL; i++) {
      const x = x0 + 0.12 + (i * (L - 0.24)) / nL;
      for (const s of [-1, 1]) {
        this.box('whPaint', x, F, z + s * (Wd / 2 + 0.03), 0.06, top - F - 0.15, 0.06, FR);
        this.box('flat', x, F, z + s * (Wd / 2 + 0.03), 0.15, 0.02, 0.13, DKS, { noAO: true });
      }
      this.box('whPaint', x, F + 0.24, z, 0.05, 0.05, Wd, FR);
    }
    this.box('whPaint', xm, F + 0.3, z, 0.9, 0.3, Wd - 0.12, '#23408A');
    this._cxMotor(xm + 0.25, F + 0.36, z + 0.62, 'x', 0.45, 0.13, '#5E6A72');
    // guard rails
    for (const s of [-1, 1]) {
      const zr = z + s * 0.95;
      const nP = Math.max(2, Math.round(L / 1.45));
      for (let i = 0; i <= nP; i++) {
        const x = x0 + (i * L) / nP;
        this.cyl('whPaint', x, F, zr, 0.04, 1.06, YEL, 10);
        this.cyl('flat', x, F, zr, 0.1, 0.015, DKS, 12);
      }
      for (const y of [0.58, 1.06]) this.cylR('whPaint', xm, F + y, zr, 0.032, L, YEL, 0, 0, Math.PI / 2, 10);
      this._whShadow(xm, zr, L + 0.4, 0.5);
    }
    this._whShadow(xm, z, L + 0.3, 1.5);
    // case packer at the start (boxes appear inside it) and labeller hood at the end (they leave through it)
    const hood = (xc, w, h, col) => {
      this.box('whPaint', xc, F, z, w, h, 1.3, col);
      this.box('flat', xc, F + h, z, w + 0.06, 0.06, 1.36, '#2A3238');
      this.box('glass', xc, F + h * 0.55, z + 0.651, w * 0.62, h * 0.32, 0.02, '#6C8796');
      this.box('flat', xc, top - 0.04, z + 0.655, w * 0.7, 0.4, 0.02, '#14181B');
      this._whShadow(xc, z, w + 0.6, 1.9);
    };
    hood(x0 + 0.6, 1.2, 1.9, '#DDE3E8');
    this.box('glow', x0 + 0.95, F + 1.55, z + 0.665, 0.18, 0.1, 0.01, '#7CFF9E');
    hood(x1 - 0.55, 1.1, 1.6, '#E8ECEF');
    this.box('glow', x1 - 0.75, F + 1.3, z + 0.665, 0.16, 0.09, 0.01, '#FFB300');
    // emergency stop box on a rail post
    this.box('flat', xm - 3, F + 0.95, z + 1.0, 0.12, 0.14, 0.08, '#F2C21B');
    this.cylR('flat', xm - 3, F + 1.02, z + 1.06, 0.035, 0.04, '#D32F2F', Math.PI / 2, 0, 0, 10);
    this._col(x0, z - 1.02, x1, z + 1.02);
    // moving cartons
    const geo = this._bake((A) => this._whCarton(A, 0, 0, 0, 0.5, 0.32, 0.42, '#FFFFFF', 0), 'whCarton');
    const items = [];
    for (let i = 0; i < 7; i++) {
      const m = new T.Mesh(geo, E.BK.whCarton.mat);
      m.castShadow = true;
      m.receiveShadow = true;
      m.rotation.y = R() < 0.5 ? 0 : Math.PI;
      items.push(this._addDyn(m));
    }
    const a = x0 + 0.7, span = (x1 - 0.6) - a;
    this._anim((dt, t) => {
      for (let i = 0; i < items.length; i++) items[i].position.set(a + ((t * 0.5 + (i * span) / items.length) % span), top, z);
    });
    return top;
  },

  // ================================================================ FORKLIFT
  // diesel counterbalance forklift (forward = +z). Groups: body, inner mast, carriage (forks), load, wheels
  _whForklift() {
    const E = this._E;
    const T = E.T;
    const g = new T.Group();
    const OR = '#E24A22', DK = '#1E2124', MD = '#2A2E32', CHR = '#C9CED2';
    const bake = (fn, bk, parent) => this._bakeMesh(fn, { parent: parent || g, bk: bk });
    // painted body
    bake((A) => {
      this.box(A, 0, 0.22, 0.55, 0.66, 0.42, 0.7, OR, { noAO: true });          // front frame between the drive wheels
      this.box(A, 0, 0.3, -0.35, 1.0, 0.34, 1.1, OR, { noAO: true });           // body under the operator
      this.box(A, 0, 0.42, -1.25, 1.1, 0.8, 0.62, OR, { noAO: true });          // counterweight
      this._gput(A, 'cyl28', 0, 0.82, -1.56, 0.55, 0.8, 0.24, 0, 0, 0, OR);     // rounded back
      this.box(A, 0, 0.64, -0.92, 0.96, 0.42, 0.5, OR, { noAO: true });         // engine hood
      this.box(A, 0, 0.64, -0.6, 0.62, 0.34, 0.5, OR, { noAO: true });          // seat riser
      this.box(A, 0, 0.64, 0.38, 0.92, 0.36, 0.28, OR, { noAO: true });         // cowl
      for (const s of [-1, 1]) this.box(A, s * 0.47, 0.71, 0.55, 0.28, 0.035, 0.8, OR, { noAO: true }); // fenders
    }, 'whPaint');
    // dark / rubber parts
    bake((A) => {
      this.box(A, 0, 0.64, -0.03, 0.9, 0.015, 0.52, MD);                       // operator floor
      this._gput(A, 'cyl28', 0, 0.48, -1.57, 0.565, 0.12, 0.255, 0, 0, 0, DK);  // rear bumper band
      for (let k = 0; k < 5; k++) for (const s of [-1, 1]) this.box(A, s * 0.482, 0.7 + k * 0.06, -0.92, 0.01, 0.025, 0.42, '#2A2D30');
      this.box(A, 0, 0.98, -0.6, 0.48, 0.1, 0.46, '#1B1C1E');                   // seat
      this.boxR(A, 0, 1.3, -0.84, 0.46, 0.5, 0.09, '#1B1C1E', -0.2, 0, 0);       // backrest
      this.cylR(A, 0, 1.12, 0.31, 0.035, 0.44, MD, -0.56, 0, 0, 8);             // steering column
      this._gput(A, 'torus16', 0, 1.31, 0.19, 0.17, 0.17, 0.17, 1.02, 0, 0, '#1B1C1E');
      for (let k = 0; k < 3; k++) {
        this.cylR(A, 0.27 + k * 0.06, 1.1, 0.42, 0.012, 0.3, MD, -0.25, 0, 0, 6);
        this.sph(A, 0.27 + k * 0.06, 1.25, 0.38, 0.026, 0.026, 0.026, ['#111111', '#B71C1C', '#111111'][k], 8);
      }
      // overhead guard
      for (const s of [-1, 1]) {
        this.box(A, s * 0.5, 1.04, -0.86, 0.06, 1.12, 0.06, DK);
        const y0 = 0.98, y1 = 2.16, z0 = 0.48, z1 = 0.36;
        this.boxR(A, s * 0.47, (y0 + y1) / 2, (z0 + z1) / 2, 0.06, Math.hypot(y1 - y0, z1 - z0), 0.06, DK, Math.atan2(z1 - z0, y1 - y0), 0, 0);
        this.box(A, s * 0.49, 2.13, -0.25, 0.06, 0.06, 1.28, DK);
      }
      this.box(A, 0, 2.13, 0.36, 1.04, 0.06, 0.06, DK);
      this.box(A, 0, 2.13, -0.87, 1.04, 0.06, 0.06, DK);
      for (let k = 0; k < 6; k++) this.box(A, 0, 2.14, -0.75 + k * 0.2, 0.94, 0.03, 0.05, DK);
      // outer mast, tie bars, tilt cylinders
      for (const s of [-1, 1]) {
        this.box(A, s * 0.36, 0.12, 0.8, 0.08, 2.1, 0.14, DK);
        this.cylR(A, s * 0.42, 0.8, 0.62, 0.035, 0.36, MD, Math.PI / 2 - 0.15, 0, 0, 8);
      }
      this.box(A, 0, 2.14, 0.8, 0.8, 0.08, 0.12, DK);
      this.box(A, 0, 0.3, 0.8, 0.8, 0.1, 0.12, DK);
      this.cylR(A, 0, 0.75, 0.86, 0.058, 1.1, MD, 0, 0, 0, 10);                 // lift cylinder barrel
      // exhaust stack (rear right) and lamps
      this.cylR(A, 0.42, 1.55, -0.98, 0.036, 1.0, '#3B3F43', 0, 0, 0, 8);
      this.cylR(A, 0.42, 2.07, -0.98, 0.05, 0.05, '#2A2D30', 0, 0, 0, 10);
      for (const s of [-1, 1]) this.box(A, s * 0.45, 2.0, 0.42, 0.12, 0.1, 0.08, '#2A2D30');
      this.box(A, 0, 2.18, -0.86, 0.14, 0.04, 0.14, '#2A2D30');
      // seated operator, rounded: capsule limbs, hi-vis vest with reflective bands, hard hat
      const VEST = '#FF7A1A', SHIRT = '#2F5E9C', PANTS = '#2B3440', SKIN = '#C98F66', BOOT = '#1E1E1E';
      const limb = (a, b, r, col) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
        const eu = new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / len, dy / len, dz / len)));
        this._gput(A, 'cyl14', (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, r, len, r, eu.x, eu.y, eu.z, col);
        this.sph(A, a[0], a[1], a[2], r, r, r, col, 12);
        this.sph(A, b[0], b[1], b[2], r, r, r, col, 12);
      };
      this.sph(A, 0, 1.14, -0.58, 0.19, 0.1, 0.16, PANTS, 14);
      for (const s of [-1, 1]) {
        limb([s * 0.1, 1.14, -0.56], [s * 0.11, 1.12, -0.18], 0.072, PANTS);
        limb([s * 0.11, 1.12, -0.18], [s * 0.11, 0.72, -0.08], 0.058, PANTS);
        this.sph(A, s * 0.11, 0.69, -0.01, 0.06, 0.045, 0.12, BOOT, 12);
      }
      this._gput(A, 'cyl18', 0, 1.46, -0.6, 0.19, 0.52, 0.13, -0.1, 0, 0, VEST);
      this.sph(A, 0, 1.72, -0.62, 0.19, 0.07, 0.13, VEST, 14);
      for (const y of [1.36, 1.56]) this._gput(A, 'cyl18', 0, y, -0.6 + (y - 1.46) * 0.1, 0.196, 0.04, 0.136, -0.1, 0, 0, '#DCE6E6');
      for (const s of [-1, 1]) {
        limb([s * 0.2, 1.68, -0.6], [s * 0.22, 1.42, -0.42], 0.05, SHIRT);
        limb([s * 0.22, 1.42, -0.42], [s * 0.15, 1.34, -0.14], 0.042, SHIRT);
        this.sph(A, s * 0.14, 1.33, -0.11, 0.045, 0.04, 0.05, SKIN, 10);
      }
      this.cyl(A, 0, 1.74, -0.62, 0.055, 0.1, SKIN, 12);
      this.sph(A, 0, 1.9, -0.61, 0.1, 0.12, 0.11, SKIN, 16);
      this.sph(A, 0, 1.88, -0.505, 0.02, 0.025, 0.02, '#B07A55', 8);
      this.sph(A, 0, 1.965, -0.61, 0.125, 0.09, 0.135, '#F5F5F0', 16);
      this.cylR(A, 0, 1.945, -0.6, 0.15, 0.014, '#F5F5F0', 0, 0, 0, 20);
      this.sph(A, 0, 1.95, -0.47, 0.09, 0.012, 0.05, '#F5F5F0', 12);
    }, 'flat');
    bake((A) => {
      for (const s of [-1, 1]) this.box(A, s * 0.45, 2.0, 0.461, 0.09, 0.07, 0.01, '#FFF6E0');
      this.box(A, 0.2, 2.0, -0.901, 0.12, 0.05, 0.01, '#FF3B30');
    }, 'glow');
    // wheels (spin with the distance driven)
    const wheels = [];
    const wheel = (x, y, z, r, w) => {
      const wg = new T.Group();
      wg.position.set(x, y, z);
      g.add(wg);
      this._bakeMesh((A) => {
        this.cylR(A, 0, 0, 0, r, w, '#141414', 0, 0, Math.PI / 2, 22);
        for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; this.boxR(A, 0, Math.cos(a) * r, Math.sin(a) * r, w * 1.01, 0.03, 0.05, '#1E1E1E', a, 0, 0); }
        const sx = Math.sign(x) * (w / 2 + 0.004);
        this.cylR(A, sx, 0, 0, r * 0.58, 0.01, '#9AA2A8', 0, 0, Math.PI / 2, 16);
        this.cylR(A, sx * 1.02, 0, 0, r * 0.2, 0.03, '#5E666C', 0, 0, Math.PI / 2, 10);
        for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; this.cylR(A, sx * 1.03, Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, 0.018, 0.02, '#C9CED2', 0, 0, Math.PI / 2, 6); }
      }, { parent: wg });
      wheels.push({ g: wg, r: r });
    };
    for (const s of [-1, 1]) { wheel(s * 0.47, 0.35, 0.55, 0.35, 0.24); wheel(s * 0.43, 0.29, -1.08, 0.29, 0.2); }
    // inner mast: rises once the carriage passes free lift
    const inner = new T.Group();
    g.add(inner);
    bake((A) => {
      for (const s of [-1, 1]) this.box(A, s * 0.29, 0.14, 0.87, 0.07, 2.02, 0.1, MD);
      this.box(A, 0, 2.08, 0.87, 0.66, 0.07, 0.09, MD);
      for (const s of [-1, 1]) this.cylR(A, s * 0.12, 2.12, 0.9, 0.06, 0.05, '#555B60', 0, 0, Math.PI / 2, 12);
    }, 'flat', inner);
    bake((A) => { this.cylR(A, 0, 1.75, 0.86, 0.03, 0.6, CHR, 0, 0, 0, 8); }, 'shiny', inner);
    // carriage + forks (origin = fork blade underside, at the mast face)
    const car = new T.Group();
    car.position.set(0, 0.15, 0.97);
    g.add(car);
    bake((A) => {
      this.box(A, 0, 0.05, 0, 0.98, 0.42, 0.06, DK);
      for (const s of [-1, 1]) this.box(A, s * 0.47, 0.47, 0, 0.04, 0.76, 0.04, DK);
      this.box(A, 0, 1.21, 0, 0.98, 0.04, 0.04, DK);
      for (let k = 0; k < 6; k++) this.box(A, -0.4 + k * 0.16, 0.47, 0, 0.025, 0.74, 0.025, DK);
      for (const s of [-1, 1]) {
        this.box(A, s * 0.3, 0.0, 0.05, 0.12, 0.5, 0.045, '#2F3336');
        this.box(A, s * 0.3, 0.0, 0.62, 0.12, 0.045, 1.1, '#2F3336');
      }
    }, 'flat', car);
    // chains: unit-height boxes stretched between the carriage and the inner-mast sheaves every frame
    const chains = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ color: this._lcol('#3B3F42'), roughness: 0.6, metalness: 0.5 }));
    const chain2 = chains.clone();
    for (const c of [chains, chain2]) { c.scale.set(0.035, 1, 0.02); g.add(c); }
    chains.position.set(-0.12, 1, 0.91);
    chain2.position.set(0.12, 1, 0.91);
    // load on the forks
    const load = this._whLoadGroup();
    load.position.set(0, 0.045, 0.62);
    car.add(load);
    // amber beacon (blinks) and the blue pedestrian spot projected behind the truck
    const beacon = new T.Mesh(new T.CylinderGeometry(0.055, 0.065, 0.1, 14), new T.MeshBasicMaterial({ color: this._lcol('#FFB300'), toneMapped: false }));
    beacon.position.set(0, 2.25, -0.86);
    g.add(beacon);
    const spotMat = new T.MeshBasicMaterial({ map: E.wh.blob, color: this._lcol('#38B6FF'), transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
    const spot = new T.Mesh(new T.PlaneGeometry(0.9, 0.55), spotMat);
    spot.rotation.x = -Math.PI / 2;
    spot.position.set(0, 0.008, -2.35);
    g.add(spot);
    // soft shadow under the truck
    const sh = new T.Mesh(new T.PlaneGeometry(1.6, 3.4), E.wh.shadowMat);
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(0, 0.006, -0.3);
    g.add(sh);
    return { g: g, inner: inner, car: car, load: load, chains: [chains, chain2], beacon: beacon, wheels: wheels };
  },
  // pallet of cartons as a small group (shared geometry: on the forks and the copy left in the rack)
  _whLoadGroup() {
    const E = this._E;
    const T = E.T;
    const W = E.wh;
    if (!W.loadGeo) {
      const R = this._rng(77);
      const Aw = this._newAcc('whWood'), Ac = this._newAcc('whCarton');
      this._whLoad(0, 0, 0, 'carton', R, true, 3, { wood: Aw, carton: Ac, sack: Ac });
      W.loadGeo = [[this._accGeo(Aw), E.BK.whWood.mat], [this._accGeo(Ac), E.BK.whCarton.mat]];
    }
    const grp = new T.Group();
    for (const p of W.loadGeo) {
      const m = new T.Mesh(p[0], p[1]);
      m.castShadow = true;
      m.receiveShadow = true;
      grp.add(m);
    }
    return grp;
  },
  // forklift drive cycle along the lane at z: pick up at xA, drive, lift, set the pallet on the first rack beam, back away
  _whForkliftRun(xA, xB, z, beamTop) {
    const E = this._E;
    const FL = this._whForklift();
    FL.g.position.set(xA, 0.12, z);
    FL.g.rotation.y = Math.PI / 2;
    this._addDyn(FL.g);
    const LOADZ = 0.97 + 0.62;                      // pallet centre ahead of the truck origin
    const PLACE = beamTop - 0.045;                  // fork lift at which the pallet rests on the beam
    const placed = this._whLoadGroup();
    placed.position.set(xB + LOADZ, 0.12 + beamTop, z);
    placed.rotation.y = Math.PI / 2;
    placed.visible = false;
    this._addDyn(placed);
    const ex = this._emitter({ type: 'exhaust', pos: [xA - 0.98, 2.22, z - 0.42], rate: 3, size: 0.3, rise: 0.7, spread: 0.08, life: 1.6, color: '#6B6B6B' });
    const CYC = 24, TRAVEL = 0.15, UP = PLACE + 0.045, DOWN = PLACE - 0.05, FREE = 0.9;
    let lastX = xA;
    this._anim((dt, t) => {
      const u = t % CYC;
      let x = xA, lift = TRAVEL, has = true, rate = 2.5;
      if (u < 2) { /* waiting at the bagging line */ }
      else if (u < 8.5) { x = xA + (xB - xA) * this._sm((u - 2) / 6.5); rate = 6; }
      else if (u < 11.3) { x = xB; lift = TRAVEL + (UP - TRAVEL) * this._sm((u - 8.5) / 2.8); rate = 4; }
      else if (u < 12.1) { x = xB; lift = UP + (DOWN - UP) * this._sm((u - 11.3) / 0.8); has = lift > PLACE; }
      else if (u < 13.1) { x = xB - 0.9 * this._sm((u - 12.1) / 1.0); lift = DOWN; has = false; rate = 4; }
      else if (u < 15.1) { x = xB - 0.9; lift = DOWN + (TRAVEL - DOWN) * this._sm((u - 13.1) / 2); has = false; rate = 3.5; }
      else if (u < 21.6) { x = (xB - 0.9) + (xA - xB + 0.9) * this._sm((u - 15.1) / 6.5); has = false; rate = 6; }
      else { has = u > 22.4; }
      FL.g.position.x = x;
      FL.car.position.y = lift;
      FL.inner.position.y = Math.max(0, lift - FREE);
      FL.load.visible = has;
      placed.visible = !has && u > 11.3;
      const cTop = FL.inner.position.y + 2.12, cBot = lift + 0.47;
      for (const c of FL.chains) { c.position.y = (cTop + cBot) / 2; c.scale.y = Math.max(0.05, cTop - cBot); }
      const dx = x - lastX;
      lastX = x;
      for (const w of FL.wheels) w.g.rotation.x += dx / w.r;
      FL.beacon.visible = (t * 2.4) % 1 < 0.55;
      ex.pos[0] = x - 0.98; ex.pos[1] = 2.22; ex.pos[2] = z - 0.42;
      ex.rate = rate;
    });
    return FL;
  },

  // ================================================================ WINDOWS
  // window openings wins = [[x0, x1], ...] in a wall along x centred at zc (thickness t); sill y0, head y1.
  // Panes: bright day material seen from inside (+z), glass seen from outside; mullions go through the wall.
  _whWindows(zc, t, wins, y0, y1) {
    const E = this._E;
    const T = E.T;
    this._whInit();
    const DAY = this._newAcc('flat');
    const FRM = '#3E454B';
    const hh = (y1 - y0) / 2, ym = (y0 + y1) / 2, d = t + 0.06;
    for (const w of wins) {
      const xm = (w[0] + w[1]) / 2, hw = (w[1] - w[0]) / 2;
      this._face(DAY, [xm, ym, zc + 0.02], [1, 0, 0], [0, 1, 0], hw, hh, '#FFFFFF', {});
      this._face('glass', [xm, ym, zc - 0.02], [-1, 0, 0], [0, 1, 0], hw, hh, '#FFFFFF', {});
      for (let k = 0; k <= 3; k++) this.box('flat', w[0] + (k * 2 * hw) / 3, y0, zc, k % 3 ? 0.06 : 0.1, y1 - y0, d, FRM, { noAO: true });
      for (let j = 0; j <= 4; j++) this.box('flat', xm, y0 + (j * (y1 - y0)) / 4 - (j === 4 ? 0.08 : 0), zc, 2 * hw, j % 4 ? 0.05 : 0.08, d, FRM, { noAO: true });
      this.box('flat', xm, y0 - 0.06, zc + t / 2 + 0.12, 2 * hw + 0.1, 0.06, 0.26, '#C9CED2', { noAO: true });
      // daylight spill on the floor inside
      const A = E.wh.spillAcc;
      if (A) { const y = 0.127, z0 = zc + 0.3, z1 = zc + 4.6; this._quad(A, [w[0] - 0.4, y, z1], [w[1] + 0.4, y, z1], [w[1] + 0.4, y, z0], [w[0] - 0.4, y, z0], [0, 1, 0], [0, 0, 1, 1], '#FFFFFF', false); }
    }
    if (DAY.vc) this._addDyn(new T.Mesh(this._accGeo(DAY), this._cxDayMat('#E9F2F6', 0.1)));
  },

  // ================================================================ THE BAY
  // returns extra interior lamps for the mill's light list
  _whBuild(R) {
    const E = this._E;
    const T = E.T;
    const W = this._whInit();
    const F = 0.12;
    // epoxy floor + boundary line
    const fx0 = -333.3, fx1 = -308.3, fz0 = -333.7, fz1 = -298.3;
    this.plane('whEpoxy', (fx0 + fx1) / 2, F + 0.002, (fz0 + fz1) / 2, fx1 - fx0, fz1 - fz0, '#FFFFFF');
    this.box('paint', fx0 + 0.08, F, (fz0 + fz1) / 2, 0.12, 0.012, fz1 - fz0, '#F2C21B');
    // racks: two back-to-back rows north–south (aisle down the middle), one row along the east wall
    const LV = [1.65, 3.25, 4.85];
    for (const x of [-324.95, -323.65, -317.65, -316.35]) this._whRack(x, -329.55, 2, LV, 5.6, R, 0.8);
    this._whRack(-309.1, -333.2, 7, LV, 5.6, R, 0.72, ['4:1:1']);
    // column guards at the row ends facing the lane
    for (const x of [-325.45, -323.15, -318.15, -315.85]) {
      this.box('whPaint', x, F, -324.05, 0.16, 0.4, 0.16, '#F2B705');
      this.box('whPaint', x, F + 0.12, -324.05, 0.165, 0.06, 0.165, '#17181A');
    }
    // floor pallets of rice sacks and cartons west of the racks
    for (const p of [[-330.4, -328.2, 'sack'], [-328.3, -328.2, 'sack'], [-330.4, -325.8, 'carton'], [-328.3, -325.8, 'sack']]) {
      this._whLoad(p[0], F, p[1], p[2], R, true);
      this._whShadow(p[0], p[1], 1.25, 1.45);
    }
    this._col(-331.05, -328.85, -327.65, -325.15);
    // conveyor under the windows + pallet being built at its end
    this._whConveyor(-330.6, -312.4, -332.0, R);
    this._whLoad(-311.15, F, -332.0, 'carton', R, true, 2);
    this._whShadow(-311.15, -332.0, 1.25, 1.45);
    this._col(-311.8, -332.65, -310.5, -331.35);
    E.crowdSpots.push({ x: -312.3, z: -330.75, yaw: Math.PI * 0.85, mode: 'work', outfit: 'worker' });
    E.crowdSpots.push({ x: -321.0, z: -330.6, yaw: Math.PI, mode: 'stand', outfit: 'worker' });
    // floor graphics: hatching, arrows, SHIPPING text
    const H = this._newAcc('flat');
    const hatch = (x0, z0, x1, z1) => {
      const y = F + 0.006;
      this._quad(H, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [0, 1, 0], [x0 / 0.5, z0 / 0.5, x1 / 0.5, z1 / 0.5], '#FFFFFF', false);
    };
    hatch(-330.6, -330.95, -312.4, -330.7);
    hatch(-312.0, -333.5, -310.3, -330.7);
    hatch(-332.05, -319.05, -328.0, -318.75);
    W.hatchMesh = this._addDyn(new T.Mesh(this._accGeo(H), W.hatchMat));
    W.hatchMesh.receiveShadow = true;
    const AR = this._newAcc('flat');
    const arrow = (x, z, ang, s) => {
      const y = F + 0.007, c = Math.cos(ang), n = Math.sin(ang), h = (s || 1) * 0.55;
      const p = (lx, lz) => [x + lx * c - lz * n, y, z + lx * n + lz * c];
      this._quad(AR, p(-h, h), p(h, h), p(h, -h), p(-h, -h), [0, 1, 0], [0, 0, 1, 1], '#FFFFFF', false);
    };
    // chevrons point along the travel direction: east in the forklift lane, south in the aisles
    for (const x of [-322.8, -318.4, -314.0]) arrow(x, -320.41, Math.PI / 2);
    arrow(-320.7, -326.6, 0);
    arrow(-312.7, -326.0, 0); arrow(-312.7, -316.0, 0);
    W.arrowMesh = this._addDyn(new T.Mesh(this._accGeo(AR), W.arrowMat));
    W.arrowMesh.receiveShadow = true;
    const txt = new T.Mesh(new T.PlaneGeometry(4.6, 0.99), W.textMat);
    txt.rotation.x = -Math.PI / 2;
    txt.position.set(-318.6, F + 0.008, -330.05);
    txt.receiveShadow = true;
    this._addDyn(txt);
    // forklift (stop 10 subject): bagging line (west) -> east-wall rack, first beam
    this._whForkliftRun(-325.9, -309.1 - (0.97 + 0.62), -320.41, LV[0]);
    // lamps over the bay
    return [[-320.5, 7.8, -327.5, '#FFF4E2', 1.7, 26], [-312.0, 7.8, -324.0, '#FFF4E2', 1.5, 24]];
  },
  // after all static parts: merge the contact shadows and window light spill into one mesh each
  _whFlush() {
    const E = this._E;
    const T = E.T;
    const W = E.wh;
    if (!W) return;
    for (const k of ['shadowAcc', 'spillAcc']) {
      const A = W[k];
      if (!A || !A.vc) continue;
      const m = new T.Mesh(this._accGeo(A), k === 'shadowAcc' ? W.shadowMat : W.spillMat);
      m.renderOrder = 1;
      this._addDyn(m);
    }
  }
};
