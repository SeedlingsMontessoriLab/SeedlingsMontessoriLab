const galleries = Array.from(document.querySelectorAll(".gallery-root"));
const menuToggles = Array.from(document.querySelectorAll(".menu-toggle"));

menuToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const nav = button.closest(".history-nav");
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

document.addEventListener("click", (event) => {
  document.querySelectorAll(".history-nav.is-open").forEach((nav) => {
    if (nav.contains(event.target)) {
      return;
    }

    nav.classList.remove("is-open");
    const button = nav.querySelector(".menu-toggle");

    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  });
});

function initGallery(gallery) {
  const slides = Array.from(gallery.querySelectorAll(".slide"));
  const dots = Array.from(gallery.querySelectorAll(".dot"));
  const controls = Array.from(gallery.querySelectorAll(".gallery-button"));

  if (!slides.length) {
    return;
  }

  let currentIndex = 0;
  let autoPlayId;

  function renderSlide(index) {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });

    currentIndex = index;
  }

  function moveSlide(direction) {
    const nextIndex = (currentIndex + direction + slides.length) % slides.length;
    renderSlide(nextIndex);
  }

  function restartAutoplay() {
    window.clearInterval(autoPlayId);
    autoPlayId = window.setInterval(() => moveSlide(1), 5000);
  }

  controls.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.direction === "next" ? 1 : -1;
      moveSlide(direction);
      restartAutoplay();
    });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      renderSlide(index);
      restartAutoplay();
    });
  });

  renderSlide(0);
  restartAutoplay();
}

galleries.forEach(initGallery);
