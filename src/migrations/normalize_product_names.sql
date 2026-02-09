-- ============================================
-- FASE 1: Database Trigger para Normalización Automática
-- ============================================
-- Este trigger garantiza que todos los nombres de productos
-- se guarden en formato Title Case automáticamente

-- 1. Crear función de normalización
CREATE OR REPLACE FUNCTION normalize_product_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalizar el nombre: convertir a minúsculas, luego capitalizar primera letra de cada palabra
  NEW.name = initcap(lower(NEW.name));
  
  -- También normalizar el slug si existe (asegurar lowercase y trim)
  IF NEW.slug IS NOT NULL THEN
    NEW.slug = lower(trim(NEW.slug));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger que ejecuta ANTES de INSERT o UPDATE
DROP TRIGGER IF EXISTS normalize_product_name_trigger ON products;

CREATE TRIGGER normalize_product_name_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION normalize_product_name();

-- ============================================
-- FASE 2: Migración de Datos Existentes
-- ============================================
-- Este UPDATE normaliza TODOS los productos existentes en la base de datos

-- Primero, ver cuántos productos serán afectados (opcional, para verificar)
SELECT 
  COUNT(*) as total_productos,
  COUNT(CASE WHEN name != initcap(lower(name)) THEN 1 END) as productos_a_normalizar
FROM products;

-- Ejecutar la actualización
UPDATE products 
SET 
  name = initcap(lower(name)),
  slug = lower(trim(slug))
WHERE 
  name != initcap(lower(name)) 
  OR slug != lower(trim(slug));

-- Verificar resultados
SELECT 
  id,
  name,
  slug,
  category
FROM products
ORDER BY category, name
LIMIT 20;

-- ============================================
-- NOTAS:
-- ============================================
-- - initcap() capitaliza la primera letra de cada palabra
-- - El trigger se ejecuta automáticamente en cada INSERT/UPDATE
-- - Los datos existentes se normalizan con el UPDATE
-- - El slug también se normaliza (lowercase + trim)
-- ============================================
