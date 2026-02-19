-- SCRIPT DE LOCALIZACIÓN EXACTA (SIN RIESGOS)
-- Este script no borra nada, solo hace una prueba de "laboratorio" 
-- y nos dirá exactamente en qué línea falla.

DO $$
DECLARE
    v_res json;
    v_error_msg text;
    v_error_detail text;
    v_error_context text;
BEGIN
    -- Intentamos crear un pedido DE VERDAD desde SQL simulando el fallo
    -- Usamos el producto 27 (o el que te salió en el último error)
    RAISE NOTICE 'Iniciando simulacro de pedido para producto 27...';
    
    BEGIN
        SELECT public.create_order_secure(
            'Test Calma', 
            '+3900000000', 
            'test@calma.com', 
            'Calle Calma 1', 
            'Sin notas', 
            '[{"product_id": 27, "quantity": 1}]'::jsonb, -- Cambia 27 por el número que te falló
            NULL, -- Cupón
            'diag-' || gen_random_uuid()::text -- Idempotencia única
        ) INTO v_res;
        
        RAISE NOTICE '¡SORPRESA! El pedido funcionó en SQL: %', v_res;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS 
            v_error_msg = MESSAGE_TEXT,
            v_error_detail = PG_EXCEPTION_DETAIL,
            v_error_context = PG_EXCEPTION_CONTEXT;
            
        RAISE NOTICE '--- RADIOGRAFÍA DEL ERROR ---';
        RAISE NOTICE 'Mensaje: %', v_error_msg;
        RAISE NOTICE 'Detalle técnico: %', v_error_detail;
        RAISE NOTICE 'Línea de la falla (Contexto): %', v_error_context;
    END;
END $$;
