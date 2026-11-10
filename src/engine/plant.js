/* GHG Town 3D v1.2 — detailed plant rooms. Shared fittings (clad pipes with flanges, valves, gauges, cable tray)
   and the husk-fired boiler house of the rice mill (stop 9), called from complexes._bMill().
   Textures are drawn once on canvases; static parts go into the merged buckets, the fire is a small animated mesh. */
GHG3.plant = {
  _plInit() {
    const E = this._E;
    const T = E.T;
    if (E.pl) return E.pl;
    this._whInit();
    const R = this._rng(9090);
    const P = E.pl = { gauges: this._newAcc('flat'), screens: this._newAcc('flat') };
    const std = (o) => new T.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.85, metalness: 0 }, o));
    // aluminium cladding: overlapping sheets (seams along u-constant lines) and strap bands
    const clad = this._canvasTex(512, 512, (g) => {
      g.fillStyle = '#D9DEE2'; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 3000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'; g.fillRect(R() * 512, R() * 512, 1, 6 + R() * 20); }
      for (let x = 0; x < 512; x += 128) {
        const gr = g.createLinearGradient(x, 0, x + 14, 0);
        gr.addColorStop(0, 'rgba(60,66,72,0.55)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(x, 0, 14, 512);
      }
      for (let y = 0; y < 512; y += 256) { g.fillStyle = 'rgba(70,76,82,0.45)'; g.fillRect(0, y, 512, 3); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, y + 3, 512, 2); }
    }, { repeat: true });
    // stained concrete floor (ash and oil near the plant)
    const conc = this._canvasTex(1024, 1024, (g) => {
      g.fillStyle = '#9C9890'; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 60; i++) {
        const x = R() * 1024, y = R() * 1024, r = 40 + R() * 160, a = 0.04 + R() * 0.07, dark = R() < 0.7;
        for (const ox of [-1024, 0, 1024]) for (const oy of [-1024, 0, 1024]) {
          const rg = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
          rg.addColorStop(0, dark ? 'rgba(40,36,30,' + a + ')' : 'rgba(255,255,255,' + a * 0.6 + ')'); rg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = rg; g.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r);
        }
      }
      for (let i = 0; i < 30000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'; g.fillRect(R() * 1024, R() * 1024, 1.5, 1.5); }
      g.strokeStyle = 'rgba(40,38,34,0.25)'; g.lineWidth = 1.2;
      for (let i = 0; i < 9; i++) { let x = R() * 1024, y = R() * 1024; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (R() - 0.5) * 70; y += 20 + R() * 40; g.lineTo(x, y); } g.stroke(); }
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, 1024, 3); g.fillRect(0, 0, 3, 1024);
    }, { repeat: true });
    // retail packaging: 2 x 2 pack fronts drawn dark-on-white, so each product's own colour shows as the print base
    const goods = this._canvasTex(512, 512, (g) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 512, 512);
      const fonts = '"IBM Plex Sans Thai", "Noto Sans Thai", sans-serif';
      const words = [['กรอบ', 'SNACK'], ['นมสด', 'MILK'], ['บะหมี่', 'NOODLE'], ['ขนม', 'CRISPY']];
      for (let i = 0; i < 4; i++) {
        const ox = (i % 2) * 256, oy = ((i / 2) | 0) * 256;
        g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(ox, oy + 182, 256, 48);
        g.fillStyle = 'rgba(255,255,255,0.0)';
        g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 6; g.beginPath(); g.arc(ox + 70, oy + 92, 38, 0, Math.PI * 2); g.stroke();
        g.fillStyle = 'rgba(0,0,0,0.6)'; g.font = '700 46px ' + fonts; g.fillText(words[i][0], ox + 118, oy + 92, 130);
        g.font = '600 26px ' + fonts; g.fillText(words[i][1], ox + 120, oy + 126, 126);
        g.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 0; k < 3; k++) g.fillRect(ox + 20, oy + 150 + k * 9, 120 + R() * 90, 4);
        g.fillStyle = 'rgba(0,0,0,0.75)'; g.font = '700 30px ' + fonts; g.fillText((10 + ((R() * 80) | 0)) + '.-', ox + 150, oy + 218);
        g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(ox, oy, 256, 10); g.fillRect(ox, oy, 8, 256);
      }
    }, { repeat: true, text: true });
    // drink bottle: dark cap, clear shoulder, printed label band (cylinder uv: v up the bottle)
    const bottle = this._canvasTex(128, 256, (g) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 128, 256);
      g.fillStyle = '#26292C'; g.fillRect(0, 0, 128, 26);
      g.fillStyle = 'rgba(255,255,255,0.0)';
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 26, 128, 40);
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 96, 128, 6); g.fillRect(0, 170, 128, 6);
      g.font = '700 30px "Prompt", sans-serif'; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillText('COLA', 14, 146);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 230, 128, 26);
    }, { text: true });
    E.BK.plClad = { mat: std({ map: clad, roughness: 0.36, metalness: 0.55 }), tw: 1, th: 1, cast: true, name: 'plClad' };
    E.BK.plGoods = { mat: std({ map: goods, roughness: 0.55 }), tw: 0.5, th: 0.5, cast: true, name: 'plGoods' };
    // gas-cylinder labels (wrap once round the cylinder)
    const label = (ink, big, th) => this._canvasTex(512, 96, (g) => {
      g.fillStyle = '#F7F7F2'; g.fillRect(0, 0, 512, 96);
      g.fillStyle = ink; g.fillRect(0, 0, 512, 12); g.fillRect(0, 84, 512, 12);
      for (const ox of [0, 256]) {
        g.fillStyle = ink; g.font = '700 40px "Prompt", sans-serif'; g.fillText(big, ox + 14, 62);
        g.fillStyle = '#222'; g.font = '600 20px "IBM Plex Sans Thai", sans-serif'; g.fillText(th, ox + 104, 46, 140);
        g.font = '500 14px "IBM Plex Mono", monospace'; g.fillText('MEDICAL · 2.2', ox + 104, 68);
      }
    }, { text: true });
    E.BK.plLabN = { mat: std({ map: label('#2F64B3', 'N₂O', 'ไนตรัสออกไซด์'), roughness: 0.5 }), tw: 1, th: 1, cast: true, name: 'plLabN' };
    E.BK.plLabO = { mat: std({ map: label('#2E7D32', 'O₂', 'ออกซิเจน'), roughness: 0.5 }), tw: 1, th: 1, cast: true, name: 'plLabO' };
    E.BK.plLabL = { mat: std({ map: label('#C62828', 'LPG', 'ก๊าซหุงต้ม 48 kg'), roughness: 0.5 }), tw: 1, th: 1, cast: true, name: 'plLabL' };
    E.BK.plBottle = { mat: std({ map: bottle, roughness: 0.22, metalness: 0.05 }), tw: 1, th: 1, cast: true, name: 'plBottle' };
    E.BK.plConc = { mat: std({ map: conc, roughness: 0.82, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), tw: 5, th: 5, cast: false, name: 'plConc' };
    // pressure gauge dial
    P.gaugeMat = new T.MeshStandardMaterial({ roughness: 0.25, map: this._canvasTex(128, 128, (g) => {
      g.fillStyle = '#F6F6F2'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
      g.lineWidth = 6; g.strokeStyle = '#2E9E4F'; g.beginPath(); g.arc(64, 64, 50, Math.PI * 0.75, Math.PI * 1.75); g.stroke();
      g.strokeStyle = '#D32F2F'; g.beginPath(); g.arc(64, 64, 50, Math.PI * 1.75, Math.PI * 2.25); g.stroke();
      g.strokeStyle = '#222'; g.lineWidth = 2;
      for (let k = 0; k <= 10; k++) { const a = Math.PI * 0.75 + k * Math.PI * 0.15; g.beginPath(); g.moveTo(64 + Math.cos(a) * 42, 64 + Math.sin(a) * 42); g.lineTo(64 + Math.cos(a) * 54, 64 + Math.sin(a) * 54); g.stroke(); }
      g.strokeStyle = '#C62828'; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(Math.PI * 1.55) * 46, 64 + Math.sin(Math.PI * 1.55) * 46); g.stroke();
      g.fillStyle = '#222'; g.beginPath(); g.arc(64, 64, 6, 0, Math.PI * 2); g.fill();
      g.font = '700 14px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillText('bar', 64, 96);
    }) });
    // control-room screen: boiler mimic with live-looking values
    P.screenMat = new T.MeshBasicMaterial({ toneMapped: false, map: this._canvasTex(320, 200, (g) => {
      g.fillStyle = '#0E2233'; g.fillRect(0, 0, 320, 200);
      g.fillStyle = '#16364F'; g.fillRect(0, 0, 320, 26);
      g.fillStyle = '#BFE3FF'; g.font = '600 15px "IBM Plex Sans Thai", sans-serif'; g.fillText('หม้อไอน้ำแกลบ  BOILER 01', 10, 18);
      g.strokeStyle = '#7FD1FF'; g.lineWidth = 3; g.strokeRect(40, 70, 150, 60);
      g.fillStyle = 'rgba(80,170,255,0.45)'; g.fillRect(43, 100, 144, 27);
      g.fillStyle = '#FF9A3D'; g.fillRect(14, 86, 22, 40);
      g.strokeStyle = '#9BE7A8'; g.beginPath(); g.moveTo(115, 70); g.lineTo(115, 44); g.lineTo(300, 44); g.stroke();
      g.font = '700 19px "IBM Plex Mono", monospace';
      g.fillStyle = '#7CFF9E'; g.fillText('8.2 bar', 210, 82);
      g.fillStyle = '#FFD54F'; g.fillText('176 °C', 210, 112);
      g.fillStyle = '#9FD3FF'; g.fillText('LV 62%', 210, 142);
      g.fillStyle = '#7CFF9E'; g.font = '600 13px "IBM Plex Sans Thai", sans-serif'; g.fillText('● เดินเครื่องปกติ', 14, 186);
    }, { text: true }) });
    return P;
  },

  // clad (insulated) pipe through points with flanges at the joints
  _plPipe(pts, r, col) {
    this.tube('plClad', pts, r, col || '#FFFFFF', 14);
    for (let i = 1; i < pts.length - 1; i++) this.sph('plClad', pts[i][0], pts[i][1], pts[i][2], r * 1.06, r * 1.06, r * 1.06, col || '#FFFFFF', 14);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
      if (L < 0.6) continue;
      const rot = Math.abs(dy) > Math.max(Math.abs(dx), Math.abs(dz)) ? [0, 0, 0] : (Math.abs(dx) > Math.abs(dz) ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]);
      for (const t of [0.12 / L, 1 - 0.12 / L]) this.cylR('flat', a[0] + dx * t, a[1] + dy * t, a[2] + dz * t, r * 1.35, 0.05, '#7E868C', rot[0], rot[1], rot[2], 14);
    }
  },
  // gate valve on a run along axis 'x' | 'z' | 'y' at (x,y,z): body, bonnet and red handwheel (wheel above, or toward +z for vertical runs)
  _plValve(x, y, z, axis, r) {
    const rot = axis === 'x' ? [0, 0, Math.PI / 2] : (axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]);
    this.cylR('whPaint', x, y, z, r * 1.5, r * 2.6, '#3B4148', rot[0], rot[1], rot[2], 14);
    this.sph('whPaint', x, y, z, r * 1.25, r * 1.25, r * 1.25, '#3B4148', 12);
    if (axis === 'y') {
      this.cylR('flat', x, y, z + r * 2.2, r * 0.32, r * 2.4, '#8C949A', Math.PI / 2, 0, 0, 8);
      this._gput('whPaint', 'torus16', x, y, z + r * 3.4, r * 1.6, r * 1.6, r * 1.6, 0, 0, 0, '#C62828');
    } else {
      this.cyl('flat', x, y + r, z, r * 0.32, r * 2.4, '#8C949A', 8);
      this._gput('whPaint', 'torus16', x, y + r * 3.4, z, r * 1.6, r * 1.6, r * 1.6, Math.PI / 2, 0, 0, '#C62828');
    }
  },
  // pressure gauge facing direction ry (0 = +z): bezel, dial, stem
  _plGauge(x, y, z, ry, r) {
    const P = this._E.pl;
    const fx = Math.sin(ry), fz = Math.cos(ry);
    this.cylR('shiny', x, y, z, r * 1.12, 0.05, '#AEB4B9', Math.PI / 2, 0, -ry, 18);
    this._face(P.gauges, [x + fx * 0.027, y, z + fz * 0.027], [Math.cos(ry), 0, -Math.sin(ry)], [0, 1, 0], r, r, '#FFFFFF', { tw: 2 * r, th: 2 * r });
    this.cylR('flat', x - fx * 0.08, y - r - 0.1, z - fz * 0.08, 0.018, 0.25, '#8C949A', 0, 0, 0, 6);
  },

  // ================================================================ BOILER HOUSE (stop 9)
  // room x0..x1 / z0..z1 (inner faces), eaves be. Furnace front faces +z at z -321 (stop 9's subject).
  _plBoilerRoom(x0, x1, z0, z1, be) {
    const E = this._E;
    const T = E.T;
    const P = this._plInit();
    const W = E.wh;
    const F = 0.12, STEEL = '#46545E', DARK = '#3D4248', BLUE = '#2F5E8C';
    // floor: stained concrete, walkway lines, hatched hot zone in front of the furnace
    this.plane('plConc', (x0 + x1) / 2, F + 0.002, (z0 + z1) / 2, x1 - x0, z1 - z0, '#FFFFFF');
    for (const z of [-316.3, -319.2]) this.box('paint', -297.5, F, z, 7.6, 0.012, 0.1, '#F2C21B');
    const H = this._newAcc('flat');
    const hy = F + 0.006;
    this._quad(H, [-306.1, hy, -319.85], [-301.4, hy, -319.85], [-301.4, hy, -320.9], [-306.1, hy, -320.9], [0, 1, 0], [-306.1 / 0.5, -320.9 / 0.5, -301.4 / 0.5, -319.85 / 0.5], '#FFFFFF', false);
    const hm = this._addDyn(new T.Mesh(this._accGeo(H), W.hatchMat));
    hm.receiveShadow = true;

    // ---------- furnace: steel casing, open fire door, sight glasses, husk hopper + screw on top
    const FX = -303.75, FZ = -324, FWd = 4.5, FDp = 6, FH = 3.9;
    this.box('whPaint', FX, F, FZ, FWd, FH, FDp, DARK);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) this.box('whPaint', FX + sx * (FWd / 2 - 0.04), F, FZ + sz * (FDp / 2 - 0.04), 0.14, FH + 0.04, 0.14, '#2A2E33');
    for (const y of [1.25, 2.55, 3.85]) this.box('whPaint', FX, F + y - 0.05, FZ, FWd + 0.04, 0.08, FDp + 0.04, '#2A2E33');
    for (const lx of [-1.2, 1.2]) this.box('whPaint', FX + lx, F, FZ + FDp / 2 + 0.01, 0.06, FH, 0.03, '#33383E');
    // door frame (refractory reveal) around the fire opening
    const DZ = FZ + FDp / 2;
    this.box('whPaint', FX, 0.56, DZ + 0.06, 1.7, 0.16, 0.14, '#24282C');
    this.box('whPaint', FX, 1.72, DZ + 0.06, 1.7, 0.18, 0.14, '#24282C');
    for (const sx of [-1, 1]) this.box('whPaint', FX + sx * 0.77, 0.56, DZ + 0.06, 0.16, 1.34, 0.14, '#24282C');
    this.box('brick', FX, 1.62, DZ + 0.05, 1.36, 0.1, 0.1, '#D9A07A');
    // open door leaf, hinged on the west jamb
    const hx = FX - 0.86, ph = -1.75;
    this.boxR('whPaint', hx + Math.cos(ph) * 0.7, 1.15, DZ + 0.12 - Math.sin(ph) * 0.7, 1.4, 1.12, 0.1, '#2A2D30', 0, ph, 0);
    this.boxR('flat', hx + Math.cos(ph) * 0.7 + 0.045, 1.15, DZ + 0.12 - Math.sin(ph) * 0.7 - 0.008, 1.2, 0.92, 0.04, '#C8A47E', 0, ph, 0);
    for (const y of [0.78, 1.52]) this.cyl('flat', hx, y - 0.07, DZ + 0.12, 0.05, 0.14, '#1C1E20', 8);
    // ash door (closed) under the fire door
    this.box('whPaint', FX, F + 0.05, DZ + 0.03, 1.2, 0.34, 0.06, '#2A2D30');
    this.cylR('flat', FX + 0.45, F + 0.22, DZ + 0.1, 0.02, 0.14, '#8C949A', Math.PI / 2, 0, 0, 6);
    // sight glasses
    for (const px of [FX - 1.45, FX + 1.45]) { this.cylR('flat', px, 2.75, DZ + 0.03, 0.11, 0.06, '#24282C', Math.PI / 2, 0, 0, 14); this.cylR('glow', px, 2.75, DZ + 0.065, 0.065, 0.01, '#FF9A3D', Math.PI / 2, 0, 0, 12); }
    this._sign('อันตราย ความร้อนสูง', 2.2, 0.4, '#F7C51E', '#1A1A1A', [FX, 2.2, DZ + 0.04], 0, { border: '#1A1A1A', size: 0.6 });
    // husk hopper, rotary valve and geared motor on the furnace roof
    this._cxHopper('whPaint', FX + 0.4, F + FH + 1.1, FZ - 1.2, 1.5, 0.9, 0.85, '#6B7A86');
    this.cyl('whPaint', FX + 0.4, F + FH + 0.02, FZ - 1.2, 0.28, 0.26, '#4A5258', 14);
    this._cxMotor(FX - 0.6, F + FH + 0.3, FZ - 1.2, 'x', 0.55, 0.17, '#2F6EA8');
    this._cxRail('x', FZ + 1.6, FX - 2.1, FX + 2.1, F + FH, '#F2B705');
    // fire (flickers) + warm pool of light on the floor
    const fireTex = this._canvasTex(128, 128, (g, Wd, Ht) => {
      const gr = g.createLinearGradient(0, Ht, 0, 0);
      gr.addColorStop(0, '#FFF6C2'); gr.addColorStop(0.35, '#FFB13B'); gr.addColorStop(0.75, '#F06A22'); gr.addColorStop(1, '#B8320E');
      g.fillStyle = gr; g.fillRect(0, 0, Wd, Ht);
      const R2 = this._rng(31);
      for (let k = 0; k < 14; k++) {
        const x = R2() * Wd, w = 8 + R2() * 18, h = Ht * (0.35 + R2() * 0.5);
        const fg = g.createLinearGradient(0, Ht, 0, Ht - h);
        fg.addColorStop(0, 'rgba(255,250,210,0.9)'); fg.addColorStop(1, 'rgba(255,140,40,0)');
        g.fillStyle = fg; g.beginPath(); g.moveTo(x - w, Ht); g.quadraticCurveTo(x - w * 0.3, Ht - h * 0.6, x, Ht - h); g.quadraticCurveTo(x + w * 0.3, Ht - h * 0.6, x + w, Ht); g.fill();
      }
    }, { repeat: true });
    const fireMat = new T.MeshBasicMaterial({ map: fireTex, color: 0xffffff, toneMapped: false });
    const fire = new T.Mesh(new T.PlaneGeometry(1.36, 1.02), fireMat);
    fire.position.set(FX, 1.15, DZ + 0.04);
    this._addDyn(fire);
    const ember = new T.Mesh(new T.PlaneGeometry(1.0, 0.2), new T.MeshBasicMaterial({ color: 0xffe08a, toneMapped: false }));
    ember.position.set(FX, 0.76, DZ + 0.045);
    this._addDyn(ember);
    const poolMat = new T.MeshBasicMaterial({ map: E.tex.glow, color: this._lcol('#FF8A3D'), transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false });
    const pool = new T.Mesh(new T.PlaneGeometry(3.4, 2.8).rotateX(-Math.PI / 2), poolMat);
    pool.position.set(FX, 0.135, DZ + 1.2);
    this._addDyn(pool);
    this._anim((dt, t) => {
      const f = 0.78 + 0.16 * Math.sin(t * 13.1) * Math.sin(t * 7.3 + 1) + 0.08 * Math.sin(t * 23.7);
      fireMat.color.setRGB(f, f * 0.92, f * 0.85);
      fireTex.offset.x = (t * 0.37) % 1;
      fireTex.offset.y = 0.04 * Math.sin(t * 9.0);
      poolMat.opacity = 0.32 + 0.22 * f;
    });
    // ash pile, shovel and a steel ash cart
    this.sph('flat', -301.9, F, -320.25, 0.62, 0.26, 0.45, '#4A4846', 12);
    this.boxR('flat', -301.2, 0.75, -320.0, 0.04, 1.2, 0.04, '#7B5B3A', 0.2, 0, -0.35);
    this.boxR('flat', -300.96, 0.18, -319.95, 0.22, 0.02, 0.28, '#5E666C', 0.2, 0, -0.35);
    this.box('whPaint', -299.9, 0.34, -319.55, 0.95, 0.42, 0.62, '#5E6A72');
    for (const wx of [-300.3, -299.5]) for (const wz of [-319.88, -319.22]) this.cylR('flat', wx, 0.24, wz, 0.12, 0.06, '#1C1C1C', Math.PI / 2, 0, 0, 12);
    this.cylR('flat', -299.25, 0.72, -319.55, 0.02, 0.7, '#8C949A', Math.PI / 2, 0, 0, 6);

    // ---------- boiler: clad shell with dished ends, straps, saddles, mountings
    const BXc = -296.75, BY = 2.35, BZc = -324, BR = 1.35, BL = 8.6;
    this.box('brick', -301.25, 1.6, BZc, 0.6, 1.6, 1.6, '#FFFFFF');
    this.cylR('plClad', BXc, BY, BZc, BR, BL, '#FFFFFF', 0, 0, Math.PI / 2, 36);
    for (const s of [-1, 1]) this.sph('plClad', BXc + s * BL / 2, BY, BZc, 0.3, BR, BR, '#E9EDF0', 28);
    for (const bx of [-300.3, -298.2, -296.1, -294.0]) this.cylR('flat', bx, BY, BZc, BR + 0.014, 0.06, '#8C949A', 0, 0, Math.PI / 2, 36);
    for (const sx of [-299.4, -294.2]) {
      this.box('whPaint', sx, F, BZc, 0.42, 1.0, 2.3, BLUE);
      this.box('whPaint', sx, F, BZc, 0.7, 0.08, 2.6, '#26496E');
    }
    this.box('flat', -298.9, 1.85, BZc + BR - 0.02, 0.62, 0.36, 0.03, '#C9A227');
    // top: manhole, main steam valve + riser, two safety valves with vent pipes through the roof
    this.cyl('plClad', -295.0, BY + BR - 0.05, BZc, 0.3, 0.22, '#FFFFFF', 18);
    this.cyl('whPaint', -295.0, BY + BR + 0.17, BZc, 0.33, 0.05, '#3B4148', 18);
    this._plValve(-297.3, BY + BR + 0.35, BZc, 'y', 0.11);
    this._plPipe([[-297.3, BY + BR + 0.6, BZc], [-297.3, 4.65, BZc - 2.2], [-297.3, 4.65, -328.4]], 0.11);
    for (const vx of [-299.4, -298.7]) {
      this.cyl('whPaint', vx, BY + BR - 0.05, BZc + 0.2, 0.09, 0.42, '#3B4148', 12);
      this.cyl('whPaint', vx, BY + BR + 0.37, BZc + 0.2, 0.06, 0.14, '#F2C21B', 12);
      this.cyl('flat', vx, BY + BR + 0.5, BZc + 0.2, 0.05, be + 2.6 - (BY + BR + 0.5), '#6E767C', 10);
    }
    // gauges and water-level glasses on the north side, facing the doorway
    this._plPipe([[-300.7, BY + 0.9, BZc + BR - 0.25], [-300.7, BY + 1.15, BZc + BR + 0.12]], 0.025, '#C9CED2');
    this._plGauge(-300.7, BY + 1.42, BZc + BR + 0.14, 0, 0.17);
    for (const lx of [-300.15, -299.75]) {
      this.box('whPaint', lx, BY - 0.42, BZc + BR - 0.08, 0.12, 0.08, 0.2, '#2A2E32');
      this.box('whPaint', lx, BY + 0.58, BZc + BR - 0.08, 0.12, 0.08, 0.2, '#2A2E32');
      this.box('glow', lx, BY - 0.34, BZc + BR + 0.03, 0.035, 0.92, 0.035, '#7FD3FF');
      this.box('flat', lx, BY - 0.34, BZc + BR + 0.05, 0.08, 0.92, 0.01, '#1E2226');
    }
    // smoke box (rear) + flue duct through the east wall to the ID fan and chimney outside
    this.box('whPaint', -291.95, 0.9, BZc, 0.9, 2.95, 2.6, '#3B4045');
    this.cylR('flat', -292.2, 3.15, BZc + 1.33, 0.24, 0.05, '#F4F4F4', Math.PI / 2, 0, 0, 16);
    this.box('whPaint', -290.1, 3.3, BZc, 3.9, 1.0, 1.0, '#4A4F55');
    this.box('whPaint', -291.95, 3.85, BZc, 0.9, 0.9, 1.0, '#4A4F55');
    this.box('whPaint', -285.6, 3.3, BZc, 4.8, 1.0, 1.0, '#4A4F55');
    this.cylR('whPaint', -285.6, 1.5, BZc, 0.95, 0.75, '#3E6E94', Math.PI / 2, 0, 0, 24);
    this.box('concrete', -285.6, 0, BZc, 2.2, 0.55, 1.8, '#BDB8AE');
    this._cxMotor(-285.6, 1.05, BZc + 1.4, 'z', 0.8, 0.32);
    this._col(-286.8, -325.1, -284.4, -322.0);
    // blowdown line to a vented blowdown tank
    this._plPipe([[-293.4, 1.0, BZc], [-293.4, 0.45, BZc - 1.6], [-290.0, 0.45, -327.4]], 0.05, '#C9CED2');
    this._plValve(-293.4, 0.45, BZc - 1.0, 'z', 0.05);
    this.cyl('whPaint', -290.0, F, -327.6, 0.45, 1.6, '#5E666C', 18);
    this.cyl('flat', -290.0, F + 1.6, -327.6, 0.08, be + 2.2 - F - 1.6, '#6E767C', 10);
    this._col(-290.5, -328.1, -289.5, -327.1);

    // ---------- steam header with branch valves and a gauge, wall brackets, line to the mill
    this._plPipe([[-307.9, 4.65, -328.4], [-292.75, 4.65, -328.4]], 0.18);
    for (const vx of [-302.5, -298.5, -294.5]) {
      this._plValve(vx, 4.65 + 0.32, -328.4, 'y', 0.07);
      this.cyl('plClad', vx, 4.65 + 0.12, -328.4, 0.08, 0.12, '#FFFFFF', 10);
    }
    this._plGauge(-296.0, 5.05, -328.12, 0, 0.16);
    for (const bx of [-306, -301, -296, -293]) { this.box('whPaint', bx, 4.38, -329.05, 0.08, 0.08, 1.3, STEEL); this.box('whPaint', bx, 4.38, -329.6, 0.12, 0.6, 0.06, STEEL); }

    // ---------- feedwater: clad tank on a stand, two pump sets, softeners with valve heads, brine tank
    for (const lx of [-292.2, -289.4]) for (const lz of [-319.1, -318.1]) this.box('whPaint', lx, F, lz, 0.1, 2.0, 0.1, STEEL);
    this.box('whPaint', -290.8, 2.0, -318.6, 3.0, 0.1, 1.2, STEEL);
    this.cylR('plClad', -290.8, 2.78, -318.6, 0.65, 2.6, '#FFFFFF', 0, 0, Math.PI / 2, 24);
    for (const s of [-1, 1]) this.sph('plClad', -290.8 + s * 1.3, 2.78, -318.6, 0.16, 0.65, 0.65, '#E9EDF0', 18);
    for (const pz of [-320.7, -321.6]) {
      this.box('concrete', -291.2, 0, pz, 1.5, 0.22, 0.6, '#BDB8AE');
      this._cxMotor(-290.8, 0.5, pz, 'x', 0.6, 0.2, '#2F6EA8');
      this.cylR('whPaint', -291.6, 0.5, pz, 0.2, 0.3, '#5E666C', 0, 0, Math.PI / 2, 14);
      this.tube('whPaint', [[-291.6, 0.5, pz], [-292.6, 0.5, pz], [-292.6, 1.5, pz]], 0.04, '#2E7D4F', 8);
    }
    this.tube('whPaint', [[-290.8, 2.2, -318.6], [-291.6, 0.5, -319.9], [-291.6, 0.5, -320.7]], 0.05, '#2E7D4F', 8);
    this.tube('whPaint', [[-292.6, 1.5, -321.6], [-292.6, 1.5, -322.4], [-293.6, 1.5, -322.6]], 0.05, '#2E7D4F', 8);
    this._col(-292.05, -322.0, -290.35, -320.3);
    for (const sx of [-291.4, -290.5]) {
      this.cyl('whPaint', sx, F, -316.2, 0.32, 1.7, '#2E5FA8', 18);
      this.sph('whPaint', sx, F + 1.7, -316.2, 0.32, 0.12, 0.32, '#2E5FA8', 14);
      this.box('whPaint', sx, F + 1.82, -316.2, 0.26, 0.2, 0.22, '#E8EAEC');
      this.box('glow', sx + 0.07, F + 1.92, -316.08, 0.06, 0.04, 0.01, '#7CFF9E');
    }
    this.cyl('whPaint', -289.4, F, -315.9, 0.4, 1.1, '#E8EAEC', 18);
    this._col(-292.4, -319.4, -288.3, -315.4);

    // ---------- control panel with screen, gauges, lamps and an emergency stop (west wall)
    const CXp = -307.45, CZp = -317.4;
    this.box('whPaint', CXp, F, CZp, 0.55, 2.1, 2.2, '#C9CED2');
    this.box('whPaint', CXp, F, CZp, 0.6, 0.1, 2.25, '#4A5258');
    this.box('whPaint', CXp + 0.276, F + 0.15, CZp, 0.01, 1.85, 0.012, '#9AA1A6');
    this._face(P.screens, [CXp + 0.282, 1.55, CZp - 0.45], [0, 0, -1], [0, 1, 0], 0.36, 0.225, '#FFFFFF', { tw: 0.72, th: 0.45 });
    this.box('whPaint', CXp + 0.28, 1.31, CZp - 0.45, 0.02, 0.5, 0.78, '#2A2E32', { skip: 'px' });
    for (let j = 0; j < 5; j++) this.box('glow', CXp + 0.282, 1.08, CZp + 0.2 + j * 0.16, 0.01, 0.06, 0.06, ['#5CFF7A', '#5CFF7A', '#FFD54F', '#FF5A4A', '#5CFF7A'][j]);
    this._plGauge(CXp + 0.3, 1.62, CZp + 0.38, Math.PI / 2, 0.12);
    this._plGauge(CXp + 0.3, 1.62, CZp + 0.72, Math.PI / 2, 0.12);
    this.cylR('flat', CXp + 0.31, 1.25, CZp + 0.85, 0.05, 0.05, '#D32F2F', 0, 0, Math.PI / 2, 14);
    this.box('flat', CXp + 0.29, 1.22, CZp + 0.85, 0.02, 0.12, 0.12, '#F2C21B');
    this._col(CXp - 0.3, CZp - 1.15, CXp + 0.32, CZp + 1.15);
    // cable tray along the west wall
    this.box('whPaint', -307.5, 5.6, -322, 0.35, 0.06, 14, '#9AA1A6');
    for (const s of [-1, 1]) this.box('whPaint', -307.5 + s * 0.17, 5.66, -322, 0.02, 0.1, 14, '#9AA1A6');
    for (let k = 0; k < 4; k++) this.cylR('flat', -307.58 + k * 0.05, 5.7, -322, 0.016, 14, ['#1E1E1E', '#2E5FA8', '#1E1E1E', '#C62828'][k], Math.PI / 2, 0, 0, 6);

    // ---------- walls: vent louvers (daylight), safety signs, fire extinguisher
    const DAY = this._newAcc('flat');
    for (const lz of [-327.0, -320.0]) {
      this._face(DAY, [x1 - 0.02, 5.9, lz], [0, 0, 1], [0, 1, 0], 0.9, 0.55, '#FFFFFF', {});
      for (let k = 0; k < 6; k++) this.boxR('whPaint', x1 - 0.06, 5.45 + k * 0.18, lz, 0.06, 0.16, 1.8, '#5E666C', 0, 0, -0.6);
      this.box('whPaint', x1 - 0.05, 5.3, lz, 0.08, 1.2, 0.06, '#4A5258');
    }
    for (const lx of [-300.5, -294.5]) {
      this._face(DAY, [lx, 5.9, z0 + 0.02], [1, 0, 0], [0, 1, 0], 0.9, 0.55, '#FFFFFF', {});
      for (let k = 0; k < 6; k++) this.boxR('whPaint', lx, 5.45 + k * 0.18, z0 + 0.06, 1.8, 0.16, 0.06, '#5E666C', 0.6, 0, 0);
    }
    this._addDyn(new T.Mesh(this._accGeo(DAY), this._cxDayMat('#EAF2F5', 0.1)));
    this._sign('สวมแว่นตาและถุงมือกันความร้อน', 2.6, 0.5, '#1565C0', '#FFFFFF', [-305.4, 2.6, z1 - 0.02], Math.PI, { size: 0.55 });
    this._sign('ห้ามสูบบุหรี่', 1.3, 0.42, '#C62828', '#FFFFFF', [-307.68, 2.6, -321.5], Math.PI / 2, { size: 0.6 });
    this.cyl('whPaint', -295.2, F, z1 - 0.3, 0.09, 0.56, '#C62828', 14);
    this.sph('whPaint', -295.2, F + 0.56, z1 - 0.3, 0.09, 0.05, 0.09, '#C62828', 10);
    this.cyl('flat', -295.2, F + 0.6, z1 - 0.3, 0.02, 0.1, '#1E1E1E', 6);
    this.box('flat', -295.2, F + 0.22, z1 - 0.21, 0.1, 0.14, 0.005, '#F4F4F4');
    this._sign('ถังดับเพลิง', 0.7, 0.24, '#C62828', '#FFFFFF', [-295.2, 1.45, z1 - 0.02], Math.PI, { size: 0.6 });
    for (const p of [[-303, -318], [-296, -318], [-296, -326]]) this.box('glow', p[0], 7.0, p[1], 1.25, 0.04, 0.12, '#F2F7FF');
    // colliders (furnace, boiler) and people
    this._col(-306.15, -327.15, -301.35, -320.85);
    this._col(-301.6, -325.45, -291.45, -322.55);
    E.crowdSpots.push({ x: -306.4, z: -317.4, yaw: -Math.PI / 2, mode: 'stand', outfit: 'worker' });
    this._plFlushDials(P.screenMat);
  },
  // gauge dials + screens placed so far become one mesh each; the accumulators start over for the next room
  _plFlushDials(screenMat) {
    const E = this._E;
    const T = E.T;
    const P = E.pl;
    if (P.gauges.vc) this._addDyn(new T.Mesh(this._accGeo(P.gauges), P.gaugeMat));
    if (P.screens.vc) this._addDyn(new T.Mesh(this._accGeo(P.screens), screenMat));
    P.gauges = this._newAcc('flat');
    P.screens = this._newAcc('flat');
  },

  // ================================================================ GENERATOR ROOM (stop 6)
  // room x0..x1 / z0..z1 (inner faces), floor top y0, ceiling gh. Genset axis north-south at gx (radiator north).
  _plGenRoom(x0, x1, z0, z1, y0, gh, gx) {
    const E = this._E;
    const T = E.T;
    const P = this._plInit();
    const F = y0, GC = '#2F5D3A', GC2 = '#264D30', DK = '#2C3134', STEEL = '#8A8F93';
    if (!P.genScreenMat) {
      P.genScreenMat = new T.MeshBasicMaterial({ toneMapped: false, map: this._canvasTex(320, 200, (g) => {
        g.fillStyle = '#0B1E14'; g.fillRect(0, 0, 320, 200);
        g.fillStyle = '#123A24'; g.fillRect(0, 0, 320, 28);
        g.fillStyle = '#C8FFD8'; g.font = '600 15px "IBM Plex Sans Thai", sans-serif'; g.fillText('เครื่องกำเนิดไฟฟ้าสำรอง  GEN 01', 10, 19);
        g.font = '700 22px "IBM Plex Mono", monospace';
        g.fillStyle = '#7CFF9E'; g.fillText('400 V', 16, 70); g.fillText('50.0 Hz', 168, 70);
        g.fillStyle = '#FFD54F'; g.fillText('1500 rpm', 16, 112);
        g.fillStyle = '#9FD3FF'; g.fillText('LOAD 38%', 168, 112);
        g.fillStyle = '#2E9E4F'; g.fillRect(16, 134, 288 * 0.38, 14); g.strokeStyle = '#7CFF9E'; g.strokeRect(16, 134, 288, 14);
        g.fillStyle = '#7CFF9E'; g.font = '600 13px "IBM Plex Sans Thai", sans-serif'; g.fillText('● เดินเครื่องจ่ายไฟให้โรงพยาบาล', 16, 182);
      }, { text: true }) });
      P.finMat = new T.MeshStandardMaterial({ roughness: 0.6, metalness: 0.4, map: this._canvasTex(256, 256, (g) => {
        g.fillStyle = '#3B4246'; g.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 4) { g.fillStyle = y % 8 ? '#262B2E' : '#56606A'; g.fillRect(0, y, 256, 2); }
        for (let x = 0; x < 256; x += 32) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, 0, 3, 256); }
      }, { repeat: true }) });
    }
    // floor + safety line round the set
    this.plane('plConc', (x0 + x1) / 2, F + 0.002, (z0 + z1) / 2, x1 - x0, z1 - z0, '#FFFFFF');
    const ln = (cx, cz, w, d) => this.box('paint', cx, F, cz, w, 0.012, d, '#F2C21B');
    ln(gx, 107.55, 3.4, 0.1); ln(gx, 116.0, 3.4, 0.1); ln(gx - 1.7, 111.78, 0.1, 8.5); ln(gx + 1.7, 111.78, 0.1, 8.5);

    // ---------- skid, mounts
    for (const sx of [-0.95, 0.95]) this.box('whPaint', gx + sx, F, 111.78, 0.16, 0.26, 6.85, DK);
    for (const z of [108.6, 110.4, 112.2, 114.0, 115.0]) this.box('whPaint', gx, F, z, 1.9, 0.18, 0.14, DK);
    for (const z of [109.6, 111.4, 113.3, 114.6]) for (const sx of [-0.62, 0.62]) {
      this.cyl('flat', gx + sx, F + 0.26, z, 0.11, 0.1, '#1A1A1A', 12);
      this.cyl('whPaint', gx + sx, F + 0.36, z, 0.13, 0.04, '#5E666C', 12);
    }
    // ---------- radiator (north end) with a spinning fan
    const RZ = 108.7;
    this.box('whPaint', gx, F + 0.26, RZ, 2.2, 2.35, 0.42, GC2);
    this._face(this._A('flat', gx, RZ), [gx, F + 1.43, RZ - 0.215], [-1, 0, 0], [0, 1, 0], 0.98, 1.05, '#FFFFFF', {});
    const finA = this._newAcc('flat');
    this._face(finA, [gx, F + 1.43, RZ - 0.22], [-1, 0, 0], [0, 1, 0], 0.97, 1.04, '#FFFFFF', { tw: 1.94, th: 2.08 });
    this._addDyn(new T.Mesh(this._accGeo(finA), P.finMat));
    this.cylR('whPaint', gx, F + 1.43, RZ + 0.32, 0.92, 0.22, '#1E2124', Math.PI / 2, 0, 0, 28);
    this.cyl('whPaint', gx, F + 2.61, RZ, 0.06, 0.08, '#C9A227', 10);
    const fan = new T.Group();
    fan.position.set(gx, F + 1.43, RZ + 0.36);
    this._bakeMesh((A) => {
      this.cylR(A, 0, 0, 0, 0.1, 0.12, '#2A2E32', Math.PI / 2, 0, 0, 14);
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; this.boxR(A, Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0, 0.78, 0.17, 0.02, '#2E3236', 0.35, 0, a); }
    }, { parent: fan });
    this._addDyn(fan);
    this._anim((dt) => { fan.rotation.z += dt * 18; });
    // fan guard ring + coolant hoses
    this._gput('whPaint', 'torus16', gx, F + 1.43, RZ + 0.47, 0.9, 0.9, 0.9, 0, 0, 0, '#3A4045');
    this.tube('flat', [[gx + 0.6, F + 2.3, RZ + 0.2], [gx + 0.6, F + 2.3, 109.7], [gx + 0.35, F + 2.05, 110.0]], 0.055, '#151515', 10);
    this.tube('flat', [[gx - 0.6, F + 0.6, RZ + 0.2], [gx - 0.6, F + 0.6, 109.6], [gx - 0.3, F + 0.75, 109.75]], 0.055, '#151515', 10);

    // ---------- engine: block, sump, head with six rocker covers, manifolds, turbo, filters, pulleys
    const EZ0 = 109.45, EZ1 = 112.75, EZc = (EZ0 + EZ1) / 2, EL = EZ1 - EZ0;
    this.box('whPaint', gx, F + 0.62, EZc, 0.95, 0.12, EL - 0.3, '#1E2124');
    this.box('whPaint', gx, F + 0.42, EZc, 0.8, 0.22, EL - 0.5, '#2A2E32');
    this.box('whPaint', gx, F + 0.74, EZc, 1.1, 1.0, EL, GC);
    this.box('whPaint', gx, F + 1.74, EZc, 0.86, 0.2, EL - 0.1, GC2);
    for (let k = 0; k < 6; k++) {
      const z = EZ0 + 0.3 + k * ((EL - 0.6) / 5);
      this.box('whPaint', gx, F + 1.94, z, 0.62, 0.17, 0.44, '#1F3A26');
      for (const sx of [-0.24, 0.24]) this.cyl('flat', gx + sx, F + 2.1, z, 0.025, 0.03, '#A0A7AC', 8);
    }
    for (let k = 0; k < 6; k++) this.box('whPaint', gx - 0.56, F + 1.0, EZ0 + 0.35 + k * 0.52, 0.03, 0.55, 0.36, '#3B6B48');
    this.cylR('whPaint', gx - 0.62, F + 1.62, EZc, 0.11, EL - 0.4, '#4A5258', Math.PI / 2, 0, 0, 12);
    this.cylR('flat', gx + 0.64, F + 1.55, EZc, 0.1, EL - 0.5, '#8A6E5A', Math.PI / 2, 0, 0, 12);
    for (let k = 0; k < 6; k++) this.cylR('flat', gx + 0.6, F + 1.55, EZ0 + 0.35 + k * 0.52, 0.07, 0.2, '#7A5E4C', 0, 0, Math.PI / 2, 10);
    // turbocharger near the front, exhaust elbow and bellows up to the roof pipe
    this._gput('flat', 'torus16', gx + 0.78, F + 1.92, 110.45, 0.2, 0.2, 0.2, 0, Math.PI / 2, 0, '#9A8F86');
    this.cylR('flat', gx + 0.78, F + 1.92, 110.45, 0.15, 0.3, '#B8B2AC', 0, 0, Math.PI / 2, 14);
    this.cylR('shiny', gx + 0.92, F + 1.92, 110.45, 0.12, 0.18, '#C9CED2', 0, 0, Math.PI / 2, 12);
    this.tube('shiny', [[gx + 0.7, F + 2.05, 110.45], [gx + 0.7, F + 2.4, 110.2], [gx + 0.7, F + 2.55, 110.0]], 0.13, STEEL, 12);
    for (let k = 0; k < 7; k++) this.cylR('shiny', gx + 0.7, F + 2.62 + k * 0.07, 110.0, 0.17, 0.04, '#B0B6BA', 0, 0, 0, 16);
    this._plPipe([[gx + 0.7, F + 3.15, 110.0], [gx + 0.7, gh + 0.02, 110.0]], 0.15);
    // air filter canister + intake pipe, fuel and oil filters, dipstick
    this.cylR('whPaint', gx - 0.42, F + 2.35, 111.9, 0.24, 0.62, '#1E2124', Math.PI / 2, 0, 0, 18);
    for (const s of [-1, 1]) this.cylR('whPaint', gx - 0.42, F + 2.35, 111.9 + s * 0.32, 0.26, 0.04, '#E0A21B', Math.PI / 2, 0, 0, 18);
    this.tube('flat', [[gx - 0.42, F + 2.35, 111.55], [gx - 0.1, F + 2.35, 111.2], [gx + 0.6, F + 2.1, 110.6]], 0.07, '#151515', 10);
    for (const z of [110.25, 110.55]) this.cyl('whPaint', gx - 0.66, F + 0.95, z, 0.06, 0.24, '#C9CED2', 12);
    this.cyl('whPaint', gx - 0.66, F + 0.85, 111.1, 0.075, 0.22, '#1565C0', 12);
    this.cyl('flat', gx - 0.5, F + 1.75, 112.2, 0.01, 0.4, '#C9CED2', 6);
    this.cylR('flat', gx - 0.5, F + 2.15, 112.2, 0.025, 0.02, '#F2C21B', 0, 0, 0, 8);
    // front pulleys + belt guard
    for (const p of [[0, 0.95, 0.2], [0.3, 1.5, 0.13], [-0.32, 1.42, 0.1]]) this.cylR('flat', gx + p[0], F + p[1], EZ0 - 0.05, p[2], 0.06, '#3A3F44', Math.PI / 2, 0, 0, 18);
    this.box('whPaint', gx, F + 0.85, EZ0 - 0.1, 0.9, 0.9, 0.04, '#F2B705');

    // ---------- alternator (south end): flywheel housing, vented body, terminal box, end cover
    const AZ0 = 112.75, AZ1 = 115.05;
    this.cylR('whPaint', gx, F + 1.14, AZ0 + 0.12, 0.86, 0.24, GC2, Math.PI / 2, 0, 0, 28);
    this.cylR('whPaint', gx, F + 1.14, (AZ0 + AZ1) / 2 + 0.1, 0.78, AZ1 - AZ0 - 0.3, GC, Math.PI / 2, 0, 0, 28);
    for (let k = 0; k < 4; k++) this.cylR('flat', gx, F + 1.14, AZ0 + 0.55 + k * 0.42, 0.795, 0.06, '#1F3A26', Math.PI / 2, 0, 0, 28);
    for (let k = 0; k < 10; k++) { const a = Math.PI * (0.15 + k * 0.07); this.boxR('flat', gx + Math.cos(a) * 0.79, F + 1.14 - Math.sin(a) * 0.25, AZ1 - 0.25, 0.03, 0.04, 0.32, '#15181A', 0, 0, 0); }
    this.cylR('whPaint', gx, F + 1.14, AZ1 - 0.02, 0.62, 0.08, '#3A4045', Math.PI / 2, 0, 0, 24);
    this.box('whPaint', gx, F + 1.9, AZ0 + 1.1, 0.7, 0.42, 0.75, GC2);
    this.box('flat', gx + 0.36, F + 1.95, AZ0 + 1.1, 0.01, 0.2, 0.3, '#C9CED2');
    for (let k = 0; k < 3; k++) this.cylR('flat', gx + 0.2 - k * 0.2, F + 2.35, AZ0 + 1.1, 0.045, 0.12, '#151515', 0, 0, 0, 10);
    // power cables up to the tray toward the switchboards
    for (let k = 0; k < 3; k++) this.tube('flat', [[gx + 0.2 - k * 0.2, F + 2.4, AZ0 + 1.1], [gx + 0.2 - k * 0.2, gh - 0.85, AZ0 + 1.1], [188.5, gh - 0.75, 114.6]], 0.035, '#151515', 8);
    this.box('whPaint', 188.5, gh - 0.75, 114.6, 5.8, 0.06, 0.45, '#9AA1A6');
    // genset controller on its stand + starting batteries
    this.box('whPaint', gx - 1.05, F + 0.26, 113.0, 0.08, 1.0, 0.08, DK);
    this.box('whPaint', gx - 1.05, F + 1.15, 113.0, 0.2, 0.46, 0.6, '#E0A21B');
    this._face(P.screens, [gx - 1.155, F + 1.42, 113.0], [0, 0, 1], [0, 1, 0], 0.2, 0.125, '#FFFFFF', { tw: 0.4, th: 0.25 });
    for (let j = 0; j < 4; j++) this.box('flat', gx - 1.155, F + 1.22, 112.82 + j * 0.12, 0.01, 0.05, 0.07, ['#2E9E4F', '#C62828', '#1E1E1E', '#1E1E1E'][j]);
    for (const z of [114.35, 114.85]) {
      this.box('flat', gx + 1.15, F + 0.26, z, 0.3, 0.26, 0.42, '#1A1A1A');
      this.cyl('flat', gx + 1.1, F + 0.52, z - 0.12, 0.025, 0.04, '#C62828', 8);
      this.cyl('flat', gx + 1.1, F + 0.52, z + 0.12, 0.025, 0.04, '#1E1E1E', 8);
    }
    this._col(gx - 1.2, 108.35, gx + 1.35, 115.2);

    // ---------- exhaust outside: silencer on roof brackets and the stack (smoke comes out on top)
    this.cylR('plClad', gx + 0.7, gh + 0.85, 111.4, 0.38, 2.7, '#FFFFFF', Math.PI / 2, 0, 0, 20);
    for (const sz of [110.5, 112.3]) this.box('whPaint', gx + 0.7, gh + 0.28, sz, 0.6, 0.5, 0.12, '#5C6166');
    this.cyl('shiny', gx + 0.7, gh + 0.85, 112.6, 0.14, 2.3, STEEL, 12);
    this.cone('flat', gx + 0.7, gh + 3.15, 112.6, 0.28, 0.18, '#5C6166', 12);
    this._emitter({ type: 'exhaust', pos: [gx + 0.7, gh + 3.3, 112.6], rate: 4, size: 0.9, rise: 1.4, spread: 0.25, life: 3.5, color: '#7A7C7E' });

    // ---------- switchboards (ATS / MDB) on the east wall: door seams, meters, lamps, screens, warnings
    for (let k = 0; k < 4; k++) {
      const z = 107.5 + k * 1.95, fx = x1 - 0.6;
      this.box('whPaint', x1 - 0.3, F, z, 0.6, 2.2, 1.88, '#C3C9CD');
      this.box('whPaint', x1 - 0.3, F, z, 0.64, 0.1, 1.92, '#4A5258');
      this.box('flat', fx - 0.005, F + 0.12, z, 0.01, 2.0, 0.012, '#8C949A');
      for (const dz of [-0.4, 0.4]) this.box('flat', fx - 0.02, F + 1.05, z + dz * 0.2 + (dz > 0 ? 0.06 : -0.06), 0.03, 0.18, 0.03, '#2A2E32');
      this._plGauge(fx - 0.03, F + 1.7, z - 0.5, -Math.PI / 2, 0.1);
      this._plGauge(fx - 0.03, F + 1.7, z - 0.22, -Math.PI / 2, 0.1);
      for (let j = 0; j < 3; j++) this.box('glow', fx - 0.012, F + 1.42, z + 0.25 + j * 0.15, 0.01, 0.06, 0.06, ['#5CFF7A', '#FF5A4A', '#FFD54F'][j]);
      this._sign('อันตราย ไฟฟ้า', 0.6, 0.2, '#F7C51E', '#1A1A1A', [fx - 0.012, F + 0.7, z], -Math.PI / 2, { border: '#1A1A1A', size: 0.6 });
    }
    this._face(P.screens, [x1 - 0.612, F + 1.6, 109.45 + 0.4], [0, 0, 1], [0, 1, 0], 0.24, 0.15, '#FFFFFF', { tw: 0.48, th: 0.3 });
    this._col(x1 - 0.65, 106.5, x1, 116.5);
    this._sign('บันทึกการเติมน้ำมันดีเซล', 1.7, 0.42, '#FFFFFF', '#1F2937', [x1 - 0.02, 2.85, 111.3], -Math.PI / 2, { size: 0.5 });
    // ---------- day tank in a yellow spill tray (south-east corner) + fuel lines + vent
    const TX = 189.1, TZ = 116.55;
    this.box('whPaint', TX, F, TZ, 1.3, 0.3, 2.3, '#E8B417');
    this.box('flat', TX, F + 0.04, TZ, 1.18, 0.02, 2.18, '#2A2E32');
    for (const lx of [-0.32, 0.32]) for (const lz of [-0.8, 0.8]) this.box('whPaint', TX + lx, F + 0.05, TZ + lz, 0.08, 0.5, 0.08, '#4A5258');
    this.box('whPaint', TX, F + 0.55, TZ, 0.92, 1.05, 1.9, '#5F7480');
    this.box('glow', TX - 0.47, F + 0.7, TZ - 0.55, 0.01, 0.8, 0.05, '#7AD2FF');
    this.cyl('whPaint', TX + 0.1, F + 1.6, TZ + 0.45, 0.09, 0.14, '#C62828', 12);
    this.cyl('flat', TX + 0.3, F + 1.6, TZ - 0.6, 0.03, gh - F - 1.6, '#6E767C', 8);
    this._sign('ถังน้ำมันดีเซล (Day Tank)', 1.25, 0.3, '#F7C51E', '#1F2937', [TX - 0.47, 1.92, TZ], -Math.PI / 2, { size: 0.55 });
    this._sign('ห้ามใช้ไฟ', 0.8, 0.26, '#C62828', '#FFFFFF', [TX - 0.47, 1.55, TZ + 0.5], -Math.PI / 2, { size: 0.6 });
    this.tube('flat', [[TX - 0.47, F + 0.7, TZ - 0.2], [TX - 1.2, F + 0.32, TZ - 0.6], [gx + 0.9, F + 0.32, 113.0], [gx + 0.66, F + 0.9, 112.4]], 0.025, '#1E1E1E', 6);
    this.tube('flat', [[TX - 0.47, F + 0.9, TZ + 0.1], [TX - 1.3, F + 0.36, TZ - 0.4], [gx + 0.95, F + 0.36, 113.2]], 0.02, '#E0A21B', 6);
    this._col(TX - 0.66, TZ - 1.16, TX + 0.66, TZ + 1.16);
    // ---------- by the door: CO2 extinguisher, hearing-protection sign
    this.cyl('whPaint', x0 + 0.35, F, 108.2, 0.1, 0.7, '#C62828', 14);
    this.sph('whPaint', x0 + 0.35, F + 0.7, 108.2, 0.1, 0.05, 0.1, '#C62828', 10);
    this.tube('flat', [[x0 + 0.35, F + 0.78, 108.2], [x0 + 0.45, F + 0.8, 108.35], [x0 + 0.48, F + 0.45, 108.4]], 0.018, '#1E1E1E', 6);
    this.cone('flat', x0 + 0.48, F + 0.3, 108.4, 0.05, 0.15, '#1E1E1E', 8);
    this._sign('สวมที่ครอบหูลดเสียง', 1.7, 0.42, '#1565C0', '#FFFFFF', [x0 + 0.02, 2.6, 107.6], Math.PI / 2, { size: 0.55 });
    this._plFlushDials(P.genScreenMat);
  }
};
