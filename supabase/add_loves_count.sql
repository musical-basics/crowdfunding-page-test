-- Add loves_count column to cf_campaign table with a default of 0
ALTER TABLE cf_campaign ADD COLUMN IF NOT EXISTS loves_count INTEGER DEFAULT 0;
