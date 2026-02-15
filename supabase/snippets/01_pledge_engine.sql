-- 1. Create the function that does the math
CREATE OR REPLACE FUNCTION public.update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- CASE 1: New successful pledge created
  IF (TG_OP = 'INSERT' AND NEW.status = 'succeeded') THEN
    UPDATE public.cf_campaign
    SET 
      total_pledged = total_pledged + NEW.amount,
      total_backers = total_backers + 1
    WHERE id = NEW.campaign_id;
    
  -- CASE 2: Pledge status changed (e.g. pending -> succeeded)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If it just became successful
    IF (OLD.status != 'succeeded' AND NEW.status = 'succeeded') THEN
      UPDATE public.cf_campaign
      SET 
        total_pledged = total_pledged + NEW.amount,
        total_backers = total_backers + 1
      WHERE id = NEW.campaign_id;
      
    -- If it was refunded/failed (was success, now is not)
    ELSIF (OLD.status = 'succeeded' AND NEW.status != 'succeeded') THEN
      UPDATE public.cf_campaign
      SET 
        total_pledged = total_pledged - OLD.amount,
        total_backers = total_backers - 1
      WHERE id = NEW.campaign_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the pledge table
DROP TRIGGER IF EXISTS on_pledge_change ON public.cf_pledge;

CREATE TRIGGER on_pledge_change
AFTER INSERT OR UPDATE ON public.cf_pledge
FOR EACH ROW EXECUTE FUNCTION public.update_campaign_stats();
