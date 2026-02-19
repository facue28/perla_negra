-- INFORME DE EMERGENCIA: DESCUBRIENDO EL ÚLTIMO ESCONDITE DEL UUID
SELECT json_build_object(
    'order_email_attempts_columns', (
        SELECT json_agg(t) FROM (
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'order_email_attempts'
        ) t
    ),
    'all_triggers_in_db', (
        SELECT json_agg(t) FROM (
            SELECT event_object_table, trigger_name, action_statement 
            FROM information_schema.triggers 
            WHERE event_object_schema = 'public'
        ) t
    ),
    'order_items_constraints', (
        SELECT json_agg(t) FROM (
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE conrelid = 'public.order_items'::regclass
        ) t
    )
) as debug_report;
