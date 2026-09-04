# Portfolio Analytics

Privacy-focused analytics for [omarmahmoud.dev](https://omarmahmoud.dev). Tracks page views and key click events without third-party scripts.

## Architecture

- **Client tracker** (`analytics.js`) — runs on the portfolio site
- **API server** (`analytics/server/`) — Express app on Render, writes to Postgres
- **Database** — Neon Postgres (`events` table), region: Frankfurt (`aws-eu-central-1`)
- **Dashboard** (`analytics/dashboard/`) — password-protected stats UI served at `/dashboard`

## 1. Neon setup

1. Create a Neon project (Frankfurt recommended to match Render).
2. Run the schema migration in the SQL editor:

   ```
   analytics/migrations/005_neon_schema.sql
   ```

3. Copy the **pooled connection string** from the Neon dashboard (Settings → Connection string → Pooled, `sslmode=require`).

Only your Render service (via `DATABASE_URL`) should have database access. Do not expose the connection string publicly.

## 2. Render deployment

1. Push this repo to GitHub.
2. In Render, create a **Web Service** from the repo (or use the included `render.yaml` Blueprint).
3. Set **Root Directory** to `analytics/server`.
4. Configure environment variables:

   | Variable             | Description                                                            |
   | -------------------- | ---------------------------------------------------------------------- |
   | `DATABASE_URL`       | Neon Postgres pooled connection string                                 |
   | `DASHBOARD_PASSWORD` | Password for `/dashboard` and `/api/stats`                             |
   | `ALLOWED_ORIGINS`    | Comma-separated CORS origins (default includes production + localhost) |
   | `PORT`               | Set automatically by Render                                            |

5. Deploy. Note your service URL, e.g. `https://omarmahmoud-analytics.onrender.com`.

## 3. Portfolio site configuration

In `index.html`, set the analytics API base URL before scripts load:

```html
<script>
  window.ANALYTICS_API_URL = "https://your-analytics-service.onrender.com";
</script>
<script src="analytics.js"></script>
<script src="script.js"></script>
```

Redeploy the portfolio (GitHub Pages or your static host) after updating the URL.

## 4. Local development

### API server

```bash
cd analytics/server
# Create .env with DATABASE_URL (Neon) and DASHBOARD_PASSWORD
npm install
node index.js
```

The server loads `analytics/server/.env` automatically via `loadEnv.js`.

- Health check: `http://localhost:3000/health`
- Dashboard: `http://localhost:3000/dashboard`
- Stats API: `GET /api/stats?range=7d` with `Authorization: Bearer YOUR_PASSWORD`

### Portfolio + tracker

Serve the repo root with any static server (e.g. Live Server on port 5500). Ensure `ALLOWED_ORIGINS` includes your local origin.

## Tracked events

| Type        | Names                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `page_view` | `page_view`                                                                                                             |
| `click`     | `resume`, `live_demo`, `video_preview`, `external_video`, `read_more`, `view_certificate`, `code`, `github`, `linkedin` |

Project clicks include `metadata.project`. Experience clicks include `metadata.company`. Social clicks include `metadata.location` (e.g. `navbar`, `contact`).

Each event also stores `ip_address` and `country` (resolved server-side).

## Dashboard

Visit `https://your-service.onrender.com/dashboard`, sign in with `DASHBOARD_PASSWORD`, and view:

- Overview cards (views/sessions for today, 7d, 30d, all time)
- Visitors by country
- Click breakdown chart
- Traffic over time
- Project leaderboard
- Social clicks by location
- Recent events table

## Migrations

| File                  | Purpose                               |
| --------------------- | ------------------------------------- |
| `005_neon_schema.sql` | **Current** — full schema for Neon    |
| `001`–`004`           | Legacy Supabase migrations (archived) |
