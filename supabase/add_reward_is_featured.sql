-- Add is_featured column to cf_reward table
ALTER TABLE cf_reward
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
