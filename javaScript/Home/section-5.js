/* ============================================================================
   INKWELL — SECTION 5: SOCIAL, ON YOUR TERMS (V10 PRODUCT STORY)

   Homepage product story:
   1. Control — audience, spoilers, and a stable live preview.
   2. Identity — a real profile with Top Stories, custom rankings, stats,
      biography, tags, and recent activity.
   3. Social — Following, For You, and Search; open a reader profile, then
      open one story and inspect its saved layers.

   Integration:
   - replaces only the Section 5 JavaScript file
   - uses the existing Section 5 HTML root and rebuilds Acts 2 and 3 at runtime
   - publishes the same InkwellSection5Journey API expected by homeScroll.js
   - the scroll timeline demonstrates state until the user interacts; after that,
     the touched subsystem is user-owned and scrolling cannot overwrite it
   ============================================================================ */

(() => {
  "use strict";

  const section = document.querySelector("#section-5-social");
  if (!section || window.__INKWELL_SOCIAL_V10_STARTED__) return;

  window.__INKWELL_SOCIAL_V10_STARTED__ = true;
  window.__INKWELL_SOCIAL_CINEMA_BUILD__ =
    "2026-07-25-social-cinema-v10-product-story";

  const { gsap, ScrollTrigger } = window;
  const MANAGED_BY_HOME_JOURNEY =
    window.__INKWELL_MASTER_JOURNEY__ === true;
  const DESKTOP_QUERY =
    "(min-width: 1100px) and (min-height: 700px) and " +
    "(prefers-reduced-motion: no-preference)";
  const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const SUPABASE_URL = "https://hsruxfpslxguhwnccwuj.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD";
  const TABLE_NAME = "manga";
  const BUCKET_NAME = "img";
  const COVER_FOLDER = "covers";

  const OPENING_READY_TIME = 0.92;
  const STANDALONE_SCRUB_SECONDS = 0.64;
  const ACT_TIMES = Object.freeze({
    control: 0,
    identityTransition: 3.35,
    identity: 4.18,
    socialTransition: 6.72,
    social: 7.48,
    end: 12.2,
  });

  const DEMO_THRESHOLDS = Object.freeze({
    followersEnter: 1.38,
    followersLeave: 1.16,
    publicEnter: 2.03,
    publicLeave: 1.78,
    spoilerEnter: 2.67,
    spoilerLeave: 2.4,
    forYouEnter: 8.38,
    forYouLeave: 8.08,
    searchEnter: 9.22,
    searchLeave: 8.9,
    profileEnter: 10.02,
    profileLeave: 9.7,
    storyEnter: 10.95,
    storyLeave: 10.62,
  });

  const TOKYO_GHOUL_RE_ALIASES = [
    "tokyo ghoul re",
    "tokyo ghoul:re",
    "tokyo ghoul re manga",
  ];

  const PREFERRED_STORY_TITLES = [
    "Tokyo Ghoul:re",
    "Monster",
    "Vinland Saga",
    "Goodnight Punpun",
    "Berserk",
    "20th Century Boys",
    "Fullmetal Alchemist",
    "Death Note",
    "Pluto",
    "Hunter x Hunter",
  ];

  const FALLBACK_STORIES = [
    { id: "fallback-tokyo-ghoul-re", title: "Tokyo Ghoul:re", creator: "Sui Ishida", coverUrl: "" },
    { id: "fallback-monster", title: "Monster", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-vinland", title: "Vinland Saga", creator: "Makoto Yukimura", coverUrl: "" },
    { id: "fallback-punpun", title: "Goodnight Punpun", creator: "Inio Asano", coverUrl: "" },
    { id: "fallback-berserk", title: "Berserk", creator: "Kentaro Miura", coverUrl: "" },
    { id: "fallback-20cb", title: "20th Century Boys", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-fma", title: "Fullmetal Alchemist", creator: "Hiromu Arakawa", coverUrl: "" },
    { id: "fallback-death-note", title: "Death Note", creator: "Tsugumi Ohba", coverUrl: "" },
    { id: "fallback-pluto", title: "Pluto", creator: "Naoki Urasawa", coverUrl: "" },
  ];

  const PROFILE_DATA = Object.freeze({
    nova: {
      initial: "N",
      name: "nova.pages",
      label: "Your profile",
      bio: "Tracks identity, responsibility, and the truths that change with perspective.",
      tags: ["Psychological", "Character studies", "Identity", "Manga"],
      stats: [
        ["42", "stories"],
        ["18", "public reflections"],
        ["126", "following"],
      ],
      topStories: ["Tokyo Ghoul:re", "Monster", "Vinland Saga", "Goodnight Punpun"],
      categories: [
        { title: "Favourite main characters", items: ["Ken Kaneki", "Kenzo Tenma", "Thorfinn"] },
        { title: "Favourite supporting cast", items: ["Touka Kirishima", "Wolfgang Grimmer", "Askeladd"] },
        { title: "Themes that define me", items: ["Identity", "Responsibility", "Memory"] },
      ],
      activity: [
        { type: "Ranking", title: "Favourite main characters", detail: "Moved Ken Kaneki to #1", time: "Now" },
        { type: "Reflection", title: "Tokyo Ghoul:re", detail: "Published with spoiler protection", time: "2d" },
      ],
    },
    kai: {
      initial: "K",
      name: "kai.reads",
      label: "Character-first reader",
      bio: "Remembers the feeling before the theory.",
      tags: ["Character studies", "Moral choices", "Identity"],
      topStories: ["Tokyo Ghoul:re", "Fullmetal Alchemist", "20th Century Boys", "Monster"],
      signature: "Favourite protagonists",
      signatureItems: ["Ken Kaneki", "Edward Elric", "Kenji Endo"],
      match: "You both rank Tokyo Ghoul:re highly and write about identity, sacrifice, and difficult choices.",
      difference: "Kai writes from a character-first perspective; your notes focus more on responsibility and systems.",
      sharedThemes: ["Identity", "Sacrifice", "Choice"],
      activity: [
        { type: "Quote", title: "Fullmetal Alchemist", detail: "Saved a line about equivalent exchange", time: "1h" },
        { type: "Ranking", title: "Favourite protagonists", detail: "Added Ken Kaneki at #1", time: "1d" },
      ],
    },
    mira: {
      initial: "M",
      name: "mira.frames",
      label: "Visual-story reader",
      bio: "Collects quiet scenes, visual rhythm, and endings that refuse closure.",
      tags: ["Visual storytelling", "Memory", "Grief"],
      topStories: ["Goodnight Punpun", "Monster", "Vinland Saga", "Berserk"],
      signature: "Unforgettable scenes",
      signatureItems: ["Silent reunions", "Broken skylines", "Final-page echoes"],
      match: "You both save visual moments where memory and grief say more than dialogue.",
      difference: "Mira publishes short scene notes; your profile leans toward long-form reflection and rankings.",
      sharedThemes: ["Memory", "Grief", "Perspective"],
      activity: [
        { type: "Moment", title: "Goodnight Punpun", detail: "Added a new visual note", time: "3h" },
        { type: "Category", title: "Unforgettable scenes", detail: "Created a new showcase", time: "3d" },
      ],
    },
    ren: {
      initial: "R",
      name: "ren.afterwords",
      label: "Ideas-first reader",
      bio: "Writes long reflections about history, responsibility, and inherited conflict.",
      tags: ["History", "Responsibility", "Long-form"],
      topStories: ["Monster", "20th Century Boys", "Tokyo Ghoul:re", "Berserk"],
      signature: "Best-written conflicts",
      signatureItems: ["Tenma vs. Johan", "Friend's legacy", "Kaneki's identity"],
      match: "You share recurring themes of identity, history, responsibility, and inherited conflict.",
      difference: "Ren is more analytical and historical; your profile gives more space to personal attachment.",
      sharedThemes: ["History", "Responsibility", "Identity"],
      activity: [
        { type: "Reflection", title: "Monster", detail: "Published a long-form essay", time: "5h" },
        { type: "Thought", title: "20th Century Boys", detail: "Edited a note on inherited myths", time: "4d" },
      ],
    },
  });

  const FEED_ITEMS = Object.freeze([
    { profile: "kai", type: "Ranking updated", title: "Favourite protagonists", detail: "Ken Kaneki is now #1", story: "Tokyo Ghoul:re" },
    { profile: "mira", type: "New moment", title: "A scene worth keeping", detail: "Added a visual note about memory", story: "Goodnight Punpun" },
    { profile: "ren", type: "New reflection", title: "Responsibility after violence", detail: "Long-form public reflection", story: "Monster" },
    { profile: "kai", type: "New quote", title: "Saved from a recent reread", detail: "Spoiler protected", story: "Fullmetal Alchemist" },
  ]);

  const AUDIENCE_META = Object.freeze({
    private: {
      label: "Private",
      previewTitle: "Private reflection",
      previewState: "Only you",
      summary: "Only you can see this reflection.",
      hint: "This stays in your private library until you choose another audience.",
      footer: "1 reader",
      orbitCount: 0,
    },
    followers: {
      label: "Followers",
      previewTitle: "Followers preview",
      previewState: "Your network",
      summary: "People you follow can see this reflection.",
      hint: "The post enters your Following feed while remaining attached to the story.",
      footer: "126 followers",
      orbitCount: 4,
    },
    public: {
      label: "Public",
      previewTitle: "Public reflection",
      previewState: "Community",
      summary: "Anyone can discover this reflection on your profile.",
      hint: "Public posts can appear on profiles, story pages, search, and For You.",
      footer: "Community",
      orbitCount: 4,
    },
  });

  const STEP_META = Object.freeze({
    control: { number: "01", label: "Audience and spoilers", status: "Control", announcement: "Choose an audience and decide whether to protect spoilers." },
    identity: { number: "02", label: "Profile, rankings, and activity", status: "Identity", announcement: "Build a profile from top stories, custom rankings, and recent activity." },
    social: { number: "03", label: "Feed, discovery, and story layers", status: "Social", announcement: "Follow activity, discover readers, open a profile, and inspect one story." },
  });

  const state = {
    activeAct: "control",
    audience: "private",
    spoiler: false,
    shared: false,
    hubMode: "following",
    selectedProfile: "kai",
    readerView: "overview",
    storyLayer: "reflection",
    following: new Set(),
    searchQuery: "Tokyo Ghoul:re",
    searchFilter: "all",
  };

  const demoState = {
    audience: "private",
    spoiler: false,
    hubMode: "following",
    readerView: "overview",
  };

  const userLocks = {
    audience: false,
    spoiler: false,
    share: false,
    hub: false,
    profile: false,
    readerView: false,
    storyLayer: false,
    search: false,
  };

  let timeline = null;
  let trigger = null;
  let supabaseClient = null;
  let stories = [...FALLBACK_STORIES];
  let primaryStory = FALLBACK_STORIES[0];
  let resizeObserver = null;
  let lastDemoSignature = "";
  const cleanupCallbacks = [];

  const q = (selector, root = section) => root?.querySelector(selector) || null;
  const qa = (selector, root = section) => Array.from(root?.querySelectorAll(selector) || []);

  rebuildProductStory();
  const elements = collectElements();
  setupSemantics();
  setupInteractions();
  renderAll(false, "restore");
  hydrateDatabaseStories();

  if (!gsap || !ScrollTrigger) {
    showStatic();
    publishApi();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (reduceMotion || (!isDesktop && !MANAGED_BY_HOME_JOURNEY)) {
    showStatic();
    publishApi();
    return;
  }

  buildCinema();
  setupResizeRefresh();
  publishApi();

  function rebuildProductStory() {
    const identityCopy = q('[data-social-copy="identity"]');
    const discoveryCopy = q('[data-social-copy="discovery"]');
    const identityStep = q('[data-social-step="identity"]');
    const discoveryStep = q('[data-social-step="discovery"]');
    const principle = q(".social-cinema__principle");

    if (identityCopy) {
      identityCopy.innerHTML = `
        <span class="social-copy-state__index">02 · Build your identity</span>
        <h2>Make your taste unmistakably yours.</h2>
        <p>Choose the stories that define you, build your own ranking categories, and let recent activity show how your taste keeps changing.</p>
        <div class="social-copy-proof" aria-label="Profile features">
          <span>Top stories</span><span>Custom rankings</span><span>Recent activity</span>
        </div>`;
    }

    if (discoveryCopy) {
      discoveryCopy.dataset.socialCopy = "social";
      discoveryCopy.innerHTML = `
        <span class="social-copy-state__index">03 · Follow the people behind the stories</span>
        <h2>A social feed with a reason to exist.</h2>
        <p>See what followed readers added, discover people through shared taste, open a profile, and continue into the story layers that made you curious.</p>
        <div class="social-copy-proof" aria-label="Social features">
          <span>Following feed</span><span>For You</span><span>Explainable search</span>
        </div>`;
    }

    if (identityStep) {
      const strong = q("strong", identityStep);
      const small = q("small", identityStep);
      if (strong) strong.textContent = "Identity";
      if (small) small.textContent = "Rankings and profile";
    }

    if (discoveryStep) {
      discoveryStep.dataset.socialStep = "social";
      const strong = q("strong", discoveryStep);
      const small = q("small", discoveryStep);
      if (strong) strong.textContent = "Social";
      if (small) small.textContent = "Feed to story";
    }

    if (principle) {
      principle.textContent = "Built around what people save, rank, and write—not an endless generic feed.";
    }

    const identityScene = q('[data-social-scene="identity"]');
    if (identityScene) {
      identityScene.innerHTML = identityMarkup();
    }

    const discoveryScene = q('[data-social-scene="discovery"]');
    if (discoveryScene) {
      discoveryScene.dataset.socialScene = "social";
      discoveryScene.classList.remove("social-scene--discovery");
      discoveryScene.classList.add("social-scene--social");
      discoveryScene.innerHTML = socialMarkup();
    }
  }

  function identityMarkup() {
    return `
      <article class="s10-profile" data-s10-profile>
        <header class="s10-profile__hero">
          <div class="s10-profile__banner" aria-hidden="true">
            <span>perspective</span>
          </div>
          <div class="s10-profile__identity">
            <div class="s10-avatar s10-avatar--large" data-s10-own-avatar>N</div>
            <div class="s10-profile__copy">
              <span class="s10-kicker">Your public profile</span>
              <h3>nova.pages</h3>
              <p data-s10-own-bio></p>
              <div class="s10-tag-row" data-s10-own-tags></div>
            </div>
            <button type="button" class="s10-secondary-button" data-s10-edit-profile>Edit profile</button>
          </div>
          <div class="s10-stats" data-s10-own-stats></div>
        </header>

        <div class="s10-profile__body">
          <section class="s10-top-stories" aria-labelledby="s10-top-stories-title">
            <div class="s10-section-heading">
              <span><small>Taste at a glance</small><strong id="s10-top-stories-title">The stories that define me</strong></span>
              <button type="button" class="s10-text-button" data-s10-open-ranking>View full Top 10</button>
            </div>
            <div class="s10-ranking-showcase" data-s10-own-ranking></div>
          </section>

          <aside class="s10-profile__side">
            <section class="s10-category-section" aria-labelledby="s10-categories-title">
              <div class="s10-section-heading s10-section-heading--compact">
                <span><small>Curated by you</small><strong id="s10-categories-title">Custom ranking categories</strong></span>
                <span class="s10-count-pill">3 showcases</span>
              </div>
              <div class="s10-category-stack" data-s10-own-categories></div>
            </section>

            <section class="s10-activity-section" aria-labelledby="s10-activity-title">
              <div class="s10-section-heading s10-section-heading--compact">
                <span><small>What changed</small><strong id="s10-activity-title">Recent activity</strong></span>
              </div>
              <div class="s10-activity-list" data-s10-own-activity></div>
            </section>
          </aside>
        </div>

        <section class="s10-ranking-drawer" data-s10-ranking-drawer aria-hidden="true" inert>
          <header>
            <span><small>nova.pages</small><strong>Full Top 10</strong></span>
            <button type="button" class="s10-icon-button" data-s10-close-ranking aria-label="Close full ranking">×</button>
          </header>
          <ol data-s10-full-ranking></ol>
        </section>
      </article>`;
  }

  function socialMarkup() {
    return `
      <section class="s10-social-hub" aria-label="Social feed and discovery">
        <header class="s10-hub-header">
          <span><small>Inkwell social</small><strong>Follow activity. Discover with context.</strong></span>
          <div class="s10-hub-tabs" role="tablist" aria-label="Social view">
            <button type="button" role="tab" data-s10-hub-mode="following" aria-selected="true">Following</button>
            <button type="button" role="tab" data-s10-hub-mode="foryou" aria-selected="false">For You</button>
            <button type="button" role="tab" data-s10-hub-mode="search" aria-selected="false">Search</button>
          </div>
        </header>

        <div class="s10-hub-panels">
          <section class="s10-hub-panel is-active" data-s10-hub-panel="following" role="tabpanel">
            <div class="s10-panel-intro">
              <span><small>Latest from people you chose</small><strong>Following</strong></span>
              <span class="s10-count-pill">4 updates</span>
            </div>
            <div class="s10-feed-grid" data-s10-following-feed></div>
          </section>

          <section class="s10-hub-panel" data-s10-hub-panel="foryou" role="tabpanel" aria-hidden="true" inert>
            <div class="s10-panel-intro">
              <span><small>Recommended from shared taste</small><strong>For You</strong></span>
              <span class="s10-count-pill">Explainable matches</span>
            </div>
            <div class="s10-reader-results" data-s10-for-you-results></div>
          </section>

          <section class="s10-hub-panel" data-s10-hub-panel="search" role="tabpanel" aria-hidden="true" inert>
            <div class="s10-search-box">
              <label for="s10-reader-search">Search usernames, titles, tags, or themes</label>
              <div class="s10-search-input-shell">
                <span aria-hidden="true">⌕</span>
                <input id="s10-reader-search" data-s10-search-input type="search" value="Tokyo Ghoul:re" autocomplete="off">
              </div>
              <div class="s10-search-filters" role="radiogroup" aria-label="Search filter">
                <button type="button" role="radio" data-s10-search-filter="all" aria-checked="true">All</button>
                <button type="button" role="radio" data-s10-search-filter="people" aria-checked="false">People</button>
                <button type="button" role="radio" data-s10-search-filter="stories" aria-checked="false">Stories</button>
                <button type="button" role="radio" data-s10-search-filter="themes" aria-checked="false">Themes</button>
                <button type="button" role="radio" data-s10-search-filter="tags" aria-checked="false">Tags</button>
              </div>
            </div>
            <div class="s10-search-summary" data-s10-search-summary></div>
            <div class="s10-reader-results" data-s10-search-results></div>
          </section>
        </div>
      </section>

      <aside class="s10-reader-stage" data-s10-reader-stage>
        <article class="s10-reader-empty" data-s10-reader-empty>
          <div class="s10-reader-empty__visual" aria-hidden="true"><span>K</span><span>M</span><span>R</span></div>
          <span><small>Choose a reader</small><strong>See the person behind the match.</strong></span>
          <p>Open a recommendation to compare shared taste, distinctive rankings, and recent public activity.</p>
        </article>

        <article class="s10-reader-profile" data-s10-reader-profile aria-hidden="true" inert></article>
        <article class="s10-story-detail" data-s10-story-detail aria-hidden="true" inert></article>
      </aside>`;
  }

  function collectElements() {
    return {
      pin: q("[data-social-cinema-pin]"),
      screen: q("[data-social-screen]"),
      toolbarStatus: q("[data-social-toolbar-status]"),
      sceneNumber: q("[data-social-scene-number]"),
      sceneLabel: q("[data-social-scene-label]"),
      status: q("[data-social-status]"),
      eyebrow: q(".social-cinema__eyebrow"),
      copyStates: qa("[data-social-copy]"),
      steps: qa("[data-social-step]"),
      principle: q(".social-cinema__principle"),
      scenes: {
        control: q('[data-social-scene="control"]'),
        identity: q('[data-social-scene="identity"]'),
        social: q('[data-social-scene="social"]'),
      },

      composer: q(".social-composer"),
      livePreview: q(".social-live-preview"),
      sharedPost: q("[data-social-shared-post]"),
      controlAnchor: q('[data-social-post-anchor="control"]'),
      audienceButtons: qa("[data-social-audience]"),
      audienceSummary: q("[data-social-audience-summary]"),
      previewTitle: q("[data-social-preview-title]"),
      previewState: q("[data-social-preview-state]"),
      previewHint: q("[data-social-preview-hint]"),
      previewFooter: q("[data-social-preview-footer]"),
      orbitAvatars: qa(".social-orbit-avatar"),
      visibilityBadge: q("[data-social-visibility-badge]"),
      spoilerToggle: q("[data-social-spoiler-toggle]"),
      spoilerShield: q("[data-social-spoiler-shield]"),
      spoilerReveal: q("[data-social-spoiler-reveal]"),
      shareButton: q("[data-social-share-button]"),
      primaryStoryTitles: qa(".social-story-mini small, .social-story-reference strong"),
      primaryStoryFallbacks: qa(".social-story-mini__cover > span, .social-story-cover > span"),
      storyImages: qa("[data-social-story-cover], [data-social-post-cover]"),
      composerReflection: q(".social-composer__reflection p"),
      sharedReflection: q(".social-shared-post blockquote"),

      profile: q("[data-s10-profile]"),
      ownAvatar: q("[data-s10-own-avatar]"),
      ownBio: q("[data-s10-own-bio]"),
      ownTags: q("[data-s10-own-tags]"),
      ownStats: q("[data-s10-own-stats]"),
      ownRanking: q("[data-s10-own-ranking]"),
      ownCategories: q("[data-s10-own-categories]"),
      ownActivity: q("[data-s10-own-activity]"),
      openRanking: q("[data-s10-open-ranking]"),
      closeRanking: q("[data-s10-close-ranking]"),
      rankingDrawer: q("[data-s10-ranking-drawer]"),
      fullRanking: q("[data-s10-full-ranking]"),
      editProfile: q("[data-s10-edit-profile]"),

      hub: q(".s10-social-hub"),
      hubTabs: qa("[data-s10-hub-mode]"),
      hubPanels: qa("[data-s10-hub-panel]"),
      followingFeed: q("[data-s10-following-feed]"),
      forYouResults: q("[data-s10-for-you-results]"),
      searchResults: q("[data-s10-search-results]"),
      searchInput: q("[data-s10-search-input]"),
      searchFilters: qa("[data-s10-search-filter]"),
      searchSummary: q("[data-s10-search-summary]"),
      readerStage: q("[data-s10-reader-stage]"),
      readerEmpty: q("[data-s10-reader-empty]"),
      readerProfile: q("[data-s10-reader-profile]"),
      storyDetail: q("[data-s10-story-detail]"),
    };
  }

  function setupSemantics() {
    const audienceGroup = elements.audienceButtons[0]?.parentElement;
    audienceGroup?.setAttribute("role", "radiogroup");
    audienceGroup?.setAttribute("aria-label", "Reflection audience");
    elements.audienceButtons.forEach((button) => button.setAttribute("role", "radio"));

    elements.shareButton?.setAttribute("aria-live", "polite");
    elements.editProfile?.setAttribute("aria-pressed", "false");
  }

  function setupInteractions() {
    const listen = (target, type, handler, options) => {
      if (!target) return;
      target.addEventListener(type, handler, options);
      cleanupCallbacks.push(() => target.removeEventListener(type, handler, options));
    };

    listen(section, "pointerdown", (event) => {
      const target = event.target.closest("button, input, a");
      if (!target) return;
      if (target.matches("[data-social-audience]")) userLocks.audience = true;
      if (target.matches("[data-social-spoiler-toggle], [data-social-spoiler-reveal]")) userLocks.spoiler = true;
      if (target.matches("[data-social-share-button]")) {
        userLocks.share = true;
        userLocks.audience = true;
        userLocks.spoiler = true;
      }
      if (target.matches("[data-s10-hub-mode]")) userLocks.hub = true;
      if (target.closest("[data-s10-profile-key]")) userLocks.profile = true;
      if (target.matches("[data-s10-open-reader], [data-s10-open-story], [data-s10-back-profile]")) userLocks.readerView = true;
      if (target.matches("[data-s10-story-layer]")) userLocks.storyLayer = true;
      if (target.matches("[data-s10-search-input], [data-s10-search-filter]")) userLocks.search = true;
    }, { capture: true, passive: true });

    elements.audienceButtons.forEach((button, index) => {
      listen(button, "click", () => {
        state.audience = button.dataset.socialAudience || "private";
        renderAudience(state.audience, true, "user");
      });
      listen(button, "keydown", (event) => handleRovingRadioKey(event, elements.audienceButtons, index, (next) => next.click()));
    });

    listen(elements.spoilerToggle, "click", () => renderSpoiler(!state.spoiler, true, "user"));
    listen(elements.spoilerReveal, "click", () => renderSpoiler(false, true, "user"));
    listen(elements.shareButton, "click", () => renderShared(!state.shared, true));

    listen(elements.openRanking, "click", () => openRankingDrawer(true));
    listen(elements.closeRanking, "click", () => openRankingDrawer(false));
    listen(elements.editProfile, "click", () => {
      const active = elements.editProfile.getAttribute("aria-pressed") !== "true";
      elements.editProfile.setAttribute("aria-pressed", active ? "true" : "false");
      elements.editProfile.textContent = active ? "Editing preview" : "Edit profile";
      elements.profile?.classList.toggle("is-editing-preview", active);
      announce(active ? "Profile editing preview enabled." : "Profile editing preview closed.");
    });

    elements.hubTabs.forEach((button, index) => {
      listen(button, "click", () => setHubMode(button.dataset.s10HubMode || "following", true, "user"));
      listen(button, "keydown", (event) => handleRovingTabKey(event, elements.hubTabs, index));
    });

    elements.searchFilters.forEach((button, index) => {
      listen(button, "click", () => {
        state.searchFilter = button.dataset.s10SearchFilter || "all";
        renderSearchResults(true);
      });
      listen(button, "keydown", (event) => handleRovingRadioKey(event, elements.searchFilters, index, (next) => next.click()));
    });

    listen(elements.searchInput, "input", () => {
      state.searchQuery = elements.searchInput.value;
      renderSearchResults(false);
    });

    listen(elements.followingFeed, "click", handleProfileDelegation);
    listen(elements.forYouResults, "click", handleProfileDelegation);
    listen(elements.searchResults, "click", handleProfileDelegation);
    listen(elements.readerProfile, "click", handleReaderProfileClick);
    listen(elements.storyDetail, "click", handleStoryDetailClick);

    listen(document, "keydown", (event) => {
      if (event.key !== "Escape") return;
      if (elements.rankingDrawer?.classList.contains("is-open")) {
        openRankingDrawer(false);
      } else if (state.readerView === "story") {
        setReaderView("profile", true, "user");
      } else if (state.readerView === "profile") {
        setReaderView("overview", true, "user");
      }
    });
  }

  function handleProfileDelegation(event) {
    const card = event.target.closest("[data-s10-profile-key]");
    if (!card) return;
    selectProfile(card.dataset.s10ProfileKey || "kai", true, "user");
    setReaderView("profile", true, "user");
  }

  function handleReaderProfileClick(event) {
    const follow = event.target.closest("[data-s10-follow-reader]");
    if (follow) {
      const key = follow.dataset.s10FollowReader || state.selectedProfile;
      toggleFollowing(key, true);
      return;
    }

    const storyButton = event.target.closest("[data-s10-open-story]");
    if (storyButton) {
      const title = storyButton.dataset.s10OpenStory || primaryStory.title;
      renderStoryDetail(title);
      setReaderView("story", true, "user");
    }
  }

  function handleStoryDetailClick(event) {
    const back = event.target.closest("[data-s10-back-profile]");
    if (back) {
      setReaderView("profile", true, "user");
      return;
    }

    const layer = event.target.closest("[data-s10-story-layer]");
    if (layer) {
      setStoryLayer(layer.dataset.s10StoryLayer || "reflection", true, "user");
    }
  }

  function buildCinema() {
    setInitialAnimationState();

    timeline = gsap.timeline({
      paused: true,
      defaults: { ease: "none" },
      onUpdate: () => syncTimelineState(false),
    });

    const controlCopy = getCopyState("control");
    const identityCopy = getCopyState("identity");
    const socialCopy = getCopyState("social");

    timeline.addLabel("control", ACT_TIMES.control);
    timeline.to([elements.eyebrow, controlCopy, ...elements.steps, elements.principle], {
      autoAlpha: 1,
      y: 0,
      duration: 0.58,
      stagger: 0.04,
      ease: "power3.out",
    }, 0);
    timeline.to(elements.scenes.control, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.08);
    timeline.to([elements.composer, elements.livePreview], {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.58,
      stagger: 0.07,
      ease: "power3.out",
    }, 0.18);
    timeline.to(elements.sharedPost, {
      autoAlpha: 1,
      x: () => getAnchorTransform(elements.controlAnchor).x,
      y: () => getAnchorTransform(elements.controlAnchor).y,
      scale: () => getAnchorTransform(elements.controlAnchor).scale,
      duration: 0.58,
      ease: "power3.out",
    }, 0.28);
    timeline.addLabel("control-ready", OPENING_READY_TIME);

    timeline.addLabel("identity-transition", ACT_TIMES.identityTransition);
    timeline.to(controlCopy, { autoAlpha: 0, y: -16, duration: 0.34, ease: "power2.inOut" }, "identity-transition");
    timeline.fromTo(identityCopy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.46, ease: "power3.out" }, "identity-transition+=0.12");
    timeline.to([elements.composer, elements.livePreview, elements.sharedPost], {
      autoAlpha: 0,
      y: -18,
      scale: 0.982,
      duration: 0.42,
      ease: "power2.inOut",
    }, "identity-transition");
    timeline.set(elements.scenes.identity, { visibility: "visible" }, "identity-transition+=0.06");
    timeline.to(elements.scenes.identity, { autoAlpha: 1, duration: 0.34, ease: "power2.out" }, "identity-transition+=0.08");
    timeline.fromTo(elements.profile, { autoAlpha: 0, y: 24, scale: 0.982 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.62, ease: "power3.out" }, "identity-transition+=0.12");
    timeline.to(elements.scenes.control, { autoAlpha: 0, duration: 0.22 }, "identity-transition+=0.26");

    timeline.addLabel("identity", ACT_TIMES.identity);
    timeline.fromTo(qa(".s10-profile__identity > *, .s10-stat", elements.profile), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.035, ease: "power3.out" }, "identity");
    timeline.fromTo(qa(".s10-rank-card", elements.profile), { autoAlpha: 0, y: 18, rotate: -1 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.4, stagger: 0.055, ease: "power3.out" }, "identity+=0.3");
    timeline.fromTo(qa(".s10-category-card", elements.profile), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.36, stagger: 0.06, ease: "power3.out" }, "identity+=0.56");
    timeline.fromTo(qa(".s10-activity-item", elements.profile), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.06, ease: "power3.out" }, "identity+=0.78");

    timeline.addLabel("social-transition", ACT_TIMES.socialTransition);
    timeline.to(identityCopy, { autoAlpha: 0, y: -16, duration: 0.34, ease: "power2.inOut" }, "social-transition");
    timeline.fromTo(socialCopy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.46, ease: "power3.out" }, "social-transition+=0.12");
    timeline.to(elements.profile, { autoAlpha: 0, x: -34, scale: 0.98, duration: 0.46, ease: "power2.inOut" }, "social-transition");
    timeline.set(elements.scenes.social, { visibility: "visible" }, "social-transition+=0.06");
    timeline.to(elements.scenes.social, { autoAlpha: 1, duration: 0.34, ease: "power2.out" }, "social-transition+=0.08");
    timeline.fromTo([elements.hub, elements.readerStage], { autoAlpha: 0, y: 20, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.56, stagger: 0.07, ease: "power3.out" }, "social-transition+=0.12");
    timeline.to(elements.scenes.identity, { autoAlpha: 0, duration: 0.22 }, "social-transition+=0.26");

    timeline.addLabel("social", ACT_TIMES.social);
    timeline.fromTo(qa(".s10-feed-card"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.36, stagger: 0.055, ease: "power3.out" }, "social+=0.12");
    timeline.to({}, { duration: 4.35 }, "social");
    timeline.addLabel("section-end", ACT_TIMES.end);

    if (MANAGED_BY_HOME_JOURNEY) {
      timeline.pause(0);
      return;
    }

    trigger = ScrollTrigger.create({
      id: "inkwell-social-cinema-v10",
      trigger: section,
      animation: timeline,
      pin: elements.pin,
      pinSpacing: true,
      start: () => `top top+=${getNavHeight()}`,
      end: () => `+=${Math.max(6500, window.innerHeight * 7.1)}`,
      scrub: STANDALONE_SCRUB_SECONDS,
      fastScrollEnd: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: () => syncTimelineState(false),
    });

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
  }

  function setInitialAnimationState() {
    const controlCopy = getCopyState("control");

    gsap.set([elements.eyebrow, ...elements.copyStates, ...elements.steps, elements.principle], { autoAlpha: 0, y: 14 });
    gsap.set(controlCopy, { y: 14 });
    gsap.set(Object.values(elements.scenes), { autoAlpha: 0, visibility: "hidden" });
    gsap.set(elements.scenes.control, { visibility: "visible" });
    gsap.set([elements.composer, elements.livePreview], { autoAlpha: 0, y: 18, scale: 0.988 });

    const anchor = getAnchorTransform(elements.controlAnchor);
    gsap.set(elements.sharedPost, {
      autoAlpha: 0,
      x: anchor.x,
      y: anchor.y + 12,
      scale: anchor.scale * 0.95,
      transformOrigin: "0 0",
      visibility: "visible",
      pointerEvents: "none",
    });

    gsap.set(elements.profile, { autoAlpha: 0, x: 0, y: 24, scale: 0.982 });
    gsap.set([elements.hub, elements.readerStage], { autoAlpha: 0, y: 20, scale: 0.985 });
    setActiveAct("control", true);
    lastDemoSignature = "";
  }

  function syncTimelineState(force) {
    if (!timeline) return;
    const time = Number(timeline.time() || 0);
    const act = time < ACT_TIMES.identityTransition + 0.18
      ? "control"
      : time < ACT_TIMES.socialTransition + 0.18
        ? "identity"
        : "social";

    if (force || act !== state.activeAct) setActiveAct(act, force);
    syncDemoState(time, force);
  }

  function syncDemoState(time, force) {
    if (time <= DEMO_THRESHOLDS.followersLeave) demoState.audience = "private";
    else if (time >= DEMO_THRESHOLDS.publicEnter) demoState.audience = "public";
    else if (demoState.audience === "private" && time >= DEMO_THRESHOLDS.followersEnter) demoState.audience = "followers";
    else if (demoState.audience === "public" && time <= DEMO_THRESHOLDS.publicLeave) demoState.audience = "followers";

    if (!demoState.spoiler && time >= DEMO_THRESHOLDS.spoilerEnter) demoState.spoiler = true;
    else if (demoState.spoiler && time <= DEMO_THRESHOLDS.spoilerLeave) demoState.spoiler = false;

    if (time <= DEMO_THRESHOLDS.forYouLeave) demoState.hubMode = "following";
    else if (time >= DEMO_THRESHOLDS.searchEnter) demoState.hubMode = "search";
    else if (demoState.hubMode === "following" && time >= DEMO_THRESHOLDS.forYouEnter) demoState.hubMode = "foryou";
    else if (demoState.hubMode === "search" && time <= DEMO_THRESHOLDS.searchLeave) demoState.hubMode = "foryou";

    if (time <= DEMO_THRESHOLDS.profileLeave) demoState.readerView = "overview";
    else if (time >= DEMO_THRESHOLDS.storyEnter) demoState.readerView = "story";
    else if (demoState.readerView === "overview" && time >= DEMO_THRESHOLDS.profileEnter) demoState.readerView = "profile";
    else if (demoState.readerView === "story" && time <= DEMO_THRESHOLDS.storyLeave) demoState.readerView = "profile";

    const signature = JSON.stringify(demoState);
    if (!force && signature === lastDemoSignature) return;
    lastDemoSignature = signature;

    if (!userLocks.audience) renderAudience(demoState.audience, true, "demo");
    if (!userLocks.spoiler) renderSpoiler(demoState.spoiler, true, "demo");
    if (state.activeAct === "social" && !userLocks.hub) setHubMode(demoState.hubMode, true, "demo");
    if (state.activeAct === "social" && !userLocks.readerView) {
      if (demoState.readerView !== "overview" && state.selectedProfile !== "kai" && !userLocks.profile) {
        selectProfile("kai", false, "demo");
      }
      if (demoState.readerView === "story") renderStoryDetail(primaryStory.title);
      setReaderView(demoState.readerView, true, "demo");
    }
  }

  function setActiveAct(key, force = false) {
    if (!force && state.activeAct === key) return;
    state.activeAct = key;
    section.dataset.socialActiveAct = key;
    const meta = STEP_META[key] || STEP_META.control;

    elements.steps.forEach((step) => {
      const selected = step.dataset.socialStep === key;
      step.classList.toggle("is-active", selected);
    });

    elements.copyStates.forEach((copy) => {
      const selected = copy.dataset.socialCopy === key;
      copy.classList.toggle("is-active", selected);
      copy.setAttribute("aria-hidden", selected ? "false" : "true");
    });

    Object.entries(elements.scenes).forEach(([sceneKey, scene]) => {
      const selected = sceneKey === key;
      scene?.classList.toggle("is-interactive", selected);
      scene?.setAttribute("aria-hidden", selected ? "false" : "true");
      scene?.toggleAttribute("inert", !selected);
    });

    setText(elements.toolbarStatus, meta.status);
    setText(elements.sceneNumber, meta.number);
    setText(elements.sceneLabel, meta.label);
    announce(meta.announcement);
  }

  function renderAll(animate, source) {
    renderAudience(state.audience, animate, source);
    renderSpoiler(state.spoiler, animate, source);
    renderShared(state.shared, animate);
    renderOwnProfile();
    renderFollowingFeed();
    renderReaderResults();
    setHubMode(state.hubMode, animate, source);
    selectProfile(state.selectedProfile, false, source);
    setReaderView(state.readerView, animate, source);
    setStoryLayer(state.storyLayer, false, source);
  }

  function renderAudience(value, animate, source = "system") {
    const normalized = AUDIENCE_META[value] ? value : "private";
    const meta = AUDIENCE_META[normalized];
    state.audience = normalized;
    section.dataset.socialAudience = normalized;

    elements.audienceButtons.forEach((button) => {
      const selected = button.dataset.socialAudience === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", selected ? "true" : "false");
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    setText(elements.audienceSummary, meta.summary);
    setText(elements.previewTitle, meta.previewTitle);
    setText(elements.previewState, meta.previewState);
    setText(elements.previewHint, meta.hint);
    setText(elements.previewFooter, meta.footer);
    setText(elements.visibilityBadge, meta.label.toUpperCase());

    elements.orbitAvatars.forEach((avatar, index) => {
      const visible = index < meta.orbitCount;
      if (gsap) {
        gsap.to(avatar, {
          autoAlpha: visible ? 1 : 0,
          scale: visible ? 1 : 0.86,
          duration: animate ? 0.28 : 0,
          ease: "power3.out",
          overwrite: "auto",
        });
      } else {
        avatar.style.opacity = visible ? "1" : "0";
      }
    });

    if (source === "user") announce(`${meta.label} audience selected.`);
  }

  function renderSpoiler(enabled, animate, source = "system") {
    state.spoiler = Boolean(enabled);
    section.classList.toggle("is-social-spoiler", state.spoiler);
    elements.spoilerToggle?.setAttribute("aria-pressed", state.spoiler ? "true" : "false");
    elements.spoilerToggle?.setAttribute("aria-label", state.spoiler ? "Remove spoiler protection" : "Mark reflection as containing spoilers");

    if (gsap) {
      gsap.to(elements.spoilerShield, {
        autoAlpha: state.spoiler ? 1 : 0,
        duration: animate ? 0.3 : 0,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else if (elements.spoilerShield) {
      elements.spoilerShield.style.opacity = state.spoiler ? "1" : "0";
    }

    if (source === "user") announce(state.spoiler ? "Spoiler protection enabled." : "Spoiler protection disabled.");
  }

  function renderShared(enabled, animate) {
    state.shared = Boolean(enabled);
    section.classList.toggle("is-social-shared", state.shared);
    if (elements.shareButton) {
      elements.shareButton.textContent = state.shared ? "Shared" : "Share reflection";
      elements.shareButton.setAttribute("aria-pressed", state.shared ? "true" : "false");
    }
    if (animate && gsap) {
      gsap.fromTo(elements.shareButton, { boxShadow: "0 0 0 0 rgba(120,221,178,0)" }, {
        boxShadow: state.shared ? "0 0 0 4px rgba(120,221,178,0.16)" : "0 0 0 0 rgba(120,221,178,0)",
        duration: 0.32,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (animate) announce(state.shared ? `Reflection shared with ${AUDIENCE_META[state.audience].label.toLowerCase()}.` : "Share confirmation cleared.");
  }

  function renderOwnProfile() {
    const profile = PROFILE_DATA.nova;
    setText(elements.ownAvatar, profile.initial);
    setText(elements.ownBio, profile.bio);

    elements.ownTags.innerHTML = profile.tags.map((tag) => `<span class="s10-tag">${escapeHtml(tag)}</span>`).join("");
    elements.ownStats.innerHTML = profile.stats.map(([value, label]) => `<div class="s10-stat"><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></div>`).join("");

    const rankingStories = profile.topStories.map(getStoryByTitle);
    elements.ownRanking.innerHTML = rankingStories.map((story, index) => rankCardMarkup(story, index, "own")).join("");
    renderImages(elements.ownRanking);

    elements.ownCategories.innerHTML = profile.categories.map((category, categoryIndex) => categoryMarkup(category, categoryIndex)).join("");
    elements.ownActivity.innerHTML = profile.activity.map(activityMarkup).join("");

    const full = mergeUniqueStories(rankingStories, stories).slice(0, 10);
    elements.fullRanking.innerHTML = full.map((story, index) => `<li><span class="s10-ranking-number">${String(index + 1).padStart(2, "0")}</span>${storyCoverMarkup(story)}<span><strong>${escapeHtml(story.title)}</strong><small>${escapeHtml(story.creator || "Story")}</small></span></li>`).join("");
    renderImages(elements.fullRanking);
  }

  function renderFollowingFeed() {
    elements.followingFeed.innerHTML = FEED_ITEMS.map((item, index) => feedCardMarkup(item, index)).join("");
    renderImages(elements.followingFeed);
  }

  function renderReaderResults() {
    const keys = ["kai", "mira", "ren"];
    elements.forYouResults.innerHTML = keys.map((key) => readerResultMarkup(key, "foryou")).join("");
    renderImages(elements.forYouResults);
    renderSearchResults(false);
  }

  function renderSearchResults(animate) {
    const query = normalizeText(state.searchQuery);
    const filter = state.searchFilter;
    const keys = ["kai", "mira", "ren"];
    const results = keys.filter((key) => {
      if (!query) return true;
      const profile = PROFILE_DATA[key];
      const haystacks = {
        people: [profile.name, profile.bio],
        stories: profile.topStories,
        themes: profile.sharedThemes,
        tags: profile.tags,
        all: [profile.name, profile.bio, ...profile.topStories, ...profile.sharedThemes, ...profile.tags],
      };
      return (haystacks[filter] || haystacks.all).some((value) => normalizeText(value).includes(query));
    });

    elements.searchFilters.forEach((button) => {
      const selected = button.dataset.s10SearchFilter === filter;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    elements.searchResults.innerHTML = (results.length ? results : keys).map((key) => readerResultMarkup(key, "search")).join("");
    renderImages(elements.searchResults);
    setText(elements.searchSummary, results.length
      ? `${results.length} reader${results.length === 1 ? "" : "s"} connected to “${state.searchQuery || "all taste"}”`
      : `No exact match. Showing readers with related taste.`);

    if (animate && gsap) {
      gsap.fromTo(qa(".s10-reader-result", elements.searchResults), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.04, ease: "power3.out" });
    }
  }

  function setHubMode(mode, animate, source = "system") {
    const normalized = ["following", "foryou", "search"].includes(mode) ? mode : "following";
    if (state.hubMode === normalized && source !== "restore") return;
    state.hubMode = normalized;
    section.dataset.socialHubMode = normalized;

    elements.hubTabs.forEach((button) => {
      const selected = button.dataset.s10HubMode === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    elements.hubPanels.forEach((panel) => {
      const selected = panel.dataset.s10HubPanel === normalized;
      panel.classList.toggle("is-active", selected);
      panel.setAttribute("aria-hidden", selected ? "false" : "true");
      panel.toggleAttribute("inert", !selected);
      if (gsap) {
        gsap.to(panel, {
          autoAlpha: selected ? 1 : 0,
          x: selected ? 0 : normalized === "following" ? 14 : -14,
          duration: animate ? 0.32 : 0,
          ease: "power2.out",
          overwrite: "auto",
          onStart: () => { if (selected) panel.style.visibility = "visible"; },
          onComplete: () => { if (!selected) panel.style.visibility = "hidden"; },
        });
      }
    });

    if (normalized === "search" && elements.searchInput) {
      state.searchQuery = elements.searchInput.value || state.searchQuery;
      renderSearchResults(false);
    }
    if (source === "user") announce(`${capitalize(normalized === "foryou" ? "For You" : normalized)} view selected.`);
  }

  function selectProfile(key, animate, source = "system") {
    const normalized = PROFILE_DATA[key] ? key : "kai";
    state.selectedProfile = normalized;
    section.dataset.socialSelectedProfile = normalized;
    renderReaderProfile(normalized);

    qa("[data-s10-profile-key]").forEach((card) => {
      const selected = card.dataset.s10ProfileKey === normalized;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    if (animate && gsap) {
      gsap.fromTo(elements.readerProfile, { autoAlpha: 0.55, x: 12 }, { autoAlpha: 1, x: 0, duration: 0.32, ease: "power3.out", overwrite: "auto" });
    }
    if (source === "user") announce(`${PROFILE_DATA[normalized].name} selected.`);
  }

  function renderReaderProfile(key) {
    const profile = PROFILE_DATA[key];
    const rankingStories = profile.topStories.map(getStoryByTitle);
    const following = state.following.has(key);

    elements.readerProfile.innerHTML = `
      <header class="s10-reader-profile__header">
        <div class="s10-avatar" style="${avatarStyle(key)}">${escapeHtml(profile.initial)}</div>
        <div><span class="s10-kicker">${escapeHtml(profile.label)}</span><h3>${escapeHtml(profile.name)}</h3><p>${escapeHtml(profile.bio)}</p></div>
        <button type="button" class="s10-follow-button ${following ? "is-following" : ""}" data-s10-follow-reader="${escapeHtml(key)}" aria-pressed="${following}">${following ? "Following" : "Follow"}</button>
      </header>
      <div class="s10-reader-tags">${profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <section class="s10-match-card">
        <div><small>Why you match</small><p>${escapeHtml(profile.match)}</p></div>
        <div><small>What makes them different</small><p>${escapeHtml(profile.difference)}</p></div>
      </section>
      <section class="s10-reader-ranking">
        <div class="s10-section-heading s10-section-heading--compact"><span><small>Their public showcase</small><strong>Top stories</strong></span><span class="s10-count-pill">Top 4</span></div>
        <div class="s10-reader-ranking__grid">${rankingStories.map((story, index) => rankCardMarkup(story, index, "reader")).join("")}</div>
      </section>
      <section class="s10-reader-signature">
        <div><small>Custom ranking</small><strong>${escapeHtml(profile.signature)}</strong></div>
        <ol>${profile.signatureItems.map((item, index) => `<li><span>${index + 1}</span>${escapeHtml(item)}</li>`).join("")}</ol>
      </section>
      <section class="s10-reader-activity">
        <div class="s10-section-heading s10-section-heading--compact"><span><small>Recently public</small><strong>Activity</strong></span></div>
        <div>${profile.activity.map(activityMarkup).join("")}</div>
      </section>`;
    renderImages(elements.readerProfile);
  }

  function setReaderView(view, animate, source = "system") {
    const normalized = ["overview", "profile", "story"].includes(view) ? view : "overview";
    state.readerView = normalized;
    section.dataset.socialReaderView = normalized;

    const map = {
      overview: elements.readerEmpty,
      profile: elements.readerProfile,
      story: elements.storyDetail,
    };

    Object.entries(map).forEach(([key, panel]) => {
      const selected = key === normalized;
      panel?.setAttribute("aria-hidden", selected ? "false" : "true");
      panel?.toggleAttribute("inert", !selected);
      panel?.classList.toggle("is-active", selected);
      if (gsap) {
        gsap.to(panel, {
          autoAlpha: selected ? 1 : 0,
          x: selected ? 0 : key === "overview" ? -12 : 18,
          scale: selected ? 1 : 0.985,
          duration: animate ? 0.36 : 0,
          ease: "power3.out",
          overwrite: "auto",
          onStart: () => { if (selected) panel.style.visibility = "visible"; },
          onComplete: () => { if (!selected) panel.style.visibility = "hidden"; },
        });
      }
    });

    if (normalized === "profile") renderReaderProfile(state.selectedProfile);
    if (normalized === "story" && !elements.storyDetail.innerHTML.trim()) renderStoryDetail(primaryStory.title);
    if (source === "user") announce(normalized === "story" ? "Story layers opened." : normalized === "profile" ? "Reader profile opened." : "Reader profile closed.");
  }

  function renderStoryDetail(title) {
    const story = getStoryByTitle(title);
    const profile = PROFILE_DATA[state.selectedProfile] || PROFILE_DATA.kai;
    const layerCopy = storyLayerCopy(story, profile);

    elements.storyDetail.innerHTML = `
      <header class="s10-story-detail__toolbar">
        <button type="button" class="s10-back-button" data-s10-back-profile>← Back to ${escapeHtml(profile.name)}</button>
        <span class="s10-count-pill">Public profile story</span>
      </header>
      <div class="s10-story-detail__hero">
        ${storyCoverMarkup(story, "s10-story-detail__cover")}
        <div><span class="s10-kicker">${escapeHtml(story.creator || "Story")}</span><h3>${escapeHtml(story.title)}</h3><p>See how this reader organized the story into the layers that mattered to them.</p></div>
      </div>
      <div class="s10-story-layer-tabs" role="tablist" aria-label="Story layer">
        <button type="button" role="tab" data-s10-story-layer="reflection" aria-selected="true">Reflection</button>
        <button type="button" role="tab" data-s10-story-layer="quotes" aria-selected="false">Quotes</button>
        <button type="button" role="tab" data-s10-story-layer="characters" aria-selected="false">Characters</button>
        <button type="button" role="tab" data-s10-story-layer="thoughts" aria-selected="false">Thoughts</button>
      </div>
      <section class="s10-story-layer-content" data-s10-story-layer-content>
        ${layerContentMarkup("reflection", layerCopy)}
      </section>`;
    renderImages(elements.storyDetail);
    state.storyLayer = "reflection";
  }

  function setStoryLayer(layer, animate, source = "system") {
    const normalized = ["reflection", "quotes", "characters", "thoughts"].includes(layer) ? layer : "reflection";
    state.storyLayer = normalized;
    const storyTitle = q(".s10-story-detail__hero h3", elements.storyDetail)?.textContent || primaryStory.title;
    const copy = storyLayerCopy(getStoryByTitle(storyTitle), PROFILE_DATA[state.selectedProfile]);

    qa("[data-s10-story-layer]", elements.storyDetail).forEach((button) => {
      const selected = button.dataset.s10StoryLayer === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    const content = q("[data-s10-story-layer-content]", elements.storyDetail);
    if (!content) return;
    content.innerHTML = layerContentMarkup(normalized, copy);
    if (animate && gsap) {
      gsap.fromTo(content.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.04, ease: "power3.out" });
    }
    if (source === "user") announce(`${capitalize(normalized)} layer selected.`);
  }

  function openRankingDrawer(open) {
    const drawer = elements.rankingDrawer;
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    drawer.toggleAttribute("inert", !open);
    if (gsap) {
      gsap.to(drawer, { autoAlpha: open ? 1 : 0, x: open ? 0 : 28, duration: 0.34, ease: "power3.out", overwrite: "auto" });
    }
    if (open) elements.closeRanking?.focus({ preventScroll: true });
    else elements.openRanking?.focus({ preventScroll: true });
  }

  function toggleFollowing(key, animate) {
    if (state.following.has(key)) state.following.delete(key);
    else state.following.add(key);
    renderReaderProfile(key);
    if (animate && gsap) {
      const button = q("[data-s10-follow-reader]", elements.readerProfile);
      gsap.fromTo(button, { scale: 0.97 }, { scale: 1, duration: 0.24, ease: "back.out(1.5)" });
    }
    announce(state.following.has(key) ? `${PROFILE_DATA[key].name} added to Following.` : `${PROFILE_DATA[key].name} removed from Following.`);
  }

  async function hydrateDatabaseStories() {
    const loaded = await loadDatabaseStories();
    stories = mergeUniqueStories(loaded, FALLBACK_STORIES).slice(0, 24);
    primaryStory = findTokyoGhoulRe(stories) || FALLBACK_STORIES[0];
    stories = mergeUniqueStories([primaryStory], stories);
    applyPrimaryStory(primaryStory);
    renderOwnProfile();
    renderFollowingFeed();
    renderReaderResults();
    renderReaderProfile(state.selectedProfile);
    if (state.readerView === "story") renderStoryDetail(primaryStory.title);
    requestAnimationFrame(() => ScrollTrigger?.refresh?.());
  }

  async function loadDatabaseStories() {
    try {
      if (!window.supabase?.createClient) return [...FALLBACK_STORIES];
      if (!window.__INKWELL_SOCIAL_SUPABASE_CLIENT__) {
        window.__INKWELL_SOCIAL_SUPABASE_CLIENT__ = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      }
      supabaseClient = window.__INKWELL_SOCIAL_SUPABASE_CLIENT__;
      const result = await supabaseClient.from(TABLE_NAME).select("*").limit(200);
      if (result.error) throw result.error;

      const normalized = dedupeStories((result.data || []).map(normalizeStory).filter((story) => story.id && story.title));
      const selected = [];
      PREFERRED_STORY_TITLES.forEach((title) => {
        const match = findStoryByTitle(normalized, title);
        if (match && !selected.some((story) => story.id === match.id)) selected.push(match);
      });
      normalized.forEach((story) => {
        if (!selected.some((item) => item.id === story.id)) selected.push(story);
      });
      return selected;
    } catch (error) {
      console.warn("Inkwell social V10: database stories unavailable.", error);
      return [...FALLBACK_STORIES];
    }
  }

  function applyPrimaryStory(story) {
    const reflection = "Identity changes when memory, fear, and belonging pull a person in different directions.";
    elements.primaryStoryTitles.forEach((node) => setText(node, story.title));
    elements.primaryStoryFallbacks.forEach((node) => setText(node, abbreviateTitle(story.title)));
    setText(elements.composerReflection, reflection);
    setText(elements.sharedReflection, reflection);
    elements.storyImages.forEach((image) => setStoryImage(image, story));
  }

  function rankCardMarkup(story, index, context) {
    const hero = index === 0;
    const buttonAttrs = context === "reader"
      ? `type="button" data-s10-open-story="${escapeHtml(story.title)}" aria-label="Open ${escapeHtml(story.title)} from this profile"`
      : `type="button" aria-label="${escapeHtml(story.title)}, ranked number ${index + 1}"`;
    return `<button ${buttonAttrs} class="s10-rank-card ${hero ? "s10-rank-card--hero" : ""}">
      <span class="s10-rank-badge">#${index + 1}</span>
      ${storyCoverMarkup(story)}
      <span class="s10-rank-copy"><strong>${escapeHtml(story.title)}</strong><small>${hero ? "The story that represents this profile" : escapeHtml(story.creator || "Top story")}</small></span>
    </button>`;
  }

  function categoryMarkup(category, index) {
    return `<article class="s10-category-card" style="--category-index:${index}">
      <header><span class="s10-category-icon">${index + 1}</span><strong>${escapeHtml(category.title)}</strong></header>
      <ol>${category.items.map((item, itemIndex) => `<li><span>${itemIndex + 1}</span>${escapeHtml(item)}</li>`).join("")}</ol>
    </article>`;
  }

  function activityMarkup(item) {
    return `<article class="s10-activity-item"><span class="s10-activity-type">${escapeHtml(item.type)}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span><time>${escapeHtml(item.time)}</time></article>`;
  }

  function feedCardMarkup(item, index) {
    const profile = PROFILE_DATA[item.profile];
    const story = getStoryByTitle(item.story);
    return `<button type="button" class="s10-feed-card s10-feed-card--${index + 1}" data-s10-profile-key="${escapeHtml(item.profile)}" aria-label="Open ${escapeHtml(profile.name)} profile">
      <header><span class="s10-avatar s10-avatar--small" style="${avatarStyle(item.profile)}">${escapeHtml(profile.initial)}</span><span><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(item.type)}</small></span><time>${index + 1}h</time></header>
      <div class="s10-feed-card__story">${storyCoverMarkup(story)}<span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(story.title)}</small></span></div>
      <p>${escapeHtml(item.detail)}</p>
      <footer><span>${escapeHtml(profile.tags[0])}</span><span>Open profile →</span></footer>
    </button>`;
  }

  function readerResultMarkup(key, context) {
    const profile = PROFILE_DATA[key];
    const story = getStoryByTitle(profile.topStories[0]);
    return `<button type="button" class="s10-reader-result" data-s10-profile-key="${escapeHtml(key)}" aria-pressed="${state.selectedProfile === key}">
      <span class="s10-avatar" style="${avatarStyle(key)}">${escapeHtml(profile.initial)}</span>
      <span class="s10-reader-result__copy"><small>${escapeHtml(profile.label)}</small><strong>${escapeHtml(profile.name)}</strong><span>${escapeHtml(profile.match)}</span></span>
      <span class="s10-reader-result__top">${storyCoverMarkup(story)}<small>#1 story</small></span>
      <span class="s10-reader-result__category"><small>Signature category</small><strong>${escapeHtml(profile.signature)}</strong></span>
      <span class="s10-reader-result__action">${context === "search" ? "View result" : "Open profile"} →</span>
    </button>`;
  }

  function storyLayerCopy(story, profile) {
    return {
      reflection: {
        eyebrow: "Public reflection · spoiler protected",
        title: "Identity is not a fixed answer.",
        detail: `${profile.name} connects ${story.title} to memory, belonging, and the pressure to become what other people expect.`,
        meta: "486 words · 4 minute read",
      },
      quotes: {
        eyebrow: "Saved quotes",
        title: "Three lines, organized by why they mattered.",
        detail: "The profile shows short user notes about each saved line instead of exposing copyrighted passages in the homepage demo.",
        meta: "3 saved quotes · 2 private notes",
      },
      characters: {
        eyebrow: "Character layer",
        title: "Ken Kaneki is ranked #1 in Favourite protagonists.",
        detail: "The character card connects back to the reader’s custom ranking and the reflections where that choice is explained.",
        meta: "1 ranking · 6 notes · 4 moments",
      },
      thoughts: {
        eyebrow: "Thoughts over time",
        title: "A profile can keep changing after the story ends.",
        detail: "Recent edits show how rereads changed the reader’s interpretation without erasing the older notes.",
        meta: "Last edited 2 days ago",
      },
    };
  }

  function layerContentMarkup(layer, copy) {
    const item = copy[layer] || copy.reflection;
    return `<article class="s10-layer-card"><span class="s10-kicker">${escapeHtml(item.eyebrow)}</span><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.detail)}</p><footer>${escapeHtml(item.meta)}</footer></article>
      <aside class="s10-layer-context"><small>Connected profile data</small><strong>${layer === "characters" ? "Favourite protagonists" : layer === "quotes" ? "Saved quote collection" : layer === "thoughts" ? "Recent edits" : "Public activity"}</strong><p>Every layer returns to the story instead of becoming an isolated social post.</p></aside>`;
  }

  function storyCoverMarkup(story, extraClass = "") {
    return `<span class="s10-cover ${escapeHtml(extraClass)}" data-story-title="${escapeHtml(story.title)}"><img src="${escapeHtml(story.coverUrl || "")}" alt="${escapeHtml(story.title)} cover" ${story.coverUrl ? "" : "hidden"}><span>${escapeHtml(abbreviateTitle(story.title))}</span></span>`;
  }

  function renderImages(root) {
    qa(".s10-cover", root).forEach((cover) => {
      const story = getStoryByTitle(cover.dataset.storyTitle || "");
      const image = q("img", cover);
      const fallback = q("span:last-child", cover);
      if (fallback) fallback.textContent = abbreviateTitle(story.title);
      setStoryImage(image, story);
    });
  }

  function setStoryImage(image, story) {
    if (!image) return;
    if (!story?.coverUrl) {
      image.hidden = true;
      image.removeAttribute("src");
      return;
    }
    image.alt = `${story.title} cover`;
    image.hidden = false;
    image.src = story.coverUrl;
    image.addEventListener("error", () => { image.hidden = true; }, { once: true });
  }

  function getStoryByTitle(title) {
    return findStoryByTitle(stories, title) || findStoryByTitle(FALLBACK_STORIES, title) || primaryStory;
  }

  function normalizeStory(item) {
    const id = String(item?.id ?? "");
    return {
      id,
      title: String(item?.title || "Untitled story"),
      creator: String(item?.creator ?? item?.author ?? item?.writer ?? item?.artist ?? ""),
      coverUrl: id ? getCoverUrlFromId(id) : "",
    };
  }

  function getCoverUrlFromId(id) {
    if (!id || !supabaseClient) return "";
    const path = `${COVER_FOLDER}/${id}.jpg`;
    const { data } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data?.publicUrl || "";
  }

  function findTokyoGhoulRe(items) {
    return items.find((story) => {
      const title = normalizeText(story.title);
      return TOKYO_GHOUL_RE_ALIASES.some((alias) => title === normalizeText(alias));
    }) || items.find((story) => {
      const title = normalizeText(story.title);
      return title.includes("tokyo ghoul") && title.includes("re");
    });
  }

  function findStoryByTitle(items, title) {
    const wanted = normalizeText(title);
    return items.find((story) => normalizeText(story.title) === wanted)
      || items.find((story) => normalizeText(story.title).includes(wanted) || wanted.includes(normalizeText(story.title)));
  }

  function dedupeStories(items) {
    return mergeUniqueStories(items);
  }

  function mergeUniqueStories(...groups) {
    const map = new Map();
    groups.flat().filter(Boolean).forEach((story) => {
      const key = normalizeText(story.title);
      if (!key || map.has(key)) return;
      map.set(key, story);
    });
    return Array.from(map.values());
  }

  function avatarStyle(key) {
    const styles = {
      kai: "--avatar-a:#5270b8;--avatar-b:#745a90",
      mira: "--avatar-a:#6a5b99;--avatar-b:#914f7b",
      ren: "--avatar-a:#4f817b;--avatar-b:#4f638d",
      nova: "--avatar-a:#6f8cff;--avatar-b:#a17bff",
    };
    return styles[key] || styles.nova;
  }

  function handleRovingRadioKey(event, buttons, index, activate) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % buttons.length;
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = buttons.length - 1;
    const next = buttons[nextIndex];
    next?.focus({ preventScroll: true });
    activate(next);
  }

  function handleRovingTabKey(event, buttons, index) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = buttons.length - 1;
    buttons[nextIndex]?.focus({ preventScroll: true });
    buttons[nextIndex]?.click();
  }

  function getCopyState(key) {
    return elements.copyStates.find((copy) => copy.dataset.socialCopy === key) || null;
  }

  function getAnchorTransform(anchor) {
    if (!anchor || !elements.sharedPost || !elements.screen) return { x: 0, y: 0, scale: 1 };
    const anchorRect = anchor.getBoundingClientRect();
    const postRect = elements.sharedPost.getBoundingClientRect();
    const screenRect = elements.screen.getBoundingClientRect();
    const baseWidth = Math.max(1, elements.sharedPost.offsetWidth || postRect.width || 1);
    const targetWidth = Math.max(1, anchorRect.width || baseWidth);
    return {
      x: anchorRect.left - screenRect.left,
      y: anchorRect.top - screenRect.top,
      scale: targetWidth / baseWidth,
    };
  }

  function setupResizeRefresh() {
    if (!("ResizeObserver" in window) || !elements.screen) return;
    resizeObserver = new ResizeObserver(debounce(() => {
      refreshTimelineState();
      ScrollTrigger.refresh();
    }, 160));
    resizeObserver.observe(elements.screen);
  }

  function showStatic() {
    section.classList.add("is-social-static");
    Object.values(elements.scenes).forEach((scene) => {
      scene.style.opacity = "1";
      scene.style.visibility = "visible";
      scene.removeAttribute("inert");
    });
    elements.copyStates.forEach((copy) => {
      copy.style.opacity = copy.dataset.socialCopy === "control" ? "1" : "0";
      copy.style.visibility = copy.dataset.socialCopy === "control" ? "visible" : "hidden";
    });
    setActiveAct("control", true);
    renderAll(false, "restore");
  }

  function isNestedInManagedJourney() {
    return Boolean(MANAGED_BY_HOME_JOURNEY && timeline?.parent && timeline.parent !== gsap?.globalTimeline);
  }

  function resetTimelineState() {
    if (!timeline || !gsap) return;
    const nested = isNestedInManagedJourney();
    timeline.pause();
    timeline.totalTime(0, true);
    setInitialAnimationState();
    timeline.invalidate();
    timeline.totalTime(0, true);
    timeline.paused(!nested);
    syncTimelineState(true);
  }

  function refreshTimelineState() {
    if (!timeline || !gsap) return;
    const nested = isNestedInManagedJourney();
    const currentTime = clamp(timeline.time(), 0, timeline.duration());
    timeline.pause();
    timeline.totalTime(0, true);
    setInitialAnimationState();
    timeline.invalidate();
    timeline.time(currentTime, true);
    timeline.paused(!nested);
    syncTimelineState(true);
  }

  function resetInteractionState() {
    Object.keys(userLocks).forEach((key) => { userLocks[key] = false; });
    state.audience = "private";
    state.spoiler = false;
    state.shared = false;
    state.hubMode = "following";
    state.selectedProfile = "kai";
    state.readerView = "overview";
    state.storyLayer = "reflection";
    state.following.clear();
    state.searchQuery = "Tokyo Ghoul:re";
    state.searchFilter = "all";
    if (elements.searchInput) elements.searchInput.value = state.searchQuery;
    demoState.audience = "private";
    demoState.spoiler = false;
    demoState.hubMode = "following";
    demoState.readerView = "overview";
    lastDemoSignature = "";
    renderAll(false, "reset");
    syncTimelineState(true);
  }

  function publishApi() {
    const api = {
      section,
      timeline,
      trigger,
      reset: resetTimelineState,
      resetInteraction: resetInteractionState,
      refresh: refreshTimelineState,
      showStatic,
      getNavigationTime: () => OPENING_READY_TIME,
      getActTimes: () => ({ ...ACT_TIMES }),
      debug: () => ({
        build: window.__INKWELL_SOCIAL_CINEMA_BUILD__,
        managed: MANAGED_BY_HOME_JOURNEY,
        nested: isNestedInManagedJourney(),
        time: timeline?.time?.() || 0,
        duration: timeline?.duration?.() || 0,
        activeAct: state.activeAct,
        audience: state.audience,
        spoiler: state.spoiler,
        shared: state.shared,
        hubMode: state.hubMode,
        selectedProfile: state.selectedProfile,
        readerView: state.readerView,
        storyLayer: state.storyLayer,
        primaryStory: primaryStory.title,
        userLocks: { ...userLocks },
      }),
      destroy: () => {
        trigger?.kill?.(true);
        timeline?.kill?.();
        resizeObserver?.disconnect?.();
        cleanupCallbacks.splice(0).forEach((callback) => callback());
        window.__INKWELL_SOCIAL_V10_STARTED__ = false;
      },
      cleanup: () => trigger?.kill?.(true),
    };

    window.InkwellSection5Journey = api;
    window.InkwellSocialCinema = api;
    window.dispatchEvent(new CustomEvent("inkwell:section5-ready", { detail: api }));
    window.dispatchEvent(new CustomEvent("inkwell:social-cinema-ready", { detail: api }));
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function announce(message) {
    if (elements.status) elements.status.textContent = message;
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function abbreviateTitle(value) {
    const words = String(value || "Story").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
    return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase() || "ST";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function capitalize(value) {
    const text = String(value || "");
    return text ? text[0].toUpperCase() + text.slice(1) : "";
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function debounce(callback, wait) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(...args), wait);
    };
  }

  function getNavHeight() {
    const nav = document.querySelector("nav");
    return nav ? Math.max(0, Math.round(nav.getBoundingClientRect().height)) : 64;
  }
})();