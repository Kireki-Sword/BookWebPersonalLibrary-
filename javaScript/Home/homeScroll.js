/* ============================================================================
   INKWELL — ONE MASTER PINNED HOME-PAGE JOURNEY

   REQUIRED SCRIPT ORDER
   1. Supabase
   2. GSAP
   3. ScrollTrigger
   4. homeScroll.js                 <-- this file
   5. section-1.js
   6. changeCardSection1.js
   7. section-2.js
   8. section-3.js
   9. section-4.js

   Why this order matters:
   - GSAP must exist before this file runs.
   - This file must set __INKWELL_MASTER_JOURNEY__ before Section 2 and
     Section 4 execute, so those files export ordinary paused timelines instead
     of creating their own pinned ScrollTriggers.
   - The exported timelines are then placed inside one parent timeline.
   - Only the parent timeline owns a ScrollTrigger and pin.
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
    shell: "[data-home-journey-shell]",
    stage: "[data-home-journey-stage]",
  };

  const hasLibraries = Boolean(window.gsap && window.ScrollTrigger);
  const isDesktopJourney =
    hasLibraries && window.matchMedia(DESKTOP_QUERY).matches;

  /*
   * This flag is read synchronously by section-1.js, section-2.js and
   * section-4.js. On smaller screens it stays false, so their original
   * standalone behavior remains available.
   */
  window.__INKWELL_MASTER_JOURNEY__ = isDesktopJourney;

  if (!isDesktopJourney) {
    return;
  }

  document.body?.classList.add("journey-preparing");

  const state = {
    gsap: window.gsap,
    ScrollTrigger: window.ScrollTrigger,
    master: null,
    trigger: null,
    shell: null,
    stage: null,
    createdWrapper: false,
    originalParent: null,
    originalReference: null,
    refreshTimers: [],
    resizeObserver: null,
    activeScene: "",
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

    const { gsap, ScrollTrigger } = state;

    if (!gsap || !ScrollTrigger) {
      failToNaturalLayout("GSAP or ScrollTrigger is missing.");
      return;
    }

    const elements = collectElements();

    if (
      !elements.hero ||
      !elements.section2 ||
      !elements.section3 ||
      !elements.section4
    ) {
      failToNaturalLayout("One or more homepage sections are missing.");
      return;
    }

    window.__inkwellMasterJourneyStarted = true;
    gsap.registerPlugin(ScrollTrigger);
    syncNavHeight(elements.nav);

    /*
     * Section 2 publishes immediately. Section 4 publishes after its Supabase
     * covers are ready. Waiting here is intentional: the master must receive
     * the real Section 4 timeline, not a second independent pin.
     */
    const [section2Api, section4Api] = await Promise.all([
      waitForSectionApi({
        current: () => window.InkwellSection2Journey,
        eventName: "inkwell:section2-ready",
        timeoutMs: 8000,
      }),
      waitForSection4Api(30000),
    ]);

    if (!section2Api?.timeline) {
      section2Api?.showStatic?.();
      section4Api?.showStatic?.();
      failToNaturalLayout(
        "Section 2 did not publish its managed animation timeline.",
      );
      return;
    }

    buildMasterJourney(elements, section2Api, section4Api);
    setupRefreshes(elements, section2Api, section4Api);

    window.InkwellHomeJourney = {
      refresh: () => ScrollTrigger.refresh(true),
      destroy: () => destroy(elements, section2Api, section4Api),
      debug: () => ({
        managedMode: window.__INKWELL_MASTER_JOURNEY__ === true,
        masterReady: Boolean(state.master),
        masterDuration: state.master?.duration() || 0,
        pinReady: Boolean(state.trigger),
        pinCount: ScrollTrigger.getAll().filter((item) => item.pin).length,
        section2Timeline: Boolean(section2Api?.timeline),
        section4Timeline: Boolean(section4Api?.timeline),
        activeScene: state.activeScene,
      }),
    };

    window.dispatchEvent(
      new CustomEvent("inkwell:home-journey-ready", {
        detail: window.InkwellHomeJourney,
      }),
    );
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

  function waitForSection4Api(timeoutMs) {
    const existing = window.InkwellSection4Journey;

    if (existing?.timeline || existing?.showStatic) {
      return Promise.resolve(existing);
    }

    if (existing?.ready) {
      return Promise.race([
        existing.ready,
        delay(timeoutMs).then(() => window.InkwellSection4Journey || null),
      ]);
    }

    return waitForSectionApi({
      current: () => window.InkwellSection4Journey,
      eventName: "inkwell:section4-ready",
      timeoutMs,
    });
  }

  function waitForSectionApi({ current, eventName, timeoutMs }) {
    const existing = current();

    if (existing?.timeline || existing?.showStatic) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve) => {
      let finished = false;

      const finish = (value) => {
        if (finished) return;
        finished = true;
        window.removeEventListener(eventName, onReady);
        window.clearTimeout(timer);
        resolve(value || current() || null);
      };

      const onReady = (event) => finish(event.detail);
      const timer = window.setTimeout(() => finish(current()), timeoutMs);

      window.addEventListener(eventName, onReady, { once: true });
    });
  }

  function buildMasterJourney(elements, section2Api, section4Api) {
    const { gsap, ScrollTrigger } = state;

    teardownMaster(false);
    ensureSharedStage(elements);
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

    const section2Timeline = section2Api.timeline;
    const section4Timeline = section4Api?.timeline || null;
    const section3Timeline = createSection3Timeline(elements);

    section2Api.reset?.();
    section2Timeline.pause(0);
    section2Timeline.timeScale(1);
    section2Timeline.paused(false);

    if (section4Timeline) {
      elements.section4.classList.remove("is-static");
      section4Timeline.pause(0);
      section4Timeline.timeScale(1);
      section4Timeline.paused(false);
    } else {
      section4Api?.showStatic?.();
    }

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

    const master = gsap.timeline({
      defaults: { ease: "none" },
      paused: true,
      onUpdate: syncActiveScene,
    });

    state.master = master;

    /* SECTION 1 ---------------------------------------------------------- */
    master.addLabel("section-1-start", 0);
    master.to({}, { duration: 1.05 });

    const heroChildren = elements.heroLeft
      ? gsap.utils.toArray(elements.heroLeft.children)
      : [];

    master.to(heroChildren, {
      autoAlpha: 0,
      y: -68,
      stagger: 0.035,
      duration: 0.72,
      ease: "power2.inOut",
    });

    if (elements.heroRight) {
      master.to(
        elements.heroRight,
        {
          autoAlpha: 0,
          xPercent: 10,
          yPercent: -4,
          scale: 0.94,
          duration: 0.78,
          ease: "power2.inOut",
        },
        "<-0.62",
      );
    }

    master.set(elements.section2, { pointerEvents: "auto" });
    master.to(
      elements.section2,
      {
        autoAlpha: 1,
        duration: 0.55,
        ease: "power2.inOut",
      },
      "<-0.28",
    );
    master.to(
      elements.hero,
      {
        autoAlpha: 0,
        duration: 0.55,
        ease: "power2.inOut",
      },
      "<",
    );
    master.set(elements.hero, { pointerEvents: "none" });

    /* SECTION 2 ---------------------------------------------------------- */
    master.addLabel("section-2-start");
    master.add(section2Timeline);
    master.addLabel("section-2-end");

    const section2ExitTargets = [
      elements.section2,
      ...(section2Api.externalElements || []),
    ];

    master.set(elements.section3, { pointerEvents: "auto" });
    master.to(section2ExitTargets, {
      autoAlpha: 0,
      y: -36,
      duration: 0.62,
      ease: "power2.inOut",
    });
    master.to(
      elements.section3,
      {
        autoAlpha: 1,
        duration: 0.58,
        ease: "power2.inOut",
      },
      "<-0.48",
    );
    master.set(elements.section2, { pointerEvents: "none" });

    /* SECTION 3 ---------------------------------------------------------- */
    master.addLabel("section-3-start");
    master.add(section3Timeline);
    master.addLabel("section-3-end");

    master.set(elements.section4, { pointerEvents: "auto" });
    master.to(
      [
        elements.section3Copy,
        elements.section3Search,
        elements.section3Library,
      ].filter(Boolean),
      {
        autoAlpha: 0,
        y: -42,
        scale: 0.97,
        duration: 0.68,
        stagger: 0.035,
        ease: "power2.inOut",
      },
    );
    master.to(
      elements.section4,
      {
        autoAlpha: 1,
        duration: 0.62,
        ease: "power2.inOut",
      },
      "<-0.52",
    );
    master.to(
      elements.section3,
      {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.inOut",
      },
      "<",
    );
    master.set(elements.section3, { pointerEvents: "none" });

    /* SECTION 4 ---------------------------------------------------------- */
    master.addLabel("section-4-start");

    if (section4Timeline) {
      master.add(section4Timeline);
    } else {
      master.to({}, { duration: 6.5 });
    }

    master.addLabel("section-4-end");
    master.to({}, { duration: 1.1 });

    state.trigger = ScrollTrigger.create({
      id: "inkwell-one-master-journey",
      trigger: state.shell,
      animation: master,
      start: () => `top top+=${getNavHeight(elements.nav)}`,
      end: () => {
        const distance = Math.max(
          master.duration() * 500,
          window.innerHeight * 17,
          15000,
        );

        return `+=${Math.round(distance)}`;
      },
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

    document.body.classList.remove("journey-preparing");
    document.body.classList.add("journey-ready");

    master.pause(0);
    syncActiveScene();

    ScrollTrigger.sort();
    queueRefresh(80);
    queueRefresh(500);
    queueRefresh(1600);
  }

  function createSection3Timeline(elements) {
    const { gsap } = state;
    const copy = elements.section3Copy;
    const search = elements.section3Search;
    const library = elements.section3Library;

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      paused: true,
    });

    if (!copy || !search || !library) {
      timeline.to({}, { duration: 3.2 });
      timeline.paused(false);
      return timeline;
    }

    gsap.set(copy, { autoAlpha: 0, x: -84, y: 24 });
    gsap.set(search, {
      autoAlpha: 0,
      x: 88,
      y: 22,
      scale: 0.97,
    });
    gsap.set(library, {
      autoAlpha: 0,
      y: 90,
      scale: 0.975,
    });

    timeline
      .to(copy, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      })
      .to(
        search,
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.74,
          ease: "power3.out",
        },
        0.05,
      )
      .to(
        library,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.82,
          ease: "power3.out",
        },
        0.28,
      )
      .to({}, { duration: 1.7 })
      .to(copy, {
        x: -18,
        y: -8,
        duration: 0.42,
        ease: "power2.inOut",
      })
      .to(
        search,
        {
          x: 18,
          y: -8,
          duration: 0.42,
          ease: "power2.inOut",
        },
        "<",
      )
      .to(
        library,
        {
          y: -12,
          scale: 1.008,
          duration: 0.42,
          ease: "power2.inOut",
        },
        "<",
      )
      .to({}, { duration: 0.7 });

    timeline.paused(false);
    return timeline;
  }

  function ensureSharedStage(elements) {
    const existingShell = document.querySelector(SELECTORS.shell);
    const existingStage = document.querySelector(SELECTORS.stage);

    if (existingShell && existingStage) {
      state.shell = existingShell;
      state.stage = existingStage;
      return;
    }

    const parent = elements.hero.parentNode;
    const shell = document.createElement("div");
    const stage = document.createElement("div");

    state.createdWrapper = true;
    state.originalParent = parent;
    state.originalReference = elements.section4.nextSibling;

    shell.className = "home-journey-shell";
    shell.dataset.homeJourneyShell = "";

    stage.className = "home-journey-stage";
    stage.dataset.homeJourneyStage = "";

    parent.insertBefore(shell, elements.hero);
    shell.appendChild(stage);

    [
      elements.hero,
      elements.section2,
      elements.section3,
      elements.section4,
    ].forEach((section) => stage.appendChild(section));

    state.shell = shell;
    state.stage = stage;
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
      document.fonts.ready.then(() => queueRefresh(120)).catch(() => {});
    }

    if ("ResizeObserver" in window && elements.nav) {
      state.resizeObserver = new ResizeObserver(() => {
        syncNavHeight(elements.nav);
      });
      state.resizeObserver.observe(elements.nav);
    }
  }

  function queueRefresh(delayMs) {
    const timer = window.setTimeout(() => {
      state.ScrollTrigger?.sort();
      state.ScrollTrigger?.refresh(true);
    }, delayMs);

    state.refreshTimers.push(timer);
  }

  function failToNaturalLayout(message) {
    console.warn(`Inkwell master journey: ${message}`);
    window.__INKWELL_MASTER_JOURNEY__ = false;
    window.__inkwellMasterJourneyStarted = false;
    document.body?.classList.remove("journey-preparing", "journey-ready");
  }

  function teardownMaster(restoreWrapper) {
    state.trigger?.kill(true);
    state.trigger = null;

    state.master?.kill();
    state.master = null;
    state.activeScene = "";

    if (restoreWrapper) {
      restoreOriginalStructure();
    }
  }

  function restoreOriginalStructure() {
    if (!state.createdWrapper || !state.stage || !state.originalParent) {
      return;
    }

    const sections = Array.from(state.stage.children);
    const reference =
      state.originalReference?.parentNode === state.originalParent
        ? state.originalReference
        : null;

    sections.forEach((section) => {
      state.originalParent.insertBefore(section, reference);
    });

    state.shell?.remove();
    state.shell = null;
    state.stage = null;
    state.createdWrapper = false;
  }

  function destroy(elements, section2Api, section4Api) {
    teardownMaster(true);

    state.refreshTimers.forEach((timer) => window.clearTimeout(timer));
    state.refreshTimers = [];

    state.resizeObserver?.disconnect();
    state.resizeObserver = null;

    const scenes = [
      elements.hero,
      elements.section2,
      elements.section3,
      elements.section4,
    ];

    state.gsap.set(scenes, {
      clearProps:
        "opacity,visibility,transform,pointerEvents,zIndex,x,y,scale",
    });

    scenes.forEach((scene) => {
      scene.classList.remove("journey-scene", "is-journey-active");
      scene.removeAttribute("aria-hidden");
      delete scene.dataset.journeyScene;
    });

    section2Api?.showStatic?.();
    section4Api?.showStatic?.();

    document.body.classList.remove("journey-preparing", "journey-ready");
    window.__INKWELL_MASTER_JOURNEY__ = false;
    window.__inkwellMasterJourneyStarted = false;
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

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
})();