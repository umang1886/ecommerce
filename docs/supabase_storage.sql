-- Add to Supabase Storage
-- Run this in the Supabase dashboard → Storage

-- 1. Create the bucket (or via UI: Storage → New bucket → "products", Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload
CREATE POLICY "auth_upload_products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- 3. Allow everyone to read (public images)
CREATE POLICY "public_read_products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- 4. Allow authenticated users to delete their own uploads
CREATE POLICY "auth_delete_products"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
