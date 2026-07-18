/* ============================================================================
 * QA Curriculum — FX layer (premium 3D / motion enhancements)
 * Purely visual & additive. Hooks into the DOM that app.js renders without
 * touching its logic: a MutationObserver re-applies effects after every route
 * re-render. Zero dependencies. Fully no-ops under prefers-reduced-motion.
 * ==========================================================================*/
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var canInteract = !reduce && !coarse && window.matchMedia("(min-width: 720px)").matches;

  /* ---------------- animated, layered background (built once) ---------------- */
  function buildBackground() {
    if (document.querySelector(".fx-bg")) return;
    var bg = document.createElement("div");
    bg.className = "fx-bg";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML =
      '<span class="fx-blob fx-blob-1"></span>' +
      '<span class="fx-blob fx-blob-2"></span>' +
      '<span class="fx-blob fx-blob-3"></span>' +
      '<span class="fx-grid"></span>';
    document.body.appendChild(bg);
  }

  /* ---------------- floating back-to-top CTA (built once) -------------------- */
  function buildToTop() {
    if (document.querySelector(".fx-top")) return;
    var b = document.createElement("button");
    b.className = "fx-top";
    b.type = "button";
    b.setAttribute("aria-label", "Back to top");
    b.textContent = "↑";
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    document.body.appendChild(b);
    var onScroll = function () { b.classList.toggle("show", window.pageYOffset > 480); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- scroll reveal ------------------------------------------- */
  var REVEAL = ".hero,.card,.phase-card,.week-card,.day-card,.res-card,.channel-card," +
               ".video-card,.milestone-box,.phase-header,.week-header,.page-header," +
               ".section-title,.table-wrap,.search-hit,.video-phase-head";
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("fx-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }) : null;

  function applyReveal(root) {
    var nodes = root.querySelectorAll(REVEAL);
    var stagger = 0;
    Array.prototype.forEach.call(nodes, function (n) {
      if (n.dataset.fxReveal) return;
      n.dataset.fxReveal = "1";
      if (reduce || !io) { n.classList.add("fx-in"); return; }
      // light stagger between siblings, capped so nothing lags
      n.style.transitionDelay = Math.min(stagger * 28, 168) + "ms";
      stagger++;
      n.classList.add("fx-reveal");
      io.observe(n);
    });
  }

  /* ---------------- mouse-follow 3D tilt (delegated on #main) ---------------- */
  var TILT = ".card,.phase-card,.week-card,.day-card,.res-card,.channel-card,.video-card,.milestone-box,.progress-card";
  var current = null;

  function resetTilt(t) {
    if (!t) return;
    t.style.transform = "";
    t.classList.remove("fx-tilt-active");
  }
  function tiltMove(e) {
    var t = e.target && e.target.closest ? e.target.closest(TILT) : null;
    if (t !== current) { resetTilt(current); current = t; }
    if (!t) return;
    // don't tilt an element still mid scroll-reveal
    if (t.classList.contains("fx-reveal") && !t.classList.contains("fx-in")) return;
    var r = t.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;
    var max = 4;
    t.style.transform =
      "perspective(1000px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" +
      (px * max).toFixed(2) + "deg) translateY(-4px)";
    t.style.setProperty("--gx", (px * 70 + 50).toFixed(1) + "%");
    t.style.setProperty("--gy", (py * 70 + 50).toFixed(1) + "%");
    t.classList.add("fx-tilt-active");
  }

  function bindTilt(main) {
    if (!canInteract) return;
    var pending = false, last = null;
    main.addEventListener("pointermove", function (e) {
      last = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; if (last) tiltMove(last); });
    }, { passive: true });
    main.addEventListener("pointerleave", function () { resetTilt(current); current = null; }, { passive: true });
  }

  /* ---------------- hero parallax + floating tech icons ---------------------- */
  var HERO_ICONS = ["cypress", "javascript", "postman", "nodedotjs", "git", "github"];
  // ambient watermark glyphs — [left%, top%, size(px)], kept large & faint
  var HERO_SPOTS = [[83, 9, 118], [94, 48, 78], [73, 85, 104], [6, 14, 96], [34, 92, 72], [56, 3, 62]];

  function decorateHero(hero) {
    if (hero.dataset.fxHero) return;
    hero.dataset.fxHero = "1";

    var orb = document.createElement("span");
    orb.className = "fx-hero-orb";
    orb.setAttribute("aria-hidden", "true");
    hero.appendChild(orb);

    var layer = document.createElement("div");
    layer.className = "fx-hero-layer";
    layer.setAttribute("aria-hidden", "true");
    HERO_SPOTS.forEach(function (s, i) {
      var slug = HERO_ICONS[i % HERO_ICONS.length];
      var chip = document.createElement("span");
      chip.className = "fx-float-icon fx-depth-" + ((i % 3) + 1);
      chip.style.insetInlineStart = s[0] + "%";
      chip.style.insetBlockStart = s[1] + "%";
      chip.style.setProperty("--sz", s[2] + "px");
      chip.style.animationDelay = (i * 0.55).toFixed(2) + "s";
      var img = document.createElement("img");
      img.src = "https://cdn.simpleicons.org/" + slug + "/ffffff";
      img.alt = "";
      img.loading = "lazy";
      img.width = s[2]; img.height = s[2];
      img.addEventListener("error", function () { chip.style.display = "none"; });
      chip.appendChild(img);
      layer.appendChild(chip);
    });
    hero.appendChild(layer);

    if (!canInteract) return;
    var pending = false, last = null;
    hero.addEventListener("pointermove", function (e) {
      last = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", ((last.clientX - r.left) / r.width - 0.5).toFixed(3));
        hero.style.setProperty("--my", ((last.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    }, { passive: true });
    hero.addEventListener("pointerleave", function () {
      hero.style.setProperty("--mx", 0);
      hero.style.setProperty("--my", 0);
    }, { passive: true });
  }

  /* ---------------- per-render enhancement pass ------------------------------ */
  function enhance(main) {
    var hero = main.querySelector(".hero");
    if (hero) decorateHero(hero);
    applyReveal(main);
  }

  /* ---------------- init ----------------------------------------------------- */
  function init() {
    buildBackground();
    buildToTop();
    var main = document.getElementById("main");
    if (!main) return;
    bindTilt(main);
    enhance(main);

    // app.js rebuilds #main's children on every route/lang change — re-enhance.
    if ("MutationObserver" in window) {
      var scheduled = false;
      var mo = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
          scheduled = false;
          mo.disconnect();           // injecting decorations won't retrigger us
          enhance(main);
          mo.observe(main, { childList: true });
        });
      });
      mo.observe(main, { childList: true });
    }
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
