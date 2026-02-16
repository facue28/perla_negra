-- Inspect Storage Policies for 'products' bucket and 'images' bucket
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    p.polname AS policy_name,
    p.polpermissive AS permissive,
    p.polroles AS roles,
    p.polcmd AS cmd,
    pg_get_expr(p.polqual, p.polrelid) AS qual,
    pg_get_expr(p.polwithcheck, p.polrelid) AS with_check
FROM
    pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE
    n.nspname = 'storage' AND c.relname = 'objects';

-- Check buckets
SELECT * FROM storage.buckets;
