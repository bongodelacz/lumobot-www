/* Wygenerowane przez narzedzia/zbuduj_app.py z app.js LumoBota. Nie edytuj ręcznie. */
(function(){
const FACEDIR = 'app/faces/';
const SHAPES = ['squircle','kolo','kwadrat','szesciokat','duch','kot','mis','chmura','kwiat','wybuch','osmiornica','odlamek','pigula','trojkat','romb'], MAKERSHAPES = ['squircle','kolo','kwadrat','szesciokat','duch','kot','mis','chmura','kwiat','pigula','trojkat','romb'], LOWEYES = ['kot','mis','chmura','trojkat'], HIGHEYES = ['osmiornica'];
const FACES = ['gwiazdki','kropki','kreski','usmiech','mrugniecie','duze','spiace','kwadraty','plusy','serca'];
function face(a, size, cls){ if(a.photo) return `<span class="face photo${cls ? ' ' + cls : ''}" style="width:${size}px;height:${size}px;background-image:url(/api/avatar/${a.photo})" aria-hidden="true"></span>`;
  const sh = SHAPES.includes(a.shape) ? a.shape : 'squircle', ek = FACES.includes(a.face) ? a.face : 'gwiazdki';
  const seed = [...String(a.id || a.name || a.color)].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 997, 7);      // każda buzia mruga w innym rytmie
  const hv = n => (Math.imul(seed * 31 + n * 7919, 2654435761) >>> 0) >>> 8;      // niezależne losowania na gest, najechanie i pracę
  return `<span class="face g${hv(1) % 6} v${hv(2) % 5} w${hv(3) % 3}${cls ? ' ' + cls : ''}" style="width:${size}px;height:${size}px;--c:${a.color};--m:url(${(window.LUMO_MASKS && LUMO_MASKS[sh]) || FACEDIR + sh + '-mul.png'});--d:-${((seed % 60) / 10).toFixed(1)}s;--bd:${(5.2 + (seed % 17) / 10).toFixed(1)}s;--gp:${8 + seed % 7}s" aria-hidden="true">`
    + `<i class="fsh" style="background-image:url(${FACEDIR}${sh}-shadow.png)"></i><i class="fup"><i class="fbody"><i class="fcol"></i><i class="fmul"></i><i class="fadd" style="background-image:url(${FACEDIR}${sh}-add.png)"></i></i>`
    + `<i class="eyes e-${ek}${LOWEYES.includes(sh) ? ' low' : HIGHEYES.includes(sh) ? ' high' : ''}" style="background-image:url(${FACEDIR}eyes-${ek}.png)"></i></i></span>`; }
window.LUMO_AGENCI = [{"id": "a1794854587064", "name": "Lider", "color": "#493093", "face": "duze", "shape": "chmura", "model": "gpt-5.6-luna", "kind": ""}, {"id": "a1794854846746", "name": "Pióro", "color": "#d6409f", "face": "mrugniecie", "shape": "szesciokat", "model": "gpt-5.6-luna", "kind": ""}, {"id": "a1794854850191", "name": "Kreska", "color": "#64748b", "face": "kreski", "shape": "pigula", "model": "gpt-5.6-luna", "kind": ""}, {"id": "a1794854853317", "name": "Lupa", "color": "#24289b", "face": "mrugniecie", "shape": "squircle", "model": "claude-haiku-5-5", "kind": ""}, {"id": "a1794854855734", "name": "Radar", "color": "#06b6d4", "face": "plusy", "shape": "kwiat", "model": "gpt-5.6-luna", "kind": ""}, {"id": "a1794854857934", "name": "Paleta", "color": "#890017", "face": "kropki", "shape": "trojkat", "model": "agy:gemini-4-argon-medium", "kind": "image"}];
window.lumoFace = face; window.LUMO_SHAPES = SHAPES; window.LUMO_EYES = FACES; window.LUMO_FACEDIR = FACEDIR;
function fill(root){ (root || document).querySelectorAll('[data-face]').forEach(el => { const a = LUMO_AGENCI.find(x => x.name === el.dataset.face); if(a && !el.firstElementChild) el.innerHTML = face(a, +(el.dataset.px || 40)); }); }
window.lumoFaces = fill; if(document.readyState !== 'loading') fill(); else document.addEventListener('DOMContentLoaded', () => fill());
})();
