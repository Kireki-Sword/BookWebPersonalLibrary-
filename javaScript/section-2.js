/* ================================
   Section 2 — Memory Depth JS
   File: js/homePage/section-2.js
================================ */

(() => {
  'use strict';

  const SECTION_SELECTOR = '#section-2-memory-depth';
  const PREVIEW_HIDE_DELAY = 220;
  const RESIZE_DEBOUNCE = 180;

  const STAGES = [
    { name: 'empty', from: 0 },
    { name: 'quotes', from: 0.08 },
    { name: 'moments', from: 0.28 },
    { name: 'characters', from: 0.48 },
    { name: 'notes', from: 0.66 },
    { name: 'thoughts', from: 0.80 },
    { name: 'complete', from: 0.97 }
  ];

  const BUTTON_REVEALS = [
    { type: 'quotes', from: 0.258 },
    { type: 'moments', from: 0.46 },
    { type: 'characters', from: 0.64 },
    { type: 'notes', from: 0.797 },
    { type: 'thoughts', from: 0.963 }
  ];

  const ROTATION_BY_CLASS = [
    ['quote-strip-1', -4],
    ['quote-strip-2', 3],
    ['quote-strip-3', -1],
    ['moment-panel-hero', -1],
    ['moment-panel-left', 3],
    ['moment-panel-right', -3],
    ['character-card-1', -4],
    ['character-card-2', 4],
    ['character-card-3', -2],
    ['note-card-1', -5],
    ['note-card-2', 4],
    ['note-card-3', -2]
  ];

  const CENTERED_CLASSES = [
    'moment-panel-hero',
    'character-card-main',
    'thought-page'
  ];

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

    const ctx = createContext(section);
    if (!ctx.scroll || !ctx.scene || !ctx.row) return;

    setupPreviewInteractions(ctx);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let destroyAnimation = null;
    let resizeTimer = null;

    const restart = () => {
      if (typeof destroyAnimation === 'function') {
        destroyAnimation();
        destroyAnimation = null;
      }

      resetSection(ctx);

      if (motionQuery.matches) {
        setupReducedMotion(ctx);
        return;
      }

      if (!hasGSAP()) {
        setupNoGSAPFallback(ctx);
        return;
      }

      destroyAnimation = setupScrollStory(ctx);
    };

    restart();

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(restart, RESIZE_DEBOUNCE);
    };

    window.addEventListener('resize', handleResize);

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', restart);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(restart);
    }

    window.addEventListener('pagehide', () => {
      window.clearTimeout(resizeTimer);
      if (typeof destroyAnimation === 'function') destroyAnimation();
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
      depthLabel: section.querySelector('[data-depth-label]'),
      depthButtonsWrap: section.querySelector('.memory-depth-buttons'),
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
      previewTimers: new Map(),

      currentStage: null,
      currentPreview: null
    };
  }

  function hasGSAP() {
    return Boolean(window.gsap && window.ScrollTrigger);
  }

  function resetSection(ctx) {
    const { section, scroll, fallback, row, buttons, previews, evidenceCards, depthLabel } = ctx;

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

    if (row) row.classList.remove('memory-row-complete');
    if (depthLabel) depthLabel.textContent = 'What made it matter';

    buttons.forEach((button) => {
      button.classList.remove('is-revealed', 'is-landing', 'is-active');
      button.setAttribute('aria-expanded', 'false');
      button.style.removeProperty('opacity');
      button.style.removeProperty('visibility');
      button.style.removeProperty('transform');
      button.style.removeProperty('pointer-events');
    });

    previews.forEach((card) => {
      card.classList.remove('is-active');
      card.hidden = true;
    });

    evidenceCards.forEach((card) => {
      card.classList.remove('is-active', 'is-landing', 'is-stacked');
      card.style.removeProperty('opacity');
      card.style.removeProperty('visibility');
      card.style.removeProperty('transform');
    });

    ctx.previewTimers.forEach((timer) => window.clearTimeout(timer));
    ctx.previewTimers.clear();
    ctx.currentPreview = null;
  }

  function setupReducedMotion(ctx) {
    const { section, scroll, fallback, row, buttons, depthLabel } = ctx;

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

    if (row) row.classList.add('memory-row-complete');
    if (depthLabel) depthLabel.textContent = 'Evidence saved';

    buttons.forEach((button) => {
      button.classList.add('is-revealed');
      button.classList.remove('is-landing', 'is-active');
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function setupNoGSAPFallback(ctx) {
    const { section, row, buttons, depthLabel } = ctx;

    section.classList.remove('is-enhanced');
    setStage(ctx, 'complete');

    if (row) row.classList.add('memory-row-complete');
    if (depthLabel) depthLabel.textContent = 'Evidence saved';

    buttons.forEach((button) => {
      button.classList.add('is-revealed');
      button.classList.remove('is-landing', 'is-active');
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function setupScrollStory(ctx) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    ctx.section.classList.add('is-enhanced');
    setStage(ctx, 'empty');
    closeAllPreviews(ctx);

    const landingMap = measureLandingTargets(ctx);

    prepareAnimatedElements(ctx, landingMap);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: ctx.scroll,
        start: () => `top top+=${getNavOffset(ctx)}`,
        end: 'bottom bottom',
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => syncScrollState(ctx, self.progress),
        onRefresh: (self) => syncScrollState(ctx, self.progress)
      }
    });

    tl.addLabel('row', 0);

    tl.to(ctx.row, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.16,
      ease: 'power2.out'
    }, 'row');

    if (ctx.rowScore) {
      tl.to(ctx.rowScore, {
        scale: 1.055,
        duration: 0.045,
        ease: 'power2.out'
      }, 0.13);

      tl.to(ctx.rowScore, {
        scale: 1,
        duration: 0.055,
        ease: 'power2.out'
      }, 0.175);
    }

    addMemorySequence(tl, ctx, {
      type: 'quotes',
      cards: ctx.quoteCards,
      at: 0.22,
      readable: 0.17,
      gather: 0.16,
      compress: 0.08,
      button: 0.08,
      startY: -330,
      startSpread: 80,
      stackScale: 0.42,
      finalScale: 0.08,
      stagger: 0.035
    });

    addMemorySequence(tl, ctx, {
      type: 'moments',
      cards: ctx.momentCards,
      at: 0.76,
      readable: 0.18,
      gather: 0.18,
      compress: 0.08,
      button: 0.08,
      startY: -360,
      startSpread: 110,
      stackScale: 0.34,
      finalScale: 0.075,
      stagger: 0.04
    });

    addMemorySequence(tl, ctx, {
      type: 'characters',
      cards: ctx.characterCards,
      at: 1.30,
      readable: 0.16,
      gather: 0.17,
      compress: 0.08,
      button: 0.08,
      startY: 240,
      startSpread: 95,
      stackScale: 0.38,
      finalScale: 0.08,
      stagger: 0.032
    });

    addMemorySequence(tl, ctx, {
      type: 'notes',
      cards: ctx.noteCards,
      at: 1.78,
      readable: 0.14,
      gather: 0.16,
      compress: 0.075,
      button: 0.08,
      startY: -240,
      startSpread: 70,
      stackScale: 0.42,
      finalScale: 0.08,
      stagger: 0.035
    });

    addMemorySequence(tl, ctx, {
      type: 'thoughts',
      cards: ctx.thoughtCards,
      at: 2.24,
      readable: 0.16,
      gather: 0.15,
      compress: 0.08,
      button: 0.08,
      startY: -190,
      startSpread: 0,
      stackScale: 0.44,
      finalScale: 0.08,
      stagger: 0
    });

    tl.to(ctx.row, {
      scale: 1.01,
      duration: 0.08,
      ease: 'power2.out'
    }, 2.68);

    tl.to(ctx.row, {
      scale: 1,
      duration: 0.08,
      ease: 'power2.out'
    }, 2.76);

    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();

      gsap.killTweensOf([
        ctx.row,
        ctx.rowScore,
        ctx.buttons,
        ctx.evidenceCards
      ]);

      gsap.set([
        ctx.row,
        ctx.rowScore,
        ctx.buttons,
        ctx.evidenceCards
      ], { clearProps: 'all' });
    };
  }

  function prepareAnimatedElements(ctx, landingMap) {
    const { gsap } = window;

    gsap.set(ctx.row, {
      autoAlpha: 0,
      y: 28,
      scale: 0.985,
      transformOrigin: '50% 65%'
    });

    gsap.set(ctx.buttons, {
      autoAlpha: 0,
      y: -30,
      scale: 0.9,
      transformOrigin: '50% 50%',
      pointerEvents: 'none'
    });

    ctx.evidenceCards.forEach((card) => {
      const pose = getBasePose(card);
      const landing = landingMap.get(card) || { x: 0, y: 240 };

      card.dataset.landX = String(landing.x);
      card.dataset.landY = String(landing.y);

      gsap.set(card, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        xPercent: pose.xPercent,
        rotation: pose.rotation,
        scale: 1,
        transformOrigin: '50% 72%'
      });
    });
  }

  function addMemorySequence(tl, ctx, cfg) {
    const cards = cfg.cards || [];
    const button = ctx.buttonMap.get(cfg.type);
    if (!cards.length || !button) return;

    const enterAt = cfg.at;
    const holdAt = enterAt + 0.14;
    const gatherAt = holdAt + cfg.readable;
    const compressAt = gatherAt + cfg.gather;
    const buttonAt = compressAt + cfg.compress * 0.58;

    tl.addLabel(`${cfg.type}-enter`, enterAt);
    tl.addLabel(`${cfg.type}-button`, buttonAt);

    tl.to(cards, {
      autoAlpha: 1,
      x: (index) => getEntranceX(index, cards.length, cfg.startSpread),
      y: cfg.startY,
      scale: 0.94,
      rotation: (index, card) => getBasePose(card).rotation + getEntranceRotation(index, cards.length),
      duration: 0.001
    }, enterAt);

    tl.to(cards, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: (index, card) => getBasePose(card).rotation,
      duration: 0.16,
      ease: 'power2.out',
      stagger: cfg.stagger
    }, enterAt + 0.001);

    tl.to(cards, {
      y: 14,
      duration: 0.035,
      ease: 'power1.out',
      stagger: cfg.stagger * 0.45
    }, holdAt);

    tl.to(cards, {
      x: (index, card) => getLandingX(card, index, cards.length),
      y: (index, card) => getLandingY(card, index, cards.length),
      scale: cfg.stackScale,
      rotation: (index) => getStackRotation(index, cards.length),
      autoAlpha: 0.92,
      duration: cfg.gather,
      ease: 'power2.inOut',
      stagger: cfg.stagger * 0.55
    }, gatherAt);

    tl.to(cards, {
      x: (index, card) => getLandingX(card, index, cards.length) + getCollapseNudge(index, cards.length),
      y: (index, card) => getLandingY(card, index, cards.length) + 18,
      scale: cfg.finalScale,
      rotation: 0,
      autoAlpha: 0,
      duration: cfg.compress,
      ease: 'power2.in',
      stagger: cfg.stagger * 0.35
    }, compressAt);

    tl.to(button, {
      autoAlpha: 1,
      y: 10,
      scale: 1.055,
      duration: cfg.button * 0.42,
      ease: 'power2.out'
    }, buttonAt);

    tl.to(button, {
      y: 0,
      scale: 1,
      duration: cfg.button * 0.58,
      ease: 'back.out(2.2)'
    }, buttonAt + cfg.button * 0.42);
  }

  function measureLandingTargets(ctx) {
    const map = new Map();
    const rowRect = ctx.row.getBoundingClientRect();
    const trayRect = ctx.depthButtonsWrap?.getBoundingClientRect() || rowRect;

    const groupMap = [
      ['quotes', ctx.quoteCards],
      ['moments', ctx.momentCards],
      ['characters', ctx.characterCards],
      ['notes', ctx.noteCards],
      ['thoughts', ctx.thoughtCards]
    ];

    groupMap.forEach(([type, cards]) => {
      const button = ctx.buttonMap.get(type);
      const buttonRect = button?.getBoundingClientRect() || trayRect;
      const targetX = buttonRect.left + buttonRect.width / 2;
      const targetY = buttonRect.top + buttonRect.height / 2;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;

        map.set(card, {
          x: targetX - cardX + getStackOffsetX(index, cards.length),
          y: targetY - cardY - 6 + getStackOffsetY(index, cards.length)
        });
      });
    });

    return map;
  }

  function syncScrollState(ctx, progress) {
    setStage(ctx, getStageForProgress(progress));
    syncDepthLabel(ctx, progress);
    syncButtons(ctx, progress);

    if (ctx.row) {
      ctx.row.classList.toggle('memory-row-complete', progress >= 0.97);
    }
  }

  function syncButtons(ctx, progress) {
    BUTTON_REVEALS.forEach(({ type, from }) => {
      const button = ctx.buttonMap.get(type);
      if (!button) return;

      const shouldReveal = progress >= from;
      const revealed = button.classList.contains('is-revealed');

      if (shouldReveal && !revealed) {
        button.classList.add('is-revealed');
        button.style.pointerEvents = 'auto';
      }

      if (!shouldReveal && revealed) {
        button.classList.remove('is-revealed', 'is-landing', 'is-active');
        button.setAttribute('aria-expanded', 'false');
        button.style.pointerEvents = 'none';
        closePreview(ctx, type, true);
      }
    });
  }

  function syncDepthLabel(ctx, progress) {
    if (!ctx.depthLabel) return;

    if (progress >= 0.97) {
      ctx.depthLabel.textContent = 'Evidence saved';
    } else if (progress >= 0.18) {
      ctx.depthLabel.textContent = 'Evidence saving';
    } else {
      ctx.depthLabel.textContent = 'What made it matter';
    }
  }

  function setStage(ctx, stageName) {
    if (!stageName || ctx.currentStage === stageName) return;

    STAGES.forEach(({ name }) => {
      ctx.section.classList.remove(`is-stage-${name}`);
    });

    ctx.section.classList.add(`is-stage-${stageName}`);
    ctx.currentStage = stageName;
  }

  function getStageForProgress(progress) {
    let current = STAGES[0].name;

    STAGES.forEach(({ name, from }) => {
      if (progress >= from) current = name;
    });

    return current;
  }

  function getBasePose(card) {
    let rotation = 0;

    ROTATION_BY_CLASS.forEach(([className, value]) => {
      if (card.classList.contains(className)) rotation = value;
    });

    const xPercent = CENTERED_CLASSES.some((className) => card.classList.contains(className)) ? -50 : 0;

    return { rotation, xPercent };
  }

  function getEntranceX(index, total, spread) {
    if (total <= 1 || !spread) return 0;
    const middle = (total - 1) / 2;
    return (index - middle) * spread;
  }

  function getEntranceRotation(index, total) {
    if (total <= 1) return -2;
    const middle = (total - 1) / 2;
    return (index - middle) * 3;
  }

  function getStackOffsetX(index, total) {
    if (total <= 1) return 0;
    const middle = (total - 1) / 2;
    return (index - middle) * 10;
  }

  function getStackOffsetY(index) {
    return index * 5;
  }

  function getLandingX(card, index, total) {
    const base = Number.parseFloat(card.dataset.landX || '0');
    return base + getStackOffsetX(index, total);
  }

  function getLandingY(card, index, total) {
    const base = Number.parseFloat(card.dataset.landY || '0');
    return base + getStackOffsetY(index, total);
  }

  function getCollapseNudge(index, total) {
    if (total <= 1) return 0;
    const middle = (total - 1) / 2;
    return (middle - index) * 6;
  }

  function getStackRotation(index, total) {
    if (total <= 1) return 0;
    const middle = (total - 1) / 2;
    return (index - middle) * 4;
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
        if (isButtonUsable(ctx, button)) openPreview(ctx, type);
      });

      button.addEventListener('blur', () => {
        window.setTimeout(() => {
          if (document.activeElement !== button) closePreview(ctx, type);
        }, 80);
      });

      button.addEventListener('click', (event) => {
        if (!isButtonUsable(ctx, button)) return;

        if (button.classList.contains('is-active') && coarsePointer.matches) {
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
      if (event.key === 'Escape') closeAllPreviews(ctx);
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
    if (ctx.section.classList.contains('is-enhanced')) {
      return button.classList.contains('is-revealed');
    }
    return true;
  }

  function openPreview(ctx, type) {
    const button = ctx.buttonMap.get(type);
    const card = ctx.previewMap.get(type);
    if (!button || !card) return;

    closeAllPreviews(ctx, type);

    const oldTimer = ctx.previewTimers.get(card);
    if (oldTimer) window.clearTimeout(oldTimer);

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
    if (oldTimer) window.clearTimeout(oldTimer);

    if (immediate) {
      card.hidden = true;
      ctx.previewTimers.delete(card);
    } else {
      const timer = window.setTimeout(() => {
        if (!card.classList.contains('is-active')) card.hidden = true;
        ctx.previewTimers.delete(card);
      }, PREVIEW_HIDE_DELAY);

      ctx.previewTimers.set(card, timer);
    }

    if (ctx.currentPreview === type) ctx.currentPreview = null;
  }

  function closeAllPreviews(ctx, exceptType = null) {
    ctx.buttons.forEach((button) => {
      const type = button.dataset.depthButton;
      if (!type || type === exceptType) return;
      closePreview(ctx, type);
    });
  }

  function getNavOffset(ctx) {
    const raw = window
      .getComputedStyle(ctx.section)
      .getPropertyValue('--memory-nav-offset')
      .trim();

    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 64;
  }
})();