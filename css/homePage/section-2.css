/* ============================================================================
   SECTION 2 — PART 1b: PREMIUM DEPTH PASS
   ------------------------------------------------------------------------
   Follow-up to the first premium pass: the card read as flat, so this
   adds layered depth — a soft halo behind each stage, a richer card
   surface, a light 2.5D hover (not a full 3D tilt), a cover with its
   own direct-hover shine, and a score capsule that stays visually
   stable while a floating "but why?" popover + aura appear around it
   instead of inside it. Debug stage label is now hidden by default.

   Contents:
     1. Section container + background (calm continuation of Section 1)
     2. Header (label / title / subtitle)
     3. Scroll wrapper
     4. Stage halo + hidden-by-default debug label (preview mode)
     5. Card shell (surface, border, shadow, highlight)
     6. Card inner grid (cover | text | score)
     7. Cover (fallback, border, direct-hover shine vs row-hover baseline)
     8. Title / author
     9. Meta chips
     10. Score capsule (aura + floating "but why?" popover)
     11. Row hover (2.5D lift, shadow, sheen)
     12. Mobile layout
     13. Button tray
     14-19. Evidence cards (quotes/moments/characters/notes/thoughts)
     20. Responsive — evidence + button tray
     21. Reduced motion safety net
   ============================================================================ */


/* ============================================================================
   1. SECTION CONTAINER + BACKGROUND
   ------------------------------------------------------------------------
   Warmed up from the flatter first pass: section-level radial glows,
   a large blurred ambient warmth layer (::before), and a very faint
   paper-grain layer (::after). This makes the whole section behind the
   card and evidence cards feel alive, not just the card itself.
   ============================================================================ */

#section-2-empty-shelf,
.section-empty-shelf {
  --section-2-row-width: 940px;

  position: relative;
  width: 100%;
  overflow: hidden;

  padding:
    5rem
    max(1.5rem, calc((100vw - 1220px) / 2 + 1.5rem))
    6rem;

  color: var(--ink);

  /* Full-section warmth: this continues the blurry, alive atmosphere from
     section 1 instead of leaving the quote/card area flat. */
  background:
    radial-gradient(circle at 50% 18%, rgba(196, 122, 58, 0.12), transparent 34%),
    radial-gradient(circle at 48% 58%, rgba(151, 91, 42, 0.10), transparent 42%),
    radial-gradient(circle at 50% 100%, rgba(222, 165, 98, 0.16), transparent 45%),
    linear-gradient(180deg, #fbf4ea 0%, #f4e4d1 100%);
}

/* Large section-level ambient glow — this belongs to the section, not to the
   card. It fills the empty space behind the main card and evidence cards so
   the area feels warm, blurry, and alive. */
#section-2-empty-shelf::before,
.section-empty-shelf::before {
  content: "";
  position: absolute;
  inset: 120px 8% auto 8%;
  height: 520px;
  z-index: 0;
  pointer-events: none;

  background:
    radial-gradient(ellipse at center, rgba(166, 95, 42, 0.16), transparent 68%);
  filter: blur(60px);
  opacity: 0.9;
}

/* Very faint paper grain / atmosphere. Kept low-opacity so it reads as
   warmth and texture, not as a visible pattern. */
#section-2-empty-shelf::after,
.section-empty-shelf::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  background-image:
    radial-gradient(rgba(97, 58, 31, 0.045) 0.7px, transparent 0.7px);
  background-size: 4px 4px;
  opacity: 0.18;
}

#section-2-empty-shelf > *,
.section-empty-shelf > * {
  position: relative;
  z-index: 1;
}


/* ============================================================================
   2. SECTION HEADER
   ============================================================================ */

.section-2-header {
  max-width: 880px;
  margin: 0 auto 4rem; /* header-to-card gap lives here, see plan section 2 */
  text-align: center;
}

.section-2-header .section-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.8rem;

  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--warm-brown-dark);
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.section-2-header h2 {
  margin: 0 auto;

  font-family: var(--font-display);
  font-size: clamp(3rem, 5.8vw, 5.25rem);
  font-weight: 650;
  color: var(--ink);
  letter-spacing: -0.055em;
  line-height: 0.94;
}

.section-2-header p {
  max-width: 680px;
  margin: 1.15rem auto 0;

  font-family: var(--font-body);
  font-size: 1.05rem;
  color: var(--ink-light);
  line-height: 1.7;
}


/* ============================================================================
   3. SCROLL WRAPPER
   ============================================================================ */

.empty-shelf-scroll {
  position: relative;
  z-index: 1;
}


/* ============================================================================
   4. STAGE VISIBILITY — PREVIEW MODE
   ------------------------------------------------------------------------
   TEMPORARY: showing every stage stacked in normal page flow so you can
   scroll through and review/edit all 11 at once. This is NOT the final
   behavior — once GSAP comes back, only one stage should show at a time
   again. To restore that later, delete this block and un-comment the
   one below it.

   Also adds a small CSS-only label above each stage (using its
   data-stage attribute, no JS) so you can tell which block is which —
   several of these stages reuse the same "Vagabond" row, so without a
   label they're hard to tell apart while scrolling past quickly.
   ============================================================================ */

.empty-shelf-scroll {
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

.scroll-stage {
  position: relative;
  isolation: isolate; /* keeps the halo below (section 4b) contained to its own stacking context */

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

/* Warm aura hugging the book card only — this replaces the old broad
   stage glow. The aura is constrained to the card row width, sits behind
   the card, and becomes warmer on card hover. Evidence stages do not get
   this aura, so the background no longer feels washed with glow. */
.card-wrap {
  position: relative;
  width: min(var(--section-2-row-width), 100%);
  margin-inline: auto;
  isolation: isolate;
  perspective: 1200px;
}

.card-wrap::before,
.scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -1;
  pointer-events: none;

  width: min(calc(var(--section-2-row-width) + 70px), calc(100% + 70px));
  height: calc(100% + 72px);
  border-radius: 46px;

  background: radial-gradient(
    ellipse at 50% 58%,
    rgba(194, 111, 47, 0.24),
    rgba(194, 111, 47, 0.10) 38%,
    transparent 72%
  );
  filter: blur(26px);
  opacity: 0.72;
  transform: translate(-50%, -50%) scale(1);

  transition:
    opacity 240ms ease,
    transform 240ms ease,
    background 240ms ease;
}

.card-wrap:hover::before,
.scroll-stage:not(:has(.card-wrap)):has(.media-library-row:hover)::before {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.025);
  background: radial-gradient(
    ellipse at 50% 58%,
    rgba(207, 121, 49, 0.34),
    rgba(207, 121, 49, 0.16) 40%,
    transparent 74%
  );
}

/* Dev-only label, OFF by default. To see which stage is which while
   editing, add class="debug-labels" to #section-2-empty-shelf in the
   HTML temporarily — don't ship it turned on. */
.section-empty-shelf.debug-labels .scroll-stage::after {
  content: "STAGE — " attr(data-stage);
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 800;
  color: rgba(184, 121, 78, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* PRODUCTION RULE — re-enable this (and remove the preview block above)
   once GSAP is driving stage switching again:

.scroll-stage[aria-hidden="true"] {
  display: none;
}

*/


/* ============================================================================
   5. CARD SHELL — surface, border, shadow, highlight
   ------------------------------------------------------------------------
   This is where the "physical object on a desk" feeling comes from: a
   faint top-to-bottom gradient (not flat cream), two-layer shadow (a
   big soft ambient one + a tighter contact one), and a 1px inner
   highlight that catches the light like polished paper.
   ============================================================================ */

.media-library-row {
  width: min(var(--section-2-row-width), 100%);
  min-height: 250px;
  margin-inline: auto;

  padding: 30px;

  background:
    linear-gradient(180deg, rgba(255, 253, 249, 0.96) 0%, rgba(255, 247, 236, 0.94) 100%);
  border: 1px solid rgba(184, 121, 78, 0.22);
  border-radius: 30px;

  box-shadow:
    0 28px 74px rgba(87, 49, 22, 0.12),
    0 10px 24px rgba(87, 49, 22, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);

  position: relative;
  overflow: hidden; /* keeps the sheen sweep (section 11) contained */

  transform: perspective(900px) translateZ(0);
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms ease,
    background 220ms ease,
    box-shadow 240ms ease;
}

.media-library-row:has(.media-row-details) {
  min-height: 330px;
}


/* ============================================================================
   6. CARD INNER GRID — cover | text | score
   ============================================================================ */

.media-row-main {
  position: relative;
  z-index: 1; /* sits above the sheen sweep in section 11 */

  display: grid;
  grid-template-columns: 124px minmax(0, 1fr) auto;
  grid-template-areas:
    "cover info  score"
    "cover chips score";
  grid-template-rows: auto auto;
  min-height: 190px;
  column-gap: 1.6rem;
  row-gap: 0.72rem;
  align-content: center;
  align-items: center;
}


/* ============================================================================
   7. COVER
   ------------------------------------------------------------------------
   Fallback gradient means even a missing/broken image still reads as an
   intentional object, never a broken-icon moment.
   ============================================================================ */

.media-row-cover {
  grid-area: cover;
  grid-row: 1 / -1;

  position: relative; /* positioning context for the shine sweep below */
  width: 124px;
  aspect-ratio: 2 / 3;

  border: 1px solid rgba(184, 121, 78, 0.16);
  border-radius: 17px;
  overflow: hidden;

  background:
    radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.30), transparent 32%),
    linear-gradient(150deg, rgba(44, 36, 22, 0.12), rgba(184, 121, 78, 0.26)),
    var(--cream-dark);

  box-shadow:
    0 14px 30px rgba(44, 36, 22, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);

  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 280ms ease;
}

.media-row-cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;

  color: transparent; /* hides alt text if the path 404s */
  font-size: 0;

  transition: filter 280ms ease;
}

/* Diagonal shine — a proper "book jacket catching light" moment, but
   ONLY when the cover itself is hovered directly, not just the row. */
.media-row-cover::after {
  content: "";
  position: absolute;
  top: -60%;
  left: -85%;
  z-index: 2;
  width: 50%;
  height: 220%;
  pointer-events: none;

  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: rotate(12deg) translateX(0);
  opacity: 0;

  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease;
}

/* BASELINE reaction — hovering anywhere on the row gives the cover a
   small, stable lift. This intentionally has the same specificity as
   the direct-hover rule below it (2 classes + 1 pseudo each) so source
   order decides the tie — direct hover comes second and wins. */
.media-library-row:hover .media-row-cover {
  transform: translateY(-3px) rotate(-1deg);
  box-shadow: 0 18px 36px rgba(44, 36, 22, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.media-library-row:hover .media-row-cover img {
  filter: saturate(1.05) contrast(1.04);
}

/* DIRECT hover — mouse specifically over the cover: lifts a bit more
   than the baseline and adds the shine sweep. */
.media-library-row .media-row-cover:hover {
  transform: translateY(-5px) rotate(-1.5deg);
  box-shadow: 0 22px 44px rgba(44, 36, 22, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.media-library-row .media-row-cover:hover img {
  filter: saturate(1.08) contrast(1.06);
}

.media-library-row .media-row-cover:hover::after {
  opacity: 1;
  transform: rotate(12deg) translateX(260%);
}


/* ============================================================================
   8. TITLE / AUTHOR
   ============================================================================ */

.media-row-info {
  grid-area: info;
  min-width: 0;
  align-self: end;
}

.media-row-info h3 {
  margin: 0;

  font-family: var(--font-display);
  font-size: clamp(1.8rem, 2.35vw, 2.08rem);
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.045em;
  line-height: 1;

  text-decoration: none;
  cursor: default;

  transition:
    color 180ms ease,
    text-shadow 180ms ease,
    opacity 180ms ease;
}

.media-row-info p {
  margin-top: 0.3rem;

  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--ink-mid);
  line-height: 1.35;

  text-decoration: none;
  cursor: default;

  transition:
    color 180ms ease,
    text-shadow 180ms ease,
    opacity 180ms ease;
}

.media-row-info h3:hover {
  color: #3d2114;
  text-shadow: 0 10px 28px rgba(148, 78, 32, 0.14);
}

.media-row-info p:hover {
  color: var(--warm-brown-dark);
  text-shadow: 0 8px 22px rgba(148, 78, 32, 0.10);
}


/* ============================================================================
   9. META CHIPS
   ============================================================================ */

.media-row-format,
.media-row-status {
  grid-area: chips;
  align-self: start;
  margin-top: 0.8rem;
}

/* These two items share the same grid area in the current markup, so the
   second chip is offset to sit beside the first without requiring HTML
   changes. If you later add a dedicated .media-row-chips wrapper, move
   both chips into that wrapper and replace this offset with gap: 0.65rem. */
.media-row-status {
  margin-left: calc(0.65rem + 4.65rem);
}

.media-row-format span,
.media-row-status span {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 0.75rem;

  background: linear-gradient(180deg, rgba(255, 250, 240, 0.95), rgba(184, 121, 78, 0.08));
  border: 1px solid rgba(184, 121, 78, 0.24);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62);

  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--warm-brown-dark);
  white-space: nowrap;

  text-decoration: none;
  cursor: pointer;

  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.media-row-format span:hover,
.media-row-status span:hover {
  background: linear-gradient(180deg, rgba(255, 252, 246, 1), rgba(207, 121, 49, 0.16));
  border-color: rgba(155, 90, 50, 0.34);
  color: #6e3b20;
  transform: translateY(-1px);
  box-shadow:
    0 8px 18px rgba(90, 48, 22, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.media-row-format span:focus:not(:focus-visible),
.media-row-status span:focus:not(:focus-visible) {
  outline: none;
}

.media-row-format span:focus-visible,
.media-row-status span:focus-visible {
  outline: 2px solid rgba(155, 90, 50, 0.55);
  outline-offset: 4px;
}


/* ============================================================================
   10. SCORE CAPSULE — aura + floating "but why?" popover
   ------------------------------------------------------------------------
   The capsule shape itself never changes on hover anymore — no shifting
   padding, no text jumping upward. Instead, two separate things appear
   around it: a soft warm aura (::before) and a small floating popover
   (::after) that reads as a thought appearing next to the score, not a
   layout change. Popover sits BELOW the capsule rather than above — the
   row has generous bottom padding for this (see section 5's comment),
   whereas the top edge is tighter on stages with no button tray beneath
   to buffer it.
   ============================================================================ */

.media-row-score {
  grid-area: score;
  grid-row: 1 / -1;
  align-self: center;
  justify-self: end;

  position: relative;
  z-index: 1;
  min-width: 84px;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 1.1rem;

  background: rgba(255, 252, 248, 0.92);
  border: 1px solid rgba(184, 121, 78, 0.24);
  border-radius: 999px;
  box-shadow: 0 8px 22px rgba(44, 36, 22, 0.06);

  cursor: default;

  transition: border-color 240ms ease, box-shadow 240ms ease, background 240ms ease;
}

.media-row-score span {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.02em;
  line-height: 1;
}

/* AURA — soft warm ring behind the capsule, the "score as conceptual
   trigger of the whole section" feeling. */
.media-row-score::before {
  content: "";
  position: absolute;
  inset: -14px;
  z-index: -1;
  border-radius: 999px;
  pointer-events: none;

  background: radial-gradient(circle, rgba(226, 185, 143, 0.38), transparent 70%);
  opacity: 0;
  transform: scale(0.85);

  transition: opacity 260ms ease, transform 260ms ease;
}

/* POPOVER — "but why?" as its own small floating pill below the score,
   connected only by proximity and a matching shadow language, not a
   literal pointer (kept deliberately simple/robust in plain CSS). */
.media-row-score::after {
  content: "but why?";
  position: absolute;
  left: 50%;
  top: calc(100% + 8px);
  transform: translateX(-50%) translateY(-4px);
  white-space: nowrap;

  padding: 0.32rem 0.65rem;

  background: rgba(255, 252, 248, 0.98);
  border: 1px solid rgba(184, 121, 78, 0.3);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(44, 36, 22, 0.12);

  font-family: var(--font-body);
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--warm-brown-dark);
  text-transform: uppercase;
  letter-spacing: 0.08em;

  opacity: 0;
  pointer-events: none;

  transition: opacity 220ms ease, transform 220ms ease;
}

.media-row-score:hover,
.media-row-score:focus-visible {
  border-color: rgba(184, 121, 78, 0.4);
  background: rgba(255, 252, 248, 1);
  box-shadow: 0 14px 30px rgba(127, 75, 47, 0.14);
}

.media-row-score:hover::before,
.media-row-score:focus-visible::before {
  opacity: 1;
  transform: scale(1);
}

.media-row-score:hover::after,
.media-row-score:focus-visible::after {
  opacity: 0.95;
  transform: translateX(-50%) translateY(0);
}


/* ============================================================================
   11. ROW HOVER — lift, deeper shadow, warmer border, soft sheen
   ------------------------------------------------------------------------
   The sheen is a slow (700ms) diagonal highlight, deliberately subtle —
   this should read as polished paper catching light, not glossy plastic.
   ============================================================================ */

.media-library-row::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -85%;
  z-index: 0;
  width: 55%;
  height: 200%;
  pointer-events: none;

  background: linear-gradient(
    105deg,
    transparent 0%,
    rgba(255, 255, 255, 0.10) 35%,
    rgba(255, 255, 255, 0.30) 48%,
    rgba(255, 255, 255, 0.10) 61%,
    transparent 100%
  );

  transform: translateX(0) rotate(8deg);
  opacity: 0;

  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
}

.media-library-row:hover {
  transform: perspective(900px) rotateX(0.7deg) translateY(-6px);
  border-color: rgba(127, 75, 47, 0.34);
  background:
    linear-gradient(180deg, rgba(255, 254, 251, 0.99) 0%, rgba(255, 249, 240, 0.98) 100%);

  box-shadow:
    0 36px 92px rgba(87, 49, 22, 0.17),
    0 14px 30px rgba(87, 49, 22, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

.media-library-row:hover::before {
  opacity: 1;
  transform: translateX(310%) rotate(8deg);
}

.media-library-row:focus:not(:focus-visible) {
  outline: none;
}

.media-library-row:focus-visible {
  outline: 2px solid rgba(155, 90, 50, 0.55);
  outline-offset: 5px;
}


/* ============================================================================
   12. MOBILE LAYOUT
   ============================================================================ */

@media (max-width: 900px) {
  #section-2-empty-shelf,
  .section-empty-shelf {
    padding: 4.5rem max(1.25rem, calc((100vw - 760px) / 2 + 1.25rem)) 5rem;
  }

  .media-library-row {
    width: min(860px, 100%);
  }

  .media-row-main {
    grid-template-columns: 112px minmax(0, 1fr) auto;
    min-height: 170px;
    column-gap: 1.35rem;
  }

  .media-row-cover {
    width: 112px;
  }

  .media-row-details {
    width: calc(100% - 112px - 1.35rem);
    margin-left: calc(112px + 1.35rem);
  }

  .media-row-format,
  .media-row-status {
    grid-area: chips;
  }
}

@media (max-width: 640px) {
  #section-2-empty-shelf,
  .section-empty-shelf {
    padding: 4rem 1.1rem 4.5rem;
  }

  .section-2-header {
    margin-bottom: 2.75rem;
  }

  .section-2-header h2 {
    font-size: clamp(2.15rem, 9vw, 2.6rem);
  }

  .section-2-header p {
    font-size: 0.95rem;
  }

  .media-library-row {
    padding: 1.15rem 1.2rem;
    border-radius: 22px;
  }

  .media-row-main {
    grid-template-columns: 82px minmax(0, 1fr) auto;
    min-height: 124px;
    column-gap: 0.9rem;
  }

  .media-row-cover {
    width: 82px;
    border-radius: 12px;
  }

  .media-row-info h3 {
    font-size: 1.35rem;
  }

  .media-row-status {
    margin-left: calc(0.4rem + 3.6rem);
  }

  .media-row-score {
    min-width: 74px;
    height: 46px;
    padding: 0 0.8rem;
  }

  .media-row-score span {
    font-size: 1.2rem;
  }

  /* Hover-dependent reveal doesn't work well on touch — keep the score
     legible without ever needing a hover on mobile. */
  .media-row-score::after {
    display: none;
  }
}


/* ============================================================================
   13. BUTTON TRAY — "Saved layers" + depth buttons
   ------------------------------------------------------------------------
   Appears inside the card for every stage from row-with-quotes onward.
   Sits below the cover/info/score grid, separated by a thin warm rule.
   Still no landing animation here — that's GSAP's job later. This is
   just what the tray and buttons look like at rest and on hover.
   ============================================================================ */

.media-row-details {
  position: relative;
  z-index: 1;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;

  /* Divider and saved layers belong only to the right content column.
     They intentionally start after the cover so the cover can own the
     full vertical top area without being visually cut by the line. */
  width: calc(100% - 124px - 1.6rem);
  margin-top: 1.15rem;
  margin-left: calc(124px + 1.6rem);
  padding-top: 1.15rem;
  border-top: 1px solid rgba(184, 121, 78, 0.15);
}

.media-row-details::before {
  content: "Saved layers";
  flex-basis: 100%;
  margin-bottom: 0.1rem;

  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 800;
  color: rgba(155, 135, 114, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.depth-button {
  min-height: 38px;
  padding: 0 0.95rem;

  background: rgba(184, 121, 78, 0.07);
  border: 1px solid rgba(184, 121, 78, 0.26);
  border-radius: 999px;

  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ink-mid);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.depth-button:hover {
  background: rgba(207, 121, 49, 0.14);
  border-color: rgba(155, 90, 50, 0.38);
  color: var(--ink);
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(90, 48, 22, 0.11);
}

.depth-button:active {
  transform: translateY(0);
  box-shadow: none;
}

.depth-button:focus:not(:focus-visible) {
  outline: none;
}

.depth-button:focus-visible {
  outline: 2px solid rgba(155, 90, 50, 0.55);
  outline-offset: 4px;
}

/* Slightly warmer fill — visually marks "the layer this stage just added"
   even before GSAP gives it an actual landing animation. */
.depth-button-new {
  background: rgba(184, 121, 78, 0.13);
  border-color: rgba(184, 121, 78, 0.4);
  color: var(--ink);
}


/* ============================================================================
   14. EVIDENCE STAGE CONTAINERS
   ------------------------------------------------------------------------
   Each cloud (quotes/moments/characters/notes/thoughts) replaces the row
   entirely for its stage. For now these lay out as calm, responsive
   grids — no absolute scatter/rotation yet, since that's tied to the
   GSAP phase. Same max-width as the row card so the whole section keeps
   one consistent column, even as the content swaps.
   ============================================================================ */

.falling-quotes,
.moving-moments,
.character-cloud,
.notes-cloud,
.thoughts-cloud {
  display: grid;
  gap: 1.1rem;
  width: min(var(--section-2-row-width), 100%);
  margin-inline: auto;
}

.falling-quotes,
.notes-cloud {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.moving-moments {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.character-cloud {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.thoughts-cloud {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}


/* ============================================================================
   15. QUOTES — paper strips
   ============================================================================ */

.falling-quote {
  padding: 1.1rem 1.25rem;

  background: linear-gradient(180deg, #fffdfa 0%, #fff8f0 100%);
  border: 1px solid rgba(127, 75, 47, 0.18);
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(44, 36, 22, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.6);

  font-family: var(--font-display);
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--ink-mid);
  cursor: default;

  transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease, color 240ms ease;
}

.falling-quote:hover {
  transform: translateY(-5px);
  color: var(--ink);
  border-color: rgba(184, 121, 78, 0.36);
  box-shadow: 0 26px 56px rgba(44, 36, 22, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}


/* ============================================================================
   16. MOMENTS — manga panels
   ============================================================================ */

.moment-frame {
  margin: 0;
  padding: 0.6rem;

  background: linear-gradient(180deg, #fffdfa 0%, #fff4e6 100%);
  border: 1px solid rgba(44, 36, 22, 0.22);
  border-radius: 16px;
  box-shadow: 0 22px 50px rgba(44, 36, 22, 0.14);

  cursor: default;
  transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
}

.moment-frame img {
  width: 100%;
  aspect-ratio: 16 / 10;
  display: block;
  object-fit: cover;
  border-radius: 10px;

  background: var(--cream-dark);
  color: transparent;
  font-size: 0;

  transition: transform 380ms ease, filter 240ms ease;
}

.moment-frame figcaption {
  margin-top: 0.5rem;
  padding: 0 0.15rem;

  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--ink-faint);
  line-height: 1.35;

  transition: color 240ms ease;
}

.moment-frame:hover {
  transform: translateY(-5px);
  border-color: rgba(44, 36, 22, 0.36);
  box-shadow: 0 30px 66px rgba(44, 36, 22, 0.20);
}

.moment-frame:hover img {
  transform: scale(1.03);
  filter: saturate(1.06) contrast(1.05);
}

.moment-frame:hover figcaption {
  color: var(--ink-mid);
}


/* ============================================================================
   17. CHARACTERS — portrait cards
   ------------------------------------------------------------------------
   Musashi (character-1) is the protagonist, so it spans two grid columns
   to read as the lead card among supporting characters.
   ============================================================================ */

.character-name {
  margin: 0;
  overflow: hidden;

  background: linear-gradient(180deg, #fffdfa 0%, #fff8f0 100%);
  border: 1px solid rgba(127, 75, 47, 0.18);
  border-radius: 20px;
  box-shadow: 0 20px 46px rgba(44, 36, 22, 0.12);

  cursor: default;
  transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
}

.character-name img {
  width: 100%;
  aspect-ratio: 3 / 4;
  display: block;
  object-fit: cover;

  background: var(--cream-dark);
  color: transparent;
  font-size: 0;

  transition: transform 380ms ease, filter 240ms ease;
}

.character-name figcaption {
  padding: 0.7rem 0.8rem;

  background: linear-gradient(180deg, rgba(255, 252, 248, 0.94), rgba(250, 246, 239, 0.9));

  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 750;
  color: var(--ink);
  line-height: 1.25;

  transition: background 240ms ease, color 240ms ease;
}

.character-1 {
  grid-column: span 2;
}

.character-name:hover {
  transform: translateY(-5px) scale(1.01);
  border-color: rgba(184, 121, 78, 0.36);
  box-shadow: 0 28px 60px rgba(44, 36, 22, 0.18);
}

.character-name:hover img {
  transform: scale(1.03);
  filter: saturate(1.06) contrast(1.04);
}

.character-name:hover figcaption {
  color: var(--warm-brown-dark);
  background: linear-gradient(180deg, #fffdfa, rgba(226, 185, 143, 0.16));
}


/* ============================================================================
   18. NOTES — sticky notes
   ============================================================================ */

.note-card {
  position: relative;
  min-height: 130px;
  padding: 1.05rem;

  background: linear-gradient(180deg, #fffdfa 0%, #fff4e6 100%);
  border: 1px solid rgba(127, 75, 47, 0.18);
  border-radius: 15px;
  box-shadow: 0 18px 40px rgba(44, 36, 22, 0.10);

  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--ink-mid);
  cursor: default;

  transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease, color 240ms ease;
}

/* Small "tape mark" at the top — the sticky-note tell. */
.note-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 6px;
  border-radius: 0 0 999px 999px;
  background: rgba(184, 121, 78, 0.20);
  transition: background 240ms ease, height 240ms ease;
}

.note-card:hover {
  transform: translateY(-5px);
  color: var(--ink);
  border-color: rgba(184, 121, 78, 0.36);
  box-shadow: 0 26px 54px rgba(44, 36, 22, 0.16);
}

.note-card:hover::before {
  height: 8px;
  background: rgba(184, 121, 78, 0.28);
}


/* ============================================================================
   19. THOUGHTS — journal pages
   ------------------------------------------------------------------------
   The deepest evidence category, so it's calmer than the rest: bigger,
   more whitespace, softer hover, no rotation anywhere.
   ============================================================================ */

.thought-card {
  padding: 1.5rem 1.6rem;

  background: linear-gradient(180deg, #fffdfa 0%, #fff8f0 100%);
  border: 1px solid rgba(127, 75, 47, 0.18);
  border-radius: 24px;
  box-shadow: 0 22px 52px rgba(44, 36, 22, 0.12);

  font-family: var(--font-display);
  font-size: 1.08rem;
  line-height: 1.55;
  color: var(--ink-mid);
  cursor: default;

  transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease, color 260ms ease;
}

.thought-card:hover {
  transform: translateY(-4px);
  color: var(--ink);
  border-color: rgba(184, 121, 78, 0.32);
  box-shadow: 0 28px 60px rgba(44, 36, 22, 0.16);
}


/* ============================================================================
   20. RESPONSIVE — evidence + button tray
   ============================================================================ */

@media (max-width: 900px) {
  .character-cloud {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .character-1 {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .media-row-details {
    width: 100%;
    margin-top: 1rem;
    margin-left: 0;
    padding-top: 0.85rem;
    gap: 0.45rem;
  }

  .depth-button {
    flex: 1 1 calc(50% - 0.45rem);
    min-height: 40px;
    padding-inline: 0.75rem;
  }

  .falling-quotes,
  .moving-moments,
  .notes-cloud,
  .thoughts-cloud {
    grid-template-columns: 1fr;
  }

  .character-cloud {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .character-1 {
    grid-column: span 2;
  }

  /* touch devices don't hover — keep the resting state calm and legible,
     hover-only lifts are a bonus on devices that support them, not a
     requirement to read the content */
}


/* ============================================================================
   21. REDUCED MOTION — safety net for this pass's new motion
   ------------------------------------------------------------------------
   Turns off every transform-based hover added in this pass (row lift,
   perspective/rotateX, cover shine sweep, aura scale) while keeping the
   informational reveals (the "but why?" popover, aura visibility)
   working via an instant opacity change instead of an animated one —
   the content still becomes available on hover/focus, it just doesn't
   move to get there.
   ============================================================================ */

@media (prefers-reduced-motion: reduce) {
  .card-wrap::before,
  .scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before,
  .media-library-row,
  .media-library-row::before,
  .media-row-format span,
  .media-row-status span,
  .depth-button,
  .media-row-info h3,
  .media-row-info p,
  .media-row-cover,
  .media-row-cover::after,
  .media-row-score,
  .media-row-score::before,
  .media-row-score::after,
  .falling-quote,
  .moment-frame,
  .moment-frame img,
  .character-name,
  .character-name img,
  .note-card,
  .thought-card {
    transition: none !important;
  }

  .media-library-row:hover,
  .media-row-format span:hover,
  .media-row-status span:hover,
  .depth-button:hover,
  .media-library-row:hover .media-row-cover,
  .media-library-row .media-row-cover:hover,
  .falling-quote:hover,
  .moment-frame:hover,
  .character-name:hover,
  .note-card:hover,
  .thought-card:hover {
    transform: none !important;
  }

  .media-library-row:hover::before,
  .media-library-row .media-row-cover:hover::after {
    opacity: 0 !important; /* sheen/shine sweeps are pure motion — just skip them */
  }

  .media-row-score:hover::before,
  .media-row-score:focus-visible::before {
    transform: none;
  }
}
/* ============================================================================
   FINAL CORRECTION — FULL-HEIGHT COVER + LOCALIZED OBJECT GLOWS
   ------------------------------------------------------------------------
   This override fixes two issues:
   1) The cover now owns the full vertical space of the whole card, from near
      the top padding to near the bottom padding. The divider/details live only
      in the right column and never shrink/cut the cover.
   2) Section 2 no longer uses a heavy full-section tan wash. Warmth is mostly
      localized around the active card / quote objects, like Section 1.
   ============================================================================ */

#section-2-empty-shelf,
.section-empty-shelf {
  --section-2-row-width: 940px;
  --section-2-cover-width: 128px;
  --section-2-card-gap: 1.8rem;

  /* Keep the base calm and near-paper. The warmth should come from local
     glows around objects, not from tinting the entire section orange. */
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 250, 241, 0.78), transparent 36%),
    linear-gradient(180deg, #fbf6ee 0%, #faf1e7 42%, #fbf6ee 100%);
}

/* Remove the previous broad section wash. It was making the lower area look
   uniformly tan instead of warmly lit around the actual content. */
#section-2-empty-shelf::before,
.section-empty-shelf::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 8rem;
  width: min(980px, 72vw);
  height: 420px;
  z-index: 0;
  pointer-events: none;
  border-radius: 999px;
  background:
    radial-gradient(
      ellipse at center,
      rgba(166, 95, 42, 0.10) 0%,
      rgba(166, 95, 42, 0.055) 42%,
      transparent 72%
    );
  filter: blur(58px);
  opacity: 0.62;
  transform: translateX(-50%);
}

/* Keep the paper texture extremely subtle. */
#section-2-empty-shelf::after,
.section-empty-shelf::after {
  opacity: 0.10;
}

/* Local atmospheric warmth for every stage. This is the main fix for the
   bottom feeling flat: the glow follows the object group instead of coloring
   the entire background evenly. */
.scroll-stage::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -2;
  width: min(1020px, 78vw);
  height: min(520px, calc(100% + 230px));
  pointer-events: none;
  border-radius: 999px;
  background:
    radial-gradient(
      ellipse at 50% 52%,
      rgba(177, 99, 42, 0.16) 0%,
      rgba(177, 99, 42, 0.075) 40%,
      transparent 72%
    );
  filter: blur(60px);
  opacity: 0.78;
  transform: translate(-50%, -50%);
}

/* Extra localized warmth around evidence cards. This keeps quotes/moments from
   sitting on a dead flat background while avoiding a full-page tan wash. */
.falling-quotes,
.moving-moments,
.character-cloud,
.notes-cloud,
.thoughts-cloud {
  position: relative;
  isolation: isolate;
}

.falling-quotes::before,
.moving-moments::before,
.character-cloud::before,
.notes-cloud::before,
.thoughts-cloud::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -1;
  width: min(980px, 105%);
  height: calc(100% + 180px);
  pointer-events: none;
  border-radius: 999px;
  background:
    radial-gradient(
      ellipse at center,
      rgba(174, 99, 44, 0.14),
      rgba(174, 99, 44, 0.06) 44%,
      transparent 74%
    );
  filter: blur(54px);
  opacity: 0.82;
  transform: translate(-50%, -50%);
}

/* Card becomes a real two-column object:
   - left column: cover spanning every row
   - right columns: info/chips/score/details
   The cover is no longer trapped inside only the top row. */
.media-library-row {
  width: min(var(--section-2-row-width), 100%);
  min-height: 320px;
  padding: 30px;

  display: grid;
  grid-template-columns: var(--section-2-cover-width) minmax(0, 1fr) auto;
  grid-template-areas:
    "cover info    score"
    "cover chips   score"
    "cover details details";
  grid-template-rows: minmax(86px, 1fr) auto auto;
  column-gap: var(--section-2-card-gap);
  row-gap: 0.7rem;
  align-items: center;
}

.media-library-row:has(.media-row-details) {
  min-height: 350px;
}

/* Flatten the old inner grid so its children can be placed by the card grid.
   This is the key code issue: the old `.media-row-main` grid kept the cover
   inside a separate top-only area, so the details row could never share the
   same vertical cover column. */
.media-row-main {
  display: contents;
}

.media-row-cover,
.media-row-info,
.media-row-format,
.media-row-status,
.media-row-score,
.media-row-details {
  position: relative;
  z-index: 1;
}

.media-row-cover {
  grid-area: cover;
  align-self: stretch;
  justify-self: start;

  width: var(--section-2-cover-width);
  height: 100%;
  min-height: 270px;
  max-height: 295px;
  aspect-ratio: auto;

  border-radius: 18px;
}

.media-row-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-row-info {
  grid-area: info;
  align-self: end;
  padding-top: 0.15rem;
}

.media-row-format,
.media-row-status {
  grid-area: chips;
  align-self: start;
  margin-top: 0.68rem;
}

.media-row-status {
  margin-left: calc(0.7rem + 4.8rem);
}

.media-row-score {
  grid-area: score;
  grid-row: 1 / 3;
  align-self: center;
  justify-self: end;
}

/* Divider and saved layers are now truly right-column-only because the whole
   element lives in the `details` grid area, not offset with margins. */
.media-row-details {
  grid-area: details;
  width: 100%;
  margin: 1.15rem 0 0;
  padding-top: 1.15rem;
  border-top: 1px solid rgba(184, 121, 78, 0.15);
}

/* The card-only aura remains, but it is tucked to the object instead of being
   confused with the section background. */
.card-wrap::before,
.scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before {
  background: radial-gradient(
    ellipse at 50% 58%,
    rgba(194, 111, 47, 0.22),
    rgba(194, 111, 47, 0.09) 38%,
    transparent 72%
  );
  opacity: 0.7;
}

.card-wrap:hover::before,
.scroll-stage:not(:has(.card-wrap)):has(.media-library-row:hover)::before {
  background: radial-gradient(
    ellipse at 50% 58%,
    rgba(207, 121, 49, 0.32),
    rgba(207, 121, 49, 0.14) 40%,
    transparent 74%
  );
  opacity: 0.98;
}

/* Responsive: keep the same idea, but reduce the cover instead of changing
   the meaning of the layout. */
@media (max-width: 900px) {
  #section-2-empty-shelf,
  .section-empty-shelf {
    --section-2-cover-width: 116px;
    --section-2-card-gap: 1.35rem;
  }

  .media-library-row {
    grid-template-columns: var(--section-2-cover-width) minmax(0, 1fr) auto;
    min-height: 310px;
  }

  .media-library-row:has(.media-row-details) {
    min-height: 330px;
  }

  .media-row-cover {
    min-height: 242px;
    max-height: 272px;
  }

  .media-row-status {
    margin-left: calc(0.65rem + 4.65rem);
  }
}

@media (max-width: 640px) {
  .media-library-row {
    display: grid;
    grid-template-columns: 82px minmax(0, 1fr);
    grid-template-areas:
      "cover info"
      "cover chips"
      "score score"
      "details details";
    grid-template-rows: auto auto auto auto;
    min-height: auto;
    row-gap: 0.75rem;
  }

  .media-library-row:has(.media-row-details) {
    min-height: auto;
  }

  .media-row-cover {
    width: 82px;
    min-height: 124px;
    max-height: 150px;
    align-self: stretch;
  }

  .media-row-score {
    grid-area: score;
    grid-row: auto;
    justify-self: start;
    align-self: center;
    margin-top: 0.45rem;
  }

  .media-row-details {
    grid-area: details;
    width: 100%;
    margin: 0.75rem 0 0;
  }
}

/* ============================================================================
   FINAL OBJECT-LOCAL ATMOSPHERE FIX — NO FULL-SECTION TAN WASH
   ------------------------------------------------------------------------
   This is the final override for the issue shown in the screenshots:
   - The background must stay calm and paper-like.
   - Warmth must appear close to objects: the book card, quote cards,
     moments, characters, notes, and thoughts.
   - The cover must span from the card's top padding to its bottom padding,
     while the divider/details live only in the right content column.
   ============================================================================ */

#section-2-empty-shelf,
.section-empty-shelf {
  --section-2-row-width: 940px;
  --section-2-cover-width: 132px;
  --section-2-card-gap: 1.85rem;

  position: relative;
  overflow: hidden;

  /* Calm base only. Do not tint the whole section tan/orange. */
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 252, 246, 0.68), transparent 34%),
    linear-gradient(180deg, #fbf7f1 0%, #faf4ec 46%, #fbf7f1 100%) !important;
}

/* Remove the broad section glow. It was the main cause of the whole lower
   section becoming homogenous tan instead of warm only near objects. */
#section-2-empty-shelf::before,
.section-empty-shelf::before {
  content: none !important;
  display: none !important;
}

/* Keep only a barely visible paper grain. This adds texture without changing
   the perceived background color. */
#section-2-empty-shelf::after,
.section-empty-shelf::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(97, 58, 31, 0.035) 0.65px, transparent 0.65px);
  background-size: 4px 4px;
  opacity: 0.075 !important;
}

#section-2-empty-shelf > *,
.section-empty-shelf > * {
  position: relative;
  z-index: 1;
}

/* No generic stage glow. A glow on every .scroll-stage is too large and stacks
   vertically, which makes the whole scrolled area look like one flat warm wash. */
.scroll-stage::before {
  content: none !important;
  display: none !important;
}

/* The stage itself should be a neutral positioning container. */
.scroll-stage {
  position: relative;
  isolation: isolate;
}

/* -------------------------------------------------------------------------
   CARD-ONLY LOCAL AURA
   ------------------------------------------------------------------------- */

.card-wrap {
  position: relative;
  width: min(var(--section-2-row-width), 100%);
  margin-inline: auto;
  isolation: isolate;
  perspective: 1200px;
}

.card-wrap::before {
  content: "" !important;
  display: block !important;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -1;
  pointer-events: none;

  width: min(calc(100% + 96px), calc(var(--section-2-row-width) + 96px));
  height: calc(100% + 92px);
  border-radius: 52px;

  background:
    radial-gradient(
      ellipse at 50% 58%,
      rgba(194, 111, 47, 0.25),
      rgba(194, 111, 47, 0.105) 39%,
      transparent 72%
    );
  filter: blur(30px);
  opacity: 0.76;
  transform: translate(-50%, -50%) scale(1);

  transition:
    opacity 240ms ease,
    transform 240ms ease,
    background 240ms ease;
}

.card-wrap:hover::before {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.026);
  background:
    radial-gradient(
      ellipse at 50% 58%,
      rgba(207, 121, 49, 0.35),
      rgba(207, 121, 49, 0.155) 40%,
      transparent 74%
    );
}

/* Fallback when the markup does not include .card-wrap around a media row.
   This is still local to the card object, not the whole stage. */
.scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before {
  content: "" !important;
  display: block !important;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -1;
  pointer-events: none;

  width: min(calc(var(--section-2-row-width) + 96px), calc(100% + 96px));
  height: calc(100% + 92px);
  border-radius: 52px;
  background:
    radial-gradient(
      ellipse at 50% 58%,
      rgba(194, 111, 47, 0.24),
      rgba(194, 111, 47, 0.10) 39%,
      transparent 72%
    );
  filter: blur(30px);
  opacity: 0.74;
  transform: translate(-50%, -50%) scale(1);
  transition: opacity 240ms ease, transform 240ms ease, background 240ms ease;
}

.scroll-stage:not(:has(.card-wrap)):has(.media-library-row:hover)::before {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.026);
  background:
    radial-gradient(
      ellipse at 50% 58%,
      rgba(207, 121, 49, 0.34),
      rgba(207, 121, 49, 0.15) 40%,
      transparent 74%
    );
}

/* -------------------------------------------------------------------------
   FULL-HEIGHT COVER CARD GRID
   ------------------------------------------------------------------------- */

.media-library-row {
  width: min(var(--section-2-row-width), 100%);
  min-height: 348px;
  margin-inline: auto;
  padding: 28px;

  display: grid !important;
  grid-template-columns: var(--section-2-cover-width) minmax(0, 1fr) auto;
  grid-template-areas:
    "cover info    score"
    "cover chips   score"
    "cover details details";
  grid-template-rows: minmax(104px, 1fr) auto minmax(96px, auto);
  column-gap: var(--section-2-card-gap);
  row-gap: 0.72rem;
  align-items: stretch;

  background:
    linear-gradient(180deg, rgba(255, 253, 249, 0.97) 0%, rgba(255, 248, 238, 0.955) 100%);
  border: 1px solid rgba(184, 121, 78, 0.22);
  border-radius: 30px;
  box-shadow:
    0 30px 74px rgba(87, 49, 22, 0.13),
    0 11px 24px rgba(87, 49, 22, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.80);

  position: relative;
  overflow: hidden;
  transform: perspective(900px) translateZ(0);
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms ease,
    background 220ms ease,
    box-shadow 240ms ease;
}

.media-library-row:has(.media-row-details) {
  min-height: 348px !important;
}

/* Flatten old inner grid so all card children join the parent grid. */
.media-row-main {
  display: contents !important;
}

.media-row-cover,
.media-row-info,
.media-row-format,
.media-row-status,
.media-row-score,
.media-row-details {
  position: relative;
  z-index: 1;
}

/* This is the cover fix: the cover spans every grid row in the left column,
   from the top padding to the bottom padding. It is not controlled by the
   divider or by the saved-layer row anymore. */
.media-row-cover {
  grid-area: cover !important;
  align-self: stretch !important;
  justify-self: start;

  width: var(--section-2-cover-width) !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: none !important;
  aspect-ratio: auto !important;

  border-radius: 18px;
}

.media-row-cover img {
  width: 100% !important;
  height: 100% !important;
  display: block;
  object-fit: cover;
}

.media-row-info {
  grid-area: info !important;
  align-self: end;
  min-width: 0;
  padding-top: 0.25rem;
}

.media-row-format,
.media-row-status {
  grid-area: chips !important;
  align-self: start;
  margin-top: 0.65rem;
}

.media-row-status {
  margin-left: calc(0.72rem + 4.85rem);
}

.media-row-score {
  grid-area: score !important;
  grid-row: 1 / 3 !important;
  align-self: center;
  justify-self: end;
}

/* Divider + Saved Layers live only in the right content column. It never runs
   under the cover and never affects cover height. */
.media-row-details {
  grid-area: details !important;
  align-self: stretch;
  width: 100% !important;
  margin: 1rem 0 0 !important;
  padding-top: 1.05rem;
  border-top: 1px solid rgba(184, 121, 78, 0.15);

  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.55rem;
}

.media-row-details::before {
  flex-basis: 100%;
}

/* -------------------------------------------------------------------------
   EVIDENCE / OBJECT-LOCAL GLOWS
   ------------------------------------------------------------------------- */

.falling-quotes,
.moving-moments,
.character-cloud,
.notes-cloud,
.thoughts-cloud {
  position: relative;
  isolation: isolate;
}

/* Glow stays tight to each evidence group. It is wide enough to make the
   objects feel warm, but not tall/wide enough to recolor the whole section. */
.falling-quotes::before,
.moving-moments::before,
.character-cloud::before,
.notes-cloud::before,
.thoughts-cloud::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -1;
  width: min(calc(100% + 90px), calc(var(--section-2-row-width) + 90px));
  height: calc(100% + 110px);
  pointer-events: none;
  border-radius: 999px;
  background:
    radial-gradient(
      ellipse at center,
      rgba(174, 99, 44, 0.13),
      rgba(174, 99, 44, 0.052) 42%,
      transparent 72%
    );
  filter: blur(42px);
  opacity: 0.78;
  transform: translate(-50%, -50%);
}

/* Slight individual contact warmth so the glow feels attached to the objects,
   not painted on the page behind everything. */
.falling-quote,
.moment-frame,
.character-name,
.note-card,
.thought-card {
  box-shadow:
    0 20px 48px rgba(44, 36, 22, 0.105),
    0 4px 14px rgba(155, 90, 50, 0.055),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
}

.falling-quote:hover,
.moment-frame:hover,
.character-name:hover,
.note-card:hover,
.thought-card:hover {
  box-shadow:
    0 30px 64px rgba(44, 36, 22, 0.16),
    0 8px 22px rgba(155, 90, 50, 0.085),
    inset 0 1px 0 rgba(255, 255, 255, 0.70);
}

/* Keep the whole-card hover premium but not dramatic. */
.media-library-row:hover {
  transform: perspective(900px) rotateX(0.65deg) translateY(-6px);
  border-color: rgba(127, 75, 47, 0.34);
  background:
    linear-gradient(180deg, rgba(255, 254, 251, 0.99) 0%, rgba(255, 250, 241, 0.982) 100%);
  box-shadow:
    0 38px 92px rgba(87, 49, 22, 0.17),
    0 15px 32px rgba(87, 49, 22, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

/* -------------------------------------------------------------------------
   RESPONSIVE SAFETY
   ------------------------------------------------------------------------- */

@media (max-width: 900px) {
  #section-2-empty-shelf,
  .section-empty-shelf {
    --section-2-cover-width: 116px;
    --section-2-card-gap: 1.35rem;
  }

  .media-library-row {
    min-height: 326px;
    grid-template-columns: var(--section-2-cover-width) minmax(0, 1fr) auto;
    grid-template-rows: minmax(92px, 1fr) auto minmax(92px, auto);
  }

  .media-library-row:has(.media-row-details) {
    min-height: 326px !important;
  }

  .media-row-cover {
    width: var(--section-2-cover-width) !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: none !important;
  }

  .media-row-status {
    margin-left: calc(0.65rem + 4.65rem);
  }
}

@media (max-width: 640px) {
  .media-library-row {
    display: grid !important;
    grid-template-columns: 86px minmax(0, 1fr);
    grid-template-areas:
      "cover info"
      "cover chips"
      "score score"
      "details details";
    grid-template-rows: auto auto auto auto;
    min-height: auto !important;
    row-gap: 0.75rem;
  }

  .media-library-row:has(.media-row-details) {
    min-height: auto !important;
  }

  .media-row-cover {
    width: 86px !important;
    height: auto !important;
    min-height: 132px !important;
    max-height: 160px !important;
    align-self: stretch !important;
  }

  .media-row-score {
    grid-area: score !important;
    grid-row: auto !important;
    justify-self: start;
    align-self: center;
    margin-top: 0.45rem;
  }

  .media-row-details {
    grid-area: details !important;
    width: 100% !important;
    margin: 0.75rem 0 0 !important;
  }

  .card-wrap::before,
  .scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before,
  .falling-quotes::before,
  .moving-moments::before,
  .character-cloud::before,
  .notes-cloud::before,
  .thoughts-cloud::before {
    width: calc(100% + 42px);
    height: calc(100% + 56px);
    filter: blur(30px);
    opacity: 0.58;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-wrap::before,
  .scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before,
  .falling-quotes::before,
  .moving-moments::before,
  .character-cloud::before,
  .notes-cloud::before,
  .thoughts-cloud::before {
    transition: none !important;
  }
}

/* ============================================================================
   FINAL PASS — MANGA COVER PROPORTION + STRONGER OBJECT-LOCAL ATMOSPHERE
   ------------------------------------------------------------------------
   Fixes from latest review:
   1) The cover was vertically correct, but horizontally too narrow for a manga
      cover. A manga cover is usually close to a 2:3 portrait ratio, so if the
      card content height is around 300px, the cover width should be around
      190px, not 132px.
   2) The background warmth was correctly localized, but the glow radius and
      warmth were too weak. This keeps the page base calm while making warmth
      stronger only around actual objects: the book card, quote groups, moments,
      character/notes/thoughts groups.
   ============================================================================ */

#section-2-empty-shelf,
.section-empty-shelf {
  /* Wider card so the larger manga-proportion cover does not squeeze content. */
  --section-2-row-width: 1020px;
  --section-2-cover-width: 194px;
  --section-2-card-gap: 2.05rem;

  position: relative;
  overflow: hidden;

  /* Calm paper base only. The warmth comes from object glows below, not from a
     full-page tan/orange wash. */
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 252, 246, 0.58), transparent 28%),
    linear-gradient(180deg, #fbf8f3 0%, #faf5ee 46%, #fbf8f3 100%) !important;
}

/* Prevent section-level color wash from returning. */
#section-2-empty-shelf::before,
.section-empty-shelf::before,
.scroll-stage::before {
  content: none !important;
  display: none !important;
}

/* Keep paper texture extremely quiet, so it does not read as a full-color wash. */
#section-2-empty-shelf::after,
.section-empty-shelf::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(97, 58, 31, 0.03) 0.65px, transparent 0.65px);
  background-size: 4px 4px;
  opacity: 0.065 !important;
}

#section-2-empty-shelf > *,
.section-empty-shelf > * {
  position: relative;
  z-index: 1;
}

/* -------------------------------------------------------------------------
   Stronger, larger CARD-LOCAL glow.
   This should feel like the first hero card atmosphere: warm around the object,
   but not a uniform background color.
   ------------------------------------------------------------------------- */

.card-wrap {
  position: relative;
  width: min(var(--section-2-row-width), calc(100vw - 48px));
  margin-inline: auto;
  isolation: isolate;
  perspective: 1200px;
}

.card-wrap::before {
  content: "" !important;
  display: block !important;
  position: absolute;
  left: 50%;
  top: 54%;
  z-index: -2;
  pointer-events: none;

  width: min(calc(100% + 280px), calc(var(--section-2-row-width) + 280px));
  height: calc(100% + 250px);
  border-radius: 64px;

  background:
    radial-gradient(
      ellipse at 50% 56%,
      rgba(185, 92, 29, 0.36) 0%,
      rgba(205, 122, 48, 0.22) 34%,
      rgba(205, 122, 48, 0.095) 56%,
      transparent 78%
    );
  filter: blur(54px);
  opacity: 0.92;
  transform: translate(-50%, -50%) scale(1);
  transition:
    opacity 240ms ease,
    transform 240ms ease,
    background 240ms ease,
    filter 240ms ease;
}

/* Contact shadow directly beneath the card. This makes the card feel grounded
   without tinting the whole section. */
.card-wrap::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -62px;
  z-index: -1;
  pointer-events: none;
  width: min(88%, 880px);
  height: 132px;
  border-radius: 999px;
  background:
    radial-gradient(
      ellipse at center,
      rgba(83, 45, 19, 0.20),
      rgba(127, 70, 28, 0.105) 38%,
      transparent 72%
    );
  filter: blur(26px);
  opacity: 0.72;
  transform: translateX(-50%);
  transition: opacity 240ms ease, transform 240ms ease;
}

.card-wrap:hover::before {
  opacity: 1;
  filter: blur(58px);
  transform: translate(-50%, -50%) scale(1.035);
  background:
    radial-gradient(
      ellipse at 50% 56%,
      rgba(197, 96, 28, 0.46) 0%,
      rgba(221, 134, 51, 0.28) 35%,
      rgba(221, 134, 51, 0.12) 58%,
      transparent 80%
    );
}

.card-wrap:hover::after {
  opacity: 0.86;
  transform: translateX(-50%) scaleX(1.03);
}

/* Fallback only for markup where the media row is not wrapped by .card-wrap.
   This is object-sized, not stage-sized. */
.scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before {
  content: "" !important;
  display: block !important;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: -2;
  pointer-events: none;
  width: min(calc(var(--section-2-row-width) + 280px), calc(100% + 220px));
  height: 590px;
  border-radius: 64px;
  background:
    radial-gradient(
      ellipse at 50% 56%,
      rgba(185, 92, 29, 0.32),
      rgba(205, 122, 48, 0.19) 34%,
      rgba(205, 122, 48, 0.085) 56%,
      transparent 78%
    );
  filter: blur(54px);
  opacity: 0.86;
  transform: translate(-50%, -50%);
}

.scroll-stage:not(:has(.card-wrap)):has(.media-library-row:hover)::before {
  opacity: 1;
  background:
    radial-gradient(
      ellipse at 50% 56%,
      rgba(197, 96, 28, 0.42),
      rgba(221, 134, 51, 0.25) 35%,
      rgba(221, 134, 51, 0.11) 58%,
      transparent 80%
    );
}

/* -------------------------------------------------------------------------
   MANGA-PROPORTION FULL-HEIGHT COVER CARD GRID
   ------------------------------------------------------------------------- */

.media-library-row {
  width: min(var(--section-2-row-width), calc(100vw - 48px));
  min-height: 364px !important;
  margin-inline: auto;
  padding: 30px;

  display: grid !important;
  grid-template-columns: var(--section-2-cover-width) minmax(0, 1fr) auto;
  grid-template-areas:
    "cover info    score"
    "cover chips   score"
    "cover details details";

  /* Content height is about 304px after padding. With a 194px cover width,
     this gives a manga-like portrait ratio instead of the too-skinny 132px look. */
  grid-template-rows: minmax(126px, 1fr) auto minmax(104px, auto);
  column-gap: var(--section-2-card-gap);
  row-gap: 0.78rem;
  align-items: stretch;

  position: relative;
  isolation: isolate;
  overflow: hidden;

  border-radius: 32px;
  border: 1px solid rgba(184, 121, 78, 0.24);
  background:
    radial-gradient(circle at 18% 48%, rgba(226, 173, 111, 0.09), transparent 36%),
    linear-gradient(180deg, rgba(255, 253, 249, 0.985) 0%, rgba(255, 248, 238, 0.97) 100%);
  box-shadow:
    0 34px 86px rgba(87, 49, 22, 0.15),
    0 12px 26px rgba(87, 49, 22, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);

  transform: perspective(900px) translateZ(0);
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms ease,
    background 220ms ease,
    box-shadow 240ms ease;
}

.media-library-row:has(.media-row-details) {
  min-height: 364px !important;
}

/* Flatten the old internal row wrapper so the cover can span the full card,
   not just the top mini-row. */
.media-row-main {
  display: contents !important;
}

.media-row-cover,
.media-row-info,
.media-row-format,
.media-row-status,
.media-row-score,
.media-row-details {
  position: relative;
  z-index: 1;
}

/* Key cover fix: wider manga-cover proportion + full vertical span from near
   top border to near bottom border. The divider/details do not affect it. */
.media-row-cover {
  grid-area: cover !important;
  align-self: stretch !important;
  justify-self: start !important;

  width: var(--section-2-cover-width) !important;
  height: 100% !important;
  min-height: 292px !important;
  max-height: none !important;
  aspect-ratio: auto !important;

  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(145deg, #d7b999 0%, #ead5bd 55%, #cfae8c 100%);
  border: 1px solid rgba(126, 78, 45, 0.22);
  box-shadow:
    0 24px 42px rgba(72, 42, 21, 0.18),
    0 7px 16px rgba(72, 42, 21, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.50);
}

.media-row-cover img {
  width: 100% !important;
  height: 100% !important;
  display: block;
  object-fit: cover;
  object-position: center top;
}

.media-row-info {
  grid-area: info !important;
  align-self: end;
  min-width: 0;
  padding-top: 0.35rem;
}

.media-row-format,
.media-row-status {
  grid-area: chips !important;
  align-self: start;
  margin-top: 0.7rem;
}

.media-row-status {
  margin-left: calc(0.75rem + 4.95rem);
}

.media-row-score {
  grid-area: score !important;
  grid-row: 1 / 3 !important;
  align-self: center;
  justify-self: end;
}

/* Divider and Saved Layers stay only in the right column. */
.media-row-details {
  grid-area: details !important;
  align-self: stretch;
  width: 100% !important;
  margin: 1.08rem 0 0 !important;
  padding-top: 1.08rem;
  border-top: 1px solid rgba(184, 121, 78, 0.17);

  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.58rem;
}

.media-row-details::before {
  flex-basis: 100%;
}

.media-library-row:hover {
  transform: perspective(900px) rotateX(0.65deg) translateY(-6px);
  border-color: rgba(127, 75, 47, 0.38);
  background:
    radial-gradient(circle at 18% 48%, rgba(234, 177, 107, 0.13), transparent 38%),
    linear-gradient(180deg, rgba(255, 254, 251, 0.995) 0%, rgba(255, 250, 241, 0.986) 100%);
  box-shadow:
    0 44px 104px rgba(87, 49, 22, 0.19),
    0 16px 34px rgba(87, 49, 22, 0.115),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
}

/* -------------------------------------------------------------------------
   OBJECT-LOCAL GLOWS FOR QUOTES / MOMENTS / CHARACTERS / NOTES / THOUGHTS
   ------------------------------------------------------------------------- */

.falling-quotes,
.moving-moments,
.character-cloud,
.notes-cloud,
.thoughts-cloud {
  position: relative;
  isolation: isolate;
}

.falling-quotes::before,
.moving-moments::before,
.character-cloud::before,
.notes-cloud::before,
.thoughts-cloud::before {
  content: "" !important;
  display: block !important;
  position: absolute;
  left: 50%;
  top: 52%;
  z-index: -1;
  pointer-events: none;

  width: min(calc(100% + 260px), calc(var(--section-2-row-width) + 260px));
  height: calc(100% + 230px);
  border-radius: 999px;

  background:
    radial-gradient(
      ellipse at center,
      rgba(185, 97, 35, 0.24) 0%,
      rgba(214, 137, 61, 0.135) 40%,
      rgba(214, 137, 61, 0.06) 58%,
      transparent 78%
    );
  filter: blur(56px);
  opacity: 0.88;
  transform: translate(-50%, -50%);
}

/* Warmer local contact shadows on the actual objects. */
.falling-quote,
.moment-frame,
.character-name,
.note-card,
.thought-card {
  background-color: rgba(255, 251, 245, 0.94);
  border-color: rgba(184, 121, 78, 0.18);
  box-shadow:
    0 26px 58px rgba(62, 42, 22, 0.13),
    0 7px 18px rgba(155, 90, 50, 0.075),
    inset 0 1px 0 rgba(255, 255, 255, 0.66);
}

.falling-quote:hover,
.moment-frame:hover,
.character-name:hover,
.note-card:hover,
.thought-card:hover {
  box-shadow:
    0 34px 72px rgba(62, 42, 22, 0.18),
    0 10px 26px rgba(155, 90, 50, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

/* -------------------------------------------------------------------------
   RESPONSIVE COVER PROPORTIONS
   ------------------------------------------------------------------------- */

@media (max-width: 1050px) {
  #section-2-empty-shelf,
  .section-empty-shelf {
    --section-2-row-width: 940px;
    --section-2-cover-width: 176px;
    --section-2-card-gap: 1.65rem;
  }

  .media-library-row {
    min-height: 344px !important;
    grid-template-rows: minmax(116px, 1fr) auto minmax(98px, auto);
  }

  .media-library-row:has(.media-row-details) {
    min-height: 344px !important;
  }

  .media-row-cover {
    min-height: 276px !important;
  }
}

@media (max-width: 760px) {
  #section-2-empty-shelf,
  .section-empty-shelf {
    --section-2-cover-width: 118px;
    --section-2-card-gap: 1rem;
  }

  .media-library-row {
    width: min(100%, calc(100vw - 32px));
    min-height: auto !important;
    padding: 22px;
    grid-template-columns: var(--section-2-cover-width) minmax(0, 1fr);
    grid-template-areas:
      "cover info"
      "cover chips"
      "score score"
      "details details";
    grid-template-rows: auto auto auto auto;
  }

  .media-row-cover {
    width: var(--section-2-cover-width) !important;
    min-height: 178px !important;
    height: auto !important;
    align-self: stretch !important;
  }

  .media-row-score {
    grid-area: score !important;
    grid-row: auto !important;
    justify-self: start;
    align-self: center;
    margin-top: 0.35rem;
  }

  .media-row-details {
    grid-area: details !important;
    margin-top: 0.8rem !important;
  }

  .card-wrap::before,
  .scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before,
  .falling-quotes::before,
  .moving-moments::before,
  .character-cloud::before,
  .notes-cloud::before,
  .thoughts-cloud::before {
    width: calc(100% + 78px);
    height: calc(100% + 92px);
    filter: blur(36px);
    opacity: 0.74;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-wrap::before,
  .card-wrap::after,
  .scroll-stage:not(:has(.card-wrap)):has(.media-library-row)::before,
  .falling-quotes::before,
  .moving-moments::before,
  .character-cloud::before,
  .notes-cloud::before,
  .thoughts-cloud::before,
  .media-library-row {
    transition: none !important;
  }

  .media-library-row:hover {
    transform: none !important;
  }
}
