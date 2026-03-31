const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".dot"));
const controls = Array.from(document.querySelectorAll(".gallery-button"));

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
