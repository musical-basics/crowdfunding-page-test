-- Add shopify_variant_id column to cf_reward table
ALTER TABLE cf_reward 
ADD COLUMN shopify_variant_id TEXT;

-- Comment on column
COMMENT ON COLUMN cf_reward.shopify_variant_id IS 'Shopify Variant ID or JSON map for options';
