// Sekcja 7: Twój zespół już czeka (tłum buziek).
(function(){
  'use strict';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('static');
  /* ---------- "Twój zespół już czeka": tłum buziek LumoBota wokół hasła ----------
     Różne kształty i oczy z aplikacji, ułożone ramą wokół tekstu (środek wolny, bez rozmycia).
     Większe buźki są bliżej (paralaksa), oczy patrzą za kursorem, kliknięcie daje dymek. */
  const tcCrowd = document.getElementById('tcCrowd');
  if(tcCrowd && window.lumoFace){
    const box = tcCrowd.closest('.tc-box'), copy = box.querySelector('.tc-copy');
    const SH = ['squircle','kolo','kwadrat','szesciokat','duch','kot','mis','chmura','kwiat','pigula','trojkat','romb','osmiornica'];
    const EY = window.LUMO_EYES || ['kropki','duze','kreski','usmiech'];
    const COL = ['#6d4fe0','#4f6bed','#3b82f6','#0ea5c6','#14a38b','#22a559','#d4a514','#e5782a','#e0473f','#cf3f8f','#7c3aed','#5b5fc7','#64748b','#2e3fb0'];
    const rnd = s => () => (s = Math.imul(s ^ s >>> 15, 1 | s) + 0x6D2B79F5 | 0, ((s ^ s >>> 14) >>> 0) / 4294967296);
    let items = [];
    const build = () => {
      const W = box.clientWidth, H = box.clientHeight, R = rnd(20261116);
      const k = Math.max(.6, Math.min(1.1, W / 1320)), c = 112 * k;
      const br = box.getBoundingClientRect(), cr = copy.getBoundingClientRect();
      const cx = cr.left - br.left + cr.width / 2, cy = cr.top - br.top + cr.height / 2;
      const rx = Math.min(W * .47, cr.width / 2 + 56 * k), ry = cr.height / 2 + 56 * k;
      const html = [], meta = [];
      for(let row = -0.25, ri = 0; row * c < H + c * .3; row += .88, ri++){
        for(let col = (ri % 2 ? -.5 : -.05); col * c < W + c * .3; col++){
          const x = col * c + (R() - .5) * c * .4, y = row * c + (R() - .5) * c * .32;
          const u = R(), sh = SH[Math.floor(R() * SH.length)], ey = EY[Math.floor(R() * EY.length)], co = COL[Math.floor(R() * COL.length)];
          const d = Math.pow(Math.pow(Math.abs(x - cx) / rx, 3) + Math.pow(Math.abs(y - cy) / ry, 3), 1 / 3);
          if(d < 1.05 || (W < 760 && Math.abs(y - cy) < ry + c * .15)) continue;
          const near = Math.min(1, (d - 1.05) / .7), s = Math.round(c * (.58 + near * .3 + u * .2)), n = meta.length;
          html.push(`<span class="tc-f" style="left:${(x - s / 2).toFixed(0)}px;top:${(y - s / 2).toFixed(0)}px;--i:${n};--o:${(.55 + near * .45).toFixed(2)};--z:${(s / c).toFixed(2)};--fd:${(4.5 + u * 3).toFixed(1)}s"><span class="tc-b" data-face="tlum">${lumoFace({ id: 'c' + n, shape: sh, face: ey, color: co }, s)}</span></span>`);
          meta.push([x, y]);
        }
      }
      tcCrowd.innerHTML = html.join('');
      items = [...tcCrowd.children].map((el, i) => ({ eyes: el.querySelector('.eyes'), x: meta[i][0], y: meta[i][1] }));
    };
    const ready = () => build();
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else ready();
    let rw = innerWidth, rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if(Math.abs(innerWidth - rw) > 30){ rw = innerWidth; build(); } }, 180); });
    new IntersectionObserver(es => { const v = es[0].isIntersecting; box.classList.toggle('paused', !v); if(v) box.classList.add('seen'); }, { threshold: .2 }).observe(box);
    if(!calm){
      let px = -1, py = 0, raf = 0, tx = 0, ty = 0, mx = 0, my = 0;
      const look = () => {
        raf = 0; const br = box.getBoundingClientRect(), lx = px - br.left, ly = py - br.top;
        tx += (mx - tx) * .1; ty += (my - ty) * .1;
        tcCrowd.style.setProperty('--mx', tx.toFixed(3)); tcCrowd.style.setProperty('--my', ty.toFixed(3));
        for(const it of items){
          if(!it.eyes) continue;
          if(px < 0){ it.eyes.style.transform = ''; continue; }
          const dx = lx - it.x, dy = ly - it.y, dist = Math.hypot(dx, dy) || 1, m = Math.min(7, dist / 60);
          it.eyes.style.transform = `translate(${(dx / dist * m).toFixed(1)}%,${(dy / dist * m).toFixed(1)}%)`;
        }
        if(Math.abs(mx - tx) + Math.abs(my - ty) > .002) raf = requestAnimationFrame(look);
      };
      /* bez kursora buźki same się rozglądają; co kilka sekund wszystkie patrzą na przycisk Pobierz */
      let tick = 0;
      const lookAt = (it, x, y, m) => { const dx = x - it.x, dy = y - it.y, d = Math.hypot(dx, dy) || 1; it.eyes.style.transform = `translate(${(dx / d * m).toFixed(1)}%,${(dy / d * m).toFixed(1)}%)`; };
      const idle = () => {
        if(px >= 0 || box.classList.contains('paused') || !items.length || document.hidden) return;
        tick++;
        if(tick % 10 === 0){
          const b = box.querySelector('.tc-ctas .btn').getBoundingClientRect(), br = box.getBoundingClientRect();
          items.forEach(it => it.eyes && lookAt(it, b.left - br.left + b.width / 2, b.top - br.top + b.height / 2, 7));
          return;
        }
        if(tick % 10 < 3) return;                      // chwilę patrzą razem na przycisk
        for(let j = 0; j < Math.max(5, items.length / 7); j++){
          const it = items[Math.floor(Math.random() * items.length)]; if(!it.eyes) continue;
          const a = Math.random() * Math.PI * 2, m = Math.random() < .2 ? 0 : 3 + Math.random() * 5;
          it.eyes.style.transform = m ? `translate(${(Math.cos(a) * m).toFixed(1)}%,${(Math.sin(a) * m * .75).toFixed(1)}%)` : '';
        }
      };
      setInterval(idle, 600);
    }
  }
})();
