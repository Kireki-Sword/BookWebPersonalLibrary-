/* ============================================================================
   SECTION 2 — SCROLL STORY JS
   ---------------------------------------------------------------------------
   Story:
   1. Card starts alone.
   2. Evidence appears.
   3. Evidence gathers.
   4. Evidence becomes a proxy button.
   5. Proxy button flies into the real tray button.
   6. Real button lands.
   ============================================================================ */

(() => {
  const section = document.querySelector("#section-2-empty-shelf");

  if (!section) return;

  const hasGSAP = window.gsap && window.ScrollTrigger;

  if (!hasGSAP) {
    console.warn("Section 2 animation needs GSAP and ScrollTrigger.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const statusEl = section.querySelector("#section-2-status");
  const cardWrap = section.querySelector(".card-wrap");
  const card = section.querySelector(".media-library-row");
  const score = section.querySelector(".media-row-score");
  const detailsTray = section.querySelector(".media-row-details");

  const layers = [
    {
      key: "quotes",
      stageSelector: '[data-stage="quotes-fall"]',
      itemSelector: ".falling-quote",
      buttonSelector: ".depth-button-quotes",
      label: "Quotes",
      statusText: "Quotes saved to Vagabond."
    },
    {
      key: "moments",
      stageSelector: '[data-stage="moments-move"]',
      itemSelector: ".moment-frame",
      buttonSelector: ".depth-button-moment",
      label: "Moments",
      statusText: "Moments saved to Vagabond."
    },
    {
      key: "characters",
      stageSelector: '[data-stage="characters-appear"]',
      itemSelector: ".character-name",
      buttonSelector: ".depth-button-character",
      label: "Characters",
      statusText: "Characters saved to Vagabond."
    },
    {
      key: "notes",
      stageSelector: '[data-stage="notes-appear"]',
      itemSelector: ".note-card",
      buttonSelector: ".depth-button-notes",
      label: "Notes",
      statusText: "Notes saved to Vagabond."
    },
    {
      key: "thoughts",
      stageSelector: '[data-stage="thoughts-appear"]',
      itemSelector: ".thought-card",
      buttonSelector: ".depth-button-thoughts",
      label: "Thoughts",
      statusText: "Thoughts saved to Vagabond."
    }
  ];

  let masterTimeline = null;
  let lastAnnouncedIndex = -2;
  let trayRevealTime = Infinity;

  initSection2();

  function initSection2() {
    section.classList.add("is-js-ready");

    collectLayerElements();
    createButtonProxies();
    setInitialState();

    if (prefersReducedMotion) {
      buildReducedMotionVersion();
      return;
    }

    masterTimeline = buildMasterTimeline();

    window.addEventListener("resize", () => {
      ScrollTrigger.refresh();
    });
  }

  function collectLayerElements() {
    layers.forEach((layer, index) => {
      layer.index = index;
      layer.stage = section.querySelector(layer.stageSelector);
      layer.items = layer.stage
        ? gsap.utils.toArray(layer.stage.querySelectorAll(layer.itemSelector))
        : [];
      layer.button = section.querySelector(layer.buttonSelector);
    });
  }

  function createButtonProxies() {
    layers.forEach((layer) => {
      const proxy = document.createElement("div");

      proxy.className = "depth-button-proxy";
      proxy.textContent = layer.label;
      proxy.setAttribute("aria-hidden", "true");

      document.body.appendChild(proxy);

      layer.proxy = proxy;
    });
  }

  function setInitialState() {
    gsap.set(cardWrap, {
      autoAlpha: 0,
      y: 28,
      scale: 0.985,
      transformOrigin: "center center"
    });

    gsap.set(card, {
      transformOrigin: "center center"
    });

    gsap.set(detailsTray, {
      autoAlpha: 0,
      y: 10
    });

    layers.forEach((layer) => {
      if (!layer.stage || !layer.button) return;

      layer.stage.setAttribute("aria-hidden", "true");
      layer.stage.classList.remove("is-active");

      gsap.set(layer.stage, {
        autoAlpha: 0
      });

      gsap.set(layer.items, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        filter: "blur(0px)",
        transformOrigin: "center center"
      });

      layer.button.classList.remove("is-landed", "depth-button-new");
      layer.button.setAttribute("aria-hidden", "true");
      layer.button.tabIndex = -1;

      gsap.set(layer.button, {
        autoAlpha: 0,
        y: 8,
        scale: 0.96
      });

      gsap.set(layer.proxy, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: 0.8,
        rotationX: 0,
        rotationY: 0
      });
    });
  }

  function buildMasterTimeline() {
    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out"
      },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.max(window.innerHeight * 7, 6200),
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: () => syncTimelineState(tl)
      }
    });

    tl.addLabel("intro");

    tl.to(cardWrap, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.8
    });

    tl.fromTo(
      score,
      {
        boxShadow: "0 8px 22px rgba(44, 36, 22, 0.06)"
      },
      {
        boxShadow: "0 18px 46px rgba(184, 121, 78, 0.24)",
        duration: 0.25,
        yoyo: true,
        repeat: 1
      },
      "-=0.15"
    );

    tl.to({}, { duration: 0.35 });

    layers.forEach((layer) => {
      addLayerSequence(tl, layer);
    });

    tl.addLabel("final");

    tl.to(card, {
      y: -3,
      duration: 0.35
    });

    tl.to(
      layers.map((layer) => layer.button),
      {
        scale: 1.045,
        duration: 0.12,
        stagger: 0.06,
        yoyo: true,
        repeat: 1
      },
      "<"
    );

    tl.to({}, { duration: 0.65 });

    return tl;
  }

  function addLayerSequence(tl, layer) {
    if (!layer.stage || !layer.button || !layer.items.length) return;

    layer.startTime = tl.duration();

    tl.addLabel(`${layer.key}-start`);

    tl.to(layer.stage, {
      autoAlpha: 1,
      duration: 0.22
    });

    tl.fromTo(
      layer.items,
      getEvidenceEnterFrom(layer),
      getEvidenceEnterTo(layer),
      "<"
    );

    tl.to({}, { duration: 0.38 });

    tl.to(layer.items, {
      x: (_index, element) => getGatherDelta(element).x,
      y: (_index, element) => getGatherDelta(element).y,
      scale: 0.24,
      rotation: 0,
      autoAlpha: 0.22,
      filter: "blur(2px)",
      stagger: {
        each: 0.035,
        from: "center"
      },
      duration: 0.48,
      ease: "power2.inOut"
    });

    if (layer.index === 0) {
      trayRevealTime = tl.duration();

      tl.to(
        detailsTray,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.24
        },
        "-=0.08"
      );
    }

    tl.set(
      layer.proxy,
      {
        autoAlpha: 1,
        x: () => getProxyStartRect(layer).x,
        y: () => getProxyStartRect(layer).y,
        width: () => getButtonRect(layer).width,
        height: () => getButtonRect(layer).height,
        scale: 0.78,
        rotationX: 12,
        rotationY: -8
      },
      "-=0.08"
    );

    tl.to(layer.proxy, {
      scale: 1,
      duration: 0.16
    });

    tl.to(layer.proxy, {
      x: () => getButtonRect(layer).left,
      y: () => getButtonRect(layer).top,
      width: () => getButtonRect(layer).width,
      height: () => getButtonRect(layer).height,
      rotationX: 0,
      rotationY: 0,
      duration: 0.55,
      ease: "power3.inOut"
    });

    layer.landTime = tl.duration();

    tl.set(
      layer.button,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1
      },
      "-=0.04"
    );

    tl.to(
      layer.proxy,
      {
        autoAlpha: 0,
        scale: 0.96,
        duration: 0.12
      },
      "<"
    );

    tl.to(
      layer.button,
      {
        scale: 1.055,
        duration: 0.12,
        yoyo: true,
        repeat: 1
      },
      "<"
    );

    tl.to(layer.stage, {
      autoAlpha: 0,
      duration: 0.22
    });

    tl.to({}, { duration: 0.18 });

    layer.endTime = tl.duration();
  }

  function getEvidenceEnterFrom(layer) {
    const base = {
      autoAlpha: 0,
      scale: 0.96,
      filter: "blur(7px)"
    };

    if (layer.key === "quotes") {
      return {
        ...base,
        x: (index) => [-130, 125, -80, 90][index % 4],
        y: (index) => [-85, -60, 55, 75][index % 4],
        rotation: (index, element) => getElementRotate(element) * 2
      };
    }

    if (layer.key === "moments") {
      return {
        ...base,
        x: (index) => [-150, 150, 0][index % 3],
        y: (index) => [40, 50, 95][index % 3],
        scale: 0.9,
        rotation: (index, element) => getElementRotate(element) * 1.6
      };
    }

    if (layer.key === "characters") {
      return {
        ...base,
        x: (index) => [-170, 150, -110, 120, -70, 80, 0][index % 7],
        y: (index) => [40, 30, 80, 75, 20, 60, 95][index % 7],
        scale: 0.9,
        rotation: (index, element) => getElementRotate(element) * 1.4
      };
    }

    if (layer.key === "notes") {
      return {
        ...base,
        x: (index) => [-90, 95, 0][index % 3],
        y: (index) => [45, 55, 75][index % 3],
        scale: 0.94,
        rotation: (index, element) => getElementRotate(element) * 1.8
      };
    }

    return {
      ...base,
      x: (index) => [-50, 50][index % 2],
      y: 30,
      scale: 0.96,
      rotation: 0
    };
  }

  function getEvidenceEnterTo(layer) {
    return {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: (index, element) => Number(element.dataset.scale || 1),
      rotation: (index, element) => getElementRotate(element),
      filter: "blur(0px)",
      duration: getEnterDuration(layer),
      stagger: {
        each: getEnterStagger(layer),
        from: "start"
      },
      ease: "power3.out"
    };
  }

  function getEnterDuration(layer) {
    if (layer.key === "thoughts") return 0.72;
    if (layer.key === "characters") return 0.6;
    return 0.55;
  }

  function getEnterStagger(layer) {
    if (layer.key === "characters") return 0.055;
    if (layer.key === "thoughts") return 0.12;
    return 0.075;
  }

  function getElementRotate(element) {
    return Number(element.dataset.rotate || 0);
  }

  function getGatherPoint() {
    const cardRect = card.getBoundingClientRect();

    return {
      x: cardRect.left + cardRect.width * 0.72,
      y: cardRect.bottom - 76
    };
  }

  function getElementCenter(element) {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function getGatherDelta(element) {
    const elementCenter = getElementCenter(element);
    const gatherPoint = getGatherPoint();

    return {
      x: gatherPoint.x - elementCenter.x,
      y: gatherPoint.y - elementCenter.y
    };
  }

  function getButtonRect(layer) {
    const rect = layer.button.getBoundingClientRect();

    return {
      left: rect.left,
      top: rect.top,
      width: Math.max(rect.width, 88),
      height: Math.max(rect.height, 38)
    };
  }

  function getProxyStartRect(layer) {
    const gatherPoint = getGatherPoint();
    const buttonRect = getButtonRect(layer);

    return {
      x: gatherPoint.x - buttonRect.width / 2,
      y: gatherPoint.y - buttonRect.height / 2
    };
  }

  function syncTimelineState(tl) {
    if (!tl) return;

    const time = tl.time();

    const trayIsVisible = time >= trayRevealTime;
    detailsTray.classList.toggle("is-visible", trayIsVisible);

    let highestLandedIndex = -1;

    layers.forEach((layer, index) => {
      const isStageActive =
        typeof layer.startTime === "number" &&
        typeof layer.endTime === "number" &&
        time >= layer.startTime &&
        time < layer.endTime;

      if (layer.stage) {
        layer.stage.classList.toggle("is-active", isStageActive);
        layer.stage.setAttribute("aria-hidden", String(!isStageActive));
      }

      const isLanded =
        typeof layer.landTime === "number" && time >= layer.landTime - 0.02;

      if (isLanded) highestLandedIndex = index;

      if (layer.button) {
        layer.button.classList.toggle("is-landed", isLanded);
        layer.button.classList.toggle(
          "depth-button-new",
          isLanded && index === highestLandedIndex
        );

        if (isLanded) {
          layer.button.removeAttribute("aria-hidden");
          layer.button.tabIndex = 0;
        } else {
          layer.button.setAttribute("aria-hidden", "true");
          layer.button.tabIndex = -1;
        }
      }
    });

    if (highestLandedIndex !== lastAnnouncedIndex) {
      lastAnnouncedIndex = highestLandedIndex;

      if (highestLandedIndex >= 0) {
        updateStatus(layers[highestLandedIndex].statusText);
      } else {
        updateStatus("");
      }
    }

    const allLayersLanded = highestLandedIndex === layers.length - 1;

    if (allLayersLanded) {
      updateStatus(
        "Vagabond now includes saved quotes, moments, characters, notes, and thoughts."
      );
    }
  }

  function updateStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text;
  }

  function buildReducedMotionVersion() {
    gsap.set(cardWrap, {
      autoAlpha: 1,
      y: 0,
      scale: 1
    });

    gsap.set(detailsTray, {
      autoAlpha: 1,
      y: 0
    });

    detailsTray.classList.add("is-visible");

    layers.forEach((layer) => {
      if (layer.stage) {
        layer.stage.setAttribute("aria-hidden", "true");
        layer.stage.classList.remove("is-active");

        gsap.set(layer.stage, {
          autoAlpha: 0
        });
      }

      if (layer.button) {
        layer.button.classList.add("is-landed");
        layer.button.removeAttribute("aria-hidden");
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
      "Vagabond includes saved quotes, moments, characters, notes, and thoughts."
    );
  }
})();