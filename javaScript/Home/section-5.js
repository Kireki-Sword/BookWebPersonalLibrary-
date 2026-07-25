/* ============================================================================
   INKWELL — SECTION 5: SOCIAL, ON YOUR TERMS (V2)

   Desktop managed journey:
   - published as a paused child timeline inside the shared Sections 1–5 stage
   - three acts: Control -> Identity -> Discovery
   - one shared reflection card visually connects the acts

   Mobile / reduced motion:
   - all three acts remain visible in normal document flow
   ============================================================================ */

(() => {
  "use strict";

  const section = document.querySelector("#section-5-social");

  if (!section) {
    return;
  }

  window.__INKWELL_SOCIAL_CINEMA_BUILD__ =
    "2026-07-24-social-cinema-v2-managed";

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
    status: section.querySelector("[data-social-status]"),
    eyebrow: section.querySelector(".social-cinema__eyebrow"),
    title: section.querySelector(".social-cinema__copy h2"),
    intro: section.querySelector(".social-cinema__intro"),
    steps: gsapSafeArray(section.querySelectorAll("[data-social-step]")),
    scenes: {
      control: section.querySelector('[data-social-scene="control"]'),
      identity: section.querySelector('[data-social-scene="identity"]'),
      discovery: section.querySelector('[data-social-scene="discovery"]'),
    },
    sharePanel: section.querySelector(".social-share-panel"),
    postStage: section.querySelector(".social-post-stage"),
    sharedPost: section.querySelector("[data-social-shared-post]"),
    visibilityBadge: section.querySelector("[data-social-visibility-badge]"),
    orbitAvatars: gsapSafeArray(
      section.querySelectorAll(".social-orbit-avatar"),
    ),
    audienceButtons: gsapSafeArray(
      section.querySelectorAll("[data-social-audience]"),
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
    profileContent: gsapSafeArray(
      section.querySelectorAll(
        ".social-profile-content .social-cover-tile, " +
          ".social-profile-content .social-reflection-preview",
      ),
    ),
    profileEdit: section.querySelector("[data-social-profile-edit]"),
    searchPanel: section.querySelector(".social-search-panel"),
    searchInput: section.querySelector("[data-social-search-input]"),
    resultCards: gsapSafeArray(
      section.querySelectorAll("[data-social-result]"),
    ),
    visitedProfile: section.querySelector("[data-social-visited-profile]"),
    visitedAvatar: section.querySelector(".social-visited-profile__avatar"),
    visitedName: section.querySelector(".social-visited-profile__copy h3"),
    visitedBio: section.querySelector(".social-visited-profile__copy p"),
    sharedContext: section.querySelector(".social-shared-context"),
    visitedFeed: gsapSafeArray(
      section.querySelectorAll(".social-feed-item"),
    ),
    followButton: section.querySelector("[data-social-follow]"),
    connectionLine: section.querySelector(".social-connection-line"),
    finalMessage: section.querySelector("[data-social-final-message]"),
  };

  const required = [
    elements.pin,
    elements.screen,
    elements.scenes.control,
    elements.scenes.identity,
    elements.scenes.discovery,
    elements.sharedPost,
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
    },
    mira: {
      initial: "M",
      name: "mira.frames",
      bio: "Collects visual moments and quiet endings.",
      context:
        "You both save visual moments and return to stories about memory, grief, and what remains afterward.",
    },
    ren: {
      initial: "R",
      name: "ren.afterwords",
      bio: "Writes long reflections about history and responsibility.",
      context:
        "You share four themes: identity, history, responsibility, and the cost of inherited conflict.",
    },
  };

  let timeline = null;
  let trigger = null;
  let activeStep = "control";

  setupInteractions();

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
      defaults: {
        ease: "none",
      },
      onUpdate: () => {
        syncActiveStep(timeline?.progress?.() || 0);
      },
    });

    const copyItems = [
      elements.eyebrow,
      elements.title,
      elements.intro,
      ...elements.steps,
    ].filter(Boolean);

    timeline.addLabel("control", 0);

    timeline.to(copyItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out",
    });

    timeline.to(
      elements.scenes.control,
      {
        autoAlpha: 1,
        duration: 0.45,
        ease: "power2.out",
      },
      0.16,
    );

    timeline.to(
      [elements.sharePanel, elements.postStage],
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.62,
        stagger: 0.08,
        ease: "power3.out",
      },
      0.3,
    );

    timeline.to(
      elements.sharedPost,
      {
        autoAlpha: 1,
        x: () => elements.screen.clientWidth * 0.22,
        y: 8,
        scale: 1,
        duration: 0.72,
        ease: "power3.out",
      },
      0.45,
    );

    /* Private -> followers -> public with spoiler protection. */
    timeline.set(
      elements.audienceButtons,
      { attr: { "aria-pressed": "false" } },
      1.2,
    );
    timeline.set(
      elements.audienceButtons[0],
      { attr: { "aria-pressed": "true" } },
      1.2,
    );
    timeline.set(elements.visibilityBadge, { textContent: "Private" }, 1.2);
    timeline.to({}, { duration: 0.52 });

    timeline.set(
      elements.audienceButtons,
      { attr: { "aria-pressed": "false" } },
      1.75,
    );
    timeline.set(
      elements.audienceButtons[1],
      { attr: { "aria-pressed": "true" } },
      1.75,
    );
    timeline.set(elements.visibilityBadge, { textContent: "Followers" }, 1.75);
    timeline.to(
      elements.orbitAvatars,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.34,
        stagger: 0.055,
        ease: "back.out(1.5)",
      },
      1.78,
    );
    timeline.to({}, { duration: 0.62 });

    timeline.set(
      elements.audienceButtons,
      { attr: { "aria-pressed": "false" } },
      2.55,
    );
    timeline.set(
      elements.audienceButtons[2],
      { attr: { "aria-pressed": "true" } },
      2.55,
    );
    timeline.set(elements.visibilityBadge, { textContent: "Public" }, 2.55);
    timeline.set(
      elements.spoilerToggle,
      { attr: { "aria-pressed": "true" } },
      2.7,
    );
    timeline.to(
      elements.spoilerShield,
      {
        autoAlpha: 1,
        duration: 0.38,
        ease: "power2.out",
      },
      2.72,
    );
    timeline.to(
      elements.shareButton,
      {
        scale: 1.045,
        duration: 0.16,
        repeat: 1,
        yoyo: true,
        ease: "power2.inOut",
      },
      3.08,
    );
    timeline.to({}, { duration: 0.58 });

    /* Cinematic shared-element transition into the completed profile. */
    timeline.addLabel("identity-transition", 3.75);
    timeline.to(
      [elements.sharePanel, elements.postStage],
      {
        autoAlpha: 0,
        y: -18,
        scale: 0.985,
        duration: 0.52,
        ease: "power2.inOut",
      },
      "identity-transition",
    );
    timeline.to(
      elements.orbitAvatars,
      {
        autoAlpha: 0,
        scale: 0.72,
        duration: 0.26,
        stagger: 0.025,
        ease: "power2.in",
      },
      "identity-transition",
    );
    timeline.to(
      elements.sharedPost,
      {
        x: () => elements.screen.clientWidth * 0.22,
        y: () => elements.screen.clientHeight * 0.19,
        scale: 0.53,
        duration: 0.72,
        ease: "power3.inOut",
      },
      "identity-transition+=0.05",
    );
    timeline.to(
      elements.scenes.control,
      {
        autoAlpha: 0,
        duration: 0.34,
        ease: "power2.in",
      },
      "identity-transition+=0.22",
    );
    timeline.set(
      elements.scenes.identity,
      { visibility: "visible" },
      "identity-transition+=0.35",
    );
    timeline.to(
      elements.scenes.identity,
      {
        autoAlpha: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "identity-transition+=0.35",
    );
    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.66,
        ease: "power3.out",
      },
      "identity-transition+=0.38",
    );

    timeline.addLabel("identity", 4.45);
    timeline.to(
      elements.profileAvatar,
      {
        rotationY: 360,
        scale: 1.06,
        duration: 0.62,
        ease: "power3.inOut",
      },
      "identity",
    );
    timeline.to(
      elements.profileAvatar,
      {
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
      },
      "identity+=0.58",
    );
    timeline.fromTo(
      elements.profileBio,
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.38,
        ease: "power3.out",
      },
      "identity+=0.12",
    );
    timeline.fromTo(
      elements.profileTags,
      { autoAlpha: 0, y: 10, scale: 0.94 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.34,
        stagger: 0.055,
        ease: "power3.out",
      },
      "identity+=0.26",
    );
    timeline.fromTo(
      elements.profileStats,
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
        stagger: 0.05,
        ease: "power3.out",
      },
      "identity+=0.52",
    );
    timeline.fromTo(
      elements.profileContent,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.045,
        ease: "power3.out",
      },
      "identity+=0.72",
    );
    timeline.to(
      elements.profileEdit,
      {
        borderColor: "rgba(121, 217, 255, 0.58)",
        color: "#eef8ff",
        duration: 0.18,
        repeat: 1,
        yoyo: true,
        ease: "power1.inOut",
      },
      "identity+=1.02",
    );
    timeline.to({}, { duration: 0.72 });

    /* Profile collapses into discovery; only the new interaction remains. */
    timeline.addLabel("discovery-transition", 6.2);
    timeline.to(
      elements.profileShell,
      {
        autoAlpha: 0,
        x: -52,
        scale: 0.97,
        duration: 0.58,
        ease: "power2.inOut",
      },
      "discovery-transition",
    );
    timeline.to(
      elements.sharedPost,
      {
        autoAlpha: 0,
        x: () => elements.screen.clientWidth * 0.3,
        y: () => elements.screen.clientHeight * 0.16,
        scale: 0.42,
        duration: 0.45,
        ease: "power2.in",
      },
      "discovery-transition",
    );
    timeline.to(
      elements.scenes.identity,
      {
        autoAlpha: 0,
        duration: 0.34,
        ease: "power2.in",
      },
      "discovery-transition+=0.2",
    );
    timeline.set(
      elements.scenes.discovery,
      { visibility: "visible" },
      "discovery-transition+=0.32",
    );
    timeline.to(
      elements.scenes.discovery,
      {
        autoAlpha: 1,
        duration: 0.48,
        ease: "power2.out",
      },
      "discovery-transition+=0.32",
    );

    timeline.addLabel("discovery", 6.62);
    timeline.fromTo(
      elements.searchPanel,
      { autoAlpha: 0, x: -34, y: 12 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.52,
        ease: "power3.out",
      },
      "discovery",
    );
    timeline.set(elements.searchInput, { value: "freedom" }, "discovery+=0.28");
    timeline.fromTo(
      elements.resultCards,
      { autoAlpha: 0, x: -20, y: 8 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.38,
        stagger: 0.075,
        ease: "power3.out",
      },
      "discovery+=0.34",
    );
    timeline.fromTo(
      elements.visitedProfile,
      { autoAlpha: 0, x: 36, y: 12, scale: 0.985 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.56,
        ease: "power3.out",
      },
      "discovery+=0.68",
    );
    timeline.fromTo(
      elements.visitedFeed,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.36,
        stagger: 0.08,
        ease: "power3.out",
      },
      "discovery+=0.96",
    );
    timeline.to(
      elements.followButton,
      {
        scale: 1.055,
        duration: 0.17,
        repeat: 1,
        yoyo: true,
        ease: "power2.inOut",
      },
      "discovery+=1.25",
    );
    timeline.set(
      elements.followButton,
      {
        attr: { "aria-pressed": "true" },
        textContent: "Following",
      },
      "discovery+=1.42",
    );
    timeline.fromTo(
      elements.connectionLine,
      { autoAlpha: 0, scaleX: 0 },
      {
        autoAlpha: 1,
        scaleX: 1,
        duration: 0.54,
        ease: "power3.inOut",
      },
      "discovery+=1.48",
    );
    timeline.to(
      elements.finalMessage,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.48,
        ease: "power3.out",
      },
      "discovery+=1.72",
    );
    timeline.to({}, { duration: 0.9 });

    if (MANAGED_BY_HOME_JOURNEY) {
      timeline.pause(0);
      return;
    }

    trigger = ScrollTrigger.create({
      id: "inkwell-social-cinema-v2",
      trigger: section,
      animation: timeline,
      pin: elements.pin,
      pinSpacing: true,
      start: () => `top top+=${getNavHeight()}`,
      end: () => `+=${Math.max(4300, window.innerHeight * 5.1)}`,
      scrub: 1.05,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        syncActiveStep(progress);
      },
      onEnter: () => {
        section.classList.add("is-social-cinema-active");
      },
      onEnterBack: () => {
        section.classList.add("is-social-cinema-active");
      },
      onLeave: () => {
        section.classList.remove("is-social-cinema-active");
      },
      onLeaveBack: () => {
        section.classList.remove("is-social-cinema-active");
      },
    });

    requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
  }

  function setInitialState() {
    const copyItems = [
      elements.eyebrow,
      elements.title,
      elements.intro,
      ...elements.steps,
    ].filter(Boolean);

    gsap.set(copyItems, { autoAlpha: 0, y: 18 });
    gsap.set(Object.values(elements.scenes), {
      autoAlpha: 0,
      visibility: "hidden",
    });
    gsap.set(elements.scenes.control, { visibility: "visible" });
    gsap.set([elements.sharePanel, elements.postStage], {
      autoAlpha: 0,
      y: 22,
      scale: 0.985,
    });
    gsap.set(elements.sharedPost, {
      autoAlpha: 0,
      x: 0,
      y: 28,
      scale: 0.92,
      transformOrigin: "50% 50%",
    });
    gsap.set(elements.orbitAvatars, { autoAlpha: 0, scale: 0.72 });
    gsap.set(elements.spoilerShield, { autoAlpha: 0 });
    gsap.set(elements.profileShell, {
      autoAlpha: 0,
      y: 28,
      scale: 0.985,
    });
    gsap.set(elements.searchPanel, { autoAlpha: 0 });
    gsap.set(elements.resultCards, { autoAlpha: 0 });
    gsap.set(elements.visitedProfile, { autoAlpha: 0 });
    gsap.set(elements.visitedFeed, { autoAlpha: 0 });
    gsap.set(elements.connectionLine, {
      autoAlpha: 0,
      scaleX: 0,
      transformOrigin: "0% 50%",
    });
    gsap.set(elements.finalMessage, { autoAlpha: 0, y: 12 });
    setActiveStep("control");
  }

  function showStatic() {
    section.classList.add("is-social-static");

    if (!gsap) {
      Object.values(elements.scenes).forEach((scene) => {
        scene.style.opacity = "1";
        scene.style.visibility = "visible";
      });
      elements.sharedPost.style.opacity = "1";
      elements.sharedPost.style.visibility = "visible";
      return;
    }

    gsap.set(
      [
        elements.eyebrow,
        elements.title,
        elements.intro,
        ...elements.steps,
        ...Object.values(elements.scenes),
        elements.sharePanel,
        elements.postStage,
        elements.sharedPost,
        elements.profileShell,
        elements.searchPanel,
        ...elements.resultCards,
        elements.visitedProfile,
        ...elements.visitedFeed,
      ].filter(Boolean),
      {
        autoAlpha: 1,
        clearProps: "transform",
      },
    );

    gsap.set(elements.connectionLine, { autoAlpha: 1, scaleX: 1 });
    setActiveStep("control");
  }

  function syncActiveStep(progress) {
    const next = progress < 0.36
      ? "control"
      : progress < 0.67
        ? "identity"
        : "discovery";

    if (next !== activeStep) {
      setActiveStep(next);
    }
  }

  function setActiveStep(key) {
    activeStep = key;

    elements.steps.forEach((step) => {
      step.classList.toggle("is-active", step.dataset.socialStep === key);
    });

    Object.entries(elements.scenes).forEach(([sceneKey, scene]) => {
      scene.classList.toggle("is-interactive", sceneKey === key);
      scene.setAttribute("aria-hidden", sceneKey === key ? "false" : "true");
    });

    if (elements.toolbarStatus) {
      elements.toolbarStatus.textContent =
        key.charAt(0).toUpperCase() + key.slice(1);
    }

    if (elements.status) {
      const messages = {
        control: "Social controls: choose an audience and protect spoilers.",
        identity: "Profile identity: public stories and reflections shape a reader profile.",
        discovery: "Reader discovery: search profiles and follow a reader.",
      };
      elements.status.textContent = messages[key];
    }
  }

  function setupInteractions() {
    elements.audienceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setAudience(button.dataset.socialAudience || "private", true);
      });
    });

    elements.spoilerToggle?.addEventListener("click", () => {
      const next = elements.spoilerToggle.getAttribute("aria-pressed") !== "true";
      setSpoiler(next, true);
    });

    elements.spoilerReveal?.addEventListener("click", () => {
      elements.spoilerShield?.classList.remove("is-visible");
      if (gsap) {
        gsap.to(elements.spoilerShield, {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      }
      announce("Spoiler reflection revealed.");
    });

    elements.shareButton?.addEventListener("click", () => {
      if (gsap) {
        gsap.fromTo(
          elements.sharedPost,
          { scale: 0.985 },
          {
            scale: 1,
            duration: 0.28,
            ease: "back.out(1.8)",
            overwrite: "auto",
          },
        );
      }
      announce("Reflection sharing preview updated.");
    });

    elements.profileEdit?.addEventListener("click", () => {
      const current = elements.profileEdit.textContent.trim();
      elements.profileEdit.textContent =
        current === "Edit profile" ? "Profile updated" : "Edit profile";

      if (gsap) {
        gsap.fromTo(
          [elements.profileAvatar, elements.profileEdit],
          { scale: 0.96 },
          {
            scale: 1,
            duration: 0.32,
            ease: "back.out(1.7)",
            overwrite: "auto",
          },
        );
      }
      announce("Profile customization preview updated.");
    });

    elements.resultCards.forEach((card) => {
      card.addEventListener("click", () => {
        selectProfile(card.dataset.socialResult || "kai", true);
      });
    });

    elements.followButton?.addEventListener("click", () => {
      const isFollowing =
        elements.followButton.getAttribute("aria-pressed") === "true";
      setFollowing(!isFollowing, true);
    });
  }

  function setAudience(value, animate) {
    const label =
      value === "followers"
        ? "Followers"
        : value === "public"
          ? "Public"
          : "Private";

    elements.audienceButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.dataset.socialAudience === value ? "true" : "false",
      );
    });

    if (elements.visibilityBadge) {
      elements.visibilityBadge.textContent = label;
    }

    if (gsap && animate) {
      gsap.to(elements.orbitAvatars, {
        autoAlpha: value === "private" ? 0 : 1,
        scale: value === "private" ? 0.78 : 1,
        duration: 0.26,
        stagger: 0.035,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.fromTo(
        elements.visibilityBadge,
        { scale: 0.92 },
        {
          scale: 1,
          duration: 0.24,
          ease: "back.out(1.7)",
          overwrite: "auto",
        },
      );
    }

    announce(`${label} audience selected.`);
  }

  function setSpoiler(enabled, animate) {
    elements.spoilerToggle?.setAttribute(
      "aria-pressed",
      enabled ? "true" : "false",
    );
    elements.spoilerShield?.classList.toggle("is-visible", enabled);

    if (gsap && animate) {
      gsap.to(elements.spoilerShield, {
        autoAlpha: enabled ? 1 : 0,
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    announce(
      enabled
        ? "Spoiler protection enabled."
        : "Spoiler protection disabled.",
    );
  }

  function selectProfile(key, animate) {
    const profile = profileData[key] || profileData.kai;

    elements.resultCards.forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.socialResult === key);
    });

    if (elements.visitedAvatar) {
      elements.visitedAvatar.textContent = profile.initial;
    }
    if (elements.visitedName) {
      elements.visitedName.textContent = profile.name;
    }
    if (elements.visitedBio) {
      elements.visitedBio.textContent = profile.bio;
    }
    if (elements.sharedContext) {
      elements.sharedContext.textContent = profile.context;
    }

    if (gsap && animate) {
      gsap.fromTo(
        elements.visitedProfile,
        { autoAlpha: 0.72, x: 12 },
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

  function setFollowing(enabled, animate) {
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
          duration: 0.3,
          ease: "back.out(1.8)",
          overwrite: "auto",
        },
      );
      gsap.to(elements.connectionLine, {
        autoAlpha: enabled ? 1 : 0.28,
        scaleX: enabled ? 1 : 0.25,
        duration: 0.38,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    }

    announce(enabled ? "Reader followed." : "Reader unfollowed.");
  }

  function announce(message) {
    if (elements.status) {
      elements.status.textContent = message;
    }
  }

  function publishApi() {
    const api = {
      section,
      timeline,
      trigger,
      reset: () => {
        trigger?.animation?.pause?.(0);
        timeline?.pause?.(0);
        setInitialState();
      },
      refresh: () => {
        if (trigger) {
          trigger.refresh?.();
          return;
        }

        /*
         * The master journey owns rendering. Avoid invalidating this nested
         * timeline while it is part-way through, because current transforms
         * could otherwise be recorded as new starting values.
         */
        if (timeline && timeline.progress() <= 0.001) {
          timeline.invalidate();
          timeline.pause(0);
        }
      },
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