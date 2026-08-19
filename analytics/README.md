# Portfolio Analytics

Privacy-focused analytics for [omarmahmoud.dev](https://omarmahmoud.dev). Tracks page views and key click events without third-party scripts.

## Architecture

- **Client tracker** (`analytics.js`) — runs on the portfolio site
- **API server** (`analytics/server/`) — Express app on Render, writes to Postgres
- **Database** — Supabase Postgres (`events` table)
- **Dashboard** (`analytics/dashboard/`) — password-protected stats UI served at `/dashboard`

## 1. Supabase setup

1. Create a Supabase project (or use an existing one).
2. Open **SQL Editor** and run the migration:

   ```
   analytics/migrations/001_events.sql
   ```

3. Copy the **connection string** (Settings → Database → Connection string → URI). Use the pooler URI for serverless/Render if available.

RLS is enabled with no public policies, so only direct database connections (your Render service using `DATABASE_URL`) can read or write events.

## 2. Render deployment

1. Push this repo to GitHub.
2. In Render, create a **Web Service** from the repo (or use the included `render.yaml` Blueprint).
3. Set **Root Directory** to `analytics/server`.
4. Configure environment variables:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Supabase Postgres connection string |
   | `DASHBOARD_PASSWORD` | Password for `/dashboard` and `/api/stats` |
   | `ALLOWED_ORIGINS` | Comma-separated CORS origins (default includes production + localhost) |
   | `PORT` | Set automatically by Render |

5. Deploy. Note your service URL, e.g. `https://portfolio-analytics.onrender.com`.

## 3. Portfolio site configuration

In `index.html`, set the analytics API base URL before scripts load:

```html
<script>
  window.ANALYTICS_API_URL = "https://your-analytics-service.onrender.com";
</script>
<script src="analytics.js"></script>
<script src="script.js"></script>
```

Leave `ANALYTICS_API_URL` empty during local development to disable tracking.

Redeploy the portfolio (GitHub Pages or your static host) after updating the URL.

## 4. Local development

### API server

```bash
cd analytics/server
cp ../../.env.example .env
# Edit .env with your DATABASE_URL and DASHBOARD_PASSWORD
npm install
node index.js
```

- Health check: `http://localhost:3000/health`
- Dashboard: `http://localhost:3000/dashboard`
- Stats API: `GET /api/stats?range=7d` with `Authorization: Bearer YOUR_PASSWORD`

### Portfolio + tracker

Serve the repo root with any static server (e.g. Live Server on port 5500). Ensure `ALLOWED_ORIGINS` includes your local origin.

## Tracked events

| Type | Names |
|------|-------|
| `page_view` | `page_view` |
| `click` | `resume`, `live_demo`, `video_preview`, `external_video`, `read_more`, `code`, `github`, `linkedin` |

Project clicks include `metadata.project`. Social clicks include `metadata.location` (e.g. `navbar`, `contact`).

## Dashboard

Visit `https://your-service.onrender.com/dashboard`, sign in with `DASHBOARD_PASSWORD`, and view:

- Overview cards (views/sessions for today, 7d, 30d, all time)
- Click breakdown chart
- Traffic over time
- Project leaderboard
- Social clicks by location
- Recent events table
