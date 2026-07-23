(() => {
  "use strict";

  const SUPABASE_URL = "https://hsruxfpslxguhwnccwuj.supabase.co";

  const SUPABASE_KEY = "sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD";

  const TABLE_NAME = "manga";

  const BUCKET_NAME = "img";

  const COVER_FOLDER = "covers";

  const CHOSEN_STORY_ID = "";

  const CHOSEN_STORY_ALIASES = ["Attack on Titan", "Shingeki no Kyojin"];

  const PIN_DISTANCE = 4300;

  const MANAGED_BY_HOME_JOURNEY =
    window.__INKWELL_MASTER_JOURNEY__ === true;

  let managedJourneyPublished = false;
  let resolveManagedJourneyReady = null;

  const managedJourneyReady = new Promise((resolve) => {
    resolveManagedJourneyReady = resolve;
  });

  window.InkwellSection4Journey = {
    ready: managedJourneyReady
  };

  let supabaseClient = null;

  const READERS = {
    kai: {
      side: "left",
      name: "kai.reads",
      bio: "remembers the feeling before the theory",
      initial: "K",
      avatarUrl: "",
      score: "9/10",
      status: "Completed",
      quoteHeading: "3 quotes — the characters’ inner world",
      ratingReason:
        "Kai gives it 9/10 because the emotional decisions remain powerful and memorable. The characters feel vulnerable even during the largest moments. Some middle sections feel crowded, but the consequences keep the story grounded.",

      quotes: [
        {
          theme: "Goodness and perspective",
          author: "Kenny",
          paragraphs: [
            "A good person? Well… I don’t really like that term. Because to me, it just seems to mean someone who’s good for you. And I don’t think there’s any one person who’s good for everyone. If someone’s good for you, then they’re a good person, but if you’re not helping them, then to them, you’re a bad person. If you won't help me, then to me, you're a bad person. You just have to be able to accept that.",
          ],
        },

        {
          theme: "Beauty and cruelty",
          author: "Levi",
          paragraphs: [
            "Believe in yourself... or believe in me and them... the Survey Corps. I don't know the answer. I never have. Whether you trust in your own strength... or trust in the choices made by reliable comrades. No one knows what the outcome will be. So as much as you can, choose whatever you'll regret the least.",
          ],
        },

        {
          theme: "Doubt",
          author: "Eren",
          paragraphs: [
            "If we kill all our enemies over there… will we finally be free?",
          ],
        },
      ],

      moments: [
        {
          id: "kai-moment-1",
          title: "The world beyond the walls",
          label: "Spoiler moment",
          description:
            "Kai saves this moment for the feeling of possibility it creates before the story complicates that hope.",
          imageUrl: "images/kai-moment-1.jpg",
          orientation: "landscape",
          isSpoiler: true,
        },

        {
          id: "kai-moment-2",
          title: "A choice under pressure",
          label: "Spoiler moment",
          description:
            "The scene stays with Kai because courage and uncertainty exist in the same decision.",
          imageUrl: "images/kai-moment-2.jpg",
          orientation: "landscape",
          isSpoiler: true,
        },

        {
          id: "kai-moment-3",
          title: "Carrying the consequence",
          label: "Spoiler moment",
          description:
            "Kai remembers the quiet expression after the action more than the spectacle surrounding it.",
          imageUrl: "images/kai-moment-3.jpg",
          orientation: "portrait",
          isSpoiler: true,
        },

        {
          id: "kai-moment-4",
          title: "What remains after the choice",
          label: "Spoiler moment",
          description:
            "This final saved moment focuses on the emotional cost that remains after the immediate conflict has ended.",
          imageUrl: "images/kai-moment-4.jpg",
          orientation: "portrait",
          isSpoiler: true,
        },
      ],

      characters: [
        {
          rank: 1,
          name: "Eren",
          imageUrl: "",
          reason:
            "His pursuit of freedom keeps changing as the world becomes larger, making every confident answer more difficult.",
          hasActorView: true,

          actorEssay: [
            "The performance behind Eren has to preserve several versions of the character at once: the impulsive child, the determined soldier, and the increasingly guarded person who understands more than he says.",

            "What makes the portrayal effective is the control of contrast. Loud conviction matters, but the quieter pauses, shortened answers, and emotional distance reveal how much pressure has accumulated beneath the surface.",

            "The actor view is therefore less about one dramatic speech and more about continuity. The later restraint feels connected to the earlier intensity, so the character’s changes remain unsettling without feeling disconnected from who he was.",
          ],
        },

        {
          rank: 2,
          name: "Reiner",
          imageUrl: "",
          reason:
            "His divided identity makes duty, guilt, friendship, and survival feel impossible to separate.",
          hasActorView: true,

          actorEssay: [
            "Reiner’s performance depends on contradiction. He can sound dependable in one scene and emotionally absent in the next, while both states still feel like parts of the same exhausted person.",

            "Small changes in posture and rhythm carry much of the work. Confidence can become hesitation within a line, and a familiar expression can suddenly feel like a mask that is no longer holding together.",

            "The actor view highlights how the character’s guilt is not treated as a single breakdown. It appears through repetition, avoidance, forced composure, and moments when the role he is playing briefly collapses.",
          ],
        },

        {
          rank: 3,
          name: "Gabi",
          imageUrl: "",
          reason:
            "Her certainty is challenged by direct experience, allowing inherited beliefs to become personal questions.",
          hasActorView: false,
          actorEssay: [],
        },
      ],

      notes: [
        "Freedom changes meaning whenever fear, duty, or love begins making the choice for someone.",

        "The quiet reactions after a major event often reveal more than the event itself.",

        "Kai notices how characters borrow courage from one another, even when they disagree.",

        "The story is strongest when enormous conflict is grounded in one person deciding what they can live with.",
      ],

      thoughts: {
        title:
          "Freedom, Knowledge, and the Value of Life in Attack on Titan",

        preview: `Attack on Titan begins as a story about humanity attempting to escape physical imprisonment. The people inside the Walls believe freedom exists somewhere beyond them, while the Titans appear to be the monsters preventing humanity from reaching it. As the story develops, however, the conflict becomes much more complicated. The Walls are not humanity’s only prison, and the Titans are not entirely separate from the people they consume. The series gradually reveals that people can also be imprisoned by history, fear, inherited hatred, political systems, memories, relationships, desires, and even their own ideas of freedom. Through the Titans, Grisha’s basement, Levi’s understanding of choice, Kenny’s theory of desire, Eren’s future memories, Armin and Zeke’s conversation about life, the infant raised above the crowd during the Rumbling, Ymir’s enslavement, and Mikasa’s final decision, the story asks whether freedom is something that can be conquered externally or something that must first be recognized internally. The tragedy of Eren Yeager is not simply that he fails to become free. It is that he spends his entire life pursuing freedom while becoming increasingly enslaved by his own narrow image of it.`,

        templateId: "kai-thoughts-template",
      },
    },

    nova: {
      side: "right",
      name: "nova.pages",
      bio: "tracks themes, systems, and shifting truth",
      initial: "N",
      avatarUrl: "",
      score: "10/10",
      status: "Completed",
      quoteHeading: "3 quotes — the series’ larger message",
      ratingReason:
        "Nova gives it 10/10 because perspective continually changes the meaning of earlier events. History, identity, duty, and responsibility remain connected throughout the story. New information changes how earlier decisions must be judged.",

      quotes: [
        {
          theme: "Desire",
          author: "Armin",

          paragraphs: [
            "Everybody I met was all the same. Drinking, women, worshiping God, even family... The king, dreams, children, power...",

            "Everyone had to be drunk on somethin' to keep pushing on.",

            "Everyone was a slave to somethin'. Even him...",
          ],
        },

        {
          theme: "Inherited violence",
          author: "Mr. Braus",

          paragraphs: [
            "At the very least, we need to keep the children out of this forest. Otherwise, the exact same things will just keep happening. It's up to us adults to shoulder the sins of the past.",
          ],
        },

        {
          theme: "Truth and belief",
          author: "Kruger",

          paragraphs: [
            "The only truth in this world is that there is no truth. That is our reality. Anyone can become a god or a devil. All it takes is for people to believe it.",
          ],
        },
      ],

      moments: [
        {
          id: "nova-moment-1",
          title: "A truth changes the map",
          label: "Spoiler moment",
          description:
            "Nova saves this moment because one discovery reorganizes the meaning of everything that came before it.",
          imageUrl: "images/nova-moment-1.jpg",
          orientation: "landscape",
          isSpoiler: true,
        },

        {
          id: "nova-moment-2",
          title: "History becomes personal",
          label: "Spoiler moment",
          description:
            "The scene connects public history to a private decision, showing how systems enter individual lives.",
          imageUrl: "images/nova-moment-2.jpg",
          orientation: "landscape",
          isSpoiler: true,
        },

        {
          id: "nova-moment-3",
          title: "The cost of a larger plan",
          label: "Spoiler moment",
          description:
            "Nova keeps this moment as an example of strategy becoming inseparable from responsibility.",
          imageUrl: "images/nova-moment-3.jpg",
          orientation: "landscape",
          isSpoiler: true,
        },

        {
          id: "nova-moment-4",
          title: "A person behind the label",
          label: "Spoiler moment",
          description:
            "The portrait reminds Nova that political categories become weaker when an individual life is seen clearly.",
          imageUrl: "images/nova-moment-4.jpg",
          orientation: "portrait",
          isSpoiler: true,
        },
      ],

      characters: [
        {
          rank: 1,
          name: "Armin",
          imageUrl: "",
          reason:
            "His imagination remains practical: he looks for another path while understanding the cost of every available choice.",
          hasActorView: true,

          actorEssay: [
            "Armin’s performance balances sensitivity with intellectual urgency. The voice can begin carefully, almost as if the character is testing whether he deserves to speak, and then sharpen once an idea becomes clear.",

            "That progression matters because his confidence is never presented as a complete replacement for fear. The actor keeps uncertainty audible even during decisive moments, which makes the courage feel chosen rather than automatic.",

            "The actor view also reveals how empathy shapes the delivery. Armin often sounds as though he is imagining several people’s reactions at once, allowing strategic dialogue to retain an emotional center.",
          ],
        },

        {
          rank: 2,
          name: "Zeke",
          imageUrl: "",
          reason:
            "His calm explanations make ideology sound reasonable until the human cost of that reasoning becomes impossible to ignore.",
          hasActorView: true,

          actorEssay: [
            "Zeke’s performance gains power from understatement. Instead of presenting every belief as a declaration, the actor often uses a conversational calm that makes extreme conclusions sound rehearsed and ordinary.",

            "The controlled delivery also leaves room for flashes of resentment, disappointment, and longing. Those changes suggest that the ideology is not detached philosophy; it is a structure built around deeply personal wounds.",

            "From an actor-view perspective, the most important choice is restraint. The character becomes more unsettling when the performance trusts a pause or a softened sentence instead of announcing every contradiction.",
          ],
        },

        {
          rank: 3,
          name: "Erwin",
          imageUrl: "",
          reason:
            "His leadership makes public duty and private obsession difficult to separate, even when both point toward the same goal.",
          hasActorView: false,
          actorEssay: [],
        },
      ],

      notes: [],

      thoughts: {
        title:
          "Indoctrination, Dehumanization, Freedom, and the Cycle of Violence in Attack on Titan",

        preview: `At the heart of Attack on Titan is an anti-war idea: no entire race, nation, or group can simply be called the true enemy. War continues because people inherit hatred from conflicts they did not create, while indoctrination and propaganda teach them which history to believe, whom to fear, and which violence is necessary. Once these beliefs begin to feel like truth and common sense, dehumanization turns people into devils, traitors, weapons, or obstacles, making their suffering easier to ignore and atrocities easier to justify or even enjoy from a safe distance. Fear then opens the way to authoritarianism and fascism, where people seek one leader, one answer, and one enemy, while loyalty replaces independent judgment. Yet the series refuses to say that violence is simply human nature or that the cycle can never change. It argues that enemies remain human, victims can become perpetrators, and the cycle weakens only when people speak, truly see one another, and refuse to pass hatred to the next generation. Most importantly, it turns these contradictions back on the viewer, asking whose suffering we recognize, whose violence we excuse, and when we stop seeing another person as human.`,

        templateId: "nova-thoughts-template",
      },
    },
  };

  const FALLBACK_STORY = {
    id: "",

    title: "Attack on Titan",

    creator: "Hajime Isayama",

    type: ["Manga", "Anime"],
  };

  function publishManagedJourney(result) {
    if (
      !MANAGED_BY_HOME_JOURNEY ||
      managedJourneyPublished
    ) {
      return;
    }

    managedJourneyPublished = true;

    const api = {
      ready: managedJourneyReady,
      ...result
    };

    window.InkwellSection4Journey = api;
    resolveManagedJourneyReady?.(api);

    window.dispatchEvent(
      new CustomEvent("inkwell:section4-ready", {
        detail: api
      })
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSection4, {
      once: true,
    });
  } else {
    startSection4();
  }

  async function startSection4() {
    const section = document.querySelector("[data-section-cover-rain]");

    if (!section || section.dataset.section4Ready === "true") {
      return;
    }

    section.dataset.section4Ready = "true";

    const elements = collectElements(section);

    setupReaderExperience(elements);

    setupDetailDialog(elements);

    if (!window.supabase?.createClient) {
      console.warn(
        "Section 4: Supabase is not loaded. Showing the static fallback.",
      );

      renderStory(section, FALLBACK_STORY);

      showStaticLayout(section, elements);

      setStatus(
        elements,
        "Supabase is missing. Showing the static fallback.",
      );

      publishManagedJourney({
        section,
        elements,
        timeline: null,
        cleanup: () => {},
        refresh: () => {},
        showStatic: () => showStaticLayout(section, elements),
      });

      return;
    }

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY,
    );

    try {
      setStatus(elements, "Loading anime and manga covers.");

      const storyPool = await loadAnimeMangaPool();

      const chosenStory = await findChosenStory(storyPool);

      renderStory(section, chosenStory);

      renderRain(elements, storyPool, chosenStory);

      setStatus(
        elements,
        `${chosenStory.title} loaded as the shared story.`,
      );

      requestAnimationFrame(() => {
        setupMotion(section, elements);
      });
    } catch (error) {
      console.error("Section 4 failed:", error);

      renderStory(section, FALLBACK_STORY);

      showDatabaseError(
        elements,
        "Story covers could not be loaded.",
      );

      showStaticLayout(section, elements);

      publishManagedJourney({
        section,
        elements,
        timeline: null,
        cleanup: () => {},
        refresh: () => {},
        showStatic: () => showStaticLayout(section, elements),
      });
    }
  }

  function collectElements(section) {
    return {
      section,

      stage: section.querySelector("[data-s4-stage]"),

      cinematicCopy:
        section.querySelector("[data-cinematic-copy]"),

      rainLeft: section.querySelector("[data-rain-left]"),

      rainRight: section.querySelector("[data-rain-right]"),

      selectionCopy:
        section.querySelector("[data-selection-copy]"),

      sharedCardWrap:
        section.querySelector("[data-shared-card-wrap]"),

      sharedCard: section.querySelector("[data-shared-card]"),

      cardCover: section.querySelector("[data-card-cover]"),

      cardLayers: section.querySelector("[data-card-layers]"),

      contentIntro: section.querySelector("[data-content-intro]"),

      compareStage: section.querySelector("[data-compare-stage]"),

      compareBoth: section.querySelector("[data-compare-both]"),

      profileButtons: [
        ...section.querySelectorAll("[data-focus-reader]"),
      ],

      layerButtons: [
        ...section.querySelectorAll("[data-layer]"),
      ],

      readerContents: [
        ...section.querySelectorAll("[data-reader-content]"),
      ],

      score: section.querySelector("[data-reader-score]"),

      scoreText:
        section.querySelector("[data-reader-score] span"),

      readerStatus:
        section.querySelector("[data-reader-status]"),

      handoff: section.querySelector("[data-cover-handoff]"),

      handoffImage:
        section.querySelector("[data-handoff-image]"),

      handoffFallback:
        section.querySelector("[data-handoff-fallback]"),

      dialog: section.querySelector("[data-detail-dialog]"),

      dialogClose:
        section.querySelector("[data-detail-close]"),

      dialogEyebrow:
        section.querySelector("[data-detail-eyebrow]"),

      dialogTitle:
        section.querySelector("[data-detail-title]"),

      dialogBody:
        section.querySelector("[data-detail-body]"),

      empty:
        section.querySelector("[data-section-4-empty]"),

      status:
        section.querySelector("[data-section-4-status]"),
    };
  }

  async function loadAnimeMangaPool() {
    const result = await supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .limit(500);

    if (result.error) {
      throw result.error;
    }

    return dedupeStories(
      normalizeStoryRows(result.data || []),
    );
  }

  function normalizeStoryRows(rows) {
    return (rows || [])
      .filter((item) => {
        return item && item.id != null && item.title;
      })
      .map(normalizeStory)
      .filter((story) => {
        const typeText = story.type
          .join(" ")
          .toLowerCase();

        return (
          typeText.includes("anime") ||
          typeText.includes("manga")
        );
      });
  }

  async function findChosenStory(storyPool) {
    if (CHOSEN_STORY_ID) {
      const idMatch = storyPool.find((story) => {
        return (
          String(story.id) ===
          String(CHOSEN_STORY_ID)
        );
      });

      if (idMatch) {
        return idMatch;
      }
    }

    const aliasKeys =
      CHOSEN_STORY_ALIASES.map(normalizeText);

    const poolMatch = storyPool.find((story) => {
      return aliasKeys.includes(
        normalizeText(story.title),
      );
    });

    if (poolMatch) {
      return poolMatch;
    }

    for (const alias of CHOSEN_STORY_ALIASES) {
      const result = await supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .ilike("title", `%${alias}%`)
        .limit(10);

      if (!result.error && result.data?.length) {
        const normalized =
          result.data.map(normalizeStory);

        return (
          normalized.find((story) => {
            return (
              normalizeText(story.title) ===
              normalizeText(alias)
            );
          }) || normalized[0]
        );
      }
    }

    return {
      ...FALLBACK_STORY,
    };
  }

  function normalizeStory(item) {
    return {
      id: String(item.id ?? ""),

      title: String(
        item.title || "Untitled story",
      ),

      creator: String(
        item.creator ??
          item.author ??
          item.writer ??
          item.artist ??
          "",
      ),

      type: getTypeList(item.type),
    };
  }

  function getTypeList(value) {
    if (Array.isArray(value)) {
      return value.map(String).filter(Boolean);
    }

    if (!value) {
      return ["Manga"];
    }

    const text = String(value).trim();

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch (_) {
      // Plain text is valid.
    }

    return text
      .split(/[,/|]+/)
      .map((part) => {
        return part.trim();
      })
      .filter(Boolean);
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

  function renderStory(section, story) {
    section
      .querySelectorAll("[data-story-title]")
      .forEach((node) => {
        node.textContent = story.title;
      });

    section
      .querySelectorAll("[data-story-creator]")
      .forEach((node) => {
        node.textContent =
          story.creator || "Unknown creator";
      });

    section
      .querySelectorAll("[data-story-format]")
      .forEach((node) => {
        node.textContent = formatType(story.type);
      });

    section
      .querySelectorAll("[data-story-cover]")
      .forEach((image) => {
        const shell = image.closest(
          "[data-cover-shell]",
        );

        const fallback = shell?.querySelector(
          "[data-cover-fallback]",
        );

        if (!fallback) {
          return;
        }

        fallback.textContent = story.title;

        loadCover(
          image,
          fallback,
          story,
          `${story.title} cover`,
        );
      });
  }

  function renderRain(
    elements,
    storyPool,
    chosenStory,
  ) {
    if (!elements.rainLeft || !elements.rainRight) {
      return;
    }

    elements.rainLeft.innerHTML = "";

    elements.rainRight.innerHTML = "";

    const ordinaryPool = dedupeStories(
      storyPool.filter((story) => {
        return !isChosenStoryTitle(story.title);
      }),
    );

    const shuffled = seededShuffle(
      ordinaryPool,
      hashString(
        `${chosenStory.title}-section-four-rain`,
      ),
    );

    const leftCount = Math.ceil(
      shuffled.length / 2,
    );

    const leftOrdinary = shuffled.slice(
      0,
      leftCount,
    );

    const rightOrdinary =
      shuffled.slice(leftCount);

    const leftStories = insertChosenStory(
      leftOrdinary,
      chosenStory,
      Math.max(
        1,
        Math.floor(
          (leftOrdinary.length + 1) * 0.44,
        ),
      ),
    );

    const rightStories = insertChosenStory(
      rightOrdinary,
      chosenStory,
      Math.max(
        1,
        Math.floor(
          (rightOrdinary.length + 1) * 0.56,
        ),
      ),
    );

    leftStories.forEach((story, index) => {
      elements.rainLeft.appendChild(
        createRainItem(
          story,
          "left",
          index,
          isChosenStoryTitle(story.title),
        ),
      );
    });

    rightStories.forEach((story, index) => {
      elements.rainRight.appendChild(
        createRainItem(
          story,
          "right",
          index,
          isChosenStoryTitle(story.title),
        ),
      );
    });
  }

  function insertChosenStory(
    stories,
    chosenStory,
    requestedIndex,
  ) {
    const result = [...stories];

    const safeIndex = Math.min(
      Math.max(requestedIndex, 0),
      result.length,
    );

    result.splice(
      safeIndex,
      0,
      chosenStory,
    );

    return result;
  }

  function isChosenStoryTitle(title) {
    const key = normalizeText(title);

    return CHOSEN_STORY_ALIASES.some(
      (alias) => {
        return normalizeText(alias) === key;
      },
    );
  }

  function dedupeStories(stories) {
    const seen = new Set();

    return (stories || []).filter((story) => {
      const key = normalizeText(story?.title);

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }

  function seededShuffle(stories, seed) {
    const copy = [...stories];

    let state = seed || 1;

    const random = () => {
      state =
        (state * 1664525 + 1013904223) >>> 0;

      return state / 4294967296;
    };

    for (
      let index = copy.length - 1;
      index > 0;
      index -= 1
    ) {
      const swapIndex = Math.floor(
        random() * (index + 1),
      );

      [copy[index], copy[swapIndex]] = [
        copy[swapIndex],
        copy[index],
      ];
    }

    return copy;
  }

  function hashString(value) {
    let hash = 2166136261;

    for (const character of String(value || "")) {
      hash ^= character.charCodeAt(0);

      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function createRainItem(
    story,
    side,
    itemIndex,
    isChosen,
  ) {
    const figure =
      document.createElement("figure");

    const image = document.createElement("img");

    const fallback =
      document.createElement("span");

    const leftPositions = [
      8,
      28,
      46,
      17,
      38,
      24,
      52,
      12,
      34,
      43,
      20,
      49,
    ];

    const rightPositions = [
      48,
      29,
      9,
      40,
      18,
      51,
      33,
      13,
      44,
      23,
      37,
      7,
    ];

    const widths = [
      92,
      100,
      96,
      104,
      90,
      98,
      106,
      94,
      102,
      97,
      108,
      93,
    ];

    const positions =
      side === "left"
        ? leftPositions
        : rightPositions;

    figure.className = isChosen
      ? "s4-rain-item is-chosen-story"
      : "s4-rain-item";

    figure.dataset.coverShell = "";

    figure.dataset.rainSide = side;

    figure.dataset.rainIndex =
      String(itemIndex);

    if (isChosen) {
      figure.dataset.chosenRainCover = side;
    }

    figure.style.left =
      `${positions[itemIndex % positions.length]}%`;

    figure.style.setProperty(
      "--s4-rain-width",
      `${widths[itemIndex % widths.length]}px`,
    );

    figure.style.zIndex = String(
      2 + (itemIndex % 5),
    );

    image.alt = "";

    image.loading = "eager";

    image.decoding = "async";

    fallback.className = "s4-cover-fallback";

    fallback.dataset.coverFallback = "";

    fallback.textContent = story.title;

    figure.append(image, fallback);

    loadCover(image, fallback, story, "");

    return figure;
  }

  function loadCover(
    image,
    fallback,
    story,
    alt,
  ) {
    const url = getCoverUrlFromId(story.id);

    image.hidden = true;

    image.alt = alt;

    fallback.hidden = false;

    if (!url) {
      image.removeAttribute("src");

      return;
    }

    image.onload = () => {
      image.hidden = false;

      fallback.hidden = true;
    };

    image.onerror = () => {
      image.hidden = true;

      fallback.hidden = false;

      image.removeAttribute("src");
    };

    image.src = url;
  }

  function formatType(list) {
    const clean = [
      ...new Set(
        (list || [])
          .map((item) => {
            return String(item).trim();
          })
          .filter(Boolean)
          .map((item) => {
            return (
              item.charAt(0).toUpperCase() +
              item.slice(1).toLowerCase()
            );
          }),
      ),
    ];

    return clean.length
      ? clean.join(" / ")
      : "Manga / Anime";
  }

  function setupReaderExperience(elements) {
    let activeLayer = "quotes";

    let focusMode = "both";

    const revealedMoments = new Set();

    const currentMomentIndexes = {
      kai: 0,
      nova: 0,
    };

    const allowedLayers = [
      "quotes",
      "moments",
      "characters",
      "notes",
      "thoughts",
    ];

    fillProfileCards(elements.section);

    const renderBothSides = () => {
      elements.readerContents.forEach(
        (container) => {
          const readerId =
            container.dataset.readerContent;

          const reader = READERS[readerId];

          if (!reader) {
            return;
          }

          const renderers = {
            quotes: () =>
              renderQuotes(container, reader),

            moments: () =>
              renderMoments(
                container,
                readerId,
                reader,
                revealedMoments,
                currentMomentIndexes[readerId] || 0,
              ),

            characters: () =>
              renderCharacters(
                container,
                readerId,
                reader,
              ),

            notes: () =>
              renderNotes(container, reader),

            thoughts: () =>
              renderThoughts(
                container,
                readerId,
                reader,
              ),
          };

          renderers[activeLayer]?.();

          animateContent(container);
        },
      );
    };

    const renderMomentReader = (readerId) => {
      const container =
        elements.readerContents.find(
          (item) =>
            item.dataset.readerContent === readerId,
        );

      const reader = READERS[readerId];

      if (
        !container ||
        !reader ||
        activeLayer !== "moments"
      ) {
        return;
      }

      renderMoments(
        container,
        readerId,
        reader,
        revealedMoments,
        currentMomentIndexes[readerId] || 0,
      );

      animateContent(container);
    };

    const setLayer = (layer) => {
      if (!allowedLayers.includes(layer)) {
        return;
      }

      activeLayer = layer;

      elements.layerButtons.forEach((button) => {
        const selected =
          button.dataset.layer === layer;

        button.classList.toggle(
          "is-active",
          selected,
        );

        button.setAttribute(
          "aria-pressed",
          String(selected),
        );
      });

      renderBothSides();
    };

    const setFocus = (mode) => {
      if (
        !["both", "left", "right"].includes(mode)
      ) {
        return;
      }

      focusMode = mode;

      elements.compareStage.dataset.focus =
        focusMode;

      elements.profileButtons.forEach(
        (button) => {
          const selected =
            button.dataset.focusReader ===
            focusMode;

          button.setAttribute(
            "aria-pressed",
            String(selected),
          );
        },
      );

      elements.compareBoth?.setAttribute(
        "aria-pressed",
        String(focusMode === "both"),
      );

      if (focusMode === "left") {
        updateScoreDisplay(
          elements,
          READERS.kai.score,
          `Kai rated this story ${READERS.kai.score}. ${READERS.kai.ratingReason}`,
          READERS.kai.ratingReason,
        );

        elements.readerStatus.textContent =
          READERS.kai.status;
      } else if (focusMode === "right") {
        updateScoreDisplay(
          elements,
          READERS.nova.score,
          `Nova rated this story ${READERS.nova.score}. ${READERS.nova.ratingReason}`,
          READERS.nova.ratingReason,
        );

        elements.readerStatus.textContent =
          READERS.nova.status;
      } else {
        const combinedScore =
          getCombinedScore();

        const combinedReason =
          `Average of Kai's ${READERS.kai.score} and Nova's ${READERS.nova.score}. ` +
          "Focus either profile to see the reason behind that reader’s score.";

        updateScoreDisplay(
          elements,
          combinedScore,
          `Average reader rating ${combinedScore}. Kai rated it ${READERS.kai.score} and Nova rated it ${READERS.nova.score}.`,
          combinedReason,
        );

        elements.readerStatus.textContent =
          "Both completed";
      }
    };

    elements.layerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setLayer(button.dataset.layer);
      });
    });

    elements.profileButtons.forEach(
      (button) => {
        button.addEventListener("click", () => {
          const requested =
            button.dataset.focusReader;

          setFocus(
            focusMode === requested
              ? "both"
              : requested,
          );
        });
      },
    );

    elements.compareBoth?.addEventListener(
      "click",
      () => {
        setFocus("both");
      },
    );

    elements.section.addEventListener(
      "click",
      (event) => {
        const revealButton =
          event.target.closest(
            "[data-reveal-moment]",
          );

        if (
          revealButton &&
          elements.section.contains(revealButton)
        ) {
          revealMoment(
            revealButton,
            revealedMoments,
          );

          return;
        }

        const navigationButton =
          event.target.closest(
            "[data-moment-nav]",
          );

        if (
          navigationButton &&
          elements.section.contains(
            navigationButton,
          )
        ) {
          const readerId =
            navigationButton.dataset.readerId;

          const reader = READERS[readerId];

          if (!reader?.moments?.length) {
            return;
          }

          const direction =
            navigationButton.dataset
              .momentNav === "previous"
              ? -1
              : 1;

          const total = reader.moments.length;

          const current =
            currentMomentIndexes[readerId] || 0;

          currentMomentIndexes[readerId] =
            (current + direction + total) %
            total;

          renderMomentReader(readerId);

          return;
        }

        const positionButton =
          event.target.closest(
            "[data-moment-position]",
          );

        if (
          positionButton &&
          elements.section.contains(
            positionButton,
          )
        ) {
          const readerId =
            positionButton.dataset.readerId;

          const reader = READERS[readerId];

          const requestedIndex = Number(
            positionButton.dataset
              .momentPosition,
          );

          if (
            !reader?.moments?.length ||
            !Number.isInteger(requestedIndex) ||
            requestedIndex < 0 ||
            requestedIndex >=
              reader.moments.length
          ) {
            return;
          }

          currentMomentIndexes[readerId] =
            requestedIndex;

          renderMomentReader(readerId);
        }
      },
    );

    setLayer(activeLayer);

    setFocus(focusMode);
  }

  function updateScoreDisplay(
    elements,
    visibleScore,
    ariaLabel,
    tooltip,
  ) {
    if (elements.scoreText) {
      elements.scoreText.textContent =
        visibleScore;
    }

    if (elements.score) {
      elements.score.setAttribute(
        "aria-label",
        ariaLabel,
      );

      elements.score.dataset.scoreTooltip =
        tooltip;
    }
  }

  function getCombinedScore() {
    const values = [
      READERS.kai.score,
      READERS.nova.score,
    ]
      .map(Number.parseFloat)
      .filter(Number.isFinite);

    if (!values.length) {
      return "9.5/10";
    }

    const average =
      values.reduce((sum, value) => {
        return sum + value;
      }, 0) / values.length;

    return `${average.toFixed(1)}/10`;
  }

  function fillProfileCards(section) {
    Object.entries(READERS).forEach(
      ([readerId, reader]) => {
        section
          .querySelectorAll(
            `[data-profile-name="${readerId}"]`,
          )
          .forEach((node) => {
            node.textContent = reader.name;
          });

        section
          .querySelectorAll(
            `[data-profile-bio="${readerId}"]`,
          )
          .forEach((node) => {
            node.textContent = reader.bio;
          });

        section
          .querySelectorAll(
            `[data-avatar-fallback="${readerId}"]`,
          )
          .forEach((node) => {
            node.textContent = reader.initial;
          });

        const image = section.querySelector(
          `[data-avatar-image="${readerId}"]`,
        );

        if (!image) {
          return;
        }

        const fallbackPortrait =
          createPortraitPlaceholder(
            reader.name,
            reader.side,
          );

        image.src =
          reader.avatarUrl ||
          fallbackPortrait;

        image.alt =
          `${reader.name} profile picture`;

        image.hidden = false;

        image.onerror = () => {
          if (image.src !== fallbackPortrait) {
            image.src = fallbackPortrait;
          } else {
            image.hidden = true;
          }
        };
      },
    );
  }

  function getQuoteFitClass(quote) {
    const completeText = Array.isArray(
      quote?.paragraphs,
    )
      ? quote.paragraphs.join(" ")
      : "";

    const wordCount = completeText
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (wordCount > 75) {
      return "quote-fit--very-long";
    }

    if (wordCount > 50) {
      return "quote-fit--long";
    }

    if (wordCount > 28) {
      return "quote-fit--medium";
    }

    return "quote-fit--short";
  }

  function renderQuotes(container, reader) {
    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · quote collection
        </span>

        <h4>
          ${escapeHtml(reader.quoteHeading)}
        </h4>
      </header>

      <div class="s4-quote-grid">
        ${reader.quotes
          .map((quote, index) => {
            const fitClass =
              getQuoteFitClass(quote);

            const quoteParagraphs =
              quote.paragraphs
                .map(
                  (
                    paragraph,
                    paragraphIndex,
                  ) => {
                    const openingMark =
                      paragraphIndex === 0
                        ? "“"
                        : "";

                    const closingMark =
                      paragraphIndex ===
                      quote.paragraphs.length - 1
                        ? "”"
                        : "";

                    return `
                      <p>
                        ${openingMark}${escapeHtml(paragraph)}${closingMark}
                      </p>
                    `;
                  },
                )
                .join("");

            return `
              <article
                class="
                  s4-evidence-card
                  s4-quote-card
                  ${fitClass}
                  ${index === 0 ? "is-featured" : ""}
                "
              >
                <span class="s4-card-theme">
                  ${escapeHtml(quote.theme)}
                </span>

                <blockquote>
                  ${quoteParagraphs}
                </blockquote>

                <cite>
                  — ${escapeHtml(quote.author)}
                </cite>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderMoments(
    container,
    readerId,
    reader,
    revealedMoments,
    requestedIndex = 0,
  ) {
    const totalMoments =
      reader.moments.length;

    const activeIndex = Math.min(
      Math.max(
        Number(requestedIndex) || 0,
        0,
      ),
      Math.max(totalMoments - 1, 0),
    );

    const moment =
      reader.moments[activeIndex];

    if (!moment) {
      container.innerHTML = "";

      return;
    }

    const momentKey =
      `${readerId}:${moment.id}`;

    const isRevealed =
      !moment.isSpoiler ||
      revealedMoments.has(momentKey);

    const fallbackImage =
      createMomentPlaceholder(
        moment.title,
        reader.side,
        moment.orientation,
      );

    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · saved moments
        </span>

        <h4>
          ${totalMoments} moments — use the arrows to view one at a time
        </h4>
      </header>
      
      <div
        class="s4-moment-carousel is-${escapeHtml(moment.orientation)}"
        data-moment-carousel
        data-reader-id="${escapeHtml(readerId)}"
      >
        <div class="s4-moment-stage">
          <article
            class="
              s4-evidence-card
              s4-moment-card
              is-${escapeHtml(moment.orientation)}
              ${moment.isSpoiler ? "is-spoiler" : ""}
              ${isRevealed ? "is-revealed" : ""}
            "
            data-moment-card
            data-moment-key="${escapeHtml(momentKey)}"
          >
            <div
              class="s4-moment-content"
              data-moment-content
              aria-hidden="${String(!isRevealed)}"
            >
              <figure class="s4-moment-media">
                <img
                  src="${escapeHtml(moment.imageUrl)}"
                  data-moment-image
                  data-fallback-src="${escapeHtml(fallbackImage)}"
                  alt="${escapeHtml(moment.title)}"
                  loading="lazy"
                  decoding="async"
                >
              </figure>

              <div class="s4-moment-copy">
                <div class="s4-moment-meta">
                  <span class="s4-card-theme">
                    ${escapeHtml(moment.label)}
                  </span>

                  <span class="s4-moment-orientation">
                    ${
                      moment.orientation ===
                      "portrait"
                        ? "Vertical image"
                        : "Horizontal image"
                    }
                  </span>
                </div>

                <h5>
                  ${escapeHtml(moment.title)}
                </h5>

                <p>
                  ${escapeHtml(moment.description)}
                </p>
              </div>
            </div>

            ${
              moment.isSpoiler && !isRevealed
                ? `
                <div class="s4-spoiler-cover">
                  <span class="s4-spoiler-label">
                    This content contains spoilers.
                  </span>

                  <button
                    class="s4-spoiler-button"
                    type="button"
                    data-reveal-moment
                    aria-label="Reveal spoiler moment: ${escapeHtml(moment.title)}"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                      ></path>

                      <circle
                        cx="12"
                        cy="12"
                        r="2.75"
                      ></circle>
                    </svg>

                    <span>
                      Reveal moment
                    </span>
                  </button>
                </div>
              `
                : ""
            }
          </article>
        </div>

        <nav
          class="s4-moment-controls"
          aria-label="${escapeHtml(reader.name)} moment controls"
        >
          <button
            class="s4-moment-nav"
            type="button"
            data-moment-nav="previous"
            data-reader-id="${escapeHtml(readerId)}"
            aria-label="Show the previous moment for ${escapeHtml(reader.name)}"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="m14.5 5-7 7 7 7"
              ></path>
            </svg>
          </button>

          <div class="s4-moment-progress">
            <span
              class="s4-moment-counter"
              aria-live="polite"
            >
              ${activeIndex + 1} / ${totalMoments}
            </span>

            <div
              class="s4-moment-dots"
              role="group"
              aria-label="Choose a saved moment"
            >
              ${reader.moments
                .map(
                  (item, index) => `
                  <button
                    class="s4-moment-dot ${
                      index === activeIndex
                        ? "is-active"
                        : ""
                    }"
                    type="button"
                    data-moment-position="${index}"
                    data-reader-id="${escapeHtml(readerId)}"
                    aria-label="Show moment ${index + 1} of ${totalMoments}: ${escapeHtml(item.title)}"
                    aria-current="${
                      index === activeIndex
                        ? "true"
                        : "false"
                    }"
                  >
                    <span class="s4-visually-hidden">
                      Moment ${index + 1}
                    </span>
                  </button>
                `,
                )
                .join("")}
            </div>
          </div>

          <button
            class="s4-moment-nav"
            type="button"
            data-moment-nav="next"
            data-reader-id="${escapeHtml(readerId)}"
            aria-label="Show the next moment for ${escapeHtml(reader.name)}"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="m9.5 5 7 7-7 7"
              ></path>
            </svg>
          </button>
        </nav>
      </div>
    `;

    setupImageFallbacks(
      container,
      "[data-moment-image]",
    );
  }

  function revealMoment(
    revealButton,
    revealedMoments,
  ) {
    const card = revealButton.closest(
      "[data-moment-card]",
    );

    if (!card) {
      return;
    }

    const momentKey =
      card.dataset.momentKey;

    if (momentKey) {
      revealedMoments.add(momentKey);
    }

    card.classList.add("is-revealed");

    card
      .querySelector("[data-moment-content]")
      ?.setAttribute(
        "aria-hidden",
        "false",
      );

    const spoilerCover =
      card.querySelector(
        ".s4-spoiler-cover",
      );

    if (spoilerCover) {
      spoilerCover.hidden = true;
    }
  }

  function renderCharacters(
    container,
    readerId,
    reader,
  ) {
    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · character shelf
        </span>

        <h4>
          ${reader.characters.length}
          characters — and what this reader sees in them
        </h4>
      </header>

      <div class="s4-character-grid">
        ${reader.characters
          .map((character, index) => {
            const fallbackImage =
              createPortraitPlaceholder(
                character.name,
                reader.side,
              );

            const imageUrl =
              character.imageUrl ||
              fallbackImage;

            const actorAction =
              character.hasActorView
                ? `
                <div class="s4-card-actions">
                  <button
                    class="s4-detail-button"
                    type="button"
                    data-open-detail
                    data-detail-type="actor"
                    data-reader-id="${escapeHtml(readerId)}"
                    data-item-index="${index}"
                  >
                    View Actor
                  </button>
                </div>
              `
                : "";

            return `
              <article
                class="
                  s4-evidence-card
                  s4-character-card
                  ${index === 0 ? "is-featured" : ""}
                "
              >
                <figure class="s4-character-portrait">
                  <img
                    src="${escapeHtml(imageUrl)}"
                    data-character-image
                    data-fallback-src="${escapeHtml(fallbackImage)}"
                    alt="Portrait for ${escapeHtml(character.name)}"
                    loading="lazy"
                    decoding="async"
                  >

                  <span class="s4-character-rank-badge">
                    #${String(character.rank).padStart(2, "0")}
                  </span>
                </figure>

                <div class="s4-character-copy">
                  <span class="s4-character-rank">
                    Reader pick
                  </span>

                  <h5>
                    ${escapeHtml(character.name)}
                  </h5>

                  <p>
                    ${escapeHtml(character.reason)}
                  </p>

                  ${actorAction}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;

    setupImageFallbacks(
      container,
      "[data-character-image]",
    );
  }

  function renderNotes(container, reader) {
    const notes = Array.isArray(reader.notes)
      ? reader.notes
      : [];

    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · written notes
        </span>

        <h4>
          ${
            notes.length
              ? `${notes.length} saved ${
                  notes.length === 1
                    ? "note"
                    : "notes"
                }`
              : "No saved notes yet"
          }
        </h4>
      </header>

      ${
        notes.length
          ? `
          <div class="s4-note-grid">
            ${notes
              .map(
                (note, index) => `
                <article
                  class="s4-evidence-card s4-note-card"
                >
                  <span class="s4-note-number">
                    ${String(index + 1).padStart(2, "0")}
                  </span>

                  <h5>
                    Note ${index + 1}
                  </h5>

                  <p>
                    ${escapeHtml(note)}
                  </p>
                </article>
              `,
              )
              .join("")}
          </div>
        `
          : `
          <div
            class="s4-note-empty"
            role="status"
          >
            <span
              class="s4-note-empty-mark"
              aria-hidden="true"
            >
              ✦
            </span>

            <h5>
              No notes here yet
            </h5>

            <p>
              This person has no written notes yet.
            </p>
          </div>
        `
      }
    `;
  }

  function renderThoughts(
    container,
    readerId,
    reader,
  ) {
    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · reflection
        </span>

        <h4>
          One complete reading of the shared story
        </h4>
      </header>

      <article
        class="s4-evidence-card s4-thought-card"
      >
        <span class="s4-card-theme">
          Full reflection
        </span>

        <h4>
          ${escapeHtml(reader.thoughts.title)}
        </h4>

        <div class="s4-thought-copy">
          <p>
            ${escapeHtml(reader.thoughts.preview)}
          </p>
        </div>

        <div class="s4-card-actions">
          <button
            class="s4-detail-button"
            type="button"
            data-open-detail
            data-detail-type="thought"
            data-reader-id="${escapeHtml(readerId)}"
            data-item-index="0"
          >
            Read reflection
          </button>
        </div>
      </article>
    `;
  }

  function setupImageFallbacks(
    container,
    selector,
  ) {
    container
      .querySelectorAll(selector)
      .forEach((image) => {
        image.addEventListener(
          "error",
          () => {
            const fallbackSrc =
              image.dataset.fallbackSrc;

            if (
              fallbackSrc &&
              image.src !== fallbackSrc
            ) {
              image.src = fallbackSrc;
            }
          },
          {
            once: true,
          },
        );
      });
  }

  function setupDetailDialog(elements) {
    const {
      section,
      dialog,
      dialogClose,
    } = elements;

    if (!dialog || !dialogClose) {
      return;
    }

    let returnFocus = null;

    section.addEventListener(
      "click",
      (event) => {
        const opener = event.target.closest(
          "[data-open-detail]",
        );

        if (
          !opener ||
          !section.contains(opener)
        ) {
          return;
        }

        event.preventDefault();

        returnFocus = opener;

        openDetailFromTrigger(
          elements,
          opener,
        );

        requestAnimationFrame(() => {
          dialogClose.focus({
            preventScroll: true,
          });
        });
      },
    );

    dialogClose.addEventListener(
      "click",
      () => {
        closeModal(dialog);
      },
    );

    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) {
          closeModal(dialog);
        }
      },
    );

    dialog.addEventListener(
      "cancel",
      (event) => {
        event.preventDefault();

        closeModal(dialog);
      },
    );

    dialog.addEventListener(
      "close",
      () => {
        unlockPageScroll();

        if (returnFocus?.isConnected) {
          returnFocus.focus({
            preventScroll: true,
          });
        }
      },
    );
  }

  function openDetailFromTrigger(
    elements,
    opener,
  ) {
    const type =
      opener.dataset.detailType;

    const readerId =
      opener.dataset.readerId;

    const index = Number(
      opener.dataset.itemIndex || 0,
    );

    const reader = READERS[readerId];

    if (!reader) {
      return;
    }

    if (type === "actor") {
      openActorViewModal(
        elements,
        reader,
        index,
      );
    } else if (type === "thought") {
      openReflectionModal(elements, reader);
    }
  }

  function openActorViewModal(
    elements,
    reader,
    index,
  ) {
    const character =
      reader.characters[index];

    if (!character?.hasActorView) {
      return;
    }

    const fallbackImage =
      createPortraitPlaceholder(
        character.name,
        reader.side,
      );

    const imageUrl =
      character.imageUrl ||
      fallbackImage;

    const essayParagraphs = Array.isArray(
      character.actorEssay,
    )
      ? character.actorEssay
      : [];

    const content = `
      <div class="s4-detail-character">
        <figure>
          <img
            src="${escapeHtml(imageUrl)}"
            alt="Portrait for ${escapeHtml(character.name)}"
          >
        </figure>

        <div class="s4-detail-character-copy">
          <h4>
            ${escapeHtml(character.name)}
          </h4>

          ${essayParagraphs
            .map(
              (paragraph) => `
                <p>
                  ${escapeHtml(paragraph)}
                </p>
              `,
            )
            .join("")}
        </div>
      </div>
    `;

    openModal(elements, {
      eyebrow:
        `${reader.name} · actor view · reader pick #${String(character.rank).padStart(2, "0")}`,

      title:
        `${character.name}: Actor View`,

      content,
    });
  }

  function openReflectionModal(
    elements,
    reader,
  ) {
    const templateId =
      reader.thoughts.templateId;

    const template =
      document.getElementById(templateId);

    if (!template) {
      console.error(
        `Reflection template not found: ${templateId}`,
      );

      return;
    }

    openModal(elements, {
      eyebrow:
        `${reader.name} · full reflection`,

      title:
        reader.thoughts.title,

      content:
        template.innerHTML,
    });
  }

  function openModal(
    elements,
    {
      eyebrow,
      title,
      content,
    },
  ) {
    elements.dialogEyebrow.textContent =
      eyebrow;

    elements.dialogTitle.textContent =
      title;

    elements.dialogBody.innerHTML =
      content;

    const detailScroll =
      elements.dialog.querySelector(
        ".s4-detail-scroll",
      );

    if (detailScroll) {
      detailScroll.scrollTop = 0;
    }

    lockPageScroll();

    if (
      typeof elements.dialog.showModal ===
      "function"
    ) {
      if (!elements.dialog.open) {
        elements.dialog.showModal();
      }
    } else {
      elements.dialog.setAttribute(
        "open",
        "",
      );
    }
  }

  function closeModal(dialog) {
    unlockPageScroll();

    if (
      typeof dialog.close === "function" &&
      dialog.open
    ) {
      dialog.close();

      return;
    }

    dialog.removeAttribute("open");
  }

  function lockPageScroll() {
    document.documentElement.classList.add(
      "s4-modal-open",
    );

    document.body?.classList.add(
      "s4-modal-open",
    );
  }

  function unlockPageScroll() {
    document.documentElement.classList.remove(
      "s4-modal-open",
    );

    document.body?.classList.remove(
      "s4-modal-open",
    );
  }

  function createPortraitPlaceholder(
    name,
    side,
  ) {
    const initials = String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => {
        return part
          .charAt(0)
          .toUpperCase();
      })
      .join("");

    const colours =
      side === "right"
        ? [
            "#67c9e8",
            "#596fd7",
            "#11172d",
          ]
        : [
            "#9b7cff",
            "#6578df",
            "#11172d",
          ];

    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 320"
      >
        <defs>
          <linearGradient
            id="g"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0"
              stop-color="${colours[0]}"
            />

            <stop
              offset="0.55"
              stop-color="${colours[1]}"
            />

            <stop
              offset="1"
              stop-color="${colours[2]}"
            />
          </linearGradient>

          <radialGradient
            id="r"
            cx="35%"
            cy="20%"
            r="70%"
          >
            <stop
              offset="0"
              stop-color="#ffffff"
              stop-opacity="0.36"
            />

            <stop
              offset="1"
              stop-color="#ffffff"
              stop-opacity="0"
            />
          </radialGradient>
        </defs>

        <rect
          width="240"
          height="320"
          rx="28"
          fill="url(#g)"
        />

        <rect
          width="240"
          height="320"
          rx="28"
          fill="url(#r)"
        />

        <circle
          cx="120"
          cy="114"
          r="54"
          fill="#ffffff"
          fill-opacity="0.12"
        />

        <path
          d="M34 320c10-79 53-119 86-119s76 40 86 119"
          fill="#050817"
          fill-opacity="0.55"
        />

        <text
          x="120"
          y="132"
          text-anchor="middle"
          font-family="Georgia,serif"
          font-size="54"
          font-weight="700"
          fill="#ffffff"
        >
          ${escapeHtml(initials)}
        </text>
      </svg>
    `;

    return (
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(svg)
    );
  }

  function createMomentPlaceholder(
    title,
    side,
    orientation,
  ) {
    const isPortrait =
      orientation === "portrait";

    const width = isPortrait
      ? 720
      : 1200;

    const height = isPortrait
      ? 960
      : 675;

    const colours =
      side === "right"
        ? [
            "#67c9e8",
            "#596fd7",
            "#11172d",
          ]
        : [
            "#9b7cff",
            "#6578df",
            "#11172d",
          ];

    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${width} ${height}"
      >
        <defs>
          <linearGradient
            id="g"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0"
              stop-color="${colours[0]}"
            />

            <stop
              offset="0.55"
              stop-color="${colours[1]}"
            />

            <stop
              offset="1"
              stop-color="${colours[2]}"
            />
          </linearGradient>

          <radialGradient
            id="r"
            cx="30%"
            cy="18%"
            r="75%"
          >
            <stop
              offset="0"
              stop-color="#ffffff"
              stop-opacity="0.28"
            />

            <stop
              offset="1"
              stop-color="#ffffff"
              stop-opacity="0"
            />
          </radialGradient>
        </defs>

        <rect
          width="${width}"
          height="${height}"
          fill="url(#g)"
        />

        <rect
          width="${width}"
          height="${height}"
          fill="url(#r)"
        />

        <path
          d="M0 ${height * 0.72} Q ${width * 0.26} ${height * 0.5}, ${width * 0.52} ${height * 0.74} T ${width} ${height * 0.64} V ${height} H0Z"
          fill="#050817"
          fill-opacity="0.42"
        />

        <text
          x="50%"
          y="48%"
          text-anchor="middle"
          font-family="Georgia,serif"
          font-size="${isPortrait ? 42 : 54}"
          font-weight="700"
          fill="#ffffff"
        >
          ${escapeHtml(title)}
        </text>

        <text
          x="50%"
          y="56%"
          text-anchor="middle"
          font-family="Arial,sans-serif"
          font-size="${isPortrait ? 22 : 26}"
          fill="#ffffff"
          fill-opacity="0.72"
        >
          Add project image
        </text>
      </svg>
    `;

    return (
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(svg)
    );
  }

  function animateContent(container) {
    if (
      prefersReducedMotion() ||
      typeof container.animate !== "function"
    ) {
      return;
    }

    container.animate(
      [
        {
          opacity: 0.25,

          transform: "translateY(8px)",
        },

        {
          opacity: 1,

          transform: "translateY(0)",
        },
      ],
      {
        duration: 260,

        easing:
          "cubic-bezier(.22,1,.36,1)",
      },
    );
  }

  function setupMotion(
    section,
    elements,
  ) {
    if (
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      console.warn(
        "Section 4: GSAP or ScrollTrigger is missing.",
      );

      showStaticLayout(section, elements);

      publishManagedJourney({
        section,
        elements,
        timeline: null,
        cleanup: () => {},
        refresh: () => {},
        showStatic: () => showStaticLayout(section, elements),
      });

      return;
    }

    const {
      gsap,
      ScrollTrigger,
    } = window;

    gsap.registerPlugin(ScrollTrigger);

    if (MANAGED_BY_HOME_JOURNEY) {
      const canAnimate = window.matchMedia(
        "(min-width: 1100px) and (min-height: 820px) and " +
        "(prefers-reduced-motion: no-preference)"
      ).matches;

      if (!canAnimate) {
        showStaticLayout(section, elements);

        publishManagedJourney({
          section,
          elements,
          timeline: null,
          cleanup: () => {},
          refresh: () => {},
          showStatic: () => showStaticLayout(section, elements),
        });

        return;
      }

      section.classList.remove("is-static");

      const managedController =
        createPinnedTimeline(
          section,
          elements,
          gsap,
          { managed: true },
        );

      publishManagedJourney({
        section,
        elements,
        ...managedController,
        showStatic: () => showStaticLayout(section, elements),
      });

      return;
    }

    gsap.matchMedia().add(
      {
        animated:
          "(min-width: 1100px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)",

        static:
          "(max-width: 1099px), (max-height: 759px), (prefers-reduced-motion: reduce)",
      },

      (context) => {
        if (context.conditions.static) {
          showStaticLayout(
            section,
            elements,
          );

          return;
        }

        section.classList.remove(
          "is-static",
        );

        return createPinnedTimeline(
          section,
          elements,
          gsap,
        );
      },
    );
  }

  function createPinnedTimeline(
    section,
    elements,
    gsap,
    options = {},
  ) {
    const managed =
      options.managed === true;

    const leftItems =
      gsap.utils.toArray(
        '[data-rain-side="left"]',
        elements.stage,
      );

    const rightItems =
      gsap.utils.toArray(
        '[data-rain-side="right"]',
        elements.stage,
      );

    const chosenLeft =
      elements.stage.querySelector(
        '[data-chosen-rain-cover="left"]',
      );

    const chosenRight =
      elements.stage.querySelector(
        '[data-chosen-rain-cover="right"]',
      );

    if (
      !chosenLeft ||
      !chosenRight ||
      !elements.sharedCardWrap ||
      !elements.cardCover ||
      !elements.handoff ||
      !elements.compareStage
    ) {
      showStaticLayout(section, elements);

      return undefined;
    }

    syncHandoffCover(
      chosenLeft,
      elements,
    );

    const regularLeft =
      leftItems.filter((item) => {
        return item !== chosenLeft;
      });

    const regularRight =
      rightItems.filter((item) => {
        return item !== chosenRight;
      });

    const viewportHeight = () => {
      return elements.stage.clientHeight;
    };

    const maximumCount = Math.max(
      leftItems.length,
      rightItems.length,
      1,
    );

    const rainStart = 0.08;

    const rainEnd = 2.65;

    const travelDuration = 1.2;

    const staggerSpace =
      rainEnd -
      rainStart -
      travelDuration;

    const stagger =
      maximumCount > 1
        ? Math.max(
            0.006,
            Math.min(
              0.15,
              staggerSpace /
                (maximumCount - 1),
            ),
          )
        : 0;

    const chosenArrival = 2.72;

    const centreTime = 3.02;

    const cardRevealTime = 3.72;

    const handoffEndTime = 4.48;

    const cardDockTime = 4.62;

    const comparisonTime = 5.02;

    const DOCK_TOP = 74;

    const DOCK_SCALE = 0.78;

    const updateFinalLayoutMetrics = () => {
      const cardHeight =
        elements.sharedCard
          .getBoundingClientRect()
          .height;

      const introHeight = Math.max(
        elements.contentIntro
          .getBoundingClientRect()
          .height,
        28,
      );

      const cardVisualBottom =
        DOCK_TOP +
        cardHeight * DOCK_SCALE;

      const introTop = Math.ceil(
        cardVisualBottom + 9,
      );

      const compareTop = Math.ceil(
        introTop +
          introHeight +
          7,
      );

      elements.stage.style.setProperty(
        "--s4-intro-top",
        `${introTop}px`,
      );

      elements.stage.style.setProperty(
        "--s4-compare-top",
        `${compareTop}px`,
      );
    };

    updateFinalLayoutMetrics();

    gsap.set(
      [
        ...leftItems,
        ...rightItems,
      ],
      {
        autoAlpha: 0,
      },
    );

    gsap.set(elements.selectionCopy, {
      autoAlpha: 0,

      y: 12,
    });

    gsap.set(elements.sharedCardWrap, {
      autoAlpha: 0,

      left: "50%",

      top: "50%",

      xPercent: -50,

      yPercent: -50,

      scale: 1.03,

      pointerEvents: "none",
    });

    gsap.set(elements.cardCover, {
      autoAlpha: 0,
    });

    gsap.set(elements.handoff, {
      autoAlpha: 0,

      x: 0,

      y: 0,

      width: 100,

      height: 150,

      rotation: 0,
    });

    gsap.set(elements.cardLayers, {
      autoAlpha: 0,

      height: 0,

      marginTop: 0,

      paddingTop: 0,

      overflow: "hidden",
    });

    gsap.set(elements.contentIntro, {
      autoAlpha: 0,

      y: 10,
    });

    gsap.set(elements.compareStage, {
      autoAlpha: 0,

      y: 20,

      pointerEvents: "none",
    });

    gsap.set(elements.profileButtons, {
      autoAlpha: 0,

      y: 12,
    });

    gsap.set(elements.readerContents, {
      autoAlpha: 0,

      y: 16,
    });

    const timelineOptions = {
      defaults: {
        ease: "none",
      },
    };

    if (managed) {
      timelineOptions.paused = true;
    } else {
      timelineOptions.scrollTrigger = {
        trigger: elements.stage,

        start: "top top",

        end: `+=${PIN_DISTANCE}`,

        pin: true,

        pinSpacing: true,

        scrub: 1,

        anticipatePin: 1,

        invalidateOnRefresh: true,

        onRefreshInit:
          updateFinalLayoutMetrics,
      };
    }

    const timeline =
      gsap.timeline(timelineOptions);

    const getStartTime = (item) => {
      const index = Number(
        item.dataset.rainIndex || 0,
      );

      return rainStart + index * stagger;
    };

    regularLeft.forEach(
      (item, index) => {
        const startTime =
          getStartTime(item);

        const rotation =
          -8 +
          (index % 5) * 3.4;

        timeline.fromTo(
          item,

          {
            y: () => {
              return (
                -item.offsetHeight -
                85 -
                (index % 4) * 30
              );
            },

            rotation,

            scale:
              0.9 +
              (index % 3) * 0.045,

            autoAlpha: 0,
          },

          {
            y: () => {
              return (
                viewportHeight() +
                item.offsetHeight +
                95 +
                (index % 4) * 30
              );
            },

            rotation:
              rotation * -0.5,

            autoAlpha: 1,

            duration:
              travelDuration,
          },

          startTime,
        );

        timeline.to(
          item,

          {
            autoAlpha: 0,

            duration: 0.1,
          },

          startTime +
            travelDuration -
            0.08,
        );
      },
    );

    regularRight.forEach(
      (item, index) => {
        const startTime =
          getStartTime(item);

        const rotation =
          8 -
          (index % 5) * 3.4;

        timeline.fromTo(
          item,

          {
            y: () => {
              return (
                viewportHeight() +
                item.offsetHeight +
                85 +
                (index % 4) * 30
              );
            },

            rotation,

            scale:
              0.9 +
              (index % 3) * 0.045,

            autoAlpha: 0,
          },

          {
            y: () => {
              return (
                -item.offsetHeight -
                95 -
                (index % 4) * 30
              );
            },

            rotation:
              rotation * -0.5,

            autoAlpha: 1,

            duration:
              travelDuration,
          },

          startTime,
        );

        timeline.to(
          item,

          {
            autoAlpha: 0,

            duration: 0.1,
          },

          startTime +
            travelDuration -
            0.08,
        );
      },
    );

    const chosenLeftStart =
      getStartTime(chosenLeft);

    const chosenRightStart =
      getStartTime(chosenRight);

    timeline.fromTo(
      chosenLeft,

      {
        y: () => {
          return (
            -chosenLeft.offsetHeight -
            110
          );
        },

        rotation: -7,

        scale: 0.92,

        autoAlpha: 0,
      },

      {
        y: () => {
          return (
            viewportHeight() * 0.46 -
            chosenLeft.offsetHeight / 2
          );
        },

        rotation: -3,

        scale: 1,

        autoAlpha: 1,

        duration: Math.max(
          0.55,
          chosenArrival -
            chosenLeftStart,
        ),
      },

      chosenLeftStart,
    );

    timeline.fromTo(
      chosenRight,

      {
        y: () => {
          return (
            viewportHeight() +
            chosenRight.offsetHeight +
            110
          );
        },

        rotation: 7,

        scale: 0.92,

        autoAlpha: 0,
      },

      {
        y: () => {
          return (
            viewportHeight() * 0.54 -
            chosenRight.offsetHeight / 2
          );
        },

        rotation: 3,

        scale: 1,

        autoAlpha: 1,

        duration: Math.max(
          0.55,
          chosenArrival -
            chosenRightStart,
        ),
      },

      chosenRightStart,
    );

    timeline.to(
      elements.cinematicCopy,

      {
        autoAlpha: 0,

        y: -42,

        duration: 0.38,
      },

      1.58,
    );

    timeline.to(
      [
        ...regularLeft,
        ...regularRight,
      ],

      {
        autoAlpha: 0.08,

        duration: 0.28,
      },

      chosenArrival - 0.12,
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight,
      ],

      {
        scale: 1.13,

        borderColor:
          "rgba(225,229,255,.84)",

        boxShadow:
          "0 38px 90px rgba(0,0,0,.62), " +
          "0 0 72px rgba(155,124,255,.44), " +
          "0 0 0 2px rgba(255,255,255,.12)",

        duration: 0.22,

        ease: "power2.out",
      },

      chosenArrival,
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight,
      ],

      {
        x: (_index, item) => {
          return getCenterTarget(
            item,
            elements.stage,
          ).x;
        },

        y: (_index, item) => {
          return getCenterTarget(
            item,
            elements.stage,
          ).y;
        },

        rotation: 0,

        scale: 1.25,

        duration: 0.68,

        ease: "power2.inOut",
      },

      centreTime,
    );

    timeline.to(
      elements.selectionCopy,

      {
        autoAlpha: 1,

        y: 0,

        duration: 0.22,
      },

      centreTime + 0.3,
    );

    timeline.set(
      elements.sharedCardWrap,

      {
        autoAlpha: 1,

        scale: 1.03,
      },

      cardRevealTime,
    );

    timeline.set(
      elements.handoff,

      {
        autoAlpha: 1,

        x: () => {
          return getRelativeRect(
            chosenLeft,
            elements.stage,
          ).left;
        },

        y: () => {
          return getRelativeRect(
            chosenLeft,
            elements.stage,
          ).top;
        },

        width: () => {
          return getRelativeRect(
            chosenLeft,
            elements.stage,
          ).width;
        },

        height: () => {
          return getRelativeRect(
            chosenLeft,
            elements.stage,
          ).height;
        },

        borderRadius: "14px",

        rotation: 0,
      },

      cardRevealTime,
    );

    timeline.to(
      chosenRight,

      {
        autoAlpha: 0,

        scale: 0.72,

        duration: 0.24,

        ease: "power2.in",
      },

      cardRevealTime - 0.12,
    );

    timeline.to(
      chosenLeft,

      {
        autoAlpha: 0,

        duration: 0.08,
      },

      cardRevealTime + 0.03,
    );

    timeline.to(
      elements.selectionCopy,

      {
        autoAlpha: 0,

        y: -8,

        duration: 0.16,
      },

      cardRevealTime - 0.05,
    );

    timeline.to(
      elements.handoff,

      {
        x: () => {
          return getRelativeRect(
            elements.cardCover,
            elements.stage,
          ).left;
        },

        y: () => {
          return getRelativeRect(
            elements.cardCover,
            elements.stage,
          ).top;
        },

        width: () => {
          return getRelativeRect(
            elements.cardCover,
            elements.stage,
          ).width;
        },

        height: () => {
          return getRelativeRect(
            elements.cardCover,
            elements.stage,
          ).height;
        },

        borderRadius: "13px",

        rotation: -1.2,

        duration:
          handoffEndTime -
          cardRevealTime,

        ease: "back.out(1.75)",
      },

      cardRevealTime,
    );

    timeline.to(
      elements.handoff,

      {
        rotation: 0,

        duration: 0.14,

        ease: "power2.out",
      },

      handoffEndTime - 0.14,
    );

    timeline.to(
      elements.cardCover,

      {
        autoAlpha: 1,

        duration: 0.08,
      },

      handoffEndTime - 0.07,
    );

    timeline.to(
      elements.handoff,

      {
        autoAlpha: 0,

        duration: 0.08,
      },

      handoffEndTime - 0.04,
    );

    timeline.to(
      elements.sharedCardWrap,

      {
        top: `${DOCK_TOP}px`,

        yPercent: 0,

        scale: DOCK_SCALE,

        duration: 0.58,

        ease: "power2.inOut",
      },

      cardDockTime,
    );

    timeline.to(
      elements.cardLayers,

      {
        autoAlpha: 1,

        height: "auto",

        marginTop: "0.22rem",

        paddingTop: "0.32rem",

        duration: 0.3,

        ease: "power2.out",
      },

      cardDockTime + 0.34,
    );

    timeline.to(
      elements.contentIntro,

      {
        autoAlpha: 1,

        y: 0,

        duration: 0.24,
      },

      comparisonTime,
    );

    timeline.to(
      elements.compareStage,

      {
        autoAlpha: 1,

        y: 0,

        pointerEvents: "auto",

        duration: 0.4,

        ease: "power2.out",
      },

      comparisonTime + 0.08,
    );

    timeline.to(
      elements.profileButtons,

      {
        autoAlpha: 1,

        y: 0,

        duration: 0.3,

        stagger: 0.07,

        ease: "power2.out",
      },

      comparisonTime + 0.13,
    );

    timeline.to(
      elements.readerContents,

      {
        autoAlpha: 1,

        y: 0,

        duration: 0.38,

        stagger: 0.07,

        ease: "power2.out",
      },

      comparisonTime + 0.22,
    );

    timeline.set(
      elements.sharedCardWrap,

      {
        pointerEvents: "auto",
      },

      comparisonTime + 0.18,
    );

    timeline.to(
      {},

      {
        duration: 1.1,
      },
    );

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        updateFinalLayoutMetrics();

        timeline.scrollTrigger?.refresh();
      });
    }

    const cleanup = () => {
      timeline.scrollTrigger?.kill();

      timeline.kill();

      gsap.set(
        [
          ...leftItems,
          ...rightItems,
          elements.selectionCopy,
          elements.sharedCardWrap,
          elements.cardCover,
          elements.handoff,
          elements.cardLayers,
          elements.contentIntro,
          elements.compareStage,
          ...elements.profileButtons,
          ...elements.readerContents,
        ],

        {
          clearProps: "all",
        },
      );
    };

    if (managed) {
      timeline.pause(0);

      return {
        timeline,
        cleanup,
        refresh: () => {
          updateFinalLayoutMetrics();
          timeline.invalidate();
        },
      };
    }

    return cleanup;
  }

  function syncHandoffCover(
    source,
    elements,
  ) {
    const sourceImage =
      source.querySelector("img");

    const sourceFallback =
      source.querySelector(
        "[data-cover-fallback]",
      );

    elements.handoffFallback.textContent =
      sourceFallback?.textContent ||
      "Attack on Titan";

    elements.handoffFallback.hidden = false;

    elements.handoffImage.hidden = true;

    const sourceUrl =
      sourceImage?.currentSrc ||
      sourceImage?.src ||
      "";

    if (!sourceUrl) {
      elements.handoffImage.removeAttribute(
        "src",
      );

      return;
    }

    elements.handoffImage.onload = () => {
      elements.handoffImage.hidden = false;

      elements.handoffFallback.hidden = true;
    };

    elements.handoffImage.onerror = () => {
      elements.handoffImage.hidden = true;

      elements.handoffFallback.hidden = false;
    };

    elements.handoffImage.src = sourceUrl;
  }

  function getCenterTarget(item, stage) {
    const lane = item.offsetParent;

    const stageRect =
      stage.getBoundingClientRect();

    const laneRect =
      lane.getBoundingClientRect();

    return {
      x:
        stageRect.width / 2 -
        (laneRect.left - stageRect.left) -
        item.offsetLeft -
        item.offsetWidth / 2,

      y:
        stageRect.height / 2 -
        item.offsetTop -
        item.offsetHeight / 2,
    };
  }

  function getRelativeRect(
    element,
    relativeTo,
  ) {
    const rect =
      element.getBoundingClientRect();

    const parentRect =
      relativeTo.getBoundingClientRect();

    return {
      left:
        rect.left -
        parentRect.left,

      top:
        rect.top -
        parentRect.top,

      width: rect.width,

      height: rect.height,
    };
  }

  function showStaticLayout(
    section,
    elements,
  ) {
    section.classList.add("is-static");

    if (elements?.cardCover) {
      elements.cardCover.style.opacity = "1";

      elements.cardCover.style.visibility =
        "visible";
    }

    if (elements?.sharedCardWrap) {
      elements.sharedCardWrap.style.pointerEvents =
        "auto";
    }

    if (elements?.compareStage) {
      elements.compareStage.style.pointerEvents =
        "auto";
    }
  }

  function showDatabaseError(
    elements,
    message,
  ) {
    if (elements.empty) {
      elements.empty.hidden = false;

      const paragraph =
        elements.empty.querySelector("p");

      if (paragraph) {
        paragraph.textContent = message;
      }
    }

    setStatus(elements, message);
  }

  function setStatus(elements, message) {
    if (elements.status) {
      elements.status.textContent =
        message;
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();