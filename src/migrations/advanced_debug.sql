-- SCRIPT DE DEPURACIÓN AVANZADA
-- Este script intentará decirnos EXACTAMENTE qué línea falla

CREATE OR REPLACE FUNCTION public.create_order_secure_debug(
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
    v_item jsonb;
    v_product record;
    v_coupon_id uuid := NULL;
    v_item_subtotal numeric;
    v_quantity int;
    -- Variables para depuración
    v_error_msg text;
    v_error_detail text;
    v_error_hint text;
    v_error_context text;
BEGIN
    RAISE NOTICE 'DEBUG: Iniciando proceso...';

    -- 1. Crear Orden Base
    RAISE NOTICE 'DEBUG: Creando orden base...';
    v_order_number := 'DBG-' || floor(random() * 1000000)::text;
    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, delivery_notes, subtotal, discount_amount, total,
        idempotency_key
    ) VALUES (
        v_order_number, p_customer_name, p_customer_phone, p_customer_email,
        p_delivery_address, p_delivery_notes, 0, 0, 0,
        'DBG-' || gen_random_uuid()::text
    ) RETURNING id INTO v_order_id;
    
    RAISE NOTICE 'DEBUG: Orden creada con ID: %', v_order_id;

    -- 2. Procesar Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        RAISE NOTICE 'DEBUG: Procesando item: %', v_item;
        
        -- Obtener Datos del Producto
        SELECT id, name, price, image_url, category INTO v_product
        FROM public.products 
        WHERE id::text = (v_item->>'product_id')::text;
        
        IF NOT FOUND THEN 
            RAISE NOTICE 'DEBUG: Producto no encontrado: %', (v_item->>'product_id');
            CONTINUE;
        END IF;

        v_quantity := (v_item->>'quantity')::int;
        
        RAISE NOTICE 'DEBUG: Intentando insertar item: Producto %, Cantidad %', v_product.id, v_quantity;
        
        INSERT INTO public.order_items (
            order_id, product_id, product_name, product_image, product_category,
            price, quantity, subtotal
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_product.image_url, v_product.category,
            v_product.price, v_quantity, v_product.price * v_quantity
        );
        
        RAISE NOTICE 'DEBUG: Item insertado con éxito.';
    END LOOP;

    RETURN json_build_object('success', true, 'order_id', v_order_id);

EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS 
        v_error_msg = MESSAGE_TEXT,
        v_error_detail = PG_EXCEPTION_DETAIL,
        v_error_hint = PG_EXCEPTION_HINT,
        v_error_context = PG_EXCEPTION_CONTEXT;
        
    RAISE NOTICE '--- ERROR DETECTADO ---';
    RAISE NOTICE 'Mensaje: %', v_error_msg;
    RAISE NOTICE 'Detalle: %', v_error_detail;
    RAISE NOTICE 'Pista: %', v_error_hint;
    RAISE NOTICE 'Contexto: %', v_error_context;
    
    RETURN json_build_object(
        'error', v_error_msg,
        'detail', v_error_detail,
        'context', v_error_context
    );
END;
$$;
