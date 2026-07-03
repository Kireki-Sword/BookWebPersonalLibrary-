/* ==========================================================
   SECTION 2 — CINEMATIC SCROLL CONTROLLER

   This JavaScript controls the "A rating tells you nothing"
   section.

   Your HTML already has the structure:

      <section id="section-2-empty-shelf">
        <div class="empty-shelf-scroll">

          <div class="scroll-stage stage-basic-row">
          <div class="scroll-stage stage-quotes-fall">
          <div class="scroll-stage stage-row-with-quotes">
          <div class="scroll-stage stage-moments-move">
          <div class="scroll-stage stage-row-with-moment">
          <div class="scroll-stage stage-characters-appear">
          <div class="scroll-stage stage-row-with-character">
          <div class="scroll-stage stage-notes-appear">
          <div class="scroll-stage stage-row-with-notes">
          <div class="scroll-stage stage-thoughts-appear">
          <div class="scroll-stage stage-final-row">

        </div>
      </section>

   This JS does 7 important things:

   1. Finds all Section 2 scroll stages.
   2. Detects which stage is currently active while scrolling.
   3. Adds helpful classes like:
        .is-active
        .is-before
        .is-after
        .has-entered
   4. Replays the CSS animations when a stage actually enters view.
   5. Gives each stage a scroll progress value from 0 to 1.
   6. Adds cinematic extra motion:
        quotes gather
        moments collapse
        characters float
        notes drift
        thoughts fade
   7. Respects reduced-motion settings.

   Important:
   This JS is designed to work WITH the CSS I gave you.
   It does not replace the CSS.
   ========================================================== */



/* ==========================================================
   WRAP EVERYTHING IN AN IIFE

   IIFE means:
      Immediately Invoked Function Expression

   Basically, this keeps our variables private so they do not
   accidentally conflict with your other JS files.

   Without this wrapper, names like "stages" or "activeIndex"
   could accidentally collide with other code.
   ========================================================== */

(() => {
  /* ========================================================
     FIND SECTION 2

     This is the main section from your HTML:

        <section id="section-2-empty-shelf">

     If this section does not exist on the page, we stop the JS.
     This prevents errors on other pages.
     ======================================================== */

  const section = document.querySelector('#section-2-empty-shelf');

  if (!section) {
    return;
  }



  /* ========================================================
     FIND ALL SCROLL STAGES

     Each .scroll-stage is one visual beat in the animation.

     Example:
       - stage-basic-row
       - stage-quotes-fall
       - stage-row-with-quotes
       - stage-moments-move
       etc.

     Array.from turns the NodeList into a real array so we can use
     methods like forEach, map, and findIndex more comfortably.
     ======================================================== */

  const stages = Array.from(section.querySelectorAll('.scroll-stage'));

  if (stages.length === 0) {
    return;
  }



  /* ========================================================
     REDUCED MOTION CHECK

     Some users have motion reduction turned on in their device
     settings.

     If they do, we should not force big scroll animations.

     The CSS already has:

        @media (prefers-reduced-motion: reduce)

     But the JS also needs to respect it, because this script adds
     extra movement.
     ======================================================== */

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (reducedMotionQuery.matches) {
    section.classList.add('section-2-reduced-motion');

    stages.forEach((stage) => {
      stage.classList.add('is-active', 'has-entered');
      stage.style.opacity = '1';
      stage.style.pointerEvents = 'auto';
    });

    return;
  }



  /* ========================================================
     CONFIG

     These values control the feel of the animation.

     You can adjust these later.

     navOffset:
       Your navbar is 64px tall, so sticky stages should account
       for that.

     activeLine:
       This controls the vertical point in the viewport that decides
       which stage is active.

       0.5 means middle of the screen.
       0.42 means slightly above the middle.

     crossfadeStart:
       Near the end of one stage, we start fading toward the next one.

     collapseStart / collapseEnd:
       These control when loose evidence cards begin gathering toward
       the row area before turning into a button.
     ======================================================== */

  const config = {
    navOffset: 64,
    activeLine: 0.42,
    crossfadeStart: 0.78,
    collapseStart: 0.62,
    collapseEnd: 0.96,
    resizeDebounce: 150
  };



  /* ========================================================
     STATE

     activeIndex:
       The index of the current active stage.

     previousActiveIndex:
       Used so we can detect when the user enters a new stage.

     stageTops:
       Stores the page Y-position of every stage.
       We recalculate this on resize because layout can change.

     ticking:
       Used for requestAnimationFrame performance.
       It prevents scroll events from running too much code.

     resizeTimer:
       Used to debounce resize calculations.
     ======================================================== */

  let activeIndex = -1;
  let previousActiveIndex = -1;
  let stageTops = [];
  let ticking = false;
  let resizeTimer = null;



  /* ========================================================
     HELPER CSS INJECTION

     Your main CSS handles the design.

     This small injected CSS only gives the JS a clean way to hide
     inactive stages and control class states.

     Why inject it here?
       So you do not have to add extra CSS manually.

     The important idea:

       When JS is ready:
         - all stages are invisible by default
         - the active stage becomes visible
         - the next crossfade stage can also become visible

     This prevents sticky stages from visually stacking on top of
     each other in a messy way.
     ======================================================== */

  injectSection2HelperStyles();



  /* ========================================================
     MARK SECTION AS JS READY

     This class tells the helper CSS:

       "Okay, JavaScript is controlling the stage visibility now."

     We add this after injecting the helper CSS.
     ======================================================== */

  section.classList.add('section-2-js-ready');



  /* ========================================================
     GIVE EACH STAGE AN INDEX

     This is useful for debugging and styling.

     The HTML will effectively become:

       <div class="scroll-stage" data-stage-index="0">
       <div class="scroll-stage" data-stage-index="1">
       ...

     We are not changing your actual structure.
     We are only adding attributes/classes.
     ======================================================== */

  stages.forEach((stage, index) => {
    stage.dataset.stageIndex = String(index);

    stage.classList.add('section-2-stage-ready');

    /* Set default CSS variables.
       These are useful if you later want CSS to react to JS progress. */
    stage.style.setProperty('--stage-progress', '0');
    stage.style.setProperty('--stage-local-progress', '0');
  });



  /* ========================================================
     MEASURE STAGES

     We need to know where each stage begins on the full page.

     getBoundingClientRect().top gives position relative to viewport.
     window.scrollY gives how far the page has already scrolled.

     Add them together and you get the real page position.
     ======================================================== */

  function measureStages() {
    stageTops = stages.map((stage) => {
      const rect = stage.getBoundingClientRect();
      return rect.top + window.scrollY;
    });
  }



  /* ========================================================
     MATH HELPERS

     clamp:
       Keeps a number between a minimum and maximum.

     lerp:
       Linear interpolation.
       This moves smoothly between two numbers.

     smoothstep:
       Turns a raw 0→1 value into a smoother eased value.

     mapRange:
       Converts one range into another.

       Example:
         mapRange(0.5, 0, 1, 100, 200)
         gives 150.
     ======================================================== */

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function smoothstep(edge0, edge1, value) {
    const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return x * x * (3 - 2 * x);
  }

  function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return lerp(outMin, outMax, progress);
  }



  /* ========================================================
     GET CURRENT ACTIVE STAGE

     This function decides which stage should be active.

     It creates an imaginary horizontal line in the viewport.

       activeY = scroll position + part of viewport height

     When that line passes a stage's top, that stage becomes active.

     This works better than only using IntersectionObserver because
     sticky sections can overlap visually.
     ======================================================== */

  function getActiveStageIndex() {
    const activeY =
      window.scrollY +
      config.navOffset +
      window.innerHeight * config.activeLine;

    let index = 0;

    for (let i = 0; i < stageTops.length; i += 1) {
      if (activeY >= stageTops[i]) {
        index = i;
      }
    }

    return clamp(index, 0, stages.length - 1);
  }



  /* ========================================================
     GET LOCAL STAGE PROGRESS

     Each stage needs a progress value from 0 to 1.

     0 means:
       The stage has just started.

     1 means:
       The stage is basically finished and the next one is coming.

     We calculate progress based on the distance between this stage
     and the next stage.
     ======================================================== */

  function getLocalProgress(index) {
    const currentTop = stageTops[index];
    const nextTop = stageTops[index + 1];

    const activeY =
      window.scrollY +
      config.navOffset +
      window.innerHeight * config.activeLine;

    if (typeof nextTop !== 'number') {
      const finalDistance = window.innerHeight;
      return clamp((activeY - currentTop) / finalDistance, 0, 1);
    }

    return clamp((activeY - currentTop) / (nextTop - currentTop), 0, 1);
  }



  /* ========================================================
     REPLAY CSS ANIMATIONS

     Important problem:

     CSS animations normally start when the page loads.

     But Section 2 might be below the fold.
     So by the time the user scrolls there, those animations may
     already be finished.

     This function fixes that.

     When a stage becomes active, we temporarily set animation to none,
     force the browser to recalculate, then remove the inline style.

     That makes the CSS animation replay.
     ======================================================== */

  function replayAnimationsInside(stage) {
    const animatedElements = stage.querySelectorAll([
      '.media-library-row',
      '.depth-button-new',
      '.falling-quote',
      '.moment-frame',
      '.character-name',
      '.note-card',
      '.thought-card'
    ].join(','));

    animatedElements.forEach((element) => {
      element.style.animation = 'none';

      /* Force reflow.
         This line looks weird, but it makes the browser notice the reset. */
      void element.offsetWidth;

      element.style.animation = '';
    });
  }



  /* ========================================================
     RESET INLINE MOTION

     During scroll, JS adds translate/scale/opacity values.

     When a stage is not active anymore, we reset those values so
     the stage can replay cleanly if the user scrolls back.
     ======================================================== */

  function resetStageInlineMotion(stage) {
    const movingElements = stage.querySelectorAll([
      '.falling-quote',
      '.moment-frame',
      '.character-name',
      '.note-card',
      '.thought-card',
      '.media-library-row',
      '.depth-button-new'
    ].join(','));

    movingElements.forEach((element) => {
      element.style.translate = '';
      element.style.scale = '';
      element.style.rotate = '';
      element.style.opacity = '';
      element.style.filter = '';
    });
  }



  /* ========================================================
     UPDATE STAGE CLASSES

     This adds classes based on the active stage.

     A stage before the active one gets:
       .is-before

     The current stage gets:
       .is-active

     A stage after the active one gets:
       .is-after

     Once a stage has been reached, it also gets:
       .has-entered

     These classes are helpful for CSS and debugging.
     ======================================================== */

  function updateStageClasses(newActiveIndex, localProgress) {
    stages.forEach((stage, index) => {
      const isActive = index === newActiveIndex;
      const isBefore = index < newActiveIndex;
      const isAfter = index > newActiveIndex;
      const isNext = index === newActiveIndex + 1;

      stage.classList.toggle('is-active', isActive);
      stage.classList.toggle('is-before', isBefore);
      stage.classList.toggle('is-after', isAfter);
      stage.classList.toggle('is-crossfade-next', isNext);

      if (index <= newActiveIndex) {
        stage.classList.add('has-entered');
      }

      /* Store progress variables on every stage.
         CSS can use these later if you want. */
      stage.style.setProperty(
        '--stage-progress',
        isActive ? localProgress.toFixed(4) : '0'
      );

      stage.style.setProperty(
        '--stage-local-progress',
        isActive ? localProgress.toFixed(4) : '0'
      );
    });
  }



  /* ========================================================
     UPDATE STAGE VISIBILITY

     This controls crossfading between stages.

     Most of the time:
       active stage opacity = 1
       every other stage opacity = 0

     Near the end of a stage:
       active stage fades down
       next stage fades up

     This creates the "row disappears, evidence appears" feeling.
     ======================================================== */

  function updateStageVisibility(newActiveIndex, localProgress) {
    const fadeToNext = smoothstep(config.crossfadeStart, 1, localProgress);

    stages.forEach((stage, index) => {
      let opacity = 0;
      let pointerEvents = 'none';

      if (index === newActiveIndex) {
        opacity = lerp(1, 0.12, fadeToNext);
        pointerEvents = 'auto';
      }

      if (index === newActiveIndex + 1) {
        opacity = fadeToNext;
      }

      /* First stage should be visible before the user starts the sequence */
      if (newActiveIndex === 0 && index === 0 && localProgress < 0.1) {
        opacity = 1;
      }

      /* Final stage should stay visible at the end */
      if (newActiveIndex === stages.length - 1 && index === stages.length - 1) {
        opacity = 1;
        pointerEvents = 'auto';
      }

      stage.style.opacity = String(opacity);
      stage.style.pointerEvents = pointerEvents;
    });
  }



  /* ========================================================
     STAGE ENTER HANDLER

     This runs only when the active stage changes.

     Good place to:
       - replay animations
       - reset old transforms
       - add has-entered classes
     ======================================================== */

  function handleStageEnter(newActiveIndex) {
    const newStage = stages[newActiveIndex];

    if (!newStage) {
      return;
    }

    newStage.classList.add('has-entered');

    resetStageInlineMotion(newStage);
    replayAnimationsInside(newStage);
  }



  /* ========================================================
     COLLAPSE ELEMENTS TOWARD A TARGET

     This is the important cinematic part.

     The idea:
       Quotes/moments/characters/notes appear first.

     Then near the end of that stage, they visually gather toward
     the lower row area.

     Right after that, the next stage appears with a new button.

     So the user feels like:

       "I watched the proof become the button."

     This function does not literally move the element into the button.
     It creates the illusion by:
       - translating it toward a target
       - shrinking it
       - fading it out
       - slightly blurring it

     Then the next row appears with the new button already there.
     ======================================================== */

  function collapseElementsTowardShelf(stage, selector, progress, options = {}) {
    const elements = Array.from(stage.querySelectorAll(selector));

    if (elements.length === 0) {
      return;
    }

    const collapse = smoothstep(
      options.start ?? config.collapseStart,
      options.end ?? config.collapseEnd,
      progress
    );

    const stageRect = stage.getBoundingClientRect();

    /* Target point.
       This is roughly where the row/buttons appear. */
    const targetX = stageRect.width * (options.targetX ?? 0.5);
    const targetY = stageRect.height * (options.targetY ?? 0.68);

    elements.forEach((element, index) => {
      /* Reset transform-like individual properties before measuring.
         This prevents old translate values from corrupting the next measurement. */
      element.style.translate = '0px 0px';
      element.style.scale = '1';

      const rect = element.getBoundingClientRect();

      const elementCenterX = rect.left - stageRect.left + rect.width / 2;
      const elementCenterY = rect.top - stageRect.top + rect.height / 2;

      const moveX = (targetX - elementCenterX) * collapse;
      const moveY = (targetY - elementCenterY) * collapse;

      const finalScale = lerp(1, options.scaleTo ?? 0.46, collapse);
      const finalOpacity = lerp(1, options.opacityTo ?? 0, collapse);
      const finalBlur = lerp(0, options.blurTo ?? 8, collapse);

      /* Tiny stagger so every item does not collapse exactly the same way. */
      const staggerX = Math.sin(index + 1) * 8 * collapse;
      const staggerY = Math.cos(index + 1) * 6 * collapse;

      element.style.translate = `${moveX + staggerX}px ${moveY + staggerY}px`;
      element.style.scale = String(finalScale);
      element.style.opacity = String(finalOpacity);
      element.style.filter = `blur(${finalBlur}px)`;
    });
  }



  /* ========================================================
     ROW BREATHING MOTION

     This adds small scroll-based movement to the rows.

     It makes the row feel like it is entering and leaving,
     instead of being a totally flat static card.

     The row:
       - fades in at the beginning
       - stays stable in the middle
       - slightly fades/lifts at the end
     ======================================================== */

  function animateRowStage(stage, progress) {
    const row = stage.querySelector('.media-library-row');

    if (!row) {
      return;
    }

    const enter = smoothstep(0, 0.18, progress);
    const exit = smoothstep(0.78, 1, progress);

    const opacity = lerp(0, 1, enter) * lerp(1, 0.18, exit);
    const y = lerp(24, 0, enter) + lerp(0, -22, exit);
    const scale = lerp(0.975, 1, enter) * lerp(1, 0.985, exit);
    const blur = lerp(8, 0, enter) + lerp(0, 5, exit);

    row.style.opacity = String(opacity);
    row.style.translate = `0px ${y}px`;
    row.style.scale = String(scale);
    row.style.filter = `blur(${blur}px)`;
  }



  /* ========================================================
     QUOTES STAGE MOTION

     During the quotes stage:
       early: quotes fall in using CSS animation
       middle: quotes float
       late: quotes gather toward the row/button area

     This makes the next [Quotes] button feel earned.
     ======================================================== */

  function animateQuotesStage(stage, progress) {
    collapseElementsTowardShelf(stage, '.falling-quote', progress, {
      start: 0.58,
      end: 0.94,
      targetX: 0.5,
      targetY: 0.66,
      scaleTo: 0.38,
      blurTo: 10,
      opacityTo: 0
    });
  }



  /* ========================================================
     MOMENTS STAGE MOTION

     During the moments stage:
       the image cards drift like memories
       near the end, they collapse toward the shelf

     Then the next row appears with [Moments].
     ======================================================== */

  function animateMomentsStage(stage, progress) {
    const frames = Array.from(stage.querySelectorAll('.moment-frame'));

    frames.forEach((frame, index) => {
      const floatAmount = Math.sin(progress * Math.PI * 2 + index) * 10;
      frame.style.rotate = `${Math.sin(progress * Math.PI + index) * 2}deg`;

      if (progress < 0.58) {
        frame.style.translate = `0px ${floatAmount}px`;
      }
    });

    collapseElementsTowardShelf(stage, '.moment-frame', progress, {
      start: 0.60,
      end: 0.95,
      targetX: 0.5,
      targetY: 0.67,
      scaleTo: 0.34,
      blurTo: 9,
      opacityTo: 0
    });
  }



  /* ========================================================
     CHARACTER STAGE MOTION

     Characters should feel like they are gently floating.

     Near the end, they gather into the place where the
     [Characters] button will appear.
     ======================================================== */

  function animateCharactersStage(stage, progress) {
    const characters = Array.from(stage.querySelectorAll('.character-name'));

    characters.forEach((character, index) => {
      if (progress < 0.58) {
        const y = Math.sin(progress * Math.PI * 2 + index * 0.8) * 8;
        const x = Math.cos(progress * Math.PI * 2 + index * 0.6) * 4;

        character.style.translate = `${x}px ${y}px`;
      }
    });

    collapseElementsTowardShelf(stage, '.character-name', progress, {
      start: 0.61,
      end: 0.96,
      targetX: 0.5,
      targetY: 0.66,
      scaleTo: 0.32,
      blurTo: 9,
      opacityTo: 0
    });
  }



  /* ========================================================
     NOTES STAGE MOTION

     Notes feel like loose sticky notes.

     They drift slightly while visible, then collapse toward the row
     before the [Notes] button appears.
     ======================================================== */

  function animateNotesStage(stage, progress) {
    const notes = Array.from(stage.querySelectorAll('.note-card'));

    notes.forEach((note, index) => {
      if (progress < 0.58) {
        const x = Math.sin(progress * Math.PI * 2 + index) * 8;
        const y = Math.cos(progress * Math.PI * 2 + index) * 5;

        note.style.translate = `${x}px ${y}px`;
      }
    });

    collapseElementsTowardShelf(stage, '.note-card', progress, {
      start: 0.60,
      end: 0.95,
      targetX: 0.5,
      targetY: 0.67,
      scaleTo: 0.36,
      blurTo: 9,
      opacityTo: 0
    });
  }



  /* ========================================================
     THOUGHTS STAGE MOTION

     Thoughts are deeper than the other pieces.

     They should not fly around too much.

     So this function keeps the movement calm:
       - subtle fade
       - slight vertical drift
       - soft ending collapse
     ======================================================== */

  function animateThoughtsStage(stage, progress) {
    const thoughts = Array.from(stage.querySelectorAll('.thought-card'));

    thoughts.forEach((thought, index) => {
      const enter = smoothstep(0, 0.22, progress);
      const exit = smoothstep(0.76, 1, progress);

      const y = lerp(26, 0, enter) + lerp(0, -18, exit);
      const opacity = lerp(0, 1, enter) * lerp(1, 0.25, exit);
      const blur = lerp(8, 0, enter) + lerp(0, 5, exit);

      thought.style.translate = `0px ${y + index * 4}px`;
      thought.style.opacity = String(opacity);
      thought.style.filter = `blur(${blur}px)`;
    });
  }



  /* ========================================================
     NEW BUTTON EMPHASIS

     When a row returns with a new button, this gives that newest
     button a tiny scroll-based glow/lift.

     This helps the user understand:
       "This is the thing that was just created."
     ======================================================== */

  function animateNewButton(stage, progress) {
    const newButton = stage.querySelector('.depth-button-new');

    if (!newButton) {
      return;
    }

    const settle = smoothstep(0.05, 0.32, progress);
    const y = lerp(-10, 0, settle);
    const scale = lerp(1.05, 1, settle);
    const opacity = lerp(0.75, 1, settle);

    newButton.style.translate = `0px ${y}px`;
    newButton.style.scale = String(scale);
    newButton.style.opacity = String(opacity);
  }



  /* ========================================================
     FINAL ROW MOTION

     The final row should feel more stable.

     It is the completed version:

       9/10
       [Quotes] [Moments] [Characters] [Notes] [Thoughts]

     This function makes it appear and then stay strong.
     ======================================================== */

  function animateFinalRow(stage, progress) {
    const row = stage.querySelector('.media-library-row');

    if (!row) {
      return;
    }

    const enter = smoothstep(0, 0.25, progress);

    const opacity = lerp(0, 1, enter);
    const y = lerp(34, 0, enter);
    const scale = lerp(0.96, 1, enter);
    const blur = lerp(9, 0, enter);

    row.style.opacity = String(opacity);
    row.style.translate = `0px ${y}px`;
    row.style.scale = String(scale);
    row.style.filter = `blur(${blur}px)`;
  }



  /* ========================================================
     APPLY MOTION FOR THE ACTIVE STAGE

     This chooses what animation logic to run based on the stage's
     class name.

     Example:
       If active stage has .stage-quotes-fall,
       run animateQuotesStage().

       If active stage has .stage-moments-move,
       run animateMomentsStage().
     ======================================================== */

  function applyActiveStageMotion(stage, progress) {
    if (!stage) {
      return;
    }

    if (
      stage.classList.contains('stage-basic-row') ||
      stage.classList.contains('stage-row-with-quotes') ||
      stage.classList.contains('stage-row-with-moment') ||
      stage.classList.contains('stage-row-with-character') ||
      stage.classList.contains('stage-row-with-notes')
    ) {
      animateRowStage(stage, progress);
      animateNewButton(stage, progress);
    }

    if (stage.classList.contains('stage-quotes-fall')) {
      animateQuotesStage(stage, progress);
    }

    if (stage.classList.contains('stage-moments-move')) {
      animateMomentsStage(stage, progress);
    }

    if (stage.classList.contains('stage-characters-appear')) {
      animateCharactersStage(stage, progress);
    }

    if (stage.classList.contains('stage-notes-appear')) {
      animateNotesStage(stage, progress);
    }

    if (stage.classList.contains('stage-thoughts-appear')) {
      animateThoughtsStage(stage, progress);
    }

    if (stage.classList.contains('stage-final-row')) {
      animateFinalRow(stage, progress);
      animateNewButton(stage, progress);
    }
  }



  /* ========================================================
     MAIN UPDATE FUNCTION

     This runs on scroll.

     It:
       1. Finds the active stage.
       2. Finds that stage's local progress.
       3. Updates classes.
       4. Updates visibility/crossfade.
       5. Runs the correct motion function.
       6. Replays animations when a new stage starts.
     ======================================================== */

  function updateSection2() {
    ticking = false;

    const newActiveIndex = getActiveStageIndex();
    const localProgress = getLocalProgress(newActiveIndex);

    activeIndex = newActiveIndex;

    if (activeIndex !== previousActiveIndex) {
      handleStageEnter(activeIndex);

      if (previousActiveIndex >= 0 && stages[previousActiveIndex]) {
        resetStageInlineMotion(stages[previousActiveIndex]);
      }

      previousActiveIndex = activeIndex;
    }

    updateStageClasses(activeIndex, localProgress);
    updateStageVisibility(activeIndex, localProgress);

    const activeStage = stages[activeIndex];
    applyActiveStageMotion(activeStage, localProgress);
  }



  /* ========================================================
     REQUEST ANIMATION FRAME SCROLL HANDLER

     Scroll events can fire many times per second.

     Instead of doing all the work inside the scroll event directly,
     we use requestAnimationFrame.

     This makes animation smoother and more performance friendly.
     ======================================================== */

  function requestTick() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateSection2);
    }
  }



  /* ========================================================
     RESIZE HANDLER

     If the screen size changes, stage positions can change.

     Example:
       - browser resized
       - phone rotated
       - fonts/images load differently

     So we remeasure stages after resize.
     ======================================================== */

  function handleResize() {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      measureStages();
      updateSection2();
    }, config.resizeDebounce);
  }



  /* ========================================================
     IMAGE LOAD HANDLER

     Your section has images:
       - cover
       - moment frames
       - character images

     If images load after JS measures the page, the layout might shift.

     So whenever an image loads, we measure again.
     ======================================================== */

  function watchImages() {
    const images = Array.from(section.querySelectorAll('img'));

    images.forEach((image) => {
      if (image.complete) {
        return;
      }

      image.addEventListener('load', () => {
        measureStages();
        updateSection2();
      }, { once: true });

      image.addEventListener('error', () => {
        measureStages();
        updateSection2();
      }, { once: true });
    });
  }



  /* ========================================================
     INTERSECTION OBSERVER

     This is not the main active-stage detector.

     The scroll math above does that.

     This observer is mainly useful for adding a class when the
     whole Section 2 is actually near the viewport.

     That way you can style/debug:

       .section-empty-shelf.is-in-view
       .section-empty-shelf.has-been-viewed
     ======================================================== */

  function setupSectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          section.classList.toggle('is-in-view', entry.isIntersecting);

          if (entry.isIntersecting) {
            section.classList.add('has-been-viewed');
          }
        });
      },
      {
        root: null,
        threshold: 0.08
      }
    );

    observer.observe(section);
  }



  /* ========================================================
     HELPER STYLE FUNCTION

     This injects small CSS rules that the JS depends on.

     Your design CSS still controls the actual look.
     These rules mainly handle visibility states.
     ======================================================== */

  function injectSection2HelperStyles() {
    const styleId = 'section-2-js-helper-styles';

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;

    style.textContent = `
      #section-2-empty-shelf.section-2-js-ready .scroll-stage {
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s linear;
        will-change: opacity;
      }

      #section-2-empty-shelf.section-2-js-ready .scroll-stage.is-active {
        pointer-events: auto;
      }

      #section-2-empty-shelf.section-2-js-ready .scroll-stage.is-crossfade-next {
        pointer-events: none;
      }

      #section-2-empty-shelf.section-2-js-ready .media-library-row,
      #section-2-empty-shelf.section-2-js-ready .falling-quote,
      #section-2-empty-shelf.section-2-js-ready .moment-frame,
      #section-2-empty-shelf.section-2-js-ready .character-name,
      #section-2-empty-shelf.section-2-js-ready .note-card,
      #section-2-empty-shelf.section-2-js-ready .thought-card,
      #section-2-empty-shelf.section-2-js-ready .depth-button-new {
        will-change: transform, translate, scale, opacity, filter;
      }

      #section-2-empty-shelf.section-2-reduced-motion .scroll-stage {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `;

    document.head.appendChild(style);
  }



  /* ========================================================
     INIT FUNCTION

     This starts everything.

     Order matters:

       1. Watch images
       2. Set up section observer
       3. Measure stages
       4. Run first update
       5. Listen for scroll/resize
     ======================================================== */

  function initSection2Scroll() {
    watchImages();
    setupSectionObserver();

    measureStages();
    updateSection2();

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', handleResize);
  }



  /* ========================================================
     START AFTER DOM IS READY

     If the script is placed at the end of body, DOM is probably
     already ready.

     But this makes it safe either way.
     ======================================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSection2Scroll, {
      once: true
    });
  } else {
    initSection2Scroll();
  }
})();