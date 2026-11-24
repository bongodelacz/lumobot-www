// LumoBot, strona główna (Lider): baner z siatką buziek, historia z pierścieniem postępu,
// klikalne okno aplikacji, żywa sieć Neuro. Efekty przewijania są w js/ruch.js (Forma), tło w js/tlo.js.
(function(){
  'use strict';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const statyczna = document.documentElement.classList.contains('static');
  const calm = still || statyczna;

  /* ---------- historia: przewijanie zmienia zdanie i wypełnia pierścień ---------- */
  const hs = document.getElementById('historia');
  if(hs){
    const lines = [...hs.querySelectorAll('.hs-lines li')], dots = [...hs.querySelectorAll('.hs-dots i')], ring = hs.querySelector('.hs-ring');
    let cur = -1;
    const set = k => {
      if(k === cur) return; cur = k; hs.dataset.step = k;
      lines.forEach((l, i) => { l.classList.toggle('on', i === k); l.classList.toggle('past', i < k); });
      dots.forEach((d, i) => d.classList.toggle('on', i === k));
      const f = hs.querySelector('.hs-who .face'); if(f) f.classList.toggle('busy', k === 1 || k === 3);
    };
    const onScroll = () => {
      const r = hs.getBoundingClientRect(), span = r.height - innerHeight;
      const p = Math.min(.999, Math.max(0, -r.top / Math.max(1, span)));
      ring.style.setProperty('--p', p.toFixed(3));
      set(Math.floor(p * lines.length));
    };
    addEventListener('scroll', onScroll, {passive: true}); onScroll();
  }

  /* ---------- klikalne okno: skalowanie, wjazd, samo pisze po pokazaniu ---------- */
  const frame = document.getElementById('appframe'), ifr = document.getElementById('appiframe');
  if(frame && ifr){
    const fit = () => frame.style.setProperty('--s', (frame.clientWidth / 1344).toFixed(4));
    new ResizeObserver(fit).observe(frame); fit();
    const post = msg => { try{ ifr.contentWindow.postMessage(msg, location.origin); }catch(e){} };
    let loaded = false, auto = false;
    ifr.addEventListener('load', () => { loaded = true; });
    new IntersectionObserver(es => {
      if(!es[0].isIntersecting) return;
      frame.classList.add('in');
      if(auto) return; auto = true;
      // decyzja użytkownika: czaty mają być puste, okno nie wpisuje nic samo
    }, {threshold: .4}).observe(frame);
    document.querySelectorAll('.ap-chip').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('.ap-chip').forEach(x => x.classList.remove('sent'));
      b.classList.add('sent'); auto = true;
      post({type: 'lumo-goal', goal: b.dataset.goal});
      if(frame.getBoundingClientRect().top > innerHeight * .5) frame.scrollIntoView({behavior: calm ? 'auto' : 'smooth', block: 'center'});
    }));
  }

  /* ---------- Funkcje: przewijana opowieść, grafika po lewej podąża za tekstem ---------- */
  const fs = document.getElementById('funkcje');
  if(fs && fs.querySelector('.fs-step')){
    const steps = [...fs.querySelectorAll('.fs-step')], imgs = [...fs.querySelectorAll('.fs-img')], bars = [...fs.querySelectorAll('.fs-progress i')];
    const pick = k => {
      steps.forEach(s => s.classList.toggle('on', s.dataset.k === k));
      imgs.forEach(i => i.classList.toggle('on', i.dataset.k === k));
      const n = steps.findIndex(s => s.dataset.k === k); bars.forEach((b, i) => b.classList.toggle('on', i === n));
    };
    pick(steps[0].dataset.k);
    imgs.forEach(i => { i.loading = 'eager'; });   // grafiki muszą być gotowe, zanim tekst je przywoła
    const fsObs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) pick(e.target.dataset.k); }), {rootMargin: '-45% 0px -45% 0px'});
    steps.forEach(s => fsObs.observe(s));
  }

  /* ---------- Neuro: żywa sieć, sygnały płyną od wejść do wyniku ---------- */
  const cv = document.getElementById('neuroNet');
  if(cv){
    const g = cv.getContext('2d'), W = 520, H = 300, d = Math.min(2, devicePixelRatio || 1);
    cv.width = W * d; cv.height = H * d; g.scale(d, d);
    const layers = [5, 7, 7, 1].map((n, li, all) => Array.from({length: n}, (_, i) => ({x: 50 + li * (W - 100) / (all.length - 1), y: H / 2 + (i - (n - 1) / 2) * (n === 1 ? 0 : Math.min(46, (H - 60) / (n - 1)))})));
    const edges = [];
    layers.forEach((L, li) => { if(li < layers.length - 1) L.forEach(a => layers[li + 1].forEach(b => edges.push({a, b, w: Math.random()}))); });
    const pulses = [];
    let on = false;
    new IntersectionObserver(es => { on = es[0].isIntersecting; if(on) requestAnimationFrame(draw); }).observe(cv);
    function draw(now){
      const t = now / 1000;
      g.clearRect(0, 0, W, H);
      edges.forEach(e => { g.strokeStyle = `rgba(142,171,255,${(.05 + e.w * .14).toFixed(3)})`; g.lineWidth = .6 + e.w; g.beginPath(); g.moveTo(e.a.x, e.a.y); g.lineTo(e.b.x, e.b.y); g.stroke(); });
      if(!calm && Math.random() < .35){ const e = edges[Math.floor(Math.random() * edges.length)]; pulses.push({e, s: 0}); }
      for(let i = pulses.length - 1; i >= 0; i--){
        const p = pulses[i]; p.s += .02; if(p.s >= 1){ pulses.splice(i, 1); continue; }
        const x = p.e.a.x + (p.e.b.x - p.e.a.x) * p.s, y = p.e.a.y + (p.e.b.y - p.e.a.y) * p.s;
        g.fillStyle = 'rgba(160,185,255,.9)'; g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill();
      }
      layers.forEach((L, li) => L.forEach((n, i) => {
        const out = li === layers.length - 1, pulse = out ? 1 + Math.sin(t * 2) * .12 : 1, r = (out ? 16 : 7) * pulse;
        
        g.fillStyle = out ? '#3a6bfc' : '#1c2238'; g.strokeStyle = out ? '#b9caff' : 'rgba(142,171,255,.7)'; g.lineWidth = 1.4;
        g.beginPath(); g.arc(n.x, n.y, r, 0, 7); g.fill(); g.stroke();
      }));
      if(on && !calm) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
})();
