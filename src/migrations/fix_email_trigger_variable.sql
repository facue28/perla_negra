-- SCRIPT DE REPARACIÓN DEFINITIVA: VARIABLE DE EMAIL ID
-- El problema era que v_attempt_id estaba declarada como UUID pero la tabla usa BIGINT.

CREATE OR REPLACE FUNCTION public.handle_new_order_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt_id bigint; -- CAMBIADO: De uuid a bigint para coincidir con la tabla
    v_payload jsonb;
    v_items_data jsonb;
    v_customer_email text;
    v_order_number text;
    v_total numeric;
    v_dedupe_key text;
BEGIN
    -- Solo procesar cuando el total se actualiza de 0 a algo positivo
    IF TG_OP = 'UPDATE' AND NEW.total > 0 AND (OLD.total IS NULL OR OLD.total = 0) THEN
        
        -- Clave para evitar envíos duplicados
        v_dedupe_key := 'confirm-order-' || NEW.id::text;

        -- Intentar registrar el intento de envío
        BEGIN
            INSERT INTO public.order_email_attempts (order_id, status, dedupe_key)
            VALUES (NEW.id, 'pending', v_dedupe_key)
            RETURNING id INTO v_attempt_id;
        EXCEPTION WHEN unique_violation THEN
            -- Ya se intentó enviar, no hacemos nada
            RETURN NEW;
        END;

        v_customer_email := NEW.customer_email;
        v_order_number   := NEW.order_number;
        v_total          := NEW.total;

        -- Obtener los productos del pedido para el email
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

        -- Construir los datos para la Edge Function
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

        -- Llamar a la función de envío de email
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
