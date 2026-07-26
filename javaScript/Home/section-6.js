/* ========================================================================== 
   INKWELL — SECTION 6: FAQ INTERACTIONS
   Single-open accordion, keyboard navigation, reveal, and pointer glow.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.querySelector("[data-section-6-faq]");
  if (!root) return;

  document.documentElement.classList.add("section-6-faq-js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  setupSingleOpenAccordion(root);
  setupReveal(
    root,
    reducedMotion.matches || window.__INKWELL_MASTER_JOURNEY__ === true,
  );
  setupPointerGlow(root, reducedMotion, finePointer);

  function setupSingleOpenAccordion(faqRoot) {
    const items = Array.from(faqRoot.querySelectorAll("[data-faq-item]"));
    const triggers = items
      .map((item) => item.querySelector("[data-faq-trigger]"))
      .filter(Boolean);

    if (!items.length || !triggers.length) return;

    // Keep only one initially open even if the HTML was accidentally copied
    // with several .is-open classes or aria-expanded="true" values.
    const initialOpenItem =
      items.find(
        (item) =>
          item.classList.contains("is-open") ||
          item.querySelector("[data-faq-trigger]")?.getAttribute("aria-expanded") ===
            "true",
      ) || items[0];

    items.forEach((item) => {
      setItemState(item, item === initialOpenItem, false);
    });

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest("[data-faq-item]");
        if (!item) return;

        const isOpen = trigger.getAttribute("aria-expanded") === "true";

        // Opening one answer always closes every other answer first.
        if (!isOpen) {
          items.forEach((candidate) => {
            setItemState(candidate, candidate === item, true);
          });
          return;
        }

        // The active answer may also be collapsed, leaving every item closed.
        setItemState(item, false, true);
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

  function setItemState(item, open, announce) {
    const trigger = item.querySelector("[data-faq-trigger]");
    const panel = item.querySelector("[data-faq-panel]");
    if (!trigger || !panel) return;

    item.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.toggleAttribute("inert", !open);

    if (announce) {
      root.dispatchEvent(
        new CustomEvent("inkwell:faq-change", {
          bubbles: true,
          detail: {
            id: trigger.id,
            open,
          },
        }),
      );
    }
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
    let frame = 0;
    let latestEvent = null;

    const paint = () => {
      frame = 0;
      if (!latestEvent) return;

      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        "--pointer-x",
        `${latestEvent.clientX - rect.left}px`,
      );
      element.style.setProperty(
        "--pointer-y",
        `${latestEvent.clientY - rect.top}px`,
      );
    };

    element.addEventListener("pointerenter", () => {
      if (reduceQuery.matches || !pointerQuery.matches) return;
      element.classList.add("is-pointer-active");
    });

    element.addEventListener("pointermove", (event) => {
      if (reduceQuery.matches || !pointerQuery.matches) return;
      latestEvent = event;
      if (!frame) frame = window.requestAnimationFrame(paint);
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