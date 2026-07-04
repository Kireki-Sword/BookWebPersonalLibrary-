/* ============================================================================
   INKWELL — SECTION 2 CONTROLLER
   "A rating tells you nothing." — cinematic scrollytelling for the saved-
   entry row (Vagabond / quotes / moments / characters / notes / thoughts).
   ==============================================================================

   REQUIRED SCRIPT TAGS — load these BEFORE this file, in this order:

     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
     <script src="section-2.js" defer></script>

   If GSAP/ScrollTrigger fail to load (blocked script, offline, typo in a
   path) this file notices and quietly does nothing further — the page
   still shows the calm, fully-readable base layout from section-2.css
   (section 5 in that file). Nothing ever renders "broken".

   ------------------------------------------------------------------------
   TABLE OF CONTENTS
     0. Guard clauses (no section? no GSAP? reduced motion?)
     1. Image fallback handling         — runs regardless of GSAP
     2. Cursor "reading lamp" glow      — manual lerp, not GSAP quickTo
                                           (see comment at that function for why)
     3. Cinematic story (desktop, pinned, scrubbed GSAP timeline)
     4. Mobile story (reveal-on-scroll, no pinning)
     5. Shared helpers (priming, per-category entrance animation, labels)
   ============================================================================ */

(function () {
  'use strict';

  /* ==========================================================
     0. GUARD CLAUSES
     ========================================================== */

  var section = document.querySelector('#section-2-empty-shelf');
  if (!section) return; // this page doesn't have Section 2 — nothing to do

  var scrollWrap = section.querySelector('.empty-shelf-scroll');
  var statusEl = document.getElementById('section-2-status');
  var MOBILE_BREAKPOINT = 780; // keep in sync with the tablet breakpoint in section-2.css

  // Image fallbacks are cheap, accessibility-relevant, and don't depend on
  // GSAP at all — set these up first no matter what happens below.
  guardImages(section);

  var reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('[Inkwell] GSAP/ScrollTrigger not found — Section 2 is showing the static calm fallback from section-2.css.');
    return;
  }

  if (reduceMotionMQ.matches) {
    // The base CSS (no .is-enhanced, no .is-cinematic) already IS the
    // reduced-motion experience: finished row + a plain grid of every
    // piece of evidence, no scroll hijacking, no parallax. We deliberately
    // do nothing further here rather than layer partial motion on top.
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  section.classList.add('is-enhanced');

  initCursorGlow();

  // Re-measure once webfonts (Newsreader / Inter) finish swapping in —
  // late font loads can shift row height enough to throw off pin math.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  // Responsive split: a tall pinned scene is a common source of scroll
  // jank on phones, so mobile gets a lighter reveal-on-scroll treatment
  // instead of ScrollTrigger's pin. matchMedia re-runs the right setup
  // automatically if the viewport crosses the breakpoint (e.g. rotation).
  ScrollTrigger.matchMedia({
    ['(min-width: ' + MOBILE_BREAKPOINT + 'px)']: initCinematicStory,
    ['(max-width: ' + (MOBILE_BREAKPOINT - 1) + 'px)']: initMobileReveal,
  });


  /* ==========================================================
     1. IMAGE FALLBACKS
     ------------------------------------------------------------
     Vagabond's cover/moment/character images are still placeholder
     paths in this build ("assets/vagabond-cover.jpg" etc). Rather
     than let a missing file show the browser's broken-image icon
     sitting in an otherwise premium card, we catch the error and
     switch to the paper-texture placeholder already defined in CSS
     (.img-fallback). This stays useful long after real images are
     wired up too — any future 404 (e.g. a user-submitted cover
     that failed to upload) degrades the same graceful way.
     ========================================================== */

  function guardImages(root) {
    var images = root.querySelectorAll('img');
    images.forEach(function (img) {
      var applyFallback = function () {
        var wrap = img.closest('.media-row-cover, .moment-frame, .character-name');
        if (wrap) wrap.classList.add('img-fallback');
        img.classList.add('img-fallback-img');
      };
      // If the image already failed before this script ran (e.g. cached
      // 404), naturalWidth will be 0 on a "complete" image.
      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      } else {
        img.addEventListener('error', applyFallback, { once: true });
      }
    });
  }


  /* ==========================================================
     2. CURSOR "READING LAMP" GLOW
     ------------------------------------------------------------
     Two layers:
       - a big soft glow for the whole section (--section2-cursor-x/y)
       - a smaller, warmer glow inside whichever row is hovered
         (--row-x/y), delegated so it automatically applies to
         whichever stage's row is currently crossfaded in

     WHY MANUAL LERP INSTEAD OF gsap.quickTo() FOR THIS:
     GSAP can tween CSS custom properties directly, but it infers the
     unit from whatever the property's CURRENT value already uses —
     and our default values are percentages ("50%") while the mouse
     position naturally comes in pixels. That mismatch is an easy
     source of subtle bugs (values silently in the wrong unit). A
     tiny hand-rolled lerp loop sidesteps the ambiguity entirely, is
     easier to read, and produces the same "light gently catching up
     to the cursor" feel as quickTo would.
     ========================================================== */

  function initCursorGlow() {
    var rect = section.getBoundingClientRect();
    var refreshRect = function () { rect = section.getBoundingClientRect(); };
    window.addEventListener('resize', refreshRect);
    ScrollTrigger.addEventListener('refresh', refreshRect);

    var lamp = { targetX: 0, targetY: 0, currentX: 0, currentY: 0, active: false, seeded: false };

    section.addEventListener('pointermove', function (e) {
      // --- section-wide lamp target ---
      lamp.targetX = e.clientX - rect.left;
      lamp.targetY = e.clientY - rect.top;
      lamp.active = true;

      // --- row-local glow, only relevant while over an actual row ---
      var row = e.target.closest('.media-library-row');
      if (row) {
        var rowRect = row.getBoundingClientRect();
        row.style.setProperty('--row-x', (e.clientX - rowRect.left) + 'px');
        row.style.setProperty('--row-y', (e.clientY - rowRect.top) + 'px');
      }
    });

    section.addEventListener('pointerleave', function () {
      lamp.active = false;
    });

    // Runs on GSAP's own ticker so it's synced with every other animation
    // frame GSAP is already scheduling — no competing rAF loops.
    gsap.ticker.add(function () {
      if (!lamp.active) return;

      if (!lamp.seeded) {
        // jump straight to the first position instead of easing in from
        // the corner the first time the pointer enters the section
        lamp.currentX = lamp.targetX;
        lamp.currentY = lamp.targetY;
        lamp.seeded = true;
      }

      // 0.12 = lerp factor. Smaller = laggier "lamp" feel, larger = snappier.
      lamp.currentX += (lamp.targetX - lamp.currentX) * 0.12;
      lamp.currentY += (lamp.targetY - lamp.currentY) * 0.12;

      section.style.setProperty('--section2-cursor-x', lamp.currentX + 'px');
      section.style.setProperty('--section2-cursor-y', lamp.currentY + 'px');
    });
  }


  /* ==========================================================
     3. CINEMATIC STORY (desktop, pinned + scrubbed)
     ------------------------------------------------------------
     One pinned "screen" (.stage-viewport, created here — see the
     comment on it below for why it's not hardcoded in the HTML).
     All 11 stages stack in the same grid cell. A single GSAP
     timeline is scrubbed to scroll position: as you scroll, the
     timeline plays forward or backward in lockstep, crossfading
     between stages and staggering each stage's evidence cards and
     newly-landed button into place.

     Returned function is matchMedia's cleanup — GSAP calls it
     automatically if the viewport crosses back below the desktop
     breakpoint (e.g. someone rotates a tablet), so we can safely
     tear the pin down and hand back a normal, un-pinned DOM.
     ========================================================== */

  function initCinematicStory() {
    var stages = gsap.utils.toArray('.scroll-stage', scrollWrap);
    if (!stages.length) return;

    section.classList.add('is-cinematic');

    // The pin needs one dedicated element to pin — we create it here
    // rather than bake it into the HTML, because ONLY cinematic mode
    // needs it. Base and mobile-enhanced modes lay stages out in normal
    // flow inside .empty-shelf-scroll directly.
    var viewport = document.createElement('div');
    viewport.className = 'stage-viewport';
    stages.forEach(function (stage) { viewport.appendChild(stage); });
    scrollWrap.appendChild(viewport);

    // Every stage starts hidden except the first (the plain, unadorned row).
    gsap.set(stages, { autoAlpha: 0, y: 18, scale: 0.985 });
    gsap.set(stages[0], { autoAlpha: 1, y: 0, scale: 1 });
    setActiveStage(stages[0]);
    stages.forEach(function (stage) { primeStage(stage); });

    // A gentle one-time reveal for the very first stage as the section
    // scrolls into view — otherwise it would just appear instantly the
    // moment the page loads, even off-screen.
    var introTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: function () {
        gsap.from(stages[0], { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out' });
      },
    });

    var distancePerStage = parseFloat(
      getComputedStyle(section).getPropertyValue('--section-2-stage-distance')
    ) || 700;
    var totalDistance = distancePerStage * (stages.length - 1);
    var navOffset = parseFloat(
      getComputedStyle(section).getPropertyValue('--section-2-nav-offset')
    ) || 64;

    var master = gsap.timeline({
      scrollTrigger: {
        trigger: viewport,
        start: 'top top+=' + navOffset,
        end: function () { return '+=' + totalDistance; },
        scrub: 1,          // takes 1s to "catch up" to the scrollbar — cinematic, not glued
        pin: true,
        anticipatePin: 1,  // avoids a 1-frame flash of unpinned content
        invalidateOnRefresh: true,
      },
    });

    stages.forEach(function (stage, i) {
      if (i === 0) return; // stage 0 is the resting starting point — nothing crossfades into it
      var prev = stages[i - 1];
      var label = 'stage-' + i;

      master.addLabel(label);

      // crossfade prev -> current
      master.to(prev, { autoAlpha: 0, y: -18, scale: 0.985, duration: 0.4, ease: 'power1.inOut' }, label);
      master.to(stage, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'power1.inOut' }, label);
      master.add(function () { setActiveStage(stage); }, label);

      // this stage's evidence/new-button reveal, starting a beat after
      // the crossfade begins so the motion reads as sequential, not simultaneous
      animateStageContents(master, stage, label + '+=0.12');

      // resting beat — scroll room to actually look at / hover this stage
      // before the next crossfade starts
      master.to({}, { duration: 0.55 });
    });

    // matchMedia cleanup: undo everything cinematic-specific.
    return function () {
      introTrigger.kill();
      if (master.scrollTrigger) master.scrollTrigger.kill();
      master.kill();
      Array.prototype.forEach.call(viewport.children, function (stage) {
        scrollWrap.insertBefore(stage, viewport);
      });
      viewport.remove();
      section.classList.remove('is-cinematic');
      section.removeAttribute('data-active-stage');
      gsap.set(stages, { clearProps: 'all' });
    };
  }


  /* ==========================================================
     4. MOBILE STORY (reveal-on-scroll, no pinning)
     ------------------------------------------------------------
     Same 11-stage narrative, same per-category entrance motion,
     but stages stay in normal document flow and simply fade/rise
     into place as the user reaches them — no pin, no scrub, no
     fixed-position math to fight with mobile browser chrome.
     ========================================================== */

  function initMobileReveal() {
    var stages = gsap.utils.toArray('.scroll-stage', scrollWrap);
    if (!stages.length) return;

    var triggers = [];

    stages.forEach(function (stage) {
      primeStage(stage);
      gsap.set(stage, { opacity: 0, y: 24 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top 84%',
          toggleActions: 'play none none reverse',
          onEnter: function () { setActiveStage(stage); },
        },
      });

      tl.to(stage, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      animateStageContents(tl, stage, '-=0.25');

      triggers.push(tl.scrollTrigger);
    });

    return function () {
      triggers.forEach(function (st) { st.kill(); });
      gsap.set(stages, { clearProps: 'all' });
      section.removeAttribute('data-active-stage');
    };
  }


  /* ==========================================================
     5. SHARED HELPERS
     ========================================================== */

  // Reads the entrance-animation data attributes documented at the top
  // of section-2.html. Falling back to sensible defaults means the JS
  // never throws if a future evidence card forgets to set one.
  function rot(el) { return parseFloat(el.dataset.rotate || '0'); }
  function xp(el) { return parseFloat(el.dataset.xpercent || '0'); }
  function sc(el) { return parseFloat(el.dataset.scale || '1'); }

  // Sets every evidence card / new button in a stage to its hidden
  // "before it lands" state. Called once up front for every stage so
  // nothing flashes at full opacity before its scripted entrance —
  // relying on GSAP's immediateRender behaviour for this is fragile
  // inside a scrubbed timeline, so we set it explicitly instead.
  function primeStage(stage) {
    var quotes = stage.querySelectorAll('.falling-quote');
    quotes.forEach(function (el) {
      gsap.set(el, { y: -160, opacity: 0, scale: 0.92, rotate: rot(el) - 10 });
    });

    var moments = stage.querySelectorAll('.moment-frame');
    moments.forEach(function (el, i) {
      var fromSide = i % 2 === 0 ? -220 : 220;
      gsap.set(el, {
        xPercent: xp(el),
        x: fromSide,
        y: 10,
        opacity: 0,
        scale: 0.94,
        rotate: rot(el) + (i % 2 === 0 ? -6 : 6),
      });
    });

    var characters = stage.querySelectorAll('.character-name');
    characters.forEach(function (el) {
      gsap.set(el, { xPercent: xp(el), y: 140, opacity: 0, scale: 0.9, rotate: rot(el) });
    });

    var notes = stage.querySelectorAll('.note-card');
    notes.forEach(function (el, i) {
      var fromSide = i % 2 === 0 ? -60 : 60;
      gsap.set(el, {
        x: fromSide,
        y: -40,
        opacity: 0,
        scale: 0.85,
        rotate: rot(el) + (i % 2 === 0 ? -14 : 14),
      });
    });

    var thoughts = stage.querySelectorAll('.thought-card');
    thoughts.forEach(function (el) {
      gsap.set(el, { xPercent: xp(el), y: 26, opacity: 0, scale: sc(el) * 0.97, rotate: rot(el) });
    });

    var newButtons = stage.querySelectorAll('.depth-button-new');
    newButtons.forEach(function (el) {
      gsap.set(el, { opacity: 0, y: -20, scale: 0.85 });
    });
  }

  // Adds this stage's reveal tweens to the given timeline at `position`
  // (a GSAP position parameter — a label, a label+offset, or a relative
  // "-=0.25" string). Used by BOTH the cinematic master timeline and each
  // mobile per-stage timeline, which is why `position` is a parameter
  // rather than assumed to be a label on a specific timeline.
  function animateStageContents(tl, stage, position) {
    var quotes = stage.querySelectorAll('.falling-quote');
    if (quotes.length) {
      tl.to(quotes, {
        y: 0, opacity: 1, scale: 1,
        rotate: function (i, el) { return rot(el); },
        duration: 0.6, ease: 'back.out(1.6)', stagger: 0.09,
      }, position);
    }

    var moments = stage.querySelectorAll('.moment-frame');
    if (moments.length) {
      tl.to(moments, {
        x: 0, y: 0, opacity: 1, scale: 1,
        rotate: function (i, el) { return rot(el); },
        duration: 0.7, ease: 'power3.out', stagger: 0.1,
      }, position);
    }

    var characters = stage.querySelectorAll('.character-name');
    if (characters.length) {
      tl.to(characters, {
        y: 0, opacity: 1, scale: 1,
        rotate: function (i, el) { return rot(el); },
        duration: 0.6, ease: 'back.out(1.4)', stagger: 0.06,
      }, position);
    }

    var notes = stage.querySelectorAll('.note-card');
    if (notes.length) {
      tl.to(notes, {
        x: 0, y: 0, opacity: 1, scale: 1,
        rotate: function (i, el) { return rot(el); },
        duration: 0.55, ease: 'back.out(1.7)', stagger: 0.12,
      }, position);
    }

    var thoughts = stage.querySelectorAll('.thought-card');
    if (thoughts.length) {
      tl.to(thoughts, {
        y: 0, opacity: 1,
        scale: function (i, el) { return sc(el); },
        duration: 0.9, ease: 'power2.out', stagger: 0.25,
      }, position);
    }

    var newButtons = stage.querySelectorAll('.depth-button-new');
    if (newButtons.length) {
      tl.to(newButtons, {
        y: 0, opacity: 1, scale: 1,
        duration: 0.5, ease: 'back.out(2.2)',
      }, typeof position === 'string' ? position + '+=0.15' : position);
    }
  }

  // Marks one stage as the "current" one: toggles aria-hidden/inert on
  // every stage so assistive tech and keyboard focus only ever land on
  // the visible one, updates the section's data-active-stage attribute
  // (used by the mood-background CSS), and announces the change via the
  // visually-hidden live region.
  function setActiveStage(stage) {
    var stages = gsap.utils.toArray('.scroll-stage', scrollWrap);
    stages.forEach(function (s) {
      var active = s === stage;
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      s.inert = !active; // safe no-op in browsers without `inert` support
    });
    section.setAttribute('data-active-stage', stage.dataset.stage || '');
    if (statusEl) statusEl.textContent = stageLabel(stage.dataset.stage);
  }

  function stageLabel(key) {
    var labels = {
      'basic-row': 'Showing the plain rating, before any memories are added.',
      'quotes-fall': 'Quotes saved from Vagabond.',
      'row-with-quotes': 'Quotes layer saved to the row.',
      'moments-move': 'Moments saved from Vagabond.',
      'row-with-moment': 'Moments layer saved to the row.',
      'characters-appear': 'Characters saved from Vagabond.',
      'row-with-character': 'Characters layer saved to the row.',
      'notes-appear': 'Notes saved from Vagabond.',
      'row-with-notes': 'Notes layer saved to the row.',
      'thoughts-appear': 'Thoughts saved from Vagabond.',
      'final-row': 'Every layer saved — quotes, moments, characters, notes, and thoughts.',
    };
    return labels[key] || '';
  }

})();