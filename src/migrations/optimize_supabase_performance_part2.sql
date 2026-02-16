-- 🚀 OPTIMIZE PERFORMANCE PART 2
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. FIX MISSED INITPLAN WARNING (debug_email_logs)
DROP POLICY IF EXISTS "Restrictive Access debug_email_logs" ON debug_email_logs;
CREATE POLICY "Restrictive Access debug_email_logs" ON debug_email_logs FOR ALL TO public 
USING ((SELECT is_admin(auth.uid()))) 
WITH CHECK ((SELECT is_admin(auth.uid())));

-- 2. REDUCE POLICY EVALUATION OVERHEAD (Scope Admin policies to 'authenticated')
-- Admin policies shouldn't run for 'anon' users. This fixes "Multiple Permissive Policies" for anon.

-- Coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL TO authenticated USING ((SELECT is_admin()));

-- Orders
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders FOR ALL TO authenticated USING ((SELECT is_admin()));

-- Profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING ((SELECT is_admin()));


-- 3. CONSOLIDATE REDUNDANT ORDERS POLICIES
-- "Admins can manage orders" (ALL) and "Admins read all orders" (SELECT) are likely redundant.
-- We keep "Admins can manage orders" (updated above) and drop the specific SELECT one if it's covered.
-- However, if 'is_admin()' (UID) and 'is_admin(email)' are different logic, we might need both.
-- For safety/performance, we'll scope "Admins read all orders" to authenticated too.
DROP POLICY IF EXISTS "Admins read all orders" ON orders;
CREATE POLICY "Admins read all orders" ON orders FOR SELECT TO authenticated USING ((SELECT is_admin((auth.jwt() ->> 'email'::text))));

-- Fix Products duplication (public vs admin)
-- "Admin write products" apply only to authenticated
DROP POLICY IF EXISTS "Admin write products" ON products;
CREATE POLICY "Admin write products" ON products FOR ALL TO authenticated USING ((SELECT is_admin((auth.jwt() ->> 'email'::text))));

COMMIT;
