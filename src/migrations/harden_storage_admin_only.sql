-- 🔒 HARDENING STORAGE POLICIES (ADMIN ONLY)
-- Ejecutar en SQL Editor de Supabase dashboard para blindar el storage.

-- 1. Eliminar políticas permisivas anteriores (Las que dejaban subir a cualquiera)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- También limpiar versiones anteriores si existen
DROP POLICY IF EXISTS "Admin Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;

-- 2. Crear Políticas ESTRICTAS (Solo Admin verificado puede escribir)

-- INSERT (Subir fotos)
CREATE POLICY "Admin Only Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'images'
    AND (select is_admin(auth.jwt() ->> 'email'))
);

-- UPDATE (Reemplazar/Mover fotos)
CREATE POLICY "Admin Only Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'images'
    AND (select is_admin(auth.jwt() ->> 'email'))
);

-- DELETE (Borrar fotos)
CREATE POLICY "Admin Only Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'images'
    AND (select is_admin(auth.jwt() ->> 'email'))
);

-- Nota: La lectura pública ("Public Access") se mantiene igual para que la tienda funcione.
