/* GHG Town 3D v1.2 — civic and utility stops in detail: the municipal office yard (septic tank 2, transformer and
   meter 3, staff motorbike shed 4, fire extinguishers 5), the contractor's tipper truck at the rice-mill intake (11)
   and the SF₆ breaker bay and power transformers of the substation (12).
   Called from world._wMunicipal(), world._wSubstation() and complexes._bMill(). Textures are canvases drawn once;
   dials, displays and paper notices are small decal meshes flushed per site with _cvFlush(). */
GHG3.civic = {
  _cvInit() {
    const E = this._E;
    const T = E.T;
    if (E.cv) return E.cv;
    this._plInit();
    const R = this._rng(7171);
    const C = E.cv = { acc: {}, mats: {} };
    const std = (o) => new T.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.85, metalness: 0 }, o));
    const TH = '"IBM Plex Sans Thai", "Noto Sans Thai", sans-serif', MONO = '"IBM Plex Mono", monospace';
    // draw at x,y and again across the tile edges so repeating textures stay seamless
    const wrap = (W, H, x, y, r, fn) => { for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) if (x + ox > -r && x + ox < W + r && y + oy > -r && y + oy < H + r) fn(x + ox, y + oy); };

    // precast septic lids, 3 cells (บ่อเกรอะ 1-3) mapped onto the discs cvDisc0..2
    const lid = this._canvasTex(768, 256, (g) => {
      for (let i = 0; i < 3; i++) {
        const ox = i * 256, cx = ox + 128;
        g.fillStyle = '#BDB9B0'; g.fillRect(ox, 0, 256, 256);
        for (let k = 0; k < 3000; k++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'; g.fillRect(ox + R() * 256, R() * 256, 1.5, 1.5); }
        for (let k = 0; k < 7; k++) {
          const x = ox + 30 + R() * 196, y = 30 + R() * 196, r = 18 + R() * 46;
          const rg = g.createRadialGradient(x, y, 0, x, y, r);
          rg.addColorStop(0, 'rgba(55,52,44,0.18)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
        }
        const rim = g.createRadialGradient(cx, 128, 92, cx, 128, 128);
        rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(0.75, 'rgba(70,82,48,0.22)'); rim.addColorStop(1, 'rgba(38,40,30,0.55)');
        g.fillStyle = rim; g.fillRect(ox, 0, 256, 256);
        g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, 128, 110, 0, Math.PI * 2); g.stroke();
        g.fillStyle = 'rgba(25,52,92,0.82)'; g.textAlign = 'center';
        g.font = '700 36px ' + TH; g.fillText('บ่อเกรอะ', cx, 112);
        g.font = '700 52px ' + MONO; g.fillText(String(i + 1), cx, 172);
      }
    }, { text: true });
    E.G = E.G || {};
    for (let i = 0; i < 3; i++) {
      const gd = new T.CircleGeometry(1, 28).rotateX(-Math.PI / 2).rotateY(Math.PI);
      const uv = gd.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setX(k, (uv.getX(k) + i) / 3);
      E.G['cvDisc' + i] = gd;
    }
    // square prestressed-concrete pole (tapered, flat faces)
    const pole = new T.CylinderGeometry(0.62, 1, 1, 4, 1).rotateY(Math.PI / 4).toNonIndexed();
    pole.computeVertexNormals();
    E.G.cvPole = pole;
    // crushed-stone yard
    const gravel = this._canvasTex(512, 512, (g) => {
      g.fillStyle = '#8F8C86'; g.fillRect(0, 0, 512, 512);
      for (let k = 0; k < 4200; k++) {
        const x = R() * 512, y = R() * 512, r = 2 + R() * 4.5, rot = R() * 3, v = (125 + R() * 105) | 0, t = R() * 12 - 6;
        wrap(512, 512, x, y, r + 2, (px, py) => {
          g.fillStyle = 'rgba(30,28,24,0.45)'; g.beginPath(); g.ellipse(px + 0.8, py + 1.4, r, r * 0.75, rot, 0, Math.PI * 2); g.fill();
          g.fillStyle = 'rgb(' + v + ',' + (v - 2) + ',' + ((v - 6 + t) | 0) + ')'; g.beginPath(); g.ellipse(px, py, r, r * 0.75, rot, 0, Math.PI * 2); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(px - r * 0.3, py - r * 0.3, r * 0.4, r * 0.3, rot, 0, Math.PI * 2); g.fill();
        });
      }
    }, { repeat: true });
    // corrugated tank wall / radiator channels (vertical)
    const fin = this._canvasTex(256, 32, (g) => {
      for (let x = 0; x < 256; x++) { const c = (175 + 70 * Math.cos(((x % 32) / 32) * Math.PI * 2)) | 0; g.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')'; g.fillRect(x, 0, 1, 32); }
    }, { repeat: true });
    // truck side boards: varnished planks with a painted top band
    const board = this._canvasTex(512, 256, (g) => {
      const n = 7, ph = 256 / n;
      for (let k = 0; k < n; k++) {
        const y = k * ph;
        g.fillStyle = ['#A8743F', '#B4804A', '#9C6A38', '#AD7944'][k % 4]; g.fillRect(0, y, 512, ph + 1);
        for (let s = 0; s < 30; s++) {
          const yy = y + 2 + R() * (ph - 4);
          g.strokeStyle = 'rgba(70,40,15,' + (0.08 + R() * 0.14) + ')'; g.lineWidth = 1 + R();
          g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(170, yy + (R() - 0.5) * 6, 340, yy + (R() - 0.5) * 6, 512, yy); g.stroke();
        }
        g.fillStyle = 'rgba(28,16,6,0.6)'; g.fillRect(0, y, 512, 2.5);
      }
      g.fillStyle = '#A3302A'; g.fillRect(0, 0, 512, 20);
      g.fillStyle = '#F2C21B'; g.fillRect(0, 20, 512, 5);
      g.fillStyle = '#1F6F43'; g.fillRect(0, 25, 512, 7);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 248, 512, 8);
      for (let k = 0; k < 1500; k++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,240,210,0.08)'; g.fillRect(R() * 512, R() * 256, 2 + R() * 4, 1); }
    }, { repeat: true });
    // paddy load
    const paddy = this._canvasTex(256, 256, (g) => {
      g.fillStyle = '#C49B48'; g.fillRect(0, 0, 256, 256);
      for (let k = 0; k < 3200; k++) {
        const x = R() * 256, y = R() * 256, a = R() * Math.PI, v = R();
        const col = v < 0.45 ? '#E2BE68' : (v < 0.8 ? '#B58B3C' : '#F1D88F');
        wrap(256, 256, x, y, 5, (px, py) => { g.save(); g.translate(px, py); g.rotate(a); g.fillStyle = 'rgba(60,40,10,0.3)'; g.fillRect(-3.2, -0.6, 7, 2.6); g.fillStyle = col; g.fillRect(-3.6, -1.3, 7, 2.5); g.restore(); });
      }
    }, { repeat: true });
    // wrap-round labels for cylinders (two repeats round the shell)
    const band = (ink, big, th, small) => this._canvasTex(512, 96, (g) => {
      g.fillStyle = '#F4F4EE'; g.fillRect(0, 0, 512, 96);
      g.textAlign = 'left';
      for (const ox of [0, 256]) {
        g.fillStyle = ink; g.font = '700 40px "Prompt", sans-serif'; g.fillText(big, ox + 12, 62, 100);
        g.fillStyle = '#222'; g.font = '600 19px ' + TH; g.fillText(th, ox + 118, 44, 130);
        g.font = '500 14px ' + MONO; g.fillText(small, ox + 118, 68, 130);
      }
    }, { text: true });
    E.BK.cvLid = { mat: std({ map: lid, roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), tw: 1, th: 1, cast: false };
    E.BK.cvGravel = { mat: std({ map: gravel, roughness: 0.95 }), tw: 2.4, th: 2.4, cast: false };
    E.BK.cvFin = { mat: std({ map: fin, roughness: 0.42, metalness: 0.25 }), tw: 0.32, th: 1, cast: true };
    E.BK.cvBoard = { mat: std({ map: board, roughness: 0.7 }), tw: 2.2, th: 1.25, cast: true };
    E.BK.cvPaddy = { mat: std({ map: paddy, roughness: 0.95 }), tw: 0.6, th: 0.6, cast: true };
    E.BK.cvLabCO2 = { mat: std({ map: band('#111', 'CO₂', 'คาร์บอนไดออกไซด์', '15 lb · 6.8 kg'), roughness: 0.45 }), tw: 1, th: 1, cast: true };
    E.BK.cvLabDry = { mat: std({ map: band('#C62828', 'ABC', 'ผงเคมีแห้ง', 'DRY CHEMICAL'), roughness: 0.45 }), tw: 1, th: 1, cast: true };
    E.BK.cvLabSF6 = { mat: std({ map: band('#1F4D8F', 'SF₆', 'ซัลเฟอร์เฮกซะฟลูออไรด์', 'UN 1080 · 2.2'), roughness: 0.45 }), tw: 1, th: 1, cast: true };
    for (const k of ['cvLid', 'cvGravel', 'cvFin', 'cvBoard', 'cvPaddy', 'cvLabCO2', 'cvLabDry', 'cvLabSF6']) E.BK[k].name = k;

    // ---- decal faces (meter, displays, dials, paper)
    const dm = (W, H, draw, basic) => {
      const map = this._canvasTex(W, H, draw, { text: true });
      const o = { map: map, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 };
      return basic ? new T.MeshBasicMaterial(Object.assign({ toneMapped: false }, o)) : new T.MeshStandardMaterial(Object.assign({ roughness: 0.5 }, o));
    };
    // utility kWh meter behind the cabinet window
    C.mats.meter = dm(256, 320, (g) => {
      g.fillStyle = '#E8EBE8'; g.fillRect(0, 0, 256, 320);
      g.fillStyle = '#C9CDC9'; g.fillRect(0, 0, 256, 26);
      g.textAlign = 'left'; g.fillStyle = '#333'; g.font = '600 15px ' + MONO; g.fillText('kWh METER  3~ 4W', 14, 18);
      g.fillStyle = '#2A2F35'; g.fillRect(16, 40, 224, 74);
      g.fillStyle = '#A4C394'; g.fillRect(24, 48, 208, 58);
      g.fillStyle = '#1A2612'; g.font = '700 42px ' + MONO; g.fillText('0482731', 30, 92);
      g.font = '700 14px ' + MONO; g.fillText('kWh', 196, 102);
      g.fillStyle = '#C62828'; g.beginPath(); g.arc(40, 140, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#333'; g.font = '500 13px ' + MONO; g.fillText('1000 imp/kWh', 56, 145);
      g.fillText('3x230/400 V  5(10) A', 16, 176); g.fillText('50 Hz   CL 1.0', 16, 196);
      for (let k = 0; k < 26; k++) g.fillRect(150 + k * 3.6, 214, (k * 7) % 3 + 1, 40);
      g.font = '600 15px ' + TH; g.fillText('การไฟฟ้า · มิเตอร์', 16, 240);
      g.fillStyle = '#C62828'; g.fillRect(110, 290, 36, 20);
      g.strokeStyle = '#555'; g.lineWidth = 3; g.strokeRect(2, 2, 252, 316);
    });
    // platform-scale read-out (SF₆ cylinder weighed before and after the top-up)
    C.mats.scale = dm(256, 128, (g) => {
      g.fillStyle = '#2C3136'; g.fillRect(0, 0, 256, 128);
      g.fillStyle = '#11181D'; g.fillRect(14, 14, 228, 62);
      g.fillStyle = '#7CFF9E'; g.font = '700 44px ' + MONO; g.textAlign = 'right'; g.fillText('51.62', 200, 62);
      g.font = '700 18px ' + MONO; g.fillText('kg', 236, 62);
      g.font = '600 13px ' + MONO; g.textAlign = 'center';
      ['ZERO', 'TARE', 'HOLD'].forEach((k, i) => { g.fillStyle = '#4A535B'; g.fillRect(22 + i * 76, 88, 62, 26); g.fillStyle = '#E8EDF0'; g.fillText(k, 53 + i * 76, 106); });
    }, true);
    // SF₆ density monitor: red lock-out, yellow refill, green normal (MPa at 20 °C)
    C.mats.dens = dm(256, 256, (g) => {
      const cx = 128, cy = 128;
      g.fillStyle = '#F7F7F3'; g.beginPath(); g.arc(cx, cy, 124, 0, Math.PI * 2); g.fill();
      const v2a = (v) => Math.PI * 0.75 + ((v - 0.2) / 0.6) * Math.PI * 1.5;
      const arc = (v0, v1, col) => { g.strokeStyle = col; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, 96, v2a(v0), v2a(v1)); g.stroke(); };
      arc(0.2, 0.4, '#D32F2F'); arc(0.4, 0.45, '#F2C21B'); arc(0.45, 0.8, '#2E9E4F');
      g.strokeStyle = '#222'; g.lineWidth = 3;
      for (let k = 0; k <= 12; k++) { const a = v2a(0.2 + k * 0.05), r1 = k % 2 ? 86 : 92; g.beginPath(); g.moveTo(cx + Math.cos(a) * 78, cy + Math.sin(a) * 78); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke(); }
      g.fillStyle = '#222'; g.font = '600 16px ' + MONO; g.textAlign = 'center';
      for (const v of [0.2, 0.4, 0.6, 0.8]) { const a = v2a(v); g.fillText(v.toFixed(1), cx + Math.cos(a) * 62, cy + Math.sin(a) * 62 + 6); }
      g.font = '700 30px "Prompt", sans-serif'; g.fillText('SF₆', cx, cy + 50);
      g.font = '600 14px ' + MONO; g.fillText('MPa · 20 °C', cx, cy + 74);
      const an = v2a(0.47);
      g.strokeStyle = '#111'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - Math.cos(an) * 14, cy - Math.sin(an) * 14); g.lineTo(cx + Math.cos(an) * 90, cy + Math.sin(an) * 90); g.stroke();
      g.fillStyle = '#111'; g.beginPath(); g.arc(cx, cy, 10, 0, Math.PI * 2); g.fill();
    });
    // staff commuting survey poster with a QR code
    C.mats.poster = dm(256, 360, (g) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 256, 360);
      g.fillStyle = '#1565C0'; g.fillRect(0, 0, 256, 90);
      g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.font = '700 25px ' + TH;
      g.fillText('แบบสำรวจ', 128, 36); g.fillText('การเดินทางมาทำงาน', 128, 70, 236);
      g.strokeStyle = '#1565C0'; g.lineWidth = 7;
      for (const x of [86, 170]) { g.beginPath(); g.arc(x, 148, 18, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = '#1565C0'; g.beginPath(); g.moveTo(86, 148); g.lineTo(112, 122); g.lineTo(150, 122); g.lineTo(170, 148); g.lineTo(130, 140); g.closePath(); g.fill();
      g.fillRect(104, 110, 32, 8);
      g.fillStyle = '#333'; g.font = '600 15px ' + TH; g.textAlign = 'left';
      ['• ระยะทางบ้าน–ที่ทำงาน (km)', '• ชนิดรถ / เชื้อเพลิง', '• จำนวนวันที่มาทำงาน'].forEach((s, i) => g.fillText(s, 16, 198 + i * 23, 228));
      const q = 4, n = 21, qx = 22, qy = 266;
      g.fillStyle = '#111';
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const fp = (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
        if (!fp && R() < 0.48) g.fillRect(qx + i * q, qy + j * q, q, q);
      }
      for (const f of [[0, 0], [n - 7, 0], [0, n - 7]]) {
        g.fillStyle = '#111'; g.fillRect(qx + f[0] * q, qy + f[1] * q, 7 * q, 7 * q);
        g.fillStyle = '#FFF'; g.fillRect(qx + (f[0] + 1) * q, qy + (f[1] + 1) * q, 5 * q, 5 * q);
        g.fillStyle = '#111'; g.fillRect(qx + (f[0] + 2) * q, qy + (f[1] + 2) * q, 3 * q, 3 * q);
      }
      g.fillStyle = '#1565C0'; g.font = '700 17px ' + TH; g.fillText('สแกน QR', 122, 298); g.fillStyle = '#333'; g.font = '600 14px ' + TH; g.fillText('เพื่อตอบแบบสำรวจ', 122, 322, 126);
    });
    // general notice on the shed board
    C.mats.paper = dm(160, 220, (g) => {
      g.fillStyle = '#FBFBF6'; g.fillRect(0, 0, 160, 220);
      g.fillStyle = '#B23A2E'; g.font = '700 22px ' + TH; g.textAlign = 'center'; g.fillText('ประกาศ', 80, 34);
      g.fillStyle = 'rgba(40,40,40,0.55)';
      for (let k = 0; k < 9; k++) g.fillRect(16, 54 + k * 16, 128 - (k % 3) * 22, 5);
      g.strokeStyle = '#999'; g.lineWidth = 2; g.strokeRect(1, 1, 158, 218);
    });
    // monthly inspection tag on the extinguishers
    C.mats.tag = dm(96, 160, (g) => {
      g.fillStyle = '#3FA34D'; g.fillRect(0, 0, 96, 160);
      g.fillStyle = '#FFFFFF'; g.fillRect(6, 30, 84, 124);
      g.font = '700 15px ' + TH; g.textAlign = 'center'; g.fillText('ตรวจแล้ว', 48, 24);
      g.strokeStyle = '#3FA34D'; g.lineWidth = 1.5;
      for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(6, 46 + k * 15); g.lineTo(90, 46 + k * 15); g.stroke(); }
      g.beginPath(); g.moveTo(40, 30); g.lineTo(40, 154); g.stroke();
      g.strokeStyle = '#1F5FBF'; g.lineWidth = 2.5;
      for (let k = 0; k < 5; k++) { const y = 40 + k * 15; g.beginPath(); g.moveTo(52, y); g.lineTo(58, y + 5); g.lineTo(72, y - 6); g.stroke(); }
      g.fillStyle = '#E8F1E8'; g.beginPath(); g.arc(48, 9, 4, 0, Math.PI * 2); g.fill();
    });
    // standard extinguisher board: pictogram header, one label per hook (left: dry chemical, then two CO₂)
    C.mats.fireBoard = dm(512, 320, (g) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 512, 320);
      g.fillStyle = '#C62828'; g.fillRect(0, 0, 512, 132);
      g.fillStyle = '#FFFFFF';
      this._rr(g, 40, 32, 36, 82, 9); g.fill();
      g.fillRect(49, 20, 18, 14); g.fillRect(60, 15, 36, 8);
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 6; g.beginPath(); g.moveTo(94, 20); g.quadraticCurveTo(112, 42, 98, 72); g.stroke();
      g.beginPath(); g.moveTo(120, 114); g.quadraticCurveTo(110, 86, 128, 66); g.quadraticCurveTo(130, 84, 140, 88); g.quadraticCurveTo(146, 70, 140, 56); g.quadraticCurveTo(164, 78, 158, 114); g.closePath(); g.fill();
      g.textAlign = 'left'; g.font = '700 56px ' + TH; g.fillText('ถังดับเพลิง', 186, 78);
      g.font = '600 22px ' + MONO; g.fillText('FIRE EXTINGUISHER', 190, 114);
      g.fillStyle = '#222'; g.textAlign = 'center';
      g.font = '700 30px ' + TH; g.fillText('ผงเคมีแห้ง', 85, 188);
      g.font = '700 34px "Prompt", sans-serif'; g.fillText('CO₂', 256, 190); g.fillText('CO₂', 427, 190);
      g.font = '500 18px ' + MONO; g.fillText('ABC', 85, 220); g.fillText('15 lb', 256, 220); g.fillText('15 lb', 427, 220);
      g.fillStyle = '#555'; g.font = '600 19px ' + TH; g.fillText('ตรวจสภาพทุกเดือน · ส่งเติมหลังใช้งาน', 256, 294, 480);
      g.strokeStyle = '#C62828'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 314);
    });
    // nameplates
    C.mats.plate = dm(256, 128, (g) => {
      g.fillStyle = '#D9DDE0'; g.fillRect(0, 0, 256, 128);
      g.strokeStyle = '#555'; g.lineWidth = 3; g.strokeRect(4, 4, 248, 120);
      g.fillStyle = '#222'; g.textAlign = 'left';
      g.font = '700 17px ' + MONO; g.fillText('SF₆ CIRCUIT BREAKER', 14, 30);
      g.font = '500 14px ' + MONO;
      ['115 kV   2000 A   31.5 kA', 'SF₆ 0.6 MPa (20 °C)', 'ALARM 0.45   LOCK 0.40'].forEach((s, i) => g.fillText(s, 14, 58 + i * 22));
    });
    C.mats.tplate = dm(256, 160, (g) => {
      g.fillStyle = '#E3E6E8'; g.fillRect(0, 0, 256, 160);
      g.strokeStyle = '#555'; g.lineWidth = 3; g.strokeRect(4, 4, 248, 152);
      g.fillStyle = '#222'; g.textAlign = 'left';
      g.font = '700 19px ' + TH; g.fillText('หม้อแปลงไฟฟ้า', 14, 32);
      g.font = '500 14px ' + MONO;
      ['3 PHASE   50 Hz', '22 kV / 416-240 V', 'Dyn11   OIL IMMERSED'].forEach((s, i) => g.fillText(s, 14, 64 + i * 24));
    });
    return C;
  },

  // decal rectangle w x h centred at x,y,z facing yaw ry (0 = +z); up = true lays it flat, text toward -z when ry = 0
  _cvDecal(key, x, y, z, ry, w, h, up) {
    const C = this._E.cv;
    const A = C.acc[key] || (C.acc[key] = this._newAcc('flat'));
    const Rv = [Math.cos(ry), 0, -Math.sin(ry)];
    this._face(A, [x, y, z], Rv, up ? [-Math.sin(ry), 0, -Math.cos(ry)] : [0, 1, 0], w / 2, h / 2, '#FFFFFF', { tw: w, th: h });
  },
  // decals and gauge faces placed so far become meshes; called at the end of each site
  _cvFlush() {
    const E = this._E;
    const C = E.cv;
    for (const k in C.acc) {
      const A = C.acc[k];
      if (!A.vc) continue;
      const m = this._addDyn(new E.T.Mesh(this._accGeo(A), C.mats[k]));
      m.receiveShadow = true;
      C.acc[k] = this._newAcc('flat');
    }
    this._plFlushDials(E.pl.screenMat);
  },
  // round dial facing ry: steel bezel + face (pressure gauge, or a decal key such as the SF₆ density monitor)
  _cvDial(x, y, z, ry, r, key) {
    const fx = Math.sin(ry), fz = Math.cos(ry);
    this.cylR('shiny', x, y, z, r * 1.14, 0.04, '#AEB4B9', Math.PI / 2, 0, -ry, 18);
    if (key) this._cvDecal(key, x + fx * 0.022, y, z + fz * 0.022, ry, 2 * r, 2 * r);
    else this._face(this._E.pl.gauges, [x + fx * 0.022, y, z + fz * 0.022], [Math.cos(ry), 0, -Math.sin(ry)], [0, 1, 0], r, r, '#FFFFFF', { tw: 2 * r, th: 2 * r });
  },
  // small insulator / bushing: core with alternating sheds, base at y
  _cvInsul(b, x, y, z, h, col, r, rs, pitch) {
    this.cyl(b, x, y, z, r, h, col, 10);
    let k = 0;
    for (let s = pitch * 0.8; s < h - pitch * 0.4; s += pitch, k++) this.cyl(b, x, y + s, z, k % 2 ? rs * 0.8 : rs, Math.max(0.012, rs * 0.16), col, 12);
  },
  // closed hull between a bottom rectangle B and a top rectangle U, corners [back-left, back-right, front-right, front-left];
  // colours: front (+z), back, right (+x), left, top
  _cvHull(A, B, U, cols) {
    const ctr = [0, 0, 0];
    for (const p of B.concat(U)) { ctr[0] += p[0] / 8; ctr[1] += p[1] / 8; ctr[2] += p[2] / 8; }
    const q = (a, b, c, d, col) => {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
      const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
      const l = Math.hypot(n[0], n[1], n[2]) || 1;
      n[0] /= l; n[1] /= l; n[2] /= l;
      const f = [(a[0] + c[0]) / 2 - ctr[0], (a[1] + c[1]) / 2 - ctr[1], (a[2] + c[2]) / 2 - ctr[2]];
      if (n[0] * f[0] + n[1] * f[1] + n[2] * f[2] < 0) this._quad(A, b, a, d, c, [-n[0], -n[1], -n[2]], [0, 0, 1, 1], col, false);
      else this._quad(A, a, b, c, d, n, [0, 0, 1, 1], col, false);
    };
    q(B[3], B[2], U[2], U[3], cols[0]);
    q(B[0], B[1], U[1], U[0], cols[1]);
    q(B[1], B[2], U[2], U[1], cols[2]);
    q(B[3], B[0], U[0], U[3], cols[3]);
    q(U[0], U[1], U[2], U[3], cols[4]);
  },

  // ================================================================ MUNICIPAL OFFICE (stops 2-5)
  // stop 2: septic tank west of the building (wall face at x = wx): apron, three precast rings with round lids,
  // blue PVC vent clamped up the wall to a T cap (the gas leaves there), cleanout on the sewer line
  _cvSeptic(sx, sz, wx) {
    this._cvInit();
    const PV = '#4F8FD3';
    this.box('concrete', sx, 0, sz, 5.0, 0.12, 9.4, '#B3AEA3');
    this.plane('plConc', sx, 0.122, sz, 4.8, 9.2, '#E2DED6');
    for (let i = 0; i < 3; i++) {
      const z = sz - 3 + i * 3;
      this.cyl('concrete', sx, 0.12, z, 0.74, 0.2, '#C3BEB3', 28);
      this.cyl('concrete', sx, 0.32, z, 0.64, 0.07, '#BEB9AE', 28);
      this._gput('cvLid', 'cvDisc' + i, sx, 0.392, z, 0.64, 1, 0.64, 0, 0, 0, '#FFFFFF');
      for (const s of [-1, 1]) this.tube('flat', [[sx + s * 0.4, 0.39, z - 0.08], [sx + s * 0.4, 0.44, z - 0.05], [sx + s * 0.4, 0.44, z + 0.05], [sx + s * 0.4, 0.39, z + 0.08]], 0.012, '#5B4A3B', 6);
    }
    const vx = wx - 0.12, vz = sz + 4, top = 3.5;
    this.tube('whPaint', [[sx + 0.45, 0.25, sz + 3.58], [sx + 1.2, 0.25, vz], [vx, 0.25, vz], [vx, top, vz]], 0.055, PV, 10);
    for (const p of [[sx + 1.2, 0.25, vz], [vx, 0.25, vz]]) this.sph('whPaint', p[0], p[1], p[2], 0.066, 0.066, 0.066, PV, 10);
    for (let y = 0.9; y < top - 0.2; y += 0.9) {
      this.cyl('whPaint', vx, y - 0.03, vz, 0.064, 0.06, PV, 10);
      this.box('flat', (vx + wx) / 2, y, vz, 0.13, 0.03, 0.03, '#9AA1A6');
      this.box('flat', vx, y, vz, 0.03, 0.04, 0.15, '#9AA1A6');
    }
    this.cylR('whPaint', vx, top, vz, 0.055, 0.44, PV, Math.PI / 2, 0, 0, 10);
    this.sph('whPaint', vx, top, vz, 0.068, 0.068, 0.068, PV, 10);
    for (const s of [-1, 1]) this.cylR('flat', vx, top, vz + s * 0.225, 0.058, 0.02, '#4E5459', Math.PI / 2, 0, 0, 10);
    // cleanout riser where the sewer line leaves the building
    this.cyl('whPaint', wx - 0.25, 0, sz - 3, 0.06, 0.32, '#8E959A', 10);
    this.cyl('flat', wx - 0.25, 0.32, sz - 3, 0.072, 0.05, '#3D4245', 10);
    this.box('flat', wx - 0.25, 0.37, sz - 3, 0.05, 0.03, 0.05, '#3D4245');
  },

  // stop 3: two-pole platform transformer (22 kV) with drop-out fuses, LV cables to the CT box, the utility kWh
  // meter cabinet on the pole and the building's main board (MDB) at the wall (front face z = wz)
  _cvTransformer(tx, tz, wz) {
    const E = this._E;
    this._cvInit();
    const GALV = '#A7AEB2', POR = '#7B4A35', TANK = '#A3ACB0', CAB = '#C3C8C4', WR = '#2A2D30';
    for (const px of [tx - 2, tx + 2]) {
      this._gput('concrete', 'cvPole', px, 5.25, tz, 0.2, 10.5, 0.2, 0, 0, 0, '#CFCAC0');
      this._col(px - 0.25, tz - 0.25, px + 0.25, tz + 0.25);
      this._sign('อันตราย\nไฟฟ้าแรงสูง', 0.4, 0.32, '#FFFFFF', '#C62828', [px, 3.6, tz - 0.135], Math.PI, { border: '#C62828', size: 0.3, sub: 0.9 });
    }
    // platform channels + transformer: corrugated tank, cover, lugs, bushings, oil gauge, nameplate
    for (const s of [-1, 1]) this.box('shiny', tx, 4.3, tz + s * 0.165, 5.0, 0.2, 0.08, GALV);
    for (const dx of [-0.4, 0.4]) this.box('whPaint', tx + dx, 4.5, tz, 0.1, 0.1, 1.0, '#69737A');
    const ty = 4.6, top = ty + 1.25;
    this.box('cvFin', tx, ty, tz, 1.16, 1.18, 0.82, TANK, { top: 'whPaint' });
    this.box('whPaint', tx, ty + 1.18, tz, 1.28, 0.07, 0.94, TANK);
    for (const s of [-1, 1]) this.box('whPaint', tx + s * 0.6, ty + 1.25, tz, 0.06, 0.1, 0.16, '#8C969B');
    const hv = [-0.36, 0, 0.36];
    for (const dx of hv) { this._cvInsul('whPaint', tx + dx, top, tz + 0.24, 0.36, POR, 0.045, 0.085, 0.07); this.cyl('shiny', tx + dx, top + 0.36, tz + 0.24, 0.022, 0.06, '#C9A75A', 8); }
    const lv = [-0.42, -0.14, 0.14, 0.42];
    for (const dx of lv) { this._cvInsul('whPaint', tx + dx, top, tz - 0.24, 0.16, '#8E959A', 0.035, 0.06, 0.06); this.cyl('shiny', tx + dx, top + 0.16, tz - 0.24, 0.016, 0.08, '#C9A75A', 8); }
    // surge arresters on a bracket behind the HV bushings
    this.box('shiny', tx, top - 0.3, tz + 0.5, 1.0, 0.06, 0.12, GALV);
    for (const dx of hv) {
      this._cvInsul('whPaint', tx + dx, top - 0.24, tz + 0.5, 0.32, '#7D858A', 0.04, 0.07, 0.05);
      this.tube('flat', [[tx + dx, top + 0.08, tz + 0.5], [tx + dx, top + 0.3, tz + 0.4], [tx + dx, top + 0.4, tz + 0.26]], 0.008, WR, 4);
    }
    this._cvDial(tx - 0.38, ty + 0.92, tz - 0.43, Math.PI, 0.055);
    this._cvDecal('tplate', tx + 0.28, ty + 0.62, tz - 0.416, Math.PI, 0.26, 0.16);
    // HV crossarm with line insulators, fuse arm with three drop-out cutouts, jumpers down to the HV bushings
    const ya = 9.25, yd = 7.7;
    this.box('shiny', tx, ya, tz - 0.17, 5.6, 0.12, 0.08, GALV);
    this.box('shiny', tx, yd, tz - 0.16, 4.4, 0.1, 0.08, GALV);
    const lines = [-2.2, 0, 2.2];
    [-0.9, 0, 0.9].forEach((dx, i) => {
      const lx = tx + lines[i], bx = tx + hv[i];
      this._cvInsul('whPaint', lx, ya + 0.12, tz - 0.17, 0.26, '#8E959A', 0.04, 0.09, 0.06);
      const t = this._cvCutout(tx + dx, yd + 0.1, tz - 0.2);
      this.tube('flat', [[lx, ya + 0.4, tz - 0.17], [(lx + t[0][0]) / 2, ya - 0.3, tz - 0.32], t[0]], 0.009, WR, 4);
      this.tube('flat', [t[1], [t[1][0], 7.3, tz - 0.44], [(t[1][0] + bx) / 2, 6.6, tz - 0.05], [bx, top + 0.46, tz + 0.24]], 0.009, WR, 4);
    });
    E.wWire.push(tx - 2.2, ya + 0.4, tz - 0.17, tx - 6, 9.6, 13.6, tx, ya + 0.4, tz - 0.17, tx - 4, 9.6, 13.6, tx + 2.2, ya + 0.4, tz - 0.17, tx - 2, 9.6, 13.6);
    // LV cables down to the CT box on the east pole, meter cabinet under it, conduit into the ground
    const px = tx + 2, lz = tz - 0.246;
    lv.forEach((dx, i) => this.tube('flat', [[tx + dx, top + 0.24, tz - 0.24], [tx + dx, top + 0.26, tz - 0.5], [tx + 1.15 + i * 0.06, 5.4, tz - 0.56], [px - 0.14 + i * 0.09, 3.7, tz - 0.42], [px - 0.14 + i * 0.09, 2.97, lz]], 0.02, '#1C1D1F', 6));
    this.box('whPaint', px, 2.35, lz, 0.5, 0.62, 0.24, CAB);
    this.box('whPaint', px, 2.97, lz - 0.01, 0.54, 0.04, 0.28, '#A9AFAA');
    this.box('shiny', px + 0.17, 2.6, lz - 0.125, 0.04, 0.08, 0.02, '#D0D5D8');
    const mx = px - 0.05, mz = tz - 0.236;
    this.box('whPaint', mx, 1.25, mz, 0.42, 0.7, 0.22, CAB);
    this.box('whPaint', mx, 1.95, mz - 0.01, 0.46, 0.04, 0.26, '#A9AFAA');
    this.box('flat', mx, 1.3, mz - 0.115, 0.32, 0.5, 0.012, '#2B3035');
    this._cvDecal('meter', mx, 1.55, mz - 0.124, Math.PI, 0.26, 0.34);
    this.box('whPaint', mx, 0.95, mz - 0.02, 0.06, 0.3, 0.06, '#3A3E42');
    this.cyl('whPaint', px + 0.3, 0, tz - 0.2, 0.045, 2.68, '#3A3E42', 10);
    for (const y of [0.6, 1.5, 2.2]) this.box('flat', px + 0.22, y, tz - 0.2, 0.2, 0.04, 0.1, '#9AA1A6');
    // main distribution board at the wall
    const dx0 = tx + 4, dz0 = wz - 0.5, fz = dz0 - 0.3;
    this.box('concrete', dx0, 0, dz0, 2.1, 0.18, 0.8, '#C9C4BA');
    this.box('whPaint', dx0, 0.18, dz0, 1.8, 2.0, 0.6, CAB);
    this.box('whPaint', dx0, 2.18, dz0 - 0.03, 1.9, 0.05, 0.7, '#B4BAB6');
    this.box('flat', dx0, 0.24, fz - 0.004, 0.015, 1.88, 0.01, '#6E7672');
    for (const s of [-1, 1]) {
      this.box('shiny', dx0 + s * 0.09, 0.98, fz - 0.02, 0.03, 0.22, 0.03, '#D0D5D8');
      for (let k = 0; k < 5; k++) this.box('flat', dx0 + s * 0.45, 0.36 + k * 0.07, fz - 0.006, 0.5, 0.025, 0.012, '#69716D');
    }
    this.cyl('whPaint', dx0 - 0.7, 0, dz0 - 0.5, 0.045, 0.3, '#3A3E42', 10);
    this._sign('ตู้ MDB · ไฟฟ้าหลักอาคาร', 1.3, 0.24, '#1F4D36', '#FFFFFF', [dx0, 1.85, fz - 0.012], Math.PI, { size: 0.5 });
    this._sign('อันตราย ไฟฟ้า', 0.42, 0.2, '#F7C51E', '#1A1A1A', [dx0 + 0.5, 1.45, fz - 0.012], Math.PI, { size: 0.42, border: '#1A1A1A' });
    this._col(dx0 - 1.05, dz0 - 0.4, dx0 + 1.05, dz0 + 0.4);
  },
  // drop-out fuse cutout in front of a crossarm: porcelain body tilted back, fuse tube in front, contacts.
  // Returns the top and bottom terminals.
  _cvCutout(x, y, z) {
    const POR = '#7B4A35', t = 0.3, c = Math.cos(t), s = Math.sin(t);
    this.box('shiny', x, y - 0.06, z + 0.02, 0.06, 0.06, 0.14, '#A7AEB2');
    const by = y + 0.18, bz = z - 0.08;
    this.cylR('whPaint', x, by, bz, 0.035, 0.42, POR, t, 0, 0, 10);
    for (let k = -2; k <= 2; k++) this.cylR('whPaint', x, by + k * 0.07 * c, bz + k * 0.07 * s, 0.07, 0.022, POR, t, 0, 0, 12);
    const fy = by + 0.12 * s, fz = bz - 0.12 * c;
    this.cylR('flat', x, fy, fz, 0.022, 0.46, '#3B2A20', t, 0, 0, 8);
    for (const k of [-1, 1]) {
      this.cylR('shiny', x, fy + k * 0.23 * c, fz + k * 0.23 * s, 0.03, 0.05, '#B8BEC2', t, 0, 0, 8);
      this.boxR('shiny', x, by + k * 0.22 * c + 0.06 * s, bz + k * 0.22 * s - 0.06 * c, 0.05, 0.03, 0.14, '#B8BEC2', t, 0, 0);
    }
    return [[x, by + 0.25 * c + 0.12 * s, bz + 0.25 * s - 0.12 * c], [x, by - 0.25 * c + 0.12 * s, bz - 0.25 * s - 0.12 * c]];
  },

  // stop 4: staff motorbike shed (x mx0..mx1, z mz0..mz1): floor with bays, steel frame, lean-to sheet roof with
  // gutter, the commuting-survey board, the parked bikes (some with a helmet on the seat)
  _cvMotoShed(mx0, mx1, mz0, mz1, R) {
    const E = this._E;
    this._cvInit();
    const ST = '#5C7287', cx = (mx0 + mx1) / 2, cz = (mz0 + mz1) / 2;
    const xa = mx0 - 0.6, xb = mx1 + 0.6, ya = 3.0, yb = 2.6;
    const yr = (x) => ya + ((yb - ya) * (x - xa)) / (xb - xa);
    this.plane('plConc', cx, 0.07, cz, mx1 - mx0, mz1 - mz0, '#D2CDC4');
    for (const x of [mx0 + 0.12, mx1 - 0.12]) this.box('concrete', x, 0, cz, 0.24, 0.14, mz1 - mz0, '#C9C4BA');
    for (let z = mz0 + 0.625; z < mz1 - 0.2; z += 1.15) for (const x of [mx0 + 2.1, mx1 - 2.1]) this.plane('paint', x, 0.074, z, 2.3, 0.06, '#EEF0EC');
    for (const x of [mx0 + 3.3, mx1 - 3.3]) this.plane('paint', x, 0.074, cz, 0.08, mz1 - mz0 - 1, '#F2C21B');
    const L = Math.hypot(xb - xa, ya - yb), ang = Math.atan2(yb - ya, xb - xa);
    for (let z = mz0; z <= mz1 + 0.1; z += 6.8) {
      for (const x of [mx0 + 0.3, mx1 - 0.3]) {
        this.box('whPaint', x, 0, z, 0.12, yr(x) - 0.16, 0.12, ST);
        this.box('whPaint', x, 0.07, z, 0.26, 0.03, 0.26, '#4A5B6B');
        this._col(x - 0.2, z - 0.2, x + 0.2, z + 0.2);
      }
      this.boxR('whPaint', (xa + xb) / 2, (ya + yb) / 2 - 0.08, z, L, 0.16, 0.08, ST, 0, 0, ang);
    }
    for (let k = 0; k < 6; k++) { const x = xa + 0.25 + k * ((xb - xa - 0.5) / 5); this.box('whPaint', x, yr(x), cz, 0.06, 0.08, mz1 - mz0 + 1.0, '#7B8C9C'); }
    this._wQ('metal', [xa, ya + 0.09, mz0 - 0.5], [xa, ya + 0.09, mz1 + 0.5], [xb, yb + 0.09, mz1 + 0.5], [xb, yb + 0.09, mz0 - 0.5], '#3F72A6', true);
    this.box('whPaint', xb + 0.02, yb - 0.22, cz, 0.04, 0.3, mz1 - mz0 + 1.0, '#E7EAEB');
    this.box('whPaint', xb + 0.1, yb - 0.14, cz, 0.14, 0.12, mz1 - mz0 + 1.0, '#D5D9DB');
    this.cyl('whPaint', xb + 0.1, 0.05, mz0 - 0.3, 0.04, yb - 0.2, '#D5D9DB', 10);
    for (const z of [mz0 + 0.9, mz0 + 3.7]) this.box('flat', xb + 0.2, 2.36, z, 0.02, 0.1, 0.02, '#444A50');
    this._sign('ที่จอดรถจักรยานยนต์ พนักงาน', 3.6, 0.36, '#1565C0', '#FFFFFF', [xb + 0.2, 2.15, mz0 + 2.3], Math.PI / 2, { both: true });
    // survey board on the third east post, facing the yard
    const bx = mx1 - 0.215, bz = mz0 + 13.6;
    this.box('whPaint', bx, 0.95, bz, 0.05, 1.0, 1.3, '#B8BCBE');
    this.box('flat', bx + 0.012, 1.0, bz, 0.04, 0.9, 1.2, '#9A7650');
    this._cvDecal('poster', bx + 0.04, 1.47, bz - 0.27, Math.PI / 2, 0.5, 0.7);
    this._cvDecal('paper', bx + 0.04, 1.5, bz + 0.3, Math.PI / 2, 0.4, 0.55);
    for (let z = mz0 + 1.2; z < mz1 - 0.8; z += 1.15) for (const x of [mx0 + 2.1, mx1 - 2.1]) {
      if (R() < 0.12) continue;
      const yaw = x < cx ? Math.PI / 2 : -Math.PI / 2;
      E.parkSpots.push({ x: x, z: z, yaw: yaw, kind: 'moto', color: this._wPick(R, ['#C62828', '#1565C0', '#212121', '#ECEFF1', '#2E7D32', '#F9A825', '#6A1B9A']) });
      if (R() < 0.45) {
        const s = Math.sin(yaw), hx = x - 0.3 * s;
        this.sph('whPaint', hx, 1.03, z, 0.15, 0.135, 0.14, this._wPick(R, ['#F4F4F2', '#1E1E1E', '#C62828', '#F2C21B', '#1565C0']), 10);
        this.box('whPaint', hx + 0.11 * s, 0.98, z, 0.05, 0.07, 0.17, '#1E2A30');
      }
    }
  },

  // stop 5: extinguisher stand under the entrance canopy, facing -z: dry chemical (east) and two 15 lb CO₂ units
  _cvExtinguishers(ex, ez, y0) {
    this._cvInit();
    const RED = '#C81E1A', bz = ez + 0.12;
    this.box('whPaint', ex, y0, ez, 1.62, 0.05, 0.46, RED);
    for (const s of [-1, 1]) this.box('whPaint', ex + s * 0.76, y0, bz + 0.08, 0.05, 1.95, 0.05, RED);
    this.box('whPaint', ex, y0 + 0.95, bz + 0.1, 1.56, 0.96, 0.03, '#F2F2EE');
    this._cvDecal('fireBoard', ex, y0 + 1.43, bz + 0.08, Math.PI, 1.5, 0.92);
    for (const dx of [-0.5, 0, 0.5]) this.box('whPaint', ex + dx, y0 + 0.62, bz + 0.05, 0.08, 0.05, 0.06, '#2A2C2E');
    this._cvDry(ex + 0.5, y0 + 0.05, ez - 0.02, Math.PI);
    this._cvCO2(ex, y0 + 0.05, ez - 0.02, Math.PI);
    this._cvCO2(ex - 0.5, y0 + 0.05, ez - 0.02, Math.PI);
    this._col(ex - 0.85, ez - 0.3, ex + 0.85, ez + 0.3);
  },
  // 15 lb CO₂ extinguisher at base y, front facing ry: black boot, red shell, label, valve, handles, hose and horn
  _cvCO2(x, y, z, ry) {
    const RED = '#C81E1A', BK = '#1B1C1E';
    const fx = Math.sin(ry), fz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry);
    this.cyl('whPaint', x, y, z, 0.092, 0.05, BK, 18);
    this.cyl('whPaint', x, y + 0.05, z, 0.088, 0.6, RED, 18);
    this.sph('whPaint', x, y + 0.65, z, 0.088, 0.06, 0.088, RED, 14);
    this.cyl('cvLabCO2', x, y + 0.26, z, 0.0895, 0.13, '#FFFFFF', 18);
    this.cyl('shiny', x, y + 0.7, z, 0.03, 0.05, '#C9CED2', 10);
    this.box('shiny', x, y + 0.75, z, 0.05, 0.07, 0.05, '#B8BEC2');
    this.box('whPaint', x - fx * 0.02, y + 0.8, z - fz * 0.02, 0.025, 0.02, 0.16, BK, { ry: ry });
    this.box('whPaint', x - fx * 0.03, y + 0.84, z - fz * 0.03, 0.025, 0.018, 0.15, BK, { ry: ry });
    this.box('whPaint', x + rx * 0.035, y + 0.79, z + rz * 0.035, 0.012, 0.03, 0.012, '#F2C21B');
    const hx = x + rx * 0.135, hz = z + rz * 0.135;
    this.tube('flat', [[x + rx * 0.03, y + 0.76, z + rz * 0.03], [x + rx * 0.12, y + 0.8, z + rz * 0.12], [hx, y + 0.72, hz], [hx, y + 0.6, hz]], 0.013, BK, 6);
    this._gput('whPaint', 'cone12', hx, y + 0.48, hz, 0.055, 0.24, 0.055, 0, 0, 0, BK);
    this.box('whPaint', x + rx * 0.1, y + 0.5, z + rz * 0.1, 0.03, 0.05, 0.05, '#2A2C2E', { ry: ry });
    this._cvDecal('tag', x + fx * 0.096, y + 0.57, z + fz * 0.096, ry, 0.06, 0.1);
  },
  // 15 lb dry-chemical (ABC) extinguisher: shorter shell, pressure gauge, short hose with nozzle
  _cvDry(x, y, z, ry) {
    const RED = '#D3261F', BK = '#1B1C1E';
    const fx = Math.sin(ry), fz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry);
    this.cyl('whPaint', x, y, z, 0.086, 0.46, RED, 18);
    this.sph('whPaint', x, y + 0.46, z, 0.086, 0.07, 0.086, RED, 14);
    this.cyl('cvLabDry', x, y + 0.17, z, 0.0875, 0.13, '#FFFFFF', 18);
    this.cyl('shiny', x, y + 0.52, z, 0.028, 0.04, '#C9CED2', 10);
    this.box('shiny', x, y + 0.56, z, 0.05, 0.06, 0.05, '#B8BEC2');
    this.box('whPaint', x - fx * 0.02, y + 0.63, z - fz * 0.02, 0.025, 0.02, 0.15, BK, { ry: ry });
    this.box('whPaint', x - fx * 0.03, y + 0.66, z - fz * 0.03, 0.025, 0.018, 0.14, BK, { ry: ry });
    this._cvDial(x + fx * 0.04, y + 0.59, z + fz * 0.04, ry, 0.022);
    this.tube('flat', [[x + rx * 0.03, y + 0.57, z + rz * 0.03], [x + rx * 0.11, y + 0.52, z + rz * 0.11], [x + rx * 0.11, y + 0.3, z + rz * 0.11]], 0.012, BK, 6);
    this.cyl('whPaint', x + rx * 0.11, y + 0.22, z + rz * 0.11, 0.016, 0.08, BK, 8);
    this._cvDecal('tag', x + fx * 0.094, y + 0.36, z + fz * 0.094, ry, 0.055, 0.09);
  },

  // ================================================================ HIRED TIPPER (stop 11)
  // ten-wheel tipper of the haulage contractor. Local frame: cab toward +z, rear tandem near z 0, bed hinged at the rear.
  // Returns { g, bed, load, upd }: complexes._bMill() tips the bed and calls upd() so the ram and tailgate follow.
  _cvTipper() {
    const E = this._E;
    const T = E.T;
    this._cvInit();
    const g = new T.Group();
    const CAB = '#2F8F5B', CABD = '#246E46', CH = '#24272A', CR = '#D4D9DD', GL = '#1A252D', TY = '#151617', RIM = '#BCC2C6', AMB = '#F2A23A', STK = '#2E3A35';
    const W = 1.19;
    // painted cab and bodywork
    this._bakeMesh((A) => {
      this.box(A, 0, 1.08, 6.72, 2.42, 0.94, 2.24, CAB);
      this._cvHull(A, [[-W, 2.02, 5.6], [W, 2.02, 5.6], [W, 2.02, 7.84], [-W, 2.02, 7.84]], [[-W, 2.94, 5.6], [W, 2.94, 5.6], [W, 2.94, 7.58], [-W, 2.94, 7.58]], [GL, CAB, CAB, CAB, CAB]);
      this.box(A, 0, 2.94, 6.5, 2.2, 0.08, 1.8, CAB);
      this.boxR(A, 0, 2.99, 7.72, 2.36, 0.04, 0.34, CAB, 0.1, 0, 0);
      this.box(A, 0, 2.0, 7.86, 2.3, 0.07, 0.06, CAB);
      this.box(A, 0, 2.9, 7.6, 2.3, 0.07, 0.06, CAB);
      for (const s of [-1, 1]) {
        this.tube(A, [[s * 1.17, 2.0, 7.86], [s * 1.15, 2.95, 7.58]], 0.06, CAB, 8);
        this.box(A, s * 1.196, 2.08, 6.85, 0.02, 0.74, 1.12, GL);
        this.box(A, s * 1.196, 2.08, 5.95, 0.02, 0.74, 0.38, GL);
        this.box(A, s * 1.215, 1.12, 5.74, 0.012, 1.82, 0.03, CABD);
        this.box(A, s * 1.215, 1.12, 7.52, 0.012, 0.9, 0.03, CABD);
        this.box(A, s * 1.218, 1.26, 6.63, 0.012, 0.09, 1.72, '#F2F4F5');
        this.box(A, s * 1.17, 1.15, 7.85, 0.1, 0.2, 0.03, AMB);
        this.box(A, s * 0.88, 1.17, 7.87, 0.38, 0.2, 0.02, '#EAF1F5');
        this.boxR(A, s * 0.5, 2.1, 7.88, 0.62, 0.02, 0.02, CH, 0, 0, s * 0.15);
        this.box(A, s * 1.53, 2.1, 7.48, 0.06, 0.5, 0.24, CH);
        this.tube(A, [[s * 1.2, 2.55, 7.42], [s * 1.5, 2.55, 7.48], [s * 1.53, 2.36, 7.48]], 0.015, CH, 6);
        this.tube(A, [[s * 1.2, 1.75, 7.42], [s * 1.5, 1.8, 7.48], [s * 1.53, 1.86, 7.48]], 0.015, CH, 6);
      }
      for (let k = 0; k < 5; k++) this.box(A, -0.6 + k * 0.3, 3.0, 7.88, 0.12, 0.05, 0.04, AMB);
      this.box(A, 0, 1.18, 7.85, 1.3, 0.5, 0.03, '#191C1F');
      this.box(A, 0, 0.8, 7.8, 2.42, 0.28, 0.08, CABD);
      // wheel rims (outer faces) and rear mudguards
      for (const z of [6.55]) for (const s of [-1, 1]) this.cylR(A, s * 1.04, 0.52, z, 0.3, 0.32, RIM, 0, 0, Math.PI / 2, 14);
      for (const z of [1.2, -0.05]) for (const s of [-1, 1]) this.cylR(A, s * 1.1, 0.52, z, 0.3, 0.29, RIM, 0, 0, Math.PI / 2, 14);
      for (const s of [-1, 1]) this.box(A, s * 0.96, 1.07, 0.58, 0.66, 0.04, 2.72, '#1B1C1E');
    }, { parent: g, bk: 'whPaint' });
    // chrome and aluminium
    this._bakeMesh((A) => {
      this.box(A, 0, 0.42, 7.9, 2.48, 0.38, 0.2, CR);
      for (let k = 0; k < 4; k++) this.box(A, 0, 1.24 + k * 0.12, 7.865, 1.3, 0.025, 0.02, CR);
      for (const s of [-1, 1]) {
        this.box(A, s * 0.88, 1.15, 7.855, 0.44, 0.26, 0.03, CR);
        this.box(A, s * 1.225, 1.82, 5.98, 0.02, 0.05, 0.2, CR);
        for (const y of [0.32, 0.62]) this.box(A, s * 1.12, y, 5.78, 0.3, 0.035, 0.36, CR);
        this.cylR(A, s * 1.04, 0.52, 6.55, 0.12, 0.38, CR, 0, 0, Math.PI / 2, 8);
        for (const z of [1.2, -0.05]) this.cylR(A, s * 1.1, 0.52, z, 0.12, 0.35, CR, 0, 0, Math.PI / 2, 8);
      }
      this.cylR(A, 1.0, 0.86, 3.7, 0.28, 1.1, '#C8CED2', Math.PI / 2, 0, 0, 16);
      this.cyl(A, 1.32, 1.0, 5.45, 0.065, 2.5, CR, 10);
      this.tube(A, [[1.32, 3.5, 5.45], [1.32, 3.6, 5.4], [1.32, 3.66, 5.3]], 0.065, CR, 10);
    }, { parent: g, bk: 'shiny' });
    // chassis, rubber, black parts
    this._bakeMesh((A) => {
      for (const s of [-1, 1]) this.box(A, s * 0.45, 0.74, 3.1, 0.1, 0.3, 9.1, CH);
      for (const z of [-1.3, 0.6, 2.4, 4.4, 5.3, 7.4]) this.box(A, 0, 0.78, z, 0.9, 0.2, 0.1, CH);
      for (const z of [1.2, -0.05]) { this.cylR(A, 0, 0.52, z, 0.11, 1.9, '#2E3134', 0, 0, Math.PI / 2, 10); this.sph(A, 0, 0.52, z, 0.25, 0.25, 0.22, '#2E3134', 10); }
      this.box(A, 0, 0.44, 6.55, 1.9, 0.12, 0.12, '#2E3134');
      for (const s of [-1, 1]) for (const z of [0.58, 6.55]) this.box(A, s * 0.45, 0.62, z, 0.08, 0.1, 1.3, '#2A2D30');
      this.tube(A, [[0, 0.62, 4.9], [0, 0.55, 1.6]], 0.05, '#2E3134', 8);
      this.box(A, -0.95, 0.55, 3.5, 0.45, 0.42, 0.65, '#2B2E31');
      this.cylR(A, -0.75, 0.58, 2.4, 0.12, 0.8, '#3A3E42', Math.PI / 2, 0, 0, 10);
      for (const k of [-0.25, 0.25]) this.cylR(A, 1.0, 0.86, 3.7 + k, 0.29, 0.04, '#2A2D30', Math.PI / 2, 0, 0, 16);
      this.cyl(A, 1.32, 1.6, 5.45, 0.085, 1.0, '#3B3F43', 10);
      this.cyl(A, -1.32, 1.0, 5.45, 0.09, 2.3, '#1E2023', 10);
      this.cyl(A, -1.32, 3.3, 5.45, 0.13, 0.14, '#1E2023', 10);
      for (const s of [-1, 1]) {
        this.box(A, s * 1.05, 0.3, 5.95, 0.3, 0.55, 0.03, '#141516');
        this.box(A, s * 0.96, 0.22, -0.72, 0.6, 0.62, 0.02, '#141516');
        this.box(A, s * 0.92, 0.72, -1.47, 0.36, 0.13, 0.04, '#B3261E');
        this.box(A, s * 0.66, 0.72, -1.47, 0.14, 0.13, 0.04, AMB);
      }
      this.box(A, 0, 0.6, -1.42, 2.3, 0.1, 0.08, '#3A3E42');
      const tyre = (x, z, w) => {
        this.cylR(A, x, 0.52, z, 0.52, w, TY, 0, 0, Math.PI / 2, 18);
        this.cylR(A, x, 0.52, z, 0.44, w + 0.006, '#202224', 0, 0, Math.PI / 2, 16);
      };
      for (const s of [-1, 1]) {
        tyre(s * 1.04, 6.55, 0.3);
        for (const z of [1.2, -0.05]) { tyre(s * 1.1, z, 0.27); tyre(s * 0.82, z, 0.27); }
      }
    }, { parent: g });
    // tipping bed (hinge at the rear), wooden side boards, headboard with cab protector
    const bed = new T.Group();
    bed.position.set(0, 1.35, -1.5);
    g.add(bed);
    this._bakeMesh((A) => {
      this.box(A, 0, 0, 3.35, 2.44, 0.12, 6.7, '#4A4F53');
      for (const s of [-1, 1]) this.box(A, s * 0.45, -0.14, 3.35, 0.12, 0.14, 6.6, CH);
      for (const s of [-1, 1]) for (let k = 0; k < 7; k++) this.box(A, s * 1.235, 0.0, 0.12 + k * 1.08, 0.05, 1.45, 0.09, STK);
      for (const s of [-1, 1]) this.box(A, s * 1.225, 1.37, 3.35, 0.09, 0.06, 6.7, STK);
      this.boxR(A, 0, 1.83, 7.06, 2.44, 0.05, 0.76, STK, -0.06, 0, 0);
      for (const s of [-1, 1]) this.box(A, s * 1.2, 1.37, 6.7, 0.06, 0.45, 0.06, STK);
    }, { parent: bed, bk: 'whPaint' });
    this._bakeMesh((A) => {
      for (const s of [-1, 1]) this.box(A, s * 1.18, 0.12, 3.35, 0.07, 1.25, 6.7, '#FFFFFF', { tw: 2.233, th: 1.25 });
      this.box(A, 0, 0.12, 6.7, 2.3, 1.62, 0.08, '#FFFFFF', { tw: 2.3, th: 1.62 });
    }, { parent: bed, bk: 'cvBoard' });
    const gate = new T.Group();
    gate.position.set(0, 1.39, -0.02);
    bed.add(gate);
    this._bakeMesh((A) => { this.box(A, 0, -1.27, -0.04, 2.36, 1.25, 0.07, '#FFFFFF', { tw: 2.36, th: 1.25 }); }, { parent: gate, bk: 'cvBoard' });
    this._bakeMesh((A) => {
      for (const s of [-1, 1]) this.box(A, s * 1.0, -1.3, -0.09, 0.08, 1.3, 0.05, STK);
      this.box(A, 0, -0.08, -0.09, 2.36, 0.07, 0.06, STK);
    }, { parent: gate, bk: 'whPaint' });
    const load = new T.Group();
    load.position.set(0, 0.12, 0);
    bed.add(load);
    this._bakeMesh((A) => {
      this.box(A, 0, 0, 3.35, 2.28, 0.72, 6.5, '#FFFFFF');
      this._gput(A, 'sph14', 0, 0.72, 3.5, 1.08, 0.36, 2.95, 0, 0, 0, '#FFFFFF', 10);
    }, { parent: load, bk: 'cvPaddy' });
    // telescopic ram between the chassis and the bed front (three stages)
    const ramMat = new T.MeshStandardMaterial({ color: this._lcol('#2B2F33'), roughness: 0.4, metalness: 0.5 });
    const rodMat = new T.MeshStandardMaterial({ color: this._lcol('#E3E7EA'), roughness: 0.15, metalness: 0.9 });
    const cg = new T.CylinderGeometry(1, 1, 1, 14).translate(0, 0.5, 0);
    const parts = [[0.11, ramMat], [0.088, ramMat], [0.066, rodMat]].map((p) => { const m = new T.Mesh(cg, p[1]); m.scale.set(p[0], 1, p[0]); m.castShadow = true; g.add(m); return m; });
    const P0 = new T.Vector3(0, 0.72, 5.0), Pb = new T.Vector3(0, -0.14, 6.3), P1 = new T.Vector3(), dir = new T.Vector3(), Y = new T.Vector3(0, 1, 0), q = new T.Quaternion();
    const upd = () => {
      bed.updateMatrix();
      P1.copy(Pb).applyMatrix4(bed.matrix);
      dir.subVectors(P1, P0);
      const L = dir.length();
      dir.multiplyScalar(1 / L);
      q.setFromUnitVectors(Y, dir);
      const ext = Math.max(0, L - 0.5);
      const seg = [[0, Math.min(L, 0.5)], [0.06, 0.5 + ext * 0.5], [0.12 + ext * 0.47, L]];
      parts.forEach((m, i) => { m.quaternion.copy(q); m.position.copy(P0).addScaledVector(dir, seg[i][0]); m.scale.y = Math.max(0.01, seg[i][1] - seg[i][0]); });
      gate.rotation.x = -bed.rotation.x * 1.08;
    };
    upd();
    return { g: g, bed: bed, load: load, upd: upd };
  },

  // ================================================================ SUBSTATION (stop 12)
  // live-tank SF₆ breaker pole: plinth, galvanised H column, density monitor facing +z, porcelain column, chamber head
  _cvBreakerPole(x, z) {
    const STEEL = '#A1A9AE', POR = '#7A4E3A', AL = '#C3C9CD';
    this.box('concrete', x, 0, z, 1.0, 0.35, 1.0, '#C9C4BA');
    for (const s of [-1, 1]) this.box('shiny', x + s * 0.15, 0.35, z, 0.03, 2.6, 0.34, STEEL);
    this.box('shiny', x, 0.35, z, 0.27, 2.6, 0.025, STEEL);
    this.box('shiny', x, 2.95, z, 0.5, 0.05, 0.5, STEEL);
    this.box('shiny', x, 2.58, z + 0.19, 0.08, 0.08, 0.05, STEEL);
    this._cvDial(x, 2.62, z + 0.24, 0, 0.11, 'dens');
    this.tube('flat', [[x + 0.06, 2.55, z + 0.2], [x + 0.13, 2.7, z + 0.12], [x + 0.13, 3.0, z + 0.06]], 0.01, '#8C949A', 6);
    this._wInsul('whPaint', x, 3.0, z, 1.9, POR);
    this.box('shiny', x, 4.9, z, 0.42, 0.4, 0.42, AL);
    this.cylR('whPaint', x, 5.12, z, 0.13, 1.5, POR, Math.PI / 2, 0, 0, 10);
    for (let k = -5; k <= 5; k++) if (k) this.cylR('whPaint', x, 5.12, z + k * 0.13, k % 2 ? 0.2 : 0.25, 0.03, POR, Math.PI / 2, 0, 0, 12);
    for (const s of [-1, 1]) { this.cylR('shiny', x, 5.12, z + s * 0.78, 0.16, 0.08, AL, Math.PI / 2, 0, 0, 12); this.box('shiny', x, 5.2, z + s * 0.88, 0.12, 0.1, 0.14, AL); }
  },
  // operating-mechanism cabinet of a bay, on the middle pole's column (front +z)
  _cvMechBox(x, z) {
    const zf = z + 0.645;
    for (const s of [-1, 1]) this.box('shiny', x + s * 0.3, 0.35, z + 0.42, 0.06, 0.27, 0.06, '#A1A9AE');
    this.box('whPaint', x, 0.62, z + 0.42, 0.8, 1.0, 0.45, '#BAC1C4');
    this.box('whPaint', x, 1.62, z + 0.43, 0.86, 0.04, 0.5, '#A3AAAD');
    this.box('flat', x + 0.05, 0.66, zf + 0.003, 0.012, 0.92, 0.01, '#7F878A');
    this.box('shiny', x + 0.3, 1.05, zf + 0.015, 0.03, 0.14, 0.03, '#D0D5D8');
    this.box('flat', x - 0.18, 1.25, zf + 0.004, 0.2, 0.12, 0.012, '#1E2226');
    this.box('glow', x - 0.22, 1.25, zf + 0.012, 0.05, 0.06, 0.006, '#2ECC71');
    this.box('glow', x - 0.14, 1.25, zf + 0.012, 0.05, 0.06, 0.006, '#E8EDF0');
    this._cvDecal('plate', x - 0.12, 0.92, zf + 0.008, 0, 0.3, 0.15);
  },
  // SF₆ top-up station: cylinder standing on a platform scale (weighed before and after), regulator, hose to the port
  _cvSF6Cart(cx, cz, port) {
    this._cvInit();
    const G = '#5D8A69', BK = '#1E1F21';
    this.box('whPaint', cx, 0.05, cz, 0.6, 0.07, 0.6, '#3A4046');
    this.box('shiny', cx, 0.12, cz, 0.56, 0.015, 0.56, '#B9BFC4');
    this.box('whPaint', cx + 0.24, 0.05, cz + 0.36, 0.05, 0.9, 0.05, '#3A4046');
    this.box('whPaint', cx + 0.24, 0.95, cz + 0.36, 0.26, 0.15, 0.08, '#2C3136');
    this._cvDecal('scale', cx + 0.24, 1.025, cz + 0.405, 0, 0.24, 0.12);
    const y0 = 0.135;
    this.cyl('whPaint', cx, y0, cz, 0.115, 1.22, G, 18);
    this.sph('whPaint', cx, y0 + 1.22, cz, 0.115, 0.1, 0.115, G, 14);
    this.cyl('cvLabSF6', cx, y0 + 0.72, cz, 0.117, 0.14, '#FFFFFF', 18);
    this.cyl('whPaint', cx, y0 + 1.3, cz, 0.05, 0.08, '#C9CED2', 12);
    this.box('shiny', cx, y0 + 1.38, cz, 0.06, 0.08, 0.06, '#C9A75A');
    this.cyl('whPaint', cx, y0 + 1.46, cz, 0.04, 0.02, BK, 10);
    const ry0 = y0 + 1.41;
    this.box('shiny', cx + 0.09, ry0 - 0.02, cz, 0.12, 0.05, 0.05, '#C9CED2');
    this.box('shiny', cx + 0.17, ry0 - 0.05, cz, 0.07, 0.09, 0.07, '#B8BEC2');
    this._cvDial(cx + 0.13, ry0 + 0.05, cz + 0.045, 0, 0.03);
    this._cvDial(cx + 0.21, ry0 + 0.05, cz + 0.045, 0, 0.03);
    const mid = [(cx + port[0]) / 2, Math.min(ry0, port[1]) - 0.7, (cz + port[2]) / 2];
    this.tube('flat', [[cx + 0.2, ry0 - 0.08, cz], [cx + 0.28, ry0 - 0.35, cz - 0.1], mid, [port[0] + 0.05, port[1] - 0.3, port[2] + 0.12], port], 0.016, BK, 6);
    // leak-detector case with the top-up log on it
    this.box('whPaint', cx - 0.6, 0.05, cz + 0.25, 0.44, 0.15, 0.3, '#F2B705');
    this.box('flat', cx - 0.6, 0.2, cz + 0.25, 0.16, 0.03, 0.03, '#2A2C2E');
    this._cvDecal('paper', cx - 0.6, 0.207, cz + 0.27, 0.2, 0.16, 0.22, true);
  },
  // power transformer on an oil-pit plinth: tank with stiffeners, radiator banks + fans both sides, conservator with
  // level gauge and Buchholz relay, HV/LV bushings, tap-changer cabinet, number plate on the end facing the path (side ±1)
  _cvPowerXfmr(tx, tz, n, side) {
    this._cvInit();
    const BODY = '#7E8C83', DK = '#5F6C64', POR = '#7A4E3A';
    this.box('concrete', tx, 0, tz, 11, 0.25, 8, '#C9C4BA');
    for (const s of [-1, 1]) { this.box('concrete', tx, 0.25, tz + s * 3.9, 11, 0.15, 0.2, '#BDB8AE'); this.box('concrete', tx + s * 5.4, 0.25, tz, 0.2, 0.15, 7.6, '#BDB8AE'); }
    this.plane('cvGravel', tx, 0.3, tz, 10.6, 7.6, '#B3B1AB');
    for (const s of [-1, 1]) this.box('whPaint', tx, 0.25, tz + s * 1.2, 6.8, 0.22, 0.25, DK);
    const y0 = 0.47;
    this.box('whPaint', tx, y0, tz, 6.4, 3.9, 3.4, BODY);
    this.box('whPaint', tx, y0 + 3.9, tz, 6.6, 0.12, 3.6, DK);
    for (let k = -3; k <= 3; k++) for (const s of [-1, 1]) this.box('whPaint', tx + k * 0.95, y0 + 0.1, tz + s * 1.72, 0.12, 3.6, 0.06, DK);
    for (const s of [-1, 1]) {
      const zc = tz + s * 2.32;
      for (let k = 0; k < 12; k++) this.box('cvFin', tx - 2.75 + k * 0.5, y0 + 0.35, zc, 0.06, 2.9, 0.9, '#7A887F', { tw: 0.3, th: 2.9 });
      for (const yy of [y0 + 0.45, y0 + 3.15]) {
        this.cylR('whPaint', tx, yy, zc, 0.08, 5.8, DK, 0, 0, Math.PI / 2, 10);
        for (const ex of [-2.9, 2.9]) this.cylR('whPaint', tx + ex, yy, tz + s * 1.95, 0.08, 0.6, DK, Math.PI / 2, 0, 0, 10);
      }
      for (const fx of [-1.6, 1.6]) {
        const fz = tz + s * 2.86;
        this.cylR('flat', tx + fx, y0 + 1.6, fz, 0.44, 0.16, '#4B5257', Math.PI / 2, 0, 0, 18);
        this._gput('shiny', 'torus16', tx + fx, y0 + 1.6, fz + s * 0.09, 0.44, 0.44, 0.44, 0, 0, 0, '#9AA1A6');
        for (let b = 0; b < 3; b++) this.boxR('flat', tx + fx, y0 + 1.6, fz + s * 0.06, 0.09, 0.38, 0.02, '#2D3135', 0, 0, (b * Math.PI * 2) / 3 + 0.3);
      }
    }
    const ct = y0 + 4.02;
    for (const dx of [-1.1, 1.1]) this.box('whPaint', tx + dx, ct, tz + 1.0, 0.12, 0.5, 0.5, DK);
    this.cylR('whPaint', tx, ct + 0.95, tz + 1.0, 0.5, 3.2, BODY, 0, 0, Math.PI / 2, 18);
    for (const s of [-1, 1]) this.sph('whPaint', tx + s * 1.6, ct + 0.95, tz + 1.0, 0.12, 0.5, 0.5, BODY, 14);
    this._cvDial(tx + side * 1.76, ct + 0.95, tz + 1.0, side * Math.PI / 2, 0.13);
    this.tube('whPaint', [[tx - 0.8, ct + 0.5, tz + 1.0], [tx - 0.8, ct + 0.3, tz + 0.7], [tx - 0.8, ct + 0.06, tz + 0.5]], 0.05, DK, 8);
    this.box('whPaint', tx - 0.8, ct + 0.2, tz + 0.66, 0.16, 0.14, 0.16, '#4F5A54');
    for (const dx of [-1.6, 0, 1.6]) { this.cyl('whPaint', tx + dx, ct, tz - 0.8, 0.25, 0.3, DK, 14); this._wInsul('whPaint', tx + dx, ct + 0.3, tz - 0.8, 2.4, POR); }
    for (const dx of [-1.2, 0, 1.2]) { this.cyl('whPaint', tx + dx + 0.3, ct, tz + 0.2, 0.16, 0.2, DK, 12); this._wInsul('whPaint', tx + dx + 0.3, ct + 0.2, tz + 0.2, 1.0, '#8C9396'); }
    const ox = tx - side * 3.45;
    this.box('whPaint', ox, y0 + 0.6, tz - 0.8, 0.5, 1.6, 1.0, DK);
    this.box('shiny', ox - side * 0.26, y0 + 1.3, tz - 0.6, 0.02, 0.18, 0.03, '#D0D5D8');
    this._sign('TR-' + n, 1.0, 0.5, '#FFFFFF', '#1F3A5F', [tx + side * 3.215, y0 + 3.1, tz - 0.4], side * Math.PI / 2, { border: '#1F3A5F' });
    this._sign('อันตราย ไฟฟ้าแรงสูง', 1.4, 0.36, '#C62828', '#FFFFFF', [tx + side * 3.215, y0 + 2.4, tz - 0.4], side * Math.PI / 2, {});
    this._col(tx - 5.5, tz - 4, tx + 5.5, tz + 4);
  }
};
