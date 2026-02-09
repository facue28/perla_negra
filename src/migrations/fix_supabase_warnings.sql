-- =======================================================
-- FIX SECURITY WARNINGS: Function Search Path Mutable
-- =======================================================
-- This script secures functions by setting a fixed 'search_path'.
-- Prevents malicious users from hijacking function execution by creating objects in other schemas.

BEGIN;

-- 1. UTILITY FUNCTIONS
-- ====================
ALTER FUNCTION public.normalize_product_name() SET search_path = public;

-- 2. AUTH & SECURITY
-- ==================
-- is_admin(user_email text)
ALTER FUNCTION public.is_admin(text) SET search_path = public;

-- 3. COUPONS
-- ==========
-- check_coupon(code_input text)
ALTER FUNCTION public.check_coupon(text) SET search_path = public;

-- increment_coupon_usage(code_input text)
ALTER FUNCTION public.increment_coupon_usage(text) SET search_path = public;

-- 4. ORDER HELPERS
-- ================
-- update_order_updated_at() (Trigger function)
ALTER FUNCTION public.update_order_updated_at() SET search_path = public;

-- generate_order_number()
ALTER FUNCTION public.generate_order_number() SET search_path = public;

-- 5. ORDER OPERATIONS (RPCs)
-- ==========================

-- create_order (legacy/standard version)
-- schema: (customer_info jsonb, items jsonb, coupon_code text)
ALTER FUNCTION public.create_order(jsonb, jsonb, text) SET search_path = public;

-- create_order_secure (reinforced version)
-- schema: (name text, phone text, email text, address text, notes text, items jsonb, coupon text)
ALTER FUNCTION public.create_order_secure(text, text, text, text, text, jsonb, text) SET search_path = public;

-- update_order_status_secure (admin only)
-- schema: (order_id uuid, new_status order_status)
ALTER FUNCTION public.update_order_status_secure(uuid, public.order_status) SET search_path = public;

COMMIT;

-- =======================================================
-- NOTE ON "Leaked Password Protection Disabled" WARNING:
-- =======================================================
-- This cannot be fixed via SQL. You must enable it in the Supabase Dashboard:
-- 1. Go to Authentication > Security (or User Sessions)
-- 2. Enable "Have I Been Pwned" password protection or similar toggle if available in Pro plan,
--    or simply acknowledge that it's disabled if you don't need it.
