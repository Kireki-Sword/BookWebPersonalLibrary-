/* ============================================================================
   Inkwell — Section 2 GSAP Scroll Story
   ------------------------------------------------------------------------
   Story goal:
   A simple rating card starts with only cover/title/author/chips/rating.
   Then each hidden layer appears, gathers, becomes a 3D button seed, and lands
   into the Saved Layers row: Quotes, Moments, Characters, Notes, Thoughts.

   Requirements:
   - GSAP + ScrollTrigger must be loaded before this file.
   - Uses the GSAP-ready CSS classes added previously:
     .is-gsap-story, .is-story-ready, .is-bare-card, .has-saved-layers,
     .is-visible, .is-in-row, .is-active, .layer-button-seed.
   ============================================================================ */

(function () {
  "use strict";

  const STORY_CONFIG = {
    sectionSelector: "#section-2-empty-shelf, .section-empty-shelf",
    scrollSelector: ".empty-shelf-scroll",
    stageSelector: ".scroll-stage",
    cardSelector: ".media-library-row",
    detailsSelector: ".media-row-details",
    buttonSelector: ".depth-button",
    scoreSelector: ".media-row-score",
    desktopQuery: "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
    headerHeightVar: "--header-height",
    defaultHeaderHeight: 52,
    scrollDistanceScreens: 6.8,
    minScrollDistance: 4300,
    layers: [
      {
        key: "quotes",
        label: "Quotes",
        sceneSelector: ".falling-quotes",
        itemSelector: ".falling-quote",
        enter: { y: 44, blur: 6, scale: 0.94, rotation: 2 },
        stagger: 0.08,
        gatherScale: 0.18
      },
      {
        key: "moments",
        label: "Moments",
        sceneSelector: ".moving-moments",
        itemSelector: ".moment-frame",
        enter: { y: 70, blur: 8, scale: 0.92, rotation: 1.5 },
        stagger: 0.075,
        gatherScale: 0.16
      },
      {
        key: "characters",
        label: "Characters",
        sceneSelector: ".character-cloud",
        itemSelector: ".character-name",
        enter: { y: 32, blur: 5, scale: 0.9, rotation: 4 },
        stagger: 0.07,
        gatherScale: 0.15
      },
      {
        key: "notes",
        label: "Notes",
        sceneSelector: ".notes-cloud",
        itemSelector: ".note-card",
        enter: { y: 30, blur: 5, scale: 0.95, rotation: 3 },
        stagger: 0.055,
        gatherScale: 0.16
      },
      {
        key: "thoughts",
        label: "Thoughts",
        sceneSelector: ".thoughts-cloud",
        itemSelector: ".thought-card",
        enter: { y: 22, blur: 7, scale: 0.96, rotation: 1 },
        stagger: 0.07,
        gatherScale: 0.14
      }
    ]
  };

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function getCssPixelNumber(element, variableName, fallback) {
    const raw = getComputedStyle(element).getPropertyValue(variableName).trim();
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function pickFirstWithChildren(root, selector, childSelector) {
    const matches = toArray(root.querySelectorAll(selector));
    return matches.find((node) => node.querySelector(childSelector)) || matches[0] || null;
  }

  function findLayerButton(details, layer) {
    if (!details) return null;

    const possibleSelectors = [
      `[data-layer="${layer.key}"]`,
      `[data-layer-key="${layer.key}"]`,
      `[data-depth="${layer.key}"]`,
      `[data-story-layer="${layer.key}"]`,
      `[aria-label="${layer.label}"]`
    ];

    for (const selector of possibleSelectors) {
      const direct = details.querySelector(selector);
      if (direct) return direct;
    }

    const buttons = toArray(details.querySelectorAll(STORY_CONFIG.buttonSelector));
    return buttons.find((button) =>
      normalizeText(button.textContent).includes(normalizeText(layer.label))
    ) || null;
  }

  function getRelativeCenter(element, container) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      x: elementRect.left + elementRect.width / 2 - containerRect.left,
      y: elementRect.top + elementRect.height / 2 - containerRect.top
    };
  }

  function measureButtonCenters({ card, details, buttons, container }) {
    if (!card || !details || !container) return new Map();

    const centers = new Map();

    const previous = {
      cardClasses: card.className,
      detailsClasses: details.className,
      detailsStyle: details.getAttribute("style"),
      buttonStates: buttons.map((button) => ({
        element: button,
        className: button.className,
        style: button.getAttribute("style")
      }))
    };

    card.classList.remove("is-bare-card");
    card.classList.add("has-saved-layers", "is-measuring");

    details.classList.remove("is-empty");
    details.classList.add("is-visible");
    details.style.opacity = "0";
    details.style.visibility = "hidden";
    details.style.pointerEvents = "none";

    buttons.forEach((button) => {
      button.classList.add("is-in-row");
      button.style.opacity = "0";
      button.style.visibility = "hidden";
      button.style.pointerEvents = "none";
      button.style.transform = "translateY(0) scale(1) rotateX(0deg)";
    });

    details.offsetHeight;

    buttons.forEach((button) => {
      centers.set(button, getRelativeCenter(button, container));
    });

    card.className = previous.cardClasses;
    details.className = previous.detailsClasses;

    if (previous.detailsStyle === null) {
      details.removeAttribute("style");
    } else {
      details.setAttribute("style", previous.detailsStyle);
    }

    previous.buttonStates.forEach(({ element, className, style }) => {
      element.className = className;

      if (style === null) {
        element.removeAttribute("style");
      } else {
        element.setAttribute("style", style);
      }
    });

    return centers;
  }

  function createSeed(layer, container) {
    const seed = document.createElement("span");
    seed.className = "layer-button-seed";
    seed.dataset.layer = layer.key;
    seed.textContent = layer.label;
    seed.setAttribute("aria-hidden", "true");
    container.appendChild(seed);
    return seed;
  }

  function setSceneVisibility(layer, isVisible) {
    if (!layer.scene) return;

    layer.scene.classList.toggle("is-visible", isVisible);
    layer.items.forEach((item) => item.classList.toggle("is-visible", isVisible));
  }

  function setButtonSaved(layer, isSaved) {
    if (!layer.button) return;

    layer.button.classList.toggle("is-in-row", isSaved);
    layer.button.classList.toggle("is-active", isSaved);
  }

  function syncStoryState({ timeline, card, details, layers, rowVisibleTime }) {
    const time = timeline.time();
    const rowVisible = time >= rowVisibleTime;

    if (card) {
      card.classList.toggle("is-bare-card", !rowVisible);
      card.classList.toggle("has-saved-layers", rowVisible);
    }

    if (details) {
      details.classList.toggle("is-empty", !rowVisible);
      details.classList.toggle("is-visible", rowVisible);
    }

    layers.forEach((layer) => {
      const activeWindowStart = layer.startTime ?? Number.POSITIVE_INFINITY;
      const activeWindowEnd = layer.sceneEndTime ?? activeWindowStart;

      const isSceneActive =
        time >= activeWindowStart - 0.001 &&
        time <= activeWindowEnd + 0.001;

      const isSaved =
        time >= (layer.savedTime ?? Number.POSITIVE_INFINITY) - 0.001;

      setSceneVisibility(layer, isSceneActive);
      setButtonSaved(layer, isSaved);
    });
  }

  function disableInactiveStages(stages, activeStage) {
    stages.forEach((stage) => {
      stage.classList.toggle("is-current", stage === activeStage);

      if (stage !== activeStage) {
        stage.setAttribute("aria-hidden", "true");
      } else {
        stage.removeAttribute("aria-hidden");
      }
    });
  }

  function normalizeStoryDom(section, scroll, card) {
    const stages = toArray(section.querySelectorAll(STORY_CONFIG.stageSelector));
    const activeStage = card?.closest(STORY_CONFIG.stageSelector) || stages[0] || scroll;

    disableInactiveStages(stages, activeStage);

    STORY_CONFIG.layers.forEach((layer) => {
      const scene = pickFirstWithChildren(section, layer.sceneSelector, layer.itemSelector);

      if (scene && scene.parentElement !== activeStage) {
        activeStage.appendChild(scene);
      }

      toArray(section.querySelectorAll(layer.sceneSelector)).forEach((duplicate) => {
        if (duplicate !== scene) duplicate.setAttribute("aria-hidden", "true");
      });
    });

    return { stages, activeStage };
  }

  function buildLayerData(section, details, container) {
    return STORY_CONFIG.layers
      .map((layer) => {
        const scene = pickFirstWithChildren(section, layer.sceneSelector, layer.itemSelector);
        const items = scene ? toArray(scene.querySelectorAll(layer.itemSelector)) : [];
        const button = findLayerButton(details, layer);

        if (!scene || items.length === 0 || !button) {
          return null;
        }

        return {
          ...layer,
          scene,
          items,
          button,
          seed: createSeed(layer, container),
          target: null,
          startTime: null,
          sceneEndTime: null,
          savedTime: null
        };
      })
      .filter(Boolean);
  }

  function getAlternatingOffset(index, amount) {
    const direction = index % 2 === 0 ? -1 : 1;
    return direction * amount;
  }

  function addLayerSequence(timeline, layer, index, context) {
    const { container, buttonCenters, rowVisibleTimeRef } = context;

    const center = {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2
    };

    const target = buttonCenters.get(layer.button) || center;

    layer.startTime = timeline.duration();

    timeline.addLabel(`${layer.key}Enter`);

    timeline.set(layer.scene, { autoAlpha: 1 }, layer.startTime);

    timeline.set(layer.items, {
      autoAlpha: 0,
      x: 0,
      y: layer.enter.y,
      scale: layer.enter.scale,
      rotation: (itemIndex) => getAlternatingOffset(itemIndex, layer.enter.rotation),
      filter: `blur(${layer.enter.blur}px)`
    }, layer.startTime);

    timeline.to(layer.items, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotation: 0,
      filter: "blur(0px)",
      duration: 0.58,
      stagger: layer.stagger,
      ease: "power3.out"
    }, layer.startTime + 0.02);

    timeline.to({}, { duration: 0.22 });

    const gatherStart = timeline.duration();
    layer.sceneEndTime = gatherStart + 0.72;

    timeline.addLabel(`${layer.key}Gather`, gatherStart);

    timeline.to(layer.items, {
      "--story-x": "0px",
      "--story-y": "0px",
      "--story-rotate": "0deg",
      x: 0,
      y: 0,
      scale: layer.gatherScale,
      autoAlpha: 0,
      filter: "blur(5px)",
      duration: 0.54,
      stagger: Math.min(layer.stagger * 0.55, 0.045),
      ease: "power2.in"
    }, gatherStart);

    const seedStart = gatherStart + 0.22;
    const seedFlyStart = seedStart + 0.28;

    if (index === 0) {
      rowVisibleTimeRef.value = seedFlyStart - 0.05;
    }

    timeline.set(layer.seed, {
      left: center.x,
      top: center.y,
      xPercent: -50,
      yPercent: -50,
      autoAlpha: 0,
      scale: 0.52,
      rotateX: 18,
      rotateY: -5,
      filter: "blur(4px)"
    }, seedStart);

    timeline.to(layer.seed, {
      autoAlpha: 1,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      filter: "blur(0px)",
      duration: 0.28,
      ease: "back.out(1.35)"
    }, seedStart);

    timeline.to(layer.seed, {
      left: target.x,
      top: target.y,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      duration: 0.48,
      ease: "power3.inOut"
    }, seedFlyStart);

    layer.savedTime = seedFlyStart + 0.30;

    timeline.set(layer.button, {
      autoAlpha: 0,
      y: 10,
      scale: 0.94,
      rotateX: 10
    }, layer.savedTime - 0.02);

    timeline.to(layer.button, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      duration: 0.2,
      ease: "back.out(1.5)"
    }, layer.savedTime);

    timeline.to(layer.seed, {
      autoAlpha: 0,
      scale: 0.86,
      duration: 0.12,
      ease: "power2.out"
    }, layer.savedTime + 0.12);

    timeline.to(layer.button, {
      scale: 1.055,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    }, layer.savedTime + 0.1);

    timeline.to({}, { duration: 0.22 });
  }

  function setupStory(section) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
      console.warn("[Inkwell story] GSAP and ScrollTrigger are required for the Section 2 scroll story.");
      return null;
    }

    gsap.registerPlugin(ScrollTrigger);

    const scroll = section.querySelector(STORY_CONFIG.scrollSelector);
    const card = section.querySelector(STORY_CONFIG.cardSelector);
    const details =
      card?.querySelector(STORY_CONFIG.detailsSelector) ||
      section.querySelector(STORY_CONFIG.detailsSelector);

    const score = card?.querySelector(STORY_CONFIG.scoreSelector) || null;

    if (!scroll || !card || !details) {
      console.warn("[Inkwell story] Missing required Section 2 elements. Expected scroll wrapper, card, and saved-layer details row.");
      return null;
    }

    section.classList.add("is-gsap-story");
    card.classList.add("is-bare-card");
    details.classList.add("is-empty");

    const { stages, activeStage } = normalizeStoryDom(section, scroll, card);
    const layers = buildLayerData(section, details, scroll);

    if (layers.length === 0) {
      console.warn("[Inkwell story] No complete layer scenes/buttons were found. Story setup was skipped.");

      section.classList.remove("is-gsap-story");
      card.classList.remove("is-bare-card");
      details.classList.remove("is-empty");

      return null;
    }

    const allItems = layers.flatMap((layer) => layer.items);
    const allScenes = layers.map((layer) => layer.scene);
    const allButtons = layers.map((layer) => layer.button);
    const allSeeds = layers.map((layer) => layer.seed);

    gsap.set(stages, { autoAlpha: 0 });
    gsap.set(activeStage, { autoAlpha: 1 });
    gsap.set(card, { transformOrigin: "50% 55%", transformPerspective: 1200 });
    gsap.set(details, { autoAlpha: 0, y: 10, scale: 0.98 });
    gsap.set(allButtons, {
      autoAlpha: 0,
      y: 10,
      scale: 0.94,
      rotateX: 10,
      transformOrigin: "50% 50%"
    });
    gsap.set(allScenes, { autoAlpha: 0 });
    gsap.set(allItems, { autoAlpha: 0 });
    gsap.set(allSeeds, { autoAlpha: 0 });

    const buttonCenters = measureButtonCenters({
      card,
      details,
      buttons: allButtons,
      container: scroll
    });

    const headerHeight = getCssPixelNumber(
      document.documentElement,
      STORY_CONFIG.headerHeightVar,
      STORY_CONFIG.defaultHeaderHeight
    );

    const rowVisibleTimeRef = { value: Number.POSITIVE_INFINITY };

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: section,
        start: () => `top top+=${headerHeight}px`,
        end: () =>
          `+=${Math.max(
            window.innerHeight * STORY_CONFIG.scrollDistanceScreens,
            STORY_CONFIG.minScrollDistance
          )}`,
        scrub: 0.82,
        pin: scroll,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    timeline.eventCallback("onUpdate", () => {
      syncStoryState({
        timeline,
        card,
        details,
        layers,
        rowVisibleTime: rowVisibleTimeRef.value
      });
    });

    timeline.addLabel("intro");

    timeline.fromTo(card, {
      autoAlpha: 0,
      y: 56,
      scale: 0.96,
      rotateX: 1.2
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      duration: 0.82
    });

    if (score) {
      timeline.to(score, {
        scale: 1.045,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      }, "-=0.18");
    }

    timeline.to({}, { duration: 0.18 });

    layers.forEach((layer, index) => {
      addLayerSequence(timeline, layer, index, {
        container: scroll,
        buttonCenters,
        rowVisibleTimeRef
      });
    });

    timeline.addLabel("complete");

    timeline.to(card, {
      y: -3,
      scale: 1.006,
      duration: 0.28,
      ease: "power2.out"
    });

    timeline.to(card, {
      y: 0,
      scale: 1,
      duration: 0.28,
      ease: "power2.out"
    });

    timeline.to(allButtons, {
      scale: 1.025,
      duration: 0.12,
      stagger: 0.04,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    }, "-=0.26");

    timeline.to({}, { duration: 0.55 });

    section.classList.add("is-story-ready");

    syncStoryState({
      timeline,
      card,
      details,
      layers,
      rowVisibleTime: rowVisibleTimeRef.value
    });

    ScrollTrigger.refresh();

    return function cleanupStory() {
      timeline.kill();

      allSeeds.forEach((seed) => seed.remove());

      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === section || trigger.pin === scroll) {
          trigger.kill();
        }
      });

      gsap.set([
        ...stages,
        activeStage,
        card,
        details,
        ...allButtons,
        ...allScenes,
        ...allItems
      ].filter(Boolean), {
        clearProps: "all"
      });

      section.classList.remove("is-gsap-story", "is-story-ready");
      card.classList.remove("is-bare-card", "has-saved-layers", "is-measuring");
      details.classList.remove("is-empty", "is-visible");

      stages.forEach((stage) => {
        stage.classList.remove("is-current");
        stage.removeAttribute("aria-hidden");
      });

      layers.forEach((layer) => {
        setSceneVisibility(layer, false);
        setButtonSaved(layer, false);
        layer.scene.removeAttribute("aria-hidden");
      });
    };
  }

  onReady(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const section = document.querySelector(STORY_CONFIG.sectionSelector);

    if (!section) return;

    if (!gsap || !ScrollTrigger) {
      console.warn("[Inkwell story] GSAP/ScrollTrigger not found. Section 2 will use the static CSS layout.");
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(STORY_CONFIG.desktopQuery, () => {
      const cleanup = setupStory(section);

      return () => {
        if (typeof cleanup === "function") cleanup();
      };
    });
  });
})();