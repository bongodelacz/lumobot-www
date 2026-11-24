// Osobna podstrona aplikacji: dopasowanie zoomu i przykładowe cele.
(function(){
  'use strict';
  const frame = document.getElementById('appframe');
  const iframe = document.getElementById('appiframe');
  if(!frame || !iframe) return;

  const fit = () => {
    const wrap = frame.parentElement;
    if(!wrap) return;
    const mobile = matchMedia('(max-width:700px)').matches;
    const style = getComputedStyle(wrap);
    const available = wrap.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const freeHeight = Math.max(240, innerHeight - frame.getBoundingClientRect().top - 16);
    const width = Math.min(available, mobile ? available : Math.max(320, freeHeight * 1344 / 880));
    frame.style.width = `${Math.max(280, width)}px`;
    frame.style.setProperty('--s', (frame.clientWidth / 1344).toFixed(4));
  };
  new ResizeObserver(fit).observe(frame.parentElement);
  addEventListener('resize', fit, {passive:true});
  fit();

  let pendingGoal = '';
  const writeGoal = goal => {
    pendingGoal = goal;
    let wrote = false;
    try{
      const doc = iframe.contentDocument;
      const input = doc && doc.querySelector('#composer textarea[name="goal"], #composer textarea');
      if(input){
        input.value = goal;
        input.dispatchEvent(new Event('input', {bubbles:true}));
        input.focus({preventScroll:true});
        pendingGoal = '';
        wrote = true;
      }
    }catch(e){}
    if(!wrote) try{ iframe.contentWindow.postMessage({type:'lumo-goal', goal}, location.origin); }catch(e){}
  };
  iframe.addEventListener('load', () => { if(pendingGoal) writeGoal(pendingGoal); });
  document.querySelectorAll('.ap-chip').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.ap-chip').forEach(chip => {
      const selected = chip === button;
      chip.classList.toggle('sent', selected);
      chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    writeGoal(button.dataset.goal || button.textContent.trim());
    if(frame.getBoundingClientRect().top > innerHeight * .55) frame.scrollIntoView({behavior:'smooth', block:'center'});
  }));
})();
