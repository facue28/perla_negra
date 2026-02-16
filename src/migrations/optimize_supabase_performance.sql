-- 🚀 OPTIMIZE RLS POLICIES & PERFORMANCE
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. OPTIMIZE AUTH CALLS (Avoid re-evaluation per row)
-- Replaces direct calls like `auth.uid()` with `(select auth.uid())` which is cached per statement.

-- Products: Admin write
DROP POLICY IF EXISTS "Admin write products" ON products;
CREATE POLICY "Admin write products" ON products FOR ALL TO public USING ((SELECT is_admin((auth.jwt() ->> 'email'::text))));

-- Orders: Admin read
DROP POLICY IF EXISTS "Admins read all orders" ON orders;
CREATE POLICY "Admins read all orders" ON orders FOR SELECT TO public USING ((SELECT is_admin((auth.jwt() ->> 'email'::text))));

-- Admin Logs: View
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs" ON admin_logs FOR SELECT TO public USING ((SELECT is_admin(auth.uid())));

-- Admin Logs: Insert
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_logs;
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT TO public WITH CHECK ((SELECT is_admin(auth.uid())));

-- Profiles: Update own
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO public USING ((SELECT auth.uid()) = id);

-- Profiles: View own
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO public USING ((SELECT auth.uid()) = id);

-- Admins: Read self
DROP POLICY IF EXISTS "Admins read admins" ON admins;
CREATE POLICY "Admins read admins" ON admins FOR SELECT TO public USING (email = (SELECT auth.jwt() ->> 'email'::text));


-- 2. REMOVE REDUNDANT POLICIES (Fix "Multiple Permissive Policies" warning)

-- Coupons: "No direct access coupons" (FALSE) is useless if we have other permissive policies.
-- "Public can read coupons" (TRUE) effectively allows everything for SELECT.
-- "Admins can manage coupons" covers admins.
DROP POLICY IF EXISTS "No direct access coupons" ON coupons; 

-- Orders: "No direct insert orders" (FALSE) is useless.
DROP POLICY IF EXISTS "No direct insert orders" ON orders;

-- Products: "Public read products" overlaps with "Public Products Read Access".
-- "Public Products Read Access" is just TRUE (allows hidden products?). 
-- "Public read products" checks active=true. Use the stricter one.
DROP POLICY IF EXISTS "Public Products Read Access" ON products;


COMMIT;
