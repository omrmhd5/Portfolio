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
  const overviewGrid = document.getElementById("overviewGrid");

  let sectionChart = null;
  let clickChart = null;
  let trafficChart = null;

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: "#8b9cb3" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#8b9cb3" },
        grid: { color: "rgba(45, 58, 79, 0.5)" },
      },
      y: {
        ticks: { color: "#8b9cb3" },
        grid: { color: "rgba(45, 58, 79, 0.5)" },
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

  async function fetchStats(range) {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`/api/stats?range=${encodeURIComponent(range)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      clearToken();
      showLogin();
      throw new Error("Session expired");
    }

    if (!res.ok) {
      throw new Error("Failed to load stats");
    }

    return res.json();
  }

  function renderOverview(overview) {
    const cards = [
      { label: "Views Today", value: overview.viewsToday },
      { label: "Sessions Today", value: overview.sessionsToday },
      { label: "Views (7d)", value: overview.views7d },
      { label: "Sessions (7d)", value: overview.sessions7d },
      { label: "Views (30d)", value: overview.views30d },
      { label: "Sessions (30d)", value: overview.sessions30d },
      { label: "Views (All)", value: overview.viewsAll },
      { label: "Sessions (All)", value: overview.sessionsAll },
    ];

    overviewGrid.innerHTML = cards
      .map(
        (card) => `
      <div class="stat-card">
        <div class="label">${card.label}</div>
        <div class="value">${card.value.toLocaleString()}</div>
      </div>`,
      )
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
        labels: data.map((d) => d.event_name),
        datasets: [
          {
            label: "Views",
            data: data.map((d) => d.count),
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: chartDefaults,
    });
  }

  function renderClickChart(data) {
    destroyChart(clickChart);
    const colors = [
      "#3b82f6",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
      "#ec4899",
      "#84cc16",
    ];
    const ctx = document.getElementById("clickChart");
    clickChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map((d) => d.event_name),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: data.map((_, i) => colors[i % colors.length]),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "right",
            labels: { color: "#8b9cb3", boxWidth: 12 },
          },
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
        labels: data.map((d) => {
          const date = new Date(d.date);
          return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
        }),
        datasets: [
          {
            label: "Page Views",
            data: data.map((d) => d.views),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Sessions",
            data: data.map((d) => d.sessions),
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.3,
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
      .map((row) => {
        const breakdown = Object.entries(row.breakdown || {})
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ");
        return `<tr>
          <td>${row.project}</td>
          <td>${row.total}</td>
          <td>${breakdown || "—"}</td>
        </tr>`;
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
      .map(
        (row) => `<tr>
          <td>${row.event_name}</td>
          <td>${row.location}</td>
          <td>${row.count}</td>
        </tr>`,
      )
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
      .map((row) => {
        const time = new Date(row.created_at).toLocaleString();
        const metadata =
          typeof row.metadata === "object"
            ? JSON.stringify(row.metadata)
            : row.metadata || "{}";
        return `<tr>
          <td>${time}</td>
          <td>${row.event_type}</td>
          <td>${row.event_name}</td>
          <td>${row.path || "—"}</td>
          <td class="metadata-cell" title="${metadata.replace(/"/g, "&quot;")}">${metadata}</td>
        </tr>`;
      })
      .join("");
  }

  async function loadDashboard() {
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
    } catch (err) {
      if (err.message !== "Session expired") {
        console.error(err);
      }
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.hidden = true;

    const password = passwordInput.value.trim();
    if (!password) return;

    try {
      const res = await fetch("/api/stats?range=7d", {
        headers: { Authorization: `Bearer ${password}` },
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

  logoutBtn.addEventListener("click", () => {
    clearToken();
    showLogin();
  });

  if (getToken()) {
    showDashboard();
    loadDashboard();
  } else {
    showLogin();
  }
})();
