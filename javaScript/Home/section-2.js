/* ============================================================================
   SECTION 2 — FINAL SCROLL STORY

   Features:
   - 9 quote cards
   - 8 moment cards
   - 6 character cards
   - Persistent moment z-index ordering
   - Temporary smooth hover enlargement
   - No filter effects on moments
   - GSAP ScrollTrigger animation
   ============================================================================ */

(() => {
  const section = document.querySelector(
    "#section-2-empty-shelf"
  );

  if (!section) {
    return;
  }

  const { gsap, ScrollTrigger } = window;

  const MANAGED_BY_HOME_JOURNEY =
    window.__INKWELL_MASTER_JOURNEY__ === true;

  if (!gsap || !ScrollTrigger) {
    console.warn(
      "Section 2 requires GSAP and ScrollTrigger."
    );

    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const elements = {
    header: section.querySelector(
      ".section-2-header"
    ),

    status: section.querySelector(
      "#section-2-status"
    ),

    viewport: section.querySelector(
      ".stage-viewport"
    ),

    cardWrap: section.querySelector(
      ".card-wrap"
    ),

    card: section.querySelector(
      ".media-library-row"
    ),

    score: section.querySelector(
      ".media-row-score"
    ),

    detailsTray: section.querySelector(
      ".media-row-details"
    )
  };

  const missingElements = Object.entries(
    elements
  ).filter(([key, value]) => {
    return key !== "status" && !value;
  });

  if (missingElements.length) {
    console.warn(
      "Section 2 is missing required elements:",
      missingElements
        .map(([key]) => key)
        .join(", ")
    );

    return;
  }

  const layerDefinitions = [
    {
      key: "quotes",

      stageSelector:
        '[data-stage="quotes-fall"]',

      itemSelector:
        ".falling-quote",

      buttonSelector:
        ".depth-button-quotes",

      label:
        "Quotes",

      statusText:
        "Quotes saved to Vagabond."
    },

    {
      key: "moments",

      stageSelector:
        '[data-stage="moments-move"]',

      itemSelector:
        ".moment-frame",

      buttonSelector:
        ".depth-button-moment",

      label:
        "Moments",

      statusText:
        "Moments saved to Vagabond."
    },

    {
      key: "characters",

      stageSelector:
        '[data-stage="characters-appear"]',

      itemSelector:
        ".character-name",

      buttonSelector:
        ".depth-button-character",

      label:
        "Characters",

      statusText:
        "Characters saved to Vagabond."
    },

    {
      key: "notes",

      stageSelector:
        '[data-stage="notes-appear"]',

      itemSelector:
        ".note-card",

      buttonSelector:
        ".depth-button-notes",

      label:
        "Notes",

      statusText:
        "Notes saved to Vagabond."
    },

    {
      key: "thoughts",

      stageSelector:
        '[data-stage="thoughts-appear"]',

      itemSelector:
        ".thoughts-cloud",

      buttonSelector:
        ".depth-button-thoughts",

      label:
        "Thoughts",

      statusText:
        "Thoughts saved to Vagabond."
    }
  ];

  const layers = layerDefinitions.map(
    (definition, index) => {
      const stage = section.querySelector(
        definition.stageSelector
      );

      return {
        ...definition,

        index,
        stage,

        items: stage
          ? gsap.utils.toArray(
              stage.querySelectorAll(
                definition.itemSelector
              )
            )
          : [],

        button: section.querySelector(
          definition.buttonSelector
        ),

        proxy: null,
        startTime: null,
        landTime: null,
        endTime: null
      };
    }
  );

  let masterTimeline = null;

  let lastAnnouncedIndex = -2;
  let lastStatusText = "";

  let trayRevealTime =
    Number.POSITIVE_INFINITY;

  let resizeTimer = null;
  let refreshTimer = null;

  /*
   * Every hovered moment receives the next
   * available permanent layer number.
   */
  let topLayerZ = 1000;

  init();

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */

  function init() {
    section.classList.add(
      "is-js-ready"
    );

    createButtonProxies();
    enablePersistentMomentLayers();
    setInitialState();

    if (prefersReducedMotion) {
      buildReducedMotionVersion();
      publishManagedApi(null);
      return;
    }

    masterTimeline =
      buildMasterTimeline({
        managed: MANAGED_BY_HOME_JOURNEY
      });

    if (MANAGED_BY_HOME_JOURNEY) {
      masterTimeline.pause(0);
      publishManagedApi(masterTimeline);
      return;
    }

    setupSafeRefreshes();
  }

  function publishManagedApi(timeline) {
    if (!MANAGED_BY_HOME_JOURNEY) {
      return;
    }

    const api = {
      section,
      timeline,
      externalElements: layers
        .map((layer) => layer.proxy)
        .filter(Boolean),
      reset: setInitialState,
      showStatic: buildReducedMotionVersion,
      refresh: () => {
        if (timeline) {
          timeline.invalidate();
          syncTimelineState(timeline);
        }
      }
    };

    window.InkwellSection2Journey = api;

    window.dispatchEvent(
      new CustomEvent("inkwell:section2-ready", {
        detail: api
      })
    );
  }

  /* ==========================================================================
     PERSISTENT MOMENT LAYERS

     Hovering a moment card:
     - gives it a newer z-index
     - keeps that z-index after hover
     - does not keep the visual enlargement

     CSS handles the temporary size animation.
     ========================================================================== */

  function enablePersistentMomentLayers() {
    const momentItems =
      section.querySelectorAll(
        ".moment-frame"
      );

    momentItems.forEach((moment) => {
      const moveToTop = () => {
        topLayerZ += 1;

        moment.style.zIndex =
          String(topLayerZ);
      };

      moment.addEventListener(
        "pointerenter",
        moveToTop
      );

      moment.addEventListener(
        "focusin",
        moveToTop
      );
    });
  }

  function resetMomentLayerOrder() {
    section
      .querySelectorAll(".moment-frame")
      .forEach((moment) => {
        moment.style.removeProperty(
          "z-index"
        );
      });

    topLayerZ = 1000;
  }

  /* ==========================================================================
     BUTTON PROXIES
     ========================================================================== */

  function createButtonProxies() {
    document
      .querySelectorAll(
        '[data-section-2-proxy="true"]'
      )
      .forEach((proxy) => {
        proxy.remove();
      });

    layers.forEach((layer) => {
      const proxy =
        document.createElement("div");

      proxy.className =
        "depth-button-proxy";

      proxy.textContent =
        layer.label;

      proxy.setAttribute(
        "aria-hidden",
        "true"
      );

      proxy.setAttribute(
        "data-section-2-proxy",
        "true"
      );

      document.body.appendChild(proxy);

      layer.proxy = proxy;
    });
  }

  /* ==========================================================================
     SAFE REFRESHES
     ========================================================================== */

  function setupSafeRefreshes() {
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);

        resizeTimer =
          window.setTimeout(() => {
            queueSafeRefresh();
          }, 150);
      }
    );

    window.addEventListener(
      "load",
      () => {
        queueSafeRefresh(120);
      },
      {
        once: true
      }
    );

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          queueSafeRefresh(120);
        })
        .catch(() => {});
    }

    const images =
      section.querySelectorAll("img");

    images.forEach((image) => {
      if (image.complete) {
        return;
      }

      image.addEventListener(
        "load",
        () => {
          queueSafeRefresh(120);
        },
        {
          once: true
        }
      );

      image.addEventListener(
        "error",
        () => {
          queueSafeRefresh(120);
        },
        {
          once: true
        }
      );
    });
  }

  function queueSafeRefresh(
    delay = 80
  ) {
    clearTimeout(refreshTimer);

    refreshTimer =
      window.setTimeout(() => {
        ScrollTrigger.refresh(true);
      }, delay);
  }

  /* ==========================================================================
     INITIAL STATE
     ========================================================================== */

  function setInitialState() {
    resetMomentLayerOrder();

    gsap.set(elements.header, {
      autoAlpha: 1,
      y: 0
    });

    gsap.set(elements.viewport, {
      y: 0
    });

    gsap.set(elements.cardWrap, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      transformOrigin: "center center"
    });

    gsap.set(elements.card, {
      y: 0,
      transformOrigin: "center center"
    });

    gsap.set(elements.detailsTray, {
      autoAlpha: 0,
      y: 10
    });

    elements.detailsTray.classList.remove(
      "is-visible"
    );

    layers.forEach((layer) => {
      if (layer.stage) {
        layer.stage.setAttribute(
          "aria-hidden",
          "true"
        );

        layer.stage.classList.remove(
          "is-active"
        );

        gsap.set(layer.stage, {
          autoAlpha: 0
        });
      }

      if (layer.items.length) {
        const itemState = {
          autoAlpha: 0,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          transformOrigin:
            "center center"
        };

        gsap.set(
          layer.items,
          itemState
        );

        /*
         * Keep the scroll animation compositor-friendly.
         * Visual depth comes from scale, position and opacity;
         * filters remain available for CSS hover states only.
         */
        gsap.set(layer.items, {
          clearProps: "filter"
        });
      }

      if (layer.button) {
        layer.button.classList.remove(
          "is-landed",
          "depth-button-new"
        );

        layer.button.setAttribute(
          "aria-hidden",
          "true"
        );

        layer.button.tabIndex = -1;

        gsap.set(layer.button, {
          autoAlpha: 0,
          y: 8,
          scale: 0.96
        });
      }

      if (layer.proxy) {
        gsap.set(layer.proxy, {
          autoAlpha: 0,
          x: 0,
          y: 0,
          scale: 0.8,
          rotationX: 0,
          rotationY: 0
        });
      }
    });

    updateStatus("");

    lastAnnouncedIndex = -2;
  }

  function resetToNaturalStart() {
    setInitialState();
  }

  /* ==========================================================================
     MASTER TIMELINE
     ========================================================================== */

  function buildMasterTimeline(options = {}) {
    const managed =
      options.managed === true;

    const timelineOptions = {
      defaults: {
        ease: "power2.out"
      }
    };

    if (managed) {
      timelineOptions.paused = true;
    } else {
      timelineOptions.scrollTrigger = {
        trigger: section,
        start: "top top",

        end: () => {
          const distance =
            Math.max(
              window.innerHeight * 7.25,
              6500
            );

          return `+=${distance}`;
        },

        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onRefreshInit: () => {
          gsap.set(
            [
              elements.viewport,
              elements.cardWrap,
              elements.card
            ],
            {
              y: 0
            }
          );
        },

        onRefresh: ({ animation }) => {
          syncTimelineState(animation);
        },

        onUpdate: ({ animation }) => {
          syncTimelineState(animation);
        },

        onLeaveBack:
          resetToNaturalStart
      };
    }

    const timeline =
      gsap.timeline(timelineOptions);

    timeline.addLabel(
      "natural-card"
    );

    timeline.to(
      {},
      {
        duration: 0.5
      }
    );

    timeline.fromTo(
      elements.score,
      {
        boxShadow:
          "0 8px 22px rgba(0, 0, 0, 0.28)"
      },
      {
        boxShadow:
          "0 18px 46px rgba(155, 124, 255, 0.24), " +
          "0 0 34px rgba(124, 140, 255, 0.18)",

        duration: 0.22,
        yoyo: true,
        repeat: 1
      }
    );

    timeline.to(
      {},
      {
        duration: 0.18
      }
    );

    timeline.addLabel(
      "anchor-card"
    );

    timeline.to(
      elements.header,
      {
        autoAlpha: 0,
        y: -58,
        duration: 0.75,
        ease: "power2.inOut"
      },
      "anchor-card"
    );

    timeline.to(
      elements.viewport,
      {
        y: getViewportLiftY,
        duration: 0.9,
        ease: "power3.inOut"
      },
      "anchor-card"
    );

    timeline.to(
      elements.cardWrap,
      {
        y: getCardAnchorY,
        duration: 0.9,
        ease: "power3.inOut"
      },
      "anchor-card"
    );

    timeline.to(
      {},
      {
        duration: 0.42
      }
    );

    layers.forEach((layer) => {
      addLayerSequence(
        timeline,
        layer
      );
    });

    timeline.addLabel("final");

    timeline.to(
      elements.card,
      {
        y: -3,
        duration: 0.35
      }
    );

    const buttons = layers
      .map((layer) => {
        return layer.button;
      })
      .filter(Boolean);

    timeline.to(
      buttons,
      {
        scale: 1.045,
        duration: 0.12,
        stagger: 0.06,
        yoyo: true,
        repeat: 1
      },
      "<"
    );

    timeline.to(
      {},
      {
        duration: 0.65
      }
    );

    if (managed) {
      timeline.eventCallback(
        "onUpdate",
        () => syncTimelineState(timeline)
      );

      timeline.eventCallback(
        "onReverseComplete",
        resetToNaturalStart
      );
    }

    return timeline;
  }

  /* ==========================================================================
     INDIVIDUAL LAYER SEQUENCE
     ========================================================================== */

  function addLayerSequence(
    timeline,
    layer
  ) {
    if (
      !layer.stage ||
      !layer.button ||
      !layer.proxy ||
      !layer.items.length
    ) {
      return;
    }

    layer.startTime =
      timeline.duration();

    timeline.addLabel(
      `${layer.key}-start`
    );

    timeline.to(
      layer.stage,
      {
        autoAlpha: 1,
        duration: 0.18
      }
    );

    timeline.fromTo(
      layer.items,
      getEvidenceEnterFrom(layer),
      getEvidenceEnterTo(layer),
      "<"
    );

    timeline.to(
      {},
      {
        duration:
          getReadDuration(layer)
      }
    );

    const gatherVariables = {
      x: (
        _index,
        element
      ) => {
        return getGatherDelta(
          element,
          layer
        ).x;
      },

      y: (
        _index,
        element
      ) => {
        return getGatherDelta(
          element,
          layer
        ).y;
      },

      scale:
        getGatherScale(layer),

      rotation: 0,
      autoAlpha: 0.55,

      stagger: {
        each: 0.038,
        from: "center"
      },

      duration:
        getGatherDuration(layer),

      ease: "power2.inOut"
    };

    timeline.to(
      layer.items,
      gatherVariables
    );

    timeline.to(
      {},
      {
        duration: 0.12
      }
    );

    if (layer.index === 0) {
      trayRevealTime =
        timeline.duration();

      timeline.to(
        elements.detailsTray,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.24
        },
        "-=0.08"
      );
    }

    timeline.set(
      layer.proxy,
      {
        autoAlpha: 1,

        x: () => {
          return getProxyStartRect(
            layer
          ).x;
        },

        y: () => {
          return getProxyStartRect(
            layer
          ).y;
        },

        width: () => {
          return getButtonRect(
            layer
          ).width;
        },

        height: () => {
          return getButtonRect(
            layer
          ).height;
        },

        scale: 0.82,
        rotationX: 8,
        rotationY: -6
      },
      "-=0.08"
    );

    timeline.to(
      layer.proxy,
      {
        scale: 1,
        duration: 0.28
      }
    );

    timeline.to(
      {},
      {
        duration: 0.08
      }
    );

    timeline.to(
      layer.proxy,
      {
        x: () => {
          return getButtonRect(
            layer
          ).left;
        },

        y: () => {
          return getButtonRect(
            layer
          ).top;
        },

        width: () => {
          return getButtonRect(
            layer
          ).width;
        },

        height: () => {
          return getButtonRect(
            layer
          ).height;
        },

        rotationX: 0,
        rotationY: 0,

        duration:
          getTravelDuration(layer),

        ease: "power2.inOut"
      }
    );

    layer.landTime =
      timeline.duration();

    timeline.set(
      layer.button,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1
      },
      "-=0.04"
    );

    timeline.to(
      layer.proxy,
      {
        autoAlpha: 0,
        scale: 0.97,
        duration: 0.22
      },
      "<"
    );

    timeline.to(
      layer.button,
      {
        scale: 1.04,
        duration: 0.18,
        yoyo: true,
        repeat: 1
      },
      "<"
    );

    timeline.to(
      layer.stage,
      {
        autoAlpha: 0,
        duration: 0.34
      }
    );

    timeline.to(
      {},
      {
        duration: 0.30
      }
    );

    layer.endTime =
      timeline.duration();
  }

  /* ==========================================================================
     ENTRANCE POSITIONS
     ========================================================================== */

  function getEvidenceEnterFrom(
    layer
  ) {
    const startingValues = {
      autoAlpha: 0,
      scale: 0.94
    };

    const positions = {
      quotes: {
        x: [
          -130,
          -70,
          95,
          -100,
          45,
          130,
          -80,
          70,
          20
        ],

        y: [
          -42,
          -28,
          -44,
          38,
          52,
          34,
          72,
          68,
          82
        ],

        scale: 0.94,
        rotationMultiplier: 1.35
      },

      moments: {
        x: [
          -140,
          -92,
          -36,
          28,
          108,
          152,
          194,
          236
        ],

        y: [
          40,
          64,
          34,
          58,
          20,
          54,
          28,
          78
        ],

        scale: 0.9,
        rotationMultiplier: 1.25
      },

      characters: {
        x: [
          -150,
          -92,
          -34,
          34,
          92,
          150
        ],

        y: [
          34,
          52,
          38,
          24,
          52,
          34
        ],

        scale: 0.9,
        rotationMultiplier: 1.2
      },

      notes: {
        x: [
          -58,
          58,
          0,
          -36
        ],

        y: [
          28,
          34,
          40,
          32
        ],

        scale: 0.94,
        rotationMultiplier: 1.5
      },

      thoughts: {
        x: [
          -35,
          35
        ],

        y: [
          22
        ],

        scale: 0.96,
        rotationMultiplier: 0
      }
    };

    const position =
      positions[layer.key] ||
      positions.thoughts;

    return {
      ...startingValues,

      x: (index) => {
        return position.x[
          index %
          position.x.length
        ];
      },

      y: (index) => {
        return position.y[
          index %
          position.y.length
        ];
      },

      scale:
        position.scale,

      rotation: (
        _index,
        element
      ) => {
        return (
          getElementRotate(element) *
          position.rotationMultiplier
        );
      }
    };
  }

  function getEvidenceEnterTo(
    layer
  ) {
    const endingValues = {
      autoAlpha: 1,
      x: 0,
      y: 0,

      scale: (
        _index,
        element
      ) => {
        return Number(
          element.dataset.scale || 1
        );
      },

      rotation: (
        _index,
        element
      ) => {
        return getElementRotate(
          element
        );
      },

      duration:
        getEnterDuration(layer),

      stagger: {
        each:
          getEnterStagger(layer),

        from: "start"
      },

      ease: "power3.out"
    };

    return endingValues;
  }

  /* ==========================================================================
     TIMING HELPERS
     ========================================================================== */

  function getGatherDuration(layer) {
    const values = {
      quotes: 1.08,
      moments: 1.0,
      characters: 0.96,
      notes: 0.92,
      thoughts: 1.02
    };

    return values[layer.key] ?? 0.96;
  }

  function getTravelDuration(layer) {
    const values = {
      quotes: 1.16,
      moments: 1.08,
      characters: 1.06,
      notes: 1.02,
      thoughts: 1.12
    };

    return values[layer.key] ?? 1.06;
  }

  function getGatherScale(layer) {
    const values = {
      quotes: 0.18,
      moments: 0.2,
      characters: 0.2,
      notes: 0.28,
      thoughts: 0.28
    };

    return values[layer.key] ?? 0.28;
  }

  function getEnterDuration(layer) {
    const values = {
      quotes: 0.72,
      moments: 0.74,
      characters: 0.7,
      notes: 0.55,
      thoughts: 0.72
    };

    return values[layer.key] ?? 0.55;
  }

  function getEnterStagger(layer) {
    const values = {
      quotes: 0.032,
      moments: 0.036,
      characters: 0.04,
      notes: 0.065,
      thoughts: 0.12
    };

    return values[layer.key] ?? 0.065;
  }

  function getReadDuration(layer) {
    const values = {
      quotes: 1.18,
      moments: 1.04,
      characters: 0.9,
      notes: 0.72,
      thoughts: 0.82
    };

    return values[layer.key] ?? 0.44;
  }

  function getElementRotate(
    element
  ) {
    return Number(
      element.dataset.rotate || 0
    );
  }

  /* ==========================================================================
     POSITION CALCULATIONS
     ========================================================================== */

  function getViewportLiftY() {
    const headerHeight =
      elements.header
        .getBoundingClientRect()
        .height;

    const maxLift =
      window.innerWidth <= 640
        ? 160
        : 235;

    const desiredLift =
      headerHeight + 34;

    return -Math.min(
      desiredLift,
      maxLift
    );
  }

  function getCardAnchorY() {
    const savedViewportY =
      gsap.getProperty(
        elements.viewport,
        "y"
      );

    const savedCardY =
      gsap.getProperty(
        elements.cardWrap,
        "y"
      );

    gsap.set(
      elements.viewport,
      {
        y: 0
      }
    );

    gsap.set(
      elements.cardWrap,
      {
        y: 0
      }
    );

    const sectionRectangle =
      section.getBoundingClientRect();

    const cardRectangle =
      elements.cardWrap
        .getBoundingClientRect();

    const cardTopInsideSection =
      cardRectangle.top -
      sectionRectangle.top;

    const topGap =
      window.innerWidth <= 640
        ? 12
        : 18;

    const bottomGap =
      window.innerWidth <= 640
        ? 18
        : 24;

    /*
     * In the shared journey the section is shorter than window.innerHeight
     * because the navbar remains above the pinned stage. Using the full
     * window height pushed the card down by roughly the navbar height and
     * clipped its bottom edge.
     */
    const availableHeight =
      MANAGED_BY_HOME_JOURNEY
        ? section.clientHeight
        : window.innerHeight;

    const targetBottom =
      availableHeight -
      bottomGap;

    const targetTop =
      Math.max(
        topGap,
        targetBottom -
          cardRectangle.height
      );

    const cardTopAfterLift =
      cardTopInsideSection +
      getViewportLiftY();

    const neededCardMovement =
      targetTop -
      cardTopAfterLift;

    gsap.set(
      elements.viewport,
      {
        y: savedViewportY
      }
    );

    gsap.set(
      elements.cardWrap,
      {
        y: savedCardY
      }
    );

    return neededCardMovement;
  }

  function getButtonRect(layer) {
    const rectangle =
      layer.button
        .getBoundingClientRect();

    return {
      left:
        rectangle.left,

      top:
        rectangle.top,

      width:
        Math.max(
          rectangle.width,
          88
        ),

      height:
        Math.max(
          rectangle.height,
          38
        )
    };
  }

  function getLayerGatherPoint(
    layer
  ) {
    const buttonRectangle =
      getButtonRect(layer);

    return {
      x:
        buttonRectangle.left +
        buttonRectangle.width / 2,

      y:
        buttonRectangle.top - 44
    };
  }

  function getElementCenter(
    element
  ) {
    const rectangle =
      element.getBoundingClientRect();

    return {
      x:
        rectangle.left +
        rectangle.width / 2,

      y:
        rectangle.top +
        rectangle.height / 2
    };
  }

  function getGatherDelta(
    element,
    layer
  ) {
    const center =
      getElementCenter(element);

    const gatherPoint =
      getLayerGatherPoint(layer);

    return {
      x:
        gatherPoint.x -
        center.x,

      y:
        gatherPoint.y -
        center.y
    };
  }

  function getProxyStartRect(
    layer
  ) {
    const gatherPoint =
      getLayerGatherPoint(layer);

    const buttonRectangle =
      getButtonRect(layer);

    return {
      x:
        gatherPoint.x -
        buttonRectangle.width / 2,

      y:
        gatherPoint.y -
        buttonRectangle.height / 2
    };
  }

  /* ==========================================================================
     TIMELINE STATE
     ========================================================================== */

  function syncTimelineState(
    timeline
  ) {
    if (!timeline) {
      return;
    }

    const time =
      timeline.time();

    elements.detailsTray
      .classList
      .toggle(
        "is-visible",
        time >= trayRevealTime
      );

    let highestLandedIndex = -1;

    layers.forEach(
      (layer, index) => {
        const isLanded =
          typeof layer.landTime ===
            "number" &&
          time >=
            layer.landTime - 0.02;

        if (isLanded) {
          highestLandedIndex =
            index;
        }
      }
    );

    layers.forEach(
      (layer, index) => {
        const isStageActive =
          typeof layer.startTime ===
            "number" &&
          typeof layer.endTime ===
            "number" &&
          time >= layer.startTime &&
          time < layer.endTime;

        if (layer.stage) {
          layer.stage
            .classList
            .toggle(
              "is-active",
              isStageActive
            );

          layer.stage.setAttribute(
            "aria-hidden",
            String(
              !isStageActive
            )
          );
        }

        if (!layer.button) {
          return;
        }

        const isLanded =
          typeof layer.landTime ===
            "number" &&
          time >=
            layer.landTime - 0.02;

        layer.button
          .classList
          .toggle(
            "is-landed",
            isLanded
          );

        layer.button
          .classList
          .toggle(
            "depth-button-new",
            isLanded &&
            index ===
              highestLandedIndex
          );

        if (isLanded) {
          layer.button
            .removeAttribute(
              "aria-hidden"
            );

          layer.button.tabIndex = 0;
        } else {
          layer.button
            .setAttribute(
              "aria-hidden",
              "true"
            );

          layer.button.tabIndex = -1;
        }
      }
    );

    if (
      highestLandedIndex !==
      lastAnnouncedIndex
    ) {
      lastAnnouncedIndex =
        highestLandedIndex;

      const text =
        highestLandedIndex >= 0
          ? layers[
              highestLandedIndex
            ].statusText
          : "";

      updateStatus(text);
    }

    if (
      highestLandedIndex ===
      layers.length - 1
    ) {
      updateStatus(
        "Vagabond now includes saved quotes, " +
        "moments, characters, notes, and thoughts."
      );
    }
  }

  function updateStatus(text) {
    if (
      !elements.status ||
      text === lastStatusText
    ) {
      return;
    }

    elements.status.textContent =
      text;

    lastStatusText =
      text;
  }

  /* ==========================================================================
     REDUCED MOTION
     ========================================================================== */

  function buildReducedMotionVersion() {
    resetMomentLayerOrder();

    gsap.set(elements.header, {
      autoAlpha: 1,
      y: 0
    });

    gsap.set(elements.viewport, {
      y: 0
    });

    gsap.set(elements.cardWrap, {
      autoAlpha: 1,
      y: 0,
      scale: 1
    });

    gsap.set(elements.detailsTray, {
      autoAlpha: 1,
      y: 0
    });

    elements.detailsTray
      .classList
      .add("is-visible");

    layers.forEach((layer) => {
      if (layer.stage) {
        layer.stage.setAttribute(
          "aria-hidden",
          "true"
        );

        layer.stage.classList.remove(
          "is-active"
        );

        gsap.set(layer.stage, {
          autoAlpha: 0
        });
      }

      if (layer.button) {
        layer.button.classList.add(
          "is-landed"
        );

        layer.button.removeAttribute(
          "aria-hidden"
        );

        layer.button.tabIndex = 0;

        gsap.set(layer.button, {
          autoAlpha: 1,
          y: 0,
          scale: 1
        });
      }

      if (layer.proxy) {
        gsap.set(layer.proxy, {
          autoAlpha: 0
        });
      }
    });

    updateStatus(
      "Vagabond includes saved quotes, " +
      "moments, characters, notes, and thoughts."
    );
  }
})();