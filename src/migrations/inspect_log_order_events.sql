-- Script to inspect the definition of log_order_events
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'log_order_events';
