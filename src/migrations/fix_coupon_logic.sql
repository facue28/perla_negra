-- =======================================================
-- FIX COUPON LOGIC & USAGE LIMITS
-- =======================================================
-- 1. Corregir datos existentes (NULL -> 0)
-- 2. Actualizar create_order para fallar si el cupón es inválido
-- 3. Asegurar incremento correcto de usage_count

BEGIN;

-- 1. DATA CLEANUP
-- =================
UPDATE coupons SET usage_count = 0 WHERE usage_count IS NULL;

-- 2. UPDATE FUNCTION create_order
-- ===============================
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
BEGIN
    -- Extraer teléfono para validación
    v_customer_phone := customer_info->>'phone';

    -- 1. VALIDACIONES CRÍTICAS
    IF v_customer_phone IS NULL OR TRIM(v_customer_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;
    
    IF customer_info->>'fullName' IS NULL OR TRIM(customer_info->>'fullName') = '' THEN
        RAISE EXCEPTION 'Name is required';
    END IF;

    IF items IS NULL OR jsonb_array_length(items) = 0 THEN
        RAISE EXCEPTION 'Order must have at least one item';
    END IF;

    -- 2. RATE LIMITING (Server-side)
    SELECT COUNT(*) INTO v_recent_orders
    FROM orders
    WHERE customer_phone = v_customer_phone
      AND created_at > NOW() - INTERVAL '1 minute';
    
    IF v_recent_orders >= 3 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait before creating another order.';
    END IF;

    -- 3. CÁLCULO DE TOTALES
    SELECT SUM((item->>'price')::NUMERIC * (item->>'quantity')::INTEGER)
    INTO v_total_amount
    FROM jsonb_array_elements(items) AS item;

    -- 4. VALIDAR Y APLICAR CUPÓN (CORREGIDO)
    IF coupon_code IS NOT NULL AND TRIM(coupon_code) <> '' THEN
        SELECT value INTO v_discount_value
        FROM coupons
        WHERE code = UPPER(TRIM(coupon_code))
          AND active = true
          AND (expires_at IS NULL OR expires_at > NOW())
          -- Fix: Usar COALESCE para evitar problemas con NULL
          AND (usage_limit IS NULL OR COALESCE(usage_count, 0) < usage_limit);
        
        -- Fix: Fallar si el cupón no es válido en lugar de ignorarlo
        IF v_discount_value IS NULL THEN
            RAISE EXCEPTION 'El cupón ingresado no es válido, ha expirado o se han agotado sus usos.';
        END IF;
    END IF;

    -- Calcular Totales Finales
    IF v_discount_value > 0 THEN
         v_final_total := v_total_amount * (1 - v_discount_value / 100);
    ELSE
         v_final_total := v_total_amount;
    END IF;

    -- Generar Número de Orden Único
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4);

    -- 5. CREAR ORDEN
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

    -- 6. INSERTAR ITEMS
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

    -- Actualizar uso de cupón (CORREGIDO)
    IF v_discount_value > 0 AND coupon_code IS NOT NULL THEN
        UPDATE coupons 
        -- Fix: Asegurar incremento incluso si era NULL
        SET usage_count = COALESCE(usage_count, 0) + 1 
        WHERE code = UPPER(TRIM(coupon_code));
    END IF;

    RETURN jsonb_build_object(
        'orderId', v_order_id, 
        'orderNumber', v_order_number,
        'total', v_final_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply search_path fix for security
ALTER FUNCTION public.create_order(jsonb, jsonb, text) SET search_path = public;

COMMIT;
