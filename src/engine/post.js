/* GHG Town 3D v1.1 — screen-space finish: soft contact shading (ambient occlusion) + a light ink outline,
   for a "realistic, a touch cartoon" look across the whole map.
   The frame is drawn to the screen as before; a depth-only pass of the opaque scene (near range, full size)
   feeds a half-size AO pass and a depth-aware blur; the last pass multiplies AO and silhouette ink over the frame.
   WebGL2 only, skipped on phones; tune.js switches it off at the lowest quality steps.                   */
GHG3.post = {
  _initPost() {
    const E = this._E;
    const T = E.T;
    const R = E.renderer;
    E.post = null;
    if (!R.capabilities.isWebGL2) return;
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (coarse && Math.min(screen.width, screen.height) < 820) return;
    const P = E.post = { on: true, w: 0, h: 0, far: 140 };
    const rt = (depth) => {
      const t = new T.WebGLRenderTarget(2, 2, { depthBuffer: depth });
      t.texture.generateMipmaps = false;
      return t;
    };
    P.depthRT = rt(true);
    P.depthRT.depthTexture = new T.DepthTexture(2, 2, T.FloatType);
    P.aoRT = rt(false);
    P.blurRT = rt(false);
    P.blank = new T.MeshBasicMaterial({ colorWrite: false });
    P.cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    P.dcam = new T.PerspectiveCamera();
    const quad = new T.PlaneGeometry(2, 2);
    const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
    const LZ = 'uniform float near; uniform float far; float lz(vec2 uv){ float d = texture2D(tDepth, uv).x; return near * far / (far - d * (far - near)); }';
    const pass = (mat) => { const s = new T.Scene(); s.add(new T.Mesh(quad, mat)); return s; };
    P.aoMat = new T.ShaderMaterial({
      uniforms: {
        tDepth: { value: P.depthRT.depthTexture }, projInv: { value: new T.Matrix4() }, proj: { value: new T.Matrix4() },
        res: { value: new T.Vector2(1, 1) }, radius: { value: 1.05 }, intensity: { value: 4.2 }, bias: { value: 0.004 }, fadeFar: { value: 80 }
      },
      vertexShader: vs,
      fragmentShader: [
        'uniform sampler2D tDepth; uniform mat4 projInv; uniform mat4 proj; uniform vec2 res;',
        'uniform float radius; uniform float intensity; uniform float bias; uniform float fadeFar; varying vec2 vUv;',
        'vec3 vpos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 p = projInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return p.xyz / p.w; }',
        'void main(){',
        '  float d = texture2D(tDepth, vUv).x;',
        '  if (d >= 0.99999) { gl_FragColor = vec4(1.0); return; }',
        '  vec3 P = vpos(vUv);',
        '  vec2 tx = vec2(1.0 / res.x, 0.0), ty = vec2(0.0, 1.0 / res.y);',
        '  vec3 pr = vpos(vUv + tx) - P, pl = P - vpos(vUv - tx), pu = vpos(vUv + ty) - P, pd = P - vpos(vUv - ty);',
        '  vec3 N = normalize(cross(abs(pr.z) < abs(pl.z) ? pr : pl, abs(pu.z) < abs(pd.z) ? pu : pd));',
        '  float dist = -P.z;',
        '  float rs = min(radius * proj[1][1] / dist * 0.5, 0.1);',
        '  float b = bias * dist * (1.0 + 8.0 * (1.0 - abs(dot(N, normalize(-P)))));',
        '  float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));',
        '  float sum = 0.0;',
        '  for (int i = 0; i < 12; i++) {',
        '    float t = (float(i) + 0.5) / 12.0;',
        '    float a = float(i) * 2.39996323 + n * 6.2831853;',
        '    vec2 off = vec2(cos(a) * res.y / res.x, sin(a)) * rs * sqrt(t);',
        '    vec2 su = vUv + off;',
        '    if (su.x < 0.0 || su.x > 1.0 || su.y < 0.0 || su.y > 1.0) continue;',
        '    vec3 v = vpos(su) - P;',
        '    float vv = dot(v, v);',
        '    float fall = max(0.0, 1.0 - vv / (radius * radius * 3.0));',
        '    sum += max(0.0, dot(v, N) - b - 0.035) / (vv + 0.06) * fall;',
        '  }',
        '  float ao = clamp(1.0 - intensity * sum * 0.05, 0.0, 1.0);',
        '  ao = mix(pow(ao, 1.3), 1.0, smoothstep(fadeFar * 0.55, fadeFar, dist));',
        '  gl_FragColor = vec4(vec3(ao), 1.0);',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false
    });
    P.aoScene = pass(P.aoMat);
    // depth-aware 5 x 5 blur at half size
    P.blurMat = new T.ShaderMaterial({
      uniforms: { tAO: { value: P.aoRT.texture }, tDepth: { value: P.depthRT.depthTexture }, texel: { value: new T.Vector2(1, 1) }, near: { value: 0.12 }, far: { value: 140 } },
      vertexShader: vs,
      fragmentShader: [
        'uniform sampler2D tAO; uniform sampler2D tDepth; uniform vec2 texel; varying vec2 vUv;', LZ,
        'void main(){',
        '  float z0 = lz(vUv);',
        '  float s = 0.0, ws = 0.0;',
        '  for (int x = -2; x <= 2; x++) for (int y = -2; y <= 2; y++) {',
        '    vec2 uv = vUv + vec2(float(x), float(y)) * texel;',
        '    float w = exp(-abs(lz(uv) - z0) / (0.05 + 0.03 * z0)) * (1.0 - 0.12 * float(x * x + y * y));',
        '    s += texture2D(tAO, uv).r * w; ws += w;',
        '  }',
        '  gl_FragColor = vec4(vec3(ws > 0.0 ? s / ws : 1.0), 1.0);',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false
    });
    P.blurScene = pass(P.blurMat);
    // final: AO + ink on the near side of silhouettes, multiplied over the frame
    P.compMat = new T.ShaderMaterial({
      uniforms: {
        tAO: { value: P.blurRT.texture }, tDepth: { value: P.depthRT.depthTexture }, texelD: { value: new T.Vector2(1, 1) },
        near: { value: 0.12 }, far: { value: 140 }, strength: { value: 0.8 }, outline: { value: 0.38 }, inkFar: { value: 70 }
      },
      vertexShader: vs,
      fragmentShader: [
        'uniform sampler2D tAO; uniform sampler2D tDepth; uniform vec2 texelD; uniform float strength; uniform float outline; uniform float inkFar; varying vec2 vUv;', LZ,
        'void main(){',
        '  float z0 = lz(vUv);',
        '  float zn = max(max(lz(vUv + vec2(texelD.x, 0.0)), lz(vUv - vec2(texelD.x, 0.0))), max(lz(vUv + vec2(0.0, texelD.y)), lz(vUv - vec2(0.0, texelD.y))));',
        '  float e = smoothstep(0.05, 0.16, (zn - z0) / z0) * (1.0 - smoothstep(inkFar * 0.5, inkFar, z0));',
        '  float ao = texture2D(tAO, vUv).r;',
        '  gl_FragColor = vec4(vec3(mix(1.0, ao, strength) * (1.0 - outline * e)), 1.0);',
        '}'
      ].join('\n'),
      blending: T.MultiplyBlending, depthTest: false, depthWrite: false, toneMapped: false
    });
    P.compScene = pass(P.compMat);
    // see-through things (glass, smoke, decals, labels, sprites) stay out of the depth pass: layer 2.
    // Shadow cameras look at layer 2 too, so their own castShadow settings still apply.
    E.cam.layers.enable(2);
    E.sun.shadow.camera.layers.enable(2);
    for (const S of E.spots || []) S.shadow.camera.layers.enable(2);
    this._postLayers();
    setTimeout(() => { if (this._E === E) this._postLayers(); }, 4000);
  },
  _postLayers() {
    const E = this._E;
    const T = E.T;
    E.scene.traverse((o) => {
      if (!o.material) return;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      const see = o.isSprite || o.isPoints || o.isLine || ms.some((m) => m.transparent || m.alphaTest > 0 || m.blending !== T.NormalBlending || m.colorWrite === false || m.depthWrite === false);
      if (see) o.layers.set(2);
    });
  },
  _postSize() {
    const E = this._E;
    const P = E.post;
    const pr = E.renderer.getPixelRatio();
    const w = Math.max(2, Math.round(E.w * pr)), h = Math.max(2, Math.round(E.h * pr));
    if (w === P.w && h === P.h) return;
    P.w = w; P.h = h;
    const hw = Math.max(2, w >> 1), hh = Math.max(2, h >> 1);
    P.depthRT.setSize(w, h);
    P.aoRT.setSize(hw, hh);
    P.blurRT.setSize(hw, hh);
    P.aoMat.uniforms.res.value.set(hw, hh);
    P.blurMat.uniforms.texel.value.set(1 / hw, 1 / hh);
    P.compMat.uniforms.texelD.value.set(1 / w, 1 / h);
  },
  // main frame + AO + ink (called from core._loop)
  _postRender() {
    const E = this._E;
    const P = E.post;
    const R = E.renderer;
    R.render(E.scene, E.cam);
    if (!P || !P.on || !E.w) return;
    this._postSize();
    // depth of opaque things within P.far, same view as the frame
    const C = P.dcam;
    C.copy(E.cam, false);
    C.far = Math.min(E.cam.far, P.far);
    C.layers.set(0);
    C.updateProjectionMatrix();
    const smU = R.shadowMap.autoUpdate;
    R.shadowMap.autoUpdate = false;
    const bg = E.scene.background;
    E.scene.background = null;
    E.scene.overrideMaterial = P.blank;
    R.setRenderTarget(P.depthRT);
    R.clear();
    R.render(E.scene, C);
    E.scene.overrideMaterial = null;
    E.scene.background = bg;
    R.shadowMap.autoUpdate = smU;
    const U = P.aoMat.uniforms;
    U.proj.value.copy(C.projectionMatrix);
    U.projInv.value.copy(C.projectionMatrixInverse);
    for (const m of [P.blurMat, P.compMat]) { m.uniforms.near.value = C.near; m.uniforms.far.value = C.far; }
    R.setRenderTarget(P.aoRT);
    R.render(P.aoScene, P.cam);
    R.setRenderTarget(P.blurRT);
    R.render(P.blurScene, P.cam);
    R.setRenderTarget(null);
    const ac = R.autoClear;
    R.autoClear = false;
    R.render(P.compScene, P.cam);
    R.autoClear = ac;
  }
};
