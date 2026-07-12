/* ============================================================================
   SECTION 4 — SAME STORY, DIFFERENT SOULS

   WHAT TO EDIT MOST OFTEN

   1. Put the exact Attack on Titan database ID in CHOSEN_STORY_ID.

   2. Edit names, bios, avatar URLs, scores, quotes, characters,
      and thoughts inside the PROFILES object.

   3. Change RAIN_COVER_COUNT for more or fewer falling covers.

   4. Change PIN_DISTANCE for a shorter or longer scroll animation.

   DATABASE RULE

   This uses the same rule as Section 1:

   public bucket "img"
   -> covers folder
   -> database-id.jpg
   ============================================================================ */

(() => {
  'use strict';

  /* ==========================================================================
     1. DATABASE CONFIG
     ========================================================================== */

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

  /*
    Recommended:

    Replace the empty string with the exact
    Attack on Titan database row ID.

    Example:

    const CHOSEN_STORY_ID = 'attack-on-titan-2013';
  */
  const CHOSEN_STORY_ID = '';

  const CHOSEN_STORY_ALIASES = [
    'Attack on Titan',
    'Shingeki no Kyojin'
  ];

  /*
    Number of visual cover objects used in the rain.
  */
  const RAIN_COVER_COUNT = 28;

  /*
    Total scroll distance of the pinned animation.
  */
  const PIN_DISTANCE = 4700;

  let supabaseClient = null;


  /* ==========================================================================
     2. EDIT THE TWO READER PROFILES HERE

     avatarUrl:

     - Leave it empty to show the colored initial.
     - Add a path such as "images/kai-avatar.jpg"
       to show a real profile picture.

     quotes:

     - Every object becomes one quote card.
     - Add or remove objects freely.

     characters:

     - Every object becomes one ranked character card.
     - This version uses a Top 5.

     thoughts:

     - One long article using all paragraphs.
     ========================================================================== */

  const PROFILES = {
    kai: {
      name:
        'kai.reads',

      bio:
        'saves emotions first',

      initial:
        'K',

      /*
        Add a real image path here when ready.

        Example:
        avatarUrl: 'images/kai-avatar.jpg'
      */
      avatarUrl:
        '',

      score:
        '9/10',

      status:
        'Completed',

      quotes: [
        {
          text:
            'Even inside fear, there is still a choice.',

          note:
            'Kai saved this idea because it turns a huge conflict into a personal question about courage.'
        },
        {
          text:
            'Freedom can become another kind of pressure.',

          note:
            'Wanting freedom and understanding freedom are not always the same thing.'
        },
        {
          text:
            'People become braver when someone believes they can.',

          note:
            'Kai connects this to the quiet support characters give one another before difficult decisions.'
        },
        {
          text:
            'Fear does not disappear just because you move forward.',

          note:
            'For Kai, courage means acting while the fear is still present.'
        },
        {
          text:
            'A dream can save someone and still hurt them.',

          note:
            'Many characters are driven by hopes that also make their lives heavier.'
        }
      ],

      characters: [
        {
          rank: 1,

          name:
            'Armin Arlert',

          reason:
            'His curiosity, empathy, and quiet bravery make intelligence feel deeply human.'
        },
        {
          rank: 2,

          name:
            'Mikasa Ackerman',

          reason:
            'Kai connects with her loyalty and the emotional cost of protecting someone.'
        },
        {
          rank: 3,

          name:
            'Levi Ackerman',

          reason:
            'His discipline matters, but Kai is more interested in the grief hidden beneath it.'
        },
        {
          rank: 4,

          name:
            'Hange Zoë',

          reason:
            'Their curiosity brings warmth and movement into a world shaped by fear.'
        },
        {
          rank: 5,

          name:
            'Jean Kirstein',

          reason:
            'Ordinary doubt slowly becomes responsibility and courage.'
        }
      ],

      thoughts: {
        title:
          'Freedom means less when fear is making every decision for you.',

        paragraphs: [
          'Kai remembers the story first as an emotional experience. The scale is enormous, but the moments that remain are usually small: a pause before a decision, a look between two people, or a character choosing to continue when nothing feels certain.',

          'For Kai, the story is not only about escaping a wall or defeating an enemy. It is about the pressure created by love, loyalty, fear, and expectation. Characters often believe they are moving toward freedom while carrying invisible obligations with them.',

          'The most meaningful part is the way courage changes from character to character. Sometimes courage is loud. Sometimes it is simply admitting doubt, listening to another person, or taking responsibility after making the wrong choice.',

          'Kai leaves the story thinking about how easily fear can choose a life for someone. Real freedom begins when a person can recognize that fear and still decide what kind of person they want to become.'
        ]
      }
    },

    nova: {
      name:
        'nova.pages',

      bio:
        'tracks themes and meaning',

      initial:
        'N',

      /*
        Add a real image path here when ready.

        Example:
        avatarUrl: 'images/nova-avatar.jpg'
      */
      avatarUrl:
        '',

      score:
        '10/10',

      status:
        'Completed',

      quotes: [
        {
          text:
            'The world changes when the story around it changes.',

          note:
            'Information and perspective repeatedly reshape what every character believes is true.'
        },
        {
          text:
            'Understanding a side does not erase what that side has done.',

          note:
            'For Nova, empathy and accountability must exist together.'
        },
        {
          text:
            'History can become a weapon when only one voice controls it.',

          note:
            'This captures Nova’s interest in memory, inherited conflict, and political storytelling.'
        },
        {
          text:
            'An enemy can be created long before two people ever meet.',

          note:
            'Fear can be taught and passed from one generation to another.'
        },
        {
          text:
            'A person can be both responsible and trapped.',

          note:
            'The story rarely allows guilt, duty, identity, or survival to stay simple.'
        }
      ],

      characters: [
        {
          rank: 1,

          name:
            'Reiner Braun',

          reason:
            'Nova is drawn to the conflict between duty, identity, guilt, and survival.'
        },
        {
          rank: 2,

          name:
            'Erwin Smith',

          reason:
            'His leadership raises difficult questions about sacrifice, truth, and obsession.'
        },
        {
          rank: 3,

          name:
            'Zeke Yeager',

          reason:
            'His worldview turns pain into a complete political philosophy.'
        },
        {
          rank: 4,

          name:
            'Historia Reiss',

          reason:
            'Her growth explores identity, inherited roles, and self-determination.'
        },
        {
          rank: 5,

          name:
            'Gabi Braun',

          reason:
            'Her perspective demonstrates the construction and collapse of prejudice.'
        }
      ],

      thoughts: {
        title:
          'The most dangerous wall is the story that makes cruelty feel necessary.',

        paragraphs: [
          'Nova reads the series as a study of systems. Individual choices matter, but those choices happen inside histories, institutions, inherited fears, and repeated stories about who deserves safety and who deserves blame.',

          'The same event can produce completely different meanings depending on who remembers it, who records it, and who benefits from the accepted version. That makes truth feel unstable without making truth meaningless.',

          'Nova is especially interested in characters who are both responsible for harm and shaped by forces larger than themselves. The story asks the viewer to understand those forces without turning understanding into an excuse.',

          'The lasting question is not simply who is right. It is how a person should act after realizing that their identity, enemy, duty, and history were built from incomplete information.'
        ]
      }
    }
  };


  /* ==========================================================================
     3. FALLBACK STORY

     This is shown when the database row cannot be found.
     ========================================================================== */

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


  /* ==========================================================================
     4. STARTUP
     ========================================================================== */

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

    /*
      Build the reader/layer click interaction before
      loading the database.

      This allows the final card to continue working
      even when animation libraries fail.
    */
    createContentController(elements);

    if (!window.supabase?.createClient) {
      console.error(
        'Section 4: Supabase is not loaded.'
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
        'Supabase is not loaded. Showing the static fallback.'
      );

      return;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    setStatus(
      elements,
      'Loading featured anime and manga.'
    );

    try {
      const featuredStories =
        await loadFeaturedAnimeManga();

      const chosenStory =
        await findChosenStory(
          featuredStories
        );

      const rainStories =
        featuredStories.length
          ? featuredStories
          : [chosenStory];

      renderRain(
        elements,
        repeatStories(
          rainStories,
          RAIN_COVER_COUNT
        )
      );

      renderStory(
        section,
        chosenStory
      );

      setStatus(
        elements,
        `${chosenStory.title} loaded as the shared story.`
      );

      requestAnimationFrame(() => {
        setupSectionAnimation(
          section,
          elements
        );
      });
    } catch (error) {
      console.error(
        'Section 4 failed to load:',
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
        section,
        elements
      );
    }
  }


  /* ==========================================================================
     5. DOM REFERENCES

     All query selectors are kept in this one function.
     ========================================================================== */

  function collectElements(section) {
    return {
      rainLeft:
        section.querySelector(
          '[data-rain-left]'
        ),

      rainRight:
        section.querySelector(
          '[data-rain-right]'
        ),

      rainCopy:
        section.querySelector(
          '[data-rain-copy]'
        ),

      mergeLeft:
        section.querySelector(
          '[data-merge-cover-left]'
        ),

      mergeRight:
        section.querySelector(
          '[data-merge-cover-right]'
        ),

      mergeOne:
        section.querySelector(
          '[data-merge-cover-one]'
        ),

      mergeCaption:
        section.querySelector(
          '[data-merge-caption]'
        ),

      finalScene:
        section.querySelector(
          '[data-final-scene]'
        ),

      finalIntro:
        section.querySelector(
          '[data-final-intro]'
        ),

      profileSwitcher:
        section.querySelector(
          '[data-profile-switcher]'
        ),

      profileButtons: [
        ...section.querySelectorAll(
          '[data-profile-select]'
        )
      ],

      mainCard:
        section.querySelector(
          '[data-main-card]'
        ),

      layerTabs:
        section.querySelector(
          '[data-layer-tabs]'
        ),

      layerButtons: [
        ...section.querySelectorAll(
          '[data-layer-select]'
        )
      ],

      layerContent:
        section.querySelector(
          '[data-layer-content]'
        ),

      readerScore:
        section.querySelector(
          '[data-reader-score]'
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


  /* ==========================================================================
     6. DATABASE
     ========================================================================== */

  async function loadFeaturedAnimeManga() {
    const {
      data,
      error
    } = await supabaseClient
      .from(TABLE_NAME)
      .select('*')
      .eq('featured', true);

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
        const types =
          story.type
            .join(' ')
            .toLowerCase();

        return (
          types.includes('anime') ||
          types.includes('manga')
        );
      });
  }

  async function findChosenStory(
    featuredStories
  ) {
    /*
      First choice:
      exact configured database ID.
    */
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

    /*
      Second choice:
      exact title inside featured rows.
    */
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

    /*
      Third choice:
      search the complete table by title.
    */
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
          data.map(normalizeStory);

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
        String(item.id ?? ''),

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
      /*
        Normal text is expected most of the time.
      */
    }

    return text
      .split(/[,/|]+/)
      .map((part) => {
        return part.trim();
      })
      .filter(Boolean);
  }

  /*
    This is the same cover rule used by Section 1.
  */
  function getCoverUrlFromId(id) {
    if (!id) {
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


  /* ==========================================================================
     7. RENDER THE RAIN COVERS
     ========================================================================== */

  function renderRain(
    elements,
    stories
  ) {
    elements.rainLeft.innerHTML =
      '';

    elements.rainRight.innerHTML =
      '';

    stories.forEach(
      (story, index) => {
        const side =
          index % 2 === 0
            ? 'left'
            : 'right';

        const item =
          createRainItem(
            story,
            side,
            Math.floor(index / 2)
          );

        const destination =
          side === 'left'
            ? elements.rainLeft
            : elements.rainRight;

        destination.appendChild(item);
      }
    );
  }

  function createRainItem(
    story,
    side,
    index
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

    const leftX = [
      2,
      47,
      18,
      67,
      31,
      8,
      58,
      24,
      72,
      39,
      12,
      62,
      28,
      52
    ];

    const rightX = [
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
      57,
      26,
      70,
      16
    ];

    const positions =
      side === 'left'
        ? leftX
        : rightX;

    figure.className =
      's4-rain-item';

    figure.dataset.coverShell =
      '';

    figure.dataset.rainSide =
      side;

    figure.style.left =
      `${positions[index % positions.length]}%`;

    figure.style.top =
      `${-18 + (index % 8) * 17}%`;

    figure.style.zIndex =
      String(1 + (index % 3));

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


  /* ==========================================================================
     8. RENDER THE CHOSEN STORY
     ========================================================================== */

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
          formatType(story.type);
      });

    section
      .querySelectorAll(
        '[data-story-cover]'
      )
      .forEach((image) => {
        const fallback =
          image
            .closest(
              '[data-cover-shell]'
            )
            ?.querySelector(
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
            const text =
              String(item).trim();

            if (!text) {
              return '';
            }

            return (
              text
                .charAt(0)
                .toUpperCase() +
              text
                .slice(1)
                .toLowerCase()
            );
          })
          .filter(Boolean)
      )
    ];

    return clean.length
      ? clean.join(' / ')
      : 'Manga / Anime';
  }

  function repeatStories(
    stories,
    amount
  ) {
    if (!stories.length) {
      return [];
    }

    return Array.from(
      {
        length: amount
      },
      (_, index) => {
        return stories[
          index % stories.length
        ];
      }
    );
  }


  /* ==========================================================================
     9. PROFILE AND SAVED-LAYER CONTROLLER
     ========================================================================== */

  function createContentController(
    elements
  ) {
    const layers = [
      'quotes',
      'characters',
      'thoughts'
    ];

    let activeProfile =
      'kai';

    let activeLayer =
      'quotes';

    /*
      Fill small profile cards from PROFILES.
    */
    elements.profileButtons.forEach(
      (button) => {
        const profile =
          PROFILES[
            button.dataset.profileSelect
          ];

        if (!profile) {
          return;
        }

        button
          .querySelector(
            '[data-profile-name]'
          )
          .textContent =
            profile.name;

        button
          .querySelector(
            '[data-profile-bio]'
          )
          .textContent =
            profile.bio;

        button
          .querySelector(
            '[data-profile-avatar-fallback]'
          )
          .textContent =
            profile.initial;

        const image =
          button.querySelector(
            '[data-profile-avatar-image]'
          );

        if (profile.avatarUrl) {
          image.src =
            profile.avatarUrl;

          image.alt =
            `${profile.name} profile picture`;

          image.hidden =
            false;

          image.onerror = () => {
            image.hidden =
              true;

            image.removeAttribute(
              'src'
            );
          };
        }
      }
    );

    function chooseProfile(
      id,
      focus = false
    ) {
      if (!PROFILES[id]) {
        return;
      }

      activeProfile =
        id;

      elements.profileButtons.forEach(
        (button) => {
          const selected =
            button.dataset.profileSelect === id;

          button.classList.toggle(
            'is-active',
            selected
          );

          button.setAttribute(
            'aria-selected',
            String(selected)
          );

          button.tabIndex =
            selected ? 0 : -1;
        }
      );

      elements.readerScore.textContent =
        PROFILES[id].score;

      elements.readerStatus.textContent =
        PROFILES[id].status;

      renderContent();

      if (focus) {
        elements.profileButtons
          .find((button) => {
            return (
              button.dataset.profileSelect === id
            );
          })
          ?.focus();
      }
    }

    function chooseLayer(
      layer,
      focus = false
    ) {
      if (!layers.includes(layer)) {
        return;
      }

      activeLayer =
        layer;

      elements.layerButtons.forEach(
        (button) => {
          const selected =
            button.dataset.layerSelect === layer;

          button.classList.toggle(
            'is-active',
            selected
          );

          button.setAttribute(
            'aria-selected',
            String(selected)
          );

          button.tabIndex =
            selected ? 0 : -1;
        }
      );

      renderContent();

      if (focus) {
        elements.layerButtons
          .find((button) => {
            return (
              button.dataset.layerSelect === layer
            );
          })
          ?.focus();
      }
    }

    function renderContent() {
      const profile =
        PROFILES[activeProfile];

      if (activeLayer === 'quotes') {
        renderQuotes(
          elements.layerContent,
          profile
        );
      } else if (
        activeLayer === 'characters'
      ) {
        renderCharacters(
          elements.layerContent,
          profile
        );
      } else {
        renderThoughts(
          elements.layerContent,
          profile
        );
      }

      animateContent(
        elements.layerContent
      );
    }

    /*
      Mouse and touch profile selection.
    */
    elements.profileButtons.forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            chooseProfile(
              button.dataset.profileSelect
            );
          }
        );
      }
    );

    /*
      Mouse and touch layer selection.
    */
    elements.layerButtons.forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            chooseLayer(
              button.dataset.layerSelect
            );
          }
        );
      }
    );

    /*
      Keyboard support for profile selectors.
    */
    elements.profileSwitcher.addEventListener(
      'keydown',
      (event) => {
        const current =
          event.target.closest(
            '[data-profile-select]'
          );

        if (!current) {
          return;
        }

        const ids =
          elements.profileButtons.map(
            (button) => {
              return button.dataset.profileSelect;
            }
          );

        const index =
          ids.indexOf(
            current.dataset.profileSelect
          );

        let next =
          index;

        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowDown'
        ) {
          next =
            (index + 1) %
            ids.length;
        } else if (
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowUp'
        ) {
          next =
            (
              index -
              1 +
              ids.length
            ) %
            ids.length;
        } else if (
          event.key === 'Home'
        ) {
          next =
            0;
        } else if (
          event.key === 'End'
        ) {
          next =
            ids.length - 1;
        } else {
          return;
        }

        event.preventDefault();

        chooseProfile(
          ids[next],
          true
        );
      }
    );

    /*
      Keyboard support for active layers.

      Disabled Moments and Notes are skipped.
    */
    elements.layerTabs.addEventListener(
      'keydown',
      (event) => {
        const current =
          event.target.closest(
            '[data-layer-select]'
          );

        if (!current) {
          return;
        }

        const index =
          layers.indexOf(
            current.dataset.layerSelect
          );

        let next =
          index;

        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowDown'
        ) {
          next =
            (index + 1) %
            layers.length;
        } else if (
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowUp'
        ) {
          next =
            (
              index -
              1 +
              layers.length
            ) %
            layers.length;
        } else if (
          event.key === 'Home'
        ) {
          next =
            0;
        } else if (
          event.key === 'End'
        ) {
          next =
            layers.length - 1;
        } else {
          return;
        }

        event.preventDefault();

        chooseLayer(
          layers[next],
          true
        );
      }
    );

    /*
      Initial visible profile and layer.
    */
    chooseProfile(
      activeProfile
    );

    chooseLayer(
      activeLayer
    );
  }


  /* ==========================================================================
     10. BUILD DYNAMIC CONTENT
     ========================================================================== */

  function renderQuotes(
    container,
    profile
  ) {
    container.innerHTML = `
      <header class="s4-content-heading">
        <span>
          ${escapeHtml(profile.name)} · quote collection
        </span>

        <h4>
          ${profile.quotes.length} saved ideas from the same story
        </h4>
      </header>

      <div class="s4-content-grid">
        ${profile.quotes
          .map((quote, index) => {
            return `
              <article class="s4-quote-card">
                <span class="s4-quote-number">
                  Saved quote ${String(index + 1).padStart(2, '0')}
                </span>

                <blockquote>
                  “${escapeHtml(quote.text)}”
                </blockquote>

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
    profile
  ) {
    container.innerHTML = `
      <header class="s4-content-heading">
        <span>
          ${escapeHtml(profile.name)} · character ranking
        </span>

        <h4>
          Top ${profile.characters.length} characters
        </h4>
      </header>

      <div class="s4-content-grid">
        ${profile.characters
          .map((character) => {
            return `
              <article class="s4-character-card">
                <span
                  class="s4-character-badge"
                  aria-hidden="true"
                >
                  ${escapeHtml(
                    character.name
                      .charAt(0)
                      .toUpperCase()
                  )}
                </span>

                <div class="s4-character-copy">
                  <span class="s4-character-rank">
                    Rank ${String(character.rank).padStart(2, '0')}
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
  }

  function renderThoughts(
    container,
    profile
  ) {
    container.innerHTML = `
      <article class="s4-thoughts-card">
        <span class="s4-quote-number">
          ${escapeHtml(profile.name)} · long reflection
        </span>

        <h4>
          ${escapeHtml(profile.thoughts.title)}
        </h4>

        <div class="s4-thoughts-copy">
          ${profile.thoughts.paragraphs
            .map((text) => {
              return `
                <p>
                  ${escapeHtml(text)}
                </p>
              `;
            })
            .join('')}
        </div>
      </article>
    `;
  }

  function animateContent(container) {
    if (
      prefersReducedMotion() ||
      typeof container.animate !== 'function'
    ) {
      return;
    }

    container.animate(
      [
        {
          opacity: 0.25,

          transform:
            'translateY(8px)'
        },
        {
          opacity: 1,

          transform:
            'translateY(0)'
        }
      ],
      {
        duration: 260,

        easing:
          'cubic-bezier(.22,1,.36,1)'
      }
    );
  }


  /* ==========================================================================
     11. GSAP SCROLL ANIMATION
     ========================================================================== */

  function setupSectionAnimation(
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
    } = window;

    gsap.registerPlugin(
      ScrollTrigger
    );

    gsap.matchMedia().add(
      {
        animated:
          '(min-width: 1050px) and (min-height: 780px) and (prefers-reduced-motion: no-preference)',

        static:
          '(max-width: 1049px), (max-height: 779px), (prefers-reduced-motion: reduce)'
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
        section.querySelectorAll(
          '[data-rain-side="left"]'
        )
      );

    const rightItems =
      gsap.utils.toArray(
        section.querySelectorAll(
          '[data-rain-side="right"]'
        )
      );

    const allRainItems = [
      ...leftItems,
      ...rightItems
    ];

    /*
      Initial final interface state.
    */
    gsap.set(
      elements.finalScene,
      {
        autoAlpha: 0,

        visibility:
          'hidden',

        pointerEvents:
          'none'
      }
    );

    gsap.set(
      elements.finalIntro,
      {
        autoAlpha: 0,

        y: 18
      }
    );

    gsap.set(
      elements.profileButtons,
      {
        autoAlpha: 0,

        y: 24
      }
    );

    gsap.set(
      elements.mainCard,
      {
        autoAlpha: 0,

        y: 74,

        scale: 0.985
      }
    );

    gsap.set(
      elements.mergeCaption,
      {
        autoAlpha: 0,

        y: 12
      }
    );

    /*
      Left rain begins below the viewport.
    */
    leftItems.forEach(
      (item, index) => {
        gsap.set(
          item,
          {
            y: () => {
              return (
                window.innerHeight *
                0.74 +
                index *
                94
              );
            },

            rotation:
              -8 +
              (index % 5) *
              4,

            scale:
              0.82 +
              (index % 3) *
              0.1,

            opacity:
              0.5 +
              (index % 3) *
              0.18
          }
        );
      }
    );

    /*
      Right rain begins above the viewport.
    */
    rightItems.forEach(
      (item, index) => {
        gsap.set(
          item,
          {
            y: () => {
              return (
                -window.innerHeight *
                0.82 -
                index *
                94
              );
            },

            rotation:
              9 -
              (index % 5) *
              4,

            scale:
              0.82 +
              ((index + 1) % 3) *
              0.1,

            opacity:
              0.5 +
              ((index + 1) % 3) *
              0.18
          }
        );
      }
    );

    /*
      Two selected covers begin in the lower corners.
    */
    gsap.set(
      elements.mergeLeft,
      {
        autoAlpha: 0,

        xPercent: -50,
        yPercent: -50,

        x: () => {
          return -Math.min(
            window.innerWidth *
            0.36,
            540
          );
        },

        y: () => {
          return Math.min(
            window.innerHeight *
            0.42,
            390
          );
        },

        rotation: -11,

        scale: 0.86
      }
    );

    gsap.set(
      elements.mergeRight,
      {
        autoAlpha: 0,

        xPercent: -50,
        yPercent: -50,

        x: () => {
          return Math.min(
            window.innerWidth *
            0.36,
            540
          );
        },

        y: () => {
          return Math.min(
            window.innerHeight *
            0.42,
            390
          );
        },

        rotation: 11,

        scale: 0.86
      }
    );

    /*
      The merged center copy starts hidden.
    */
    gsap.set(
      elements.mergeOne,
      {
        autoAlpha: 0,

        xPercent: -50,
        yPercent: -50,

        x: 0,
        y: 0,

        rotation: 0,

        scale: 1
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
            section,

          start:
            'top top',

          end:
            `+=${PIN_DISTANCE}`,

          pin:
            true,

          scrub:
            1,

          anticipatePin:
            1,

          invalidateOnRefresh:
            true
        }
      });

    /*
      PHASE 1:
      covers move in opposite directions.
    */
    timeline.to(
      leftItems,
      {
        y: (index) => {
          return (
            -window.innerHeight *
            1.55 -
            index *
            72
          );
        },

        rotation: (index) => {
          return (
            8 -
            (index % 5) *
            3
          );
        },

        duration:
          2.15,

        stagger: {
          each:
            0.025,

          from:
            'start'
        }
      },
      0
    );

    timeline.to(
      rightItems,
      {
        y: (index) => {
          return (
            window.innerHeight *
            1.55 +
            index *
            72
          );
        },

        rotation: (index) => {
          return (
            -8 +
            (index % 5) *
            3
          );
        },

        duration:
          2.15,

        stagger: {
          each:
            0.025,

          from:
            'start'
        }
      },
      0
    );

    timeline.to(
      elements.rainCopy,
      {
        autoAlpha: 0,

        y: -45,

        duration: 0.45
      },
      0.78
    );

    timeline.to(
      allRainItems,
      {
        autoAlpha: 0,

        scale: 0.8,

        duration: 0.55
      },
      1.28
    );

    /*
      PHASE 2:
      two copies enter and meet.
    */
    timeline.to(
      [
        elements.mergeLeft,
        elements.mergeRight
      ],
      {
        autoAlpha: 1,

        duration: 0.18
      },
      1.18
    );

    timeline.to(
      elements.mergeLeft,
      {
        x: 0,
        y: 0,

        rotation: 0,

        scale: 1,

        duration: 0.95,

        ease:
          'power2.inOut'
      },
      1.28
    );

    timeline.to(
      elements.mergeRight,
      {
        x: 0,
        y: 0,

        rotation: 0,

        scale: 1,

        duration: 0.95,

        ease:
          'power2.inOut'
      },
      1.28
    );

    /*
      Two visible copies become one.
    */
    timeline.set(
      elements.mergeOne,
      {
        autoAlpha: 1
      },
      2.2
    );

    timeline.to(
      [
        elements.mergeLeft,
        elements.mergeRight
      ],
      {
        autoAlpha: 0,

        duration: 0.24
      },
      2.2
    );

    timeline.fromTo(
      elements.mergeOne,
      {
        scale: 0.98
      },
      {
        scale: 1.045,

        duration: 0.18,

        ease:
          'power2.out'
      },
      2.2
    );

    timeline.to(
      elements.mergeOne,
      {
        scale: 1,

        duration: 0.22,

        ease:
          'power2.inOut'
      },
      2.38
    );

    timeline.to(
      elements.mergeCaption,
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.28
      },
      2.34
    );

    /*
      The merged cover rises.

      No duplicate Attack on Titan title is displayed above it.
    */
    timeline.to(
      elements.mergeOne,
      {
        y: () => {
          return -Math.min(
            window.innerHeight *
            0.24,
            220
          );
        },

        scale: 0.56,

        duration: 0.65,

        ease:
          'power2.inOut'
      },
      2.64
    );

    timeline.to(
      elements.mergeCaption,
      {
        autoAlpha: 0,

        y: -10,

        duration: 0.24
      },
      2.74
    );

    /*
      PHASE 3:
      reveal small profiles and one lower shared card.
    */
    timeline.set(
      elements.finalScene,
      {
        visibility:
          'visible'
      },
      2.86
    );

    timeline.to(
      elements.finalScene,
      {
        autoAlpha: 1,

        duration: 0.32
      },
      2.86
    );

    timeline.to(
      elements.finalIntro,
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.34,

        ease:
          'power2.out'
      },
      3.0
    );

    /*
      Both profile selectors appear together.
    */
    timeline.to(
      elements.profileButtons,
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.42,

        ease:
          'power2.out'
      },
      3.18
    );

    /*
      The one shared card rises into its lower position.
    */
    timeline.to(
      elements.mainCard,
      {
        autoAlpha: 1,

        y: 0,

        scale: 1,

        duration: 0.58,

        ease:
          'power2.out'
      },
      3.36
    );

    timeline.to(
      elements.mergeOne,
      {
        autoAlpha: 0,

        duration: 0.26
      },
      3.38
    );

    /*
      Enable buttons only when the final interface is visible.
    */
    timeline.set(
      elements.finalScene,
      {
        pointerEvents:
          'auto'
      },
      3.72
    );

    return () => {
      timeline
        .scrollTrigger
        ?.kill();

      timeline.kill();
    };
  }


  /* ==========================================================================
     12. FALLBACKS AND UTILITIES
     ========================================================================== */

  function showStaticLayout(
    section,
    elements
  ) {
    section.classList.add(
      'is-static'
    );

    elements.finalScene.style.visibility =
      'visible';

    elements.finalScene.style.opacity =
      '1';

    elements.finalScene.style.pointerEvents =
      'auto';
  }

  function showDatabaseError(
    elements,
    message
  ) {
    if (!elements.empty) {
      return;
    }

    elements.empty.hidden =
      false;

    const paragraph =
      elements.empty.querySelector(
        'p'
      );

    if (paragraph) {
      paragraph.innerHTML =
        `${escapeHtml(message)} ` +
        `Set <strong>featured = true</strong> ` +
        `on several anime or manga rows in Supabase.`;
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
    return String(value || '')
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