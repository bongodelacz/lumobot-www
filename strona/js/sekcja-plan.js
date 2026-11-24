/* Plan na stronie: buzie agentów i praca przechodząca po kolei przez połączone zadania. */
(function(){
  'use strict';
  const sec = document.getElementById('plan'); if(!sec) return;
  if(window.lumoFace) sec.querySelectorAll('.pl-face').forEach(el => { el.innerHTML = window.lumoFace({id: 'pl' + el.dataset.n, name: el.dataset.n, color: el.dataset.c, shape: el.dataset.s, face: el.dataset.e}, 26); });
  const nodes = [...sec.querySelectorAll('.pl-node')], arrows = [...sec.querySelectorAll('.pl-arr')];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const set = step => { nodes.forEach((n, i) => { n.classList.toggle('ok', i < step); n.classList.toggle('run', i === step); }); arrows.forEach((a, i) => a.classList.toggle('ok', i < step)); };
  if(still){ set(nodes.length); return; }
  let step = -1, timer = 0, seen = false;
  const tick = () => { step = step >= nodes.length + 1 ? -1 : step + 1; set(step); timer = setTimeout(tick, step === nodes.length ? 2600 : step === -1 ? 700 : 1700); };
  new IntersectionObserver(es => { const v = es.some(e => e.isIntersecting); if(v && !seen){ seen = true; tick(); } else if(!v && seen){ seen = false; clearTimeout(timer); } }, {threshold: .3}).observe(sec);
})();
