-- Add FAQ page content column to cf_campaign table
ALTER TABLE cf_campaign
ADD COLUMN IF NOT EXISTS faq_page_content TEXT;
