-- SCRIPT DE SINCRONIZACIÓN FINAL DE LLAVES
-- Copia la "service_role" key de tu panel de Supabase y pégala abajo.

-- 1. Actualizamos la clave en la tabla site_config
-- DEBES REEMPLAZAR 'TU_LLAVE_LARGA_AQUI' por la que saques de:
-- Supabase Dashboard -> Settings -> API -> service_role (secret)

UPDATE public.site_config 
SET value = 'TU_LLAVE_LARGA_AQUI' 
WHERE key = 'service_role_key';

SELECT 'Clave actualizada. Por favor, asegúrate de que sea la misma que tienes en Vercel.' as status;
