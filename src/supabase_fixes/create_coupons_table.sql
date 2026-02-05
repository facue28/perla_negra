-- CREAR TABLA COUPONS
-- Este script crea la tabla para gestionar los cupones de descuento.

CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric NOT NULL,
    expiration_date timestamptz,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    min_purchase_amount numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Admins pueden hacer todo
CREATE POLICY "Admins can manage coupons"
ON public.coupons
FOR ALL
USING (public.is_admin());

-- Usuarios (autenticados y anónimos) pueden LEER cupones para validarlos
-- Pero solo si están activos y no han expirado (lógica de negocio extra en backend/rpc sería ideal, pero por ahora select simple)
CREATE POLICY "Public can read coupons"
ON public.coupons
FOR SELECT
USING (true); -- Permitimos leer para validar códigos en el checkout

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons (code);

-- Comentario para confirmar ejecución
SELECT 'Tabla coupons creada exitosamente' as status;
