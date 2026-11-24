
/* Grainient: ziarnisty, płynący gradient w paskach i kwadratach highbara.
   Przeniesione z komponentu Grainient z React Bits (reactbits.dev), Copyright (c) 2026 David Haz,
   licencja MIT + Commons Clause: wolno używać na stronie, nie wolno sprzedawać samego komponentu.
   Ustawienia 1:1 z podglądu (preset lagoon). Bez myszy: kursor nic nie robi.
   Jeden wspólny kontekst WebGL rysuje po kolei każdy pasek i kwadrat i kopiuje obraz do jego płótna. */
window.lumoGrain = (function(){
const MAX_COLORS = 8;
const MAX_STIRS = 24;
const MAX_TWIRLS = 4;
const STIR_LIFE = 1.3;
const STIR_STEP = 0.06;
const TWIRL_LIFE = 2.6;
const INTRO_SECONDS = 1.6;
const DEFAULT_COLORS = ['#3b2f6b', '#8a3518', '#9a3412', '#f97316', '#fed7aa'];
const TYPES = { linear: 0, radial: 1 };
const LIFT = 0.2;

const VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FIELD = `#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uTime;
uniform vec3 uRamp[8];
uniform int uCount;
uniform int uType;
uniform vec2 uDir;
uniform float uExtent;
uniform float uBands;
uniform float uSoftness;
uniform float uFlow;
uniform float uScale;
uniform float uSilk;
uniform vec4 uStir[24];
uniform float uStirWeight[24];
uniform vec4 uTwirl[4];
uniform vec2 uSeed;
uniform float uContrast;
uniform float uSaturation;
uniform float uSettle;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 drift(vec2 p, float t) {
  vec2 w1 = vec2(
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))
  );
  vec2 w2 = vec2(
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)
  );
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;
}

vec2 warp(vec2 p) {
  vec2 q = p / uScale;
  if (uType == 1) {
    float turn = uTime * 0.35;
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;
  } else {
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;
  }
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;
}

float coord(vec2 p) {
  vec2 w = warp(p);
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;
}

vec3 labToRgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  for (int i = 0; i < 24; i++) {
    float w = uStirWeight[i];
    if (w <= 0.0) continue;
    vec2 d = p - uStir[i].xy;
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);
  }
  for (int i = 0; i < 4; i++) {
    float angle = uTwirl[i].z;
    if (angle == 0.0) continue;
    vec2 d = p - uTwirl[i].xy;
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));
    float c = cos(a);
    float s = sin(a);
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;
  }
  float raw = coord(p);
  float s = raw;
  if (uBands > 1.0) {
    s *= uBands;
    float cycle = floor(s);
    s = fract(s);
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;
  }
  s = clamp(s, 0.0, 1.0);
  float scaled = s * float(uCount - 1);
  int index = int(min(floor(scaled), float(uCount - 2)));
  float f = scaled - float(index);
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);
  vec3 from = uRamp[0];
  vec3 to = uRamp[1];
  for (int i = 0; i < 7; i++) {
    if (i == index) {
      from = uRamp[i];
      to = uRamp[i + 1];
    }
  }
  vec3 lab = mix(from, to, shaped);
  if (uSilk > 0.0) {
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;
    vec3 normal = normalize(vec3(-slope, 1.0));
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));
    float diffuse = dot(normal, light) - light.z;
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);
  }
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));
  lab.x = (lab.x - 0.55) * uContrast + 0.55;
  lab.yz *= uSaturation;
  outColor = vec4(encode(labToRgb(lab)), 1.0);
}`;

const COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform float uGrain;
uniform float uGrainSize;
uniform float uFrame;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float clump(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec3 color = texture(uField, vUv).rgb;
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toLinear = value => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);

const toLab = ([r, g, b]) => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl, fragmentSource) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    const name = info.name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
};


  /* preset aurora z podglądu: kąt 100, flow 1.1, połysk 0.6; pasy 0, czyli jeden płynny gradient (komponent liczy to jako 1) */
  const SET = {count: 4, type: 0, angle: 100, bands: 1, speed: 3.2, flow: 1.6, scale: 1, softness: 1, silk: .6,
    grainAmount: .022, grainSize: 1, contrast: 1, saturation: 1};      /* szybciej, mocniej płynie, ziarno prawie niewidoczne */
  /* palety: ciemny (>=30% HSL), średni, jasny, biały, jak preset lagoon, tylko w różnych kolorach */
  const PALS = {lagoon: ['#166d82', '#0e5f74', '#2dd4bf', '#cffafe'], ocean: ['#1e3a8a', '#2563eb', '#60a5fa', '#dbeafe'], violet: ['#3b2f6b', '#4c1d95', '#a78bfa', '#ede9fe'],
    rose: ['#7a1f4b', '#9d174d', '#f472b6', '#fce7f3'], ember: ['#8a3518', '#9a3412', '#fb923c', '#ffedd5'], forest: ['#1b7a5d', '#047857', '#34d399', '#ecfccb'], gold: ['#855b16', '#a16207', '#facc15', '#fef9c3']};
  const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
  const minLight = ([r, g, b]) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (l >= 0.46 || l <= 0) return l <= 0 ? [0.46, 0.46, 0.46] : [r, g, b];
    const k = 0.46 / l;
    return [Math.min(1, r * k), Math.min(1, g * k), Math.min(1, b * k)];
  };
  const rampOf = cs => { const r = new Float32Array(MAX_COLORS * 3); cs.map(x => toLab(minLight(hex(x)))).forEach((lab, i) => r.set(lab, i * 3)); return r; };
  let G = null;
  const items = [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setup(){
    if(G !== null) return G;
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2', {alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true});
    if(!gl) return (G = false);
    const field = link(gl, FIELD), comp = link(gl, COMPOSITE);
    if(!field || !comp) return (G = false);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    return (G = {c, gl, field, comp, tex, fb, vao: gl.createVertexArray(), fw: 0, fh: 0, stirs: new Float32Array(MAX_STIRS * 4), sw: new Float32Array(MAX_STIRS), tw: new Float32Array(MAX_TWIRLS * 4)});
  }
  function draw(it){
    const {c, gl, field, comp, tex, fb, vao} = G, ramp = it.ramp, fu = field.uniforms, cu = comp.uniforms, s = SET;
    const ratio = Math.min(devicePixelRatio || 1, 2), w = Math.max(1, it.box.clientWidth), h = Math.max(1, it.box.clientHeight);
    const W = Math.max(1, Math.round(w * ratio)), H = Math.max(1, Math.round(h * ratio));
    if(it.canvas.width !== W || it.canvas.height !== H){ it.canvas.width = W; it.canvas.height = H; }
    if(c.width < W || c.height < H){ c.width = Math.max(c.width, W); c.height = Math.max(c.height, H); }
    const fw = W, fh = H;                         /* pole w pełnej rozdzielczości: bez pikseli */
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if(fw !== G.fw || fh !== G.fh){ G.fw = fw; G.fh = fh; gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); }
    const aspect = w / h, rad = it.angle * Math.PI / 180;
    gl.bindVertexArray(vao); gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, fw, fh); gl.useProgram(field.program);
    gl.uniform1f(fu.uAspect, aspect); gl.uniform1f(fu.uTime, it.time); gl.uniform3fv(fu.uRamp, ramp); gl.uniform1i(fu.uCount, s.count);
    gl.uniform1i(fu.uType, s.type); gl.uniform2f(fu.uDir, Math.sin(rad), Math.cos(rad)); gl.uniform1f(fu.uExtent, aspect * Math.abs(Math.sin(rad)) + Math.abs(Math.cos(rad)));
    gl.uniform1f(fu.uBands, s.bands); gl.uniform1f(fu.uSoftness, s.softness); gl.uniform1f(fu.uFlow, s.flow); gl.uniform1f(fu.uScale, s.scale); gl.uniform1f(fu.uSilk, s.silk);
    gl.uniform4fv(fu.uStir, G.stirs); gl.uniform1fv(fu.uStirWeight, G.sw); gl.uniform4fv(fu.uTwirl, G.tw);
    gl.uniform2f(fu.uSeed, it.seed * 3.17, it.seed * 1.91); gl.uniform1f(fu.uContrast, s.contrast); gl.uniform1f(fu.uSaturation, s.saturation);
    const k = it.intro; gl.uniform1f(fu.uSettle, k * k * (3 - 2 * k)); gl.uniform1f(fu.uReveal, k);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, c.height - H, W, H); gl.useProgram(comp.program);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(cu.uField, 0);
    gl.uniform1f(cu.uGrain, s.grainAmount); gl.uniform1f(cu.uGrainSize, s.grainSize * ratio); gl.uniform1f(cu.uFrame, it.frame);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    it.ctx.clearRect(0, 0, W, H); it.ctx.drawImage(c, 0, 0, W, H, 0, 0, W, H);
  }
  let raf = 0, last = 0;
  function frame(now){
    raf = 0; const on = items.filter(it => it.active());
    if(document.hidden || !on.length){ last = 0; return; }
    const dt = last ? clamp((now - last) / 1000, .001, .05) : 1 / 60; last = now;
    on.forEach(it => { if(!reduce) it.time += dt * SET.speed * .16; if(it.intro < 1) it.intro = Math.min(1, it.intro + dt / INTRO_SECONDS);
      it.gc += dt; if(!reduce && it.gc > 1 / 24){ it.gc = 0; it.frame = (it.frame + 1) % 97; } draw(it); });
    if(!reduce) raf = requestAnimationFrame(frame);
  }
  function wake(){ if(!raf) raf = requestAnimationFrame(frame); }
  /* box: element, który ma dostać gradient; active(): czy menu z nim jest otwarte; seed: żeby każdy wyglądał trochę inaczej */
  function add(box, active, seed, pal){
    if(!setup()) return null;
    const canvas = document.createElement('canvas'); canvas.className = 'kf-grain'; canvas.setAttribute('aria-hidden', 'true'); box.prepend(canvas);
    const it = {box, canvas, ctx: canvas.getContext('2d'), active, seed: seed || 0, time: (seed || 0) * 1.7, intro: 1, frame: 0, gc: 0, ramp: rampOf(PALS[pal] || PALS.lagoon), angle: (SET.angle + (seed || 0) * 67) % 360};      /* każdy w swoim kierunku */
    items.push(it); draw(it);
    if(window.ResizeObserver) new ResizeObserver(() => { if(box.clientWidth && box.clientHeight) draw(it); }).observe(box);   /* box zmienił rozmiar (panel się otworzył, inna skala ekranu): gradient znowu wypełnia całość */
    return it;
  }
  function replay(){ wake(); }                                  // bez wejścia (intro=false): gradient od razu w pełni
  return {add, wake, replay};
})();
