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

  const PIN_DISTANCE =
    4300;

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

      quoteHeading:
        '3 quotes — the characters’ inner world',

      ratingReason:
        'Kai gives it 9/10 because the emotional decisions remain powerful and memorable. The characters feel vulnerable even during the largest moments. Some middle sections feel crowded, but the consequences keep the story grounded.',

      quotes: [
        {
          theme:
            'Freedom',

          author:
            'Eren Yeager',

          size:
            'long',

          paragraphs: [
            'Ever since the day we were born... every single one of us is free.',

            "It doesn't matter how strong those who would deny us that freedom are.",

            "Flaming water, frozen earth... I don't care what it is! The one who sees them will be the freest person in the entire world!",

            "Fight! Who cares if you lose your life? The world is a terrible place, but I don't care!",

            'Because I was born into this world!'
          ],

          detail:
            'Kai reads this as the clearest expression of Eren’s earliest idea of freedom: not safety, comfort, or permission, but the right to keep moving toward a world someone else says is unreachable. The speech is inspiring and unsettling at the same time because that desire can create courage while also becoming absolute.'
        },

        {
          theme:
            'Beauty and cruelty',

          author:
            'Mikasa Ackerman',

          size:
            'short',

          paragraphs: [
            "This world is cruel... but it's also very beautiful."
          ],

          detail:
            'Kai keeps this quote because it allows two truths to remain present together. The series never asks beauty to erase suffering, and it never lets suffering make every loving or beautiful moment meaningless.'
        },

        {
          theme:
            'Doubt',

          author:
            'Eren Yeager',

          size:
            'short',

          paragraphs: [
            'If we kill all our enemies over there… will we finally be free?'
          ],

          detail:
            'The question changes freedom from a destination into a moral problem. Kai sees this as the moment the dream beyond the walls stops being simple, because reaching the ocean does not remove fear, enemies, memory, or responsibility.'
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
            'His curiosity and empathy turn intelligence into a form of bravery. He continues thinking when everyone else is overwhelmed.',

          details:
            'Armin’s strength is not certainty. It is his willingness to keep imagining another option when fear makes every path look closed. Kai values how his confidence grows without completely replacing his sensitivity, doubt, or awareness of what decisions cost other people.'
        },

        {
          rank:
            2,

          name:
            'Mikasa Ackerman',

          imageUrl:
            '',

          reason:
            'Her loyalty is powerful, but its emotional cost is what stays with Kai. She is extremely capable while still being shaped by fear and attachment.',

          details:
            'Mikasa can survive almost anything physically, yet her most difficult conflicts are emotional. Kai sees her story as a struggle to distinguish love from fear, loyalty from identity, and protecting someone from allowing that person to decide who she must become.'
        },

        {
          rank:
            3,

          name:
            'Levi Ackerman',

          imageUrl:
            '',

          reason:
            'His control is impressive, but the grief underneath it matters more. He carries decisions that have no completely good outcome.',

          details:
            'Levi’s restraint makes every small sign of care feel stronger. Kai remembers the way he continues after loss without pretending that sacrifice becomes acceptable simply because it was necessary. His discipline is less about being untouched and more about functioning while carrying what cannot be repaired.'
        }
      ],

      thoughts: {
        title:
          'Freedom matters most when fear is no longer making every decision.',

        preview:
          'Kai remembers the series through small emotional decisions inside enormous events: a pause before answering, a promise made under pressure, or the moment someone moves while still afraid.',

        paragraphs: [
          'Kai remembers the series through small emotional decisions inside enormous events: a pause before answering, a promise made under pressure, or the moment someone moves while still afraid.',

          'Freedom is never presented as a simple place that can finally be reached, because every character carries fear, love, guilt, expectation, and responsibility with them even after an external wall disappears.',

          'The relationships matter because courage is rarely created alone. Characters borrow confidence from one another, disappoint one another, and sometimes continue only because another person believed they could.',

          'Kai leaves the story thinking about how easily fear can make decisions for someone without them noticing, and how real freedom begins when a person recognizes that pressure and still chooses what kind of person to become.'
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

      quoteHeading:
        '3 quotes — the series’ larger message',

      ratingReason:
        'Nova gives it 10/10 because perspective continually changes the meaning of earlier events. History, identity, duty, and responsibility remain connected throughout the story. New information changes how earlier decisions must be judged.',

      quotes: [
        {
          theme:
            'Desire',

          author:
            'Kenny Ackerman',

          size:
            'medium',

          paragraphs: [
            'Everybody I met was all the same. Drinking, women, worshiping God, even family... The king, dreams, children, power...',

            "Everyone had to be drunk on somethin' to keep pushing on.",

            "Everyone was a slave to somethin'. Even him..."
          ],

          detail:
            'Nova reads this as one of the series’ sharpest summaries of motivation. People call their pursuits duty, love, faith, ambition, or survival, but those pursuits can still become dependencies that organize identity and justify harm. Kenny’s observation also refuses to place one supposedly free person outside the pattern.'
        },

        {
          theme:
            'Inherited violence',

          author:
            'Mr. Braus',

          size:
            'medium',

          paragraphs: [
            "At the very least, we need to keep the children out of this forest. Otherwise, the exact same things will just keep happening. It's up to us adults to shoulder the sins of the past."
          ],

          detail:
            'Nova sees the forest as a way of describing inherited conflict. Children enter systems, prejudices, and debts they did not create. The adults’ responsibility is not merely to explain the cycle, but to absorb enough of its cost that the next generation is not forced to repeat it.'
        },

        {
          theme:
            'Truth and belief',

          author:
            'Eren Kruger',

          size:
            'medium',

          paragraphs: [
            'The only truth in this world is that there is no truth. That is our reality. Anyone can become a god or a devil. All it takes is for people to believe it.'
          ],

          detail:
            'Nova keeps this quote because the story repeatedly shows public truth being built through memory, authority, fear, and repetition. The line does not mean facts are irrelevant; it warns that a person’s social meaning can be transformed when enough people accept a story about them.'
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
            'He brings duty, identity, guilt, and survival into the same conflict. He is responsible for serious harm while also being shaped by a system that defined him early.',

          details:
            'Nova values Reiner because accountability and conditioning are allowed to exist together. His actions cannot be erased, but understanding the machinery that formed him reveals how states turn children into symbols, weapons, and enemies before they can understand the roles they have been given.'
        },

        {
          rank:
            2,

          name:
            'Erwin Smith',

          imageUrl:
            '',

          reason:
            'His leadership makes sacrifice, truth, and obsession difficult to separate. His public purpose and private motive are never identical.',

          details:
            'Erwin can inspire people while using their lives to move closer to an answer he personally needs. Nova sees him as a study of how leadership can be sincere and self-serving at once, and how a noble goal does not automatically purify the methods used to reach it.'
        },

        {
          rank:
            3,

          name:
            'Historia Reiss',

          imageUrl:
            '',

          reason:
            'Her growth turns an inherited role into a question of self-definition. Her personal identity is tied directly to political responsibility.',

          details:
            'Historia has to decide whether kindness means performing the identity other people need or living honestly enough to choose for herself. Nova remembers how her private struggle becomes political, showing that institutions often depend on individuals accepting stories written for them.'
        }
      ],

      thoughts: {
        title:
          'The most dangerous wall is the story that makes cruelty feel necessary.',

        preview:
          'Nova reads the series as a study of systems rather than only individual heroes and enemies, because every personal decision happens inside inherited histories and institutions.',

        paragraphs: [
          'Nova reads the series as a study of systems rather than only individual heroes and enemies, because every personal decision happens inside inherited histories, institutions, military structures, and repeated stories about who deserves safety.',

          'Perspective changes the meaning of nearly everything. The same event can become liberation, invasion, revenge, protection, or tragedy depending on who remembers it and who is allowed to explain it.',

          'Responsibility becomes difficult because people can cause harm while also being shaped by forces larger than themselves. Understanding those forces is necessary without allowing understanding to become an automatic excuse.',

          'The lasting question is what a person should do after learning that their identity, duty, enemy, and history were built from incomplete information. Nova sees that realization as the beginning of responsibility rather than the end of the argument.'
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
      collectElements(
        section
      );

    setupReaderExperience(
      elements
    );

    setupDetailDialog(
      elements
    );

    if (
      !window.supabase?.createClient
    ) {
      console.warn(
        'Section 4: Supabase is not loaded. Showing the static fallback.'
      );

      renderStory(
        section,
        FALLBACK_STORY
      );

      showStaticLayout(
        section,
        elements
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
        section,
        elements
      );
    }
  }

  function collectElements(
    section
  ) {
    return {
      section,

      stage:
        section.querySelector(
          '[data-s4-stage]'
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

      sharedCardWrap:
        section.querySelector(
          '[data-shared-card-wrap]'
        ),

      sharedCard:
        section.querySelector(
          '[data-shared-card]'
        ),

      cardCover:
        section.querySelector(
          '[data-card-cover]'
        ),

      cardLayers:
        section.querySelector(
          '[data-card-layers]'
        ),

      contentIntro:
        section.querySelector(
          '[data-content-intro]'
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

      handoff:
        section.querySelector(
          '[data-cover-handoff]'
        ),

      handoffImage:
        section.querySelector(
          '[data-handoff-image]'
        ),

      handoffFallback:
        section.querySelector(
          '[data-handoff-fallback]'
        ),

      dialog:
        section.querySelector(
          '[data-detail-dialog]'
        ),

      dialogClose:
        section.querySelector(
          '[data-detail-close]'
        ),

      dialogEyebrow:
        section.querySelector(
          '[data-detail-eyebrow]'
        ),

      dialogTitle:
        section.querySelector(
          '[data-detail-title]'
        ),

      dialogBody:
        section.querySelector(
          '[data-detail-body]'
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
        .from(
          TABLE_NAME
        )
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
    return (
      rows ||
      []
    )
      .filter(
        (item) => {
          return (
            item &&
            item.id != null &&
            item.title
          );
        }
      )
      .map(
        normalizeStory
      )
      .filter(
        (story) => {
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
        }
      );
  }

  async function findChosenStory(
    storyPool
  ) {
    if (
      CHOSEN_STORY_ID
    ) {
      const idMatch =
        storyPool.find(
          (story) => {
            return (
              String(
                story.id
              ) ===
              String(
                CHOSEN_STORY_ID
              )
            );
          }
        );

      if (
        idMatch
      ) {
        return idMatch;
      }
    }

    const aliasKeys =
      CHOSEN_STORY_ALIASES
        .map(
          normalizeText
        );

    const poolMatch =
      storyPool.find(
        (story) => {
          return aliasKeys.includes(
            normalizeText(
              story.title
            )
          );
        }
      );

    if (
      poolMatch
    ) {
      return poolMatch;
    }

    for (
      const alias of
      CHOSEN_STORY_ALIASES
    ) {
      const result =
        await supabaseClient
          .from(
            TABLE_NAME
          )
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

        return (
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
          ) ||
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
      Array.isArray(
        value
      )
    ) {
      return value
        .map(
          String
        )
        .filter(
          Boolean
        );
    }

    if (
      !value
    ) {
      return [
        'Manga'
      ];
    }

    const text =
      String(
        value
      ).trim();

    try {
      const parsed =
        JSON.parse(
          text
        );

      if (
        Array.isArray(
          parsed
        )
      ) {
        return parsed
          .map(
            String
          )
          .filter(
            Boolean
          );
      }
    } catch (_) {
      // Plain text is valid.
    }

    return text
      .split(
        /[,/|]+/
      )
      .map(
        (part) => {
          return part.trim();
        }
      )
      .filter(
        Boolean
      );
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
        .from(
          BUCKET_NAME
        )
        .getPublicUrl(
          path
        );

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
      .forEach(
        (node) => {
          node.textContent =
            story.title;
        }
      );

    section
      .querySelectorAll(
        '[data-story-creator]'
      )
      .forEach(
        (node) => {
          node.textContent =
            story.creator ||
            'Unknown creator';
        }
      );

    section
      .querySelectorAll(
        '[data-story-format]'
      )
      .forEach(
        (node) => {
          node.textContent =
            formatType(
              story.type
            );
        }
      );

    section
      .querySelectorAll(
        '[data-story-cover]'
      )
      .forEach(
        (image) => {
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
        }
      );
  }

  function renderRain(
    elements,
    storyPool,
    chosenStory
  ) {
    if (
      !elements.rainLeft ||
      !elements.rainRight
    ) {
      return;
    }

    elements.rainLeft.innerHTML =
      '';

    elements.rainRight.innerHTML =
      '';

    const ordinaryPool =
      dedupeStories(
        storyPool.filter(
          (story) => {
            return (
              !isChosenStoryTitle(
                story.title
              )
            );
          }
        )
      );

    const shuffled =
      seededShuffle(
        ordinaryPool,
        hashString(
          `${chosenStory.title}-section-four-rain`
        )
      );

    const leftCount =
      Math.ceil(
        shuffled.length /
        2
      );

    const leftOrdinary =
      shuffled.slice(
        0,
        leftCount
      );

    const rightOrdinary =
      shuffled.slice(
        leftCount
      );

    const leftStories =
      insertChosenStory(
        leftOrdinary,
        chosenStory,
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

    const rightStories =
      insertChosenStory(
        rightOrdinary,
        chosenStory,
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

    leftStories.forEach(
      (
        story,
        index
      ) => {
        elements.rainLeft.appendChild(
          createRainItem(
            story,
            'left',
            index,
            isChosenStoryTitle(
              story.title
            )
          )
        );
      }
    );

    rightStories.forEach(
      (
        story,
        index
      ) => {
        elements.rainRight.appendChild(
          createRainItem(
            story,
            'right',
            index,
            isChosenStoryTitle(
              story.title
            )
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
    const result = [
      ...stories
    ];

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

  function isChosenStoryTitle(
    title
  ) {
    const key =
      normalizeText(
        title
      );

    return CHOSEN_STORY_ALIASES.some(
      (alias) => {
        return (
          normalizeText(
            alias
          ) ===
          key
        );
      }
    );
  }

  function dedupeStories(
    stories
  ) {
    const seen =
      new Set();

    return (
      stories ||
      []
    ).filter(
      (story) => {
        const key =
          normalizeText(
            story?.title
          );

        if (
          !key ||
          seen.has(
            key
          )
        ) {
          return false;
        }

        seen.add(
          key
        );

        return true;
      }
    );
  }

  function seededShuffle(
    stories,
    seed
  ) {
    const copy = [
      ...stories
    ];

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
      String(
        value ||
        ''
      )
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
        widths[
          itemIndex %
          widths.length
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
        (
          list ||
          []
        )
          .map(
            (item) => {
              return String(
                item
              ).trim();
            }
          )
          .filter(
            Boolean
          )
          .map(
            (item) => {
              return (
                item
                  .charAt(0)
                  .toUpperCase() +
                item
                  .slice(1)
                  .toLowerCase()
              );
            }
          )
      )
    ];

    return clean.length
      ? clean.join(' / ')
      : 'Manga / Anime';
  }

  function setupReaderExperience(
    elements
  ) {
    let activeLayer =
      'quotes';

    let focusMode =
      'both';

    let comparisonResizeTimer =
      null;

    fillProfileCards(
      elements.section
    );

    function renderBothSides() {
      elements.readerContents.forEach(
        (container) => {
          const readerId =
            container.dataset.readerContent;

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
              readerId,
              reader
            );
          } else if (
            activeLayer ===
            'characters'
          ) {
            renderCharacters(
              container,
              readerId,
              reader
            );
          } else {
            renderThoughts(
              container,
              readerId,
              reader
            );
          }

          animateContent(
            container
          );
        }
      );

      requestAnimationFrame(
        () => {
          fitComparisonToViewport(
            elements
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
        ].includes(
          layer
        )
      ) {
        return;
      }

      activeLayer =
        layer;

      elements.layerButtons.forEach(
        (button) => {
          const selected =
            button.dataset.layer ===
            layer;

          button.classList.toggle(
            'is-active',
            selected
          );

          button.setAttribute(
            'aria-pressed',
            String(
              selected
            )
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
        ].includes(
          mode
        )
      ) {
        return;
      }

      focusMode =
        mode;

      elements.compareStage.dataset.focus =
        focusMode;

      elements.profileButtons.forEach(
        (button) => {
          const selected =
            button.dataset.focusReader ===
            focusMode;

          button.setAttribute(
            'aria-pressed',
            String(
              selected
            )
          );
        }
      );

      elements.compareBoth.setAttribute(
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

        elements.readerStatus.textContent =
          READERS.kai.status;
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

        elements.readerStatus.textContent =
          READERS.nova.status;
      } else {
        const combinedScore =
          getCombinedScore();

        const combinedReason =
          `Average of Kai's ${READERS.kai.score} and Nova's ${READERS.nova.score}. ` +
          'Focus either profile to see the reason behind that reader’s score.';

        updateScoreDisplay(
          elements,
          combinedScore,
          `Average reader rating ${combinedScore}. Kai rated it ${READERS.kai.score} and Nova rated it ${READERS.nova.score}.`,
          combinedReason
        );

        elements.readerStatus.textContent =
          'Both completed';
      }

      requestAnimationFrame(
        () => {
          fitComparisonToViewport(
            elements
          );
        }
      );
    }

    elements.layerButtons.forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            setLayer(
              button.dataset.layer
            );
          }
        );
      }
    );

    elements.profileButtons.forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            const requested =
              button.dataset.focusReader;

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

    elements.compareBoth?.addEventListener(
      'click',
      () => {
        setFocus(
          'both'
        );
      }
    );

    window.addEventListener(
      'resize',
      () => {
        window.clearTimeout(
          comparisonResizeTimer
        );

        comparisonResizeTimer =
          window.setTimeout(
            () => {
              fitComparisonToViewport(
                elements
              );
            },
            120
          );
      },
      {
        passive: true
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
      elements.scoreText.textContent =
        visibleScore;
    }

    if (
      elements.score
    ) {
      elements.score.setAttribute(
        'aria-label',
        ariaLabel
      );

      elements.score.dataset.scoreTooltip =
        tooltip;
    }
  }

  function getCombinedScore() {
    const values = [
      READERS.kai.score,
      READERS.nova.score
    ]
      .map(
        Number.parseFloat
      )
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
    Object.entries(
      READERS
    ).forEach(
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
            } else {
              image.hidden =
                true;
            }
          };
      }
    );
  }

  function renderQuotes(
    container,
    readerId,
    reader
  ) {
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
          .map(
            (
              quote,
              index
            ) => {
              const quoteParagraphs =
                quote.paragraphs
                  .map(
                    (
                      paragraph,
                      paragraphIndex
                    ) => {
                      const openingMark =
                        paragraphIndex === 0
                          ? '“'
                          : '';

                      const closingMark =
                        paragraphIndex ===
                        quote.paragraphs.length - 1
                          ? '”'
                          : '';

                      return `
                        <p>
                          ${openingMark}${escapeHtml(paragraph)}${closingMark}
                        </p>
                      `;
                    }
                  )
                  .join('');

              return `
                <article
                  class="
                    s4-evidence-card
                    s4-quote-card
                    quote-${escapeHtml(quote.size)}
                    ${index === 0 ? 'is-featured' : ''}
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

                  <div class="s4-card-actions">
                    <button
                      class="s4-detail-button"
                      type="button"
                      data-open-detail
                      data-detail-type="quote"
                      data-reader-id="${escapeHtml(readerId)}"
                      data-item-index="${index}"
                    >
                      Reader's takeaway
                    </button>
                  </div>
                </article>
              `;
            }
          )
          .join('')}
      </div>
    `;

    prepareQuoteVisibility(
      container
    );
  }

  function prepareQuoteVisibility(
    container
  ) {
    container
      .querySelectorAll(
        '.s4-quote-card'
      )
      .forEach(
        (card) => {
          card.style.height =
            'auto';

          card.style.overflow =
            'visible';
        }
      );

    container
      .querySelectorAll(
        '.s4-quote-card blockquote'
      )
      .forEach(
        (blockquote) => {
          blockquote.style.display =
            'block';

          blockquote.style.overflow =
            'visible';

          blockquote.style.webkitLineClamp =
            'unset';

          blockquote.style.webkitBoxOrient =
            'initial';
        }
      );
  }

  function renderCharacters(
    container,
    readerId,
    reader
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
                  class="
                    s4-evidence-card
                    s4-character-card
                    ${index === 0 ? 'is-featured' : ''}
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

                    <div class="s4-card-actions">
                      <button
                        class="s4-detail-button"
                        type="button"
                        data-open-detail
                        data-detail-type="character"
                        data-reader-id="${escapeHtml(readerId)}"
                        data-item-index="${index}"
                      >
                        View character
                      </button>
                    </div>
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
      .forEach(
        (image) => {
          image.addEventListener(
            'error',
            () => {
              image.src =
                image.dataset.fallbackSrc;
            },
            {
              once: true
            }
          );
        }
      );
  }

  function renderThoughts(
    container,
    readerId,
    reader
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

      <article class="s4-evidence-card s4-thought-card">
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

  function setupDetailDialog(
    elements
  ) {
    const {
      section,
      dialog,
      dialogClose
    } =
      elements;

    if (
      !dialog ||
      !dialogClose
    ) {
      return;
    }

    let returnFocus =
      null;

    let preservedScrollX =
      0;

    let preservedScrollY =
      0;

    const restoreSectionPosition =
      () => {
        window.scrollTo(
          preservedScrollX,
          preservedScrollY
        );
      };

    section.addEventListener(
      'click',
      (event) => {
        const opener =
          event.target.closest(
            '[data-open-detail]'
          );

        if (
          !opener ||
          !section.contains(
            opener
          )
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        returnFocus =
          opener;

        preservedScrollX =
          window.scrollX;

        preservedScrollY =
          window.scrollY;

        openDetailWindow(
          elements,
          opener
        );

        restoreSectionPosition();

        requestAnimationFrame(
          () => {
            restoreSectionPosition();

            dialogClose.focus({
              preventScroll:
                true
            });
          }
        );

        window.setTimeout(
          restoreSectionPosition,
          40
        );

        window.setTimeout(
          restoreSectionPosition,
          120
        );
      }
    );

    dialogClose.addEventListener(
      'click',
      (event) => {
        event.preventDefault();

        closeDetailWindow(
          dialog
        );
      }
    );

    dialog.addEventListener(
      'click',
      (event) => {
        if (
          event.target ===
          dialog
        ) {
          closeDetailWindow(
            dialog
          );
        }
      }
    );

    dialog.addEventListener(
      'cancel',
      (event) => {
        event.preventDefault();

        closeDetailWindow(
          dialog
        );
      }
    );

    dialog.addEventListener(
      'close',
      () => {
        document.body.classList.remove(
          's4-dialog-open'
        );

        restoreSectionPosition();

        requestAnimationFrame(
          () => {
            restoreSectionPosition();

            if (
              returnFocus?.isConnected
            ) {
              returnFocus.focus({
                preventScroll:
                  true
              });
            }
          }
        );
      }
    );
  }

  function openDetailWindow(
    elements,
    opener
  ) {
    const type =
      opener.dataset.detailType;

    const readerId =
      opener.dataset.readerId;

    const index =
      Number(
        opener.dataset.itemIndex ||
        0
      );

    const reader =
      READERS[
        readerId
      ];

    if (
      !reader
    ) {
      return;
    }

    let eyebrow =
      reader.name;

    let title =
      '';

    let body =
      '';

    if (
      type ===
      'quote'
    ) {
      const quote =
        reader.quotes[
          index
        ];

      if (
        !quote
      ) {
        return;
      }

      eyebrow =
        `${reader.name} · ${quote.theme}`;

      title =
        `What ${reader.name} took from this quote`;

      body = `
        <div class="s4-detail-takeaway">
          <span class="s4-detail-takeaway-label">
            Reader reflection · ${escapeHtml(quote.author)}
          </span>

          <p>
            ${escapeHtml(quote.detail)}
          </p>
        </div>
      `;
    } else if (
      type ===
      'character'
    ) {
      const character =
        reader.characters[
          index
        ];

      if (
        !character
      ) {
        return;
      }

      const fallbackImage =
        createPortraitPlaceholder(
          character.name,
          reader.side
        );

      const imageUrl =
        character.imageUrl ||
        fallbackImage;

      eyebrow =
        `${reader.name} · reader pick #` +
        String(
          character.rank
        ).padStart(
          2,
          '0'
        );

      title =
        character.name;

      body = `
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

            <p>
              ${escapeHtml(character.reason)}
            </p>

            <p>
              ${escapeHtml(character.details)}
            </p>
          </div>
        </div>
      `;
    } else if (
      type ===
      'thought'
    ) {
      eyebrow =
        `${reader.name} · full reflection`;

      title =
        reader.thoughts.title;

      body =
        reader.thoughts.paragraphs
          .map(
            (paragraph) => {
              return `
                <p>
                  ${escapeHtml(paragraph)}
                </p>
              `;
            }
          )
          .join('');
    } else {
      return;
    }

    elements.dialogEyebrow.textContent =
      eyebrow;

    elements.dialogTitle.textContent =
      title;

    elements.dialogBody.innerHTML =
      body;

    const detailScroll =
      elements.dialog.querySelector(
        '.s4-detail-scroll'
      );

    if (
      detailScroll
    ) {
      detailScroll.scrollTop =
        0;
    }

    document.body.classList.add(
      's4-dialog-open'
    );

    if (
      typeof elements.dialog.showModal ===
      'function'
    ) {
      if (
        !elements.dialog.open
      ) {
        elements.dialog.showModal();
      }
    } else {
      elements.dialog.setAttribute(
        'open',
        ''
      );
    }
  }

  function closeDetailWindow(
    dialog
  ) {
    if (
      typeof dialog.close ===
      'function' &&
      dialog.open
    ) {
      dialog.close();

      return;
    }

    dialog.removeAttribute(
      'open'
    );

    document.body.classList.remove(
      's4-dialog-open'
    );
  }

  function fitComparisonToViewport(
    elements
  ) {
    const {
      section,
      stage,
      compareStage
    } =
      elements;

    if (
      !stage ||
      !compareStage
    ) {
      return;
    }

    const readerSides = [
      ...compareStage.querySelectorAll(
        '.s4-reader-side'
      )
    ];

    readerSides.forEach(
      (side) => {
        side.style.maxHeight =
          'none';

        side.style.overflow =
          'visible';

        side.style.overflowX =
          'visible';

        side.style.overflowY =
          'visible';

        side.style.scrollbarWidth =
          'none';
      }
    );

    const usesPinnedDesktop =
      window.matchMedia(
        '(min-width: 900px) and ' +
        '(min-height: 720px) and ' +
        '(prefers-reduced-motion: no-preference)'
      ).matches;

    if (
      !usesPinnedDesktop ||
      section.classList.contains(
        'is-static'
      )
    ) {
      compareStage.style.setProperty(
        '--s4-fit-scale',
        '1'
      );

      compareStage.style.scale =
        '1';

      return;
    }

    compareStage.style.setProperty(
      '--s4-fit-scale',
      '1'
    );

    compareStage.style.scale =
      '1';

    const stageStyles =
      window.getComputedStyle(
        stage
      );

    const compareTopValue =
      Number.parseFloat(
        stageStyles.getPropertyValue(
          '--s4-compare-top'
        )
      );

    const compareTop =
      Number.isFinite(
        compareTopValue
      )
        ? compareTopValue
        : compareStage.offsetTop;

    const readerHeight =
      Math.max(
        0,
        ...readerSides.map(
          (side) => {
            return Math.max(
              side.scrollHeight,
              side.offsetHeight
            );
          }
        )
      );

    const comparisonHeight =
      Math.max(
        compareStage.scrollHeight,
        compareStage.offsetHeight,
        readerHeight
      );

    const availableHeight =
      Math.max(
        1,
        stage.clientHeight -
        compareTop -
        10
      );

    const fittedScale =
      comparisonHeight >
      availableHeight
        ? availableHeight /
          comparisonHeight
        : 1;

    const safeScale =
      Math.min(
        1,
        fittedScale
      );

    compareStage.style.setProperty(
      '--s4-fit-scale',
      safeScale.toFixed(
        4
      )
    );

    compareStage.style.scale =
      safeScale.toFixed(
        4
      );
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
        .split(
          /\s+/
        )
        .filter(
          Boolean
        )
        .slice(
          0,
          2
        )
        .map(
          (part) => {
            return part
              .charAt(0)
              .toUpperCase();
          }
        )
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
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(
        svg
      )
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
          opacity:
            0.25,

          transform:
            'translateY(9px)'
        },

        {
          opacity:
            1,

          transform:
            'translateY(0)'
        }
      ],
      {
        duration:
          280,

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
        section,
        elements
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
          context.conditions.static
        ) {
          showStaticLayout(
            section,
            elements
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
  }

  function createPinnedTimeline(
    section,
    elements,
    gsap
  ) {
    const leftItems =
      gsap.utils.toArray(
        '[data-rain-side="left"]',
        elements.stage
      );

    const rightItems =
      gsap.utils.toArray(
        '[data-rain-side="right"]',
        elements.stage
      );

    const chosenLeft =
      elements.stage.querySelector(
        '[data-chosen-rain-cover="left"]'
      );

    const chosenRight =
      elements.stage.querySelector(
        '[data-chosen-rain-cover="right"]'
      );

    if (
      !chosenLeft ||
      !chosenRight ||
      !elements.sharedCardWrap ||
      !elements.cardCover ||
      !elements.handoff ||
      !elements.compareStage
    ) {
      showStaticLayout(
        section,
        elements
      );

      return undefined;
    }

    syncHandoffCover(
      chosenLeft,
      elements
    );

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
        return elements.stage.clientHeight;
      };

    const maximumCount =
      Math.max(
        leftItems.length,
        rightItems.length,
        1
      );

    const rainStart =
      0.08;

    const rainEnd =
      2.65;

    const travelDuration =
      1.2;

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
              (
                maximumCount -
                1
              )
            )
          )
        : 0;

    const chosenArrival =
      2.72;

    const centreTime =
      3.02;

    const cardRevealTime =
      3.72;

    const handoffEndTime =
      4.48;

    const cardDockTime =
      4.62;

    const comparisonTime =
      5.02;

    const DOCK_TOP =
      70;

    const DOCK_SCALE =
      0.79;

    const expandedCardHeight =
      elements.sharedCard
        .getBoundingClientRect()
        .height;

    function updateFinalLayoutMetrics() {
      const introHeight =
        Math.max(
          elements.contentIntro
            .getBoundingClientRect()
            .height,
          30
        );

      const cardVisualBottom =
        DOCK_TOP +
        expandedCardHeight *
        DOCK_SCALE;

      const introTop =
        Math.ceil(
          cardVisualBottom +
          12
        );

      const compareTop =
        Math.ceil(
          introTop +
          introHeight +
          10
        );

      elements.stage.style.setProperty(
        '--s4-intro-top',
        `${introTop}px`
      );

      elements.stage.style.setProperty(
        '--s4-compare-top',
        `${compareTop}px`
      );

      requestAnimationFrame(
        () => {
          fitComparisonToViewport(
            elements
          );
        }
      );
    }

    updateFinalLayoutMetrics();

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
      elements.sharedCardWrap,
      {
        autoAlpha:
          0,

        left:
          '50%',

        top:
          '50%',

        xPercent:
          -50,

        yPercent:
          -50,

        scale:
          1.03,

        pointerEvents:
          'none'
      }
    );

    gsap.set(
      elements.cardCover,
      {
        autoAlpha:
          0
      }
    );

    gsap.set(
      elements.handoff,
      {
        autoAlpha:
          0,

        x:
          0,

        y:
          0,

        width:
          100,

        height:
          150,

        rotation:
          0
      }
    );

    gsap.set(
      elements.cardLayers,
      {
        autoAlpha:
          0,

        height:
          0,

        marginTop:
          0,

        paddingTop:
          0,

        overflow:
          'hidden'
      }
    );

    gsap.set(
      elements.contentIntro,
      {
        autoAlpha:
          0,

        y:
          12
      }
    );

    gsap.set(
      elements.compareStage,
      {
        autoAlpha:
          0,

        y:
          24,

        pointerEvents:
          'none'
      }
    );

    gsap.set(
      elements.profileButtons,
      {
        autoAlpha:
          0,

        y:
          16
      }
    );

    gsap.set(
      elements.readerContents,
      {
        autoAlpha:
          0,

        y:
          20
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
            elements.stage,

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
            true,

          onRefreshInit:
            updateFinalLayoutMetrics,

          onRefresh:
            () => {
              fitComparisonToViewport(
                elements
              );
            }
        }
      });

    function getStartTime(
      item
    ) {
      const index =
        Number(
          item.dataset.rainIndex ||
          0
        );

      return (
        rainStart +
        index *
        stagger
      );
    }

    regularLeft.forEach(
      (
        item,
        index
      ) => {
        const startTime =
          getStartTime(
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
            y:
              () => {
                return (
                  -item.offsetHeight -
                  85 -
                  (
                    index %
                    4
                  ) *
                  30
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
            y:
              () => {
                return (
                  viewportHeight() +
                  item.offsetHeight +
                  95 +
                  (
                    index %
                    4
                  ) *
                  30
                );
              },

            rotation:
              rotation *
              -0.5,

            autoAlpha:
              1,

            duration:
              travelDuration
          },
          startTime
        );

        timeline.to(
          item,
          {
            autoAlpha:
              0,

            duration:
              0.1
          },
          startTime +
          travelDuration -
          0.08
        );
      }
    );

    regularRight.forEach(
      (
        item,
        index
      ) => {
        const startTime =
          getStartTime(
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
            y:
              () => {
                return (
                  viewportHeight() +
                  item.offsetHeight +
                  85 +
                  (
                    index %
                    4
                  ) *
                  30
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
            y:
              () => {
                return (
                  -item.offsetHeight -
                  95 -
                  (
                    index %
                    4
                  ) *
                  30
                );
              },

            rotation:
              rotation *
              -0.5,

            autoAlpha:
              1,

            duration:
              travelDuration
          },
          startTime
        );

        timeline.to(
          item,
          {
            autoAlpha:
              0,

            duration:
              0.1
          },
          startTime +
          travelDuration -
          0.08
        );
      }
    );

    const chosenLeftStart =
      getStartTime(
        chosenLeft
      );

    const chosenRightStart =
      getStartTime(
        chosenRight
      );

    timeline.fromTo(
      chosenLeft,
      {
        y:
          () => {
            return (
              -chosenLeft.offsetHeight -
              110
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
        y:
          () => {
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
            chosenArrival -
            chosenLeftStart
          )
      },
      chosenLeftStart
    );

    timeline.fromTo(
      chosenRight,
      {
        y:
          () => {
            return (
              viewportHeight() +
              chosenRight.offsetHeight +
              110
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
        y:
          () => {
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
            chosenArrival -
            chosenRightStart
          )
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
      1.58
    );

    timeline.to(
      [
        ...regularLeft,
        ...regularRight
      ],
      {
        autoAlpha:
          0.08,

        duration:
          0.28
      },
      chosenArrival -
      0.12
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight
      ],
      {
        scale:
          1.13,

        borderColor:
          'rgba(225,229,255,.84)',

        boxShadow:
          '0 38px 90px rgba(0,0,0,.62), ' +
          '0 0 72px rgba(155,124,255,.44), ' +
          '0 0 0 2px rgba(255,255,255,.12)',

        duration:
          0.22,

        ease:
          'power2.out'
      },
      chosenArrival
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight
      ],
      {
        x:
          (
            _index,
            item
          ) => {
            return getCenterTarget(
              item,
              elements.stage
            ).x;
          },

        y:
          (
            _index,
            item
          ) => {
            return getCenterTarget(
              item,
              elements.stage
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
      centreTime
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
      centreTime +
      0.3
    );

    timeline.set(
      elements.sharedCardWrap,
      {
        autoAlpha:
          1,

        scale:
          1.03
      },
      cardRevealTime
    );

    timeline.set(
      elements.handoff,
      {
        autoAlpha:
          1,

        x:
          () => {
            return getRelativeRect(
              chosenLeft,
              elements.stage
            ).left;
          },

        y:
          () => {
            return getRelativeRect(
              chosenLeft,
              elements.stage
            ).top;
          },

        width:
          () => {
            return getRelativeRect(
              chosenLeft,
              elements.stage
            ).width;
          },

        height:
          () => {
            return getRelativeRect(
              chosenLeft,
              elements.stage
            ).height;
          },

        borderRadius:
          '14px',

        rotation:
          0
      },
      cardRevealTime
    );

    timeline.to(
      chosenRight,
      {
        autoAlpha:
          0,

        scale:
          0.72,

        duration:
          0.24,

        ease:
          'power2.in'
      },
      cardRevealTime -
      0.12
    );

    timeline.to(
      chosenLeft,
      {
        autoAlpha:
          0,

        duration:
          0.08
      },
      cardRevealTime +
      0.03
    );

    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha:
          0,

        y:
          -8,

        duration:
          0.16
      },
      cardRevealTime -
      0.05
    );

    timeline.to(
      elements.handoff,
      {
        x:
          () => {
            return getRelativeRect(
              elements.cardCover,
              elements.stage
            ).left;
          },

        y:
          () => {
            return getRelativeRect(
              elements.cardCover,
              elements.stage
            ).top;
          },

        width:
          () => {
            return getRelativeRect(
              elements.cardCover,
              elements.stage
            ).width;
          },

        height:
          () => {
            return getRelativeRect(
              elements.cardCover,
              elements.stage
            ).height;
          },

        borderRadius:
          '14px',

        rotation:
          -1.2,

        duration:
          handoffEndTime -
          cardRevealTime,

        ease:
          'back.out(1.75)'
      },
      cardRevealTime
    );

    timeline.to(
      elements.handoff,
      {
        rotation:
          0,

        duration:
          0.14,

        ease:
          'power2.out'
      },
      handoffEndTime -
      0.14
    );

    timeline.to(
      elements.cardCover,
      {
        autoAlpha:
          1,

        duration:
          0.08
      },
      handoffEndTime -
      0.07
    );

    timeline.to(
      elements.handoff,
      {
        autoAlpha:
          0,

        duration:
          0.08
      },
      handoffEndTime -
      0.04
    );

    timeline.to(
      elements.sharedCardWrap,
      {
        top:
          `${DOCK_TOP}px`,

        yPercent:
          0,

        scale:
          DOCK_SCALE,

        duration:
          0.58,

        ease:
          'power2.inOut'
      },
      cardDockTime
    );

    timeline.to(
      elements.cardLayers,
      {
        autoAlpha:
          1,

        height:
          'auto',

        marginTop:
          '0.3rem',

        paddingTop:
          '0.38rem',

        duration:
          0.32,

        ease:
          'power2.out'
      },
      cardDockTime +
      0.36
    );

    timeline.to(
      elements.contentIntro,
      {
        autoAlpha:
          1,

        y:
          0,

        duration:
          0.26
      },
      comparisonTime
    );

    timeline.to(
      elements.compareStage,
      {
        autoAlpha:
          1,

        y:
          0,

        pointerEvents:
          'auto',

        duration:
          0.42,

        ease:
          'power2.out'
      },
      comparisonTime +
      0.08
    );

    timeline.to(
      elements.profileButtons,
      {
        autoAlpha:
          1,

        y:
          0,

        duration:
          0.34,

        stagger:
          0.08,

        ease:
          'power2.out'
      },
      comparisonTime +
      0.14
    );

    timeline.to(
      elements.readerContents,
      {
        autoAlpha:
          1,

        y:
          0,

        duration:
          0.42,

        stagger:
          0.08,

        ease:
          'power2.out'
      },
      comparisonTime +
      0.25
    );

    timeline.set(
      elements.sharedCardWrap,
      {
        pointerEvents:
          'auto'
      },
      comparisonTime +
      0.2
    );

    timeline.call(
      () => {
        fitComparisonToViewport(
          elements
        );
      },
      null,
      comparisonTime +
      0.45
    );

    timeline.to(
      {},
      {
        duration:
          1.15
      }
    );

    if (
      document.fonts?.ready
    ) {
      document.fonts.ready.then(
        () => {
          updateFinalLayoutMetrics();

          timeline.scrollTrigger?.refresh();
        }
      );
    }

    return () => {
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
          ...elements.readerContents
        ],
        {
          clearProps:
            'all'
        }
      );
    };
  }

  function syncHandoffCover(
    source,
    elements
  ) {
    const sourceImage =
      source.querySelector(
        'img'
      );

    const sourceFallback =
      source.querySelector(
        '[data-cover-fallback]'
      );

    elements.handoffFallback.textContent =
      sourceFallback?.textContent ||
      'Attack on Titan';

    elements.handoffFallback.hidden =
      false;

    elements.handoffImage.hidden =
      true;

    const sourceUrl =
      sourceImage?.currentSrc ||
      sourceImage?.src ||
      '';

    if (
      !sourceUrl
    ) {
      elements.handoffImage.removeAttribute(
        'src'
      );

      return;
    }

    elements.handoffImage.onload =
      () => {
        elements.handoffImage.hidden =
          false;

        elements.handoffFallback.hidden =
          true;
      };

    elements.handoffImage.onerror =
      () => {
        elements.handoffImage.hidden =
          true;

        elements.handoffFallback.hidden =
          false;
      };

    elements.handoffImage.src =
      sourceUrl;
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

  function getRelativeRect(
    element,
    relativeTo
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

      width:
        rect.width,

      height:
        rect.height
    };
  }

  function showStaticLayout(
    section,
    elements
  ) {
    section.classList.add(
      'is-static'
    );

    if (
      elements?.cardCover
    ) {
      elements.cardCover.style.opacity =
        '1';

      elements.cardCover.style.visibility =
        'visible';
    }

    if (
      elements?.sharedCardWrap
    ) {
      elements.sharedCardWrap.style.pointerEvents =
        'auto';
    }

    if (
      elements?.compareStage
    ) {
      elements.compareStage.style.pointerEvents =
        'auto';

      elements.compareStage.style.scale =
        '1';

      elements.compareStage.style.setProperty(
        '--s4-fit-scale',
        '1'
      );
    }

    requestAnimationFrame(
      () => {
        fitComparisonToViewport(
          elements
        );
      }
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

      const paragraph =
        elements.empty.querySelector(
          'p'
        );

      if (
        paragraph
      ) {
        paragraph.textContent =
          message;
      }
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
      elements.status.textContent =
        message;
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }

  function normalizeText(
    value
  ) {
    return String(
      value ||
      ''
    )
      .normalize(
        'NFKD'
      )
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        ' '
      )
      .trim();
  }

  function escapeHtml(
    value
  ) {
    return String(
      value ??
      ''
    )
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