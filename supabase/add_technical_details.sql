-- Add technical_details column to cf_campaign table
-- This stores HTML content for the new Technical Details section

ALTER TABLE "public"."cf_campaign"
ADD COLUMN IF NOT EXISTS "technical_details" TEXT DEFAULT '';

-- Optional: Add a helpful default value for existing campaigns
UPDATE "public"."cf_campaign"
SET "technical_details" = ''
WHERE "technical_details" IS NULL;
