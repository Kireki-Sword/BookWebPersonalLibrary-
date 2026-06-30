document.addEventListener("DOMContentLoaded", () => {
  const heroItems = document.querySelectorAll(".hero-left > *");
  const heroRight = document.querySelector(".hero-right");

  heroItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
    item.classList.add("hero-animate-up");
  });

  heroRight.classList.add("hero-animate-right");
});