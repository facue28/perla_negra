-- =======================================================
-- FIX COUPON LOGIC & USAGE LIMITS (VERSION 3 - SOFT FAIL)
-- =======================================================
-- 1. Corregir datos existentes
-- 2. "Soft Fail": Si el cupón es inválido, NO falla la orden. 
--    Simplemente se ignora el descuento y se devuelve advertencia.

BEGIN;

-- 1. DATA CLEANUP
UPDATE coupons SET usage_count = 0 WHERE usage_count IS NULL;

-- 2. UPDATE FUNCTION create_order
CREATE OR REPLACE FUNCTION create_order(
    customer_info JSONB,
    items JSONB,
    coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_customer_phone TEXT;
    v_recent_orders INTEGER;
    v_total_amount NUMERIC := 0;
    v_discount_value NUMERIC := 0;
    v_final_total NUMERIC;
    v_warning_msg TEXT := NULL; -- Variable para mensaje de advertencia
BEGIN
    -- Extraer teléfono para validación
    v_customer_phone := customer_info->>'phone';

    -- VALIDACIONES CRÍTICAS
    IF v_customer_phone IS NULL OR TRIM(v_customer_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;
    
    IF customer_info->>'fullName' IS NULL OR TRIM(customer_info->>'fullName') = '' THEN
        RAISE EXCEPTION 'Name is required';
    END IF;

    IF items IS NULL OR jsonb_array_length(items) = 0 THEN
        RAISE EXCEPTION 'Order must have at least one item';
    END IF;

    -- RATE LIMITING
    SELECT COUNT(*) INTO v_recent_orders
    FROM orders
    WHERE customer_phone = v_customer_phone
      AND created_at > NOW() - INTERVAL '1 minute';
    
    IF v_recent_orders >= 3 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait before creating another order.';
    END IF;

    -- CÁLCULO DE TOALES
    SELECT SUM((item->>'price')::NUMERIC * (item->>'quantity')::INTEGER)
    INTO v_total_amount
    FROM jsonb_array_elements(items) AS item;

    -- VALIDAR Y APLICAR CUPÓN (SOFT FAIL LOGIC)
    IF coupon_code IS NOT NULL AND TRIM(coupon_code) <> '' THEN
        SELECT value INTO v_discount_value
        FROM coupons
        WHERE code = UPPER(TRIM(coupon_code))
          AND active = true
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (usage_limit IS NULL OR COALESCE(usage_count, 0) < usage_limit);
        
        -- Si no se encontró cupón válido (v_discount_value es NULL)
        IF v_discount_value IS NULL THEN
            -- SOFT FAIL: Ignorar cupón, establecer descuento en 0 y agregar advertencia
            v_discount_value := 0;
            v_warning_msg := 'Codice promozionale non valido o scaduto';
            coupon_code := NULL; -- No guardar código inválido en la orden
        END IF;
    END IF;

    -- Calcular Totales Finales
    IF v_discount_value > 0 THEN
         v_final_total := v_total_amount * (1 - v_discount_value / 100);
    ELSE
         v_final_total := v_total_amount;
    END IF;

    -- Generar Número de Orden
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4);

    -- CREAR ORDEN
    INSERT INTO orders (
        order_number,
        customer_name, 
        customer_phone, 
        customer_email,
        delivery_address, 
        delivery_notes,
        subtotal,
        discount_amount,
        total, 
        coupon_code,
        status
    )
    VALUES (
        v_order_number,
        customer_info->>'fullName', 
        v_customer_phone, 
        customer_info->>'email',
        (customer_info->>'address') || ', ' || (customer_info->>'city'), 
        customer_info->>'notes',
        v_total_amount,
        (v_total_amount - v_final_total), 
        v_final_total, 
        coupon_code,
        'nueva' 
    )
    RETURNING id INTO v_order_id;

    -- INSERTAR ITEMS
    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_image,
        product_category,
        price,
        quantity,
        subtotal
    )
    SELECT 
        v_order_id,
        (item->>'id')::BIGINT,
        item->>'name',
        item->>'image',
        item->>'category',
        (item->>'price')::NUMERIC,
        (item->>'quantity')::INTEGER,
        ((item->>'price')::NUMERIC * (item->>'quantity')::INTEGER)
    FROM jsonb_array_elements(items) AS item;

    -- Actualizar uso de cupón (Solo si fue válido)
    IF v_discount_value > 0 AND coupon_code IS NOT NULL THEN
        UPDATE coupons 
        SET usage_count = COALESCE(usage_count, 0) + 1 
        WHERE code = UPPER(TRIM(coupon_code));
    END IF;

    RETURN jsonb_build_object(
        'orderId', v_order_id, 
        'orderNumber', v_order_number,
        'total', v_final_total,
        'warning', v_warning_msg -- Nuevo campo de advertencia
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply security
ALTER FUNCTION public.create_order(jsonb, jsonb, text) SET search_path = public;

COMMIT;
