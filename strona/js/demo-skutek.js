(function(){
  const roots = document.querySelectorAll('.dm-skutek');
  if(!roots.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = document.documentElement.classList.contains('static') || reduced;

  roots.forEach(root => {
    const steps = Array.from(root.querySelectorAll('[data-sk-step]'));
    const roundEl = root.querySelector('[data-sk-round]');
    const badgeEl = root.querySelector('[data-sk-badge]');
    const badgeTxt = root.querySelector('[data-sk-badge-txt]');

    function showFinal(){
      steps.forEach((el, idx) => {
        el.classList.remove('is-on', 'is-dim');
        if(idx < 4) el.classList.add('is-dim');
        else el.classList.add('is-on');
      });
      if(roundEl) roundEl.textContent = 'Runda 2';
      if(badgeEl){
        badgeEl.classList.remove('is-bad');
        badgeEl.classList.add('is-ok');
      }
      if(badgeTxt) badgeTxt.textContent = 'Cel osiągnięty · 2 rundy';
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

    function reset(){
      steps.forEach(el => el.classList.remove('is-on', 'is-dim'));
      if(roundEl) roundEl.textContent = 'Runda 1';
      if(badgeEl) badgeEl.classList.remove('is-bad', 'is-ok');
      if(badgeTxt) badgeTxt.textContent = 'Sprawdzam...';
    }

    function at(ms, fn){
      timers.push(setTimeout(() => { if(active) fn(); }, ms));
    }

    function runCycle(){
      clearTimers();
      reset();

      at(350,  () => steps[0] && steps[0].classList.add('is-on'));
      at(950,  () => steps[1] && steps[1].classList.add('is-on'));
      at(1550, () => steps[2] && steps[2].classList.add('is-on'));
      at(2350, () => {
        if(steps[3]) steps[3].classList.add('is-on');
        if(badgeEl) badgeEl.classList.add('is-bad');
        if(badgeTxt) badgeTxt.textContent = 'Wymaga poprawki';
      });

      at(3700, () => {
        for(let i = 0; i < 4; i++){
          if(steps[i]){
            steps[i].classList.remove('is-on');
            steps[i].classList.add('is-dim');
          }
        }
        if(roundEl) roundEl.textContent = 'Runda 2';
        if(badgeEl) badgeEl.classList.remove('is-bad');
        if(badgeTxt) badgeTxt.textContent = 'Poprawiam...';
        if(steps[4]) steps[4].classList.add('is-on');
      });

      at(4650, () => {
        if(steps[5]) steps[5].classList.add('is-on');
        if(badgeEl) badgeEl.classList.add('is-ok');
        if(badgeTxt) badgeTxt.textContent = 'Cel osiągnięty · 2 rundy';
      });

      at(9000, () => {
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
