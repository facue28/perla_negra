-- INVESTIGACIÓN DE FALLO DE EMAIL
SELECT 
    ea.id, 
    ea.order_id, 
    ea.status, 
    ea.created_at,
    o.order_number,
    o.customer_email,
    -- Intentamos ver si hay errores en la cola de pg_net
    (SELECT json_agg(t) FROM (
        SELECT status, error_msg, response_status
        FROM net.http_request_queue
        ORDER BY created DESC LIMIT 5
    ) t) as http_logs
FROM public.order_email_attempts ea
JOIN public.orders o ON ea.order_id = o.id
ORDER BY ea.created_at DESC
LIMIT 5;
