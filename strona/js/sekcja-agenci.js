/* Interakcja sceny agentów na stronie głównej. */
(function(){
  const root = document.querySelector('.sg[data-sg-root], .sg');
  if(!root) return;

  const scene = root.querySelector('[data-sg-scene]');
  const stage = root.querySelector('[data-sg-face-stage]');
  const copy = root.querySelector('[data-sg-copy]');
  const nameEl = root.querySelector('[data-sg-name]');
  const characterEl = root.querySelector('[data-sg-character]');
  const modelEl = root.querySelector('[data-sg-model]');
  const tasksEl = root.querySelector('[data-sg-tasks]');
  const picks = [...root.querySelectorAll('[data-agent]')];
  if(!scene || !stage || !copy || !nameEl || !characterEl || !modelEl || !tasksEl || !picks.length) return;

  const agents = [
    {name:'Lider', model:'GPT-5.6 Luna', character:'Bierze cel, dzieli go na kroki i pilnuje, żeby zespół nie skończył, dopóki nie przejdzie sprawdzenie.', tasks:['Rozbij cel na kroki.','Przydziel pracę właściwym agentom.','Wyślij poprawki, gdy test nie przejdzie.']},
    {name:'Pióro', model:'GPT-5.6 Luna', character:'Pisze krótko i prostym polskim. Hasło, opis funkcji czy FAQ: zawsze z prawdziwej funkcji LumoBota.', tasks:['Napisz trzy warianty hasła.','Skróć opis funkcji do dwóch zdań.','Odpowiedz w FAQ bez żargonu.']},
    {name:'Kreska', model:'GPT-5.6 Luna', character:'Buduje strony i widoki. Przesuwa piksel, aż stanie tam, gdzie trzeba, także na telefonie.', tasks:['Zbuduj pasek nawigacji.','Popraw widok na telefonie 390 px.','Dopracuj stopkę strony.']},
    {name:'Lupa', model:'Claude Haiku 5.5', character:'Przeklikuje stronę i program jak użytkownik. Gdy coś nie działa, wraca do agenta z poprawką.', tasks:['Przeklikaj całą stronę.','Sprawdź widok na telefonie 390 px.','Zgłoś błąd i sprawdź poprawkę.']},
    {name:'Radar', model:'GPT-5.6 Luna', character:'Szuka w internecie we własnej przeglądarce, osobno od ciebie. Czyta strony i wraca z krótkim wnioskiem.', tasks:['Porównaj ofertę konkurencji.','Sprawdź nowości u producentów.','Zbierz opinie o produkcie.']},
    {name:'Paleta', model:'Gemini · obrazy', character:'Rysuje ikony, logo, tła i ilustracje. Gotowy obraz trafia do folderu obrazy w projekcie.', tasks:['Narysuj logo projektu.','Zrób zestaw ikon do menu.','Przygotuj tło strony.']}
  ];
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let faceMotion = null;
  let copyFrame = 0;
  let sceneVisible = false;

  if('IntersectionObserver' in window){
    new IntersectionObserver(entries => {
      sceneVisible = entries[0].isIntersecting;
    }, {threshold:.3}).observe(scene);
  } else {
    sceneVisible = true;
  }

  let autoTimer = reducedMotion ? null : window.setInterval(() => {
    if(sceneVisible && !document.hidden) setAgent((current + 1) % agents.length);
  }, 4000);

  function stopAuto(){
    if(autoTimer){
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function cancelAnimations(element){
    if(!element || !element.getAnimations) return;
    element.getAnimations({subtree:true}).forEach(animation => animation.cancel());
  }

  function words(element, value){
    element.replaceChildren();
    String(value).split(' ').forEach((word, wordIndex, all) => {
      const span = document.createElement('span');
      span.className = 'sg-word';
      span.style.setProperty('--sg-word-index', wordIndex);
      span.textContent = word + (wordIndex < all.length - 1 ? ' ' : '');
      element.append(span);
    });
  }

  function makeFace(agent){
    const face = document.createElement('span');
    face.dataset.face = agent.name;
    face.dataset.px = '320';
    return face;
  }

  // całe zdania tłumaczy js/jezyki.js (lumoT), zanim zostaną rozbite na słowa do animacji
  const tr = s => (window.lumoT ? window.lumoT(s) : s);
  addEventListener('lumo-jezyk', () => renderCopy(agents[current]));

  function renderCopy(agent){
    cancelAnimations(copy);
    words(nameEl, agent.name);
    words(characterEl, tr(agent.character));
    words(modelEl, agent.model);
    tasksEl.replaceChildren();
    agent.tasks.forEach((task, taskIndex) => {
      const item = document.createElement('li');
      item.style.setProperty('--sg-task-index', taskIndex);
      item.textContent = tr(task);
      tasksEl.append(item);
    });
    copy.classList.remove('is-changing');
    const frame = ++copyFrame;
    requestAnimationFrame(() => {
      if(frame === copyFrame) copy.classList.add('is-changing');
    });
  }

  const faceTiles = {Lider:'a1','Pióro':'a2',Kreska:'a4',Lupa:'a6',Radar:'a5',Paleta:'a3'};
  function renderFace(agent){
    stage.classList.remove('a1','a2','a3','a4','a5','a6');
    stage.classList.add(faceTiles[agent.name] || 'a1');
    const layer = stage.querySelector('[data-sg-face-layer]');
    if(!layer) return;
    if(faceMotion){
      faceMotion.cancel();
      faceMotion = null;
    }
    cancelAnimations(layer);
    const oldFace = layer.querySelector('[data-face]');
    if(oldFace) oldFace.replaceWith(makeFace(agent));
    else layer.append(makeFace(agent));
    if(window.lumoFaces) window.lumoFaces(layer);
    if(reducedMotion || !layer.animate) return;
    faceMotion = layer.animate([
      {opacity:.76, transform:'translateY(12px) scale(.93)'},
      {opacity:1, transform:'translateY(0) scale(1)'}
    ], {duration:430, easing:'cubic-bezier(.34,1.56,.64,1)', fill:'both'});
    faceMotion.onfinish = () => { faceMotion = null; };
  }

  function centerPick(pick){
    const row = pick.parentElement;
    if(!row || row.scrollWidth <= row.clientWidth) return;
    const maxScroll = row.scrollWidth - row.clientWidth;
    const target = pick.offsetLeft - (row.clientWidth - pick.offsetWidth) / 2;
    row.scrollTo({
      left: Math.max(0, Math.min(target, maxScroll)),
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  }

  function setAgent(nextIndex){
    const normalized = (nextIndex + agents.length) % agents.length;
    if(normalized === current && stage.querySelector('[data-face]')) return;
    current = normalized;
    const agent = agents[current];
    picks.forEach(pick => {
      const active = pick.dataset.agent === agent.name;
      pick.classList.toggle('is-active', active);
      pick.setAttribute('aria-pressed', String(active));
      if(active) centerPick(pick);
    });
    renderCopy(agent);
    renderFace(agent);
  }

  picks.forEach((pick) => {
    const pickAgent = () => {
      const i = agents.findIndex(a => a.name === pick.dataset.agent);
      if(i >= 0) setAgent(i);
    };
    pick.addEventListener('mouseenter', () => { stopAuto(); pickAgent(); });
    pick.addEventListener('focus', stopAuto);
    pick.addEventListener('click', () => { stopAuto(); pickAgent(); });
  });
  scene.addEventListener('pointerenter', stopAuto, {once:true});
  scene.addEventListener('focus', stopAuto);
  scene.addEventListener('keydown', event => {
    if(event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stopAuto();
    setAgent(current + (event.key === 'ArrowRight' ? 1 : -1));
  });

  if(window.lumoFaces) window.lumoFaces(root);
  renderCopy(agents[0]);
})();
