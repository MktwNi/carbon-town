/* GHG Town 3D v0.3 — terrain: coarse grid everywhere + fine patch over the forest hill (heights from GHG3L.H) */
GHG3.terrain = {
  _groundY(x, z) { return window.GHG3L.H(x, z); },

  _bTerrain() {
    const L = window.GHG3L;
    const H = L.H;
    const R = this._rng(4242);
    // colour variation (breaks texture tiling): low-frequency value noise
    const nz = (x, z) => 0.5 + 0.25 * Math.sin(x / 97 + Math.cos(z / 131)) + 0.25 * Math.sin(z / 83 - x / 157);
    const col = (x, z, h) => {
      const n = nz(x, z);
      const dry = this._mixc('#FFFFFF', '#E9DDB0', this._cl(n - 0.45, 0, 0.6));
      const hi = this._cl((h - 40) / 140, 0, 1);
      return this._mixc(dry, '#B7C4A0', hi * 0.7);
    };
    const grid = (x0, z0, x1, z1, cell, skip) => {
      const nx = Math.round((x1 - x0) / cell), nzc = Math.round((z1 - z0) / cell);
      for (let j = 0; j < nzc; j++) {
        for (let i = 0; i < nx; i++) {
          const ax = x0 + i * cell, az = z0 + j * cell, bx = ax + cell, bz = az + cell;
          if (skip && skip(ax, az, bx, bz)) continue;
          const A = this._A('terrain', ax + cell / 2, az + cell / 2);
          const bk = this._bkInfo(A);
          const k = A.vc;
          const pts = [[ax, bz], [bx, bz], [bx, az], [ax, az]];
          for (const p of pts) {
            const h = H(p[0], p[1]);
            const e = 2;
            const nx2 = H(p[0] - e, p[1]) - H(p[0] + e, p[1]);
            const nz2 = H(p[0], p[1] - e) - H(p[0], p[1] + e);
            const nl = Math.hypot(nx2, 2 * e, nz2);
            A.p.push(p[0], h, p[1]);
            A.n.push(nx2 / nl, (2 * e) / nl, nz2 / nl);
            A.u.push(p[0] / bk.tw, -p[1] / bk.th);
            const c = col(p[0], p[1], h);
            A.c.push(c[0], c[1], c[2]);
          }
          A.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
          A.vc += 4;
        }
      }
    };
    // fine patch over the hill (aligned to the 100 m coarse grid)
    const P = [-500, -1400, 500, -400];
    grid(-3600, -3600, 3600, 3600, 100, (ax, az, bx, bz) => ax >= P[0] && bx <= P[2] && az >= P[1] && bz <= P[3]);
    grid(P[0], P[1], P[2], P[3], 10, null);
    void R;
  }
};
