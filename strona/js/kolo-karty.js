/* Możliwości: sekcja stoi przy przewijaniu, a kolejne karty wjeżdżają od dołu na poprzednie.
   Po lewej duże nazwy, aktywna jest jasna. Kliknięcie nazwy przewija do jej karty. */
(function(){
  'use strict';
  const sec = document.getElementById('kolo');
  if(!sec || !sec.classList.contains('kk')) return;
  const cards = [...sec.querySelectorAll('.kk-card')], names = [...sec.querySelectorAll('.kk-name')], n = cards.length;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('static');
  let raf = 0, last = -1;
  const prog = () => { const r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight; return Math.max(0, Math.min(n - 1, (-r.top / Math.max(1, span)) * (n - 1))); };
  function draw(){
    raf = 0; const p = prog(); if(Math.abs(p - last) < .0005) return; last = p;
    cards.forEach((c, i) => {
      const d = i - p;
      let y, s, o, b;
      if(d >= 0){ const k = Math.min(1, d); y = k * 112; s = 1; o = d > 1.05 ? 0 : 1; b = 0; }                      /* następne: wjeżdżają od dołu */
      else { const k = Math.min(3, -d); y = -k * 2.4; s = 1 - k * .06; o = Math.max(0, 1 - k * .85); b = k * 2.2; }  /* poprzednie: cofają się w głąb */
      c.style.transform = `translate3d(0,${y}%,0) scale(${s})`; c.style.opacity = o; c.style.filter = b ? `brightness(${1 - b * .12})` : '';
      c.style.zIndex = 10 + i; c.setAttribute('aria-hidden', String(Math.round(p) !== i));
    });
    names.forEach((el, i) => { const k = Math.min(1, Math.abs(i - p)); el.style.opacity = 1 - k * .72; el.classList.toggle('on', Math.round(p) === i); });
  }
  const wake = () => { if(!raf) raf = requestAnimationFrame(draw); };
  names.forEach((el, i) => el.addEventListener('click', () => {
    const top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight;
    scrollTo({top: top + span * i / Math.max(1, n - 1) + 2, behavior: still ? 'auto' : 'smooth'});
  }));
  if(still){ sec.classList.add('kk-static'); return; }
  addEventListener('scroll', wake, {passive: true}); addEventListener('resize', () => { last = -1; wake(); }); draw();
})();
