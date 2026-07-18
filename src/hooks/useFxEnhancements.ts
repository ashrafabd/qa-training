import { useEffect } from "react";

export function useFxEnhancements() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const canInteract = !reduce && !coarse && window.matchMedia("(min-width: 720px)").matches;

    function buildBackground() {
      if (document.querySelector(".fx-bg")) return;
      const bg = document.createElement("div");
      bg.className = "fx-bg";
      bg.setAttribute("aria-hidden", "true");
      bg.innerHTML =
        '<span class="fx-blob fx-blob-1"></span>' +
        '<span class="fx-blob fx-blob-2"></span>' +
        '<span class="fx-blob fx-blob-3"></span>' +
        '<span class="fx-grid"></span>';
      document.body.appendChild(bg);
    }

    function buildToTop() {
      if (document.querySelector(".fx-top")) return;
      const button = document.createElement("button");
      button.className = "fx-top";
      button.type = "button";
      button.setAttribute("aria-label", "Back to top");
      button.textContent = "↑";
      button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
      document.body.appendChild(button);
      const onScroll = () => button.classList.toggle("show", window.pageYOffset > 480);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const REVEAL =
      ".hero,.card,.phase-card,.week-card,.day-card,.res-card,.channel-card,.video-card,.milestone-box,.phase-header,.week-header,.page-header,.section-title,.table-wrap,.search-hit,.video-phase-head";

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("fx-in");
                  io.unobserve(entry.target);
                }
              });
            },
            { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
          )
        : null;

    function applyReveal(root) {
      const nodes = root.querySelectorAll(REVEAL);
      let stagger = 0;
      nodes.forEach((node) => {
        if (node.dataset.fxReveal) return;
        node.dataset.fxReveal = "1";
        if (reduce || !io) {
          node.classList.add("fx-in");
          return;
        }
        node.style.transitionDelay = `${Math.min(stagger * 28, 168)}ms`;
        stagger += 1;
        node.classList.add("fx-reveal");
        io.observe(node);
      });
    }

    const TILT = ".card,.phase-card,.week-card,.day-card,.res-card,.channel-card,.video-card,.milestone-box,.progress-card";
    let current = null;

    function resetTilt(target) {
      if (!target) return;
      target.style.transform = "";
      target.classList.remove("fx-tilt-active");
    }

    function tiltMove(event) {
      const target = event.target?.closest ? event.target.closest(TILT) : null;
      if (target !== current) {
        resetTilt(current);
        current = target;
      }
      if (!target) return;
      if (target.classList.contains("fx-reveal") && !target.classList.contains("fx-in")) return;

      const rect = target.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const max = 4;

      target.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
      target.style.setProperty("--gx", `${(px * 70 + 50).toFixed(1)}%`);
      target.style.setProperty("--gy", `${(py * 70 + 50).toFixed(1)}%`);
      target.classList.add("fx-tilt-active");
    }

    function bindTilt(main) {
      if (!canInteract) return () => {};
      let pending = false;
      let last = null;

      const onMove = (event) => {
        last = event;
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          if (last) tiltMove(last);
        });
      };

      const onLeave = () => {
        resetTilt(current);
        current = null;
      };

      main.addEventListener("pointermove", onMove, { passive: true });
      main.addEventListener("pointerleave", onLeave, { passive: true });

      return () => {
        main.removeEventListener("pointermove", onMove);
        main.removeEventListener("pointerleave", onLeave);
      };
    }

    function enhance(main) {
      applyReveal(main);
    }

    buildBackground();
    const unbindToTop = buildToTop();

    const main = document.getElementById("main");
    if (!main) return undefined;

    const unbindTilt = bindTilt(main);
    enhance(main);

    const mo =
      "MutationObserver" in window
        ? new MutationObserver(() => {
            requestAnimationFrame(() => enhance(main));
          })
        : null;

    mo?.observe(main, { childList: true, subtree: true });

    return () => {
      unbindTilt?.();
      unbindToTop?.();
      mo?.disconnect();
      io?.disconnect();
    };
  }, []);
}
