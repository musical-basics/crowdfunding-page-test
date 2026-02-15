-- 1. Create Updates Table (Admin Posts)
CREATE TABLE IF NOT EXISTS "public"."cf_update" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "campaign_id" text NOT NULL DEFAULT 'dreamplay-one',
  "title" text NOT NULL,
  "content" text NOT NULL,
  "image" text,
  "created_at" timestamptz DEFAULT now()
);

-- 2. Create Comments Table (User Replies)
CREATE TABLE IF NOT EXISTS "public"."cf_comment" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "update_id" uuid REFERENCES "public"."cf_update" ON DELETE CASCADE,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT now()
);

-- 3. Enable RLS (Security)
ALTER TABLE "public"."cf_update" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cf_comment" ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Everyone can read updates and comments
CREATE POLICY "Public Read Updates" ON "public"."cf_update" FOR SELECT USING (true);
CREATE POLICY "Public Read Comments" ON "public"."cf_comment" FOR SELECT USING (true);

-- Only Admin can post updates (We use service key, so implicit full access, but good to have)
-- Everyone can post comments
CREATE POLICY "Public Create Comments" ON "public"."cf_comment" FOR INSERT WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
