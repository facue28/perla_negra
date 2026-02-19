-- ==============================================================================
-- 🔒 FORM SECURITY & IDEMPOTENCY HARDENING
-- ==============================================================================
-- Fecha: 2026-02-19
-- Objetivo: Prevenir duplicados en órdenes y envíos de e-mail
-- ==============================================================================

-- 1. Hardening de las tablas (Idempotencia y Tipos)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Asegurar tipo correcto para product_id en order_items (evitar error UUID)
ALTER TABLE public.order_items 
ALTER COLUMN product_id TYPE BIGINT USING product_id::text::bigint;

COMMENT ON COLUMN public.orders.idempotency_key IS 'Token único generado por el cliente para evitar duplicados en el proceso de checkout.';

-- 2. Hardening de la tabla order_email_attempts (Deduplicación)
ALTER TABLE public.order_email_attempts
ADD COLUMN IF NOT EXISTS dedupe_key TEXT UNIQUE;

COMMENT ON COLUMN public.order_email_attempts.dedupe_key IS 'Identificador único del intento de envío (ej: order-confirmation:UUID) para prevenir re-envíos.';

-- 3. Actualización de RPC create_order_secure
-- ELIMINAMOS VERSIONES PREVIAS PARA EVITAR CONFLICTOS DE NOMBRES/TIPOS
DROP FUNCTION IF EXISTS public.create_order_secure(text, text, text, text, text, jsonb, text, text);
DROP FUNCTION IF EXISTS public.create_order_secure(text, text, text, text, text, jsonb, text);

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
    v_coupon record;
    v_item_subtotal numeric;
    v_quantity int;
    v_coupon_id uuid := NULL;
    -- Constantes de seguridad
    c_max_quantity_per_item constant int := 100;
    c_min_order_total constant numeric := 0.50;
BEGIN
    -- [VALIDACIÓN IDEMPOTENCIA] Verificar si el token ya existe
    SELECT id INTO v_order_id FROM public.orders WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
        -- Si ya existe, devolvemos éxito con el ID existente (idempotencia real)
        SELECT order_number, total INTO v_order_number, v_total FROM public.orders WHERE id = v_order_id;
        RETURN json_build_object(
            'success', true, 
            'order_id', v_order_id, 
            'order_number', v_order_number, 
            'total', v_total,
            'cached', true
        );
    END IF;

    -- [VALIDACIÓN 1] Verificar que hay al menos un producto
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El pedido debe tener al menos un producto';
    END IF;
    
    -- [VALIDACIÓN 2] Verificar límite de productos en una orden
    IF jsonb_array_length(p_items) > 50 THEN
        RAISE EXCEPTION 'Máximo 50 productos diferentes por pedido';
    END IF;
    
    v_order_number := generate_order_number();
    
    -- Verificar cupón
    IF p_coupon_code IS NOT NULL THEN
        SELECT id INTO v_coupon_id FROM public.coupons
        WHERE code = p_coupon_code AND active = true
        AND (expires_at IS NULL OR expires_at > now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
        
        IF v_coupon_id IS NULL THEN 
            RAISE EXCEPTION 'Cupón inválido o expirado'; 
        END IF;
        
        -- Cargar datos completos del cupón
        SELECT * INTO v_coupon FROM public.coupons WHERE id = v_coupon_id;
    END IF;
    
    -- Inserción inicial con idempotency_key
    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, delivery_notes, subtotal, discount_amount, total,
        coupon_code, coupon_id, whatsapp_sent_at, idempotency_key
    ) VALUES (
        v_order_number, p_customer_name, p_customer_phone, p_customer_email,
        p_delivery_address, p_delivery_notes, 0, 0, 0,
        p_coupon_code, v_coupon_id, now(), p_idempotency_key
    ) RETURNING id INTO v_order_id;
    
    -- Procesar items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        BEGIN
            v_quantity := (v_item->>'quantity')::integer;
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Cantidad inválida para producto';
        END;
        
        IF v_quantity IS NULL OR v_quantity <= 0 THEN
            RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
        END IF;
        
        IF v_quantity > c_max_quantity_per_item THEN
            RAISE EXCEPTION 'Cantidad máxima por producto: %', c_max_quantity_per_item;
        END IF;
        
        -- [DEBUG] Consultar producto - Usando image_url y CAST explícito
        SELECT id, name, price, image_url, category INTO v_product
        FROM public.products 
        WHERE id = (v_item->>'product_id')::bigint
          AND active = true;
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Producto no encontrado o inactivo: %', (v_item->>'product_id'); 
        END IF;
        
        v_item_subtotal := v_product.price * v_quantity;
        v_subtotal := v_subtotal + v_item_subtotal;
        
        -- Insertar en order_items asegurando cast explícito a BIGINT para product_id
        INSERT INTO public.order_items (
            order_id, product_id, product_name, product_image, product_category,
            price, quantity, subtotal
        ) VALUES (
            v_order_id::uuid, v_product.id::bigint, v_product.name, v_product.image_url, v_product.category,
            v_product.price::numeric, v_quantity::integer, v_item_subtotal::numeric
        );
    END LOOP;
    
    -- Cálculo de descuentos
    IF v_coupon_id IS NOT NULL THEN
        IF v_subtotal < COALESCE(v_coupon.min_purchase_amount, 0) THEN
            RAISE EXCEPTION 'Monto mínimo no alcanzado';
        END IF;
        
        IF v_coupon.discount_type = 'percentage' THEN
            v_discount_amount := v_subtotal * (v_coupon.value / 100);
        ELSIF v_coupon.discount_type = 'fixed' THEN
            v_discount_amount := LEAST(v_coupon.value, v_subtotal);
        END IF;
        
        UPDATE public.coupons SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = v_coupon_id;
    END IF;
    
    v_total := v_subtotal - v_discount_amount;
    
    -- Validaciones de total
    IF v_total < c_min_order_total THEN
        RAISE EXCEPTION 'Total mínimo de compra: €%.2f', c_min_order_total;
    END IF;
    
    IF v_total < 0 THEN
        RAISE EXCEPTION 'ERROR INTERNO: Total negativo detectado';
    END IF;
    
    -- Actualizar totales (dispara el trigger de email)
    UPDATE public.orders
    SET subtotal = v_subtotal, discount_amount = v_discount_amount, total = v_total
    WHERE id = v_order_id;
    
    RETURN json_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'total', v_total, 'cached', false);
END;
$$;

-- 4. Actualización de trigger handle_new_order_email con deduplicación
CREATE OR REPLACE FUNCTION public.handle_new_order_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt_id uuid;
    v_payload jsonb;
    v_items_data jsonb;
    v_customer_email text;
    v_order_number text;
    v_total numeric;
    v_dedupe_key text;
BEGIN
    -- Solo procesar cuando el total se actualiza (trigger de UPDATE) de 0 a algo positivo
    IF TG_OP = 'UPDATE' AND NEW.total > 0 AND OLD.total = 0 THEN
        
        -- Definir clave de deduplicación
        v_dedupe_key := 'order-confirmation:' || NEW.id;

        -- Intentar registrar el envío. Si ya existe la dedupe_key, abortar silenciosamente.
        BEGIN
            INSERT INTO public.order_email_attempts (order_id, status, dedupe_key)
            VALUES (NEW.id, 'pending', v_dedupe_key)
            RETURNING id INTO v_attempt_id;
        EXCEPTION WHEN unique_violation THEN
            -- Ya se intentó enviar este email para esta orden, ignoramos
            RETURN NEW;
        END;

        v_customer_email := NEW.customer_email;
        v_order_number   := NEW.order_number;
        v_total          := NEW.total;

        -- Obtener items del pedido
        SELECT jsonb_agg(jsonb_build_object(
            'name',     oi.product_name,
            'quantity', oi.quantity,
            'price',    oi.price,
            'subtotal', oi.subtotal,
            'image',    oi.product_image
        ))
        INTO v_items_data
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id;

        -- Construir payload para Edge Function
        v_payload := jsonb_build_object(
            'attempt_id',    v_attempt_id,
            'order_id',      NEW.id,
            'order_number',  v_order_number,
            'customer_name', NEW.customer_name,
            'customer_email',v_customer_email,
            'total',         v_total,
            'items',         COALESCE(v_items_data, '[]'::jsonb),
            'delivery_address', NEW.delivery_address,
            'delivery_notes',   NEW.delivery_notes
        );

        -- Llamar a la Edge Function via pg_net
        PERFORM net.http_post(
            url     := current_setting('app.edge_function_url', true) || '/send-order-email',
            headers := jsonb_build_object(
                'Content-Type',  'application/json',
                'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
            ),
            body    := v_payload
        );
    END IF;

    RETURN NEW;
END;
$$;

SELECT 'DB Hardening: COMPLETE - Idempotency and Email Deduplication addedv1' as status;
