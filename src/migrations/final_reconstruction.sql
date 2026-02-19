-- SCRIPT DE RECONSTRUCCIÓN Y LIMPIEZA TOTAL (CHIRURGICAL FIX)
-- Este script limpia versiones viejas, asegura tipos y desactiva triggers problemáticos temporalmente

-- 1. Limpieza radical de funciones
DROP FUNCTION IF EXISTS public.create_order_secure(text, text, text, text, text, jsonb, text, text);
DROP FUNCTION IF EXISTS public.create_order_secure(text, text, text, text, text, jsonb, text);

-- 2. Asegurar tipos en las tablas (por si acaso hay restos)
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE BIGINT USING (CASE WHEN product_id::text ~ '^[0-9]+$' THEN product_id::text::bigint ELSE NULL END);

-- 3. Verificación de la función is_admin
-- Si existe una versión que use email, la estandarizamos
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid() 
          AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreación del RPC con trazabilidad extrema
CREATE OR REPLACE FUNCTION public.create_order_secure(
    p_customer_name text,
    p_customer_phone text,
    p_customer_email text,
    p_delivery_address text,
    p_delivery_notes text,
    p_items jsonb,
    p_coupon_code text DEFAULT NULL,
    p_idempotency_key text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_order_number text;
    v_subtotal numeric := 0;
    v_discount_amount numeric := 0;
    v_total numeric;
    v_item jsonb;
    v_product record;
    v_coupon_id uuid := NULL;
    v_coupon_val numeric := 0;
    v_coupon_type text;
    v_item_subtotal numeric;
    v_quantity int;
BEGIN
    -- [DEBUG] Inicio
    RAISE NOTICE 'RPC Iniciado - Cliente: %, Items count: %', p_customer_name, jsonb_array_length(p_items);

    -- 1. Idempotencia
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, order_number, total INTO v_order_id, v_order_number, v_total 
        FROM public.orders WHERE idempotency_key = p_idempotency_key;
        
        IF FOUND THEN
            RETURN json_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'total', v_total, 'cached', true);
        END IF;
    END IF;

    -- 2. Validar Cupón
    IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
        SELECT id, value, discount_type INTO v_coupon_id, v_coupon_val, v_coupon_type 
        FROM public.coupons
        WHERE code = p_coupon_code AND active = true
        AND (expires_at IS NULL OR expires_at > now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
    END IF;

    -- 3. Crear Orden Base
    v_order_number := generate_order_number();
    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, delivery_notes, subtotal, discount_amount, total,
        coupon_id, coupon_code, idempotency_key
    ) VALUES (
        v_order_number, p_customer_name, p_customer_phone, p_customer_email,
        p_delivery_address, p_delivery_notes, 0, 0, 0,
        v_coupon_id, p_coupon_code, p_idempotency_key
    ) RETURNING id INTO v_order_id;

    -- 4. Procesar Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        -- Obtener Datos del Producto
        SELECT id, name, price, image_url, category INTO v_product
        FROM public.products 
        WHERE id::text = (v_item->>'product_id')::text; -- Cast a texto y comparación segura
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Producto no encontrado: %', (v_item->>'product_id'); 
        END IF;

        v_quantity := (v_item->>'quantity')::int;
        v_item_subtotal := v_product.price * v_quantity;
        v_subtotal := v_subtotal + v_item_subtotal;

        -- Inserción explícita en order_items
        INSERT INTO public.order_items (
            order_id, product_id, product_name, product_image, product_category,
            price, quantity, subtotal
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_product.image_url, v_product.category,
            v_product.price, v_quantity, v_item_subtotal
        );
    END LOOP;

    -- 5. Finalizar Totales
    IF v_coupon_id IS NOT NULL THEN
        IF v_coupon_type = 'percentage' THEN
            v_discount_amount := v_subtotal * (v_coupon_val / 100);
        ELSE
            v_discount_amount := LEAST(v_coupon_val, v_subtotal);
        END IF;
        UPDATE public.coupons SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = v_coupon_id;
    END IF;

    v_total := v_subtotal - v_discount_amount;

    UPDATE public.orders 
    SET subtotal = v_subtotal, discount_amount = v_discount_amount, total = v_total
    WHERE id = v_order_id;

    RETURN json_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'total', v_total);
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error en create_order_secure: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RAISE EXCEPTION 'Error al crear pedido: %', SQLERRM;
END;
$$;
