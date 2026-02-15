-- Ultra-robust trigger to update BOTH campaign and reward stats
CREATE OR REPLACE FUNCTION public.update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- CASE 1: New successful pledge created (INSERT)
  IF (TG_OP = 'INSERT' AND NEW.status = 'succeeded') THEN
    
    -- 1. Update Campaign Globals
    UPDATE public.cf_campaign
    SET 
      total_pledged = total_pledged + NEW.amount,
      total_backers = total_backers + 1
    WHERE id = NEW.campaign_id;

    -- 2. Update Reward Specifics
    UPDATE public.cf_reward
    SET backers_count = backers_count + 1
    WHERE id = NEW.reward_id;
    
  -- CASE 2: Pledge status changed (UPDATE)
  ELSIF (TG_OP = 'UPDATE') THEN
    
    -- A. Pending -> Succeeded (Payment captured)
    IF (OLD.status != 'succeeded' AND NEW.status = 'succeeded') THEN
      -- Campaign
      UPDATE public.cf_campaign
      SET 
        total_pledged = total_pledged + NEW.amount,
        total_backers = total_backers + 1
      WHERE id = NEW.campaign_id;
      
      -- Reward
      UPDATE public.cf_reward
      SET backers_count = backers_count + 1
      WHERE id = NEW.reward_id;

    -- B. Succeeded -> Failed/Refunded (Refund)
    ELSIF (OLD.status = 'succeeded' AND NEW.status != 'succeeded') THEN
      -- Campaign
      UPDATE public.cf_campaign
      SET 
        total_pledged = total_pledged - OLD.amount,
        total_backers = total_backers - 1
      WHERE id = NEW.campaign_id;

      -- Reward
      UPDATE public.cf_reward
      SET backers_count = backers_count - 1
      WHERE id = NEW.reward_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
