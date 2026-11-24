// Spis treści dokumentacji: podświetla sekcję, która jest aktualnie na ekranie.
(function () {
  var links = [].slice.call(document.querySelectorAll('.dk-link'));
  if (!links.length) return;
  // Składnia zamiast atrybutu: po złożeniu strony linki mają postać "dokumentacja/#id", a a.hash zawsze daje "#id".
  var heads = links.map(function (a) {
    return document.getElementById(a.hash.slice(1));
  });
  var side = document.querySelector('.dk-side');
  var nav = document.querySelector('.dk-nav');
  var current = -1;

  function setActive(i) {
    if (i === current) return;
    current = i;
    links.forEach(function (a, j) {
      var on = j === i;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    reveal(links[i]);
  }

  // Pokazuje aktywną pozycję w spisie: w poziomym pasku (telefon) i w przewijanym pasku bocznym.
  // Nie rusza przewijania całej strony.
  function reveal(a) {
    if (!a) return;
    var r = a.getBoundingClientRect();
    if (nav && nav.scrollWidth > nav.clientWidth) {
      var nr = nav.getBoundingClientRect();
      if (r.left < nr.left) nav.scrollLeft -= nr.left - r.left + 16;
      else if (r.right > nr.right) nav.scrollLeft += r.right - nr.right + 16;
    }
    if (side && side.scrollHeight > side.clientHeight) {
      var sr = side.getBoundingClientRect();
      if (r.top < sr.top) side.scrollTop -= sr.top - r.top + 8;
      else if (r.bottom > sr.bottom) side.scrollTop += r.bottom - sr.bottom + 8;
    }
  }

  function update() {
    if (locked >= 0) return;
    var line = window.innerHeight * 0.3;
    var idx = 0;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i] && heads[i].getBoundingClientRect().top <= line) idx = i;
    }
    // Na samym dole strony krótkie ostatnie sekcje nie dochodzą do linii, więc bierzemy ostatnią.
    var atEnd = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4;
    if (atEnd) idx = heads.length - 1;
    setActive(idx);
  }

  // Przeglądarka i tak wysyła scroll raz na klatkę, a 17 pomiarów to mało, więc liczymy od razu.
  function onScroll() {
    update();
  }

  // Po kliknięciu w spis pokazujemy wybraną pozycję od razu i trzymamy ją, aż przewijanie do sekcji się skończy.
  var locked = -1;
  var lockTimer = 0;
  links.forEach(function (a, i) {
    a.addEventListener('click', function () {
      locked = i;
      setActive(i);
      clearTimeout(lockTimer);
      lockTimer = setTimeout(function () { locked = -1; update(); }, 1000);
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', update);
  update();
})();
