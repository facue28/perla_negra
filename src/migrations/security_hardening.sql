-- 🛡️ SECURITY HARDENING SCRIPT - PERLA NEGRA
-- Ejecutar en SQL Editor de Supabase dashboard

-- ==========================================
-- 0. SCHEMA SETUP (Asegurar tablas)
-- ==========================================

CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar tabla order_items (Detalle de órdenes)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID, -- Referencia opcional a products
    product_name TEXT NOT NULL,
    product_image TEXT,
    product_category TEXT,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);




-- Asegurar columna 'active' en products (para soft delete)
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Asegurar columna 'active' en coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    value NUMERIC NOT NULL,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0
);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- (Opcional) Insertar al usuario actual como admin si la tabla está vacía
-- INSERT INTO admins (email) VALUES ('tu@email.com') ON CONFLICT DO NOTHING;

-- 🔄 MIGRACIÓN AUTOMÁTICA DE ADMINS EXISTENTES
-- Si ya tienes admins en la tabla 'profiles' con rol 'admin', esto los copia:
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        INSERT INTO public.admins (email)
        SELECT u.email
        FROM auth.users u
        JOIN public.profiles p ON u.id = p.id
        WHERE p.role = 'admin'
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;

-- ==========================================
-- 1. FUNCTIONS & RPCs (Lógica de Negocio Segura)
-- ==========================================

-- A. CREATE ORDER (Con Rate Limit + Validación)
CREATE OR REPLACE FUNCTION create_order(
    customer_info JSONB,
    items JSONB,
    coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_customer_phone TEXT;
    v_recent_orders INTEGER;
    v_total_amount NUMERIC := 0;
    v_discount_value NUMERIC := 0;
    v_final_total NUMERIC;
BEGIN
    -- Extraer teléfono para validación
    v_customer_phone := customer_info->>'phone';

    -- 1. VALIDACIONES CRÍTICAS
    IF v_customer_phone IS NULL OR TRIM(v_customer_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;
    
    IF customer_info->>'fullName' IS NULL OR TRIM(customer_info->>'fullName') = '' THEN
        RAISE EXCEPTION 'Name is required';
    END IF;

    IF items IS NULL OR jsonb_array_length(items) = 0 THEN
        RAISE EXCEPTION 'Order must have at least one item';
    END IF;

    -- 2. RATE LIMITING (Server-side)
    -- Límite: 3 órdenes en 1 minuto por mismo teléfono
    SELECT COUNT(*) INTO v_recent_orders
    FROM orders
    WHERE customer_phone = v_customer_phone
      AND created_at > NOW() - INTERVAL '1 minute';
    
    IF v_recent_orders >= 3 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait before creating another order.';
    END IF;

    -- 3. CÁLCULO DE TOTALES
    -- Calcular Subtotal
    SELECT SUM((item->>'price')::NUMERIC * (item->>'quantity')::INTEGER)
    INTO v_total_amount
    FROM jsonb_array_elements(items) AS item;

    -- 4. VALIDAR Y APLICAR CUPÓN
    IF coupon_code IS NOT NULL AND TRIM(coupon_code) <> '' THEN
        SELECT value INTO v_discount_value
        FROM coupons
        WHERE code = UPPER(TRIM(coupon_code))
          AND active = true
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (usage_limit IS NULL OR usage_count < usage_limit);
        
        IF v_discount_value IS NULL THEN
            v_discount_value := 0;
        END IF;
    END IF;

    -- Calcular Totales Finales
    IF v_discount_value > 0 THEN
         -- Asumimos %
         v_final_total := v_total_amount * (1 - v_discount_value / 100);
    ELSE
         v_final_total := v_total_amount;
    END IF;

    -- Generar Número de Orden Único
    -- Formato: ORD-YYYYMMDD-XXXX (ej: ORD-20240205-A1B2)
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4);

    -- 5. CREAR ORDEN (CABECERA)
    INSERT INTO orders (
        order_number, -- ¡Importante!
        customer_name, 
        customer_phone, 
        customer_email,
        delivery_address, 
        delivery_notes,
        subtotal,
        discount_amount,
        total, 
        coupon_code,
        status
    )
    VALUES (
        v_order_number, -- Insertamos el generado
        customer_info->>'fullName', 
        v_customer_phone, 
        customer_info->>'email',
        (customer_info->>'address') || ', ' || (customer_info->>'city'), 
        customer_info->>'notes',
        v_total_amount,
        (v_total_amount - v_final_total), 
        v_final_total, 
        coupon_code,
        'nueva' 
    )
    RETURNING id INTO v_order_id;

    -- 6. INSERTAR ITEMS (DETALLE)
    -- Asumimos que order_items tiene columnas desnormalizadas como sugiere el frontend
    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_image,
        product_category,
        price,
        quantity,
        subtotal
    )
    SELECT 
        v_order_id,
        (item->>'id')::BIGINT, -- COREGIDO: ID es BIGINT según esquema CSV
        item->>'name',
        item->>'image',
        item->>'category', -- Asegurarse que se envíe desde el front o hacer join
        (item->>'price')::NUMERIC,
        (item->>'quantity')::INTEGER,
        ((item->>'price')::NUMERIC * (item->>'quantity')::INTEGER)
    FROM jsonb_array_elements(items) AS item;

    -- Actualizar uso de cupón (si aplica)
    IF v_discount_value > 0 AND coupon_code IS NOT NULL THEN
        UPDATE coupons 
        SET usage_count = usage_count + 1 
        WHERE code = UPPER(TRIM(coupon_code));
    END IF;

    RETURN jsonb_build_object(
        'orderId', v_order_id, 
        'orderNumber', v_order_number,
        'total', v_final_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SECURITY DEFINER permite escribir en tabla orders cerrada por RLS

-- B. IS ADMIN CHECK (Auth Hardening)
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE email = user_email 
          AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Habilitar RLS en todas las tablas críticas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 2.1 PRODUCTS (Lectura pública, Escritura Admin)
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (active = true OR active IS NULL);

DROP POLICY IF EXISTS "Admin write products" ON products;
CREATE POLICY "Admin write products" ON products FOR ALL USING (
    (SELECT is_admin(auth.jwt() ->> 'email'))
);

-- 2.2 ORDERS (Tabla cerrada, Solo lectura Admin/Dueño)
-- ⚠️ INSERT directo BLOQUEADO. Solo funciona vía RPC create_order
DROP POLICY IF EXISTS "No direct insert orders" ON orders;
CREATE POLICY "No direct insert orders" ON orders FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Admins read all orders" ON orders;
CREATE POLICY "Admins read all orders" ON orders FOR SELECT USING (
    (SELECT is_admin(auth.jwt() ->> 'email'))
);

-- (Opcional) Usuarios leen sus propias órdenes si tuvieran login
-- CREATE POLICY "User read own orders" ...

-- 2.3 COUPONS (Privado, solo RPC)
DROP POLICY IF EXISTS "No direct access coupons" ON coupons;
CREATE POLICY "No direct access coupons" ON coupons FOR ALL USING (false);

-- 2.4 ADMINS (Solo lectura por admins)
DROP POLICY IF EXISTS "Admins read admins" ON admins;
CREATE POLICY "Admins read admins" ON admins FOR SELECT USING (
    email = auth.jwt() ->> 'email'
);


-- ==========================================
-- 3. STORAGE POLICIES (Gestión de Imágenes)
-- ==========================================

-- Asegurar que el bucket 'images' existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS en storage.objects (Comentado: Ya está habilitado por defecto y causa error de permisos si no eres superuser)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3.1 LECTURA PÚBLICA (Necesario para que la tienda muestre las fotos a clientes)
DROP POLICY IF EXISTS "Public Access Images" ON storage.objects;
CREATE POLICY "Public Access Images" ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- 3.2 ESCRITURA SOLO ADMIN (Para subir desde el panel de control)
DROP POLICY IF EXISTS "Admin Upload Images" ON storage.objects;
CREATE POLICY "Admin Upload Images" ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'images' 
    AND (SELECT is_admin(auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;
CREATE POLICY "Admin Delete Images" ON storage.objects FOR DELETE
USING (
    bucket_id = 'images' 
    AND (SELECT is_admin(auth.jwt() ->> 'email'))
);

-- Fin del script

