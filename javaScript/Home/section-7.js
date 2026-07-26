/* ========================================================================== 
   INKWELL — SECTION 7: FINAL CTA INTERACTIONS
   Entrance reveal, pointer-following light, and button ripple feedback.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.querySelector("[data-section-7-cta]");
  if (!root) return;

  document.documentElement.classList.add("section-7-cta-js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const glowTarget = root.querySelector("[data-section-7-pointer]");

  setupReveal(root, reducedMotion.matches || window.__INKWELL_MASTER_JOURNEY__ === true);
  setupPointerGlow(glowTarget, reducedMotion, finePointer);
  setupRipple(root, reducedMotion);

  function setupReveal(element, reduce) {
    if (reduce || !("IntersectionObserver" in window)) {
      element.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );

    observer.observe(element);
  }

  function setupPointerGlow(target, reduceQuery, pointerQuery) {
    if (!target) return;

    let rafId = 0;
    let latestEvent = null;

    const applyPointer = () => {
      rafId = 0;
      if (!latestEvent) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--pointer-x", `${latestEvent.clientX - rect.left}px`);
      target.style.setProperty("--pointer-y", `${latestEvent.clientY - rect.top}px`);
    };

    target.addEventListener("pointermove", (event) => {
      if (reduceQuery.matches || !pointerQuery.matches) return;
      latestEvent = event;
      if (!rafId) rafId = window.requestAnimationFrame(applyPointer);
    });

    target.addEventListener("pointerleave", () => {
      latestEvent = null;
    });
  }

  function setupRipple(container, reduceQuery) {
    if (reduceQuery.matches) return;

    container.addEventListener("pointerdown", (event) => {
      const target = event.target.closest("[data-section-7-ripple]");
      if (!target || event.button !== 0) return;

      const rect = target.getBoundingClientRect();
      const diameter = Math.ceil(Math.hypot(rect.width, rect.height) * 2);
      const ripple = document.createElement("span");

      ripple.className = "home-ripple";
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      target.querySelector(".home-ripple")?.remove();
      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  }
})();