-- INSPACCION_POLITICAS.sql
-- Ejecuta esto para ver qué hacen las políticas duplicadas antes de borrarlas.

SELECT 
    tablename, 
    policyname, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies
WHERE tablename IN ('products', 'coupons', 'orders', 'profiles', 'admins', 'admin_logs', 'debug_email_logs')
ORDER BY tablename, policyname;
