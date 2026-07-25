/* ============================================================================
   INKWELL — SECTION 5: SOCIAL, ON YOUR TERMS (V7 INTERACTION-SAFE)

   Desktop managed journey:
   - published as one paused child timeline in the shared Sections 1–5 journey
   - three acts: Control -> Identity -> Discovery
   - the same reflection card moves between measured DOM anchors

   Interaction:
   - audience, spoiler, profile, search scope, reader results, shared stories,
     themes, and follow state are functional previews
   - result cards use native button hit areas; decorative children never capture
     pointer events
   ============================================================================ */

(() => {
  "use strict";

  const section = document.querySelector("#section-5-social");

  if (!section) {
    return;
  }

  window.__INKWELL_SOCIAL_CINEMA_BUILD__ =
    "2026-07-25-social-cinema-v7-interaction-safe";

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
  const ACTIVATE_IDENTITY_OFFSET = 0.18;
  const ACTIVATE_DISCOVERY_OFFSET = 0.18;
  const STANDALONE_SCRUB_SECONDS = 0.48;
  const EXCLUDED_STORY_ALIASES = [
    "attack on titan",
    "shingeki no kyojin",
    "vagabond",
  ];
  const PREFERRED_STORY_TITLES = [
    "Monster",
    "Vinland Saga",
    "Pluto",
    "Goodnight Punpun",
    "Berserk",
    "20th Century Boys",
    "Death Note",
    "Fullmetal Alchemist",
    "Hunter x Hunter",
  ];
  const FALLBACK_STORIES = [
    { id: "fallback-monster", title: "Monster", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-vinland", title: "Vinland Saga", creator: "Makoto Yukimura", coverUrl: "" },
    { id: "fallback-pluto", title: "Pluto", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-punpun", title: "Goodnight Punpun", creator: "Inio Asano", coverUrl: "" },
    { id: "fallback-berserk", title: "Berserk", creator: "Kentaro Miura", coverUrl: "" },
    { id: "fallback-20cb", title: "20th Century Boys", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-death-note", title: "Death Note", creator: "Tsugumi Ohba", coverUrl: "" },
    { id: "fallback-fma", title: "Fullmetal Alchemist", creator: "Hiromu Arakawa", coverUrl: "" },
    { id: "fallback-hxh", title: "Hunter x Hunter", creator: "Yoshihiro Togashi", coverUrl: "" },
  ];

  const elements = {
    pin: section.querySelector("[data-social-cinema-pin]"),
    screen: section.querySelector("[data-social-screen]"),
    toolbarStatus: section.querySelector("[data-social-toolbar-status]"),
    sceneNumber: section.querySelector("[data-social-scene-number]"),
    sceneLabel: section.querySelector("[data-social-scene-label]"),
    status: section.querySelector("[data-social-status]"),

    eyebrow: section.querySelector(".social-cinema__eyebrow"),
    copyStates: gsapSafeArray(
      section.querySelectorAll("[data-social-copy]"),
    ),
    steps: gsapSafeArray(section.querySelectorAll("[data-social-step]")),
    principle: section.querySelector(".social-cinema__principle"),

    scenes: {
      control: section.querySelector('[data-social-scene="control"]'),
      identity: section.querySelector('[data-social-scene="identity"]'),
      discovery: section.querySelector('[data-social-scene="discovery"]'),
    },

    composer: section.querySelector(".social-composer"),
    livePreview: section.querySelector(".social-live-preview"),
    postStage: section.querySelector(".social-post-stage"),
    controlAnchor: section.querySelector('[data-social-post-anchor="control"]'),
    identityAnchor: section.querySelector('[data-social-post-anchor="identity"]'),
    sharedPost: section.querySelector("[data-social-shared-post]"),
    visibilityBadge: section.querySelector("[data-social-visibility-badge]"),
    audienceButtons: gsapSafeArray(
      section.querySelectorAll("[data-social-audience]"),
    ),
    audienceSummary: section.querySelector("[data-social-audience-summary]"),
    previewTitle: section.querySelector("[data-social-preview-title]"),
    previewState: section.querySelector("[data-social-preview-state]"),
    previewHint: section.querySelector("[data-social-preview-hint]"),
    previewFooter: section.querySelector("[data-social-preview-footer]"),
    orbitAvatars: gsapSafeArray(
      section.querySelectorAll(".social-orbit-avatar"),
    ),
    spoilerToggle: section.querySelector("[data-social-spoiler-toggle]"),
    spoilerShield: section.querySelector("[data-social-spoiler-shield]"),
    spoilerReveal: section.querySelector("[data-social-spoiler-reveal]"),
    shareButton: section.querySelector("[data-social-share-button]"),

    profileShell: section.querySelector("[data-social-profile-shell]"),
    profileBanner: section.querySelector(".social-profile-banner"),
    profileHeader: section.querySelector(".social-profile-header"),
    profileAvatar: section.querySelector("[data-social-profile-avatar]"),
    profileBio: section.querySelector("[data-social-profile-bio]"),
    profileTags: gsapSafeArray(
      section.querySelectorAll("[data-social-profile-tags] .social-profile-tag"),
    ),
    profileStats: gsapSafeArray(
      section.querySelectorAll("[data-social-profile-stats] .social-profile-stat"),
    ),
    profileCovers: gsapSafeArray(
      section.querySelectorAll("[data-social-favourite-index]"),
    ),
    profilePinSlot: section.querySelector("[data-social-profile-slot]"),
    profilePin: section.querySelector("[data-social-profile-pin]"),
    profileActivityRows: gsapSafeArray(
      section.querySelectorAll(".social-activity-row"),
    ),
    profileEdit: section.querySelector("[data-social-profile-edit]"),

    searchPanel: section.querySelector(".social-search-panel"),
    searchInput: section.querySelector("[data-social-search-input]"),
    searchTabs: gsapSafeArray(
      section.querySelectorAll("[data-social-search-scope]"),
    ),
    resultCards: gsapSafeArray(
      section.querySelectorAll("[data-social-result]"),
    ),
    visitedProfile: section.querySelector("[data-social-visited-profile]"),
    visitedAvatar: section.querySelector(".social-visited-profile__avatar"),
    visitedName: section.querySelector(".social-visited-profile__copy h3"),
    visitedBio: section.querySelector(".social-visited-profile__copy p"),
    sharedContext: section.querySelector(".social-shared-context"),
    mutualStoryButtons: gsapSafeArray(
      section.querySelectorAll("[data-social-mutual-story-index]"),
    ),
    themeButtons: gsapSafeArray(
      section.querySelectorAll("[data-social-theme]"),
    ),
    evidenceSummary: section.querySelector("[data-social-evidence-summary]"),
    visitedFeed: gsapSafeArray(section.querySelectorAll(".social-feed-item")),
    followButton: section.querySelector("[data-social-follow]"),
    followPayoff: section.querySelector("[data-social-follow-payoff]"),

    favouriteTiles: gsapSafeArray(
      section.querySelectorAll("[data-social-favourite-index]"),
    ),
    activityRows: gsapSafeArray(
      section.querySelectorAll("[data-social-activity-index]"),
    ),
    feedRows: gsapSafeArray(
      section.querySelectorAll("[data-social-feed-index]"),
    ),
    storyCoverImages: gsapSafeArray(
      section.querySelectorAll(
        "[data-social-story-cover], [data-social-post-cover]",
      ),
    ),
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
    console.warn("Inkwell social cinema: required markup is missing.");
    return;
  }

  const profileData = {
    kai: {
      initial: "K",
      name: "kai.reads",
      bio: "Remembers the feeling before the theory.",
      context:
        "You both save stories about freedom, sacrifice, and difficult choices.",
      matchTitle: "3 shared stories",
      matchDetail: "Freedom · identity · difficult choices",
    },
    mira: {
      initial: "M",
      name: "mira.frames",
      bio: "Collects visual moments and quiet endings.",
      context:
        "You both return to visual storytelling about memory, grief, and what remains afterward.",
      matchTitle: "2 shared stories",
      matchDetail: "Memory · grief · cinematography",
    },
    ren: {
      initial: "R",
      name: "ren.afterwords",
      bio: "Writes long reflections about history and responsibility.",
      context:
        "You share themes of identity, history, responsibility, and inherited conflict.",
      matchTitle: "4 shared themes",
      matchDetail: "History · identity · responsibility",
    },
  };

  const stepMeta = {
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
        "Reader discovery: search by shared stories and themes, then follow a reader.",
    },
  };

  const audienceMeta = {
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
  };

  let timeline = null;
  let trigger = null;
  let activeStep = "control";
  let socialStories = [...FALLBACK_STORIES];
  let selectedProfileKey = "kai";
  let selectedTheme = "freedom";
  let selectedStoryIndex = -1;
  let supabaseClient = null;
  let resizeObserver = null;
  const cleanupCallbacks = [];
  const interactionState = {
    audience: "private",
    spoiler: false,
    following: false,
    searchScope: "themes",
    searchQuery: "freedom",
    userChanged: false,
    lastInteractionAt: 0,
  };

  setupInteractions();
  syncSectionFourCover();
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
      onUpdate: () => {
        syncActiveStep();
      },
    });

    const controlCopy = getCopyState("control");
    const identityCopy = getCopyState("identity");
    const discoveryCopy = getCopyState("discovery");

    timeline.addLabel("control", 0);

    timeline.to(
      [elements.eyebrow, controlCopy, ...elements.steps, elements.principle],
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.52,
        stagger: 0.045,
        ease: "power3.out",
      },
    );

    timeline.to(
      elements.scenes.control,
      {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power2.out",
      },
      0.08,
    );

    timeline.to(
      [elements.composer, elements.livePreview],
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
      },
      0.18,
    );

    timeline.to(
      elements.sharedPost,
      {
        autoAlpha: 1,
        scale: () => getAnchorTransform(elements.controlAnchor).scale,
        duration: 0.52,
        ease: "power3.out",
      },
      0.3,
    );

    timeline.addLabel("control-ready", OPENING_READY_TIME);

    /*
     * Scroll introduces the controls but never changes their values.
     * User-owned state must remain stable while the scrubber moves forward
     * or backward, so the timeline only applies non-geometric emphasis.
     */
    timeline.to({}, { duration: 0.34 }, 0.96);
    timeline.fromTo(
      elements.audienceButtons,
      { filter: "brightness(0.94)" },
      {
        filter: "brightness(1)",
        duration: 0.24,
        stagger: 0.035,
        ease: "power1.out",
      },
      1.38,
    );
    timeline.to({}, { duration: 0.38 });
    timeline.fromTo(
      elements.spoilerToggle,
      { boxShadow: "0 0 0 0 rgba(255, 159, 183, 0)" },
      {
        boxShadow: "0 0 0 5px rgba(255, 159, 183, 0.12)",
        duration: 0.16,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      2.1,
    );
    timeline.to(
      elements.shareButton,
      {
        filter: "brightness(1.1)",
        duration: 0.12,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      2.42,
    );
    timeline.to({}, { duration: 0.34 });

    /* Control -> Identity: reveal the destination before moving the post. */
    timeline.addLabel("identity-transition", 2.82);

    timeline.to(
      controlCopy,
      {
        autoAlpha: 0,
        x: -16,
        duration: 0.3,
        ease: "power2.in",
      },
      "identity-transition",
    );
    timeline.fromTo(
      identityCopy,
      { autoAlpha: 0, x: 16 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.4,
        ease: "power3.out",
      },
      "identity-transition+=0.16",
    );

    timeline.to(
      [elements.composer, elements.livePreview],
      {
        autoAlpha: 0,
        y: -14,
        scale: 0.988,
        duration: 0.36,
        ease: "power2.inOut",
      },
      "identity-transition",
    );
    timeline.to(
      elements.orbitAvatars,
      {
        autoAlpha: 0,
        scale: 0.76,
        duration: 0.2,
        stagger: 0.018,
        ease: "power2.in",
      },
      "identity-transition",
    );
    timeline.to(
      elements.spoilerShield,
      {
        autoAlpha: 0,
        duration: 0.18,
        ease: "power2.in",
      },
      "identity-transition",
    );

    timeline.set(
      elements.scenes.identity,
      { visibility: "visible" },
      "identity-transition+=0.12",
    );
    timeline.to(
      elements.scenes.identity,
      {
        autoAlpha: 1,
        duration: 0.32,
        ease: "power2.out",
      },
      "identity-transition+=0.12",
    );
    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.46,
        ease: "power3.out",
      },
      "identity-transition+=0.14",
    );
    timeline.to(
      [elements.profileBanner, elements.profileHeader],
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
        stagger: 0.04,
        ease: "power3.out",
      },
      "identity-transition+=0.18",
    );

    timeline.to(
      elements.sharedPost,
      {
        x: () => getAnchorTransform(elements.identityAnchor).x,
        y: () => getAnchorTransform(elements.identityAnchor).y,
        scale: () => getAnchorTransform(elements.identityAnchor).scale,
        duration: 0.66,
        ease: "power3.inOut",
      },
      "identity-transition+=0.2",
    );

    timeline.to(
      elements.scenes.control,
      {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
      },
      "identity-transition+=0.24",
    );

    timeline.to(
      elements.profilePin,
      {
        autoAlpha: 1,
        duration: 0.24,
        ease: "power2.out",
      },
      "identity-transition+=0.78",
    );
    timeline.to(
      elements.sharedPost,
      {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "identity-transition+=0.8",
    );

    timeline.addLabel("identity", 3.72);

    timeline.fromTo(
      elements.profileAvatar,
      { autoAlpha: 0, rotationY: -35, scale: 0.88 },
      {
        autoAlpha: 1,
        rotationY: 0,
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
        duration: 0.28,
        ease: "power3.out",
      },
      "identity+=0.06",
    );
    timeline.fromTo(
      elements.profileTags,
      { autoAlpha: 0, y: 7, scale: 0.96 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.26,
        stagger: 0.04,
        ease: "power3.out",
      },
      "identity+=0.14",
    );
    timeline.fromTo(
      elements.profileStats,
      { autoAlpha: 0, y: 7 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.035,
        ease: "power3.out",
      },
      "identity+=0.28",
    );
    timeline.fromTo(
      elements.profileCovers,
      { autoAlpha: 0, y: 12, rotation: -1.2 },
      {
        autoAlpha: 1,
        y: 0,
        rotation: 0,
        duration: 0.32,
        stagger: 0.05,
        ease: "power3.out",
      },
      "identity+=0.4",
    );
    timeline.fromTo(
      elements.profileActivityRows,
      { autoAlpha: 0, x: 12 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.06,
        ease: "power3.out",
      },
      "identity+=0.5",
    );
    timeline.to(
      elements.profileEdit,
      {
        borderColor: "rgba(123, 220, 255, 0.58)",
        color: "#eef8ff",
        duration: 0.14,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      "identity+=0.84",
    );
    timeline.to({}, { duration: 0.5 });

    /* Identity -> Discovery: no blank panel; both destinations form together. */
    timeline.addLabel("discovery-transition", 5.02);

    timeline.to(
      identityCopy,
      {
        autoAlpha: 0,
        x: -16,
        duration: 0.3,
        ease: "power2.in",
      },
      "discovery-transition",
    );
    timeline.fromTo(
      discoveryCopy,
      { autoAlpha: 0, x: 16 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.4,
        ease: "power3.out",
      },
      "discovery-transition+=0.16",
    );

    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 0,
        x: -34,
        scale: 0.98,
        duration: 0.42,
        ease: "power2.inOut",
      },
      "discovery-transition",
    );
    timeline.set(
      elements.scenes.discovery,
      { visibility: "visible" },
      "discovery-transition+=0.1",
    );
    timeline.to(
      elements.scenes.discovery,
      {
        autoAlpha: 1,
        duration: 0.32,
        ease: "power2.out",
      },
      "discovery-transition+=0.1",
    );
    timeline.fromTo(
      [elements.searchPanel, elements.visitedProfile],
      {
        autoAlpha: 0,
        y: 12,
        scale: 0.988,
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.44,
        stagger: 0.06,
        ease: "power3.out",
      },
      "discovery-transition+=0.14",
    );
    timeline.to(
      elements.scenes.identity,
      {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "discovery-transition+=0.24",
    );

    timeline.addLabel("discovery", 5.56);

    timeline.call(reconcileInteractionState, [], "discovery+=0.1");
    timeline.fromTo(
      elements.resultCards,
      { autoAlpha: 0, x: -14, y: 5 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.3,
        stagger: 0.055,
        ease: "power3.out",
      },
      "discovery+=0.12",
    );
    timeline.fromTo(
      [elements.sharedContext, ...elements.mutualStoryButtons, ...elements.themeButtons],
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.035,
        ease: "power3.out",
      },
      "discovery+=0.3",
    );
    timeline.fromTo(
      elements.visitedFeed,
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.06,
        ease: "power3.out",
      },
      "discovery+=0.48",
    );
    timeline.to(
      elements.followButton,
      {
        filter: "brightness(1.1)",
        duration: 0.13,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      "discovery+=0.84",
    );
    timeline.call(reconcileInteractionState, [], "discovery+=0.98");
    timeline.to({}, { duration: 1.10 });

    if (MANAGED_BY_HOME_JOURNEY) {
      timeline.pause(0);
      return;
    }

    trigger = ScrollTrigger.create({
      id: "inkwell-social-cinema-v7",
      trigger: section,
      animation: timeline,
      pin: elements.pin,
      pinSpacing: true,
      start: () => `top top+=${getNavHeight()}`,
      end: () => `+=${Math.max(4200, window.innerHeight * 4.9)}`,
      scrub: STANDALONE_SCRUB_SECONDS,
      fastScrollEnd: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: () => {
        syncActiveStep();
      },
    });

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
  }

  function setInitialState() {
    const controlCopy = getCopyState("control");

    gsap.set(
      [elements.eyebrow, ...elements.copyStates, ...elements.steps, elements.principle],
      { autoAlpha: 0, y: 14 },
    );
    gsap.set(controlCopy, { x: 0 });
    gsap.set(getCopyState("identity"), { x: 16 });
    gsap.set(getCopyState("discovery"), { x: 16 });

    gsap.set(Object.values(elements.scenes), {
      autoAlpha: 0,
      visibility: "hidden",
    });
    gsap.set(elements.scenes.control, { visibility: "visible" });

    gsap.set([elements.composer, elements.livePreview], {
      autoAlpha: 0,
      y: 16,
      scale: 0.99,
    });

    const initial = getAnchorTransform(elements.controlAnchor);
    gsap.set(elements.sharedPost, {
      autoAlpha: 0,
      x: initial.x,
      y: initial.y + 12,
      scale: initial.scale * 0.94,
      transformOrigin: "0 0",
      visibility: "visible",
      pointerEvents: "none",
    });

    gsap.set(elements.orbitAvatars, { autoAlpha: 0, scale: 0.76 });
    gsap.set(elements.spoilerShield, { autoAlpha: 0 });

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
    gsap.set(elements.profileAvatar, { autoAlpha: 0 });
    gsap.set(elements.profileBio, { autoAlpha: 0, y: 8 });
    gsap.set(elements.profileTags, { autoAlpha: 0, y: 7, scale: 0.96 });
    gsap.set(elements.profileStats, { autoAlpha: 0, y: 7 });
    gsap.set(elements.profileCovers, { autoAlpha: 0, y: 12, rotation: -1.2 });
    gsap.set(elements.profileActivityRows, { autoAlpha: 0, x: 12 });

    gsap.set([elements.searchPanel, elements.visitedProfile], {
      autoAlpha: 0,
      y: 12,
      scale: 0.988,
    });
    gsap.set(elements.resultCards, { autoAlpha: 0, x: -14, y: 5 });
    gsap.set(
      [elements.sharedContext, ...elements.mutualStoryButtons, ...elements.themeButtons],
      { autoAlpha: 0, y: 8 },
    );
    gsap.set(elements.visitedFeed, { autoAlpha: 0, y: 10 });
    gsap.set(elements.followPayoff, { autoAlpha: 0, y: 8 });

    reconcileInteractionState({ animate: false });
    selectProfile(selectedProfileKey, false);
    selectTheme(selectedTheme, false);
    reconcileInteractionState({ animate: false });
    setActiveStep("control");
  }

  function getAnchorTransform(anchor) {
    if (!anchor || !elements.screen || !elements.sharedPost) {
      return { x: 0, y: 0, scale: 1 };
    }

    const screenRect = elements.screen.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const postWidth = Math.max(elements.sharedPost.offsetWidth, 330);
    const postHeight = Math.max(elements.sharedPost.offsetHeight, 220);

    const widthScale = anchorRect.width > 0
      ? anchorRect.width / postWidth
      : 1;
    const heightScale = anchorRect.height > 0
      ? anchorRect.height / postHeight
      : widthScale;
    const scale = clamp(Math.min(widthScale, heightScale), 0.54, 1);
    const renderedWidth = postWidth * scale;
    const renderedHeight = postHeight * scale;

    return {
      x: anchorRect.left - screenRect.left + (anchorRect.width - renderedWidth) / 2,
      y: anchorRect.top - screenRect.top + (anchorRect.height - renderedHeight) / 2,
      scale,
    };
  }


  function showStatic() {
    section.classList.add("is-social-static");

    if (!gsap) {
      Object.values(elements.scenes).forEach((scene) => {
        scene.style.opacity = "1";
        scene.style.visibility = "visible";
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
      {
        autoAlpha: 1,
        clearProps: "transform",
      },
    );

    gsap.set(elements.sharedPost, { autoAlpha: 0, visibility: "hidden" });
    setActiveStep("control");
  }

  function syncActiveStep() {
    const currentTime = Number(timeline?.time?.() || 0);
    const identityTransition = Number(
      timeline?.labels?.["identity-transition"] ?? Number.POSITIVE_INFINITY,
    );
    const discoveryTransition = Number(
      timeline?.labels?.["discovery-transition"] ?? Number.POSITIVE_INFINITY,
    );

    const next = currentTime < identityTransition + ACTIVATE_IDENTITY_OFFSET
      ? "control"
      : currentTime < discoveryTransition + ACTIVATE_DISCOVERY_OFFSET
        ? "identity"
        : "discovery";

    if (next !== activeStep) {
      setActiveStep(next);
    }
  }

  function setActiveStep(key) {
    activeStep = key;
    const meta = stepMeta[key] || stepMeta.control;

    elements.steps.forEach((step) => {
      step.classList.toggle("is-active", step.dataset.socialStep === key);
    });

    elements.copyStates.forEach((copy) => {
      const active = copy.dataset.socialCopy === key;
      copy.classList.toggle("is-active", active);
      copy.setAttribute("aria-hidden", active ? "false" : "true");
    });

    section.dataset.socialActiveAct = key;

    Object.entries(elements.scenes).forEach(([sceneKey, scene]) => {
      const isActive = sceneKey === key;
      scene.classList.toggle("is-interactive", isActive);
      scene.setAttribute("aria-hidden", isActive ? "false" : "true");
      scene.toggleAttribute("inert", !isActive);

      if (!isActive && scene.contains(document.activeElement)) {
        document.activeElement?.blur?.();
      }
    });

    const sharedPostActive =
      key === "control" &&
      Number(gsap?.getProperty(elements.sharedPost, "opacity") || 0) > 0.2;
    elements.sharedPost.classList.toggle("is-interactive", sharedPostActive);
    elements.sharedPost.setAttribute(
      "aria-hidden",
      sharedPostActive ? "false" : "true",
    );
    elements.sharedPost.toggleAttribute("inert", !sharedPostActive);

    reconcileInteractionState({ animate: false });

    if (elements.toolbarStatus) {
      elements.toolbarStatus.textContent = meta.status;
    }
    if (elements.sceneNumber) {
      elements.sceneNumber.textContent = meta.number;
    }
    if (elements.sceneLabel) {
      elements.sceneLabel.textContent = meta.label;
    }
    if (elements.status) {
      elements.status.textContent = meta.announcement;
    }
  }

  function setupInteractions() {
    const listen = (target, type, handler, options) => {
      if (!target) {
        return;
      }
      target.addEventListener(type, handler, options);
      cleanupCallbacks.push(() => target.removeEventListener(type, handler, options));
    };

    const markUserInteraction = () => {
      interactionState.userChanged = true;
      interactionState.lastInteractionAt = performance.now();
      section.classList.add("has-social-user-state");
    };

    const settleScrollInterpolation = () => {
      window.InkwellHomeJourney?.settleScroll?.();
      trigger?.getTween?.()?.progress?.(1);
    };

    listen(section, "pointerdown", settleScrollInterpolation, {
      capture: true,
      passive: true,
    });
    listen(section, "focusin", settleScrollInterpolation, true);

    const audienceGroup = elements.audienceButtons[0]?.parentElement || null;
    audienceGroup?.setAttribute("role", "radiogroup");
    audienceGroup?.setAttribute("aria-label", "Reflection audience");

    elements.audienceButtons.forEach((button, index) => {
      button.setAttribute("role", "radio");
      listen(button, "click", () => {
        markUserInteraction();
        setAudience(button.dataset.socialAudience || "private", true, true);
      });
      listen(button, "keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
          return;
        }
        event.preventDefault();
        const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
        const nextIndex = (index + direction + elements.audienceButtons.length) %
          elements.audienceButtons.length;
        const nextButton = elements.audienceButtons[nextIndex];
        nextButton?.focus();
        markUserInteraction();
        setAudience(nextButton?.dataset.socialAudience || "private", true, true);
      });
    });

    listen(elements.spoilerToggle, "click", () => {
      markUserInteraction();
      const next = elements.spoilerToggle.getAttribute("aria-pressed") !== "true";
      setSpoiler(next, true, true);
    });

    listen(elements.spoilerReveal, "click", () => {
      markUserInteraction();
      setSpoiler(false, true, true);
      announce("Spoiler reflection revealed.");
    });

    listen(elements.shareButton, "click", () => {
      markUserInteraction();
      if (gsap) {
        gsap.fromTo(
          elements.shareButton,
          { filter: "brightness(1.12)" },
          {
            filter: "brightness(1)",
            duration: 0.18,
            ease: "power1.out",
            overwrite: "auto",
          },
        );
      }
      announce("Reflection sharing preview updated.");
    });

    listen(elements.profileEdit, "click", () => {
      markUserInteraction();
      const editing = !elements.profileShell.classList.contains("is-editing");
      elements.profileShell.classList.toggle("is-editing", editing);
      elements.profileEdit.setAttribute("aria-pressed", editing ? "true" : "false");
      elements.profileEdit.textContent = editing ? "Save profile" : "Edit profile";

      if (gsap) {
        gsap.fromTo(
          [elements.profileAvatar, elements.profileEdit],
          { filter: "brightness(1.12)" },
          {
            filter: "brightness(1)",
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
          },
        );
      }
      announce(editing ? "Profile editing preview opened." : "Profile preview saved.");
    });

    const searchTabList = elements.searchTabs[0]?.parentElement || null;
    searchTabList?.setAttribute("role", "tablist");
    searchTabList?.setAttribute("aria-label", "Discovery search type");

    elements.searchTabs.forEach((tab) => {
      tab.setAttribute("role", "tab");
      listen(tab, "click", () => {
        markUserInteraction();
        setSearchScope(tab.dataset.socialSearchScope || "readers", true);
      });
    });

    listen(elements.searchInput, "input", () => {
      markUserInteraction();
      interactionState.searchQuery = elements.searchInput.value;
    });

    elements.resultCards.forEach((card) => {
      listen(card, "click", () => {
        markUserInteraction();
        selectProfile(card.dataset.socialResult || "kai", true);
      });
    });

    elements.mutualStoryButtons.forEach((button) => {
      listen(button, "click", () => {
        markUserInteraction();
        const index = Number(button.dataset.socialMutualStoryIndex || 0);
        selectSharedStory(index, true);
      });
    });

    elements.themeButtons.forEach((button) => {
      listen(button, "click", () => {
        markUserInteraction();
        selectTheme(button.dataset.socialTheme || "freedom", true);
      });
    });

    listen(elements.followButton, "click", () => {
      markUserInteraction();
      const isFollowing =
        elements.followButton.getAttribute("aria-pressed") === "true";
      setFollowing(!isFollowing, true, true);
    });

    listen(window, "inkwell:section4-ready", syncSectionFourCover);
    listen(window, "inkwell:home-journey-ready", syncSectionFourCover);

    const onResize = debounce(() => {
      if (!timeline || !gsap) {
        return;
      }
      const currentTime = timeline.time();
      timeline.invalidate();
      timeline.time(currentTime, true);
      reconcileInteractionState({ animate: false });
    }, 120);
    listen(window, "resize", onResize, { passive: true });

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(onResize);
      [elements.screen, elements.controlAnchor, elements.identityAnchor]
        .filter(Boolean)
        .forEach((item) => resizeObserver.observe(item));
    }
  }

  function setAudience(value, animate, shouldAnnounce) {
    const normalized = value in audienceMeta ? value : "private";
    const meta = audienceMeta[normalized];
    interactionState.audience = normalized;

    elements.audienceButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.dataset.socialAudience === normalized ? "true" : "false",
      );
      const selected = button.dataset.socialAudience === normalized;
      button.setAttribute("aria-checked", selected ? "true" : "false");
      button.setAttribute("tabindex", selected ? "0" : "-1");
    });

    setText(elements.visibilityBadge, meta.label);
    setText(elements.audienceSummary, meta.summary);
    setText(elements.previewTitle, meta.previewTitle);
    setText(elements.previewState, meta.previewState);
    setText(elements.previewHint, meta.hint);
    setText(elements.previewFooter, meta.footer);

    if (gsap && animate) {
      gsap.to(elements.orbitAvatars, {
        autoAlpha: meta.orbitCount ? 1 : 0,
        scale: meta.orbitCount ? 1 : 0.76,
        duration: 0.22,
        stagger: 0.025,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.fromTo(
        [elements.visibilityBadge, elements.previewState],
        { scale: 0.93 },
        {
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.6)",
          overwrite: "auto",
        },
      );
    }

    if (shouldAnnounce) {
      announce(`${meta.label} audience selected.`);
    }
  }

  function setSpoiler(enabled, animate, shouldAnnounce) {
    interactionState.spoiler = Boolean(enabled);
    elements.spoilerToggle?.setAttribute(
      "aria-pressed",
      enabled ? "true" : "false",
    );
    elements.spoilerShield?.classList.toggle("is-visible", enabled);
    section.classList.toggle("is-social-spoiler-enabled", enabled);

    if (gsap && animate) {
      gsap.to(elements.spoilerShield, {
        autoAlpha: enabled ? 1 : 0,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    if (shouldAnnounce) {
      announce(
        enabled
          ? "Spoiler protection enabled."
          : "Spoiler protection disabled.",
      );
    }
  }

  function setSearchScope(scope, shouldAnnounce) {
    const normalized = ["readers", "stories", "themes"].includes(scope)
      ? scope
      : "readers";
    interactionState.searchScope = normalized;

    elements.searchTabs.forEach((tab) => {
      const selected = tab.dataset.socialSearchScope === normalized;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", selected ? "true" : "false");
    });

    if (normalized === "readers") {
      elements.searchInput.placeholder = "Try “freedom”";
      elements.searchInput.value = selectedTheme;
    } else if (normalized === "stories") {
      const story = getMutualStory(selectedStoryIndex >= 0 ? selectedStoryIndex : 0);
      elements.searchInput.placeholder = "Search a shared story";
      elements.searchInput.value = story.title;
    } else {
      elements.searchInput.placeholder = "Search a theme";
      elements.searchInput.value = selectedTheme;
    }

    interactionState.searchQuery = elements.searchInput?.value || "";

    if (gsap) {
      gsap.fromTo(
        elements.searchInput.closest(".social-search-input-shell"),
        { scale: 0.985 },
        {
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.5)",
          overwrite: "auto",
        },
      );
    }

    if (shouldAnnounce) {
      announce(`${capitalize(normalized)} search selected.`);
    }
  }

  function selectProfile(key, animate) {
    const profile = profileData[key] || profileData.kai;
    selectedProfileKey = key in profileData ? key : "kai";

    elements.resultCards.forEach((card) => {
      const selected = card.dataset.socialResult === selectedProfileKey;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    setText(elements.visitedAvatar, profile.initial);
    setText(elements.visitedName, profile.name);
    setText(elements.visitedBio, profile.bio);
    setText(elements.sharedContext, profile.context);
    updateEvidenceSummary(profile.matchTitle, profile.matchDetail);

    if (elements.followPayoff) {
      const strong = elements.followPayoff.querySelector("strong");
      if (strong) {
        strong.textContent = `${profile.name} is now in your social feed.`;
      }
    }

    setFollowing(false, false, false);

    if (gsap && animate) {
      gsap.fromTo(
        elements.visitedProfile,
        { autoAlpha: 0.82, x: 10 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.28,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }

    if (animate) {
      announce(`${profile.name} profile selected.`);
    }
  }

  function selectSharedStory(index, animate) {
    const safeIndex = clamp(Math.round(index), 0, elements.mutualStoryButtons.length - 1);
    const story = getMutualStory(safeIndex);
    selectedStoryIndex = safeIndex;

    elements.mutualStoryButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-selected", buttonIndex === safeIndex);
    });
    elements.themeButtons.forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });

    setSearchScope("stories", false);
    elements.searchInput.value = story.title;

    const profileKeys = ["kai", "mira", "ren"];
    selectProfile(profileKeys[safeIndex % profileKeys.length], false);
    updateEvidenceSummary(
      story.title,
      `Readers who saved ${story.title} and wrote about similar ideas.`,
    );

    if (gsap && animate) {
      gsap.fromTo(
        elements.mutualStoryButtons[safeIndex],
        { filter: "brightness(1.12)" },
        {
          filter: "brightness(1)",
          duration: 0.18,
          ease: "power1.out",
          overwrite: "auto",
        },
      );
    }

    if (animate) {
      announce(`${story.title} selected as a discovery reason.`);
    }
  }

  function selectTheme(theme, animate) {
    const normalized = ["freedom", "identity", "memory"].includes(theme)
      ? theme
      : "freedom";
    selectedTheme = normalized;
    selectedStoryIndex = -1;

    elements.themeButtons.forEach((button) => {
      const selected = button.dataset.socialTheme === normalized;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    elements.mutualStoryButtons.forEach((button) => {
      button.classList.remove("is-selected");
    });

    setSearchScope("themes", false);
    elements.searchInput.value = normalized;

    const profileByTheme = {
      freedom: "kai",
      identity: "ren",
      memory: "mira",
    };
    selectProfile(profileByTheme[normalized], false);
    updateEvidenceSummary(
      capitalize(normalized),
      `Readers whose public notes repeatedly explore ${normalized}.`,
    );

    if (gsap && animate) {
      const active = elements.themeButtons.find(
        (button) => button.dataset.socialTheme === normalized,
      );
      gsap.fromTo(
        active,
        { filter: "brightness(1.12)" },
        {
          filter: "brightness(1)",
          duration: 0.18,
          ease: "power1.out",
          overwrite: "auto",
        },
      );
    }

    if (animate) {
      announce(`${capitalize(normalized)} theme selected.`);
    }
  }

  function updateEvidenceSummary(title, detail) {
    if (!elements.evidenceSummary) {
      return;
    }
    const strong = elements.evidenceSummary.querySelector("strong");
    const small = elements.evidenceSummary.querySelector("small");
    setText(strong, title);
    setText(small, detail);
  }

  function setFollowing(enabled, animate, shouldAnnounce) {
    interactionState.following = Boolean(enabled);
    elements.followButton?.setAttribute(
      "aria-pressed",
      enabled ? "true" : "false",
    );

    if (elements.followButton) {
      elements.followButton.textContent = enabled ? "Following" : "Follow";
    }

    if (gsap && animate) {
      gsap.fromTo(
        elements.followButton,
        { filter: "brightness(1.12)" },
        {
          filter: "brightness(1)",
          duration: 0.18,
          ease: "power1.out",
          overwrite: "auto",
        },
      );
      gsap.to(elements.followPayoff, {
        autoAlpha: enabled ? 1 : 0,
        y: enabled ? 0 : 8,
        duration: 0.3,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else if (elements.followPayoff) {
      elements.followPayoff.style.opacity = enabled ? "1" : "0";
    }

    if (shouldAnnounce) {
      announce(enabled ? "Reader followed." : "Reader unfollowed.");
    }
  }

  function reconcileInteractionState(options = {}) {
    const animate = Boolean(options.animate);

    setAudience(interactionState.audience, animate, false);
    setSpoiler(interactionState.spoiler, animate, false);
    setFollowing(interactionState.following, animate, false);

    if (elements.searchInput && document.activeElement !== elements.searchInput) {
      elements.searchInput.value = interactionState.searchQuery || selectedTheme;
    }

    elements.searchTabs.forEach((tab) => {
      const selected = tab.dataset.socialSearchScope === interactionState.searchScope;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.setAttribute("tabindex", selected ? "0" : "-1");
    });
  }

  function resetInteractionState() {
    interactionState.audience = "private";
    interactionState.spoiler = false;
    interactionState.following = false;
    interactionState.searchScope = "themes";
    interactionState.searchQuery = "freedom";
    interactionState.userChanged = false;
    interactionState.lastInteractionAt = 0;
    section.classList.remove("has-social-user-state");
    selectedProfileKey = "kai";
    selectedTheme = "freedom";
    selectedStoryIndex = -1;
    selectProfile("kai", false);
    selectTheme("freedom", false);
    reconcileInteractionState({ animate: false });
  }

  function syncSectionFourCover() {
    const source = document.querySelector("#section-4 [data-story-cover]");
    const src = source?.currentSrc || source?.getAttribute("src") || "";

    if (!src) {
      if (source && source.dataset.socialCoverListener !== "true") {
        source.dataset.socialCoverListener = "true";
        source.addEventListener("load", syncSectionFourCover, { once: true });
      }
      return;
    }

    elements.storyCoverImages.forEach((image) => {
      image.src = src;
      image.hidden = false;
    });
  }

  async function hydrateDatabaseStories() {
    const stories = await loadDatabaseStories();
    socialStories = stories.length >= 7
      ? stories
      : mergeUniqueStories(stories, FALLBACK_STORIES).slice(0, 9);
    renderDatabaseStories();
  }

  async function loadDatabaseStories() {
    try {
      if (!window.supabase?.createClient) {
        return [...FALLBACK_STORIES];
      }

      if (!window.__INKWELL_SOCIAL_SUPABASE_CLIENT__) {
        window.__INKWELL_SOCIAL_SUPABASE_CLIENT__ =
          window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      }
      supabaseClient = window.__INKWELL_SOCIAL_SUPABASE_CLIENT__;

      const result = await supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .limit(120);

      if (result.error) {
        throw result.error;
      }

      const normalized = dedupeStories(
        (result.data || [])
          .map(normalizeStory)
          .filter((story) => story.id && story.title)
          .filter((story) => !isExcludedStory(story.title)),
      );

      const selected = [];
      PREFERRED_STORY_TITLES.forEach((preferred) => {
        const match = normalized.find(
          (story) => normalizeText(story.title) === normalizeText(preferred),
        );
        if (match && !selected.some((item) => item.id === match.id)) {
          selected.push(match);
        }
      });

      normalized
        .slice()
        .sort((a, b) => hashString(a.title) - hashString(b.title))
        .forEach((story) => {
          if (!selected.some((item) => item.id === story.id)) {
            selected.push(story);
          }
        });

      return selected.slice(0, 12);
    } catch (error) {
      console.warn("Inkwell social cinema: database stories unavailable.", error);
      return [...FALLBACK_STORIES];
    }
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

  function renderDatabaseStories() {
    elements.favouriteTiles.forEach((tile, index) => {
      renderStoryTile(tile, socialStories[index] || FALLBACK_STORIES[index]);
    });

    elements.mutualStoryButtons.forEach((button, index) => {
      const story = getMutualStory(index);
      renderStoryTile(button, story);
      button.setAttribute(
        "aria-label",
        `Use ${story.title} as a reader discovery reason`,
      );
    });

    elements.activityRows.forEach((row, index) => {
      const story = socialStories[7 + index] || socialStories[index] || FALLBACK_STORIES[index];
      setText(row.querySelector("[data-social-activity-title]"), story.title);
    });

    elements.feedRows.forEach((row, index) => {
      const story = socialStories[5 + index] || socialStories[index] || FALLBACK_STORIES[index];
      const type = index === 0 ? "Note" : "Reflection";
      setText(row.querySelector("[data-social-feed-title]"), `${story.title} · ${type}`);
    });
  }

  function renderStoryTile(container, story) {
    if (!container || !story) {
      return;
    }

    const image = container.querySelector("img");
    const title = container.querySelector(
      "[data-social-story-title], [data-social-mutual-title]",
    );
    const fallback = container.querySelector("[data-social-cover-fallback]");

    setText(title, story.title);
    setText(fallback, abbreviateTitle(story.title));

    if (!image || !story.coverUrl) {
      if (image) {
        image.hidden = true;
      }
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

  function getMutualStory(index) {
    return socialStories[4 + index] || socialStories[index] || FALLBACK_STORIES[index];
  }

  function getCoverUrlFromId(id) {
    if (!id || !supabaseClient) {
      return "";
    }
    const path = `${COVER_FOLDER}/${id}.jpg`;
    const { data } = supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    return data?.publicUrl || "";
  }

  function dedupeStories(stories) {
    const seen = new Set();
    return stories.filter((story) => {
      const key = normalizeText(story.title);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  function mergeUniqueStories(primary, fallback) {
    return dedupeStories([...(primary || []), ...(fallback || [])]);
  }

  function isExcludedStory(title) {
    const normalized = normalizeText(title);
    return EXCLUDED_STORY_ALIASES.some(
      (alias) => normalized === alias || normalized.includes(alias),
    );
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
    const words = String(title || "Story")
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 3).toUpperCase();
    }
    return words
      .slice(0, 3)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function hashString(value) {
    let hash = 2166136261;
    for (const char of String(value || "")) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function getCopyState(key) {
    return elements.copyStates.find(
      (item) => item.dataset.socialCopy === key,
    ) || null;
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function announce(message) {
    if (elements.status) {
      elements.status.textContent = message;
    }
  }

  function isNestedInManagedJourney() {
    return Boolean(
      MANAGED_BY_HOME_JOURNEY &&
        timeline?.parent &&
        timeline.parent !== gsap?.globalTimeline,
    );
  }

  function resetTimelineState() {
    if (!timeline) {
      if (gsap) {
        setInitialState();
      }
      return;
    }

    const nested = isNestedInManagedJourney();
    timeline.totalTime(0, true);
    setInitialState();
    timeline.paused(!nested);
  }

  function refreshTimelineState() {
    if (!timeline) {
      return;
    }

    const nested = isNestedInManagedJourney();
    const currentTime = timeline.time();
    timeline.invalidate();

    if (currentTime <= 0.001) {
      timeline.totalTime(0, true);
      setInitialState();
    } else {
      timeline.time(currentTime, true);
    }

    timeline.paused(!nested);
    syncActiveStep();
    reconcileInteractionState({ animate: false });
    syncSectionFourCover();
    renderDatabaseStories();
  }

  function publishApi() {
    const api = {
      section,
      timeline,
      trigger,
      reset: resetTimelineState,
      refresh: refreshTimelineState,
      getNavigationTime: () => {
        const readyTime = Number(timeline?.labels?.["control-ready"]);
        return Number.isFinite(readyTime) ? readyTime : OPENING_READY_TIME;
      },
      debug: () => ({
        managed: MANAGED_BY_HOME_JOURNEY,
        nested: isNestedInManagedJourney(),
        paused: Boolean(timeline?.paused?.()),
        progress: timeline?.progress?.() || 0,
        activeStep,
        selectedProfileKey,
        selectedTheme,
        selectedStoryIndex,
        interactionState: { ...interactionState },
        databaseStories: socialStories.map((story) => story.title),
      }),
      resetInteractions: resetInteractionState,
      destroy: () => {
        trigger?.kill?.(true);
        timeline?.kill?.();
        resizeObserver?.disconnect?.();
        cleanupCallbacks.splice(0).forEach((cleanup) => cleanup());
      },
      cleanup: () => {
        trigger?.kill?.(true);
        resizeObserver?.disconnect?.();
      },
      showStatic,
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

  function getNavHeight() {
    const nav = document.querySelector("nav");
    return nav
      ? Math.max(0, Math.round(nav.getBoundingClientRect().height))
      : 64;
  }

  function capitalize(value) {
    const text = String(value || "");
    return text ? text[0].toUpperCase() + text.slice(1) : "";
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function debounce(callback, wait) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), wait);
    };
  }

  function gsapSafeArray(collection) {
    return Array.from(collection || []);
  }
})();