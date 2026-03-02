-- Agregar columna is_public a site_config
ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Marcar las contraseñas/secretos existentes explícitamente como privados (por precaución)
UPDATE public.site_config SET is_public = false WHERE key IN ('email_function_url', 'service_role_key');

-- Insertar las nuevas variables públicas
INSERT INTO public.site_config (key, value, is_public)
VALUES 
    ('whatsapp_number', '393518549246', true),
    ('instagram_url', 'https://instagram.com/perlanegra.it', true),
    ('facebook_url', 'https://www.facebook.com/profile.php?id=61580952122579', true),
    ('contact_email', 'panteranegrait@gmail.com', true)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value, 
    is_public = EXCLUDED.is_public, 
    updated_at = now();

-- Asegurarse de que RLS esté activo
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir que CUALQUIERA lea solo las claves públicas
DROP POLICY IF EXISTS "Permitir lectura publica de configs" ON public.site_config;
CREATE POLICY "Permitir lectura publica de configs" 
ON public.site_config 
AS PERMISSIVE 
FOR SELECT 
TO public 
USING (is_public = true);
