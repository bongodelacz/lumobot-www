/* Koło opcji + karta z odbiciem (sekcja-kolo) w czystym JS i WebGL2 */
(() => {
  const section = document.getElementById('kolo');
  const wheelEl = document.getElementById('kwWheel');
  const cardEl = document.getElementById('kwCard');
  const bodyEl = document.getElementById('kwCardBody');
  const canvasEl = document.getElementById('kwCardCanvas');
  const contentEl = document.getElementById('kwCardContent');
  if (!section || !wheelEl || !cardEl || !bodyEl || !contentEl) return;

  const ITEMS = [
    {
      name: 'Do skutku',
      title: 'Pracuje do końca',
      desc: 'Agent nie kończy, dopóki sprawdzenie nie przejdzie.',
      factLabel: 'Fakt',
      factVal: 'Nie odpuszcza przy pierwszym błędzie.',
      illu: 'img/kolo/do-skutku.svg'
    },
    {
      name: 'Zespół',
      title: 'Lider i specjaliści',
      desc: 'Lider dzieli zadanie, a agenci robią swoje części naraz.',
      factLabel: 'Fakt',
      factVal: 'Osobny agent od obrazów, tekstów i testów.',
      illu: 'img/kolo/zespol.svg'
    },
    {
      name: 'Neuro',
      title: 'Sprawdza, zanim powie',
      desc: 'Neuro ocenia wynik w procentach i nie potwierdza celu na wiarę.',
      factLabel: 'Fakt',
      factVal: 'Wynik Neuro w procentach, np. 92%.',
      illu: 'img/kolo/neuro.svg'
    },
    {
      name: 'Głos',
      title: 'Mów, on działa',
      desc: 'Rozmawiaj z LumoBotem po polsku, a wyspa pokazuje, co robi.',
      factLabel: 'Fakt',
      factVal: '4 języki interfejsu.',
      illu: 'img/kolo/glos.svg'
    },
    {
      name: 'Twoje AI',
      title: 'Wybierz własny model',
      desc: 'Użyj planu, który już masz, albo uruchom model lokalnie.',
      factLabel: 'Fakt',
      factVal: '14 dostawców i 158 modeli AI, w tym Ollama i LM Studio.',
      illu: 'img/kolo/twoje-ai.svg'
    },
    {
      name: 'Cofanie',
      title: 'Zawsze możesz wrócić',
      desc: 'Każda zmiana ma punkt powrotu, więc cofniesz ją jednym ruchem.',
      factLabel: 'Fakt',
      factVal: 'Punkty powrotu w git, Windows 10 i 11.',
      illu: 'img/kolo/cofanie.svg'
    }
  ];

  const elTag = document.getElementById('kwCardTag');
  const elTitle = document.getElementById('kwCardTitle');
  const elDesc = document.getElementById('kwCardDesc');
  const elIllu = document.getElementById('kwCardIllu');
  const elFactLabel = document.getElementById('kwCardFactLabel');
  const elFactVal = document.getElementById('kwCardFactVal');

  const optionEls = Array.from(wheelEl.querySelectorAll('.kw-wheel-item'));
  const count = optionEls.length;

  const isReducedMotion = () =>
    document.documentElement.classList.contains('static') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobileLayout = () => window.innerWidth <= 760;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ================================================================
     1. OPTION WHEEL (pionowe na desktopie, poziome na telefonie)
     ================================================================ */
  let pos = 0;
  let target = 0;
  let selectedIdx = 0;
  let wheelRaf = null;
  let wheelLast = 0;
  let wheelLockUntil = 0;
  let cardSwitchTimer = null;
  let dragState = null;
  let dragMoved = false;

  const WHEEL_CFG = {
    smoothing: 200,
    tilt: 7,
    curve: 0.55,
    blur: 1.4,
    fade: 0.34,
    minOpacity: 0.16
  };

  function renderWheelFrame(now) {
    const mobile = isMobileLayout();
    const reduced = isReducedMotion();
    const dt = Math.min((now - wheelLast) / 1000, 0.05);
    wheelLast = now;

    if (reduced) {
      pos = target;
    } else {
      const tau = WHEEL_CFG.smoothing / 1000;
      const k = 1 - Math.exp(-dt / tau);
      pos = pos + (target - pos) * k;
      if (Math.abs(target - pos) < 0.001) pos = target;
    }

    const rowH = mobile ? 190 : 70;
    const tiltRad = (WHEEL_CFG.tilt * Math.PI) / 180;
    const R = rowH / tiltRad;

    for (let i = 0; i < count; i++) {
      const el = optionEls[i];
      if (!el) continue;
      const d = i - pos;
      const dist = Math.abs(d);
      const ang = clamp(d * tiltRad, -Math.PI / 2, Math.PI / 2);
      const scale = mobile ? Math.max(0.78, 1 - dist * 0.12) : Math.max(0.7, 1 - dist * 0.15);

      if (mobile) {
        const x = R * Math.sin(ang);
        const y = R * (1 - Math.cos(ang)) * 0.4;
        const rot = (ang * 180) / Math.PI * 0.35;
        el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      } else {
        const y = R * Math.sin(ang);
        const x = -R * (1 - Math.cos(ang)) * WHEEL_CFG.curve;
        const rot = (ang * 180) / Math.PI;
        el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg) scale(${scale.toFixed(3)})`;
      }

      const opacity = mobile
        ? dist >= 1.25
          ? 0
          : Math.max(0, 1 - dist * 0.48)
        : Math.max(WHEEL_CFG.minOpacity, 1 - dist * WHEEL_CFG.fade);
      el.style.opacity = String(opacity);
      el.style.filter = dist > 0.05 && !reduced ? `blur(${(dist * WHEEL_CFG.blur).toFixed(2)}px)` : 'none';
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
    }

    if (Math.abs(target - pos) >= 0.001 && !reduced) {
      wheelRaf = requestAnimationFrame(renderWheelFrame);
    } else {
      wheelRaf = null;
    }
  }

  function startWheelLoop() {
    if (wheelRaf !== null) cancelAnimationFrame(wheelRaf);
    wheelLast = performance.now();
    wheelRaf = requestAnimationFrame(renderWheelFrame);
  }

  function updateCardContent(idx) {
    const item = ITEMS[idx];
    if (!item) return;

    const applyText = () => {
      if (elTag) elTag.textContent = item.name;
      if (elTitle) elTitle.textContent = item.title;
      if (elDesc) elDesc.textContent = item.desc;
      if (elIllu && item.illu) elIllu.src = item.illu;
      if (elFactLabel) elFactLabel.textContent = item.factLabel;
      if (elFactVal) elFactVal.textContent = item.factVal;
    };

    if (isReducedMotion()) {
      applyText();
      return;
    }

    if (cardSwitchTimer) clearTimeout(cardSwitchTimer);
    contentEl.classList.remove('is-entering');
    contentEl.classList.add('is-leaving');
    bodyEl.style.setProperty('--rc-flip', '5deg');

    cardSwitchTimer = setTimeout(() => {
      applyText();
      contentEl.classList.remove('is-leaving');
      contentEl.classList.add('is-entering');
      void contentEl.offsetWidth;
      contentEl.classList.remove('is-entering');
      bodyEl.style.setProperty('--rc-flip', '0deg');
    }, 150);
  }

  function setTarget(value, snap) {
    let v = clamp(value, 0, count - 1);
    if (snap) v = Math.round(v);
    target = v;

    const idx = clamp(Math.round(v), 0, count - 1);
    if (idx !== selectedIdx) {
      selectedIdx = idx;
      optionEls.forEach((el, i) => {
        el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
      wheelEl.setAttribute('aria-activedescendant', `kw-opt-${idx}`);
      updateCardContent(idx);
    }
    startWheelLoop();
  }

  // Kółko myszy: jedna opcja na ruch (blokada 350 ms), na końcach listy oddaje przewijanie stronie
  wheelEl.addEventListener(
    'wheel',
    e => {
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      if (delta === 0) return;

      const dir = delta > 0 ? 1 : -1;
      const current = Math.round(target);
      const next = clamp(current + dir, 0, count - 1);
      if (next === current) return;

      const now = performance.now();
      if (now < wheelLockUntil) return;

      e.preventDefault();
      wheelLockUntil = now + 350;
      setTarget(next, true);
    },
    { passive: false }
  );

  // Przeciąganie myszą i dotykiem
  wheelEl.addEventListener('pointerdown', e => {
    dragState = { x: e.clientX, y: e.clientY, start: target, id: e.pointerId };
    dragMoved = false;
    wheelEl.classList.add('kw-wheel--dragging');
  });

  wheelEl.addEventListener('pointermove', e => {
    if (!dragState) return;
    const mobile = isMobileLayout();
    const delta = mobile ? e.clientX - dragState.x : e.clientY - dragState.y;
    const stepPx = mobile ? 148 : 66;
    if (!dragMoved && Math.abs(delta) > 4) {
      dragMoved = true;
      try {
        wheelEl.setPointerCapture(dragState.id);
      } catch {}
    }
    if (dragMoved) {
      setTarget(dragState.start - delta / stepPx, false);
    }
  });

  const endDrag = () => {
    if (!dragState) return;
    dragState = null;
    wheelEl.classList.remove('kw-wheel--dragging');
    if (dragMoved) setTarget(target, true);
  };
  wheelEl.addEventListener('pointerup', endDrag);
  wheelEl.addEventListener('pointercancel', endDrag);

  optionEls.forEach((el, idx) => {
    el.addEventListener('click', () => {
      if (dragMoved) return;
      wheelEl.focus({ preventScroll: true });
      setTarget(idx, true);
    });
  });

  wheelEl.addEventListener('keydown', e => {
    let next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.round(target) + 1;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.round(target) - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    if (next === null) return;
    e.preventDefault();
    setTarget(next, true);
  });

  window.addEventListener('resize', () => startWheelLoop(), { passive: true });
  startWheelLoop();

  /* ================================================================
     2. REFLECTIVE CARD (WebGL2 shader + Tilt 3D)
     ================================================================ */
  const VERTEX_SRC = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const PLATE_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uSize;
uniform float uRadius;
uniform float uScale;
uniform mat3 uRotate;
uniform vec2 uPointer;

const float VIEW = 900.0;
const vec2 SWEEP = vec2(0.5, 0.86);

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

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
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float erfApprox(float x) {
  float x2 = x * x;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + 0.147 * x2) / (1.0 + 0.147 * x2)));
}

float band(float x, float halfWidth, float sigma) {
  float s = 1.4142136 * max(sigma, 0.0001);
  return 0.5 * (erfApprox((x + halfWidth) / s) - erfApprox((x - halfWidth) / s));
}

float strip(vec2 q, vec2 center, vec2 dir, float halfWidth, vec2 sigma) {
  vec2 normal = vec2(-dir.y, dir.x);
  return band(dot(q - center, normal), halfWidth, length(sigma * normal));
}

float softbox(vec2 q, vec2 sigma) {
  float key = strip(q, vec2(-0.1, -0.16), normalize(SWEEP), 0.022, sigma + 0.018);
  float top = band(q.y + 0.6, 0.12, sigma.y + 0.05);
  float side = band(q.x - 0.46, 0.05, sigma.x + 0.05);
  return key + top * 0.8 + side * 0.35;
}

float room(vec2 q, vec2 sigma) {
  float fall = smoothstep(-0.55, 0.5, q.y);
  float flag = strip(q, vec2(0.24, -0.02), normalize(SWEEP), 0.09, sigma + 0.08);
  return mix(0.85, 0.12, fall) * (1.0 - 0.6 * flag);
}

void main() {
  vec2 p = vec2(vUv.x - 0.5, 0.5 - vUv.y) * uSize;
  vec2 halfSize = uSize * 0.5;
  float r = min(uRadius, min(halfSize.x, halfSize.y));
  vec2 corner = abs(p) - halfSize + r;
  vec2 side = vec2(p.x >= 0.0 ? 1.0 : -1.0, p.y >= 0.0 ? 1.0 : -1.0);
  float d;
  vec2 outward;
  if (corner.x > 0.0 && corner.y > 0.0) {
    d = length(corner) - r;
    outward = normalize(corner) * side;
  } else if (corner.x > corner.y) {
    d = corner.x - r;
    outward = vec2(side.x, 0.0);
  } else {
    d = corner.y - r;
    outward = vec2(0.0, side.y);
  }

  float coverage = clamp(0.5 - d * uScale, 0.0, 1.0);
  float chamferWidth = min(3.0, max(r, 1.0));
  float chamfer = 1.0 - smoothstep(0.0, chamferWidth, -d);
  vec2 slope = outward * chamfer;

  vec2 wp = p / 220.0;
  vec3 w1 = gradientNoise(wp);
  vec3 w2 = gradientNoise(wp * 2.07 + 13.7);
  slope += (w1.yz + w2.yz * 0.5) * 0.6 * 0.008;

  float grain = valueNoise(vec2(p.x * 0.008, p.y * 0.55)) * 0.45
              + valueNoise(vec2(p.x * 0.019 + 3.7, p.y * 0.23)) * 0.35
              + valueNoise(vec2(p.x * 0.004 + 9.2, p.y * 0.09)) * 0.2;
  float brush = 0.09;
  slope.y += (grain - 0.5) * brush * 0.004;

  vec3 normal = uRotate * normalize(vec3(slope, 1.0));
  vec3 position = uRotate * vec3(p, 0.0);
  vec3 view = normalize(position - vec3(0.0, 0.0, VIEW));
  vec3 bounce = reflect(view, normal);
  vec2 q = bounce.xy / max(bounce.z, 0.2);

  vec2 footprint = fwidth(q);
  vec2 sigma = sqrt(vec2(6.0 / VIEW) * vec2(6.0 / VIEW) + footprint * footprint * 0.5) + vec2(0.004, 0.05) * 0.3;

  float scene = room(q, sigma) * (1.0 + (grain - 0.5) * brush * 0.3);
  vec2 toPointer = (uPointer - p) / 144.0;
  vec2 spread = toPointer * vec2(1.0, 1.0 / 1.75);
  float reach = dot(spread, spread);
  float glint = max(1.0 + 3.0 * dot(slope, toPointer), 0.0);
  float glare = (exp(-reach * 1.6) + exp(-reach * 0.35) * 0.15) * glint * 0.55 * (1.0 + 0.8 * (grain - 0.5) * brush);
  float highlight = softbox(q, sigma) * 0.95 + glare;

  vec3 tint = vec3(0.92, 0.95, 1.0);
  vec3 color = vec3(0.018, 0.019, 0.024) + tint * (scene * 0.065 + highlight * 0.34);
  color = min(color, 0.7) + 0.3 * (1.0 - exp(-max(color - 0.7, 0.0) / 0.3));
  color = pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));
  color += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0) * coverage, coverage);
}`;

  let gl = null;
  let prog = null;
  let uniforms = {};
  let cardVisible = true;
  let tiltRaf = null;
  let rx = 0, ry = 0, tx = 0, ty = 0;
  let px = 0, py = 80, tpx = 0, tpy = 80;

  function initWebGL() {
    if (!canvasEl) return;
    gl = canvasEl.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, PLATE_SRC);
    if (!vs || !fs) return;
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPosition');
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      prog = null;
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    ['uSize', 'uRadius', 'uScale', 'uRotate', 'uPointer'].forEach(name => {
      uniforms[name] = gl.getUniformLocation(prog, name);
    });
  }

  function drawCardGL() {
    if (!gl || !prog || !cardVisible) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = bodyEl.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvasEl.width !== w || canvasEl.height !== h) {
      canvasEl.width = w;
      canvasEl.height = h;
    }

    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);

    const ax = (rx * Math.PI) / 180;
    const ay = (ry * Math.PI) / 180;
    const cx = Math.cos(ax), sx = Math.sin(ax);
    const cy = Math.cos(ay), sy = Math.sin(ay);
    // Macierz obrotu kolumnowa (Ry * Rx)
    const mat = new Float32Array([
      cy, sx * sy, -cx * sy,
      0, cx, sx,
      sy, -sx * cy, cx * cy
    ]);

    gl.uniform2f(uniforms.uSize, rect.width, rect.height);
    gl.uniform1f(uniforms.uRadius, 24);
    gl.uniform1f(uniforms.uScale, dpr);
    gl.uniformMatrix3fv(uniforms.uRotate, false, mat);
    gl.uniform2f(uniforms.uPointer, px, py);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function stepCard() {
    if (!cardVisible) {
      tiltRaf = null;
      return;
    }
    const reduced = isReducedMotion();
    if (reduced) {
      rx = 0; ry = 0; px = 0; py = 80;
      bodyEl.style.setProperty('--rc-rx', '0deg');
      bodyEl.style.setProperty('--rc-ry', '0deg');
      drawCardGL();
      tiltRaf = null;
      return;
    }

    rx += (tx - rx) * 0.16;
    ry += (ty - ry) * 0.16;
    px += (tpx - px) * 0.18;
    py += (tpy - py) * 0.18;

    bodyEl.style.setProperty('--rc-rx', `${rx.toFixed(2)}deg`);
    bodyEl.style.setProperty('--rc-ry', `${ry.toFixed(2)}deg`);
    drawCardGL();

    const settled =
      Math.abs(tx - rx) < 0.02 &&
      Math.abs(ty - ry) < 0.02 &&
      Math.abs(tpx - px) < 0.3 &&
      Math.abs(tpy - py) < 0.3;

    if (!settled) {
      tiltRaf = requestAnimationFrame(stepCard);
    } else {
      tiltRaf = null;
    }
  }

  function scheduleCard() {
    if (tiltRaf === null && cardVisible) {
      tiltRaf = requestAnimationFrame(stepCard);
    }
  }

  cardEl.addEventListener('pointermove', e => {
    if (isReducedMotion()) return;
    const rect = cardEl.getBoundingClientRect();
    const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    tx = -ny * 10;
    ty = nx * 10;
    tpx = nx * rect.width * 0.5;
    tpy = -ny * rect.height * 0.5;

    bodyEl.classList.add('is-tilting');
    bodyEl.style.setProperty('--gx', `${((nx + 1) * 50).toFixed(1)}%`);
    bodyEl.style.setProperty('--gy', `${((ny + 1) * 50).toFixed(1)}%`);
    bodyEl.style.setProperty('--ga', '0.55');
    scheduleCard();
  });

  cardEl.addEventListener('pointerleave', () => {
    tx = 0;
    ty = 0;
    tpx = 0;
    tpy = 80;
    bodyEl.classList.remove('is-tilting');
    bodyEl.style.setProperty('--gx', '50%');
    bodyEl.style.setProperty('--gy', '24%');
    bodyEl.style.setProperty('--ga', '0.35');
    scheduleCard();
  });

  initWebGL();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        cardVisible = entries[0].isIntersecting;
        if (cardVisible) scheduleCard();
      },
      { threshold: 0.05 }
    );
    io.observe(section);
  }
  scheduleCard();
})();
