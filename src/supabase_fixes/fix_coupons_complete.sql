-- SCRIPT DE REPARACIÓN Y UNIFICACIÓN DE CUPONES
-- Este script:
-- 1. Asegura que existan las columnas faltantes (min_purchase_amount, usage_limit, usage_count).
-- 2. Asegura que la tabla soporte los nombres de columnas 'value', 'active', 'expires_at' (que ya tienes).
-- 3. Recrea las funciones de seguridad (RPC) para que coincidan con ESTOS nombres.

-- 1. AÑADIR COLUMNAS FALTANTES (Si no existen)
DO $$
BEGIN
    -- Añadir min_purchase_amount si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='min_purchase_amount') THEN
        ALTER TABLE public.coupons ADD COLUMN min_purchase_amount numeric DEFAULT 0;
    END IF;

    -- Añadir usage_limit si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='usage_limit') THEN
        ALTER TABLE public.coupons ADD COLUMN usage_limit integer;
    END IF;

    -- Añadir usage_count si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='usage_count') THEN
        ALTER TABLE public.coupons ADD COLUMN usage_count integer DEFAULT 0;
    END IF;
END $$;

-- 2. RECREAR FUNCIÓN CHECK_COUPON (Adaptada a tus nombres de columna reales: value, active, expires_at)
CREATE OR REPLACE FUNCTION check_coupon(code_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    coupon_record record;
BEGIN
    -- Buscar cupón activo
    -- NOTA: Usamos 'active' en lugar de 'is_active' y 'value' en lugar de 'discount_value'
    SELECT * INTO coupon_record
    FROM coupons
    WHERE code = code_input
    AND active = true; 

    -- Validar existencia
    IF coupon_record IS NULL THEN
        RAISE EXCEPTION 'Cupón no válido o inactivo';
    END IF;

    -- Validar fecha de expiración (campo 'expires_at')
    IF coupon_record.expires_at IS NOT NULL AND coupon_record.expires_at < now() THEN
         RAISE EXCEPTION 'El cupón ha expirado';
    END IF;

    -- Validar límite de usos
    IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
         RAISE EXCEPTION 'El cupón ha agotado sus usos disponibles';
    END IF;

    -- Retornar datos normalizados
    RETURN json_build_object(
        'code', coupon_record.code,
        'discount_type', coupon_record.discount_type,
        'value', coupon_record.value, -- Usamos la columna real 'value'
        'min_purchase_amount', COALESCE(coupon_record.min_purchase_amount, 0)
    );
END;
$$;

-- 3. RECREAR FUNCIÓN INCREMENT_USAGE
CREATE OR REPLACE FUNCTION increment_coupon_usage(code_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE coupons
    SET usage_count = COALESCE(usage_count, 0) + 1
    WHERE code = code_input;
END;
$$;

SELECT 'Esquema de cupones reparado y funciones actualizadas' as status;
