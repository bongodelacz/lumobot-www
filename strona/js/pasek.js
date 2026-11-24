(function(){
  const nav = document.getElementById('siteNav');
  if(!nav) return;
  const track = nav.querySelector('.site-nav-track');
  const pill = nav.querySelector('.site-nav-pill');
  const surface = nav.querySelector('.site-nav-surface');
  const items = Array.from(nav.querySelectorAll('.site-nav-item'));
  const triggers = items.map(li => li.querySelector('.site-nav-trigger'));
  const PAGES = new Set(triggers.map(tr => ((tr.getAttribute('href') || '').split('#')[0].split('/').filter(Boolean).pop() || '').replace(/\.html$/, '').toLowerCase()).filter(Boolean));
  const panels = items.map(li => li.querySelector('.site-nav-panel'));

  /* nazwa strony bez .html i końcowego /: działa dla cennik.html i dla /cennik/ */
  const slug = v => {
    const parts = (v || '').split('#')[0].split('?')[0].split('/').filter(Boolean);
    let t = (parts.pop() || '').toLowerCase();
    if(t === 'index.html' || t === 'index') t = (parts.pop() || '').toLowerCase();   /* .../cennik/index.html -> cennik */
    t = t.replace(/\.html$/, '');
    return PAGES.has(t) ? t : '';                                                  /* strona główna i obce katalogi (np. strona/ przy file://) -> '' */
  };
  const file = slug(location.pathname);
  let activeTrigger = null;
  triggers.forEach(tr => {
    const href = slug(tr.getAttribute('href'));
    if(href && href === file){
      tr.setAttribute('aria-current', 'page');
      activeTrigger = tr;
    }
  });

  function zoomOf(el){ const w = el.offsetWidth; const r = el.getBoundingClientRect().width; return w && r ? r / w : 1; }
  function movePill(el, instant){
    if(!pill || !track) return;
    if(!el){
      pill.removeAttribute('data-shown');
      return;
    }
    const trRect = track.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const k = zoomOf(track);                                    /* powiększenie strony: wartości CSS w px układu */
    const nx = (elRect.left - trRect.left) / k - 4, nw = elRect.width / k;
    const setPill = (x, w) => { nav.style.setProperty('--site-nav-pill-x', x + 'px'); nav.style.setProperty('--site-nav-pill-width', w + 'px'); };
    if(instant) pill.setAttribute('data-instant', ''); else pill.removeAttribute('data-instant');
    setPill(nx, nw);
    pill.setAttribute('data-shown', '');
    if(instant) requestAnimationFrame(() => pill.removeAttribute('data-instant'));
  }

  if(activeTrigger) movePill(activeTrigger, true);
  /* po wczytaniu krojów pisma i zmianie okna zakładki mają inną szerokość: ustaw podświetlenie jeszcze raz */
  const rePill = () => { if(openIdx === -1 && activeTrigger) movePill(activeTrigger, true); };
  addEventListener('load', rePill); addEventListener('resize', rePill);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(rePill);

  let openIdx = -1;
  let closeTimer = null;

  function openPanel(idx){
    clearTimeout(closeTimer);
    const panel = panels[idx];
    const trigger = triggers[idx];
    if(!panel){
      closeAll();
      movePill(trigger, false);
      return;
    }
    const prevIdx = openIdx;
    if(prevIdx === idx) return;

    const firstOpen = prevIdx === -1;
    openIdx = idx;
    nav.setAttribute('data-state', 'open');
    movePill(trigger, false);

    triggers.forEach((t, i) => t.setAttribute('aria-expanded', i === idx ? 'true' : 'false'));
    panels.forEach((p, i) => {
      if(!p) return;
      if(i === idx){
        p.removeAttribute('inert');
        p.setAttribute('data-state', 'open');
        p.setAttribute('data-motion', firstOpen ? 'enter' : (i > prevIdx ? 'from-end' : 'from-start'));
      } else if(i === prevIdx){
        p.setAttribute('inert', '');
        p.setAttribute('data-state', 'closed');
        p.setAttribute('data-motion', idx > prevIdx ? 'to-start' : 'to-end');
      } else {
        p.setAttribute('inert', '');
        p.setAttribute('data-state', 'closed');
        p.removeAttribute('data-motion');
      }
    });

    const box = panel.querySelector('.site-panel');
    if(box && surface){
      const kz = zoomOf(nav);
      const nr = nav.getBoundingClientRect(), tr = trigger.getBoundingClientRect();
      const navRect = {left: nr.left / kz}, trRect = {left: tr.left / kz, width: tr.width / kz};
      const w = box.offsetWidth || 700;
      const h = box.offsetHeight || 220;
      let x = (window.innerWidth / kz - w) / 2 - navRect.left;
      const minX = 12 - navRect.left;
      const maxX = window.innerWidth / kz - w - 12 - navRect.left;
      x = Math.max(minX, Math.min(maxX, x));
      if(firstOpen) surface.setAttribute('data-instant', '');
      else surface.removeAttribute('data-instant');
      nav.style.setProperty('--site-nav-surface-x', Math.round(x) + 'px');
      nav.style.setProperty('--site-nav-surface-width', w + 'px');
      nav.style.setProperty('--site-nav-surface-height', h + 'px');
      const caretX = Math.round(trRect.left - navRect.left - x + trRect.width / 2);
      nav.style.setProperty('--site-nav-surface-origin', caretX + 'px');
      nav.style.setProperty('--site-nav-caret-x', caretX + 'px');
      if(firstOpen) requestAnimationFrame(() => surface.removeAttribute('data-instant'));
    }

    if(surface) surface.setAttribute('data-sheen', surface.getAttribute('data-sheen') === 'a' ? 'b' : 'a');
    if(window.lumoGrain) window.lumoGrain.wake();
  }

  function closeAll(){
    clearTimeout(closeTimer);
    if(openIdx === -1){
      movePill(activeTrigger, false);
      return;
    }
    const prev = panels[openIdx];
    if(prev){
      prev.setAttribute('inert', '');
      prev.setAttribute('data-state', 'closed');
      prev.setAttribute('data-motion', 'exit');
    }
    triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
    openIdx = -1;
    nav.setAttribute('data-state', 'closed');
    movePill(activeTrigger, false);
  }

  function scheduleClose(){
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeAll, 150);
  }

  items.forEach((li, idx) => {
    const tr = triggers[idx];
    const pn = panels[idx];
    tr.addEventListener('pointerenter', () => openPanel(idx));
    tr.addEventListener('focus', () => movePill(tr, false));
    tr.addEventListener('keydown', e => {
      if(e.key === 'ArrowDown' || (e.key === 'Enter' && pn)){
        if(pn && openIdx !== idx){
          e.preventDefault();
          openPanel(idx);
          const firstLink = pn.querySelector('a,button');
          if(firstLink) firstLink.focus();
        }
      } else if(e.key === 'Escape'){
        closeAll();
        tr.focus();
        movePill(activeTrigger, false);
      }
    });
    if(pn){
      pn.addEventListener('pointerenter', () => clearTimeout(closeTimer));
      pn.addEventListener('pointerleave', scheduleClose);
    }
  });

  nav.addEventListener('pointerleave', scheduleClose);
  nav.addEventListener('focusout', e => { if(openIdx === -1 && !nav.contains(e.relatedTarget)) movePill(activeTrigger, false); });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && openIdx !== -1){
      const tr = triggers[openIdx];
      closeAll();
      if(tr) tr.focus();
      movePill(activeTrigger, false);
    }
  });
  document.addEventListener('click', e => {
    if(openIdx !== -1 && !nav.contains(e.target)) closeAll();
  });
  window.addEventListener('scroll', closeAll, {passive: true});

  if(window.lumoGrain){
    const marks = nav.querySelectorAll('[data-grain-pal]');
    marks.forEach((el, i) => {
      const panel = el.closest('.site-nav-panel');
      const isOn = () => panel && panel.getAttribute('data-state') === 'open';
      window.lumoGrain.add(el, isOn, i + 1, el.getAttribute('data-grain-pal'));
    });
  }
})();

(function(){
  const btn = document.getElementById('pkLang');
  const pop = document.getElementById('wyPop');
  if(!btn || !pop) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = pop.hidden;
    pop.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if(!pop.hidden && !pop.contains(e.target) && e.target !== btn){
      pop.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && !pop.hidden){
      pop.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
})();

(function(){
  const header = document.getElementById('pk');
  if(!header) return;
  const onScroll = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive: true});
})();

(function(){
  const btn = document.getElementById('pkBurger');
  const sheet = document.getElementById('pkMobile');
  const closeBtn = document.getElementById('pkMobileClose');
  if(!btn || !sheet) return;
  function setOpen(open){
    btn.setAttribute('aria-expanded', String(open));
    sheet.setAttribute('data-state', open ? 'open' : 'closed');
    if(open){
      sheet.removeAttribute('inert');
      document.documentElement.setAttribute('data-site-sheet-open', '');
    } else {
      sheet.setAttribute('inert', '');
      document.documentElement.removeAttribute('data-site-sheet-open');
    }
  }
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  if(closeBtn) closeBtn.addEventListener('click', () => { setOpen(false); btn.focus(); });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true'){
      setOpen(false);
      btn.focus();
    }
  });
})();
