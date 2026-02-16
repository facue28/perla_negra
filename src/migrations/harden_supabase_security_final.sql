-- 🛡️ FINAL SECURITY HARDENING SCRIPT - PERLA NEGRA
-- Run this in the Supabase SQL Editor to fix the reported warnings.

BEGIN;

-- =======================================================
-- 1. ERROR: RLS Disabled in Public (public.debug_email_logs)
-- =======================================================
ALTER TABLE IF EXISTS public.debug_email_logs ENABLE ROW LEVEL SECURITY;

-- Create a restrictive policy (Only Admins/Service Role can manage logs)
-- Drops existing policy if any to avoid conflicts
DROP POLICY IF EXISTS "Restrictive Access debug_email_logs" ON public.debug_email_logs;

CREATE POLICY "Restrictive Access debug_email_logs" 
ON public.debug_email_logs
FOR ALL 
USING ( (SELECT is_admin(auth.uid())) ) 
WITH CHECK ( (SELECT is_admin(auth.uid())) );


-- =======================================================
-- 2. WARNING: Function Search Path Mutable
-- =======================================================
-- Fixing "search_path" prevents malicious code execution from other schemas.

-- 2.1 Admin Checks
ALTER FUNCTION public.is_admin(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_admin(text) SET search_path = public, pg_temp;

-- 2.2 Dashboard Stats
ALTER FUNCTION public.get_dashboard_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_daily_sales_chart() SET search_path = public, pg_temp;

-- 2.3 Email & Events
ALTER FUNCTION public.handle_new_order_email() SET search_path = public, pg_temp;

-- 2.4 Order Creation (Secure)
-- Found signature: (name, phone, email, address, notes, items, coupon)
ALTER FUNCTION public.create_order_secure(text, text, text, text, text, jsonb, text) SET search_path = public, pg_temp;

-- 2.5 Log Order Events
-- NOTE: We couldn't find the exact signature in the codebase.
-- If this fails, please check the function arguments and uncomment/adjust:
-- ALTER FUNCTION public.log_order_events(jsonb) SET search_path = public, pg_temp;


-- =======================================================
-- 3. WARNING: Extension in Public (pg_net)
-- =======================================================
-- NOTE: 'pg_net' is often installed in public by Supabase default.
-- Moving it might break existing code if not careful.
-- If you want to move it to 'extensions' schema, uncomment below:
-- MINIMAL RISK FIX: Ensure usage is qualified (e.g. net.http_post) which we already do.
--
-- CREATE SCHEMA IF NOT EXISTS extensions;
-- ALTER EXTENSION "pg_net" SET SCHEMA extensions;


COMMIT;

-- =======================================================
-- 4. WARNING: Leaked Password Protection Disabled
-- =======================================================
-- This cannot be fixed via SQL.
-- ACTIONS REQUIRED:
-- 1. Go to Supabase Dashboard > Authentication > Security
-- 2. Enable "Enable Have I Been Pwned API" (Password Protection)
