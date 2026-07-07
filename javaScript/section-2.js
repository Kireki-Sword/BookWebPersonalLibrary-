/* ============================================================================
   INKWELL — SECTION 2 CONTROLLER (v2 — content-becomes-button story)
   ==============================================================================
   REQUIRED SCRIPT TAGS — load in this order, before this file:

     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
     <script src="section-2.js" defer></script>

   ------------------------------------------------------------------------
   THE STORY (matches the approved storyboard):

     Intro   — the plain card: cover, title, author, chips, rating.
     Quotes  — quote strips drift in, hold, gather, morph into a pill,
               the pill travels to the Quotes button's real position and
               becomes it.
     Moments, Characters, Notes, Thoughts — same pattern, one at a time.
     Final   — all five buttons active, a soft settle pulse across the
               card and its aura.

   KEY ENGINEERING DECISIONS (documented here because they matter if you
   come back to tune this later):

   1. Button positions are measured ONCE, at setup, via
      getBoundingClientRect() — not re-measured mid-scroll. This works
      because every button already exists in the DOM with its real size
      (hidden via opacity/visibility, never display:none — see
      section-2.css §10), so flexbox has already laid all five out in
      their final resting spots before the story ever starts. Nothing
      about their layout position changes as buttons "land" — only
      their appearance does.

   2. Evidence items (quotes/moments/etc.) are positioned ENTIRELY by
      GSAP — x, y, rotate, scale, using the xPercent/yPercent centering
      idiom. Earlier iterations of this section tried to split control
      between CSS custom properties and GSAP, which is exactly the kind
      of two-systems-own-one-property setup that causes silent bugs.
      One owner per property, always.

   3. The whole thing is one continuous GSAP timeline under a single
      scrubbed ScrollTrigger. Scrubbing means scrolling up smoothly
      reverses everything — there is no separate "reverse" animation to
      maintain.
   ============================================================================ */

(function () {
  'use strict';

  /* ==========================================================
     0. GUARD CLAUSES
     ========================================================== */

  var section = document.querySelector('#section-2-empty-shelf');
  if (!section) return;

  var scrollWrap = section.querySelector('.empty-shelf-scroll');
  var viewport = section.querySelector('.stage-viewport');
  var statusEl = document.getElementById('section-2-status');
  var MOBILE_BREAKPOINT = 760; // keep in sync with section-2.css
  var NAV_OFFSET = 64;         // keep in sync with your sticky nav height

  guardImages(section);

  var reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('[Inkwell] GSAP/ScrollTrigger not found — Section 2 shows the static base layout (card complete, evidence in a calm grid).');
    return;
  }

  if (reduceMotionMQ.matches) {
    // Base CSS (no .is-gsap-story) already IS the reduced-motion
    // experience: complete card, calm evidence grids, no scroll
    // hijacking. Deliberately doing nothing further here.
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Pinning a tall scene is a common source of jank on phones, so mobile
  // gets the plain base layout (everything visible, no pin) instead.
  ScrollTrigger.matchMedia({
    ['(min-width: ' + MOBILE_BREAKPOINT + 'px)']: initStory,
  });


  /* ==========================================================
     1. IMAGE FALLBACKS
     ========================================================== */

  function guardImages(root) {
    root.querySelectorAll('img').forEach(function (img) {
      var applyFallback = function () {
        var wrap = img.closest('.media-row-cover, .moment-frame, .character-name');
        if (wrap) wrap.classList.add('img-fallback');
        img.style.opacity = '0';
      };
      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      } else {
        img.addEventListener('error', applyFallback, { once: true });
      }
    });
  }


  /* ==========================================================
     2. THE STORY
     ========================================================== */

  function initStory() {
    section.classList.add('is-gsap-story');

    var cardWrap = section.querySelector('.card-wrap');
    var details = section.querySelector('.media-row-details');
    var buttons = {
      quotes: section.querySelector('.depth-button-quotes'),
      moment: section.querySelector('.depth-button-moment'),
      character: section.querySelector('.depth-button-character'),
      notes: section.querySelector('.depth-button-notes'),
      thoughts: section.querySelector('.depth-button-thoughts'),
    };

    var scenes = {
      quotes: section.querySelector('[data-stage="quotes-fall"]'),
      moment: section.querySelector('[data-stage="moments-move"]'),
      character: section.querySelector('[data-stage="characters-appear"]'),
      notes: section.querySelector('[data-stage="notes-appear"]'),
      thoughts: section.querySelector('[data-stage="thoughts-appear"]'),
    };

    var allScenes = [scenes.quotes, scenes.moment, scenes.character, scenes.notes, scenes.thoughts];

    // Hand-placed spread positions per category (px, relative to the
    // viewport's own center) — matches the "drift in from around the
    // card" description in the design notes. Tune freely; nothing else
    // depends on these exact numbers.
    var SPREAD = {
      quotes: [
        { x: -300, y: -160, rotate: -3 },
        { x: 300, y: -145, rotate: 2.5 },
        { x: -140, y: 155, rotate: -1.5 },
        { x: 150, y: 165, rotate: 2 },
      ],
      moment: [
        { x: -320, y: -100, rotate: -2 },
        { x: 320, y: -90, rotate: 2 },
        { x: 0, y: 195, rotate: -1 },
      ],
      character: [
        { x: 0, y: -145, rotate: 0 },
        { x: -330, y: -60, rotate: -5 },
        { x: 330, y: -60, rotate: 5 },
        { x: -230, y: 175, rotate: 4 },
        { x: 235, y: 175, rotate: -4 },
        { x: -90, y: 205, rotate: -2 },
        { x: 95, y: 205, rotate: 2 },
      ],
      notes: [
        { x: -300, y: -120, rotate: -3 },
        { x: 300, y: -105, rotate: 2.5 },
        { x: 0, y: 175, rotate: 1.5 },
      ],
      thoughts: [
        { x: -220, y: -60, rotate: 0, scale: 1 },
        { x: 220, y: 90, rotate: 0, scale: 0.9 },
      ],
    };

    var order = ['quotes', 'moment', 'character', 'notes', 'thoughts'];

    // --- Measure every button's real resting position ONCE. ---------------
    // Safe to do now because flexbox already laid all five out (they're
    // hidden via opacity/visibility, not display:none — section-2.css §10).
    var vpRect = viewport.getBoundingClientRect();
    var vpCenter = { x: vpRect.left + vpRect.width / 2, y: vpRect.top + vpRect.height / 2 };

    var buttonTargets = {};
    order.forEach(function (key) {
      var rect = buttons[key].getBoundingClientRect();
      buttonTargets[key] = {
        x: rect.left + rect.width / 2 - vpCenter.x,
        y: rect.top + rect.height / 2 - vpCenter.y,
        width: rect.width,
        height: rect.height,
      };
    });

    // The Saved Layers row sits below the card's center — used as the
    // "gather point" the evidence converges toward before each button
    // actually appears at its measured position above.
    var gatherPoint = { x: 0, y: buttonTargets.quotes.y - 34 };

    // --- The "seed" — the pill that morphs into each real button. ---------
    var seed = document.createElement('div');
    seed.className = 'layer-button-seed';
    seed.setAttribute('aria-hidden', 'true');
    viewport.appendChild(seed);
    gsap.set(seed, { xPercent: -50, yPercent: -50, x: gatherPoint.x, y: gatherPoint.y, width: 64, height: 38, opacity: 0 });

    // --- Prime everything to its hidden "before it arrives" state. --------
    gsap.set(cardWrap, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, opacity: 1 });
    gsap.set(details, { autoAlpha: 0, y: 8 });
    Object.keys(buttons).forEach(function (key) {
      gsap.set(buttons[key], { autoAlpha: 0, y: -10, scale: 0.9 });
    });

    order.forEach(function (key) {
      var items = scenes[key].querySelectorAll('.falling-quote, .moment-frame, .character-name, .note-card, .thought-card');
      items.forEach(function (el, i) {
        var s = SPREAD[key][i] || { x: 0, y: 0, rotate: 0 };
        gsap.set(el, {
          xPercent: -50, yPercent: -50,
          x: s.x * 0.55, y: s.y * 0.55,
          rotate: s.rotate - (s.x < 0 ? -8 : 8),
          scale: (s.scale || 1) * 0.82,
          opacity: 0,
        });
      });
    });

    setActiveScene(null);

    /* ----------------------------------------------------------
       Timeline durations. These are arbitrary relative "weight"
       units, not pixels or seconds — scrub maps scroll progress
       proportionally across whatever numbers are used here.
       PX_PER_UNIT below is what converts the total weight into
       an actual scroll distance.
       ---------------------------------------------------------- */
    var PX_PER_UNIT = 360;
    var W = { intro: 1, enter: 1, hold: 0.7, gather: 0.8, morph: 0.9, settle: 0.5, final: 1.4 };
    var totalWeight = W.intro + order.length * (W.enter + W.hold + W.gather + W.morph + W.settle) + W.final;

    var master = gsap.timeline({
      scrollTrigger: {
        trigger: viewport,
        start: 'top top+=' + NAV_OFFSET,
        end: '+=' + Math.round(totalWeight * PX_PER_UNIT),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // --- Intro ---------------------------------------------------------
    master.to(cardWrap, { scale: 1.015, duration: W.intro * 0.6, ease: 'sine.inOut' })
          .to(cardWrap, { scale: 1, duration: W.intro * 0.4, ease: 'sine.inOut' });

    // --- One phase per evidence type -------------------------------------
    order.forEach(function (key) {
      addPhase(master, key, scenes[key], SPREAD[key], buttonTargets[key], gatherPoint, cardWrap, details, buttons[key], seed, W, setActiveScene);
    });

    // --- Final hold: soft settle across the whole card --------------------
    master.call(function () { setActiveScene(null); })
          .to(cardWrap, { scale: 1.012, duration: W.final * 0.4, ease: 'sine.inOut' }, '+=0')
          .call(function () { cardWrap.classList.add('is-glowing'); })
          .to(cardWrap, { scale: 1, duration: W.final * 0.6, ease: 'sine.inOut' })
          .call(function () { announce('Every layer saved — quotes, moments, characters, notes, and thoughts.'); }, null, '<');

    // Re-measure if webfonts finish loading late (can shift row height).
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

    return function () {
      // matchMedia cleanup if the viewport crosses back under the
      // desktop breakpoint.
      if (master.scrollTrigger) master.scrollTrigger.kill();
      master.kill();
      seed.remove();
      section.classList.remove('is-gsap-story', 'is-current-quotes', 'is-current-moment', 'is-current-character', 'is-current-notes', 'is-current-thoughts');
      allScenes.forEach(function (scene) { scene.classList.remove('is-current'); scene.setAttribute('aria-hidden', 'true'); });
      gsap.set([cardWrap, details].concat(Object.values(buttons)), { clearProps: 'all' });
      section.querySelectorAll('.falling-quote, .moment-frame, .character-name, .note-card, .thought-card').forEach(function (el) {
        gsap.set(el, { clearProps: 'all' });
      });
    };

    /* ---------------------------------------------------------- */

    function setActiveScene(activeKey) {
      order.forEach(function (key) {
        var active = key === activeKey;
        scenes[key].classList.toggle('is-current', active);
        scenes[key].setAttribute('aria-hidden', active ? 'false' : 'true');
      });
    }

    function announce(text) {
      if (statusEl) statusEl.textContent = text;
    }
  }


  /* ==========================================================
     3. ONE EVIDENCE PHASE
     ------------------------------------------------------------
     enter -> hold -> gather -> morph (seed becomes the button) -> settle
     ========================================================== */

  function addPhase(tl, key, scene, spread, target, gatherPoint, cardWrap, details, button, seed, W, setActiveScene) {
    var items = scene.querySelectorAll('.falling-quote, .moment-frame, .character-name, .note-card, .thought-card');
    var label = key + '-enter';
    tl.addLabel(label);

    // setActiveScene handles BOTH turning this scene on and turning every
    // other scene off — without that second half, scenes would stack up
    // and stay visible simultaneously as the story progresses.
    tl.call(function () { setActiveScene(key); }, null, label);
    tl.to(cardWrap, { scale: 0.86, opacity: 0.45, duration: W.enter * 0.6, ease: 'power2.inOut' }, label);

    // Items drift in from their spread positions.
    tl.to(items, {
      x: function (i) { return (spread[i] || { x: 0 }).x; },
      y: function (i) { return (spread[i] || { y: 0 }).y; },
      rotate: function (i) { return (spread[i] || { rotate: 0 }).rotate; },
      scale: function (i) { return (spread[i] || {}).scale || 1; },
      opacity: 1,
      duration: W.enter,
      stagger: W.enter / (items.length * 2.2),
      ease: 'back.out(1.5)',
    }, label + '+=0.05');

    // Hold — pure scroll room, nothing new animates, so the content is
    // actually readable rather than a blur of motion.
    tl.to({}, { duration: W.hold });

    // Gather — everything gathered items converge toward the point just
    // above where the button will land.
    tl.to(items, {
      x: gatherPoint.x,
      y: gatherPoint.y,
      rotate: 0,
      scale: 0.32,
      opacity: 0,
      duration: W.gather,
      stagger: 0.04,
      ease: 'power2.in',
    });

    // Card returns to full prominence while the seed appears at the
    // gather point, already sized like a small pill.
    tl.to(cardWrap, { scale: 1, opacity: 1, duration: W.gather * 0.8, ease: 'power2.out' }, '<');
    tl.to(seed, {
      x: gatherPoint.x, y: gatherPoint.y, width: 64, height: 38, opacity: 1,
      duration: W.gather * 0.5, ease: 'power2.out',
    }, '<');

    // Morph — the seed travels to the button's real measured position,
    // growing/shrinking to match its exact size.
    tl.to(seed, {
      x: target.x, y: target.y, width: target.width, height: target.height,
      duration: W.morph,
      ease: 'power3.inOut',
    });

    // Landing — real button fades in with a tiny bounce as the seed fades
    // out; the class swap is instant but happens while the button is still
    // fully transparent, so no flash of unstyled content.
    tl.set(button, { className: '+=is-landed' });
    tl.to(button, { autoAlpha: 1, y: 0, scale: 1, duration: W.settle, ease: 'back.out(1.8)' }, '<');
    tl.to(seed, { opacity: 0, duration: W.settle * 0.6 }, '<');
    tl.to(details, { autoAlpha: 1, y: 0, duration: W.settle }, '<');

    tl.call(function () { announceLanded(key); });

    function announceLanded(k) {
      var labels = {
        quotes: 'Quotes saved to the row.',
        moment: 'Moments saved to the row.',
        character: 'Characters saved to the row.',
        notes: 'Notes saved to the row.',
        thoughts: 'Thoughts saved to the row.',
      };
      var statusEl = document.getElementById('section-2-status');
      if (statusEl) statusEl.textContent = labels[k] || '';
    }
  }

})();