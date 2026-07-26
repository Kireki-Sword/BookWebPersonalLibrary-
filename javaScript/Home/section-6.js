/* ========================================================================== 
   INKWELL — SECTION 6: FAQ INTERACTIONS
   Accordion, keyboard navigation, reveal, and subtle pointer glow.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.querySelector("[data-section-6-faq]");
  if (!root) return;

  document.documentElement.classList.add("section-6-faq-js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  setupAccordion(root);
  setupReveal(root, reducedMotion.matches || window.__INKWELL_MASTER_JOURNEY__ === true);
  setupPointerGlow(root, reducedMotion, finePointer);

  function setupAccordion(faqRoot) {
    const items = Array.from(faqRoot.querySelectorAll("[data-faq-item]"));
    const triggers = items
      .map((item) => item.querySelector("[data-faq-trigger]"))
      .filter(Boolean);

    items.forEach((item) => {
      const trigger = item.querySelector("[data-faq-trigger]");
      const panel = item.querySelector("[data-faq-panel]");
      if (!trigger || !panel) return;

      const startsOpen = item.classList.contains("is-open");
      updateItem(item, trigger, panel, startsOpen);

      trigger.addEventListener("click", () => {
        const willOpen = trigger.getAttribute("aria-expanded") !== "true";
        updateItem(item, trigger, panel, willOpen);
      });

      trigger.addEventListener("keydown", (event) => {
        const currentIndex = triggers.indexOf(trigger);
        let nextIndex = currentIndex;

        switch (event.key) {
          case "ArrowDown":
            nextIndex = (currentIndex + 1) % triggers.length;
            break;
          case "ArrowUp":
            nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
            break;
          case "Home":
            nextIndex = 0;
            break;
          case "End":
            nextIndex = triggers.length - 1;
            break;
          default:
            return;
        }

        event.preventDefault();
        triggers[nextIndex]?.focus();
      });
    });
  }

  function updateItem(item, trigger, panel, open) {
    item.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.toggleAttribute("inert", !open);
  }

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

  function setupPointerGlow(element, reduceQuery, pointerQuery) {
    let rafId = 0;
    let latestEvent = null;

    const applyPointer = () => {
      rafId = 0;
      if (!latestEvent) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--pointer-x", `${latestEvent.clientX - rect.left}px`);
      element.style.setProperty("--pointer-y", `${latestEvent.clientY - rect.top}px`);
    };

    element.addEventListener("pointerenter", () => {
      if (reduceQuery.matches || !pointerQuery.matches) return;
      element.classList.add("is-pointer-active");
    });

    element.addEventListener("pointermove", (event) => {
      if (reduceQuery.matches || !pointerQuery.matches) return;
      latestEvent = event;
      if (!rafId) rafId = window.requestAnimationFrame(applyPointer);
    });

    element.addEventListener("pointerleave", () => {
      latestEvent = null;
      element.classList.remove("is-pointer-active");
    });

    const sync = () => {
      if (reduceQuery.matches || !pointerQuery.matches) {
        element.classList.remove("is-pointer-active");
      }
    };

    reduceQuery.addEventListener?.("change", sync);
    pointerQuery.addEventListener?.("change", sync);
  }
})();