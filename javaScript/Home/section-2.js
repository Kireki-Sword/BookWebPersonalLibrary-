/* ============================================================================
   SECTION 2 — FINAL SCROLL STORY JS
   Updated for:
   - 9 quote cards
   - 8 moment cards
   - full-width evidence stages
   - top-layer hover/focus behavior
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

  const header = section.querySelector(".section-2-header");
  const statusEl = section.querySelector("#section-2-status");
  const viewport = section.querySelector(".stage-viewport");
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
  let lastStatusText = "";
  let trayRevealTime = Number.POSITIVE_INFINITY;
  let resizeTimer = null;
  let refreshTimer = null;
  let topLayerZ = 1000;

  initSection2();

  function initSection2() {
    section.classList.add("is-js-ready");

    collectLayerElements();
    createButtonProxies();
    enableTopLayerHover();
    setInitialState();

    if (prefersReducedMotion) {
      buildReducedMotionVersion();
      return;
    }

    masterTimeline = buildMasterTimeline();
    setupSafeRefreshes();
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
    document
      .querySelectorAll('[data-section-2-proxy="true"]')
      .forEach((proxy) => proxy.remove());

    layers.forEach((layer) => {
      const proxy = document.createElement("div");

      proxy.className = "depth-button-proxy";
      proxy.textContent = layer.label;
      proxy.setAttribute("aria-hidden", "true");
      proxy.setAttribute("data-section-2-proxy", "true");

      document.body.appendChild(proxy);
      layer.proxy = proxy;
    });
  }

  function enableTopLayerHover() {
    const liftableItems = section.querySelectorAll(
      ".falling-quote, .moment-frame, .character-name, .note-card, .thought-card"
    );

    liftableItems.forEach((item) => {
      const raise = () => {
        topLayerZ += 1;
        item.style.zIndex = String(topLayerZ);
        item.classList.add("is-top-layer");
      };

      const lower = () => {
        item.classList.remove("is-top-layer");
      };

      item.addEventListener("pointerenter", raise);
      item.addEventListener("focusin", raise);
      item.addEventListener("pointerleave", lower);
      item.addEventListener("focusout", lower);
    });
  }

  function setupSafeRefreshes() {
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => queueSafeRefresh(), 150);
    });

    window.addEventListener(
      "load",
      () => {
        queueSafeRefresh(120);
      },
      { once: true }
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => queueSafeRefresh(120))
        .catch(() => {});
    }

    const images = gsap.utils.toArray(section.querySelectorAll("img"));

    images.forEach((img) => {
      if (img.complete) return;

      img.addEventListener("load", () => queueSafeRefresh(120), { once: true });
      img.addEventListener("error", () => queueSafeRefresh(120), { once: true });
    });
  }

  function queueSafeRefresh(delay = 80) {
    clearTimeout(refreshTimer);

    refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, delay);
  }

  function setInitialState() {
    gsap.set(header, {
      autoAlpha: 1,
      y: 0
    });

    gsap.set(viewport, {
      y: 0
    });

    gsap.set(cardWrap, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      transformOrigin: "center center"
    });

    gsap.set(card, {
      y: 0,
      transformOrigin: "center center"
    });

    gsap.set(detailsTray, {
      autoAlpha: 0,
      y: 10
    });

    detailsTray.classList.remove("is-visible");

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

    updateStatus("");
    lastAnnouncedIndex = -2;
  }

  function resetToNaturalStart() {
    gsap.set(header, {
      autoAlpha: 1,
      y: 0
    });

    gsap.set(viewport, {
      y: 0
    });

    gsap.set(cardWrap, {
      autoAlpha: 1,
      y: 0,
      scale: 1
    });

    gsap.set(card, {
      y: 0
    });

    gsap.set(detailsTray, {
      autoAlpha: 0,
      y: 10
    });

    detailsTray.classList.remove("is-visible");

    layers.forEach((layer) => {
      if (layer.stage) {
        layer.stage.classList.remove("is-active");
        layer.stage.setAttribute("aria-hidden", "true");

        gsap.set(layer.stage, {
          autoAlpha: 0
        });
      }

      if (layer.items) {
        gsap.set(layer.items, {
          autoAlpha: 0,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          filter: "blur(0px)"
        });
      }

      if (layer.button) {
        layer.button.classList.remove("is-landed", "depth-button-new");
        layer.button.setAttribute("aria-hidden", "true");
        layer.button.tabIndex = -1;

        gsap.set(layer.button, {
          autoAlpha: 0,
          y: 8,
          scale: 0.96
        });
      }

      if (layer.proxy) {
        gsap.set(layer.proxy, {
          autoAlpha: 0
        });
      }
    });

    updateStatus("");
    lastAnnouncedIndex = -2;
  }

  function buildMasterTimeline() {
    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out"
      },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.max(window.innerHeight * 8.5, 7600),
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onRefreshInit: () => {
          gsap.set([viewport, cardWrap, card], {
            y: 0
          });
        },

        onRefresh: (self) => {
          syncTimelineState(self.animation);
        },

        onUpdate: (self) => {
          syncTimelineState(self.animation);
        },

        onLeaveBack: () => {
          resetToNaturalStart();
        }
      }
    });

    tl.addLabel("natural-card");

    tl.to({}, { duration: 0.5 });

    tl.fromTo(
      score,
      {
        boxShadow: "0 8px 22px rgba(0, 0, 0, 0.28)"
      },
      {
        boxShadow:
          "0 18px 46px rgba(155, 124, 255, 0.24), 0 0 34px rgba(124, 140, 255, 0.18)",
        duration: 0.22,
        yoyo: true,
        repeat: 1
      }
    );

    tl.to({}, { duration: 0.18 });

    tl.addLabel("anchor-card");

    tl.to(
      header,
      {
        autoAlpha: 0,
        y: -58,
        duration: 0.75,
        ease: "power2.inOut"
      },
      "anchor-card"
    );

    tl.to(
      viewport,
      {
        y: () => getViewportLiftY(),
        duration: 0.9,
        ease: "power3.inOut"
      },
      "anchor-card"
    );

    tl.to(
      cardWrap,
      {
        y: () => getCardAnchorY(),
        duration: 0.9,
        ease: "power3.inOut"
      },
      "anchor-card"
    );

    tl.to({}, { duration: 0.42 });

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
      duration: 0.18
    });

    tl.fromTo(
      layer.items,
      getEvidenceEnterFrom(layer),
      getEvidenceEnterTo(layer),
      "<"
    );

    tl.to({}, { duration: getReadDuration(layer) });

    tl.to(layer.items, {
      x: (_index, element) => getGatherDelta(element, layer).x,
      y: (_index, element) => getGatherDelta(element, layer).y,
      scale: getGatherScale(layer),
      rotation: 0,
      autoAlpha: 0.55,
      filter: "blur(1.5px)",
      stagger: {
        each: 0.028,
        from: "center"
      },
      duration: 0.55,
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
      duration: 0.52,
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
      scale: 0.94,
      filter: "blur(6px)"
    };

    if (layer.key === "quotes") {
      return {
        ...base,
        x: (index) =>
          [-130, -70, 95, -100, 45, 130, -80, 70, 20][index % 9],
        y: (index) =>
          [-42, -28, -44, 38, 52, 34, 72, 68, 82][index % 9],
        rotation: (_index, element) => getElementRotate(element) * 1.35
      };
    }

    if (layer.key === "moments") {
      return {
        ...base,
        x: (index) =>
          [-140, -92, -36, 48, 108, 152, 194, 236][index % 8],
        y: (index) =>
          [40, 64, 34, 92, 20, 54, 28, 78][index % 8],
        scale: 0.9,
        rotation: (_index, element) => getElementRotate(element) * 1.25
      };
    }

    if (layer.key === "characters") {
      return {
        ...base,
        x: (index) =>
          [-160, -100, -48, 32, 88, 142, 198][index % 7],
        y: (index) =>
          [30, 52, 38, 24, 52, 34, 46][index % 7],
        scale: 0.9,
        rotation: (_index, element) => getElementRotate(element) * 1.2
      };
    }

    if (layer.key === "notes") {
      return {
        ...base,
        x: (index) => [-58, 58, 0][index % 3],
        y: (index) => [28, 34, 40][index % 3],
        scale: 0.94,
        rotation: (_index, element) => getElementRotate(element) * 1.5
      };
    }

    return {
      ...base,
      x: (index) => [-35, 35][index % 2],
      y: 22,
      scale: 0.96,
      rotation: 0
    };
  }

  function getEvidenceEnterTo(layer) {
    return {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: (_index, element) => Number(element.dataset.scale || 1),
      rotation: (_index, element) => getElementRotate(element),
      filter: "blur(0px)",
      duration: getEnterDuration(layer),
      stagger: {
        each: getEnterStagger(layer),
        from: "start"
      },
      ease: "power3.out"
    };
  }

  function getGatherScale(layer) {
    if (layer.key === "quotes") return 0.18;
    if (layer.key === "moments") return 0.2;
    if (layer.key === "characters") return 0.2;
    return 0.28;
  }

  function getEnterDuration(layer) {
    if (layer.key === "quotes") return 0.72;
    if (layer.key === "moments") return 0.74;
    if (layer.key === "characters") return 0.7;
    if (layer.key === "thoughts") return 0.72;
    return 0.55;
  }

  function getEnterStagger(layer) {
    if (layer.key === "quotes") return 0.032;
    if (layer.key === "moments") return 0.036;
    if (layer.key === "characters") return 0.04;
    if (layer.key === "thoughts") return 0.12;
    return 0.065;
  }

  function getReadDuration(layer) {
    if (layer.key === "quotes") return 1.08;
    if (layer.key === "moments") return 0.92;
    if (layer.key === "characters") return 0.78;
    if (layer.key === "thoughts") return 0.6;
    return 0.44;
  }

  function getElementRotate(element) {
    return Number(element.dataset.rotate || 0);
  }

  function getViewportLiftY() {
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const maxLift = window.innerWidth <= 640 ? 160 : 235;
    const desiredLift = headerHeight + 34;

    return -Math.min(desiredLift, maxLift);
  }

  function getCardAnchorY() {
    const savedViewportY = gsap.getProperty(viewport, "y");
    const savedCardY = gsap.getProperty(cardWrap, "y");

    gsap.set(viewport, { y: 0 });
    gsap.set(cardWrap, { y: 0 });

    const sectionRect = section.getBoundingClientRect();
    const cardRect = cardWrap.getBoundingClientRect();

    const cardTopInsidePinnedSection = cardRect.top - sectionRect.top;
    const viewportLiftY = getViewportLiftY();

    const topGap = window.innerWidth <= 640 ? 12 : 18;
    const bottomGap = window.innerWidth <= 640 ? 18 : 24;

    const targetBottom = window.innerHeight - bottomGap;
    const targetTop = Math.max(topGap, targetBottom - cardRect.height);

    const cardTopAfterViewportLift =
      cardTopInsidePinnedSection + viewportLiftY;

    const neededCardMove = targetTop - cardTopAfterViewportLift;

    gsap.set(viewport, { y: savedViewportY });
    gsap.set(cardWrap, { y: savedCardY });

    return neededCardMove;
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

  function getLayerGatherPoint(layer) {
    const buttonRect = getButtonRect(layer);

    return {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top - 44
    };
  }

  function getElementCenter(element) {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function getGatherDelta(element, layer) {
    const elementCenter = getElementCenter(element);
    const gatherPoint = getLayerGatherPoint(layer);

    return {
      x: gatherPoint.x - elementCenter.x,
      y: gatherPoint.y - elementCenter.y
    };
  }

  function getProxyStartRect(layer) {
    const gatherPoint = getLayerGatherPoint(layer);
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

    if (highestLandedIndex === layers.length - 1) {
      updateStatus(
        "Vagabond now includes saved quotes, moments, characters, notes, and thoughts."
      );
    }
  }

  function updateStatus(text) {
    if (!statusEl || text === lastStatusText) return;

    statusEl.textContent = text;
    lastStatusText = text;
  }

  function buildReducedMotionVersion() {
    gsap.set(header, {
      autoAlpha: 1,
      y: 0
    });

    gsap.set(viewport, {
      y: 0
    });

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