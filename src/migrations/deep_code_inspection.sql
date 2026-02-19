-- SCRIPT DE INSPECCIÓN DE CÓDIGO INTERNO
-- Vamos a leer exactamente qué hacen las funciones sospechosas

SELECT 
    proname, 
    prosrc -- El código fuente de la función
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
  AND proname IN ('handle_new_order_email', 'generate_order_number', 'is_admin');

-- También revisemos si hay alguna política de RLS que use un cast a UUID
SELECT 
    tablename, 
    policyname, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (qual ILIKE '%uuid%' OR with_check ILIKE '%uuid%');

-- Y revisemos las restricciones (constraints) de las tablas
SELECT 
    conname, 
    conrelid::regclass as table_name, 
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace 
  AND conrelid::regclass::text IN ('orders', 'order_items');
