    <!-- Section 2 Product -->
    <section id="section-2-empty-shelf" class="section section-empty-shelf" aria-labelledby="section-2-title">
    <!--
    ============================================================
    SECTION 2 — "A rating tells you nothing." (Empty Shelf / Memory Depth)
    ------------------------------------------------------------
    WHAT CHANGED FROM YOUR ORIGINAL MARKUP
    - Added data-rotate / data-xpercent / data-scale attributes to
        every evidence card (quote, moment, character, note, thought).
        section-2.js reads these to animate rotation/centering with
        GSAP. We do this instead of leaving rotation in CSS because
        once GSAP touches an element's `transform`, it owns the whole
        property — mixing "CSS sets the resting rotate" with "JS
        animates the entrance" causes the two to fight. Baking the
        target rotation into a data attribute means BOTH the no-JS
        CSS fallback and the JS animation can read the same source
        of truth.
    - Added a visually-hidden live region (#section-2-status) so
        screen-reader users get a one-line announcement of which
        evidence type is active, instead of silence during the
        scroll story.
    - Added aria-hidden="true" as the DEFAULT state on every stage
        except the first. JS flips this as stages activate. This
        means if JS fails to load, screen readers still only see
        ONE row (whichever stage you decide is the default — we use
        the finished row, see CSS fallback), not 11 duplicate rows.
    - No structural HTML was removed. Your copy, images, and
        button labels are untouched.
    ============================================================
    -->


        <!-- Section Title -->
        <header class="section-2-header">
            <span class="section-label">Beyond the score</span>
            <h2 id="section-2-title">A rating tells you nothing.</h2>
            <p>A number can show how much you liked something. Inkwell helps you remember why.</p>
        </header>

        <!-- Screen-reader-only status announcer. JS updates this text as the
            story moves between evidence types. Visually hidden via CSS
            (.sr-only), never removed from the DOM. -->
        <p id="section-2-status" class="sr-only" role="status" aria-live="polite"></p>

        <!-- Scroll Animation Wrapper -->
        <div class="empty-shelf-scroll">

            <!-- STAGE 1: Basic empty row appears — just a title, score, nothing else -->
            <div class="scroll-stage stage-basic-row" data-stage="basic-row" aria-hidden="false">
                <article class="media-library-row media-library-row-empty">
                    <div class="media-row-main">
                        <div class="media-row-cover">
                            <img src="assets/vagabond-cover.jpg" alt="Vagabond manga cover">
                        </div>
                        <div class="media-row-info">
                            <h3>Vagabond</h3>
                            <p>Takehiko Inoue</p>
                        </div>
                        <div class="media-row-format"><span>Manga</span></div>
                        <div class="media-row-status"><span>Completed</span></div>
                        <div class="media-row-score"><span>9/10</span></div>
                    </div>
                    <!-- No buttons yet — this is what everyone else gives you -->
                </article>
            </div>

            <!-- STAGE 2: Row vanishes — quotes fall down the screen -->
            <div class="scroll-stage stage-quotes-fall" data-stage="quotes-fall" aria-hidden="true">
                <div class="falling-quotes">
                    <blockquote class="falling-quote quote-1" data-rotate="-5">
                        "You have no enemies. No one has the right to hurt another."
                    </blockquote>
                    <blockquote class="falling-quote quote-2" data-rotate="4">
                        "The only thing a man can do for another is to kill him or save him."
                    </blockquote>
                    <blockquote class="falling-quote quote-3" data-rotate="-2">
                        "There is no path. The path is made by walking."
                    </blockquote>
                    <blockquote class="falling-quote quote-4" data-rotate="2">
                        "Strength is not something you have. It is something you find."
                    </blockquote>
                </div>
            </div>

            <!-- STAGE 3: Row returns — Quotes button animates in, lands into row -->
            <div class="scroll-stage stage-row-with-quotes" data-stage="row-with-quotes" aria-hidden="true">
                <article class="media-library-row media-library-row-expanded">
                    <div class="media-row-main">
                        <div class="media-row-cover">
                            <img src="assets/vagabond-cover.jpg" alt="Vagabond manga cover">
                        </div>
                        <div class="media-row-info">
                            <h3>Vagabond</h3>
                            <p>Takehiko Inoue</p>
                        </div>
                        <div class="media-row-format"><span>Manga</span></div>
                        <div class="media-row-status"><span>Completed</span></div>
                        <div class="media-row-score"><span>9/10</span></div>
                    </div>
                    <div class="media-row-details" aria-label="Saved details for Vagabond">
                        <!-- NEW this stage — falls in from above matching the quotes animation -->
                        <button type="button" class="depth-button depth-button-new depth-button-quotes">
                            Quotes
                        </button>
                    </div>
                </article>
            </div>

            <!-- STAGE 4: Row vanishes — moments/panels fly across the screen -->
            <div class="scroll-stage stage-moments-move" data-stage="moments-move" aria-hidden="true">
                <div class="moving-moments">
                    <figure class="moment-frame moment-frame-1" data-rotate="-1" data-xpercent="-50">
                        <img src="assets/vagabond-moment-1.jpg" alt="Saved Vagabond moment">
                        <figcaption>The duel in the rain.</figcaption>
                    </figure>
                    <figure class="moment-frame moment-frame-2" data-rotate="4">
                        <img src="assets/vagabond-moment-2.jpg" alt="Saved Vagabond moment">
                        <figcaption>Musashi alone in the forest.</figcaption>
                    </figure>
                    <figure class="moment-frame moment-frame-3" data-rotate="-4">
                        <img src="assets/vagabond-moment-3.jpg" alt="Saved Vagabond moment">
                        <figcaption>The final page of volume 22.</figcaption>
                    </figure>
                </div>
            </div>

            <!-- STAGE 5: Row returns — Moments button animates in, Quotes sits still -->
            <div class="scroll-stage stage-row-with-moment" data-stage="row-with-moment" aria-hidden="true">
                <article class="media-library-row media-library-row-expanded">
                    <div class="media-row-main">
                        <div class="media-row-cover">
                            <img src="assets/vagabond-cover.jpg" alt="Vagabond manga cover">
                        </div>
                        <div class="media-row-info">
                            <h3>Vagabond</h3>
                            <p>Takehiko Inoue</p>
                        </div>
                        <div class="media-row-format"><span>Manga</span></div>
                        <div class="media-row-status"><span>Completed</span></div>
                        <div class="media-row-score"><span>9/10</span></div>
                    </div>
                    <div class="media-row-details" aria-label="Saved details for Vagabond">
                        <!-- STATIC — already existed, no animation -->
                        <button type="button" class="depth-button depth-button-static depth-button-quotes">
                            Quotes
                        </button>
                        <!-- NEW this stage — flies in from the side matching moments animation -->
                        <button type="button" class="depth-button depth-button-new depth-button-moment">
                            Moments
                        </button>
                    </div>
                </article>
            </div>

            <!-- STAGE 6: Row vanishes — characters float up onto screen -->
            <div class="scroll-stage stage-characters-appear" data-stage="characters-appear" aria-hidden="true">
                <div class="character-cloud">
                    <figure class="character-name character-1" data-rotate="0" data-xpercent="-50">
                        <img src="img/Musashi Miyamoto.jpg" alt="Musashi Miyamoto">
                        <figcaption>Musashi Miyamoto</figcaption>
                    </figure>
                    <figure class="character-name character-2" data-rotate="-5">
                        <img src="img/Kojiro Sasaki.jpg" alt="Kojiro Sasaki">
                        <figcaption>Kojiro Sasaki</figcaption>
                    </figure>
                    <figure class="character-name character-3" data-rotate="5">
                        <img src="img/Otsu.jpg" alt="Otsu">
                        <figcaption>Otsu</figcaption>
                    </figure>
                    <figure class="character-name character-4" data-rotate="4">
                        <img src="img/Matahachi Honiden.jpg" alt="Matahachi Honiden">
                        <figcaption>Matahachi Honiden</figcaption>
                    </figure>
                    <figure class="character-name character-5" data-rotate="-4">
                        <img src="img/Takuan Soho.jpg" alt="Takuan Soho">
                        <figcaption>Takuan Soho</figcaption>
                    </figure>
                    <figure class="character-name character-6" data-rotate="-2">
                        <img src="img/Seijuro Yoshioka.jpg" alt="Seijuro Yoshioka">
                        <figcaption>Seijuro Yoshioka</figcaption>
                    </figure>
                    <figure class="character-name character-7" data-rotate="2">
                        <img src="img/Denshichiro Yoshioka.jpg" alt="Denshichiro Yoshioka">
                        <figcaption>Denshichiro Yoshioka</figcaption>
                    </figure>
                </div>
            </div>

            <!-- STAGE 7: Row returns — Characters button animates in, others sit still -->
            <div class="scroll-stage stage-row-with-character" data-stage="row-with-character" aria-hidden="true">
                <article class="media-library-row media-library-row-expanded">
                    <div class="media-row-main">
                        <div class="media-row-cover">
                            <img src="assets/vagabond-cover.jpg" alt="Vagabond manga cover">
                        </div>
                        <div class="media-row-info">
                            <h3>Vagabond</h3>
                            <p>Takehiko Inoue</p>
                        </div>
                        <div class="media-row-format"><span>Manga</span></div>
                        <div class="media-row-status"><span>Completed</span></div>
                        <div class="media-row-score"><span>9/10</span></div>
                    </div>
                    <div class="media-row-details" aria-label="Saved details for Vagabond">
                        <!-- STATIC — already existed -->
                        <button type="button" class="depth-button depth-button-static depth-button-quotes">
                            Quotes
                        </button>
                        <!-- STATIC — already existed -->
                        <button type="button" class="depth-button depth-button-static depth-button-moment">
                            Moments
                        </button>
                        <!-- NEW this stage — floats up from below matching characters animation -->
                        <button type="button" class="depth-button depth-button-new depth-button-character">
                            Characters
                        </button>
                    </div>
                </article>
            </div>

            <!-- STAGE 8: Row vanishes — notes drift across like scattered sticky notes -->
            <div class="scroll-stage stage-notes-appear" data-stage="notes-appear" aria-hidden="true">
                <div class="notes-cloud">
                    <p class="note-card note-1" data-rotate="-5">
                        Chapter 3 — the pacing here slows down intentionally. Inoue is making you sit with Musashi.
                    </p>
                    <p class="note-card note-2" data-rotate="4">
                        Why does Kojiro feel more at peace than Musashi even though he can't hear?
                    </p>
                    <p class="note-card note-3" data-rotate="-2">
                        Volume 10 — the fight choreography is unlike anything. No words needed.
                    </p>
                </div>
            </div>

            <!-- STAGE 9: Row returns — Notes button animates in, others sit still -->
            <div class="scroll-stage stage-row-with-notes" data-stage="row-with-notes" aria-hidden="true">
                <article class="media-library-row media-library-row-expanded">
                    <div class="media-row-main">
                        <div class="media-row-cover">
                            <img src="assets/vagabond-cover.jpg" alt="Vagabond manga cover">
                        </div>
                        <div class="media-row-info">
                            <h3>Vagabond</h3>
                            <p>Takehiko Inoue</p>
                        </div>
                        <div class="media-row-format"><span>Manga</span></div>
                        <div class="media-row-status"><span>Completed</span></div>
                        <div class="media-row-score"><span>9/10</span></div>
                    </div>
                    <div class="media-row-details" aria-label="Saved details for Vagabond">
                        <!-- STATIC — already existed -->
                        <button type="button" class="depth-button depth-button-static depth-button-quotes">
                            Quotes
                        </button>
                        <!-- STATIC — already existed -->
                        <button type="button" class="depth-button depth-button-static depth-button-moment">
                            Moments
                        </button>
                        <!-- STATIC — already existed -->
                        <button type="button" class="depth-button depth-button-static depth-button-character">
                            Characters
                        </button>
                        <!-- NEW this stage — drifts in like a sticky note -->
                        <button type="button" class="depth-button depth-button-new depth-button-notes">
                            Notes
                        </button>
                    </div>
                </article>
            </div>

            <!-- STAGE 10: Row vanishes — deep thoughts appear, long and personal, typed out -->
            <div class="scroll-stage stage-thoughts-appear" data-stage="thoughts-appear" aria-hidden="true">
                <div class="thoughts-cloud">
                    <p class="thought-card thought-1" data-rotate="0" data-xpercent="-50">
                        Vagabond made me realise I had been confusing movement with progress. Musashi spends decades chasing strength and only finds peace when he stops defining himself by it. I've been doing the same thing in a different way.
                    </p>
                    <p class="thought-card thought-2" data-rotate="2" data-xpercent="-50" data-scale="0.94">
                        The contrast between Musashi and Kojiro broke me. One man obsessed with becoming the strongest. Another who was born deaf, never chose the sword, and somehow became just as formidable — maybe more. Inoue is asking something uncomfortable. What are you really chasing and why.
                    </p>
                </div>
            </div>

            <!-- STAGE 11: Final row — all 5 buttons, Thoughts animates in last -->
            <div class="scroll-stage stage-final-row" data-stage="final-row" aria-hidden="true">
                <article class="media-library-row media-library-row-expanded media-library-row-complete">
                    <div class="media-row-main">
                        <div class="media-row-cover">
                            <img src="assets/vagabond-cover.jpg" alt="Vagabond manga cover">
                        </div>
                        <div class="media-row-info">
                            <h3>Vagabond</h3>
                            <p>Takehiko Inoue</p>
                        </div>
                        <div class="media-row-format"><span>Manga</span></div>
                        <div class="media-row-status"><span>Completed</span></div>
                        <div class="media-row-score"><span>9/10</span></div>
                    </div>
                    <div class="media-row-details" aria-label="Saved details for Vagabond">
                        <!-- STATIC — all already existed -->
                        <button type="button" class="depth-button depth-button-static depth-button-quotes">
                            Quotes
                        </button>
                        <button type="button" class="depth-button depth-button-static depth-button-moment">
                            Moments
                        </button>
                        <button type="button" class="depth-button depth-button-static depth-button-character">
                            Characters
                        </button>
                        <button type="button" class="depth-button depth-button-static depth-button-notes">
                            Notes
                        </button>
                        <!-- NEW this stage — fades in slowly, the deepest and last -->
                        <button type="button" class="depth-button depth-button-new depth-button-thoughts">
                            Thoughts
                        </button>
                    </div>
                </article>
            </div>

        </div>

    </section>
























































    
    <!-- Section 2 Product -->
    <section id="section-2-empty-shelf" class="section section-empty-shelf" aria-labelledby="section-2-title">

        <!-- Section Title -->
        <header class="section-2-header">
            <span class="section-label">Beyond the score</span>
            <h2 id="section-2-title">A rating tells you nothing.</h2>
            <p>A number can show how much you liked something. Inkwell helps you remember why.</p>
        </header>

        <!-- Screen-reader-only status announcer, updated by section-2.js as the
            story moves between evidence types. Visually hidden (.sr-only). -->
        <p id="section-2-status" class="sr-only" role="status" aria-live="polite"></p>

        <div class="empty-shelf-scroll">
            <div class="stage-viewport">

                <!-- THE PERSISTENT CARD — always present, never swapped out.
                    Wrapped in .card-wrap so the warm aura (section-2.css §4)
                    is scoped to just this object, not the whole background. -->
                <div class="card-wrap">
                    <article class="media-library-row" aria-label="Vagabond — saved to your library">
                        <div class="media-row-cover">
                            <img src="assets/vagabond-cover.jpg" alt="Vagabond manga cover">
                        </div>

                        <div class="media-row-info">
                            <h3>Vagabond</h3>
                            <p>Takehiko Inoue</p>
                        </div>

                        <div class="media-row-format"><span>Manga</span></div>
                        <div class="media-row-status"><span>Completed</span></div>
                        <div class="media-row-score"><span>9/10</span></div>

                        <!-- Reserved space, invisible until the first button lands
                            (section-2.js adds .is-visible to this container the
                            moment .depth-button-quotes gets .is-landed). -->
                        <div class="media-row-details" aria-label="Saved details for Vagabond">
                            <button type="button" class="depth-button depth-button-quotes">Quotes</button>
                            <button type="button" class="depth-button depth-button-moment">Moments</button>
                            <button type="button" class="depth-button depth-button-character">Characters</button>
                            <button type="button" class="depth-button depth-button-notes">Notes</button>
                            <button type="button" class="depth-button depth-button-thoughts">Thoughts</button>
                        </div>
                    </article>
                </div>

                <!-- EVIDENCE SCENE 1 — Quotes -->
                <div class="scroll-stage" data-stage="quotes-fall" aria-hidden="true">
                    <div class="falling-quotes">
                        <blockquote class="falling-quote quote-1" data-rotate="-5">
                            "You have no enemies. No one has the right to hurt another."
                        </blockquote>
                        <blockquote class="falling-quote quote-2" data-rotate="4">
                            "The only thing a man can do for another is to kill him or save him."
                        </blockquote>
                        <blockquote class="falling-quote quote-3" data-rotate="-2">
                            "There is no path. The path is made by walking."
                        </blockquote>
                        <blockquote class="falling-quote quote-4" data-rotate="2">
                            "Strength is not something you have. It is something you find."
                        </blockquote>
                    </div>
                </div>

                <!-- EVIDENCE SCENE 2 — Moments -->
                <div class="scroll-stage" data-stage="moments-move" aria-hidden="true">
                    <div class="moving-moments">
                        <figure class="moment-frame moment-frame-1" data-rotate="-1">
                            <img src="assets/vagabond-moment-1.jpg" alt="Saved Vagabond moment">
                            <figcaption>The duel in the rain.</figcaption>
                        </figure>
                        <figure class="moment-frame moment-frame-2" data-rotate="4">
                            <img src="assets/vagabond-moment-2.jpg" alt="Saved Vagabond moment">
                            <figcaption>Musashi alone in the forest.</figcaption>
                        </figure>
                        <figure class="moment-frame moment-frame-3" data-rotate="-4">
                            <img src="assets/vagabond-moment-3.jpg" alt="Saved Vagabond moment">
                            <figcaption>The final page of volume 22.</figcaption>
                        </figure>
                    </div>
                </div>

                <!-- EVIDENCE SCENE 3 — Characters -->
                <div class="scroll-stage" data-stage="characters-appear" aria-hidden="true">
                    <div class="character-cloud">
                        <figure class="character-name character-1" data-rotate="0">
                            <img src="img/Musashi Miyamoto.jpg" alt="Musashi Miyamoto">
                            <figcaption>Musashi Miyamoto</figcaption>
                        </figure>
                        <figure class="character-name character-2" data-rotate="-5">
                            <img src="img/Kojiro Sasaki.jpg" alt="Kojiro Sasaki">
                            <figcaption>Kojiro Sasaki</figcaption>
                        </figure>
                        <figure class="character-name character-3" data-rotate="5">
                            <img src="img/Otsu.jpg" alt="Otsu">
                            <figcaption>Otsu</figcaption>
                        </figure>
                        <figure class="character-name character-4" data-rotate="4">
                            <img src="img/Matahachi Honiden.jpg" alt="Matahachi Honiden">
                            <figcaption>Matahachi Honiden</figcaption>
                        </figure>
                        <figure class="character-name character-5" data-rotate="-4">
                            <img src="img/Takuan Soho.jpg" alt="Takuan Soho">
                            <figcaption>Takuan Soho</figcaption>
                        </figure>
                        <figure class="character-name character-6" data-rotate="-2">
                            <img src="img/Seijuro Yoshioka.jpg" alt="Seijuro Yoshioka">
                            <figcaption>Seijuro Yoshioka</figcaption>
                        </figure>
                        <figure class="character-name character-7" data-rotate="2">
                            <img src="img/Denshichiro Yoshioka.jpg" alt="Denshichiro Yoshioka">
                            <figcaption>Denshichiro Yoshioka</figcaption>
                        </figure>
                    </div>
                </div>

                <!-- EVIDENCE SCENE 4 — Notes -->
                <div class="scroll-stage" data-stage="notes-appear" aria-hidden="true">
                    <div class="notes-cloud">
                        <p class="note-card note-1" data-rotate="-5">
                            Chapter 3 — the pacing here slows down intentionally. Inoue is making you sit with Musashi.
                        </p>
                        <p class="note-card note-2" data-rotate="4">
                            Why does Kojiro feel more at peace than Musashi even though he can't hear?
                        </p>
                        <p class="note-card note-3" data-rotate="-2">
                            Volume 10 — the fight choreography is unlike anything. No words needed.
                        </p>
                    </div>
                </div>

                <!-- EVIDENCE SCENE 5 — Thoughts -->
                <div class="scroll-stage" data-stage="thoughts-appear" aria-hidden="true">
                    <div class="thoughts-cloud">
                        <p class="thought-card thought-1" data-rotate="0">
                            Vagabond made me realise I had been confusing movement with progress. Musashi spends decades chasing strength and only finds peace when he stops defining himself by it. I've been doing the same thing in a different way.
                        </p>
                        <p class="thought-card thought-2" data-rotate="2" data-scale="0.9">
                            The contrast between Musashi and Kojiro broke me. One man obsessed with becoming the strongest. Another who was born deaf, never chose the sword, and somehow became just as formidable — maybe more. Inoue is asking something uncomfortable. What are you really chasing and why.
                        </p>
                    </div>
                </div>

            </div>
        </div>

    </section>