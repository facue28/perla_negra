-- ============================================
-- Fix Duplicate "anale" in usage_area
-- ============================================
-- Problem: usage_area has both "anale" and "anale " (with trailing space)
-- causing duplicate entries in filters

-- 1. Check current state
SELECT 
  product_filter,
  COUNT(*) as product_count,
  LENGTH(product_filter) as length
FROM products
WHERE product_filter IS NOT NULL
  AND LOWER(product_filter) LIKE '%anale%'
GROUP BY product_filter
ORDER BY product_filter;

-- 2. Normalize all usage_area values (trim whitespace)
UPDATE products
SET product_filter = TRIM(product_filter)
WHERE product_filter IS NOT NULL
  AND product_filter != TRIM(product_filter);

-- 3. Verify fix
SELECT 
  product_filter,
  COUNT(*) as product_count
FROM products
WHERE product_filter IS NOT NULL
  AND LOWER(product_filter) LIKE '%anale%'
GROUP BY product_filter
ORDER BY product_filter;

-- ============================================
-- Also normalize sensation and target_audience
-- ============================================
-- Apply same trimming to other filter fields for consistency

UPDATE products
SET sensation = TRIM(sensation)
WHERE sensation IS NOT NULL
  AND sensation != TRIM(sensation);

UPDATE products
SET target_audience = TRIM(target_audience)
WHERE target_audience IS NOT NULL
  AND target_audience != TRIM(target_audience);

-- Final verification
SELECT 
  'product_filter' as field,
  product_filter as value,
  COUNT(*) as count
FROM products
WHERE product_filter IS NOT NULL
GROUP BY product_filter
UNION ALL
SELECT 
  'sensation' as field,
  sensation as value,
  COUNT(*) as count
FROM products
WHERE sensation IS NOT NULL
GROUP BY sensation
UNION ALL
SELECT 
  'target_audience' as field,
  target_audience as value,
  COUNT(*) as count
FROM products
WHERE target_audience IS NOT NULL
GROUP BY target_audience
ORDER BY field, value;
