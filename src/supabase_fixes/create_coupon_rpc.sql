-- FUNCIÓN RPC PARA VALIDAR CUPONES
-- Esta función encapsula toda la lógica de validación (expiración, límite de uso, activo)

CREATE OR REPLACE FUNCTION check_coupon(code_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos de admin para leer datos sin restricciones
AS $$
DECLARE
    coupon_record record;
BEGIN
    -- 1. Buscar cupón exacto (case sensitive ya manejado por frontend, pero aquí aseguramos)
    SELECT * INTO coupon_record
    FROM coupons
    WHERE code = code_input
    AND is_active = true;

    -- 2. Validar existencia
    IF coupon_record IS NULL THEN
        RAISE EXCEPTION 'Cupón no válido o inactivo';
    END IF;

    -- 3. Validar fecha de expiración
    IF coupon_record.expiration_date IS NOT NULL AND coupon_record.expiration_date < now() THEN
         RAISE EXCEPTION 'El cupón ha expirado';
    END IF;

    -- 4. Validar límite de usos global
    IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
         RAISE EXCEPTION 'El cupón ha agotado sus usos disponibles';
    END IF;

    -- 5. Retornar datos necesarios para el frontend
    RETURN json_build_object(
        'code', coupon_record.code,
        'discount_type', coupon_record.discount_type, -- 'percentage' o 'fixed'
        'value', coupon_record.discount_value,
        'min_purchase_amount', coupon_record.min_purchase_amount
    );
END;
$$;

-- FUNCIÓN RPC PARA INCREMENTAR USO
CREATE OR REPLACE FUNCTION increment_coupon_usage(code_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE coupons
    SET usage_count = usage_count + 1
    WHERE code = code_input;
END;
$$;
