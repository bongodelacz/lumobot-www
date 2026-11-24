/* Podstawiony serwer LumoBota dla strony: prawdziwy app.js woła /api/*, a tu odpowiadamy z dane.js.
   Wysłanie celu uruchamia pokazową pracę agenta: kroki, zespół, sprawdzenie w dwóch rundach. Nic nie wychodzi do sieci. */
(function(){
  'use strict';
  const D = window.LUMO_DANE, clone = x => JSON.parse(JSON.stringify(x));
  let AG = clone(D.agents), S = clone(D.super), SETTINGS = clone(D.settings);
  const TH = clone(D.threads), timers = [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const json = (data, status) => new Response(JSON.stringify(data), {status: status || 200, headers: {'Content-Type': 'application/json'}});
  const byName = n => AG.find(a => a.name === n);
  const realFetch = window.fetch.bind(window);

  // okno aplikacji: przyciski okna jak w prawdziwym programie, bez akcji systemowych
  window.pywebview = {api: {win(){}, pick_folder: async () => null, open_url: async u => { try{ window.open(u, '_blank', 'noopener'); }catch(e){} }, open_path(){},
    clip: async () => null, flash(){}, focus(){}, resize(){}, restart(){}}};

  window.fetch = async function(input, init){
    init = init || {};
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const i = url.pathname.indexOf('/api/');
    if(i < 0) return realFetch(input, init);
    const path = url.pathname.slice(i + 5), method = (init.method || 'GET').toUpperCase();
    let body = null;
    if(typeof init.body === 'string'){ try{ body = JSON.parse(init.body); }catch(e){} }
    await sleep(40 + Math.random() * 80);
    try{ return route(method, path, url.searchParams, body); }
    catch(e){ console.warn('mock', path, e); return json({}); }
  };

  function route(m, p, q, b){
    if(p === 'super' && m === 'GET'){ S.beat = Date.now()/1000; return json(S); }
    if(p === 'super' && m === 'POST'){ if(S.running) return json({queued: true}); start(b || {}); return json({ok: true, id: S.id}); }
    if(p === 'super/stop'){ stop(); return json({ok: true}); }
    if(p === 'super/note'){ if(S.running){ S.notes.push({text: (b && b.text) || '', after: S.round}); S.nudge = (b && b.text) || ''; } return json({sent: true}); }
    if(p.startsWith('super/')) return json({ok: true, files: 0});
    if(p === 'agents/thread') return json(TH[q.get('id')] || []);
    if(p === 'agents' && m === 'GET') return json(AG);
    if(p === 'agents') return json({agents: agentsPost(b || {})});
    if(p === 'settings'){ if(m === 'POST' && b) Object.assign(SETTINGS, b); return json(SETTINGS); }
    if(p === 'usage/refresh') return json(D.usage);
    if(p === 'teamfeed') return json(teamFeed());
    if(p === 'board/report') return json({items: [], today: new Date().toISOString().slice(0, 10)});
    if(p === 'board'){ if(m === 'POST' && b) boardPost(b); return json(boardView()); }
    if(p === 'models/check') return json(D.models);
    if(p === 'voice/status') return json(D.voice_status);
    if(p === 'detect') return json({exists: true, label: 'ocena AI'});
    const key = p.split('/')[0];
    if(m === 'GET' && key in D) return json(D[key]);
    return json({ok: true});
  }

  function agentsPost(b){
    if(b.remove){ AG = AG.filter(a => a.id !== b.remove); return AG; }
    if(b.move){ const a = AG.find(x => x.id === b.move); if(a){ AG = AG.filter(x => x !== a); const k = AG.findIndex(x => x.id === b.before); AG.splice(k < 0 ? AG.length : k, 0, a); } return AG; }
    if(b.name || b.id){
      const old = b.id && AG.find(a => a.id === b.id);
      if(old) Object.assign(old, b);
      else { const a = Object.assign({id: 'a' + Date.now(), color: '#3a6bfc', face: 'kropki', shape: 'squircle', model: 'gpt-5.6-luna', effort: '', purpose: '',
        folder: AG[0].folder, project: AG[0].project, ctx: 0, ctx_max: 200000, pack: 'p1', created: Date.now()}, b); AG.push(a); TH[a.id] = []; }
    }
    return AG;
  }

  /* czaty startują puste: nic nie jest zapisane ani u agentów, ani na kanale zespołu */
  const teamFeed = () => ({events: [], running: false, lead: AGID('Lider'), run: ''});

  /* ---------- pokazowa przestrzeń Plan: dwa gotowe ciągi połączonych boxów, jak po wstawieniu wzorów ---------- */
  const AGID = n => (byName(n) || AG[0]).id;
  const box = (id, text, who, x, y, time, after, color) => ({id, text, agent: AGID(who), x, y, w: 304, h: 176, color: color || '', time: time || '', days: time ? [0, 1, 2, 3, 4] : [],
    after: after || '', on: true, verify: null, last: '', state: '', ran: 0, live: false});
  let BOXES = [
    box('m1', 'Przejrzyj moją skrzynkę Gmail i wypisz maile, które wymagają odpowiedzi: od kogo, o co chodzi, co proponujesz odpisać', 'Pióro', 96, 96, '08:00', '', 'blue'),
    box('m2', 'Sprawdź mój Kalendarz Google i wypisz dzisiejsze spotkania z godzinami', 'Lupa', 448, 96, '', 'm1', 'green'),
    box('m3', 'Na podstawie maili i kalendarza napisz mi plan dnia w pięciu punktach, najważniejsze na górze', 'Lider', 800, 96, '', 'm2', 'amber'),
    box('p1', 'Napisz krótki post o nowej wersji LumoBota. Przygotuj wersję na X, LinkedIn i Facebooka, każdą w stylu tej platformy', 'Pióro', 96, 352, '', '', 'violet'),
    box('p2', 'Opublikuj przygotowaną wersję na X', 'Kreska', 448, 352, '', 'p1'),
    box('p3', 'Opublikuj przygotowaną wersję na LinkedIn', 'Kreska', 800, 352, '', 'p2')
  ];
  const boardView = () => ({boxes: clone(BOXES), today: new Date().toISOString().slice(0, 10), weekday: (new Date().getDay() + 6) % 7,
    services: {gmail: 'Gmail', gcal: 'Kalendarz Google'}, templates: [{id: 'morning', name: 'Poranny przegląd', count: 3}, {id: 'publish', name: 'Publikacja w mediach społecznościowych', count: 4}]});
  function boardPost(b){
    if(b.save){ const old = BOXES.find(x => x.id === b.save.id); if(old) Object.assign(old, b.save); else BOXES.push(Object.assign(box('x' + Date.now(), '', AG[0].name, 96, 600), b.save)); }
    if(b.remove) BOXES = BOXES.filter(x => x.id !== b.remove).map(x => x.after === b.remove ? Object.assign(x, {after: ''}) : x);
  }

  /* ---------- pokazowa praca agenta ---------- */
  const short = g => { const t = (g || '').replace(/\s+/g, ' ').trim(); return t.length > 60 ? t.slice(0, 57).replace(/\s\S*$/, '') + '…' : t; };
  const later = (ms, fn) => timers.push(setTimeout(() => { fn(); S.live.n++; }, ms));

  function files(goal){
    if(/stron|html|witryn|landing|sklep|portfolio|zak[lł]ad|menu|formularz|przycisk|sekcj/i.test(goal)) return ['index.html', 'style.css', 'app.js'];
    if(/gr[aęy]|game/i.test(goal)) return ['index.html', 'gra.js', 'style.css'];
    if(/test/i.test(goal)) return ['tests/test_api.py', 'api.py'];
    if(/logo|ikon|grafik|obraz|plakat/i.test(goal)) return ['obrazy/projekt.svg', 'obrazy/projekt.png'];
    return ['wynik.md', 'notatki.md'];
  }

  function step(kind, text, extra){ const s = Object.assign({t: Date.now(), kind, text}, extra || {}); S.live.steps.push(s); return s; }

  function start(b){
    timers.splice(0).forEach(clearTimeout);
    const a = AG.find(x => x.id === b.agent) || AG[0], now = Date.now(), goal = (b.goal || '').trim() || 'Zrób stronę';
    const F = files(goal), helper = byName('Pióro') || AG[1], tester = byName('Lupa') || AG[2];
    const d = new Date(now), pad = n => String(n).padStart(2, '0');
    S = Object.assign({}, S, {
      running: true, id: `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`,
      status: 'Runda 1: agent pracuje.', outcome: null, error: null, started: now, ended: null, round: 1,
      rounds: [{n: 1, t: now, agent: null, check: null, passed: null, seconds: null, cost: 0, turns: null, tokens: null, model: a.model, nudged: false, steps: [], team: []}],
      config: {folder: b.folder || a.project, goal, check: '', rules: '', mode: b.mode || 'full', max_rounds: 30, checkpoints: true, agent: a.id, role: '',
        model: a.model, effort: a.effort || '', how: 'niezależna ocena AI', team: [], files: []},
      branch: null, cost: 0, notes: [], changes: null, diff: [], confirm: null, live: {n: 1, steps: [], say: ''}, team: [], plan: [], asks: [],
      servers: [], undo: 0, undone: false, phase: 'work', talk: null, question: null, shots: [], nudge: null, nudged: false, chat_seen: {}
    });
    const g = short(goal);
    later(500, () => step('think', ''));
    later(1300, () => { S.plan = [{text: 'Przeczytać, co jest w folderze', done: false}, {text: 'Zrobić: ' + g, done: false},
      {text: 'Sprawdzić wynik na telefonie i komputerze', done: false}, {text: 'Pokazać wynik', done: false}]; });
    later(1900, () => { step('find', '*', {full: 'Get-ChildItem -Recurse', out: F.join('\n')}); S.live.say = 'Czytam folder i układam plan.'; });
    later(2800, () => { step('read', F[0]); S.plan[0].done = true; });
    later(3600, () => step('think', ''));
    later(4300, () => { const t = {id: 1, from: a.id, to: helper.id, name: helper.name, q: 'Napisz krótkie, konkretne teksty do zadania: ' + g, a: '', work: true,
      state: 'run', t: Date.now(), began: Date.now(), seconds: null, round: 1, seen: false}; S.team.push(t); step('team', helper.name + ': teksty');
      S.live.say = `Zlecam teksty ${helper.name === 'Pióro' ? 'Pióru' : helper.name}, a sam biorę się za ${F[0]}.`; });
    later(5200, () => step('edit', F[0]));
    later(5900, () => step('read', 'tresci.md', {who: helper.name}));
    later(6600, () => step('edit', F[1] || F[0]));
    later(7300, () => step('edit', 'teksty.md', {who: helper.name}));
    later(8200, () => { const t = S.team[0]; t.state = 'done'; t.seconds = 4; t.a = 'Gotowe. Teksty są w teksty.md: krótko, bez lania wody.'; S.plan[1].done = true; });
    later(8900, () => step('run', 'lumo zrzut ' + F[0] + ' --telefon', {out: 'Zrzut zapisany (390x844). Konsola strony: bez błędów.'}));
    later(9800, () => { S.live.say = 'Pierwsza wersja gotowa. Oddaję do sprawdzenia.'; });
    later(10600, () => endRound(1, a, `Zrobiłem pierwszą wersję: ${g}. Teksty dopisał ${helper.name}.`,
      'Nie przechodzi: na telefonie (390 px) jeden blok wychodzi poza ekran i trzeba przewijać w bok.', false));
    later(12200, () => { S.round = 2; S.status = 'Runda 2: agent pracuje.'; S.phase = 'work'; S.live.steps = []; S.live.say = 'Sprawdzający znalazł usterkę. Poprawiam.';
      S.rounds.push({n: 2, t: Date.now(), agent: null, check: null, passed: null, seconds: null, cost: 0, turns: null, tokens: null, model: a.model, nudged: false, steps: [], team: []}); });
    later(12900, () => step('read', F[1] || F[0]));
    later(13700, () => step('edit', F[1] || F[0]));
    later(14400, () => { S.team.push({id: 2, from: a.id, to: tester.id, name: tester.name, q: 'Przeklikaj wynik na 390 px i 1440 px. Zgłoś każdą usterkę.', a: '',
      work: true, state: 'run', t: Date.now(), began: Date.now(), seconds: null, round: 2, seen: false}); step('team', tester.name + ': przeklikaj wynik'); S.plan[2].done = true; });
    later(15400, () => step('run', 'lumo strona ' + F[0] + ' rozmiar 390x844 zrzut', {who: tester.name, out: 'Wszystkie kroki przeszły. Błędy strony: brak.'}));
    later(16600, () => { const t = S.team[1]; t.state = 'done'; t.seconds = 2; t.a = 'Sprawdziłem telefon i komputer. Usterek brak.'; });
    later(17300, () => endRound(2, a, `Poprawiłem układ na telefonie. ${tester.name} przeklikał całość: bez błędów.`,
      `Przechodzi: zadanie „${g}” jest zrobione i działa na telefonie.`, true));
    later(18800, () => finish(a, F, 'done'));
  }

  function endRound(n, a, said, check, passed){
    const r = S.rounds[n - 1];
    Object.assign(r, {agent: said, steps: S.live.steps.slice(), team: S.team.filter(t => t.round === n), seconds: Math.round((Date.now() - r.t)/1000), tokens: 18000 + n * 7000});
    S.status = `Runda ${n}: sprawdzający ocenia.`; S.phase = 'check';
    timers.push(setTimeout(() => { r.check = check; r.passed = passed; S.live.n++; }, 900));
  }

  function finish(a, F, outcome){
    timers.splice(0).forEach(clearTimeout);
    S.plan.forEach(p => { if(outcome === 'done') p.done = true; });
    Object.assign(S, {running: false, outcome, ended: Date.now(), phase: 'done', status: outcome === 'done' ? 'Cel osiągnięty.' : 'Zatrzymane.',
      diff: outcome === 'done' ? F.map((f, k) => ({path: f, kind: k ? 'edit' : 'new', add: 40 - k * 12, rem: k * 3, cut: 0,
        text: `@@ -0,0 +1,3 @@\n+<!-- ${f}: zmiany agenta ${a.name} -->\n+<p>Pokazowa zmiana w pliku ${f}.</p>\n+<p>W prawdziwym LumoBocie tu widać cały kod.</p>`})) : []});
    S.live = {n: S.live.n + 1, steps: [], say: ''};
    (TH[a.id] = TH[a.id] || []).push(clone(S));
  }

  function stop(){
    if(!S.running) return;
    const a = AG.find(x => x.id === S.config.agent) || AG[0], r = S.rounds[S.rounds.length - 1];
    Object.assign(r, {agent: r.agent || 'Zatrzymane na twoją prośbę. To, co zrobiłem, zostaje w folderze.', steps: S.live.steps.slice(), seconds: Math.round((Date.now() - r.t)/1000)});
    finish(a, [], 'stopped');
  }

  /* ---------- samo pisze: po sygnale ze strony wpisuje cel i wysyła ---------- */
  let typed = false, touched = false, typing = 0;
  addEventListener('pointerdown', () => { touched = true; }, true);
  addEventListener('keydown', () => { touched = true; }, true);
  async function typeAndSend(goal, forced){
    const my = ++typing;
    if(S.running){ if(!forced) return; stop(); await sleep(400); }
    if(typeof window.show === 'function' && document.body.dataset.tab !== 'agent') window.show('agent');
    await sleep(150);
    const ta = document.querySelector('#composer textarea[name=goal]'), send = document.getElementById('sendBtn');
    if(!ta || !send) return;
    ta.value = ''; ta.dispatchEvent(new Event('input', {bubbles: true}));
    ta.focus({preventScroll: true});
    for(const ch of goal){
      if(my !== typing || (!forced && touched)) return;
      ta.value += ch; ta.dispatchEvent(new Event('input', {bubbles: true}));
      await sleep(/[ ,.]/.test(ch) ? 70 : 24 + Math.random() * 36);
    }
    await sleep(450);
    if(my === typing && (forced || !touched)) send.click();
  }
  addEventListener('message', e => {
    if(e.origin !== location.origin || !e.data) return;
    if(e.data.type === 'lumo-auto' && !typed && !touched){ typed = true; typeAndSend(e.data.goal || 'Dodaj do strony kawiarni zakładkę z ciastami i cennikiem na wynos.', false); }
    if(e.data.type === 'lumo-goal' && e.data.goal){ typed = true; typeAndSend(String(e.data.goal).slice(0, 200), true); }
  });
  addEventListener('load', () => { const g = document.getElementById('grips'); if(g) g.remove(); });
})();
