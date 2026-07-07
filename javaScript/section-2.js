/* ============================================================================
   SECTION 2 — SCROLL STORY JS V4
   ---------------------------------------------------------------------------
   Behavior:
   - Card starts visible in the normal HTML position under the title/subtitle.
   - On scroll, title/subtitle fade upward.
   - The stage moves upward to reclaim the title space.
   - The card anchors lower, but stays fully visible.
   - Quotes / moments / characters / notes / thoughts appear above the card.
   - Each evidence group gathers into a temporary proxy button.
   - The proxy button lands into the real button slot.
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
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
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

  function setInitialState() {
    gsap.set(header, {
      autoAlpha: 1,
      y: 0
    });

    gsap.set(viewport, {
      y: 0
    });

    /*
      The card should start visible in normal page position.
      No fade-in. No fake intro position.
    */
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

    tl.addLabel("natural-card");

    /*
      Step 1:
      The user sees the normal card under the title/subtitle first.
    */
    tl.to({}, { duration: 0.5 });

    tl.fromTo(
      score,
      {
        boxShadow: "0 8px 22px rgba(44, 36, 22, 0.06)"
      },
      {
        boxShadow: "0 18px 46px rgba(184, 121, 78, 0.24)",
        duration: 0.22,
        yoyo: true,
        repeat: 1
      }
    );

    tl.to({}, { duration: 0.18 });

    /*
      Step 2:
      The header fades away.
      The stage moves upward to reclaim header space.
      The card anchors lower, but stays visible.
    */
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

    /*
      Small pause so quotes do not appear while the card is still moving.
    */
    tl.to({}, { duration: 0.4 });

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

    /*
      Let the evidence stay readable before it gathers.
    */
    tl.to({}, { duration: getReadDuration(layer) });

    tl.to(layer.items, {
      x: (_index, element) => getGatherDelta(element, layer).x,
      y: (_index, element) => getGatherDelta(element, layer).y,
      scale: 0.28,
      rotation: 0,
      autoAlpha: 0.55,
      filter: "blur(1.5px)",
      stagger: {
        each: 0.035,
        from: "center"
      },
      duration: 0.5,
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
      scale: 0.96,
      filter: "blur(6px)"
    };

    if (layer.key === "quotes") {
      return {
        ...base,
        x: (index) => [-70, 70, -45, 45][index % 4],
        y: (index) => [-28, -22, 32, 36][index % 4],
        rotation: (index, element) => getElementRotate(element) * 1.5
      };
    }

    if (layer.key === "moments") {
      return {
        ...base,
        x: (index) => [-85, 85, 0][index % 3],
        y: (index) => [28, 30, 45][index % 3],
        scale: 0.92,
        rotation: (index, element) => getElementRotate(element) * 1.3
      };
    }

    if (layer.key === "characters") {
      return {
        ...base,
        x: (index) => [-90, 90, -60, 60, -40, 40, 0][index % 7],
        y: (index) => [18, 18, 34, 34, 22, 28, 42][index % 7],
        scale: 0.9,
        rotation: (index, element) => getElementRotate(element) * 1.2
      };
    }

    if (layer.key === "notes") {
      return {
        ...base,
        x: (index) => [-58, 58, 0][index % 3],
        y: (index) => [28, 34, 40][index % 3],
        scale: 0.94,
        rotation: (index, element) => getElementRotate(element) * 1.5
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

  function getEnterDuration(layer) {
    if (layer.key === "thoughts") return 0.72;
    if (layer.key === "characters") return 0.6;
    return 0.55;
  }

  function getEnterStagger(layer) {
    if (layer.key === "characters") return 0.045;
    if (layer.key === "thoughts") return 0.12;
    return 0.065;
  }

  function getReadDuration(layer) {
    if (layer.key === "thoughts") return 0.6;
    if (layer.key === "characters") return 0.48;
    return 0.44;
  }

  function getElementRotate(element) {
    return Number(element.dataset.rotate || 0);
  }

  function getViewportLiftY() {
    const headerRect = header.getBoundingClientRect();

    /*
      Header fades visually, but its layout space still exists.
      This moves the stage up so the card/evidence are not pushed too low.
    */
    const maxLift = window.innerWidth <= 640 ? 160 : 240;
    const desiredLift = headerRect.height + 40;

    return -Math.min(desiredLift, maxLift);
  }

  function getCardAnchorY() {
    const cardRect = cardWrap.getBoundingClientRect();
    const viewportLift = getViewportLiftY();

    /*
      Target:
      - card should be lower than the evidence
      - card should remain fully visible
      - card should not sit at the very bottom edge
    */
    const bottomPadding = window.innerWidth <= 640 ? 32 : 64;

    const targetTopByRatio =
      window.innerHeight * (window.innerWidth <= 640 ? 0.5 : 0.54);

    const safeBottomTop =
      window.innerHeight - cardRect.height - bottomPadding;

    const targetTop = Math.min(targetTopByRatio, safeBottomTop);

    const currentTopAfterViewportLift = cardRect.top + viewportLift;
    const moveAmount = targetTop - currentTopAfterViewportLift;

    return gsap.utils.clamp(-220, 240, moveAmount);
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
      y: buttonRect.top - 42
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