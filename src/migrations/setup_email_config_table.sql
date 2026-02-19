-- SCRIPT DE CONFIGURACIÓN SEGURA DE EMAIL
-- Como Supabase restringe el uso de "ALTER DATABASE SET", usamos una tabla de configuración.

-- 1. Crear tabla de configuración si no existe
CREATE TABLE IF NOT EXISTS public.site_config (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Insertar las credenciales (Vercel URL y Service Role Key)
-- [!] Usando la URL de Develop por defecto para pruebas
INSERT INTO public.site_config (key, value)
VALUES 
    ('email_function_url', 'https://perla-negra-git-develop-facue28s-projects.vercel.app/api/order-confirmation'),
    ('service_role_key', 'PONER_AQUI_TU_SERVICE_ROLE_KEY')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();


-- 3. Actualizar la función del Trigger para leer de esta tabla
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

        -- OBTENER CONFIGURACIÓN DESDE LA TABLA
        SELECT value INTO v_function_url FROM public.site_config WHERE key = 'email_function_url';
        SELECT value INTO v_service_key  FROM public.site_config WHERE key = 'service_role_key';

        -- INTENTO DE ENVÍO SEGURO
        BEGIN
            IF v_function_url IS NOT NULL AND v_service_key IS NOT NULL THEN
                PERFORM net.http_post(
                    url     := v_function_url,
                    headers := jsonb_build_object(
                        'Content-Type',  'application/json',
                        'Authorization', 'Bearer ' || v_service_key
                    ),
                    body    := v_payload
                );
            ELSE
                RAISE LOG 'Advertencia: No se pudo enviar email porque falta configuración en site_config';
                UPDATE public.order_email_attempts SET status = 'failed' WHERE id = v_attempt_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error al intentar enviar e-mail: %', SQLERRM;
            UPDATE public.order_email_attempts SET status = 'failed' WHERE id = v_attempt_id;
        END;
    END IF;

    RETURN NEW;
END;
$$;

SELECT 'Configuración de Email vía tabla: COMPLETADA' as status;
