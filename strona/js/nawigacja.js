(function(){
  'use strict';

  var header = document.querySelector('.nv-header');
  if (!header) return;

  var shell = header.querySelector('.nv-panel-shell');
  var scrim = header.querySelector('.nv-scrim');
  var tabs = Array.prototype.slice.call(header.querySelectorAll('.nv-tab'));
  var panels = Array.prototype.slice.call(header.querySelectorAll('.nv-panel'));
  var menuButton = header.querySelector('.nv-menu-toggle');
  var mobileMenu = header.querySelector('.nv-mobile');
  var activeId = '';
  var closeTimer = 0;
  var mobileQuery = window.matchMedia('(max-width: 860px)');

  function findPanel(id){
    return panels.find(function(panel){ return panel.dataset.panelContent === id; });
  }

  function setTabState(id){
    tabs.forEach(function(tab){
      var selected = tab.dataset.panel === id;
      tab.setAttribute('aria-expanded', selected ? 'true' : 'false');
    });
  }

  function activatePanel(id){
    panels.forEach(function(panel){
      panel.classList.toggle('is-active', panel.dataset.panelContent === id);
    });
    activeId = id;
    setTabState(id);
  }

  function openPanel(id){
    if (mobileQuery.matches) return;
    window.clearTimeout(closeTimer);
    var next = findPanel(id);
    if (!next) return;

    if (!shell.classList.contains('is-open')){
      activatePanel(id);
      shell.setAttribute('aria-hidden', 'false');
      shell.classList.add('is-open');
      scrim.classList.add('is-visible');
      shell.style.height = '0px';
      window.requestAnimationFrame(function(){
        shell.style.height = next.scrollHeight + 'px';
      });
      return;
    }

    if (activeId === id) return;
    var currentHeight = shell.getBoundingClientRect().height;
    shell.style.height = currentHeight + 'px';
    activatePanel(id);
    window.requestAnimationFrame(function(){
      shell.style.height = next.scrollHeight + 'px';
    });
  }

  function closePanel(){
    window.clearTimeout(closeTimer);
    if (!shell.classList.contains('is-open')) return;
    shell.style.height = shell.getBoundingClientRect().height + 'px';
    window.requestAnimationFrame(function(){ shell.style.height = '0px'; });
    shell.classList.remove('is-open');
    shell.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('is-visible');
    setTabState('');
    activeId = '';
  }

  function scheduleClose(){
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(closePanel, 120);
  }

  function closeMobile(){
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Otwórz menu');
    document.documentElement.classList.remove('nv-menu-visible');
  }

  function toggleMobile(){
    var isOpen = mobileMenu.classList.toggle('is-open');
    mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuButton.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
    document.documentElement.classList.toggle('nv-menu-visible', isOpen);
    if (isOpen) closePanel();
  }

  tabs.forEach(function(tab){
    tab.addEventListener('pointerenter', function(){ openPanel(tab.dataset.panel); });
    tab.addEventListener('focus', function(){ openPanel(tab.dataset.panel); });
    tab.addEventListener('click', function(event){
      event.preventDefault();
      if (activeId === tab.dataset.panel && shell.classList.contains('is-open')) closePanel();
      else openPanel(tab.dataset.panel);
    });
  });

  header.addEventListener('pointerenter', function(){ window.clearTimeout(closeTimer); });
  header.addEventListener('pointerleave', scheduleClose);
  header.addEventListener('focusin', function(){ window.clearTimeout(closeTimer); });
  header.addEventListener('focusout', function(event){
    if (!header.contains(event.relatedTarget)) scheduleClose();
  });

  scrim.addEventListener('pointerenter', scheduleClose);
  scrim.addEventListener('pointerleave', function(){ window.clearTimeout(closeTimer); });
  scrim.addEventListener('click', closePanel);

  header.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      closePanel();
      closeMobile();
    });
  });

  document.addEventListener('pointerdown', function(event){
    if (!header.contains(event.target)) closePanel();
  });

  document.addEventListener('keydown', function(event){
    if (event.key !== 'Escape') return;
    closePanel();
    closeMobile();
  });

  if (menuButton){ menuButton.addEventListener('click', toggleMobile); }

  mobileQuery.addEventListener('change', function(event){
    if (!event.matches){ closeMobile(); }
    closePanel();
  });
})();
