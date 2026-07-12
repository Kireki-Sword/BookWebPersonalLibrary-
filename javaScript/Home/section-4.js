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

  const CHOSEN_STORY_ID = '';

  const CHOSEN_STORY_ALIASES = [
    'Attack on Titan',
    'Shingeki no Kyojin'
  ];

  const RAIN_PAIR_COUNT = 9;

  const PIN_DISTANCE = 2800;

  let supabaseClient = null;

  const READERS = {
    kai: {
      side: 'left',
      name: 'kai.reads',
      bio: 'remembers the feeling before the theory',
      initial: 'K',
      avatarUrl: '',
      score: '9/10',
      status: 'Completed',

      ratingReason:
        'Kai gives it 9/10 because the emotional choices stay memorable, even when the middle pacing feels crowded.',

      quotes: [
        {
          text:
            'Fear can be present and a choice can still be yours.',

          note:
            'This stays with Kai because the story repeatedly makes courage feel personal rather than superhuman.'
        },
        {
          text:
            'Freedom can become another kind of burden.',

          note:
            'Kai reads freedom as something characters must define for themselves, not simply reach.'
        },
        {
          text:
            'Being believed in can change what courage looks like.',

          note:
            'The quieter relationships matter to Kai because support often arrives before a character can support themselves.'
        }
      ],

      characters: [
        {
          rank: 1,
          name: 'Armin Arlert',
          imageUrl: '',

          reason:
            'I like how his curiosity and empathy turn intelligence into a form of bravery.'
        },
        {
          rank: 2,
          name: 'Mikasa Ackerman',
          imageUrl: '',

          reason:
            'Her loyalty is powerful, but the emotional cost of that loyalty is what stays with me.'
        },
        {
          rank: 3,
          name: 'Levi Ackerman',
          imageUrl: '',

          reason:
            'His control is impressive; the grief and responsibility underneath it are more interesting.'
        }
      ],

      thoughts: {
        title:
          'Freedom matters most when fear is no longer making every decision.',

        paragraphs: [
          'Kai remembers the series through small emotional decisions inside enormous events: a pause, a promise, or the moment someone acts while still afraid.',

          'The lasting idea is that freedom is not only reaching the other side of a wall. It is recognizing the pressure of fear, love, and expectation, then deciding what kind of person to be anyway.'
        ]
      }
    },

    nova: {
      side: 'right',
      name: 'nova.pages',
      bio: 'tracks themes, systems, and shifting truth',
      initial: 'N',
      avatarUrl: '',
      score: '10/10',
      status: 'Completed',

      ratingReason:
        'Nova gives it 10/10 for the way perspective, history, and responsibility keep changing the meaning of earlier events.',

      quotes: [
        {
          text:
            'The world changes when the story around it changes.',

          note:
            'Nova saves this because new information repeatedly rebuilds what the audience thinks it already understands.'
        },
        {
          text:
            'Understanding a side does not erase what that side has done.',

          note:
            'For Nova, the series is strongest when empathy and accountability are allowed to exist together.'
        },
        {
          text:
            'An enemy can be created long before two people meet.',

          note:
            'This captures how inherited stories can turn fear into identity before personal experience has a chance.'
        }
      ],

      characters: [
        {
          rank: 1,
          name: 'Reiner Braun',
          imageUrl: '',

          reason:
            'I am drawn to the collision between duty, identity, guilt, and the need to survive.'
        },
        {
          rank: 2,
          name: 'Erwin Smith',
          imageUrl: '',

          reason:
            'His leadership makes sacrifice, truth, and personal obsession impossible to separate.'
        },
        {
          rank: 3,
          name: 'Historia Reiss',
          imageUrl: '',

          reason:
            'Her growth turns an inherited role into a question of self-definition and responsibility.'
        }
      ],

      thoughts: {
        title:
          'The most dangerous wall is the story that makes cruelty feel necessary.',

        paragraphs: [
          'Nova reads the series as a study of systems: choices happen inside inherited histories, institutions, and repeated stories about who deserves safety.',

          'Its strongest question is not simply who is right. It is how someone should act after learning that their identity, enemy, duty, and history were built from incomplete information.'
        ]
      }
    }
  };

  const FALLBACK_STORY = {
    id: '',

    title:
      'Attack on Titan',

    creator:
      'Hajime Isayama',

    type: [
      'Manga',
      'Anime'
    ]
  };

  if (document.readyState === 'loading') {
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
      section.dataset.section4Ready === 'true'
    ) {
      return;
    }

    section.dataset.section4Ready =
      'true';

    const elements =
      collectElements(section);

    setupReaderContent(elements);

    if (!window.supabase?.createClient) {
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
        'Loading featured anime and manga.'
      );

      const featuredStories =
        await loadFeaturedAnimeManga();

      const chosenStory =
        await findChosenStory(
          featuredStories
        );

      const rainPool =
        featuredStories.length
          ? featuredStories
          : [chosenStory];

      renderStory(
        section,
        chosenStory
      );

      renderMirroredRain(
        elements,
        rainPool,
        chosenStory
      );

      setStatus(
        elements,
        `${chosenStory.title} loaded as the shared story.`
      );

      requestAnimationFrame(() => {
        setupMotion(
          section,
          elements
        );
      });
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
        'Featured stories could not be loaded.'
      );

      showStaticLayout(
        section
      );
    }
  }

  function collectElements(section) {
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

      formationCoverSlot:
        section.querySelector(
          '[data-formation-cover-slot]'
        ),

      continueCue:
        section.querySelector(
          '[data-continue-cue]'
        ),

      storyContent:
        section.querySelector(
          '[data-story-content]'
        ),

      controlDeck:
        section.querySelector(
          '[data-control-deck]'
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

  async function loadFeaturedAnimeManga() {
    const {
      data,
      error
    } = await supabaseClient
      .from(TABLE_NAME)
      .select('*')
      .eq(
        'featured',
        true
      );

    if (error) {
      throw error;
    }

    return (data || [])
      .filter((item) => {
        return (
          item &&
          item.id != null &&
          item.title
        );
      })
      .map(normalizeStory)
      .filter((story) => {
        const joinedType =
          story.type
            .join(' ')
            .toLowerCase();

        return (
          joinedType.includes('anime') ||
          joinedType.includes('manga')
        );
      });
  }

  async function findChosenStory(
    featuredStories
  ) {
    if (CHOSEN_STORY_ID) {
      const featuredMatch =
        featuredStories.find((story) => {
          return (
            String(story.id) ===
            String(CHOSEN_STORY_ID)
          );
        });

      if (featuredMatch) {
        return featuredMatch;
      }

      const {
        data,
        error
      } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq(
          'id',
          CHOSEN_STORY_ID
        )
        .limit(1);

      if (
        !error &&
        data?.[0]
      ) {
        return normalizeStory(
          data[0]
        );
      }
    }

    const aliases =
      CHOSEN_STORY_ALIASES.map(
        normalizeText
      );

    const featuredTitleMatch =
      featuredStories.find((story) => {
        return aliases.includes(
          normalizeText(story.title)
        );
      });

    if (featuredTitleMatch) {
      return featuredTitleMatch;
    }

    for (
      const alias of
      CHOSEN_STORY_ALIASES
    ) {
      const {
        data,
        error
      } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .ilike(
          'title',
          `%${alias}%`
        )
        .limit(10);

      if (
        !error &&
        data?.length
      ) {
        const normalized =
          data.map(
            normalizeStory
          );

        const exact =
          normalized.find((story) => {
            return (
              normalizeText(story.title) ===
              normalizeText(alias)
            );
          });

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

  function normalizeStory(item) {
    return {
      id:
        String(
          item.id ?? ''
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

  function getTypeList(value) {
    if (Array.isArray(value)) {
      return value
        .map(String)
        .filter(Boolean);
    }

    if (!value) {
      return [
        'Manga'
      ];
    }

    const text =
      String(value).trim();

    try {
      const parsed =
        JSON.parse(text);

      if (Array.isArray(parsed)) {
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

  function getCoverUrlFromId(id) {
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
    } = supabaseClient
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

        if (!fallback) {
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

  function renderMirroredRain(
    elements,
    storyPool,
    chosenStory
  ) {
    elements.rainLeft.innerHTML = '';
    elements.rainRight.innerHTML = '';

    const ordinaryPool =
      dedupeStories(
        storyPool.filter((story) => {
          return (
            storyKey(story) !==
            storyKey(chosenStory)
          );
        })
      );

    const pairCount =
      ordinaryPool.length
        ? Math.min(
            RAIN_PAIR_COUNT,
            ordinaryPool.length + 1
          )
        : 1;

    const chosenPairIndex =
      Math.floor(pairCount / 2);

    const ordinaryPerLane =
      Math.max(0, pairCount - 1);

    const shuffled =
      seededShuffle(
        ordinaryPool,
        hashString(chosenStory.title)
      );

    const leftOrdinary =
      shuffled.slice(
        0,
        ordinaryPerLane
      );

    const rightOrdinary =
      shuffled.length >=
      ordinaryPerLane * 2
        ? shuffled.slice(
            ordinaryPerLane,
            ordinaryPerLane * 2
          )
        : seededShuffle(
            ordinaryPool,
            hashString(
              `${chosenStory.title}-right`
            )
          ).slice(
            0,
            ordinaryPerLane
          );

    let leftIndex = 0;
    let rightIndex = 0;

    for (
      let pairIndex = 0;
      pairIndex < pairCount;
      pairIndex += 1
    ) {
      const isChosen =
        pairIndex === chosenPairIndex;

      const leftStory =
        isChosen
          ? chosenStory
          : leftOrdinary[leftIndex++];

      const rightStory =
        isChosen
          ? chosenStory
          : rightOrdinary[rightIndex++];

      if (!leftStory || !rightStory) {
        continue;
      }

      elements.rainLeft.appendChild(
        createRainItem(
          leftStory,
          'left',
          pairIndex,
          isChosen
        )
      );

      elements.rainRight.appendChild(
        createRainItem(
          rightStory,
          'right',
          pairIndex,
          isChosen
        )
      );
    }
  }

  function dedupeStories(stories) {
    const seen = new Set();

    return (stories || []).filter(
      (story) => {
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
      }
    );
  }

  function storyKey(story) {
    return String(
      story?.id ||
      normalizeText(story?.title)
    );
  }

  function seededShuffle(
    stories,
    seed
  ) {
    const copy =
      [...stories];

    let state =
      seed || 1;

    const random = () => {
      state =
        (
          state * 1664525 +
          1013904223
        ) >>> 0;

      return state / 4294967296;
    };

    for (
      let index = copy.length - 1;
      index > 0;
      index -= 1
    ) {
      const swapIndex =
        Math.floor(
          random() * (index + 1)
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

  function hashString(value) {
    let hash =
      2166136261;

    for (
      const character of
      String(value || '')
    ) {
      hash ^=
        character.charCodeAt(0);

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
    pairIndex,
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
      48,
      18,
      68,
      32,
      8,
      58,
      24,
      72,
      39,
      12
    ];

    const rightPositions = [
      60,
      12,
      72,
      30,
      4,
      52,
      20,
      66,
      38,
      8,
      57
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

    figure.dataset.rainPair =
      String(pairIndex);

    if (isChosen) {
      figure.dataset.chosenRainCover =
        side;
    }

    figure.style.left =
      `${
        positions[
          pairIndex %
          positions.length
        ]
      }%`;

    figure.style.zIndex =
      String(
        1 +
        pairIndex % 3
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

    if (!url) {
      image.removeAttribute(
        'src'
      );

      return;
    }

    image.onload = () => {
      image.hidden =
        false;

      fallback.hidden =
        true;
    };

    image.onerror = () => {
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

  function formatType(list) {
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
      elements.readerContents.forEach(
        (container) => {
          const readerId =
            container.dataset
              .readerContent;

          const reader =
            READERS[readerId];

          if (!reader) {
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

    function setLayer(layer) {
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
            String(selected)
          );
        }
      );

      renderBothSides();
    }

    function setFocus(mode) {
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

      elements.compareStage.dataset.focus =
        focusMode;

      elements.profileButtons.forEach(
        (button) => {
          const selected =
            button.dataset.focusReader ===
            focusMode;

          button.setAttribute(
            'aria-pressed',
            String(selected)
          );

          button.classList.toggle(
            'is-active',
            selected ||
            focusMode === 'both'
          );
        }
      );

      elements.compareBoth.setAttribute(
        'aria-pressed',
        String(
          focusMode === 'both'
        )
      );

      if (
        focusMode === 'left'
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
        focusMode === 'right'
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
          `Average of Kai's ${READERS.kai.score} and Nova's ${READERS.nova.score}. Hover a profile score to see each reader's reason.`;

        updateScoreDisplay(
          elements,
          combinedScore,

          `Average reader rating ${combinedScore}. Kai rated it ${READERS.kai.score} and Nova rated it ${READERS.nova.score}.`,

          combinedReason
        );

        elements.readerStatus.textContent =
          'Both completed';
      }
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
              focusMode === requested
                ? 'both'
                : requested
            );
          }
        );
      }
    );

    elements.compareBoth.addEventListener(
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
    if (elements.scoreText) {
      elements.scoreText.textContent =
        visibleScore;
    }

    if (elements.score) {
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
      .map((value) => {
        return Number.parseFloat(
          value
        );
      })
      .filter(
        Number.isFinite
      );

    if (!values.length) {
      return '9.5/10';
    }

    const average =
      values.reduce(
        (sum, value) => {
          return sum + value;
        },
        0
      ) / values.length;

    return `${average.toFixed(1)}/10`;
  }

  function fillProfileCards(section) {
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
          .forEach((node) => {
            node.textContent =
              reader.name;
          });

        section
          .querySelectorAll(
            `[data-profile-bio="${readerId}"]`
          )
          .forEach((node) => {
            node.textContent =
              reader.bio;
          });

        section
          .querySelectorAll(
            `[data-avatar-fallback="${readerId}"]`
          )
          .forEach((node) => {
            node.textContent =
              reader.initial;
          });

        const image =
          section.querySelector(
            `[data-avatar-image="${readerId}"]`
          );

        if (image) {
          const fallbackPortrait =
            createCharacterPlaceholder(
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

          image.onerror = () => {
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
          .map((quote, index) => {
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
          })
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
          .map((character, index) => {
            const fallbackImage =
              createCharacterPlaceholder(
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
          })
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
              image.dataset.fallbackSrc;
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
          ${escapeHtml(reader.name)} · final reflection
        </span>

        <h4>
          ${escapeHtml(reader.thoughts.title)}
        </h4>

        <div class="s4-thought-copy">
          ${reader.thoughts.paragraphs
            .map((paragraph, index) => {
              return `
                <section class="s4-thought-point">
                  <span>
                    ${index === 0 ? 'What I noticed' : 'What stayed'}
                  </span>

                  <p>
                    ${escapeHtml(paragraph)}
                  </p>
                </section>
              `;
            })
            .join('')}
        </div>
      </article>
    `;
  }

  function createCharacterPlaceholder(
    name,
    side
  ) {
    const initials =
      String(name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => {
          return part
            .charAt(0)
            .toUpperCase();
        })
        .join('');

    const colours =
      side === 'right'
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${colours[0]}"/>
            <stop offset="0.55" stop-color="${colours[1]}"/>
            <stop offset="1" stop-color="${colours[2]}"/>
          </linearGradient>

          <radialGradient id="r" cx="0.3" cy="0.18" r="0.8">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"/>
            <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
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

  function animateContent(container) {
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
    } = window;

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

        y: 58,

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

        y: 48,

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
      elements.cinematic.querySelector(
        '[data-chosen-rain-cover="left"]'
      );

    const chosenRight =
      elements.cinematic.querySelector(
        '[data-chosen-rain-cover="right"]'
      );

    if (
      !chosenLeft ||
      !chosenRight ||
      !elements.cardFormation ||
      !elements.formationCoverSlot
    ) {
      showStaticLayout(
        section
      );

      return;
    }

    const regularLeft =
      leftItems.filter((item) => {
        return (
          item !== chosenLeft
        );
      });

    const regularRight =
      rightItems.filter((item) => {
        return (
          item !== chosenRight
        );
      });

    const viewportHeight = () => {
      return elements.cinematic.clientHeight;
    };

    regularLeft.forEach((item) => {
      const pair =
        Number(
          item.dataset.rainPair ||
          0
        );

      gsap.set(
        item,
        {
          y: () => {
            return (
              viewportHeight() +
              100 +
              pair * 126
            );
          },

          rotation:
            -8 +
            pair % 5 * 4,

          scale:
            0.82 +
            pair % 3 * 0.1,

          opacity:
            0.54 +
            pair % 3 * 0.16
        }
      );
    });

    regularRight.forEach((item) => {
      const pair =
        Number(
          item.dataset.rainPair ||
          0
        );

      gsap.set(
        item,
        {
          y: () => {
            return (
              -item.offsetHeight -
              100 -
              pair * 126
            );
          },

          rotation:
            8 -
            pair % 5 * 4,

          scale:
            0.82 +
            pair % 3 * 0.1,

          opacity:
            0.54 +
            pair % 3 * 0.16
        }
      );
    });

    const chosenPair =
      Number(
        chosenLeft.dataset.rainPair ||
        0
      );

    gsap.set(
      chosenLeft,
      {
        y: () => {
          return (
            viewportHeight() +
            100 +
            chosenPair * 126
          );
        },

        rotation:
          -8 +
          chosenPair % 5 * 4,

        scale:
          0.82 +
          chosenPair % 3 * 0.1,

        opacity:
          0.54 +
          chosenPair % 3 * 0.16
      }
    );

    gsap.set(
      chosenRight,
      {
        y: () => {
          return (
            -chosenRight.offsetHeight -
            100 -
            chosenPair * 126
          );
        },

        rotation:
          8 -
          chosenPair % 5 * 4,

        scale:
          0.82 +
          chosenPair % 3 * 0.1,

        opacity:
          0.54 +
          chosenPair % 3 * 0.16
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
        y: 18,
        scale: 0.82
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
          const pair =
            Number(
              item.dataset.rainPair ||
              0
            );

          return (
            -viewportHeight() -
            460 -
            pair * 92
          );
        },

        rotation: (
          index,
          item
        ) => {
          const pair =
            Number(
              item.dataset.rainPair ||
              0
            );

          return (
            8 -
            pair % 5 * 3
          );
        },

        duration:
          1.6
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
          const pair =
            Number(
              item.dataset.rainPair ||
              0
            );

          return (
            viewportHeight() +
            460 +
            pair * 92
          );
        },

        rotation: (
          index,
          item
        ) => {
          const pair =
            Number(
              item.dataset.rainPair ||
              0
            );

          return (
            -8 +
            pair % 5 * 3
          );
        },

        duration:
          1.6
      },
      0
    );

    timeline.to(
      chosenLeft,
      {
        y: () => {
          return (
            viewportHeight() * 0.59 -
            chosenLeft.offsetHeight / 2
          );
        },

        rotation: -5,

        duration: 1.35,

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
            viewportHeight() * 0.41 -
            chosenRight.offsetHeight
          );
        },

        rotation: 5,

        duration: 1.35,

        ease:
          'power1.inOut'
      },
      0
    );

    timeline.to(
      elements.cinematicCopy,
      {
        autoAlpha: 0,

        y: -44,

        duration: 0.42
      },
      0.72
    );

    timeline.to(
      [
        ...regularLeft,
        ...regularRight
      ],
      {
        autoAlpha: 0,

        scale: 0.8,

        duration: 0.42
      },
      1.18
    );

    timeline.to(
      [
        chosenLeft,
        chosenRight
      ],
      {
        borderColor:
          'rgba(216, 221, 255, 0.72)',

        boxShadow:
          '0 34px 78px rgba(0,0,0,.56), 0 0 58px rgba(155,124,255,.34)',

        duration: 0.28
      },
      1.2
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

        rotation: 0,

        scale: 1.14,

        duration: 0.82,

        ease:
          'power2.inOut'
      },
      1.34
    );

    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.28
      },
      1.78
    );

    timeline.to(
      chosenRight,
      {
        autoAlpha: 0,

        duration: 0.22
      },
      2.14
    );

    timeline.fromTo(
      chosenLeft,
      {
        scale: 1.12
      },
      {
        scale: 1.2,

        duration: 0.16,

        ease:
          'power2.out'
      },
      2.14
    );

    timeline.to(
      chosenLeft,
      {
        scale: 1.14,

        duration: 0.2,

        ease:
          'power2.inOut'
      },
      2.3
    );

    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha: 0,

        y: -10,

        duration: 0.22
      },
      2.34
    );

    timeline.to(
      elements.cardFormation,
      {
        autoAlpha: 1,

        y: 0,

        scale: 1,

        duration: 0.52,

        ease:
          'power2.out'
      },
      2.36
    );

    timeline.to(
      chosenLeft,
      {
        x: () => {
          return getFormationCoverTarget(
            chosenLeft,
            elements.cinematic,
            elements.cardFormation,
            elements.formationCoverSlot
          ).x;
        },

        y: () => {
          return getFormationCoverTarget(
            chosenLeft,
            elements.cinematic,
            elements.cardFormation,
            elements.formationCoverSlot
          ).y;
        },

        scale: 0.9,

        duration: 0.56,

        ease:
          'power2.inOut'
      },
      2.36
    );

    timeline.to(
      elements.continueCue,
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.3
      },
      2.84
    );

    timeline.to(
      [
        chosenLeft,
        elements.cardFormation
      ],
      {
        autoAlpha: 0,

        y: -12,

        duration: 0.26
      },
      3.18
    );

    timeline.to(
      elements.continueCue,
      {
        autoAlpha: 0,

        y: -8,

        duration: 0.18
      },
      3.18
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

    const targetCenterX =
      stageRect.width / 2;

    const targetCenterY =
      stageRect.height / 2;

    return {
      x:
        targetCenterX -
        (
          laneRect.left -
          stageRect.left
        ) -
        item.offsetLeft -
        item.offsetWidth / 2,

      y:
        targetCenterY -
        item.offsetTop -
        item.offsetHeight / 2
    };
  }

  function getFormationCoverTarget(
    item,
    stage,
    formation,
    slot
  ) {
    const lane =
      item.offsetParent;

    const stageRect =
      stage.getBoundingClientRect();

    const laneRect =
      lane.getBoundingClientRect();

    const targetCenterX =
      formation.offsetLeft -
      formation.offsetWidth / 2 +
      slot.offsetLeft +
      slot.offsetWidth / 2;

    const targetCenterY =
      formation.offsetTop -
      formation.offsetHeight / 2 +
      slot.offsetTop +
      slot.offsetHeight / 2;

    return {
      x:
        targetCenterX -
        (
          laneRect.left -
          stageRect.left
        ) -
        item.offsetLeft -
        item.offsetWidth / 2,

      y:
        targetCenterY -
        item.offsetTop -
        item.offsetHeight / 2
    };
  }

  function showStaticLayout(section) {
    section.classList.add(
      'is-static'
    );
  }

  function showDatabaseError(
    elements,
    message
  ) {
    if (elements.empty) {
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
    if (elements.status) {
      elements.status.textContent =
        message;
    }
  }

  function normalizeText(value) {
    return String(
      value || ''
    )
      .trim()
      .toLowerCase();
  }

  function prefersReducedMotion() {
    return window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }

  function escapeHtml(value) {
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