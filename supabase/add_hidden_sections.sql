-- Add hidden_sections column to cf_campaign table
-- Stores an array of section IDs that should be hidden from the public page
-- e.g. ["features", "specs", "manufacturer"]
ALTER TABLE cf_campaign
ADD COLUMN IF NOT EXISTS hidden_sections jsonb DEFAULT '[]'::jsonb;
