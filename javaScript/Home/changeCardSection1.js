// changeCardSection1.js

(() => {
  const SUPABASE_URL = 'https://hsruxfpslxguhwnccwuj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

  const TABLE_NAME = 'manga';
  const BUCKET_NAME = 'img';
  const COVER_FOLDER = 'covers';

  const FEATURED_ROTATE_MS = 6000;

  let supabaseClient = null;
  let featuredManga = [];
  let currentFeaturedIndex = 0;
  let featuredTimer = null;
  let cardChangeId = 0;
  let hasRenderedFirstCard = false;

  function startCardDatabaseScript() {
    if (!window.supabase) {
      console.error('Supabase library is not loaded.');
      return;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const cardEffect = document.querySelector('.card-effect');
    const cardCoverImg = document.querySelector('.card-cover-img');

    const cardType = document.getElementById('card-type');
    const cardTitleEl = document.getElementById('card-title');
    const cardAuthor = document.getElementById('card-author');
    const cardScore = document.getElementById('card-score');

    if (!cardEffect || !cardCoverImg || !cardType || !cardTitleEl || !cardAuthor || !cardScore) {
      console.error('Missing one or more Section 1 card elements.', {
        cardEffect,
        cardCoverImg,
        cardType,
        cardTitleEl,
        cardAuthor,
        cardScore
      });
      return;
    }

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function preloadImage(url) {
      return new Promise((resolve) => {
        if (!url) {
          resolve(false);
          return;
        }

        const img = new Image();

        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);

        img.src = url;
      });
    }

    function getCoverUrlFromId(id) {
      if (!id) return '';

      const coverPath = `${COVER_FOLDER}/${id}.jpg`;

      const { data } = supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(coverPath);

      return data.publicUrl;
    }

    function formatType(typeValue) {
      if (!typeValue) return 'Manga';

      if (Array.isArray(typeValue)) {
        return typeValue.join(' / ');
      }

      return String(typeValue);
    }

    function getScoreValue(item) {
      return item.heroScore ?? item.hero_score ?? item.score ?? item.rating ?? '';
    }

    function getCreatorValue(item) {
      return item.creator ?? item.author ?? item.writer ?? '';
    }

    function applyCardContent(item, coverUrl) {
      cardType.textContent = formatType(item.type);
      cardTitleEl.textContent = item.title || '';

      const creator = getCreatorValue(item);
      cardAuthor.textContent = creator ? `by ${creator}` : '';

      cardScore.textContent = getScoreValue(item);

      if (coverUrl) {
        cardCoverImg.src = coverUrl;
        cardCoverImg.alt = item.title ? `${item.title} cover` : 'Story cover';
      } else {
        cardCoverImg.removeAttribute('src');
        cardCoverImg.alt = '';
      }
    }

    async function updateHeroCard(item) {
      if (!item) return;

      const thisChangeId = ++cardChangeId;
      const coverUrl = getCoverUrlFromId(item.id);

      if (!hasRenderedFirstCard) {
        hasRenderedFirstCard = true;

        /*
         * The whole hero card already receives one entrance from homeScroll.js.
         * Do not run another internal reveal on the first database result or
         * the card looks like it is loading several times.
         */
        applyCardContent(item, coverUrl);

        cardEffect.classList.remove('is-swapping');
        cardEffect.classList.remove('is-changing');
        cardEffect.classList.remove('is-revealing');

        preloadImage(coverUrl).then((loaded) => {
          if (!loaded) {
            console.warn('Cover failed to load:', coverUrl);
          }
        });

        return;
      }

      const imageReady = preloadImage(coverUrl);

      await Promise.race([
        imageReady,
        wait(1200)
      ]);

      if (thisChangeId !== cardChangeId) return;

      cardEffect.classList.add('is-swapping');
      cardEffect.classList.remove('is-changing');
      cardEffect.classList.remove('is-revealing');

      await wait(260);

      if (thisChangeId !== cardChangeId) return;

      applyCardContent(item, coverUrl);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cardEffect.classList.remove('is-swapping');
          cardEffect.classList.add('is-revealing');
        });
      });

      setTimeout(() => {
        cardEffect.classList.remove('is-revealing');
      }, 650);
    }


    function scheduleFeaturedRotation() {
      if (featuredTimer) {
        clearInterval(featuredTimer);
        featuredTimer = null;
      }

      if (featuredManga.length <= 1) {
        return;
      }

      const startRotation = () => {
        if (featuredTimer) {
          return;
        }

        featuredTimer = setInterval(() => {
          currentFeaturedIndex =
            (currentFeaturedIndex + 1) % featuredManga.length;

          updateHeroCard(featuredManga[currentFeaturedIndex]);
        }, FEATURED_ROTATE_MS);
      };

      /*
       * While the master journey is preparing, keep the first cover stable.
       * Rotation begins only after the pinned timeline is ready, preventing
       * several card swaps during the initial page setup.
       */
      if (
        window.__INKWELL_MASTER_JOURNEY__ === true &&
        !window.InkwellHomeJourney
      ) {
        window.addEventListener(
          'inkwell:home-journey-ready',
          startRotation,
          { once: true }
        );

        return;
      }

      startRotation();
    }

    async function loadFeaturedManga() {
      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq('featured', true);

      console.log('SECTION 1 FEATURED DATA:', data);
      console.log('SECTION 1 FEATURED ERROR:', error);

      if (error) {
        console.error('Could not load featured manga:', error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No featured manga found. Check if featured = true in Supabase.');
        return;
      }

      featuredManga = data.sort((a, b) => {
        const scoreA = Number(getScoreValue(a)) || 0;
        const scoreB = Number(getScoreValue(b)) || 0;
        return scoreB - scoreA;
      });

      currentFeaturedIndex = 0;
      updateHeroCard(featuredManga[currentFeaturedIndex]);

      scheduleFeaturedRotation();
    }

    loadFeaturedManga();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCardDatabaseScript);
  } else {
    startCardDatabaseScript();
  }
})();