-- Create a new JSONB column to store our rich media gallery
ALTER TABLE "public"."cf_campaign" 
ADD COLUMN IF NOT EXISTS "media_gallery" jsonb DEFAULT '[]'::jsonb;

-- (Optional) Comment to document the structure
COMMENT ON COLUMN "public"."cf_campaign"."media_gallery" IS 'Array of { id, type: "image"|"video", src, thumbnail? }';
