-- Add JSONB columns for Key Features and Technical Specs
ALTER TABLE "public"."cf_campaign" 
ADD COLUMN "key_features" jsonb DEFAULT '[]'::jsonb,
ADD COLUMN "tech_specs" jsonb DEFAULT '[]'::jsonb;

-- Comment on columns
COMMENT ON COLUMN "public"."cf_campaign"."key_features" IS 'Array of { icon, title, desc }';
COMMENT ON COLUMN "public"."cf_campaign"."tech_specs" IS 'Array of { label, value }';
