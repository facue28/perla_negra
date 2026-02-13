-- ============================================================
-- FIX COMPLETO: RPC SEGURO + TRIGGER DE EMAIL
-- ============================================================

-- 1. Asegurar que existe la función RPC segura (que actualiza el total AL FINAL)
-- Esto garantiza que el trigger dispare correctamente 'AFTER UPDATE' y encuentre los items.
CREATE OR REPLACE FUNCTION create_order_secure(
    p_customer_name text,
    p_customer_phone text,
    p_customer_email text,
    p_delivery_address text,
    p_delivery_notes text,
    p_items jsonb, -- Array de {product_id, quantity}
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
    v_coupon_id uuid DEFAULT NULL; -- Variable segura para el ID
    v_item_subtotal numeric;
BEGIN
    -- Validar items
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El pedido debe tener al menos un producto';
    END IF;
    
    -- Generar número de orden (función existente o fallback)
    BEGIN
        v_order_number := public.generate_order_number();
    EXCEPTION WHEN OTHERS THEN
        v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD-HHMISS');
    END;
    
    -- Verificar cupón (simplificado y SEGURO)
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon FROM public.coupons 
        WHERE code = p_coupon_code AND active = true;
        
        IF FOUND THEN
            v_coupon_id := v_coupon.id;
        END IF;
    END IF;
    
    -- 1. INSERTAR ORDEN (Total 0 temporalmente)
    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email, 
        delivery_address, delivery_notes, subtotal, discount_amount, total, 
        coupon_code, coupon_id, whatsapp_sent_at
    ) VALUES (
        v_order_number, p_customer_name, p_customer_phone, p_customer_email,
        p_delivery_address, p_delivery_notes, 0, 0, 0,
        p_coupon_code, v_coupon_id, now()
    ) RETURNING id INTO v_order_id;
    
    -- 2. INSERTAR ITEMS (Calculando subtotales reales)
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- VALIDACIÓN 4: Verificar que el producto existe y obtener precio REAL de la DB
        -- CORRECCIÓN: Usar image_url explicitamente
        SELECT id, name, price, image_url, category
        INTO v_product
        FROM public.products
        WHERE id = (v_item->>'product_id')::bigint;
        
        IF FOUND THEN
            v_item_subtotal := v_product.price * (v_item->>'quantity')::integer;
            v_subtotal := v_subtotal + v_item_subtotal;
            
            INSERT INTO public.order_items (
                order_id, product_id, product_name, product_image, product_category,
                price, quantity, subtotal
            ) VALUES (
                v_order_id, v_product.id, v_product.name, v_product.image_url, v_product.category,
                v_product.price, (v_item->>'quantity')::integer, v_item_subtotal
            );
        END IF;
    END LOOP;
    
    -- Calcular descuentos
    IF v_coupon_id IS NOT NULL THEN
        IF v_coupon.discount_type = 'percent' THEN
            v_discount_amount := v_subtotal * (v_coupon.value / 100);
        ELSE
            v_discount_amount := LEAST(v_coupon.value, v_subtotal);
        END IF;
    END IF;
    
    v_total := v_subtotal - v_discount_amount;
    
    -- 3. ACTUALIZAR ORDEN (Esto dispara el trigger de email con DATA COMPLETA)
    UPDATE public.orders
    SET subtotal = v_subtotal,
        discount_amount = v_discount_amount,
        total = v_total
    WHERE id = v_order_id;
    
    RETURN json_build_object(
        'success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'total', v_total
    );
END;
$$;

-- 2. Restaurar el Trigger de Email (Sin Debug)
CREATE OR REPLACE FUNCTION public.handle_new_order_email()
RETURNS TRIGGER AS $$
DECLARE
  resend_api_key text := 'YOUR_RESEND_KEY_HERE';
  email_from text := 'Perla Negra <onboarding@resend.dev>';
  email_to text;
  email_subject text;
  email_html text;
  products_html text := '';
  customer_name text;
BEGIN
  -- Construir tabla de productos
  SELECT string_agg(
    E'<tr>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #BBB;">' ||
    -- IMAGEN PRINCIPAL (Solo la primera, si existe)
    CASE WHEN product_image IS NOT NULL AND product_image != '' THEN
      E'<img src="' || 
      CASE WHEN product_image LIKE 'http%' THEN product_image 
           ELSE 'https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/' || product_image 
      END || 
      E'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; vertical-align: middle; margin-right: 12px;">'
    ELSE '' END ||
    product_name || E'</td>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #BBB; text-align: center;">' || quantity || E'</td>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #3FFFC1; text-align: right; font-weight: bold;">€' || TO_CHAR(price, 'FM999,990.00') || E'</td>' ||
    E'</tr>', ''
  ) INTO products_html
  FROM public.order_items WHERE order_id = new.id;

  customer_name := COALESCE(new.customer_name, 'Cliente');
  email_to := COALESCE(new.customer_email, 'facundo.elias10@gmail.com');
  email_subject := 'Conferma Ordine #' || new.order_number || ' - Perla Negra';

  -- Template HTML Final (Con Logo Gatto)
  email_html := E'<!DOCTYPE html><html><body style="background-color: #0A0A0A; font-family: \'serif\', Georgia, serif; color: #FFFFFF; margin: 0; padding: 40px 0;">' ||
                E'<div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #222; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">' ||
                E'<div style="padding: 40px; text-align: center; border-bottom: 1px solid #222;">' ||
                E'<img src="https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/logo-gatto.webp" alt="Perla Negra" style="width: 80px; margin-bottom: 10px;">' ||
                E'<h1 style="color: #3FFFC1; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Perla Negra</h1>' ||
                E'<p style="color: #888; margin: 10px 0 0; font-style: italic; font-size: 14px;">Eccellenza e Seduzione</p></div>' ||
                E'<div style="padding: 40px;">' ||
                E'<h2 style="font-size: 24px; margin-bottom: 20px; font-weight: normal;">Grazie, ' || customer_name || E'.</h2>' ||
                E'<p style="color: #BBB; line-height: 1.6; font-size: 16px;">Il tuo ordine è stato ricevuto. Ecco il riepilogo:</p>' ||
                E'<div style="background-color: #1A1A1A; border: 1px solid #333; padding: 25px; border-radius: 16px; margin: 20px 0;">' ||
                E'<p style="color: #BBB; font-size: 14px; margin: 5px 0;"><strong>Indirizzo:</strong> ' || COALESCE(new.delivery_address, 'Da concordare') || E'</p>' ||
                E'<p style="color: #BBB; font-size: 14px; margin: 5px 0;"><strong>Telefono:</strong> ' || COALESCE(new.customer_phone, '-') || E'</p>' ||
                E'</div>' ||
                E'<h3 style="color: #3FFFC1; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Articoli</h3>' ||
                E'<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' ||
                E'<thead><tr style="text-align: left; border-bottom: 2px solid #222;"><th style="padding: 10px; color: #888;">Prodotto</th><th style="padding: 10px; color: #888; text-align: center;">Cant.</th><th style="padding: 10px; color: #888; text-align: right;">Prezzo</th></tr></thead>' ||
                E'<tbody>' || COALESCE(products_html, '') || E'</tbody></table>' ||
                E'<div style="border-top: 1px solid #333; padding-top: 20px; text-align: right;">' ||
                E'<p style="color: #888; margin: 0; font-size: 14px;">Totale</p>' ||
                E'<p style="color: #3FFFC1; font-size: 32px; font-weight: bold; margin: 5px 0;">€' || TO_CHAR(new.total, 'FM999,990.00') || E'</p></div>' ||
                E'<center><a href="https://wa.me/" style="display: inline-block; background-color: #3FFFC1; color: #0A0A0A; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 20px;">Apri WhatsApp</a></center>' ||
                E'</div></div></body></html>';

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || resend_api_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object('from', email_from, 'to', ARRAY[email_to], 'subject', email_subject, 'html', email_html)
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Limpiar triggers y logs viejos
DROP TRIGGER IF EXISTS zzz_debug_watcher ON orders;
DROP TRIGGER IF EXISTS trigger_send_email_on_order ON orders;

-- Trigger definitivo
CREATE TRIGGER trigger_send_email_on_order
  AFTER UPDATE OF total ON orders
  FOR EACH ROW
  WHEN (old.total = 0 and new.total > 0)
  EXECUTE FUNCTION handle_new_order_email();

-- Limpiar tabla de logs (opcional)
-- DROP TABLE IF EXISTS debug_email_logs; 
