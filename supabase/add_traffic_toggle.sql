
ALTER TABLE cf_campaign ADD COLUMN IF NOT EXISTS is_variant_a BOOLEAN DEFAULT TRUE;

CREATE OR REPLACE FUNCTION get_next_traffic_variant(campaign_id_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_val BOOLEAN;
  next_variant TEXT;
BEGIN
  -- 1. Get current value and lock row? (Optional, but good practice)
  SELECT is_variant_a INTO current_val FROM cf_campaign WHERE id = campaign_id_input;

  -- 2. Determine functionality
  IF current_val IS NULL THEN
     current_val := TRUE; -- Default fallback
  END IF;

  -- 3. Update to opposite
  UPDATE cf_campaign SET is_variant_a = NOT current_val WHERE id = campaign_id_input;

  -- 4. Return the variant that THIS user should see (the 'current' one before flip, or after? Doesn't matter as long as it alternates)
  -- Let's say we show them 'a' if it was true, then flip to false for next person.
  IF current_val THEN
    RETURN 'a';
  ELSE
    RETURN 'b';
  END IF;
END;
$$;

