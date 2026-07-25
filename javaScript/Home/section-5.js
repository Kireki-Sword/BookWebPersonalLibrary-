/* ============================================================================
   INKWELL — SECTION 5: SOCIAL, ON YOUR TERMS (V5 PREMIUM)

   Desktop managed journey:
   - published as a paused child timeline inside the shared Sections 1–5 stage
   - three acts: Control -> Identity -> Discovery
   - the same reflection card travels from sharing controls into the profile

   Natural / reduced-motion layout:
   - all three acts remain readable without a pinned child ScrollTrigger
   ============================================================================ */

(() => {
  "use strict";

  const section = document.querySelector("#section-5-social");

  if (!section) {
    return;
  }

  window.__INKWELL_SOCIAL_CINEMA_BUILD__ =
    "2026-07-24-social-cinema-v5-premium";

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
    profileAvatar: section.querySelector("[data-social-profile-avatar]"),
    profileBio: section.querySelector("[data-social-profile-bio]"),
    profileTags: gsapSafeArray(
      section.querySelectorAll("[data-social-profile-tags] .social-profile-tag"),
    ),
    profileStats: gsapSafeArray(
      section.querySelectorAll("[data-social-profile-stats] .social-profile-stat"),
    ),
    profileCovers: gsapSafeArray(
      section.querySelectorAll(".social-cover-tile"),
    ),
    profilePinSlot: section.querySelector("[data-social-profile-slot]"),
    profilePin: section.querySelector("[data-social-profile-pin]"),
    profileActivityRows: gsapSafeArray(
      section.querySelectorAll(".social-activity-row"),
    ),
    profileEdit: section.querySelector("[data-social-profile-edit]"),

    searchPanel: section.querySelector(".social-search-panel"),
    searchInput: section.querySelector("[data-social-search-input]"),
    searchTabs: gsapSafeArray(section.querySelectorAll(".social-search-tab")),
    resultCards: gsapSafeArray(
      section.querySelectorAll("[data-social-result]"),
    ),
    visitedProfile: section.querySelector("[data-social-visited-profile]"),
    visitedAvatar: section.querySelector(".social-visited-profile__avatar"),
    visitedName: section.querySelector(".social-visited-profile__copy h3"),
    visitedBio: section.querySelector(".social-visited-profile__copy p"),
    sharedContext: section.querySelector(".social-shared-context"),
    mutualCopyStrong: section.querySelector(".social-mutual-copy strong"),
    mutualCopySmall: section.querySelector(".social-mutual-copy small"),
    visitedFeed: gsapSafeArray(section.querySelectorAll(".social-feed-item")),
    followButton: section.querySelector("[data-social-follow]"),
    followPayoff: section.querySelector("[data-social-follow-payoff]"),

    storyCoverImages: gsapSafeArray(
      section.querySelectorAll(
        "[data-social-story-cover], " +
          "[data-social-post-cover], " +
          "[data-social-favourite-cover]",
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
    elements.profilePinSlot,
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
        "You both saved Attack on Titan and write about freedom, sacrifice, and difficult choices.",
      matchTitle: "3 shared stories",
      matchDetail: "Freedom · identity · difficult choices",
    },
    mira: {
      initial: "M",
      name: "mira.frames",
      bio: "Collects visual moments and quiet endings.",
      context:
        "You both save visual moments and return to stories about memory, grief, and what remains afterward.",
      matchTitle: "2 shared stories",
      matchDetail: "Memory · grief · cinematography",
    },
    ren: {
      initial: "R",
      name: "ren.afterwords",
      bio: "Writes long reflections about history and responsibility.",
      context:
        "You share four themes: identity, history, responsibility, and the cost of inherited conflict.",
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
        "Profile identity: favourites and public reflections shape a reader profile.",
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
        "Public posts can appear in story pages, profile activity, and reader search.",
      footer: "Community",
      orbitCount: 4,
    },
  };

  const OPENING_READY_TIME = 1.04;

  let timeline = null;
  let trigger = null;
  let activeStep = "control";

  setupInteractions();
  syncStoryCovers();

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
        syncActiveStep(timeline?.progress?.() || 0);
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
        duration: 0.62,
        stagger: 0.055,
        ease: "power3.out",
      },
    );

    timeline.to(
      elements.scenes.control,
      {
        autoAlpha: 1,
        duration: 0.38,
        ease: "power2.out",
      },
      0.12,
    );

    timeline.to(
      [elements.composer, elements.livePreview],
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.56,
        stagger: 0.07,
        ease: "power3.out",
      },
      0.24,
    );

    timeline.to(
      elements.sharedPost,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.62,
        ease: "power3.out",
      },
      0.38,
    );

    timeline.addLabel("control-ready", OPENING_READY_TIME);

    /* Private -> followers -> public with spoiler protection. */
    setTimelineAudience("private", 1.08);
    timeline.to({}, { duration: 0.42 });

    setTimelineAudience("followers", 1.58);
    timeline.to(
      elements.orbitAvatars,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.3,
        stagger: 0.045,
        ease: "back.out(1.45)",
      },
      1.6,
    );
    timeline.to({}, { duration: 0.5 });

    setTimelineAudience("public", 2.26);
    timeline.to(
      elements.orbitAvatars,
      {
        scale: 1.06,
        duration: 0.16,
        repeat: 1,
        yoyo: true,
        stagger: 0.025,
        ease: "power2.inOut",
      },
      2.28,
    );
    timeline.set(
      elements.spoilerToggle,
      { attr: { "aria-pressed": "true" } },
      2.42,
    );
    timeline.to(
      elements.spoilerShield,
      {
        autoAlpha: 1,
        duration: 0.32,
        ease: "power2.out",
      },
      2.44,
    );
    timeline.to(
      elements.shareButton,
      {
        scale: 1.045,
        duration: 0.14,
        repeat: 1,
        yoyo: true,
        ease: "power2.inOut",
      },
      2.78,
    );
    timeline.to({}, { duration: 0.46 });

    /* The real shared post docks into the profile instead of floating above it. */
    timeline.addLabel("identity-transition", 3.3);

    timeline.to(
      controlCopy,
      {
        autoAlpha: 0,
        x: -18,
        duration: 0.34,
        ease: "power2.in",
      },
      "identity-transition",
    );
    timeline.fromTo(
      identityCopy,
      { autoAlpha: 0, x: 18 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.46,
        ease: "power3.out",
      },
      "identity-transition+=0.2",
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
    timeline.to(
      elements.orbitAvatars,
      {
        autoAlpha: 0,
        scale: 0.74,
        duration: 0.24,
        stagger: 0.02,
        ease: "power2.in",
      },
      "identity-transition",
    );
    timeline.to(
      elements.spoilerShield,
      {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
      },
      "identity-transition",
    );
    timeline.to(
      elements.scenes.control,
      {
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in",
      },
      "identity-transition+=0.18",
    );

    timeline.set(
      elements.scenes.identity,
      { visibility: "visible" },
      "identity-transition+=0.22",
    );
    timeline.to(
      elements.scenes.identity,
      {
        autoAlpha: 1,
        duration: 0.42,
        ease: "power2.out",
      },
      "identity-transition+=0.22",
    );
    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.62,
        ease: "power3.out",
      },
      "identity-transition+=0.25",
    );

    timeline.to(
      elements.sharedPost,
      {
        x: () => getProfileDockTransform().x,
        y: () => getProfileDockTransform().y,
        scale: () => getProfileDockTransform().scale,
        duration: 0.78,
        ease: "power3.inOut",
      },
      "identity-transition+=0.08",
    );
    timeline.to(
      elements.profilePin,
      {
        autoAlpha: 1,
        duration: 0.28,
        ease: "power2.out",
      },
      "identity-transition+=0.7",
    );
    timeline.to(
      elements.sharedPost,
      {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
      },
      "identity-transition+=0.72",
    );

    timeline.addLabel("identity", 4.18);

    timeline.fromTo(
      elements.profileAvatar,
      { rotationY: -42, scale: 0.9 },
      {
        rotationY: 0,
        scale: 1,
        duration: 0.48,
        ease: "back.out(1.4)",
      },
      "identity",
    );
    timeline.fromTo(
      elements.profileBio,
      { autoAlpha: 0, y: 10 },
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
      { autoAlpha: 0, y: 8, scale: 0.95 },
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
      { autoAlpha: 0, y: 14, rotation: -1.5 },
      {
        autoAlpha: 1,
        y: 0,
        rotation: 0,
        duration: 0.36,
        stagger: 0.055,
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
    timeline.to(
      [elements.profileAvatar, elements.profileBio],
      {
        y: -2,
        duration: 0.16,
        repeat: 1,
        yoyo: true,
        ease: "power2.inOut",
      },
      "identity+=0.95",
    );
    timeline.to(
      elements.profileEdit,
      {
        borderColor: "rgba(123, 220, 255, 0.58)",
        color: "#eef8ff",
        duration: 0.16,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      "identity+=0.96",
    );
    timeline.to({}, { duration: 0.6 });

    /* The profile makes room for reader discovery. */
    timeline.addLabel("discovery-transition", 5.75);

    timeline.to(
      identityCopy,
      {
        autoAlpha: 0,
        x: -18,
        duration: 0.34,
        ease: "power2.in",
      },
      "discovery-transition",
    );
    timeline.fromTo(
      discoveryCopy,
      { autoAlpha: 0, x: 18 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.46,
        ease: "power3.out",
      },
      "discovery-transition+=0.2",
    );
    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 0,
        x: -44,
        scale: 0.975,
        duration: 0.48,
        ease: "power2.inOut",
      },
      "discovery-transition",
    );
    timeline.to(
      elements.scenes.identity,
      {
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in",
      },
      "discovery-transition+=0.2",
    );
    timeline.set(
      elements.scenes.discovery,
      { visibility: "visible" },
      "discovery-transition+=0.24",
    );
    timeline.to(
      elements.scenes.discovery,
      {
        autoAlpha: 1,
        duration: 0.4,
        ease: "power2.out",
      },
      "discovery-transition+=0.24",
    );

    timeline.addLabel("discovery", 6.15);

    timeline.fromTo(
      elements.searchPanel,
      { autoAlpha: 0, x: -28, y: 10 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.48,
        ease: "power3.out",
      },
      "discovery",
    );
    timeline.set(elements.searchInput, { value: "freedom" }, "discovery+=0.23");
    timeline.fromTo(
      elements.resultCards,
      { autoAlpha: 0, x: -18, y: 6 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.34,
        stagger: 0.065,
        ease: "power3.out",
      },
      "discovery+=0.28",
    );
    timeline.fromTo(
      elements.visitedProfile,
      { autoAlpha: 0, x: 30, y: 10, scale: 0.985 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.52,
        ease: "power3.out",
      },
      "discovery+=0.52",
    );
    timeline.fromTo(
      elements.visitedFeed,
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.075,
        ease: "power3.out",
      },
      "discovery+=0.82",
    );
    timeline.to(
      elements.followButton,
      {
        scale: 1.05,
        duration: 0.15,
        repeat: 1,
        yoyo: true,
        ease: "power2.inOut",
      },
      "discovery+=1.12",
    );
    timeline.set(
      elements.followButton,
      {
        attr: { "aria-pressed": "true" },
        textContent: "Following",
      },
      "discovery+=1.26",
    );
    timeline.to(
      elements.followPayoff,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        ease: "power3.out",
      },
      "discovery+=1.3",
    );
    timeline.to({}, { duration: 0.82 });

    if (MANAGED_BY_HOME_JOURNEY) {
      timeline.pause(0);
      return;
    }

    trigger = ScrollTrigger.create({
      id: "inkwell-social-cinema-v5",
      trigger: section,
      animation: timeline,
      pin: elements.pin,
      pinSpacing: true,
      start: () => `top top+=${getNavHeight()}`,
      end: () => `+=${Math.max(4300, window.innerHeight * 5.1)}`,
      scrub: 1.02,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        syncActiveStep(progress);
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
      { autoAlpha: 0, y: 16 },
    );
    gsap.set(controlCopy, { x: 0 });
    gsap.set(getCopyState("identity"), { x: 18 });
    gsap.set(getCopyState("discovery"), { x: 18 });

    gsap.set(Object.values(elements.scenes), {
      autoAlpha: 0,
      visibility: "hidden",
    });
    gsap.set(elements.scenes.control, { visibility: "visible" });

    gsap.set([elements.composer, elements.livePreview], {
      autoAlpha: 0,
      y: 18,
      scale: 0.988,
    });
    gsap.set(elements.sharedPost, {
      autoAlpha: 0,
      x: 0,
      y: 20,
      scale: 0.94,
      transformOrigin: "50% 50%",
    });
    gsap.set(elements.orbitAvatars, { autoAlpha: 0, scale: 0.74 });
    gsap.set(elements.spoilerShield, { autoAlpha: 0 });

    gsap.set(elements.profileShell, {
      autoAlpha: 0,
      x: 0,
      y: 22,
      scale: 0.986,
    });
    gsap.set(elements.profilePin, { autoAlpha: 0 });
    gsap.set(elements.profileBio, { autoAlpha: 1, y: 0 });
    gsap.set(elements.profileTags, { autoAlpha: 1, y: 0, scale: 1 });
    gsap.set(elements.profileStats, { autoAlpha: 1, y: 0 });
    gsap.set(elements.profileCovers, { autoAlpha: 1, y: 0, rotation: 0 });
    gsap.set(elements.profileActivityRows, { autoAlpha: 1, x: 0 });

    gsap.set(elements.searchPanel, { autoAlpha: 0 });
    gsap.set(elements.resultCards, { autoAlpha: 0 });
    gsap.set(elements.visitedProfile, { autoAlpha: 0 });
    gsap.set(elements.visitedFeed, { autoAlpha: 0 });
    gsap.set(elements.followPayoff, { autoAlpha: 0, y: 10 });

    setAudience("private", false, false);
    setSpoiler(false, false, false);
    setFollowing(false, false, false);
    setActiveStep("control");
  }

  function getProfileDockTransform() {
    const screenRect = elements.screen.getBoundingClientRect();
    const slotRect = elements.profilePinSlot.getBoundingClientRect();
    const sharedWidth = Math.max(elements.sharedPost.offsetWidth, 1);

    const baseX = elements.screen.clientWidth * 0.725;
    const baseY = elements.screen.clientHeight * 0.56;
    const targetX = slotRect.left - screenRect.left + slotRect.width / 2;
    const targetY = slotRect.top - screenRect.top + slotRect.height / 2;

    return {
      x: targetX - baseX,
      y: targetY - baseY,
      scale: Math.min(0.72, Math.max(0.5, slotRect.width / sharedWidth)),
    };
  }

  function setTimelineAudience(value, position) {
    const meta = audienceMeta[value] || audienceMeta.private;
    const selected = elements.audienceButtons.find(
      (button) => button.dataset.socialAudience === value,
    );

    timeline.set(
      elements.audienceButtons,
      { attr: { "aria-pressed": "false" } },
      position,
    );
    if (selected) {
      timeline.set(selected, { attr: { "aria-pressed": "true" } }, position);
    }
    timeline.set(elements.visibilityBadge, { textContent: meta.label }, position);
    timeline.set(elements.audienceSummary, { textContent: meta.summary }, position);
    timeline.set(elements.previewTitle, { textContent: meta.previewTitle }, position);
    timeline.set(elements.previewState, { textContent: meta.previewState }, position);
    timeline.set(elements.previewHint, { textContent: meta.hint }, position);
    timeline.set(elements.previewFooter, { textContent: meta.footer }, position);
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
        ...Object.values(elements.scenes),
        elements.composer,
        elements.livePreview,
        elements.profileShell,
        elements.profilePin,
        elements.searchPanel,
        ...elements.resultCards,
        elements.visitedProfile,
        ...elements.visitedFeed,
        elements.followPayoff,
      ].filter(Boolean),
      {
        autoAlpha: 1,
        clearProps: "transform",
      },
    );

    gsap.set(elements.sharedPost, { autoAlpha: 0 });
    setActiveStep("control");
  }

  function syncActiveStep(progress) {
    const next = progress < 0.37
      ? "control"
      : progress < 0.68
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

    Object.entries(elements.scenes).forEach(([sceneKey, scene]) => {
      scene.classList.toggle("is-interactive", sceneKey === key);
      scene.setAttribute("aria-hidden", sceneKey === key ? "false" : "true");
    });

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
    elements.audienceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setAudience(button.dataset.socialAudience || "private", true, true);
      });
    });

    elements.spoilerToggle?.addEventListener("click", () => {
      const next = elements.spoilerToggle.getAttribute("aria-pressed") !== "true";
      setSpoiler(next, true, true);
    });

    elements.spoilerReveal?.addEventListener("click", () => {
      setSpoiler(false, true, true);
      announce("Spoiler reflection revealed.");
    });

    elements.shareButton?.addEventListener("click", () => {
      if (gsap) {
        gsap.fromTo(
          elements.sharedPost,
          { scale: 0.975 },
          {
            scale: 1,
            duration: 0.28,
            ease: "back.out(1.7)",
            overwrite: "auto",
          },
        );
      }
      announce("Reflection sharing preview updated.");
    });

    elements.profileEdit?.addEventListener("click", () => {
      const editing = !elements.profileShell.classList.contains("is-editing");
      elements.profileShell.classList.toggle("is-editing", editing);
      elements.profileEdit.setAttribute("aria-pressed", editing ? "true" : "false");
      elements.profileEdit.textContent = editing ? "Save profile" : "Edit profile";

      if (gsap) {
        gsap.fromTo(
          [elements.profileAvatar, elements.profileEdit],
          { scale: 0.96 },
          {
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.7)",
            overwrite: "auto",
          },
        );
      }
      announce(editing ? "Profile editing preview opened." : "Profile preview saved.");
    });

    elements.searchTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        elements.searchTabs.forEach((other) => {
          const selected = other === tab;
          other.classList.toggle("is-active", selected);
          other.setAttribute("aria-selected", selected ? "true" : "false");
        });
        announce(`${tab.textContent.trim()} search selected.`);
      });
    });

    elements.resultCards.forEach((card) => {
      card.addEventListener("click", () => {
        selectProfile(card.dataset.socialResult || "kai", true);
      });
    });

    elements.followButton?.addEventListener("click", () => {
      const isFollowing =
        elements.followButton.getAttribute("aria-pressed") === "true";
      setFollowing(!isFollowing, true, true);
    });

    window.addEventListener("inkwell:section4-ready", syncStoryCovers);
    window.addEventListener("inkwell:home-journey-ready", syncStoryCovers);
  }

  function setAudience(value, animate, shouldAnnounce) {
    const meta = audienceMeta[value] || audienceMeta.private;

    elements.audienceButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.dataset.socialAudience === value ? "true" : "false",
      );
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
        duration: 0.24,
        stagger: 0.03,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.fromTo(
        [elements.visibilityBadge, elements.previewState],
        { scale: 0.92 },
        {
          scale: 1,
          duration: 0.23,
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
    elements.spoilerToggle?.setAttribute(
      "aria-pressed",
      enabled ? "true" : "false",
    );
    elements.spoilerShield?.classList.toggle("is-visible", enabled);

    if (gsap && animate) {
      gsap.to(elements.spoilerShield, {
        autoAlpha: enabled ? 1 : 0,
        duration: 0.23,
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

  function selectProfile(key, animate) {
    const profile = profileData[key] || profileData.kai;

    elements.resultCards.forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.socialResult === key);
    });

    setText(elements.visitedAvatar, profile.initial);
    setText(elements.visitedName, profile.name);
    setText(elements.visitedBio, profile.bio);
    setText(elements.sharedContext, profile.context);
    setText(elements.mutualCopyStrong, profile.matchTitle);
    setText(elements.mutualCopySmall, profile.matchDetail);

    if (gsap && animate) {
      gsap.fromTo(
        elements.visitedProfile,
        { autoAlpha: 0.78, x: 12 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.32,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }

    announce(`${profile.name} profile selected.`);
  }

  function setFollowing(enabled, animate, shouldAnnounce) {
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
        { scale: 0.94 },
        {
          scale: 1,
          duration: 0.28,
          ease: "back.out(1.7)",
          overwrite: "auto",
        },
      );
      gsap.to(elements.followPayoff, {
        autoAlpha: enabled ? 1 : 0,
        y: enabled ? 0 : 8,
        duration: 0.34,
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

  function syncStoryCovers() {
    const source = document.querySelector("#section-4 [data-story-cover]");
    const src = source?.currentSrc || source?.getAttribute("src") || "";

    if (!src) {
      if (source && source.dataset.socialCoverListener !== "true") {
        source.dataset.socialCoverListener = "true";
        source.addEventListener("load", syncStoryCovers, { once: true });
      }
      return;
    }

    elements.storyCoverImages.forEach((image) => {
      image.src = src;
      image.hidden = false;
    });
  }

  function getCopyState(key) {
    return elements.copyStates.find((item) => item.dataset.socialCopy === key) || null;
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

    if (timeline.progress() <= 0.001) {
      const nested = isNestedInManagedJourney();

      timeline.invalidate();
      timeline.totalTime(0, true);
      setInitialState();
      timeline.paused(!nested);
    }

    syncStoryCovers();
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
        parentIsGlobal: timeline?.parent === gsap?.globalTimeline,
        openingReadyTime: Number(
          timeline?.labels?.["control-ready"] ?? OPENING_READY_TIME,
        ),
        activeStep,
      }),
      destroy: () => {
        trigger?.kill?.(true);
        timeline?.kill?.();
      },
      cleanup: () => {
        trigger?.kill?.(true);
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

  function gsapSafeArray(collection) {
    return Array.from(collection || []);
  }
})();