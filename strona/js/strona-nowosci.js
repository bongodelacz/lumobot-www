// Co nowego: podświetla bieżącą wersję w lewej liście, szuka w zmianach i filtruje po rodzaju.
(function(){
  'use strict';
  const links = [...document.querySelectorAll('.cl-link')], vers = [...document.querySelectorAll('.cl-ver')];
  if(!vers.length) return;
  const byId = new Map(links.map(a => [a.dataset.v, a]));
  if(links[0]) links[0].classList.add('is-on');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if(!e.isIntersecting) return;
    links.forEach(a => a.classList.remove('is-on'));
    const a = byId.get(e.target.id); if(a) a.classList.add('is-on');
  }), {rootMargin: '-30% 0px -60% 0px'});
  vers.forEach(v => spy.observe(v));
  const show = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); show.unobserve(e.target); } }), {rootMargin: '0px 0px -8% 0px'});
  vers.forEach(v => show.observe(v));

  const input = document.getElementById('clSearch'), empty = document.getElementById('clEmpty');
  const filters = [...document.querySelectorAll('.cl-f')];
  let f = 'all';
  const orig = new WeakMap();
  function run(){
    const q = (input.value || '').trim().toLowerCase();
    let any = false;
    vers.forEach(v => {
      let shown = 0;
      v.querySelectorAll('.cl-cat').forEach(cat => {
        let catShown = 0;
        cat.querySelectorAll('.cl-item').forEach(li => {
          const span = li.querySelector('.cl-copy') || li.lastElementChild;
          if(!orig.has(span)) orig.set(span, span.textContent);
          const text = orig.get(span), ok = (f === 'all' || li.dataset.r === f) && (!q || text.toLowerCase().includes(q));
          li.classList.toggle('is-hidden', !ok);
          if(q && ok){ const i = text.toLowerCase().indexOf(q); span.innerHTML = ''; span.append(text.slice(0, i)); const m = document.createElement('mark'); m.textContent = text.slice(i, i + q.length); span.append(m, text.slice(i + q.length)); }
          else if(span.firstElementChild) span.textContent = text;
          if(ok){ shown++; catShown++; }
        });
        cat.classList.toggle('is-hidden', !catShown);
        const cnt = cat.querySelector('.cl-cat-count');
        if(cnt && catShown) cnt.textContent = String(catShown);
      });
      v.classList.toggle('is-hidden', !shown);
      const a = byId.get(v.id); if(a) a.classList.toggle('is-hidden', !shown);
      if(shown) any = true;
    });
    document.querySelectorAll('.cl-group').forEach(g => { g.hidden = !g.querySelector('.cl-link:not(.is-hidden)'); });
    empty.hidden = any;
  }
  input.addEventListener('input', run);
  filters.forEach(b => b.addEventListener('click', () => { f = b.dataset.f; filters.forEach(x => x.classList.toggle('is-on', x === b)); run(); }));
})();
