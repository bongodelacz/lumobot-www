/* Star Border, inicjalizacja zgodna ze strukturą React Bits. */
(function(){
  'use strict';

  function addStarBorder(element){
    if(element.classList.contains('star-border-container')) return;

    var color = element.classList.contains('btn-primary') ? '#9db5ff' : '#ffffff';
    var speed = '6s';
    var thickness = 1;
    var bottom = document.createElement('div');
    var top = document.createElement('div');
    var content = document.createElement('div');

    element.classList.add('star-border-container');
    element.style.padding = thickness + 'px 0';

    bottom.className = 'border-gradient-bottom';
    bottom.setAttribute('aria-hidden', 'true');
    bottom.style.background = 'radial-gradient(circle, ' + color + ', transparent 10%)';
    bottom.style.animationDuration = speed;

    top.className = 'border-gradient-top';
    top.setAttribute('aria-hidden', 'true');
    top.style.background = 'radial-gradient(circle, ' + color + ', transparent 10%)';
    top.style.animationDuration = speed;

    content.className = 'inner-content';
    while(element.firstChild) content.appendChild(element.firstChild);

    element.appendChild(bottom);
    element.appendChild(top);
    element.appendChild(content);
  }

  function init(){
    document.querySelectorAll('.btn-primary, .btn-ghost, .wy-get').forEach(addStarBorder);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
