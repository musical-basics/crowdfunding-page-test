-- Add shipping column to cf_campaign table
-- This stores HTML content for shipping information

ALTER TABLE "public"."cf_campaign"
ADD COLUMN IF NOT EXISTS "shipping" TEXT DEFAULT '';

-- Optional: Add a helpful default value for existing campaigns
UPDATE "public"."cf_campaign"
SET "shipping" = '<p>Shipping details coming soon.</p>'
WHERE "shipping" IS NULL OR "shipping" = '';
