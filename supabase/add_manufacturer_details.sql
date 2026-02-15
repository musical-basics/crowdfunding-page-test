-- Add manufacturer_details column to cf_campaign table
ALTER TABLE cf_campaign ADD COLUMN IF NOT EXISTS manufacturer_details TEXT;
