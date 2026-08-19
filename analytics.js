(function () {
  "use strict";

  const API_URL = window.ANALYTICS_API_URL;
  if (!API_URL) return;

  const SESSION_KEY = "portfolio_analytics_session";

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

  function sendEvents(events, preferBeacon) {
    if (!events.length) return;

    const body = JSON.stringify(events.length === 1 ? events[0] : events);
    const url = API_URL.replace(/\/$/, "") + "/api/events";

    if (
      preferBeacon &&
      events.length === 1 &&
      typeof navigator.sendBeacon === "function"
    ) {
      const sent = navigator.sendBeacon(
        url,
        new Blob([body], { type: "application/json" }),
      );
      if (sent) return;
    }

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
    const payload = buildPayload(eventType, eventName, metadata);

    if (eventType === "click") {
      sendEvents([payload], true);
      return;
    }

    queue.push(payload);
    scheduleFlush();
  }

  window.trackAnalytics = track;

  track("page_view", "page_view", {});

  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-analytics]");
    if (!el) return;

    const eventName = el.getAttribute("data-analytics");
    if (!eventName) return;

    const metadata = {};
    const project = el.getAttribute("data-project");
    const company = el.getAttribute("data-company");
    const location = el.getAttribute("data-location");
    const platform = el.getAttribute("data-platform");

    if (project) metadata.project = project;
    if (company) metadata.company = company;
    if (location) metadata.location = location;
    if (platform) metadata.platform = platform;

    track("click", eventName, metadata);
  }, true);

  window.addEventListener("pagehide", flushQueue);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flushQueue();
  });
})();
