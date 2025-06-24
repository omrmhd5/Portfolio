// Theme Switcher
const themeSwitch = document.querySelector(".theme-switch");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

// Check for saved theme preference or use system preference
const currentTheme =
  localStorage.getItem("theme") ||
  (prefersDarkScheme.matches ? "dark" : "light");

// Apply theme on load
document.documentElement.setAttribute("data-theme", currentTheme);

// Toggle theme
themeSwitch.addEventListener("click", () => {
  const newTheme =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Scroll Animations
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

// Add fade-in class to elements and observe them
document
  .querySelectorAll(
    ".section-title, .education-card, .course-card, .skill-group, .project-card, .timeline-item, .contact-item"
  )
  .forEach((element) => {
    element.classList.add("fade-in");
    observer.observe(element);
  });

// Typing Effect
const typingText = document.querySelector(".typing-text");
const text = "Omar Mahmoud";
let isDeleting = false;
let charIndex = 0;
let typingDelay = 100;
let deletingDelay = 50;
let endDelay = 2000;

function type() {
  const currentText = text.substring(0, charIndex);
  typingText.textContent = currentText;

  if (!isDeleting && charIndex < text.length) {
    // Typing
    charIndex++;
    typingDelay = 100;
  } else if (isDeleting && charIndex > 0) {
    // Deleting
    charIndex--;
    typingDelay = 50;
  } else if (charIndex === text.length) {
    // Pause at end
    isDeleting = true;
    typingDelay = endDelay;
  } else if (charIndex === 0) {
    // Start typing again
    isDeleting = false;
    typingDelay = 500;
  }

  setTimeout(type, typingDelay);
}

// Start typing effect when page loads
window.addEventListener("load", type);

// Course Object
const courses = [
  {
    logo: "fa-solid fa-laptop-code",
    title: "ITIDA + GIGS - Web Development",
    provider: "ITIDA",
    link: "",
    date: "May 2025",
  },
  {
    logo: "fa-solid fa-terminal",
    title: "SprintUp - Introduction To Testing",
    provider: "SprintUp",
    link: "https://drive.google.com/file/d/1CT1EuLilkaJM5TQ0xFYGe1dwzf-YTvxd/view?usp=drive_link",
    date: "February 2025",
  },
  {
    logo: "fa-brands fa-python",
    title: "Web Development Using Python",
    provider: "ITI",
    link: "https://drive.google.com/file/d/1WIUu_xLtnSNI5fpl9Q7h-lnF9joxPPX7/view",
    date: "February 2025",
  },
  {
    logo: "ri-openai-fill",
    title: "Generative AI: Prompt Engineering Basics",
    provider: "IBM",
    link: "https://www.coursera.org/account/accomplishments/verify/UADQ2ARSNI5B",
    date: "January 2025",
  },
  {
    logo: "ri-ai-generate-2",
    title: "ALX AiCE - AI Career Essentials",
    provider: "ALX",
    link: "https://savanna.alxafrica.com/certificates/3ZN586mcnz",
    date: "August 2024",
  },
  {
    logo: "fa-solid fa-code",
    title: "Introduction to Software Engineering",
    provider: "SprintUp",
    link: "https://www.coursera.org/account/accomplishments/verify/LS358STKH46T",
    date: "July 2024",
  },
  {
    logo: "fa-solid fa-briefcase",
    title: "Digital Business Services Job Simulation",
    provider: "HSBC",
    link: "https://drive.google.com/file/d/1UKT8GxVV5APy8ZofwMz0McCQJ3zGoTAN/view",
    date: "June 2024",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  courses.forEach((course) => {
    const container = document.querySelector(".course-container");

    const courseCard = `<div class="course-card">
          <div class="course-header">
            <div class="course-title">
              <i class="${course.logo}"></i>
              <h3>${course.title}</h3>
            </div>
            <div class="course-content">
              <div class="provider">
                <i class="ri-building-4-line"></i>
                <p>${course.provider}</p>
              </div>
              <a
                href="${course.link}"
                target="_blank"
                class="certificate-link">
                <i class="ri-external-link-line"></i> View Certificate
              </a>
            </div>
          </div>
          <p class="date">${course.date}</p>
        </div>`;

    container.innerHTML += courseCard;
  });
});
