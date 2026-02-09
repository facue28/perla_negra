-- =======================================================
-- FIX SECURITY WARNINGS: Function Search Path Mutable (PART 2)
-- =======================================================
-- This script fixes the remaining warnings.

BEGIN;

-- 1. FIX REMAINING IS_ADMIN
-- =========================
-- It seems there are two versions of is_admin. 
-- We securely fixed is_admin(text), but is_admin() (no args) might still be mutable.

-- Fix for: is_admin()
ALTER FUNCTION public.is_admin() SET search_path = public;

-- Just in case, re-apply the text version to be safe
ALTER FUNCTION public.is_admin(text) SET search_path = public;

COMMIT;

-- =======================================================
-- EXPLANATION FOR "Leaked Password Protection Disabled":
-- =======================================================
-- This warning appears because you are on the FREE PLAN.
-- Leaked Password Protection is a paid feature (Pro/Enterprise).
-- Since you are on the Free Plan, you CANNOT enable it.
-- Action: You can safely IGNORE this warning. It is expected behavior.
