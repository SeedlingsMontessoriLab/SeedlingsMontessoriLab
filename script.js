const galleries = Array.from(document.querySelectorAll(".gallery-root"));
const calendarGalleries = Array.from(document.querySelectorAll("[data-calendar-gallery]"));
const menuToggles = Array.from(document.querySelectorAll(".menu-toggle"));
const isSubpage = Boolean(document.querySelector(".subpage-shell"));
const calendarYear = 2026;
const calendarMonths = [
  { month: 5, name: "June", closed: [{ day: 19, label: "Juneteenth National Independence Day" }] },
  {
    month: 6,
    name: "July",
    note: "Closed: Independence Day observed (July 3). Independence Day falls on Saturday, July 4.",
    closed: [{ day: 3, label: "Independence Day observed" }],
  },
  { month: 7, name: "August", note: "No national holidays. Regular preschool schedule.", closed: [] },
  { month: 8, name: "September", closed: [{ day: 7, label: "Labor Day" }] },
  { month: 9, name: "October", closed: [{ day: 12, label: "Indigenous Peoples' Day / Columbus Day" }] },
  {
    month: 10,
    name: "November",
    note: "Closed: Veterans Day (Nov 11) and Thanksgiving Break (Nov 25-27).",
    closed: [
      { day: 11, label: "Veterans Day" },
      { day: 25, label: "Early Thanksgiving Break" },
      { day: 26, label: "Thanksgiving Day" },
      { day: 27, label: "Thanksgiving Break" },
    ],
  },
  {
    month: 11,
    name: "December",
    note: "Closed: Winter Break (Dec 21-31). Christmas Day and New Year's Eve are included.",
    closed: [
      { day: 21, label: "Winter Break" },
      { day: 22, label: "Winter Break" },
      { day: 23, label: "Winter Break" },
      { day: 24, label: "Winter Break" },
      { day: 25, label: "Christmas Day, included in winter break" },
      { day: 26, label: "Winter Break" },
      { day: 27, label: "Winter Break" },
      { day: 28, label: "Winter Break" },
      { day: 29, label: "Winter Break" },
      { day: 30, label: "Winter Break" },
      { day: 31, label: "New Year's Eve, included in winter break" },
    ],
  },
];
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

if (isSubpage && !window.location.hash) {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const scrollToTop = () => {
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  window.addEventListener("DOMContentLoaded", scrollToTop);
  window.addEventListener("load", scrollToTop);
  window.addEventListener("pageshow", scrollToTop);
}

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

function buildCalendarGallery(gallery) {
  const track = gallery.querySelector(".calendar-gallery-track");
  const dots = gallery.querySelector(".calendar-dots");

  if (!track || !dots) {
    return;
  }

  track.innerHTML = calendarMonths
    .map((monthData, monthIndex) => {
      const firstDay = new Date(calendarYear, monthData.month, 1).getDay();
      const daysInMonth = new Date(calendarYear, monthData.month + 1, 0).getDate();
      const closedByDay = new Map(monthData.closed.map((holiday) => [holiday.day, holiday.label]));
      const note = monthData.note || (monthData.closed.length
        ? `Closed: ${monthData.closed.map((holiday) => `${holiday.label} (${monthData.name} ${holiday.day})`).join(", ")}`
        : "No national holidays.");
      const blanks = Array.from({ length: firstDay }, () => '<span class="calendar-blank" aria-hidden="true"></span>')
        .join("");
      const days = Array.from({ length: daysInMonth }, (_, dayIndex) => {
        const day = dayIndex + 1;
        const holidayLabel = closedByDay.get(day);
        const dayOfWeek = new Date(calendarYear, monthData.month, day).getDay();
        const classes = ["calendar-day"];

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          classes.push("is-weekend");
        }

        if (holidayLabel) {
          classes.push("is-closed");
        }

        const ariaLabel = holidayLabel
          ? `${monthData.name} ${day}, ${holidayLabel}, school closed`
          : `${monthData.name} ${day}`;

        return `<span class="${classes.join(" ")}" aria-label="${ariaLabel}">${day}</span>`;
      }).join("");
      const weekdays = weekdayLabels.map((day) => `<span>${day}</span>`).join("");

      return `
        <article class="slide calendar-slide${monthIndex === 0 ? " active" : ""}" aria-label="${monthData.name} ${calendarYear}">
          <div class="calendar-month-header">
            <h3>${monthData.name} ${calendarYear}</h3>
            <p class="calendar-month-note">${note}</p>
          </div>
          <div class="calendar-weekdays" aria-hidden="true">${weekdays}</div>
          <div class="calendar-days">${blanks}${days}</div>
        </article>
      `;
    })
    .join("");

  dots.innerHTML = calendarMonths
    .map((monthData, monthIndex) => {
      const activeClass = monthIndex === 0 ? " active" : "";
      const isActive = monthIndex === 0 ? "true" : "false";

      return `<button class="dot${activeClass}" type="button" aria-label="Show ${monthData.name} ${calendarYear}" aria-pressed="${isActive}"></button>`;
    })
    .join("");
}

function initGallery(gallery) {
  const slides = Array.from(gallery.querySelectorAll(".slide"));
  const dots = Array.from(gallery.querySelectorAll(".dot"));
  const controls = Array.from(gallery.querySelectorAll(".gallery-button"));
  const shouldAutoplay = gallery.dataset.autoplay !== "false";

  if (!slides.length) {
    return;
  }

  let currentIndex = 0;
  let autoPlayId;
  let touchStartX = 0;
  let touchStartY = 0;

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
    if (!shouldAutoplay) {
      return;
    }

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

  gallery.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  gallery.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
      moveSlide(deltaX < 0 ? 1 : -1);
      restartAutoplay();
    }
  });

  renderSlide(0);
  restartAutoplay();
}

calendarGalleries.forEach(buildCalendarGallery);
galleries.forEach(initGallery);
