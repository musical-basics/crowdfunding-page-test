-- 1. Add the visibility column (Default to true so existing rewards stay visible)
ALTER TABLE "public"."cf_reward" 
ADD COLUMN IF NOT EXISTS "is_visible" BOOLEAN DEFAULT true;

-- 2. Force API refresh
NOTIFY pgrst, 'reload schema';
