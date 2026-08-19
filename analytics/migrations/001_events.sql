-- Portfolio analytics events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  path TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events (event_name);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow the Render API database role to read/write events
CREATE POLICY "portfolio_analytics_all"
  ON events
  FOR ALL
  TO portfolio_analytics
  USING (true)
  WITH CHECK (true);
