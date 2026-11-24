const $ = id => document.getElementById(id);
const escRaw = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nodash = s => String(s).replace(/\s*\u2014\s*/g, ', ').replace(/(\d)\s*\u2013\s*(\d)/g, '$1-$2').replace(/\s*\u2013\s*/g, ', ');
const esc = s => escRaw(nodash(s));
const loc = () => LANG === 'en' ? 'en-GB' : 'pl-PL';
const clock = ms => new Date(ms).toLocaleTimeString(loc(), {hour:'2-digit', minute:'2-digit'});
const dayOrClock = ms => new Date(ms).toDateString() === new Date().toDateString() ? clock(ms) : new Date(ms).toLocaleDateString(loc(), {day:'2-digit', month:'2-digit'});
const span = s => s == null ? '' : s < 90 ? `${Math.round(s)} s` : s < 5400 ? `${Math.round(s/60)} min` : `${(s/3600).toLocaleString(loc(), {maximumFractionDigits:1})} h`;
const big = n => n >= 1e6 ? (n/1e6).toLocaleString(loc(), {maximumFractionDigits:1}) + ' ' + tr('mln') : n >= 1e3 ? Math.round(n/1e3) + ' ' + tr('tys.') : String(n || 0);
const base = p => String(p || '').replace(/[\\/]+$/, '').split(/[\\/]/).pop();
const OUT = {done:'Cel osiągnięty', already:'Sprawdzenie przechodziło już na starcie', limit:'Limit rund wyczerpany', stopped:'Zatrzymane', error:'Błąd', agent_error:'Agent niedostępny', ask_user:'Potrzebne doprecyzowanie', stuck:'Agent utknął'};
const good = o => o === 'done' || o === 'already', failed = o => o === 'error' || o === 'agent_error' || o === 'limit' || o === 'stuck';
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

async function api(path, body){
  const r = await fetch(path, body ? {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)} : undefined);
  const d = await r.json().catch(() => ({}));
  if(!r.ok) throw new Error(tr(d.detail || 'Błąd serwera'));
  return d;
}
let toastTimer = 0;
function toast(msg, err){ const t = $('toast'); t.textContent = tr(msg); t.className = 'show' + (err ? ' err' : ''); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.className = err ? 'err' : '', 3200); }

function md(t){   // odpowiedzi agenta przychodzą w markdownie: akapity, listy, nagłówki, kod
  const blocks = [];
  let h = esc(t).replace(/```[^\n]*\n([\s\S]*?)```/g, (m, c) => { blocks.push(c.replace(/\n$/, '')); return `\n\n\u0001${blocks.length-1}\u0001\n\n`; });
  const keep = [], hold = x => { keep.push(x); return `\u0002${keep.length - 1}\u0002`; }, pth = p => p.replace(/^&lt;|&gt;$/g, '').replace(/^file:\/*(?=[A-Za-z]:)/i, '').replace(/^\/+(?=[A-Za-z]:)/, '');
  const pics = [], isPic = p => /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(p), pic = (p, html) => { const i = keep.length; if(isPic(p)) pics.push([i, p]); return hold(html); };      // obrazy, o których pisze agent, pokazujemy jako miniatury
  const FEXT = 'html?|css|scss|js|mjs|ts|tsx|jsx|json|py|pyw|md|txt|png|jpe?g|gif|webp|svg|ico|pdf|csv|xml|ya?ml|toml|ini|ps1|sh|bat|cmd|sql|java|cs|go|rs|php|c|cpp|h|zip|log|env|lock';
  h = h.replace(/\[([^\]\n]+)\]\(((?:&lt;)?(?:file:\/{2,3})?\/?[A-Za-z]:[\\/][^)\n]*?(?:&gt;)?)\)/g, (m, label, p) => pic(pth(p), `<a class="lnk path" data-path="${pth(p)}" title="${pth(p)}">${label.replace(/`/g, '')}</a>`))      // odnośnik do pliku na dysku
       .replace(new RegExp('`((?:[A-Za-z]:[\\\\/]|\\.{1,2}[\\\\/])?[^`\\n*?|<>]*?\\.(?:' + FEXT + '))`', 'gi'), (m, p) => /[A-Za-z]/.test(p) && (/[\\/]/.test(p) || /^[\w.\- ]+$/.test(p)) ? pic(p, `<a class="lnk path" data-path="${p}" title="${p}"><code>${p}</code></a>`) : m)      // ścieżka zapisana jak kod
       .replace(/(^|[\s(„])([A-Za-z]:[\\/][^\s<>*?|"`\u0002]*[^\s<>*?|"`.,;:)\u0002])/g, (m, pre, p) => { const seg = p.split(/[\\/]/); return pre + pic(p, `<a class="lnk path" data-path="${p}" title="${p}">${p.length > 46 && seg.length > 3 ? '…/' + seg.slice(-2).join('/') : p}</a>`); });      // goła pełna ścieżka: długą skracamy do końcówki
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
       .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a class="lnk" href="$2">$1</a>')                      // odnośnik z opisem
       .replace(/(^|[\s(>])(https?:\/\/[^\s<)]*[^\s<).,;:])/g, (m, pre, url) => `${pre}<a class="lnk" href="${url}">${url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a>`);   // goły adres
  const picAt = new Map(pics), seen = new Set(), gal = [];
  h = h.replace(/^[ \t]*(?:[-*]|\d+\.)?[ \t]*\u0002(\d+)\u0002[ \t]*$/gm, (m, i) => picAt.has(+i) ? '' : m);      // wiersz, który jest tylko odnośnikiem do obrazu, zastępuje miniatura
  for(const [, p] of pics){ const k = p.toLowerCase().replace(/\\/g, '/'); if(!seen.has(k) && gal.length < 40){ seen.add(k); gal.push(p); } }
  const unesc = x => x.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"), base = mdBase();
  const gallery = gal.length ? `<div class="shots left pics">${gal.map(p => { const u = '/api/imgfile?p=' + encodeURIComponent(unesc(p)) + '&b=' + encodeURIComponent(base), n = p.split(/[\\/]/).pop(); return `<button type="button" class="shot pic" data-zoom="${u}" data-name="${n}" title="${n}"><img src="${u}" alt="${n}" loading="lazy" onerror="this.closest('button').remove()"><span>${n}</span></button>`; }).join('')}</div>` : '';
  h = h.replace(/\u0002(\d+)\u0002/g, (m, i) => keep[+i]);
  return h.split(/\n{2,}/).map(part => { part = part.trim(); if(!part) return '';
    const code = part.match(/^\u0001(\d+)\u0001$/); if(code) return `<pre>${blocks[code[1]]}</pre>`;
    const lines = part.split('\n'); let out = '', list = [], text = [];
    const flush = () => { if(text.length){ out += `<p>${text.join('<br>')}</p>`; text = []; } if(list.length){ out += `<ul>${list.map(x => `<li>${x}</li>`).join('')}</ul>`; list = []; } };
    for(const ln of lines){ const li = ln.match(/^\s*(?:[-*]|\d+\.) +(.+)$/), hd = ln.match(/^#{1,4} +(.+)$/);
      if(li){ if(text.length) flush(); list.push(li[1]); } else if(hd){ flush(); out += `<h4>${hd[1]}</h4>`; } else { if(list.length) flush(); text.push(ln); } }
    flush(); return out; }).join('') + gallery;
}
const PUSHHINT = {ntfy:'Nazwa tematu, na przykład lumo-twoje-haslo-8421. Ten sam temat zasubskrybuj w aplikacji ntfy na telefonie.', discord:'Adres webhooka z ustawień kanału na Discordzie: Integracje, Webhooki, Kopiuj adres.', slack:'Adres webhooka przychodzącego ze Slacka.', telegram:'Token bota od BotFather i numer czatu, w postaci: token|numer_czatu.'};
function pushNote(){ const k = SF.push_kind.value; $('pushRow').hidden = !k; $('pushRow2').hidden = !k; $('pushHint').textContent = k ? tr(PUSHHINT[k]) : ''; }
document.getElementById('setForm').elements.push_kind.addEventListener('change', pushNote);
$('pushTest').addEventListener('click', async () => { const b = $('pushTest'); b.disabled = true; try{ await api('/api/settings', {...(await api('/api/settings')), push_kind:SF.push_kind.value, push_target:SF.push_target.value}); await api('/api/push/test', {}); toast('Wiadomość próbna wysłana. Sprawdź telefon albo kanał.'); }catch(err){ toast(err.message, true); } b.disabled = false; });
function mdBase(){ try{ if(tab === 'team') return (agentOf(TL || cur) || {}).folder || ''; return S && S.config && S.config.agent === cur ? S.config.folder || '' : (agentOf(cur) || {}).folder || ''; }catch(e){ return ''; } }

/* ---------- twarze agentów: ten sam znak co w logo, w różnych kolorach i z różnymi oczami ---------- */
const COLORS = ['#3a6bfc','#0ea5e9','#06b6d4','#12a594','#30a46c','#84cc16','#e8b730','#f59e0b','#f08c2e','#e5484d','#f43f5e','#d6409f','#a855f7','#7c5cff','#8b6f47','#64748b','#1f2937','#0b1445'];
const SHAPES = ['squircle','kolo','kwadrat','szesciokat','duch','kot','mis','chmura','kwiat','wybuch','osmiornica','odlamek','pigula','trojkat','romb'], MAKERSHAPES = ['squircle','kolo','kwadrat','szesciokat','duch','kot','mis','chmura','kwiat','pigula','trojkat','romb'], LOWEYES = ['kot','mis','chmura','trojkat'], HIGHEYES = ['osmiornica'];
const FACES = ['gwiazdki','kropki','kreski','usmiech','mrugniecie','duze','spiace','kwadraty','plusy','serca'];
function eye(kind, x, c){
  const star = `<path transform="rotate(18 ${x} 25)" d="M${x},17.8 Q${x+1.5},23.5 ${x+7.2},25 Q${x+1.5},26.5 ${x},32.2 Q${x-1.5},26.5 ${x-7.2},25 Q${x-1.5},23.5 ${x},17.8Z" fill="${c}" stroke="${c}" stroke-width="1.7" stroke-linejoin="round"/>`;
  if(kind === 'spiace') return `<path d="M${x-4.2} 23.4q4.2 6.4 8.4 0" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`;
  if(kind === 'kwadraty') return `<rect x="${x-3.7}" y="21.3" width="7.4" height="7.4" rx="2.3" fill="${c}"/>`;
  if(kind === 'plusy') return `<path d="M${x} 20.2v9.6M${x-4.8} 25h9.6" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`;
  if(kind === 'serca') return `<path d="M${x} 30 C${x-7.4} 25.2 ${x-4.8} 19.4 ${x} 22.9 C${x+4.8} 19.4 ${x+7.4} 25.2 ${x} 30Z" fill="${c}"/>`;
  if(kind === 'kropki') return `<circle cx="${x}" cy="25" r="3.5" fill="${c}"/>`;
  if(kind === 'kreski') return `<rect x="${x-1.8}" y="20" width="3.6" height="10" rx="1.8" fill="${c}"/>`;
  if(kind === 'usmiech') return `<path d="M${x-4.2} 26.5q4.2 -6.4 8.4 0" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`;
  if(kind === 'duze') return `<circle cx="${x}" cy="25" r="5.2" fill="${c}"/><circle cx="${x+1.7}" cy="23.2" r="1.6" fill="#fff"/>`;
  if(kind === 'mrugniecie' && x > 24) return `<path d="M${x-4} 25.5h8" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>`;
  return star;
}
function body(shape, c){
  if(shape === 'kolo') return `<circle cx="24" cy="24" r="22" fill="${c}"/>`;
  if(shape === 'kwadrat') return `<rect x="2.500" y="2.500" width="43" height="43" rx="7.500" fill="${c}"/>`;
  if(shape === 'szesciokat') return `<path d="M24 4.200 41.600 14.100v19.800L24 43.800 6.400 33.900V14.100z" fill="${c}" stroke="${c}" stroke-width="4.400" stroke-linejoin="round"/>`;
  if(shape === 'duch') return `<path d="M3 24a21 21 0 0 1 42 0v19q-3.500 4-7 0t-7 0-7 0-7 0-7 0-7 0z" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`;
  if(shape === 'kot') return `<path d="M6 21V5.500l11.500 6.200zM42 21V5.500l-11.500 6.200z" fill="${c}" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><rect x="2" y="9" width="44" height="37" rx="14.500" fill="${c}"/>`;
  return `<rect x="2" y="2" width="44" height="44" rx="15.500" fill="${c}"/>`;
}
/* ---------- buzie agentów z moheru: gotowe warstwy z renderera 3D, kolor agenta nakładany na żywo ---------- */
function face(a, size, cls){ if(a.photo) return `<span class="face photo${cls ? ' ' + cls : ''}" style="width:${size}px;height:${size}px;background-image:url(/api/avatar/${a.photo})" aria-hidden="true"></span>`;
  const sh = SHAPES.includes(a.shape) ? a.shape : 'squircle', ek = FACES.includes(a.face) ? a.face : 'gwiazdki';
  const seed = [...String(a.id || a.name || a.color)].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 997, 7);      // każda buzia mruga w innym rytmie
  const hv = n => (Math.imul(seed * 31 + n * 7919, 2654435761) >>> 0) >>> 8;      // niezależne losowania na gest, najechanie i pracę
  return `<span class="face g${hv(1) % 6} v${hv(2) % 5} w${hv(3) % 3}${cls ? ' ' + cls : ''}" style="width:${size}px;height:${size}px;--c:${a.color};--m:url(${(window.LUMO_MASKS && LUMO_MASKS[sh]) || 'faces/' + sh + '-mul.png'});--d:-${((seed % 60) / 10).toFixed(1)}s;--bd:${(5.2 + (seed % 17) / 10).toFixed(1)}s;--gp:${8 + seed % 7}s" aria-hidden="true">`
    + `<i class="fsh" style="background-image:url(faces/${sh}-shadow.png)"></i><i class="fup"><i class="fbody"><i class="fcol"></i><i class="fmul"></i><i class="fadd" style="background-image:url(faces/${sh}-add.png)"></i></i>`
    + `<i class="eyes e-${ek}${LOWEYES.includes(sh) ? ' low' : HIGHEYES.includes(sh) ? ' high' : ''}" style="background-image:url(faces/eyes-${ek}.png)"></i></i></span>`; }

const F = $('composer').elements, SF = $('setForm').elements, MF = $('makerForm').elements, opened = new Set(), TH = {};
const ASKSEEN = new Set();
let UNREAD = {}; try{ localStorage.removeItem('lumobot-unread'); }catch(e){}
const unreadTotal = () => Object.values(UNREAD).reduce((n, v) => n + v, 0);
let badgeSent = -1;
function unreadSave(){ try{ localStorage.setItem('lumobot-unread', JSON.stringify(UNREAD)); }catch(e){} const n = unreadTotal(); if(n !== badgeSent){ badgeSent = n; const nat = window.pywebview && window.pywebview.api; if(nat && nat.set_badge) nat.set_badge(n).catch(() => {}); document.title = (n ? `(${n}) ` : '') + 'LumoBot'; } }
function unreadBump(id){ return; if(!id) return; const viewing = tab === 'agent' && cur === id && !document.hidden; if(viewing) return; UNREAD[id] = (UNREAD[id] || 0) + 1; unreadSave(); listDrawn = ''; if(typeof renderAgents === 'function' && S) renderAgents(); }
function unreadClear(id){ if(id && UNREAD[id]){ delete UNREAD[id]; unreadSave(); listDrawn = ''; renderAgents(); } }
let drawnLite = '', S = null, AG = [], MODELS = {models:[], providers:[]}, TPL = [], USE = null, cur = '', tab = 'agent', timer = 0, filled = false, drawn = '', listDrawn = '', wasRunning = false, D = null;
const trd = t => { const m = /^(.*?): (\d+)$/.exec(String(t || '')); return m ? `${tr(m[1])}: ${m[2]}` : tr(t); };      // opis z liczbą na końcu, np. "Zainstalowany, modeli: 116"
let PACKS = {items:[], current:'main', everyone:[]};
const agentOf = id => AG.find(a => a.id === id) || PACKS.everyone.find(a => a.id === id) || AG[0];      // agent z innej paczki też ma swoją twarz w raportach i skrzynce
const redraw = () => { drawn = ''; listDrawn = ''; if(S){ renderAgents(); render(); } };

/* ---------- lista rozwijana modeli ---------- */
const OKI = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3.500 8.400l3 3 6-6.600" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"/></svg>', NOI = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round"/></svg>', PAU = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M5.500 4v8M10.500 4v8" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round"/></svg>';
const CHECK = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3.5 8.4l3 3 6-6.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const GL = {claude:'C', codex:'G', grok:'X'};
const AI = {mistral:['#FA520F', 'M3.428 3.4h3.429v3.428h3.429v3.429h-.002 3.431V6.828h3.427V3.4h3.43v13.714H24v3.429H13.714v-3.428h-3.428v-3.429h-3.43v3.428h3.43v3.429H0v-3.429h3.428V3.4zm10.286 13.715h3.428v-3.429h-3.427v3.429z'], openrouter:['currentColor', 'M18.654 3.87a5.087 5.087 0 110 10.174L23.7 19.09c.64.641.187 1.737-.72 1.737H8.48a8.479 8.479 0 010-16.958h10.175zM8.479 7.26a5.087 5.087 0 100 10.176 5.087 5.087 0 000-10.175z'], ollama:['currentColor', 'M7.905 1.09c.216.085.411.225.588.41.295.306.544.744.734 1.263.191.522.315 1.1.362 1.68a5.054 5.054 0 012.049-.636l.051-.004c.87-.07 1.73.087 2.48.474.101.053.2.11.297.17.05-.569.172-1.134.36-1.644.19-.52.439-.957.733-1.264a1.67 1.67 0 01.589-.41c.257-.1.53-.118.796-.042.401.114.745.368 1.016.737.248.337.434.769.561 1.287.23.934.27 2.163.115 3.645l.053.04.026.019c.757.576 1.284 1.397 1.563 2.35.435 1.487.216 3.155-.534 4.088l-.018.021.002.003c.417.762.67 1.567.724 2.4l.002.03c.064 1.065-.2 2.137-.814 3.19l-.007.01.01.024c.472 1.157.62 2.322.438 3.486l-.006.039a.651.651 0 01-.747.536.648.648 0 01-.54-.742c.167-1.033.01-2.069-.48-3.123a.643.643 0 01.04-.617l.004-.006c.604-.924.854-1.83.8-2.72-.046-.779-.325-1.544-.8-2.273a.644.644 0 01.18-.886l.009-.006c.243-.159.467-.565.58-1.12a4.229 4.229 0 00-.095-1.974c-.205-.7-.58-1.284-1.105-1.683-.595-.454-1.383-.673-2.38-.61a.653.653 0 01-.632-.371c-.314-.665-.772-1.141-1.343-1.436a3.288 3.288 0 00-1.772-.332c-1.245.099-2.343.801-2.67 1.686a.652.652 0 01-.61.425c-1.067.002-1.893.252-2.497.703-.522.39-.878.935-1.066 1.588a4.07 4.07 0 00-.068 1.886c.112.558.331 1.02.582 1.269l.008.007c.212.207.257.53.109.785-.36.622-.629 1.549-.673 2.44-.05 1.018.186 1.902.719 2.536l.016.019a.643.643 0 01.095.69c-.576 1.236-.753 2.252-.562 3.052a.652.652 0 01-1.269.298c-.243-1.018-.078-2.184.473-3.498l.014-.035-.008-.012a4.339 4.339 0 01-.598-1.309l-.005-.019a5.764 5.764 0 01-.177-1.785c.044-.91.278-1.842.622-2.59l.012-.026-.002-.002c-.293-.418-.51-.953-.63-1.545l-.005-.024a5.352 5.352 0 01.093-2.49c.262-.915.777-1.701 1.536-2.269.06-.045.123-.09.186-.132-.159-1.493-.119-2.73.112-3.67.127-.518.314-.95.562-1.287.27-.368.614-.622 1.015-.737.266-.076.54-.059.797.042zm4.116 9.09c.936 0 1.8.313 2.446.855.63.527 1.005 1.235 1.005 1.94 0 .888-.406 1.58-1.133 2.022-.62.375-1.451.557-2.403.557-1.009 0-1.871-.259-2.493-.734-.617-.47-.963-1.13-.963-1.845 0-.707.398-1.417 1.056-1.946.668-.537 1.55-.849 2.485-.849zm0 .896a3.07 3.07 0 00-1.916.65c-.461.37-.722.835-.722 1.25 0 .428.21.829.61 1.134.455.347 1.124.548 1.943.548.799 0 1.473-.147 1.932-.426.463-.28.7-.686.7-1.257 0-.423-.246-.89-.683-1.256-.484-.405-1.14-.643-1.864-.643zm.662 1.21l.004.004c.12.151.095.37-.056.49l-.292.23v.446a.375.375 0 01-.376.373.375.375 0 01-.376-.373v-.46l-.271-.218a.347.347 0 01-.052-.49.353.353 0 01.494-.051l.215.172.22-.174a.353.353 0 01.49.051zm-5.04-1.919c.478 0 .867.39.867.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zm8.706 0c.48 0 .868.39.868.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zM7.44 2.3l-.003.002a.659.659 0 00-.285.238l-.005.006c-.138.189-.258.467-.348.832-.17.692-.216 1.631-.124 2.782.43-.128.899-.208 1.404-.237l.01-.001.019-.034c.046-.082.095-.161.148-.239.123-.771.022-1.692-.253-2.444-.134-.364-.297-.65-.453-.813a.628.628 0 00-.107-.09L7.44 2.3zm9.174.04l-.002.001a.628.628 0 00-.107.09c-.156.163-.32.45-.453.814-.29.794-.387 1.776-.23 2.572l.058.097.008.014h.03a5.184 5.184 0 011.466.212c.086-1.124.038-2.043-.128-2.722-.09-.365-.21-.643-.349-.832l-.004-.006a.659.659 0 00-.285-.239h-.004z'], lmstudio:['currentColor', 'M2.84 2a1.273 1.273 0 100 2.547h14.107a1.273 1.273 0 100-2.547H2.84zM7.935 5.33a1.273 1.273 0 000 2.548H22.04a1.274 1.274 0 000-2.547H7.935zM3.624 9.935c0-.704.57-1.274 1.274-1.274h14.106a1.274 1.274 0 010 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM1.273 12.188a1.273 1.273 0 100 2.547H15.38a1.274 1.274 0 000-2.547H1.273zM3.624 16.792c0-.704.57-1.274 1.274-1.274h14.106a1.273 1.273 0 110 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM13.029 18.849a1.273 1.273 0 100 2.547h9.698a1.273 1.273 0 100-2.547h-9.698z M2.84 2a1.273 1.273 0 100 2.547h10.287a1.274 1.274 0 000-2.547H2.84zM7.935 5.33a1.273 1.273 0 000 2.548H18.22a1.274 1.274 0 000-2.547H7.935zM3.624 9.935c0-.704.57-1.274 1.274-1.274h10.286a1.273 1.273 0 010 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM1.273 12.188a1.273 1.273 0 100 2.547H11.56a1.274 1.274 0 000-2.547H1.273zM3.624 16.792c0-.704.57-1.274 1.274-1.274h10.286a1.273 1.273 0 110 2.547H4.898c-.703 0-1.274-.57-1.274-1.273zM13.029 18.849a1.273 1.273 0 100 2.547h5.78a1.273 1.273 0 100-2.547h-5.78z'], claude:['#D97757', 'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z'], openai:['currentColor', 'M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z'], grok:['currentColor', 'M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815'], gemini:['#4285F4', 'M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z'], opencode:['currentColor', 'M16 6H8v12h8V6zm4 16H4V2h16v20z'], cursor:['currentColor', 'M22.106 5.68L12.5.135a.998.998 0 00-.998 0L1.893 5.68a.84.84 0 00-.419.726v11.186c0 .3.16.577.42.727l9.607 5.547a.999.999 0 00.998 0l9.608-5.547a.84.84 0 00.42-.727V6.407a.84.84 0 00-.42-.726zm-.603 1.176L12.228 22.92c-.063.108-.228.064-.228-.061V12.34a.59.59 0 00-.295-.51l-9.11-5.26c-.107-.062-.063-.228.062-.228h18.55c.264 0 .428.286.296.514z'], deepseek:['#4D6BFE', 'M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z'], kimi:['currentColor', 'M21.846 0a1.923 1.923 0 110 3.846H20.15a.226.226 0 01-.227-.226V1.923C19.923.861 20.784 0 21.846 0z M11.065 11.199l7.257-7.2c.137-.136.06-.41-.116-.41H14.3a.164.164 0 00-.117.051l-7.82 7.756c-.122.12-.302.013-.302-.179V3.82c0-.127-.083-.23-.185-.23H3.186c-.103 0-.186.103-.186.23V19.77c0 .128.083.23.186.23h2.69c.103 0 .186-.102.186-.23v-3.25c0-.069.025-.135.069-.178l2.424-2.406a.158.158 0 01.205-.023l6.484 4.772a7.677 7.677 0 003.453 1.283c.108.012.2-.095.2-.23v-3.06c0-.117-.07-.212-.164-.227a5.028 5.028 0 01-2.027-.807l-5.613-4.064c-.117-.078-.132-.279-.028-.381z'], custom:['currentColor', 'M9 2v5H7.500a3.500 3.500 0 00-3.500 3.500V13a5 5 0 004 4.900V22h2v-4.100h4V22h2v-4.100a5 5 0 004-4.900v-2.500A3.500 3.500 0 0016.500 7H15V2h-2v5h-2V2H9z'], antigravity:['#3186FF', 'M21.751 22.607c1.34 1.005 3.35.335 1.508-1.508C17.73 15.74 18.904 1 12.037 1 5.17 1 6.342 15.74.815 21.1c-2.01 2.009.167 2.511 1.507 1.506 5.192-3.517 4.857-9.714 9.715-9.714 4.857 0 4.522 6.197 9.714 9.715z']};
const aiIcon = (id, n) => { const a = AI[id] || AI.custom; return `<svg class="aiico" viewBox="0 0 24 24" width="${n}" height="${n}" aria-hidden="true"><path fill="${a[0]}" fill-rule="evenodd" d="${a[1]}"/></svg>`; };
const CLAUDE = n => aiIcon('claude', n);
const providerOf = a => { const m = (a && a.model) || ''; return m.startsWith('agy:') ? 'antigravity' : m.startsWith('cur:') ? 'cursor' : m.startsWith('oc:') ? 'opencode' : m.startsWith('api:') ? m.split(':')[1] : m && !m.startsWith('claude') ? 'openai' : 'claude'; };      // AI wynika z wybranego modelu
const pname = id => (MODELS.providers.find(p => p.id === id) || {name:id}).name;
const withModels = () => MODELS.providers.map(p => p.id).filter(id => MODELS.models.some(m => m.provider === id));
/* propozycje na pustym czacie: inne dla agenta od obrazów, inne dla zwykłego, i za każdym wejściem inny zestaw */
const IDEAS_DES = [['Strona główna', 'Zaprojektuj i zbuduj stronę główną produktu. Zapytaj mnie jednym zdaniem o produkt i o stronę, która mi się podoba, jeśli tego nie podałem.'], ['Odśwież wygląd', 'Obejrzyj obecny wygląd tego projektu, pokaż mi trzy kierunki zmian na zrzutach i wdroż ten, który wybiorę.'], ['Sekcja hero', 'Zaprojektuj górną sekcję strony: jeden mocny nagłówek, jedno zdanie i jeden przycisk. Pokaż trzy kierunki.'], ['Jak ten wzorzec', 'Wkleję zrzut albo adres strony, która mi się podoba. Zaprojektuj nasz widok w tym duchu, bez kopiowania jeden do jednego.'], ['Widok telefonu', 'Sprawdź ten projekt na telefonie, popraw wszystko, co się rozjeżdża, i pokaż zrzuty przed i po.']];
const IDEAS_IMG = [['Ikona aplikacji', 'Zrób ikonę aplikacji w płaskim, nowoczesnym stylu, 512x512. Najpierw zapytaj mnie jednym zdaniem, czego dotyczy aplikacja, jeśli tego nie podałem.'], ['Logo firmy', 'Zaprojektuj proste, czytelne logo z nazwą firmy i znakiem graficznym. Zrób wersję na jasne i na ciemne tło.'], ['Zestaw ikon', 'Zrób spójny zestaw sześciu ikon do menu aplikacji: start, szukaj, ustawienia, profil, powiadomienia, pomoc. Jeden styl, jedna grubość linii.'], ['Baner na stronę', 'Zrób baner na górę strony internetowej, 1600x600, z miejscem na nagłówek po lewej stronie.'], ['Tło pulpitu', 'Zrób abstrakcyjne tło pulpitu 1920x1080 z miękkimi gradientami w chłodnych kolorach.'], ['Awatar', 'Zrób okrągły awatar postaci w przyjaznym, rysunkowym stylu, 512x512, na przezroczystym tle.'], ['Ilustracja do artykułu', 'Zrób ilustrację do artykułu na blogu, 1200x675. Temat podam w następnej wiadomości.'], ['Naklejka', 'Zrób wesołą naklejkę z białą obwódką i przezroczystym tłem, 512x512.'], ['Favicon', 'Zrób favicon strony: prosty znak czytelny w 32x32, oraz większą wersję 512x512.'], ['Okładka', 'Zaprojektuj okładkę w formacie kwadratowym 1400x1400 z tytułem i prostą grafiką.'], ['Plakat', 'Zaprojektuj minimalistyczny plakat w pionie, 1080x1500, z dużym tytułem i jednym mocnym motywem graficznym.'], ['Maskotka', 'Wymyśl i narysuj maskotkę marki: prosta postać z wyrazistą miną, na przezroczystym tle, 800x800.']];
const IDEAS_GEN = [['Zbuduj stronę', 'Zbuduj prostą, ładną stronę internetową z jedną podstroną. Temat podam w następnej wiadomości, a jeśli nie podam, wybierz portfolio.'], ['Znajdź w internecie', 'Wyszukaj w swojej przeglądarce aktualne informacje na temat, który podam, i streść je z podaniem źródeł.'], ['Przejrzyj kod', 'Przejrzyj kod w tym projekcie i wypisz najważniejsze problemy, od najpoważniejszego. Niczego jeszcze nie zmieniaj.'], ['Napisz testy', 'Dopisz testy do najważniejszych części tego projektu i uruchom je.'], ['Uporządkuj projekt', 'Uporządkuj strukturę plików w tym projekcie i popraw nazwy, nie zmieniając działania.'], ['Napisz dokumentację', 'Napisz plik README: do czego służy projekt, jak go uruchomić i jak go używać.'], ['Przyspiesz działanie', 'Znajdź najwolniejsze miejsca w tym projekcie, zmierz je i przyspiesz. Pokaż czasy przed i po.'], ['Zrób mały program', 'Napisz mały program z oknem. Co ma robić, podam w następnej wiadomości, a jeśli nie podam, zrób notatnik.'], ['Wyjaśnij projekt', 'Przeczytaj ten projekt i wyjaśnij mi prostym językiem, jak jest zbudowany i od czego zacząć.'], ['Sprawdź bezpieczeństwo', 'Sprawdź ten projekt pod kątem typowych błędów bezpieczeństwa i wypisz, co trzeba poprawić.'], ['Zrób grę', 'Zrób prostą grę działającą w przeglądarce. Gatunek podam w następnej wiadomości, a jeśli nie podam, zrób węża.'], ['Popraw wygląd', 'Popraw wygląd tego, co już jest w projekcie: odstępy, kolory, czcionki. Obejrzyj wynik na zrzucie.']];
const IDEA = {seed:Math.floor(Math.random() * 1000), who:'', list:[]};
function quickIdeas(a){ if(IDEA.who !== a.id){ IDEA.who = a.id; IDEA.seed++; }
  const pool = a.kind === 'design' ? IDEAS_DES.map(x => ({name:x[0], goal:x[1]})) : a.kind === 'image' ? IDEAS_IMG.map(x => ({name:x[0], goal:x[1]})) : TPL.map(t => ({name:t.name, tpl:t.id})).concat(IDEAS_GEN.map(x => ({name:x[0], goal:x[1]})));
  let s = IDEA.seed * 7919 + 13; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648, mix = pool.map(x => [rnd(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  IDEA.list = mix.slice(0, 5); return IDEA.list; }
/* znaczek typu agenta: po nim od razu widać, kto jest od obrazów */
const kindTag = a => a && a.kind === 'design' ? `<em class="ktag des" title="${tr('Projektant')}"><svg viewBox="0 0 16 16"><path d="M3 13l.8-3.200 6.900-6.900a1.400 1.400 0 0 1 2 0l.4.4a1.400 1.400 0 0 1 0 2l-6.900 6.900z"/><path d="M9.600 4l2.400 2.400"/></svg>${tr('Projekt')}</em>` : a && a.kind === 'image' ? `<em class="ktag" title="${tr('Agent od obrazów')}"><svg viewBox="0 0 16 16"><rect x="2.500" y="3" width="11" height="10" rx="2.200"/><circle cx="6" cy="6.600" r="1.100"/><path d="M3 11.300l3.100-2.900 2.300 2 1.800-1.600 2.800 2.500"/></svg>${tr('Obrazy')}</em>` : '';
const leadId = () => AG.length > 1 ? (TL || (AG[0] || {}).id) : '';
const CROWN = '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path fill="currentColor" d="M2.2 5.1 5 7.5 8 3.2l3 4.300 2.800-2.400-.9 6.200a.8.8 0 0 1-.8.7H3.900a.8.8 0 0 1-.8-.7z"/></svg>';
const faceAI = (a, size, live) => `<span class="facewrap">${face(a, size, live ? 'busy' : '')}${a.id === leadId() ? `<i class="crn" title="${tr('Lider zespołu')}">${CROWN}</i>` : ''}<i class="ai">${aiIcon(providerOf(a), size > 34 ? 12 : 11)}</i></span>`;
const imageOnly = () => MODELS.image_providers || [];
function imageModelFor(d){ const ok = imageOnly(), m = MODELS.models.find(x => x.id === d.model); if(m && ok.includes(m.provider)) return true; const best = MODELS.models.find(x => ok.includes(x.provider) && x.available && /flash-high/.test(x.id)) || MODELS.models.find(x => ok.includes(x.provider) && x.available); if(!best) return false; d.model = best.id; return true; }
function dropdown(host, value, onPick){
  const m = MODELS.models.find(x => x.id === value) || MODELS.models.find(x => x.id === ((S && S.defaults && S.defaults.model) || 'gpt-5.6-luna')) || {id:'gpt-5.6-luna', name:'GPT-5.6 Luna', provider:'openai'}, shown = MODELS.models.filter(x => x.available || (x.provider === 'claude' && !MODELS.checked));
  const group = pid => { const list = shown.filter(x => x.provider === pid); if(!list.length) return '';
    return `<div class="ddlabel">${aiIcon(pid, 14)}${esc(pname(pid))}</div>` + list.map(x => `<button type="button" class="dditem${x.id === value ? ' on' : ''}" data-m="${x.id}">${aiIcon(pid, 18)}<span><b>${tr(x.name)}</b></span>${CHECK}</button>`).join(''); };
  host.innerHTML = `<button type="button" class="ddbtn">${aiIcon(m.provider || 'claude', 18)}<span>${esc(pname(m.provider || 'claude'))} <em>${tr(m.name)}</em></span><svg class="cv" viewBox="0 0 12 12" width="11" height="11"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`
    + `<div class="ddmenu">${withModels().filter(pid => !(host.id === 'makerModel' && D && D.kind === 'image') || imageOnly().includes(pid)).map(group).filter(Boolean).join('<div class="ddsep"></div>')}</div>`;
  host.onclick = e => { const it = e.target.closest('.dditem'); if(it && !it.disabled){ host.classList.remove('open'); onPick(it.dataset.m); return; }
    if(e.target.closest('.ddbtn')){ const was = host.classList.contains('open'); document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open')); host.classList.toggle('open', !was); } };
}
document.addEventListener('click', e => { if(!e.target.closest('.dd')) document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open')); });

/* ---------- pasek boczny: agenci i użycie ---------- */
const PINICO = '<svg class="pinico" viewBox="0 0 16 16" width="11" height="11"><path d="M9.500 2.500l4 4-2.200.900-2 2 .200 2.900-1.700-1.700L4 14.400l-.400-.400 3.800-3.800-1.700-1.700 2.900.200 2-2z" fill="currentColor"/></svg>';
const lastOf = id => (S.history || []).find(h => (h.agent || AG[0].id) === id);
function sortedAgents(){ const how = localStorage.getItem('lumobot-sort') || '', rows = AG.slice();
  if(how === 'name') rows.sort((a, b) => a.name.localeCompare(b.name)); if(how === 'recent') rows.sort((a, b) => ((lastOf(b.id) || {}).started || 0) - ((lastOf(a.id) || {}).started || 0));
  return rows.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)); }
/* ---------- TEAM: wspólny widok rozmów agentów ---------- */
let TEAM = {events: [], running: false, lead: null}, TEAMSIG = '', TL = '', TFOLDER = '';
try{ TFOLDER = localStorage.getItem('lumobot-teamfolder') || ''; }catch(e){}
async function pickTeamFolder(){ const papi = window.pywebview && window.pywebview.api; let p = null;
  if(papi && papi.pick_folder) p = await papi.pick_folder(TFOLDER || ((agentOf(TL) || {}).project) || ''); else p = window.prompt(tr('Ścieżka folderu projektu'), TFOLDER);
  if(p){ TFOLDER = String(p).trim(); try{ localStorage.setItem('lumobot-teamfolder', TFOLDER); }catch(e){} drawTeam(); } }
const teamBusy = () => new Set(S && S.running ? [S.config && S.config.agent].concat((S.team || []).filter(t => t.state === 'run').map(t => t.to)).filter(Boolean) : []);
function teamRowHtml(){ const crew = AG.slice(0, 4), busy = teamBusy(), n = busy.size;
  const stack = crew.map((a, i) => `<span class="ts" style="z-index:${9 - i}">${face(a, 30, busy.has(a.id) ? 'busy' : '')}</span>`).join('');
  const grid = crew.map(a => face(a, 19, busy.has(a.id) ? 'busy' : '')).join('');
  const sub = n ? `<span class="working"><i></i><i></i><i></i><span>${tr('Rozmawiają i pracują')}: ${n}</span></span>` : `${AG.length} ${tr('w zespole')}`;
  return `<div class="agent teamrow${tab === 'team' ? ' on' : ''}" data-team="1" title="Team"><span class="teamstack">${stack}</span><span class="teamgrid">${grid}</span><div><b>TEAM</b><small>${sub}</small></div></div>`; }
const tAgent = id => id === 'user' ? {id:'user', name:tr('Ty'), color:'#64748b', face:'kropki', shape:'squircle'} : (agentOf(id) || {id, name:'?', color:'#64748b', face:'kropki', shape:'squircle'});
const clk = ms => new Date(ms).toLocaleTimeString(loc(), {hour:'2-digit', minute:'2-digit'});
function teamEvent(e){ const a = tAgent(e.from), b = e.to && e.to !== 'all' ? tAgent(e.to) : null;
  if(e.kind === 'run') return `<div class="sep"><span>${dayOrClock(e.t)}</span></div><div class="teamrun">${face(a, 24)}<div><b>${esc(a.name)} ${tr('prowadzi zadanie')}</b><p>${esc((e.text || '').split('\n')[0].slice(0, 180))}</p></div></div>`;
  if(e.kind === 'user') return `<div class="msg me"><div class="bubble">${esc(e.text)}</div></div><div class="teamsub me">${tr('Ty')} → ${b ? esc(b.name) : tr('wszyscy')} · ${clk(e.t)}</div>`;
  if(e.kind === 'typing') return `<div class="msg ai live">${face(a, 32, 'busy')}<div><div class="who"><b>${esc(a.name)}</b><span>${b ? '→ ' + esc(b.name) + ' · ' : ''}${tr(e.waiting ? 'czeka na swoją kolej' : 'pracuje')} · <span class="tsec"></span></span></div><div class="crewrun"><i></i><i></i><i></i></div></div></div>`;
  const tag = e.kind === 'task' ? tr(e.work ? 'zleca pracę' : 'pyta') : e.kind === 'reply' ? tr(e.failed ? 'nie dokończył' : 'odpowiada') : tr('na kanale');
  return `<div class="msg ai ${e.kind}${e.failed ? ' bad' : ''}">${face(a, 32)}<div><div class="who"><b>${esc(a.name)}</b><span>${tag}${b ? ' → ' + esc(b.name) : e.kind === 'say' ? ' → ' + tr('wszyscy') : ''} · ${clk(e.t)}${e.kind === 'reply' && e.seconds != null ? ' · ' + span(e.seconds) : ''}</span></div><div class="say">${md(e.text || '')}</div></div></div>`; }
/* Podmiana w miejscu: z nowego HTML zostają nietknięte te elementy, które się nie zmieniły, a zmienione wchodzą bez animacji wejścia.
   Dzięki temu pasek agentów, nagłówek i pudełko użycia nie „przeładowują się” przy każdej zmianie stanu. */
function softHtml(box, html, skip){ if(!box) return; if(box.__html === html) return; box.__html = html;
  const t = document.createElement('template'); t.innerHTML = html; const neu = [...t.content.children], mine = () => [...box.children].filter(n => !skip || !n.matches(skip)), old = mine(), first = !old.length;
  const tail = skip ? [...box.children].find(n => n.matches(skip)) || null : null;      // dopisane na końcu elementy innych rysowników (na przykład płótno agenta od obrazów) zostają na miejscu
  if(first){ neu.forEach(n => { n.__h = n.outerHTML; box.insertBefore(n, tail); }); return; }
  neu.forEach((n, i) => { const h = n.outerHTML, o = old[i]; if(o && o.__h === h) return; n.__h = h; if(o){ n.classList.add('noanim'); o.replaceWith(n); } else box.insertBefore(n, tail); });
  old.slice(neu.length).forEach(o => o.remove()); }
const softSet = id => ({ set html(v){ softHtml($(id), v); } });
function feedPatch(box, items){ const have = new Map([...box.children].filter(n => n.classList.contains('ev')).map(n => [n.dataset.k, n])); let prev = null, added = false;
  items.forEach(it => { let n = have.get(it.k); have.delete(it.k);
    if(!n){ n = document.createElement('div'); n.className = 'ev'; n.dataset.k = it.k; n.dataset.h = it.html; n.innerHTML = it.html; added = true; }
    else if(n.dataset.h !== it.html){ n.dataset.h = it.html; n.innerHTML = it.html; n.classList.add('noanim'); }
    const want = prev ? prev.nextSibling : box.firstChild; if(n !== want) box.insertBefore(n, want);
    if(it.dyn != null){ const s = n.querySelector('.tsec'); if(s && s.textContent !== it.dyn) s.textContent = it.dyn; }
    prev = n; });
  have.forEach(n => n.remove()); [...box.children].forEach(n => { if(!n.classList.contains('ev')) n.remove(); }); return added; }
let TEAMHEAD = '';
function drawTeam(){ const box = $('teamFeed'), ev = TEAM.events || [], busy = teamBusy();
  const crew = AG.slice(0, 5), lead = TEAM.lead ? tAgent(TEAM.lead) : null;
  const head = `<span class="teamstack big">${crew.map((a, i) => `<span class="ts" style="z-index:${9 - i}">${face(a, 40, busy.has(a.id) ? 'busy' : '')}</span>`).join('')}</span><div><b>TEAM</b><small>${TEAM.running && lead ? `${tr('Prowadzi')}: ${esc(lead.name)} · ${tr('pracuje')}: ${busy.size}` : `${AG.length} ${tr('w zespole')} · ${tr('rozmowy agentów w jednym miejscu')}`}</small></div>`
    + `<div class="teamchips">${AG.map(a => `<span class="tchip${busy.has(a.id) ? ' on' : ''}">${face(a, 18)}${esc(a.name)}<i></i></span>`).join('')}</div>`;
  if(head !== TEAMHEAD){ TEAMHEAD = head; softSet('teamHead').html = head; }
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 140 || !box.dataset.ready; box.dataset.ready = '1';
  const PHT = {work:'Pracuje', check:'Sprawdza wynik', wait:'Czeka na limit', confirm:'Czeka na twoją zgodę'};
  const items = ev.map(e => ({k:e.id, html:teamEvent(e), dyn:e.kind === 'typing' ? span(e.seconds) : null}));
  if(TEAM.running && lead) items.push({k:'live', html:`<div class="typing act">${face(lead, 32, 'busy')}<div class="actbox"><div class="acthead"><div class="dotsrow"><i></i><i></i><i></i></div><b>${esc(lead.name)}: ${tr(PHT[S && S.phase] || 'Pracuje')}${busy.size > 1 ? ' · ' + tr('pracuje') + ': ' + busy.size : ''}</b></div></div></div>`});
  if(!items.length) items.push({k:'empty', html:`<div class="empty teamempty"><span class="teamstack big">${crew.map((a, i) => `<span class="ts" style="z-index:${9 - i}">${face(a, 64)}</span>`).join('')}</span><h1>${tr('Tu agenci rozmawiają ze sobą')}</h1><p>${tr('Gdy zlecisz zadanie zespołowi, zobaczysz tu, jak prowadzący rozdziela pracę, jak agenci odpowiadają sobie, pytają i dogadują się na kanale. Możesz się wtrącić w każdej chwili.')}</p></div>`});
  const langKey = LANG + AG.map(x => x.id + x.name + x.color + x.face + x.shape).join(); if(box.dataset.lk !== langKey){ box.dataset.lk = langKey; box.innerHTML = ''; }
  const added = feedPatch(box, items); if(added && near) box.scrollTop = box.scrollHeight;
  const lead2 = TL && AG.find(a => a.id === TL) ? TL : ((AG.find(a => a.id === cur) || AG[0] || {}).id || ''); TL = lead2;
  const ld = agentOf(TL); softSet('teamLeadBtn').html = ld ? `${face(ld, 16)}<span>${esc(ld.name)}</span>` : ''; $('teamLeadBtn').disabled = !!TEAM.running; $('teamLeadBtn').title = tr('Kto prowadzi zadanie zespołu');
  const lf = TEAM.running ? ((S && S.config && S.config.folder) || '') : (TFOLDER || ((agentOf(TL) || {}).project) || ''); $('teamFolderName').textContent = lf ? base(lf) : tr('Nowy projekt'); $('teamFolder').title = lf || tr('Zespół pracuje w folderze wybranego prowadzącego. Kliknij, żeby wskazać inny.'); $('teamFolder').disabled = !!TEAM.running;
  $('teamNote').textContent = TEAM.running ? tr('Wiadomość trafi do prowadzącego i na kanał zespołu') : tr('Nie trwa żadne zadanie: wiadomość uruchomi je u wybranego prowadzącego'); }
async function loadTeam(){ try{ TEAM = await api('/api/teamfeed'); }catch(e){ return; } if(tab === 'team') drawTeam(); }
$('teamFolder').addEventListener('click', pickTeamFolder);
$('teamLeadBtn').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect();
  ctxMenu(r.left, r.top - 8, AG.map(x => ({label:x.name, raw:true, on:x.id === TL, run:() => { TL = x.id; drawTeam(); api('/api/teamconfig', {leader:x.id}).catch(() => {}); }})).concat(['-', {label:'Ustawienia zespołu', icon:'gear', run:teamSheet}]), true); });
$('teamText').addEventListener('input', () => grow($('teamText')));
$('teamText').addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); $('teamComp').requestSubmit(); } });
$('teamComp').addEventListener('submit', async e => { e.preventDefault(); const t = $('teamText').value.trim(); if(!t) return;
  try{ if(TEAM.running) TEAM = await api('/api/team/say', {text:t, to:'all'});
    else { const a = agentOf(TL); if(!a){ toast('Nie ma kogo uruchomić.', true); return; }
      await api('/api/super', {agent:a.id, folder:TFOLDER || a.project || '', check:'', goal:t, mode:(S && S.defaults && S.defaults.mode) || 'full', max_rounds:(S && S.defaults && S.defaults.max_rounds) || 30, checkpoints:!!(S && S.defaults && S.defaults.checkpoints), files:[]}); }
    $('teamText').value = ''; grow($('teamText')); api('/api/agents').then(r => { AG = r.agents || r; }).catch(() => {}); TEAMSIG = ''; poll(); setTimeout(loadTeam, 600); }catch(err){ toast(err.message, true); } });
$('teamFeed').addEventListener('click', e => { const link = e.target.closest('a.lnk'); if(!link) return; e.preventDefault();
  if(link.dataset.path){ const a = agentOf(TL || cur); api('/api/reveal', {path:link.dataset.path, base:(a && a.folder) || ''}).catch(() => {}); return; }
  openSite(link.getAttribute('href')); });
setInterval(() => { if(tab === 'team' && !document.hidden) loadTeam(); }, 1500);
function renderAgents(){
  const H = S.history || [], liveId = S.running && S.config ? S.config.agent : null, sort = localStorage.getItem('lumobot-sort') || '';
  const key = AG.map(a => a.id + a.name + a.color + a.face + a.shape + a.pinned + (a.photo || '') + (a.model || '') + (a.kind || '')).join() + leadId() + JSON.stringify(UNREAD) + cur + tab + liveId + teamBusy().size + LANG + (S.phase || '') + (S.talk ? S.talk.to : '') + (S.team || []).map(t => t.to + t.state).join() + (INB ? INB.items.filter(x => !x.accepted && x.asks.length).map(x => x.agent).join() : '') + PACKS.current + H.length + (H[0] ? H[0].id + H[0].outcome : '') + LANG + sort;
  $('queueCount').textContent = S.queue ? S.queue : ''; $('reportDot').hidden = !S.report_new;
  if(key === listDrawn) return; listDrawn = key;
  const rows = sortedAgents(), anyPin = rows.some(a => a.pinned);
  softSet('agents').html = teamRowHtml() + rows.map((a, i) => { const last = lastOf(a.id), live = a.id === liveId;
    const sec = !anyPin ? '' : i === 0 ? `<div class="seclabel">${tr('Przypięte')}</div>` : !a.pinned && rows[i-1].pinned ? `<div class="seclabel">${tr('Pozostali')}</div>` : '';
    const talk = S.running && S.talk, crew = S.running && (S.team || []).some(t => t.to === a.id && t.state === 'run'), asked = (talk && talk.to === a.id) || crew, PH = {work:'Pracuje', check:'Sprawdza wynik', wait:'Czeka na limit', confirm:'Czeka na twoją zgodę'};
    const doing = crew ? `${tr('Pracuje dla')}: ${esc(agentOf(liveId).name)}` : asked ? `${tr('Odpowiada')}: ${esc(agentOf(talk.from).name)}` : live ? (talk ? `${tr('Pyta')}: ${esc(agentOf(talk.to).name)}` : tr(PH[S.phase] || 'Pracuje')) : '';
    const waits = !doing && INB && INB.items.some(x => x.agent === a.id && !x.accepted && x.asks.length);
    const sub = waits ? `<span class="needs">${tr('Czeka na twoją odpowiedź')}</span>` : doing ? `<span class="working"><i></i><i></i><i></i><span>${doing}</span></span>` : esc(last ? last.goal.split('\n')[0] : a.purpose || tr('Gotowy do pracy'));
    return sec + `<div class="agent${tab === 'agent' && a.id === cur ? ' on' : ''}" data-id="${a.id}" title="${esc(a.name)}" style="animation-delay:${i*30}ms">${faceAI(a, 42, live || asked)}<div><b>${esc(a.name)}${kindTag(a)}</b><small>${sub}</small></div><span class="side2">${UNREAD[a.id] ? `<b class="ubadge" title="${tr('Nieprzeczytane')}">${UNREAD[a.id] > 9 ? '9+' : UNREAD[a.id]}</b>` : `<time>${last ? dayOrClock(last.started) : ''}</time>`}</span></div>`; }).join('');
}

/* ---------- okno potwierdzenia w stylu aplikacji ---------- */
function askText(title, text, okLabel, value){ return new Promise(done => { const m = $('modal');
  m.innerHTML = `<form class="sheet ask"><h3>${tr(title)}</h3><p>${tr(text)}</p><label class="field"><input type="text" maxlength="40" value="${esc(value || '')}" autocomplete="off"></label><div class="foot"><button type="button" data-no>${tr('Anuluj')}</button><button class="primary">${tr(okLabel)}</button></div></form>`;
  m.hidden = false; const inp = m.querySelector('input'), close = v => { m.hidden = true; m.onclick = null; done(v); }; inp.focus(); inp.select();
  m.querySelector('form').onsubmit = e => { e.preventDefault(); close(inp.value.trim() || null); };
  m.onkeydown = e => { if(e.key === 'Escape') close(null); };
  m.onclick = e => { if(e.target === m || e.target.closest('[data-no]')) close(null); }; }); }
/* ---------- paczki agentów ---------- */
async function loadPacks(){ try{ PACKS = await api('/api/packs'); }catch(e){ return; } const cur0 = PACKS.items.find(p => p.id === PACKS.current); $('packName').textContent = cur0 ? tr(cur0.name) : tr('Agenci'); }
async function packDo(body, okText){ try{ const r = await api('/api/packs', body); noteFlush(); LB.value = ''; LBFOR = ''; LBRUN = ''; grow(LB); liveMode(); wasRunning = false; try{ VO.token++; }catch(e){} PACKS = r; AG = r.agents; POLLGEN++; HS = {}; listDrawn = ''; drawn = ''; renderAgents(); if(!AG.find(a => a.id === cur)) cur = AG[0].id; Object.keys(TH).forEach(k => delete TH[k]); opened.clear(); CP.run = null;
    const c = PACKS.items.find(p => p.id === PACKS.current); $('packName').textContent = c ? tr(c.name) : tr('Agenci'); await poll(); show('agent'); if(okText) toast(okText); return true; }catch(err){ toast(err.message, true); return false; } }
$('packBtn').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(), here = PACKS.items.find(p => p.id === PACKS.current) || {id:'main', name:'Agenci'};
  ctxMenu(r.left, r.bottom + 6, PACKS.items.map(p => ({label:`${tr(p.name)} (${p.count})${p.busy ? ' · ' + tr('pracuje') : ''}`, raw:true, icon:'folder', on:p.id === PACKS.current, run:() => p.id === PACKS.current ? null : packDo({use:p.id})})).concat(['-',
    {label:'Nowa paczka', icon:'plus', run:async () => { const n = await askText('Nowa paczka agentów', 'Osobny zestaw agentów na inny projekt. Przełączasz się między paczkami jednym kliknięciem, a agenci z jednej paczki nie widzą tych z drugiej.', 'Utwórz', ''); if(n) packDo({create:1, name:n}, 'Paczka utworzona.'); }},
    {label:'Zmień nazwę paczki', icon:'edit', run:async () => { const n = await askText('Nazwa paczki', 'Tak będzie widoczna nad listą agentów.', 'Zapisz', tr(here.name)); if(n) packDo({rename:here.id, name:n}); }},
    {label:'Usuń tę paczkę', icon:'clear', danger:true, off:here.id === 'main', run:async () => { if(await ask('Usunąć paczkę?', 'Agenci z tej paczki nie znikną: wrócą do pierwszej paczki razem ze swoimi rozmowami.', 'Usuń', true)) packDo({remove:here.id}, 'Paczka usunięta.'); }}])); });
function ask(title, text, okLabel, danger){ return new Promise(done => { const m = $('modal');
  m.innerHTML = `<div class="sheet ask"><h3>${tr(title)}</h3><p>${tr(text)}</p><div class="foot"><button type="button" data-no>${tr('Anuluj')}</button><button type="button" class="${danger ? 'danger' : 'primary'}" data-yes>${tr(okLabel)}</button></div></div>`;
  m.hidden = false; const close = v => { m.hidden = true; m.onclick = null; document.removeEventListener('keydown', key); done(v); };
  const key = e => { if(e.key === 'Escape') close(false); if(e.key === 'Enter') close(true); };
  document.addEventListener('keydown', key); m.querySelector('[data-yes]').focus();
  m.onclick = e => { if(e.target === m || e.target.closest('[data-no]')) close(false); else if(e.target.closest('[data-yes]')) close(true); }; }); }
window.askQuit = async () => { if(await ask('Zamknąć LumoBota?', 'Agent teraz pracuje. Po zamknięciu zatrzyma się, a to, co już zrobił, zostanie w folderze projektu.', 'Zamknij', true)) window.pywebview.api.win('close'); };

/* ---------- menu pod prawym przyciskiem ---------- */
const IC = {pen:'<path d="M3 13l.8-3.200 6.900-6.900a1.400 1.400 0 0 1 2 0l.4.4a1.400 1.400 0 0 1 0 2l-6.900 6.900z"/><path d="M9.600 4l2.400 2.400"/>', crown:'<path d="M2.500 5.200l2.800 2.500L8 3.500l2.700 4.200 2.800-2.500-1 6.800h-9z"/><path d="M3.800 13.500h8.400"/>', image:'<rect x="2.500" y="3" width="11" height="10" rx="2.200"/><circle cx="6" cy="6.600" r="1.100"/><path d="M3 11.300l3.100-2.900 2.300 2 1.800-1.600 2.800 2.500"/>', plus:'<path d="M8 3v10M3 8h10"/>', edit:'<path d="M10.8 2.7l2.5 2.5-7.6 7.6-3.1.6.6-3.1z"/>', copy:'<rect x="5.5" y="5.5" width="8" height="8" rx="1.6"/><path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.500 4v5A1.500 1.500 0 0 0 4 10.500h1.500"/>',
  pin:'<g transform="rotate(45 8 8)"><path d="M3.333 11.333h9.334v-1.173a1.333 1.333 0 0 0-.74-1.193l-1.187-.6A1.333 1.333 0 0 1 10 7.173V4h.667a1.333 1.333 0 0 0 0-2.667H5.333a1.333 1.333 0 0 0 0 2.667H6v3.173a1.333 1.333 0 0 1-.74 1.193l-1.187.6A1.333 1.333 0 0 0 3.333 10.16Z"/><path d="M8 11.333v3.334"/></g>', folder:'<path d="M1.800 4.200a1 1 0 0 1 1-1h3.100l1.400 1.500h5.900a1 1 0 0 1 1 1v6.100a1 1 0 0 1-1 1H2.800a1 1 0 0 1-1-1z"/>',
  mic:'<rect x="6" y="2" width="4" height="7.500" rx="2"/><path d="M3.800 7.500a4.200 4.200 0 0 0 8.400 0M8 11.700V14"/>', shot:'<path d="M2.500 5.500V3.800a1 1 0 0 1 1-1h1.700M13.500 5.500V3.800a1 1 0 0 0-1-1h-1.700M2.500 10.500v1.700a1 1 0 0 0 1 1h1.700M13.500 10.500v1.700a1 1 0 0 1-1 1h-1.700"/><circle cx="8" cy="8" r="2"/>', speak:'<path d="M3 6.200h2l3-2.500v8.600L5 9.800H3zM10.500 5.800a3.200 3.200 0 0 1 0 4.400M12.300 4a5.600 5.600 0 0 1 0 8"/>', clip:'<path d="M13 7.300 8 12.300a3 3 0 0 1-4.300-4.300l5.300-5.300a2 2 0 0 1 2.900 2.900L6.700 10.800a1 1 0 0 1-1.500-1.500L9.800 4.800"/>',
  gear:'<circle cx="8" cy="8" r="2"/><path d="M8 2v1.600M8 12.400V14M2 8h1.600M12.400 8H14M3.800 3.800l1.100 1.100M11.100 11.100l1.100 1.100M12.200 3.800l-1.100 1.100M4.900 11.100l-1.100 1.100"/>',
  undo:'<path d="M3 6.500h6.200a3.300 3.300 0 0 1 0 6.600H6.500M3 6.500 5.800 3.700M3 6.500l2.800 2.800"/>',
  user:'<circle cx="8" cy="5.600" r="2.600"/><path d="M3 13.200c.6-2.600 2.600-4 5-4s4.400 1.400 5 4"/>',
  clear:'<path d="M3 5h10M6.500 5V3.500h3V5M4.500 5l.6 8h5.800l.6-8"/>', trash:'<path d="M3 4.500h10M6 4.500V3h4v1.500M4.500 4.500l.5 8.500h6l.5-8.500M6.700 7v4M9.300 7v4"/>', sort:'<path d="M3 4.500h10M3 8h7M3 11.500h4"/>', task:'<path d="M2.500 4.200a1.700 1.700 0 0 1 1.700-1.700h7.600a1.700 1.700 0 0 1 1.700 1.700v5.100a1.700 1.700 0 0 1-1.700 1.700H7.400l-3 2.400V11h-.2a1.700 1.700 0 0 1-1.700-1.700z"/>'};
let ctxDo = [], ctxSubDo = [], ctxSubT = 0;
const ctxRow = (it, i) => it === '-' ? '<i></i>' : `<button type="button" data-i="${i}" class="${it.danger ? 'danger' : ''}${it.sub ? ' hassub' : ''}" ${it.off ? 'disabled' : ''}${it.sub ? ' aria-haspopup="menu" aria-expanded="false"' : ''}>${it.icon ? `<svg viewBox="0 0 16 16">${IC[it.icon] || ''}</svg>` : ''}${it.raw ? esc(it.label) : tr(it.label)}${it.on ? `<small>${CHECK}</small>` : ''}${it.key ? `<kbd>${it.key}</kbd>` : ''}${it.sub ? '<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.500 10.500 8 6 12.500"/></svg>' : ''}</button>`;
function ctxMenu(x, y, items, up){ const m = $('ctx'); ctxDo = items; subClose();
  m.innerHTML = items.map(ctxRow).join('');
  m.classList.toggle('plain', items.every(it => it === '-' || !it.icon));
  m.hidden = false; m.classList.remove('open'); m.style.maxHeight = ''; m.style.overflowY = '';
  const w = m.offsetWidth, room = innerHeight - 16; if(m.offsetHeight > room){ m.style.maxHeight = room + 'px'; m.style.overflowY = 'auto'; }      // wyższe niż okno: przewija się w środku
  const h = m.offsetHeight, top = up ? y - h : y;      // rozmiar bez animacji: menu nigdy nie wystaje poza okno, przy dolnej krawędzi wysuwa się wyżej
  m.style.left = Math.max(8, Math.min(x, innerWidth - w - 8)) + 'px'; m.style.top = Math.max(8, Math.min(top, innerHeight - h - 8)) + 'px'; m.style.transformOrigin = top + h > innerHeight - 8 ? 'bottom left' : 'top left'; requestAnimationFrame(() => m.classList.add('open')); }
/* pozycja z podmenu (np. Przenieś do paczki): po najechaniu obok wysuwa się drugie menu, po prawej, a przy krawędzi ekranu po lewej */
function subOpen(btn){ const it = ctxDo[+btn.dataset.i]; if(!it || !it.sub) return; clearTimeout(ctxSubT);
  let s = $('ctxSub');
  if(!s){ s = document.createElement('div'); s.id = 'ctxSub'; s.className = 'ctx sub'; s.hidden = true; s.setAttribute('role', 'menu'); document.body.appendChild(s);
    s.addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; const x = ctxSubDo[+b.dataset.i]; ctxClose(); if(x && x.run) x.run(); });
    s.addEventListener('mouseenter', () => clearTimeout(ctxSubT));
    s.addEventListener('keydown', e => { if(e.key === 'ArrowLeft'){ e.preventDefault(); const p = $('ctx').querySelector('.subon'); subClose(); if(p) p.focus(); } }); }
  if(!s.hidden && s.dataset.for === btn.dataset.i) return;
  ctxSubDo = it.sub; s.dataset.for = btn.dataset.i;
  s.innerHTML = it.sub.map(ctxRow).join(''); s.classList.toggle('plain', it.sub.every(x => x === '-' || !x.icon));
  s.hidden = false; s.classList.remove('open'); s.style.maxHeight = ''; s.style.overflowY = '';
  const room = innerHeight - 16; if(s.offsetHeight > room){ s.style.maxHeight = room + 'px'; s.style.overflowY = 'auto'; }
  const r = btn.getBoundingClientRect(), mr = $('ctx').getBoundingClientRect(), w = s.offsetWidth, h = s.offsetHeight, right = mr.right + 4 + w <= innerWidth - 8;
  s.style.left = (right ? mr.right + 4 : Math.max(8, mr.left - w - 4)) + 'px'; s.style.top = Math.max(8, Math.min(r.top - 6, innerHeight - h - 8)) + 'px'; s.style.transformOrigin = right ? 'top left' : 'top right';
  $('ctx').querySelectorAll('.hassub').forEach(b => { b.classList.toggle('subon', b === btn); b.setAttribute('aria-expanded', b === btn ? 'true' : 'false'); });
  requestAnimationFrame(() => s.classList.add('open')); }
function subClose(){ clearTimeout(ctxSubT); const s = $('ctxSub'); if(s){ s.classList.remove('open'); s.hidden = true; s.dataset.for = ''; }
  document.querySelectorAll('#ctx .subon').forEach(b => { b.classList.remove('subon'); b.setAttribute('aria-expanded', 'false'); }); }
function ctxClose(){ const m = $('ctx'); m.classList.remove('open'); m.hidden = true; subClose(); }
$('ctx').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; const it = ctxDo[+b.dataset.i]; if(it && it.sub){ subOpen(b); return; } ctxClose(); if(it && it.run) it.run(); });
$('ctx').addEventListener('mouseover', e => { const b = e.target.closest('button'); if(!b) return; if(b.classList.contains('hassub')) subOpen(b);
  else if($('ctxSub') && !$('ctxSub').hidden){ clearTimeout(ctxSubT); ctxSubT = setTimeout(subClose, 220); } });      // krótka zwłoka: ukośny ruch myszy do podmenu go nie zamyka
$('ctx').addEventListener('keydown', e => { const b = e.target.closest('button.hassub'); if(b && (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); subOpen(b); const f = $('ctxSub') && $('ctxSub').querySelector('button:not([disabled])'); if(f) f.focus(); } });
document.addEventListener('click', e => { if(!e.target.closest('.ctx') && !e.target.closest('[data-more]') && !e.target.closest('#orderWho') && !e.target.closest('[data-undo]') && !e.target.closest('#pickBtn') && !e.target.closest('#teamLeadBtn') && !e.target.closest('#plusBtn') && !e.target.closest('#teamPlus') && !e.target.closest('#orderPlus')) ctxClose(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') ctxClose(); });
window.addEventListener('blur', ctxClose);
$('ctx').addEventListener('mousedown', e => e.preventDefault());      // klik w menu nie zabiera zaznaczenia ani kursora z pola
/* ---------- szkic: niewysłany tekst zostaje w polu, osobno dla każdego agenta, także po zamknięciu programu ---------- */
let DR = null, draftOf = '', draftT = 0;
function draftKeep(now){ if(!DR || !draftOf) return; const id = draftOf, text = F.goal.value; if((DR[id] || '') === text) return;
  if(text.trim()) DR[id] = text; else delete DR[id];
  clearTimeout(draftT); const send = () => api('/api/drafts', {agent:id, text}).catch(() => {}); if(now) send(); else draftT = setTimeout(send, 350); }
function draftSync(){ if(!DR || !cur || draftOf === cur) return; if(draftOf) draftKeep(true);
  const first = !draftOf; draftOf = cur; if(first && F.goal.value) return draftKeep(true);      // coś już wpisano, zanim szkice się wczytały: nie nadpisujemy
  F.goal.value = DR[cur] || ''; grow(F.goal); }
api('/api/drafts').then(r => { DR = r || {}; draftSync(); }).catch(() => { DR = {}; });
F.goal.addEventListener('input', () => { draftKeep(false); sendReady(); });
function sendReady(){ try{ $('sendBtn').classList.toggle('ready', !!F.goal.value.trim() || ATT.length > 0); }catch(e){} }
setInterval(() => draftKeep(false), 1500);                    // tekst wstawiony bez pisania (szablon, wklejenie z menu) też się zapisuje
window.addEventListener('pagehide', () => { if(!DR || !draftOf) return; const text = F.goal.value; if((DR[draftOf] || '') === text && !draftT) return;
  try{ navigator.sendBeacon('/api/drafts', new Blob([JSON.stringify({agent:draftOf, text})], {type:'application/json'})); }catch(err){} });
/* ---------- prawy przycisk: kopiuj, wklej i reszta, w polach pisania i w rozmowie ---------- */
async function clipText(){ try{ if(window.pywebview && window.pywebview.api && window.pywebview.api.clip){ const t = await window.pywebview.api.clip(); if(typeof t === 'string') return t; } }catch(err){}
  try{ return await navigator.clipboard.readText(); }catch(err){ return ''; } }
async function clipCopy(text){ if(!text) return; try{ await navigator.clipboard.writeText(text); }catch(err){ const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); } }
function putText(el, text){ if(!el || !text) return; el.focus(); if(!document.execCommand('insertText', false, text)){ el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end'); } el.dispatchEvent(new Event('input', {bubbles:true})); }
document.addEventListener('contextmenu', e => { if(e.defaultPrevented) return;
  const field = e.target.closest('textarea, input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=color]):not([type=button])');
  const picked = String(getSelection() || ''), chat = e.target.closest('#chat');
  if(field && !field.disabled){ e.preventDefault(); let a = 0, b = 0; try{ a = field.selectionStart; b = field.selectionEnd; }catch(err){}
    const has = b > a, secret = field.type === 'password', ro = field.readOnly, cmd = c => () => { field.focus(); document.execCommand(c); };
    return ctxMenu(e.clientX, e.clientY, [{label:'Cofnij', key:'Ctrl+Z', off:ro, run:cmd('undo')}, {label:'Ponów', key:'Ctrl+Y', off:ro, run:cmd('redo')}, '-',
      {label:'Wytnij', key:'Ctrl+X', off:!has || secret || ro, run:() => { const t = field.value.slice(a, b); clipCopy(t); field.focus(); if(!document.execCommand('delete')){ field.setRangeText('', a, b, 'end'); field.dispatchEvent(new Event('input', {bubbles:true})); } }},
      {label:'Kopiuj', key:'Ctrl+C', off:!has || secret, run:() => clipCopy(field.value.slice(a, b))},
      {label:'Wklej', key:'Ctrl+V', off:ro, run:async () => putText(field, await clipText())}, '-',
      {label:'Zaznacz wszystko', key:'Ctrl+A', off:!field.value, run:() => { field.focus(); field.select(); }}]); }
  if(chat || picked){ e.preventDefault(); const box = chat || $('chat');
    return ctxMenu(e.clientX, e.clientY, [{label:'Kopiuj', key:'Ctrl+C', off:!picked, run:() => clipCopy(picked)},
      {label:'Wklej', key:'Ctrl+V', run:async () => putText(F.goal, await clipText())}, '-',
      {label:'Zaznacz wszystko', key:'Ctrl+A', run:() => { const r = document.createRange(); r.selectNodeContents(box); const g = getSelection(); g.removeAllRanges(); g.addRange(r); }}]); } });
/* znaczek AI w nagłówku czatu: po zmianie modelu podmienia się sam znaczek, rozmowa się nie przerysowuje */
function headBadge(){ const a = agentOf(cur), b = document.querySelector('#agentHead .facewrap .ai'); if(a && b) b.innerHTML = aiIcon(providerOf(a), 12); }
async function saveAgentPatch(a, patch, soft){ try{ const r = await api('/api/agents', {...a, ...patch}); AG = r.agents; if(soft){ drawnLite = ''; renderAgents(); headBadge(); pickSoft(); ctxRender(); } else redraw(); return r.agent; }catch(err){ toast(err.message, true); } }
function agentMenu(a, x, y){ const native = !!(window.pywebview && window.pywebview.api);
  ctxMenu(x, y, [{label:'Profil agenta', icon:'user', run:() => profileSheet(a)}, '-',
    {label:'Nowe zadanie', icon:'task', run:() => { cur = a.id; show('agent'); F.goal.focus(); }},
    {label:'Edytuj', icon:'edit', run:() => openMaker(a)},
    {label:'Duplikuj', icon:'copy', run:async () => { const r = await saveAgentPatch({...a, id:null, name:(a.name + ' 2').slice(0, 40), pinned:false}, {}); if(r){ cur = r.id; show('agent'); } }},
    {label:a.pinned ? 'Odepnij' : 'Przypnij na górze', icon:'pin', run:() => saveAgentPatch(a, {pinned:!a.pinned})},
    {label:'Lider zespołu', icon:'crown', on:TL === a.id, run:() => { TL = a.id; api('/api/teamconfig', {leader:a.id}).then(() => toast(`${a.name}: ${tr('prowadzi teraz zadania zespołu.')}`)).catch(err => toast(err.message, true)); if(tab === 'team') drawTeam(); }}, '-',
    {label:'Otwórz folder projektu', icon:'folder', off:!a.folder || !native, run:() => window.pywebview.api.open_path(a.folder)},
    {label:'Pamięć projektu', icon:'edit', run:() => memorySheet(a)},
    {label:'Przenieś do paczki', icon:'folder', off:!PACKS.items.some(p => p.id !== PACKS.current), sub:PACKS.items.filter(p => p.id !== PACKS.current).map(p => ({label:tr(p.name) + (p.count ? ` (${p.count})` : ''), raw:true, icon:'folder', run:() => packDo({move:a.id, to:p.id}, 'Agent przeniesiony.')}))},      // jedna pozycja; paczki wysuwają się obok
    {label:'Wyczyść rozmowę', icon:'clear', run:async () => { if(!await ask('Wyczyścić rozmowę?', 'Zadania tego agenta znikną z rozmowy i trafią do archiwum. Sieć Neuro dalej się z nich uczy.', 'Wyczyść', true)) return;
      await wipeChat(a, {clear:a.id}, 'Rozmowa wyczyszczona. Agent zaczyna od czystej karty.'); }}, '-',
    {label:'Usuń agenta', icon:'trash', danger:true, off:AG.length < 2, run:async () => { if(!await ask('Usunąć agenta?', 'Agent zniknie z listy. Jego zadania zostaną w historii.', 'Usuń', true)) return;
      try{ const r = await api('/api/agents', {remove:a.id}); AG = r.agents; if(cur === a.id) cur = AG[0].id; show('agent'); }catch(err){ toast(err.message, true); } }}]); }
/* przeciąganie agentów: złap wiersz i upuść nad innym; kolejność zapisuje się u agenta */
let DRAGGED = 0;
$('agents').addEventListener('pointerdown', e => { const it = e.target.closest('.agent[data-id]'); if(!it || e.button) return; const box = $('agents'), y0 = e.clientY; let on = false, mark = null, before = null;
  const rows = () => [...box.querySelectorAll('.agent[data-id]')].filter(r => r !== it);
  const mv = ev => { if(!on && Math.abs(ev.clientY - y0) < 7) return;
    if(!on){ on = true; it.classList.add('dragging'); mark = document.createElement('div'); mark.className = 'dropline'; document.body.appendChild(mark); }
    const rs = rows(); let at = null, line = 0; for(const r of rs){ const b = r.getBoundingClientRect(); if(ev.clientY < b.top + b.height / 2){ at = r; line = b.top - 2; break; } line = b.bottom + 2; }
    before = at ? at.dataset.id : null; const bb = box.getBoundingClientRect(); mark.style.cssText = `left:${bb.left + 10}px;width:${bb.width - 20}px;top:${line}px`; it.style.transform = `translateY(${ev.clientY - y0}px)`; };
  const up = async () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); it.style.transform = ''; it.classList.remove('dragging'); if(mark) mark.remove();
    if(on){ DRAGGED = Date.now(); try{ localStorage.setItem('lumobot-sort', ''); }catch(err){} const r = await api('/api/agents', {move: it.dataset.id, before}); AG = r.agents || AG; listDrawn = ''; redraw(); } };
  addEventListener('pointermove', mv); addEventListener('pointerup', up); });
$('agents').addEventListener('contextmenu', e => { e.preventDefault(); const it = e.target.closest('.agent'), how = localStorage.getItem('lumobot-sort') || '';
  if(it && it.dataset.team) return;
  if(it) return agentMenu(agentOf(it.dataset.id), e.clientX, e.clientY);
  const set = v => () => { localStorage.setItem('lumobot-sort', v); redraw(); };
  ctxMenu(e.clientX, e.clientY, [{label:'Nowy agent', icon:'plus', run:() => openMaker(null)}, {label:'Nowy agent od obrazów', icon:'image', run:() => openMaker(null, PHOTO_AGENT)}, {label:'Nowy projektant', icon:'pen', run:() => openMaker(null, DESIGN_AGENT)}, '-', {label:'Kolejność: własna', icon:'sort', on:how === '', run:set('')}, {label:'Kolejność: ostatnio aktywni', icon:'sort', on:how === 'recent', run:set('recent')}, {label:'Kolejność: według nazwy', icon:'sort', on:how === 'name', run:set('name')}]); });

/* ---------- kontekst: ile rozmowy agent trzyma w pamięci ---------- */
const winOf = a => { const m = MODELS.models.find(x => x.id === a.model); return (m && m.window) || a.ctx_max || 200000; };
function ctxNow(a){ return (S && S.running && S.config && S.config.agent === a.id && S.live && S.live.ctx) ? S.live.ctx : (a.session ? (a.ctx || 0) : 0); }
function liveCtx(){ const a = S && S.config && agentOf(S.config.agent); if(!a) return ''; const used = ctxNow(a); return used ? ` · ${tr('kontekst')} ${Math.min(100, Math.round(used / winOf(a) * 100))}%` : ''; }
function ctxRender(){ const a = agentOf(cur), b = $('ctxBtn'); if(!a) return; const max = winOf(a), used = ctxNow(a), share = Math.min(1, used/max), C = 2*Math.PI*6;
  b.innerHTML = `<svg viewBox="0 0 16 16" width="15" height="15"><circle cx="8" cy="8" r="6" fill="none" stroke="var(--s3)" stroke-width="2"/><circle cx="8" cy="8" r="6" fill="none" stroke="${share > .8 ? 'var(--bad)' : 'var(--accent)'}" stroke-width="2" stroke-linecap="round" stroke-dasharray="${(share*C).toFixed(2)} ${C.toFixed(2)}" transform="rotate(-90 8 8)"/></svg><span>${Math.round(share*100)}%</span>`;
  b.title = `${tr('Kontekst')}: ${big(used)} ${tr('z')} ${big(max)} ${tr('tokenów')}`;
  b.classList.toggle('empty', !used); }
/* ---------- wysuwane okienka: kontekst i użycie ---------- */
let popFor = null;
async function wipeChat(a, body, okText){ const box = $('chat');      // rozmowa znika płynnie, dopiero potem rysuje się pusty czat
  try{ const r = await api('/api/agents', body); box.classList.add('wipe'); await new Promise(done => setTimeout(done, 230));
    if(r.agents) AG = r.agents; delete TH[a.id]; opened.clear(); CP.run = null; CP.file = null; CP.sig = {}; await poll(); redraw(); box.scrollTop = 0; box.classList.remove('wipe'); toast(okText); }
  catch(err){ box.classList.remove('wipe'); toast(err.message, true); } }
function popOpen(kind, anchor, html, side){ const p = $('pop'), r = anchor.getBoundingClientRect(); popFor = kind; p.innerHTML = html; p.hidden = false; p.dataset.kind = kind;
  p.style.bottom = (innerHeight - r.top + 8) + 'px'; p.style.left = side === 'left' ? r.left + 'px' : 'auto'; p.style.right = side === 'right' ? Math.max(8, innerWidth - r.right) + 'px' : 'auto';
  p.style.transformOrigin = side === 'left' ? 'bottom left' : 'bottom right'; p.style.maxHeight = ''; p.style.overflowY = '';
  const room = r.top - 16; if(p.offsetHeight > room){ p.style.maxHeight = Math.max(160, room) + 'px'; p.style.overflowY = 'auto'; }      // okienko nie wychodzi nad górną krawędź
  requestAnimationFrame(() => p.classList.add('open')); }
/* rozwijane listy: gdy nie mieszczą się pod przyciskiem, otwierają się nad nim, a zbyt wysokie przewijają się w środku */
function fitMenus(){ document.querySelectorAll('.dd.open > .ddmenu').forEach(m => { if(m.classList.contains('mp')) return; m.style.top = ''; m.style.bottom = ''; m.style.maxHeight = ''; m.style.overflowY = '';
    const host = m.parentElement.getBoundingClientRect(), r = m.getBoundingClientRect(), below = innerHeight - host.bottom - 14, above = host.top - 14;
    if(r.bottom <= innerHeight - 8 && r.top >= 8) return;
    if(r.top < 8){ m.style.maxHeight = Math.max(140, r.height + r.top - 8) + 'px'; m.style.overflowY = 'auto'; return; }
    if(above > below){ m.style.top = 'auto'; m.style.bottom = 'calc(100% + 6px)'; if(r.height > above){ m.style.maxHeight = above + 'px'; m.style.overflowY = 'auto'; } }
    else { m.style.maxHeight = Math.max(140, below) + 'px'; m.style.overflowY = 'auto'; } }); }
document.addEventListener('click', () => setTimeout(fitMenus, 0), true); addEventListener('resize', fitMenus);
function popClose(){ const p = $('pop'); popFor = null; p.classList.remove('open'); p.hidden = true; }
document.addEventListener('mousedown', e => { if(popFor && !e.target.closest('#pop') && !e.target.closest('#usageBox') && !e.target.closest('#usageMini') && !e.target.closest('#ctxBtn')) popClose(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && popFor) popClose(); });
const tok = n => n >= 1e6 ? (n/1e6).toLocaleString(loc(), {maximumFractionDigits:2}) + ' ' + tr('mln') : n >= 1e3 ? (n/1e3).toLocaleString(loc(), {maximumFractionDigits:1}) + ' ' + tr('tys.') : String(Math.round(n || 0));
const CTXC = [['sys', 'Prompt systemowy', '#3a6bfc'], ['base', 'Narzędzia', '#8b7cf6'], ['sent', 'Zadania i zasady', '#e5a50a'], ['said', 'Odpowiedzi agenta', '#14a3a3'], ['work', 'Praca na plikach i wyniki narzędzi', '#f0643c']];
function ctxParts(a){ const max = winOf(a), used = Math.min(max, a.session ? (a.ctx || 0) : 0), p = a.ctx_parts || {}, v = {sys:p.sys || 0, base:p.base || 0, sent:p.sent || 0, said:p.said || 0};
  if(v.sys + v.base > used){ const k = used/(v.sys + v.base || 1); v.sys *= k; v.base *= k; }
  const room = used - v.sys - v.base; if(v.sent + v.said > room){ const k = room/(v.sent + v.said || 1); v.sent *= k; v.said *= k; }
  v.work = Math.max(0, used - v.sys - v.base - v.sent - v.said); return {max, used, v}; }
function ctxPop(){ const a = agentOf(cur); if(!a) return; const {max, used, v} = ctxParts(a), pct = n => (n/max*100).toFixed(2);
  popOpen('ctx', $('ctxBtn'), `<div class="pophead"><b>${tr('Kontekst')}</b><span>${tr('Zapełniono')} ${Math.round(used/max*100)}%</span></div>`
    + `<div class="cbar">${CTXC.map(c => v[c[0]] > 0 ? `<i style="width:${pct(v[c[0]])}%;background:${c[2]}"></i>` : '').join('')}</div>`
    + `<div class="popsub">${tr('Szacunkowo')}: ${tok(used)} ${tr('z')} ${tok(max)} ${tr('tokenów')}</div>`
    + CTXC.map(c => `<div class="crow"><i style="background:${c[2]}"></i><span>${tr(c[1])}</span><b>${tok(v[c[0]])}</b></div>`).join('')
    + `<div class="crow"><i class="free"></i><span>${tr('Wolne miejsce')}</span><b>${tok(max - used)}</b></div>`
    + `<p class="popnote">${tr(used ? 'Łączna liczba pochodzi z ostatniej odpowiedzi modelu. Podział na części jest szacunkiem. Gdy kontekst zapełni się w 85%, LumoBot sam go kompaktuje: agent zaczyna nową rozmowę od streszczenia dotychczasowej pracy.' : 'Kontekst jest pusty. Agent zacznie od czystej karty.')}</p>`
    + `<button type="button" class="popbtn" data-compact ${used ? '' : 'disabled'}><svg viewBox="0 0 16 16" width="15" height="15"><path d="M4 2.500l4 3.500 4-3.500M4 13.500l4-3.500 4 3.500M2.500 8h11" fill="none" stroke="currentColor" stroke-width="1.300" stroke-linecap="round" stroke-linejoin="round"/></svg>${tr('Kompaktuj teraz')}</button>`
    + `<button type="button" class="popbtn" data-newchat ${used || (TH[a.id] || []).length ? '' : 'disabled'}><svg viewBox="0 0 16 16" width="15" height="15"><path d="M8 2.300c3.300 0 5.900 2.300 5.900 5.200s-2.600 5.200-5.900 5.200c-.700 0-1.300-.100-1.900-.300L3 13.600l.700-2.500C2.700 10.200 2.100 8.900 2.100 7.500c0-2.900 2.600-5.200 5.900-5.200zM8 5.500v4M6 7.500h4" fill="none" stroke="currentColor" stroke-width="1.300" stroke-linecap="round" stroke-linejoin="round"/></svg>${tr('Nowy czat')}</button>`, 'right'); }
$('ctxBtn').addEventListener('click', () => popFor === 'ctx' ? popClose() : ctxPop());
$('pop').addEventListener('click', async e => {
  if(e.target.closest('[data-compact]')){ const a = agentOf(cur); popClose();
    try{ const r = await api('/api/agents', {compact:a.id}); if(r.agents) AG = r.agents; await poll(); redraw();
      toast(S && S.running && S.config && S.config.agent === a.id ? 'Kontekst zostanie skompaktowany przed następną rundą agenta.' : 'Kontekst skompaktowany. Następne zadanie zacznie się od streszczenia.'); }
    catch(err){ toast(err.message, true); } return; }
  if(e.target.closest('[data-newchat]')){ const a = agentOf(cur); popClose();
    await wipeChat(a, {reset:a.id}, 'Nowy czat. Poprzednia rozmowa jest w archiwum.'); return; }
  const up = e.target.closest('[data-up]'); if(up){ try{ localStorage.setItem('lumobot-usep', up.dataset.up); }catch(err){} drawUsage(); usePop(); return; }
  if(e.target.closest('[data-stats]')){ popClose(); SETCAT = 1; show('ustawienia'); setDraw(); } });

/* ---------- wybór modelu i mocy w polu pisania ---------- */
const EFF = [['', 'Domyślna'], ['low', 'Niska'], ['medium', 'Średnia'], ['high', 'Wysoka', 'Zalecana'], ['xhigh', 'Extra'], ['max', 'Maksymalna']];
const modelName = id => { const m = MODELS.models.find(x => x.id === id); return m ? m.name : String(id || '').replace(/^claude-/, '').replace(/-(\d+)-(\d+)$/, ' $1.$2').replace(/^./, c => c.toUpperCase()); };
/* agent od obrazów pracuje: w rozmowie widać żywe płótno, na którym powstaje obraz; gotowy obraz wjeżdża z rozmycia */
const SPARK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.500l1.900 5.600 5.600 1.900-5.600 1.900L12 17.500l-1.900-5.600-5.600-1.900 5.600-1.900zM19 15.500l.9 2.600 2.600.9-2.600.9-.9 2.600-.9-2.600-2.600-.9 2.600-.9z"/></svg>';
function drawImgMake(){ const box = $('chat'), a = agentOf(cur); let host = box.querySelector(':scope > .imgmake');
  const busy = id => !!(S && S.running && ((S.config && S.config.agent === id) || (S.team || []).some(t => t.to === id && t.state === 'run')));
  const artist = a && tab === 'agent' ? (a.kind === 'image' && busy(a.id) ? a : (S && S.running && S.config && S.config.agent === a.id ? AG.find(x => x.kind === 'image' && (S.team || []).some(t => t.to === x.id && t.state === 'run')) : null)) : null;
  const ready = artist && (S.shots || []).some(x => /^obraz/.test(x.target || '') && x.round === S.round);      // obraz z tej rundy już jest w rozmowie: płótno znika
  if(!artist || ready){ if(host) host.remove(); return; }
  if(!host){ const near = box.scrollHeight - box.scrollTop - box.clientHeight < 160; host = document.createElement('div'); host.className = 'imgmake';
    host.innerHTML = `<div class="imcanvas"><i></i><i></i><i></i>${SPARK}</div><div class="imcap"><b></b></div>`; box.appendChild(host); if(near) box.scrollTop = box.scrollHeight; }
  else if(host !== box.lastElementChild) box.appendChild(host);
  host.style.setProperty('--ac', artist.color); host.querySelector('b').textContent = artist.id === a.id ? tr('Tworzę obraz') : `${artist.name}: ${tr('tworzy obraz')}`; }
function drawIncoming(){ const box = $('chat'), a = agentOf(cur); if(!a || tab !== 'agent') return; let host = box.querySelector(':scope > .incoming');
  const L = ((S && S.team) || []).filter(x => x.to === a.id && (x.state === 'run' || (S && S.running)));
  if(!L.length){ if(host) host.remove(); return; }
  const html = L.map(x => { const from = x.order ? null : agentOf(x.from), run = x.state === 'run', who = from ? esc(from.name) : tr('Ty');
    return `<div class="incard2${run ? ' live' : ''}${x.failed ? ' bad' : ''}"><div class="inc2head">${from ? face(from, 22) : ''}<b>${who}</b><span>${tr(x.work ? 'zlecił ci pracę' : 'zadał ci pytanie')}</span><i class="inc2st">${run ? '<em class="dotsrow"><i></i><i></i><i></i></em>' + tr('pracujesz nad tym') : x.failed ? tr('przerwane') : tr('zrobione')}</i></div><p>${esc((x.q || '').slice(0, 240))}</p>${!run && x.a ? `<div class="inc2a">${esc(String(x.a).slice(0, 240))}</div>` : ''}</div>`; }).join('');
  if(!host){ host = document.createElement('div'); host.className = 'incoming'; box.appendChild(host); }
  if(host.dataset.h !== html){ const near = box.scrollHeight - box.scrollTop - box.clientHeight < 140; host.dataset.h = html; host.innerHTML = html; if(near) box.scrollTop = box.scrollHeight; } }
const PK = {p:'', v:'', q:'', cur:''};
/* Część AI podaje ten sam model kilka razy, z mocą w nazwie (…-low, …-medium, …-high). Pokazujemy go raz, a moc wybiera się na dole, jak przy każdym innym AI. */
const EFSUF = /-(minimal|low|medium|high|xhigh|max)$/i, EFORD = ['minimal', 'low', 'medium', 'high', 'xhigh', 'max'];
const EFS = {'':'Auto', minimal:'Min.', low:'Niska', medium:'Średnia', high:'Wysoka', xhigh:'Extra', max:'Maks.'}, EFL = {'':'Domyślna', minimal:'Minimalna', low:'Niska', medium:'Średnia', high:'Wysoka', xhigh:'Extra', max:'Maksymalna'};
const EFBY = {claude:['', 'low', 'medium', 'high', 'xhigh', 'max'], openai:['', 'low', 'medium', 'high', 'xhigh'], opencode:['', 'low', 'medium', 'high', 'max']};      // poziomy, które dane AI naprawdę przyjmuje
const mbase = id => String(id || '').replace(EFSUF, ''), mlevel = id => { const m = EFSUF.exec(String(id || '')); return m ? m[1].toLowerCase() : ''; };
const msort = g => g.sort((p, q) => EFORD.indexOf(mlevel(p.id)) - EFORD.indexOf(mlevel(q.id)));
function variants(id){ const me = MODELS.models.find(x => x.id === id); if(!me || !mlevel(id)) return null; const base = mbase(id);
  if(MODELS.models.some(x => x.id === base)) return null;      // „…-max” obok zwykłego modelu to osobny model, a nie poziom mocy
  const g = MODELS.models.filter(x => x.provider === me.provider && mlevel(x.id) && mbase(x.id) === base && (x.available || x.id === id)); return g.length > 1 ? msort(g) : null; }
function pickLabel(a){ const m = MODELS.models.find(x => x.id === (a.model || '')) || MODELS.models[0] || {name:'', id:''}, g = variants(m.id), lv = g ? mlevel(m.id) : (a.effort || ''); return tr(g ? m.name.replace(EFSUF, '') : m.name) + (lv ? ` · ${tr(EFL[lv] || lv)}` : ''); }
function effHtml(a){ const g = variants(a.model || ''), levels = g ? null : EFBY[providerOf(a)];
  const head = `<div class="mpefft"><b>${tr('Moc')}</b><span>${tr(g || levels ? 'Większa moc to dłuższe myślenie i szybsze zużycie limitu.' : 'Ten model nie ma wyboru mocy.')}</span></div>`;
  if(g) return head + `<div class="mpseg">${g.map(x => { const lv = mlevel(x.id); return `<button type="button" class="${x.id === a.model ? 'on' : ''}" data-ev="${esc(x.id)}" title="${tr(EFL[lv])}">${tr(EFS[lv])}</button>`; }).join('')}</div>`;
  if(!levels) return head;
  return head + `<div class="mpseg">${levels.map(lv => `<button type="button" class="${lv === (a.effort || '') ? 'on' : ''}" data-e="${lv}" title="${tr(EFL[lv])}${lv === 'high' ? ' · ' + tr('Zalecana') : ''}">${tr(EFS[lv])}</button>`).join('')}</div>`; }
const liteKey = a => [a.id, a.model, a.effort, a.ctx, a.name, LANG, MODELS.models.length, MODELS.checked, TPL.length].join('|');
/* zmianę modelu albo mocy widać od razu: najpierw ekran, zapis idzie w tle */
let patchSeq = 0;
function patchNow(a, patch){ const me = agentOf(a.id); if(!me) return; const before = {model:me.model, effort:me.effort}, seq = ++patchSeq; Object.assign(me, patch); drawnLite = liteKey(me); renderAgents(); headBadge(); pickSoft(); ctxRender();
  api('/api/agents', {...me}).then(r => { if(seq !== patchSeq) return; AG = r.agents; const got = agentOf(me.id); if(got && (got.model !== me.model || got.effort !== me.effort)){ drawnLite = liteKey(got); renderAgents(); headBadge(); pickSoft(); ctxRender(); } })
    .catch(err => { if(seq === patchSeq){ Object.assign(me, before); drawnLite = ''; renderAgents(); headBadge(); pickSoft(); } toast(err.message, true); }); }
function pickSoft(){ const host = $('modelPick'), a = agentOf(cur); if(!a || !host.querySelector('.ddmenu')) return pickRender(host.classList.contains('open'));
  const btn = host.querySelector('.ddbtn'), sp = btn && btn.querySelector('span'), ic = btn && btn.querySelector('.aiico'), base = variants(a.model || '') ? mbase(a.model) : '';
  if(sp) sp.textContent = pickLabel(a); if(ic) ic.outerHTML = aiIcon(providerOf(a), 15);
  host.querySelectorAll('.mprow').forEach(b => b.classList.toggle('on', b.dataset.g ? b.dataset.g === base : b.dataset.m === (a.model || '')));
  const ef = host.querySelector('.mpeff'), eh = effHtml(a); if(ef && ef.dataset.h !== eh){ ef.dataset.h = eh; ef.innerHTML = eh; } }
function pickRender(keep){ const host = $('modelPick'), a = agentOf(cur); if(!a) return; const m = MODELS.models.find(x => x.id === (a.model || '')) || MODELS.models[0] || {name:''};
  const shown = MODELS.models.filter(x => x.available || (x.provider === 'claude' && !MODELS.checked));
  const vendorOf = x => x.provider === 'opencode' && x.name.includes('/') ? x.name.split('/')[0] : '', VN = {'opencode':'Free', 'opencode-go':'Go', 'anthropic':'Anthropic', 'openai':'OpenAI', 'google':'Google'}, vname = v => VN[v] || v.replace(/^./, c => c.toUpperCase());
  const pids = withModels().filter(pid => shown.some(x => x.provider === pid) && (a.kind !== 'image' || imageOnly().includes(pid))), cp = providerOf(a);
  if(!pids.includes(PK.p) || PK.cur !== a.id){ PK.cur = a.id; PK.p = pids.includes(cp) ? cp : pids[0]; PK.v = vendorOf(m); PK.q = ''; }
  const all = shown.filter(x => x.provider === PK.p), G = {}; all.forEach(x => { if(mlevel(x.id)) (G[mbase(x.id)] = G[mbase(x.id)] || []).push(x); });
  Object.keys(G).forEach(b => { if(G[b].length < 2 || all.some(x => x.id === b)) delete G[b]; else msort(G[b]); });
  const gof = x => mlevel(x.id) && G[mbase(x.id)] ? mbase(x.id) : '', uniq = L => { const seen = new Set(); return L.filter(x => { const g = gof(x); if(!g) return true; if(seen.has(g)) return false; seen.add(g); return true; }); };
  const list = uniq(all), cnts = {}, curBase = variants(a.model || '') ? mbase(a.model) : ''; list.forEach(x => { const v = vendorOf(x); if(v) cnts[v] = (cnts[v] || 0) + 1; });
  const major = Object.keys(cnts).filter(v => cnts[v] >= 3).sort((p, q) => cnts[q] - cnts[p]).slice(0, 7), minor = Object.keys(cnts).filter(v => !major.includes(v)), vendors = major.concat(minor.length ? ['*'] : []), inV = x => PK.v === '*' ? minor.includes(vendorOf(x)) : vendorOf(x) === PK.v;
  if(PK.v && !vendors.includes(PK.v)) PK.v = minor.includes(PK.v) ? '*' : '';
  const mrow = x => { const g = gof(x), raw = g ? x.name.replace(EFSUF, '') : x.name, nm = vendorOf(x) && PK.v && PK.v !== '*' ? raw.split('/').slice(1).join('/') : raw, free = /-free$/.test(nm), clean = free ? nm.replace(/-free$/, '') : nm, on = g ? g === curBase : x.id === (a.model || '');
    return `<button type="button" class="mprow${on ? ' on' : ''}" data-m="${x.id}"${g ? ` data-g="${esc(g)}"` : ''} ${x.available ? '' : 'disabled'}><span class="mpn">${esc(tr(clean))}</span>${free ? '<em class="mpfree">free</em>' : ''}${x.window ? `<em class="mpwin">${tok(x.window)}</em>` : ''}${CHECK}</button>`; };
  const body = () => { const q = PK.q.trim().toLowerCase(), L = list.filter(x => (!PK.v || inV(x)) && (!q || x.name.toLowerCase().includes(q) || tr(x.name).toLowerCase().includes(q)));
    if(!L.length) return `<div class="mpnone">${tr('Brak pasujących modeli')}</div>`;
    const base = L.filter(x => !x.more), more = L.filter(x => x.more); return base.map(mrow).join('') + (more.length ? `<div class="ddlabel sub">${tr('Więcej modeli')}</div>` + more.map(mrow).join('') : ''); };
  const eh = effHtml(a);
  const menu = `<div class="ddmenu mp"><div class="mpside">${pids.map(pid => `<button type="button" class="mpp${pid === PK.p ? ' on' : ''}" data-pp="${pid}">${aiIcon(pid, 16)}<span>${esc(pname(pid))}</span></button>`).join('')}</div>`
    + `<div class="mpmain">${vendors.length ? `<div class="mpvend"><button type="button" class="${PK.v ? '' : 'on'}" data-pv="">${tr('Wszystkie')}<b>${list.length}</b></button>${vendors.map(v => `<button type="button" class="${PK.v === v ? 'on' : ''}" data-pv="${esc(v)}">${v === '*' ? tr('Inne') : esc(vname(v))}<b>${v === '*' ? minor.reduce((n, k) => n + cnts[k], 0) : cnts[v]}</b></button>`).join('')}</div>` : ''}`
    + (list.length > 8 ? `<input class="mpq" type="text" placeholder="${tr('Szukaj modelu')}" value="${esc(PK.q)}" spellcheck="false" autocomplete="off">` : '') + `<div class="mplist">${body()}</div></div>`
    + `<div class="mpeff">${eh}</div></div>`;
  host.innerHTML = `<button type="button" class="ddbtn">${aiIcon(providerOf(a), 15)}<span>${pickLabel(a)}</span><svg class="cv" viewBox="0 0 12 12" width="11" height="11"><path d="M3 4.5 6 7.500 9 4.5" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` + menu;
  host.querySelector('.mpeff').dataset.h = eh;
  const q = host.querySelector('.mpq'); if(q) q.addEventListener('input', () => { PK.q = q.value; host.querySelector('.mplist').innerHTML = body(); });
  host.classList.toggle('open', !!keep);
  host.onclick = e => { const it = e.target.closest('[data-m]'), ef = e.target.closest('[data-e]'), ev = e.target.closest('[data-ev]'), pp = e.target.closest('[data-pp]'), pv = e.target.closest('[data-pv]'), me = agentOf(cur);
    if(pp || pv || it || ef || ev) e.stopPropagation();      // kliknięty przycisk bywa podmieniany, a wtedy lista zamknęłaby się sama
    if(pp){ PK.p = pp.dataset.pp; PK.v = ''; PK.q = ''; pickRender(true); return; }
    if(pv){ PK.v = pv.dataset.pv; pickRender(true); return; }
    if(!me) return;
    if(it && !it.disabled){ let id = it.dataset.m; const g = it.dataset.g ? G[it.dataset.g] || [] : null;
      if(g){ const want = variants(me.model || '') ? mlevel(me.model) : (me.effort || ''); id = (g.find(x => mlevel(x.id) === want) || g.find(x => mlevel(x.id) === 'medium') || g.find(x => mlevel(x.id) === 'high') || g[0] || {id}).id; }      // ten sam poziom mocy co dotąd, jeśli model go ma
      const keepEff = !g && (EFBY[providerOf({model:id})] || []).includes(me.effort || '');
      patchNow(me, {model:id, effort:keepEff ? (me.effort || '') : ''}); return; }
    if(ev){ patchNow(me, {model:ev.dataset.ev, effort:''}); return; }
    if(ef){ patchNow(me, {effort:ef.dataset.e}); return; }
    if(e.target.closest('.ddbtn')){ const was = host.classList.contains('open'); document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open')); host.classList.toggle('open', !was); } };
}

$('agents').addEventListener('click', e => { if(Date.now() - DRAGGED < 300) return; const it = e.target.closest('.agent'); if(!it) return; if(it.dataset.team){ opened.clear(); show('team'); loadTeam(); return; } cur = it.dataset.id; opened.clear(); if(!(S && S.running && CP.run === S.id)) CP.run = null; show('agent'); });
$('addAgent').addEventListener('click', () => openMaker(null));
let liveBusy = false;
async function loadUsage(){ try{ USE = await api('/api/usage'); }catch(e){ return; } drawUsage(); useLive();
  // na bieżąco: gdy okno jest widoczne, a dane starsze niż 5 minut, pytamy Claude o świeży stan
  const old = !USE.limits || Date.now() - USE.limits.at > 5*60000;
  if(old && !liveBusy && !document.hidden && S && S.agent && !S.running && S.defaults.usage_live){ liveBusy = true;
    try{ USE = await api('/api/usage/refresh', {}); drawUsage(); useLive(); }catch(e){} liveBusy = false; } }
document.addEventListener('visibilitychange', () => { if(!document.hidden) loadUsage(); });
const left = ms => { const m = Math.max(0, Math.round((ms - Date.now())/60000)); return m >= 1440 ? `${Math.floor(m/1440)} d ${Math.round(m%1440/60)} ${tr('godz.')}` : m >= 60 ? `${Math.floor(m/60)} ${tr('godz.')} ${m%60} min` : `${m} min`; };
const money = v => '$' + (v || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
const useList = () => MODELS.providers.filter(p => p.connected);
const usePid = () => { const c = useList().map(p => p.id), saved = new URLSearchParams(location.search).get('usep') || localStorage.getItem('lumobot-usep'), a = agentOf(cur), mine = a ? providerOf(a) : ''; return c.includes(saved) ? saved : c.includes(mine) ? mine : c[0] || 'claude'; };
const useAt = ms => { const d = new Date(ms), same = d.toDateString() === new Date().toDateString(); return (same ? '' : d.toLocaleDateString(loc(), {weekday:'short'}) + ' ') + clock(ms); };
const useRow = (k, w) => w ? `<div class="ulim"><div><span>${tr(k)}</span><em>${tr('do')} ${useAt(w.resets)}</em><b>${Math.round(w.used*100)}%</b></div><u><i class="${w.used > .9 ? 'hot' : ''}" style="width:${Math.min(100, w.used*100)}%"></i></u></div>` : '';
const NONE = {cost:0, tokens:0, rounds:0};
const useWhole = B => !!(B.today && B.today.all != null);
function useTable(pid){ const B = (USE.by || {})[pid] || {}, whole = useWhole(B), price = x => whole ? (x.all_cost || pid === 'claude' ? money(x.all_cost) : '·') : x.cost || pid === 'opencode' || pid === 'claude' ? money(x.cost) : '·';
  const line = (k, x) => `<div class="urow"><span>${tr(k)}</span><b>${tok(whole ? x.all : x.tokens)}</b><b>${whole ? tok(Math.max(0, x.tokens - (x.legacy || 0))) : x.rounds}</b><b>${price(x)}</b></div>`;
  return `<div class="urow head"><span>${tr('Okres')}</span><b>${tr('Tokeny')}</b><b>${whole ? 'LumoBot' : tr('Rundy')}</b><b>${tr('Koszt')}</b></div>${line('Dziś', B.today || NONE)}${line('5 godzin', B.h5 || NONE)}${line('7 dni', B.d7 || NONE)}`; }
function useLims(pid){ const L = (USE.limits_by || {})[pid], W = L && L.windows; return W ? `${useRow('Limit 5 godzin', W.five_hour)}${useRow('Tydzień', W.seven_day)}<small>${tr('Limit całego konta, stan z')} ${clock(L.at)}</small>` : ''; }
const USEP = {sig:'', tab:'', lims:''};
const useSig = pid => { const B = (USE.by || {})[pid] || {}; return pid + useWhole(B) + USE.meter + (((B.d7 || {}).legacy || 0) > 0); };
function usePop(){ if(!USE) return; const pid = usePid(), B = (USE.by || {})[pid] || {}, list = useList(), whole = useWhole(B), wait = (pid === 'claude' || pid === 'openai') && !whole && USE.meter === false;
  const note = whole ? (pid === 'claude' ? 'Tokeny i koszt to cała praca Claude Code na tym komputerze, także poza LumoBotem. Koszt to szacunek według cennika API, w subskrypcji nie płacisz go osobno.' : 'Tokeny to cała praca Codexa na tym komputerze, także poza LumoBotem, bez pamięci podręcznej. ChatGPT w subskrypcji nie podaje ceny.')
    : pid === 'claude' ? 'USD to wartość tej pracy według cennika API. W subskrypcji nie płacisz jej osobno.' : pid === 'openai' ? 'ChatGPT w subskrypcji nie podaje ceny, dlatego widzisz tokeny i limit.' : pid === 'opencode' ? 'Koszt podaje OpenCode. Darmowe modele mają 0.' : 'Ten dostawca nie podaje ceny w odpowiedzi. Koszt sprawdzisz w jego panelu.';
  USEP.sig = useSig(pid); USEP.tab = useTable(pid); USEP.lims = useLims(pid);
  popOpen('use', document.body.classList.contains('rail') ? $('usageMini') : $('usageBox'), `<div class="pophead"><b>${tr('Użycie')}</b><span>${tr(whole ? 'cały komputer' : 'tylko praca w LumoBocie')}</span></div>`
    + `<div class="useg">${list.map(p => `<button type="button" data-up="${p.id}" class="${p.id === pid ? 'on' : ''}">${aiIcon(p.id, 15)}<span>${esc(pname(p.id))}</span></button>`).join('')}</div>`
    + `<div class="ulims" id="useLims"${USEP.lims ? '' : ' hidden'}>${USEP.lims}</div>`
    + `<div class="utab" id="useTab">${USEP.tab}</div>`
    + (wait ? `<p class="popnote">${tr('Liczę użycie z całego komputera. Pierwszy raz potrwa chwilę.')}</p>` : '')
    + (!whole && ((B.d7 || {}).legacy || 0) > 0 ? `<p class="popnote">${tr('Starsze zadania liczyły też pamięć podręczną modelu, dlatego ich tokeny są zawyżone. Nowe zadania liczą tylko świeże tokeny.')}</p>` : '')
    + `<p class="popnote">${tr(note)}</p><button type="button" class="popbtn" data-stats><svg viewBox="0 0 16 16" width="15" height="15"><path d="M3 13V8.500M8 13V3M13 13V6.200" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round"/></svg>${tr('Pełne statystyki')}</button>`, 'left'); }
/* otwarte okienko użycia odświeża się na bieżąco: podmienia same liczby, bez zamykania i bez animacji */
function useLive(){ if(popFor !== 'use' || !USE) return; const pid = usePid(); if(useSig(pid) !== USEP.sig) return usePop();
  const tab = useTable(pid), lims = useLims(pid), t = $('useTab'), l = $('useLims');
  if(t && tab !== USEP.tab){ USEP.tab = tab; t.innerHTML = tab; } if(l && lims !== USEP.lims){ USEP.lims = lims; l.innerHTML = lims; l.hidden = !lims; } }
$('usageBox').addEventListener('click', e => { const up = e.target.closest('[data-up]');
  if(up){ try{ localStorage.setItem('lumobot-usep', up.dataset.up); }catch(err){} drawUsage(); if(popFor === 'use') usePop(); return; }
  popFor === 'use' ? popClose() : usePop(); });
$('usageMini').addEventListener('click', () => popFor === 'use' ? popClose() : usePop());
function drawUsage(){ if(!USE) return; { const p0 = usePid(), L0 = (USE.limits_by || {})[p0], w0 = L0 && L0.windows && L0.windows.five_hour; softSet('usageMini').html = aiIcon(p0, 18) + (w0 ? `<u><i class="${w0.used > .9 ? 'hot' : ''}" style="width:${Math.min(100, w0.used*100)}%"></i></u>` : ''); } const pid = usePid(), list = useList(), L = (USE.limits_by || {})[pid], W = L && L.windows, B = (USE.by || {})[pid] || {}, T = B.today || NONE, D = B.d7 || NONE;
  const mini = (k, x) => `<div class="umini"><span>${tr(k)}</span><b>${tok(x.all != null ? x.all : x.tokens)} ${tr('tok.')}</b>${x.cost ? `<em>${money(x.cost)}</em>` : ''}</div>`;
  softSet('usageBox').html = (list.length > 1 ? `<div class="uchips">${list.map(p => `<button type="button" data-up="${p.id}" class="${p.id === pid ? 'on' : ''}" title="${esc(pname(p.id))}">${aiIcon(p.id, 15)}</button>`).join('')}</div>` : '')
    + `<div class="who">${list.length > 1 ? '' : aiIcon(pid, 18)}${esc(pname(pid))}<small>${(T.all != null ? T.all : T.tokens) ? `${tr('dziś')} ${tok(T.all != null ? T.all : T.tokens)}` : ''}</small></div>`
    + (W ? useRow('Limit 5 godzin', W.five_hour) + useRow('Tydzień', W.seven_day) : mini('Dziś', T) + mini('7 dni', D));
  const CL = (USE.limits_by || {}).claude || USE.limits, CW = CL && CL.windows, h5 = CW && CW.five_hour, d7 = CW && CW.seven_day;
  if(!$('tab-ustawienia').hidden){ const card = (k, w, mine) => `<div class="ucard"><div class="k">${aiIcon('claude', 18)}Claude · ${tr(k)}</div><div class="v">${w ? Math.round(w.used*100) + '%' : tr('brak danych')}</div>`
      + `<div class="d">${w ? `${tr('odnowi się za')} ${left(w.resets)} · ` : ''}LumoBot: ${mine.rounds} ${tr('rund')}, ${big(mine.tokens)} ${tr('tokenów')}</div><u><i class="${w && w.used > .9 ? 'hot' : ''}" style="width:${w ? Math.min(100, w.used*100) : 0}%"></i></u></div>`;
    $('usageBig').innerHTML = card('okno 5 godzin', h5, USE.h5) + card('tydzień', d7, USE.d7);
    $('usageNote').textContent = CL ? `${tr('Zużycie limitu twojej subskrypcji według ostatniej odpowiedzi Claude, stan z')} ${clock(CL.at)}. ${tr('Liczy się tu wszystko, co robisz na tym koncie, nie tylko LumoBot.')}` : tr('Zużycie pokaże się po pierwszym zadaniu albo po kliknięciu Odśwież.'); }
}
$('usageRefresh').addEventListener('click', async () => { const b = $('usageRefresh'); b.disabled = true;
  try{ USE = await api('/api/usage/refresh', {}); drawUsage(); }catch(err){ toast(err.message, true); } b.disabled = false; });

/* ---------- podgląd zmian w plikach: liczony przez LumoBota, taki sam przy każdym AI ---------- */
const KIND = {new:'nowy', mod:'zmieniony', del:'usunięty'};
const CP = {run:null, file:null, closedFor:null, sig:{}};
/* ---------- kolorowanie składni: lekkie, wiersz po wierszu, bez bibliotek ---------- */
const HLW = {js:'const let var function return if else for while do switch case break continue new class extends import from export default async await try catch finally throw typeof instanceof in of this null undefined true false void delete yield static get set super',
  py:'def class return if elif else for while import from as try except finally raise with lambda pass break continue and or not in is None True False global nonlocal yield async await assert del self',
  sh:'if then else elif fi for in do done while case esac function return exit echo export local set cd param foreach switch try catch finally throw',
  c:'int long short char float double void bool string var let const static public private protected class struct enum interface namespace using import package func fn return if else for while do switch case break continue new try catch finally throw null nil true false this self async await type impl pub mut use mod match'};
const HLEXT = {js:'js', mjs:'js', cjs:'js', ts:'js', tsx:'js', jsx:'js', json:'js', py:'py', pyw:'py', ps1:'sh', sh:'sh', bash:'sh', bat:'sh', cmd:'sh', yml:'sh', yaml:'sh', toml:'sh', ini:'sh',
  css:'css', scss:'css', less:'css', html:'html', htm:'html', xml:'html', svg:'html', vue:'html', md:'md', java:'c', c:'c', h:'c', cpp:'c', cs:'c', go:'c', rs:'c', php:'c', kt:'c', swift:'c', sql:'c'};
const HLRE = {}, HLSET = {};
function hlRe(lang){ if(HLRE[lang]) return HLRE[lang]; const str = '"(?:\\\\.|[^"\\\\])*"?|\'(?:\\\\.|[^\'\\\\])*\'?|`(?:\\\\.|[^`\\\\])*`?', num = '\\b(?:0x[\\da-f]+|\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\b';
  const src = lang === 'css' ? `(\\/\\*.*?(?:\\*\\/|$))|(${str})|(#[\\da-fA-F]{3,8}\\b|-?\\b\\d+(?:\\.\\d+)?(?:px|rem|em|vh|vw|%|s|ms|deg|fr)?\\b)|(@[\\w-]+|!important)|((?:--)?[\\w-]+)(?=\\s*:(?!:))|([.#][A-Za-z_][\\w-]*)`
    : lang === 'html' ? `(<!--.*?(?:-->|$))|(${str})|(<\\/?[\\w:-]+|\\/?>)|([\\w:@.-]+)(?==)`
    : lang === 'md' ? '(^\\s{0,3}#{1,6}\\s.*$)|(`[^`]*`)|(\\*\\*[^*]+\\*\\*)|(^\\s*(?:[-*+]|\\d+\\.)\\s)'
    : `(${lang === 'py' || lang === 'sh' ? '#.*$' : '\\/\\/.*$|\\/\\*.*?(?:\\*\\/|$)'})|(${str})|(${num})|([A-Za-z_$][\\w$]*)(?=\\s*\\()|([A-Za-z_$][\\w$]*)`;
  return HLRE[lang] = new RegExp(src, lang === 'md' ? 'g' : 'gi'); }
function hl(line, path){ const lang = HLEXT[(String(path).split('.').pop() || '').toLowerCase()]; if(!lang || line.length > 4000) return escRaw(line);
  const re = hlRe(lang), words = HLSET[lang] || (HLSET[lang] = new Set((HLW[lang] || '').split(' '))); re.lastIndex = 0; let out = '', at = 0, m;
  const cls = lang === 'css' ? ['hc', 'hs', 'hn', 'hk', 'hp', 'ht'] : lang === 'html' ? ['hc', 'hs', 'ht', 'ha'] : lang === 'md' ? ['hk', 'hs', 'hf', 'hn'] : ['hc', 'hs', 'hn', 'hf', ''];
  while((m = re.exec(line))){ if(!m[0]){ re.lastIndex++; continue; } let k = ''; for(let i = 1; i < m.length; i++) if(m[i] !== undefined){ k = cls[i - 1]; break; }
    if((k === 'hf' || k === '') && lang !== 'md' && lang !== 'css' && lang !== 'html' && words.has(m[0])) k = 'hk';
    out += escRaw(line.slice(at, m.index)) + (k ? `<em class="${k}">${escRaw(m[0])}</em>` : escRaw(m[0])); at = m.index + m[0].length; }
  return out + escRaw(line.slice(at)); }
function diffRows(f){ let a = 0, b = 0; return (f.text || '').split('\n').map(l => { const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(l);
    if(m){ a = +m[1]; b = +m[2]; return `<div class="dl hunk"><i></i><i></i><span>${tr('wiersz')} ${b || 1}</span></div>`; }
    const c = l[0], t = hl(l.slice(1), f.path) || ' ';
    return c === '+' ? `<div class="dl add"><i></i><i>${b++}</i><span>${t}</span></div>` : c === '-' ? `<div class="dl del"><i>${a++}</i><i></i><span>${t}</span></div>` : `<div class="dl"><i>${a++}</i><i>${b++}</i><span>${t}</span></div>`; }).join(''); }
function drawCode(d, live){ const pane = $('codePane'), D = d && d.diff || [], on = tab === 'agent' && !!d && D.length > 0;
  document.querySelector('.main').classList.toggle('coding', on); pane.setAttribute('aria-hidden', !on);
  if(!on){ if(!d) CP.run = null; return; }
  const sig = {}; D.forEach(f => sig[f.path] = f.add + ':' + f.rem + ':' + (f.text || '').length);
  const fresh = D.filter(f => CP.sig[f.path] !== undefined && CP.sig[f.path] !== sig[f.path] || (Object.keys(CP.sig).length && CP.sig[f.path] === undefined)).filter(f => f.path !== 'LUMOBOT.md');
  if(live && d.id === S.id && fresh.length) CP.file = fresh[fresh.length - 1].path;          // na żywo: pokazujemy plik, który agent właśnie ruszył
  CP.sig = sig;
  const f = D.find(x => x.path === CP.file) || D.find(x => x.path !== 'LUMOBOT.md') || D[0]; CP.file = f.path;
  const plus = D.reduce((n, x) => n + x.add, 0), minus = D.reduce((n, x) => n + x.rem, 0), keep = pane.querySelector('.cpbody'), top = keep && keep.dataset.path === f.path ? keep.scrollTop : null;
  pane.innerHTML = `<div class="cpgrip" data-cpgrip title="${tr('Przeciągnij, żeby zmienić szerokość')}"></div><div class="cphead"><b>${tr('Zmiany w plikach')}</b>${live && d.id === S.id ? `<span class="cplive"><i></i>${tr('na żywo')}</span>` : ''}<em><u>+${plus}</u><s>−${minus}</s></em><button type="button" class="icon" data-cpclose title="${tr('Zamknij')}"><svg viewBox="0 0 12 12" width="11" height="11"><path d="M2.500 2.500l7 7M9.500 2.500l-7 7" stroke="currentColor" stroke-width="1.300" stroke-linecap="round"/></svg></button></div>`
    + `<div class="cpfiles">${D.map(x => `<button type="button" data-cpf="${esc(x.path)}" class="${x.path === f.path ? 'on' : ''}" title="${esc(x.path)}"><i class="${x.kind}"></i><span>${esc(base(x.path))}</span><u>+${x.add}</u><s>−${x.rem}</s></button>`).join('')}</div>`
    + `<div class="cppath"><span class="dk ${f.kind}">${tr(KIND[f.kind] || '')}</span><b>${esc(f.path)}</b></div>`
    + `<div class="cpbody" data-path="${esc(f.path)}">${f.text ? diffRows(f) : `<div class="dnote">${tr('Plik binarny albo zbyt duży na podgląd.')}</div>`}${f.cut ? `<div class="dnote">${tr('Dalsza część zmian jest ukryta, wierszy')}: ${f.cut}</div>` : ''}</div>`;
  const bodyEl = pane.querySelector('.cpbody'); if(top !== null) bodyEl.scrollTop = top; else if(live){ const last = bodyEl.querySelector('.dl.add:last-of-type') || [...bodyEl.querySelectorAll('.dl.add')].pop(); if(last) last.scrollIntoView({block:'center'}); } }
$('codePane').addEventListener('click', e => { const fbtn = e.target.closest('[data-cpf]');
  if(fbtn){ CP.file = fbtn.dataset.cpf; const k = $('codePane').querySelector('.cpbody'); if(k) k.dataset.path = ''; drawn = ''; render(); return; }
  if(e.target.closest('[data-cpclose]')){ if(S && S.running && CP.run === S.id) CP.closedFor = S.id; CP.run = null; drawn = ''; render(); } });
$('chat').addEventListener('click', async e => { const cf = e.target.closest('[data-cf]'), zoom = e.target.closest('[data-zoom]'), ans = e.target.closest('[data-pick]'), own = e.target.closest('[data-anssend]'), sx = e.target.closest('[data-sx]'), ch = e.target.closest('.edited[data-k]'), cp = e.target.closest('[data-copy]'), un = e.target.closest('[data-undo]');
  const runOf = rid => (TH[cur] || []).concat(S && S.id ? [S] : []).find(d => d.id === rid);
  if(zoom){ e.stopPropagation(); lbOpen(zoom); return; }
  if(ans && !own){ e.stopPropagation(); const k = ans.dataset.k === 'other' ? 'other' : +ans.dataset.k; if(ASEL[ans.dataset.pick] !== k){ ASEL[ans.dataset.pick] = k; const box = $('chat'), top = box.scrollTop, typing = e.target.matches('input'); drawn = ''; await render(); box.scrollTop = top; if(k === 'other'){ const inp = box.querySelector(`[data-own="${ans.dataset.pick}"]`); if(inp) inp.focus(); } } else if(k === 'other' && !e.target.matches('input')){ const inp = ans.querySelector('input'); if(inp) inp.focus(); } return; }
  if(own){ e.stopPropagation(); const key = `${own.dataset.run}:${own.dataset.anssend}`, card = own.closest('.askcard'), sel = ASEL[key] == null ? 0 : ASEL[key], inp = card.querySelector('input');
    if(sel === 'other'){ if(!inp.value.trim()){ inp.focus(); return; } sendAnswer(own.dataset.run, +own.dataset.anssend, inp.value.trim()); }
    else { const run = runOf(own.dataset.run), q = run && (run.asks || [])[+own.dataset.anssend]; if(q) sendAnswer(own.dataset.run, +own.dataset.anssend, q.options[sel]); } return; }
  if(sx){ e.stopPropagation(); const k = sx.dataset.sx; SX.has(k) ? SX.delete(k) : SX.add(k); const box = $('chat'), top = box.scrollTop; drawn = ''; await render(); box.scrollTop = top; return; }
  if(cp){ e.stopPropagation(); const run = runOf(cp.dataset.copy), text = run ? run.config.goal : '';
    try{ await navigator.clipboard.writeText(text); }catch(err){ const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    cp.classList.add('ok'); setTimeout(() => cp.classList.remove('ok'), 1200); toast('Skopiowane.'); return; }
  if(un){ e.stopPropagation(); const run = runOf(un.dataset.undo); if(!run) return;
    const after = (TH[cur] || []).filter(d => (d.started || 0) >= (run.started || 0) && d.id !== S.id), changed = after.reduce((n, d) => n + ((d.undo && !d.undone) ? d.undo : 0), 0), later = after.length - 1;
    const go = async files => { try{ const r = await api('/api/super/rewind', {id:run.id, files}); delete TH[cur]; CP.run = null; AG = await api('/api/agents'); await poll(); redraw(); F.goal.value = r.goal; grow(F.goal); F.goal.focus();
        toast(`${tr('Rozmowa cofnięta do tego polecenia.')}${r.restored ? ` ${tr('Przywrócone pliki')}: ${r.restored}.` : ''}`); }catch(err){ toast(err.message, true); } };
    const r = un.getBoundingClientRect(); ctxMenu(r.left, r.bottom + 6, [
      {label:changed ? `${tr('Cofnij rozmowę i pliki')} (${changed})` : 'Cofnij rozmowę do tego miejsca', raw:!!changed, icon:'undo', run:() => go(!!changed)},
      ...(changed ? [{label:'Cofnij samą rozmowę, pliki zostaw', icon:'undo', run:() => go(false)}] : []),
      {label:'Tylko wstaw polecenie do pola', icon:'edit', run:() => { F.goal.value = run.config.goal; grow(F.goal); F.goal.focus(); }}]); return; }
  if(cf){ e.stopPropagation(); cf.parentNode.querySelectorAll('button').forEach(b => b.disabled = true);
    try{ await api('/api/super/confirm', {answer:cf.dataset.cf}); if(cf.dataset.cf === 'always') AG = await api('/api/agents'); }catch(err){ toast(err.message, true); } setTimeout(poll, 500); return; }
  if(ch){ const id = ch.dataset.k.slice(3), run = runOf(id);
    if(run && (run.diff || []).length){ e.stopPropagation(); if(CP.run === id){ CP.run = null; if(S && S.running && id === S.id) CP.closedFor = id; } else { CP.run = id; CP.file = null; CP.sig = {}; CP.closedFor = null; } drawn = ''; render(); } } }, true);

function diffHtml(D){ return '<div class="diff">' + D.map(f => { let a = 0, b = 0;
    const rows = (f.text || '').split('\n').map(l => { const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(l);
      if(m){ a = +m[1]; b = +m[2]; return `<div class="dl hunk"><i></i><i></i><span>${tr('wiersz')} ${b || 1}</span></div>`; }
      const c = l[0], t = esc(l.slice(1)) || ' ';
      return c === '+' ? `<div class="dl add"><i></i><i>${b++}</i><span>${t}</span></div>` : c === '-' ? `<div class="dl del"><i>${a++}</i><i></i><span>${t}</span></div>` : `<div class="dl"><i>${a++}</i><i>${b++}</i><span>${t}</span></div>`; }).join('');
    return `<div class="dfile"><div class="dhead"><span class="dk ${f.kind}">${tr(KIND[f.kind] || '')}</span><b title="${esc(f.path)}">${esc(f.path)}</b><em><u>+${f.add}</u><s>−${f.rem}</s></em></div>`
      + (f.text ? `<div class="dbody">${rows}</div>` : `<div class="dnote">${tr('Plik binarny albo zbyt duży na podgląd.')}</div>`) + (f.cut ? `<div class="dnote">${tr('Dalsza część zmian jest ukryta, wierszy')}: ${f.cut}</div>` : '') + '</div>'; }).join('') + '</div>'; }

/* ---------- rozmowa ---------- */
/* ---------- załączniki: wklej, przeciągnij albo wybierz; obrazki powiększają się po kliknięciu ---------- */
let ATT = [], liveCtxSeen = -1;
const FILEICO = {video:'M2.500 4h7.500v8H2.500zM10 7l3.500-2v6L10 9', audio:'M6 11.500V4l6-1.500v7.500M6 11.500a1.800 1.800 0 1 1-1.800-1.800M12 10a1.800 1.800 0 1 1-1.800-1.800', file:'M4 2.500h5l3 3v8H4zM9 2.500v3h3'};
const fileIco = k => `<svg viewBox="0 0 16 16" width="15" height="15"><path d="${FILEICO[k] || FILEICO.file}" fill="none" stroke="currentColor" stroke-width="1.300" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/* wskazówka w trakcie pracy: w rozmowie widać sam tekst użytkownika, a załączniki jako miniatury pod nim (agent dostaje pełny tekst ze ścieżkami) */
function noteHtml(x, folder){ let t = x.show != null ? x.show : String(x.text || ''), extra = '';
  if(x.show == null){ const i = t.indexOf('ZAŁĄCZNIKI do tej wskazówki'); if(i >= 0){ const tail = t.slice(i); t = t.slice(0, i).trim(); if(t === 'Obejrzyj załączone pliki i uwzględnij je w pracy.') t = '';
      const rows = [...tail.matchAll(/^- (.+?) \(([^)]*)\)\s*$/gm)].map(m => ({p:m[1], img:/obraz|image/i.test(m[2])}));
      extra = rows.length ? `<div class="shots">${rows.map(f => { const n = esc(f.p.split(/[\/]/).pop()), u = '/api/imgfile?p=' + encodeURIComponent(f.p) + '&b=' + encodeURIComponent(folder || ''); return f.img ? `<button type="button" class="shot" data-zoom="${u}" data-name="${n}"><img src="${u}" alt="${n}" loading="lazy"></button>` : `<div class="shota"><span>${n}</span></div>`; }).join('')}</div>` : ''; } }
  return `<div class="msg me">${t.trim() ? `<div class="bubble">${esc(t)}</div>` : ''}${filesHtml(x.files)}${extra}</div>`; }
function filesHtml(list){ if(!list || !list.length) return ''; const url = f => '/api/file/' + f.id;
  return `<div class="shots">${list.map(f => f.kind === 'image' ? `<button type="button" class="shot" data-zoom="${url(f)}" data-name="${esc(f.name)}"><img src="${url(f)}" alt="${esc(f.name)}" loading="lazy"></button>`
    : f.kind === 'video' ? `<video class="shotv" src="${url(f)}" controls preload="metadata"></video>`
    : f.kind === 'audio' ? `<div class="shota">${fileIco('audio')}<span>${esc(f.name)}</span><audio src="${url(f)}" controls preload="metadata"></audio></div>`
    : `<a class="shotf" href="${url(f)}" target="_blank" rel="noopener">${fileIco('file')}<span>${esc(f.name)}</span></a>`).join('')}</div>`; }
function drawAttach(){ $('attach').innerHTML = ATT.length ? `<div class="shots tray">${ATT.map((f, i) => `<div class="att${f.busy ? ' busy' : ''}">`
    + (f.kind === 'image' && f.id ? `<button type="button" class="shot" data-zoom="/api/file/${f.id}" data-name="${esc(f.name)}"><img src="/api/file/${f.id}" alt=""></button>` : `<span class="attf">${fileIco(f.kind)}<em>${esc(f.name)}</em></span>`)
    + `<button type="button" class="attx" data-attx="${i}" title="${tr('Usuń')}"><svg viewBox="0 0 12 12" width="9" height="9"><path d="M2.500 2.500l7 7M9.500 2.500l-7 7" stroke="currentColor" stroke-width="1.500" stroke-linecap="round"/></svg></button></div>`).join('')}</div>` : '';
  try{ liveMode(); sendReady(); }catch(e){} }      // ten sam przycisk po prawej pokazuje, czy jest co wysłać
const liveOn = () => !!(S && S.running && !$('liveBar').hidden);
async function addFiles(files){ for(const file of files){ if(ATT.length >= 12){ toast('Do jednego zadania można dodać najwyżej 12 plików.', true); break; }
    const name = !file.name || /^image\.\w+$/.test(file.name) ? `wklejony-${String(Date.now()).slice(-6)}.${(file.type.split('/')[1] || 'png').replace('jpeg', 'jpg')}` : file.name;
    const it = {name, kind:file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file', busy:true}; ATT.push(it); drawAttach();
    try{ const r = await fetch('/api/upload?name=' + encodeURIComponent(name), {method:'POST', body:file}), d = await r.json(); if(!r.ok) throw new Error(tr(d.detail || 'Nie udało się dodać pliku.')); Object.assign(it, d, {busy:false}); }
    catch(err){ ATT = ATT.filter(x => x !== it); toast(err.message, true); } drawAttach(); } (liveOn() ? LB : F.goal).focus(); }
F.goal.addEventListener('paste', e => { const fs = [...((e.clipboardData && e.clipboardData.files) || [])]; if(fs.length){ e.preventDefault(); addFiles(fs); } });
$('fileIn').addEventListener('change', e => { addFiles([...e.target.files]); e.target.value = ''; });
const attClick = e => { const x = e.target.closest('[data-attx]'), z = e.target.closest('[data-zoom]'); if(x){ ATT.splice(+x.dataset.attx, 1); drawAttach(); } else if(z) lbOpen(z); };
$('attach').addEventListener('click', attClick);
(() => { const c = $('composer'), L = $('liveBar'); let depth = 0; const mark = on => { c.classList.toggle('dropping', on); L.classList.toggle('dropping', on); };
  window.addEventListener('dragover', e => { if(e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
  window.addEventListener('drop', e => { if(e.dataTransfer && e.dataTransfer.files.length){ e.preventDefault(); depth = 0; mark(false); if(tab === 'agent' && (!c.hidden || !L.hidden) && !(e.target.closest && e.target.closest('#liveBar'))) addFiles([...e.dataTransfer.files]); } });      // upuszczony plik trafia do pola zadania albo do wskazówki, gdy agent pracuje
  window.addEventListener('dragenter', e => { if(e.dataTransfer && [...e.dataTransfer.types].includes('Files')){ depth++; mark(true); } });
  window.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if(!depth) mark(false); }); })();

/* ---------- powiększanie obrazków ---------- */
const LBX = {list:[], i:0, z:1, x:0, y:0, drag:null, moved:false};
function lbApply(){ const im = $('lightbox').querySelector('img'); if(!im) return; im.style.transform = `translate(${LBX.x}px,${LBX.y}px) scale(${LBX.z})`; im.classList.toggle('zoomed', LBX.z > 1); const z = $('lightbox').querySelector('[data-lbz]'); if(z) z.textContent = Math.round(LBX.z*100) + '%'; }
function lbDraw(){ const it = LBX.list[LBX.i], many = LBX.list.length > 1; LBX.z = 1; LBX.x = LBX.y = 0;
  $('lightbox').innerHTML = `<div class="lbtop"><span>${esc(it.name || '')}</span>${many ? `<em>${LBX.i + 1} / ${LBX.list.length}</em>` : ''}<i class="grow"></i><button type="button" data-lb="out" title="${tr('Pomniejsz')}"><svg viewBox="0 0 16 16" width="15" height="15"><path d="M4 8h8" stroke="currentColor" stroke-width="1.500" stroke-linecap="round"/></svg></button><b data-lbz>100%</b><button type="button" data-lb="in" title="${tr('Powiększ')}"><svg viewBox="0 0 16 16" width="15" height="15"><path d="M4 8h8M8 4v8" stroke="currentColor" stroke-width="1.500" stroke-linecap="round"/></svg></button><button type="button" data-lb="close" title="${tr('Zamknij')}"><svg viewBox="0 0 12 12" width="12" height="12"><path d="M2.500 2.500l7 7M9.500 2.500l-7 7" stroke="currentColor" stroke-width="1.400" stroke-linecap="round"/></svg></button></div>`
    + (many ? `<button type="button" class="lbnav prev" data-lb="prev"><svg viewBox="0 0 12 12" width="16" height="16"><path d="M7.500 2.500 4 6l3.500 3.500" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" class="lbnav next" data-lb="next"><svg viewBox="0 0 12 12" width="16" height="16"><path d="M4.500 2.500 8 6 4.500 9.500" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` : '')
    + `<div class="lbstage"><img src="${it.url}" alt="" draggable="false"></div>`; lbApply(); }
function lbOpen(el){ const all = [...el.closest('.shots').querySelectorAll('[data-zoom]')]; LBX.list = all.map(x => ({url:x.dataset.zoom, name:x.dataset.name})); LBX.i = Math.max(0, all.indexOf(el));
  const b = $('lightbox'); b.hidden = false; lbDraw(); requestAnimationFrame(() => b.classList.add('open')); }
function lbClose(){ const b = $('lightbox'); b.classList.remove('open'); setTimeout(() => { b.hidden = true; b.innerHTML = ''; }, 180); }
function lbZoom(f, cx, cy){ const old = LBX.z, z = Math.max(1, Math.min(6, old*f)); if(z === old) return; const r = $('lightbox').querySelector('.lbstage').getBoundingClientRect(), px = (cx == null ? r.left + r.width/2 : cx) - (r.left + r.width/2), py = (cy == null ? r.top + r.height/2 : cy) - (r.top + r.height/2);
  LBX.x = px - (px - LBX.x)*z/old; LBX.y = py - (py - LBX.y)*z/old; LBX.z = z; if(z === 1) LBX.x = LBX.y = 0; lbApply(); }
function lbStep(d){ LBX.i = (LBX.i + d + LBX.list.length) % LBX.list.length; lbDraw(); }
$('lightbox').addEventListener('click', e => { const b = e.target.closest('[data-lb]');
  if(b){ const w = b.dataset.lb; w === 'close' ? lbClose() : w === 'prev' ? lbStep(-1) : w === 'next' ? lbStep(1) : lbZoom(w === 'in' ? 1.5 : 1/1.5); return; }
  if(e.target.tagName === 'IMG'){ if(!LBX.moved) LBX.z > 1 ? (LBX.z = 1, LBX.x = LBX.y = 0, lbApply()) : lbZoom(2.5, e.clientX, e.clientY); return; }
  if(e.target.closest('.lbstage') || e.target === $('lightbox')) lbClose(); });
$('lightbox').addEventListener('wheel', e => { e.preventDefault(); lbZoom(e.deltaY < 0 ? 1.2 : 1/1.2, e.clientX, e.clientY); }, {passive:false});
$('lightbox').addEventListener('mousedown', e => { if(e.target.tagName !== 'IMG') return; e.preventDefault(); LBX.moved = false; if(LBX.z > 1) LBX.drag = {x:e.clientX - LBX.x, y:e.clientY - LBX.y}; });
window.addEventListener('mousemove', e => { if(!LBX.drag) return; LBX.x = e.clientX - LBX.drag.x; LBX.y = e.clientY - LBX.drag.y; LBX.moved = true; lbApply(); });
window.addEventListener('mouseup', () => { LBX.drag = null; });
document.addEventListener('keydown', e => { if($('lightbox').hidden) return; if(e.key === 'Escape') lbClose(); else if(e.key === 'ArrowLeft' && LBX.list.length > 1) lbStep(-1); else if(e.key === 'ArrowRight' && LBX.list.length > 1) lbStep(1); else if(e.key === '+' || e.key === '=') lbZoom(1.5); else if(e.key === '-') lbZoom(1/1.5); });

/* ---------- plan zadania, pytania agenta, pamięć projektu ---------- */
function planHtml(P){ if(!P || !P.length) return ''; const done = P.filter(p => p.done).length, next = P.findIndex(p => !p.done);
  const live = !!(S && S.running);
  return `<div class="plancard cc"><div class="planlist">`
    + P.map((p, i) => `<div class="planstep${p.done ? ' done' : i === next ? (live ? ' now' : ' next') : ''}"><i>${p.done ? '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/><path d="M5 8.2l2 2 4-4.2"/></svg>' : ''}</i><span>${esc(p.text)}</span></div>`).join('')
    + `</div></div>`; }
const ASEL = {};                                    // co użytkownik zaznaczył przy pytaniu: numer odpowiedzi albo 'other'
function asksHtml(d){ const L = d.asks || []; if(!L.length) return '';
  return L.map((q, i) => { const key = `${d.id}:${i}`; if(q.ready === false) return '';       // odpowiedzi do wyboru jeszcze się uzupełniają
    if(q.answer) return `<div class="askcard done"><div class="askq"><b>${esc(q.q)}</b></div><small>${tr('Twoja odpowiedź')}: ${esc(q.answer)}</small></div>`;
    const sel = ASEL[key] == null ? 0 : ASEL[key], opts = (q.options || []).slice(0, 3);
    return `<div class="askcard"><div class="askq"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM6.300 6.300a1.800 1.800 0 1 1 2.600 1.600c-.600.300-.900.700-.900 1.300M8 11.300v.100" fill="none" stroke="currentColor" stroke-width="1.300" stroke-linecap="round"/></svg><b>${tr('Pytanie od agenta')}</b><span>${tr(d.outcome === 'ask_user' ? 'czeka na twoją decyzję' : 'praca idzie dalej')}</span></div><p>${esc(q.q)}</p>`
      + `<div class="askopts">${opts.map((o, k) => `<button type="button" class="askopt${sel === k ? ' on' : ''}" data-pick="${key}" data-k="${k}"><i></i><span>${esc(o)}</span>${k === 0 ? `<em>${tr('Polecane')}</em>` : ''}</button>`).join('')}`
      + `<div class="askopt other${sel === 'other' ? ' on' : ''}" data-pick="${key}" data-k="other"><i></i><span>${tr('Inne')}</span><input type="text" data-own="${key}" placeholder="${tr('Wpisz własną odpowiedź')}" maxlength="500"></div></div>`
      + `<div class="askfoot"><button type="button" class="primary" data-anssend="${i}" data-run="${d.id}">${tr('Odpowiedz')}</button></div></div>`; }).join(''); }
async function sendAnswer(runId, i, text){ try{ const r = await api('/api/super/answer', {run:runId, i, text});
    if(r.sent) toast('Odpowiedź trafi do agenta na początku następnej rundy.');
    else { const who = agentOf(r.agent); await api('/api/super', {agent:r.agent, folder:who && who.folder ? r.folder : '', goal:r.goal, mode:r.mode}); toast('Agent wraca do pracy z twoją odpowiedzią.'); }
    delete TH[cur]; await poll(); drawn = ''; render(); }catch(err){ toast(err.message, true); } }
$('chat').addEventListener('focusin', e => { if(e.target.matches('[data-own]') && ASEL[e.target.dataset.own] !== 'other'){ ASEL[e.target.dataset.own] = 'other'; e.target.closest('.askcard').querySelectorAll('.askopt').forEach(o => o.classList.toggle('on', o.dataset.k === 'other')); } });
$('chat').addEventListener('keydown', e => { if(e.key === 'Enter' && e.target.matches('[data-own]')){ e.preventDefault(); const b = e.target.closest('.askcard').querySelector('[data-anssend]'); if(b) b.click(); } });
const fdate = ms => ms ? new Date(ms).toLocaleDateString(loc(), {day:'numeric', month:'long', year:'numeric'}) : '-';
async function profileSheet(a){ let P; try{ P = await api('/api/agent/profile?id=' + encodeURIComponent(a.id)); }catch(err){ return toast(err.message, true); }
  const m = $('modal'), native = !!(window.pywebview && window.pywebview.api), rate = P.tasks ? Math.round(P.done / P.tasks * 100) : 0, mdl = modelName(P.model), eff = (EFF.find(e => e[0] === P.effort) || EFF[0])[1];
  const tile = (k, v, d) => `<div class="ptile"><span>${tr(k)}</span><b>${v}</b>${d ? `<small>${d}</small>` : ''}</div>`, row = (k, v) => `<div class="pfrow"><span>${tr(k)}</span><b>${v}</b></div>`;
  const chips = L => L.length ? `<span class="pchips">${L.map(x => `<i>${esc(tr(x))}</i>`).join('')}</span>` : '<b class="dim">-</b>';
  m.innerHTML = `<div class="sheet profile"><button type="button" class="pclose" data-close aria-label="${tr('Zamknij')}">${'<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'}</button>`
    + `<div class="phead">${face(a, 76)}<div><h3>${esc(P.name)}</h3><p>${esc(P.purpose || tr('Agent ogólny: pracuje do skutku nad tym, co mu zlecisz'))}</p><div class="ppills"><span>${aiIcon(providerOf(a), 14)}${esc(tr(mdl))}</span><span>${tr('Moc')}: ${tr(eff)}</span><span>${tr(P.access === 'full' ? 'Pełny dostęp' : 'Pyta o zgodę')}</span>${P.pinned ? `<span>${tr('Przypięty')}</span>` : ''}</div></div></div>`
    + `<div class="pfold"><div class="pft"><b>${tr('Folder agenta')}</b><small>${P.folder_exists ? `${P.entries} ${tr('pozycji w środku')}` : tr('Folderu jeszcze nie ma, powstanie przy pierwszym zadaniu')}</small></div><div class="ppath">${esc(P.folder)}</div>`
    + `<div class="pbtns"><button type="button" data-pfopen ${native ? '' : 'disabled'}>${tr('Otwórz')}</button><button type="button" data-pfpick ${native ? '' : 'disabled'}>${tr('Zmień folder')}</button></div></div>`
    + `<div class="ptiles">${tile('Zadania', P.tasks, `${P.done} ${tr('udanych')}`)}${tile('Skuteczność', P.tasks ? rate + '%' : '-', '')}${tile('Rundy', P.rounds.toLocaleString(loc()), '')}${tile('Tokeny', big(P.tokens), P.best_day ? `${tr('rekord')}: ${big(P.best_day.tokens)}` : '')}${tile('Czas pracy', span(P.seconds) || '0 s', '')}${tile('Ostatnio', P.last ? new Date(P.last).toLocaleDateString(loc(), {day:'numeric', month:'short'}) : '-', '')}</div>`
    + `<div class="plist">${row('Utworzony', fdate(P.created))}${row('Pierwsze zadanie', fdate(P.first))}${row('Umiejętności', chips(P.skills))}${row('Narzędzia', chips(P.tools))}${row('Współpraca', `${P.asking} ${tr('zleceń wysłanych')} · ${P.asked} ${tr('odebranych')}`)}${row('Kontekst rozmowy', P.ctx ? big(P.ctx) + ' ' + tr('tokenów') : '-')}</div>`
    + `<div class="foot"><button type="button" data-pedit>${tr('Edytuj')}</button><span class="grow"></span><button type="button" class="primary" data-ptask>${tr('Nowe zadanie')}</button></div></div>`;
  m.hidden = false;
  m.onclick = async e => { if(e.target === m || e.target.closest('[data-close]')){ m.hidden = true; return; }
    if(e.target.closest('[data-pfopen]')) window.pywebview.api.open_path(P.folder);
    if(e.target.closest('[data-pfpick]')){ const p = await window.pywebview.api.pick_folder(P.folder); if(p){ await saveAgentPatch(a, {folder:p}); m.hidden = true; profileSheet(agentOf(a.id)); } }
    if(e.target.closest('[data-pedit]')){ m.hidden = true; openMaker(agentOf(a.id)); }
    if(e.target.closest('[data-ptask]')){ m.hidden = true; cur = a.id; show('agent'); F.goal.focus(); } };
  m.onkeydown = e => { if(e.key === 'Escape') m.hidden = true; }; }
async function memorySheet(a){ let d; try{ d = await api('/api/memory?agent=' + a.id); }catch(err){ return toast(err.message, true); } const m = $('modal');
  m.innerHTML = `<form class="sheet wide" id="memForm"><div class="top">${face(a, 30)}<h3>${tr('Pamięć projektu')}</h3></div>`
    + `<p>${tr('Agent czyta to na początku każdego zadania w tym folderze i sam uzupełnia na końcu. Możesz to poprawić albo dopisać własne ustalenia.')}</p><div class="pathline">${esc(d.path)}</div>`
    + `<textarea name="text" rows="14" spellcheck="false" placeholder="${tr('Pamięć jest pusta. Agent zapisze tu ustalenia po pierwszym zadaniu.')}">${esc(d.text)}</textarea>`
    + `<div class="foot"><button type="button" data-wipe>${tr('Wyczyść')}</button><span class="grow"></span><button type="button" data-close>${tr('Zamknij')}</button><button class="primary">${tr('Zapisz')}</button></div></form>`;
  m.hidden = false; m.onclick = e => { if(e.target === m || e.target.closest('[data-close]')) m.hidden = true; if(e.target.closest('[data-wipe]')){ const t = m.querySelector('textarea'); t.value = ''; t.focus(); } };
  $('memForm').onsubmit = async e => { e.preventDefault(); try{ await api('/api/memory', {agent:a.id, text:e.target.elements.text.value}); m.hidden = true; toast('Pamięć projektu zapisana.'); }catch(err){ toast(err.message, true); } }; }

/* ---------- kroki agenta: krótki wiersz z komendą, po kliknięciu cała komenda i jej wynik ---------- */
const SX = new Set();
const STEPICON = {read:'M3 3.500h6.500L12.500 6.500v6H3zM9.500 3.500v3h3', edit:'M3 13l.600-2.800L10.900 2.900l2.200 2.200-7.300 7.300zM9.500 4.300l2.200 2.200', run:'M3.500 5l3 3-3 3M8.500 11.500h4', find:'M7 11.500a4.500 4.500 0 1 0 0-9 4.500 4.500 0 0 0 0 9zM10.300 10.300 13.500 13.500', think:'M8 2.500a4 4 0 0 0-2.300 7.300V11.500h4.600V9.800A4 4 0 0 0 8 2.500zM6.300 13.500h3.400', web:'M8 2.500a5.500 5.500 0 1 0 0 11 5.500 5.500 0 0 0 0-11zM2.500 8h11M8 2.500c-2 2-2 9 0 11M8 2.500c2 2 2 9 0 11', tool:'M4 8h8M8 4v8', shot:'M2.500 5.500h2.300l1-1.500h4.400l1 1.500h2.300v7h-11zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', serve:'M2.500 3.500h11v3.500h-11zM2.500 9h11v3.500h-11zM5 5.300h.100M5 10.800h.100', test:'M3 2.500h10v8H3zM6 13.500h4M8 10.500v3M5.800 6.500l1.500 1.500 3-3', team:'M5.500 7.500a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM2 12.500c.300-2 1.700-3 3.500-3s3.200 1 3.500 3M11 7.500a1.700 1.700 0 1 0 0-3.400M11.500 9.600c1.400.200 2.300 1.200 2.500 2.900'};
const STEPLAB = {read:'Czyta', edit:'Zmienia', run:'Polecenie', find:'Przegląda pliki', think:'Myśli', web:'Sprawdza stronę', tool:'Używa narzędzia', shot:'Robi zrzut ekranu', test:'Testuje stronę', serve:'Uruchamia serwer', team:'Zespół'};
const CHEV = '<svg class="stepchev" viewBox="0 0 12 12" width="10" height="10"><path d="M4.500 3 7.500 6 4.500 9" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function stepRow(x, key, now){ const more = !!(x.full && x.full !== x.text || x.out), open = more && SX.has(key), one = (x.full || '').split('\n')[0];
  const shown = x.kind === 'run' ? x.text : x.text || (more && x.kind !== 'think' ? one.slice(0, 90) : '');
  return `<div class="actstep${now ? ' now' : ''}${open ? ' open' : ''}"><${more ? `button type="button" data-sx="${esc(key)}"` : 'div'} class="stephead">${x.who ? `<em>${esc(x.who)}</em>` : ''}<svg viewBox="0 0 16 16" width="13" height="13"><path d="${STEPICON[x.kind] || STEPICON.tool}"/></svg><span>${tr(STEPLAB[x.kind] || STEPLAB.tool)}</span>${shown ? `<code>${escRaw(shown)}</code>` : ''}${more ? CHEV : ''}</${more ? 'button' : 'div'}>`
    + (open ? `<div class="stepmore">${x.full ? `<pre class="stepfull">${escRaw(x.full)}</pre>` : ''}${x.out ? `<div class="steplab">${tr('Wynik')}</div><pre class="stepout">${escRaw(x.out)}</pre>` : ''}</div>` : '') + '</div>'; }
function shotsHtml(list){ if(!list || !list.length) return ''; const u = x => '/api/shotfile?p=' + encodeURIComponent(x.p);
  return `<div class="shots left">${list.map(x => `<button type="button" class="shot${/^obraz/.test(x.target || '') ? ' made' : ''}" data-zoom="${u(x)}" data-name="${esc(x.target || x.name)}" title="${esc((x.target || x.name) + (x.auto ? ' · ' + tr('zrzut zrobiony automatycznie') : ''))}"><img src="${u(x)}" alt="" loading="lazy"></button>`).join('')}</div>`; }
function stepsDone(r, id){ const L = r.steps || []; if(!L.length) return ''; const key = `sum:${id}:${r.n}`, open = SX.has(key), cmds = L.filter(x => x.kind === 'run' || x.kind === 'serve' || x.kind === 'shot' || x.kind === 'test' || x.kind === 'web').length, files = new Set(L.filter(x => x.kind === 'edit').map(x => x.text)).size;
  const word = n => n === 1 ? 'krok' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'kroki' : 'kroków';
  return `<div class="stepsbox${open ? ' open' : ''}"><button type="button" class="stepsum" data-sx="${key}">${CHEV}<span>${L.length} ${tr(word(L.length))}</span>${cmds ? `<i>${tr('polecenia')}: ${cmds}</i>` : ''}${files ? `<i>${tr('zmienione pliki')}: ${files}</i>` : ''}</button>`
    + (open ? `<div class="stepslist">${L.map((x, i) => stepRow(x, `${key}:${i}`, false)).join('')}</div>` : '') + '</div>'; }

function taskDiff(t, list){      // zlecenia z jednej serii bywają prawie jednakowe: wyróżniamy to, czym to konkretne różni się od najbardziej podobnego
  const words = q => (q || '').split(/(\s+)/), bag = q => new Set(words(q).map(w => w.toLowerCase().replace(/[.,;:()"„”]+$/g, '').replace(/^[("„]+/, '')).filter(w => w.trim())), mine = bag(t.q); let best = null, score = 0;
  for(const o of list){ if(o === t || o.from !== t.from || !o.work !== !t.work || !o.q) continue; const b = bag(o.q); let hit = 0; mine.forEach(w => { if(b.has(w)) hit++; }); const sc = hit / Math.max(mine.size, b.size, 1); if(sc > score){ score = sc; best = b; } }
  if(!best || score < .6 || score >= 1) return esc(t.q || '');
  return words(t.q).map(w => { const k = w.toLowerCase().replace(/[.,;:()"„”]+$/g, '').replace(/^[("„]+/, ''); return k.trim() && !best.has(k) ? `<mark class="dif">${esc(w)}</mark>` : esc(w); }).join(''); }
function teamHtml(list, a){ const LS = (S && S.running && S.live && S.live.steps) || [], runN = list.filter(t => t.state === 'run').length;
  const head = `<div class="crewhead"><b>${tr('Zespół')}</b><span>${runN ? `${tr('pracuje')}: ${runN}` : tr('wszyscy skończyli')}</span><span>${tr('gotowe')}: ${list.length - runN} / ${list.length}</span></div>`;
  return `<div class="crewbox">${head}` + list.map(t => { const to = agentOf(t.to), run = t.state === 'run', key = `tm:${t.t}:${t.id}`, open = opened.has(key);
    const last = run ? [...LS].reverse().find(x => x.who === t.name && x.kind !== 'think') : null, rows = (t.q || '').split('\n').map(x => x.trim()).filter(Boolean);
    const first = (rows.find(x => /^zadanie:/i.test(x)) || rows.find(x => !/^przeczytaj najpierw/i.test(x)) || rows[0] || '').replace(/^zadanie:\s*/i, '');
    const file = (/(?:w pliku|do pliku|plik:)\s+[`"']?([\w./\\-]+\.\w{1,6})/i.exec(t.q || '') || [])[1], wait = run && !t.began;
    return `<div class="crewrow${run ? ' run' : t.failed ? ' fail' : ' done'}${open ? ' open' : ''}">${face(to, 28, run ? 'busy' : '')}<div class="crewmain">`
      + `<button type="button" class="crewtop" data-k="${key}"><b>${esc(t.name)}</b>${file ? `<code>${esc(base(file))}</code>` : ''}<span class="crewstate">${run ? `<i></i>${tr(wait ? 'czeka na swoją kolej' : 'pracuje')} · ${span(Math.max(0, Math.round((Date.now() - (t.began || t.t))/1000)))}` : t.failed ? tr('przerwany') : `${tr('gotowe')} · ${span(t.seconds || 0)}`}</span>${CHEV}</button>`
      + (run ? `<div class="crewnow">${last ? `<svg viewBox="0 0 16 16" width="13" height="13"><path d="${STEPICON[last.kind] || STEPICON.tool}"/></svg><span>${tr(STEPLAB[last.kind] || STEPLAB.tool)}</span>${last.text ? `<code>${escRaw(last.text)}</code>` : ''}` : `<span>${tr(t.work ? 'dostał zlecenie i zaczyna' : 'dostał pytanie i odpowiada')}</span>`}</div>` : '')
      + (open ? `<div class="crewfull"><div class="steplab">${tr(t.work ? 'Zlecenie od:' : 'Pytanie od:')} ${esc(a.name)}</div><p class="crewq">${taskDiff(t, list)}</p>${run ? '' : `<div class="steplab">${tr('Odpowiedź')}</div><div class="say">${md(t.a || '')}</div>`}</div>`
        : `<p class="crewtask">${esc(first.slice(0, 220))}</p>` + (!run && t.a ? `<p class="crewans">${esc(t.a.replace(/[*`#>]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').slice(0, 220))}</p>` : ''))
      + `</div></div>`; }).join('') + '</div>'; }
function runHtml(d, live, a){
  if(d.kind === 'talk'){ const from = AG.find(x => x.id === d.from) || {name:d.from_name || 'Agent', color:'#64748b', face:'kropki'};
    return `<div class="sep"><span>${dayOrClock(d.started)}</span></div><div class="asked"><div class="askhead">${face(from, 22)}<b>${esc(from.name)}</b><span>${tr(d.work ? 'zleca ci pracę na plikach' : 'pyta w trakcie swojego zadania')}</span></div><p>${esc(d.q)}</p>${d.goal ? `<small title="${esc(d.goal)}">${tr('Jego cel')}: ${esc(d.goal.split('\n')[0])}</small>` : ''}</div>`
      + `<div class="msg ai">${face(a, 32)}<div><div class="who"><b>${esc(a.name)}</b><span>${tr('odpowiedź dla')} ${esc(from.name)}${d.seconds != null ? ' · ' + span(d.seconds) : ''}</span></div><div class="say">${md(d.a || '')}</div></div></div>`; }
  const c = d.config, R = d.rounds || [], notes = d.notes || [], id = d.id;
  const noteAfter = n => notes.filter(x => x.after === n).map(x => noteHtml(x, c.folder)).join('');
  let h = `<div class="sep"><span>${dayOrClock(d.started)}</span></div><div class="msg me${d.undone ? ' undone' : ''}">${d.undone ? `<span class="undonetag">${tr('Cofnięte')}</span>` : ''}<div class="bubble${(c.goal.length > 700 || c.goal.split('\n').length > 12) && !opened.has('mg:' + id) ? ' clipb' : ''}">${esc(c.goal)}</div>${c.goal.length > 700 || c.goal.split('\n').length > 12 ? `<button type="button" class="morebtn" data-k="mg:${id}">${tr(opened.has('mg:' + id) ? 'Zwiń' : 'Pokaż całość')}</button>` : ''}${filesHtml(c.files)}<div class="where" title="${esc(c.folder)}"><svg viewBox="0 0 16 16" width="12" height="12"><path d="M1.800 4.200a1 1 0 0 1 1-1h3.100l1.400 1.500h5.900a1 1 0 0 1 1 1v6.100a1 1 0 0 1-1 1H2.800a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.300" stroke-linejoin="round"/></svg>${esc(base(c.folder))}</div><div class="acts"><button type="button" data-copy="${id}" title="${tr('Kopiuj polecenie')}"><svg viewBox="0 0 16 16" width="13" height="13"><rect x="5.500" y="5.500" width="8" height="8" rx="1.800"/><path d="M10.500 3.400V3.300a1.300 1.300 0 0 0-1.300-1.300H3.300A1.300 1.300 0 0 0 2 3.300v5.900a1.300 1.300 0 0 0 1.300 1.300h.100"/></svg></button>${live ? '' : `<button type="button" data-undo="${id}" title="${tr('Cofnij rozmowę do tego polecenia')}"><svg viewBox="0 0 16 16" width="13" height="13"><path d="M3 6.500h6.200a3.300 3.300 0 0 1 0 6.600H6.500M3 6.500 5.800 3.700M3 6.500l2.800 2.800"/></svg></button>`}</div></div>` + noteAfter(0);
  for(const r of R){ const key = id + ':' + r.n, long = (r.agent || '').length > 1400, open = opened.has(key), now = live && r.n === d.round;
    const crewNow = (d.team || []).filter(t => t.round === r.n), crew = crewNow.length ? crewNow : (r.team || []);      // stan zleceń bierzemy z zadania, żeby stare rundy nie pokazywały wiecznego „pracuje”
    if(live && !r.agent && r.passed == null && r.n === d.round && (d.team || []).some(t => t.round === r.n)) h += `<div class="crewlive">${teamHtml(d.team.filter(t => t.round === r.n), a)}</div>`;
    if(now && !r.agent && r.passed == null && (d.shots || []).some(x => x.round === r.n)) h += `<div class="crewlive">${shotsHtml(d.shots.filter(x => x.round === r.n).slice(-4))}</div>`;
    if(r.agent || r.passed != null || ((r.nudged || r.silent || crew.length) && !now)) h += `<div class="msg ai">${face(a, 32)}<div><div class="who"><b>${esc(a.name)}</b><span>${tr('runda')} ${r.n}${r.seconds != null ? ' · ' + span(r.seconds) : ''}${r.model ? ' · ' + modelName(r.model) : ''}</span></div>`
      + stepsDone(r, id)
      + (r.agent ? `<div class="say${long && !open ? ' clip' : ''}">${md(r.agent.replace(/\n?[\s*_>]*(?:PYTANIE DO|ZADANIE DLA) [^\n:]{1,40}:[\s\S]*$/, '').trim() || r.agent)}</div>` : '')
      + shotsHtml((d.shots || []).filter(x => x.round === r.n).slice(-4))
      + (r.ask ? `<div class="talk"><div class="line">${face(a, 24)}<div><b>${esc(a.name)}<span>${tr(r.ask.work ? 'zleca pracę:' : 'pyta')} ${esc(r.ask.name)}</span></b><p>${esc(r.ask.q)}</p></div></div><div class="line">${face(agentOf(r.ask.to), 24)}<div><b>${esc(r.ask.name)}<span>${span(r.ask.seconds)}</span></b><div class="say">${md(r.ask.a)}</div></div></div></div>` : '')
      + (crew.length ? teamHtml(crew, a) : '')
      + (r.passed != null ? `<div class="verdict${r.passed ? ' ok' : ''}">${r.passed ? OKI : NOI}${tr(r.passed ? 'Sprawdzenie przeszło' : 'Sprawdzenie nie przeszło, agent pracuje dalej')}<button type="button" data-k="${key}">${tr(open ? 'Zwiń' : 'Szczegóły')}</button></div>` : '')
      + (r.review ? `<div class="verdict${r.review_ok ? ' ok' : ''}">${r.review_ok ? OKI : NOI}${tr(r.review_ok ? 'Recenzja: bez uwag' : 'Recenzja: są uwagi, agent poprawia')}<button type="button" data-k="rv:${key}">${tr(opened.has('rv:' + key) ? 'Zwiń' : 'Szczegóły')}</button></div>` + (opened.has('rv:' + key) ? `<div class="out"><pre>${esc(r.review)}</pre></div>` : '') : '')
      + (r.audit ? `<div class="verdict${r.audit_ok ? ' ok' : ''}">${r.audit_ok ? OKI : NOI}${tr(r.audit_ok ? 'Audyt kodu: bez zastrzeżeń' : 'Audyt kodu: są problemy, agent poprawia')}<button type="button" data-k="au:${key}">${tr(opened.has('au:' + key) ? 'Zwiń' : 'Szczegóły')}</button></div>` + (opened.has('au:' + key) ? `<div class="out"><pre>${esc(r.audit)}</pre></div>` : '') : '')
      + (open && r.check ? `<div class="out"><pre>${esc(r.check)}</pre></div>` : '') + '</div></div>';
    if(!now) h += noteAfter(r.n);
    if(r.nudged || r.silent) h += `<div class="sysline">${tr(r.nudged ? 'Przerwane twoją wskazówką. Agent dostał ją od razu i pracuje dalej.' : 'Agent długo nie odpowiadał. Przerwałem turę i wznowiłem ją w tej samej rozmowie.')}</div>`; }
  h += planHtml(d.plan) + asksHtml(d);
  { const D0 = d.diff || []; if(D0.length){ const n = D0.length, word = n === 1 ? 'plik' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'pliki' : 'plików';
      h += `<div class="editedrow"><button type="button" class="edited${CP.run === id ? ' on' : ''}" data-k="ch:${id}">${tr('Zmieniono')} ${n} ${tr(word)}<u>+${D0.reduce((k, f) => k + f.add, 0)}</u><s>−${D0.reduce((k, f) => k + f.rem, 0)}</s><svg viewBox="0 0 12 12" width="10" height="10"><path d="M4.500 3 7.500 6 4.500 9" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`; } }
  if(live && d.confirm && !d.confirm.answer && d.confirm.kind === 'agent'){ const c = d.confirm, from = agentOf(c.from) || agentOf(cur), ch = c.change || {}, old = c.to ? AG.find(z => z.id === c.to) : null;      // agent proponuje nowego agenta albo zmianę: decyduje użytkownik
    const row = (k, v) => v ? `<div class="cfrow"><span>${tr(k)}</span><b>${esc(v)}</b></div>` : '';
    h += `<div class="confirm"><div class="askhead">${face(from, 22)}<b>${esc(from.name)}</b><span>${tr(c.op === 'nowy' ? 'chce utworzyć agenta' : 'chce zmienić agenta')}</span>${old ? face(old, 22) + `<b>${esc(old.name)}</b>` : ''}</div>`
      + `<div class="cfcard">${row('Nazwa', ch.name)}${row('Typ agenta', ch.kind === 'image' ? tr('Od obrazów') : ch.kind === 'design' ? tr('Projektant') : '')}${row('Model', ch.model ? modelName(ch.model) : '')}${ch.purpose != null ? `<div class="cfrow col"><span>${tr('Rola')}</span><p>${esc(ch.purpose || tr('bez roli'))}</p></div>` : ''}</div>`
      + `<small>${tr(c.op === 'nowy' ? 'Nowy agent zacznie z dostępem „Pyta mnie o zgodę”. Możesz go potem edytować albo usunąć.' : 'Zmiana zapisze się od razu. Możesz ją potem cofnąć w edycji agenta.')}</small>`
      + `<div class="cfbtns"><button type="button" class="primary" data-cf="yes">${tr('Pozwól')}</button><button type="button" data-cf="no">${tr('Odmów')}</button></div></div>`; }
  else if(live && d.confirm && !d.confirm.answer){ const to = agentOf(d.confirm.to), from = agentOf(d.confirm.from);
    h += `<div class="confirm"><div class="askhead">${face(from, 22)}<b>${esc(from.name)}</b><span>${tr('zleca pracę:')}</span>${face(to, 22)}<b>${esc(to.name)}</b></div><p>${esc(d.confirm.q)}</p>`
      + `<small>${esc(to.name)} ${tr('będzie mógł tworzyć i zmieniać pliki w folderze')} ${esc(base(d.confirm.folder))}.</small>`
      + `<div class="cfbtns"><button type="button" class="primary" data-cf="yes">${tr('Pozwól')}</button><button type="button" data-cf="always">${tr('Zawsze pozwalaj')}: ${esc(to.name)}</button><button type="button" data-cf="no">${tr('Odmów')}</button></div></div>`; }
  else if(live){ const L = d.live || {steps:[], say:''}, steps = L.steps.slice(-7);
    h += `<div class="typing act">${face(a, 32, 'busy')}<div class="actbox"><div class="acthead"><div class="dotsrow"><i></i><i></i><i></i></div><b>${esc(tr(d.status || ''))}</b><time id="liveClock"></time><span class="quiet" id="liveQuiet"></span></div>`
      + steps.map((x, i) => stepRow(x, 'lv:' + x.t, i === steps.length - 1)).join('')
      + (L.say ? `<p class="actsay">${esc(L.say.slice(-320))}</p>` : '') + `</div></div>`; }
  else if(d.outcome){ const g = good(d.outcome), f = failed(d.outcome), D = d.diff || [], openD = D.length ? CP.run === id : opened.has('ch:' + id), plus = D.reduce((n, x) => n + x.add, 0), minus = D.reduce((n, x) => n + x.rem, 0);
    const sub = d.outcome === 'ask_user' && d.question ? esc(d.question) : d.outcome === 'stuck' ? tr('Trzy prawie takie same odpowiedzi z rzędu. Doprecyzuj cel i wyślij go jeszcze raz.') : d.error ? esc(d.error) : '';
    h += `<div class="result ${g ? 'done' : f ? 'bad' : ''}"><div class="rline"><span class="ric">${g ? OKI : f ? NOI : PAU}</span><b>${tr(OUT[d.outcome] || d.outcome)}</b>`
      + `<em>${d.round} ${tr(d.round === 1 ? 'runda' : 'rund')} · ${span(((d.ended || Date.now()) - d.started)/1000)}${d.branch ? ` · ${tr('gałąź')} ${esc(d.branch)}` : ''}</em>`
      + `</div>${sub ? `<small>${sub}</small>` : ''}` + (D.length ? '' : d.changes ? `<div class="rmore"><button type="button" class="chg" data-k="ch:${id}">${tr(openD ? 'Ukryj zmiany' : 'Zmienione pliki')}</button></div>` : '') + (openD ? (D.length ? '' : d.changes ? `<div class="files"><pre>${esc(d.changes)}</pre></div>` : '') : '') + '</div>'; }
  if(live) h += noteAfter(d.round);          // wskazówka wysłana w trakcie pracy jest najnowszą wiadomością, więc stoi na samym dole
  return h;
}
async function loadThread(id, force){ if(TH[id] && !force) return; try{ TH[id] = await api('/api/agents/thread?id=' + id); }catch(e){ TH[id] = TH[id] || []; } }
async function render(){
  if(tab !== 'agent' || !AG.length) return; const a = agentOf(cur); cur = a.id; draftSync(); $('chat').style.setProperty('--ac', a.color);
  await loadThread(a.id);
  const mine = S.config && S.config.agent === a.id && S.id, live = !!(mine && S.running);
  const runs = (TH[a.id] || []).filter(r => !mine || r.id !== S.id).concat(mine ? [S] : []);
  const key = [a.id, a.name, a.color, a.face, a.shape, a.photo || '', a.kind || '', S.confirm ? S.confirm.id : '', a.purpose, LANG, TPL.length, MODELS.models.length, runs.map(d => [d.id, d.round, d.outcome, d.status, (d.rounds || []).map(r => r.passed + '' + (r.agent || '').length + (r.ask ? 'a' : '')).join(), (d.notes || []).length, d.undone ? 'u' : '', d.undo || 0, d.live ? d.live.n : '', (d.plan || []).map(p => p.done ? 1 : 0).join('') + (d.plan || []).length, (d.asks || []).map((q, i) => (q.answer ? 1 : 0) + '' + (q.ready === false ? 'w' : '') + (q.options || []).length + (ASEL[d.id + ':' + i] == null ? '' : ASEL[d.id + ':' + i])).join('') + (d.asks || []).length, (d.team || []).map(t => t.state + (t.a || '').length).join(), d.changes ? 1 : 0, (d.diff || []).reduce((n, x) => n + x.add + x.rem + 1, 0)].join(':')).join('|'), [...opened].join(), [...SX].join(), CP.run, CP.file].join('~');
  if(key !== drawn){ drawn = key; const box = $('chat'), stick = box.scrollHeight - box.scrollTop - box.clientHeight < 120 || !box.dataset.id || box.dataset.id !== a.id; box.dataset.id = a.id;
    softSet('agentHead').html = `${faceAI(a, 40, live)}<div><b>${esc(a.name)}${kindTag(a)}</b><small>${esc(a.purpose || tr('Pracuje do skutku nad tym, co mu zlecisz'))}</small></div><span class="grow"></span><button type="button" class="icon" id="moreAgent" data-more title="${tr('Więcej')}"><svg viewBox="0 0 16 16" width="15" height="15"><circle cx="3.500" cy="8" r="1.200" fill="currentColor"/><circle cx="8" cy="8" r="1.200" fill="currentColor"/><circle cx="12.500" cy="8" r="1.200" fill="currentColor"/></svg></button>`;
    $('moreAgent').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); agentMenu(agentOf(cur), r.right - 224, r.bottom + 6); };
    const fresh = box.dataset.id !== a.id || !box.dataset.seen; if(fresh) box.classList.remove('settled');
    const kept = {}; let foc = null; box.querySelectorAll('[data-own]').forEach(el => { kept[el.dataset.own] = el.value; if(document.activeElement === el) foc = [el.dataset.own, el.selectionStart]; });      // wpisywana odpowiedź nie znika przy odświeżeniu rozmowy
    const chatHtml = runs.length ? runs.map(d => runHtml(d, live && d.id === S.id, a)).join('')
      : `<div class="empty">${face(a, 64)}<h1>${tr('Co ma być zrobione?')}</h1><p>${tr('Agent pracuje, dopóki cel nie jest osiągnięty. Nie pyta cię o zdanie i nie kończy przed czasem.')}</p><div class="quick">${quickIdeas(a).map((t, i) => `<button type="button" ${t.tpl ? `data-tpl="${t.tpl}"` : `data-idea="${i}"`} style="animation-delay:${i*40}ms">${esc(tr(t.name))}</button>`).join('')}<button type="button" class="reroll" data-reroll="1" title="${tr('Inne propozycje')}" aria-label="${tr('Inne propozycje')}"><svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.500-3.600M13 2.800v2.900h-2.900"/></svg></button></div></div>`;
    if(fresh){ box.__html = null; box.innerHTML = ''; }      // inny agent: rozmowa rysuje się od zera; ten sam agent: podmieniają się tylko zmienione fragmenty
    softHtml(box, chatHtml, '.incoming,.imgmake');
    box.querySelectorAll('[data-own]').forEach(el => { if(kept[el.dataset.own] != null) el.value = kept[el.dataset.own]; if(foc && foc[0] === el.dataset.own){ el.focus(); try{ el.setSelectionRange(foc[1], foc[1]); }catch(e){} } });
    if(stick && !foc) box.scrollTop = box.scrollHeight;
    box.dataset.seen = '1'; if(fresh) setTimeout(() => box.classList.add('settled'), 700);
    if(live && S.diff && S.diff.length && CP.closedFor !== S.id && CP.run !== S.id){ CP.run = S.id; drawn = ''; }      // agent zaczął zmieniać pliki: panel otwiera się sam
    drawCode(runs.find(d => d.id === CP.run), live); }
  const lk = liteKey(a); if(lk !== drawnLite){ drawnLite = lk; pickRender(); ctxRender(); headBadge(); }
  drawIncoming(); drawImgMake();
  const busy = S.running;
  const wasLive = $('composer').classList.contains('live'), hadFocus = document.activeElement === (wasLive ? LB : F.goal);
  $('composer').classList.toggle('live', live); $('liveBar').hidden = !live;      // w trakcie pracy to samo pole pisania: zamiast zadania wpisujesz wskazówkę
  if(live !== wasLive){ const to = live ? LB : F.goal; grow(to); if(hadFocus) to.focus(); }
  if(live){ const k = (S.live && S.live.ctx) || 0; if(k !== liveCtxSeen){ liveCtxSeen = k; ctxRender(); } } sendReady();      // kółko kontekstu na pasku rośnie na żywo
  $('sendBtn').disabled = !S.agent; $('sendBtn').title = tr(busy ? 'Dodaj do kolejki' : 'Uruchom');
  if(live) $('liveText').textContent = `${tr('Runda')} ${S.round || 1} · ${span((Date.now() - S.started)/1000)}`
      + (S.phase && S.phase !== 'work' && S.status ? ` · ${tr(S.status)}` : (S.chance != null && S.chance >= .5 ? ` · Neuro: ${Math.round(S.chance*100)}% ${tr('szans na cel')}` : ''));      // gdy agent nie pisze, tylko czeka albo jest sprawdzany, widać to tutaj, przy polu pisania
  DOTS.busy = busy;
}

let HS = {};
const SIGQ = () => { const k = S ? Object.entries(HS).map(([a, b]) => a + ':' + b).join(',') : ''; return k ? '?k=' + encodeURIComponent(k) : ''; };
let POLLGEN = 0;
async function poll(){
  clearTimeout(timer); const gen = POLLGEN;
  try{ const d = await api('/api/super' + SIGQ()); if(gen !== POLLGEN) return; /* odpowiedź sprzed przełączenia paczki: należy do starej paczki, więc ją pomijamy */ (d._keep || []).forEach(k => { d[k] = S ? S[k] : undefined; }); HS = d._h || {}; S = d; quietAt = Date.now(); }catch(e){ HS = {}; timer = setTimeout(poll, 3000); return; }      // duże części stanu przychodzą tylko wtedy, gdy się zmieniły
  try{
  if(S.agents_sig && S.agents_sig !== AGSIG){ const first = !AGSIG; AGSIG = S.agents_sig; if(!first){ try{ AG = await api('/api/agents'); listDrawn = ''; drawn = ''; TEAMSIG = ''; if(tab === 'team') loadTeam(); }catch(e){} } }      // agent doszedł albo się zmienił: lista i zespół odświeżają się same
  if(gen !== POLLGEN) return;
  if(!filled){ filled = true; applyDefaults(S.defaults); setTimeout(loadUsage, 400); if(S.running && S.config) cur = S.config.agent; cur = agentOf(cur || localStorage.getItem('lumobot-agent')).id; fillFolder(); }
  if(wasRunning && !S.running && S.config) unreadBump(S.config.agent);
  if(S && S.running && S.config){ const open = (S.asks || []).filter(q => !q.answer).map(q => S.id + '|' + q.q); open.forEach(k => { if(!ASKSEEN.has(k)){ ASKSEEN.add(k); unreadBump(S.config.agent); } }); }
  if(wasRunning && !S.running && S.config){ const st = S; Object.keys(TH).forEach(k => { if(k !== st.config.agent) delete TH[k]; }); await loadThread(st.config.agent, true); try{ AG = await api('/api/agents'); }catch(e){}
    if(gen !== POLLGEN) return; signalDone(good(st.outcome)); readFinal(); toast(good(st.outcome) ? 'Cel osiągnięty. Sprawdzenie przeszło.' : tr(OUT[st.outcome] || 'Koniec') + '.', failed(st.outcome)); loadUsage(); if(tab === 'statystyki') loadStats(); if(tab === 'neuro') setTimeout(loadNeuro, 1500); }
  wasRunning = S.running;
  noteSweep(); if(S.running) noteRestore();      // po komunikacie o końcu zadania, żeby informacja o przeniesionej wskazówce nie zginęła pod nim
  renderAgents(); await render(); if(gen !== POLLGEN) return; if(tab === 'kolejka') loadQueue(); if(tab === 'zlecenia') loadInbox(true), loadOrders(); else if(S && pollN++ % 10 === 0){ loadInbox(true, true); loadPacks(); }
  } finally { if(gen === POLLGEN){ clearTimeout(timer); timer = setTimeout(poll, S && S.running ? 1200 : 6000); } }      // jeden błąd nie może zatrzymać odświeżania okna
}
function signalDone(ok){ if(!S.defaults.notify) return;
  try{ const ac = new (window.AudioContext || window.webkitAudioContext)(), t = ac.currentTime;        // dwa krótkie tony, bez plików dźwiękowych
    (ok ? [660, 880] : [440, 330]).forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0, t + i*.16); g.gain.linearRampToValueAtTime(.12, t + i*.16 + .02); g.gain.exponentialRampToValueAtTime(.001, t + i*.16 + .3); o.start(t + i*.16); o.stop(t + i*.16 + .32); });
  }catch(e){}
  if(document.hidden && window.pywebview && window.pywebview.api && window.pywebview.api.flash) window.pywebview.api.flash(); }
function applyDefaults(d){ F.mode.value = d.mode; F.max_rounds.value = d.max_rounds; F.checkpoints.checked = d.checkpoints; }
function fillFolder(){ const a = agentOf(cur); F.folder.value = (a && a.project) || ''; syncFolder(); }

/* ---------- pisanie ---------- */
function grow(t){ if(!t.value){ t.style.height = ''; return; } t.style.height = 'auto'; const h = t.scrollHeight; t.style.height = h ? Math.min(180, h) + 'px' : ''; }      // puste pole: jedna linia; ukryte (wysokość 0): naturalna
let growRaf = 0; addEventListener('resize', () => { cancelAnimationFrame(growRaf); growRaf = requestAnimationFrame(() => document.querySelectorAll('.composer>textarea').forEach(t => { if(t.offsetParent) grow(t); })); });      // po zmianie rozmiaru okna pola pisania dopasowują wysokość do tekstu      // ukryte pole ma wysokość 0: wtedy zostaje naturalna, a nie zero
document.querySelectorAll('.composer>textarea:not(.lbnote)').forEach(t => { t.addEventListener('input', () => grow(t));
  t.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); t.form.requestSubmit(); } }); });
let detectTimer = 0;
function syncFolder(){ const v = F.folder.value.trim(); $('optFolder').textContent = v || tr('Nowy projekt dostanie własny folder w folderze agenta.'); $('optPick').textContent = tr(v ? 'Zmień' : 'Wybierz'); $('folderName').textContent = v ? base(v) : tr('Nowy projekt'); $('pickBtn').classList.toggle('set', !!v); $('pickBtn').title = v || tr('Agent pracuje we własnym folderze. Kliknij, żeby wskazać projekt.'); clearTimeout(detectTimer); detectTimer = setTimeout(syncCheck, 250); }
async function syncCheck(){ const v = F.folder.value.trim(), own = F.check.value.trim(), note = $('checkNote');   // zwykłymi słowami: po czym LumoBot pozna, że praca jest skończona
  if(own){ note.textContent = tr('Sprawdzenie: własne polecenie'); return; }
  try{ const d = await api('/api/detect?folder=' + encodeURIComponent(v)); note.textContent = !d.exists ? tr('Nie ma takiego folderu') : tr('Sprawdzenie') + ': ' + tr(d.label); }catch(e){ note.textContent = ''; } }
F.folder.addEventListener('input', syncFolder); F.check.addEventListener('input', syncCheck);
function advanced(on){ $('adv').classList.toggle('open', on); $('optBtn').setAttribute('aria-expanded', on); }
$('optBtn').addEventListener('click', () => advanced(!$('adv').classList.contains('open')));
$('moreOpts').addEventListener('click', () => { const on = $('adv2').classList.toggle('open'); $('moreOpts').setAttribute('aria-expanded', on); });
$('optPick').addEventListener('click', () => $('pickBtn').click());
document.querySelector('.stepper').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; F.max_rounds.value = Math.max(1, Math.min(500, (+F.max_rounds.value || 0) + +b.dataset.step)); });
$('pickBtn').addEventListener('click', async () => {
  const r = $('pickBtn').getBoundingClientRect(), nat = window.pywebview && window.pywebview.api, v = F.folder.value.trim(), ag = agentOf(cur);
  ctxMenu(r.left, r.top - 8, [{label:'Nowy projekt w nowym folderze', icon:'plus', on:!v, run:async () => { F.folder.value = ''; syncFolder(); await saveAgentPatch(ag, {project:''}, true); }},
    {label:'Wybierz istniejący folder', icon:'folder', off:!nat, run:async () => { const p = await window.pywebview.api.pick_folder(v || (ag && ag.folder) || ''); if(p){ F.folder.value = p; syncFolder(); await saveAgentPatch(ag, {project:p}, true); } }},
    {label:'Otwórz folder projektu', icon:'folder', off:!v || !nat, run:() => window.pywebview.api.open_path(v)}], true); });
const jobFromForm = () => ({agent:cur, folder:F.folder.value, check:F.check.value, goal:F.goal.value, mode:F.mode.value, max_rounds:+F.max_rounds.value, checkpoints:F.checkpoints.checked, files:ATT.filter(x => x.id).map(x => x.id)});
$('composer').addEventListener('submit', async e => { e.preventDefault(); const job = jobFromForm();
  try{ const r = await api('/api/super', job); if(r.queued) toast('Dodane do kolejki. Ruszy samo, gdy obecne zadanie się skończy.'); F.goal.value = ''; draftKeep(true); ATT = []; drawAttach(); grow(F.goal); advanced(false); AG = await api('/api/agents'); fillFolder(); $('chat').dataset.id = ''; poll(); }
  catch(err){ toast(err.message, true); } });
const LB = $('liveBar').elements.note;
function liveMode(){ const typing = !!LB.value.trim() || ATT.length > 0; $('liveBtn').classList.toggle('type', typing); $('liveBtn').title = tr(typing ? 'Wyślij wskazówkę' : 'Zatrzymaj'); }
LB.addEventListener('input', () => { grow(LB); liveMode(); noteKeep(); });
LB.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); if(LB.value.trim() || ATT.length) $('liveBar').requestSubmit(); } });      // Enter wysyła, Shift+Enter nowa linia; Enter w pustym polu nic nie robi (zatrzymuje tylko przycisk stop)
$('micBtn').addEventListener('click', () => dictate(liveOn() ? 'live' : 'agent'));      // mikrofon: dyktowanie do pola, które teraz widać
/* szkic wskazówki: zapisany na dysku pod kluczem note:<agent>, przypisany do agenta, który wtedy pracował (LBFOR) */
let noteT = 0, noteP = Promise.resolve(), LBFOR = '', LBRUN = '';
const NOTESEP = String.fromCharCode(1);
const noteVal = (run, t) => t.trim() ? run + NOTESEP + t : '';
const noteText = v => { v = String(v || ''); const i = v.indexOf(NOTESEP); return i < 0 ? v : v.slice(i + 1); };
const noteRun = v => { v = String(v || ''); const i = v.indexOf(NOTESEP); return i < 0 ? '' : v.slice(0, i); };
function noteKey(){ return S && S.running && S.config ? 'note:' + S.config.agent : ''; }
function noteKeep(){ const k = noteKey(); if(!k || !DR) return; LBFOR = k.slice(5); LBRUN = S.id || ''; const v = noteVal(LBRUN, LB.value); if(v) DR[k] = v; else delete DR[k];
  clearTimeout(noteT); noteT = setTimeout(() => { noteP = noteP.then(() => api('/api/drafts', {agent:k, text:v})).catch(() => {}); }, 300); }
function noteFlush(){ if(!LBFOR || !DR || !LB.value.trim()) return; const k = 'note:' + LBFOR, v = noteVal(LBRUN, LB.value); DR[k] = v; clearTimeout(noteT);      // zapis od razu, zanim pole zostanie wyczyszczone
  noteP = noteP.then(() => api('/api/drafts', {agent:k, text:v})).catch(() => {}); }
function noteRestore(){ const k = noteKey(); if(!k || !DR || LB.value || !DR[k]) return;
  if(noteRun(DR[k]) && noteRun(DR[k]) !== S.id){ noteToTask(k.slice(5), noteText(DR[k])); toast('Wskazówka z poprzedniego zadania tego agenta czeka w jego polu zadania.'); return; }      // szkic z innego, wcześniejszego zadania nie wskakuje do nowego
  LB.value = noteText(DR[k]); LBFOR = k.slice(5); LBRUN = S.id || ''; grow(LB); liveMode(); }
function noteToTask(agentId, text){      // wskazówka, która nie poszła, staje się szkicem zadania tego samego agenta: nic nie ginie i nic się nie dubluje
  const k = 'note:' + agentId; clearTimeout(noteT); if(DR) delete DR[k]; if(!String(text || '').trim()) return;
  const mine = agentId === draftOf;
  if(mine){ F.goal.value = (F.goal.value.trim() ? F.goal.value + String.fromCharCode(10, 10) : '') + text; grow(F.goal); }
  else if(DR){ DR[agentId] = (DR[agentId] && DR[agentId].trim() ? DR[agentId] + String.fromCharCode(10, 10) : '') + text; }
  noteP = noteP.then(async () => { try{ await api('/api/drafts', {agent:k, text:''}); }catch(e){}
    if(mine) draftKeep(true); else { try{ await api('/api/drafts', {agent:agentId, text:DR[agentId] || ''}); }catch(e){} } }); }
function noteSweep(){      // po każdym odczycie stanu: wskazówka agenta, który już nie pracuje, przechodzi do jego pola zadania
  let moved = false;
  if(LB.value.trim() && LBFOR && !(S.running && S.config && S.config.agent === LBFOR && (!LBRUN || S.id === LBRUN))){ const a = LBFOR, t = LB.value; LB.value = ''; LBFOR = ''; LBRUN = ''; grow(LB); liveMode();
    $('liveBar').hidden = true; $('composer').classList.remove('live'); noteToTask(a, t); grow(F.goal); moved = true; }      // pasek znika od razu, żeby Enter w pustym polu nie zatrzymał niczego
  if(DR) Object.keys(DR).forEach(k => { if(!k.startsWith('note:')) return; const a = k.slice(5);
    if(a !== LBFOR && AG.some(x => x.id === a) && !(S.running && S.config && S.config.agent === a)){ noteToTask(a, noteText(DR[k])); moved = true; } });
  if(moved) toast('Agent skończył, zanim wysłałeś wskazówkę. Tekst czeka w polu zadania tego agenta.'); }
LB.addEventListener('paste', e => { const fs = [...((e.clipboardData && e.clipboardData.files) || [])]; if(fs.length){ e.preventDefault(); addFiles(fs); } });      // wklejone zdjęcie trafia do wskazówki także w trakcie pracy agenta
$('liveBar').addEventListener('dragover', e => { if(e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
$('liveBar').addEventListener('drop', e => { const fs = [...((e.dataTransfer && e.dataTransfer.files) || [])]; if(fs.length){ e.preventDefault(); addFiles(fs); } });
$('liveBar').addEventListener('submit', async e => { e.preventDefault();      // jeden przycisk: pusty tekst zatrzymuje agenta, wpisany wysyła wskazówkę
  try{ if(ATT.some(f => f.busy)){ toast('Poczekaj, plik jeszcze się dodaje.', true); return; }
    if(LB.value.trim() || ATT.length){
      const to = LBFOR || (S && S.config ? S.config.agent : ''), run = LBRUN || (S && S.running ? S.id : '');
      try{ await api('/api/super/note', {text:LB.value, files:ATT.filter(f => f.id).map(f => f.id), agent:to, run}); }
      catch(err){ if(!/Nic teraz nie pracuje/.test(err.message || '')){ toast(err.message, true); return; }      // inny błąd: tekst zostaje w polu, można spróbować jeszcze raz
        const t = LB.value; LB.value = ''; LBFOR = ''; LBRUN = ''; grow(LB); liveMode(); noteToTask(to, t); poll(); toast('Agent już skończył. Twoja wiadomość czeka w polu zadania, wyślij ją jako nowe zadanie.', true); return; }
      LB.value = ''; noteKeep(); LBFOR = ''; LBRUN = ''; ATT = []; drawAttach(); grow(LB); liveMode(); poll(); }
    else { await api('/api/super/stop', {}); toast('Zatrzymuję agenta. To, co już zrobił, zostaje w folderze.'); setTimeout(poll, 1200); } }catch(err){ toast(err.message, true); } });
$('sendBtn').classList.add('type');
$('chat').addEventListener('click', e => { const link = e.target.closest('a.lnk');
  if(link && link.dataset.path){ e.preventDefault(); const base = S && S.config && S.config.agent === cur ? S.config.folder : (agentOf(cur) || {}).folder || '';
    api('/api/reveal', {path:link.dataset.path, base}).then(r => { if(!r.ok) toast('Nie znalazłem tego pliku na dysku. Mógł zostać przeniesiony albo usunięty.', true); }).catch(err => toast(err.message, true)); return; }
  if(link){ e.preventDefault(); const u = link.getAttribute('href'); if(window.pywebview && window.pywebview.api && window.pywebview.api.open_url) window.pywebview.api.open_url(u); else window.open(u, '_blank', 'noopener'); return; }
  const b = e.target.closest('button'); if(!b) return;
  if(b.dataset.tpl) return useTemplate(b.dataset.tpl);
  if(b.dataset.idea != null){ const it = IDEA.list[+b.dataset.idea]; if(it){ F.goal.value = tr(it.goal); grow(F.goal); F.goal.focus(); } return; }
  if(b.dataset.reroll){ IDEA.seed++; drawn = ''; redraw(); return; }
  const k = b.dataset.k; opened.has(k) ? opened.delete(k) : opened.add(k); render(); });

/* ---------- kreator i edycja agenta ---------- */
/* agent od obrazów: gotowa rola grafika, którą można od razu zapisać albo poprawić */
let AGSIG = '';
const WEAKDES = /haiku|mini|nano|flash|lite|small|tiny|:free|^ollama:|^lmstudio:/i, DESIGN_AGENT = {name:'Projektant', kind:'design', access:'full', purpose:'Projektuje wygląd: układ, sekcje, style i animacje.'};
function designModelFor(d){ if(d.model && !WEAKDES.test(d.model)) return true; const ok = MODELS.models.filter(x => x.available && !WEAKDES.test(x.id)); const best = ['opus', 'fable', 'sonnet', 'gpt-5', 'pro'].map(w => ok.find(x => x.id.toLowerCase().includes(w))).find(Boolean) || ok[0]; if(!best) return false; d.model = best.id; return true; }
const PHOTO_AGENT = {name:'Grafik', kind:'image', access:'full', purpose:'Tworzy obrazy: ikony, logo, ilustracje i tła.'};
const IDEAS = [{name:'Strażnik testów', purpose:'Pilnuje testów i naprawia to, co się zepsuło. Nigdy nie usuwa i nie osłabia testów.'},
  {name:'Porządkowy', purpose:'Sprząta kod: usuwa martwe fragmenty, upraszcza i poprawia nazwy, bez zmiany działania.'},
  {name:'Dokumentalista', purpose:'Pisze i aktualizuje dokumentację tak, żeby zgadzała się z kodem.'}];
/* nowy agent dostaje kolor, którego jeszcze nikt nie ma, oraz inny kształt i oczy niż pozostali */
function freshLook(){ const pick = L => L[Math.floor(Math.random() * L.length)], nice = PALETTE.filter(c => !['#1f2937', '#0b1445', '#64748b'].includes(c)), used = k => new Set(AG.map(x => x[k]));
  const free = (L, k) => { const f = L.filter(x => !used(k).has(x)); return f.length ? f : L; };
  return {color:pick(free(nice, 'color')), face:pick(free(FACES, 'face')), shape:pick(free(MAKERSHAPES, 'shape'))}; }
function openMaker(a, preset){ D = a ? {...a} : {id:null, name:'', ...freshLook(), access:'ask', purpose:'', model:(S && S.defaults && S.defaults.model) || 'gpt-5.6-luna', ...(preset ? {...preset, name:tr(preset.name), purpose:tr(preset.purpose)} : {})};
  MF.name.value = D.name; MF.purpose.value = D.purpose; MF.access.value = D.access || 'ask'; MF.kind.value = D.kind === 'image' ? 'image' : D.kind === 'design' ? 'design' : 'regular'; if(!a && D.kind === 'image') imageModelFor(D); if(!a && D.kind === 'design') designModelFor(D); $('delAgent').hidden = !a || AG.length < 2; show('nowy'); drawMaker(); MF.name.focus(); }
const PALETTE = COLORS.filter(c => c !== '#8b6f47'), PIPETTE = '<svg viewBox="0 0 16 16"><path d="M10.800 2.200a1.800 1.800 0 0 1 2.500 2.500l-1.600 1.600.5.500-1 1-3-3 1-1 .5.500zM8.700 6.700l-5 5a1.400 1.400 0 0 0-.4.900l-.1 1.300 1.300-.1a1.400 1.400 0 0 0 .9-.4l5-5"/></svg>';
const CAMERA = '<svg viewBox="0 0 16 16"><path d="M2.300 5.600a1.100 1.100 0 0 1 1.100-1.100h1.500l.9-1.500h4.400l.9 1.500h1.500a1.100 1.100 0 0 1 1.100 1.100v5.800a1.100 1.100 0 0 1-1.100 1.100H3.400a1.100 1.100 0 0 1-1.100-1.100z"/><circle cx="8" cy="8.300" r="2.200"/></svg>';
function paintLook(){ if(!D) return; const custom = !PALETTE.includes(D.color);
  $('pCard').innerHTML = `<span class="pface">${face(D, 124)}<button type="button" class="pcam" title="${tr(D.photo ? 'Zmień zdjęcie' : 'Dodaj własne zdjęcie')}" aria-label="${tr(D.photo ? 'Zmień zdjęcie' : 'Dodaj własne zdjęcie')}">${CAMERA}</button></span><b>${esc(MF.name.value.trim() || tr('Nowy agent'))}</b><small>${esc(MF.purpose.value.trim() || tr('Pracuje do skutku nad tym, co mu zlecisz'))}</small>`;
  $('swatches').innerHTML = PALETTE.map(c => `<button type="button" data-c="${c}" class="${c === D.color ? 'on' : ''}" style="background:${c}" aria-label="${c}"></button>`).join('')
    + `<button type="button" class="swpick${custom ? ' on custom' : ''}" data-pick="1" style="--pc:${custom ? D.color : 'transparent'}" aria-label="${tr('Własny kolor')}" title="${tr('Własny kolor')}">${PIPETTE}</button>`;
  $('faces').innerHTML = FACES.map(f => `<button type="button" data-f="${f}" class="${f === D.face ? 'on' : ''}">${face({color:D.color, face:f, shape:D.shape}, 28)}</button>`).join('');
  $('shapes').innerHTML = MAKERSHAPES.map(x => `<button type="button" data-s="${x}" class="${x === (D.shape || 'squircle') ? 'on' : ''}">${face({color:D.color, face:D.face, shape:x}, 28)}</button>`).join(''); }
function paintColor(hex){ document.querySelectorAll('#pCard .face, #faces .face, #shapes .face').forEach(f => f.style.setProperty('--c', hex)); const p = $('swatches').querySelector('.swpick'); if(p){ p.classList.add('custom', 'on'); p.style.setProperty('--pc', hex); }
  $('swatches').querySelectorAll('button[data-c]').forEach(b => b.classList.remove('on')); }
function drawMaker(){ if(!D) return;
  $('makerTitle').textContent = tr(D.id ? 'Edycja agenta' : 'Nowy agent');
  paintLook();
  $('roleChips').innerHTML = IDEAS.map((x, i) => `<button type="button" data-i="${i}">${tr(x.name)}</button>`).join('');
  $('saveAgent').textContent = tr(D.id ? 'Zapisz' : 'Utwórz agenta');
  dropdown($('makerModel'), D.model || '', m => { D.model = m; drawMaker(); });
}
$('pCard').addEventListener('click', e => { const b = e.target.closest('.pcam'); if(!b) return; e.stopPropagation(); if(!D.photo) return $('photoIn').click(); const r = b.getBoundingClientRect();
  ctxMenu(r.left, r.bottom + 8, [{label:'Zmień zdjęcie', icon:'edit', run:() => $('photoIn').click()}, {label:'Usuń zdjęcie', icon:'trash', danger:true, run:() => { D.photo = ''; drawMaker(); }}]); });
$('photoIn').addEventListener('change', async e => { const f = e.target.files[0]; e.target.value = ''; if(!f) return;
  try{ const r = await fetch('/api/avatar', {method:'POST', body:f}), d = await r.json(); if(!r.ok) throw new Error(tr(d.detail || 'Nie udało się dodać zdjęcia.')); D.photo = d.photo; drawMaker(); }catch(err){ toast(err.message, true); } });
$('roleChips').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; const x = IDEAS[+b.dataset.i]; if(!MF.name.value.trim()) MF.name.value = tr(x.name); MF.purpose.value = tr(x.purpose); drawMaker(); });
MF.name.addEventListener('input', drawPreviewText); MF.purpose.addEventListener('input', drawPreviewText);
function drawPreviewText(){ const c = $('pCard'); c.querySelector('b').textContent = MF.name.value.trim() || tr('Nowy agent'); c.querySelector('small').textContent = MF.purpose.value.trim() || tr('Pracuje do skutku nad tym, co mu zlecisz'); }
$('swatches').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; if(b.dataset.pick) return CPK.open ? closeColorPop() : openColorPop(b); closeColorPop(); D.color = b.dataset.c; paintLook(); });
/* próbnik: kwadrat nasycenia i jasności, suwak barwy, pole z kodem, zakraplacz i ostatnie kolory */
const CPK = {open:false, h:220, s:.8, v:.9};
const hsv2hex = (h, s, v) => { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return '#' + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
function hex2hsv(hex){ const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if(d){ h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if(h < 0) h += 360; } return {h, s:mx ? d / mx : 0, v:mx}; }
const recents = () => { try{ return JSON.parse(localStorage.getItem('lumobot-colors') || '[]').filter(c => /^#[0-9a-f]{6}$/.test(c)); }catch(e){ return []; } };
function cpPaint(commit){ const pop = $('colorPop'), hex = hsv2hex(CPK.h, CPK.s, CPK.v); D.color = hex; pop.style.setProperty('--h', CPK.h);
  pop.querySelector('.cpsv .cpk').style.cssText = `left:${CPK.s * 100}%;top:${(1 - CPK.v) * 100}%;background:${hex}`; pop.querySelector('.cphue .cpk').style.cssText = `left:${CPK.h / 360 * 100}%;background:hsl(${CPK.h},100%,50%)`;
  pop.querySelector('.cpprev').style.background = hex; const inp = pop.querySelector('.cphex'); if(document.activeElement !== inp) inp.value = hex;
  if(commit) paintLook(); else paintColor(hex); }
function openColorPop(anchor){ const pop = $('colorPop'), cur0 = /^#[0-9a-f]{6}$/i.test(D.color) ? D.color : '#3a6bfc'; Object.assign(CPK, hex2hsv(cur0), {open:true});
  pop.innerHTML = `<div class="cpsv"><i class="cpk"></i></div><div class="cphue"><i class="cpk"></i></div><div class="cprow"><span class="cpprev"></span><input class="cphex" maxlength="7" spellcheck="false" autocomplete="off"><button type="button" class="cpeye" title="${tr('Pobierz kolor z ekranu')}" ${window.EyeDropper ? '' : 'hidden'}>${PIPETTE}</button></div><div class="cprec">${recents().map(c => `<button type="button" data-rc="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>`;
  const r = anchor.getBoundingClientRect(); pop.hidden = false; const pw = pop.offsetWidth || 236, ph = pop.offsetHeight || 290; pop.style.left = Math.max(12, Math.min(innerWidth - pw - 12, r.right - pw)) + 'px'; pop.style.top = Math.max(12, Math.min(innerHeight - ph - 12, r.bottom + 12 + ph > innerHeight ? r.top - ph - 12 : r.bottom + 12)) + 'px';
  const drag = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); const mv = ev => { const b = el.getBoundingClientRect(); fn(Math.min(1, Math.max(0, (ev.clientX - b.left) / b.width)), Math.min(1, Math.max(0, (ev.clientY - b.top) / b.height))); cpPaint(false); };
    mv(e); el.onpointermove = mv; el.onpointerup = () => { el.onpointermove = null; el.onpointerup = null; cpPaint(true); }; });
  drag(pop.querySelector('.cpsv'), (x, y) => { CPK.s = x; CPK.v = 1 - y; }); drag(pop.querySelector('.cphue'), x => { CPK.h = x * 360; });
  const inp = pop.querySelector('.cphex'); inp.addEventListener('input', () => { let t = inp.value.trim(); if(t[0] !== '#') t = '#' + t; if(/^#[0-9a-f]{6}$/i.test(t)){ Object.assign(CPK, hex2hsv(t.toLowerCase())); cpPaint(false); } }); inp.addEventListener('change', () => cpPaint(true));
  pop.querySelector('.cpeye').addEventListener('click', async () => { try{ const got = await new window.EyeDropper().open(); Object.assign(CPK, hex2hsv(got.sRGBHex.toLowerCase())); cpPaint(true); }catch(err){} });
  pop.querySelector('.cprec').addEventListener('click', e => { const b = e.target.closest('[data-rc]'); if(b){ Object.assign(CPK, hex2hsv(b.dataset.rc)); cpPaint(true); } });
  cpPaint(false); }
function closeColorPop(){ if(!CPK.open) return; CPK.open = false; $('colorPop').hidden = true; if(D && !PALETTE.includes(D.color)){ const list = [D.color].concat(recents().filter(c => c !== D.color)).slice(0, 6); try{ localStorage.setItem('lumobot-colors', JSON.stringify(list)); }catch(e){} } }
document.addEventListener('pointerdown', e => { if(CPK.open && !e.target.closest('#colorPop') && !e.target.closest('.swpick')) closeColorPop(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeColorPop(); });
$('shapes').addEventListener('click', e => { const b = e.target.closest('button'); if(b){ D.shape = b.dataset.s; drawMaker(); } });
$('faces').addEventListener('click', e => { const b = e.target.closest('button'); if(b){ D.face = b.dataset.f; drawMaker(); } });
$('tab-nowy').addEventListener('mousemove', e => { const f = $('pCard').querySelector('.eyes'); if(!f) return; const r = $('pCard').querySelector('.face').getBoundingClientRect(), dx = e.clientX - (r.left + r.width/2), dy = e.clientY - (r.top + r.height/2), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d/260)*2.6;
  f.style.transition = 'transform .12s'; f.style.transform = `translate(${dx/d*k}px,${dy/d*k}px)`; });   // oczy dużej twarzy patrzą za kursorem
$('makerForm').addEventListener('submit', async e => { e.preventDefault();
  try{ const r = await api('/api/agents', {...D, name:MF.name.value, purpose:MF.purpose.value, access:MF.access.value, kind:MF.kind.value === 'image' ? 'image' : MF.kind.value === 'design' ? 'design' : ''}); AG = r.agents; cur = r.agent.id; toast(D.id ? 'Zapisane.' : 'Agent utworzony.'); fillFolder(); show('agent'); }
  catch(err){ toast(err.message, true); MF.name.focus(); } });
$('cancelMaker').addEventListener('click', () => show('agent'));
$('makerForm').addEventListener('change', e => { if(e.target.name !== 'kind' || !D) return; D.kind = e.target.value === 'image' ? 'image' : e.target.value === 'design' ? 'design' : '';
  if(D.kind === 'design' && !designModelFor(D)){ D.kind = ''; MF.kind.value = 'regular'; toast('Projektant potrzebuje mocnego modelu. Połącz Claude albo ChatGPT w Ustawieniach, w dziale Podłączone AI.', true); }
  if(D.kind === 'image' && !imageModelFor(D)){ D.kind = ''; MF.kind.value = 'regular'; toast('Agent od obrazów potrzebuje AI, które generuje obrazy. Połącz Antigravity (Gemini) w Ustawieniach, w dziale Podłączone AI.', true); }
  drawMaker(); });
$('delAgent').addEventListener('click', async () => { if(!await ask('Usunąć agenta?', 'Agent zniknie z listy. Jego zadania zostaną w historii.', 'Usuń', true)) return;
  try{ const r = await api('/api/agents', {remove:D.id}); AG = r.agents; cur = AG[0].id; fillFolder(); show('agent'); }catch(err){ toast(err.message, true); } });

/* ---------- szablony ---------- */
async function loadTemplates(){ try{ TPL = await api('/api/templates'); }catch(e){ return; } drawTemplates(); redraw(); }
function drawTemplates(){}
function useTemplate(id){ const t = TPL.find(x => x.id === id); if(!t) return;
  show('agent'); F.goal.value = tr(t.goal); F.check.value = t.check || ''; if(t.folder){ F.folder.value = t.folder; syncFolder(); } else syncCheck(); grow(F.goal); F.goal.focus(); }

/* ---------- kolejka ---------- */
async function loadQueue(){ let Q; try{ Q = await api('/api/queue'); }catch(e){ return; }
  const live = S && S.running && S.config, a = live ? agentOf(S.config.agent) : null;
  softSet('queueNow').html = live ? `<div class="qnow">${face(a, 36)}<div><b>${tr('Teraz pracuje')}: ${esc(a.name)}</b><small>${esc(S.config.goal.split('\n')[0])}</small></div><button type="button" class="quiet" id="qOpen">${tr('Pokaż')}</button></div>`
    : Q.paused && Q.items.length ? `<div class="qnow"><span></span><div><b>${tr('Kolejka wstrzymana')}</b><small>${tr('Zatrzymałeś zadanie, więc kolejne nie ruszają same.')}</small></div><button type="button" class="primary" id="qResume">${tr('Wznów')}</button></div>` : '';
  if($('qOpen')) $('qOpen').onclick = () => { cur = a.id; show('agent'); };
  if($('qResume')) $('qResume').onclick = async () => { await api('/api/queue', {resume:true}); setTimeout(poll, 2200); };
  softSet('queueList').html = Q.items.length ? Q.items.map((q, i) => { const ag = agentOf(q.agent);
    return `<div class="qrow" style="animation-delay:${i*30}ms"><span>${i + 1}</span>${face(ag, 30)}<div><b>${esc(q.goal.split('\n')[0])}</b><small>${esc(ag.name)} · ${esc(base(q.folder))}</small></div>`
      + `<button type="button" data-top="${q.id}" title="${tr('Na początek kolejki')}"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 13V4M4 7.500 8 3.500l4 4" fill="none" stroke="currentColor" stroke-width="1.400" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`
      + `<button type="button" data-remove="${q.id}" title="${tr('Usuń z kolejki')}"><svg viewBox="0 0 12 12" width="11" height="11"><path d="M2.500 2.500l7 7M9.500 2.500l-7 7" stroke="currentColor" stroke-width="1.200" stroke-linecap="round"/></svg></button></div>`; }).join('')
    : `<div class="qempty">${tr('Kolejka jest pusta. Gdy agent pracuje, każde kolejne zadanie wysłane z pola pisania trafia tutaj.')}</div>`;
}
$('queueList').addEventListener('click', async e => { const b = e.target.closest('button'); if(!b) return;
  try{ await api('/api/queue', b.dataset.top ? {top:b.dataset.top} : {remove:b.dataset.remove}); await poll(); loadQueue(); }catch(err){ toast(err.message, true); } });

/* ---------- zlecenia: jedno pole i skrzynka wyników ---------- */
let ORDF = '', INB = null, INBALL = false, ORDWHO = '', pollN = 0, inbSig = '';
const OF = $('orderForm').elements, INOPEN = new Set();
function drawOrderWho(){ const w = AG.find(x => x.id === ORDWHO); $('orderWho').innerHTML = w ? `${face(w, 16)}<span>${esc(w.name)}</span>` : `<span>${tr('Dobierz agenta sam')}</span>`; }
$('orderPlus').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); ctxMenu(r.left, r.top - 8, [{label:'Dyktuj do pola', icon:'mic', run:() => dictate('orders')}], true); });
$('orderWho').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect();
  ctxMenu(r.left, r.bottom + 6, [{label:'Dobierz agenta sam', on:!ORDWHO, run:() => { ORDWHO = ''; drawOrderWho(); }}, '-'].concat(AG.map(x => ({label:x.name, raw:true, on:ORDWHO === x.id, run:() => { ORDWHO = x.id; drawOrderWho(); }})))); });
$('orderForm').addEventListener('submit', async e => { e.preventDefault(); const btn = $('orderSend'); btn.disabled = true;
  try{ const r = await api('/api/inbox', {text:OF.text.value, kind:OF.kind.value, agent:ORDWHO}); OF.text.value = ''; grow(OF.text); toast(r.quick ? `${agentOf(r.agent).name}: ${tr('odpowiada na pytanie')}` : r.fork ? `${agentOf(r.agent).name}: ${tr('robi to jako własna kopia, obok głównej pracy')}` : r.queued ? 'Zlecenie czeka w kolejce. Ruszy samo.' : `${tr('Zlecenie przyjął')}: ${agentOf(r.agent).name}`); await poll(); loadOrders(); loadInbox(true, true); }
  catch(err){ toast(err.message, true); } btn.disabled = false; });
OF.text.addEventListener('input', () => grow(OF.text)); OF.text.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); if(OF.text.value.trim()) $('orderForm').requestSubmit(); } });
async function loadInbox(quiet, countOnly){ let d; try{ d = await api('/api/inbox'); }catch(e){ return; } INB = d; $('inboxCount').textContent = d.attention ? d.attention : '';
  if(countOnly) return; loadServers(); const sig = JSON.stringify([d.items.map(x => [x.id, x.group, x.accepted, x.rounds, x.asks.length, x.status]), d.queue.length, INBALL, [...INOPEN], LANG, ORDF, ORDWHO]);
  if(quiet && sig === inbSig) return; inbSig = sig; drawInbox(); }
async function loadServers(){ let d; try{ d = await api('/api/servers'); }catch(e){ return; } const L = d.items || [];
  softSet('serversBox').html = L.length ? `<div class="ingroup"><h3>${tr('Uruchomione przez agentów')}<span>${L.length}</span></h3>` + L.map(x => `<div class="srvrow"><i></i><b>localhost:${x.port}</b><small>${esc(x.name || '')} · ${esc(agentOf(x.agent).name)} · ${tr('od')} ${repWhen(x.t)}</small><span class="grow"></span><button type="button" data-srvopen="${x.port}">${tr('Otwórz')}</button><button type="button" data-srvstop="${x.pid}">${tr('Zatrzymaj')}</button></div>`).join('') + '</div>' : ''; }
$('serversBox').addEventListener('click', async e => { const o = e.target.closest('[data-srvopen]'), st = e.target.closest('[data-srvstop]');
  if(o){ const u = 'http://localhost:' + o.dataset.srvopen; if(window.pywebview && window.pywebview.api && window.pywebview.api.open_url) window.pywebview.api.open_url(u); else window.open(u, '_blank', 'noopener'); }
  if(st){ st.disabled = true; try{ await api('/api/servers', {stop:+st.dataset.srvstop}); toast('Program zatrzymany.'); }catch(err){ toast(err.message, true); } loadServers(); } });
const ORDIC = {ask:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M6.3 6.4a1.8 1.8 0 1 1 2.6 1.6c-.6.3-.9.7-.9 1.3M8 11.3v.1"/></svg>', running:'<svg viewBox="0 0 16 16" class="spin"><circle cx="8" cy="8" r="6.2" opacity=".25"/><path d="M8 1.8a6.2 6.2 0 0 1 6.2 6.2"/></svg>', done:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M5.3 8.2l1.8 1.8 3.6-3.8"/></svg>', failed:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M6 6l4 4M10 6l-4 4"/></svg>', stopped:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M6.6 6.2v3.6M9.4 6.2v3.6"/></svg>', queued:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.2 1.4"/></svg>'}, EXP = new Set(), CV = '<svg class="ordcv" viewBox="0 0 16 16" width="14" height="14"><path d="M4 6.2l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
let ORD = {items: []}, ORDSIG = '';
const ORDDONE = new Set(); let ordFirst = true;
async function loadOrders(){ try{ ORD = await api('/api/orders'); }catch(e){ return; }
  (ORD.items || []).forEach(o => { if(o.state !== 'run' && o.state !== 'queued' && !ORDDONE.has(o.id)){ ORDDONE.add(o.id); if(!ordFirst && (tab !== 'zlecenia' || document.hidden)) unreadBump(o.agent); } }); ordFirst = false;
  if(tab === 'zlecenia') drawOrders(); }
function ordHtml(o){ const a = agentOf(o.agent) || {id:o.agent, name:o.agent_name || 'Agent', color:'#64748b', face:'kropki', shape:'squircle'}, fork = o.via === 'fork', run = o.state === 'run' || o.state === 'queued';
  const tag = fork ? `<em class="forktag" title="${tr('Kopia agenta, która robi to obok jego głównej pracy')}"><svg viewBox="0 0 16 16" width="11" height="11"><path d="M5 2.500v4a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-4M8 9.500v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${tr('kopia')}</em>` : '';
  const sub = fork ? `${tr('odgałęzienie od')} ${esc(o.lead_name || '')}` : '';
  const who = `<div class="who"><b>${esc(a.name)}</b>${tag}<span>${sub ? sub + ' · ' : ''}${run ? (o.state === 'queued' ? tr('czeka na swoją kolej') : `${esc(tr(o.status || 'pracuje'))}${run ? ' · <span class="tsec"></span>' : ''}`) : o.seconds != null ? span(o.seconds) : ''}</span></div>`;
  const me = `<div class="msg me"><div class="bubble">${esc(o.text)}</div></div><div class="teamsub me">${tr(o.kind === 'ask' ? 'Zapytaj' : 'Zrób')} → ${esc(a.name)} · ${clk(o.t)}</div>`;
  let body;
  if(run) body = `<div class="crewrun"><i></i><i></i><i></i></div>`;
  else { const asks = (o.asks || []).map(q => `<div class="inask"><span>${tr('Pytanie')}</span>${esc(q.q)}</div>`).join('');
    body = asks + (o.answer ? `<div class="say">${md(o.answer)}</div>` : `<div class="say"><p>${tr('Brak odpowiedzi.')}</p></div>`)
      + `<div class="ordacts"><button type="button" data-ordgo="${esc(o.agent)}">${tr(o.state === 'ask' ? 'Odpowiedz w rozmowie' : 'Otwórz rozmowę')}</button></div>`; }
  return me + `<div class="msg ai ${run ? 'live' : o.state}${o.state === 'failed' ? ' bad' : ''}">${face(a, 32, run ? 'busy' : '')}<div>${who}${body}</div></div>`; }
function drawOrders(){ const box = $('ordFeed'), L = ORD.items || [], near = box.scrollHeight - box.scrollTop - box.clientHeight < 160 || !box.dataset.ready; box.dataset.ready = '1';
  const items = L.map(o => ({k:o.id, html:ordHtml(o), dyn:(o.state === 'run' || o.state === 'queued') && o.seconds != null ? span(o.seconds) : null}));
  if(!items.length) items.push({k:'empty', html:`<div class="empty teamempty"><h1>${tr('Tu zlecasz pracę')}</h1><p>${tr('Napisz, co ma być zrobione, i wybierz agenta. Gdy główni agenci są zajęci, wybrany agent zrobi to jako własna kopia, obok ich pracy. Wynik wraca tutaj.')}</p></div>`});
  const lk = LANG + AG.map(x => x.id + x.name + x.color + x.face + x.shape).join(); if(box.dataset.lk !== lk){ box.dataset.lk = lk; box.innerHTML = ''; }
  const added = feedPatch(box, items); if(added && near) box.scrollTop = box.scrollHeight; }
function drawInbox(){ loadOrders(); }
$('ordFeed').addEventListener('click', e => { const go = e.target.closest('[data-ordgo]'); if(go && AG.find(a => a.id === go.dataset.ordgo)){ cur = go.dataset.ordgo; show('agent'); } });
setInterval(() => { if(tab === 'zlecenia' && !document.hidden) loadOrders(); }, 1500);
$('ordPills').addEventListener('click', e => { const b = e.target.closest('[data-ordf]'); if(b){ ORDF = b.dataset.ordf; inbSig = ''; drawInbox(); } });
$('inboxBox').addEventListener('click', async e => { const tg = e.target.closest('[data-rowtoggle]'); if(tg){ const r = tg.closest('.ordrow'), id = tg.dataset.rowtoggle; EXP.has(id) ? EXP.delete(id) : EXP.add(id); r.classList.toggle('open', EXP.has(id)); return; }
  const go = e.target.closest('[data-ingo]'), acc = e.target.closest('[data-inacc]'), op = e.target.closest('[data-inopen]'), un = e.target.closest('[data-inundo]');
  if(e.target.closest('[data-inall]')){ INBALL = !INBALL; inbSig = ''; drawInbox(); return; }
  if(op){ INOPEN.has(op.dataset.inopen) ? INOPEN.delete(op.dataset.inopen) : INOPEN.add(op.dataset.inopen); drawInbox(); return; }
  if(go && AG.find(a => a.id === go.dataset.ingo)){ cur = go.dataset.ingo; show('agent'); return; }
  if(acc){ try{ INB = await api('/api/inbox', {id:acc.dataset.inacc, accept:acc.dataset.on === '1'}); $('inboxCount').textContent = INB.attention ? INB.attention : ''; inbSig = ''; drawInbox(); }catch(err){ toast(err.message, true); } return; }
  if(un){ if(!await ask('Cofnąć to zadanie?', `${tr('Pliki wrócą do stanu sprzed zadania, a nowe pliki znikną. Liczba plików')}: ${un.dataset.n}.`, 'Cofnij', true)) return;
    try{ const r = await api('/api/super/undo', {id:un.dataset.inundo}); Object.keys(TH).forEach(k => delete TH[k]); toast(`${tr('Cofnięte. Przywrócone pliki')}: ${r.restored}.`); inbSig = ''; loadInbox(); }catch(err){ toast(err.message, true); } } });

/* ---------- raport poranny ---------- */
let REP = null, REPDAY = '', REPALL = false;
const repWhen = ms => { const d = new Date(ms), t = new Date(), y = new Date(Date.now() - 86400000); return (d.toDateString() === t.toDateString() ? tr('dziś') : d.toDateString() === y.toDateString() ? tr('wczoraj') : d.toLocaleDateString(loc(), {day:'numeric', month:'short'})) + ' ' + clock(ms); };
async function loadReport(day, manual){ REPDAY = day || ''; try{ REP = await api('/api/report' + (REPDAY ? '?day=' + REPDAY : '')); }catch(e){ REP = null; }
  if(!REPDAY && !manual && REP && !REP.items.length && (REP.days || [])[0] && REP.days[0] === REP.day){ const live = REP; try{ REP = await api('/api/report?day=' + live.days[0]); REP.days = live.days; REPDAY = live.days[0]; }catch(e){ REP = live; } }      // nic nowego od raportu dnia: pokazujemy raport dnia
  else if(REPDAY && REP && !REP.days){ try{ REP.days = (await api('/api/report')).days; }catch(e){} }
  drawReport();
  if(!REPDAY && S && S.report_new){ api('/api/report/seen', {}).then(() => { S.report_new = false; $('reportDot').hidden = true; }).catch(() => {}); } }
function drawReport(){ const box = $('reportBox'); if(!REP){ box.innerHTML = ''; return; } const C = REP.counts, GL = {failed:'Nie udało się', ask:'Czeka na twoją decyzję', running:'W toku', stopped:'Zatrzymane', done:'Zrobione'};
  const tile = (n, label, cls) => `<div class="reptile ${cls}"><b>${n}</b><span>${tr(label)}</span></div>`;
  const row = x => `<button type="button" class="reprow ${x.group}" data-repgo="${x.agent}"><i></i>${face(agentOf(x.agent), 26)}<div><b>${esc(x.goal)}</b><small>${esc(x.name)} · ${x.rounds} ${tr(x.rounds === 1 ? 'runda' : 'rund')} · ${span(x.seconds)}`
      + `${x.files ? ` · ${tr('pliki')}: ${x.files} <u>+${x.add}</u> <s>−${x.rem}</s>` : ''}${x.undone ? ' · ' + tr('Cofnięte') : ''}</small>${x.note ? `<p>${esc(tr(x.note))}</p>` : ''}${x.asks.map(q => `<p class="repq">${esc(q.q)}</p>`).join('')}</div><em>${repWhen(x.ended)}</em></button>`;
  const groups = ['failed', 'ask', 'running', 'stopped', 'done'].map(g => { const L = REP.items.filter(x => x.group === g); const cut = g === 'done' && !REPALL && L.length > 4 ? L.slice(0, 4) : L; return L.length ? `<div class="repgroup"><h3>${tr(GL[g])}<span>${L.length}</span></h3>${cut.map(row).join('')}${cut.length < L.length ? `<button type="button" class="repmore" data-repall>${tr('Pokaż pozostałe')} (${L.length - cut.length})</button>` : ''}</div>` : ''; }).join('');
  const use = Object.entries(REP.usage || {}).map(([pid, u]) => `<div class="repuse">${aiIcon(pid, 15)}<span>${esc(pname(pid))}</span><b>${tok(u.tokens)} ${tr('tok.')}</b>${u.cost ? `<em>${money(u.cost)}</em>` : ''}</div>`).join('');
  const next = (REP.next || []).map(n => `<div class="repnext"><span>${whenFull(n.at)}</span><b>${esc(n.goal)}</b><em>${esc(n.name)}</em></div>`).join('');
  const days = (REP.days || []).length ? `<div class="repdays"><button type="button" class="${REPDAY ? '' : 'on'}" data-repday="">${tr('Teraz')}</button>${REP.days.slice(0, 7).map(d => `<button type="button" class="${REPDAY === d ? 'on' : ''}" data-repday="${d}">${new Date(d + 'T12:00').toLocaleDateString(loc(), {day:'numeric', month:'short'})}</button>`).join('')}</div>` : '';
  box.innerHTML = `<div class="report"><div class="rephead"><div><h2>${tr('Raport')}</h2><p>${repWhen(REP.since)} ${tr('do')} ${repWhen(REP.until)}</p></div>${days}</div>`
    + `<div class="reptiles">${tile(C.done, 'zrobione', 'good')}${tile(C.failed, 'nieudane', C.failed ? 'bad' : '')}${tile(C.questions, 'pytania do ciebie', C.questions ? 'ask' : '')}${tile(C.running, 'w toku', '')}</div>`
    + (REP.items.length ? groups : `<div class="repempty">${tr('W tym czasie agenci nie mieli żadnych zadań.')}</div>`)
    + (use ? `<div class="repfoot"><h3>${tr('Zużycie w tym czasie')}</h3><div class="repuses">${use}</div></div>` : '')
    + (next ? `<div class="repfoot"><h3>${tr('Najbliżej w planie')}</h3>${next}</div>` : '') + '</div>'; }
$('reportBox').addEventListener('click', e => { const go = e.target.closest('[data-repgo]'), day = e.target.closest('[data-repday]');
  if(e.target.closest('[data-repall]')){ REPALL = true; drawReport(); return; }
  if(day){ loadReport(day.dataset.repday, true); return; }
  if(go && AG.find(a => a.id === go.dataset.repgo)){ cur = go.dataset.repgo; show('agent'); } });

/* ---------- harmonogram ---------- */
const SCF = $('schedForm').elements, SCH = {agent:'', days:[0, 1, 2, 3, 4]}, DAYN = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const whenFull = ms => new Date(ms).toLocaleString(loc(), {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
function schedSync(){ const k = SCF.kind.value; SCF.time.hidden = k === 'once' || k === 'every'; SCF.at.hidden = k !== 'once'; $('schedHours').hidden = k !== 'every'; $('schedDays').hidden = k !== 'weekly';
  if(k === 'once' && !SCF.at.value){ const d = new Date(Date.now() + 3600000), p = n => String(n).padStart(2, '0'); SCF.at.value = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; } }
function schedPick(){ if(!AG.find(a => a.id === SCH.agent)) SCH.agent = (agentOf(cur) || AG[0]).id;
  $('schedAgents').innerHTML = AG.map(a => `<button type="button" data-a="${a.id}" class="${a.id === SCH.agent ? 'on' : ''}">${face(a, 24)}<span>${esc(a.name)}</span></button>`).join('');
  $('schedDays').innerHTML = DAYN.map((d, i) => `<button type="button" data-d="${i}" class="${SCH.days.includes(i) ? 'on' : ''}">${tr(d)}</button>`).join(''); }
const schedWhen = s => s.kind === 'once' ? tr('Jeden raz') : s.kind === 'every' ? `${tr('Co')} ${s.hours} ${tr('godz.')}` : s.kind === 'weekly' ? `${s.days.map(d => tr(DAYN[d])).join(', ')} ${tr('o')} ${s.time}` : `${tr('Codziennie o')} ${s.time}`;
function drawSched(R){ $('schedList').innerHTML = R.items.length ? R.items.map((s, i) => { const ag = agentOf(s.agent);
    const state = s.error ? `<em class="bad">${esc(tr(s.error))}</em>` : s.on && s.next ? `${tr('następne')}: ${whenFull(s.next)}` : s.kind === 'once' && s.last ? tr('wykonane') : tr('wyłączone');
    return `<div class="qrow srow${s.on ? '' : ' off'}" style="animation-delay:${i*30}ms">${face(ag, 30)}<div><b>${esc(s.goal.split('\n')[0])}</b><small>${esc(ag.name)} · ${schedWhen(s)} · ${state}</small></div>`
      + `<button type="button" data-run="${s.id}" title="${tr('Uruchom teraz')}"><svg viewBox="0 0 16 16" width="13" height="13"><path d="M4.500 3.200v9.600l8-4.800z" fill="currentColor"/></svg></button>`
      + `<label class="switch"><input type="checkbox" data-tog="${s.id}" ${s.on ? 'checked' : ''}><i></i></label>`
      + `<button type="button" data-rm="${s.id}" title="${tr('Usuń z planu')}"><svg viewBox="0 0 12 12" width="11" height="11"><path d="M2.500 2.500l7 7M9.500 2.500l-7 7" stroke="currentColor" stroke-width="1.200" stroke-linecap="round"/></svg></button></div>`; }).join('')
    : `<div class="qempty">${tr('Plan jest pusty. Wybierz agenta, opisz zadanie i ustaw, kiedy ma ruszać.')}</div>`; }
async function loadSched(){ schedPick(); schedSync(); try{ drawSched(await api('/api/schedule')); }catch(e){} }
async function schedDo(body, okText){ try{ drawSched(await api('/api/schedule', body)); if(okText) toast(okText); return true; }catch(err){ toast(err.message, true); loadSched(); return false; } }
$('schedAgents').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if(b){ SCH.agent = b.dataset.a; schedPick(); } });
$('schedDays').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if(!b) return; const d = +b.dataset.d; SCH.days = SCH.days.includes(d) ? SCH.days.filter(x => x !== d) : SCH.days.concat(d).sort(); schedPick(); });
$('schedForm').addEventListener('change', e => { if(e.target.name === 'kind') schedSync(); });
$('schedForm').addEventListener('submit', async e => { e.preventDefault();
  if(await schedDo({save:{agent:SCH.agent, goal:SCF.goal.value, kind:SCF.kind.value, time:SCF.time.value, days:SCH.days, at:SCF.at.value ? new Date(SCF.at.value).getTime() : 0, hours:+SCF.hours.value}}, 'Dodane do planu.')) SCF.goal.value = ''; });
$('schedList').addEventListener('click', async e => { const b = e.target.closest('button'); if(!b) return;
  if(b.dataset.rm) schedDo({remove:b.dataset.rm}); if(b.dataset.run){ if(await schedDo({run:b.dataset.run}, 'Zadanie wystartowało.')) setTimeout(poll, 600); } });
$('schedList').addEventListener('change', e => { if(e.target.dataset.tog) schedDo({toggle:e.target.dataset.tog}); });

/* ---------- statystyki ---------- */
setInterval(() => { if(tab === 'statystyki' && !document.hidden) loadStats(); }, 15000);
async function loadStats(){ let P; try{ P = await api('/api/profile'); }catch(e){ return; } loadUsage();
  const dd = d => new Date(d + 'T12:00:00'), dl = d => dd(d).toLocaleDateString(loc(), {day:'numeric', month:'short'}), dlY = d => dd(d).toLocaleDateString(loc(), {day:'numeric', month:'short', year:'numeric'});
  const pn = id => ((MODELS.providers.find(p => p.id === id) || {}).name) || id, rate = P.tasks ? Math.round(P.done / P.tasks * 100) : 0;
  const tile = (k, v, d, i) => `<div class="tile" style="animation-delay:${i*45}ms"><div class="k">${tr(k)}</div><div class="v">${v}</div><div class="d">${d}</div></div>`;
  const since = new Date(Date.now() - (P.streak.now - 1) * 864e5).toISOString().slice(0, 10);
  $('useTiles').innerHTML = tile('Tokeny', big(P.tokens), tr('ostatni rok'), 0) + tile('Rekordowy dzień', big(P.record.tokens), P.record.tokens ? dlY(P.record.d) : tr('jeszcze brak'), 1) + tile('Rundy', P.rounds.toLocaleString(loc()), tr('ostatni rok'), 2)
    + tile('Obecna seria', `${P.streak.now} ${tr(P.streak.now === 1 ? 'dzień' : 'dni')}`, P.streak.now ? `${tr('od')} ${dl(since)}` : tr('zacznij dziś'), 3)
    + tile('Najdłuższa seria', `${P.streak.best} ${tr(P.streak.best === 1 ? 'dzień' : 'dni')}`, P.streak.range ? `${dl(P.streak.range[0])} - ${dl(P.streak.range[1])}` : tr('jeszcze brak'), 4);
  const C = P.cells, max = Math.max(1, ...C.map(c => c.tokens)), lvl = c => !(c.tokens || c.rounds) ? 0 : Math.min(4, 1 + Math.floor(Math.sqrt(c.tokens / max) * 3.999)), off = (dd(C[0].d).getDay() + 6) % 7;
  $('useHeat').innerHTML = '<i class="e"></i>'.repeat(off) + C.map((c, i) => `<i class="l${lvl(c)}" style="animation-delay:${Math.min(900, i * 2)}ms" title="${dlY(c.d)}: ${big(c.tokens)} ${tr('tokenów')}, ${c.rounds} ${tr('rund')}"></i>`).join('');
  let mon = '', last = -1; C.forEach((c, i) => { const m = dd(c.d).getMonth(); if(m !== last){ last = m; if(i === 0 ? dd(c.d).getDate() < 20 : true) mon += `<span style="grid-column:${Math.floor((i + off) / 7) + 1}">${dd(c.d).toLocaleDateString(loc(), {month:'short'})}</span>`; } });
  $('heatMon').innerHTML = mon;
  $('heatLeg').innerHTML = `<span>${tr('Mniej')}</span>${[0,1,2,3,4].map(n => `<i class="l${n}"></i>`).join('')}<span>${tr('Więcej')}</span>`;
  const bar = (name, ico, v, share, sub) => `<div class="userow">${ico}<div class="usename"><b>${esc(name)}</b><div class="usebar"><i style="width:${Math.max(share > 0 ? 3 : 0, Math.round(share * 100))}%"></i></div></div><div class="useval"><b>${big(v)}</b><small>${sub}</small></div></div>`;
  const none = `<div class="hint">${tr('Dane pojawią się po pierwszym zadaniu.')}</div>`;
  $('useProv').innerHTML = P.providers.length ? P.providers.map(p => bar(tr(pn(p.id)), aiIcon(p.id, 26), p.tokens, p.share, `${Math.round(p.share * 100)}% · ${p.rounds} ${tr('rund')}`)).join('') : none;
  const topA = Math.max(1, ...P.agents.map(a => a.tokens)); $('useAgents').innerHTML = P.agents.length ? P.agents.map(g => { const a = agentOf(g.id); return bar(g.name, a ? face(a, 28) : '', g.tokens, g.tokens / topA, `${g.rounds} ${tr('rund')}`); }).join('') : none;
  const row = (k, v) => `<div><span>${tr(k)}</span><b>${v}</b></div>`, tp = P.providers[0], tm = P.models[0];
  $('useStat').innerHTML = row('Najczęstszy dostawca', tp ? `${aiIcon(tp.id, 16)}${esc(tr(pn(tp.id)))} · ${Math.round(tp.share * 100)}%` : '-') + row('Główny model', tm ? esc(tm.id.split(':').pop()) : '-') + row('Zadania', `${P.tasks} (${rate}% ${tr('doprowadzonych do celu')})`) + row('Aktywne dni', `${P.active} ${tr('z 365')}`) + row('Razem z wszystkich AI', `${big(P.tokens)} ${tr('tokenów')}`); }

/* ---------- ustawienia: zapis od razu po zmianie ---------- */
async function loadSettings(){ let C; try{ C = await api('/api/settings'); }catch(e){ return; }
  try{ SF.island.checked = localStorage.getItem('lumobot-island') !== '0'; const ip = localStorage.getItem('lumobot-island-pos'); SF.islandpos.value = ip === 'right' ? 'right' : 'left';
    SF.islandhide.checked = localStorage.getItem('lumobot-island-hide') !== '0'; SF.islandtuck.checked = localStorage.getItem('lumobot-island-tuck') === '1'; SF.islandauto.checked = localStorage.getItem('lumobot-island-auto') !== '0'; }catch(err){}
  SF.theme.value = document.documentElement.dataset.theme; SF.lang.value = LANG; SF.mode.value = C.mode; SF.max_rounds.value = C.max_rounds; SF.checkpoints.checked = C.checkpoints; SF.keep_awake.checked = C.keep_awake; SF.computer.checked = !!C.computer; SF.saver.checked = !!C.saver; SF.push_kind.value = C.push_kind || ''; if(document.activeElement !== SF.push_target) SF.push_target.value = C.push_target || ''; SF.push_done.checked = C.push_done !== false; SF.push_ask.checked = C.push_ask !== false; pushNote(); SF.usage_live.checked = C.usage_live; SF.notify.checked = C.notify; SF.review.checked = !!C.review; SF.no_questions.checked = !!C.no_questions; SF.auto_update.checked = !!C.auto_update; SF.min_minutes.value = C.min_minutes || 0; SF.token_budget.value = C.token_budget || 0; SF.brake.checked = !!C.brake; SF.report_on.checked = C.report_on !== false; SF.report_time.value = C.report_time || '08:00'; SF.limit_stop.value = C.limit_stop; drawModelsNote(); SF.wait_minutes.value = C.wait_minutes;
  $('providers').innerHTML = MODELS.providers.map(p => `<div class="prow">${aiIcon(p.id, 26)}<div><b>${esc(tr(p.name))}</b><small>${esc(trd(p.detail))}</small></div>${p.id === 'claude' && p.connected ? `<button type="button" data-p="${p.id}" data-switch="1">${tr('Zmień konto')}</button>` : ''}<button type="button" class="${p.connected ? '' : 'primary'}" data-p="${p.id}" data-on="${p.connected ? 1 : 0}">${tr(p.connected ? 'Rozłącz' : 'Połącz')}</button></div>`).join('');
  drawUpdate();
  $('dataPath').textContent = C.agent.data; $('openData').dataset.path = C.agent.data; $('openData').hidden = !(window.pywebview && window.pywebview.api); }
const NOWAY = {cursor:'Cursor ma własnego agenta w konsoli. Jego obsługa w LumoBocie jest w przygotowaniu.',
  antigravity:'Antigravity to osobny edytor od Google. LumoBot nie ma jeszcze sposobu, żeby zlecać w nim pracę. Gdy taki się pojawi, połączysz go w tym miejscu.'};
let connTimer = 0, connKey = '';
function keySheet(p, error){ const m = $('modal'), own = p.id === 'custom';
  m.innerHTML = `<form class="sheet" id="keyForm"><div class="top">${aiIcon(p.id, 30)}<h3>${tr('Połącz')}: ${esc(p.name)}</h3></div>`
    + `<p>${tr(p.local ? 'To AI działa na twoim komputerze, bez klucza i bez opłat. Uruchom program z modelami i włącz w nim serwer, a LumoBot połączy się sam.' : 'To AI łączy się kluczem API. Klucz zostaje tylko na tym komputerze. Za użycie płacisz dostawcy według jego cennika, osobno od subskrypcji.')}</p>`
    + (own ? `<label class="field"><span>${tr('Nazwa')}</span><input type="text" name="name" placeholder="${tr('Mój dostawca')}" autocomplete="off"></label><label class="field"><span>${tr('Adres API zgodny z OpenAI')}</span><input type="text" name="base" placeholder="https://api.dostawca.com/v1" spellcheck="false" autocomplete="off"></label>` : '')
    + (p.local ? `<input type="hidden" name="key" value=""><p class="hint">${tr('Program pobierzesz tutaj')}: ${esc(tr(p.where || ''))}</p>` : `<label class="field"><span>${tr('Klucz API')}</span><input type="password" name="key" placeholder="sk-..." autocomplete="off" spellcheck="false"></label>`
    + `<p class="hint">${tr('Klucz znajdziesz tutaj')}: ${esc(tr(p.where || ''))}</p>`)
    + (error ? `<div class="state"><i></i>${esc(tr(error))}</div>` : '')
    + `<div class="foot"><button type="button" data-close>${tr('Anuluj')}</button><button class="primary">${tr('Połącz')}</button></div></form>`;
  m.hidden = false; (m.querySelector('input:not([type=hidden])') || m.querySelector('.primary')).focus();
  m.onclick = e => { if(e.target === m || e.target.closest('[data-close]')) m.hidden = true; };
  $('keyForm').onsubmit = async e => { e.preventDefault(); const f = e.target.elements, btn = e.target.querySelector('.primary'); btn.disabled = true; btn.textContent = tr(p.local ? 'Łączę' : 'Sprawdzam klucz');
    try{ const r = await api('/api/keys', {id:p.id, key:f.key.value, base:own ? f.base.value : '', name:own ? f.name.value : ''}); m.hidden = true; MODELS = await api('/api/models'); loadSettings(); await poll(); redraw();
      toast(`${tr('Połączono')}: ${p.name}. ${tr('Modeli')}: ${r.models.length}.`); }
    catch(err){ keySheet(p, err.message); } }; }
let connAuto = '';
function connectSheet(p, state, again){ if(p.kind === 'api') return keySheet(p);
  const m = $('modal'), st = state || {}, auto = !!p.program, busy = st.step === 'start' || st.step === 'install', done = st.step === 'done' || (p.connected && !st.step);
  const key = [p.id, st.step, p.found, p.connected, st.error, !!st.url, st.account].join('|');
  if(again && key === connKey){ const pr = m.querySelector('[data-progress]'); if(pr) pr.textContent = progressText(st); return; }      // ten sam etap: zmienia się tylko licznik, bez przerysowania
  connKey = key;
  const line = (ok, live, text, extra) => `<div class="cstep${ok ? ' done' : live ? ' live' : ''}"><i></i><div>${tr(text)}${extra || ''}</div></div>`;
  m.innerHTML = `<div class="sheet${again ? ' still' : ''}"><div class="top">${aiIcon(p.id, 30)}<h3>${done ? tr('Połączono') : tr('Połącz')}: ${p.name}</h3></div>`
    + (auto ? `<p>${tr(done ? 'To AI jest gotowe. Wybierzesz je w polu pisania, przy modelu agenta.' : 'LumoBot sam zainstaluje oficjalny program tego AI i otworzy jego logowanie w przeglądarce. Ty tylko klikasz Zaloguj. Twoje hasło nie przechodzi przez LumoBota.')}</p>`
        + `<div class="csteps">${line(p.found || done || st.step === 'login', busy, p.found || done || st.step === 'login' ? 'Program jest na komputerze' : 'Instalacja programu', busy ? `<small data-progress>${progressText(st)}</small><u class="cbar"><b></b></u>` : '')}`
        + `${line(done, st.step === 'login', st.step === 'login' ? 'Zaloguj się w przeglądarce, która się otworzyła. To okno samo się odświeży.' : done ? 'Zalogowano na twoje konto' : 'Logowanie na twoje konto', st.step === 'login' ? `<small data-progress>${progressText(st)}</small>` : '')}</div>`
        + (st.step === 'error' ? `<div class="state"><i></i>${esc(tr(st.error))}</div>` : '')
        + (p.id === 'opencode' && !done ? `<div class="state"><i></i>${tr('OpenCode łączy się z wieloma dostawcami. W jego oknie wybierzesz dostawcę i podasz dane, a modele pojawią się tutaj.')}</div>` : '')
        + (p.id === 'antigravity' && !done ? `<div class="state"><i></i>${tr('Antigravity loguje się w swoim oknie konsoli: przy pierwszym uruchomieniu otworzy przeglądarkę. Po zalogowaniu zamknij tamto okno i kliknij tutaj Zamknij.')}</div>` : '')
        + (p.id === 'openai' && !done ? `<div class="state"><i></i>${tr('Stronę logowania pokazuje OpenAI, dlatego po zalogowaniu zobaczysz na niej napis Codex. To nazwa ich programu.')}</div>` : '')
        + (p.id === 'claude' && st.step === 'login' && st.url ? `<div class="state"><i></i>${tr('Logowanie otworzyło się w przeglądarce. Wybierz tam konto, z którego chcesz korzystać. Jeśli od razu widzisz stare konto, wyloguj się z claude.ai i zaloguj na nowe.')}</div><button type="button" class="reopen" data-reopen>${tr('Otwórz logowanie jeszcze raz')}</button>` : '')
        + (p.id === 'claude' && done && st.account ? `<div class="state"><i></i>${tr('Agenci pracują teraz na koncie')} ${esc(st.account)}</div>` : '')
      : `<p>${tr(NOWAY[p.id])}</p>`)
    + `<div class="foot"><button type="button" data-close>${tr(done ? 'Gotowe' : st.step === 'login' ? 'Anuluj' : 'Zamknij')}</button>${auto && !done && st.step !== 'login' ? `<button type="button" class="primary" data-go ${busy ? 'disabled' : ''}>${tr(busy ? 'Instaluję' : p.found ? 'Zaloguj' : 'Połącz automatycznie')}</button>` : ''}</div></div>`;
  m.hidden = false;
  if(auto && !done && !st.step && !again && connAuto !== p.id){ connAuto = p.id; setTimeout(() => { const go = m.querySelector('[data-go]'); if(go && !go.disabled && !m.hidden) go.click(); }, 400); }      // program AI instaluje się sam, od razu po otwarciu tego okna
  const watch = () => { clearTimeout(connTimer); connTimer = setTimeout(async () => { try{ const s2 = await api('/api/connect'); if($('modal').hidden) return;
      if(s2.step === 'done' || s2.step === 'error'){ MODELS = await api('/api/models'); loadSettings(); redraw(); if(s2.step === 'done' && window.pywebview && window.pywebview.api && window.pywebview.api.focus) window.pywebview.api.focus(); }
      connectSheet(MODELS.providers.find(x => x.id === p.id) || p, s2, true); if(s2.step === 'start' || s2.step === 'install' || s2.step === 'login') watch(); }catch(e){ watch(); } }, 400); };
  m.onclick = async e => {
    if(e.target === m || e.target.closest('[data-close]')){ clearTimeout(connTimer); connKey = ''; connAuto = ''; m.hidden = true; if(st.step === 'login') api('/api/connect', {cancel:true}).catch(() => {}); MODELS = await api('/api/models'); loadSettings(); redraw(); return; }
    if(e.target.closest('[data-reopen]')){ api('/api/connect', {reopen:true}).catch(() => {}); return; }
    if(e.target.closest('[data-go]')){ try{ const s2 = await api('/api/connect', {id:p.id}); connectSheet(p, s2, true); watch(); }catch(err){ toast(err.message, true); } } };
  if(busy || st.step === 'login') watch();
}
const progressText = st => st.step === 'login' ? `${tr('Czekam na logowanie')} · ${st.secs || 0} s` : st.mb ? `${tr('Pobrano')} ${st.mb.toLocaleString(loc(), {maximumFractionDigits:1})} MB · ${st.secs || 0} s` : `${tr('Instaluję')} · ${st.secs || 0} s`;
$('providers').addEventListener('click', async e => { const b = e.target.closest('button'); if(!b) return;
  const prov = MODELS.providers.find(x => x.id === b.dataset.p);
  if(b.dataset.switch){ const who = (prov.account || {}).email;
    if(!await ask('Zmienić konto Claude?', (who ? tr('Teraz agenci pracują na koncie') + ' ' + esc(who) + '. ' : '') + tr('LumoBot wyloguje program Claude Code i otworzy logowanie w przeglądarce. Zaloguj się tam na konto, z którego chcesz korzystać.'), 'Zmień konto')) return;
    try{ const s2 = await api('/api/connect', {id:prov.id, switch:true}); connectSheet({...prov, connected:false}, s2); }catch(err){ toast(err.message, true); } return; }
  if(prov.kind === 'api' && prov.connected){ if(!await ask('Rozłączyć to AI?', 'Klucz zostanie usunięty z tego komputera. Agenci na tym AI przestaną działać, dopóki nie połączysz go ponownie.', 'Rozłącz', true)) return;
    try{ await api('/api/keys', {remove:prov.id}); MODELS = await api('/api/models'); await loadSettings(); await poll(); redraw(); toast('Rozłączono.'); }catch(err){ toast(err.message, true); } return; }
  if(!prov.connected) return connectSheet(prov);
  if(b.dataset.p !== 'claude') return connectSheet(prov, {step:'done'});
  try{ await api('/api/settings', {claude_off:b.dataset.on === '1'}); MODELS = await api('/api/models'); await loadSettings(); await poll(); redraw(); toast(b.dataset.on === '1' ? 'Claude rozłączony.' : 'Claude połączony.'); }catch(err){ toast(err.message, true); } });
function drawModelsNote(){ const all = MODELS.models, ok = all.filter(m => m.available).length;
  $('modelsNote').textContent = MODELS.checking ? tr('Sprawdzam modele, to potrwa około minuty.') : MODELS.checked ? `${ok} ${tr('z')} ${all.length} ${tr('modeli dostępnych na twoim koncie, sprawdzone')} ${dayOrClock(MODELS.checked)}. ${tr('Niedostępnych nie pokazujemy na liście.')}` : tr('Jeszcze niesprawdzone. Lista pokazuje wszystkie modele.');
  $('modelsCheck').disabled = !!MODELS.checking; }
async function watchModels(){ MODELS = await api('/api/models'); drawModelsNote(); if(MODELS.checking) setTimeout(watchModels, 4000); else { redraw(); if(D) drawMaker(); } }
$('modelsCheck').addEventListener('click', async () => { try{ await api('/api/models/check', {}); setTimeout(watchModels, 800); }catch(err){ toast(err.message, true); } });

/* ---------- aktualizacje: powiadomienie i jedno kliknięcie ---------- */
let UPD = null;
async function loadUpdate(fresh){ if(window.UPDDEMO) return; try{ UPD = await api('/api/update' + (fresh ? '?fresh=1' : '')); }catch(e){ return; } drawUpdate(); }
function drawUpdate(){ if(!UPD) return; const n = UPD.behind || 0, card = $('updCard'), mark = UPD.mark || UPD.latest || '';
  $('updBox').hidden = true;
  let closed = ''; try{ closed = localStorage.getItem('lumobot-upd-closed') || ''; }catch(e){}
  const show = n && mark !== closed && !updBusy;
  if(show) card.innerHTML = `<i class="upddot"></i><b>${tr('Nowa wersja')}<em data-keep>${esc(UPD.latest || '')}</em></b><button type="button" data-update>${tr('Aktualizuj')}</button><button type="button" data-updx title="${tr('Nie teraz')}"><svg viewBox="0 0 12 12" width="10" height="10"><path d="M2.500 2.500l7 7M9.500 2.500l-7 7" stroke="currentColor" stroke-width="1.400" stroke-linecap="round"/></svg></button>`;      // mała pigułka w górnym pasku: bez opisu zmian, jedno kliknięcie
  if(card.hidden === !!show){ card.hidden = !show; if(show) requestAnimationFrame(() => card.classList.add('open')); else card.classList.remove('open'); }
  $('verNo').textContent = UPD.version + (UPD.build ? ' · ' + UPD.build : ''); $('updateBtn').disabled = !UPD.source; $('updateGo').hidden = !n;
  $('verNote').textContent = !UPD.source ? tr('Źródło aktualizacji nie jest jeszcze ustawione.') : UPD.error ? tr(UPD.error)
    : n ? `${tr('Dostępna nowa wersja')}: ${UPD.notes.slice(0, 3).join('; ')}` : `${tr('Masz najnowszą wersję.')}${UPD.checked ? ' ' + tr('Sprawdzone') + ' ' + clock(UPD.checked) + '.' : ''}`; }
let updBusy = false, updAutoTried = false;
async function setAutoUpdate(on){ try{ const d = await api('/api/settings', {...S.defaults, auto_update:!!on}); S.defaults = d; if(SF.auto_update) SF.auto_update.checked = !!on; }catch(err){ toast(err.message, true); } }
$('updCard').addEventListener('click', e => {
  if(e.target.closest('[data-update]')){ const box = $('updCard').querySelector('[data-updauto]'); if(box && S && box.checked !== !!S.defaults.auto_update) setAutoUpdate(box.checked); doUpdate(); return; }
  if(e.target.closest('[data-updx]')){ try{ localStorage.setItem('lumobot-upd-closed', UPD.mark || UPD.latest || ''); }catch(err){} drawUpdate(); } });
$('updCard').addEventListener('change', e => { if(e.target.matches('[data-updauto]')) setAutoUpdate(e.target.checked); });
/* Włączone "Aktualizuj automatycznie": przy starcie programu nowa wersja instaluje się sama, o ile żaden agent nie pracuje. */
async function autoUpdateAtStart(){ if(updAutoTried || !S || !UPD) return; updAutoTried = true;
  if(!S.defaults.auto_update || !UPD.behind || S.running || !(window.pywebview && window.pywebview.api && window.pywebview.api.restart)) return;
  try{ if(sessionStorage.getItem('lumobot-upd-tried') === (UPD.mark || '')) return; sessionStorage.setItem('lumobot-upd-tried', UPD.mark || ''); }catch(e){}
  toast(`${tr('Instaluję aktualizację')} ${UPD.latest || ''}`); doUpdate(); }
async function doUpdate(){ if(S && S.running) return toast('Agent teraz pracuje. Zaktualizuj po zakończeniu zadania.', true); if(updBusy) return;
  updBusy = true; $('updCard').hidden = true; toast('Pobieram aktualizację.');
  try{ const r = await api('/api/update', {}); UPD = r; drawUpdate();
    if(!r.changed){ updBusy = false; return toast('Masz najnowszą wersję.'); }
    if(window.pywebview && window.pywebview.api && window.pywebview.api.restart){ toast('Zaktualizowano. Uruchamiam ponownie.'); setTimeout(() => window.pywebview.api.restart(), 900); }
    else toast('Zaktualizowano. Uruchom LumoBota ponownie.'); }catch(err){ updBusy = false; toast(err.message, true); drawUpdate(); } }
$('updBox').addEventListener('click', e => { if(e.target.closest('[data-update]')) doUpdate(); });
$('updateGo').addEventListener('click', doUpdate);
$('updateBtn').addEventListener('click', async () => { const b = $('updateBtn'); b.disabled = true; await loadUpdate(true); b.disabled = false; if(UPD && !UPD.behind && !UPD.error) toast('Masz najnowszą wersję.'); });
setTimeout(async () => { await loadUpdate(true); autoUpdateAtStart(); }, 5000); setInterval(() => loadUpdate(true), 20*60000);
let saveTimer = 0;
$('setForm').addEventListener('input', e => {
  if(e.target.name === 'theme') setTheme(SF.theme.value);
  if(e.target.name === 'lang'){ setLang(SF.lang.value); afterLang(); return; }
  if(/^island(pos|hide|tuck|auto)$/.test(e.target.name)){ const k = e.target.name.slice(6); try{ localStorage.setItem('lumobot-island-' + k, k === 'pos' ? SF.islandpos.value : e.target.checked ? '1' : '0'); if(SF.island.checked) localStorage.setItem('lumobot-island-preview', String(Date.now())); }catch(err){} return; }      // wyspa pokazuje się na chwilę, żeby było widać zmianę
  if(e.target.name === 'island'){ try{ localStorage.setItem('lumobot-island', SF.island.checked ? '1' : '0'); if(SF.island.checked) localStorage.setItem('lumobot-island-preview', String(Date.now())); }catch(err){} toast(SF.island.checked ? 'Wyspa włączona. Prawy przycisk na wyspie otwiera jej ustawienia.' : 'Wyspa wyłączona.'); return; }
  clearTimeout(saveTimer); saveTimer = setTimeout(async () => {
    try{ const d = await api('/api/settings', {theme:SF.theme.value, mode:SF.mode.value, max_rounds:+SF.max_rounds.value, checkpoints:SF.checkpoints.checked, keep_awake:SF.keep_awake.checked, computer:SF.computer.checked, saver:SF.saver.checked, push_kind:SF.push_kind.value, push_target:SF.push_target.value, push_done:SF.push_done.checked, push_ask:SF.push_ask.checked, usage_live:SF.usage_live.checked, notify:SF.notify.checked, review:SF.review.checked, no_questions:SF.no_questions.checked, auto_update:SF.auto_update.checked, min_minutes:+SF.min_minutes.value, token_budget:+SF.token_budget.value, brake:SF.brake.checked, report_on:SF.report_on.checked, report_time:SF.report_time.value, limit_stop:+SF.limit_stop.value, wait_minutes:+SF.wait_minutes.value});
      applyDefaults(d); if(S) S.defaults = d; toast('Zapisane.'); }catch(err){ toast(err.message, true); } }, 500); });
$('setForm').addEventListener('submit', e => e.preventDefault());
$('openData').addEventListener('click', () => window.pywebview.api.open_path($('openData').dataset.path));

/* ---------- motyw i język ---------- */
let TV = {};
function readTheme(){ TV = {dot:cssv('--dot'), dotx:cssv('--dotx'), acc:cssv('--rgbaccent'), bg:cssv('--bg'), ink:cssv('--ink'), dark:document.documentElement.dataset.theme === 'dark'}; }
function setTheme(t){ document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light'; try{ localStorage.setItem('lumobot-theme', document.documentElement.dataset.theme); }catch(e){} readTheme(); DOTS.wake(); }
$('themeBtn').addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(t); if(SF.theme) SF.theme.value = t; api('/api/settings', {theme:t}).catch(() => {}); });
function afterLang(){ $('langBtn').textContent = LANG.toUpperCase(); if(SF.lang) SF.lang.value = LANG; redraw(); drawTemplates(); drawUsage(); syncFolder(); if(D) drawMaker(); if(!$('tab-ustawienia').hidden) loadStats(); if(tab === 'ustawienia') loadSettings(); if(NEU) drawNeuroText(); }
$('langBtn').addEventListener('click', () => { setLang(LANG === 'pl' ? 'en' : 'pl'); afterLang(); });

/* ---------- Neuro: chmura punktów, którą można obracać ---------- */
let NEU = null, neuRaf = 0;
async function loadNeuro(){ try{ NEU = await api('/api/neuro'); }catch(e){ return; } drawNeuroText(); if(!neuRaf) neuRaf = requestAnimationFrame(neuroFrame); }
function drawNeuroText(){ const N = NEU, losses = N.runs - N.wins;
  $('neuroTiles').innerHTML = [['Zadania w nauce', N.runs, `${N.wins} ${tr('udanych')}, ${losses} ${tr('nieudanych')}`], ['Przykłady', N.examples, tr('jedna runda to jeden przykład')],
    ['Pokolenie', N.generation || 0, N.acc != null ? `${tr('trafność')} ${Math.round(N.acc*100)}%` : tr('jeszcze bez nauki')], ['Stan', tr(N.ready ? 'Ocenia' : N.learned ? 'Uczy się' : 'Zbiera dane'), N.ready ? tr('ocena widoczna podczas pracy') : `${tr('ocena od')} ${N.need_runs} ${tr('zadań')}`]]
    .map(([k, v, d], i) => `<div class="tile" style="animation-delay:${i*45}ms"><div class="k">${tr(k)}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join('');
  $('neuroLearn').textContent = !N.runs ? tr('Sieć nie widziała jeszcze żadnego zakończonego zadania. Uczy się sama po każdym zadaniu.')
    : !N.learned ? tr('Sieć widziała na razie same zadania jednego rodzaju. Żeby się uczyć, musi zobaczyć i sukcesy, i porażki.')
    : N.ready ? tr('Wytrenowana na wszystkich zakończonych zadaniach. Z każdym kolejnym uczy się od nowa.') : tr('Wytrenowana wstępnie. Ocenę pokaże, gdy danych będzie dość, żeby miała sens.');
  $('neuroFile').textContent = N.size ? `${tr('Pokolenie')} ${N.generation} · ${big(N.steps)} ${tr('kroków nauki')} · ${tr('wagi w pliku')} neuro.bin (${Math.max(1, Math.round(N.size/1024))} kB)` : tr('Plik z wagami powstanie po pierwszej nauce.');
  $('neuroBar').style.width = Math.min(100, N.runs/N.need_runs*100) + '%';
  $('neuroCap').textContent = tr(N.source === 'live' ? 'Sygnał: trwające zadanie, ostatnia runda' : N.source === 'last' ? 'Sygnał: ostatnie zakończone zadanie' : 'Brak zadań: sieć czeka na pierwszy przykład');
  $('neuroOut').innerHTML = N.source === 'live' && N.chance != null ? `<b>${Math.round(N.chance*100)}%</b><span>${tr(N.ready ? 'szans na cel w trwającym zadaniu' : 'ocena próbna, za mało danych')}</span>` : `<span>${tr(N.learned ? 'Ocena pojawi się, gdy agent zacznie pracę' : 'Sieć jeszcze się nie uczyła')}</span>`;
  $('neuroImp').innerHTML = N.inputs.map((n, i) => `<div><span>${tr(n)}</span><u><i style="width:${N.importance[i]*100}%"></i></u><em>${N.sample ? N.sample[i].toFixed(2) : ''}</em></div>`).join('');
}
const N3 = {key:'', n:0, hubs:[], links:[], yaw:.62, pitch:.2, wy:.62, wp:.2, vy:0, vp:0, zoom:1, wz:1, idle:9, down:null, hover:-1, last:0, gl:null, frames:0, fpsAt:0};
function buildNeuro(){
  const N = NEU, key = N.trained_at + ':' + N.sizes.join() + ':' + N.source; if(key === N3.key) return; N3.key = key;
  let seed = 11; const rnd = () => (seed = (seed*1664525 + 1013904223) >>> 0)/4294967296, gauss = () => (rnd() + rnd() + rnd() + rnd() - 2)/1.15;
  const L = N.sizes.length, hubs = [], pts = [];
  const put = (x, y, z, alpha, hub, glow, tint) => pts.push(x, y, z, alpha, hub, glow, rnd(), tint);
  // Kształt mózgu. Kierunek jednostkowy (dx przód, dy dół, dz bok) zamienia się na punkt powierzchni: dwie półkule ze szczeliną pośrodku, spłaszczony spód i fałdy kory.
  const fold = (dx, dy, dz) => Math.sin(11*dx + 3.2*Math.sin(8*dz + 2*dy))*Math.sin(9*dy + 2.6*Math.sin(7*dx + dz*3));
  const surf = (dx, dy, dz, k = 1) => { const gap = 1 - .2*Math.exp(-Math.pow(dz/.17, 2)), front = 1 - .1*Math.max(0, dx)*Math.max(0, dx) - .06*Math.max(0, -dx);
    const r = (1 + .028*fold(dx, dy, dz))*gap*k; return [dx*218*r, dy*(dy > 0 ? 96 : 132)*r, (dz*150*front + Math.sign(dz)*9)*r]; };
  const dir = () => { const u = rnd()*2 - 1, th = rnd()*6.2832, q = Math.sqrt(1 - u*u); return [Math.cos(th)*q, u, Math.sin(th)*q]; };
  for(let j = 0; j < 90000; j++){ const [dx, dy, dz] = dir(), f = fold(dx, dy, dz), ridge = .5 + .5*f; if(rnd() > .1 + .9*ridge*ridge*ridge) continue;      // kora: jasne zakręty, ciemne bruzdy
    const p = surf(dx, dy, dz, 1 - Math.abs(gauss())*.022); put(p[0], p[1], p[2], .3 + .7*ridge*(.5 + .5*rnd()), -1, 0, .18 + .6*ridge); }
  for(let j = 0; j < 5200; j++){ const [dx, dy, dz] = dir(), st = .5 + .5*Math.sin(dy*40 + dx*5); if(rnd() > .15 + .85*st) continue;                          // móżdżek: drobne poziome listki
    put(-132 + dx*50, 76 + dy*27, dz*82, .3 + .6*st*rnd(), -1, 0, .15 + .5*st); }
  for(let j = 0; j < 9000; j++){ const [dx, dy, dz] = dir(), p = surf(dx, dy, dz, Math.pow(rnd(), .5)*.9); put(p[0], p[1], p[2], .08 + rnd()*.3, -1, 1, .05); }   // rzadki pył wewnątrz, wolno wiruje
  // neurony sieci leżą w głębi: wejścia tuż pod korą, kolejne warstwy coraz bliżej środka, ocena w samym jądrze
  const DEPTH = [.8, .54, .3, 0];
  for(let l = 0; l < L; l++) for(let i = 0; i < N.sizes[l]; i++){ const n = N.sizes[l], out = l === L - 1, w = l < L - 1 ? N.weights[l][i] : null, pull = w ? Math.min(1, w.reduce((q, v) => q + Math.abs(v), 0)/w.length*1.6) : 1;
    const u = n === 1 ? 0 : (1 - 2*(i + .5)/n)*.82 + gauss()*.12, th = i*2.39996 + l*1.1 + gauss()*.4, q = Math.sqrt(Math.max(0, 1 - u*u)), p = out ? [0, 8, 0] : surf(Math.cos(th)*q, u, Math.sin(th)*q, DEPTH[l]*(1 + gauss()*.08));
    hubs.push({l, i, x:p[0], y:p[1], z:p[2], a:Math.min(1, Math.abs(N.acts[l][i] || 0)), pull, out}); }
  for(let it = 0; it < 40; it++) for(const a2 of hubs) for(const b2 of hubs){ if(a2 === b2 || a2.out) continue; const dx = a2.x - b2.x, dy = a2.y - b2.y, dz = a2.z - b2.z, d = Math.hypot(dx, dy, dz) || 1;
    if(d < 44){ const f = (44 - d)/d*.5; a2.x += dx*f; a2.y += dy*f; a2.z += dz*f; } }
  for(const [k, h] of hubs.entries()){ const tint = h.l/(L - 1);
    if(h.out){ for(let j = 0; j < 1900; j++){ const d = Math.pow(rnd(), .7)*34, [dx, dy, dz] = dir(); put(dx*d, 8 + dy*d, dz*d, .25 + rnd()*.75, k, 1, 1); } continue; }
    const count = Math.round(150 + 240*h.pull), spread = 8 + h.pull*7;
    for(let j = 0; j < count; j++) put(h.x + gauss()*spread, h.y + gauss()*spread, h.z + gauss()*spread, .22 + rnd()*.78, k, h.a, tint);
    for(let m = 0, sat = 2 + Math.floor(rnd()*3); m < sat; m++){ const [dx, dy, dz] = dir(), d = 20 + rnd()*18;                                              // dendryty: krótkie odnogi z drobnym skupiskiem
      for(let j = 0; j < 26; j++) put(h.x + dx*d + gauss()*3, h.y + dy*d + gauss()*3, h.z + dz*d + gauss()*3, .22 + rnd()*.5, k, h.a*.7, tint);
      for(let j = 0; j < 14; j++){ const t = rnd(); put(h.x + dx*d*t + gauss()*.8, h.y + dy*d*t + gauss()*.8, h.z + dz*d*t + gauss()*.8, .16 + rnd()*.28, k, h.a*.5, tint); } } }
  const links = []; let off = 0;
  for(let l = 0; l < L - 1; l++){ const w = N.weights[l]; let top = 0; for(const r of w) for(const v of r) top = Math.max(top, Math.abs(v));
    for(let i = 0; i < w.length; i++) for(let j = 0; j < w[i].length; j++){ const v = w[i][j]/(top || 1); if(Math.abs(v) < .36) continue;
      const a2 = hubs[off + i], b2 = hubs[off + N.sizes[l] + j], c = [(a2.x + b2.x)*.44 + gauss()*16, (a2.y + b2.y)*.44 + gauss()*16, (a2.z + b2.z)*.44 + gauss()*16];
      links.push({a:off + i, b:off + N.sizes[l] + j, v, ph:rnd(), c});
      for(let q2 = 0, n = Math.round(24 + 60*Math.abs(v)); q2 < n; q2++){ const t = rnd(), u = 1 - t;                                                        // aksony: pasma punktów wzdłuż łuku
        put(u*u*a2.x + 2*u*t*c[0] + t*t*b2.x + gauss()*2, u*u*a2.y + 2*u*t*c[1] + t*t*b2.y + gauss()*2, u*u*a2.z + 2*u*t*c[2] + t*t*b2.z + gauss()*2, .22 + rnd()*.45, off + i, a2.a*.6, (l + t)/(L - 1)); } }
    off += N.sizes[l]; }
  Object.assign(N3, {hubs, links, n:pts.length/8, data:Float32Array.from(pts), fresh:true});
}
/* Punkty rysuje karta graficzna jednym wywołaniem. Pył wolno wiruje, punkty migoczą, a kolor przechodzi od niebieskiego na brzegu do fioletu w jądrze. */
function neuroGL(){ if(N3.gl !== null) return N3.gl; const gl = $('neuroGl').getContext('webgl', {alpha:true, premultipliedAlpha:true, antialias:true, powerPreference:'high-performance'}); if(!gl) return N3.gl = false;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }, pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, `attribute vec3 p; attribute vec3 e; attribute vec2 f; uniform vec4 rot; uniform vec2 view; uniform float sc, dpr, hover, time; varying float va, vk, vt;
    void main(){ float hub = step(-.5, e.y); vec3 q3 = p;
      float sw = (1.0 - hub)*e.z*time*.05, cs = cos(sw), sn = sin(sw); q3.xz = vec2(p.x*cs - p.z*sn, p.x*sn + p.z*cs);
      float x1 = q3.x*rot.x - q3.z*rot.y, z1 = q3.x*rot.y + q3.z*rot.x, y1 = q3.y*rot.z - z1*rot.w, z2 = q3.y*rot.w + z1*rot.z + 640.0, q = 640.0/z2*sc;
      gl_Position = vec4(x1*q/(view.x*.5), -(y1*q + 6.0)/(view.y*.5), 0.0, 1.0);
      float depth = clamp(1.55 - z2/800.0, .22, 1.0), glow = mix(e.z, 1.0, step(abs(e.y - hover), .5)*hub), tw = .72 + .28*sin(time*(1.1 + f.x*1.7) + f.x*6.2832);
      vk = hub; vt = f.y; va = e.x*depth*tw*mix(.8, .36 + glow*.62, hub); gl_PointSize = mix(1.7, 2.1 + glow*.9, hub)*q*dpr; }`));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision mediump float; uniform vec3 cd, ca, cb; varying float va, vk, vt;
    void main(){ float m = smoothstep(.5, .16, length(gl_PointCoord - .5)), a = va*m; gl_FragColor = vec4(mix(mix(cd, ca, vt), mix(ca, cb, vt), vk)*a, a); }`));
  gl.linkProgram(pr); if(!gl.getProgramParameter(pr, gl.LINK_STATUS)) return N3.gl = false;
  gl.useProgram(pr); const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  [['p', 3, 0], ['e', 3, 12], ['f', 2, 24]].forEach(([name, size, at]) => { const loc2 = gl.getAttribLocation(pr, name); gl.enableVertexAttribArray(loc2); gl.vertexAttribPointer(loc2, size, gl.FLOAT, false, 32, at); });
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);
  const u = {}; for(const k of ['rot', 'view', 'sc', 'dpr', 'hover', 'time', 'cd', 'ca', 'cb']) u[k] = gl.getUniformLocation(pr, k);
  return N3.gl = {gl, u}; }
function neuroFrame(now){
  neuRaf = 0; if(tab !== 'neuro' || !NEU || document.hidden) return;
  buildNeuro();
  const cv = $('neuroCv'), cg = $('neuroGl'), r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
  for(const c of [cv, cg]) if(c.width !== Math.round(r.width*d)){ c.width = Math.round(r.width*d); c.height = Math.round(r.height*d); }
  const g = cv.getContext('2d'), W = r.width, H = r.height, S3 = N3, t = now/1000, dt = Math.min(.05, (now - (S3.last || now))/1000), A = TV.acc, K = TV.dark ? '200,212,255' : '11,20,69'; S3.last = now;
  if(!S3.down){ const fade = Math.exp(-dt*2.6); S3.vy *= fade; S3.vp *= fade; S3.idle += dt;
    const rest = Math.max(0, Math.min(1, (S3.idle - 1.5)/2.5)); S3.wy += (S3.vy + rest*rest*(3 - 2*rest)*.12)*dt; S3.wp = Math.max(-1.1, Math.min(1.1, S3.wp + S3.vp*dt)); }
  const k = 1 - Math.exp(-dt*11); S3.yaw += (S3.wy - S3.yaw)*k; S3.pitch += (S3.wp - S3.pitch)*k; S3.zoom += (S3.wz - S3.zoom)*k;
  const cy = Math.cos(S3.yaw), sy = Math.sin(S3.yaw), cp = Math.cos(S3.pitch), sp = Math.sin(S3.pitch), sc = Math.min(W/640, H/400)*S3.zoom*1.08;
  const proj = (x, y, z) => { const x1 = x*cy - z*sy, z1 = x*sy + z*cy, y1 = y*cp - z1*sp, z2 = y*sp + z1*cp + 640, q = 640/z2*sc; return [W/2 + x1*q, H/2 + 6 + y1*q, q, z2]; };
  const G = neuroGL();
  if(G){ const gl = G.gl, u = G.u, rgb = s => s.split(',').map(v => v/255);
    if(S3.fresh){ gl.bufferData(gl.ARRAY_BUFFER, S3.data, gl.STATIC_DRAW); S3.fresh = false; }
    gl.viewport(0, 0, cg.width, cg.height); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4f(u.rot, cy, sy, cp, sp); gl.uniform2f(u.view, W, H); gl.uniform1f(u.sc, sc); gl.uniform1f(u.dpr, d); gl.uniform1f(u.hover, S3.hover);
    gl.uniform3fv(u.cd, rgb(TV.dot)); gl.uniform3fv(u.ca, rgb(A)); gl.uniform3fv(u.cb, TV.dark ? [.74, .6, 1] : [.5, .33, .95]); gl.uniform1f(u.time, t); gl.drawArrays(gl.POINTS, 0, S3.n); }
  g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H);
  const hubs = S3.hubs, hp = hubs.map(h => proj(h.x, h.y, h.z));
  if(!G){ const P = S3.data; for(let i = 0; i < P.length; i += 64){ const q = proj(P[i], P[i + 1], P[i + 2]); g.fillStyle = `rgba(${P[i + 4] < 0 ? TV.dot : A},${(P[i + 3]*.6).toFixed(3)})`; g.fillRect(q[0], q[1], 1.7*q[2], 1.7*q[2]); } }   // bez karty graficznej: rzadsza chmura
  for(const ln of S3.links){ const a = hp[ln.a], b = hp[ln.b], s = Math.abs(ln.v), hot = hubs[ln.a].a;
    g.strokeStyle = ln.v > 0 ? `rgba(${A},${.06 + s*.3})` : `rgba(${K},${.04 + s*.14})`; g.lineWidth = (.4 + s*1.2)*Math.min(1.6, (a[2] + b[2])/2);
    const c = proj(ln.c[0], ln.c[1], ln.c[2]); g.globalAlpha = .55; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.stroke(); g.globalAlpha = 1;
    if(s > .5){ const u2 = (t*(.18 + ln.ph*.22) + ln.ph)%1, w2 = 1 - u2; g.fillStyle = `rgba(${A},${.35 + .6*hot})`; g.beginPath();
      g.arc(w2*w2*a[0] + 2*w2*u2*c[0] + u2*u2*b[0], w2*w2*a[1] + 2*w2*u2*c[1] + u2*u2*b[1], (1.5 + s)*Math.min(1.5, a[2]), 0, 6.2832); g.fill(); } }
  for(const [i, h] of hubs.entries()){ const q = hp[i], out = h.l === NEU.sizes.length - 1, rad = ((out ? 8 : 2.8) + h.a*1.6 + Math.sin(t*1.6 + i)*.3)*Math.min(1.6, q[2]);
    if(out){ for(const [k2, al] of [[3.4, .05], [2.3, .09], [1.6, .14]]){ g.fillStyle = `rgba(${A},${al*(.8 + .2*Math.sin(t*1.3))})`; g.beginPath(); g.arc(q[0], q[1], rad*k2, 0, 6.2832); g.fill(); } }
    g.fillStyle = TV.bg; g.beginPath(); g.arc(q[0], q[1], rad + 2.2, 0, 6.2832); g.fill();
    g.fillStyle = out || i === S3.hover ? TV.ink : `rgb(${A})`; g.beginPath(); g.arc(q[0], q[1], rad, 0, 6.2832); g.fill(); }
  g.font = '10.5px "Segoe UI Variable Text","Segoe UI",sans-serif'; g.textBaseline = 'middle';      // podpisy prawdziwych wejść sieci i ich bieżące wartości
  const drawn = [];
  for(const [i, h] of hubs.entries()){ if(h.l !== 0) continue; const q = hp[i], near = Math.max(0, Math.min(1, (760 - q[3])/260)); if(near < .08) continue;
    if(i !== S3.hover && (near < .55 || drawn.some(d => Math.abs(d[1] - q[1]) < 15 && Math.abs(d[0] - q[0]) < 170))) continue; drawn.push(q);
    const right = q[0] > W/2, label = tr(NEU.inputs[h.i]) + (NEU.sample ? '  ' + NEU.sample[h.i].toFixed(2) : '');
    g.textAlign = right ? 'left' : 'right'; g.fillStyle = `rgba(${K},${(i === S3.hover ? .95 : .2 + .5*near).toFixed(2)})`; g.fillText(label, q[0] + (right ? 9 : -9), q[1]); }
  S3.hp = hp; neuRaf = requestAnimationFrame(neuroFrame);
}
(() => { const st = $('neuroStage'), tip = $('neuroTip');
  st.addEventListener('pointerdown', e => { N3.down = {x:e.clientX, y:e.clientY, t:performance.now()}; N3.vy = N3.vp = 0; N3.idle = 0; st.setPointerCapture(e.pointerId); st.classList.add('drag'); tip.hidden = true; });
  st.addEventListener('pointermove', e => { const now = performance.now();
    if(N3.down){ const ay = (e.clientX - N3.down.x)*.0062, ap = (e.clientY - N3.down.y)*.005, ms = Math.max(8, now - N3.down.t);
      N3.wy += ay; N3.wp = Math.max(-1.1, Math.min(1.1, N3.wp + ap)); N3.vy = N3.vy*.65 + ay/ms*350; N3.vp = N3.vp*.65 + ap/ms*350; N3.down = {x:e.clientX, y:e.clientY, t:now}; return; }
    if(!N3.hp || !NEU) return; const r = st.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = -1, bd = 196;
    N3.hp.forEach((q, i) => { const dd = (q[0] - x)*(q[0] - x) + (q[1] - y)*(q[1] - y); if(dd < bd){ bd = dd; best = i; } });
    N3.hover = best; tip.hidden = best < 0; if(best < 0) return; N3.idle = 0;
    const h = N3.hubs[best], L = NEU.sizes.length;
    tip.textContent = h.l === 0 ? `${tr(NEU.inputs[h.i])}${NEU.sample ? ': ' + NEU.sample[h.i].toFixed(2) : ''}` : h.l === L - 1 ? `${tr('Ocena')}: ${NEU.chance != null ? Math.round(NEU.chance*100) + '%' : tr('jeszcze brak')}` : `Neuron ${h.i + 1}, ${tr('warstwa')} ${h.l} · ${(NEU.acts[h.l][h.i] || 0).toFixed(2)}`;
    tip.style.left = N3.hp[best][0] + 'px'; tip.style.top = N3.hp[best][1] + 'px'; });
  const up = () => { if(N3.down && performance.now() - N3.down.t > 90) N3.vy = N3.vp = 0; N3.down = null; N3.idle = 0; st.classList.remove('drag'); };
  st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  st.addEventListener('pointerleave', () => { N3.hover = -1; tip.hidden = true; });
  st.addEventListener('wheel', e => { e.preventDefault(); N3.wz = Math.max(.6, Math.min(2.6, N3.wz*Math.exp(-e.deltaY*.0012))); N3.idle = 0; }, {passive:false});
})();
/* ---------- zakładki ---------- */
/* ---------- wtyczki: umiejętności agentów i narzędzia MCP ---------- */
let PLG = null;
async function loadPlugins(){ try{ PLG = await api('/api/plugins'); }catch(e){ return; } drawPlugins(); }
async function plugDo(body, okText){ try{ const r = await api('/api/plugins', body); PLG = r.state || (r.skills ? r : PLG); drawPlugins(); if(okText) toast(okText); return r; }catch(err){ toast(err.message, true); drawPlugins(); return null; } }
const SKX = new Set(), SKG = ['Budowanie', 'Jakość', 'Styl pracy', 'Własne'];
const plSw = (kind, id, on) => `<label class="switch" title="${tr(on ? 'Włączone' : 'Wyłączone')}"><input type="checkbox" data-plsw="${kind}" data-id="${esc(id)}" ${on ? 'checked' : ''}><i></i></label>`;
const plScopeChip = x => x.agents && x.agents.length ? `<span class="chip">${tr('wybrani')}: ${x.agents.length}</span>` : '';
function plScope(kind, x){ const all = !(x.agents && x.agents.length), pool = PACKS.everyone && PACKS.everyone.length ? PACKS.everyone : AG;
  return `<div class="plscope"><span class="pllab">${tr('Używają')}</span><button type="button" class="scp${all ? ' on' : ''}" data-scope="${kind}|${esc(x.id)}|*">${tr('Wszyscy agenci')}</button>`
    + pool.map(a => `<button type="button" class="scp${!all && x.agents.includes(a.id) ? ' on' : ''}" data-scope="${kind}|${esc(x.id)}|${esc(a.id)}">${esc(a.name)}</button>`).join('') + '</div>'; }
function skillRow(x){ const open = SKX.has(x.id), est = Math.ceil((x.text || '').length / 4);
  return `<div class="plr${open ? ' open' : ''}${x.on ? ' on' : ''}"><div class="plrh"><button type="button" class="plrb" data-skill="${esc(x.id)}" aria-expanded="${open}"><span class="plrt"><b>${x.builtin ? tr(x.name) : esc(x.name)}</b>${x.changed ? `<span class="chip">${tr('zmieniona')}</span>` : ''}${plScopeChip(x)}</span>`
    + `<small>${x.builtin ? tr(x.desc) : esc(x.desc || x.text.slice(0, 120))}</small></button>${plSw('skill', x.id, x.on)}</div>`
    + (`<div class="plxw"><div class="plx"><div class="plxp"><div><div class="pllab">${tr('Treść zasady')} · ${tr('ok.')} ${est} ${tr('tokenów')}</div><div class="pltext">${escRaw(x.text)}</div></div>${plScope('skill', x)}`
      + `<div class="plact"><button type="button" data-skedit="${esc(x.id)}">${tr('Edytuj')}</button>${x.builtin ? (x.changed ? `<button type="button" data-skreset="${esc(x.id)}">${tr('Przywróć oryginał')}</button>` : '') : ''}<i class="grow"></i>${x.builtin ? '' : `<button type="button" class="dangerbtn" data-skdel="${esc(x.id)}">${tr('Usuń')}</button>`}</div></div></div></div>`) + '</div>'; }
function drawPlugins(){ if(!PLG) return; const sk = PLG.skills, on = sk.filter(x => x.on), tokens = on.reduce((n, x) => n + Math.ceil((x.text || '').length / 4), 0);
  $('skillCount').textContent = `${tr('włączone')}: ${on.length} / ${sk.length} · ${tr('ok.')} ${tokens} ${tr('tokenów w każdym zadaniu')}`;
  $('skillList').innerHTML = SKG.filter(g => sk.some(x => (x.group || 'Własne') === g)).map(g => `<h3 class="grp">${tr(g)}</h3><div class="grpbox plbox">${sk.filter(x => (x.group || 'Własne') === g).map(skillRow).join('')}</div>`).join('');
  if(!$('tab-ustawienia').hidden) setDraw(); }
function skillSheet(x){ const m = $('modal'), own = !x || !x.builtin;
  m.innerHTML = `<form class="sheet wide" id="skillForm"><div class="top"><h3>${x ? (x.builtin ? tr(x.name) : esc(x.name)) : tr('Nowa umiejętność')}</h3></div>`
    + `<p>${tr('Napisz, jak agent ma pracować przy tym rodzaju zadań. Krótko i konkretnie: ten tekst trafia do każdego zadania.')}</p>`
    + (own ? `<label class="field"><span>${tr('Nazwa')}</span><input type="text" name="name" maxlength="60" value="${x ? esc(x.name) : ''}" placeholder="${tr('Na przykład: Sklep internetowy')}" autocomplete="off"></label>` : '')
    + `<label class="field"><span>${tr('Zasady')}</span><textarea name="text" rows="9" maxlength="4000" spellcheck="false">${x ? escRaw(x.text) : ''}</textarea></label>`
    + `<div class="foot">${x && !x.builtin ? `<button type="button" class="dangerbtn" data-del>${tr('Usuń')}</button>` : ''}${x && x.changed ? `<button type="button" data-reset>${tr('Przywróć oryginał')}</button>` : ''}<i class="grow"></i><button type="button" data-close>${tr('Anuluj')}</button><button class="primary">${tr('Zapisz')}</button></div></form>`;
  m.hidden = false; (m.querySelector(own && !x ? 'input' : 'textarea')).focus();
  m.onclick = async e => { if(e.target === m || e.target.closest('[data-close]')) m.hidden = true;
    else if(e.target.closest('[data-del]')){ m.hidden = true; plugDo({op:'skill_remove', id:x.id}, 'Umiejętność usunięta.'); }
    else if(e.target.closest('[data-reset]')){ m.hidden = true; plugDo({op:'skill', id:x.id, reset:true}, 'Przywrócona.'); } };
  $('skillForm').onsubmit = async e => { e.preventDefault(); const f = e.target.elements, body = {op:'skill', text:f.text.value}; if(x) body.id = x.id; if(own) body.name = f.name.value;
    if(await plugDo(body, 'Zapisane.')) m.hidden = true; }; }
$('tab-ustawienia').addEventListener('change', e => { const b = e.target.closest('[data-plsw]'); if(b) plugDo({op:b.dataset.plsw, id:b.dataset.id, on:b.checked}); });
const openSite = u => { if(window.pywebview && window.pywebview.api && window.pywebview.api.open_url) window.pywebview.api.open_url(u); else window.open(u, '_blank', 'noopener'); };
const flip = (set, id, el) => { set.has(id) ? set.delete(id) : set.add(id); const r = el && el.closest('.plr'); if(r){ r.classList.toggle('open', set.has(id)); el.setAttribute('aria-expanded', set.has(id)); } else drawPlugins(); };
$('tab-ustawienia').addEventListener('click', async e => { const t = e.target, q = sel => t.closest(sel);
  if(q('#skillAdd')) return skillSheet(null);
  let el;
  if((el = q('[data-skill]'))) return flip(SKX, el.dataset.skill, el);
  if((el = q('[data-skedit]'))) return skillSheet(PLG.skills.find(x => x.id === el.dataset.skedit));
  if((el = q('[data-skreset]'))) return plugDo({op:'skill', id:el.dataset.skreset, reset:true}, 'Przywrócona.');
  if((el = q('[data-skdel]'))){ if(await ask('Usunąć tę umiejętność?', 'Agenci przestaną jej używać od następnego zadania.', 'Usuń', true)) plugDo({op:'skill_remove', id:el.dataset.skdel}, 'Umiejętność usunięta.'); return; }
  if((el = q('[data-scope]'))){ const [kind, id, who] = el.dataset.scope.split('|'), row = (kind === 'skill' ? PLG.skills : PLG.tools).find(x => x.id === id); if(!row) return;
    const now = (row.agents || []).slice(), next = who === '*' ? [] : now.includes(who) ? now.filter(z => z !== who) : now.concat(who); return plugDo({op:kind, id, agents:next}); }
});
/* ---------- ustawienia: okno nad programem, kategorie po lewej, wyszukiwanie ---------- */
const SETICO = ['M3 4.500h10M3 8h10M3 11.500h10M6 3v3M10.500 6.500v3M5 10v3', 'M8 7.300a2.600 2.600 0 1 0 0-5.200 2.600 2.600 0 0 0 0 5.200zM3 13.500c.500-2.700 2.500-4.100 5-4.100s4.500 1.400 5 4.100', 'M6 2.500v3M10 2.500v3M4.500 5.500h7v2.500a3.500 3.500 0 0 1-7 0zM8 11.500v2',
  'M5.500 7a2.200 2.200 0 1 0 0-4.400 2.200 2.200 0 0 0 0 4.400zM1.800 13c.300-2.300 1.800-3.500 3.700-3.500s3.400 1.200 3.700 3.500M10.800 5.500l1.300 1.300 2.400-2.600',
  'M8 2 3 4v4c0 3 2.200 5 5 6 2.800-1 5-3 5-6V4zM6 8l1.500 1.500L10.200 6.600', 'M8 2.300l1.600 3.500 3.800.400-2.800 2.600.800 3.800L8 10.700l-3.400 1.900.800-3.800-2.800-2.600 3.800-.400z',
  'M6.300 2.500h3.400v1.700a1.200 1.200 0 1 0 2.400 0V4.500h1.400v3.300h-1.300a1.300 1.300 0 1 0 0 2.600h1.300v3.100H9.900v-1.300a1.300 1.300 0 1 0-2.600 0v1.300H2.500v-3.200h1.300a1.300 1.300 0 1 0 0-2.600H2.500V4.500h3.800z'];
let SETCAT = 0;
function setDraw(){ const box = $('tab-ustawienia'), blocks = [...box.querySelectorAll('.block')], q = $('setSearch').value.trim().toLowerCase(); let hits = 0;
  $('setNav').innerHTML = blocks.map((b, i) => `<button type="button" data-setcat="${i}" class="${!q && i === SETCAT ? 'on' : ''}"><svg viewBox="0 0 16 16" width="15" height="15"><path d="${b.classList.contains('connectionssection') ? 'M5 2v3M11 2v3M3 5h10v3a5 5 0 0 1-10 0zM8 13v2' : (SETICO[i] || SETICO[0])}"/></svg>${esc(b.querySelector('h2').textContent)}</button>`).join('');
  blocks.forEach((b, i) => { const rows = [...b.querySelectorAll('.row, #providers > *, .plr, .cncard')]; let any = false;
    rows.forEach(r => { const on = !q || r.textContent.toLowerCase().includes(q); r.hidden = !on; any = any || on; });
    b.querySelectorAll('.grpbox').forEach(g => { const live = [...g.querySelectorAll('.row, #providers > *, .plr, .cncard')].some(r => !r.hidden); g.hidden = !live; if(g.previousElementSibling && g.previousElementSibling.classList.contains('grp')) g.previousElementSibling.hidden = !live; });
    b.querySelectorAll('.plhead, .plnote, .plempty').forEach(x => x.hidden = !!q);
    b.hidden = q ? !any : i !== SETCAT; b.classList.toggle('found', !!q); if(q && any) hits++; });
  $('setTitle').textContent = q ? tr('Wyniki wyszukiwania') : blocks[SETCAT].querySelector('h2').textContent; $('setLead').textContent = q ? '' : tr(blocks[SETCAT].dataset.lead || ''); $('setEmpty').hidden = !q || hits > 0;
  $('setVer').textContent = UPD && UPD.version ? `${tr('wersja')} ${UPD.version}` : ''; }
function setOpen(){ const box = $('tab-ustawienia'); if(!box.hidden) return; box.hidden = false; $('setSearch').value = ''; setDraw(); loadSettings(); loadPlugins(); loadStats(); loadConn(); if(!UPD) loadUpdate(false).then(() => setDraw()).catch(() => {}); if(popFor) popClose();
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === 'ustawienia')); requestAnimationFrame(() => box.classList.add('open')); }
function setClose(){ const box = $('tab-ustawienia'); if(box.hidden) return; box.classList.remove('open'); box.hidden = true; document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab)); }
$('setNav').addEventListener('click', e => { const b = e.target.closest('[data-setcat]'); if(!b) return; SETCAT = +b.dataset.setcat; $('setSearch').value = ''; setDraw(); $('setScroll').scrollTop = 0; });
$('setSearch').addEventListener('input', () => { setDraw(); filterConnections(); $('setScroll').scrollTop = 0; });
$('setClose').addEventListener('click', setClose);
$('tab-ustawienia').addEventListener('mousedown', e => { if(e.target === e.currentTarget) setClose(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !$('tab-ustawienia').hidden && $('modal').hidden && $('ctx').hidden) setClose(); });
function show(name){ if(name === 'agent' && cur) setTimeout(() => unreadClear(cur), 0);
  if(name === 'ustawienia') return setOpen();
  setClose();
  tab = document.getElementById('tab-' + name) ? name : 'agent';
  document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== 'tab-' + tab);
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  history.replaceState(null, '', '#' + (tab === 'agent' ? 'agent=' + cur : tab)); document.body.dataset.tab = tab; if(popFor) popClose(); if(tab !== 'agent') document.querySelector('.main').classList.remove('coding');
  if(tab === 'agent'){ try{ localStorage.setItem('lumobot-agent', cur); }catch(e){} fillFolder(); }
  if(tab === 'team'){ TEAMSIG = ''; drawTeam(); loadTeam(); }
  if(tab === 'logowania') loadLogins(); if(tab === 'szablony') drawTemplates(); if(tab === 'neuro') loadNeuro(); if(tab === 'kolejka'){ loadQueue(); loadSched(); loadReport(); } if(tab === 'zlecenia'){ drawOrderWho(); loadInbox(); } if(tab === 'plan') bView(BRV);
  redraw(); DOTS.wake(); DOTS_T.wake(); DOTS_O.wake();
}
document.querySelectorAll('[data-tab]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); show(a.dataset.tab); }));

/* tło z kropkami usunięte: animowane płótno kosztowało płynność okna. Uchwyty zostają, bo reszta kodu je woła. */
const DOTS = {busy:false, wake(){}}, DOTS_T = {wake(){}}, DOTS_O = {wake(){}};


/* ---------- okno aplikacji: własny pasek zamiast systemowego ---------- */
function nativeReady(){ const a = window.pywebview && window.pywebview.api; if(!a || !a.win) return; $('winBtns').hidden = false; $('grips').hidden = false; }
window.addEventListener('pywebviewready', nativeReady); nativeReady();
$('winBtns').addEventListener('click', e => { const b = e.target.closest('button'); if(b) window.pywebview.api.win(b.dataset.w); });
/* ---------- zegar pracy agenta: tyka co sekundę, bez przerysowania rozmowy ---------- */
setInterval(() => { const c = document.getElementById('liveClock'); if(!c || !S || !S.running || !S.rounds || !S.rounds.length) return;
  const sec = Math.max(0, Math.round((Date.now() - S.rounds[S.rounds.length - 1].t)/1000)); c.textContent = `${Math.floor(sec/60)}:${String(sec % 60).padStart(2, '0')}`;
  const q = document.getElementById('liveQuiet'); if(q){ const v = (S.quiet || 0) + (Date.now() - quietAt)/1000; q.textContent = S.phase === 'work' && v >= 60 ? `${tr('bez nowego kroku od')} ${Math.floor(v/60)} min` : ''; } }, 1000);
let quietAt = Date.now();

/* ---------- panel boczny: pełny albo wąski z samymi twarzami ---------- */
function setRail(on){ document.body.classList.toggle('rail', !!on); try{ localStorage.setItem('lumobot-rail', on ? '1' : ''); }catch(e){} if(popFor) popClose(); setTimeout(() => DOTS.wake(), 320); }
document.body.classList.add('rail');      // panel boczny jest zawsze zwinięty do samych buziek

(() => { const main = document.querySelector('.main'); let on = false; try{ const w = +localStorage.getItem('lumobot-codew'); if(w) main.style.setProperty('--codew', w + 'px'); }catch(e){}
  $('codePane').addEventListener('mousedown', e => { if(e.target.closest('[data-cpgrip]')){ on = true; e.preventDefault(); document.body.classList.add('resizing'); } });
  window.addEventListener('mousemove', e => { if(!on) return; const r = main.getBoundingClientRect(), w = Math.max(340, Math.min(r.width - 380, r.right - e.clientX)); main.style.setProperty('--codew', w + 'px'); });
  window.addEventListener('mouseup', () => { if(!on) return; on = false; document.body.classList.remove('resizing'); try{ localStorage.setItem('lumobot-codew', parseInt(getComputedStyle(main).getPropertyValue('--codew')) || ''); }catch(e){} }); })();
/* ---------- pasek tytułu: przesuwanie okna robi system, więc działa jak w każdym programie ---------- */
(() => { const papi = () => window.pywebview && window.pywebview.api; let last = 0, lx = 0, ly = 0;
  $('bar').addEventListener('mousedown', e => { if(e.button !== 0 || e.target.closest('button, a, input, .lang') || !papi() || !papi().drag) return;
    const now = Date.now(), twice = now - last < 420 && Math.abs(e.screenX - lx) < 6 && Math.abs(e.screenY - ly) < 6; last = twice ? 0 : now; lx = e.screenX; ly = e.screenY;
    e.preventDefault(); if(twice) papi().win('max'); else papi().drag(); }); })();

$('grips').addEventListener('mousedown', e => { const g = e.target.closest('i'); if(g && e.button === 0){ e.preventDefault(); window.pywebview.api.resize(+g.dataset.e); } });

(async () => {
  readTheme(); $('langBtn').textContent = LANG.toUpperCase();
  try{ [AG, MODELS] = await Promise.all([api('/api/agents'), api('/api/models')]); }catch(e){}
  const [h0, h1] = location.hash.slice(1).split('=');
  if(h0 === 'agent' && h1) cur = h1;
  if(h0 === 'nowy') openMaker(null); else show(h0 === 'agent' ? 'agent' : h0 || 'agent');
  if(MODELS.providers[0] && MODELS.providers[0].connected && !MODELS.checked && !MODELS.checking) api('/api/models/check', {}).then(() => setTimeout(watchModels, 800)).catch(() => {});      // pierwsze uruchomienie na tym koncie
  loadTemplates(); loadUsage(); setInterval(() => { if(!document.hidden) loadUsage(); }, 10000); setInterval(() => { if(popFor === 'use' && !document.hidden) loadUsage(); }, 3000); poll();
  const demo = new URLSearchParams(location.search).get('demo');
  if(demo === 'key') setTimeout(() => { show('ustawienia'); keySheet(MODELS.providers.find(p => p.id === 'custom')); }, 1600);
  if(demo === 'steps') setTimeout(async () => { const b = [...document.querySelectorAll('.stepsum')].pop(); if(!b) return; b.click(); await new Promise(r => setTimeout(r, 400)); const c = [...document.querySelectorAll('.stepslist [data-sx]')].find(x => x.closest('.actstep').querySelector('span').textContent === tr('Polecenie')); if(c) c.click(); }, 1500);
  if(demo === 'voice') setTimeout(() => voiceOpen('agent'), 3500);
  if(demo === 'zoom') setTimeout(() => { const b = [...document.querySelectorAll('.msg .shot')].pop(); if(b) lbOpen(b); }, 1500);
  if(demo === 'rmb') setTimeout(() => { F.goal.value = 'Zrób stronę kawiarni'; F.goal.focus(); F.goal.setSelectionRange(5, 11); const r = F.goal.getBoundingClientRect(); F.goal.dispatchEvent(new MouseEvent('contextmenu', {bubbles:true, cancelable:true, clientX:r.left + 120, clientY:r.top - 190})); }, 1500);
  if(demo === 'ctxchat') setTimeout(() => { const el = [...document.querySelectorAll('#chat .say')].pop() || $('chat'); const g = getSelection(), rg = document.createRange(); rg.selectNodeContents(el); g.removeAllRanges(); g.addRange(rg); const r = el.getBoundingClientRect(); el.dispatchEvent(new MouseEvent('contextmenu', {bubbles:true, cancelable:true, clientX:r.left + 140, clientY:r.top + 20})); }, 1500);
  if(demo === 'mem') setTimeout(() => memorySheet(agentOf(cur)), 1500);
  if(demo === 'qa') setTimeout(() => { const b = document.querySelectorAll('.askopt')[1]; if(b) b.click(); }, 1500);
  if(demo === 'qb') setTimeout(async () => { const b = document.querySelector('.askopt.other'); if(!b) return; b.click(); await new Promise(r => setTimeout(r, 500)); const i = document.querySelector('.askopt.other input'); if(i){ i.value = 'Ciemnozielony, jak na logo'; } }, 1500);
  if(demo === 'upd') setTimeout(() => { window.UPDDEMO = true; UPD = {version:'0.3.3', latest:'0.4.0', mark:'demo', behind:1, source:'x', notes:['Karta aktualizacji z przyciskiem i krzyżykiem', 'Aktualizacja automatyczna przy starcie', 'Poprawki szybkości skrzynki zleceń']}; drawUpdate(); }, 1500);
  if(demo === 'packs') setTimeout(() => $('packBtn').click(), 1800);
  if(demo === 'ctx') setTimeout(ctxPop, 1600); if(demo === 'use') setTimeout(usePop, 1600); if(demo === 'diff') setTimeout(() => { const b = document.querySelector('.edited'); if(b) b.click(); }, 1600);      // podglad stanow do zrzutow ekranu
  if(demo) setTimeout(() => { if(demo === 'pick') $('modelPick').classList.add('open'); if(demo === 'conn') connectSheet(MODELS.providers[1], {step:'install'}); if(demo === 'toast') toast('Zatrzymane.'); if(demo === 'ask') ask('Wyczyścić rozmowę?', 'Zadania tego agenta znikną z rozmowy i trafią do archiwum. Sieć Neuro dalej się z nich uczy.', 'Wyczyść', true); if(demo === 'busy'){ const a = agentOf(cur), row = $('agents').querySelector('.agent.on'); row.querySelector('.facewrap').outerHTML = faceAI(a, 42, true); row.querySelector('small').innerHTML = `<span class="working"><i></i><i></i><i></i>${tr('Pracuje')}</span>`; } if(demo === 'opts'){ advanced(true); UPD = {version:'0.2.0', build:'demo', source:'x', behind:1, notes:['Nowy panel raportu porannego'], checked:Date.now()}; drawUpdate(); } if(demo === 'menu'){ const r = $('agents').firstElementChild.getBoundingClientRect(); agentMenu(agentOf(cur), r.right - 40, r.bottom - 10); } }, 1500);
})();
loadPacks(); setTimeout(() => loadInbox(true, true), 1500);

/* ---------- podpowiedzi w stylu aplikacji zamiast systemowych ---------- */
(() => { const tip = document.createElement('div'); tip.className = 'tip2'; tip.hidden = true; document.body.appendChild(tip); let timer = 0, cur = null;
  const hide = () => { clearTimeout(timer); tip.classList.remove('on'); tip.hidden = true; cur = null; };
  document.addEventListener('mouseover', e => { const el = e.target.closest && e.target.closest('[title],[data-tip]'); if(!el || el === cur) return; hide(); cur = el;
    if(el.hasAttribute('title')){ el.dataset.tip = el.getAttribute('title'); if(!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.dataset.tip); el.removeAttribute('title'); }
    const text = el.dataset.tip; if(!text) return;
    timer = setTimeout(() => { if(!document.body.contains(el)) return; tip.textContent = text; tip.hidden = false; const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
      let x = r.left + r.width / 2 - t.width / 2, y = r.top - t.height - 8; if(y < 6) y = r.bottom + 8; x = Math.max(8, Math.min(innerWidth - t.width - 8, x)); tip.style.left = x + 'px'; tip.style.top = y + 'px'; requestAnimationFrame(() => tip.classList.add('on')); }, 380); });
  document.addEventListener('mouseout', e => { if(cur && !cur.contains(e.relatedTarget)) hide(); });
  document.addEventListener('mousedown', hide, true); document.addEventListener('scroll', hide, true); })();

/* ---------- plus: pliki, rozmowa głosowa, dyktowanie, zrzut ekranu ---------- */
let AUTOREAD = false; try{ AUTOREAD = localStorage.getItem('lumobot-autoread') === '1'; }catch(e){}
function plusMenu(btn, where){ const r = btn.getBoundingClientRect(), items = [];
  const solo = where === 'agent' || where === 'live';
  if(solo) items.push({label:'Dodaj pliki', icon:'clip', run:() => $('fileIn').click()});
  items.push({label: where === 'team' ? 'Rozmowa głosowa z zespołem' : 'Rozmowa głosowa z agentem', icon:'mic', run:() => voiceOpen(where === 'live' ? 'agent' : where)});
  items.push({label:'Dyktuj do pola', icon:'mic', run:() => dictate(where)});
  if(solo) items.push({label:'Zrzut ekranu', icon:'shot', run:screenGrab});
  items.push({label:'Czytaj odpowiedzi na głos', icon:'speak', on:AUTOREAD, run:() => { AUTOREAD = !AUTOREAD; try{ localStorage.setItem('lumobot-autoread', AUTOREAD ? '1' : ''); }catch(e){} toast(AUTOREAD ? 'Odpowiedzi agentów będą czytane na głos.' : 'Czytanie odpowiedzi wyłączone.'); }});
  ctxMenu(r.left, r.top - 8, items, true); }
$('plusBtn').addEventListener('click', e => plusMenu(e.currentTarget, liveOn() ? 'live' : 'agent'));
$('teamPlus').addEventListener('click', e => plusMenu(e.currentTarget, 'team'));
async function screenGrab(){ const nat = window.pywebview && window.pywebview.api; toast('Zrzut ekranu za chwilę.'); if(nat && nat.win) nat.win('min'); await new Promise(r => setTimeout(r, 1300));
  try{ const r = await fetch('/api/screen', {method:'POST'}), d = await r.json(); if(!r.ok) throw new Error(d.detail || 'Nie udało się zrobić zrzutu.'); ATT.push(Object.assign(d, {busy:false})); drawAttach(); }catch(err){ toast(err.message, true); }
  if(nat && nat.win) nat.win('restore'); }

const VO = {speakTok:0, open:false, mode:'agent', state:'idle', lvl:0, stream:null, ac:null, proc:null, src:null, ana:null, listen:false, inDev:'', outDev:'', cur:null, token:0, since:0, seen:new Set(), turns:[], dict:null, cal:{floor:.004}, speaking:'', status:{ready:false, engine:true, mb:53, download:{state:'idle'}}, voices:[], levelRaf:0};
const vget = k => { try{ return localStorage.getItem('lumobot-voice-' + k) || ''; }catch(e){ return ''; } }, vset = (k, v) => { try{ localStorage.setItem('lumobot-voice-' + k, v); }catch(e){} };
const vlang = () => { const v = vget('lang'); if(v === 'pl' || v === 'en') return v; return String(navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : LANG === 'en' ? 'en' : 'pl'; };      // rozmawiasz w języku systemu, a nie w języku napisów w oknie
async function voiceStatus(){ try{ const s = await api('/api/voice/status?lang=' + vlang()); VO.status = s; VO.voices = s.voices || []; }catch(e){} return VO.status; }
function vparams(id){ const i = Math.max(0, AG.findIndex(x => x.id === id)), P = [[-1,0],[-1,0],[-1,1],[-1,-1],[0,0],[-1,0],[-1,2],[-1,-2]][i % 8]; return {rate:P[0], pitch:P[1], slot:i}; }
function vac(){ if(!VO.ac){ VO.ac = new (window.AudioContext || window.webkitAudioContext)(); VO.ana = VO.ac.createAnalyser(); VO.ana.fftSize = 512; VO.ana.connect(VO.ac.destination); } return VO.ac; }
async function vsink(){ const ac = vac(); if(ac.state === 'suspended') await ac.resume(); try{ if(ac.setSinkId) await ac.setSinkId(VO.outDev || ''); }catch(e){} }
async function vcStop(){ VO.listen = false; try{ if(VO.proc){ VO.proc.disconnect(); VO.proc.onaudioprocess = null; } if(VO.src) VO.src.disconnect(); if(VO.stream) VO.stream.getTracks().forEach(t => t.stop()); }catch(e){} VO.proc = VO.src = VO.stream = null; }
function vdown(x, sr){ const k = sr / 16000, len = Math.floor(x.length / k), out = new Int16Array(len); for(let i = 0; i < len; i++){ let s = 0; const a0 = Math.floor(i * k), a1 = Math.min(x.length, Math.floor((i + 1) * k)); for(let j = a0; j < a1; j++) s += x[j]; out[i] = Math.max(-1, Math.min(1, s / Math.max(1, a1 - a0))) * 32767; } return out.buffer; }
async function vcStart(onText){ await vcStop(); const ac = vac(); if(ac.state === 'suspended') await ac.resume();
  const cons = {audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true}}; if(VO.inDev) cons.audio.deviceId = {exact:VO.inDev};
  try{ VO.stream = await navigator.mediaDevices.getUserMedia(cons); }catch(err){ if(VO.inDev){ VO.inDev = ''; vset('in', ''); VO.stream = await navigator.mediaDevices.getUserMedia({audio:true}); } else throw err; }
  VO.src = ac.createMediaStreamSource(VO.stream); VO.proc = ac.createScriptProcessor(4096, 1, 1); VO.src.connect(VO.proc); VO.proc.connect(ac.destination);
  const sr = ac.sampleRate, dur = 4096 / sr * 1000; let speech = false, quiet = 0, total = 0, pre = [], hot = 0, sid = '', chain = Promise.resolve();
  const feed = buf => { const q = '/api/voice/stt/feed?sid=' + sid + '&lang=' + vlang(); chain = chain.then(() => fetch(q, {method:'POST', body:buf}).catch(() => {})); };
  VO.proc.onaudioprocess = e => { const x = e.inputBuffer.getChannelData(0); let s = 0; for(let i = 0; i < x.length; i++) s += x[i] * x[i]; const rms = Math.sqrt(s / x.length); VO.lvl = VO.lvl * .55 + Math.min(1, rms * 9) * .45; const copy = new Float32Array(x);
    if(vptt()){      // przytrzymaj i mów: nagrywamy dokładnie tyle, ile trwa przytrzymanie, bez zgadywania po ciszy
      if(VO.hold){ hot = 0; if(!speech){ speech = true; sid = 's' + Date.now() + Math.random().toString(36).slice(2, 6); chain = Promise.resolve(); total = 0; pre.forEach(p => feed(vdown(p, sr))); pre = []; } feed(vdown(copy, sr)); total += dur; if(total > 60000){ VO.hold = false; vui(); } return; }
      if(speech){ speech = false; const my = sid, mine = chain, len = total; total = 0; quiet = 0; const end = () => mine.then(() => fetch('/api/voice/stt/end?sid=' + my, {method:'POST'})).then(r => r.json()).then(d => d.text || '').catch(() => '');
        if(len < 250){ end(); return; } VO.listen = false; VO.state = 'understanding'; vui(); end().then(onText); return; }
      pre.push(copy); if(pre.length > 3) pre.shift(); return; }
    if(!VO.listen){ speech = false; quiet = 0; total = 0; pre.push(copy); if(pre.length > 5) pre.shift();
      if(VO.cur && rms > .07){ if(++hot >= 3){ hot = 0; if(VO.onBarge) VO.onBarge(); } } else hot = 0; return; }
    hot = 0; if(!speech) VO.cal.floor = VO.cal.floor * .97 + rms * .03; const thr = Math.max(.014, VO.cal.floor * 3);
    if(rms > thr){ if(!speech){ speech = true; sid = 's' + Date.now() + Math.random().toString(36).slice(2, 6); chain = Promise.resolve(); total = 0; pre.forEach(p => feed(vdown(p, sr))); pre = []; } quiet = 0; } else if(speech) quiet += dur;
    if(speech){ feed(vdown(copy, sr)); total += dur; } else { pre.push(copy); if(pre.length > 3) pre.shift(); }
    if(speech && (quiet > 700 || total > 24000)){ speech = false; const my = sid, mine = chain, len = total - quiet; quiet = 0; total = 0; const end = () => mine.then(() => fetch('/api/voice/stt/end?sid=' + my, {method:'POST'})).then(r => r.json()).then(d => d.text || '').catch(() => '');
      if(len < 300){ end(); return; } VO.listen = false; VO.state = 'understanding'; vui(); end().then(onText); } }; }
function vchunks(text){ const clean = String(text || '').replace(/```[\s\S]*?```/g, ' ').replace(/\s+/g, ' ').trim(), parts = clean.match(/[^.!?]+[.!?]*\s*/g) || [clean], out = []; let cur = '';
  parts.forEach(p => { if((cur + p).length > 110 && cur){ out.push(cur); cur = p; } else cur += p; }); if(cur.trim()) out.push(cur); return out.slice(0, 5); }
async function vspeak(text, agentId){ const ac = vac(); await vsink(); const prm = vparams(agentId), voice = vget('voice') || (VO.voices.find(v => v.lang.startsWith(vlang())) || {}).name || '', tok = ++VO.speakTok;
  const fetchPart = async t => { const r = await fetch('/api/voice/tts', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:t, voice, rate:prm.rate, pitch:prm.pitch, slot:prm.slot, lang:vlang(), engine:vget('engine') || 'neural', neural:(agentOf(agentId) || {}).voice || ''})});
    if(!r.ok){ const d = await r.json().catch(() => ({})); throw new Error(d.detail || 'Nie udało się wygenerować mowy.'); } return ac.decodeAudioData(await r.arrayBuffer()); };
  const jobs = vchunks(text).map(fetchPart);                                  // wszystkie kawałki generują się naraz, a pierwszy rusza, gdy tylko jest gotowy
  VO.speaking = agentId;
  for(const job of jobs){ if(tok !== VO.speakTok) return; const buf = await job; if(tok !== VO.speakTok) return;
    await new Promise(done => { const src = ac.createBufferSource(); src.buffer = buf; src.playbackRate.value = vopt().speed; src.connect(VO.ana); VO.cur = {src, done}; src.onended = () => { if(VO.cur && VO.cur.src === src) VO.cur = null; done(); }; src.start(); }); }
  if(tok === VO.speakTok) VO.speaking = ''; }
function vstopSpeak(){ VO.speakTok++; VO.speaking = ''; if(VO.cur){ const c = VO.cur; VO.cur = null; VO.speaking = ''; try{ c.src.onended = null; c.src.stop(); }catch(e){} c.done(); } }
function vlevel(){ cancelAnimationFrame(VO.levelRaf); const el = $('voice'), buf = new Uint8Array(256); const loop = () => { if(!VO.open) return; let l = VO.lvl;
    if(VO.cur && VO.ana){ VO.ana.getByteTimeDomainData(buf); let s = 0; for(let i = 0; i < buf.length; i++){ const d = (buf[i] - 128) / 128; s += d * d; } l = Math.min(1, Math.sqrt(s / buf.length) * 5); }
    el.style.setProperty('--lvl', l.toFixed(3)); document.querySelectorAll('#voice .vbars i, #vbar .vb i').forEach((b, i) => b.style.setProperty('--h', (.12 + Math.min(1, l * (.5 + .5 * Math.sin(Date.now() / 120 + i * .9)) + (VO.state === 'listening' ? .04 : 0))).toFixed(3)));
    if(VBC && Date.now() - (VO.lvlAt || 0) > 70){ VO.lvlAt = Date.now(); VBC.postMessage({vlvl:+l.toFixed(2)}); }      // słupki na wyspie
    VO.levelRaf = requestAnimationFrame(loop); }; loop(); }
const VSTATE = {idle:'Wyciszony', setup:'Najpierw model mowy', listening:'Słucham', understanding:'Rozpoznaję', working:'Pracuję', thinking:'Myślę', speaking:'Mówię'};
const vopt = () => ({chat: vget('chat') === '1', text: vget('text') !== '0', speed: 1});
function vsay(role, text, who){ VO.turns.push({role, text, who}); if(VO.turns.length > 30) VO.turns.shift(); vcap(); }
function vcap(){ vpillCap(); const el = $('voice').querySelector('.vcap'); if(!el) return; const o = vopt(), last = VO.turns.slice(-2);
  el.hidden = !o.text || !last.length; el.innerHTML = last.map(x => x.role === 'me' ? `<p class="me">${esc(x.text.slice(0, 220))}</p>` : `<p class="ai">${esc(x.text.slice(0, 260))}</p>`).join(''); }
const VBC = (() => { try{ return new BroadcastChannel('lumobot'); }catch(e){ return null; } })(); let vlast = '';
function vcast(){ if(!VBC) return; const s = VO.open ? (VO.state || 'idle') : '', last = VO.turns[VO.turns.length - 1], m = {voice:s, agent:cur, ptt:vptt(), hold:!!VO.hold, speed:vopt().speed, ready:!!(VO.status && VO.status.ready), dl:(d => d.state === 'run' && d.total ? Math.round(d.done / d.total * 100) : -1)((VO.status && VO.status.download) || {}), cap:s && last ? String(last.text || '').slice(0, 120) : ''}, k = JSON.stringify(m); if(k === vlast) return; vlast = k; VBC.postMessage(m); }      // wyspa na górze ekranu pokazuje i steruje rozmową
const vIsland = () => !!window.pywebview;      // w programie na pulpicie pigułką rozmowy jest wyspa; pasek w oknie zostaje jako zapas
function vmode(m){ vset('ptt', m === 'ptt' ? '1' : '0'); VO.hold = false; if(['listening', 'idle'].includes(VO.state)) vlisten(); else vui(); }
function vspeedNext(){ const L = [1, 1.25, 1.5, 0.85], c = vopt().speed, n = L[(L.indexOf(c) + 1) % L.length]; vset('speed', String(n)); if(VO.cur) try{ VO.cur.src.playbackRate.value = n; }catch(err){} vui(); }
function vmicToggle(){ if(VO.state === 'listening'){ VO.listen = false; VO.state = 'idle'; vui(); } else if(VO.state === 'idle' || VO.state === 'speaking'){ vstopSpeak(); vlisten(); } }
function vstopNow(){ vstopSpeak(); if(VO.state === 'speaking') vlisten(); }
function vswitch(id){ if(!VO.open || !agentOf(id) || id === cur) return; vstopSpeak(); VO.hold = false; VO.token++; cur = id; VO.turns = []; if(tab === 'agent') show('agent'); else redraw(); vlisten(); vcap(); }      // rozmowa przechodzi do innego agenta bez zamykania
$('voiceBtn').addEventListener('click', () => { if(VO.open) voiceClose(); else voiceOpen(tab === 'team' ? 'team' : 'agent'); });
function vpadPress(){ if(vptt()) vhold(true); else if(VO.state === 'speaking'){ vstopSpeak(); vlisten(); } }
function vui(){ const root = $('voice'); vcast(); vpill(); $('voiceBtn').classList.toggle('on', !!VO.open); if(!VO.open) return; root.dataset.state = VO.state;
  const stage = root.querySelector('.vstage'), a = agentOf(cur), team = VO.mode === 'team', crew = AG.slice(0, 6);
  const busy = VO.state === 'working' || VO.state === 'understanding' || VO.state === 'thinking';
  const faceOf = (x, size) => face(x, size, busy && (!team || x.id === (agentOf(TL) || {}).id) ? 'busy' : '');
  const key = [VO.mode, a && a.id, team ? VO.speaking : '', busy].join('|');
  if(stage.dataset.k !== key){ stage.dataset.k = key; stage.innerHTML = team ? `<div class="vcrew">${crew.map(x => `<span class="vm${VO.speaking === x.id ? ' on' : ''}">${faceOf(x, 54)}<i>${esc(x.name)}</i></span>`).join('')}</div>`
    : `<div class="vface"><span class="vfc">${faceOf(a, 132)}</span></div>`; }
  root.querySelector('.vname').textContent = team ? tr('Cały zespół') : a.name;
  root.querySelector('.vstate').textContent = tr(VSTATE[VO.state] || '') + (VO.state === 'working' || VO.state === 'thinking' ? '…' : '');
  const need = !VO.status.ready; root.querySelector('.vsetup').hidden = !need; root.querySelector('.vmain').hidden = need; if(need) vsetup();
  root.querySelectorAll('[data-vmic],[data-vspeed],[data-vstop]').forEach(b => b.disabled = need);
  root.querySelector('.vmic').classList.toggle('on', VO.state === 'listening'); root.querySelector('.vmic').classList.toggle('off', VO.state === 'idle');
  root.querySelector('[data-vspeed]').textContent = vopt().speed + '×'; }
function vsetup(){ const box = $('voice').querySelector('.vsetup'), d = VO.status.download || {}, run = d.state === 'run', pct = d.total ? Math.round(d.done / d.total * 100) : 0;
  box.innerHTML = !VO.status.engine ? `<b>${tr('Rozpoznawanie mowy jest niedostępne w tej wersji programu.')}</b>`
    : `<span class="vsico"><svg viewBox="0 0 16 16" width="22" height="22">${IC.mic}</svg></span><b>${tr('Do rozmowy głosowej potrzebny jest model mowy')}</b><small>${VO.status.mb} MB · ${tr('pobierasz go raz, potem działa bez internetu, a nagrania nie opuszczają komputera')}</small>${d.state === 'error' ? `<small class="bad">${esc(d.error || '')}</small>` : ''}${run ? `<u class="vprog"><i style="width:${pct}%"></i></u>` : ''}<button type="button" class="primary" data-vdl ${run ? 'disabled' : ''}>${run ? pct + '%' : tr('Zainstaluj')}</button>`;
  if(VO.status.engine && !VO.status.ready && !run && d.state !== 'error' && !VO.autoDl){ VO.autoDl = true; setTimeout(() => { const b = box.querySelector('[data-vdl]'); if(b && !b.disabled) b.click(); }, 300); } }
async function vdevices(){ try{ const all = await navigator.mediaDevices.enumerateDevices(), ins = all.filter(d => d.kind === 'audioinput'), outs = all.filter(d => d.kind === 'audiooutput'), root = $('voice');
    const fill = (sel, list, cur, def) => { sel.innerHTML = `<option value="">${tr(def)}</option>` + list.filter(d => d.deviceId !== 'default' && d.deviceId !== 'communications').map(d => `<option value="${esc(d.deviceId)}">${esc((d.label || tr('Urządzenie')).replace(/^(Domyślny|Komunikacja) - /, ''))}</option>`).join(''); sel.value = list.some(d => d.deviceId === cur) ? cur : ''; };
    root.querySelector('#vEng').value = vget('engine') || 'neural'; const vl = root.querySelector('#vLang'); if(vl) vl.value = vget('lang') || ''; const av = root.querySelector('#vAV'); if(av) av.value = (agentOf(cur) || {}).voice || ''; const md = root.querySelector('#vMD'); if(md){ md.innerHTML = `<option value="">${tr('Model agenta')}</option>` + MODELS.models.filter(m => m.available).map(m => `<option value="${esc(m.id)}">${esc(tr(m.name))}</option>`).join(''); md.value = vget('vmodel'); } fill(root.querySelector('#vIn'), ins, VO.inDev, 'Domyślny mikrofon'); fill(root.querySelector('#vOut'), outs, VO.outDev, 'Domyślne głośniki'); }catch(e){} }
async function vsendAgent(text){ const a = agentOf(cur); VO.state = 'working'; vui();
  try{ if(S && S.running && S.config && S.config.agent === a.id){ await api('/api/super/note', {text, agent:a.id, run:S.id}); }
    else await api('/api/super', {agent:a.id, folder:a.project || '', check:'', goal:text, mode:(S && S.defaults && S.defaults.mode) || 'full', max_rounds:(S && S.defaults && S.defaults.max_rounds) || 30, checkpoints:!!(S && S.defaults && S.defaults.checkpoints), files:[]});
    const t0 = Date.now(); let seen = false; const tok = VO.token;
    while(VO.open && VO.token === tok){ await poll(); if(S && S.running) seen = true; if((seen && !(S && S.running)) || (!seen && Date.now() - t0 > 20000)) break; await new Promise(r => setTimeout(r, 900)); }
    if(!VO.open || VO.token !== tok) return null; const R = (S && S.rounds) || [], last = (R[R.length - 1] || {}).agent || ''; return {text: last || (S && S.error) || 'Gotowe.', who:a.name, id:a.id, ok:!(S && S.outcome && failed(S.outcome))};
  }catch(err){ return {text:err.message, who:a.name, id:a.id, ok:false}; } }
async function vquick(text){ const a = agentOf(cur), tok = VO.token; VO.state = 'thinking'; vui();
  try{ const d = await api('/api/voice/ask', {agent:a.id, text, history:VO.turns.slice(-7, -1), lang:vlang(), model:vget('vmodel')}); if(!VO.open || VO.token !== tok) return null; return {text:d.text, who:a.name, id:a.id, ok:true}; }
  catch(err){ return {text:err.message, who:a.name, id:a.id, ok:false}; } }
async function vsendTeam(text){ const tok = VO.token; VO.state = 'working'; vui(); VO.since = Date.now() - 1500;
  try{ if(TEAM.running) TEAM = await api('/api/team/say', {text, to:'all'});
    else { const a = agentOf(TL) || AG[0]; await api('/api/super', {agent:a.id, folder:TFOLDER || a.project || '', check:'', goal:text, mode:(S && S.defaults && S.defaults.mode) || 'full', max_rounds:(S && S.defaults && S.defaults.max_rounds) || 30, checkpoints:!!(S && S.defaults && S.defaults.checkpoints), files:[]}); }
    const t0 = Date.now(); let seen = false;
    while(VO.open && VO.token === tok){ await poll(); try{ TEAM = await api('/api/teamfeed'); }catch(e){}
      if(S && S.running) seen = true; const say = (TEAM.events || []).filter(e => (e.kind === 'reply' || e.kind === 'say') && !VO.seen.has(e.id) && e.t >= VO.since && e.from !== 'user' && !e.failed);
      for(const e of say){ VO.seen.add(e.id); if(VO.skipAt && e.t <= VO.skipAt) continue; const w = agentOf(e.from); vsay('ai', e.text, w ? w.name : ''); VO.state = 'speaking'; vui(); try{ await vspeak(e.text, e.from); }catch(err){ toast(err.message, true); } if(!VO.open || VO.token !== tok) return null; VO.state = 'working'; vui(); }
      if((seen && !(S && S.running)) || (!seen && Date.now() - t0 > 20000)) break; await new Promise(r => setTimeout(r, 900)); }
    if(!VO.open || VO.token !== tok) return null; const lead = agentOf((S && S.config && S.config.agent) || TL) || AG[0], R = (S && S.rounds) || [], last = (R[R.length - 1] || {}).agent || ''; return {text:last || 'Gotowe.', who:lead.name, id:lead.id, ok:true};
  }catch(err){ return {text:err.message, who:'', id:'', ok:false}; } }
async function vturn(text){ const tok = VO.token; vsay('me', text); const o = vopt(), res = VO.mode === 'team' ? await vsendTeam(text) : o.chat ? await vsendAgent(text) : await vquick(text); if(!res || !VO.open || VO.token !== tok) return;
  vsay('ai', res.text, res.who); VO.state = 'speaking'; vui(); try{ await vspeak(res.text, res.id); }catch(err){ toast(err.message, true); } if(!VO.open || VO.token !== tok) return; vlisten(); }
function vlisten(){ if(!VO.open) return; VO.state = VO.status.ready ? 'listening' : 'setup'; VO.listen = VO.status.ready; vui(); }
async function vheard(text){ const tok = VO.token; if(!VO.open || VO.token !== tok) return; if(!text){ vlisten(); return; } await vturn(text); }
const VICO = {mic:'<rect x="6" y="2" width="4" height="7.5" rx="2"/><path d="M3.8 7.5a4.2 4.2 0 0 0 8.4 0M8 11.7V14"/>', micoff:'<rect x="6" y="2" width="4" height="7.5" rx="2"/><path d="M3.8 7.5a4.2 4.2 0 0 0 8.4 0M8 11.7V14M2.500 2.500l11 11"/>', stop:'<rect x="4.500" y="4.500" width="7" height="7" rx="1.500"/>', end:'<path d="M4 4l8 8M12 4l-8 8"/>', gear:'<circle cx="8" cy="8" r="2"/><path d="M8 2v1.600M8 12.400V14M2 8h1.600M12.400 8H14M3.800 3.800l1.100 1.100M11.100 11.100l1.100 1.100M12.200 3.800l-1.100 1.100M4.900 11.100l-1.100 1.100"/>', wave:'<path d="M3 6v4M6 3.500v9M9 5.500v5M12 4v8"/>'};
const vsvg = (k, z) => `<svg viewBox="0 0 16 16" width="${z || 17}" height="${z || 17}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${VICO[k]}</svg>`;
async function voiceOpen(where){ if(VO.open) return; VO.open = true; VO.mode = where; VO.turns = []; VO.seen = new Set(); VO.token++; VO.inDev = vget('in'); VO.outDev = vget('out'); VO.skipAt = 0; VO.onBarge = () => { VO.skipAt = Date.now(); vstopSpeak(); VO.state = 'listening'; VO.listen = true; vui(); }; const root = $('voice'), o = vopt();
  root.innerHTML = `<div class="vhead"><span class="vpill">${vsvg('wave')}${tr('Głos')}</span><span class="grow"></span><button type="button" class="vib" data-vgear title="${tr('Ustawienia głosu')}">${vsvg('gear')}</button><button type="button" class="vib" data-vclose title="${tr('Zamknij')}">${vsvg('end')}</button></div>`
    + `<div class="vset" hidden><label><span>${tr('Mikrofon')}</span><select id="vIn"></select></label><label><span>${tr('Głośniki')}</span><select id="vOut"></select></label>`
    + `<label><span>${tr('Język rozmowy')}</span><select id="vLang"><option value="">${tr('Jak w systemie')}</option><option value="pl" data-keep>Polski</option><option value="en" data-keep>English</option></select></label><label><span>${tr('Głos')}</span><select id="vEng"><option value="neural">${tr('Naturalny, neuronowy (wymaga internetu)')}</option><option value="system">${tr('Systemowy (offline)')}</option></select></label>`
    + `<label><span>${tr('Głos tego agenta')}</span><select id="vAV"><option value="">${tr('Automatycznie')}</option><option value="pl-PL-ZofiaNeural">Zofia (${tr('kobiecy')})</option><option value="pl-PL-MarekNeural">Marek (${tr('męski')})</option><option value="en-US-AvaMultilingualNeural">Ava (${tr('kobiecy')}, ${tr('wielojęzyczny')})</option><option value="en-US-BrianMultilingualNeural">Brian (${tr('męski')}, ${tr('wielojęzyczny')})</option><option value="fr-FR-VivienneMultilingualNeural">Vivienne (${tr('kobiecy')}, ${tr('wielojęzyczny')})</option></select></label>`
    + `<label><span>${tr('Model do rozmowy')}</span><select id="vMD"></select></label>`
    + `<label class="vsw"><span>${tr('Wpływa na czat')}<small>${tr('Rozmowa staje się prawdziwym zadaniem agenta i zostaje w czacie. Wyłączone: krótka rozmowa bez śladu.')}</small></span><span class="switch"><input type="checkbox" id="vChat" ${o.chat ? 'checked' : ''}><i></i></span></label>`
    + `<label class="vsw"><span>${tr('Pokazuj tekst')}<small>${tr('Napisy z rozmowy pod postacią.')}</small></span><span class="switch"><input type="checkbox" id="vText" ${o.text ? 'checked' : ''}><i></i></span></label>`
    + `<button type="button" class="vtest" data-vtest>${tr('Sprawdź głos')}</button></div>`
    + `<div class="vmain"><div class="vstage"></div><div class="vname"></div><div class="vstate"></div><div class="vbars">${'<i></i>'.repeat(24)}</div><div class="vcap"></div></div><div class="vsetup" hidden></div>`
    + `<form class="vtypebox"><input type="text" class="vtype" placeholder="${tr('Albo wpisz i wciśnij Enter')}" autocomplete="off"></form>`
    + `<div class="vctl"><button type="button" class="vbtn" data-vspeed title="${tr('Szybkość mowy')}">1×</button><button type="button" class="vbtn vmic" data-vmic title="${tr('Mikrofon: włącz albo wycisz')}"><span class="mi on">${vsvg('mic', 26)}</span><span class="mi off">${vsvg('micoff', 26)}</span></button><button type="button" class="vbtn" data-vstop title="${tr('Przerwij mówienie')}">${vsvg('stop', 26)}</button><button type="button" class="vbtn vend" data-vclose title="${tr('Zakończ rozmowę')}">${vsvg('end', 26)}</button></div>`;
  // rozmowa zaczyna się jako mała pigułka; pełny panel otwiera przycisk ustawień
  VO.wide = false; VO.hold = false; root.hidden = false; root.classList.add('tucked'); requestAnimationFrame(() => root.classList.add('open')); vlevel(); await voiceStatus(); vui(); vcap();
  try{ await vcStart(vheard); await vdevices(); await vsink(); }catch(err){ toast(/Permission|NotAllowed/i.test(err.name + err.message) ? 'Brak dostępu do mikrofonu. Zezwól na niego w ustawieniach Windows.' : err.message, true); }
  if(VO.status.ready) vlisten(); else{ VO.state = 'setup'; vui(); } }
async function voiceClose(){ VO.open = false; VO.hold = false; VO.token++; vcast(); vpill(); $('voiceBtn').classList.remove('on'); vstopSpeak(); await vcStop(); VO.state = 'idle'; const root = $('voice'); root.classList.remove('open'); document.body.classList.remove('voice-open'); setTimeout(() => { if(!VO.open){ root.hidden = true; root.innerHTML = ''; } }, 320); }
$('voice').addEventListener('click', async e => { if(e.target.closest('[data-vclose]')){ voiceClose(); return; }
  if(e.target.closest('[data-vgear]')){ const s = $('voice').querySelector('.vset'); s.hidden = !s.hidden; return; }
  if(e.target.closest('[data-vdl]')){ await api('/api/voice/download', {lang:vlang()}); const tick = async () => { await voiceStatus(); if(VO.open) vsetup(); if(VO.status.ready){ vui(); if(VO.open){ try{ await vcStart(vheard); }catch(err){} vlisten(); } return; } if(VO.open && (VO.status.download || {}).state === 'run') setTimeout(tick, 900); else if(VO.open) vsetup(); }; tick(); return; }
  if(e.target.closest('[data-vstop]')){ vstopSpeak(); if(VO.state === 'speaking') vlisten(); return; }
  if(e.target.closest('[data-vspeed]')){ const L = [1, 1.25, 1.5, 0.85], c = vopt().speed, n = L[(L.indexOf(c) + 1) % L.length]; vset('speed', String(n)); if(VO.cur) try{ VO.cur.src.playbackRate.value = n; }catch(err){} vui(); return; }
  if(e.target.closest('[data-vmic]')){ if(VO.state === 'listening'){ VO.listen = false; VO.state = 'idle'; vui(); } else if(VO.state === 'idle' || VO.state === 'speaking'){ vstopSpeak(); vlisten(); } return; }
  if(e.target.closest('[data-vtest]')){ vstopSpeak(); const prev = VO.listen; VO.listen = false; try{ await vspeak(tr('Tak brzmi mój głos. Słychać mnie dobrze?'), (agentOf(cur) || {}).id); }catch(err){ toast(err.message, true); } VO.listen = prev && VO.state === 'listening'; } });
$('voice').addEventListener('change', async e => { if(e.target.id === 'vIn'){ VO.inDev = e.target.value; vset('in', VO.inDev); try{ await vcStart(vheard); }catch(err){ toast(err.message, true); } }
  if(e.target.id === 'vEng'){ vset('engine', e.target.value); }
  if(e.target.id === 'vLang'){ vset('lang', e.target.value); await voiceStatus(); vui(); }
  if(e.target.id === 'vAV'){ const ag = agentOf(cur); if(ag) await saveAgentPatch(ag, {voice:e.target.value}, true); }
  if(e.target.id === 'vMD'){ vset('vmodel', e.target.value); }
  if(e.target.id === 'vChat'){ vset('chat', e.target.checked ? '1' : '0'); }
  if(e.target.id === 'vText'){ vset('text', e.target.checked ? '1' : '0'); vcap(); }
  if(e.target.id === 'vOut'){ VO.outDev = e.target.value; vset('out', VO.outDev); await vsink(); } });
$('voice').addEventListener('submit', e => { e.preventDefault(); const inp = e.target.querySelector('.vtype'), t = inp.value.trim(); if(!t) return; inp.value = ''; vstopSpeak(); VO.listen = false; vturn(t); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && VO.open) voiceClose(); });

/* dyktowanie: jedna wypowiedź trafia do pola pisania */
async function dictate(where){ const el = where === 'live' ? LB : where === 'team' ? $('teamText') : where === 'orders' ? OF.text : F.goal;
  const forA = where === 'live' && S && S.config ? S.config.agent : '', forRun = where === 'live' && S ? S.id : '';      // wskazówka należy do tego zadania, które trwało, gdy zaczynałeś mówić
  const st = await voiceStatus();
  if(!st.ready){ toast('Najpierw pobierz model mowy: otwórz rozmowę głosową z plusa.', true); return voiceOpen(where === 'live' ? 'agent' : where); }
  const pill = $('dictPill'); pill.hidden = false; pill.innerHTML = `<span class="vbars mini">${'<i></i>'.repeat(9)}</span><b>${tr('Słucham, mów…')}</b><button type="button">${tr('Anuluj')}</button>`; let on = true, raf = 0;
  const stop = async () => { on = false; cancelAnimationFrame(raf); pill.hidden = true; await vcStop(); }; pill.querySelector('button').onclick = stop;
  const meter = () => { if(!on) return; pill.querySelectorAll('.vbars i').forEach((b, i) => b.style.setProperty('--h', (.14 + Math.min(1, VO.lvl * (.5 + .5 * Math.sin(Date.now() / 110 + i))) ).toFixed(3))); raf = requestAnimationFrame(meter); }; meter();
  try{ VO.inDev = vget('in'); await vcStart(async text => { if(!on) return; await stop();
      if(text && where === 'live' && !(S && S.running && S.config && S.config.agent === forA && S.id === forRun)){ noteToTask(forA, text); toast('Agent skończył, zanim wysłałeś wskazówkę. Tekst czeka w polu zadania tego agenta.'); return; }      // zadanie skończyło się w trakcie dyktowania: tekst czeka w polu zadania tego agenta, a nie w cudzej wskazówce
      if(text){ el.value = (el.value && !/\s$/.test(el.value) ? el.value + ' ' : el.value) + text; grow(el); el.dispatchEvent(new Event('input', {bubbles:true})); el.focus(); } }); VO.listen = true; }catch(err){ await stop(); toast(err.message, true); } }

/* czytanie odpowiedzi na głos po zakończeniu zadania */
let READ_LAST = '';
async function readFinal(){ if(!AUTOREAD || VO.open || !S || !S.id || READ_LAST === S.id) return; READ_LAST = S.id; const R = S.rounds || [], text = (R[R.length - 1] || {}).agent; if(!text) return;
  try{ await voiceStatus(); await vspeak(text, (S.config || {}).agent); }catch(err){} }

document.addEventListener('visibilitychange', () => { if(!document.hidden && tab === 'agent') unreadClear(cur); });
window.addEventListener('focus', () => { if(tab === 'agent') unreadClear(cur); });
window.addEventListener('pywebviewready', () => { badgeSent = -1; unreadSave(); });
setTimeout(() => { if(tab === 'agent') unreadClear(cur); else unreadSave(); }, 1500);

/* ---------- ustawienia zespołu: prawy klik na Team ---------- */
let TCFG = {leader:'', folder:'', cancel_min:20, off:[]};
async function loadTeamCfg(){ try{ TCFG = await api('/api/teamconfig'); if(TCFG.leader && !TL) TL = TCFG.leader; if(TCFG.folder && !TFOLDER) TFOLDER = TCFG.folder; }catch(e){} }
loadTeamCfg();
async function teamSheet(){ await loadTeamCfg(); const m = $('modal'), native = !!(window.pywebview && window.pywebview.api);
  const draw = () => { const lead = TCFG.leader || TL || (AG[0] || {}).id;
    m.innerHTML = `<div class="sheet profile teamset"><button type="button" class="pclose" data-close aria-label="${tr('Zamknij')}"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>`
      + `<div class="phead"><span class="teamstack big">${AG.slice(0, 5).map((x, i) => `<span class="ts" style="z-index:${9 - i}">${face(x, 52)}</span>`).join('')}</span><div><h3>${tr('Ustawienia zespołu')}</h3><p>${tr('Kto prowadzi, gdzie pracuje zespół i kto bierze udział. Zmiany zapisują się od razu.')}</p></div></div>`
      + `<div class="tsec2"><b>${tr('Prowadzący')}</b><small>${tr('Ten agent rozdziela pracę, gdy zlecasz zadanie zespołowi.')}</small><div class="tchoice">${AG.map(x => `<button type="button" class="tc${x.id === lead ? ' on' : ''}" data-tlead="${esc(x.id)}">${face(x, 22)}${esc(x.name)}</button>`).join('')}</div></div>`
      + `<div class="tsec2"><b>${tr('Folder zespołu')}</b><small>${TCFG.folder ? esc(TCFG.folder) : tr('Pusty: każde zadanie dostaje nowy folder projektu.')}</small><div class="pbtns"><button type="button" data-tfpick ${native ? '' : 'disabled'}>${tr('Wybierz folder')}</button><button type="button" data-tfclear ${TCFG.folder ? '' : 'disabled'}>${tr('Nowy folder przy każdym zadaniu')}</button></div></div>`
      + `<div class="tsec2"><b>${tr('Członkowie')}</b><small>${tr('Wyłączony agent nie dostaje zleceń od prowadzącego.')}</small><div class="tmembers">${AG.map(x => `<label class="tmem"><span class="tmn">${face(x, 28)}<b>${esc(x.name)}</b><small>${esc(modelName(x.model))}</small></span><span class="switch"><input type="checkbox" data-tmem="${esc(x.id)}" ${(TCFG.off || []).includes(x.id) ? '' : 'checked'}><i></i></span></label>`).join('')}</div></div>`
      + `<div class="tsec2"><b>${tr('Cierpliwość prowadzącego')}</b><small>${tr('Po ilu minutach pracy prowadzący może przerwać agenta, który się ślimaczy.')}</small><div class="tchoice">${[10, 20, 30, 60].map(n => `<button type="button" class="tc${TCFG.cancel_min === n ? ' on' : ''}" data-tmin="${n}">${n} min</button>`).join('')}</div></div>`
      + `<div class="foot"><span class="grow"></span><button type="button" class="primary" data-close>${tr('Gotowe')}</button></div></div>`; };
  const save = async body => { try{ TCFG = await api('/api/teamconfig', body); if(body.leader != null) TL = TCFG.leader; if(body.folder != null) TFOLDER = TCFG.folder; try{ localStorage.setItem('lumobot-teamfolder', TFOLDER || ''); }catch(e){} drawTeam(); }catch(err){ toast(err.message, true); } draw(); };
  draw(); m.hidden = false;
  m.onclick = async e => { if(e.target === m || e.target.closest('[data-close]')){ m.hidden = true; return; }
    const ld = e.target.closest('[data-tlead]'), mn = e.target.closest('[data-tmin]');
    if(ld) return save({leader:ld.dataset.tlead}); if(mn) return save({cancel_min:+mn.dataset.tmin});
    if(e.target.closest('[data-tfpick]')){ const p = await window.pywebview.api.pick_folder(TCFG.folder || ''); if(p) save({folder:p}); }
    if(e.target.closest('[data-tfclear]')) save({folder:''}); };
  m.onchange = e => { const mem = e.target.closest('[data-tmem]'); if(!mem) return; const off = new Set(TCFG.off || []); mem.checked ? off.delete(mem.dataset.tmem) : off.add(mem.dataset.tmem); save({off:[...off]}); };
  m.onkeydown = e => { if(e.key === 'Escape') m.hidden = true; }; }
function teamMenu(x, y){ ctxMenu(x, y, [{label:'Ustawienia zespołu', icon:'gear', run:teamSheet}, '-',
  {label:'Zadanie dla zespołu', icon:'task', run:() => { show('team'); loadTeam(); setTimeout(() => $('teamText').focus(), 50); }},
  {label:'Rozmowa głosowa z zespołem', icon:'mic', run:() => voiceOpen('team')}]); }
$('agents').addEventListener('contextmenu', e => { const it = e.target.closest('.teamrow'); if(it){ e.preventDefault(); e.stopPropagation(); teamMenu(e.clientX, e.clientY); } }, true);
$('tab-team').addEventListener('contextmenu', e => { if(e.target.closest('#teamText')) return; e.preventDefault(); teamMenu(e.clientX, e.clientY); });

/* ---------- Plan: wolna przestrzeń z boxami i pasek narzędzi na dole. Box to dowolne polecenie; boxy przesuwasz, rozciągasz, łączysz, kolorujesz i weryfikujesz, a całą przestrzeń przybliżasz i przesuwasz ---------- */
const BI = {pick:'<path d="M4 2.500l8 5.200-3.500.9 2 3.700-1.500.8-2-3.700L4.500 12z"/>', box:'<rect x="2.500" y="3.500" width="11" height="9" rx="2"/><path d="M8 6v4M6 8h4"/>', link:'<circle cx="4" cy="4.500" r="1.700"/><circle cx="12" cy="11.500" r="1.700"/><path d="M5.500 5.500c3 .5 2 4.500 5 5"/>',
  time:'<circle cx="8" cy="8" r="5.400"/><path d="M8 5v3.200l2 1.300"/>', color:'<path d="M8 2.500c3 0 5.500 2.200 5.500 4.900 0 1.700-1.400 2.600-2.800 2.600H9.500c-.8 0-1.200.9-.7 1.500.6.8 0 2-1 2-3 0-5.300-2.500-5.300-5.500S5 2.500 8 2.500z"/><circle cx="5.600" cy="7" r=".7"/><circle cx="8" cy="5" r=".7"/><circle cx="10.600" cy="6.600" r=".7"/>',
  dup:'<rect x="5.500" y="5.500" width="8" height="8" rx="1.800"/><path d="M10.500 3.500v-.2a1 1 0 0 0-1-1H3.300a1 1 0 0 0-1 1v6.200a1 1 0 0 0 1 1h.2"/>', run:'<path d="M5 3.500v9l7.500-4.500z"/>', power:'<path d="M8 2.500v5"/><path d="M4.600 4.600a4.800 4.800 0 1 0 6.800 0"/>', del:'<path d="M3.500 4.500h9M6.500 4.500V3h3v1.500M4.800 4.500l.5 8h5.400l.5-8"/>',
  web:'<circle cx="8" cy="8" r="5.300"/><path d="M2.700 8h10.600M8 2.700c2 1.600 2 9 0 10.600M8 2.700c-2 1.600-2 9 0 10.600"/>', img:'<rect x="2.500" y="3" width="11" height="10" rx="2.200"/><circle cx="6" cy="6.600" r="1.100"/><path d="M3 11.300l3.100-2.900 2.300 2 1.800-1.600 2.800 2.500"/>', minus:'<path d="M3.500 8h9"/>', plus:'<path d="M3.500 8h9M8 3.500v9"/>', fit:'<path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3"/>', undo:'<path d="M5.500 4 3 6.500 5.500 9"/><path d="M3.300 6.500h6a3.200 3.200 0 0 1 0 6.400H7"/>'};
const BRAND = {calendly:['#006BFF', 'M19.655 14.262c.281 0 .557.023.828.064 0 .005-.005.01-.005.014-.105.267-.234.534-.381.786l-1.219 2.106c-1.112 1.936-3.177 3.127-5.411 3.127h-2.432c-2.23 0-4.294-1.191-5.412-3.127l-1.218-2.106a6.251 6.251 0 0 1 0-6.252l1.218-2.106C6.736 4.832 8.8 3.641 11.035 3.641h2.432c2.23 0 4.294 1.191 5.411 3.127l1.219 2.106c.147.252.271.519.381.786 0 .004.005.009.005.014-.267.041-.543.064-.828.064-1.816 0-2.501-.607-3.291-1.306-.764-.676-1.711-1.517-3.44-1.517h-1.029c-1.251 0-2.387.455-3.2 1.278-.796.805-1.233 1.904-1.233 3.099v1.411c0 1.196.437 2.295 1.233 3.099.813.823 1.949 1.278 3.2 1.278h1.034c1.729 0 2.676-.841 3.439-1.517.791-.703 1.471-1.306 3.287-1.301Zm.005-3.237c.399 0 .794-.036 1.179-.11-.002-.004-.002-.01-.002-.014-.073-.414-.193-.823-.349-1.218.731-.12 1.407-.396 1.986-.819 0-.004-.005-.013-.005-.018-.331-1.085-.832-2.101-1.489-3.03-.649-.915-1.435-1.719-2.331-2.395-1.867-1.398-4.088-2.138-6.428-2.138-1.448 0-2.855.28-4.175.841-1.273.543-2.423 1.315-3.407 2.299S2.878 6.552 2.341 7.83c-.557 1.324-.842 2.726-.842 4.175 0 1.448.281 2.855.842 4.174.542 1.274 1.314 2.423 2.298 3.407s2.129 1.761 3.407 2.299c1.324.556 2.727.841 4.175.841 2.34 0 4.561-.74 6.428-2.137a10.815 10.815 0 0 0 2.331-2.396c.652-.929 1.158-1.949 1.489-3.03 0-.004.005-.014.005-.018-.579-.423-1.255-.699-1.986-.819.161-.395.276-.804.349-1.218.005-.009.005-.014.005-.023.869.166 1.692.506 2.404 1.035.685.505.552 1.075.446 1.416C22.184 20.437 17.619 24 12.221 24c-6.625 0-12-5.375-12-12s5.37-12 12-12c5.398 0 9.963 3.563 11.471 8.464.106.341.239.915-.446 1.421-.717.529-1.535.873-2.404 1.034.128.716.128 1.45 0 2.166-.387-.074-.782-.11-1.182-.11-4.184 0-3.968 2.823-6.736 2.823h-1.029c-1.899 0-3.15-1.357-3.15-3.095v-1.411c0-1.738 1.251-3.094 3.15-3.094h1.034c2.768 0 2.552 2.823 6.731 2.827Z'], skype:['#00AFF0', 'M12.069 18.874c-4.023 0-5.82-1.979-5.82-3.464 0-.765.561-1.296 1.333-1.296 1.723 0 1.273 2.477 4.487 2.477 1.641 0 2.55-.895 2.55-1.811 0-.551-.269-1.16-1.354-1.429l-3.576-.895c-2.88-.724-3.403-2.286-3.403-3.751 0-3.047 2.861-4.191 5.549-4.191 2.471 0 5.393 1.373 5.393 3.199 0 .784-.688 1.24-1.453 1.24-1.469 0-1.198-2.037-4.164-2.037-1.469 0-2.292.664-2.292 1.617s1.153 1.258 2.157 1.487l2.637.587c2.891.649 3.624 2.346 3.624 3.944 0 2.476-1.902 4.324-5.722 4.324m11.084-4.882l-.029.135-.044-.24c.015.045.044.074.059.12.12-.675.181-1.363.181-2.052 0-1.529-.301-3.012-.898-4.42-.569-1.348-1.395-2.562-2.427-3.596-1.049-1.033-2.247-1.856-3.595-2.426-1.318-.631-2.801-.93-4.328-.93-.72 0-1.444.07-2.143.204l.119.06-.239-.033.119-.025C8.91.274 7.829 0 6.731 0c-1.789 0-3.47.698-4.736 1.967C.729 3.235.032 4.923.032 6.716c0 1.143.292 2.265.844 3.258l.02-.124.041.239-.06-.115c-.114.645-.172 1.299-.172 1.955 0 1.53.3 3.017.884 4.416.568 1.362 1.378 2.576 2.427 3.609 1.034 1.05 2.247 1.857 3.595 2.442 1.394.6 2.877.898 4.404.898.659 0 1.334-.06 1.977-.179l-.119-.062.24.046-.135.03c1.002.569 2.126.871 3.294.871 1.783 0 3.459-.69 4.733-1.963 1.259-1.259 1.962-2.951 1.962-4.749 0-1.138-.299-2.262-.853-3.266'], onedrive:['#0A84D8', 'M19.453 9.95q.961.058 1.787.468.826.41 1.442 1.066.615.657.966 1.512.352.856.352 1.816 0 1.008-.387 1.893-.386.885-1.049 1.547-.662.662-1.546 1.049-.885.387-1.893.387H6q-1.242 0-2.332-.475-1.09-.475-1.904-1.29-.815-.814-1.29-1.903Q0 14.93 0 13.688q0-.985.31-1.887.311-.903.862-1.658.55-.756 1.324-1.325.774-.568 1.711-.861.434-.129.85-.187.416-.06.861-.082h.012q.515-.786 1.207-1.413.691-.627 1.5-1.066.808-.44 1.705-.668.896-.229 1.845-.229 1.278 0 2.456.417 1.177.416 2.144 1.16.967.744 1.658 1.78.692 1.038 1.008 2.28zm-7.265-4.137q-1.325 0-2.52.544-1.195.545-2.04 1.565.446.117.85.299.405.181.792.416l4.78 2.86 2.731-1.15q.27-.117.545-.204.276-.088.58-.147-.293-.937-.855-1.705-.563-.768-1.319-1.318-.755-.551-1.658-.856-.902-.304-1.886-.304zM2.414 16.395l9.914-4.184-3.832-2.297q-.586-.351-1.23-.539-.645-.188-1.325-.188-.914 0-1.722.364-.809.363-1.412.978-.604.616-.955 1.436-.352.82-.352 1.723 0 .703.234 1.423.235.721.68 1.284zm16.711 1.793q.563 0 1.078-.176.516-.176.961-.516l-7.23-4.324-10.301 4.336q.527.328 1.13.504.604.175 1.237.175zm3.012-1.852q.363-.727.363-1.523 0-.774-.293-1.407t-.791-1.072q-.498-.44-1.166-.68-.668-.24-1.406-.24-.422 0-.838.1t-.815.252q-.398.152-.785.334-.386.181-.761.345Z'], office:['#D83B01', 'M21.53 4.306v15.363q0 .807-.472 1.433-.472.627-1.253.85l-6.888 1.974q-.136.037-.29.055-.156.019-.293.019-.396 0-.72-.105-.321-.106-.656-.292l-4.505-2.544q-.248-.137-.391-.366-.143-.23-.143-.515 0-.434.304-.738.304-.305.739-.305h5.831V4.964l-4.38 1.563q-.533.187-.856.658-.322.472-.322 1.03v8.078q0 .496-.248.912-.25.416-.683.651l-2.072 1.13q-.286.148-.571.148-.497 0-.844-.347-.348-.347-.348-.844V6.563q0-.62.33-1.19.328-.571.874-.881L11.07.285q.248-.136.534-.21.285-.075.57-.075.211 0 .38.031.166.031.364.093l6.888 1.899q.384.11.7.329.317.217.547.52.23.305.353.67.125.367.125.764zm-1.588 15.363V4.306q0-.273-.16-.478-.163-.204-.423-.28l-3.388-.93q-.397-.111-.794-.23-.397-.117-.794-.216v19.68l4.976-1.427q.26-.074.422-.28.161-.204.161-.477z'], gphotos:['#4285F4', 'M12.678 16.672c0 2.175.002 4.565-.001 6.494-.001.576-.244.814-.817.833-7.045.078-8.927-7.871-4.468-11.334-1.95.016-4.019.007-5.986.007-1.351 0-1.414-.01-1.405-1.351.258-6.583 7.946-8.275 11.323-3.936L11.308.928c-.001-.695.212-.906.906-.925 6.409-.187 9.16 7.308 4.426 11.326l6.131.002c1.097 0 1.241.105 1.228 1.217-.223 6.723-7.802 8.376-11.321 4.124zm.002-15.284l-.003 9.972c6.56-.465 6.598-9.532.003-9.972zm-1.36 21.224l-.001-9.97c-6.927.598-6.29 9.726.002 9.97zM1.4 11.315l9.95.008c-.527-6.829-9.762-6.367-9.95-.008zm11.238 1.365c.682 6.875 9.67 6.284 9.977.01z'], airtable:['#18BFFF', 'M11.992 1.966c-.434 0-.87.086-1.28.257L1.779 5.917c-.503.208-.49.908.012 1.116l8.982 3.558a3.266 3.266 0 0 0 2.454 0l8.982-3.558c.503-.196.503-.908.012-1.116l-8.957-3.694a3.255 3.255 0 0 0-1.272-.257zM23.4 8.056a.589.589 0 0 0-.222.045l-10.012 3.877a.612.612 0 0 0-.38.564v8.896a.6.6 0 0 0 .821.552L23.62 18.1a.583.583 0 0 0 .38-.551V8.653a.6.6 0 0 0-.6-.596zM.676 8.095a.644.644 0 0 0-.48.19C.086 8.396 0 8.53 0 8.69v8.355c0 .442.515.737.908.54l6.27-3.006.307-.147 2.969-1.436c.466-.22.43-.908-.061-1.092L.883 8.138a.57.57 0 0 0-.207-.044z'], wordpress:['#3499CD', 'M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0'], medium:['currentColor', 'M4.21 0A4.201 4.201 0 0 0 0 4.21v15.58A4.201 4.201 0 0 0 4.21 24h15.58A4.201 4.201 0 0 0 24 19.79v-1.093c-.137.013-.278.02-.422.02-2.577 0-4.027-2.146-4.09-4.832a7.592 7.592 0 0 1 .022-.708c.093-1.186.475-2.241 1.105-3.022a3.885 3.885 0 0 1 1.395-1.1c.468-.237 1.127-.367 1.664-.367h.023c.101 0 .202.004.303.01V4.211A4.201 4.201 0 0 0 19.79 0Zm.198 5.583h4.165l3.588 8.435 3.59-8.435h3.864v.146l-.019.004c-.705.16-1.063.397-1.063 1.254h-.003l.003 10.274c.06.676.424.885 1.063 1.03l.02.004v.145h-4.923v-.145l.019-.005c.639-.144.994-.353 1.054-1.03V7.267l-4.745 11.15h-.261L6.15 7.569v9.445c0 .857.358 1.094 1.063 1.253l.02.004v.147H4.405v-.147l.019-.004c.705-.16 1.065-.397 1.065-1.253V6.987c0-.857-.358-1.094-1.064-1.254l-.018-.004zm19.25 3.668c-1.086.023-1.733 1.323-1.813 3.124H24V9.298a1.378 1.378 0 0 0-.342-.047Zm-1.862 3.632c-.1 1.756.86 3.239 2.204 3.634v-3.634z'], jira:['#2684FF', 'M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z'], asana:['#F06A6A', 'M18.78 12.653c-2.882 0-5.22 2.336-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.34 5.22-5.22-2.336-5.22-5.22-5.22zm-13.56 0c-2.88 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.336-5.22-5.22-5.22zm12-6.525c0 2.883-2.337 5.22-5.22 5.22-2.882 0-5.22-2.337-5.22-5.22 0-2.88 2.338-5.22 5.22-5.22 2.883 0 5.22 2.34 5.22 5.22z'], clickup:['#7B68EE', 'M2 18.439l3.69-2.828c1.961 2.56 4.044 3.739 6.363 3.739 2.307 0 4.33-1.166 6.203-3.704L22 18.405C19.298 22.065 15.941 24 12.053 24 8.178 24 4.788 22.078 2 18.439zM12.04 6.15l-6.568 5.66-3.036-3.52L12.055 0l9.543 8.296-3.05 3.509z'], linear:['#5E6AD2', 'M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z'], gitlab:['#FC6D26', 'm23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z'], vercel:['currentColor', 'm12 1.608 12 20.784H0Z'], netlify:['#00C7B7', 'M6.49 19.04h-.23L5.13 17.9v-.23l1.73-1.71h1.2l.15.15v1.2L6.5 19.04ZM5.13 6.31V6.1l1.13-1.13h.23L8.2 6.68v1.2l-.15.15h-1.2L5.13 6.31Zm9.96 9.09h-1.65l-.14-.13v-3.83c0-.68-.27-1.2-1.1-1.23-.42 0-.9 0-1.43.02l-.07.08v4.96l-.14.14H8.9l-.13-.14V8.73l.13-.14h3.7a2.6 2.6 0 0 1 2.61 2.6v4.08l-.13.14Zm-8.37-2.44H.14L0 12.82v-1.64l.14-.14h6.58l.14.14v1.64l-.14.14Zm17.14 0h-6.58l-.14-.14v-1.64l.14-.14h6.58l.14.14v1.64l-.14.14ZM11.05 6.55V1.64l.14-.14h1.65l.14.14v4.9l-.14.14h-1.65l-.14-.13Zm0 15.81v-4.9l.14-.14h1.65l.14.13v4.91l-.14.14h-1.65l-.14-.14Z'], cloudflare:['#F38020', 'M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727'], hubspot:['#FF7A59', 'M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z'], mailchimp:['#FFE01B', 'M11.267 0C6.791-.015-1.82 10.246 1.397 12.964l.79.669a3.88 3.88 0 0 0-.22 1.792c.084.84.518 1.644 1.22 2.266.666.59 1.542.964 2.392.964 1.406 3.24 4.62 5.228 8.386 5.34 4.04.12 7.433-1.776 8.854-5.182.093-.24.488-1.316.488-2.267 0-.956-.54-1.352-.885-1.352-.01-.037-.078-.286-.172-.586-.093-.3-.19-.51-.19-.51.375-.563.382-1.065.332-1.35-.053-.353-.2-.653-.496-.964-.296-.311-.902-.63-1.753-.868l-.446-.124c-.002-.019-.024-1.053-.043-1.497-.014-.32-.042-.822-.197-1.315-.186-.668-.508-1.253-.911-1.627 1.112-1.152 1.806-2.422 1.804-3.511-.003-2.095-2.576-2.729-5.746-1.416l-.672.285A678.22 678.22 0 0 0 12.7.504C12.304.159 11.817.002 11.267 0zm.073.873c.166 0 .322.019.465.058.297.084 1.28 1.224 1.28 1.224s-1.826 1.013-3.52 2.426c-2.28 1.757-4.005 4.311-5.037 7.082-.811.158-1.526.618-1.963 1.253-.261-.218-.748-.64-.834-.804-.698-1.326.761-3.902 1.781-5.357C5.834 3.44 9.37.867 11.34.873zm3.286 3.273c.04-.002.06.05.028.074-.143.11-.299.26-.413.414a.04.04 0 0 0 .031.064c.659.004 1.587.235 2.192.574.041.023.012.103-.034.092-.915-.21-2.414-.369-3.97.01-1.39.34-2.45.863-3.224 1.426-.04.028-.086-.023-.055-.06.896-1.035 1.999-1.935 2.987-2.44.034-.018.07.019.052.052-.079.143-.23.447-.278.678-.007.035.032.063.062.042.615-.42 1.684-.868 2.622-.926zm3.023 3.205l.056.001a.896.896 0 0 1 .456.146c.534.355.61 1.216.638 1.845.015.36.059 1.229.074 1.478.034.571.184.651.487.751.17.057.33.098.563.164.706.198 1.125.4 1.39.658.157.162.23.333.253.497.083.608-.472 1.36-1.942 2.041-1.607.746-3.557.935-4.904.785l-.471-.053c-1.078-.145-1.693 1.247-1.046 2.201.417.615 1.552 1.015 2.688 1.015 2.604 0 4.605-1.111 5.35-2.072a.987.987 0 0 0 .06-.085c.036-.055.006-.085-.04-.054-.608.416-3.31 2.069-6.2 1.571 0 0-.351-.057-.672-.182-.255-.1-.788-.344-.853-.891 2.333.72 3.801.039 3.801.039a.072.072 0 0 0 .042-.072.067.067 0 0 0-.074-.06s-1.911.283-3.718-.378c.197-.64.72-.408 1.51-.345a11.045 11.045 0 0 0 3.647-.394c.818-.234 1.892-.697 2.727-1.356.281.618.38 1.299.38 1.299s.219-.04.4.073c.173.106.299.326.213.895-.176 1.063-.628 1.926-1.387 2.72a5.714 5.714 0 0 1-1.666 1.244c-.34.18-.704.334-1.087.46-2.863.935-5.794-.093-6.739-2.3a3.545 3.545 0 0 1-.189-.522c-.403-1.455-.06-3.2 1.008-4.299.065-.07.132-.153.132-.256 0-.087-.055-.179-.102-.243-.374-.543-1.669-1.466-1.409-3.254.187-1.284 1.31-2.189 2.357-2.135.089.004.177.01.266.015.453.027.85.085 1.223.1.625.028 1.187-.063 1.853-.618.225-.187.405-.35.71-.401.028-.005.092-.028.215-.028zm.022 2.18a.42.42 0 0 0-.06.005c-.335.054-.347.468-.228 1.04.068.32.187.595.32.765.175-.02.343-.022.498 0 .089-.205.104-.557.024-.942-.112-.535-.261-.872-.554-.868zm-3.66 1.546a1.724 1.724 0 0 0-1.016.326c-.16.117-.311.28-.29.378.008.032.031.056.088.063.131.015.592-.217 1.122-.25.374-.023.684.094.923.2.239.104.386.173.443.113.037-.038.026-.11-.031-.204-.118-.192-.36-.387-.618-.497a1.601 1.601 0 0 0-.621-.129zm4.082.81c-.171-.003-.313.186-.317.42-.004.236.131.43.303.432.172.003.314-.185.318-.42.004-.236-.132-.429-.304-.432zm-3.58.172c-.05 0-.102.002-.155.008-.311.05-.483.152-.593.247-.094.082-.152.173-.152.237a.075.075 0 0 0 .075.076c.07 0 .228-.063.228-.063a1.98 1.98 0 0 1 1.001-.104c.157.018.23.027.265-.026.01-.016.022-.049-.01-.1-.063-.103-.311-.269-.66-.275zm2.26.4c-.127 0-.235.051-.283.148-.075.154.035.363.246.466.21.104.443.063.52-.09.075-.155-.035-.364-.246-.467a.542.542 0 0 0-.237-.058zm-11.635.024c.048 0 .098 0 .149.003.73.04 1.806.6 2.052 2.19.217 1.41-.128 2.843-1.449 3.069-.123.02-.248.029-.374.026-1.22-.033-2.539-1.132-2.67-2.435-.145-1.44.591-2.548 1.894-2.811.117-.024.252-.04.398-.042zm-.07.927a1.144 1.144 0 0 0-.847.364c-.38.418-.439.988-.366 1.19.027.073.07.094.1.098.064.008.16-.039.22-.2a1.2 1.2 0 0 0 .017-.052 1.58 1.58 0 0 1 .157-.37.689.689 0 0 1 .955-.199c.266.174.369.5.255.81-.058.161-.154.469-.133.721.043.511.357.717.64.738.274.01.466-.143.515-.256.029-.067.005-.107-.011-.125-.043-.053-.113-.037-.18-.021a.638.638 0 0 1-.16.022.347.347 0 0 1-.294-.148c-.078-.12-.073-.3.013-.504.011-.028.025-.058.04-.092.138-.308.368-.825.11-1.317-.195-.37-.513-.602-.894-.65a1.135 1.135 0 0 0-.138-.01z'], bluesky:['#0285FF', 'M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026'], tumblr:['#5B7CFA', 'M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z'], quora:['#B92B27', 'M7.3799.9483A11.9628 11.9628 0 0 1 21.248 19.5397l2.4096 2.4225c.7322.7362.21 1.9905-.8272 1.9905l-10.7105.01a12.52 12.52 0 0 1-.304 0h-.02A11.9628 11.9628 0 0 1 7.3818.9503Zm7.3217 4.428a7.1717 7.1717 0 1 0-5.4873 13.2512 7.1717 7.1717 0 0 0 5.4883-13.2511Z'], substack:['#FF6719', 'M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z'], snapchat:['#FFFC00', 'M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z'], soundcloud:['#FF5500', 'M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z'], amazon:['#FF9900', 'M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z'], ebay:['#E53238', 'M6.056 12.132v-4.92h1.2v3.026c.59-.703 1.402-.906 2.202-.906 1.34 0 2.828.904 2.828 2.855 0 .233-.015.457-.06.668.24-.953 1.274-1.305 2.896-1.344.51-.018 1.095-.018 1.56-.018v-.135c0-.885-.556-1.244-1.53-1.244-.72 0-1.245.3-1.305.81h-1.275c.136-1.29 1.5-1.62 2.686-1.62 1.064 0 1.995.27 2.415 1.02l-.436-.84h1.41l2.055 4.125 2.055-4.126H24l-3.72 7.305h-1.346l1.07-2.04-2.33-4.38c.13.255.2.555.2.93v2.46c0 .346.01.69.04 1.005H16.8a6.543 6.543 0 01-.046-.765c-.603.734-1.32.96-2.32.96-1.48 0-2.272-.78-2.272-1.695 0-.15.015-.284.037-.405-.3 1.246-1.36 2.086-2.767 2.086-.87 0-1.694-.315-2.2-.93 0 .24-.015.494-.04.734h-1.18c.02-.39.04-.855.04-1.245v-1.05h-4.83c.065 1.095.818 1.74 1.853 1.74.718 0 1.355-.3 1.568-.93h1.24c-.24 1.29-1.61 1.725-2.79 1.725C.95 15.009 0 13.822 0 12.232c0-1.754.982-2.91 3.116-2.91 1.688 0 2.93.886 2.94 2.806v.005zm9.137.183c-1.095.034-1.77.233-1.77.95 0 .465.36.97 1.305.97 1.26 0 1.935-.69 1.935-1.814v-.13c-.45 0-.99.006-1.484.022h.012zm-6.06 1.875c1.11 0 1.876-.806 1.876-2.02s-.768-2.02-1.893-2.02c-1.11 0-1.89.806-1.89 2.02s.765 2.02 1.875 2.02h.03zm-4.35-2.514c-.044-1.125-.854-1.546-1.725-1.546-.944 0-1.694.474-1.815 1.546z'], vinted:['#09B1BA', 'M19.316 0c-.258 0-.571.217-1.415.953-.3.108-.627.027-1.008.613-2.15 3.09-3.825 14.648-5.255 17.984-.286-1.444-.885-10.837-1.116-13.41-.028-.477.027-1.076.027-1.43 0-2.368-.516-3.567-2.886-3.567-1.198 0-2.382.436-3.008 1.226-.299.408-.409.708-.409 1.443 0 4.915 1.171 12.973 2.478 18.228C7.132 23.688 8.603 24 9.99 24c.654 0 1.307-.081 2.233-.544 3.212-1.567 4.07-5.84 4.9-9.993.15-.749.899-4.37 1.253-6.275.476-2.6 1.02-5.54 1.347-6.617C19.833.245 19.63 0 19.317 0z'], booking:['#3B82F6', 'M24 0H0v24h24ZM8.575 6.563h2.658c2.108 0 3.473 1.15 3.473 2.898 0 1.15-.575 1.82-.91 2.108l-.287.263.335.192c.815.479 1.318 1.389 1.318 2.395 0 1.988-1.51 3.257-3.857 3.257H7.449V7.713c0-.623.503-1.126 1.126-1.15zm1.7 1.868c-.479.024-.694.264-.694.79v1.893h1.676c.958 0 1.294-.743 1.294-1.365 0-.815-.503-1.318-1.318-1.318zm-.096 4.36c-.407.071-.598.31-.598.79v2.251h1.868c.934 0 1.509-.55 1.509-1.533 0-.934-.599-1.509-1.51-1.509zm7.737 2.394c.743 0 1.341.599 1.341 1.342a1.34 1.34 0 0 1-1.341 1.341 1.355 1.355 0 0 1-1.341-1.341c0-.743.598-1.342 1.34-1.342z'], airbnb:['#FF5A5F', 'M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z'], netflix:['#E50914', 'm5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z'], aliexpress:['#FF4747', 'M5.166 9.096a.022.022 0 0 0-.022.021c0 .396-.32.717-.713.717a.021.021 0 0 0-.021.022c0 .012.01.021.021.021.394 0 .713.322.713.718 0 .012.01.021.022.021.011 0 .021-.01.021-.021A.717.717 0 0 1 5.9 9.88a.021.021 0 0 0 0-.043.716.716 0 0 1-.713-.718v-.002a.021.021 0 0 0-.006-.015.022.022 0 0 0-.015-.006zm-3.693.526L0 13.462h.48l.355-.922h1.782l.354.922h.481L1.98 9.622zm2.264.002v3.838h.491V9.624zm2.375 0v3.838h2.413v-.502H6.613v-1.19H8.19v-.477H6.613v-1.166h1.773v-.502zm-4.386.592l.698 1.82H1.028zm14.689.402a1.466 1.466 0 0 0-.966.366V10.7h-.491v2.763h.49c.002-.477 0-.955.002-1.433a.969.969 0 0 1 .965-.918zm4.18.007c-.053 0-.105.003-.158.01-.315.031-.606.175-.753.377a.689.689 0 0 0-.14.465c.007.2.066.357.233.496.184.147.42.2.657.259.311.067.426.095.546.186.08.07.133.127.136.27 0 .25-.221.372-.42.41a.89.89 0 0 1-.894-.344l-.371.288c.33.382.777.505 1.09.5.54-.01.891-.217 1.029-.534.066-.153.063-.309.063-.38a.677.677 0 0 0-.267-.545c-.228-.177-.583-.228-.636-.242-.437-.078-.658-.196-.697-.341-.043-.192.102-.35.297-.411a.76.76 0 0 1 .857.277l.367-.247a1.166 1.166 0 0 0-.939-.494zm2.387 0c-.052 0-.105.003-.157.01-.316.031-.607.175-.753.377a.689.689 0 0 0-.14.465c.006.2.065.357.233.496.183.147.42.2.657.259.31.067.426.095.545.186.081.07.134.127.136.27.001.25-.221.372-.42.41a.89.89 0 0 1-.894-.344l-.371.288c.33.382.777.505 1.09.5.541-.01.891-.217 1.03-.534.065-.153.062-.309.062-.38a.677.677 0 0 0-.267-.545c-.227-.177-.583-.228-.636-.242-.437-.078-.658-.196-.696-.341-.043-.192.101-.35.297-.411a.76.76 0 0 1 .857.277l.367-.247a1.167 1.167 0 0 0-.94-.494zm-9.84.002a1.461 1.461 0 0 0-1.42 1.117 1.305 1.305 0 0 0-.041.327v2.833h.491v-1.813c.17.18.487.42.96.454a1.447 1.447 0 0 0 1.208-.627 1.457 1.457 0 0 0-1.199-2.292zm4.804 0a1.448 1.448 0 0 0-1.288 2.08c.255.53.811.87 1.412.833a1.452 1.452 0 0 0 1.012-.51l-.363-.291a.968.968 0 0 1-1.106.273 1.01 1.01 0 0 1-.602-.69h2.239l.002-.427a1.295 1.295 0 0 0-1.306-1.268zm-9.2.08l1.062 1.377-1.062 1.378h.581l.779-1.01.778 1.01h.581l-1.062-1.378 1.062-1.378h-.581l-.778 1.01-.779-1.01zm-3.825.015v2.74h.49v-2.74zm8.233.37a.96.96 0 0 1 .95.993.963.963 0 0 1-.863.998.962.962 0 0 1-1.034-.739c-.074-.382 0-.746.307-1.019a.959.959 0 0 1 .64-.233zm4.79.015a.823.823 0 0 1 .819.755h-1.76a.964.964 0 0 1 .94-.755z'], gdrive:['#4285F4', 'M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.005-.02-1.708-3.001-3.775-6.62l-3.76-6.574zm-4.76 1.73a789.828 789.861 0 0 0-3.63 6.319L0 15.868l1.89 3.298 1.885 3.297 3.62-6.335 3.618-6.33-1.88-3.287C8.1 4.704 7.255 3.22 7.25 3.214zm2.259 12.653-.203.348c-.114.198-.96 1.672-1.88 3.287a423.93 423.948 0 0 1-1.698 2.97c-.01.026 3.24.042 7.222.042h7.244l1.796-3.157c.992-1.734 1.85-3.23 1.906-3.323l.104-.167h-7.249z'], gdocs:['#4285F4', 'M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zm-.545 10.455H7.09v-1.364h7.09v1.364zm2.727-3.273H7.091v-1.364h9.818v1.364zm0-3.273H7.091V9.273h9.818v1.363zM14.727 6h6l-6-6v6z'], gsheets:['#0F9D58', 'M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0v6h6l-6-6zm1.363 10.636h-3.41v1.91h3.41v-1.91zm0 3.273h-3.41v1.91h3.41v-1.91zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5h6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91z'], youtube:['#FF0000', 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'], tiktok:['currentColor', 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'], threads:['currentColor', 'M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z'], telegram:['#26A5E4', 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'], whatsapp:['#25D366', 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'], messenger:['#0084FF', 'M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13'], notion:['currentColor', 'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z'], trello:['#2684FF', 'M21.147 0H2.853A2.86 2.86 0 000 2.853v18.294A2.86 2.86 0 002.853 24h18.294A2.86 2.86 0 0024 21.147V2.853A2.86 2.86 0 0021.147 0zM10.34 17.287a.953.953 0 01-.953.953h-4a.954.954 0 01-.954-.953V5.38a.953.953 0 01.954-.953h4a.954.954 0 01.953.953zm9.233-5.467a.944.944 0 01-.953.947h-4a.947.947 0 01-.953-.947V5.38a.953.953 0 01.953-.953h4a.954.954 0 01.953.953z'], github:['currentColor', 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'], allegro:['#FF5A00', 'M4.59 7.981a.124.124 0 0 0-.122.124v5.917a.124.124 0 0 0 .124.124h.72a.124.124 0 0 0 .124-.124h-.002V8.105a.124.124 0 0 0-.124-.124Zm1.691 0a.124.124 0 0 0-.124.124v5.917a.124.124 0 0 0 .124.124h.72a.124.124 0 0 0 .123-.124V8.105a.124.124 0 0 0-.122-.124Zm12.667 1.776a1.868 1.868 0 0 0-1.317.532 1.674 1.674 0 0 0-.531 1.254v2.48a.124.124 0 0 0 .123.123h.72a.124.124 0 0 0 .124-.124v-2.427c0-.752.5-1.113 1.314-.946a.13.13 0 0 0 .168-.142v-.495c0-.13-.014-.18-.1-.208a2.794 2.794 0 0 0-.501-.047Zm-4.626 0a2.193 2.193 0 0 0-1.732.849 2.355 2.355 0 0 0 0 2.678 2.13 2.131 0 0 0 1.732.849 2.21 2.21 0 0 0 1.234-.372v.53c0 .717-.627.848-1.03.873a4.73 4.73 0 0 1-.826-.045c-.11-.017-.188 0-.188.119v.636a.109.109 0 0 0 .114.103c.933.08 1.56.064 2.032-.206a1.537 1.537 0 0 0 .69-.875 2.928 2.928 0 0 0 .117-.874v-2.077h.002a2.245 2.245 0 0 0-.412-1.34 2.193 2.193 0 0 0-1.733-.848Zm-12.255.002a2.903 2.903 0 0 0-1.465.39.092.092 0 0 0-.045.08l.038.63a.112.112 0 0 0 .185.065c.627-.387 1.38-.459 1.764-.265a.67.67 0 0 1 .335.605v.092H1.832c-.45 0-1.83.167-1.83 1.434v.014a1.229 1.229 0 0 0 .45 1.017 1.768 1.768 0 0 0 1.118.32h2.118a.124.124 0 0 0 .124-.125v-2.51l-.002.004c0-.57-.127-1.004-.402-1.303-.274-.3-.827-.45-1.34-.45zm7.707 0c-1.28 0-1.84.858-2.02 1.585a2.44 2.44 0 0 0-.074.6 2.277 2.277 0 0 0 .412 1.338 2.198 2.198 0 0 0 1.733.85c.691.024 1.153-.093 1.506-.294a.196.196 0 0 0 .084-.212v-.558c0-.114-.069-.167-.167-.098a2.185 2.185 0 0 1-1.393.334 1.14 1.14 0 0 1-1.118-1.016h2.845a.117.117 0 0 0 .117-.116c.05-.778-.175-2.413-1.925-2.413Zm12.08 0a2.193 2.193 0 0 0-1.731.848 2.275 2.275 0 0 0-.412 1.34 2.275 2.275 0 0 0 .412 1.339 2.193 2.193 0 0 0 3.465 0 2.277 2.277 0 0 0 .412-1.34 2.277 2.277 0 0 0-.412-1.339 2.193 2.193 0 0 0-1.733-.848Zm-7.532.833c1.157 0 1.196 1.18 1.196 1.351 0 .171-.039 1.351-1.196 1.351-.517 0-.89-.378-1.047-.849a1.552 1.552 0 0 1 0-1.004c.157-.47.53-.849 1.047-.849zm-4.546.004a.86.86 0 0 1 .91.922H8.754a.968.968 0 0 1 1.024-.922zm12.078 0c.515-.012.89.378 1.048.848a1.553 1.553 0 0 1 0 1.003v.002c-.158.47-.531.837-1.048.848-.518.012-.89-.378-1.047-.848a1.552 1.552 0 0 1 0-1.005c.158-.47.53-.837 1.047-.848zM1.89 12.121h.99v1.246H1.63a.773.773 0 0 1-.444-.156.492.492 0 0 1-.21-.412c0-.226.153-.678.914-.678z'], spotify:['#1DB954', 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'], twitch:['#9146FF', 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z'], pinterest:['#E60023', 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z'], canva:['#00C4CC', 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM6.962 7.68c.754 0 1.337.549 1.405 1.2.069.583-.171 1.097-.822 1.406-.343.171-.48.172-.549.069-.034-.069 0-.137.069-.206.617-.514.617-.926.548-1.508-.034-.378-.308-.618-.583-.618-1.2 0-2.914 2.674-2.674 4.629.103.754.549 1.646 1.509 1.646.308 0 .65-.103.96-.24.5-.264.799-.47 1.097-.8-.073-.885.704-2.046 1.851-2.046.515 0 .926.205.96.583.068.514-.377.582-.514.582s-.378-.034-.378-.17c-.034-.138.309-.07.275-.378-.035-.206-.24-.274-.446-.274-.72 0-1.131.994-1.029 1.611.035.275.172.549.447.549.205 0 .514-.31.617-.755.068-.308.343-.514.583-.514.102 0 .17.034.205.171v.138c-.034.137-.137.548-.102.651 0 .069.034.171.17.171.092 0 .436-.18.777-.459.117-.59.253-1.298.253-1.357.034-.24.137-.48.617-.48.103 0 .171.034.205.171v.138l-.136.617c.445-.583 1.097-.994 1.508-.994.172 0 .309.102.309.274 0 .103 0 .274-.069.446-.137.377-.309.96-.412 1.474 0 .137.035.274.207.274.171 0 .685-.206 1.096-.754l.007-.004c-.002-.068-.007-.134-.007-.202 0-.411.035-.754.104-.994.068-.274.411-.514.617-.514.103 0 .205.069.205.171 0 .035 0 .103-.034.137-.137.446-.24.857-.24 1.269 0 .24.034.582.102.788 0 .034.035.069.07.069.068 0 .548-.445.89-1.028-.308-.206-.48-.549-.48-.96 0-.72.446-1.097.858-1.097.343 0 .617.24.617.72 0 .308-.103.65-.274.96h.102a.77.77 0 0 0 .584-.24.293.293 0 0 1 .134-.117c.335-.425.83-.74 1.41-.74.48 0 .924.205.959.582.068.515-.378.618-.515.618l-.002-.002c-.138 0-.377-.035-.377-.172 0-.137.309-.068.274-.376-.034-.206-.24-.275-.446-.275-.686 0-1.13.891-1.028 1.611.034.275.171.583.445.583.206 0 .515-.308.652-.754.068-.274.343-.514.583-.514.103 0 .17.034.205.171 0 .069 0 .206-.137.652-.17.308-.171.48-.137.617.034.274.171.48.309.583.034.034.068.102.068.102 0 .069-.034.138-.137.138-.034 0-.068 0-.103-.035-.514-.205-.72-.548-.789-.891-.205.24-.445.377-.72.377-.445 0-.89-.411-.96-.926a1.609 1.609 0 0 1 .075-.649c-.203.13-.422.203-.623.203h-.17c-.447.652-.927 1.098-1.27 1.303a.896.896 0 0 1-.377.104c-.068 0-.171-.035-.205-.104-.095-.152-.156-.392-.193-.667-.481.527-1.145.805-1.453.805-.343 0-.548-.206-.582-.55v-.376c.102-.754.377-1.2.377-1.337a.074.074 0 0 0-.069-.07c-.24 0-1.028.824-1.166 1.373l-.103.445c-.068.309-.377.515-.582.515-.103 0-.172-.035-.206-.172v-.137l.046-.233c-.435.31-.87.508-1.075.508-.308 0-.48-.172-.514-.412-.206.274-.445.412-.754.412-.352 0-.696-.24-.862-.593-.244.275-.523.553-.852.764-.48.309-1.028.549-1.68.549-.582 0-1.097-.309-1.371-.583-.412-.377-.651-.96-.686-1.509-.205-1.68.823-3.84 2.4-4.8.378-.205.755-.343 1.132-.343zm9.77 3.291c-.104 0-.172.172-.172.343 0 .274.137.583.309.755a1.74 1.74 0 0 0 .102-.583c0-.343-.137-.515-.24-.515z'], shopify:['#7AB55C', 'M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z'], dropbox:['#0061FF', 'M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z'], zoom:['#0B5CFF', 'M5.033 14.649H.743a.74.74 0 0 1-.686-.458.74.74 0 0 1 .16-.808L3.19 10.41H1.06A1.06 1.06 0 0 1 0 9.35h3.957c.301 0 .57.18.686.458a.74.74 0 0 1-.161.808L1.51 13.59h2.464c.585 0 1.06.475 1.06 1.06zM24 11.338c0-1.14-.927-2.066-2.066-2.066-.61 0-1.158.265-1.537.686a2.061 2.061 0 0 0-1.536-.686c-1.14 0-2.066.926-2.066 2.066v3.311a1.06 1.06 0 0 0 1.06-1.06v-2.251a1.004 1.004 0 0 1 2.013 0v2.251c0 .586.474 1.06 1.06 1.06v-3.311a1.004 1.004 0 0 1 2.012 0v2.251c0 .586.475 1.06 1.06 1.06zM16.265 12a2.728 2.728 0 1 1-5.457 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0zm-4.82 0a2.728 2.728 0 1 1-5.458 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0z'], figma:['#F24E1E', 'M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z'], steam:['currentColor', 'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z'], teams:['#7B83EB', 'M20.625 8.127q-.55 0-1.025-.205-.475-.205-.832-.563-.358-.357-.563-.832Q18 6.053 18 5.502q0-.54.205-1.02t.563-.837q.357-.358.832-.563.474-.205 1.025-.205.54 0 1.02.205t.837.563q.358.357.563.837.205.48.205 1.02 0 .55-.205 1.025-.205.475-.563.832-.357.358-.837.563-.48.205-1.02.205zm0-3.75q-.469 0-.797.328-.328.328-.328.797 0 .469.328.797.328.328.797.328.469 0 .797-.328.328-.328.328-.797 0-.469-.328-.797-.328-.328-.797-.328zM24 10.002v5.578q0 .774-.293 1.46-.293.685-.803 1.194-.51.51-1.195.803-.686.293-1.459.293-.445 0-.908-.105-.463-.106-.85-.329-.293.95-.855 1.729-.563.78-1.319 1.336-.756.557-1.67.861-.914.305-1.898.305-1.148 0-2.162-.398-1.014-.399-1.805-1.102-.79-.703-1.312-1.664t-.674-2.086h-5.8q-.411 0-.704-.293T0 16.881V6.873q0-.41.293-.703t.703-.293h8.59q-.34-.715-.34-1.5 0-.727.275-1.365.276-.639.75-1.114.475-.474 1.114-.75.638-.275 1.365-.275t1.365.275q.639.276 1.114.75.474.475.75 1.114.275.638.275 1.365t-.275 1.365q-.276.639-.75 1.113-.475.475-1.114.75-.638.276-1.365.276-.188 0-.375-.024-.188-.023-.375-.058v1.078h10.875q.469 0 .797.328.328.328.328.797zM12.75 2.373q-.41 0-.78.158-.368.158-.638.434-.27.275-.428.639-.158.363-.158.773 0 .41.158.78.159.368.428.638.27.27.639.428.369.158.779.158.41 0 .773-.158.364-.159.64-.428.274-.27.433-.639.158-.369.158-.779 0-.41-.158-.773-.159-.364-.434-.64-.275-.275-.639-.433-.363-.158-.773-.158zM6.937 9.814h2.25V7.94H2.814v1.875h2.25v6h1.875zm10.313 7.313v-6.75H12v6.504q0 .41-.293.703t-.703.293H8.309q.152.809.556 1.5.405.691.985 1.19.58.497 1.318.779.738.281 1.582.281.926 0 1.746-.352.82-.351 1.436-.966.615-.616.966-1.43.352-.815.352-1.752zm5.25-1.547v-5.203h-3.75v6.855q.305.305.691.452.387.146.809.146.469 0 .879-.176.41-.175.715-.48.304-.305.48-.715t.176-.879Z'], gmail:['#EA4335', 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z'], outlook:['#0A84D8', 'M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z'], x:['currentColor', 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z'], facebook:['#1877F2', 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z'], instagram:['#E4405F', 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077'], linkedin:['#2D8CDB', 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'], discord:['#5865F2', 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z'], slack:['#E01E5A', 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z'], reddit:['#FF4500', 'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z'], gcal:['#4285F4', 'M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z'], };
const bMark = (n, s) => BRAND[n] ? `<svg class="bmark" viewBox="0 0 24 24" width="${s || 13}" height="${s || 13}" aria-hidden="true"><path fill="${BRAND[n][0]}" d="${BRAND[n][1]}"/></svg>` : bIco({browser:'web', computer:'pick', images:'img'}[n] || 'box', s || 13);
const BTOOLS = [['pick', 'Wskaż i przesuwaj'], ['box', 'Nowy box'], ['link', 'Połącz boxy'], ['time', 'Godzina'], ['color', 'Kolor'], ['dup', 'Powiel'], ['run', 'Uruchom teraz'], ['power', 'Włącz albo wyłącz'], ['del', 'Usuń']];
const BRS = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].map(r => `<i class="bxsize rs-${r}" data-rs="${r}"></i>`).join('');
const BDAYL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'], BDPRE = [['Codziennie', ''], ['Dni robocze', '01234'], ['Weekend', '56']];
const bDayKey = d => { const k = d.slice().sort().join(''); return k === '0123456' ? '' : k; }, bDayName = d => { const k = bDayKey(d), p = BDPRE.find(x => x[1] === k); return p ? tr(p[0]) : d.slice().sort().map(i => tr(BDAYS[i])).join(', '); };
const BDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'], BG = 16, BCOL = ['', 'blue', 'green', 'amber', 'red', 'violet'];
let BD = {boxes:[], services:{}}, BDtool = 'pick', BDsel = '', BDdrag = null, BDfrom = '', BDpop = null, BDbusy = new Set(), BDwatch = 0, BDundo = null, BZ = Math.max(.4, Math.min(2, +(localStorage.getItem('lumobot-plan-z') || 1)));
const bIco = (k, n) => `<svg viewBox="0 0 16 16" width="${n || 15}" height="${n || 15}" aria-hidden="true">${BI[k]}</svg>`;
const bSnap = v => Math.round(v / BG) * BG;
const bTyping = () => { const a = document.activeElement; return !!a && $('boardIn').contains(a) && /TEXTAREA|INPUT/.test(a.tagName); };
const bBox = id => BD.boxes.find(x => x.id === id);
const bHit = (b, x, y, w, h) => BD.boxes.some(o => o.id !== b.id && x < o.x + o.w + BG && o.x < x + w + BG && y < o.y + o.h + BG && o.y < y + h + BG);      // boxy nie nachodzą na siebie: zajęte miejsce nie przyjmuje ruchu
const bAt = e => { const r = $('boardIn').getBoundingClientRect(); return [(e.clientX - r.left) / BZ, (e.clientY - r.top) / BZ]; };
let BDcentered = false, BDseen = null; const BM = 2400;      // margines kartki: dzięki niemu nawet box z samego rogu da się ustawić na środku okna
const bMid = () => { const bd = $('board'); return [(bd.scrollLeft + bd.clientWidth / 2) / BZ - BM, (bd.scrollTop + bd.clientHeight / 2) / BZ - BM]; };
function bCenter(){ const bd = $('board'); if(!bd.clientWidth) return; BDcentered = true; let cx = 3200, cy = 3200; if(BD.boxes.length){ cx = (Math.min(...BD.boxes.map(b => b.x)) + Math.max(...BD.boxes.map(b => b.x + b.w))) / 2; cy = (Math.min(...BD.boxes.map(b => b.y)) + Math.max(...BD.boxes.map(b => b.y + b.h))) / 2; } bd.scrollLeft = (cx + BM) * BZ - bd.clientWidth / 2; bd.scrollTop = (cy + BM) * BZ - bd.clientHeight / 2; }      // kartka otwiera się na środku tego, co na niej jest
async function loadBoard(){ try{ BD = await api('/api/board'); }catch(e){ return; } if(!bTyping() && !BDdrag) drawBoard(); if(!BDcentered) bCenter(); }
async function boardDo(body, okText, quiet){ try{ BD = await api('/api/board', body); if(!quiet) drawBoard(); if(okText) toast(okText); return true; }catch(err){ toast(err.message, true); try{ BD = await api('/api/board'); }catch(e){} drawBoard(); return false; } }
function drawHotbar(){ $('hotbar').innerHTML = BTOOLS.map(([id, name], i) => `<button type="button" class="slot${id === BDtool ? ' on' : ''}" data-tool="${id}" title="${tr(name)}">${bIco(id, 19)}<em data-keep>${i + 1}</em></button>`).join(''); $('board').dataset.tool = BDtool;
  $('boardZoom').innerHTML = `<button type="button" data-bz="undo" title="${tr('Cofnij usunięcie')}"${BDundo ? '' : ' disabled'}>${bIco('undo')}</button><i></i><button type="button" data-bz="out" title="${tr('Oddal')}">${bIco('minus')}</button><button type="button" class="pct" data-bz="one" title="${tr('Wróć do 100%')}" data-keep>${Math.round(BZ * 100)}%</button><button type="button" data-bz="in" title="${tr('Przybliż')}">${bIco('plus')}</button><button type="button" data-bz="fit" title="${tr('Pokaż wszystko')}">${bIco('fit')}</button><i></i><button type="button" class="txt" data-bz="tpl" title="${tr('Wstaw gotowy wzór')}">${tr('Wzory')}</button>`; }
function bTool(id){ if(bBox(BDsel) && ['time', 'color', 'dup', 'run', 'power', 'del'].includes(id)){ bAct(id, BDsel); return; }
  BDtool = id; BDfrom = ''; BDpop = null; drawHotbar(); drawBoard(); }
let BZend = 0, BZraf = 0;
function bZoom1(z, cx, cy, raw){ const bd = $('board'), old = BZ; if(!raw){ cancelAnimationFrame(BZraf); BZraf = 0; z = Math.max(.4, Math.min(2, Math.round(z * 20) / 20)); BZend = z; } if(z === old) return; cx = cx == null ? bd.clientWidth / 2 : cx; cy = cy == null ? bd.clientHeight / 2 : cy;
  const px = (bd.scrollLeft + cx) / old, py = (bd.scrollTop + cy) / old; BZ = z; $('boardIn').style.zoom = z; bd.scrollLeft = px * z - cx; bd.scrollTop = py * z - cy; if(!raw){ try{ localStorage.setItem('lumobot-plan-z', z); }catch(e){} drawHotbar(); } }
function bZoom(z, cx, cy){ z = Math.max(.4, Math.min(2, Math.round(z * 20) / 20)); if(z === (BZraf ? BZend : BZ)) return; BZend = z; cancelAnimationFrame(BZraf); const from = BZ, t0 = performance.now();      // płynne dojście do nowego przybliżenia, punkt pod kursorem stoi w miejscu
  const step = now => { const k = Math.min(1, (now - t0) / 190), e = 1 - Math.pow(1 - k, 3); if(k < 1){ bZoom1(from + (z - from) * e, cx, cy, true); BZraf = requestAnimationFrame(step); } else { BZraf = 0; bZoom1(z, cx, cy); if(BZ !== z){ BZ = z; } try{ localStorage.setItem('lumobot-plan-z', z); }catch(e){} drawHotbar(); } }; BZraf = requestAnimationFrame(step); }
function bFit(){ const bd = $('board'); if(!BD.boxes.length){ bZoom1(1); BDcentered = false; bCenter(); return; } const x0 = Math.min(...BD.boxes.map(b => b.x)), y0 = Math.min(...BD.boxes.map(b => b.y)), x1 = Math.max(...BD.boxes.map(b => b.x + b.w)), y1 = Math.max(...BD.boxes.map(b => b.y + b.h));
  const z = Math.min(1.25, (bd.clientWidth - 120) / Math.max(200, x1 - x0), (bd.clientHeight - 200) / Math.max(120, y1 - y0)); bZoom1(z); bd.scrollLeft = ((x0 + x1) / 2 + BM) * BZ - bd.clientWidth / 2; bd.scrollTop = ((y0 + y1) / 2 + BM) * BZ - bd.clientHeight / 2 + 30; }
function bPath(a, b){ const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2; let x1, y1, x2, y2, c1, c2;
  if(b.x >= a.x + a.w || b.x + b.w <= a.x || (Math.abs(bx - ax) > Math.abs(by - ay) && !(b.y >= a.y + a.h || b.y + b.h <= a.y))){ const r = bx > ax; x1 = r ? a.x + a.w : a.x; y1 = ay; x2 = r ? b.x - 4 : b.x + b.w + 4; y2 = by; const m = Math.max(24, Math.abs(x2 - x1) / 2) * (r ? 1 : -1); c1 = `${x1 + m} ${y1}`; c2 = `${x2 - m} ${y2}`; }
  else { const d = by > ay; x1 = ax; y1 = d ? a.y + a.h : a.y; x2 = bx; y2 = d ? b.y - 4 : b.y + b.h + 4; const m = Math.max(24, Math.abs(y2 - y1) / 2) * (d ? 1 : -1); c1 = `${x1} ${y1 + m}`; c2 = `${x2} ${y2 - m}`; }
  return `<path d="M${x1} ${y1} C ${c1}, ${c2}, ${x2} ${y2}" marker-end="url(#bArrow)"/>`; }
function bNote(b){ const v = b.verify, st = b.last === BD.today ? String(b.state || '') : '';
  if(BDbusy.has(b.id)) return `<div class="bxnote ask"><span>${tr('Sprawdzam…')}</span></div>`;
  if(st.startsWith('błąd')) return `<div class="bxnote warn"><span title="${esc(tr(st))}">${esc(tr(st))}</span></div>`;
  if(!v) return '';
  const miss = (v.needs || []).filter(n => !n.ok);
  const chips = (v.needs || []).map(n => n.ok ? `<span class="bneed ok" title="${tr('Gotowe')}">${bMark(n.id)}<b>${esc(tr(n.name))}</b><i></i></span>` : BD.services[n.id] ? `<button type="button" class="bneed link" data-bacc="${n.id}">${bMark(n.id)}<b>${tr('Połącz')} ${esc(n.name)}</b></button>` : `<span class="bneed miss" title="${tr('Niedostępne')}">${bMark(n.id)}<b>${esc(tr(n.name))}</b></span>`).join('');
  return `<div class="bxnote ${miss.length || !v.clear ? 'ask' : 'ok'}"><span title="${esc(v.text)}">${esc(v.text)}</span></div>` + (chips ? `<div class="bxneeds">${chips}</div>` : ''); }
function drawBoard(){ const host = $('boardIn'); if(!host) return; const W = Math.max(3200, ...BD.boxes.map(b => b.x + b.w + 800)), H = Math.max(2200, ...BD.boxes.map(b => b.y + b.h + 700)); host.style.width = W + 'px'; host.style.height = H + 'px'; host.style.zoom = BZ;
  const by = Object.fromEntries(BD.boxes.map(b => [b.id, b]));
  let h = `<svg class="blinks" width="${W}" height="${H}"><defs><marker id="bArrow" viewBox="0 0 8 8" refX="6.500" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1l5.500 3L1 7" fill="none" stroke="currentColor" stroke-width="1.400" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>${BD.boxes.filter(b => by[b.after]).map(b => bPath(by[b.after], b)).join('')}</svg>`;
  h += BD.boxes.map(b => { const a = agentOf(b.agent), ran = b.last === BD.today && String(b.state || '').startsWith('poszło'), tiny = b.h < 112, slim = b.w < 208;
    return `<div class="bx${b.id === BDsel ? ' sel' : ''}${b.id === BDfrom ? ' from' : ''}${ran ? ' ran' : ''}${b.live ? ' live' : ''}${b.on ? '' : ' off'}${tiny ? ' tiny' : ''}${slim ? ' slim' : ''}${b.color ? ' c-' + b.color : ''}" data-id="${b.id}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px">`
      + `<textarea class="bxtext" data-bt spellcheck="false" maxlength="4000">${esc(b.text || '')}</textarea>${tiny ? '' : bNote(b)}`
      + `<div class="bxfoot"><button type="button" class="bxag" data-ba title="${a ? esc(a.name) : ''}">${a ? face(a, 20) : ''}</button>${b.time ? `<button type="button" class="bxtime" data-btm data-keep>${b.time}${b.days.length && !slim ? ' · ' + bDayName(b.days) : ''}</button>` : ''}${b.live ? `<span class="bxrun"><i></i>${tr('pracuje')}</span>` : ran ? `<i class="bxdone" title="${tr('Dziś już uruchomiony')}"></i>` : ''}`
      + `<button type="button" class="bxver" data-bv${BDbusy.has(b.id) ? ' disabled' : ''}>${tr('Zweryfikuj')}</button></div>${BRS}</div>`; }).join('');
  $('hotbar').classList.toggle('has', !!bBox(BDsel));
  host.innerHTML = h; const first = !BDseen; BDseen = BDseen || new Set(); BD.boxes.forEach(b => { if(BDseen.has(b.id)) return; BDseen.add(b.id); if(!first){ const el = host.querySelector(`[data-id="${b.id}"]`); if(el) el.classList.add('bxnew'); } }); drawBoardPop(); }
function drawBoardPop(){ const host = $('boardIn'), old = host.querySelector('.bxpop'); if(old) old.remove(); if(!BDpop) return; const b = bBox(BDpop.id); if(!b){ BDpop = null; return; }
  const m = document.createElement('div'); m.className = 'bxpop';
  m.innerHTML = BDpop.type === 'agent' ? AG.map(a => `<button type="button" data-bagent="${a.id}" class="${a.id === b.agent ? 'on' : ''}">${face(a, 18)}<span>${esc(a.name)}</span></button>`).join('')
    : BDpop.type === 'color' ? `<div class="bxcols">${BCOL.map(c => `<button type="button" data-bcol="${c}" class="c-${c || 'none'}${(b.color || '') === c ? ' on' : ''}"></button>`).join('')}</div>`
    : `<div class="bxtrow"><input type="time" data-btime value="${b.time || ''}" step="300"><button type="button" data-bnotime>${tr('Bez godziny')}</button></div><button type="button" class="bxdd${BDpop.open ? ' open' : ''}" data-bddopen><span>${bDayName(b.days)}</span><svg viewBox="0 0 12 12"><path d="m3 4.500 3 3 3-3"/></svg></button>`
      + (BDpop.open ? `<div class="bxddlist"><div class="bxddpre">${BDPRE.map(p => `<button type="button" data-bdays="${p[1]}" class="${bDayKey(b.days) === p[1] ? 'on' : ''}">${tr(p[0])}</button>`).join('')}</div>${BDAYL.map((d, i) => `<button type="button" data-bday="${i}" class="${!b.days.length || b.days.includes(i) ? 'on' : ''}"><span>${tr(d)}</span><svg viewBox="0 0 14 14"><path d="m3 7.300 2.700 2.700L11 4.500"/></svg></button>`).join('')}</div>` : '');
  host.appendChild(m); const mw = m.offsetWidth, mh = m.offsetHeight, hit = (x, y) => x < 0 || y < 0 || BD.boxes.some(o => o.id !== b.id && o.x < x + mw && x < o.x + o.w && o.y < y + mh && y < o.y + o.h);
  const spots = [[b.x, b.y + b.h + 8], [b.x, b.y - mh - 8], [b.x + b.w + 8, b.y], [b.x - mw - 8, b.y], [b.x + b.w + 8, b.y + b.h - mh], [b.x + 8, Math.max(b.y + 8, b.y + b.h - mh - 8)]], at = spots.find(s => !hit(s[0], s[1])) || spots[spots.length - 1]; m.style.left = at[0] + 'px'; m.style.top = at[1] + 'px'; }
async function bAccConnect(agentId, service){ const name = BD.services[service] || service; try{ await api('/api/accounts', {agent:agentId, service, op:'login'}); }catch(err){ toast(err.message, true); return; }
  toast(`${tr('Otworzyłem okno przeglądarki agenta. Zaloguj się do')} ${name} ${tr('i zamknij to okno.')}`); clearInterval(BDwatch);
  BDwatch = setInterval(async () => { let r; try{ r = await api('/api/accounts?agent=' + encodeURIComponent(agentId)); }catch(e){ return; } if(r.services.some(s => s.open)) return; clearInterval(BDwatch); toast(`${tr('Sprawdzam, czy konto jest zalogowane')}: ${name}`);
    try{ const out = await api('/api/accounts', {agent:agentId, service, op:'check'}), ok = (out.services.find(s => s.id === service) || {}).ok; toast(ok ? `${name}: ${tr('konto połączone.')}` : `${name}: ${tr('nie widzę zalogowanego konta. Spróbuj jeszcze raz.')}`, !ok); }catch(err){ toast(err.message, true); } loadBoard(); if(!$('tab-ustawienia').hidden) loadConn(); }, 2000); }
function bVerify(id){ if(BDbusy.has(id)) return; BDbusy.add(id); drawBoard(); boardDo({verify:id}, '', true).then(() => { BDbusy.delete(id); if(!bTyping()) drawBoard(); }); }
function bRemove(id){ const b = bBox(id); if(!b) return; BDundo = {...b}; if(BDsel === id) BDsel = ''; boardDo({remove:id}).then(drawHotbar); }
function bDup(id){ const b = bBox(id); if(!b) return; boardDo({save:{agent:b.agent, text:b.text, x:b.x + 32, y:b.y + 32, w:b.w, h:b.h, time:b.time, days:b.days, color:b.color}}, '', true).then(ok => { if(ok){ BDsel = BD.boxes[BD.boxes.length - 1].id; drawBoard(); } }); }
function bAct(k, id){ const b = bBox(id); if(!b) return;
  if(k === 'del') bRemove(id); else if(k === 'dup') bDup(id); else if(k === 'power') boardDo({save:{id, on:!b.on}});
  else if(k === 'run') boardDo({run:id}, 'Zadanie wystartowało.').then(ok => { if(ok) setTimeout(poll, 600); });
  else if(k === 'time' || k === 'color'){ BDpop = BDpop && BDpop.id === id && BDpop.type === k ? null : {id, type:k}; drawBoardPop(); } }
function bUse(id){ const b = bBox(id); if(!b) return;
  if(BDtool === 'link'){ if(!BDfrom){ BDfrom = id; drawBoard(); } else if(BDfrom === id){ BDfrom = ''; drawBoard(); } else { const src = BDfrom; BDfrom = ''; boardDo({save:{id, after:b.after === src ? '' : src}}); } }
  else bAct(BDtool, id); }
$('hotbar').addEventListener('click', e => { const b = e.target.closest('[data-tool]'); if(b) bTool(b.dataset.tool); });
$('tab-plan').addEventListener('click', e => { const t = e.target.closest('[data-btpl]'), m = document.querySelector('.btpl'); if(t){ m.remove(); boardDo({template:t.dataset.btpl, agent:cur, at:bMid().map(v => Math.round(v))}, 'Wzór wstawiony. Uzupełnij pola w nawiasach.').then(ok => { if(ok) bFit(); }); } else if(m && !e.target.closest('[data-bz="tpl"]')) m.remove(); });
$('boardZoom').addEventListener('click', e => { const b = e.target.closest('[data-bz]'); if(!b) return; const k = b.dataset.bz; if(k === 'tpl'){ const old = document.querySelector('.btpl'); if(old){ old.remove(); return; } const m = document.createElement('div'); m.className = 'btpl'; m.innerHTML = (BD.templates || []).map(t => `<button type="button" data-btpl="${t.id}"><b>${tr(t.name)}</b><em data-keep>${t.count}</em></button>`).join(''); $('tab-plan').appendChild(m); return; }
  if(k === 'in') bZoom(BZ + .1); else if(k === 'out') bZoom(BZ - .1); else if(k === 'one') bZoom(1); else if(k === 'fit') bFit();
  else if(k === 'undo' && BDundo){ const u = BDundo; BDundo = null; boardDo({save:{agent:u.agent, text:u.text, x:u.x, y:u.y, w:u.w, h:u.h, time:u.time, days:u.days, color:u.color, on:u.on}}).then(drawHotbar); } });
$('board').addEventListener('wheel', e => { e.preventDefault(); const r = $('board').getBoundingClientRect(); bZoom((BZraf ? BZend : BZ) + (e.deltaY < 0 ? .1 : -.1), e.clientX - r.left, e.clientY - r.top); }, {passive:false});
document.addEventListener('keydown', e => { if(tab !== 'plan' || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return; const k = e.key.toLowerCase();
  if((e.ctrlKey || e.metaKey) && k === 'd' && BDsel){ e.preventDefault(); bDup(BDsel); return; } if((e.ctrlKey || e.metaKey) && k === 'z' && BDundo){ e.preventDefault(); $('boardZoom').querySelector('[data-bz="undo"]').click(); return; }
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  const i = '123456789'.indexOf(e.key); if(i >= 0 && BTOOLS[i]){ e.preventDefault(); bTool(BTOOLS[i][0]); return; }
  if(k === 'escape'){ BDfrom = ''; BDpop = null; BDsel = ''; bTool('pick'); } else if((k === 'delete' || k === 'backspace') && BDsel){ e.preventDefault(); bRemove(BDsel); }
  else if(k === '+' || k === '=') bZoom(BZ + .1); else if(k === '-') bZoom(BZ - .1); else if(k === '0') bFit();
  else if(k.startsWith('arrow') && BDsel){ e.preventDefault(); const b = bBox(BDsel), d = {arrowleft:[-BG, 0], arrowright:[BG, 0], arrowup:[0, -BG], arrowdown:[0, BG]}[k]; boardDo({save:{id:b.id, x:Math.max(0, b.x + d[0]), y:Math.max(0, b.y + d[1])}}); } });
$('boardIn').addEventListener('pointerdown', e => { if(e.button > 1) return; const host = $('boardIn'), bd = $('board'), [px, py] = bAt(e), el = e.target.closest('.bx');
  if(e.target.closest('.bxpop,.bxbar')) return; if(BDpop && !e.target.closest('[data-ba],[data-btm]')){ BDpop = null; drawBoardPop(); }
  if(e.button === 1 || (!el && BDtool !== 'box')){ BDdrag = {mode:'pan', x:e.clientX, y:e.clientY, sl:bd.scrollLeft, st:bd.scrollTop, moved:false}; host.setPointerCapture(e.pointerId); host.classList.add('panning'); e.preventDefault(); return; }
  if(!el){ BDdrag = {mode:'draw', x:px, y:py, ghost:null}; host.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const b = bBox(el.dataset.id); if(!b) return;
  if(BDtool !== 'pick' && BDtool !== 'box'){ e.preventDefault(); bUse(b.id); return; }
  if(e.target.closest('button')) return;
  const size = e.target.closest('.bxsize'); if(e.target.closest('textarea') && !size){ if(BDsel !== b.id){ BDsel = b.id; document.querySelectorAll('.bx.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); const bar = host.querySelector('.bxbar'); if(bar) bar.remove(); } return; }
  BDdrag = {mode:size ? 'size' : 'move', b, el, x:e.clientX, y:e.clientY, ox:b.x, oy:b.y, ow:b.w, oh:b.h, rs:size ? size.dataset.rs : '', moved:false}; el.setPointerCapture(e.pointerId); e.preventDefault(); });
$('boardIn').addEventListener('pointermove', e => { const d = BDdrag; if(!d) return;
  if(d.mode === 'pan'){ const bd = $('board'); if(Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3) d.moved = true; bd.scrollLeft = d.sl - (e.clientX - d.x); bd.scrollTop = d.st - (e.clientY - d.y); return; }
  if(d.mode === 'draw'){ const [px, py] = bAt(e); if(!d.ghost){ if(Math.abs(px - d.x) + Math.abs(py - d.y) < 6) return; d.ghost = document.createElement('div'); d.ghost.className = 'bxghost'; $('boardIn').appendChild(d.ghost); }
    const x = bSnap(Math.min(d.x, px)), y = bSnap(Math.min(d.y, py)), w = bSnap(Math.abs(px - d.x)), h = bSnap(Math.abs(py - d.y)); Object.assign(d.ghost.style, {left:x + 'px', top:y + 'px', width:w + 'px', height:h + 'px'}); d.rect = {x, y, w, h}; return; }
  const dx = (e.clientX - d.x) / BZ, dy = (e.clientY - d.y) / BZ; if(!d.moved && Math.abs(dx) + Math.abs(dy) < 4) return; if(!d.moved){ d.moved = true; const bar = $('boardIn').querySelector('.bxbar'); if(bar) bar.remove(); }
  if(d.mode === 'move'){ const nx = Math.max(0, bSnap(d.ox + dx)), ny = Math.max(0, bSnap(d.oy + dy)); if(!bHit(d.b, nx, ny, d.b.w, d.b.h)){ d.b.x = nx; d.b.y = ny; } else if(!bHit(d.b, nx, d.b.y, d.b.w, d.b.h)) d.b.x = nx; else if(!bHit(d.b, d.b.x, ny, d.b.w, d.b.h)) d.b.y = ny; d.el.style.left = d.b.x + 'px'; d.el.style.top = d.b.y + 'px'; d.el.classList.add('drag'); }
  else { const R = d.rs || 'se', L = R.includes('w'), T = R.includes('n'); let w = d.ow, h = d.oh; if(R.includes('e')) w = d.ow + dx; if(L) w = Math.min(d.ow - dx, d.ox + d.ow); if(R.includes('s')) h = d.oh + dy; if(T) h = Math.min(d.oh - dy, d.oy + d.oh);
    const nw = Math.max(112, Math.min(960, bSnap(w))), nh = Math.max(64, Math.min(800, bSnap(h))), nx = L ? Math.max(0, d.ox + d.ow - nw) : d.ox, ny = T ? Math.max(0, d.oy + d.oh - nh) : d.oy;
    if(!bHit(d.b, nx, ny, nw, nh)){ d.b.x = nx; d.b.y = ny; d.b.w = nw; d.b.h = nh; } else if(!bHit(d.b, nx, d.b.y, nw, d.b.h)){ d.b.x = nx; d.b.w = nw; } else if(!bHit(d.b, d.b.x, ny, d.b.w, nh)){ d.b.y = ny; d.b.h = nh; }
    Object.assign(d.el.style, {left:d.b.x + 'px', top:d.b.y + 'px', width:d.b.w + 'px', height:d.b.h + 'px'}); d.el.classList.add('drag'); let dm = d.el.querySelector('.bxdim'); if(!dm){ dm = document.createElement('span'); dm.className = 'bxdim'; dm.dataset.keep = ''; d.el.appendChild(dm); } dm.textContent = d.b.w + ' × ' + d.b.h; d.el.classList.toggle('tiny', d.b.h < 112); d.el.classList.toggle('slim', d.b.w < 208); }
  const svg = $('boardIn').querySelector('.blinks'); if(svg){ const by = Object.fromEntries(BD.boxes.map(b => [b.id, b])); svg.querySelectorAll('path[marker-end]').forEach(p => p.remove()); svg.insertAdjacentHTML('beforeend', BD.boxes.filter(b => by[b.after]).map(b => bPath(by[b.after], b)).join('')); } });
const bDrop = e => { const d = BDdrag; if(!d) return; BDdrag = null; $('boardIn').classList.remove('panning'); const dm = d.el && d.el.querySelector('.bxdim'); if(dm) dm.remove();
  if(d.mode === 'pan'){ if(!d.moved && (BDsel || BDfrom)){ BDsel = ''; BDfrom = ''; if(!bTyping()) drawBoard(); } return; }
  if(d.mode === 'draw'){ if(d.ghost) d.ghost.remove(); const q = d.rect && d.rect.w >= 96 && d.rect.h >= 64 ? d.rect : {x:bSnap(d.x), y:bSnap(d.y), w:288, h:160};
    boardDo({save:{agent:cur, x:q.x, y:q.y, w:q.w, h:q.h, text:''}}, '', true).then(ok => { if(!ok) return; const nb = BD.boxes[BD.boxes.length - 1]; BDsel = nb.id; BDtool = 'pick'; drawHotbar(); drawBoard(); const t = $('boardIn').querySelector(`[data-id="${nb.id}"] textarea`); if(t) t.focus({preventScroll:true}); }); return; }
  if(!d.moved){ BDsel = d.b.id; drawBoard(); return; }
  boardDo({save:{id:d.b.id, x:d.b.x, y:d.b.y, w:d.b.w, h:d.b.h}}); };
$('boardIn').addEventListener('pointerup', bDrop); $('boardIn').addEventListener('pointercancel', bDrop);
$('boardIn').addEventListener('dblclick', e => { if(e.target.closest('.bx,.bxpop,.bxbar') || BDtool !== 'pick') return; const [px, py] = bAt(e); boardDo({save:{agent:cur, x:bSnap(px - 144), y:bSnap(py - 80), w:288, h:160, text:''}}, '', true).then(ok => { if(!ok) return; const nb = BD.boxes[BD.boxes.length - 1]; BDsel = nb.id; drawBoard(); const t = $('boardIn').querySelector(`[data-id="${nb.id}"] textarea`); if(t) t.focus({preventScroll:true}); }); });
$('boardIn').addEventListener('click', e => { const el = e.target.closest('.bx'), id = el && el.dataset.id, b = id && bBox(id);
  const ag = e.target.closest('[data-bagent]'), day = e.target.closest('[data-bday]'), col = e.target.closest('[data-bcol]'), act = e.target.closest('[data-bact]');
  if(act && BDsel){ bAct(act.dataset.bact, BDsel); return; }
  if(ag && BDpop){ const pid = BDpop.id; BDpop = null; boardDo({save:{id:pid, agent:ag.dataset.bagent}}); return; }
  if(col && BDpop){ const pid = BDpop.id; BDpop = null; boardDo({save:{id:pid, color:col.dataset.bcol}}); return; }
  if(e.target.closest('[data-bddopen]') && BDpop){ BDpop.open = !BDpop.open; drawBoardPop(); return; }
  const pre = e.target.closest('[data-bdays]'); if(pre && BDpop){ boardDo({save:{id:BDpop.id, days:pre.dataset.bdays.split('').map(Number)}}, '', true).then(() => { drawBoard(); }); return; }
  if(day && BDpop){ const pb = bBox(BDpop.id), n = +day.dataset.bday, full = pb.days.length ? pb.days : [0, 1, 2, 3, 4, 5, 6]; let days = full.includes(n) ? full.filter(x => x !== n) : full.concat(n); if(days.length === 7) days = []; boardDo({save:{id:pb.id, days}}, '', true).then(() => { drawBoard(); }); return; }
  if(e.target.closest('[data-bnotime]') && BDpop){ const pid = BDpop.id; BDpop = null; boardDo({save:{id:pid, time:'', days:[]}}); return; }
  if(!b || (BDtool !== 'pick' && BDtool !== 'box')) return;
  if(e.target.closest('[data-bv]')) bVerify(id);
  else if(e.target.closest('[data-ba]')){ BDpop = BDpop && BDpop.id === id && BDpop.type === 'agent' ? null : {id, type:'agent'}; drawBoardPop(); }
  else if(e.target.closest('[data-btm]')){ BDpop = BDpop && BDpop.id === id && BDpop.type === 'time' ? null : {id, type:'time'}; drawBoardPop(); }
  else if(e.target.closest('[data-bacc]')) bAccConnect(b.agent, e.target.closest('[data-bacc]').dataset.bacc); });
$('boardIn').addEventListener('change', e => { const t = e.target.closest('[data-bt]'), tm = e.target.closest('[data-btime]');
  if(t){ const id = t.closest('.bx').dataset.id; boardDo({save:{id, text:t.value}}, '', true).then(() => { if(!bTyping()) drawBoard(); }); }
  if(tm && BDpop) boardDo({save:{id:BDpop.id, time:tm.value}}, '', true).then(() => { if(!bTyping()) drawBoard(); }); });
setInterval(() => { if(tab === 'plan' && !document.hidden && !BDdrag && !BDpop && !BDbusy.size && !bTyping()) loadBoard(); }, 15000);
drawHotbar();
/* ---------- Raport z planu: co boxy już zrobiły, kiedy, kto i z jakim wynikiem ---------- */
let BRV = 'plan', BR = null, BRopen = new Set(), BRfil = 'all';
const BRST = {ok:'Zrobione', run:'W toku', queued:'W kolejce', stopped:'Zatrzymane', bad:'Nie udało się', unknown:'Brak danych'};
const BRFIL = [['all', 'Wszystko'], ['ok', 'Zrobione'], ['live', 'W toku'], ['bad', 'Do sprawdzenia']];
const brIn = (x, f) => f === 'all' || (f === 'ok' && x.status === 'ok') || (f === 'live' && (x.status === 'run' || x.status === 'queued')) || (f === 'bad' && ['bad', 'unknown', 'stopped'].includes(x.status));
function bView(v){ BRV = v; $('board').hidden = v !== 'plan'; $('hotbar').hidden = v !== 'plan'; $('boardZoom').hidden = v !== 'plan'; $('boardReport').hidden = v !== 'report';
  $('boardSwitch').querySelectorAll('[data-bview]').forEach(b => b.classList.toggle('on', b.dataset.bview === v)); if(v === 'report') loadBReport(); else loadBoard(); }
async function loadBReport(){ try{ BR = await api('/api/board/report'); }catch(e){ return; } drawBReport(); }
function brDay(t){ const d = new Date(t), n = new Date(), y = new Date(Date.now() - 864e5), same = (a, b) => a.toDateString() === b.toDateString(); return same(d, n) ? tr('Dziś') : same(d, y) ? tr('Wczoraj') : d.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'pl-PL', {weekday:'long', day:'numeric', month:'long'}); }
function drawBReport(){ const box = $('boardReport'); if(!BR) return; const S2 = BR.sum, keepEl = box.querySelector('.rplist'), keep = keepEl ? keepEl.scrollTop : 0, part = S2.started ? Math.round(S2.ok / S2.started * 100) : 0;
  const stat = (label, val, cls) => `<div class="rpstat${cls ? ' ' + cls : ''}"><span>${tr(label)}</span><b data-keep>${val}</b></div>`;
  const side = `<aside class="rpside"><h2>${tr('Raport')}</h2><p class="rpdate" data-keep>${new Date().toLocaleDateString(LANG === 'en' ? 'en-GB' : 'pl-PL', {weekday:'long', day:'numeric', month:'long'})}</p>`
    + `<div class="rpbig"><b data-keep>${S2.ok}<i>/${S2.started}</i></b><span>${tr('zrobione dziś')}</span><u><i style="width:${part}%"></i></u></div>`
    + `<div class="rpstats">${stat('W toku', S2.running)}${stat('Do sprawdzenia', S2.bad, S2.bad ? 'bad' : '')}${stat('Czas pracy', S2.seconds ? span(S2.seconds) : '0 s')}${stat('Koszt', money(S2.cost || 0))}</div>`
    + `<div class="rpfil">${BRFIL.map(([k, n]) => `<button type="button" data-brf="${k}" class="${k === BRfil ? 'on' : ''}"><span>${tr(n)}</span><em data-keep>${BR.items.filter(x => brIn(x, k)).length}</em></button>`).join('')}</div><button type="button" class="rpcopy" data-brcopy>${tr('Kopiuj raport')}</button></aside>`;
  const rows = BR.items.filter(x => brIn(x, BRfil)); let list = '', day = '';
  for(const x of rows){ const dl = brDay(x.t); if(dl !== day){ day = dl; list += `<div class="rpday">${esc(dl)}</div>`; }
    const a = agentOf(x.agent), k = x.t + '|' + x.box, open = BRopen.has(k), tm = new Date(x.t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    list += `<div class="rprow st-${x.status}${open ? ' open' : ''}" data-brk="${esc(k)}"><i class="rpdot"></i><time data-keep>${tm}</time><div class="rpmain"><p>${esc(x.text || '')}</p>`
      + `<div class="rpmeta"><em class="rpst">${tr(BRST[x.status] || BRST.unknown)}</em>${a ? `<span class="rpag">${face(a, 16)}<b>${esc(a.name)}</b></span>` : ''}${x.seconds ? `<span data-keep>${span(x.seconds)}</span>` : ''}${x.rounds ? `<span>${tr('Rund')}: ${x.rounds}</span>` : ''}${x.cost ? `<span data-keep>${money(x.cost)}</span>` : ''}</div>`
      + (open ? `<div class="rpbody">${x.answer ? `<div class="say">${md(x.answer)}</div>` : `<p class="rpnone">${tr(x.status === 'run' || x.status === 'queued' ? 'Agent jeszcze nie skończył.' : 'Nie ma zapisanej odpowiedzi.')}</p>`}${a ? `<button type="button" data-brgo="${a.id}">${tr('Otwórz rozmowę z agentem')}</button>` : ''}<button type="button" data-brrun="${esc(x.box)}">${tr('Uruchom ponownie')}</button></div>` : '')
      + `</div><svg class="rpcv" viewBox="0 0 12 12" width="11" height="11"><path d="M3 4.500 6 7.500 9 4.500" fill="none" stroke="currentColor" stroke-width="1.400" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`; }
  if(!rows.length) list = `<div class="rpempty">${tr(BR.items.length ? 'Nic nie pasuje do tego filtra.' : 'Żaden box jeszcze nie pracował.')}</div>`;
  box.innerHTML = `<div class="rpwrap">${side}<div class="rplist">${list}</div></div>`; const nl = box.querySelector('.rplist'); if(nl) nl.scrollTop = keep; }
$('boardSwitch').addEventListener('click', e => { const b = e.target.closest('[data-bview]'); if(b) bView(b.dataset.bview); });
$('boardReport').addEventListener('click', e => { const go = e.target.closest('[data-brgo]'), fil = e.target.closest('[data-brf]'); if(go){ cur = go.dataset.brgo; show('agent'); return; } if(fil){ BRfil = fil.dataset.brf; drawBReport(); return; }
  const again = e.target.closest('[data-brrun]'); if(again){ api('/api/board', {run:again.dataset.brrun}).then(() => { toast('Zadanie wystartowało.'); loadBReport(); setTimeout(poll, 600); }).catch(err => toast(/takiego|boxa/i.test(err.message) ? 'Tego boxa nie ma już w planie.' : err.message, true)); return; }
  if(e.target.closest('[data-brcopy]')){ const rows = BR.items.filter(x => brIn(x, BRfil)), txt = `# ${tr('Raport')} LumoBot, ${new Date().toLocaleDateString()}\n\n` + rows.map(x => `- ${new Date(x.t).toLocaleString()} | ${tr(BRST[x.status] || BRST.unknown)} | ${(agentOf(x.agent) || {}).name || ''} | ${x.text}${x.answer ? '\n  ' + String(x.answer).replace(/\s+/g, ' ').slice(0, 400) : ''}`).join('\n'); navigator.clipboard.writeText(txt).then(() => toast('Raport skopiowany do schowka.')).catch(() => toast('Nie udało się skopiować.', true)); return; }
  if(e.target.closest('a,.say')) return; const row = e.target.closest('[data-brk]'); if(!row) return; const k = row.dataset.brk; BRopen.has(k) ? BRopen.delete(k) : BRopen.add(k); drawBReport(); });
setInterval(() => { if(tab === 'plan' && BRV === 'report' && !document.hidden) loadBReport(); }, 5000);
/* ---------- Pigułka głosowa: mały pasek rozmowy. Dwa tryby: przytrzymaj i mów (pad albo Spacja) oraz otwarty mikrofon ---------- */
const vptt = () => vget('ptt') !== '0';
const VHAND = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.400" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.200"/><path d="M8 2.200v1.600M8 12.200v1.600M2.200 8h1.600M12.200 8h1.600"/></svg>';
function vpillCap(){ const bar = $('vbar'), el = bar && bar.querySelector('.vbcap'); if(!el) return; const last = VO.turns[VO.turns.length - 1], t = last && vopt().text ? (last.role === 'me' ? tr('Ty') + ': ' : '') + String(last.text || '').replace(/\s+/g, ' ').slice(0, 150) : ''; if(el.textContent !== t) el.textContent = t; el.hidden = !t; }
function vpill(){ const bar = $('vbar'); if(!bar) return; bar.hidden = !VO.open || vIsland(); if(!VO.open || vIsland()){ bar.innerHTML = ''; bar.dataset.k = ''; return; }
  const a = agentOf(cur), ptt = vptt(), st = VO.state, hold = !!VO.hold, need = !(VO.status && VO.status.ready), busy = ['working', 'understanding', 'thinking'].includes(st), sp = vopt().speed;
  const key = [a && a.id, a && a.color, ptt, st, hold, need, sp, !!VO.wide, LANG].join('|'); if(bar.dataset.k === key){ vpillCap(); return; } bar.dataset.k = key;
  const bars = `<span class="vb">${'<i></i>'.repeat(13)}</span>`;
  const pad = need ? `<span class="vbl">${tr(VSTATE.setup)}</span>` : st === 'speaking' ? `${bars}<span class="vbl dim">${tr('Kliknij, żeby przerwać')}</span>` : busy ? `<span class="vbdots"><i></i><i></i><i></i></span><span class="vbl">${tr(VSTATE[st])}</span>`
    : ptt ? (hold ? bars : `${vsvg('mic', 16)}<span class="vbl">${tr('Przytrzymaj i mów')}</span><kbd>${tr('Spacja')}</kbd>`) : st === 'idle' ? `${vsvg('micoff', 16)}<span class="vbl dim">${tr('Mikrofon wyciszony')}</span>` : `${bars}<span class="vbl dim">${tr('Słucham')}</span>`;
  bar.innerHTML = `<div class="vbcap" hidden></div><div class="vbrow"><span class="vbface">${a ? face(a, 34, busy ? 'busy' : '') : ''}</span>`
    + `<button type="button" class="vbpad${hold ? ' hold' : ''}${st === 'speaking' ? ' talk' : ''}${busy ? ' busy' : ''}" data-vbpad ${need ? 'disabled' : ''}>${pad}</button>`
    + `<div class="vbmode"><button type="button" data-vbmode="open" class="${ptt ? '' : 'on'}" title="${tr('Otwarty mikrofon: mówisz bez przytrzymywania')}">${vsvg('wave', 16)}</button><button type="button" data-vbmode="ptt" class="${ptt ? 'on' : ''}" title="${tr('Przytrzymaj i mów')}">${VHAND}</button></div>`
    + `<button type="button" class="vbi txt" data-vbspeed title="${tr('Szybkość mowy')}" data-keep>${sp}×</button>`
    + (ptt ? '' : `<button type="button" class="vbi" data-vbmic title="${tr('Mikrofon: włącz albo wycisz')}">${vsvg(st === 'idle' ? 'micoff' : 'mic', 16)}</button>`)
    + `<button type="button" class="vbi" data-vbstop title="${tr('Przerwij mówienie')}" ${st === 'speaking' ? '' : 'disabled'}>${vsvg('stop', 16)}</button>`
    + `<button type="button" class="vbi${VO.wide ? ' on' : ''}" data-vbgear title="${tr('Ustawienia głosu')}">${vsvg('gear', 16)}</button><button type="button" class="vbi" data-vbclose title="${tr('Zamknij')}">${vsvg('end', 16)}</button></div>`;
  vpillCap(); }
function vhold(on){ if(!VO.open || !vptt() || !(VO.status && VO.status.ready)) return; if(on){ if(VO.hold) return; if(VO.state === 'speaking') vstopSpeak(); else if(['working', 'understanding', 'thinking'].includes(VO.state)) return; VO.state = 'listening'; VO.hold = true; } else { if(!VO.hold) return; VO.hold = false; } vui(); }
$('vbar').addEventListener('pointerdown', e => { if(e.button) return; if(!e.target.closest('[data-vbpad]')) return; e.preventDefault(); vpadPress(); });
document.addEventListener('pointerup', () => vhold(false)); document.addEventListener('pointercancel', () => vhold(false)); addEventListener('blur', () => vhold(false));
document.addEventListener('keydown', e => { if(e.code !== 'Space' || !VO.open || !vptt() || e.ctrlKey || e.metaKey || e.altKey) return; const t = document.activeElement, typing = t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable); if(typing) return; e.preventDefault(); if(!e.repeat) vhold(true); });
document.addEventListener('keyup', e => { if(e.code === 'Space' && VO.hold){ e.preventDefault(); vhold(false); } });
$('vbar').addEventListener('click', e => { const m = e.target.closest('[data-vbmode]');
  if(m){ vmode(m.dataset.vbmode); return; }
  if(e.target.closest('[data-vbclose]')){ voiceClose(); return; }
  if(e.target.closest('[data-vbgear]')){ VO.wide = !VO.wide; $('voice').classList.toggle('tucked', !VO.wide); document.body.classList.toggle('voice-open', !!VO.wide); vui(); return; }
  if(e.target.closest('[data-vbstop]')){ vstopNow(); return; }
  if(e.target.closest('[data-vbspeed]')){ vspeedNext(); return; }
  if(e.target.closest('[data-vbmic]')) vmicToggle(); });
/* ---------- Połączenia: wszystkie konta, z których agent może korzystać w swojej przeglądarce ---------- */
let BCag = '', BCacc = [], BCquery = '', BCdrawKey = '';
const CNDESC = {gmail:'Maile: czytanie, szukanie i wysyłanie', outlook:'Poczta i kalendarz Microsoft', gcal:'Wydarzenia, spotkania i terminy', teams:'Czaty, spotkania i kanały zespołu', zoom:'Spotkania wideo i nagrania', calendly:'Umawianie spotkań i wolne terminy', gdrive:'Pliki i foldery na Dysku', gdocs:'Tworzenie i edycja dokumentów', gsheets:'Arkusze, tabele i dane', dropbox:'Pliki i udostępnione foldery', notion:'Notatki, strony i bazy danych', trello:'Tablice, listy i karty zadań', github:'Repozytoria, zgłoszenia i pull requesty', figma:'Projekty, makiety i komentarze', canva:'Grafiki, prezentacje i posty', onedrive:'Pliki w chmurze Microsoft', office:'Word, Excel i PowerPoint w sieci', gphotos:'Zdjęcia, albumy i filmy', airtable:'Bazy, tabele i widoki', wordpress:'Wpisy, strony i komentarze bloga', medium:'Artykuły i szkice', x:'Posty, odpowiedzi i wiadomości', facebook:'Posty, strony i wiadomości', instagram:'Posty, relacje i wiadomości', threads:'Wątki i odpowiedzi', linkedin:'Profil, posty i wiadomości', tiktok:'Filmy, komentarze i statystyki', youtube:'Filmy, kanał i komentarze', reddit:'Posty, komentarze i społeczności', pinterest:'Piny i tablice', twitch:'Kanał, transmisje i czat', bluesky:'Posty i odpowiedzi', tumblr:'Wpisy na blogu', quora:'Pytania i odpowiedzi', substack:'Newsletter, wpisy i subskrybenci', snapchat:'Snapy i wiadomości', discord:'Serwery, kanały i wiadomości', slack:'Wzmianki i wiadomości bezpośrednie', messenger:'Rozmowy i wiadomości', whatsapp:'Czaty i wiadomości', telegram:'Czaty, kanały i wiadomości', skype:'Rozmowy i połączenia', allegro:'Zakupy, oferty i zamówienia', shopify:'Sklep, produkty i zamówienia', spotify:'Muzyka i playlisty', steam:'Gry, biblioteka i znajomi', soundcloud:'Utwory i playlisty', amazon:'Zakupy i zamówienia', ebay:'Aukcje, zakupy i sprzedaż', vinted:'Ogłoszenia, zakupy i sprzedaż', booking:'Noclegi i rezerwacje', airbnb:'Noclegi, rezerwacje i wiadomości', netflix:'Filmy, seriale i twoja lista', aliexpress:'Zakupy, zamówienia i przesyłki', jira:'Zgłoszenia, sprinty i dokumentacja', asana:'Projekty i zadania zespołu', clickup:'Zadania, listy i dokumenty', linear:'Zgłoszenia i cykle pracy', gitlab:'Repozytoria i merge requesty', vercel:'Wdrożenia i domeny', netlify:'Strony i wdrożenia', cloudflare:'Domeny, DNS i ochrona', hubspot:'Kontakty, firmy i sprzedaż', mailchimp:'Newslettery i listy mailingowe'};      // co agent zrobi z tym kontem: krótki opis pod nazwą
const cnNormalize = s => s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
function filterConnections(animate = false){
  const q = cnNormalize(BCquery.trim()), globalQuery = cnNormalize($('setSearch').value.trim());
  let count = 0;
  $('boardConn').querySelectorAll('.cncard').forEach(card => {
    const text = cnNormalize(card.dataset.search), wasHidden = card.hidden;
    card.hidden = !text.includes(q) || !text.includes(globalQuery);
    if(!card.hidden){ count++; if((wasHidden || animate) && !matchMedia('(prefers-reduced-motion: reduce)').matches) { card.getAnimations().forEach(a => a.cancel()); card.animate([{opacity:0,transform:'translateY(8px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:240,delay:Math.min(count - 1, 7) * 18,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}); } }
  });
  $('boardConn').querySelectorAll('.cngrid').forEach(grid => { grid.hidden = ![...grid.children].some(card => !card.hidden); grid.previousElementSibling.hidden = grid.hidden; });
  const empty = $('cnEmpty'); if(empty) empty.hidden = count > 0;
  const clear = $('cnClear'); if(clear) clear.hidden = !BCquery;
}
async function loadConn(){ BCag = cur; try{ const r = await api('/api/accounts?agent=' + encodeURIComponent(BCag)); BCacc = r.services || []; }catch(e){ return; } drawConn(); }
function drawConn(){ const box = $('boardConn'), keep = box.scrollTop, groups = {};
  const key = JSON.stringify([BCag, LANG, BCacc]);
  if(key === BCdrawKey && $('cnSearch')){ filterConnections(); return; } BCdrawKey = key;
  const focused = document.activeElement && document.activeElement.id === 'cnSearch', caret = focused ? document.activeElement.selectionStart : 0;
  BCacc.forEach(s => (groups[s.group] = groups[s.group] || []).push(s)); const okN = BCacc.filter(s => s.ok).length;
  box.innerHTML = `<div class="cnwrap"><div class="cnhead"><div><h2>${tr('Połączenia')}<small>${esc((agentOf(BCag) || {}).name || '')}</small></h2><p>${tr('Konta, z których agent korzysta w swojej przeglądarce. Logujesz się sam, w osobnym oknie. LumoBot nie zna twoich haseł.')}</p></div><div class="cnsum"><b data-keep>${okN}<i>/${BCacc.length}</i></b><span>${tr('połączonych')}</span></div></div>`
    + `<div class="cnsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input id="cnSearch" type="text" role="searchbox" inputmode="search" autocomplete="off" spellcheck="false" placeholder="${tr('Szukaj połączenia')}" aria-label="${tr('Szukaj połączenia')}" value="${esc(BCquery)}"><button id="cnClear" type="button" aria-label="${tr('Wyczyść wyszukiwanie')}" ${BCquery ? '' : 'hidden'}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg></button></div>`
    + Object.entries(groups).map(([g, list]) => `<div class="cngroup">${tr(g)}</div><div class="cngrid">${list.map(s => { const desc = CNDESC[s.id] ? tr(CNDESC[s.id]) : ''; return `<div class="cncard${s.ok ? ' ok' : ''}" data-search="${esc([s.name, tr(s.name), s.group, tr(s.group), desc, CNDESC[s.id] || ''].join(' '))}"><span class="cnico">${bMark(s.id, 24)}</span><div class="cnmain"><b><span>${esc(tr(s.name))}</span>${s.ok ? `<i class="cnok" title="${tr('połączone')}"></i>` : ''}</b><em>${s.open ? tr('zaloguj się w oknie i zamknij je') : esc(desc || tr(s.ok ? 'połączone' : 'niepołączone'))}</em></div>`
      + (s.open ? '' : s.ok ? `<button type="button" class="cnoff" data-cn="${s.id}" data-op="forget">${tr('Odłącz')}</button>` : `<button type="button" class="cnon" data-cn="${s.id}" data-op="login"><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round"/></svg>${tr('Połącz')}</button>`) + '</div>'; }).join('')}</div>`).join('') + `<div class="cnempty" id="cnEmpty" hidden>${tr('Brak pasujących połączeń')}</div></div>`;
  box.scrollTop = keep; if(!$('tab-ustawienia').hidden) setDraw(); filterConnections();
  if(focused){ $('cnSearch').focus(); $('cnSearch').setSelectionRange && $('cnSearch').type !== 'search' && $('cnSearch').setSelectionRange(caret, caret); } }
$('boardConn').addEventListener('input', e => { if(e.target.id !== 'cnSearch') return; BCquery = e.target.value; filterConnections(true); });
$('boardConn').addEventListener('click', e => { if(!e.target.closest('#cnClear')) return; BCquery = ''; $('cnSearch').value = ''; filterConnections(true); $('cnSearch').focus(); });
$('boardConn').addEventListener('click', async e => { const b = e.target.closest('[data-cn]'); if(!b) return;
  if(b.dataset.op === 'login'){ await bAccConnect(BCag, b.dataset.cn); loadConn(); } else { try{ await api('/api/accounts', {agent:BCag, service:b.dataset.cn, op:'forget'}); }catch(err){ toast(err.message, true); } loadConn(); } });
setInterval(() => { if(!$('tab-ustawienia').hidden && !document.hidden) loadConn(); }, 4000);
/* Okno w tle nie rysuje animacji: buźki i kropki stają, gdy LumoBot nie jest aktywnym oknem, i ruszają po powrocie */
const awaySync = () => document.documentElement.classList.toggle('away', document.hidden);      // animacje stają tylko przy schowanym (zminimalizowanym) oknie; okno bez fokusu, np. na drugim monitorze, dalej żyje
addEventListener('blur', awaySync); addEventListener('focus', awaySync); document.addEventListener('visibilitychange', awaySync); setTimeout(awaySync, 3000);

/* ---------- zakładki: plusik, przypinanie i wyłączanie ---------- */
let TABS = {hide:['kolejka'], icons:false}; try{ TABS = Object.assign(TABS, JSON.parse(localStorage.getItem('lumobot-tabs') || '{}')); }catch(e){}
if(!Array.isArray(TABS.hide)) TABS.hide = ['kolejka'];
function tabsApply(){ const nav = $('nav'); nav.querySelectorAll('a[data-tab]').forEach(a => { if(a.dataset.tab !== 'ustawienia') a.hidden = TABS.hide.includes(a.dataset.tab); }); nav.classList.toggle('icons', !!TABS.icons); }
function tabsSave(){ try{ localStorage.setItem('lumobot-tabs', JSON.stringify(TABS)); }catch(e){} tabsApply(); if(TABS.hide.includes(tab)) show('agent'); }
function tabsMenu(){ let m = $('tabMenu'); if(m){ m.remove(); return; } m = document.createElement('div'); m.id = 'tabMenu'; m.className = 'ctx tabmenu';
  m.innerHTML = [...document.querySelectorAll('#nav a[data-tab]')].filter(a => a.dataset.tab !== 'ustawienia').map(a => `<button type="button" class="tmitem${TABS.hide.includes(a.dataset.tab) ? '' : ' on'}" data-tm="${a.dataset.tab}">${a.querySelector('svg').outerHTML}<span>${esc((a.querySelector('span') || a).textContent.trim() || a.title)}</span><small><svg viewBox="0 0 16 16"><path d="M3.500 8.400l3 3 6-6.600"/></svg></small></button>`).join('');
  document.body.appendChild(m); const r = $('tabsBtn').getBoundingClientRect(); m.style.left = Math.max(8, Math.min(innerWidth - m.offsetWidth - 8, Math.round(r.left + r.width / 2 - m.offsetWidth / 2))) + 'px'; m.style.top = (r.bottom + 8) + 'px'; requestAnimationFrame(() => m.classList.add('open')); }
$('tabsBtn').addEventListener('click', e => { e.stopPropagation(); tabsMenu(); });
document.addEventListener('mousedown', e => { const m = $('tabMenu'); if(m && !e.target.closest('#tabMenu,#tabsBtn')) m.remove(); });
document.addEventListener('keydown', e => { const m = $('tabMenu'); if(m && e.key === 'Escape') m.remove(); });
document.addEventListener('click', e => { const t = e.target.closest('#tabMenu [data-tm]'); if(!t) return; const off = !t.classList.toggle('on'); TABS.hide = TABS.hide.filter(x => x !== t.dataset.tm); if(off) TABS.hide.push(t.dataset.tm); tabsSave(); });
TABS.icons = false;
tabsApply();
/* ---------- Logowania: agent loguje się sam, ale tylko za zgodą użytkownika ---------- */
let LG = null, LGedit = '', LGask = false;
const LGSHIELD = '<svg viewBox="0 0 24 24"><path d="M12 3.200 5 5.800v5.400c0 4.300 2.900 7.700 7 9.600 4.100-1.900 7-5.300 7-9.600V5.800z"/><path d="m9 12 2.200 2.200L15.200 10"/></svg>', LGTICK = '<svg viewBox="0 0 12 12"><path d="m2.800 6.300 2.200 2.200 4.200-4.700"/></svg>';
const LGPEN = '<svg viewBox="0 0 16 16"><path d="M3 13l.600-2.800L10.800 3a1.300 1.300 0 0 1 1.900 0l.300.300a1.300 1.300 0 0 1 0 1.900L5.800 12.400z"/></svg>', LGX = '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
const LGFACT = [['<svg viewBox="0 0 16 16"><rect x="3.500" y="7.500" width="9" height="6" rx="1.500"/><path d="M5.500 7.500V5.500a2.500 2.500 0 0 1 5 0v2"/></svg>', 'Hasło zaszyfrowane na tym komputerze'], ['<svg viewBox="0 0 16 16"><rect x="4.500" y="2" width="7" height="12" rx="1.600"/><path d="M7 11.700h2"/></svg>', 'Kod jednorazowy podajesz ty'], ['<svg viewBox="0 0 16 16"><circle cx="8" cy="5.600" r="2.400"/><path d="M3.400 13.500c.500-2.300 2.300-3.500 4.600-3.500s4.100 1.200 4.600 3.500"/></svg>', 'Captchy agent nie omija']];
const LGASK = ['Pozwalam, żeby LumoBot wpisywał moje zapisane dane na stronach logowania usług, które sam tu dodam.', 'Pozwalam, żeby LumoBot sam wpisywał kody 2FA wyliczane z klucza, który tu zapiszę.', 'Wiem, że gdy strona sprawdza, czy to człowiek, agent tego nie omija i oddaje okno mnie.'];
async function loadLogins(){ try{ LG = await api('/api/logins'); }catch(e){ return; } drawLogins(); }
async function lgDo(body){ try{ LG = await api('/api/logins', body); drawLogins(); return true; }catch(e){ toast(e.message, true); return false; } }
function lgDate(t){ const d = new Date(t), p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear(); }
function drawLogins(){ if(!LG) return; const on = LG.consent, hero = $('lgHero'); hero.className = 'lghero ' + (on ? 'on' : 'off');
  hero.innerHTML = on ? `<div><h1>${tr('Logowania')}</h1><p class="lgsub"><i></i><span>${tr('Włączone od')} ${lgDate(LG.since)}</span></p></div><button type="button" class="lgquiet" data-lgoff>${tr('Wyłącz')}</button>`
    : `<h1>${tr('Logowania')}</h1><p class="lgsub"><span>${tr('Agent sam zaloguje się na konto, które się wylogowało. Tylko za twoją zgodą.')}</span></p><button type="button" class="lggo" data-lgon>${tr('Włącz logowanie')}</button>`;
  let sh = $('lgSheet'); if(sh) sh.remove();
  if(LGask){ sh = document.createElement('div'); sh.id = 'lgSheet'; sh.className = 'lgsheetbg';
    sh.innerHTML = `<div class="lgsheet"><h2>${tr('Zgoda na logowanie')}</h2><p>${tr('Zaznacz wszystkie trzy, żeby włączyć.')}</p>${LGASK.map(x => `<button type="button" class="lgopt" data-lgc><i>${LGTICK}</i><span>${tr(x)}</span></button>`).join('')}<button type="button" class="lggo" data-lgyes disabled>${tr('Zgadzam się')}</button><button type="button" class="lgquiet" data-lgno>${tr('Anuluj')}</button></div>`;
    document.body.appendChild(sh); }
  $('lgBody').hidden = !on; $('lgClear').hidden = !LG.services.some(s => s.has);
  drawLoginList(); }
function drawLoginList(){ if(!LG) return; const q = ($('lgSearch').value || '').trim().toLowerCase(), list = LG.services.filter(s => !q || s.name.toLowerCase().includes(q)), box = $('lgList');
  const row = s => s.id === LGedit ? `<form class="lgrow lgform" data-lgform="${s.id}"><span class="lgico">${bMark(s.id, 22)}</span><div class="lgfields"><input name="user" placeholder="${tr('Login albo e-mail')}" autocomplete="off" spellcheck="false"><input name="password" type="password" placeholder="${tr('Hasło')}" autocomplete="new-password"><input name="otp" type="password" placeholder="${tr('Klucz 2FA, jeśli jest')}" autocomplete="off" spellcheck="false" title="${tr('Klucz z konfiguracji aplikacji uwierzytelniającej. Z niego LumoBot sam wylicza kody.')}"></div><button type="button" class="lgquiet" data-lgcancel>${tr('Anuluj')}</button><button type="submit" class="lgsave">${tr('Zapisz')}</button></form>`
    : `<div class="lgrow${s.has ? ' has' : ''}"><span class="lgico">${bMark(s.id, 22)}</span><div class="lgname"><b>${esc(tr(s.name))}</b>${s.has ? `<em data-keep>${esc(s.user)}${s.otp ? ' · 2FA' : ''}</em>` : ''}</div>`
      + (s.has ? `<button type="button" class="ic" data-lgedit="${s.id}" title="${tr('Zmień dane')}">${LGPEN}</button><button type="button" class="ic" data-lgdel="${s.id}" title="${tr('Usuń dane')}">${LGX}</button>` : `<button type="button" class="lgadd" data-lgedit="${s.id}">${tr('Dodaj')}</button>`) + `</div>`;
  const saved = list.filter(s => s.has), rest = list.filter(s => !s.has);
  box.className = LG.consent ? '' : 'locked';
  box.innerHTML = (saved.length ? `<div class="lglist">${saved.map(row).join('')}</div>` : '') + (rest.length ? `<div class="lglist">${rest.map(row).join('')}</div>` : '') + (list.length ? '' : `<div class="lgnone">${tr('Nie ma takiej usługi.')}</div>`);
  const f = box.querySelector('.lgform input'); if(f) f.focus({preventScroll:true}); }
document.addEventListener('click', e => { if(!e.target.closest || !e.target.closest('#tab-logowania,#lgSheet')) return; const ed = e.target.closest('[data-lgedit]'), del = e.target.closest('[data-lgdel]'), opt = e.target.closest('[data-lgc]');
  if(e.target.closest('[data-lgon]')){ LGask = true; drawLogins(); }
  else if(e.target.closest('[data-lgoff]')){ LGedit = ''; lgDo({consent:false}); }
  else if(opt){ opt.classList.toggle('on'); document.querySelector('#lgSheet [data-lgyes]').disabled = !![...document.querySelectorAll('#lgSheet [data-lgc]')].some(x => !x.classList.contains('on')); }
  else if(e.target.closest('[data-lgno]') || e.target.id === 'lgSheet'){ LGask = false; drawLogins(); }
  else if(e.target.closest('[data-lgyes]')){ LGask = false; lgDo({consent:true}); }
  else if(e.target.closest('#lgClear')){ LGedit = ''; lgDo({clear:true}).then(ok => ok && toast('Usunięto zapisane dane logowania')); }
  else if(e.target.closest('[data-lgcancel]')){ LGedit = ''; drawLoginList(); }
  else if(ed){ LGedit = ed.dataset.lgedit; drawLoginList(); }
  else if(del){ lgDo({remove:del.dataset.lgdel}); } });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && LGask){ LGask = false; drawLogins(); } });
$('tab-logowania').addEventListener('submit', async e => { const f = e.target.closest('[data-lgform]'); if(!f) return; e.preventDefault();
  const body = {save:{service:f.dataset.lgform, user:f.elements.user.value, password:f.elements.password.value, otp:f.elements.otp.value}}; f.elements.password.value = ''; f.elements.otp.value = ''; LGedit = ''; if(!(await lgDo(body))){ LGedit = body.save.service; drawLoginList(); } else toast('Zapisano. Hasło jest zaszyfrowane na tym komputerze.'); });
$('lgSearch').addEventListener('input', drawLoginList);
