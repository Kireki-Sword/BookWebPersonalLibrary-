// SECTION 1 — HERO

// ___ 1. TEXT ENTRANCE ANIMATION ON LOAD _______________________

// Grab the left side elements in the order they should animate
const heroLabel = document.querySelector('.hero-label');
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');
const heroP = document.querySelector('.hero-p');
const heroButtons = document.querySelector('.hero-buttons');
const heroRight = document.querySelector('.hero-right');

// Each element animates in with its own delay - creates a cascade effect
function animateHeroIn() {
  if (heroLabel) {
    heroLabel.classList.add('hero-animate-up');
  }

  setTimeout(() => {
    if (heroTitle) {
      heroTitle.classList.add('hero-animate-up');
    }
  }, 200);

  setTimeout(() => {
    if (heroSubtitle) {
      heroSubtitle.classList.add('hero-animate-up');
    }
  }, 400);

  setTimeout(() => {
    if (heroP) {
      heroP.classList.add('hero-animate-up');
    }
  }, 550);

  setTimeout(() => {
    if (heroButtons) {
      heroButtons.classList.add('hero-animate-up');
    }
  }, 700);

  // Card fades in from the right while text is still animating
  setTimeout(() => {
    if (heroRight) {
      heroRight.classList.add('hero-animate-right');
    }
  }, 400);
}

// Run on page load
animateHeroIn();


// ___ 2. 3D TILT EFFECT ___________________________________

const cardGlare = document.querySelector('.card-glare');
const cardEffect = document.querySelector('.card-effect');
const cardCoverImg = document.querySelector('.card-cover-img');

// Only run card effect if all card elements exist
if (cardEffect && cardCoverImg && cardGlare) {
  cardEffect.addEventListener('mousemove', (e) => {
    // Card is actively tracking the cursor - use fast transition
    cardEffect.classList.remove('is-resetting');

    const rect = cardEffect.getBoundingClientRect();

    // Cursor position relative to the center of the card
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Convert position into rotation degrees - max tilt 15deg
    const rotateY = (x / (rect.width / 2)) * 15;
    const rotateX = -(y / (rect.height / 2)) * 15;

    // Apply the 3D tilt to the whole card only
    cardEffect.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;

    // IMPORTANT:
    // Do not move cardCoverImg.
    // Moving the image exposes the beige cover background during tilt.

    // Update the glare position to follow the cursor
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;

    cardGlare.style.background = `
      radial-gradient(
        circle at ${glareX}% ${glareY}%,
        rgba(255,255,255,0.15) 0%,
        rgba(255,255,255,0) 60%
      )
    `;
  });

  // On mouse leave - reset everything smoothly
  cardEffect.addEventListener('mouseleave', () => {
    // Switch to slow resetting transition
    cardEffect.classList.add('is-resetting');

    // Flatten the card back out
    cardEffect.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;

    // Fade the glare out
    cardGlare.style.background = 'transparent';
  });
}


// ___ 3. SCROLL AWAY - HERO FADES WHEN LEAVING VIEWPORT _________

const heroSection = document.querySelector('.hero');
const heroLeftDiv = document.querySelector('.hero-left');

// Only run scroll observer if hero elements exist
if (heroSection && heroLeftDiv && heroRight) {
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Hero back in view - remove exiting state
        heroLeftDiv.classList.remove('hero-exiting');
        heroRight.classList.remove('hero-exiting');
      } else {
        // Hero scrolled out of view - fade it
        heroLeftDiv.classList.add('hero-exiting');
        heroRight.classList.add('hero-exiting');
      }
    });
  }, {
    threshold: 0.1
  });

  heroObserver.observe(heroSection);
}