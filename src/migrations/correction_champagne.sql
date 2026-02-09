-- Correction for Love Potion Champagne E Lampone
UPDATE products 
SET product_filter = 'Champagne e Lampone' 
WHERE name ILIKE '%Love Potion Champagne E Lampone%';

-- Verify the change
SELECT name, product_filter 
FROM products 
WHERE name ILIKE '%Love Potion Champagne E Lampone%';
