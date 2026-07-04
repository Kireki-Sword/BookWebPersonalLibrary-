
/* ==========================================================
   SECTION 2 — ORIGINAL HTML JAVASCRIPT
   File: javaScript/section-2.js

   Needs GSAP + ScrollTrigger loaded before this file.
   Buttons do NOT show previews.
========================================================== */

(() => {
  "use strict";

  const SECTION_SELECTOR = "#section-2-empty-shelf";
  const RESIZE_DELAY = 180;

  const STAGE_SELECTORS = {
    basic: ".stage-basic-row",
    quotesEvidence: ".stage-quotes-fall",
    quotesRow: ".stage-row-with-quotes",
    momentsEvidence: ".stage-moments-move",
    momentsRow: ".stage-row-with-moment",
    charactersEvidence: ".stage-characters-appear",
    charactersRow: ".stage-row-with-character",
    notesEvidence: ".stage-notes-appear",
    notesRow: ".stage-row-with-notes",
    thoughtsEvidence: ".stage-thoughts-appear",
    finalRow: ".stage-final-row"
  };

  const MOOD_CLASSES = [
    "is-stage-empty",
    "is-stage-quotes",
    "is-stage-moments",
    "is-stage-characters",
    "is-stage-notes",
    "is-stage-thoughts",
    "is-stage-final"
  ];

  const PROGRESS_STATES = [
    { from: 0.00, stage: "basic", mood: "empty" },
    { from: 0.08, stage: "quotesEvidence", mood: "quotes" },
    { from: 0.22, stage: "quotesRow", mood: "quotes" },
    { from: 0.30, stage: "momentsEvidence", mood: "moments" },
    { from: 0.44, stage: "momentsRow", mood: "moments" },
    { from: 0.50, stage: "charactersEvidence", mood: "characters" },
    { from: 0.64, stage: "charactersRow", mood: "characters" },
    { from: 0.70, stage: "notesEvidence", mood: "notes" },
    { from: 0.82, stage: "notesRow", mood: "notes" },
    { from: 0.86, stage: "thoughtsEvidence", mood: "thoughts" },
    { from: 0.95, stage: "finalRow", mood: "final" }
  ];

  const BUTTON_PROGRESS = {
    quotes: 0.23,
    moments: 0.45,
    characters: 0.65,
    notes: 0.83,
    thoughts: 0.96
  };

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(initSection2);

  function initSection2() {
    const section = document.querySelector(SECTION_SELECTOR);
    if (!section || section.dataset.section2Ready === "true") return;

    section.dataset.section2Ready = "true";

    const ctx = createContext(section);
    if (!ctx.scroll || !ctx.stages.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    let destroyAnimation = null;
    let destroyCursor = null;
    let resizeTimer = null;

    const restart = () => {
      if (typeof destroyAnimation === "function") destroyAnimation();
      if (typeof destroyCursor === "function") destroyCursor();

      resetInlineState(ctx);

      if (reducedMotion.matches || !hasGSAP()) {
        setupStaticFinalState(ctx);
        return;
      }

      destroyCursor = finePointer.matches ? setupCursorGlow(ctx) : null;
      destroyAnimation = setupScrollAnimation(ctx);
    };

    restart();

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }, RESIZE_DELAY);
    };

    window.addEventListener("resize", onResize);

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", restart);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(restart);
    }

    if (typeof finePointer.addEventListener === "function") {
      finePointer.addEventListener("change", restart);
    } else if (typeof finePointer.addListener === "function") {
      finePointer.addListener(restart);
    }

    window.addEventListener("pagehide", () => {
      window.clearTimeout(resizeTimer);
      if (typeof destroyAnimation === "function") destroyAnimation();
      if (typeof destroyCursor === "function") destroyCursor();
    });
  }

  function createContext(section) {
    const scroll = section.querySelector(".empty-shelf-scroll");

    const stageMap = {};
    Object.entries(STAGE_SELECTORS).forEach(([key, selector]) => {
      stageMap[key] = section.querySelector(selector);
    });

    const stages = Object.values(stageMap).filter(Boolean);

    const allRows = Array.from(section.querySelectorAll(".media-library-row"));
    const allButtons = Array.from(section.querySelectorAll(".depth-button"));

    return {
      section,
      scroll,
      stageMap,
      stages,
      allRows,
      allButtons,

      quotes: Array.from(section.querySelectorAll(".falling-quote")),
      moments: Array.from(section.querySelectorAll(".moment-frame")),
      characters: Array.from(section.querySelectorAll(".character-name")),
      notes: Array.from(section.querySelectorAll(".note-card")),
      thoughts: Array.from(section.querySelectorAll(".thought-card")),

      currentStageKey: null,
      currentMood: null
    };
  }

  function hasGSAP() {
    return Boolean(window.gsap && window.ScrollTrigger);
  }

  function resetInlineState(ctx) {
    ctx.section.classList.remove("is-enhanced");
    MOOD_CLASSES.forEach((className) => ctx.section.classList.remove(className));

    ctx.stages.forEach((stage) => {
      stage.classList.remove("is-active", "is-before", "is-after");
      stage.style.removeProperty("opacity");
      stage.style.removeProperty("visibility");
      stage.style.removeProperty("transform");
      stage.style.removeProperty("pointer-events");
    });

    ctx.allRows.forEach((row) => {
      row.style.removeProperty("opacity");
      row.style.removeProperty("visibility");
      row.style.removeProperty("transform");
      row.style.removeProperty("--row-x");
      row.style.removeProperty("--row-y");
    });

    getAllEvidence(ctx).forEach((item) => {
      item.classList.remove("is-readable", "is-gathering", "is-compressing");
      item.style.removeProperty("opacity");
      item.style.removeProperty("visibility");
      item.style.removeProperty("transform");
      item.style.removeProperty("z-index");
    });

    ctx.allButtons.forEach((button) => {
      button.classList.remove("is-locked", "is-forming", "is-landing", "is-landed");
      button.style.removeProperty("opacity");
      button.style.removeProperty("visibility");
      button.style.removeProperty("transform");
      button.style.removeProperty("pointer-events");
    });

    ctx.section.style.removeProperty("--section2-cursor-x");
    ctx.section.style.removeProperty("--section2-cursor-y");

    ctx.currentStageKey = null;
    ctx.currentMood = null;
  }

  function setupStaticFinalState(ctx) {
    setMood(ctx, "final");

    ctx.stages.forEach((stage) => {
      const isFinal = stage === ctx.stageMap.finalRow;
      stage.style.display = isFinal ? "grid" : "none";
      stage.style.opacity = isFinal ? "1" : "0";
      stage.style.visibility = isFinal ? "visible" : "hidden";
      stage.style.pointerEvents = isFinal ? "auto" : "none";
    });

    ctx.allButtons.forEach((button) => {
      button.classList.add("is-landed");
      button.classList.remove("is-locked", "is-forming", "is-landing");
      button.style.opacity = "1";
      button.style.visibility = "visible";
      button.style.pointerEvents = "auto";
    });

    const finalRow = ctx.stageMap.finalRow?.querySelector(".media-library-row");
    if (finalRow) finalRow.classList.add("media-library-row-complete");
  }

  function setupCursorGlow(ctx) {
    let sectionFrame = null;
    let rowFrame = null;
    let lastSectionEvent = null;
    let lastRowEvent = null;

    const updateSectionGlow = () => {
      sectionFrame = null;
      if (!lastSectionEvent) return;

      const rect = ctx.section.getBoundingClientRect();
      const x = ((lastSectionEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((lastSectionEvent.clientY - rect.top) / rect.height) * 100;

      ctx.section.style.setProperty("--section2-cursor-x", `${clamp(x, 0, 100)}%`);
      ctx.section.style.setProperty("--section2-cursor-y", `${clamp(y, 0, 100)}%`);
    };

    const updateRowGlow = () => {
      rowFrame = null;
      if (!lastRowEvent) return;

      const row = lastRowEvent.currentTarget;
      const rect = row.getBoundingClientRect();
      const x = ((lastRowEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((lastRowEvent.clientY - rect.top) / rect.height) * 100;

      row.style.setProperty("--row-x", `${clamp(x, 0, 100)}%`);
      row.style.setProperty("--row-y", `${clamp(y, 0, 100)}%`);
    };

    const onSectionMove = (event) => {
      lastSectionEvent = event;
      if (!sectionFrame) sectionFrame = window.requestAnimationFrame(updateSectionGlow);
    };

    const onRowMove = (event) => {
      lastRowEvent = event;
      if (!rowFrame) rowFrame = window.requestAnimationFrame(updateRowGlow);
    };

    const onRowLeave = (event) => {
      event.currentTarget.style.removeProperty("--row-x");
      event.currentTarget.style.removeProperty("--row-y");
    };

    ctx.section.addEventListener("pointermove", onSectionMove);
    ctx.allRows.forEach((row) => {
      row.addEventListener("pointermove", onRowMove);
      row.addEventListener("pointerleave", onRowLeave);
    });

    return () => {
      ctx.section.removeEventListener("pointermove", onSectionMove);

      ctx.allRows.forEach((row) => {
        row.removeEventListener("pointermove", onRowMove);
        row.removeEventListener("pointerleave", onRowLeave);
        row.style.removeProperty("--row-x");
        row.style.removeProperty("--row-y");
      });

      if (sectionFrame) window.cancelAnimationFrame(sectionFrame);
      if (rowFrame) window.cancelAnimationFrame(rowFrame);
    };
  }

  function setupScrollAnimation(ctx) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    ctx.section.classList.add("is-enhanced");

    prepareInitialAnimationState(ctx, gsap);

    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out"
      },
      scrollTrigger: {
        trigger: ctx.scroll,
        start: `top top+=${getNavOffset(ctx)}`,
        end: "bottom bottom",
        scrub: 0.75,
        invalidateOnRefresh: true,
        onUpdate: (self) => syncSectionState(ctx, self.progress),
        onRefresh: (self) => syncSectionState(ctx, self.progress)
      }
    });

    tl.addLabel("basic", 0);

    showStage(tl, ctx, "basic", 0);
    tl.fromTo(
      ctx.stageMap.basic?.querySelector(".media-library-row"),
      { autoAlpha: 0, y: 26, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 },
      0
    );

    addEvidenceSequence(tl, ctx, {
      type: "quotes",
      evidenceKey: "quotes",
      evidenceStageKey: "quotesEvidence",
      rowStageKey: "quotesRow",
      buttonSelector: ".depth-button-quotes",
      startTime: 1.0,
      startY: -320,
      startXSpread: 38,
      readableDuration: 0.85,
      gatherDuration: 0.62,
      buttonDuration: 0.45,
      rotationOffset: 6,
      gatherY: 255,
      finalScale: 0.18,
      mood: "quotes"
    });

    addEvidenceSequence(tl, ctx, {
      type: "moments",
      evidenceKey: "moments",
      evidenceStageKey: "momentsEvidence",
      rowStageKey: "momentsRow",
      buttonSelector: ".depth-button-moment",
      startTime: 3.0,
      startY: -360,
      startXSpread: 70,
      readableDuration: 0.86,
      gatherDuration: 0.66,
      buttonDuration: 0.45,
      rotationOffset: 3,
      gatherY: 270,
      finalScale: 0.14,
      mood: "moments"
    });

    addEvidenceSequence(tl, ctx, {
      type: "characters",
      evidenceKey: "characters",
      evidenceStageKey: "charactersEvidence",
      rowStageKey: "charactersRow",
      buttonSelector: ".depth-button-character",
      startTime: 5.0,
      startY: 210,
      startXSpread: 54,
      readableDuration: 0.85,
      gatherDuration: 0.66,
      buttonDuration: 0.45,
      rotationOffset: 4,
      gatherY: 245,
      finalScale: 0.15,
      mood: "characters"
    });

    addEvidenceSequence(tl, ctx, {
      type: "notes",
      evidenceKey: "notes",
      evidenceStageKey: "notesEvidence",
      rowStageKey: "notesRow",
      buttonSelector: ".depth-button-notes",
      startTime: 7.0,
      startY: -260,
      startXSpread: 44,
      readableDuration: 0.78,
      gatherDuration: 0.62,
      buttonDuration: 0.45,
      rotationOffset: 7,
      gatherY: 245,
      finalScale: 0.17,
      mood: "notes"
    });

    addEvidenceSequence(tl, ctx, {
      type: "thoughts",
      evidenceKey: "thoughts",
      evidenceStageKey: "thoughtsEvidence",
      rowStageKey: "finalRow",
      buttonSelector: ".depth-button-thoughts",
      startTime: 8.85,
      startY: -120,
      startXSpread: 20,
      readableDuration: 0.92,
      gatherDuration: 0.68,
      buttonDuration: 0.5,
      rotationOffset: 1,
      gatherY: 205,
      finalScale: 0.13,
      mood: "thoughts",
      soft: true
    });

    tl.to(
      ctx.stageMap.finalRow?.querySelector(".media-library-row"),
      {
        scale: 1.012,
        duration: 0.28,
        ease: "power2.out"
      },
      10.6
    );

    tl.to(
      ctx.stageMap.finalRow?.querySelector(".media-library-row"),
      {
        scale: 1,
        duration: 0.28,
        ease: "power2.out"
      },
      10.9
    );

    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();

      gsap.killTweensOf([
        ctx.stages,
        ctx.allRows,
        ctx.allButtons,
        getAllEvidence(ctx)
      ]);

      gsap.set([
        ctx.stages,
        ctx.allRows,
        ctx.allButtons,
        getAllEvidence(ctx)
      ], { clearProps: "all" });

      ctx.section.classList.remove("is-enhanced");
    };
  }

  function prepareInitialAnimationState(ctx, gsap) {
    setMood(ctx, "empty");
    setActiveStage(ctx, "basic");

    gsap.set(ctx.stages, {
      autoAlpha: 0,
      y: 18,
      scale: 0.985,
      pointerEvents: "none"
    });

    gsap.set(ctx.stageMap.basic, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      pointerEvents: "auto"
    });

    gsap.set(getAllEvidence(ctx), {
      autoAlpha: 0,
      y: 0,
      x: 0,
      scale: 1
    });

    ctx.allButtons.forEach((button) => {
      button.classList.add("is-locked");
      button.classList.remove("is-landing", "is-landed", "is-forming");
    });

    const staticButtons = ctx.section.querySelectorAll(".depth-button-static");
    staticButtons.forEach((button) => {
      button.classList.remove("is-locked");
      button.classList.add("is-landed");
    });

    const firstRows = ctx.section.querySelectorAll(".stage-basic-row .depth-button");
    firstRows.forEach((button) => {
      button.classList.add("is-locked");
      button.classList.remove("is-landed");
    });

    gsap.set(".depth-button-new", {
      autoAlpha: 0,
      y: -28,
      scale: 0.9,
      pointerEvents: "none"
    });
  }

  function addEvidenceSequence(tl, ctx, config) {
    const gsap = window.gsap;
    const evidence = ctx[config.evidenceKey] || [];
    const evidenceStage = ctx.stageMap[config.evidenceStageKey];
    const rowStage = ctx.stageMap[config.rowStageKey];

    if (!evidence.length || !evidenceStage || !rowStage) return;

    const button = rowStage.querySelector(config.buttonSelector);
    const start = config.startTime;
    const enterEnd = start + 0.65;
    const gatherStart = enterEnd + config.readableDuration;
    const rowStart = gatherStart + config.gatherDuration * 0.75;
    const buttonStart = rowStart + 0.20;

    tl.addLabel(`${config.type}-evidence`, start);
    showStage(tl, ctx, config.evidenceStageKey, start);

    tl.set(evidenceStage, { pointerEvents: "auto" }, start);

    tl.fromTo(
      evidence,
      {
        autoAlpha: 0,
        y: config.startY,
        x: (index) => getSpreadX(index, evidence.length, config.startXSpread),
        scale: config.soft ? 0.97 : 0.9,
        rotation: (index) => getRotation(index, evidence.length, config.rotationOffset)
      },
      {
        autoAlpha: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        duration: 0.65,
        stagger: config.soft ? 0.08 : 0.06,
        ease: config.soft ? "power2.out" : "back.out(1.45)",
        onStart: () => {
          evidence.forEach((item) => {
            item.classList.add("is-readable");
            item.classList.remove("is-gathering", "is-compressing");
          });
        }
      },
      start
    );

    tl.to(
      evidence,
      {
        y: 10,
        duration: config.readableDuration,
        stagger: 0.02,
        ease: "none"
      },
      enterEnd
    );

    tl.to(
      evidence,
      {
        x: (index) => getGatherX(index, evidence.length),
        y: (index) => config.gatherY + index * 5,
        scale: config.finalScale,
        rotation: (index) => getCollapseRotation(index, evidence.length),
        autoAlpha: 0,
        duration: config.gatherDuration,
        stagger: 0.035,
        ease: "power2.in",
        onStart: () => {
          evidence.forEach((item) => {
            item.classList.add("is-gathering");
            item.classList.remove("is-readable");
          });
        },
        onComplete: () => {
          evidence.forEach((item) => {
            item.classList.add("is-compressing");
            item.classList.remove("is-gathering");
          });
        }
      },
      gatherStart
    );

    showStage(tl, ctx, config.rowStageKey, rowStart);

    const row = rowStage.querySelector(".media-library-row");

    tl.fromTo(
      row,
      {
        autoAlpha: 0,
        y: 18,
        scale: 0.992
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: "power2.out"
      },
      rowStart
    );

    if (button) {
      tl.set(
        button,
        {
          autoAlpha: 0,
          y: -34,
          scale: 0.88,
          pointerEvents: "none"
        },
        rowStart
      );

      tl.to(
        button,
        {
          autoAlpha: 1,
          y: 7,
          scale: 1.06,
          duration: config.buttonDuration * 0.48,
          ease: "power2.out",
          onStart: () => {
            button.classList.remove("is-locked", "is-landed");
            button.classList.add("is-landing");
          }
        },
        buttonStart
      );

      tl.to(
        button,
        {
          y: 0,
          scale: 1,
          duration: config.buttonDuration * 0.52,
          ease: "back.out(2.3)",
          onComplete: () => {
            button.classList.remove("is-landing");
            button.classList.add("is-landed");
            button.style.pointerEvents = "auto";
          },
          onReverseComplete: () => {
            button.classList.remove("is-landing", "is-landed");
            button.classList.add("is-locked");
            button.style.pointerEvents = "none";
          }
        },
        buttonStart + config.buttonDuration * 0.48
      );
    }

    tl.to(
      row,
      {
        scale: 1.006,
        duration: 0.12,
        ease: "power2.out"
      },
      buttonStart + 0.14
    );

    tl.to(
      row,
      {
        scale: 1,
        duration: 0.14,
        ease: "power2.out"
      },
      buttonStart + 0.28
    );
  }

  function showStage(tl, ctx, stageKey, at) {
    const stage = ctx.stageMap[stageKey];
    if (!stage) return;

    tl.to(
      ctx.stages,
      {
        autoAlpha: 0,
        y: 12,
        scale: 0.992,
        pointerEvents: "none",
        duration: 0.18,
        ease: "power1.out"
      },
      at
    );

    tl.to(
      stage,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        pointerEvents: "auto",
        duration: 0.22,
        ease: "power1.out"
      },
      at + 0.04
    );
  }

  function syncSectionState(ctx, progress) {
    const state = getStateForProgress(progress);
    if (!state) return;

    setMood(ctx, state.mood);
    setActiveStage(ctx, state.stage);
    syncButtonState(ctx, progress);
  }

  function getStateForProgress(progress) {
    let current = PROGRESS_STATES[0];

    for (const state of PROGRESS_STATES) {
      if (progress >= state.from) current = state;
    }

    return current;
  }

  function setMood(ctx, mood) {
    const className = `is-stage-${mood}`;
    if (ctx.currentMood === className) return;

    MOOD_CLASSES.forEach((name) => ctx.section.classList.remove(name));
    ctx.section.classList.add(className);
    ctx.currentMood = className;
  }

  function setActiveStage(ctx, activeKey) {
    if (ctx.currentStageKey === activeKey) return;

    const activeStage = ctx.stageMap[activeKey];
    if (!activeStage) return;

    ctx.stages.forEach((stage) => {
      stage.classList.remove("is-active", "is-before", "is-after");

      if (stage === activeStage) {
        stage.classList.add("is-active");
      } else {
        stage.classList.add("is-after");
      }
    });

    ctx.currentStageKey = activeKey;
  }

  function syncButtonState(ctx, progress) {
    const groups = [
      { key: "quotes", selector: ".depth-button-quotes" },
      { key: "moments", selector: ".depth-button-moment" },
      { key: "characters", selector: ".depth-button-character" },
      { key: "notes", selector: ".depth-button-notes" },
      { key: "thoughts", selector: ".depth-button-thoughts" }
    ];

    groups.forEach((group) => {
      const threshold = BUTTON_PROGRESS[group.key];
      const shouldBeLanded = progress >= threshold;
      const buttons = Array.from(ctx.section.querySelectorAll(group.selector));

      buttons.forEach((button) => {
        if (button.classList.contains("depth-button-static") && shouldBeLanded) {
          button.classList.remove("is-locked", "is-landing");
          button.classList.add("is-landed");
          button.style.pointerEvents = "auto";
          return;
        }

        if (!shouldBeLanded) {
          button.classList.remove("is-landed", "is-landing");
          button.classList.add("is-locked");
          button.style.pointerEvents = "none";
        }
      });
    });
  }

  function getAllEvidence(ctx) {
    return [
      ...ctx.quotes,
      ...ctx.moments,
      ...ctx.characters,
      ...ctx.notes,
      ...ctx.thoughts
    ];
  }

  function getSpreadX(index, total, amount) {
    if (total <= 1) return 0;
    const middle = (total - 1) / 2;
    return (index - middle) * amount;
  }

  function getGatherX(index, total) {
    if (total <= 1) return 0;
    const middle = (total - 1) / 2;
    return (middle - index) * 18;
  }

  function getRotation(index, total, amount) {
    if (total <= 1) return amount * -0.4;
    const middle = (total - 1) / 2;
    return (index - middle) * amount;
  }

  function getCollapseRotation(index, total) {
    if (total <= 1) return 0;
    const middle = (total - 1) / 2;
    return (middle - index) * 2;
  }

  function getNavOffset(ctx) {
    const raw = window
      .getComputedStyle(ctx.section)
      .getPropertyValue("--section-2-nav-offset")
      .trim();

    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 64;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
})();
