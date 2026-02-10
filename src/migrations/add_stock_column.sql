-- Add stock column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;

-- Optional: Add constraint to ensure non-negative stock
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_stock_check;

ALTER TABLE public.products 
ADD CONSTRAINT products_stock_check CHECK (stock >= 0);
