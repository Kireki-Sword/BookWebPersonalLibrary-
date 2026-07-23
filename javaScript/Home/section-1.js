// SECTION 1 — HERO

// ___ 1. TEXT ENTRANCE ANIMATION ON LOAD _______________________

const heroLabel = document.querySelector('.hero-label');
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');
const heroP = document.querySelector('.hero-p');
const heroButtons = document.querySelector('.hero-buttons');
const heroRight = document.querySelector('.hero-right');

function animateHeroIn() {
  if (heroLabel) {
    heroLabel.classList.add('hero-animate-up');
  }

  setTimeout(() => {
    heroTitle?.classList.add('hero-animate-up');
  }, 200);

  setTimeout(() => {
    heroSubtitle?.classList.add('hero-animate-up');
  }, 400);

  setTimeout(() => {
    heroP?.classList.add('hero-animate-up');
  }, 550);

  setTimeout(() => {
    heroButtons?.classList.add('hero-animate-up');
  }, 700);

  setTimeout(() => {
    heroRight?.classList.add('hero-animate-right');
  }, 400);
}

animateHeroIn();


// ___ 2. 3D TILT EFFECT ___________________________________

const cardGlare = document.querySelector('.card-glare');
const cardEffect = document.querySelector('.card-effect');
const cardCoverImg = document.querySelector('.card-cover-img');

if (cardEffect && cardCoverImg && cardGlare) {
  cardEffect.addEventListener('mousemove', (event) => {
    cardEffect.classList.remove('is-resetting');

    const rect = cardEffect.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    const rotateY = (x / (rect.width / 2)) * 15;
    const rotateX = -(y / (rect.height / 2)) * 15;

    cardEffect.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;

    const glareX = ((event.clientX - rect.left) / rect.width) * 100;
    const glareY = ((event.clientY - rect.top) / rect.height) * 100;

    cardGlare.style.background = `
      radial-gradient(
        circle at ${glareX}% ${glareY}%,
        rgba(255,255,255,0.15) 0%,
        rgba(255,255,255,0) 60%
      )
    `;
  });

  cardEffect.addEventListener('mouseleave', () => {
    cardEffect.classList.add('is-resetting');

    cardEffect.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;

    cardGlare.style.background = 'transparent';
  });
}


// ___ 3. NATURAL-PAGE FALLBACK ONLY _____________________________

/*
 * The old IntersectionObserver faded Section 1 whenever the section left the
 * document viewport. That conflicts with the new master pinned timeline,
 * because the master timeline must be the only code controlling Section 1's
 * exit and reverse animation.
 *
 * Keep the observer only when the master journey is not being used.
 */
if (window.__INKWELL_MASTER_JOURNEY__ !== true) {
  const heroSection = document.querySelector('.hero');
  const heroLeftDiv = document.querySelector('.hero-left');

  if (heroSection && heroLeftDiv && heroRight) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          heroLeftDiv.classList.remove('hero-exiting');
          heroRight.classList.remove('hero-exiting');
        } else {
          heroLeftDiv.classList.add('hero-exiting');
          heroRight.classList.add('hero-exiting');
        }
      });
    }, {
      threshold: 0.1
    });

    heroObserver.observe(heroSection);
  }
}