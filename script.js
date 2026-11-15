(() => {
  "use strict";

  const body = document.body;
  const loader = document.getElementById("page-loader");
  const content = document.getElementById("page-content");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  body.classList.add("is-loading");

  const finishIntro = () => {
    if (!loader || loader.dataset.done) return;
    loader.dataset.done = "true";
    loader.remove();
    body.classList.remove("is-loading");
    content?.removeAttribute("aria-hidden");
  };

  if (reduceMotion.matches) {
    finishIntro();
  } else {
    loader?.addEventListener("animationend", (event) => {
      if (event.animationName === "curtain") finishIntro();
    });
    window.setTimeout(finishIntro, 3400);
  }

  // Content fades gently upward as it enters the viewport.
  const revealed = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -5%" }
    );
    revealed.forEach((element) => revealObserver.observe(element));
  } else {
    revealed.forEach((element) => element.classList.add("is-visible"));
  }

  const parallaxSection = document.querySelector(".parallax-section");
  const parallaxImage = document.querySelector(".couple-parallax");
  let parallaxQueued = false;

  const updateParallax = () => {
    parallaxQueued = false;
    if (!parallaxSection || !parallaxImage || reduceMotion.matches) return;
    const bounds = parallaxSection.getBoundingClientRect();
    const progress = (window.innerHeight * 0.5 - (bounds.top + bounds.height * 0.5)) / bounds.height;
    const shift = Math.max(-42, Math.min(42, progress * 72));
    parallaxImage.style.transform = `translate3d(0, ${shift}px, 0) scale(1.03)`;
  };

  const requestParallax = () => {
    if (!parallaxQueued) {
      parallaxQueued = true;
      window.requestAnimationFrame(updateParallax);
    }
  };

  const horizontalSection = document.getElementById("horizontal-scroll");
  const cardTrack = document.getElementById("card-track");
  const cardsIntro = document.querySelector(".cards-intro");
  let horizontalDistance = 0;
  let horizontalQueued = false;

  const horizontalIsPinned = () => window.innerWidth >= 900 && !reduceMotion.matches;

  const measureHorizontal = () => {
    if (!horizontalSection || !cardTrack || !cardsIntro) return;
    if (!horizontalIsPinned()) {
      horizontalSection.style.height = "auto";
      cardTrack.style.transform = "";
      return;
    }

    const sticky = horizontalSection.querySelector(".horizontal-sticky");
    const stickyStyles = sticky ? window.getComputedStyle(sticky) : null;
    const paddingLeft = stickyStyles ? Number.parseFloat(stickyStyles.paddingLeft) || 0 : 0;
    const columnGap = stickyStyles ? Number.parseFloat(stickyStyles.columnGap) || 0 : 0;
    const usableWidth = window.innerWidth - cardsIntro.getBoundingClientRect().width - paddingLeft - columnGap;
    horizontalDistance = Math.max(0, cardTrack.scrollWidth - usableWidth);
    horizontalSection.style.height = `${window.innerHeight + horizontalDistance}px`;
    updateHorizontal();
  };

  const updateHorizontal = () => {
    horizontalQueued = false;
    if (!horizontalSection || !cardTrack || !horizontalIsPinned()) return;
    const top = horizontalSection.getBoundingClientRect().top;
    const progress = horizontalDistance ? Math.min(1, Math.max(0, -top / horizontalDistance)) : 0;
    cardTrack.style.transform = `translate3d(${-horizontalDistance * progress}px, 0, 0)`;
  };

  const requestHorizontal = () => {
    if (!horizontalQueued) {
      horizontalQueued = true;
      window.requestAnimationFrame(updateHorizontal);
    }
  };

  window.addEventListener("scroll", () => {
    requestParallax();
    requestHorizontal();
  }, { passive: true });

  window.addEventListener("resize", () => {
    requestParallax();
    measureHorizontal();
  });

  reduceMotion.addEventListener?.("change", () => {
    measureHorizontal();
    updateParallax();
  });

  window.addEventListener("load", () => {
    measureHorizontal();
    updateParallax();
  }, { once: true });

  measureHorizontal();
  updateParallax();
})();
