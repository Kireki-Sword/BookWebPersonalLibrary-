// =========================================================
// SECTION 4 — FEATURED ANIME/MANGA COVER RAIN
// Data source:
// - Supabase table: manga
// - only rows where featured = true
// - only type including anime or manga
// - cover rule: database can store img/covers/id.jpg,
//   Supabase Storage bucket is already "img", so public path becomes covers/id.jpg.
// Requires:
// - Supabase browser library
// - GSAP
// - GSAP ScrollTrigger
// =========================================================

(() => {
  // ---------------------------------------------------------
  // DATABASE CONFIG
  // ---------------------------------------------------------

  const SUPABASE_URL = 'https://hsruxfpslxguhwnccwuj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

  const TABLE_NAME = 'manga';
  const BUCKET_NAME = 'img';
  const COVER_FOLDER = 'covers';

  // How many visual cover cards the rain needs.
  // The database does not need this many unique rows because the JS repeats featured stories.
  const RAIN_COVER_COUNT = 40;

  // Pinned scroll distance. Phase 1 gets the first part; transition and Phase 2 use the rest.
  const PIN_DISTANCE = 5200;

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  let supabaseClient = null;

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------

  function startSection4() {
    const section = document.querySelector('[data-section-cover-rain]');

    if (!section) {
      return;
    }

    const elements = getElements(section);

    if (!hasRequiredElements(elements)) {
      console.error('Missing Section 4 elements.', elements);
      return;
    }

    if (!window.supabase) {
      console.error('Supabase library is not loaded. Section 4 needs Supabase to load featured covers.');
      showEmptyState(elements, 'Supabase is not loaded.');
      return;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    loadFeaturedAnimeManga()
      .then((featuredStories) => {
        if (featuredStories.length === 0) {
          showEmptyState(elements, 'No featured anime/manga rows found.');
          return;
        }

        const featureStory = featuredStories[0];
        const rainPool = buildRainPool(featuredStories, RAIN_COVER_COUNT);

        renderRainCovers(elements, rainPool);
        renderFeatureStory(elements, featureStory);
        renderProfileLibraries(elements, featuredStories, featureStory);
        splitThoughtText(elements.section);

        requestAnimationFrame(() => {
          setupSection4Animation(elements);
        });
      })
      .catch((error) => {
        console.error('Section 4 failed to load featured stories:', error);
        showEmptyState(elements, 'Featured stories could not load.');
      });
  }

  function getElements(section) {
    return {
      section,

      rainWrapper: section.querySelector('[data-rain-wrapper]'),
      rainLeft: section.querySelector('[data-rain-left]'),
      rainRight: section.querySelector('[data-rain-right]'),
      rainLabel: section.querySelector('[data-rain-label]'),

      transitionBook: section.querySelector('[data-transition-book]'),
      transitionCover: section.querySelector('[data-feature-cover]'),
      transitionFallback: section.querySelector('[data-feature-cover-fallback]'),

      soulsSection: section.querySelector('[data-souls-section]'),
      soulsBook: section.querySelector('[data-souls-book]'),
      soulsBookCover: section.querySelector('[data-souls-book-cover]'),
      soulsBookFallback: section.querySelector('[data-souls-book-fallback]'),
      soulsBookTitle: section.querySelector('[data-souls-book-title]'),
      soulsBookCreator: section.querySelector('[data-souls-book-creator]'),
      soulsIntro: section.querySelector('[data-souls-intro]'),

      cardLeft: section.querySelector('[data-souls-card-left]'),
      cardRight: section.querySelector('[data-souls-card-right]'),
      libraryLeft: section.querySelector('[data-souls-library-left]'),
      libraryRight: section.querySelector('[data-souls-library-right]'),

      empty: section.querySelector('[data-section-4-empty]')
    };
  }

  function hasRequiredElements(elements) {
    return Boolean(
      elements.section &&
      elements.rainWrapper &&
      elements.rainLeft &&
      elements.rainRight &&
      elements.rainLabel &&
      elements.transitionBook &&
      elements.transitionCover &&
      elements.transitionFallback &&
      elements.soulsSection &&
      elements.soulsBook &&
      elements.soulsBookCover &&
      elements.soulsBookFallback &&
      elements.soulsBookTitle &&
      elements.soulsBookCreator &&
      elements.soulsIntro &&
      elements.cardLeft &&
      elements.cardRight &&
      elements.libraryLeft &&
      elements.libraryRight &&
      elements.empty
    );
  }

  // ---------------------------------------------------------
  // DATABASE
  // ---------------------------------------------------------

  async function loadFeaturedAnimeManga() {
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select('id, title, creator, author, writer, type, cover, heroScore, hero_score, score, rating, genres, featured')
      .eq('featured', true)
      .order('heroScore', { ascending: false, nullsFirst: false });

    if (error) {
      throw error;
    }

    return normalizeStories(data || []).filter((story) => {
      const types = getTypeList(story);
      return types.includes('anime') || types.includes('manga');
    });
  }

  function normalizeStories(items) {
    return items
      .filter((item) => item && item.id && item.title)
      .map(normalizeStory);
  }

  function normalizeStory(item) {
    return {
      id: String(item.id),
      title: String(item.title || ''),
      creator: getCreatorValue(item),
      type: getTypeList(item),
      coverCandidates: getCoverCandidates(item),
      score: getScoreValue(item),
      genres: getArrayValue(item.genres),
      raw: item
    };
  }

  function buildRainPool(featuredStories, neededAmount) {
    const pool = [];

    if (featuredStories.length === 0) {
      return pool;
    }

    while (pool.length < neededAmount) {
      featuredStories.forEach((story) => {
        if (pool.length < neededAmount) {
          pool.push(story);
        }
      });
    }

    return pool;
  }

  // ---------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------

  function renderRainCovers(elements, rainPool) {
    elements.rainLeft.innerHTML = '';
    elements.rainRight.innerHTML = '';

    const leftStories = rainPool.filter((_, index) => index % 2 === 0);
    const rightStories = rainPool.filter((_, index) => index % 2 !== 0);

    leftStories.forEach((story, index) => {
      elements.rainLeft.appendChild(createRainItem(story, index, 'left'));
    });

    rightStories.forEach((story, index) => {
      elements.rainRight.appendChild(createRainItem(story, index, 'right'));
    });
  }

  function createRainItem(story, index, side) {
    const item = document.createElement('figure');
    const img = document.createElement('img');
    const fallback = document.createElement('div');

    const leftX = [4, 48, 18, 72, 33, 8, 61, 24, 78, 43, 13, 68, 30, 54, 6, 76, 22, 63, 40, 16];
    const rightX = [62, 16, 76, 34, 7, 56, 24, 70, 42, 12, 60, 30, 74, 20, 52, 38, 9, 66, 27, 80];

    const yStep = 128;
    const rotation = getRotation(index, side);
    const scale = getScale(index);

    item.className = 'rain-item';
    item.style.left = `${side === 'left' ? leftX[index % leftX.length] : rightX[index % rightX.length]}%`;
    item.style.top = side === 'left'
      ? `${112 + index * yStep}px`
      : `${-188 - index * yStep}px`;

    item.style.setProperty('--rain-rotation', `${rotation}deg`);
    item.style.setProperty('--rain-scale', scale);
    item.style.setProperty('--rain-start-y', side === 'left' ? '100vh' : '-100vh');

    fallback.className = 'cover-fallback';
    fallback.textContent = story.title;

    setImageWithFallback(img, fallback, story, `${story.title} cover`);

    item.appendChild(img);
    item.appendChild(fallback);

    return item;
  }

  function renderFeatureStory(elements, story) {
    setImageWithFallback(
      elements.transitionCover,
      elements.transitionFallback,
      story,
      `${story.title} cover`
    );

    setImageWithFallback(
      elements.soulsBookCover,
      elements.soulsBookFallback,
      story,
      `${story.title} cover`
    );

    elements.soulsBookTitle.textContent = story.title;
    elements.soulsBookCreator.textContent = story.creator || formatTypeLabel(story.type);
  }

  function renderProfileLibraries(elements, stories, featureStory) {
    const leftStories = pickLibraryStories(stories, featureStory, 0);
    const rightStories = pickLibraryStories(stories, featureStory, 3);

    elements.libraryLeft.innerHTML = '';
    elements.libraryRight.innerHTML = '';

    leftStories.forEach((story, index) => {
      elements.libraryLeft.appendChild(
        createLibraryRow(story, index, getLeftStatus(index), story.id === featureStory.id)
      );
    });

    rightStories.forEach((story, index) => {
      elements.libraryRight.appendChild(
        createLibraryRow(story, index, getRightStatus(index), story.id === featureStory.id)
      );
    });
  }

  function pickLibraryStories(stories, featureStory, offset) {
    const pool = stories.filter((story) => story.id !== featureStory.id);
    const picked = [featureStory];

    if (pool.length === 0) {
      return [featureStory, featureStory, featureStory];
    }

    for (let index = 0; picked.length < 3; index += 1) {
      picked.push(pool[(index + offset) % pool.length]);
    }

    return picked;
  }

  function createLibraryRow(story, index, status, isShared) {
    const row = document.createElement('div');
    const cover = document.createElement('div');
    const img = document.createElement('img');
    const fallback = document.createElement('div');
    const title = document.createElement('span');
    const state = document.createElement('strong');

    row.className = isShared
      ? 'souls-library-row souls-row-shared'
      : 'souls-library-row';

    row.dataset.libraryRow = '';
    row.dataset.storyId = story.id;
    row.dataset.rowIndex = String(index);

    cover.className = 'library-row-cover';

    fallback.className = 'cover-fallback';
    fallback.textContent = getShortTitle(story.title);

    setImageWithFallback(img, fallback, story, `${story.title} cover`);

    title.textContent = story.title;
    state.textContent = status;

    cover.appendChild(img);
    cover.appendChild(fallback);

    row.appendChild(cover);
    row.appendChild(title);
    row.appendChild(state);

    return row;
  }

  function showEmptyState(elements, message) {
    elements.section.classList.add('is-static');
    elements.empty.hidden = false;

    const paragraph = elements.empty.querySelector('p');

    if (paragraph && message) {
      paragraph.innerHTML = `${message} Set <strong>featured = true</strong> on anime or manga rows in Supabase.`;
    }
  }

  // ---------------------------------------------------------
  // ANIMATION
  // ---------------------------------------------------------

  function setupSection4Animation(elements) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 980px)').matches;

    if (prefersReducedMotion || isSmallScreen) {
      showStaticFallback(elements);
      return;
    }

    if (!window.gsap || !window.ScrollTrigger) {
      console.error('GSAP or ScrollTrigger is not loaded.');
      showStaticFallback(elements);
      return;
    }

    const { gsap, ScrollTrigger } = window;

    gsap.registerPlugin(ScrollTrigger);

    const section = elements.section;

    const leftItems = gsap.utils.toArray(section.querySelectorAll('.rain-col-left .rain-item'));
    const rightItems = gsap.utils.toArray(section.querySelectorAll('.rain-col-right .rain-item'));
    const allRainItems = [...leftItems, ...rightItems];

    const people = gsap.utils.toArray(section.querySelectorAll('.souls-person'));
    const leftRows = gsap.utils.toArray(elements.cardLeft.querySelectorAll('[data-library-row]'));
    const rightRows = gsap.utils.toArray(elements.cardRight.querySelectorAll('[data-library-row]'));
    const sharedRows = gsap.utils.toArray(section.querySelectorAll('.souls-row-shared'));

    const leftQuote = elements.cardLeft.querySelector('.souls-round-quote');
    const rightQuote = elements.cardRight.querySelector('.souls-round-quote');

    const leftMoment = elements.cardLeft.querySelector('.souls-round-moment');
    const rightMoment = elements.cardRight.querySelector('.souls-round-moment');

    const leftCharacter = elements.cardLeft.querySelector('.souls-round-character');
    const rightCharacter = elements.cardRight.querySelector('.souls-round-character');

    const leftThoughts = elements.cardLeft.querySelector('.souls-round-thoughts');
    const rightThoughts = elements.cardRight.querySelector('.souls-round-thoughts');

    const leftThoughtChars = gsap.utils.toArray(elements.cardLeft.querySelectorAll('[data-type-thought] span'));
    const rightThoughtChars = gsap.utils.toArray(elements.cardRight.querySelectorAll('[data-type-thought] span'));

    gsap.set(elements.soulsSection, {
      opacity: 0,
      pointerEvents: 'none'
    });

    gsap.set(elements.transitionBook, {
      opacity: 0,
      scale: 0.34,
      y: 190
    });

    gsap.set(elements.soulsBook, {
      opacity: 0,
      y: -24
    });

    gsap.set(elements.soulsIntro, {
      opacity: 0,
      y: 18
    });

    gsap.set(elements.cardLeft, {
      opacity: 0,
      x: -76,
      y: 34
    });

    gsap.set(elements.cardRight, {
      opacity: 0,
      x: 76,
      y: 34
    });

    gsap.set(people, {
      opacity: 0,
      y: 16
    });

    gsap.set([...leftRows, ...rightRows], {
      opacity: 0,
      y: 16
    });

    gsap.set([leftQuote, rightQuote, leftMoment, rightMoment, leftCharacter, rightCharacter, leftThoughts, rightThoughts], {
      opacity: 0,
      y: 22
    });

    gsap.set([...leftThoughtChars, ...rightThoughtChars], {
      opacity: 0
    });

    const timeline = gsap.timeline({
      defaults: {
        ease: 'none'
      },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${PIN_DISTANCE}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // PHASE 1 — cover rain.
    timeline.to(leftItems, {
      y: '-190vh',
      rotation: (index) => getRotation(index, 'left') * -1,
      duration: 2.0,
      stagger: {
        each: 0.035,
        from: 'start'
      }
    }, 0);

    timeline.to(rightItems, {
      y: '190vh',
      rotation: (index) => getRotation(index, 'right') * -1,
      duration: 2.0,
      stagger: {
        each: 0.035,
        from: 'start'
      }
    }, 0);

    timeline.to(elements.rainLabel, {
      opacity: 0,
      y: -52,
      duration: 0.48
    }, 0.82);

    // PHASE 1 → PHASE 2 transition.
    timeline.to(allRainItems, {
      opacity: 0,
      scale: 0.82,
      duration: 0.56
    }, 1.48);

    timeline.to(elements.transitionBook, {
      opacity: 1,
      scale: 1,
      y: -210,
      duration: 0.78
    }, 1.48);

    timeline.to(elements.soulsSection, {
      opacity: 1,
      pointerEvents: 'auto',
      duration: 0.34
    }, 1.78);

    timeline.to(elements.soulsBook, {
      opacity: 1,
      y: 0,
      duration: 0.46
    }, 1.84);

    timeline.to(elements.transitionBook, {
      opacity: 0,
      scale: 0.96,
      y: -245,
      duration: 0.34
    }, 2.12);

    timeline.to(elements.soulsIntro, {
      opacity: 1,
      y: 0,
      duration: 0.34
    }, 2.16);

    timeline.to(elements.cardLeft, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.48
    }, 2.34);

    timeline.to(elements.cardRight, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.48
    }, 2.34);

    // Profile build.
    timeline.to(people, {
      opacity: 1,
      y: 0,
      duration: 0.34
    }, 2.62);

    const rowStart = 2.86;
    const maxRows = Math.max(leftRows.length, rightRows.length);

    for (let index = 0; index < maxRows; index += 1) {
      const pair = [leftRows[index], rightRows[index]].filter(Boolean);

      timeline.to(pair, {
        opacity: 1,
        y: 0,
        duration: 0.34
      }, rowStart + index * 0.15);
    }

    timeline.to(sharedRows, {
      boxShadow:
        '0 0 30px rgba(200, 164, 107, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      duration: 0.38
    }, rowStart + 0.34);

    // Round 1 — quotes.
    timeline.to([leftQuote, rightQuote], {
      opacity: 1,
      y: 0,
      duration: 0.48
    }, 3.58);

    // Round 2 — moments.
    timeline.to([leftMoment, rightMoment], {
      opacity: 1,
      y: 0,
      duration: 0.48
    }, 4.12);

    // Round 3 — characters.
    timeline.to([leftCharacter, rightCharacter], {
      opacity: 1,
      y: 0,
      duration: 0.48
    }, 4.66);

    // Round 4 — thoughts + typewriter.
    timeline.to([leftThoughts, rightThoughts], {
      opacity: 1,
      y: 0,
      duration: 0.36
    }, 5.18);

    timeline.to(leftThoughtChars, {
      opacity: 1,
      duration: 0.08,
      stagger: 0.012
    }, 5.28);

    timeline.to(rightThoughtChars, {
      opacity: 1,
      duration: 0.08,
      stagger: 0.012
    }, 5.28);
  }

  function showStaticFallback(elements) {
    elements.section.classList.add('is-static');
    elements.soulsSection.style.pointerEvents = 'auto';
  }

  function splitThoughtText(section) {
    const thoughtElements = section.querySelectorAll('[data-type-thought]');

    thoughtElements.forEach((element) => {
      const text = element.textContent.trim();

      element.setAttribute('aria-label', text);
      element.textContent = '';

      [...text].forEach((character) => {
        const span = document.createElement('span');

        span.setAttribute('aria-hidden', 'true');
        span.textContent = character === ' ' ? '\u00A0' : character;

        element.appendChild(span);
      });
    });
  }

  // ---------------------------------------------------------
  // IMAGE HELPERS
  // ---------------------------------------------------------

  function setImageWithFallback(img, fallback, story, altText) {
    const candidates = story.coverCandidates || getCoverCandidates(story.raw || story);
    let index = 0;

    img.hidden = false;
    img.alt = altText || '';

    fallback.textContent = getShortTitle(story.title);
    fallback.classList.remove('is-hidden');

    if (candidates.length === 0) {
      img.hidden = true;
      img.removeAttribute('src');
      return;
    }

    img.onload = () => {
      fallback.classList.add('is-hidden');
    };

    img.onerror = () => {
      index += 1;

      if (index >= candidates.length) {
        img.hidden = true;
        img.removeAttribute('src');
        fallback.classList.remove('is-hidden');
        return;
      }

      img.src = candidates[index];
    };

    img.src = candidates[index];
  }

  function getCoverCandidates(item) {
    const candidates = [];
    const rawCover = String(item.cover || '').trim();

    addCoverCandidate(candidates, rawCover);

    if (item.id) {
      addCoverCandidate(candidates, `${COVER_FOLDER}/${item.id}.jpg`);
    }

    return [...new Set(candidates.filter(Boolean))];
  }

  function addCoverCandidate(candidates, coverPath) {
    if (!coverPath) {
      return;
    }

    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      candidates.push(coverPath);
      return;
    }

    if (!supabaseClient) {
      candidates.push(coverPath);
      return;
    }

    let storagePath = coverPath;

    // Database may store img/covers/id.jpg.
    // Supabase Storage bucket is already "img", so the path should be covers/id.jpg.
    if (storagePath.startsWith(`${BUCKET_NAME}/`)) {
      storagePath = storagePath.slice(BUCKET_NAME.length + 1);
    }

    if (storagePath.startsWith('/')) {
      storagePath = storagePath.slice(1);
    }

    const { data } = supabaseClient
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    if (data?.publicUrl) {
      candidates.push(data.publicUrl);
    }
  }

  // ---------------------------------------------------------
  // VALUE HELPERS
  // ---------------------------------------------------------

  function getCreatorValue(item) {
    return String(item.creator ?? item.author ?? item.writer ?? '').trim();
  }

  function getScoreValue(item) {
    const value = item.heroScore ?? item.hero_score ?? item.score ?? item.rating ?? '';

    if (value === null || value === undefined || value === '') {
      return '';
    }

    return Number.isFinite(Number(value)) ? Number(value) : String(value);
  }

  function getTypeList(item) {
    const rawType = item.type ?? item.format ?? [];

    return getArrayValue(rawType)
      .map((type) => String(type).toLowerCase().trim())
      .filter(Boolean);
  }

  function getArrayValue(value) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (!trimmed) {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Not JSON. Use it as one value.
      }

      return [trimmed];
    }

    return [value];
  }

  function formatTypeLabel(typeValue) {
    const types = Array.isArray(typeValue)
      ? typeValue
      : getArrayValue(typeValue);

    if (types.length === 0) {
      return 'Anime / Manga';
    }

    return types
      .map((type) => String(type).trim())
      .filter(Boolean)
      .map((type) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase())
      .join(' / ');
  }

  function getShortTitle(title) {
    const words = String(title || '').trim().split(/\s+/);

    if (words.length <= 3) {
      return String(title || '');
    }

    return words.slice(0, 3).join(' ');
  }

  function getLeftStatus(index) {
    const statuses = ['Reading', 'Completed', 'Paused'];
    return statuses[index % statuses.length];
  }

  function getRightStatus(index) {
    const statuses = ['Completed', 'Planned', 'Reading'];
    return statuses[index % statuses.length];
  }

  function getRotation(index, side) {
    const leftRotations = [-7, 4, -3, 8, -5, 2, -8, 6, -4, 7, -2, 5];
    const rightRotations = [5, -8, 3, -6, 7, -4, 8, -3, 6, -7, 4, -5];
    const values = side === 'left' ? leftRotations : rightRotations;

    return values[index % values.length];
  }

  function getScale(index) {
    const scales = [0.92, 1.04, 0.86, 1, 1.1, 0.95, 0.9, 1.06, 0.98, 0.88];
    return scales[index % scales.length];
  }

  // ---------------------------------------------------------
  // RUN
  // ---------------------------------------------------------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSection4);
  } else {
    startSection4();
  }
})();