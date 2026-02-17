-- ==============================================================================
-- 🔒 SECURITY HARDENING - PHASE 1: Admin Identity Migration
-- ==============================================================================
-- Fecha: 2026-02-17
-- Objetivo: Migrar de email-based a UUID-based admin authentication
-- Estrategia: Transición híbrida sin downtime
-- ==============================================================================

-- PASO 1: Añadir columna UUID a public.admins
-- --------------------------------------------------------
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para mejorar performance de búsqueda
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);

-- PASO 2: Backup de la función original (rollback safety)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_v1_email()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (auth.jwt() ->> 'email') 
          AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 3: Función de transición híbrida (Email OR UUID)
-- --------------------------------------------------------
-- Esta función acepta ambos métodos durante la migración
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Buscar por UUID primero (nuevo método)
    IF EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid() 
          AND active = true
    ) THEN
        RETURN true;
    END IF;
    
    -- Fallback a email (método legacy para compatibilidad temporal)
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (auth.jwt() ->> 'email') 
          AND active = true
          AND user_id IS NULL  -- Solo para usuarios no migrados
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 4: Comentarios para migración manual de datos
-- --------------------------------------------------------
-- Instrucciones para el administrador:
-- 1. Ir al Dashboard de Supabase > Authentication > Users
-- 2. Buscar el usuario admin por email (ej: facundo.elias10@gmail.com)
-- 3. Copiar el UUID del usuario
-- 4. Ejecutar el siguiente UPDATE reemplazando los valores:
--
-- UPDATE public.admins 
-- SET user_id = '<UUID_DEL_USUARIO>'
-- WHERE email = '<EMAIL_DEL_ADMIN>';
--
-- Ejemplo:
-- UPDATE public.admins 
-- SET user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- WHERE email = 'facundo.elias10@gmail.com';

-- PASO 5: Endurecimiento de RLS en public.admins (Anti-Enumeración)
-- --------------------------------------------------------
-- Asegurar que solo admins pueden ver la tabla de admins
DROP POLICY IF EXISTS "Admins read admins" ON public.admins;
CREATE POLICY "Admins read admins" 
ON public.admins 
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.jwt() ->> 'email');

-- Bloquear escritura directa para todos (solo via RPC si se necesita)
DROP POLICY IF EXISTS "No public insert admins" ON public.admins;
CREATE POLICY "No public insert admins" 
ON public.admins 
FOR INSERT 
WITH CHECK (false);

DROP POLICY IF EXISTS "No public update admins" ON public.admins;
CREATE POLICY "No public update admins" 
ON public.admins 
FOR UPDATE 
USING (false);

DROP POLICY IF EXISTS "No public delete admins" ON public.admins;
CREATE POLICY "No public delete admins" 
ON public.admins 
FOR DELETE 
USING (false);

-- ==============================================================================
-- NOTAS DE IMPLEMENTACIÓN
-- ==============================================================================
-- 
-- ESTADO ACTUAL: Transición híbrida activada
-- - La función is_admin() acepta tanto UUID como email
-- - La columna user_id está lista para recibir datos
-- 
-- PRÓXIMOS PASOS MANUALES:
-- 1. Backfill: Asignar UUIDs a todos los admins existentes
-- 2. Verificación: Confirmar que el acceso sigue funcionando
-- 3. Corte definitivo: Ejecutar Phase 2 (solo UUID)
-- 
-- ROLLBACK: Si algo falla, ejecutar:
-- CREATE OR REPLACE FUNCTION public.is_admin() AS $body$
-- BEGIN
--     RETURN EXISTS (
--         SELECT 1 FROM public.admins 
--         WHERE email = (auth.jwt() ->> 'email') AND active = true
--     );
-- END;
-- $body$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==============================================================================

SELECT 'Phase 1 - Admin Identity Migration: HYBRID MODE ACTIVATED' as status;
