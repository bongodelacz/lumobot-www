/* LumoBot: efekty przy przewijaniu sterowane atrybutami data-ruch */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var statycznie =
    params.has("statycznie") ||
    document.documentElement.classList.contains("static") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var styleInjected = false;
  function injectStyles() {
    if (styleInjected) return;
    styleInjected = true;
    var css =
      '[data-ruch="slowa"] .ruch-slowo{' +
      "display:inline-block;" +
      "opacity:0;" +
      "filter:blur(10px);" +
      "transform:translateY(12px);" +
      "transition:opacity .7s cubic-bezier(.2,.7,.2,1),filter .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);" +
      "will-change:opacity,filter,transform" +
      "}" +
      '[data-ruch="slowa"].ruch-widoczne .ruch-slowo{' +
      "opacity:1;" +
      "filter:blur(0);" +
      "transform:none" +
      "}" +
      '[data-ruch="przybliz"]{' +
      "will-change:transform,opacity;" +
      "transform-origin:center top" +
      "}" +
      '[data-ruch="paralaksa"]{' +
      "will-change:transform" +
      "}" +
      '[data-ruch="poziomo"]{' +
      "position:relative;" +
      "overflow-x:clip" +
      "}" +
      '[data-ruch="poziomo"]>[data-tor]{' +
      "display:flex;" +
      "width:max-content;" +
      "will-change:transform" +
      "}" +
      "html.static [data-ruch=\"slowa\"] .ruch-slowo," +
      "@media (prefers-reduced-motion:reduce){" +
      '[data-ruch="slowa"] .ruch-slowo{opacity:1;filter:none;transform:none;transition:none}' +
      "}";

    var style = document.createElement("style");
    style.id = "ruch-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* 1. Słowo po słowie z rozmyciem: zachowuje spacje, <br> i tagi wewnętrzne np. <span class="grad"> */
  function prepareSlowa(el) {
    if (el.dataset.ruchGotowe === "1") return;
    el.dataset.ruchGotowe = "1";

    var index = 0;
    function wrapTextNodes(node) {
      var children = Array.prototype.slice.call(node.childNodes);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.nodeType === 3) {
          var text = child.nodeValue;
          if (!text || !text.trim()) continue;
          var parts = text.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          for (var j = 0; j < parts.length; j++) {
            var part = parts[j];
            if (!part) continue;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              var span = document.createElement("span");
              span.className = "ruch-slowo";
              span.textContent = part;
              if (!statycznie) {
                span.style.transitionDelay = Math.min(index * 55, 900) + "ms";
              }
              index++;
              frag.appendChild(span);
            }
          }
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrapTextNodes(child);
        }
      }
    }

    wrapTextNodes(el);
    if (statycznie) {
      el.classList.add("ruch-widoczne");
    }
  }

  /* 2. Licznik odliczający do data-do */
  function formatNumber(val, decimals, hasSpaceSep) {
    var fixed = decimals > 0 ? val.toFixed(decimals) : String(Math.round(val));
    if (!hasSpaceSep) return fixed;
    var parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  }

  function prepareLicznik(el) {
    if (el.dataset.ruchGotowe === "1") return;
    el.dataset.ruchGotowe = "1";

    var rawTarget = el.getAttribute("data-do");
    var rawText = (el.textContent || "").trim();
    var targetStr = rawTarget !== null ? rawTarget.trim() : rawText;
    var match = targetStr.match(/^([^0-9-]*)(-?[\d\s]+(?:[.,]\d+)?)(.*)$/);
    if (!match) return;

    var prefix = match[1] || "";
    var numClean = match[2].replace(/\s+/g, "").replace(",", ".");
    var suffix = el.getAttribute("data-sufiks") || match[3] || "";
    var target = parseFloat(numClean);
    if (isNaN(target)) return;

    var decMatch = numClean.split(".")[1];
    var decimals = decMatch ? decMatch.length : 0;
    var hasSpaceSep = /\d\s\d{3}/.test(match[2]);
    var duration = parseInt(el.getAttribute("data-czas") || "1100", 10);

    el._ruchLicznik = {
      prefix: prefix,
      suffix: suffix,
      target: target,
      decimals: decimals,
      hasSpaceSep: hasSpaceSep,
      duration: isNaN(duration) ? 1100 : duration,
      done: false
    };

    if (statycznie) {
      el.textContent = prefix + formatNumber(target, decimals, hasSpaceSep) + suffix;
      el._ruchLicznik.done = true;
    } else {
      el.textContent = prefix + formatNumber(0, decimals, hasSpaceSep) + suffix;
    }
  }

  function runLicznik(el) {
    var cfg = el._ruchLicznik;
    if (!cfg || cfg.done) return;
    cfg.done = true;

    var start = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - start) / cfg.duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var current = cfg.target * eased;
      el.textContent = cfg.prefix + formatNumber(current, cfg.decimals, cfg.hasSpaceSep) + cfg.suffix;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = cfg.prefix + formatNumber(cfg.target, cfg.decimals, cfg.hasSpaceSep) + cfg.suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  /* 3. Poziomo: sekcja przyklejona z torem kart */
  var poziome = [];
  function preparePoziomo(el) {
    var tor = el.querySelector("[data-tor]");
    if (!tor) return;

    if (statycznie) {
      el.style.height = "auto";
      tor.style.position = "static";
      tor.style.width = "auto";
      tor.style.flexWrap = "wrap";
      tor.style.transform = "none";
      return;
    }

    var item = { el: el, tor: tor, maxShift: 0, topOffset: 88 };
    poziome.push(item);
    measurePoziomo(item);
  }

  function measurePoziomo(item) {
    var el = item.el;
    var tor = item.tor;
    var viewW = el.clientWidth || window.innerWidth;
    var viewH = window.innerHeight || 800;
    var torW = tor.scrollWidth;
    var shift = Math.max(0, torW - viewW + 48);

    item.maxShift = shift;
    item.topOffset = Math.max(72, Math.round((viewH - tor.offsetHeight) * 0.42));

    tor.style.position = "sticky";
    tor.style.top = item.topOffset + "px";

    var extraScroll = Math.max(320, shift);
    el.style.height = tor.offsetHeight + item.topOffset + extraScroll + "px";
  }

  /* 4. Aktualizacja efektów zależnych od przewijania (paralaksa, przybliz, poziomo) */
  var paralaksy = [];
  var przyblizenia = [];
  var scrollScheduled = false;

  function updateScrollEffects() {
    scrollScheduled = false;
    var vh = window.innerHeight || 800;

    for (var i = 0; i < paralaksy.length; i++) {
      var pEl = paralaksy[i];
      var rect = pEl.getBoundingClientRect();
      var sila = parseFloat(pEl.getAttribute("data-sila") || "0.2");
      if (isNaN(sila)) sila = 0.2;
      var centerOffset = rect.top + rect.height * 0.5 - vh * 0.5;
      var y = Math.round(-centerOffset * sila * 10) / 10;
      pEl.style.transform = "translate3d(0, " + y + "px, 0)";
    }

    for (var j = 0; j < przyblizenia.length; j++) {
      var zEl = przyblizenia[j];
      var zRect = zEl.getBoundingClientRect();
      // Od wejścia na dole ekranu (vh * 0.98) do 38% wysokości ekranu osiąga pełne 1
      var raw = (vh * 0.98 - zRect.top) / (vh * 0.58);
      var progress = Math.max(0, Math.min(1, raw));
      var eased = 1 - Math.pow(1 - progress, 2.2);
      var scale = 0.9 + 0.1 * eased;
      var tilt = (1 - eased) * 7;
      var ty = (1 - eased) * 28;
      var opacity = 0.25 + 0.75 * eased;

      zEl.style.opacity = opacity.toFixed(3);
      zEl.style.transform =
        "perspective(1200px) translate3d(0, " +
        ty.toFixed(1) +
        "px, 0) scale(" +
        scale.toFixed(4) +
        ") rotateX(" +
        tilt.toFixed(2) +
        "deg)";
    }

    for (var k = 0; k < poziome.length; k++) {
      var item = poziome[k];
      if (item.maxShift <= 0) continue;
      var hRect = item.el.getBoundingClientRect();
      var totalTravel = item.el.offsetHeight - item.tor.offsetHeight - item.topOffset;
      if (totalTravel <= 0) continue;
      var traveled = item.topOffset - hRect.top;
      var hp = Math.max(0, Math.min(1, traveled / totalTravel));
      var tx = -hp * item.maxShift;
      item.tor.style.transform = "translate3d(" + tx.toFixed(1) + "px, 0, 0)";
    }
  }

  function scheduleScrollUpdate() {
    if (statycznie || scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(updateScrollEffects);
  }

  function initAll() {
    injectStyles();

    paralaksy = [];
    przyblizenia = [];
    poziome = [];

    var slowaEls = document.querySelectorAll('[data-ruch="slowa"]');
    var licznikEls = document.querySelectorAll('[data-ruch="licznik"]');
    var pEls = document.querySelectorAll('[data-ruch="paralaksa"]');
    var zEls = document.querySelectorAll('[data-ruch="przybliz"]');
    var hEls = document.querySelectorAll('[data-ruch="poziomo"]');

    for (var i = 0; i < slowaEls.length; i++) prepareSlowa(slowaEls[i]);
    for (var j = 0; j < licznikEls.length; j++) prepareLicznik(licznikEls[j]);

    if (statycznie) {
      for (var p = 0; p < pEls.length; p++) pEls[p].style.transform = "none";
      for (var z = 0; z < zEls.length; z++) {
        zEls[z].style.opacity = "1";
        zEls[z].style.transform = "none";
      }
      for (var h = 0; h < hEls.length; h++) preparePoziomo(hEls[h]);
      return;
    }

    for (var p2 = 0; p2 < pEls.length; p2++) paralaksy.push(pEls[p2]);
    for (var z2 = 0; z2 < zEls.length; z2++) przyblizenia.push(zEls[z2]);
    for (var h2 = 0; h2 < hEls.length; h2++) preparePoziomo(hEls[h2]);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          for (var e = 0; e < entries.length; e++) {
            var entry = entries[e];
            if (!entry.isIntersecting) continue;
            var target = entry.target;
            var rodzaj = target.getAttribute("data-ruch");
            if (rodzaj === "slowa") {
              target.classList.add("ruch-widoczne");
            } else if (rodzaj === "licznik") {
              runLicznik(target);
            }
            io.unobserve(target);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
      );

      for (var s = 0; s < slowaEls.length; s++) io.observe(slowaEls[s]);
      for (var l = 0; l < licznikEls.length; l++) io.observe(licznikEls[l]);
    } else {
      for (var s2 = 0; s2 < slowaEls.length; s2++) slowaEls[s2].classList.add("ruch-widoczne");
      for (var l2 = 0; l2 < licznikEls.length; l2++) runLicznik(licznikEls[l2]);
    }

    updateScrollEffects();
  }

  if (!statycznie) {
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        for (var i = 0; i < poziome.length; i++) measurePoziomo(poziome[i]);
        scheduleScrollUpdate();
      },
      { passive: true }
    );
  }

  window.LumoRuch = { odswiez: initAll };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
