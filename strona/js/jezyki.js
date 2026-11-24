// Języki strony: polski (oryginał) oraz angielski, hiszpański i rosyjski ze słowników strona/i18n/{kod}.json.
// Podmienia teksty i atrybuty, także te wstawiane później przez skrypty (MutationObserver). Wybór zapamiętuje.
(function(){
  'use strict';
  const KEY = 'lumobot-strona-jezyk', CODES = ['pl', 'en', 'es', 'ru'];
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'data-goal', 'data-type'];
  const textOrig = new WeakMap(), attrOrig = new WeakMap(), cache = {};
  const titleOrig = document.title;
  let cur = 'pl', dict = null, busy = false;
  const norm = s => s.replace(/\s+/g, ' ').trim();
  const skip = el => !el || el.closest('script,style,svg,code,noscript,[translate="no"]');
  // numer wersji (np. 0.14.3) jest zmienną: tłumaczenie działa też po nowym wydaniu
  const VER = /\b\d+\.\d+\.\d+\b/g, vdicts = new WeakMap();
  function look(k){
    if(!dict || cur === 'pl') return '';
    if(dict[k]) return dict[k];
    const vs = k.match(VER); if(!vs) return '';
    let vd = vdicts.get(dict);
    if(!vd){ vd = {}; for(const [a, b] of Object.entries(dict)) if(VER.test(a)){ VER.lastIndex = 0; vd[a.replace(VER, '{v}')] = b.replace(VER, '{v}'); } VER.lastIndex = 0; vdicts.set(dict, vd); }
    const hit = vd[k.replace(VER, '{v}')]; if(!hit) return '';
    let i = 0; return hit.replace(/\{v\}/g, () => vs[Math.min(i++, vs.length - 1)]);
  }

  function tText(node){
    if(skip(node.parentElement)) return;
    if(!textOrig.has(node)) textOrig.set(node, node.nodeValue);
    const o = textOrig.get(node), k = norm(o);
    if(!k) return;
    const t = look(k);
    const next = t ? o.replace(o.trim(), t) : o;
    if(node.nodeValue !== next) node.nodeValue = next;
  }
  function tAttrs(el){
    if(skip(el)) return;
    let saved = attrOrig.get(el);
    ATTRS.forEach(a => {
      if(!el.hasAttribute(a)) return;
      if(!saved){ saved = {}; attrOrig.set(el, saved); }
      if(!(a in saved)) saved[a] = el.getAttribute(a);
      const t = look(norm(saved[a]));
      const next = t || saved[a];
      if(el.getAttribute(a) !== next) el.setAttribute(a, next);
    });
  }
  function walk(root){
    if(root.nodeType === 3){ tText(root); return; }
    if(root.nodeType !== 1) return;
    tAttrs(root);
    root.querySelectorAll('*').forEach(tAttrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while((n = w.nextNode())) tText(n);
  }

  // teksty, które skrypty zmieniają później (wyspa, scena agentów, pisanie)
  new MutationObserver(list => {
    if(busy) return;
    busy = true;
    list.forEach(m => {
      if(m.type === 'characterData'){
        const n = m.target, v = n.nodeValue, k = norm(v);
        if(look(k)){ textOrig.set(n, v); tText(n); }
        else if(cur === 'pl' || !Object.values(dict || {}).includes(k)) textOrig.set(n, v);
      } else m.addedNodes.forEach(walk);
    });
    busy = false;
  }).observe(document.documentElement, {subtree: true, childList: true, characterData: true});

  async function load(code){
    if(code === 'pl') return null;
    if(!cache[code]){
      try{ const r = await fetch('i18n/' + code + '.json', {cache: 'no-cache'}); cache[code] = r.ok ? await r.json() : {}; }
      catch(e){ cache[code] = {}; }
    }
    return cache[code];
  }

  async function set(code, save){
    if(!CODES.includes(code)) code = 'pl';
    dict = await load(code); cur = code;
    busy = true; walk(document.body); busy = false;
    document.documentElement.lang = code;
    document.documentElement.dataset.jezyk = code;
    document.title = (cur !== 'pl' && dict && dict[norm(titleOrig)]) || titleOrig;
    if(save) try{ localStorage.setItem(KEY, code); }catch(e){}
    // okno aplikacji ma własne tłumaczenie: polski albo angielski
    const ifr = document.getElementById('appiframe');
    if(ifr){
      const want = code === 'pl' ? 'pl' : 'en', src = ifr.getAttribute('src') || 'app/index.html';
      const now = (/[?&]lang=(\w+)/.exec(src) || [, 'pl'])[1];
      if(now !== want) ifr.setAttribute('src', 'app/index.html?lang=' + want);
    }
    document.querySelectorAll('[data-jezyk-kod]').forEach(el => { el.textContent = code.toUpperCase(); });
    document.querySelectorAll('[data-lang]').forEach(el => {
      const on = el.dataset.lang === code;
      el.classList.toggle('is-active', on); el.setAttribute('aria-current', on ? 'true' : 'false');
    });
    dispatchEvent(new CustomEvent('lumo-jezyk', {detail: code}));
  }

  window.lumoJezyk = code => set(code, true);
  // tłumaczenie całego zdania dla skryptów, które same rozbijają tekst (np. na słowa do animacji)
  window.lumoT = s => (look(norm(String(s))) || s);
  let saved = 'pl';
  try{ saved = localStorage.getItem(KEY) || 'pl'; }catch(e){}
  if(saved !== 'pl') set(saved, false);
  document.addEventListener('click', e => {             // każdy element z data-lang przełącza język
    const b = e.target.closest('[data-lang]');
    if(b && CODES.includes(b.dataset.lang)){ e.preventDefault(); set(b.dataset.lang, true); }
  });
})();
