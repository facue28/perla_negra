-- AUDITORÍA DE SALUD DE LA BASE DE DATOS
-- Este script busca "rarezas" o inconsistencias sin modificar nada.

SELECT json_build_object(
    -- 1. Órdenes sin items (Pedidos vacíos)
    'ordenes_vacias', (
        SELECT count(*) FROM public.orders o
        LEFT JOIN public.order_items oi ON o.id = oi.order_id
        WHERE oi.id IS NULL
    ),
    -- 2. Items huérfanos (Items sin pedido)
    'items_huerfanos', (
        SELECT count(*) FROM public.order_items oi
        LEFT JOIN public.orders o ON oi.order_id = o.id
        WHERE o.id IS NULL
    ),
    -- 3. Productos duplicados (por nombre o código, si aplica)
    'productos_posible_duplicado', (
        SELECT json_agg(t) FROM (
            SELECT name, count(*) 
            FROM public.products 
            GROUP BY name 
            HAVING count(*) > 1
        ) t
    ),
    -- 4. Cupones que excedieron su límite
    'cupones_sobrepasados', (
        SELECT count(*) 
        FROM public.coupons 
        WHERE usage_limit IS NOT NULL AND usage_count > usage_limit
    ),
    -- 5. Órdenes con totales inconsistentes (subtotal != suma items)
    'ordenes_total_inconsistente', (
        SELECT count(*) FROM (
            SELECT o.id, o.subtotal, SUM(oi.subtotal) as suma_items
            FROM public.orders o
            JOIN public.order_items oi ON o.id = oi.order_id
            GROUP BY o.id, o.subtotal
            HAVING ABS(o.subtotal - SUM(oi.subtotal)) > 0.01
        ) t
    )
) as integrity_report;
