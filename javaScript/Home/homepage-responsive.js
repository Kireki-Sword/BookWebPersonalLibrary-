/* ========================================================================== 
   INKWELL — RESPONSIVE HOMEPAGE CONTROLS
   Accessible compact navigation and small-screen interaction cleanup.
   Load after the existing homepage scripts.
   ========================================================================== */

(() => {
  "use strict";

  const nav = document.querySelector("[data-site-nav]");
  const toggle = nav?.querySelector("[data-nav-menu-toggle]");
  const menu = nav?.querySelector("[data-nav-menu]");
  const compactQuery = window.matchMedia("(max-width: 900px)");

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  if (nav && toggle && menu) {
    const setMenuState = (open, { returnFocus = false } = {}) => {
      const compact = compactQuery.matches;
      const nextOpen = compact && Boolean(open);

      nav.dataset.menuOpen = String(nextOpen);
      toggle.setAttribute("aria-expanded", String(nextOpen));
      toggle.setAttribute(
        "aria-label",
        nextOpen ? "Close primary menu" : "Open primary menu",
      );

      document.body.classList.toggle("nav-menu-open", nextOpen);
      menu.toggleAttribute("inert", compact && !nextOpen);

      if (!compact) {
        menu.removeAttribute("inert");
      }

      if (returnFocus) {
        toggle.focus({ preventScroll: true });
      }
    };

    setMenuState(false);

    toggle.addEventListener("click", () => {
      setMenuState(nav.dataset.menuOpen !== "true");
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenuState(false);
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (
        nav.dataset.menuOpen === "true" &&
        !nav.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.dataset.menuOpen === "true") {
        setMenuState(false, { returnFocus: true });
      }
    });

    compactQuery.addEventListener?.("change", () => {
      setMenuState(false);
    });
  }

  /* Coarse pointers do not need a stale desktop tilt transform. */
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    const heroCard = document.querySelector(".card-effect");
    const glare = document.querySelector(".card-glare");

    if (heroCard) {
      heroCard.style.removeProperty("transform");
      heroCard.classList.add("is-resetting");
    }

    glare?.style.removeProperty("background");
  }
})();