(function(){
  const roots = document.querySelectorAll('.dm-wyspa');
  if(!roots.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = document.documentElement.classList.contains('static') || reduced;

  roots.forEach(root => {
    const island = root.querySelector('[data-wyspa-island]');
    const views = {};
    root.querySelectorAll('[data-wyspa-view]').forEach(view => { views[view.dataset.wyspaView] = view; });
    let timers = [];
    let active = false;

    function clearTimers(){
      timers.forEach(id => clearTimeout(id));
      timers = [];
    }

    function setPhase(name){
      Object.keys(views).forEach(key => views[key].classList.toggle('is-active', key === name));
      if(island) island.classList.toggle('is-expanded', name !== 'idle');
    }

    function at(ms, fn){
      timers.push(setTimeout(() => { if(active) fn(); }, ms));
    }

    function runCycle(){
      clearTimers();
      setPhase('idle');
      at(520, () => setPhase('listening'));
      at(2500, () => setPhase('command'));
      at(4650, () => setPhase('working'));
      at(8000, () => { if(active) runCycle(); });
    }

    if(isStatic){
      setPhase('working');
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
