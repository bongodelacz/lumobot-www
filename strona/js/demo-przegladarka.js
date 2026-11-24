/* Scenka: przegladarka (Zwiad). Pętla 8 s z IntersectionObserver. */
(function () {
  var ALL = ['is-step-1', 'is-step-2', 'is-step-3', 'is-step-4'];

  function isStatic() {
    if (document.documentElement.classList.contains('static')) return true;
    if (location.search.indexOf('statycznie') !== -1) return true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    return false;
  }

  function initOne(el) {
    if (el.dataset.dmReady === '1') return;
    el.dataset.dmReady = '1';
    if (window.lumoFaces) window.lumoFaces(el);

    var adres = el.querySelector('[data-adres]');
    var timers = [];
    var running = false;

    function clearTimers() {
      while (timers.length) clearTimeout(timers.pop());
    }

    function setFinal() {
      clearTimers();
      ALL.forEach(function (c) { el.classList.add(c); });
      if (adres) adres.textContent = 'sklep.pl';
    }

    if (isStatic()) {
      setFinal();
      return;
    }

    function cycle() {
      if (!running) return;
      clearTimers();
      ALL.forEach(function (c) { el.classList.remove(c); });
      if (adres) adres.textContent = 'szukaj: cennik';

      timers.push(setTimeout(function () {
        el.classList.add('is-step-1');
      }, 150));

      timers.push(setTimeout(function () {
        if (adres) adres.textContent = 'sklep.pl';
        el.classList.add('is-step-2');
      }, 1200));

      timers.push(setTimeout(function () {
        el.classList.add('is-step-3');
      }, 2200));

      timers.push(setTimeout(function () {
        el.classList.add('is-step-4');
      }, 4200));

      timers.push(setTimeout(cycle, 8000));
    }

    function start() {
      if (running) return;
      running = true;
      cycle();
    }

    function stop() {
      running = false;
      clearTimers();
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.15 });
      io.observe(el);
    } else {
      start();
    }
  }

  function boot() {
    document.querySelectorAll('.dm-przegladarka').forEach(initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.initDemoPrzegladarka = boot;
})();
