-- 🛡️ PATCH FOR log_order_events ONLY
-- The 'pg_net' extension cannot be moved (non-relocatable), so we leave it in public.
-- This script only fixes the function search path warning.

BEGIN;

-- FIX: Function Search Path Mutable (public.log_order_events)
-- Setting the secure search path for the trigger function.
ALTER FUNCTION public.log_order_events() SET search_path = public, pg_temp;

COMMIT;
