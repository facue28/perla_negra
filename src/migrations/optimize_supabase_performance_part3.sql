-- 🚀 OPTIMIZE PERFORMANCE PART 3 (FINAL)
-- Focus: Fix 'initplan' warnings by stabilizing helper functions and removing final redundancies.

BEGIN;

-- 1. STABILIZE HELPER FUNCTIONS (Critical for RLS Performance)
-- By default, functions are VOLATILE (re-evaluated every row).
-- Marking them STABLE tells Postgres: "For the same input in the same statement, the result is the same."
-- This allows the optimizer to execute the auth check ONCE per query, not once per row.

ALTER FUNCTION public.is_admin(uuid) STABLE;
ALTER FUNCTION public.is_admin(text) STABLE;
ALTER FUNCTION public.is_admin() STABLE; -- In case there's a param-less version using auth.uid() internally


-- 2. REMOVE REDUNDANT ADMIN READ POLICIES
-- "Admins can manage X" (ALL) includes SELECT. We don't need a separate "Admins read X" (SELECT).

-- Orders
DROP POLICY IF EXISTS "Admins read all orders" ON orders;

-- Note: We generally KEEP "Admins can manage" vs "Public read" because avoiding the overlap
-- requires expensive (NOT is_admin()) checks on the public policy, which hurts performance more.
-- Just fixing the STABLE attribute removes the performance penalty of the checks.


-- 3. FINAL INITPLAN FIXES (Ensure strictly standard subqueries)

-- Admin Logs (View)
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs" ON admin_logs FOR SELECT TO authenticated USING ((SELECT public.is_admin(auth.uid())));

-- Admin Logs (Insert)
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_logs;
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- Admins (Read Self)
DROP POLICY IF EXISTS "Admins read admins" ON admins;
CREATE POLICY "Admins read admins" ON admins FOR SELECT TO authenticated USING (email = (SELECT auth.jwt() ->> 'email'::text));

COMMIT;
