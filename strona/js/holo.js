/* LumoBot: gęsta sterta pełnych kształtów agentów nad stopką z niebieskim połyskiem (Canvas 2D, 60 fps). */
(function(){
  'use strict';

  const container = document.querySelector('.dl-holo');
  if(!container) return;
  const canvas = container.querySelector('.dl-holo-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if(!ctx) return;

  const root = document.documentElement;
  const reduce = root.classList.contains('static') ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const AGENT_PRESETS = [
    { shape: 'chmura',     face: 'duze',       color: '#493093' },
    { shape: 'szesciokat', face: 'mrugniecie', color: '#d6409f' },
    { shape: 'pigula',     face: 'kreski',     color: '#64748b' },
    { shape: 'squircle',   face: 'gwiazdki',   color: '#3a6bfc' },
    { shape: 'kwiat',      face: 'plusy',      color: '#06b6d4' },
    { shape: 'trojkat',    face: 'kropki',     color: '#890017' },
    { shape: 'duch',       face: 'gwiazdki',   color: '#3a6bfc' },
    { shape: 'kot',        face: 'serca',      color: '#7c3aed' },
    { shape: 'mis',        face: 'usmiech',    color: '#0ea5e9' },
    { shape: 'kolo',       face: 'kwadraty',   color: '#10b981' },
    { shape: 'kwadrat',    face: 'gwiazdki',   color: '#f59e0b' },
    { shape: 'wybuch',     face: 'plusy',      color: '#ec4899' },
    { shape: 'osmiornica', face: 'kropki',     color: '#6366f1' },
    { shape: 'odlamek',    face: 'spiace',     color: '#14b8a6' },
    { shape: 'romb',       face: 'duze',       color: '#3b82f6' },
    { shape: 'squircle',   face: 'mrugniecie', color: '#24289b' },
    { shape: 'mis',        face: 'duze',       color: '#3a6bfc' },
    { shape: 'kot',        face: 'usmiech',    color: '#9333ea' },
    { shape: 'chmura',     face: 'spiace',     color: '#2563eb' },
    { shape: 'kwiat',      face: 'serca',      color: '#f43f5e' },
    { shape: 'duch',       face: 'kropki',     color: '#4f46e5' },
    { shape: 'osmiornica', face: 'mrugniecie', color: '#0891b2' }
  ];

  const LOW_EYES = new Set(['kot', 'mis', 'chmura', 'trojkat']);
  const HIGH_EYES = new Set(['osmiornica']);

  const SPRITE_SIZE = 176;
  const SPRITE_PAD = 18;
  const BODY_DRAW = SPRITE_SIZE - SPRITE_PAD * 2;

  const sprites = [];
  let spritesReady = false;
  let agents = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let lastLayoutW = 0;
  let lastLayoutH = 0;

  let raf = 0;
  let lastTime = 0;
  let clock = 0;
  let visible = true;

  const pointer = {
    x: -9999,
    y: -9999,
    smoothX: -9999,
    smoothY: -9999,
    inside: false,
    presence: 0
  };

  const hash = (a, b) => {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  };

  const buildSprites = () => {
    const faceDir = window.LUMO_FACEDIR || 'app/faces/';
    const urls = new Set();
    for(const a of AGENT_PRESETS){
      urls.add(`${faceDir}${a.shape}-mul.png`);
      urls.add(`${faceDir}${a.shape}-add.png`);
      urls.add(`${faceDir}eyes-${a.face}.png`);
    }

    const cache = new Map();
    const load = src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { cache.set(src, img); resolve(); };
      img.onerror = () => resolve();
      img.src = src;
    });

    Promise.all([...urls].map(load)).then(() => {
      const tmp = document.createElement('canvas');
      tmp.width = SPRITE_SIZE;
      tmp.height = SPRITE_SIZE;
      const tctx = tmp.getContext('2d');
      if(!tctx) return;

      AGENT_PRESETS.forEach(a => {
        const mul = cache.get(`${faceDir}${a.shape}-mul.png`);
        const add = cache.get(`${faceDir}${a.shape}-add.png`);
        const eyes = cache.get(`${faceDir}eyes-${a.face}.png`);
        if(!mul) return;

        // Czyste ciało agenta
        tctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
        tctx.globalCompositeOperation = 'source-over';
        tctx.fillStyle = a.color;
        tctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

        tctx.globalCompositeOperation = 'destination-in';
        tctx.drawImage(mul, SPRITE_PAD, SPRITE_PAD, BODY_DRAW, BODY_DRAW);

        tctx.globalCompositeOperation = 'multiply';
        tctx.drawImage(mul, SPRITE_PAD, SPRITE_PAD, BODY_DRAW, BODY_DRAW);

        if(add){
          tctx.globalCompositeOperation = 'lighter';
          tctx.drawImage(add, SPRITE_PAD, SPRITE_PAD, BODY_DRAW, BODY_DRAW);
        }

        // Ciało z miękkim cieniem w jednym gotowym płótnie (szybkie rysowanie przy 60 fps)
        const bodyCanvas = document.createElement('canvas');
        bodyCanvas.width = SPRITE_SIZE;
        bodyCanvas.height = SPRITE_SIZE;
        const bctx = bodyCanvas.getContext('2d');
        if(!bctx) return;
        bctx.save();
        bctx.shadowColor = 'rgba(4, 6, 14, 0.52)';
        bctx.shadowBlur = 14;
        bctx.shadowOffsetY = 5;
        bctx.drawImage(tmp, 0, 0);
        bctx.restore();

        // Warstwa oczu
        const eyesCanvas = document.createElement('canvas');
        eyesCanvas.width = SPRITE_SIZE;
        eyesCanvas.height = SPRITE_SIZE;
        const ectx = eyesCanvas.getContext('2d');
        const eyeYFactor = LOW_EYES.has(a.shape) ? 0.5625 : HIGH_EYES.has(a.shape) ? 0.4375 : 0.5;
        if(ectx && eyes){
          const eyOffset = (eyeYFactor - 0.5) * BODY_DRAW;
          ectx.drawImage(eyes, SPRITE_PAD, SPRITE_PAD + eyOffset, BODY_DRAW, BODY_DRAW);
        }

        sprites.push({
          body: bodyCanvas,
          eyes: eyesCanvas,
          eyeYFactor
        });
      });

      spritesReady = sprites.length > 0;
      buildLayout();
      render();
    });
  };

  const buildLayout = () => {
    if(!spritesReady || width < 2 || height < 2) return;
    lastLayoutW = width;
    lastLayoutH = height;

    const mobile = width <= 600;
    const minSize = mobile ? 52 : 74;
    const maxSize = mobile ? 92 : 138;
    const avgSize = (minSize + maxSize) * 0.5;

    // Gęste upakowanie z lekkim nachodzeniem jak sterta pluszowych misiów
    const stepX = avgSize * 0.67;
    const stepY = avgSize * 0.60;
    const cols = Math.ceil((width + avgSize) / stepX) + 1;
    const rows = Math.ceil((height + avgSize) / stepY) + 1;
    const startX = -avgSize * 0.35;
    const startY = -avgSize * 0.25;

    const list = [];
    for(let r = 0; r < rows; r++){
      const rowOffset = (r % 2) * (stepX * 0.5);
      for(let c = 0; c < cols; c++){
        const h1 = hash(c * 1.37 + 1.1, r * 2.13 + 3.7);
        const h2 = hash(c * 2.71 + 5.3, r * 1.49 + 7.9);
        const h3 = hash(c * 3.17 + 9.1, r * 2.83 + 2.3);
        const h4 = hash(c * 4.09 + 4.7, r * 3.31 + 6.1);
        const h5 = hash(c * 5.23 + 8.3, r * 4.19 + 1.9);

        const size = minSize + h4 * (maxSize - minSize);
        const cx = startX + c * stepX + rowOffset + (h1 - 0.5) * stepX * 0.30;
        const cy = startY + r * stepY + (h2 - 0.5) * stepY * 0.24;
        const spriteIdx = (c * 7 + r * 13 + Math.floor(h5 * sprites.length)) % sprites.length;

        list.push({
          cx,
          cy,
          size,
          spriteIdx,
          baseRot: (h3 - 0.5) * 0.28,
          phase: h1 * Math.PI * 2 + h2 * 4.0,
          breathSpeed: 1.35 + h4 * 0.85,
          swaySpeed: 0.9 + h5 * 0.7,
          lookSpeed: 0.45 + h3 * 0.55,
          blinkPeriod: 2.8 + h2 * 4.2,
          blinkPhase: h5 * 19.3 + h1 * 5.7,
          zOrder: cy * 0.65 + (maxSize - size) * 0.45 + h5 * 28
        });
      }
    }

    list.sort((a, b) => a.zOrder - b.zOrder);
    agents = list;
  };

  const drawBlueHoloSheen = () => {
    const t = clock;

    // 1. Miękkie przesuwające się pasma niebieskiego połysku (#3a6bfc, #9db5ff)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const shift1 = Math.sin(t * 0.27) * width * 0.28;
    const g1 = ctx.createLinearGradient(
      width * 0.1 + shift1, 0,
      width * 0.72 + shift1, height
    );
    g1.addColorStop(0.0, 'rgba(58, 107, 252, 0)');
    g1.addColorStop(0.32, 'rgba(58, 107, 252, 0.18)');
    g1.addColorStop(0.50, 'rgba(157, 181, 255, 0.24)');
    g1.addColorStop(0.68, 'rgba(58, 107, 252, 0.14)');
    g1.addColorStop(1.0, 'rgba(58, 107, 252, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const shift2 = Math.cos(t * 0.19 + 1.4) * width * 0.24;
    const g2 = ctx.createLinearGradient(
      width * 0.85 + shift2, 0,
      width * 0.28 + shift2, height
    );
    g2.addColorStop(0.0, 'rgba(157, 181, 255, 0)');
    g2.addColorStop(0.45, 'rgba(157, 181, 255, 0.14)');
    g2.addColorStop(0.62, 'rgba(58, 107, 252, 0.16)');
    g2.addColorStop(1.0, 'rgba(58, 107, 252, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);

    // 2. Wędrująca plama światła lub podążająca za kursorem
    const autoX = width * (0.5 + 0.34 * Math.cos(t * 0.31 + 0.5));
    const autoY = height * (0.48 + 0.26 * Math.sin(t * 0.43 + 1.1));
    const lx = autoX + (pointer.smoothX - autoX) * pointer.presence;
    const ly = autoY + (pointer.smoothY - autoY) * pointer.presence;
    const rad = Math.max(width, height) * (pointer.presence > 0.05 ? 0.34 : 0.42);

    const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, rad);
    rg.addColorStop(0.0, `rgba(157, 181, 255, ${0.18 + 0.13 * pointer.presence})`);
    rg.addColorStop(0.45, `rgba(58, 107, 252, ${0.11 + 0.08 * pointer.presence})`);
    rg.addColorStop(1.0, 'rgba(58, 107, 252, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  };

  const render = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    if(!spritesReady || agents.length === 0) return;

    const repelRadius = width <= 600 ? 95 : 145;
    const gazeRadius = width <= 600 ? 180 : 280;
    const repelR2 = repelRadius * repelRadius;
    const gazeR2 = gazeRadius * gazeRadius;
    const hasHover = pointer.presence > 0.004;

    for(let i = 0; i < agents.length; i++){
      const a = agents[i];
      const sp = sprites[a.spriteIdx];
      if(!sp) continue;

      const drawBox = a.size * (SPRITE_SIZE / BODY_DRAW);
      const half = drawBox * 0.5;

      // Oddychanie (scale 1 do 1.03) i lekkie kołysanie
      let breath = 1;
      let rot = a.baseRot;
      let floatY = 0;
      let pushX = 0;
      let pushY = 0;
      let eyeOffX = 0;
      let eyeOffY = 0;
      let eyeScaleY = 1;

      if(!reduce){
        breath = 1 + 0.03 * (0.5 + 0.5 * Math.sin(clock * a.breathSpeed + a.phase));
        rot = a.baseRot + Math.sin(clock * a.swaySpeed + a.phase * 1.3) * 0.068;
        floatY = Math.cos(clock * a.swaySpeed * 0.85 + a.phase) * 2.2;

        // Rozglądanie się oczami w swoim rytmie
        const gx = Math.sin(clock * a.lookSpeed + a.phase) * 0.65 +
                   Math.sin(clock * a.lookSpeed * 1.7 + a.phase * 0.5) * 0.35;
        const gy = Math.cos(clock * a.lookSpeed * 0.82 + a.phase * 1.1) * 0.65 +
                   Math.sin(clock * a.lookSpeed * 1.35 + a.phase * 0.7) * 0.35;
        eyeOffX = gx * a.size * 0.052;
        eyeOffY = gy * a.size * 0.032;

        // Mruganie
        const bMod = (clock + a.blinkPhase) % a.blinkPeriod;
        if(bMod < 0.19){
          const bt = Math.sin((bMod / 0.19) * Math.PI);
          eyeScaleY = 1 - 0.92 * bt * bt;
        }

        // Reakcja na kursor: odsuwają się, podskakują i patrzą na kursor
        if(hasHover){
          const dx = a.cx - pointer.smoothX;
          const dy = a.cy - pointer.smoothY;
          const d2 = dx * dx + dy * dy;

          if(d2 < gazeR2){
            const d = Math.sqrt(d2) || 1;
            const gazeW = Math.exp(-d2 / (gazeR2 * 0.55)) * pointer.presence;
            const targetEyeX = (-dx / Math.max(d, 24)) * a.size * 0.068;
            const targetEyeY = (-dy / Math.max(d, 24)) * a.size * 0.056;
            eyeOffX = eyeOffX + (targetEyeX - eyeOffX) * gazeW;
            eyeOffY = eyeOffY + (targetEyeY - eyeOffY) * gazeW;

            if(d2 < repelR2){
              const force = Math.exp(-d2 / (repelR2 * 0.45)) * pointer.presence;
              pushX = (dx / Math.max(d, 18)) * 17 * force;
              pushY = (dy / Math.max(d, 18)) * 12 * force - 10 * force * (0.6 + 0.4 * Math.sin(clock * 7.5 + a.phase));
              breath += 0.055 * force;
            }
          }
        }
      } else {
        // Statyczna klatka: delikatnie zróżnicowane spojrzenie
        eyeOffX = Math.sin(a.phase) * a.size * 0.03;
        eyeOffY = Math.cos(a.phase * 1.4) * a.size * 0.018;
      }

      ctx.save();
      ctx.translate(a.cx + pushX, a.cy + floatY + pushY);
      ctx.rotate(rot);
      ctx.scale(breath, breath);
      ctx.drawImage(sp.body, -half, -half, drawBox, drawBox);

      // Oczy z niezależnym spojrzeniem i mruganiem
      const pivotY = drawBox * (sp.eyeYFactor - 0.5);
      ctx.translate(eyeOffX, pivotY + eyeOffY);
      ctx.scale(1, eyeScaleY);
      ctx.drawImage(sp.eyes, -half, -half - pivotY, drawBox, drawBox);
      ctx.restore();
    }

    drawBlueHoloSheen();
  };

  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.max(1, Math.round(width * dpr));
    const ph = Math.max(1, Math.round(height * dpr));
    if(canvas.width !== pw || canvas.height !== ph){
      canvas.width = pw;
      canvas.height = ph;
    }
    if(Math.abs(width - lastLayoutW) > 12 || Math.abs(height - lastLayoutH) > 8){
      buildLayout();
    }
    render();
  };

  const frame = now => {
    raf = 0;
    if(!visible || document.hidden || reduce) return;
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
    lastTime = now;
    clock += dt;

    const goal = pointer.inside ? 1 : 0;
    pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / (goal ? 0.18 : 0.45)));
    if(pointer.inside){
      if(pointer.smoothX < -5000){
        pointer.smoothX = pointer.x;
        pointer.smoothY = pointer.y;
      } else {
        const k = 1 - Math.exp(-dt / 0.09);
        pointer.smoothX += (pointer.x - pointer.smoothX) * k;
        pointer.smoothY += (pointer.y - pointer.smoothY) * k;
      }
    }

    render();
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if(!raf && visible && !document.hidden && !reduce){
      lastTime = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  if(!reduce){
    window.addEventListener('pointermove', e => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if(pointer.inside){
        pointer.x = x;
        pointer.y = y;
      }
      wake();
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', () => {
      pointer.inside = false;
    });

    document.addEventListener('visibilitychange', () => {
      lastTime = 0;
      if(!document.hidden) wake();
    });
  }

  if(window.ResizeObserver){
    new ResizeObserver(resize).observe(container);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  if(window.IntersectionObserver){
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if(visible){
        if(reduce) render();
        else wake();
      }
    }).observe(container);
  }

  buildSprites();
  resize();
  if(!reduce) wake();
})();
