-- 1. Create a Creator table (matches your Creator interface)
CREATE TABLE "public"."cf_creator" (
    "id" "text" PRIMARY KEY, -- e.g., 'popumusic'
    "name" "text" NOT NULL,
    "avatar_url" "text",
    "bio" "text",
    "location" "text",
    "projects_created" integer DEFAULT 0,
    "projects_backed" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Create the Crowdfunding Campaign table
-- We use 'cf_campaign' to avoid conflict with your existing 'Campaign' table
CREATE TABLE "public"."cf_campaign" (
    "id" "text" PRIMARY KEY, -- e.g., 'dreamplay-one'
    "creator_id" "text" REFERENCES "public"."cf_creator"("id"),
    "title" "text" NOT NULL,
    "subtitle" "text",
    "story" "text", -- HTML content
    "risks" "text", -- HTML content
    "hero_image" "text",
    "gallery_images" "text"[], -- Array of image URLs
    "goal_amount" numeric NOT NULL,
    "total_pledged" numeric DEFAULT 0,
    "total_backers" integer DEFAULT 0,
    "ends_at" timestamp with time zone, -- Replaces 'daysLeft' for accuracy
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Create Rewards table
CREATE TABLE "public"."cf_reward" (
    "id" "text" PRIMARY KEY,
    "campaign_id" "text" REFERENCES "public"."cf_campaign"("id") ON DELETE CASCADE,
    "title" "text" NOT NULL,
    "price" numeric NOT NULL,
    "original_price" numeric,
    "description" "text",
    "items_included" "text"[],
    "estimated_delivery" "text",
    "ships_to" "text"[],
    "limit_quantity" integer, -- Null means unlimited
    "backers_count" integer DEFAULT 0,
    "is_sold_out" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Create FAQs table
CREATE TABLE "public"."cf_faq" (
    "id" "text" PRIMARY KEY,
    "campaign_id" "text" REFERENCES "public"."cf_campaign"("id") ON DELETE CASCADE,
    "category" "text",
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "order" integer DEFAULT 0
);

-- 5. Create Pledges table (The Transaction Log)
-- This links your crowdfunding logic to your existing "Customer" table
CREATE TABLE "public"."cf_pledge" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "campaign_id" "text" REFERENCES "public"."cf_campaign"("id"),
    "reward_id" "text" REFERENCES "public"."cf_reward"("id"),
    "customer_id" "text" REFERENCES "public"."Customer"("id"), -- Links to existing users
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'succeeded', -- succeeded, pending, failed
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE "public"."cf_campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cf_reward" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cf_pledge" ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so anyone can view the campaign)
CREATE POLICY "Public read campaigns" ON "public"."cf_campaign" FOR SELECT USING (true);
CREATE POLICY "Public read rewards" ON "public"."cf_reward" FOR SELECT USING (true);
CREATE POLICY "Public read faqs" ON "public"."cf_faq" FOR SELECT USING (true);
CREATE POLICY "Public read creators" ON "public"."cf_creator" FOR SELECT USING (true);

-- Insert Creator
INSERT INTO "public"."cf_creator" (id, name, avatar_url, bio, location)
VALUES (
    'popumusic', 
    'PopuMusic', 
    '/placeholder-user.jpg', 
    'Founded on April 1, 2015, PopuMusic is a dynamic team revolutionizing music interaction.', 
    'Delaware City, DE'
);

-- Insert Campaign
INSERT INTO "public"."cf_campaign" (id, creator_id, title, subtitle, story, risks, hero_image, gallery_images, goal_amount, total_pledged, total_backers, ends_at)
VALUES (
    'dreamplay-one',
    'popumusic',
    'DreamPlay One - Crowdfunding Campaign',
    'Back the DreamPlay One keyboard with narrower keys designed for your handspan. Stop over-stretching.',
    '<p>I’ve been a concert pianist for years, and I’ve always struggled with the standard keyboard size. It’s just too big for my hands, and I know I’m not alone.</p><p>That’s why I created DreamPlay One. It’s a keyboard designed for pianists with smaller hands, so you can play comfortably and without pain.</p><h3>Why DreamPlay One?</h3><ul><li><strong>Narrower Keys:</strong> The keys are 15/16ths the width of standard keys, making it easier to reach octaves and large chords.</li><li><strong>Professional Sound:</strong> We’ve partnered with top sound engineers to ensure DreamPlay One sounds as good as it feels.</li><li><strong>Portable Design:</strong> It’s lightweight and compact, so you can take it with you wherever you go.</li></ul><p>Join us in revolutionizing the way we play piano. Back DreamPlay One today!</p>',
    '<p>Every crowdfunding campaign comes with risks, but we’ve done our homework. We have a working prototype and have partnered with a reputable manufacturer.</p><p>However, unforeseen delays can happen in manufacturing and shipping. We promise to keep you updated every step of the way.</p>',
    '/images/hero-piano.png',
    ARRAY['/images/gallery-1.jpg', '/images/gallery-2.jpg'],
    5000,
    88808,
    224,
    NOW() + INTERVAL '28 days' -- Automatically sets end date 28 days from now
);

-- Insert Rewards
INSERT INTO "public"."cf_reward" (id, campaign_id, title, price, original_price, description, items_included, estimated_delivery, ships_to, backers_count, is_sold_out)
VALUES 
('vip-founder', 'dreamplay-one', 'VIP Founder Access', 1, NULL, 'Early updates + lowest price guarantee', ARRAY['VIP Access'], 'Immediate', ARRAY['Digital Reward'], 127, false),
('super-early-bird', 'dreamplay-one', 'Super Early Bird', 199, 399, 'DS5.5 or DS6.0 at the deepest discount', ARRAY['DreamPlay Keyboard'], 'Feb 2026', ARRAY['Anywhere in the world'], 50, true),
('early-bird', 'dreamplay-one', 'Early Bird', 249, 349, 'DS5.5 or DS6.0 at a special price', ARRAY['DreamPlay Keyboard'], 'Feb 2026', ARRAY['Anywhere in the world'], 34, false);

-- Insert FAQs
INSERT INTO "public"."cf_faq" (id, campaign_id, category, question, answer, "order")
VALUES
('model-choice', 'dreamplay-one', 'About Purchase', 'Which DreamPlay model is right for me?', 'DreamPlay comes in two sizes: DS5.5 for smaller hands and DS6.0 for average hands. Check our sizing guide to find your perfect fit.', 1),
('delivery-timeline', 'dreamplay-one', 'About Purchase', 'When will I receive my keyboard?', 'We estimate shipping to begin in February 2026. We will keep all backers updated on our progress.', 2);
