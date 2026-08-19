-- Allow the Render API database role to read/write events
CREATE POLICY "portfolio_analytics_all"
  ON events
  FOR ALL
  TO portfolio_analytics
  USING (true)
  WITH CHECK (true);
