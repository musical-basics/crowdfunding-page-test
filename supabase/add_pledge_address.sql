-- Add shipping details to cf_pledge table
ALTER TABLE "public"."cf_pledge"
ADD COLUMN IF NOT EXISTS "shipping_address" TEXT,
ADD COLUMN IF NOT EXISTS "shipping_location" TEXT;
