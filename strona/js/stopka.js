/* LumoBot: koniec strony to stopka. Gdy dociągasz stronę w dół (kółko, palec, klawisz), cała treść płynnie
   podjeżdża w górę, a spod niej wyrasta biało-niebieska zorza (js/zorza.js). Puszczasz: wszystko wraca.
   Ciągnie się luźno, bez blokady; mocne pociągnięcie zostawia zorzę na chwilę. */
(function(){
  'use strict';
  const root = document.documentElement;
  if(!document.querySelector('.dl-aurora') || root.classList.contains('static') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const main = document.getElementById('tresc');
  if(main) main.classList.add('dl-shift');

  let pull = 0, releaseTimer = 0, closeTimer = 0, touchY = null;
  const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const set = v => {
    pull = Math.max(0, Math.min(1, v));
    root.style.setProperty('--pull', pull.toFixed(3));
    root.style.setProperty('--reveal', Math.min(1, pull * 1.4).toFixed(3));
    if(pull > 0){ root.classList.add('dl-act'); if(window.lumoZorza) window.lumoZorza(); }
  };
  const animateTo = v => {
    root.classList.add('dl-anim');
    set(v);
    clearTimeout(animateTo.t);
    animateTo.t = setTimeout(() => { root.classList.remove('dl-anim'); if(pull === 0) root.classList.remove('dl-act'); }, 750);
  };
  const close = () => { root.classList.remove('dl-open'); animateTo(0); };
  const release = () => {
    if(pull >= 0.45){ root.classList.add('dl-open'); animateTo(1); clearTimeout(closeTimer); closeTimer = setTimeout(close, 4500); }
    else close();
  };
  const drag = delta => {
    root.classList.remove('dl-anim');
    clearTimeout(closeTimer);
    set(pull + delta * (1 - pull * 0.35));
    clearTimeout(releaseTimer); releaseTimer = setTimeout(release, 220);
  };

  window.addEventListener('wheel', e => {
    if(e.deltaY > 0 && (atBottom() || pull > 0)){ if(pull > 0) e.preventDefault(); drag(Math.min(e.deltaY, 160) / 520); }
    else if(e.deltaY < 0 && pull > 0){ e.preventDefault(); drag(Math.max(e.deltaY, -160) / 520); }
  }, {passive: false});

  window.addEventListener('touchstart', e => { touchY = (atBottom() || pull > 0) ? e.touches[0].clientY : null; }, {passive: true});
  window.addEventListener('touchmove', e => {
    if(touchY == null) return;
    const y = e.touches[0].clientY, d = touchY - y; touchY = y;
    if(d > 0 || pull > 0) drag(d / 360);
  }, {passive: true});
  window.addEventListener('touchend', () => { if(touchY != null){ touchY = null; clearTimeout(releaseTimer); release(); } }, {passive: true});

  window.addEventListener('keydown', e => {
    if((e.key === 'End' || e.key === 'PageDown' || e.key === 'ArrowDown') && atBottom()){ set(0.6); release(); }
  });
})();

/* Napis "Lumo Bot" nad stopką: niebieska poświata idzie za kursorem. */
(function(){
  const w = document.querySelector('.dl-word'), t = w && w.querySelector('.dl-word-t');
  if(!t || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  w.addEventListener('pointermove', e => { const r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  w.addEventListener('pointerleave', () => { t.style.removeProperty('--mx'); t.style.removeProperty('--my'); });
})();
