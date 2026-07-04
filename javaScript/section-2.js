/* ================================
   Section 2 — Memory Depth JS
   File: js/homePage/section-2.js
================================ */

(() => {
  'use strict';

  const SECTION_SELECTOR = '#section-2-memory-depth';

  const STAGE_NAMES = [
    'empty',
    'quotes',
    'moments',
    'characters',
    'notes',
    'thoughts',
    'complete'
  ];

  const REVEAL_STEPS = [
    { type: 'quotes', progress: 0.28 },
    { type: 'moments', progress: 0.50 },
    { type: 'characters', progress: 0.69 },
    { type: 'notes', progress: 0.84 },
    { type: 'thoughts', progress: 0.96 }
  ];

  const STAGE_PROGRESS = [
    { name: 'empty', from: 0 },
    { name: 'quotes', from: 0.14 },
    { name: 'moments', from: 0.34 },
    { name: 'characters', from: 0.56 },
    { name: 'notes', from: 0.74 },
    { name: 'thoughts', from: 0.88 },
    { name: 'complete', from: 0.985 }
  ];

  const LANDING_DURATION = 520;
  const PREVIEW_HIDE_DELAY = 260;

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(initMemoryDepthSection);

  function initMemoryDepthSection() {
    const section = document.querySelector(SECTION_SELECTOR);

    if (!section || section.dataset.memoryDepthReady === 'true') return;

    section.dataset.memoryDepthReady = 'true';

    const context = createContext(section);

    if (!context.scroll || !context.scene || !context.row) return;

    setupPreviewInteractions(context);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let destroyAnimation = null;

    const start = () => {
      if (typeof destroyAnimation === 'function') {
        destroyAnimation();
        destroyAnimation = null;
      }

      resetSectionState(context);

      if (motionQuery.matches) {
        setupReducedMotion(context);
        return;
      }

      if (!hasGSAP()) {
        setupStaticFallback(context);
        return;
      }

      destroyAnimation = setupScrollAnimation(context);
    };

    start();

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', start);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(start);
    }

    window.addEventListener('pagehide', () => {
      if (typeof destroyAnimation === 'function') {
        destroyAnimation();
      }
    });
  }

  function createContext(section) {
    const buttons = Array.from(section.querySelectorAll('[data-depth-button]'));
    const previews = Array.from(section.querySelectorAll('[data-preview-card]'));
    const evidenceCards = Array.from(section.querySelectorAll('.evidence-card'));

    return {
      section,
      scroll: section.querySelector('[data-scroll-scene="memory-depth"]'),
      scene: section.querySelector('[data-pin-scene]'),
      row: section.querySelector('[data-memory-row]'),
      rowScore: section.querySelector('.memory-row-score'),
      scoreQuestion: section.querySelector('.score-question'),
      depthLabel: section.querySelector('[data-depth-label]'),
      fallback: section.querySelector('[data-reduced-motion-fallback]'),

      buttons,
      previews,
      evidenceCards,

      quoteCards: Array.from(section.querySelectorAll('.evidence-layer-quotes .evidence-card')),
      momentCards: Array.from(section.querySelectorAll('.evidence-layer-moments .evidence-card')),
      characterCards: Array.from(section.querySelectorAll('.evidence-layer-characters .evidence-card')),
      noteCards: Array.from(section.querySelectorAll('.evidence-layer-notes .evidence-card')),
      thoughtCards: Array.from(section.querySelectorAll('.evidence-layer-thoughts .evidence-card')),

      buttonMap: new Map(buttons.map((button) => [button.dataset.depthButton, button])),
      previewMap: new Map(previews.map((card) => [card.dataset.previewCard, card])),

      landingTimers: new Map(),
      previewTimers: new Map(),

      currentStage: null,
      currentPreview: null
    };
  }

  function hasGSAP() {
    return Boolean(window.gsap && window.ScrollTrigger);
  }

  function resetSectionState(ctx) {
    const {
      section,
      scroll,
      fallback,
      buttons,
      previews,
      evidenceCards,
      depthLabel,
      row
    } = ctx;

    section.classList.remove('is-enhanced');
    setStage(ctx, 'empty');

    if (scroll) {
      scroll.hidden = false;
      scroll.removeAttribute('aria-hidden');
    }

    if (fallback) {
      fallback.hidden = true;
      fallback.setAttribute('aria-hidden', 'true');
    }

    if (depthLabel) {
      depthLabel.textContent = 'What made it matter';
    }

    if (row) {
      row.classList.remove('memory-row-complete');
    }

    buttons.forEach((button) => {
      button.classList.remove('is-revealed', 'is-landing', 'is-active');
      button.setAttribute('aria-expanded', 'false');

      button.style.opacity = '';
      button.style.visibility = '';
      button.style.transform = '';
      button.style.pointerEvents = '';
    });

    previews.forEach((card) => {
      card.classList.remove('is-active');
      card.hidden = true;
    });

    evidenceCards.forEach((card) => {
      card.classList.remove('is-active', 'is-landing', 'is-stacked');

      card.style.opacity = '';
      card.style.visibility = '';
      card.style.removeProperty('--evidence-y');
      card.style.removeProperty('--evidence-scale');
    });

    ctx.landingTimers.forEach((timer) => window.clearTimeout(timer));
    ctx.previewTimers.forEach((timer) => window.clearTimeout(timer));

    ctx.landingTimers.clear();
    ctx.previewTimers.clear();

    ctx.currentPreview = null;
  }

  function setupReducedMotion(ctx) {
    const {
      section,
      scroll,
      fallback,
      buttons,
      depthLabel,
      row
    } = ctx;

    section.classList.remove('is-enhanced');
    setStage(ctx, 'complete');

    if (scroll) {
      scroll.hidden = true;
      scroll.setAttribute('aria-hidden', 'true');
    }

    if (fallback) {
      fallback.hidden = false;
      fallback.removeAttribute('aria-hidden');
    }

    if (depthLabel) {
      depthLabel.textContent = 'Evidence saved';
    }

    if (row) {
      row.classList.add('memory-row-complete');
    }

    buttons.forEach((button) => {
      button.classList.add('is-revealed');
      button.classList.remove('is-landing');
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function setupStaticFallback(ctx) {
    const {
      section,
      fallback,
      scroll,
      buttons,
      depthLabel,
      row
    } = ctx;

    section.classList.remove('is-enhanced');
    setStage(ctx, 'complete');

    if (scroll) {
      scroll.hidden = false;
      scroll.removeAttribute('aria-hidden');
    }

    if (fallback) {
      fallback.hidden = true;
      fallback.setAttribute('aria-hidden', 'true');
    }

    if (depthLabel) {
      depthLabel.textContent = 'Evidence saved';
    }

    if (row) {
      row.classList.add('memory-row-complete');
    }

    buttons.forEach((button) => {
      button.classList.add('is-revealed');
      button.classList.remove('is-landing');
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function setupScrollAnimation(ctx) {
    const { gsap, ScrollTrigger } = window;

    gsap.registerPlugin(ScrollTrigger);

    const {
      section,
      scroll,
      row,
      rowScore,
      scoreQuestion
    } = ctx;

    section.classList.add('is-enhanced');

    setStage(ctx, 'empty');
    setDepthLabel(ctx, 0);

    ctx.buttons.forEach((button) => {
      button.classList.remove('is-revealed', 'is-landing', 'is-active');
      button.setAttribute('aria-expanded', 'false');
    });

    gsap.set(row, {
      autoAlpha: 0
    });

    gsap.set(ctx.quoteCards, {
      opacity: 0,
      '--evidence-y': '-260px',
      '--evidence-scale': 0.94
    });

    gsap.set(ctx.momentCards, {
      opacity: 0,
      '--evidence-y': '-280px',
      '--evidence-scale': 0.92
    });

    gsap.set(ctx.characterCards, {
      opacity: 0,
      '--evidence-y': '120px',
      '--evidence-scale': 0.92
    });

    gsap.set(ctx.noteCards, {
      opacity: 0,
      '--evidence-y': '-180px',
      '--evidence-scale': 0.94
    });

    gsap.set(ctx.thoughtCards, {
      opacity: 0,
      '--evidence-y': '-120px',
      '--evidence-scale': 0.94
    });

    if (scoreQuestion) {
      gsap.set(scoreQuestion, {
        autoAlpha: 0.45
      });
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: 'none'
      },
      scrollTrigger: {
        trigger: scroll,
        start: () => `top top+=${getNavOffset(ctx)}`,
        end: 'bottom bottom',
        scrub: 0.65,
        invalidateOnRefresh: true,

        onUpdate: (self) => {
          updateProgressState(ctx, self.progress);
        },

        onRefresh: (self) => {
          updateProgressState(ctx, self.progress);
        }
      }
    });

    timeline
      .to(row, {
        autoAlpha: 1,
        duration: 0.07
      }, 0)

      .to(rowScore, {
        filter: 'brightness(1.05)',
        duration: 0.04
      }, 0.08)

      .to(rowScore, {
        filter: 'brightness(1)',
        duration: 0.04
      }, 0.12)

      .to(scoreQuestion, {
        autoAlpha: 0.95,
        duration: 0.05
      }, 0.08)

      .to(scoreQuestion, {
        autoAlpha: 0.55,
        duration: 0.05
      }, 0.14);

    animateEvidenceGroup(timeline, ctx.quoteCards, {
      enterAt: 0.14,
      holdAt: 0.23,
      exitAt: 0.30,
      holdY: '0px',
      exitY: '230px',
      holdScale: 1,
      exitScale: 0.78,
      stagger: 0.018
    });

    animateEvidenceGroup(timeline, ctx.momentCards, {
      enterAt: 0.34,
      holdAt: 0.44,
      exitAt: 0.52,
      holdY: '0px',
      exitY: '250px',
      holdScale: 1,
      exitScale: 0.76,
      stagger: 0.018
    });

    animateEvidenceGroup(timeline, ctx.characterCards, {
      enterAt: 0.56,
      holdAt: 0.63,
      exitAt: 0.70,
      holdY: '0px',
      exitY: '210px',
      holdScale: 1,
      exitScale: 0.78,
      stagger: 0.016
    });

    animateEvidenceGroup(timeline, ctx.noteCards, {
      enterAt: 0.74,
      holdAt: 0.80,
      exitAt: 0.86,
      holdY: '0px',
      exitY: '200px',
      holdScale: 1,
      exitScale: 0.8,
      stagger: 0.018
    });

    animateEvidenceGroup(timeline, ctx.thoughtCards, {
      enterAt: 0.88,
      holdAt: 0.93,
      exitAt: 0.975,
      holdY: '0px',
      exitY: '120px',
      holdScale: 1,
      exitScale: 0.86,
      stagger: 0
    });

    ScrollTrigger.refresh();

    return () => {
      timeline.kill();

      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }

      gsap.killTweensOf([
        row,
        rowScore,
        scoreQuestion,
        ctx.evidenceCards
      ]);

      gsap.set([
        row,
        rowScore,
        scoreQuestion,
        ctx.evidenceCards
      ], {
        clearProps: 'all'
      });
    };
  }

  function animateEvidenceGroup(timeline, cards, options) {
    if (!cards.length) return;

    timeline
      .to(cards, {
        opacity: 1,
        '--evidence-y': options.holdY,
        '--evidence-scale': options.holdScale,
        duration: 0.08,
        stagger: options.stagger
      }, options.enterAt)

      .to(cards, {
        opacity: 1,
        '--evidence-y': options.holdY,
        '--evidence-scale': options.holdScale,
        duration: Math.max(0.01, options.exitAt - options.holdAt)
      }, options.holdAt)

      .to(cards, {
        opacity: 0,
        '--evidence-y': options.exitY,
        '--evidence-scale': options.exitScale,
        duration: 0.07,
        stagger: options.stagger ? options.stagger * 0.6 : 0
      }, options.exitAt);
  }

  function updateProgressState(ctx, progress) {
    const stage = getStageForProgress(progress);

    setStage(ctx, stage);
    setDepthLabel(ctx, progress);
    updateButtonRevealState(ctx, progress);

    if (ctx.row) {
      ctx.row.classList.toggle('memory-row-complete', progress >= 0.985);
    }
  }

  function getStageForProgress(progress) {
    let current = STAGE_PROGRESS[0].name;

    STAGE_PROGRESS.forEach((stage) => {
      if (progress >= stage.from) {
        current = stage.name;
      }
    });

    return current;
  }

  function setStage(ctx, stageName) {
    if (!stageName || ctx.currentStage === stageName) return;

    STAGE_NAMES.forEach((stage) => {
      ctx.section.classList.remove(`is-stage-${stage}`);
    });

    ctx.section.classList.add(`is-stage-${stageName}`);
    ctx.currentStage = stageName;
  }

  function setDepthLabel(ctx, progress) {
    if (!ctx.depthLabel) return;

    if (progress >= 0.985) {
      ctx.depthLabel.textContent = 'Evidence saved';
    } else if (progress >= 0.28) {
      ctx.depthLabel.textContent = 'Evidence saving';
    } else {
      ctx.depthLabel.textContent = 'What made it matter';
    }
  }

  function updateButtonRevealState(ctx, progress) {
    REVEAL_STEPS.forEach((step) => {
      const button = ctx.buttonMap.get(step.type);
      if (!button) return;

      const shouldReveal = progress >= step.progress;
      const isRevealed = button.classList.contains('is-revealed');

      if (shouldReveal && !isRevealed) {
        revealButton(ctx, button);
      }

      if (!shouldReveal && isRevealed) {
        hideButton(ctx, button, step.type);
      }
    });
  }

  function revealButton(ctx, button) {
    button.classList.add('is-revealed', 'is-landing');
    button.setAttribute('aria-expanded', 'false');

    const oldTimer = ctx.landingTimers.get(button);

    if (oldTimer) {
      window.clearTimeout(oldTimer);
    }

    const timer = window.setTimeout(() => {
      button.classList.remove('is-landing');
      ctx.landingTimers.delete(button);
    }, LANDING_DURATION);

    ctx.landingTimers.set(button, timer);
  }

  function hideButton(ctx, button, type) {
    button.classList.remove('is-revealed', 'is-landing', 'is-active');
    button.setAttribute('aria-expanded', 'false');

    const oldTimer = ctx.landingTimers.get(button);

    if (oldTimer) {
      window.clearTimeout(oldTimer);
      ctx.landingTimers.delete(button);
    }

    closePreview(ctx, type, true);
  }

  function setupPreviewInteractions(ctx) {
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

    ctx.buttons.forEach((button) => {
      const type = button.dataset.depthButton;
      if (!type) return;

      button.addEventListener('mouseenter', () => {
        if (!coarsePointer.matches && isButtonUsable(ctx, button)) {
          openPreview(ctx, type);
        }
      });

      button.addEventListener('mouseleave', () => {
        if (!coarsePointer.matches && document.activeElement !== button) {
          closePreview(ctx, type);
        }
      });

      button.addEventListener('focus', () => {
        if (isButtonUsable(ctx, button)) {
          openPreview(ctx, type);
        }
      });

      button.addEventListener('blur', () => {
        window.setTimeout(() => {
          if (document.activeElement !== button) {
            closePreview(ctx, type);
          }
        }, 80);
      });

      button.addEventListener('click', (event) => {
        if (!isButtonUsable(ctx, button)) return;

        const isOpen = button.classList.contains('is-active');

        if (coarsePointer.matches && isOpen) {
          closePreview(ctx, type);
        } else {
          openPreview(ctx, type);
        }

        event.stopPropagation();
      });

      button.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeAllPreviews(ctx);
          button.blur();
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAllPreviews(ctx);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (!ctx.section.contains(event.target)) {
        closeAllPreviews(ctx);
        return;
      }

      if (!event.target.closest('[data-depth-button]')) {
        closeAllPreviews(ctx);
      }
    });
  }

  function isButtonUsable(ctx, button) {
    if (!button || button.disabled) return false;

    const enhanced = ctx.section.classList.contains('is-enhanced');

    if (enhanced && !button.classList.contains('is-revealed')) {
      return false;
    }

    return true;
  }

  function openPreview(ctx, type) {
    const button = ctx.buttonMap.get(type);
    const card = ctx.previewMap.get(type);

    if (!button || !card) return;

    closeAllPreviews(ctx, type);

    const oldTimer = ctx.previewTimers.get(card);

    if (oldTimer) {
      window.clearTimeout(oldTimer);
      ctx.previewTimers.delete(card);
    }

    button.classList.add('is-active');
    button.setAttribute('aria-expanded', 'true');

    card.hidden = false;
    card.classList.remove('is-active');

    window.requestAnimationFrame(() => {
      card.classList.add('is-active');
    });

    ctx.currentPreview = type;
  }

  function closePreview(ctx, type, immediate = false) {
    const button = ctx.buttonMap.get(type);
    const card = ctx.previewMap.get(type);

    if (!button || !card) return;

    button.classList.remove('is-active');
    button.setAttribute('aria-expanded', 'false');

    card.classList.remove('is-active');

    const oldTimer = ctx.previewTimers.get(card);

    if (oldTimer) {
      window.clearTimeout(oldTimer);
    }

    if (immediate) {
      card.hidden = true;
      ctx.previewTimers.delete(card);
    } else {
      const timer = window.setTimeout(() => {
        if (!card.classList.contains('is-active')) {
          card.hidden = true;
        }

        ctx.previewTimers.delete(card);
      }, PREVIEW_HIDE_DELAY);

      ctx.previewTimers.set(card, timer);
    }

    if (ctx.currentPreview === type) {
      ctx.currentPreview = null;
    }
  }

  function closeAllPreviews(ctx, exceptType = null) {
    ctx.buttons.forEach((button) => {
      const type = button.dataset.depthButton;

      if (!type || type === exceptType) return;

      closePreview(ctx, type);
    });
  }

  function getNavOffset(ctx) {
    const rawValue = window
      .getComputedStyle(ctx.section)
      .getPropertyValue('--memory-nav-offset')
      .trim();

    const parsedValue = Number.parseFloat(rawValue);

    return Number.isFinite(parsedValue) ? parsedValue : 64;
  }
})();