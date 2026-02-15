-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."cf_update" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "campaign_id" text NOT NULL DEFAULT 'dreamplay-one',
  "title" text NOT NULL,
  "content" text NOT NULL,
  "image" text,
  "created_at" timestamptz DEFAULT now()
);

-- 2. Add the image column if it was missing
ALTER TABLE "public"."cf_update" ADD COLUMN IF NOT EXISTS "image" text;

-- 3. ALLOW PUBLIC READS (Required so users can SEE the post)
-- We enable RLS but add a policy that lets everyone READ.
-- Writing is handled purely by your Admin Client (which ignores this).
ALTER TABLE "public"."cf_update" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Updates" ON "public"."cf_update";

CREATE POLICY "Public Read Updates" 
ON "public"."cf_update" 
FOR SELECT 
USING (true);

-- 4. Reload API Cache
NOTIFY pgrst, 'reload schema';
