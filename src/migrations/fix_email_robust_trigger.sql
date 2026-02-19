-- SCRIPT DE REPARACIÓN: EMAIL ROBUSTO (NO BLOQUEANTE)
-- Este script hace que si falla el e-mail, el pedido se guarde igualmente.
-- El error de "null value in column url" ocurre porque faltan variables de entorno en Supabase.

CREATE OR REPLACE FUNCTION public.handle_new_order_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt_id bigint;
    v_payload jsonb;
    v_items_data jsonb;
    v_customer_email text;
    v_order_number text;
    v_total numeric;
    v_dedupe_key text;
    v_function_url text;
    v_service_key text;
BEGIN
    -- Solo procesar cuando el total se actualiza a algo positivo
    IF TG_OP = 'UPDATE' AND NEW.total > 0 AND (OLD.total IS NULL OR OLD.total = 0) THEN
        
        v_dedupe_key := 'confirm-order-' || NEW.id::text;

        -- Registrar intento
        BEGIN
            INSERT INTO public.order_email_attempts (order_id, status, dedupe_key)
            VALUES (NEW.id, 'pending', v_dedupe_key)
            RETURNING id INTO v_attempt_id;
        EXCEPTION WHEN unique_violation THEN
            RETURN NEW;
        END;

        -- Capturamos datos para el email
        v_customer_email := NEW.customer_email;
        v_order_number   := NEW.order_number;
        v_total          := NEW.total;

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

        -- INTENTO DE ENVÍO SEGURO (CON EXCEPTION PARA NO BLOQUEAR EL PEDIDO)
        BEGIN
            v_function_url := current_setting('app.edge_function_url', true);
            v_service_key  := current_setting('app.service_role_key', true);

            IF v_function_url IS NOT NULL AND v_service_key IS NOT NULL THEN
                PERFORM net.http_post(
                    url     := v_function_url || '/send-order-email',
                    headers := jsonb_build_object(
                        'Content-Type',  'application/json',
                        'Authorization', 'Bearer ' || v_service_key
                    ),
                    body    := v_payload
                );
            ELSE
                -- Si no hay config, logueamos el error pero NO cortamos la transacción
                RAISE LOG 'Advertencia: No se pudo enviar email porque faltan variables de configuración (URL o Key)';
                UPDATE public.order_email_attempts SET status = 'failed' WHERE id = v_attempt_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Si cualquier otra cosa falla (red, etc), el pedido sigue adelante
            RAISE LOG 'Error no crítico al intentar enviar e-mail: %', SQLERRM;
            UPDATE public.order_email_attempts SET status = 'failed' WHERE id = v_attempt_id;
        END;
    END IF;

    RETURN NEW;
END;
$$;
