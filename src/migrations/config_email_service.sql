-- SCRIPT PARA ACTIVAR EL SERVICIO DE EMAILS (VERCEL VERSION)
-- Este script configura la conexión entre Supabase y Vercel.

-- [!] ELIGE TU URL AQUÍ (Descomenta la que quieras usar):
-- Opción A: Producción (Main)
-- ALTER DATABASE postgres SET "app.edge_function_url" = 'https://perla-negra.vercel.app/api';

-- Opción B: Desarrollo (Develop)
ALTER DATABASE postgres SET "app.edge_function_url" = 'https://perla-negra-git-develop-facue28s-projects.vercel.app/api';


-- 2. Configuramos la llave secreta para autorizar el envío (Debe coincidir con la de Vercel)
ALTER DATABASE postgres SET "app.service_role_key" = 'PONER_AQUI_TU_SERVICE_ROLE_KEY';

SELECT 'Configuración de Email (Vercel): COMPLETADA. Apuntando a: ' || current_setting('app.edge_function_url') as status;
