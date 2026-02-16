-- ==============================================================================
-- 💎 PERLA NEGRA - FULL PROJECT RESTORE SCRIPT (CONSOLIDATED)
-- ==============================================================================
-- This script contains the entire database schema, security policies, and logic.
-- Use this to restore the database or strictly reference the current architecture.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS
-- ------------------------------------------------------------------------------

-- Function to check admin status based on current JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (auth.jwt() ->> 'email') 
          AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overload for checking specific email (used in some policies)
CREATE OR REPLACE FUNCTION public.is_admin(check_email text)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = check_email
          AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. TABLES & SCHEMA
-- ------------------------------------------------------------------------------

-- 2.1 ADMINS
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    value NUMERIC NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    min_purchase_amount NUMERIC DEFAULT 0
);

-- 2.3 ORDERS
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('nueva', 'en_preparacion', 'completada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT NOT NULL,
    delivery_notes TEXT,
    subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC DEFAULT 0 CHECK (discount_amount >= 0),
    total NUMERIC NOT NULL CHECK (total >= 0),
    coupon_code TEXT,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    status order_status DEFAULT 'nueva' NOT NULL,
    whatsapp_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2.4 ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    product_category TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_customer_phone_idx ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons (code);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ADMINS POLICIES
DROP POLICY IF EXISTS "Admins read admins" ON public.admins;
CREATE POLICY "Admins read admins" ON public.admins FOR SELECT USING (email = auth.jwt() ->> 'email');

-- COUPONS POLICIES
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public can check coupons" ON public.coupons;
CREATE POLICY "Public can check coupons" ON public.coupons FOR SELECT USING (true); -- Required for checkout validation

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "No direct insert orders" ON public.orders;
CREATE POLICY "No direct insert orders" ON public.orders FOR INSERT WITH CHECK (false); -- Enforce usage of RPC

-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. LOGIC & RPC CONSTANTS
-- ------------------------------------------------------------------------------

-- 5.1 Update Updated_At Trigger
CREATE OR REPLACE FUNCTION update_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at_trigger ON public.orders;
CREATE TRIGGER orders_updated_at_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_updated_at();

-- 5.2 Generate Order Number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
    year_part text;
    counter integer;
BEGIN
    year_part := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(CAST(split_part(order_number, '-', 3) AS integer)), 0) + 1
    INTO counter
    FROM public.orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';
    RETURN 'ORD-' || year_part || '-' || LPAD(counter::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 5.3 Create Order Secure RPC
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
BEGIN
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El pedido debe tener al menos un producto';
    END IF;
    
    v_order_number := generate_order_number();
    
    -- Verify Coupon
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon FROM public.coupons
        WHERE code = p_coupon_code AND active = true
        AND (expires_at IS NULL OR expires_at > now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
        
        IF NOT FOUND THEN RAISE EXCEPTION 'Cupón inválido o expirado'; END IF;
    END IF;
    
    -- Initial Insert (Total 0)
    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, delivery_notes, subtotal, discount_amount, total,
        coupon_code, coupon_id, whatsapp_sent_at
    ) VALUES (
        v_order_number, p_customer_name, p_customer_phone, p_customer_email,
        p_delivery_address, p_delivery_notes, 0, 0, 0,
        p_coupon_code, CASE WHEN p_coupon_code IS NOT NULL THEN v_coupon.id ELSE NULL END, now()
    ) RETURNING id INTO v_order_id;
    
    -- Process Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT id, name, price, image, category INTO v_product
        FROM public.products WHERE id = (v_item->>'product_id')::bigint;
        
        IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
        
        v_item_subtotal := v_product.price * (v_item->>'quantity')::integer;
        v_subtotal := v_subtotal + v_item_subtotal;
        
        INSERT INTO public.order_items (
            order_id, product_id, product_name, product_image, product_category,
            price, quantity, subtotal
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_product.image, v_product.category,
            v_product.price, (v_item->>'quantity')::integer, v_item_subtotal
        );
    END LOOP;
    
    -- Final Calculations
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
    
    -- Update Totals (Triggers Email)
    UPDATE public.orders
    SET subtotal = v_subtotal, discount_amount = v_discount_amount, total = v_total
    WHERE id = v_order_id;
    
    RETURN json_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'total', v_total);
END;
$$;

-- 5.4 Email Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_new_order_email()
RETURNS TRIGGER AS $$
DECLARE
  resend_api_key text := 'YOUR_RESEND_KEY_HERE'; -- Set this in Supabase Dashboard Secrets usually
  email_from text := 'Perla Negra <onboarding@resend.dev>';
  email_to text;
  email_subject text;
  email_html text;
  products_html text := '';
  customer_name text;
BEGIN
  -- Build Product Table
  SELECT string_agg(
    E'<tr>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #BBB;">' || product_name || E'</td>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #BBB; text-align: center;">' || quantity || E'</td>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #3FFFC1; text-align: right; font-weight: bold;">€' || TO_CHAR(price, 'FM999,990.00') || E'</td>' ||
    E'</tr>', ''
  ) INTO products_html
  FROM public.order_items WHERE order_id = new.id;

  customer_name := COALESCE(new.customer_name, 'Cliente');
  email_to := COALESCE(new.customer_email, 'facundo.elias10@gmail.com');
  email_subject := 'Conferma Ordine #' || new.order_number || ' - Perla Negra';

  -- Build HTML
  email_html := E'<!DOCTYPE html><html><body style="background-color: #0A0A0A; padding: 40px 0; color: #FFF;">' ||
                E'<div style="max-width: 600px; margin: 0 auto; background-color: #141414; padding: 20px;">' ||
                E'<h1>Grazie, ' || customer_name || E'</h1>' ||
                E'<p>Ordine ricevuto: <strong>' || new.order_number || E'</strong></p>' ||
                E'<table><tbody>' || COALESCE(products_html, '') || E'</tbody></table>' ||
                E'<h3>Totale: €' || TO_CHAR(new.total, 'FM999,990.00') || E'</h3>' ||
                E'</div></body></html>';

  -- Send via pg_net
  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || resend_api_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object('from', email_from, 'to', ARRAY[email_to], 'subject', email_subject, 'html', email_html)
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_send_email_on_order ON public.orders;
CREATE TRIGGER trigger_send_email_on_order
  AFTER UPDATE OF total ON public.orders
  FOR EACH ROW
  WHEN (old.total = 0 and new.total > 0)
  EXECUTE FUNCTION handle_new_order_email();

-- ------------------------------------------------------------------------------
-- 6. STORAGE POLICIES (IMAGES)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Images" ON storage.objects;
CREATE POLICY "Public Access Images" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );

DROP POLICY IF EXISTS "Admin Manage Images" ON storage.objects;
CREATE POLICY "Admin Manage Images" ON storage.objects FOR ALL 
USING ( bucket_id = 'images' AND public.is_admin() );

SELECT 'Full Project Schema Restored Successfully' as status;
