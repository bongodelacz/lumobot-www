// Sekcja 1: hero ze smugą Ghost Cursor (WebGL2) rysującą nagłówek i opis na starcie, a potem podążającą za kursorem.
(function(){
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarseQuery = window.matchMedia('(pointer: coarse)');
  const isStatic = () => document.documentElement.classList.contains('static') || reducedQuery.matches;
  const isMobile = () => window.innerWidth <= 640 || coarseQuery.matches;

  // Kliknięcie logo wywołuje mrugnięcie
  const logo = document.querySelector('.hr-logo .face');
  if(logo && !isStatic()){
    logo.addEventListener('click', () => {
      const eyes = logo.querySelector('.eyes');
      if(!eyes) return;
      eyes.animate(
        [{scale:'1 1'},{scale:'1 0.08'},{scale:'1 1'}],
        {duration:220,easing:'ease-in-out'}
      );
    });
  }

  const hero = document.querySelector('.hr');
  const title = hero && hero.querySelector('.hr-title');
  const lede = hero && hero.querySelector('.hr-lede');
  /* rysowanie nagłówka dymem wyłączone (decyzja użytkownika): tekst od razu widoczny, bez smugi */
  return;
  if(!hero || !title || !lede || isStatic()) return;

  const container = document.createElement('div');
  container.className = 'ghost-cursor';
  container.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'ghost-cursor__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  hero.insertBefore(container, hero.firstChild);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Wyznaczanie rzeczywistych linii tekstu (współrzędne względem hero oraz przekroje maski względem elementu)
  function getElementLines(el, heroRect, prevLines){
    const elRect = el.getBoundingClientRect();
    if(elRect.width < 4 || elRect.height < 4) return [];

    const range = document.createRange();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const rawLines = [];
    let node;
    while((node = walker.nextNode())){
      const text = node.nodeValue || '';
      for(let i = 0; i < text.length; i++){
        if(/\s/.test(text[i])) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        if(r.width <= 0 || r.height <= 0) continue;
        const cy = (r.top + r.bottom) * 0.5;
        let line = null;
        for(let j = 0; j < rawLines.length; j++){
          if(Math.abs(cy - rawLines[j].cy) < r.height * 0.55){
            line = rawLines[j];
            break;
          }
        }
        if(!line){
          line = { left: r.left, right: r.right, top: r.top, bottom: r.bottom, cy };
          rawLines.push(line);
        } else {
          if(r.left < line.left) line.left = r.left;
          if(r.right > line.right) line.right = r.right;
          if(r.top < line.top) line.top = r.top;
          if(r.bottom > line.bottom) line.bottom = r.bottom;
          line.cy = (line.top + line.bottom) * 0.5;
        }
      }
    }

    rawLines.sort((a, b) => a.top - b.top);
    if(!rawLines.length){
      rawLines.push({
        left: elRect.left,
        right: elRect.right,
        top: elRect.top,
        bottom: elRect.bottom,
        cy: (elRect.top + elRect.bottom) * 0.5
      });
    }

    const totalH = Math.ceil(elRect.height) + 8;
    return rawLines.map((l, idx) => {
      const sliceTop = idx === 0
        ? 0
        : Math.max(0, Math.round(((rawLines[idx - 1].bottom + l.top) * 0.5) - elRect.top));
      const sliceBottom = idx === rawLines.length - 1
        ? totalH
        : Math.max(sliceTop + 1, Math.round(((l.bottom + rawLines[idx + 1].top) * 0.5) - elRect.top));
      const prevProg = prevLines && prevLines[idx] ? prevLines[idx].progress : 0;
      return {
        x0: l.left - heroRect.left,
        x1: l.right - heroRect.left,
        y: l.cy - heroRect.top,
        leftPct: clamp(((l.left - elRect.left) / elRect.width) * 100, 0, 100),
        rightPct: clamp(((l.right - elRect.left) / elRect.width) * 100, 0, 100),
        sliceTop,
        sliceHeight: Math.max(1, sliceBottom - sliceTop),
        progress: prevProg
      };
    });
  }

  function applyLineMask(el, lines){
    if(!lines.length) return;
    const grads = [];
    const pos = [];
    const size = [];
    const rep = [];
    for(let i = 0; i < lines.length; i++){
      const l = lines[i];
      const u = l.progress;
      if(u <= 0.001){
        grads.push('linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)');
      } else if(u >= 0.999){
        grads.push('linear-gradient(90deg, #000 0%, #000 100%)');
      } else {
        const front = l.leftPct + u * (l.rightPct - l.leftPct);
        const solid = Math.max(0, front - 11).toFixed(1);
        const clear = Math.min(100, front + 4).toFixed(1);
        grads.push(`linear-gradient(90deg, #000 0%, #000 ${solid}%, rgba(0,0,0,0) ${clear}%, rgba(0,0,0,0) 100%)`);
      }
      pos.push(`0px ${l.sliceTop}px`);
      size.push(`100% ${l.sliceHeight}px`);
      rep.push('no-repeat');
    }
    const imgStr = grads.join(', ');
    const posStr = pos.join(', ');
    const sizeStr = size.join(', ');
    const repStr = rep.join(', ');
    el.style.webkitMaskImage = imgStr;
    el.style.maskImage = imgStr;
    el.style.webkitMaskPosition = posStr;
    el.style.maskPosition = posStr;
    el.style.webkitMaskSize = sizeStr;
    el.style.maskSize = sizeStr;
    el.style.webkitMaskRepeat = repStr;
    el.style.maskRepeat = repStr;
  }

  function clearMask(el){
    el.style.webkitMaskImage = '';
    el.style.maskImage = '';
    el.style.webkitMaskPosition = '';
    el.style.maskPosition = '';
    el.style.webkitMaskSize = '';
    el.style.maskSize = '';
    el.style.webkitMaskRepeat = '';
    el.style.maskRepeat = '';
  }

  // Shadery WebGL2 przeniesione 1:1 z wzorca Ghost Cursor (React Bits) w barwach LumoBota (#f5f5f7, #9db5ff, #3a6bfc)
  const VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const NOISE = `
vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}
vec3 gradientNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = hash2(i);
  vec2 gb = hash2(i + vec2(1.0, 0.0));
  vec2 gc = hash2(i + vec2(0.0, 1.0));
  vec2 gd = hash2(i + vec2(1.0, 1.0));
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  vec2 slope = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va);
  return vec3(value, slope);
}`;

  const SIM = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 uSize;
uniform float uDt;
uniform float uTime;
uniform float uDecay;
uniform float uDrag;
uniform vec2 uDrift;
uniform float uTurbulence;
uniform float uSwirl;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uTrail;
uniform float uIdle;
uniform vec2 uVelocity;
uniform vec4 uPuff;
${NOISE}
float erf(float x) {
  float x2 = x * x;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));
}
vec2 curl(vec2 p) {
  vec3 a = gradientNoise(p * uSwirl + vec2(uTime * 0.11, -uTime * 0.07));
  vec3 b = gradientNoise(p * uSwirl * 2.03 + vec2(-uTime * 0.13, uTime * 0.09) + 17.3);
  vec2 g = a.yz + b.yz * 0.5;
  return vec2(g.y, -g.x);
}
vec4 fetch(vec2 p) {
  if (p.x < 0.0 || p.y < 0.0 || p.x > uSize.x || p.y > uSize.y) return vec4(0.0);
  return texture(uState, p / uSize);
}
void main() {
  vec2 p = gl_FragCoord.xy;
  vec4 here = texture(uState, vUv);
  vec2 flow = here.gb + curl(p) * uTurbulence + uDrift;
  vec4 state = fetch(p - flow * uDt);
  float density = state.r * uDecay;
  vec2 velocity = state.gb * uDrag;

  float sigma = max(uRadius, 0.5);
  vec2 ab = uTo - uFrom;
  float len = length(ab);
  float trail = 0.0;
  if (len > 0.25) {
    vec2 dir = ab / len;
    vec2 ap = p - uFrom;
    float along = dot(ap, dir);
    float across = dot(ap, vec2(-dir.y, dir.x));
    float k = 1.4142136 * sigma;
    trail = exp(-across * across / (2.0 * sigma * sigma)) * 0.5 * (erf(along / k) - erf((along - len) / k));
  }
  vec2 dh = p - uTo;
  float head = exp(-dot(dh, dh) / (2.0 * sigma * sigma));
  density += uTrail * trail + uIdle * uDt * head;
  velocity += (uVelocity - velocity) * clamp(trail * 0.65, 0.0, 1.0);

  if (uPuff.w > 0.0) {
    vec2 d = p - uPuff.xy;
    float r2 = dot(d, d);
    float g = exp(-r2 / (2.0 * uPuff.z * uPuff.z));
    density += uPuff.w * g;
    velocity += (r2 > 0.0001 ? d / sqrt(r2) : vec2(0.0)) * g * uPuff.w * uPuff.z * 2.2;
  }

  fragColor = vec4(clamp(density, 0.0, 6.0), velocity, 1.0);
}`;

  const SHADE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 uSimSize;
uniform vec2 uView;
uniform vec2 uHead;
uniform float uHeadSize;
uniform float uHeadAmount;
uniform float uTime;
uniform vec3 uColorDeep;
uniform vec3 uColorMid;
uniform vec3 uColorCore;
uniform float uDetail;
uniform float uNoiseScale;
uniform vec2 uFlow;
uniform float uBrightness;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p * 2.0;
    a *= 0.5;
  }
  return v;
}
float fbm5(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.0;
    a *= 0.52;
  }
  return v;
}
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;
  return a * g0.y + b * g1.y;
}
float field(vec2 uv, vec2 p) {
  vec2 d = p - uHead;
  return cubic(uState, uv, uSimSize).r + uHeadAmount * exp(-dot(d, d) / (2.0 * uHeadSize * uHeadSize));
}
void main() {
  vec2 p = vUv * uView;
  float density = field(vUv, p);
  if (density < 0.002) {
    fragColor = vec4(0.0);
    return;
  }
  vec2 step = vec2(1.5) / uSimSize;
  float dx = field(vUv + vec2(step.x, 0.0), p + vec2(step.x * uView.x, 0.0)) - field(vUv - vec2(step.x, 0.0), p - vec2(step.x * uView.x, 0.0));
  float dy = field(vUv + vec2(0.0, step.y), p + vec2(0.0, step.y * uView.y)) - field(vUv - vec2(0.0, step.y), p - vec2(0.0, step.y * uView.y));

  vec2 n = (p + uFlow) * uNoiseScale;
  float t = uTime;
  vec2 q = vec2(fbm(n + t * 0.1), fbm(n + vec2(5.2, 1.3) + t * 0.1));
  vec2 r = vec2(fbm(n + q * 1.8 + vec2(1.7, 9.2) + t * 0.15), fbm(n + q * 1.8 + vec2(8.3, 2.8) + t * 0.15));
  float smoke = fbm5(n + r * 1.1);
  float wisp = pow(smoothstep(0.18, 0.82, smoke), 2.0) * 2.8;
  float body = density * mix(1.0, wisp, uDetail);
  float cloud = body * smoothstep(0.0, 0.32, body) * 1.15;
  if (cloud <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  vec3 normal = normalize(vec3(-dx * 2.2, -dy * 2.2, 1.0) + vec3((q - 0.5) * 0.35 * uDetail, 0.0));
  float light = 0.72 + 0.48 * max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);
  float midMix = smoothstep(0.22, 0.95, cloud);
  float coreMix = smoothstep(1.05, 2.45, cloud);

  vec3 tint = mix(uColorDeep, uColorMid, midMix);
  tint = mix(tint, uColorCore, coreMix) * light;
  vec3 color = tint * uBrightness * cloud;
  fragColor = vec4(color, cloud);
}`;

  const DOWN = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uThreshold;
void main() {
  vec4 a = texture(uSource, vUv + uTexel * vec2(-0.5, -0.5));
  vec4 b = texture(uSource, vUv + uTexel * vec2(0.5, -0.5));
  vec4 c = texture(uSource, vUv + uTexel * vec2(-0.5, 0.5));
  vec4 d = texture(uSource, vUv + uTexel * vec2(0.5, 0.5));
  vec4 color = (a + b + c + d) * 0.25;
  float peak = max(color.r, max(color.g, color.b));
  float keep = peak > 0.0 ? max(peak - uThreshold, 0.0) / peak : 0.0;
  fragColor = color * keep;
}`;

  const BLUR = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uDirection;
void main() {
  vec4 color = texture(uSource, vUv) * 0.181862;
  color += (texture(uSource, vUv + uDirection * 1.423135) + texture(uSource, vUv - uDirection * 1.423135)) * 0.284316;
  color += (texture(uSource, vUv + uDirection * 3.326702) + texture(uSource, vUv - uDirection * 3.326702)) * 0.106598;
  color += (texture(uSource, vUv + uDirection * 5.242989) + texture(uSource, vUv - uDirection * 5.242989)) * 0.018156;
  fragColor = color;
}`;

  const COMPOSITE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uShade;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform vec2 uShadeSize;
uniform vec3 uWeights;
uniform float uBloom;
uniform float uPresence;
uniform float uGrain;
uniform float uEdge;
uniform float uTime;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec4 cubic(sampler2D tex, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0;
  vec2 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 c0 = (i + 0.5 + w1 / g0 - 1.0) / size;
  vec2 c1 = (i + 0.5 + w3 / g1 + 1.0) / size;
  vec4 a = texture(tex, c0) * g0.x + texture(tex, vec2(c1.x, c0.y)) * g1.x;
  vec4 b = texture(tex, vec2(c0.x, c1.y)) * g0.x + texture(tex, c1) * g1.x;
  return a * g0.y + b * g1.y;
}
void main() {
  vec4 shade = cubic(uShade, vUv, uShadeSize);
  vec4 bloom = texture(uBloom0, vUv) * uWeights.x + texture(uBloom1, vUv) * uWeights.y + texture(uBloom2, vUv) * uWeights.z;
  vec2 edge = min(vUv, 1.0 - vUv);
  float vignette = mix(1.0 - uEdge, 1.0, clamp(min(edge.x, edge.y) * 2.0, 0.0, 1.0));
  float fade = uPresence * vignette;
  float grain = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5;
  vec3 color = (shade.rgb + bloom.rgb * uBloom) * fade;
  color = pow(1.0 - exp(-color * 0.95), vec3(1.0 / 2.2));
  color += color * grain * uGrain * 2.0;
  color = clamp(color + (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0, 0.0, 1.0);
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));
}`;

  function hexToLinear(hexStr){
    const h = hexStr.replace('#', '');
    return [0, 2, 4].map(i => Math.pow(parseInt(h.slice(i, i + 2), 16) / 255, 2.2));
  }

  // Kolory marki LumoBota (#3a6bfc, #9db5ff, #f5f5f7)
  const COLOR_DEEP = hexToLinear('#3a6bfc');
  const COLOR_MID  = hexToLinear('#9db5ff');
  const COLOR_CORE = hexToLinear('#f5f5f7');

  // Czas rysowania tekstów smugą (~2.5 s) zaraz po załadowaniu strony
  const INTRO_MS = 1900;
  const TITLE_END_MS = 1080;
  const POST_LOAD_DELAY_MS = 200;

  const settings = {
    brightness: 0.76,
    size: 84,
    trail: 22,
    inertia: 0.46,
    turbulence: 0.42,
    drift: 0.22,
    detail: 0.9,
    grain: 0.025,
    bloom: 0.44,
    bloomRadius: 0.95,
    threshold: 0.03,
    edge: 0.06,
    fadeDelay: 580,
    fadeDuration: 980,
    introFadeDelay: 60,
    introFadeDuration: 680,
    maxRatio: 2,
    budget: 550000
  };

  function compile(gl, type, source){
    const shader = gl.createShader(type);
    if(!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function buildProgram(gl, vertex, fragmentSource){
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if(!vertex || !fragment) return null;
    const program = gl.createProgram();
    if(!program){
      gl.deleteShader(fragment);
      return null;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(fragment);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for(let i = 0; i < count; i++){
      const info = gl.getActiveUniform(program, i);
      if(info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  }

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'default'
  });

  const hasFloat = Boolean(gl && gl.getExtension('EXT_color_buffer_float'));
  let programs = null;
  let vao = null;
  let sims = null;
  let shade = null;
  let downs = null;
  let blurs = null;

  if(gl && hasFloat){
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const simP = buildProgram(gl, vertex, SIM);
    const shadeP = buildProgram(gl, vertex, SHADE);
    const downP = buildProgram(gl, vertex, DOWN);
    const blurP = buildProgram(gl, vertex, BLUR);
    const compP = buildProgram(gl, vertex, COMPOSITE);
    if(vertex) gl.deleteShader(vertex);

    if(simP && shadeP && downP && blurP && compP){
      programs = { sim: simP, shade: shadeP, down: downP, blur: blurP, composite: compP };
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const createTarget = () => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const framebuffer = gl.createFramebuffer();
        return { texture, framebuffer, width: 0, height: 0 };
      };
      sims = [createTarget(), createTarget()];
      shade = createTarget();
      downs = [createTarget(), createTarget(), createTarget()];
      blurs = [createTarget(), createTarget(), createTarget()];
    }
  }

  function allocate(target, width, height){
    if(target.width === width && target.height === height) return;
    target.width = width;
    target.height = height;
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function pass(target, prog){
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
    gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);
    gl.useProgram(prog.program);
    return prog.uniforms;
  }

  function bind(unit, texture){
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  const view = { width: 1, height: 1, ratio: 1, sim: 0.25, shade: 1 };
  const ghost = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, ready: false, trailScale: 1 };
  const pointer = { x: 0, y: 0, inside: false, moved: -1e9, userMoved: false };
  const flow = { y: 0 };
  const puffs = [];

  let titleLines = [];
  let ledeLines = [];
  let segments = [];
  let presence = 0;
  let current = 0;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let visible = true;
  let pageVisible = document.visibilityState !== 'hidden';
  let dirty = true;
  let introLive = true;
  let pageLoadTime = document.readyState === 'complete' ? performance.now() : -1;
  let revealCleared = false;

  if(pageLoadTime < 0){
    window.addEventListener('load', () => {
      pageLoadTime = performance.now();
      wake();
    }, { once: true });
  }

  function buildSegments(){
    const heroRect = container.getBoundingClientRect();
    titleLines = getElementLines(title, heroRect, titleLines);
    ledeLines = getElementLines(lede, heroRect, ledeLines);
    segments = [];

    const addGroup = (lines, t0, t1) => {
      if(!lines.length) return;
      const totalSpan = lines.reduce((acc, l) => acc + Math.max(40, l.x1 - l.x0), 0);
      let cursorT = t0;
      for(let i = 0; i < lines.length; i++){
        const span = Math.max(40, lines[i].x1 - lines[i].x0);
        const dur = (t1 - t0) * (span / totalSpan);
        segments.push({
          line: lines[i],
          tStart: cursorT,
          tEnd: cursorT + dur,
          isFirst: segments.length === 0
        });
        cursorT += dur;
      }
    };

    addGroup(titleLines, 0, TITLE_END_MS);
    addGroup(ledeLines, TITLE_END_MS, INTRO_MS);

    if(introLive && !revealCleared){
      applyLineMask(title, titleLines);
      applyLineMask(lede, ledeLines);
    }
  }

  function resize(){
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const mobile = isMobile();
    settings.size = mobile ? 60 : 84;
    const ratio = Math.min(window.devicePixelRatio || 1, settings.maxRatio);
    view.width = width;
    view.height = height;
    view.ratio = ratio;

    const cw = Math.max(1, Math.round(width * ratio));
    const ch = Math.max(1, Math.round(height * ratio));
    if(canvas.width !== cw || canvas.height !== ch){
      canvas.width = cw;
      canvas.height = ch;
    }

    if(programs){
      const budget = mobile ? 300000 : settings.budget;
      view.shade = Math.min(1, Math.sqrt(budget / (width * height)));
      const sw = Math.max(8, Math.round(width * view.shade));
      const sh = Math.max(8, Math.round(height * view.shade));
      allocate(shade, sw, sh);
      let w = Math.max(4, Math.round(sw / 2));
      let h = Math.max(4, Math.round(sh / 2));
      for(let i = 0; i < 3; i++){
        allocate(downs[i], w, h);
        allocate(blurs[i], w, h);
        w = Math.max(2, Math.round(w / 2));
        h = Math.max(2, Math.round(h / 2));
      }
      view.sim = Math.min(0.35, 220 / Math.max(width, height));
      const simW = Math.max(16, Math.round(width * view.sim));
      const simH = Math.max(16, Math.round(height * view.sim));
      allocate(sims[0], simW, simH);
      allocate(sims[1], simW, simH);
    }

    buildSegments();
    dirty = false;
  }

  function simulate(dt, active){
    if(!programs) return;
    const src = sims[current];
    const dst = sims[1 - current];
    const scale = view.sim;
    const sigma = settings.size * scale * 0.32;
    const trailTime = (!introLive && !pointer.userMoved) ? 0.26 : (0.12 + settings.trail * 0.022);
    const decay = Math.exp(-dt / trailTime);
    const u = pass(dst, programs.sim);
    bind(0, src.texture);
    gl.uniform1i(u.uState, 0);
    gl.uniform2f(u.uSize, dst.width, dst.height);
    gl.uniform1f(u.uDt, dt);
    gl.uniform1f(u.uTime, clock);
    gl.uniform1f(u.uDecay, decay);
    gl.uniform1f(u.uDrag, Math.exp(-dt * 2.4));
    gl.uniform2f(u.uDrift, 0, settings.drift * 110 * scale);
    gl.uniform1f(u.uTurbulence, settings.turbulence * 70 * scale);
    gl.uniform1f(u.uSwirl, 1 / Math.max(1, settings.size * scale * 2.2));
    gl.uniform2f(u.uFrom, ghost.px * scale, (view.height - ghost.py) * scale);
    gl.uniform2f(u.uTo, ghost.x * scale, (view.height - ghost.y) * scale);
    gl.uniform1f(u.uRadius, sigma);
    gl.uniform1f(u.uTrail, active ? 0.52 * presence * ghost.trailScale : 0);
    gl.uniform1f(u.uIdle, active ? 0.24 * presence * ghost.trailScale : 0);
    gl.uniform2f(u.uVelocity, ghost.vx * scale * 0.5, -ghost.vy * scale * 0.5);
    const puff = puffs.shift();
    if(puff){
      gl.uniform4f(u.uPuff, puff.x * scale, (view.height - puff.y) * scale, sigma * 1.35, 0.85);
    } else {
      gl.uniform4f(u.uPuff, 0, 0, 1, 0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    current = 1 - current;
  }

  function render(){
    if(!programs) return;
    let u = pass(shade, programs.shade);
    bind(0, sims[current].texture);
    gl.uniform1i(u.uState, 0);
    gl.uniform2f(u.uSimSize, sims[current].width, sims[current].height);
    gl.uniform2f(u.uView, view.width, view.height);
    gl.uniform2f(u.uHead, ghost.x, view.height - ghost.y);
    gl.uniform1f(u.uHeadSize, settings.size * 0.36);
    gl.uniform1f(u.uHeadAmount, ghost.ready ? 0.62 * presence : 0);
    gl.uniform1f(u.uTime, clock);
    gl.uniform3fv(u.uColorDeep, COLOR_DEEP);
    gl.uniform3fv(u.uColorMid, COLOR_MID);
    gl.uniform3fv(u.uColorCore, COLOR_CORE);
    gl.uniform1f(u.uDetail, settings.detail);
    gl.uniform1f(u.uNoiseScale, 2.4 / Math.max(20, settings.size * 2.6));
    gl.uniform2f(u.uFlow, 0, flow.y);
    gl.uniform1f(u.uBrightness, settings.brightness);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    let source = shade;
    for(let i = 0; i < 3; i++){
      u = pass(downs[i], programs.down);
      bind(0, source.texture);
      gl.uniform1i(u.uSource, 0);
      gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height);
      gl.uniform1f(u.uThreshold, i === 0 ? settings.threshold : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      u = pass(blurs[i], programs.blur);
      bind(0, downs[i].texture);
      gl.uniform1i(u.uSource, 0);
      gl.uniform2f(u.uDirection, 1 / downs[i].width, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      u = pass(downs[i], programs.blur);
      bind(0, blurs[i].texture);
      gl.uniform1i(u.uSource, 0);
      gl.uniform2f(u.uDirection, 0, 1 / blurs[i].height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      source = downs[i];
    }

    u = pass(null, programs.composite);
    bind(0, shade.texture);
    bind(1, downs[0].texture);
    bind(2, downs[1].texture);
    bind(3, downs[2].texture);
    gl.uniform1i(u.uShade, 0);
    gl.uniform1i(u.uBloom0, 1);
    gl.uniform1i(u.uBloom1, 2);
    gl.uniform1i(u.uBloom2, 3);
    gl.uniform2f(u.uShadeSize, shade.width, shade.height);
    const spread = settings.bloomRadius;
    gl.uniform3f(u.uWeights, 1, 0.6 + 0.4 * spread, 0.25 + 0.75 * Math.min(1, spread * spread * 0.5));
    gl.uniform1f(u.uBloom, settings.bloom);
    gl.uniform1f(u.uPresence, presence);
    gl.uniform1f(u.uGrain, settings.grain);
    gl.uniform1f(u.uEdge, settings.edge);
    gl.uniform1f(u.uTime, clock);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function updateIntro(now, dt){
    if(!segments.length){
      introLive = false;
      clearMask(title);
      clearMask(lede);
      return;
    }

    // Zanim strona zakończy pełne ładowanie zasobów, czekamy z emisją smugi bez tworzenia plamy na początku wiersza
    if(pageLoadTime < 0 || now < pageLoadTime + POST_LOAD_DELAY_MS){
      ghost.ready = false;
      ghost.trailScale = 0;
      pointer.inside = false;
      return;
    }

    const elapsed = now - (pageLoadTime + POST_LOAD_DELAY_MS);

    if(elapsed >= INTRO_MS){
      introLive = false;
      ghost.trailScale = 1;
      if(!revealCleared){
        revealCleared = true;
        clearMask(title);
        clearMask(lede);
      }
      pointer.inside = false;
      return;
    }

    let activeIdx = segments.length - 1;
    for(let i = 0; i < segments.length; i++){
      const seg = segments[i];
      if(elapsed < seg.tStart){
        seg.line.progress = 0;
      } else if(elapsed >= seg.tEnd){
        seg.line.progress = 1;
      } else {
        activeIdx = i;
        const rawP = clamp((elapsed - seg.tStart) / Math.max(1, seg.tEnd - seg.tStart), 0, 1);
        const jumpFrac = seg.isFirst ? 0 : 0.11;
        if(rawP < jumpFrac){
          seg.line.progress = 0;
        } else {
          const lineP = (rawP - jumpFrac) / (1 - jumpFrac);
          const eased = lineP * lineP * (3 - 2 * lineP);
          seg.line.progress = eased;
        }
      }
    }

    applyLineMask(title, titleLines);
    applyLineMask(lede, ledeLines);

    const seg = segments[activeIdx];
    const rawP = clamp((elapsed - seg.tStart) / Math.max(1, seg.tEnd - seg.tStart), 0, 1);
    const jumpFrac = seg.isFirst ? 0 : 0.11;
    let tx, ty;

    if(rawP < jumpFrac && activeIdx > 0){
      const prev = segments[activeIdx - 1].line;
      const jp = rawP / jumpFrac;
      const je = jp * jp * (3 - 2 * jp);
      tx = prev.x1 + (seg.line.x0 - prev.x1) * je;
      ty = prev.y + (seg.line.y - prev.y) * je;
      ghost.trailScale = 0.12;
    } else {
      const lineP = jumpFrac > 0 ? (rawP - jumpFrac) / (1 - jumpFrac) : rawP;
      const eased = lineP * lineP * (3 - 2 * lineP);
      tx = seg.line.x0 + (seg.line.x1 - seg.line.x0) * eased;
      ty = seg.line.y + Math.sin(eased * Math.PI * 2) * 3.5;
      ghost.trailScale = 0.96;
    }

    if(!ghost.ready){
      ghost.x = ghost.px = tx;
      ghost.y = ghost.py = ty;
      ghost.vx = ghost.vy = 0;
      ghost.ready = true;
    } else {
      ghost.px = ghost.x;
      ghost.py = ghost.y;
      ghost.vx = dt > 0.0001 ? (tx - ghost.x) / dt : 0;
      ghost.vy = dt > 0.0001 ? (ty - ghost.y) / dt : 0;
      ghost.x = tx;
      ghost.y = ty;
    }

    pointer.x = tx;
    pointer.y = ty;
    pointer.inside = true;
    pointer.moved = now;
  }

  function frame(now){
    raf = 0;
    if(isStatic() || !visible || !pageVisible) return;

    const dt = clamp((now - last) / 1000 || 0.016, 0.001, 0.05);
    last = Math.max(last, now);
    clock += dt;

    if(dirty) resize();

    if(introLive){
      updateIntro(now, dt);
    } else {
      ghost.trailScale = 1;
      ghost.px = ghost.x;
      ghost.py = ghost.y;
      if(ghost.ready){
        if(pointer.inside){
          const stiffness = 520 * Math.pow(1 - settings.inertia, 2) + 26;
          const damping = 2 * Math.sqrt(stiffness) * 0.92;
          const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
          const h = dt / steps;
          for(let i = 0; i < steps; i++){
            ghost.vx += (stiffness * (pointer.x - ghost.x) - damping * ghost.vx) * h;
            ghost.vy += (stiffness * (pointer.y - ghost.y) - damping * ghost.vy) * h;
            ghost.x += ghost.vx * h;
            ghost.y += ghost.vy * h;
          }
        } else {
          const glide = Math.pow(settings.inertia, dt * 60);
          ghost.vx *= glide;
          ghost.vy *= glide;
          ghost.x += ghost.vx * dt;
          ghost.y += ghost.vy * dt;
        }
      }
    }

    const idle = now - pointer.moved;
    const fDelay = pointer.userMoved ? settings.fadeDelay : settings.introFadeDelay;
    const fDur = pointer.userMoved ? settings.fadeDuration : settings.introFadeDuration;
    const target = !ghost.ready
      ? 0
      : introLive
        ? 1
        : idle < fDelay
          ? 1
          : Math.max(0, 1 - (idle - fDelay) / fDur);

    presence += (target - presence) * (1 - Math.exp(-dt / (target > presence ? 0.08 : 0.06)));
    if(Math.abs(target - presence) < 0.002) presence = target;

    flow.y -= settings.drift * 110 * dt;

    simulate(dt, presence > 0.01);
    render();

    const busy = introLive || target > 0 || presence > 0.001 || puffs.length > 0;
    if(!busy){
      if(programs){
        for(const t of sims){
          gl.bindFramebuffer(gl.FRAMEBUFFER, t.framebuffer);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      return;
    }

    if(visible && pageVisible) raf = requestAnimationFrame(frame);
  }

  function wake(){
    if(raf || !visible || !pageVisible || isStatic()) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function locate(event){
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
  }

  function onLeave(){
    const now = performance.now();
    if(pointer.inside && now - pointer.moved < settings.fadeDelay) pointer.moved = now;
    pointer.inside = false;
    wake();
  }

  function onPointerMove(event){
    if(isMobile() || isStatic()) return;
    const spot = locate(event);
    if(!spot.inside){
      if(!introLive && pointer.inside) onLeave();
      return;
    }
    if(introLive) return;
    pointer.userMoved = true;
    if(!pointer.inside && (!ghost.ready || presence < 0.05)){
      ghost.x = ghost.px = spot.x;
      ghost.y = ghost.py = spot.y;
      ghost.vx = ghost.vy = 0;
      ghost.ready = true;
    }
    pointer.x = spot.x;
    pointer.y = spot.y;
    pointer.inside = true;
    pointer.moved = performance.now();
    wake();
  }

  function onPointerDown(event){
    if(isMobile() || isStatic() || introLive) return;
    const spot = locate(event);
    if(!spot.inside) return;
    onPointerMove(event);
    puffs.push({ x: spot.x, y: spot.y });
    wake();
  }

  /* Smuga tylko podczas rysowania tekstu na starcie: bez dymu za kursorem (decyzja użytkownika). */

  document.documentElement.addEventListener('pointerleave', onLeave);

  if('ResizeObserver' in window){
    new ResizeObserver(() => {
      dirty = true;
      wake();
    }).observe(container);
  } else {
    window.addEventListener('resize', () => {
      dirty = true;
      wake();
    }, { passive: true });
  }

  if('IntersectionObserver' in window){
    new IntersectionObserver((entries) => {
      visible = entries.some(entry => entry.isIntersecting);
      if(visible){
        wake();
      } else if(raf){
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }, { threshold: 0.01 }).observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    pageVisible = document.visibilityState !== 'hidden';
    if(pageVisible) wake();
  });

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => {
      dirty = true;
      wake();
    });
  }

  reducedQuery.addEventListener('change', () => {
    if(isStatic()){
      if(raf) cancelAnimationFrame(raf);
      raf = 0;
      clearMask(title);
      clearMask(lede);
    }
  });

  resize();
  wake();
})();
