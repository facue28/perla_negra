-- ⚡ DATABASE INDEX OPTIMIZATION
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. FIX UNINDEXED FOREIGN KEY (orders.coupon_id)
-- Adding an index here improves performance when joining orders with coupons
-- or filtering orders by coupon.
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id);


-- 2. REMOVE UNUSED INDEX (orders_status_idx)
-- This index is not being used by Postgres (likely because the table is small
-- or queries filter by other columns first). Removing it saves storage and write overhead.
DROP INDEX IF EXISTS orders_status_idx;

COMMIT;
