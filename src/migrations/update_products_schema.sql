-- AGREGAR COLUMNAS FALTANTES A LA TABLA PRODUCTS
-- Este script asegura que la tabla 'products' tenga todos los campos nuevos que agregamos en el formulario.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS subtitle text,
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS code text,
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS usage text,
ADD COLUMN IF NOT EXISTS ingredients text,
ADD COLUMN IF NOT EXISTS tips text,
ADD COLUMN IF NOT EXISTS sensation text,
ADD COLUMN IF NOT EXISTS description_additional text;

-- Opcional: Crear índice para búsqueda por nombre si no existe
CREATE INDEX IF NOT EXISTS products_name_idx ON public.products (name);

-- Comentario para confirmar ejecución
SELECT 'Columnas agregadas exitosamente' as status;
