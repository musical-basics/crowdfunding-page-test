-- Add checkout_url column to cf_reward table
ALTER TABLE cf_reward 
ADD COLUMN checkout_url TEXT;

-- Comment on column
COMMENT ON COLUMN cf_reward.checkout_url IS 'External checkout URL (e.g. Shopify permalink)';
