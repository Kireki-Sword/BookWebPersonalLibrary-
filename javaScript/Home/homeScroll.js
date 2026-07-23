/* ============================================================================
   INKWELL — CONNECTED HOME PAGE SCROLL JOURNEY

   Load order:
   1. GSAP
   2. ScrollTrigger
   3. section-2.js / section-3.js / section-4.js
   4. this file

   What this file does:
   - pins and scroll-directs Section 1
   - uses the existing pinned Section 2 timeline as-is
   - pins and scroll-directs Section 3
   - uses the existing pinned Section 4 timeline as-is
   - creates a full-viewport hand-off veil between 1→2, 2→3, and 3→4
   - keeps a natural, non-pinned fallback for smaller screens and reduced motion
   ============================================================================ */

(() => {
  "use strict";

  const DESKTOP_QUERY =
    "(min-width: 1100px) and (min-height: 700px) and " +
    "(prefers-reduced-motion: no-preference)";

  const SELECTORS = {
    nav: "nav",
    hero: ".hero",
    heroLeft: ".hero-left",
    heroRight: ".hero-right",
    section2: "#section-2-empty-shelf",
    section3: "#section-3-library-flow",
    section4: "#section-4",
    section3Copy: ".flow-copy-card",
    section3Search: ".flow-search-card",
    section3Library: ".flow-library-card",
  };

  const state = {
    gsap: null,
    ScrollTrigger: null,
    matchMedia: null,
    seamControllers: [],
    refreshTimers: [],
    resizeObserver: null,
    ticker: null,
  };

  function init() {
    if (window.__inkwellHomeJourneyStarted) {
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
      console.warn(
        "Home scroll journey: GSAP or ScrollTrigger is missing. " +
        "The page will use its normal layout.",
      );

      return;
    }

    const elements = getElements();

    if (!elements.hero || !elements.section2 || !elements.section3 || !elements.section4) {
      console.warn(
        "Home scroll journey: one or more homepage sections are missing.",
        elements,
      );

      return;
    }

    window.__inkwellHomeJourneyStarted = true;

    state.gsap = gsap;
    state.ScrollTrigger = ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    document.body.classList.add("journey-ready");
    syncNavigationHeight(elements.nav);

    state.matchMedia = gsap.matchMedia();

    state.matchMedia.add(
      {
        cinematic: DESKTOP_QUERY,
        fallback:
          "(max-width: 1099px), (max-height: 699px), " +
          "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        if (context.conditions.fallback) {
          removeAllSeams();
          clearJourneyInlineStyles(elements);
          return undefined;
        }

        return setupCinematicJourney(elements);
      },
    );

    setupRefreshes(elements);

    window.__inkwellHomeJourney = {
      refresh: () => ScrollTrigger.refresh(true),
      destroy,
    };
  }

  function getElements() {
    const section3 = document.querySelector(SELECTORS.section3);

    return {
      nav: document.querySelector(SELECTORS.nav),
      hero: document.querySelector(SELECTORS.hero),
      heroLeft: document.querySelector(SELECTORS.heroLeft),
      heroRight: document.querySelector(SELECTORS.heroRight),
      section2: document.querySelector(SELECTORS.section2),
      section3,
      section4: document.querySelector(SELECTORS.section4),
      section3Copy: section3?.querySelector(SELECTORS.section3Copy) || null,
      section3Search: section3?.querySelector(SELECTORS.section3Search) || null,
      section3Library: section3?.querySelector(SELECTORS.section3Library) || null,
    };
  }

  function setupCinematicJourney(elements) {
    const { gsap, ScrollTrigger } = state;
    const localCleanups = [];

    removeAllSeams();
    clearJourneyInlineStyles(elements);
    syncNavigationHeight(elements.nav);

    const seam12 = createSeam({
      tone: "section-2",
      destination: elements.section2,
      labelSelector: ".section-2-header .section-label",
      titleSelector: ".section-2-header h2",
      descriptionSelector: ".section-2-header p",
    });

    const seam23 = createSeam({
      tone: "section-3",
      destination: elements.section3,
      labelSelector: ".flow-copy-card .section-label",
      titleSelector: ".flow-copy-card h2",
      descriptionSelector: ".flow-copy-card > p",
    });

    const seam34 = createSeam({
      tone: "section-4",
      destination: elements.section4,
      labelSelector: ".s4-cinematic-copy .s4-section-label",
      titleSelector: ".s4-cinematic-copy h2",
      descriptionSelector: ".s4-cinematic-copy > p",
    });

    const heroScene = createHeroScene(elements, seam12);
    const section3Scene = createSection3Scene(elements, seam34);

    if (heroScene) {
      localCleanups.push(() => {
        heroScene.scrollTrigger?.kill();
        heroScene.kill();
      });
    }

    if (section3Scene) {
      localCleanups.push(() => {
        section3Scene.scrollTrigger?.kill();
        section3Scene.kill();
      });
    }

    /*
     * Section 2 already owns a long pinned master timeline. We do not create a
     * second pin. Instead, we read the existing ScrollTrigger's progress and
     * show the Section 3 hand-off only during the final part of that timeline.
     */
    waitForPinnedTrigger(elements.section2, 2400).then((section2Pin) => {
      if (!section2Pin || !document.body.classList.contains("journey-ready")) {
        return;
      }

      const controller = createSeamController({
        trigger: section2Pin,
        overlay: seam23,
        revealStart: 0.91,
        revealEnd: 0.985,
        fadeAfterViewport: 0.34,
      });

      state.seamControllers.push(controller);
    });

    if (heroScene?.scrollTrigger) {
      state.seamControllers.push(
        createSeamController({
          trigger: heroScene.scrollTrigger,
          overlay: seam12,
          revealStart: 0.68,
          revealEnd: 0.97,
          fadeAfterViewport: 0.34,
        }),
      );
    }

    if (section3Scene?.scrollTrigger) {
      state.seamControllers.push(
        createSeamController({
          trigger: section3Scene.scrollTrigger,
          overlay: seam34,
          revealStart: 0.7,
          revealEnd: 0.975,
          fadeAfterViewport: 0.34,
        }),
      );
    }

    startSeamTicker();

    ScrollTrigger.sort();
    queueRefresh(80);
    queueRefresh(500);
    queueRefresh(1500);

    return () => {
      localCleanups.forEach((cleanup) => cleanup());
      stopSeamTicker();
      removeAllSeams();
      clearJourneyInlineStyles(elements);
    };
  }

  function createHeroScene(elements) {
    const { gsap } = state;

    if (!elements.heroLeft || !elements.heroRight) {
      return null;
    }

    const leftItems = gsap.utils.toArray(
      elements.heroLeft.children,
    );

    const timeline = gsap.timeline({
      defaults: {
        ease: "none",
      },
      scrollTrigger: {
        id: "inkwell-hero-journey",
        trigger: elements.hero,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 1.55, 1250)}`,
        pin: true,
        scrub: 0.72,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 30,
      },
    });

    timeline
      .to({}, { duration: 0.23 })
      .to(
        leftItems,
        {
          autoAlpha: 0,
          y: -72,
          stagger: 0.028,
          duration: 0.52,
          ease: "power2.inOut",
        },
        0.22,
      )
      .to(
        elements.heroRight,
        {
          autoAlpha: 0,
          xPercent: 10,
          yPercent: -3,
          scale: 0.94,
          duration: 0.62,
          ease: "power2.inOut",
        },
        0.2,
      )
      .to(
        elements.hero,
        {
          "--journey-hero-drift": 1,
          duration: 0.64,
        },
        0.18,
      )
      .to({}, { duration: 0.2 });

    return timeline;
  }

  function createSection3Scene(elements) {
    const { gsap } = state;

    const copy = elements.section3Copy;
    const search = elements.section3Search;
    const library = elements.section3Library;

    if (!copy || !search || !library) {
      return null;
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: "none",
      },
      scrollTrigger: {
        id: "inkwell-section-3-journey",
        trigger: elements.section3,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 2.55, 2250)}`,
        pin: true,
        scrub: 0.82,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 8,
      },
    });

    timeline
      .fromTo(
        copy,
        {
          autoAlpha: 0,
          x: -84,
          y: 24,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.46,
          ease: "power3.out",
        },
        0,
      )
      .fromTo(
        search,
        {
          autoAlpha: 0,
          x: 88,
          y: 22,
          scale: 0.97,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
        },
        0.05,
      )
      .fromTo(
        library,
        {
          autoAlpha: 0.18,
          y: 92,
          scale: 0.975,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          ease: "power3.out",
        },
        0.24,
      )
      .to({}, { duration: 0.56 })
      .to(
        copy,
        {
          autoAlpha: 0.22,
          x: -42,
          y: -20,
          duration: 0.38,
          ease: "power2.inOut",
        },
        1.05,
      )
      .to(
        search,
        {
          x: 26,
          y: -16,
          scale: 0.985,
          duration: 0.38,
          ease: "power2.inOut",
        },
        1.05,
      )
      .to(
        library,
        {
          y: -18,
          scale: 1.01,
          duration: 0.38,
          ease: "power2.inOut",
        },
        1.05,
      )
      .to({}, { duration: 0.38 })
      .to(
        copy,
        {
          autoAlpha: 0,
          x: -96,
          y: -46,
          duration: 0.48,
          ease: "power2.in",
        },
        1.56,
      )
      .to(
        search,
        {
          autoAlpha: 0,
          x: 96,
          y: -40,
          scale: 0.95,
          duration: 0.48,
          ease: "power2.in",
        },
        1.56,
      )
      .to(
        library,
        {
          autoAlpha: 0,
          y: -84,
          scale: 0.955,
          duration: 0.5,
          ease: "power2.in",
        },
        1.56,
      )
      .to({}, { duration: 0.25 });

    return timeline;
  }

  function createSeam({
    tone,
    destination,
    labelSelector,
    titleSelector,
    descriptionSelector,
  }) {
    const label = destination.querySelector(labelSelector)?.textContent?.trim() || "";
    const title = destination.querySelector(titleSelector)?.textContent?.replace(/\s+/g, " ").trim() || "";
    const description =
      destination.querySelector(descriptionSelector)?.textContent?.replace(/\s+/g, " ").trim() || "";

    const overlay = document.createElement("div");
    overlay.className = "journey-seam";
    overlay.dataset.tone = tone;
    overlay.setAttribute("aria-hidden", "true");

    const copy = document.createElement("div");
    copy.className = "journey-seam__copy";

    const labelElement = document.createElement("span");
    labelElement.className = "journey-seam__label";
    labelElement.textContent = label;

    const titleElement = document.createElement("h2");
    titleElement.className = "journey-seam__title";
    titleElement.textContent = title;

    const descriptionElement = document.createElement("p");
    descriptionElement.className = "journey-seam__description";
    descriptionElement.textContent = description;

    const line = document.createElement("span");
    line.className = "journey-seam__line";

    copy.append(labelElement, titleElement, descriptionElement);
    overlay.append(copy, line);
    document.body.appendChild(overlay);

    overlay.__journeyCopy = copy;
    return overlay;
  }

  function createSeamController({
    trigger,
    overlay,
    revealStart,
    revealEnd,
    fadeAfterViewport,
  }) {
    return {
      trigger,
      overlay,
      revealStart,
      revealEnd,
      fadeAfterViewport,
      lastStrength: -1,
    };
  }

  function startSeamTicker() {
    if (state.ticker) {
      return;
    }

    state.ticker = () => {
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const viewportHeight = Math.max(window.innerHeight, 1);

      state.seamControllers = state.seamControllers.filter((controller) => {
        const trigger = controller.trigger;
        const overlay = controller.overlay;

        if (!trigger || !overlay?.isConnected) {
          return false;
        }

        const progress = clamp(trigger.progress, 0, 1);
        const reveal = smoothstep(
          controller.revealStart,
          controller.revealEnd,
          progress,
        );

        const distancePastEnd = Math.max(0, scrollTop - trigger.end);
        const fadeDistance = viewportHeight * controller.fadeAfterViewport;
        const after = smoothstep(0, fadeDistance, distancePastEnd);

        const strength = clamp(reveal * (1 - after), 0, 1);

        if (Math.abs(strength - controller.lastStrength) > 0.002) {
          renderSeam(overlay, strength);
          controller.lastStrength = strength;
        }

        return true;
      });
    };

    state.gsap.ticker.add(state.ticker);
  }

  function stopSeamTicker() {
    if (!state.ticker || !state.gsap) {
      return;
    }

    state.gsap.ticker.remove(state.ticker);
    state.ticker = null;
    state.seamControllers = [];
  }

  function renderSeam(overlay, strength) {
    const copy = overlay.__journeyCopy;
    const eased = smoothstep(0, 1, strength);
    const copyProgress = smoothstep(0.2, 0.94, strength);

    overlay.style.visibility = strength > 0.001 ? "visible" : "hidden";
    overlay.style.opacity = String(eased);
    overlay.style.clipPath = `inset(${(1 - eased) * 100}% 0 0 0)`;

    if (copy) {
      copy.style.opacity = String(copyProgress);
      copy.style.transform =
        `translate3d(0, ${(1 - copyProgress) * 46}px, 0) ` +
        `scale(${0.975 + copyProgress * 0.025})`;
    }
  }

  async function waitForPinnedTrigger(section, timeoutMs) {
    const startedAt = performance.now();

    while (performance.now() - startedAt < timeoutMs) {
      const match = state.ScrollTrigger
        .getAll()
        .find((trigger) => trigger.trigger === section && Boolean(trigger.pin));

      if (match) {
        return match;
      }

      await nextFrame();
    }

    console.warn(
      "Home scroll journey: the existing pinned trigger was not found for",
      section,
    );

    return null;
  }

  function setupRefreshes(elements) {
    const refresh = () => {
      syncNavigationHeight(elements.nav);
      queueRefresh(120);
    };

    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("orientationchange", refresh, { passive: true });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => queueRefresh(100)).catch(() => {});
    }

    window.addEventListener(
      "load",
      () => {
        queueRefresh(80);
        queueRefresh(600);
        queueRefresh(1800);
      },
      { once: true },
    );

    if ("ResizeObserver" in window) {
      state.resizeObserver = new ResizeObserver(() => {
        syncNavigationHeight(elements.nav);
      });

      if (elements.nav) {
        state.resizeObserver.observe(elements.nav);
      }
    }
  }

  function queueRefresh(delay) {
    const timer = window.setTimeout(() => {
      state.ScrollTrigger?.sort();
      state.ScrollTrigger?.refresh(true);
    }, delay);

    state.refreshTimers.push(timer);
  }

  function syncNavigationHeight(nav) {
    const height = nav ? Math.round(nav.getBoundingClientRect().height) : 64;

    document.documentElement.style.setProperty(
      "--journey-nav-height",
      `${Math.max(height, 0)}px`,
    );
  }

  function clearJourneyInlineStyles(elements) {
    if (!state.gsap) {
      return;
    }

    const targets = [
      elements.hero,
      elements.heroLeft,
      elements.heroRight,
      ...(elements.heroLeft ? Array.from(elements.heroLeft.children) : []),
      elements.section3Copy,
      elements.section3Search,
      elements.section3Library,
    ].filter(Boolean);

    state.gsap.set(targets, {
      clearProps:
        "opacity,visibility,transform,translate,scale,x,y," +
        "--journey-hero-drift",
    });
  }

  function removeAllSeams() {
    stopSeamTicker();

    document.querySelectorAll(".journey-seam").forEach((seam) => seam.remove());
  }

  function destroy() {
    stopSeamTicker();
    removeAllSeams();

    state.matchMedia?.revert();
    state.matchMedia = null;

    state.refreshTimers.forEach((timer) => window.clearTimeout(timer));
    state.refreshTimers = [];

    state.resizeObserver?.disconnect();
    state.resizeObserver = null;

    document.body.classList.remove("journey-ready");
    window.__inkwellHomeJourneyStarted = false;
  }

  function nextFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(resolve));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothstep(edge0, edge1, value) {
    if (edge0 === edge1) {
      return value >= edge1 ? 1 : 0;
    }

    const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return x * x * (3 - 2 * x);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();