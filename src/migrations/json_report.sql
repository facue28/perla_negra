-- REPORTE CONSOLIDADO DE BASE DE DATOS (EJECUTAR TODO JUNTO)
SELECT json_build_object(
    'columns', (
        SELECT json_agg(t) FROM (
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name IN ('orders', 'order_items', 'products', 'coupons')
        ) t
    ),
    'triggers', (
        SELECT json_agg(t) FROM (
            SELECT event_object_table, trigger_name, action_statement 
            FROM information_schema.triggers 
            WHERE event_object_schema = 'public'
        ) t
    ),
    'functions', (
        SELECT json_agg(t) FROM (
            SELECT proname, pg_get_function_identity_arguments(oid) as args 
            FROM pg_proc 
            WHERE pronamespace = 'public'::regnamespace AND proname = 'create_order_secure'
        ) t
    ),
    'rls_policies', (
        SELECT json_agg(t) FROM (
            SELECT tablename, policyname, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public'
        ) t
    )
) as full_report;
