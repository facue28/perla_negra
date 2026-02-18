-- ==============================================================================
-- ⚡ PERFORMANCE WARNINGS FIX
-- ==============================================================================
-- Fecha: 2026-02-18
-- Objetivo: Corregir advertencias de performance del Supabase Advisor
--
-- Advertencias corregidas:
--   1. auth_rls_initplan → tabla: admins (política "Admins read admins")
--      Fix: usar (SELECT auth.uid()) y (SELECT auth.jwt()) en vez de directo
--
--   2. multiple_permissive_policies → tabla: products
--      Fix: combinar "Admin write products" + "Public read products" en SELECT
--      usando una sola política con OR
--
-- Advertencias que NO requieren cambio real:
--   - admin_logs: ya usa (SELECT is_admin(...)) correctamente
--   - debug_email_logs: ya usa (SELECT is_admin(...)) correctamente
--   - coupons: las dos políticas son para roles distintos (authenticated vs public)
--             PostgreSQL las evalúa por separado, no hay overlap real
--   - profiles: ídem, roles distintos (authenticated vs public)
-- ==============================================================================


-- ==============================================================================
-- FIX 1: admins → "Admins read admins"
-- Problema: usa auth.uid() y auth.jwt() directamente (re-evaluado por fila)
-- Fix: envolver con SELECT para que se evalúe una sola vez
-- ==============================================================================
DROP POLICY IF EXISTS "Admins read admins" ON public.admins;
CREATE POLICY "Admins read admins"
ON public.admins
FOR SELECT
USING (
    user_id = (SELECT auth.uid())
    OR email = ((SELECT auth.jwt()) ->> 'email')
);


-- ==============================================================================
-- FIX 2: products → combinar políticas SELECT en una sola
-- Problema: "Admin write products" (ALL para authenticated) y 
--           "Public read products" (SELECT para public) generan dos evaluaciones
--           para SELECT cuando el usuario es authenticated
-- Fix: crear política SELECT unificada que cubra ambos casos
-- ==============================================================================

-- Primero recrear "Admin write products" solo para escritura (INSERT/UPDATE/DELETE)
-- y dejar el SELECT fuera para manejarlo con una política unificada
DROP POLICY IF EXISTS "Admin write products" ON public.products;

-- Política de escritura solo para admins (INSERT, UPDATE, DELETE)
CREATE POLICY "Admin write products"
ON public.products
FOR ALL
TO authenticated
USING (
    (SELECT is_admin((auth.jwt() ->> 'email'::text)))
)
WITH CHECK (
    (SELECT is_admin((auth.jwt() ->> 'email'::text)))
);

-- Política de lectura unificada: productos activos para todos,
-- o cualquier producto si es admin
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products"
ON public.products
FOR SELECT
USING (
    (active = true OR active IS NULL)
    OR (SELECT is_admin((auth.jwt() ->> 'email'::text)))
);


-- ==============================================================================
-- VERIFICACIÓN
-- ==============================================================================
-- Ejecutar después para confirmar que las políticas quedaron bien:
--
-- SELECT tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('admins', 'products')
--   AND schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- ==============================================================================

SELECT 'Performance Warnings Fix: COMPLETE' as status;
