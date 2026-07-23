/* ============================================================================
   INKWELL — ONE MASTER PINNED HOME-PAGE JOURNEY

   IMPORTANT LOAD ORDER
   1. this file (sets managed mode immediately)
   2. section-1.js / changeCardSection1.js
   3. GSAP
   4. ScrollTrigger
   5. section-2.js / section-3.js / section-4.js

   This file sets the managed-mode flag immediately. Section 2 and Section 4
   then build ordinary paused GSAP timelines instead of making their own pins.
   After the DOM and Section 4 data are ready, this file nests every scene into
   one scrubbed master timeline and creates exactly one ScrollTrigger pin.
   ============================================================================ */

(() => {
  "use strict";

  const DESKTOP_QUERY =
    "(min-width: 1100px) and (min-height: 820px) and " +
    "(prefers-reduced-motion: no-preference)";

  /*
   * This line must execute before section-2.js and section-4.js.
   * It prevents those files from creating independent pinned ScrollTriggers.
   */
  window.__INKWELL_MASTER_JOURNEY__ = true;

  /*
   * The script is deferred, so the body already exists when this runs.
   * Preparing mode gives Section 2 and Section 4 their final viewport geometry
   * before either file builds its managed timeline.
   */
  if (window.matchMedia(DESKTOP_QUERY).matches) {
    document.body?.classList.add("journey-preparing");
  }

  const SELECTORS = {
    nav: "nav",
    hero: ".hero",
    heroLeft: ".hero-left",
    heroRight: ".hero-right",
    section2: "#section-2-empty-shelf",
    section3: "#section-3-library-flow",
    section4: "#section-4",
  };

  const state = {
    gsap: null,
    ScrollTrigger: null,
    media: null,
    master: null,
    masterTrigger: null,
    shell: null,
    stage: null,
    originalParent: null,
    originalNextSibling: null,
    createdStageDynamically: false,
    refreshTimers: [],
    resizeObserver: null,
    activeScene: null,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  async function init() {
    if (window.__inkwellMasterJourneyStarted) {
      return;
    }

    const { gsap, ScrollTrigger } = window;

    if (!gsap || !ScrollTrigger) {
      console.warn(
        "Inkwell master journey: GSAP or ScrollTrigger is missing.",
      );
      document.body?.classList.remove("journey-preparing");
      return;
    }

    const elements = collectElements();

    if (
      !elements.hero ||
      !elements.section2 ||
      !elements.section3 ||
      !elements.section4
    ) {
      console.warn(
        "Inkwell master journey: one or more home sections are missing.",
        elements,
      );
      document.body?.classList.remove("journey-preparing");
      return;
    }

    window.__inkwellMasterJourneyStarted = true;

    state.gsap = gsap;
    state.ScrollTrigger = ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);
    syncNavHeight(elements.nav);

    const [section2Api, section4Api] = await Promise.all([
      waitForSection2Api(5000),
      waitForSection4Api(20000),
    ]);

    if (!section2Api?.timeline) {
      console.warn(
        "Inkwell master journey: Section 2 did not provide a managed timeline.",
      );
      document.body?.classList.remove("journey-preparing");
      return;
    }

    state.media = gsap.matchMedia();

    state.media.add(
      {
        cinematic: DESKTOP_QUERY,
        fallback:
          "(max-width: 1099px), (max-height: 819px), " +
          "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        if (context.conditions.fallback) {
          showNaturalFallback(elements, section2Api, section4Api);
          return undefined;
        }

        return buildCinematicJourney(
          elements,
          section2Api,
          section4Api,
        );
      },
    );

    setupRefreshes(elements, section2Api, section4Api);

    window.InkwellHomeJourney = {
      refresh: () => ScrollTrigger.refresh(true),
      destroy,
    };
  }

  function collectElements() {
    const section3 = document.querySelector(SELECTORS.section3);

    return {
      nav: document.querySelector(SELECTORS.nav),
      hero: document.querySelector(SELECTORS.hero),
      heroLeft: document.querySelector(SELECTORS.heroLeft),
      heroRight: document.querySelector(SELECTORS.heroRight),
      section2: document.querySelector(SELECTORS.section2),
      section3,
      section4: document.querySelector(SELECTORS.section4),
      section3Copy: section3?.querySelector(".flow-copy-card") || null,
      section3Search: section3?.querySelector(".flow-search-card") || null,
      section3Library: section3?.querySelector(".flow-library-card") || null,
    };
  }

  function waitForSection2Api(timeoutMs) {
    if (window.InkwellSection2Journey) {
      return Promise.resolve(window.InkwellSection2Journey);
    }

    return waitForWindowEvent(
      "inkwell:section2-ready",
      timeoutMs,
      () => window.InkwellSection2Journey,
    );
  }

  function waitForSection4Api(timeoutMs) {
    const existing = window.InkwellSection4Journey;

    if (existing?.timeline || existing?.showStatic) {
      return Promise.resolve(existing);
    }

    if (existing?.ready) {
      return withTimeout(existing.ready, timeoutMs, null);
    }

    return waitForWindowEvent(
      "inkwell:section4-ready",
      timeoutMs,
      () => window.InkwellSection4Journey,
    );
  }

  function waitForWindowEvent(name, timeoutMs, fallbackGetter) {
    return new Promise((resolve) => {
      let settled = false;

      const finish = (value) => {
        if (settled) return;
        settled = true;
        window.removeEventListener(name, onReady);
        window.clearTimeout(timer);
        resolve(value);
      };

      const onReady = (event) => {
        finish(event.detail || fallbackGetter?.() || null);
      };

      const timer = window.setTimeout(() => {
        finish(fallbackGetter?.() || null);
      }, timeoutMs);

      window.addEventListener(name, onReady, { once: true });
    });
  }

  function withTimeout(promise, timeoutMs, fallbackValue) {
    return Promise.race([
      promise,
      new Promise((resolve) => {
        window.setTimeout(() => resolve(fallbackValue), timeoutMs);
      }),
    ]);
  }

  function buildCinematicJourney(elements, section2Api, section4Api) {
    const { gsap, ScrollTrigger } = state;

    teardownMaster(false);
    createStage(elements);
    syncNavHeight(elements.nav);

    const scenes = [
      elements.hero,
      elements.section2,
      elements.section3,
      elements.section4,
    ];

    scenes.forEach((scene, index) => {
      scene.classList.add("journey-scene");
      scene.dataset.journeyScene = String(index + 1);
    });

    document.body.classList.remove("journey-preparing");
    document.body.classList.add("journey-ready");

    gsap.set(scenes, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set(elements.hero, {
      autoAlpha: 1,
      pointerEvents: "auto",
      zIndex: 4,
    });

    gsap.set(elements.section2, { zIndex: 3 });
    gsap.set(elements.section3, { zIndex: 2 });
    gsap.set(elements.section4, { zIndex: 1 });

    const section2Timeline = section2Api.timeline;
    section2Api.reset?.();
    section2Timeline.pause(0);
    section2Timeline.duration(7.25);
    section2Timeline.paused(false);

    let section4Timeline = section4Api?.timeline || null;

    if (section4Timeline) {
      elements.section4.classList.remove("is-static");
      section4Timeline.pause(0);
      section4Timeline.duration(4.3);
      section4Timeline.paused(false);
    }

    const master = gsap.timeline({
      defaults: {
        ease: "none",
      },
      onUpdate: syncActiveScene,
    });

    state.master = master;

    /* ----------------------------------------------------------------------
       SECTION 1
       ---------------------------------------------------------------------- */

    master.addLabel("section-1-start", 0);
    master.to({}, { duration: 0.72 });

    const heroChildren = elements.heroLeft
      ? gsap.utils.toArray(elements.heroLeft.children)
      : [];

    master.to(
      heroChildren,
      {
        autoAlpha: 0,
        y: -68,
        stagger: 0.026,
        duration: 0.48,
        ease: "power2.inOut",
      },
    );

    if (elements.heroRight) {
      master.to(
        elements.heroRight,
        {
          autoAlpha: 0,
          xPercent: 9,
          yPercent: -3,
          scale: 0.95,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "<-0.42",
      );
    }

    master.set(elements.section2, {
      pointerEvents: "auto",
    });

    master.fromTo(
      elements.section2,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: 0.36,
        ease: "power2.inOut",
        immediateRender: false,
      },
      "<0.18",
    );

    master.to(
      elements.hero,
      {
        autoAlpha: 0,
        duration: 0.36,
        ease: "power2.inOut",
      },
      "<",
    );

    /* ----------------------------------------------------------------------
       SECTION 2
       ---------------------------------------------------------------------- */

    master.addLabel("section-2-start");
    master.add(section2Timeline);
    master.addLabel("section-2-end");

    const section2ExitTargets = [
      elements.section2,
      ...(section2Api.externalElements || []),
    ];

    master.to(section2ExitTargets, {
      autoAlpha: 0,
      y: -34,
      duration: 0.48,
      ease: "power2.inOut",
    });

    master.set(
      elements.section3,
      {
        pointerEvents: "auto",
      },
      "<-0.30",
    );

    master.fromTo(
      elements.section3,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: 0.38,
        ease: "power2.inOut",
        immediateRender: false,
      },
      "<-0.30",
    );

    master.set(elements.section2, {
      pointerEvents: "none",
    });

    /* ----------------------------------------------------------------------
       SECTION 3
       ---------------------------------------------------------------------- */

    master.addLabel("section-3-start");

    const section3Timeline = createSection3Timeline(elements);
    master.add(section3Timeline);
    master.addLabel("section-3-end");

    master.to(
      [
        elements.section3Copy,
        elements.section3Search,
        elements.section3Library,
      ].filter(Boolean),
      {
        autoAlpha: 0,
        y: -62,
        scale: 0.97,
        duration: 0.5,
        ease: "power2.inOut",
      },
    );

    master.set(
      elements.section4,
      {
        pointerEvents: "auto",
      },
      "<-0.32",
    );

    master.fromTo(
      elements.section4,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: 0.40,
        ease: "power2.inOut",
        immediateRender: false,
      },
      "<-0.32",
    );

    master.to(
      elements.section3,
      {
        autoAlpha: 0,
        duration: 0.36,
        ease: "power2.inOut",
      },
      "<",
    );

    master.set(elements.section3, {
      pointerEvents: "none",
    });

    /* ----------------------------------------------------------------------
       SECTION 4
       ---------------------------------------------------------------------- */

    master.addLabel("section-4-start");

    if (section4Timeline) {
      master.add(section4Timeline);
    } else {
      section4Api?.showStatic?.();
      master.to({}, { duration: 4.3 });
    }

    master.addLabel("section-4-end");
    master.to({}, { duration: 0.8 });

    state.masterTrigger = ScrollTrigger.create({
      id: "inkwell-one-master-journey",
      trigger: state.shell,
      start: () => {
        const navHeight = getNavHeight(elements.nav);
        return `top top+=${navHeight}`;
      },
      end: () => {
        const distance = Math.max(
          master.duration() * 900,
          window.innerHeight * 13.5,
          11800,
        );

        return `+=${Math.round(distance)}`;
      },
      animation: master,
      pin: state.shell,
      pinSpacing: true,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 100,
      onRefreshInit: () => {
        syncNavHeight(elements.nav);
        section2Api.refresh?.();
        section4Api?.refresh?.();
      },
      onUpdate: syncActiveScene,
    });

    syncActiveScene();

    ScrollTrigger.sort();
    queueRefresh(80);
    queueRefresh(500);
    queueRefresh(1600);

    return () => {
      teardownMaster(true);
      section2Api.timeline?.pause(0);
      section4Api?.timeline?.pause(0);
      showNaturalFallback(elements, section2Api, section4Api);
    };
  }

  function createSection3Timeline(elements) {
    const { gsap } = state;

    const copy = elements.section3Copy;
    const search = elements.section3Search;
    const library = elements.section3Library;

    const timeline = gsap.timeline({
      defaults: {
        ease: "none",
      },
    });

    if (!copy || !search || !library) {
      return timeline.to({}, { duration: 2.8 });
    }

    timeline
      .fromTo(
        copy,
        {
          autoAlpha: 0,
          x: -82,
          y: 24,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          immediateRender: false,
        },
        0,
      )
      .fromTo(
        search,
        {
          autoAlpha: 0,
          x: 86,
          y: 22,
          scale: 0.97,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.54,
          ease: "power3.out",
          immediateRender: false,
        },
        0.04,
      )
      .fromTo(
        library,
        {
          autoAlpha: 0,
          y: 88,
          scale: 0.975,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
          ease: "power3.out",
          immediateRender: false,
        },
        0.2,
      )
      .to({}, { duration: 1.45 })
      .to(
        copy,
        {
          x: -22,
          y: -8,
          duration: 0.34,
          ease: "power2.inOut",
        },
      )
      .to(
        search,
        {
          x: 18,
          y: -8,
          duration: 0.34,
          ease: "power2.inOut",
        },
        "<",
      )
      .to(
        library,
        {
          y: -12,
          scale: 1.008,
          duration: 0.34,
          ease: "power2.inOut",
        },
        "<",
      )
      .to({}, { duration: 0.55 });

    timeline.duration(2.8);
    return timeline;
  }

  function createStage(elements) {
    if (state.shell?.isConnected && state.stage?.isConnected) {
      return;
    }

    const existingShell = document.querySelector(
      "[data-home-journey-shell]",
    );
    const existingStage = document.querySelector(
      "[data-home-journey-stage]",
    );

    if (existingShell && existingStage) {
      state.shell = existingShell;
      state.stage = existingStage;
      state.createdStageDynamically = false;
      return;
    }

    const firstScene = elements.hero;
    const parent = firstScene.parentNode;

    state.originalParent = parent;
    state.originalNextSibling = elements.section4.nextSibling;
    state.createdStageDynamically = true;

    const shell = document.createElement("div");
    shell.className = "home-journey-shell";
    shell.dataset.homeJourneyShell = "";

    const stage = document.createElement("div");
    stage.className = "home-journey-stage";
    stage.dataset.homeJourneyStage = "";

    parent.insertBefore(shell, firstScene);
    shell.appendChild(stage);

    [
      elements.hero,
      elements.section2,
      elements.section3,
      elements.section4,
    ].forEach((scene) => stage.appendChild(scene));

    state.shell = shell;
    state.stage = stage;
  }

  function restoreOriginalStructure() {
    if (!state.shell?.isConnected || !state.stage?.isConnected) {
      return;
    }

    const scenes = Array.from(
      state.stage.querySelectorAll(":scope > section"),
    );

    scenes.forEach((scene) => {
      scene.classList.remove("journey-scene", "is-journey-active");
      delete scene.dataset.journeyScene;
      scene.removeAttribute("aria-hidden");
    });

    if (!state.createdStageDynamically || !state.originalParent) {
      return;
    }

    const reference =
      state.originalNextSibling?.parentNode === state.originalParent
        ? state.originalNextSibling
        : null;

    scenes.forEach((scene) => {
      state.originalParent.insertBefore(scene, reference);
    });

    state.shell.remove();
    state.shell = null;
    state.stage = null;
    state.createdStageDynamically = false;
  }

  function syncActiveScene() {
    const master = state.master;

    if (!master) return;

    const time = master.time();
    const labels = master.labels;

    let active = "section-1";

    if (time >= (labels["section-4-start"] ?? Infinity)) {
      active = "section-4";
    } else if (time >= (labels["section-3-start"] ?? Infinity)) {
      active = "section-3";
    } else if (time >= (labels["section-2-start"] ?? Infinity)) {
      active = "section-2";
    }

    if (active === state.activeScene) {
      return;
    }

    state.activeScene = active;

    document.querySelectorAll(".journey-scene").forEach((scene) => {
      const isActive =
        (active === "section-1" && scene.matches(SELECTORS.hero)) ||
        (active === "section-2" && scene.matches(SELECTORS.section2)) ||
        (active === "section-3" && scene.matches(SELECTORS.section3)) ||
        (active === "section-4" && scene.matches(SELECTORS.section4));

      scene.classList.toggle("is-journey-active", isActive);
      scene.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  }

  function showNaturalFallback(elements, section2Api, section4Api) {
    teardownMaster(true);
    restoreOriginalStructure();

    document.body.classList.remove(
      "journey-ready",
      "journey-preparing",
    );

    const scenes = [
      elements.hero,
      elements.section2,
      elements.section3,
      elements.section4,
    ];

    state.gsap?.set(scenes, {
      clearProps:
        "opacity,visibility,transform,pointerEvents,zIndex,x,y,scale",
    });

    section2Api?.showStatic?.();
    section4Api?.showStatic?.();
  }

  function teardownMaster(restoreStructure) {
    state.masterTrigger?.kill(true);
    state.masterTrigger = null;

    state.master?.kill();
    state.master = null;
    state.activeScene = null;

    if (restoreStructure) {
      restoreOriginalStructure();
    }
  }

  function setupRefreshes(elements, section2Api, section4Api) {
    const refresh = () => {
      syncNavHeight(elements.nav);
      section2Api?.refresh?.();
      section4Api?.refresh?.();
      queueRefresh(120);
    };

    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("orientationchange", refresh, { passive: true });

    window.addEventListener(
      "load",
      () => {
        queueRefresh(80);
        queueRefresh(650);
        queueRefresh(1800);
      },
      { once: true },
    );

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => queueRefresh(120))
        .catch(() => {});
    }

    if ("ResizeObserver" in window && elements.nav) {
      state.resizeObserver = new ResizeObserver(() => {
        syncNavHeight(elements.nav);
      });

      state.resizeObserver.observe(elements.nav);
    }
  }

  function queueRefresh(delay) {
    const timer = window.setTimeout(() => {
      state.ScrollTrigger?.sort();
      state.ScrollTrigger?.refresh(true);
    }, delay);

    state.refreshTimers.push(timer);
  }

  function getNavHeight(nav) {
    return nav
      ? Math.max(0, Math.round(nav.getBoundingClientRect().height))
      : 64;
  }

  function syncNavHeight(nav) {
    document.documentElement.style.setProperty(
      "--journey-nav-height",
      `${getNavHeight(nav)}px`,
    );
  }

  function destroy() {
    state.media?.revert();
    state.media = null;

    teardownMaster(true);

    state.refreshTimers.forEach((timer) => window.clearTimeout(timer));
    state.refreshTimers = [];

    state.resizeObserver?.disconnect();
    state.resizeObserver = null;

    document.body.classList.remove(
      "journey-ready",
      "journey-preparing",
    );
    window.__inkwellMasterJourneyStarted = false;
  }
})();