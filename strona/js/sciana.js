/* LumoBot: scena nad stopką "praca do skutku". Wpisuje się zlecenie, nasza szóstka agentów po kolei przejmuje pracę,
   pierwsze sprawdzenie wychodzi na czerwono, agent poprawia, drugie przechodzi na zielono. Potem następne zadanie. */
(function(){
  'use strict';
  const stage = document.querySelector('.dl-wall');
  if(!stage || !window.lumoFace || !window.LUMO_AGENCI) return;
  const D = {
    pl: {task: 'Zlecenie', tasks: ['Zrób stronę dla piekarni z menu i mapą', 'Napisz testy do modułu płatności', 'Przygotuj raport sprzedaży za listopad'],
      steps: ['dzieli pracę', 'buduje', 'pisze teksty', 'sprawdza', 'poprawia błąd', 'sprawdza jeszcze raz'], fail: 'Sprawdzenie: 1 błąd', pass: 'Sprawdzenie przeszło', done: 'Gotowe. Naprawdę.'},
    en: {task: 'Task', tasks: ['Build a bakery website with a menu and a map', 'Write tests for the payments module', 'Prepare the November sales report'],
      steps: ['splits the work', 'builds', 'writes the copy', 'checks', 'fixes the bug', 'checks again'], fail: 'Check: 1 error', pass: 'Check passed', done: 'Done. For real.'},
    es: {task: 'Tarea', tasks: ['Haz una web para una panadería con menú y mapa', 'Escribe tests para el módulo de pagos', 'Prepara el informe de ventas de noviembre'],
      steps: ['reparte el trabajo', 'construye', 'escribe los textos', 'comprueba', 'corrige el error', 'comprueba otra vez'], fail: 'Comprobación: 1 error', pass: 'Comprobación superada', done: 'Hecho. De verdad.'},
    ru: {task: 'Задача', tasks: ['Сделай сайт пекарни с меню и картой', 'Напиши тесты для модуля платежей', 'Подготовь отчёт о продажах за ноябрь'],
      steps: ['делит работу', 'строит', 'пишет тексты', 'проверяет', 'исправляет ошибку', 'проверяет ещё раз'], fail: 'Проверка: 1 ошибка', pass: 'Проверка пройдена', done: 'Готово. По-настоящему.'}
  };
  const L = D[(document.documentElement.lang || 'pl').slice(0, 2)] || D.pl;
  const A = window.LUMO_AGENCI, by = n => A.find(a => a.name === n) || A[0];
  /* kto robi który krok: Lider dzieli, Kreska buduje, Pióro pisze, Lupa sprawdza, Kreska poprawia, Lupa sprawdza znowu */
  const FLOW = ['Lider', 'Kreska', 'Pióro', 'Lupa', 'Kreska', 'Lupa'];
  stage.innerHTML = `<div class="pd-card">
      <div class="pd-head"><span class="pd-lbl">${L.task}</span><span class="pd-task"><b></b><i class="pd-caret"></i></span></div>
      <div class="pd-team">${A.map(a => `<span class="pd-ag" data-n="${a.name}"><span class="pd-face">${window.lumoFace(a, 46)}</span><span class="pd-nm">${a.name}</span></span>`).join('')}</div>
      <div class="pd-log"><span class="pd-dot"></span><span class="pd-say"></span></div>
      <div class="pd-check"><span class="pd-bar"><i></i></span><span class="pd-res"></span></div>
    </div>`;
  const $ = s => stage.querySelector(s), card = $('.pd-card'), typed = $('.pd-task b'), say = $('.pd-say'), bar = $('.pd-bar i'), res = $('.pd-res');
  const ags = () => stage.querySelectorAll('.pd-ag');
  let on = false, run = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function scene(id, k){
    const task = L.tasks[k % L.tasks.length];
    card.className = 'pd-card'; typed.textContent = ''; say.textContent = ''; res.textContent = ''; bar.style.width = '0%';
    ags().forEach(e => e.classList.remove('on', 'was'));
    for(let i = 1; i <= task.length; i++){ if(id !== run) return; typed.textContent = task.slice(0, i); await wait(34); }
    await wait(450);
    for(let s = 0; s < FLOW.length; s++){
      if(id !== run) return;
      stage.querySelectorAll('.pd-ag.on').forEach(e => { e.classList.remove('on'); e.classList.add('was'); });
      const el = stage.querySelector(`.pd-ag[data-n="${FLOW[s]}"]`); if(el) el.classList.add('on');
      say.textContent = `${FLOW[s]} ${L.steps[s]}`; card.style.setProperty('--ag', by(FLOW[s]).color);
      if(s === 3 || s === 5){                                   // sprawdzanie: pasek jedzie, potem wynik
        card.classList.add('checking'); bar.style.width = '0%'; await wait(60); bar.style.width = s === 3 ? '72%' : '100%'; await wait(1300);
        if(id !== run) return; card.classList.remove('checking');
        if(s === 3){ card.classList.add('fail'); res.textContent = L.fail; await wait(1300); card.classList.remove('fail'); res.textContent = ''; }
        else { card.classList.add('pass'); res.textContent = L.pass; say.textContent = L.done; ags().forEach(e => { e.classList.remove('on'); e.classList.add('was'); }); await wait(2800); }
      } else await wait(1050);
    }
  }
  async function loop(){ const id = ++run; let k = 0; while(id === run){ await scene(id, k++); await wait(500); } }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ typed.textContent = L.tasks[0]; card.classList.add('pass'); res.textContent = L.pass; say.textContent = L.done; bar.style.width = '100%'; return; }
  if('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting && !on){ on = true; loop(); } else if(!e.isIntersecting && on){ on = false; run++; } })).observe(stage);
  else loop();
})();
