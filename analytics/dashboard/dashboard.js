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
  const overviewGrid = document.getElementById("overviewGrid");
  const navLinks = document.querySelectorAll(".nav-link");
  const sectionIds = ["overview", "charts", "projects", "activity"];

  let sectionChart = null;
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
    primary: "#3b82f6",
    accent: "#f59e0b",
    success: "#22c55e",
    purple: "#a78bfa",
    pink: "#f472b6",
    cyan: "#22d3ee",
    lime: "#a3e635",
    orange: "#fb923c",
  };

  const chartPalette = Object.values(CHART_COLORS);

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: { family: "'Fira Sans', sans-serif", size: 11 },
          boxWidth: 10,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        borderColor: "#243044",
        borderWidth: 1,
        titleFont: { family: "'Fira Code', monospace", size: 11 },
        bodyFont: { family: "'Fira Sans', sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b",
          font: { family: "'Fira Code', monospace", size: 10 },
        },
        grid: { color: "rgba(36, 48, 68, 0.6)", drawBorder: false },
      },
      y: {
        ticks: {
          color: "#64748b",
          font: { family: "'Fira Code', monospace", size: 10 },
          precision: 0,
        },
        grid: { color: "rgba(36, 48, 68, 0.6)", drawBorder: false },
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
    overviewGrid.classList.add("is-loading");
    overviewGrid.innerHTML = Array.from({ length: 8 })
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

  function formatEventName(name) {
    return String(name).replace(/_/g, " ");
  }

  function eventTypeBadge(type) {
    const map = {
      click: "badge-click",
      section_view: "badge-section",
      page_view: "badge-page",
    };
    const safeType = escapeHtml(type);
    return (
      '<span class="badge ' +
      (map[type] || "") +
      '">' +
      safeType +
      "</span>"
    );
  }

  function renderOverview(overview) {
    const cards = [
      { label: "Views Today", value: overview.viewsToday, highlight: true },
      { label: "Sessions Today", value: overview.sessionsToday },
      { label: "Views · 7d", value: overview.views7d },
      { label: "Sessions · 7d", value: overview.sessions7d },
      { label: "Views · 30d", value: overview.views30d },
      { label: "Sessions · 30d", value: overview.sessions30d },
      { label: "All-time Views", value: overview.viewsAll, highlight: true },
      { label: "All-time Sessions", value: overview.sessionsAll },
    ];

    overviewGrid.innerHTML = cards
      .map(function (card) {
        return (
          '<article class="kpi-card' +
          (card.highlight ? " highlight" : "") +
          '">' +
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
      overviewGrid.classList.remove("is-entering");
      void overviewGrid.offsetWidth;
      overviewGrid.classList.add("is-entering");
      setTimeout(function () {
        overviewGrid.classList.remove("is-entering");
      }, 400);
    }
  }

  function destroyChart(chart) {
    if (chart) chart.destroy();
  }

  function renderSectionChart(data) {
    destroyChart(sectionChart);
    const isEmpty = !data.length;
    setChartEmpty("sectionChart", "sectionEmpty", isEmpty);
    if (isEmpty) return;

    const ctx = document.getElementById("sectionChart");
    sectionChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(function (d) {
          return formatEventName(d.event_name);
        }),
        datasets: [
          {
            label: "Views",
            data: data.map(function (d) {
              return d.count;
            }),
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderColor: CHART_COLORS.primary,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: Object.assign({}, chartDefaults, { indexAxis: "y" }),
    });
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
            borderColor: "#111827",
            hoverOffset: 6,
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
              color: "#94a3b8",
              font: { family: "'Fira Sans', sans-serif", size: 10 },
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
            backgroundColor: "rgba(59, 130, 246, 0.12)",
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
            backgroundColor: "rgba(245, 158, 11, 0.08)",
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
            return (
              '<span class="breakdown-tag">' +
              formatEventName(entry[0]) +
              ": " +
              entry[1] +
              "</span>"
            );
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
          escapeHtml(row.location) +
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
        const metadata =
          typeof row.metadata === "object"
            ? JSON.stringify(row.metadata)
            : row.metadata || "{}";
        const safeMeta = escapeHtml(metadata);
        return (
          "<tr><td>" +
          escapeHtml(time) +
          "</td><td>" +
          eventTypeBadge(row.event_type) +
          "</td><td>" +
          escapeHtml(formatEventName(row.event_name)) +
          "</td><td>" +
          escapeHtml(row.path || "—") +
          '</td><td class="metadata-cell" title="' +
          safeMeta +
          '">' +
          safeMeta +
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
      overviewGrid.classList.remove("is-loading");
      renderSectionChart(stats.sectionViews || []);
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
      overviewGrid.classList.remove("is-loading");
      if (err.message !== "Session expired") {
        showToast("Could not load dashboard data. Check your connection and try again.", "error");
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
        loginError.textContent = "Invalid password. Check your dashboard password and try again.";
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
      loginError.textContent = "Unable to reach the analytics server. Try again in a moment.";
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
