/* ============================================================================
   INKWELL — ONE MASTER PINNED HOME-PAGE JOURNEY (V2)

   REQUIRED SCRIPT ORDER
   1. Supabase
   2. GSAP
   3. ScrollTrigger
   4. homeScroll.js
   5. section-1.js
   6. changeCardSection1.js
   7. section-2.js
   8. section-3.js
   9. section-4.js

   Desktop behavior:
   - one pinned shell beneath the navbar
   - wheel/trackpad movement advances one reversible master timeline
   - Sections 2 and 4 keep their original internal timelines
   - long crossfades connect all four scenes without normal page movement
   ============================================================================ */

(() => {
  "use strict";

  const DESKTOP_QUERY =
    "(min-width: 1100px) and (min-height: 700px) and " +
    "(prefers-reduced-motion: no-preference)";

  const SCROLL_PIXELS_PER_TIMELINE_SECOND = 540;
  const TRANSITION_DURATION = 2.25;

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

  window.__INKWELL_MASTER_JOURNEY__ = isDesktopJourney;

  if (!isDesktopJourney) {
    return;
  }

  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  } catch (_) {
    // Some embedded browsers do not allow this assignment.
  }

  window.scrollTo(0, 0);
  document.body?.classList.add("journey-preparing");

  const state = {
    gsap: window.gsap,
    ScrollTrigger: window.ScrollTrigger,
    master: null,
    trigger: null,
    shell: null,
    stage: null,
    transitionLayer: null,
    heroIntro: null,
    createdWrapper: false,
    originalParent: null,
    originalReference: null,
    resizeTimer: null,
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
    ensureSharedStage(elements);
    prepareSceneStack(elements);
    playHeroIntro(elements);

    const [section2Api, section4Api] = await Promise.all([
      waitForSectionApi({
        current: () => window.InkwellSection2Journey,
        eventName: "inkwell:section2-ready",
        timeoutMs: 10000,
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

    await waitForFonts(1800);
    await nextFrame();
    await nextFrame();

    buildMasterJourney(elements, section2Api, section4Api);
    setupRefreshes(elements, section2Api, section4Api);

    window.InkwellHomeJourney = {
      refresh: () => refreshJourney(section2Api, section4Api),
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
        scrollY: window.scrollY,
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
      section2Header: document.querySelector(".section-2-header"),
      section2Card: document.querySelector("#section-2-empty-shelf .card-wrap"),
      section3Copy: section3?.querySelector(".flow-copy-card") || null,
      section3Search: section3?.querySelector(".flow-search-card") || null,
      section3Library: section3?.querySelector(".flow-library-card") || null,
      section4Copy:
        document.querySelector("#section-4 .s4-cinematic-copy") || null,
    };
  }

  function prepareSceneStack(elements) {
    const { gsap } = state;
    const scenes = getScenes(elements);

    scenes.forEach((scene, index) => {
      scene.classList.add("journey-scene");
      scene.dataset.journeyScene = String(index + 1);
    });

    gsap.set(scenes, {
      autoAlpha: 0,
      pointerEvents: "none",
      yPercent: 0,
      scale: 1,
    });

    gsap.set(elements.hero, {
      autoAlpha: 1,
      pointerEvents: "auto",
      zIndex: 4,
    });

    gsap.set(elements.section2, { zIndex: 3 });
    gsap.set(elements.section3, { zIndex: 2 });
    gsap.set(elements.section4, { zIndex: 1 });

    createTransitionLayer();
  }

  function playHeroIntro(elements) {
    const { gsap } = state;

    const heroItems = elements.heroLeft
      ? gsap.utils.toArray(elements.heroLeft.children)
      : [];

    gsap.killTweensOf([...heroItems, elements.heroRight].filter(Boolean));

    gsap.set(heroItems, {
      autoAlpha: 0,
      y: 22,
    });

    if (elements.heroRight) {
      gsap.set(elements.heroRight, {
        autoAlpha: 0,
        x: 34,
        y: -8,
        scale: 0.985,
      });
    }

    document.body.classList.add("journey-hero-mounted");

    state.heroIntro = gsap.timeline({
      defaults: {
        overwrite: "auto",
      },
    });

    state.heroIntro.to(heroItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.72,
      stagger: 0.09,
      ease: "power3.out",
    });

    if (elements.heroRight) {
      state.heroIntro.to(
        elements.heroRight,
        {
          autoAlpha: 1,
          x: 0,
          y: -8,
          scale: 1,
          duration: 0.86,
          ease: "power3.out",
        },
        0.24,
      );
    }
  }

  function buildMasterJourney(elements, section2Api, section4Api) {
    const { gsap, ScrollTrigger } = state;

    teardownMaster(false);
    syncNavHeight(elements.nav);
    window.scrollTo(0, 0);

    state.heroIntro?.progress(1).kill();
    state.heroIntro = null;

    const scenes = getScenes(elements);
    const heroItems = elements.heroLeft
      ? gsap.utils.toArray(elements.heroLeft.children)
      : [];

    gsap.set(heroItems, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
    });

    if (elements.heroRight) {
      gsap.set(elements.heroRight, {
        autoAlpha: 1,
        x: 0,
        y: -8,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
      });
    }

    const section2Timeline = section2Api.timeline;
    const section4Timeline = section4Api?.timeline || null;
    const section3Timeline = createSection3Timeline(elements);

    section2Api.reset?.();
    section2Timeline.pause(0);
    section2Timeline.timeScale(1);

    if (section4Timeline) {
      elements.section4.classList.remove("is-static");
      section4Timeline.pause(0);
      section4Timeline.timeScale(1);
    } else {
      section4Api?.showStatic?.();
    }

    gsap.set(scenes, {
      autoAlpha: 0,
      pointerEvents: "none",
      yPercent: 0,
      scale: 1,
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
    master.to({}, { duration: 1.45 });

    addSceneTransition(master, {
      name: "transition-1-2",
      outgoing: elements.hero,
      incoming: elements.section2,
      outgoingItems: [...heroItems, elements.heroRight].filter(Boolean),
      incomingItems: [elements.section2Header, elements.section2Card].filter(
        Boolean,
      ),
    });

    master.addLabel("section-2-start");
    master.to({}, { duration: 0.42 });
    attachChildTimeline(master, section2Timeline);
    master.addLabel("section-2-end");
    master.to({}, { duration: 0.5 });

    /* SECTION 2 -> 3 ----------------------------------------------------- */
    addSceneTransition(master, {
      name: "transition-2-3",
      outgoing: elements.section2,
      incoming: elements.section3,
      outgoingItems: section2Api.externalElements || [],
      incomingItems: [
        elements.section3Copy,
        elements.section3Search,
        elements.section3Library,
      ].filter(Boolean),
      outgoingLift: -28,
    });

    master.addLabel("section-3-start");
    master.to({}, { duration: 0.35 });
    attachChildTimeline(master, section3Timeline);
    master.addLabel("section-3-end");
    master.to({}, { duration: 0.55 });

    /* SECTION 3 -> 4 ----------------------------------------------------- */
    addSceneTransition(master, {
      name: "transition-3-4",
      outgoing: elements.section3,
      incoming: elements.section4,
      outgoingItems: [
        elements.section3Copy,
        elements.section3Search,
        elements.section3Library,
      ].filter(Boolean),
      incomingItems: [elements.section4Copy].filter(Boolean),
      outgoingLift: -34,
    });

    master.addLabel("section-4-start");
    master.to({}, { duration: 0.35 });

    if (section4Timeline) {
      attachChildTimeline(master, section4Timeline);
    } else {
      master.to({}, { duration: 6.5 });
    }

    master.addLabel("section-4-end");
    master.to({}, { duration: 1.25 });

    state.trigger = ScrollTrigger.create({
      id: "inkwell-one-master-journey-v2",
      trigger: state.shell,
      animation: master,
      start: () => `top top+=${getNavHeight(elements.nav)}`,
      end: () => {
        const distance = Math.max(
          master.duration() * SCROLL_PIXELS_PER_TIMELINE_SECOND,
          window.innerHeight * 18,
          16500,
        );

        return `+=${Math.round(distance)}`;
      },
      pin: state.shell,
      pinSpacing: true,
      scrub: 1.15,
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
    window.scrollTo(0, 0);
    syncActiveScene();

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      window.scrollTo(0, 0);
      state.trigger?.update();
    });
  }

  function addSceneTransition(
    master,
    {
      name,
      outgoing,
      incoming,
      outgoingItems = [],
      incomingItems = [],
      outgoingLift = -46,
    },
  ) {
    const { gsap } = state;
    const layer = state.transitionLayer;
    const transition = gsap.timeline({ defaults: { ease: "none" } });

    transition.addLabel(name, 0);

    transition.set(incoming, {
      visibility: "visible",
      pointerEvents: "none",
    });

    if (layer) {
      transition.set(layer, {
        autoAlpha: 0,
        yPercent: 16,
        scale: 1.08,
      });

      transition.to(
        layer,
        {
          autoAlpha: 0.78,
          yPercent: 0,
          scale: 1,
          duration: 0.82,
          ease: "power2.out",
        },
        0.08,
      );

      transition.to(
        layer,
        {
          autoAlpha: 0,
          yPercent: -13,
          scale: 1.045,
          duration: 1.02,
          ease: "power2.inOut",
        },
        1.08,
      );
    }

    if (outgoingItems.length) {
      transition.to(
        outgoingItems,
        {
          autoAlpha: 0,
          y: outgoingLift,
          duration: 1.2,
          stagger: 0.045,
          ease: "power2.inOut",
        },
        0.06,
      );
    }

    transition.to(
      outgoing,
      {
        autoAlpha: 0,
        yPercent: -2.4,
        scale: 0.982,
        duration: 1.62,
        ease: "power2.inOut",
      },
      0.12,
    );

    transition.fromTo(
      incoming,
      {
        autoAlpha: 0,
        yPercent: 7,
        scale: 1.025,
      },
      {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        duration: 1.7,
        ease: "power2.inOut",
        immediateRender: true,
      },
      0.28,
    );

    if (incomingItems.length) {
      transition.fromTo(
        incomingItems,
        {
          autoAlpha: 0,
          y: 42,
          scale: 0.985,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1.18,
          stagger: 0.08,
          ease: "power3.out",
          immediateRender: true,
        },
        0.54,
      );
    }

    transition.set(
      outgoing,
      {
        visibility: "hidden",
        pointerEvents: "none",
      },
      2.02,
    );

    transition.set(
      incoming,
      {
        pointerEvents: "auto",
      },
      2.02,
    );

    transition.to({}, { duration: TRANSITION_DURATION - 2.02 }, 2.02);
    master.add(transition);
  }

  function attachChildTimeline(master, timeline) {
    if (!timeline) {
      return;
    }

    timeline.pause(0);
    master.add(timeline);
    timeline.paused(false);
  }

  function createSection3Timeline(elements) {
    const { gsap } = state;
    const targets = [
      elements.section3Copy,
      elements.section3Search,
      elements.section3Library,
    ].filter(Boolean);

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      paused: true,
    });

    if (!targets.length) {
      timeline.to({}, { duration: 3.4 });
      return timeline;
    }

    timeline
      .to({}, { duration: 1.9 })
      .to(
        elements.section3Copy,
        {
          x: -12,
          y: -6,
          duration: 0.5,
          ease: "power2.inOut",
        },
      )
      .to(
        elements.section3Search,
        {
          x: 12,
          y: -6,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "<",
      )
      .to(
        elements.section3Library,
        {
          y: -9,
          scale: 1.006,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "<",
      )
      .to({}, { duration: 1.15 });

    return timeline;
  }

  function createTransitionLayer() {
    if (!state.stage) {
      return;
    }

    const existing = state.stage.querySelector(".journey-transition-layer");

    if (existing) {
      state.transitionLayer = existing;
      return;
    }

    const layer = document.createElement("div");
    layer.className = "journey-transition-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<span class="journey-transition-layer__glow"></span>';
    state.stage.appendChild(layer);
    state.transitionLayer = layer;
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

    getScenes(elements).forEach((section) => stage.appendChild(section));

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
      window.clearTimeout(state.resizeTimer);

      state.resizeTimer = window.setTimeout(() => {
        syncNavHeight(elements.nav);
        refreshJourney(section2Api, section4Api);
      }, 220);
    };

    window.addEventListener("resize", refresh, { passive: true });
    window.addEventListener("orientationchange", refresh, { passive: true });

    if ("ResizeObserver" in window && elements.nav) {
      state.resizeObserver = new ResizeObserver(() => {
        syncNavHeight(elements.nav);
      });
      state.resizeObserver.observe(elements.nav);
    }
  }

  function refreshJourney(section2Api, section4Api) {
    section2Api?.refresh?.();
    section4Api?.refresh?.();
    state.ScrollTrigger?.sort();
    state.ScrollTrigger?.refresh();
  }

  function failToNaturalLayout(message) {
    console.warn(`Inkwell master journey: ${message}`);
    window.__INKWELL_MASTER_JOURNEY__ = false;
    window.__inkwellMasterJourneyStarted = false;
    document.body?.classList.remove(
      "journey-preparing",
      "journey-ready",
      "journey-hero-mounted",
    );
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

    const sections = Array.from(state.stage.children).filter((child) =>
      child.matches?.("section"),
    );

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

    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = null;

    state.resizeObserver?.disconnect();
    state.resizeObserver = null;

    const scenes = getScenes(elements);

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

    document.body.classList.remove(
      "journey-preparing",
      "journey-ready",
      "journey-hero-mounted",
    );

    window.__INKWELL_MASTER_JOURNEY__ = false;
    window.__inkwellMasterJourneyStarted = false;
  }

  function getScenes(elements) {
    return [
      elements.hero,
      elements.section2,
      elements.section3,
      elements.section4,
    ].filter(Boolean);
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

  function waitForFonts(timeoutMs) {
    if (!document.fonts?.ready) {
      return Promise.resolve();
    }

    return Promise.race([
      document.fonts.ready.catch(() => {}),
      delay(timeoutMs),
    ]);
  }

  function nextFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(resolve));
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
})();