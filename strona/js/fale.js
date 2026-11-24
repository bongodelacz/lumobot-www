/* Fale z kształtów nad stopką, z wyciętym napisem LUMO.
   Przeniesione z komponentu Shape Waves z React Bits (reactbits.dev), Copyright (c) 2026 David Haz,
   licencja MIT + Commons Clause: wolno używać na stronie, nie wolno sprzedawać samego komponentu.
   Oryginał działa na WebGPU, tu jest przepisany na WebGL2, żeby działał w każdej przeglądarce. */
(function(){
  'use strict';
  const box = document.querySelector('.dl-waves');
  if(!box) return;
  /* tryb statyczny (zrzuty, ?statycznie): ten sam napis LUMO jako obraz, bez WebGL */
  if(/[?&]statycznie/.test(location.search) || document.documentElement.classList.contains('static')){ box.classList.add('static'); return; }
  const canvas = box.querySelector('canvas');
  const gl = canvas.getContext('webgl2', {alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false});
  if(!gl){ box.classList.add('no-gl'); return; }

  const O = {text: box.dataset.text || 'LUMO', fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif', fontWeight: 800, textSize: .62, cellSize: 10, dotSize: .75,
    color: '#8d8f96', hoverColor: '#ffffff', speed: 1, scale: 1, contrast: 1, brightness: .4, fade: .25, splashRadius: 40, splashStrength: .4, glow: .35, introDuration: 1.6};
  const NOISE_CELLS = 32, TIME_RATE = .1, STEP = 1 / 60, WAVE_SPEED = .42, FRICTION = .94, DECAY = .972, SETTLED = .01;
  const BAND = .2, WARP = .3, JITTER = .16, INTRO_END = 1 + WARP + JITTER + BAND;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VS = `#version 300 es
in vec2 aP; void main(){ gl_Position = vec4(aP, 0.0, 1.0); }`;
  const NOISE = `
vec3 m289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 m289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 perm(vec4 x){ return m289(((x * 34.0) + 10.0) * x); }
vec4 tis(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fadeC(vec3 t){ return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float cnoise(vec3 P){
  vec3 Pi0 = floor(P), Pi1 = Pi0 + vec3(1.0); Pi0 = m289(Pi0); Pi1 = m289(Pi1);
  vec3 Pf0 = fract(P), Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x), iy = vec4(Pi0.yy, Pi1.yy), iz0 = Pi0.zzzz, iz1 = Pi1.zzzz;
  vec4 ixy = perm(perm(ix) + iy), ixy0 = perm(ixy + iz0), ixy1 = perm(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0); vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5; gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0); vec4 sz0 = step(gz0, vec4(0.0)); gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0); vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5; gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1); vec4 sz1 = step(gz1, vec4(0.0)); gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x), g100 = vec3(gx0.y, gy0.y, gz0.y), g010 = vec3(gx0.z, gy0.z, gz0.z), g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x), g101 = vec3(gx1.y, gy1.y, gz1.y), g011 = vec3(gx1.z, gy1.z, gz1.z), g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 n0 = tis(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110))); g000 *= n0.x; g010 *= n0.y; g100 *= n0.z; g110 *= n0.w;
  vec4 n1 = tis(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111))); g001 *= n1.x; g011 *= n1.y; g101 *= n1.z; g111 *= n1.w;
  float n000 = dot(g000, Pf0), n100 = dot(g100, vec3(Pf1.x, Pf0.yz)), n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)), n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)), n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z)), n011 = dot(g011, vec3(Pf0.x, Pf1.yz)), n111 = dot(g111, Pf1);
  vec3 f = fadeC(Pf0); vec4 nz = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), f.z); vec2 ny = mix(nz.xy, nz.zw, f.y);
  return 2.2 * mix(ny.x, ny.y, f.x);
}
float fbm(vec3 p){ float t = 0.0, a = 1.0, w = 0.0, fr = 1.0; for(int i = 0; i < 2; i++){ t += a * cnoise(p * fr); w += a; a *= 0.5; fr *= 2.0; } return t / w; }`;
  const SCENE = `#version 300 es
precision highp float; precision highp int;
uniform vec2 uRes; uniform vec4 uPlace; uniform vec4 uGrid; uniform vec4 uField; uniform vec4 uMotion;
uniform vec3 uColor; uniform vec3 uHover; uniform vec3 uBg; uniform sampler2D uMask; uniform sampler2D uCharge;
out vec4 o;
const vec2 SEED = vec2(12.9898, 78.233);
${NOISE}
float tri(vec2 point, vec2 q){ vec2 p = vec2(abs(point.x), point.y); vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0); float s = -sign(q.y);
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y))); return -sqrt(d.x) * sign(d.y); }
float shapeD(vec2 p, int sh, float c){ if(sh == 0) return max(abs(p.x), abs(p.y)) - c; if(sh == 1) return length(p) - c; return tri(vec2(p.x, p.y + c), vec2(c, 2.0 * c)); }
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 pixel = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y), uv = pixel / uRes;
  float cellPx = uGrid.x, dotSize = uGrid.y; int cols = int(uGrid.w + 0.5), rows = int(uPlace.z + 0.5);
  vec2 cell = floor((pixel - uPlace.xy) / cellPx);
  if(cell.y < 0.0 || int(cell.y) >= rows || cell.x < 0.0 || int(cell.x) >= cols){ o = vec4(uBg, 0.0); return; }
  vec2 center = uPlace.xy + (cell + 0.5) * cellPx, local = (pixel - center) / (cellPx * 0.5), cellUv = center / uRes;
  if(uMotion.z > 0.5 && texture(uMask, cellUv).r > 0.5){ o = vec4(uBg, 0.0); return; }
  float level = 1.0;
  if(uMotion.w > 0.0){ vec2 q = abs(uv * 2.0 - 1.0); float r = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5); level = 1.0 - smoothstep(max(0.0, 1.0 - uMotion.w * 2.2), 1.0, r); }
  float n = fbm(vec3((center + uMotion.xy) / uField.x + SEED, uField.w));
  float tone = clamp((n * 0.5 + 0.5 - uField.y) * uField.z + 0.5, 0.0, 1.0);
  int band = int(min(tone, 0.999999) * 3.0);
  float charge = texelFetch(uCharge, ivec2(cell), 0).r;
  int stepped = (band + int(clamp(charge, 0.0, 0.999) * 3.0)) % 3;
  int sh = 2 - stepped; float size = dotSize;
  float ip = uPlace.w, front = 0.0;
  if(ip < ${INTRO_END.toFixed(2)}){
    float radial = length((center - uRes * 0.5) / (uRes * 0.5)) * 0.70710678;
    float warp = cnoise(vec3(cellUv * vec2(3.2, 2.4) + SEED, 4.7)) * ${WARP.toFixed(2)};
    float spread = radial + warp + h21(cell) * ${JITTER.toFixed(2)} + ${WARP.toFixed(2)};
    float bd = ${BAND.toFixed(2)} * (0.6 + 0.8 * h21(cell + vec2(17.0, 9.0)));
    float t = clamp((ip - spread) / bd, 0.0, 1.0);
    if(t <= 0.0){ o = vec4(uBg, 0.0); return; }
    float back = t - 1.0; size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);
    front = 1.0 - smoothstep(0.0, 1.0, abs(ip - spread) / bd);
  }
  float aa = 2.0 / cellPx, cov = smoothstep(aa, -aa, shapeD(local, sh, size));
  vec3 tint = mix(uColor, uHover, max(smoothstep(0.15, 0.85, charge), front * 0.35));
  vec3 rgb = mix(uBg, tint, cov * level);
  float lum = dot(tint * level, vec3(0.2126, 0.7152, 0.0722));
  o = vec4(rgb, max(0.0, (lum - 0.6) / 0.4) * cov);
}`;
  const BLUR = `#version 300 es
precision highp float; uniform sampler2D uSrc; uniform vec2 uSize; uniform vec4 uDir; out vec4 o;
void main(){ vec2 uv = gl_FragCoord.xy / uSize; float sg = uDir.z; int r = int(ceil(3.0 * sg)); vec3 s = vec3(0.0); float w = 0.0;
  for(int i = -12; i <= 12; i++){ if(i < -r || i > r) continue; float f = float(i), k = exp(-(f * f) / (2.0 * sg * sg)); vec4 c = texture(uSrc, uv + f * uDir.xy);
    s += (uDir.w > 0.5 ? c.rgb * c.a : c.rgb) * k; w += k; }
  o = vec4(s / w, 1.0); }`;
  const COMP = `#version 300 es
precision highp float; uniform sampler2D uScene; uniform sampler2D uGlow; uniform vec2 uSize; uniform float uK; out vec4 o;
void main(){ vec2 uv = gl_FragCoord.xy / uSize; o = vec4(texture(uScene, uv).rgb + texture(uGlow, uv).rgb * uK, 1.0); }`;

  const prog = (fs) => { const p = gl.createProgram();
    [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]].forEach(([t, s]) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
      if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
    gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p); if(!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; for(let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++){ const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
    return {p, u}; };
  let P;
  try { P = {scene: prog(SCENE), blur: prog(BLUR), comp: prog(COMP)}; } catch(e){ box.classList.add('no-gl'); console.warn('fale:', e.message); return; }
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = (filter) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
  const target = () => { const t = tex(gl.LINEAR), f = gl.createFramebuffer(); return {t, f, w: 1, h: 1}; };
  const size = (T, w, h) => { T.w = w; T.h = h; gl.bindTexture(gl.TEXTURE_2D, T.t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, T.f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.t, 0); };
  const sceneT = target(), glowA = target(), glowB = target(), maskT = tex(gl.LINEAR), chargeT = tex(gl.NEAREST);
  const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
  /* kolor tła bierzemy z pierwszego nieprzezroczystego rodzica, żeby fale zlewały się ze stroną */
  const bgColor = () => { for(let e = box; e; e = e.parentElement){ const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g); if(m && (m.length < 4 || +m[3] > .5)) return m.slice(0, 3).map(v => +v / 255); } return [26 / 255, 26 / 255, 26 / 255]; };
  let BG = bgColor();

  let W = 1, H = 1, dpr = 1, cols = 1, rows = 1, cellPx = 10, origin = [0, 0];
  let charges = new Float32Array(1), heights = new Float32Array(1), prev = new Float32Array(1), bytes = new Uint8Array(1);
  let active = false, backlog = 0, time = 0, intro = still ? INTRO_END : 0, introStart = 0, armed = !still, raf = 0, last = 0, visible = false, bounds = null;
  const ptr = {x: 0, y: 0, at: 0, inside: false};

  const drawMask = () => { const c = document.createElement('canvas'), k = Math.min(1, 1024 / Math.max(W, H)); c.width = Math.max(1, Math.round(W * k)); c.height = Math.max(1, Math.round(H * k));
    const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
    let fs = Math.max(1, O.textSize * c.height); x.font = `${O.fontWeight} ${fs}px ${O.fontFamily}`;
    const mw = x.measureText(O.text).width; if(mw > c.width * .9){ fs = fs * c.width * .9 / mw; x.font = `${O.fontWeight} ${fs}px ${O.fontFamily}`; }
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; const m = x.measureText(O.text);
    x.fillStyle = '#fff'; x.fillText(O.text, (c.width + m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2, (c.height + m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    gl.bindTexture(gl.TEXTURE_2D, maskT); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); };
  const grid = () => { const nc = Math.max(1, Math.round(W / (O.cellSize * dpr))); cellPx = W / nc; const nr = Math.max(1, Math.floor(H / cellPx)); origin = [0, (H - nr * cellPx) / 2];
    if(nc === cols && nr === rows && charges.length === nc * nr) return; cols = nc; rows = nr;
    charges = new Float32Array(cols * rows); heights = new Float32Array(cols * rows); prev = new Float32Array(cols * rows); bytes = new Uint8Array(cols * rows); active = false; uploadCharges(); };
  const uploadCharges = () => { for(let i = 0; i < charges.length; i++) bytes[i] = Math.round(charges[i] * 255);
    gl.bindTexture(gl.TEXTURE_2D, chargeT); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, bytes); };
  const resize = () => { dpr = Math.min(devicePixelRatio || 1, 1.25); W = Math.max(1, Math.round(canvas.clientWidth * dpr)); H = Math.max(1, Math.round(canvas.clientHeight * dpr));
    canvas.width = W; canvas.height = H; size(sceneT, W, H); const hw = Math.max(1, Math.ceil(W / 2)), hh = Math.max(1, Math.ceil(H / 2)); size(glowA, hw, hh); size(glowB, hw, hh);
    BG = bgColor(); bounds = null; grid(); drawMask(); wake(); };

  const splash = (x, y, s) => { const sg = Math.max(.5, O.splashRadius * dpr / cellPx * .5), reach = Math.ceil(sg * 2.5), cc = (x * dpr - origin[0]) / cellPx - .5, cr = (y * dpr - origin[1]) / cellPx - .5;
    for(let r = Math.max(0, Math.floor(cr - reach)); r <= Math.min(rows - 1, Math.ceil(cr + reach)); r++) for(let c = Math.max(0, Math.floor(cc - reach)); c <= Math.min(cols - 1, Math.ceil(cc + reach)); c++){
      const dx = c - cc, dy = r - cr, i = r * cols + c; heights[i] = Math.min(1.2, heights[i] + s * Math.exp(-(dx * dx + dy * dy) / (2 * sg * sg))); }
    active = true; };
  const ripple = () => { let peak = 0; const lc = cols - 1, lr = rows - 1;
    for(let r = 0; r < rows; r++){ const up = (r === 0 ? r : r - 1) * cols, dn = (r === lr ? r : r + 1) * cols, b = r * cols;
      for(let c = 0; c < cols; c++){ const i = b + c, h = heights[i], lap = heights[b + (c === 0 ? c : c - 1)] + heights[b + (c === lc ? c : c + 1)] + heights[up + c] + heights[dn + c] - 4 * h;
        const nx = (h + (h - prev[i]) * FRICTION + WAVE_SPEED * lap) * DECAY; prev[i] = nx; const ch = Math.min(1, Math.max(0, nx)); charges[i] = ch; if(ch > peak) peak = ch; } }
    const t = heights; heights = prev; prev = t; return peak; };
  const stepCharges = dt => { if(!active) return false; backlog = Math.min(backlog + dt, STEP * 4); let peak = 1;
    while(backlog >= STEP){ backlog -= STEP; peak = ripple(); }
    if(peak < SETTLED){ heights.fill(0); prev.fill(0); charges.fill(0); active = false; } uploadCharges(); return active; };

  const pass = (T, p) => { gl.bindFramebuffer(gl.FRAMEBUFFER, T ? T.f : null); gl.viewport(0, 0, T ? T.w : W, T ? T.h : H); gl.useProgram(p.p); };
  const bindTex = (u, t, unit) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(u, unit); };
  const render = now => {
    raf = 0; const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
    const moving = visible && !document.hidden && !still; if(moving) time += dt * TIME_RATE * O.speed;
    const hovering = visible && !document.hidden && stepCharges(dt);
    if(armed && visible){ armed = false; introStart = now; intro = 0; }
    const playing = intro < INTRO_END; if(playing && !armed) intro = Math.min(INTRO_END, (now - introStart) / 1000 / O.introDuration * INTRO_END);
    const S = P.scene; pass(sceneT, S);
    gl.uniform2f(S.u.uRes, W, H); gl.uniform4f(S.u.uPlace, origin[0], origin[1], rows, intro); gl.uniform4f(S.u.uGrid, cellPx, O.dotSize, 0, cols);
    gl.uniform4f(S.u.uField, NOISE_CELLS * cellPx * O.scale, .5 - (O.brightness - .5) * .4, 2.8 * O.contrast, time); gl.uniform4f(S.u.uMotion, 0, 0, O.text ? 1 : 0, O.fade);
    gl.uniform3fv(S.u.uColor, hex(O.color)); gl.uniform3fv(S.u.uHover, hex(O.hoverColor)); gl.uniform3fv(S.u.uBg, BG);
    bindTex(S.u.uMask, maskT, 0); bindTex(S.u.uCharge, chargeT, 1); gl.drawArrays(gl.TRIANGLES, 0, 3);
    const B = P.blur; pass(glowA, B); gl.uniform2f(B.u.uSize, glowA.w, glowA.h); gl.uniform4f(B.u.uDir, 1 / glowA.w, 0, 4, 1); bindTex(B.u.uSrc, sceneT.t, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    pass(glowB, B); gl.uniform2f(B.u.uSize, glowB.w, glowB.h); gl.uniform4f(B.u.uDir, 0, 1 / glowB.h, 4, 0); bindTex(B.u.uSrc, glowA.t, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    const C = P.comp; pass(null, C); gl.uniform2f(C.u.uSize, W, H); gl.uniform1f(C.u.uK, 2 * O.glow); bindTex(C.u.uScene, sceneT.t, 0); bindTex(C.u.uGlow, glowB.t, 1); gl.drawArrays(gl.TRIANGLES, 0, 3);
    box.classList.add('ready');
    if(visible && (moving || hovering || playing)) raf = requestAnimationFrame(render); else last = 0;
  };
  function wake(){ if(!raf) raf = requestAnimationFrame(render); }

  window.addEventListener('pointermove', e => { if(!bounds) bounds = box.getBoundingClientRect(); const now = performance.now(), x = e.clientX - bounds.left, y = e.clientY - bounds.top;
    const inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height;
    if(inside){ const el = ptr.inside ? Math.max(8, now - ptr.at) : 16, tr = ptr.inside ? Math.hypot(x - ptr.x, y - ptr.y) : 0; splash(x, y, Math.min(1, .22 + tr / el * 1000 * .0006) * O.splashStrength); wake(); }
    ptr.x = x; ptr.y = y; ptr.at = now; ptr.inside = inside; }, {passive: true});
  window.addEventListener('scroll', () => { bounds = null; }, {capture: true, passive: true});
  document.addEventListener('visibilitychange', wake);
  /* widoczność liczona z pozycji na ekranie (działa też tam, gdzie IntersectionObserver się spóźnia) */
  const seen = () => { const r = box.getBoundingClientRect(), v = r.bottom > 0 && r.top < innerHeight && r.height > 0; if(v !== visible){ visible = v; if(v) wake(); } };
  new IntersectionObserver(seen).observe(box);
  addEventListener('scroll', seen, {passive: true}); addEventListener('resize', seen); setTimeout(seen, 300);
  new ResizeObserver(resize).observe(box);
  resize();
  if(document.fonts && document.fonts.load) document.fonts.load(`${O.fontWeight} 32px ${O.fontFamily}`).then(() => { drawMask(); wake(); }).catch(() => {});
})();
