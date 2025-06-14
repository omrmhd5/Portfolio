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
    ".section-title, .education-card, .training-card, .skill-group, .project-card, .timeline-item, .contact-item"
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
