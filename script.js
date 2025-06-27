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

// Front End Skills Object
const frontEndSkills = [
  { logo: "fa-brands fa-html5", name: "HTML", color: "#e34c26" },
  { logo: "fa-brands fa-css3-alt", name: "CSS", color: "#2965f1" },
  { logo: "fa-brands fa-js", name: "JavaScript", color: "#f0db4f" },
  { logo: "fa-brands fa-react", name: "React", color: "#61dafb" },
  { logo: "fa-brands fa-angular", name: "Angular", color: "#dd0031" },
  { logo: "fa-brands fa-bootstrap", name: "Bootstrap", color: "#7952b3" },
  { logo: "ri-tailwind-css-fill", name: "Tailwind CSS", color: "#38bdf8" },
];

// Back End Skills Object
const backEndSkills = [
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0,0,255.99536,255.99536">
<g fill="#3c873a" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8,8)"><path d="M15.99414,3c-0.365,0 -0.72992,0.08953 -1.04492,0.26953l-9.91016,5.7207c-0.64,0.37 -1.03906,1.07055 -1.03906,1.81055v10.37891c0,0.75 0.39906,1.44055 1.03906,1.81055l2.60156,1.5c1.26,0.62 1.7093,0.61914 2.2793,0.61914c1.87,0 2.93945,-1.12984 2.93945,-3.08984v-10.70898c0,-0.16 -0.12906,-0.29102 -0.28906,-0.29102h-1.25c-0.17,0 -0.29101,0.13102 -0.29101,0.29102v10.69922c0,0.88 -0.90891,1.73977 -2.37891,1.00977l-2.7207,-1.57031c-0.1,-0.05 -0.16016,-0.15953 -0.16016,-0.26953v-10.36914c0,-0.12 0.06016,-0.22125 0.16016,-0.28125l9.91016,-5.71875c0.09,-0.06 0.21055,-0.06 0.31055,0l9.91016,5.71875c0.1,0.06 0.16016,0.16148 0.16016,0.27148v10.37891c0,0.11 -0.06039,0.21953 -0.15039,0.26953l-9.91992,5.73047c-0.09,0.05 -0.22055,0.05 -0.31055,0l-2.55078,-1.50977c-0.07,-0.05 -0.16828,-0.05953 -0.23828,-0.01953c-0.71,0.4 -0.84,0.44969 -1.5,0.67969c-0.16,0.05 -0.41016,0.14969 0.08984,0.42969l3.30859,1.96094c0.32,0.18 0.68102,0.2793 1.04101,0.2793c0.37,0 0.72883,-0.0993 1.04883,-0.2793l9.92188,-5.73047c0.64,-0.37 1.03906,-1.06055 1.03906,-1.81055v-10.36914c0,-0.75 -0.39906,-1.44055 -1.03906,-1.81055l-9.92188,-5.73047c-0.315,-0.18 -0.67992,-0.26953 -1.04492,-0.26953zM18.66016,11.00586c-2.83,0 -4.51953,1.19922 -4.51953,3.19922c0,2.17 1.67844,2.76906 4.39844,3.03906c3.25,0.32 3.5,0.80141 3.5,1.44141c0,1.1 -0.88852,1.57031 -2.97852,1.57031c-2.63,0 -3.21039,-0.66094 -3.40039,-1.96094c-0.02,-0.14 -0.1393,-0.24023 -0.2793,-0.24023h-1.29101c-0.16,0 -0.2793,0.13125 -0.2793,0.28125c0,1.67 0.91,3.6582 5.25,3.6582c3.14,0 4.93945,-1.23844 4.93945,-3.39844c0,-2.14 -1.45023,-2.71109 -4.49023,-3.12109c-3.09,-0.4 -3.40039,-0.61008 -3.40039,-1.33008c0,-0.6 0.27078,-1.38867 2.55078,-1.38867c2.03,0 2.78961,0.43859 3.09961,1.80859c0.03,0.13 0.1393,0.23047 0.2793,0.23047h1.29102c0.08,0 0.14898,-0.03961 0.20898,-0.09961c0.05,-0.05 0.08031,-0.1307 0.07031,-0.2207c-0.2,-2.36 -1.76922,-3.46875 -4.94922,-3.46875z"></path></g></g>
</svg>`,
    name: "Node.js",
  },
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="45" height="45" viewBox="0 0 50 50">
<path d="M49.729 11h-.85c-1.051 0-2.041.49-2.68 1.324l-8.7 11.377-8.7-11.377C28.162 11.49 27.171 11 26.121 11h-.85l10.971 14.346L25.036 40h.85c1.051 0 2.041-.49 2.679-1.324L37.5 26.992l8.935 11.684C47.073 39.51 48.063 40 49.114 40h.85L38.758 25.346 49.729 11zM21.289 34.242c-2.554 3.881-7.582 5.87-12.389 4.116C4.671 36.815 2 32.611 2 28.109L2 27h12v0h11l0-4.134c0-6.505-4.818-12.2-11.295-12.809C6.273 9.358 0 15.21 0 22.5l0 5.573c0 5.371 3.215 10.364 8.269 12.183 6.603 2.376 13.548-1.17 15.896-7.256 0 0 0 0 0 0h-.638C22.616 33 21.789 33.481 21.289 34.242zM2 22.5C2 16.71 6.71 12 12.5 12S23 16.71 23 22.5V25H2V22.5z"></path>
</svg>`,
    name: "Express.js",
  },
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64" height="64" viewBox="0,0,255.99536,255.99536">
<g fill="#777bb3" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,12c-6.49219,0 -12.37891,1.35938 -16.72656,3.62891c-4.34766,2.26953 -7.27344,5.53906 -7.27344,9.37109c0,3.83203 2.92578,7.10156 7.27344,9.37109c4.34766,2.26953 10.23437,3.62891 16.72656,3.62891c6.49219,0 12.37891,-1.35937 16.72656,-3.62891c4.34766,-2.26953 7.27344,-5.53906 7.27344,-9.37109c0,-3.83203 -2.92578,-7.10156 -7.27344,-9.37109c-4.34766,-2.26953 -10.23437,-3.62891 -16.72656,-3.62891zM25,14c6.21094,0 11.82422,1.32422 15.80078,3.40234c3.97656,2.07422 6.19922,4.80078 6.19922,7.59766c0,2.79688 -2.22266,5.52344 -6.19922,7.59766c-3.97656,2.07813 -9.58984,3.40234 -15.80078,3.40234c-6.21094,0 -11.82422,-1.32422 -15.80078,-3.40234c-3.97656,-2.07422 -6.19922,-4.80078 -6.19922,-7.59766c0,-2.79687 2.22266,-5.52344 6.19922,-7.59766c3.97656,-2.07812 9.58984,-3.40234 15.80078,-3.40234zM22.50781,16l-2.50781,12h2.625l1.26563,-6h2.09766c0.66797,0 1.11328,0.10938 1.32031,0.33203c0.20313,0.22266 0.24609,0.64453 0.12891,1.25l-0.95703,4.41797h2.66406l1.03906,-4.77734c0.22266,-1.14453 0.05469,-1.98437 -0.5,-2.49609c-0.56641,-0.51953 -1.5625,-0.72656 -3.04687,-0.72656h-2.33984l0.83203,-4zM11,20l-2.02734,11h2.64453l0.52734,-3h1.64844c3.44531,0 5.32031,-0.79687 6.01953,-3.75391c0.60156,-2.54297 -0.9375,-4.24609 -3.48047,-4.24609zM32,20l-2.02734,11h2.64453l0.52734,-3h1.64844c3.44531,0 5.32031,-0.79687 6.01953,-3.75391c0.60156,-2.54297 -0.9375,-4.24609 -3.48047,-4.24609zM13.27344,22h2.05859c1.71094,0 2.07031,0.76953 1.98047,1.625c-0.23047,2.20703 -1.60547,2.375 -3.08203,2.375h-1.71484zM34.27344,22h2.05859c1.71094,0 2.07031,0.76953 1.98047,1.625c-0.23047,2.20703 -1.60547,2.375 -3.08203,2.375h-1.71484z"></path></g></g>
</svg>`,
    name: "PHP",
  },
  {
    logo: `<svg fill="#F05340" width="64px" height="64px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M23.642 5.43a.364.364 0 0 1 .014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 0 1-.188.326L9.93 23.949a.316.316 0 0 1-.066.027c-.008.002-.016.008-.024.01a.348.348 0 0 1-.192 0c-.011-.002-.02-.008-.03-.012-.02-.008-.042-.014-.062-.025L.533 18.755a.376.376 0 0 1-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 0 1 .023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034H.53L5.043.05a.375.375 0 0 1 .375 0L9.93 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 0 1 .024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 0 1 .375 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033a.3.3 0 0 1 .024.06c.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.51 7.75v-4.287l-2.147 1.225-6.126 3.498v4.325zM1.093 3.624v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003H5.04c-.014-.01-.025-.021-.04-.031-.011-.01-.024-.018-.035-.027l-.001-.002c-.013-.012-.021-.025-.031-.04-.01-.011-.021-.022-.028-.036h-.002c-.008-.014-.013-.031-.02-.047-.006-.016-.014-.027-.018-.043a.49.49 0 0 1-.008-.057c-.002-.014-.006-.027-.006-.041V5.789l-2.18-1.257zM5.23.81 1.47 2.974l3.76 2.164 3.758-2.164zm1.956 13.505 2.182-1.256V3.624l-1.58.91-2.182 1.255v9.435zm11.581-10.95-3.76 2.163 3.76 2.163 3.759-2.164zm-.376 4.978L16.21 7.087l-1.58-.907v4.283l2.182 1.256 1.58.908zm-8.65 9.654 5.514-3.148 2.756-1.572-3.757-2.163-4.323 2.489-3.941 2.27z"></path></g></svg>`,
    name: "Laravel",
  },
  {
    logo: `<svg width="64px" height="64px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>file_type_django</title><path d="M14.135,4H18.1V22.169a26.218,26.218,0,0,1-5.143.535c-4.842-.005-7.362-2.168-7.362-6.322,0-4,2.673-6.6,6.816-6.6a6.448,6.448,0,0,1,1.724.2V4Zm0,9.142a3.992,3.992,0,0,0-1.337-.2c-2,0-3.163,1.223-3.163,3.366,0,2.087,1.107,3.239,3.138,3.239a9.355,9.355,0,0,0,1.362-.1v-6.3Z" style="fill:#44b78b"></path><path d="M24.4,10.059v9.1c0,3.133-.235,4.639-.923,5.938A6.316,6.316,0,0,1,20.237,28l-3.678-1.733A5.708,5.708,0,0,0,19.7,23.638c.566-1.121.745-2.42.745-5.837V10.059Z" style="fill:#44b78b"></path><rect x="20.441" y="4.02" width="3.964" height="4.028" style="fill:#44b78b"></rect></g></svg>`,
    name: "Django",
  },
];

// Database and Tools Object
const databaseAndTools = [
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
<path fill="#5d4037" d="M42,17.3C42,37.8,24,44,24,44S6,37.8,6,17.3c0-2.5,0.2-4.6,0.4-6.3c0.3-2.5,2-4.5,4.4-5.1 C13.9,5,18.8,4,24,4s10.1,1,13.3,1.9c2.4,0.6,4.1,2.7,4.4,5.1C41.8,12.7,42,14.9,42,17.3z"></path><path fill="#4caf50" d="M24,7c4.9,0,9.5,1,12.5,1.8c1.2,0.3,2,1.3,2.2,2.6c0.2,1.9,0.3,3.9,0.3,5.9c0,15.6-11.5,21.9-15,23.4 c-3.5-1.6-15-7.9-15-23.4c0-2,0.1-4,0.3-5.9c0.1-1.3,1-2.3,2.2-2.6C14.5,8,19.1,7,24,7 M24,4c-5.2,0-10.1,1-13.3,1.9 C8.4,6.5,6.6,8.6,6.4,11C6.2,12.7,6,14.9,6,17.3C6,37.8,24,44,24,44s18-6.2,18-26.7c0-2.5-0.2-4.6-0.4-6.3c-0.3-2.5-2-4.5-4.4-5.1 C34.1,5,29.2,4,24,4L24,4z"></path><path fill="#dcedc8" d="M23 28H25V36H23z"></path><path fill="#4caf50" d="M24,10c0,0-6,5-6,13c0,5.2,3.3,8.5,5,10l1-3l1,3c1.7-1.5,5-4.8,5-10C30,15,24,10,24,10z"></path><path fill="#81c784" d="M24,10c0,0-6,5-6,13c0,5.2,3.3,8.5,5,10l1-3V10z"></path>
</svg>`,
    name: "MongoDB",
  },
  {
    logo: `<svg width="50px" height="50px" viewBox="0 -2 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M235.648276,194.211632 C221.729851,193.864559 210.942872,195.257272 201.895604,199.083964 C199.285899,200.127406 195.109927,200.128498 194.761767,203.433458 C196.154498,204.826189 196.328034,207.087716 197.546096,209.001055 C199.635192,212.479551 203.287247,217.178343 206.593317,219.614507 C210.246461,222.397748 213.900691,225.180989 217.727416,227.617153 C224.513092,231.793125 232.168625,234.22817 238.779677,238.404123 C242.608577,240.838067 246.434123,243.971711 250.261934,246.581411 C252.176407,247.971926 253.393381,250.234545 255.829549,251.104446 L255.829549,250.582732 C254.611442,249.016479 254.263282,246.754952 253.046308,245.015144 C251.307592,243.275341 249.566702,241.709083 247.826899,239.96928 C242.781025,233.1847 236.518133,227.268984 229.732547,222.397748 C224.166065,218.56995 211.986355,213.35055 209.724764,206.913051 C209.724764,206.913051 209.55014,206.73951 209.376604,206.56597 C213.204371,206.217787 217.727416,204.82618 221.381691,203.781623 C227.297466,202.215374 232.690457,202.563548 238.779677,200.998382 C241.562919,200.30203 244.347292,199.432129 247.130533,198.562222 L247.130533,196.997075 C244.00022,193.864532 241.737588,189.689684 238.431517,186.731778 C229.558965,179.075113 219.815379,171.595269 209.724764,165.332394 C204.330685,161.852792 197.371472,159.590151 191.630412,156.633369 C189.543536,155.587729 186.062797,155.06712 184.845823,153.327299 C181.713302,149.499523 179.973499,144.45476 177.711982,139.930579 C172.668329,130.360605 167.794863,119.749306 163.44541,109.658665 C160.315096,102.872993 158.400651,96.0872892 154.572862,89.8245233 C136.653166,60.2479054 117.167095,42.3281102 87.242308,24.7554574 C80.8048232,21.1023052 73.1503779,19.5360541 64.9730628,17.6227124 C60.6246649,17.4480683 56.2740469,17.1009966 51.9245072,16.9263525 C49.1412661,15.7082579 46.3569195,12.4033092 43.9207465,10.8370441 C34.0058755,4.5730961 8.42942301,-8.99607108 1.1220548,8.92370237 C-3.57563582,20.2324516 8.08126754,31.366477 12.0825475,37.1086812 C15.041536,41.1100178 18.8682195,45.6330512 20.9562053,50.1572463 C22.1742941,53.1129226 22.5213621,56.2465484 23.7394509,59.3779766 C26.523793,67.031339 29.1323922,75.5578744 32.7866404,82.691806 C34.7010855,86.3449577 36.7879657,90.1727422 39.2241297,93.477666 C40.6157457,95.3910055 43.0508086,96.2620126 43.5736286,99.3934363 C41.1385747,102.873029 40.9639284,108.092452 39.5711977,112.441992 C33.3083548,132.101492 35.7445143,156.4588 44.617071,170.89889 C47.4003121,175.247297 54.0124069,184.818421 62.8850316,181.164182 C70.7141415,178.032744 68.9743337,168.115626 71.2358604,159.41661 C71.7586894,157.327523 71.4105022,155.937017 72.4539446,154.545383 C72.4548508,154.718924 72.4539446,154.893561 72.4539446,154.893561 C74.8901041,159.764788 77.3251715,164.46251 79.5866891,169.333656 C84.980736,177.858025 94.3750434,186.731674 102.204103,192.647503 C106.381181,195.777808 109.686136,201.171877 114.905523,203.086313 L114.905523,202.563484 L114.557345,202.563484 C113.512801,200.997231 111.947645,200.301958 110.55602,199.083892 C107.424591,195.952463 103.943884,192.124665 101.50883,188.645081 C94.2025447,178.901486 87.7639408,168.115635 82.0228486,156.980496 C79.2396075,151.587555 76.8034481,145.671734 74.5419214,140.278811 C73.497378,138.189729 73.497378,135.059406 71.7575748,134.015973 C69.1478745,137.842647 65.3211911,141.148717 63.4067461,145.846417 C60.1028916,153.327344 59.7536034,162.548097 58.5355192,172.116947 C57.8402503,172.291598 58.187332,172.116947 57.8391493,172.465138 C52.2726627,171.072408 50.3582176,165.332394 48.2701955,160.460052 C43.0507905,148.107926 42.1808935,128.273684 46.7050387,114.008236 C47.923123,110.353988 53.142528,98.8717128 51.0545422,95.3921019 C50.0110998,92.0860273 46.5303924,90.1726969 44.6170529,87.5629967 C42.3555262,84.2569266 39.9193668,80.082065 38.35421,76.4278576 C34.1782383,66.6853811 32.0902615,55.898411 27.5672354,46.1548154 C25.4792496,41.6306665 21.8261069,36.9340837 18.8682195,32.7592063 C15.563264,28.0615284 11.9090067,24.7554574 9.29927023,19.1878506 C8.43046966,17.2745089 7.21128439,14.1430915 8.60290945,12.0550966 C8.95109211,10.6634847 9.64634733,10.1417599 11.0390689,9.79357497 C13.3005955,7.87912949 19.7380848,10.3152907 21.9995616,11.3587363 C28.4370509,13.9673251 33.8300058,16.4046087 39.2240527,20.0577513 C41.6591111,21.7975523 44.2688113,25.1036232 47.4002396,25.9735239 L51.0544833,25.9735239 C56.6220709,27.1905053 62.8849274,26.3216898 68.1043279,27.8868652 C77.3261638,30.843648 85.6758644,35.1942543 93.1579696,39.8919512 C115.95003,54.332049 134.738553,74.8626147 147.440063,99.3934454 C149.528049,103.39367 150.396845,107.04901 152.31129,111.22389 C155.965538,119.749365 160.488578,128.448376 164.14173,136.799218 C167.794872,144.975401 171.274474,153.327362 176.493861,160.113048 C179.104667,163.765094 189.542403,165.67953 194.240026,167.593975 C197.719632,169.159141 203.113711,170.551871 206.245112,172.465206 C212.159801,176.117243 218.075576,180.29433 223.643145,184.295646 C226.427474,186.382535 235.125402,190.733144 235.648231,194.21165 L235.648276,194.211632 L235.648276,194.211632 Z" fill="#00546B"></path> <path d="M58.1864892,43.0222644 C55.2286063,43.0222644 53.1417305,43.3715526 51.0537447,43.8932806 C51.0537447,43.8923744 51.0537447,44.0679225 51.0537447,44.2414633 L51.4019319,44.2414633 C52.794658,47.0247034 55.2286154,48.9391485 56.968414,51.3741978 C58.3611446,54.1574389 59.5781143,56.9417945 60.9708449,59.7261412 C61.1443766,59.5514948 61.3179175,59.3779585 61.3179175,59.3779585 C63.7551915,57.6370498 64.9721657,54.8538087 64.9721657,50.6789426 C63.9276177,49.4608583 63.7540769,48.2427786 62.8841798,47.0246944 C61.8407374,45.283782 59.5781052,44.414995 58.1864892,43.0222644 L58.1864892,43.0222644 L58.1864892,43.0222644 Z" fill="#00546B"></path> </g></svg>`,
    name: "MySQL",
  },
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0,0,255.99536,255.99536">
<g fill="#336791" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(10.66667,10.66667)"><path d="M13,2c-3.71875,0 -4.68359,2.82813 -5.00781,4.46875c0.44531,-0.19141 1.54297,-0.46875 2.00781,-0.46875h0.01953c1.14453,0.00781 1.5,0.33203 1.73047,1.39063c0.16797,0.77734 0.25391,1.98828 0.25,2.60938c-0.00391,1.35938 -0.33203,2.29688 -0.57422,2.92578l-0.07812,0.20313c-0.05859,0.16797 -0.12891,0.32422 -0.19141,0.46875c-0.0625,0.15234 -0.11719,0.28516 -0.15625,0.40234c0.24219,0.05469 0.43359,0.13281 0.5625,0.1875l0.07422,0.03516c0.02344,0.01172 0.04688,0.01953 0.06641,0.03516c0.42578,0.25781 0.29688,0.85156 0.29688,1.32031c0,0.39063 0.01172,1.94531 0,3.42578c0.04297,0.64063 0.20703,1.17969 0.34766,1.57422c0.20703,0.55469 0.67188,1.37891 1.65234,1.42188c0.77344,0.03516 1.89063,-0.37109 2,-1.99609v-4c0.07422,-1.33594 1.60547,-1.86719 2,-2.16016c-0.05469,-0.07422 -0.26562,-0.72656 -0.48828,-1.07422l-0.04297,-0.08203c-0.03125,-0.07812 -0.11328,-0.21875 -0.21484,-0.40625c-0.58984,-1.07031 -1.82422,-3.81641 -0.98047,-5.22266c0.36719,-0.61719 0.72656,-0.97266 1.72656,-1.05859c-0.40625,-1.16016 -1.53125,-3.94141 -5,-4zM6.4375,2c-1.87109,0.07031 -4.4375,1.23047 -4.4375,5.01172c0,2.5625 1.74219,9.98828 4.49219,9.98828c0.125,0 0.25,-0.04297 0.37891,-0.10937c-0.24219,-0.21094 -0.41797,-0.48437 -0.44141,-0.84375c-0.04297,-0.72656 0.48438,-1.23828 1.62109,-1.52734c0.05469,-0.00781 0.34375,-0.09375 0.98047,-0.45312c-0.33594,-0.14453 -0.6875,-0.33984 -0.97656,-0.64062c-0.79297,-0.82812 -1.19531,-1.98828 -1.04688,-3.03125c0.14063,-1.01562 0.05859,-2.01172 0.01563,-2.54297l-0.00391,-0.05078l-0.01172,-0.17578l-0.02344,-0.36719l0.03125,-0.98437c0.32422,-1.66406 1.00391,-2.95312 1.98438,-3.84375c-0.74219,-0.24219 -1.67578,-0.46094 -2.5625,-0.42969zM16.93359,2.00391c-0.19141,0.00391 -0.37109,0.01953 -0.54687,0.03906c1.00391,0.69922 1.92578,1.82813 2.55469,3.62891l0.04297,1.375c0.00391,0.04688 0.01172,0.09375 0.01953,0.14063c0.03125,0.17188 0.07031,0.40625 0.03906,0.6875c-0.03906,0.32031 -0.07812,0.64844 -0.08984,0.97656c-0.00781,0.32422 0.03516,0.64063 0.08203,0.97656c0.08594,0.59766 0.03906,1.20313 -0.14844,1.85156l-0.29297,1.00781c0.07813,0.17188 0.15234,0.34766 0.22656,0.53125c0.01563,0.04688 0.03125,0.08203 0.04297,0.11328l0.32813,0.45313c1.76563,-1.55469 2.80859,-4.80859 2.80859,-8.16016c0,-0.64844 -0.17578,-1.14844 -0.40234,-1.4375c-1.33984,-1.71484 -3.19531,-2.20703 -4.66406,-2.18359zM10,7c-0.28125,0 -1.25,0.23047 -1.61719,0.38672l-0.35937,0.15234c-0.00781,0.00781 -0.01562,0.01563 -0.01953,0.02344c0.00391,0.05469 0.01172,0.12109 0.01953,0.20313c0.04297,0.57422 0.12891,1.64063 -0.02734,2.76953c-0.10547,0.74219 0.19531,1.58594 0.78516,2.19922c0.33594,0.35156 0.9375,0.58203 1.375,0.67969c0.02734,-0.07031 0.05078,-0.12891 0.08203,-0.20703c0.05469,-0.13281 0.11719,-0.27344 0.17578,-0.42969l0.07813,-0.21094c0.17578,-0.45703 0.50391,-1.3125 0.50781,-2.57031c0.00391,-0.41406 -0.04297,-1.16797 -0.12891,-1.8125c-0.01172,0.01563 -0.01953,0.01563 -0.02734,0.03516c-0.14844,0.14844 -0.37891,0.28125 -0.63281,0.24219c-0.41406,-0.06641 -0.73047,-0.57031 -0.71094,-0.75781c0.02344,-0.18359 0.37891,-0.28125 0.79297,-0.21484c0.14063,0.02344 0.27344,0.06641 0.38281,0.11328c0.03906,0.03125 0.07031,0.05078 0.10547,0.07422c-0.00391,-0.02344 -0.00391,-0.05078 -0.01172,-0.07422c-0.09375,-0.44141 -0.17187,-0.52344 -0.17578,-0.52734c-0.00391,-0.00391 -0.10937,-0.07031 -0.59375,-0.07422zM17.98438,7.01172c-0.48437,0.05859 -0.62109,0.1875 -0.79687,0.47266c0.33984,0 0.58594,0.11328 0.61328,0.32422c0.02734,0.17969 -0.125,0.35156 -0.19141,0.41797c-0.14062,0.13281 -0.31641,0.22266 -0.49219,0.24219c-0.03125,0.00781 -0.0625,0.00781 -0.09766,0.00781c-0.00781,0 -0.01172,-0.00391 -0.01953,-0.00391c0.05859,0.82422 0.42969,1.9375 0.92578,2.92969c0.13672,-0.47656 0.19141,-0.94141 0.12109,-1.43359c-0.05078,-0.36328 -0.10547,-0.73828 -0.09375,-1.14844c0.01563,-0.37109 0.05469,-0.71875 0.09375,-1.05859c0.03125,-0.26172 -0.07031,-0.50391 -0.0625,-0.75zM20.17969,14.53125c-0.07812,-0.01172 -0.1875,-0.00391 -0.32031,0.02344c-0.62891,0.12891 -1.04687,0.16406 -1.35547,0.14453c-0.10937,0.07422 -0.22266,0.14453 -0.36328,0.22266c-0.5625,0.30859 -1.0625,0.62891 -1.12891,1.07813v0.58203c0.66016,0.03125 1.54297,-0.37891 2.05078,-0.61328c0.95703,-0.44141 1.67578,-1.36328 1.11719,-1.4375zM9.83594,14.76172c-0.55078,0.32813 -1.17187,0.65234 -1.58594,0.73828c-1.46875,0.39063 -0.55859,0.84766 -0.03906,0.89844c0.55469,0.13672 1.91406,0.44531 2.78906,-0.26953c0,0 0,0 0,-0.00391v-0.54687c0,-0.10547 0.00391,-0.21094 0.01172,-0.32422c0,-0.05859 0.00391,-0.13672 0.00391,-0.20703c-0.06641,-0.02734 -0.14844,-0.05078 -0.23828,-0.07422z"></path></g></g>
</svg>`,
    name: "PostgreSQL",
  },
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
<path fill="#F4511E" d="M42.2,22.1L25.9,5.8C25.4,5.3,24.7,5,24,5c0,0,0,0,0,0c-0.7,0-1.4,0.3-1.9,0.8l-3.5,3.5l4.1,4.1c0.4-0.2,0.8-0.3,1.3-0.3c1.7,0,3,1.3,3,3c0,0.5-0.1,0.9-0.3,1.3l4,4c0.4-0.2,0.8-0.3,1.3-0.3c1.7,0,3,1.3,3,3s-1.3,3-3,3c-1.7,0-3-1.3-3-3c0-0.5,0.1-0.9,0.3-1.3l-4-4c-0.1,0-0.2,0.1-0.3,0.1v10.4c1.2,0.4,2,1.5,2,2.8c0,1.7-1.3,3-3,3s-3-1.3-3-3c0-1.3,0.8-2.4,2-2.8V18.8c-1.2-0.4-2-1.5-2-2.8c0-0.5,0.1-0.9,0.3-1.3l-4.1-4.1L5.8,22.1C5.3,22.6,5,23.3,5,24c0,0.7,0.3,1.4,0.8,1.9l16.3,16.3c0,0,0,0,0,0c0.5,0.5,1.2,0.8,1.9,0.8s1.4-0.3,1.9-0.8l16.3-16.3c0.5-0.5,0.8-1.2,0.8-1.9C43,23.3,42.7,22.6,42.2,22.1z"></path>
</svg>`,
    name: "Git",
  },
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 32 32">
<path fill-rule="evenodd" d="M 16 4 C 9.371094 4 4 9.371094 4 16 C 4 21.300781 7.4375 25.800781 12.207031 27.386719 C 12.808594 27.496094 13.027344 27.128906 13.027344 26.808594 C 13.027344 26.523438 13.015625 25.769531 13.011719 24.769531 C 9.671875 25.492188 8.96875 23.160156 8.96875 23.160156 C 8.421875 21.773438 7.636719 21.402344 7.636719 21.402344 C 6.546875 20.660156 7.71875 20.675781 7.71875 20.675781 C 8.921875 20.761719 9.554688 21.910156 9.554688 21.910156 C 10.625 23.746094 12.363281 23.214844 13.046875 22.910156 C 13.15625 22.132813 13.46875 21.605469 13.808594 21.304688 C 11.144531 21.003906 8.34375 19.972656 8.34375 15.375 C 8.34375 14.0625 8.8125 12.992188 9.578125 12.152344 C 9.457031 11.851563 9.042969 10.628906 9.695313 8.976563 C 9.695313 8.976563 10.703125 8.65625 12.996094 10.207031 C 13.953125 9.941406 14.980469 9.808594 16 9.804688 C 17.019531 9.808594 18.046875 9.941406 19.003906 10.207031 C 21.296875 8.65625 22.300781 8.976563 22.300781 8.976563 C 22.957031 10.628906 22.546875 11.851563 22.421875 12.152344 C 23.191406 12.992188 23.652344 14.0625 23.652344 15.375 C 23.652344 19.984375 20.847656 20.996094 18.175781 21.296875 C 18.605469 21.664063 18.988281 22.398438 18.988281 23.515625 C 18.988281 25.121094 18.976563 26.414063 18.976563 26.808594 C 18.976563 27.128906 19.191406 27.503906 19.800781 27.386719 C 24.566406 25.796875 28 21.300781 28 16 C 28 9.371094 22.628906 4 16 4 Z"></path>
</svg>`,
    name: "GitHub",
  },
  {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="currentColor"><path d="M20.5624 10.1875C20.8124 9.5 20.8749 8.8125 20.8124 8.125C20.7499 7.4375 20.4999 6.75 20.1874 6.125C19.6249 5.1875 18.8124 4.4375 17.8749 4C16.8749 3.5625 15.8124 3.4375 14.7499 3.6875C14.2499 3.1875 13.6874 2.75 13.0624 2.4375C12.4374 2.125 11.6874 2 10.9999 2C9.9374 2 8.8749 2.3125 7.9999 2.9375C7.1249 3.5625 6.4999 4.4375 6.1874 5.4375C5.4374 5.625 4.8124 5.9375 4.1874 6.3125C3.6249 6.75 3.1874 7.3125 2.8124 7.875C2.24991 8.8125 2.06241 9.875 2.18741 10.9375C2.31241 12 2.7499 13 3.4374 13.8125C3.1874 14.5 3.1249 15.1875 3.1874 15.875C3.2499 16.5625 3.4999 17.25 3.8124 17.875C4.3749 18.8125 5.1874 19.5625 6.1249 20C7.1249 20.4375 8.1874 20.5625 9.2499 20.3125C9.7499 20.8125 10.3124 21.25 10.9374 21.5625C11.5624 21.875 12.3124 22 12.9999 22C14.0624 22 15.1249 21.6875 15.9999 21.0625C16.8749 20.4375 17.4999 19.5625 17.8124 18.5625C18.4999 18.4375 19.1874 18.125 19.7499 17.6875C20.3124 17.25 20.8124 16.75 21.1249 16.125C21.6874 15.1875 21.8749 14.125 21.7499 13.0625C21.6249 12 21.2499 11 20.5624 10.1875ZM13.0624 20.6875C12.0624 20.6875 11.3124 20.375 10.6249 19.8125C10.6249 19.8125 10.6874 19.75 10.7499 19.75L14.7499 17.4375C14.8749 17.375 14.9374 17.3125 14.9999 17.1875C15.0624 17.0625 15.0624 17 15.0624 16.875V11.25L16.7499 12.25V16.875C16.8124 19.0625 15.0624 20.6875 13.0624 20.6875ZM4.9999 17.25C4.5624 16.5 4.3749 15.625 4.5624 14.75C4.5624 14.75 4.6249 14.8125 4.6874 14.8125L8.6874 17.125C8.8124 17.1875 8.8749 17.1875 8.9999 17.1875C9.1249 17.1875 9.2499 17.1875 9.3124 17.125L14.1874 14.3125V16.25L10.1249 18.625C9.2499 19.125 8.2499 19.25 7.3124 19C6.3124 18.75 5.4999 18.125 4.9999 17.25ZM3.9374 8.5625C4.3749 7.8125 5.0624 7.25 5.8749 6.9375V7.0625V11.6875C5.8749 11.8125 5.8749 11.9375 5.9374 12C5.9999 12.125 6.0624 12.1875 6.1874 12.25L11.0624 15.0625L9.3749 16.0625L5.3749 13.75C4.4999 13.25 3.8749 12.4375 3.6249 11.5C3.3749 10.5625 3.4374 9.4375 3.9374 8.5625ZM17.7499 11.75L12.8749 8.9375L14.5624 7.9375L18.5624 10.25C19.1874 10.625 19.6874 11.125 19.9999 11.75C20.3124 12.375 20.4999 13.0625 20.4374 13.8125C20.3749 14.5 20.1249 15.1875 19.6874 15.75C19.2499 16.3125 18.6874 16.75 17.9999 17V12.25C17.9999 12.125 17.9999 12 17.9374 11.9375C17.9374 11.9375 17.8749 11.8125 17.7499 11.75ZM19.4374 9.25C19.4374 9.25 19.3749 9.1875 19.3124 9.1875L15.3124 6.875C15.1874 6.8125 15.1249 6.8125 14.9999 6.8125C14.8749 6.8125 14.7499 6.8125 14.6874 6.875L9.8124 9.6875V7.75L13.8749 5.375C14.4999 5 15.1874 4.875 15.9374 4.875C16.6249 4.875 17.3124 5.125 17.9374 5.5625C18.4999 6 18.9999 6.5625 19.2499 7.1875C19.4999 7.8125 19.5624 8.5625 19.4374 9.25ZM8.9374 12.75L7.2499 11.75V7.0625C7.2499 6.375 7.4374 5.625 7.8124 5.0625C8.1874 4.4375 8.7499 4 9.3749 3.6875C9.9999 3.375 10.7499 3.25 11.4374 3.375C12.1249 3.4375 12.8124 3.75 13.3749 4.1875C13.3749 4.1875 13.3124 4.25 13.2499 4.25L9.2499 6.5625C9.1249 6.625 9.0624 6.6875 8.9999 6.8125C8.9374 6.9375 8.9374 7 8.9374 7.125V12.75ZM9.8124 10.75L11.9999 9.5L14.1874 10.75V13.25L11.9999 14.5L9.8124 13.25V10.75Z"></path></svg>`,
    name: "AI Integration",
  },
];

const projects = [
  {
    title: "Development Solutions Real Estate",
    image: "assets/DSRE.png",
    description: `DSRE is a fully responsive real estate website built with the MERN stack and supports both Arabic and English. It offers dark/light modes, smooth performance across all devices, and direct contact with property owners. The admin dashboard allows secure management of listings—uploading, editing, deleting, and viewing properties with multiple images and detailed info.`,
    technologies: [
      "React.js",
      "TailwindCSS",
      "Express.js",
      "Node.js",
      "MongoDB",
    ],
    links: {
      code: "https://github.com/omrmhd5/DSRE",
      live: "https://dsre.up.railway.app/",
    },
    video: "assets/DSRE.mp4",
  },
  {
    title: "OSTR - Ecommerce Fashion Website",
    image: "assets/OSTR.png",
    description: `OSTR is an interactive fashion website built with the MERN stack, offering a seamless shopping experience. It features secure JWT login, user/admin roles, and a full admin dashboard for managing products. Users can browse men's, women's, and kids' categories, design custom outfits, and shop via a complete cart, wishlist, and order system. The site includes responsive dark mode support, a secure checkout, and real-time database updates for all interactions.`,
    technologies: [
      "React.js",
      "TailwindCSS",
      "Express.js",
      "Node.js",
      "MongoDB",
    ],
    links: {
      code: "https://github.com/omrmhd5/OSTR",
      live: "#",
    },
    video: "assets/OSTR.mp4",
  },
  {
    title: "To-Do App",
    image: "assets/NFQ.png",
    description: `To-Do App is a full-stack task management web application built with React.js, Laravel, and MySQL. It features a responsive, interactive UI with real-time task updates to help users efficiently manage daily activities. The app follows MVC architecture, integrates APIs, and applies SOLID principles and clean code for scalable, maintainable development. CI/CD pipelines were used to streamline deployment, and version control was handled via Git in a collaborative environment to ensure high-quality delivery.`,
    technologies: ["React.js", "CSS", "PHP", "Laravel", "MySQL"],
    links: {
      code: "https://github.com/omrmhd5/internship-todo-app",
      live: "https://omar--omar-todo-application.netlify.app/",
    },
    video: "#",
  },
  {
    title: "Gemini Clone",
    image: "assets/Gemini.png",
    description: `Gemini Clone is an AI chatbot inspired by Google Gemini, built using HTML, CSS, and JavaScript. It integrates the official Gemini API to deliver smooth, interactive conversations. The project features a clean, user-friendly chat interface with dark mode support, typing indicators, and smooth scrolling for an enhanced user experience.`,
    technologies: ["HTML", "CSS", "JavaScript", "Gemini API Integration"],
    links: {
      code: "https://github.com/omrmhd5/Gemini-Clone",
      live: "https://omrmhd5.github.io/Gemini-Clone/",
    },
    video: "assets/Gemini Clone.mp4",
  },
];

const experience = [
  {
    title: "Contract",
    company: "Freelancer",
    icon: `<i class="ri-contract-line"></i>`,
    date: "April 2025 - Present",
    description: `Delivered multiple full-stack websites using the MERN stack, featuring JWT authentication, admin dashboard, and responsive design. Implemented real-time database updates and secure payment integration.`,
    link: "#",
  },
  {
    title: "Digital Innovation Intern",
    company: "Arab African International Bank",
    logo: "assets/AAIB.png",
    date: "September 2024 - October 2024",
    description: `Worked on a customer feedback survey using Microsoft Customer Voice, integrated with CRM. Analyzed and cleaned data with SQL to support strategic decisions and contributed to fintech innovation in banking.`,
    link: "https://drive.google.com/file/d/15cIVfs0xZJi1iK8hmRtecFDVj1W1nQ5M/view?usp=drive_link",
  },
  {
    title: "Software Engineering Intern",
    company: ".NFQ",
    logo: "assets/NFQL.png",
    date: "July 2024 - August 2024",
    description: `Developed a full-stack To-Do web app using React.js, Laravel, and MySQL with responsive design, MVC architecture, and API integration. Streamlined deployments via CI/CD, applied clean code and SOLID principles, and collaborated using Git for efficient, high-quality delivery.`,
    link: "https://drive.google.com/file/d/1My0sywzeGF-LG_9OgunB21p17_KY3WrA/view?usp=drive_link",
  },
  {
    title: "Backend Development Trainee",
    company: "AITB",
    logo: "assets/AITB.png",
    date: "August 2023 - September 2023",
    description: `Executed two back-end projects utilizing Node.js and MongoDB, demonstrating strong backend development skills.`,
    link: "https://drive.google.com/file/d/1w-8GRllgd8t3u4vNwUGExnTfN1_16wYC/view?usp=drive_link",
  },
  {
    title: "Frontend Development Trainee",
    company: "AITB",
    logo: "assets/AITB.png",
    date: "July 2023 - August 2023",
    description: `Completed five front-end projects leveraging Angular Framework and Bootstrap, highlighting
expertise in HTML, CSS, and JavaScript.`,
    link: "https://drive.google.com/file/d/1HQmkwRnrOYgAbJhLKxBqwCvTodYQ1PXf/view?usp=drive_link",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".course-container");
  const frontEndContainer = document.getElementsByClassName("skill-items")[0];
  const backEndContainer = document.getElementsByClassName("skill-items")[1];
  const databaseAndToolsContainer =
    document.getElementsByClassName("skill-items")[2];
  const projectContainer = document.querySelector(".projects-container");
  const experienceContainer = document.querySelector(".timeline");

  courses.forEach((course) => {
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

  frontEndSkills.forEach((skill) => {
    const skillCard = `<div class="skill-item">
          <i class="${skill.logo}" style="color: ${skill.color}"></i>
          <span>${skill.name}</span>
        </div>`;

    frontEndContainer.innerHTML += skillCard;
  });

  backEndSkills.forEach((skill) => {
    const skillCard = `<div class="skill-item">
          ${skill.logo}
          <span>${skill.name}</span>
        </div>`;

    backEndContainer.innerHTML += skillCard;
  });

  databaseAndTools.forEach((skill) => {
    const skillCard = `<div class="skill-item">
          ${skill.logo}
          <span>${skill.name}</span>
        </div>`;

    databaseAndToolsContainer.innerHTML += skillCard;
  });

  projects.forEach((project, idx) => {
    const hasLiveDemo = project.links.live !== "#";
    const hasVideo = project.video !== "#";
    const projectCard = `
    <div class="project-card">
    <div class="project-image">
      <img src="${project.image}" alt="${project.title}" />
    </div>
    <div class="project-content">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-tech">
      ${project.technologies.map((tech) => `<span>${tech}</span>`).join("")}
      </div>
      <div class="project-links">
      <a href="${project.links.code}" class="btn btn-secondary" target="_blank">
        <i class="ri-github-line"></i> Code
      </a>
      ${
        hasLiveDemo
          ? `<a href="${project.links.live}" class="btn" target="_blank">
          <i class="ri-external-link-line"></i> Live Demo
          </a>`
          : ""
      }
      ${
        hasVideo
          ? `<a class="btn btn-video-preview" data-project-idx="${idx}"><i class="ri-play-circle-line"></i> Video Preview</a>`
          : ""
      }
      </div>
    </div>
    </div>`;

    projectContainer.innerHTML += projectCard;
  });

  experience.forEach((exp) => {
    const hasCertificate = exp.link !== "#";
    const experienceItem = `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-header">
        ${exp.icon ? exp.icon : `<img src="${exp.logo}" alt="${exp.company}"> `}
          <h3>${exp.company}</h3>
        </div>
        <h4>${exp.title}</h4>
        <p class="date">${exp.date}</p>
        <p class="description">${exp.description}</p>
        ${
          hasCertificate
            ? `
            <a href="${exp.link}" class="btn" target="_blank">
              <i class="fa-solid fa-certificate"></i> View Certificate
            </a>`
            : ""
        }
      </div>
    </div>`;

    experienceContainer.innerHTML += experienceItem;
  });

  // Modal for video preview
  const videoModal = document.createElement("div");
  videoModal.className = "video-modal";
  videoModal.innerHTML = `
    <div class="video-modal-overlay"></div>
    <div class="video-modal-content">
      <button class="video-modal-close">&times;</button>
      <div class="video-modal-body"></div>
    </div>`;
  document.body.appendChild(videoModal);

  function openVideoModal(idx) {
    const project = projects[idx];
    const modalBody = videoModal.querySelector(".video-modal-body");
    if (project.video) {
      modalBody.innerHTML = `<video src="${project.video}" controls style="max-width:100%; max-height:60vh; border-radius:12px; background:#000;"></video>`;
    } else {
      modalBody.innerHTML = `<div class="video-placeholder">Video preview coming soon...</div>`;
    }
    videoModal.classList.add("open");
  }

  function closeVideoModal() {
    videoModal.classList.remove("open");
    videoModal.querySelector(".video-modal-body").innerHTML = "";
  }

  document.querySelectorAll(".btn-video-preview").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const idx = this.getAttribute("data-project-idx");
      openVideoModal(idx);
    });
  });

  videoModal
    .querySelector(".video-modal-close")
    .addEventListener("click", closeVideoModal);
  videoModal
    .querySelector(".video-modal-overlay")
    .addEventListener("click", closeVideoModal);
});

// Navbar active section highlight
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".navbar_link");

function activateNavLink() {
  let currentSection = sections[0];
  let scrollY = window.scrollY + 120; // Offset for fixed navbar
  sections.forEach((section) => {
    if (
      section.offsetTop <= scrollY &&
      section.offsetTop + section.offsetHeight > scrollY
    ) {
      currentSection = section;
    }
  });
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection.id}`) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", activateNavLink);
window.addEventListener("DOMContentLoaded", activateNavLink);
