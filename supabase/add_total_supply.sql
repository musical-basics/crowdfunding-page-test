-- Add total_supply column to cf_campaign table with a default of 100
ALTER TABLE cf_campaign ADD COLUMN IF NOT EXISTS total_supply INTEGER DEFAULT 100;
