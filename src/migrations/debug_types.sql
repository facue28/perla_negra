-- SCRIPT DE DIAGNÓSTICO DE TIPOS
-- Ejecuta esto en el SQL Editor y dime qué sale en 'Results'
SELECT 
    table_name, 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'order_items', 'orders')
  AND column_name IN ('id', 'product_id', 'order_id');
