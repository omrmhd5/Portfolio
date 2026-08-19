(function () {
  "use strict";

  const API_URL = window.ANALYTICS_API_URL;
  if (!API_URL) return;

  const SESSION_KEY = "portfolio_analytics_session";
  const VIEWED_SECTIONS_KEY = "portfolio_analytics_viewed_sections";

  function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  function getViewedSections() {
    try {
      const raw = sessionStorage.getItem(VIEWED_SECTIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function markSectionViewed(section) {
    const viewed = getViewedSections();
    if (!viewed.includes(section)) {
      viewed.push(section);
      sessionStorage.setItem(VIEWED_SECTIONS_KEY, JSON.stringify(viewed));
    }
  }

  function hasViewedSection(section) {
    return getViewedSections().includes(section);
  }

  const queue = [];
  let flushTimer = null;

  function buildPayload(eventType, eventName, metadata) {
    return {
      session_id: getSessionId(),
      event_type: eventType,
      event_name: eventName,
      metadata: metadata || {},
      path: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
    };
  }

  function sendEvents(events) {
    if (!events.length) return;

    const body = JSON.stringify(events.length === 1 ? events[0] : events);
    const url = API_URL.replace(/\/$/, "") + "/api/events";

    if (typeof fetch === "function") {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(function () {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            url,
            new Blob([body], { type: "application/json" }),
          );
        }
      });
      return;
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        url,
        new Blob([body], { type: "application/json" }),
      );
    }
  }

  function flushQueue() {
    if (!queue.length) return;
    const batch = queue.splice(0, queue.length);
    sendEvents(batch);
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flushQueue();
    }, 300);
  }

  function track(eventType, eventName, metadata) {
    queue.push(buildPayload(eventType, eventName, metadata));
    scheduleFlush();
  }

  window.trackAnalytics = track;

  track("page_view", "page_view", {});

  const SECTION_IDS = [
    "hero",
    "education",
    "experience",
    "skills",
    "projects",
    "testimonials",
    "awards",
    "contact",
  ];

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const sectionId = entry.target.id;
          if (!SECTION_IDS.includes(sectionId)) return;
          if (hasViewedSection(sectionId)) return;

          markSectionViewed(sectionId);
          track("section_view", sectionId, {});
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 },
    );

    SECTION_IDS.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-analytics]");
    if (!el) return;

    const eventName = el.getAttribute("data-analytics");
    if (!eventName) return;

    const metadata = {};
    const project = el.getAttribute("data-project");
    const location = el.getAttribute("data-location");
    const platform = el.getAttribute("data-platform");

    if (project) metadata.project = project;
    if (location) metadata.location = location;
    if (platform) metadata.platform = platform;

    track("click", eventName, metadata);
  });

  window.addEventListener("pagehide", flushQueue);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flushQueue();
  });
})();
