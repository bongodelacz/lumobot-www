(function(){
  const roots = document.querySelectorAll('.dm-obrazy');
  if(!roots.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = document.documentElement.classList.contains('static') || reduced;

  roots.forEach(root => {
    const canvas = root.querySelector('[data-ob-canvas]');
    const face = root.querySelector('[data-face]');
    const meta = root.querySelector('[data-ob-meta]');

    function showFinal(){
      if(canvas) canvas.classList.add('is-revealed');
      if(meta) meta.classList.add('is-on');
      if(face) face.classList.remove('busy');
    }

    if(isStatic){
      showFinal();
      return;
    }

    let timers = [];
    let active = false;

    function clearTimers(){
      timers.forEach(id => clearTimeout(id));
      timers = [];
    }

    function at(ms, fn){
      timers.push(setTimeout(fn, ms));
    }

    function reset(){
      if(canvas) canvas.classList.remove('is-revealed');
      if(meta) meta.classList.remove('is-on');
      if(face) face.classList.add('busy');
    }

    function runCycle(){
      clearTimers();
      reset();

      at(1400, () => {
        if(canvas) canvas.classList.add('is-revealed');
        if(face) face.classList.remove('busy');
      });

      at(2300, () => {
        if(meta) meta.classList.add('is-on');
      });

      at(6400, () => {
        reset();
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
