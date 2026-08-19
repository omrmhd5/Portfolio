(function () {
  "use strict";

  const TOKEN_KEY = "portfolio_analytics_token";

  const loginScreen = document.getElementById("loginScreen");
  const dashboardApp = document.getElementById("dashboardApp");
  const loginForm = document.getElementById("loginForm");
  const passwordInput = document.getElementById("passwordInput");
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

  let sectionChart = null;
  let clickChart = null;
  let trafficChart = null;
  let toastTimer = null;

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
    loginScreen.hidden = false;
    dashboardApp.hidden = true;
  }

  function showDashboard() {
    loginScreen.hidden = true;
    dashboardApp.hidden = false;
  }

  function showToast(message, type) {
    toast.textContent = message;
    toast.className = "toast " + (type || "success");
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 3200);
  }

  function openModal() {
    clearModal.hidden = false;
    confirmClearBtn.focus();
  }

  function closeModal() {
    clearModal.hidden = true;
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
    return '<span class="badge ' + (map[type] || "") + '">' + type + "</span>";
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
  }

  function destroyChart(chart) {
    if (chart) chart.destroy();
  }

  function renderSectionChart(data) {
    destroyChart(sectionChart);
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
          row.project +
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
          formatEventName(row.event_name) +
          "</td><td>" +
          row.location +
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
        const safeMeta = metadata.replace(/"/g, "&quot;");
        return (
          "<tr><td>" +
          time +
          "</td><td>" +
          eventTypeBadge(row.event_type) +
          "</td><td>" +
          formatEventName(row.event_name) +
          "</td><td>" +
          (row.path || "—") +
          '</td><td class="metadata-cell" title="' +
          safeMeta +
          '">' +
          metadata +
          "</td></tr>"
        );
      })
      .join("");
  }

  async function loadDashboard() {
    refreshBtn.disabled = true;
    dashboardApp.classList.add("loading-shimmer");

    try {
      const range = rangeSelect.value;
      const stats = await fetchStats(range);

      renderOverview(stats.overview);
      renderSectionChart(stats.sectionViews || []);
      renderClickChart(stats.clickBreakdown || []);
      renderTrafficChart(stats.trafficOverTime || []);
      renderProjectTable(stats.projectLeaderboard || []);
      renderSocialTable(stats.socialByLocation || []);
      renderEventsTable(stats.recentEvents || []);

      lastUpdated.textContent =
        "Updated " + new Date().toLocaleTimeString();
    } catch (err) {
      if (err.message !== "Session expired") {
        showToast("Failed to load dashboard data", "error");
      }
    } finally {
      refreshBtn.disabled = false;
      dashboardApp.classList.remove("loading-shimmer");
    }
  }

  async function handleClearAll() {
    confirmClearBtn.disabled = true;
    try {
      const result = await clearAllEvents();
      closeModal();
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
      confirmClearBtn.disabled = false;
    }
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    loginError.hidden = true;

    const password = passwordInput.value.trim();
    if (!password) return;

    try {
      const res = await fetch("/api/stats?range=7d", {
        headers: { Authorization: "Bearer " + password },
      });

      if (!res.ok) {
        loginError.textContent = "Invalid password. Please try again.";
        loginError.hidden = false;
        return;
      }

      setToken(password);
      passwordInput.value = "";
      showDashboard();
      await loadDashboard();
    } catch {
      loginError.textContent = "Unable to connect. Please try again.";
      loginError.hidden = false;
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
    if (e.key === "Escape" && !clearModal.hidden) closeModal();
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.forEach(function (l) {
        l.classList.remove("active");
      });
      link.classList.add("active");
    });
  });

  if (getToken()) {
    showDashboard();
    loadDashboard();
  } else {
    showLogin();
  }
})();
