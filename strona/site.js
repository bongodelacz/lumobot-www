// LumoBot: strona główna. Skaluje prawdziwe okno aplikacji, podświetla menu, pokazuje sekcje przy przewijaniu.
(function(){
  // okno aplikacji ma stały rozmiar 1344x880, jak prawdziwe; tu tylko je pomniejszamy do szerokości strony
  const frame = document.getElementById('appframe');
  const fit = () => frame.style.setProperty('--s', (frame.clientWidth / 1344).toFixed(4));
  new ResizeObserver(fit).observe(frame); fit();

  // pasek u góry dostaje tło po zjechaniu w dół
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // podświetlenie bieżącej sekcji w menu
  const links = [...document.querySelectorAll('.links a')];
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if(!e.isIntersecting) return;
    links.forEach(a => a.classList.remove('on'));
    const a = byId.get(e.target.id); if(a) a.classList.add('on');
  }), {rootMargin:'-45% 0px -50% 0px'});
  byId.forEach((a, id) => { const s = document.getElementById(id); if(s) spy.observe(s); });

  // łagodne pojawianie się kart
  // ?statycznie wyłącza efekt, żeby zrzut całej strony pokazał wszystkie karty
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]statycznie/.test(location.search)) return;
  const items = document.querySelectorAll('.tile,.steps li,.agent-card,.whyitem,.tablewrap,.faq details,.appshot');
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('seen'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'});
  items.forEach((el, i) => { el.classList.add('rv-in'); el.style.transitionDelay = (i % 3) * 60 + 'ms'; io.observe(el); });
})();
