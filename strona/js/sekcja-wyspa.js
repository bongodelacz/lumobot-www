// Sekcja 4: wyspa LumoBota z telefonem w języku wysuwanych paneli paska.
(function(){
  'use strict';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('static');
  /* ---------- wejście panelu kroków (.lw-panel) ---------- */
  const wsPanel = document.getElementById('wsPanel');
  if(wsPanel){
    if(calm) wsPanel.classList.add('is-in');
    else new IntersectionObserver((es, ob) => {
      if(es[0].isIntersecting){ wsPanel.classList.add('is-in'); ob.disconnect(); }
    }, { threshold: .2 }).observe(wsPanel);
  }

  /* ---------- wyspa: zespół przy pracy na żywo ----------
     Czarna wyspa jak w LumoBocie zmienia kształt i pokazuje kolejne etapy pracy.
     Kliknięcie wyspy, kafla albo wiersza na liście przechodzi do wybranego etapu. */
  const wsIsland = document.getElementById('wsIsland');
  if(wsIsland && window.lumoFace){
    const inner = document.getElementById('wsIn'), steps = [...document.querySelectorAll('#wsSteps li')];
    const wsTile = document.getElementById('wsTile');
    const A = n => (window.LUMO_AGENCI || []).find(a => a.name === n) || { name: n, color: '#555', face: 'kropki', shape: 'squircle' };
    const F = (n, s) => lumoFace(A(n), s);
    const dots = '<i class="lw-dots"><b></b><b></b><b></b></i>';
    const row = (n, t, w, d) => `<span class="lw-row">${F(n, 30)}<span class="lw-rt"><b>${n}</b><small>${t}</small></span><span class="lw-bar"><i style="--w:${w};--bd:${d}s"></i></span></span>`;
    const S = [
      { k: 0, w: 230, h: 48, ms: 1700, html: () => `<span class="lw-line">${F('Lider', 26)}<span>Gotowy do pracy</span></span>` },
      { k: 1, w: 380, h: 48, ms: 2300, html: () => `<span class="lw-line">${F('Lider', 26)}<span>Lider dzieli cel na trzy zadania</span>${dots}</span>` },
      { k: 2, w: 420, h: 210, ms: 3800, html: () => `<span class="lw-team"><span class="lw-head"><b>Zespół pracuje</b><small>3 agentów</small></span>${row('Pióro', 'pisze teksty', '92%', 2.6)}${row('Kreska', 'buduje widok', '100%', 3)}${row('Paleta', 'rysuje logo', '78%', 2.2)}</span>` },
      { k: 3, w: 430, h: 96, ms: 2800, html: () => `<span class="lw-verdict"><span class="lw-ico lw-no">✕</span><span class="lw-rt"><b>Sprawdzający: odrzucone</b><small>Menu wychodzi poza ekran telefonu</small></span><em>Runda 1</em></span>` },
      { k: 4, w: 360, h: 48, ms: 2300, html: () => `<span class="lw-line">${F('Kreska', 26)}<span>Kreska poprawia menu</span>${dots}</span>` },
      { k: 5, w: 430, h: 96, ms: 3600, html: () => `<span class="lw-verdict"><span class="lw-ico lw-ok">✓</span><span class="lw-rt"><b>Sprawdzenie przeszło</b><small>Cel osiągnięty w 2 rundach</small></span><span class="lw-faces">${F('Lider', 22)}${F('Pióro', 22)}${F('Kreska', 22)}${F('Paleta', 22)}</span></span>` }
    ];
    let i = -1, timer = 0, on = false;
    const fit = w => Math.min(w, wsIsland.parentElement.clientWidth - 24);
    const show = n => {
      i = ((n % S.length) + S.length) % S.length;
      const s = S[i];
      inner.classList.add('out');
      setTimeout(() => {
        inner.innerHTML = s.html();
        wsIsland.style.setProperty('--w', fit(s.w) + 'px'); wsIsland.style.setProperty('--h', s.h + 'px');
        wsIsland.dataset.k = s.k; wsIsland.closest('.lw-stage').dataset.k = s.k;
        steps.forEach(li => { const k = +li.dataset.k; li.classList.toggle('on', k === s.k); li.classList.toggle('past', k < s.k && s.k !== 0); });
        requestAnimationFrame(() => inner.classList.remove('out'));
      }, 180);
      clearTimeout(timer);
      if(on && !calm) timer = setTimeout(() => show(i + 1), s.ms);
    };
    wsIsland.addEventListener('click', () => show(i + 1));
    if(wsTile) wsTile.addEventListener('click', () => show(i + 1));
    steps.forEach(li => {
      const go = () => {
        const idx = S.findIndex(s => s.k === +li.dataset.k);
        if(idx >= 0) show(idx);
      };
      li.addEventListener('click', go);
      li.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); }
      });
    });
    new IntersectionObserver(es => {
      on = es[0].isIntersecting; clearTimeout(timer);
      if(on){ if(i < 0) show(0); else if(!calm) timer = setTimeout(() => show(i + 1), 1200); }
    }, { threshold: .35 }).observe(wsIsland.closest('.lw-stage'));
    addEventListener('resize', () => { if(i >= 0) wsIsland.style.setProperty('--w', fit(S[i].w) + 'px'); });
    if(calm) show(5);
  }
})();
