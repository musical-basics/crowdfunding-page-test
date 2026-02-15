-- 1. Ensure RLS is enabled on all tables
ALTER TABLE "public"."cf_campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cf_reward" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cf_faq" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cf_creator" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (in case some partially exist)
DROP POLICY IF EXISTS "Public read campaigns" ON "public"."cf_campaign";
DROP POLICY IF EXISTS "Public read rewards" ON "public"."cf_reward";
DROP POLICY IF EXISTS "Public read faqs" ON "public"."cf_faq";
DROP POLICY IF EXISTS "Public read creators" ON "public"."cf_creator";

-- 3. Re-create the policies to allow public read access
CREATE POLICY "Public read campaigns" ON "public"."cf_campaign" FOR SELECT USING (true);
CREATE POLICY "Public read rewards" ON "public"."cf_reward" FOR SELECT USING (true);
CREATE POLICY "Public read faqs" ON "public"."cf_faq" FOR SELECT USING (true);
CREATE POLICY "Public read creators" ON "public"."cf_creator" FOR SELECT USING (true);
