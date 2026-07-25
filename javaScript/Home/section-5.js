/* ============================================================================
   INKWELL — SECTION 5: SOCIAL, ON YOUR TERMS (V8 HYBRID SCROLL + INTERACTION)

   What changed:
   - scroll once again demonstrates Private -> Followers -> Public -> Spoilers
   - demo state is deterministic in both scroll directions
   - the moment a person interacts with a control, that control becomes user-owned
     and scrolling can no longer overwrite it
   - no pointerdown handler changes the page scroll position
   - discovery profiles now have genuinely different themes, stories, and activity
   - Tokyo Ghoul:re is selected from Supabase as the primary Section 5 story
   ============================================================================ */

(() => {
  "use strict";

  const section = document.querySelector("#section-5-social");
  if (!section || window.__INKWELL_SOCIAL_V8_STARTED__) return;

  window.__INKWELL_SOCIAL_V8_STARTED__ = true;
  window.__INKWELL_SOCIAL_CINEMA_BUILD__ =
    "2026-07-25-social-cinema-v8-hybrid-scroll-interaction";

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

  const OPENING_READY_TIME = 0.96;
  const STANDALONE_SCRUB_SECONDS = 0.58;
  const ACT_TIMES = Object.freeze({
    control: 0,
    identityTransition: 3.38,
    identity: 4.28,
    discoveryTransition: 6.46,
    discovery: 7.18,
    end: 10.6,
  });

  const TOKYO_GHOUL_RE_ALIASES = [
    "tokyo ghoul re",
    "tokyo ghoul:re",
    "tokyo ghoul re manga",
  ];

  const EXCLUDED_STORY_ALIASES = [
    "attack on titan",
    "shingeki no kyojin",
    "vagabond",
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
    {
      id: "fallback-tokyo-ghoul-re",
      title: "Tokyo Ghoul:re",
      creator: "Sui Ishida",
      coverUrl: "",
    },
    {
      id: "fallback-monster",
      title: "Monster",
      creator: "Naoki Urasawa",
      coverUrl: "",
    },
    {
      id: "fallback-vinland",
      title: "Vinland Saga",
      creator: "Makoto Yukimura",
      coverUrl: "",
    },
    {
      id: "fallback-punpun",
      title: "Goodnight Punpun",
      creator: "Inio Asano",
      coverUrl: "",
    },
    {
      id: "fallback-berserk",
      title: "Berserk",
      creator: "Kentaro Miura",
      coverUrl: "",
    },
    {
      id: "fallback-20cb",
      title: "20th Century Boys",
      creator: "Naoki Urasawa",
      coverUrl: "",
    },
    {
      id: "fallback-fma",
      title: "Fullmetal Alchemist",
      creator: "Hiromu Arakawa",
      coverUrl: "",
    },
    {
      id: "fallback-death-note",
      title: "Death Note",
      creator: "Tsugumi Ohba",
      coverUrl: "",
    },
    {
      id: "fallback-pluto",
      title: "Pluto",
      creator: "Naoki Urasawa",
      coverUrl: "",
    },
  ];

  const profileData = Object.freeze({
    kai: {
      initial: "K",
      name: "kai.reads",
      bio: "Remembers the feeling before the theory.",
      context:
        "You both return to stories about freedom, sacrifice, and difficult moral choices.",
      themes: ["freedom", "sacrifice", "choice"],
      storyPreferences: [
        "Tokyo Ghoul:re",
        "Fullmetal Alchemist",
        "20th Century Boys",
      ],
      matchCount: "3",
      matchLabel: "shared stories",
      resultDetail: "Feeling before theory · freedom · sacrifice",
      feed: [
        {
          type: "Note",
          text: "Freedom becomes more interesting when it carries responsibility.",
        },
        {
          type: "Reflection",
          text: "A difficult choice can be understandable without becoming harmless.",
        },
      ],
    },
    mira: {
      initial: "M",
      name: "mira.frames",
      bio: "Collects visual moments and quiet endings.",
      context:
        "You both save scenes where memory, grief, and visual rhythm say more than dialogue.",
      themes: ["memory", "grief", "cinematography"],
      storyPreferences: ["Goodnight Punpun", "Monster", "Vinland Saga"],
      matchCount: "2",
      matchLabel: "shared stories",
      resultDetail: "Visual moments · memory · cinematography",
      feed: [
        {
          type: "Moment",
          text: "The silent panel changes the emotional weight of everything around it.",
        },
        {
          type: "Note",
          text: "The ending stays with me because the image resolves less than the dialogue.",
        },
      ],
    },
    ren: {
      initial: "R",
      name: "ren.afterwords",
      bio: "Writes long reflections about history and responsibility.",
      context:
        "You share an interest in identity, inherited conflict, history, and responsibility.",
      themes: ["identity", "history", "responsibility"],
      storyPreferences: ["Tokyo Ghoul:re", "Monster", "Berserk"],
      matchCount: "4",
      matchLabel: "shared themes",
      resultDetail: "Long reflections · history · responsibility",
      feed: [
        {
          type: "Reflection",
          text: "Identity is shaped by history, but it is not completely decided by it.",
        },
        {
          type: "Note",
          text: "Responsibility begins when a person stops treating inheritance as destiny.",
        },
      ],
    },
  });

  const audienceMeta = Object.freeze({
    private: {
      label: "Private",
      previewTitle: "Private reflection",
      previewState: "Only you",
      summary: "Only you can see this reflection.",
      hint:
        "This stays attached to your private library until you choose another audience.",
      footer: "1 reader",
      orbitCount: 0,
    },
    followers: {
      label: "Followers",
      previewTitle: "Followers preview",
      previewState: "Your network",
      summary: "People you follow can see this reflection.",
      hint:
        "The post enters your followers feed while remaining connected to the story.",
      footer: "126 followers",
      orbitCount: 4,
    },
    public: {
      label: "Public",
      previewTitle: "Public reflection",
      previewState: "Community",
      summary: "Anyone can discover this reflection on your profile.",
      hint:
        "Public posts can appear on story pages, profiles, and reader search.",
      footer: "Community",
      orbitCount: 4,
    },
  });

  const stepMeta = Object.freeze({
    control: {
      number: "01",
      label: "Audience and spoilers",
      status: "Control",
      announcement:
        "Social controls: choose an audience and protect spoilers.",
    },
    identity: {
      number: "02",
      label: "Profile and public taste",
      status: "Identity",
      announcement:
        "Profile identity: favourite stories and public reflections shape a reader profile.",
    },
    discovery: {
      number: "03",
      label: "Search and follow",
      status: "Discovery",
      announcement:
        "Reader discovery: compare shared stories and themes, then follow a reader.",
    },
  });

  const q = (selector, root = section) => root?.querySelector(selector) || null;
  const qa = (selector, root = section) =>
    Array.from(root?.querySelectorAll(selector) || []);

  const elements = {
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
      discovery: q('[data-social-scene="discovery"]'),
    },

    composer: q(".social-composer"),
    livePreview: q(".social-live-preview"),
    controlAnchor: q('[data-social-post-anchor="control"]'),
    identityAnchor: q('[data-social-post-anchor="identity"]'),
    sharedPost: q("[data-social-shared-post]"),
    visibilityBadge: q("[data-social-visibility-badge]"),
    audienceButtons: qa("[data-social-audience]"),
    audienceSummary: q("[data-social-audience-summary]"),
    previewTitle: q("[data-social-preview-title]"),
    previewState: q("[data-social-preview-state]"),
    previewHint: q("[data-social-preview-hint]"),
    previewFooter: q("[data-social-preview-footer]"),
    orbitAvatars: qa(".social-orbit-avatar"),
    spoilerToggle: q("[data-social-spoiler-toggle]"),
    spoilerShield: q("[data-social-spoiler-shield]"),
    spoilerReveal: q("[data-social-spoiler-reveal]"),
    shareButton: q("[data-social-share-button]"),

    profileShell: q("[data-social-profile-shell]"),
    profileBanner: q(".social-profile-banner"),
    profileHeader: q(".social-profile-header"),
    profileAvatar: q("[data-social-profile-avatar]"),
    profileBio: q("[data-social-profile-bio]"),
    profileTags: qa("[data-social-profile-tags] .social-profile-tag"),
    profileStats: qa("[data-social-profile-stats] .social-profile-stat"),
    profileCovers: qa("[data-social-favourite-index]"),
    profilePin: q("[data-social-profile-pin]"),
    profileActivityRows: qa(".social-activity-row"),
    profileEdit: q("[data-social-profile-edit]"),

    searchPanel: q(".social-search-panel"),
    searchHeading: q(".social-search-panel__header strong"),
    searchCount: q(".social-search-count"),
    searchInput: q("[data-social-search-input]"),
    searchTabs: qa("[data-social-search-scope]"),
    resultList: q("[data-social-result-list]"),
    resultCards: qa("[data-social-result]"),

    visitedProfile: q("[data-social-visited-profile]"),
    visitedAvatar: q(".social-visited-profile__avatar"),
    visitedName: q(".social-visited-profile__copy h3"),
    visitedBio: q(".social-visited-profile__copy p"),
    sharedContext: q(".social-shared-context"),
    mutualStoryButtons: qa("[data-social-mutual-story-index]"),
    themeButtons: qa("[data-social-theme]"),
    evidenceSummary: q("[data-social-evidence-summary]"),
    visitedFeed: qa(".social-feed-item"),
    followButton: q("[data-social-follow]"),
    followPayoff: q("[data-social-follow-payoff]"),

    favouriteTiles: qa("[data-social-favourite-index]"),
    activityRows: qa("[data-social-activity-index]"),
    feedRows: qa("[data-social-feed-index]"),

    storyImages: qa("[data-social-story-cover], [data-social-post-cover]"),
    primaryStoryTitles: qa(
      ".social-story-mini small, .social-story-reference strong, " +
        "[data-social-profile-pin] > strong",
    ),
    primaryStoryFallbacks: qa(
      ".social-story-mini__cover > span[aria-hidden='true'], " +
        ".social-story-reference .social-story-cover > span[aria-hidden='true']",
    ),
    composerReflection: q(".social-composer__reflection p"),
    sharedReflection: q("[data-social-shared-post] blockquote"),
    profilePinReflection: q("[data-social-profile-pin] p"),
  };

  const required = [
    elements.pin,
    elements.screen,
    elements.scenes.control,
    elements.scenes.identity,
    elements.scenes.discovery,
    elements.sharedPost,
    elements.controlAnchor,
    elements.identityAnchor,
  ];

  if (required.some((item) => !item)) {
    console.warn("Inkwell social V8: required Section 5 markup is missing.");
    return;
  }

  let timeline = null;
  let trigger = null;
  let activeAct = "control";
  let supabaseClient = null;
  let resizeObserver = null;
  let databaseStories = [...FALLBACK_STORIES];
  let primaryStory = FALLBACK_STORIES[0];
  let selectedProfileKey = "kai";
  let selectedTheme = "freedom";
  let selectedStoryIndex = -1;
  let lastDemoSignature = "";
  const cleanupCallbacks = [];

  const userLocks = {
    audience: false,
    spoiler: false,
    search: false,
    profile: false,
    evidence: false,
    follow: false,
  };

  const interactionState = {
    audience: "private",
    spoiler: false,
    searchScope: "themes",
    searchQuery: "freedom",
    following: false,
  };

  setupInteractions();
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
  publishApi();

  function buildCinema() {
    setInitialState();

    timeline = gsap.timeline({
      paused: true,
      defaults: { ease: "none" },
      onUpdate: () => syncTimelineState(false),
    });

    const controlCopy = getCopyState("control");
    const identityCopy = getCopyState("identity");
    const discoveryCopy = getCopyState("discovery");

    timeline.addLabel("control", ACT_TIMES.control);

    timeline.to(
      [elements.eyebrow, controlCopy, ...elements.steps, elements.principle],
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.58,
        stagger: 0.045,
        ease: "power3.out",
      },
      0,
    );

    timeline.to(
      elements.scenes.control,
      { autoAlpha: 1, duration: 0.32, ease: "power2.out" },
      0.08,
    );

    timeline.to(
      [elements.composer, elements.livePreview],
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.58,
        stagger: 0.07,
        ease: "power3.out",
      },
      0.18,
    );

    timeline.to(
      elements.sharedPost,
      {
        autoAlpha: 1,
        x: () => getAnchorTransform(elements.controlAnchor).x,
        y: () => getAnchorTransform(elements.controlAnchor).y,
        scale: () => getAnchorTransform(elements.controlAnchor).scale,
        duration: 0.58,
        ease: "power3.out",
      },
      0.28,
    );

    timeline.addLabel("control-ready", OPENING_READY_TIME);

    // The audience values are applied by syncDemoState(). These tweens provide
    // a clear visual rhythm without owning the selected values themselves.
    timeline.fromTo(
      elements.audienceButtons,
      { filter: "brightness(0.93)" },
      {
        filter: "brightness(1)",
        duration: 0.28,
        stagger: 0.06,
        ease: "power2.out",
      },
      1.06,
    );

    timeline.to(
      elements.livePreview,
      {
        boxShadow:
          "0 24px 62px rgba(0,0,0,.3), 0 0 0 1px rgba(115,220,255,.09)",
        duration: 0.34,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      1.62,
    );

    timeline.to(
      elements.spoilerToggle,
      {
        filter: "brightness(1.14)",
        duration: 0.18,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      2.56,
    );

    timeline.to(
      elements.shareButton,
      {
        filter: "brightness(1.13)",
        duration: 0.16,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      3.02,
    );

    timeline.addLabel("identity-transition", ACT_TIMES.identityTransition);

    timeline.to(
      controlCopy,
      {
        autoAlpha: 0,
        y: -14,
        duration: 0.34,
        ease: "power2.inOut",
      },
      "identity-transition",
    );

    timeline.fromTo(
      identityCopy,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.46,
        ease: "power3.out",
      },
      "identity-transition+=0.14",
    );

    timeline.to(
      [elements.composer, elements.livePreview],
      {
        autoAlpha: 0,
        y: -18,
        scale: 0.985,
        duration: 0.42,
        ease: "power2.inOut",
      },
      "identity-transition",
    );

    timeline.set(
      elements.scenes.identity,
      { visibility: "visible" },
      "identity-transition+=0.08",
    );

    timeline.to(
      elements.scenes.identity,
      { autoAlpha: 1, duration: 0.36, ease: "power2.out" },
      "identity-transition+=0.08",
    );

    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.52,
        ease: "power3.out",
      },
      "identity-transition+=0.12",
    );

    timeline.to(
      [elements.profileBanner, elements.profileHeader],
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.out",
      },
      "identity-transition+=0.16",
    );

    timeline.to(
      elements.sharedPost,
      {
        x: () => getAnchorTransform(elements.identityAnchor).x,
        y: () => getAnchorTransform(elements.identityAnchor).y,
        scale: () => getAnchorTransform(elements.identityAnchor).scale,
        duration: 0.72,
        ease: "power3.inOut",
      },
      "identity-transition+=0.18",
    );

    timeline.to(
      elements.scenes.control,
      { autoAlpha: 0, duration: 0.24, ease: "power2.in" },
      "identity-transition+=0.26",
    );

    timeline.to(
      elements.profilePin,
      { autoAlpha: 1, duration: 0.26, ease: "power2.out" },
      "identity-transition+=0.78",
    );

    timeline.to(
      elements.sharedPost,
      { autoAlpha: 0, duration: 0.2, ease: "power2.in" },
      "identity-transition+=0.82",
    );

    timeline.addLabel("identity", ACT_TIMES.identity);

    timeline.fromTo(
      elements.profileAvatar,
      { autoAlpha: 0, y: 10, scale: 0.9 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: "back.out(1.35)",
      },
      "identity",
    );

    timeline.fromTo(
      elements.profileBio,
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        ease: "power3.out",
      },
      "identity+=0.08",
    );

    timeline.fromTo(
      elements.profileTags,
      { autoAlpha: 0, y: 8, scale: 0.96 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        stagger: 0.045,
        ease: "power3.out",
      },
      "identity+=0.18",
    );

    timeline.fromTo(
      elements.profileStats,
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.04,
        ease: "power3.out",
      },
      "identity+=0.34",
    );

    timeline.fromTo(
      elements.profileCovers,
      { autoAlpha: 0, y: 14, rotation: -1 },
      {
        autoAlpha: 1,
        y: 0,
        rotation: 0,
        duration: 0.36,
        stagger: 0.06,
        ease: "power3.out",
      },
      "identity+=0.48",
    );

    timeline.fromTo(
      elements.profileActivityRows,
      { autoAlpha: 0, x: 14 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.34,
        stagger: 0.07,
        ease: "power3.out",
      },
      "identity+=0.62",
    );

    timeline.to({}, { duration: 0.8 });

    timeline.addLabel("discovery-transition", ACT_TIMES.discoveryTransition);

    timeline.to(
      identityCopy,
      {
        autoAlpha: 0,
        y: -14,
        duration: 0.34,
        ease: "power2.inOut",
      },
      "discovery-transition",
    );

    timeline.fromTo(
      discoveryCopy,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.46,
        ease: "power3.out",
      },
      "discovery-transition+=0.14",
    );

    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 0,
        x: -28,
        scale: 0.985,
        duration: 0.46,
        ease: "power2.inOut",
      },
      "discovery-transition",
    );

    timeline.set(
      elements.scenes.discovery,
      { visibility: "visible" },
      "discovery-transition+=0.08",
    );

    timeline.to(
      elements.scenes.discovery,
      { autoAlpha: 1, duration: 0.36, ease: "power2.out" },
      "discovery-transition+=0.08",
    );

    timeline.fromTo(
      [elements.searchPanel, elements.visitedProfile],
      { autoAlpha: 0, y: 16, scale: 0.986 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "power3.out",
      },
      "discovery-transition+=0.12",
    );

    timeline.to(
      elements.scenes.identity,
      { autoAlpha: 0, duration: 0.22, ease: "power2.in" },
      "discovery-transition+=0.26",
    );

    timeline.addLabel("discovery", ACT_TIMES.discovery);

    timeline.fromTo(
      elements.resultCards,
      { autoAlpha: 0, x: -16, y: 5 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.34,
        stagger: 0.07,
        ease: "power3.out",
      },
      "discovery+=0.08",
    );

    timeline.fromTo(
      [
        elements.sharedContext,
        ...elements.mutualStoryButtons,
        ...elements.themeButtons,
      ],
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.04,
        ease: "power3.out",
      },
      "discovery+=0.32",
    );

    timeline.fromTo(
      elements.visitedFeed,
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.07,
        ease: "power3.out",
      },
      "discovery+=0.56",
    );

    timeline.to(
      elements.followButton,
      {
        filter: "brightness(1.12)",
        duration: 0.16,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      "discovery+=2.4",
    );

    // Hold only until the authored ending. A long append-only hold here made
    // the Discovery act look frozen and created the large empty-scroll tail.
    timeline.to({}, { duration: 0.7 }, "discovery+=2.72");
    timeline.addLabel("section-end", ACT_TIMES.end);

    if (MANAGED_BY_HOME_JOURNEY) {
      timeline.pause(0);
      return;
    }

    trigger = ScrollTrigger.create({
      id: "inkwell-social-cinema-v8",
      trigger: section,
      animation: timeline,
      pin: elements.pin,
      pinSpacing: true,
      start: () => `top top+=${getNavHeight()}`,
      end: () => `+=${Math.max(5600, window.innerHeight * 6.2)}`,
      scrub: STANDALONE_SCRUB_SECONDS,
      fastScrollEnd: true,
      anticipatePin: 1,
      invalidateOnRefresh: false,
      onUpdate: () => syncTimelineState(false),
    });

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
  }

  function setInitialState() {
    const controlCopy = getCopyState("control");

    gsap.set(
      [
        elements.eyebrow,
        ...elements.copyStates,
        ...elements.steps,
        elements.principle,
      ],
      { autoAlpha: 0, y: 14 },
    );

    gsap.set(controlCopy, { y: 14 });
    gsap.set(Object.values(elements.scenes), {
      autoAlpha: 0,
      visibility: "hidden",
    });
    gsap.set(elements.scenes.control, { visibility: "visible" });

    gsap.set([elements.composer, elements.livePreview], {
      autoAlpha: 0,
      y: 18,
      scale: 0.988,
      clearProps: "boxShadow",
    });

    const initial = getAnchorTransform(elements.controlAnchor);
    gsap.set(elements.sharedPost, {
      autoAlpha: 0,
      x: initial.x,
      y: initial.y + 14,
      scale: initial.scale * 0.94,
      transformOrigin: "0 0",
      visibility: "visible",
      pointerEvents: "none",
    });

    gsap.set(elements.profileShell, {
      autoAlpha: 0,
      x: 0,
      y: 18,
      scale: 0.988,
    });
    gsap.set([elements.profileBanner, elements.profileHeader], {
      autoAlpha: 0,
      y: 10,
    });
    gsap.set(elements.profilePin, { autoAlpha: 0 });
    gsap.set(elements.profileAvatar, { autoAlpha: 0, y: 10, scale: 0.9 });
    gsap.set(elements.profileBio, { autoAlpha: 0, y: 8 });
    gsap.set(elements.profileTags, { autoAlpha: 0, y: 8, scale: 0.96 });
    gsap.set(elements.profileStats, { autoAlpha: 0, y: 8 });
    gsap.set(elements.profileCovers, { autoAlpha: 0, y: 14, rotation: -1 });
    gsap.set(elements.profileActivityRows, { autoAlpha: 0, x: 14 });

    gsap.set([elements.searchPanel, elements.visitedProfile], {
      autoAlpha: 0,
      y: 16,
      scale: 0.986,
    });
    gsap.set(elements.resultCards, { autoAlpha: 0, x: -16, y: 5 });
    gsap.set(
      [
        elements.sharedContext,
        ...elements.mutualStoryButtons,
        ...elements.themeButtons,
      ],
      { autoAlpha: 0, y: 10 },
    );
    gsap.set(elements.visitedFeed, { autoAlpha: 0, y: 12 });
    gsap.set(elements.followPayoff, { autoAlpha: 0, y: 8 });

    renderAudience(interactionState.audience, false);
    renderSpoiler(interactionState.spoiler, false);
    selectProfile(selectedProfileKey, false, {
      preserveEvidence: false,
      source: "restore",
    });
    setSearchScope(interactionState.searchScope, false, "restore");
    renderFollowing(interactionState.following, false);
    setActiveAct("control", true);
    lastDemoSignature = "";
  }

  function syncTimelineState(force) {
    if (!timeline) return;

    const time = Number(timeline.time() || 0);
    const nextAct =
      time < ACT_TIMES.identityTransition + 0.2
        ? "control"
        : time < ACT_TIMES.discoveryTransition + 0.2
          ? "identity"
          : "discovery";

    if (force || nextAct !== activeAct) {
      setActiveAct(nextAct, force);
    }

    syncDemoState(time, force);
  }

  function getDemoSnapshot(time) {
    let audience = "private";
    if (time >= 1.42 && time < 2.08) audience = "followers";
    if (time >= 2.08) audience = "public";

    const spoiler = time >= 2.52 && time < ACT_TIMES.identityTransition + 0.12;

    let profile = "kai";
    if (time >= 8.18 && time < 9.08) profile = "mira";
    if (time >= 9.08) profile = "ren";

    const following = time >= 9.86;

    return { audience, spoiler, profile, following };
  }

  function syncDemoState(time, force) {
    const demo = getDemoSnapshot(time);
    const signature = JSON.stringify(demo);
    if (!force && signature === lastDemoSignature) return;
    lastDemoSignature = signature;

    if (!userLocks.audience && interactionState.audience !== demo.audience) {
      interactionState.audience = demo.audience;
      renderAudience(demo.audience, true);
    }

    if (!userLocks.spoiler && interactionState.spoiler !== demo.spoiler) {
      interactionState.spoiler = demo.spoiler;
      renderSpoiler(demo.spoiler, true);
    }

    if (
      activeAct === "discovery" &&
      !userLocks.profile &&
      selectedProfileKey !== demo.profile
    ) {
      selectProfile(demo.profile, true, {
        preserveEvidence: false,
        source: "demo",
      });
    }

    if (
      activeAct === "discovery" &&
      !userLocks.follow &&
      interactionState.following !== demo.following
    ) {
      interactionState.following = demo.following;
      renderFollowing(demo.following, true);
    }
  }

  function setActiveAct(key, force = false) {
    if (!force && key === activeAct) return;
    activeAct = key;
    const meta = stepMeta[key] || stepMeta.control;

    section.dataset.socialActiveAct = key;

    elements.steps.forEach((step) => {
      step.classList.toggle("is-active", step.dataset.socialStep === key);
    });

    elements.copyStates.forEach((copy) => {
      const active = copy.dataset.socialCopy === key;
      copy.classList.toggle("is-active", active);
      copy.setAttribute("aria-hidden", active ? "false" : "true");
    });

    Object.entries(elements.scenes).forEach(([sceneKey, scene]) => {
      const active = sceneKey === key;
      scene.classList.toggle("is-interactive", active);
      scene.setAttribute("aria-hidden", active ? "false" : "true");
      scene.toggleAttribute("inert", !active);

      if (!active && scene.contains(document.activeElement)) {
        document.activeElement?.blur?.();
      }
    });

    setText(elements.toolbarStatus, meta.status);
    setText(elements.sceneNumber, meta.number);
    setText(elements.sceneLabel, meta.label);
    announce(meta.announcement);
  }

  function setupInteractions() {
    const listen = (target, type, handler, options) => {
      if (!target) return;
      target.addEventListener(type, handler, options);
      cleanupCallbacks.push(() =>
        target.removeEventListener(type, handler, options),
      );
    };

    // Important: pointerdown must not advance or finish the ScrollTrigger scrub.
    // The previous implementation did that, which moved targets underneath the
    // pointer during a click and made otherwise-correct buttons feel unreliable.
    listen(section, "pointerdown", (event) => {
      const control = event.target.closest(
        "button, input, a, [role='button'], [role='tab'], [role='radio']",
      );
      if (control) section.classList.add("is-social-interacting");
    }, { capture: true, passive: true });

    listen(section, "pointerup", () => {
      section.classList.remove("is-social-interacting");
    }, { capture: true, passive: true });

    const audienceGroup = elements.audienceButtons[0]?.parentElement || null;
    audienceGroup?.setAttribute("role", "radiogroup");
    audienceGroup?.setAttribute("aria-label", "Reflection audience");

    elements.audienceButtons.forEach((button, index) => {
      button.setAttribute("role", "radio");
      listen(button, "click", () => {
        userLocks.audience = true;
        interactionState.audience =
          button.dataset.socialAudience || "private";
        renderAudience(interactionState.audience, true);
        announce(`${audienceMeta[interactionState.audience].label} audience selected.`);
      });

      listen(button, "keydown", (event) => {
        if (![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(event.key)) return;

        event.preventDefault();
        let nextIndex = index;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) {
          nextIndex = (index + 1) % elements.audienceButtons.length;
        } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
          nextIndex =
            (index - 1 + elements.audienceButtons.length) %
            elements.audienceButtons.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = elements.audienceButtons.length - 1;
        }

        const next = elements.audienceButtons[nextIndex];
        next?.focus();
        next?.click();
      });
    });

    listen(elements.spoilerToggle, "click", () => {
      userLocks.spoiler = true;
      interactionState.spoiler = !interactionState.spoiler;
      renderSpoiler(interactionState.spoiler, true);
      announce(
        interactionState.spoiler
          ? "Spoiler protection enabled."
          : "Spoiler protection disabled.",
      );
    });

    listen(elements.spoilerReveal, "click", () => {
      userLocks.spoiler = true;
      interactionState.spoiler = false;
      renderSpoiler(false, true);
      announce("Spoiler reflection revealed.");
    });

    listen(elements.shareButton, "click", () => {
      pulse(elements.shareButton);
      announce("Reflection sharing preview updated.");
    });

    listen(elements.profileEdit, "click", () => {
      const editing = !elements.profileShell.classList.contains("is-editing");
      elements.profileShell.classList.toggle("is-editing", editing);
      elements.profileEdit.setAttribute("aria-pressed", editing ? "true" : "false");
      elements.profileEdit.textContent = editing ? "Save profile" : "Edit profile";
      pulse(elements.profileEdit);
      announce(editing ? "Profile editing preview opened." : "Profile preview saved.");
    });

    const tabList = elements.searchTabs[0]?.parentElement || null;
    tabList?.setAttribute("role", "tablist");
    tabList?.setAttribute("aria-label", "Discovery search type");

    elements.searchTabs.forEach((tab, index) => {
      tab.setAttribute("role", "tab");
      listen(tab, "click", () => {
        userLocks.search = true;
        setSearchScope(
          tab.dataset.socialSearchScope || "readers",
          true,
          "user",
        );
      });

      listen(tab, "keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          return;
        }
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % elements.searchTabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex =
            (index - 1 + elements.searchTabs.length) %
            elements.searchTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = elements.searchTabs.length - 1;
        }
        const next = elements.searchTabs[nextIndex];
        next?.focus();
        next?.click();
      });
    });

    listen(elements.searchInput, "input", () => {
      userLocks.search = true;
      interactionState.searchQuery = elements.searchInput.value;
      updateSearchSummary();
    });

    // Event delegation makes the complete visual card reliable even if a
    // future markup edit introduces another nested span or icon.
    listen(elements.resultList, "click", (event) => {
      const card = event.target.closest("[data-social-result]");
      if (!card || !elements.resultList.contains(card)) return;
      userLocks.profile = true;
      userLocks.follow = false;
      selectProfile(card.dataset.socialResult || "kai", true, {
        preserveEvidence: false,
        source: "user",
      });
    });

    elements.mutualStoryButtons.forEach((button) => {
      listen(button, "click", () => {
        userLocks.evidence = true;
        const index = Number(button.dataset.socialMutualStoryIndex || 0);
        selectSharedStory(index, true);
      });
    });

    elements.themeButtons.forEach((button) => {
      listen(button, "click", () => {
        userLocks.evidence = true;
        selectTheme(button.dataset.socialTheme || "freedom", true);
      });
    });

    listen(elements.followButton, "click", () => {
      userLocks.follow = true;
      interactionState.following = !interactionState.following;
      renderFollowing(interactionState.following, true);
      announce(
        interactionState.following ? "Reader followed." : "Reader unfollowed.",
      );
    });

    const onResize = debounce(() => refreshTimelineState(), 150);
    listen(window, "resize", onResize, { passive: true });
    listen(window, "orientationchange", onResize, { passive: true });

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(onResize);
      [elements.screen, elements.controlAnchor, elements.identityAnchor]
        .filter(Boolean)
        .forEach((item) => resizeObserver.observe(item));
    }
  }

  function renderAudience(value, animate) {
    const normalized = value in audienceMeta ? value : "private";
    const meta = audienceMeta[normalized];
    interactionState.audience = normalized;
    section.dataset.socialAudience = normalized;

    elements.audienceButtons.forEach((button) => {
      const selected = button.dataset.socialAudience === normalized;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.setAttribute("aria-checked", selected ? "true" : "false");
      button.setAttribute("tabindex", selected ? "0" : "-1");
    });

    setText(elements.visibilityBadge, meta.label);
    setText(elements.audienceSummary, meta.summary);
    setText(elements.previewTitle, meta.previewTitle);
    setText(elements.previewState, meta.previewState);
    setText(elements.previewHint, meta.hint);
    setText(elements.previewFooter, meta.footer);

    if (!gsap) return;

    gsap.to(elements.orbitAvatars, {
      autoAlpha: meta.orbitCount ? 1 : 0,
      scale: meta.orbitCount ? 1 : 0.78,
      duration: animate ? 0.28 : 0,
      stagger: animate ? 0.025 : 0,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (animate) {
      gsap.fromTo(
        [elements.visibilityBadge, elements.previewState, elements.previewTitle],
        { autoAlpha: 0.56, y: 4 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
          ease: "power3.out",
          overwrite: "auto",
        },
      );

      const active = elements.audienceButtons.find(
        (button) => button.dataset.socialAudience === normalized,
      );
      pulse(active);
    }
  }

  function renderSpoiler(enabled, animate) {
    interactionState.spoiler = Boolean(enabled);
    section.classList.toggle("is-social-spoiler-enabled", enabled);
    elements.spoilerToggle?.setAttribute(
      "aria-pressed",
      enabled ? "true" : "false",
    );
    elements.spoilerShield?.classList.toggle("is-visible", enabled);

    if (gsap) {
      gsap.to(elements.spoilerShield, {
        autoAlpha: enabled ? 1 : 0,
        duration: animate ? 0.28 : 0,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }

  function setSearchScope(scope, animate, source) {
    const normalized = ["readers", "stories", "themes"].includes(scope)
      ? scope
      : "themes";
    interactionState.searchScope = normalized;
    section.dataset.socialSearchScope = normalized;

    elements.searchTabs.forEach((tab) => {
      const selected = tab.dataset.socialSearchScope === normalized;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.setAttribute("tabindex", selected ? "0" : "-1");
    });

    let value = interactionState.searchQuery;
    if (source !== "user" || !value) {
      if (normalized === "readers") {
        value = profileData[selectedProfileKey].name;
      } else if (normalized === "stories") {
        value = getProfileStories(selectedProfileKey)[
          Math.max(0, selectedStoryIndex)
        ]?.title || primaryStory.title;
      } else {
        value = selectedTheme || profileData[selectedProfileKey].themes[0];
      }
    }

    interactionState.searchQuery = value;
    if (elements.searchInput && document.activeElement !== elements.searchInput) {
      elements.searchInput.value = value;
    }

    if (elements.searchInput) {
      elements.searchInput.placeholder =
        normalized === "readers"
          ? "Search a reader"
          : normalized === "stories"
            ? "Search a shared story"
            : "Search a theme";
    }

    updateSearchSummary();

    if (animate && gsap) {
      pulse(elements.searchTabs.find(
        (tab) => tab.dataset.socialSearchScope === normalized,
      ));
      gsap.fromTo(
        elements.searchInput?.closest(".social-search-input-shell"),
        { filter: "brightness(1.12)" },
        {
          filter: "brightness(1)",
          duration: 0.22,
          ease: "power1.out",
          overwrite: "auto",
        },
      );
    }

    if (source === "user") {
      announce(`${capitalize(normalized)} search selected.`);
    }
  }

  function updateSearchSummary() {
    const scope = interactionState.searchScope;
    const query = String(interactionState.searchQuery || "").trim();
    const headings = {
      readers: "Search by reader name",
      stories: "Readers connected to this story",
      themes: "Readers matching this theme",
    };

    setText(elements.searchHeading, headings[scope]);
    setText(elements.searchCount, `${elements.resultCards.length} readers`);

    elements.resultCards.forEach((card) => {
      const key = card.dataset.socialResult || "kai";
      const profile = profileData[key] || profileData.kai;
      const detail = card.querySelector(".social-result-copy small");
      const matchStrong = card.querySelector(".social-result-match strong");
      const matchSmall = card.querySelector(".social-result-match small");

      if (scope === "themes") {
        setText(
          detail,
          `${profile.resultDetail} · ${query || profile.themes[0]}`,
        );
      } else if (scope === "stories") {
        setText(detail, `${profile.resultDetail} · shared story evidence`);
      } else {
        setText(detail, profile.resultDetail);
      }
      setText(matchStrong, profile.matchCount);
      setText(matchSmall, profile.matchLabel);
    });
  }

  function selectProfile(key, animate, options = {}) {
    const normalized = key in profileData ? key : "kai";
    const profile = profileData[normalized];
    const changed = selectedProfileKey !== normalized;
    selectedProfileKey = normalized;
    section.dataset.socialProfile = normalized;

    elements.resultCards.forEach((card) => {
      const selected = card.dataset.socialResult === normalized;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    setText(elements.visitedAvatar, profile.initial);
    setText(elements.visitedName, profile.name);
    setText(elements.visitedBio, profile.bio);
    setText(elements.sharedContext, profile.context);

    const resultCard = elements.resultCards.find(
      (card) => card.dataset.socialResult === normalized,
    );
    if (resultCard) {
      const avatarStyle = q(".social-result-avatar", resultCard)?.getAttribute("style");
      if (avatarStyle) elements.visitedAvatar?.setAttribute("style", avatarStyle);
    }

    renderProfileEvidence(normalized, options.preserveEvidence === true);
    renderVisitedFeed(normalized);
    updateSearchSummary();

    if (changed) {
      interactionState.following = false;
      renderFollowing(false, animate);
    }

    if (elements.followPayoff) {
      setText(
        q("strong", elements.followPayoff),
        `${profile.name} is now in your social feed.`,
      );
    }

    if (animate && gsap) {
      gsap.fromTo(
        [elements.visitedAvatar, elements.visitedName, elements.sharedContext],
        { autoAlpha: 0.5, y: 7 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.035,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
      pulse(resultCard);
    }

    if (options.source === "user") {
      announce(`${profile.name} profile selected.`);
    }
  }

  function renderProfileEvidence(profileKey, preserveEvidence) {
    const profile = profileData[profileKey] || profileData.kai;
    const stories = getProfileStories(profileKey);

    elements.mutualStoryButtons.forEach((button, index) => {
      const story = stories[index] || stories[0] || primaryStory;
      renderStoryTile(button, story);
      button.dataset.socialMutualStoryIndex = String(index);
      button.setAttribute(
        "aria-label",
        `Use ${story.title} as the evidence for ${profile.name}`,
      );
    });

    elements.themeButtons.forEach((button, index) => {
      const theme = profile.themes[index] || profile.themes[0];
      button.dataset.socialTheme = theme;
      button.textContent = capitalize(theme);
      button.setAttribute(
        "aria-label",
        `Use ${theme} as the evidence for ${profile.name}`,
      );
    });

    const themeStillValid = profile.themes.includes(selectedTheme);
    if (!preserveEvidence || (!themeStillValid && selectedStoryIndex < 0)) {
      selectedTheme = profile.themes[0];
      selectedStoryIndex = -1;
    }

    if (selectedStoryIndex >= 0) {
      selectSharedStory(
        clamp(selectedStoryIndex, 0, elements.mutualStoryButtons.length - 1),
        false,
      );
    } else {
      selectTheme(selectedTheme, false);
    }
  }

  function renderVisitedFeed(profileKey) {
    const profile = profileData[profileKey] || profileData.kai;
    const stories = getProfileStories(profileKey);

    elements.visitedFeed.forEach((row, index) => {
      const feed = profile.feed[index] || profile.feed[0];
      const story = stories[index] || stories[0] || primaryStory;
      const meta = q("[data-social-feed-title]", row);
      const body = q("p", row);
      setText(meta, `${story.title} · ${feed.type}`);
      setText(body, feed.text);
    });
  }

  function selectSharedStory(index, animate) {
    const safeIndex = clamp(
      Math.round(Number(index) || 0),
      0,
      Math.max(0, elements.mutualStoryButtons.length - 1),
    );
    const story = getProfileStories(selectedProfileKey)[safeIndex] || primaryStory;
    selectedStoryIndex = safeIndex;

    elements.mutualStoryButtons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === safeIndex;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    elements.themeButtons.forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });

    updateEvidenceSummary(
      story.title,
      `You both saved ${story.title} and wrote about related ideas.`,
    );

    if (interactionState.searchScope === "stories") {
      interactionState.searchQuery = story.title;
      if (elements.searchInput) elements.searchInput.value = story.title;
    }

    if (animate) {
      pulse(elements.mutualStoryButtons[safeIndex]);
      announce(`${story.title} selected as the discovery evidence.`);
    }
  }

  function selectTheme(theme, animate) {
    const profile = profileData[selectedProfileKey] || profileData.kai;
    const normalized = profile.themes.includes(theme)
      ? theme
      : profile.themes[0];
    selectedTheme = normalized;
    selectedStoryIndex = -1;

    elements.themeButtons.forEach((button) => {
      const selected = button.dataset.socialTheme === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    elements.mutualStoryButtons.forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });

    updateEvidenceSummary(
      capitalize(normalized),
      `${profile.name}'s public notes repeatedly return to ${normalized}.`,
    );

    if (interactionState.searchScope === "themes") {
      interactionState.searchQuery = normalized;
      if (elements.searchInput) elements.searchInput.value = normalized;
    }

    if (animate) {
      pulse(elements.themeButtons.find(
        (button) => button.dataset.socialTheme === normalized,
      ));
      announce(`${capitalize(normalized)} selected as the discovery evidence.`);
    }
  }

  function updateEvidenceSummary(title, detail) {
    setText(q("strong", elements.evidenceSummary), title);
    setText(q("small", elements.evidenceSummary), detail);
  }

  function renderFollowing(enabled, animate) {
    interactionState.following = Boolean(enabled);
    section.classList.toggle("is-social-following", enabled);
    elements.followButton?.setAttribute(
      "aria-pressed",
      enabled ? "true" : "false",
    );
    setText(elements.followButton, enabled ? "Following" : "Follow");

    if (!gsap) {
      if (elements.followPayoff) {
        elements.followPayoff.style.opacity = enabled ? "1" : "0";
      }
      return;
    }

    gsap.to(elements.followPayoff, {
      autoAlpha: enabled ? 1 : 0,
      y: enabled ? 0 : 8,
      duration: animate ? 0.32 : 0,
      ease: "power3.out",
      overwrite: "auto",
    });

    if (animate) pulse(elements.followButton);
  }

  async function hydrateDatabaseStories() {
    const loaded = await loadDatabaseStories();
    databaseStories = mergeUniqueStories(loaded, FALLBACK_STORIES).slice(0, 18);
    primaryStory = findTokyoGhoulRe(databaseStories) || FALLBACK_STORIES[0];

    // Keep Tokyo Ghoul:re first without duplicating it.
    databaseStories = mergeUniqueStories(
      [primaryStory],
      databaseStories,
    );

    renderDatabaseStories();
    applyPrimaryStory(primaryStory);
    selectProfile(selectedProfileKey, false, {
      preserveEvidence: false,
      source: "database",
    });
  }

  async function loadDatabaseStories() {
    try {
      if (!window.supabase?.createClient) return [...FALLBACK_STORIES];

      if (!window.__INKWELL_SOCIAL_SUPABASE_CLIENT__) {
        window.__INKWELL_SOCIAL_SUPABASE_CLIENT__ =
          window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      }
      supabaseClient = window.__INKWELL_SOCIAL_SUPABASE_CLIENT__;

      const result = await supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .limit(200);

      if (result.error) throw result.error;

      const normalized = dedupeStories(
        (result.data || [])
          .map(normalizeStory)
          .filter((story) => story.id && story.title)
          .filter((story) => !isExcludedStory(story.title)),
      );

      const selected = [];
      PREFERRED_STORY_TITLES.forEach((preferred) => {
        const match = findStoryByTitle(normalized, preferred);
        if (match && !selected.some((item) => item.id === match.id)) {
          selected.push(match);
        }
      });

      normalized
        .slice()
        .sort((a, b) => hashString(a.title) - hashString(b.title))
        .forEach((story) => {
          if (!selected.some((item) => item.id === story.id)) selected.push(story);
        });

      return selected;
    } catch (error) {
      console.warn("Inkwell social V8: database stories unavailable.", error);
      return [...FALLBACK_STORIES];
    }
  }

  function applyPrimaryStory(story) {
    if (!story) return;

    elements.primaryStoryTitles.forEach((node) => setText(node, story.title));
    elements.primaryStoryFallbacks.forEach((node) =>
      setText(node, abbreviateTitle(story.title)),
    );

    const reflection =
      "Identity changes when memory, fear, and belonging pull a person in different directions.";
    setText(elements.composerReflection, reflection);
    setText(elements.sharedReflection, reflection);
    setText(elements.profilePinReflection, reflection);

    elements.storyImages.forEach((image) => setStoryImage(image, story));
  }

  function renderDatabaseStories() {
    const favourites = mergeUniqueStories(
      [primaryStory],
      databaseStories,
    );

    elements.favouriteTiles.forEach((tile, index) => {
      renderStoryTile(tile, favourites[index] || FALLBACK_STORIES[index]);
    });

    elements.activityRows.forEach((row, index) => {
      const story = favourites[6 + index] || favourites[index] || primaryStory;
      setText(q("[data-social-activity-title]", row), story.title);
    });
  }

  function getProfileStories(profileKey) {
    const profile = profileData[profileKey] || profileData.kai;
    const selected = [];

    profile.storyPreferences.forEach((title) => {
      const story = findStoryByTitle(databaseStories, title);
      if (story && !selected.some((item) => item.id === story.id)) {
        selected.push(story);
      }
    });

    databaseStories.forEach((story) => {
      if (selected.length >= 3) return;
      if (!selected.some((item) => normalizeText(item.title) === normalizeText(story.title))) {
        selected.push(story);
      }
    });

    return selected.slice(0, 3);
  }

  function renderStoryTile(container, story) {
    if (!container || !story) return;

    const image = q("img", container);
    const title = q(
      "[data-social-story-title], [data-social-mutual-title]",
      container,
    );
    const fallback = q("[data-social-cover-fallback]", container);

    setText(title, story.title);
    setText(fallback, abbreviateTitle(story.title));
    setStoryImage(image, story);
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
    image.addEventListener(
      "error",
      () => {
        image.hidden = true;
      },
      { once: true },
    );
  }

  function normalizeStory(item) {
    const id = String(item?.id ?? "");
    return {
      id,
      title: String(item?.title || "Untitled story"),
      creator: String(
        item?.creator ?? item?.author ?? item?.writer ?? item?.artist ?? "",
      ),
      coverUrl: id ? getCoverUrlFromId(id) : "",
    };
  }

  function getCoverUrlFromId(id) {
    if (!id || !supabaseClient) return "";
    const path = `${COVER_FOLDER}/${id}.jpg`;
    const { data } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data?.publicUrl || "";
  }

  function findTokyoGhoulRe(stories) {
    return stories.find((story) => {
      const normalized = normalizeText(story.title);
      return TOKYO_GHOUL_RE_ALIASES.some(
        (alias) => normalized === normalizeText(alias),
      );
    }) || stories.find((story) => {
      const normalized = normalizeText(story.title);
      return normalized.includes("tokyo ghoul") && normalized.includes("re");
    });
  }

  function findStoryByTitle(stories, title) {
    const wanted = normalizeText(title);
    return stories.find((story) => normalizeText(story.title) === wanted) ||
      stories.find((story) => normalizeText(story.title).includes(wanted)) ||
      null;
  }

  function isExcludedStory(title) {
    const normalized = normalizeText(title);
    return EXCLUDED_STORY_ALIASES.some(
      (alias) => normalized === alias || normalized.includes(alias),
    );
  }

  function dedupeStories(stories) {
    const seen = new Set();
    return (stories || []).filter((story) => {
      const key = normalizeText(story?.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function mergeUniqueStories(...groups) {
    return dedupeStories(groups.flat().filter(Boolean));
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function abbreviateTitle(title) {
    const words = String(title || "Story").split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
  }

  function hashString(value) {
    let hash = 2166136261;
    for (const char of String(value || "")) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function getAnchorTransform(anchor) {
    if (!anchor || !elements.screen || !elements.sharedPost) {
      return { x: 0, y: 0, scale: 1 };
    }

    const screenRect = elements.screen.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const postWidth = Math.max(elements.sharedPost.offsetWidth, 330);
    const postHeight = Math.max(elements.sharedPost.offsetHeight, 220);
    const widthScale = anchorRect.width > 0 ? anchorRect.width / postWidth : 1;
    const heightScale = anchorRect.height > 0
      ? anchorRect.height / postHeight
      : widthScale;
    const scale = clamp(Math.min(widthScale, heightScale), 0.54, 1);
    const renderedWidth = postWidth * scale;
    const renderedHeight = postHeight * scale;

    return {
      x:
        anchorRect.left -
        screenRect.left +
        (anchorRect.width - renderedWidth) / 2,
      y:
        anchorRect.top -
        screenRect.top +
        (anchorRect.height - renderedHeight) / 2,
      scale,
    };
  }

  function pulse(target) {
    if (!gsap || !target) return;
    gsap.fromTo(
      target,
      { filter: "brightness(1.14)" },
      {
        filter: "brightness(1)",
        duration: 0.22,
        ease: "power1.out",
        overwrite: "auto",
      },
    );
  }

  function getCopyState(key) {
    return elements.copyStates.find(
      (item) => item.dataset.socialCopy === key,
    ) || null;
  }

  function showStatic() {
    section.classList.add("is-social-static");

    if (!gsap) {
      Object.values(elements.scenes).forEach((scene) => {
        scene.style.opacity = scene === elements.scenes.control ? "1" : "0";
        scene.style.visibility = scene === elements.scenes.control
          ? "visible"
          : "hidden";
      });
      return;
    }

    gsap.set(
      [
        elements.eyebrow,
        getCopyState("control"),
        ...elements.steps,
        elements.principle,
        elements.scenes.control,
        elements.composer,
        elements.livePreview,
      ].filter(Boolean),
      { autoAlpha: 1, clearProps: "transform" },
    );
    const staticAnchor = getAnchorTransform(elements.controlAnchor);
    gsap.set(elements.sharedPost, {
      autoAlpha: 1,
      x: staticAnchor.x,
      y: staticAnchor.y,
      scale: staticAnchor.scale,
      transformOrigin: "0 0",
      visibility: "visible",
      pointerEvents: "none",
    });
    renderAudience("private", false);
    renderSpoiler(false, false);
    setActiveAct("control", true);
  }

  function isNestedInManagedJourney() {
    return Boolean(
      MANAGED_BY_HOME_JOURNEY &&
        timeline?.parent &&
        timeline.parent !== gsap?.globalTimeline,
    );
  }

  function resetTimelineState() {
    if (!timeline || !gsap) return;
    const nested = isNestedInManagedJourney();
    timeline.pause();
    timeline.totalTime(0, true);
    setInitialState();
    timeline.invalidate();
    timeline.totalTime(0, true);
    timeline.paused(!nested);
    syncTimelineState(true);
  }

  function refreshTimelineState() {
    if (!timeline || !gsap) return;

    const nested = isNestedInManagedJourney();
    const currentTime = clamp(timeline.time(), 0, timeline.duration());

    // Always return the child to its authored starting geometry before
    // invalidate(). Otherwise GSAP can record a currently-transformed card as
    // the new start value and the next forward/reverse pass appears static.
    timeline.pause();
    timeline.totalTime(0, true);
    setInitialState();
    timeline.invalidate();
    timeline.time(currentTime, true);
    timeline.paused(!nested);
    syncTimelineState(true);
    renderDatabaseStories();
    applyPrimaryStory(primaryStory);
  }

  function resetInteractionState() {
    Object.keys(userLocks).forEach((key) => {
      userLocks[key] = false;
    });
    interactionState.audience = "private";
    interactionState.spoiler = false;
    interactionState.searchScope = "themes";
    interactionState.searchQuery = "freedom";
    interactionState.following = false;
    selectedProfileKey = "kai";
    selectedTheme = "freedom";
    selectedStoryIndex = -1;
    lastDemoSignature = "";
    renderAudience("private", false);
    renderSpoiler(false, false);
    selectProfile("kai", false, {
      preserveEvidence: false,
      source: "reset",
    });
    setSearchScope("themes", false, "reset");
    renderFollowing(false, false);
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
        paused: Boolean(timeline?.paused?.()),
        time: timeline?.time?.() || 0,
        duration: timeline?.duration?.() || 0,
        activeAct,
        audience: interactionState.audience,
        spoiler: interactionState.spoiler,
        selectedProfileKey,
        selectedTheme,
        selectedStoryIndex,
        following: interactionState.following,
        userLocks: { ...userLocks },
        primaryStory: primaryStory?.title || "",
        databaseStories: databaseStories.map((story) => story.title),
      }),
      destroy: () => {
        trigger?.kill?.(true);
        timeline?.kill?.();
        resizeObserver?.disconnect?.();
        cleanupCallbacks.splice(0).forEach((callback) => callback());
        window.__INKWELL_SOCIAL_V8_STARTED__ = false;
      },
      cleanup: () => trigger?.kill?.(true),
    };

    window.InkwellSection5Journey = api;
    window.InkwellSocialCinema = api;

    window.dispatchEvent(
      new CustomEvent("inkwell:section5-ready", { detail: api }),
    );
    window.dispatchEvent(
      new CustomEvent("inkwell:social-cinema-ready", { detail: api }),
    );
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function announce(message) {
    if (elements.status) elements.status.textContent = message;
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
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), wait);
    };
  }

  function getNavHeight() {
    const nav = document.querySelector("nav");
    return nav ? Math.max(0, Math.round(nav.getBoundingClientRect().height)) : 64;
  }
})();