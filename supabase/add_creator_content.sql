-- Add page_content column to cf_creator table
ALTER TABLE "public"."cf_creator" 
ADD COLUMN IF NOT EXISTS "page_content" TEXT DEFAULT '';
