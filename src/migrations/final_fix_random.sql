-- SCRIPT DE AJUSTE FINAL (FIX RANDOM BYTES)
-- El error anterior confirma que ya pasamos el problema del UUID. 
-- Ahora solo arreglamos el generador de claves aleatorias.

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
    v_item jsonb;
    v_product record;
    v_coupon_id uuid := NULL;
    v_total numeric;
    v_quantity int;
BEGIN
    -- [INFO] Versión corregida (v4 - Random Fix)
    
    -- 1. Crear la Orden (Base)
    v_order_number := generate_order_number();
    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, delivery_notes, subtotal, discount_amount, total,
        idempotency_key
    ) VALUES (
        v_order_number, p_customer_name, p_customer_phone, p_customer_email,
        p_delivery_address, p_delivery_notes, 0, 0, 0,
        -- Usamos un fallback más simple si no hay idempotency_key
        COALESCE(p_idempotency_key, 'order-' || v_order_number || '-' || floor(random()*1000000)::text)
    ) RETURNING id INTO v_order_id;

    -- 2. Procesar los Productos
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        -- Buscamos el producto TRATANDO EL ID COMO TEXTO
        SELECT id, name, price, image_url, category INTO v_product
        FROM public.products 
        WHERE id::text = (v_item->>'product_id')::text; 
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Producto no encontrado: %', (v_item->>'product_id'); 
        END IF;

        v_quantity := (v_item->>'quantity')::int;
        v_subtotal := v_subtotal + (v_product.price * v_quantity);

        INSERT INTO public.order_items (
            order_id, product_id, product_name, product_image, product_category,
            price, quantity, subtotal
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_product.image_url, v_product.category,
            v_product.price, v_quantity, (v_product.price * v_quantity)
        );
    END LOOP;

    -- 3. Actualizamos el total al final
    UPDATE public.orders SET subtotal = v_subtotal, total = v_subtotal WHERE id = v_order_id;

    RETURN json_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number);
END;
$$;
