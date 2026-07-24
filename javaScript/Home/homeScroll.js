/* ============================================================================
   INKWELL — ONE MASTER PINNED HOME-PAGE JOURNEY (V5)

   REQUIRED SCRIPT ORDER
   1. Supabase
   2. GSAP
   3. ScrollTrigger
   4. ScrollToPlugin
   5. homeScroll.js
   6. section-1.js
   7. changeCardSection1.js
   8. section-2.js
   9. section-3.js
   10. section-4.js

   Desktop behavior:
   - one pinned shell beneath the navbar
   - wheel/trackpad movement advances one reversible master timeline
   - Sections 2 and 4 keep their original internal timelines
   - long crossfades connect all four scenes without normal page movement
   ============================================================================ */

(() => {
  "use strict";

  window.__INKWELL_HOME_SCROLL_BUILD__ =
    "2026-07-24-interaction-v8-section-rail";

  const DESKTOP_QUERY =
    "(min-width: 1100px) and (min-height: 700px) and " +
    "(prefers-reduced-motion: no-preference)";

  /*
   * Scroll density is deliberately lower than V2:
   * - Section 1 reaches Section 2 sooner.
   * - Section 2 is slightly faster, without rushing its saved-layer scenes.
   * - The master still has enough scrub distance for smooth reversal.
   */
  const SCROLL_PIXELS_PER_TIMELINE_SECOND = 360;
  const SECTION_2_TIME_SCALE = 1.25;

  /*
   * This is a page-section navigator, not a replacement for the browser's
   * native scrollbar. The native scrollbar remains available as a familiar
   * fallback, while these four stops jump to exact labels in the GSAP master
   * timeline.
   */
  const JOURNEY_STOPS = Object.freeze([
    {
      key: "section-1",
      timelineLabel: "section-1-start",
      targetSelector: ".hero",
      eyebrow: "Introduction",
      title: "Stories leave a mark",
    },
    {
      key: "section-2",
      timelineLabel: "section-2-start",
      targetSelector: "#section-2-empty-shelf",
      eyebrow: "Beyond the score",
      title: "Remember why",
    },
    {
      key: "section-3",
      timelineLabel: "section-3-start",
      targetSelector: "#section-3-library-flow",
      eyebrow: "Your first step",
      title: "Build your library",
    },
    {
      key: "section-4",
      timelineLabel: "section-4-start",
      targetSelector: "#section-4",
      eyebrow: "Shared stories",
      title: "Different souls",
    },
  ]);

  const JOURNEY_JUMP_DURATION = 0.9;

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
    ScrollToPlugin: window.ScrollToPlugin || null,
    master: null,
    trigger: null,
    shell: null,
    stage: null,
    heroIntro: null,
    createdWrapper: false,
    originalParent: null,
    originalReference: null,
    resizeTimer: null,
    resizeObserver: null,
    activeScene: "",
    journeyNav: null,
    journeyProgress: null,
    journeyStatus: null,
    journeyButtons: [],
    scrollTween: null,
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

    if (state.ScrollToPlugin) {
      gsap.registerPlugin(ScrollTrigger, state.ScrollToPlugin);
    } else {
      gsap.registerPlugin(ScrollTrigger);
    }

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
    setupJourneyNavigator(elements);
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
        navigatorReady: Boolean(state.journeyNav),
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
      section2Label: document.querySelector(
        ".section-2-header .section-label",
      ),
      section2Title: document.querySelector(".section-2-header h2"),
      section2Description: document.querySelector(".section-2-header p"),
      section2Card: document.querySelector("#section-2-empty-shelf .card-wrap"),
      section2DetailsTray: document.querySelector(
        "#section-2-empty-shelf .media-row-details",
      ),
      section2Stages: gsapSafeArray(
        document.querySelectorAll("#section-2-empty-shelf .scroll-stage"),
      ),
      section2StageItems: gsapSafeArray(
        document.querySelectorAll(
          "#section-2-empty-shelf .falling-quote, " +
            "#section-2-empty-shelf .moment-frame, " +
            "#section-2-empty-shelf .character-name, " +
            "#section-2-empty-shelf .note-card, " +
            "#section-2-empty-shelf .thoughts-cloud",
        ),
      ),

      section3Copy: section3?.querySelector(".flow-copy-card") || null,
      section3Label:
        section3?.querySelector(".flow-copy-card .section-label") || null,
      section3TitleLines: section3
        ? gsapSafeArray(
            section3.querySelectorAll(".flow-copy-card .flow-title-line"),
          )
        : [],
      section3Description:
        section3?.querySelector(".flow-copy-card > p") || null,
      section3Cta:
        section3?.querySelector(".flow-copy-card .flow-cta") || null,
      section3Search: section3?.querySelector(".flow-search-card") || null,
      section3SearchParts: section3
        ? gsapSafeArray(
            section3.querySelectorAll(
              ".flow-search-card .flow-card-header, " +
                ".flow-search-card .flow-search-form, " +
                ".flow-search-card .flow-search-empty",
            ),
          )
        : [],
      section3Library: section3?.querySelector(".flow-library-card") || null,
      section3LibraryParts: section3
        ? gsapSafeArray(
            section3.querySelectorAll(
              ".flow-library-card .flow-library-header, " +
                ".flow-library-card .flow-library-toolbar, " +
                ".flow-library-card .flow-library-list-header, " +
                ".flow-library-card .flow-library-viewport",
            ),
          )
        : [],

      section4Copy:
        document.querySelector("#section-4 .s4-cinematic-copy") || null,
      section4Label:
        document.querySelector(
          "#section-4 .s4-cinematic-copy .s4-section-label",
        ) || null,
      section4Title:
        document.querySelector("#section-4 .s4-cinematic-copy h2") || null,
      section4Description:
        document.querySelector("#section-4 .s4-cinematic-copy > p") || null,
      section4Cue:
        document.querySelector("#section-4 .s4-scroll-cue") || null,
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
    const section3Timeline = createSection3Timeline();

    section2Api.reset?.();
    section2Timeline.pause(0);
    section2Timeline.timeScale(SECTION_2_TIME_SCALE);

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
      xPercent: 0,
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
    master.to({}, { duration: 0.12 });

    addHeroToSection2Transition(master, elements, heroItems);

    master.addLabel("section-2-start");
    master.to({}, { duration: 0.12 });
    attachChildTimeline(master, section2Timeline);
    master.addLabel("section-2-end");
    master.to({}, { duration: 0.16 });

    /* SECTION 2 -> 3 ----------------------------------------------------- */
    addSection2ToSection3Transition(
      master,
      elements,
      section2Api.externalElements || [],
    );

    master.addLabel("section-3-start");
    attachChildTimeline(master, section3Timeline);
    master.addLabel("section-3-end");

    /* SECTION 3 -> 4 ----------------------------------------------------- */
    addSection3ToSection4Transition(master, elements);

    master.addLabel("section-4-start");
    master.to({}, { duration: 0.14 });

    if (section4Timeline) {
      attachChildTimeline(master, section4Timeline);
    } else {
      master.to({}, { duration: 6.5 });
    }

    master.addLabel("section-4-end");
    master.to({}, { duration: 0.85 });

    state.trigger = ScrollTrigger.create({
      id: "inkwell-one-master-journey-v5",
      trigger: state.shell,
      animation: master,
      start: () => `top top+=${getNavHeight(elements.nav)}`,
      end: () => {
        const distance = Math.max(
          master.duration() * SCROLL_PIXELS_PER_TIMELINE_SECOND,
          window.innerHeight * 8.8,
          9000,
        );

        return `+=${Math.round(distance)}`;
      },
      pin: state.shell,
      pinSpacing: true,
      scrub: 1.02,
      anticipatePin: 1,
      /*
       * Do not invalidate the complete master timeline during refresh.
       * Section 4 is a nested reversible timeline. Invalidating the master
       * after Section 4 has rendered makes GSAP record the currently transformed
       * rain covers as new starting values, so the next reverse/forward pass
       * becomes corrupted. Child sections update their own layout metrics.
       */
      invalidateOnRefresh: false,
      refreshPriority: 100,
      onRefreshInit: () => {
        syncNavHeight(elements.nav);
        section2Api.refresh?.();
        section4Api?.refresh?.();
      },
      onRefresh: () => {
        layoutJourneyNavigator();
        syncActiveScene();
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

  /*
   * Each hand-off has its own visual grammar. There is no generic glowing
   * line or duplicate transition overlay. The real incoming section and its
   * real elements are revealed in sequence.
   */

  function addHeroToSection2Transition(master, elements, heroItems) {
    const { gsap } = state;
    const timeline = gsap.timeline({ defaults: { ease: "none" } });

    const incomingItems = [
      elements.section2Label,
      elements.section2Title,
      elements.section2Description,
      elements.section2Card,
    ].filter(Boolean);

    timeline.set(elements.section2, {
      visibility: "visible",
      pointerEvents: "none",
      autoAlpha: 0,
      yPercent: 1.4,
      scale: 1.01,
    });

    timeline.set(incomingItems, {
      autoAlpha: 0,
      y: 30,
    });

    /* The hero exits first. The next section's content does not appear yet. */
    timeline.to(heroItems, {
      autoAlpha: 0,
      x: -34,
      y: -26,
      duration: 0.72,
      stagger: { each: 0.045, from: "end" },
      ease: "power2.inOut",
    }, 0);

    if (elements.heroRight) {
      timeline.to(elements.heroRight, {
        autoAlpha: 0,
        x: 68,
        y: -18,
        scale: 0.955,
        duration: 0.82,
        ease: "power2.inOut",
      }, 0.08);
    }

    /* Only the backgrounds overlap during this interval. */
    timeline.to(elements.hero, {
      autoAlpha: 0,
      scale: 0.992,
      duration: 0.78,
      ease: "power2.inOut",
    }, 0.72);

    timeline.to(elements.section2, {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      duration: 0.82,
      ease: "power2.inOut",
    }, 0.72);

    /* Section 2 reads in from label to card rather than appearing at once. */
    timeline.to(elements.section2Label, {
      autoAlpha: 1,
      y: 0,
      duration: 0.34,
      ease: "power3.out",
    }, 1.42);

    timeline.to(elements.section2Title, {
      autoAlpha: 1,
      y: 0,
      duration: 0.48,
      ease: "power3.out",
    }, 1.54);

    timeline.to(elements.section2Description, {
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out",
    }, 1.8);

    timeline.to(elements.section2Card, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.56,
      ease: "power3.out",
    }, 2.02);

    timeline.set(elements.hero, {
      visibility: "hidden",
      pointerEvents: "none",
    }, 1.52);

    timeline.set(elements.section2, { pointerEvents: "auto" }, 2.58);
    timeline.to({}, { duration: Math.max(0, 2.7 - timeline.duration()) });
    master.add(timeline);
  }

  function addSection2ToSection3Transition(
    master,
    elements,
    section2Proxies,
  ) {
    const { gsap } = state;
    const timeline = gsap.timeline({ defaults: { ease: "none" } });

    const copyLead = [
      elements.section3Label,
      ...elements.section3TitleLines,
      elements.section3Description,
      elements.section3Cta,
    ].filter(Boolean);

    const section2Transient = [
      ...elements.section2Stages,
      ...elements.section2StageItems,
      ...section2Proxies,
    ].filter(Boolean);

    const section2Core = [
      elements.section2Header,
      elements.section2Card,
      elements.section2DetailsTray,
    ].filter(Boolean);

    timeline.set(elements.section3, {
      visibility: "visible",
      pointerEvents: "none",
      autoAlpha: 0,
      yPercent: 1.2,
      scale: 1.006,
    });

    timeline.set(elements.section3Copy, {
      autoAlpha: 0,
      x: -44,
      y: 18,
    });

    timeline.set(copyLead, { autoAlpha: 0, x: -24, y: 18 });
    timeline.set(elements.section3Search, {
      autoAlpha: 0,
      x: 58,
      y: 20,
      scale: 0.98,
    });
    timeline.set(elements.section3SearchParts, { autoAlpha: 0, y: 14 });
    timeline.set(elements.section3Library, {
      autoAlpha: 0,
      y: 56,
      scale: 0.986,
    });
    timeline.set(elements.section3LibraryParts, { autoAlpha: 0, y: 12 });

    /* Finish and remove every temporary Section 2 layer first. */
    if (section2Transient.length) {
      timeline.to(section2Transient, {
        autoAlpha: 0,
        y: -24,
        scale: 0.95,
        duration: 0.52,
        stagger: 0.014,
        ease: "power2.in",
      }, 0);
    }

    timeline.to(section2Core, {
      autoAlpha: 0,
      y: -28,
      scale: 0.982,
      duration: 0.64,
      stagger: 0.055,
      ease: "power2.inOut",
    }, 0.28);

    timeline.set(section2Transient, {
      autoAlpha: 0,
      visibility: "hidden",
      pointerEvents: "none",
    }, 0.78);

    /* Blend only the two backgrounds after Section 2 is visually empty. */
    timeline.to(elements.section2, {
      autoAlpha: 0,
      yPercent: -1,
      scale: 0.994,
      duration: 0.8,
      ease: "power2.inOut",
    }, 0.82);

    timeline.to(elements.section3, {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      duration: 0.84,
      ease: "power2.inOut",
    }, 0.82);

    /* Section 3 enters in three readable groups. */
    timeline.to(elements.section3Copy, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      duration: 0.46,
      ease: "power3.out",
    }, 1.62);

    timeline.to(elements.section3Label, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      duration: 0.3,
      ease: "power3.out",
    }, 1.7);

    if (elements.section3TitleLines.length) {
      timeline.to(elements.section3TitleLines, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.46,
        stagger: 0.1,
        ease: "power3.out",
      }, 1.78);
    }

    timeline.to(
      [elements.section3Description, elements.section3Cta].filter(Boolean),
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.38,
        stagger: 0.09,
        ease: "power3.out",
      },
      2.08,
    );

    timeline.to(elements.section3Search, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.58,
      ease: "power3.out",
    }, 1.9);

    if (elements.section3SearchParts.length) {
      timeline.to(elements.section3SearchParts, {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
        stagger: 0.07,
        ease: "power2.out",
      }, 2.2);
    }

    timeline.to(elements.section3Library, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.62,
      ease: "power3.out",
    }, 2.38);

    if (elements.section3LibraryParts.length) {
      timeline.to(elements.section3LibraryParts, {
        autoAlpha: 1,
        y: 0,
        duration: 0.36,
        stagger: 0.065,
        ease: "power2.out",
      }, 2.68);
    }

    timeline.set(elements.section2, {
      visibility: "hidden",
      pointerEvents: "none",
    }, 1.7);

    timeline.set(elements.section3, { pointerEvents: "auto" }, 3.12);
    timeline.to({}, { duration: Math.max(0, 3.22 - timeline.duration()) });
    master.add(timeline);
  }

  function addSection3ToSection4Transition(master, elements) {
    const { gsap } = state;
    const timeline = gsap.timeline({ defaults: { ease: "none" } });

    const outgoingItems = [
      elements.section3Copy,
      elements.section3Search,
      elements.section3Library,
    ].filter(Boolean);

    const incomingItems = [
      elements.section4Label,
      elements.section4Title,
      elements.section4Description,
      elements.section4Cue,
    ].filter(Boolean);

    timeline.set(elements.section4, {
      visibility: "visible",
      pointerEvents: "none",
      autoAlpha: 0,
      scale: 1.012,
    });

    timeline.set(incomingItems, {
      autoAlpha: 0,
      y: 32,
      scale: 0.985,
    });

    /* Section 3 remains settled before its groups leave in reverse order. */
    timeline.to(elements.section3Library, {
      autoAlpha: 0,
      y: -26,
      scale: 0.985,
      duration: 0.56,
      ease: "power2.inOut",
    }, 0);

    timeline.to(elements.section3Search, {
      autoAlpha: 0,
      x: 42,
      y: -18,
      scale: 0.982,
      duration: 0.6,
      ease: "power2.inOut",
    }, 0.18);

    timeline.to(elements.section3Copy, {
      autoAlpha: 0,
      x: -42,
      y: -20,
      duration: 0.62,
      ease: "power2.inOut",
    }, 0.28);

    /* Backgrounds blend only after the Section 3 panels have cleared. */
    timeline.to(elements.section3, {
      autoAlpha: 0,
      scale: 0.994,
      duration: 0.82,
      ease: "power2.inOut",
    }, 0.9);

    timeline.to(elements.section4, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.86,
      ease: "power2.inOut",
    }, 0.9);

    /* Section 4's cinematic opening arrives in its own center-led order. */
    timeline.to(elements.section4Label, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.32,
      ease: "power3.out",
    }, 1.72);

    timeline.to(elements.section4Title, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.58,
      ease: "power3.out",
    }, 1.84);

    timeline.to(elements.section4Description, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.42,
      ease: "power3.out",
    }, 2.16);

    timeline.to(elements.section4Cue, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.34,
      ease: "power3.out",
    }, 2.38);

    timeline.set(elements.section3, {
      visibility: "hidden",
      pointerEvents: "none",
    }, 1.78);

    timeline.set(elements.section4, { pointerEvents: "auto" }, 2.78);
    timeline.to({}, { duration: Math.max(0, 2.9 - timeline.duration()) });
    master.add(timeline);
  }

  function attachChildTimeline(master, timeline) {
    if (!timeline) {
      return;
    }

    timeline.pause(0);
    master.add(timeline);
    timeline.paused(false);
  }

  function createSection3Timeline() {
    const { gsap } = state;

    /*
     * Section 3 remains still after its entrance. V2 moved the copy, search
     * card and library again before the Section 4 hand-off, which made the
     * settled state unclear.
     */
    return gsap.timeline({
      defaults: { ease: "none" },
      paused: true,
    }).to({}, { duration: 2.85 });
  }

  async function waitForSection4Api(timeoutMs) {
    const existing = window.InkwellSection4Journey;

    if (isUsableSection4Api(existing)) {
      return existing;
    }

    let result = null;

    if (existing?.ready) {
      result = await Promise.race([
        existing.ready,
        delay(timeoutMs).then(() => null),
      ]);
    } else {
      result = await waitForSectionApi({
        current: () => window.InkwellSection4Journey,
        eventName: "inkwell:section4-ready",
        timeoutMs,
      });
    }

    if (isUsableSection4Api(result)) {
      return result;
    }

    /*
     * Never leave Section 4 in its animation-only hidden state. If its script
     * fails to publish an API, the master journey receives a real static
     * fallback instead of the unresolved { ready: Promise } placeholder.
     */
    const section = document.querySelector(SELECTORS.section4);

    return {
      section,
      timeline: null,
      cleanup: () => {},
      refresh: () => {},
      showStatic: () => {
        section?.classList.add("is-static");
      },
    };
  }

  function isUsableSection4Api(api) {
    return Boolean(
      api &&
      (api.timeline || typeof api.showStatic === "function")
    );
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

    syncJourneyNavigator(active, master.progress(), time);

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

  /* ========================================================================
     ACCESSIBLE SECTION RAIL

     The rail mirrors the four labels in the master GSAP timeline. Its visual
     progress is continuous, but the controls are normal buttons so keyboard
     and assistive-technology behavior stays predictable.
     ======================================================================== */

  function setupJourneyNavigator(elements) {
    teardownJourneyNavigator();

    const master = state.master;

    if (!master || !state.trigger) {
      return;
    }

    const hero = elements.hero;

    if (hero && !hero.id) {
      hero.id = "section-1-hero";
      hero.dataset.journeyGeneratedId = "true";
    }

    const nav = document.createElement("nav");
    nav.className = "journey-section-rail";
    nav.setAttribute("aria-label", "Homepage story sections");
    nav.dataset.journeySectionRail = "true";

    const surface = document.createElement("div");
    surface.className = "journey-section-rail__surface";

    const track = document.createElement("span");
    track.className = "journey-section-rail__track";
    track.setAttribute("aria-hidden", "true");

    const progress = document.createElement("span");
    progress.className = "journey-section-rail__progress";
    progress.setAttribute("aria-hidden", "true");

    const list = document.createElement("ol");
    list.className = "journey-section-rail__stops";

    const status = document.createElement("p");
    status.className = "journey-section-rail__status";
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");

    const buttons = JOURNEY_STOPS.map((stop, index) => {
      const item = document.createElement("li");
      item.className = "journey-section-rail__stop";
      item.dataset.journeyStop = stop.key;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "journey-section-rail__button";
      button.dataset.journeyTarget = stop.key;
      button.setAttribute(
        "aria-label",
        `Go to section ${index + 1} of ${JOURNEY_STOPS.length}: ${stop.title}`,
      );

      const target = document.querySelector(stop.targetSelector);

      if (target?.id) {
        button.setAttribute("aria-controls", target.id);
      }

      const dot = document.createElement("span");
      dot.className = "journey-section-rail__dot";
      dot.setAttribute("aria-hidden", "true");

      const dotCore = document.createElement("span");
      dotCore.className = "journey-section-rail__dot-core";
      dot.appendChild(dotCore);

      const label = document.createElement("span");
      label.className = "journey-section-rail__label";
      label.setAttribute("aria-hidden", "true");

      const number = document.createElement("span");
      number.className = "journey-section-rail__number";
      number.textContent = String(index + 1).padStart(2, "0");

      const copy = document.createElement("span");
      copy.className = "journey-section-rail__copy";

      const eyebrow = document.createElement("small");
      eyebrow.textContent = stop.eyebrow;

      const title = document.createElement("strong");
      title.textContent = stop.title;

      copy.append(eyebrow, title);
      label.append(number, copy);
      button.append(dot, label);
      item.appendChild(button);
      list.appendChild(item);

      button.addEventListener("click", () => {
        scrollToJourneyStop(stop, index);
      });

      return { button, item, stop };
    });

    surface.append(track, progress, list);
    nav.append(surface, status);
    document.body.appendChild(nav);

    state.journeyNav = nav;
    state.journeyProgress = progress;
    state.journeyStatus = status;
    state.journeyButtons = buttons;

    document.body.classList.add("journey-section-rail-ready");

    layoutJourneyNavigator();
    syncActiveScene();
  }

  function layoutJourneyNavigator() {
    const master = state.master;

    if (!master || !state.journeyButtons.length) {
      return;
    }

    const duration = Math.max(master.duration(), 0.0001);

    state.journeyButtons.forEach(({ item, stop }) => {
      const labelTime = master.labels[stop.timelineLabel];
      const progress = Number.isFinite(labelTime)
        ? state.gsap.utils.clamp(0, 1, labelTime / duration)
        : 0;

      item.style.setProperty("--journey-stop-progress", String(progress));
    });
  }

  function syncJourneyNavigator(active, progress, currentTime) {
    if (!state.journeyNav) {
      return;
    }

    const clampedProgress = state.gsap.utils.clamp(0, 1, progress || 0);
    state.journeyNav.style.setProperty(
      "--journey-progress",
      String(clampedProgress),
    );
    state.journeyNav.dataset.currentSection = active;

    state.journeyButtons.forEach(({ button, stop }) => {
      const labelTime = state.master?.labels?.[stop.timelineLabel] ?? Infinity;
      const isCurrent = stop.key === active;
      const isReached = currentTime >= labelTime - 0.001;

      button.classList.toggle("is-current", isCurrent);
      button.classList.toggle("is-reached", isReached);

      if (isCurrent) {
        button.setAttribute("aria-current", "step");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function getJourneyStopScrollPosition(timelineLabel) {
    const trigger = state.trigger;
    const master = state.master;

    if (!trigger || !master) {
      return window.scrollY;
    }

    let target = Number.NaN;

    if (typeof trigger.labelToScroll === "function") {
      target = Number(trigger.labelToScroll(timelineLabel));
    }

    if (!Number.isFinite(target)) {
      const labelTime = master.labels[timelineLabel] ?? 0;
      const labelProgress = state.gsap.utils.clamp(
        0,
        1,
        labelTime / Math.max(master.duration(), 0.0001),
      );

      target = trigger.start + (trigger.end - trigger.start) * labelProgress;
    }

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );

    return Math.round(state.gsap.utils.clamp(0, maxScroll, target + 1));
  }

  function scrollToJourneyStop(stop, index) {
    const target = getJourneyStopScrollPosition(stop.timelineLabel);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    state.scrollTween?.kill();
    state.scrollTween = null;

    document.body.classList.add("journey-section-jumping");

    if (state.journeyStatus) {
      state.journeyStatus.textContent =
        `Moving to section ${index + 1}: ${stop.title}.`;
    }

    const finish = () => {
      state.scrollTween = null;
      document.body.classList.remove("journey-section-jumping");
      state.trigger?.update();

      if (state.journeyStatus) {
        state.journeyStatus.textContent =
          `Section ${index + 1}: ${stop.title}.`;
      }
    };

    if (state.ScrollToPlugin) {
      state.scrollTween = state.gsap.to(window, {
        duration: reduceMotion ? 0 : JOURNEY_JUMP_DURATION,
        ease: reduceMotion ? "none" : "power3.inOut",
        overwrite: "auto",
        scrollTo: {
          y: target,
          autoKill: true,
        },
        onComplete: finish,
        onInterrupt: finish,
      });
      return;
    }

    window.scrollTo({
      top: target,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });

    window.setTimeout(finish, reduceMotion ? 0 : 900);
  }

  function teardownJourneyNavigator() {
    state.scrollTween?.kill();
    state.scrollTween = null;

    state.journeyNav?.remove();
    state.journeyNav = null;
    state.journeyProgress = null;
    state.journeyStatus = null;
    state.journeyButtons = [];

    document.body?.classList.remove(
      "journey-section-rail-ready",
      "journey-section-jumping",
    );
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
    layoutJourneyNavigator();
    syncActiveScene();
  }

  function failToNaturalLayout(message) {
    console.warn(`Inkwell master journey: ${message}`);
    teardownJourneyNavigator();
    window.__INKWELL_MASTER_JOURNEY__ = false;
    window.__inkwellMasterJourneyStarted = false;
    document.body?.classList.remove(
      "journey-preparing",
      "journey-ready",
      "journey-hero-mounted",
    );
  }

  function teardownMaster(restoreWrapper) {
    teardownJourneyNavigator();

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

  function gsapSafeArray(collection) {
    return Array.from(collection || []);
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