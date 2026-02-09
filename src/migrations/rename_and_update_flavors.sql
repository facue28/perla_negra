-- 1. Rename usage_area column to product_filter
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'usage_area')
  THEN
      ALTER TABLE products RENAME COLUMN usage_area TO product_filter;
  END IF;
END $$;

-- 2. Update Flavors for Love Potion oils
-- Note: User specified "Love Potion Champagne E Lampone" -> "Zucchero Filato".
-- If this was a typo and should be "Champagne e Lampone", please manually update this line before running.

UPDATE products SET product_filter = 'Cioccolato' WHERE name ILIKE '%Love Potion Cioccolato%';
UPDATE products SET product_filter = 'Zucchero Filato' WHERE name ILIKE '%Love Potion Zucchero Filato%';
UPDATE products SET product_filter = 'Zucchero Filato' WHERE name ILIKE '%Love Potion Champagne E Lampone%';
UPDATE products SET product_filter = 'Frutti Rossi' WHERE name ILIKE '%Love Potion Frutti Rossi%';

-- 3. Verify changes
SELECT name, product_filter FROM products WHERE name ILIKE '%Love Potion%';
