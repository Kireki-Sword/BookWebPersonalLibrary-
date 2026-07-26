/* ============================================================================
   INKWELL — SECTION 5: SOCIAL, ON YOUR TERMS (V19 VERTICAL DISCOVERY / THEME SEARCH / FULL PEOPLE GRID)

   Homepage product story:
   1. Control — audience, spoilers, and a stable live preview.
   2. Identity — a real profile with Top Stories, custom rankings, stats,
      biography, tags, and recent activity.
   3. Social — equal Following updates, content-first For You discovery,
      and an immersive one-card For You stream and search by theme, genre, layer, reader, and sort order.

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
  if (!section || window.__INKWELL_SOCIAL_V19_STARTED__) return;

  window.__INKWELL_SOCIAL_V19_STARTED__ = true;
  window.__INKWELL_SOCIAL_V16_STARTED__ = true;
  window.__INKWELL_SOCIAL_CINEMA_BUILD__ =
    "2026-07-26-social-cinema-v19-vertical-discovery-theme-search";

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
    socialTransition: 6.82,
    social: 7.58,
    end: 12.45,
  });

  /* The V14 For You thresholds were only ~0.18 timeline seconds apart. On a
     scrubbed parent timeline that made five items fight over one smooth-scroll
     container. V15 gives every item a readable interval and uses a stacked
     transition instead of a nested scrolling surface. */
  const DEMO_THRESHOLDS = Object.freeze({
    followersEnter: 1.38,
    followersLeave: 1.16,
    publicEnter: 2.03,
    publicLeave: 1.78,
    spoilerEnter: 2.67,
    spoilerLeave: 2.4,
    forYouEnter: 8.48,
    forYouLeave: 8.18,
    forYouSecondEnter: 8.98,
    forYouThirdEnter: 9.48,
    forYouFourthEnter: 9.98,
    forYouFifthEnter: 10.48,
    searchEnter: 11.08,
    searchLeave: 10.78,
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
    following: { label: "Following activity", status: "Social · Following", step: "01", segment: 1 },
    foryou: { label: "Content-first discovery", status: "Social · For You", step: "02", segment: 2 },
    search: { label: "Search themes and readers", status: "Social · Search", step: "03", segment: 3 },
    profile: { label: "Reader profile", status: "Social · Profile", step: "03", segment: 3 },
    library: { label: "Public story library", status: "Social · Library", step: "03", segment: 3 },
    story: { label: "Saved story layers", status: "Social · Story", step: "03", segment: 3 },
  });

  const TOKYO_GHOUL_RE_ALIASES = [
    "tokyo ghoul re",
    "tokyo ghoul:re",
    "tokyo ghoul re manga",
  ];

  const PREFERRED_STORY_TITLES = [
    "Tokyo Ghoul:re",
    "Orb: On the Movements of the Earth",
    "Billy Bat",
    "Vinland Saga",
    "Blood on the Tracks",
    "Berserk",
    "The Climber",
    "Tokyo Ghoul",
    "One Piece",
    "Land of the Lustrous",
    "20th Century Boys",
    "Homunculus",
    "Steins;Gate",
    "Chainsaw Man",
    "Goodnight Punpun",
    "Monster",
    "Fullmetal Alchemist",
  ];

  const FALLBACK_STORIES = [
    { id: "fallback-tokyo-ghoul-re", title: "Tokyo Ghoul:re", creator: "Sui Ishida", coverUrl: "" },
    { id: "fallback-orb", title: "Orb: On the Movements of the Earth", creator: "Uoto", coverUrl: "" },
    { id: "fallback-billy-bat", title: "Billy Bat", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-vinland", title: "Vinland Saga", creator: "Makoto Yukimura", coverUrl: "" },
    { id: "fallback-blood-tracks", title: "Blood on the Tracks", creator: "Shuzo Oshimi", coverUrl: "" },
    { id: "fallback-berserk", title: "Berserk", creator: "Kentaro Miura", coverUrl: "" },
    { id: "fallback-climber", title: "The Climber", creator: "Shin-ichi Sakamoto", coverUrl: "" },
    { id: "fallback-tokyo-ghoul", title: "Tokyo Ghoul", creator: "Sui Ishida", coverUrl: "" },
    { id: "fallback-one-piece", title: "One Piece", creator: "Eiichiro Oda", coverUrl: "" },
    { id: "fallback-land-lustrous", title: "Land of the Lustrous", creator: "Haruko Ichikawa", coverUrl: "" },
    { id: "fallback-20cb", title: "20th Century Boys", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-homunculus", title: "Homunculus", creator: "Hideo Yamamoto", coverUrl: "" },
    { id: "fallback-steins-gate", title: "Steins;Gate", creator: "5pb. / Nitroplus", coverUrl: "" },
    { id: "fallback-chainsaw-man", title: "Chainsaw Man", creator: "Tatsuki Fujimoto", coverUrl: "" },
    { id: "fallback-punpun", title: "Goodnight Punpun", creator: "Inio Asano", coverUrl: "" },
    { id: "fallback-monster", title: "Monster", creator: "Naoki Urasawa", coverUrl: "" },
    { id: "fallback-fma", title: "Fullmetal Alchemist", creator: "Hiromu Arakawa", coverUrl: "" },
  ];

  const STORY_DISCOVERY_META = Object.freeze({
    "tokyo ghoul re": { genres: ["Psychological", "Dark fantasy"], themes: ["Identity", "Belonging", "Transformation"], characters: ["Ken Kaneki", "Touka Kirishima"] },
    "tokyo ghoul": { genres: ["Psychological", "Dark fantasy"], themes: ["Identity", "Alienation", "Survival"], characters: ["Ken Kaneki", "Rize Kamishiro"] },
    "orb on the movements of the earth": { genres: ["Historical", "Drama"], themes: ["Knowledge", "Conviction", "Systems"], characters: ["Rafal", "Badeni"] },
    "billy bat": { genres: ["Mystery", "Historical"], themes: ["Conspiracy", "History", "Responsibility"], characters: ["Kevin Yamagata", "Billy"] },
    "vinland saga": { genres: ["Historical", "Action"], themes: ["Violence", "Purpose", "Growth"], characters: ["Thorfinn", "Askeladd"] },
    "blood on the tracks": { genres: ["Psychological", "Drama"], themes: ["Memory", "Fear", "Family"], characters: ["Seiichi Osabe", "Seiko Osabe"] },
    "berserk": { genres: ["Dark fantasy", "Action"], themes: ["Survival", "Responsibility", "Purpose"], characters: ["Guts", "Griffith"] },
    "the climber": { genres: ["Sports", "Psychological"], themes: ["Isolation", "Focus", "Growth"], characters: ["Buntaro Mori"] },
    "one piece": { genres: ["Adventure", "Fantasy"], themes: ["Freedom", "Loyalty", "Chosen family"], characters: ["Monkey D. Luffy", "Nico Robin"] },
    "land of the lustrous": { genres: ["Fantasy", "Drama"], themes: ["Identity", "Change", "Memory"], characters: ["Phosphophyllite", "Cinnabar"] },
    "20th century boys": { genres: ["Mystery", "Thriller"], themes: ["History", "Inherited myths", "Responsibility"], characters: ["Kenji Endo", "Friend"] },
    "homunculus": { genres: ["Psychological", "Horror"], themes: ["Identity", "Perception", "The body"], characters: ["Susumu Nakoshi"] },
    "steins gate": { genres: ["Science fiction", "Thriller"], themes: ["Time", "Choice", "Consequence"], characters: ["Rintaro Okabe", "Kurisu Makise"] },
    "chainsaw man": { genres: ["Action", "Horror"], themes: ["Systems", "Desire", "Identity"], characters: ["Denji", "Makima"] },
    "goodnight punpun": { genres: ["Psychological", "Drama"], themes: ["Memory", "Grief", "Isolation"], characters: ["Punpun Onodera", "Aiko Tanaka"] },
    "monster": { genres: ["Psychological", "Mystery"], themes: ["Responsibility", "Morality", "History"], characters: ["Kenzo Tenma", "Johan Liebert"] },
    "fullmetal alchemist": { genres: ["Fantasy", "Adventure"], themes: ["Choice", "Responsibility", "Sacrifice"], characters: ["Edward Elric", "Alphonse Elric"] },
  });

  function getStoryDiscoveryMeta(title) {
    return STORY_DISCOVERY_META[normalizeText(title)] || { genres: [], themes: [], characters: [] };
  }

  const SECTION5_MEDIA_ROOT = "img/section5";
  const SECTION5_MEDIA = Object.freeze({
    "moment-silence": [
      "foryou-moment-goodnight-punpun.webp",
      "foryou-moment-goodnight-punpun.jpg",
      "moment-goodnight-punpun.webp",
      "goodnight-punpun-moment.jpg",
    ],
    "character-kaneki": [
      "foryou-character-ken-kaneki.webp",
      "foryou-character-ken-kaneki.jpg",
      "character-ken-kaneki.webp",
      "tokyo-ghoul-re-kaneki.jpg",
    ],
    "reflection-responsibility": [
      "foryou-reflection-berserk.webp",
      "foryou-reflection-berserk.jpg",
      "reflection-berserk.webp",
      "berserk-reflection.jpg",
    ],
    "quote-choice": [
      "foryou-quote-fullmetal-alchemist.webp",
      "foryou-quote-fullmetal-alchemist.jpg",
      "quote-fullmetal-alchemist.webp",
      "fullmetal-alchemist-quote.jpg",
    ],
    "thought-memory": [
      "foryou-thought-blood-on-the-tracks.webp",
      "foryou-thought-blood-on-the-tracks.jpg",
      "thought-blood-on-the-tracks.webp",
      "blood-on-the-tracks-thought.jpg",
    ],
  });

  const PROFILE_DATA = Object.freeze({
    nova: {
      initial: "N",
      name: "nova.pages",
      label: "Your profile",
      bio: "Tracks identity, responsibility, and the truths that change with perspective.",
      tags: ["Psychological", "Character studies", "Identity", "Manga"],
      stats: [["42", "stories"], ["18", "public reflections"], ["126", "following"]],
      topStories: ["Tokyo Ghoul:re", "Orb: On the Movements of the Earth", "Billy Bat", "Vinland Saga", "Blood on the Tracks"],
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

    sol: {
      initial: "S",
      name: "sol.quotes",
      label: "Quote-led reader",
      bio: "Returns to lines about choice, hope, and the promises people keep under pressure.",
      tags: ["Quotes", "Choice", "Hope"],
      stats: [["49", "stories"], ["63", "saved quotes"], ["176", "following"]],
      topStories: ["Fullmetal Alchemist", "Steins;Gate", "One Piece", "Vinland Saga"],
      categories: [
        { title: "Lines that changed on reread", subtitle: "Quotes whose meaning moved with context", items: ["Choosing the next step", "Accepting the cost", "Keeping a promise", "Starting again"] },
        { title: "Favourite hopeful stories", subtitle: "Hope without easy answers", items: ["Fullmetal Alchemist", "One Piece", "Vinland Saga", "Steins;Gate"] },
      ],
      signature: "Lines that changed on reread",
      signatureItems: ["Choosing the next step", "Accepting the cost", "Keeping a promise"],
      match: "Your profiles both connect remembered lines to responsibility, sacrifice, and what people choose next.",
      difference: "Sol begins with language and dialogue; your profile more often begins with characters and systems.",
      sharedThemes: ["Choice", "Hope", "Responsibility"],
      activity: [
        { type: "Quote", title: "Fullmetal Alchemist", detail: "Added reread context", time: "3h" },
        { type: "Ranking", title: "Lines that changed on reread", detail: "Moved a promise to #1", time: "2d" },
      ],
      library: [
        { title: "Fullmetal Alchemist", creator: "Hiromu Arakawa", format: "Manga", status: "Completed", score: "9.6", layers: ["Quotes", "Characters", "Notes", "Thoughts"] },
        { title: "Steins;Gate", creator: "5pb. / Nitroplus", format: "Anime", status: "Completed", score: "9.4", layers: ["Quotes", "Moments", "Thoughts"] },
        { title: "One Piece", creator: "Eiichiro Oda", format: "Manga", status: "Reading", score: "9.3", layers: ["Quotes", "Characters", "Notes"] },
        { title: "Vinland Saga", creator: "Makoto Yukimura", format: "Manga", status: "Reading", score: "9.2", layers: ["Quotes", "Moments", "Thoughts"] },
      ],
    },
    aya: {
      initial: "A",
      name: "aya.archive",
      label: "History-and-mystery reader",
      bio: "Follows stories through institutions, inherited myths, and the records people leave behind.",
      tags: ["History", "Mystery", "Systems"],
      stats: [["71", "stories"], ["24", "public rankings"], ["267", "following"]],
      topStories: ["20th Century Boys", "Billy Bat", "Monster", "Orb: On the Movements of the Earth"],
      categories: [
        { title: "Best historical mysteries", subtitle: "Stories where the archive changes the present", items: ["20th Century Boys", "Billy Bat", "Monster", "Orb"] },
        { title: "Systems worth questioning", subtitle: "Institutions that shape private choices", items: ["Propaganda", "Education", "Public memory", "Authority"] },
      ],
      signature: "Best historical mysteries",
      signatureItems: ["20th Century Boys", "Billy Bat", "Monster"],
      match: "You both return to history, responsibility, and the way systems teach people what to believe.",
      difference: "Aya tracks evidence and chronology; your profile stays closer to identity and emotional consequence.",
      sharedThemes: ["History", "Systems", "Responsibility"],
      activity: [
        { type: "Ranking", title: "Best historical mysteries", detail: "Added Orb to the top four", time: "4h" },
        { type: "Note", title: "Billy Bat", detail: "Revised a timeline note", time: "1d" },
      ],
      library: [
        { title: "20th Century Boys", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.8", layers: ["Quotes", "Moments", "Characters", "Notes"] },
        { title: "Billy Bat", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.5", layers: ["Moments", "Characters", "Notes", "Thoughts"] },
        { title: "Monster", creator: "Naoki Urasawa", format: "Manga", status: "Completed", score: "9.7", layers: ["Quotes", "Characters", "Notes", "Thoughts"] },
        { title: "Orb: On the Movements of the Earth", creator: "Uoto", format: "Manga", status: "Completed", score: "9.4", layers: ["Quotes", "Moments", "Thoughts"] },
      ],
    },
    theo: {
      initial: "T",
      name: "theo.panels",
      label: "Composition-first reader",
      bio: "Reads movement, page rhythm, and visual transformation before explaining the theme underneath.",
      tags: ["Visual storytelling", "Transformation", "Isolation"],
      stats: [["45", "stories"], ["52", "saved moments"], ["198", "following"]],
      topStories: ["The Climber", "Land of the Lustrous", "Berserk", "Goodnight Punpun"],
      categories: [
        { title: "Best visual transformations", subtitle: "Changes that can be read in the image itself", items: ["Phosphophyllite", "Buntaro Mori", "Guts", "Punpun"] },
        { title: "Most expressive page rhythm", subtitle: "Stories whose pacing becomes meaning", items: ["The Climber", "Land of the Lustrous", "Berserk", "Goodnight Punpun"] },
      ],
      signature: "Best visual transformations",
      signatureItems: ["Phosphophyllite", "Buntaro Mori", "Guts"],
      match: "You both save moments where identity and perspective are visible before they are explained.",
      difference: "Theo is highly visual and concise; your profile gives more room to written reflection.",
      sharedThemes: ["Transformation", "Isolation", "Perspective"],
      activity: [
        { type: "Moment", title: "The Climber", detail: "Saved a vertical ascent panel", time: "6h" },
        { type: "Character", title: "Land of the Lustrous", detail: "Updated a transformation note", time: "2d" },
      ],
      library: [
        { title: "The Climber", creator: "Shin-ichi Sakamoto", format: "Manga", status: "Completed", score: "9.7", layers: ["Moments", "Characters", "Notes"] },
        { title: "Land of the Lustrous", creator: "Haruko Ichikawa", format: "Manga", status: "Reading", score: "9.5", layers: ["Moments", "Characters", "Thoughts"] },
        { title: "Berserk", creator: "Kentaro Miura", format: "Manga", status: "Reading", score: "9.4", layers: ["Moments", "Characters", "Notes"] },
        { title: "Goodnight Punpun", creator: "Inio Asano", format: "Manga", status: "Completed", score: "9.2", layers: ["Moments", "Characters", "Thoughts"] },
      ],
    },
  });

  const FEED_ITEMS = Object.freeze([
    {
      profile: "kai",
      type: "Ranking updated",
      layer: "Ranking",
      title: "Stories that refuse an easy victory",
      detail: "Moved Berserk to #1 after revisiting the cost of survival.",
      story: "Berserk",
      time: "1h",
      tone: "ranking",
    },
    {
      profile: "mira",
      type: "Moment added",
      layer: "Moment",
      title: "The frame before the next step",
      detail: "Saved a mountain panel and wrote about isolation becoming focus.",
      story: "The Climber",
      time: "2h",
      tone: "moment",
    },
    {
      profile: "ren",
      type: "Reflection published",
      layer: "Reflection",
      title: "The choice that creates another timeline",
      detail: "Published a spoiler-protected reflection on memory, consequence, and choosing again.",
      story: "Steins;Gate",
      time: "5h",
      tone: "reflection",
    },
    {
      profile: "kai",
      type: "Quote saved",
      layer: "Quote",
      title: "A promise that keeps moving forward",
      detail: "Connected a remembered line to loyalty and chosen family.",
      story: "One Piece",
      time: "1d",
      tone: "quote",
    },
    {
      profile: "mira",
      type: "Character note",
      layer: "Character",
      title: "Phosphophyllite across every change",
      detail: "Added a character note about memory, form, and continuity.",
      story: "Land of the Lustrous",
      time: "1d",
      tone: "character",
    },
    {
      profile: "ren",
      type: "Note edited",
      layer: "Note",
      title: "What the ending asks us to inherit",
      detail: "Reworked a public note after comparing two timelines.",
      story: "20th Century Boys",
      time: "2d",
      tone: "note",
    },
    {
      profile: "kai",
      type: "Thought added",
      layer: "Thought",
      title: "The body as an unreliable answer",
      detail: "Connected a new thought to self-image and perception.",
      story: "Homunculus",
      time: "2d",
      tone: "thought",
    },
    {
      profile: "mira",
      type: "Library updated",
      layer: "Library",
      title: "Moved to completed",
      detail: "Updated progress, score, and the public layers saved with it.",
      story: "Monster",
      time: "3d",
      tone: "library",
    },
    {
      profile: "ren",
      type: "Category created",
      layer: "Ranking",
      title: "Characters shaped by impossible systems",
      detail: "Created a profile ranking with four entries and a short note.",
      story: "Chainsaw Man",
      time: "4d",
      tone: "category",
    },
  ]);

  const DISCOVERY_ARTIFACTS = Object.freeze([
    {
      id: "mira-moment-silence",
      mediaKey: "moment-silence",
      profile: "mira",
      type: "Moment",
      layer: "moments",
      story: "Goodnight Punpun",
      title: "The silence after the choice",
      excerpt: "A saved visual moment where the empty space after a decision carries more memory than the conversation that came before it.",
      reason: "Shown because you save visual moments around memory, grief, and perspective.",
      tags: ["Memory", "Visual storytelling", "Grief"],
      meta: "1 saved moment · visual note",
      popularity: 94,
      updatedHours: 2,
    },
    {
      id: "kai-character-kaneki",
      mediaKey: "character-kaneki",
      profile: "kai",
      type: "Character",
      layer: "characters",
      story: "Tokyo Ghoul:re",
      subject: "Ken Kaneki",
      title: "Ken Kaneki after the fracture",
      excerpt: "A character note about the gap between surviving a transformation and knowing what kind of person should exist afterward.",
      reason: "Shown because Kaneki leads your public ranking and identity repeats across your notes.",
      tags: ["Identity", "Character arc", "Belonging"],
      meta: "Character note · ranked #1",
      popularity: 98,
      updatedHours: 5,
    },
    {
      id: "kai-quote-choice",
      mediaKey: "quote-choice",
      profile: "kai",
      type: "Quote",
      layer: "quotes",
      story: "Fullmetal Alchemist",
      title: "A line remembered for the choice around it",
      excerpt: "The saved line stays private here; the public note explains why its idea about responsibility changed after a reread.",
      reason: "Shown because you connect remembered lines to responsibility and sacrifice.",
      tags: ["Choice", "Responsibility", "Reread"],
      meta: "Saved quote · public context note",
      popularity: 88,
      updatedHours: 24,
    },
    {
      id: "mira-thought-memory",
      mediaKey: "thought-memory",
      profile: "mira",
      type: "Thought",
      layer: "thoughts",
      story: "Blood on the Tracks",
      title: "Memory changes the frame",
      excerpt: "The image returns differently after a reread. What first looked like a private moment begins to feel like evidence of how fear can reorganize a family, teach a child to distrust their own memory, and keep shaping every later relationship even when the original scene is no longer visible. The thought stays unfinished because the meaning keeps moving with the reader...",
      reason: "Shown because your profile returns to memory, perspective, and emotional aftermath.",
      tags: ["Memory", "Fear", "Perspective"],
      meta: "Connected thought · edited 2d ago",
      popularity: 86,
      updatedHours: 48,
    },
    {
      id: "ren-ranking-conflicts",
      mediaKey: "",
      profile: "ren",
      type: "Ranking",
      layer: "ranking",
      story: "Monster",
      title: "Conflicts that reshape every side",
      excerpt: "A public ranking that compares conflicts by the ideas they force every character to inherit.",
      reason: "Shown because responsibility, history, and opposing systems repeat across your public profile.",
      tags: ["History", "Responsibility", "Conflict"],
      items: ["Tenma and Johan", "Friend and Kenji", "Guts and Griffith"],
      meta: "Public ranking · updated 4d ago",
      popularity: 90,
      updatedHours: 72,
    },
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
    social: { number: "03", label: "Following, For You, and Search", status: "Social", announcement: "Scan activity from people you follow, discover public story layers, and search by theme or reader." },
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
    searchQuery: "Identity",
    searchFilter: "all",
    searchMode: "content",
    searchLayer: "all",
    searchReflectionOnly: false,
        searchSort: "relevance",
    forYouArtifact: 0,
  };

  const demoState = {
    audience: "private",
    spoiler: false,
    socialView: "following",
    storyLayer: "quotes",
    forYouArtifact: 0,
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
    forYouArtifact: false,
  };

  let timeline = null;
  let trigger = null;
  let supabaseClient = null;
  let stories = [...FALLBACK_STORIES];
  let primaryStory = FALLBACK_STORIES[0];
  let resizeObserver = null;
  let lastDemoSignature = "";
  let lastForYouArtifact = 0;
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
        <span class="social-copy-state__index">03 · Activity, ideas, and intentional search</span>
        <h2>Follow people. Discover ideas. Search with intent.</h2>
        <p>Following shows what changed. For You becomes a one-card-at-a-time stream for moments, characters, reflections, quotes, and thoughts. Search then narrows by result type, story, and sort order.</p>
        <div class="social-copy-proof" aria-label="Social features">
          <span>Visual activity</span><span>Layer-by-layer discovery</span><span>Layered search</span>
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
      if (small) small.textContent = "Activity to discovery";
    }

    if (principle) {
      principle.textContent = "Follow the people you chose. Discover one idea at a time. Search only when you know what you need.";
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
      <article class="s11-profile s14-profile" data-s11-profile>
        <header class="s11-profile__hero s14-profile__hero">
          <div class="s11-profile__banner" aria-hidden="true"><span>perspective</span></div>
          <div class="s11-profile__identity" data-s14-profile-intro>
            <div class="s11-avatar s11-avatar--large" data-s11-own-avatar>N</div>
            <div class="s11-profile__copy">
              <span class="s11-kicker">Your public profile</span>
              <h3>nova.pages</h3>
              <p data-s11-own-bio></p>
              <div class="s11-tag-row" data-s11-own-tags></div>
            </div>
            <button type="button" class="s11-secondary-button" data-s11-edit-profile>Edit profile</button>
          </div>
          <div class="s11-stats" data-s11-own-stats data-s14-profile-stats></div>
        </header>

        <div class="s11-profile__body s14-profile__body">
          <section class="s11-top-stories s14-top-stories" aria-labelledby="s11-top-stories-title" data-s14-profile-ranking>
            <div class="s11-section-heading">
              <span><small>Taste at a glance</small><strong id="s11-top-stories-title">The stories that define me</strong></span>
              <button type="button" class="s11-text-button" data-s11-open-ranking>View full Top 10</button>
            </div>
            <div class="s11-ranking-showcase s14-ranking-showcase" data-s11-own-ranking></div>
          </section>

          <aside class="s11-profile__side s14-profile__side">
            <section class="s11-category-section s14-category-section" aria-labelledby="s11-categories-title" data-s14-profile-categories>
              <div class="s11-section-heading s11-section-heading--compact">
                <span><small>Curated by you</small><strong id="s11-categories-title">Custom profile showcases</strong></span>
                <span class="s11-count-pill">3 categories</span>
              </div>
              <div class="s11-category-tabs" role="tablist" aria-label="Profile showcase category" data-s11-own-category-tabs></div>
              <div class="s11-category-detail" data-s11-own-category-detail></div>
            </section>

            <section class="s11-activity-section s14-activity-section" aria-labelledby="s11-activity-title" data-s14-profile-activity>
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
      <section class="s11-social-stage s12-social-stage s13-social-stage s14-social-stage" data-s11-social-stage aria-label="Social product journey">
        <header class="s11-social-stage__header s12-social-stage__header s13-social-stage__header s14-social-stage__header">
          <span class="s11-social-stage__brand"><small>Inkwell social</small><strong data-s11-social-view-title>Following activity</strong></span>
          <div class="s11-social-tabs" role="tablist" aria-label="Social view">
            <button type="button" role="tab" data-s11-social-tab="following" aria-selected="true">Following</button>
            <button type="button" role="tab" data-s11-social-tab="foryou" aria-selected="false">For You</button>
            <button type="button" role="tab" data-s11-social-tab="search" aria-selected="false">Search</button>
          </div>
          <span class="s11-social-stage__progress s12-social-stage__progress" data-s11-social-progress aria-label="Social journey step 1 of 3">
            <span><strong data-s11-social-progress-value>01</strong><small>/03</small></span>
            <i class="s12-progress-segments" aria-hidden="true">
              ${Array.from({ length: 3 }, (_, index) => `<b data-s11-social-progress-segment="${index + 1}"></b>`).join("")}
            </i>
          </span>
        </header>

        <div class="s11-social-viewport" data-s11-social-viewport>
          <section class="s11-social-view is-active" data-s11-social-view="following" role="tabpanel" aria-label="Following activity">
            <header class="s11-view-heading s12-view-heading s13-view-heading s14-view-heading">
              <span><small>Latest from people you chose</small><strong>Following</strong><p>Nine visual updates. Every card makes the story cover, the changed layer, and the reason to open it immediately scannable.</p></span>
              <span class="s11-count-pill">9 updates</span>
            </header>
            <div class="s13-following-grid s14-following-grid" data-s11-following-grid role="feed" aria-label="Updates from followed readers"></div>
          </section>

          <section class="s11-social-view" data-s11-social-view="foryou" role="tabpanel" aria-label="For You discovery" aria-hidden="true" inert hidden>
            <header class="s11-view-heading s12-view-heading s13-view-heading s14-view-heading s14-view-heading--foryou">
              <span><small>One story layer at a time</small><strong>For You</strong><p>One saved layer stays in focus. Move between a moment, character, quote, thought, or ranking, then open the reader, title, or reflection from the bottom dock.</p></span>
              <span class="s11-count-pill" data-s14-for-you-count>1 / 5</span>
            </header>
            <div class="s13-for-you-stage s14-for-you-stage" data-s11-for-you-results></div>
          </section>

          <section class="s11-social-view" data-s11-social-view="search" role="tabpanel" aria-label="Search" aria-hidden="true" inert hidden>
            <header class="s11-view-heading s11-view-heading--search s12-view-heading s13-view-heading s14-view-heading s14-view-heading--search">
              <span><small>Search themes or readers</small><strong>Start with an idea, genre, character, or reading style</strong><p>Content finds public layers connected to the same idea. People finds readers whose themes, characters, rankings, and activity match it.</p></span>
              <span class="s11-count-pill" data-s14-search-count>6 results</span>
            </header>

            <div class="s17-search-scope" role="tablist" aria-label="Search result family">
              <button type="button" role="tab" data-s13-search-mode="content" aria-selected="true">
                <span>01</span><strong>Content</strong><small>Ideas inside moments, characters, quotes, thoughts, rankings, and notes</small>
              </button>
              <button type="button" role="tab" data-s13-search-mode="people" aria-selected="false">
                <span>02</span><strong>People</strong><small>Reader profiles ranked by themes, genres, characters, and public activity</small>
              </button>
            </div>

            <div class="s17-search-content-filters s19-search-content-filters" data-s17-search-content-filters>
              <div class="s17-search-layerbar s19-search-layerbar" role="radiogroup" aria-label="Content layer">
                <button type="button" data-s17-search-layer="all" aria-pressed="true">All</button>
                <button type="button" data-s17-search-layer="moment" aria-pressed="false">Moments</button>
                <button type="button" data-s17-search-layer="character" aria-pressed="false">Characters</button>
                <button type="button" data-s17-search-layer="quote" aria-pressed="false">Quotes</button>
                <button type="button" data-s17-search-layer="thought" aria-pressed="false">Thoughts</button>
                <button type="button" data-s17-search-layer="ranking" aria-pressed="false">Rankings</button>
                <button type="button" data-s17-search-layer="note" aria-pressed="false">Notes</button>
              </div>
              <button type="button" class="s17-reflection-toggle s19-reflection-toggle" data-s17-search-reflection aria-pressed="false"><span aria-hidden="true">◇</span>Has reflection</button>
            </div>

            <div class="s14-search-toolbar s17-search-toolbar s19-search-toolbar">
              <div class="s11-search-box s13-search-box s14-search-box">
                <label for="s11-reader-search">Search a genre, theme, character, reader style, or ranking idea</label>
                <div class="s11-search-input-shell"><span aria-hidden="true">⌕</span><input id="s11-reader-search" data-s11-search-input type="search" value="Identity" placeholder="Try identity, historical drama, grief, Ken Kaneki..." autocomplete="off"></div>
                <div class="s11-search-suggestions" aria-label="Suggested searches">
                  <button type="button" data-s11-search-suggestion="Identity">Identity</button>
                  <button type="button" data-s11-search-suggestion="Historical drama">Historical drama</button>
                  <button type="button" data-s11-search-suggestion="Visual storytelling">Visual storytelling</button>
                </div>
              </div>

              <div class="s14-search-selects s17-search-selects s19-search-selects">
                <label><span>Sort by</span><select data-s14-search-sort aria-label="Sort search results"><option value="relevance">Best match</option><option value="recent">Recently updated</option><option value="saved">Most saved</option><option value="reader">Reader match</option></select></label>
              </div>
            </div>

            <div class="s14-search-active" data-s13-search-filters aria-live="polite"></div>
            <div class="s11-search-summary s13-search-summary s14-search-summary" data-s11-search-summary></div>
            <div class="s13-search-results s14-search-results" data-s11-search-results></div>
          </section>

          <section class="s11-social-view" data-s11-social-view="profile" aria-label="Selected reader profile" aria-hidden="true" inert hidden data-s11-reader-profile></section>
          <section class="s11-social-view" data-s11-social-view="library" aria-label="Selected reader library" aria-hidden="true" inert hidden data-s11-reader-library></section>
          <section class="s11-social-view" data-s11-social-view="story" aria-label="Selected story layers" aria-hidden="true" inert hidden data-s11-story-detail></section>
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
      socialProgressRoot: q("[data-s11-social-progress]"),
      socialProgress: q("[data-s11-social-progress-value]"),
      socialProgressSegments: qa("[data-s11-social-progress-segment]"),
      socialTabs: qa("[data-s11-social-tab]"),
      socialViews: qa("[data-s11-social-view]"),
      followingGrid: q("[data-s11-following-grid]"),
      forYouResults: q("[data-s11-for-you-results]"),
      searchResults: q("[data-s11-search-results]"),
      searchInput: q("[data-s11-search-input]"),
      searchModes: qa("[data-s13-search-mode]"),
      searchLayerButtons: qa("[data-s17-search-layer]"),
      searchReflectionToggle: q("[data-s17-search-reflection]"),
      searchContentFilters: q("[data-s17-search-content-filters]"),
      searchFilterContainer: q("[data-s13-search-filters]"),
      searchFilterLabel: q("[data-s13-search-filter-label]"),
      searchStorySelect: q("[data-s14-search-story]"),
      searchSortSelect: q("[data-s14-search-sort]"),
      searchCount: q("[data-s14-search-count]"),
      forYouCount: q("[data-s14-for-you-count]"),
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
      const target = event.target.closest("button, input, select, a");
      if (!target) return;
      if (target.matches("[data-social-audience]")) userLocks.audience = true;
      if (target.matches("[data-social-spoiler-toggle], [data-social-spoiler-reveal]")) userLocks.spoiler = true;
      if (target.matches("[data-social-share-button]")) {
        userLocks.share = true;
        userLocks.audience = true;
        userLocks.spoiler = true;
      }
      if (target.matches("[data-s11-social-tab], [data-s11-back-social], [data-s11-open-library], [data-s11-open-story], [data-s13-open-artifact], [data-s18-open-reflection], [data-s13-feed-open], [data-s13-open-author]")) userLocks.socialView = true;
      if (target.matches("[data-s13-for-you-select], [data-s14-for-you-dot], [data-s17-for-you-prev], [data-s17-for-you-next]")) userLocks.forYouArtifact = true;
      if (target.closest("[data-s11-profile-key]")) {
        userLocks.profile = true;
        userLocks.socialView = true;
      }
      if (target.matches("[data-s11-story-layer]")) userLocks.storyLayer = true;
      if (target.matches("[data-s11-search-input], [data-s11-search-suggestion], [data-s13-search-mode], [data-s17-search-layer], [data-s17-search-reflection], [data-s14-search-story], [data-s14-search-sort]")) userLocks.search = true;
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

    elements.searchModes.forEach((button, index) => {
      listen(button, "click", () => setSearchMode(button.dataset.s13SearchMode || "content", true, "user"));
      listen(button, "keydown", (event) => handleRovingTabKey(event, elements.searchModes, index));
    });


    listen(elements.searchSortSelect, "change", () => {
      state.searchSort = elements.searchSortSelect.value || "relevance";
      renderSearchResults(true);
    });

    listen(elements.searchFilterContainer, "click", (event) => {
      const chip = event.target.closest("[data-s14-clear-search-filter]");
      if (!chip) return;
      const key = chip.dataset.s14ClearSearchFilter;
      if (key === "type") state.searchMode = "content";
      if (key === "layer") state.searchLayer = "all";
      if (key === "reflection") state.searchReflectionOnly = false;
      if (key === "query") {
        state.searchQuery = "";
        if (elements.searchInput) elements.searchInput.value = "";
      }
      renderSearchResults(true);
    });

    listen(elements.socialStage, "click", handleSocialStageClick);
    listen(elements.socialStage, "keydown", handleSocialStageKeydown);
    setupForYouFeedInteractions();

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
      state.searchMode = inferSearchMode(value);
      state.searchFilter = "all";
      if (elements.searchInput) elements.searchInput.value = value;
      renderSearchResults(true);
      return;
    }

    const forYouChoice = event.target.closest("[data-s13-for-you-select], [data-s14-for-you-dot]");
    if (forYouChoice) {
      const index = Number(forYouChoice.dataset.s13ForYouSelect ?? forYouChoice.dataset.s14ForYouDot ?? 0);
      setForYouArtifact(index, true, "user");
      return;
    }

    const previousForYou = event.target.closest("[data-s17-for-you-prev]");
    if (previousForYou) {
      setForYouArtifact(state.forYouArtifact - 1, true, "user");
      return;
    }

    const nextForYou = event.target.closest("[data-s17-for-you-next]");
    if (nextForYou) {
      setForYouArtifact(state.forYouArtifact + 1, true, "user");
      return;
    }

    const searchLayer = event.target.closest("[data-s17-search-layer]");
    if (searchLayer) {
      state.searchLayer = searchLayer.dataset.s17SearchLayer || "all";
      renderSearchResults(true);
      announce(`${searchLayer.textContent.trim()} selected.`);
      return;
    }

    const reflectionToggle = event.target.closest("[data-s17-search-reflection]");
    if (reflectionToggle) {
      state.searchReflectionOnly = !state.searchReflectionOnly;
      renderSearchResults(true);
      announce(state.searchReflectionOnly ? "Only content with a reflection is shown." : "All reflection states are shown.");
      return;
    }

    const reflection = event.target.closest("[data-s18-open-reflection]");
    if (reflection) {
      const owner = reflection.dataset.s18ReflectionOwner;
      if (owner && PROFILE_DATA[owner]) selectProfile(owner, false, "user");
      const title = reflection.dataset.s18OpenReflection || primaryStory.title;
      state.selectedStory = title;
      renderStoryDetail(title);
      setSocialView("story", true, "user");
      requestAnimationFrame(() => setStoryLayer("reflection", true, "user"));
      return;
    }

    const artifact = event.target.closest("[data-s13-open-artifact]");
    if (artifact) {
      openDiscoveryArtifact(artifact.dataset.s13OpenArtifact || "", true, "user");
      return;
    }

    const feedItem = event.target.closest("[data-s13-feed-open]");
    if (feedItem) {
      openFollowingItem(Number(feedItem.dataset.s13FeedOpen || 0), true);
      return;
    }

    const author = event.target.closest("[data-s13-open-author]");
    if (author) {
      openReaderProfile(author.dataset.s13OpenAuthor || "kai", true, "user");
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
      const owner = openStory.dataset.s13StoryOwner;
      if (owner && PROFILE_DATA[owner]) selectProfile(owner, false, "user");
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

    const filter = event.target.closest("[data-s13-search-filter]");
    if (filter) {
      const buttons = qa("[data-s13-search-filter]", elements.searchFilterContainer);
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
    timeline.fromTo(elements.profile, { autoAlpha: 0, y: 22, scale: 0.984 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: "power3.out" }, "identity-transition+=0.12");
    timeline.to(elements.scenes.control, { autoAlpha: 0, duration: 0.22 }, "identity-transition+=0.26");

    timeline.addLabel("identity", ACT_TIMES.identity);
    /* Only stable containers are timeline targets. Database hydration replaces
       cards inside these containers, so animating the old card nodes left the
       newly rendered profile and search content invisible in V14. */
    timeline.fromTo(q("[data-s14-profile-intro]", elements.profile), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.36, ease: "power3.out" }, "identity");
    timeline.fromTo(q("[data-s14-profile-stats]", elements.profile), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" }, "identity+=0.16");
    timeline.fromTo(q("[data-s14-profile-ranking]", elements.profile), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" }, "identity+=0.36");
    timeline.fromTo(q("[data-s14-profile-categories]", elements.profile), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.42, ease: "power3.out" }, "identity+=0.9");
    timeline.fromTo(q("[data-s14-profile-activity]", elements.profile), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power3.out" }, "identity+=1.34");

    timeline.addLabel("social-transition", ACT_TIMES.socialTransition);
    timeline.call(() => setSocialView("following", false, "restore"), null, "social-transition");
    timeline.to(identityCopy, { autoAlpha: 0, y: -16, duration: 0.34, ease: "power2.inOut" }, "social-transition");
    timeline.fromTo(socialCopy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.46, ease: "power3.out" }, "social-transition+=0.12");
    timeline.to(elements.profile, { autoAlpha: 0, x: -28, scale: 0.984, duration: 0.46, ease: "power2.inOut" }, "social-transition");
    timeline.set(elements.scenes.social, { visibility: "visible" }, "social-transition+=0.06");
    timeline.to(elements.scenes.social, { autoAlpha: 1, duration: 0.34, ease: "power2.out" }, "social-transition+=0.08");
    timeline.fromTo(elements.socialStage, { autoAlpha: 0, y: 20, scale: 0.986 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: "power3.out" }, "social-transition+=0.12");
    timeline.to(elements.scenes.identity, { autoAlpha: 0, duration: 0.22 }, "social-transition+=0.26");

    timeline.addLabel("social", ACT_TIMES.social);
    timeline.fromTo(elements.followingGrid, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.44, ease: "power3.out" }, "social+=0.1");
    timeline.to({}, { duration: ACT_TIMES.end - ACT_TIMES.social }, "social");
    timeline.addLabel("section-end", ACT_TIMES.end);

    if (MANAGED_BY_HOME_JOURNEY) {
      timeline.pause(0);
      return;
    }

    trigger = ScrollTrigger.create({
      id: "inkwell-social-cinema-v14",
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
    gsap.set([
      q("[data-s14-profile-intro]", elements.profile),
      q("[data-s14-profile-stats]", elements.profile),
      q("[data-s14-profile-ranking]", elements.profile),
      q("[data-s14-profile-categories]", elements.profile),
      q("[data-s14-profile-activity]", elements.profile),
    ].filter(Boolean), { autoAlpha: 0 });
    clearDynamicMotionStyles(elements.profile);
    clearDynamicMotionStyles(elements.socialStage);
    gsap.set(elements.followingGrid, { autoAlpha: 0, y: 14 });
    gsap.set(elements.socialStage, { autoAlpha: 0, y: 20, scale: 0.986 });
    enforceSocialPanelOwnership(state.socialView || "following");
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

    if (time <= DEMO_THRESHOLDS.forYouLeave) demoState.socialView = "following";
    else if (time >= DEMO_THRESHOLDS.searchEnter) demoState.socialView = "search";
    else if (time >= DEMO_THRESHOLDS.forYouEnter) demoState.socialView = "foryou";
    else if (demoState.socialView === "search" && time <= DEMO_THRESHOLDS.searchLeave) demoState.socialView = "foryou";

    if (time < DEMO_THRESHOLDS.forYouSecondEnter) demoState.forYouArtifact = 0;
    else if (time < DEMO_THRESHOLDS.forYouThirdEnter) demoState.forYouArtifact = 1;
    else if (time < DEMO_THRESHOLDS.forYouFourthEnter) demoState.forYouArtifact = 2;
    else if (time < DEMO_THRESHOLDS.forYouFifthEnter) demoState.forYouArtifact = 3;
    else demoState.forYouArtifact = 4;

    demoState.storyLayer = "quotes";

    const signature = JSON.stringify(demoState);
    if (!force && signature === lastDemoSignature) return;
    lastDemoSignature = signature;

    if (!userLocks.audience) renderAudience(demoState.audience, true, "demo");
    if (!userLocks.spoiler) renderSpoiler(demoState.spoiler, true, "demo");

    if (state.activeAct === "social" && !userLocks.socialView) {
      setSocialView(demoState.socialView, true, "demo");
    }
    if (state.activeAct === "social" && demoState.socialView === "foryou" && !userLocks.forYouArtifact) {
      setForYouArtifact(demoState.forYouArtifact, true, "demo");
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
    if (key === "social") {
      enforceSocialPanelOwnership(state.socialView || "following");
      updateSocialChrome(state.socialView);
    }
    announce(meta.announcement);
  }

  function clearDynamicMotionStyles(root = section) {
    if (!root || !gsap) return;
    const dynamic = qa(
      ".s11-stat, .s11-rank-card, .s11-category-tab, .s11-category-detail > *, " +
      ".s11-activity-item, .s13-following-card, .s13-search-card",
      root,
    );
    if (dynamic.length) {
      gsap.killTweensOf(dynamic);
      gsap.set(dynamic, { clearProps: "opacity,visibility,transform" });
    }
  }

  function blurFocusWithin(root) {
    const active = document.activeElement;
    if (root && active instanceof HTMLElement && root.contains(active)) {
      active.blur();
    }
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
    clearDynamicMotionStyles(elements.profile);

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
    if (!elements.followingGrid) return;
    elements.followingGrid.innerHTML = FEED_ITEMS
      .map((item, index) => followingCardMarkup(item, index))
      .join("");
    renderImages(elements.followingGrid);
    clearDynamicMotionStyles(elements.followingGrid);
  }


  function renderReaderResults(animate = false) {
    if (!elements.forYouResults) return;
    const count = Math.min(5, DISCOVERY_ARTIFACTS.length);
    state.forYouArtifact = clamp(Math.round(Number(state.forYouArtifact) || 0), 0, count - 1);

    if (!q("[data-s14-for-you-feed]", elements.forYouResults)) {
      elements.forYouResults.innerHTML = `
        <div class="s14-for-you-feed s17-for-you-feed" data-s14-for-you-feed aria-label="For You recommendations. Use the page scroll, arrow keys, or the up and down controls to move between recommendations.">
          ${DISCOVERY_ARTIFACTS.slice(0, count).map((artifact, index) => forYouArtifactMarkup(artifact, index)).join("")}
        </div>
        <nav class="s14-for-you-dots s17-for-you-nav" aria-label="For You item">
          <button type="button" class="s17-for-you-arrow" data-s17-for-you-prev aria-label="Show previous recommendation">↑</button>
          <span class="s17-for-you-nav__label" aria-hidden="true">More ideas</span>
          <span class="s17-for-you-nav__dots">
            ${Array.from({ length: count }, (_, index) => `<button type="button" data-s14-for-you-dot="${index}" aria-label="Show recommendation ${index + 1}" aria-current="${index === state.forYouArtifact ? "true" : "false"}"><span></span></button>`).join("")}
          </span>
          <button type="button" class="s17-for-you-arrow" data-s17-for-you-next aria-label="Show next recommendation">↓</button>
        </nav>`;
      renderImages(elements.forYouResults);
      renderArtifactMedia(elements.forYouResults);
      setupForYouFeedInteractions(true);
    }

    syncForYouStage(animate);
  }

  function setForYouArtifact(index, animate, source = "system") {
    const count = Math.min(5, DISCOVERY_ARTIFACTS.length);
    const normalized = clamp(Math.round(Number(index) || 0), 0, count - 1);
    state.forYouArtifact = normalized;
    renderReaderResults(animate);
    if (source === "user") {
      const artifact = DISCOVERY_ARTIFACTS[normalized];
      announce(`${artifact.type} recommendation from ${PROFILE_DATA[artifact.profile].name} selected.`);
    }
  }

  function renderSearchResults(animate) {
    try {
      renderSearchResultsInternal(animate);
    } catch (error) {
      console.error("Inkwell Section 5 search render failed:", error);
      if (elements.searchResults) {
        elements.searchResults.innerHTML = `<div class="s14-search-empty"><span><strong>Search could not finish rendering.</strong><small>Try another result type or clear the active query.</small></span></div>`;
      }
      setText(elements.searchSummary, "Search is ready for another query.");
      setText(elements.searchCount, "0 results");
    }
  }

  function renderSearchResultsInternal(animate) {
    if (!elements.searchResults) return;
    renderSearchFilters();
    updateSearchModeTabs();

    const mode = state.searchMode === "people" ? "people" : "content";
    const query = normalizeText(state.searchQuery);
    const tokens = query.split(/\s+/).filter(Boolean);

    let contentCandidates = getSearchContentItems()
      .map((artifact, index) => ({
        kind: "artifact",
        artifact,
        index,
        score: scoreArtifact(artifact, tokens),
        recent: Number(artifact.updatedHours ?? 999),
        saved: Number(artifact.popularity ?? 0),
        reader: scoreValues([PROFILE_DATA[artifact.profile]?.match, ...(artifact.tags || [])], tokens),
      }))
      .filter(({ artifact }) => state.searchLayer === "all" || artifact.searchLayer === state.searchLayer)
      .filter(({ artifact }) => !state.searchReflectionOnly || artifact.hasReflection === true);

    const readerCandidates = scoreReaders(tokens, "all")
      .map((item, index) => ({
        kind: "reader",
        ...item,
        index,
        recent: 8 + index * 5,
        saved: 100 - index * 4,
        reader: item.score + 5,
      }));

    let cards = mode === "people" ? readerCandidates : contentCandidates;

    const sorter = {
      relevance: (a, b) => b.score - a.score,
      recent: (a, b) => a.recent - b.recent,
      saved: (a, b) => b.saved - a.saved,
      reader: (a, b) => b.reader - a.reader,
    }[state.searchSort] || ((a, b) => b.score - a.score);

    cards.sort(sorter);
    if (mode === "content" && tokens.length && cards.some((item) => item.score > 0)) cards = cards.filter((item) => item.score > 0);

    const shown = cards.slice(0, 6);
    const markup = shown.map((item) => {
      if (item.kind === "reader") return searchResultMarkup(item.key, item.reason, item.score);
      return searchArtifactMarkup(item.artifact);
    }).join("");

    const gridClass = mode === "people" ? "s13-search-grid--readers" : "s13-search-grid--discover";
    elements.searchResults.innerHTML = `<div class="s13-search-grid s14-search-grid ${gridClass} s19-search-grid" data-s17-search-family="${mode}">${markup || searchEmptyMarkup()}</div>`;
    renderImages(elements.searchResults);

    const family = mode === "people" ? "reader" : "content";
    const queryLabel = state.searchQuery ? ` matching “${state.searchQuery}”` : "";
    setText(elements.searchSummary, `${shown.length} ${family} result${shown.length === 1 ? "" : "s"}${queryLabel}. Sorted by ${searchSortLabel(state.searchSort)}.`);
    setText(elements.searchCount, `${shown.length} result${shown.length === 1 ? "" : "s"}`);

    const renderedCards = qa(".s13-search-card", elements.searchResults);
    if (gsap && renderedCards.length) {
      gsap.killTweensOf(renderedCards);
      gsap.set(renderedCards, { clearProps: "opacity,visibility,transform" });
      if (animate) {
        gsap.fromTo(renderedCards, { autoAlpha: 0, y: 10, scale: 0.992 }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          stagger: 0.035,
          ease: "power3.out",
          overwrite: "auto",
          onComplete: () => gsap.set(renderedCards, { clearProps: "transform" }),
        });
      }
    }
  }

  function getSearchContentItems() {
    const layerAlias = (value) => {
      const normalized = normalizeText(value);
      if (normalized === "reflection") return "note";
      if (normalized === "library" || normalized === "category") return "ranking";
      return normalized || "note";
    };

    const discovery = DISCOVERY_ARTIFACTS.map((artifact) => {
      const meta = getStoryDiscoveryMeta(artifact.story);
      return {
        ...artifact,
        searchLayer: layerAlias(artifact.type),
        hasReflection: true,
        genres: meta.genres,
        themes: meta.themes,
        characters: meta.characters,
        source: "discovery",
      };
    });

    const feed = FEED_ITEMS.map((item, index) => {
      const profile = PROFILE_DATA[item.profile];
      const searchLayer = layerAlias(item.layer);
      const meta = getStoryDiscoveryMeta(item.story);
      return {
        id: `feed-${index}`,
        feedIndex: index,
        profile: item.profile,
        type: item.layer,
        layer: searchLayer,
        searchLayer,
        story: item.story,
        title: item.title,
        excerpt: item.detail,
        reason: activityActionCopy(item, getStoryByTitle(item.story)),
        tags: [item.layer, ...(profile?.tags || []).slice(0, 2)],
        genres: meta.genres,
        themes: meta.themes,
        characters: meta.characters,
        meta: `${item.type} · ${item.time}`,
        popularity: 82 - index,
        updatedHours: index + 1,
        hasReflection: ["moment", "character", "quote", "thought", "note"].includes(searchLayer) || item.type.includes("Reflection"),
        source: "feed",
      };
    });

    const map = new Map();
    [...discovery, ...feed].forEach((item) => {
      const key = `${normalizeText(item.story)}|${normalizeText(item.searchLayer)}|${normalizeText(item.title)}`;
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  }

  function setSearchMode(mode, animate, source = "system") {
    state.searchMode = mode === "people" ? "people" : "content";
    renderSearchResults(animate);
    if (source === "user") announce(`${searchModeLabel(state.searchMode)} selected.`);
  }

  function updateSearchModeTabs() {
    elements.searchModes.forEach((button) => {
      const selected = button.dataset.s13SearchMode === state.searchMode;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });

    if (elements.searchContentFilters) {
      const visible = state.searchMode === "content";
      elements.searchContentFilters.hidden = !visible;
      elements.searchContentFilters.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    elements.searchLayerButtons?.forEach((button) => {
      const selected = button.dataset.s17SearchLayer === state.searchLayer;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    if (elements.searchReflectionToggle) {
      elements.searchReflectionToggle.classList.toggle("is-selected", state.searchReflectionOnly);
      elements.searchReflectionToggle.setAttribute("aria-pressed", state.searchReflectionOnly ? "true" : "false");
    }
  }

  function renderSearchFilters() {
    if (elements.searchSortSelect) elements.searchSortSelect.value = state.searchSort;

    updateSearchModeTabs();
    if (!elements.searchFilterContainer) return;
    const chips = [];
    if (state.searchQuery) chips.push(`<button type="button" data-s14-clear-search-filter="query">Idea: ${escapeHtml(state.searchQuery)} <span aria-hidden="true">×</span></button>`);
    if (state.searchMode === "people") chips.push(`<button type="button" data-s14-clear-search-filter="type">People <span aria-hidden="true">×</span></button>`);
    if (state.searchLayer !== "all" && state.searchMode === "content") chips.push(`<button type="button" data-s14-clear-search-filter="layer">Layer: ${escapeHtml(searchLayerLabel(state.searchLayer))} <span aria-hidden="true">×</span></button>`);
    if (state.searchReflectionOnly && state.searchMode === "content") chips.push(`<button type="button" data-s14-clear-search-filter="reflection">Has reflection <span aria-hidden="true">×</span></button>`);
    elements.searchFilterContainer.innerHTML = chips.length ? `<span>Active filters</span>${chips.join("")}` : `<span>${state.searchMode === "people" ? "Ranking matching reader profiles" : "Searching public layers by idea"}</span>`;
  }

  function scoreReaders(tokens, filter) {
    return Object.keys(PROFILE_DATA)
      .filter((key) => key !== "nova")
      .map((key) => {
        const profile = PROFILE_DATA[key];
        const storyMeta = profile.topStories.map(getStoryDiscoveryMeta);
        const groups = {
          people: [profile.name, profile.label, profile.bio],
          themes: [...profile.sharedThemes, ...profile.tags, ...storyMeta.flatMap((meta) => meta.themes)],
          genres: storyMeta.flatMap((meta) => meta.genres),
          characters: storyMeta.flatMap((meta) => meta.characters),
          rankings: [profile.signature, ...profile.signatureItems, ...profile.categories.flatMap((category) => [category.title, ...category.items])],
          activity: profile.activity.flatMap((item) => [item.type, item.title, item.detail]),
        };
        const values = filter === "all" ? Object.values(groups).flat() : (groups[filter] || []);
        return { key, score: scoreValues(values, tokens), reason: searchReason(profile, filter, tokens) };
      })
      .sort((a, b) => b.score - a.score);
  }

  function scoreStories(tokens, filter) {
    const storyMap = new Map();
    ["kai", "mira", "ren"].forEach((key) => {
      const profile = PROFILE_DATA[key];
      profile.topStories.forEach((title, index) => {
        const story = getStoryByTitle(title);
        const item = storyMap.get(normalizeText(story.title)) || { story, profiles: new Set(), top: false, reflections: false, layers: 0 };
        item.profiles.add(key);
        item.top = item.top || index === 0;
        item.layers = Math.max(item.layers, (profile.library?.find((entry) => normalizeText(entry.title) === normalizeText(title))?.layers || []).length);
        storyMap.set(normalizeText(story.title), item);
      });
    });
    DISCOVERY_ARTIFACTS.forEach((artifact) => {
      const story = getStoryByTitle(artifact.story);
      const item = storyMap.get(normalizeText(story.title)) || { story, profiles: new Set(), top: false, reflections: false, layers: 0 };
      item.profiles.add(artifact.profile);
      item.reflections = item.reflections || artifact.type === "Reflection";
      storyMap.set(normalizeText(story.title), item);
    });

    return Array.from(storyMap.values())
      .filter((item) => filter === "all" || (filter === "top" && item.top) || (filter === "reflections" && item.reflections) || (filter === "layers" && item.layers >= 3))
      .map((item) => {
        const values = [item.story.title, item.story.creator, ...Array.from(item.profiles).flatMap((key) => PROFILE_DATA[key].tags)];
        return {
          story: item.story,
          profiles: item.profiles,
          score: scoreValues(values, tokens),
          context: `${item.profiles.size} public profile${item.profiles.size === 1 ? "" : "s"} · ${item.layers || 3} saved layers`,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  function scoreArtifact(artifact, tokens) {
    const profile = PROFILE_DATA[artifact.profile];
    const meta = getStoryDiscoveryMeta(artifact.story);
    return scoreValues([
      artifact.type,
      artifact.title,
      artifact.excerpt,
      artifact.reason,
      ...(artifact.tags || []),
      ...(artifact.genres || meta.genres),
      ...(artifact.themes || meta.themes),
      ...(artifact.characters || meta.characters),
      profile.name,
      profile.label,
      ...(profile.tags || []),
    ], tokens);
  }

  function scoreValues(values, tokens) {
    if (!tokens.length) return 1;
    const normalizedValues = values.filter(Boolean).map(normalizeText);
    let score = 0;
    tokens.forEach((token) => normalizedValues.forEach((value) => {
      if (value === token) score += 7;
      else if (value.startsWith(token)) score += 4;
      else if (value.includes(token)) score += 2;
    }));
    return score;
  }

  function setHubMode(mode, animate, source = "system") {
    setSocialView(mode, animate, source);
  }

  function enforceSocialPanelOwnership(view) {
    const incoming = elements.socialViews.find((panel) => panel.dataset.s11SocialView === view) || null;
    elements.socialViews.forEach((panel) => {
      const selected = panel === incoming;
      panel.classList.toggle("is-active", selected);
      panel.hidden = !selected;
      panel.setAttribute("aria-hidden", selected ? "false" : "true");
      panel.toggleAttribute("inert", !selected);
      panel.style.pointerEvents = selected ? "auto" : "none";
      panel.style.zIndex = selected ? "2" : "1";
      if (!selected) {
        panel.style.opacity = "0";
        panel.style.visibility = "hidden";
        panel.style.transform = "none";
      }
    });
    return incoming;
  }

  function setSocialView(view, animate, source = "system") {
    const normalized = SOCIAL_VIEW_ORDER.includes(view) ? view : "following";
    const previous = state.socialView;

    if (["following", "foryou", "search"].includes(previous) && !["following", "foryou", "search"].includes(normalized)) state.returnView = previous;
    if (["following", "foryou", "search"].includes(normalized)) state.returnView = normalized;

    if (normalized === "search") renderSearchResults(false);
    if (normalized === "profile") renderReaderProfile(state.selectedProfile);
    if (normalized === "library") renderReaderLibrary(state.selectedProfile);
    if (normalized === "story") renderStoryDetail(state.selectedStory || primaryStory.title);

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

    if (gsap) gsap.killTweensOf(elements.socialViews);
    elements.socialViews.forEach(blurFocusWithin);
    const incoming = enforceSocialPanelOwnership(normalized);

    if (incoming) {
      incoming.style.visibility = "visible";
      incoming.style.opacity = "1";
      if (gsap && animate) {
        gsap.fromTo(incoming,
          { autoAlpha: 0, x: direction * 18, y: 5, scale: 0.996 },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.38,
            ease: "power3.out",
            overwrite: true,
            onComplete: () => {
              gsap.set(incoming, { clearProps: "transform" });
              enforceSocialPanelOwnership(state.socialView);
            },
          },
        );
      } else {
        incoming.style.transform = "none";
      }
    }

    if (normalized === "foryou") syncForYouStage(false);
    updateSocialChrome(normalized);
    if (source === "user") announce(`${SOCIAL_VIEW_META[normalized].label} opened.`);
  }

  function updateSocialChrome(view) {
    const meta = SOCIAL_VIEW_META[view] || SOCIAL_VIEW_META.following;
    setText(elements.socialViewTitle, meta.label);
    setText(elements.socialProgress, meta.step);

    if (elements.socialProgressRoot) {
      elements.socialProgressRoot.setAttribute("aria-label", `Social journey step ${meta.segment} of 3`);
    }

    elements.socialProgressSegments.forEach((segment, index) => {
      segment.classList.toggle("is-complete", index + 1 < meta.segment);
      segment.classList.toggle("is-active", index + 1 === meta.segment);
    });

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
          <div class="s11-section-heading"><span><small>Saved layers</small><strong>Choose what to inspect</strong></span><span class="s11-count-pill">6 collections</span></div>
          <div class="s11-story-layer-tabs" role="tablist" aria-label="Saved story layer">
            <button type="button" role="tab" data-s11-story-layer="reflection" aria-selected="false">Reflection</button>
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
    const normalized = ["reflection", "quotes", "moments", "characters", "notes", "thoughts"].includes(layer) ? layer : "reflection";
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
    stories = buildStoryCatalog(loaded);
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

  function buildStoryCatalog(loaded) {
    const preferred = PREFERRED_STORY_TITLES
      .map((title) => findStoryByTitle(loaded, title) || findStoryByTitle(FALLBACK_STORIES, title))
      .filter(Boolean);
    return mergeUniqueStories(preferred, loaded, FALLBACK_STORIES).slice(0, 36);
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
      console.warn("Inkwell social V15: database stories unavailable.", error);
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


  function followingCardMarkup(item, index) {
    const profile = PROFILE_DATA[item.profile];
    const story = getStoryByTitle(item.story);
    const action = activityActionCopy(item, story);
    return `<article class="s13-following-card s14-following-card s18-following-card s19-following-card" data-s13-feed-tone="${escapeHtml(item.tone || "default")}">
      <button type="button" class="s13-following-card__button s18-following-card__button s19-following-card__button" data-s13-feed-open="${index}" aria-label="Open ${escapeHtml(item.type)} from ${escapeHtml(profile.name)}">
        <header class="s18-following-card__header s19-following-card__header">
          <span class="s11-avatar s11-avatar--small" style="${avatarStyle(item.profile)}">${escapeHtml(profile.initial)}</span>
          <span class="s13-following-card__identity"><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(item.type)}</small></span>
          <time>${escapeHtml(item.time || `${index + 1}h`)}</time>
        </header>
        <div class="s13-following-card__body s18-following-card__body s19-following-card__body">
          <span class="s13-following-card__copy s18-following-card__copy s19-following-card__copy">
            <small>${escapeHtml(action)}</small>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.detail)}</p>
          </span>
          <span class="s18-following-card__cover-shell s19-following-card__cover-shell">${storyCoverMarkup(story, "s13-following-card__cover")}</span>
        </div>
        <footer class="s18-following-card__footer s19-following-card__footer">
          <span class="s13-layer-chip">${escapeHtml(item.layer || "Update")}</span>
          <span class="s18-following-card__story">${escapeHtml(story.title)}</span>
          <span class="s18-following-card__category">${escapeHtml(profile.tags[0])}</span>
        </footer>
      </button>
    </article>`;
  }

  function activityActionCopy(item, story) {
    const map = {
      "Ranking updated": "Updated a public ranking",
      "Moment added": "Saved a moment from",
      "Reflection published": "Published a reflection on",
      "Quote saved": "Saved a quote from",
      "Character note": "Added a character note for",
      "Note edited": "Revised a public note on",
      "Thought added": "Connected a new thought to",
      "Library updated": "Changed progress and saved layers for",
      "Category created": "Created a new profile category",
    };
    return map[item.type] || `${item.type} · ${story.title}`;
  }

  function forYouPrimaryMarkup(artifact, story) {
    const type = normalizeText(artifact.type);
    const media = `
      <img class="s14-for-you-slide__image" data-s14-artifact-media="${escapeHtml(artifact.mediaKey || "")}" alt="Visual for ${escapeHtml(artifact.title)}" hidden>
      ${storyCoverMarkup(story, "s14-for-you-slide__fallback")}
    `;

    if (type === "moment") {
      return `<div class="s19-primary-layer s19-primary-layer--feature s19-primary-layer--moment">
        <div class="s19-feature-media">${media}</div>
        <div class="s19-feature-copy"><small>Saved moment</small><strong>One frame, then the idea around it</strong><p>${escapeHtml(artifact.excerpt)}</p><span>${escapeHtml(artifact.meta)}</span></div>
      </div>`;
    }
    if (type === "character") {
      return `<div class="s19-primary-layer s19-primary-layer--feature s19-primary-layer--character">
        <div class="s19-feature-media">${media}</div>
        <div class="s19-feature-copy"><small>Character focus</small><strong>${escapeHtml(artifact.subject || artifact.title)}</strong><p>${escapeHtml(artifact.excerpt)}</p><div class="s19-feature-tags">${artifact.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></div>
      </div>`;
    }
    if (type === "quote") {
      return `<div class="s19-primary-layer s19-primary-layer--text s19-primary-layer--quote">${media}<small>Saved quote context</small><blockquote>${escapeHtml(artifact.excerpt)}</blockquote><span>${escapeHtml(story.title)}</span></div>`;
    }
    if (type === "thought") {
      return `<div class="s19-primary-layer s19-primary-layer--text s19-primary-layer--thought">${media}<small>Connected thought</small><h5>${escapeHtml(artifact.title)}</h5><p>${escapeHtml(artifact.excerpt)}</p></div>`;
    }
    if (type === "ranking") {
      const items = (artifact.items || []).slice(0, 3);
      return `<div class="s19-primary-layer s19-primary-layer--ranking">${media}<div><small>Public ranking</small><h5>${escapeHtml(artifact.title)}</h5><ol>${items.map((item, index) => `<li><b>${String(index + 1).padStart(2, "0")}</b><span>${escapeHtml(item)}</span></li>`).join("")}</ol><p>${escapeHtml(artifact.excerpt)}</p></div></div>`;
    }
    return `<div class="s19-primary-layer s19-primary-layer--text"><p>${escapeHtml(artifact.excerpt)}</p></div>`;
  }

  function forYouArtifactMarkup(artifact, index) {
    const profile = PROFILE_DATA[artifact.profile];
    const story = getStoryByTitle(artifact.story);
    const type = normalizeText(artifact.type);
    return `<article class="s14-for-you-slide s17-for-you-slide s18-for-you-slide s19-for-you-slide" data-s14-for-you-index="${index}" data-s14-artifact-type="${escapeHtml(type)}" aria-label="${escapeHtml(artifact.type)} recommendation ${index + 1} of ${Math.min(5, DISCOVERY_ARTIFACTS.length)}">
      <div class="s14-for-you-slide__visual s17-for-you-slide__visual s18-for-you-canvas s19-for-you-canvas">
        ${forYouPrimaryMarkup(artifact, story)}
        <span class="s14-for-you-slide__type">${escapeHtml(artifact.type)}</span>
        <span class="s13-reason-chip s14-reason-chip s18-for-you-reason s19-for-you-reason"><b aria-hidden="true">↔</b>${escapeHtml(artifact.reason)}</span>
      </div>

      <div class="s18-for-you-dock s19-for-you-dock">
        <div class="s18-for-you-dock__copy s19-for-you-dock__copy">
          <span class="s13-artifact-kicker">${escapeHtml(artifact.type)} · ${escapeHtml(story.title)}</span>
          <h4>${escapeHtml(artifact.title)}</h4>
          <div class="s13-artifact-tags">${artifact.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        </div>

        <footer class="s14-for-you-slide__footer s17-for-you-footer s18-for-you-footer s19-for-you-footer">
          <button type="button" class="s14-author-card s16-author-card s17-author-card s18-author-card" data-s13-open-author="${escapeHtml(artifact.profile)}" aria-label="Open ${escapeHtml(profile.name)} profile">
            <span class="s11-avatar" style="${avatarStyle(artifact.profile)}">${escapeHtml(profile.initial)}</span>
            <span><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.label)}</small></span>
            <b aria-hidden="true">→</b>
          </button>
          <div class="s14-for-you-actions s17-for-you-actions s18-for-you-actions">
            <button type="button" class="s13-secondary-action" data-s11-open-story="${escapeHtml(story.title)}" data-s13-story-owner="${escapeHtml(artifact.profile)}" aria-label="View ${escapeHtml(story.title)}">View title</button>
            <button type="button" class="s13-primary-action" data-s18-open-reflection="${escapeHtml(story.title)}" data-s18-reflection-owner="${escapeHtml(artifact.profile)}">See reflection</button>
          </div>
        </footer>
      </div>
    </article>`;
  }

  function forYouPreviewMarkup() {
    return "";
  }

  function searchArtifactMarkup(artifact) {
    const profile = PROFILE_DATA[artifact.profile];
    const story = getStoryByTitle(artifact.story);
    const actionAttribute = Number.isInteger(artifact.feedIndex)
      ? `data-s13-feed-open="${artifact.feedIndex}"`
      : `data-s13-open-artifact="${escapeHtml(artifact.id)}"`;
    const resultType = escapeHtml(artifact.searchLayer || normalizeText(artifact.type));
    const displayType = artifact.type;
    return `<button type="button" class="s13-search-card s13-search-artifact s18-search-artifact s19-search-artifact" data-s16-search-result-type="${resultType}" ${actionAttribute} aria-label="Open ${escapeHtml(displayType)} ${escapeHtml(artifact.title)}">
      <span class="s18-search-artifact__cover s19-search-artifact__cover">${storyCoverMarkup(story, "s13-search-artifact__cover")}</span>
      <span class="s18-search-artifact__copy s19-search-artifact__copy">
        <small>${escapeHtml(displayType)} · ${escapeHtml(story.title)}</small>
        <strong>${escapeHtml(artifact.title)}</strong>
        <span class="s13-search-card__tags">${(artifact.tags || []).slice(0, 3).map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}</span>
      </span>
      <span class="s18-search-artifact__author s19-search-artifact__author">
        <span class="s11-avatar s11-avatar--small" style="${avatarStyle(artifact.profile)}">${escapeHtml(profile.initial)}</span>
        <span><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.label)}</small></span>
      </span>
    </button>`;
  }

  function searchResultMarkup(key, reason, score = 0) {
    const profile = PROFILE_DATA[key];
    const story = getStoryByTitle(profile.topStories[0]);
    const meta = getStoryDiscoveryMeta(story.title);
    const themes = Array.from(new Set([...(profile.sharedThemes || []), ...(profile.tags || []), ...(meta.genres || [])])).slice(0, 3);
    return `<button type="button" class="s13-search-card s13-search-reader s18-search-reader s19-search-reader" data-s16-search-result-type="reader" data-s11-profile-key="${escapeHtml(key)}" aria-pressed="${state.selectedProfile === key}">
      <header class="s19-search-reader__header"><span class="s11-avatar" style="${avatarStyle(key)}">${escapeHtml(profile.initial)}</span><span><small>${escapeHtml(profile.label)}</small><strong>${escapeHtml(profile.name)}</strong></span>${storyCoverMarkup(story, "s13-search-reader__cover")}</header>
      <p class="s19-search-reader__reason">${escapeHtml(reason)}</p>
      <div class="s19-search-reader__themes">${themes.map((theme) => `<span>${escapeHtml(theme)}</span>`).join("")}</div>
      <div class="s19-search-reader__stories"><span><small>Top story</small><strong>${escapeHtml(story.title)}</strong></span><span><small>Signature</small><strong>${escapeHtml(profile.signature)}</strong></span></div>
      <footer><span>${Math.max(68, Math.min(99, 72 + score * 3))}% idea match</span><strong>View profile →</strong></footer>
    </button>`;
  }

  function searchStoryMarkup(story, context) {
    const related = DISCOVERY_ARTIFACTS.filter((artifact) => normalizeText(artifact.story) === normalizeText(story.title));
    const types = Array.from(new Set(related.map((artifact) => artifact.type))).slice(0, 3);
    const owner = related[0]?.profile || ["kai", "mira", "ren"].find((key) => PROFILE_DATA[key].topStories.some((title) => normalizeText(title) === normalizeText(story.title))) || "kai";
    return `<button type="button" class="s13-search-card s13-search-story" data-s16-search-result-type="story" data-s11-open-story="${escapeHtml(story.title)}" data-s13-story-owner="${escapeHtml(owner)}" aria-label="Open ${escapeHtml(story.title)} story page">
      ${storyCoverMarkup(story, "s13-search-story__cover")}
      <span class="s13-search-story__copy"><small>${escapeHtml(story.creator || "Story")}</small><strong>${escapeHtml(story.title)}</strong><p>${escapeHtml(context || "Public reflections and saved layers")}</p><span>${types.length ? types.map((type) => `<em>${escapeHtml(type)}</em>`).join("") : "<em>Public story</em>"}</span></span>
    </button>`;
  }

  function inferSearchMode(value) {
    const normalized = normalizeText(value);
    if (!normalized) return "content";
    if (normalized.startsWith("@") || ["kai.reads", "mira.frames", "ren.afterwords"].some((name) => normalized.includes(normalizeText(name)))) return "people";
    return "content";
  }

  function openDiscoveryArtifact(id, animate, source = "user") {
    const artifact = DISCOVERY_ARTIFACTS.find((item) => item.id === id);
    if (!artifact) return;
    selectProfile(artifact.profile, false, source);
    state.selectedStory = artifact.story;
    renderStoryDetail(artifact.story);
    setSocialView("story", animate, source);
    requestAnimationFrame(() => setStoryLayer(layerToStoryLayer(artifact.layer), animate, source));
  }

  function openFollowingItem(index, animate) {
    const item = FEED_ITEMS[clamp(Math.round(index), 0, FEED_ITEMS.length - 1)];
    if (!item) return;
    selectProfile(item.profile, false, "user");
    if (["Ranking", "Category"].includes(item.layer)) {
      setSocialView("profile", animate, "user");
      return;
    }
    if (item.layer === "Library") {
      renderReaderLibrary(item.profile);
      setSocialView("library", animate, "user");
      return;
    }
    state.selectedStory = item.story;
    renderStoryDetail(item.story);
    setSocialView("story", animate, "user");
    requestAnimationFrame(() => setStoryLayer(layerToStoryLayer(item.layer), animate, "user"));
  }

  function layerToStoryLayer(layer) {
    const normalized = normalizeText(layer);
    return ({ reflection: "reflection", quote: "quotes", quotes: "quotes", moment: "moments", moments: "moments", character: "characters", characters: "characters", note: "notes", notes: "notes", thought: "thoughts", thoughts: "thoughts" })[normalized] || "reflection";
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


  function section5MediaCandidates(key) {
    const names = SECTION5_MEDIA[key] || [];
    return names.map((name) => `${SECTION5_MEDIA_ROOT}/${name}`);
  }

  function renderArtifactMedia(root) {
    qa("[data-s14-artifact-media]", root).forEach((image) => {
      const key = image.dataset.s14ArtifactMedia || "";
      const slide = image.closest("[data-s14-for-you-index]");
      const artifact = DISCOVERY_ARTIFACTS[Number(slide?.dataset.s14ForYouIndex || 0)];
      const story = getStoryByTitle(artifact?.story || "");
      const candidates = [...section5MediaCandidates(key), story?.coverUrl].filter(Boolean);
      setImageCandidates(image, candidates);
    });
  }

  function setImageCandidates(image, candidates) {
    if (!image) return;
    const queue = Array.from(new Set(candidates.filter(Boolean)));
    let cursor = 0;
    const next = () => {
      if (cursor >= queue.length) {
        image.hidden = true;
        image.removeAttribute("src");
        return;
      }
      image.hidden = false;
      image.src = queue[cursor++];
    };
    image.addEventListener("error", next, { passive: true });
    image.addEventListener("load", () => image.closest(".s14-for-you-slide")?.classList.add("has-local-media"), { once: true });
    next();
  }

  function setupForYouFeedInteractions(force = false) {
    const stage = elements.forYouResults;
    if (!stage || stage.dataset.s15Bound === "true") return;
    stage.dataset.s15Bound = "true";

    /* No nested wheel/scroll surface: the master homepage timeline owns wheel
       movement. Keyboard and dot controls change the selected stacked card. */
    stage.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "PageDown", "ArrowUp", "PageUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      let next = state.forYouArtifact;
      if (["ArrowDown", "PageDown"].includes(event.key)) next += 1;
      if (["ArrowUp", "PageUp"].includes(event.key)) next -= 1;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = Math.min(5, DISCOVERY_ARTIFACTS.length) - 1;
      userLocks.forYouArtifact = true;
      setForYouArtifact(next, true, "user");
    });
  }

  function syncForYouStage(animate) {
    const count = Math.min(5, DISCOVERY_ARTIFACTS.length);
    const index = clamp(state.forYouArtifact, 0, count - 1);
    const slides = qa("[data-s14-for-you-index]", elements.forYouResults);
    const dots = qa("[data-s14-for-you-dot]", elements.forYouResults);
    const direction = index >= lastForYouArtifact ? 1 : -1;

    if (gsap) gsap.killTweensOf(slides);

    slides.forEach((slide, slideIndex) => {
      const current = slideIndex === index;
      slide.classList.toggle("is-current", current);
      slide.hidden = !current;
      slide.setAttribute("aria-hidden", current ? "false" : "true");
      slide.toggleAttribute("inert", !current);
      slide.style.pointerEvents = current ? "auto" : "none";
      slide.style.zIndex = current ? "2" : "1";

      if (!current) {
        slide.style.opacity = "0";
        slide.style.visibility = "hidden";
        slide.style.transform = "none";
        return;
      }

      slide.style.visibility = "visible";
      slide.style.opacity = "1";
      if (gsap && animate) {
        gsap.fromTo(slide,
          { autoAlpha: 0, y: direction * 18, scale: 0.994 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            ease: "power3.out",
            overwrite: true,
            onComplete: () => gsap.set(slide, { clearProps: "transform" }),
          },
        );
      }
    });

    dots.forEach((dot, dotIndex) => {
      const current = dotIndex === index;
      dot.classList.toggle("is-current", current);
      dot.setAttribute("aria-current", current ? "true" : "false");
      dot.tabIndex = current ? 0 : -1;
    });

    const previous = q("[data-s17-for-you-prev]", elements.forYouResults);
    const next = q("[data-s17-for-you-next]", elements.forYouResults);
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === count - 1;

    setText(elements.forYouCount, `${index + 1} / ${count}`);
    lastForYouArtifact = index;
  }

  function searchModeLabel(mode) {
    return mode === "people" ? "People" : "Content";
  }

  function searchLayerLabel(layer) {
    return ({ all: "All layers", moment: "Moments", character: "Characters", quote: "Quotes", thought: "Thoughts", ranking: "Rankings", note: "Notes" })[layer] || "All layers";
  }

  function searchSortLabel(sort) {
    return ({ relevance: "best match", recent: "recently updated", saved: "most saved", reader: "reader match" })[sort] || "best match";
  }

  function searchEmptyMarkup() {
    return `<div class="s14-search-empty"><span aria-hidden="true">⌕</span><strong>No exact result yet</strong><p>Try another title or theme, clear a layer filter, or switch between Content and People.</p></div>`;
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
    if (!wanted) return null;
    const list = Array.from(items || []).filter(Boolean);
    const exact = list.find((story) => normalizeText(story.title) === wanted);
    if (exact) return exact;

    /* Fuzzy matching is only a final fallback. Requiring meaningful token
       overlap prevents a short database title from hijacking another story. */
    const wantedTokens = new Set(wanted.split(" ").filter((token) => token.length > 2));
    let best = null;
    let bestScore = 0;
    list.forEach((story) => {
      const candidate = normalizeText(story.title);
      const tokens = candidate.split(" ").filter((token) => token.length > 2);
      const overlap = tokens.filter((token) => wantedTokens.has(token)).length;
      const score = overlap * 10 - Math.abs(candidate.length - wanted.length) * 0.02;
      if (overlap >= Math.min(2, wantedTokens.size) && score > bestScore) {
        best = story;
        bestScore = score;
      }
    });
    return best;
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
    return searchModeLabel(filter);
  }

  function viewLabel(view) {
    return ({ following: "Following", foryou: "For You", search: "Search", profile: "profile", library: "library", story: "story" })[view] || "Social";
  }

  function avatarStyle(key) {
    const styles = {
      kai: "--avatar-a:#5270b8;--avatar-b:#745a90",
      mira: "--avatar-a:#6a5b99;--avatar-b:#914f7b",
      ren: "--avatar-a:#4f817b;--avatar-b:#4f638d",
      sol: "--avatar-a:#9a6b4f;--avatar-b:#7d5ea8",
      aya: "--avatar-a:#4f739a;--avatar-b:#6b5b96",
      theo: "--avatar-a:#4c8c8a;--avatar-b:#5570a6",
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
    state.searchQuery = "Identity";
    state.searchFilter = "all";
    state.searchMode = "content";
    state.searchLayer = "all";
    state.searchReflectionOnly = false;
    state.searchSort = "relevance";
    state.forYouArtifact = 0;
    lastForYouArtifact = 0;
    if (elements.searchInput) elements.searchInput.value = state.searchQuery;
    demoState.audience = "private";
    demoState.spoiler = false;
    demoState.socialView = "following";
    demoState.storyLayer = "quotes";
    demoState.forYouArtifact = 0;
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
        window.__INKWELL_SOCIAL_V19_STARTED__ = false;
        window.__INKWELL_SOCIAL_V16_STARTED__ = false;
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