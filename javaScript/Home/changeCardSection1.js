// ___ 0. SUPABASE SETUP ___________________________________

const SUPABASE_URL = 'https://hsruxfpslxguhwnccwuj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

const TABLE_NAME = 'manga';
const BUCKET_NAME = 'img';
const COVER_FOLDER = 'covers';

// Change card every 6 seconds
const FEATURED_ROTATE_MS = 6000;

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ___ 1. TEXT ENTRANCE ANIMATION ON LOAD _______________________

const heroLabel = document.querySelector('.hero-label');
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');
const heroP = document.querySelector('.hero-p');
const heroButtons = document.querySelector('.hero-buttons');
const heroRight = document.querySelector('.hero-right');

function animateHeroIn() {
  if (heroLabel) heroLabel.classList.add('hero-animate-up');

  setTimeout(() => {
    if (heroTitle) heroTitle.classList.add('hero-animate-up');
  }, 200);

  setTimeout(() => {
    if (heroSubtitle) heroSubtitle.classList.add('hero-animate-up');
  }, 400);

  setTimeout(() => {
    if (heroP) heroP.classList.add('hero-animate-up');
  }, 550);

  setTimeout(() => {
    if (heroButtons) heroButtons.classList.add('hero-animate-up');
  }, 700);

  setTimeout(() => {
    if (heroRight) heroRight.classList.add('hero-animate-right');
  }, 400);
}

animateHeroIn();


// ___ 2. CARD ELEMENTS ___________________________________

const cardGlare = document.querySelector('.card-glare');
const cardEffect = document.querySelector('.card-effect');
const cardCoverImg = document.querySelector('.card-cover-img');

const cardType = document.getElementById('card-type');
const cardTitleEl = document.getElementById('card-title');
const cardAuthor = document.getElementById('card-author');
const cardScore = document.getElementById('card-score');

let featuredManga = [];
let currentFeaturedIndex = 0;
let featuredTimer = null;
let cardChangeId = 0;


// ___ 3. CARD CHANGE HELPERS ______________________________

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

  // Example:
  // id = manga-20th-century-boys-1999
  // path = covers/manga-20th-century-boys-1999.jpg
  const coverPath = `${COVER_FOLDER}/${id}.jpg`;

  const { data } = supabaseClient
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(coverPath);

  return data.publicUrl;
}

function formatType(typeValue) {
  if (!typeValue) return 'Manga';

  // If type is jsonb like ["manga", "anime"]
  if (Array.isArray(typeValue)) {
    return typeValue.join(' / ');
  }

  return String(typeValue);
}


// ___ 4. UPDATE CARD CONTENT WITH CHANGE EFFECT ___________

async function updateHeroCard(item) {
  if (!item) return;

  const thisChangeId = ++cardChangeId;
  const coverUrl = getCoverUrlFromId(item.id);

  // Start loading image before changing the card
  const imageReady = preloadImage(coverUrl);

  // Fade/blur old card content out
  if (cardEffect) {
    cardEffect.classList.add('is-changing');
    cardEffect.classList.remove('is-revealing');
  }

  await wait(350);

  // Wait for image, but not forever
  await Promise.race([
    imageReady,
    wait(1200)
  ]);

  // Stop if another card change started
  if (thisChangeId !== cardChangeId) return;

  // Change type
  if (cardType) {
    cardType.textContent = formatType(item.type);
  }

  // Change title
  if (cardTitleEl) {
    cardTitleEl.textContent = item.title || '';
  }

  // Change author/creator
  if (cardAuthor) {
    cardAuthor.textContent = item.creator ? `by ${item.creator}` : '';
  }

  // Change score
  if (cardScore) {
    cardScore.textContent = item.heroScore ?? '';
  }

  // Change cover image
  if (cardCoverImg) {
    if (coverUrl) {
      cardCoverImg.src = coverUrl;
      cardCoverImg.alt = item.title ? `${item.title} cover` : 'Manga cover';
    } else {
      cardCoverImg.removeAttribute('src');
      cardCoverImg.alt = '';
    }
  }

  // Reveal new card content
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


// ___ 5. LOAD FEATURED MANGA FROM SUPABASE ________________

async function loadFeaturedManga() {
  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select('id, title, creator, heroScore, type, featured')
    .eq('featured', true)
    .order('heroScore', { ascending: false });

  console.log('Featured manga data:', data);
  console.log('Featured manga error:', error);

  if (error) {
    console.error('Could not load featured manga:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.warn('No featured manga found. Set featured = true on some rows.');
    return;
  }

  featuredManga = data;
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

loadFeaturedManga();