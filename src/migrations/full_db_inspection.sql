-- SCRIPT DE INSPECCIÓN TOTAL
-- Ejecuta esto en el SQL Editor y pásame el resultado COMPLETO

-- 1. Todas las columnas de las tablas involucradas
SELECT 
    table_name, 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'order_items', 'orders', 'coupons')
ORDER BY table_name, ordinal_position;

-- 2. Todos los triggers activos
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_schema = 'public';

-- 3. Lista de funciones con sus argumentos reales
SELECT 
    n.nspname as schema,
    p.proname as function,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname IN ('create_order_secure', 'handle_new_order_email');
