// SECTION 1 — HERO

(() => {
  "use strict";

  const managedByHomeJourney =
    window.__INKWELL_MASTER_JOURNEY__ === true;

  const heroLabel = document.querySelector(".hero-label");
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroP = document.querySelector(".hero-p");
  const heroButtons = document.querySelector(".hero-buttons");
  const heroRight = document.querySelector(".hero-right");

  /*
   * In managed desktop mode, homeScroll.js owns the one-time load entrance.
   * Running this CSS entrance as well caused the text/card to flash twice and
   * left some elements at opacity: 0 after ScrollTrigger refreshed.
   */
  if (!managedByHomeJourney) {
    animateHeroIn();
  }

  function animateHeroIn() {
    heroLabel?.classList.add("hero-animate-up");

    window.setTimeout(() => {
      heroTitle?.classList.add("hero-animate-up");
    }, 200);

    window.setTimeout(() => {
      heroSubtitle?.classList.add("hero-animate-up");
    }, 400);

    window.setTimeout(() => {
      heroP?.classList.add("hero-animate-up");
    }, 550);

    window.setTimeout(() => {
      heroButtons?.classList.add("hero-animate-up");
    }, 700);

    window.setTimeout(() => {
      heroRight?.classList.add("hero-animate-right");
    }, 400);
  }

  // ___ 2. 3D TILT EFFECT ___________________________________

  const cardGlare = document.querySelector(".card-glare");
  const cardEffect = document.querySelector(".card-effect");
  const cardCoverImg = document.querySelector(".card-cover-img");

  if (cardEffect && cardCoverImg && cardGlare) {
    cardEffect.addEventListener("mousemove", (event) => {
      cardEffect.classList.remove("is-resetting");

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

    cardEffect.addEventListener("mouseleave", () => {
      cardEffect.classList.add("is-resetting");

      cardEffect.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        scale(1)
      `;

      cardGlare.style.background = "transparent";
    });
  }

  // ___ 3. NATURAL-PAGE FALLBACK ONLY _____________________________

  if (!managedByHomeJourney) {
    const heroSection = document.querySelector(".hero");
    const heroLeftDiv = document.querySelector(".hero-left");

    if (heroSection && heroLeftDiv && heroRight) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              heroLeftDiv.classList.remove("hero-exiting");
              heroRight.classList.remove("hero-exiting");
            } else {
              heroLeftDiv.classList.add("hero-exiting");
              heroRight.classList.add("hero-exiting");
            }
          });
        },
        {
          threshold: 0.1,
        },
      );

      heroObserver.observe(heroSection);
    }
  }
})();