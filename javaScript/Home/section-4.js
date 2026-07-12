/* =========================================================
   SECTION 4 — SAME STORY, DIFFERENT SOULS

   Requires:
   - Supabase
   - GSAP
   - ScrollTrigger

   Replace the old Section 4 JavaScript with this file.
   ========================================================= */

(() => {
  'use strict';

  const CONFIG = {
    supabaseUrl:
      'https://hsruxfpslxguhwnccwuj.supabase.co',

    supabaseKey:
      'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD',

    table:
      'manga',

    bucket:
      'img',

    coverFolder:
      'covers',

    /*
      Add the exact Attack on Titan database ID here
      when you know it.

      Example:
      chosenStoryId: 'attack-on-titan-2013'
    */
    chosenStoryId: '',

    chosenStoryTitle:
      'Attack on Titan',

    chosenStoryAliases: [
      'Attack on Titan',
      'Shingeki no Kyojin'
    ],

    rainCoverCount:
      28,

    pinDistance:
      4800
  };

  const FALLBACK_STORY = {
    id:
      'attack-on-titan-fallback',

    title:
      'Attack on Titan',

    creator:
      'Hajime Isayama',

    types: [
      'anime',
      'manga'
    ],

    coverCandidates: []
  };

  let client = null;

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }

  async function init() {
    const section =
      document.querySelector(
        '[data-section-cover-rain]'
      );

    if (
      !section ||
      section.dataset.s4Ready === 'true'
    ) {
      return;
    }

    section.dataset.s4Ready = 'true';

    const elements =
      collectElements(section);

    setupSynchronizedTabs(section);

    if (!window.supabase?.createClient) {
      console.error(
        'Section 4: Supabase is not loaded.'
      );

      showDatabaseError(
        elements,
        'Supabase is not loaded.'
      );

      showStatic(
        section,
        elements
      );

      return;
    }

    client =
      window.supabase.createClient(
        CONFIG.supabaseUrl,
        CONFIG.supabaseKey
      );

    setStatus(
      elements,
      'Loading featured stories.'
    );

    try {
      const featuredStories =
        await loadFeaturedAnimeManga();

      if (!featuredStories.length) {
        showDatabaseError(
          elements,
          'No featured anime or manga rows were found.'
        );

        showStatic(
          section,
          elements
        );

        return;
      }

      const chosenStory =
        await findChosenStory(
          featuredStories
        );

      const rainPool =
        repeatStories(
          featuredStories,
          CONFIG.rainCoverCount
        );

      renderRain(
        elements,
        rainPool
      );

      renderChosenStory(
        section,
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

      showDatabaseError(
        elements,
        'Featured stories could not be loaded.'
      );

      showStatic(
        section,
        elements
      );
    }
  }

  function collectElements(section) {
    return {
      section,

      rainScene:
        section.querySelector(
          '[data-rain-scene]'
        ),

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

      mergeStage:
        section.querySelector(
          '[data-merge-stage]'
        ),

      mergeLeft:
        section.querySelector(
          '[data-merge-copy-left]'
        ),

      mergeRight:
        section.querySelector(
          '[data-merge-copy-right]'
        ),

      mergeOne:
        section.querySelector(
          '[data-merge-copy-one]'
        ),

      mergeCaption:
        section.querySelector(
          '[data-merge-caption]'
        ),

      finalScene:
        section.querySelector(
          '[data-final-scene]'
        ),

      sharedStory:
        section.querySelector(
          '[data-shared-story]'
        ),

      finalHeading:
        section.querySelector(
          '[data-final-heading]'
        ),

      cardLeft:
        section.querySelector(
          '[data-soul-card="left"]'
        ),

      cardRight:
        section.querySelector(
          '[data-soul-card="right"]'
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

  /* =======================================================
     DATABASE
     ======================================================= */

  async function loadFeaturedAnimeManga() {
    const {
      data,
      error
    } = await client
      .from(CONFIG.table)
      .select('*')
      .eq('featured', true);

    if (error) {
      throw error;
    }

    return (data || [])
      .filter((row) => {
        return (
          row &&
          row.id != null &&
          row.title
        );
      })
      .map(normalizeStory)
      .filter((story) => {
        return (
          story.types.includes('anime') ||
          story.types.includes('manga')
        );
      });
  }

  async function findChosenStory(
    featuredStories
  ) {
    const matchingId =
      CONFIG.chosenStoryId
        ? featuredStories.find((story) => {
            return (
              String(story.id) ===
              String(CONFIG.chosenStoryId)
            );
          })
        : null;

    if (matchingId) {
      return matchingId;
    }

    const aliases =
      CONFIG.chosenStoryAliases.map(
        normalizeText
      );

    const exactFeatured =
      featuredStories.find((story) => {
        return aliases.includes(
          normalizeText(story.title)
        );
      });

    if (exactFeatured) {
      return exactFeatured;
    }

    /*
      Attack on Titan may not be marked featured,
      so search for it separately.
    */
    if (CONFIG.chosenStoryId) {
      const {
        data
      } = await client
        .from(CONFIG.table)
        .select('*')
        .eq(
          'id',
          CONFIG.chosenStoryId
        )
        .limit(1);

      if (data?.[0]) {
        return normalizeStory(
          data[0]
        );
      }
    }

    for (
      const alias of
      CONFIG.chosenStoryAliases
    ) {
      const {
        data,
        error
      } = await client
        .from(CONFIG.table)
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

    /*
      Keep Attack on Titan selected even when
      the database row is missing.
    */
    return {
      ...FALLBACK_STORY
    };
  }

  function normalizeStory(row) {
    return {
      id:
        String(row.id),

      title:
        String(
          row.title ||
          'Untitled story'
        ),

      creator:
        getCreator(row),

      types:
        getTypeList(
          row.type ??
          row.types ??
          row.format
        ),

      coverCandidates:
        getCoverCandidates(row),

      raw:
        row
    };
  }

  function getCreator(row) {
    return String(
      row.creator ||
      row.author ||
      row.writer ||
      row.artist ||
      row.studio ||
      'Unknown creator'
    );
  }

  function getTypeList(value) {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          return normalizeText(item);
        })
        .filter(Boolean);
    }

    if (
      value &&
      typeof value === 'object'
    ) {
      return Object
        .values(value)
        .map((item) => {
          return normalizeText(item);
        })
        .filter(Boolean);
    }

    const text =
      String(value || '').trim();

    if (!text) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            return normalizeText(item);
          })
          .filter(Boolean);
      }
    } catch (_) {
      /*
        A normal comma-separated string
        is expected most of the time.
      */
    }

    return text
      .split(/[,/|]+/)
      .map((item) => {
        return normalizeText(item);
      })
      .filter(Boolean);
  }

  function getCoverCandidates(row) {
    const candidates = [];

    const rawValues = [
      row.cover,
      row.cover_url,
      row.coverUrl,
      row.image,
      row.image_url,
      row.poster,
      row.poster_url
    ].filter(Boolean);

    rawValues.forEach((value) => {
      addCoverValue(
        candidates,
        String(value)
      );
    });

    [
      'jpg',
      'jpeg',
      'png',
      'webp'
    ].forEach((extension) => {
      addStoragePath(
        candidates,
        `${CONFIG.coverFolder}/${row.id}.${extension}`
      );
    });

    return [
      ...new Set(candidates)
    ];
  }

  function addCoverValue(
    candidates,
    value
  ) {
    const clean =
      value.trim();

    if (!clean) {
      return;
    }

    if (
      /^https?:\/\//i.test(clean) ||
      clean.startsWith('data:') ||
      clean.startsWith('blob:')
    ) {
      candidates.push(clean);

      return;
    }

    let storagePath =
      clean.replace(/^\/+/, '');

    if (
      storagePath.startsWith(
        `${CONFIG.bucket}/`
      )
    ) {
      storagePath =
        storagePath.slice(
          CONFIG.bucket.length + 1
        );
    }

    addStoragePath(
      candidates,
      storagePath
    );
  }

  function addStoragePath(
    candidates,
    path
  ) {
    const cleanPath =
      String(path || '')
        .replace(/^\/+/, '');

    if (!cleanPath) {
      return;
    }

    const {
      data
    } = client.storage
      .from(CONFIG.bucket)
      .getPublicUrl(cleanPath);

    if (data?.publicUrl) {
      candidates.push(
        data.publicUrl
      );
    }
  }

  /* =======================================================
     RENDERING
     ======================================================= */

  function renderRain(
    elements,
    stories
  ) {
    elements.rainLeft.innerHTML = '';
    elements.rainRight.innerHTML = '';

    stories.forEach(
      (story, index) => {
        const side =
          index % 2 === 0
            ? 'left'
            : 'right';

        const sideIndex =
          Math.floor(index / 2);

        const item =
          createRainItem(
            story,
            side,
            sideIndex
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
      document.createElement('figure');

    const image =
      document.createElement('img');

    const fallback =
      document.createElement('span');

    const xPattern =
      side === 'left'
        ? [
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
          ]
        : [
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

    figure.className =
      's4-rain-item';

    figure.dataset.rainItem = '';
    figure.dataset.rainSide = side;
    figure.dataset.rainIndex =
      String(index);

    figure.style.left =
      `${xPattern[index % xPattern.length]}%`;

    figure.style.top =
      `${-18 + (index % 8) * 17}%`;

    figure.style.zIndex =
      String(1 + (index % 3));

    fallback.className =
      's4-cover-fallback';

    fallback.dataset.coverFallback = '';

    fallback.textContent =
      story.title;

    image.alt = '';
    image.decoding = 'async';
    image.loading = 'eager';

    figure.append(
      image,
      fallback
    );

    loadImageCandidates(
      image,
      fallback,
      story.coverCandidates,
      `${story.title} cover`
    );

    return figure;
  }

  function renderChosenStory(
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
          story.creator;
      });

    const format =
      formatTypes(story.types);

    section
      .querySelectorAll(
        '[data-story-format]'
      )
      .forEach((node) => {
        node.textContent =
          format;
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

        loadImageCandidates(
          image,
          fallback,
          story.coverCandidates,
          `${story.title} cover`
        );
      });
  }

  function loadImageCandidates(
    image,
    fallback,
    candidates,
    alt
  ) {
    const queue = [
      ...new Set(
        candidates || []
      )
    ];

    let index = 0;

    image.hidden = true;
    fallback.hidden = false;
    image.alt = alt;

    const tryNext = () => {
      if (index >= queue.length) {
        image.removeAttribute('src');

        image.hidden = true;
        fallback.hidden = false;

        return;
      }

      const source =
        queue[index++];

      image.onload = () => {
        image.hidden = false;
        fallback.hidden = true;
      };

      image.onerror =
        tryNext;

      image.src =
        source;
    };

    tryNext();
  }

  function repeatStories(
    stories,
    amount
  ) {
    if (!stories.length) {
      return [];
    }

    return Array.from(
      { length: amount },
      (_, index) => {
        return stories[
          index % stories.length
        ];
      }
    );
  }

  function formatTypes(types) {
    const unique = [
      ...new Set(
        types.map((type) => {
          return normalizeText(type);
        })
      )
    ];

    const labels =
      unique
        .filter((type) => {
          return (
            type === 'anime' ||
            type === 'manga'
          );
        })
        .map((type) => {
          return (
            type.charAt(0).toUpperCase() +
            type.slice(1)
          );
        });

    return labels.length
      ? labels.join(' / ')
      : 'Anime / Manga';
  }

  /* =======================================================
     SYNCHRONIZED TABS
     ======================================================= */

  function setupSynchronizedTabs(section) {
    const tabLists = [
      ...section.querySelectorAll(
        '[data-layer-tabs]'
      )
    ];

    const tabs = [
      ...section.querySelectorAll(
        '[data-soul-tab]'
      )
    ];

    const panels = [
      ...section.querySelectorAll(
        '[data-soul-panel]'
      )
    ];

    const order = [
      'quote',
      'character',
      'thoughts'
    ];

    let activeLayer =
      'quote';

    const activate = (
      layer,
      options = {}
    ) => {
      if (!order.includes(layer)) {
        return;
      }

      activeLayer = layer;

      tabs.forEach((tab) => {
        const selected =
          tab.dataset.soulTab === layer;

        tab.classList.toggle(
          'is-active',
          selected
        );

        tab.setAttribute(
          'aria-selected',
          String(selected)
        );

        tab.tabIndex =
          selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        const selected =
          panel.dataset.soulPanel === layer;

        panel.hidden =
          !selected;

        panel.classList.toggle(
          'is-active',
          selected
        );

        if (
          selected &&
          options.animate !== false &&
          !prefersReducedMotion()
        ) {
          panel.animate(
            [
              {
                opacity: 0,
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
      });

      if (options.focusTab) {
        const target =
          options.focusWithin?.querySelector(
            `[data-soul-tab="${layer}"]`
          ) ||
          section.querySelector(
            `[data-soul-tab="${layer}"]`
          );

        target?.focus();
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener(
        'click',
        () => {
          activate(
            tab.dataset.soulTab
          );
        }
      );
    });

    tabLists.forEach((list) => {
      list.addEventListener(
        'keydown',
        (event) => {
          const current =
            event.target.closest(
              '[data-soul-tab]'
            );

          if (!current) {
            return;
          }

          const currentIndex =
            order.indexOf(
              current.dataset.soulTab
            );

          let nextIndex =
            currentIndex;

          if (
            event.key === 'ArrowRight' ||
            event.key === 'ArrowDown'
          ) {
            nextIndex =
              (currentIndex + 1) %
              order.length;
          } else if (
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowUp'
          ) {
            nextIndex =
              (
                currentIndex -
                1 +
                order.length
              ) %
              order.length;
          } else if (
            event.key === 'Home'
          ) {
            nextIndex = 0;
          } else if (
            event.key === 'End'
          ) {
            nextIndex =
              order.length - 1;
          } else {
            return;
          }

          event.preventDefault();

          activate(
            order[nextIndex],
            {
              focusTab: true,
              focusWithin: list
            }
          );
        }
      );
    });

    activate(
      activeLayer,
      {
        animate: false
      }
    );
  }

  /* =======================================================
     MOTION
     ======================================================= */

  function setupMotion(
    section,
    elements
  ) {
    if (
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      console.warn(
        'Section 4: GSAP or ScrollTrigger is missing. Showing the static layout.'
      );

      showStatic(
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

    const media =
      gsap.matchMedia();

    media.add(
      {
        animated:
          '(min-width: 1180px) and (min-height: 820px) and (prefers-reduced-motion: no-preference)',

        static:
          '(max-width: 1179px), (max-height: 819px), (prefers-reduced-motion: reduce)'
      },
      (context) => {
        if (context.conditions.static) {
          showStatic(
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

    gsap.set(
      elements.rainScene,
      {
        autoAlpha: 1
      }
    );

    gsap.set(
      elements.rainCopy,
      {
        autoAlpha: 1,
        y: 0
      }
    );

    gsap.set(
      elements.mergeStage,
      {
        autoAlpha: 1
      }
    );

    gsap.set(
      elements.finalScene,
      {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none'
      }
    );

    gsap.set(
      elements.sharedStory,
      {
        autoAlpha: 0,
        y: -20,
        scale: 0.96
      }
    );

    gsap.set(
      elements.finalHeading,
      {
        autoAlpha: 0,
        y: 18
      }
    );

    gsap.set(
      elements.cardLeft,
      {
        autoAlpha: 0,
        x: -92,
        y: 28
      }
    );

    gsap.set(
      elements.cardRight,
      {
        autoAlpha: 0,
        x: 92,
        y: 28
      }
    );

    gsap.set(
      elements.mergeCaption,
      {
        autoAlpha: 0,
        y: 12
      }
    );

    leftItems.forEach(
      (item, index) => {
        gsap.set(
          item,
          {
            y: () => {
              return (
                window.innerHeight *
                  0.74 +
                index * 94
              );
            },

            rotation:
              -8 +
              (index % 5) * 4,

            scale:
              0.82 +
              (index % 3) * 0.1,

            opacity:
              0.5 +
              (index % 3) * 0.18
          }
        );
      }
    );

    rightItems.forEach(
      (item, index) => {
        gsap.set(
          item,
          {
            y: () => {
              return (
                -window.innerHeight *
                  0.82 -
                index * 94
              );
            },

            rotation:
              9 -
              (index % 5) * 4,

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

    gsap.set(
      elements.mergeLeft,
      {
        autoAlpha: 0,

        xPercent: -50,
        yPercent: -50,

        x: () => {
          return -Math.min(
            window.innerWidth * 0.36,
            540
          );
        },

        y: () => {
          return Math.min(
            window.innerHeight * 0.42,
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
            window.innerWidth * 0.36,
            540
          );
        },

        y: () => {
          return Math.min(
            window.innerHeight * 0.42,
            390
          );
        },

        rotation: 11,
        scale: 0.86
      }
    );

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
          ease: 'none'
        },

        scrollTrigger: {
          trigger:
            section,

          start:
            'top top',

          end:
            `+=${CONFIG.pinDistance}`,

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
      Phase 1:
      Covers move in opposite directions.
    */
    timeline.to(
      leftItems,
      {
        y: (index) => {
          return (
            -window.innerHeight *
              1.55 -
            index * 72
          );
        },

        rotation: (index) => {
          return (
            8 -
            (index % 5) * 3
          );
        },

        duration:
          2.15,

        stagger: {
          each: 0.025,
          from: 'start'
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
            index * 72
          );
        },

        rotation: (index) => {
          return (
            -8 +
            (index % 5) * 3
          );
        },

        duration:
          2.15,

        stagger: {
          each: 0.025,
          from: 'start'
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
      Phase 2:
      Two identical covers enter from
      the lower-left and lower-right.
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
        ease: 'power2.out'
      },
      2.2
    );

    timeline.to(
      elements.mergeOne,
      {
        scale: 1,
        duration: 0.22,
        ease: 'power2.inOut'
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
      The merged cover rises toward
      the shared-story position.
    */
    timeline.to(
      elements.mergeOne,
      {
        y: () => {
          return -Math.min(
            window.innerHeight * 0.31,
            290
          );
        },

        scale: 0.54,

        duration: 0.7,

        ease:
          'power2.inOut'
      },
      2.65
    );

    timeline.to(
      elements.mergeCaption,
      {
        autoAlpha: 0,
        y: -10,
        duration: 0.25
      },
      2.72
    );

    /*
      Phase 3:
      Shared cover and both cards reveal.
    */
    timeline.set(
      elements.finalScene,
      {
        visibility: 'visible'
      },
      2.82
    );

    timeline.to(
      elements.finalScene,
      {
        autoAlpha: 1,
        duration: 0.34
      },
      2.82
    );

    timeline.to(
      elements.sharedStory,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,

        duration: 0.42,

        ease:
          'power2.out'
      },
      2.95
    );

    timeline.to(
      elements.mergeOne,
      {
        autoAlpha: 0,
        duration: 0.26
      },
      3.02
    );

    timeline.to(
      elements.finalHeading,
      {
        autoAlpha: 1,
        y: 0,

        duration: 0.34,

        ease:
          'power2.out'
      },
      3.18
    );

    /*
      The left and right cards start
      and finish at the same time.
    */
    timeline.to(
      [
        elements.cardLeft,
        elements.cardRight
      ],
      {
        autoAlpha: 1,

        x: 0,
        y: 0,

        duration: 0.56,

        ease:
          'power2.out'
      },
      3.42
    );

    timeline.set(
      elements.finalScene,
      {
        pointerEvents: 'auto'
      },
      3.72
    );

    timeline.add(
      () => {
        elements.finalScene.classList.add(
          'is-interactive'
        );
      },
      3.72
    );

    timeline.add(
      () => {
        elements.finalScene.classList.remove(
          'is-interactive'
        );
      },
      3.71
    );

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();

      gsap.set(
        [
          elements.rainScene,
          elements.mergeStage,
          elements.finalScene,
          elements.sharedStory,
          elements.finalHeading,
          elements.cardLeft,
          elements.cardRight
        ],
        {
          clearProps: 'all'
        }
      );
    };
  }

  function showStatic(
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

    elements.finalScene.classList.add(
      'is-interactive'
    );
  }

  function showDatabaseError(
    elements,
    message
  ) {
    if (!elements.empty) {
      return;
    }

    elements.empty.hidden = false;

    const paragraph =
      elements.empty.querySelector('p');

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

  function prefersReducedMotion() {
    return window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase();
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