-- ==============================================================================
-- 🔒 SECURITY WARNINGS FIX
-- ==============================================================================
-- Fecha: 2026-02-18
-- Objetivo: Corregir advertencias de seguridad de Supabase (WARN level)
-- Advertencias corregidas:
--   1. function_search_path_mutable en: is_admin, is_admin_v1_email,
--      create_order_secure, handle_new_order_email
-- Advertencias NO corregidas aquí (requieren acción manual):
--   2. extension_in_public (pg_net) → Ver nota al final
--   3. auth_leaked_password_protection → Ver nota al final
-- ==============================================================================


-- ==============================================================================
-- FIX 1: is_admin_v1_email — Agregar SET search_path = public
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin_v1_email()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (auth.jwt() ->> 'email') 
          AND active = true
    );
END;
$$;


-- ==============================================================================
-- FIX 2: is_admin — Agregar SET search_path = public
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Solo buscar por UUID (método seguro, post Phase 2)
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid() 
          AND active = true
    );
END;
$$;


-- ==============================================================================
-- FIX 3: create_order_secure — Agregar SET search_path = public
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_order_secure(
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
    -- Constantes de seguridad
    c_max_quantity_per_item constant int := 100;
    c_min_order_total constant numeric := 0.50;
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
    
    -- Verificar cupón
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon FROM public.coupons
        WHERE code = p_coupon_code AND active = true
        AND (expires_at IS NULL OR expires_at > now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
        
        IF NOT FOUND THEN RAISE EXCEPTION 'Cupón inválido o expirado'; END IF;
    END IF;
    
    -- Inserción inicial
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
          AND active = true;
        
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
    
    -- Cálculo de descuentos
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
-- FIX 4: handle_new_order_email — Agregar SET search_path = public
-- NOTA: Esta función es un trigger, se recrea con la misma lógica + search_path
-- ==============================================================================
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
BEGIN
    -- Solo procesar cuando el total se actualiza (trigger de UPDATE)
    IF TG_OP = 'UPDATE' AND NEW.total > 0 AND OLD.total = 0 THEN
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

        -- Registrar intento de envío
        INSERT INTO public.order_email_attempts (order_id, status)
        VALUES (NEW.id, 'pending')
        RETURNING id INTO v_attempt_id;

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


-- ==============================================================================
-- NOTAS SOBRE LAS ADVERTENCIAS RESTANTES
-- ==============================================================================
--
-- ⚠️  extension_in_public (pg_net):
--     pg_net fue instalado en el schema 'public' por Supabase automáticamente.
--     Moverlo a otro schema requiere desinstalarlo y reinstalarlo, lo que puede
--     romper el trigger handle_new_order_email que usa net.http_post().
--     EN EL PLAN FREE: No es posible mover extensiones de schema desde el dashboard.
--     RECOMENDACIÓN: Ignorar esta advertencia por ahora. Es de bajo riesgo real
--     ya que pg_net solo expone funciones HTTP internas, no datos de usuario.
--
-- ⚠️  auth_leaked_password_protection:
--     Habilitar desde: Dashboard → Authentication → Providers → Email
--     → "Enable Leaked Password Protection" (toggle ON)
--     Es GRATUITO y tarda 10 segundos. Solo requiere acceso al dashboard.
--     Verifica contraseñas contra HaveIBeenPwned.org al registrarse/cambiar pwd.
--
-- ==============================================================================

SELECT 'Security Warnings Fix: COMPLETE (4 funciones corregidas)' as status;
