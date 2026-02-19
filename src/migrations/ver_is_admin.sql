-- SCRIPT PARA LEER LAS FUNCIONES DE ADMINISTRACIÓN
-- Necesito ver cómo están escritas estas para descartar que ellas sean el problema

SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_admin_v1_email');
