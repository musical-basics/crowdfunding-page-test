-- Create a storage bucket for campaign assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-assets', 'campaign-assets', true);

-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'campaign-assets' );

-- Allow authenticated users (admins) to upload files
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'campaign-assets' );
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'campaign-assets' );
