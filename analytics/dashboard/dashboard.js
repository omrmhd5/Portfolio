(function () {
  "use strict";

  const TOKEN_KEY = "portfolio_analytics_token";

  const loginScreen = document.getElementById("loginScreen");
  const dashboardApp = document.getElementById("dashboardApp");
  const loginForm = document.getElementById("loginForm");
  const passwordInput = document.getElementById("passwordInput");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const loginError = document.getElementById("loginError");
  const rangeSelect = document.getElementById("rangeSelect");
  const refreshBtn = document.getElementById("refreshBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const confirmClearBtn = document.getElementById("confirmClearBtn");
  const clearModal = document.getElementById("clearModal");
  const toast = document.getElementById("toast");
  const lastUpdated = document.getElementById("lastUpdated");
  const kpiHero = document.getElementById("kpiHero");
  const overviewGrid = document.getElementById("overviewGrid");
  const navLinks = document.querySelectorAll(".nav-link");
  const sectionIds = ["overview", "charts", "projects", "activity"];

  let clickChart = null;
  let trafficChart = null;
  let toastTimer = null;
  let toastHideTimer = null;
  let modalCloseTimer = null;
  let modalTrigger = null;
  let dashboardLoading = false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const CHART_COLORS = {
    primary: "#a78bfa",
    accent: "#34d399",
    tertiary: "#60a5fa",
    warm: "#fbbf24",
    pink: "#f472b6",
    cyan: "#2dd4bf",
    orange: "#fb923c",
    magenta: "#e879f9",
  };

  const chartPalette = [
    CHART_COLORS.primary,
    CHART_COLORS.accent,
    CHART_COLORS.warm,
    CHART_COLORS.tertiary,
    CHART_COLORS.pink,
    CHART_COLORS.cyan,
    CHART_COLORS.orange,
    CHART_COLORS.magenta,
  ];

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#a1a1aa",
          font: { family: "'Inter', sans-serif", size: 11 },
          boxWidth: 10,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "#141416",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 8,
        titleColor: "#fafafa",
        bodyColor: "#a1a1aa",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#71717a",
          font: { family: "'JetBrains Mono', monospace", size: 10 },
        },
        grid: { color: "rgba(255, 255, 255, 0.04)", drawBorder: false },
      },
      y: {
        ticks: {
          color: "#71717a",
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          precision: 0,
        },
        grid: { color: "rgba(255, 255, 255, 0.04)", drawBorder: false },
        beginAtZero: true,
      },
    },
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setButtonLoading(button, loading, loadingLabel) {
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle("is-loading", loading);
    button.setAttribute("aria-busy", loading ? "true" : "false");
    const label = button.querySelector(".btn-label");
    if (!label) return;
    if (!label.dataset.defaultLabel) {
      label.dataset.defaultLabel = label.textContent.trim();
    }
    if (loading && loadingLabel) {
      label.textContent = loadingLabel;
    } else {
      label.textContent = label.dataset.defaultLabel;
    }
  }

  function showKpiSkeleton() {
    overviewGrid.setAttribute("aria-busy", "true");
    kpiHero.setAttribute("aria-busy", "true");
    overviewGrid.classList.add("is-loading");
    kpiHero.classList.add("is-loading");
    kpiHero.innerHTML =
      '<div class="kpi-skeleton hero" aria-hidden="true"></div>' +
      '<div class="kpi-skeleton hero" aria-hidden="true"></div>';
    overviewGrid.innerHTML = Array.from({ length: 6 })
      .map(function () {
        return '<div class="kpi-skeleton" aria-hidden="true"></div>';
      })
      .join("");
  }

  function setChartEmpty(canvasId, emptyId, isEmpty) {
    const canvas = document.getElementById(canvasId);
    const empty = document.getElementById(emptyId);
    if (!canvas || !empty) return;
    canvas.hidden = isEmpty;
    empty.hidden = !isEmpty;
  }

  function getModalFocusables() {
    return clearModal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
  }

  function trapModalFocus(e) {
    if (!clearModal.classList.contains("is-open")) return;
    if (e.key !== "Tab") return;

    const focusables = Array.from(getModalFocusables());
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function setActiveNav(sectionId) {
    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === "#" + sectionId);
    });
  }

  function initScrollSpy() {
    const sections = sectionIds
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      function (entries) {
        const visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (visible[0]) {
          setActiveNav(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function showLogin() {
    dashboardApp.hidden = true;
    loginScreen.hidden = false;
    loginScreen.classList.add("is-visible");
  }

  function showDashboard() {
    loginScreen.classList.remove("is-visible");
    loginScreen.hidden = true;
    dashboardApp.hidden = false;
  }

  function showToast(message, type) {
    clearTimeout(toastTimer);
    clearTimeout(toastHideTimer);

    toast.textContent = message;
    toast.className = "toast " + (type || "success");
    toast.hidden = false;
    toast.classList.remove("is-hiding");

    if (prefersReducedMotion) {
      toast.classList.add("is-visible");
      toastTimer = setTimeout(hideToast, 3200);
      return;
    }

    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    toastTimer = setTimeout(hideToast, 3200);
  }

  function hideToast() {
    toast.classList.remove("is-visible");
    toast.classList.add("is-hiding");

    const done = function () {
      toast.hidden = true;
      toast.classList.remove("is-hiding");
      toast.removeEventListener("transitionend", done);
    };

    if (prefersReducedMotion) {
      done();
      return;
    }

    toast.addEventListener("transitionend", done, { once: true });
    toastHideTimer = setTimeout(done, 220);
  }

  function openModal() {
    clearTimeout(modalCloseTimer);
    modalTrigger = document.activeElement;
    clearModal.classList.remove("is-closing");
    clearModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    confirmClearBtn.disabled = false;
    clearModal.classList.add("is-open");
    confirmClearBtn.focus();
  }

  function closeModal() {
    if (!clearModal.classList.contains("is-open")) return;

    clearModal.classList.remove("is-open", "is-closing");
    clearModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (modalTrigger && typeof modalTrigger.focus === "function") {
      modalTrigger.focus();
    }
    modalTrigger = null;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + getToken() };
  }

  async function fetchStats(range) {
    const res = await fetch("/api/stats?range=" + encodeURIComponent(range), {
      headers: authHeaders(),
    });

    if (res.status === 401) {
      clearToken();
      showLogin();
      throw new Error("Session expired");
    }

    if (!res.ok) throw new Error("Failed to load stats");
    return res.json();
  }

  async function clearAllEvents() {
    const res = await fetch("/api/events", {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.status === 401) {
      clearToken();
      showLogin();
      throw new Error("Session expired");
    }

    if (!res.ok) throw new Error("Failed to clear events");
    return res.json();
  }

  const EVENT_LABELS = {
    page_view: "Page View",
    resume: "Resume",
    live_demo: "Live Demo",
    video_preview: "Video Preview",
    external_video: "External Video",
    read_more: "Read More",
    code: "Code",
    github: "GitHub",
    linkedin: "LinkedIn",
    click: "Click",
    mobile_menu: "Mobile Menu",
    navbar: "Navbar",
    footer: "Footer",
    hero: "Hero",
    contact: "Contact",
    unknown: "Unknown",
  };

  function formatEventName(name) {
    const key = String(name || "").toLowerCase();
    if (EVENT_LABELS[key]) return EVENT_LABELS[key];

    return key
      .split("_")
      .filter(Boolean)
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  const PLATFORM_LABELS = {
    youtube: "YouTube",
    drive: "Google Drive",
  };

  function formatPlatform(name) {
    const key = String(name || "").toLowerCase();
    if (PLATFORM_LABELS[key]) return PLATFORM_LABELS[key];
    return formatEventName(key);
  }

  function renderPlatformCell(row) {
    const meta = getRowMetadata(row);
    const platform = meta.platform ? String(meta.platform) : "";

    if (!platform) {
      return '<span class="cell-muted">—</span>';
    }

    const slug = platform.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return (
      '<span class="platform-tag platform-tag--' +
      escapeHtml(slug) +
      '">' +
      escapeHtml(formatPlatform(platform)) +
      "</span>"
    );
  }

  const EVENT_TAG_SLUGS = {
    live_demo: "live-demo",
    code: "code",
    video_preview: "video-preview",
    external_video: "external-video",
    read_more: "read-more",
    resume: "resume",
    github: "github",
    linkedin: "linkedin",
    page_view: "page-view",
  };

  function breakdownTagClass(eventName) {
    const key = String(eventName || "").toLowerCase();
    const slug = EVENT_TAG_SLUGS[key];
    return slug ? "breakdown-tag--" + slug : "breakdown-tag--default";
  }

  function breakdownTagHtml(eventName, count) {
    return (
      '<span class="breakdown-tag ' +
      breakdownTagClass(eventName) +
      '">' +
      escapeHtml(formatEventName(eventName)) +
      ": " +
      count +
      "</span>"
    );
  }

  function getRowMetadata(row) {
    if (typeof row.metadata === "object" && row.metadata !== null) {
      return row.metadata;
    }
    if (typeof row.metadata === "string" && row.metadata) {
      try {
        return JSON.parse(row.metadata);
      } catch {
        return {};
      }
    }
    return {};
  }

  function getActivitySubject(row) {
    const meta = getRowMetadata(row);

    if (meta.project) {
      return { text: String(meta.project), kind: "project" };
    }

    if (meta.experience) {
      return { text: String(meta.experience), kind: "experience" };
    }

    if (row.event_type === "page_view") {
      return { text: "Site visit", kind: "visit", muted: true };
    }

    return null;
  }

  function renderSubjectCell(row) {
    const subject = getActivitySubject(row);

    if (!subject) {
      return '<span class="cell-muted">—</span>';
    }

    if (subject.muted) {
      return '<span class="cell-muted">' + escapeHtml(subject.text) + "</span>";
    }

    const kindLabel =
      subject.kind === "experience"
        ? '<span class="subject-kind">Experience</span>'
        : '<span class="subject-kind">Project</span>';

    return kindLabel + "<strong>" + escapeHtml(subject.text) + "</strong>";
  }

  function eventTypeBadge(type) {
    const map = {
      click: "badge-click",
      page_view: "badge-page",
    };
    return (
      '<span class="badge ' +
      (map[type] || "") +
      '">' +
      escapeHtml(formatEventName(type)) +
      "</span>"
    );
  }

  function renderOverview(overview) {
    kpiHero.innerHTML =
      '<article class="kpi-hero-card featured-views">' +
      '<div class="kpi-label">Views today</div>' +
      '<div class="kpi-value">' +
      Number(overview.viewsToday).toLocaleString() +
      "</div></article>" +
      '<article class="kpi-hero-card featured-sessions">' +
      '<div class="kpi-label">Sessions today</div>' +
      '<div class="kpi-value">' +
      Number(overview.sessionsToday).toLocaleString() +
      "</div></article>";

    const cards = [
      { label: "Views · 7d", value: overview.views7d },
      { label: "Sessions · 7d", value: overview.sessions7d },
      { label: "Views · 30d", value: overview.views30d },
      { label: "Sessions · 30d", value: overview.sessions30d },
      { label: "All-time views", value: overview.viewsAll },
      { label: "All-time sessions", value: overview.sessionsAll },
    ];

    overviewGrid.innerHTML = cards
      .map(function (card) {
        return (
          '<article class="kpi-card">' +
          '<div class="kpi-label">' +
          card.label +
          "</div>" +
          '<div class="kpi-value">' +
          Number(card.value).toLocaleString() +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    if (!prefersReducedMotion) {
      kpiHero.classList.remove("is-entering");
      overviewGrid.classList.remove("is-entering");
      void kpiHero.offsetWidth;
      kpiHero.classList.add("is-entering");
      overviewGrid.classList.add("is-entering");
      setTimeout(function () {
        kpiHero.classList.remove("is-entering");
        overviewGrid.classList.remove("is-entering");
      }, 450);
    }
  }

  function destroyChart(chart) {
    if (chart) chart.destroy();
  }

  function renderClickChart(data) {
    destroyChart(clickChart);
    const isEmpty = !data.length;
    setChartEmpty("clickChart", "clickEmpty", isEmpty);
    if (isEmpty) return;

    const ctx = document.getElementById("clickChart");
    clickChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map(function (d) {
          return formatEventName(d.event_name);
        }),
        datasets: [
          {
            data: data.map(function (d) {
              return d.count;
            }),
            backgroundColor: data.map(function (_, i) {
              return chartPalette[i % chartPalette.length];
            }),
            borderWidth: 2,
            borderColor: "#141416",
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#a1a1aa",
              font: { family: "'Inter', sans-serif", size: 10 },
              boxWidth: 10,
              padding: 8,
            },
          },
          tooltip: chartDefaults.plugins.tooltip,
        },
      },
    });
  }

  function renderTrafficChart(data) {
    destroyChart(trafficChart);
    const isEmpty = !data.length;
    setChartEmpty("trafficChart", "trafficEmpty", isEmpty);
    if (isEmpty) return;

    const ctx = document.getElementById("trafficChart");
    trafficChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map(function (d) {
          return new Date(d.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
        }),
        datasets: [
          {
            label: "Page Views",
            data: data.map(function (d) {
              return d.views;
            }),
            borderColor: CHART_COLORS.primary,
            backgroundColor: "rgba(167, 139, 250, 0.12)",
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "Sessions",
            data: data.map(function (d) {
              return d.sessions;
            }),
            borderColor: CHART_COLORS.accent,
            backgroundColor: "rgba(52, 211, 153, 0.08)",
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            borderDash: [4, 3],
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: chartDefaults,
    });
  }

  function renderProjectTable(data) {
    const tbody = document.querySelector("#projectTable tbody");
    if (!data.length) {
      tbody.innerHTML =
        '<tr class="empty-row"><td colspan="3">No project interactions yet</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map(function (row) {
        const tags = Object.entries(row.breakdown || {})
          .map(function (entry) {
            return breakdownTagHtml(entry[0], entry[1]);
          })
          .join("");
        return (
          "<tr><td><strong>" +
          escapeHtml(row.project) +
          "</strong></td><td>" +
          row.total +
          '</td><td><div class="breakdown-tags">' +
          (tags || "—") +
          "</div></td></tr>"
        );
      })
      .join("");
  }

  function renderSocialTable(data) {
    const tbody = document.querySelector("#socialTable tbody");
    if (!data.length) {
      tbody.innerHTML =
        '<tr class="empty-row"><td colspan="3">No social clicks yet</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map(function (row) {
        return (
          "<tr><td>" +
          escapeHtml(formatEventName(row.event_name)) +
          "</td><td>" +
          escapeHtml(formatEventName(row.location)) +
          "</td><td><strong>" +
          row.count +
          "</strong></td></tr>"
        );
      })
      .join("");
  }

  function renderEventsTable(data) {
    const tbody = document.querySelector("#eventsTable tbody");
    if (!data.length) {
      tbody.innerHTML =
        '<tr class="empty-row"><td colspan="5">No events recorded yet</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map(function (row) {
        const time = new Date(row.created_at).toLocaleString();
        const subjectCell = renderSubjectCell(row);
        const platformCell = renderPlatformCell(row);

        return (
          '<tr><td class="cell-subject">' +
          subjectCell +
          "</td><td>" +
          eventTypeBadge(row.event_type) +
          "</td><td>" +
          escapeHtml(formatEventName(row.event_name)) +
          "</td><td>" +
          platformCell +
          '</td><td class="cell-time">' +
          escapeHtml(time) +
          "</td></tr>"
        );
      })
      .join("");
  }

  async function loadDashboard() {
    if (dashboardLoading) return;
    dashboardLoading = true;
    setButtonLoading(refreshBtn, true, "Refreshing…");
    showKpiSkeleton();
    dashboardApp.classList.add("loading-shimmer");

    try {
      const range = rangeSelect.value;
      const stats = await fetchStats(range);

      renderOverview(stats.overview);
      overviewGrid.setAttribute("aria-busy", "false");
      kpiHero.setAttribute("aria-busy", "false");
      overviewGrid.classList.remove("is-loading");
      kpiHero.classList.remove("is-loading");
      renderClickChart(stats.clickBreakdown || []);
      renderTrafficChart(stats.trafficOverTime || []);
      renderProjectTable(stats.projectLeaderboard || []);
      renderSocialTable(stats.socialByLocation || []);
      renderEventsTable(stats.recentEvents || []);

      lastUpdated.textContent =
        "Updated " +
        new Date().toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        });
    } catch (err) {
      overviewGrid.setAttribute("aria-busy", "false");
      kpiHero.setAttribute("aria-busy", "false");
      overviewGrid.classList.remove("is-loading");
      kpiHero.classList.remove("is-loading");
      if (err.message !== "Session expired") {
        showToast(
          "Could not load dashboard data. Check your connection and try again.",
          "error",
        );
      }
    } finally {
      dashboardLoading = false;
      setButtonLoading(refreshBtn, false);
      dashboardApp.classList.remove("loading-shimmer");
    }
  }

  async function handleClearAll() {
    closeModal();
    setButtonLoading(confirmClearBtn, true, "Deleting…");
    try {
      const result = await clearAllEvents();
      showToast(
        "Deleted " + (result.deleted || 0) + " events. Dashboard cleared.",
        "success",
      );
      await loadDashboard();
    } catch (err) {
      if (err.message !== "Session expired") {
        showToast("Failed to clear data. Try again.", "error");
      }
    } finally {
      setButtonLoading(confirmClearBtn, false);
    }
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    loginError.hidden = true;

    const password = passwordInput.value.trim();
    if (!password) return;

    setButtonLoading(loginSubmitBtn, true, "Signing in…");

    try {
      const res = await fetch("/api/stats?range=7d", {
        headers: { Authorization: "Bearer " + password },
      });

      if (!res.ok) {
        loginError.textContent =
          "Invalid password. Check your dashboard password and try again.";
        loginError.hidden = false;
        passwordInput.focus();
        return;
      }

      setToken(password);
      passwordInput.value = "";
      showDashboard();
      initScrollSpy();
      await loadDashboard();
    } catch {
      loginError.textContent =
        "Unable to reach the analytics server. Try again in a moment.";
      loginError.hidden = false;
    } finally {
      setButtonLoading(loginSubmitBtn, false);
    }
  });

  rangeSelect.addEventListener("change", loadDashboard);
  refreshBtn.addEventListener("click", loadDashboard);

  logoutBtn.addEventListener("click", function () {
    clearToken();
    showLogin();
  });

  clearAllBtn.addEventListener("click", openModal);
  confirmClearBtn.addEventListener("click", handleClearAll);

  clearModal.querySelectorAll("[data-dismiss='modal']").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && clearModal.classList.contains("is-open")) {
      closeModal();
      return;
    }
    trapModalFocus(e);
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setActiveNav(link.getAttribute("href").slice(1));
    });
  });

  if (getToken()) {
    showDashboard();
    initScrollSpy();
    loadDashboard();
  } else {
    showLogin();
  }
})();
