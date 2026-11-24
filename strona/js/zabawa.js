/* LumoBot: interakcje buziek agentów [data-face] */
(function(){
  'use strict';

  const FALLBACK_TEKSTY = {
    Lider: ['Spokojnie, mam plan.', 'Cel jasny. Ruszamy.'],
    'Pióro': ['Krótko i bez waty.', 'Przecinek już leci.'],
    Kreska: ['Przesunięte o piksel.', 'Działa na telefonie.'],
    Lupa: ['Sprawdzam, aż przejdzie.', 'Kliknąłem dwa razy.'],
    Radar: ['Liczby nie kłamią.', 'Widzę nowy trend.'],
    Paleta: ['Kontrast musi być.', 'Ten kolor ma charakter.'],
    niespodzianka: ['Hej, to łaskocze!', 'Pięć kliknięć? Szacun.']
  };

  const EYE_DURATION_MS = 1500;
  const BUBBLE_DURATION_MS = 2000;
  const STREAK_WINDOW_MS = 2400;
  const SURPRISE_CLICKS = 5;
  const MAX_EYE_SHIFT = 3;

  const mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const isReduced = () => Boolean(mqReduce && mqReduce.matches);

  const stateMap = new WeakMap();
  const activeBubbles = new WeakMap();

  function getState(el){
    let st = stateMap.get(el);
    if(!st){
      st = { clicks: 0, streakTimer: 0, eyeTimer: 0 };
      stateMap.set(el, st);
    }
    return st;
  }

  function getPool(agentName, isSurprise){
    const src = window.LUMO_ZABAWA || FALLBACK_TEKSTY;
    if(isSurprise){
      const s = src.niespodzianka || FALLBACK_TEKSTY.niespodzianka;
      return Array.isArray(s) && s.length ? s : ['Hej, to łaskocze!'];
    }
    const list = src[agentName] || FALLBACK_TEKSTY[agentName];
    if(Array.isArray(list) && list.length) return list;
    return ['Gotowy do pracy.'];
  }

  function pickRandom(arr, exclude){
    if(!arr || !arr.length) return null;
    if(arr.length === 1) return arr[0];
    const filtered = exclude ? arr.filter(item => item !== exclude) : arr;
    const pool = filtered.length ? filtered : arr;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function triggerClass(el, cls){
    if(isReduced()) return;
    el.classList.remove('zb-hop', 'zb-spin');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function swapEyes(el, st){
    const eyes = el.querySelector('.face .eyes');
    if(!eyes) return;
    const eyesList = Array.isArray(window.LUMO_EYES) && window.LUMO_EYES.length
      ? window.LUMO_EYES
      : ['gwiazdki','kropki','kreski','usmiech','mrugniecie','duze','spiace','kwadraty','plusy','serca'];
    const faceDir = window.LUMO_FACEDIR || 'app/faces/';

    if(!eyes.dataset.zbOrigBg){
      eyes.dataset.zbOrigBg = eyes.style.backgroundImage || '';
    }

    const currentMatch = (eyes.style.backgroundImage || '').match(/eyes-([a-z0-9_-]+)\.png/i);
    const currentEye = currentMatch ? currentMatch[1] : '';
    const nextEye = pickRandom(eyesList, currentEye);
    if(!nextEye) return;

    eyes.style.backgroundImage = `url(${faceDir}eyes-${nextEye}.png)`;

    if(st.eyeTimer) clearTimeout(st.eyeTimer);
    st.eyeTimer = setTimeout(() => {
      if(eyes.dataset.zbOrigBg !== undefined){
        eyes.style.backgroundImage = eyes.dataset.zbOrigBg;
      }
      st.eyeTimer = 0;
    }, EYE_DURATION_MS);
  }

  function showBubble(el, text){
    if(!text) return;
    const prev = activeBubbles.get(el);
    if(prev){
      clearTimeout(prev.fadeTimer);
      clearTimeout(prev.removeTimer);
      prev.node.remove();
      activeBubbles.delete(el);
    }

    const stageCard = el.closest('.sg-face-stage');
    const rect = (stageCard || el).getBoundingClientRect();
    if(rect.width === 0 && rect.height === 0) return;

    const bubble = document.createElement('div');
    bubble.className = 'zb-dymek';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    bubble.textContent = text;

    const showBelow = rect.top < 54;
    if(showBelow) bubble.classList.add('zb-below');

    document.body.appendChild(bubble);

    const bw = Math.min(bubble.offsetWidth || 160, window.innerWidth - 24);
    const bh = bubble.offsetHeight || 30;
    const half = bw / 2;
    const rawCx = rect.left + rect.width / 2;
    const clampedCx = Math.max(12 + half, Math.min(window.innerWidth - 12 - half, rawCx));
    const topPos = stageCard
      ? (showBelow ? Math.min(window.innerHeight - 40, rect.bottom - bh / 2) : Math.max(44, rect.top + bh / 2))
      : (showBelow ? Math.min(window.innerHeight - 40, rect.bottom + 8) : Math.max(44, rect.top - 8));

    bubble.style.left = `${clampedCx.toFixed(1)}px`;
    bubble.style.top = `${topPos.toFixed(1)}px`;

    requestAnimationFrame(() => {
      bubble.classList.add('zb-in');
    });

    const fadeTimer = setTimeout(() => {
      bubble.classList.remove('zb-in');
      bubble.classList.add('zb-out');
    }, Math.max(200, BUBBLE_DURATION_MS - 220));

    const removeTimer = setTimeout(() => {
      bubble.remove();
      if(activeBubbles.get(el) && activeBubbles.get(el).node === bubble){
        activeBubbles.delete(el);
      }
    }, BUBBLE_DURATION_MS);

    activeBubbles.set(el, { node: bubble, fadeTimer, removeTimer });
  }

  function handleFaceClick(el){
    if(!el.querySelector('.face')) return;
    const st = getState(el);

    if(st.streakTimer) clearTimeout(st.streakTimer);
    st.clicks += 1;
    st.streakTimer = setTimeout(() => {
      st.clicks = 0;
      st.streakTimer = 0;
    }, STREAK_WINDOW_MS);

    const isSurprise = st.clicks >= SURPRISE_CLICKS;
    if(isSurprise){
      st.clicks = 0;
      triggerClass(el, 'zb-spin');
    } else {
      triggerClass(el, 'zb-hop');
    }

    swapEyes(el, st);

    if(!el.closest('.sg-pick')){
      const agentName = el.dataset.face || '';
      const pool = getPool(agentName, isSurprise);
      const text = pickRandom(pool, el.dataset.zbLastText || '');
      el.dataset.zbLastText = text || '';
      showBubble(el, text);
    }
  }

  document.addEventListener('click', e => {
    const el = e.target && e.target.closest ? e.target.closest('[data-face]') : null;
    if(!el || el.closest('.wy, a')) return;
    handleFaceClick(el);
  });

  document.addEventListener('animationend', e => {
    if(e.animationName !== 'zb-hop' && e.animationName !== 'zb-spin') return;
    const el = e.target && e.target.closest ? e.target.closest('[data-face]') : null;
    if(el) el.classList.remove('zb-hop', 'zb-spin');
  });

  /* ---------- oczy w #orbit podążają za kursorem (max 3 px) ---------- */
  function initOrbitEyes(){
    const orbit = document.getElementById('orbit');
    if(!orbit) return;

    let mx = 0;
    let my = 0;
    let rafId = 0;

    function updateEyes(){
      rafId = 0;
      if(isReduced()) return;
      const eyesList = orbit.querySelectorAll('[data-face] .eyes');
      for(let i = 0; i < eyesList.length; i++){
        const eyes = eyesList[i];
        const rect = eyes.getBoundingClientRect();
        if(!rect.width && !rect.height) continue;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        if(dist < 1){
          eyes.style.transform = 'translate3d(0,0,0)';
          continue;
        }
        const shift = Math.min(MAX_EYE_SHIFT, dist / 45);
        const tx = (dx / dist) * shift;
        const ty = (dy / dist) * shift;
        eyes.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)`;
      }
    }

    function resetEyes(){
      const eyesList = orbit.querySelectorAll('[data-face] .eyes');
      for(let i = 0; i < eyesList.length; i++){
        eyesList[i].style.transform = 'translate3d(0,0,0)';
      }
    }

    const host = orbit.closest('section') || document;
    host.addEventListener('pointermove', e => {
      if(isReduced()) return;
      mx = e.clientX;
      my = e.clientY;
      if(!rafId) rafId = requestAnimationFrame(updateEyes);
    }, { passive: true });

    host.addEventListener('pointerleave', () => {
      if(rafId){
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      resetEyes();
    }, { passive: true });
  }

  if(document.readyState !== 'loading'){
    initOrbitEyes();
  } else {
    document.addEventListener('DOMContentLoaded', initOrbitEyes);
  }
})();
