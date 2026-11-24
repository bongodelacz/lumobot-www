/* Dropdown z platformami przy przycisku pobierania: klik, Esc, strzałki, klik poza menu zamyka. */
(function(){
  'use strict';
  const btn = document.querySelector('.hr-dl-more'), menu = document.getElementById('hrDdMenu');
  if(!btn || !menu) return;
  const items = () => [...menu.querySelectorAll('a.hr-mi')];
  const open = focus => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); if(focus && items()[0]) items()[0].focus(); };
  const close = back => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if(back) btn.focus(); };
  btn.addEventListener('click', e => { e.stopPropagation(); if(menu.hidden) open(e.detail === 0); else close(false); });
  btn.addEventListener('keydown', e => { if(e.key === 'ArrowDown'){ e.preventDefault(); open(true); } });
  menu.addEventListener('keydown', e => {
    const list = items(), i = list.indexOf(document.activeElement);
    if(e.key === 'Escape'){ e.preventDefault(); close(true); }
    else if((e.key === 'ArrowDown' || e.key === 'ArrowRight')){ e.preventDefault(); list[(i + 1) % list.length].focus(); }
    else if((e.key === 'ArrowUp' || e.key === 'ArrowLeft')){ e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    else if(e.key === 'Tab'){ close(false); }
  });
  document.addEventListener('click', e => { if(!menu.hidden && !menu.contains(e.target)) close(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !menu.hidden) close(true); });
})();
/* "Pobierz za darmo" w sekcji z ceną: płynny powrót na samą górę strony, do przycisku pobierania */
(function(){
  const a = document.querySelector('.cena-cta'); if(!a) return;
  a.addEventListener('click', e => { e.preventDefault(); scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); });
})();
