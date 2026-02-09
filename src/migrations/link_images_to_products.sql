
-- ⚠️ INSTRUCTIONS ⚠️
-- 1. Go to Supabase SQL Editor.
-- 2. Replace 'YOUR_SUPABASE_PROJECT_REF' with your actual project reference (found in your URL: https://[THIS_PART].supabase.co).
--    Example: if your URL is https://abcdefg.supabase.co, put 'abcdefg'.
-- 3. Run the script.

DO $$
DECLARE
    -- 👇 REPLACE THIS with your project ID (e.g., 'abcdefgh')
    project_ref TEXT := 'hkedgklpsksezxxymdgc'; 
    
    base_url TEXT;
BEGIN
    base_url := 'https://' || project_ref || '.supabase.co/storage/v1/object/public/images/';

    -- 1. GENERIC UPDATE (Smart Match) 🧠
    -- This tries to link EVERY product to a matching .webp image based on its slug.
    -- Example: Product with slug 'black-dragon' -> links to '.../images/black-dragon.webp'
    -- Note: This works perfectly if you named your files exactly like your slugs!
    -- 1. GENERIC UPDATE (Smart Match) 🧠
    -- Main Image -> slug + '1.webp'
    UPDATE products
    SET image_url = base_url || slug || '1.webp'
    WHERE slug IS NOT NULL;
    
    -- 1.1 ADD SECOND IMAGE COLUMN (Safe Migration) 🆕
    -- Checks if column exists, if not adds it. Safe to run multiple times.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image2_url') THEN
        ALTER TABLE products ADD COLUMN image2_url TEXT;
    END IF;

    -- 1.2 UPDATE SECOND IMAGE
    -- Secondary Image -> slug + '2.webp'
    UPDATE products
    SET image2_url = base_url || slug || '2.webp'
    WHERE slug IS NOT NULL;


    -- 2. SPECIFIC UPDATES (Manual Overrides) 🛠️
    -- Override logic just in case slugs don't match filenames

    -- Hi Sex (Bustina / Sobre)
    -- Target existing slug 'hi-sex'
    UPDATE products 
    SET image_url = base_url || 'hi-sex-bustina1.webp',
        image2_url = base_url || 'hi-sex-bustina2.webp',
        slug = 'hi-sex-bustina' 
    WHERE slug = 'hi-sex';

    -- Hi Sex (Flacone / Frasco)
    -- Target existing slug 'hi-sexb'
    UPDATE products 
    SET image_url = base_url || 'hi-sex-flacone1.webp',
        image2_url = base_url || 'hi-sex-flacone2.webp',
        slug = 'hi-sex-flacone' 
    WHERE slug = 'hi-sexb';


    -- 3. OPTIONAL: Fix other known deviations based on your file list
    -- (I saw filenames with '1' at the end, so let's try to match those if the generic one fails)
    
    -- Example: If slug is 'black-dragon' but file is 'black-dragon1.webp'
    UPDATE products
    SET image_url = base_url || slug || '1.webp'
    WHERE image_url LIKE '%/undefined.webp'; -- Only fix those that might have failed matching

END $$;
