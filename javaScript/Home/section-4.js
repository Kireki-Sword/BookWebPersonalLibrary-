/* ============================================================================
   SECTION 4 — SAME STORY, DIFFERENT SOULS

   WHAT THIS VERSION FIXES

   1. Left and right cover pairs use matching timing.
   2. Attack on Titan is inserted into the real rain on both sides.
   3. Those two exact rain covers move into the centre and merge.
   4. Only the cinematic is pinned.
   5. The final content uses normal page scrolling.
   6. The shared card appears before the reader comparison.
   7. Kai appears on the left and Nova appears on the right.
   8. Clicking a profile focuses that side.
   9. Clicking Compare Both restores an equal comparison.

   REQUIRED LIBRARIES

   - Supabase browser library
   - GSAP
   - GSAP ScrollTrigger

   DATABASE COVER RULE

   Bucket:
   img

   File:
   covers/{database-id}.jpg
   ============================================================================ */

(() => {
  'use strict';


  /* ==========================================================================
     1. DATABASE AND ANIMATION CONFIGURATION

     These are the main technical values you may want to edit.
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
    BEST OPTION

    Add the exact database ID of Attack on Titan.

    Example:

    const CHOSEN_STORY_ID = 'attack-on-titan-2013';

    Leaving the value empty still works because the script searches using
    the two titles in CHOSEN_STORY_ALIASES.
  */

  const CHOSEN_STORY_ID = '';


  /*
    Fallback titles used when CHOSEN_STORY_ID is empty or does not match.
  */

  const CHOSEN_STORY_ALIASES = [
    'Attack on Titan',
    'Shingeki no Kyojin'
  ];


  /*
    Number of paired covers.

    11 means:
    - 11 covers on the left
    - 11 covers on the right
  */

  const RAIN_PAIR_COUNT = 11;


  /*
    Which pair contains Attack on Titan.

    Pair indexes begin at 0.

    4 means Attack on Titan is the fifth pair.
  */

  const CHOSEN_PAIR_INDEX = 4;


  /*
    Length of the pinned scroll animation.

    Increase this value for a slower, longer scroll.
    Decrease it for a shorter scroll.
  */

  const PIN_DISTANCE = 3600;


  let supabaseClient = null;


  /* ==========================================================================
     2. EDIT READER CONTENT HERE

     This is the main content-editing area.

     avatarUrl:
     - Leave empty to use the letter.
     - Add a real image path to show a profile picture.

     quotes:
     - Add or remove objects.
     - Each object creates one quote card.

     characters:
     - Add or remove ranked character objects.

     thoughts:
     - Add as many paragraphs as needed.

     The example quote text is paraphrased rather than copied dialogue.
     ========================================================================== */

  const READERS = {
    kai: {
      /*
        Which side this reader appears on.
      */
      side: 'left',

      /*
        Profile information.
      */
      name: 'kai.reads',
      bio: 'saves emotions first',
      initial: 'K',

      /*
        Add a real avatar path here.

        Example:
        avatarUrl: 'images/kai-avatar.jpg'
      */
      avatarUrl: '',

      /*
        Personal score and status.
      */
      score: '9/10',
      status: 'Completed',

      /*
        Kai's saved quote ideas.
      */
      quotes: [
        {
          text:
            'Even inside fear, there is still a choice.',

          note:
            'Kai saves this idea because it turns a huge conflict into a personal question about courage.'
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

      /*
        Kai's character ranking.
      */
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

      /*
        Kai's long reflection.
      */
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
      side: 'right',

      name: 'nova.pages',
      bio: 'tracks themes and meaning',
      initial: 'N',

      /*
        Example:
        avatarUrl: 'images/nova-avatar.jpg'
      */
      avatarUrl: '',

      score: '10/10',
      status: 'Completed',

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
            'For Nova, empathy and accountability have to exist together.'
        },
        {
          text:
            'History becomes a weapon when only one voice controls it.',

          note:
            'This connects to memory, inherited conflict, and political storytelling.'
        },
        {
          text:
            'An enemy can be created long before two people meet.',

          note:
            'Fear can be taught and passed from one generation to another.'
        },
        {
          text:
            'A person can be responsible and trapped at the same time.',

          note:
            'The story rarely allows guilt, duty, identity, or survival to remain simple.'
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

     Used when the Attack on Titan database row cannot be found.
     ========================================================================== */

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
    /*
      Find the root Section 4 element.
    */

    const section =
      document.querySelector(
        '[data-section-cover-rain]'
      );


    /*
      Stop if the section does not exist or has already been initialized.
    */

    if (
      !section ||
      section.dataset.section4Ready === 'true'
    ) {
      return;
    }


    section.dataset.section4Ready =
      'true';


    /*
      Collect all important elements once.
    */

    const elements =
      collectElements(section);


    /*
      Set up Quotes, Characters, Thoughts, and profile focusing before
      loading the database.
    */

    setupReaderContent(elements);


    /*
      If Supabase is unavailable, show a usable static version.
    */

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


    /*
      Create the Supabase client.
    */

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


      /*
        Load the featured anime/manga pool.
      */

      const featuredStories =
        await loadFeaturedAnimeManga();


      /*
        Find Attack on Titan.
      */

      const chosenStory =
        await findChosenStory(
          featuredStories
        );


      /*
        When there are no featured stories, use the chosen story by itself.
      */

      const rainPool =
        featuredStories.length
          ? featuredStories
          : [chosenStory];


      /*
        Fill the main card with Attack on Titan.
      */

      renderStory(
        section,
        chosenStory
      );


      /*
        Build paired rain and place Attack on Titan in one matching pair.
      */

      renderMirroredRain(
        elements,
        rainPool,
        chosenStory
      );


      setStatus(
        elements,
        `${chosenStory.title} loaded as the shared story.`
      );


      /*
        Wait for the newly created rain elements to enter the DOM,
        then create the GSAP animation.
      */

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


  /* ==========================================================================
     5. DOM REFERENCES

     All selectors are kept here so they are easy to find and edit.
     ========================================================================== */

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

      continueCue:
        section.querySelector(
          '[data-continue-cue]'
        ),

      storyContent:
        section.querySelector(
          '[data-story-content]'
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
    /*
      First choice:
      exact configured ID.
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
      exact title inside the featured rows.
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
      search the entire table by title.
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


    /*
      Final fallback.
    */

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
    /*
      Handle a real JavaScript array.
    */

    if (Array.isArray(value)) {
      return value
        .map(String)
        .filter(Boolean);
    }


    /*
      Default type when the database field is empty.
    */

    if (!value) {
      return [
        'Manga'
      ];
    }


    const text =
      String(value).trim();


    /*
      Handle a JSON array stored as text.
    */

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
        Plain text is expected for most rows.
      */
    }


    /*
      Handle values such as:

      Manga / Anime
      Manga, Anime
      Manga|Anime
    */

    return text
      .split(/[,/|]+/)
      .map((part) => {
        return part.trim();
      })
      .filter(Boolean);
  }


  /*
    This uses the exact same cover rule as Section 1.
  */

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


  /* ==========================================================================
     7. RENDER THE STORY AND MIRRORED RAIN
     ========================================================================== */

  function renderStory(
    section,
    story
  ) {
    /*
      Update every story title in the section.
    */

    section
      .querySelectorAll(
        '[data-story-title]'
      )
      .forEach((node) => {
        node.textContent =
          story.title;
      });


    /*
      Update every creator field.
    */

    section
      .querySelectorAll(
        '[data-story-creator]'
      )
      .forEach((node) => {
        node.textContent =
          story.creator ||
          'Unknown creator';
      });


    /*
      Update every format field.
    */

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


    /*
      Load the cover into every main story-cover element.
    */

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
    /*
      Clear any previous cover elements.
    */

    elements.rainLeft.innerHTML =
      '';

    elements.rainRight.innerHTML =
      '';


    /*
      Prevent Attack on Titan from being repeated accidentally in ordinary
      rain positions when possible.
    */

    const ordinaryPool =
      storyPool.filter((story) => {
        return (
          String(story.id) !==
          String(chosenStory.id)
        );
      });


    /*
      When the database contains only Attack on Titan, use it safely.
    */

    const safePool =
      ordinaryPool.length
        ? ordinaryPool
        : storyPool;


    /*
      Create paired items.

      Every pair receives the same pairIndex.
      That is what allows left and right timing to stay synchronized.
    */

    for (
      let pairIndex = 0;
      pairIndex < RAIN_PAIR_COUNT;
      pairIndex += 1
    ) {
      const isChosen =
        pairIndex === CHOSEN_PAIR_INDEX;


      const leftStory =
        isChosen
          ? chosenStory
          : safePool[
              (pairIndex * 2) %
              safePool.length
            ];


      const rightStory =
        isChosen
          ? chosenStory
          : safePool[
              (pairIndex * 2 + 1) %
              safePool.length
            ];


      const leftItem =
        createRainItem(
          leftStory,
          'left',
          pairIndex,
          isChosen
        );


      const rightItem =
        createRainItem(
          rightStory,
          'right',
          pairIndex,
          isChosen
        );


      elements.rainLeft.appendChild(
        leftItem
      );


      elements.rainRight.appendChild(
        rightItem
      );
    }
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


    /*
      Horizontal positions inside each rain lane.
    */

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


    /*
      Add the chosen class only to the Attack on Titan pair.
    */

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


    /*
      Mark the chosen left and right items so GSAP can select those exact
      real rain covers later.
    */

    if (isChosen) {
      figure.dataset.chosenRainCover =
        side;
    }


    figure.style.left =
      `${positions[
        pairIndex %
        positions.length
      ]}%`;


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


    /*
      Begin with the fallback visible.
    */

    image.hidden =
      true;


    image.alt =
      alt;


    fallback.hidden =
      false;


    /*
      Keep the fallback when no database ID is available.
    */

    if (!url) {
      image.removeAttribute(
        'src'
      );

      return;
    }


    /*
      Show the image only after it loads successfully.
    */

    image.onload = () => {
      image.hidden =
        false;

      fallback.hidden =
        true;
    };


    /*
      Return to the fallback when the image fails.
    */

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


  /* ==========================================================================
     8. READER CONTENT AND INTERACTIONS
     ========================================================================== */

  function setupReaderContent(
    elements
  ) {
    /*
      Initial interface state.
    */

    let activeLayer =
      'quotes';


    let focusMode =
      'both';


    /*
      Fill the small profile cards using the READERS object.
    */

    fillProfileCards(
      elements.section
    );


    /*
      Render the current layer on both sides.
    */

    function renderBothSides() {
      elements.readerContents.forEach(
        (container) => {
          const readerId =
            container.dataset.readerContent;


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


    /*
      Change between Quotes, Characters, and Thoughts.
    */

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


    /*
      Focus the left reader, right reader, or both.
    */

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


      /*
        Update profile-button states.
      */

      elements.profileButtons.forEach(
        (button) => {
          const selected =
            button.dataset.focusReader ===
            focusMode;


          button.setAttribute(
            'aria-pressed',
            String(selected)
          );


          /*
            Both profile cards appear highlighted when comparing both.
          */

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


      /*
        Change score and status on the main card.
      */

      if (
        focusMode === 'left'
      ) {
        elements.scoreText.textContent =
          READERS.kai.score;


        elements.score.setAttribute(
          'aria-label',
          `Kai rated this story ${READERS.kai.score}`
        );


        elements.readerStatus.textContent =
          READERS.kai.status;
      } else if (
        focusMode === 'right'
      ) {
        elements.scoreText.textContent =
          READERS.nova.score;


        elements.score.setAttribute(
          'aria-label',
          `Nova rated this story ${READERS.nova.score}`
        );


        elements.readerStatus.textContent =
          READERS.nova.status;
      } else {
        elements.scoreText.textContent =
          '9 · 10';


        elements.score.setAttribute(
          'aria-label',
          `Reader scores: Kai ${READERS.kai.score}, Nova ${READERS.nova.score}`
        );


        elements.readerStatus.textContent =
          'Both completed';
      }
    }


    /*
      Layer-button click events.
    */

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


    /*
      Clicking the currently focused reader returns to both.

      Clicking the other reader focuses that side.
    */

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


    /*
      Centre comparison button.
    */

    elements.compareBoth.addEventListener(
      'click',
      () => {
        setFocus(
          'both'
        );
      }
    );


    /*
      Initial render.
    */

    setLayer(
      activeLayer
    );


    setFocus(
      focusMode
    );
  }


  function fillProfileCards(section) {
    Object.entries(
      READERS
    ).forEach(
      ([
        readerId,
        reader
      ]) => {
        /*
          Profile name.
        */

        section
          .querySelectorAll(
            `[data-profile-name="${readerId}"]`
          )
          .forEach((node) => {
            node.textContent =
              reader.name;
          });


        /*
          Profile biography.
        */

        section
          .querySelectorAll(
            `[data-profile-bio="${readerId}"]`
          )
          .forEach((node) => {
            node.textContent =
              reader.bio;
          });


        /*
          Fallback initial.
        */

        section
          .querySelectorAll(
            `[data-avatar-fallback="${readerId}"]`
          )
          .forEach((node) => {
            node.textContent =
              reader.initial;
          });


        /*
          Optional avatar image.
        */

        const image =
          section.querySelector(
            `[data-avatar-image="${readerId}"]`
          );


        if (
          image &&
          reader.avatarUrl
        ) {
          image.src =
            reader.avatarUrl;


          image.alt =
            `${reader.name} profile picture`;


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
  }


  /* ==========================================================================
     9. BUILD THE DYNAMIC EVIDENCE CONTENT
     ========================================================================== */

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
          ${reader.quotes.length} saved ideas from the same story
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
    reader
  ) {
    container.innerHTML = `
      <header class="s4-evidence-header">
        <span>
          ${escapeHtml(reader.name)} · character ranking
        </span>

        <h4>
          Top ${reader.characters.length} characters
        </h4>
      </header>

      <div class="s4-character-grid">
        ${reader.characters
          .map((character, index) => {
            return `
              <article
                class="s4-character-card ${index === 0 ? 'is-featured' : ''}"
              >
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
    reader
  ) {
    container.innerHTML = `
      <article class="s4-thought-card">
        <span class="s4-card-number">
          ${escapeHtml(reader.name)} · long reflection
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


  /*
    Small content-change animation.

    This uses the Web Animations API rather than GSAP because it is a simple
    interface transition and should work independently from ScrollTrigger.
  */

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


  /* ==========================================================================
     10. GSAP MOTION
     ========================================================================== */

  function setupMotion(
    section,
    elements
  ) {
    /*
      Display the static final content when GSAP is unavailable.
    */

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


    /*
      Full cinematic:
      larger desktop screens without reduced motion.

      Static version:
      small screens, short screens, and reduced-motion users.
    */

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


    /*
      Reveal the main card when it enters the normal page viewport.
    */

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


    /*
      Reveal the split-reader comparison after the card.
    */

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
    /*
      Get all actual rain-cover elements.
    */

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


    /*
      Find the exact Attack on Titan elements inside both rain lanes.
    */

    const chosenLeft =
      elements.cinematic.querySelector(
        '[data-chosen-rain-cover="left"]'
      );


    const chosenRight =
      elements.cinematic.querySelector(
        '[data-chosen-rain-cover="right"]'
      );


    /*
      Ordinary rain excludes the two selected covers.
    */

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


    /*
      Use the real cinematic height so resizing remains reliable.
    */

    const viewportHeight = () => {
      return elements.cinematic.clientHeight;
    };


    /*
      REGULAR LEFT COVERS

      Start below the viewport and travel upward.
    */

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


    /*
      REGULAR RIGHT COVERS

      Start above the viewport and travel downward.

      Pair N uses the same distance calculation and timeline duration as the
      matching left item.
    */

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


    /*
      SELECTED LEFT COVER

      It starts as part of the left rain, below the screen.
    */

    gsap.set(
      chosenLeft,
      {
        y: () => {
          return (
            viewportHeight() +
            120
          );
        },

        rotation: -10,

        scale: 0.94,

        opacity: 0.9
      }
    );


    /*
      SELECTED RIGHT COVER

      It starts as part of the right rain, above the screen.
    */

    gsap.set(
      chosenRight,
      {
        y: () => {
          return (
            -chosenRight.offsetHeight -
            120
          );
        },

        rotation: 10,

        scale: 0.94,

        opacity: 0.9
      }
    );


    /*
      Hide merge text before scrolling begins.
    */

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


    /*
      Main pinned timeline.
    */

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

          /*
            pinSpacing adds real document space below the pin.

            This allows the page to continue naturally into the shared card.
          */
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


    /*
      PHASE 1 — SYNCHRONIZED RAIN

      Both arrays start at timeline position 0 and use duration 1.6.

      Therefore the left side does not finish before the right side.
    */

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


    /*
      The selected pair moves through the rain and reaches matching positions
      at exactly the same time.
    */

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


    /*
      Fade the opening heading while the rain continues.
    */

    timeline.to(
      elements.cinematicCopy,
      {
        autoAlpha: 0,

        y: -44,

        duration: 0.42
      },
      0.72
    );


    /*
      Remove ordinary rain covers so attention moves to Attack on Titan.
    */

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


    /*
      PHASE 2 — MOVE THE REAL SELECTED COVERS TO THE CENTRE

      getCenterTarget calculates the transform needed for each cover based on
      its real lane position.

      No new fake cover appears from the bottom.
    */

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


    /*
      MERGE

      The right copy fades.
      The left copy remains as the final merged cover.
    */

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


    /*
      Move the merged cover toward the top centre.
    */

    timeline.to(
      chosenLeft,
      {
        x: () => {
          return getTopCenterTarget(
            chosenLeft,
            elements.cinematic
          ).x;
        },

        y: () => {
          return getTopCenterTarget(
            chosenLeft,
            elements.cinematic
          ).y;
        },

        scale: 0.74,

        duration: 0.66,

        ease:
          'power2.inOut'
      },
      2.52
    );


    timeline.to(
      elements.selectionCopy,
      {
        autoAlpha: 0,

        y: -10,

        duration: 0.22
      },
      2.58
    );


    /*
      Tell the visitor that normal page content follows.
    */

    timeline.to(
      elements.continueCue,
      {
        autoAlpha: 1,

        y: 0,

        duration: 0.3
      },
      2.88
    );


    /*
      Fade the merged cover just before the pin releases.

      The normal shared card follows immediately after this cinematic.
    */

    timeline.to(
      chosenLeft,
      {
        autoAlpha: 0,

        duration: 0.22
      },
      3.2
    );


    timeline.to(
      elements.continueCue,
      {
        autoAlpha: 0,

        y: -8,

        duration: 0.18
      },
      3.2
    );


    /*
      Cleanup when the media query changes or the animation is rebuilt.
    */

    return () => {
      timeline
        .scrollTrigger
        ?.kill();


      timeline.kill();
    };
  }


  /* ==========================================================================
     11. COVER TARGET CALCULATIONS
     ========================================================================== */


  /*
    Calculate where a rain cover must move so its centre aligns with the
    centre of the cinematic.

    The cover remains inside its original left or right rain lane, so we must
    compensate for the lane's position.
  */

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


  /*
    Calculate the final top-centre destination of the merged cover.

    Change navOffset when the merged cover should stop higher or lower.
  */

  function getTopCenterTarget(
    item,
    stage
  ) {
    const lane =
      item.offsetParent;


    const stageRect =
      stage.getBoundingClientRect();


    const laneRect =
      lane.getBoundingClientRect();


    /*
      Increase to move the merged cover lower.
      Decrease to move it higher.
    */

    const navOffset = 78;


    return {
      x:
        stageRect.width / 2 -
        (
          laneRect.left -
          stageRect.left
        ) -
        item.offsetLeft -
        item.offsetWidth / 2,

      y:
        navOffset +
        item.offsetHeight * 0.5 -
        item.offsetTop -
        item.offsetHeight / 2
    };
  }


  /* ==========================================================================
     12. FALLBACKS AND UTILITIES
     ========================================================================== */


  /*
    Hide the cinematic and expose the normal final content.
  */

  function showStaticLayout(section) {
    section.classList.add(
      'is-static'
    );
  }


  /*
    Display the database error screen.
  */

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


  /*
    Send a message to the invisible accessibility status element.
  */

  function setStatus(
    elements,
    message
  ) {
    if (elements.status) {
      elements.status.textContent =
        message;
    }
  }


  /*
    Normalize text for reliable title comparison.
  */

  function normalizeText(value) {
    return String(
      value || ''
    )
      .trim()
      .toLowerCase();
  }


  /*
    Detect the operating-system reduced-motion preference.
  */

  function prefersReducedMotion() {
    return window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }


  /*
    Escape dynamic strings before inserting them into innerHTML.
  */

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