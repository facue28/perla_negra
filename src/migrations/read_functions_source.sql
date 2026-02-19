-- COPIA ESTO Y PÉGALO EN EL SQL EDITOR
-- Me devolverá el código exacto de las funciones sospechosas

SELECT '--- handle_new_order_email ---' as info;
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_order_email';

SELECT '--- generate_order_number ---' as info;
SELECT prosrc FROM pg_proc WHERE proname = 'generate_order_number';

SELECT '--- create_order_secure ---' as info;
SELECT prosrc FROM pg_proc WHERE proname = 'create_order_secure';
