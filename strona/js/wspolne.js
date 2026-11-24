// Wspólne dla wszystkich stron: pojawianie się przy przewijaniu i wyspa w stopce.
(function(){
  'use strict';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const statyczna = document.documentElement.classList.contains('static');

  /* ---------- pojawianie się przy przewijaniu (.reveal → .in) ---------- */
  const items = document.querySelectorAll('.reveal');
  if(statyczna || still || !('IntersectionObserver' in window)) items.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if(!e.isIntersecting) return;
      const el = e.target, sib = [...el.parentElement.children].filter(x => x.classList.contains('reveal'));
      el.style.transitionDelay = Math.min(sib.indexOf(el), 5) * 80 + 'ms';
      el.classList.add('in'); io.unobserve(el);
    }), {rootMargin: '0px 0px -10% 0px'});
    items.forEach(el => io.observe(el));
  }

  /* ---------- wyspa w stopce: te same komunikaty, które pokazuje prawdziwa wyspa na pulpicie ---------- */
  const isl = document.getElementById('dlIsland');
  if(isl){
    const box = isl.closest('.dl-island');
    const msgs = [
      ['Lider pracuje · runda 1', false], ['Zlecam teksty Pióru', false], ['Lupa sprawdza na telefonie', false],
      ['Sprawdzenie nie przeszło · poprawiam', false], ['Runda 2 · poprawiam układ', false], ['Cel osiągnięty · 2 rundy', true]
    ];
    let k = 0, on = false;
    new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(box);
    setInterval(() => {
      if(!on || still) return;
      k = (k + 1) % msgs.length;
      isl.classList.add('swap');
      setTimeout(() => { isl.textContent = msgs[k][0]; box.classList.toggle('done', msgs[k][1]); isl.classList.remove('swap'); }, 250);
    }, 2200);
  }
})();
