const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

const EVENT_TYPES = new Set(["page_view", "click"]);
const CLICK_EVENTS = new Set([
  "resume",
  "live_demo",
  "video_preview",
  "external_video",
  "read_more",
  "view_certificate",
  "code",
  "github",
  "linkedin",
]);

const DEFAULT_ORIGINS =
  "https://omarmahmoud.dev,https://www.omarmahmoud.dev,https://omarmahmoud-analytics.onrender.com,http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://127.0.0.1:3000";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || DEFAULT_ORIGINS)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  }),
);
app.use(express.json({ limit: "32kb" }));

const eventsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

function isAuthorized(req) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return false;

  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7) === password;
  }

  if (authHeader.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
    const colonIndex = decoded.indexOf(":");
    const pass = colonIndex >= 0 ? decoded.slice(colonIndex + 1) : decoded;
    return pass === password;
  }

  return false;
}

function validateEvent(event) {
  if (!event || typeof event !== "object") {
    return "Event must be an object";
  }

  const { session_id, event_type, event_name } = event;

  if (!session_id || typeof session_id !== "string") {
    return "session_id is required";
  }
  if (!event_type || !EVENT_TYPES.has(event_type)) {
    return "Invalid event_type";
  }
  if (!event_name || typeof event_name !== "string") {
    return "event_name is required";
  }

  if (event_type === "click" && !CLICK_EVENTS.has(event_name)) {
    return "Invalid click event_name";
  }
  if (event_type === "page_view" && event_name !== "page_view") {
    return "page_view events must use event_name 'page_view'";
  }

  if (event.metadata !== undefined && typeof event.metadata !== "object") {
    return "metadata must be an object";
  }

  return null;
}

async function insertEvents(events) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const event of events) {
      await client.query(
        `INSERT INTO events (session_id, event_type, event_name, metadata, path, referrer)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          event.session_id,
          event.event_type,
          event.event_name,
          JSON.stringify(event.metadata || {}),
          event.path || null,
          event.referrer || null,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

function parseRange(range) {
  const match = /^(\d+)d$/.exec(range || "7d");
  if (!match) return 7;
  return parseInt(match[1], 10);
}

async function getStats(rangeDays) {
  const rangeInterval = `${rangeDays} days`;

  const overviewQuery = `
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'page_view' AND created_at >= CURRENT_DATE) AS views_today,
      COUNT(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE) AS sessions_today,
      COUNT(*) FILTER (WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '7 days') AS views_7d,
      COUNT(DISTINCT session_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS sessions_7d,
      COUNT(*) FILTER (WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '30 days') AS views_30d,
      COUNT(DISTINCT session_id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS sessions_30d,
      COUNT(*) FILTER (WHERE event_type = 'page_view') AS views_all,
      COUNT(DISTINCT session_id) AS sessions_all
    FROM events
  `;

  const clickBreakdownQuery = `
    SELECT event_name, COUNT(*)::int AS count
    FROM events
    WHERE event_type = 'click'
      AND created_at >= NOW() - $1::interval
    GROUP BY event_name
    ORDER BY count DESC
  `;

  const projectLeaderboardQuery = `
    SELECT
      COALESCE(metadata->>'project', 'Unknown') AS project,
      event_name,
      COUNT(*)::int AS count
    FROM events
    WHERE event_type = 'click'
      AND event_name IN ('live_demo', 'code', 'read_more', 'external_video', 'video_preview')
      AND created_at >= NOW() - $1::interval
      AND metadata ? 'project'
    GROUP BY project, event_name
    ORDER BY count DESC
    LIMIT 50
  `;

  const socialByLocationQuery = `
    SELECT
      event_name,
      COALESCE(metadata->>'location', 'unknown') AS location,
      COUNT(*)::int AS count
    FROM events
    WHERE event_type = 'click'
      AND event_name IN ('github', 'linkedin')
      AND created_at >= NOW() - $1::interval
    GROUP BY event_name, location
    ORDER BY count DESC
  `;

  const trafficOverTimeQuery = `
    SELECT
      DATE(created_at AT TIME ZONE 'UTC') AS date,
      COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS views,
      COUNT(DISTINCT session_id)::int AS sessions
    FROM events
    WHERE created_at >= NOW() - $1::interval
    GROUP BY DATE(created_at AT TIME ZONE 'UTC')
    ORDER BY date ASC
  `;

  const recentEventsQuery = `
    SELECT
      id,
      session_id,
      event_type,
      event_name,
      metadata,
      path,
      referrer,
      created_at
    FROM events
    ORDER BY created_at DESC
    LIMIT 100
  `;

  const interval = rangeInterval;

  const [
    overviewResult,
    clickBreakdownResult,
    projectLeaderboardResult,
    socialByLocationResult,
    trafficOverTimeResult,
    recentEventsResult,
  ] = await Promise.all([
    pool.query(overviewQuery),
    pool.query(clickBreakdownQuery, [interval]),
    pool.query(projectLeaderboardQuery, [interval]),
    pool.query(socialByLocationQuery, [interval]),
    pool.query(trafficOverTimeQuery, [interval]),
    pool.query(recentEventsQuery),
  ]);

  const overviewRow = overviewResult.rows[0] || {};

  const projectTotals = {};
  for (const row of projectLeaderboardResult.rows) {
    if (!projectTotals[row.project]) {
      projectTotals[row.project] = {
        project: row.project,
        total: 0,
        breakdown: {},
      };
    }
    projectTotals[row.project].total += row.count;
    projectTotals[row.project].breakdown[row.event_name] = row.count;
  }

  const projectLeaderboard = Object.values(projectTotals).sort(
    (a, b) => b.total - a.total,
  );

  return {
    range: `${rangeDays}d`,
    overview: {
      viewsToday: Number(overviewRow.views_today || 0),
      sessionsToday: Number(overviewRow.sessions_today || 0),
      views7d: Number(overviewRow.views_7d || 0),
      sessions7d: Number(overviewRow.sessions_7d || 0),
      views30d: Number(overviewRow.views_30d || 0),
      sessions30d: Number(overviewRow.sessions_30d || 0),
      viewsAll: Number(overviewRow.views_all || 0),
      sessionsAll: Number(overviewRow.sessions_all || 0),
    },
    clickBreakdown: clickBreakdownResult.rows,
    projectLeaderboard,
    socialByLocation: socialByLocationResult.rows,
    trafficOverTime: trafficOverTimeResult.rows.map((row) => ({
      date: row.date,
      views: row.views,
      sessions: row.sessions,
    })),
    recentEvents: recentEventsResult.rows,
  };
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.delete("/api/events", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    let deleted = 0;
    try {
      const fnResult = await pool.query("SELECT clear_all_events() AS deleted");
      deleted = Number(fnResult.rows[0]?.deleted ?? 0);
    } catch (fnErr) {
      console.warn(
        "clear_all_events() unavailable, falling back to DELETE:",
        fnErr.message,
      );
      const deleteResult = await pool.query("DELETE FROM events");
      deleted = deleteResult.rowCount ?? 0;
    }
    res.json({ success: true, deleted });
  } catch (err) {
    console.error("DELETE /api/events error:", err);
    res.status(500).json({ error: "Failed to clear events" });
  }
});

app.post("/api/events", eventsLimiter, async (req, res) => {
  try {
    const payload = req.body;
    const events = Array.isArray(payload) ? payload : [payload];

    if (events.length === 0) {
      return res.status(400).json({ error: "No events provided" });
    }
    if (events.length > 20) {
      return res.status(400).json({ error: "Maximum 20 events per request" });
    }

    for (const event of events) {
      const error = validateEvent(event);
      if (error) {
        return res.status(400).json({ error });
      }
    }

    await insertEvents(events);
    res.status(201).json({ success: true, count: events.length });
  } catch (err) {
    console.error("POST /api/events error:", err);
    res.status(500).json({ error: "Failed to store events" });
  }
});

app.get("/api/stats", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rangeDays = parseRange(req.query.range);
    const stats = await getStats(rangeDays);
    res.json(stats);
  } catch (err) {
    console.error("GET /api/stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

const dashboardPath = path.join(__dirname, "..", "dashboard");
app.use("/dashboard", express.static(dashboardPath));
app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(dashboardPath, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Analytics server listening on 0.0.0.0:${PORT}`);
});
