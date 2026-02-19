-- SCRIPT DE INSPECCIÓN DE TRIGGERS Y FUNCIONES
-- Ejecuta esto en el SQL Editor y dime qué sale

-- 1. Ver qué funciones create_order_secure existen realmente ahora
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    p.proretset as returns_set
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'create_order_secure';

-- 2. Ver si hay triggers en las tablas que puedan estar causando el error
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('orders', 'order_items', 'products');

-- 3. Ver las deifiniciones de las Foreign Keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('orders', 'order_items');
