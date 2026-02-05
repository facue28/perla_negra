-- =====================================================
-- SISTEMA DE ÓRDENES CON SEGURIDAD REFORZADA
-- =====================================================
-- Este script crea el sistema completo de gestión de pedidos
-- con medidas de seguridad para prevenir manipulación maliciosa

-- 1. CREAR ENUM PARA ESTADOS DE ORDEN
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('nueva', 'en_preparacion', 'completada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA PRINCIPAL DE ÓRDENES
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number text UNIQUE NOT NULL,
    
    -- Información del cliente
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    delivery_address text NOT NULL,
    delivery_notes text,
    
    -- Montos (guardados para prevenir manipulación)
    subtotal numeric NOT NULL CHECK (subtotal >= 0),
    discount_amount numeric DEFAULT 0 CHECK (discount_amount >= 0),
    total numeric NOT NULL CHECK (total >= 0),
    
    -- Información del cupón (si se usó)
    coupon_code text,
    coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
    
    -- Estado y tracking
    status order_status DEFAULT 'nueva' NOT NULL,
    whatsapp_sent_at timestamptz,
    
    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Constraint de seguridad: total debe ser subtotal - descuento
    CONSTRAINT valid_total CHECK (total = subtotal - discount_amount)
);

-- 3. TABLA DE ITEMS DE ORDEN (Snapshot de productos)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    
    -- Referencia al producto (puede ser NULL si se elimina)
    -- CRITICAL: products table uses bigint, not uuid
    product_id bigint REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Snapshot de datos del producto (inmutables)
    product_name text NOT NULL,
    product_image text,
    product_category text,
    
    -- Pricing (al momento de la compra)
    price numeric NOT NULL CHECK (price >= 0),
    quantity integer NOT NULL CHECK (quantity > 0),
    subtotal numeric NOT NULL CHECK (subtotal >= 0),
    
    created_at timestamptz DEFAULT now() NOT NULL,
    
    -- Constraint: subtotal debe ser price × quantity
    CONSTRAINT valid_item_subtotal CHECK (subtotal = price * quantity)
);

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_customer_phone_idx ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

-- 5. TRIGGER PARA ACTUALIZAR updated_at
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

-- 6. FUNCIÓN PARA GENERAR NÚMEROS DE ORDEN ÚNICOS
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
    new_number text;
    year_part text;
    counter integer;
BEGIN
    year_part := to_char(now(), 'YYYY');
    
    -- Obtener el contador del año actual
    SELECT COALESCE(MAX(
        CAST(split_part(order_number, '-', 3) AS integer)
    ), 0) + 1
    INTO counter
    FROM public.orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';
    
    -- Formatear: ORD-2026-0001
    new_number := 'ORD-' || year_part || '-' || LPAD(counter::text, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- 7. HABILITAR RLS (ROW LEVEL SECURITY)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS DE SEGURIDAD

-- Solo admins pueden ver órdenes
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders"
    ON public.orders
    FOR ALL
    USING (public.is_admin());

-- Solo admins pueden ver items de órdenes
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
    ON public.order_items
    FOR ALL
    USING (public.is_admin());

-- 9. FUNCIÓN RPC SEGURA PARA CREAR ÓRDENES
-- Esta función valida que los precios no hayan sido manipulados desde el cliente
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
SECURITY definer -- Ejecuta con permisos elevados
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
    -- VALIDACIÓN 1: Verificar que haya items
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El pedido debe tener al menos un producto';
    END IF;
    
    -- VALIDACIÓN 2: Generar número de orden único
    v_order_number := generate_order_number();
    
    -- VALIDACIÓN 3: Verificar cupón (si existe)
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO v_coupon
        FROM public.coupons
        WHERE code = p_coupon_code
        AND active = true
        AND (expires_at IS NULL OR expires_at > now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Cupón inválido o expirado';
        END IF;
    END IF;
    
    -- CREAR LA ORDEN (sin total aún)
    INSERT INTO public.orders (
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        delivery_notes,
        subtotal,
        discount_amount,
        total,
        coupon_code,
        coupon_id,
        whatsapp_sent_at
    ) VALUES (
        v_order_number,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_delivery_address,
        p_delivery_notes,
        0, -- Se calculará después
        0,
        0,
        p_coupon_code,
        CASE WHEN p_coupon_code IS NOT NULL THEN v_coupon.id ELSE NULL END,
        now()
    ) RETURNING id INTO v_order_id;
    
    -- PROCESAR CADA ITEM Y VALIDAR PRECIOS
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- VALIDACIÓN 4: Verificar que el producto existe y obtener precio REAL de la DB
        SELECT id, name, price, image, category
        INTO v_product
        FROM public.products
        WHERE id = (v_item->>'product_id')::bigint;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'product_id';
        END IF;
        
        -- VALIDACIÓN 5: Calcular subtotal usando precio de la DB (no del cliente)
        v_item_subtotal := v_product.price * (v_item->>'quantity')::integer;
        v_subtotal := v_subtotal + v_item_subtotal;
        
        -- Insertar item con datos validados
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            product_category,
            price,
            quantity,
            subtotal
        ) VALUES (
            v_order_id,
            v_product.id,
            v_product.name,
            v_product.image,
            v_product.category,
            v_product.price, -- Precio REAL de la DB
            (v_item->>'quantity')::integer,
            v_item_subtotal
        );
    END LOOP;
    
    -- VALIDACIÓN 6: Calcular descuento (si hay cupón)
    IF v_coupon.id IS NOT NULL THEN
        -- Verificar monto mínimo
        IF v_subtotal < COALESCE(v_coupon.min_purchase_amount, 0) THEN
            RAISE EXCEPTION 'Monto mínimo no alcanzado para el cupón';
        END IF;
        
        IF v_coupon.discount_type = 'percent' THEN
            v_discount_amount := v_subtotal * (v_coupon.value / 100);
        ELSIF v_coupon.discount_type = 'fixed' THEN
            v_discount_amount := LEAST(v_coupon.value, v_subtotal);
        END IF;
        
        -- Incrementar uso del cupón
        UPDATE public.coupons
        SET usage_count = COALESCE(usage_count, 0) + 1
        WHERE id = v_coupon.id;
    END IF;
    
    v_total := v_subtotal - v_discount_amount;
    
    -- Actualizar orden con totales finales
    UPDATE public.orders
    SET subtotal = v_subtotal,
        discount_amount = v_discount_amount,
        total = v_total
    WHERE id = v_order_id;
    
    -- Retornar confirmación
    RETURN json_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total', v_total
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al crear orden: %', SQLERRM;
END;
$$;

-- 10. FUNCIÓN PARA CAMBIAR ESTADO DE ORDEN (Solo Admins)
CREATE OR REPLACE FUNCTION update_order_status_secure(
    p_order_id uuid,
    p_new_status order_status
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario es admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;
    
    UPDATE public.orders
    SET status = p_new_status
    WHERE id = p_order_id;
    
    RETURN FOUND;
END;
$$;

-- Comentario de éxito
SELECT 'Sistema de órdenes creado exitosamente con seguridad reforzada' as status;
