(function(){
  const roots = document.querySelectorAll('.dm-zespol');
  if(!roots.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = document.documentElement.classList.contains('static') || reduced;

  roots.forEach(root => {
    const rows = {};
    root.querySelectorAll('[data-zs-row]').forEach(row => { rows[row.dataset.zsRow] = row; });
    const count = root.querySelector('[data-zs-count]');
    const progress = root.querySelector('.dm-zespol-progress');
    let timers = [];
    let active = false;

    function clearTimers(){
      timers.forEach(id => clearTimeout(id));
      timers = [];
    }

    function setState(name, state, label){
      const row = rows[name];
      if(!row) return;
      row.classList.remove('is-waiting','is-busy','is-done');
      row.classList.add(`is-${state}`);
      const status = row.querySelector('[data-zs-status]');
      if(status) status.textContent = label;
      const face = row.querySelector('.face');
      if(face) face.classList.toggle('busy', state === 'busy');
    }

    function setReady(value){
      if(count) count.textContent = `gotowe: ${value} / 3`;
      if(count) count.classList.toggle('is-done', value > 0);
      if(progress){
        progress.classList.remove('is-one','is-two','is-three');
        if(value === 1) progress.classList.add('is-one');
        if(value === 2) progress.classList.add('is-two');
        if(value === 3) progress.classList.add('is-three');
      }
    }

    function showFinal(){
      setState('pioro','done','gotowe · 48 s');
      setState('paleta','done','gotowe · 48 s');
      setState('lupa','busy','pracuje · 12 s');
      setReady(2);
    }

    function reset(){
      setState('pioro','waiting','czeka');
      setState('paleta','waiting','czeka');
      setState('lupa','waiting','czeka');
      setReady(0);
    }

    function at(ms, fn){
      timers.push(setTimeout(() => { if(active) fn(); }, ms));
    }

    function runCycle(){
      clearTimers();
      reset();
      at(420, () => setState('pioro','busy','pracuje · 12 s'));
      at(1680, () => { setState('pioro','done','gotowe · 48 s'); setReady(1); });
      at(2460, () => setState('paleta','busy','pracuje · 12 s'));
      at(3720, () => { setState('paleta','done','gotowe · 48 s'); setReady(2); });
      at(4560, () => setState('lupa','busy','pracuje · 12 s'));
      at(8000, () => { if(active) runCycle(); });
    }

    if(isStatic){
      showFinal();
      return;
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
      }, {threshold:.2});
      io.observe(root);
    } else {
      active = true;
      runCycle();
    }
  });
})();
