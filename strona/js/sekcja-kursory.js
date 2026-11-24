/* Sekcja z kursorami. Gdy scena wjedzie w ekran, kursor „Ty” klika „Zbuduj stronę”.
   Kursory agentów chwytają zadania z listy czubkiem strzałki, niosą je i wpasowują dokładnie
   w miejsce na stronie, gdzie zadanie zamienia się w gotowy fragment. Lupa na końcu odhacza.
   W tle cały czas krąży rój małych kursorów. Przy reduced motion od razu widać gotową stronę. */
(function(){
  'use strict';
  const st = document.getElementById('kuStage'); if(!st) return;
  const layer = st.querySelector('.ku-cursors'), sw = st.querySelector('.ku-swarm');
  const go = document.getElementById('kuGo'), replay = document.getElementById('kuReplay'), count = document.getElementById('kuCount');
  const tasks = [...st.querySelectorAll('.ku-task')], slotOf = k => st.querySelector(`.ku-slot[data-s="${k}"]`);
  const A = Object.fromEntries((window.LUMO_AGENCI || []).map(a => [a.name, a]));
  const face = (n, px) => (window.lumoFace && A[n]) ? window.lumoFace(Object.assign({}, A[n], {id: 'ku' + n + Math.random()}), px) : '';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]statycznie\b/.test(location.search);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const visible = el => el && el.offsetParent !== null && getComputedStyle(el).display !== 'none';
  let run = 0, done = 0, total = 9;

  const ARROW = c => `<svg viewBox="0 0 24 24"><path d="M4 2.5l15.5 9.2-6.6 1.6-3.3 6.2z" fill="${c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  function box(el){ const s = st.getBoundingClientRect(), r = el.getBoundingClientRect(); return {x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height}; }
  function cursor(name, color, me){
    const el = document.createElement('div'); el.className = 'kc' + (me ? ' me' : '');
    el.innerHTML = ARROW(me ? '#111' : color) + `<div class="kc-lb" style="${me ? '' : 'background:' + color}">${me ? '' : '<span>' + face(name, 18) + '</span>'}${name}</div>`;
    layer.appendChild(el); return el;
  }
  function put(el, x, y, ms){ el.style.setProperty('--d', (ms || 0) + 'ms'); el.style.transform = `translate(${x}px,${y}px)`; }
  const guard = id => { if(id !== run) throw 0; };
  async function tap(c){ c.classList.remove('click'); void c.offsetWidth; c.classList.add('click'); await wait(240); }
  function setCount(){ count.textContent = done + ' z ' + total; }

  async function job(id, who, keys, delay){
    const a = A[who] || {color: '#2f62e8'}, c = cursor(who, a.color), W = st.clientWidth, H = st.clientHeight;
    put(c, delay % 2 ? W + 30 : -30, H * (.25 + (delay % 5) * .12), 0);
    await wait(delay); guard(id);
    for(const k of keys){
      const t = tasks.find(e => e.dataset.t === k), s = slotOf(k);
      if(!visible(t) || !visible(s)) continue;
      // chwyt: czubek kursora ląduje na zadaniu
      const tb = box(t), gx = tb.x + tb.w * .58, gy = tb.y + tb.h * .5;
      put(c, gx, gy, 850); await wait(850); guard(id); await tap(c);
      const d = document.createElement('div'); d.className = 'kd'; d.innerHTML = t.innerHTML;
      d.style.width = tb.w + 'px'; d.style.height = tb.h + 'px'; put(d, tb.x, tb.y, 0); layer.appendChild(d);
      t.classList.add('held');
      const ox = gx - tb.x, oy = gy - tb.y;
      // przeniesienie: zadanie jedzie razem z kursorem, środek nad środkiem miejsca
      const sb = box(s), cx = sb.x + sb.w / 2, cy = sb.y + sb.h / 2;
      s.classList.add('hot');
      const dx = cx - tb.w / 2, dy = cy - tb.h / 2, ms = 1050;
      put(d, dx, dy, ms); put(c, dx + ox, dy + oy, ms); await wait(ms); guard(id); await tap(c);
      // upuszczenie: zadanie rozciąga się dokładnie na miejsce i zamienia w fragment strony
      d.classList.add('fit'); d.style.width = sb.w + 'px'; d.style.height = sb.h + 'px'; d.style.borderRadius = getComputedStyle(s).borderRadius; put(d, sb.x, sb.y, 450);
      await wait(420); guard(id);
      s.classList.remove('hot'); s.classList.add('on'); d.style.opacity = 0; setTimeout(() => d.remove(), 320);
      t.classList.remove('held'); t.classList.add('done'); done++; setCount();
      await wait(200);
    }
    put(c, delay % 2 ? W + 40 : -40, H * .85, 900); await wait(900); c.remove();
  }

  function reset(){
    layer.innerHTML = ''; done = 0; st.classList.remove('open', 'done');
    tasks.forEach(t => { t.classList.remove('done', 'held'); t.style.display = visible(slotOf(t.dataset.t)) ? '' : 'none'; });
    st.querySelectorAll('.ku-slot').forEach(s => { s.classList.remove('on', 'hot'); s.querySelector('.ck')?.remove(); });
    total = tasks.filter(t => t.style.display !== 'none').length; setCount();
  }
  async function play(){
    const id = ++run; crew(false); reset();
    try{
      const me = cursor('Ty', '#fff', true), gb = box(go);
      put(me, st.clientWidth * .8, st.clientHeight + 30, 0); await wait(350); guard(id);
      put(me, gb.x + gb.w * .62, gb.y + gb.h * .55, 1100); await wait(1100); guard(id); await tap(me);
      go.classList.add('press'); await wait(160); go.classList.remove('press');
      st.classList.add('open'); crew(true);
      put(me, st.clientWidth * .9, st.clientHeight + 40, 800); setTimeout(() => me.remove(), 820);
      await Promise.all([
        job(id, 'Kreska', ['nav', 'cards'], 0),
        job(id, 'Pióro', ['head', 'review'], 250),
        job(id, 'Paleta', ['img', 'work'], 500),
        job(id, 'Radar', ['stats', 'foot'], 750),
        job(id, 'Lider', ['news'], 1500)
      ]);
      guard(id);
      const lupa = cursor('Lupa', (A.Lupa || {}).color || '#24289b');
      put(lupa, -30, st.clientHeight * .35, 0); await wait(50);
      for(const s of st.querySelectorAll('.ku-slot.on')){
        const b = box(s); put(lupa, b.x + b.w - 6, b.y + 6, 480); await wait(480); guard(id); await tap(lupa);
        const ck = document.createElement('i'); ck.className = 'ck'; s.appendChild(ck); requestAnimationFrame(() => ck.classList.add('on'));
      }
      put(lupa, st.clientWidth + 40, st.clientHeight * .8, 900); setTimeout(() => lupa.remove(), 920);
      st.classList.add('done'); crew(false);
    }catch(e){ /* przerwane przez ponowne odtworzenie */ }
  }
  function finish(){
    run++; reset(); st.classList.add('open', 'done');
    tasks.forEach(t => t.classList.add('done')); done = total; setCount();
    st.querySelectorAll('.ku-slot').forEach(s => { s.classList.add('on'); const ck = document.createElement('i'); ck.className = 'ck on'; s.appendChild(ck); });
  }

  /* rój małych kursorów: każdy co chwilę wybiera nowe miejsce i płynnie tam jedzie */
  const SN = ['Lider','Pióro','Kreska','Lupa','Radar','Paleta','Kod','Test','Mapa','Tłumacz','Szkic','Piksel','Notka','Rytm','Tabela','Ikona','Zegar','Słowo','Kolor','Siatka','Linia','Font','Cień','Ramka'];
  const SC = ['#5b8cff','#2fb8c9','#9b7cf0','#e0a96d','#e07a8f','#3a6bfc','#c58cf0','#46c2a0','#d9b37a','#6b7cff','#e58f6b','#8aa0ff'];
  const many = innerWidth < 760 ? 10 : 24, swarm = [];
  for(let i = 0; i < many; i++){
    const el = document.createElement('div'), c = SC[i % SC.length]; el.className = 'ks';
    el.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 2.5l15.5 9.2-6.6 1.6-3.3 6.2z" fill="${c}" stroke="rgba(255,255,255,.85)" stroke-width="1.4" stroke-linejoin="round"/></svg><b style="background:${c}">${SN[i % SN.length]}</b>`;
    sw.appendChild(el); swarm.push({el, c});
  }
  /* każdy mały kursor ma robotę: jedzie do części strony i albo szkicuje w pustym miejscu, albo zaznacza i klika w gotowym */
  let live = false, busy = false;
  const fx = st.querySelector('.ku-swarm'), slotsAll = [...st.querySelectorAll('.ku-slot')];
  async function worker(s, i){
    s.el.style.setProperty('--d', '0ms');
    s.el.style.transform = `translate(${Math.random() * st.clientWidth}px,${st.clientHeight + 30}px)`;
    await wait(80 + i * 90);
    while(busy){
      const pool = slotsAll.filter(visible); if(!pool.length) break;
      const sl = pool[Math.floor(Math.random() * pool.length)], b = box(sl);
      const x = b.x + 10 + Math.random() * Math.max(10, b.w - 60), y = b.y + 8 + Math.random() * Math.max(6, b.h - 22);
      const d = 700 + Math.random() * 900;
      s.el.style.setProperty('--d', d + 'ms'); s.el.style.transform = `translate(${x}px,${y}px)`;
      await wait(d); if(!busy) break;
      s.el.classList.remove('tap'); void s.el.offsetWidth; s.el.classList.add('tap');
      if(!sl.classList.contains('on')){
        // szkic: szara linia rysowana w pustym miejscu, znika gdy agent wstawi gotowy fragment
        const r = sl.getBoundingClientRect(), sk = document.createElement('i'); sk.className = 'ks-sk';
        const lx = x - (r.left - st.getBoundingClientRect().left), ly = y - (r.top - st.getBoundingClientRect().top);
        sk.style.left = Math.max(4, lx) + 'px'; sk.style.top = Math.max(4, ly + 6) + 'px'; sk.style.width = Math.min(r.width - lx - 6, 30 + Math.random() * 90) + 'px';
        sl.appendChild(sk);
      } else if(Math.random() < .6){
        const sel = document.createElement('i'); sel.className = 'ks-sel';
        sel.style.left = x + 'px'; sel.style.top = (y - 2) + 'px'; sel.style.width = (30 + Math.random() * 70) + 'px'; sel.style.height = '14px';
        fx.appendChild(sel); setTimeout(() => sel.remove(), 950);
      } else {
        const rp = document.createElement('i'); rp.className = 'ks-rip'; rp.style.left = x + 'px'; rp.style.top = y + 'px'; rp.style.setProperty('--c', s.c);
        fx.appendChild(rp); setTimeout(() => rp.remove(), 650);
      }
      await wait(250 + Math.random() * 500);
    }
  }
  function crew(on){
    if(on === busy) return; busy = on;
    if(on) swarm.forEach((s, i) => worker(s, i));
    else st.querySelectorAll('.ks-sk').forEach(e => e.remove());
  }
  go.addEventListener('click', play);
  replay.addEventListener('click', play);
  if(calm || !('IntersectionObserver' in window)){
    finish();
    return;
  }
  reset();
  new IntersectionObserver((es, io) => { if(es.some(e => e.isIntersecting)){ io.disconnect(); play(); } }, {threshold: .5}).observe(st);
})();
