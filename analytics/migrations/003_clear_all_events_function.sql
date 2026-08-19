CREATE OR REPLACE FUNCTION clear_all_events()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count bigint;
BEGIN
  DELETE FROM events;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION clear_all_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION clear_all_events() TO portfolio_analytics;
