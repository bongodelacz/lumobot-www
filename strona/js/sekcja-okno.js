/* Prawdziwe okno LumoBota na stronie: iframe 1360x860 skalowany do szerokości, ładowany dopiero blisko ekranu.
   Kółko myszy przewija stronę, dopóki ktoś nie kliknie w okno. */
(function(){
  'use strict';
  const win = document.getElementById('okWin'), fr = document.getElementById('okFrame'), cover = document.getElementById('okCover');
  if(!win || !fr) return;
  /* aplikacja rysuje się w prawdziwym rozmiarze, bez skalowania, gdy okno ma co najmniej 1100 px; węższe ekrany dostają pomniejszenie z 1100 px */
  const BASE = 1100, RATIO = 860 / 1360;
  const fit = () => { const w = win.clientWidth, base = Math.max(BASE, w), k = Math.min(1, w / base);
    fr.style.width = base + 'px'; fr.style.height = Math.round(base * RATIO) + 'px'; win.style.setProperty('--k', k.toFixed(4)); win.style.height = Math.round(base * RATIO * k) + 'px'; const fx = win.parentElement.querySelector('.ok-fx'); if(fx) fx.style.setProperty('--h', Math.round(base * RATIO * k) + 'px');
    const lz = document.getElementById('okLaser'), meta = document.querySelector('.hr-meta');
    if(lz && meta){ const sec = lz.parentElement.getBoundingClientRect(), mr = meta.getBoundingClientRect(); lz.style.top = Math.round(-(sec.top + scrollY)) + 'px'; lz.style.setProperty('--mb', Math.round(mr.bottom + scrollY) + 'px'); }      /* płótno od samej góry strony: wiązka spada z góry jak w oryginale */
    if(lz) { const wr = win.getBoundingClientRect(), lr = lz.getBoundingClientRect(); lz.style.setProperty('--wt', Math.round(wr.top - lr.top) + 'px'); lz.style.setProperty('--wb', Math.round(wr.bottom - lr.top) + 'px'); lz.style.setProperty('--wl', Math.round(wr.left - lr.left) + 'px'); lz.style.setProperty('--wr', Math.round(wr.right - lr.left) + 'px'); } };
  fit(); addEventListener('resize', fit); addEventListener('load', fit);
  const load = () => { if(!fr.src) fr.src = fr.dataset.src; };
  if('IntersectionObserver' in window) new IntersectionObserver((es, io) => { if(es.some(e => e.isIntersecting)){ load(); io.disconnect(); } }, {rootMargin: '600px'}).observe(win);
  else load();
  cover.addEventListener('click', () => { load(); win.classList.add('live'); fr.tabIndex = 0; fr.focus(); });
  document.addEventListener('pointerdown', e => { if(!win.contains(e.target)){ win.classList.remove('live'); fr.tabIndex = -1; } });
})();
