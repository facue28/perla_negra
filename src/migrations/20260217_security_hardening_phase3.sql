-- ==============================================================================
-- 🔒 SECURITY HARDENING - PHASE 3: RPC Validation Hardening
-- ==============================================================================
-- Fecha: 2026-02-17
-- Objetivo: Añadir validaciones de integridad a create_order_secure
-- Protege contra: cantidades negativas, fraude de totales, límites abusivos
-- ==============================================================================

-- Versión mejorada de create_order_secure con validaciones de seguridad
CREATE OR REPLACE FUNCTION create_order_secure(
    p_customer_name text,
    p_customer_phone text,
    p_customer_email text,
    p_delivery_address text,
    p_delivery_notes text,
    p_items jsonb,
    p_coupon_code text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id uuid;
    v_order_number text;
    v_subtotal numeric := 0;
    v_discount_amount numeric := 0;
    v_total numeric;
    v_item jsonb;
    v_product record;
    v_coupon record;
    v_item_subtotal numeric;
    v_quantity int;
    -- Constantes de seguridad
    c_max_quantity_per_item constant int := 100;  -- Límite razonable por producto
    c_min_order_total constant numeric := 0.50;   -- Mínimo €0.50 (evita órdenes de prueba maliciosas)
BEGIN
    -- [VALIDACIÓN 1] Verificar que hay al menos un producto
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El pedido debe tener al menos un producto';
    END IF;
    
    -- [VALIDACIÓN 2] Verificar límite de productos en una orden
    IF jsonb_array_length(p_items) > 50 THEN
        RAISE EXCEPTION 'Máximo 50 productos diferentes por pedido';
    END IF;
    
    v_order_number := generate_order_number();
    
    -- Verificar cupón (sin cambios)
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon FROM public.coupons
        WHERE code = p_coupon_code AND active = true
        AND (expires_at IS NULL OR expires_at > now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
        
        IF NOT FOUND THEN RAISE EXCEPTION 'Cupón inválido o expirado'; END IF;
    END IF;
    
    -- Inserción inicial (sin cambios)
    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, delivery_notes, subtotal, discount_amount, total,
        coupon_code, coupon_id, whatsapp_sent_at
    ) VALUES (
        v_order_number, p_customer_name, p_customer_phone, p_customer_email,
        p_delivery_address, p_delivery_notes, 0, 0, 0,
        p_coupon_code, CASE WHEN p_coupon_code IS NOT NULL THEN v_coupon.id ELSE NULL END, now()
    ) RETURNING id INTO v_order_id;
    
    -- Procesar items con validaciones de seguridad
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        -- [VALIDACIÓN 3] Cantidad debe ser un entero positivo
        BEGIN
            v_quantity := (v_item->>'quantity')::integer;
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Cantidad inválida para producto';
        END;
        
        IF v_quantity IS NULL OR v_quantity <= 0 THEN
            RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
        END IF;
        
        -- [VALIDACIÓN 4] Límite por producto (anti-abuse)
        IF v_quantity > c_max_quantity_per_item THEN
            RAISE EXCEPTION 'Cantidad máxima por producto: %', c_max_quantity_per_item;
        END IF;
        
        -- [VALIDACIÓN 5] Producto debe existir en la base de datos
        SELECT id, name, price, image, category INTO v_product
        FROM public.products 
        WHERE id = (v_item->>'product_id')::bigint
          AND active = true;  -- Solo productos activos
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Producto no encontrado o inactivo: %', (v_item->>'product_id'); 
        END IF;
        
        -- [SEGURIDAD] Cálculo usando SOLO precios de la base de datos
        v_item_subtotal := v_product.price * v_quantity;
        v_subtotal := v_subtotal + v_item_subtotal;
        
        INSERT INTO public.order_items (
            order_id, product_id, product_name, product_image, product_category,
            price, quantity, subtotal
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_product.image, v_product.category,
            v_product.price, v_quantity, v_item_subtotal
        );
    END LOOP;
    
    -- Cálculo de descuentos (sin cambios en lógica)
    IF v_coupon.id IS NOT NULL THEN
        IF v_subtotal < COALESCE(v_coupon.min_purchase_amount, 0) THEN
            RAISE EXCEPTION 'Monto mínimo no alcanzado';
        END IF;
        
        IF v_coupon.discount_type = 'percent' THEN
            v_discount_amount := v_subtotal * (v_coupon.value / 100);
        ELSIF v_coupon.discount_type = 'fixed' THEN
            v_discount_amount := LEAST(v_coupon.value, v_subtotal);
        END IF;
        
        UPDATE public.coupons SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = v_coupon.id;
    END IF;
    
    v_total := v_subtotal - v_discount_amount;
    
    -- [VALIDACIÓN 6] Total mínimo de orden
    IF v_total < c_min_order_total THEN
        RAISE EXCEPTION 'Total mínimo de compra: €%.2f', c_min_order_total;
    END IF;
    
    -- [VALIDACIÓN 7] Verificar coherencia matemática
    IF v_total < 0 THEN
        RAISE EXCEPTION 'ERROR INTERNO: Total negativo detectado';
    END IF;
    
    -- Actualizar totales (dispara el trigger de email)
    UPDATE public.orders
    SET subtotal = v_subtotal, discount_amount = v_discount_amount, total = v_total
    WHERE id = v_order_id;
    
    RETURN json_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'total', v_total);
END;
$$;

-- ==============================================================================
-- NOTAS DE SEGURIDAD
-- ==============================================================================
-- 
-- VALIDACIONES AÑADIDAS:
-- 1. ✅ Array de productos no vacío
-- 2. ✅ Máximo 50 productos diferentes
-- 3. ✅ Quantity > 0 (bloquea negativos/cero)
-- 4. ✅ Máximo 100 unidades por producto
-- 5. ✅ Producto debe existir y estar activo
-- 6. ✅ Total mínimo €0.50
-- 7. ✅ Verificación de coherencia matemática
-- 
-- PRUEBAS RECOMENDADAS:
-- - Intentar quantity: -1 (debe fallar)
-- - Intentar quantity: 0 (debe fallar)
-- - Intentar quantity: 500 (debe fallar)
-- - Intentar producto inexistente (debe fallar)
-- - Orden válida de €10 (debe funcionar)
-- ==============================================================================

SELECT 'Phase 3 - RPC Validation Hardening: COMPLETE' as status;
