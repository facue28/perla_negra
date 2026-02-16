-- 1. Ensure `images` bucket is public (already enabled, but good to ensure)
UPDATE storage.buckets
SET public = true
WHERE id = 'images';

-- 2. Drop existing policy if it conflicts (to handle re-runs)
DROP POLICY IF EXISTS "Public Access to Images Bucket" ON storage.objects;

-- 3. Create a comprehensive public read policy for the 'images' bucket
--    This explicitly allows SELECT for the 'anon' (public) role.
--    Crucial for Image Transformations to work correctly.
CREATE POLICY "Public Access to Images Bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- 4. Verify (Optional for manual check)
-- SELECT * FROM pg_policies WHERE tablename = 'objects';
