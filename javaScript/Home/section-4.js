(() => {
  'use strict';

  const SUPABASE_URL =
    'https://hsruxfpslxguhwnccwuj.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

  const TABLE_NAME =
    'manga';

  const BUCKET_NAME =
    'img';

  const COVER_FOLDER =
    'covers';

  const CHOSEN_STORY_ID =
    '';

  const CHOSEN_STORY_ALIASES = [
    'Attack on Titan',
    'Shingeki no Kyojin'
  ];

  const RAIN_ITEMS_PER_SIDE =
    10;

  const CHOSEN_LEFT_INDEX =
    5;

  const CHOSEN_RIGHT_INDEX =
    4;

  const PIN_DISTANCE =
    3200;

  let supabaseClient =
    null;

  const READERS = {
    kai: {
      side:
        'left',

      name:
        'kai.reads',

      bio:
        'remembers the feeling before the theory',

      initial:
        'K',

      avatarUrl:
        '',

      score:
        '9/10',

      status:
        'Completed',

      ratingReason:
        'Kai gives it 9/10 because the emotional decisions remain powerful and memorable. The characters feel vulnerable even during the largest moments. Some middle sections feel crowded, but the emotional consequences keep the story grounded. Kai finishes the series remembering its people more than its spectacle.',

      quotes: [
        {
          text:
            'Fear can be present and a choice can still be yours.',

          note:
            'This stays with Kai because the series rarely treats courage as the absence of fear. The characters often move while still uncertain, exhausted, or emotionally overwhelmed. That makes their decisions feel human instead of simply heroic. Kai remembers the hesitation before the action as much as the action itself.'
        },
        {
          text:
            'Freedom can become another kind of burden.',

          note:
            'Kai connects this idea to characters who spend their lives imagining freedom as a destination. When they finally move closer to it, they discover that freedom also brings responsibility, uncertainty, and difficult choices. The story shows that escaping one limitation does not automatically remove every internal pressure. Kai likes that freedom remains emotionally complicated.'
        },
        {
          text:
            'Being believed in can change what courage looks like.',

          note:
            'The quieter relationships matter to Kai because support often arrives before a character can support themselves. A small amount of trust can change how someone sees their own abilities. That trust does not remove fear, but it gives the person a reason to move through it. Kai remembers these moments because they make courage feel shared rather than individual.'
        }
      ],

      characters: [
        {
          rank:
            1,

          name:
            'Armin Arlert',

          imageUrl:
            '',

          reason:
            'I like how his curiosity and empathy turn intelligence into a form of bravery. He is often afraid, but he continues thinking when everyone else is overwhelmed. His growth feels meaningful because confidence never completely replaces his sensitivity.'
        },
        {
          rank:
            2,

          name:
            'Mikasa Ackerman',

          imageUrl:
            '',

          reason:
            'Her loyalty is powerful, but the emotional cost of that loyalty is what stays with me. She is incredibly capable while still being shaped by fear, attachment, and loss. I find the conflict between her strength and dependence more interesting than her physical skill.'
        },
        {
          rank:
            3,

          name:
            'Levi Ackerman',

          imageUrl:
            '',

          reason:
            'His control is impressive, but the grief underneath it is more interesting to me. He repeatedly carries the consequences of decisions that had no completely good outcome. His restraint makes the smaller signs of care and exhaustion feel much stronger.'
        }
      ],

      thoughts: {
        title:
          'Freedom matters most when fear is no longer making every decision.',

        paragraphs: [
          'Kai remembers the series through small emotional decisions inside enormous events. A pause before answering, a promise made under pressure, or the moment someone moves while still afraid can matter more than the scale surrounding it. The story feels strongest when its characters are allowed to be uncertain.',

          'Freedom is not presented as a simple place that can finally be reached. Every character carries fear, love, guilt, expectation, or responsibility with them. Even after an external wall disappears, those internal pressures can continue controlling a life.',

          'The relationships are important because courage is rarely created alone. Characters borrow confidence from one another, disappoint one another, and sometimes continue because another person believed they could. That makes bravery feel less like a natural gift and more like something people help build together.',

          'Kai leaves the story thinking about how easily fear can make decisions for someone without them noticing. Real freedom begins when a person recognizes that pressure and still chooses what kind of person they want to become. That idea is what makes the emotional parts of the series last.'
        ]
      }
    },

    nova: {
      side:
        'right',

      name:
        'nova.pages',

      bio:
        'tracks themes, systems, and shifting truth',

      initial:
        'N',

      avatarUrl:
        '',

      score:
        '10/10',

      status:
        'Completed',

      ratingReason:
        'Nova gives it 10/10 because perspective continually changes the meaning of earlier events. History, identity, duty, and responsibility remain connected throughout the story. New information does not simply create twists; it changes how previous decisions must be judged. Nova values the way the story refuses to make understanding feel simple.',

      quotes: [
        {
          text:
            'The world changes when the story around it changes.',

          note:
            'Nova saves this because new information repeatedly rebuilds what the audience thinks it understands. The physical world may remain the same, but its meaning changes when history and perspective are revealed. Earlier actions can appear heroic, cruel, necessary, or avoidable depending on who controls the explanation. Nova likes how the series makes interpretation part of the conflict.'
        },
        {
          text:
            'Understanding a side does not erase what that side has done.',

          note:
            'For Nova, the series is strongest when empathy and accountability are allowed to exist together. Learning why someone acted does not automatically make the damage disappear. At the same time, refusing to understand the conditions behind an action makes future harm more likely. Nova values that the story asks for understanding without turning understanding into an excuse.'
        },
        {
          text:
            'An enemy can be created long before two people meet.',

          note:
            'This captures how inherited stories can turn fear into identity before personal experience has a chance. People are taught what another group represents, what history means, and which suffering deserves attention. By the time two individuals meet, they may already be carrying generations of expectations. Nova sees this as one of the story’s most important warnings.'
        }
      ],

      characters: [
        {
          rank:
            1,

          name:
            'Reiner Braun',

          imageUrl:
            '',

          reason:
            'I am drawn to the collision between duty, identity, guilt, and survival inside him. He is responsible for serious harm while also being shaped by a system that defined his purpose early. His contradictions make him one of the clearest examples of how a person can be both accountable and trapped.'
        },
        {
          rank:
            2,

          name:
            'Erwin Smith',

          imageUrl:
            '',

          reason:
            'His leadership makes sacrifice, truth, and personal obsession impossible to separate. He can inspire people while also using their lives to move closer to an answer he personally needs. I find him compelling because his public purpose and private motivation are never completely identical.'
        },
        {
          rank:
            3,

          name:
            'Historia Reiss',

          imageUrl:
            '',

          reason:
            'Her growth turns an inherited role into a question of self-definition and responsibility. She has to decide whether kindness means obeying what others need or choosing honestly for herself. I like how her story connects personal identity with the political expectations placed on her.'
        }
      ],

      thoughts: {
        title:
          'The most dangerous wall is the story that makes cruelty feel necessary.',

        paragraphs: [
          'Nova reads the series as a study of systems rather than only individual heroes and enemies. Every personal decision happens inside inherited histories, institutions, military structures, and repeated stories about who deserves safety. The characters make choices, but they never make them in an empty world.',

          'Perspective changes the meaning of nearly everything. The same event can become liberation, invasion, revenge, protection, or tragedy depending on who remembers it and who is allowed to explain it. The story does not suggest that every interpretation is equally true, but it shows that information always shapes judgment.',

          'Responsibility becomes difficult because people can cause harm while also being shaped by forces larger than themselves. Understanding those forces is necessary, but it cannot become an automatic excuse. Nova thinks the series is strongest when it holds both ideas together without allowing either one to remove the other.',

          'The lasting question is not simply which side is correct. It is what a person should do after learning that their identity, duty, enemy, and history were built from incomplete information. Nova values the series because it treats that realization as the beginning of responsibility rather than the end of the argument.'
        ]
      }
    }
  };

  const FALLBACK_STORY = {
    id:
      '',

    title:
      'Attack on Titan',

    creator:
      'Hajime Isayama',

    type: [
      'Manga',
      'Anime'
    ]
  };

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      startSection4,
      {
        once: true
      }
    );
  } else {
    startSection4();
  }

  async function startSection4() {
    const section =
      document.querySelector(
        '[data-section-cover-rain]'
      );

    if (
      !section ||
      section.dataset.section4Ready ===
        'true'
    ) {
      return;
    }

    section.dataset.section4Ready =
      'true';

    const elements =
      collectElements(section);

    setupReaderContent(
      elements
    );

    if (
      !window.supabase?.createClient
    ) {
      console.error(
        'Section 4: Supabase is not loaded.'
      );

      renderStory(
        section,
        FALLBACK_STORY
      );

      showStaticLayout(
        section
      );

      setStatus(
        elements,
        'Supabase is missing. Showing the static fallback.'
      );

      return;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    try {
      setStatus(
        elements,
        'Loading anime and manga covers.'
      );

      const storyPool =
        await loadAnimeMangaPool();

      const chosenStory =
        await findChosenStory(
          storyPool
        );

      renderStory(
        section,
        chosenStory
      );

      renderRain(
        elements,
        storyPool,
        chosenStory
      );

      setStatus(
        elements,
        `${chosenStory.title} loaded as the shared story.`
      );

      requestAnimationFrame(
        () => {
          setupMotion(
            section,
            elements
          );
        }
      );
    } catch (error) {
      console.error(
        'Section 4 failed:',
        error
      );

      renderStory(
        section,
        FALLBACK_STORY
      );

      showDatabaseError(
        elements,
        'Story covers could not be loaded.'
      );

      showStaticLayout(
        section
      );
    }
  }

  function collectElements(
    section
  ) {
    return {
      section,

      cinematic:
        section.querySelector(
          '[data-s4-cinematic]'
        ),

      cinematicCopy:
        section.querySelector(
          '[data-cinematic-copy]'
        ),

      rainLeft:
        section.querySelector(
          '[data-rain-left]'
        ),

      rainRight:
        section.querySelector(
          '[data-rain-right]'
        ),

      selectionCopy:
        section.querySelector(
          '[data-selection-copy]'
        ),

      cardFormation:
        section.querySelector(
          '[data-card-formation]'
        ),

      formationCover:
        section.querySelector(
          '[data-formation-cover]'
        ),

      continueCue:
        section.querySelector(
          '[data-continue-cue]'
        ),

      sharedCard:
        section.querySelector(
          '[data-shared-card]'
        ),

      compareStage:
        section.querySelector(
          '[data-compare-stage]'
        ),

      compareBoth:
        section.querySelector(
          '[data-compare-both]'
        ),

      profileButtons: [
        ...section.querySelectorAll(
          '[data-focus-reader]'
        )
      ],

      layerButtons: [
        ...section.querySelectorAll(
          '[data-layer]'
        )
      ],

      readerContents: [
        ...section.querySelectorAll(
          '[data-reader-content]'
        )
      ],

      score:
        section.querySelector(
          '[data-reader-score]'
        ),

      scoreText:
        section.querySelector(
          '[data-reader-score] span'
        ),

      readerStatus:
        section.querySelector(
          '[data-reader-status]'
        ),

      empty:
        section.querySelector(
          '[data-section-4-empty]'
        ),

      status:
        section.querySelector(
          '[data-section-4-status]'
        )
    };
  }

  async function loadAnimeMangaPool() {
    const featuredResult =
      await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq(
          'featured',
          true
        );

    if (
      featuredResult.error
    ) {
      throw featuredResult.error;
    }

    let pool =
      normalizeStoryRows(
        featuredResult.data ||
        []
      );

    const minimumNeeded =
      (
        RAIN_ITEMS_PER_SIDE -
        1
      ) *
      2 +
      1;

    if (
      dedupeStories(pool).length <
      minimumNeeded
    ) {
      const allResult =
        await supabaseClient
          .from(TABLE_NAME)
          .select('*')
          .limit(80);

      if (
        !allResult.error
      ) {
        pool =
          dedupeStories([
            ...pool,
            ...normalizeStoryRows(
              allResult.data ||
              []
            )
          ]);
      }
    }

    return dedupeStories(
      pool
    );
  }

  function normalizeStoryRows(
    rows
  ) {
    return (rows || [])
      .filter((item) => {
        return (
          item &&
          item.id != null &&
          item.title
        );
      })
      .map(
        normalizeStory
      )
      .filter((story) => {
        const typeText =
          story.type
            .join(' ')
            .toLowerCase();

        return (
          typeText.includes(
            'anime'
          ) ||
          typeText.includes(
            'manga'
          )
        );
      });
  }

  async function findChosenStory(
    storyPool
  ) {
    if (
      CHOSEN_STORY_ID
    ) {
      const poolMatch =
        storyPool.find((story) => {
          return (
            String(story.id) ===
            String(
              CHOSEN_STORY_ID
            )
          );
        });

      if (
        poolMatch
      ) {
        return poolMatch;
      }

      const idResult =
        await supabaseClient
          .from(TABLE_NAME)
          .select('*')
          .eq(
            'id',
            CHOSEN_STORY_ID
          )
          .limit(1);

      if (
        !idResult.error &&
        idResult.data?.[0]
      ) {
        return normalizeStory(
          idResult.data[0]
        );
      }
    }

    const aliases =
      CHOSEN_STORY_ALIASES
        .map(
          normalizeText
        );

    const poolTitleMatch =
      storyPool.find((story) => {
        return aliases.includes(
          normalizeText(
            story.title
          )
        );
      });

    if (
      poolTitleMatch
    ) {
      return poolTitleMatch;
    }

    for (
      const alias of
      CHOSEN_STORY_ALIASES
    ) {
      const result =
        await supabaseClient
          .from(TABLE_NAME)
          .select('*')
          .ilike(
            'title',
            `%${alias}%`
          )
          .limit(10);

      if (
        !result.error &&
        result.data?.length
      ) {
        const normalized =
          result.data.map(
            normalizeStory
          );

        const exact =
          normalized.find(
            (story) => {
              return (
                normalizeText(
                  story.title
                ) ===
                normalizeText(
                  alias
                )
              );
            }
          );

        return (
          exact ||
          normalized[0]
        );
      }
    }

    return {
      ...FALLBACK_STORY
    };
  }

  function normalizeStory(
    item
  ) {
    return {
      id:
        String(
          item.id ??
          ''
        ),

      title:
        String(
          item.title ||
          'Untitled story'
        ),

      creator:
        String(
          item.creator ??
          item.author ??
          item.writer ??
          item.artist ??
          ''
        ),

      type:
        getTypeList(
          item.type
        )
    };
  }

  function getTypeList(
    value
  ) {
    if (
      Array.isArray(value)
    ) {
      return value
        .map(String)
        .filter(Boolean);
    }

    if (
      !value
    ) {
      return [
        'Manga'
      ];
    }

    const text =
      String(value)
        .trim();

    try {
      const parsed =
        JSON.parse(text);

      if (
        Array.isArray(parsed)
      ) {
        return parsed
          .map(String)
          .filter(Boolean);
      }
    } catch (_) {
      // Plain text is allowed.
    }

    return text
      .split(/[,/|]+/)
      .map((part) => {
        return part.trim();
      })
      .filter(Boolean);
  }

  function getCoverUrlFromId(
    id
  ) {
    if (
      !id ||
      !supabaseClient
    ) {
      return '';
    }

    const path =
      `${COVER_FOLDER}/${id}.jpg`;

    const {
      data
    } =
      supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

    return (
      data?.publicUrl ||
      ''
    );
  }

  function renderStory(
    section,
    story
  ) {
    section
      .querySelectorAll(
        '[data-story-title]'
      )
      .forEach((node) => {
        node.textContent =
          story.title;
      });

    section
      .querySelectorAll(
        '[data-story-creator]'
      )
      .forEach((node) => {
        node.textContent =
          story.creator ||
          'Unknown creator';
      });

    section
      .querySelectorAll(
        '[data-story-format]'
      )
      .forEach((node) => {
        node.textContent =
          formatType(
            story.type
          );
      });

    section
      .querySelectorAll(
        '[data-story-cover]'
      )
      .forEach((image) => {
        const shell =
          image.closest(
            '[data-cover-shell]'
          );

        const fallback =
          shell?.querySelector(
            '[data-cover-fallback]'
          );

        if (
          !fallback
        ) {
          return;
        }

        fallback.textContent =
          story.title;

        loadCover(
          image,
          fallback,
          story,
          `${story.title} cover`
        );
      });
  }

  function renderRain(
    elements,
    storyPool,
    chosenStory
  ) {
    elements.rainLeft.innerHTML =
      '';

    elements.rainRight.innerHTML =
      '';

    const ordinaryPool =
      dedupeStories(
        storyPool.filter(
          (story) => {
            return (
              storyKey(story) !==
              storyKey(
                chosenStory
              )
            );
          }
        )
      );

    const neededPerSide =
      RAIN_ITEMS_PER_SIDE -
      1;

    const shuffled =
      seededShuffle(
        ordinaryPool,
        hashString(
          `${chosenStory.title}-rain`
        )
      );

    const leftOrdinary =
      takeUniqueStories(
        shuffled,
        neededPerSide
      );

    const leftKeys =
      new Set(
        leftOrdinary.map(
          storyKey
        )
      );

    const unusedForRight =
      shuffled.filter(
        (story) => {
          return !leftKeys.has(
            storyKey(story)
          );
        }
      );

    const rightFallback =
      seededShuffle(
        shuffled,
        hashString(
          `${chosenStory.title}-right-rain`
        )
      );

    const rightOrdinary =
      takeUniqueStories(
        [
          ...unusedForRight,
          ...rightFallback
        ],
        neededPerSide
      );

    if (
      leftOrdinary.length <
        neededPerSide ||
      rightOrdinary.length <
        neededPerSide
    ) {
      console.warn(
        'Section 4 needs at least nine unique ordinary covers for each lane.'
      );
    }

    const leftStories =
      insertChosenStory(
        leftOrdinary,
        chosenStory,
        CHOSEN_LEFT_INDEX
      ).slice(
        0,
        RAIN_ITEMS_PER_SIDE
      );

    const rightStories =
      insertChosenStory(
        rightOrdinary,
        chosenStory,
        CHOSEN_RIGHT_INDEX
      ).slice(
        0,
        RAIN_ITEMS_PER_SIDE
      );

    leftStories.forEach(
      (
        story,
        index
      ) => {
        const isChosen =
          storyKey(story) ===
          storyKey(
            chosenStory
          );

        elements.rainLeft
          .appendChild(
            createRainItem(
              story,
              'left',
              index,
              isChosen
            )
          );
      }
    );

    rightStories.forEach(
      (
        story,
        index
      ) => {
        const isChosen =
          storyKey(story) ===
          storyKey(
            chosenStory
          );

        elements.rainRight
          .appendChild(
            createRainItem(
              story,
              'right',
              index,
              isChosen
            )
          );
      }
    );
  }

  function takeUniqueStories(
    stories,
    count
  ) {
    const result =
      [];

    const seen =
      new Set();

    for (
      const story of
      stories
    ) {
      const key =
        storyKey(story);

      if (
        !key ||
        seen.has(key)
      ) {
        continue;
      }

      seen.add(key);

      result.push(
        story
      );

      if (
        result.length >=
        count
      ) {
        break;
      }
    }

    return result;
  }

  function insertChosenStory(
    stories,
    chosenStory,
    requestedIndex
  ) {
    const result =
      [...stories];

    const safeIndex =
      Math.min(
        Math.max(
          requestedIndex,
          0
        ),
        result.length
      );

    result.splice(
      safeIndex,
      0,
      chosenStory
    );

    return result;
  }

  function dedupeStories(
    stories
  ) {
    const seen =
      new Set();

    return (stories || [])
      .filter((story) => {
        const key =
          storyKey(story);

        if (
          !key ||
          seen.has(key)
        ) {
          return false;
        }

        seen.add(key);

        return true;
      });
  }

  function storyKey(
    story
  ) {
    return String(
      story?.id ||
      normalizeText(
        story?.title
      )
    );
  }

  function seededShuffle(
    stories,
    seed
  ) {
    const copy =
      [...stories];

    let state =
      seed ||
      1;

    const random =
      () => {
        state =
          (
            state *
            1664525 +
            1013904223
          ) >>> 0;

        return (
          state /
          4294967296
        );
      };

    for (
      let index =
        copy.length - 1;
      index > 0;
      index -= 1
    ) {
      const swapIndex =
        Math.floor(
          random() *
          (
            index +
            1
          )
        );

      [
        copy[index],
        copy[swapIndex]
      ] = [
        copy[swapIndex],
        copy[index]
      ];
    }

    return copy;
  }

  function hashString(
    value
  ) {
    let hash =
      2166136261;

    for (
      const character of
      String(value || '')
    ) {
      hash ^=
        character.charCodeAt(
          0
        );

      hash =
        Math.imul(
          hash,
          16777619
        );
    }

    return hash >>> 0;
  }

  function createRainItem(
    story,
    side,
    itemIndex,
    isChosen
  ) {
    const figure =
      document.createElement(
        'figure'
      );

    const image =
      document.createElement(
        'img'
      );

    const fallback =
      document.createElement(
        'span'
      );

    const leftPositions = [
      2,
      34,
      62,
      14,
      50,
      74,
      24,
      58,
      6,
      42
    ];

    const rightPositions = [
      68,
      36,
      4,
      54,
      18,
      72,
      42,
      8,
      60,
      28
    ];

    const coverWidths = [
      96,
      116,
      104,
      122,
      92,
      110,
      118,
      100,
      112,
      94
    ];

    const positions =
      side === 'left'
        ? leftPositions
        : rightPositions;

    figure.className =
      isChosen
        ? 's4-rain-item is-chosen-story'
        : 's4-rain-item';

    figure.dataset.coverShell =
      '';

    figure.dataset.rainSide =
      side;

    figure.dataset.rainIndex =
      String(itemIndex);

    if (
      isChosen
    ) {
      figure.dataset.chosenRainCover =
        side;
    }

    figure.style.left =
      `${
        positions[
          itemIndex %
          positions.length
        ]
      }%`;

    figure.style.setProperty(
      '--s4-rain-width',
      `${
        coverWidths[
          itemIndex %
          coverWidths.length
        ]
      }px`
    );

    figure.style.zIndex =
      String(
        2 +
        (
          itemIndex %
          4
        )
      );

    image.alt =
      '';

    image.loading =
      'eager';

    image.decoding =
      'async';

    fallback.className =
      's4-cover-fallback';

    fallback.dataset.coverFallback =
      '';

    fallback.textContent =
      story.title;

    figure.append(
      image,
      fallback
    );

    loadCover(
      image,
      fallback,
      story,
      ''
    );

    return figure;
  }

  function loadCover(
    image,
    fallback,
    story,
    alt
  ) {
    const url =
      getCoverUrlFromId(
        story.id
      );

    image.hidden =
      true;

    image.alt =
      alt;

    fallback.hidden =
      false;

    if (
      !url
    ) {
      image.removeAttribute(
        'src'
      );

      return;
    }

    image.onload =
      () => {
        image.hidden =
          false;

        fallback.hidden =
          true;
      };

    image.onerror =
      () => {
        image.hidden =
          true;

        fallback.hidden =
          false;

        image.removeAttribute(
          'src'
        );
      };

    image.src =
      url;
  }

  function formatType(
    list
  ) {
    const clean = [
      ...new Set(
        (list || [])
          .map((item) => {
            return String(item)
              .trim();
          })
          .filter(Boolean)
          .map((item) => {
            return (
              item
                .charAt(0)
                .toUpperCase() +
              item
                .slice(1)
                .toLowerCase()
            );
          })
      )
    ];

    return clean.length
      ? clean.join(' / ')
      : 'Manga / Anime';
  }

  function setupReaderContent(
    elements
  ) {
    let activeLayer =
      'quotes';

    let focusMode =
      'both';

    fillProfileCards(
      elements.section
    );

    function renderBothSides() {
      elements
        .readerContents
        .forEach(
          (container) => {
            const readerId =
              container
                .dataset
                .readerContent;

            const reader =
              READERS[
                readerId
              ];

            if (
              !reader
            ) {
              return;
            }

            if (
              activeLayer ===
              'quotes'
            ) {
              renderQuotes(
                container,
                reader
              );
            } else if (
              activeLayer ===
              'characters'
            ) {
              renderCharacters(
                container,
                reader
              );
            } else {
              renderThoughts(
                container,
                reader
              );
            }

            animateContent(
              container
            );
          }
        );
    }

    function setLayer(
      layer
    ) {
      if (
        ![
          'quotes',
          'characters',
          'thoughts'
        ].includes(layer)
      ) {
        return;
      }

      activeLayer =
        layer;

      elements
        .layerButtons
        .forEach(
          (button) => {
            const selected =
              button
                .dataset
                .layer ===
              layer;

            button.classList
              .toggle(
                'is-active',
                selected
              );

            button.setAttribute(
              'aria-pressed',
              String(selected)
            );
          }
        );

      renderBothSides();
    }

    function setFocus(
      mode
    ) {
      if (
        ![
          'both',
          'left',
          'right'
        ].includes(mode)
      ) {
        return;
      }

      focusMode =
        mode;

      elements
        .compareStage
        .dataset
        .focus =
          focusMode;

      elements
        .profileButtons
        .forEach(
          (button) => {
            const selected =
              button
                .dataset
                .focusReader ===
              focusMode;

            button.setAttribute(
              'aria-pressed',
              String(selected)
            );
          }
        );

      elements
        .compareBoth
        .setAttribute(
          'aria-pressed',
          String(
            focusMode ===
            'both'
          )
        );

      if (
        focusMode ===
        'left'
      ) {
        updateScoreDisplay(
          elements,
          READERS.kai.score,
          `Kai rated this story ${READERS.kai.score}. ${READERS.kai.ratingReason}`,
          READERS.kai.ratingReason
        );

        elements
          .readerStatus
          .textContent =
            READERS
              .kai
              .status;
      } else if (
        focusMode ===
        'right'
      ) {
        updateScoreDisplay(
          elements,
          READERS.nova.score,
          `Nova rated this story ${READERS.nova.score}. ${READERS.nova.ratingReason}`,
          READERS.nova.ratingReason
        );

        elements
          .readerStatus
          .textContent =
            READERS
              .nova
              .status;
      } else {
        const combinedScore =
          getCombinedScore();

        const combinedReason =
          `Average of Kai's ${READERS.kai.score} and Nova's ${READERS.nova.score}. Focus either profile to see the complete reason behind that reader's score.`;

        updateScoreDisplay(
          elements,
          combinedScore,
          `Average reader rating ${combinedScore}. Kai rated it ${READERS.kai.score} and Nova rated it ${READERS.nova.score}.`,
          combinedReason
        );

        elements
          .readerStatus
          .textContent =
            'Both completed';
      }
    }

    elements
      .layerButtons
      .forEach(
        (button) => {
          button.addEventListener(
            'click',
            () => {
              setLayer(
                button
                  .dataset
                  .layer
              );
            }
          );
        }
      );

    elements
      .profileButtons
      .forEach(
        (button) => {
          button.addEventListener(
            'click',
            () => {
              const requested =
                button
                  .dataset
                  .focusReader;

              setFocus(
                focusMode ===
                requested
                  ? 'both'
                  : requested
              );
            }
          );
        }
      );

    elements
      .compareBoth
      .addEventListener(
        'click',
        () => {
          setFocus(
            'both'
          );
        }
      );

    setLayer(
      activeLayer
    );

    setFocus(
      focusMode
    );
  }

  function updateScoreDisplay(
    elements,
    visibleScore,
    ariaLabel,
    tooltip
  ) {
    if (
      elements.scoreText
    ) {
      elements
        .scoreText
        .textContent =
          visibleScore;
    }

    if (
      elements.score
    ) {
      elements
        .score
        .setAttribute(
          'aria-label',
          ariaLabel
        );

      elements
        .score
        .dataset
        .scoreTooltip =
          tooltip;
    }
  }

  function getCombinedScore() {
    const values = [
      READERS.kai.score,
      READERS.nova.score
    ]
      .map((value) => {
        return Number.parseFloat(
          value
        );
      })
      .filter(
        Number.isFinite
      );

    if (
      !values.length
    ) {
      return '9.5/10';
    }

    const average =
      values.reduce(
        (
          sum,
          value
        ) => {
          return (
            sum +
            value
          );
        },
        0
      ) /
      values.length;

    return (
      `${average.toFixed(1)}/10`
    );
  }

  function fillProfileCards(
    section
  ) {
    Object
      .entries(
        READERS
      )
      .forEach(
        ([
          readerId,
          reader
        ]) => {
          section
            .querySelectorAll(
              `[data-profile-name="${readerId}"]`
            )
            .forEach(
              (node) => {
                node.textContent =
                  reader.name;
              }
            );

          section
            .querySelectorAll(
              `[data-profile-bio="${readerId}"]`
            )
            .forEach(
              (node) => {
                node.textContent =
                  reader.bio;
              }
            );

          section
            .querySelectorAll(
              `[data-avatar-fallback="${readerId}"]`
            )
            .forEach(
              (node) => {
                node.textContent =
                  reader.initial;
              }
            );

          const image =
            section.querySelector(
              `[data-avatar-image="${readerId}"]`
            );

          if (
            !image
          ) {
            return;
          }

          const fallbackPortrait =
            createPortraitPlaceholder(
              reader.name,
              reader.side
            );

          image.src =
            reader.avatarUrl ||
            fallbackPortrait;

          image.alt =
            `${reader.name} profile picture`;

          image.hidden =
            false;

          image.onerror =
            () => {
              if (
                image.src !==
                fallbackPortrait
              ) {
                image.src =
                  fallbackPortrait;

                return;
              }

              image.hidden =
                true;
            };
        }
      );
  }

  function renderQuotes(
    container,
    reader
  ) {
    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · quote collection
        </span>

        <h4>
          ${reader.quotes.length} ideas — and why they stayed
        </h4>
      </header>

      <div class="s4-quote-grid">
        ${reader.quotes
          .map(
            (
              quote,
              index
            ) => {
              return `
                <article
                  class="s4-quote-card ${index === 0 ? 'is-featured' : ''}"
                >
                  <span class="s4-card-number">
                    Saved idea ${String(index + 1).padStart(2, '0')}
                  </span>

                  <blockquote>
                    “${escapeHtml(quote.text)}”
                  </blockquote>

                  <span class="s4-quote-note-label">
                    Why it stayed
                  </span>

                  <p>
                    ${escapeHtml(quote.note)}
                  </p>
                </article>
              `;
            }
          )
          .join('')}
      </div>
    `;
  }

  function renderCharacters(
    container,
    reader
  ) {
    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · character shelf
        </span>

        <h4>
          ${reader.characters.length} characters and what I see in them
        </h4>
      </header>

      <div class="s4-character-grid">
        ${reader.characters
          .map(
            (
              character,
              index
            ) => {
              const fallbackImage =
                createPortraitPlaceholder(
                  character.name,
                  reader.side
                );

              const imageUrl =
                character.imageUrl ||
                fallbackImage;

              return `
                <article
                  class="s4-character-card ${index === 0 ? 'is-featured' : ''}"
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
                      #${String(character.rank).padStart(2, '0')}
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
                  </div>
                </article>
              `;
            }
          )
          .join('')}
      </div>
    `;

    container
      .querySelectorAll(
        '[data-character-image]'
      )
      .forEach((image) => {
        image.addEventListener(
          'error',
          () => {
            image.src =
              image
                .dataset
                .fallbackSrc;
          },
          {
            once: true
          }
        );
      });
  }

  function renderThoughts(
    container,
    reader
  ) {
    container.innerHTML = `
      <article class="s4-thought-card">
        <span class="s4-card-number">
          ${escapeHtml(reader.name)} · full reflection
        </span>

        <h4>
          ${escapeHtml(reader.thoughts.title)}
        </h4>

        <div class="s4-thought-copy">
          ${reader.thoughts.paragraphs
            .map((paragraph) => {
              return `
                <p>
                  ${escapeHtml(paragraph)}
                </p>
              `;
            })
            .join('')}
        </div>
      </article>
    `;
  }

  function createPortraitPlaceholder(
    name,
    side
  ) {
    const initials =
      String(
        name ||
        '?'
      )
        .split(/\s+/)
        .filter(Boolean)
        .slice(
          0,
          2
        )
        .map((part) => {
          return part
            .charAt(0)
            .toUpperCase();
        })
        .join('');

    const colours =
      side ===
      'right'
        ? [
            '#67c9e8',
            '#596fd7',
            '#11172d'
          ]
        : [
            '#9b7cff',
            '#6578df',
            '#11172d'
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
            cx="0.3"
            cy="0.18"
            r="0.8"
          >
            <stop
              offset="0"
              stop-color="#ffffff"
              stop-opacity="0.34"
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
          cy="118"
          r="54"
          fill="#f7f4ff"
          fill-opacity="0.18"
        />

        <path
          d="M42 296c8-70 42-108 78-108s70 38 78 108"
          fill="#070b17"
          fill-opacity="0.46"
        />

        <text
          x="120"
          y="139"
          text-anchor="middle"
          font-family="Georgia,serif"
          font-size="54"
          font-weight="700"
          fill="#ffffff"
        >
          ${initials}
        </text>
      </svg>
    `;

    return (
      `data:image/svg+xml;charset=UTF-8,` +
      encodeURIComponent(svg)
    );
  }

  function animateContent(
    container
  ) {
    if (
      prefersReducedMotion() ||
      typeof container.animate !==
      'function'
    ) {
      return;
    }

    container.animate(
      [
        {
          opacity: 0.25,

          transform:
            'translateY(9px)'
        },
        {
          opacity: 1,

          transform:
            'translateY(0)'
        }
      ],
      {
        duration: 280,

        easing:
          'cubic-bezier(.22,1,.36,1)'
      }
    );
  }

  function setupMotion(
    section,
    elements
  ) {
    if (
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      console.warn(
        'Section 4: GSAP or ScrollTrigger is missing.'
      );

      showStaticLayout(
        section
      );

      return;
    }

    const {
      gsap,
      ScrollTrigger
    } =
      window;

    gsap.registerPlugin(
      ScrollTrigger
    );

    gsap.matchMedia().add(
      {
        animated:
          '(min-width: 900px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)',

        static:
          '(max-width: 899px), (max-height: 719px), (prefers-reduced-motion: reduce)'
      },
      (context) => {
        if (
          context
            .conditions
            .static
        ) {
          showStaticLayout(
            section
          );

          return;
        }

        section.classList.remove(
          'is-static'
        );

        return createPinnedTimeline(
          section,
          elements,
          gsap
        );
      }
    );

    gsap.from(
      elements.sharedCard,
      {
        opacity: 0,

        y: 54,

        duration: 0.72,

        ease:
          'power2.out',

        scrollTrigger: {
          trigger:
            elements.sharedCard,

          start:
            'top 88%',

          once:
            true
        }
      }
    );

    gsap.from(
      elements.compareStage,
      {
        opacity: 0,

        y: 44,

        duration: 0.72,

        ease:
          'power2.out',

        scrollTrigger: {
          trigger:
            elements.compareStage,

          start:
            'top 88%',

          once:
            true
        }
      }
    );
  }

  function createPinnedTimeline(
    section,
    elements,
    gsap
  ) {
    const leftItems =
      gsap.utils.toArray(
        '[data-rain-side="left"]',
        elements.cinematic
      );

    const rightItems =
      gsap.utils.toArray(
        '[data-rain-side="right"]',
        elements.cinematic
      );

    const chosenLeft =
      elements.cinematic
        .querySelector(
          '[data-chosen-rain-cover="left"]'
        );

    const chosenRight =
      elements.cinematic
        .querySelector(
          '[data-chosen-rain-cover="right"]'
        );

    if (
      !chosenLeft ||
      !chosenRight ||
      !elements.cardFormation ||
      !elements.formationCover
    ) {
      showStaticLayout(
        section
      );

      return;
    }

    const regularLeft =
      leftItems.filter(
        (item) => {
          return (
            item !==
            chosenLeft
          );
        }
      );

    const regularRight =
      rightItems.filter(
        (item) => {
          return (
            item !==
            chosenRight
          );
        }
      );

    const viewportHeight =
      () => {
        return (
          elements
            .cinematic
            .clientHeight
        );
      };

    leftItems.forEach(
      (
        item,
        index
      ) => {
        gsap.set(
          item,
          {
            y: () => {
              const step =
                viewportHeight() /
                Math.max(
                  leftItems.length -
                  1,
                  1
                );

              return (
                viewportHeight() *
                0.9 -
                index *
                step
              );
            },

            rotation:
              -9 +
              (
                index %
                5
              ) *
              4,

            scale:
              0.86 +
              (
                index %
                4
              ) *
              0.055,

            opacity:
              0.72 +
              (
                index %
                3
              ) *
              0.1
          }
        );
      }
    );

    rightItems.forEach(
      (
        item,
        index
      ) => {
        gsap.set(
          item,
          {
            y: () => {
              const step =
                viewportHeight() /
                Math.max(
                  rightItems.length -
                  1,
                  1
                );

              return (
                -item.offsetHeight *
                0.65 +
                index *
                step
              );
            },

            rotation:
              9 -
              (
                index %
                5
              ) *
              4,

            scale:
              0.86 +
              (
                index %
                4
              ) *
              0.055,

            opacity:
              0.72 +
              (
                index %
                3
              ) *
              0.1
          }
        );
      }
    );

    gsap.set(
      elements.selectionCopy,
      {
        autoAlpha: 0,

        y: 12
      }
    );

    gsap.set(
      elements.continueCue,
      {
        autoAlpha: 0,

        y: 12
      }
    );

    gsap.set(
      elements.cardFormation,
      {
        autoAlpha: 0,

        xPercent: -50,

        yPercent: -50,

        y: 20,

        scale: 0.84
      }
    );

    gsap.set(
      elements.formationCover,
      {
        autoAlpha: 0,

        scale: 1.12,

        rotation: -2
      }
    );

    const timeline =
      gsap.timeline({
        defaults: {
          ease:
            'none'
        },

        scrollTrigger: {
          trigger:
            elements.cinematic,

          start:
            'top top',

          end:
            `+=${PIN_DISTANCE}`,

          pin:
            true,

          pinSpacing:
            true,

          scrub:
            1,

          anticipatePin:
            1,

          invalidateOnRefresh:
            true
        }
      });

    timeline.to(
      regularLeft,
      {
        y: (
          index,
          item
        ) => {
          const order =
            Number(
              item
                .dataset
                .rainIndex ||
              index
            );

          return (
            -viewportHeight() *
            1.25 -
            (
              regularLeft.length -
              order
            ) *
            80
          );
        },

        rotation: (
          index,
          item
        ) => {
          const order =
            Number(
              item
                .dataset
                .rainIndex ||
              index
            );

          return (
            7 -
            (
              order %
              5
            ) *
            3
          );
        },

        duration:
          1.78
      },
      0
    );

    timeline.to(
      regularRight,
      {
        y: (
          index,
          item
        ) => {
          const order =
            Number(
              item
                .dataset
                .rainIndex ||
              index
            );

          return (
            viewportHeight() *
            1.2 +
            order *
            78
          );
        },

        rotation: (
          index,
          item
        ) => {
          const order =
            Number(
              item
                .dataset
                .rainIndex ||
              index
            );

          return (
            -7 +
            (
              order %
              5
            ) *
            3
          );
        },

        duration:
          1.78
      },
      0
    );

    timeline.to(
      chosenLeft,
      {
        y: () => {
          return (
            viewportHeight() *
            0.58 -
            chosenLeft
              .offsetHeight /
            2
          );
        },

        rotation:
          -4,

        scale:
          1,

        duration:
          1.48,

        ease:
          'power1.inOut'
      },
      0
    );

    timeline.to(
      chosenRight,
      {
        y: () => {
          return (
            viewportHeight() *
            0.42 -
            chosenRight
              .offsetHeight /
            2
          );
        },

        rotation:
          4,

        scale:
          1,

        duration:
          1.48,

        ease:
          'power1.inOut'
      },
      0
    );

    timeline.to(
      elements.cinematicCopy,
      {
        autoAlpha: 0,

        y: -42,

        duration: 0.42
      },
      0.78
    );

    timeline.to(
      [
        ...regularLeft,
        ...regularRight
      ],
      {
        autoAlpha: 0.12,

        scale: 0.8,

        duration: 0.48
      },
      1.16
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight
      ],
      {
        borderColor:
          'rgba(225,229,255,0.82)',

        boxShadow:
          '0 38px 90px rgba(0,0,0,.62), 0 0 72px rgba(155,124,255,.42), 0 0 0 2px rgba(255,255,255,.12)',

        scale:
          1.13,

        duration:
          0.3,

        ease:
          'power2.out'
      },
      1.22
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight
      ],
      {
        x: (
          index,
          item
        ) => {
          return getCenterTarget(
            item,
            elements.cinematic
          ).x;
        },

        y: (
          index,
          item
        ) => {
          return getCenterTarget(
            item,
            elements.cinematic
          ).y;
        },

        rotation:
          0,

        scale:
          1.26,

        duration:
          0.82,

        ease:
          'power2.inOut'
      },
      1.42
    );

    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha:
          1,

        y:
          0,

        duration:
          0.28
      },
      1.82
    );

    timeline.to(
      chosenRight,
      {
        autoAlpha:
          0,

        scale:
          1.38,

        duration:
          0.22
      },
      2.13
    );

    timeline.fromTo(
      chosenLeft,
      {
        scale:
          1.26
      },
      {
        scale:
          1.42,

        duration:
          0.16,

        ease:
          'power2.out'
      },
      2.13
    );

    timeline.to(
      chosenLeft,
      {
        scale:
          1.3,

        duration:
          0.2,

        ease:
          'power2.inOut'
      },
      2.29
    );

    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha:
          0,

        y:
          -10,

        duration:
          0.2
      },
      2.33
    );

    timeline.to(
      elements.cardFormation,
      {
        autoAlpha:
          1,

        y:
          0,

        scale:
          1,

        duration:
          0.5,

        ease:
          'power2.out'
      },
      2.36
    );

    timeline.to(
      elements.formationCover,
      {
        autoAlpha:
          1,

        scale:
          1,

        rotation:
          0,

        duration:
          0.42,

        ease:
          'power2.out'
      },
      2.42
    );

    timeline.to(
      chosenLeft,
      {
        autoAlpha:
          0,

        scale:
          1.46,

        duration:
          0.3,

        ease:
          'power2.out'
      },
      2.36
    );

    timeline.to(
      elements.continueCue,
      {
        autoAlpha:
          1,

        y:
          0,

        duration:
          0.28
      },
      2.86
    );

    timeline.to(
      elements.cardFormation,
      {
        autoAlpha:
          0,

        y:
          -14,

        scale:
          0.98,

        duration:
          0.28
      },
      3.22
    );

    timeline.to(
      elements.continueCue,
      {
        autoAlpha:
          0,

        y:
          -8,

        duration:
          0.18
      },
      3.22
    );

    return () => {
      timeline
        .scrollTrigger
        ?.kill();

      timeline.kill();
    };
  }

  function getCenterTarget(
    item,
    stage
  ) {
    const lane =
      item.offsetParent;

    const stageRect =
      stage.getBoundingClientRect();

    const laneRect =
      lane.getBoundingClientRect();

    return {
      x:
        stageRect.width /
        2 -
        (
          laneRect.left -
          stageRect.left
        ) -
        item.offsetLeft -
        item.offsetWidth /
        2,

      y:
        stageRect.height /
        2 -
        item.offsetTop -
        item.offsetHeight /
        2
    };
  }

  function showStaticLayout(
    section
  ) {
    section.classList.add(
      'is-static'
    );
  }

  function showDatabaseError(
    elements,
    message
  ) {
    if (
      elements.empty
    ) {
      elements.empty.hidden =
        false;
    }

    setStatus(
      elements,
      message
    );
  }

  function setStatus(
    elements,
    message
  ) {
    if (
      elements.status
    ) {
      elements
        .status
        .textContent =
          message;
    }
  }

  function normalizeText(
    value
  ) {
    return String(
      value ||
      ''
    )
      .trim()
      .toLowerCase();
  }

  function prefersReducedMotion() {
    return window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }

  function escapeHtml(
    value
  ) {
    return String(value)
      .replaceAll(
        '&',
        '&amp;'
      )
      .replaceAll(
        '<',
        '&lt;'
      )
      .replaceAll(
        '>',
        '&gt;'
      )
      .replaceAll(
        '"',
        '&quot;'
      )
      .replaceAll(
        "'",
        '&#039;'
      );
  }
})();