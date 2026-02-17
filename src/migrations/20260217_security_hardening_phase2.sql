-- ==============================================================================
-- 🔒 SECURITY HARDENING - PHASE 2: UUID-Only Authentication
-- ==============================================================================
-- Fecha: 2026-02-17
-- Objetivo: Corte definitivo a UUID-based admin authentication
-- PREREQUISITOS: 
--   - Phase 1 ejecutada
--   - Todos los admins migrados (user_id NO NULL)
--   - Acceso verificado en modo híbrido
-- ==============================================================================

-- PASO 1: Validación de Pre-requisitos
-- --------------------------------------------------------
-- Verificar que todos los admins tienen user_id asignado
DO $$
DECLARE
    v_unmigrated_count int;
BEGIN
    SELECT COUNT(*) INTO v_unmigrated_count
    FROM public.admins
    WHERE user_id IS NULL AND active = true;
    
    IF v_unmigrated_count > 0 THEN
        RAISE EXCEPTION 'ERROR: Hay % admins sin user_id. Ejecuta el backfill antes de continuar.', v_unmigrated_count;
    END IF;
    
    RAISE NOTICE 'Validación OK: Todos los admins tienen user_id asignado.';
END $$;

-- PASO 2: Función definitiva (Solo UUID)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Solo buscar por UUID (método seguro)
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid() 
          AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 3: Hacer user_id obligatorio
-- --------------------------------------------------------
ALTER TABLE public.admins 
ALTER COLUMN user_id SET NOT NULL;

-- PASO 4: Remover la columna email (OPCIONAL - solo si no se usa para nada más)
-- --------------------------------------------------------
-- PRECAUCIÓN: Solo descomentar si estás 100% seguro de que email no se usa
-- en otras partes del sistema (reportes, notificaciones, etc.)
-- 
-- ALTER TABLE public.admins DROP COLUMN IF EXISTS email;

-- ==============================================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ==============================================================================
-- 
-- Ejecutar las siguientes pruebas después de aplicar Phase 2:
-- 
-- 1. SELECT public.is_admin(); 
--    (Siendo admin, debe devolver true)
-- 
-- 2. SELECT * FROM public.admins;
--    (Solo debe devolver tu propia fila)
-- 
-- 3. Intentar acceder al panel admin con tu cuenta
--    (Debe funcionar normalmente)
-- 
-- 4. Intentar con cuenta no-admin
--    (Debe fallar/no mostrar datos)
-- 
-- ROLLBACK CRÍTICO: Si algo falla, ejecutar inmediatamente:
-- CREATE OR REPLACE FUNCTION public.is_admin()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--     RETURN public.is_admin_v1_email();
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==============================================================================

SELECT 'Phase 2 - UUID-Only Authentication: CUTOVER COMPLETE' as status;
