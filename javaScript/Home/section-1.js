// SECTION 1 — HERO

(() => {
  "use strict";

  const managedByHomeJourney = window.__INKWELL_MASTER_JOURNEY__ === true;

  const heroLabel = document.querySelector(".hero-label");
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroP = document.querySelector(".hero-p");
  const heroButtons = document.querySelector(".hero-buttons");
  const heroRight = document.querySelector(".hero-right");

  if (!managedByHomeJourney) {
    animateHeroIn();
  }

  function animateHeroIn() {
    heroLabel?.classList.add("hero-animate-up");
    window.setTimeout(() => heroTitle?.classList.add("hero-animate-up"), 200);
    window.setTimeout(() => heroSubtitle?.classList.add("hero-animate-up"), 400);
    window.setTimeout(() => heroP?.classList.add("hero-animate-up"), 550);
    window.setTimeout(() => heroButtons?.classList.add("hero-animate-up"), 700);
    window.setTimeout(() => heroRight?.classList.add("hero-animate-right"), 400);
  }

  const cardGlare = document.querySelector(".card-glare");
  const cardEffect = document.querySelector(".card-effect");
  const cardCoverImg = document.querySelector(".card-cover-img");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (cardEffect && cardCoverImg && cardGlare) {
    cardEffect.addEventListener("mousemove", (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;

      cardEffect.classList.remove("is-resetting");
      const rect = cardEffect.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      const rotateY = (x / (rect.width / 2)) * 15;
      const rotateX = -(y / (rect.height / 2)) * 15;

      cardEffect.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

      const glareX = ((event.clientX - rect.left) / rect.width) * 100;
      const glareY = ((event.clientY - rect.top) / rect.height) * 100;
      cardGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`;
    });

    cardEffect.addEventListener("mouseleave", () => {
      cardEffect.classList.add("is-resetting");
      cardEffect.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
      cardGlare.style.background = "transparent";
    });
  }

  if (!managedByHomeJourney) {
    const heroSection = document.querySelector(".hero");
    const heroLeftDiv = document.querySelector(".hero-left");

    if (heroSection && heroLeftDiv && heroRight && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            heroLeftDiv.classList.toggle("hero-exiting", !entry.isIntersecting);
            heroRight.classList.toggle("hero-exiting", !entry.isIntersecting);
          });
        },
        { threshold: 0.1 },
      );
      heroObserver.observe(heroSection);
    }
  }
})();