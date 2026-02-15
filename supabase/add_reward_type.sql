-- Add reward_type column to cf_reward table
-- Values: 'bundle' (default) or 'keyboard_only'
ALTER TABLE cf_reward ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'bundle';
