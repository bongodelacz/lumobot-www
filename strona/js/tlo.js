/* LumoBot: animowane tło (siatka kropek + miękkie poświaty) */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var statycznie =
    params.has("statycznie") ||
    document.documentElement.classList.contains("static") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.getElementById("tlo");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "tlo";
    canvas.setAttribute("aria-hidden", "true");
    if (document.body) {
      document.body.insertBefore(canvas, document.body.firstChild);
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        document.body.insertBefore(canvas, document.body.firstChild);
        init();
      });
      return;
    }
  }

  init();

  function init() {
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    var w = 0;
    var h = 0;
    var dpr = 1;
    var step = 22;
    var cols = 0;
    var rows = 0;

    var mouseX = -9999;
    var mouseY = -9999;
    var smoothX = -9999;
    var smoothY = -9999;
    var pointerActive = false;

    var scrollY = window.scrollY || window.pageYOffset || 0;
    var lastDraw = 0;
    var rafId = 0;
    var startTime = performance.now();

    var glows = [
      { bx: 0.22, by: 0.18, r: 0.42, color: "58, 107, 252", alpha: 0.16, sx: 0.00018, sy: 0.00013, scroll: 0.14, phase: 0.4 },
      { bx: 0.78, by: 0.36, r: 0.46, color: "122, 92, 255", alpha: 0.14, sx: 0.00014, sy: 0.00019, scroll: 0.22, phase: 2.1 },
      { bx: 0.48, by: 0.82, r: 0.40, color: "58, 107, 252", alpha: 0.11, sx: 0.00016, sy: 0.00015, scroll: 0.10, phase: 4.0 }
    ];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth || document.documentElement.clientWidth || 1280;
      h = window.innerHeight || document.documentElement.clientHeight || 800;
      step = w < 640 ? 30 : 22;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / step) + 2;
      rows = Math.ceil(h / step) + 2;
    }

    function drawGlows(t) {
      var minDim = Math.max(w, h);
      for (var i = 0; i < glows.length; i++) {
        var g = glows[i];
        var driftX = Math.sin(t * g.sx + g.phase) * w * 0.09;
        var driftY = Math.cos(t * g.sy + g.phase * 1.3) * h * 0.08;
        var scrollShift = -((scrollY * g.scroll) % (h * 1.4));
        var gx = g.bx * w + driftX;
        var gy = ((g.by * h + driftY + scrollShift) % (h * 1.4));
        if (gy < -h * 0.35) gy += h * 1.4;

        var rad = g.r * minDim;
        var grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);
        grad.addColorStop(0, "rgba(" + g.color + ", " + g.alpha + ")");
        grad.addColorStop(0.55, "rgba(" + g.color + ", " + (g.alpha * 0.35).toFixed(4) + ")");
        grad.addColorStop(1, "rgba(" + g.color + ", 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);
      }
    }

    function drawFrame(now) {
      var t = statycznie ? 2400 : now - startTime;

      if (pointerActive) {
        if (smoothX < -1000) {
          smoothX = mouseX;
          smoothY = mouseY;
        } else {
          smoothX += (mouseX - smoothX) * 0.22;
          smoothY += (mouseY - smoothY) * 0.22;
        }
      }

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      drawGlows(t);

      var timeSec = t * 0.0011;
      var scrollOffset = (scrollY * 0.28) % step;
      var cursorRadius = w < 640 ? 110 : 165;
      var cursorRadiusSq = cursorRadius * cursorRadius;

      for (var r = -1; r < rows; r++) {
        var y = r * step - scrollOffset;
        if (y < -2 || y > h + 2) continue;

        for (var c = 0; c < cols; c++) {
          var x = c * step + step * 0.5;
          if (x < -2 || x > w + 2) continue;

          // Miękka fala biegnąca po przekątnej, jak w aplikacji LumoBot
          var wave1 = Math.sin(x * 0.011 + y * 0.009 - timeSec * 1.45);
          var wave2 = Math.cos(x * 0.007 - y * 0.012 + timeSec * 0.95);
          var wave = Math.max(0, (wave1 * 0.6 + wave2 * 0.4 + 0.25) / 1.25);
          var wavePow = wave * wave;

          var mouseBoost = 0;
          if (pointerActive && smoothX > -1000) {
            var dx = x - smoothX;
            var dy = y - smoothY;
            var distSq = dx * dx + dy * dy;
            if (distSq < cursorRadiusSq) {
              var k = 1 - Math.sqrt(distSq) / cursorRadius;
              mouseBoost = k * k;
            }
          }

          var blueMix = Math.min(1, wavePow * 0.85 + mouseBoost * 0.95);
          var red = Math.round(118 + (120 - 118) * blueMix);
          var green = Math.round(118 + (156 - 118) * blueMix);
          var blue = Math.round(128 + (255 - 128) * blueMix);
          var alpha = Math.min(0.35, 0.15 + wavePow * 0.14 + mouseBoost * 0.16);
          var radius = 1.05 + wavePow * 0.45 + mouseBoost * 0.75;

          ctx.fillStyle = "rgba(" + red + "," + green + "," + blue + "," + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function loop(now) {
      if (statycznie || document.visibilityState !== "visible") {
        rafId = 0;
        return;
      }
      if (now - lastDraw >= 33) {
        lastDraw = now;
        drawFrame(now);
      }
      rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (statycznie) {
        drawFrame(performance.now());
        return;
      }
      if (!rafId && document.visibilityState === "visible") {
        lastDraw = 0;
        rafId = requestAnimationFrame(loop);
      }
    }

    window.addEventListener(
      "resize",
      function () {
        resize();
        if (statycznie) drawFrame(performance.now());
      },
      { passive: true }
    );

    window.addEventListener(
      "scroll",
      function () {
        scrollY = window.scrollY || window.pageYOffset || 0;
        if (statycznie) drawFrame(performance.now());
      },
      { passive: true }
    );

    if (!statycznie) {
      window.addEventListener(
        "pointermove",
        function (e) {
          mouseX = e.clientX;
          mouseY = e.clientY;
          pointerActive = true;
        },
        { passive: true }
      );

      window.addEventListener(
        "pointerleave",
        function () {
          pointerActive = false;
        },
        { passive: true }
      );

      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
          startLoop();
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      });
    }

    resize();
    drawFrame(performance.now());
    startLoop();
  }
})();
