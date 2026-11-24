(function(){
  const roots = document.querySelectorAll('.dm-komputer');
  if(!roots.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = document.documentElement.classList.contains('static') || reduced;

  roots.forEach(root => {
    const stage = root.querySelector('[data-km-stage]');
    const win = root.querySelector('[data-km-win]');
    const input = root.querySelector('[data-km-input]');
    const typed = root.querySelector('[data-km-typed]');
    const caret = root.querySelector('[data-km-caret]');
    const corner = root.querySelector('[data-km-corner]');
    const guard = root.querySelector('[data-km-guard]');
    const ripple = root.querySelector('[data-km-ripple]');
    const cursor = root.querySelector('[data-km-cursor]');

    function getInputTarget(){
      if(!stage || !input) return { x: 140, y: 120 };
      const sr = stage.getBoundingClientRect();
      const ir = input.getBoundingClientRect();
      if(!sr.width || !ir.width) return { x: 140, y: 120 };
      return {
        x: Math.round(ir.left - sr.left + Math.min(84, ir.width * 0.4)),
        y: Math.round(ir.top - sr.top + ir.height * 0.5)
      };
    }

    function moveCursor(x, y, click){
      if(!cursor) return;
      cursor.classList.toggle('is-click', !!click);
      cursor.style.transform = `translate3d(${x}px,${y}px,0) scale(${click ? 0.86 : 1})`;
    }

    function showFinal(){
      if(typed) typed.textContent = 'Gotowe';
      if(input) input.classList.add('is-focus');
      if(caret) caret.classList.remove('is-on');
      if(win) win.classList.add('is-dim');
      if(corner) corner.classList.add('is-hot');
      if(guard) guard.classList.add('is-on');
      moveCursor(8, 8, false);
    }

    if(isStatic){
      showFinal();
      return;
    }

    let timers = [];
    let active = false;
    const word = 'Gotowe';

    function clearTimers(){
      timers.forEach(id => clearTimeout(id));
      timers = [];
    }

    function at(ms, fn){
      timers.push(setTimeout(() => { if(active) fn(); }, ms));
    }

    function reset(){
      if(typed) typed.textContent = '';
      if(input) input.classList.remove('is-focus');
      if(caret) caret.classList.remove('is-on');
      if(win) win.classList.remove('is-dim');
      if(corner) corner.classList.remove('is-hot');
      if(guard) guard.classList.remove('is-on');
      if(ripple){
        ripple.classList.remove('is-pop');
        ripple.style.opacity = '0';
      }
      const sr = stage ? stage.getBoundingClientRect() : { width: 320, height: 240 };
      moveCursor(Math.round((sr.width || 320) * 0.72), Math.round((sr.height || 240) * 0.74), false);
    }

    function runCycle(){
      clearTimers();
      reset();

      const target = getInputTarget();

      at(450, () => {
        moveCursor(target.x, target.y, false);
      });

      at(1150, () => {
        moveCursor(target.x, target.y, true);
        if(input) input.classList.add('is-focus');
        if(caret) caret.classList.add('is-on');
        if(ripple){
          ripple.style.transform = `translate3d(${target.x - 10}px,${target.y - 10}px,0) scale(.4)`;
          ripple.style.opacity = '0.8';
          requestAnimationFrame(() => {
            ripple.style.transform = `translate3d(${target.x - 10}px,${target.y - 10}px,0) scale(1.4)`;
            ripple.style.opacity = '0';
          });
        }
      });

      at(1300, () => {
        moveCursor(target.x, target.y, false);
      });

      for(let i = 0; i < word.length; i++){
        at(1550 + i * 110, () => {
          if(typed) typed.textContent = word.slice(0, i + 1);
        });
      }

      at(2850, () => {
        if(caret) caret.classList.remove('is-on');
        moveCursor(8, 8, false);
      });

      at(3550, () => {
        if(corner) corner.classList.add('is-hot');
        if(win) win.classList.add('is-dim');
        if(guard) guard.classList.add('is-on');
      });

      at(7200, () => {
        if(active) runCycle();
      });
    }

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting && !active){
            active = true;
            runCycle();
          } else if(!entry.isIntersecting && active){
            active = false;
            clearTimers();
          }
        });
      }, { threshold: 0.2 });
      io.observe(root);
    } else {
      active = true;
      runCycle();
    }
  });
})();
