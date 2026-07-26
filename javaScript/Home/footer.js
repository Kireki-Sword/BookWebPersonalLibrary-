/* ========================================================================== 
   INKWELL — SITE FOOTER INTERACTIONS
   Current year and one restrained entrance reveal.
   ========================================================================== */

(() => {
  "use strict";

  const footer = document.querySelector("[data-site-footer]");
  if (!footer) return;

  document.documentElement.classList.add("site-footer-js");

  footer.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    footer.classList.add("is-revealed");
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.disconnect();
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  observer.observe(footer);
})();