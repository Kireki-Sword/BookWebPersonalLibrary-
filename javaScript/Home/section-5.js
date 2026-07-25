/* ============================================================================
   INKWELL — SECTION 5: SOCIAL, ON YOUR TERMS (V11 PRODUCT STORY)

   Homepage product story:
   1. Control — audience, spoilers, and a stable live preview.
   2. Identity — a real profile with Top Stories, custom rankings, stats,
      biography, tags, and recent activity.
   3. Social — a sequential full-frame journey through Following, For You,
      Search, a reader profile, their library, and one story's saved layers.

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
  if (!section || window.__INKWELL_SOCIAL_V11_STARTED__) return;

  window.__INKWELL_SOCIAL_V11_STARTED__ = true;
  window.__INKWELL_SOCIAL_CINEMA_BUILD__ =
    "2026-07-25-social-cinema-v11-sequential-social";

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
    identity: 4.12,
    socialTransition: 6.68,
    social: 7.44,
    end: 13.42,
  });

  const DEMO_THRESHOLDS = Object.freeze({
    followersEnter: 1.38,
    followersLeave: 1.16,
    publicEnter: 2.03,
    publicLeave: 1.78,
    spoilerEnter: 2.67,
    spoilerLeave: 2.4,
    forYouEnter: 8.36,
    forYouLeave: 8.08,
    searchEnter: 9.18,
    searchLeave: 8.9,
    profileEnter: 10.02,
    profileLeave: 9.72,
    libraryEnter: 10.88,
    libraryLeave: 10.58,
    storyEnter: 11.76,
    storyLeave: 11.46,
    layerEnter: 12.62,
    layerLeave: 12.34,
  });

  const SOCIAL_VIEW_ORDER = Object.freeze([
    "following",
    "foryou",
    "search",
    "profile",
    "library",
    "story",
  ]);

  const SOCIAL_VIEW_META = Object.freeze({
    following: { label: "Following activity", status: "Social · Following", step: "01 / 06" },
    foryou: { label: "Explainable recommendations", status: "Social · For You", step: "02 / 06" },
    search: { label: "Search readers by taste", status: "Social · Search", step: "03 / 06" },
    profile: { label: "Reader profile", status: "Social · Profile", step: "04 / 06" },
    library: { label: "Public story library", status: "Social · Library", step: "05 / 06" },
    story: { label: "Saved story layers", status: "Social · Story", step: "06 / 06" },
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
      stats: [["42", "stories"], ["18", "public reflections"], ["126", "following"]],
      topStories: ["Tokyo Ghoul:re", "Monster", "Vinland Saga", "Goodnight Punpun"],
      categories: [
        { title: "Favourite main characters", subtitle: "The leads I keep returning to", items: ["Ken Kaneki", "Kenzo Tenma", "Thorfinn", "Punpun Onodera"] },
        { title: "Favourite supporting cast", subtitle: "Characters who changed the whole story", items: ["Touka Kirishima", "Wolfgang Grimmer", "Askeladd", "Aiko Tanaka"] },
        { title: "Themes that define me", subtitle: "Ideas that connect my shelf", items: ["Identity", "Responsibility", "Memory", "Belonging"] },
      ],
      activity: [
        { type: "Ranking", title: "Favourite main characters", detail: "Moved Ken Kaneki to #1", time: "Now" },
        { type: "Reflection", title: "Tokyo Ghoul:re", detail: "Published with spoiler protection", time: "2d" },
        { type: "Category", title: "Themes that define me", detail: "Added belonging", time: "5d" },
      ],
    },
    kai: {
      initial: "K",
      name: "kai.reads",
      label: "Character-first reader",
      bio: "Remembers the feeling before the theory.",
      tags: ["Character studies", "Moral choices", "Identity"],
      stats: [["58", "stories"], ["31", "public reflections"], ["214", "following"]],
      topStories: ["Tokyo Ghoul:re", "Fullmetal Alchemist", "20th Century Boys", "Monster"],
      categories: [
        { title: "Favourite protagonists", subtitle: "Characters whose choices define the story", items: ["Ken Kaneki", "Edward Elric", "Kenji Endo", "Kenzo Tenma"] },
        { title: "Hardest moral choices", subtitle: "Decisions I still argue with", items: ["Choosing mercy", "Accepting responsibility", "Protecting a lie", "Starting again"] },
      ],
      signature: "Favourite protagonists",
      signatureItems: ["Ken Kaneki", "Edward Elric", "Kenji Endo"],
      match: "You both rank Tokyo Ghoul:re highly and write about identity, sacrifice, and difficult choices.",
      difference: "Kai writes from a character-first perspective; your notes focus more on responsibility and systems.",
      sharedThemes: ["Identity", "Sacrifice", "Choice"],
      activity: [
        { type: "Ranking", title: "Favourite protagonists", detail: "Moved Ken Kaneki to #1", time: "1h" },
        { type: "Quote", title: "Fullmetal Alchemist", detail: "Saved a line with a private note", time: "1d" },
        { type: "Reflection", title: "Tokyo Ghoul:re", detail: "Revised after a reread", time: "3d" },
      ],
      library: [
        { title: "Tokyo Ghoul:re", creator: "Sui Ishida", format: "Manga", status: "Completed", score: "9.8", layers: ["Quotes", "Moments", "Characters", "Notes", "Thoughts"] },
        { title: "Fullmetal Alchemist", creator: "Hiromu Arakawa", format: "Manga", status: "Completed", score: "9.5", layers: ["Quotes", "Characters", "Notes", "Thoughts"] },
        { title: "20th Century Boys", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.3", layers: ["Moments", "Characters", "Notes", "Thoughts"] },
        { title: "Monster", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.2", layers: ["Quotes", "Characters", "Notes"] },
      ],
    },
    mira: {
      initial: "M",
      name: "mira.frames",
      label: "Visual-story reader",
      bio: "Collects quiet scenes, visual rhythm, and endings that refuse closure.",
      tags: ["Visual storytelling", "Memory", "Grief"],
      stats: [["37", "stories"], ["44", "saved moments"], ["189", "following"]],
      topStories: ["Goodnight Punpun", "Monster", "Vinland Saga", "Berserk"],
      categories: [
        { title: "Unforgettable scenes", subtitle: "Images that carry the whole feeling", items: ["Silent reunions", "Broken skylines", "Final-page echoes", "Wordless departures"] },
        { title: "Favourite visual motifs", subtitle: "Details I notice on every reread", items: ["Empty rooms", "Distant lights", "Crowded frames", "Weather as memory"] },
      ],
      signature: "Unforgettable scenes",
      signatureItems: ["Silent reunions", "Broken skylines", "Final-page echoes"],
      match: "You both save visual moments where memory and grief say more than dialogue.",
      difference: "Mira publishes short scene notes; your profile leans toward long-form reflection and rankings.",
      sharedThemes: ["Memory", "Grief", "Perspective"],
      activity: [
        { type: "Moment", title: "Goodnight Punpun", detail: "Added a new visual note", time: "2h" },
        { type: "Category", title: "Unforgettable scenes", detail: "Reordered the top three", time: "2d" },
        { type: "Thought", title: "Vinland Saga", detail: "Added a note about silence", time: "4d" },
      ],
      library: [
        { title: "Goodnight Punpun", creator: "Inio Asano", format: "Manga", status: "Completed", score: "9.7", layers: ["Moments", "Characters", "Notes", "Thoughts"] },
        { title: "Monster", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.4", layers: ["Moments", "Characters", "Notes"] },
        { title: "Vinland Saga", creator: "Makoto Yukimura", format: "Manga", status: "Reading", score: "9.2", layers: ["Quotes", "Moments", "Thoughts"] },
        { title: "Berserk", creator: "Kentaro Miura", format: "Manga", status: "Reading", score: "9.1", layers: ["Moments", "Characters", "Notes"] },
      ],
    },
    ren: {
      initial: "R",
      name: "ren.afterwords",
      label: "Ideas-first reader",
      bio: "Writes long reflections about history, responsibility, and inherited conflict.",
      tags: ["History", "Responsibility", "Long-form"],
      stats: [["64", "stories"], ["27", "long reflections"], ["302", "following"]],
      topStories: ["Monster", "20th Century Boys", "Tokyo Ghoul:re", "Berserk"],
      categories: [
        { title: "Best-written conflicts", subtitle: "Opposing ideas that reshape everyone involved", items: ["Tenma and Johan", "Friend's legacy", "Kaneki's identity", "Guts and Griffith"] },
        { title: "Stories about responsibility", subtitle: "What people inherit and what they choose", items: ["Monster", "20th Century Boys", "Vinland Saga", "Fullmetal Alchemist"] },
      ],
      signature: "Best-written conflicts",
      signatureItems: ["Tenma and Johan", "Friend's legacy", "Kaneki's identity"],
      match: "You share recurring themes of identity, history, responsibility, and inherited conflict.",
      difference: "Ren is more analytical and historical; your profile gives more space to personal attachment.",
      sharedThemes: ["History", "Responsibility", "Identity"],
      activity: [
        { type: "Reflection", title: "Monster", detail: "Published a long-form essay", time: "5h" },
        { type: "Thought", title: "20th Century Boys", detail: "Edited a note on inherited myths", time: "2d" },
        { type: "Ranking", title: "Best-written conflicts", detail: "Added Kaneki's identity", time: "6d" },
      ],
      library: [
        { title: "Monster", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.9", layers: ["Quotes", "Characters", "Notes", "Thoughts"] },
        { title: "20th Century Boys", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.6", layers: ["Quotes", "Moments", "Characters", "Thoughts"] },
        { title: "Tokyo Ghoul:re", creator: "Sui Ishida", format: "Manga", status: "Completed", score: "9.2", layers: ["Characters", "Notes", "Thoughts"] },
        { title: "Berserk", creator: "Kentaro Miura", format: "Manga", status: "Reading", score: "9.1", layers: ["Moments", "Characters", "Notes"] },
      ],
    },
  });

  const FEED_ITEMS = Object.freeze([
    { profile: "kai", type: "Ranking updated", title: "Favourite protagonists", detail: "Ken Kaneki moved to #1", story: "Tokyo Ghoul:re", time: "1h" },
    { profile: "mira", type: "New moment", title: "A scene worth keeping", detail: "Added a visual note about memory", story: "Goodnight Punpun", time: "2h" },
    { profile: "ren", type: "New reflection", title: "Responsibility after violence", detail: "Published a long-form reflection", story: "Monster", time: "5h" },
    { profile: "kai", type: "New quote", title: "Saved from a recent reread", detail: "Added a private note", story: "Fullmetal Alchemist", time: "1d" },
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
    socialView: "following",
    returnView: "following",
    selectedProfile: "kai",
    selectedStory: "Tokyo Ghoul:re",
    storyLayer: "quotes",
    profileCategory: 0,
    following: new Set(),
    searchQuery: "Tokyo Ghoul:re",
    searchFilter: "all",
  };

  const demoState = {
    audience: "private",
    spoiler: false,
    socialView: "following",
    storyLayer: "quotes",
  };

  const userLocks = {
    audience: false,
    spoiler: false,
    share: false,
    socialView: false,
    profile: false,
    storyLayer: false,
    search: false,
    profileCategory: false,
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
        <span class="social-copy-state__index">02 · Turn a library into identity</span>
        <h2>Make your taste feel unmistakably yours.</h2>
        <p>Lead with the stories that define you, build personal ranking categories, and let recent activity show how your perspective keeps changing.</p>
        <div class="social-copy-proof" aria-label="Profile features">
          <span>Top 10</span><span>Custom showcases</span><span>Recent activity</span>
        </div>`;
    }

    if (discoveryCopy) {
      discoveryCopy.dataset.socialCopy = "social";
      discoveryCopy.innerHTML = `
        <span class="social-copy-state__index">03 · Follow the trail from person to story</span>
        <h2>A social feed that leads somewhere.</h2>
        <p>Move from Following to For You and Search, open one reader, browse their public library, then enter the story layers that made the match meaningful.</p>
        <div class="social-copy-proof" aria-label="Social features">
          <span>Following</span><span>For You</span><span>Profile to story</span>
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
      principle.textContent = "Every social action returns to a reader, a ranking, or a story layer.";
    }

    const identityScene = q('[data-social-scene="identity"]');
    if (identityScene) identityScene.innerHTML = identityMarkup();

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
      <article class="s11-profile" data-s11-profile>
        <header class="s11-profile__hero">
          <div class="s11-profile__banner" aria-hidden="true"><span>perspective</span></div>
          <div class="s11-profile__identity">
            <div class="s11-avatar s11-avatar--large" data-s11-own-avatar>N</div>
            <div class="s11-profile__copy">
              <span class="s11-kicker">Your public profile</span>
              <h3>nova.pages</h3>
              <p data-s11-own-bio></p>
              <div class="s11-tag-row" data-s11-own-tags></div>
            </div>
            <button type="button" class="s11-secondary-button" data-s11-edit-profile>Edit profile</button>
          </div>
          <div class="s11-stats" data-s11-own-stats></div>
        </header>

        <div class="s11-profile__body">
          <section class="s11-top-stories" aria-labelledby="s11-top-stories-title">
            <div class="s11-section-heading">
              <span><small>Taste at a glance</small><strong id="s11-top-stories-title">The stories that define me</strong></span>
              <button type="button" class="s11-text-button" data-s11-open-ranking>View full Top 10</button>
            </div>
            <div class="s11-ranking-showcase" data-s11-own-ranking></div>
          </section>

          <aside class="s11-profile__side">
            <section class="s11-category-section" aria-labelledby="s11-categories-title">
              <div class="s11-section-heading s11-section-heading--compact">
                <span><small>Curated by you</small><strong id="s11-categories-title">Custom profile showcases</strong></span>
                <span class="s11-count-pill">3 categories</span>
              </div>
              <div class="s11-category-tabs" role="tablist" aria-label="Profile showcase category" data-s11-own-category-tabs></div>
              <div class="s11-category-detail" data-s11-own-category-detail></div>
            </section>

            <section class="s11-activity-section" aria-labelledby="s11-activity-title">
              <div class="s11-section-heading s11-section-heading--compact">
                <span><small>What changed</small><strong id="s11-activity-title">Recent activity</strong></span>
              </div>
              <div class="s11-activity-list" data-s11-own-activity></div>
            </section>
          </aside>
        </div>

        <section class="s11-ranking-drawer" data-s11-ranking-drawer aria-hidden="true" inert>
          <header>
            <span><small>nova.pages</small><strong>Full Top 10</strong></span>
            <button type="button" class="s11-icon-button" data-s11-close-ranking aria-label="Close full ranking">×</button>
          </header>
          <ol data-s11-full-ranking></ol>
        </section>
      </article>`;
  }


  function socialMarkup() {
    return `
      <section class="s11-social-stage" data-s11-social-stage aria-label="Social product journey">
        <header class="s11-social-stage__header">
          <span class="s11-social-stage__brand"><small>Inkwell social</small><strong data-s11-social-view-title>Following activity</strong></span>
          <div class="s11-social-tabs" role="tablist" aria-label="Social view">
            <button type="button" role="tab" data-s11-social-tab="following" aria-selected="true">Following</button>
            <button type="button" role="tab" data-s11-social-tab="foryou" aria-selected="false">For You</button>
            <button type="button" role="tab" data-s11-social-tab="search" aria-selected="false">Search</button>
          </div>
          <span class="s11-social-stage__progress" data-s11-social-progress>01 / 06</span>
        </header>

        <div class="s11-social-viewport" data-s11-social-viewport>
          <section class="s11-social-view is-active" data-s11-social-view="following" role="tabpanel" aria-label="Following activity">
            <header class="s11-view-heading">
              <span><small>Latest from people you chose</small><strong>Following</strong><p>New rankings, quotes, moments, reflections, and story updates stay connected to the profile that created them.</p></span>
              <span class="s11-count-pill">4 updates</span>
            </header>
            <div class="s11-following-layout">
              <div data-s11-following-featured></div>
              <div class="s11-following-grid" data-s11-following-grid></div>
            </div>
          </section>

          <section class="s11-social-view" data-s11-social-view="foryou" role="tabpanel" aria-label="For You recommendations" aria-hidden="true" inert>
            <header class="s11-view-heading">
              <span><small>Recommended with context</small><strong>For You</strong><p>Each recommendation explains shared taste and shows one reason the reader is still different enough to be interesting.</p></span>
              <span class="s11-count-pill">3 explainable matches</span>
            </header>
            <div class="s11-recommendation-grid" data-s11-for-you-results></div>
          </section>

          <section class="s11-social-view" data-s11-social-view="search" role="tabpanel" aria-label="Search readers" aria-hidden="true" inert>
            <header class="s11-view-heading s11-view-heading--search">
              <span><small>Find a specific kind of reader</small><strong>Search people through what they save and rank</strong></span>
              <span class="s11-count-pill">Explainable filters</span>
            </header>
            <div class="s11-search-workspace">
              <div class="s11-search-box">
                <label for="s11-reader-search">Search username, story, theme, tag, or ranking category</label>
                <div class="s11-search-input-shell"><span aria-hidden="true">⌕</span><input id="s11-reader-search" data-s11-search-input type="search" value="Tokyo Ghoul:re" autocomplete="off"></div>
                <div class="s11-search-suggestions" aria-label="Suggested searches">
                  <button type="button" data-s11-search-suggestion="Tokyo Ghoul:re">Tokyo Ghoul:re</button>
                  <button type="button" data-s11-search-suggestion="Favourite protagonists">Favourite protagonists</button>
                  <button type="button" data-s11-search-suggestion="Identity">Identity</button>
                </div>
              </div>
              <div class="s11-search-filters" role="radiogroup" aria-label="Search field">
                <button type="button" role="radio" data-s11-search-filter="all" aria-checked="true">All</button>
                <button type="button" role="radio" data-s11-search-filter="people" aria-checked="false">Username</button>
                <button type="button" role="radio" data-s11-search-filter="stories" aria-checked="false">Story</button>
                <button type="button" role="radio" data-s11-search-filter="themes" aria-checked="false">Theme</button>
                <button type="button" role="radio" data-s11-search-filter="tags" aria-checked="false">Tag</button>
                <button type="button" role="radio" data-s11-search-filter="rankings" aria-checked="false">Ranking</button>
              </div>
            </div>
            <div class="s11-search-summary" data-s11-search-summary></div>
            <div class="s11-search-result-grid" data-s11-search-results></div>
          </section>

          <section class="s11-social-view" data-s11-social-view="profile" aria-label="Selected reader profile" aria-hidden="true" inert data-s11-reader-profile></section>
          <section class="s11-social-view" data-s11-social-view="library" aria-label="Selected reader library" aria-hidden="true" inert data-s11-reader-library></section>
          <section class="s11-social-view" data-s11-social-view="story" aria-label="Selected story layers" aria-hidden="true" inert data-s11-story-detail></section>
        </div>
      </section>`;
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

      profile: q("[data-s11-profile]"),
      ownAvatar: q("[data-s11-own-avatar]"),
      ownBio: q("[data-s11-own-bio]"),
      ownTags: q("[data-s11-own-tags]"),
      ownStats: q("[data-s11-own-stats]"),
      ownRanking: q("[data-s11-own-ranking]"),
      ownCategoryTabs: q("[data-s11-own-category-tabs]"),
      ownCategoryDetail: q("[data-s11-own-category-detail]"),
      ownActivity: q("[data-s11-own-activity]"),
      openRanking: q("[data-s11-open-ranking]"),
      closeRanking: q("[data-s11-close-ranking]"),
      rankingDrawer: q("[data-s11-ranking-drawer]"),
      fullRanking: q("[data-s11-full-ranking]"),
      editProfile: q("[data-s11-edit-profile]"),

      socialStage: q("[data-s11-social-stage]"),
      socialViewport: q("[data-s11-social-viewport]"),
      socialViewTitle: q("[data-s11-social-view-title]"),
      socialProgress: q("[data-s11-social-progress]"),
      socialTabs: qa("[data-s11-social-tab]"),
      socialViews: qa("[data-s11-social-view]"),
      followingFeatured: q("[data-s11-following-featured]"),
      followingGrid: q("[data-s11-following-grid]"),
      forYouResults: q("[data-s11-for-you-results]"),
      searchResults: q("[data-s11-search-results]"),
      searchInput: q("[data-s11-search-input]"),
      searchFilters: qa("[data-s11-search-filter]"),
      searchSummary: q("[data-s11-search-summary]"),
      readerProfile: q("[data-s11-reader-profile]"),
      readerLibrary: q("[data-s11-reader-library]"),
      storyDetail: q("[data-s11-story-detail]"),
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
      if (target.matches("[data-s11-social-tab], [data-s11-back-social], [data-s11-open-library], [data-s11-open-story]")) userLocks.socialView = true;
      if (target.closest("[data-s11-profile-key]")) {
        userLocks.profile = true;
        userLocks.socialView = true;
      }
      if (target.matches("[data-s11-story-layer]")) userLocks.storyLayer = true;
      if (target.matches("[data-s11-search-input], [data-s11-search-filter], [data-s11-search-suggestion]")) userLocks.search = true;
      if (target.matches("[data-s11-profile-category]")) userLocks.profileCategory = true;
    }, { capture: true, passive: true });

    elements.audienceButtons.forEach((button, index) => {
      listen(button, "click", () => renderAudience(button.dataset.socialAudience || "private", true, "user"));
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
      elements.profile.classList.toggle("is-editing-preview", active);
      elements.editProfile.textContent = active ? "Save preview" : "Edit profile";
      announce(active ? "Profile editing preview enabled." : "Profile preview saved.");
    });

    listen(elements.ownCategoryTabs, "click", (event) => {
      const button = event.target.closest("[data-s11-profile-category]");
      if (button) setProfileCategory(Number(button.dataset.s11ProfileCategory || 0), true, "user");
    });
    listen(elements.ownCategoryTabs, "keydown", (event) => {
      const button = event.target.closest("[data-s11-profile-category]");
      if (!button) return;
      const buttons = qa("[data-s11-profile-category]", elements.ownCategoryTabs);
      handleRovingTabKey(event, buttons, buttons.indexOf(button));
    });

    elements.socialTabs.forEach((button, index) => {
      listen(button, "click", () => setSocialView(button.dataset.s11SocialTab || "following", true, "user"));
      listen(button, "keydown", (event) => handleRovingTabKey(event, elements.socialTabs, index));
    });

    listen(elements.searchInput, "input", debounce(() => {
      state.searchQuery = elements.searchInput.value.trim();
      renderSearchResults(true);
    }, 120));

    elements.searchFilters.forEach((button, index) => {
      listen(button, "click", () => {
        state.searchFilter = button.dataset.s11SearchFilter || "all";
        renderSearchResults(true);
      });
      listen(button, "keydown", (event) => handleRovingRadioKey(event, elements.searchFilters, index, (next) => next.click()));
    });

    listen(elements.socialStage, "click", handleSocialStageClick);
    listen(elements.socialStage, "keydown", handleSocialStageKeydown);

    listen(document, "keydown", (event) => {
      if (event.key !== "Escape") return;
      if (elements.rankingDrawer?.classList.contains("is-open")) openRankingDrawer(false);
      else if (state.socialView === "story") setSocialView("library", true, "user");
      else if (state.socialView === "library") setSocialView("profile", true, "user");
      else if (state.socialView === "profile") setSocialView(state.returnView, true, "user");
    });
  }


  function handleProfileDelegation(event) {
    const card = event.target.closest("[data-s11-profile-key]");
    if (!card) return;
    openReaderProfile(card.dataset.s11ProfileKey || "kai", true, "user");
  }


  function handleReaderProfileClick(event) {
    handleSocialStageClick(event);
  }


  function handleStoryDetailClick(event) {
    handleSocialStageClick(event);
  }

  function handleSocialStageClick(event) {
    const suggestion = event.target.closest("[data-s11-search-suggestion]");
    if (suggestion) {
      const value = suggestion.dataset.s11SearchSuggestion || "";
      state.searchQuery = value;
      if (elements.searchInput) elements.searchInput.value = value;
      renderSearchResults(true);
      return;
    }

    const profileCard = event.target.closest("[data-s11-profile-key]");
    if (profileCard) {
      openReaderProfile(profileCard.dataset.s11ProfileKey || "kai", true, "user");
      return;
    }

    const follow = event.target.closest("[data-s11-follow-reader]");
    if (follow) {
      toggleFollowing(follow.dataset.s11FollowReader || state.selectedProfile, true);
      return;
    }

    const openLibrary = event.target.closest("[data-s11-open-library]");
    if (openLibrary) {
      renderReaderLibrary(state.selectedProfile);
      setSocialView("library", true, "user");
      return;
    }

    const openStory = event.target.closest("[data-s11-open-story]");
    if (openStory) {
      const title = openStory.dataset.s11OpenStory || primaryStory.title;
      state.selectedStory = title;
      renderStoryDetail(title);
      setSocialView("story", true, "user");
      return;
    }

    const back = event.target.closest("[data-s11-back-social]");
    if (back) {
      setSocialView(back.dataset.s11BackSocial || "following", true, "user");
      return;
    }

    const layer = event.target.closest("[data-s11-story-layer]");
    if (layer) setStoryLayer(layer.dataset.s11StoryLayer || "quotes", true, "user");
  }

  function handleSocialStageKeydown(event) {
    const layer = event.target.closest("[data-s11-story-layer]");
    if (layer) {
      const buttons = qa("[data-s11-story-layer]", elements.storyDetail);
      handleRovingTabKey(event, buttons, buttons.indexOf(layer));
      return;
    }

    const filter = event.target.closest("[data-s11-search-filter]");
    if (filter) {
      const buttons = elements.searchFilters;
      handleRovingRadioKey(event, buttons, buttons.indexOf(filter), (next) => next.click());
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
      autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.04, ease: "power3.out",
    }, 0);
    timeline.to(elements.scenes.control, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.08);
    timeline.to([elements.composer, elements.livePreview], {
      autoAlpha: 1, y: 0, scale: 1, duration: 0.58, stagger: 0.07, ease: "power3.out",
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
    timeline.to([elements.composer, elements.livePreview, elements.sharedPost], { autoAlpha: 0, y: -18, scale: 0.982, duration: 0.42, ease: "power2.inOut" }, "identity-transition");
    timeline.set(elements.scenes.identity, { visibility: "visible" }, "identity-transition+=0.06");
    timeline.to(elements.scenes.identity, { autoAlpha: 1, duration: 0.34, ease: "power2.out" }, "identity-transition+=0.08");
    timeline.fromTo(elements.profile, { autoAlpha: 0, y: 22, scale: 0.984 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.62, ease: "power3.out" }, "identity-transition+=0.12");
    timeline.to(elements.scenes.control, { autoAlpha: 0, duration: 0.22 }, "identity-transition+=0.26");

    timeline.addLabel("identity", ACT_TIMES.identity);
    timeline.fromTo(qa(".s11-profile__identity > *, .s11-stat", elements.profile), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.035, ease: "power3.out" }, "identity");
    timeline.fromTo(qa(".s11-rank-card", elements.profile), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.055, ease: "power3.out" }, "identity+=0.28");
    timeline.fromTo(qa(".s11-category-tab, .s11-category-detail", elements.profile), { autoAlpha: 0, x: 12 }, { autoAlpha: 1, x: 0, duration: 0.36, stagger: 0.05, ease: "power3.out" }, "identity+=0.54");
    timeline.fromTo(qa(".s11-activity-item", elements.profile), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.05, ease: "power3.out" }, "identity+=0.76");

    timeline.addLabel("social-transition", ACT_TIMES.socialTransition);
    timeline.to(identityCopy, { autoAlpha: 0, y: -16, duration: 0.34, ease: "power2.inOut" }, "social-transition");
    timeline.fromTo(socialCopy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.46, ease: "power3.out" }, "social-transition+=0.12");
    timeline.to(elements.profile, { autoAlpha: 0, x: -28, scale: 0.984, duration: 0.46, ease: "power2.inOut" }, "social-transition");
    timeline.set(elements.scenes.social, { visibility: "visible" }, "social-transition+=0.06");
    timeline.to(elements.scenes.social, { autoAlpha: 1, duration: 0.34, ease: "power2.out" }, "social-transition+=0.08");
    timeline.fromTo(elements.socialStage, { autoAlpha: 0, y: 20, scale: 0.986 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: "power3.out" }, "social-transition+=0.12");
    timeline.to(elements.scenes.identity, { autoAlpha: 0, duration: 0.22 }, "social-transition+=0.26");

    timeline.addLabel("social", ACT_TIMES.social);
    timeline.fromTo(qa(".s11-following-feature, .s11-feed-card", elements.socialStage), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.055, ease: "power3.out" }, "social+=0.1");
    timeline.to({}, { duration: ACT_TIMES.end - ACT_TIMES.social }, "social");
    timeline.addLabel("section-end", ACT_TIMES.end);

    if (MANAGED_BY_HOME_JOURNEY) {
      timeline.pause(0);
      return;
    }

    trigger = ScrollTrigger.create({
      id: "inkwell-social-cinema-v11",
      trigger: section,
      animation: timeline,
      pin: elements.pin,
      pinSpacing: true,
      start: () => `top top+=${getNavHeight()}`,
      end: () => `+=${Math.max(7600, window.innerHeight * 8.2)}`,
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

    gsap.set(elements.profile, { autoAlpha: 0, x: 0, y: 22, scale: 0.984 });
    gsap.set(elements.socialStage, { autoAlpha: 0, y: 20, scale: 0.986 });
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

    const currentIndex = SOCIAL_VIEW_ORDER.indexOf(demoState.socialView);
    if (time <= DEMO_THRESHOLDS.forYouLeave) demoState.socialView = "following";
    else if (time >= DEMO_THRESHOLDS.storyEnter) demoState.socialView = "story";
    else if (time >= DEMO_THRESHOLDS.libraryEnter) demoState.socialView = "library";
    else if (time >= DEMO_THRESHOLDS.profileEnter) demoState.socialView = "profile";
    else if (time >= DEMO_THRESHOLDS.searchEnter) demoState.socialView = "search";
    else if (time >= DEMO_THRESHOLDS.forYouEnter) demoState.socialView = "foryou";
    else if (currentIndex > 0 && time <= DEMO_THRESHOLDS.forYouLeave) demoState.socialView = "following";

    if (demoState.socialView === "story") {
      if (time >= DEMO_THRESHOLDS.layerEnter) demoState.storyLayer = "characters";
      else if (time <= DEMO_THRESHOLDS.layerLeave) demoState.storyLayer = "quotes";
    } else {
      demoState.storyLayer = "quotes";
    }

    const signature = JSON.stringify(demoState);
    if (!force && signature === lastDemoSignature) return;
    lastDemoSignature = signature;

    if (!userLocks.audience) renderAudience(demoState.audience, true, "demo");
    if (!userLocks.spoiler) renderSpoiler(demoState.spoiler, true, "demo");

    if (state.activeAct === "social" && !userLocks.socialView) {
      if (["profile", "library", "story"].includes(demoState.socialView) && !userLocks.profile) selectProfile("kai", false, "demo");
      if (demoState.socialView === "profile") renderReaderProfile("kai");
      if (demoState.socialView === "library") renderReaderLibrary("kai");
      if (demoState.socialView === "story") {
        state.selectedStory = primaryStory.title;
        renderStoryDetail(primaryStory.title);
      }
      setSocialView(demoState.socialView, true, "demo");
    }

    if (state.activeAct === "social" && demoState.socialView === "story" && !userLocks.storyLayer) {
      setStoryLayer(demoState.storyLayer, true, "demo");
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
    if (key === "social") updateSocialChrome(state.socialView);
    announce(meta.announcement);
  }

  function renderAll(animate, source) {
    renderAudience(state.audience, animate, source);
    renderSpoiler(state.spoiler, animate, source);
    renderShared(state.shared, animate);
    renderOwnProfile();
    renderFollowingFeed();
    renderReaderResults();
    selectProfile(state.selectedProfile, false, source);
    renderReaderProfile(state.selectedProfile);
    renderReaderLibrary(state.selectedProfile);
    renderStoryDetail(state.selectedStory || primaryStory.title);
    setSocialView(state.socialView, animate, source);
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

    elements.ownTags.innerHTML = profile.tags.map((tag) => `<span class="s11-tag">${escapeHtml(tag)}</span>`).join("");
    elements.ownStats.innerHTML = profile.stats.map(([value, label]) => `<div class="s11-stat"><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></div>`).join("");

    const rankingStories = profile.topStories.map(getStoryByTitle);
    elements.ownRanking.innerHTML = rankingStories.map((story, index) => rankCardMarkup(story, index, "own")).join("");
    renderImages(elements.ownRanking);

    elements.ownCategoryTabs.innerHTML = profile.categories.map((category, index) => `<button type="button" role="tab" class="s11-category-tab" data-s11-profile-category="${index}" aria-selected="${index === state.profileCategory}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(category.title)}</button>`).join("");
    setProfileCategory(state.profileCategory, false, "restore");
    elements.ownActivity.innerHTML = profile.activity.slice(0, 2).map(activityMarkup).join("");

    const full = mergeUniqueStories(rankingStories, stories).slice(0, 10);
    elements.fullRanking.innerHTML = full.map((story, index) => `<li><span class="s11-ranking-number">${String(index + 1).padStart(2, "0")}</span>${storyCoverMarkup(story)}<span><strong>${escapeHtml(story.title)}</strong><small>${escapeHtml(story.creator || "Story")}</small></span></li>`).join("");
    renderImages(elements.fullRanking);
  }

  function setProfileCategory(index, animate, source = "system") {
    const profile = PROFILE_DATA.nova;
    const normalized = clamp(Math.round(index), 0, profile.categories.length - 1);
    state.profileCategory = normalized;
    const category = profile.categories[normalized];

    qa("[data-s11-profile-category]", elements.ownCategoryTabs).forEach((button, buttonIndex) => {
      const selected = buttonIndex === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    elements.ownCategoryDetail.innerHTML = `<article><header><span class="s11-category-number">${String(normalized + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(category.title)}</strong><small>${escapeHtml(category.subtitle)}</small></span></header><ol>${category.items.map((item, itemIndex) => `<li><span>${itemIndex + 1}</span><strong>${escapeHtml(item)}</strong></li>`).join("")}</ol></article>`;
    if (animate && gsap) gsap.fromTo(elements.ownCategoryDetail.children, { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power3.out" });
    if (source === "user") announce(`${category.title} showcase selected.`);
  }


  function renderFollowingFeed() {
    const [featured, ...rest] = FEED_ITEMS;
    elements.followingFeatured.innerHTML = featuredFeedMarkup(featured);
    elements.followingGrid.innerHTML = rest.map((item, index) => feedCardMarkup(item, index + 1)).join("");
    renderImages(elements.followingFeatured);
    renderImages(elements.followingGrid);
  }


  function renderReaderResults() {
    const keys = ["kai", "mira", "ren"];
    elements.forYouResults.innerHTML = keys.map((key, index) => recommendationCardMarkup(key, index)).join("");
    renderImages(elements.forYouResults);
    renderSearchResults(false);
  }


  function renderSearchResults(animate) {
    const query = normalizeText(state.searchQuery);
    const tokens = query.split(/\s+/).filter(Boolean);
    const filter = state.searchFilter;
    const keys = ["kai", "mira", "ren"];

    const scored = keys.map((key) => {
      const profile = PROFILE_DATA[key];
      const groups = {
        people: [profile.name, profile.label, profile.bio],
        stories: profile.topStories,
        themes: profile.sharedThemes,
        tags: profile.tags,
        rankings: [profile.signature, ...profile.signatureItems, ...profile.categories.flatMap((category) => [category.title, ...category.items])],
      };
      const values = filter === "all" ? Object.values(groups).flat() : (groups[filter] || []);
      const normalizedValues = values.map(normalizeText);
      let score = 0;
      tokens.forEach((token) => normalizedValues.forEach((value) => {
        if (value === token) score += 5;
        else if (value.startsWith(token)) score += 3;
        else if (value.includes(token)) score += 1;
      }));
      if (!tokens.length) score = 1;
      return { key, score, reason: searchReason(profile, filter, tokens) };
    }).sort((a, b) => b.score - a.score);

    const matched = scored.filter((item) => item.score > 0);
    const results = matched.length ? matched : scored;

    elements.searchFilters.forEach((button) => {
      const selected = button.dataset.s11SearchFilter === filter;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    elements.searchResults.innerHTML = results.map((item) => searchResultMarkup(item.key, item.reason)).join("");
    renderImages(elements.searchResults);
    setText(elements.searchSummary, matched.length
      ? `${matched.length} reader${matched.length === 1 ? "" : "s"} matched through ${searchFilterLabel(filter)} for “${state.searchQuery || "all taste"}”`
      : `No exact ${searchFilterLabel(filter)} match. Showing the closest readers by shared taste.`);

    if (animate && gsap) gsap.fromTo(qa(".s11-search-result", elements.searchResults), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.045, ease: "power3.out" });
  }


  function setHubMode(mode, animate, source = "system") {
    setSocialView(mode, animate, source);
  }

  function setSocialView(view, animate, source = "system") {
    const normalized = SOCIAL_VIEW_ORDER.includes(view) ? view : "following";
    const previous = state.socialView;
    if (previous === normalized && source !== "restore" && source !== "demo") {
      updateSocialChrome(normalized);
      return;
    }

    if (["following", "foryou", "search"].includes(previous) && !["following", "foryou", "search"].includes(normalized)) state.returnView = previous;
    if (["following", "foryou", "search"].includes(normalized)) state.returnView = normalized;
    state.socialView = normalized;
    section.dataset.socialView = normalized;

    elements.socialTabs.forEach((button) => {
      const selected = button.dataset.s11SocialTab === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    const previousIndex = SOCIAL_VIEW_ORDER.indexOf(previous);
    const nextIndex = SOCIAL_VIEW_ORDER.indexOf(normalized);
    const direction = nextIndex >= previousIndex ? 1 : -1;

    elements.socialViews.forEach((panel) => {
      const selected = panel.dataset.s11SocialView === normalized;
      panel.classList.toggle("is-active", selected);
      panel.setAttribute("aria-hidden", selected ? "false" : "true");
      panel.toggleAttribute("inert", !selected);

      if (!gsap) {
        panel.style.opacity = selected ? "1" : "0";
        panel.style.visibility = selected ? "visible" : "hidden";
        return;
      }

      if (selected) {
        panel.style.visibility = "visible";
        gsap.fromTo(panel, { autoAlpha: animate ? 0 : 1, x: animate ? direction * 28 : 0, scale: animate ? 0.992 : 1 }, { autoAlpha: 1, x: 0, scale: 1, duration: animate ? 0.44 : 0, ease: "power3.out", overwrite: "auto" });
      } else {
        gsap.to(panel, { autoAlpha: 0, x: animate ? -direction * 20 : 0, scale: animate ? 0.992 : 1, duration: animate ? 0.28 : 0, ease: "power2.in", overwrite: "auto", onComplete: () => { if (panel.dataset.s11SocialView !== state.socialView) panel.style.visibility = "hidden"; } });
      }
    });

    if (normalized === "search") renderSearchResults(false);
    if (normalized === "profile") renderReaderProfile(state.selectedProfile);
    if (normalized === "library") renderReaderLibrary(state.selectedProfile);
    if (normalized === "story") renderStoryDetail(state.selectedStory || primaryStory.title);
    updateSocialChrome(normalized);

    if (source === "user") announce(`${SOCIAL_VIEW_META[normalized].label} opened.`);
  }

  function updateSocialChrome(view) {
    const meta = SOCIAL_VIEW_META[view] || SOCIAL_VIEW_META.following;
    setText(elements.socialViewTitle, meta.label);
    setText(elements.socialProgress, meta.step);
    if (state.activeAct === "social") {
      setText(elements.toolbarStatus, meta.status);
      setText(elements.sceneLabel, meta.label);
    }
  }


  function selectProfile(key, animate, source = "system") {
    const normalized = PROFILE_DATA[key] && key !== "nova" ? key : "kai";
    state.selectedProfile = normalized;
    section.dataset.socialSelectedProfile = normalized;
    renderReaderProfile(normalized);
    renderReaderLibrary(normalized);

    qa("[data-s11-profile-key]").forEach((card) => {
      const selected = card.dataset.s11ProfileKey === normalized;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    if (animate && gsap) gsap.fromTo(elements.readerProfile.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.035, ease: "power3.out", overwrite: "auto" });
    if (source === "user") announce(`${PROFILE_DATA[normalized].name} selected.`);
  }

  function openReaderProfile(key, animate, source = "system") {
    selectProfile(key, false, source);
    setSocialView("profile", animate, source);
  }


  function renderReaderProfile(key) {
    const profile = PROFILE_DATA[key] || PROFILE_DATA.kai;
    const rankingStories = profile.topStories.map(getStoryByTitle);
    const following = state.following.has(key);
    const category = profile.categories[0];

    elements.readerProfile.innerHTML = `
      <div class="s11-reader-profile-page">
        <header class="s11-reader-profile-hero">
          <div class="s11-reader-profile-banner" aria-hidden="true"><span>${escapeHtml(profile.label)}</span></div>
          <button type="button" class="s11-back-button" data-s11-back-social="${escapeHtml(state.returnView)}">← Back to ${escapeHtml(viewLabel(state.returnView))}</button>
          <div class="s11-reader-profile-identity">
            <div class="s11-avatar s11-avatar--large" style="${avatarStyle(key)}">${escapeHtml(profile.initial)}</div>
            <div><span class="s11-kicker">${escapeHtml(profile.label)}</span><h3>${escapeHtml(profile.name)}</h3><p>${escapeHtml(profile.bio)}</p><div class="s11-reader-tags">${profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></div>
            <button type="button" class="s11-follow-button ${following ? "is-following" : ""}" data-s11-follow-reader="${escapeHtml(key)}" aria-pressed="${following}">${following ? "Following" : "Follow"}</button>
          </div>
          <div class="s11-reader-stats">${profile.stats.map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></div>`).join("")}</div>
        </header>

        <div class="s11-reader-profile-body">
          <section class="s11-reader-taste">
            <div class="s11-section-heading"><span><small>Their public showcase</small><strong>Top stories</strong></span><button type="button" class="s11-text-button" data-s11-open-library>Open full library</button></div>
            <div class="s11-reader-ranking-grid">${rankingStories.map((story, index) => rankCardMarkup(story, index, "reader")).join("")}</div>
          </section>

          <aside class="s11-reader-profile-side">
            <section class="s11-match-card"><div><small>Why you match</small><p>${escapeHtml(profile.match)}</p></div><div><small>What makes them different</small><p>${escapeHtml(profile.difference)}</p></div></section>
            <section class="s11-reader-category"><header><span class="s11-category-number">01</span><span><small>Custom ranking</small><strong>${escapeHtml(category.title)}</strong></span></header><ol>${category.items.slice(0, 4).map((item, index) => `<li><span>${index + 1}</span>${escapeHtml(item)}</li>`).join("")}</ol></section>
            <section class="s11-reader-activity"><div class="s11-section-heading s11-section-heading--compact"><span><small>Recently public</small><strong>Activity</strong></span></div><div>${profile.activity.slice(0, 2).map(activityMarkup).join("")}</div></section>
          </aside>
        </div>
      </div>`;
    renderImages(elements.readerProfile);
  }


  function setReaderView(view, animate, source = "system") {
    const map = { overview: state.returnView, profile: "profile", story: "story" };
    setSocialView(map[view] || state.returnView, animate, source);
  }

  function renderReaderLibrary(key) {
    const profile = PROFILE_DATA[key] || PROFILE_DATA.kai;
    const library = profile.library || [];
    elements.readerLibrary.innerHTML = `
      <div class="s11-library-page">
        <header class="s11-subpage-toolbar">
          <button type="button" class="s11-back-button" data-s11-back-social="profile">← Back to ${escapeHtml(profile.name)}</button>
          <span><small>Public library</small><strong>${escapeHtml(profile.name)}'s story layers</strong></span>
          <span class="s11-count-pill">${library.length} highlighted stories</span>
        </header>
        <div class="s11-library-intro"><div class="s11-avatar" style="${avatarStyle(key)}">${escapeHtml(profile.initial)}</div><span><strong>Open a story to see what they saved.</strong><p>Every row keeps rating, format, status, and saved layers together—so the profile leads naturally into the story.</p></span></div>
        <div class="s11-library-list">${library.map((item, index) => libraryStoryMarkup(item, index)).join("")}</div>
      </div>`;
    renderImages(elements.readerLibrary);
  }


  function renderStoryDetail(title) {
    const story = getStoryByTitle(title);
    const profile = PROFILE_DATA[state.selectedProfile] || PROFILE_DATA.kai;
    const metadata = (profile.library || []).find((item) => normalizeText(item.title) === normalizeText(story.title)) || { format: "Manga", status: "Completed", score: "9.4", layers: ["Quotes", "Moments", "Characters", "Notes", "Thoughts"] };
    state.selectedStory = story.title;
    const copy = storyLayerCopy(story, profile);

    elements.storyDetail.innerHTML = `
      <div class="s11-story-page">
        <header class="s11-subpage-toolbar">
          <button type="button" class="s11-back-button" data-s11-back-social="library">← Back to library</button>
          <span><small>${escapeHtml(profile.name)}</small><strong>Saved story page</strong></span>
          <span class="s11-count-pill">Public profile story</span>
        </header>

        <section class="s11-story-hero">
          ${storyCoverMarkup(story, "s11-story-hero__cover")}
          <div class="s11-story-hero__copy"><span class="s11-kicker">${escapeHtml(story.creator || "Story")}</span><h3>${escapeHtml(story.title)}</h3><div class="s11-story-meta"><span>${escapeHtml(metadata.format)}</span><span>${escapeHtml(metadata.status)}</span></div><p>${escapeHtml(copy.reflection.detail)}</p></div>
          <div class="s11-story-score"><strong>${escapeHtml(metadata.score)}</strong><small>/10</small></div>
          <div class="s11-story-reflection"><span class="s11-kicker">Pinned reflection</span><strong>${escapeHtml(copy.reflection.title)}</strong><small>${escapeHtml(copy.reflection.meta)}</small></div>
        </section>

        <section class="s11-saved-layers">
          <div class="s11-section-heading"><span><small>Saved layers</small><strong>Choose what to inspect</strong></span><span class="s11-count-pill">5 collections</span></div>
          <div class="s11-story-layer-tabs" role="tablist" aria-label="Saved story layer">
            <button type="button" role="tab" data-s11-story-layer="quotes" aria-selected="true">Quotes</button>
            <button type="button" role="tab" data-s11-story-layer="moments" aria-selected="false">Moments</button>
            <button type="button" role="tab" data-s11-story-layer="characters" aria-selected="false">Characters</button>
            <button type="button" role="tab" data-s11-story-layer="notes" aria-selected="false">Notes</button>
            <button type="button" role="tab" data-s11-story-layer="thoughts" aria-selected="false">Thoughts</button>
          </div>
        </section>

        <section class="s11-story-layer-content" data-s11-story-layer-content>${layerContentMarkup(state.storyLayer || "quotes", copy)}</section>
      </div>`;
    renderImages(elements.storyDetail);
    setStoryLayer(state.storyLayer || "quotes", false, "restore");
  }


  function setStoryLayer(layer, animate, source = "system") {
    const normalized = ["quotes", "moments", "characters", "notes", "thoughts"].includes(layer) ? layer : "quotes";
    state.storyLayer = normalized;
    const story = getStoryByTitle(state.selectedStory || primaryStory.title);
    const copy = storyLayerCopy(story, PROFILE_DATA[state.selectedProfile] || PROFILE_DATA.kai);

    qa("[data-s11-story-layer]", elements.storyDetail).forEach((button) => {
      const selected = button.dataset.s11StoryLayer === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    const content = q("[data-s11-story-layer-content]", elements.storyDetail);
    if (!content) return;
    content.innerHTML = layerContentMarkup(normalized, copy);
    if (animate && gsap) gsap.fromTo(content.children, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.045, ease: "power3.out" });
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
      const button = q("[data-s11-follow-reader]", elements.readerProfile);
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
    renderReaderLibrary(state.selectedProfile);
    if (state.socialView === "story") renderStoryDetail(state.selectedStory || primaryStory.title);
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
      console.warn("Inkwell social V11: database stories unavailable.", error);
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
    const interactive = context === "reader";
    const attrs = interactive
      ? `type="button" data-s11-open-story="${escapeHtml(story.title)}" aria-label="Open ${escapeHtml(story.title)} from this profile"`
      : `type="button" aria-label="${escapeHtml(story.title)}, ranked number ${index + 1}"`;
    return `<button ${attrs} class="s11-rank-card ${hero ? "s11-rank-card--hero" : ""}"><span class="s11-rank-badge">#${index + 1}</span>${storyCoverMarkup(story)}<span class="s11-rank-copy"><strong>${escapeHtml(story.title)}</strong><small>${hero ? "The story that represents this profile" : escapeHtml(story.creator || "Top story")}</small></span></button>`;
  }


  function categoryMarkup(category, index) {
    return `<article class="s11-category-card" style="--category-index:${index}"><header><span class="s11-category-icon">${index + 1}</span><strong>${escapeHtml(category.title)}</strong></header><ol>${category.items.map((item, itemIndex) => `<li><span>${itemIndex + 1}</span>${escapeHtml(item)}</li>`).join("")}</ol></article>`;
  }


  function activityMarkup(item) {
    return `<article class="s11-activity-item"><span class="s11-activity-type">${escapeHtml(item.type)}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span><time>${escapeHtml(item.time)}</time></article>`;
  }


  function feedCardMarkup(item, index) {
    const profile = PROFILE_DATA[item.profile];
    const story = getStoryByTitle(item.story);
    return `<button type="button" class="s11-feed-card" data-s11-profile-key="${escapeHtml(item.profile)}" aria-label="Open ${escapeHtml(profile.name)} profile"><header><span class="s11-avatar s11-avatar--small" style="${avatarStyle(item.profile)}">${escapeHtml(profile.initial)}</span><span><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(item.type)}</small></span><time>${escapeHtml(item.time || `${index + 1}h`)}</time></header><div class="s11-feed-card__story">${storyCoverMarkup(story)}<span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(story.title)}</small></span></div><p>${escapeHtml(item.detail)}</p><footer><span>${escapeHtml(profile.tags[0])}</span><span>Open profile →</span></footer></button>`;
  }

  function featuredFeedMarkup(item) {
    const profile = PROFILE_DATA[item.profile];
    const story = getStoryByTitle(item.story);
    return `<button type="button" class="s11-following-feature" data-s11-profile-key="${escapeHtml(item.profile)}" aria-label="Open ${escapeHtml(profile.name)} profile"><div class="s11-following-feature__cover">${storyCoverMarkup(story)}</div><div class="s11-following-feature__copy"><header><span class="s11-avatar" style="${avatarStyle(item.profile)}">${escapeHtml(profile.initial)}</span><span><small>${escapeHtml(item.type)}</small><strong>${escapeHtml(profile.name)}</strong></span><time>${escapeHtml(item.time)}</time></header><span class="s11-kicker">${escapeHtml(story.title)}</span><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.detail)}. Open the reader to see the ranking, profile, and story layers behind this update.</p><footer><span>${escapeHtml(profile.tags.slice(0, 2).join(" · "))}</span><strong>Open profile →</strong></footer></div></button>`;
  }


  function readerResultMarkup(key, context) {
    return context === "search" ? searchResultMarkup(key, PROFILE_DATA[key].match) : recommendationCardMarkup(key, 0);
  }

  function recommendationCardMarkup(key, index) {
    const profile = PROFILE_DATA[key];
    const story = getStoryByTitle(profile.topStories[0]);
    const rankingItems = (profile.signatureItems || profile.topStories)
      .slice(0, 3)
      .map((item, rank) => `<li><b>${rank + 1}</b><span>${escapeHtml(item)}</span></li>`)
      .join("");
    const themeItems = profile.sharedThemes
      .slice(0, 3)
      .map((item) => `<em>${escapeHtml(item)}</em>`)
      .join("");
    return `<button type="button" class="s11-recommendation-card s11-recommendation-card--${index + 1}" data-s11-profile-key="${escapeHtml(key)}" aria-pressed="${state.selectedProfile === key}"><header><span class="s11-avatar" style="${avatarStyle(key)}">${escapeHtml(profile.initial)}</span><span><small>${escapeHtml(profile.label)}</small><strong>${escapeHtml(profile.name)}</strong><p>${escapeHtml(profile.bio)}</p></span>${storyCoverMarkup(story, "s11-recommendation-cover")}</header><div class="s11-recommendation-reason"><span>↔</span><p>${escapeHtml(profile.match)}</p></div><div class="s11-recommendation-bottom"><span><small>Signature ranking</small><strong>${escapeHtml(profile.signature)}</strong><ol>${rankingItems}</ol></span><span><small>Different perspective</small><strong>${escapeHtml(profile.difference)}</strong><span class="s11-recommendation-themes">${themeItems}</span></span></div><footer><span>${escapeHtml(profile.sharedThemes.join(" · "))}</span><strong>Open profile →</strong></footer></button>`;
  }

  function searchResultMarkup(key, reason) {
    const profile = PROFILE_DATA[key];
    const story = getStoryByTitle(profile.topStories[0]);
    return `<button type="button" class="s11-search-result" data-s11-profile-key="${escapeHtml(key)}" aria-pressed="${state.selectedProfile === key}"><header><span class="s11-avatar" style="${avatarStyle(key)}">${escapeHtml(profile.initial)}</span><span><small>${escapeHtml(profile.label)}</small><strong>${escapeHtml(profile.name)}</strong></span>${storyCoverMarkup(story, "s11-search-result__cover")}</header><p>${escapeHtml(reason)}</p><div class="s11-search-result__evidence"><span><small>Top story</small><strong>${escapeHtml(story.title)}</strong></span><span><small>Signature category</small><strong>${escapeHtml(profile.signature)}</strong></span><span><small>Shared themes</small><strong>${escapeHtml(profile.sharedThemes.join(" · "))}</strong></span></div><footer><span>${escapeHtml(profile.tags.slice(0, 2).join(" · "))}</span><strong>View reader →</strong></footer></button>`;
  }

  function libraryStoryMarkup(item, index) {
    const story = getStoryByTitle(item.title);
    return `<article class="s11-library-story ${index === 0 ? "is-featured" : ""}"><button type="button" class="s11-library-story__main" data-s11-open-story="${escapeHtml(story.title)}" aria-label="Open ${escapeHtml(story.title)} story page">${storyCoverMarkup(story, "s11-library-story__cover")}<span class="s11-library-story__info"><small>${escapeHtml(item.creator || story.creator || "Creator")}</small><strong>${escapeHtml(story.title)}</strong><span class="s11-story-meta"><span>${escapeHtml(item.format)}</span><span>${escapeHtml(item.status)}</span></span></span><span class="s11-library-story__score"><strong>${escapeHtml(item.score)}</strong><small>/10</small></span></button><div class="s11-library-story__layers"><span>Saved layers</span>${item.layers.map((layer) => `<button type="button" data-s11-open-story="${escapeHtml(story.title)}" aria-label="Open ${escapeHtml(layer)} for ${escapeHtml(story.title)}">${escapeHtml(layer)}</button>`).join("")}</div></article>`;
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
        title: "Lines remembered for the ideas around them",
        detail: "The full product stores the selected line with the reader's own note. This homepage preview uses summaries instead of reproducing copyrighted passages.",
        meta: "3 saved quotes · 2 private notes",
        items: ["A line saved for its connection to identity.", "A line connected to responsibility after change.", "A line revisited after the reader's second reread."],
      },
      moments: {
        eyebrow: "Saved moments",
        title: "Scenes organized by why they stayed",
        detail: "Visual moments are grouped with short context: what happened, what changed, and why the scene belongs on this profile.",
        meta: "4 moments · 2 visual notes",
        items: ["A quiet identity shift", "A confrontation without a clear winner", "A return that changes the meaning of home"],
      },
      characters: {
        eyebrow: "Character layer",
        title: `${profile.signatureItems?.[0] || "A central character"} leads this reader's ranking`,
        detail: "The character layer connects saved scenes and notes back to the reader's custom ranking instead of isolating them as separate posts.",
        meta: "1 ranking · 6 notes · 4 moments",
        items: profile.signatureItems || ["Lead character", "Supporting character", "Antagonist"],
      },
      notes: {
        eyebrow: "Reader notes",
        title: "Small observations kept beside the story",
        detail: "Notes can be analytical, emotional, or practical. Each keeps its date and can stay private even when the profile is public.",
        meta: "8 notes · 3 public",
        items: ["A note about perspective", "A note about the ending structure", "A private reread question"],
      },
      thoughts: {
        eyebrow: "Thoughts over time",
        title: "The interpretation can change after the story ends",
        detail: "Recent edits show how rereads changed the reader's interpretation without erasing the earlier version.",
        meta: "Last edited 2 days ago",
        items: ["First read", "After the ending", "After returning months later"],
      },
    };
  }


  function layerContentMarkup(layer, copy) {
    const item = copy[layer] || copy.quotes;
    const items = item.items || [];
    return `<article class="s11-layer-card"><span class="s11-kicker">${escapeHtml(item.eyebrow)}</span><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.detail)}</p><div class="s11-layer-items">${items.map((entry, index) => `<span><small>${String(index + 1).padStart(2, "0")}</small><strong>${escapeHtml(entry)}</strong></span>`).join("")}</div><footer>${escapeHtml(item.meta)}</footer></article><aside class="s11-layer-context"><small>Connected profile data</small><strong>${layer === "characters" ? "Custom character ranking" : layer === "quotes" ? "Saved quote collection" : layer === "moments" ? "Visual memory board" : layer === "notes" ? "Story notes" : "Interpretation history"}</strong><p>Every saved layer links back to the story, the reader, and the profile category that gives it context.</p></aside>`;
  }


  function storyCoverMarkup(story, extraClass = "") {
    return `<span class="s11-cover ${escapeHtml(extraClass)}" data-story-title="${escapeHtml(story.title)}"><img src="${escapeHtml(story.coverUrl || "")}" alt="${escapeHtml(story.title)} cover" ${story.coverUrl ? "" : "hidden"}><span>${escapeHtml(abbreviateTitle(story.title))}</span></span>`;
  }


  function renderImages(root) {
    qa(".s11-cover", root).forEach((cover) => {
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

  function searchReason(profile, filter, tokens) {
    const query = tokens.join(" ");
    if (filter === "people") return `Username and profile text connect to “${query || profile.name}”.`;
    if (filter === "stories") return `${profile.topStories.find((title) => normalizeText(title).includes(query)) || profile.topStories[0]} appears in this reader's public top stories.`;
    if (filter === "themes") return `${profile.sharedThemes.find((theme) => normalizeText(theme).includes(query)) || profile.sharedThemes[0]} repeats across this reader's public reflections.`;
    if (filter === "tags") return `${profile.tags.find((tag) => normalizeText(tag).includes(query)) || profile.tags[0]} is one of this profile's visible taste tags.`;
    if (filter === "rankings") return `${profile.signature} is a public custom ranking on this profile.`;
    return profile.match;
  }

  function searchFilterLabel(filter) {
    return ({ all: "all profile fields", people: "username", stories: "story", themes: "theme", tags: "tag", rankings: "ranking" })[filter] || "all profile fields";
  }

  function viewLabel(view) {
    return ({ following: "Following", foryou: "For You", search: "Search", profile: "profile", library: "library", story: "story" })[view] || "Social";
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
    state.socialView = "following";
    state.returnView = "following";
    state.selectedProfile = "kai";
    state.selectedStory = primaryStory.title;
    state.storyLayer = "quotes";
    state.profileCategory = 0;
    state.following.clear();
    state.searchQuery = "Tokyo Ghoul:re";
    state.searchFilter = "all";
    if (elements.searchInput) elements.searchInput.value = state.searchQuery;
    demoState.audience = "private";
    demoState.spoiler = false;
    demoState.socialView = "following";
    demoState.storyLayer = "quotes";
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
        socialView: state.socialView,
        returnView: state.returnView,
        selectedProfile: state.selectedProfile,
        selectedStory: state.selectedStory,
        storyLayer: state.storyLayer,
        primaryStory: primaryStory.title,
        userLocks: { ...userLocks },
      }),
      destroy: () => {
        trigger?.kill?.(true);
        timeline?.kill?.();
        resizeObserver?.disconnect?.();
        cleanupCallbacks.splice(0).forEach((callback) => callback());
        window.__INKWELL_SOCIAL_V11_STARTED__ = false;
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