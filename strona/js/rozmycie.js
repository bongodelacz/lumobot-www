/* Stopniowe rozmycie krawędzi ekranu przy przewijaniu (wzorzec Gradual Blur z React Bits).
   Dolny pas stały w środkowej części strony (znika na samej górze i przy stopce).
   Górny pas pojawia się przy przewijaniu w górę i znika po ok. 600 ms bezczynności lub przy ruchu w dół. */
(function () {
  "use strict";

  var path = window.location.pathname || "/";
  if (/^\/(cennik|firmy|dokumentacja|status|porownanie|vs-[^/]+)(\/|$)/.test(path)) {
    return;
  }

  var docEl = document.documentElement;
  var isStatic =
    docEl.classList.contains("static") ||
    /[?&]statycznie/.test(window.location.search);
  var prefersReduced =
    isStatic ||
    Boolean(
      window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

  function buildBar(posClass) {
    var wrap = document.createElement("div");
    wrap.className = "gb " + posClass;
    wrap.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 10; i++) {
      var layer = document.createElement("i");
      layer.className = "gb-l";
      wrap.appendChild(layer);
    }
    return wrap;
  }

  function init() {
    if (!document.body || document.querySelector(".gb-bottom")) return;

    var topBar = buildBar("gb-top");
    var bottomBar = buildBar("gb-bottom");
    document.body.appendChild(topBar);
    document.body.appendChild(bottomBar);

    var footer =
      document.getElementById("stopka") ||
      document.querySelector("footer.dl, footer");
    var lastY = window.scrollY || window.pageYOffset || 0;
    var hideTimer = 0;
    var rafId = 0;

    function updateEdges(y) {
      var winH = window.innerHeight || docEl.clientHeight || 800;
      var scrollH = Math.max(
        docEl.scrollHeight || 0,
        document.body ? document.body.scrollHeight : 0
      );
      var maxScroll = Math.max(0, scrollH - winH);
      var nearTop = y <= 24;
      var nearBottom = maxScroll - y <= 140;

      if (!nearBottom && footer) {
        var rect = footer.getBoundingClientRect();
        if (rect.top <= winH - 120) {
          nearBottom = true;
        }
      }

      if (nearTop || nearBottom) {
        bottomBar.classList.remove("is-on");
        bottomBar.classList.add("is-edge");
      } else {
        bottomBar.classList.add("is-on");
        bottomBar.classList.remove("is-edge");
      }

      if (nearTop && !prefersReduced) {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = 0;
        }
        topBar.classList.remove("is-on");
      }
    }

    function onScroll() {
      var y = window.scrollY || window.pageYOffset || 0;
      var dy = y - lastY;
      lastY = y;

      if (!prefersReduced) {
        if (y > 24 && dy < -1) {
          topBar.classList.add("is-on");
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = window.setTimeout(function () {
            topBar.classList.remove("is-on");
            hideTimer = 0;
          }, 620);
        } else if (dy > 1 || y <= 24) {
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = 0;
          }
          topBar.classList.remove("is-on");
        }
      }

      if (!rafId) {
        rafId = window.requestAnimationFrame(function () {
          rafId = 0;
          updateEdges(window.scrollY || window.pageYOffset || 0);
        });
      }
    }

    updateEdges(lastY);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        updateEdges(window.scrollY || window.pageYOffset || 0);
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
