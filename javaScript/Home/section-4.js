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

  /*
    Every unique database title is used.

    Ordinary titles are divided evenly between the left and right streams.

    Attack on Titan appears once in each stream.

    The animation distance remains fixed, so adding more titles makes the
    rain denser without making the scrolling animation longer.
  */
  const PIN_DISTANCE =
    4200;

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
        'Kai gives it 9/10 because the emotional decisions remain powerful and memorable. The characters feel vulnerable even during the largest moments. Some middle sections feel crowded, but the consequences keep the story grounded.',

      quotes: [
        {
          text:
            'Fear can be present and a choice can still be yours.',

          note:
            'This stays with Kai because the series rarely treats courage as the absence of fear. The characters often move while they are still uncertain or overwhelmed. That makes their decisions feel human rather than simply heroic.'
        },
        {
          text:
            'Freedom can become another kind of burden.',

          note:
            'Kai connects this idea to characters who imagine freedom as a final destination. When they move closer to it, they also gain responsibility and uncertainty. Escaping one limit does not automatically remove every internal pressure.'
        },
        {
          text:
            'Being believed in can change what courage looks like.',

          note:
            'The quieter relationships matter because support often arrives before a character can support themselves. Trust does not remove fear, but it can give someone a reason to move through it. Kai remembers courage as something people help build together.'
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
            'His curiosity and empathy turn intelligence into a form of bravery. He continues thinking when everyone else is overwhelmed. His confidence grows without completely replacing his sensitivity.'
        },
        {
          rank:
            2,

          name:
            'Mikasa Ackerman',

          imageUrl:
            '',

          reason:
            'Her loyalty is powerful, but its emotional cost is what stays with Kai. She is extremely capable while still being shaped by fear and attachment. That conflict is more interesting than her physical strength alone.'
        },
        {
          rank:
            3,

          name:
            'Levi Ackerman',

          imageUrl:
            '',

          reason:
            'His control is impressive, but the grief underneath it matters more. He carries the consequences of decisions with no completely good outcome. His restraint makes the smaller signs of care feel stronger.'
        }
      ],

      thoughts: {
        title:
          'Freedom matters most when fear is no longer making every decision.',

        text:
          'Kai remembers the series through small emotional decisions inside enormous events: a pause before answering, a promise made under pressure, or the moment someone moves while still afraid. Freedom is never presented as a simple place that can finally be reached, because every character carries fear, love, guilt, expectation, and responsibility with them even after an external wall disappears. The relationships matter because courage is rarely created alone; characters borrow confidence from one another, disappoint one another, and sometimes continue only because another person believed they could. Kai leaves the story thinking about how easily fear can make decisions for someone without them noticing, and how real freedom begins when a person recognizes that pressure and still chooses what kind of person to become.'
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
        'Nova gives it 10/10 because perspective continually changes the meaning of earlier events. History, identity, duty, and responsibility remain connected throughout the story. New information changes how earlier decisions must be judged.',

      quotes: [
        {
          text:
            'The world changes when the story around it changes.',

          note:
            'Nova saves this because new information repeatedly rebuilds what the audience thinks it understands. The physical world may stay the same while its meaning changes. Earlier actions can appear heroic, cruel, necessary, or avoidable depending on who explains them.'
        },
        {
          text:
            'Understanding a side does not erase what that side has done.',

          note:
            'The series is strongest when empathy and accountability are allowed to exist together. Learning why someone acted does not remove the damage they caused. Refusing to understand the conditions behind that action can also make future harm more likely.'
        },
        {
          text:
            'An enemy can be created long before two people meet.',

          note:
            'Inherited stories can turn fear into identity before personal experience has a chance. People are taught what another group represents and which suffering matters. By the time two individuals meet, they may already be carrying generations of expectations.'
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
            'He brings duty, identity, guilt, and survival into the same conflict. He is responsible for serious harm while also being shaped by a system that defined him early. That makes him both accountable and trapped.'
        },
        {
          rank:
            2,

          name:
            'Erwin Smith',

          imageUrl:
            '',

          reason:
            'His leadership makes sacrifice, truth, and obsession difficult to separate. He can inspire people while using their lives to move closer to an answer he personally needs. His public purpose and private motive are never identical.'
        },
        {
          rank:
            3,

          name:
            'Historia Reiss',

          imageUrl:
            '',

          reason:
            'Her growth turns an inherited role into a question of self-definition. She has to decide whether kindness means obeying what others need or choosing honestly for herself. Her personal identity is tied directly to political responsibility.'
        }
      ],

      thoughts: {
        title:
          'The most dangerous wall is the story that makes cruelty feel necessary.',

        text:
          'Nova reads the series as a study of systems rather than only individual heroes and enemies, because every personal decision happens inside inherited histories, institutions, military structures, and repeated stories about who deserves safety. Perspective changes the meaning of nearly everything: the same event can become liberation, invasion, revenge, protection, or tragedy depending on who remembers it and who is allowed to explain it. Responsibility becomes difficult because people can cause harm while also being shaped by forces larger than themselves, so understanding those forces is necessary without allowing understanding to become an automatic excuse. The lasting question is what a person should do after learning that their identity, duty, enemy, and history were built from incomplete information, and Nova sees that realization as the beginning of responsibility rather than the end of the argument.'
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

      formationLayers:
        section.querySelector(
          '.s4-card-formation-layers'
        ),

      continueCue:
        section.querySelector(
          '[data-continue-cue]'
        ),

      storyContent:
        section.querySelector(
          '[data-story-content]'
        ),

      contentIntro:
        section.querySelector(
          '.s4-content-intro'
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
    const result =
      await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .limit(500);

    if (
      result.error
    ) {
      throw result.error;
    }

    return dedupeStories(
      normalizeStoryRows(
        result.data ||
        []
      )
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
      // Plain text is valid.
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

    const chosenKey =
      storyKey(
        chosenStory
      );

    const ordinaryPool =
      dedupeStories(
        storyPool.filter(
          (story) => {
            return (
              storyKey(story) !==
              chosenKey
            );
          }
        )
      );

    const shuffled =
      seededShuffle(
        ordinaryPool,
        hashString(
          `${chosenStory.title}-all-rain-v5`
        )
      );

    /*
      Every ordinary title is used exactly once.

      When the ordinary title count is odd, the left side receives one
      additional ordinary cover.
    */
    const leftOrdinaryCount =
      Math.ceil(
        shuffled.length /
        2
      );

    const leftOrdinary =
      shuffled.slice(
        0,
        leftOrdinaryCount
      );

    const rightOrdinary =
      shuffled.slice(
        leftOrdinaryCount
      );

    const chosenLeftIndex =
      Math.min(
        leftOrdinary.length,
        Math.max(
          1,
          Math.floor(
            (
              leftOrdinary.length +
              1
            ) *
            0.44
          )
        )
      );

    const chosenRightIndex =
      Math.min(
        rightOrdinary.length,
        Math.max(
          1,
          Math.floor(
            (
              rightOrdinary.length +
              1
            ) *
            0.56
          )
        )
      );

    const leftStories =
      insertChosenStory(
        leftOrdinary,
        chosenStory,
        chosenLeftIndex
      );

    const rightStories =
      insertChosenStory(
        rightOrdinary,
        chosenStory,
        chosenRightIndex
      );

    leftStories.forEach(
      (
        story,
        index
      ) => {
        elements
          .rainLeft
          .appendChild(
            createRainItem(
              story,
              'left',
              index,
              storyKey(story) ===
                chosenKey
            )
          );
      }
    );

    rightStories.forEach(
      (
        story,
        index
      ) => {
        elements
          .rainRight
          .appendChild(
            createRainItem(
              story,
              'right',
              index,
              storyKey(story) ===
                chosenKey
            )
          );
      }
    );
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
          storyKey(
            story
          );

        if (
          !key ||
          seen.has(key)
        ) {
          return false;
        }

        seen.add(
          key
        );

        return true;
      });
  }

  function storyKey(
    story
  ) {
    return normalizeText(
      story?.title
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
        copy.length -
        1;
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

    return (
      hash >>>
      0
    );
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

    /*
      Compact repeating positions deliberately create controlled overlap.
    */
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
      49
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
      7
    ];

    const coverWidths = [
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
      93
    ];

    const positions =
      side ===
      'left'
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
      String(
        itemIndex
      );

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
          5
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
          `Average of Kai's ${READERS.kai.score} and Nova's ${READERS.nova.score}. Focus either profile to see the reason behind that reader's score.`;

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
          <p>
            ${escapeHtml(reader.thoughts.text)}
          </p>
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

        const rainCleanup =
          createPinnedTimeline(
            section,
            elements,
            gsap
          );

        const contentCleanup =
          createContentReveal(
            elements,
            gsap
          );

        return () => {
          rainCleanup?.();
          contentCleanup?.();
        };
      }
    );
  }

  function createContentReveal(
    elements,
    gsap
  ) {
    const reveal =
      gsap.timeline({
        scrollTrigger: {
          trigger:
            elements.storyContent,

          start:
            'top 94%',

          once:
            true
        }
      });

    reveal.fromTo(
      elements.sharedCard,
      {
        autoAlpha: 0,

        y: 34,

        scale: 0.94
      },
      {
        autoAlpha: 1,

        y: 0,

        scale: 1,

        duration: 0.56,

        ease:
          'power2.out'
      }
    );

    reveal.fromTo(
      elements.contentIntro,
      {
        autoAlpha: 0,

        y: 14
      },
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.34,

        ease:
          'power2.out'
      },
      '-=0.28'
    );

    reveal.fromTo(
      elements.profileButtons,
      {
        autoAlpha: 0,

        y: 22,

        scale: 0.98
      },
      {
        autoAlpha: 1,

        y: 0,

        scale: 1,

        duration: 0.4,

        stagger: 0.08,

        ease:
          'power2.out'
      },
      '-=0.16'
    );

    reveal.fromTo(
      elements.readerContents,
      {
        autoAlpha: 0,

        y: 26
      },
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.5,

        stagger: 0.08,

        ease:
          'power2.out'
      },
      '-=0.22'
    );

    return () => {
      reveal
        .scrollTrigger
        ?.kill();

      reveal.kill();
    };
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

    const maxStreamCount =
      Math.max(
        leftItems.length,
        rightItems.length,
        1
      );

    const viewportHeight =
      () => {
        return (
          elements
            .cinematic
            .clientHeight
        );
      };

    /*
      Adding more covers decreases the stagger.

      The overall animation duration and PIN_DISTANCE remain unchanged.
    */
    const rainStart =
      0.12;

    const rainWindowEnd =
      2.72;

    const travelDuration =
      1.24;

    const availableStaggerWindow =
      rainWindowEnd -
      rainStart -
      travelDuration;

    const streamStagger =
      maxStreamCount > 1
        ? Math.min(
            0.16,
            Math.max(
              0.006,
              availableStaggerWindow /
              (
                maxStreamCount -
                1
              )
            )
          )
        : 0;

    const chosenArrivalTime =
      2.76;

    const mergeTime =
      3.68;

    const formationTime =
      3.92;

    const dockTime =
      4.48;

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

    gsap.set(
      [
        ...leftItems,
        ...rightItems
      ],
      {
        autoAlpha:
          0
      }
    );

    gsap.set(
      elements.selectionCopy,
      {
        autoAlpha:
          0,

        y:
          12
      }
    );

    gsap.set(
      elements.continueCue,
      {
        autoAlpha:
          0,

        y:
          12
      }
    );

    gsap.set(
      elements.cardFormation,
      {
        autoAlpha:
          0,

        xPercent:
          -50,

        yPercent:
          -50,

        y:
          18,

        scale:
          0.86
      }
    );

    gsap.set(
      elements.formationCover,
      {
        autoAlpha:
          0,

        scale:
          1.08,

        rotation:
          -2
      }
    );

    if (
      elements.formationLayers
    ) {
      gsap.set(
        elements.formationLayers,
        {
          autoAlpha:
            0,

          y:
            10
        }
      );
    }

    function streamStartTime(
      item
    ) {
      const itemIndex =
        Number(
          item
            .dataset
            .rainIndex ||
          0
        );

      return (
        rainStart +
        itemIndex *
        streamStagger
      );
    }

    regularLeft.forEach(
      (
        item,
        index
      ) => {
        const startTime =
          streamStartTime(
            item
          );

        const rotation =
          -8 +
          (
            index %
            5
          ) *
          3.4;

        timeline.fromTo(
          item,
          {
            y: () => {
              return (
                -item.offsetHeight -
                90 -
                (
                  index %
                  4
                ) *
                34
              );
            },

            rotation,

            scale:
              0.9 +
              (
                index %
                3
              ) *
              0.045,

            autoAlpha:
              0
          },
          {
            y: () => {
              return (
                viewportHeight() +
                item.offsetHeight +
                105 +
                (
                  index %
                  4
                ) *
                34
              );
            },

            rotation:
              -rotation *
              0.5,

            autoAlpha:
              1,

            duration:
              travelDuration,

            ease:
              'none'
          },
          startTime
        );

        timeline.to(
          item,
          {
            autoAlpha:
              0,

            duration:
              0.12
          },
          startTime +
          travelDuration -
          0.1
        );
      }
    );

    regularRight.forEach(
      (
        item,
        index
      ) => {
        const startTime =
          streamStartTime(
            item
          );

        const rotation =
          8 -
          (
            index %
            5
          ) *
          3.4;

        timeline.fromTo(
          item,
          {
            y: () => {
              return (
                viewportHeight() +
                item.offsetHeight +
                90 +
                (
                  index %
                  4
                ) *
                34
              );
            },

            rotation,

            scale:
              0.9 +
              (
                index %
                3
              ) *
              0.045,

            autoAlpha:
              0
          },
          {
            y: () => {
              return (
                -item.offsetHeight -
                105 -
                (
                  index %
                  4
                ) *
                34
              );
            },

            rotation:
              -rotation *
              0.5,

            autoAlpha:
              1,

            duration:
              travelDuration,

            ease:
              'none'
          },
          startTime
        );

        timeline.to(
          item,
          {
            autoAlpha:
              0,

            duration:
              0.12
          },
          startTime +
          travelDuration -
          0.1
        );
      }
    );

    const chosenLeftStart =
      streamStartTime(
        chosenLeft
      );

    const chosenRightStart =
      streamStartTime(
        chosenRight
      );

    timeline.fromTo(
      chosenLeft,
      {
        y: () => {
          return (
            -chosenLeft.offsetHeight -
            120
          );
        },

        rotation:
          -7,

        scale:
          0.92,

        autoAlpha:
          0
      },
      {
        y: () => {
          return (
            viewportHeight() *
            0.46 -
            chosenLeft.offsetHeight /
            2
          );
        },

        rotation:
          -3,

        scale:
          1,

        autoAlpha:
          1,

        duration:
          Math.max(
            0.55,
            chosenArrivalTime -
            chosenLeftStart
          ),

        ease:
          'none'
      },
      chosenLeftStart
    );

    timeline.fromTo(
      chosenRight,
      {
        y: () => {
          return (
            viewportHeight() +
            chosenRight.offsetHeight +
            120
          );
        },

        rotation:
          7,

        scale:
          0.92,

        autoAlpha:
          0
      },
      {
        y: () => {
          return (
            viewportHeight() *
            0.54 -
            chosenRight.offsetHeight /
            2
          );
        },

        rotation:
          3,

        scale:
          1,

        autoAlpha:
          1,

        duration:
          Math.max(
            0.55,
            chosenArrivalTime -
            chosenRightStart
          ),

        ease:
          'none'
      },
      chosenRightStart
    );

    timeline.to(
      elements.cinematicCopy,
      {
        autoAlpha:
          0,

        y:
          -42,

        duration:
          0.38
      },
      1.62
    );

    timeline.to(
      [
        ...regularLeft,
        ...regularRight
      ],
      {
        autoAlpha:
          0.1,

        duration:
          0.28
      },
      chosenArrivalTime -
      0.12
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight
      ],
      {
        borderColor:
          'rgba(225,229,255,0.84)',

        boxShadow:
          '0 38px 90px rgba(0,0,0,.62), 0 0 72px rgba(155,124,255,.44), 0 0 0 2px rgba(255,255,255,.12)',

        scale:
          1.13,

        duration:
          0.22,

        ease:
          'power2.out'
      },
      chosenArrivalTime
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
          1.25,

        duration:
          0.68,

        ease:
          'power2.inOut'
      },
      chosenArrivalTime +
      0.18
    );

    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha:
          1,

        y:
          0,

        duration:
          0.22
      },
      chosenArrivalTime +
      0.48
    );

    timeline.to(
      chosenRight,
      {
        autoAlpha:
          0,

        scale:
          1.38,

        duration:
          0.18
      },
      mergeTime
    );

    timeline.fromTo(
      chosenLeft,
      {
        scale:
          1.25
      },
      {
        scale:
          1.42,

        duration:
          0.14,

        ease:
          'power2.out'
      },
      mergeTime
    );

    timeline.to(
      chosenLeft,
      {
        scale:
          1.3,

        duration:
          0.16,

        ease:
          'power2.inOut'
      },
      mergeTime +
      0.14
    );

    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha:
          0,

        y:
          -10,

        duration:
          0.16
      },
      mergeTime +
      0.08
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
          0.42,

        ease:
          'power2.out'
      },
      formationTime
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
          0.32,

        ease:
          'power2.out'
      },
      formationTime +
      0.06
    );

    timeline.to(
      chosenLeft,
      {
        autoAlpha:
          0,

        scale:
          1.46,

        duration:
          0.22,

        ease:
          'power2.out'
      },
      formationTime
    );

    if (
      elements.formationLayers
    ) {
      timeline.to(
        elements.formationLayers,
        {
          autoAlpha:
            1,

          y:
            0,

          duration:
            0.28,

          ease:
            'power2.out'
        },
        formationTime +
        0.22
      );
    }

    /*
      The formed card moves toward the top and stays visible instead of
      disappearing.
    */
    timeline.to(
      elements.cardFormation,
      {
        y: () => {
          return getDockY(
            elements.cardFormation,
            elements.cinematic
          );
        },

        scale:
          0.9,

        borderRadius:
          21,

        duration:
          dockTime -
          formationTime,

        ease:
          'power2.inOut'
      },
      formationTime
    );

    timeline.to(
      elements.continueCue,
      {
        autoAlpha:
          1,

        y:
          0,

        duration:
          0.24
      },
      dockTime -
      0.02
    );

    /*
      Hold the card on screen until the pinned scene ends.
    */
    timeline.to(
      elements.cardFormation,
      {
        autoAlpha:
          1,

        scale:
          0.9,

        duration:
          1.08,

        ease:
          'none'
      },
      dockTime
    );

    timeline.to(
      elements.continueCue,
      {
        autoAlpha:
          0.88,

        duration:
          1.02,

        ease:
          'none'
      },
      dockTime
    );

    return () => {
      timeline
        .scrollTrigger
        ?.kill();

      timeline.kill();
    };
  }

  function getDockY(
    card,
    stage
  ) {
    const navOffset =
      82;

    return (
      navOffset +
      card.offsetHeight /
      2 -
      stage.clientHeight /
      2
    );
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