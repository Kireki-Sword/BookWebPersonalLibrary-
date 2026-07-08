// changeCardSection1.js

(() => {
  // ___ 0. SUPABASE SETUP ___________________________________

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

  function startCardDatabaseScript() {
    if (!window.supabase) {
      console.error('Supabase library is not loaded. Put the Supabase CDN script before changeCardSection1.js');
      return;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ___ 1. CARD ELEMENTS ___________________________________

    const cardEffect = document.querySelector('.card-effect');
    const cardCoverImg = document.querySelector('.card-cover-img');

    const cardType = document.getElementById('card-type');
    const cardTitleEl = document.getElementById('card-title');
    const cardAuthor = document.getElementById('card-author');
    const cardScore = document.getElementById('card-score');

    console.log('Card elements found:', {
      cardEffect,
      cardCoverImg,
      cardType,
      cardTitleEl,
      cardAuthor,
      cardScore
    });

    // ___ 2. HELPERS ___________________________________

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function preloadImage(url) {
      return new Promise((resolve) => {
        if (!url) {
          resolve();
          return;
        }

        const img = new Image();

        img.onload = () => resolve();
        img.onerror = () => resolve();

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

      console.log('Expected Supabase storage path:', `${BUCKET_NAME}/${coverPath}`);
      console.log('Generated cover URL:', data.publicUrl);

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

    // ___ 3. UPDATE HERO CARD ___________________________________

    async function updateHeroCard(item) {
      console.log('updateHeroCard received:', item);

      if (!item) {
        console.warn('No item passed into updateHeroCard');
        return;
      }

      const thisChangeId = ++cardChangeId;
      const coverUrl = getCoverUrlFromId(item.id);

      const imageReady = preloadImage(coverUrl);

      if (cardEffect) {
        cardEffect.classList.add('is-changing');
        cardEffect.classList.remove('is-revealing');
      }

      await wait(350);

      await Promise.race([
        imageReady,
        wait(1200)
      ]);

      if (thisChangeId !== cardChangeId) return;

      if (cardType) {
        cardType.textContent = formatType(item.type);
      }

      if (cardTitleEl) {
        cardTitleEl.textContent = item.title || '';
      }

      if (cardAuthor) {
        cardAuthor.textContent = item.creator ? `by ${item.creator}` : '';
      }

      if (cardScore) {
        cardScore.textContent = getScoreValue(item);
      }

      if (cardCoverImg) {
        if (coverUrl) {
          cardCoverImg.src = coverUrl;
          cardCoverImg.alt = item.title ? `${item.title} cover` : 'Manga cover';
        } else {
          cardCoverImg.removeAttribute('src');
          cardCoverImg.alt = '';
        }
      }

      requestAnimationFrame(() => {
        if (cardEffect) {
          cardEffect.classList.remove('is-changing');
          cardEffect.classList.add('is-revealing');
        }
      });

      setTimeout(() => {
        if (cardEffect) {
          cardEffect.classList.remove('is-revealing');
        }
      }, 650);
    }

    // ___ 4. TEST DATABASE VALUES ONLY ___________________________

    async function testDatabaseValuesOnly() {
      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .limit(5);

      console.log('DATABASE TEST ERROR:', error);
      console.log('DATABASE TEST DATA:', data);

      if (data && data.length > 0) {
        console.log('FIRST DATABASE ROW:', data[0]);
        console.log('DATABASE COLUMN NAMES:', Object.keys(data[0]));
        console.table(data);
      }
    }

    // ___ 5. LOAD FEATURED MANGA FROM SUPABASE ___________________

    async function loadFeaturedManga() {
      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq('featured', true);

      console.log('Featured manga data:', data);
      console.log('Featured manga error:', error);

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

      if (featuredTimer) {
        clearInterval(featuredTimer);
      }

      if (featuredManga.length > 1) {
        featuredTimer = setInterval(() => {
          currentFeaturedIndex = (currentFeaturedIndex + 1) % featuredManga.length;
          updateHeroCard(featuredManga[currentFeaturedIndex]);
        }, FEATURED_ROTATE_MS);
      }
    }

    testDatabaseValuesOnly();
    loadFeaturedManga();

    console.log('changeCardSection1.js loaded successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCardDatabaseScript);
  } else {
    startCardDatabaseScript();
  }
})();