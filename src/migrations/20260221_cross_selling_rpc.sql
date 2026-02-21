-- 20260221_cross_selling_rpc.sql
-- Function to fetch related products for cross-selling based on CRO business rules.
-- It intelligently determines which product categories to suggest based on the current product's category.

CREATE OR REPLACE FUNCTION get_related_products(
    p_product_id bigint,
    p_category text,
    p_limit integer DEFAULT 4
)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Force inputs to lowercase for robust matching
    DECLARE
        v_category text := LOWER(p_category);
    BEGIN
        -- Rule 1: Lubrificante -> Gioco, Vigorizzanti
        IF v_category LIKE '%lubri%' THEN
            RETURN QUERY
            SELECT * FROM products
            WHERE active = true AND id != p_product_id
            AND (LOWER(category) = 'gioco' OR LOWER(category) = 'vigorizzanti')
            ORDER BY (LOWER(category) = 'gioco') DESC, random()
            LIMIT p_limit;

        -- Rule 2: Fragranza -> Olio commestibile, Lubrificante
        ELSIF v_category LIKE '%frag%' THEN
            RETURN QUERY
            SELECT * FROM products
            WHERE active = true AND id != p_product_id
            AND (LOWER(category) LIKE '%olio%' OR LOWER(category) LIKE '%lubri%')
            ORDER BY (LOWER(category) LIKE '%olio%') DESC, random()
            LIMIT p_limit;

        -- Rule 3: Gioco -> Olio commestibile, Lubrificante
        ELSIF v_category = 'gioco' THEN
            RETURN QUERY
            SELECT * FROM products
            WHERE active = true AND id != p_product_id
            AND (LOWER(category) LIKE '%olio%' OR LOWER(category) LIKE '%lubri%')
            ORDER BY (LOWER(category) LIKE '%olio%') DESC, random()
            LIMIT p_limit;

        -- Rule 4: Vigorizzanti -> Fragranza, Gioco
        ELSIF v_category = 'vigorizzanti' THEN
            RETURN QUERY
            SELECT * FROM products
            WHERE active = true AND id != p_product_id
            AND (LOWER(category) LIKE '%frag%' OR LOWER(category) = 'gioco')
            ORDER BY (LOWER(category) LIKE '%frag%') DESC, random()
            LIMIT p_limit;

        -- Rule 5: Olio commestibile -> Gioco, Fragranza
        ELSIF v_category LIKE '%olio%' THEN
            RETURN QUERY
            SELECT * FROM products
            WHERE active = true AND id != p_product_id
            AND (LOWER(category) = 'gioco' OR LOWER(category) LIKE '%frag%')
            ORDER BY (LOWER(category) = 'gioco') DESC, random()
            LIMIT p_limit;

        -- Default fallback: Same category but exclude the current product
        ELSE
            RETURN QUERY
            SELECT * FROM products
            WHERE active = true AND id != p_product_id
            AND LOWER(category) = v_category
            ORDER BY random()
            LIMIT p_limit;
        END IF;
    END;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION get_related_products TO anon;
GRANT EXECUTE ON FUNCTION get_related_products TO authenticated;
